import { AnimationEffectTiming } from "@/enums/animation"
import { FlyoutPosition as ModalPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
import { getFlyoutPosition } from "@/utils/flyout"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { BodyAttributes, GlobalAttributes } from "@/enums/attributes"
import { KeyboardValue } from "@/enums/keyboard"
import { pxToRem, remToPx } from "@/utils/css"

type ModalProps = astroHTML.JSX.DialogHTMLAttributes & {
	ModalAnchorBy      ?: string
	ModalDraggable     ?: boolean
	ModalImportant     ?: boolean
	ModalAutoFocus     ?: boolean
	ModalAnimation     ?: boolean
	ModalGap           ?: number
	ModalPadding       ?: number
	ModalPosition      ?: ModalPosition
	ModalDragHandleAttr?: astroHTML.JSX.HTMLAttributes
	ModalContentAttr   ?: astroHTML.JSX.HTMLAttributes
}

type ModalElement = HTMLDialogElement

type ModalUpdateOptions = {
	ModalChildren ?: (Node | string)[] | boolean
	ModalAnchorBy ?: string | boolean
	ModalDraggable?: boolean
	ModalImportant?: boolean
	ModalAutoFocus?: boolean
	ModalAnimation?: boolean
	ModalGap      ?: number | boolean
	ModalPadding  ?: number | boolean
	ModalPosition ?: ModalPosition | boolean
	ModalRefs     ?: {
		modal     ?(ref: ModalElement  ): unknown
		content   ?(ref: HTMLDivElement): unknown
		dragHandle?(ref: HTMLDivElement): unknown
	}
}

type ModalOpenOptions = {
	anchor   ?: HTMLElement
	gap      ?: number
	padding  ?: number
	important?: boolean
	position ?: ModalPosition
	draggable?: boolean
	autoFocus?: boolean
	animation?: boolean

	/**
	 * Custom pointer position. Only works if `ModalOpenOptions.anchor` set to `undefined`
	 * */
	pointer  ?: {
		x: number
		y: number
	}
}

type ModalCloseOptions = {
	/** if the modal is important, it will not closed */
	soft?: boolean
	animation?: boolean
}

type _ModalOpenEventDetail = ModalOpenOptions & {
	done: () => void
}

type _ModalCloseEventDetail = ModalCloseOptions & {
	done: () => void
}

type _ModalRepositionEventDetail = {
	done: () => void
}

type _ModalFocusEventDetail = {
	done: () => void
}

type _ModalAttributeChangeEventDetail = {
	attributeName: string
}

type ModalToggleOpenEventDetail = {
	isOpen: boolean
}

enum ModalEvents {
	/** `!bubbles | !cancelable | detail: _ModalAttributeChangeEventDetail` */
	attributeChange = 'modal:attribute-change',

	/** `!bubbles | !cancelable | detail: ModalToggleOpenEventDetail` */
	toggleOpen      = 'modal:toggle-open',

	/** `!bubbles | !cancelable | detail: _ModalOpenEventDetail` */
	open            = 'modal:open',

	/** `!bubbles | !cancelable | detail: _ModalCloseEventDetail` */
	close           = 'modal:close',

	/** `!bubbles | !cancelable | detail: _ModalFocusEventDetail` */
	focus           = 'modal:focus',

	/** `!bubbles | !cancelable | detail: _ModalRepositionEventDetail` */
	reposition      = 'modal:reposition',

	/** `!bubbles | !cancelable | !detail` */
	beforeOpen      = 'modal:before-open',

	/** `!bubbles | !cancelable | !detail` */
	beforeClose     = 'modal:before-close'
}

enum ModalAttributes {
	/** @param id `string` */
	anchorBy   = 'data-c-modal-anchorby',

	/** @param value `boolean` */
	animation  = 'data-c-modal-animation',

	/** Useful for other component */
	draggable  = 'data-c-modal-draggable',
	important  = 'data-c-modal-important',
	autoFocus  = 'data-c-modal-autofocus',
	focus      = 'data-c-modal-focus',
	dragging   = 'data-c-modal-dragging',

	/** @param value `number` */
	gap        = 'data-c-modal-gap',

	/** @param value `number` */
	padding    = 'data-c-modal-padding',

	/** @param value `ModalPosition` */
	position   = 'data-c-modal-position',
}

enum ModalClasses {
	modal      = 'c-modal',
	content    = 'c-modal-content',
	dragHandle = 'c-modal-draghandle',
}

enum ModalCSSVariables {
	left = '--c-modal-left',
	top = '--c-modal-top'
}

const LISTENED_ATTRIBUTES: string[] = [
	'open',
	ModalAttributes.anchorBy,
	ModalAttributes.animation,
	ModalAttributes.gap,
	ModalAttributes.important,
	ModalAttributes.padding,
	ModalAttributes.position,
]
const MODAL_MARGIN = 8

// !important: Don't use `Set()`. Order matter!
const OPENED_MODAL: ModalElement[] = []
const REGISTERED_MODAL: Set<ModalElement> = new Set<ModalElement>()
let POINTER_X: number = 0
let POINTER_Y: number = 0
let HAS_LISTENER: boolean = false

// MutationObserver only exist in client side
let MUTATION_OBSERVER: MutationObserver | null = null

function _initMutationObserver(): void {
	if (MUTATION_OBSERVER) return

	MUTATION_OBSERVER = new MutationObserver((entries) => {
		for (const entry of entries) {
			const attr = entry.attributeName
			if (!attr) continue

			entry.target.dispatchEvent(new CustomEvent<_ModalAttributeChangeEventDetail>(ModalEvents.attributeChange, {detail: {attributeName: attr}}))
		}
	})
}

function _initModalRefListener(): void {
	if (HAS_LISTENER) return

	let timeoutId: number | NodeJS.Timeout | null = null
	let pointerInRange: boolean = false
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (OPENED_MODAL.length == 0) return
		if (timeoutId !== null) clearTimeout(timeoutId)

		timeoutId = setTimeout(async () => {
			for (const modal of OPENED_MODAL) {
				await repositionModalRef(modal)
			}
			timeoutId = null
		}, 250)
	}

	function handleOutsideClick(): void {
		if (OPENED_MODAL.length === 0 || pointerInRange) return

		closeModalRef(OPENED_MODAL[OPENED_MODAL.length-1], {soft: true})
	}

	function initEvents(): void {
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
		document.addEventListener('pointerdown', (ev) => {
			if (OPENED_MODAL.length === 0) return

			pointerInRange = ev.target !== OPENED_MODAL[OPENED_MODAL.length-1]
		})
		document.addEventListener('pointercancel', handleOutsideClick)
		document.addEventListener('pointerup', handleOutsideClick)
		window.addEventListener('resize', handleWindowResize)
	}

	initEvents()
}

