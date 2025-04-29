import {
	KEY_ARROW_DOWN,
	KEY_ARROW_UP,
	KEY_ENTER,
	KEY_ESCAPE,
	KEY_SPACE
} from "@/constants/keyboard-value"
import { AnimationEffectTiming } from "@/enums/animation"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"
import { createId } from "@/utils/ids"
import { isAnimationAllowed } from "@/utils/animation"

import { createIconRef, type IconProps } from "@/native-components/Icon"
import {
	type ButtonProps,
	type ButtonUpdateOptions,
	ButtonClasses,
	createButtonRef,
	updateButtonRef,
} from "@/native-components/Button"

type SelectProps = astroHTML.JSX.HTMLAttributes & {
	SelectVariant        ?: SelectVariant
	SelectUseIcon        ?: boolean
	SelectContentAttr    ?: astroHTML.JSX.HTMLAttributes
	SelectPopoverAttr    ?: astroHTML.JSX.HTMLAttributes
	SelectPlaceholderAttr?: astroHTML.JSX.HTMLAttributes
	SelectIconAttr       ?: Omit<IconProps, 'IconCode'>
}

type SelectOptionProps = Omit<ButtonProps, 'value'> & {
	SelectOptionSelected?: boolean
	value                : string
}

type SelectUpdateOptions = {
	SelectChildren   ?: (string | Node)[] | boolean
	SelectPlaceholder?: (string | Node)[] | boolean
	SelectVariant    ?: SelectVariant | boolean
	SelectRole       ?: astroHTML.JSX.AriaRole | boolean
	SelectUseIcon    ?: boolean
	SelectRefs       ?: {
		select     ?(ref: HTMLDivElement): unknown
		content    ?(ref: HTMLDivElement): unknown
		popover    ?(ref: HTMLDivElement): unknown
		placeholder?(ref: HTMLDivElement): unknown
		icon       ?(ref: HTMLElement   ): unknown
	}
}

type SelectOptionUpdateOptions = ButtonUpdateOptions & {
	SelectOptionValue   ?: string
	SelectOptionSelected?: boolean
	SelectOptionRole    ?: astroHTML.JSX.AriaRole | boolean
	SelectOptionRefs    ?: {
		option?(ref: HTMLButtonElement): unknown
	}
}

enum SelectClasses {
	select      = 'c-select',
	popover     = select + '-popover',
	content     = select + '-content',
	option      = select + '-option',
	placeholder = select + '-placeholder',
	icon        = select + '-icon'
}

enum SelectAttributes {
	expanded = 'data-c-select-expanded',
	variant  = 'data-c-select-variant',
	useIcon  = 'data-c-select-use-icon',
	value    = 'data-c-select-value'
}

enum SelectEvents {
	/** `bubbles | !cancelable | !detail` */
	change = 'select:change'
}

enum SelectVariant {
	filled      = 'filled',
	outlined    = 'outlined',
	tonal       = 'tonal',
	transparent = 'transparent',
}

const REGISTERED_SELECT: Set<HTMLDivElement> = new Set<HTMLDivElement>()
let OPENED_SELECT: HTMLDivElement | null = null
let SELECTED_OPTION_COPY: HTMLElement | null = null
let HAS_LISTENER: boolean = false

