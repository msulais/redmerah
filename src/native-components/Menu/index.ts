import { FlyoutPosition as MenuPosition } from "@/enums/position"

import {
	type PopoverProps,
	type PopoverOpenOptions,
	type PopoverCloseOptions,
	type PopoverUpdateOptions,
	type PopoverToggleOpenEventDetail,
	PopoverEvents,
	PopoverAttributes,
	PopoverClasses,
	openPopoverRef,
	closePopoverRef,
	repositionPopoverRef,
	isPopoverRefOpen,
	createPopoverRef,
	registerPopoverRef,
	updatePopoverRef,
	unregisterPopoverRef,
} from "@/native-components/Popover"
import {
	type ButtonUpdateOptions,
	type ButtonProps,
	type LinkButtonUpdateOptions,
	type LinkButtonProps,
	createButtonRef,
	createLinkButtonRef,
	updateButtonRef,
	updateLinkButtonRef,
	ButtonClasses
} from "@/native-components/Button"
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
		indent?(ref: HTMLDivElement): unknown
	}
}

type MenuHeaderUpdateOptions = {
	MenuHeaderChildren?: (string | Node)[] | boolean
	MenuHeaderRefs    ?: {
		header?(ref: HTMLDivElement): unknown
	}
}

type MenuUpdateOptions = PopoverUpdateOptions & {
	MenuRole?: astroHTML.JSX.AriaRole | boolean
	MenuRefs?: {
		menu?(ref: HTMLDivElement): unknown
	}
}

type MenuItemUpdateOptions = ButtonUpdateOptions & {
	MenuItemRole?: astroHTML.JSX.AriaRole | boolean
	MenuItemRefs?: {
		menuitem?(ref: HTMLButtonElement): unknown
	}
}

type SubMenuItemUpdateOptions = MenuItemUpdateOptions & {
	SubMenuItemAriaExpanded?: astroHTML.JSX.AriaAttributes['aria-expanded'] | boolean
	SubMenuItemAriaControls?: astroHTML.JSX.AriaAttributes['aria-controls'] | boolean
	SubMenuAriaHaspopup    ?: astroHTML.JSX.AriaAttributes['aria-haspopup'] | boolean
	SubMenuRefs            ?: {
		menuitem?(ref: HTMLButtonElement): unknown
	}
}

