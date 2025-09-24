import { CButton as GCButton, type ButtonProps } from "../Button"
import { $children, $classlist, $create, $is_array, $is_bool, $is_false, $is_node, $query, $toggle_attr } from "../utils"

export namespace CSideBar {
	export type CElement<T extends HTMLElement = HTMLDivElement> = T
	export type UpdateOptions<T extends CElement, U extends 'with-tagname' | null = null> = {
		SideBar?: (U extends 'with-tagname'? {tagname?: keyof HTMLElementTagNameMap} : {}) &  {
			minimized?: boolean
			children ?: (Node | string)[] | boolean
			header   ?: (Node | string)[] | boolean
			footer   ?: (Node | string)[] | boolean
			refs     ?: {
				sideBar?(ref: T             ): unknown
				content?(ref: HTMLDivElement): unknown
				header ?(ref: HTMLDivElement): unknown
				footer ?(ref: HTMLDivElement): unknown
			}
		}
	}

	export enum Attributes {
		minimized = 'data-c-sidebar-minimized'
	}

	export enum Classes {
		sideBar       = 'c-sidebar2',
		content       = sideBar + '-content',
		header        = sideBar + '-header',
		footer        = sideBar + '-footer',
		button        = sideBar + '-button',
		buttonContent = button + '-content',
		buttonLeading = button + '-leading',
	}

	export function create<T extends CElement>(
		options?: UpdateOptions<T, 'with-tagname'>
	): T {
		const ref_sidebar = $create(options?.SideBar?.tagname ?? 'div') as T
		return update<T>(ref_sidebar, options)
	}

	export function update<T extends CElement>(ref_sidebar: T, options?: UpdateOptions<T>): T {
		const opt = options?.SideBar
		const refs = opt?.refs
		$classlist(ref_sidebar, Classes.sideBar)

		const opt_minimized = opt?.minimized
		if ($is_bool(opt_minimized)) {
			$toggle_attr(ref_sidebar, Attributes.minimized, opt_minimized)
		}

		// header
		const opt_header = opt?.header
		let ref_header = $query<HTMLDivElement>(`.${Classes.header}`, ref_sidebar)
		if ($is_false(opt_header)) {
			$children(ref_header)
		}
		else if ($is_array(opt_header)) {
			if (!ref_header) {
				ref_header = $create('div')
				$classlist(ref_header, Classes.header)
			}

			$children(ref_header, ...opt_header)
		}

		// content
		let ref_content = $query<HTMLDivElement>(`.${Classes.content}`, ref_sidebar)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		// footer
		const opt_footer = opt?.footer
		let ref_footer = $query<HTMLDivElement>(`.${Classes.footer}`, ref_sidebar)
		if ($is_false(opt_footer)) {
			$children(ref_footer)
		}
		else if ($is_array(opt_footer)) {
			if (!ref_footer) {
				ref_footer = $create('div')
				$classlist(ref_footer, Classes.footer)
			}

			$children(ref_footer, ...opt_footer)
		}

		$children(ref_sidebar, ...[ref_header, ref_content, ref_footer].filter($is_node) as Node[])
		refs?.content?.(ref_content)
		refs?.sideBar?.(ref_sidebar)
		if (ref_header) refs?.header?.(ref_header)
		if (ref_footer) refs?.footer?.(ref_footer)
		return ref_sidebar
	}

	export namespace CButton {
		export type CElement = GCButton.CElement
		export type UpdateOptions = GCButton.UpdateOptions & {
			SideBarButton?: {
				selected?: boolean
				leading ?: (string | Node)[] | boolean
				children?: (string | Node)[] | boolean
				refs    ?: {
					button ?(ref: CElement): unknown
					content?(ref: HTMLDivElement): unknown
					leading?(ref: HTMLDivElement): unknown
				}
			}
		}

		export enum Attributes {
			selected = 'data-c-sidebar-button-selected'
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_sideBarButton = GCButton.create(options)
			return update(ref_sideBarButton, options)
		}

		export function update(ref_sideBarButton: CElement, options?: UpdateOptions): CElement {
			const opt = options?.SideBarButton
			const refs = opt?.refs
			GCButton.update(ref_sideBarButton, options)
			$classlist(ref_sideBarButton, Classes.button)

			const opt_selected = opt?.selected
			if ($is_bool(opt_selected)) {
				$toggle_attr(ref_sideBarButton, Attributes.selected, opt_selected)
			}

			// leading
			const opt_leading = opt?.leading
			let ref_leading = $query<HTMLDivElement>(`.${Classes.buttonLeading}`, ref_sideBarButton)
			if ($is_false(opt_leading)) {
				$children(ref_leading)
			}
			else if ($is_array(opt_leading)) {
				if (!ref_leading) {
					ref_leading = $create('div')
					$classlist(ref_leading, Classes.buttonLeading)
				}

				$children(ref_leading, ...opt_leading)
			}

			// content
			let ref_content = $query<HTMLDivElement>(`.${Classes.buttonContent}`, ref_sideBarButton)
			if (!ref_content) {
				ref_content = $create('div')
				$classlist(ref_content, Classes.content)
			}

			const opt_children = opt?.children
			if ($is_false(opt_children)) {
				$children(ref_content)
			}
			else if ($is_array(opt_children)) {
				$children(ref_content, ...opt_children)
			}

			$children(ref_sideBarButton, ...[ref_leading, ref_content].filter($is_node) as Node[])
			refs?.button?.(ref_sideBarButton)
			refs?.content?.(ref_content)
			refs?.button?.(ref_sideBarButton)
			if (ref_leading) refs?.leading?.(ref_leading)
			return ref_sideBarButton
		}
	}
}

export type SideBarProps = astroHTML.JSX.HTMLAttributes & {
	SideBarTagName    ?: string
	SideBarMinimized  ?: boolean
	SideBarContentAttr?: astroHTML.JSX.HTMLAttributes
	SideBarHeaderAttr ?: astroHTML.JSX.HTMLAttributes
	SideBarFooterAttr ?: astroHTML.JSX.HTMLAttributes
}

export type SideBarButtonProps = ButtonProps & {
	SideBarButtonSelected   ?: boolean
	SideBarButtonContentAttr?: astroHTML.JSX.HTMLAttributes
	SideBarButtonLeadingAttr?: astroHTML.JSX.HTMLAttributes
}