function checkSelectedOptionRefs(selectRef: HTMLDivElement, ...options: HTMLButtonElement[]): void {
	if (options.length === 0) {
		options.push(...selectRef.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
	}

	const selectedOptionRefs = options.filter(o => {
		const selected = o.getAttribute('aria-selected') === 'true'
		const disabled = o.disabled
		return selected && !disabled
	})
	if (selectedOptionRefs.length === 0) return

	selectRef.setAttribute('aria-activedescendant', selectedOptionRefs[0].id)
	selectRef.setAttribute(SelectAttributes.value, selectedOptionRefs[0].value)
	for (let i = 1; i < selectedOptionRefs.length; i++) {
		selectedOptionRefs[i].setAttribute('aria-selected', 'false')
	}
}

function repairOptionRefs(selectRef: HTMLDivElement, ...optionRefs: HTMLButtonElement[]): void {
	if (optionRefs.length === 0) {
		optionRefs.push(...selectRef.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
	}

	for (const optionRef of optionRefs) {
		// id
		let id = optionRef.id
		if (!id) {
			optionRef.id = createId()
		}

		// aria-selected
		const ariaSelected = optionRef.getAttribute('aria-selected')
		if (!ariaSelected || !['true', 'false'].includes(ariaSelected)) {
			optionRef.setAttribute('aria-selected', 'false')
		}
	}

	checkSelectedOptionRefs(selectRef, ...optionRefs)
}

function openSelectRef(selectRef: HTMLDivElement): void {
	if (OPENED_SELECT) {
		closeSelectRef(OPENED_SELECT)
	}
	const selectedOptionRef = selectRef.querySelector(
		`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`
	) ?? selectRef.querySelector(`.${SelectClasses.placeholder}`)

	const popoverRef = selectRef.querySelector<HTMLDivElement>(`.${SelectClasses.popover}`)
	let [left, top] = [0, 0]
	if (!popoverRef || !selectedOptionRef) return

	// run before `selectedOption.getBoundingClientRect()`
	selectRef.toggleAttribute(SelectAttributes.expanded, true)

	// Keep layout with copy
	SELECTED_OPTION_COPY = document.createElement('div')
	SELECTED_OPTION_COPY.innerHTML = selectedOptionRef.innerHTML
	SELECTED_OPTION_COPY.setAttribute('role', 'none')
	const attributes = selectedOptionRef.attributes
	for (let i = 0; i < attributes.length; i++) {
		const item = attributes.item(i)
		if (!item || /^(role|id)$|^aria/.test(item.name)) continue

		SELECTED_OPTION_COPY.setAttribute(item.name, item.value)
	}
	if (selectRef.hasAttribute(SelectAttributes.useIcon)) {
		SELECTED_OPTION_COPY.style.setProperty('padding-right', '48px')
	}
	SELECTED_OPTION_COPY.classList.replace(SelectClasses.placeholder, SelectClasses.option)
	selectRef.appendChild(SELECTED_OPTION_COPY)

	// position
	const popoverMargin = 8
	const popoverPadding = 4
	const screenWidth = document.body.clientWidth
	const screenHeight = window.innerHeight
	const selectRect = selectRef.getBoundingClientRect()
	popoverRef.style.setProperty('min-width', selectRect.width + (popoverPadding * 2) + 'px')

	const popoverRect = popoverRef.getBoundingClientRect()
	if (selectedOptionRef.classList.contains(SelectClasses.option)){
		const optionRect = selectedOptionRef.classList.contains(SelectClasses.placeholder)
			? SELECTED_OPTION_COPY.getBoundingClientRect()
			: selectedOptionRef.getBoundingClientRect()

		const mid = {
			option: {
				x: optionRect.left + (optionRect.width / 2),
				y: optionRect.top + (optionRect.height / 2),
			},
			select: {
				x: selectRect.left + (selectRect.width / 2),
				y: selectRect.top + (selectRect.height / 2),
			},
		}
		const deltaY = mid.option.y - mid.select.y
		const deltaX = mid.option.x - mid.select.x
		top = popoverRect.top - deltaY
		left = popoverRect.left - deltaX
	}
	else {
		const mid = {
			popover: {
				x: popoverRect.left + (popoverRect.width / 2),
				y: popoverRect.top + (popoverRect.height / 2),
			},
			select: {
				x: selectRect.left + (selectRect.width / 2),
				y: selectRect.top + (selectRect.height / 2),
			},
		}
		const deltaY = mid.popover.y - mid.select.y
		const deltaX = mid.popover.x - mid.select.x
		top = popoverRect.top - deltaY
		left = popoverRect.left - deltaX
	}

	let right = left + popoverRect.width
	let bottom = top + popoverRect.height

	if (top < popoverMargin) top = popoverMargin
	if (left < popoverMargin) left = popoverMargin
	if (right > screenWidth) left = screenWidth - popoverRect.width - popoverMargin
	if (bottom > screenHeight) top = screenHeight - popoverRect.height - popoverMargin

	OPENED_SELECT = selectRef
	popoverRef.style.setProperty('left', left + 'px')
	popoverRef.style.setProperty('top', top + 'px')
	if (isAnimationAllowed()) {
		popoverRef.animate({opacity: [0, 1]}, {duration: 300, easing: AnimationEffectTiming.spring})
	}
}

function closeSelectRef(selectRef: HTMLDivElement): void {
	if (SELECTED_OPTION_COPY) {
		SELECTED_OPTION_COPY.remove()
		SELECTED_OPTION_COPY = null
	}

	const popoverRef = selectRef.querySelector<HTMLDivElement>(`.${SelectClasses.popover}`)
	OPENED_SELECT = null
	selectRef.toggleAttribute(SelectAttributes.expanded, false)
	popoverRef?.style.removeProperty('min-width')
}

function _initSelectPopoverRefListener(): void {
	if (HAS_LISTENER) return

	let pointerInRange: boolean = false
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (!OPENED_SELECT) return

		closeSelectRef(OPENED_SELECT)
	}

	function handleOutsideClick(): void {
		if (!OPENED_SELECT || pointerInRange) return

		closeSelectRef(OPENED_SELECT)
	}

	function initEvents(): void {
		document.addEventListener('pointerdown', (ev) => {
			if (!OPENED_SELECT) return

			pointerInRange = OPENED_SELECT.contains(ev.target as Node)
		})
		document.addEventListener('pointerup', handleOutsideClick)
		document.addEventListener('pointercancel', handleOutsideClick)
		window.addEventListener('resize', handleWindowResize)
	}

	initEvents()
}

function _initSelectRef(selectRef: HTMLDivElement): void {
	const optionRefs: HTMLButtonElement[] = []
	const isExpanded = () => OPENED_SELECT === selectRef
	let disableClickEvent = false
	let timeOptionsId: NodeJS.Timeout | number | null = null

	function selectOptionRef(optionRef: HTMLButtonElement): void {
		const selectedOptionRefs = selectRef.querySelectorAll(
			`.${SelectClasses.option}[aria-selected=true]`
		)
		for (const optionRef of selectedOptionRefs) {
			optionRef.setAttribute('aria-selected', 'false')
		}

		optionRef.setAttribute('aria-selected', 'true')
		selectRef.setAttribute('aria-activedescendant', optionRef.id)
		selectRef.setAttribute(SelectAttributes.value, optionRef.value)
		selectRef.dispatchEvent(new CustomEvent(SelectEvents.change, {
			bubbles: true,
		}))
	}

	function isOptionRef(optionRef: HTMLButtonElement | null): boolean {
		if (
			!optionRef
			|| !optionRef.classList.contains(SelectClasses.option)
			|| !optionRef.value
			|| !selectRef.contains(optionRef)
			|| optionRef.getAttribute('aria-disabled') === 'true'
		) {
			return false
		}

		return true
	}

	function selectRefOnKeyDown(ev: KeyboardEvent): void {
		const key = ev.key
		if (![
			KEY_ARROW_DOWN,
			KEY_ARROW_UP,
			KEY_ESCAPE,
			KEY_SPACE,
			KEY_ENTER
		].includes(key)) return

		const optionRef = document.activeElement as HTMLButtonElement | null
		if ([KEY_ARROW_DOWN, KEY_ARROW_UP].includes(key)){
			if (ev.altKey) {
				return isExpanded()? closeSelectRef(selectRef) : openSelectRef(selectRef)
			}

			if (!isOptionRef(optionRef)) return
			if (timeOptionsId === null) {
				optionRefs.length = 0
				optionRefs.push(...selectRef.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
				timeOptionsId = setTimeout(() => {
					timeOptionsId = null
				}, 100)
			}

			const index = optionRefs.findIndex(v => v === optionRef)
			if (index < 0) return

			switch (key) {
			case KEY_ARROW_UP:
				if (index === 0) return

				if (!isExpanded()) selectOptionRef(optionRefs[index - 1])
				optionRefs[index - 1].focus()
				break
			case KEY_ARROW_DOWN:
				if (index === optionRefs.length - 1) return

				if (!isExpanded()) selectOptionRef(optionRefs[index + 1])
				optionRefs[index + 1].focus()
				break
			}
		}
		else if (key === KEY_ESCAPE) {
			closeSelectRef(selectRef)
			selectRef.querySelector<HTMLButtonElement>(
				`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`
			)?.focus()
		}
		else if ([KEY_SPACE, KEY_ENTER].includes(key)) {
			disableClickEvent = true
			if (!isExpanded()) {
				return openSelectRef(selectRef)
			}

			closeSelectRef(selectRef)
			if (isOptionRef(optionRef)) {
				selectOptionRef(optionRef!)
			}
		}
	}

	function selectRefOnWheel(ev: WheelEvent): void {
		if (isExpanded()) return

		const optionRef = selectRef.querySelector(`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`)
		if (!optionRef) return

		const deltaY = ev.deltaY

		if (timeOptionsId === null) {
			optionRefs.length = 0
			optionRefs.push(...selectRef.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
			timeOptionsId = setTimeout(() => {
				timeOptionsId = null
			}, 100)
		}

		const index = optionRefs.findIndex(v => v === optionRef)
		if (index < 0) return

		if (deltaY < 0) {
			if (index === 0) return

			if (!isExpanded()) selectOptionRef(optionRefs[index - 1])
			optionRefs[index - 1].focus()
		}
		else if (deltaY > 0) {
			if (index === optionRefs.length - 1) return

			if (!isExpanded()) selectOptionRef(optionRefs[index + 1])
			optionRefs[index + 1].focus()
		}
	}

	function initEvents(): void {
		selectRef.addEventListener('click', () => {
			if (disableClickEvent) {
				disableClickEvent = false
				return
			}

			if (!isExpanded()) {
				return openSelectRef(selectRef)
			}

			const optionRef = document.activeElement as HTMLButtonElement | null
			if (!isOptionRef(optionRef)) return

			selectOptionRef(optionRef!)
			closeSelectRef(selectRef)
		})

		selectRef.addEventListener('keydown', selectRefOnKeyDown)
		selectRef.addEventListener('wheel', selectRefOnWheel, {passive: true})
	}

	initEvents()
	repairOptionRefs(selectRef)
}

function createSelectRef(options?: SelectUpdateOptions): HTMLDivElement {
	const selectRef = document.createElement('div')
	return updateSelectRef(selectRef, options)
}

function updateSelectRef(selectRef: HTMLDivElement, options?: SelectUpdateOptions): HTMLDivElement {
	const refs = options?.SelectRefs
	selectRef.classList.add(SelectClasses.select)
	if (!selectRef.hasAttribute('role')) {
		selectRef.setAttribute('role', 'listbox')
	}

	const roleOption = options?.SelectRole
	if (roleOption === false) {
		selectRef.removeAttribute('role')
	}
	else if (roleOption !== undefined && roleOption !== true) {
		selectRef.setAttribute('role', roleOption)
	}

	const variantOption = options?.SelectVariant
	if (variantOption === false) {
		selectRef.removeAttribute(SelectAttributes.variant)
	}
	else if (variantOption !== undefined && variantOption !== true) {
		selectRef.setAttribute(SelectAttributes.variant, variantOption)
	}

	const useIconOption = options?.SelectUseIcon
	if (useIconOption !== undefined) {
		selectRef.toggleAttribute(SelectAttributes.useIcon, useIconOption)
	}

	// popover
	let popoverRef = selectRef.querySelector<HTMLDivElement>(`.${SelectClasses.popover}`)
	if (!popoverRef) {
		popoverRef = document.createElement('div')
		popoverRef.classList.add(SelectClasses.popover)
	}

	// icon
	let iconRef = selectRef.querySelector<HTMLElement>(`.${SelectClasses.icon}`)
	if (!iconRef) {
		iconRef = createIconRef({IconCode: ICON_CHEVRON_DOWN})
		iconRef.classList.add(SelectClasses.icon)
	}

	// content
	let contentRef = selectRef.querySelector<HTMLDivElement>(`.${SelectClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(SelectClasses.content)
	}

	// content -> placeholder
	let placeholderRef = contentRef.querySelector<HTMLDivElement>(`.${SelectClasses.placeholder}`)
	if (!placeholderRef) {
		placeholderRef = document.createElement('div')
		placeholderRef.classList.add(ButtonClasses.button, SelectClasses.placeholder)
	}

	const placeholderOption = options?.SelectPlaceholder
	if (placeholderOption === false) {
		placeholderRef.replaceChildren()
	}
	else if (placeholderOption !== undefined && placeholderOption !== true) {
		placeholderRef.replaceChildren(...placeholderOption)
	}

	// content -> children
	const childrenRefs: (Node | string)[] = []
	for (const node of contentRef.childNodes) {
		if (placeholderRef && node === placeholderRef) continue

		childrenRefs.push(node)
	}

	const childrenOption = options?.SelectChildren
	if (childrenOption === false) {
		childrenRefs.length = 0
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		childrenRefs.length = 0
		childrenRefs.push(...childrenOption)
	}

	contentRef.replaceChildren(...[...childrenRefs, placeholderRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	popoverRef.replaceChildren(contentRef)
	selectRef.replaceChildren(popoverRef, iconRef)
	refs?.placeholder?.(placeholderRef)
	refs?.select?.(selectRef)
	refs?.content?.(contentRef)
	refs?.popover?.(popoverRef)
	refs?.icon?.(iconRef)

	repairOptionRefs(selectRef)
	return selectRef
}

function createSelectOptionRef(options: Omit<SelectOptionUpdateOptions, 'value'> & {value: string}): HTMLButtonElement {
	const optionRef = createButtonRef(options)
	return updateSelectOptionRef(optionRef, options)
}

function updateSelectOptionRef(optionRef: HTMLButtonElement, options?: SelectOptionUpdateOptions): HTMLButtonElement {
	updateButtonRef(optionRef, options)
	optionRef.classList.add(SelectClasses.option)
	if (!optionRef.id) {
		optionRef.id = createId()
	}
	if (!optionRef.hasAttribute('role')) {
		optionRef.setAttribute('role', 'option')
	}

	const roleOption = options?.SelectOptionRole
	if (roleOption === false) {
		optionRef.removeAttribute('role')
	}
	else if (roleOption !== undefined && roleOption !== true) {
		optionRef.setAttribute('role', roleOption)
	}

	const valueOption = options?.SelectOptionValue
	if (valueOption !== undefined) {
		optionRef.value = valueOption
	}

	const selectedOption = options?.SelectOptionSelected
	if (selectedOption !== undefined) {
		optionRef.setAttribute('aria-selected', String(selectedOption))
	}

	options?.SelectOptionRefs?.option?.(optionRef)
	const selectRef = optionRef.closest('.' + SelectClasses.select)
	if (selectRef) repairOptionRefs(selectRef as HTMLDivElement)

	return optionRef
}

function registerSelectRef(...selectRefs: HTMLDivElement[]): void {
	_initSelectPopoverRefListener()
	if (selectRefs.length === 0) {
		selectRefs = [...document.querySelectorAll<HTMLDivElement>('.' + SelectClasses.select)]
	}

	for (const selectRef of selectRefs) {
		if (REGISTERED_SELECT.has(selectRef)) {
			continue
		}

		REGISTERED_SELECT.add(selectRef)
		_initSelectRef(selectRef)
	}
}

function unregisterSelectRef(...selects: HTMLDivElement[]): void {
	for (const select of selects) {
		REGISTERED_SELECT.delete(select)
	}
}

export {
	type SelectProps,
	type SelectUpdateOptions,
	type SelectOptionProps,
	type SelectOptionUpdateOptions,
	SelectClasses,
	SelectAttributes,
	SelectVariant,
	SelectEvents,
	createSelectRef,
	checkSelectedOptionRefs,
	repairOptionRefs,
	updateSelectRef,
	updateSelectOptionRef,
	createSelectOptionRef,
	registerSelectRef,
	unregisterSelectRef,
	openSelectRef,
	closeSelectRef
}