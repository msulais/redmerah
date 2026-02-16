import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { BasicStore } from "../_features/_basic"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { DEFAULT_ANIMATION, DEFAULT_DECIMAL_NUMBER_FORMAT, DEFAULT_GROUPING_NUMBER_FORMAT, DEFAULT_THEME } from "../_shared/_constant"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DecimalNumberFormat, GroupingNumberFormat, NumberType } from "../_shared/_enums"
import { ScientificStore } from "../_features/_scientific"
import { ConverterStore } from "../_features/_converter"
import { ProgrammerStore } from "../_features/_programmer"
import { MemoryStore } from "./_memory"
import { Commands } from "../_shared/_commands"
import { saveStorageItem } from "./_database"
import type { CButton } from "@/components/Button"

export type SettingsStoreType = Readonly<{
	theme         : PlatformThemeMode
	animation     : PlatformAnimationMode
	decimalFormat : DecimalNumberFormat
	groupingFormat: GroupingNumberFormat
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme         : DEFAULT_THEME,
	animation     : DEFAULT_ANIMATION,
	decimalFormat : DEFAULT_DECIMAL_NUMBER_FORMAT,
	groupingFormat: DEFAULT_GROUPING_NUMBER_FORMAT
})
const _decimalToken = '@_decimal_@'
const _groupingToken = '@_grouping_@'
const _ref_root = document.documentElement
const _ref_themeMenu = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _ref_animationMenu = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _ref_decimalMenu = $(ElementIds.apSett_decMenu) as HTMLDivElement
const _ref_groupingMenu = $(ElementIds.apSett_groupMenu) as HTMLDivElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement

function _initEvents(): void {
	_ref_groupingMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as GroupingNumberFormat
		if (!isValidEnumValue(value, GroupingNumberFormat)) return

		SettingsStore.update(v => v.groupingFormat = value)
		_ref_settingsMenu.hidePopover()
	})

	_ref_decimalMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as DecimalNumberFormat
		if (!isValidEnumValue(value, DecimalNumberFormat)) return

		SettingsStore.update(v => v.decimalFormat = value)
		_ref_settingsMenu.hidePopover()
	})

	_ref_themeMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_ref_root.setAttribute(RootAttributes.Theme, value)
		_ref_settingsMenu.hidePopover()
		localStorage.setItem(LocalStorageKeys.PlatformTheme, value)
		SettingsStore.update(v => v.theme = value, null)
	})

	_ref_animationMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_ref_root.setAttribute(RootAttributes.Animation, value)
		_ref_settingsMenu.hidePopover()
		localStorage.setItem(LocalStorageKeys.PlatformAnimation, value)
		SettingsStore.update(v => v.animation = value, null)
	})
}

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.PlatformTheme)
	if (!theme || !isValidEnumValue(theme, PlatformThemeMode) || theme === DEFAULT_THEME) return

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

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.PlatformAnimation)
	if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

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

function _subsRecalculate(v: SettingsStoreType, o: SettingsStoreType): void {
	if (
		v.decimalFormat === o.decimalFormat
		&& v.groupingFormat === o.groupingFormat
	) return

	BasicStore.notify()
	ScientificStore.notify()
	ConverterStore.notify()
	ProgrammerStore.notify()
	MemoryStore.notify()
}

function _subsDecimalFormatChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const decimalFormat = v.decimalFormat
	const oldDecimalFormat = o.decimalFormat
	const oldGroupingFormat = o.groupingFormat
	if (decimalFormat === oldDecimalFormat) return

	let grouping = oldGroupingFormat
	saveStorageItem('sett:decimal', decimalFormat)

	// @ts-ignore
	if (decimalFormat === oldGroupingFormat) {
		switch (decimalFormat) {
		case DecimalNumberFormat.Point:
			grouping = GroupingNumberFormat.Comma
			break
		case DecimalNumberFormat.Comma:
			grouping = GroupingNumberFormat.Point
			break
		}

		SettingsStore.update(v => v.groupingFormat = grouping)
	}

	const format = (input: string) => (input
		.replaceAll(oldDecimalFormat, _decimalToken)
		.replaceAll(oldGroupingFormat, _groupingToken)

		.replaceAll(_decimalToken, decimalFormat)
		.replaceAll(_groupingToken, grouping)
	)

	BasicStore.update(v => v.input = format(v.input))
	ScientificStore.update(v => v.input = format(v.input))
	ConverterStore.update(v => v.input = format(v.input))
	if (ProgrammerStore.value.numberType === NumberType.Decimal) {
		ProgrammerStore.update(v => v.input = format(v.input))
	}
}

