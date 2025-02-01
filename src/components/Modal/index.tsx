import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { get_flyout_position } from '@/utils/flyout'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { attr_has, attr_remove, attr_set, attr_set_if_exist, classlist } from '@/utils/attributes'
import { element_animate, element_client_width, element_dataset, element_dispatch_event, element_focus, element_is_same_node, element_rect, element_scroll_top, element_all_by_selector, element_append_child, element_create, element_set_id, element_set_style, element_release_pointercapture, element_set_pointercapture } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { event_add_listener, event_call, event_current_target, event_prevent_default, event_remove_listener, event_target, event_type } from "@/utils/event"
import { math_abs } from '@/utils/math'
import { array_at, array_find_index, array_length, array_push, array_some, array_splice } from '@/utils/array'
import { rect_bottom, rect_height, rect_left, rect_right, rect_top, rect_width } from '@/utils/rect'
import { document_body, document_root } from '@/utils/document'
import { window_inner_height, window_scroll_y, window_scrollto } from '@/utils/window'
import { ElementIds } from '@/enums/ids'
import { promise_done } from '@/utils/object'
import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from '@/constants/key_code'

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
	shortfocus = 'custom:modal-shortfocus',

	/** @param {ModalCloseDetail} detail `ModalCloseDetail` */
	close = 'custom:modal-close',

	reposition = 'custom:modal-reposition',

	/** @param {ModalOpenDetail} detail `ModalOpenDetail` */
	open = 'custom:modal-open'
}

enum ModalListenerEvents {
	/** @param modal `HTMLDialogElement` */
	open = 'custom:modallistener-open',

	/** @param modal `HTMLDialogElement` */
	close = 'custom:modallistener-close'
}

let LISTENER_REF: HTMLDivElement
let STOP_GLOBAL_CLICK: boolean = false
let HAS_MODAL_LISTENER: boolean = false
const MODAL_CLASS = 'c-modal'
const MODAL_MARGIN = 8

function is_modal_open(modal: HTMLDialogElement): boolean {
	return element_dataset(modal, 'cOpen') != undefined
}

function open_modal(
	event: Event,
	modal: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'>
): void {
	element_dispatch_event(modal, new CustomEvent(
		ModalEvents.open,
		{detail: {event: event, ...options} satisfies ModalOpenDetail}
	))
}

function init_modal_listener(): void {
	if (HAS_MODAL_LISTENER) return;
	HAS_MODAL_LISTENER = true

	const body = document_body()
	const selector: string = 'dialog.c-modal[open]'
	const modals: HTMLDialogElement[] = []
	let is_no_pointer_event: boolean = false
	let scroll_top: number = 0
	let timeout_id: number | null = null
	let close_timeout_id: number | null = null

	// make sure not to close other modal after closing some modal
	let removed = false

	function create_listener_element(): void {
		const div = element_create('div')
		element_set_style(div, 'display', 'contents')
		element_set_id(div, ElementIds.modal_listener)
		element_append_child(body, div)

		LISTENER_REF = div
	}

	function reposition_all_modal(): void {
		if (array_length(modals) == 0) return;
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			for (const modal of element_all_by_selector(selector)) {
				reposition_modal(modal as HTMLDialogElement)
			}
			timeout_id = null
		}, 250)
	}

	function open(ev: CustomEvent<HTMLDialogElement>): void {
		const element: HTMLDialogElement = ev.detail
		const is_exist = array_some(modals, modal => element_is_same_node(modal, element))
		if (is_exist) return;

		array_push(modals, element)
	}

	function close(ev: CustomEvent<HTMLDialogElement>): void {
		const element = ev.detail
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
	}

	function global_click(ev: MouseEvent): void {
		if (STOP_GLOBAL_CLICK) {
			STOP_GLOBAL_CLICK = false
			return
		}

		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have modal but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, modal will not automatically closed.
		if (
			is_no_pointer_event
			|| array_length(modals) == 0
			|| removed
			|| !(ev as any).pointerType) {
			removed = false
			return
		}
		const modal: HTMLDialogElement = array_at(modals, -1)!
		const is_clicked_inside = modal !== event_target(ev)
		if (is_clicked_inside) return

		close_modal(modal as HTMLDialogElement, true)
	}

	function global_scroll(): void {
		if (array_length(modals) == 0) {
			scroll_top = window_scroll_y() || element_scroll_top(document_root())
			return
		}

		window_scrollto({
			top: scroll_top,
			behavior: 'instant'
		})
	}

	function init_events(): void {
		event_add_listener<CustomEvent<HTMLDialogElement>>(
			LISTENER_REF,
			ModalListenerEvents.open,
			open
		)

		event_add_listener<CustomEvent<HTMLDialogElement>>(
			LISTENER_REF,
			ModalListenerEvents.close,
			close
		)

		event_add_listener(document, 'click', global_click)
		event_add_listener(document, 'scroll', global_scroll)
		event_add_listener(window, 'resize', reposition_all_modal)
	}

	function init_observer(): void {
		new MutationObserver(() => {
			is_no_pointer_event = attr_has(body, BodyAttributes.no_pointer_event)
		}).observe(body, { attributes: true })
	}

	create_listener_element()
	init_events()
	init_observer()
}

