import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_PREFIX, DEFAULT_SUFFIX, DEFAULT_TEXT_WRAP, DEFAULT_THEME } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import type { DialogElement } from "@/native-components/Dialog"
import type { MenuItemElement } from "@/native-components/Menu"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme: PlatformThemeMode
	animation: PlatformAnimationMode
	prefix: string
	suffix: string
	textWrap: boolean
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme: DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	prefix: DEFAULT_PREFIX,
	suffix: DEFAULT_SUFFIX,
	textWrap: DEFAULT_TEXT_WRAP
})
const _rootRef = document.documentElement
const _textWrapRef = $(ElementIds.apSett_textWrap) as HTMLInputElement
const _preSufDialogRef = $(ElementIds.apSett_preSufDialog) as DialogElement
const _prefixSuffixRef = $(ElementIds.apSett_prefixSuffix) as MenuItemElement
const _prefixRef = $(ElementIds.apSett_prefix) as HTMLInputElement
const _suffixRef = $(ElementIds.apSett_suffix) as HTMLInputElement
const _themeRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _latexListRef = $(ElementIds.bd_list) as HTMLUListElement
let _timePrefixId: NodeJS.Timeout | number | null = null
let _timeSuffixId: NodeJS.Timeout | number | null = null

function _subsAnimationChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
}

function _subsThemeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	localStorage.setItem(LocalStorageKeys.platformTheme, theme)
}

function _subsAnimationView(v: SettingsStoreType, o: SettingsStoreType): void {
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

function _subsThemeView(v: SettingsStoreType, o: SettingsStoreType): void {
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

function _subsTextWrapView(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	_textWrapRef.checked = textWrap
	_latexListRef.toggleAttribute('data-text-wrap', textWrap)
}

function _subsTextWrapChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	saveStorageItem('settings:text-wrap', textWrap)
}

function _subsPrefixView(v: SettingsStoreType): void {
	const prefix = v.prefix
	if (prefix === _prefixRef.value) {return}

	_prefixRef.value = prefix
}

function _subsPrefixChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const prefix = v.prefix
	if (prefix === o.prefix) {return}

	saveStorageItem('settings:prefix', prefix)
}

function _subsSuffixView(v: SettingsStoreType): void {
	const suffix = v.suffix
	if (suffix === _suffixRef.value) {return}

	_suffixRef.value = suffix
}

function _subsSuffixChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const suffix = v.suffix
	if (suffix === o.suffix) {return}

	saveStorageItem('settings:suffix', suffix)
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subsAnimationChanges)
	SettingsStore.subscribe(_subsThemeChanges)
	SettingsStore.subscribe(_subsAnimationView)
	SettingsStore.subscribe(_subsThemeView)
	SettingsStore.subscribe(_subsTextWrapChanges)
	SettingsStore.subscribe(_subsTextWrapView)
	SettingsStore.subscribe(_subsSuffixChanges)
	SettingsStore.subscribe(_subsSuffixView)
	SettingsStore.subscribe(_subsPrefixChanges)
	SettingsStore.subscribe(_subsPrefixView)
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

	_prefixSuffixRef.addEventListener('click', () => {
		_settingsMenuRef.hidePopover()
		_preSufDialogRef.showModal()
	})

	_prefixRef.addEventListener('input', () => {
		if (_timePrefixId !== null) {
			clearTimeout(_timePrefixId)
		}

		_timePrefixId = setTimeout(() => {
			_timePrefixId = null
			SettingsStore.update(v => ({...v, prefix: _prefixRef.value}))
		}, 100)
	})

	_suffixRef.addEventListener('input', () => {
		if (_timeSuffixId !== null) {
			clearTimeout(_timeSuffixId)
		}

		_timeSuffixId = setTimeout(() => {
			_timeSuffixId = null
			SettingsStore.update(v => ({...v, suffix: _suffixRef.value}))
		}, 100)
	})

	_textWrapRef.addEventListener('change', () => {
		_settingsMenuRef.hidePopover()
		SettingsStore.update(v => ({...v, textWrap: _textWrapRef.checked}))
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