function _initModalRef(modalRef: ModalElement): void {
	const bodyRef = document.body
	const attributes = {
		get anchor(): HTMLElement | null {
			const value = modalRef.getAttribute(ModalAttributes.anchorBy)
			if (!value) return null

			return document.getElementById(value)
		},
		get gap(): number {
			const value = modalRef.getAttribute(ModalAttributes.gap)
			if (!value) return 0

			return safeNumber(Number.parseFloat(value))
		},
		get padding(): number {
			const value = modalRef.getAttribute(ModalAttributes.padding)
			if (!value) return 0

			return safeNumber(Number.parseFloat(value))
		},
		get position(): ModalPosition {
			const value = modalRef.getAttribute(ModalAttributes.position)
			if (!value || !isValidEnumValue(value, ModalPosition)) return ModalPosition.centerBottom

			return value as ModalPosition
		},
		get draggable(): boolean {
			return modalRef.hasAttribute(ModalAttributes.draggable)
		},
		get autoFocus(): boolean {
			return modalRef.hasAttribute(ModalAttributes.autoFocus)
		},
		get important(): boolean {
			return modalRef.hasAttribute(ModalAttributes.important)
		},
		get animation(): boolean {
			return modalRef.getAttribute(ModalAttributes.animation) !== 'false'
		}
	}
	let isOpen: boolean = false
	let contentRef: HTMLDivElement | null = null
	let dragHandleRef: HTMLDivElement | null = null
	let animation: boolean = true
	let anchorRef: HTMLElement | null = null
	let position: ModalPosition = ModalPosition.centerBottom
	let gap: number = 0
	let padding: number = 0
	let pointerX: number = 0
	let pointerY: number = 0
	let important: boolean = false
	let isDragging: boolean = false
	let timeoutFocusId: number | NodeJS.Timeout | null = null
	let timeoutScreenSizeId: number | NodeJS.Timeout | null = null
	let timeoutFixPositionId: number | NodeJS.Timeout | null = null
	let screenWidth = bodyRef.clientWidth
	let screenHeight = window.innerHeight
	let keyTop = 0
	let keyLeft = 0

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function toggleDragging(drag: boolean): void {
		isDragging = drag
		modalRef.toggleAttribute(ModalAttributes.dragging, drag)
	}

	function fixPosition(options?: _ModalRepositionEventDetail): void {
		const modalRefRect = modalRef.getBoundingClientRect()
		const screenWidth = bodyRef.clientWidth
		const screenHeight = window.innerHeight
		const [x, y] = [modalRefRect.left, modalRefRect.top]
		let [left, top] = [x, y]
		if (modalRefRect.left < MODAL_MARGIN) left = MODAL_MARGIN
		if (modalRefRect.top < MODAL_MARGIN) top = MODAL_MARGIN
		if (modalRefRect.right > screenWidth) left = screenWidth - modalRefRect.width - MODAL_MARGIN
		if (modalRefRect.bottom > screenHeight) top = screenHeight - modalRefRect.height - MODAL_MARGIN

		modalRef.style.setProperty(ModalCSSVariables.left, pxToRem(left) + 'rem')
		modalRef.style.setProperty(ModalCSSVariables.top, pxToRem(top) + 'rem')
		if (!isAnimationAllowed() || !animation) {
			return options?.done()
		}

		modalRef.animate({
			translate: [
				`${pxToRem(x - left)}rem ${pxToRem(y - top)}rem`,
				`0 0`
			]
		}, {
			duration: 300,
			easing: AnimationEffectTiming.spring
		}).finished.then(() => {
			options?.done()
		})
	}

	function open(ev: CustomEvent<_ModalOpenEventDetail>): void {
		const options = ev.detail
		if (isOpen) return options.done()

		const autofocus = options.autoFocus ?? attributes.autoFocus
		const pointer = options.pointer
		modalRef.dispatchEvent(new CustomEvent(ModalEvents.beforeOpen))
		isOpen = true
		anchorRef = options.anchor ?? attributes.anchor
		important = options.important ?? attributes.important
		position = options.position ?? attributes.position
		gap = remToPx(options.gap ?? attributes.gap)
		padding = remToPx(options.padding ?? attributes.padding)
		pointerX = typeof pointer?.x === 'number'? remToPx(pointer.x) : POINTER_X
		pointerY = typeof pointer?.y === 'number'? remToPx(pointer.y) : POINTER_Y
		modalRef.toggleAttribute(ModalAttributes.draggable, options.draggable ?? attributes.draggable)
		modalRef.showModal()
		if (!autofocus) {
			modalRef.focus()
		}

		const modalRect = modalRef.getBoundingClientRect()
		const anchorRect = anchorRef?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			gap,
			padding,
			position
		})

		modalRef.style.setProperty(ModalCSSVariables.left, pxToRem(flyoutPosition.left) + 'rem')
		modalRef.style.setProperty(ModalCSSVariables.top, pxToRem(flyoutPosition.top) + 'rem')
		if (!animation || !isAnimationAllowed()) {
			return options.done()
		}

		const modalMidX = flyoutPosition.left + (modalRect.width / 2)
		const modalMidY = flyoutPosition.top + (modalRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : pointerX
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : pointerY
		const rangeX = Math.abs(modalMidX - anchorMidX)
		const rangeY = Math.abs(modalMidY - anchorMidY)
		let translateX = 0
		let translateY = 0
		if (rangeX > rangeY) {
			translateX = modalMidX < anchorMidX? 12 : -12
		}
		else if (rangeX < rangeY) {
			translateY = modalMidY < anchorMidY? 12 : -12
		}
		// keep if 'rangeX === rangeY'

		modalRef.animate({
			translate: [`${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`, '0 0'],
			opacity: [0, 1]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			options.done()
		})
	}

	function close(ev: CustomEvent<_ModalCloseEventDetail>): void {
		const options = ev.detail
		if ((options.soft ?? false) && important && isOpen) {
			options.done()
			return focus()
		}

		modalRef.dispatchEvent(new CustomEvent(ModalEvents.beforeClose))
		const modalRect = modalRef.getBoundingClientRect()
		const anchorRect = anchorRef?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			gap,
			padding,
			position
		})

		if (options.animation === false || !animation || !isAnimationAllowed()) {
			modalRef.close()
			return options.done()
		}

		const modalMidX = flyoutPosition.left + (modalRect.width / 2)
		const modalMidY = flyoutPosition.top + (modalRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : pointerX
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : pointerY
		const rangeX = Math.abs(modalMidX - anchorMidX)
		const rangeY = Math.abs(modalMidY - anchorMidY)
		let translateX = 0
		let translateY = 0
		if (rangeX > rangeY) {
			translateX = modalMidX < anchorMidX? 12 : -12
		}
		else if (rangeX < rangeY) {
			translateY = modalMidY < anchorMidY? 12 : -12
		}
		// keep if 'rangeX === rangeY'

		modalRef.animate({
			translate: ['0 0', `${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`],
			opacity: [1, 0]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			modalRef.close()
			options.done()
		})
	}

	function reposition(ev?: CustomEvent<_ModalRepositionEventDetail>): void {
		const options = ev?.detail
		if (!anchorRef) {
			return fixPosition(options)
		}

		const modalRect = modalRef.getBoundingClientRect()
		const anchorRect = anchorRef.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap,
			position,
			padding
		})

		const [x, y] = [modalRect.left, modalRect.top]
		modalRef.style.setProperty(ModalCSSVariables.left, pxToRem(flyoutPosition.left) + 'rem')
		modalRef.style.setProperty(ModalCSSVariables.top, pxToRem(flyoutPosition.top) + 'rem')
		if (!isAnimationAllowed() || !animation) {
			return options?.done()
		}

		modalRef.animate({
			translate: [
				`${pxToRem(x - flyoutPosition.left)}rem ${pxToRem(y - flyoutPosition.top)}rem`,
				`0 0`
			]
		}, {
			duration: 300,
			easing: AnimationEffectTiming.spring
		}).finished.then(() => {
			options?.done()
		})
	}

	function focus(ev?: CustomEvent<_ModalFocusEventDetail>): void {
		const options = ev?.detail
		if (timeoutFocusId !== null) clearTimeout(timeoutFocusId)

		modalRef.setAttribute(ModalAttributes.focus, '')
		timeoutFocusId = setTimeout(() => {
			modalRef.removeAttribute(ModalAttributes.focus)
			timeoutFocusId = null
			options?.done()
		}, 1000)
	}

	function dragHandleRefOnKeyDown(ev: KeyboardEvent): void {
		const code = ev.key
		if (
			code !== KeyboardValue.arrowUp
			&& code !== KeyboardValue.arrowDown
			&& code !== KeyboardValue.arrowLeft
			&& code !== KeyboardValue.arrowRight
		) return

		const onePercentWidth = screenWidth / 100
		const onePercentHeight = screenHeight / 100
		ev.preventDefault() // disable scroll

		if (timeoutScreenSizeId === null) {
			const rect = modalRef.getBoundingClientRect()
			keyTop = rect.top
			keyLeft = rect.left
			screenWidth = bodyRef.clientWidth
			screenHeight = window.innerHeight
			timeoutScreenSizeId = setTimeout(() => timeoutScreenSizeId = null, 1000)
		}

		switch (code) {
		case KeyboardValue.arrowUp:
			keyTop -= onePercentHeight
			break
		case KeyboardValue.arrowDown:
			keyTop += onePercentHeight
			break
		case KeyboardValue.arrowLeft:
			keyLeft -= onePercentWidth
			break
		case KeyboardValue.arrowRight:
			keyLeft += onePercentWidth
			break
		}

		modalRef.style.setProperty(ModalCSSVariables.left, pxToRem(keyLeft) + 'rem')
		modalRef.style.setProperty(ModalCSSVariables.top, pxToRem(keyTop) + 'rem')
		if (timeoutFixPositionId !== null) clearTimeout(timeoutFixPositionId)

		timeoutFixPositionId = setTimeout(() => {
			fixPosition()
			timeoutFixPositionId = null
		}, 200)
	}

	function dragHandleRefOnPointerMove(ev: PointerEvent): void {
		if (!isDragging) return

		requestAnimationFrame(() => {
			modalRef.style.setProperty(ModalCSSVariables.left, pxToRem(ev.clientX - diffPositionX) + 'rem')
			modalRef.style.setProperty(ModalCSSVariables.top, pxToRem(ev.clientY - diffPositionY) + 'rem')
		})
	}

	function dragHandleRefOnPointerUp(ev: PointerEvent): void {
		dragHandleRef?.releasePointerCapture(ev.pointerId)
		fixPosition()
		toggleDragging(false)
	}

	function dragHandleRefOnPointerDown(ev: PointerEvent): void {
		const rect = modalRef.getBoundingClientRect()
		toggleDragging(true)
		dragHandleRef?.setPointerCapture(ev.pointerId)
		diffPositionX = ev.clientX - rect.x
		diffPositionY = ev.clientY - rect.y
	}

	function dragHandleRefOnDblClick(): void {
		reposition()
	}

	function modalRefOnKeyDown(ev: KeyboardEvent): void {
		const key = ev.key
		if (key === KeyboardValue.escape
			&& !ev.altKey
			&& !ev.ctrlKey
			&& !ev.metaKey
			&& !ev.shiftKey
			&& important
		) {
			focus()
			ev.preventDefault() // disable close
		}
	}

	function modalRefOnCancel(ev: Event): void {
		if (important) {
			return ev.preventDefault()
		}

		close(new CustomEvent<_ModalCloseEventDetail>('', {detail: {soft: true, done(){}}}))
		ev.preventDefault()
	}

	function initEvents(): void {
		modalRef.addEventListener(ModalEvents.attributeChange as any, (ev: CustomEvent<_ModalAttributeChangeEventDetail>) => {
			const attr = ev.detail.attributeName
			switch (attr) {
			case 'open':
				const body = document.body
				isOpen = modalRef.open
				modalRef.dispatchEvent(new CustomEvent<ModalToggleOpenEventDetail>(
					ModalEvents.toggleOpen, {detail: {isOpen}}
				))
				if (isOpen) {
					OPENED_MODAL.push(modalRef)
					modalRef.toggleAttribute(GlobalAttributes.keepPointerEvent, true)
					body.toggleAttribute(BodyAttributes.noPointerEvent, true);
					modalRef.addEventListener(ModalEvents.focus as any, focus);
					modalRef.addEventListener(ModalEvents.reposition as any, reposition);
					modalRef.addEventListener('cancel', modalRefOnCancel)
					modalRef.addEventListener('keydown', modalRefOnKeyDown)
					dragHandleRef?.addEventListener('keydown', dragHandleRefOnKeyDown)
					dragHandleRef?.addEventListener('pointerdown', dragHandleRefOnPointerDown)
					dragHandleRef?.addEventListener('pointerup', dragHandleRefOnPointerUp)
					dragHandleRef?.addEventListener('pointermove', dragHandleRefOnPointerMove)
					dragHandleRef?.addEventListener('dblclick', dragHandleRefOnDblClick)
				}
				else {
					const index = OPENED_MODAL.findIndex(v => v === modalRef)
					modalRef.toggleAttribute(GlobalAttributes.keepPointerEvent, false)
					if (index >= 0) {
						OPENED_MODAL.splice(index, 1)
					}
					if (OPENED_MODAL.length === 0) {
						body.toggleAttribute(BodyAttributes.noPointerEvent, false);
					}

					modalRef.removeEventListener(ModalEvents.focus as any, focus);
					modalRef.removeEventListener(ModalEvents.reposition as any, reposition);
					modalRef.removeEventListener('cancel', modalRefOnCancel)
					modalRef.removeEventListener('keydown', modalRefOnKeyDown)
					dragHandleRef?.removeEventListener('keydown', dragHandleRefOnKeyDown)
					dragHandleRef?.removeEventListener('pointerdown', dragHandleRefOnPointerDown)
					dragHandleRef?.removeEventListener('pointerup', dragHandleRefOnPointerUp)
					dragHandleRef?.removeEventListener('pointermove', dragHandleRefOnPointerMove)
					dragHandleRef?.removeEventListener('dblclick', dragHandleRefOnDblClick)
				}
				break
			case ModalAttributes.anchorBy:
				anchorRef = attributes.anchor ?? anchorRef
				reposition()
				break
			case ModalAttributes.animation:
				animation = attributes.animation
				break
			case ModalAttributes.gap:
				gap = attributes.gap
				reposition()
				break
			case ModalAttributes.important:
				important = attributes.important
				break
			case ModalAttributes.padding:
				padding = attributes.padding
				reposition()
				break
			case ModalAttributes.position:
				position = attributes.position
				reposition()
				break
			}
		});
		(modalRef as any).addEventListener(ModalEvents.open, open);
		(modalRef as any).addEventListener(ModalEvents.close, close);
	}

	/**
	 * Expected structure:
	 * ```css
	 * dialog.c-modal
	 *     > div.c-modal-content
	 *     > div.c-modal-draghandle
	 */
	function checkContentStructure(): void {
		const children = modalRef.children
		const rest: Element[] = []
		for (let i = 0; i < children.length; i++) {
			const child = children.item(i)!
			if (!dragHandleRef && child.matches('div.' + ModalClasses.dragHandle)) {
				dragHandleRef = child as HTMLDivElement
			}
			else if (!contentRef && child.matches('div.' + ModalClasses.content)) {
				contentRef = child as HTMLDivElement
			}
			else {
				rest.push(child)
			}
		}

		if (!dragHandleRef) {
			dragHandleRef = document.createElement('div')
			dragHandleRef.classList.add(ModalClasses.dragHandle)
		}

		if (!contentRef) {
			contentRef = document.createElement('div')
			contentRef.classList.add(ModalClasses.content)
		}

		dragHandleRef.tabIndex = 0
		dragHandleRef.draggable = false
		contentRef.append(...rest)
		modalRef.replaceChildren(contentRef, dragHandleRef)
	}

	checkContentStructure()
	initEvents()
}

