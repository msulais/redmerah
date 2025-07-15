import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { $, $$, $$$ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_SKIN_TONE, DEFAULT_THEME } from "../_shared/_constant"
import { Pages, SkinToneEmoji } from "../_shared/_enums"
import type { TooltipElement } from "@/native-components/Tooltip"
import { NavigationStore } from "./_navigation"
import { updateEmojiList } from "./_body"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme    : PlatformThemeMode
	animation: PlatformAnimationMode
	skinTone : SkinToneEmoji
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme    : DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	skinTone : DEFAULT_SKIN_TONE
})
const _rootRef = document.documentElement
const _skinToneOptionsRef = $(ElementIds.bd_skinTone) as TooltipElement
const _themeRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement

function _subscribeAnimationChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
}

function _subscribeThemeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	localStorage.setItem(LocalStorageKeys.platformTheme, theme)
}

function _subscribeAnimationRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	_rootRef.setAttribute(RootAttributes.animation, animation)
	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.animation)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.animation)}"][value="${CSS.escape(animation)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _subscribeThemeRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	_rootRef.setAttribute(RootAttributes.theme, theme)
	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.theme)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.theme)}"][value="${CSS.escape(theme)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _subscribeSkinToneChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const skinTone = v.skinTone
	if (skinTone === o.skinTone) {return}

	saveStorageItem('settings/skin-tone', skinTone)
	const page = NavigationStore.value.page
	if (page !== Pages.personBody) {return}

	updateEmojiList(page)
}

function _subscribeSkinToneRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const skinTone = v.skinTone
	if (skinTone === o.skinTone) {return}

	const targetRef = $$<HTMLInputElement>(`[name="${RadioNames.skinTone}"][value="${skinTone}"]`)
	const selectedRef = $$$<HTMLInputElement>(`[name="${RadioNames.skinTone}"]:not([value="${skinTone}"])`)

	for (const ref of selectedRef) {
		ref.checked = false
	}
	if (targetRef) {
		targetRef.checked = true
	}
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subscribeAnimationChanges)
	SettingsStore.subscribe(_subscribeThemeChanges)
	SettingsStore.subscribe(_subscribeAnimationRefView)
	SettingsStore.subscribe(_subscribeThemeRefView)
	SettingsStore.subscribe(_subscribeSkinToneChanges)
	SettingsStore.subscribe(_subscribeSkinToneRefView)
}

function _initEvents(): void {
	_themeRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_settingsMenuRef.hidePopover()
		SettingsStore.update(v => v.theme = value)
	})

	_animationRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_settingsMenuRef.hidePopover()
		SettingsStore.update(v => v.animation = value)
	})

	_skinToneOptionsRef.addEventListener('change', (ev) => {
		const target = ev.target as HTMLInputElement
		const skinTone = target.value as SkinToneEmoji
		if (!skinTone || !isValidEnumValue(skinTone, SkinToneEmoji)) {return}

		SettingsStore.update(v => v.skinTone = skinTone)
	})
}

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.platformTheme) as PlatformThemeMode
	if (!theme || !isValidEnumValue(theme, PlatformThemeMode) || theme === DEFAULT_THEME) return

	SettingsStore.update(v => v.theme = theme)
}

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.platformAnimation) as PlatformAnimationMode
	if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

	SettingsStore.update(v => v.animation = animation)
}

export default () => {
	_initSubscriber()
	_initTheme()
	_initAnimation()
	_initEvents()
}