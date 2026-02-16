import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_PREFIX, DEFAULT_SUFFIX, DEFAULT_TEXT_WRAP, DEFAULT_THEME } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import { CDialog } from "@/components/Dialog"
import { CMenu } from "@/components/Menu"
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
const _ref_root = document.documentElement
const _ref_textWrap = $(ElementIds.apSett_textWrap) as HTMLInputElement
const _ref_preSufDialog = $(ElementIds.apSett_preSufDialog) as CDialog.CElement
const _ref_prefixSuffix = $(ElementIds.apSett_prefixSuffix) as CMenu.CItem.CElement
const _ref_prefix = $(ElementIds.apSett_prefix) as HTMLInputElement
const _ref_suffix = $(ElementIds.apSett_suffix) as HTMLInputElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_latexList = $(ElementIds.bd_list) as HTMLUListElement
let _time_prefix: NodeJS.Timeout | number | null = null
let _time_suffix: NodeJS.Timeout | number | null = null

function _subsAnimationChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const animation = v.animation
	if (animation === o.animation) return

	localStorage.setItem(LocalStorageKeys.PlatformAnimation, animation)
}

function _subsThemeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const theme = v.theme
	if (theme === o.theme) return

	localStorage.setItem(LocalStorageKeys.PlatformTheme, theme)
}

function _subsAnimationView(v: SettingsStoreType, o: SettingsStoreType): void {
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

function _subsThemeView(v: SettingsStoreType, o: SettingsStoreType): void {
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

function _subsTextWrapView(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	_ref_textWrap.checked = textWrap
	_ref_latexList.toggleAttribute('data-text-wrap', textWrap)
}

function _subsTextWrapChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	saveStorageItem('settings:text-wrap', textWrap)
}

function _subsPrefixView(v: SettingsStoreType): void {
	const prefix = v.prefix
	if (prefix === _ref_prefix.value) {return}

	_ref_prefix.value = prefix
}

function _subsPrefixChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const prefix = v.prefix
	if (prefix === o.prefix) {return}

	saveStorageItem('settings:prefix', prefix)
}

function _subsSuffixView(v: SettingsStoreType): void {
	const suffix = v.suffix
	if (suffix === _ref_suffix.value) {return}

	_ref_suffix.value = suffix
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

	_ref_prefixSuffix.addEventListener('click', () => {
		_ref_settingsMenu.hidePopover()
		_ref_preSufDialog.showModal()
	})

	_ref_prefix.addEventListener('input', () => {
		if (_time_prefix !== null) {
			clearTimeout(_time_prefix)
		}

		_time_prefix = setTimeout(() => {
			_time_prefix = null
			SettingsStore.update(v => v.prefix = _ref_prefix.value)
		}, 100)
	})

	_ref_suffix.addEventListener('input', () => {
		if (_time_suffix !== null) {
			clearTimeout(_time_suffix)
		}

		_time_suffix = setTimeout(() => {
			_time_suffix = null
			SettingsStore.update(v => v.suffix = _ref_suffix.value)
		}, 100)
	})

	_ref_textWrap.addEventListener('change', () => {
		_ref_settingsMenu.hidePopover()
		SettingsStore.update(v => v.textWrap = _ref_textWrap.checked)
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