import { AnimationEffectTiming } from "@/enums/animation"
import { FlyoutPosition as PopoverPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
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
	PopoverAnchorBy      ?: string
	PopoverDraggable     ?: boolean
	PopoverImportant     ?: boolean
	PopoverAutoFocus     ?: boolean
	PopoverAnimation     ?: boolean
	PopoverGap           ?: number
	PopoverPadding       ?: number
	PopoverPosition      ?: PopoverPosition
	PopoverDragHandleAttr?: astroHTML.JSX.HTMLAttributes
	PopoverContentAttr   ?: astroHTML.JSX.HTMLAttributes
}

type PopoverUpdateOptions = {
	PopoverChildren ?: (Node | string)[] | boolean
	PopoverAnchorBy ?: string | boolean
	PopoverDraggable?: boolean
	PopoverImportant?: boolean
	PopoverAutoFocus?: boolean
	PopoverAnimation?: boolean
	PopoverGap      ?: number | boolean
	PopoverPadding  ?: number | boolean
	PopoverPosition ?: PopoverPosition | boolean
	PopoverPopover  ?: 'auto' | 'manual'
	PopoverRefs     ?: {
		popover   ?(ref: HTMLDivElement): unknown
		content   ?(ref: HTMLDivElement): unknown
		dragHandle?(ref: HTMLDivElement): unknown
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

type _PopoverOpenEventDetail = PopoverOpenOptions & {
	done: () => void
}

type _PopoverCloseEventDetail = PopoverCloseOptions & {
	done: () => void
}

type _PopoverRepositionEventDetail = {
	done: () => void
}

type PopoverToggleOpenEventDetail = {
	open: boolean
}

type _PopoverAttributeChangeEventDetail = {
	attributeName: string | null
}

enum PopoverEvents {
	/** `!bubbles | !cancelable | detail: _PopoverAttributeChangeEventDetail` */
	attributeChange = 'popover:attribute-change',

	/** `!bubbles | !cancelable | detail: PopoverToggleOpenEventDetail` */
	toggleOpen = 'popover:toggle-open',

	/** `!bubbles | !cancelable | detail: _PopoverOpenEventDetail` */
	open = 'popover:open',

	/** `!bubbles | !cancelable | detail: _PopoverCloseEventDetail` */
	close = 'popover:close',

	/** `!bubbles | !cancelable | detail: _PopoverRepositionEventDetail` */
	reposition = 'popover:reposition',

	/** `!bubbles | !cancelable | !detail` */
	beforeOpen = 'popover:before-open',

	/** `!bubbles | !cancelable | !detail` */
	beforeClose = 'popover:before-close'
}

enum PopoverAttributes {
	/** @param id `string` */
	anchorBy  = 'data-c-popover-anchorby',

	/** @param value `boolean` */
	animation = 'data-c-popover-animation',

	/** Useful for other component */
	draggable = 'data-c-popover-draggable',
	important = 'data-c-popover-important',
	autoFocus = 'data-c-popover-autofocus',
	dragging  = 'data-c-popover-dragging',

	/** @param value `number` */
	gap       = 'data-c-popover-gap',

	/** @param value `number` */
	padding   = 'data-c-popover-padding',

	/** @param value `PopoverPosition` */
	position  = 'data-c-popover-position',
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
const OPENED_POPOVER: Set<HTMLDivElement> = new Set<HTMLDivElement>()
const REGISTERED_POPOVER: Set<HTMLDivElement> = new Set<HTMLDivElement>()
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
			entry.target.dispatchEvent(new CustomEvent<_PopoverAttributeChangeEventDetail>(
				PopoverEvents.attributeChange,
				{detail: {
					attributeName: attr
				}}
			))
		}
	})
}

