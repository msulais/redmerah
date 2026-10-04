import { isValidEnumValue } from "@/utils/object"
import { $children, $classlist, $create, $is_array, $is_false, $is_string, $query, $rm_attr, $set_attr } from "../utils"

export namespace CList {
	export type CElement<T extends HTMLElement = HTMLDivElement> = T
	export type UpdateOptions<T extends HTMLElement = CElement, U extends 'with-tagname' | null = null> = {
		List?: (U extends 'with-tagname'? {tagname?: keyof HTMLElementTagNameMap} : {}) & {
			leading    ?: (Node | string)[] | boolean
			children   ?: (Node | string)[] | boolean
			subtitle   ?: (Node | string)[] | boolean
			trailing   ?: (Node | string)[] | boolean
			variant    ?: Variant | boolean
			refs       ?: {
				list    ?(ref: T             ): unknown
				content ?(ref: HTMLDivElement): unknown
				subtitle?(ref: HTMLDivElement): unknown
				leading ?(ref: HTMLDivElement): unknown
				trailing?(ref: HTMLDivElement): unknown
			}
		}
	}

	export enum Classes {
		List     = 'c-list',
		Leading  = List + '-leading',
		Trailing = List + '-trailing',
		Content  = List + '-content',
		Subtitle = List + '-subtitle'
	}

	export enum Variant {
		Transparent = 'transparent',
		Tonal       = 'tonal',
		Filled      = 'filled',
		Outlined    = 'outlined'
	}

	enum Attributes {
		Variant = 'data-c-list-variant'
	}

	export function create<T extends HTMLElement = CElement>(
		options?: UpdateOptions<T, 'with-tagname'>
	): T {
		const ref_list = $create(options?.List?.tagname ?? 'div') as T
		return update(ref_list, options)
	}

	export function update<T extends HTMLElement = CElement>(ref_list: T, options?: UpdateOptions<T>): T {
		const opt = options?.List
		const refs = opt?.refs
		$classlist(ref_list, Classes.List)

		const opt_variant = opt?.variant
		if ($is_false(opt_variant)) {
			$rm_attr(ref_list, Attributes.Variant)
		}
		else if ($is_string(opt_variant) && isValidEnumValue(opt_variant, Variant)) {
			$set_attr(ref_list, Attributes.Variant, opt_variant)
		}

		// leading
		const opt_leading = opt?.leading
		let ref_leading = $query<HTMLDivElement>(`.${Classes.Leading}`, ref_list)
		if ($is_false(opt_leading)) {
			$children(ref_leading)
		}
		else if ($is_array(opt_leading)) {
			if (!ref_leading) {
				ref_leading = $create('div')
				$classlist(ref_leading, Classes.Leading)
			}

			$children(ref_leading, ...opt_leading)
		}

		// content
		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_list)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}

		// content -> subtitle
		const opt_subtitle = opt?.subtitle
		let ref_subtitle = $query<HTMLDivElement>(`.${Classes.Subtitle}`, ref_content)
		if ($is_false(opt_subtitle)) {
			$children(ref_subtitle)
		}
		else if ($is_array(opt_subtitle)) {
			if (!ref_subtitle) {
				ref_subtitle = $create('div')
				$classlist(ref_subtitle, Classes.Subtitle)
			}

			$children(ref_subtitle, ...opt_subtitle)
		}

		// content -> children
		const refs_children: (Node | string)[] = []
		for (const node of ref_content.childNodes) {
			if (ref_subtitle && node === ref_subtitle) continue

			refs_children.push(node)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			refs_children.length = 0
		}
		else if ($is_array(opt_children)) {
			refs_children.length = 0
			refs_children.push(...opt_children)
		}

		$children(ref_content, ...[...refs_children, ref_subtitle].filter(
			v => typeof v === 'string' || v instanceof Node
		))

		// trailing
		const opt_trailing = opt?.trailing
		let ref_trailing = $query<HTMLDivElement>(`.${Classes.Trailing}`, ref_list)
		if ($is_false(opt_trailing)) {
			$children(ref_trailing)
		}
		else if ($is_array(opt_trailing)) {
			if (!ref_trailing) {
				ref_trailing = $create('div')
				$classlist(ref_trailing, Classes.Trailing)
			}

			$children(ref_trailing, ...opt_trailing)
		}

		$children(ref_list, ...[ref_leading, ref_content, ref_trailing].filter(
			v => typeof v === 'string' || v instanceof Node
		))
		refs?.list?.(ref_list)
		refs?.content?.(ref_content)
		if (ref_leading) refs?.leading?.(ref_leading)
		if (ref_subtitle) refs?.subtitle?.(ref_subtitle)
		if (ref_trailing) refs?.trailing?.(ref_trailing)
		return ref_list
	}
}

export type ListProps = astroHTML.JSX.HTMLAttributes & {
	ListTagName     ?: string
	ListVariant     ?: CList.Variant
	ListContentAttr ?: astroHTML.JSX.HTMLAttributes
	ListLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	ListTrailingAttr?: astroHTML.JSX.HTMLAttributes
	ListSubtitleAttr?: astroHTML.JSX.HTMLAttributes
}