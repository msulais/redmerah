import { AnimationEffectTiming } from "@/enums/animation"
import { FlyoutPosition as PopoverPosition } from "@/enums/position"
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
import { elementFocusAny } from "@/utils/element"

type PopoverProps = astroHTML.JSX.DialogHTMLAttributes & {
	'c:anchorBy'      ?: string
	'c:draggable'     ?: boolean
	'c:important'     ?: boolean
	'c:autoFocus'     ?: boolean
	'c:animation'     ?: boolean
	'c:gap'           ?: number
	'c:padding'       ?: number
	'c:position'      ?: PopoverPosition
	'c:attrDragHandle'?: astroHTML.JSX.HTMLAttributes
	'c:attrContent'   ?: astroHTML.JSX.HTMLAttributes
}

type PopoverUpdateOptions = {
	children ?: (Node | string)[] | boolean
	anchorBy ?: string | boolean
	draggable?: boolean
	important?: boolean
	autoFocus?: boolean
	animation?: boolean
	gap      ?: number | boolean
	padding  ?: number | boolean
	position ?: PopoverPosition | boolean
	popover  ?: 'auto' | 'manual'
	refs     ?: {
		popover   ?(el: HTMLDivElement): unknown
		content   ?(el: HTMLDivElement): unknown
		dragHandle?(el: HTMLDivElement): unknown
	}
}

type PopoverOpenOptions = {
	anchor   ?: HTMLElement
	gap      ?: number
	padding  ?: number
	important?: boolean
	position ?: PopoverPosition
	draggable?: boolean
	autoFocus?: boolean
	animation?: boolean

	/**
	 * Custom pointer position. Only works if `PopoverOpenOptions.anchor` set to `undefined`
	 * */
	pointer  ?: {
		x: number
		y: number
	}
}

type PopoverCloseOptions = {
	/** if the popover is important, it will not closed */
	soft?: boolean
	animation?: boolean
}

type PopoverOpenDetails = PopoverOpenOptions & {
	done: () => void
}

type PopoverCloseDetails = PopoverCloseOptions & {
	done: () => void
}

type PopoverRepositionDetails = {
	done: () => void
}

type PopoverToggleOpenDetail = {
	open: boolean
}

type PopoverAttributeChangeDetail = {
	attributeName: string | null
}

enum PopoverEvents {
	/** @param detail `PopoverAttributeChangeDetail` */
	attributeChange = 'popover:attribute-change',

	/** @param detail `PopopverToggleOpenDetail` */
	toggleOpen = 'popover:toggle-open',

	/** @param detail PopoverOpenDetails */
	open = 'popover:open',

	/** @param detail PopoverCloseDetails */
	close = 'popover:close',

	/** @param detail PopoverRepositionDetails */
	reposition = 'popover:reposition',
	beforeOpen = 'popover:before-open',
	beforeClose = 'popover:before-close'
}

enum PopoverAttributes {
	/** @param id `string` */
	anchorBy  = 'data-c-anchorby',

	/** @param value `boolean` */
	animation = 'data-c-animation',

	/** Useful for other component */
	draggable = 'data-c-draggable',
	important = 'data-c-important',
	autoFocus = 'data-c-autofocus',
	dragging  = 'data-c-dragging',

	/** @param value `number` */
	gap       = 'data-c-gap',

	/** @param value `number` */
	padding   = 'data-c-padding',

	/** @param value `PopoverPosition` */
	position  = 'data-c-position',
}

enum PopoverClasses {
	popover    = 'c-popover',
	content    = 'c-popover-content',
	dragHandle = 'c-popover-draghandle',
}

const LISTENED_ATTRIBUTES: string[] = [
	PopoverAttributes.anchorBy,
	PopoverAttributes.animation,
	PopoverAttributes.gap,
	PopoverAttributes.important,
	PopoverAttributes.padding,
	PopoverAttributes.position,
]
const POPOVER_MARGIN = 8
const OPENED_POPOVER: HTMLDivElement[] = []
const REGISTERED_POPOVER: HTMLDivElement[] = []
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
			entry.target.dispatchEvent(new CustomEvent<PopoverAttributeChangeDetail>(
				PopoverEvents.attributeChange,
				{detail: {
					attributeName: attr
				}}
			))
		}
	})
}

