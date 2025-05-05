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
} from "@/constants/key-code"

type PopoverProps = astroHTML.JSX.DialogHTMLAttributes & {
	PopoverAnchorBy      ?: string
	PopoverDraggable     ?: boolean
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

type _PopoverRepositionEventDetail = {
	done: () => void
}

type _PopoverAttributeChangeEventDetail = {
	attributeName: string | null
}

enum _PopoverEvents {
	/** `!bubbles | !cancelable | detail: _PopoverAttributeChangeEventDetail` */
	attributeChange = 'popover:attribute-change',

	/** `!bubbles | !cancelable | detail: _PopoverRepositionEventDetail` */
	reposition = 'popover:reposition',
}

enum PopoverAttributes {
	/** @param id `string` */
	anchorBy  = 'data-c-popover-anchorby',

	/** Useful for other component */
	draggable = 'data-c-popover-draggable',
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
	PopoverAttributes.gap,
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
				_PopoverEvents.attributeChange,
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
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (OPENED_POPOVER.size === 0) return
		if (timeoutId !== null) clearTimeout(timeoutId)

		timeoutId = setTimeout(async () => {
			timeoutId = null
			for (const popover of OPENED_POPOVER) {
				await repositionPopoverRef(popover)
			}
		}, 100)
	}

	function initEvents(): void {
		document.addEventListener('pointermove', ev => {
			POINTER_X = ev.clientX
			POINTER_Y = ev.clientY
		})
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
	}
	let contentRef: HTMLDivElement | null = null
	let dragHandleRef: HTMLDivElement | null = null
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
		if (!isAnimationAllowed()) {
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

	function reposition(ev?: CustomEvent<_PopoverRepositionEventDetail>): void {
		const options = ev?.detail
		if (!isPopoverRefOpen(popoverRef)) return

		if (!attributes.anchor) {
			return fixPosition(options)
		}

		const popoverRect = popoverRef.getBoundingClientRect()
		const anchorRect = attributes.anchor.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap: attributes.gap,
			position: attributes.position,
			padding: attributes.padding
		})

		const [x, y] = [popoverRect.left, popoverRect.top]
		popoverRef.style.setProperty('left', flyoutPosition.left + 'px')
		popoverRef.style.setProperty('top', flyoutPosition.top + 'px')
		if (!isAnimationAllowed()) {
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

	function closeAnimation(): void {
		if (!isAnimationAllowed()) return

		const popoverRect = popoverRef.getBoundingClientRect()
		const anchorRect = attributes.anchor?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap: attributes.gap,
			position: attributes.position,
			padding: attributes.padding,
			pointer: anchorRect? undefined : {x: POINTER_X, y: POINTER_Y}
		})

		const modalMidX = flyoutPosition.left + (popoverRect.width / 2)
		const modalMidY = flyoutPosition.top + (popoverRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : POINTER_X
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : POINTER_Y
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

		popoverRef.animate({
			transform: ['translate(0,0)', `translate(${translateX}px,${translateY}px)`],
			opacity: [1, 0]
		}, { duration: 250, easing: AnimationEffectTiming.springBounce })
	}

	function setOpenPosition(): void {
		const popoverRect = popoverRef.getBoundingClientRect()
		const anchorRect = attributes.anchor?.getBoundingClientRect()
		const flyoutPosition = getFlyoutPosition({
			flyout: popoverRect,
			anchor: anchorRect,
			gap: attributes.gap,
			position: attributes.position,
			padding: attributes.padding,
			pointer: anchorRect? undefined : {x: POINTER_X, y: POINTER_Y}
		})

		popoverRef.style.setProperty('left', flyoutPosition.left + 'px')
		popoverRef.style.setProperty('top', flyoutPosition.top + 'px')

		// `visibility` property set in 'beforetoggle' event
		popoverRef.style.removeProperty('visibility')
		if (!isAnimationAllowed()) return

		const modalMidX = flyoutPosition.left + (popoverRect.width / 2)
		const modalMidY = flyoutPosition.top + (popoverRect.height / 2)
		const anchorMidX = anchorRect? (anchorRect.left + (anchorRect.width / 2)) : POINTER_X
		const anchorMidY = anchorRect? (anchorRect.top + (anchorRect.height / 2)) : POINTER_Y
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

		popoverRef.animate({
			transform: [`translate(${translateX}px,${translateY}px)`, 'translate(0,0)'],
			opacity: [0, 1]
		}, { duration: 250, easing: AnimationEffectTiming.springBounce })
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

	function initEvents(): void {
		popoverRef.addEventListener(_PopoverEvents.attributeChange as any, (ev: CustomEvent<_PopoverAttributeChangeEventDetail>) => {
			const attr = ev.detail.attributeName
			if (!isPopoverRefOpen(popoverRef)) {
				return
			}

			switch (attr) {
			case PopoverAttributes.gap:
				reposition()
				break
			case PopoverAttributes.padding:
				reposition()
				break
			case PopoverAttributes.position:
				reposition()
				break
			}
		})
		popoverRef.addEventListener('beforetoggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {

				// avoid jump view if animation disabled
				popoverRef.style.setProperty('visibility', 'hidden')
				return
			}

			closeAnimation()
		})
		popoverRef.addEventListener('toggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === "open"
			if (isOpen) {
				setOpenPosition()
				OPENED_POPOVER.add(popoverRef)
				popoverRef.addEventListener(_PopoverEvents.reposition as any, reposition);
				dragHandleRef?.addEventListener('keydown', dragHandleRefOnKeyDown)
				dragHandleRef?.addEventListener('pointerdown', dragHandleRefOnPointerDown)
				dragHandleRef?.addEventListener('pointerup', dragHandleRefOnPointerUp)
				dragHandleRef?.addEventListener('pointermove', dragHandleRefOnPointerMove)
				dragHandleRef?.addEventListener('dblclick', dragHandleRefOnDblClick)
			}
			else {
				OPENED_POPOVER.delete(popoverRef)
				popoverRef.removeEventListener(_PopoverEvents.reposition as any, reposition);
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

function openPopoverRef(popoverRef: HTMLDivElement): void {
	popoverRef.showPopover()
}

function closePopoverRef(popoverRef: HTMLDivElement): void {
	popoverRef.hidePopover()
}

async function repositionPopoverRef(popoverRef: HTMLDivElement): Promise<void> {
	return new Promise((done) => popoverRef.dispatchEvent(new CustomEvent(
		_PopoverEvents.reposition,
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
		popoverRef.popover = 'auto'
	}

	if (options?.PopoverPopover) {
		popoverRef.popover = options.PopoverPopover
	}

	const draggableOption = options?.PopoverDraggable
	if (draggableOption !== undefined) {
		popoverRef.toggleAttribute(PopoverAttributes.draggable, draggableOption)
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