async function openModalRef(modalRef: ModalElement, options?: ModalOpenOptions): Promise<void> {
	return new Promise((done) => modalRef.dispatchEvent(new CustomEvent<_ModalOpenEventDetail>(
		ModalEvents.open,
		{detail: {...options, done}}
	)))
}

async function closeModalRef(modalRef: ModalElement, options?: ModalCloseOptions): Promise<void> {
	return new Promise((done) => modalRef.dispatchEvent(new CustomEvent<_ModalCloseEventDetail>(
		ModalEvents.close,
		{detail: {...options, done}}
	)))
}

async function repositionModalRef(modalRef: ModalElement): Promise<void> {
	return new Promise((done) => modalRef.dispatchEvent(new CustomEvent<_ModalRepositionEventDetail>(
		ModalEvents.reposition,
		{detail: {done}}
	)))
}

async function focusModalRef(modalRef: ModalElement): Promise<void> {
	return new Promise((done) => modalRef.dispatchEvent(new CustomEvent<_ModalRepositionEventDetail>(
		ModalEvents.focus,
		{detail: {done}}
	)))
}

function isModalRefOpen(modalRef: ModalElement): boolean {
	return modalRef.open
}

function createModalRef(options?: ModalUpdateOptions): ModalElement {
	const modalRef = updateModalRef(document.createElement('dialog'), options)
	registerModalRef(modalRef)
	return modalRef
}

