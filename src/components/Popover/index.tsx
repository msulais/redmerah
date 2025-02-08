import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { FlyoutPosition as PopoverPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { timeTimerClear, timeTimerSet } from '@/utils/time'
import { attrHas, attrRemove, attrSet, attrSetIfExist, attrClassList } from '@/utils/attributes'
import { elementRect, elementAllBySelector, elementDataset, elementDispatchEvent, elementIsSame, elementClientWidth, elementAnimate, elementCreate, elementIdSet, elementAppendChild, elementStyleSet, elementPointerCaptureSet, elementPointerCaptureRelease, elementFocus, elementContains, elementFocusAny } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { eventListenerAdd, eventCall, eventCurrentTarget, eventPreventDefault, eventListenerRemove, eventTarget } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { documentActive, documentBody } from '@/utils/document'
import { windowInnerHeight } from '@/utils/window'
import { arrayFindIndex, arrayLength, arrayPush, arraySome, arraySplice } from '@/utils/array'
import { rectBottom, rectHeight, rectLeft, rectRight, rectTop, rectWidth } from '@/utils/rect'
import { AnimationEffectTiming } from '@/enums/animation'
import { promiseDone } from '@/utils/object'
import { ElementIds } from '@/enums/ids'
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_ESCAPE } from '@/constants/key_code'

import './index.scss'

type PopoverOpenDetail = {
	anchor?: HTMLElement

	/** Use this if you want to override the `PopoverOpenDetail.anchor` `DOMRect` */
	anchorRect?: DOMRect
	gap?: number
	padding?: number
	position?: PopoverPosition
	allowHideAnchor?: boolean
	draggable?: boolean
	manualDismiss?: boolean
	contentAutoFocus?: boolean
	onOpen?(): unknown

	/**
	 * Custom pointer position. Only works if `PopoverOpenDetail.anchor` and
	 * `PopoverOpenDetail.anchorRect` set to `undefined`
	 * */
	pointer?: {
		x: number
		y: number
	}
}

type PopoverCloseDetail = {
	onClose?(): unknown
}

enum PopoverAttributes {
	manual = 'data-c-manual'
}

enum PopoverEvents {
	close = 'custom:popover-close',
	reposition = 'custom:popover-reposition',

	/** @param {PopoverOpenDetail} detail `PopoverOpenDetail` */
	open = 'custom:popover-open'
}

enum PopoverListenerEvents {
	/** @param popover `HTMLDivElement` */
	open = 'custom:popoverlistener-open',

	/** @param popover `HTMLDivElement` */
	close = 'custom:popoverlistener-close'
}

let LISTENER_REF: HTMLDivElement
let STOP_GLOBAL_CLICK: boolean = false
let HAS_POPOVER_LISTENER: boolean = false
let POINTER_X: number = 0
let POINTER_Y: number = 0
const POPOVER_CLASS = 'c-popover'
const POPOVER_MARGIN = 8

function isPopoverOpen(popover: HTMLDivElement): boolean {
	return elementDataset(popover, 'cOpen') != undefined
}

function openPopover(
	popover: HTMLDivElement,
	options?: PopoverOpenDetail
): void {
	elementDispatchEvent(popover, new CustomEvent(
		PopoverEvents.open,
		{detail: {...options} satisfies PopoverOpenDetail}
	))
}

