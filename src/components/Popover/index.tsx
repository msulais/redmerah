import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { FlyoutPosition as PopoverPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { attrSetIfExist, attrClassList } from '@/utils/attributes'
import { elementFocusAny } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { eventCall } from "@/utils/event"
import { AnimationEffectTiming } from '@/enums/animation'
import { ElementIds } from '@/enums/ids'
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_ESCAPE } from '@/constants/key-code'
import { animationIsOn } from '@/utils/animation'

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
	return popover.dataset.cOpen != undefined
}

function openPopover(
	popover: HTMLDivElement,
	options?: PopoverOpenDetail
): void {
	popover.dispatchEvent(new CustomEvent(
		PopoverEvents.open,
		{detail: {...options} satisfies PopoverOpenDetail}
	))
}

function initPopoverListener(): void {
	if (HAS_POPOVER_LISTENER) return;
	HAS_POPOVER_LISTENER = true

	const body = document.body
	const selector: string = 'div.c-popover:popover-open'
	const popovers: HTMLDivElement[] = []
	let isNoPointerEvent: boolean = false
	let timeId: number | NodeJS.Timeout | null = null

	function createListenerElement(): void {
		const div = document.createElement('div')
		div.style.setProperty('display', 'contents')
		div.id = ElementIds.popoverListener
		body.appendChild(div)

		LISTENER_REF = div
	}

	function repositionAllPopover(): void {
		if (timeId != null) clearTimeout(timeId)

		timeId = setTimeout(() => {
			for (const popover of document.querySelectorAll(selector)) {
				repositionPopover(popover as HTMLDivElement)
			}
			timeId = null
		}, 250)
	}

	// when `globalClick()` below will fire, this must call after it
	function open(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const isExist = popovers.some(popover => popover === element)
		STOP_GLOBAL_CLICK = false
		if (isExist) return;

		popovers.push(element)
	}

	function close(ev: CustomEvent<HTMLDivElement>): void {
		const element = ev.detail
		const index = popovers.findIndex(popover => popover === element)
		if (index < 0) return;

		popovers.splice(index, 1)
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
			|| popovers.length == 0
			|| !(ev as any).pointerType
		) return;

		const target = ev.target as HTMLElement
		for (const popover of popovers) {
			const isClickedInside = popover.contains(target)
			if (isClickedInside || popover.hasAttribute(PopoverAttributes.manual)) return;

			closePopover(popover as HTMLDivElement)
		}
	}

	function initEvents(): void {
		LISTENER_REF.addEventListener(
			PopoverListenerEvents.open as any,
			open
		)

		LISTENER_REF.addEventListener(
			PopoverListenerEvents.close as any,
			close
		)

		document.addEventListener('click', globalClick)

		document.addEventListener('scroll', () => {
			if (popovers.length == 0) return

			repositionAllPopover()
		})

		window.addEventListener('resize', () => {
			if (popovers.length == 0) return;
			repositionAllPopover()
		})

		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
	}

	function initObserver(): void {
		new MutationObserver(() => {
			isNoPointerEvent = body.hasAttribute(BodyAttributes.noPointerEvent)
		}).observe(body, { attributes: true })
	}

	createListenerElement()
	initEvents()
	initObserver()
}

function repositionPopover(popover: HTMLDivElement): void {
	popover.dispatchEvent(new CustomEvent(PopoverEvents.reposition))
}

