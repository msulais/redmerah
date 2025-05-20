import { FlyoutPosition as MenuPosition } from "@/enums/position"

import {
	type PopoverProps,
	type PopoverUpdateOptions,
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
	type PopoverElement,
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
	ButtonClasses,
	type LinkButtonElement,
	type ButtonElement
} from "@/native-components/Button"
import { createIconRef, type IconElement, type IconProps } from "@/native-components/Icon"
import { AppCSSColors } from "@/enums/app-data"
import { createId } from "@/utils/ids"
import { IconCodes } from "@/enums/icons"

type MenuProps = PopoverProps & {
	MenuContentAttr ?: astroHTML.JSX.HTMLAttributes
	MenuSubMenusAttr?: astroHTML.JSX.HTMLAttributes
}

type SubMenuProps = MenuProps

type MenuItemProps = ButtonProps
type LinkMenuItemProps = LinkButtonProps
type MenuHeaderProps = astroHTML.JSX.HTMLAttributes

type SubMenuItemProps = Omit<MenuItemProps, 'popovertarget'> & {
	'popovertarget': string
}

type MenuIndentProps = astroHTML.JSX.HTMLAttributes

type RadioMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	RadioMenuItemChecked    ?: boolean
	RadioMenuItemDisabled   ?: boolean
	RadioMenuItemName       ?: string
	RadioMenuItemValue      ?: string
	RadioMenuItemLeadingAttr?: astroHTML.JSX.HTMLAttributes
	RadioMenuItemInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	RadioMenuItemIconAttr   ?: IconProps
	RadioMenuItemContentAttr?: astroHTML.JSX.HTMLAttributes
}

type CheckMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	CheckMenuItemChecked    ?: boolean
	CheckMenuItemDisabled   ?: boolean
	CheckMenuItemLeadingAttr?: astroHTML.JSX.HTMLAttributes
	CheckMenuItemInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	CheckMenuItemIconAttr   ?: astroHTML.JSX.SVGAttributes
	CheckMenuItemContentAttr?: astroHTML.JSX.HTMLAttributes
}

type MenuElement = PopoverElement
type CheckMenuItemElement = HTMLLabelElement
type LinkMenuItemElement = LinkButtonElement
type MenuHeaderElement = HTMLDivElement
type MenuIndentElement = HTMLDivElement
type MenuItemElement = ButtonElement
type RadioMenuItemElement = HTMLLabelElement
type SubMenuElement = PopoverElement
type SubMenuItemElement = MenuItemElement

type CheckMenuItemUpdateOptions = {
	CheckMenuItemChecked ?: boolean
	CheckMenuItemDisabled?: boolean
	CheckMenuItemLeading ?: (string | Node[]) | boolean
	CheckMenuItemChildren?: (string | Node[]) | boolean
	CheckMenuItemRefs    ?: {
		checkmenuitem?(ref: CheckMenuItemElement): unknown
		leading      ?(ref: HTMLDivElement      ): unknown
		icon         ?(ref: SVGSVGElement       ): unknown
		content      ?(ref: HTMLDivElement      ): unknown
	}
}

type RadioMenuItemUpdateOptions = {
	RadioMenuItemChecked ?: boolean
	RadioMenuItemDisabled?: boolean
	RadioMenuItemName    ?: string
	RadioMenuItemValue   ?: string
	RadioMenuItemLeading ?: (string | Node[]) | boolean
	RadioMenuItemChildren?: (string | Node[]) | boolean
	RadioMenuItemRefs    ?: {
		radiomenuitem?(ref: RadioMenuItemElement): unknown
		leading      ?(ref: HTMLDivElement      ): unknown
		icon         ?(ref: IconElement         ): unknown
		content      ?(ref: HTMLDivElement      ): unknown
	}
}

type MenuIndentUpdateOptions = {
	MenuIndentRefs?: {
		indent?(ref: MenuIndentElement): unknown
	}
}

type MenuHeaderUpdateOptions = {
	MenuHeaderChildren?: (string | Node)[] | boolean
	MenuHeaderRefs    ?: {
		header?(ref: MenuHeaderElement): unknown
	}
}

