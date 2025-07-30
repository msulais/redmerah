import type { TextFieldButtonElement } from "@/components/TextField"
import { ElementIds } from "../_shared/_ids"
import { $, $$$ } from "./_dom-utils"
import { isTargetValidElement } from "@/utils/element"
import { openToastRef, type ToastElement } from "@/components/Toast"
import { ButtonVariant } from "@/components/Button"
import { EMOJIS_SMILEY_AND_EMOTION, EMOJIS_PERSON_AND_BODY, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FOOD_AND_DRINK, EMOJIS_TRAVEL_AND_PLACES, EMOJIS_ACTIVITIES, EMOJIS_OBJECT, EMOJIS_SYMBOLS, EMOJIS_FLAGS, EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE } from "@/constants/emoji"
import { DrawerClasses, updateDrawerButtonRef } from "@/components/Drawer"
import { SideBarClasses, updateSideBarButtonRef } from "@/components/SideBar"
import type { TooltipElement } from "@/components/Tooltip"
import { Pages, SkinToneEmoji } from "../_shared/_enums"
import { SettingsStore } from "./_settings"
import { NavigationStore } from "./_navigation"
import { SearchStore } from "./_search"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

const _animationOptions = {
	duration: 250,
	easing: AnimationEffectTiming.spring
}
const _bodyRef = $(ElementIds.body) as HTMLElement
const _emojiListRef = $(ElementIds.bd_emojiList) as HTMLUListElement
const _emojiButtonRefs = $$$<HTMLButtonElement>(`#${CSS.escape(ElementIds.body)} [data-emoji]`)
const _skinToneOptionRef = $(ElementIds.bd_skinTone) as TooltipElement
const _titleRef = $(ElementIds.bd_title) as HTMLHeadingElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
const _textFieldRef = $(ElementIds.bd_input) as HTMLInputElement
const _copyTextFieldRef = $(ElementIds.bd_copyInput) as TextFieldButtonElement
const _dismissTextFieldRef = $(ElementIds.bd_dismissInput) as TextFieldButtonElement
let _prevPage = Pages.smileyEmotion
let _prevEmojiList = EMOJIS_SMILEY_AND_EMOTION.map(v => v[0]).join()

function _initEvents(): void {
	_bodyRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_bodyRef, buttonRef)) {return}

		const dataEmoji = buttonRef.dataset.emoji
		if (!dataEmoji) {return}

		_textFieldRef.value = _textFieldRef.value + dataEmoji
		saveStorageItem('selected-emoji', _textFieldRef.value)
		navigator.clipboard.writeText(dataEmoji).then(() => {
			openToastRef(_toastCopiedRef)
		}).catch(() => {})
	})

	_textFieldRef.addEventListener('focus', () => {
		_textFieldRef.select()
		saveStorageItem('selected-emoji', _textFieldRef.value)
	})

	_textFieldRef.addEventListener('input', () => {
		saveStorageItem('selected-emoji', _textFieldRef.value)
	})

	_copyTextFieldRef.addEventListener('click', () => {
		const data = _textFieldRef.value

		navigator.clipboard.writeText(data).then(() => {
			openToastRef(_toastCopiedRef)
		})
	})

	_dismissTextFieldRef.addEventListener('click', () => {
		_textFieldRef.value = ''
	})
}