function _initPopoverRefListener(): void {
	if (HAS_LISTENER) return

	let timeoutId: number | NodeJS.Timeout | null = null
	let isPointerClick = false
	const selectedPopoverRefs: Set<HTMLDivElement> = new Set<HTMLDivElement>()
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (OPENED_POPOVER.size === 0) return
		if (timeoutId !== null) clearTimeout(timeoutId)

		timeoutId = setTimeout(async () => {
			for (const popover of OPENED_POPOVER) {
				await repositionPopoverRef(popover)
			}
			timeoutId = null
		}, 100)
	}

	function handleOutsideClick(): void {
		if (OPENED_POPOVER.size === 0 || selectedPopoverRefs.size === 0) return

		for (const popover of selectedPopoverRefs) {
			closePopoverRef(popover, {soft: true})
		}

		selectedPopoverRefs.clear()
	}

	function initEvents(): void {
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
		document.addEventListener('pointerdown', (ev) => {
			isPointerClick = true
			if (OPENED_POPOVER.size === 0) return

			selectedPopoverRefs.clear()
			for (const popoverRef of OPENED_POPOVER) {
				const inRange = popoverRef.contains(ev.target as Node)
				if (inRange) continue

				selectedPopoverRefs.add(popoverRef)
			}
		})

		// handle click not by pointer
		document.addEventListener('click', (ev) => {
			if (OPENED_POPOVER.size === 0) return
			if (!isPointerClick) {
				for (const popoverRef of OPENED_POPOVER) {
					const inRange = popoverRef.contains(ev.target as Node)
					if (inRange) continue

					closePopoverRef(popoverRef, {soft: true})
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

function _initPopoverRef(popoverRef: HTMLDivElement): void {
	const bodyRef = document.body
	const attributes = {
		get anchor(): HTMLElement | null {
			const value = popoverRef.getAttribute(PopoverAttributes.anchorBy)
			if (!value) return null

			return document.getElementById(value)
		},
		get gap(): number {
			const value = popoverRef.getAttribute(PopoverAttributes.gap)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get padding(): number {
			const value = popoverRef.getAttribute(PopoverAttributes.padding)
			if (!value) return 0

			return numberSafe(Number.parseFloat(value))
		},
		get position(): PopoverPosition {
			const value = popoverRef.getAttribute(PopoverAttributes.position)
			if (!value || !validEnumValue(value, PopoverPosition)) return PopoverPosition.centerBottom

			return value as PopoverPosition
		},
		get draggable(): boolean {
			return popoverRef.hasAttribute(PopoverAttributes.draggable)
		},
		get autoFocus(): boolean {
			return popoverRef.hasAttribute(PopoverAttributes.autoFocus)
		},
		get important(): boolean {
			return popoverRef.hasAttribute(PopoverAttributes.important)
		},
		get animation(): boolean {
			return popoverRef.getAttribute(PopoverAttributes.animation) !== 'false'
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
	let screenWidth = bodyRef.clientWidth
	let screenHeight = window.innerHeight
	let keyTop = 0
	let keyLeft = 0

	// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
	let diffPositionX: number = 0
	let diffPositionY: number = 0

	function toggleDragging(drag: boolean): void {
		isDragging = drag
		popoverRef.toggleAttribute(PopoverAttributes.dragging, drag)
	}

	function fixPosition(options?: _PopoverRepositionEventDetail): void {
		const popoverRect = popoverRef.getBoundingClientRect()
		const screenWidth = bodyRef.clientWidth
		const screenHeight = window.innerHeight
		const [x, y] = [popoverRect.left, popoverRect.top]
		let [left, top] = [x, y]
		if (popoverRect.left < POPOVER_MARGIN) left = POPOVER_MARGIN
		if (popoverRect.top < POPOVER_MARGIN) top = POPOVER_MARGIN
		if (popoverRect.right > screenWidth) left = screenWidth - popoverRect.width - POPOVER_MARGIN
		if (popoverRect.bottom > screenHeight) top = screenHeight - popoverRect.height - POPOVER_MARGIN

		popoverRef.style.setProperty('left', left + 'px')
		popoverRef.style.setProperty('top', top + 'px')
		if (!isAnimationAllowed() || !animation) {
			return options?.done()
		}

		popoverRef.animate({
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

	function open(ev: CustomEvent<_PopoverOpenEventDetail>): void {
		const options = ev.detail
		if (isOpen) return options.done()

		const autofocus = options.autoFocus ?? attributes.autoFocus
		const pointer = options.pointer
		popoverRef.dispatchEvent(new CustomEvent(PopoverEvents.beforeOpen, {cancelable: true}))
		isOpen    = true
		anchorRef = options.anchor ?? attributes.anchor
		important = options.important ?? attributes.important
		position  = options.position ?? attributes.position
		gap       = options.gap ?? attributes.gap
		padding   = options.padding ?? attributes.padding
		pointerX  = pointer?.x ?? POINTER_X
		pointerY  = pointer?.y ?? POINTER_Y
		popoverRef.toggleAttribute(PopoverAttributes.draggable, options.draggable ?? attributes.draggable)
		popoverRef.showPopover()
		if (autofocus) {
			elementFocusAny(popoverRef)
		}

		const popoverRect = popoverRef.getBoundingClientRect()
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

		popoverRef.style.setProperty('left', flyoutPosition.left + 'px')
		popoverRef.style.setProperty('top', flyoutPosition.top + 'px')
		if (!animation || !isAnimationAllowed()) {
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

		popoverRef.animate({
			transform: [`translate(${translateX}px,${translateY}px)`, 'translate(0,0)'],
			opacity: [0, 1]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			options.done()
		})
	}

	function close(ev: CustomEvent<_PopoverCloseEventDetail>): void {
		const options = ev.detail
		if ((options.soft ?? false) && important && isOpen) {
			return options.done()
		}

		popoverRef.dispatchEvent(new CustomEvent(PopoverEvents.beforeClose, {cancelable: true}))
		const popoverRect = popoverRef.getBoundingClientRect()
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

		if (options.animation === false || !animation || !isAnimationAllowed()) {
			popoverRef.hidePopover()
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

		popoverRef.animate({
			transform: ['translate(0,0)', `translate(${translateX}px,${translateY}px)`],
			opacity: [1, 0]
		}, { duration: 300, easing: AnimationEffectTiming.springBounce })
		.finished.then(() => {
			popoverRef.hidePopover()
			options.done()
		})
	}

	function reposition(ev?: CustomEvent<_PopoverRepositionEventDetail>): void {
		const options = ev?.detail
		if (!anchorRef) {
			return fixPosition(options)
		}

		const popoverRect = popoverRef.getBoundingClientRect()
		const anchorRect = anchorRef.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap,
			position,
			padding
		})

		const [x, y] = [popoverRect.left, popoverRect.top]
		popoverRef.style.setProperty('left', flyoutPosition.left + 'px')
		popoverRef.style.setProperty('top', flyoutPosition.top + 'px')
		if (!isAnimationAllowed() || !animation) {
			return options?.done()
		}

		popoverRef.animate({
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

	function dragHandleRefOnKeyDown(ev: KeyboardEvent): void {
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
			const rect = popoverRef.getBoundingClientRect()
			keyTop = rect.top
			keyLeft = rect.left
			screenWidth = bodyRef.clientWidth
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

		popoverRef.style.setProperty('left', keyLeft + 'px')
		popoverRef.style.setProperty('top', keyTop + 'px')
		if (timeoutFixPositionId !== null) clearTimeout(timeoutFixPositionId)

		timeoutFixPositionId = setTimeout(() => {
			fixPosition()
			timeoutFixPositionId = null
		}, 200)
	}

	function dragHandleRefOnPointerMove(ev: PointerEvent): void {
		if (!isDragging) return

		popoverRef.style.setProperty('left', ev.clientX - diffPositionX + 'px')
		popoverRef.style.setProperty('top', ev.clientY - diffPositionY + 'px')
	}

	function dragHandleRefOnPointerUp(ev: PointerEvent): void {
		dragHandleRef?.releasePointerCapture(ev.pointerId)
		fixPosition()
		toggleDragging(false)
	}

	function dragHandleRefOnPointerDown(ev: PointerEvent): void {
		const rect = popoverRef.getBoundingClientRect()
		toggleDragging(true)
		dragHandleRef?.setPointerCapture(ev.pointerId)
		diffPositionX = ev.clientX - rect.x
		diffPositionY = ev.clientY - rect.y
	}

	function dragHandleRefOnDblClick(): void {
		reposition()
	}

	function popoverRefOnKeyDown(ev: KeyboardEvent): void {
		if (ev.code !== KEY_ESCAPE || important) return
		if (anchorRef) anchorRef.focus()

		close(new CustomEvent('', {detail: {done(){}}}))
	}

	function initEvents(): void {
		popoverRef.addEventListener(PopoverEvents.attributeChange as any, (ev: CustomEvent<_PopoverAttributeChangeEventDetail>) => {
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
		})
		popoverRef.addEventListener(PopoverEvents.open as any, open);
		popoverRef.addEventListener(PopoverEvents.close as any, close);
		popoverRef.addEventListener('toggle', ev => {
			isOpen = (ev as ToggleEvent).newState === "open"
			popoverRef.dispatchEvent(new CustomEvent<PopoverToggleOpenEventDetail>(
				PopoverEvents.toggleOpen,
				{detail: {open: isOpen}}
			))
			if (isOpen) {
				OPENED_POPOVER.add(popoverRef)
				popoverRef.addEventListener(PopoverEvents.reposition as any, reposition);
				popoverRef.addEventListener('keydown', popoverRefOnKeyDown)
				dragHandleRef?.addEventListener('keydown', dragHandleRefOnKeyDown)
				dragHandleRef?.addEventListener('pointerdown', dragHandleRefOnPointerDown)
				dragHandleRef?.addEventListener('pointerup', dragHandleRefOnPointerUp)
				dragHandleRef?.addEventListener('pointermove', dragHandleRefOnPointerMove)
				dragHandleRef?.addEventListener('dblclick', dragHandleRefOnDblClick)
			}
			else {
				OPENED_POPOVER.delete(popoverRef)
				popoverRef.removeEventListener(PopoverEvents.reposition as any, reposition);
				popoverRef.removeEventListener('keydown', popoverRefOnKeyDown)
				dragHandleRef?.removeEventListener('keydown', dragHandleRefOnKeyDown)
				dragHandleRef?.removeEventListener('pointerdown', dragHandleRefOnPointerDown)
				dragHandleRef?.removeEventListener('pointerup', dragHandleRefOnPointerUp)
				dragHandleRef?.removeEventListener('pointermove', dragHandleRefOnPointerMove)
				dragHandleRef?.removeEventListener('dblclick', dragHandleRefOnDblClick)
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
		const children = popoverRef.children
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
		popoverRef.replaceChildren(contentRef, dragHandleRef)
	}

	checkContentStructure()
	initEvents()
}

async function openPopoverRef(popoverRef: HTMLDivElement, options?: PopoverOpenOptions): Promise<void> {
	return new Promise((done) => popoverRef.dispatchEvent(new CustomEvent(
		PopoverEvents.open,
		{detail: {...options, done} satisfies _PopoverOpenEventDetail}
	)))
}

async function closePopoverRef(popoverRef: HTMLDivElement, options?: PopoverCloseOptions): Promise<void> {
	return new Promise((done) => popoverRef.dispatchEvent(new CustomEvent(
		PopoverEvents.close,
		{detail: {...options, done} satisfies _PopoverCloseEventDetail}
	)))
}

async function repositionPopoverRef(popoverRef: HTMLDivElement): Promise<void> {
	return new Promise((done) => popoverRef.dispatchEvent(new CustomEvent(
		PopoverEvents.reposition,
		{detail: {done} satisfies _PopoverRepositionEventDetail}
	)))
}

function isPopoverRefOpen(popoverRef: HTMLDivElement): boolean {
	return popoverRef.matches(':popover-open')
}

function createPopoverRef(options?: PopoverUpdateOptions): HTMLDivElement {
	const popover = document.createElement('div')
	return updatePopoverRef(popover, options)
}

function updatePopoverRef(popoverRef: HTMLDivElement, options?: PopoverUpdateOptions): HTMLDivElement {
	popoverRef.classList.add(PopoverClasses.popover)

	if (!popoverRef.hasAttribute('popover')) {
		popoverRef.popover = 'manual'
	}

	if (options?.PopoverPopover) {
		popoverRef.popover = options.PopoverPopover
	}

	const draggableOption = options?.PopoverDraggable
	if (draggableOption !== undefined) {
		popoverRef.toggleAttribute(PopoverAttributes.draggable, draggableOption)
	}

	const importantOption = options?.PopoverImportant
	if (importantOption !== undefined) {
		popoverRef.toggleAttribute(PopoverAttributes.important, importantOption)
	}

	const autoFocusOption = options?.PopoverAutoFocus
	if (autoFocusOption !== undefined) {
		popoverRef.toggleAttribute(PopoverAttributes.autoFocus, autoFocusOption)
	}

	const animationOption = options?.PopoverAnimation
	if (animationOption !== undefined) {
		popoverRef.setAttribute(PopoverAttributes.animation, String(animationOption))
	}

	const anchorByOption = options?.PopoverAnchorBy
	if (anchorByOption === false) {
		popoverRef.removeAttribute(PopoverAttributes.anchorBy)
	}
	else if (anchorByOption !== undefined && anchorByOption !== true) {
		popoverRef.setAttribute(PopoverAttributes.anchorBy, anchorByOption)
	}

	const gapOption = options?.PopoverGap
	if (gapOption === false) {
		popoverRef.removeAttribute(PopoverAttributes.gap)
	}
	else if (gapOption !== undefined && gapOption !== true) {
		popoverRef.setAttribute(PopoverAttributes.gap, gapOption + '')
	}

	const paddingOption = options?.PopoverPadding
	if (paddingOption === false) {
		popoverRef.removeAttribute(PopoverAttributes.padding)
	}
	else if (paddingOption !== undefined && paddingOption !== true) {
		popoverRef.setAttribute(PopoverAttributes.padding, paddingOption + '')
	}

	const positionOption = options?.PopoverPosition
	if (positionOption === false) {
		popoverRef.removeAttribute(PopoverAttributes.position)
	}
	else if (positionOption !== undefined && positionOption !== true) {
		popoverRef.setAttribute(PopoverAttributes.position, positionOption)
	}

	let contentRef = popoverRef.querySelector<HTMLDivElement>(`.${PopoverClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(PopoverClasses.content)
	}

	const childrenOption = options?.PopoverChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	let dragHandleRef = popoverRef.querySelector<HTMLDivElement>(`.${PopoverClasses.dragHandle}`)
	if (!dragHandleRef) {
		dragHandleRef = document.createElement('div')
		dragHandleRef.classList.add(PopoverClasses.dragHandle)
		dragHandleRef.setAttribute('tabindex', '0')
		dragHandleRef.setAttribute('draggable', 'false')
	}

	popoverRef.replaceChildren(contentRef, dragHandleRef)
	options?.PopoverRefs?.content?.(contentRef)
	options?.PopoverRefs?.popover?.(popoverRef)
	options?.PopoverRefs?.dragHandle?.(dragHandleRef)
	return popoverRef
}

function registerPopoverRef(...popoverRefs: HTMLDivElement[]): void {
	_initPopoverRefListener()
	_initMutationObserver()
	if (popoverRefs.length === 0) {
		popoverRefs = [...document.querySelectorAll<HTMLDivElement>('div.' + PopoverClasses.popover)]
	}

	for (const popoverRef of popoverRefs){
		if (REGISTERED_POPOVER.has(popoverRef)) {
			continue
		}

		REGISTERED_POPOVER.add(popoverRef)
		MUTATION_OBSERVER?.observe(popoverRef, {attributeFilter: LISTENED_ATTRIBUTES})
		_initPopoverRef(popoverRef)
	}
}

function unregisterPopoverRef(...popoverRefs: HTMLDivElement[]): void {
	MUTATION_OBSERVER?.disconnect()
	for (const popoverRef of popoverRefs) {
		REGISTERED_POPOVER.delete(popoverRef)
	}

	for (const popoverRef of REGISTERED_POPOVER) {
		MUTATION_OBSERVER?.observe(popoverRef, {attributeFilter: LISTENED_ATTRIBUTES})
	}
}

export {
	type PopoverProps,
	type PopoverUpdateOptions,
	type PopoverOpenOptions,
	type PopoverCloseOptions,
	type PopoverToggleOpenEventDetail,
	PopoverEvents,
	PopoverAttributes,
	PopoverClasses,
	PopoverPosition,
	openPopoverRef,
	closePopoverRef,
	repositionPopoverRef,
	isPopoverRefOpen,
	createPopoverRef,
	updatePopoverRef,
	registerPopoverRef,
	unregisterPopoverRef
}