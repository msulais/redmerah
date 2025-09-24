import { AnimationEasing } from "@/enums/animation"
import { KeyboardValue } from "@/enums/keyboard"
import { FlyoutPosition } from "@/enums/position"
import { isAnimationAllowed } from "@/utils/animation"
import { pxToRem, remToPx } from "@/utils/css"
import { getFlyoutPosition } from "@/utils/flyout"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { $rect, $set_style, $add_event, $get_attr, $id, $has_attr, $toggle_attr, $rm_style, $rm_event, $children, $create, $classlist, $is_bool, $is_false, $rm_attr, $is_string, $set_attr, $is_number, $query, $is_array } from "../utils"

export namespace CPopover {
	export type CElement = HTMLDivElement
	export type UpdateOptions = {
		Popover?: {
			children ?: (Node | string)[] | boolean
			anchorBy ?: string | boolean
			draggable?: boolean
			gap      ?: number | boolean
			padding  ?: number | boolean
			position ?: typeof Position | boolean
			popover  ?: 'auto' | 'manual'
			refs     ?: {
				popover   ?(ref: CElement      ): unknown
				content   ?(ref: HTMLDivElement): unknown
				dragHandle?(ref: HTMLDivElement): unknown
			}
		}
	}

	type EventDetails = {
		reposition: {
			done(): void
		}
		attributeChange: {
			attributeName: string | null
		}
	}

	enum Events {
		/** `!bubbles | !cancelable | detail` */
		attributeChange = 'popover:attribute-change',

		/** `!bubbles | !cancelable | detail` */
		reposition = 'popover:reposition',
	}

	export enum Attributes {
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

	export enum Classes {
		popover    = 'c-popover',
		content    = 'c-popover-content',
		dragHandle = 'c-popover-draghandle',
	}

	export enum CSSVars {
		left = '--c-popover-left',
		top = '--c-popover-top',
	}

	export const Position = FlyoutPosition

	const LISTENED_ATTRIBUTES: string[] = [
		Attributes.anchorBy,
		Attributes.gap,
		Attributes.padding,
		Attributes.position,
	]
	const POPOVER_MARGIN = 8
	const OPENED_POPOVER = new Set<CElement>()
	const REGISTERED_POPOVER = new Set<CElement>()
	const MUTATION_OBSERVER = typeof MutationObserver !== 'undefined'
		? new MutationObserver((entries) => { for (const entry of entries) {
			entry.target.dispatchEvent(new CustomEvent<EventDetails['attributeChange']>(
				Events.attributeChange,
				{detail: {attributeName: entry.attributeName}}
			))
		}}) : undefined
	let POINTER_X: number = 0
	let POINTER_Y: number = 0
	let HAS_LISTENER: boolean = false

	export async function reposition(
		ref_popover: CElement,
		outOfBoundOnly: boolean = false
	): Promise<void> {
		if (!outOfBoundOnly) {
			return new Promise((done) => ref_popover.dispatchEvent(
				new CustomEvent<EventDetails['reposition']>(
					Events.reposition, {detail: {done}}
				)
			))
		}

		const rect_popover = $rect(ref_popover)
		const screenWidth = document.body.clientWidth
		const screenHeight = window.innerHeight
		const [x, y] = [rect_popover.left, rect_popover.top]
		let [left, top] = [x, y]
		if (rect_popover.left < POPOVER_MARGIN) left = POPOVER_MARGIN
		if (rect_popover.top < POPOVER_MARGIN) top = POPOVER_MARGIN
		if (rect_popover.right > screenWidth) left = screenWidth - rect_popover.width - POPOVER_MARGIN
		if (rect_popover.bottom > screenHeight) top = screenHeight - rect_popover.height - POPOVER_MARGIN

		$set_style(ref_popover, CSSVars.left, pxToRem(left) + 'rem')
		$set_style(ref_popover, CSSVars.top, pxToRem(top) + 'rem')
		if (!isAnimationAllowed()) {return}

		ref_popover.animate({
			translate: [
				`${pxToRem(x - left)}rem ${pxToRem(y - top)}rem`,
				`0 0`
			]
		}, {
			duration: 250,
			easing: AnimationEasing.spring
		})
	}