function initPopoverListener(): void {
	if (HAS_POPOVER_LISTENER) return;
	HAS_POPOVER_LISTENER = true

	const body = documentBody()
	const selector: string = 'div.c-popover:popover-open'
	const popovers: HTMLDivElement[] = []
	let isNoPointerEvent: boolean = false
	let timeId: number | null = null

	function createListenerElement(): void {
		const div = elementCreate('div')
		elementStyleSet(div, 'display', 'contents')
		elementIdSet(div, ElementIds.popoverListener)
		elementAppendChild(body, div)

		LISTENER_REF = div
	}

	function repositionAllPopover(): void {
		if (timeId != null) timeTimerClear(timeId)

		timeId = timeTimerSet(() => {
			for (const popover of elementAllBySelector(selector)) {
				repositionPopover(popover as HTMLDivElement)
			}
			timeId = null
		}, 250)
	}

	// when `globalClick()` below will fire, this must call after it
	function open(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const isExist = arraySome(
			popovers,
			popover => elementIsSame(popover, element)
		)
		STOP_GLOBAL_CLICK = false
		if (isExist) return;

		arrayPush(popovers, element)
	}

	function close(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const index = arrayFindIndex(
			popovers,
			popover => elementIsSame(popover, element)
		)
		if (index < 0) return;

		arraySplice(popovers, index, 1)
	}

	function globalClick(ev: MouseEvent): void {
		if (STOP_GLOBAL_CLICK) {
			STOP_GLOBAL_CLICK = false
			return
		}

		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have popover but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, popover will not automatically closed.
		if (isNoPointerEvent
			|| arrayLength(popovers) == 0
			|| !(ev as any).pointerType
		) return;

		const target = eventTarget(ev) as HTMLElement
		for (const popover of popovers) {
			const isClickedInside = elementContains(popover, target)
			if (isClickedInside || attrHas(popover, PopoverAttributes.manual)) return;

			closePopover(popover as HTMLDivElement)
		}
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent<HTMLDivElement>>(
			LISTENER_REF,
			PopoverListenerEvents.open,
			open
		)

		eventListenerAdd<CustomEvent<HTMLDivElement>>(
			LISTENER_REF,
			PopoverListenerEvents.close,
			close
		)

		eventListenerAdd(
			document,
			'click',
			globalClick
		)

		eventListenerAdd(document, 'scroll', () => {
			if (arrayLength(popovers) == 0) return;
			repositionAllPopover()
		})

		eventListenerAdd(window, 'resize', () => {
			if (arrayLength(popovers) == 0) return;
			repositionAllPopover()
		})

		eventListenerAdd<PointerEvent>(document, 'pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
	}

	function initObserver(): void {
		new MutationObserver(() => {
			isNoPointerEvent = attrHas(body, BodyAttributes.noPointerEvent)
		}).observe(body, { attributes: true })
	}

	createListenerElement()
	initEvents()
	initObserver()
}

function repositionPopover(popover: HTMLDivElement): void {
	elementDispatchEvent(popover, new CustomEvent(PopoverEvents.reposition))
}

function closePopover(popover: HTMLDivElement, options?: PopoverCloseDetail): void {
	elementDispatchEvent(popover, new CustomEvent(
		PopoverEvents.close,
		{detail: {...options} }
	))
}

type PopoverProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> & {
	style?: JSX.CSSProperties
	'c:portalMount'?: Node
	'c:usePortal'?: boolean
	'c:gap'?: number
	'c:padding'?: number
	'c:position'?: PopoverPosition
	'c:allowHideAnchor'?: boolean
	'c:draggable'?: boolean
	'c:contentAutoFocus'?: boolean
	'c:manualDismiss'?: boolean
	'c:attrContentWrapper'?: JSX.HTMLAttributes<HTMLDivElement>
	'c:onOpen'?(): unknown
	'c:onClose'?(): unknown
	'c:onToggleOpen'?(is_open: boolean): unknown
	'c:openAnimation'?(el: HTMLDivElement, done: () => void): unknown
	'c:closeAnimation'?(el: HTMLDivElement, done: () => void): unknown
}
const Popover: ParentComponent<PopoverProps> = ($props) => {
	const $$props = mergeProps({c_use_portal: true, id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:onToggleOpen', 'children', 'onToggle',
		'class', 'c:usePortal', 'style', 'c:openAnimation',
		'c:closeAnimation', 'c:gap', 'c:padding', 'c:position',
		'c:allowHideAnchor', 'c:draggable', 'c:manualDismiss',
		'c:onOpen', 'c:onClose', 'tabindex', 'onKeyDown',
		'c:attrContentWrapper', 'c:portalMount',
		'c:contentAutoFocus'
	])
	const style = createMemo(() => props.style)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [isDraggable, setIsDraggable] = createSignal<boolean>(false)
	const [isManualDismiss, setIsManualDismiss] = createSignal<boolean>(false)
	const [left, setLeft] = createSignal<number>(0)
	const [top, setTop] = createSignal<number>(0)
	const [maxWidth, setMaxWidth] = createSignal<number | undefined>(undefined)
	const [maxHeight, setMaxHeight] = createSignal<number | undefined>(undefined)
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [attrOpen, setAttrOpen] = createSignal<boolean>(false)
	const [attrOpenDone, setAttrOpenDone] = createSignal<boolean>(false)
	let pointerX: number = 0
	let pointerY: number = 0
	let isOpen: boolean = false
	let popoverRef: HTMLDivElement
	let anchorRef: HTMLElement | null = null
	let gap: number = 0
	let padding: number = 0
	let position: PopoverPosition = PopoverPosition.centerBottom
	let timeScreenSizeId: number | null = null
	let timeFixPositionId: number | null = null
	let screenWidth = elementClientWidth(documentBody())
	let screenHeight = windowInnerHeight()

	// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function fixPosition(): void {
		const popoverRect = elementRect(popoverRef)
		const screenWidth = elementClientWidth(documentBody())
		const screenHeight = windowInnerHeight()

		if (rectLeft(popoverRect) < POPOVER_MARGIN) setLeft(POPOVER_MARGIN)
		if (rectTop(popoverRect) < POPOVER_MARGIN) setTop(POPOVER_MARGIN)
		if (rectRight(popoverRect) > screenWidth) setLeft(screenWidth - rectWidth(popoverRect) - POPOVER_MARGIN)
		if (rectBottom(popoverRect) > screenHeight) setTop(screenHeight - rectHeight(popoverRect) - POPOVER_MARGIN)
	}

	function updatePosition(x: number, y: number) {
		setLeft(x - diffPositionX)
		setTop(y - diffPositionY)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isDragging()) return;

		updatePosition(ev.clientX, ev.clientY)
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLSpanElement}): void {
		if (!isDragging()) return;

		attrRemove(documentBody(), BodyAttributes.noPointerEvent)
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		setIsDragging(false)
		fixPosition()
		STOP_GLOBAL_CLICK = true
	}

	function customOnClose(ev: CustomEvent<PopoverCloseDetail>): void {
		closePopover(ev.detail)
	}

	function customOnOpen(ev: CustomEvent<PopoverOpenDetail>): void {
		openPopover(ev.detail)
	}

	function customOnReposition(_ev: CustomEvent): void {
		repositionPopover()
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent>(popoverRef, PopoverEvents.close, customOnClose)
		eventListenerAdd<CustomEvent>(popoverRef, PopoverEvents.open, customOnOpen)
		eventListenerAdd<CustomEvent>(popoverRef, PopoverEvents.reposition, customOnReposition)
	}

	function removeEvents(): void {
		eventListenerRemove<CustomEvent>(popoverRef, PopoverEvents.close, customOnClose)
		eventListenerRemove<CustomEvent>(popoverRef, PopoverEvents.open, customOnOpen)
		eventListenerRemove<CustomEvent>(popoverRef, PopoverEvents.reposition, customOnReposition)
	}

	function closePopover(options: PopoverCloseDetail): void {
		const {
			onClose
		} = options
		if (!isOpen) return;
		isOpen = false

		const anchorRect: DOMRect | undefined = anchorRef? elementRect(anchorRef) : undefined
		const popoverRect = elementRect(popoverRef)
		const pos = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap: gap,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			padding: padding,
			position: position
		}) as DOMRect

		const popoverPosition = {
			...pos,
			bottom: rectTop(pos) + rectHeight(popoverRect),
			right: rectLeft(pos) + rectWidth(popoverRect)
		}
		const popoverMidPosition = {
			x: rectLeft(popoverPosition) + (rectWidth(popoverRect) / 2),
			y: rectTop(popoverPosition) + (rectHeight(popoverRect) / 2),
		}
		let translateX = 0
		let translateY = 0
		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = rectLeft(anchorRect) + (rectWidth(anchorRect) / 2)
			anchorCenterTop = rectTop(anchorRect) + (rectHeight(anchorRect) / 2)
		}

		const rangeX = mathAbs(popoverMidPosition.x - anchorCenterLeft)
		const rangeY = mathAbs(popoverMidPosition.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((popoverMidPosition.x < anchorCenterTop || popoverMidPosition.x > anchorCenterTop) && (
				position == PopoverPosition.centerBottom
				|| position == PopoverPosition.centerBottomToLeft
				|| position == PopoverPosition.centerBottomToRight
				|| position == PopoverPosition.centerTop
				|| position == PopoverPosition.centerTopToLeft
				|| position == PopoverPosition.centerTopToRight
			)) {
				if (popoverMidPosition.y > anchorCenterTop ) translateY  = -12
				if (popoverMidPosition.y < anchorCenterTop ) translateY  = 12
			} else {
				if (popoverMidPosition.x > anchorCenterLeft) translateX = -12
				if (popoverMidPosition.x < anchorCenterLeft) translateX = 12
			}
		} else {
			if ((popoverMidPosition.y < anchorCenterLeft || popoverMidPosition.y > anchorCenterLeft) && (
				position == PopoverPosition.leftCenter
				|| position == PopoverPosition.leftCenterToBottom
				|| position == PopoverPosition.leftCenterToTop
				|| position == PopoverPosition.rightCenter
				|| position == PopoverPosition.rightCenterToBottom
				|| position == PopoverPosition.rightCenterToTop
			)) {
				if (popoverMidPosition.x > anchorCenterLeft) translateX = -12
				if (popoverMidPosition.x < anchorCenterLeft) translateX = 12
			} else {
				if (popoverMidPosition.y > anchorCenterTop ) translateY  = -12
				if (popoverMidPosition.y < anchorCenterTop ) translateY  = 12
			}
		}

		setAttrOpen(false)
		setAttrOpenDone(false)
		anchorRef = null
		elementDispatchEvent(LISTENER_REF, new CustomEvent(
			PopoverListenerEvents.close,
			{ detail: popoverRef }
		))
		props['c:onClose']?.()
		onClose?.()
		if (props['c:closeAnimation'] != null) props['c:closeAnimation'](
			popoverRef,
			() => popoverRef.hidePopover()
		)
		else promiseDone(elementAnimate(
			popoverRef,
			{ transform: `translate(${translateX}px, ${translateY}px)` },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished, () => popoverRef.hidePopover())
	}

	function openPopover(options: PopoverOpenDetail): void {
		if (isOpen) return

		const active = documentActive()
		const {
			pointer,
			anchorRect,
			allowHideAnchor = props['c:allowHideAnchor'] ?? true,
			anchor = null,
			draggable = props['c:draggable'] ?? false,
			gap: inputGap = props['c:gap'] ?? 0,
			padding: inputPadding = props['c:padding'] ?? 0,
			position: inputPosition = props['c:position'] ?? PopoverPosition.centerBottom,
			manualDismiss = props['c:manualDismiss'] ?? false,
			contentAutoFocus = props['c:contentAutoFocus'] ?? true,
			onOpen
		} = options;

		setIsManualDismiss(manualDismiss)
		setAllowHideAnchor(allowHideAnchor)
		isOpen = true
		anchorRef = anchor
		position = inputPosition
		gap = inputGap
		padding = inputPadding
		setIsDraggable(draggable)
		popoverRef.showPopover()
		if (contentAutoFocus) elementFocusAny(popoverRef)
		else if (active) elementFocus(active)
		else elementFocus(popoverRef)

		const popoverRect: DOMRect = elementRect(popoverRef)
		const $anchorRect: DOMRect | undefined = anchorRect != null
			? anchorRect
			: anchor
				? elementRect(anchor)
				: undefined
		pointerX = pointer? pointer.x : POINTER_X
		pointerY = pointer? pointer.y : POINTER_Y
		let pos = getFlyoutPosition({
			flyout: popoverRect,
			anchor: $anchorRect,
			gap: inputGap,
			pointer: $anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			padding: inputPadding,
			position: inputPosition
		}) as DOMRect

		if (!allowHideAnchor && anchor != null) {
			const popoverPosition = {
				...pos,
				bottom: rectTop(pos) + rectHeight(popoverRect),
				right: rectLeft(pos) + rectWidth(popoverRect)
			}
			const anchorMidPosition = {
				x: rectLeft($anchorRect!) + (rectWidth($anchorRect!) / 2),
				y: rectTop($anchorRect!) + (rectHeight($anchorRect!) / 2),
			}
			const popoverMidPosition = {
				x: rectLeft(popoverPosition) + (rectWidth(popoverRect) / 2),
				y: rectTop(popoverPosition) + (rectHeight(popoverRect) / 2),
			}
			const rangeX = mathAbs(popoverMidPosition.x - anchorMidPosition.x)
			const rangeY = mathAbs(popoverMidPosition.y - anchorMidPosition.y)
			const isLeftSide = popoverMidPosition.x < anchorMidPosition.x
			const isRightSide = popoverMidPosition.x > anchorMidPosition.x
			const isTopSide = popoverMidPosition.y < anchorMidPosition.y
			const isBottomSide = popoverMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && rectRight(popoverPosition) > rectLeft($anchorRect!)) {
					setMaxWidth(rectLeft($anchorRect!) - POPOVER_MARGIN - inputGap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && rectLeft(popoverPosition) < rectRight($anchorRect!)) {
					setMaxWidth((elementClientWidth(documentBody()) - rectRight($anchorRect!)) - POPOVER_MARGIN - inputGap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && rectBottom(popoverPosition) > rectTop($anchorRect!)) {
					setMaxHeight(rectTop($anchorRect!) - POPOVER_MARGIN - inputGap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && rectTop(popoverPosition) < rectBottom($anchorRect!)) {
					setMaxHeight((windowInnerHeight() - rectBottom($anchorRect!)) - POPOVER_MARGIN - inputGap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: elementRect(popoverRef),
				anchor: $anchorRect,
				gap: inputGap,
				pointer: $anchorRect? undefined : {
					x: pointerX,
					y: pointerY
				},
				padding: inputPadding,
				position: inputPosition
			}) as DOMRect
		}

		const popoverPosition = {
			...pos,
			bottom: rectTop(pos) + rectHeight(popoverRect),
			right: rectLeft(pos) + rectWidth(popoverRect)
		}
		const popoverMidPosition = {
			x: rectLeft(popoverPosition) + (rectWidth(popoverRect) / 2),
			y: rectTop(popoverPosition) + (rectHeight(popoverRect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if ($anchorRect) {
			anchorCenterLeft = $anchorRect.left + (rectWidth($anchorRect) / 2)
			anchorCenterTop = $anchorRect.top + (rectHeight($anchorRect) / 2)
		}

		const rangeX = mathAbs(popoverMidPosition.x - anchorCenterLeft)
		const rangeY = mathAbs(popoverMidPosition.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((popoverMidPosition.x < anchorCenterTop || popoverMidPosition.x > anchorCenterTop) && (
				inputPosition == PopoverPosition.centerBottom
				|| inputPosition == PopoverPosition.centerBottomToLeft
				|| inputPosition == PopoverPosition.centerBottomToRight
				|| inputPosition == PopoverPosition.centerTop
				|| inputPosition == PopoverPosition.centerTopToLeft
				|| inputPosition == PopoverPosition.centerTopToRight
			)) {
				if (popoverMidPosition.y > anchorCenterTop ) translate.top = -12
				if (popoverMidPosition.y < anchorCenterTop ) translate.top = 12
			} else {
				if (popoverMidPosition.x > anchorCenterLeft) translate.left = -12
				if (popoverMidPosition.x < anchorCenterLeft) translate.left = 12
			}
		} else {
			if ((popoverMidPosition.y < anchorCenterLeft || popoverMidPosition.y > anchorCenterLeft) && (
				inputPosition == PopoverPosition.leftCenter
				|| inputPosition == PopoverPosition.leftCenterToBottom
				|| inputPosition == PopoverPosition.leftCenterToTop
				|| inputPosition == PopoverPosition.rightCenter
				|| inputPosition == PopoverPosition.rightCenterToBottom
				|| inputPosition == PopoverPosition.rightCenterToTop
			)) {
				if (popoverMidPosition.x > anchorCenterLeft) translate.left = -12
				if (popoverMidPosition.x < anchorCenterLeft) translate.left = 12
			} else {
				if (popoverMidPosition.y > anchorCenterTop ) translate.top = -12
				if (popoverMidPosition.y < anchorCenterTop ) translate.top = 12
			}
		}

		setTop(rectTop(pos))
		setLeft(rectLeft(pos))
		setAttrOpen(true)
		props['c:onOpen']?.()
		onOpen?.()
		if (props['c:openAnimation'] != null) props['c:openAnimation'](
			popoverRef,
			() => setAttrOpenDone(true)
		)
		else promiseDone(elementAnimate(popoverRef,
			{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished, () => setAttrOpenDone(true))

		STOP_GLOBAL_CLICK = true

		// run after document.onclick
		timeTimerSet(() => elementDispatchEvent(LISTENER_REF, new CustomEvent(
			PopoverListenerEvents.open,
			{ detail: popoverRef }
		)))
	}

	function repositionPopover(): void {
		if (anchorRef == null) {
			fixPosition()
			return
		}

		const anchorRect = elementRect(anchorRef)
		const popoverRect = elementRect(popoverRef)

		let pos = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap: gap,
			position: position,
			padding: padding
		}) as DOMRect

		if (!allowHideAnchor()) {
			const popoverPosition = {
				...pos,
				bottom: rectTop(pos) + rectHeight(popoverRect),
				right: rectLeft(pos) + rectWidth(popoverRect)
			}
			const anchorMidPosition = {
				x: rectLeft(anchorRect!) + (rectWidth(anchorRect!) / 2),
				y: rectTop(anchorRect!) + (rectHeight(anchorRect!) / 2),
			}
			const popoverMidPosition = {
				x: rectLeft(popoverPosition) + (rectWidth(popoverRect) / 2),
				y: rectTop(popoverPosition) + (rectHeight(popoverRect) / 2),
			}
			const rangeX = mathAbs(popoverMidPosition.x - anchorMidPosition.x)
			const rangeY = mathAbs(popoverMidPosition.y - anchorMidPosition.y)
			const isLeftSide = popoverMidPosition.x < anchorMidPosition.x
			const isRightSide = popoverMidPosition.x > anchorMidPosition.x
			const isTopSide = popoverMidPosition.y < anchorMidPosition.y
			const isBottomSide = popoverMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && rectRight(popoverPosition) > rectLeft(anchorRect!)) {
					setMaxWidth(rectLeft(anchorRect!) - POPOVER_MARGIN - gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && rectLeft(popoverPosition) < rectRight(anchorRect!)) {
					setMaxWidth((elementClientWidth(documentBody()) - rectRight(anchorRect!)) - POPOVER_MARGIN - gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && rectBottom(popoverPosition) > rectTop(anchorRect!)) {
					setMaxHeight(rectTop(anchorRect!) - POPOVER_MARGIN - gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && rectTop(popoverPosition) < rectBottom(anchorRect!)) {
					setMaxHeight((windowInnerHeight() - rectBottom(anchorRect!)) - POPOVER_MARGIN - gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: elementRect(popoverRef),
				anchor: anchorRect,
				gap: gap,
				position: position,
				padding: padding
			}) as DOMRect
		}

		setTop(rectTop(pos))
		setLeft(rectLeft(pos))
	}

	function onMoveWithArrowKey(ev: KeyboardEvent): void {
		const code = ev.code
		if (
			code != KEY_ARROW_UP
			&& code != KEY_ARROW_DOWN
			&& code != KEY_ARROW_LEFT
			&& code != KEY_ARROW_RIGHT
		) return

		if (timeScreenSizeId == null) {
			screenWidth = elementClientWidth(documentBody())
			screenHeight = windowInnerHeight()
			timeScreenSizeId = timeTimerSet(() => timeScreenSizeId = null)
		}

		const width_one_percent = screenWidth / 100
		const height_one_percent = screenHeight / 100
		eventPreventDefault(ev)
		switch (code) {
			case KEY_ARROW_UP:
				setTop(t => t - height_one_percent)
				break
			case KEY_ARROW_DOWN:
				setTop(t => t + height_one_percent)
				break
			case KEY_ARROW_LEFT:
				setLeft(l => l - width_one_percent)
				break
			case KEY_ARROW_RIGHT:
				setLeft(l => l + width_one_percent)
				break
		}
		if (timeFixPositionId != null) timeTimerClear(timeFixPositionId)

		timeFixPositionId = timeTimerSet(() => {
			fixPosition()
			timeFixPositionId = null
		}, 200)
	}

	onMount(() => {
		initPopoverListener()
		initEvents()
	})

	onCleanup(() => {
		removeEvents()
		closePopover({})
	})

	const C: VoidComponent = () => (<div
		tabindex={props.tabindex ?? '0'}
		onKeyDown={ev => {
			eventCall(ev, props.onKeyDown)
			if (ev.code != KEY_ESCAPE || isManualDismiss()) return
			if (anchorRef) elementFocus(anchorRef)

			closePopover({})
		}}
		class={attrClassList(POPOVER_CLASS, props.class ?? '')}
		ref={mergeRefs(props.ref, r => popoverRef = r)}
		style={{
			...style(),
			top: style()?.top ?? top() + 'px',
			left: style()?.left ?? left() + 'px',
			"max-width": !allowHideAnchor()
				? maxWidth() != undefined
					? maxWidth() + 'px'
					: style()?.["max-width"] ?? undefined
				: style()?.["max-width"] ?? undefined,
			"max-height": !allowHideAnchor()
				? maxHeight() != undefined
					? maxHeight() + 'px'
					: style()?.['max-height'] ?? undefined
				: style()?.['max-height'] ?? undefined,
		}}
		popover={'manual'}
		onToggle={(ev) => {
			eventCall(ev, props.onToggle)
			isOpen = ev.newState == 'open'
			props['c:onToggleOpen']?.(isOpen)
		}}
		data-c-draggable={attrSetIfExist(isDraggable())}
		data-c-open={attrSetIfExist(attrOpen())}
		data-c-open-done={attrSetIfExist(attrOpenDone())}
		data-c-drag={attrSetIfExist(isDragging())}
		data-c-manual={attrSetIfExist(isManualDismiss())}
		{...other}>
		<Show when={isDraggable()}>
			<span
				tabindex="0"
				class="c-popover-drag-handle"
				data-g-keep-pointer-event={attrSetIfExist(isDragging())}
				draggable={false}
				onKeyDown={onMoveWithArrowKey}
				onPointerDown={(ev) => {
					const rect = elementRect(popoverRef)
					elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
					setIsDragging(true)
					attrSet(documentBody(), BodyAttributes.noPointerEvent)
					diffPositionX = ev.clientX - rect.x
					diffPositionY = ev.clientY - rect.y
				}}
				onPointerCancel={onPointerUp}
				onPointerUp={onPointerUp}
				onPointerMove={onPointerMove}
				onDblClick={() => repositionPopover()}
			/>
		</Show>
		<div {...props['c:attrContentWrapper'] ?? {}}>
			{props.children}
		</div>
		<span class="c-popover-portal-placeholder"></span>
	</div>)

	return (<Show
		when={props['c:usePortal']}
		fallback={<C/>}>
		<Portal mount={props['c:portalMount']}><C/></Portal>
	</Show>)
}

export {
	PopoverAttributes,
	PopoverEvents,
	openPopover,
	repositionPopover,
	closePopover,
	Popover,
	isPopoverOpen,
	PopoverPosition,
	POPOVER_CLASS
}
export type {
	PopoverOpenDetail,
	PopoverCloseDetail,
	PopoverProps
}
export default Popover