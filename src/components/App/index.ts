import { $create, $classlist, $query, $is_false, $children, $is_array, $is_node } from "../utils"

/**
 * @deprecated
 */
export namespace CApp {
	export type CElement<T extends HTMLElement = HTMLDivElement> = T
	export type UpdateOptions<T extends CElement, U extends 'with-tagname' | null = null> = {
		App?: (U extends 'with-tagname'? {tagname?: keyof HTMLElementTagNameMap} : {}) & {
			children    ?: (Node | string)[] | boolean
			appBar      ?: (Node | string)[] | boolean
			bottomBar   ?: (Node | string)[] | boolean
			leftSideBar ?: (Node | string)[] | boolean
			rightSideBar?: (Node | string)[] | boolean
			refs?: {
				app         ?(ref: T             ): unknown
				appBar      ?(ref: HTMLDivElement): unknown
				container   ?(ref: HTMLDivElement): unknown
				leftSideBar ?(ref: HTMLDivElement): unknown
				body        ?(ref: HTMLDivElement): unknown
				rightSideBar?(ref: HTMLDivElement): unknown
				bottomBar   ?(ref: HTMLDivElement): unknown
			}
		}
	}

	export enum Classes {
		App          = 'c-app',
		AppBar       = App + '-appbar',
		Container    = App + '-container',
		LeftSideBar  = App + '-left-sidebar',
		RightSideBar = App + '-right-sidebar',
		BottomBar    = App + '-bottombar',
		Body         = App + '-body'
	}

	export function create<T extends CElement>(
		options?: UpdateOptions<T, 'with-tagname'>
	): T {
		const ref_app = $create(options?.App?.tagname ?? 'div') as T
		return update(ref_app, options)
	}

	export function update<T extends CElement>(
		ref_app: T, options?: UpdateOptions<T>
	): T {
		const opt = options?.App
		const refs = opt?.refs
		$classlist(ref_app, Classes.App)

		// appbar
		const opt_appBar = opt?.appBar
		let ref_appBar = $query<HTMLDivElement>(`.${Classes.AppBar}`, ref_app)
		if ($is_false(opt_appBar)) {
			$children(ref_appBar)
		}
		else if ($is_array(opt_appBar)) {
			if (!ref_appBar) {
				ref_appBar = $create('div')
				$classlist(ref_appBar, Classes.AppBar)
			}

			$children(ref_appBar, ...opt_appBar)
		}

		// container
		let ref_container = $query<HTMLDivElement>(`.${Classes.Container}`, ref_app)
		if (!ref_container) {
			ref_container = $create('div')
			$classlist(ref_container, Classes.Container)
		}

		// container -> leftsidebar
		const opt_leftSideBar = opt?.leftSideBar
		let ref_leftSideBar = $query<HTMLDivElement>(`.${Classes.LeftSideBar}`, ref_container)
		if ($is_false(opt_leftSideBar)) {
			$children(ref_leftSideBar)
		}
		else if ($is_array(opt_leftSideBar)) {
			if (!ref_leftSideBar) {
				ref_leftSideBar = $create('div')
				$classlist(ref_leftSideBar, Classes.LeftSideBar)
			}

			$children(ref_leftSideBar, ...opt_leftSideBar)
		}

		// container -> body
		let ref_body = $query<HTMLDivElement>(`.${Classes.Body}`, ref_app)
		if (!ref_body) {
			ref_body = $create('div')
			$classlist(ref_body, Classes.Body)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_body)
		}
		else if ($is_array(opt_children)) {
			$children(ref_body, ...opt_children)
		}

		// container -> rightsidebar
		const opt_rightSideBar = opt?.rightSideBar
		let ref_rightSideBar = $query<HTMLDivElement>(`.${Classes.RightSideBar}`, ref_app)
		if ($is_false(opt_rightSideBar)) {
			$children(ref_rightSideBar)
		}
		else if ($is_array(opt_rightSideBar)) {
			if (!ref_rightSideBar) {
				ref_rightSideBar = $create('div')
				$classlist(ref_rightSideBar, Classes.RightSideBar)
			}

			$children(ref_rightSideBar, ...opt_rightSideBar)
		}

		// bottombar
		const opt_bottomBar = opt?.bottomBar
		let ref_bottomBar = $query<HTMLDivElement>(`.${Classes.BottomBar}`, ref_app)
		if ($is_false(opt_bottomBar)) {
			$children(ref_bottomBar)
		}
		else if ($is_array(opt_bottomBar)) {
			if (!ref_bottomBar) {
				ref_bottomBar = $create('div')
				$classlist(ref_bottomBar, Classes.BottomBar)
			}

			$children(ref_bottomBar, ...opt_bottomBar)
		}

		$children(
			ref_container,
			...[ref_appBar, ref_body, ref_bottomBar].filter($is_node) as Node[]
		)
		$children(
			ref_app,
			...[opt_leftSideBar, ref_container, ref_rightSideBar].filter($is_node) as Node[]
		)
		refs?.app?.(ref_app)
		refs?.container?.(ref_container)
		refs?.body?.(ref_body)
		if (ref_appBar) refs?.appBar?.(ref_appBar)
		if (ref_leftSideBar) refs?.leftSideBar?.(ref_leftSideBar)
		if (ref_rightSideBar) refs?.rightSideBar?.(ref_rightSideBar)
		if (ref_bottomBar) refs?.bottomBar?.(ref_bottomBar)
		return ref_app
	}
}

export type AppProps = astroHTML.JSX.HTMLAttributes & {
	AppTagName         ?: string
	AppAppBarAttr      ?: astroHTML.JSX.HTMLAttributes
	AppBottomBarAttr   ?: astroHTML.JSX.HTMLAttributes
	AppBodyAttr        ?: astroHTML.JSX.HTMLAttributes
	AppContainerAttr   ?: astroHTML.JSX.HTMLAttributes
	AppLeftSideBarAttr ?: astroHTML.JSX.HTMLAttributes
	AppRightSideBarAttr?: astroHTML.JSX.HTMLAttributes
}