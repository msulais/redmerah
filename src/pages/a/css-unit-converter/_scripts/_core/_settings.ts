import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { $, $$ } from "./_dom-utils"
import { DEFAULT_THEME, DEFAULT_ANIMATION, DEFAULT_PX_PER_REM, DEFAULT_PX_PER_VIEWPORT_HEIGHT, DEFAULT_PX_PER_VIEWPORT_WIDTH, DEFAULT_PX_PER_PERCENTAGE } from "../_shared/_constant"
import type { CButton } from "@/components/Button"
import { isNumberNotDefined } from "@/utils/number"
import { convertLengthUnits } from "../_features/_length"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme: PlatformThemeMode
	animation: PlatformAnimationMode
	pxPerRem: number
	pxPerPercentage: number
	pxPerViewportHeight: number
	pxPerViewportWidth: number
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme: DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	pxPerPercentage: DEFAULT_PX_PER_PERCENTAGE,
	pxPerRem: DEFAULT_PX_PER_REM,
	pxPerViewportHeight: DEFAULT_PX_PER_VIEWPORT_HEIGHT,
	pxPerViewportWidth: DEFAULT_PX_PER_VIEWPORT_WIDTH,
})
const _ref_root = document.documentElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_updateViewport = $(ElementIds.apSett_relativeViewport) as CButton.CElement
const _ref_relativeRem = $(ElementIds.apSett_relativeRem) as HTMLInputElement
const _ref_relativePercent = $(ElementIds.apSett_relativePercent) as HTMLInputElement
const _ref_relativeVw = $(ElementIds.apSett_relativeVw) as HTMLInputElement
const _ref_relativeVh = $(ElementIds.apSett_relativeVh) as HTMLInputElement

let _time_percentage: NodeJS.Timeout | undefined = undefined
let _time_rem: NodeJS.Timeout | undefined = undefined
let _time_vh: NodeJS.Timeout | undefined = undefined
let _time_vw: NodeJS.Timeout | undefined = undefined

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

function _subsRelativeUnitChanges(): void {
	convertLengthUnits()
}

function _subsView(v: SettingsStoreType): void {
	if (!_ref_relativeRem.matches(':focus')) {
		_ref_relativeRem.valueAsNumber = v.pxPerRem
	}

	if (!_ref_relativePercent.matches(':focus')) {
		_ref_relativePercent.valueAsNumber = v.pxPerPercentage
	}

	if (!_ref_relativeVw.matches(':focus')) {
		_ref_relativeVw.valueAsNumber = v.pxPerViewportWidth
	}

	if (!_ref_relativeVh.matches(':focus')) {
		_ref_relativeVh.valueAsNumber = v.pxPerViewportHeight
	}
}

function _subsStorage(v: SettingsStoreType, o: SettingsStoreType): void {
	const rem = v.pxPerRem
	if (rem !== o.pxPerRem) {
		clearTimeout(_time_rem)
		_time_rem = setTimeout(() => saveStorageItem('settings:px-per-rem', rem), 1000)
	}

	const percent = v.pxPerPercentage
	if (percent !== o.pxPerPercentage) {
		clearTimeout(_time_percentage)
		_time_percentage = setTimeout(() => saveStorageItem('settings:px-per-percentage', percent), 1000)
	}

	const vh = v.pxPerViewportHeight
	if (vh !== o.pxPerViewportHeight) {
		clearTimeout(_time_vh)
		_time_vh = setTimeout(() => saveStorageItem('settings:px-per-viewport-height', vh), 1000)
	}

	const vw = v.pxPerViewportWidth
	if (vw !== o.pxPerViewportWidth) {
		clearTimeout(_time_vw)
		_time_vw = setTimeout(() => saveStorageItem('settings:px-per-viewport-width', vw), 1000)
	}
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subsAnimationChanges)
	SettingsStore.subscribe(_subsThemeChanges)
	SettingsStore.subscribe(_subsAnimationView)
	SettingsStore.subscribe(_subsThemeView)
	SettingsStore.subscribe(_subsRelativeUnitChanges)
	SettingsStore.subscribe(_subsStorage)
	SettingsStore.subscribe(_subsView)
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

	_ref_updateViewport.addEventListener('click', ev => {
		ev.preventDefault() // disable auto close dialog

		SettingsStore.update(v => {
			v.pxPerViewportWidth = document.body.clientWidth
			v.pxPerViewportHeight = window.innerHeight
		})
	})

	_ref_relativeRem.addEventListener('input', () => {
		const value = _ref_relativeRem.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		SettingsStore.update(v => v.pxPerRem = value)
	})

	_ref_relativePercent.addEventListener('input', () => {
		const value = _ref_relativePercent.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		SettingsStore.update(v => v.pxPerPercentage = value)
	})

	_ref_relativeVw.addEventListener('input', () => {
		const value = _ref_relativeVw.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		SettingsStore.update(v => v.pxPerViewportWidth = value)
	})

	_ref_relativeVh.addEventListener('input', () => {
		const value = _ref_relativeVh.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		SettingsStore.update(v => v.pxPerViewportHeight = value)
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