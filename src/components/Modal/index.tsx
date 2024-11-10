import { createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { _dispatchEvent, _onOpen, _openModal, _modalListener, _detail, _element, _some, _isSameNode, _push, _closeModal, _findIndex, _splice, _length, _click, _at, _clientX, _clientY, _x, _left, _right, _y, _top, _bottom, _scroll, _scrollY, _documentElement, _scrollTop, _scrollTo, _instant, _resize, _noPointerEvent, _observe, _onReposition, _onShortFocus, _onClose, _ref, _onToggleOpen, _onCancel, _children, _onKeyDown, _class, _openAnimation, _closeAnimation, _centerBottom, _body, _clientWidth, _innerHeight, _px, _width, _height, _touches, _touchmove, _touchend, _mousemove, _mouseup, _centerBottomToLeft, _centerBottomToRight, _centerTop, _centerTopToLeft, _centerTopToRight, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _open, _close, _animate, _springBounce, _finished, _then, _focus, _showModal, _style, _maxWidth, _maxHeight, _max_width, _max_height, _none, _disconnect, _key, _Escape, _altKey, _ctrlKey, _metaKey, _shiftKey, _position, _gap, _padding, _important, _allowHideAnchor, _dragable, _contentAutoFocus, _pointerType, _forEach, _pointermove, _pointerup } from '@/constants/string'
import { endTimeout, startTimeout } from '@/utils/timeout'
import { isElementHasAttribute, removeElementAttribute, setElementAttribute, setElementAttributeIfExist } from '@/utils/attributes'
import { getDocument, getDocumentBody, getWindow } from '@/constants/window'
import { getBoundingClientRect, getAllElementBySelector } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { addEventListener, callEventHandler, eventPreventDefault, removeEventListener, eventStopImmediatePropagation } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { BodyEvents } from '@/enums/events'

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
	dragable?: boolean
	contentAutoFocus?: boolean

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
	soft?: boolean
}

enum ModalEvents {
	onShortFocus = 'on-short-focus-modal',

	/** @param {ModalCloseDetail} detail `ModalCloseDetail` */
	onClose = 'on-close-modal',

	onReposition = 'on-reposition-modal',

	/** @param {ModalOpenDetail} detail `ModalOpenDetail` */
	onOpen = 'on-open-modal'
}

function openModal(
	event: Event,
	modal: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'>
): void {
	modal[_dispatchEvent](new CustomEvent(
		ModalEvents[_onOpen],
		{detail: {event: event, ...options} satisfies ModalOpenDetail}
	))
	getDocumentBody()[_dispatchEvent](new CustomEvent(
		BodyEvents[_openModal],
		{detail: {element: modal}}
	))
}

