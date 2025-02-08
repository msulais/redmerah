import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { timeTimerClear, timeTimerSet } from '@/utils/time'
import { attrHas, attrRemove, attrSet, attrSetIfExist, attrClassList } from '@/utils/attributes'
import { elementAnimate, elementClientWidth, elementDataset, elementDispatchEvent, elementFocus, elementIsSame, elementRect, elementScrollTop, elementAllBySelector, elementAppendChild, elementCreate, elementIdSet, elementStyleSet, elementPointerCaptureRelease, elementPointerCaptureSet } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { eventListenerAdd, eventCall, eventCurrentTarget, eventPreventDefault, eventListenerRemove, eventTarget, eventType } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { arrayAt, arrayFindIndex, arrayLength, arrayPush, arraySome, arraySplice } from '@/utils/array'
import { rectBottom, rectHeight, rectLeft, rectRight, rectTop, rectWidth } from '@/utils/rect'
import { documentBody, documentRoot } from '@/utils/document'
import { windowInnerHeight, windowScrollY, windowScrollTo } from '@/utils/window'
import { ElementIds } from '@/enums/ids'
import { promiseDone } from '@/utils/object'
import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from '@/constants/key_code'

import './index.scss'

type ModalOpenDetail = {
	event: Event
	anchor?: HTMLElement

	/** Use this if you want to override the `ModalOpenDetail.anchor` `DOMRect` */
	anchorRect?: DOMRect
	gap?: number
	padding?: number
	important?: boolean
	position?: ModalPosition
	allowHideAnchor?: boolean
	draggable?: boolean
	contentAutoFocus?: boolean
	onOpen?(): unknown

	/**
	 * Custom pointer position. Only works if `ModalOpenDetail.anchor` and
	 * `ModalOpenDetail.anchorRect` set to `undefined`
	 * */
	pointer?: {
		x: number
		y: number
	}
}

type ModalCloseDetail = {
	/** if the modal is important, it will not closed */
	soft?: boolean
	onClose?(): unknown
}

enum ModalEvents {
	shortfocus = 'custom:modal-shortfocus',

	/** @param {ModalCloseDetail} detail `ModalCloseDetail` */
	close = 'custom:modal-close',

	reposition = 'custom:modal-reposition',

	/** @param {ModalOpenDetail} detail `ModalOpenDetail` */
	open = 'custom:modal-open'
}

enum ModalListenerEvents {
	/** @param modal `HTMLDialogElement` */
	open = 'custom:modallistener-open',

	/** @param modal `HTMLDialogElement` */
	close = 'custom:modallistener-close'
}

let LISTENER_REF: HTMLDivElement
let STOP_GLOBAL_CLICK: boolean = false
let HAS_MODAL_LISTENER: boolean = false
const MODAL_CLASS = 'c-modal'
const MODAL_MARGIN = 8

function isModalOpen(modal: HTMLDialogElement): boolean {
	return elementDataset(modal, 'cOpen') != undefined
}

function openModal(
	event: Event,
	modal: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'>
): void {
	elementDispatchEvent(modal, new CustomEvent(
		ModalEvents.open,
		{detail: {event: event, ...options} satisfies ModalOpenDetail}
	))
}

