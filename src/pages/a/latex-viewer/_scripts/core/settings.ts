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

export const sg_theme     = signal(Constant.DEFAULT_THEME)
export const sg_animation = signal(Constant.DEFAULT_ANIMATION)
export const sg_prefix    = signal(Constant.DEFAULT_PREFIX)
export const sg_suffix    = signal(Constant.DEFAULT_SUFFIX)
export const sg_textWrap  = signal(Constant.DEFAULT_TEXT_WRAP)

const _ref_theme            = $$<BrTheme.BiruThemeElement>(BrTheme.TAGNAME)
const _ref_themePopover     = $(Ids.PopoverAppBarSettingsTheme) as BrPopover.BiruPopoverElement
const _ref_animationPopover = $(Ids.PopoverAppBarSettingsAnimation) as BrPopover.BiruPopoverElement
const _ref_textWrap         = $(Ids.PopoverAppBarSettingsTextWrap) as HTMLInputElement
const _ref_prefix           = $(Ids.PrefixInput) as HTMLInputElement
const _ref_suffix           = $(Ids.SuffixInput) as HTMLInputElement
const _ref_latexList        = $(Ids.List) as HTMLUListElement

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
	sg_prefix.subscribe(v => {
		if (!_ref_prefix.matches(':focus')) {
			_ref_prefix.value = v
		}

		saveStorageItem('settings-prefix', v)
	})

	sg_suffix.subscribe(v => {
		if (!_ref_suffix.matches(':focus')) {
			_ref_suffix.value = v
		}

		saveStorageItem('settings-suffix', v)
	})

	sg_textWrap.subscribe(v => {
		_ref_textWrap.checked = v
		saveStorageItem('settings-text-wrap', v)
		_ref_latexList.toggleAttribute('data-text-wrap', v)
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

	delegateEvent(_ref_textWrap, 'change', () => sg_textWrap.set(_ref_textWrap.checked))
	delegateEvent(_ref_prefix, 'input', () => sg_prefix.set(_ref_prefix.value))
	delegateEvent(_ref_suffix, 'input', () => sg_suffix.set(_ref_suffix.value))
}

export default () => {
	_initAnimation()
	_initTheme()
	_initSubscriber()
	_initEvents()
}