import { isValidEnumValue } from "@/utils/object"
import { CButton as GCButton } from "../Button"
import { $children, $classlist, $create, $is_array, $is_false, $set_attr } from "../utils"

export namespace CComboBox {
	export type CElement = HTMLSelectElement

	export type UpdateOptions = {
		ComboBox?: {
			variant?: Variant
			children?: (string | Node)[] | boolean
			refs?: {
				combobox?(ref: CElement): unknown
			}
		}
	}

	export enum Classes {
		combobox = 'c-combobox',
		option = combobox + '-option'
	}

	export enum Attributes {
		variant = 'data-c-combobox-variant'
	}

	export enum Variant {
		filled = 'filled',
		outlined = 'outlined',
		tonal = 'tonal',
		transparent = 'transparent',
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_combobox = $create('select')
		return update(ref_combobox, options)
	}

	export function update(ref_combobox: CElement, options?: UpdateOptions): CElement {
		const opt = options?.ComboBox
		$classlist(ref_combobox, Classes.combobox)

		if (!ref_combobox.hasAttribute('autocomplete')) {
			$set_attr(ref_combobox, 'autocomplete', 'off')
		}

		const opt_variant = opt?.variant
		if (opt_variant && isValidEnumValue(opt_variant, Variant)) {
			$set_attr(ref_combobox, Attributes.variant, opt_variant)
		}

		// children
		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_combobox)
		}
		else if ($is_array(opt_children)) {
			$children(ref_combobox, ...opt_children)
		}

		const refs = opt?.refs
		refs?.combobox?.(ref_combobox)
		return ref_combobox
	}

	export namespace COption {
		export type CElement = HTMLOptionElement

		export type UpdateOptions = {
			Option?: {
				children?: (string | Node)[] | boolean
				refs?: {
					option?(ref: CElement): unknown
				}
			}
		}

		export function create(options?: UpdateOptions): CElement {
			const ref_option = $create('option')
			return update(ref_option, options)
		}

		export function update(
			ref_option: CElement,
			options?: UpdateOptions
		): CElement {
			const opt = options?.Option
			$classlist(ref_option, GCButton.Classes.button, Classes.option)

			// children
			const opt_children = opt?.children
			if ($is_false(opt_children)) {
				$children(ref_option)
			}
			else if ($is_array(opt_children)) {
				$children(ref_option, ...opt_children)
			}

			const refs = opt?.refs
			refs?.option?.(ref_option)
			return ref_option
		}
	}
}

export type ComboBoxOptionProps = astroHTML.JSX.OptionHTMLAttributes

export type ComboBoxProps = astroHTML.JSX.SelectHTMLAttributes & {
	ComboBoxVariant?: CComboBox.Variant
}