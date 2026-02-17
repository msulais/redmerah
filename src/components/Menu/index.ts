import {
	CPopover as GCPopover,
	type PopoverProps,
} from "@/components/Popover"
import {
	CButton as GCButton,
	type ButtonProps,
	type LinkButtonProps
} from "@/components/Button"
import { CIcon as GCIcon, type IconProps } from "@/components/Icon"
import { AppCSSColors } from "@/enums/app-data"
import { createElementId } from "@/utils/ids"
import { IconCodes } from "@/enums/icons"
import { $classlist, $has_attr, $set_attr, $is_false, $rm_attr, $is_string, $query, $create, $children, $is_array, $add_event, $is_bool, $query_all } from "../utils"

export namespace CMenu {
	export type CElement = GCPopover.CElement
	export type UpdateOptions = GCPopover.UpdateOptions & {
		Menu?: {
			children?: (string | Node)[] | boolean
			role    ?: astroHTML.JSX.AriaRole | boolean
			refs    ?: {
				menu    ?(ref: CElement   ): unknown
				content ?(ref: HTMLDivElement): unknown
			}
		}
	}

	export enum Classes {
		Menu             = 'c-menu',
		Content          = Menu + '-content',
		Header           = Menu + '-header',
		Item             = Menu + '-item',
		Indent           = Menu + '-indent',
		RadioItem        = Menu + '-radio-item',
		Submenu          = Menu + '-submenu',
		CheckItem        = Menu + '-check-item',
		SubmenuItem      = Submenu + '-item',
		RadioItemLeading = RadioItem + '-leading',
		RadioItemIcon    = RadioItem + '-icon',
		RadioItemInput   = RadioItem + '-input',
		RadioItemContent = RadioItem + '-content',
		CheckItemLeading = CheckItem + '-leading',
		CheckItemInput   = CheckItem + '-input',
		CheckItemIcon    = CheckItem + '-icon',
		CheckItemContent = CheckItem + '-content'
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_menu = GCPopover.create(options)
		return update(ref_menu)
	}