export function updateEmojiList(page: Pages = NavigationStore.value.page): void {
	let emojis = EMOJIS_SMILEY_AND_EMOTION
	let text = ''
	let isUseSkinTone = false
	switch (page) {
	case Pages.smileyEmotion:
		text = 'Smiley & Emotion'
		emojis = EMOJIS_SMILEY_AND_EMOTION
		break
	case Pages.personBody:
		text = 'Person & Body'
		emojis = EMOJIS_PERSON_AND_BODY
		isUseSkinTone = true
		LEVEL_2: switch (SettingsStore.value.skinTone) {
		case SkinToneEmoji.none: break LEVEL_2
		case SkinToneEmoji.light:
			emojis = EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE
			break LEVEL_2
		case SkinToneEmoji.mediumLight:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE
			break LEVEL_2
		case SkinToneEmoji.medium:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE
			break LEVEL_2
		case SkinToneEmoji.mediumDark:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE
			break LEVEL_2
		case SkinToneEmoji.dark:
			emojis = EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE
			break LEVEL_2
		}
		break
	case Pages.animalNature:
		text = 'Animal & Nature'
		emojis = EMOJIS_ANIMAL_AND_NATURE
		break
	case Pages.foodDrink:
		text = 'Food & Drink'
		emojis = EMOJIS_FOOD_AND_DRINK
		break
	case Pages.travelPlaces:
		text = 'Travel & Places'
		emojis = EMOJIS_TRAVEL_AND_PLACES
		break
	case Pages.activities:
		text = 'Activities'
		emojis = EMOJIS_ACTIVITIES
		break
	case Pages.object:
		text = 'Object'
		emojis = EMOJIS_OBJECT
		break
	case Pages.symbols:
		text = 'Symbols'
		emojis = EMOJIS_SYMBOLS
		break
	case Pages.flags:
		text = 'Flags'
		emojis = EMOJIS_FLAGS
		break
	}

	const searchValue = SearchStore.value
	const searchText = searchValue.searchText.replace(/\s/gs, ' ').trim()
	if (searchValue.isSearching && searchText.length > 0) {
		const re = new RegExp(searchText.replace(/\W/gs, '|'), 'gsi')
		emojis = emojis.filter(v => re.test(v[1]))
	}

	const emojisText = emojis.map(v => v[0]).join()
	const isSamePage = _prevPage === page
	if (
		isSamePage
		&& _prevEmojiList === emojisText
	) {return}


	_prevPage = page
	_prevEmojiList = emojisText

	if (!isSamePage){
		const selectedTabRefs = $$$<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-selected=true]`)
		const targetTabRefs = $$$<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[data-page="${page}"]`)
		_skinToneOptionRef.style.setProperty('display', isUseSkinTone? 'flex' : 'none')
		for (const tab of targetTabRefs) {
			const classList = tab.classList
			tab.setAttribute('aria-selected', 'true')
			if (classList.contains(SideBarClasses.button)) {
				updateSideBarButtonRef(tab, {
					ButtonVariant: ButtonVariant.tonal,
					SideBarButtonSelected: true
				})
			}
			else if (classList.contains(DrawerClasses.button)) {
				updateDrawerButtonRef(tab, {
					ButtonVariant: ButtonVariant.tonal,
					DrawerButtonSelected: true
				})
			}
		}

		for (const tab of selectedTabRefs) {
			const classList = tab.classList
			tab.setAttribute('aria-selected', 'false')
			if (classList.contains(SideBarClasses.button)) {
				updateSideBarButtonRef(tab, {
					ButtonVariant: ButtonVariant.transparent,
					SideBarButtonSelected: false
				})
			}
			else if (classList.contains(DrawerClasses.button)) {
				updateDrawerButtonRef(tab, {
					ButtonVariant: ButtonVariant.transparent,
					DrawerButtonSelected: false
				})
			}
		}
	}

	_titleRef.textContent = text
	for (let i = 0; i < _emojiButtonRefs.length; i++) {
		const emoji = emojis[i]
		const ref = _emojiButtonRefs.item(i)
		if (!ref) {
			continue
		}

		if (!emoji) {
			ref.parentElement?.style.setProperty('display', 'none')
			continue
		}

		ref.setAttribute('data-emoji', emoji[0])
		ref.setAttribute('data-tooltip', emoji[1])
		ref.parentElement?.style.removeProperty('display')
		ref.textContent = emoji[0]
	}

	if (isAnimationAllowed()) {
		if (!isSamePage) {
			_titleRef.animate({
				opacity: [0, 1],
				translate: [`0 ${pxToRem(12)}rem`, '0 0']
			}, _animationOptions)
		}

		_emojiListRef.animate({
			opacity: [0, 1],
			scale: [.9, 1]
		}, {..._animationOptions, duration: 500})
	}
}

export default () => {
	_initEvents()
}