import { AnimationEasing } from "@/enums/animation"
import { GlobalElementIds } from "@/enums/ids"
import { FlyoutPosition as TooltipPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
import { pxToRem, remToPx } from "@/utils/css"
import { getFlyoutPosition } from "@/utils/flyout"
import { createElementId } from "@/utils/ids"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { isTouchScreen } from "@/utils/platforms"

type TooltipProps = astroHTML.JSX.HTMLAttributes & {
	TooltipStartDelay?: number
	TooltipEndDelay  ?: number
	TooltipGap       ?: number
	TooltipUseAnchor ?: boolean
	TooltipPosition  ?: TooltipPosition
}

type TooltipElement = HTMLDivElement

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
		tooltip?(ref: TooltipElement): unknown
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
	/** `!bubbles | !cancelable | detail = _TooltipOpenDetail` */
	open  = 'tooltiplistener:open',

	/** `!bubbles | !cancelable | !detail` */
	close = 'tooltiplistener:close',
}

const REGISTERED_TOOLTIP: Set<TooltipElement> = new Set<TooltipElement>()
let TOOLTIP_HAS_LISTENER: boolean = false
let TOOLTIP_TARGET: Element | null = null
let TOOLTIP_LISTENER: HTMLDivElement | null = null
let POINTER_X = 0
let POINTER_Y = 0

function _initTooltipRefListener(): void {
	if (TOOLTIP_HAS_LISTENER) return

	TOOLTIP_HAS_LISTENER = true
	const body = document.body
	let endDelayDuration: number = 0
	let pointerOpenX: number = 0
	let pointerOpenY: number = 0
	let anchorRef: HTMLElement | null = null
	let useAnchor: boolean = false
	let position: TooltipPosition = TooltipPosition.centerTop
	let gap: number = 40
	let isOpen: boolean = false
	let tooltipTextRef: HTMLDivElement
	let timeId: number | NodeJS.Timeout | null = null

	function createTooltipTextRef(): void {
		tooltipTextRef = document.createElement('div')
		tooltipTextRef.id = GlobalElementIds.textTooltip
		tooltipTextRef.popover = 'manual'
		document.body.appendChild(tooltipTextRef)
	}

	function closeTooltipRef(): void {
		stopProcess()
		timeId = setTimeout(() => {
			isOpen = false
			timeId = null
			if (!anchorRef) return

			const anchorRect: DOMRect | undefined = useAnchor
				? anchorRef.getBoundingClientRect()
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

			anchorRef = null

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
				translate: ['0 0', `${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`],
				opacity: [1, 0],
				scale: [1, .75]
			}, { duration: 250, easing: AnimationEasing.springBounceInverse })
			.finished.then(() => {
				tooltipTextRef.hidePopover()
			})
		}, endDelayDuration)
	}

	function openTooltipRef(ev: CustomEvent<_TooltipOpenDetail>): void {
		const detail = ev.detail
		const byFocus = detail.byFocus
		const event = detail.event
		const target = event.target as HTMLElement
		const tooltip = event.currentTarget as TooltipElement
		if (!tooltip.contains(target)) return

		if (!tooltip.id) {
			tooltip.id = createElementId()
		}

		// NOTE:
		// `target` is possible inside element with `[data-tooltip]`
		let $anchor = target.closest(
			`#${CSS.escape(tooltip.id)} :is([${TooltipTargetAttributes.tooltip}])`
		) as HTMLElement
		if (!$anchor) return closeTooltipRef()
		if ($anchor === anchorRef) return

		const text = $anchor.dataset.tooltip
		if (!text) return

		if (byFocus && document.hasFocus()) {
			$anchor = document.activeElement! as HTMLElement

			const rect = $anchor.getBoundingClientRect()
			POINTER_X = rect.left + rect.width / 2
			POINTER_Y = rect.top + rect.height / 2
		}

		const startDelayDuration = safeNumber(Number.parseFloat(
			$anchor.getAttribute(TooltipTargetAttributes.startDelayDuration)
			?? tooltip.getAttribute(TooltipAttributes.startDelayDuration)
			?? `${isOpen? 500 : 1000}`
		), byFocus? 0 : isOpen? 500 : 1000)
		stopProcess()
		timeId = setTimeout(() => {
			timeId = null
			isOpen = true
			anchorRef = $anchor
			gap = remToPx(safeNumber(Number.parseFloat(
				anchorRef.getAttribute(TooltipTargetAttributes.gap)
				?? tooltip.getAttribute(TooltipAttributes.gap)
				?? `${pxToRem(40)}`
			), pxToRem(40)))
			endDelayDuration = safeNumber(Number.parseFloat(
				anchorRef.getAttribute(TooltipTargetAttributes.endDelayDuration)
				?? tooltip.getAttribute(TooltipAttributes.endDelayDuration)
				?? `${isTouchScreen()? 1500 : 200}`
			), isTouchScreen()? 1500 : 200)
			position = (
				anchorRef.getAttribute(TooltipTargetAttributes.position)
				?? tooltip.getAttribute(TooltipAttributes.position)
				?? TooltipPosition.centerTop
			) as TooltipPosition
			if (!isValidEnumValue(position, TooltipPosition)) {
				position = TooltipPosition.centerTop
			}

			useAnchor = (
				anchorRef.hasAttribute(TooltipTargetAttributes.useAnchor)
				|| tooltip.hasAttribute(TooltipAttributes.useAnchor)
			)
			tooltipTextRef.textContent = text
			tooltipTextRef.showPopover()
			const tooltipRect: DOMRect = tooltipTextRef.getBoundingClientRect()
			const anchorRect: DOMRect | undefined = useAnchor? anchorRef.getBoundingClientRect() : undefined
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

			tooltipTextRef.style.setProperty('left', pxToRem(flyoutPosition.left) + 'rem')
			tooltipTextRef.style.setProperty('top', pxToRem(flyoutPosition.top) + 'rem')
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
				translate: [`${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`, '0 0'],
				opacity: [0, 1],
				scale: [.75, 1],
			}, { duration: 250, easing: AnimationEasing.springBounce })
		}, startDelayDuration)
	}

	function stopProcess(): void {
		if (timeId === null) return

		clearTimeout(timeId)
	}

	function initEvents(): void {
		body.addEventListener(_TooltipListenerEvents.open as any, openTooltipRef)
		body.addEventListener(_TooltipListenerEvents.close, closeTooltipRef)
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.x
			POINTER_Y = ev.y
		})
	}

	createTooltipTextRef()
	initEvents()
}

