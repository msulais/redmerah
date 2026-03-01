import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { $, $$ } from "./dom-utils"
import { ElementIds } from "../shared/ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../shared/input-names"
import { DEFAULT_ANIMATION, DEFAULT_KEEP_AWAKE, DEFAULT_LANGUAGE_CODE, DEFAULT_THEME } from "../shared/constant"
import { CDialog } from "@/components/Dialog"
import { saveStorageItem } from "./database"

export type SettingsStoreType = Readonly<{
	theme    : PlatformThemeMode
	animation: PlatformAnimationMode
	keepAwake: boolean
	languageCode: string
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme    : DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	keepAwake: DEFAULT_KEEP_AWAKE,
	languageCode: DEFAULT_LANGUAGE_CODE
})
const _ref_root = document.documentElement
const _ref_keepAwakeError = $(ElementIds.bdDlg_wakeLockError) as CDialog.CElement
const _ref_keepAwakeBtn = $(ElementIds.apSett_keepAwake) as HTMLInputElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_language = $(ElementIds.apSett_languageMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
let _wakeLock: WakeLockSentinel | null = null

function _subscribeKeepAwakeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const keepAwake = v.keepAwake
	if (keepAwake === o.keepAwake) return

	saveStorageItem('settings/keep-awake', keepAwake)
	if (keepAwake) {
		navigator.wakeLock.request()
		.then((v) => {
			_wakeLock = v
		})
		.catch(() => {
			_ref_keepAwakeError.showModal()
			_wakeLock = null
			SettingsStore.update(v => v.keepAwake = false)
		})
		return
	}

	if (_wakeLock !== null) {
		_wakeLock
			.release()
			.then(() => _wakeLock = null)
			.catch(() => _wakeLock = null)
	}
	else {
		_wakeLock = null
	}
}

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

function _subscribeDatetimeLanguageChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const language = v.languageCode
	if (language === o.animation) return

	saveStorageItem('settings/language-code', language)
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

function _subscribeDatetimeLanguageRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const language = v.languageCode
	if (language === o.animation) return

	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Language)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Language)}"][value="${CSS.escape(language)}"]`
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

function _subscribeKeepAwakeRefView(v: SettingsStoreType): void {
	const keepAwake = v.keepAwake
	if (keepAwake === _ref_keepAwakeBtn.checked) return

	_ref_keepAwakeBtn.checked = keepAwake
}

function _initSubscriber(): void {
	SettingsStore.subscribeAll([
		_subscribeAnimationChanges,
		_subscribeThemeChanges,
		_subscribeAnimationRefView,
		_subscribeThemeRefView,
		_subscribeKeepAwakeRefView,
		_subscribeKeepAwakeChanges,
		_subscribeDatetimeLanguageRefView,
		_subscribeDatetimeLanguageChanges
	])
}

function _initEvents(): void {
	_ref_keepAwakeBtn.addEventListener('change', () => {
		SettingsStore.update(v => v.keepAwake = _ref_keepAwakeBtn.checked)
		_ref_settingsMenu.hidePopover()
	})

	_ref_theme.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.theme = value as PlatformThemeMode)
	})

	_ref_language.addEventListener('change', ev => {
		_ref_settingsMenu.hidePopover()
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value) {
			return
		}

		SettingsStore.update(v => v.languageCode = value)
	})

	_ref_animation.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.animation = value as PlatformAnimationMode)
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