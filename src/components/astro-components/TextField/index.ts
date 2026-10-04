import { CButton as GCButton, type ButtonProps } from "../Button"

type Nullable<T> = T | null
const $is_string = (e: any) => typeof e === 'string'
const $is_array = (e: any) => Array.isArray(e)
const $is_false = (e: any) => e === false
const $is_bool = (e: any) => typeof e === 'boolean'
const $query = (
	<T extends HTMLElement>(selector: string, from?: Element) =>
	(from ?? document).querySelector<T>(selector)
)
const $create = (
	<T extends keyof HTMLElementTagNameMap>(tagName: T) =>
	document.createElement(tagName)
)
const $children = (
	(ref?: Nullable<Element>, ...children: (Node | string)[]) =>
	ref?.replaceChildren(...children)
)
const $classlist = (
	(ref?: Nullable<Element>, ...classes: string[]) =>
	ref?.classList.add(...classes)
)

export namespace CTextField {
	export type CElement = HTMLDivElement
	export type UpdateOptions = {
		TextField?: {
			leading    ?: (string | Node)[] | boolean
			trailing   ?: (string | Node)[] | boolean
			readOnly   ?: boolean
			type       ?: astroHTML.JSX.HTMLInputTypeAttribute
			placeholder?: string | boolean
			value      ?: string | boolean
			refs       ?: {
				textfield?(ref: CElement): unknown
				leading  ?(ref: HTMLDivElement  ): unknown
				trailing ?(ref: HTMLDivElement  ): unknown
				input    ?(ref: HTMLInputElement): unknown
			}
		}
	}

	export enum Classes {
		Textfield = 'c-textfield',
		Leading   = Textfield + '-leading',
		Input     = Textfield + '-input',
		Trailing  = Textfield + '-trailing',
		Button    = Textfield + '-button'
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_textfield = $create('div')
		return update(ref_textfield, options)
	}

	export function update(
		ref_textfield: CElement,
		options?: UpdateOptions
	): CElement {
		const opt = options?.TextField
		const refs = opt?.refs
		$classlist(ref_textfield, Classes.Textfield)

		// leading
		let ref_leading = $query<HTMLDivElement>(`.${Classes.Leading}`, ref_textfield)
		if (!ref_leading) {
			ref_leading = $create('div')
			$classlist(ref_leading, Classes.Leading)
		}

		const opt_leading = opt?.leading
		if ($is_false(opt_leading)) {
			$children(ref_leading)
		}
		else if ($is_array(opt_leading)) {
			$children(ref_leading, ...opt_leading)
		}

		// input
		let ref_input = $query<HTMLInputElement>(`.${Classes.Input}`, ref_textfield)
		if (!ref_input) {
			ref_input = $create('input')
			$classlist(ref_input, Classes.Input)
		}

		const opt_type = opt?.type
		if ($is_string(opt_type)) {
			ref_input.type = opt_type
		}

		const opt_readonly = opt?.readOnly
		if ($is_bool(opt_readonly)) {
			ref_input.readOnly = opt_readonly
		}

		const opt_placeholder = opt?.placeholder
		if ($is_false(opt_placeholder)) {
			ref_input.placeholder = ''
		}
		else if ($is_string(opt_placeholder)) {
			ref_input.placeholder = opt_placeholder
		}

		const opt_value = opt?.value
		if ($is_false(opt_value)) {
			ref_input.value = ''
		}
		else if ($is_string(opt_value)) {
			ref_input.value = opt_value
		}

		// trailing
		let ref_trailing = $query<HTMLDivElement>(`.${Classes.Trailing}`, ref_textfield)
		if (!ref_trailing) {
			ref_trailing = $create('div')
			$classlist(ref_trailing, Classes.Trailing)
		}

		const opt_trailing = opt?.trailing
		if ($is_false(opt_trailing)) {
			$children(ref_trailing)
		}
		else if ($is_array(opt_trailing)) {
			$children(ref_trailing, ...opt_trailing)
		}

		$children(ref_textfield, ref_leading, ref_input, ref_trailing)
		refs?.input?.(ref_input)
		refs?.leading?.(ref_leading)
		refs?.textfield?.(ref_textfield)
		refs?.trailing?.(ref_trailing)
		return ref_textfield
	}

	export namespace CButton {
		export type CElement = GCButton.CElement
		export type UpdateOptions = GCButton.UpdateOptions

		export function create(options?: UpdateOptions): CElement {
			const ref_textfieldBtn = document.createElement('button')
			return update(ref_textfieldBtn, options)
		}

		export function update(
			ref_textfieldBtn: CElement,
			options?: UpdateOptions
		): CElement {
			GCButton.update(ref_textfieldBtn, options)
			$classlist(ref_textfieldBtn, Classes.Button)
			return ref_textfieldBtn
		}
	}
}

export type TextFieldButtonProps = ButtonProps

export type TextFieldProps = astroHTML.JSX.HTMLAttributes & {
	TextFieldInputAttr   ?: astroHTML.JSX.InputHTMLAttributes
	TextFieldLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	TextFieldTrailingAttr?: astroHTML.JSX.HTMLAttributes
}