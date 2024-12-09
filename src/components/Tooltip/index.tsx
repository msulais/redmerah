import { onCleanup, onMount, splitProps, type FlowComponent, type JSX } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_has, attr_remove, attr_set } from "@/utils/attributes"
import { event_add_listener, call_event_handler, event_stop_propagation } from "@/utils/event"
import { create_element, element_animate, element_append_child, element_children, element_classlist, element_dispatch_event, element_is_same_node, element_rect, element_set_style_property } from "@/utils/element"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { get_flyout_position } from "@/utils/flyout"
import { math_abs } from "@/utils/math"
import { BodyAttributes } from "@/enums/attributes"
import { BodyEvents } from "@/enums/events"
import { AnimationEffectTiming } from "@/enums/animation"
import { is_mobile } from "@/utils/platforms"
import { rect_bottom, rect_height, rect_left, rect_right, rect_top, rect_width } from "@/utils/rect"
import { promise_done } from "@/utils/object"

import { close_popover, open_popover, Popover, type PopoverProps } from "@/components/Popover"
import './index.scss'

enum TooltipAttributes {
	open = 'data-c-open',
	open_done = 'data-c-open-done',
}

const TEXT_TOOLTIP_ID = 'c-text-tooltip'

type TooltipOpenDetail = {
	event: Event
	anchor: HTMLDivElement
	tooltip?: HTMLDivElement
	text?: string
	use_anchor?: boolean
	position?: TooltipPosition
	gap?: number
	start_delay_duration?: number
}

type TooltipCloseDetail = {
	end_delay_duration?: number
}