type LinkMenuItemUpdateOptions = LinkButtonUpdateOptions & {
	LinkMenuItemRole?: astroHTML.JSX.AriaRole | boolean
	LinkMenuItemRefs?: {
		menuitem?(ref: HTMLAnchorElement): unknown
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
 * @param subMenuItemRef
 */
function _initSubMenuItemRef(subMenuItemRef: HTMLElement): void {
	const elements = {
		get parent() {
			return subMenuItemRef.closest('.' + MenuClasses.menu) as HTMLDivElement | null
		},
		get parentContent() {
			return subMenuItemRef.closest('.' + PopoverClasses.content) as HTMLDivElement | null
		},
		get target() {
			return document.getElementById(subMenuItemRef.getAttribute('aria-controls') ?? '___NONE___') as HTMLDivElement | null
		}
	}
	let isParentHovered = false
	let isTargetHovered = false
	let timeId: number | NodeJS.Timeout | null = null

	function getAllSubMenuRefs(from: HTMLElement): HTMLDivElement[] {
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

	function openSubMenuRef(instant: boolean = false): void {
		if (timeId !== null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			timeId = null
			const parentRef = elements.parent
			const targetRef = elements.target
			if (!targetRef || !parentRef || isPopoverRefOpen(targetRef)) return

			for (const menuRef of getAllSubMenuRefs(parentRef)) {
				if (menuRef === targetRef) continue

				closePopoverRef(menuRef, { animation: false }).then(() => {
					document.body.appendChild(menuRef)
				})
			}

			parentRef.appendChild(targetRef)
			openPopoverRef(targetRef, {
				anchor: subMenuItemRef,
				position: PopoverPosition.rightCenterToBottom,
				gap: -4,
				padding: 5, // +1px for border
				important: true
			})
		}, instant? 0 : 300)
	}

	function closeSubMenuRef(instant: boolean = false): void {
		if (timeId !== null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			timeId = null
			const targetRef = elements.target
			if (!targetRef) return

			for (const menuRef of getAllSubMenuRefs(targetRef)) {
				if (menuRef === targetRef) continue

				closePopoverRef(menuRef).then(() => {
					document.body.appendChild(menuRef)
				})
			}

			closePopoverRef(targetRef)
			document.body.appendChild(targetRef)
		}, instant? 0 : 300)
	}

	function menuContentRefOnPointerEnter(): void {
		isParentHovered = true
		if (!isTargetHovered) {
			closeSubMenuRef()
		}
	}

	function menuContentRefOnPointerLeave(): void {
		isParentHovered = false
	}

	function menuRefOnBeforeClose(ev: Event): void {
		if (timeId !== null) clearTimeout(timeId)
		for (const menuRef of getAllSubMenuRefs(ev.target as HTMLElement)) {
			closePopoverRef(menuRef).then(() => {
				document.body.appendChild(menuRef)
			})
		}
	}

	function subMenuRefOnPointerEnter(): void {
		isTargetHovered = true
		openSubMenuRef()
	}

	function subMenuRefOnPointerLeave(): void {
		isTargetHovered = false
		if (isParentHovered) {
			closeSubMenuRef()
		}
		else {
			openSubMenuRef()
		}
	}

	function subMenuRefOnClick(): void {
		openSubMenuRef(true)
	}

	function subMenuRefOnToggleOpen(ev: CustomEvent<PopoverToggleOpenEventDetail>): void {
		const open = ev.detail.open

		// toggleopen can bubbles
		if ((ev.target as any).id !== subMenuItemRef.getAttribute('aria-controls')) return
		subMenuItemRef.setAttribute('aria-expanded', String(open))
		if (subMenuItemRef.classList.contains(ButtonClasses.button)) {
			updateMenuItemRef(subMenuItemRef as HTMLButtonElement, {
				ButtonFocused: open
			})
		}
	}

	function initEvents(): void {
		const parentRef = elements.parent
		parentRef?.addEventListener(PopoverEvents.toggleOpen as any, (ev: CustomEvent<PopoverToggleOpenEventDetail>) => {
			const isOpen = ev.detail.open
			const targetRef = elements.target
			const contentRef = elements.parentContent
			if (isOpen) {
				parentRef?.addEventListener(PopoverEvents.beforeClose, menuRefOnBeforeClose)
				contentRef?.addEventListener('pointerenter', menuContentRefOnPointerEnter)
				contentRef?.addEventListener('pointerleave', menuContentRefOnPointerLeave)
				subMenuItemRef.addEventListener('pointerenter', subMenuRefOnPointerEnter)
				subMenuItemRef.addEventListener('pointerleave', subMenuRefOnPointerLeave)
				subMenuItemRef.addEventListener('click'       , subMenuRefOnClick)
				targetRef?.addEventListener('pointerenter', subMenuRefOnPointerEnter)
				targetRef?.addEventListener('pointerleave', subMenuRefOnPointerLeave)
				targetRef?.addEventListener(PopoverEvents.toggleOpen as any, subMenuRefOnToggleOpen)
			}
			else {
				// !important: without this, `PopoverEvents.toggleOpen` event for `target` will
				// remove before running for the last time
				setTimeout(() => {
					contentRef?.removeEventListener('pointerenter', menuContentRefOnPointerEnter)
					contentRef?.removeEventListener('pointerleave', menuContentRefOnPointerLeave)
					parentRef?.removeEventListener(PopoverEvents.beforeClose, menuRefOnBeforeClose)
					subMenuItemRef.removeEventListener('pointerenter', subMenuRefOnPointerEnter)
					subMenuItemRef.removeEventListener('pointerleave', subMenuRefOnPointerLeave)
					subMenuItemRef.removeEventListener('click'       , subMenuRefOnClick)
					targetRef?.removeEventListener('pointerenter', subMenuRefOnPointerEnter)
					targetRef?.removeEventListener('pointerleave', subMenuRefOnPointerLeave)
					targetRef?.removeEventListener(PopoverEvents.toggleOpen as any, subMenuRefOnToggleOpen)
				})
			}
		})
	}

	initEvents()
}

function createMenuRef(options?: MenuUpdateOptions): HTMLDivElement {
	const menuRef = createPopoverRef(options)
	return updateMenuRef(menuRef)
}

function updateMenuRef(menuRef: HTMLDivElement, options?: MenuUpdateOptions): HTMLDivElement {
	updatePopoverRef(menuRef, options)
	menuRef.classList.add(MenuClasses.menu)
	if (!menuRef.hasAttribute('role')) {
		menuRef.setAttribute('role', 'menu')
	}

	const role = options?.MenuRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menu` anyway.
		// If we want without role, just use regular <Popover>. Or update with `updatePopover()`.
		menuRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuRef.setAttribute('role', role)
	}

	options?.MenuRefs?.menu?.(menuRef)
	return menuRef
}

function createMenuItemRef(options?: MenuItemUpdateOptions): HTMLButtonElement {
	const menuItemRef = createButtonRef(options)
	return updateMenuItemRef(menuItemRef)
}

function updateMenuItemRef(
	menuItemRef: HTMLButtonElement,
	options?: MenuItemUpdateOptions
): HTMLButtonElement {
	updateButtonRef(menuItemRef, options)
	menuItemRef.classList.add(MenuClasses.item)
	if (!menuItemRef.hasAttribute('role')) {
		menuItemRef.setAttribute('role', 'menuitem')
	}

	const role = options?.MenuItemRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateButton()`.
		menuItemRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuItemRef.setAttribute('role', role)
	}

	options?.MenuItemRefs?.menuitem?.(menuItemRef)
	return menuItemRef
}

