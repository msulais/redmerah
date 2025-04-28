import {
	type PopoverProps,
	type PopoverOpenOptions,
	type PopoverCloseOptions,
	type PopoverOpenDetails,
	type PopoverCloseDetails,
	type PopoverRepositionDetails,
	type PopoverUpdateOptions,
	PopoverEvents,
	PopoverAttributes,
	PopoverClasses,
	openPopover,
	closePopover,
	repositionPopover,
	isPopoverOpen,
	createPopover,
	registerPopover,
	updatePopover,
	unregisterPopover,
	type PopoverToggleOpenDetail
} from "@/native-components/Popover"
import {
	type ButtonUpdateOptions,
	type ButtonProps,
	type LinkButtonUpdateOptions,
	type LinkButtonProps,
	createButton,
	createLinkButton,
	updateButton,
	updateLinkButton,
	ButtonClasses
} from "@/native-components/Button"
import { FlyoutPosition as MenuPosition } from "@/enums/position"
import { PopoverPosition } from "@/native-components/Popover"
import type { IconProps } from "@/native-components/Icon"

type MenuProps = PopoverProps
type MenuItemProps = ButtonProps
type LinkMenuItemProps = LinkButtonProps

type MenuHeaderProps = astroHTML.JSX.HTMLAttributes

type SubMenuItemProps = Omit<MenuItemProps, 'aria-controls'> & {
	'aria-controls': string
}

type MenuIndentProps = astroHTML.JSX.HTMLAttributes

type RadioMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	RadioMenuItemLeadingAttr?: astroHTML.JSX.HTMLAttributes
	RadioMenuItemInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	RadioMenuItemIconAttr   ?: IconProps
	RadioMenuItemContentAttr?: astroHTML.JSX.HTMLAttributes
}

type MenuIndentUpdateOptions = {
	MenuIndentRefs?: {
		indent?(el: HTMLDivElement): unknown
	}
}

type MenuHeaderUpdateOptions = {
	MenuHeaderChildren?: (string | Node)[] | boolean
	MenuHeaderRefs    ?: {
		header?(el: HTMLDivElement): unknown
	}
}

type MenuUpdateOptions = PopoverUpdateOptions & {
	MenuRole?: astroHTML.JSX.AriaRole | boolean
	MenuRefs?: {
		menu?(el: HTMLDivElement): unknown
	}
}

type MenuItemUpdateOptions = ButtonUpdateOptions & {
	MenuItemRole?: astroHTML.JSX.AriaRole | boolean
	MenuItemRefs?: {
		menuitem?(el: HTMLButtonElement): unknown
	}
}

type SubMenuItemUpdateOptions = MenuItemUpdateOptions & {
	SubMenuItemAriaExpanded?: astroHTML.JSX.AriaAttributes['aria-expanded'] | boolean
	SubMenuItemAriaControls?: astroHTML.JSX.AriaAttributes['aria-controls'] | boolean
	SubMenuAriaHaspopup    ?: astroHTML.JSX.AriaAttributes['aria-haspopup'] | boolean
	SubMenuRefs            ?: {
		menuitem?(el: HTMLButtonElement): unknown
	}
}

type LinkMenuItemUpdateOptions = LinkButtonUpdateOptions & {
	LinkMenuItemRole?: astroHTML.JSX.AriaRole | boolean
	LinkMenuItemRefs?: {
		menuitem?(el: HTMLAnchorElement): unknown
	}
}

enum MenuClasses {
	menu             = 'c-menu',
	header           = menu + '-header',
	item             = menu + '-item',
	indent           = menu + '-indent',
	submenuItem      = menu + '-submenu-item',
	radioItem        = menu + '-radio-item',
	radioItemLeading = radioItem + '-leading',
	radioItemIcon    = radioItem + '-icon',
	radioItemInput   = radioItem + '-input',
	radioItemContent = radioItem + '-content',
}

const REGISTERED_SUBMENUITEM: Set<HTMLButtonElement> = new Set<HTMLButtonElement>()

/**
 * Any element is possible as long have class `MenuClasses.submenu`
 * @param submenuitem
 */