function initPopoverListener(): void {
	if (HAS_LISTENER) return

	let timeoutId: number | NodeJS.Timeout | null = null
	let isPointerClick = false
	const selectedPopovers: HTMLDivElement[] = []
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (OPENED_POPOVER.length === 0) return
		if (timeoutId !== null) clearTimeout(timeoutId)

		timeoutId = setTimeout(async () => {
			for (const popover of OPENED_POPOVER) {
				await repositionPopover(popover)
			}
			timeoutId = null
		}, 100)
	}

	function handleOutsideClick(): void {
		if (OPENED_POPOVER.length === 0 || selectedPopovers.length === 0) return

		for (const popover of selectedPopovers) {
			closePopover(popover, {soft: true})
		}

		selectedPopovers.length = 0
	}

	function initEvents(): void {
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
		document.addEventListener('pointerdown', (ev) => {
			isPointerClick = true
			if (OPENED_POPOVER.length === 0) return

			selectedPopovers.length = 0
			for (const popover of OPENED_POPOVER) {
				const inRange = popover.contains(ev.target as Node)
				if (inRange) continue

				selectedPopovers.push(popover)
			}
		})

		// handle click not by pointer
		document.addEventListener('click', (ev) => {
			if (OPENED_POPOVER.length === 0) return
			if (!isPointerClick) {
				for (const popover of OPENED_POPOVER) {
					const inRange = popover.contains(ev.target as Node)
					if (inRange) continue

					closePopover(popover, {soft: true})
				}
			}
			isPointerClick = false
		})
		document.addEventListener('pointercancel', handleOutsideClick)
		document.addEventListener('pointerup', handleOutsideClick)
		window.addEventListener('resize', handleWindowResize)
	}

	initEvents()
}

