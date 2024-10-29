import { type JSX, type ParentComponent, Show, splitProps, children, mergeProps } from "solid-js"

import { _indicatorPosition, _selected, _leading, _children, _trailing, _classList, _iconCode, _variant, _tonal, _left, _header, _footer, _position, _right, _openAnimation, _closeAnimation, _spring, _animate, _none, _finished, _then, _auto, _style, _top } from "@/constants/string"
import { setElementAttributeIfExist } from "@/utils/attributes"
import { isVarHasValue } from "@/utils/data"
import { AnimationEffectTiming } from "@/enums/animation"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import { Modal, type ModalProps, openModal, closeModal, focusModal } from "@/components/Modal"
import './index.scss'

function openDrawer(ev: Event, drawer: HTMLDialogElement, options?: {
	important?: boolean
	inputAutoFocus?: boolean
}): void {
	openModal(ev, drawer, {...options})
}

enum DrawerPosition {
	left,
	right
}

type DrawerItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	iconCode?: number
}
const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_indicatorPosition, _selected, _leading, _children,
		_trailing, _classList, _iconCode, _variant,
	])
	const trailingComponent = children(() => props[_trailing])

	return (<Button
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : undefined)}
		selected={props[_selected]}
		indicatorPosition={props[_indicatorPosition] ?? (isVarHasValue(props[_selected])? (props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]) : undefined)}
		classList={{'c-drawer-item': true, ...props[_classList]}}
		{...other}>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? 'rgb(var(--g-color-accent))' : undefined}}
				filled={props[_selected]}
				code={props[_iconCode]!}
			/>
		</Show>
		{ props[_leading] }
		{ props[_children] }
		<Show when={trailingComponent()}>
			<div style={{flex: 1}} />
		</Show>
		{ trailingComponent() }
	</Button>)
}

type DrawerProps = Omit<ModalProps, 'style' | 'position'> & {
	header?: JSX.Element
	footer?: JSX.Element
	position?: DrawerPosition
	style?: JSX.CSSProperties
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
	const animationOption = {duration: 300, easing: AnimationEffectTiming[_spring]}
	const $$props = mergeProps({position: DrawerPosition[_left]}, $props)
	const [props, other] = splitProps($$props, [
		_header, _footer, _children, _position,
		_classList, _openAnimation, _closeAnimation,
		_style
	])
	const header = children(() => props[_header])
	const footer = children(() => props[_footer])

	return (<Modal
		data-c-right={setElementAttributeIfExist(props[_position] == DrawerPosition[_right])}
		classList={{
			'c-drawer': true,
			...props[_classList]
		}}
		style={{
			...props[_style],
			left: props[_style]?.[_left] ?? props[_position] == DrawerPosition[_left]? 0 : _auto,
			top: props[_style]?.[_top] ?? '0px',
			right: props[_style]?.[_right] ?? props[_position] == DrawerPosition[_right]? 0 : _auto,
		}}
		openAnimation={(el, done) => {
			if (props[_openAnimation]) props[_openAnimation](el, done)
			else el[_animate]({ transform: [
				props[_position] == DrawerPosition[_left]
					? 'translateX(-100%)'
					: 'translateX(100%)',
			_none] }, animationOption)[_finished][_then](done)
		}}
		closeAnimation={(el, done) => {
			if (props[_closeAnimation]) props[_closeAnimation](el, done)
			else el[_animate]({ transform: [_none, props[_position] == DrawerPosition[_left]
				? 'translateX(-100%)'
				: 'translateX(100%)']
			}, animationOption)[_finished][_then](done)
		}}
		{...other}>
		<Show when={header()}>
			<div class="c-drawer-header">{header()}</div>
		</Show>
		<div class="c-drawer-content">{props[_children]}</div>
		<Show when={footer()}>
			<div class="c-drawer-footer">{footer()}</div>
		</Show>
	</Modal>)
}

export {
	Drawer,
	DrawerItem,
	openDrawer,
	DrawerPosition,
	closeModal as closeDrawer,
	focusModal as focusDrawer
}
export type {
	DrawerProps,
	DrawerItemProps
}
export default Drawer