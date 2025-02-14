import { createUniqueId, mergeProps, onCleanup, onMount, splitProps, type FlowComponent, type JSX } from "solid-js"

import { attrRemove, attrSet, attrClassList } from "@/utils/attributes"
import { eventListenerAdd, eventCall, eventCurrentTarget, eventTarget } from "@/utils/event"
import { elementCreate, elementAnimate, elementAppendChild, elementClosest, elementDataset, elementDispatchEvent, elementRect, elementStyleSet, elementMatches, elementContains, elementIdSet, elementPopoverSet, elementTextContentSet } from "@/utils/element"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { getFlyoutPosition } from "@/utils/flyout"
import { mathAbs } from "@/utils/math"
import { AnimationEffectTiming } from "@/enums/animation"
import { isMobile } from "@/utils/platforms"
import { rectHeight, rectLeft, rectTop, rectWidth } from "@/utils/rect"
import { promiseDone } from "@/utils/object"
import { documentActive, documentBody, documentHasFocus } from "@/utils/document"
import { stringCSSEscape, stringLength, stringTrim } from "@/utils/string"
import { ElementIds } from "@/enums/ids"

import './index.scss'

enum TooltipListenerEvents {
	/** @requires TooltipOpenDetail */
	open = 'custom:tooltiplistener-open',

	/** @requires TooltipCloseDetail */
	close = 'custom:tooltiplistener-close',
	stopProcess = 'custom:tooltiplistener-stopprocess'
}

enum TooltipAttributes {
	open = 'data-c-open',
	openDone = 'data-c-open-done',
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
	byFocus?: boolean
	gap?: number
	position?: TooltipPosition
	startDelayDuration?: number
	useAnchor?: boolean
	wrapperId: string
}

type TooltipCloseDetail = {
	endDelayDuration?: number
}

