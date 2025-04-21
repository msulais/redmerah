import { createUniqueId, mergeProps, onCleanup, onMount, splitProps, type FlowComponent, type JSX } from "solid-js"

import { attrClassList } from "@/utils/attributes"
import { eventCall } from "@/utils/event"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { getFlyoutPosition } from "@/utils/flyout"
import { AnimationEffectTiming } from "@/enums/animation"
import { isTouchScreen } from "@/utils/platforms"
import { GlobalElementIds } from "@/enums/ids"
import { isAnimationAllowed } from "@/utils/animation"

import './index.scss'

enum TooltipListenerEvents {
	/** @requires TooltipOpenDetail */
	open = 'custom:tooltiplistener-open',

	/** @requires TooltipCloseDetail */
	close = 'custom:tooltiplistener-close',
	stopProcess = 'custom:tooltiplistener-stopprocess'
}

let LISTENER_REF: HTMLDivElement
let TOOLTIP_HAS_LISTENER: boolean = false
let TOOLTIP_TARGET: Element | null = null
let TOOLTIP_LISTENER: HTMLDivElement | null = null
let POINTER_X: number = 0
let POINTER_Y: number = 0
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

	const $isMobile = isTouchScreen()
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
	let timeId: number | NodeJS.Timeout | null = null

	function createTooltipListener(): void {
		const div = document.createElement('div')
		div.id = GlobalElementIds.tooltipListener
		div.style.setProperty('display', 'contents')
		document.body.appendChild(div)
		LISTENER_REF = div
	}

	function createTooltipText(): void {
		const div = document.createElement('div')
		div.id = GlobalElementIds.textTooltip
		div.popover = 'manual'
		document.body.appendChild(div)

		tooltipTextRef = div
	}

	async function hideTooltip(): Promise<void> {
		if (!isOpen) return

		isOpen = false

		if (!anchorElement) return

		const anchorRect: DOMRect | undefined = useAnchor
			? anchorElement.getBoundingClientRect()
			: undefined
		const tooltipRect = tooltipTextRef.getBoundingClientRect()
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
			bottom: pos.top + tooltipRect.height,
			right: pos.left + tooltipRect.width
		}
		const tooltipMidPosition = {
			x: tooltipPosition.left + (tooltipRect.width / 2),
			y: tooltipPosition.top + (tooltipRect.height / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerOpenX
		let anchorCenterTop = pointerOpenY

		if (useAnchor) {
			anchorCenterLeft = anchorRect!.left + (anchorRect!.width / 2)
			anchorCenterTop = anchorRect!.top + (anchorRect!.height / 2)
		}

		const rangeX = Math.abs(tooltipMidPosition.x - anchorCenterLeft)
		const rangeY = Math.abs(tooltipMidPosition.y - anchorCenterTop)

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

		anchorElement = null
		tooltipTextRef.style.removeProperty('opacity')
		if (!isAnimationAllowed()) {
			return tooltipTextRef.hidePopover()
		}

		tooltipTextRef.style.setProperty('will-change', 'transform,opacity')
		// don't remove keyword `await`
		await tooltipTextRef.animate(
			{
				transform: `translate(${translate.left}px, ${translate.top}px)`,
				opacity: [1, 0]
			},
			{ duration: 200, easing: AnimationEffectTiming.springBounce }
		).finished.then(() => {
			tooltipTextRef.hidePopover()
			tooltipTextRef.style.removeProperty('will-change')
		})
	}

	function closeTooltip(ev: CustomEvent<TooltipCloseDetail>): void {
		const {
			endDelayDuration = $isMobile? 1500 : 200
		} = ev.detail
		if (timeId != null) clearTimeout(timeId)
		timeId = setTimeout(async () => {
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
			if (timeId != null) clearTimeout(timeId)
			timeId = setTimeout(async () => {
				hideTooltip()
				isOpen = false
				timeId = null
			}, endDelayDuration)
		}
		const target = event.target as HTMLElement
		const currentTarget = event.currentTarget

		if (!currentTarget.contains(target)) return

		let anchor = target.closest(
			'#' + CSS.escape(wrapperId) + ' :is([data-tooltip],[data-rich-tooltip])'
		) as HTMLElement
		if (!anchor) return close()
		if (anchorElement === anchor) return

		let text = anchor.dataset.tooltip
		if (text && text.trim().length > 0) {
			text = text.trim()
		}

		if (byFocus && document.hasFocus()) {
			anchor = document.activeElement! as HTMLElement

			const rect = anchor.getBoundingClientRect()
			POINTER_X = rect.left + rect.width / 2
			POINTER_Y = rect.top + rect.height / 2
		}

		if (timeId != null) clearTimeout(timeId)
		timeId = setTimeout(async () => {
			if (isOpen) await hideTooltip()

			timeId = null
			isOpen = true
			anchorElement = anchor
			gap = inputGap
			position = inputPosition
			useAnchor = inputUseAnchor
			tooltipTextRef.textContent = text!
			tooltipTextRef.showPopover()
			const tooltipRect: DOMRect = tooltipTextRef.getBoundingClientRect()
			const anchorRect: DOMRect | undefined = useAnchor? anchor.getBoundingClientRect() : undefined
			const pos = getFlyoutPosition({
				flyout: tooltipRect,
				anchor: useAnchor? anchorRect : undefined,
				gap,
				pointer: useAnchor? undefined : {
					x: POINTER_X,
					y: POINTER_Y
				},
				position
			}) as DOMRect

			// save to close later
			pointerOpenX = POINTER_X
			pointerOpenY = POINTER_Y

			const tooltipPosition = {
				...pos,
				bottom: pos.top + tooltipRect.height,
				right: pos.left + tooltipRect.width
			}
			const tooltipMidPosition = {
				x: tooltipPosition.left + (tooltipRect.width / 2),
				y: tooltipPosition.top + (tooltipRect.height / 2),
			}
			const translate = {
				left: 0,
				top: 0
			}

			let anchorCenterLeft = POINTER_X
			let anchroCenterTop = POINTER_Y

			if (useAnchor) {
				anchorCenterLeft = anchorRect!.left + (anchorRect!.width / 2)
				anchroCenterTop = anchorRect!.top + (anchorRect!.height / 2)
			}

			const rangeX = Math.abs(tooltipMidPosition.x - anchorCenterLeft)
			const rangeY = Math.abs(tooltipMidPosition.y - anchroCenterTop)

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

			tooltipTextRef.style.setProperty('top', pos.top + 'px')
			tooltipTextRef.style.setProperty('left', pos.left + 'px')
			tooltipTextRef.style.setProperty('opacity', '1')
			if (!isAnimationAllowed()) return

			tooltipTextRef.style.setProperty('will-change', 'transform,opacity')
			tooltipTextRef.animate(
				{
					transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'],
					opacity: [0, 1]
				},
				{ duration: 200, easing: AnimationEffectTiming.springBounce }
			).finished.then(() => {
				tooltipTextRef.style.removeProperty('will-change')
			})
		}, startDelayDuration)
	}

	function stopProcess(): void {
		if (timeId == null) return

		clearTimeout(timeId)
	}

	function initEvents(): void {
		LISTENER_REF.addEventListener(
			TooltipListenerEvents.open as any,
			openTooltip
		)

		LISTENER_REF.addEventListener(
			TooltipListenerEvents.close as any,
			closeTooltip
		)

		LISTENER_REF.addEventListener(
			TooltipListenerEvents.stopProcess as any,
			stopProcess
		)

		document.addEventListener('pointermove', (ev) => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
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
		const self = ev.currentTarget
		const target = ev.target

		// Basically the same as `event.stopPropagation()`. Since this is component,
		// we should avoid using `event.stopPropagation()` as possible. This is used
		// to handle nested <Tooltip>.
		if (
			TOOLTIP_LISTENER
			&& self.contains(TOOLTIP_LISTENER)
			&& TOOLTIP_TARGET === target
		) return

		TOOLTIP_LISTENER = self
		TOOLTIP_TARGET = target

		LISTENER_REF.dispatchEvent(new CustomEvent(TooltipListenerEvents.open, {detail: {
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

		LISTENER_REF.dispatchEvent(new CustomEvent(TooltipListenerEvents.close, {detail: {
			endDelayDuration: props['c:endDelayDuration']
		} satisfies TooltipCloseDetail}))
	}

	onMount(() => {
		initTooltip()
	})

	onCleanup(() => {
		LISTENER_REF.dispatchEvent(new CustomEvent(TooltipListenerEvents.close, {detail: {
			endDelayDuration: props['c:endDelayDuration']
		} satisfies TooltipCloseDetail}))
	})

	return (<div
		class={attrClassList(TOOLTIP_CLASS, props.class)}
		id={props.id}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
			const active = document.activeElement!
			if (!active.matches(':focus-visible')) return

			openTooltip(ev, true)
		}}
		onFocusOut={ev => {
			eventCall(ev, props.onFocusOut)
			closeTooltip()
		}}
		onPointerOver={ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
			eventCall(ev, props.onPointerOver)
			openTooltip(ev)
		}}
		onTouchStart={ev => {
			POINTER_X = ev.touches[0].clientX
			POINTER_Y = ev.touches[0].clientY
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
	Tooltip,
	TooltipPosition,
}
export type {
	TooltipProps as TextTooltipProps,
	TooltipOpenDetail,
	TooltipCloseDetail,
}
export default Tooltip