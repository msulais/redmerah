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

type SubMenuItemProps = Omit<MenuItemProps, 'aria-controls'> & {
	'aria-controls': string
}

type RadioMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	'c:attrLeading'?: astroHTML.JSX.HTMLAttributes
	'c:attrInput'  ?: astroHTML.JSX.InputHTMLAttributes
	'c:attrIcon'   ?: IconProps
	'c:attrContent'?: astroHTML.JSX.HTMLAttributes
}

type MenuUpdateOptions = Omit<PopoverUpdateOptions, 'refs'> & {
	role?: astroHTML.JSX.AriaRole | boolean
	refs?: PopoverUpdateOptions['refs'] & {
		menu?(el: HTMLDivElement): unknown
	}
}

type MenuItemUpdateOptions = Omit<ButtonUpdateOptions, 'refs'> & {
	role?: astroHTML.JSX.AriaRole | boolean
	refs?: ButtonUpdateOptions['refs'] & {
		menuitem?(el: HTMLButtonElement): unknown
	}
}

type SubMenuItemUpdateOptions = MenuItemUpdateOptions & {
	ariaExpanded?: astroHTML.JSX.AriaAttributes['aria-expanded'] | boolean
	ariaControls?: astroHTML.JSX.AriaAttributes['aria-controls'] | boolean
	ariaHaspopup?: astroHTML.JSX.AriaAttributes['aria-haspopup'] | boolean
}

type LinkMenuItemUpdateOptions = Omit<LinkButtonUpdateOptions, 'refs'> & {
	role?: astroHTML.JSX.AriaRole | boolean
	refs?: LinkButtonUpdateOptions['refs'] & {
		menuitem?(el: HTMLAnchorElement): unknown
	}
}

enum MenuClasses {
	menu             = 'c-menu',
	item             = 'c-menu-item',
	submenuItem      = 'c-menu-submenu-item',
	radioItem        = 'c-menu-radio-item',
	radioItemLeading = 'c-menu-radio-item-leading',
	radioItemIcon    = 'c-menu-radio-item-icon',
	radioItemInput   = 'c-menu-radio-item-input',
	radioItemContent = 'c-menu-radio-item-content',
}

const REGISTERED_SUBMENUITEM: HTMLButtonElement[] = []

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
		const menus: HTMLDivElement[] = []
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
					|| menus.some(v => v === menu)
				) {
					continue
				}

				menus.push(menu)
				traverseDown(menu)
			}
		}

		traverseDown(from)
		return menus
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

	function menuOnBeforeOpen(ev: Event): void {
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
		submenuitem.setAttribute('aria-expanded', String(open))
		if (submenuitem.classList.contains(ButtonClasses.btn)) {
			updateMenuItem(submenuitem as HTMLButtonElement, {
				focused: open
			})
		}
	}

	function initEvents(): void {
		const parent = elements.parent
		parent?.addEventListener(PopoverEvents.toggleOpen, () => {
			const isOpen = parent.matches(':popover-open')
			const target = elements.target
			const content = elements.parentContent
			if (isOpen) {
				parent?.addEventListener(PopoverEvents.beforeClose, menuOnBeforeOpen)
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
					parent?.removeEventListener(PopoverEvents.beforeClose, menuOnBeforeOpen)
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

	const role = options?.role
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menu` anyway.
		// If we want without role, just use regular <Popover>. Or update with `updatePopover()`.
		menu.removeAttribute('role')
	}
	else if (role && role !== true) {
		menu.setAttribute('role', role)
	}

	options?.refs?.menu?.(menu)
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

	const role = options?.role
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateButton()`.
		menuitem.removeAttribute('role')
	}
	else if (role && role !== true) {
		menuitem.setAttribute('role', role)
	}

	options?.refs?.menuitem?.(menuitem)
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

	const role = options?.role
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateLinkButton()`.
		menuitem.removeAttribute('role')
	}
	else if (role && role !== true) {
		menuitem.setAttribute('role', role)
	}
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
	const ariaControls = options?.ariaControls
	if (ariaControls === false) {
		submenuitem.removeAttribute('aria-controls')
	}
	else if (ariaControls && ariaControls !== true) {
		submenuitem.setAttribute('aria-controls', ariaControls)
	}

	const ariaExpanded = options?.ariaExpanded
	if (ariaExpanded === false) {
		submenuitem.removeAttribute('aria-expanded')
	}
	else if (ariaExpanded && ariaExpanded !== true) {
		submenuitem.setAttribute('aria-expanded', ariaExpanded)
	}

	const ariaHaspopup = options?.ariaHaspopup
	if (ariaHaspopup === false) {
		submenuitem.removeAttribute('aria-haspopup')
	}
	else if (ariaHaspopup && ariaHaspopup !== true) {
		submenuitem.setAttribute('aria-haspopup', ariaHaspopup)
	}
	return submenuitem
}

function registerSubMenuItem(...submenuitems: HTMLButtonElement[]): void {
	if (submenuitems.length === 0) {
		submenuitems = [...document.querySelectorAll<HTMLButtonElement>('.' + MenuClasses.submenuItem)]
	}

	for (const submenu of submenuitems){
		if (REGISTERED_SUBMENUITEM.some(v => v === submenu)) {
			continue
		}

		REGISTERED_SUBMENUITEM.push(submenu)
		_initSubMenu(submenu)
	}
}

function unregisterSubMenuItem(...submenuitems: HTMLButtonElement[]): void {
	const filtered = REGISTERED_SUBMENUITEM.filter(a => submenuitems.every(b => a !== b))
	REGISTERED_SUBMENUITEM.length = 0
	REGISTERED_SUBMENUITEM.push(...filtered)
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
}