import { IconCodes } from "@/enums/icons"
import { isValidEnumValue } from "@/utils/object"
import { CIcon as GCIcon, type IconProps } from "../Icon"
import { $children, $classlist, $create, $is_array, $is_bool, $is_false, $is_string, $query, $rm_attr, $set_attr, $toggle_attr } from "../utils"

export namespace CButton {
	export type CElement = HTMLButtonElement

	export type UpdateOptions = {
		Button?: {
			children?: (Node | string)[] | boolean
			variant ?: Variant | boolean
			focused ?: boolean
			disabled?: boolean
			refs    ?: {
				button?(ref: CElement): unknown
			}
		}
	}

	export enum Attributes {
		variant = 'data-c-button-variant',
		focused = 'data-c-button-focused'
	}

	export enum Variant {
		filled      = 'filled',
		outlined    = 'outlined',
		tonal       = 'tonal',
		transparent = 'transparent',
	}

	export enum Classes {
		button = 'c-button',
		icon   = 'c-icon-button'
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_button = $create('button')
		return update(ref_button, options)
	}

	export function update(ref_button: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Button
		const refs = opt?.refs
		$classlist(ref_button, Classes.button)

		const opt_variant = opt?.variant
		if ($is_false(opt_variant)) {
			$rm_attr(ref_button, Attributes.variant)
		}
		else if ($is_string(opt_variant) && isValidEnumValue(opt_variant, Variant)) {
			$set_attr(ref_button, Attributes.variant, opt_variant)
		}

		const opt_focused = opt?.focused
		if (opt_focused !== undefined) {
			$toggle_attr(ref_button, Attributes.focused, opt_focused)
		}

		const opt_disabled = opt?.disabled
		if ($is_bool(opt_disabled)) {
			ref_button.disabled = opt_disabled
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_button)
		}
		else if ($is_array(opt_children)) {
			$children(ref_button, ...opt_children)
		}