function updateModalRef(modalRef: ModalElement, options?: ModalUpdateOptions): ModalElement {
	modalRef.classList.add(ModalClasses.modal)

	const draggableOption = options?.ModalDraggable
	if (draggableOption !== undefined) {
		modalRef.toggleAttribute(ModalAttributes.draggable, draggableOption)
	}

	const importantOption = options?.ModalImportant
	if (importantOption !== undefined) {
		modalRef.toggleAttribute(ModalAttributes.important, importantOption)
	}

	const autoFocusOption = options?.ModalAutoFocus
	if (autoFocusOption !== undefined) {
		modalRef.toggleAttribute(ModalAttributes.autoFocus, autoFocusOption)
	}

	const animationOption = options?.ModalAnimation
	if (animationOption !== undefined) {
		modalRef.setAttribute(ModalAttributes.animation, String(animationOption))
	}

	const anchorByOption = options?.ModalAnchorBy
	if (anchorByOption === false) {
		modalRef.removeAttribute(ModalAttributes.anchorBy)
	}
	else if (anchorByOption !== undefined && anchorByOption !== true) {
		modalRef.setAttribute(ModalAttributes.anchorBy, anchorByOption)
	}

	const gapOption = options?.ModalGap
	if (gapOption === false) {
		modalRef.removeAttribute(ModalAttributes.gap)
	}
	else if (gapOption !== undefined && gapOption !== true) {
		modalRef.setAttribute(ModalAttributes.gap, gapOption.toString())
	}

	const paddingOption = options?.ModalPadding
	if (paddingOption === false) {
		modalRef.removeAttribute(ModalAttributes.padding)
	}
	else if (paddingOption !== undefined && paddingOption !== true) {
		modalRef.setAttribute(ModalAttributes.padding, paddingOption.toString())
	}

	const positionOption = options?.ModalPosition
	if (positionOption === false) {
		modalRef.removeAttribute(ModalAttributes.position)
	}
	else if (positionOption !== undefined && positionOption !== true) {
		modalRef.setAttribute(ModalAttributes.position, positionOption)
	}

	let contentRef = modalRef.querySelector<HTMLDivElement>(`.${ModalClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(ModalClasses.content)
	}

	const childrenOption = options?.ModalChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	let dragHandleRef = modalRef.querySelector<HTMLDivElement>(`.${ModalClasses.dragHandle}`)
	if (!dragHandleRef) {
		dragHandleRef = document.createElement('div')
		dragHandleRef.classList.add(ModalClasses.dragHandle)
		dragHandleRef.setAttribute('tabindex', '0')
		dragHandleRef.setAttribute('draggable', 'false')
	}

	modalRef.replaceChildren(contentRef, dragHandleRef)
	options?.ModalRefs?.content?.(contentRef)
	options?.ModalRefs?.modal?.(modalRef)
	options?.ModalRefs?.dragHandle?.(dragHandleRef)
	return modalRef
}

function registerModalRef(...modalRefs: ModalElement[]): void {
	_initModalRefListener()
	_initMutationObserver()
	if (modalRefs.length === 0) {
		modalRefs = [...document.querySelectorAll<ModalElement>('.' + ModalClasses.modal)]
	}

	for (const modalRef of modalRefs){
		if (REGISTERED_MODAL.has(modalRef)) {
			continue
		}

		REGISTERED_MODAL.add(modalRef)
		MUTATION_OBSERVER?.observe(modalRef, {attributeFilter: LISTENED_ATTRIBUTES})
		_initModalRef(modalRef)
	}
}

function unregisterModalRef(...modalRefs: ModalElement[]): void {
	MUTATION_OBSERVER?.disconnect()
	for (const modalRef of modalRefs) {
		REGISTERED_MODAL.delete(modalRef)
	}
	for (const modalRef of REGISTERED_MODAL) {
		MUTATION_OBSERVER?.observe(modalRef, {attributeFilter: LISTENED_ATTRIBUTES})
	}
}

export {
	type ModalProps,
	type ModalUpdateOptions,
	type ModalOpenOptions,
	type ModalCloseOptions,
	type ModalToggleOpenEventDetail,
	type ModalElement,
	ModalEvents,
	ModalCSSVariables,
	ModalAttributes,
	ModalClasses,
	ModalPosition,
	openModalRef,
	closeModalRef,
	repositionModalRef,
	focusModalRef,
	isModalRefOpen,
	createModalRef,
	updateModalRef,
	registerModalRef,
	unregisterModalRef
}