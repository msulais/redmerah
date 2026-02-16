import { CTextField } from "@/components/TextField"
import { ElementIds } from "../_shared/_ids"
import { $, $$$ } from "./_dom-utils"
import { isTargetValidElement } from "@/utils/element"
import { CToast } from "@/components/Toast"
import { CButton } from "@/components/Button"
import { EMOJIS_SMILEY_AND_EMOTION, EMOJIS_PERSON_AND_BODY, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FOOD_AND_DRINK, EMOJIS_TRAVEL_AND_PLACES, EMOJIS_ACTIVITIES, EMOJIS_OBJECT, EMOJIS_SYMBOLS, EMOJIS_FLAGS, EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE } from "@/constants/emoji"
import { CDrawer } from "@/components/Drawer"
import { CSideBar } from "@/components/SideBar"
import { Pages, SkinToneEmoji } from "../_shared/_enums"
import { SettingsStore } from "./_settings"
import { NavigationStore } from "./_navigation"
import { SearchStore } from "./_search"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

const _animationOptions = {
	duration: 250,
	easing: AnimationEasing.spring
}
const _ref_body = $(ElementIds.body) as HTMLElement
const _ref_emojiList = $(ElementIds.bd_emojiList) as HTMLUListElement
const _refs_emojiButton = $$$<CButton.CElement>(`#${CSS.escape(ElementIds.body)} [data-emoji]`)
const _ref_skinToneOption = $(ElementIds.bd_skinTone) as HTMLDivElement
const _ref_title = $(ElementIds.bd_title) as HTMLHeadingElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_textField = $(ElementIds.bd_input) as HTMLInputElement
const _ref_copyTextField = $(ElementIds.bd_copyInput) as CTextField.CButton.CElement
const _ref_dismissTextField = $(ElementIds.bd_dismissInput) as CTextField.CButton.CElement
let _prevPage = Pages.smileyEmotion
let _prevEmojiList = EMOJIS_SMILEY_AND_EMOTION.map(v => v[0]).join()

function _initEvents(): void {
	_ref_body.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_body, ref_btn)) {return}

		const dataEmoji = ref_btn.dataset.emoji
		if (!dataEmoji) {return}

		_ref_textField.value = _ref_textField.value + dataEmoji
		saveStorageItem('selected-emoji', _ref_textField.value)
		navigator.clipboard.writeText(dataEmoji).then(() => {
			CToast.open(_ref_toastCopied)
		}).catch(() => {})
	})

	_ref_textField.addEventListener('focus', () => {
		_ref_textField.select()
		saveStorageItem('selected-emoji', _ref_textField.value)
	})

	_ref_textField.addEventListener('input', () => {
		saveStorageItem('selected-emoji', _ref_textField.value)
	})

	_ref_copyTextField.addEventListener('click', () => {
		const data = _ref_textField.value

		navigator.clipboard.writeText(data).then(() => {
			CToast.open(_ref_toastCopied)
		})
	})

	_ref_dismissTextField.addEventListener('click', () => {
		_ref_textField.value = ''
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
		const refs_selectedTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.button},.${CDrawer.Classes.button})[aria-selected=true]`)
		const refs_targetTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.button},.${CDrawer.Classes.button})[data-page="${page}"]`)
		_ref_skinToneOption.style.setProperty('display', isUseSkinTone? 'flex' : 'none')
		for (const tab of refs_targetTab) {
			const classList = tab.classList
			tab.setAttribute('aria-selected', 'true')
			if (classList.contains(CSideBar.Classes.button)) {
				CSideBar.CButton.update(tab, {
					Button: {variant: CButton.Variant.tonal},
					SideBarButton: {selected: true}
				})
			}
			else if (classList.contains(CDrawer.Classes.button)) {
				CDrawer.CButton.update(tab, {
					Button: {variant: CButton.Variant.tonal},
					DrawerButton: {selected: true}
				})
			}
		}

		for (const tab of refs_selectedTab) {
			const classList = tab.classList
			tab.setAttribute('aria-selected', 'false')
			if (classList.contains(CSideBar.Classes.button)) {
				CSideBar.CButton.update(tab, {
					Button: {variant: CButton.Variant.transparent},
					SideBarButton: {selected: false}
				})
			}
			else if (classList.contains(CDrawer.Classes.button)) {
				CDrawer.CButton.update(tab, {
					Button: {variant: CButton.Variant.transparent},
					DrawerButton: {selected: false}
				})
			}
		}
	}

	_ref_title.textContent = text
	for (let i = 0; i < _refs_emojiButton.length; i++) {
		const emoji = emojis[i]
		const ref = _refs_emojiButton.item(i)
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
			_ref_title.animate({
				opacity: [0, 1],
				translate: [`0 ${pxToRem(12)}rem`, '0 0']
			}, _animationOptions)
		}

		_ref_emojiList.animate({
			opacity: [0, 1],
			scale: [.9, 1]
		}, {..._animationOptions, duration: 500})
	}
}

export default () => {
	_initEvents()
}