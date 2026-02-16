// TODO: use better alternative
import { AnimationEasing } from "@/enums/animation"
import { GlobalElementIds } from "@/enums/ids"
import { FlyoutPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
import { pxToRem, remToPx } from "@/utils/css"
import { getFlyoutPosition } from "@/utils/flyout"
import { createElementId } from "@/utils/ids"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { isTouchScreen } from "@/utils/platforms"
import { $create, $rect, $get_attr, $has_attr, $set_style, $add_event, $classlist, $is_false, $rm_attr, $is_number, $set_attr, $is_string, $is_bool, $toggle_attr, $children, $is_array } from "../utils"

export namespace CTooltip {
	export type CElement = HTMLDivElement

	export type UpdateOptions = {
		Tooltip?: {
			children  ?: (string | Node)[] | boolean
			startDelay?: number | boolean
			endDelay  ?: number | boolean
			gap       ?: number | boolean
			useAnchor ?: boolean
			position  ?: FlyoutPosition | boolean
			refs      ?: {
				tooltip?(ref: CElement): unknown
			}
		}
	}

	type EventDetails = {
		open: {
			event   : Event
			byFocus?: boolean
		}
	}

	export enum Classes {
		tooltip = 'c-tooltip'
	}

	export enum TargetAttributes {
		tooltip            = 'data-tooltip',
		startDelayDuration = tooltip + '-start-delay',
		endDelayDuration   = tooltip + '-end-delay',
		gap                = tooltip + '-gap',
		position           = tooltip + '-position',
		useAnchor          = tooltip + '-use-anchor'
	}

	export enum Attributes {
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

	enum Events {
		/** `!bubbles | !cancelable | detail = _TooltipOpenDetail` */
		open  = 'tooltiplistener:open',

		/** `!bubbles | !cancelable | !detail` */
		close = 'tooltiplistener:close',
	}

	const REGISTERED_TOOLTIP: Set<CElement> = new Set<CElement>()
	let HAS_LISTENER: boolean = false
	let TARGET: Element | null = null
	let LISTENER: HTMLDivElement | null = null
	let POINTER_X = 0
	let POINTER_Y = 0

	function initListener(): void {
		if (HAS_LISTENER) return

		HAS_LISTENER = true
		const ref_body = document.body
		let endDelayDuration: number = 0
		let pointerOpenX: number = 0
		let pointerOpenY: number = 0
		let ref_anchor: HTMLElement | null = null
		let useAnchor: boolean = false
		let position = FlyoutPosition.centerTop
		let gap: number = 40
		let isOpen: boolean = false
		let ref_tooltipText: HTMLDivElement
		let time: number | NodeJS.Timeout | null = null

		function createTooltipTextRef(): void {
			ref_tooltipText = $create('div')
			ref_tooltipText.id = GlobalElementIds.textTooltip
			ref_tooltipText.popover = 'manual'
			document.body.appendChild(ref_tooltipText)
		}

		function closeTooltipRef(): void {
			stopProcess()
			time = setTimeout(() => {
				isOpen = false
				time = null
				if (!ref_anchor) return

				const anchorRect: DOMRect | undefined = useAnchor
					? $rect(ref_anchor)
					: undefined
				const tooltipRect = $rect(ref_tooltipText)
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

				ref_anchor = null

				if (!isAnimationAllowed()) {
					ref_tooltipText.hidePopover()
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

				ref_tooltipText.animate({
					translate: ['0 0', `${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`],
					opacity: [1, 0],
					scale: [1, .75]
				}, { duration: 250, easing: AnimationEasing.springBounceInverse })
				.finished.then(() => {
					ref_tooltipText.hidePopover()
				})
			}, endDelayDuration)
		}

		function openTooltipRef(ev: CustomEvent<EventDetails['open']>): void {
			const detail = ev.detail
			const byFocus = detail.byFocus
			const event = detail.event
			const ref_target = event.target as HTMLElement
			const ref_tooltip = event.currentTarget as CElement
			if (!ref_tooltip.contains(ref_target)) return

			if (!ref_tooltip.id) {
				ref_tooltip.id = createElementId()
			}

			// NOTE:
			// `target` is possible inside element with `[data-tooltip]`
			let $anchor = ref_target.closest(
				`#${CSS.escape(ref_tooltip.id)} :is([${TargetAttributes.tooltip}])`
			) as HTMLElement
			if (!$anchor) return closeTooltipRef()
			if ($anchor === ref_anchor) return

			const text = $anchor.dataset.tooltip
			if (!text) return

			if (byFocus && document.hasFocus()) {
				$anchor = document.activeElement! as HTMLElement

				const rect = $rect($anchor)
				POINTER_X = rect.left + rect.width / 2
				POINTER_Y = rect.top + rect.height / 2
			}

			const startDelayDuration = safeNumber(Number.parseFloat(
				$get_attr($anchor, TargetAttributes.startDelayDuration)
				?? $get_attr(ref_tooltip, Attributes.startDelayDuration)
				?? `${isOpen? 500 : 1000}`
			), byFocus? 0 : isOpen? 500 : 1000)
			stopProcess()
			time = setTimeout(() => {
				time = null
				isOpen = true
				ref_anchor = $anchor
				gap = remToPx(safeNumber(Number.parseFloat(
					$get_attr(ref_anchor, TargetAttributes.gap)
					?? $get_attr(ref_tooltip, Attributes.gap)
					?? `${pxToRem(40)}`
				), pxToRem(40)))
				endDelayDuration = safeNumber(Number.parseFloat(
					$get_attr(ref_anchor, TargetAttributes.endDelayDuration)
					?? $get_attr(ref_tooltip, Attributes.endDelayDuration)
					?? `${isTouchScreen()? 1500 : 200}`
				), isTouchScreen()? 1500 : 200)
				position = (
					$get_attr(ref_anchor, TargetAttributes.position)
					?? $get_attr(ref_tooltip, Attributes.position)
					?? FlyoutPosition.centerTop
				) as FlyoutPosition
				if (!isValidEnumValue(position, FlyoutPosition)) {
					position = FlyoutPosition.centerTop
				}

				useAnchor = (
					$has_attr(ref_anchor, TargetAttributes.useAnchor)
					|| $has_attr(ref_tooltip, Attributes.useAnchor)
				)
				ref_tooltipText.textContent = text
				ref_tooltipText.showPopover()
				const tooltipRect: DOMRect = $rect(ref_tooltipText)
				const anchorRect: DOMRect | undefined = useAnchor? $rect(ref_anchor) : undefined
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

				$set_style(ref_tooltipText, 'left', pxToRem(flyoutPosition.left) + 'rem')
				$set_style(ref_tooltipText, 'top', pxToRem(flyoutPosition.top) + 'rem')
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

				ref_tooltipText.animate({
					translate: [`${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`, '0 0'],
					opacity: [0, 1],
					scale: [.75, 1],
				}, { duration: 250, easing: AnimationEasing.springBounce })
			}, startDelayDuration)
		}

		function stopProcess(): void {
			if (time === null) return

			clearTimeout(time)
		}

		function initEvents(): void {
			$add_event(ref_body, Events.open, openTooltipRef)
			$add_event(ref_body, Events.close, closeTooltipRef)
			$add_event<PointerEvent>(document, 'pointermove', ev => {
				POINTER_X = ev.x
				POINTER_Y = ev.y
			})
		}

		createTooltipTextRef()
		initEvents()
	}

	function initTooltip(ref_tooltip: CElement): void {
		const ref_body = document.body

		function openTooltip(ev: Event, byFocus: boolean = false): void {
			const self = ev.currentTarget as HTMLDivElement
			const target = ev.target as HTMLElement

			// Same as `event.stopPropagation()`
			if (
				LISTENER
				&& self.contains(LISTENER)
				&& TARGET === target
			) return

			LISTENER = self
			TARGET = target
			ref_body.dispatchEvent(new CustomEvent<EventDetails['open']>(Events.open, {
				detail: {
					event: ev,
					byFocus
				}
			}))
		}

		function closeTooltip(): void {
			LISTENER = null
			ref_body.dispatchEvent(new CustomEvent(Events.close))
		}

		function initEvents(): void {
			$add_event(ref_tooltip, 'focusin', ev => {
				const target = ev.target as HTMLElement
				if (!target.matches(':focus-visible')) return

				openTooltip(ev, true)
			})
			$add_event(ref_tooltip, 'focusout', () => closeTooltip())
			$add_event<PointerEvent>(ref_tooltip, 'pointerover', ev => {
				POINTER_X = ev.x
				POINTER_Y = ev.y
				openTooltip(ev)
			})
			ref_tooltip.addEventListener('touchstart', ev => {
				const touches = ev.touches
				POINTER_X = touches[0].clientX
				POINTER_Y = touches[0].clientY
				openTooltip(ev)
			}, {
				passive: true
			})
			$add_event(ref_tooltip, 'pointerleave', () => closeTooltip())
			$add_event(ref_tooltip, 'mousedown', () => closeTooltip())
			$add_event(ref_tooltip, 'pointerup', () => closeTooltip())
		}

		initEvents()
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_tooltip = update($create('div'), options)
		register(ref_tooltip)
		return ref_tooltip
	}

	export function update(ref_tooltip: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Tooltip
		$classlist(ref_tooltip, Classes.tooltip)

		if (!ref_tooltip.id) {
			ref_tooltip.id = createElementId()
		}

		const opt_startDelay = opt?.startDelay
		if ($is_false(opt_startDelay)) {
			$rm_attr(ref_tooltip, Attributes.startDelayDuration)
		}
		else if ($is_number(opt_startDelay)) {
			$set_attr(ref_tooltip, Attributes.startDelayDuration, opt_startDelay + '')
		}

		const opt_endDelay = opt?.endDelay
		if ($is_false(opt_endDelay)) {
			$rm_attr(ref_tooltip, Attributes.endDelayDuration)
		}
		else if ($is_number(opt_endDelay)) {
			$set_attr(ref_tooltip, Attributes.endDelayDuration, opt_endDelay + '')
		}

		const opt_gap = opt?.gap
		if ($is_false(opt_gap)) {
			$rm_attr(ref_tooltip, Attributes.gap)
		}
		else if ($is_number(opt_gap)) {
			$set_attr(ref_tooltip, Attributes.gap, opt_gap + '')
		}

		const opt_position = opt?.position
		if ($is_false(opt_position)) {
			$rm_attr(ref_tooltip, Attributes.position)
		}
		else if ($is_string(opt_position) && isValidEnumValue(opt_position, FlyoutPosition)) {
			$set_attr(ref_tooltip, Attributes.position, opt_position)
		}

		const opt_useAnchor = opt?.useAnchor
		if ($is_bool(opt_useAnchor)) {
			$toggle_attr(ref_tooltip, Attributes.useAnchor, opt_useAnchor)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_tooltip)
		}
		else if ($is_array(opt_children)) {
			$children(ref_tooltip, ...opt_children)
		}

		const refs = opt?.refs
		refs?.tooltip?.(ref_tooltip)
		return ref_tooltip
	}

	export function register(...refs_tooltip: CElement[]): void {
		initListener()
		if (refs_tooltip.length === 0) {
			refs_tooltip = [...document.querySelectorAll<CElement>('.' + Classes.tooltip)]
		}

		for (const ref of refs_tooltip) {
			if (REGISTERED_TOOLTIP.has(ref)) continue

			REGISTERED_TOOLTIP.add(ref)
			initTooltip(ref)
		}
	}

	export function unregister(...refs_tooltip: CElement[]): void {
		for (const ref of refs_tooltip) {
			REGISTERED_TOOLTIP.delete(ref)
		}
	}
}

export type TooltipProps = astroHTML.JSX.HTMLAttributes & {
	TooltipStartDelay?: number
	TooltipEndDelay  ?: number
	TooltipGap       ?: number
	TooltipUseAnchor ?: boolean
	TooltipPosition  ?: FlyoutPosition
}