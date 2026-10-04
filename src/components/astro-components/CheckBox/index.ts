import { $children, $classlist, $create, $is_array, $is_bool, $is_false, $query, $set_attr } from "../utils"

export namespace CCheckBox {
	export type CElement = HTMLLabelElement
	export type UpdateOptions = {
		CheckBox?: {
			children?: (string | Node)[] | boolean
			disabled?: boolean
			checked ?: boolean
			refs    ?: {
				checkbox?(ref: CElement        ): unknown
				input   ?(ref: HTMLInputElement): unknown
				icon    ?(ref: SVGSVGElement   ): unknown
				content ?(ref: HTMLDivElement  ): unknown
			}
		}
	}

	export enum Classes {
		Checkbox = 'c-checkbox',
		Input    = Checkbox + '-input',
		Icon     = Checkbox + '-icon',
		Content  = Checkbox + '-content'
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_checkbox = $create('label')
		return update(ref_checkbox, options)
	}

	export function update(
		ref_checkbox: CElement,
		options?: UpdateOptions
	): CElement {
		const opt = options?.CheckBox
		const refs = opt?.refs
		$classlist(ref_checkbox, Classes.Checkbox)

		// input
		let ref_input = $query<HTMLInputElement>('.' + Classes.Input, ref_checkbox)
		if (!ref_input) {
			ref_input = $create('input')
			ref_input.type = 'checkbox'
			$classlist(ref_input, Classes.Input)
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
		let ref_icon = $query<SVGSVGElement>('.' + Classes.Icon, ref_checkbox)
		if (!ref_icon) {
			ref_icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			$classlist(ref_icon, Classes.Icon)
			$set_attr(ref_icon, 'viewBox', '0 -960 960 960')

			const ref_path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			$set_attr(ref_path, 'd', 'm389-369 299-299q10.91-11 25.45-11Q728-679 739-668t11 25.58q0 14.58-10.61 25.19L415-292q-10.91 11-25.45 11Q375-281 364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.67-11 14.66 0 25.33 11l117 117Z')
			ref_icon.append(ref_path)
		}

		// content
		let ref_content = $query<HTMLDivElement>('.' + Classes.Content, ref_checkbox)
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

		$children(ref_checkbox, ref_input, ref_icon, ref_content)
		refs?.checkbox?.(ref_checkbox)
		refs?.input?.(ref_input)
		refs?.icon?.(ref_icon)
		refs?.content?.(ref_content)
		return ref_checkbox
	}
}

export type CheckBoxProps = astroHTML.JSX.LabelHTMLAttributes & {
	CheckBoxChecked    ?: boolean
	CheckBoxInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	CheckBoxIconAttr   ?: astroHTML.JSX.SVGAttributes
	CheckBoxContentAttr?: astroHTML.JSX.HTMLAttributes
}