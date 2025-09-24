import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { $, $$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_KEEP_AWAKE, DEFAULT_THEME } from "../_shared/_constant"
import { CDialog } from "@/components/Dialog"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme    : PlatformThemeMode
	animation: PlatformAnimationMode
	keepAwake: boolean
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme    : DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	keepAwake: DEFAULT_KEEP_AWAKE
})
const _ref_root = document.documentElement
const _ref_keepAwakeError = $(ElementIds.bdDlg_wakeLockError) as CDialog.CElement
const _ref_keepAwakeBtn = $(ElementIds.apSett_keepAwake) as HTMLInputElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
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

	_ref_root.setAttribute(RootAttributes.animation, animation)
	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.animation)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.animation)}"][value="${CSS.escape(animation)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subscribeThemeRefView(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	_ref_root.setAttribute(RootAttributes.theme, theme)
	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.theme)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.theme)}"][value="${CSS.escape(theme)}"]`
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
	SettingsStore.subscribe(_subscribeAnimationChanges)
	SettingsStore.subscribe(_subscribeThemeChanges)
	SettingsStore.subscribe(_subscribeAnimationRefView)
	SettingsStore.subscribe(_subscribeThemeRefView)
	SettingsStore.subscribe(_subscribeKeepAwakeRefView)
	SettingsStore.subscribe(_subscribeKeepAwakeChanges)
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

	_ref_animation.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.animation = value as PlatformAnimationMode)
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