type MenuUpdateOptions = Omit<PopoverUpdateOptions, 'PopoverChildren'> & {
	MenuChildren?: (string | Node)[] | boolean
	MenuSubMenus?: (string | Node)[] | boolean
	MenuRole    ?: astroHTML.JSX.AriaRole | boolean
	MenuRefs    ?: {
		menu    ?(ref: MenuElement   ): unknown
		content ?(ref: HTMLDivElement): unknown
		submenus?(ref: HTMLDivElement): unknown
	}
}

type SubMenuUpdateOptions = MenuUpdateOptions

type MenuItemUpdateOptions = ButtonUpdateOptions & {
	MenuItemRole?: astroHTML.JSX.AriaRole | boolean
	MenuItemRefs?: {
		menuitem?(ref: MenuItemElement): unknown
	}
}

type SubMenuItemUpdateOptions = MenuItemUpdateOptions & {
	SubMenuItemPopoverId?: string
	SubMenuItemRefs     ?: {
		menuitem?(ref: SubMenuItemElement): unknown
	}
}

type LinkMenuItemUpdateOptions = LinkButtonUpdateOptions & {
	LinkMenuItemRole?: astroHTML.JSX.AriaRole | boolean
	LinkMenuItemRefs?: {
		menuitem?(ref: LinkMenuItemElement): unknown
	}
}

enum MenuClasses {
	menu             = 'c-menu',
	content          = menu + '-content',
	header           = menu + '-header',
	item             = menu + '-item',
	indent           = menu + '-indent',
	radioItem        = menu + '-radio-item',
	submenu          = menu + '-submenu',
	checkItem        = menu + '-check-item',
	submenus         = menu + '-submenus',
	submenuItem      = submenu + '-item',
	radioItemLeading = radioItem + '-leading',
	radioItemIcon    = radioItem + '-icon',
	radioItemInput   = radioItem + '-input',
	radioItemContent = radioItem + '-content',
	checkItemLeading = checkItem + '-leading',
	checkItemInput   = checkItem + '-input',
	checkItemIcon    = checkItem + '-icon',
	checkItemContent = checkItem + '-content'
}

const REGISTERED_SUBMENUITEM: Set<SubMenuItemElement> = new Set<SubMenuItemElement>()

/**
 * Any element is possible as long have class `MenuClasses.submenuItem`
 * @param subMenuItemRef
 */
