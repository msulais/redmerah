import { AnimationEffectTiming } from "@/enums/animation"
import { FlyoutPosition as ModalPosition } from "@/enums/position"
import { animationIsOn } from "@/utils/animation"
import { getFlyoutPosition } from "@/utils/flyout"
import { numberSafe } from "@/utils/number"
import { validEnumValue } from "@/utils/object"
import {
	KEY_ARROW_DOWN,
	KEY_ARROW_LEFT,
	KEY_ARROW_RIGHT,
	KEY_ARROW_UP,
	KEY_ESCAPE
} from "@/constants/key-code"
import { BodyAttributes, GlobalAttributes } from "@/enums/attributes"

type ModalProps = astroHTML.JSX.DialogHTMLAttributes & {
	'c:anchorBy'      ?: string
	'c:draggable'     ?: boolean
	'c:important'     ?: boolean
	'c:autoFocus'     ?: boolean
	'c:animation'     ?: boolean
	'c:gap'           ?: number
	'c:padding'       ?: number
	'c:position'      ?: ModalPosition
	'c:attrDragHandle'?: astroHTML.JSX.HTMLAttributes
	'c:attrContent'   ?: astroHTML.JSX.HTMLAttributes
}

type ModalUpdateOptions = {
	children ?: (Node | string)[] | boolean
	anchorBy ?: string | boolean
	draggable?: boolean
	important?: boolean
	autoFocus?: boolean
	animation?: boolean
	gap      ?: number | boolean
	padding  ?: number | boolean
	position ?: ModalPosition | boolean
	refs     ?: {
		modal     ?(el: HTMLDialogElement): unknown
		content   ?(el: HTMLDivElement   ): unknown
		dragHandle?(el: HTMLDivElement   ): unknown
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
}

type ModalOpenDetails = ModalOpenOptions & {
	done: () => void
}

type ModalCloseDetails = ModalCloseOptions & {
	done: () => void
}

type ModalRepositionDetails = {
	done: () => void
}

type ModalFocusDetails = {
	done: () => void
}

enum ModalEvents {
	/** @param attributeName `string` */
	attributeChange = 'modal:attribute-change',

	/** @param isOpen `boolean` */
	toggleOpen = 'modal:toggle-open',

	/** @param details ModalOpenDetails */
	open = 'modal:open',

	/** @param details ModalCloseDetails */
	close = 'modal:close',

	/** @param details ModalFocusDetails */
	focus = 'modal:focus',

	/** @param details ModalRepositionDetails */
	reposition = 'modal:reposition',
}

enum ModalAttributes {
	/** @param id `string` */
	anchorBy = 'data-c-anchorby',

	/** @param value `boolean` */
	animation = 'data-c-animation',

	/** Useful for other component
	 * @param value `'' | 'true' | 'false'` */
	draggable = 'data-c-draggable',
	important = 'data-c-important',
	autoFocus = 'data-c-autofocus',
	focus     = 'data-c-focus',
	dragging  = 'data-c-dragging',

	/** @param value `number` */
	gap = 'data-c-gap',

	/** @param value `number` */
	padding = 'data-c-padding',

	/** @param value `ModalPosition` */
	position = 'data-c-position',
}

enum ModalClasses {
	modal          = 'c-modal',
	content        = 'c-modal-content',
	dragHandle     = 'c-modal-draghandle',
	data_draggable = 'attr:draggable'
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
const OPENED_MODAL: HTMLDialogElement[] = []
const REGISTERED_MODAL: HTMLDialogElement[] = []
let POINTER_X: number = 0
let POINTER_Y: number = 0
let HAS_LISTENER: boolean = false

// MutationObserver only exist in client side
let MUTATION_OBSERVER: MutationObserver | null = null

function initMutationObserver(): void {
	if (MUTATION_OBSERVER) return

	MUTATION_OBSERVER = new MutationObserver((entries) => {
		for (const entry of entries) {
			const attr = entry.attributeName
			entry.target.dispatchEvent(new CustomEvent(ModalEvents.attributeChange, {detail: attr}))
		}
	})
}

function _initModalListener(): void {
	if (HAS_LISTENER) return

	let timeoutId: number | NodeJS.Timeout | null = null
	let pointerInRange: boolean = false
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (OPENED_MODAL.length == 0) return
		if (timeoutId !== null) clearTimeout(timeoutId)

		timeoutId = setTimeout(async () => {
			for (const modal of OPENED_MODAL) {
				await repositionModal(modal)
			}
			timeoutId = null
		}, 250)
	}

	function handleOutsideClick(): void {
		if (OPENED_MODAL.length === 0 || pointerInRange) return

		closeModal(OPENED_MODAL[OPENED_MODAL.length-1], {soft: true})
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

function _initModal(modal: HTMLDialogElement): void {
	const body = document.body
	const attributes = {
		get anchor(): HTMLElement | null {
			const value = modal.getAttribute(ModalAttributes.anchorBy)
			if (!value) return null

			return document.getElementById(value)
		},
		get gap(): number {
			const value = modal.getAttribute(ModalAttributes.gap)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get padding(): number {
			const value = modal.getAttribute(ModalAttributes.padding)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get position(): ModalPosition {
			const value = modal.getAttribute(ModalAttributes.position)
			if (!value || !validEnumValue(value, ModalPosition)) return ModalPosition.centerBottom

			return value as ModalPosition
		},
		get draggable(): boolean {
			return modal.hasAttribute(ModalAttributes.draggable)
		},
		get autoFocus(): boolean {
			return modal.hasAttribute(ModalAttributes.autoFocus)
		},
		get important(): boolean {
			return modal.hasAttribute(ModalAttributes.important)
		},
		get animation(): boolean {
			return modal.getAttribute(ModalAttributes.animation) !== 'false'
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
	let screenWidth = body.clientWidth
	let screenHeight = window.innerHeight
	let keyTop = 0
	let keyLeft = 0

	// different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function toggleDragging(drag: boolean): void {
		isDragging = drag
		modal.toggleAttribute(ModalAttributes.dragging, drag)
	}

	function fixPosition(options?: ModalRepositionDetails): void {
		const modalRect = modal.getBoundingClientRect()
		const screenWidth = body.clientWidth
		const screenHeight = window.innerHeight
		const [x, y] = [modalRect.left, modalRect.top]
		let [left, top] = [x, y]
		if (modalRect.left < MODAL_MARGIN) left = MODAL_MARGIN
		if (modalRect.top < MODAL_MARGIN) top = MODAL_MARGIN
		if (modalRect.right > screenWidth) left = screenWidth - modalRect.width - MODAL_MARGIN
		if (modalRect.bottom > screenHeight) top = screenHeight - modalRect.height - MODAL_MARGIN

		modal.style.setProperty('left', left + 'px')
		modal.style.setProperty('top', top + 'px')
		if (!animationIsOn() || !animation) {
			return options?.done()
		}

		modal.animate({
			transform: [
				`translate(${x - left}px,${y - top}px)`,
				`translate(0,0)`
			]
		}, {
			duration: 300,
			easing: AnimationEffectTiming.spring
		}).finished.then(() => {
			options?.done()
		})
	}

	function open(ev: CustomEvent<ModalOpenDetails>): void {
		const options = ev.detail
		if (isOpen) return options.done()

		const autofocus = options.autoFocus ?? attributes.autoFocus
		const pointer = options.pointer
		isOpen = true
		anchorRef = options.anchor ?? attributes.anchor
		important = options.important ?? attributes.important
		position = options.position ?? attributes.position
		gap = options.gap ?? attributes.gap
		padding = options.padding ?? attributes.padding
		pointerX = pointer?.x ?? POINTER_X
		pointerY = pointer?.y ?? POINTER_Y
		modal.toggleAttribute(ModalAttributes.draggable, options.draggable ?? attributes.draggable)
		modal.showModal()
		if (!autofocus) modal.focus()

		const modalRect = modal.getBoundingClientRect()
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

		modal.style.setProperty('left', flyoutPosition.left + 'px')
		modal.style.setProperty('top', flyoutPosition.top + 'px')
		if (!animation || !animationIsOn()) {
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

		modal.animate({
			transform: [`translate(${translateX}px,${translateY}px)`, 'translate(0,0)'],
			opacity: [0, 1]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			options.done()
		})
	}

	function close(ev: CustomEvent<ModalCloseDetails>): void {
		const options = ev.detail
		if ((options.soft ?? false) && important && isOpen) {
			options.done()
			return focus()
		}

		const modalRect = modal.getBoundingClientRect()
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

		if (!animation || !animationIsOn()) {
			modal.close()
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

		modal.animate({
			transform: ['translate(0,0)', `translate(${translateX}px,${translateY}px)`],
			opacity: [1, 0]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			modal.close()
			options.done()
		})
	}

	function reposition(ev?: CustomEvent<ModalRepositionDetails>): void {
		const options = ev?.detail
		if (!anchorRef) {
			return fixPosition(options)
		}

		const modalRect = modal.getBoundingClientRect()
		const anchorRect = anchorRef.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: modalRect,
			anchor: anchorRect,
			gap,
			position,
			padding
		})

		const [x, y] = [modalRect.left, modalRect.top]
		modal.style.setProperty('left', flyoutPosition.left + 'px')
		modal.style.setProperty('top', flyoutPosition.top + 'px')
		if (!animationIsOn() || !animation) {
			return options?.done()
		}

		modal.animate({
			transform: [
				`translate(${x - flyoutPosition.left}px,${y - flyoutPosition.top}px)`,
				`translate(0,0)`
			]
		}, {
			duration: 300,
			easing: AnimationEffectTiming.spring
		}).finished.then(() => {
			options?.done()
		})
	}

	function focus(ev?: CustomEvent<ModalFocusDetails>): void {
		const options = ev?.detail
		if (timeoutFocusId !== null) clearTimeout(timeoutFocusId)

		modal.setAttribute(ModalAttributes.focus, '')
		timeoutFocusId = setTimeout(() => {
			modal.removeAttribute(ModalAttributes.focus)
			timeoutFocusId = null
			options?.done()
		}, 1000)
	}

	function dragOnKeyDown(ev: KeyboardEvent): void {
		const code = ev.code
		if (
			code !== KEY_ARROW_UP
			&& code !== KEY_ARROW_DOWN
			&& code !== KEY_ARROW_LEFT
			&& code !== KEY_ARROW_RIGHT
		) return

		const onePercentWidth = screenWidth / 100
		const onePercentHeight = screenHeight / 100
		ev.preventDefault() // disable scroll

		if (timeoutScreenSizeId === null) {
			const rect = modal.getBoundingClientRect()
			keyTop = rect.top
			keyLeft = rect.left
			screenWidth = body.clientWidth
			screenHeight = window.innerHeight
			timeoutScreenSizeId = setTimeout(() => timeoutScreenSizeId = null, 1000)
		}

		switch (code) {
		case KEY_ARROW_UP:
			keyTop -= onePercentHeight
			break
		case KEY_ARROW_DOWN:
			keyTop += onePercentHeight
			break
		case KEY_ARROW_LEFT:
			keyLeft -= onePercentWidth
			break
		case KEY_ARROW_RIGHT:
			keyLeft += onePercentWidth
			break
		}

		modal.style.setProperty('left', keyLeft + 'px')
		modal.style.setProperty('top', keyTop + 'px')
		if (timeoutFixPositionId !== null) clearTimeout(timeoutFixPositionId)

		timeoutFixPositionId = setTimeout(() => {
			fixPosition()
			timeoutFixPositionId = null
		}, 200)
	}

	function dragOnPointerMove(ev: PointerEvent): void {
		if (!isDragging) return

		modal.style.setProperty('left', ev.clientX - diffPositionX + 'px')
		modal.style.setProperty('top', ev.clientY - diffPositionY + 'px')
	}

	function dragOnPointerUp(ev: PointerEvent): void {
		dragHandleRef?.releasePointerCapture(ev.pointerId)
		fixPosition()
		toggleDragging(false)
	}

	function dragOnPointerDown(ev: PointerEvent): void {
		const rect = modal.getBoundingClientRect()
		toggleDragging(true)
		dragHandleRef?.setPointerCapture(ev.pointerId)
		diffPositionX = ev.clientX - rect.x
		diffPositionY = ev.clientY - rect.y
	}

	function dragOnDblClick(): void {
		reposition()
	}

	function modalOnKeyDown(ev: KeyboardEvent): void {
		const code = ev.code
		if (code === KEY_ESCAPE
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

	function modalOnCancel(ev: Event): void {
		if (important) {
			return ev.preventDefault()
		}

		close(new CustomEvent<ModalCloseDetails>('', {detail: {soft: true, done(){}}}))
		ev.preventDefault()
	}

	function initEvents(): void {
		(modal as any).addEventListener(ModalEvents.attributeChange, (ev: CustomEvent<string>) => {
			const attr = ev.detail
			switch (attr) {
			case 'open':
				const body = document.body
				isOpen = modal.open
				modal.dispatchEvent(new CustomEvent<boolean>(ModalEvents.toggleOpen, {detail: isOpen}))
				if (isOpen) {
					OPENED_MODAL.push(modal)
					modal.toggleAttribute(GlobalAttributes.keepPointerEvent, true)
					body.toggleAttribute(BodyAttributes.noPointerEvent, true);
					(modal as any).addEventListener(ModalEvents.focus, focus);
					(modal as any).addEventListener(ModalEvents.reposition, reposition);
					modal.addEventListener('cancel', modalOnCancel)
					modal.addEventListener('keydown', modalOnKeyDown)
					dragHandleRef?.addEventListener('keydown', dragOnKeyDown)
					dragHandleRef?.addEventListener('pointerdown', dragOnPointerDown)
					dragHandleRef?.addEventListener('pointerup', dragOnPointerUp)
					dragHandleRef?.addEventListener('pointermove', dragOnPointerMove)
					dragHandleRef?.addEventListener('dblclick', dragOnDblClick)
				}
				else {
					const index = OPENED_MODAL.findIndex(v => v === modal)
					modal.toggleAttribute(GlobalAttributes.keepPointerEvent, false)
					if (index >= 0) {
						OPENED_MODAL.splice(index, 1)
					}
					if (OPENED_MODAL.length === 0) {
						body.toggleAttribute(BodyAttributes.noPointerEvent, false);
					}

					(modal as any).removeEventListener(ModalEvents.focus, focus);
					(modal as any).removeEventListener(ModalEvents.reposition, reposition);
					modal.removeEventListener('cancel', modalOnCancel)
					modal.removeEventListener('keydown', modalOnKeyDown)
					dragHandleRef?.removeEventListener('keydown', dragOnKeyDown)
					dragHandleRef?.removeEventListener('pointerdown', dragOnPointerDown)
					dragHandleRef?.removeEventListener('pointerup', dragOnPointerUp)
					dragHandleRef?.removeEventListener('pointermove', dragOnPointerMove)
					dragHandleRef?.removeEventListener('dblclick', dragOnDblClick)
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
		(modal as any).addEventListener(ModalEvents.open, open);
		(modal as any).addEventListener(ModalEvents.close, close);
	}

	/**
	 * Expected structure:
	 * ```css
	 * dialog.c-modal
	 *     > div.c-modal-content
	 *     > div.c-modal-draghandle
	 */
	function checkContentStructure(): void {
		const children = modal.children
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
		modal.replaceChildren(contentRef, dragHandleRef)
	}

	checkContentStructure()
	initEvents()
}

async function openModal(modal: HTMLDialogElement, options?: ModalOpenOptions): Promise<void> {
	return new Promise((done) => modal.dispatchEvent(new CustomEvent(
		ModalEvents.open,
		{detail: {...options, done} satisfies ModalOpenDetails}
	)))
}

async function closeModal(modal: HTMLDialogElement, options?: ModalCloseOptions): Promise<void> {
	return new Promise((done) => modal.dispatchEvent(new CustomEvent(
		ModalEvents.close,
		{detail: {...options, done} satisfies ModalCloseDetails}
	)))
}

async function repositionModal(modal: HTMLDialogElement): Promise<void> {
	return new Promise((done) => modal.dispatchEvent(new CustomEvent(
		ModalEvents.reposition,
		{detail: {done} satisfies ModalRepositionDetails}
	)))
}

async function focusModal(modal: HTMLDialogElement): Promise<void> {
	return new Promise((done) => modal.dispatchEvent(new CustomEvent(
		ModalEvents.focus,
		{detail: {done} satisfies ModalRepositionDetails}
	)))
}

function isModalOpen(modal: HTMLDialogElement): boolean {
	return modal.open
}

function createModal(options?: ModalUpdateOptions): HTMLDialogElement {
	const modal = document.createElement('dialog')
	return updateModal(modal, options)
}

function updateModal(modal: HTMLDialogElement, options?: ModalUpdateOptions): HTMLDialogElement {
	modal.classList.add(ModalClasses.modal)
	if (options?.draggable !== undefined) {
		modal.toggleAttribute(ModalAttributes.draggable, options.draggable)
	}

	if (options?.important !== undefined) {
		modal.toggleAttribute(ModalAttributes.important, options.important)
	}

	if (options?.autoFocus !== undefined) {
		modal.toggleAttribute(ModalAttributes.autoFocus, options.autoFocus)
	}

	if (options?.animation !== undefined) {
		modal.setAttribute(ModalAttributes.animation, String(options.animation))
	}

	const anchorBy = options?.anchorBy
	if (anchorBy === false) {
		modal.removeAttribute(ModalAttributes.anchorBy)
	}
	else if (anchorBy && anchorBy !== true) {
		modal.setAttribute(ModalAttributes.anchorBy, anchorBy)
	}

	const gap = options?.gap
	if (gap === false) {
		modal.removeAttribute(ModalAttributes.gap)
	}
	else if (gap && gap !== true) {
		modal.setAttribute(ModalAttributes.gap, gap.toString())
	}

	const padding = options?.padding
	if (padding === false) {
		modal.removeAttribute(ModalAttributes.padding)
	}
	else if (padding && padding !== true) {
		modal.setAttribute(ModalAttributes.padding, padding.toString())
	}

	const position = options?.position
	if (position === false) {
		modal.removeAttribute(ModalAttributes.position)
	}
	else if (position && position !== true) {
		modal.setAttribute(ModalAttributes.position, position)
	}

	let content = modal.querySelector(`.${ModalClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(ModalClasses.content)
	}

	const children = options?.children
	if (children === false) {
		content.replaceChildren()
	}
	else if (children && children !== true) {
		content.replaceChildren(...children)
	}

	let dragHandle = modal.querySelector(`.${ModalClasses.dragHandle}`) as HTMLDivElement | null
	if (!dragHandle) {
		dragHandle = document.createElement('div')
		dragHandle.classList.add(ModalClasses.dragHandle)
		dragHandle.setAttribute('tabindex', '0')
	}

	modal.replaceChildren(content, dragHandle)
	options?.refs?.content?.(content)
	options?.refs?.modal?.(modal)
	options?.refs?.dragHandle?.(dragHandle)
	return modal
}

function registerModal(...modals: HTMLDialogElement[]): void {
	_initModalListener()
	initMutationObserver()
	if (modals.length === 0) {
		modals = [...document.querySelectorAll<HTMLDialogElement>('dialog.' + ModalClasses.modal)]
	}

	for (const modal of modals){
		if (REGISTERED_MODAL.some(v => v === modal)) {
			continue
		}

		REGISTERED_MODAL.push(modal)
		MUTATION_OBSERVER?.observe(modal, {attributeFilter: LISTENED_ATTRIBUTES})
		_initModal(modal)
	}
}

function unregisterModal(...modals: HTMLDialogElement[]): void {
	const filtered = REGISTERED_MODAL.filter(a => modals.every(b => a !== b))
	MUTATION_OBSERVER?.disconnect()
	REGISTERED_MODAL.length = 0
	REGISTERED_MODAL.push(...filtered)
	for (const popover of REGISTERED_MODAL) {
		MUTATION_OBSERVER?.observe(popover, {attributeFilter: LISTENED_ATTRIBUTES})
	}
}

export {
	type ModalProps,
	type ModalUpdateOptions,
	type ModalOpenOptions,
	type ModalCloseOptions,
	type ModalOpenDetails,
	type ModalCloseDetails,
	type ModalRepositionDetails,
	type ModalFocusDetails,
	ModalEvents,
	ModalAttributes,
	ModalClasses,
	openModal,
	closeModal,
	repositionModal,
	focusModal,
	isModalOpen,
	createModal,
	updateModal,
	registerModal,
	unregisterModal
}