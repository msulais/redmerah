import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../shared/ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../shared/input-names"
import { DEFAULT_ANIMATION, DEFAULT_BEAUTIFY, DEFAULT_KEEP_CLASS_NAMES, DEFAULT_KEEP_FUNC_NAMES, DEFAULT_MODULE, DEFAULT_TEXT_WRAP, DEFAULT_THEME, DEFAULT_TOP_LEVEL } from "../shared/constant"
import { $, $$ } from "./dom-utils"
import { MinifyStore } from "./minify"
import { saveStorageItem } from "./database"

export type SettingsStoreType = Readonly<{
	theme: PlatformThemeMode
	animation: PlatformAnimationMode
	textWrap: boolean
	module: boolean
	keepClassNames: boolean
	keepFunctionNames: boolean
	topLevel: boolean
	beautify: boolean
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme: DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	beautify: DEFAULT_BEAUTIFY,
	keepClassNames: DEFAULT_KEEP_CLASS_NAMES,
	keepFunctionNames: DEFAULT_KEEP_FUNC_NAMES,
	module: DEFAULT_MODULE,
	textWrap: DEFAULT_TEXT_WRAP,
	topLevel: DEFAULT_TOP_LEVEL
})
const _ref_root = document.documentElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_input = $(ElementIds.bd_input) as HTMLTextAreaElement
const _ref_output = $(ElementIds.bd_output) as HTMLTextAreaElement
const _ref_sett_textWrap = $(ElementIds.apSett_textWrap) as HTMLInputElement
const _ref_sett_module = $(ElementIds.apSett_module) as HTMLInputElement
const _ref_sett_keepClsNames = $(ElementIds.apSett_keepClsNames) as HTMLInputElement
const _ref_sett_keepFnNames = $(ElementIds.apSett_keepFnNames) as HTMLInputElement
const _ref_sett_topLevel = $(ElementIds.apSett_topLevel) as HTMLInputElement
const _ref_sett_beautify = $(ElementIds.apSett_beautify) as HTMLInputElement

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

	_ref_input.toggleAttribute('data-text-wrap', textWrap)
	_ref_output.toggleAttribute('data-text-wrap', textWrap)
	_ref_sett_textWrap.checked = textWrap
}

function _subsTextWrapChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	saveStorageItem('settings:text-wrap', textWrap)
}

function _subsModuleView(v: SettingsStoreType): void {
	const module = v.module
	if (module === _ref_sett_module.checked) {return}

	_ref_sett_module.checked = module
}

function _subsModuleChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const module = v.module
	if (module === o.module) {return}

	saveStorageItem('settings:module', module)
}

function _subsKeepClsNamesView(v: SettingsStoreType): void {
	const clsNames = v.keepClassNames
	if (clsNames === _ref_sett_keepClsNames.checked) {return}

	_ref_sett_keepClsNames.checked = clsNames
}

function _subsKeepClsNamesChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const clsNames = v.keepClassNames
	if (clsNames === o.keepClassNames) {return}

	saveStorageItem('settings:keep-class-names', clsNames)
}

function _subsKeepFnNamesView(v: SettingsStoreType): void {
	const fnNames = v.keepFunctionNames
	if (fnNames === _ref_sett_keepFnNames.checked) {return}

	_ref_sett_keepFnNames.checked = fnNames
}

function _subsKeepFnNamesChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const fnNames = v.keepFunctionNames
	if (fnNames === o.keepFunctionNames) {return}

	saveStorageItem('settings:keep-function-names', fnNames)
}

function _subsTopLevelView(v: SettingsStoreType): void {
	const topLevel = v.topLevel
	if (topLevel === _ref_sett_topLevel.checked) {return}

	_ref_sett_topLevel.checked = topLevel
}

function _subsTopLevelChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const topLevel = v.topLevel
	if (topLevel === o.topLevel) {return}

	saveStorageItem('settings:top-level', topLevel)
}

function _subsBeautifyView(v: SettingsStoreType): void {
	const beautify = v.beautify
	if (beautify === _ref_sett_beautify.checked) {return}

	_ref_sett_beautify.checked = beautify
}

function _subsBeautifyChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const beautify = v.beautify
	if (beautify === o.beautify) {return}

	saveStorageItem('settings:beautify', beautify)
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subsAnimationChanges)
	SettingsStore.subscribe(_subsThemeChanges)
	SettingsStore.subscribe(_subsAnimationView)
	SettingsStore.subscribe(_subsThemeView)
	SettingsStore.subscribe(_subsTextWrapView)
	SettingsStore.subscribe(_subsTextWrapChanges)
	SettingsStore.subscribe(_subsModuleView)
	SettingsStore.subscribe(_subsModuleChanges)
	SettingsStore.subscribe(_subsKeepClsNamesView)
	SettingsStore.subscribe(_subsKeepClsNamesChanges)
	SettingsStore.subscribe(_subsKeepFnNamesView)
	SettingsStore.subscribe(_subsKeepFnNamesChanges)
	SettingsStore.subscribe(_subsTopLevelView)
	SettingsStore.subscribe(_subsTopLevelChanges)
	SettingsStore.subscribe(_subsBeautifyView)
	SettingsStore.subscribe(_subsBeautifyChanges)
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
		case _ref_sett_module:
			SettingsStore.update(v => v.module = checked)
			break
		case _ref_sett_keepClsNames:
			SettingsStore.update(v => v.keepClassNames = checked)
			break
		case _ref_sett_keepFnNames:
			SettingsStore.update(v => v.keepFunctionNames = checked)
			break
		case _ref_sett_topLevel:
			SettingsStore.update(v => v.topLevel = checked)
			break
		case _ref_sett_beautify:
			SettingsStore.update(v => v.beautify = checked)
			break
		}
		_ref_settingsMenu.hidePopover()
		MinifyStore.notify()
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