function reposition_modal(modal: HTMLDialogElement): void {
	element_dispatch_event(modal, new CustomEvent(ModalEvents.reposition))
}

function focus_modal(modal: HTMLDialogElement): void {
	element_dispatch_event(modal, new CustomEvent(ModalEvents.shortfocus))
}

function close_modal(modal: HTMLDialogElement, soft: boolean = false): void {
	element_dispatch_event(modal, new CustomEvent(
		ModalEvents.close,
		{detail: {soft} satisfies ModalCloseDetail}
	))
}

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'style'> & {
	style?: JSX.CSSProperties
	c_portal_mount?: Node
	c_gap?: number
	c_padding?: number
	c_important?: boolean
	c_position?: ModalPosition
	c_allow_hide_anchor?: boolean
	c_draggable?: boolean
	c_content_auto_focus?: boolean
	c_attr_content_wrapper?: JSX.HTMLAttributes<HTMLDivElement>
	c_on_beforeopen?(): unknown
	c_on_beforeclose?(): unknown
	c_on_toggleopen?(is_open: boolean): unknown
	c_open_animation?(el: HTMLDialogElement, done: () => void): unknown
	c_close_animation?(el: HTMLDialogElement, done: () => void): unknown
}
const Modal: ParentComponent<ModalProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c_on_toggleopen', 'onClose', 'onCancel',
		'children', 'onKeyDown', 'class', 'c_open_animation',
		'c_close_animation', 'style', 'c_gap', 'c_padding',
		'c_important', 'c_position', 'c_allow_hide_anchor',
		'c_draggable', 'c_content_auto_focus', 'c_on_beforeopen',
		'c_on_beforeclose', 'c_attr_content_wrapper',
		'c_portal_mount'
	])
	const style = createMemo(() => props.style)
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
	let pointer_x: number = 0
	let pointer_y: number = 0
	let is_open: boolean = false
	let modal_ref: HTMLDialogElement
	let focus_timeout_id: number | null = null
	let anchor_ref: HTMLElement | null = null
	let important: boolean = false
	let gap: number = 0
	let padding: number = 0
	let position: ModalPosition = ModalPosition.center_bottom
	let timeout_reposition_id: number | null = null
	let timeout_screensize_id: number | null = null
	let timeout_fixposition_id: number | null = null
	let screen_width = element_client_width(document_body())
	let screen_height = window_inner_height()

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diff_position_x: number = 0
	let diff_position_y: number = 0

	function fix_position(): void {
		const modal_rect = element_rect(modal_ref)
		const screen_width = element_client_width(document_body())
		const screen_height = window_inner_height()

		if (rect_left(modal_rect) < MODAL_MARGIN) set_left(MODAL_MARGIN)
		if (rect_top(modal_rect) < MODAL_MARGIN) set_top(MODAL_MARGIN)
		if (rect_right(modal_rect) > screen_width) set_left(screen_width - rect_width(modal_rect) - MODAL_MARGIN)
		if (rect_bottom(modal_rect) > screen_height) set_top(screen_height - rect_height(modal_rect) - MODAL_MARGIN)
	}

	function update_position(x: number, y: number) {
		set_left(x - diff_position_x)
		set_top(y - diff_position_y)
	}

	function on_pointer_move(ev: PointerEvent): void {
		if (!is_dragging()) return;

		update_position(ev.clientX, ev.clientY)
	}

	function on_pointer_up(ev: PointerEvent & { currentTarget: HTMLSpanElement }): void {
		if (!is_dragging()) return;

		attr_remove(document_body(), BodyAttributes.no_pointer_event)
		element_release_pointercapture(event_current_target(ev), ev.pointerId)
		set_is_dragging(false)
		fix_position()
		STOP_GLOBAL_CLICK = true
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

	function init_events(): void {
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.shortfocus, custom_on_short_focus)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.close, custom_on_close)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.open, custom_on_open)
		event_add_listener<CustomEvent>(modal_ref, ModalEvents.reposition, custom_on_reposition)
	}

	function remove_events(): void {
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.shortfocus, custom_on_short_focus)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.close, custom_on_close)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.open, custom_on_open)
		event_remove_listener<CustomEvent>(modal_ref, ModalEvents.reposition, custom_on_reposition)
	}

	async function close_modal(detail: {soft?: boolean}): Promise<void> {
		const { soft = false } = detail;

		if (soft && important && is_open) {
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
			gap: gap,
			pointer: anchor_rect? undefined : {
				x: pointer_x,
				y: pointer_y
			},
			padding: padding,
			position: position
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

		let anchor_center_left = pointer_x
		let anchor_center_top = pointer_y

		if (anchor_rect) {
			anchor_center_left = rect_left(anchor_rect) + (rect_width(anchor_rect) / 2)
			anchor_center_top = rect_top(anchor_rect) + (rect_height(anchor_rect) / 2)
		}

		const range_x = math_abs(modal_mid_position.x - anchor_center_left)
		const range_y = math_abs(modal_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((modal_mid_position.x < anchor_center_top || modal_mid_position.x > anchor_center_top) && (
				position == ModalPosition.center_bottom
				|| position == ModalPosition.center_bottom_to_left
				|| position == ModalPosition.center_bottom_to_right
				|| position == ModalPosition.center_top
				|| position == ModalPosition.center_top_to_left
				|| position == ModalPosition.center_top_to_right
			)) {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((modal_mid_position.y < anchor_center_left || modal_mid_position.y > anchor_center_left) && (
				position == ModalPosition.left_center
				|| position == ModalPosition.left_center_to_bottom
				|| position == ModalPosition.left_center_to_top
				|| position == ModalPosition.right_center
				|| position == ModalPosition.right_center_to_bottom
				|| position == ModalPosition.right_center_to_top
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
		element_dispatch_event(LISTENER_REF, new CustomEvent(
			ModalListenerEvents.close,
			{detail: modal_ref}
		))
		props.c_on_beforeclose?.()
		if (props.c_close_animation != null) props.c_close_animation(
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
		props.c_on_toggleopen?.(true)

		const MODAL_MARGIN = 8
		const {
			event,
			pointer,
			anchor_rect,
			allow_hide_anchor = props.c_allow_hide_anchor ?? true,
			anchor = null,
			draggable = props.c_draggable ?? false,
			gap: input_gap = props.c_gap ?? 0,
			important: input_important = props.c_important ?? false,
			padding: input_padding = props.c_padding ?? 0,
			position: input_position = props.c_position ?? ModalPosition.center_bottom,
			content_auto_focus = props.c_content_auto_focus ?? true
		} = detail;

		set_allow_hide_anchor(allow_hide_anchor)
		is_open = true
		anchor_ref = anchor
		position = input_position
		gap = input_gap
		padding = input_padding
		important = input_important
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
		pointer_x = pointer? pointer.x : $event.clientX ?? 0
		pointer_y = pointer? pointer.y : $event.clientY ?? 0
		let pos = get_flyout_position({
			flyout: modal_rect,
			anchor: $anchor_rect,
			gap: input_gap,
			pointer: $anchor_rect? undefined : {
				x: pointer_x,
				y: pointer_y
			},
			padding: input_padding,
			position: input_position
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
					set_max_width(rect_left($anchor_rect!) - MODAL_MARGIN - input_gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(modal_position) < rect_right($anchor_rect!)) {
					set_max_width((element_client_width(document_body()) - rect_right($anchor_rect!)) - MODAL_MARGIN - input_gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(modal_position) > rect_top($anchor_rect!)) {
					set_max_height(rect_top($anchor_rect!) - MODAL_MARGIN - input_gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(modal_position) < rect_bottom($anchor_rect!)) {
					set_max_height((window_inner_height() - rect_bottom($anchor_rect!)) - MODAL_MARGIN - input_gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(modal_ref),
				anchor: $anchor_rect,
				gap: input_gap,
				pointer: $anchor_rect? undefined : {
					x: pointer_x,
					y: pointer_y
				},
				padding: input_padding,
				position: input_position
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

		let anchor_center_left = pointer_x
		let anchor_center_top = pointer_y

		if (anchor_rect) {
			anchor_center_left = rect_left(anchor_rect) + (rect_width(anchor_rect) / 2)
			anchor_center_top = rect_top(anchor_rect) + (rect_height(anchor_rect) / 2)
		}

		const range_x = math_abs(modal_mid_position.x - anchor_center_left)
		const range_y = math_abs(modal_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((modal_mid_position.x < anchor_center_top || modal_mid_position.x > anchor_center_top) && (
				position == ModalPosition.center_bottom
				|| position == ModalPosition.center_bottom_to_left
				|| position == ModalPosition.center_bottom_to_right
				|| position == ModalPosition.center_top
				|| position == ModalPosition.center_top_to_left
				|| position == ModalPosition.center_top_to_right
			)) {
				if (modal_mid_position.y > anchor_center_top ) translate.top = -12
				if (modal_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (modal_mid_position.x > anchor_center_left) translate.left = -12
				if (modal_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((modal_mid_position.y < anchor_center_left || modal_mid_position.y > anchor_center_left) && (
				position == ModalPosition.left_center
				|| position == ModalPosition.left_center_to_bottom
				|| position == ModalPosition.left_center_to_top
				|| position == ModalPosition.right_center
				|| position == ModalPosition.right_center_to_bottom
				|| position == ModalPosition.right_center_to_top
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
		props.c_on_beforeopen?.()
		element_dispatch_event(LISTENER_REF, new CustomEvent(
			ModalListenerEvents.open,
			{detail: modal_ref}
		))
		if (props.c_open_animation != null) props.c_open_animation(
			modal_ref,
			() => set_attr_open_done(true)
		)
		else promise_done(element_animate(
			modal_ref,
			{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => set_attr_open_done(true))

		STOP_GLOBAL_CLICK = event_type(event) == 'click'
	}

	function reposition_modal(): void {
		if (anchor_ref == null) {
			fix_position()
			return
		}

		const anchor_rect = element_rect(anchor_ref)
		const modal_rect = element_rect(modal_ref)

		let pos = get_flyout_position({
			flyout: modal_rect,
			anchor: anchor_rect,
			gap: gap,
			position: position,
			padding: padding
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
					set_max_width(rect_left(anchor_rect!) - MODAL_MARGIN - gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(modal_position) < rect_right(anchor_rect!)) {
					set_max_width((element_client_width(document_body()) - rect_right(anchor_rect!)) - MODAL_MARGIN - gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(modal_position) > rect_top(anchor_rect!)) {
					set_max_height(rect_top(anchor_rect!) - MODAL_MARGIN - gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(modal_position) < rect_bottom(anchor_rect!)) {
					set_max_height((window_inner_height() - rect_bottom(anchor_rect!)) - MODAL_MARGIN - gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(modal_ref),
				anchor: anchor_rect,
				gap: gap,
				position: position,
				padding: padding
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
			}, 200)
		})
		observer.observe(modal_ref, {box: 'border-box'})

		onCleanup(() => {
			observer.disconnect()
		})
	}

	function on_move_with_keyboard(ev: KeyboardEvent): void {
		const code = ev.code
		if (
			code != KEY_ARROW_UP
			&& code != KEY_ARROW_DOWN
			&& code != KEY_ARROW_LEFT
			&& code != KEY_ARROW_RIGHT
		) return

		if (timeout_screensize_id == null) {
			screen_width = element_client_width(document_body())
			screen_height = window_inner_height()
			timeout_screensize_id = timeout_set(() => timeout_screensize_id = null)
		}

		const width_one_percent = screen_width / 100
		const height_one_percent = screen_height / 100
		event_prevent_default(ev)
		switch (code) {
			case KEY_ARROW_UP:
				set_top(t => t - height_one_percent)
				break
			case KEY_ARROW_DOWN:
				set_top(t => t + height_one_percent)
				break
			case KEY_ARROW_LEFT:
				set_left(l => l - width_one_percent)
				break
			case KEY_ARROW_RIGHT:
				set_left(l => l + width_one_percent)
				break
		}
		if (timeout_fixposition_id != null) timeout_clear(timeout_fixposition_id)

		timeout_fixposition_id = timeout_set(() => {
			fix_position()
			timeout_fixposition_id = null
		}, 200)
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

	return (<Portal mount={props.c_portal_mount}><dialog
		class={classlist(MODAL_CLASS, props.class ?? '')}
		ref={mergeRefs(props.ref, r => modal_ref = r)}
		style={{
			...style(),
			top: style()?.top ?? top() + 'px',
			left: style()?.left ?? left() + 'px',
			"max-width": !allow_hide_anchor()
				? max_width() != undefined
					? max_width() + 'px'
					: style()?.['max-width'] ?? undefined
				: style()?.['max-width'] ?? undefined,
			"max-height": !allow_hide_anchor()
				? max_height() != undefined
					? max_height() + 'px'
					: style()?.['max-height'] ?? undefined
				: style()?.['max-height'] ?? undefined,
		}}
		onKeyDown={(ev) => {
			event_call(ev, props.onKeyDown)
			if (ev.key == 'Escape'
				&& !ev.altKey
				&& !ev.ctrlKey
				&& !ev.metaKey
				&& !ev.shiftKey
				&& important
			){
				focus_modal(modal_ref)
				event_prevent_default(ev)
			}
		}}
		onCancel={(ev) => {
			event_call(ev, props.onCancel)
			if (important) {
				event_prevent_default(ev)
				return
			}
			close_modal({soft: true})
			event_prevent_default(ev)
		}}
		onClose={(ev) => {
			event_call(ev, props.onClose)
			props.c_on_toggleopen?.(false)
			is_open = false
		}}
		data-c-draggable={attr_set_if_exist(is_draggable())}
		data-c-drag={attr_set_if_exist(is_dragging())}
		data-c-focus={attr_set_if_exist(attr_focus())}
		data-c-open={attr_set_if_exist(attr_open())}
		data-c-open-done={attr_set_if_exist(attr_open_done())}
		{...other}>
		<Show when={is_draggable()}>
			<span
				tabindex="0"
				class="c-modal-drag-handle"
				draggable={false}
				data-g-keep-pointer-event={attr_set_if_exist(is_dragging())}
				onKeyDown={on_move_with_keyboard}
				onPointerDown={(ev) => {
					const rect = element_rect(modal_ref)
					set_is_dragging(true)
					element_set_pointercapture(event_current_target(ev), ev.pointerId)
					attr_set(document_body(), BodyAttributes.no_pointer_event)
					diff_position_x = ev.clientX - rect.x
					diff_position_y = ev.clientY - rect.y
				}}
				onPointerUp={on_pointer_up}
				onPointerCancel={on_pointer_up}
				onPointerMove={on_pointer_move}
				onDblClick={() => reposition_modal()}
			/>
		</Show>
		<div {...props.c_attr_content_wrapper ?? {}}>
			{props.children}
		</div>
		<div style="display:contents" class="c-modal-portal-placeholder"></div>
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
	ModalPosition,
	MODAL_CLASS
}
export type {
	ModalProps,
	ModalOpenDetail,
	ModalCloseDetail
}
export default Modal