function initModalListener(): void {
	if (HAS_MODAL_LISTENER) return;
	HAS_MODAL_LISTENER = true

	const body = documentBody()
	const selector: string = 'dialog.c-modal[open]'
	const modals: HTMLDialogElement[] = []
	let isNoPointerEvent: boolean = false
	let scrollTopValue: number = 0
	let timeId: number | null = null
	let timeCloseId: number | null = null

	// make sure not to close other modal after closing some modal
	let removed = false

	function createListenerElement(): void {
		const div = elementCreate('div')
		elementStyleSet(div, 'display', 'contents')
		elementIdSet(div, ElementIds.modalListener)
		elementAppendChild(body, div)

		LISTENER_REF = div
	}

	function repositionAllModal(): void {
		if (arrayLength(modals) == 0) return;
		if (timeId != null) timeTimerClear(timeId)

		timeId = timeTimerSet(() => {
			for (const modal of elementAllBySelector(selector)) {
				repositionModal(modal as HTMLDialogElement)
			}
			timeId = null
		}, 250)
	}

	function open(ev: CustomEvent<HTMLDialogElement>): void {
		const element: HTMLDialogElement = ev.detail
		const isExist = arraySome(modals, modal => elementIsSame(modal, element))
		if (isExist) return;

		arrayPush(modals, element)
	}

	function close(ev: CustomEvent<HTMLDialogElement>): void {
		const element = ev.detail
		const index = arrayFindIndex(modals, modal => elementIsSame(modal, element))
		if (index < 0) return;

		arraySplice(modals, index, 1)
		removed = arrayLength(modals) > 0
		if (!removed) return
		if (timeCloseId != null) timeTimerClear(timeCloseId)

		timeCloseId = timeTimerSet(() => {
			removed = false
			timeCloseId = null
		}, 50)
	}

	function globalClick(ev: MouseEvent): void {
		if (STOP_GLOBAL_CLICK) {
			STOP_GLOBAL_CLICK = false
			return
		}

		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have modal but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, modal will not automatically closed.
		if (
			isNoPointerEvent
			|| arrayLength(modals) == 0
			|| removed
			|| !(ev as any).pointerType) {
			removed = false
			return
		}
		const modal: HTMLDialogElement = arrayAt(modals, -1)!
		const isClickedInside = modal !== eventTarget(ev)
		if (isClickedInside) return

		closeModal(modal as HTMLDialogElement, {soft: true})
	}

	function globalScroll(): void {
		if (arrayLength(modals) == 0) {
			scrollTopValue = windowScrollY() || elementScrollTop(documentRoot())
			return
		}

		windowScrollTo({
			top: scrollTopValue,
			behavior: 'instant'
		})
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent<HTMLDialogElement>>(
			LISTENER_REF,
			ModalListenerEvents.open,
			open
		)

		eventListenerAdd<CustomEvent<HTMLDialogElement>>(
			LISTENER_REF,
			ModalListenerEvents.close,
			close
		)

		eventListenerAdd(document, 'click', globalClick)
		eventListenerAdd(document, 'scroll', globalScroll)
		eventListenerAdd(window, 'resize', repositionAllModal)
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

function repositionModal(modal: HTMLDialogElement): void {
	elementDispatchEvent(modal, new CustomEvent(ModalEvents.reposition))
}

function focusModal(modal: HTMLDialogElement): void {
	elementDispatchEvent(modal, new CustomEvent(ModalEvents.shortfocus))
}

function closeModal(modal: HTMLDialogElement, options?: ModalCloseDetail): void {
	elementDispatchEvent(modal, new CustomEvent(
		ModalEvents.close,
		{detail: {...options}}
	))
}

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'style'> & {
	style?: JSX.CSSProperties
	'c:portalMount'?: Node
	'c:gap'?: number
	'c:padding'?: number
	'c:important'?: boolean
	'c:position'?: ModalPosition
	'c:allowHideAnchor'?: boolean
	'c:draggable'?: boolean
	'c:contentAutoFocus'?: boolean
	'c:attrContentWrappwer'?: JSX.HTMLAttributes<HTMLDivElement>
	'c:onOpen'?(): unknown
	'c:onClose'?(): unknown
	'c:onToggleOpen'?(is_open: boolean): unknown
	'c:openAnimation'?(el: HTMLDialogElement, done: () => unknown): unknown
	'c:closeAnimation'?(el: HTMLDialogElement, done: () => unknown): unknown
}
const Modal: ParentComponent<ModalProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:onToggleOpen', 'onClose', 'onCancel',
		'children', 'onKeyDown', 'class', 'c:openAnimation',
		'c:closeAnimation', 'style', 'c:gap', 'c:padding',
		'c:important', 'c:position', 'c:allowHideAnchor',
		'c:draggable', 'c:contentAutoFocus', 'c:onOpen',
		'c:onClose', 'c:attrContentWrappwer',
		'c:portalMount'
	])
	const style = createMemo(() => props.style)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [isDraggable, setIsDraggable] = createSignal<boolean>(false)
	const [left, setLeft] = createSignal<number>(0)
	const [top, setTop] = createSignal<number>(0)
	const [maxWidth, setMaxWidth] = createSignal<number | undefined>(undefined)
	const [maxHeight, setMaxHeight] = createSignal<number | undefined>(undefined)
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [attrOpen, setAttrOpen] = createSignal<boolean>(false)
	const [attrOpenDone, setAttrOpenDone] = createSignal<boolean>(false)
	const [attrFocus, setAttrFocus] = createSignal<boolean>(false)
	let pointerX: number = 0
	let pointerY: number = 0
	let isOpen: boolean = false
	let modalRef: HTMLDialogElement
	let timeFocusId: number | null = null
	let anchorRef: HTMLElement | null = null
	let important: boolean = false
	let gap: number = 0
	let padding: number = 0
	let position: ModalPosition = ModalPosition.centerBottom
	let timeScreenSizeId: number | null = null
	let timeFixPositionId: number | null = null
	let screenWidth = elementClientWidth(documentBody())
	let screenHeight = windowInnerHeight()

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function fixPosition(): void {
		const modalRect = elementRect(modalRef)
		const screenWidth = elementClientWidth(documentBody())
		const screenHeight = windowInnerHeight()

		if (rectLeft(modalRect) < MODAL_MARGIN) setLeft(MODAL_MARGIN)
		if (rectTop(modalRect) < MODAL_MARGIN) setTop(MODAL_MARGIN)
		if (rectRight(modalRect) > screenWidth) setLeft(screenWidth - rectWidth(modalRect) - MODAL_MARGIN)
		if (rectBottom(modalRect) > screenHeight) setTop(screenHeight - rectHeight(modalRect) - MODAL_MARGIN)
	}

	function updatePosition(x: number, y: number) {
		setLeft(x - diffPositionX)
		setTop(y - diffPositionY)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isDragging()) return;

		updatePosition(ev.clientX, ev.clientY)
	}

	function onPointerUp(ev: PointerEvent & { currentTarget: HTMLSpanElement }): void {
		if (!isDragging()) return;

		attrRemove(documentBody(), BodyAttributes.noPointerEvent)
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		setIsDragging(false)
		fixPosition()
		STOP_GLOBAL_CLICK = true
	}

	function customOnShortFocus(): void {
		shortFocusModal()
	}

	function customOnClose(ev: CustomEvent<ModalCloseDetail>): void {
		closeModal(ev.detail)
	}

	function customOnOpen(ev: CustomEvent<ModalOpenDetail>): void {
		openModal(ev.detail)
	}

	function customOnReposition(): void {
		repositionModal()
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent>(modalRef, ModalEvents.shortfocus, customOnShortFocus)
		eventListenerAdd<CustomEvent>(modalRef, ModalEvents.close, customOnClose)
		eventListenerAdd<CustomEvent>(modalRef, ModalEvents.open, customOnOpen)
		eventListenerAdd<CustomEvent>(modalRef, ModalEvents.reposition, customOnReposition)
	}

	function removeEvents(): void {
		eventListenerRemove<CustomEvent>(modalRef, ModalEvents.shortfocus, customOnShortFocus)
		eventListenerRemove<CustomEvent>(modalRef, ModalEvents.close, customOnClose)
		eventListenerRemove<CustomEvent>(modalRef, ModalEvents.open, customOnOpen)
		eventListenerRemove<CustomEvent>(modalRef, ModalEvents.reposition, customOnReposition)
	}

	function closeModal(detail: ModalCloseDetail): void {
		const {
			soft = false,
			onClose
		} = detail;

		if (soft && important && isOpen) {
			focusModal(modalRef)
			return
		}
		if (!isOpen) return;
		isOpen = false

		const anchorRect: DOMRect | undefined = anchorRef
			? elementRect(anchorRef)
			: undefined
		const modalRect = elementRect(modalRef)
		const pos = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap: gap,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			padding: padding,
			position: position
		}) as DOMRect

		const modalPosition = {
			...pos,
			bottom: rectTop(pos) + rectHeight(modalRect),
			right: rectLeft(pos) + rectWidth(modalRect)
		}
		const modalMidPosition = {
			x: rectLeft(modalPosition) + (rectWidth(modalRect) / 2),
			y: rectTop(modalPosition) + (rectHeight(modalRect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = rectLeft(anchorRect) + (rectWidth(anchorRect) / 2)
			anchorCenterTop = rectTop(anchorRect) + (rectHeight(anchorRect) / 2)
		}

		const rangeX = mathAbs(modalMidPosition.x - anchorCenterLeft)
		const rangeY = mathAbs(modalMidPosition.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((modalMidPosition.x < anchorCenterTop || modalMidPosition.x > anchorCenterTop) && (
				position == ModalPosition.centerBottom
				|| position == ModalPosition.centerBottomToLeft
				|| position == ModalPosition.centerBottomToRight
				|| position == ModalPosition.centerTop
				|| position == ModalPosition.centerTopToLeft
				|| position == ModalPosition.centerTopToRight
			)) {
				if (modalMidPosition.y > anchorCenterTop ) translate.top = -12
				if (modalMidPosition.y < anchorCenterTop ) translate.top = 12
			} else {
				if (modalMidPosition.x > anchorCenterLeft) translate.left = -12
				if (modalMidPosition.x < anchorCenterLeft) translate.left = 12
			}
		} else {
			if ((modalMidPosition.y < anchorCenterLeft || modalMidPosition.y > anchorCenterLeft) && (
				position == ModalPosition.leftCenter
				|| position == ModalPosition.leftCenterToBottom
				|| position == ModalPosition.leftCenterToTop
				|| position == ModalPosition.rightCenter
				|| position == ModalPosition.rightCenterToBottom
				|| position == ModalPosition.rightCenterToTop
			)) {
				if (modalMidPosition.x > anchorCenterLeft) translate.left = -12
				if (modalMidPosition.x < anchorCenterLeft) translate.left = 12
			} else {
				if (modalMidPosition.y > anchorCenterTop ) translate.top = -12
				if (modalMidPosition.y < anchorCenterTop ) translate.top = 12
			}
		}

		setAttrOpen(false)
		setAttrOpenDone(false)
		anchorRef = null
		elementDispatchEvent(LISTENER_REF, new CustomEvent(
			ModalListenerEvents.close,
			{detail: modalRef}
		))
		props['c:onClose']?.()
		onClose?.()
		if (props['c:closeAnimation'] != null) props['c:closeAnimation'](
			modalRef,
			() => modalRef.close()
		)
		else promiseDone(elementAnimate(
			modalRef,
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished, () => modalRef.close())
	}

	function shortFocusModal(): void {
		if (timeFocusId != null) timeTimerClear(timeFocusId)
		setAttrFocus(true)

		timeFocusId = timeTimerSet(() => {
			setAttrFocus(false)
			timeFocusId = null
		}, 1000)
	}

	function openModal(detail: ModalOpenDetail): void {
		if (isOpen) return;
		props['c:onToggleOpen']?.(true)

		const {
			event,
			pointer,
			anchorRect,
			onOpen,
			allowHideAnchor = props['c:allowHideAnchor'] ?? true,
			anchor = null,
			draggable = props['c:draggable'] ?? false,
			gap: inputGap = props['c:gap'] ?? 0,
			important: inputImportant = props['c:important'] ?? false,
			padding: inputPadding = props['c:padding'] ?? 0,
			position: inputPosition = props['c:position'] ?? ModalPosition.centerBottom,
			contentAutoFocus = props['c:contentAutoFocus'] ?? true
		} = detail;

		setAllowHideAnchor(allowHideAnchor)
		isOpen = true
		anchorRef = anchor
		position = inputPosition
		gap = inputGap
		padding = inputPadding
		important = inputImportant
		setIsDraggable(draggable)
		modalRef.showModal()
		if (!contentAutoFocus) elementFocus(modalRef)

		const modalRect: DOMRect = elementRect(modalRef)
		const $anchorRect: DOMRect | undefined = anchorRect != null
			? anchorRect
			: anchor
				? elementRect(anchor)
				: undefined
		const $event = (event as TouchEvent).touches
			? (event as TouchEvent).touches[0]
			: (event as MouseEvent)
		pointerX = pointer? pointer.x : $event.clientX ?? 0
		pointerY = pointer? pointer.y : $event.clientY ?? 0
		let pos = getFlyoutPosition({
			flyout: modalRect,
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
			const modalPosition = {
				...pos,
				bottom: rectTop(pos) + rectHeight(modalRect),
				right: rectLeft(pos) + rectWidth(modalRect)
			}
			const anchorMidPosition = {
				x: rectLeft($anchorRect!) + (rectWidth($anchorRect!) / 2),
				y: rectTop($anchorRect!) + (rectHeight($anchorRect!) / 2),
			}
			const modalMidPosition = {
				x: rectLeft(modalPosition) + (rectWidth(modalRect) / 2),
				y: rectTop(modalPosition) + (rectHeight(modalRect) / 2),
			}
			const rangeX = mathAbs(modalMidPosition.x - anchorMidPosition.x)
			const rangeY = mathAbs(modalMidPosition.y - anchorMidPosition.y)
			const isLeftSide = modalMidPosition.x < anchorMidPosition.x
			const isRightSide = modalMidPosition.x > anchorMidPosition.x
			const isTopSide = modalMidPosition.y < anchorMidPosition.y
			const isBottomSide = modalMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && rectRight(modalPosition) > rectLeft($anchorRect!)) {
					setMaxWidth(rectLeft($anchorRect!) - MODAL_MARGIN - inputGap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && rectLeft(modalPosition) < rectRight($anchorRect!)) {
					setMaxWidth((elementClientWidth(documentBody()) - rectRight($anchorRect!)) - MODAL_MARGIN - inputGap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && rectBottom(modalPosition) > rectTop($anchorRect!)) {
					setMaxHeight(rectTop($anchorRect!) - MODAL_MARGIN - inputGap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && rectTop(modalPosition) < rectBottom($anchorRect!)) {
					setMaxHeight((windowInnerHeight() - rectBottom($anchorRect!)) - MODAL_MARGIN - inputGap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: elementRect(modalRef),
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

		const modalPosition = {
			...pos,
			bottom: rectTop(pos) + rectHeight(modalRect),
			right: rectLeft(pos) + rectWidth(modalRect)
		}
		const modalMidPosition = {
			x: rectLeft(modalPosition) + (rectWidth(modalRect) / 2),
			y: rectTop(modalPosition) + (rectHeight(modalRect) / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = rectLeft(anchorRect) + (rectWidth(anchorRect) / 2)
			anchorCenterTop = rectTop(anchorRect) + (rectHeight(anchorRect) / 2)
		}

		const rangeX = mathAbs(modalMidPosition.x - anchorCenterLeft)
		const rangeY = mathAbs(modalMidPosition.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((modalMidPosition.x < anchorCenterTop || modalMidPosition.x > anchorCenterTop) && (
				position == ModalPosition.centerBottom
				|| position == ModalPosition.centerBottomToLeft
				|| position == ModalPosition.centerBottomToRight
				|| position == ModalPosition.centerTop
				|| position == ModalPosition.centerTopToLeft
				|| position == ModalPosition.centerTopToRight
			)) {
				if (modalMidPosition.y > anchorCenterTop ) translate.top = -12
				if (modalMidPosition.y < anchorCenterTop ) translate.top = 12
			} else {
				if (modalMidPosition.x > anchorCenterLeft) translate.left = -12
				if (modalMidPosition.x < anchorCenterLeft) translate.left = 12
			}
		} else {
			if ((modalMidPosition.y < anchorCenterLeft || modalMidPosition.y > anchorCenterLeft) && (
				position == ModalPosition.leftCenter
				|| position == ModalPosition.leftCenterToBottom
				|| position == ModalPosition.leftCenterToTop
				|| position == ModalPosition.rightCenter
				|| position == ModalPosition.rightCenterToBottom
				|| position == ModalPosition.rightCenterToTop
			)) {
				if (modalMidPosition.x > anchorCenterLeft) translate.left = -12
				if (modalMidPosition.x < anchorCenterLeft) translate.left = 12
			} else {
				if (modalMidPosition.y > anchorCenterTop ) translate.top = -12
				if (modalMidPosition.y < anchorCenterTop ) translate.top = 12
			}
		}

		setTop(rectTop(pos))
		setLeft(rectLeft(pos))
		setAttrOpen(true)
		elementDispatchEvent(LISTENER_REF, new CustomEvent(
			ModalListenerEvents.open,
			{detail: modalRef}
		))
		props['c:onOpen']?.()
		onOpen?.()
		if (props['c:openAnimation'] != null) props['c:openAnimation'](
			modalRef,
			() => setAttrOpenDone(true)
		)
		else promiseDone(elementAnimate(
			modalRef,
			{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished, () => setAttrOpenDone(true))

		STOP_GLOBAL_CLICK = eventType(event) == 'click'
	}

	function repositionModal(): void {
		if (anchorRef == null) {
			fixPosition()
			return
		}

		const anchorRect = elementRect(anchorRef)
		const modalRect = elementRect(modalRef)

		let pos = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap: gap,
			position: position,
			padding: padding
		}) as DOMRect

		if (!allowHideAnchor()) {
			const modalPosition = {
				...pos,
				bottom: rectTop(pos) + rectHeight(modalRect),
				right: rectLeft(pos) + rectWidth(modalRect)
			}
			const anchorMidPosition = {
				x: rectLeft(anchorRect!) + (rectWidth(anchorRect!) / 2),
				y: rectTop(anchorRect!) + (rectHeight(anchorRect!) / 2),
			}
			const modalMidPosition = {
				x: rectLeft(modalPosition) + (rectWidth(modalRect) / 2),
				y: rectTop(modalPosition) + (rectHeight(modalRect) / 2),
			}
			const rangeX = mathAbs(modalMidPosition.x - anchorMidPosition.x)
			const rangeY = mathAbs(modalMidPosition.y - anchorMidPosition.y)
			const isLeftSide = modalMidPosition.x < anchorMidPosition.x
			const isRightSide = modalMidPosition.x > anchorMidPosition.x
			const isTopSide = modalMidPosition.y < anchorMidPosition.y
			const isBottomSide = modalMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && rectRight(modalPosition) > rectLeft(anchorRect!)) {
					setMaxWidth(rectLeft(anchorRect!) - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && rectLeft(modalPosition) < rectRight(anchorRect!)) {
					setMaxWidth((elementClientWidth(documentBody()) - rectRight(anchorRect!)) - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && rectBottom(modalPosition) > rectTop(anchorRect!)) {
					setMaxHeight(rectTop(anchorRect!) - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && rectTop(modalPosition) < rectBottom(anchorRect!)) {
					setMaxHeight((windowInnerHeight() - rectBottom(anchorRect!)) - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: elementRect(modalRef),
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
		initModalListener()
		initEvents()
	})

	onCleanup(() => {
		removeEvents()
		closeModal({})
	})

	return (<Portal mount={props['c:portalMount']}><dialog
		class={attrClassList(MODAL_CLASS, props.class ?? '')}
		ref={mergeRefs(props.ref, r => modalRef = r)}
		style={{
			...style(),
			top: style()?.top ?? top() + 'px',
			left: style()?.left ?? left() + 'px',
			"max-width": !allowHideAnchor()
				? maxWidth() != undefined
					? maxWidth() + 'px'
					: style()?.['max-width'] ?? undefined
				: style()?.['max-width'] ?? undefined,
			"max-height": !allowHideAnchor()
				? maxHeight() != undefined
					? maxHeight() + 'px'
					: style()?.['max-height'] ?? undefined
				: style()?.['max-height'] ?? undefined,
		}}
		onKeyDown={(ev) => {
			eventCall(ev, props.onKeyDown)
			if (ev.key == 'Escape'
				&& !ev.altKey
				&& !ev.ctrlKey
				&& !ev.metaKey
				&& !ev.shiftKey
				&& important
			){
				focusModal(modalRef)
				eventPreventDefault(ev)
			}
		}}
		onCancel={(ev) => {
			eventCall(ev, props.onCancel)
			if (important) {
				eventPreventDefault(ev)
				return
			}
			closeModal({soft: true})
			eventPreventDefault(ev)
		}}
		onClose={(ev) => {
			eventCall(ev, props.onClose)
			props['c:onToggleOpen']?.(false)
			isOpen = false
		}}
		data-c-draggable={attrSetIfExist(isDraggable())}
		data-c-drag={attrSetIfExist(isDragging())}
		data-c-focus={attrSetIfExist(attrFocus())}
		data-c-open={attrSetIfExist(attrOpen())}
		data-c-open-done={attrSetIfExist(attrOpenDone())}
		{...other}>
		<Show when={isDraggable()}>
			<span
				tabindex="0"
				class="c-modal-drag-handle"
				draggable={false}
				data-g-keep-pointer-event={attrSetIfExist(isDragging())}
				onKeyDown={onMoveWithArrowKey}
				onPointerDown={(ev) => {
					const rect = elementRect(modalRef)
					setIsDragging(true)
					elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
					attrSet(documentBody(), BodyAttributes.noPointerEvent)
					diffPositionX = ev.clientX - rect.x
					diffPositionY = ev.clientY - rect.y
				}}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				onPointerMove={onPointerMove}
				onDblClick={() => repositionModal()}
			/>
		</Show>
		<div {...props['c:attrContentWrappwer'] ?? {}}>
			{props.children}
		</div>
		<span class="c-modal-portal-placeholder"></span>
	</dialog></Portal>)
}

export {
	Modal,
	closeModal,
	focusModal,
	repositionModal,
	openModal,
	isModalOpen,
	ModalEvents,
	ModalPosition,
	MODAL_CLASS
}
export type {
	ModalProps,
	ModalOpenDetail,
	ModalCloseDetail
}
export default Modal