function createLinkMenuItemRef(options: LinkMenuItemUpdateOptions): HTMLAnchorElement {
	const linkMenuItemRef = createLinkButtonRef(options)
	return updateLinkMenuItemRef(linkMenuItemRef, options)
}

function updateLinkMenuItemRef(
	linkMenuItemRef: HTMLAnchorElement,
	options: LinkMenuItemUpdateOptions
): HTMLAnchorElement {
	updateLinkButtonRef(linkMenuItemRef, options)
	linkMenuItemRef.classList.add(MenuClasses.item)
	if (!linkMenuItemRef.hasAttribute('role')) {
		linkMenuItemRef.setAttribute('role', 'menuitem')
	}

	const role = options?.LinkMenuItemRole
	if (role === false) {

		// NOTE:
		// If we update menu with `role=undefined`, it will back to `role=menuitem` anyway.
		// If we want without role, just use regular <Button>. Or update with `updateLinkButton()`.
		linkMenuItemRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		linkMenuItemRef.setAttribute('role', role)
	}
	options.LinkMenuItemRefs?.menuitem?.(linkMenuItemRef)
	return linkMenuItemRef
}

function createSubMenuItemRef(options: Omit<SubMenuItemUpdateOptions, 'ariaControls'> & {
	ariaControls: astroHTML.JSX.AriaAttributes['aria-controls']
}): HTMLButtonElement {
	return updateSubMenuItemRef(createMenuItemRef(options))
}

