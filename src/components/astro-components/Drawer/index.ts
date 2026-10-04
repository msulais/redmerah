import { CButton as GCButton, type ButtonProps, type LinkButtonProps } from "../Button"
import { $children, $classlist, $create, $is_array, $is_bool, $is_false, $query, $toggle_attr } from "../utils"

export namespace CDrawer {
	export type CElement = HTMLDivElement
	export type UpdateOptions = {
		Drawer?: {
			children?: (string | Node)[] | boolean
			header  ?: (string | Node)[] | boolean
			footer  ?: (string | Node)[] | boolean
			refs    ?: {
				drawer   ?(ref: CElement ): unknown
				container?(ref: HTMLDivElement): unknown
				header   ?(ref: HTMLDivElement): unknown
				content  ?(ref: HTMLDivElement): unknown
				footer   ?(ref: HTMLDivElement): unknown
			}
		}
	}

	export enum Classes {
		Drawer    = 'c-drawer',
		Container = Drawer + '-container',
		Header    = Drawer + '-header',
		Content   = Drawer + '-content',
		Footer    = Drawer + '-footer',
		Button    = Drawer + '-button'
	}

	enum Attributes {
		Selected = 'data-c-drawer-button-selected'
	}

	export function open(ref_drawer: CElement): void {
		ref_drawer.showPopover()
	}

	export function close(ref_drawer: CElement): void {
		ref_drawer.hidePopover()
	}

	export function isOpen(ref_drawer: CElement): boolean {
		return ref_drawer.matches(':popover-open')
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_drawer = $create('div')
		return update(ref_drawer, options)
	}

	export function update(ref_drawer: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Drawer
		const refs = opt?.refs
		$classlist(ref_drawer, Classes.Drawer)
		ref_drawer.popover = 'auto'

		// container
		let ref_container = $query<HTMLDivElement>(`.${Classes.Container}`, ref_drawer)
		if (!ref_container) {
			ref_container = $create('div')
			$classlist(ref_container, Classes.Container)
		}

		// container -> header
		let ref_header = $query<HTMLDivElement>(`.${Classes.Header}`, ref_container)
		if (!ref_header) {
			ref_header = $create('div')
			$classlist(ref_header, Classes.Header)
		}

		const opt_header = opt?.header
		if ($is_false(opt_header)) {
			$children(ref_header)
		}
		else if ($is_array(opt_header)) {
			$children(ref_header, ...opt_header)
		}

		// container -> content
		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_container)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		// container -> footer
		let ref_footer = $query<HTMLDivElement>(`.${Classes.Footer}`, ref_container)
		if (!ref_footer) {
			ref_footer = $create('div')
			$classlist(ref_footer, Classes.Footer)
		}

		const opt_footer = opt?.footer
		if ($is_false(opt_footer)) {
			$children(ref_footer)
		}
		else if ($is_array(opt_footer)) {
			$children(ref_footer, ...opt_footer)
		}

		$children(ref_container, ref_header, ref_content, ref_footer)
		$children(ref_drawer, ref_container)
		refs?.drawer?.(ref_drawer)
		refs?.container?.(ref_container)
		refs?.header?.(ref_header)
		refs?.content?.(ref_content)
		refs?.footer?.(ref_footer)
		return ref_drawer
	}

	export namespace CButton {
		export type CElement = GCButton.CElement
		export type UpdateOptions = GCButton.UpdateOptions & {
			DrawerButton?: {
				selected?: boolean
				refs    ?: {
					button?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_button = $create('button')
			return update(ref_button, options)
		}

		export function update(ref_drawerbutton: CElement, options?: UpdateOptions): CElement {
			const opt = options?.DrawerButton
			const refs = opt?.refs
			GCButton.update(ref_drawerbutton, options)
			$classlist(ref_drawerbutton, Classes.Button)

			const opt_selected = opt?.selected
			if ($is_bool(opt_selected)) {
				$toggle_attr(ref_drawerbutton, Attributes.Selected, opt_selected)
			}

			refs?.button?.(ref_drawerbutton)
			return ref_drawerbutton
		}
	}

	export namespace CLink {
		export type CElement = GCButton.CLink.CElement
		export type UpdateOptions = GCButton.CLink.UpdateOptions & {
			DrawerLink?: {
				selected?: boolean
				refs    ?: {
					link?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_drawerlink = $create('a')
			return update(ref_drawerlink, options)
		}

		export function update(
			ref_linkdrawer: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.DrawerLink
			const refs = opt?.refs
			GCButton.CLink.update(ref_linkdrawer, options)
			$classlist(ref_linkdrawer, Classes.Button)

			const opt_selected = opt?.selected
			if ($is_bool(opt_selected)) {
				$toggle_attr(ref_linkdrawer, Attributes.Selected, opt_selected)
			}

			refs?.link?.(ref_linkdrawer)
			return ref_linkdrawer
		}
	}
}

export type DrawerProps = astroHTML.JSX.HTMLAttributes & {
	DrawerContainerAttr?: astroHTML.JSX.HTMLAttributes
	DrawerHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DrawerContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DrawerFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}

export type DrawerButtonProps = ButtonProps & {
	DrawerButtonSelected?: boolean
}

export type LinkDrawerButtonProps = LinkButtonProps & {
	LinkDrawerButtonSelected?: boolean
}