function init_tooltip(): void {
	const body = document.body

	if (attr_has(body, BodyAttributes.tooltip_listener)) return;
	attr_set(body, BodyAttributes.tooltip_listener)

	const $isMobile = is_mobile()
	let $anchor_ref: HTMLDivElement | null = null
	let $pointer = {x: 0, y: 0}
	let $position: TooltipPosition = TooltipPosition.center_top
	let $gap: number = 40
	let $use_anchor: boolean = false
	let tooltip_text_ref: HTMLDivElement
	let tooltip_rich_ref: HTMLDivElement | undefined
	let is_open = false
	let timeoutId: number | null = null

	function create_tooltip_text(): void {
		const div = create_element('div')
		div.id = TEXT_TOOLTIP_ID
		div.popover = 'manual'
		element_append_child(body, div)

		tooltip_text_ref = div
	}

	function get_anchor_rect(anchor: HTMLDivElement): DOMRect {
		let left = 0, top = 0, right = 0, bottom = 0
		let is_initiated = false
		for (const child of element_children(anchor)) {
			if (element_classlist(child as HTMLElement).contains('c-rich-tooltip')) continue;

			const rect = element_rect(child)
			if (!is_initiated) {
				left = rect_left(rect)
				top = rect_top(rect)
				right = rect_right(rect)
				bottom = rect_bottom(rect)
				is_initiated = true
			}

			if (rect_left(rect) < left) left = rect_left(rect)
			if (rect_top(rect) < top) top = rect_top(rect)
			if (rect_right(rect) > right) right = rect_right(rect)
			if (rect_bottom(rect) > bottom) bottom = rect_bottom(rect)
		}

		const $anchor_rect = {
			width: right - left,
			height: bottom - top,
			bottom, left, right, top,
			x: left, y: top
		}

		return $anchor_rect as DOMRect
	}

	async function close_tooltip(): Promise<void> {
		if (!is_open) return;
		is_open = false

		if (tooltip_rich_ref != undefined) return close_popover(tooltip_rich_ref)

		const anchor_rect: DOMRect | undefined = $use_anchor? get_anchor_rect($anchor_ref!) : undefined
		const tooltip_rect = element_rect(tooltip_text_ref)
		const pos = get_flyout_position({
			flyout: tooltip_rect,
			anchor: $use_anchor? anchor_rect : undefined,
			gap: $gap,
			pointer: $use_anchor? undefined : $pointer,
			position: $position
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

		let anchor_center_left = $pointer.x
		let anchor_center_top = $pointer.y

		if ($use_anchor) {
			anchor_center_left = rect_left(anchor_rect!) + (rect_width(anchor_rect!) / 2)
			anchor_center_top = rect_top(anchor_rect!) + (rect_height(anchor_rect!) / 2)
		}

		const range_x = math_abs(tooltip_mid_position.x - anchor_center_left)
		const range_y = math_abs(tooltip_mid_position.y - anchor_center_top)

		if (range_x > range_y) {
			if ((tooltip_mid_position.x < anchor_center_top || tooltip_mid_position.x > anchor_center_top) && (
				$position == TooltipPosition.center_bottom
				|| $position == TooltipPosition.center_bottom_to_left
				|| $position == TooltipPosition.center_bottom_to_right
				|| $position == TooltipPosition.center_top
				|| $position == TooltipPosition.center_top_to_left
				|| $position == TooltipPosition.center_top_to_right
			)) {
				if (tooltip_mid_position.y > anchor_center_top ) translate.top = -12
				if (tooltip_mid_position.y < anchor_center_top ) translate.top = 12
			} else {
				if (tooltip_mid_position.x > anchor_center_left) translate.left = -12
				if (tooltip_mid_position.x < anchor_center_left) translate.left = 12
			}
		} else {
			if ((tooltip_mid_position.y < anchor_center_left || tooltip_mid_position.y > anchor_center_left) && (
				$position == TooltipPosition.left_center
				|| $position == TooltipPosition.left_center_to_bottom
				|| $position == TooltipPosition.left_center_to_top
				|| $position == TooltipPosition.right_center
				|| $position == TooltipPosition.right_center_to_bottom
				|| $position == TooltipPosition.right_center_to_top
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
		$anchor_ref = null
		await promise_done(element_animate(
			tooltip_text_ref,
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
		).finished, () => tooltip_text_ref.hidePopover())
	}

	function init_events(): void {
		event_add_listener(body, BodyEvents.open_tooltip, (ev: CustomEvent<TooltipOpenDetail>) => {
			const {
				event,
				anchor,
				text,
				gap = 40,
				position = TooltipPosition.center_top,
				start_delay_duration = 800,
				use_anchor = false,
				tooltip
			} = ev.detail

			timeout_set(() => {
				if ($anchor_ref != null && element_is_same_node(anchor, $anchor_ref) && is_open) return
				if (text == undefined && tooltip == undefined) return

				close_tooltip()
			}, 300)

			if (timeoutId != null) timeout_clear(timeoutId)
			timeoutId = timeout_set(async () => {
				timeoutId = null
				if ($anchor_ref != null && element_is_same_node(anchor, $anchor_ref) && is_open) return
				if (text == undefined && tooltip == undefined) return

				$anchor_ref = anchor
				$gap = gap
				$position = position
				$use_anchor = use_anchor
				tooltip_rich_ref = tooltip
				is_open = true

				if (tooltip_rich_ref != undefined) return open_popover(event, tooltip_rich_ref, {
					manual_dismiss: true,
					anchor_rect: use_anchor? get_anchor_rect(anchor) : undefined,
					pointer: $pointer,
					gap,
					position,
				})

				if (text != undefined) tooltip_text_ref.textContent = text
				tooltip_text_ref.showPopover()

				const tooltip_rect: DOMRect = element_rect(tooltip_text_ref)
				const anchor_rect: DOMRect | undefined = use_anchor? get_anchor_rect(anchor) : undefined
				const pos = get_flyout_position({
					flyout: tooltip_rect,
					anchor: use_anchor? anchor_rect : undefined,
					gap,
					pointer: use_anchor? undefined : $pointer,
					position
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

				let anchor_center_left =  $pointer.x
				let anchro_center_top =  $pointer.y

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

				element_set_style_property(tooltip_text_ref, 'top', rect_top(pos) + 'px')
				element_set_style_property(tooltip_text_ref, 'left', rect_left(pos) + 'px')
				attr_set(tooltip_text_ref, TooltipAttributes.open)
				promise_done(element_animate(
					tooltip_text_ref,
					{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
					{ duration: 300, easing: AnimationEffectTiming.spring_bounce }
				).finished, () => attr_set(tooltip_text_ref, TooltipAttributes.open_done))
			}, start_delay_duration)
		})

		event_add_listener(body, BodyEvents.close_tooltip, (ev: CustomEvent<TooltipCloseDetail>) => {
			const { end_delay_duration = $isMobile? 1500 : 300 } = ev.detail

			if (timeoutId != null) timeout_clear(timeoutId)
			timeoutId = timeout_set(async () => {
				close_tooltip()
				tooltip_rich_ref = undefined
				is_open = false
				timeoutId = null
			}, end_delay_duration)
		})

		event_add_listener(body, BodyEvents.update_pointer_tooltip, (ev: CustomEvent<{pointer: {x: number; y: number}}>) => {
			const pointer = ev.detail.pointer
			$pointer.x = pointer.x
			$pointer.y = pointer.y
		})
	}

	create_tooltip_text()
	init_events()
}

type TextTooltipProps = {
	text?: string
	position?: TooltipPosition
	gap?: number
	start_delay_duration?: number
	end_delay_duration?: number
	use_anchor?: boolean
}
const TextTooltip: FlowComponent<TextTooltipProps> = (props) => {
	const body = document.body
	let div_ref: HTMLDivElement

	function open(ev: Event): void {
		element_dispatch_event(body, new CustomEvent(BodyEvents.open_tooltip, {detail: {
			event: ev,
			anchor: div_ref,
			use_anchor: props.use_anchor,
			gap: props.gap,
			position: props.position,
			start_delay_duration: props.start_delay_duration,
			text: props.text,
		} satisfies TooltipOpenDetail}))
		event_stop_propagation(ev)
	}

	function close(ev: Event): void {
		element_dispatch_event(body, new CustomEvent(BodyEvents.close_tooltip, {detail: {
			end_delay_duration: props.end_delay_duration
		} satisfies TooltipCloseDetail}))
		event_stop_propagation(ev)
	}

	function update_pointer(ev: MouseEvent): void {
		element_dispatch_event(body, new CustomEvent(BodyEvents.update_pointer_tooltip, {detail: {
			pointer: {x: ev.clientX, y: ev.clientY}
		}}))
	}

	onMount(() => {
		init_tooltip()
	})

	onCleanup(() => {
		element_dispatch_event(body, new CustomEvent(BodyEvents.close_tooltip, {detail: {
			end_delay_duration: props.end_delay_duration
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class="c-tooltip"
		ref={r => div_ref = r}
		onPointerOver={ev => open(ev)}
		onTouchStart={ev => open(ev)}
		onPointerLeave={ev => close(ev)}
		onMouseDown={ev => close(ev)}
		onPointerUp={ev => close(ev)}
		onPointerMove={ev => update_pointer(ev)}>
		{props.children}
	</div>)
}

type RichTooltipProps = PopoverProps & {
	tooltip: JSX.Element
	position?: TooltipPosition
	gap?: number
	start_delay_duration?: number
	end_delay_duration?: number
	use_anchor?: boolean
}
const RichTooltip: FlowComponent<RichTooltipProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'tooltip', 'position', 'gap', 'start_delay_duration',
		'end_delay_duration', 'use_anchor', 'children',
		'classList', 'ref', 'use_portal', 'onPointerOver',
		'onTouchStart', 'onPointerLeave', 'onMouseDown',
		'onPointerUp', 'onPointerMove'
	])
	const body = document.body
	let div_ref: HTMLDivElement
	let tooltip_ref: HTMLDivElement

	function open(ev: Event): void {
		element_dispatch_event(body, new CustomEvent(BodyEvents.open_tooltip, {detail: {
			event: ev,
			anchor: div_ref,
			use_anchor: props.use_anchor,
			gap: props.gap,
			position: props.position,
			start_delay_duration: props.start_delay_duration,
			tooltip: tooltip_ref
		} satisfies TooltipOpenDetail}))
		event_stop_propagation(ev)
	}

	function close(ev: Event): void {
		element_dispatch_event(body, new CustomEvent(BodyEvents.close_tooltip, {detail: {
			end_delay_duration: props.end_delay_duration,
		} satisfies TooltipCloseDetail}))
		event_stop_propagation(ev)
	}

	function update_pointer(ev: MouseEvent) {
		element_dispatch_event(body, new CustomEvent(BodyEvents.update_pointer_tooltip, {detail: {
			pointer: {x: ev.clientX, y: ev.clientY}
		}}))
	}

	onMount(() => {
		init_tooltip()
	})

	onCleanup(() => {
		element_dispatch_event(body, new CustomEvent(BodyEvents.close_tooltip, {detail: {
			end_delay_duration: props.end_delay_duration
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class="c-tooltip"
		ref={r => div_ref = r}
		onPointerOver={ev => open(ev)}
		onTouchStart={ev => open(ev)}
		onPointerLeave={ev => close(ev)}
		onMouseDown={ev => close(ev)}
		onPointerUp={ev => close(ev)}
		onPointerMove={ev => update_pointer(ev)}>
		{props.children}
		<Popover
			use_portal={props.use_portal ?? false}
			onPointerOver={ev => {
				event_stop_propagation(ev)
				open(ev)
				call_event_handler(ev, props.onPointerOver)
			}}
			onTouchStart={ev => {
				event_stop_propagation(ev)
				call_event_handler(ev, props.onTouchStart)
			}}
			onPointerLeave={ev => {
				event_stop_propagation(ev)
				call_event_handler(ev, props.onPointerLeave)
			}}
			onMouseDown={ev => {
				event_stop_propagation(ev)
				call_event_handler(ev, props.onMouseDown)
			}}
			onPointerUp={ev => {
				event_stop_propagation(ev)
				call_event_handler(ev, props.onPointerUp)
			}}
			onPointerMove={ev => {
				event_stop_propagation(ev)
				call_event_handler(ev, props.onPointerMove)
			}}
			ref={mergeRefs(props.ref, r => tooltip_ref = r)}
			classList={{
				'c-rich-tooltip': true,
				...props.classList
			}}
			{...other}>
			{props.tooltip}
		</Popover>
	</div>)
}

export {
	TooltipAttributes,
	TEXT_TOOLTIP_ID,
	TextTooltip,
	RichTooltip,
	TooltipPosition
}
export type {
	TextTooltipProps,
	TooltipOpenDetail,
	TooltipCloseDetail,
	RichTooltipProps
}
export default TextTooltip