function updateSubMenuItemRef(
	subMenuItemRef: HTMLButtonElement,
	options?: SubMenuItemUpdateOptions
): HTMLButtonElement {
	updateMenuItemRef(subMenuItemRef)
	subMenuItemRef.classList.add(MenuClasses.submenuItem)
	const ariaControls = options?.SubMenuItemAriaControls
	if (ariaControls === false) {
		subMenuItemRef.removeAttribute('aria-controls')
	}
	else if (ariaControls !== undefined && ariaControls !== null && ariaControls !== true) {
		subMenuItemRef.setAttribute('aria-controls', ariaControls)
	}

	const ariaExpanded = options?.SubMenuItemAriaExpanded
	if (ariaExpanded === false) {
		subMenuItemRef.removeAttribute('aria-expanded')
	}
	else if (ariaExpanded !== undefined && ariaExpanded !== null && ariaExpanded !== true) {
		subMenuItemRef.setAttribute('aria-expanded', ariaExpanded)
	}

	const ariaHaspopup = options?.SubMenuAriaHaspopup
	if (ariaHaspopup === false) {
		subMenuItemRef.removeAttribute('aria-haspopup')
	}
	else if (ariaHaspopup !== undefined && ariaHaspopup !== null && ariaHaspopup !== true) {
		subMenuItemRef.setAttribute('aria-haspopup', ariaHaspopup)
	}

	options?.SubMenuRefs?.menuitem?.(subMenuItemRef)
	return subMenuItemRef
}

function registerSubMenuItemRef(...subMenuItemRefs: HTMLButtonElement[]): void {
	if (subMenuItemRefs.length === 0) {
		subMenuItemRefs = [...document.querySelectorAll<HTMLButtonElement>('.' + MenuClasses.submenuItem)]
	}

	for (const subMenuItemRef of subMenuItemRefs){
		if (REGISTERED_SUBMENUITEM.has(subMenuItemRef)) {
			continue
		}

		REGISTERED_SUBMENUITEM.add(subMenuItemRef)
		_initSubMenuItemRef(subMenuItemRef)
	}
}

function unregisterSubMenuItemRef(...subMenuItemRefs: HTMLButtonElement[]): void {
	for (const subMenuItemRef of subMenuItemRefs) {
		REGISTERED_SUBMENUITEM.delete(subMenuItemRef)
	}
}

function createMenuIndentRef(options?: MenuIndentUpdateOptions): HTMLDivElement {
	const indentRef = document.createElement('div')
	return updateMenuIndentRef(indentRef, options)
}

function updateMenuIndentRef(
	indentRef: HTMLDivElement,
	options?: MenuIndentUpdateOptions
): HTMLDivElement {
	indentRef.classList.add(MenuClasses.indent)
	options?.MenuIndentRefs?.indent?.(indentRef)
	return indentRef
}

function createMenuHeaderRef(options?: MenuHeaderUpdateOptions): HTMLDivElement {
	const menuHeaderRef = document.createElement('div')
	return updateMenuHeaderRef(menuHeaderRef, options)
}

function updateMenuHeaderRef(
	headerRef: HTMLDivElement,
	options?: MenuHeaderUpdateOptions
): HTMLDivElement {
	headerRef.classList.add(MenuClasses.header)

	const childrenOption = options?.MenuHeaderChildren
	if (childrenOption === false) {
		headerRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		headerRef.replaceChildren(...childrenOption)
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
	type MenuUpdateOptions,
	type MenuItemUpdateOptions,
	type LinkMenuItemUpdateOptions,
	type SubMenuItemUpdateOptions,
	type RadioMenuItemProps,
	type MenuHeaderProps,
	type MenuIndentProps,
	type MenuIndentUpdateOptions,
	type MenuHeaderUpdateOptions,
	type PopoverToggleOpenEventDetail as MenuToggleOpenEventDetail,
	MenuClasses,
	PopoverEvents as MenuEvents,
	PopoverAttributes as MenuAttributes,
	PopoverClasses,
	MenuPosition,
	openPopoverRef as openMenuRef,
	closePopoverRef as closeMenuRef,
	repositionPopoverRef as repositionMenuRef,
	isPopoverRefOpen as isMenuRefOpen,
	registerPopoverRef as registerMenuRef,
	unregisterPopoverRef as unregisterMenuRef,
	createMenuRef,
	updateMenuRef,
	updateMenuItemRef,
	updateLinkMenuItemRef,
	createMenuItemRef,
	createLinkMenuItemRef,
	registerSubMenuItemRef,
	unregisterSubMenuItemRef,
	createSubMenuItemRef,
	updateSubMenuItemRef,
	createMenuIndentRef,
	updateMenuIndentRef,
	createMenuHeaderRef,
	updateMenuHeaderRef
}