import { children, createEffect, type JSX, type ParentComponent, Show, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attr_set_if_exist, classlist } from '@/utils/attributes'
import { element_children, element_focus_by_arrowkey, element_is_same_node, element_set_tabindex, element_tagname } from "@/utils/element"
import { document_active } from "@/utils/document"
import { event_current_target } from "@/utils/event"

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
	const content = children(() => props.children)
	const subtitle = children(() => props.subtitle)
	let div_trailing_ref: HTMLDivElement | undefined

	createEffect(() => {
		trailing()
		if (!div_trailing_ref) return

		let is_no_tabindex_0 = true
		const children = element_children<HTMLButtonElement>(div_trailing_ref)
		for (const child of children) {
			const tag_name = child.tagName
			if (tag_name != 'A' && tag_name != 'BUTTON') continue
			if (tag_name == 'BUTTON' && child.disabled) continue
			if (is_no_tabindex_0) {
				element_set_tabindex(child, 0)
				is_no_tabindex_0 = false
				continue
			}

			element_set_tabindex(child, -1)
		}
	})

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
			<div
				class='c-list-trailing'
				ref={div_trailing_ref}
				onKeyDown={ev => {const active = document_active()
					if (!active) return

					const tag_name = element_tagname(active)
					if (tag_name == 'INPUT' || tag_name == 'TEXTAREA') return

					element_focus_by_arrowkey(
						event_current_target(ev),
						ev.code,
						{ left: 'prev', right: 'next' },
						(el) => element_tagname(el) != 'INPUT' && element_tagname(el) != 'TEXTAREA'
					)
				}}>
				{trailing()}
			</div>
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
	const content = children(() => props.children)
	const subtitle = children(() => props.subtitle)
	let div_trailing_ref: HTMLDivElement | undefined

	createEffect(() => {
		trailing()
		if (!div_trailing_ref) return

		let is_no_tabindex_0 = true
		const children = element_children<HTMLButtonElement>(div_trailing_ref)
		for (const child of children) {
			const tag_name = child.tagName
			if (tag_name != 'A' && tag_name != 'BUTTON') continue
			if (tag_name == 'BUTTON' && child.disabled) continue
			if (is_no_tabindex_0) {
				element_set_tabindex(child, 0)
				is_no_tabindex_0 = false
				continue
			}

			element_set_tabindex(child, -1)
		}
	})

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
			<div
				class='c-list-trailing'
				ref={div_trailing_ref}
				onKeyDown={ev => {
					const active = document_active()
					if (!active) return

					const tag_name = element_tagname(active)
					if (tag_name == 'INPUT' || tag_name == 'TEXTAREA') return

					element_focus_by_arrowkey(
						event_current_target(ev),
						ev.code,
						{ left: 'prev', right: 'next' },
						(el) => element_tagname(el) != 'INPUT' && element_tagname(el) != 'TEXTAREA'
					)
				}}>
				{trailing()}
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