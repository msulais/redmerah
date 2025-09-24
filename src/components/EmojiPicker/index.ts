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
import { AnimationEasing } from "@/enums/animation"
import { IconCodes } from "@/enums/icons"
import { pxToRem } from "@/utils/css"
import { CPopover as GCPopover, type PopoverProps } from "../Popover"
import { CTooltip as GCTooltip, type TooltipProps } from "../Tooltip"
import { CButton as GCButton, type ButtonProps, type IconButtonProps } from "../Button"
import { CTextField as GCTextField, type TextFieldButtonProps, type TextFieldProps } from "../TextField"
import { CIcon as GCIcon, type IconProps } from "../Icon"
import { CDivider as GCDivider, type DividerProps } from "../Divider"
import { $add_event, $children, $classlist, $create, $get_attr, $has_attr, $id, $is_array, $is_bool, $is_false, $query, $query_all, $rect, $rm_attr, $rm_event, $set_attr, $toggle_attr } from "../utils"

export namespace CEmojiPicker {
	export type CElement = GCPopover.CElement
	export type UpdateOptions = GCPopover.UpdateOptions & {
		EmojiPicker?: {
			autoClose?: boolean
			children ?: (string | Node)[] | boolean
			refs     ?: {
				emojipicker     (ref: CElement): unknown
				tooltip         (ref: GCTooltip.CElement): unknown
				header          (ref: HTMLDivElement): unknown
				headerText      (ref: HTMLSpanElement): unknown
				headerButton    (ref: GCButton.CIcon.CElement): unknown
				tabs            (ref: HTMLDivElement): unknown
				tab             (ref: GCButton.CIcon.CElement[]): unknown
				form            (ref: HTMLFormElement): unknown
				search          (ref: GCTextField.CElement): unknown
				searchButton    (ref: GCTextField.CButton.CElement): unknown
				searchButtonIcon(ref: GCIcon.CElement): unknown
				content         (ref: HTMLDivElement): unknown
				divider         (ref: GCDivider.CElement): unknown
				group           (ref: HTMLDivElement[]): unknown
				emoji           (ref: GCButton.CElement[][]): unknown
			}
		}
	}

	export enum Classes {
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

	export enum Attributes {
		emoji = 'data-c-emojipicker-emoji',
		emojiName = 'data-c-emojipicker-emojiname',
		autoclose = 'data-c-emojipicker-autoclose'
	}

	export enum Events {
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
	const REGISTERED_EMOJIPICKER: Set<CElement> = new Set<CElement>()