function _initSubMenuItemRef(subMenuItemRef: SubMenuItemElement): void {
	const elements = {
		get parent() {
			return subMenuItemRef.closest('.' + MenuClasses.menu) as MenuElement | null
		},
		get parentContent() {
			return subMenuItemRef.closest('.' + MenuClasses.content) as HTMLDivElement | null
		},
		get target() {
			return subMenuItemRef.popoverTargetElement as SubMenuElement | null
		}
	}
	let isParentHovered = false
	let isTargetHovered = false
	let timeId: number | NodeJS.Timeout | null = null

	function getAllSubMenuRefs(from: HTMLElement): SubMenuElement[] {
		const menus = new Set<SubMenuElement>()
		const traverseDown = (popover: HTMLElement) => {
			const submenuItems = popover.querySelectorAll<SubMenuItemElement>(`.${MenuClasses.submenuItem}`)
			for (const item of submenuItems) {

				// handle nested <Menu>
				const m = item.closest(`.${MenuClasses.menu}`)
				if (m !== popover) continue

				const menu = item.popoverTargetElement as SubMenuElement | null
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

				menuRef.hidePopover()
			}

			let id = subMenuItemRef.id
			if (!id) {
				id = createId()
				subMenuItemRef.id = id
			}

			updateSubMenuRef(targetRef, {
				PopoverAnchorBy: id
			})
			targetRef.showPopover()
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

				menuRef.hidePopover()
			}

			targetRef.hidePopover()
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

	function subMenuRefOnPointerEnter(): void {
		isTargetHovered = true
		if (timeId !== null) clearTimeout(timeId)

		timeId = null
	}

	function subMenuItemRefOnPointerEnter(): void {
		isTargetHovered = true
		openSubMenuRef()
	}

	function subMenuRefOnPointerLeave(): void {
		isTargetHovered = false
		if (isParentHovered) {
			closeSubMenuRef()
		}
	}

	function subMenuRefOnToggleOpen(ev: Event): void {
		const open = (ev as ToggleEvent).newState === 'open'
		if (subMenuItemRef.classList.contains(ButtonClasses.button)) {
			updateMenuItemRef(subMenuItemRef as SubMenuItemElement, {
				ButtonFocused: open
			})
		}
	}

	function parentRefOnBeforeClose(ev: Event): void {
		if (timeId !== null) clearTimeout(timeId)

		timeId = null
		for (const menuRef of getAllSubMenuRefs(ev.target as HTMLElement)) {
			menuRef.hidePopover()
		}
	}

	function initEvents(): void {
		const parentRef = elements.parent
		parentRef?.addEventListener('toggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			const targetRef = elements.target
			const contentRef = elements.parentContent
			if (isOpen) {
				parentRef.addEventListener('beforetoggle', parentRefOnBeforeClose)
				contentRef?.addEventListener('pointerenter', menuContentRefOnPointerEnter)
				contentRef?.addEventListener('pointerleave', menuContentRefOnPointerLeave)
				subMenuItemRef.addEventListener('pointerenter', subMenuItemRefOnPointerEnter)
				subMenuItemRef.addEventListener('pointerleave', subMenuRefOnPointerLeave)
				targetRef?.addEventListener('pointerenter', subMenuRefOnPointerEnter)
				targetRef?.addEventListener('pointerleave', subMenuRefOnPointerLeave)
				targetRef?.addEventListener('toggle', subMenuRefOnToggleOpen)
			}
			else {
				// !important: without this, `PopoverEvents.toggleOpen` event for `target` will
				// remove before running for the last time
				setTimeout(() => {
					parentRef.removeEventListener('beforetoggle', parentRefOnBeforeClose)
					contentRef?.removeEventListener('pointerenter', menuContentRefOnPointerEnter)
					contentRef?.removeEventListener('pointerleave', menuContentRefOnPointerLeave)
					subMenuItemRef.removeEventListener('pointerenter', subMenuItemRefOnPointerEnter)
					subMenuItemRef.removeEventListener('pointerleave', subMenuRefOnPointerLeave)
					targetRef?.removeEventListener('pointerenter', subMenuRefOnPointerEnter)
					targetRef?.removeEventListener('pointerleave', subMenuRefOnPointerLeave)
					targetRef?.removeEventListener('toggle', subMenuRefOnToggleOpen)
				})
			}
		})
	}

	initEvents()
}

function createMenuRef(options?: MenuUpdateOptions): MenuElement {
	const menuRef = createPopoverRef(options)
	return updateMenuRef(menuRef)
}

