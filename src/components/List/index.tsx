import { children, type JSX, type ParentComponent, mergeProps, Show, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attr_set_if_exist, classlist } from '@/utils/attributes'

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
	trailing_auto_tabindex?: boolean
}
const List: ParentComponent<ListProps> = ($props) => {
	const $$props = mergeProps({
		trailing_auto_tabindex: true,
	}, $props)
	const [props, other] = splitProps($$props, [
		'leading', 'children', 'trailing', 'subtitle',
		'class', 'trailing_auto_tabindex'
	])
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const content = children(() => props.children)
	const subtitle = children(() => props.subtitle)

	return (<div
		class={classlist('c-list', props.class)}
		data-c-trailing={attr_set_if_exist(trailing())}
		{...other}>
		<Show when={leading()}>
			<div class='c-list-leading'>{leading()}</div>
		</Show>
		<div class='c-list-content'>
			<Show when={content()}>
				<div class='c-list-title'>{content()}</div>
			</Show>
			<Show when={subtitle()}>
				<div class='c-list-subtitle'>{subtitle()}</div>
			</Show>
		</div>
		<Show when={trailing()}>
			<div class='c-list-trailing'>
				<Show
					when={props.trailing_auto_tabindex}
					fallback={trailing()}>
					<FocusableGroup
						arrow_options={{
							left: 'prev',
							right: 'next'
						}}>
						{trailing()}
					</FocusableGroup>
				</Show>
			</div>
		</Show>
	</div>)
}

type RawListProps<T extends ValidComponent = keyof JSX.HTMLElementTags> = DynamicProps<T> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
	trailing_auto_tabindex?: boolean
}
const RawList: ParentComponent<RawListProps> = ($props) => {
	const $$props = mergeProps({
		trailing_auto_tabindex: true,
	}, $props)
	const [props, other] = splitProps($$props, [
		'leading', 'children', 'trailing', 'subtitle',
		'class', 'trailing_auto_tabindex'
	])
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const content = children(() => props.children)
	const subtitle = children(() => props.subtitle)

	return (<Dynamic
		class={classlist('c-list', props.class)}
		data-c-trailing={attr_set_if_exist(trailing())}
		{...other}>
		<Show when={leading()}>
			<div class='c-list-leading'>{leading()}</div>
		</Show>
		<div class='c-list-content'>
			<Show when={content()}>
				<div class='c-list-title'>{content()}</div>
			</Show>
			<Show when={subtitle()}>
				<div class='c-list-subtitle'>{subtitle()}</div>
			</Show>
		</div>
		<Show when={trailing()}>
			<div class='c-list-trailing'>
				<Show
					when={props.trailing_auto_tabindex}
					fallback={trailing()}>
					<FocusableGroup
						arrow_options={{
							left: 'prev',
							right: 'next'
						}}>
						{trailing()}
					</FocusableGroup>
				</Show>
			</div>
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