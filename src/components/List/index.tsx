import { children, type JSX, type ParentComponent, Show, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { setElementAttributeIfExist } from '@/utils/attributes'
import { _leading, _children, _trailing, _subtitle, _compact, _class } from "@/constants/string"

import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
}
const List: ParentComponent<ListProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_leading, _children, _trailing, _subtitle, _class
	])
	const trailing = children(() => props[_trailing])
	const leading = children(() => props[_leading])
	const $children = children(() => props[_children])
	const subtitle = children(() => props[_subtitle])

	return (<div
		class={`c-list${props[_class]? ` ${props[_class]}` : ''}`}
		data-c-trailing={setElementAttributeIfExist(trailing())}
		{...other}>
		<Show when={leading()}>
			<div class='c-list-leading'>{leading()}</div>
		</Show>
		<div class='c-list-content'>
			<Show when={$children()}>
				<div class='c-list-title'>{$children()}</div>
			</Show>
			<Show when={subtitle()}>
				<div class='c-list-subtitle'>{subtitle()}</div>
			</Show>
		</div>
		<Show when={trailing()}>
			<div class='c-list-trailing'>{trailing()}</div>
		</Show>
	</div>)
}

type RawListProps<T extends ValidComponent = keyof JSX.HTMLElementTags> = DynamicProps<T> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
}
const RawList: ParentComponent<RawListProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_leading, _children, _trailing, _subtitle, _class
	])
	const trailing = children(() => props[_trailing])
	const leading = children(() => props[_leading])
	const $children = children(() => props[_children])
	const subtitle = children(() => props[_subtitle])

	return (<Dynamic
		class={`c-list${props[_class]? ` ${props[_class]}` : ''}`}
		data-c-trailing={setElementAttributeIfExist(trailing())}
		{...other}>
		<Show when={leading()}>
			<div class='c-list-leading'>{leading()}</div>
		</Show>
		<div class='c-list-content'>
			<Show when={$children()}>
				<div class='c-list-title'>{$children()}</div>
			</Show>
			<Show when={subtitle()}>
				<div class='c-list-subtitle'>{subtitle()}</div>
			</Show>
		</div>
		<Show when={trailing()}>
			<div class='c-list-trailing'>{trailing()}</div>
		</Show>
	</Dynamic>)
}

export {
	List,
	RawList
}
export type {
	ListProps,
	RawListProps
}
export default List