function updateMenuRef(menuRef: MenuElement, options?: MenuUpdateOptions): MenuElement {
	let popoverContentRef: HTMLDivElement
	updatePopoverRef(menuRef, {
		...options,
		PopoverRefs: {
			...options?.PopoverRefs,
			content(ref) {
				popoverContentRef = ref
				options?.PopoverRefs?.content?.(ref)
			},
		}
	})
	menuRef.classList.add(MenuClasses.menu)
	if (!menuRef.hasAttribute('role')) {
		menuRef.setAttribute('role', 'menu')
	}

	const role = options?.MenuRole
	if (role === false) {
		menuRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuRef.setAttribute('role', role)
	}

	// content
	const childrenOption = options?.MenuChildren
	let contentRef = popoverContentRef!.querySelector<HTMLDivElement>(`.${MenuClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(MenuClasses.content)
	}
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	// submenus
	const submenusOption = options?.MenuSubMenus
	let submenusRef = popoverContentRef!.querySelector<HTMLDivElement>(`.${MenuClasses.submenus}`)
	if (!submenusRef) {
		submenusRef = document.createElement('div')
		submenusRef.classList.add(MenuClasses.submenus)
	}
	if (submenusOption === false) {
		submenusRef.replaceChildren()
	}
	else if (submenusOption !== undefined && submenusOption !== true) {
		submenusRef.replaceChildren(...submenusOption)
	}

	popoverContentRef!.replaceChildren(contentRef, submenusRef)

	const refs = options?.MenuRefs
	refs?.menu?.(menuRef)
	refs?.content?.(contentRef)
	refs?.submenus?.(submenusRef)
	return menuRef
}

function createMenuItemRef(options?: MenuItemUpdateOptions): MenuItemElement {
	const menuItemRef = createButtonRef(options)
	return updateMenuItemRef(menuItemRef)
}

function updateMenuItemRef(
	menuItemRef: MenuItemElement,
	options?: MenuItemUpdateOptions
): MenuItemElement {
	updateButtonRef(menuItemRef, options)
	menuItemRef.classList.add(MenuClasses.item)
	if (!menuItemRef.hasAttribute('role')) {
		menuItemRef.setAttribute('role', 'menuitem')
	}

	const role = options?.MenuItemRole
	if (role === false) {
		menuItemRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		menuItemRef.setAttribute('role', role)
	}

	options?.MenuItemRefs?.menuitem?.(menuItemRef)
	return menuItemRef
}

function createLinkMenuItemRef(options: LinkMenuItemUpdateOptions): LinkMenuItemElement {
	const linkMenuItemRef = createLinkButtonRef(options)
	return updateLinkMenuItemRef(linkMenuItemRef, options)
}

function updateLinkMenuItemRef(
	linkMenuItemRef: LinkMenuItemElement,
	options: LinkMenuItemUpdateOptions
): LinkMenuItemElement {
	updateLinkButtonRef(linkMenuItemRef, options)
	linkMenuItemRef.classList.add(MenuClasses.item)
	if (!linkMenuItemRef.hasAttribute('role')) {
		linkMenuItemRef.setAttribute('role', 'menuitem')
	}

	const role = options?.LinkMenuItemRole
	if (role === false) {
		linkMenuItemRef.removeAttribute('role')
	}
	else if (role !== undefined && role !== true) {
		linkMenuItemRef.setAttribute('role', role)
	}
	options.LinkMenuItemRefs?.menuitem?.(linkMenuItemRef)
	return linkMenuItemRef
}

function createSubMenuItemRef(options: Omit<SubMenuItemUpdateOptions, 'SubMenuItemPopoverId'> & {
	SubMenuItemPopoverId: string
}): SubMenuItemElement {
	return updateSubMenuItemRef(createMenuItemRef(options))
}

function updateSubMenuItemRef(
	subMenuItemRef: SubMenuItemElement,
	options?: SubMenuItemUpdateOptions
): SubMenuItemElement {
	updateMenuItemRef(subMenuItemRef, options)
	subMenuItemRef.classList.add(MenuClasses.submenuItem)
	const popoverIdOption = options?.SubMenuItemPopoverId
	if (popoverIdOption) {
		subMenuItemRef.setAttribute('popovertarget', popoverIdOption)
	}

	options?.SubMenuItemRefs?.menuitem?.(subMenuItemRef)
	return subMenuItemRef
}

function registerSubMenuItemRef(...subMenuItemRefs: SubMenuItemElement[]): void {
	if (subMenuItemRefs.length === 0) {
		subMenuItemRefs = [...document.querySelectorAll<SubMenuItemElement>('.' + MenuClasses.submenuItem)]
	}

	for (const subMenuItemRef of subMenuItemRefs){
		if (REGISTERED_SUBMENUITEM.has(subMenuItemRef)) {
			continue
		}

		REGISTERED_SUBMENUITEM.add(subMenuItemRef)
		_initSubMenuItemRef(subMenuItemRef)
	}
}

function unregisterSubMenuItemRef(...subMenuItemRefs: SubMenuItemElement[]): void {
	for (const subMenuItemRef of subMenuItemRefs) {
		REGISTERED_SUBMENUITEM.delete(subMenuItemRef)
	}
}

function createMenuIndentRef(options?: MenuIndentUpdateOptions): MenuIndentElement {
	const indentRef = document.createElement('div')
	return updateMenuIndentRef(indentRef, options)
}

function updateMenuIndentRef(
	indentRef: MenuIndentElement,
	options?: MenuIndentUpdateOptions
): MenuIndentElement {
	indentRef.classList.add(MenuClasses.indent)
	options?.MenuIndentRefs?.indent?.(indentRef)
	return indentRef
}

function createMenuHeaderRef(options?: MenuHeaderUpdateOptions): MenuHeaderElement {
	const menuHeaderRef = document.createElement('div')
	return updateMenuHeaderRef(menuHeaderRef, options)
}

function updateMenuHeaderRef(
	headerRef: MenuHeaderElement,
	options?: MenuHeaderUpdateOptions
): MenuHeaderElement {
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

function createCheckMenuItemRef(options?: CheckMenuItemUpdateOptions): CheckMenuItemElement {
	const checkMenuItemRef = document.createElement('label')
	return updateCheckMenuItemRef(checkMenuItemRef, options)
}

function updateCheckMenuItemRef(
	checkMenuItemRef: CheckMenuItemElement,
	options?: CheckMenuItemUpdateOptions
): CheckMenuItemElement {
	const refs = options?.CheckMenuItemRefs
	checkMenuItemRef.classList.add(ButtonClasses.button, MenuClasses.item, MenuClasses.checkItem)

	// leading
	const leadingOption = options?.CheckMenuItemLeading
	let leadingRef = checkMenuItemRef.querySelector<HTMLDivElement>(`.${MenuClasses.checkItemLeading}`)
	if (!leadingRef) {
		leadingRef = document.createElement('div')
		leadingRef.classList.add(MenuClasses.checkItemLeading)
	}
	if (leadingOption === false) {
		leadingRef.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		leadingRef.replaceChildren(...leadingOption)
	}

	// input
	let inputRef = checkMenuItemRef.querySelector<HTMLInputElement>(`.${MenuClasses.checkItemInput}`)
	if (!inputRef) {
		inputRef = document.createElement('input')
		inputRef.classList.add(MenuClasses.checkItemInput)
		inputRef.autocomplete = 'off'
		inputRef.role = 'menuitemcheckbox'
		inputRef.type = 'checkbox'
	}

	const checkedOption = options?.CheckMenuItemChecked
	if (checkedOption !== undefined) {
		inputRef.checked = checkedOption
	}

	const disabledOption = options?.CheckMenuItemDisabled
	if (disabledOption !== undefined) {
		inputRef.disabled = disabledOption
	}

	// icon
	let iconRef = checkMenuItemRef.querySelector<SVGSVGElement>('.' + MenuClasses.checkItemIcon)
	if (!iconRef) {
		iconRef = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		iconRef.classList.add(MenuClasses.checkItemIcon)
		iconRef.setAttribute('viewBox', '0 -960 960 960')
		iconRef.setAttribute('width', '20')
		iconRef.setAttribute('height', '20')

		const pathRef = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		pathRef.setAttribute('d', 'm389-369 299-299q10.91-11 25.45-11Q728-679 739-668t11 25.58q0 14.58-10.61 25.19L415-292q-10.91 11-25.45 11Q375-281 364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.67-11 14.66 0 25.33 11l117 117Z')
		pathRef.setAttribute('fill', `rgb(${AppCSSColors.accent})`)
		iconRef.append(pathRef)
	}

	// content
	const childrenOption = options?.CheckMenuItemChildren
	let contentRef = checkMenuItemRef.querySelector<HTMLDivElement>(`.${MenuClasses.checkItemContent}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(MenuClasses.checkItemContent)
	}
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	checkMenuItemRef.replaceChildren(leadingRef, inputRef, iconRef, contentRef)
	refs?.checkmenuitem?.(checkMenuItemRef)
	refs?.content?.(contentRef)
	refs?.icon?.(iconRef)
	refs?.leading?.(leadingRef)
	return checkMenuItemRef
}

