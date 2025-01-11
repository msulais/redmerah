import { createUniqueId, mergeProps, onCleanup, onMount, splitProps, type FlowComponent, type JSX, type ParentComponent } from "solid-js"

import { attr_remove, attr_set, classlist } from "@/utils/attributes"
import { event_add_listener, event_call, event_current_target, event_target } from "@/utils/event"
import { element_create, element_animate, element_append_child, element_closest, element_dataset, element_dispatch_event, element_rect, element_set_style, element_matches, element_contains, element_by_id, element_classlist_contains, element_set_id, element_set_popover, element_set_textcontent } from "@/utils/element"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { get_flyout_position } from "@/utils/flyout"
import { math_abs } from "@/utils/math"
import { AnimationEffectTiming } from "@/enums/animation"
import { is_mobile } from "@/utils/platforms"
import { rect_height, rect_left, rect_top, rect_width } from "@/utils/rect"
import { promise_done } from "@/utils/object"
import { document_active, document_body, document_has_focus } from "@/utils/document"
import { string_css_escape, string_length, string_trim } from "@/utils/string"
import { ElementIds } from "@/enums/ids"

import { close_popover, open_popover, Popover, POPOVER_CLASS, type PopoverProps } from "@/components/Popover"
import './index.scss'

enum TooltipListenerEvents {
	/** @requires TooltipOpenDetail */
	open = 'custom:tooltiplistener-open',

	/** @requires TooltipCloseDetail */
	close = 'custom:tooltiplistener-close',
	stop_process = 'custom:tooltiplistener-stopprocess'
}

enum TooltipAttributes {
	open = 'data-c-open',
	open_done = 'data-c-open-done',
}

let LISTENER_REF: HTMLDivElement
let TOOLTIP_HAS_LISTENER: boolean = false
let TOOLTIP_TARGET: Element | null = null
let TOOLTIP_LISTENER: HTMLDivElement | null = null
const TOOLTIP_CLASS = 'c-tooltip'

type TooltipOpenDetail<E = Event> = {
	event: E & {
		currentTarget: HTMLDivElement
		target: Element
	}
	by_focus?: boolean
	gap?: number
	position?: TooltipPosition
	start_delay_duration?: number
	use_anchor?: boolean
	wrapper_id: string
}

type TooltipCloseDetail = {
	end_delay_duration?: number
}

