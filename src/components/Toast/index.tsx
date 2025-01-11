import { type JSX, type ParentComponent, splitProps, children, onMount, onCleanup, Show, mergeProps } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist } from "@/utils/attributes"
import { event_add_listener, event_remove_listener } from "@/utils/event"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { element_dispatch_event } from "@/utils/element"
import { document_body } from "@/utils/document"

import List from "@/components/List"
import Popover, { type PopoverProps, close_popover, open_popover, is_popover_open as is_toast_open, PopoverPosition } from "@/components/Popover"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

enum ToastPosition {
	left_top,
	center_top,
	right_top,
	left_bottom,
	center_bottom,
	right_bottom
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

function open_toast(
	event: Event,
	toast: HTMLDivElement,
	options?: Omit<ToastOpenDetail, 'event'>
): void {
	element_dispatch_event(toast, new CustomEvent(
		ToastEvents.open,
		{detail: {event, ...options} satisfies ToastOpenDetail}
	))
}

function close_toast(toast: HTMLDivElement): void {
	element_dispatch_event(toast, new CustomEvent(ToastEvents.close))
}

type ToastProps = PopoverProps & {
	c_header?: JSX.Element
	c_actions?: JSX.Element
	c_action_auto_tabindex?: boolean
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_trailing_auto_tabindex?: boolean
}
const Toast: ParentComponent<ToastProps> = ($props) => {
	const $$props = mergeProps({
		c_action_auto_tabindex: true,
		c_trailing_auto_tabindex: true,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_leading', 'c_trailing', 'children', 'c_header',
		'c_actions', 'classList', 'ref', 'c_on_toggleopen',
		'c_trailing_auto_tabindex', 'c_action_auto_tabindex'
	])
	const actions = children(() => props.c_actions)
	let toast_ref: HTMLDivElement
	let is_open = false
	let timeout_id: number | null = null

	function close_toast(): void {
		if (!is_open) return;
		if (timeout_id != null) {
			timeout_clear(timeout_id)
			timeout_id = null
		}
		close_popover(toast_ref)
	}

	function open_toast(options: ToastOpenDetail): void {
		if (is_open) return

		const {
			event,
			position = ToastPosition.center_top,
			autoclose = true,
			duration = 5E3
		} = options;

		let $position = PopoverPosition.center_center_top
		if (position == ToastPosition.left_top) $position = PopoverPosition.center_center_left_top
		else if (position == ToastPosition.left_bottom) $position = PopoverPosition.center_center_left_bottom
		else if (position == ToastPosition.center_top) $position = PopoverPosition.center_center_top
		else if (position == ToastPosition.center_bottom) $position = PopoverPosition.center_center_bottom
		else if (position == ToastPosition.right_top) $position = PopoverPosition.center_center_right_top
		else if (position == ToastPosition.right_bottom) $position = PopoverPosition.center_center_right_bottom

		open_popover(event, toast_ref, {
			anchor: document_body(),
			manual_dismiss: true,
			position: $position
		})

		if (!autoclose) return;

		timeout_id = timeout_set(() => {
			close_toast()
			timeout_id = null
		}, duration)
	}

	function custom_on_open(ev: CustomEvent): void {
		open_toast(ev.detail as ToastOpenDetail)
	}

	function custom_on_close(_ev: CustomEvent): void {
		close_toast()
	}

	function init_custom_event(): void {
		event_add_listener<CustomEvent>(toast_ref, ToastEvents.open, custom_on_open)
		event_add_listener<CustomEvent>(toast_ref, ToastEvents.close, custom_on_close)

		onCleanup(() => {
			event_remove_listener<CustomEvent>(toast_ref, ToastEvents.open, custom_on_open)
			event_remove_listener<CustomEvent>(toast_ref, ToastEvents.close, custom_on_close)
		})
	}

	onMount(() => {
		init_custom_event()
	})

	return (<Popover
		c_on_toggleopen={o => {
			is_open = o
			props.c_on_toggleopen?.(o)
		}}
		ref={mergeRefs(props.ref, r => toast_ref = r)}
		classList={{
			'c-toast': true,
			...props.classList
		}}
		data-c-actions={attr_set_if_exist(actions())}
		{...other}>
		<List
			c_leading={props.c_leading}
			c_trailing={props.c_trailing}
			c_subtitle={props.children}
			c_trailing_auto_tabindex={props.c_trailing_auto_tabindex}>
			{ props.c_header }
		</List>
		<Show when={actions()}>
			<Show
				when={props.c_action_auto_tabindex}
				fallback={<div class="c-toast-actions">
					{actions()}
				</div>}>
				<FocusableGroup
					class="c-toast-actions"
					c_arrow_options={{
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
	open_toast,
	close_toast,
	is_toast_open,
	ToastPosition
}
export type {
	ToastProps,
	ToastEvents
}
export default Toast