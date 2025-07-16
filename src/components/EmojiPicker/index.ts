import type { Emoji } from "@/types/emoji"
import { createElementId } from "@/utils/ids"
import {
	EMOJIS_ACTIVITIES,
	EMOJIS_ANIMAL_AND_NATURE,
	EMOJIS_FLAGS,
	EMOJIS_FOOD_AND_DRINK,
	EMOJIS_OBJECT,
	EMOJIS_PERSON_AND_BODY,
	EMOJIS_SMILEY_AND_EMOTION,
	EMOJIS_SYMBOLS,
	EMOJIS_TRAVEL_AND_PLACES
} from "@/constants/emoji"
import { isTargetValidElement } from "@/utils/element"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"

import {
	ButtonVariant,
	createButtonRef,
	createIconButtonRef,
	updateButtonRef,
	type ButtonElement,
	type ButtonProps,
	type IconButtonElement,
	type IconButtonProps } from "@/components/Button"
import {
	type DividerElement,
	type DividerProps,
	createDividerRef } from "@/components/Divider"
import {
	type IconElement,
	type IconProps,
	createIconRef,
	IconClasses,
	updateIconRef } from "@/components/Icon"
import {
	type PopoverElement,
	type PopoverProps,
	type PopoverUpdateOptions,
	closePopoverRef,
	isPopoverRefOpen,
	openPopoverRef,
	PopoverPosition,
	registerPopoverRef,
	repositionPopoverRef,
	updatePopoverRef } from "@/components/Popover"
import {
	createTextFieldRef,
	createTextFieldButtonRef,
	TextFieldClasses,
	updateTextFieldRef,
	updateTextFieldButtonRef,
	type TextFieldButtonProps,
	type TextFieldProps,
	type TextFieldButtonElement,
	type TextFieldElement
} from "@/components/TextField"
import {
	createTooltipRef,
	updateTooltipRef,
	type TooltipElement,
	type TooltipProps
} from "@/components/Tooltip"
import { IconCodes } from "@/enums/icons"

type EmojiPickerProps = PopoverProps & {
	EmojiPickerAutoClose           ?: boolean
	EmojiPickerTooltipAttr         ?: TooltipProps
	EmojiPickerHeaderAttr          ?: astroHTML.JSX.HTMLAttributes
	EmojiPickerHeaderTextAttr      ?: astroHTML.JSX.HTMLAttributes
	EmojiPickerHeaderButtonAttr    ?: IconButtonProps
	EmojiPickerTabsAttr            ?: astroHTML.JSX.HTMLAttributes
	EmojiPickerTabAttr             ?: (IconButtonProps | undefined | null)[]
	EmojiPickerFormAttr            ?: astroHTML.JSX.FormHTMLAttributes
	EmojiPickerSearchAttr          ?: TextFieldProps
	EmojiPickerSearchButtonAttr    ?: TextFieldButtonProps
	EmojiPickerSearchButtonIconAttr?: IconProps
	EmojiPickerContentAttr         ?: astroHTML.JSX.HTMLAttributes
	EmojiPickerDividerAttr         ?: DividerProps
	EmojiPickerTitleAttr           ?: astroHTML.JSX.HTMLAttributes
	EmojiPickerGroup               ?: (astroHTML.JSX.HTMLAttributes | undefined | null)[]
	EmojiPickerEmoji               ?: (ButtonProps | undefined | null)[][]
}

type EmojiPickerElement = PopoverElement

type EmojiPickerUpdateOptions = PopoverUpdateOptions & {
	EmojiPickerAutoClose?: boolean
	EmojiPickerChildren ?: (string | Node)[] | boolean
	EmojiPickerRefs     ?: {
		emojipicker     (ref: EmojiPickerElement    ): unknown
		tooltip         (ref: TooltipElement        ): unknown
		header          (ref: HTMLDivElement        ): unknown
		headerText      (ref: HTMLSpanElement       ): unknown
		headerButton    (ref: IconButtonElement     ): unknown
		tabs            (ref: HTMLDivElement        ): unknown
		tab             (ref: IconButtonElement[]   ): unknown
		form            (ref: HTMLFormElement       ): unknown
		search          (ref: TextFieldElement      ): unknown
		searchButton    (ref: TextFieldButtonElement): unknown
		searchButtonIcon(ref: IconElement           ): unknown
		content         (ref: HTMLDivElement        ): unknown
		divider         (ref: DividerElement        ): unknown
		group           (ref: HTMLDivElement[]      ): unknown
		emoji           (ref: ButtonElement[][]     ): unknown
	}
}

