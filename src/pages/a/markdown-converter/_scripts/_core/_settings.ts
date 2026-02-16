import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_TEXT_WRAP, DEFAULT_THEME } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme: PlatformThemeMode
	animation: PlatformAnimationMode
	textWrap: boolean
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme: DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	textWrap: DEFAULT_TEXT_WRAP,
})
const _ref_root = document.documentElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_markdown = $(ElementIds.bd_markdown) as HTMLTextAreaElement
const _ref_html = $(ElementIds.bd_html) as HTMLTextAreaElement
const _ref_css = $(ElementIds.bd_css) as HTMLTextAreaElement
const _ref_sett_textWrap = $(ElementIds.apSett_textWrap) as HTMLInputElement

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

	_ref_markdown.toggleAttribute('data-text-wrap', textWrap)
	_ref_html.toggleAttribute('data-text-wrap', textWrap)
	_ref_css.toggleAttribute('data-text-wrap', textWrap)
	_ref_sett_textWrap.checked = textWrap
}

function _subsTextWrapChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	saveStorageItem('settings:text-wrap', textWrap)
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subsAnimationChanges)
	SettingsStore.subscribe(_subsThemeChanges)
	SettingsStore.subscribe(_subsAnimationView)
	SettingsStore.subscribe(_subsThemeView)
	SettingsStore.subscribe(_subsTextWrapView)
	SettingsStore.subscribe(_subsTextWrapChanges)
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

	_ref_settingsMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target?.checked
		switch (target) {
		case _ref_sett_textWrap:
			SettingsStore.update(v => v.textWrap = checked)
			break
		}
		_ref_settingsMenu.hidePopover()
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