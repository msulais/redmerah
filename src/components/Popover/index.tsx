import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { FlyoutPosition as PopoverPosition } from '@/enums/position'
import { get_flyout_position } from '@/utils/flyout'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { attr_has, attr_remove, attr_set, attr_set_if_exist, classlist } from '@/utils/attributes'
import { element_rect, element_all_by_selector, element_dataset, element_dispatch_event, element_is_same_node, element_client_width, element_animate, element_create, element_set_id, element_append_child, element_set_style, element_set_pointercapture, element_release_pointercapture } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { event_add_listener, event_call, event_prevent_default, event_remove_listener } from "@/utils/event"
import { math_abs } from '@/utils/math'
import { document_body } from '@/utils/document'
import { window_inner_height } from '@/utils/window'
import { array_find_index, array_length, array_push, array_some, array_splice } from '@/utils/array'
import { rect_bottom, rect_height, rect_left, rect_right, rect_top, rect_width } from '@/utils/rect'
import { AnimationEffectTiming } from '@/enums/animation'
import { promise_done } from '@/utils/object'
import { ElementIds } from '@/enums/ids'
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from '@/constants/key_code'

import './index.scss'

type PopoverOpenDetail = {
	event: Event
	anchor?: HTMLElement

	/** Use this if you want to override the `PopoverOpenDetail.anchor` `DOMRect` */
	anchor_rect?: DOMRect
	gap?: number
	padding?: number
	position?: PopoverPosition
	allow_hide_anchor?: boolean
	draggable?: boolean
	manual_dismiss?: boolean

	/**
	 * Custom pointer position. Only works if `PopoverOpenDetail.anchor` and
	 * `PopoverOpenDetail.anchor_rect` set to `undefined`
	 * */
	pointer?: {
		x: number
		y: number
	}
}

enum PopoverAttributes {
	manual = 'data-c-manual'
}

enum PopoverEvents {
	close = 'custom:close',
	reposition = 'custom:reposition',

	/** @param {PopoverOpenDetail} detail `PopoverOpenDetail` */
	open = 'custom:open'
}

enum PopoverListenerEvents {
	/** @param popover `HTMLDivElement` */
	open = 'custom:open',

	/** @param popover `HTMLDivElement` */
	close = 'custom:close'
}

let LISTENER_REF: HTMLDivElement
let STOP_GLOBAL_CLICK: boolean = false
let HAS_POPOVER_LISTENER: boolean = false
const POPOVER_CLASS = 'c-popover'
const POPOVER_MARGIN = 8

function is_popover_open(popover: HTMLDivElement): boolean {
	return element_dataset(popover, 'cOpen') != undefined
}

function open_popover(
	event: Event,
	popover: HTMLDivElement,
	options?: Omit<PopoverOpenDetail, 'event'>
): void {
	element_dispatch_event(popover, new CustomEvent(
		PopoverEvents.open,
		{detail: {event: event, ...options} satisfies PopoverOpenDetail}
	))
}

