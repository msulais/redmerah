import { $create } from "../utils"

export namespace CDivider {
	export type CElement = HTMLDivElement

	export type UpdateOptions = {
		Divider?: {
			refs?: {
				divider?(ref: CElement): unknown
			}
		}
	}

	export enum Classes {
		Divider = 'c-divider'
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_divider = $create('div')
		return update(ref_divider, options)
	}

	export function update(ref_divider: CElement, options?: UpdateOptions): CElement {
		options?.Divider?.refs?.divider?.(ref_divider)
		return ref_divider
	}
}

export type DividerProps = astroHTML.JSX.HTMLAttributes