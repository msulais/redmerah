import { children, createEffect, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { element_children, element_set_tabindex, element_is_same_node, element_focus_by_arrowkey, element_tagname } from "@/utils/element"
import { event_prevent_default } from "@/utils/event"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import './index.scss'
import { document_active } from "@/utils/document"

type SideNavigationItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	icon_code?: number
	icon_only?: boolean
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'indicator_position', 'selected', 'leading', 'children',
		'trailing', 'classList', 'icon_code', 'icon_only',
		'variant'
	])
	const trailing = children(() => props.trailing)

	return (<Button
		variant={props.variant ?? (props.selected? ButtonVariant.tonal : undefined)}
		indicator_position={props.indicator_position ?? ButtonIndicatorPosition.left}
		selected={props.selected}
		classList={{
			'c-side-navigation-item': true,
			'c-icon-btn': props.icon_only ?? false,
			...props.classList
		}}
		{...other}>
		<Show when={props.icon_code != null}>
			<Icon
				style={{color: props.selected? 'rgb(var(--g-color-accent))' : undefined}}
				filled={props.selected}
				code={props.icon_code!}
			/>
		</Show>
		{ props.leading }
		<Show when={!props.icon_only}>
			<span class="c-side-navigation-item-text">{ props.children }</span>
			<Show when={trailing()}>
				<div style={{flex: 1}} />
			</Show>
			{ trailing() }
		</Show>
	</Button>)
}

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
	header?: JSX.Element
	footer?: JSX.Element
	expanded?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'children', 'expanded', 'header', 'footer',
		'class'
	])
	const header = children(() => props.header)
	const footer = children(() => props.footer)
	const content = children(() => props.children)
	let header_ref: HTMLDivElement | undefined
	let footer_ref: HTMLDivElement | undefined
	let content_ref: HTMLDivElement | undefined

	function reset_tabindex(el: HTMLDivElement | undefined): void {
		if (!el) return

		let is_no_tabindex_0 = true
		for (const child of element_children<HTMLButtonElement>(el)) {
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
	}

	function on_keydown(ev: KeyboardEvent & {currentTarget: HTMLDivElement; target: Element}): void {
		const active = document_active()
		if (!active) return

		const tag_name = element_tagname(active)
		if (tag_name == 'INPUT' || tag_name == 'TEXTAREA') return

		const done = element_focus_by_arrowkey(
			ev.currentTarget,
			ev.code,
			{ up: 'prev', down: 'next' },
			(el) => element_tagname(el) != 'INPUT' && element_tagname(el) != 'TEXTAREA'
		)
		if (done) event_prevent_default(ev)
	}

	createEffect(() => {
		header()
		reset_tabindex(header_ref)
	})

	createEffect(() => {
		footer()
		reset_tabindex(footer_ref)
	})

	createEffect(() => {
		content()
		reset_tabindex(content_ref)
	})

	return (<div
		class={classlist('c-side-navigation', props.class ?? '')}
		data-c-expanded={attr_set_if_exist(props.expanded)}
		{...other}>
		<Show when={header()}>
			<div
				class="c-side-navigation-header"
				onKeyDown={on_keydown}
				ref={header_ref}>
				{header()}
			</div>
		</Show>
		<div
			class="c-side-navigation-content"
			onKeyDown={on_keydown}
			ref={content_ref}>
			{content()}
		</div>
		<Show when={footer()}>
			<div
				class="c-side-navigation-footer"
				onKeyDown={on_keydown}
				ref={footer_ref}>
				{footer()}
			</div>
		</Show>
	</div>)
}

export {
	SideNavigation,
	SideNavigationItem
}
export type {
	SideNavigationProps,
	SideNavigationItemProps
}
export default SideNavigation