function init_popover_listener(): void {
	if (HAS_POPOVER_LISTENER) return;
	HAS_POPOVER_LISTENER = true

	const body = document_body()
	const selector: string = 'div.c-popover:popover-open'
	const popovers: HTMLDivElement[] = []
	let is_no_pointer_event: boolean = false
	let timeout_id: number | null = null

	function create_listener_element(): void {
		const div = element_create('div')
		element_set_style(div, 'display', 'contents')
		element_set_id(div, ElementIds.popover_listener)
		element_append_child(body, div)

		LISTENER_REF = div
	}

	function reposition_all_popover(): void {
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			for (const popover of element_all_by_selector(selector)) {
				reposition_popover(popover as HTMLDivElement)
			}
			timeout_id = null
		}, 250)
	}

	function open(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const is_exist = array_some(
			popovers,
			popover => element_is_same_node(popover, element)
		)
		if (is_exist) return;

		array_push(popovers, element)
	}

	function close(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const index = array_find_index(
			popovers,
			popover => element_is_same_node(popover, element)
		)
		if (index < 0) return;

		array_splice(popovers, index, 1)
	}

	function global_click(ev: MouseEvent): void {
		if (STOP_GLOBAL_CLICK) {
			STOP_GLOBAL_CLICK = false
			return
		}

		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have popover but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, popover will not automatically closed.
		if (is_no_pointer_event
			|| array_length(popovers) == 0
			|| !(ev as any).pointerType
		) return;
		const pointer = {
			x: (ev as MouseEvent).clientX,
			y: (ev as MouseEvent).clientY
		}

		for (const popover of popovers) {
			const popover_rect = element_rect(popover)
			const is_clicked_inside = pointer.x >= popover_rect.left
				&& pointer.x <= popover_rect.right
				&& pointer.y >= popover_rect.top
				&& pointer.y <= popover_rect.bottom

			if (is_clicked_inside || attr_has(popover, PopoverAttributes.manual)) return;

			close_popover(popover as HTMLDivElement)
		}
	}

	function init_events(): void {
		event_add_listener<CustomEvent<HTMLDivElement>>(
			LISTENER_REF,
			PopoverListenerEvents.open,
			open
		)

		event_add_listener<CustomEvent<HTMLDivElement>>(
			LISTENER_REF,
			PopoverListenerEvents.close,
			close
		)

		event_add_listener(
			document,
			'click',
			global_click
		)

		event_add_listener(document, 'scroll', () => {
			if (array_length(popovers) == 0) return;
			reposition_all_popover()
		})

		event_add_listener(window, 'resize', () => {
			if (array_length(popovers) == 0) return;
			reposition_all_popover()
		})
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

function reposition_popover(popover: HTMLDivElement): void {
	element_dispatch_event(popover, new CustomEvent(PopoverEvents.reposition))
}

function close_popover(popover: HTMLDivElement): void {
	element_dispatch_event(popover, new CustomEvent(PopoverEvents.close))
}

type PopoverProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style' | 'draggable'> & {
	use_portal?: boolean
	style?: JSX.CSSProperties
	gap?: number
	padding?: number
	position?: PopoverPosition
	allow_hide_anchor?: boolean
	draggable?: boolean
	manual_dismiss?: boolean
	on_before_open?(): unknown
	on_before_close?(): unknown
	on_toggle_open?(isOpen: boolean): unknown
	open_animation?(el: HTMLDivElement, done: () => void): unknown
	close_animation?(el: HTMLDivElement, done: () => void): unknown
}
const Popover: ParentComponent<PopoverProps> = ($props) => {
	const $$props = mergeProps({use_portal: true, id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'on_toggle_open', 'children', 'onToggle',
		'class', 'use_portal', 'style', 'open_animation',
		'close_animation', 'gap', 'padding', 'position',
		'allow_hide_anchor', 'draggable', 'manual_dismiss',
		'on_before_open', 'on_before_close'
	])
	const style = createMemo(() => props.style)
	const [is_dragging, set_is_dragging] = createSignal<boolean>(false)
	const [is_draggable, set_is_draggable] = createSignal<boolean>(false)
	const [is_manual_dismiss, set_is_manual_dismiss] = createSignal<boolean>(false)
	const [left, set_left] = createSignal<number>(0)
	const [top, set_top] = createSignal<number>(0)
	const [max_width, set_max_width] = createSignal<number | undefined>(undefined)
	const [max_height, set_max_height] = createSignal<number | undefined>(undefined)
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [attr_open, set_attr_open] = createSignal<boolean>(false)
	const [attr_open_done, set_attr_open_done] = createSignal<boolean>(false)
	let pointer_id: number = 0
	let pointer_x: number = 0
	let pointer_y: number = 0
	let is_open: boolean = false
	let popover_ref: HTMLDivElement
	let anchor_ref: HTMLElement | null = null
	let gap: number = 0
	let padding: number = 0
	let position: PopoverPosition = PopoverPosition.center_bottom
	let timeout_reposition_id: number | null = null
	let timeout_screensize_id: number | null = null
	let timeout_fixposition_id: number | null = null
	let screen_width = element_client_width(document_body())
	let screen_height = window_inner_height()

	// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
	let diff_position_x: number = 0
	let diff_position_y: number = 0

	function fix_position(): void {
		const popover_rect = element_rect(popover_ref)
		const screen_width = element_client_width(document_body())
		const screen_height = window_inner_height()

		if (rect_left(popover_rect) < POPOVER_MARGIN) set_left(POPOVER_MARGIN)
		if (rect_top(popover_rect) < POPOVER_MARGIN) set_top(POPOVER_MARGIN)
		if (rect_right(popover_rect) > screen_width) set_left(screen_width - rect_width(popover_rect) - POPOVER_MARGIN)
		if (rect_bottom(popover_rect) > screen_height) set_top(screen_height - rect_height(popover_rect) - POPOVER_MARGIN)
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
		if (!is_dragging()) return;

		attr_remove(document_body(), BodyAttributes.no_pointer_event)
		element_release_pointercapture(popover_ref, pointer_id)
		set_is_dragging(false)
		fix_position()
	}

	function custom_on_close(_ev: CustomEvent): void {
		close_popover()
	}

	function custom_on_open(ev: CustomEvent): void {
		open_popover(ev.detail as PopoverOpenDetail)
	}

	function custom_on_reposition(_ev: CustomEvent): void {
		reposition_popover()
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
		event_add_listener<CustomEvent>(popover_ref, PopoverEvents.close, custom_on_close)
		event_add_listener<CustomEvent>(popover_ref, PopoverEvents.open, custom_on_open)
		event_add_listener<CustomEvent>(popover_ref, PopoverEvents.reposition, custom_on_reposition)
	}

	function remove_events(): void {
		event_remove_listener<CustomEvent>(popover_ref, PopoverEvents.close, custom_on_close)
		event_remove_listener<CustomEvent>(popover_ref, PopoverEvents.open, custom_on_open)
		event_remove_listener<CustomEvent>(popover_ref, PopoverEvents.reposition, custom_on_reposition)
	}

	async function close_popover(): Promise<void> {
		if (!is_open) return;
		is_open = false

		const anchor_rect: DOMRect | undefined = anchor_ref? element_rect(anchor_ref) : undefined
		const popover_rect = element_rect(popover_ref)
		const pos = get_flyout_position({
			flyout: popover_rect,
			anchor: anchor_rect,
			gap: gap,
			pointer: anchor_rect? undefined : {
				x: pointer_x,
				y: pointer_y
			},
			padding: padding,
			position: position
		}) as DOMRect

		const popover_position = {
			...pos,
			bottom: rect_top(pos) + rect_height(popover_rect),
			right: rect_left(pos) + rect_width(popover_rect)
		}
		const popover_mid_position = {
			x: rect_left(popover_position) + (rect_width(popover_rect) / 2),
			y: rect_top(popover_position) + (rect_height(popover_rect) / 2),
		}
		let translate_x = 0
		let translate_y = 0
		let anchor_center_left = pointer_x
		let anchor_center_top = pointer_y

		if (anchor_rect) {
			anchor_center_left = rect_left(anchor_rect) + (rect_width(anchor_rect) / 2)
			anchor_center_top = rect_top(anchor_rect) + (rect_height(anchor_rect) / 2)
		}

		const range_x = math_abs(popover_mid_position.x - anchor_center_left)
		const range_y = math_abs(popover_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((popover_mid_position.x < anchor_center_top || popover_mid_position.x > anchor_center_top) && (
				position == PopoverPosition.center_bottom
				|| position == PopoverPosition.center_bottom_to_left
				|| position == PopoverPosition.center_bottom_to_right
				|| position == PopoverPosition.center_top
				|| position == PopoverPosition.center_top_to_left
				|| position == PopoverPosition.center_top_to_right
			)) {
				if (popover_mid_position.y > anchor_center_top ) translate_y  = -12
				if (popover_mid_position.y < anchor_center_top ) translate_y  = 12
			} else {
				if (popover_mid_position.x > anchor_center_left) translate_x = -12
				if (popover_mid_position.x < anchor_center_left) translate_x = 12
			}
		} else {
			if ((popover_mid_position.y < anchor_center_left || popover_mid_position.y > anchor_center_left) && (
				position == PopoverPosition.left_center
				|| position == PopoverPosition.left_center_to_bottom
				|| position == PopoverPosition.left_center_to_top
				|| position == PopoverPosition.right_center
				|| position == PopoverPosition.right_center_to_bottom
				|| position == PopoverPosition.right_center_to_top
			)) {
				if (popover_mid_position.x > anchor_center_left) translate_x = -12
				if (popover_mid_position.x < anchor_center_left) translate_x = 12
			} else {
				if (popover_mid_position.y > anchor_center_top ) translate_y  = -12
				if (popover_mid_position.y < anchor_center_top ) translate_y  = 12
			}
		}

		set_attr_open(false)
		set_attr_open_done(false)
		anchor_ref = null
		element_dispatch_event(LISTENER_REF, new CustomEvent(
			PopoverListenerEvents.close,
			{ detail: popover_ref }
		))
		props.on_before_close?.()
		if (props.close_animation != null) props.close_animation(
			popover_ref,
			() => popover_ref.hidePopover()
		)
		else promise_done(element_animate(
			popover_ref,
			{ transform: `translate(${translate_x}px, ${translate_y}px)` },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => popover_ref.hidePopover())
	}

	function open_popover(options: PopoverOpenDetail): void {
		if (is_open) return

		const POPOVER_MARGIN = 8
		const {
			event,
			pointer,
			anchor_rect,
			allow_hide_anchor = props.allow_hide_anchor ?? true,
			anchor = null,
			draggable = props.draggable ?? false,
			gap: input_gap = props.gap ?? 0,
			padding: input_padding = props.padding ?? 0,
			position: input_position = props.position ?? PopoverPosition.center_bottom,
			manual_dismiss = props.manual_dismiss ?? false
		} = options;

		set_is_manual_dismiss(manual_dismiss)
		set_allow_hide_anchor(allow_hide_anchor)
		is_open = true
		anchor_ref = anchor
		position = input_position
		gap = input_gap
		padding = input_padding

		// handle drag
		if (is_draggable() && !draggable) remove_drag_listener()
		else if (!is_draggable() && draggable) add_drag_listener()
		set_is_draggable(draggable)

		popover_ref.showPopover()

		const popover_rect: DOMRect = element_rect(popover_ref)
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
			flyout: popover_rect,
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
			const popover_position = {
				...pos,
				bottom: rect_top(pos) + rect_height(popover_rect),
				right: rect_left(pos) + rect_width(popover_rect)
			}
			const anchor_mid_position = {
				x: rect_left($anchor_rect!) + (rect_width($anchor_rect!) / 2),
				y: rect_top($anchor_rect!) + (rect_height($anchor_rect!) / 2),
			}
			const popover_mid_position = {
				x: rect_left(popover_position) + (rect_width(popover_rect) / 2),
				y: rect_top(popover_position) + (rect_height(popover_rect) / 2),
			}
			const range_x = math_abs(popover_mid_position.x - anchor_mid_position.x)
			const range_y = math_abs(popover_mid_position.y - anchor_mid_position.y)
			const is_left_side = popover_mid_position.x < anchor_mid_position.x
			const is_right_side = popover_mid_position.x > anchor_mid_position.x
			const is_top_side = popover_mid_position.y < anchor_mid_position.y
			const is_bottom_side = popover_mid_position.y > anchor_mid_position.y

			if (range_x > range_y){
				// left side
				if (is_left_side && rect_right(popover_position) > rect_left($anchor_rect!)) {
					set_max_width(rect_left($anchor_rect!) - POPOVER_MARGIN - input_gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(popover_position) < rect_right($anchor_rect!)) {
					set_max_width((element_client_width(document_body()) - rect_right($anchor_rect!)) - POPOVER_MARGIN - input_gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(popover_position) > rect_top($anchor_rect!)) {
					set_max_height(rect_top($anchor_rect!) - POPOVER_MARGIN - input_gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(popover_position) < rect_bottom($anchor_rect!)) {
					set_max_height((window_inner_height() - rect_bottom($anchor_rect!)) - POPOVER_MARGIN - input_gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(popover_ref),
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

		const popover_position = {
			...pos,
			bottom: rect_top(pos) + rect_height(popover_rect),
			right: rect_left(pos) + rect_width(popover_rect)
		}
		const popover_mid_position = {
			x: rect_left(popover_position) + (rect_width(popover_rect) / 2),
			y: rect_top(popover_position) + (rect_height(popover_rect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchor_center_left = pointer_x
		let anchor_center_top = pointer_y

		if ($anchor_rect) {
			anchor_center_left = $anchor_rect.left + (rect_width($anchor_rect) / 2)
			anchor_center_top = $anchor_rect.top + (rect_height($anchor_rect) / 2)
		}

		const range_x = math_abs(popover_mid_position.x - anchor_center_left)
		const range_y = math_abs(popover_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((popover_mid_position.x < anchor_center_top || popover_mid_position.x > anchor_center_top) && (
				input_position == PopoverPosition.center_bottom
				|| input_position == PopoverPosition.center_bottom_to_left
				|| input_position == PopoverPosition.center_bottom_to_right
				|| input_position == PopoverPosition.center_top
				|| input_position == PopoverPosition.center_top_to_left
				|| input_position == PopoverPosition.center_top_to_right
			)) {
				if (popover_mid_position.y > anchor_center_top ) translate.top = -12
				if (popover_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (popover_mid_position.x > anchor_center_left) translate.left = -12
				if (popover_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((popover_mid_position.y < anchor_center_left || popover_mid_position.y > anchor_center_left) && (
				input_position == PopoverPosition.left_center
				|| input_position == PopoverPosition.left_center_to_bottom
				|| input_position == PopoverPosition.left_center_to_top
				|| input_position == PopoverPosition.right_center
				|| input_position == PopoverPosition.right_center_to_bottom
				|| input_position == PopoverPosition.right_center_to_top
			)) {
				if (popover_mid_position.x > anchor_center_left) translate.left = -12
				if (popover_mid_position.x < anchor_center_left) translate.left = 12
			} else {
				if (popover_mid_position.y > anchor_center_top ) translate.top = -12
				if (popover_mid_position.y < anchor_center_top ) translate.top = 12
			}
		}

		set_top(rect_top(pos))
		set_left(rect_left(pos))
		set_attr_open(true)
		props.on_before_open?.()
		element_dispatch_event(LISTENER_REF, new CustomEvent(
			PopoverListenerEvents.open,
			{ detail: popover_ref }
		))
		if (props.open_animation != null) props.open_animation(
			popover_ref,
			() => set_attr_open_done(true)
		)
		else promise_done(element_animate(popover_ref,
			{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => set_attr_open_done(true))

		STOP_GLOBAL_CLICK = true
	}

	function reposition_popover(): void {
		if (anchor_ref == null) {
			fix_position()
			return
		}

		const anchor_rect = element_rect(anchor_ref)
		const popover_rect = element_rect(popover_ref)

		let pos = get_flyout_position({
			flyout: popover_rect,
			anchor: anchor_rect,
			gap: gap,
			position: position,
			padding: padding
		}) as DOMRect

		if (!allow_hide_anchor()) {
			const popover_position = {
				...pos,
				bottom: rect_top(pos) + rect_height(popover_rect),
				right: rect_left(pos) + rect_width(popover_rect)
			}
			const anchor_mid_position = {
				x: rect_left(anchor_rect!) + (rect_width(anchor_rect!) / 2),
				y: rect_top(anchor_rect!) + (rect_height(anchor_rect!) / 2),
			}
			const popover_mid_position = {
				x: rect_left(popover_position) + (rect_width(popover_rect) / 2),
				y: rect_top(popover_position) + (rect_height(popover_rect) / 2),
			}
			const range_x = math_abs(popover_mid_position.x - anchor_mid_position.x)
			const range_y = math_abs(popover_mid_position.y - anchor_mid_position.y)
			const is_left_side = popover_mid_position.x < anchor_mid_position.x
			const is_right_side = popover_mid_position.x > anchor_mid_position.x
			const is_top_side = popover_mid_position.y < anchor_mid_position.y
			const is_bottom_side = popover_mid_position.y > anchor_mid_position.y

			if (range_x > range_y){
				// left side
				if (is_left_side && rect_right(popover_position) > rect_left(anchor_rect!)) {
					set_max_width(rect_left(anchor_rect!) - POPOVER_MARGIN - gap)
					set_max_height(undefined)
				}

				// right side
				else if (is_right_side && rect_left(popover_position) < rect_right(anchor_rect!)) {
					set_max_width((element_client_width(document_body()) - rect_right(anchor_rect!)) - POPOVER_MARGIN - gap)
					set_max_height(undefined)
				}
			}
			else {
				// top side
				if (is_top_side && rect_bottom(popover_position) > rect_top(anchor_rect!)) {
					set_max_height(rect_top(anchor_rect!) - POPOVER_MARGIN - gap)
					set_max_width(undefined)
				}

				// bottom side
				else if (is_bottom_side && rect_top(popover_position) < rect_bottom(anchor_rect!)) {
					set_max_height((window_inner_height() - rect_bottom(anchor_rect!)) - POPOVER_MARGIN - gap)
					set_max_width(undefined)
				}
			}

			pos = get_flyout_position({
				flyout: element_rect(popover_ref),
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
				reposition_popover()
				timeout_reposition_id = null
			}, 300)
		})
		observer.observe(popover_ref, {box: 'border-box'})

		onCleanup(() => {
			observer.disconnect()
		})
	}

	function on_move_with_keyboard(ev: KeyboardEvent): void {
		const code = ev.code
		if (
			code != ARROW_UP
			&& code != ARROW_DOWN
			&& code != ARROW_LEFT
			&& code != ARROW_RIGHT
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
			case ARROW_UP:
				set_top(t => t - height_one_percent)
				break
			case ARROW_DOWN:
				set_top(t => t + height_one_percent)
				break
			case ARROW_LEFT:
				set_left(l => l - width_one_percent)
				break
			case ARROW_RIGHT:
				set_left(l => l + width_one_percent)
				break
		}
		if (timeout_fixposition_id != null) timeout_clear(timeout_fixposition_id)

		timeout_fixposition_id = timeout_set(() => {
			fix_position()
			timeout_fixposition_id = null
		}, 300)
	}

	onMount(() => {
		init_popover_listener()
		init_events()
		init_observer()
	})

	onCleanup(async () => {
		remove_events()
		await close_popover()
	})

	const C: VoidComponent = () => (<div
		class={classlist(POPOVER_CLASS, props.class ?? '')}
		ref={mergeRefs(props.ref, r => popover_ref = r)}
		style={{
			...style(),
			top: style()?.top ?? top() + 'px',
			left: style()?.left ?? left() + 'px',
			"max-width": !allow_hide_anchor()
				? max_width() != undefined
					? max_width() + 'px'
					: style()?.["max-width"] ?? undefined
				: style()?.["max-width"] ?? undefined,
			"max-height": !allow_hide_anchor()
				? max_height() != undefined
					? max_height() + 'px'
					: style()?.['max-height'] ?? undefined
				: style()?.['max-height'] ?? undefined,
		}}
		popover={'manual'}
		onToggle={(ev) => {
			is_open = ev.newState == 'open'
			props.on_toggle_open?.(is_open)
			event_call(ev, props.onToggle)
		}}
		data-c-draggable={attr_set_if_exist(is_draggable())}
		data-c-open={attr_set_if_exist(attr_open())}
		data-c-open-done={attr_set_if_exist(attr_open_done())}
		data-c-drag={attr_set_if_exist(is_dragging())}
		data-c-manual={attr_set_if_exist(is_manual_dismiss())}
		{...other}>
		<Show when={is_draggable()}>
			<span
				tabindex="0"
				class="c-popover-drag-handle"
				data-g-keep-pointer-event={attr_set_if_exist(is_dragging())}
				draggable={false}
				onKeyDown={on_move_with_keyboard}
				onPointerDown={(ev) => {
					const rect = element_rect(popover_ref)
					pointer_id = ev.pointerId
					element_set_pointercapture(popover_ref, pointer_id)
					set_is_dragging(true)
					attr_set(document_body(), BodyAttributes.no_pointer_event)
					diff_position_x = ev.clientX - rect.x
					diff_position_y = ev.clientY - rect.y
				}}
				onDblClick={() => reposition_popover()}
			/>
		</Show>
		<div>
			{props.children}
		</div>
	</div>)

	return (<Show
		when={props.use_portal}
		fallback={<C/>}>
		<Portal><C/></Portal>
	</Show>)
}

export {
	PopoverAttributes,
	PopoverEvents,
	open_popover,
	reposition_popover,
	close_popover,
	Popover,
	is_popover_open,
	PopoverPosition,
	POPOVER_CLASS
}
export type {
	PopoverOpenDetail,
	PopoverProps
}
export default Popover