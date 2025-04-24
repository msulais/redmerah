import { createId } from "@/utils/ids"
import { ButtonVariant, createButton, createIconButton, updateButton, type ButtonProps, type IconButtonProps } from "../Button"
import { createDivider, type DividerProps } from "../Divider"
import { createIcon, IconClasses, updateIcon, type IconProps } from "../Icon"
import { closePopover, PopoverEvents, registerPopover, updatePopover, type PopoverProps, type PopoverToggleOpenDetail, type PopoverUpdateOptions } from "../Popover"
import { createTextField, createTextFieldButton, TextFieldClasses, updateTextField, updateTextFieldButton, type TextFieldButtonProps, type TextFieldProps } from "../TextField"
import { elementValidTarget } from "@/utils/element"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { createTooltip, updateTooltip, type TooltipProps } from "../Tooltip"
import type { Emoji } from "@/types/emoji"
import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from "@/constants/emoji"
import { ICON_ANIMAL_CAT, ICON_DISMISS, ICON_DIVERSITY, ICON_EMOJI, ICON_FLAG, ICON_FOOD, ICON_HISTORY, ICON_PERSON, ICON_RUNNING_PERSON, ICON_SEARCH, ICON_SYMBOLS, ICON_VEHICLE_CAR } from "@/constants/icons"

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

