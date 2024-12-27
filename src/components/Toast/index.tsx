import { type JSX, type ParentComponent, splitProps, children, onMount, onCleanup, Show, createEffect } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist } from "@/utils/attributes"
import { event_add_listener, event_current_target, event_remove_listener } from "@/utils/event"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { element_children, element_dispatch_event, element_focus_by_arrowkey, element_is_same_node, element_set_tabindex, element_tagname } from "@/utils/element"
import { document_active } from "@/utils/document"

import List from "@/components/List"
import Popover, { type PopoverProps, close_popover, open_popover, is_popover_open as is_toast_open, PopoverPosition } from "@/components/Popover"
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
	on_open = 'on-open-toast',
	on_close = 'on-close-toast'
}

function open_toast(
	event: Event,
	toast: HTMLDivElement,
	options?: Omit<ToastOpenDetail, 'event'>
): void {
	element_dispatch_event(toast, new CustomEvent(
		ToastEvents.on_open,
		{detail: {event, ...options} satisfies ToastOpenDetail}
	))
}

function close_toast(toast: HTMLDivElement): void {
	element_dispatch_event(toast, new CustomEvent(ToastEvents.on_close))
}

type ToastProps = PopoverProps & {
	header?: JSX.Element
	actions?: JSX.Element
	leading?: JSX.Element
	trailing?: JSX.Element
}
const Toast: ParentComponent<ToastProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'leading', 'trailing', 'children',
		'header', 'actions', 'classList',
		'ref', 'on_toggle_open'
	])
	const actions = children(() => props.actions)
	let toast_ref: HTMLDivElement
	let is_open = false
	let timeout_id: number | null = null
	let div_action_ref: HTMLDivElement | undefined

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
			anchor: document.body,
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
		event_add_listener<CustomEvent>(toast_ref, ToastEvents.on_open, custom_on_open)
		event_add_listener<CustomEvent>(toast_ref, ToastEvents.on_close, custom_on_close)

		onCleanup(() => {
			event_remove_listener<CustomEvent>(toast_ref, ToastEvents.on_open, custom_on_open)
			event_remove_listener<CustomEvent>(toast_ref, ToastEvents.on_close, custom_on_close)
		})
	}

	onMount(() => {
		init_custom_event()
	})


	createEffect(() => {
		actions()
		if (!div_action_ref) return

		let is_no_tabindex_0 = true
		const children = element_children<HTMLButtonElement>(div_action_ref)
		for (const child of children) {
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
	})

	return (<Popover
		on_toggle_open={o => {
			is_open = o
			props.on_toggle_open?.(o)
		}}
		ref={mergeRefs(props.ref, r => toast_ref = r)}
		classList={{
			'c-toast': true,
			...props.classList
		}}
		data-c-actions={attr_set_if_exist(actions())}
		{...other}>
		<List
			leading={props.leading}
			trailing={props.trailing}
			subtitle={props.children}>
			{ props.header }
		</List>
		<Show when={actions()}>
			<div
				ref={div_action_ref}
				class="c-toast-actions"
				onKeyDown={ev => {
					const active = document_active()
					if (!active) return

					const tag_name = element_tagname(active)
					if (tag_name == 'INPUT' || tag_name == 'TEXTAREA') return;

					element_focus_by_arrowkey(
						event_current_target(ev),
						ev.code,
						{ left: 'prev', right: 'next' },
						(el) => element_tagname(el) != 'INPUT' && element_tagname(el) != 'TEXTAREA'
					)
				}}>{actions()}</div>
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