function _initSubMenu(submenuitem: HTMLElement): void {
	const elements = {
		get parent() {
			return submenuitem.closest('.' + MenuClasses.menu) as HTMLDivElement | null
		},
		get parentContent() {
			return submenuitem.closest('.' + PopoverClasses.content) as HTMLDivElement | null
		},
		get target() {
			return document.getElementById(submenuitem.getAttribute('aria-controls') ?? '___NONE___') as HTMLDivElement | null
		}
	}
	let isParentHovered = false
	let isTargetHovered = false
	let timeId: number | NodeJS.Timeout | null = null

	function getAllSubMenu(from: HTMLElement): HTMLDivElement[] {
		const menus: Set<HTMLDivElement> = new Set<HTMLDivElement>()
		const traverseDown = (popover: HTMLElement) => {
			const submenuItems = popover.querySelectorAll<HTMLButtonElement>(`.${MenuClasses.submenuItem}[aria-controls]`)
			for (const item of submenuItems) {

				// handle nested <Menu>
				const m = item.closest(`.${MenuClasses.menu}`)
				if (m !== popover) continue

				const id = item.getAttribute('aria-controls') ?? '___NONE___'
				const menu = document.getElementById(id) as HTMLDivElement | null
				if (
					!menu
					|| !menu.classList.contains(MenuClasses.menu)
					|| menus.has(menu)
				) {
					continue
				}

				menus.add(menu)
				traverseDown(menu)
			}
		}

		traverseDown(from)
		return [...menus.values()]
	}

	function openSubMenu(instant: boolean = false): void {
		if (timeId !== null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			timeId = null
			const parent = elements.parent
			const target = elements.target
			if (!target || !parent || isPopoverOpen(target)) return

			for (const menu of getAllSubMenu(parent)) {
				if (menu === target) continue

				closePopover(menu, { animation: false }).then(() => {
					// BUG: when close parent by function it wont do anything
					document.body.appendChild(menu)
				})
			}

			parent.appendChild(target)
			openPopover(target, {
				anchor: submenuitem,
				position: PopoverPosition.rightCenterToBottom,
				gap: -4,
				padding: 5, // +1px for border
				important: true
			})
		}, instant? 0 : 300)
	}

	function closeSubMenu(instant: boolean = false): void {
		if (timeId !== null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			timeId = null
			const target = elements.target
			if (!target) return

			for (const menu of getAllSubMenu(target)) {
				if (menu === target) continue

				closePopover(menu).then(() => {
					document.body.appendChild(menu)
				})
			}

			closePopover(target)
		}, instant? 0 : 300)
	}

	function menuContentOnPointerEnter(): void {
		isParentHovered = true
		if (!isTargetHovered) {
			closeSubMenu()
		}
	}

	function menuContentOnPointerLeave(): void {
		isParentHovered = false
	}

	function menuOnBeforeClose(ev: Event): void {
		if (timeId !== null) clearTimeout(timeId)
		for (const menu of getAllSubMenu(ev.target as HTMLElement)) {
			closePopover(menu).then(() => {
				document.body.appendChild(menu)
			})
		}
	}

	function subMenuOnPointerEnter(): void {
		isTargetHovered = true
		openSubMenu()
	}

	function subMenuOnPointerLeave(): void {
		isTargetHovered = false
		if (isParentHovered) {
			closeSubMenu()
		}
		else {
			openSubMenu()
		}
	}

	function subMenuOnClick(): void {
		openSubMenu(true)
	}

	function subMenuOnToggleOpen(ev: CustomEvent<PopoverToggleOpenDetail>): void {
		const open = ev.detail.open

		// toggleopen can bubbles
		if ((ev.target as any).id !== submenuitem.getAttribute('aria-controls')) return
		submenuitem.setAttribute('aria-expanded', String(open))
		if (submenuitem.classList.contains(ButtonClasses.button)) {
			updateMenuItem(submenuitem as HTMLButtonElement, {
				ButtonFocused: open
			})
		}
	}

	function initEvents(): void {
		const parent = elements.parent
		parent?.addEventListener(PopoverEvents.toggleOpen, (ev) => {
			if (ev.target !== parent) return

			const isOpen = parent.matches(':popover-open')
			const target = elements.target
			const content = elements.parentContent
			if (isOpen) {
				parent?.addEventListener(PopoverEvents.beforeClose, menuOnBeforeClose)
				content?.addEventListener('pointerenter', menuContentOnPointerEnter)
				content?.addEventListener('pointerleave', menuContentOnPointerLeave)
				submenuitem.addEventListener('pointerenter', subMenuOnPointerEnter)
				submenuitem.addEventListener('pointerleave', subMenuOnPointerLeave)
				submenuitem.addEventListener('click'       , subMenuOnClick)
				target?.addEventListener('pointerenter', subMenuOnPointerEnter)
				target?.addEventListener('pointerleave', subMenuOnPointerLeave)
				target?.addEventListener(PopoverEvents.toggleOpen as any, subMenuOnToggleOpen)
			}
			else {
				// !important: without this, `PopoverEvents.toggleOpen` event for `target` will
				// remove before running for the last time
				setTimeout(() => {
					content?.removeEventListener('pointerenter', menuContentOnPointerEnter)
					content?.removeEventListener('pointerleave', menuContentOnPointerLeave)
					parent?.removeEventListener(PopoverEvents.beforeClose, menuOnBeforeClose)
					submenuitem.removeEventListener('pointerenter', subMenuOnPointerEnter)
					submenuitem.removeEventListener('pointerleave', subMenuOnPointerLeave)
					submenuitem.removeEventListener('click'       , subMenuOnClick)
					target?.removeEventListener('pointerenter', subMenuOnPointerEnter)
					target?.removeEventListener('pointerleave', subMenuOnPointerLeave)
					target?.removeEventListener(PopoverEvents.toggleOpen as any, subMenuOnToggleOpen)
				})
			}
		})
	}

	initEvents()
}

