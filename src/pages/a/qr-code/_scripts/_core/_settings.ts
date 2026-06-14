import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_THEME, DEFAULT_VERSION } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import { EncodingMode, ErrorCorrectionLevel, QRVersion } from "../_shared/_enums"
import type { HEXColor } from "@/types/color"
import { CMenu } from "@/components/Menu"
import { CDialog } from "@/components/Dialog"
import { CButton } from "@/components/Button"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { CColorPicker } from "@/components/ColorPicker"
import { subsSettingsStore } from "../_features/_generate"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme: PlatformThemeMode
	animation: PlatformAnimationMode
	errorCorrectionLevel: ErrorCorrectionLevel
	encodingMode: EncodingMode
	version: QRVersion
	backgroundColor: HEXColor
	color: HEXColor
	margin: number
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme: DEFAULT_THEME,
	animation: DEFAULT_ANIMATION,
	backgroundColor: DEFAULT_BACKGROUND_COLOR,
	color: DEFAULT_COLOR,
	encodingMode: DEFAULT_ENCODING_MODE,
	errorCorrectionLevel: DEFAULT_ERROR_CORRECTION_LEVEL,
	margin: DEFAULT_MARGIN,
	version: DEFAULT_VERSION
})
const _ref_root = document.documentElement
const _ref_colorDialog = $(ElementIds.apSett_colorDialog) as CDialog.CElement
const _ref_colorBtn = $(ElementIds.apSett_colorBtn) as CMenu.CItem.CElement
const _ref_colorSave = $(ElementIds.apSett_colorSave) as CButton.CElement
const _ref_marginSave = $(ElementIds.apSett_marginSave) as CButton.CElement
const _ref_marginInput = $(ElementIds.apSett_marginInput) as HTMLInputElement
const _ref_theme = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animation = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_margin = $(ElementIds.apSett_marginBtn) as CMenu.CItem.CElement
const _ref_marginDialog = $(ElementIds.apSett_marginDialog) as CDialog.CElement
const _ref_pickerFore = $(ElementIds.apSett_colorForePicker) as CColorPicker.CElement
const _ref_pickerForeBtn = $(ElementIds.apSett_colorForePickerBtn) as CColorPicker.CElement
const _ref_pickerBackBtn = $(ElementIds.apSett_colorBackPickerBtn2) as CColorPicker.CElement
const _ref_pickerBack = $(ElementIds.apSett_colorBackPicker) as CColorPicker.CElement
const _ref_previewForeground = $(ElementIds.apSett_colorPreviewForeground) as HTMLElement
const _ref_previewBackground = $(ElementIds.apSett_colorPreviewBackground) as HTMLDivElement
const _ref_versionMenu = $(ElementIds.apSett_versionMenu) as CMenu.CSub.CElement
const _ref_encodingMenu = $(ElementIds.apSett_encodingMenu) as CMenu.CSub.CElement
const _ref_correctionMenu = $(ElementIds.apSett_correctionMenu) as CMenu.CSub.CElement

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

function _subsBackgroundColorChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const bgColor = v.backgroundColor
	if (bgColor === o.backgroundColor) {return}

	saveStorageItem('settings:background-color', bgColor)
}

function _subsColorChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const color = v.color
	if (color === o.color) {return}

	saveStorageItem('settings:color', color)
}

function _subsEncodingModeView(v: SettingsStoreType, o: SettingsStoreType): void {
	const encoding = v.encodingMode
	if (encoding === o.encodingMode) return

	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Encoding)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Encoding)}"][value="${CSS.escape(encoding)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subsEncodingModeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const encoding = v.encodingMode
	if (encoding === o.encodingMode) {return}

	saveStorageItem('settings:encoding-mode', encoding)
}

function _subsECLView(v: SettingsStoreType, o: SettingsStoreType): void {
	const ecl = v.errorCorrectionLevel
	if (ecl === o.errorCorrectionLevel) return

	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Correction)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Correction)}"][value="${CSS.escape(ecl)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subsECLChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const ecl = v.errorCorrectionLevel
	if (ecl === o.errorCorrectionLevel) {return}

	saveStorageItem('settings:ecl', ecl)
}

function _subsMarginChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const margin = v.margin
	if (margin === o.margin) {return}

	saveStorageItem('settings:margin', margin)
}

function _subsVersionView(v: SettingsStoreType, o: SettingsStoreType): void {
	const version = v.version
	if (version === o.version) return

	const ref_previous = $$(
		`input[name="${CSS.escape(RadioNames.Version)}"]:checked`
	) as HTMLInputElement
	const ref_target = $$(
		`input[name="${CSS.escape(RadioNames.Version)}"][value="${CSS.escape(version)}"]`
	) as HTMLInputElement

	if (ref_previous === ref_target) {return}
	if (ref_previous) ref_previous.checked = false
	if (ref_target) ref_target.checked = true
}