function init_tooltip(): void {
	if (TOOLTIP_HAS_LISTENER) return;
	TOOLTIP_HAS_LISTENER = true

	const $is_mobile = is_mobile()
	let pointer_x: number = 0
	let pointer_y: number = 0
	let pointer_open_x: number = 0
	let pointer_open_y: number = 0

	/**
	 * - (Text tooltip) Element with `[data-tooltip=<content>]`
	 * - (Rich tooltip) Element with `[data-rich-tooltip=<id>]`
	 */
	let anchor_element: HTMLElement | null = null
	let position: TooltipPosition = TooltipPosition.center_top
	let gap: number = 40
	let use_anchor: boolean = false
	let tooltip_text_ref: HTMLDivElement
	let tooltip_rich_ref: HTMLDivElement | null = null
	let is_open = false
	let timeout_id: number | null = null

	function create_tooltip_listener(): void {
		const div = element_create('div')
		element_set_id(div, ElementIds.tooltip_listener)
		element_set_style(div, 'display', 'contents')
		element_append_child(document_body(), div)

		LISTENER_REF = div
	}

	function create_tooltip_text(): void {
		const div = element_create('div')
		element_set_id(div, ElementIds.text_tooltip)
		element_set_popover(div, 'manual')
		element_append_child(document_body(), div)

		tooltip_text_ref = div
	}

	async function hide_tooltip(): Promise<void> {
		if (!is_open) return

		is_open = false
		if (tooltip_rich_ref) {
			close_popover(tooltip_rich_ref)
			anchor_element = null
			tooltip_rich_ref = null
			return
		}

		if (!anchor_element) return

		const anchor_rect: DOMRect | undefined = use_anchor
			? element_rect(anchor_element)
			: undefined
		const tooltip_rect = element_rect(tooltip_text_ref)
		const pos = get_flyout_position({
			flyout: tooltip_rect,
			anchor: use_anchor? anchor_rect : undefined,
			gap: gap,
			pointer: use_anchor? undefined : {
				x: pointer_open_x,
				y: pointer_open_y
			},
			position: position
		}) as DOMRect

		const tooltip_position = {
			...pos,
			bottom: rect_top(pos) + rect_height(tooltip_rect),
			right: rect_left(pos) + rect_width(tooltip_rect)
		}
		const tooltip_mid_position = {
			x: rect_left(tooltip_position) + (rect_width(tooltip_rect) / 2),
			y: rect_top(tooltip_position) + (rect_height(tooltip_rect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchor_center_left = pointer_open_x
		let anchor_center_top = pointer_open_y

		if (use_anchor) {
			anchor_center_left = rect_left(anchor_rect!) + (rect_width(anchor_rect!) / 2)
			anchor_center_top = rect_top(anchor_rect!) + (rect_height(anchor_rect!) / 2)
		}

		const range_x = math_abs(tooltip_mid_position.x - anchor_center_left)
		const range_y = math_abs(tooltip_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((tooltip_mid_position.x < anchor_center_top || tooltip_mid_position.x > anchor_center_top) && (
				position == TooltipPosition.center_bottom
				|| position == TooltipPosition.center_bottom_to_left
				|| position == TooltipPosition.center_bottom_to_right
				|| position == TooltipPosition.center_top
				|| position == TooltipPosition.center_top_to_left
				|| position == TooltipPosition.center_top_to_right
			)) {
				if (tooltip_mid_position.y > anchor_center_top ) translate.top = -12
				if (tooltip_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (tooltip_mid_position.x > anchor_center_left) translate.left = -12
				if (tooltip_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((tooltip_mid_position.y < anchor_center_left || tooltip_mid_position.y > anchor_center_left) && (
				position == TooltipPosition.left_center
				|| position == TooltipPosition.left_center_to_bottom
				|| position == TooltipPosition.left_center_to_top
				|| position == TooltipPosition.right_center
				|| position == TooltipPosition.right_center_to_bottom
				|| position == TooltipPosition.right_center_to_top
			)) {
				if (tooltip_mid_position.x > anchor_center_left) translate.left = -12
				if (tooltip_mid_position.x < anchor_center_left) translate.left = 12
			} else {
				if (tooltip_mid_position.y > anchor_center_top ) translate.top = -12
				if (tooltip_mid_position.y < anchor_center_top ) translate.top = 12
			}
		}

		attr_remove(tooltip_text_ref, TooltipAttributes.open)
		attr_remove(tooltip_text_ref, TooltipAttributes.open_done)
		anchor_element = null

		// don't remove keyword `await`
		await promise_done(element_animate(
			tooltip_text_ref,
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 200, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => tooltip_text_ref.hidePopover())
	}

	function close_tooltip(ev: CustomEvent<TooltipCloseDetail>): void {
		const {
			end_delay_duration = $is_mobile? 1500 : 200
		} = ev.detail
		if (timeout_id != null) timeout_clear(timeout_id)
		timeout_id = timeout_set(async () => {
			hide_tooltip()
			tooltip_rich_ref = null
			is_open = false
			timeout_id = null
		}, end_delay_duration)
	}

	function open_tooltip(ev: CustomEvent<TooltipOpenDetail>): void {
		const {
			wrapper_id,
			event,
			by_focus,
			gap: input_gap = 40,
			position: input_position = TooltipPosition.center_top,
			start_delay_duration = 800,
			use_anchor: input_use_anchor = false,
		} = ev.detail

		let anchor = element_closest(
			event_target(event) as HTMLElement,
			'#' + string_css_escape(wrapper_id) + ' :is([data-tooltip],[data-rich-tooltip])'
		)
		if (!anchor || anchor_element === anchor) {
			hide_tooltip()
			return
		}

		let rich_tooltip: HTMLElement | undefined
		let has_rich_tooltip = false
		let text = element_dataset(anchor, 'tooltip') // [data-tooltip]
		if (text && string_length(string_trim(text)) > 0) {
			text = string_trim(text)
		}
		else {
			const tooltip_id = element_dataset(anchor, 'richTooltip') // [data-rich-tooltip]
			if (!tooltip_id || string_length(string_trim(tooltip_id)) == 0) {
				hide_tooltip()
				return
			}

			const tooltip = element_by_id(tooltip_id)
			if (
				!tooltip
				|| !element_classlist_contains(tooltip, POPOVER_CLASS)
				|| !element_contains(event_current_target(event), tooltip)
			) {
				hide_tooltip()
				return
			}

			rich_tooltip = tooltip
			has_rich_tooltip = true
		}

		if (by_focus && document_has_focus()) {
			anchor = document_active()!

			const rect = element_rect(anchor)
			pointer_x = rect_left(rect) + rect_width(rect) / 2
			pointer_y = rect_top(rect) + rect_height(rect) / 2
		}

		if (timeout_id != null) timeout_clear(timeout_id)
		timeout_id = timeout_set(async () => {
			if (is_open) await hide_tooltip()

			timeout_id = null
			is_open = true
			anchor_element = anchor
			gap = input_gap
			position = input_position
			use_anchor = input_use_anchor

			if (has_rich_tooltip) {
				tooltip_rich_ref = rich_tooltip! as HTMLDivElement
				open_popover(event, tooltip_rich_ref, {
					manual_dismiss: true,
					anchor_rect: use_anchor? element_rect(anchor) : undefined,
					pointer: {
						x: pointer_x,
						y: pointer_y
					},
					gap,
					position,
				})
				return
			}

			element_set_textcontent(tooltip_text_ref, text!)
			tooltip_text_ref.showPopover()
			const tooltip_rect: DOMRect = element_rect(tooltip_text_ref)
			const anchor_rect: DOMRect | undefined = use_anchor? element_rect(anchor) : undefined
			const pos = get_flyout_position({
				flyout: tooltip_rect,
				anchor: use_anchor? anchor_rect : undefined,
				gap,
				pointer: use_anchor? undefined : {
					x: pointer_x,
					y: pointer_y
				},
				position
			}) as DOMRect

			// save to close later
			pointer_open_x = pointer_x
			pointer_open_y = pointer_y

			const tooltip_position = {
				...pos,
				bottom: rect_top(pos) + rect_height(tooltip_rect),
				right: rect_left(pos) + rect_width(tooltip_rect)
			}
			const tooltip_mid_position = {
				x: rect_left(tooltip_position) + (rect_width(tooltip_rect) / 2),
				y: rect_top(tooltip_position) + (rect_height(tooltip_rect) / 2),
			}
			const translate = {
				left: 0,
				top: 0
			}

			let anchor_center_left = pointer_x
			let anchro_center_top = pointer_y

			if (use_anchor) {
				anchor_center_left = rect_left(anchor_rect!) + (rect_width(anchor_rect!) / 2)
				anchro_center_top = rect_top(anchor_rect!) + (rect_height(anchor_rect!) / 2)
			}

			const range_x = math_abs(tooltip_mid_position.x - anchor_center_left)
			const range_y = math_abs(tooltip_mid_position.y - anchro_center_top)

			if (range_x > range_y) {
				if ((tooltip_mid_position.x < anchro_center_top || tooltip_mid_position.x > anchro_center_top) && (
					position == TooltipPosition.center_bottom
					|| position == TooltipPosition.center_bottom_to_left
					|| position == TooltipPosition.center_bottom_to_right
					|| position == TooltipPosition.center_top
					|| position == TooltipPosition.center_top_to_left
					|| position == TooltipPosition.center_top_to_right
				)) {
					if (tooltip_mid_position.y > anchro_center_top ) translate.top = -12
					if (tooltip_mid_position.y < anchro_center_top ) translate.top = 12
				} else {
					if (tooltip_mid_position.x > anchor_center_left) translate.left = -12
					if (tooltip_mid_position.x < anchor_center_left) translate.left = 12
				}
			} else {
				if ((tooltip_mid_position.y < anchor_center_left || tooltip_mid_position.y > anchor_center_left) && (
					position == TooltipPosition.left_center
					|| position == TooltipPosition.left_center_to_bottom
					|| position == TooltipPosition.left_center_to_top
					|| position == TooltipPosition.right_center
					|| position == TooltipPosition.right_center_to_bottom
					|| position == TooltipPosition.right_center_to_top
				)) {
					if (tooltip_mid_position.x > anchor_center_left) translate.left = -12
					if (tooltip_mid_position.x < anchor_center_left) translate.left = 12
				} else {
					if (tooltip_mid_position.y > anchro_center_top ) translate.top  = -12
					if (tooltip_mid_position.y < anchro_center_top ) translate.top  = 12
				}
			}

			element_set_style(tooltip_text_ref, 'top', rect_top(pos) + 'px')
			element_set_style(tooltip_text_ref, 'left', rect_left(pos) + 'px')
			attr_set(tooltip_text_ref, TooltipAttributes.open)
			promise_done(element_animate(
				tooltip_text_ref,
				{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
				{ duration: 200, easing: AnimationEffectTiming.spring_bounce }
			).finished, () => {
				attr_set(tooltip_text_ref, TooltipAttributes.open_done)
			})
		}, start_delay_duration)
	}

	function stop_process(): void {
		if (timeout_id == null) return

		timeout_clear(timeout_id)
	}

	function init_events(): void {
		event_add_listener(
			LISTENER_REF,
			TooltipListenerEvents.open,
			open_tooltip
		)

		event_add_listener(
			LISTENER_REF,
			TooltipListenerEvents.close,
			close_tooltip
		)

		event_add_listener(
			LISTENER_REF,
			TooltipListenerEvents.stop_process,
			stop_process
		)

		event_add_listener<PointerEvent>(
			document,
			'pointermove',
			(ev) => {
				pointer_x = ev.clientX
				pointer_y = ev.clientY
			}
		)
	}

	create_tooltip_listener()
	create_tooltip_text()
	init_events()
}

type TooltipProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_position?: TooltipPosition
	c_gap?: number
	c_start_delay_duration?: number
	c_end_delay_duration?: number
	c_use_anchor?: boolean
}

/**
 * **Tooltip Wrapper**
 *
 * Initializes tooltip listeners for elements with the `[data-tooltip]` or `[data-rich-tooltip]` attribute.
 *
 * - Element with `[data-tooltip]` attribute, must only include a string.
 * - Element with `[data-rich-tooltip]` attribute, must pointing to the `[id]` of `<TooltipPopover>`.
 * - If element have `[data-tooltip]` and `[data-rich-tooltip]` attribute altogether, `[data-tooltip]`
 * will be the only one to execute.
 *
 * **Best Practices:**
   * Avoid wrapping individual elements with `Tooltip` as it can lead to performance overhead.
   * Use this wrapper for groups of tooltips to optimize listener efficiency.
 *
 * @param props
 * @returns
 */
const Tooltip: FlowComponent<TooltipProps> = ($props) => {
	const $$props = mergeProps({
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'class', 'c_end_delay_duration',
		'c_gap', 'id', 'onFocusIn', 'onFocusOut',
		'onMouseDown', 'onPointerLeave',
		'onPointerOver', 'onPointerUp', 'onTouchStart',
		'c_position', 'c_start_delay_duration',
		'c_use_anchor'
	])

	function open_tooltip(
		ev: Event & {
			currentTarget: HTMLDivElement
			target: Element
		},
		by_focus: boolean = false
	): void {
		const self = event_current_target(ev)
		const target = event_target(ev)

		// Basically the same as `event.stopPropagation()`. Since this is component,
		// we should avoid using `event.stopPropagation()` as possible. This is used
		// to handle nested <Tooltip>.
		if (
			TOOLTIP_LISTENER
			&& element_contains(self, TOOLTIP_LISTENER)
			&& TOOLTIP_TARGET === target
		) return

		TOOLTIP_LISTENER = self
		TOOLTIP_TARGET = target

		element_dispatch_event(LISTENER_REF, new CustomEvent(TooltipListenerEvents.open, {detail: {
			wrapper_id: props.id,
			event: ev,
			by_focus,
			use_anchor: props.c_use_anchor,
			gap: props.c_gap,
			position: props.c_position,
			start_delay_duration: props.c_start_delay_duration,
		} satisfies TooltipOpenDetail}))
	}

	function close_tooltip(): void {
		TOOLTIP_LISTENER = null

		element_dispatch_event(LISTENER_REF, new CustomEvent(TooltipListenerEvents.close, {detail: {
			end_delay_duration: props.c_end_delay_duration
		} satisfies TooltipCloseDetail}))
	}

	onMount(() => {
		init_tooltip()
	})

	onCleanup(() => {

		element_dispatch_event(LISTENER_REF, new CustomEvent(TooltipListenerEvents.close, {detail: {
			end_delay_duration: props.c_end_delay_duration
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class={classlist(TOOLTIP_CLASS, props.class)}
		id={props.id}
		onFocusIn={ev => {
			event_call(ev, props.onFocusIn)
			const active = document_active()!
			if (!element_matches(active, ':focus-visible')) return

			open_tooltip(ev, true)

		}}
		onFocusOut={ev => {
			event_call(ev, props.onFocusOut)
			close_tooltip()
		}}
		onPointerOver={ev => {
			open_tooltip(ev)
			event_call(ev, props.onPointerOver)
		}}
		onTouchStart={ev => {
			open_tooltip(ev)
			event_call(ev, props.onTouchStart)
		}}
		onPointerLeave={ev => {
			close_tooltip()
			event_call(ev, props.onPointerLeave)
		}}
		onMouseDown={ev => {
			close_tooltip()
			event_call(ev, props.onMouseDown)
		}}
		onPointerUp={ev => {
			close_tooltip()
			event_call(ev, props.onPointerUp)
		}}
		{...other}>
		{props.children}
	</div>)
}

type PopoverTooltipProps = PopoverProps

/**
 * **Important**: This component must inside `<Tooltip>`
 * @param $props
 * @returns
 */
const PopoverTooltip: ParentComponent<PopoverTooltipProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'class',
		'onFocusOut',
		'onPointerLeave',
		'onMouseDown',
		'onPointerUp',
		'onFocusIn',
		'onPointerOver',
		'onTouchStart',
		'c_use_portal',
	])

	function stop_process(): void {
		timeout_set(() => {
			element_dispatch_event(
				LISTENER_REF,
				new CustomEvent(TooltipListenerEvents.stop_process)
			)
		})
	}

	return <Popover
		c_use_portal={false}
		class={classlist('c-rich-tooltip', props.class)}
		onFocusIn={ev => {
			stop_process()
			event_call(ev, props.onFocusIn)
		}}
		onFocusOut={ev => {
			stop_process()
			event_call(ev, props.onFocusOut)
		}}
		onPointerOver={ev => {
			stop_process()
			event_call(ev, props.onPointerOver)
		}}
		onTouchStart={ev => {
			stop_process()
			event_call(ev, props.onTouchStart)
		}}
		onPointerLeave={ev => {
			close()
			event_call(ev, props.onPointerLeave)
		}}
		onMouseDown={ev => {
			stop_process()
			event_call(ev, props.onMouseDown)
		}}
		onPointerUp={ev => {
			stop_process()
			event_call(ev, props.onPointerUp)
		}}
		{...other}
	/>
}

export {
	TooltipAttributes,
	Tooltip,
	TooltipPosition,
	PopoverTooltip
}
export type {
	TooltipProps as TextTooltipProps,
	TooltipOpenDetail,
	TooltipCloseDetail,
	PopoverTooltipProps
}
export default Tooltip