function closePopover(popover: HTMLDivElement, options?: PopoverCloseDetail): void {
	popover.dispatchEvent(new CustomEvent(
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
	const $$props = mergeProps({'c:usePortal': true, id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:onToggleOpen', 'children', 'onToggle',
		'class', 'c:usePortal', 'style', 'c:openAnimation',
		'c:closeAnimation', 'c:gap', 'c:padding', 'c:position',
		'c:allowHideAnchor', 'c:draggable', 'c:manualDismiss',
		'c:onOpen', 'c:onClose', 'tabindex', 'onKeyDown',
		'c:attrContentWrapper', 'c:portalMount',
		'c:contentAutoFocus'
	])
	const body = document.body
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
	let timeScreenSizeId: number | NodeJS.Timeout | null = null
	let timeFixPositionId: number | NodeJS.Timeout | null = null
	let screenWidth = body.clientWidth
	let screenHeight = window.innerHeight

	// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function fixPosition(): void {
		const rect = popoverRef.getBoundingClientRect()
		const screenWidth = body.clientWidth
		const screenHeight = window.innerHeight

		if (rect.left < POPOVER_MARGIN) setLeft(POPOVER_MARGIN)
		if (rect.top < POPOVER_MARGIN) setTop(POPOVER_MARGIN)
		if (rect.right > screenWidth) setLeft(screenWidth - rect.width - POPOVER_MARGIN)
		if (rect.bottom > screenHeight) setTop(screenHeight - rect.height - POPOVER_MARGIN)
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

		body.removeAttribute(BodyAttributes.noPointerEvent)
		ev.currentTarget.releasePointerCapture(ev.pointerId)
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
		popoverRef.addEventListener(PopoverEvents.close as any, customOnClose)
		popoverRef.addEventListener(PopoverEvents.open as any, customOnOpen)
		popoverRef.addEventListener(PopoverEvents.reposition as any, customOnReposition)
	}

	function removeEvents(): void {
		popoverRef.removeEventListener(PopoverEvents.close as any, customOnClose)
		popoverRef.removeEventListener(PopoverEvents.open as any, customOnOpen)
		popoverRef.removeEventListener(PopoverEvents.reposition as any, customOnReposition)
	}

	function closePopover(options: PopoverCloseDetail): void {
		const {
			onClose
		} = options
		if (!isOpen) return;
		isOpen = false

		const anchorRect: DOMRect | undefined = anchorRef? anchorRef.getBoundingClientRect() : undefined
		const popoverRect = popoverRef.getBoundingClientRect()
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
			bottom: pos.top + popoverRect.height,
			right: pos.left + popoverRect.width
		}
		const popoverMidPosition = {
			x: popoverPosition.left + (popoverRect.width / 2),
			y: popoverPosition.top + (popoverRect.height / 2),
		}
		let translateX = 0
		let translateY = 0
		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = anchorRect.left + (anchorRect.width / 2)
			anchorCenterTop = anchorRect.top + (anchorRect.height / 2)
		}

		const rangeX = Math.abs(popoverMidPosition.x - anchorCenterLeft)
		const rangeY = Math.abs(popoverMidPosition.y - anchorCenterTop)

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
		LISTENER_REF.dispatchEvent(new CustomEvent(
			PopoverListenerEvents.close,
			{ detail: popoverRef }
		))
		props['c:onClose']?.()
		if (!animationIsOn()) {
			popoverRef.hidePopover()
			return
		}

		onClose?.()
		if (props['c:closeAnimation'] != null) props['c:closeAnimation'](
			popoverRef,
			() => popoverRef.hidePopover()
		)
		else popoverRef.animate(
			{ transform: `translate(${translateX}px, ${translateY}px)` },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished.then(() => popoverRef.hidePopover())
	}

	function openPopover(options: PopoverOpenDetail): void {
		if (isOpen) return

		const active = document.activeElement
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
		else if (active) (active as HTMLElement).focus()
		else popoverRef.focus()

		const popoverRect: DOMRect = popoverRef.getBoundingClientRect()
		const $anchorRect: DOMRect | undefined = anchorRect != null
			? anchorRect
			: anchor
				? anchor.getBoundingClientRect()
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
				bottom: pos.top + popoverRect.height,
				right: pos.left + popoverRect.width
			}
			const anchorMidPosition = {
				x: $anchorRect!.left + ($anchorRect!.width / 2),
				y: $anchorRect!.top + ($anchorRect!.height / 2),
			}
			const popoverMidPosition = {
				x: popoverPosition.left + (popoverRect.width / 2),
				y: popoverPosition.top + (popoverRect.height / 2),
			}
			const rangeX = Math.abs(popoverMidPosition.x - anchorMidPosition.x)
			const rangeY = Math.abs(popoverMidPosition.y - anchorMidPosition.y)
			const isLeftSide = popoverMidPosition.x < anchorMidPosition.x
			const isRightSide = popoverMidPosition.x > anchorMidPosition.x
			const isTopSide = popoverMidPosition.y < anchorMidPosition.y
			const isBottomSide = popoverMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && popoverPosition.right > $anchorRect!.left) {
					setMaxWidth($anchorRect!.left - POPOVER_MARGIN - inputGap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && popoverPosition.left < $anchorRect!.right) {
					setMaxWidth((body.clientWidth - $anchorRect!.right) - POPOVER_MARGIN - inputGap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && popoverPosition.bottom > $anchorRect!.top) {
					setMaxHeight($anchorRect!.top - POPOVER_MARGIN - inputGap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && popoverPosition.top < $anchorRect!.bottom) {
					setMaxHeight((window.innerHeight - $anchorRect!.bottom) - POPOVER_MARGIN - inputGap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: popoverRef.getBoundingClientRect(),
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
			bottom: pos.top + popoverRect.height,
			right: pos.left + popoverRect.width
		}
		const popoverMidPosition = {
			x: popoverPosition.left + (popoverRect.width / 2),
			y: popoverPosition.top + (popoverRect.height / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if ($anchorRect) {
			anchorCenterLeft = $anchorRect.left + ($anchorRect.width / 2)
			anchorCenterTop = $anchorRect.top + ($anchorRect.height / 2)
		}

		const rangeX = Math.abs(popoverMidPosition.x - anchorCenterLeft)
		const rangeY = Math.abs(popoverMidPosition.y - anchorCenterTop)

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

		setTop(pos.top)
		setLeft(pos.left)
		setAttrOpen(true)
		props['c:onOpen']?.()
		onOpen?.()
		if (!animationIsOn()) {
			setAttrOpenDone(true)
		}
		else {
			if (props['c:openAnimation'] != null) props['c:openAnimation'](
				popoverRef,
				() => setAttrOpenDone(true)
			)
			else popoverRef.animate(
				{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
				{ duration: 300, easing: AnimationEffectTiming.springBounce }
			).finished.then(() => setAttrOpenDone(true))
		}

		STOP_GLOBAL_CLICK = true

		// run after document.onclick
		setTimeout(() => LISTENER_REF.dispatchEvent(new CustomEvent(
			PopoverListenerEvents.open,
			{ detail: popoverRef }
		)))
	}

	function repositionPopover(): void {
		if (anchorRef == null) {
			fixPosition()
			return
		}

		const anchorRect = anchorRef.getBoundingClientRect()
		const popoverRect = popoverRef.getBoundingClientRect()

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
				bottom: pos.top + popoverRect.height,
				right: pos.left + popoverRect.width
			}
			const anchorMidPosition = {
				x: anchorRect!.left + (anchorRect!.width / 2),
				y: anchorRect!.top + (anchorRect!.height / 2),
			}
			const popoverMidPosition = {
				x: popoverPosition.left + (popoverRect.width / 2),
				y: popoverPosition.top + (popoverRect.height / 2),
			}
			const rangeX = Math.abs(popoverMidPosition.x - anchorMidPosition.x)
			const rangeY = Math.abs(popoverMidPosition.y - anchorMidPosition.y)
			const isLeftSide = popoverMidPosition.x < anchorMidPosition.x
			const isRightSide = popoverMidPosition.x > anchorMidPosition.x
			const isTopSide = popoverMidPosition.y < anchorMidPosition.y
			const isBottomSide = popoverMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && popoverPosition.right > anchorRect!.left) {
					setMaxWidth(anchorRect!.left - POPOVER_MARGIN - gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && popoverPosition.left < anchorRect!.right) {
					setMaxWidth((body.clientWidth - anchorRect!.right) - POPOVER_MARGIN - gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && popoverPosition.bottom > anchorRect!.top) {
					setMaxHeight(anchorRect!.top - POPOVER_MARGIN - gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && popoverPosition.top < anchorRect!.bottom) {
					setMaxHeight((window.innerHeight - anchorRect!.bottom) - POPOVER_MARGIN - gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: popoverRef.getBoundingClientRect(),
				anchor: anchorRect,
				gap: gap,
				position: position,
				padding: padding
			}) as DOMRect
		}

		setTop(pos.top)
		setLeft(pos.left)
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
			screenWidth = body.clientWidth
			screenHeight = window.innerHeight
			timeScreenSizeId = setTimeout(() => timeScreenSizeId = null)
		}

		const width_one_percent = screenWidth / 100
		const height_one_percent = screenHeight / 100
		ev.preventDefault()
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
		if (timeFixPositionId != null) clearTimeout(timeFixPositionId)

		timeFixPositionId = setTimeout(() => {
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
			if (anchorRef) anchorRef.focus()

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
					const rect = popoverRef.getBoundingClientRect()
					ev.currentTarget.setPointerCapture(ev.pointerId)
					setIsDragging(true)
					body.setAttribute(BodyAttributes.noPointerEvent, '')
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