function _subsVersionChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const version = v.version
	if (version === o.version) {return}

	saveStorageItem('settings:version', version)
}

function _initSubscriber(): void {
	SettingsStore.subscribe(subsSettingsStore)
	SettingsStore.subscribe(_subsAnimationChanges)
	SettingsStore.subscribe(_subsThemeChanges)
	SettingsStore.subscribe(_subsAnimationView)
	SettingsStore.subscribe(_subsThemeView)
	SettingsStore.subscribe(_subsBackgroundColorChanges)
	SettingsStore.subscribe(_subsColorChanges)
	SettingsStore.subscribe(_subsEncodingModeView)
	SettingsStore.subscribe(_subsEncodingModeChanges)
	SettingsStore.subscribe(_subsECLView)
	SettingsStore.subscribe(_subsECLChanges)
	SettingsStore.subscribe(_subsMarginChanges)
	SettingsStore.subscribe(_subsVersionView)
	SettingsStore.subscribe(_subsVersionChanges)
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

	_ref_margin.addEventListener('click', () => {
		_ref_settingsMenu.hidePopover()
		_ref_marginInput.value = SettingsStore.value.margin + ''
		_ref_marginDialog.showModal()
	})

	_ref_marginSave.addEventListener('click', () => {
		const margin = Math_clamp(safeNumber(_ref_marginInput.valueAsNumber), 0, Number.POSITIVE_INFINITY)
		SettingsStore.update(v => v.margin = margin)
	})

	_ref_colorBtn.addEventListener('click', () => {
		const settings = SettingsStore.value
		_ref_settingsMenu.hidePopover()
		_ref_pickerForeBtn.textContent = settings.color
		_ref_pickerBackBtn.textContent = settings.backgroundColor
		_ref_previewForeground.style.setProperty('fill', settings.color)
		_ref_previewBackground.style.setProperty('background-color', settings.backgroundColor)
		CColorPicker.update(_ref_pickerBack, {
			ColorPicker: {value: SettingsStore.value.backgroundColor}
		})
		CColorPicker.update(_ref_pickerFore, {
			ColorPicker: {value: SettingsStore.value.color}
		})
		_ref_colorDialog.showModal()
	})

	_ref_pickerFore.addEventListener(CColorPicker.Events.Input, () => {
		const color = CColorPicker.getValue(_ref_pickerFore)
		requestAnimationFrame(() => {
			_ref_previewForeground.style.setProperty('fill', color)
		})
	})

	_ref_pickerBack.addEventListener(CColorPicker.Events.Input, () => {
		const color = CColorPicker.getValue(_ref_pickerBack)
		requestAnimationFrame(() => {
			_ref_previewBackground.style.setProperty('background-color', color)
		})
	})

	_ref_pickerFore.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		_ref_pickerForeBtn.textContent = CColorPicker.getValue(_ref_pickerFore)
	})

	_ref_pickerBack.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		_ref_pickerBackBtn.textContent = CColorPicker.getValue(_ref_pickerBack)
	})

	_ref_colorSave.addEventListener('click', () => {
		const backgroundColor = CColorPicker.getValue(_ref_pickerBack)
		const foregroundColor = CColorPicker.getValue(_ref_pickerFore)
		SettingsStore.update(v => {
			v.backgroundColor = backgroundColor
			v.color = foregroundColor
		})
	})

	_ref_versionMenu.addEventListener('change', (ev) => {
		_ref_settingsMenu.hidePopover()

		const target = ev.target as HTMLInputElement
		const value = target.value
		if (value === QRVersion.Auto) {
			SettingsStore.update(v => v.version = value)
			return
		}

		const parsed = safeNumber(Number.parseInt(value))
		if (parsed < 1 || parsed > 40) {return}

		if (isValidEnumValue(String(parsed), QRVersion)) {
			SettingsStore.update(v => v.version = String(parsed) as QRVersion)
		}
	})

	_ref_encodingMenu.addEventListener('change', (ev) => {
		_ref_settingsMenu.hidePopover()
		const target = ev.target as HTMLInputElement
		const value = target.value as EncodingMode
		if (!isValidEnumValue(value, EncodingMode)) {return}

		SettingsStore.update(v => v.encodingMode = value)
	})

	_ref_correctionMenu.addEventListener('change', (ev) => {
		_ref_settingsMenu.hidePopover()
		const target = ev.target as HTMLInputElement
		const value = target.value as ErrorCorrectionLevel
		if (!isValidEnumValue(value, ErrorCorrectionLevel)) {return}

		SettingsStore.update(v => v.errorCorrectionLevel = value)
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