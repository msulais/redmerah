import { createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { get_flyout_position } from '@/utils/flyout'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { attr_has, attr_remove, attr_set, attr_set_if_exist, classlist } from '@/utils/attributes'
import { element_animate, element_client_width, element_dataset, element_dispatch_event, element_focus, element_is_same_node, element_rect, element_scroll_top, get_multiple_element_by_selector } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { event_add_listener, call_event_handler, event_prevent_default, event_remove_listener, event_stop_immediate_propagation } from "@/utils/event"
import { math_abs } from '@/utils/math'
import { BodyEvents } from '@/enums/events'
import { array_at, array_find_index, array_length, array_push, array_some, array_splice } from '@/utils/array'
import { rect_bottom, rect_height, rect_left, rect_right, rect_top, rect_width } from '@/utils/rect'
import { promise_done } from '@/utils/object'

import './index.scss'

type ModalOpenDetail = {
	event: Event
	anchor?: HTMLElement

	/** Use this if you want to override the `ModalOpenDetail.anchor` `DOMRect` */
	anchor_rect?: DOMRect
	gap?: number
	padding?: number
	important?: boolean
	position?: ModalPosition
	allow_hide_anchor?: boolean
	draggable?: boolean
	content_auto_focus?: boolean

	/**
	 * Custom pointer position. Only works if `ModalOpenDetail.anchor` and
	 * `ModalOpenDetail.anchor_rect` set to `undefined`
	 * */
	pointer?: {
		x: number
		y: number
	}
}

type ModalCloseDetail = {
	soft?: boolean
}

enum ModalEvents {
	on_short_focus = 'on-short-focus-modal',

	/** @param {ModalCloseDetail} detail `ModalCloseDetail` */
	on_close = 'on-close-modal',

	on_reposition = 'on-reposition-modal',

	/** @param {ModalOpenDetail} detail `ModalOpenDetail` */
	on_open = 'on-open-modal'
}

function is_modal_open(modal: HTMLDialogElement): boolean {
	return element_dataset(modal, 'cOpen') != undefined
}

function open_modal(
	event: Event,
	modal: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'>
): void {
	element_dispatch_event(modal, new CustomEvent(
		ModalEvents.on_open,
		{detail: {event: event, ...options} satisfies ModalOpenDetail}
	))
	element_dispatch_event(document.body, new CustomEvent(
		BodyEvents.open_modal,
		{detail: {element: modal}}
	))
}

function init_modal_listener(): void {
	const body = document.body

	// make sure to call this listener once
	if (attr_has(body, BodyAttributes.modal_listener)) return;
	attr_set(body, BodyAttributes.modal_listener)

	const selector: string = 'dialog.c-modal[open]'
	const modals: HTMLDialogElement[] = []
	let is_no_pointer_event: boolean = false
	let scroll_top: number = 0
	let timeout_id: number | null = null
	let close_timeout_id: number | null = null

	// make sure not to close other modal after closing some modal
	let removed = false

	event_add_listener<CustomEvent<{element: HTMLDialogElement}>>(body, BodyEvents.open_modal, ev => {
		const element: HTMLDialogElement = ev.detail.element
		const is_exist = array_some(modals, modal => element_is_same_node(modal, element))
		if (is_exist) return;

		array_push(modals, element)
	})

	event_add_listener<CustomEvent<{element: HTMLDialogElement}>>(body, BodyEvents.close_modal, ev => {
		const element: HTMLDialogElement = ev.detail.element
		const index = array_find_index(modals, modal => element_is_same_node(modal, element))
		if (index < 0) return;

		array_splice(modals, index, 1)
		removed = array_length(modals) > 0

		if (!removed) return

		if (close_timeout_id != null) timeout_clear(close_timeout_id)
		close_timeout_id = timeout_set(() => {
			removed = false
			close_timeout_id = null
		}, 50)
	})

	// use for click outside modal
	event_add_listener(document, 'click', async (ev: Event) => {
		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have modal but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, modal will not automatically closed.
		if (is_no_pointer_event || array_length(modals) == 0 || removed || !(ev as any).pointerType) {
			removed = false
			return
		}
		const modal: HTMLDialogElement = array_at(modals, -1)!
		const pointer = {
			x: (ev as MouseEvent).clientX,
			y: (ev as MouseEvent).clientY
		}

		const modal_rect = element_rect(modal)
		const is_clicked_inside = pointer.x >= rect_left(modal_rect)
			&& pointer.x <= rect_right(modal_rect)
			&& pointer.y >= rect_top(modal_rect)
			&& pointer.y <= rect_bottom(modal_rect)

		if (is_clicked_inside) return

		close_modal(modal as HTMLDialogElement, true)
	})

	event_add_listener(document, 'scroll', () => {
		if (array_length(modals) == 0) {
			scroll_top = window.scrollY || element_scroll_top(document.documentElement)
			return
		}
		window.scrollTo({
			top: scroll_top,
			behavior: 'instant'
		})
	})

	event_add_listener(window, 'resize', () => {
		if (array_length(modals) == 0) return;
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			for (const modal of get_multiple_element_by_selector(selector)) {
				reposition_modal(modal as HTMLDialogElement)
			}
			timeout_id = null
		}, 250)
	})

	new MutationObserver(() => {
		is_no_pointer_event = attr_has(
			body,
			BodyAttributes.no_pointer_event
		)
	}).observe(body, { attributes: true })
}

