import {
	KEY_ARROW_DOWN,
	KEY_ARROW_UP,
	KEY_ENTER,
	KEY_ESCAPE,
	KEY_SPACE
} from "@/constants/keyboard-value"
import {
	type ButtonProps,
	type ButtonUpdateOptions,
	ButtonClasses,
	createButton,
	ButtonVariant as SelectVariant,
} from "@/native-components/Button"
import { AnimationEffectTiming } from "@/enums/animation"
import { createIcon, type IconProps } from "@/native-components/Icon"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"
import { createId } from "@/utils/ids"

type SelectProps = astroHTML.JSX.HTMLAttributes & {
	'c:variant'        ?: SelectVariant
	'c:useIcon'        ?: boolean
	'c:attrContent'    ?: astroHTML.JSX.HTMLAttributes
	'c:attrPopover'    ?: astroHTML.JSX.HTMLAttributes
	'c:attrPlaceholder'?: astroHTML.JSX.HTMLAttributes
	'c:attrIcon'       ?: Omit<IconProps, 'c:icon'>
}

type SelectOptionProps = Omit<ButtonProps, 'value'> & {
	'c:selected'?: boolean
	value        : string
}

type SelectUpdateOptions = {
	children   ?: (string | Node)[] | boolean
	placeholder?: (string | Node)[] | boolean
	variant    ?: SelectVariant | boolean
	role       ?: astroHTML.JSX.AriaRole | boolean
	useIcon    ?: boolean
	refs       ?: {
		select     ?(el: HTMLDivElement): unknown
		content    ?(el: HTMLDivElement): unknown
		popover    ?(el: HTMLDivElement): unknown
		placeholder?(el: HTMLDivElement): unknown
		icon       ?(el: HTMLElement   ): unknown
	}
}

type SelectOptionUpdateOptions = Omit<ButtonUpdateOptions, 'refs'> & {
	value   ?: string
	selected?: boolean
	role    ?: astroHTML.JSX.AriaRole | boolean
	refs    ?: ButtonUpdateOptions['refs'] & {
		option?(e: HTMLButtonElement): unknown
	}
}

enum SelectClasses {
	select      = 'c-select',
	popover     = 'c-select-popover',
	content     = 'c-select-content',
	option      = 'c-select-option',
	placeholder = 'c-select-placeholder',
	icon        = 'c-select-icon'
}

enum SelectAttributes {
	expanded = 'data-c-expanded',
	variant  = 'data-c-variant',
	useIcon = 'data-c-use-icon',

	// NOTE:
	// this attribute will be accessable by global (not just component). It will be better
	// if we make it simpler like `select.dataset.value`.
	value    = 'data-value'
}

const REGISTERED_SELECT: HTMLDivElement[] = []
let OPENED_SELECT: HTMLDivElement | null = null
let SELECTED_OPTION_COPY: HTMLElement | null = null
let HAS_LISTENER: boolean = false

