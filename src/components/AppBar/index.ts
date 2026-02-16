import { $classlist, $query, $is_false, $children, $is_array, $create, $is_node } from "../utils"

export namespace CAppBar {
	export type CElement<T extends HTMLElement = HTMLElement> = T
	export type AppBarUpdateOptions<T extends CElement<HTMLElement>> = {
		AppBar?: {
			children?: (Node | string)[] | boolean
			leading ?: (Node | string)[] | boolean
			headline?: (Node | string)[] | boolean
			trailing?: (Node | string)[] | boolean
			refs?: {
				appBar  ?(ref: T                 ): unknown
				flex    ?(ref: HTMLDivElement    ): unknown
				leading ?(ref: HTMLDivElement    ): unknown
				trailing?(ref: HTMLDivElement    ): unknown
				content ?(ref: HTMLDivElement    ): unknown
				headline?(ref: HTMLHeadingElement): unknown
			}
		}
	}

	export enum Classes {
		appbar   = 'c-appbar',
		leading  = appbar + '-leading',
		trailing = appbar + '-trailing',
		content  = appbar + '-content',
		headline = appbar + '-headline',
		flex = appbar + '-flex'
	}

	export function create<T extends CElement<HTMLElement>>(
		options?: AppBarUpdateOptions<T> & {AppBarTagName?: keyof HTMLElementTagNameMap}
	): T {
		const ref_appBar = document.createElement(options?.AppBarTagName ?? 'header')
		return update(ref_appBar, options) as T
	}

	export function update<T extends CElement<HTMLElement>>(
		ref_appBar: T,
		options?: AppBarUpdateOptions<T>
	): T {
		const opt = options?.AppBar
		const refs = opt?.refs
		$classlist(ref_appBar, Classes.appbar)

		// leading
		const opt_leading = opt?.leading
		let ref_leading = $query<HTMLDivElement>(`.${Classes.leading}`, ref_appBar)
		if ($is_false(opt_leading)) {
			$children(ref_leading)
		}
		else if ($is_array(opt_leading)) {
			if (!ref_leading) {
				ref_leading = $create('div')
				$classlist(ref_leading, Classes.leading)
			}

			$children(ref_leading, ...opt_leading)
		}

		// content
		let ref_content = $query<HTMLDivElement>(`.${Classes.content}`, ref_appBar)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.content)
		}

		// content -> headline
		const opt_headline = opt?.headline
		let ref_headline = $query<HTMLHeadingElement>(`.${Classes.headline}`, ref_content)
		if ($is_false(opt_headline)) {
			$children(ref_headline)
		}
		else if ($is_array(opt_headline)) {
			if (!ref_headline) {
				ref_headline = $create('h2')
				$classlist(ref_headline, Classes.headline)
			}

			$children(ref_headline, ...opt_headline)
		}

		// content -> children
		const children: (Node | string)[] = []
		for (const node of ref_content.childNodes) {
			if (ref_headline && node === ref_headline) continue

			children.push(node)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			children.length = 0
		}
		else if ($is_array(opt_children)) {
			children.length = 0
			children.push(...opt_children)
		}

		$children(ref_content, ...[ref_headline, ...children].filter($is_node) as Node[])

		// flex
		let ref_flex = $query<HTMLDivElement>(`.${Classes.flex}`, ref_appBar)
		if (!ref_flex) {
			ref_flex = $create('div')
			$classlist(ref_flex, Classes.flex)
		}

		// trailing
		const opt_trailing = opt?.trailing
		let ref_trailing = $query<HTMLDivElement>(`.${Classes.trailing}`, ref_appBar)
		if ($is_false(opt_trailing)) {
			$children(ref_trailing)
		}
		else if ($is_array(opt_trailing)) {
			if (!ref_trailing) {
				ref_trailing = $create('div')
				$classlist(ref_trailing, Classes.trailing)
			}

			$children(ref_trailing, ...opt_trailing)
		}

		$children(
			ref_appBar,
			...[ref_leading, ref_content, ref_flex, ref_trailing].filter($is_node) as Node[]
		)
		refs?.appBar?.(ref_appBar)
		refs?.content?.(ref_content)
		refs?.flex?.(ref_flex)
		if (ref_leading) refs?.leading?.(ref_leading)
		if (ref_headline) refs?.headline?.(ref_headline)
		if (ref_trailing) refs?.trailing?.(ref_trailing)
		return ref_appBar
	}
}

export type AppBarProps = astroHTML.JSX.HTMLAttributes & {
	AppBarTagName     ?: string
	AppBarContentAttr ?: astroHTML.JSX.HTMLAttributes
	AppBarLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	AppBarTrailingAttr?: astroHTML.JSX.HTMLAttributes
	AppBarHeadingAttr ?: astroHTML.JSX.HTMLAttributes
	AppBarFlexAttr    ?: astroHTML.JSX.HTMLAttributes
}