		refs?.button?.(ref_button)
		return ref_button
	}

	export namespace CIcon {
		export type CElement = CButton.CElement

		type T1<U extends 'icon-needed' | null = null> = {
			Icon: GCIcon.UpdateOptions<U>['Icon'],
			refs?: {
				button?(ref: CElement): unknown
				icon  ?(ref: GCIcon.CElement): unknown
			}
		}
		export type UpdateOptions<U extends 'icon-needed' | null = null> = (
			(U extends 'icon-needed'? {IconButton: T1<U>} : {IconButton?: T1<U>}) &
			{ Button?: CButton.UpdateOptions['Button'] }
		)

		export function create(
			options: UpdateOptions<'icon-needed'>
		): CElement {
			const ref_iconButton = CButton.create(options)
			return update(ref_iconButton, options as unknown as UpdateOptions<null>)
		}

		export function update(
			ref_iconButton: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.IconButton
			const refs = opt?.refs
			CButton.update(ref_iconButton, options)
			$classlist(ref_iconButton, Classes.icon)

			const opt_icon = opt
			let ref_icon = $query<GCIcon.CElement>(
				`.${GCIcon.Classes.icon}`, ref_iconButton
			)
			if (ref_icon) {
				GCIcon.update(ref_icon, opt_icon)
			}
			else {
				ref_icon = GCIcon.create({Icon: {code: IconCodes.add as any} as any, ...opt_icon})
				$children(ref_iconButton, ref_icon)
			}

			refs?.button?.(ref_iconButton)
			refs?.icon?.(ref_icon)
			return ref_iconButton
		}
	}

	export namespace CLink {
		export type CElement = HTMLAnchorElement

		export type UpdateOptions = {
			LinkButton?: {
				children?: (Node | string)[] | boolean
				variant ?: typeof Variant | boolean
				focused ?: boolean
				href    ?: string | boolean
				newTab  ?: boolean
				refs    ?: {
					linkButton?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_linkButton = $create('a')
			return update(ref_linkButton, options)
		}

		export function update(
			ref_linkButton: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.LinkButton
			const refs = opt?.refs
			$classlist(ref_linkButton, Classes.button)

			const opt_href = opt?.href
			if ($is_false(opt_href)) {
				$rm_attr(ref_linkButton, 'href')
			}
			else if ($is_string(opt_href)) {
				ref_linkButton.href = opt_href
			}

			const opt_variant = opt?.variant
			if ($is_false(opt_variant)) {
				$rm_attr(ref_linkButton, Attributes.variant)
			}
			else if ($is_string(opt_variant) && isValidEnumValue(opt_variant, Variant)) {
				$set_attr(ref_linkButton, Attributes.variant, opt_variant)
			}

			const opt_newTab = opt?.newTab
			if (opt_newTab) {
				$set_attr(ref_linkButton, 'target', '_blank')
				$set_attr(ref_linkButton, 'rel', 'noopener noreferrer')
			}
			else if ($is_false(opt_newTab)) {
				$rm_attr(ref_linkButton, 'target')
				$rm_attr(ref_linkButton, 'rel')
			}

			const opt_focused = opt?.focused
			if ($is_bool(opt_focused)) {
				$toggle_attr(ref_linkButton, Attributes.focused, opt_focused)
			}

			const opt_children = opt?.children
			if ($is_false(opt_children)) {
				$children(ref_linkButton)
			}
			else if ($is_array(opt_children)) {
				$children(ref_linkButton, ...opt_children)
			}

			refs?.linkButton?.(ref_linkButton)
			return ref_linkButton
		}
	}

	export namespace CLinkIcon {
		export type CElement = CLink.CElement

		type T1 = 'icon-needed' | null
		type T2<T extends T1 = null> = {
			Icon: T extends 'icon-needed'
				? Omit<GCIcon.UpdateOptions['Icon'], 'code'> & {code: number}
				: GCIcon.UpdateOptions['Icon'] | undefined,
			refs?: {
				button?(ref: CElement): unknown
				icon  ?(ref: GCIcon.CElement): unknown
			}
		}

		export type UpdateOptions<T extends T1 = null> = {
			LinkButton?: Omit<CLink.UpdateOptions['LinkButton'], 'children'>
			IconButton?: T extends 'icon-needed'
				? T2<T>
				: T2<T> | undefined
		}

		export function create(
			options: UpdateOptions<'icon-needed'>
		): CElement {
			const ref_iconButton = CLink.create(options)
			return update(ref_iconButton, options as unknown as UpdateOptions<null>)
		}

		export function update(
			ref_iconButton: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.IconButton
			const refs = opt?.refs
			CLink.update(ref_iconButton, options)
			$classlist(ref_iconButton, Classes.icon)

			const opt_icon = opt
			let ref_icon = $query<GCIcon.CElement>(
				`.${GCIcon.Classes.icon}`, ref_iconButton
			)
			if (ref_icon) {
				GCIcon.update(ref_icon, opt_icon)
			}
			else {
				ref_icon = GCIcon.create({Icon: {icon: IconCodes.add as any} as any, ...opt_icon})
				$children(ref_iconButton, ref_icon)
			}

			refs?.button?.(ref_iconButton)
			refs?.icon?.(ref_icon)
			return ref_iconButton
		}
	}
}


export type ButtonProps = astroHTML.JSX.ButtonHTMLAttributes & {
	ButtonVariant?: CButton.Variant
	ButtonFocused?: boolean
}

export type IconButtonProps = ButtonProps & {
	IconButtonCode     : number
	IconButtonFilled  ?: boolean
	IconButtonIconAttr?: Omit<IconProps, 'IconCode'> & {
		IconCode?: number
	}
}

export type LinkButtonProps = astroHTML.JSX.AnchorHTMLAttributes & {
	LinkButtonVariant?: CButton.Variant
	LinkButtonFocused?: boolean
	LinkButtonNewTab ?: boolean
}

export type LinkIconButtonProps = LinkButtonProps & {
	LinkIconButtonCode     : number
	LinkIconButtonFilled  ?: boolean
	LinkIconButtonIconAttr?: Omit<IconProps, 'IconCode'> & {
		IconCode?: number
	}
}