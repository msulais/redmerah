import { AnimationEffectTiming } from "@/enums/animation"
import { GlobalElementIds } from "@/enums/ids"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
import { getFlyoutPosition } from "@/utils/flyout"
import { createId } from "@/utils/ids"
import { numberSafe } from "@/utils/number"
import { validEnumValue } from "@/utils/object"
import { isTouchScreen } from "@/utils/platforms"

type TooltipProps = astroHTML.JSX.HTMLAttributes & {
	TooltipStartDelay?: number
	TooltipEndDelay  ?: number
	TooltipGap       ?: number
	TooltipUseAnchor ?: boolean
	TooltipPosition  ?: TooltipPosition
}

type _TooltipOpenDetail = {
	event   : Event
	byFocus?: boolean
}

type TooltipUpdateOptions = {
	TooltipChildren  ?: (string | Node)[] | boolean
	TooltipStartDelay?: number | boolean
	TooltipEndDelay  ?: number | boolean
	TooltipGap       ?: number | boolean
	TooltipUseAnchor ?: boolean
	TooltipPosition  ?: TooltipPosition | boolean
	TooltipRefs      ?: {
		tooltip?(el: HTMLDivElement): unknown
	}
}

enum TooltipClasses {
	tooltip = 'c-tooltip'
}

enum TooltipTargetAttributes {
	tooltip            = 'data-tooltip',
	startDelayDuration = tooltip + '-start-delay',
	endDelayDuration   = tooltip + '-end-delay',
	gap                = tooltip + '-gap',
	position           = tooltip + '-position',
	useAnchor          = tooltip + '-use-anchor'
}

enum TooltipAttributes {
	/** @param delay `number` */
	startDelayDuration = 'data-c-tooltip-start-delay',

	/** @param delay `number` */
	endDelayDuration   = 'data-c-tooltip-end-delay',

	/** @param value `number` */
	gap                = 'data-c-tooltip-gap',

	/** @param position `TooltipPosition` */
	position           = 'data-c-tooltip-position',
	useAnchor          = 'data-c-tooltip-use-anchor'
}

enum _TooltipListenerEvents {
	/** @param detail `_TooltipOpenDetail` */
	open  = 'tooltiplistener:open',
	close = 'tooltiplistener:close',
}

const REGISTERED_TOOLTIP: HTMLDivElement[] = []
let TOOLTIP_HAS_LISTENER: boolean = false
let TOOLTIP_TARGET: Element | null = null
let TOOLTIP_LISTENER: HTMLDivElement | null = null
let POINTER_X = 0
let POINTER_Y = 0

