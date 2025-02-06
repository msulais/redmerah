import { type JSX, type ParentComponent, Show, splitProps, children, mergeProps, createMemo } from "solid-js"

import { attr_set_if_exist } from "@/utils/attributes"
import { object_has_value, promise_done } from "@/utils/object"
import { AnimationEffectTiming } from "@/enums/animation"
import { element_animate } from "@/utils/element"
import { AppColors } from "@/enums/colors"
import { event_prevent_default } from "@/utils/event"
import { KEY_ARROW_DOWN, KEY_ARROW_UP } from "@/constants/key_code"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import { close_modal, focus_modal, Modal, open_modal, type ModalProps } from "@/components/Modal"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

function open_drawer(
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
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_icon_code?: number
}
const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_indicator_position', 'c_leading', 'children',
		'c_trailing', 'classList', 'c_icon_code', 'c_variant'
	])
	const selected = createMemo(() => other.c_selected)
	const trailing = children(() => props.c_trailing)

	return (<Button
		c_variant={props.c_variant ?? (selected()? ButtonVariant.tonal : undefined)}
		c_indicator_position={props.c_indicator_position ?? (object_has_value(selected())? (props.c_indicator_position ?? ButtonIndicatorPosition.left) : undefined)}
		classList={{'c-drawer-item': true, ...props.classList}}
		{...other}>
		<Show when={props.c_icon_code != null}>
			<Icon
				style={{color: selected()? `rgb(${AppColors.accent})` : undefined}}
				c_filled={selected()}
				c_code={props.c_icon_code!}
			/>
		</Show>
		{ props.c_leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1" />
		</Show>
		{ trailing() }
	</Button>)
}

type LinkDrawerItemProps = LinkButtonProps & {
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_icon_code?: number
}
const LinkDrawerItem: ParentComponent<LinkDrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_indicator_position', 'c_leading', 'children',
		'c_trailing', 'classList', 'c_icon_code', 'c_variant'
	])
	const selected = createMemo(() => other.c_selected)
	const trailing = children(() => props.c_trailing)

	return (<LinkButton
		c_variant={props.c_variant ?? (selected()? ButtonVariant.tonal : undefined)}
		c_indicator_position={props.c_indicator_position ?? (object_has_value(selected())? (props.c_indicator_position ?? ButtonIndicatorPosition.left) : undefined)}
		classList={{'c-drawer-item': true, ...props.classList}}
		{...other}>
		<Show when={props.c_icon_code != null}>
			<Icon
				style={{color: selected()? `rgb(${AppColors.accent})` : undefined}}
				c_filled={selected()}
				c_code={props.c_icon_code!}
			/>
		</Show>
		{ props.c_leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1" />
		</Show>
		{ trailing() }
	</LinkButton>)
}

type DrawerProps = Omit<ModalProps, 'style' | 'c_position'> & {
	c_header?: JSX.Element
	c_header_auto_tabindex?: boolean
	c_footer?: JSX.Element
	c_footer_auto_tabindex?: boolean
	c_children_auto_tabindex?: boolean
	c_position?: DrawerPosition
	style?: JSX.CSSProperties
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
	const animation_option = {duration: 200, easing: AnimationEffectTiming.spring}
	const $$props = mergeProps({
		c_position: DrawerPosition.left,
		c_header_auto_tabindex: true,
		c_footer_auto_tabindex: true,
		c_children_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_header', 'c_footer', 'children', 'c_position',
		'classList', 'c_open_animation', 'c_close_animation',
		'style', 'c_header_auto_tabindex', 'c_footer_auto_tabindex',
		'c_children_auto_tabindex'
	])
	const position = createMemo(() => props.c_position)
	const header = children(() => props.c_header)
	const footer = children(() => props.c_footer)
	const content = children(() => props.children)

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
		c_open_animation={(el, done) => {
			if (props.c_open_animation) props.c_open_animation(el, done)
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
		c_close_animation={(el, done) => {
			if (props.c_close_animation) props.c_close_animation(el, done)
			else promise_done(element_animate(
				el,
				{ transform: [
					'none',
					props.c_position == DrawerPosition.left
						? 'translateX(-100%)'
						: 'translateX(100%)',
				] },
				animation_option
			).finished, done)
		}}
		{...other}>
		<Show when={header()}>
			<div class="c-drawer-header">
				<Show when={props.c_header_auto_tabindex} fallback={header()}>
					<FocusableGroup c_arrow_options={{
						up: 'prev',
						down: 'next'
					}}>{header()}</FocusableGroup>
				</Show>
			</div>
		</Show>
		<div class="c-drawer-content">
			<Show when={props.c_children_auto_tabindex} fallback={content()}>
				<FocusableGroup c_arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{content()}</FocusableGroup>
			</Show>
		</div>
		<Show when={footer()}>
			<div class="c-drawer-footer">
				<Show when={props.c_footer_auto_tabindex} fallback={footer()}>
					<FocusableGroup c_arrow_options={{
						up: 'prev',
						down: 'next'
					}}>{footer()}</FocusableGroup>
				</Show>
			</div>
		</Show>
	</Modal>)
}

export {
	Drawer,
	DrawerItem,
	LinkDrawerItem,
	open_drawer,
	DrawerPosition,
	close_modal as close_drawer,
	focus_modal as focus_drawer
}
export type {
	DrawerProps,
	DrawerItemProps,
	LinkDrawerItemProps
}
export default Drawer