enum EmojiPickerClasses {
	emojipicker      = 'c-emojipicker',
	tooltip          = emojipicker + '-tooltip',
	header           = emojipicker + '-header',
	tabs             = emojipicker + '-tabs',
	tab              = emojipicker + '-tab',
	form             = emojipicker + '-form',
	search           = emojipicker + '-search',
	content          = emojipicker + '-content',
	divider          = emojipicker + '-divider',
	title            = emojipicker + '-title',
	group            = emojipicker + '-group',
	emoji            = emojipicker + '-emoji',
	groupRecent      = group + '-recent',
	groupSearch      = group + '-search',
	tabSearch        = tab + '-search',
	tabRecent        = tab + '-recent',
	searchButton     = search + '-button',
	searchButtonIcon = searchButton + '-icon',
	headerText       = header + '-text',
	headerButton     = header + '-button',
}

enum EmojiPickerAttributes {
	emoji = 'data-c-emojipicker-emoji',
	emojiName = 'data-c-emojipicker-emojiname',
	autoclose = 'data-c-emojipicker-autoclose'
}

enum EmojiPickerEvents {
	/** `!bubbles | !cancelable | !detail` */
	change = 'emojipicker:change'
}

const ALL_EMOJIS = [
	...EMOJIS_SMILEY_AND_EMOTION,
	...EMOJIS_PERSON_AND_BODY,
	...EMOJIS_ANIMAL_AND_NATURE,
	...EMOJIS_FOOD_AND_DRINK,
	...EMOJIS_TRAVEL_AND_PLACES,
	...EMOJIS_ACTIVITIES,
	...EMOJIS_OBJECT,
	...EMOJIS_SYMBOLS,
	...EMOJIS_FLAGS
]
const REGISTERED_EMOJIPICKER: Set<EmojiPickerElement> = new Set<EmojiPickerElement>()