function createRadioMenuItemRef(options?: RadioMenuItemUpdateOptions): RadioMenuItemElement {
	const radioMenuItemRef = document.createElement('label')
	return updateRadioMenuItemRef(radioMenuItemRef, options)
}

function updateRadioMenuItemRef(
	radioMenuItemRef: RadioMenuItemElement,
	options?: RadioMenuItemUpdateOptions
): RadioMenuItemElement {
	radioMenuItemRef.classList.add(ButtonClasses.button, MenuClasses.item, MenuClasses.radioItem)

	// leading
	const leadingOption = options?.RadioMenuItemLeading
	let leadingRef = radioMenuItemRef.querySelector<HTMLDivElement>(`.${MenuClasses.radioItemLeading}`)
	if (!leadingRef) {
		leadingRef = document.createElement('div')
		leadingRef.classList.add(MenuClasses.radioItemLeading)
	}
	if (leadingOption === false) {
		leadingRef.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		leadingRef.replaceChildren(...leadingOption)
	}

	// input
	let inputRef = radioMenuItemRef.querySelector<HTMLInputElement>(`.${MenuClasses.radioItemInput}`)
	if (!inputRef) {
		inputRef = document.createElement('input')
		inputRef.classList.add(MenuClasses.radioItemInput)
		inputRef.role = 'menuitemradio'
		inputRef.type = 'radio'
		inputRef.autocomplete = 'off'
	}

	const nameOption = options?.RadioMenuItemName
	if (nameOption) {
		inputRef.name = nameOption
	}

	const valueOption = options?.RadioMenuItemValue
	if (valueOption) {
		inputRef.value = valueOption
	}

	const checkedOption = options?.RadioMenuItemChecked
	if (checkedOption !== undefined) {
		inputRef.checked = checkedOption
	}

	const disabledOption = options?.RadioMenuItemDisabled
	if (disabledOption !== undefined) {
		inputRef.disabled = disabledOption
	}

	// icon
	let iconRef = radioMenuItemRef.querySelector<IconElement>(`.${MenuClasses.radioItemIcon}`)
	if (!iconRef) {
		iconRef = createIconRef({
			IconCode: IconCodes.circleSmall,
			IconFilled: true
		})
		iconRef.classList.add(MenuClasses.radioItemIcon)
	}

	// content
	const childrenOption = options?.RadioMenuItemChildren
	let contentRef = radioMenuItemRef.querySelector<HTMLDivElement>(`.${MenuClasses.radioItemContent}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(MenuClasses.radioItemContent)
	}
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	radioMenuItemRef.replaceChildren(leadingRef, inputRef, iconRef, contentRef)

	const refs = options?.RadioMenuItemRefs
	refs?.content?.(contentRef)
	refs?.icon?.(iconRef)
	refs?.leading?.(leadingRef)
	refs?.radiomenuitem?.(radioMenuItemRef)
	return radioMenuItemRef
}

function createSubMenuRef(options?: SubMenuUpdateOptions): SubMenuElement {
	const subMenuRef = document.createElement('div')
	return updateSubMenuRef(subMenuRef, options)
}

function updateSubMenuRef(subMenuRef: SubMenuElement, options?: SubMenuUpdateOptions): SubMenuElement {
	updateMenuRef(subMenuRef, options)
	subMenuRef.classList.add(MenuClasses.submenu)
	return subMenuRef
}

export {
	type MenuProps,
	type MenuItemProps,
	type SubMenuUpdateOptions,
	type LinkMenuItemProps,
	type SubMenuItemProps,
	type MenuUpdateOptions,
	type MenuItemUpdateOptions,
	type LinkMenuItemUpdateOptions,
	type SubMenuItemUpdateOptions,
	type RadioMenuItemProps,
	type MenuHeaderProps,
	type MenuIndentProps,
	type MenuIndentUpdateOptions,
	type MenuHeaderUpdateOptions,
	type CheckMenuItemProps,
	type CheckMenuItemUpdateOptions,
	type RadioMenuItemUpdateOptions,
	type SubMenuProps,
	type MenuElement,
	type CheckMenuItemElement,
	type LinkMenuItemElement,
	type MenuHeaderElement,
	type MenuIndentElement,
	type MenuItemElement,
	type RadioMenuItemElement,
	type SubMenuElement,
	type SubMenuItemElement,
	MenuClasses,
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
	updateMenuHeaderRef,
	createCheckMenuItemRef,
	updateCheckMenuItemRef,
	createRadioMenuItemRef,
	updateRadioMenuItemRef,
	createSubMenuRef,
	updateSubMenuRef
}