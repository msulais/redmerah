type Nullable<T> = T | null
export const $is_string = (e: any) => typeof e === 'string'
export const $is_array = (e: any) => Array.isArray(e)
export const $is_number = (e: any) => typeof e === 'number'
export const $is_false = (e: any) => e === false
export const $is_bool = (e: any) => typeof e === 'boolean'
export const $rm_attr = (ref?: Element, name?: string) => name && ref?.removeAttribute(name)
export const $get_attr = (ref?: Element, name?: string) => name && ref?.getAttribute(name)
export const $has_attr = (ref?: Element, name?: string) => Boolean(name && ref?.hasAttribute(name))
export const $set_attr = (
	(ref?: Nullable<Element>, name?: string, value?: string) =>
	name && value && ref?.setAttribute(name, value)
)
export const $toggle_attr = (
	(ref?: Nullable<Element>, name?: string, force?: boolean) =>
	name && $is_bool(force) && ref?.toggleAttribute(name, force)
)
export const $create = (
	<T extends keyof HTMLElementTagNameMap>(tagName: T) =>
	document.createElement(tagName)
)
export const $children = (
	(ref?: Nullable<Element>, ...children: (Node | string)[]) =>
	ref?.replaceChildren(...children)
)
export const $classlist = (
	(ref?: Nullable<Element>, ...classes: string[]) =>
	ref?.classList.add(...classes)
)
export const $rect = (ref: Element) => ref.getBoundingClientRect()
export const $add_event = (
	<T extends Event = Event>(ref?: any, type?: string, callback?: (e: T) => unknown) =>
	ref.addEventListener(type, callback)
)
export const $set_style = (
	(ref?: Nullable<HTMLElement>, name?: string, value?: string) =>
	name && value && ref?.style.setProperty(name, value)
)
export const $is_node = (e: any) => typeof e === 'string' || e instanceof Node
export const $id = (
	<T extends Element = Element>(id: string) =>
	document.getElementById(id) as T | null
)
export const $query = (
	<T extends Element>(selector: string, from?: Element) =>
	(from ?? document).querySelector<T>(selector)
)
export const $query_all = (
	<T extends Element>(selector: string, from?: Element) =>
	(from ?? document).querySelectorAll<T>(selector)
)
export const $rm_event = (
	<T extends Event = Event>(ref?: any, type?: string, callback?: (e: T) => unknown) =>
	ref.removeEventListener(type, callback)
)
export const $rm_style = (
	(ref?: HTMLElement, name?: string) =>
	name && ref?.style.removeProperty(name)
)
export const $round = (v: number) => Math.round(v)
export const $parse_int = (v: string, radix?: number) => Number.parseInt(v, radix)
export const $parse_date = (date: string) => Date.parse(date)