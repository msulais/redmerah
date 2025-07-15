import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DEFAULT_ANIMATION, DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_THEME, DEFAULT_VERSION } from "../_shared/_constant"
import { $, $$ } from "./_dom-utils"
import { EncodingMode, ErrorCorrectionLevel, QRVersion } from "../_shared/_enums"
import type { HEXColor } from "@/types/color"
import type { MenuItemElement, SubMenuElement } from "@/native-components/Menu"
import type { DialogElement } from "@/native-components/Dialog"
import type { ButtonElement } from "@/native-components/Button"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { ColorPickerEvents, getColorPickerRefValue, updateColorPickerRef, type ColorPickerElement } from "@/native-components/ColorPicker"
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
const _rootRef = document.documentElement
const _colorDialogRef = $(ElementIds.apSett_colorDialog) as DialogElement
const _colorBtnRef = $(ElementIds.apSett_colorBtn) as MenuItemElement
const _colorSaveRef = $(ElementIds.apSett_colorSave) as ButtonElement
const _marginSaveRef = $(ElementIds.apSett_marginSave) as ButtonElement
const _marginInputRef = $(ElementIds.apSett_marginInput) as HTMLInputElement
const _themeRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _marginRef = $(ElementIds.apSett_marginBtn) as MenuItemElement
const _marginDialogRef = $(ElementIds.apSett_marginDialog) as DialogElement
const _pickerForeRef = $(ElementIds.apSett_colorForePicker) as ColorPickerElement
const _pickerForeBtnRef = $(ElementIds.apSett_colorForePickerBtn) as ColorPickerElement
const _pickerBackBtnRef = $(ElementIds.apSett_colorBackPickerBtn2) as ColorPickerElement
const _pickerBackRef = $(ElementIds.apSett_colorBackPicker) as ColorPickerElement
const _previewForegroundRef = $(ElementIds.apSett_colorPreviewForeground) as HTMLElement
const _previewBackgroundRef = $(ElementIds.apSett_colorPreviewBackground) as HTMLDivElement
const _versionMenuRef = $(ElementIds.apSett_versionMenu) as SubMenuElement
const _encodingMenuRef = $(ElementIds.apSett_encodingMenu) as SubMenuElement
const _correctionMenuRef = $(ElementIds.apSett_correctionMenu) as SubMenuElement

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

	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.encoding)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.encoding)}"][value="${CSS.escape(encoding)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _subsEncodingModeChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const encoding = v.encodingMode
	if (encoding === o.encodingMode) {return}

	saveStorageItem('settings:encoding-mode', encoding)
}

function _subsECLView(v: SettingsStoreType, o: SettingsStoreType): void {
	const ecl = v.errorCorrectionLevel
	if (ecl === o.errorCorrectionLevel) return

	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.correction)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.correction)}"][value="${CSS.escape(ecl)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
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

	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.version)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.version)}"][value="${CSS.escape(version)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
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

	_marginRef.addEventListener('click', () => {
		_settingsMenuRef.hidePopover()
		_marginInputRef.value = SettingsStore.value.margin + ''
		_marginDialogRef.showModal()
	})

	_marginSaveRef.addEventListener('click', () => {
		const margin = Math_clamp(safeNumber(_marginInputRef.valueAsNumber), 0, Number.POSITIVE_INFINITY)
		SettingsStore.update(v => v.margin = margin)
	})

	_colorBtnRef.addEventListener('click', () => {
		const settings = SettingsStore.value
		_settingsMenuRef.hidePopover()
		_pickerForeBtnRef.textContent = settings.color
		_pickerBackBtnRef.textContent = settings.backgroundColor
		_previewForegroundRef.style.setProperty('fill', settings.color)
		_previewBackgroundRef.style.setProperty('background-color', settings.backgroundColor)
		updateColorPickerRef(_pickerBackRef, {
			ColorPickerValue: SettingsStore.value.backgroundColor
		})
		updateColorPickerRef(_pickerForeRef, {
			ColorPickerValue: SettingsStore.value.color
		})
		_colorDialogRef.showModal()
	})

	_pickerForeRef.addEventListener(ColorPickerEvents.input, () => {
		const color = getColorPickerRefValue(_pickerForeRef)
		requestAnimationFrame(() => {
			_previewForegroundRef.style.setProperty('fill', color)
		})
	})

	_pickerBackRef.addEventListener(ColorPickerEvents.input, () => {
		const color = getColorPickerRefValue(_pickerBackRef)
		requestAnimationFrame(() => {
			_previewBackgroundRef.style.setProperty('background-color', color)
		})
	})

	_pickerForeRef.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		_pickerForeBtnRef.textContent = getColorPickerRefValue(_pickerForeRef)
	})

	_pickerBackRef.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		_pickerBackBtnRef.textContent = getColorPickerRefValue(_pickerBackRef)
	})

	_colorSaveRef.addEventListener('click', () => {
		const backgroundColor = getColorPickerRefValue(_pickerBackRef)
		const foregroundColor = getColorPickerRefValue(_pickerForeRef)
		SettingsStore.update(v => {
			v.backgroundColor = backgroundColor
			v.color = foregroundColor
		})
	})

	_versionMenuRef.addEventListener('change', (ev) => {
		_settingsMenuRef.hidePopover()

		const target = ev.target as HTMLInputElement
		const value = target.value
		if (value === QRVersion.auto) {
			SettingsStore.update(v => v.version = value)
			return
		}

		const parsed = safeNumber(Number.parseInt(value))
		if (parsed < 1 || parsed > 40) {return}

		if (isValidEnumValue(String(parsed), QRVersion)) {
			SettingsStore.update(v => v.version = String(parsed) as QRVersion)
		}
	})

	_encodingMenuRef.addEventListener('change', (ev) => {
		_settingsMenuRef.hidePopover()
		const target = ev.target as HTMLInputElement
		const value = target.value as EncodingMode
		if (!isValidEnumValue(value, EncodingMode)) {return}

		SettingsStore.update(v => v.encodingMode = value)
	})

	_correctionMenuRef.addEventListener('change', (ev) => {
		_settingsMenuRef.hidePopover()
		const target = ev.target as HTMLInputElement
		const value = target.value as ErrorCorrectionLevel
		if (!isValidEnumValue(value, ErrorCorrectionLevel)) {return}

		SettingsStore.update(v => v.errorCorrectionLevel = value)
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