function _initTooltipListener(): void {
	if (TOOLTIP_HAS_LISTENER) return

	TOOLTIP_HAS_LISTENER = true
	const mobile = isTouchScreen()
	const body = document.body
	let endDelayDuration: number = 0
	let pointerOpenX: number = 0
	let pointerOpenY: number = 0
	let anchor: HTMLElement | null = null
	let useAnchor: boolean = false
	let position: TooltipPosition = TooltipPosition.centerTop
	let gap: number = 40
	let isOpen: boolean = false
	let tooltipTextRef: HTMLDivElement
	let timeId: number | NodeJS.Timeout | null = null

	function createTooltipText(): void {
		tooltipTextRef = document.createElement('div')
		tooltipTextRef.id = GlobalElementIds.textTooltip
		tooltipTextRef.popover = 'manual'
		document.body.appendChild(tooltipTextRef)
	}

	function closeTooltip(): void {
		stopProcess()
		timeId = setTimeout(() => {
			isOpen = false
			timeId = null
			if (!anchor) return

			const anchorRect: DOMRect | undefined = useAnchor
				? anchor.getBoundingClientRect()
				: undefined
			const tooltipRect = tooltipTextRef.getBoundingClientRect()
			const flyoutPosition = getFlyoutPosition({
				flyout: tooltipRect,
				anchor: useAnchor? anchorRect : undefined,
				gap: gap,
				pointer: useAnchor? undefined : {
					x: pointerOpenX,
					y: pointerOpenY
				},
				position: position
			}) as DOMRect

			anchor = null

			if (!isAnimationAllowed()) {
				tooltipTextRef.hidePopover()
				return
			}

			const popoverMidX = flyoutPosition.left + (tooltipRect.width / 2)
			const popoverMidY = flyoutPosition.top + (tooltipRect.height / 2)
			const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : pointerOpenX
			const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : pointerOpenY
			const rangeX = Math.abs(popoverMidX - anchorMidX)
			const rangeY = Math.abs(popoverMidY - anchorMidY)
			let translateX = 0
			let translateY = 0
			if (rangeX > rangeY) {
				translateX = popoverMidX < anchorMidX? 12 : -12
			}
			else if (rangeX < rangeY) {
				translateY = popoverMidY < anchorMidY? 12 : -12
			}
			// keep if 'rangeX === rangeY'

			tooltipTextRef.animate({
				transform: ['translate(0,0)', `translate(${translateX}px,${translateY}px)`],
				opacity: [1, 0]
			}, { duration: 300, easing: AnimationEffectTiming.springBounce })
			.finished.then(() => {
				tooltipTextRef.hidePopover()
			})
		}, endDelayDuration)
	}

	function openTooltip(ev: CustomEvent<_TooltipOpenDetail>): void {
		const detail = ev.detail
		const byFocus = detail.byFocus
		const event = detail.event
		const target = event.target as HTMLElement
		const tooltip = event.currentTarget as HTMLDivElement
		if (!tooltip.contains(target)) return

		if (!tooltip.id) {
			tooltip.id = createId()
		}

		// NOTE:
		// `target` is possible inside element with `[data-tooltip]`
		let $anchor = target.closest(
			`#${CSS.escape(tooltip.id)} :is([${TooltipTargetAttributes.tooltip}])`
		) as HTMLElement
		if (!$anchor) return closeTooltip()
		if ($anchor === anchor) return

		const text = $anchor.dataset.tooltip
		if (!text) return

		if (byFocus && document.hasFocus()) {
			$anchor = document.activeElement! as HTMLElement

			const rect = $anchor.getBoundingClientRect()
			POINTER_X = rect.left + rect.width / 2
			POINTER_Y = rect.top + rect.height / 2
		}

		const startDelayDuration = numberSafe(Number.parseFloat(
			$anchor.getAttribute(TooltipTargetAttributes.startDelayDuration)
			?? tooltip.getAttribute(TooltipAttributes.startDelayDuration)
			?? `${isOpen? 500 : 1000}`
		), byFocus? 0 : isOpen? 500 : 1000)
		stopProcess()
		timeId = setTimeout(() => {
			timeId = null
			isOpen = true
			anchor = $anchor
			gap = numberSafe(Number.parseFloat(
				anchor.getAttribute(TooltipTargetAttributes.gap)
				?? tooltip.getAttribute(TooltipAttributes.gap)
				?? '40'
			), 40)
			endDelayDuration = numberSafe(Number.parseFloat(
				anchor.getAttribute(TooltipTargetAttributes.endDelayDuration)
				?? tooltip.getAttribute(TooltipAttributes.endDelayDuration)
				?? `${mobile? 1500 : 200}`
			), mobile? 1500 : 200)
			position = (
				anchor.getAttribute(TooltipTargetAttributes.position)
				?? tooltip.getAttribute(TooltipAttributes.position)
				?? TooltipPosition.centerTop
			) as TooltipPosition
			if (!validEnumValue(position, TooltipPosition)) {
				position = TooltipPosition.centerTop
			}

			useAnchor = (
				anchor.hasAttribute(TooltipTargetAttributes.useAnchor)
				|| tooltip.hasAttribute(TooltipAttributes.useAnchor)
			)
			tooltipTextRef.textContent = text
			tooltipTextRef.showPopover()
			const tooltipRect: DOMRect = tooltipTextRef.getBoundingClientRect()
			const anchorRect: DOMRect | undefined = useAnchor? anchor.getBoundingClientRect() : undefined
			const flyoutPosition = getFlyoutPosition({
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

			tooltipTextRef.style.setProperty('left', flyoutPosition.left + 'px')
			tooltipTextRef.style.setProperty('top', flyoutPosition.top + 'px')
			if (!isAnimationAllowed()) return

			const popoverMidX = flyoutPosition.left + (tooltipRect.width / 2)
			const popoverMidY = flyoutPosition.top + (tooltipRect.height / 2)
			const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : POINTER_X
			const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : POINTER_Y
			const rangeX = Math.abs(popoverMidX - anchorMidX)
			const rangeY = Math.abs(popoverMidY - anchorMidY)
			let translateX = 0
			let translateY = 0
			if (rangeX > rangeY) {
				translateX = popoverMidX < anchorMidX? 12 : -12
			}
			else if (rangeX < rangeY) {
				translateY = popoverMidY < anchorMidY? 12 : -12
			}
			// keep if 'rangeX === rangeY'

			tooltipTextRef.animate({
				transform: [`translate(${translateX}px,${translateY}px)`, 'translate(0,0)'],
				opacity: [0, 1]
			}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		}, startDelayDuration)
	}

	function stopProcess(): void {
		if (timeId === null) return

		clearTimeout(timeId)
	}

	function initEvents(): void {
		body.addEventListener(_TooltipListenerEvents.open as any, openTooltip)
		body.addEventListener(_TooltipListenerEvents.close, closeTooltip)
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.x
			POINTER_Y = ev.y
		})
	}

	createTooltipText()
	initEvents()
}

function _initTooltip(tooltip: HTMLDivElement): void {
	const body = document.body

	function openTooltip(ev: Event, byFocus: boolean = false): void {
		const self = ev.currentTarget as HTMLDivElement
		const target = ev.target as HTMLElement

		// Same as `event.stopPropagation()`
		if (
			TOOLTIP_LISTENER
			&& self.contains(TOOLTIP_LISTENER)
			&& TOOLTIP_TARGET === target
		) return

		TOOLTIP_LISTENER = self
		TOOLTIP_TARGET = target
		body.dispatchEvent(new CustomEvent<_TooltipOpenDetail>(_TooltipListenerEvents.open, {
			detail: {
				event: ev,
				byFocus
			}
		}))
	}

	function closeTooltip(): void {
		TOOLTIP_LISTENER = null
		body.dispatchEvent(new CustomEvent(_TooltipListenerEvents.close))
	}

	function initEvents(): void {
		tooltip.addEventListener('focusin', ev => {
			const target = ev.target as HTMLElement
			if (!target.matches(':focus-visible')) return

			openTooltip(ev, true)
		})
		tooltip.addEventListener('focusout', () => {
			closeTooltip()
		})
		tooltip.addEventListener('pointerover', ev => {
			POINTER_X = ev.x
			POINTER_Y = ev.y
			openTooltip(ev)
		})
		tooltip.addEventListener('touchstart', ev => {
			const touches = ev.touches
			POINTER_X = touches[0].clientX
			POINTER_Y = touches[0].clientY
			openTooltip(ev)
		}, {
			passive: true
		})
		tooltip.addEventListener('pointerleave', () => {
			closeTooltip()
		})
		tooltip.addEventListener('mousedown', () => {
			closeTooltip()
		})
		tooltip.addEventListener('pointerup', () => {
			closeTooltip()
		})
	}

	initEvents()
}

function createTooltip(options?: TooltipUpdateOptions): HTMLDivElement {
	const tooltip = document.createElement('div')
	return updateTooltip(tooltip, options)
}

function updateTooltip(tooltip: HTMLDivElement, options?: TooltipUpdateOptions): HTMLDivElement {
	tooltip.classList.add(TooltipClasses.tooltip)

	if (!tooltip.id) {
		tooltip.id = createId()
	}

	const startDelay = options?.TooltipStartDelay
	if (startDelay === false) {
		tooltip.removeAttribute(TooltipAttributes.startDelayDuration)
	}
	else if (startDelay !== undefined && startDelay !== true) {
		tooltip.setAttribute(TooltipAttributes.startDelayDuration, startDelay + '')
	}

	const endDelay = options?.TooltipEndDelay
	if (endDelay === false) {
		tooltip.removeAttribute(TooltipAttributes.endDelayDuration)
	}
	else if (endDelay !== undefined && endDelay !== true) {
		tooltip.setAttribute(TooltipAttributes.endDelayDuration, endDelay + '')
	}

	const gap = options?.TooltipGap
	if (gap === false) {
		tooltip.removeAttribute(TooltipAttributes.gap)
	}
	else if (gap !== undefined && gap !== true) {
		tooltip.setAttribute(TooltipAttributes.gap, gap + '')
	}

	const position = options?.TooltipPosition
	if (position === false) {
		tooltip.removeAttribute(TooltipAttributes.position)
	}
	else if (position !== undefined && position !== true) {
		tooltip.setAttribute(TooltipAttributes.position, position)
	}

	const useAnchor = options?.TooltipUseAnchor
	if (useAnchor !== undefined) {
		tooltip.toggleAttribute(TooltipAttributes.useAnchor, useAnchor)
	}

	const children = options?.TooltipChildren
	if (children === false) {
		tooltip.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		tooltip.replaceChildren(...children)
	}

	options?.TooltipRefs?.tooltip?.(tooltip)
	return tooltip
}

function registerTooltip(...tooltips: HTMLDivElement[]): void {
	_initTooltipListener()
	if (tooltips.length === 0) {
		tooltips = [...document.querySelectorAll<HTMLDivElement>('.' + TooltipClasses.tooltip)]
	}

	for (const tooltip of tooltips) {
		if (REGISTERED_TOOLTIP.some(v => v === tooltip)) continue

		_initTooltip(tooltip)
	}
}

function unregisterTooltip(...tooltips: HTMLDivElement[]): void {
	const filtered = REGISTERED_TOOLTIP.filter(a => tooltips.every(b => a !== b))
	REGISTERED_TOOLTIP.length = 0
	REGISTERED_TOOLTIP.push(...filtered)
}

export {
	type TooltipProps,
	type TooltipUpdateOptions,
	TooltipClasses,
	TooltipAttributes,
	TooltipTargetAttributes,
	TooltipPosition,
	registerTooltip,
	unregisterTooltip,
	createTooltip,
	updateTooltip,
}