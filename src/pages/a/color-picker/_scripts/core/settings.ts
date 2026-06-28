import * as Constant from "../shared/constant.enum.js";
import * as Ids from '../shared/ids.enum.js'
import * as AnimationEasing from '@/enums/animation-easing.enum.js'
import * as ColorPickerMode from '../shared/modes.enum.js'
import * as InputNames from '../shared/input-names.enum.js'
import * as BrPopover from "@/web-components/components/br-popover";
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as LocalStorageKeys from '@/enums/local-storage-keys.enum.js'
import { signal } from "@/utils/signal.js";
import { $, $$, $$$ } from "./dom-utils.js";
import { isValidEnumValue } from "@/utils/object.js";
import type { EnumOf } from "@/types/collections.js";
import { saveStorageItem } from "./database.js";
import { delegateEvent } from "@/utils/event-registry.js";

export const sg_theme      = signal(Constant.DEFAULT_THEME)
export const sg_animation  = signal(Constant.DEFAULT_ANIMATION)
export const sg_pickerMode = signal<EnumOf<typeof ColorPickerMode>>(Constant.DEFAULT_PICKER_MODE)

const _ref_theme            = $$<BrTheme.BiruThemeElement>(BrTheme.TAGNAME)
const _ref_themePopover     = $(Ids.PopoverAppBarSettingsTheme) as BrPopover.BiruPopoverElement
const _ref_animationPopover = $(Ids.PopoverAppBarSettingsAnimation) as BrPopover.BiruPopoverElement
const _ref_pickerMode       = $(Ids.PickerMode) as HTMLSelectElement

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
	sg_pickerMode.subscribe(v => {
		saveStorageItem('color-picker-mode', v)

		let hasMode = false
		_ref_pickerMode.value = v
		for (const ref of $$$<HTMLDivElement>('[data-picker-mode]')) {
			if (!hasMode && ref.dataset.pickerMode === v) {
				ref.hidden = false
				hasMode = true

				const max = Math.max(ref.offsetWidth, ref.offsetHeight)
				const startScale = (max / (max + 16) * 100) + '%'
				ref.animate({
					opacity: [0, 1],
					scale: [startScale, '1']
				}, {
					duration: (_ref_theme?.biru.transitionDuration ?? 0) > 0? 500 : 0,
					easing: AnimationEasing.Spring
				})
				continue
			}

			ref.hidden = true
		}
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

	delegateEvent(_ref_pickerMode, 'change', () => {
		const value = _ref_pickerMode.value as EnumOf<typeof ColorPickerMode>
		if (!isValidEnumValue(value, ColorPickerMode)) {
			return
		}

		sg_pickerMode.set(value)
	})
}

export default () => {
	_initAnimation()
	_initTheme()
	_initSubscriber()
	_initEvents()
}