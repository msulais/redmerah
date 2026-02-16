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
import { CComboBox } from "@/components/ComboBox"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
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
const _ref_root = document.documentElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_pickerMode = $(ElementIds.bd_pickerMode) as CComboBox.CElement

function _subscribeAnimationChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	localStorage.setItem(LocalStorageKeys.PlatformAnimation, animation)
}

function _subscribeThemeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	localStorage.setItem(LocalStorageKeys.PlatformTheme, theme)
}

function _subscribeAnimationRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	_ref_root.setAttribute(RootAttributes.Animation, animation)
	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Animation)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Animation)}"][value="${CSS.escape(animation)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subscribeThemeRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	_ref_root.setAttribute(RootAttributes.Theme, theme)
	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Theme)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Theme)}"][value="${CSS.escape(theme)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subscribePickerModeRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const pickerMode = v.pickerMode
	if (pickerMode === o.pickerMode) {return}

	let hasMode = false
	_ref_pickerMode.value = pickerMode
	for (const ref of $$$<HTMLDivElement>('[data-picker-mode]')) {
		if (!hasMode && ref.dataset.pickerMode === pickerMode) {
			ref.hidden = false
			hasMode = true
			if (isAnimationAllowed()) {
				ref.style.setProperty('opacity', '0')
				ref.animate({
					scale: [.9, 1],
					opacity: [0, 1]
				}, {duration: 250, delay: 250, easing: AnimationEasing.Spring}).finished.then(() => {
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
	_ref_theme.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.theme = value)
	})

	_ref_animation.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.animation = value)
	})

	_ref_pickerMode.addEventListener('change', () => {
		const value = _ref_pickerMode.value as ColorPickerMode
		if (!isValidEnumValue(value, ColorPickerMode)) {return}

		SettingsStore.update(v => v.pickerMode = value)
	})
}

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.PlatformTheme) as PlatformThemeMode
	if (!theme || !isValidEnumValue(theme, PlatformThemeMode) || theme === DEFAULT_THEME) return

	SettingsStore.update(v => v.theme = theme)
}

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.PlatformAnimation) as PlatformAnimationMode
	if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

	SettingsStore.update(v => v.animation = animation)
}

export default () => {
	_initSubscriber()
	_initTheme()
	_initAnimation()
	_initEvents()
}