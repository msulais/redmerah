import { onCleanup, onMount, splitProps, type FlowComponent, type JSX } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { _textTooltipListener, _centerTop, _createElement, _div, _id, _popover, _manual, _appendChild, _top, _height, _left, _width, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerTopToLeft, _centerTopToRight, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _move, _open, _hidePopover, _openTextTooltip, _detail, _isSameNode, _textContent, _showPopover, _px, _transform, _closeTextTooltip, _updatePointerTextTooltip, _pointer, _dispatchEvent, _useAnchor, _gap, _position, _startDelayDuration, _text, _endDelayDuration, _clientX, _clientY, _children, _tooltip, _classList, _ref, _usePortal, _tooltipListener, _onMouseLeave, _onMouseDown, _onMouseMove, _onTouchCancel, _onTouchEnd, _bottom, _right, _contains, _openDone, _animate, _finished, _springBounce, _then, _none, _onPointerMove, _onPointerLeave, _onPointerOver, _onPointerUp, _onTouchStart } from "@/constants/string"
import { isElementHasAttribute, removeElementAttribute, setElementAttribute } from "@/utils/attributes"
import { addEventListener, callEventHandler, eventStopPropagation } from "@/utils/event"
import { getBoundingClientRect, setElementStyleProperty } from "@/utils/element"
import { endTimeout, startTimeout } from "@/utils/timeout"
import { getDocument, getDocumentBody } from "@/constants/window"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { getFlyoutPosition } from "@/utils/flyout"
import { mathAbs } from "@/utils/math"
import { BodyAttributes } from "@/enums/attributes"
import { BodyEvents } from "@/enums/events"
import { AnimationEffectTiming } from "@/enums/animation"

import { closePopover, openPopover, Popover, type PopoverProps } from "@/components/Popover"
import './index.scss'
import { isMobile } from "@/utils/platforms"

enum TooltipAttributes {
	open = 'data-c-open',
	openDone = 'data-c-open-done',
}

const TEXT_TOOLTIP_ID = 'c-text-tooltip'

type TooltipOpenDetail = {
	event: Event
	anchor: HTMLDivElement
	tooltip?: HTMLDivElement
	text?: string
	useAnchor?: boolean
	position?: TooltipPosition
	gap?: number
	startDelayDuration?: number
}

type TooltipCloseDetail = {
	endDelayDuration?: number
}

