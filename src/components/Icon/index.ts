import { $classlist, $create, $is_bool, $toggle_attr } from "../utils"

export namespace CIcon {
	export type CElement = HTMLElement

	type T1 = 'icon-needed' | null
	type T2<U extends T1 = null> = (U extends 'icon-needed'? {code: number} : {code?: number}) & {
		filled?: boolean
		inline?: boolean
		refs?: {
			icon?(ref: CElement): unknown
		}
	}
	export type UpdateOptions<U extends T1 = null> = {
		Icon: U extends 'icon-needed'? T2<U> : (T2<U> | undefined)
	}

	export enum Attributes {
		inline = 'data-c-icon-inline'
	}

	export enum Classes {
		icon = 'c-icon',
	}

	export function create(
		options: UpdateOptions<'icon-needed'>
	): CElement {
		const ref_icon = $create('i')
		return update(ref_icon, options as unknown as UpdateOptions<null>)
	}

	export function update(ref_icon: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Icon
		$classlist(ref_icon, Classes.icon)
		ref_icon.translate = false

		const opt_inline = opt?.inline
		if ($is_bool(opt_inline)) {
			$toggle_attr(ref_icon, Attributes.inline, opt_inline)
		}

		const opt_filled = opt?.filled
		const iconText = ref_icon.textContent!.trim()
		if ($is_bool(opt_filled) && iconText && iconText.length > 0) {
			const code = iconText.charCodeAt(0)
			ref_icon.textContent = String.fromCharCode(code + (opt_filled? -1 : 1))
		}

		const opt_code = opt?.code
		if (opt_code !== undefined) {
			ref_icon.textContent = String.fromCharCode(opt_code - (opt_filled? 1 : 0))
		}

		opt?.refs?.icon?.(ref_icon)
		return ref_icon
	}
}

export type IconProps = astroHTML.JSX.HTMLAttributes & {
	IconCode   : number
	IconFilled?: boolean
	IconInline?: boolean
}