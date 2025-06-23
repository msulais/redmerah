import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { $, $$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_THEME } from "../_shared/_constant"
import type { DialogElement } from "@/native-components/Dialog"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme    : PlatformThemeMode
	animation: PlatformAnimationMode
	keepAwake: boolean
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme    : DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	keepAwake: false
})
const _rootRef = document.documentElement
const _keepAwakeErrorRef = $(ElementIds.bodyAlertWakeLockError) as DialogElement
const _keepAwakeBtnRef = $(ElementIds.appbarInfoMenuKeepAwake) as HTMLInputElement
const _themeRef = $(ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
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
			_keepAwakeErrorRef.showModal()
			_wakeLock = null
			SettingsStore.update(v => ({...v, keepAwake: false}))
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

	_rootRef.setAttribute(RootAttributes.animation, animation)
	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.settingsAnimation)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.settingsAnimation)}"][value="${CSS.escape(animation)}"]`
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
		`input[name="${CSS.escape(RadioNames.settingsTheme)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.settingsTheme)}"][value="${CSS.escape(theme)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _subscribeKeepAwakeRefView(v: SettingsStoreType): void {
	const keepAwake = v.keepAwake
	if (keepAwake === _keepAwakeBtnRef.checked) return

	_keepAwakeBtnRef.checked = keepAwake
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
	_keepAwakeBtnRef.addEventListener('change', () => {
		SettingsStore.update(v => ({...v, keepAwake: _keepAwakeBtnRef.checked}))
		_settingsMenuRef.hidePopover()
	})

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