function checkSelectedOptions(select: HTMLDivElement, ...options: HTMLButtonElement[]): void {
	if (options.length === 0) {
		options.push(...select.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
	}

	const selectedOption = options.filter(o => {
		const selected = o.getAttribute('aria-selected') === 'true'
		const disabled = o.disabled
		return selected && !disabled
	})
	if (selectedOption.length === 0) return

	select.setAttribute('aria-activedescendant', selectedOption[0].id)
	select.setAttribute(SelectAttributes.value, selectedOption[0].value)
	for (let i = 1; i < selectedOption.length; i++) {
		selectedOption[i].setAttribute('aria-selected', 'false')
	}
}

function repairOptions(select: HTMLDivElement, ...options: HTMLButtonElement[]): void {
	if (options.length === 0) {
		options.push(...select.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
	}

	for (const option of options) {
		// id
		let id = option.id
		if (!id) {
			option.id = createId()
		}

		// aria-selected
		const ariaSelected = option.getAttribute('aria-selected')
		if (!ariaSelected || !['true', 'false'].includes(ariaSelected)) {
			option.setAttribute('aria-selected', 'false')
		}
	}

	checkSelectedOptions(select, ...options)
}

function openSelect(select: HTMLDivElement): void {
	if (OPENED_SELECT) {
		closeSelect(OPENED_SELECT)
	}
	const selectedOption = select.querySelector(
		`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`
	) ?? select.querySelector(`.${SelectClasses.placeholder}`)

	const popover = select.querySelector<HTMLDivElement>(`.${SelectClasses.popover}`)
	let [left, top] = [0, 0]
	if (!popover || !selectedOption) return

	// run before `selectedOption.getBoundingClientRect()`
	select.toggleAttribute(SelectAttributes.expanded, true)

	// Keep layout with copy
	SELECTED_OPTION_COPY = document.createElement('div')
	SELECTED_OPTION_COPY.innerHTML = selectedOption.innerHTML
	SELECTED_OPTION_COPY.setAttribute('role', 'none')
	const attributes = selectedOption.attributes
	for (let i = 0; i < attributes.length; i++) {
		const item = attributes.item(i)
		if (!item || /^(role|id)$|^aria/.test(item.name)) continue

		SELECTED_OPTION_COPY.setAttribute(item.name, item.value)
	}
	if (select.hasAttribute(SelectAttributes.useIcon)) {
		SELECTED_OPTION_COPY.style.setProperty('padding-right', '48px')
	}
	SELECTED_OPTION_COPY.classList.replace(SelectClasses.placeholder, SelectClasses.option)
	select.appendChild(SELECTED_OPTION_COPY)

	// position
	const popoverMargin = 8
	const popoverPadding = 4
	const screenWidth = document.body.clientWidth
	const screenHeight = window.innerHeight
	const selectRect = select.getBoundingClientRect()
	popover.style.setProperty('min-width', selectRect.width + (popoverPadding * 2) + 'px')

	const popoverRect = popover.getBoundingClientRect()
	if (selectedOption.classList.contains(SelectClasses.option)){
		const optionRect = selectedOption.classList.contains(SelectClasses.placeholder)
			? SELECTED_OPTION_COPY.getBoundingClientRect()
			: selectedOption.getBoundingClientRect()

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

	OPENED_SELECT = select
	popover.style.setProperty('left', left + 'px')
	popover.style.setProperty('top', top + 'px')
	popover.animate({opacity: [0, 1]}, {duration: 300, easing: AnimationEffectTiming.spring})
}

function closeSelect(select: HTMLDivElement): void {
	if (SELECTED_OPTION_COPY) {
		SELECTED_OPTION_COPY.remove()
		SELECTED_OPTION_COPY = null
	}

	const popover = select.querySelector<HTMLDivElement>(`.${SelectClasses.popover}`)
	OPENED_SELECT = null
	select.toggleAttribute(SelectAttributes.expanded, false)
	popover?.style.removeProperty('min-width')
}

function _initSelectPopoverListener(): void {
	if (HAS_LISTENER) return

	let pointerInRange: boolean = false
	HAS_LISTENER = true

	function handleWindowResize(): void {
		if (!OPENED_SELECT) return

		closeSelect(OPENED_SELECT)
	}

	function handleOutsideClick(): void {
		if (!OPENED_SELECT || pointerInRange) return

		closeSelect(OPENED_SELECT)
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

function _initSelect(select: HTMLDivElement): void {
	const options: HTMLButtonElement[] = []
	const isExpanded = () => OPENED_SELECT === select
	let disableClickEvent = false
	let timeoutOptionsId: NodeJS.Timeout | number | null = null

	function selectOption(option: HTMLButtonElement): void {
		const selectedOptions = select.querySelectorAll(
			`.${SelectClasses.option}[aria-selected=true]`
		)
		for (const option of selectedOptions) {
			option.setAttribute('aria-selected', 'false')
		}

		option.setAttribute('aria-selected', 'true')
		select.setAttribute('aria-activedescendant', option.id)
		select.setAttribute(SelectAttributes.value, option.value)
		select.dispatchEvent(new Event('change', {
			bubbles: true
		}))
	}

	function isOption(option: HTMLButtonElement | null): boolean {
		if (
			!option
			|| !option.classList.contains(SelectClasses.option)
			|| !option.value
			|| !select.contains(option)
			|| option.getAttribute('aria-disabled') === 'true'
		) {
			return false
		}

		return true
	}

	function selectOnKeyDown(ev: KeyboardEvent): void {
		const key = ev.key
		if (![
			KEY_ARROW_DOWN,
			KEY_ARROW_UP,
			KEY_ESCAPE,
			KEY_SPACE,
			KEY_ENTER
		].includes(key)) return

		const option = document.activeElement as HTMLButtonElement | null
		if ([KEY_ARROW_DOWN, KEY_ARROW_UP].includes(key)){
			if (ev.altKey) {
				return isExpanded()? closeSelect(select) : openSelect(select)
			}

			if (!isOption(option)) return
			if (timeoutOptionsId === null) {
				options.length = 0
				options.push(...select.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
				timeoutOptionsId = setTimeout(() => {
					timeoutOptionsId = null
				}, 100)
			}

			const index = options.findIndex(v => v === option)
			if (index < 0) return

			switch (key) {
			case KEY_ARROW_UP:
				if (index === 0) return

				if (!isExpanded()) selectOption(options[index - 1])
				options[index - 1].focus()
				break
			case KEY_ARROW_DOWN:
				if (index === options.length - 1) return

				if (!isExpanded()) selectOption(options[index + 1])
				options[index + 1].focus()
				break
			}
		}
		else if (key === KEY_ESCAPE) {
			closeSelect(select)
			select.querySelector<HTMLButtonElement>(
				`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`
			)?.focus()
		}
		else if ([KEY_SPACE, KEY_ENTER].includes(key)) {
			disableClickEvent = true
			if (!isExpanded()) {
				return openSelect(select)
			}

			closeSelect(select)
			if (isOption(option)) {
				selectOption(option!)
			}
		}
	}

	function selectOnWheel(ev: WheelEvent): void {
		if (isExpanded()) return

		const option = select.querySelector(`.${SelectClasses.option}[aria-selected=true]:not(:disabled)`)
		if (!option) return

		const deltaY = ev.deltaY

		if (timeoutOptionsId === null) {
			options.length = 0
			options.push(...select.querySelectorAll<HTMLButtonElement>(`.${SelectClasses.option}`))
			timeoutOptionsId = setTimeout(() => {
				timeoutOptionsId = null
			}, 100)
		}

		const index = options.findIndex(v => v === option)
		if (index < 0) return

		if (deltaY < 0) {
			if (index === 0) return

			if (!isExpanded()) selectOption(options[index - 1])
			options[index - 1].focus()
		}
		else if (deltaY > 0) {
			if (index === options.length - 1) return

			if (!isExpanded()) selectOption(options[index + 1])
			options[index + 1].focus()
		}
	}

	function initEvents(): void {
		select.addEventListener('click', () => {
			if (disableClickEvent) {
				disableClickEvent = false
				return
			}

			if (!isExpanded()) {
				return openSelect(select)
			}

			const option = document.activeElement as HTMLButtonElement | null
			if (!isOption(option)) return

			selectOption(option!)
			closeSelect(select)
		})

		select.addEventListener('keydown', selectOnKeyDown)
		select.addEventListener('wheel', selectOnWheel)
	}

	initEvents()
	repairOptions(select)
}

function createSelect(options?: SelectUpdateOptions): HTMLDivElement {
	const select = document.createElement('div')
	return updateSelect(select, options)
}

function updateSelect(select: HTMLDivElement, options?: SelectUpdateOptions): HTMLDivElement {
	const refs = options?.refs
	select.classList.add(SelectClasses.select)
	if (!select.hasAttribute('role')) {
		select.setAttribute('role', 'listbox')
	}

	const role = options?.role
	if (role === false) {
		select.removeAttribute('role')
	}
	else if (role && role !== true) {
		select.setAttribute('role', role)
	}

	const variant = options?.variant
	if (variant === false) {
		select.removeAttribute(SelectAttributes.variant)
	}
	else if (variant && variant !== true) {
		select.setAttribute(SelectAttributes.variant, variant)
	}

	if (options?.useIcon !== undefined) {
		select.toggleAttribute(SelectAttributes.useIcon, options.useIcon)
	}

	// popover
	let popover = select.querySelector(`.${SelectClasses.popover}`) as HTMLDivElement | null
	if (!popover) {
		popover = document.createElement('div')
		popover.classList.add(SelectClasses.popover)
	}

	// icon
	let icon = select.querySelector(`.${SelectClasses.icon}`) as HTMLElement | null
	if (!icon) {
		icon = createIcon({icon: ICON_CHEVRON_DOWN})
		icon.classList.add(SelectClasses.icon)
	}

	// content
	let content = select.querySelector(`.${SelectClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(SelectClasses.content)
	}

	// content -> placeholder
	let placeholder = select.querySelector(`.${SelectClasses.placeholder}`) as HTMLDivElement | null
	if (!placeholder) {
		placeholder = document.createElement('div')
		placeholder.classList.add(ButtonClasses.btn, SelectClasses.placeholder)
	}

	if (options?.placeholder === false) {
		placeholder.replaceChildren()
	}
	else if (options?.placeholder && options.placeholder !== true) {
		placeholder.replaceChildren(...options.placeholder)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of content.childNodes) {
		if (placeholder && node === placeholder) continue

		children.push(node)
	}

	if (options?.children === false) {
		children.length = 0
	}
	else if (options?.children && options.children !== true) {
		children.length = 0
		children.push(...options.children)
	}

	content.replaceChildren(...[...children, placeholder].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	popover.replaceChildren(content)
	select.replaceChildren(popover, icon)
	refs?.placeholder?.(placeholder)
	refs?.select?.(select)
	refs?.content?.(content)
	refs?.popover?.(popover)
	refs?.icon?.(icon)

	repairOptions(select)
	return select
}

function createSelectOption(options: Omit<SelectOptionUpdateOptions, 'value'> & {value: string}): HTMLButtonElement {
	const option = createButton(options)
	return updateSelectOption(option, options)
}

function updateSelectOption(option: HTMLButtonElement, options?: SelectOptionUpdateOptions): HTMLButtonElement {
	option.classList.add(ButtonClasses.btn, SelectClasses.option)
	if (!option.id) {
		option.id = createId()
	}
	if (!option.hasAttribute('role')) {
		option.setAttribute('role', 'option')
	}

	const role = options?.role
	if (role === false) {
		option.removeAttribute('role')
	}
	else if (role && role !== true) {
		option.setAttribute('role', role)
	}

	if (options?.value) {
		option.value = options.value
	}
	if (options?.selected !== undefined) {
		option.setAttribute('aria-selected', String(options.selected))
	}

	options?.refs?.option?.(option)
	const select = option.closest('.' + SelectClasses.select)
	if (select) repairOptions(select as HTMLDivElement)

	return option
}

function registerSelect(...selects: HTMLDivElement[]): void {
	_initSelectPopoverListener()
	if (selects.length === 0) {
		selects = [...document.querySelectorAll<HTMLDivElement>('.' + SelectClasses.select)]
	}

	for (const select of selects) {
		if (REGISTERED_SELECT.some(v => v === select)) {
			continue
		}

		REGISTERED_SELECT.push(select)
		_initSelect(select)
	}
}

function unregisterSelect(...selects: HTMLDivElement[]): void {
	const filtered = REGISTERED_SELECT.filter(a => selects.every(b => a !== b))
	REGISTERED_SELECT.length = 0
	REGISTERED_SELECT.push(...filtered)
}

export {
	type SelectProps,
	type SelectUpdateOptions,
	type SelectOptionProps,
	type SelectOptionUpdateOptions,
	SelectClasses,
	SelectAttributes,
	SelectVariant,
	createSelect,
	checkSelectedOptions,
	repairOptions,
	updateSelect,
	updateSelectOption,
	createSelectOption,
	registerSelect,
	unregisterSelect,
	openSelect,
	closeSelect
}