function createMenu(options?: PopoverUpdateOptions): HTMLDivElement {
	const menu = createPopover(options)
	return updateMenu(menu)
}

function updateMenu(menu: HTMLDivElement, options?: MenuUpdateOptions): HTMLDivElement {
	updatePopover(menu, options)
	menu.classList.add(MenuClasses.menu)
	if (!menu.hasAttribute('role')) {
		menu.setAttribute('role', 'menu')
	}

	const role = options?.MenuRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menu` anyway.
		// If we want without role, just use regular <Popover>. Or update with `updatePopover()`.
		menu.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menu.setAttribute('role', role)
	}

	options?.MenuRefs?.menu?.(menu)
	return menu
}

function createMenuItem(options?: MenuItemUpdateOptions): HTMLButtonElement {
	const menuitem = createButton(options)
	return updateMenuItem(menuitem)
}

function updateMenuItem(menuitem: HTMLButtonElement, options?: MenuItemUpdateOptions): HTMLButtonElement {
	updateButton(menuitem, options)
	menuitem.classList.add(MenuClasses.item)
	if (!menuitem.hasAttribute('role')) {
		menuitem.setAttribute('role', 'menuitem')
	}

	const role = options?.MenuItemRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateButton()`.
		menuitem.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuitem.setAttribute('role', role)
	}

	options?.MenuItemRefs?.menuitem?.(menuitem)
	return menuitem
}

function createLinkMenuItem(options: LinkMenuItemUpdateOptions): HTMLAnchorElement {
	const menuitem = createLinkButton(options)
	return updateLinkMenuItem(menuitem, options)
}