	export function open(ref_popover: CElement) {
		return ref_popover.showPopover()
	}

	export function close(ref_popover: CElement) {
		return ref_popover.hidePopover()
	}

	export function isOpen(ref_popover: CElement) {
		return ref_popover.matches(':popover-open')
	}

	function initListener(): void {
		if (HAS_LISTENER) return

		let time_id: NodeJS.Timeout | undefined
		HAS_LISTENER = true

		function handleWindowResize(): void {
			if (OPENED_POPOVER.size === 0) return
			clearTimeout(time_id)
			time_id = setTimeout(async () => {
				for (const popover of OPENED_POPOVER) {
					await reposition(popover)
				}
			}, 100)
		}

		function initEvents(): void {
			$add_event<PointerEvent>(document, 'pointermove', ev => {
				POINTER_X = ev.clientX
				POINTER_Y = ev.clientY
			})
			$add_event(window, 'resize', handleWindowResize)
		}

		initEvents()
	}

	function initPopover(ref_popover: CElement): void {
		const ref_body = document.body
		const attributes = {
			get anchor(): HTMLElement | null {
				const value = $get_attr(ref_popover, Attributes.anchorBy)
				if (!value) return null

				return $id(value)
			},
			get gap(): number {
				const value = $get_attr(ref_popover, Attributes.gap)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get padding(): number {
				const value = $get_attr(ref_popover, Attributes.padding)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get position(): FlyoutPosition {
				const value = $get_attr(ref_popover, Attributes.position)
				if (!value || !isValidEnumValue(value, Position)) {
					return Position.centerBottom
				}

				return value as FlyoutPosition
			},
			get draggable(): boolean {
				return $has_attr(ref_popover, Attributes.draggable)
			},
		}
		let ref_content: HTMLDivElement | null = null
		let ref_draghandle: HTMLDivElement | null = null
		let isDragging: boolean = false
		let time_screensize: NodeJS.Timeout | undefined
		let time_fixposition: NodeJS.Timeout | undefined
		let screenWidth = ref_body.clientWidth
		let screenHeight = window.innerHeight
		let keyTop = 0
		let keyLeft = 0

		// different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
		let diffPositionX: number = 0
		let diffPositionY: number = 0

		function toggleDragging(drag: boolean): void {
			isDragging = drag
			$toggle_attr(ref_popover, Attributes.dragging, drag)
		}

		function fixPosition(options?: EventDetails['reposition']): void {
			const rect_popover = $rect(ref_popover)
			const screenWidth = ref_body.clientWidth
			const screenHeight = window.innerHeight
			const [x, y] = [rect_popover.left, rect_popover.top]
			let [left, top] = [x, y]
			if (rect_popover.left < POPOVER_MARGIN) left = POPOVER_MARGIN
			if (rect_popover.top < POPOVER_MARGIN) top = POPOVER_MARGIN
			if (rect_popover.right > screenWidth) left = screenWidth - rect_popover.width - POPOVER_MARGIN
			if (rect_popover.bottom > screenHeight) top = screenHeight - rect_popover.height - POPOVER_MARGIN

			$set_style(ref_popover, CSSVars.left, pxToRem(left) + 'rem')
			$set_style(ref_popover, CSSVars.top, pxToRem(top) + 'rem')
			if (!isAnimationAllowed()) {
				return options?.done()
			}

			ref_popover.animate({
				translate: [
					`${pxToRem(x - left)}rem ${pxToRem(y - top)}rem`,
					`0 0`
				]
			}, {
				duration: 300,
				easing: AnimationEasing.spring
			}).finished.then(() => {
				options?.done()
			})
		}

		function reposition(ev?: CustomEvent<EventDetails['reposition']>): void {
			const options = ev?.detail
			if (!isOpen(ref_popover)) return

			if (!attributes.anchor) {
				return fixPosition(options)
			}

			const rect_popover = $rect(ref_popover)
			const rect_anchor = $rect(attributes.anchor)
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_popover,
				anchor: rect_anchor,
				gap: remToPx(attributes.gap),
				position: attributes.position,
				padding: remToPx(attributes.padding)
			})

			const [x, y] = [rect_popover.left, rect_popover.top]
			$set_style(ref_popover, CSSVars.left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_popover, CSSVars.top, pxToRem(flyoutPosition.top) + 'rem')
			if (!isAnimationAllowed()) {
				return options?.done()
			}

			ref_popover.animate({
				translate: [
					`${pxToRem(x - flyoutPosition.left)}rem ${pxToRem(y - flyoutPosition.top)}rem`,
					`0 0`
				]
			}, {
				duration: 300,
				easing: AnimationEasing.spring
			}).finished.then(() => {
				options?.done()
			})
		}

		function closeAnimation(): void {
			if (!isAnimationAllowed()) return

			const rect_popover = $rect(ref_popover)
			const rect_anchor = attributes.anchor? $rect(attributes.anchor) : undefined
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_popover,
				anchor: rect_anchor,
				gap: remToPx(attributes.gap),
				position: attributes.position,
				padding: remToPx(attributes.padding),
				pointer: rect_anchor? undefined : {x: POINTER_X, y: POINTER_Y}
			})