	export function initEmojiPicker(ref_emojipicker: CElement): void {
		const animationOptions = {duration: 250, easing: AnimationEasing.spring}
		const attributes = {
			get emoji() {
				return $get_attr(ref_emojipicker, Attributes.emoji) ?? ''
			},
			get emojiName() {
				return $get_attr(ref_emojipicker, Attributes.emojiName) ?? ''
			},
			get autoclose() {
				return $has_attr(ref_emojipicker, Attributes.autoclose)
			},
		}
		let ref_searchInput: HTMLInputElement
		let ref_formInput: HTMLFormElement
		let recentEmoji: string[] = []
		let lastSearchText = ''

		function initStructure(): void {
			const refs_tab = $query_all<GCButton.CIcon.CElement>('.' + Classes.tab, ref_emojipicker)
			const refs_panel = $query_all<HTMLDivElement>('.' + Classes.group, ref_emojipicker)
			ref_searchInput = $query<HTMLInputElement>(`.${Classes.search} .${GCTextField.Classes.input}`, ref_emojipicker)!
			ref_formInput = $query<HTMLFormElement>(`.${Classes.form}`, ref_emojipicker)!

			for (let i = 0; i < refs_tab.length; i++) {
				const ref_tab = refs_tab[i]
				const ref_panel = refs_panel[i]
				if (!ref_tab || !ref_panel) continue

				let tabId = ref_tab.id
				if (!tabId) {
					tabId = createElementId()
					ref_tab.id = tabId
				}

				let tabpanelId = ref_panel.id
				if (!tabpanelId) {
					tabpanelId = createElementId()
					ref_panel.id = tabpanelId
				}

				$set_attr(ref_tab, 'aria-controls', tabpanelId)
				$set_attr(ref_panel, 'aria-labelledby', tabId)
			}
		}

		function selectTabRef(ref_tab: GCButton.CIcon.CElement): void {
			const ariaControls = $get_attr(ref_tab, 'aria-controls')
			if (!ariaControls) return

			const ref_panel = $id(ariaControls.trim())
			if (!ref_panel) return

			const ref_icon = ref_tab.firstElementChild as GCIcon.CElement
			const ref_title = $query(`.${Classes.title}`, ref_emojipicker)
			const ref_prevTab = $query<GCButton.CElement>(`.${Classes.tab}[aria-selected=true]`, ref_emojipicker)
			const ref_prevTabIcon = $query<GCIcon.CElement>(`.${Classes.tab}[aria-selected=true]>.${GCIcon.Classes.icon}`, ref_emojipicker)
			const ref_prevTabPanel = $query(`.${Classes.group}:not([hidden])`, ref_emojipicker)
			if (ref_prevTab === ref_tab) return

			$set_attr(ref_prevTab, 'aria-selected', 'false')
			$set_attr(ref_tab, 'aria-selected', 'true')
			$toggle_attr(ref_prevTabPanel, 'hidden', true)
			$rm_attr(ref_panel, 'hidden')
			ref_tab.scrollIntoView({behavior: 'smooth'})
			if (ref_title) {
				ref_title.textContent = $get_attr(ref_tab, 'aria-label') ?? ref_title.textContent
			}

			if (ref_icon) {
				GCIcon.update(ref_icon, {Icon: {filled: true}})
			}
			if (ref_prevTabIcon) {
				GCIcon.update(ref_prevTabIcon, {Icon: {filled: true}})
			}

			GCButton.update(ref_tab, {Button: {variant: GCButton.Variant.tonal}})
			if (ref_prevTab) {
				GCButton.update(ref_prevTab, {Button: {variant: GCButton.Variant.transparent}})
			}
			if (!isAnimationAllowed()) return

			ref_title?.animate({
				opacity: [0, 1],
				translate: [`0 ${pxToRem(12)}rem`, '0 0'],
			}, animationOptions)
		}

		function ref_formInput_onSubmit(ev: SubmitEvent): void {
			ev.preventDefault()
			const value = ref_searchInput
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

			const tabRect: Map<GCButton.CIcon.CElement, DOMRect> = new Map()
			const ref_searchTab = $query<GCButton.CIcon.CElement>(`.${Classes.tabSearch}`, ref_emojipicker)
			const ref_searchGroup = $query(`.${Classes.groupSearch}`, ref_emojipicker)
			const isHidden = ref_searchTab?.hidden ?? true
			if (isHidden) {
				for (const ref_tab of $query_all<GCButton.CIcon.CElement>(`.${Classes.tab}:not([hidden])`, ref_emojipicker)) {
					if (ref_tab === ref_searchTab) continue

					tabRect.set(ref_tab, $rect(ref_tab))
				}
			}

			$toggle_attr(ref_searchTab, 'hidden', false)
			result.sort((a, b) => a[1].localeCompare(b[1]))
			const refs_children: GCButton.CElement[] = []
			for (const emoji of result) {
				const ref_button = GCButton.create({Button: {children: [emoji[0]]}})
				$classlist(ref_button, Classes.emoji)
				$set_attr(ref_button, 'data-tooltip', emoji[1])
				refs_children.push(ref_button)
			}

			$children(ref_searchGroup, ...refs_children)
			if (ref_searchTab) {
				selectTabRef(ref_searchTab)
			}

			if (!isAnimationAllowed()) {return}

			if (isHidden) {
				ref_searchTab?.animate({
					scale: [0, 1]
				}, animationOptions)

				tabRect.forEach((rect, ref) => {
					const rect2 = $rect(ref)
					ref.animate({
						translate: [`${pxToRem(rect.left - rect2.left)}rem ${pxToRem(rect.top - rect2.top)}rem`, '0 0']
					}, animationOptions)
				})
			}

			for (const ref of refs_children) {
				ref.animate({
					scale: [0, 1]
				}, animationOptions)
			}
		}

		function addRecentEmoji(emoji: string, name: string): void {
			const ref_recentTab = $query(`.${Classes.tabRecent}`, ref_emojipicker)
			const ref_recentGroup = $query(`.${Classes.groupRecent}`, ref_emojipicker)
			if (!ref_recentTab || !ref_recentGroup || recentEmoji[0] === emoji) return

			let refs_children = ref_recentGroup.children
			const isHidden = $has_attr(ref_recentTab, 'hidden')
			const childrenRects = new Map<Element,DOMRect>([...refs_children].map(v => [v, $rect(v)]))
			const ref_button = GCButton.create({Button: {children: [emoji]}})
			$toggle_attr(ref_recentTab, 'hidden', false)
			$classlist(ref_button, Classes.emoji)
			$set_attr(ref_button, 'data-tooltip', name)
			for (let i = 0; i < refs_children.length; i++) {
				const ref = refs_children[i]
				if (ref?.textContent?.trim() === emoji) {
					ref.remove()
					childrenRects.delete(ref)
				}
			}

			$children(ref_recentGroup, ref_button, ...refs_children)
			const index = recentEmoji.findIndex(v => v === emoji)
			if (index >= 0) {
				recentEmoji.splice(index, 1)
			}

			recentEmoji = [emoji, ...recentEmoji]
			if (recentEmoji.length > 36) recentEmoji.length = 36

			refs_children = ref_recentGroup.children
			if (refs_children.length > 35) {
				const item = refs_children[35]
				if (item) {
					item.remove()
					childrenRects.delete(item)
				}
			}

			if (!isAnimationAllowed()) return

			if (isHidden) {
				ref_recentTab.animate({scale: [0, 1]}, animationOptions)
			}

			ref_button.animate({
				scale: [0, 1]
			}, animationOptions)
			refs_children = ref_recentGroup.children
			const childrenRects2 = new Map<Element,DOMRect>([...refs_children].map(v => [v, $rect(v)]))
			for (let i = 0; i < refs_children.length; i++) {
				const ref = refs_children[i]
				if (!ref) continue

				const rect1 = childrenRects.get(ref)
				const rect2 = childrenRects2.get(ref)
				if (!rect1 || !rect2) continue

				ref?.animate({
					translate: [`${pxToRem(rect1.left - rect2.left)}rem ${pxToRem(rect1.top - rect2.top)}rem`, '0 0']
				}, animationOptions)
			}
		}

		function ref_emojipicker_onClick(): void {
			const ref_btn = document.activeElement as GCButton.CElement
			if (!isTargetValidElement(ref_emojipicker, ref_btn, el => el.tagName === 'BUTTON')) return

			const classList = ref_btn.classList
			if (classList.contains(Classes.headerButton)) {
				GCPopover.close(ref_emojipicker)
				return
			}

			if (classList.contains(Classes.tab) && $get_attr(ref_btn, 'aria-selected') !== 'true') {
				selectTabRef(ref_btn)
				return
			}

			if (classList.contains(Classes.emoji)) {
				const emoji = ref_btn.textContent?.trim()
				const name = ref_btn.dataset.tooltip
				if (!emoji || !name) return

				$set_attr(ref_emojipicker, Attributes.emoji, emoji)
				$set_attr(ref_emojipicker, Attributes.emojiName, name)
				ref_emojipicker.dispatchEvent(new CustomEvent(Events.change))
				addRecentEmoji(emoji, name)
				if (attributes.autoclose) {
					GCPopover.close(ref_emojipicker)
				}
				return
			}
		}

		function initEvents(): void {
			$add_event<ToggleEvent>(ref_emojipicker, 'toggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {
					$add_event(ref_emojipicker, 'click', ref_emojipicker_onClick)
					$add_event(ref_formInput, 'submit', ref_formInput_onSubmit)
				}
				else {
					$rm_event(ref_emojipicker, 'click', ref_emojipicker_onClick)
					$rm_event(ref_formInput, 'submit', ref_formInput_onSubmit)
				}
			})
		}