function _subsGroupingFormatChanges(v: SettingsStoreType, o: SettingsStoreType): void {
	const groupingFormat = v.groupingFormat
	const oldDecimalFormat = o.decimalFormat
	const oldGroupingFormat = o.groupingFormat
	if (groupingFormat === oldGroupingFormat) return

	let decimal = oldDecimalFormat
	saveStorageItem('sett:grouping', groupingFormat)

	// @ts-ignore
	if (groupingFormat === oldDecimalFormat) {
		switch (groupingFormat) {
		case GroupingNumberFormat.None:
		case GroupingNumberFormat.Space:
		case GroupingNumberFormat.Underscore:
			break
		case GroupingNumberFormat.Point:
			decimal = DecimalNumberFormat.Comma
			break
		case GroupingNumberFormat.Comma:
			decimal = DecimalNumberFormat.Point
			break
		}

		SettingsStore.update(v => v.decimalFormat = decimal)
	}

	const format = (input: string) => (input
		.replaceAll(oldDecimalFormat, _decimalToken)
		.replaceAll(oldGroupingFormat, _groupingToken)

		.replaceAll(_decimalToken, decimal)
		.replaceAll(_groupingToken, groupingFormat)
	)

	BasicStore.update(v => v.input = format(v.input))
	ScientificStore.update(v => v.input = format(v.input))
	ConverterStore.update(v => v.input = format(v.input))
	if (ProgrammerStore.value.numberType === NumberType.Decimal) {
		ProgrammerStore.update(v => v.input = format(v.input))
	}
}

function _subsDecimalFormatView(v: SettingsStoreType, o: SettingsStoreType): void {
	const decimalFormat = v.decimalFormat
	if (decimalFormat === o.decimalFormat) return

	for (const ref of $$$<CButton.CElement>(`[data-command="${CSS.escape(Commands.KeyDec)}"]`)) {
		ref.textContent = v.decimalFormat
	}

	const ref_prev = $$<HTMLInputElement>(`input[name="${RadioNames.Decimal}"]:checked`)
	const ref_target = $$<HTMLInputElement>(
		`input[name="${RadioNames.Decimal}"][value="${decimalFormat}"]`
	)

	if (ref_prev === ref_target) return
	if (ref_prev) ref_prev.checked = false
	if (ref_target) ref_target.checked = true
}

function _subsGroupingFormatView(v: SettingsStoreType, o: SettingsStoreType): void {
	const groupingFormat = v.groupingFormat
	if (groupingFormat === o.groupingFormat) return

	const ref_prev = $$<HTMLInputElement>(`input[name="${RadioNames.Grouping}"]:checked`)
	const ref_target = $$<HTMLInputElement>(
		`input[name="${RadioNames.Grouping}"][value="${groupingFormat}"]`
	)

	if (ref_prev === ref_target) return
	if (ref_prev) ref_prev.checked = false
	if (ref_target) ref_target.checked = true
}

function _initSubscriber(): void {
	SettingsStore.subscribe(_subsRecalculate)
	SettingsStore.subscribe(_subsDecimalFormatChanges)
	SettingsStore.subscribe(_subsGroupingFormatChanges)
	SettingsStore.subscribe(_subsDecimalFormatView)
	SettingsStore.subscribe(_subsGroupingFormatView)
}

export default () => {
	_initSubscriber()
	_initTheme()
	_initAnimation()
	_initEvents()
}