type EmojiPickerUpdateOptions = PopoverUpdateOptions & {
	EmojiPickerAutoClose?: boolean
	EmojiPickerChildren ?: (string | Node)[] | boolean
	EmojiPickerRefs     ?: {
		emojipicker     (el: HTMLDivElement       ): unknown
		tooltip         (el: HTMLDivElement       ): unknown
		header          (el: HTMLDivElement       ): unknown
		headerText      (el: HTMLSpanElement      ): unknown
		headerButton    (el: HTMLButtonElement    ): unknown
		tabs            (el: HTMLDivElement       ): unknown
		tab             (el: HTMLButtonElement[]  ): unknown
		form            (el: HTMLFormElement      ): unknown
		search          (el: HTMLDivElement       ): unknown
		searchButton    (el: HTMLButtonElement    ): unknown
		searchButtonIcon(el: HTMLElement          ): unknown
		content         (el: HTMLDivElement       ): unknown
		divider         (el: HTMLDivElement       ): unknown
		group           (el: HTMLDivElement[]     ): unknown
		emoji           (el: HTMLButtonElement[][]): unknown
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
	change = 'emojipicker:value'
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
const REGISTERED_EMOJIPICKER: HTMLDivElement[] = []

function _initEmojiPicker(emojiPickerRef: HTMLDivElement): void {
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
	let searchInput: HTMLInputElement
	let formInput: HTMLFormElement
	let lastSearchText = ''

	function initStructure(): void {
		const tabs = emojiPickerRef.querySelectorAll<HTMLDivElement>('.' + EmojiPickerClasses.tab)
		const tabpanels = emojiPickerRef.querySelectorAll<HTMLDivElement>('.' + EmojiPickerClasses.group)
		searchInput = emojiPickerRef.querySelector<HTMLInputElement>(`.${EmojiPickerClasses.search} .${TextFieldClasses.input}`)!
		formInput = emojiPickerRef.querySelector<HTMLFormElement>(`.${EmojiPickerClasses.form}`)!

		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs.item(i)
			const tabpanel = tabpanels.item(i)
			if (!tab || !tabpanel) continue

			let tabId = tab.id
			if (!tabId) {
				tabId = createId()
				tab.id = tabId
			}

			let tabpanelId = tabpanel.id
			if (!tabpanelId) {
				tabpanelId = createId()
				tabpanel.id = tabpanelId
			}

			tab.setAttribute('aria-controls', tabpanelId)
			tabpanel.setAttribute('aria-labelledby', tabId)
		}
	}

	function selectTab(tab: HTMLButtonElement): void {
		const ariaControls = tab.getAttribute('aria-controls')
		if (!ariaControls) return

		const tabPanel = document.getElementById(ariaControls.trim())
		if (!tabPanel) return

		const icon = tab.firstElementChild
		const title = emojiPickerRef.querySelector(`.${EmojiPickerClasses.title}`)
		const prevTab = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tab}[aria-selected=true]`)
		const prevTabIcon = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tab}[aria-selected=true]>.${IconClasses.icon}`)
		const prevTabpanel = emojiPickerRef.querySelector(`.${EmojiPickerClasses.group}:not([hidden])`)
		prevTab?.setAttribute('aria-selected', 'false')
		prevTabpanel?.toggleAttribute('hidden', true)
		tabPanel.removeAttribute('hidden')
		tab.scrollIntoView({behavior: 'smooth'})
		tab.setAttribute('aria-selected', 'true')
		if (title) {
			title.textContent = tab.getAttribute('aria-label') ?? title.textContent
		}

		if (icon) updateIcon(icon as HTMLElement, {
			IconFilled: true
		})
		if (prevTabIcon) updateIcon(prevTabIcon as HTMLElement, {
			IconFilled: false
		})

		updateButton(tab, {
			ButtonVariant: ButtonVariant.tonal
		})
		if (prevTab) updateButton(prevTab as HTMLButtonElement, {
			ButtonVariant: ButtonVariant.transparent
		})
		if (!isAnimationAllowed()) return

		title?.animate({
			opacity: [0, 1],
			transform: ['translateY(12px)', 'translateY(0)']
		}, animationOptions)
	}

	function formInputOnSubmit(ev: SubmitEvent): void {
		ev.preventDefault()
		const value = searchInput
			.value
			.trim()
			.replace(/\s+/gs, '|')
			.replace(/[^\w\|]/gis, '')
			.toLowerCase()
		if (value === lastSearchText) return

		lastSearchText = value
		const regex = new RegExp(
			value,
			'gis'
		)

		const result: Emoji[] = []
		for (let i = 0; i < ALL_EMOJIS.length; i++) {
			const emoji = ALL_EMOJIS[i]
			if (regex.test(emoji[1])) {
				result.push(emoji)
			}
		}

		const searchTab = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tabSearch}`)
		const searchGroup = emojiPickerRef.querySelector(`.${EmojiPickerClasses.groupSearch}`)
		searchTab?.toggleAttribute('hidden', false)

		result.sort((a, b) => a[1].localeCompare(b[1]))
		const children: HTMLButtonElement[] = []
		for (const emoji of result) {
			const button = createButton({
				ButtonChildren: [emoji[0]]
			})
			button.classList.add(EmojiPickerClasses.emoji)
			button.setAttribute('data-tooltip', emoji[1])
			children.push(button)
		}
		searchGroup?.replaceChildren(...children)
		if (searchTab) selectTab(searchTab as HTMLButtonElement)

		if (!isAnimationAllowed()) return

		searchTab?.animate({
			scale: [0, 1]
		}, animationOptions)

		for (const button of children) {
			button.animate({
				scale: [0, 1]
			}, animationOptions)
		}
	}

	function addRecentEmoji(emoji: string, name: string): void {
		const recentTab = emojiPickerRef.querySelector(`.${EmojiPickerClasses.tabRecent}`)
		const recentGroup = emojiPickerRef.querySelector(`.${EmojiPickerClasses.groupRecent}`)
		if (!recentTab || !recentGroup || recentEmoji[0] === emoji) return

		const isHidden = recentTab.hasAttribute('hidden')
		let children = recentGroup.children
		const childrenRects = new Map<Element,DOMRect>([...children].map(v => [v, v.getBoundingClientRect()]))
		const button = createButton({
			ButtonChildren: [emoji]
		})
		recentTab.toggleAttribute('hidden', false)
		button.classList.add(EmojiPickerClasses.emoji)
		button.setAttribute('data-tooltip', name)
		for (let i = 0; i < children.length; i++) {
			const item = children.item(i)
			if (item?.textContent?.trim() === emoji) {
				item.remove()
				childrenRects.delete(item)
			}
		}

		recentGroup.replaceChildren(button, ...children)
		const index = recentEmoji.findIndex(v => v === emoji)
		if (index >= 0) {
			recentEmoji.splice(index, 1)
		}

		recentEmoji = [emoji, ...recentEmoji]
		if (recentEmoji.length > 36) recentEmoji.length = 36

		children = recentGroup.children
		if (children.length > 35) {
			const item = children.item(35)
			if (item) {
				item.remove()
				childrenRects.delete(item)
			}
		}

		if (!isAnimationAllowed()) return

		if (isHidden) recentTab.animate({
			scale: [0, 1]
		}, animationOptions)

		button.animate({
			scale: [0, 1]
		}, animationOptions)
		children = recentGroup.children
		const childrenRects2 = new Map<Element,DOMRect>([...children].map(v => [v, v.getBoundingClientRect()]))
		for (let i = 0; i < children.length; i++) {
			const item = children.item(i)
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
		const btn = document.activeElement as HTMLButtonElement
		if (!elementValidTarget(emojiPickerRef, btn, el => el.tagName === 'BUTTON')) return

		const classList = btn.classList
		if (classList.contains(EmojiPickerClasses.headerButton)) {
			closePopover(emojiPickerRef)
			return
		}

		if (classList.contains(EmojiPickerClasses.tab) && btn.getAttribute('aria-selected') !== 'true') {
			selectTab(btn)
			return
		}

		if (classList.contains(EmojiPickerClasses.emoji)) {
			const emoji = btn.textContent?.trim()
			const name = btn.dataset.tooltip
			if (!emoji || !name) return

			emojiPickerRef.setAttribute(EmojiPickerAttributes.emoji, emoji)
			emojiPickerRef.setAttribute(EmojiPickerAttributes.emojiName, name)
			emojiPickerRef.dispatchEvent(new CustomEvent(EmojiPickerEvents.change, {bubbles: true}))
			addRecentEmoji(emoji, name)
			if (attributes.autoclose) {
				closePopover(emojiPickerRef)
			}
			return
		}
	}

	function initEvents(): void {
		emojiPickerRef.addEventListener(PopoverEvents.toggleOpen as any, (ev: CustomEvent<PopoverToggleOpenDetail>) => {
			if (ev.target !== emojiPickerRef) return

			const isOpen = ev.detail.open
			if (isOpen) {
				emojiPickerRef.addEventListener('click', emojiPickerRefOnClick)
				formInput.addEventListener('submit', formInputOnSubmit)
			}
			else {
				emojiPickerRef.removeEventListener('click', emojiPickerRefOnClick)
				formInput.removeEventListener('submit', formInputOnSubmit)
			}
		})
	}

	initStructure()
	initEvents()
}

function registerEmojiPicker(...emojiPickerRefs: HTMLDivElement[]): void {
	if (emojiPickerRefs.length === 0) {
		emojiPickerRefs = [...document.querySelectorAll<HTMLDivElement>('.' + EmojiPickerClasses.emojipicker)]
	}

	registerPopover(...emojiPickerRefs)
	for (const popover of emojiPickerRefs){
		if (REGISTERED_EMOJIPICKER.some(v => v === popover)) {
			continue
		}

		REGISTERED_EMOJIPICKER.push(popover)
		_initEmojiPicker(popover)
	}
}

function unregisterEmojiPicker(...emojiPickerRef: HTMLDivElement[]): void {
	const filtered = REGISTERED_EMOJIPICKER.filter(a => emojiPickerRef.every(b => a !== b))
	REGISTERED_EMOJIPICKER.length = 0
	REGISTERED_EMOJIPICKER.push(...filtered)
}

function createEmojiPicker(options?: EmojiPickerUpdateOptions): HTMLDivElement {
	const emojiPickerRef = document.createElement('div')
	return updateEmojiPicker(emojiPickerRef, options)
}

function updateEmojiPicker(emojiPickerRef: HTMLDivElement, options?: EmojiPickerUpdateOptions): HTMLDivElement {
	const refs = options?.EmojiPickerRefs
	updatePopover(emojiPickerRef, options)
	emojiPickerRef.classList.add(EmojiPickerClasses.emojipicker)

	const autoclose = options?.EmojiPickerAutoClose
	if (autoclose !== undefined) {
		emojiPickerRef.toggleAttribute(EmojiPickerAttributes.autoclose, autoclose)
	}

	// tooltip
	let tooltipRef = emojiPickerRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.tooltip}`)
	if (!tooltipRef) {
		tooltipRef = createTooltip()
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
	let headerButtonRef = headerRef.querySelector<HTMLButtonElement>(`.${EmojiPickerClasses.headerButton}`)
	if (!headerButtonRef) {
		headerButtonRef = createIconButton({IconButtonIcon: {IconCode: ICON_DISMISS}})
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
	let tabRecentRef = tabsRef.querySelector<HTMLButtonElement>(`.${EmojiPickerClasses.tabRecent}`)
	if (!tabRecentRef) {
		tabRecentRef = createIconButton({IconButtonIcon: {IconCode: ICON_HISTORY}})
		tabRecentRef.classList.add(EmojiPickerClasses.tab, EmojiPickerClasses.tabRecent)
		tabRecentRef.setAttribute('aria-label', 'Recents')
		tabRecentRef.setAttribute('data-tooltip', 'Recents')
		tabRecentRef.setAttribute('aria-selected', 'false')
		tabRecentRef.setAttribute('role', 'tab')
		tabRecentRef.toggleAttribute('hidden', true)
	}

	// tooltip -> tabs -> tab.search
	let tabSearchRef = tabsRef.querySelector<HTMLButtonElement>(`.${EmojiPickerClasses.tabSearch}`)
	if (!tabSearchRef) {
		tabSearchRef = createIconButton({IconButtonIcon: {IconCode: ICON_SEARCH}})
		tabSearchRef.classList.add(EmojiPickerClasses.tab, EmojiPickerClasses.tabSearch)
		tabSearchRef.setAttribute('aria-label', 'Search result')
		tabSearchRef.setAttribute('data-tooltip', 'Search result')
		tabSearchRef.setAttribute('aria-selected', 'false')
		tabSearchRef.setAttribute('role', 'tab')
		tabSearchRef.toggleAttribute('hidden', true)
	}

	// tooltip -> tabs -> tab
	let tabsTabRef = [...tabsRef.querySelectorAll<HTMLButtonElement>(`.${EmojiPickerClasses.tab}:not(.${EmojiPickerClasses.tabRecent},.${EmojiPickerClasses.tabSearch})`)]
	if (tabsTabRef.length === 0) {
		let i = 0
		for (const tab of [
			[ICON_EMOJI         , 'Smiley & emotion'   ],
			[ICON_PERSON        , 'Person & body parts'],
			[ICON_ANIMAL_CAT    , 'Animal & nature'    ],
			[ICON_FOOD          , 'Food & drink'       ],
			[ICON_VEHICLE_CAR   , 'Travel & places'    ],
			[ICON_RUNNING_PERSON, 'Activities'         ],
			[ICON_DIVERSITY     , 'Objects'            ],
			[ICON_SYMBOLS       , 'Symbols'            ],
			[ICON_FLAG          , 'Flags'              ]
		]) {
			const t = createIconButton({
				ButtonVariant: i === 0? ButtonVariant.tonal : undefined,
				IconButtonIcon: {IconCode: tab[0] as number}
			})
			t.classList.add(EmojiPickerClasses.tab)
			t.setAttribute('aria-label', tab[1] as string)
			t.setAttribute('data-tooltip', tab[1] as string)
			t.setAttribute('aria-selected', String(i === 0))
			t.setAttribute('role', 'tab')
			t.toggleAttribute('hidden', i > 0)
			tabsTabRef.push(t)
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
	let searchRef = formRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.search}`)
	if (!searchRef) {
		searchRef = createTextField({
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
	let searchButtonRef = searchRef.querySelector<HTMLButtonElement>(`.${EmojiPickerClasses.searchButton}`)
	if (!searchButtonRef) {
		searchButtonRef = createTextFieldButton({
			ButtonVariant: ButtonVariant.tonal
		})
		searchButtonRef.classList.add(EmojiPickerClasses.searchButton)
		searchButtonRef.setAttribute('data-tooltip', 'Search')
	}

	// tooltip -> form -> search -> button -> icon
	let searchButtonIconRef = searchButtonRef.querySelector<HTMLElement>(`.${EmojiPickerClasses.searchButtonIcon}`)
	if (!searchButtonIconRef) {
		searchButtonIconRef = createIcon({
			IconCode: ICON_SEARCH
		})
		searchButtonIconRef.classList.add(EmojiPickerClasses.searchButtonIcon)
	}

	updateTextFieldButton(searchButtonRef, {
		ButtonChildren: [searchButtonIconRef]
	})

	updateTextField(searchRef, {
		TextFieldTrailing: [searchButtonRef]
	})
	formRef.replaceChildren(searchRef)

	// tooltip -> content
	let contentRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(EmojiPickerClasses.content)
	}

	const children = options?.EmojiPickerChildren
	if (children === false) {
		contentRef.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		contentRef.replaceChildren(...children)
	}

	// tooltip -> divider
	let dividerRef = tooltipRef.querySelector<HTMLDivElement>(`.${EmojiPickerClasses.divider}`)
	if (!dividerRef) {
		dividerRef = createDivider()
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
	let groupRefs = [...tooltipRef.querySelectorAll<HTMLDivElement>(`.${EmojiPickerClasses.group}:not(.${EmojiPickerClasses.groupRecent},.${EmojiPickerClasses.groupSearch})`)]

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
				const btn = createButton({
					ButtonChildren: [emoji[0]]
				})
				btn.classList.add(EmojiPickerClasses.emoji)
				btn.setAttribute('data-tooltip', emoji[1])
				g.append(btn)
			}
			++i
		}
	}

	const emojiRefs: HTMLButtonElement[][] = []
	if (refs?.emoji){
		for (const group of [groupRecentRef, groupSearchRef, ...groupRefs]) {
			emojiRefs.push([...group.children] as HTMLButtonElement[])
		}
	}

	updateTooltip(tooltipRef, {TooltipChildren: [
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

	updatePopover(emojiPickerRef, {
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
	EmojiPickerAttributes,
	EmojiPickerClasses,
	EmojiPickerEvents,
	registerEmojiPicker,
	unregisterEmojiPicker,
	createEmojiPicker,
	updateEmojiPicker
}