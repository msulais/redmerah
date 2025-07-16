import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_BEAUTIFY, DEFAULT_KEEP_CLASS_NAMES, DEFAULT_KEEP_FUNC_NAMES, DEFAULT_MODULE, DEFAULT_TEXT_WRAP, DEFAULT_THEME, DEFAULT_TOP_LEVEL } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import { MinifyStore } from "./_minify"
import { saveStorageItem } from "./_database"

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
const _rootRef = document.documentElement
const _themeRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _inputRef = $(ElementIds.bd_input) as HTMLTextAreaElement
const _outputRef = $(ElementIds.bd_output) as HTMLTextAreaElement
const _sett_textWrapRef = $(ElementIds.apSett_textWrap) as HTMLInputElement
const _sett_moduleRef = $(ElementIds.apSett_module) as HTMLInputElement
const _sett_keepClsNamesRef = $(ElementIds.apSett_keepClsNames) as HTMLInputElement
const _sett_keepFnNamesRef = $(ElementIds.apSett_keepFnNames) as HTMLInputElement
const _sett_topLevelRef = $(ElementIds.apSett_topLevel) as HTMLInputElement
const _sett_beautifyRef = $(ElementIds.apSett_beautify) as HTMLInputElement

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

	_inputRef.toggleAttribute('data-text-wrap', textWrap)
	_outputRef.toggleAttribute('data-text-wrap', textWrap)
	_sett_textWrapRef.checked = textWrap
}

function _subsTextWrapChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const textWrap = v.textWrap
	if (textWrap === o.textWrap) {return}

	saveStorageItem('settings:text-wrap', textWrap)
}

function _subsModuleView(v: SettingsStoreType): void {
	const module = v.module
	if (module === _sett_moduleRef.checked) {return}

	_sett_moduleRef.checked = module
}

function _subsModuleChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const module = v.module
	if (module === o.module) {return}

	saveStorageItem('settings:module', module)
}

function _subsKeepClsNamesView(v: SettingsStoreType): void {
	const clsNames = v.keepClassNames
	if (clsNames === _sett_keepClsNamesRef.checked) {return}

	_sett_keepClsNamesRef.checked = clsNames
}

function _subsKeepClsNamesChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const clsNames = v.keepClassNames
	if (clsNames === o.keepClassNames) {return}

	saveStorageItem('settings:keep-class-names', clsNames)
}

function _subsKeepFnNamesView(v: SettingsStoreType): void {
	const fnNames = v.keepFunctionNames
	if (fnNames === _sett_keepFnNamesRef.checked) {return}

	_sett_keepFnNamesRef.checked = fnNames
}

function _subsKeepFnNamesChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const fnNames = v.keepFunctionNames
	if (fnNames === o.keepFunctionNames) {return}

	saveStorageItem('settings:keep-function-names', fnNames)
}

function _subsTopLevelView(v: SettingsStoreType): void {
	const topLevel = v.topLevel
	if (topLevel === _sett_topLevelRef.checked) {return}

	_sett_topLevelRef.checked = topLevel
}

function _subsTopLevelChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const topLevel = v.topLevel
	if (topLevel === o.topLevel) {return}

	saveStorageItem('settings:top-level', topLevel)
}

function _subsBeautifyView(v: SettingsStoreType): void {
	const beautify = v.beautify
	if (beautify === _sett_beautifyRef.checked) {return}

	_sett_beautifyRef.checked = beautify
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

	_settingsMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target?.checked
		switch (target) {
		case _sett_textWrapRef:
			SettingsStore.update(v => v.textWrap = checked)
			break
		case _sett_moduleRef:
			SettingsStore.update(v => v.module = checked)
			break
		case _sett_keepClsNamesRef:
			SettingsStore.update(v => v.keepClassNames = checked)
			break
		case _sett_keepFnNamesRef:
			SettingsStore.update(v => v.keepFunctionNames = checked)
			break
		case _sett_topLevelRef:
			SettingsStore.update(v => v.topLevel = checked)
			break
		case _sett_beautifyRef:
			SettingsStore.update(v => v.beautify = checked)
			break
		}
		_settingsMenuRef.hidePopover()
		MinifyStore.notify()
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