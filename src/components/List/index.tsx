import { children, type JSX, type ParentComponent, Show, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attr_set_if_exist, classlist } from '@/utils/attributes'

import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
}
const List: ParentComponent<ListProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'leading', 'children', 'trailing', 'subtitle',
		'class'
	])
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const $children = children(() => props.children)
	const subtitle = children(() => props.subtitle)

	return (<div
		class={classlist('c-list', props.class)}
		data-c-trailing={attr_set_if_exist(trailing())}
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
		'leading', 'children', 'trailing', 'subtitle',
		'class'
	])
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const $children = children(() => props.children)
	const subtitle = children(() => props.subtitle)

	return (<Dynamic
		class={classlist('c-list', props.class)}
		data-c-trailing={attr_set_if_exist(trailing())}
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