		initStructure()
		initEvents()
	}

	export function register(...refs_emojipicker: CElement[]): void {
		if (refs_emojipicker.length === 0) {
			refs_emojipicker = [...$query_all<CElement>('.' + Classes.emojipicker)]
		}

		GCPopover.register(...refs_emojipicker)
		for (const ref of refs_emojipicker){
			if (REGISTERED_EMOJIPICKER.has(ref)) {
				continue
			}

			REGISTERED_EMOJIPICKER.add(ref)
			initEmojiPicker(ref)
		}
	}

	export function unregister(...refs_emojipicker: CElement[]): void {
		for (const ref of refs_emojipicker) {
			REGISTERED_EMOJIPICKER.delete(ref)
		}
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_emojipicker = update($create('div'), options)
		register(ref_emojipicker)
		return ref_emojipicker
	}

	export function update(ref_emojipicker: CElement, options?: UpdateOptions): CElement {
		const opt = options?.EmojiPicker
		const refs = opt?.refs
		GCPopover.update(ref_emojipicker, options)
		$classlist(ref_emojipicker, Classes.emojipicker)

		const opt_autoclose = opt?.autoClose
		if ($is_bool(opt_autoclose)) {
			$toggle_attr(ref_emojipicker, Attributes.autoclose, opt_autoclose)
		}

		// tooltip
		let ref_tooltip = $query<GCTooltip.CElement>(`.${Classes.tooltip}`, ref_emojipicker)
		if (!ref_tooltip) {
			ref_tooltip = GCTooltip.create()
			$classlist(ref_tooltip, Classes.tooltip)
		}

		// tooltip -> header
		let ref_header = $query<HTMLDivElement>(`.${Classes.header}`, ref_tooltip)
		if (!ref_header) {
			ref_header = $create('div')
			$classlist(ref_header, Classes.header)
		}

		// tooltip -> header -> text
		let ref_headerText = $query<HTMLSpanElement>(`.${Classes.headerText}`, ref_header)
		if (!ref_headerText) {
			ref_headerText = $create('span')
			$classlist(ref_headerText, Classes.headerText)
			ref_headerText.textContent = 'Emoji'
		}

		// tooltip -> header -> button
		let ref_headerButton = $query<GCButton.CIcon.CElement>(`.${Classes.headerButton}`, ref_header)
		if (!ref_headerButton) {
			ref_headerButton = GCButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.dismiss}}
			})
			$classlist(ref_headerButton, Classes.headerButton)
			$set_attr(ref_headerButton, 'data-tooltip', 'Close')
		}

		$children(ref_header, ref_headerText, ref_headerButton)

		// tooltip -> tabs
		let ref_tabs = $query<HTMLDivElement>(`.${Classes.tabs}`, ref_tooltip)
		if (!ref_tabs) {
			ref_tabs = $create('div')
			$classlist(ref_tabs, Classes.tabs)
		}

		// tooltip -> tabs -> tab.recent
		let ref_tabsRecent = $query<GCButton.CIcon.CElement>(`.${Classes.tabRecent}`, ref_tabs)
		if (!ref_tabsRecent) {
			ref_tabsRecent = GCButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.history}}
			})
			$classlist(ref_tabsRecent, Classes.tab, Classes.tabRecent)
			$set_attr(ref_tabsRecent, 'aria-label', 'Recents')
			$set_attr(ref_tabsRecent, GCTooltip.TargetAttributes.tooltip, 'Recents')
			$set_attr(ref_tabsRecent, 'aria-selected', 'false')
			$set_attr(ref_tabsRecent, 'role', 'tab')
			$toggle_attr(ref_tabsRecent, 'hidden', true)
		}

		// tooltip -> tabs -> tab.search
		let ref_tabsSearch = $query<GCButton.CIcon.CElement>(`.${Classes.tabSearch}`, ref_tabs)
		if (!ref_tabsSearch) {
			ref_tabsSearch = GCButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.search}}
			})
			$classlist(ref_tabsSearch, Classes.tab, Classes.tabSearch)
			$set_attr(ref_tabsSearch, 'aria-label', 'Search result')
			$set_attr(ref_tabsSearch, GCTooltip.TargetAttributes.tooltip, 'Search result')
			$set_attr(ref_tabsSearch, 'aria-selected', 'false')
			$set_attr(ref_tabsSearch, 'role', 'tab')
			$toggle_attr(ref_tabsSearch, 'hidden', true)
		}

		// tooltip -> tabs -> tab[]
		let refs_tabs = [...$query_all<GCButton.CIcon.CElement>(`.${Classes.tab}:not(.${Classes.tabRecent},.${Classes.tabSearch})`, ref_tabs)]
		if (refs_tabs.length === 0) {
			let i = 0
			for (const tab of [
				[IconCodes.emoji        , 'Smiley & emotion'   ],
				[IconCodes.person       , 'Person & body parts'],
				[IconCodes.animalCat    , 'Animal & nature'    ],
				[IconCodes.food         , 'Food & drink'       ],
				[IconCodes.vehicleCar   , 'Travel & places'    ],
				[IconCodes.runningPerson, 'Activities'         ],
				[IconCodes.diversity    , 'Objects'            ],
				[IconCodes.symbols      , 'Symbols'            ],
				[IconCodes.flag         , 'Flags'              ]
			]) {
				const ref_iconBtn = GCButton.CIcon.create({
					Button: {variant: i === 0? GCButton.Variant.tonal : undefined},
					IconButton: {Icon: {code: tab[0] as number}}
				})
				$classlist(ref_iconBtn, Classes.tab)
				$set_attr(ref_iconBtn, 'aria-label', tab[1] as string)
				$set_attr(ref_iconBtn, GCTooltip.TargetAttributes.tooltip, tab[1] as string)
				$set_attr(ref_iconBtn, 'aria-selected', String(i === 0))
				$set_attr(ref_iconBtn, 'role', 'tab')
				$toggle_attr(ref_iconBtn, 'hidden', i > 0)
				refs_tabs.push(ref_iconBtn)
				++i
			}
		}

		$children(ref_tabs, ref_tabsRecent, ref_tabsSearch, ...refs_tabs)

		// tooltip -> form
		let ref_form = $query<HTMLFormElement>(`.${Classes.form}`, ref_tooltip)
		if (!ref_form) {
			ref_form = $create('form')
			$classlist(ref_form, Classes.form)
		}

		// tooltip -> form -> search
		let ref_search = $query<GCTextField.CElement>(`.${Classes.search}`, ref_form)
		if (!ref_search) {
			ref_search = GCTextField.create({TextField: {
				placeholder: 'Search emoji',
				refs: {input(el) { el.required = true }}
			}})
			$classlist(ref_search, Classes.search)
		}

		// tooltip -> form -> search -> button
		let ref_searchButton = $query<GCTextField.CButton.CElement>(`.${Classes.searchButton}`, ref_search)
		if (!ref_searchButton) {
			ref_searchButton = GCTextField.CButton.create({
				Button: {variant: GCButton.Variant.tonal}
			})
			$classlist(ref_searchButton, Classes.searchButton)
			$set_attr(ref_searchButton, GCTooltip.TargetAttributes.tooltip, 'Search')
		}

		// tooltip -> form -> search -> button -> icon
		let ref_searchButtonIcon = $query<GCIcon.CElement>(`.${Classes.searchButtonIcon}`, ref_searchButton)
		if (!ref_searchButtonIcon) {
			ref_searchButtonIcon = GCIcon.create({
				Icon: {code: IconCodes.search}
			})
			$classlist(ref_searchButtonIcon, Classes.searchButtonIcon)
		}

		GCTextField.CButton.update(ref_searchButton, {
			Button: {children: [ref_searchButtonIcon]}
		})

		GCTextField.update(ref_search, {
			TextField: {trailing: [ref_searchButton]}
		})
		$children(ref_form, ref_search)

		// tooltip -> content
		let ref_content = $query<HTMLDivElement>(`.${Classes.content}`, ref_tooltip)
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

		// tooltip -> divider
		let ref_divider = $query<GCDivider.CElement>(`.${Classes.divider}`, ref_tooltip)
		if (!ref_divider) {
			ref_divider = GCDivider.create()
			$classlist(ref_divider, Classes.divider)
		}

		// tooltip -> title
		let ref_title = $query<HTMLHeadingElement>(`.${Classes.title}`, ref_tooltip)
		if (!ref_title) {
			ref_title = $create('h3')
			ref_title.textContent = 'Smiley & emotion'
			$classlist(ref_title, Classes.title)
		}

		// tooltip -> group.recent
		let ref_groupRecent = $query<HTMLDivElement>(`.${Classes.groupRecent}`, ref_tooltip)
		if (!ref_groupRecent) {
			ref_groupRecent = $create('div')
			$classlist(ref_groupRecent, Classes.group, Classes.groupRecent)
		}

		// tooltip -> group.search
		let ref_groupSearch = $query<HTMLDivElement>(`.${Classes.groupSearch}`, ref_tooltip)
		if (!ref_groupSearch) {
			ref_groupSearch = $create('div')
			$classlist(ref_groupSearch, Classes.group, Classes.groupSearch)
		}

		// tooltip -> group
		let refs_group = [...$query_all<HTMLDivElement>(
			`.${Classes.group}:not(.${Classes.groupRecent},.${Classes.groupSearch})`
		, ref_tooltip)]

		// NOTE: checking individualy is hard
		if (refs_group.length === 0) {
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
				const g = $create('div')
				$classlist(g, Classes.group)
				$toggle_attr(g, 'hidden', i !== 0)
				refs_group.push(g)
				for (const emoji of emojis) {
					const ref_button = GCButton.create({
						Button: {children: [emoji[0]]}
					})
					$classlist(ref_button, Classes.emoji)
					$set_attr(ref_button, GCTooltip.TargetAttributes.tooltip, emoji[1])
					g.append(ref_button)
				}
				++i
			}
		}

		const refs_emoji: GCButton.CElement[][] = []
		if (refs?.emoji){
			for (const group of [ref_groupRecent, ref_groupSearch, ...refs_group]) {
				refs_emoji.push([...group.children] as GCButton.CElement[])
			}
		}

		GCTooltip.update(ref_tooltip, {Tooltip: {
			children: [
				ref_header,
				ref_tabs,
				ref_form,
				ref_content,
				ref_divider,
				ref_title,
				ref_groupRecent,
				ref_groupSearch,
				...refs_group
			]
		}})

		GCPopover.update(ref_emojipicker, {
			Popover: {children: [ref_tooltip]}
		})
		refs?.emojipicker(ref_emojipicker)
		refs?.tooltip(ref_tooltip)
		refs?.header(ref_header)
		refs?.headerText(ref_headerText)
		refs?.headerButton(ref_headerButton)
		refs?.tabs(ref_tabs)
		refs?.tab(refs_tabs)
		refs?.form(ref_form)
		refs?.search(ref_search)
		refs?.searchButton(ref_searchButton)
		refs?.searchButtonIcon(ref_searchButtonIcon)
		refs?.content(ref_content)
		refs?.divider(ref_divider)
		refs?.group([ref_groupRecent, ref_groupSearch, ...refs_group])
		refs?.emoji(refs_emoji)
		return ref_emojipicker
	}
}

export type EmojiPickerProps = PopoverProps & {
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