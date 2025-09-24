import { $classlist, $create } from "../utils"

export namespace CTextAreaField {
	export type CElement = HTMLTextAreaElement
	export type UpdateOption = {
		TextAreaField?: {
			value?: string
			refs?: {
				textareafield?: (ref: CElement) => unknown
			}
		}
	}

	export enum Classes {
		textareafield = 'c-textareafield'
	}

	export function create(options?: UpdateOption): CElement {
		const ref_textareafield = $create('textarea')
		return update(ref_textareafield, options)
	}

	export function update(ref_textareafield: CElement, options?: UpdateOption): CElement {
		const opt = options?.TextAreaField
		$classlist(ref_textareafield, Classes.textareafield)

		const opt_value = opt?.value
		if (typeof opt_value === 'string') {
			ref_textareafield.value = opt_value
		}

		const refs = opt?.refs
		refs?.textareafield?.(ref_textareafield)
		return ref_textareafield
	}
}

export type TextAreaFieldProps = astroHTML.JSX.TextareaHTMLAttributes