function updateLinkMenuItem(menuitem: HTMLAnchorElement, options: LinkMenuItemUpdateOptions): HTMLAnchorElement {
	updateLinkButton(menuitem, options)
	menuitem.classList.add(MenuClasses.item)
	if (!menuitem.hasAttribute('role')) {
		menuitem.setAttribute('role', 'menuitem')
	}

	const role = options?.LinkMenuItemRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateLinkButton()`.
		menuitem.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuitem.setAttribute('role', role)
	}
	options.LinkMenuItemRefs?.menuitem?.(menuitem)
	return menuitem
}

function createSubMenuItem(options: Omit<SubMenuItemUpdateOptions, 'ariaControls'> & {
	ariaControls: astroHTML.JSX.AriaAttributes['aria-controls']
}): HTMLButtonElement {
	return updateSubMenuItem(createMenuItem(options))
}

function updateSubMenuItem(submenuitem: HTMLButtonElement, options?: SubMenuItemUpdateOptions): HTMLButtonElement {
	updateMenuItem(submenuitem)
	submenuitem.classList.add(MenuClasses.submenuItem)
	const ariaControls = options?.SubMenuItemAriaControls
	if (ariaControls === false) {
		submenuitem.removeAttribute('aria-controls')
	}
	else if (ariaControls !== undefined && ariaControls !== null && ariaControls !== true) {
		submenuitem.setAttribute('aria-controls', ariaControls)
	}

	const ariaExpanded = options?.SubMenuItemAriaExpanded
	if (ariaExpanded === false) {
		submenuitem.removeAttribute('aria-expanded')
	}
	else if (ariaExpanded !== undefined && ariaExpanded !== null && ariaExpanded !== true) {
		submenuitem.setAttribute('aria-expanded', ariaExpanded)
	}

	const ariaHaspopup = options?.SubMenuAriaHaspopup
	if (ariaHaspopup === false) {
		submenuitem.removeAttribute('aria-haspopup')
	}
	else if (ariaHaspopup !== undefined && ariaHaspopup !== null && ariaHaspopup !== true) {
		submenuitem.setAttribute('aria-haspopup', ariaHaspopup)
	}

	options?.SubMenuRefs?.menuitem?.(submenuitem)
	return submenuitem
}

function registerSubMenuItem(...submenuitems: HTMLButtonElement[]): void {
	if (submenuitems.length === 0) {
		submenuitems = [...document.querySelectorAll<HTMLButtonElement>('.' + MenuClasses.submenuItem)]
	}

	for (const submenu of submenuitems){
		if (REGISTERED_SUBMENUITEM.has(submenu)) {
			continue
		}

		REGISTERED_SUBMENUITEM.add(submenu)
		_initSubMenu(submenu)
	}
}

function unregisterSubMenuItem(...submenuitems: HTMLButtonElement[]): void {
	for (const submenuitem of submenuitems) {
		REGISTERED_SUBMENUITEM.delete(submenuitem)
	}
}

function createMenuIndent(options?: MenuIndentUpdateOptions): HTMLDivElement {
	const indent = document.createElement('div')
	return updateMenuIndent(indent, options)
}

function updateMenuIndent(indent: HTMLDivElement, options?: MenuIndentUpdateOptions): HTMLDivElement {
	indent.classList.add(MenuClasses.indent)
	options?.MenuIndentRefs?.indent?.(indent)
	return indent
}

function createMenuHeader(options?: MenuHeaderUpdateOptions): HTMLDivElement {
	const indent = document.createElement('div')
	return updateMenuHeader(indent, options)
}

function updateMenuHeader(headerRef: HTMLDivElement, options?: MenuHeaderUpdateOptions): HTMLDivElement {
	headerRef.classList.add(MenuClasses.header)

	const children = options?.MenuHeaderChildren
	if (children === false) {
		headerRef.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		headerRef.replaceChildren(...children)
	}

	options?.MenuHeaderRefs?.header?.(headerRef)
	return headerRef
}

export {
	type MenuProps,
	type MenuItemProps,
	type LinkMenuItemProps,
	type SubMenuItemProps,
	type PopoverOpenOptions as MenuOpenOptions,
	type PopoverCloseOptions as MenuCloseOptions,
	type PopoverOpenDetails as MenuOpenDetails,
	type PopoverCloseDetails as MenuCloseDetails,
	type PopoverRepositionDetails as MenuRepositionDetails,
	type MenuUpdateOptions,
	type MenuItemUpdateOptions,
	type LinkMenuItemUpdateOptions,
	type SubMenuItemUpdateOptions,
	type RadioMenuItemProps,
	type MenuHeaderProps,
	type MenuIndentProps,
	type MenuIndentUpdateOptions,
	type MenuHeaderUpdateOptions,
	MenuClasses,
	PopoverEvents as MenuEvents,
	PopoverAttributes as MenuAttributes,
	PopoverClasses,
	MenuPosition,
	openPopover as openMenu,
	closePopover as closeMenu,
	repositionPopover as repositionMenu,
	isPopoverOpen as isMenuOpen,
	registerPopover as registerMenu,
	unregisterPopover as unregisterMenu,
	createMenu,
	updateMenu,
	updateMenuItem,
	updateLinkMenuItem,
	createMenuItem,
	createLinkMenuItem,
	registerSubMenuItem,
	unregisterSubMenuItem,
	createSubMenuItem,
	updateSubMenuItem,
	createMenuIndent,
	updateMenuIndent,
	createMenuHeader,
	updateMenuHeader
}