function _initTooltipRef(tooltipRef: TooltipElement): void {
	const bodyRef = document.body

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
		bodyRef.dispatchEvent(new CustomEvent<_TooltipOpenDetail>(_TooltipListenerEvents.open, {
			detail: {
				event: ev,
				byFocus
			}
		}))
	}

	function closeTooltip(): void {
		TOOLTIP_LISTENER = null
		bodyRef.dispatchEvent(new CustomEvent(_TooltipListenerEvents.close))
	}

	function initEvents(): void {
		tooltipRef.addEventListener('focusin', ev => {
			const target = ev.target as HTMLElement
			if (!target.matches(':focus-visible')) return

			openTooltip(ev, true)
		})
		tooltipRef.addEventListener('focusout', () => {
			closeTooltip()
		})
		tooltipRef.addEventListener('pointerover', ev => {
			POINTER_X = ev.x
			POINTER_Y = ev.y
			openTooltip(ev)
		})
		tooltipRef.addEventListener('touchstart', ev => {
			const touches = ev.touches
			POINTER_X = touches[0].clientX
			POINTER_Y = touches[0].clientY
			openTooltip(ev)
		}, {
			passive: true
		})
		tooltipRef.addEventListener('pointerleave', () => {
			closeTooltip()
		})
		tooltipRef.addEventListener('mousedown', () => {
			closeTooltip()
		})
		tooltipRef.addEventListener('pointerup', () => {
			closeTooltip()
		})
	}

	initEvents()
}

function createTooltipRef(options?: TooltipUpdateOptions): TooltipElement {
	const tooltipRef = updateTooltipRef(document.createElement('div'), options)
	registerTooltipRef(tooltipRef)
	return tooltipRef
}

function updateTooltipRef(tooltipRef: TooltipElement, options?: TooltipUpdateOptions): TooltipElement {
	tooltipRef.classList.add(TooltipClasses.tooltip)

	if (!tooltipRef.id) {
		tooltipRef.id = createElementId()
	}

	const startDelayOption = options?.TooltipStartDelay
	if (startDelayOption === false) {
		tooltipRef.removeAttribute(TooltipAttributes.startDelayDuration)
	}
	else if (startDelayOption !== undefined && startDelayOption !== true) {
		tooltipRef.setAttribute(TooltipAttributes.startDelayDuration, startDelayOption + '')
	}

	const endDelayOption = options?.TooltipEndDelay
	if (endDelayOption === false) {
		tooltipRef.removeAttribute(TooltipAttributes.endDelayDuration)
	}
	else if (endDelayOption !== undefined && endDelayOption !== true) {
		tooltipRef.setAttribute(TooltipAttributes.endDelayDuration, endDelayOption + '')
	}

	const gapOption = options?.TooltipGap
	if (gapOption === false) {
		tooltipRef.removeAttribute(TooltipAttributes.gap)
	}
	else if (gapOption !== undefined && gapOption !== true) {
		tooltipRef.setAttribute(TooltipAttributes.gap, gapOption + '')
	}

	const positionOption = options?.TooltipPosition
	if (positionOption === false) {
		tooltipRef.removeAttribute(TooltipAttributes.position)
	}
	else if (positionOption !== undefined && positionOption !== true) {
		tooltipRef.setAttribute(TooltipAttributes.position, positionOption)
	}

	const useAnchorOption = options?.TooltipUseAnchor
	if (useAnchorOption !== undefined) {
		tooltipRef.toggleAttribute(TooltipAttributes.useAnchor, useAnchorOption)
	}

	const childrenOption = options?.TooltipChildren
	if (childrenOption === false) {
		tooltipRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		tooltipRef.replaceChildren(...childrenOption)
	}

	options?.TooltipRefs?.tooltip?.(tooltipRef)
	return tooltipRef
}

function registerTooltipRef(...tooltipRefs: TooltipElement[]): void {
	_initTooltipRefListener()
	if (tooltipRefs.length === 0) {
		tooltipRefs = [...document.querySelectorAll<TooltipElement>('.' + TooltipClasses.tooltip)]
	}

	for (const tooltip of tooltipRefs) {
		if (REGISTERED_TOOLTIP.has(tooltip)) continue

		REGISTERED_TOOLTIP.add(tooltip)
		_initTooltipRef(tooltip)
	}
}

function unregisterTooltipRef(...tooltipRefs: TooltipElement[]): void {
	for (const tooltip of tooltipRefs) {
		REGISTERED_TOOLTIP.delete(tooltip)
	}
}

export {
	type TooltipProps,
	type TooltipUpdateOptions,
	type TooltipElement,
	TooltipClasses,
	TooltipAttributes,
	TooltipTargetAttributes,
	TooltipPosition,
	registerTooltipRef,
	unregisterTooltipRef,
	createTooltipRef,
	updateTooltipRef,
}