function _initPopover(popover: HTMLDivElement): void {
	const body = document.body
	const attributes = {
		get anchor(): HTMLElement | null {
			const value = popover.getAttribute(PopoverAttributes.anchorBy)
			if (!value) return null

			return document.getElementById(value)
		},
		get gap(): number {
			const value = popover.getAttribute(PopoverAttributes.gap)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get padding(): number {
			const value = popover.getAttribute(PopoverAttributes.padding)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get position(): PopoverPosition {
			const value = popover.getAttribute(PopoverAttributes.position)
			if (!value || !validEnumValue(value, PopoverPosition)) return PopoverPosition.centerBottom

			return value as PopoverPosition
		},
		get draggable(): boolean {
			return popover.hasAttribute(PopoverAttributes.draggable)
		},
		get autoFocus(): boolean {
			return popover.hasAttribute(PopoverAttributes.autoFocus)
		},
		get important(): boolean {
			return popover.hasAttribute(PopoverAttributes.important)
		},
		get animation(): boolean {
			return popover.getAttribute(PopoverAttributes.animation) !== 'false'
		}
	}
	let isOpen: boolean = false
	let contentRef: HTMLDivElement | null = null
	let dragHandleRef: HTMLDivElement | null = null
	let animation: boolean = true
	let anchorRef: HTMLElement | null = null
	let position: PopoverPosition = PopoverPosition.centerBottom
	let gap: number = 0
	let padding: number = 0
	let pointerX: number = 0
	let pointerY: number = 0
	let important: boolean = false
	let isDragging: boolean = false
	let timeoutScreenSizeId: number | NodeJS.Timeout | null = null
	let timeoutFixPositionId: number | NodeJS.Timeout | null = null
	let screenWidth = body.clientWidth
	let screenHeight = window.innerHeight
	let keyTop = 0
	let keyLeft = 0

	// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function toggleDragging(drag: boolean): void {
		isDragging = drag
		popover.toggleAttribute(PopoverAttributes.dragging, drag)
	}

	function fixPosition(options?: PopoverRepositionDetails): void {
		const popoverRect = popover.getBoundingClientRect()
		const screenWidth = body.clientWidth
		const screenHeight = window.innerHeight
		const [x, y] = [popoverRect.left, popoverRect.top]
		let [left, top] = [x, y]
		if (popoverRect.left < POPOVER_MARGIN) left = POPOVER_MARGIN
		if (popoverRect.top < POPOVER_MARGIN) top = POPOVER_MARGIN
		if (popoverRect.right > screenWidth) left = screenWidth - popoverRect.width - POPOVER_MARGIN
		if (popoverRect.bottom > screenHeight) top = screenHeight - popoverRect.height - POPOVER_MARGIN

		popover.style.setProperty('left', left + 'px')
		popover.style.setProperty('top', top + 'px')
		if (!animationIsOn() || !animation) {
			return options?.done()
		}

		popover.animate({
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

	function open(ev: CustomEvent<PopoverOpenDetails>): void {
		const options = ev.detail
		if (isOpen) return options.done()

		const autofocus = options.autoFocus ?? attributes.autoFocus
		const pointer = options.pointer
		popover.dispatchEvent(new CustomEvent(PopoverEvents.beforeOpen))
		isOpen    = true
		anchorRef = options.anchor ?? attributes.anchor
		important = options.important ?? attributes.important
		position  = options.position ?? attributes.position
		gap       = options.gap ?? attributes.gap
		padding   = options.padding ?? attributes.padding
		pointerX  = pointer?.x ?? POINTER_X
		pointerY  = pointer?.y ?? POINTER_Y
		popover.toggleAttribute(PopoverAttributes.draggable, options.draggable ?? attributes.draggable)
		popover.showPopover()
		if (autofocus) {
			elementFocusAny(popover)
		}

		const popoverRect = popover.getBoundingClientRect()
		const anchorRect = anchorRef?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			gap,
			padding,
			position
		})

		popover.style.setProperty('left', flyoutPosition.left + 'px')
		popover.style.setProperty('top', flyoutPosition.top + 'px')
		if (!animation || !animationIsOn()) {
			return options.done()
		}

		const popoverMidX = flyoutPosition.left + (popoverRect.width / 2)
		const popoverMidY = flyoutPosition.top + (popoverRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : pointerX
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : pointerY
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

		popover.animate({
			transform: [`translate(${translateX}px,${translateY}px)`, 'translate(0,0)'],
			opacity: [0, 1]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			options.done()
		})
	}

	function close(ev: CustomEvent<PopoverCloseDetails>): void {
		const options = ev.detail
		if ((options.soft ?? false) && important && isOpen) {
			return options.done()
		}

		popover.dispatchEvent(new CustomEvent(PopoverEvents.beforeClose))
		const popoverRect = popover.getBoundingClientRect()
		const anchorRect = anchorRef?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			pointer: anchorRect? undefined : {
				x: pointerX,
				y: pointerY
			},
			gap,
			padding,
			position
		})

		if (options.animation === false || !animation || !animationIsOn()) {
			popover.hidePopover()
			return options.done()
		}

		const popoverMidX = flyoutPosition.left + (popoverRect.width / 2)
		const popoverMidY = flyoutPosition.top + (popoverRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : pointerX
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : pointerY
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

		popover.animate({
			transform: ['translate(0,0)', `translate(${translateX}px,${translateY}px)`],
			opacity: [1, 0]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			popover.hidePopover()
			options.done()
		})
	}

	function reposition(ev?: CustomEvent<PopoverRepositionDetails>): void {
		const options = ev?.detail
		if (!anchorRef) {
			return fixPosition(options)
		}

		const popoverRect = popover.getBoundingClientRect()
		const anchorRect = anchorRef.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap,
			position,
			padding
		})

		const [x, y] = [popoverRect.left, popoverRect.top]
		popover.style.setProperty('left', flyoutPosition.left + 'px')
		popover.style.setProperty('top', flyoutPosition.top + 'px')
		if (!animationIsOn() || !animation) {
			return options?.done()
		}

		popover.animate({
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
			const rect = popover.getBoundingClientRect()
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

		popover.style.setProperty('left', keyLeft + 'px')
		popover.style.setProperty('top', keyTop + 'px')
		if (timeoutFixPositionId !== null) clearTimeout(timeoutFixPositionId)

		timeoutFixPositionId = setTimeout(() => {
			fixPosition()
			timeoutFixPositionId = null
		}, 200)
	}

	function dragOnPointerMove(ev: PointerEvent): void {
		if (!isDragging) return

		popover.style.setProperty('left', ev.clientX - diffPositionX + 'px')
		popover.style.setProperty('top', ev.clientY - diffPositionY + 'px')
	}

	function dragOnPointerUp(ev: PointerEvent): void {
		dragHandleRef?.releasePointerCapture(ev.pointerId)
		fixPosition()
		toggleDragging(false)
	}

	function dragOnPointerDown(ev: PointerEvent): void {
		const rect = popover.getBoundingClientRect()
		toggleDragging(true)
		dragHandleRef?.setPointerCapture(ev.pointerId)
		diffPositionX = ev.clientX - rect.x
		diffPositionY = ev.clientY - rect.y
	}

	function dragOnDblClick(): void {
		reposition()
	}

	function popoverOnKeyDown(ev: KeyboardEvent): void {
		if (ev.code !== KEY_ESCAPE || important) return
		if (anchorRef) anchorRef.focus()

		close(new CustomEvent('', {detail: {done(){}}}))
	}

	function initEvents(): void {
		(popover as any).addEventListener(PopoverEvents.attributeChange, (ev: CustomEvent<PopoverAttributeChangeDetail>) => {
			const attr = ev.detail.attributeName
			switch (attr) {
			case PopoverAttributes.anchorBy:
				anchorRef = attributes.anchor ?? anchorRef
				reposition()
				break
			case PopoverAttributes.animation:
				animation = attributes.animation
				break
			case PopoverAttributes.gap:
				gap = attributes.gap
				reposition()
				break
			case PopoverAttributes.important:
				important = attributes.important
				break
			case PopoverAttributes.padding:
				padding = attributes.padding
				reposition()
				break
			case PopoverAttributes.position:
				position = attributes.position
				reposition()
				break
			}
		});
		(popover as any).addEventListener(PopoverEvents.open, open);
		(popover as any).addEventListener(PopoverEvents.close, close);
		popover.addEventListener('toggle', ev => {
			isOpen = (ev as ToggleEvent).newState === "open"
			popover.dispatchEvent(new CustomEvent<PopoverToggleOpenDetail>(
				PopoverEvents.toggleOpen,
				{
					detail: {open: isOpen},
					bubbles: true
				}
			))
			if (isOpen) {
				OPENED_POPOVER.push(popover);
				(popover as any).addEventListener(PopoverEvents.reposition, reposition);
				popover.addEventListener('keydown', popoverOnKeyDown)
				dragHandleRef?.addEventListener('keydown', dragOnKeyDown)
				dragHandleRef?.addEventListener('pointerdown', dragOnPointerDown)
				dragHandleRef?.addEventListener('pointerup', dragOnPointerUp)
				dragHandleRef?.addEventListener('pointermove', dragOnPointerMove)
				dragHandleRef?.addEventListener('dblclick', dragOnDblClick)
			}
			else {
				const index = OPENED_POPOVER.findIndex(v => v === popover)
				if (index >= 0) {
					OPENED_POPOVER.splice(index, 1)
				}

				(popover as any).removeEventListener(PopoverEvents.reposition, reposition);
				popover.removeEventListener('keydown', popoverOnKeyDown)
				dragHandleRef?.removeEventListener('keydown', dragOnKeyDown)
				dragHandleRef?.removeEventListener('pointerdown', dragOnPointerDown)
				dragHandleRef?.removeEventListener('pointerup', dragOnPointerUp)
				dragHandleRef?.removeEventListener('pointermove', dragOnPointerMove)
				dragHandleRef?.removeEventListener('dblclick', dragOnDblClick)
			}
		})
	}

	/**
	 * Expected structure:
	 * ```css
	 * div.c-popover
	 *     > div.c-popover-draghandle
	 *     > div.c-popover-content
	 */
	function checkContentStructure(): void {
		const children = popover.children
		const rest: Element[] = []
		for (let i = 0; i < children.length; i++) {
			const child = children.item(i)!
			if (!dragHandleRef && child.matches('div.' + PopoverClasses.dragHandle)) {
				dragHandleRef = child as HTMLDivElement
			}
			else if (!contentRef && child.matches('div.' + PopoverClasses.content)) {
				contentRef = child as HTMLDivElement
			}
			else {
				rest.push(child)
			}
		}

		if (!dragHandleRef) {
			dragHandleRef = document.createElement('div')
			dragHandleRef.classList.add(PopoverClasses.dragHandle)
		}

		if (!contentRef) {
			contentRef = document.createElement('div')
			contentRef.classList.add(PopoverClasses.content)
		}

		dragHandleRef.tabIndex = 0
		dragHandleRef.draggable = false
		contentRef.append(...rest)
		popover.replaceChildren(contentRef, dragHandleRef)
	}

	checkContentStructure()
	initEvents()
}

async function openPopover(popover: HTMLDivElement, options?: PopoverOpenOptions): Promise<void> {
	return new Promise((done) => popover.dispatchEvent(new CustomEvent(
		PopoverEvents.open,
		{detail: {...options, done} satisfies PopoverOpenDetails}
	)))
}

async function closePopover(popover: HTMLDivElement, options?: PopoverCloseOptions): Promise<void> {
	return new Promise((done) => popover.dispatchEvent(new CustomEvent(
		PopoverEvents.close,
		{detail: {...options, done} satisfies PopoverCloseDetails}
	)))
}

async function repositionPopover(popover: HTMLDivElement): Promise<void> {
	return new Promise((done) => popover.dispatchEvent(new CustomEvent(
		PopoverEvents.reposition,
		{detail: {done} satisfies PopoverRepositionDetails}
	)))
}

function isPopoverOpen(popover: HTMLDivElement): boolean {
	return popover.matches(':popover-open')
}

function createPopover(options?: PopoverUpdateOptions): HTMLDivElement {
	const popover = document.createElement('div')
	return updatePopover(popover, options)
}

function updatePopover(popover: HTMLDivElement, options?: PopoverUpdateOptions): HTMLDivElement {
	popover.classList.add(PopoverClasses.popover)

	if (!popover.hasAttribute('popover')) {
		popover.popover = 'manual'
	}

	if (options?.popover) {
		popover.popover = options.popover
	}

	if (options?.draggable !== undefined) {
		popover.toggleAttribute(PopoverAttributes.draggable, options?.draggable)
	}

	if (options?.important !== undefined) {
		popover.toggleAttribute(PopoverAttributes.important, options?.important)
	}

	if (options?.autoFocus !== undefined) {
		popover.toggleAttribute(PopoverAttributes.autoFocus, options?.autoFocus)
	}

	if (options?.animation !== undefined) {
		popover.setAttribute(PopoverAttributes.animation, String(options.animation))
	}

	if (options?.anchorBy === false) {
		popover.removeAttribute(PopoverAttributes.anchorBy)
	}
	else if (options?.anchorBy && options.anchorBy !== true) {
		popover.setAttribute(PopoverAttributes.anchorBy, options.anchorBy)
	}

	if (options?.gap === false) {
		popover.removeAttribute(PopoverAttributes.gap)
	}
	else if (options?.gap && options.gap !== true) {
		popover.setAttribute(PopoverAttributes.gap, options.gap + '')
	}

	if (options?.padding === false) {
		popover.removeAttribute(PopoverAttributes.padding)
	}
	else if (options?.padding && options.padding !== true) {
		popover.setAttribute(PopoverAttributes.padding, options.padding + '')
	}

	if (options?.position === false) {
		popover.removeAttribute(PopoverAttributes.position)
	}
	else if (options?.position && options.position !== true) {
		popover.setAttribute(PopoverAttributes.position, options.position)
	}

	let content = popover.querySelector(`.${PopoverClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(PopoverClasses.content)
	}

	if (options?.children === false) {
		content.replaceChildren()
	}
	else if (options?.children && options.children !== true) {
		content.replaceChildren(...options.children)
	}

	let dragHandle = popover.querySelector(`.${PopoverClasses.dragHandle}`) as HTMLDivElement | null
	if (!dragHandle) {
		dragHandle = document.createElement('div')
		dragHandle.classList.add(PopoverClasses.dragHandle)
		dragHandle.setAttribute('tabindex', '0')
	}

	popover.replaceChildren(content, dragHandle)
	options?.refs?.content?.(content)
	options?.refs?.popover?.(popover)
	options?.refs?.dragHandle?.(dragHandle)
	return popover
}

function registerPopover(...popovers: HTMLDivElement[]): void {
	initPopoverListener()
	initMutationObserver()
	if (popovers.length === 0) {
		popovers = [...document.querySelectorAll<HTMLDivElement>('div.' + PopoverClasses.popover)]
	}

	for (const popover of popovers){
		if (REGISTERED_POPOVER.some(v => v === popover)) {
			continue
		}

		REGISTERED_POPOVER.push(popover)
		MUTATION_OBSERVER?.observe(popover, {attributeFilter: LISTENED_ATTRIBUTES})
		_initPopover(popover)
	}
}

function unregisterPopover(...popovers: HTMLDivElement[]): void {
	const filtered = REGISTERED_POPOVER.filter(a => popovers.every(b => a !== b))
	MUTATION_OBSERVER?.disconnect()
	REGISTERED_POPOVER.length = 0
	REGISTERED_POPOVER.push(...filtered)
	for (const popover of REGISTERED_POPOVER) {
		MUTATION_OBSERVER?.observe(popover, {attributeFilter: LISTENED_ATTRIBUTES})
	}
}

export {
	type PopoverProps,
	type PopoverUpdateOptions,
	type PopoverOpenOptions,
	type PopoverCloseOptions,
	type PopoverOpenDetails,
	type PopoverCloseDetails,
	type PopoverRepositionDetails,
	type PopoverToggleOpenDetail,
	type PopoverAttributeChangeDetail,
	PopoverEvents,
	PopoverAttributes,
	PopoverClasses,
	openPopover,
	closePopover,
	repositionPopover,
	isPopoverOpen,
	createPopover,
	updatePopover,
	registerPopover,
	unregisterPopover
}