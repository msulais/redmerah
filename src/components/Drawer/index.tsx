import { type JSX, type ParentComponent, Show, splitProps, children, mergeProps, createMemo } from "solid-js"

import { attr_set_if_exist } from "@/utils/attributes"
import { object_has_value, promise_done } from "@/utils/object"
import { AnimationEffectTiming } from "@/enums/animation"
import { element_animate } from "@/utils/element"
import { AppColors } from "@/enums/colors"
import { event_prevent_default } from "@/utils/event"
import { KEY_ARROW_DOWN, KEY_ARROW_UP } from "@/constants/key_code"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import { close_modal, focus_modal, Modal, open_modal, type ModalProps } from "@/components/Modal"
import FocusableGroup from "@/components/FocusableGroup"
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
		indicator_position={props.indicator_position ?? (object_has_value(selected())? (props.indicator_position ?? ButtonIndicatorPosition.left) : undefined)}
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
	header_auto_tabindex?: boolean
	footer?: JSX.Element
	footer_auto_tabindex?: boolean
	children_auto_tabindex?: boolean
	position?: DrawerPosition
	style?: JSX.CSSProperties
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
	const animation_option = {duration: 300, easing: AnimationEffectTiming.spring}
	const $$props = mergeProps({
		position: DrawerPosition.left,
		header_auto_tabindex: true,
		footer_auto_tabindex: true,
		children_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'header', 'footer', 'children', 'position',
		'classList', 'open_animation', 'close_animation',
		'style', 'header_auto_tabindex', 'footer_auto_tabindex',
		'children_auto_tabindex'
	])
	const position = createMemo(() => props.position)
	const header = children(() => props.header)
	const footer = children(() => props.footer)
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
			<div class="c-drawer-header">
				<Show when={props.header_auto_tabindex} fallback={header()}>
					<FocusableGroup arrow_options={{
						up: 'prev',
						down: 'next'
					}}>{header()}</FocusableGroup>
				</Show>
			</div>
		</Show>
		<div class="c-drawer-content">
			<Show when={props.children_auto_tabindex} fallback={content()}>
				<FocusableGroup arrow_options={{
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
				<Show when={props.footer_auto_tabindex} fallback={footer()}>
					<FocusableGroup arrow_options={{
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