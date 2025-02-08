import { type JSX, type ParentComponent, splitProps, children, onMount, onCleanup, Show, mergeProps } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attrSetIfExist } from "@/utils/attributes"
import { eventListenerAdd, eventListenerRemove } from "@/utils/event"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { elementDispatchEvent } from "@/utils/element"
import { documentBody } from "@/utils/document"

import List from "@/components/List"
import Popover, { type PopoverProps, closePopover, openPopover, isPopoverOpen as isToastOpen, PopoverPosition } from "@/components/Popover"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

enum ToastPosition {
	leftTop,
	centerTop,
	rightCenter,
	leftBottom,
	centerBottom,
	rightBottom
}

type ToastOpenDetail = {
	event: Event
	autoclose?: boolean
	duration?: number
	position?: ToastPosition
}

enum ToastEvents {
	open = 'custom:toast-open',
	close = 'custom:toast-close'
}

function openToast(
	event: Event,
	toast: HTMLDivElement,
	options?: Omit<ToastOpenDetail, 'event'>
): void {
	elementDispatchEvent(toast, new CustomEvent(
		ToastEvents.open,
		{detail: {event, ...options} satisfies ToastOpenDetail}
	))
}

function closeToast(toast: HTMLDivElement): void {
	elementDispatchEvent(toast, new CustomEvent(ToastEvents.close))
}

type ToastProps = PopoverProps & {
	'c:header'?: JSX.Element
	'c:actions'?: JSX.Element
	'c:actionAutoTabIndex'?: boolean
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:trailingAutoTabIndex'?: boolean
}
const Toast: ParentComponent<ToastProps> = ($props) => {
	const $$props = mergeProps({
		'c:actionAutoTabIndex': true,
		'c:trailingAutoTabIndex': true,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'c:trailing', 'children', 'c:header',
		'c:actions', 'classList', 'ref', 'c:onToggleOpen',
		'c:trailingAutoTabIndex', 'c:actionAutoTabIndex'
	])
	const actions = children(() => props['c:actions'])
	let toastRef: HTMLDivElement
	let isOpen = false
	let timeId: number | null = null

	function closeToast(): void {
		if (!isOpen) return;
		if (timeId != null) {
			timeTimerClear(timeId)
			timeId = null
		}
		closePopover(toastRef)
	}

	function openToast(options: ToastOpenDetail): void {
		if (isOpen) return

		const {
			event,
			position = ToastPosition.centerTop,
			autoclose = true,
			duration = 5E3
		} = options;

		let $position = PopoverPosition.centerCenterTop
		if (position == ToastPosition.leftTop) $position = PopoverPosition.centerCenterLeftTop
		else if (position == ToastPosition.leftBottom) $position = PopoverPosition.centerCenterLeftBottom
		else if (position == ToastPosition.centerTop) $position = PopoverPosition.centerCenterTop
		else if (position == ToastPosition.centerBottom) $position = PopoverPosition.centerCenterBottom
		else if (position == ToastPosition.rightCenter) $position = PopoverPosition.centerCenterRightTop
		else if (position == ToastPosition.rightBottom) $position = PopoverPosition.centerCenterRightBottom

		openPopover(event, toastRef, {
			anchor: documentBody(),
			manualDismiss: true,
			position: $position
		})

		if (!autoclose) return;

		timeId = timeTimerSet(() => {
			closeToast()
			timeId = null
		}, duration)
	}

	function customOnOpen(ev: CustomEvent): void {
		openToast(ev.detail as ToastOpenDetail)
	}

	function customOnClose(_ev: CustomEvent): void {
		closeToast()
	}

	function initCustomEvent(): void {
		eventListenerAdd<CustomEvent>(toastRef, ToastEvents.open, customOnOpen)
		eventListenerAdd<CustomEvent>(toastRef, ToastEvents.close, customOnClose)

		onCleanup(() => {
			eventListenerRemove<CustomEvent>(toastRef, ToastEvents.open, customOnOpen)
			eventListenerRemove<CustomEvent>(toastRef, ToastEvents.close, customOnClose)
		})
	}

	onMount(() => {
		initCustomEvent()
	})

	return (<Popover
		c:onToggleOpen={o => {
			isOpen = o
			props["c:onToggleOpen"]?.(o)
		}}
		ref={mergeRefs(props.ref, r => toastRef = r)}
		classList={{
			'c-toast': true,
			...props.classList
		}}
		data-c-actions={attrSetIfExist(actions())}
		{...other}>
		<List
			c:leading={props['c:leading']}
			c:trailing={props['c:trailing']}
			c:subtitle={props.children}
			c:trailingAutoTabIndex={props['c:trailingAutoTabIndex']}>
			{ props['c:header'] }
		</List>
		<Show when={actions()}>
			<Show
				when={props['c:actionAutoTabIndex']}
				fallback={<div class="c-toast-actions">
					{actions()}
				</div>}>
				<FocusableGroup
					class="c-toast-actions"
					c:arrowOptions={{
						left: 'prev',
						right: 'next'
					}}>
					{actions()}
				</FocusableGroup>
			</Show>
		</Show>
	</Popover>)
}

export {
	Toast,
	openToast,
	closeToast,
	isToastOpen,
	ToastPosition
}
export type {
	ToastProps,
	ToastEvents
}
export default Toast