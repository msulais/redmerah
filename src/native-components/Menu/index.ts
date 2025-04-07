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
	updatePopover
} from "@/native-components/Popover"
import {
	type ButtonUpdateOptions,
	type ButtonProps,
	type LinkButtonUpdateOptions,
	type LinkButtonProps,
	createButton,
	createLinkButton,
	updateButton,
	updateLinkButton
} from "@/native-components/Button"

type MenuProps = PopoverProps
type MenuItemProps = ButtonProps
type LinkMenuItemProps = LinkButtonProps

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

type LinkMenuItemUpdateOptions = Omit<LinkButtonUpdateOptions, 'refs'> & {
	role?: astroHTML.JSX.AriaRole | boolean
	refs?: LinkButtonUpdateOptions['refs'] & {
		menuitem?(el: HTMLAnchorElement): unknown
	}
}

enum MenuClasses {
	menu = 'c-menu',
	item = 'c-menu-item',
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

export {
	type MenuProps,
	type MenuItemProps,
	type LinkMenuItemProps,
	type PopoverOpenOptions as MenuOpenOptions,
	type PopoverCloseOptions as MenuCloseOptions,
	type PopoverOpenDetails as MenuOpenDetails,
	type PopoverCloseDetails as MenuCloseDetails,
	type PopoverRepositionDetails as MenuRepositionDetails,
	type MenuUpdateOptions,
	type MenuItemUpdateOptions,
	type LinkMenuItemUpdateOptions,
	MenuClasses,
	PopoverEvents as MenuEvents,
	PopoverAttributes as MenuAttributes,
	PopoverClasses,
	openPopover as openMenu,
	closePopover as closeMenu,
	repositionPopover as repositionMenu,
	isPopoverOpen as isMenuOpen,
	registerPopover as registerMenu,
	createMenu,
	updateMenu,
	updateMenuItem,
	updateLinkMenuItem,
	createMenuItem,
	createLinkMenuItem
}