function initTooltip(): void {
	if (isElementHasAttribute(getDocumentBody(), BodyAttributes[_tooltipListener])) return;
	setElementAttribute(getDocumentBody(), BodyAttributes[_tooltipListener])

	const $isMobile = isMobile()
	let $anchor_ref: HTMLDivElement | null = null
	let $pointer = {x: 0, y: 0}
	let $position: TooltipPosition = TooltipPosition[_centerTop]
	let $gap: number = 40
	let $useAnchor: boolean = false
	let textTooltip_ref: HTMLDivElement
	let richTooltip_ref: HTMLDivElement | undefined
	let isOpen = false
	let timeoutId: number | null = null

	function createTextTooltip(): void {
		const div = getDocument()[_createElement](_div)
		div[_id] = TEXT_TOOLTIP_ID
		div[_popover] = _manual
		getDocumentBody()[_appendChild](div)

		textTooltip_ref = div
	}

	function getAnchorRect(anchor: HTMLDivElement): DOMRect {
		let left = 0, top = 0, right = 0, bottom = 0
		let isInitiated = false
		for (const child of anchor[_children]) {
			if (child[_classList][_contains]('c-rich-tooltip')) continue;

			const rect = getBoundingClientRect(child)
			if (!isInitiated) {
				left = rect[_left]
				top = rect[_top]
				right = rect[_right]
				bottom = rect[_bottom]
				isInitiated = true
			}

			if (rect[_left] < left) left = rect[_left]
			if (rect[_top] < top) top = rect[_top]
			if (rect[_right] > right) right = rect[_right]
			if (rect[_bottom] > bottom) bottom = rect[_bottom]
		}

		const $anchorRect = {
			width: right - left,
			height: bottom - top,
			bottom, left, right, top,
			x: left, y: top
		}

		return $anchorRect as DOMRect
	}

	async function closeTooltip(): Promise<void> {
		if (!isOpen) return;
		isOpen = false

		if (richTooltip_ref != undefined) return closePopover(richTooltip_ref)

		const anchorRect: DOMRect | undefined = $useAnchor? getAnchorRect($anchor_ref!) : undefined
		const tooltipRect = getBoundingClientRect(textTooltip_ref)
		const pos = getFlyoutPosition({
			flyout: tooltipRect,
			anchor: $useAnchor? anchorRect : undefined,
			gap: $gap,
			pointer: $useAnchor? undefined : $pointer,
			position: $position
		})

		const tooltipPos = {
			...pos,
			bottom: pos[_top] + tooltipRect[_height],
			right: pos[_left] + tooltipRect[_width]
		}
		const tooltipMidPos = {
			x: tooltipPos[_left] + (tooltipRect[_width] / 2),
			y: tooltipPos[_top] + (tooltipRect[_height] / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = $pointer.x
		let anchorCenterTop = $pointer.y

		if ($useAnchor) {
			anchorCenterLeft = anchorRect![_left] + (anchorRect![_width] / 2)
			anchorCenterTop = anchorRect![_top] + (anchorRect![_height] / 2)
		}

		const rangeX = mathAbs(tooltipMidPos.x - anchorCenterLeft)
		const rangeY = mathAbs(tooltipMidPos.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((tooltipMidPos.x < anchorCenterTop || tooltipMidPos.x > anchorCenterTop) && (
				$position == TooltipPosition[_centerBottom]
				|| $position == TooltipPosition[_centerBottomToLeft]
				|| $position == TooltipPosition[_centerBottomToRight]
				|| $position == TooltipPosition[_centerTop]
				|| $position == TooltipPosition[_centerTopToLeft]
				|| $position == TooltipPosition[_centerTopToRight]
			)) {
				if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
			} else {
				if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
			}
		} else {
			if ((tooltipMidPos.y < anchorCenterLeft || tooltipMidPos.y > anchorCenterLeft) && (
				$position == TooltipPosition[_leftCenter]
				|| $position == TooltipPosition[_leftCenterToBottom]
				|| $position == TooltipPosition[_leftCenterToTop]
				|| $position == TooltipPosition[_rightCenter]
				|| $position == TooltipPosition[_rightCenterToBottom]
				|| $position == TooltipPosition[_rightCenterToTop]
			)) {
				if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
			} else {
				if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
			}
		}

		removeElementAttribute(textTooltip_ref, TooltipAttributes[_open])
		removeElementAttribute(textTooltip_ref, TooltipAttributes[_openDone])
		$anchor_ref = null
		await textTooltip_ref[_animate](
			{ transform: `translate(${translate[_left]}px, ${translate[_top]}px)` },
			{ duration: 300, easing: AnimationEffectTiming[_springBounce] }
		)[_finished][_then](() =>
			textTooltip_ref[_hidePopover]()
		)
	}

	function initEvents(): void {
		addEventListener(getDocumentBody(), BodyEvents[_openTextTooltip], (ev: CustomEvent<TooltipOpenDetail>) => {
			const {
				event,
				anchor,
				text,
				gap = 40,
				position = TooltipPosition[_centerTop],
				startDelayDuration = 800,
				useAnchor = false,
				tooltip
			} = ev[_detail]

			startTimeout(() => {
				if ($anchor_ref != null && anchor[_isSameNode]($anchor_ref) && isOpen) return
				if (text == undefined && tooltip == undefined) return

				closeTooltip()
			}, 300)

			if (timeoutId != null) endTimeout(timeoutId)
			timeoutId = startTimeout(async () => {
				timeoutId = null
				if ($anchor_ref != null && anchor[_isSameNode]($anchor_ref) && isOpen) return
				if (text == undefined && tooltip == undefined) return

				$anchor_ref = anchor
				$gap = gap
				$position = position
				$useAnchor = useAnchor
				richTooltip_ref = tooltip
				isOpen = true

				if (richTooltip_ref != undefined) return openPopover(event, richTooltip_ref, {
					manualDismiss: true,
					anchorRect: useAnchor? getAnchorRect(anchor) : undefined,
					pointer: $pointer,
					gap,
					position,
				})

				if (text != undefined) textTooltip_ref[_textContent] = text
				textTooltip_ref[_showPopover]()

				const tooltipRect: DOMRect = getBoundingClientRect(textTooltip_ref)
				const anchorRect: DOMRect | undefined = useAnchor? getAnchorRect(anchor) : undefined
				const pos = getFlyoutPosition({
					flyout: tooltipRect,
					anchor: useAnchor? anchorRect : undefined,
					gap,
					pointer: useAnchor? undefined : $pointer,
					position
				})
				const tooltipPos = {
					...pos,
					bottom: pos[_top] + tooltipRect[_height],
					right: pos[_left] + tooltipRect[_width]
				}
				const tooltipMidPos = {
					x: tooltipPos[_left] + (tooltipRect[_width] / 2),
					y: tooltipPos[_top] + (tooltipRect[_height] / 2),
				}
				const translate = {
					left: 0,
					top: 0
				}

				let anchorCenterLeft =  $pointer.x
				let anchorCenterTop =  $pointer.y

				if (useAnchor) {
					anchorCenterLeft = anchorRect![_left] + (anchorRect![_width] / 2)
					anchorCenterTop = anchorRect![_top] + (anchorRect![_height] / 2)
				}

				const rangeX = mathAbs(tooltipMidPos.x - anchorCenterLeft)
				const rangeY = mathAbs(tooltipMidPos.y - anchorCenterTop)

				if (rangeX > rangeY) {
					if ((tooltipMidPos.x < anchorCenterTop || tooltipMidPos.x > anchorCenterTop) && (
						position == TooltipPosition[_centerBottom]
						|| position == TooltipPosition[_centerBottomToLeft]
						|| position == TooltipPosition[_centerBottomToRight]
						|| position == TooltipPosition[_centerTop]
						|| position == TooltipPosition[_centerTopToLeft]
						|| position == TooltipPosition[_centerTopToRight]
					)) {
						if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
						if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
					} else {
						if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
						if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
					}
				} else {
					if ((tooltipMidPos.y < anchorCenterLeft || tooltipMidPos.y > anchorCenterLeft) && (
						position == TooltipPosition[_leftCenter]
						|| position == TooltipPosition[_leftCenterToBottom]
						|| position == TooltipPosition[_leftCenterToTop]
						|| position == TooltipPosition[_rightCenter]
						|| position == TooltipPosition[_rightCenterToBottom]
						|| position == TooltipPosition[_rightCenterToTop]
					)) {
						if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
						if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
					} else {
						if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
						if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
					}
				}

				setElementStyleProperty(textTooltip_ref, _top, pos[_top] + _px)
				setElementStyleProperty(textTooltip_ref, _left, pos[_left] + _px)
				setElementAttribute(textTooltip_ref, TooltipAttributes[_open])
				textTooltip_ref[_animate](
					{ transform: [`translate(${translate[_left]}px, ${translate[_top]}px)`, _none] },
					{ duration: 300, easing: AnimationEffectTiming[_springBounce] }
				)[_finished][_then](() => setElementAttribute(textTooltip_ref, TooltipAttributes[_openDone]))
			}, startDelayDuration)
		})

		addEventListener(getDocumentBody(), BodyEvents[_closeTextTooltip], (ev: CustomEvent<TooltipCloseDetail>) => {
			const { endDelayDuration = $isMobile? 1500 : 300 } = ev[_detail]

			if (timeoutId != null) endTimeout(timeoutId)
			timeoutId = startTimeout(async () => {
				closeTooltip()
				richTooltip_ref = undefined
				isOpen = false
				timeoutId = null
			}, endDelayDuration)
		})

		addEventListener(getDocumentBody(), BodyEvents[_updatePointerTextTooltip], (ev: CustomEvent<{pointer: {x: number; y: number}}>) => {
			const pointer = ev[_detail][_pointer]
			$pointer.x = pointer.x
			$pointer.y = pointer.y
		})
	}

	createTextTooltip()
	initEvents()
}

type TextTooltipProps = {
	text?: string
	position?: TooltipPosition
	gap?: number
	startDelayDuration?: number
	endDelayDuration?: number
	useAnchor?: boolean
}
const TextTooltip: FlowComponent<TextTooltipProps> = (props) => {
	let div_ref: HTMLDivElement

	function openTextTooltip(ev: Event): void {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openTextTooltip], {detail: {
			event: ev,
			anchor: div_ref,
			useAnchor: props[_useAnchor],
			gap: props[_gap],
			position: props[_position],
			startDelayDuration: props[_startDelayDuration],
			text: props[_text],
		} satisfies TooltipOpenDetail}))
		eventStopPropagation(ev)
	}

	function closeTextTooltip(ev: Event): void {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
			endDelayDuration: props[_endDelayDuration]
		} satisfies TooltipCloseDetail}))
		eventStopPropagation(ev)
	}

	function updatePointer(ev: MouseEvent) {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_updatePointerTextTooltip], {detail: {
			pointer: {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]}
		}}))
	}

	onMount(() => {
		initTooltip()
	})

	onCleanup(() => {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
			endDelayDuration: props[_endDelayDuration]
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class="c-tooltip"
		ref={r => div_ref = r}
		onPointerOver={ev => openTextTooltip(ev)}
		onTouchStart={ev => openTextTooltip(ev)}
		onPointerLeave={ev => closeTextTooltip(ev)}
		onMouseDown={ev => closeTextTooltip(ev)}
		onPointerUp={ev => closeTextTooltip(ev)}
		onPointerMove={ev => updatePointer(ev)}>
		{props[_children]}
	</div>)
}