			const modalMidX = flyoutPosition.left + (rect_popover.width / 2)
			const modalMidY = flyoutPosition.top + (rect_popover.height / 2)
			const anchorMidX = rect_anchor? (rect_anchor.left + (rect_anchor.width / 2)) : POINTER_X
			const anchorMidY = rect_anchor? (rect_anchor.top + (rect_anchor.height / 2)) : POINTER_Y
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

			ref_popover.animate({
				translate: ['0 0', `${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`],
				opacity: [1, 0]
			}, { duration: 250, easing: AnimationEasing.springBounceInverse })
		}

		function setOpenPosition(): void {
			const rect_popover = $rect(ref_popover)
			const rect_anchor = attributes.anchor? $rect(attributes.anchor) : undefined
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_popover,
				anchor: rect_anchor,
				gap: remToPx(attributes.gap),
				position: attributes.position,
				padding: remToPx(attributes.padding),
				pointer: rect_anchor? undefined : {x: POINTER_X, y: POINTER_Y}
			})

			$set_style(ref_popover, CSSVars.left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_popover, CSSVars.top, pxToRem(flyoutPosition.top) + 'rem')

			// `opacity` property set in 'beforetoggle' event
			$rm_style(ref_popover, 'opacity')
			if (!isAnimationAllowed()) return

			const modalMidX = flyoutPosition.left + (rect_popover.width / 2)
			const modalMidY = flyoutPosition.top + (rect_popover.height / 2)
			const anchorMidX = rect_anchor? (rect_anchor.left + (rect_anchor.width / 2)) : POINTER_X
			const anchorMidY = rect_anchor? (rect_anchor.top + (rect_anchor.height / 2)) : POINTER_Y
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

			ref_popover.animate({
				translate: [`${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`, '0 0'],
				opacity: [0, 1]
			}, { duration: 250, easing: AnimationEasing.springBounce })
		}

		function dragHandleRefOnKeyDown(ev: KeyboardEvent): void {
			const key = ev.key
			if (
				key !== KeyboardValue.arrowUp
				&& key !== KeyboardValue.arrowDown
				&& key !== KeyboardValue.arrowLeft
				&& key !== KeyboardValue.arrowRight
			) return

			const onePercentWidth = screenWidth / 100
			const onePercentHeight = screenHeight / 100
			ev.preventDefault() // disable scroll

			if (time_screensize === null) {
				const rect = $rect(ref_popover)
				keyTop = rect.top
				keyLeft = rect.left
				screenWidth = ref_body.clientWidth
				screenHeight = window.innerHeight
				time_screensize = setTimeout(() => time_screensize = undefined, 1000)
			}

			switch (key) {
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

			$set_style(ref_popover, CSSVars.left, pxToRem(keyLeft) + 'rem')
			$set_style(ref_popover, CSSVars.top, pxToRem(keyTop) + 'rem')
			clearTimeout(time_fixposition)
			time_fixposition = setTimeout(() => {
				fixPosition()
			}, 200)
		}

		function dragHandleRefOnPointerMove(ev: PointerEvent): void {
			if (!isDragging) return

			requestAnimationFrame(() => {
				$set_style(ref_popover, CSSVars.left, pxToRem(ev.clientX - diffPositionX) + 'rem')
				$set_style(ref_popover, CSSVars.top, pxToRem(ev.clientY - diffPositionY) + 'rem')
			})
		}

		function dragHandleRefOnPointerUp(ev: PointerEvent): void {
			ref_draghandle?.releasePointerCapture(ev.pointerId)
			fixPosition()
			toggleDragging(false)
		}

		function dragHandleRefOnPointerDown(ev: PointerEvent): void {
			const rect = ref_popover.getBoundingClientRect()
			toggleDragging(true)
			ref_draghandle?.setPointerCapture(ev.pointerId)
			diffPositionX = ev.clientX - rect.x
			diffPositionY = ev.clientY - rect.y
		}

		function dragHandleRefOnDblClick(): void {
			reposition()
		}

		function initEvents(): void {
			$add_event<CustomEvent<EventDetails['attributeChange']>>(ref_popover, Events.attributeChange, (ev) => {
				const attr = ev.detail.attributeName
				if (!isOpen(ref_popover)) {
					return
				}

				switch (attr) {
				case Attributes.gap:
					reposition()
					break
				case Attributes.padding:
					reposition()
					break
				case Attributes.position:
					reposition()
					break
				}
			})
			$add_event<ToggleEvent>(ref_popover, 'beforetoggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {

					// avoid jump view if animation disabled
					$set_style(ref_popover, 'opacity', '0')
					return
				}

				closeAnimation()
			})
			$add_event<ToggleEvent>(ref_popover, 'toggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {
					setOpenPosition()
					OPENED_POPOVER.add(ref_popover)
					$add_event<CustomEvent<EventDetails["reposition"]>>(
						ref_popover, Events.reposition, reposition
					)
					$add_event(ref_draghandle, 'keydown', dragHandleRefOnKeyDown)
					$add_event(ref_draghandle, 'pointerdown', dragHandleRefOnPointerDown)
					$add_event(ref_draghandle, 'pointerup', dragHandleRefOnPointerUp)
					$add_event(ref_draghandle, 'pointermove', dragHandleRefOnPointerMove)
					$add_event(ref_draghandle, 'dblclick', dragHandleRefOnDblClick)
				}
				else {
					OPENED_POPOVER.delete(ref_popover)
					$rm_event<CustomEvent<EventDetails["reposition"]>>(
						ref_popover, Events.reposition, reposition
					)
					$rm_event(ref_draghandle, 'keydown', dragHandleRefOnKeyDown)
					$rm_event(ref_draghandle, 'pointerdown', dragHandleRefOnPointerDown)
					$rm_event(ref_draghandle, 'pointerup', dragHandleRefOnPointerUp)
					$rm_event(ref_draghandle, 'pointermove', dragHandleRefOnPointerMove)
					$rm_event(ref_draghandle, 'dblclick', dragHandleRefOnDblClick)
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
			const refs_children = ref_popover.children
			const rest: Element[] = []
			for (let i = 0; i < refs_children.length; i++) {
				const ref = refs_children[i]
				if (!ref_draghandle && ref.matches('div.' + Classes.dragHandle)) {
					ref_draghandle = ref as HTMLDivElement
				}
				else if (!ref_content && ref.matches('div.' + Classes.content)) {
					ref_content = ref as HTMLDivElement
				}
				else {
					rest.push(ref)
				}
			}

			if (!ref_draghandle) {
				ref_draghandle = document.createElement('div')
				ref_draghandle.classList.add(Classes.dragHandle)
			}

			if (!ref_content) {
				ref_content = document.createElement('div')
				ref_content.classList.add(Classes.content)
			}

			ref_draghandle.tabIndex = 0
			ref_draghandle.draggable = false
			ref_content.append(...rest)
			$children(ref_popover, ref_content, ref_draghandle)
		}

		checkContentStructure()
		initEvents()
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_popover = update($create('div'), options)
		register(ref_popover)
		return ref_popover
	}

	export function update(ref_popover: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Popover
		$classlist(ref_popover, Classes.popover)

		if (!$has_attr(ref_popover, 'popover')) {
			ref_popover.popover = 'auto'
		}

		const opt_popover = opt?.popover
		if (opt_popover) {
			ref_popover.popover = opt_popover
		}

		const opt_draggable = opt?.draggable
		if ($is_bool(opt_draggable)) {
			$toggle_attr(ref_popover, Attributes.draggable, opt_draggable)
		}

		const opt_anchorBy = opt?.anchorBy
		if ($is_false(opt_anchorBy)) {
			$rm_attr(ref_popover, Attributes.anchorBy)
		}
		else if ($is_string(opt_anchorBy)) {
			$set_attr(ref_popover, Attributes.anchorBy, opt_anchorBy)
		}

		const opt_gap = opt?.gap
		if ($is_false(opt_gap)) {
			$rm_attr(ref_popover, Attributes.gap)
		}
		else if ($is_number(opt_gap)) {
			$set_attr(ref_popover, Attributes.gap, opt_gap + '')
		}

		const opt_padding = opt?.padding
		if ($is_false(opt_padding)) {
			$rm_attr(ref_popover, Attributes.padding)
		}
		else if ($is_number(opt_padding)) {
			$set_attr(ref_popover, Attributes.padding, opt_padding + '')
		}

		const opt_position = opt?.position
		if ($is_false(opt_position)) {
			$rm_attr(ref_popover, Attributes.position)
		}
		else if ($is_string(opt_position)) {
			$set_attr(ref_popover, Attributes.position, opt_position)
		}

		let ref_content = $query<HTMLDivElement>(`.${Classes.content}`, ref_popover)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		let ref_draghandle = $query<HTMLDivElement>(`.${Classes.dragHandle}`, ref_popover)
		if (!ref_draghandle) {
			ref_draghandle = $create('div')
			$classlist(ref_draghandle, Classes.dragHandle)
			$set_attr(ref_draghandle, 'tabindex', '0')
			$set_attr(ref_draghandle, 'draggable', 'false')
		}

		ref_popover.replaceChildren(ref_content, ref_draghandle)
		const refs = opt?.refs
		refs?.content?.(ref_content)
		refs?.popover?.(ref_popover)
		refs?.dragHandle?.(ref_draghandle)
		return ref_popover
	}

	export function register(...refs_popover: CElement[]): void {
		initListener()
		if (refs_popover.length === 0) {
			refs_popover = [...document.querySelectorAll<CElement>('div.' + Classes.popover)]
		}

		for (const ref of refs_popover){
			if (REGISTERED_POPOVER.has(ref)) {
				continue
			}

			REGISTERED_POPOVER.add(ref)
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
			initPopover(ref)
		}
	}

	export function unregister(...refs_popover: CElement[]): void {
		MUTATION_OBSERVER?.disconnect()
		for (const ref of refs_popover) {
			REGISTERED_POPOVER.delete(ref)
		}

		for (const ref of REGISTERED_POPOVER) {
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
		}
	}
}

export type PopoverProps = astroHTML.JSX.DialogHTMLAttributes & {
	PopoverAnchorBy      ?: string
	PopoverDraggable     ?: boolean
	PopoverAutoFocus     ?: boolean
	PopoverAnimation     ?: boolean
	PopoverGap           ?: number
	PopoverPadding       ?: number
	PopoverPosition      ?: FlyoutPosition
	PopoverDragHandleAttr?: astroHTML.JSX.HTMLAttributes
	PopoverContentAttr   ?: astroHTML.JSX.HTMLAttributes
}