function reposition_modal(modal: HTMLDialogElement): void {
	element_dispatch_event(modal, new CustomEvent(ModalEvents.on_reposition))
}

function focus_modal(modal: HTMLDialogElement): void {
	element_dispatch_event(modal, new CustomEvent(ModalEvents.on_short_focus))
}

function close_modal(modal: HTMLDialogElement, soft: boolean = false): void {
	element_dispatch_event(modal, new CustomEvent(
		ModalEvents.on_close,
		{detail: {soft} satisfies ModalCloseDetail}
	))
}

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'style' | 'draggable'> & {
	style?: JSX.CSSProperties
	gap?: number
	padding?: number
	important?: boolean
	position?: ModalPosition
	allow_hide_anchor?: boolean
	draggable?: boolean
	content_auto_focus?: boolean
	on_before_open?(): unknown
	on_before_close?(): unknown
	on_toggle_open?(is_open: boolean): unknown
	open_animation?(el: HTMLDialogElement, done: () => void): unknown
	close_animation?(el: HTMLDialogElement, done: () => void): unknown
}
const Modal: ParentComponent<ModalProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'on_toggle_open', 'onClose', 'onCancel',
		'children', 'onKeyDown', 'class', 'open_animation',
		'close_animation', 'style', 'gap', 'padding',
		'important', 'position', 'allow_hide_anchor',
		'draggable', 'content_auto_focus', 'on_before_open',
		'on_before_close'
	])
	const [is_dragging, set_is_dragging] = createSignal<boolean>(false)
	const [is_draggable, set_is_draggable] = createSignal<boolean>(false)
	const [left, set_left] = createSignal<number>(0)
	const [top, set_top] = createSignal<number>(0)
	const [max_width, set_max_width] = createSignal<number | undefined>(undefined)
	const [max_height, set_max_height] = createSignal<number | undefined>(undefined)
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [attr_open, set_attr_open] = createSignal<boolean>(false)
	const [attr_open_done, set_attr_open_done] = createSignal<boolean>(false)
	const [attr_focus, set_attr_focus] = createSignal<boolean>(false)
	let $pointer: {x: number; y: number} = { x: 0, y: 0 }
	let is_open: boolean = false
	let modal_ref: HTMLDialogElement
	let focus_timeout_id: number | null = null
	let anchor_ref: HTMLElement | null = null
	let $important: boolean = false
	let $gap: number = 0
	let $padding: number = 0
	let $position: ModalPosition = ModalPosition.center_bottom
	let timeout_reposition_id: number | null = null

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diff_position_x: number = 0
	let diff_position_y: number = 0

	function fix_position(): void {
		const modal_rect = element_rect(modal_ref)
		const screen_width = element_client_width(document.body)
		const screen_height = window.innerHeight

		if (rect_left(modal_rect) < 8) set_left(8)
		if (rect_top(modal_rect) < 8) set_top(8)
		if (rect_right(modal_rect) > screen_width) set_left(screen_width - rect_width(modal_rect) - 8)
		if (rect_bottom(modal_rect) > screen_height) set_top(screen_height - rect_height(modal_rect) - 8)
	}

	function update_position(x: number, y: number) {
		set_left(x - diff_position_x)
		set_top(y - diff_position_y)
	}

	function on_pointer_move(ev: PointerEvent): void {
		if (!is_dragging()) return;

		update_position(ev.clientX, ev.clientY)
	}

	function on_pointer_up(): void {
		attr_remove(document.body, BodyAttributes.no_pointer_event)
		set_is_dragging(false)
		fix_position()
	}

	function custom_on_short_focus(): void {
		short_focus_modal()
	}

	function custom_on_close(ev: CustomEvent<ModalCloseDetail>): void {
		close_modal(ev.detail)
	}

	function custom_on_open(ev: CustomEvent<ModalOpenDetail>): void {
		open_modal(ev.detail)
	}

	function custom_on_reposition(): void {
		reposition_modal()
	}

	function add_drag_listener() {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointer_move)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointer_up)
	}

	function remove_drag_listener(): void {
		event_remove_listener<PointerEvent>(document, 'pointermove', on_pointer_move)
		event_remove_listener<PointerEvent>(document, 'pointerup', on_pointer_up)
	}

	function init_events(): void {
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.on_short_focus, custom_on_short_focus)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.on_close, custom_on_close)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.on_open, custom_on_open)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.on_reposition, custom_on_reposition)
	}

	function remove_events(): void {
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.on_short_focus, custom_on_short_focus)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.on_close, custom_on_close)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.on_open, custom_on_open)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.on_reposition, custom_on_reposition)
	}

	async function close_modal(detail: {soft?: boolean}): Promise<void> {
		const { soft = false } = detail;

		if (soft && $important && is_open) {
			focus_modal(modal_ref)
			return
		}
		if (!is_open) return;
		is_open = false

		const anchor_rect: DOMRect | undefined = anchor_ref
			? element_rect(anchor_ref)
			: undefined
		const modal_rect = element_rect(modal_ref)
		const pos = get_flyout_position({
			flyout: modal_rect,
			anchor: anchor_rect,
			gap: $gap,
			pointer: anchor_rect? undefined : $pointer,
			padding: $padding,
			position: $position
		}) as DOMRect

		const modal_position = {
			...pos,
			bottom: rect_top(pos) + rect_height(modal_rect),
			right: rect_left(pos) + rect_width(modal_rect)
		}
		const modal_mid_position = {
			x: rect_left(modal_position) + (rect_width(modal_rect) / 2),
			y: rect_top(modal_position) + (rect_height(modal_rect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchor_center_left = $pointer.x
		let anchor_center_top = $pointer.y

		if (anchor_rect) {
			anchor_center_left = rect_left(anchor_rect) + (rect_width(anchor_rect) / 2)
			anchor_center_top = rect_top(anchor_rect) + (rect_height(anchor_rect) / 2)
		}

		const range_x = math_abs(modal_mid_position.x - anchor_center_left)
		const range_y = math_abs(modal_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((modal_mid_position.x < anchor_center_top || modal_mid_position.x > anchor_center_top) && (
				$position == ModalPosition.center_bottom
				|| $position == ModalPosition.center_bottom_to_left
				|| $position == ModalPosition.center_bottom_to_right
				|| $position == ModalPosition.center_top
				|| $position == ModalPosition.center_top_to_left
				|| $position == ModalPosition.center_top_to_right
			)) {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((modal_mid_position.y < anchor_center_left || modal_mid_position.y > anchor_center_left) && (
				$position == ModalPosition.left_center
				|| $position == ModalPosition.left_center_to_bottom
				|| $position == ModalPosition.left_center_to_top
				|| $position == ModalPosition.right_center
				|| $position == ModalPosition.right_center_to_bottom
				|| $position == ModalPosition.right_center_to_top
			)) {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			} else {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			}
		}

		set_attr_open(false)
		set_attr_open_done(false)
		anchor_ref = null
		element_dispatch_event(document.body, new CustomEvent(
			BodyEvents.close_modal,
			{detail: {element: modal_ref}}
		))
		props.on_before_close?.()
		if (props.close_animation != null) props.close_animation(
			modal_ref,
			() => modal_ref.close()
		)
		else promise_done(element_animate(
			modal_ref,
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => modal_ref.close())
	}

	function short_focus_modal(): void {
		if (focus_timeout_id != null) timeout_clear(focus_timeout_id)
		set_attr_focus(true)

		focus_timeout_id = timeout_set(() => {
			set_attr_focus(false)
			focus_timeout_id = null
		}, 1000)
	}

	function open_modal(detail: ModalOpenDetail): void {
		if (is_open) return;
		props.on_toggle_open?.(true)

		const MODAL_MARGIN = 8
		const {
			event,
			pointer,
			anchor_rect,
			allow_hide_anchor = props.allow_hide_anchor ?? true,
			anchor = null,
			draggable = props.draggable ?? false,
			gap = props.gap ?? 0,
			important = props.important ?? false,
			padding = props.padding ?? 0,
			position = props.position ?? ModalPosition.center_bottom,
			content_auto_focus = props.content_auto_focus ?? false
		} = detail;

		set_allow_hide_anchor(allow_hide_anchor)
		is_open = true
		anchor_ref = anchor
		$position = position
		$gap = gap
		$padding = padding
		$important = important

		// handle drag
		if (is_draggable() && !draggable) remove_drag_listener()
		else if (!is_draggable() && draggable) add_drag_listener()
		set_is_draggable(draggable)

		modal_ref.showModal()

		// input auto focus
		if (!content_auto_focus) element_focus(modal_ref)

		const modal_rect: DOMRect = element_rect(modal_ref)
		const $anchor_rect: DOMRect | undefined = anchor_rect != null
			? anchor_rect
			: anchor
				? element_rect(anchor)
				: undefined
		const $event = (event as TouchEvent).touches
			? (event as TouchEvent).touches[0]
			: (event as MouseEvent)
		$pointer = pointer != null
			? pointer
			: {
				x: $event.clientX ?? 0,
				y: $event.clientY ?? 0
			}
		let pos = get_flyout_position({
			flyout: modal_rect,
			anchor: $anchor_rect,
			gap,
			pointer: $anchor_rect? undefined : $pointer,
			padding,
			position
		}) as DOMRect

		if (!allow_hide_anchor && anchor != null) {
			const modal_position = {
				...pos,
				bottom: rect_top(pos) + rect_height(modal_rect),
				right: rect_left(pos) + rect_width(modal_rect)
			}
			const anchor_mid_position = {
				x: rect_left($anchor_rect!) + (rect_width($anchor_rect!) / 2),
				y: rect_top($anchor_rect!) + (rect_height($anchor_rect!) / 2),
			}
			const modal_mid_position = {
				x: rect_left(modal_position) + (rect_width(modal_rect) / 2),
				y: rect_top(modal_position) + (rect_height(modal_rect) / 2),
			}
			const range_x = math_abs(modal_mid_position.x - anchor_mid_position.x)
			const range_y = math_abs(modal_mid_position.y - anchor_mid_position.y)
			const is_left_side = modal_mid_position.x < anchor_mid_position.x
			const is_right_side = modal_mid_position.x > anchor_mid_position.x
			const is_top_side = modal_mid_position.y < anchor_mid_position.y
			const is_bottom_side = modal_mid_position.y > anchor_mid_position.y

			if (range_x > range_y){
				// left side
				if (is_left_side && rect_right(modal_position) > rect_left($anchor_rect!)) {
					set_max_width(rect_left($anchor_rect!) - MODAL_MARGIN - gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(modal_position) < rect_right($anchor_rect!)) {
					set_max_width((element_client_width(document.body) - rect_right($anchor_rect!)) - MODAL_MARGIN - gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(modal_position) > rect_top($anchor_rect!)) {
					set_max_height(rect_top($anchor_rect!) - MODAL_MARGIN - gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(modal_position) < rect_bottom($anchor_rect!)) {
					set_max_height((window.innerHeight - rect_bottom($anchor_rect!)) - MODAL_MARGIN - gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(modal_ref),
				anchor: $anchor_rect,
				gap,
				pointer: $anchor_rect? undefined : $pointer,
				padding,
				position
			}) as DOMRect
		}

		const modal_position = {
			...pos,
			bottom: rect_top(pos) + rect_height(modal_rect),
			right: rect_left(pos) + rect_width(modal_rect)
		}
		const modal_mid_position = {
			x: rect_left(modal_position) + (rect_width(modal_rect) / 2),
			y: rect_top(modal_position) + (rect_height(modal_rect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchor_center_left = $pointer.x
		let anchor_center_top = $pointer.y

		if (anchor_rect) {
			anchor_center_left = rect_left(anchor_rect) + (rect_width(anchor_rect) / 2)
			anchor_center_top = rect_top(anchor_rect) + (rect_height(anchor_rect) / 2)
		}

		const range_x = math_abs(modal_mid_position.x - anchor_center_left)
		const range_y = math_abs(modal_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((modal_mid_position.x < anchor_center_top || modal_mid_position.x > anchor_center_top) && (
				$position == ModalPosition.center_bottom
				|| $position == ModalPosition.center_bottom_to_left
				|| $position == ModalPosition.center_bottom_to_right
				|| $position == ModalPosition.center_top
				|| $position == ModalPosition.center_top_to_left
				|| $position == ModalPosition.center_top_to_right
			)) {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((modal_mid_position.y < anchor_center_left || modal_mid_position.y > anchor_center_left) && (
				$position == ModalPosition.left_center
				|| $position == ModalPosition.left_center_to_bottom
				|| $position == ModalPosition.left_center_to_top
				|| $position == ModalPosition.right_center
				|| $position == ModalPosition.right_center_to_bottom
				|| $position == ModalPosition.right_center_to_top
			)) {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			} else {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			}
		}

		set_top(rect_top(pos))
		set_left(rect_left(pos))
		set_attr_open(true)
		props.on_before_open?.()
		if (props.open_animation != null) props.open_animation(
			modal_ref,
			() => set_attr_open_done(true)
		)
		else promise_done(element_animate(
			modal_ref,
			{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => set_attr_open_done(true))

		// stop reaching to `document.onclick`
		event_stop_immediate_propagation(event)
	}

	function reposition_modal(): void {
		if (anchor_ref == null) {
			fix_position()
			return
		}

		const MODAL_MARGIN = 8
		const anchor_rect = element_rect(anchor_ref)
		const modal_rect = element_rect(modal_ref)

		let pos = get_flyout_position({
			flyout: modal_rect,
			anchor: anchor_rect,
			gap: $gap,
			position: $position,
			padding: $padding
		}) as DOMRect

		if (!allow_hide_anchor()) {
			const modal_position = {
				...pos,
				bottom: rect_top(pos) + rect_height(modal_rect),
				right: rect_left(pos) + rect_width(modal_rect)
			}
			const anchor_mid_position = {
				x: rect_left(anchor_rect!) + (rect_width(anchor_rect!) / 2),
				y: rect_top(anchor_rect!) + (rect_height(anchor_rect!) / 2),
			}
			const modal_mid_position = {
				x: rect_left(modal_position) + (rect_width(modal_rect) / 2),
				y: rect_top(modal_position) + (rect_height(modal_rect) / 2),
			}
			const range_x = math_abs(modal_mid_position.x - anchor_mid_position.x)
			const range_y = math_abs(modal_mid_position.y - anchor_mid_position.y)
			const is_left_side = modal_mid_position.x < anchor_mid_position.x
			const is_right_side = modal_mid_position.x > anchor_mid_position.x
			const is_top_side = modal_mid_position.y < anchor_mid_position.y
			const is_bottom_side = modal_mid_position.y > anchor_mid_position.y

			if (range_x > range_y){
				// left side
				if (is_left_side && rect_right(modal_position) > rect_left(anchor_rect!)) {
					set_max_width(rect_left(anchor_rect!) - MODAL_MARGIN - $gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(modal_position) < rect_right(anchor_rect!)) {
					set_max_width((element_client_width(document.body) - rect_right(anchor_rect!)) - MODAL_MARGIN - $gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(modal_position) > rect_top(anchor_rect!)) {
					set_max_height(rect_top(anchor_rect!) - MODAL_MARGIN - $gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(modal_position) < rect_bottom(anchor_rect!)) {
					set_max_height((window.innerHeight - rect_bottom(anchor_rect!)) - MODAL_MARGIN - $gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(modal_ref),
				anchor: anchor_rect,
				gap: $gap,
				position: $position,
				padding: $padding
			}) as DOMRect
		}

		set_top(rect_top(pos))
		set_left(rect_left(pos))
	}

	function init_observer(): void {
		const observer = new ResizeObserver(() => {
			if (timeout_reposition_id != null) timeout_clear(timeout_reposition_id)
			timeout_reposition_id = timeout_set(() => {
				reposition_modal()
				timeout_reposition_id = null
			}, 300)
		})
		observer.observe(modal_ref, {box: 'border-box'})

		onCleanup(() => {
			observer.disconnect()
		})
	}

	onMount(() => {
		init_modal_listener()
		init_events()
		init_observer()
	})

	onCleanup(async () => {
		remove_events()
		await close_modal({})
	})

	return (<Portal><dialog
		class={classlist('c-modal', props.class ?? '')}
		ref={mergeRefs(props.ref, r => modal_ref = r)}
		style={{
			...props.style,
			top: props.style?.top ?? top() + 'px',
			left: props.style?.left ?? left() + 'px',
			"max-width": !allow_hide_anchor()
				? max_width() != undefined
					? max_width() + 'px'
					: props.style?.['max-width'] ?? undefined
				: props.style?.['max-width'] ?? undefined,
			"max-height": !allow_hide_anchor()
				? max_height() != undefined
					? max_height() + 'px'
					: props.style?.['max-height'] ?? undefined
				: props.style?.['max-height'] ?? undefined,
		}}
		onKeyDown={(ev) => {
			if (ev.key == 'Escape'
				&& !ev.altKey
				&& !ev.ctrlKey
				&& !ev.metaKey
				&& !ev.shiftKey
				&& $important
			){
				focus_modal(modal_ref)
				event_prevent_default(ev)
			}
			call_event_handler(ev, props.onKeyDown)
		}}
		onCancel={(ev) => {
			call_event_handler(ev, props.onCancel)
			if ($important) {
				event_prevent_default(ev)
				return
			}
			close_modal({soft: true})
			event_prevent_default(ev)
		}}
		onClose={(ev) => {
			props.on_toggle_open?.(false)
			is_open = false
			call_event_handler(ev, props.onClose)
		}}
		data-c-draggable={attr_set_if_exist(is_draggable())}
		data-c-drag={attr_set_if_exist(is_dragging())}
		data-c-focus={attr_set_if_exist(attr_focus())}
		data-c-open={attr_set_if_exist(attr_open())}
		data-c-open-done={attr_set_if_exist(attr_open_done())}
		{...other}>
		<Show when={is_draggable()}>
			<span
				class="c-modal-drag-handle"
				draggable={false}
				data-g-keep-pointer-event={attr_set_if_exist(is_dragging())}
				onPointerDown={(ev) => {
					const rect = element_rect(modal_ref)
					set_is_dragging(true)
					attr_set(document.body, BodyAttributes.no_pointer_event)
					diff_position_x = ev.clientX - rect.x
					diff_position_y = ev.clientY - rect.y
				}}
				onDblClick={() => reposition_modal()}
			/>
		</Show>
		<div>
			{props.children}
		</div>
	</dialog></Portal>)
}

export {
	Modal,
	close_modal,
	focus_modal,
	reposition_modal,
	open_modal,
	is_modal_open,
	ModalEvents,
	ModalPosition
}
export type {
	ModalProps,
	ModalOpenDetail,
	ModalCloseDetail
}
export default Modal