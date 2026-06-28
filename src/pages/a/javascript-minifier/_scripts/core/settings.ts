import * as Constant from "../shared/constant.enum.js";
import * as Ids from '../shared/ids.enum.js'
import * as InputNames from '../shared/input-names.enum.js'
import * as BrPopover from "@/web-components/components/br-popover";
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as LocalStorageKeys from '@/enums/local-storage-keys.enum.js'
import { signal } from "@/utils/signal.js";
import { $, $$ } from "./dom-utils.js";
import { isValidEnumValue } from "@/utils/object.js";
import { delegateEvent } from "@/utils/event-registry.js";
import { saveStorageItem } from "./database.js";

export const sg_theme             = signal(Constant.DEFAULT_THEME)
export const sg_animation         = signal(Constant.DEFAULT_ANIMATION)
export const sg_textWrap          = signal(Constant.DEFAULT_TEXT_WRAP)
export const sg_module            = signal(Constant.DEFAULT_MODULE)
export const sg_keepClassNames    = signal(Constant.DEFAULT_KEEP_CLASS_NAMES)
export const sg_keepFunctionNames = signal(Constant.DEFAULT_KEEP_FUNC_NAMES)
export const sg_topLevel          = signal(Constant.DEFAULT_TOP_LEVEL)
export const sg_beautify          = signal(Constant.DEFAULT_BEAUTIFY)

const _ref_theme             = $$<BrTheme.BiruThemeElement>(BrTheme.TAGNAME)
const _ref_themePopover      = $(Ids.PopoverAppBarSettingsTheme) as BrPopover.BiruPopoverElement
const _ref_animationPopover  = $(Ids.PopoverAppBarSettingsAnimation) as BrPopover.BiruPopoverElement
const _ref_input             = $(Ids.Input) as HTMLTextAreaElement
const _ref_output            = $(Ids.Output) as HTMLTextAreaElement
const _ref_sett_textWrap     = $(Ids.PopoverAppBarSettingsTextWrap) as HTMLInputElement
const _ref_sett_module       = $(Ids.PopoverAppBarSettingsModule) as HTMLInputElement
const _ref_sett_keepClsNames = $(Ids.PopoverAppBarSettingsKeepClsNames) as HTMLInputElement
const _ref_sett_keepFnNames  = $(Ids.PopoverAppBarSettingsKeepFnNames) as HTMLInputElement
const _ref_sett_topLevel     = $(Ids.PopoverAppBarSettingsTopLevel) as HTMLInputElement
const _ref_sett_beautify     = $(Ids.PopoverAppBarSettingsBeautify) as HTMLInputElement

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.PlatformTheme)
	if (!_ref_theme || !theme || !isValidEnumValue(theme, BrTheme.ThemeMode) || theme === Constant.DEFAULT_THEME) {
		return
	}

	_ref_theme.biru.themeMode = theme as BrTheme.ThemeMode
	const ref_previous = $$(
		`input[name="${CSS.escape(InputNames.Theme)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(InputNames.Theme)}"][value="${CSS.escape(theme)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {
		return
	}

	if (ref_previous) {
		ref_previous.checked = false
	}

	if (ref_target) {
		ref_target.checked = true
	}
}

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.PlatformAnimation)
	if (!_ref_theme || !animation || !isValidEnumValue(animation, BrTheme.Animation) || animation === Constant.DEFAULT_ANIMATION) {
		return
	}

	_ref_theme.biru.animation = animation as BrTheme.Animation
	const ref_previous = $$(
		`input[name="${CSS.escape(InputNames.Animation)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(InputNames.Animation)}"][value="${CSS.escape(animation)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {
		return
	}

	if (ref_previous) {
		ref_previous.checked = false
	}

	if (ref_target) {
		ref_target.checked = true
	}
}

function _initSubscriber(): void {
	sg_textWrap.subscribe(v => {
		_ref_input.toggleAttribute('data-text-wrap', v)
		_ref_output.toggleAttribute('data-text-wrap', v)
		_ref_sett_textWrap.checked = v
		saveStorageItem('settings-text-wrap', v)
	})

	sg_module.subscribe(v => {
		_ref_sett_module.checked = v
		saveStorageItem('settings-module', v)
	})

	sg_keepClassNames.subscribe(v => {
		_ref_sett_keepClsNames.checked = v
		saveStorageItem('settings-keep-class-names', v)
	})

	sg_keepFunctionNames.subscribe(v => {
		_ref_sett_keepFnNames.checked = v
		saveStorageItem('settings-keep-function-names', v)
	})

	sg_topLevel.subscribe(v => {
		_ref_sett_topLevel.checked = v
		saveStorageItem('settings-top-level', v)
	})

	sg_beautify.subscribe(v => {
		_ref_sett_beautify.checked = v
		saveStorageItem('settings-beautify', v)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_themePopover, 'change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as BrTheme.ThemeMode
		if (!_ref_theme || !value || !isValidEnumValue(value, BrTheme.ThemeMode)) {
			return
		}

		_ref_theme.biru.themeMode = value
		localStorage.setItem(LocalStorageKeys.PlatformTheme, value)
		sg_theme.set(value)
	})

	delegateEvent(_ref_animationPopover, 'change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as BrTheme.Animation
		if (!_ref_theme || !value || !isValidEnumValue(value, BrTheme.Animation)) {
			return
		}

		_ref_theme.biru.animation = value
		localStorage.setItem(LocalStorageKeys.PlatformAnimation, value)
		sg_animation.set(value)
	})

	delegateEvent(_ref_sett_textWrap    , 'change', () => sg_textWrap         .set(_ref_sett_textWrap    .checked))
	delegateEvent(_ref_sett_module      , 'change', () => sg_module           .set(_ref_sett_module      .checked))
	delegateEvent(_ref_sett_keepClsNames, 'change', () => sg_keepClassNames   .set(_ref_sett_keepClsNames.checked))
	delegateEvent(_ref_sett_keepFnNames , 'change', () => sg_keepFunctionNames.set(_ref_sett_keepFnNames .checked))
	delegateEvent(_ref_sett_topLevel    , 'change', () => sg_topLevel         .set(_ref_sett_topLevel    .checked))
	delegateEvent(_ref_sett_beautify    , 'change', () => sg_beautify         .set(_ref_sett_beautify    .checked))
}

export default () => {
	_initAnimation()
	_initTheme()
	_initSubscriber()
	_initEvents()
}