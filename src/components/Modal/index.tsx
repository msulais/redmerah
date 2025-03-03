import { createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'
import { Portal } from 'solid-js/web'

import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { attrSetIfExist, attrClassList } from '@/utils/attributes'
import { BodyAttributes } from '@/enums/attributes'
import { eventCall } from "@/utils/event"
import { ElementIds } from '@/enums/ids'
import { animationIsOn } from '@/utils/animation'
import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from '@/constants/key-code'

import './index.scss'

type ModalOpenDetail = {
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
let POINTER_X: number = 0
let POINTER_Y: number = 0
const MODAL_CLASS = 'c-modal'
const MODAL_MARGIN = 8

function isModalOpen(modal: HTMLDialogElement): boolean {
	return modal.dataset.cOpen != undefined
}

function openModal(
	modal: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'>
): void {
	modal.dispatchEvent(new CustomEvent(
		ModalEvents.open,
		{detail: {...options} satisfies ModalOpenDetail}
	))
}

function initModalListener(): void {
	if (HAS_MODAL_LISTENER) return;
	HAS_MODAL_LISTENER = true

	const body = document.body
	const selector: string = 'dialog.c-modal[open]'
	const modals: HTMLDialogElement[] = []
	let isNoPointerEvent: boolean = false
	let scrollTopValue: number = 0
	let timeId: number | NodeJS.Timeout | null = null
	let timeCloseId: number | NodeJS.Timeout | null = null

	// make sure not to close other modal after closing some modal
	let removed = false

	function createListenerElement(): void {
		const div = document.createElement('div')
		div.style.setProperty('display', 'contents')
		div.id = ElementIds.modalListener
		body.appendChild(div)

		LISTENER_REF = div
	}

	function repositionAllModal(): void {
		if (modals.length == 0) return;
		if (timeId != null) clearTimeout(timeId)

		timeId = setTimeout(() => {
			for (const modal of document.querySelectorAll(selector)) {
				repositionModal(modal as HTMLDialogElement)
			}
			timeId = null
		}, 250)
	}

	// when `globalClick()` below will fire, this must call after it
	function open(ev: CustomEvent<HTMLDialogElement>): void {
		const element: HTMLDialogElement = ev.detail
		const isExist = modals.some(modal => modal === element)
		STOP_GLOBAL_CLICK = false
		if (isExist) return;

		modals.push(element)
	}

	function close(ev: CustomEvent<HTMLDialogElement>): void {
		const element = ev.detail
		const index = modals.findIndex(modal => modal === element)
		if (index < 0) return;

		modals.splice(index, 1)
		removed = modals.length > 0
		if (!removed) return
		if (timeCloseId != null) clearTimeout(timeCloseId)

		timeCloseId = setTimeout(() => {
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
			|| modals.length == 0
			|| removed
			|| !(ev as any).pointerType) {
			removed = false
			return
		}
		const modal: HTMLDialogElement = modals.at(-1)!
		const isClickedInside = modal !== ev.target
		if (isClickedInside) return

		closeModal(modal as HTMLDialogElement, {soft: true})
	}

	function globalScroll(): void {
		if (modals.length == 0) {

			scrollTopValue = window.scrollY || document.documentElement.scrollTop
			return
		}

		window.scrollTo({
			top: scrollTopValue,
			behavior: 'instant'
		})
	}

	function initEvents(): void {
		LISTENER_REF.addEventListener(ModalListenerEvents.open as any, open)
		LISTENER_REF.addEventListener(ModalListenerEvents.close as any, close)
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})

		document.addEventListener('click', globalClick)
		document.addEventListener('scroll', globalScroll)
		window.addEventListener('resize', repositionAllModal)
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

function repositionModal(modal: HTMLDialogElement): void {
	modal.dispatchEvent(new CustomEvent(ModalEvents.reposition))
}

function focusModal(modal: HTMLDialogElement): void {
	modal.dispatchEvent(new CustomEvent(ModalEvents.shortfocus))
}

function closeModal(modal: HTMLDialogElement, options?: ModalCloseDetail): void {
	modal.dispatchEvent(new CustomEvent(
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
	const body = document.body
	let pointerX: number = 0
	let pointerY: number = 0
	let isOpen: boolean = false
	let modalRef: HTMLDialogElement
	let timeFocusId: number | NodeJS.Timeout | null = null
	let anchorRef: HTMLElement | null = null
	let important: boolean = false
	let gap: number = 0
	let padding: number = 0
	let position: ModalPosition = ModalPosition.centerBottom
	let timeScreenSizeId: number | NodeJS.Timeout | null = null
	let timeFixPositionId: number | NodeJS.Timeout | null = null
	let screenWidth = body.clientWidth
	let screenHeight = window.innerHeight

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function fixPosition(): void {
		const modalRect = modalRef.getBoundingClientRect()
		const screenWidth = body.clientWidth
		const screenHeight = window.innerHeight

		if (modalRect.left < MODAL_MARGIN) setLeft(MODAL_MARGIN)
		if (modalRect.top < MODAL_MARGIN) setTop(MODAL_MARGIN)
		if (modalRect.right > screenWidth) setLeft(screenWidth - modalRect.width - MODAL_MARGIN)
		if (modalRect.bottom > screenHeight) setTop(screenHeight - modalRect.height - MODAL_MARGIN)
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

		body.removeAttribute(BodyAttributes.noPointerEvent)
		ev.currentTarget.releasePointerCapture(ev.pointerId)
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
		modalRef.addEventListener(ModalEvents.shortfocus as any, customOnShortFocus)
		modalRef.addEventListener(ModalEvents.close as any, customOnClose)
		modalRef.addEventListener(ModalEvents.open as any, customOnOpen)
		modalRef.addEventListener(ModalEvents.reposition as any, customOnReposition)
	}

	function removeEvents(): void {
		modalRef.removeEventListener(ModalEvents.shortfocus as any, customOnShortFocus)
		modalRef.removeEventListener(ModalEvents.close as any, customOnClose)
		modalRef.removeEventListener(ModalEvents.open as any, customOnOpen)
		modalRef.removeEventListener(ModalEvents.reposition as any, customOnReposition)
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
			? anchorRef.getBoundingClientRect()
			: undefined
		const modalRect = modalRef.getBoundingClientRect()
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
			bottom: pos.top + modalRect.height,
			right: pos.left + modalRect.width
		}
		const modalMidPosition = {
			x: modalPosition.left + (modalRect.width / 2),
			y: modalPosition.top + (modalRect.height / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = anchorRect.left + (anchorRect.width / 2)
			anchorCenterTop = anchorRect.top + (anchorRect.height / 2)
		}

		const rangeX = Math.abs(modalMidPosition.x - anchorCenterLeft)
		const rangeY = Math.abs(modalMidPosition.y - anchorCenterTop)

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
		LISTENER_REF.dispatchEvent(new CustomEvent(
			ModalListenerEvents.close,
			{detail: modalRef}
		))
		props['c:onClose']?.()
		onClose?.()
		if (!animationIsOn()) {
			modalRef.close()
			return
		}

		if (props['c:closeAnimation'] != null) props['c:closeAnimation'](
			modalRef,
			() => modalRef.close()
		)
		else modalRef.animate(
			{ transform: `translate(${translate.left}px, ${translate.top}px)` },
			{ duration: 300, easing: AnimationEffectTiming.springBounce }
		).finished.then(() => modalRef.close())
	}

	function shortFocusModal(): void {
		if (timeFocusId != null) clearTimeout(timeFocusId)
		setAttrFocus(true)

		timeFocusId = setTimeout(() => {
			setAttrFocus(false)
			timeFocusId = null
		}, 1000)
	}

	function openModal(detail: ModalOpenDetail): void {
		if (isOpen) return;
		props['c:onToggleOpen']?.(true)

		const {
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
		if (!contentAutoFocus) modalRef.focus()

		const modalRect: DOMRect = modalRef.getBoundingClientRect()
		const $anchorRect: DOMRect | undefined = anchorRect != null
			? anchorRect
			: anchor
				? anchor.getBoundingClientRect()
				: undefined
		pointerX = pointer? pointer.x : POINTER_X
		pointerY = pointer? pointer.y : POINTER_Y
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
				bottom: pos.top + modalRect.height,
				right: pos.left + modalRect.width
			}
			const anchorMidPosition = {
				x: $anchorRect!.left + ($anchorRect!.width / 2),
				y: $anchorRect!.top + ($anchorRect!.height / 2),
			}
			const modalMidPosition = {
				x: modalPosition.left + (modalRect.width / 2),
				y: modalPosition.top + (modalRect.height / 2),
			}
			const rangeX = Math.abs(modalMidPosition.x - anchorMidPosition.x)
			const rangeY = Math.abs(modalMidPosition.y - anchorMidPosition.y)
			const isLeftSide = modalMidPosition.x < anchorMidPosition.x
			const isRightSide = modalMidPosition.x > anchorMidPosition.x
			const isTopSide = modalMidPosition.y < anchorMidPosition.y
			const isBottomSide = modalMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && modalPosition.right > $anchorRect!.left) {
					setMaxWidth($anchorRect!.left - MODAL_MARGIN - inputGap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && modalPosition.left < $anchorRect!.right) {
					setMaxWidth((body.clientWidth - $anchorRect!.right) - MODAL_MARGIN - inputGap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && modalPosition.bottom > $anchorRect!.top) {
					setMaxHeight($anchorRect!.top - MODAL_MARGIN - inputGap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && modalPosition.top < $anchorRect!.bottom) {
					setMaxHeight((window.innerHeight - $anchorRect!.bottom) - MODAL_MARGIN - inputGap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: modalRef.getBoundingClientRect(),
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
			bottom: pos.top + modalRect.height,
			right: pos.left + modalRect.width
		}
		const modalMidPosition = {
			x: modalPosition.left + (modalRect.width / 2),
			y: modalPosition.top + (modalRect.height / 2),
		}
		const translate = {
			left: 0,
			top: 0
		}

		let anchorCenterLeft = pointerX
		let anchorCenterTop = pointerY

		if (anchorRect) {
			anchorCenterLeft = anchorRect.left + (anchorRect.width / 2)
			anchorCenterTop = anchorRect.top + (anchorRect.height / 2)
		}

		const rangeX = Math.abs(modalMidPosition.x - anchorCenterLeft)
		const rangeY = Math.abs(modalMidPosition.y - anchorCenterTop)

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
				modalRef,
				() => setAttrOpenDone(true)
			)
			else modalRef.animate(
				{ transform: [`translate(${translate.left}px, ${translate.top}px)`, 'none'] },
				{ duration: 300, easing: AnimationEffectTiming.springBounce }
			).finished.then(() => setAttrOpenDone(true))
		}

		STOP_GLOBAL_CLICK = true

		// run after document.onclick
		setTimeout(() => LISTENER_REF.dispatchEvent(new CustomEvent(
			ModalListenerEvents.open,
			{detail: modalRef}
		)))
	}

	function repositionModal(): void {
		if (anchorRef == null) {
			fixPosition()
			return
		}

		const anchorRect = anchorRef.getBoundingClientRect()
		const modalRect = modalRef.getBoundingClientRect()

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
				bottom: pos.top + modalRect.height,
				right: pos.left + modalRect.width
			}
			const anchorMidPosition = {
				x: anchorRect!.left + (anchorRect!.width / 2),
				y: anchorRect!.top + (anchorRect!.height / 2),
			}
			const modalMidPosition = {
				x: modalPosition.left + (modalRect.width / 2),
				y: modalPosition.top + (modalRect.height / 2),
			}
			const rangeX = Math.abs(modalMidPosition.x - anchorMidPosition.x)
			const rangeY = Math.abs(modalMidPosition.y - anchorMidPosition.y)
			const isLeftSide = modalMidPosition.x < anchorMidPosition.x
			const isRightSide = modalMidPosition.x > anchorMidPosition.x
			const isTopSide = modalMidPosition.y < anchorMidPosition.y
			const isBottomSide = modalMidPosition.y > anchorMidPosition.y

			if (rangeX > rangeY){
				// left side
				if (isLeftSide && modalPosition.right > anchorRect!.left) {
					setMaxWidth(anchorRect!.left - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}

				// right side
				else if (isRightSide && modalPosition.left < anchorRect!.right) {
					setMaxWidth((body.clientWidth - anchorRect!.right) - MODAL_MARGIN - gap)
					setMaxHeight(undefined)
				}
			}
			else {
				// top side
				if (isTopSide && modalPosition.bottom > anchorRect!.top) {
					setMaxHeight(anchorRect!.top - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}

				// bottom side
				else if (isBottomSide && modalPosition.top < anchorRect!.bottom) {
					setMaxHeight((window.innerHeight - anchorRect!.bottom) - MODAL_MARGIN - gap)
					setMaxWidth(undefined)
				}
			}

			pos = getFlyoutPosition({
				flyout: modalRef.getBoundingClientRect(),
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
				ev.preventDefault()
			}
		}}
		onCancel={(ev) => {
			eventCall(ev, props.onCancel)
			if (important) {
				ev.preventDefault()
				return
			}
			closeModal({soft: true})
			ev.preventDefault()
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
					const rect = modalRef.getBoundingClientRect()
					setIsDragging(true)
					ev.currentTarget.setPointerCapture(ev.pointerId)
					body.setAttribute(BodyAttributes.noPointerEvent, '')
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