function initModalListener(): void {
	// make sure to call this listener once
	if (isElementHasAttribute(getDocumentBody(), BodyAttributes[_modalListener])) return;
	setElementAttribute(getDocumentBody(), BodyAttributes[_modalListener])

	const selector: string = 'dialog.c-modal[open]'
	const modals: HTMLDialogElement[] = []
	let isNoPointerEvent: boolean = false
	let scrollTop: number = 0
	let timeoutId: number | null = null
	let closeTimeoutId: number | null = null

	// make sure not to close other modal after closing some modal
	let removed = false

	addEventListener(getDocumentBody(), BodyEvents[_openModal], ev => {
		const element: HTMLDialogElement = (ev as any)[_detail][_element] as HTMLDialogElement
		const isExist = modals[_some](modal => modal[_isSameNode](element as Node))
		if (isExist) return;

		modals[_push](element)
	})

	addEventListener(getDocumentBody(), BodyEvents[_closeModal], ev => {
		const element: HTMLDialogElement = (ev as any)[_detail][_element] as HTMLDialogElement
		const index = modals[_findIndex](modal => modal[_isSameNode](element))
		if (index < 0) return;

		modals[_splice](index, 1)
		removed = modals[_length] > 0

		if (!removed) return

		if (closeTimeoutId != null) endTimeout(closeTimeoutId)
		closeTimeoutId = startTimeout(() => {
			removed = false
			closeTimeoutId = null
		}, 50)
	})

	// use for click outside modal
	addEventListener(getDocument(), _click, async (ev: Event) => {
		// Since 'click' still dispatch even when `<body>` has
		// `[data-g-no-pointer-event]`, we have to disable it. This is useful
		// if you have modal but `<body>` has `[data-g-no-pointer-event]`.
		// Or when you drag something, modal will not automatically closed.
		if (isNoPointerEvent || modals[_length] == 0 || removed || !(ev as any)[_pointerType]) {
			removed = false
			return
		}
		const modal: HTMLDialogElement = modals[_at](-1)!
		const pointer = {
			x: (ev as MouseEvent)[_clientX],
			y: (ev as MouseEvent)[_clientY]
		}

		const modalRect = getBoundingClientRect(modal)
		const isClickedInside = pointer[_x] >= modalRect[_left]
			&& pointer[_x] <= modalRect[_right]
			&& pointer[_y] >= modalRect[_top]
			&& pointer[_y] <= modalRect[_bottom]

		if (isClickedInside) return

		closeModal(modal as HTMLDialogElement, true)
	})

	addEventListener(getDocument(), _scroll, () => {
		if (modals[_length] == 0) {
			scrollTop = getWindow()[_scrollY] || getDocument()[_documentElement][_scrollTop]
			return
		}
		getWindow()[_scrollTo]({ top: scrollTop, behavior: _instant })
	})

	addEventListener(getWindow(), _resize, () => {
		if (modals[_length] == 0) return;
		if (timeoutId != null) endTimeout(timeoutId)

		timeoutId = startTimeout(() => {
			getAllElementBySelector(selector)[_forEach](
				modal => repositionModal(modal as HTMLDialogElement)
			)
			timeoutId = null
		}, 250)
	})

	new MutationObserver(() => {
		isNoPointerEvent = isElementHasAttribute(
			getDocumentBody(),
			BodyAttributes[_noPointerEvent]
		)
	})[_observe](getDocumentBody(), { attributes: true })
}

function repositionModal(modal: HTMLDialogElement): void {
	modal[_dispatchEvent](new CustomEvent(ModalEvents[_onReposition]))
}

function focusModal(modal: HTMLDialogElement): void {
	modal[_dispatchEvent](new CustomEvent(ModalEvents[_onShortFocus]))
}