	export function update(ref_menu: CElement, options?: UpdateOptions): CElement {
		let ref_popoverContent: HTMLDivElement
		const opt = options?.Menu
		const popover = options?.Popover
		GCPopover.update(ref_menu, {
			Popover: {
				...popover,
				refs: {
					...popover?.refs,
					content(ref) {
						ref_popoverContent = ref
						popover?.refs?.content?.(ref)
					},
				}
			},
		})

		$classlist(ref_menu, Classes.Menu)
		if (!$has_attr(ref_menu, 'role')) {
			$set_attr(ref_menu, 'role', 'menu')
		}

		const opt_role = opt?.role
		if ($is_false(opt_role)) {
			$rm_attr(ref_menu, 'role')
		}
		else if ($is_string(opt_role)) {
			$set_attr(ref_menu, 'role', opt_role)
		}

		// content
		const opt_children = opt?.children
		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_popoverContent!)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		$children(ref_popoverContent!, ref_content)
		const refs = opt?.refs
		refs?.menu?.(ref_menu)
		refs?.content?.(ref_content)
		return ref_menu
	}

	export namespace CSub {
		export type CElement = GCPopover.CElement
		export type UpdateOptions = CMenu.UpdateOptions

		export function create(options?: UpdateOptions): CElement {
			const ref_submenu = $create('div')
			return update(ref_submenu, options)
		}

		export function update(ref_submenu: CElement, options?: UpdateOptions): CElement {
			CMenu.update(ref_submenu, options)
			$classlist(ref_submenu, Classes.Submenu)
			return ref_submenu
		}
	}

	export namespace CSubItem {
		export type CElement = CItem.CElement
		export type UpdateOptions = CItem.UpdateOptions & {
			SubMenuItem?: {
				popoverId?: string
				refs     ?: {
					submenuitem?(ref: CElement): unknown
				}
			},
		}

		const REGISTERED_SUBMENUITEM: Set<CElement> = new Set<CElement>()

		/**
		 * Any element is possible as long have class `Classes.submenuItem`
		 * @param ref_submenuitem
		 */
		function initSubMenuItem(ref_submenuitem: CElement): void {
			const elements = {
				get parent() {
					return ref_submenuitem.closest('.' + Classes.Menu) as CSub.CElement | null
				},
				get target() {
					return ref_submenuitem.popoverTargetElement as CSub.CElement | null
				}
			}

			function initEvents(): void {
				const ref_parent = elements.parent
				$add_event<ToggleEvent>(ref_parent, 'beforetoggle', ev => {
					const isOpen = ev.newState === 'open'
					if (isOpen) {return}

					for (const ref of $query_all<CSub.CElement>(`.${Classes.Submenu}`, ref_parent!)) {
						ref.hidePopover()
					}
				})

				const ref_target = elements.target
				$add_event<ToggleEvent>(ref_target, 'beforetoggle', ev => {
					const isOpen = ev.newState === 'open'
					update(ref_submenuitem, {Button: {focused: isOpen}})

					if (!isOpen || !ref_parent) {return}

					for (const ref of $query_all<CSub.CElement>(`.${Classes.Submenu}`, ref_parent)) {
						if (ref === ref_target) {continue}
						ref.hidePopover()
					}
				})
			}

			function initSubMenuItemId(): void {
				let id = ref_submenuitem.id
				if (!id) {
					id = createElementId()
					ref_submenuitem.id = id
				}

				const target = elements.target
				if (!target) {return}

				CSub.update(target, {Popover: {anchorBy: id}})
			}

			initSubMenuItemId()
			initEvents()
		}

		export function create(options: Omit<UpdateOptions, 'SubMenuItemPopoverId'> & {
			SubMenuItemPopoverId: string
		}): CElement {
			const ref_submenuitem = update(CItem.create(options))
			register(ref_submenuitem)
			return ref_submenuitem
		}

		export function update(
			ref_submenuitem: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.SubMenuItem
			CItem.update(ref_submenuitem, options)
			$classlist(ref_submenuitem, Classes.SubmenuItem)
			const opt_popoverId = opt?.popoverId
			if (opt_popoverId) {
				$set_attr(ref_submenuitem, 'popovertarget', opt_popoverId)
			}

			const refs = opt?.refs
			refs?.submenuitem?.(ref_submenuitem)
			return ref_submenuitem
		}

		export function register(...refs_submenuitem: CElement[]): void {
			if (refs_submenuitem.length === 0) {
				refs_submenuitem = [...$query_all<CElement>('.' + Classes.SubmenuItem)]
			}

			for (const ref of refs_submenuitem){
				if (REGISTERED_SUBMENUITEM.has(ref)) {
					continue
				}

				REGISTERED_SUBMENUITEM.add(ref)
				initSubMenuItem(ref)
			}
		}

		export function unregister(...refs_submenuitem: CElement[]): void {
			for (const ref of refs_submenuitem) {
				REGISTERED_SUBMENUITEM.delete(ref)
			}
		}
	}

	export namespace CItem {
		export type CElement = GCButton.CElement
		export type UpdateOptions = GCButton.UpdateOptions & {
			MenuItem?: {
				role?: astroHTML.JSX.AriaRole | boolean
				refs?: {
					menuitem?(ref: CElement): unknown
				}
			},
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_menuitem = GCButton.create(options)
			return update(ref_menuitem)
		}

		export function update(ref_menuitem: CElement, options?: UpdateOptions): CElement {
			const opt = options?.MenuItem
			GCButton.update(ref_menuitem, options)
			$classlist(ref_menuitem, Classes.Item)
			if (!$has_attr(ref_menuitem, 'role')) {
				$set_attr(ref_menuitem, 'role', 'menuitem')
			}

			const opt_role = opt?.role
			if ($is_false(opt_role)) {
				$rm_attr(ref_menuitem, 'role')
			}
			else if ($is_string(opt_role)) {
				$set_attr(ref_menuitem, 'role', opt_role)
			}

			const refs = opt?.refs
			refs?.menuitem?.(ref_menuitem)
			return ref_menuitem
		}
	}

	export namespace CCheckItem {
		export type CElement = HTMLLabelElement
		export type UpdateOptions = {
			CheckMenuItem?: {
				checked ?: boolean
				disabled?: boolean
				leading ?: (string | Node[]) | boolean
				children?: (string | Node[]) | boolean
				refs    ?: {
					checkmenuitem?(ref: CElement      ): unknown
					leading      ?(ref: HTMLDivElement): unknown
					icon         ?(ref: SVGSVGElement ): unknown
					content      ?(ref: HTMLDivElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_checkmenuitem = $create('label')
			return update(ref_checkmenuitem, options)
		}

		export function update(ref_checkmenuitem: CElement, options?: UpdateOptions): CElement {
			const opt = options?.CheckMenuItem
			const refs = opt?.refs
			$classlist(ref_checkmenuitem, GCButton.Classes.Button, Classes.Item, Classes.CheckItem)

			// leading
			const opt_leading = opt?.leading
			let ref_leading = $query<HTMLDivElement>(`.${Classes.CheckItemLeading}`, ref_checkmenuitem)
			if (!ref_leading) {
				ref_leading = $create('div')
				$classlist(ref_leading, Classes.CheckItemLeading)
			}
			if ($is_false(opt_leading)) {
				$children(ref_leading)
			}
			else if ($is_array(opt_leading)) {
				$children(ref_leading, ...opt_leading)
			}

			// input
			let ref_input = $query<HTMLInputElement>(`.${Classes.CheckItemInput}`, ref_checkmenuitem)
			if (!ref_input) {
				ref_input = $create('input')
				$classlist(ref_input, Classes.CheckItemInput)
				ref_input.autocomplete = 'off'
				ref_input.role = 'menuitemcheckbox'
				ref_input.type = 'checkbox'
			}

			const opt_checked = opt?.checked
			if ($is_bool(opt_checked)) {
				ref_input.checked = opt_checked
			}

			const opt_disabled = opt?.disabled
			if ($is_bool(opt_disabled)) {
				ref_input.disabled = opt_disabled
			}

			// icon
			let ref_icon = $query<SVGSVGElement>('.' + Classes.CheckItemIcon, ref_checkmenuitem)
			if (!ref_icon) {
				ref_icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
				$classlist(ref_icon, Classes.CheckItemIcon)
				$set_attr(ref_icon, 'viewBox', '0 -960 960 960')
				$set_attr(ref_icon, 'width', '20')
				$set_attr(ref_icon, 'height', '20')

				const ref_path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
				$set_attr(ref_path, 'd', 'm389-369 299-299q10.91-11 25.45-11Q728-679 739-668t11 25.58q0 14.58-10.61 25.19L415-292q-10.91 11-25.45 11Q375-281 364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.67-11 14.66 0 25.33 11l117 117Z')
				$set_attr(ref_path, 'fill', `rgb(${AppCSSColors.Accent})`)
				ref_icon.append(ref_path)
			}

			// content
			const opt_children = opt?.children
			let ref_content = $query<HTMLDivElement>(`.${Classes.CheckItemContent}`, ref_checkmenuitem)
			if (!ref_content) {
				ref_content = $create('div')
				$classlist(ref_content, Classes.CheckItemContent)
			}
			if ($is_false(opt_children)) {
				$children(ref_content)
			}
			else if ($is_array(opt_children)) {
				$children(ref_content, ...opt_children)
			}

			$children(ref_checkmenuitem, ref_leading, ref_input, ref_icon, ref_content)
			refs?.checkmenuitem?.(ref_checkmenuitem)
			refs?.content?.(ref_content)
			refs?.icon?.(ref_icon)
			refs?.leading?.(ref_leading)
			return ref_checkmenuitem
		}
	}

	export namespace CRadioItem {
		export type CElement = HTMLLabelElement
		export type UpdateOptions = {
			RadioMenuItem?: {
				checked ?: boolean
				disabled?: boolean
				name    ?: string
				value   ?: string
				leading ?: (string | Node[]) | boolean
				children?: (string | Node[]) | boolean
				refs    ?: {
					radiomenuitem?(ref: CElement): unknown
					leading      ?(ref: HTMLDivElement): unknown
					icon         ?(ref: GCIcon.CElement): unknown
					content      ?(ref: HTMLDivElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_radiomenuitem = $create('label')
			return update(ref_radiomenuitem, options)
		}

		export function update(ref_radiomenuitem: CElement, options?: UpdateOptions): CElement {
			const opt = options?.RadioMenuItem
			$classlist(ref_radiomenuitem, GCButton.Classes.Button, Classes.Item, Classes.RadioItem)

			// leading
			const opt_leading = opt?.leading
			let ref_leading = $query<HTMLDivElement>(`.${Classes.RadioItemLeading}`, ref_radiomenuitem)
			if (!ref_leading) {
				ref_leading = $create('div')
				$classlist(ref_leading, Classes.RadioItemLeading)
			}
			if ($is_false(opt_leading)) {
				$children(ref_leading)
			}
			else if ($is_array(opt_leading)) {
				$children(ref_leading, ...opt_leading)
			}

			// input
			let ref_input = $query<HTMLInputElement>(`.${Classes.RadioItemInput}`, ref_radiomenuitem)
			if (!ref_input) {
				ref_input = $create('input')
				$classlist(ref_input, Classes.RadioItemInput)
				$set_attr(ref_input, 'role', 'menuitemradio')
				$set_attr(ref_input, 'type', 'radio')
				$set_attr(ref_input, 'autocomplete', 'off')
			}

			const opt_name = opt?.name
			if (opt_name) {
				ref_input.name = opt_name
			}

			const opt_value = opt?.value
			if (opt_value) {
				ref_input.value = opt_value
			}

			const opt_checked = opt?.checked
			if ($is_bool(opt_checked)) {
				ref_input.checked = opt_checked
			}

			const opt_disabled = opt?.disabled
			if ($is_bool(opt_disabled)) {
				ref_input.disabled = opt_disabled
			}

			// icon
			let ref_icon = $query<GCIcon.CElement>(`.${Classes.RadioItemIcon}`, ref_radiomenuitem)
			if (!ref_icon) {
				ref_icon = GCIcon.create({Icon: {
					code: IconCodes.CircleSmallFilled,
				}})
				$classlist(ref_icon, Classes.RadioItemIcon)
			}

			// content
			const opt_children = opt?.children
			let ref_content = $query<HTMLDivElement>(`.${Classes.RadioItemContent}`, ref_radiomenuitem)
			if (!ref_content) {
				ref_content = $create('div')
				$classlist(ref_content, Classes.RadioItemContent)
			}
			if ($is_false(opt_children)) {
				$children(ref_content)
			}
			else if ($is_array(opt_children)) {
				$children(ref_content, ...opt_children)
			}

			$children(ref_radiomenuitem, ref_leading, ref_input, ref_icon, ref_content)
			const refs = opt?.refs
			refs?.content?.(ref_content)
			refs?.icon?.(ref_icon)
			refs?.leading?.(ref_leading)
			refs?.radiomenuitem?.(ref_radiomenuitem)
			return ref_radiomenuitem
		}
	}

	export namespace CLinkItem {
		export type CElement = GCButton.CLink.CElement
		export type UpdateOptions = GCButton.CLink.UpdateOptions & {
			LinkMenuItem?: {
				role?: astroHTML.JSX.AriaRole | boolean
				refs?: {
					linkmenuitem?(ref: CElement): unknown
				}
			}
		}

		export function create(options: UpdateOptions): CElement {
			const ref_linkmenuitem = GCButton.CLink.create(options)
			return update(ref_linkmenuitem, options)
		}

		export function update(ref_linkmenuitem: CElement, options: UpdateOptions): CElement {
			const opt = options.LinkMenuItem
			GCButton.CLink.update(ref_linkmenuitem, options)
			$classlist(ref_linkmenuitem, Classes.Item)
			if (!$has_attr(ref_linkmenuitem, 'role')) {
				$set_attr(ref_linkmenuitem, 'role', 'menuitem')
			}

			const opt_role = opt?.role
			if ($is_false(opt_role)) {
				$rm_attr(ref_linkmenuitem, 'role')
			}
			else if ($is_string(opt_role)) {
				$set_attr(ref_linkmenuitem, 'role', opt_role)
			}

			const refs = opt?.refs
			refs?.linkmenuitem?.(ref_linkmenuitem)
			return ref_linkmenuitem
		}
	}

	export namespace CHeader {
		export type CElement = HTMLDivElement
		export type UpdateOptions = {
			MenuHeader?: {
				children?: (string | Node)[] | boolean
				refs    ?: {
					header?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_menuheader = $create('div')
			return update(ref_menuheader, options)
		}

		export function update(ref_menuheader: CElement, options?: UpdateOptions): CElement {
			const opt = options?.MenuHeader
			$classlist(ref_menuheader, Classes.Header)

			const opt_children = opt?.children
			if ($is_false(opt_children)) {
				$children(ref_menuheader)
			}
			else if ($is_array(opt_children)) {
				$children(ref_menuheader, ...opt_children)
			}

			const refs = opt?.refs
			refs?.header?.(ref_menuheader)
			return ref_menuheader
		}
	}

	export namespace CIndent {
		export type CElement = HTMLDivElement
		export type UpdateOptions = {
			MenuIndent?: {
				refs?: {
					indent?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_indent = $create('div')
			return update(ref_indent, options)
		}

		export function update(ref_indent: CElement, options?: UpdateOptions): CElement {
			$classlist(ref_indent, Classes.Indent)
			options?.MenuIndent?.refs?.indent?.(ref_indent)
			return ref_indent
		}
	}
}

export type MenuProps = PopoverProps & {
	MenuContentAttr ?: astroHTML.JSX.HTMLAttributes
}

export type SubMenuProps = MenuProps

export type MenuItemProps = ButtonProps
export type LinkMenuItemProps = LinkButtonProps
export type MenuHeaderProps = astroHTML.JSX.HTMLAttributes

export type SubMenuItemProps = Omit<MenuItemProps, 'popovertarget'> & {
	'popovertarget': string
}

export type MenuIndentProps = astroHTML.JSX.HTMLAttributes

export type RadioMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	RadioMenuItemChecked    ?: boolean
	RadioMenuItemDisabled   ?: boolean
	RadioMenuItemName       ?: string
	RadioMenuItemValue      ?: string
	RadioMenuItemLeadingAttr?: astroHTML.JSX.HTMLAttributes
	RadioMenuItemInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	RadioMenuItemIconAttr   ?: IconProps
	RadioMenuItemContentAttr?: astroHTML.JSX.HTMLAttributes
}

export type CheckMenuItemProps = astroHTML.JSX.LabelHTMLAttributes & {
	CheckMenuItemChecked    ?: boolean
	CheckMenuItemDisabled   ?: boolean
	CheckMenuItemLeadingAttr?: astroHTML.JSX.HTMLAttributes
	CheckMenuItemInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	CheckMenuItemIconAttr   ?: astroHTML.JSX.SVGAttributes
	CheckMenuItemContentAttr?: astroHTML.JSX.HTMLAttributes
}