function _initEmojiPickerRef(emojiPickerRef: EmojiPickerElement): void {
	const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
	const attributes = {
		get emoji() {
			return emojiPickerRef.getAttribute(EmojiPickerAttributes.emoji) ?? ''
		},
		get emojiName() {
			return emojiPickerRef.getAttribute(EmojiPickerAttributes.emojiName) ?? ''
		},
		get autoclose() {
			return emojiPickerRef.hasAttribute(EmojiPickerAttributes.autoclose)
		},
	}
	let recentEmoji: string[] = []
	let searchInputRef: HTMLInputElement
	let formInputRef: HTMLFormElement
	let lastSearchText = ''

	function initStructure(): void {
		const tabsRefs = emojiPickerRef.querySelectorAll<IconButtonElement>('.' + EmojiPickerClasses.tab)
		const tabpanelsRefs = emojiPickerRef.querySelectorAll<HTMLDivElement>('.' + EmojiPickerClasses.group)
		searchInputRef = emojiPickerRef.querySelector<HTMLInputElement>(`.${EmojiPickerClasses.search} .${TextFieldClasses.input}`)!
		formInputRef = emojiPickerRef.querySelector<HTMLFormElement>(`.${EmojiPickerClasses.form}`)!

		for (let i = 0; i < tabsRefs.length; i++) {
			const tabRef = tabsRefs.item(i)
			const tabpanelRef = tabpanelsRefs.item(i)
			if (!tabRef || !tabpanelRef) continue

			let tabId = tabRef.id
			if (!tabId) {
				tabId = createElementId()
				tabRef.id = tabId
			}

			let tabpanelId = tabpanelRef.id
			if (!tabpanelId) {
				tabpanelId = createElementId()
				tabpanelRef.id = tabpanelId
			}

			tabRef.setAttribute('aria-controls', tabpanelId)
			tabpanelRef.setAttribute('aria-labelledby', tabId)
		}
	}

	function selectTabRef(tabRef: IconButtonElement): void {
		const ariaControls = tabRef.getAttribute('aria-controls')
		if (!ariaControls) return

		const tabPanelRef = document.getElementById(ariaControls.trim())
		if (!tabPanelRef) return

		const iconRef = tabRef.firstElementChild
		const titleRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.title}`)
		const prevTabRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tab}[aria-selected=true]`)
		const prevTabIconRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tab}[aria-selected=true]>.${IconClasses.icon}`)
		const prevTabpanelRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.group}:not([hidden])`)
		if (prevTabRef === tabRef) return

		prevTabRef?.setAttribute('aria-selected', 'false')
		prevTabpanelRef?.toggleAttribute('hidden', true)
		tabPanelRef.removeAttribute('hidden')
		tabRef.scrollIntoView({behavior: 'smooth'})
		tabRef.setAttribute('aria-selected', 'true')
		if (titleRef) {
			titleRef.textContent = tabRef.getAttribute('aria-label') ?? titleRef.textContent
		}

		if (iconRef) updateIconRef(iconRef as IconElement, {
			IconFilled: true
		})
		if (prevTabIconRef) updateIconRef(prevTabIconRef as IconElement, {
			IconFilled: false
		})

		updateButtonRef(tabRef, {
			ButtonVariant: ButtonVariant.tonal
		})
		if (prevTabRef) updateButtonRef(prevTabRef as ButtonElement, {
			ButtonVariant: ButtonVariant.transparent
		})
		if (!isAnimationAllowed()) return

		titleRef?.animate({
			opacity: [0, 1],
			transform: ['translateY(12px)', 'translateY(0)']
		}, animationOptions)
	}

	function formInputOnSubmit(ev: SubmitEvent): void {
		ev.preventDefault()
		const value = searchInputRef
			.value
			.trim()
			.replace(/\s+/gs, '|')
			.replace(/[^\w\|]/gis, '')
			.toLowerCase()
		if (value === lastSearchText) return

		lastSearchText = value
		const regex = new RegExp(value, 'gis')
		const result: Emoji[] = []
		for (let i = 0; i < ALL_EMOJIS.length; i++) {
			const emoji = ALL_EMOJIS[i]
			if (regex.test(emoji[1])) {
				result.push(emoji)
			}
		}

		const tabRect: Map<IconButtonElement, DOMRect> = new Map()
		const searchTabRef = emojiPickerRef.querySelector<IconButtonElement>(`.${EmojiPickerClasses.tabSearch}`)
		const searchGroupRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.groupSearch}`)
		const isHidden = searchTabRef?.hidden ?? true
		if (isHidden) {
			for (const tabRef of emojiPickerRef.querySelectorAll<IconButtonElement>(`.${EmojiPickerClasses.tab}:not([hidden])`)) {
				if (tabRef === searchTabRef) continue

				tabRect.set(tabRef, tabRef.getBoundingClientRect())
			}
		}

		searchTabRef?.toggleAttribute('hidden', false)
		result.sort((a, b) => a[1].localeCompare(b[1]))
		const childrenRefs: ButtonElement[] = []
		for (const emoji of result) {
			const buttonRef = createButtonRef({
				ButtonChildren: [emoji[0]]
			})
			buttonRef.classList.add(EmojiPickerClasses.emoji)
			buttonRef.setAttribute('data-tooltip', emoji[1])
			childrenRefs.push(buttonRef)
		}
		searchGroupRef?.replaceChildren(...childrenRefs)
		if (searchTabRef) selectTabRef(searchTabRef as IconButtonElement)

		if (!isAnimationAllowed()) return

		if (isHidden) {
			searchTabRef?.animate({
				scale: [0, 1]
			}, animationOptions)

			tabRect.forEach((rect, element) => {
				const rect2 = element.getBoundingClientRect()
				element.animate({
					'transform': [`translate(${rect.left - rect2.left}px,${rect.top - rect2.top}px)`, 'translate(0,0)']
				}, animationOptions)
			})
		}

		for (const buttonRef of childrenRefs) {
			buttonRef.animate({
				scale: [0, 1]
			}, animationOptions)
		}
	}

	function addRecentEmoji(emoji: string, name: string): void {
		const recentTabRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tabRecent}`)
		const recentGroupRef = emojiPickerRef.querySelector(`.${EmojiPickerClasses.groupRecent}`)
		if (!recentTabRef || !recentGroupRef || recentEmoji[0] === emoji) return

		const isHidden = recentTabRef.hasAttribute('hidden')
		let childrenRefs = recentGroupRef.children
		const childrenRects = new Map<Element,DOMRect>([...childrenRefs].map(v => [v, v.getBoundingClientRect()]))
		const buttonRef = createButtonRef({
			ButtonChildren: [emoji]
		})
		recentTabRef.toggleAttribute('hidden', false)
		buttonRef.classList.add(EmojiPickerClasses.emoji)
		buttonRef.setAttribute('data-tooltip', name)
		for (let i = 0; i < childrenRefs.length; i++) {
			const itemRef = childrenRefs.item(i)
			if (itemRef?.textContent?.trim() === emoji) {
				itemRef.remove()
				childrenRects.delete(itemRef)
			}
		}

		recentGroupRef.replaceChildren(buttonRef, ...childrenRefs)
		const index = recentEmoji.findIndex(v => v === emoji)
		if (index >= 0) {
			recentEmoji.splice(index, 1)
		}

		recentEmoji = [emoji, ...recentEmoji]
		if (recentEmoji.length > 36) recentEmoji.length = 36

		childrenRefs = recentGroupRef.children
		if (childrenRefs.length > 35) {
			const item = childrenRefs.item(35)
			if (item) {
				item.remove()
				childrenRects.delete(item)
			}
		}

		if (!isAnimationAllowed()) return

		if (isHidden) recentTabRef.animate({
			scale: [0, 1]
		}, animationOptions)

		buttonRef.animate({
			scale: [0, 1]
		}, animationOptions)
		childrenRefs = recentGroupRef.children
		const childrenRects2 = new Map<Element,DOMRect>([...childrenRefs].map(v => [v, v.getBoundingClientRect()]))
		for (let i = 0; i < childrenRefs.length; i++) {
			const item = childrenRefs.item(i)
			if (!item) continue

			const rect1 = childrenRects.get(item)
			const rect2 = childrenRects2.get(item)
			if (!rect1 || !rect2) continue

			item?.animate({
				transform: [`translate(${rect1.left - rect2.left}px,${rect1.top - rect2.top}px)`, 'translate(0,0)']
			}, animationOptions)
		}
	}

	function emojiPickerRefOnClick(): void {
		const buttonRef = document.activeElement as (IconButtonElement | ButtonElement)
		if (!isTargetValidElement(emojiPickerRef, buttonRef, el => el.tagName === 'BUTTON')) return

		const classList = buttonRef.classList
		if (classList.contains(EmojiPickerClasses.headerButton)) {
			closePopoverRef(emojiPickerRef)
			return
		}

		if (classList.contains(EmojiPickerClasses.tab) && buttonRef.getAttribute('aria-selected') !== 'true') {
			selectTabRef(buttonRef)
			return
		}

		if (classList.contains(EmojiPickerClasses.emoji)) {
			const emoji = buttonRef.textContent?.trim()
			const name = buttonRef.dataset.tooltip
			if (!emoji || !name) return

			emojiPickerRef.setAttribute(EmojiPickerAttributes.emoji, emoji)
			emojiPickerRef.setAttribute(EmojiPickerAttributes.emojiName, name)
			emojiPickerRef.dispatchEvent(new CustomEvent(EmojiPickerEvents.change))
			addRecentEmoji(emoji, name)
			if (attributes.autoclose) {
				closePopoverRef(emojiPickerRef)
			}
			return
		}
	}

	function initEvents(): void {
		emojiPickerRef.addEventListener('toggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {
				emojiPickerRef.addEventListener('click', emojiPickerRefOnClick)
				formInputRef.addEventListener('submit', formInputOnSubmit)
			}
			else {
				emojiPickerRef.removeEventListener('click', emojiPickerRefOnClick)
				formInputRef.removeEventListener('submit', formInputOnSubmit)
			}
		})
	}

	initStructure()
	initEvents()
}

