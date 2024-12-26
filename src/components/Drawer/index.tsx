import { type JSX, type ParentComponent, Show, splitProps, children, mergeProps, createMemo, createEffect } from "solid-js"

import { attr_set_if_exist } from "@/utils/attributes"
import { is_var_has_value, promise_done } from "@/utils/object"
import { AnimationEffectTiming } from "@/enums/animation"
import { element_animate, element_children, element_focus_by_arrowkey, element_is_same_node, element_set_tabindex } from "@/utils/element"
import { AppColors } from "@/enums/colors"
import { event_prevent_default } from "@/utils/event"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import { close_modal, focus_modal, Modal, open_modal, type ModalProps } from "@/components/Modal"
import './index.scss'

function openDrawer(
	ev: Event,
	drawer: HTMLDialogElement,
	options?: {
		important?: boolean
		content_auto_focus?: boolean
	}
): void {
	open_modal(ev, drawer, {...options})
}

enum DrawerPosition {
	left,
	right
}

type DrawerItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	icon_code?: number
}
const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'indicator_position', 'leading', 'children',
		'trailing', 'classList', 'icon_code', 'variant'
	])
	const selected = createMemo(() => other.selected)
	const trailing = children(() => props.trailing)

	return (<Button
		variant={props.variant ?? (selected()? ButtonVariant.tonal : undefined)}
		indicator_position={props.indicator_position ?? (is_var_has_value(selected())? (props.indicator_position ?? ButtonIndicatorPosition.left) : undefined)}
		classList={{'c-drawer-item': true, ...props.classList}}
		{...other}>
		<Show when={props.icon_code != null}>
			<Icon
				style={{color: selected()? `rgb(${AppColors.accent})` : undefined}}
				filled={selected()}
				code={props.icon_code!}
			/>
		</Show>
		{ props.leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1" />
		</Show>
		{ trailing() }
	</Button>)
}

type DrawerProps = Omit<ModalProps, 'style' | 'position'> & {
	header?: JSX.Element
	footer?: JSX.Element
	position?: DrawerPosition
	style?: JSX.CSSProperties
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
	const animation_option = {duration: 300, easing: AnimationEffectTiming.spring}
	const $$props = mergeProps({position: DrawerPosition.left}, $props)
	const [props, other] = splitProps($$props, [
		'header', 'footer', 'children', 'position',
		'classList', 'open_animation', 'close_animation',
		'style'
	])
	const position = createMemo(() => props.position)
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
		const button = ev.target as HTMLButtonElement
		if (button.tagName == 'INPUT' || button.tagName == 'TEXTAREA') return;
		if (!element_is_same_node(button.parentElement!, ev.currentTarget)) return

		const done = element_focus_by_arrowkey(
			button,
			ev.code,
			{ up: 'prev', down: 'next' },
			(el) => el.tagName != 'INPUT' && el.tagName != 'TEXTAREA'
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

	return (<Modal
		data-c-right={attr_set_if_exist(position() == DrawerPosition.right)}
		classList={{
			'c-drawer': true,
			...props.classList
		}}
		style={{
			...props.style,
			left: props.style?.left ?? position() == DrawerPosition.left? 0 : 'auto',
			top: props.style?.top ?? '0px',
			right: props.style?.right ?? position() == DrawerPosition.right? 0 : 'auto',
		}}
		open_animation={(el, done) => {
			if (props.open_animation) props.open_animation(el, done)
			else promise_done(element_animate(
				el,
				{ transform: [
					position() == DrawerPosition.left
						? 'translateX(-100%)'
						: 'translateX(100%)',
				'none'] },
				animation_option
			).finished, done)
		}}
		close_animation={(el, done) => {
			if (props.close_animation) props.close_animation(el, done)
			else promise_done(element_animate(
				el,
				{ transform: [
					'none',
					props.position == DrawerPosition.left
						? 'translateX(-100%)'
						: 'translateX(100%)',
				] },
				animation_option
			).finished, done)
		}}
		{...other}>
		<Show when={header()}>
			<div
				class="c-drawer-header"
				ref={header_ref}
				onKeyDown={on_keydown}>
				{header()}
			</div>
		</Show>
		<div
			class="c-drawer-content"
			ref={content_ref}
			onKeyDown={on_keydown}>
			{content()}
		</div>
		<Show when={footer()}>
			<div
				class="c-drawer-footer"
				ref={footer_ref}
				onKeyDown={on_keydown}>
				{footer()}
			</div>
		</Show>
	</Modal>)
}

export {
	Drawer,
	DrawerItem,
	openDrawer,
	DrawerPosition,
	close_modal as close_drawer,
	focus_modal as focus_drawer
}
export type {
	DrawerProps,
	DrawerItemProps
}
export default Drawer