function closeModal(modal: HTMLDialogElement, soft: boolean = false): void {
	modal[_dispatchEvent](new CustomEvent(
		ModalEvents[_onClose],
		{detail: {soft} satisfies ModalCloseDetail}
	))
}

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'style'> & {
	style?: JSX.CSSProperties
	gap?: number
	padding?: number
	important?: boolean
	position?: ModalPosition
	allowHideAnchor?: boolean
	dragable?: boolean
	contentAutoFocus?: boolean
	onToggleOpen?(isOpen: boolean): unknown
	openAnimation?(el: HTMLDialogElement, done: () => void): unknown
	closeAnimation?(el: HTMLDialogElement, done: () => void): unknown
}
const Modal: ParentComponent<ModalProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		_ref, _onToggleOpen, _onClose, _onCancel,
		_children, _onKeyDown, _class, _openAnimation,
		_closeAnimation, _style, _gap, _padding,
		_important, _position, _allowHideAnchor,
		_dragable, _contentAutoFocus
	])
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [isDragable, setIsDragable] = createSignal<boolean>(false)
	const [left, setLeft] = createSignal<number>(0)
	const [top, setTop] = createSignal<number>(0)
	const [maxWidth, setMaxWidth] = createSignal<number | undefined>(undefined)
	const [maxHeight, setMaxHeight] = createSignal<number | undefined>(undefined)
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [attr_open, setAttr_open] = createSignal<boolean>(false)
	const [attr_openDone, setAttr_openDone] = createSignal<boolean>(false)
	const [attr_focus, setAttr_focus] = createSignal<boolean>(false)
	let $pointer: {x: number; y: number} = { x: 0, y: 0 }
	let isOpen: boolean = false
	let modal_ref: HTMLDialogElement
	let focusTimeoutId: number | null = null
	let anchor_ref: HTMLElement | null = null
	let $important: boolean = false
	let $gap: number = 0
	let $padding: number = 0
	let $position: ModalPosition = ModalPosition[_centerBottom]
	let timeout_reposition_id: number | null = null

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function fixPosition(): void {
		const popoverRect = getBoundingClientRect(modal_ref)
		const screen = {
			width: getDocument()[_body][_clientWidth],
			height: getWindow()[_innerHeight]
		}
		if (popoverRect[_left  ] < 8) setLeft(8)
		if (popoverRect[_top   ] < 8) setTop(8)
		if (popoverRect[_right ] > screen[_width ]) setLeft(screen[_width ] - popoverRect[_width ] - 8)
		if (popoverRect[_bottom] > screen[_height]) setTop(screen[_height] - popoverRect[_height] - 8)
	}

	function changePosition(x: number, y: number) {
		setLeft(x - diffPositionX)
		setTop(y - diffPositionY)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isDragging()) return;

		changePosition(ev[_clientX], ev[_clientY])
	}

	function onPointerUp(): void {
		removeElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
		setIsDragging(false)
		fixPosition()
	}

	function customOnShortFocus(): void {
		shortFocusModal()
	}

	function customOnClose(ev: CustomEvent<ModalCloseDetail>): void {
		closeModal(ev[_detail])
	}

	function customOnOpen(ev: CustomEvent<ModalOpenDetail>): void {
		openModal(ev[_detail])
	}

	function customOnReposition(): void {
		repositionModal()
	}

	function addDragListener() {
		addEventListener<PointerEvent>(getDocument(), _pointermove, onPointerMove)
		addEventListener<PointerEvent>(getDocument(), _pointerup, onPointerUp)
	}

	function removeDragListener(): void {
		removeEventListener<PointerEvent>(getDocument(), _pointermove, onPointerMove)
		removeEventListener<PointerEvent>(getDocument(), _pointerup, onPointerUp)
	}

	function initCustomEvent(): void {
		addEventListener<CustomEvent>(modal_ref, ModalEvents[_onShortFocus], customOnShortFocus)
		addEventListener<CustomEvent>(modal_ref, ModalEvents[_onClose], customOnClose)
		addEventListener<CustomEvent>(modal_ref, ModalEvents[_onOpen], customOnOpen)
		addEventListener<CustomEvent>(modal_ref, ModalEvents[_onReposition], customOnReposition)
	}

	function removeCustomEvent(): void {
		removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onShortFocus], customOnShortFocus)
		removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onClose], customOnClose)
		removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onOpen], customOnOpen)
		removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onReposition], customOnReposition)
	}

	async function closeModal(detail: {soft?: boolean}): Promise<void> {
		const { soft = false } = detail;

		if (soft && $important && isOpen) {
			focusModal(modal_ref)
			return
		}
		if (!isOpen) return;
		isOpen = false


		const anchorRect: DOMRect | undefined = anchor_ref
			? getBoundingClientRect(anchor_ref)
			: undefined
		const modalRect = getBoundingClientRect(modal_ref)
		const pos = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap: $gap,
			pointer: anchorRect? undefined : $pointer,
			padding: $padding,
			position: $position
		})

		const modalPos = {
			...pos,
			bottom: pos[_top] + modalRect[_height],
			right: pos[_left] + modalRect[_width]
		}
		const modalMidPos = {
			x: modalPos[_left] + (modalRect[_width] / 2),
			y: modalPos[_top] + (modalRect[_height] / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = $pointer.x
		let anchorCenterTop = $pointer.y

		if (anchorRect) {
			anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
			anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
		}

		const rangeX = mathAbs(modalMidPos.x - anchorCenterLeft)
		const rangeY = mathAbs(modalMidPos.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((modalMidPos.x < anchorCenterTop || modalMidPos.x > anchorCenterTop) && (
				$position == ModalPosition[_centerBottom]
				|| $position == ModalPosition[_centerBottomToLeft]
				|| $position == ModalPosition[_centerBottomToRight]
				|| $position == ModalPosition[_centerTop]
				|| $position == ModalPosition[_centerTopToLeft]
				|| $position == ModalPosition[_centerTopToRight]
			)) {
				if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
			} else {
				if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
			}
		} else {
			if ((modalMidPos.y < anchorCenterLeft || modalMidPos.y > anchorCenterLeft) && (
				$position == ModalPosition[_leftCenter]
				|| $position == ModalPosition[_leftCenterToBottom]
				|| $position == ModalPosition[_leftCenterToTop]
				|| $position == ModalPosition[_rightCenter]
				|| $position == ModalPosition[_rightCenterToBottom]
				|| $position == ModalPosition[_rightCenterToTop]
			)) {
				if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
			} else {
				if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
			}
		}

		setAttr_open(false)
		setAttr_openDone(false)
		anchor_ref = null
		getDocumentBody()[_dispatchEvent](new CustomEvent(
			BodyEvents[_closeModal],
			{detail: {element: modal_ref}}
		))
		if (props[_closeAnimation] != null) props[_closeAnimation](
			modal_ref,
			() => modal_ref[_close]()
		)
		else modal_ref[_animate](
			{ transform: `translate(${translate[_left]}px, ${translate[_top]}px)` },
			{ duration: 300, easing: AnimationEffectTiming[_springBounce] }
		)[_finished][_then](() => modal_ref[_close]())
	}

	function shortFocusModal(): void {
		if (focusTimeoutId != null) endTimeout(focusTimeoutId)
		setAttr_focus(true)

		focusTimeoutId = startTimeout(() => {
			setAttr_focus(false)
			focusTimeoutId = null
		}, 1000)
	}

	function openModal(detail: ModalOpenDetail): void {
		if (isOpen) return;
		if (props[_onToggleOpen]) props[_onToggleOpen](true)

		const MODAL_MARGIN = 8
		const {
			event,
			pointer,
			anchorRect,
			allowHideAnchor = props[_allowHideAnchor] ?? true,
			anchor = null,
			dragable = props[_dragable] ?? false,
			gap = props[_gap] ?? 0,
			important = props[_important] ?? false,
			padding = props[_padding] ?? 0,
			position = props[_position] ?? ModalPosition[_centerBottom],
			contentAutoFocus = props[_contentAutoFocus] ?? false
		} = detail;

		setAllowHideAnchor(allowHideAnchor)
		isOpen = true
		anchor_ref = anchor
		$position = position
		$gap = gap
		$padding = padding
		$important = important

		// handle drag
		if (isDragable() && !dragable) removeDragListener()
		else if (!isDragable() && dragable) addDragListener()
		setIsDragable(dragable)

		modal_ref[_showModal]()

		// input auto focus
		if (!contentAutoFocus) modal_ref[_focus]()

		const modalRect: DOMRect = getBoundingClientRect(modal_ref)
		const $anchorRect: DOMRect | undefined = anchorRect != null
			? anchorRect
			: anchor
				? getBoundingClientRect(anchor)
				: undefined
		const $event = (event as TouchEvent)[_touches]
			? (event as TouchEvent)[_touches][0]
			: (event as MouseEvent)
		$pointer = pointer != null
			? pointer
			: {
				x: $event[_clientX] ?? 0,
				y: $event[_clientY] ?? 0
			}
		let pos = getFlyoutPosition({
			flyout: modalRect,
			anchor: $anchorRect,
			gap,
			pointer: $anchorRect? undefined : $pointer,
			padding,
			position
		})

		if (!allowHideAnchor && anchor != null) {
			const modalPos = {
				...pos,
				bottom: pos[_top] + modalRect[_height],
				right: pos[_left] + modalRect[_width]
			}
			const anchorMidPosition = {
				x: $anchorRect![_left] + ($anchorRect![_width] / 2),
				y: $anchorRect![_top] + ($anchorRect![_height] / 2),
			}
			const modalMidPos = {
				x: modalPos[_left] + (modalRect[_width] / 2),
				y: modalPos[_top] + (modalRect[_height] / 2),
			}
			const rangeX = mathAbs(modalMidPos.x - anchorMidPosition.x)
			const rangeY = mathAbs(modalMidPos.y - anchorMidPosition.y)
			const isLeftSide = modalMidPos.x < anchorMidPosition.x
			const isRightSide = modalMidPos.x > anchorMidPosition.x
			const isTopSide = modalMidPos.y < anchorMidPosition.y
			const isBottomSide = modalMidPos.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && modalPos[_right] > $anchorRect![_left]) {
					setMaxWidth($anchorRect![_left] - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && modalPos[_left] < $anchorRect![_right]) {
					setMaxWidth((getDocument()[_body][_clientWidth] - $anchorRect![_right]) - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && modalPos[_bottom] > $anchorRect![_top]) {
					setMaxHeight($anchorRect![_top] - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && modalPos[_top] < $anchorRect![_bottom]) {
					setMaxHeight((getWindow()[_innerHeight] - $anchorRect![_bottom]) - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: getBoundingClientRect(modal_ref),
				anchor: $anchorRect,
				gap,
				pointer: $anchorRect? undefined : $pointer,
				padding,
				position
			})
		}

		const modalPos = {
			...pos,
			bottom: pos[_top] + modalRect[_height],
			right: pos[_left] + modalRect[_width]
		}
		const modalMidPos = {
			x: modalPos[_left] + (modalRect[_width] / 2),
			y: modalPos[_top] + (modalRect[_height] / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = $pointer.x
		let anchorCenterTop = $pointer.y

		if ($anchorRect) {
			anchorCenterLeft = $anchorRect[_left] + ($anchorRect[_width] / 2)
			anchorCenterTop = $anchorRect[_top] + ($anchorRect[_height] / 2)
		}

		const rangeX = mathAbs(modalMidPos.x - anchorCenterLeft)
		const rangeY = mathAbs(modalMidPos.y - anchorCenterTop)

		if (rangeX > rangeY) {
			if ((modalMidPos.x < anchorCenterTop || modalMidPos.x > anchorCenterTop) && (
				position == ModalPosition[_centerBottom]
				|| position == ModalPosition[_centerBottomToLeft]
				|| position == ModalPosition[_centerBottomToRight]
				|| position == ModalPosition[_centerTop]
				|| position == ModalPosition[_centerTopToLeft]
				|| position == ModalPosition[_centerTopToRight]
			)) {
				if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
			} else {
				if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
			}
		} else {
			if ((modalMidPos.y < anchorCenterLeft || modalMidPos.y > anchorCenterLeft) && (
				position == ModalPosition[_leftCenter]
				|| position == ModalPosition[_leftCenterToBottom]
				|| position == ModalPosition[_leftCenterToTop]
				|| position == ModalPosition[_rightCenter]
				|| position == ModalPosition[_rightCenterToBottom]
				|| position == ModalPosition[_rightCenterToTop]
			)) {
				if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
				if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
			} else {
				if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
				if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
			}
		}

		setTop(pos[_top])
		setLeft(pos[_left])
		setAttr_open(true)
		if (props[_openAnimation] != null) props[_openAnimation](
			modal_ref,
			() => setAttr_openDone(true)
		)
		else modal_ref[_animate](
			{ transform: [`translate(${translate[_left]}px, ${translate[_top]}px)`, _none] },
			{ duration: 300, easing: AnimationEffectTiming[_springBounce] }
		)[_finished][_then](() => setAttr_openDone(true))

		// stop reaching to `document.onclick`
		eventStopImmediatePropagation(event)
	}

	function repositionModal(): void {
		if (anchor_ref == null) {
			const modalRect = getBoundingClientRect(modal_ref)
			const screen = {
				width: getDocument()[_body][_clientWidth],
				height: getWindow()[_innerHeight]
			}
			if (modalRect[_left  ] < 8) setLeft(8)
			if (modalRect[_top   ] < 8) setTop(8)
			if (modalRect[_right ] > screen[_width ]) setLeft(screen[_width ] - modalRect[_width ] - 8)
			if (modalRect[_bottom] > screen[_height]) setTop(screen[_height] - modalRect[_height] - 8)
			return
		}

		const MODAL_MARGIN = 8
		const anchorRect = getBoundingClientRect(anchor_ref)
		const modalRect = getBoundingClientRect(modal_ref)

		let pos = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap: $gap,
			position: $position,
			padding: $padding
		})

		if (!allowHideAnchor()) {
			const modalPos = {
				...pos,
				bottom: pos[_top] + modalRect[_height],
				right: pos[_left] + modalRect[_width]
			}
			const anchorMidPosition = {
				x: anchorRect![_left] + (anchorRect![_width] / 2),
				y: anchorRect![_top] + (anchorRect![_height] / 2),
			}
			const modalMidPos = {
				x: modalPos[_left] + (modalRect[_width] / 2),
				y: modalPos[_top] + (modalRect[_height] / 2),
			}
			const rangeX = mathAbs(modalMidPos.x - anchorMidPosition.x)
			const rangeY = mathAbs(modalMidPos.y - anchorMidPosition.y)
			const isLeftSide = modalMidPos.x < anchorMidPosition.x
			const isRightSide = modalMidPos.x > anchorMidPosition.x
			const isTopSide = modalMidPos.y < anchorMidPosition.y
			const isBottomSide = modalMidPos.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && modalPos[_right] > anchorRect![_left]) {
					setMaxWidth(anchorRect![_left] - MODAL_MARGIN - $gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && modalPos[_left] < anchorRect![_right]) {
					setMaxWidth((getDocument()[_body][_clientWidth] - anchorRect![_right]) - MODAL_MARGIN - $gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && modalPos[_bottom] > anchorRect![_top]) {
					setMaxHeight(anchorRect![_top] - MODAL_MARGIN - $gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && modalPos[_top] < anchorRect![_bottom]) {
					setMaxHeight((getWindow()[_innerHeight] - anchorRect![_bottom]) - MODAL_MARGIN - $gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: getBoundingClientRect(modal_ref),
				anchor: anchorRect,
				gap: $gap,
				position: $position,
				padding: $padding
			})
		}

		setTop(pos[_top])
		setLeft(pos[_left])
	}

	function initMutationObserver(): void {
		const childrenObserver = new MutationObserver(() => {
			if (timeout_reposition_id != null) endTimeout(timeout_reposition_id)
			timeout_reposition_id = startTimeout(() => {
				repositionModal()
				timeout_reposition_id = null
			}, 1000)
		})
		childrenObserver[_observe](modal_ref, {subtree: true, childList: true})

		onCleanup(() => {
			childrenObserver[_disconnect]()
		})
	}

	onMount(() => {
		initModalListener()
		initCustomEvent()
		initMutationObserver()
	})

	onCleanup(async () => {
		removeCustomEvent()
		await closeModal({})
	})

	return (<Portal><dialog
		class={`c-modal${props[_class]? ` ${props[_class]}` : ''}`}
		ref={mergeRefs(props[_ref], r => modal_ref = r)}
		style={{
			...props[_style],
			top: props[_style]?.[_top] ?? top() + _px,
			left: props[_style]?.[_left] ?? left() + _px,
			"max-width": !allowHideAnchor()
				? maxWidth() != undefined
					? maxWidth() + _px
					: props[_style]?.[_max_width] ?? undefined
				: props[_style]?.[_max_width] ?? undefined,
			"max-height": !allowHideAnchor()
				? maxHeight() != undefined
					? maxHeight() + _px
					: props[_style]?.[_max_height] ?? undefined
				: props[_style]?.[_max_height] ?? undefined,
		}}
		onKeyDown={(ev) => {
			callEventHandler(ev, props[_onKeyDown])
			if (ev[_key] == _Escape
				&& !ev[_altKey]
				&& !ev[_ctrlKey]
				&& !ev[_metaKey]
				&& !ev[_shiftKey]
				&& $important
			){
				focusModal(modal_ref)
				eventPreventDefault(ev)
			}
		}}
		onCancel={(ev) => {
			callEventHandler(ev, props[_onCancel])
			if ($important) {
				eventPreventDefault(ev)
				return
			}
			closeModal({soft: true})
		}}
		onClose={(ev) => {
			callEventHandler(ev, props[_onClose])
			if (props[_onToggleOpen]) props[_onToggleOpen](false)
			isOpen = false
		}}
		data-c-dragable={setElementAttributeIfExist(isDragable())}
		data-c-drag={setElementAttributeIfExist(isDragging())}
		data-c-focus={setElementAttributeIfExist(attr_focus())}
		data-c-open={setElementAttributeIfExist(attr_open())}
		data-c-open-done={setElementAttributeIfExist(attr_openDone())}
		{...other}>
		<Show when={isDragable()}>
			<span
				class="c-modal-drag-handle"
				draggable={false}
				data-g-keep-pointer-event={setElementAttributeIfExist(isDragging())}
				onPointerDown={(ev) => {
					const rect = getBoundingClientRect(modal_ref)
					setIsDragging(true)
					setElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
					diffPositionX = ev[_clientX] - rect.x
					diffPositionY = ev[_clientY] - rect.y
				}}
				onDblClick={() => repositionModal()}
			/>
		</Show>
		<div>
			{props[_children]}
		</div>
	</dialog></Portal>)
}

export {
	Modal,
	closeModal,
	focusModal,
	repositionModal,
	openModal,
	ModalEvents,
	ModalPosition
}
export type {
	ModalProps,
	ModalOpenDetail,
	ModalCloseDetail
}
export default Modal