import { AnimationEasing } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { getFlyoutPosition } from "@/utils/flyout"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { BodyAttributes, GlobalAttributes } from "@/enums/attributes"
import { KeyboardValue } from "@/enums/keyboard"
import { pxToRem, remToPx } from "@/utils/css"
import { FlyoutPosition } from "@/enums/position"
import { $add_event, $get_attr, $id, $has_attr, $rect, $set_style, $toggle_attr, $set_attr, $rm_attr, $rm_event, $create, $classlist, $children, $is_bool, $is_false, $is_string, $is_number, $query, $is_array, $query_all } from "../utils"

export namespace CModal {
	export type CElement = HTMLDialogElement
	export type UpdateOptions = {
		Modal?: {
			children ?: (Node | string)[] | boolean
			anchorBy ?: string | boolean
			draggable?: boolean
			important?: boolean
			autoFocus?: boolean
			animation?: boolean
			gap      ?: number | boolean
			padding  ?: number | boolean
			position ?: FlyoutPosition | boolean
			refs     ?: {
				modal     ?(ref: CElement  ): unknown
				content   ?(ref: HTMLDivElement): unknown
				dragHandle?(ref: HTMLDivElement): unknown
			}
		}
	}

	type OpenOptions = {
		anchor   ?: HTMLElement
		gap      ?: number
		padding  ?: number
		important?: boolean
		position ?: FlyoutPosition
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

	type CloseOptions = {
		/** if the modal is important, it will not closed */
		soft?: boolean
		animation?: boolean
	}

	export type EventDetails = {
		open: OpenOptions & {
			done: () => void
		}
		close: CloseOptions & {
			done: () => void
		}
		reposition: {
			done: () => void
		}
		focus: {
			done: () => void
		}
		attributeChange: {
			attributeName: string
		}
		toggleOpen: {
			isOpen: boolean
		}
	}

	export enum Events {
		/** `!bubbles | !cancelable | detail: _ModalAttributeChangeEventDetail` */
		AttributeChange = 'modal:attribute-change',

		/** `!bubbles | !cancelable | detail: ModalToggleOpenEventDetail` */
		ToggleOpen      = 'modal:toggle-open',

		/** `!bubbles | !cancelable | detail: _ModalOpenEventDetail` */
		Open            = 'modal:open',

		/** `!bubbles | !cancelable | detail: _ModalCloseEventDetail` */
		Close           = 'modal:close',

		/** `!bubbles | !cancelable | detail: _ModalFocusEventDetail` */
		Focus           = 'modal:focus',

		/** `!bubbles | !cancelable | detail: _ModalRepositionEventDetail` */
		Reposition      = 'modal:reposition',

		/** `!bubbles | !cancelable | !detail` */
		BeforeOpen      = 'modal:before-open',

		/** `!bubbles | !cancelable | !detail` */
		BeforeClose     = 'modal:before-close'
	}

	export enum Attributes {
		/** @param id `string` */
		AnchorBy   = 'data-c-modal-anchorby',

		/** @param value `boolean` */
		Animation  = 'data-c-modal-animation',

		/** Useful for other component */
		Draggable  = 'data-c-modal-draggable',
		Important  = 'data-c-modal-important',
		AutoFocus  = 'data-c-modal-autofocus',
		Focus      = 'data-c-modal-focus',
		Dragging   = 'data-c-modal-dragging',

		/** @param value `number` */
		Gap        = 'data-c-modal-gap',

		/** @param value `number` */
		Padding    = 'data-c-modal-padding',

		/** @param value `ModalPosition` */
		Position   = 'data-c-modal-position',
	}

	export enum Classes {
		Modal      = 'c-modal',
		Content    = 'c-modal-content',
		DragHandle = 'c-modal-draghandle',
	}

	export enum CSSVars {
		Left = '--c-modal-left',
		Top = '--c-modal-top'
	}

	const LISTENED_ATTRIBUTES: string[] = [
		'open',
		Attributes.AnchorBy,
		Attributes.Animation,
		Attributes.Gap,
		Attributes.Important,
		Attributes.Padding,
		Attributes.Position,
	]
	const MODAL_MARGIN = 8

	// !important: Don't use `Set()`. Order matter!
	const OPENED_MODAL: CElement[] = []
	const REGISTERED_MODAL: Set<CElement> = new Set<CElement>()
	const MUTATION_OBSERVER = typeof MutationObserver !== 'undefined'
		? new MutationObserver((entries) => {for (const entry of entries) {
			const attr = entry.attributeName
			if (!attr) continue

			entry.target.dispatchEvent(new CustomEvent<EventDetails['attributeChange']>(
				Events.AttributeChange, {detail: {attributeName: attr}}
			))
		}}) : undefined
	let POINTER_X: number = 0
	let POINTER_Y: number = 0
	let HAS_LISTENER: boolean = false

	function initModalListener(): void {
		if (HAS_LISTENER) return

		let time: number | NodeJS.Timeout | null = null
		let pointerInRange: boolean = false
		HAS_LISTENER = true

		function handleWindowResize(): void {
			if (OPENED_MODAL.length == 0) return
			if (time !== null) clearTimeout(time)

			time = setTimeout(async () => {
				for (const modal of OPENED_MODAL) {
					await reposition(modal)
				}
				time = null
			}, 250)
		}

		function handleOutsideClick(): void {
			if (OPENED_MODAL.length === 0 || pointerInRange) return

			close(OPENED_MODAL[OPENED_MODAL.length-1]!, {soft: true})
		}

		function initEvents(): void {
			$add_event<PointerEvent>(document, 'pointermove', ev => {
				POINTER_X = ev.clientX
				POINTER_Y = ev.clientY
			})
			$add_event(document, 'pointerdown', (ev) => {
				if (OPENED_MODAL.length === 0) return

				pointerInRange = ev.target !== OPENED_MODAL[OPENED_MODAL.length-1]
			})
			$add_event(document, 'pointercancel', handleOutsideClick)
			$add_event(document, 'pointerup', handleOutsideClick)
			$add_event(window, 'resize', handleWindowResize)
		}

		initEvents()
	}

	function initModal(ref_modal: CElement): void {
		const ref_body = document.body
		const attributes = {
			get anchor(): HTMLElement | null {
				const value = $get_attr(ref_modal, Attributes.AnchorBy)
				if (!value) return null

				return $id(value)
			},
			get gap(): number {
				const value = $get_attr(ref_modal, Attributes.Gap)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get padding(): number {
				const value = $get_attr(ref_modal, Attributes.Padding)
				if (!value) return 0

				return safeNumber(Number.parseFloat(value))
			},
			get position(): FlyoutPosition {
				const value = $get_attr(ref_modal, Attributes.Position)
				if (!value || !isValidEnumValue(value, FlyoutPosition)) {
					return FlyoutPosition.CenterBottom
				}

				return value as FlyoutPosition
			},
			get draggable(): boolean {
				return $has_attr(ref_modal, Attributes.Draggable)
			},
			get autoFocus(): boolean {
				return $has_attr(ref_modal, Attributes.AutoFocus)
			},
			get important(): boolean {
				return $has_attr(ref_modal, Attributes.Important)
			},
			get animation(): boolean {
				return ref_modal.getAttribute(Attributes.Animation) !== 'false'
			}
		}
		let ref_content: HTMLDivElement | null = null
		let ref_dragHandle: HTMLDivElement | null = null
		let ref_anchor: HTMLElement | null = null
		let time_focus: number | NodeJS.Timeout | null = null
		let time_screenSize: number | NodeJS.Timeout | null = null
		let time_fixPosition: number | NodeJS.Timeout | null = null
		let isOpen: boolean = false
		let animation: boolean = true
		let position: FlyoutPosition = FlyoutPosition.CenterBottom
		let gap: number = 0
		let padding: number = 0
		let pointerX: number = 0
		let pointerY: number = 0
		let important: boolean = false
		let isDragging: boolean = false
		let screenWidth = ref_body.clientWidth
		let screenHeight = window.innerHeight
		let keyTop = 0
		let keyLeft = 0

		// different of mouse position to top-left of modal position
		// `diffPosition = abs(mousePosition - targetPosition)`
		let diffPositionX: number = 0
		let diffPositionY: number = 0

		function toggleDragging(drag: boolean): void {
			isDragging = drag
			ref_modal.toggleAttribute(Attributes.Dragging, drag)
		}

		function fixPosition(options?: EventDetails['reposition']): void {
			const rect_modal = $rect(ref_modal)
			const screenWidth = ref_body.clientWidth
			const screenHeight = window.innerHeight
			const [x, y] = [rect_modal.left, rect_modal.top]
			let [left, top] = [x, y]
			if (rect_modal.left < MODAL_MARGIN) left = MODAL_MARGIN
			if (rect_modal.top < MODAL_MARGIN) top = MODAL_MARGIN
			if (rect_modal.right > screenWidth) left = screenWidth - rect_modal.width - MODAL_MARGIN
			if (rect_modal.bottom > screenHeight) top = screenHeight - rect_modal.height - MODAL_MARGIN

			$set_style(ref_modal, CSSVars.Left, pxToRem(left) + 'rem')
			$set_style(ref_modal, CSSVars.Top, pxToRem(top) + 'rem')
			if (!isAnimationAllowed() || !animation) {
				return options?.done()
			}

			ref_modal.animate({
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

		function open(ev: CustomEvent<EventDetails['open']>): void {
			const options = ev.detail
			if (isOpen) {
				return options.done()
			}

			const autofocus = options.autoFocus ?? attributes.autoFocus
			const pointer = options.pointer
			isOpen = true
			ref_modal.dispatchEvent(new CustomEvent(Events.BeforeOpen))
			ref_anchor = options.anchor ?? attributes.anchor
			important = options.important ?? attributes.important
			position = options.position ?? attributes.position
			gap = remToPx(options.gap ?? attributes.gap)
			padding = remToPx(options.padding ?? attributes.padding)
			pointerX = typeof pointer?.x === 'number'? remToPx(pointer.x) : POINTER_X
			pointerY = typeof pointer?.y === 'number'? remToPx(pointer.y) : POINTER_Y
			$toggle_attr(ref_modal, Attributes.Draggable, options.draggable ?? attributes.draggable)
			ref_modal.showModal()
			if (!autofocus) {
				ref_modal.focus()
			}

			const rect_modal = $rect(ref_modal)
			const rect_anchor = ref_anchor? $rect(ref_anchor) : undefined
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_modal,
				anchor: rect_anchor,
				pointer: rect_anchor? undefined : {
					x: pointerX,
					y: pointerY
				},
				gap,
				padding,
				position
			})

			$set_style(ref_modal, CSSVars.Left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_modal, CSSVars.Top, pxToRem(flyoutPosition.top) + 'rem')
			if (!animation || !isAnimationAllowed()) {
				return options.done()
			}

			const modalMidX = flyoutPosition.left + (rect_modal.width / 2)
			const modalMidY = flyoutPosition.top + (rect_modal.height / 2)
			const anchorMidX = rect_anchor? (rect_anchor.left + (rect_anchor.width / 2)) : pointerX
			const anchorMidY = rect_anchor? (rect_anchor.top + (rect_anchor.height / 2)) : pointerY
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

			ref_modal.animate({
				translate: [`${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`, '0 0'],
				opacity: [0, 1]
			}, { duration: 300, easing: AnimationEasing.SpringBounce })
			.finished.then(() => {
				options.done()
			})
		}

		function close(ev: CustomEvent<EventDetails['close']>): void {
			const options = ev.detail
			if ((options.soft ?? false) && important && isOpen) {
				options.done()
				return focus()
			}

			ref_modal.dispatchEvent(new CustomEvent(Events.BeforeClose))
			const rect_modal = $rect(ref_modal)
			const rect_anchor = ref_anchor? $rect(ref_anchor) : undefined
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_modal,
				anchor: rect_anchor,
				pointer: rect_anchor? undefined : {
					x: pointerX,
					y: pointerY
				},
				gap,
				padding,
				position
			})

			if (options.animation === false || !animation || !isAnimationAllowed()) {
				ref_modal.close()
				return options.done()
			}

			const modalMidX = flyoutPosition.left + (rect_modal.width / 2)
			const modalMidY = flyoutPosition.top + (rect_modal.height / 2)
			const anchorMidX = rect_anchor? (rect_anchor.left + (rect_anchor.width / 2)) : pointerX
			const anchorMidY = rect_anchor? (rect_anchor.top + (rect_anchor.height / 2)) : pointerY
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

			ref_modal.animate({
				translate: ['0 0', `${pxToRem(translateX)}rem ${pxToRem(translateY)}rem`],
				opacity: [1, 0]
			}, { duration: 300, easing: AnimationEasing.SpringBounce })
			.finished.then(() => {
				ref_modal.close()
				options.done()
			})
		}

		function reposition(ev?: CustomEvent<EventDetails['reposition']>): void {
			const options = ev?.detail
			if (!ref_anchor) {
				return fixPosition(options)
			}

			const rect_modal = $rect(ref_modal)
			const rect_anchor = $rect(ref_anchor)
			const flyoutPosition = getFlyoutPosition({
				flyout: rect_modal,
				anchor: rect_anchor,
				gap,
				position,
				padding
			})

			const [x, y] = [rect_modal.left, rect_modal.top]
			$set_style(ref_modal, CSSVars.Left, pxToRem(flyoutPosition.left) + 'rem')
			$set_style(ref_modal, CSSVars.Top, pxToRem(flyoutPosition.top) + 'rem')
			if (!isAnimationAllowed() || !animation) {
				return options?.done()
			}

			ref_modal.animate({
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

		function focus(ev?: CustomEvent<EventDetails['focus']>): void {
			const options = ev?.detail
			if (time_focus !== null) clearTimeout(time_focus)

			$set_attr(ref_modal, Attributes.Focus, '')
			time_focus = setTimeout(() => {
				$rm_attr(ref_modal, Attributes.Focus)
				time_focus = null
				options?.done()
			}, 1000)
		}

		function ref_dragHandle_onKeyDown(ev: KeyboardEvent): void {
			const code = ev.key
			if (
				code !== KeyboardValue.ArrowUp
				&& code !== KeyboardValue.ArrowDown
				&& code !== KeyboardValue.ArrowLeft
				&& code !== KeyboardValue.ArrowRight
			) return

			const onePercentWidth = screenWidth / 100
			const onePercentHeight = screenHeight / 100
			ev.preventDefault() // disable scroll

			if (time_screenSize === null) {
				const rect = $rect(ref_modal)
				keyTop = rect.top
				keyLeft = rect.left
				screenWidth = ref_body.clientWidth
				screenHeight = window.innerHeight
				time_screenSize = setTimeout(() => time_screenSize = null, 1000)
			}

			switch (code) {
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

			$set_style(ref_modal, CSSVars.Left, pxToRem(keyLeft) + 'rem')
			$set_style(ref_modal, CSSVars.Top, pxToRem(keyTop) + 'rem')
			if (time_fixPosition !== null) clearTimeout(time_fixPosition)

			time_fixPosition = setTimeout(() => {
				fixPosition()
				time_fixPosition = null
			}, 200)
		}

		function ref_dragHandle_onPointerMove(ev: PointerEvent): void {
			if (!isDragging) return

			requestAnimationFrame(() => {
				$set_style(ref_modal, CSSVars.Left, pxToRem(ev.clientX - diffPositionX) + 'rem')
				$set_style(ref_modal, CSSVars.Top, pxToRem(ev.clientY - diffPositionY) + 'rem')
			})
		}

		function ref_dragHandle_onPointerUp(ev: PointerEvent): void {
			ref_dragHandle?.releasePointerCapture(ev.pointerId)
			fixPosition()
			toggleDragging(false)
		}

		function ref_dragHandle_onPointerDown(ev: PointerEvent): void {
			const rect = ref_modal.getBoundingClientRect()
			toggleDragging(true)
			ref_dragHandle?.setPointerCapture(ev.pointerId)
			diffPositionX = ev.clientX - rect.x
			diffPositionY = ev.clientY - rect.y
		}

		function ref_dragHandle_onDblClick(): void {
			reposition()
		}

		function ref_modal_onKeyDown(ev: KeyboardEvent): void {
			const key = ev.key
			if (key === KeyboardValue.Escape
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

		function ref_modal_onCancel(ev: Event): void {
			if (important) {
				return ev.preventDefault()
			}

			close(new CustomEvent<EventDetails['close']>('', {detail: {soft: true, done(){}}}))
			ev.preventDefault()
		}

		function initEvents(): void {
			$add_event<CustomEvent<EventDetails['attributeChange']>>(ref_modal, Events.AttributeChange, ev => {
				const attr = ev.detail.attributeName
				switch (attr) {
				case 'open':
					const ref_body = document.body
					isOpen = ref_modal.open
					ref_modal.dispatchEvent(new CustomEvent<EventDetails['toggleOpen']>(
						Events.ToggleOpen, {detail: {isOpen}}
					))
					if (isOpen) {
						OPENED_MODAL.push(ref_modal)
						$toggle_attr(ref_modal, GlobalAttributes.KeepPointerEvent, true)
						$toggle_attr(ref_body, BodyAttributes.NoPointerEvent, true);

						// @ts-ignore
						$add_event(ref_modal, Events.Focus, focus);

						// @ts-ignore
						$add_event(ref_modal, Events.Reposition, reposition);
						$add_event(ref_modal, 'cancel', ref_modal_onCancel)
						$add_event(ref_modal, 'keydown', ref_modal_onKeyDown)
						$add_event(ref_dragHandle, 'keydown', ref_dragHandle_onKeyDown)
						$add_event(ref_dragHandle, 'pointerdown', ref_dragHandle_onPointerDown)
						$add_event(ref_dragHandle, 'pointerup', ref_dragHandle_onPointerUp)
						$add_event(ref_dragHandle, 'pointermove', ref_dragHandle_onPointerMove)
						$add_event(ref_dragHandle, 'dblclick', ref_dragHandle_onDblClick)
					}
					else {
						const index = OPENED_MODAL.findIndex(v => v === ref_modal)
						$toggle_attr(ref_modal, GlobalAttributes.KeepPointerEvent, false)
						if (index >= 0) {
							OPENED_MODAL.splice(index, 1)
						}
						if (OPENED_MODAL.length === 0) {
							$toggle_attr(ref_body, BodyAttributes.NoPointerEvent, false);
						}

						// @ts-ignore
						$rm_event(ref_modal, Events.Focus, focus);

						// @ts-ignore
						$rm_event(ref_modal, Events.Reposition, reposition);
						$rm_event(ref_modal, 'cancel', ref_modal_onCancel)
						$rm_event(ref_modal, 'keydown', ref_modal_onKeyDown)
						$rm_event(ref_dragHandle, 'keydown', ref_dragHandle_onKeyDown)
						$rm_event(ref_dragHandle, 'pointerdown', ref_dragHandle_onPointerDown)
						$rm_event(ref_dragHandle, 'pointerup', ref_dragHandle_onPointerUp)
						$rm_event(ref_dragHandle, 'pointermove', ref_dragHandle_onPointerMove)
						$rm_event(ref_dragHandle, 'dblclick', ref_dragHandle_onDblClick)
					}
					break
				case Attributes.AnchorBy:
					ref_anchor = attributes.anchor ?? ref_anchor
					reposition()
					break
				case Attributes.Animation:
					animation = attributes.animation
					break
				case Attributes.Gap:
					gap = attributes.gap
					reposition()
					break
				case Attributes.Important:
					important = attributes.important
					break
				case Attributes.Padding:
					padding = attributes.padding
					reposition()
					break
				case Attributes.Position:
					position = attributes.position
					reposition()
					break
				}
			});
			$add_event(ref_modal, Events.Open, open);
			$add_event(ref_modal, Events.Close, close);
		}

		/**
		 * Expected structure:
		 * ```css
		 * dialog.c-modal
		 *     > div.c-modal-content
		 *     > div.c-modal-draghandle
		 */
		function checkContentStructure(): void {
			const children = ref_modal.children
			const rest: Element[] = []
			for (let i = 0; i < children.length; i++) {
				const ref = children[i]!
				if (!ref_dragHandle && ref.matches('div.' + Classes.DragHandle)) {
					ref_dragHandle = ref as HTMLDivElement
				}
				else if (!ref_content && ref.matches('div.' + Classes.Content)) {
					ref_content = ref as HTMLDivElement
				}
				else {
					rest.push(ref)
				}
			}

			if (!ref_dragHandle) {
				ref_dragHandle = $create('div')
				$classlist(ref_dragHandle, Classes.DragHandle)
			}

			if (!ref_content) {
				ref_content = $create('div')
				$classlist(ref_content, Classes.Content)
			}

			ref_dragHandle.tabIndex = 0
			ref_dragHandle.draggable = false
			ref_content.append(...rest)
			$children(ref_modal, ref_content, ref_dragHandle)
		}

		checkContentStructure()
		initEvents()
	}

	export async function open(ref_modal: CElement, options?: OpenOptions): Promise<void> {
		return new Promise((done) => ref_modal.dispatchEvent(new CustomEvent<EventDetails['open']>(
			Events.Open,
			{detail: {...options, done}}
		)))
	}

	export async function close(ref_modal: CElement, options?: CloseOptions): Promise<void> {
		return new Promise((done) => ref_modal.dispatchEvent(new CustomEvent<EventDetails['close']>(
			Events.Close,
			{detail: {...options, done}}
		)))
	}

	export async function reposition(ref_modal: CElement): Promise<void> {
		return new Promise((done) => ref_modal.dispatchEvent(new CustomEvent<EventDetails['reposition']>(
			Events.Reposition,
			{detail: {done}}
		)))
	}

	export async function focus(ref_modal: CElement): Promise<void> {
		return new Promise((done) => ref_modal.dispatchEvent(new CustomEvent<EventDetails['focus']>(
			Events.Focus,
			{detail: {done}}
		)))
	}

	export function isOpen(ref_modal: CElement): boolean {
		return ref_modal.open
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_modal = update($create('dialog'), options)
		register(ref_modal)
		return ref_modal
	}

	export function update(ref_modal: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Modal
		$classlist(ref_modal, Classes.Modal)

		const opt_draggable = opt?.draggable
		if ($is_bool(opt_draggable)) {
			$toggle_attr(ref_modal, Attributes.Draggable, opt_draggable)
		}

		const opt_important = opt?.important
		if ($is_bool(opt_important)) {
			$toggle_attr(ref_modal, Attributes.Important, opt_important)
		}

		const opt_autofocus = opt?.autoFocus
		if ($is_bool(opt_autofocus)) {
			$toggle_attr(ref_modal, Attributes.AutoFocus, opt_autofocus)
		}

		const opt_animation = opt?.animation
		if ($is_bool(opt_animation)) {
			$set_attr(ref_modal, Attributes.Animation, String(opt_animation))
		}

		const opt_anchorBy = opt?.anchorBy
		if ($is_false(opt_anchorBy)) {
			$rm_attr(ref_modal, Attributes.AnchorBy)
		}
		else if ($is_string(opt_anchorBy)) {
			$set_attr(ref_modal, Attributes.AnchorBy, opt_anchorBy)
		}

		const opt_gap = opt?.gap
		if ($is_false(opt_gap)) {
			$rm_attr(ref_modal, Attributes.Gap)
		}
		else if ($is_number(opt_gap)) {
			$set_attr(ref_modal, Attributes.Gap, opt_gap.toString())
		}

		const opt_padding = opt?.padding
		if ($is_false(opt_padding)) {
			$rm_attr(ref_modal, Attributes.Padding)
		}
		else if ($is_number(opt_padding)) {
			$set_attr(ref_modal, Attributes.Padding, opt_padding.toString())
		}

		const opt_position = opt?.position
		if ($is_false(opt_position)) {
			$rm_attr(ref_modal, Attributes.Position)
		}
		else if ($is_string(opt_position) && isValidEnumValue(opt_position, FlyoutPosition)) {
			$set_attr(ref_modal, Attributes.Position, opt_position)
		}

		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_modal)
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

		let ref_dragHandle = $query<HTMLDivElement>(`.${Classes.DragHandle}`, ref_modal)
		if (!ref_dragHandle) {
			ref_dragHandle = $create('div')
			$classlist(ref_dragHandle, Classes.DragHandle)
			$set_attr(ref_dragHandle, 'tabindex', '0')
			$set_attr(ref_dragHandle, 'draggable', 'false')
		}

		$children(ref_modal, ref_content, ref_dragHandle)
		const refs = opt?.refs
		refs?.content?.(ref_content)
		refs?.modal?.(ref_modal)
		refs?.dragHandle?.(ref_dragHandle)
		return ref_modal
	}

	export function register(...refs_modal: CElement[]): void {
		initModalListener()
		if (refs_modal.length === 0) {
			refs_modal = [...$query_all<CElement>('.' + Classes.Modal)]
		}

		for (const ref of refs_modal){
			if (REGISTERED_MODAL.has(ref)) {
				continue
			}

			REGISTERED_MODAL.add(ref)
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
			initModal(ref)
		}
	}

	export function unregister(...refs_modal: CElement[]): void {
		MUTATION_OBSERVER?.disconnect()
		for (const ref of refs_modal) {
			REGISTERED_MODAL.delete(ref)
		}
		for (const ref of REGISTERED_MODAL) {
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
		}
	}
}

export type ModalProps = astroHTML.JSX.DialogHTMLAttributes & {
	ModalAnchorBy      ?: string
	ModalDraggable     ?: boolean
	ModalImportant     ?: boolean
	ModalAutoFocus     ?: boolean
	ModalAnimation     ?: boolean
	ModalGap           ?: number
	ModalPadding       ?: number
	ModalPosition      ?: FlyoutPosition
	ModalDragHandleAttr?: astroHTML.JSX.HTMLAttributes
	ModalContentAttr   ?: astroHTML.JSX.HTMLAttributes
}