function initTooltip(): void {
	if (TOOLTIP_HAS_LISTENER) return;
	TOOLTIP_HAS_LISTENER = true

	const $isMobile = isMobile()
	let pointerX: number = 0
	let pointerY: number = 0
	let pointerOpenX: number = 0
	let pointerOpenY: number = 0

	/**
	 * - (Text tooltip) Element with `[data-tooltip=<content>]`
	 * - (Rich tooltip) Element with `[data-rich-tooltip=<id>]`
	 */
	let anchorElement: HTMLElement | null = null
	let position: TooltipPosition = TooltipPosition.centerTop
	let gap: number = 40
	let useAnchor: boolean = false
	let tooltipTextRef: HTMLDivElement
	let isOpen = false
	let timeId: number | null = null

	function createTooltipListener(): void {
		const div = elementCreate('div')
		elementIdSet(div, ElementIds.tooltipListener)
		elementStyleSet(div, 'display', 'contents')
		elementAppendChild(documentBody(), div)

		LISTENER_REF = div
	}

	function createTooltipText(): void {
		const div = elementCreate('div')
		elementIdSet(div, ElementIds.textTooltip)
		elementPopoverSet(div, 'manual')
		elementAppendChild(documentBody(), div)

		tooltipTextRef = div
	}

	async function hideTooltip(): Promise<void> {
		if (!isOpen) return

		isOpen = false

		if (!anchorElement) return

		const anchorRect: DOMRect | undefined = useAnchor
			? elementRect(anchorElement)
			: undefined
		const tooltipRect = elementRect(tooltipTextRef)
		const pos = getFlyoutPosition({
			flyout: tooltipRect,
			anchor: useAnchor? anchorRect : undefined,
			gap: gap,
			pointer: useAnchor? undefined : {
				x: pointerOpenX,
				y: pointerOpenY
			},
			position: position
		}) as DOMRect

		const tooltipPosition = {
			...pos,
			bottom: rectTop(pos) + rectHeight(tooltipRect),
			right: rectLeft(pos) + rectWidth(tooltipRect)
		}
		const tooltipMidPosition = {
			x: rectLeft(tooltipPosition) + (rectWidth(tooltipRect) / 2),
			y: rectTop(tooltipPosition) + (rectHeight(tooltipRect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerOpenX
		let anchorCenterTop = pointerOpenY

		if (useAnchor) {
			anchorCenterLeft = rectLeft(anchorRect!) + (rectWidth(anchorRect!) / 2)
			anchorCenterTop = rectTop(anchorRect!) + (rectHeight(anchorRect!) / 2)
		}

		const rangeX = mathAbs(tooltipMidPosition.x - anchorCenterLeft)
		const rangeY = mathAbs(tooltipMidPosition.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((tooltipMidPosition.x < anchorCenterTop || tooltipMidPosition.x > anchorCenterTop) && (
				position == TooltipPosition.centerBottom
				|| position == TooltipPosition.centerBottomToLeft
				|| position == TooltipPosition.centerBottomToRight
				|| position == TooltipPosition.centerTop
				|| position == TooltipPosition.centerTopToLeft
				|| position == TooltipPosition.centerTopToRight
			)) {
				if (tooltipMidPosition.y > anchorCenterTop ) translate.top = -12
				if (tooltipMidPosition.y < anchorCenterTop ) translate.top = 12
			} else {
				if (tooltipMidPosition.x > anchorCenterLeft) translate.left = -12
				if (tooltipMidPosition.x < anchorCenterLeft) translate.left = 12
			}
		} else {
			if ((tooltipMidPosition.y < anchorCenterLeft || tooltipMidPosition.y > anchorCenterLeft) && (
				position == TooltipPosition.leftCenter
				|| position == TooltipPosition.leftCenterToBottom
				|| position == TooltipPosition.leftCenterToTop
				|| position == TooltipPosition.rightCenter
				|| position == TooltipPosition.rightCenterToBottom
				|| position == TooltipPosition.rightCenterToTop
			)) {
				if (tooltipMidPosition.x > anchorCenterLeft) translate.left = -12
				if (tooltipMidPosition.x < anchorCenterLeft) translate.left = 12
			} else {
				if (tooltipMidPosition.y > anchorCenterTop ) translate.top = -12
				if (tooltipMidPosition.y < anchorCenterTop ) translate.top = 12
			}
		}

		attrRemove(tooltipTextRef, TooltipAttributes.open)
		attrRemove(tooltipTextRef, TooltipAttributes.openDone)
		anchorElement = null

		// don't remove keyword `await`
		await promiseDone(elementAnimate(
			tooltipTextRef,
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 200, easing: AnimationEffectTiming.springBounce }
		).finished, () => tooltipTextRef.hidePopover())
	}

	function closeTooltip(ev: CustomEvent<TooltipCloseDetail>): void {
		const {
			endDelayDuration = $isMobile? 1500 : 200
		} = ev.detail
		if (timeId != null) timeTimerClear(timeId)
		timeId = timeTimerSet(async () => {
			hideTooltip()
			isOpen = false
			timeId = null
		}, endDelayDuration)
	}

	function openTooltip(ev: CustomEvent<TooltipOpenDetail>): void {
		const {
			wrapperId,
			event,
			byFocus,
			gap: inputGap = 40,
			position: inputPosition = TooltipPosition.centerTop,
			useAnchor: inputUseAnchor = false,
			startDelayDuration = isOpen? 200 : 500,
		} = ev.detail
		const close = () => {
			const endDelayDuration = $isMobile? 1500 : 200
			if (timeId != null) timeTimerClear(timeId)
			timeId = timeTimerSet(async () => {
				hideTooltip()
				isOpen = false
				timeId = null
			}, endDelayDuration)
		}
		const target = eventTarget(event) as HTMLElement
		const currentTarget = eventCurrentTarget(event)

		if (!elementContains(currentTarget, target)) return

		let anchor = elementClosest(
			target,
			'#' + stringCSSEscape(wrapperId) + ' :is([data-tooltip],[data-rich-tooltip])'
		)
		if (!anchor) return close()
		if (anchorElement === anchor) return

		let text = elementDataset(anchor, 'tooltip') // [data-tooltip]
		if (text && stringLength(stringTrim(text)) > 0) {
			text = stringTrim(text)
		}

		if (byFocus && documentHasFocus()) {
			anchor = documentActive()!

			const rect = elementRect(anchor)
			pointerX = rectLeft(rect) + rectWidth(rect) / 2
			pointerY = rectTop(rect) + rectHeight(rect) / 2
		}

		if (timeId != null) timeTimerClear(timeId)
		timeId = timeTimerSet(async () => {
			if (isOpen) await hideTooltip()

			timeId = null
			isOpen = true
			anchorElement = anchor
			gap = inputGap
			position = inputPosition
			useAnchor = inputUseAnchor
			elementTextContentSet(tooltipTextRef, text!)
			tooltipTextRef.showPopover()
			const tooltipRect: DOMRect = elementRect(tooltipTextRef)
			const anchorRect: DOMRect | undefined = useAnchor? elementRect(anchor) : undefined
			const pos = getFlyoutPosition({
				flyout: tooltipRect,
				anchor: useAnchor? anchorRect : undefined,
				gap,
				pointer: useAnchor? undefined : {
					x: pointerX,
					y: pointerY
				},
				position
			}) as DOMRect

			// save to close later
			pointerOpenX = pointerX
			pointerOpenY = pointerY

			const tooltipPosition = {
				...pos,
				bottom: rectTop(pos) + rectHeight(tooltipRect),
				right: rectLeft(pos) + rectWidth(tooltipRect)
			}
			const tooltipMidPosition = {
				x: rectLeft(tooltipPosition) + (rectWidth(tooltipRect) / 2),
				y: rectTop(tooltipPosition) + (rectHeight(tooltipRect) / 2),
			}
			const translate = {
				left: 0,
				top: 0
			}

			let anchorCenterLeft = pointerX
			let anchroCenterTop = pointerY

			if (useAnchor) {
				anchorCenterLeft = rectLeft(anchorRect!) + (rectWidth(anchorRect!) / 2)
				anchroCenterTop = rectTop(anchorRect!) + (rectHeight(anchorRect!) / 2)
			}

			const rangeX = mathAbs(tooltipMidPosition.x - anchorCenterLeft)
			const rangeY = mathAbs(tooltipMidPosition.y - anchroCenterTop)

			if (rangeX > rangeY) {
				if ((tooltipMidPosition.x < anchroCenterTop || tooltipMidPosition.x > anchroCenterTop) && (
					position == TooltipPosition.centerBottom
					|| position == TooltipPosition.centerBottomToLeft
					|| position == TooltipPosition.centerBottomToRight
					|| position == TooltipPosition.centerTop
					|| position == TooltipPosition.centerTopToLeft
					|| position == TooltipPosition.centerTopToRight
				)) {
					if (tooltipMidPosition.y > anchroCenterTop ) translate.top = -12
					if (tooltipMidPosition.y < anchroCenterTop ) translate.top = 12
				} else {
					if (tooltipMidPosition.x > anchorCenterLeft) translate.left = -12
					if (tooltipMidPosition.x < anchorCenterLeft) translate.left = 12
				}
			} else {
				if ((tooltipMidPosition.y < anchorCenterLeft || tooltipMidPosition.y > anchorCenterLeft) && (
					position == TooltipPosition.leftCenter
					|| position == TooltipPosition.leftCenterToBottom
					|| position == TooltipPosition.leftCenterToTop
					|| position == TooltipPosition.rightCenter
					|| position == TooltipPosition.rightCenterToBottom
					|| position == TooltipPosition.rightCenterToTop
				)) {
					if (tooltipMidPosition.x > anchorCenterLeft) translate.left = -12
					if (tooltipMidPosition.x < anchorCenterLeft) translate.left = 12
				} else {
					if (tooltipMidPosition.y > anchroCenterTop ) translate.top  = -12
					if (tooltipMidPosition.y < anchroCenterTop ) translate.top  = 12
				}
			}

			elementStyleSet(tooltipTextRef, 'top', rectTop(pos) + 'px')
			elementStyleSet(tooltipTextRef, 'left', rectLeft(pos) + 'px')
			attrSet(tooltipTextRef, TooltipAttributes.open)
			promiseDone(elementAnimate(
				tooltipTextRef,
				{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
				{ duration: 200, easing: AnimationEffectTiming.springBounce }
			).finished, () => {
				attrSet(tooltipTextRef, TooltipAttributes.openDone)
			})
		}, startDelayDuration)
	}

	function stopProcess(): void {
		if (timeId == null) return

		timeTimerClear(timeId)
	}

	function initEvents(): void {
		eventListenerAdd(
			LISTENER_REF,
			TooltipListenerEvents.open,
			openTooltip
		)

		eventListenerAdd(
			LISTENER_REF,
			TooltipListenerEvents.close,
			closeTooltip
		)

		eventListenerAdd(
			LISTENER_REF,
			TooltipListenerEvents.stopProcess,
			stopProcess
		)

		eventListenerAdd<PointerEvent>(
			document,
			'pointermove',
			(ev) => {
				pointerX = ev.clientX
				pointerY = ev.clientY
			}
		)
	}

	createTooltipListener()
	createTooltipText()
	initEvents()
}

type TooltipProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:position'?: TooltipPosition
	'c:gap'?: number
	'c:startDelayDuration'?: number
	'c:endDelayDuration'?: number
	'c:useAnchor'?: boolean
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
		'children', 'class', 'c:endDelayDuration',
		'c:gap', 'id', 'onFocusIn', 'onFocusOut',
		'onMouseDown', 'onPointerLeave',
		'onPointerOver', 'onPointerUp', 'onTouchStart',
		'c:position', 'c:startDelayDuration',
		'c:useAnchor'
	])

	function openTooltip(
		ev: Event & {
			currentTarget: HTMLDivElement
			target: Element
		},
		by_focus: boolean = false
	): void {
		const self = eventCurrentTarget(ev)
		const target = eventTarget(ev)

		// Basically the same as `event.stopPropagation()`. Since this is component,
		// we should avoid using `event.stopPropagation()` as possible. This is used
		// to handle nested <Tooltip>.
		if (
			TOOLTIP_LISTENER
			&& elementContains(self, TOOLTIP_LISTENER)
			&& TOOLTIP_TARGET === target
		) return

		TOOLTIP_LISTENER = self
		TOOLTIP_TARGET = target

		elementDispatchEvent(LISTENER_REF, new CustomEvent(TooltipListenerEvents.open, {detail: {
			wrapperId: props.id,
			event: ev,
			byFocus: by_focus,
			useAnchor: props['c:useAnchor'],
			gap: props['c:gap'],
			position: props['c:position'],
			startDelayDuration: props['c:startDelayDuration'],
		} satisfies TooltipOpenDetail}))
	}

	function closeTooltip(): void {
		TOOLTIP_LISTENER = null

		elementDispatchEvent(LISTENER_REF, new CustomEvent(TooltipListenerEvents.close, {detail: {
			endDelayDuration: props['c:endDelayDuration']
		} satisfies TooltipCloseDetail}))
	}

	onMount(() => {
		initTooltip()
	})

	onCleanup(() => {
		elementDispatchEvent(LISTENER_REF, new CustomEvent(TooltipListenerEvents.close, {detail: {
			endDelayDuration: props['c:endDelayDuration']
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class={attrClassList(TOOLTIP_CLASS, props.class)}
		id={props.id}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
			const active = documentActive()!
			if (!elementMatches(active, ':focus-visible')) return

			openTooltip(ev, true)
		}}
		onFocusOut={ev => {
			eventCall(ev, props.onFocusOut)
			closeTooltip()
		}}
		onPointerOver={ev => {
			eventCall(ev, props.onPointerOver)
			openTooltip(ev)
		}}
		onTouchStart={ev => {
			eventCall(ev, props.onTouchStart)
			openTooltip(ev)
		}}
		onPointerLeave={ev => {
			eventCall(ev, props.onPointerLeave)
			closeTooltip()
		}}
		onMouseDown={ev => {
			eventCall(ev, props.onMouseDown)
			closeTooltip()
		}}
		onPointerUp={ev => {
			eventCall(ev, props.onPointerUp)
			closeTooltip()
		}}
		{...other}>
		{props.children}
	</div>)
}

export {
	TooltipAttributes,
	Tooltip,
	TooltipPosition,
}
export type {
	TooltipProps as TextTooltipProps,
	TooltipOpenDetail,
	TooltipCloseDetail,
}
export default Tooltip