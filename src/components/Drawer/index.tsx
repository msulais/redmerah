import { type JSX, type ParentComponent, Show, splitProps, children, mergeProps, createMemo } from "solid-js"

import { attrSetIfExist } from "@/utils/attributes"
import { objectHasValue } from "@/utils/object"
import { AnimationEffectTiming } from "@/enums/animation"
import { AppColors } from "@/enums/colors"
import { animationIsOn } from "@/utils/animation"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import { closeModal, focusModal, Modal, openModal, type ModalProps } from "@/components/Modal"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

function openDrawer(
	drawer: HTMLDialogElement,
	options?: {
		important?: boolean
		contentAutoFocus?: boolean
	}
): void {
	openModal(drawer, {...options})
}

enum DrawerPosition {
	left,
	right
}

type DrawerItemProps = ButtonProps & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:iconCode'?: number
}
const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:indicatorPosition', 'c:leading', 'children',
		'c:trailing', 'classList', 'c:iconCode', 'c:variant'
	])
	const selected = createMemo(() => other["c:selected"])
	const trailing = children(() => props['c:trailing'])

	return (<Button
		c:variant={props["c:variant"] ?? (selected()? ButtonVariant.tonal : undefined)}
		c:indicatorPosition={props["c:indicatorPosition"] ?? (objectHasValue(selected())? (props["c:indicatorPosition"] ?? ButtonIndicatorPosition.left) : undefined)}
		classList={{'c-drawer-item': true, ...props.classList}}
		{...other}>
		<Show when={props['c:iconCode'] != null}>
			<Icon
				style={{color: selected()? `rgb(${AppColors.accent})` : undefined}}
				c:filled={selected()}
				c:code={props['c:iconCode']!}
			/>
		</Show>
		{ props['c:leading'] }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1" />
		</Show>
		{ trailing() }
	</Button>)
}

type LinkDrawerItemProps = LinkButtonProps & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:iconCode'?: number
}
const LinkDrawerItem: ParentComponent<LinkDrawerItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:indicatorPosition', 'c:leading', 'children',
		'c:trailing', 'classList', 'c:iconCode', 'c:variant'
	])
	const selected = createMemo(() => other["c:selected"])
	const trailing = children(() => props['c:trailing'])

	return (<LinkButton
		c:variant={props["c:variant"] ?? (selected()? ButtonVariant.tonal : undefined)}
		c:indicatorPosition={props["c:indicatorPosition"] ?? (objectHasValue(selected())? (props["c:indicatorPosition"] ?? ButtonIndicatorPosition.left) : undefined)}
		classList={{'c-drawer-item': true, ...props.classList}}
		{...other}>
		<Show when={props['c:iconCode'] != null}>
			<Icon
				style={{color: selected()? `rgb(${AppColors.accent})` : undefined}}
				c:filled={selected()}
				c:code={props['c:iconCode']!}
			/>
		</Show>
		{ props['c:leading'] }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1" />
		</Show>
		{ trailing() }
	</LinkButton>)
}

type DrawerProps = Omit<ModalProps, 'style' | 'c:position'> & {
	'c:header'?: JSX.Element
	'c:footer'?: JSX.Element
	'c:interactiveElements'?: string | HTMLElement[] | boolean
	'c:position'?: DrawerPosition
	style?: JSX.CSSProperties
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
	const animation_option = {duration: 200, easing: AnimationEffectTiming.spring}
	const $$props = mergeProps({
		'c:position': DrawerPosition.left,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:header', 'c:footer', 'children', 'c:position',
		'classList', 'c:openAnimation', 'c:closeAnimation',
		'style', 'c:interactiveElements'
	])
	const interactiveElement = createMemo(() => props["c:interactiveElements"])

	// hack to solve https://github.com/solidjs/solid/issues/2130
	const getInteractiveElement = createMemo(() => typeof interactiveElement() === 'boolean'
		? undefined
		: interactiveElement() as string | HTMLElement[]
	)
	const position = createMemo(() => props['c:position'])
	const header = children(() => props['c:header'])
	const footer = children(() => props['c:footer'])
	const content = children(() => props.children)
	const C = () => (<>
		<Show when={header()}>
			<div class="c-drawer-header">
				{header()}
			</div>
		</Show>
		<div class="c-drawer-content">
			{content()}
		</div>
		<Show when={footer()}>
			<div class="c-drawer-footer">
				{footer()}
			</div>
		</Show>
	</>)

	return (<Modal
		data-c-right={attrSetIfExist(position() == DrawerPosition.right)}
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
		c:openAnimation={(el, done) => {
			if (animationIsOn()) {
				if (props["c:openAnimation"]) props["c:openAnimation"](el, done)
				else el.animate(
					{ transform: [
						position() == DrawerPosition.left
							? 'translateX(-100%)'
							: 'translateX(100%)',
					'none'] },
					animation_option
				).finished.then(done)
				return
			}

			done()
		}}
		c:closeAnimation={(el, done) => {
			if (animationIsOn()){
				if (props["c:closeAnimation"]) props["c:closeAnimation"](el, done)
				else el.animate(
					{ transform: [
						'none',
						props['c:position'] == DrawerPosition.left
							? 'translateX(-100%)'
							: 'translateX(100%)',
					] },
					animation_option
				).finished.then(done)
				return
			}

			done()
		}}
		{...other}>
		<Show
			when={interactiveElement() === false}
			fallback={<FocusableGroup
				c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				c:elements={getInteractiveElement()}>
				<C/>
			</FocusableGroup>}>
			<C/>
		</Show>
	</Modal>)
}

export {
	Drawer,
	DrawerItem,
	LinkDrawerItem,
	openDrawer,
	DrawerPosition,
	closeModal as closeDrawer,
	focusModal as focusDrawer
}
export type {
	DrawerProps,
	DrawerItemProps,
	LinkDrawerItemProps
}
export default Drawer