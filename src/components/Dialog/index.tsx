import { type JSX, type ParentComponent, splitProps, children, Show, mergeProps } from "solid-js"

import { AnimationEffectTiming } from "@/enums/animation"
import { element_animate } from "@/utils/element"
import { promise_done } from "@/utils/object"

import { close_modal, focus_modal, Modal, open_modal, type ModalProps } from "@/components/Modal"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

function open_dialog(ev: Event, dialog: HTMLDialogElement, options?: {
	content_auto_focus?: boolean
	important?: boolean
}): void {
	open_modal(ev, dialog, {...options})
}

type DialogProps = ModalProps & {
	c_header?: JSX.Element
	c_actions?: JSX.Element
	c_actions_auto_tabindex?: boolean
}
const Dialog: ParentComponent<DialogProps> = ($props) => {
	const animation_options = {duration: 200, easing: AnimationEffectTiming.spring_bounce}
	const $$props = mergeProps({
		c_actions_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_header', 'c_actions', 'children', 'classList',
		'style', 'c_open_animation', 'c_close_animation',
		'c_actions_auto_tabindex'
	])
	const actions = children(() => props.c_actions)
	const header = children(() => props.c_header)

	return (<Modal
		classList={{
			'c-dialog': true,
			...props.classList
		}}
		style={{
			...props.style,
			top: props.style?.top ?? '50%',
			left: props.style?.left ?? '50%',
		}}
		c_open_animation={(el, done) => {
			if (props.c_open_animation) props.c_open_animation(el, done)
			else promise_done(element_animate(
				el,
				{ transform: ['translate(-50%, calc(-50% - 12px))', 'translate(-50%, -50%)'] },
				animation_options
			).finished, done)
		}}
		c_close_animation={(el, done) => {
			if (props.c_close_animation) props.c_close_animation(el, done)
			else promise_done(element_animate(
				el,
				{ transform: ['translate(-50%, -50%)', 'translate(-50%, calc(-50% - 12px))'] },
				animation_options
			).finished, done)
		}}
		{...other}>
		<Show when={header()}>
			<div class="c-dialog-header">{header()}</div>
		</Show>
		<div class="c-dialog-content">{props.children}</div>
		<Show when={actions()}>
			<Show
				when={props.c_actions_auto_tabindex}
				fallback={<div class="c-dialog-actions">
					{actions()}
				</div>}>
				<FocusableGroup
					class="c-dialog-actions"
					c_arrow_options={{
						left: 'prev',
						right: 'next'
					}}>{actions()}</FocusableGroup>
			</Show>
		</Show>
	</Modal>)
}

export {
	Dialog,
	open_dialog as open_dialog,
	close_modal as close_dialog,
	focus_modal as focus_dialog,
}
export type {
	DialogProps
}
export default Dialog