type RichTooltipProps = PopoverProps & {
	tooltip: JSX.Element
	position?: TooltipPosition
	gap?: number
	startDelayDuration?: number
	endDelayDuration?: number
	useAnchor?: boolean
}
const RichTooltip: FlowComponent<RichTooltipProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_tooltip, _position, _gap, _startDelayDuration,
		_endDelayDuration, _useAnchor, _children,
		_classList, _ref, _usePortal, _onPointerOver,
		_onTouchStart, _onPointerLeave, _onMouseDown,
		_onPointerUp, _onPointerMove
	])
	let div_ref: HTMLDivElement
	let tooltip_ref: HTMLDivElement

	function openRichTooltip(ev: Event): void {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openTextTooltip], {detail: {
			event: ev,
			anchor: div_ref,
			useAnchor: props[_useAnchor],
			gap: props[_gap],
			position: props[_position],
			startDelayDuration: props[_startDelayDuration],
			tooltip: tooltip_ref
		} satisfies TooltipOpenDetail}))
		eventStopPropagation(ev)
	}

	function closeRichTooltip(ev: Event): void {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
			endDelayDuration: props[_endDelayDuration],
		} satisfies TooltipCloseDetail}))
		eventStopPropagation(ev)
	}

	function updatePointer(ev: MouseEvent) {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_updatePointerTextTooltip], {detail: {
			pointer: {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]}
		}}))
	}

	onMount(() => {
		initTooltip()
	})

	onCleanup(() => {
		getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
			endDelayDuration: props[_endDelayDuration],
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class="c-tooltip"
		ref={r => div_ref = r}
		onPointerOver={ev => openRichTooltip(ev)}
		onTouchStart={ev => openRichTooltip(ev)}
		onPointerLeave={ev => closeRichTooltip(ev)}
		onMouseDown={ev => closeRichTooltip(ev)}
		onPointerUp={ev => closeRichTooltip(ev)}
		onPointerMove={ev => updatePointer(ev)}>
		{props[_children]}
		<Popover
			usePortal={props[_usePortal] ?? false}
			onPointerOver={ev => {
				eventStopPropagation(ev)
				openRichTooltip(ev)
				callEventHandler(ev, props[_onPointerOver])
			}}
			onTouchStart={ev => {
				eventStopPropagation(ev)
				callEventHandler(ev, props[_onTouchStart])
			}}
			onPointerLeave={ev => {
				eventStopPropagation(ev)
				callEventHandler(ev, props[_onPointerLeave])
			}}
			onMouseDown={ev => {
				eventStopPropagation(ev)
				callEventHandler(ev, props[_onMouseDown])
			}}
			onPointerUp={ev => {
				eventStopPropagation(ev)
				callEventHandler(ev, props[_onPointerUp])
			}}
			onPointerMove={ev => {
				eventStopPropagation(ev)
				callEventHandler(ev, props[_onPointerMove])
			}}
			ref={mergeRefs(props[_ref], r => tooltip_ref = r)}
			classList={{
				'c-rich-tooltip': true,
				...props[_classList]
			}}
			{...other}>
			{props[_tooltip]}
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