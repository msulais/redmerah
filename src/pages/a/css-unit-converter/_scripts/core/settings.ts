import * as Constant from "../shared/constant.enum.js";
import * as Ids from '../shared/ids.enum.js'
import * as Pages from '../shared/pages.enum.js'
import * as InputNames from '../shared/input-names.enum.js'
import * as BrPopover from "@/web-components/components/br-popover";
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as LocalStorageKeys from '@/enums/local-storage-keys.enum.js'
import * as Length from '../features/length.js'
import { listenRouteChange } from '@/web-components/router.js'
import { batch, signal } from "@/utils/signal.js";
import { $, $$ } from "./dom-utils.js";
import { isValidEnumValue } from "@/utils/object.js";
import { isNumberNotDefined } from "@/utils/number.js";
import { saveStorageItem } from "./database.js";
import { delegateEvent } from "@/utils/event-registry.js";

export const sg_theme           = signal(Constant.DEFAULT_THEME)
export const sg_animation       = signal(Constant.DEFAULT_ANIMATION)
export const sg_page            = signal<typeof Pages[keyof typeof Pages]>(Pages.Length)
export const sg_pxPerRem        = signal(Constant.DEFAULT_PX_PER_REM)
export const sg_pxPer100Percent = signal(Constant.DEFAULT_PX_PER_100_PERCENT)
export const sg_pxPer100VH      = signal(Constant.DEFAULT_PX_PER_100_VIEWPORT_HEIGHT)
export const sg_pxPer100VW      = signal(Constant.DEFAULT_PX_PER_100_VIEWPORT_WIDTH)

const _ref_theme              = $$<BrTheme.BiruThemeElement>(BrTheme.TAGNAME)
const _ref_themePopover       = $(Ids.PopoverAppBarSettingsTheme) as BrPopover.BiruPopoverElement
const _ref_animationPopover   = $(Ids.PopoverAppBarSettingsAnimation) as BrPopover.BiruPopoverElement
const _ref_relativeViewport   = $(Ids.RelativeViewport) as HTMLButtonElement
const _ref_relativeRem        = $(Ids.RelativeREM) as HTMLInputElement
const _ref_relativePercentage = $(Ids.RelativePercentage) as HTMLInputElement
const _ref_relativeVw         = $(Ids.RelativeVW) as HTMLInputElement
const _ref_relativeVh         = $(Ids.RelativeVH) as HTMLInputElement

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

function _updatePage(): void {
	const page = new URLSearchParams(window.location.search).get('page') as (typeof Pages[keyof typeof Pages])
	if (!page || !isValidEnumValue(page, Pages)) {
		return
	}

	sg_page.set(page)
}

function _initSubscriber(): void {
	sg_pxPerRem.subscribe(v => {
		if (!_ref_relativeRem.matches(':focus')) {
			_ref_relativeRem.valueAsNumber = v
		}

		saveStorageItem('settings-px-per-rem', v, 250)
		Length.sg_input.notify()
	})

	sg_pxPer100Percent.subscribe(v => {
		if (!_ref_relativePercentage.matches(':focus')) {
			_ref_relativePercentage.valueAsNumber = v
		}

		saveStorageItem('settings-px-per-100%', v, 250)
		Length.sg_input.notify()
	})

	sg_pxPer100VH.subscribe(v => {
		if (!_ref_relativeVh.matches(':focus')) {
			_ref_relativeVh.valueAsNumber = v
		}

		saveStorageItem('settings-px-per-100vh', v, 250)
		Length.sg_input.notify()
	})

	sg_pxPer100VW.subscribe(v => {
		if (!_ref_relativeVw.matches(':focus')) {
			_ref_relativeVw.valueAsNumber = v
		}

		saveStorageItem('settings-px-per-100vw', v, 250)
		Length.sg_input.notify()
	})
}

function _initEvents(): void {
	listenRouteChange(() => _updatePage())

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

	delegateEvent(_ref_relativeViewport, 'click', () => {
		batch(() => {
			sg_pxPer100VW.set(window.innerWidth)
			sg_pxPer100VH.set(window.innerHeight)
		})
	})

	delegateEvent(_ref_relativeRem, 'input', () => {
		const value = _ref_relativeRem.valueAsNumber
		if (isNumberNotDefined(value)) {
			return
		}

		sg_pxPerRem.set(value)
	})

	delegateEvent(_ref_relativeRem, 'focusout', () => {
		_ref_relativeRem.valueAsNumber = sg_pxPerRem()
	})

	delegateEvent(_ref_relativePercentage, 'input', () => {
		const value = _ref_relativePercentage.valueAsNumber
		if (isNumberNotDefined(value)) {
			return
		}

		sg_pxPer100Percent.set(value)
	})

	delegateEvent(_ref_relativePercentage, 'focusout', () => {
		_ref_relativePercentage.valueAsNumber = sg_pxPer100Percent()
	})

	delegateEvent(_ref_relativeVw, 'input', () => {
		const value = _ref_relativeVw.valueAsNumber
		if (isNumberNotDefined(value)) {
			return
		}

		sg_pxPer100VW.set(value)
	})

	delegateEvent(_ref_relativeVw, 'focusout', () => {
		_ref_relativeVw.valueAsNumber = sg_pxPer100VW()
	})

	delegateEvent(_ref_relativeVh, 'input', () => {
		const value = _ref_relativeVh.valueAsNumber
		if (isNumberNotDefined(value)) {
			return
		}

		sg_pxPer100VH.set(value)
	})

	delegateEvent(_ref_relativeVh, 'focusout', () => {
		_ref_relativeVh.valueAsNumber = sg_pxPer100VH()
	})
}

export default () => {
	_initSubscriber()
	_initAnimation()
	_initTheme()
	_initEvents()
	_updatePage()
}