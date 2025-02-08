import { children, type JSX, type ParentComponent, mergeProps, Show, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attrSetIfExist, attrClassList } from '@/utils/attributes'

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:leading'?: JSX.Element
	'c:subtitle'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:trailingAutoTabIndex'?: boolean
}
const List: ParentComponent<ListProps> = ($props) => {
	const $$props = mergeProps({
		'c:trailingAutoTabIndex': false,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'children', 'c:trailing', 'c:subtitle',
		'class', 'c:trailingAutoTabIndex'
	])
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const content = children(() => props.children)
	const subtitle = children(() => props['c:subtitle'])

	return (<div
		class={attrClassList('c-list', props.class)}
		data-c-trailing={attrSetIfExist(trailing())}
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
					when={props['c:trailingAutoTabIndex']}
					fallback={trailing()}>
					<FocusableGroup
						c:arrowOptions={{
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
	'c:leading'?: JSX.Element
	'c:subtitle'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:trailingAutoTabIndex'?: boolean
}
const RawList: ParentComponent<RawListProps> = ($props) => {
	const $$props = mergeProps({
		'c:trailingAutoTabIndex': false,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'children', 'c:trailing', 'c:subtitle',
		'class', 'c:trailingAutoTabIndex'
	])
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const content = children(() => props.children)
	const subtitle = children(() => props['c:subtitle'])

	return (<Dynamic
		class={attrClassList('c-list', props.class)}
		data-c-trailing={attrSetIfExist(trailing())}
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
					when={props['c:trailingAutoTabIndex']}
					fallback={trailing()}>
					<FocusableGroup
						c:arrowOptions={{
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