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
		AttributeChange = 'popover:attribute-change',

		/** `!bubbles | !cancelable | detail` */
		Reposition = 'popover:reposition',
	}

	export enum Attributes {
		/** @param id `string` */
		AnchorBy  = 'data-c-popover-anchorby',

		/** Useful for other component */
		Draggable = 'data-c-popover-draggable',
		Dragging  = 'data-c-popover-dragging',

		/** @param value `number` */
		Gap       = 'data-c-popover-gap',

		/** @param value `number` */
		Padding   = 'data-c-popover-padding',

		/** @param value `PopoverPosition` */
		Position  = 'data-c-popover-position',
	}

	export enum Classes {
		Popover    = 'c-popover',
		Content    = 'c-popover-content',
		DragHandle = 'c-popover-draghandle',
	}

	export enum CSSVars {
		Left = '--c-popover-left',
		Top = '--c-popover-top',
	}

	export const Position = FlyoutPosition

	const LISTENED_ATTRIBUTES: string[] = [
		Attributes.AnchorBy,
		Attributes.Gap,
		Attributes.Padding,
		Attributes.Position,
	]
	const POPOVER_MARGIN = 8
	const OPENED_POPOVER = new Set<CElement>()
	const REGISTERED_POPOVER = new Set<CElement>()
	const MUTATION_OBSERVER = typeof MutationObserver !== 'undefined'
		? new MutationObserver((entries) => { for (const entry of entries) {
			entry.target.dispatchEvent(new CustomEvent<EventDetails['attributeChange']>(
				Events.AttributeChange,
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
					Events.Reposition, {detail: {done}}
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

		$set_style(ref_popover, CSSVars.Left, pxToRem(left) + 'rem')
		$set_style(ref_popover, CSSVars.Top, pxToRem(top) + 'rem')
		if (!isAnimationAllowed()) {return}

		ref_popover.animate({
			translate: [
				`${pxToRem(x - left)}rem ${pxToRem(y - top)}rem`,
				`0 0`
			]
		}, {
			duration: 250,
			easing: AnimationEasing.Spring
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
				const value = $get_attr(ref_popover, Attributes.AnchorBy)
				if (!value) return null

				return $id(value)
			},
			get gap(): number {
				const value = $get_attr(ref_popover, Attributes.Gap)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get padding(): number {
				const value = $get_attr(ref_popover, Attributes.Padding)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get position(): FlyoutPosition {
				const value = $get_attr(ref_popover, Attributes.Position)
				if (!value || !isValidEnumValue(value, Position)) {
					return Position.CenterBottom
				}

				return value as FlyoutPosition
			},
			get draggable(): boolean {
				return $has_attr(ref_popover, Attributes.Draggable)
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
			$toggle_attr(ref_popover, Attributes.Dragging, drag)
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

			$set_style(ref_popover, CSSVars.Left, pxToRem(left) + 'rem')
			$set_style(ref_popover, CSSVars.Top, pxToRem(top) + 'rem')
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
				easing: AnimationEasing.Spring
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
			$set_style(ref_popover, CSSVars.Left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_popover, CSSVars.Top, pxToRem(flyoutPosition.top) + 'rem')
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
				easing: AnimationEasing.Spring
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
			}, { duration: 250, easing: AnimationEasing.SpringBounceInverse })
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

			$set_style(ref_popover, CSSVars.Left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_popover, CSSVars.Top, pxToRem(flyoutPosition.top) + 'rem')

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
			}, { duration: 250, easing: AnimationEasing.SpringBounce })
		}

		function dragHandleRefOnKeyDown(ev: KeyboardEvent): void {
			const key = ev.key
			if (
				key !== KeyboardValue.ArrowUp
				&& key !== KeyboardValue.ArrowDown
				&& key !== KeyboardValue.ArrowLeft
				&& key !== KeyboardValue.ArrowRight
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
			case KeyboardValue.ArrowUp:
				keyTop -= onePercentHeight
				break
			case KeyboardValue.ArrowDown:
				keyTop += onePercentHeight
				break
			case KeyboardValue.ArrowLeft:
				keyLeft -= onePercentWidth
				break
			case KeyboardValue.ArrowRight:
				keyLeft += onePercentWidth
				break
			}

			$set_style(ref_popover, CSSVars.Left, pxToRem(keyLeft) + 'rem')
			$set_style(ref_popover, CSSVars.Top, pxToRem(keyTop) + 'rem')
			clearTimeout(time_fixposition)
			time_fixposition = setTimeout(() => {
				fixPosition()
			}, 200)
		}

		function dragHandleRefOnPointerMove(ev: PointerEvent): void {
			if (!isDragging) return

			requestAnimationFrame(() => {
				$set_style(ref_popover, CSSVars.Left, pxToRem(ev.clientX - diffPositionX) + 'rem')
				$set_style(ref_popover, CSSVars.Top, pxToRem(ev.clientY - diffPositionY) + 'rem')
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
			$add_event<CustomEvent<EventDetails['attributeChange']>>(ref_popover, Events.AttributeChange, (ev) => {
				const attr = ev.detail.attributeName
				if (!isOpen(ref_popover)) {
					return
				}

				switch (attr) {
				case Attributes.Gap:
					reposition()
					break
				case Attributes.Padding:
					reposition()
					break
				case Attributes.Position:
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
						ref_popover, Events.Reposition, reposition
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
						ref_popover, Events.Reposition, reposition
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
				if (!ref_draghandle && ref.matches('div.' + Classes.DragHandle)) {
					ref_draghandle = ref as HTMLDivElement
				}
				else if (!ref_content && ref.matches('div.' + Classes.Content)) {
					ref_content = ref as HTMLDivElement
				}
				else {
					rest.push(ref)
				}
			}

			if (!ref_draghandle) {
				ref_draghandle = document.createElement('div')
				ref_draghandle.classList.add(Classes.DragHandle)
			}

			if (!ref_content) {
				ref_content = document.createElement('div')
				ref_content.classList.add(Classes.Content)
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
		$classlist(ref_popover, Classes.Popover)

		if (!$has_attr(ref_popover, 'popover')) {
			ref_popover.popover = 'auto'
		}

		const opt_popover = opt?.popover
		if (opt_popover) {
			ref_popover.popover = opt_popover
		}

		const opt_draggable = opt?.draggable
		if ($is_bool(opt_draggable)) {
			$toggle_attr(ref_popover, Attributes.Draggable, opt_draggable)
		}

		const opt_anchorBy = opt?.anchorBy
		if ($is_false(opt_anchorBy)) {
			$rm_attr(ref_popover, Attributes.AnchorBy)
		}
		else if ($is_string(opt_anchorBy)) {
			$set_attr(ref_popover, Attributes.AnchorBy, opt_anchorBy)
		}

		const opt_gap = opt?.gap
		if ($is_false(opt_gap)) {
			$rm_attr(ref_popover, Attributes.Gap)
		}
		else if ($is_number(opt_gap)) {
			$set_attr(ref_popover, Attributes.Gap, opt_gap + '')
		}

		const opt_padding = opt?.padding
		if ($is_false(opt_padding)) {
			$rm_attr(ref_popover, Attributes.Padding)
		}
		else if ($is_number(opt_padding)) {
			$set_attr(ref_popover, Attributes.Padding, opt_padding + '')
		}

		const opt_position = opt?.position
		if ($is_false(opt_position)) {
			$rm_attr(ref_popover, Attributes.Position)
		}
		else if ($is_string(opt_position)) {
			$set_attr(ref_popover, Attributes.Position, opt_position)
		}

		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_popover)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		let ref_draghandle = $query<HTMLDivElement>(`.${Classes.DragHandle}`, ref_popover)
		if (!ref_draghandle) {
			ref_draghandle = $create('div')
			$classlist(ref_draghandle, Classes.DragHandle)
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
			refs_popover = [...document.querySelectorAll<CElement>('div.' + Classes.Popover)]
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