function registerEmojiPickerRef(...emojiPickerRefs: EmojiPickerElement[]): void {
	if (emojiPickerRefs.length === 0) {
		emojiPickerRefs = [...document.querySelectorAll<EmojiPickerElement>('.' + EmojiPickerClasses.emojipicker)]
	}

	registerPopoverRef(...emojiPickerRefs)
	for (const popover of emojiPickerRefs){
		if (REGISTERED_EMOJIPICKER.has(popover)) {
			continue
		}

		REGISTERED_EMOJIPICKER.add(popover)
		_initEmojiPickerRef(popover)
	}
}

function unregisterEmojiPickerRef(...emojiPickerRefs: EmojiPickerElement[]): void {
	for (const emojiPickerRef of emojiPickerRefs) {
		REGISTERED_EMOJIPICKER.delete(emojiPickerRef)
	}
}

function createEmojiPickerRef(options?: EmojiPickerUpdateOptions): EmojiPickerElement {
	const emojiPickerRef = updateEmojiPickerRef(document.createElement('div'), options)
	registerEmojiPickerRef(emojiPickerRef)
	return emojiPickerRef
}

function updateEmojiPickerRef(emojiPickerRef: EmojiPickerElement, options?: EmojiPickerUpdateOptions): EmojiPickerElement {
	const refs = options?.EmojiPickerRefs
	updatePopoverRef(emojiPickerRef, options)
	emojiPickerRef.classList.add(EmojiPickerClasses.emojipicker)

	const autocloseOption = options?.EmojiPickerAutoClose
	if (autocloseOption !== undefined) {
		emojiPickerRef.toggleAttribute(EmojiPickerAttributes.autoclose, autocloseOption)
	}

	// tooltip
	let tooltipRef = emojiPickerRef.querySelector<TooltipElement>(`.${EmojiPickerClasses.tooltip}`)
	if (!tooltipRef) {
		tooltipRef = createTooltipRef()
		tooltipRef.classList.add(EmojiPickerClasses.tooltip)
	}

	// tooltip -> header
	let headerRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.header}`)
	if (!headerRef) {
		headerRef = document.createElement('div')
		headerRef.classList.add(EmojiPickerClasses.header)
	}

	// tooltip -> header -> text
	let headerTextRef = headerRef.querySelector<HTMLSpanElement>(`.${EmojiPickerClasses.headerText}`)
	if (!headerTextRef) {
		headerTextRef = document.createElement('span')
		headerTextRef.classList.add(EmojiPickerClasses.headerText)
		headerTextRef.textContent = 'Emoji'
	}

	// tooltip -> header -> button
	let headerButtonRef = headerRef.querySelector<IconButtonElement>(`.${EmojiPickerClasses.headerButton}`)
	if (!headerButtonRef) {
		headerButtonRef = createIconButtonRef({IconButtonIcon: {IconCode: IconCodes.dismiss}})
		headerButtonRef.classList.add(EmojiPickerClasses.headerButton)
		headerButtonRef.setAttribute('data-tooltip', 'Close')
	}

	headerRef.replaceChildren(headerTextRef, headerButtonRef)

	// tooltip -> tabs
	let tabsRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.tabs}`)
	if (!tabsRef) {
		tabsRef = document.createElement('div')
		tabsRef.classList.add(EmojiPickerClasses.tabs)
	}

	// tooltip -> tabs -> tab.recent
	let tabRecentRef = tabsRef.querySelector<IconButtonElement>(`.${EmojiPickerClasses.tabRecent}`)
	if (!tabRecentRef) {
		tabRecentRef = createIconButtonRef({IconButtonIcon: {IconCode: IconCodes.history}})
		tabRecentRef.classList.add(EmojiPickerClasses.tab, EmojiPickerClasses.tabRecent)
		tabRecentRef.setAttribute('aria-label', 'Recents')
		tabRecentRef.setAttribute('data-tooltip', 'Recents')
		tabRecentRef.setAttribute('aria-selected', 'false')
		tabRecentRef.setAttribute('role', 'tab')
		tabRecentRef.toggleAttribute('hidden', true)
	}

	// tooltip -> tabs -> tab.search
	let tabSearchRef = tabsRef.querySelector<IconButtonElement>(`.${EmojiPickerClasses.tabSearch}`)
	if (!tabSearchRef) {
		tabSearchRef = createIconButtonRef({IconButtonIcon: {IconCode: IconCodes.search}})
		tabSearchRef.classList.add(EmojiPickerClasses.tab, EmojiPickerClasses.tabSearch)
		tabSearchRef.setAttribute('aria-label', 'Search result')
		tabSearchRef.setAttribute('data-tooltip', 'Search result')
		tabSearchRef.setAttribute('aria-selected', 'false')
		tabSearchRef.setAttribute('role', 'tab')
		tabSearchRef.toggleAttribute('hidden', true)
	}

	// tooltip -> tabs -> tab
	let tabsTabRef = [...tabsRef.querySelectorAll<IconButtonElement>(`.${EmojiPickerClasses.tab}:not(.${EmojiPickerClasses.tabRecent},.${EmojiPickerClasses.tabSearch})`)]
	if (tabsTabRef.length === 0) {
		let i = 0
		for (const tab of [
			[IconCodes.emoji         , 'Smiley & emotion'   ],
			[IconCodes.person        , 'Person & body parts'],
			[IconCodes.animalCat    , 'Animal & nature'    ],
			[IconCodes.food          , 'Food & drink'       ],
			[IconCodes.vehicleCar   , 'Travel & places'    ],
			[IconCodes.runningPerson, 'Activities'         ],
			[IconCodes.diversity     , 'Objects'            ],
			[IconCodes.symbols       , 'Symbols'            ],
			[IconCodes.flag          , 'Flags'              ]
		]) {
			const iconButtonRef = createIconButtonRef({
				ButtonVariant: i === 0? ButtonVariant.tonal : undefined,
				IconButtonIcon: {IconCode: tab[0] as number}
			})
			iconButtonRef.classList.add(EmojiPickerClasses.tab)
			iconButtonRef.setAttribute('aria-label', tab[1] as string)
			iconButtonRef.setAttribute('data-tooltip', tab[1] as string)
			iconButtonRef.setAttribute('aria-selected', String(i === 0))
			iconButtonRef.setAttribute('role', 'tab')
			iconButtonRef.toggleAttribute('hidden', i > 0)
			tabsTabRef.push(iconButtonRef)
			++i
		}
	}

	tabsRef.replaceChildren(tabRecentRef, tabSearchRef, ...tabsTabRef)

	// tooltip -> form
	let formRef = tooltipRef.querySelector<HTMLFormElement>(`.${EmojiPickerClasses.form}`)
	if (!formRef) {
		formRef = document.createElement('form')
		formRef.classList.add(EmojiPickerClasses.form)
	}

	// tooltip -> form -> search
	let searchRef = formRef.querySelector<TextFieldElement>(`.${EmojiPickerClasses.search}`)
	if (!searchRef) {
		searchRef = createTextFieldRef({
			TextFieldPlaceholder: 'Search emoji',
			TextFieldRefs: {
				input(el) {
					el.required = true
				},
			}
		})
		searchRef.classList.add(EmojiPickerClasses.search)
	}

	// tooltip -> form -> search -> button
	let searchButtonRef = searchRef.querySelector<TextFieldButtonElement>(`.${EmojiPickerClasses.searchButton}`)
	if (!searchButtonRef) {
		searchButtonRef = createTextFieldButtonRef({
			ButtonVariant: ButtonVariant.tonal
		})
		searchButtonRef.classList.add(EmojiPickerClasses.searchButton)
		searchButtonRef.setAttribute('data-tooltip', 'Search')
	}

	// tooltip -> form -> search -> button -> icon
	let searchButtonIconRef = searchButtonRef.querySelector<IconElement>(`.${EmojiPickerClasses.searchButtonIcon}`)
	if (!searchButtonIconRef) {
		searchButtonIconRef = createIconRef({
			IconCode: IconCodes.search
		})
		searchButtonIconRef.classList.add(EmojiPickerClasses.searchButtonIcon)
	}

	updateTextFieldButtonRef(searchButtonRef, {
		ButtonChildren: [searchButtonIconRef]
	})

	updateTextFieldRef(searchRef, {
		TextFieldTrailing: [searchButtonRef]
	})
	formRef.replaceChildren(searchRef)

	// tooltip -> content
	let contentRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(EmojiPickerClasses.content)
	}

	const childrenOption = options?.EmojiPickerChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	// tooltip -> divider
	let dividerRef = tooltipRef.querySelector<DividerElement>(`.${EmojiPickerClasses.divider}`)
	if (!dividerRef) {
		dividerRef = createDividerRef()
		dividerRef.classList.add(EmojiPickerClasses.divider)
	}

	// tooltip -> title
	let titleRef = tooltipRef.querySelector<HTMLHeadingElement>(`.${EmojiPickerClasses.title}`)
	if (!titleRef) {
		titleRef = document.createElement('h3')
		titleRef.textContent = 'Smiley & emotion'
		titleRef.classList.add(EmojiPickerClasses.title)
	}

	// tooltip -> group.recent
	let groupRecentRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.groupRecent}`)
	if (!groupRecentRef) {
		groupRecentRef = document.createElement('div')
		groupRecentRef.classList.add(EmojiPickerClasses.group, EmojiPickerClasses.groupRecent)
	}

	// tooltip -> group.search
	let groupSearchRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.groupSearch}`)
	if (!groupSearchRef) {
		groupSearchRef = document.createElement('div')
		groupSearchRef.classList.add(EmojiPickerClasses.group, EmojiPickerClasses.groupSearch)
	}

	// tooltip -> group
	let groupRefs = [...tooltipRef.querySelectorAll<HTMLDivElement>(
		`.${EmojiPickerClasses.group}:not(.${EmojiPickerClasses.groupRecent},.${EmojiPickerClasses.groupSearch})`
	)]

	// NOTE: checking individualy is hard
	if (groupRefs.length === 0) {
		let i = 0
		for (const emojis of [
			EMOJIS_SMILEY_AND_EMOTION,
			EMOJIS_PERSON_AND_BODY,
			EMOJIS_ANIMAL_AND_NATURE,
			EMOJIS_FOOD_AND_DRINK,
			EMOJIS_TRAVEL_AND_PLACES,
			EMOJIS_ACTIVITIES,
			EMOJIS_OBJECT,
			EMOJIS_SYMBOLS,
			EMOJIS_FLAGS
		]) {
			const g = document.createElement('div')
			g.classList.add(EmojiPickerClasses.group)
			g.toggleAttribute('hidden', i !== 0)
			groupRefs.push(g)
			for (const emoji of emojis) {
				const buttonRef = createButtonRef({
					ButtonChildren: [emoji[0]]
				})
				buttonRef.classList.add(EmojiPickerClasses.emoji)
				buttonRef.setAttribute('data-tooltip', emoji[1])
				g.append(buttonRef)
			}
			++i
		}
	}

	const emojiRefs: ButtonElement[][] = []
	if (refs?.emoji){
		for (const group of [groupRecentRef, groupSearchRef, ...groupRefs]) {
			emojiRefs.push([...group.children] as ButtonElement[])
		}
	}

	updateTooltipRef(tooltipRef, {TooltipChildren: [
		headerRef,
		tabsRef,
		formRef,
		contentRef,
		dividerRef,
		titleRef,
		groupRecentRef,
		groupSearchRef,
		...groupRefs
	]})

	updatePopoverRef(emojiPickerRef, {
		PopoverChildren: [tooltipRef]
	})
	refs?.emojipicker(emojiPickerRef)
	refs?.tooltip(tooltipRef)
	refs?.header(headerRef)
	refs?.headerText(headerTextRef)
	refs?.headerButton(headerButtonRef)
	refs?.tabs(tabsRef)
	refs?.tab(tabsTabRef)
	refs?.form(formRef)
	refs?.search(searchRef)
	refs?.searchButton(searchButtonRef)
	refs?.searchButtonIcon(searchButtonIconRef)
	refs?.content(contentRef)
	refs?.divider(dividerRef)
	refs?.group([groupRecentRef, groupSearchRef, ...groupRefs])
	refs?.emoji(emojiRefs)
	return emojiPickerRef
}

export {
	type EmojiPickerProps,
	type EmojiPickerUpdateOptions,
	type EmojiPickerElement,
	PopoverPosition as EmojiPickerPosition,
	EmojiPickerAttributes,
	EmojiPickerClasses,
	EmojiPickerEvents,
	openPopoverRef as openEmojiPickerRef,
	closePopoverRef as closeEmojiPickerRef,
	repositionPopoverRef as repositionEmojiPickerRef,
	isPopoverRefOpen as isEmojiPickerRefOpen,
	registerEmojiPickerRef,
	unregisterEmojiPickerRef,
	createEmojiPickerRef,
	updateEmojiPickerRef
}