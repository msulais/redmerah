import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_PICKER_MODE, DEFAULT_THEME } from "../_shared/_constant"
import { $, $$, $$$ } from "./_dom-utils"
import { ColorPickerMode } from "../_shared/_enums"
import type { ComboBoxElement } from "@/native-components/ComboBox"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme     : PlatformThemeMode
	animation : PlatformAnimationMode
	pickerMode: ColorPickerMode
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme     : DEFAULT_THEME,
	animation : DEFAULT_ANIMATION,
	pickerMode: DEFAULT_PICKER_MODE
})
const _rootRef = document.documentElement
const _themeRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _pickerModeRef = $(ElementIds.bd_pickerMode) as ComboBoxElement

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

function _subscribePickerModeRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const pickerMode = v.pickerMode
	if (pickerMode === o.pickerMode) {return}

	let hasMode = false
	for (const ref of $$$<HTMLDivElement>('[data-picker-mode]')) {
		if (!hasMode && ref.dataset.pickerMode === pickerMode) {
			ref.hidden = false
			hasMode = true
			if (isAnimationAllowed()) {
				ref.style.setProperty('opacity', '0')
				ref.animate({
					scale: [.9, 1],
					opacity: [0, 1]
				}, {duration: 250, delay: 250, easing: AnimationEffectTiming.spring}).finished.then(() => {
					ref.style.removeProperty('opacity')
				})
			}
			continue
		}

		ref.hidden = true
	}
}

function _subscribePickerModeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const pickerMode = v.pickerMode
	if (pickerMode === o.pickerMode) {return}

	saveStorageItem('settings:picker-mode', pickerMode)
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subscribeAnimationChanges)
	SettingsStore.subscribe(_subscribeThemeChanges)
	SettingsStore.subscribe(_subscribeAnimationRefView)
	SettingsStore.subscribe(_subscribeThemeRefView)
	SettingsStore.subscribe(_subscribePickerModeRefView)
	SettingsStore.subscribe(_subscribePickerModeChanges)
}

function _initEvents(): void {
	_themeRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_settingsMenuRef.hidePopover()
		SettingsStore.update(v => ({...v, theme: value as PlatformThemeMode}))
	})

	_animationRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_settingsMenuRef.hidePopover()
		SettingsStore.update(v => ({...v, animation: value}))
	})

	_pickerModeRef.addEventListener('change', () => {
		const value = _pickerModeRef.value
		if (!isValidEnumValue(value, ColorPickerMode)) {return}

		SettingsStore.update(v => ({...v, pickerMode: value as ColorPickerMode}))
	})
}

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.platformTheme) as PlatformThemeMode
	if (!theme || !isValidEnumValue(theme, PlatformThemeMode) || theme === DEFAULT_THEME) return

	SettingsStore.update(v => ({...v, theme}))
}

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.platformAnimation) as PlatformAnimationMode
	if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

	SettingsStore.update(v => ({...v, animation}))
}

export default () => {
	_initSubscriber()
	_initTheme()
	_initAnimation()
	_initEvents()
}