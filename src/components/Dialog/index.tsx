import { type JSX, type ParentComponent, splitProps, children, Show, createMemo } from "solid-js"

import { AnimationEffectTiming } from "@/enums/animation"
import { elementAnimate } from "@/utils/element"
import { promiseDone } from "@/utils/object"
import { typeIsBoolean } from "@/utils/typecheck"

import { closeModal, focusModal, Modal, openModal, type ModalProps } from "@/components/Modal"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

function openDialog(dialog: HTMLDialogElement, options?: {
	contentAutoFocus?: boolean
	important?: boolean
}): void {
	openModal(dialog, {...options})
}

type DialogProps = ModalProps & {
	'c:header'?: JSX.Element
	'c:actions'?: JSX.Element
	'c:actions_interactiveElements'?: string | HTMLElement[] | boolean
}
const Dialog: ParentComponent<DialogProps> = ($props) => {
	const animationOptions = {duration: 200, easing: AnimationEffectTiming.springBounce}
	const [props, other] = splitProps($props, [
		'c:header', 'c:actions', 'children', 'classList',
		'style', 'c:openAnimation', 'c:closeAnimation',
		'c:actions_interactiveElements'
	])
	const actionInteractiveElements = createMemo(() => props["c:actions_interactiveElements"])

	// hack to solve https://github.com/solidjs/solid/issues/2130
	const getActionInteractiveElement = createMemo(() => typeIsBoolean(actionInteractiveElements())
		? undefined
		: actionInteractiveElements() as string | HTMLElement[]
	)
	const actions = children(() => props['c:actions'])
	const header = children(() => props['c:header'])

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
		c:openAnimation={(el, done) => {
			if (props['c:openAnimation']) props['c:openAnimation'](el, done)
			else promiseDone(elementAnimate(
				el,
				{ transform: ['translate(-50%, calc(-50% - 12px))', 'translate(-50%, -50%)'] },
				animationOptions
			).finished, done)
		}}
		c:closeAnimation={(el, done) => {
			if (props['c:closeAnimation']) props['c:closeAnimation'](el, done)
			else promiseDone(elementAnimate(
				el,
				{ transform: ['translate(-50%, -50%)', 'translate(-50%, calc(-50% - 12px))'] },
				animationOptions
			).finished, done)
		}}
		{...other}>
		<Show when={header()}>
			<div class="c-dialog-header">{header()}</div>
		</Show>
		<div class="c-dialog-content">{props.children}</div>
		<Show when={actions()}>
			<Show
				when={actionInteractiveElements() === false}
				fallback={<FocusableGroup
					class="c-dialog-actions"
					c:elements={getActionInteractiveElement()}
					c:arrowOptions={{
						left: 'prev',
						right: 'next'
					}}>
					{actions()}
				</FocusableGroup>}>
				<div class="c-dialog-actions">
					{actions()}
				</div>
			</Show>
		</Show>
	</Modal>)
}

export {
	Dialog,
	openDialog as openDialog,
	closeModal as closeDialog,
	focusModal as focusDialog,
}
export type {
	DialogProps
}
export default Dialog