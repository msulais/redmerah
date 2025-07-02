import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ObservableStore } from "@/utils/store"
import { BasicStore } from "../_features/_basic"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { DEFAULT_THEME } from "../_shared/_constant"
import { RootAttributes } from "@/enums/attributes"
import { RadioNames } from "../_shared/_input-names"
import { DecimalNumberFormat, GroupingNumberFormat, NumberType } from "../_shared/_enums"
import { ScientificStore } from "../_features/_scientific"
import { ConverterStore } from "../_features/_converter"
import { ProgrammerStore } from "../_features/_programmer"
import { MemoryStore } from "./_memory"
import { Commands } from "../_shared/_commands"
import { saveStorageItem } from "./_database"

export type SettingsStoreType = Readonly<{
	theme         : PlatformThemeMode
	animation     : PlatformAnimationMode
	decimalFormat : DecimalNumberFormat
	groupingFormat: GroupingNumberFormat
}>

export const SettingsStore = new ObservableStore<SettingsStoreType>({
	theme         : PlatformThemeMode.auto,
	animation     : PlatformAnimationMode.auto,
	decimalFormat : DecimalNumberFormat.point,
	groupingFormat: GroupingNumberFormat.comma
})
const _decimalToken = '@_decimal_@'
const _groupingToken = '@_grouping_@'
const _rootRef = document.documentElement
const _themeMenuRef = $(ElementIds.apSett_themeMenu) as HTMLDivElement
const _animationMenuRef = $(ElementIds.apSett_animationMenu) as HTMLDivElement
const _decimalMenuRef = $(ElementIds.apSett_decMenu) as HTMLDivElement
const _groupingMenuRef = $(ElementIds.apSett_groupMenu) as HTMLDivElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement

function _initEvents(): void {
	_groupingMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as GroupingNumberFormat
		if (!isValidEnumValue(value, GroupingNumberFormat)) return

		SettingsStore.update(v => ({...v, groupingFormat: value}))
		_settingsMenuRef.hidePopover()
	})

	_decimalMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as DecimalNumberFormat
		if (!isValidEnumValue(value, DecimalNumberFormat)) return

		SettingsStore.update(v => ({...v, decimalFormat: value}))
		_settingsMenuRef.hidePopover()
	})

	_themeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformThemeMode
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) {return}

		_rootRef.setAttribute(RootAttributes.theme, value)
		_settingsMenuRef.hidePopover()
		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		SettingsStore.update(v => ({...v, theme: value}), null)
	})

	_animationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as PlatformAnimationMode
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) {return}

		_rootRef.setAttribute(RootAttributes.animation, value)
		_settingsMenuRef.hidePopover()
		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		SettingsStore.update(v => ({...v, animation: value}), null)
	})
}

function _initTheme(): void {
	const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
	if (!theme || !isValidEnumValue(theme, PlatformThemeMode) || theme === DEFAULT_THEME) return

	_rootRef.setAttribute(RootAttributes.theme, theme)
	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.sett_theme)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.sett_theme)}"][value="${CSS.escape(theme)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _initAnimation(): void {
	const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
	if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

	_rootRef.setAttribute(RootAttributes.animation, animation)
	const previousRef = $$(
		`input[name="${CSS.escape(RadioNames.sett_animation)}"]:checked`
	) as HTMLInputElement
	const targetRef = $$(
		`input[name="${CSS.escape(RadioNames.sett_animation)}"][value="${CSS.escape(animation)}"]`
	) as HTMLInputElement

	if (previousRef === targetRef) {return}
	if (previousRef) previousRef.checked = false
	if (targetRef) targetRef.checked = true
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
		case DecimalNumberFormat.point:
			grouping = GroupingNumberFormat.comma
			break
		case DecimalNumberFormat.comma:
			grouping = GroupingNumberFormat.point
			break
		}

		SettingsStore.update(v => ({...v, groupingFormat: grouping}))
	}

	const format = (input: string) => (input
		.replaceAll(oldDecimalFormat, _decimalToken)
		.replaceAll(oldGroupingFormat, _groupingToken)

		.replaceAll(_decimalToken, decimalFormat)
		.replaceAll(_groupingToken, grouping)
	)

	BasicStore.update(v => ({...v, input: format(v.input)}))
	ScientificStore.update(v => ({...v, input: format(v.input)}))
	ConverterStore.update(v => ({...v, input: format(v.input)}))
	if (ProgrammerStore.value.numberType === NumberType.decimal) {
		ProgrammerStore.update(v => ({...v, input: format(v.input)}))
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
		case GroupingNumberFormat.none:
		case GroupingNumberFormat.space:
		case GroupingNumberFormat.underscore:
			break
		case GroupingNumberFormat.point:
			decimal = DecimalNumberFormat.comma
			break
		case GroupingNumberFormat.comma:
			decimal = DecimalNumberFormat.point
			break
		}

		SettingsStore.update(v => ({...v, decimalFormat: decimal}))
	}

	const format = (input: string) => (input
		.replaceAll(oldDecimalFormat, _decimalToken)
		.replaceAll(oldGroupingFormat, _groupingToken)

		.replaceAll(_decimalToken, decimal)
		.replaceAll(_groupingToken, groupingFormat)
	)

	BasicStore.update(v => ({...v, input: format(v.input)}))
	ScientificStore.update(v => ({...v, input: format(v.input)}))
	ConverterStore.update(v => ({...v, input: format(v.input)}))
	if (ProgrammerStore.value.numberType === NumberType.decimal) {
		ProgrammerStore.update(v => ({...v, input: format(v.input)}))
	}
}

function _subsDecimalFormatView(v: SettingsStoreType, o: SettingsStoreType): void {
	const decimalFormat = v.decimalFormat
	if (decimalFormat === o.decimalFormat) return

	for (const ref of $$$<HTMLButtonElement>(`[data-command="${CSS.escape(Commands.key_dec)}"]`)) {
		ref.textContent = v.decimalFormat
	}

	const prevRef = $$<HTMLInputElement>(`input[name="${RadioNames.sett_decimal}"]:checked`)
	const targetRef = $$<HTMLInputElement>(
		`input[name="${RadioNames.sett_decimal}"][value="${decimalFormat}"]`
	)

	if (prevRef === targetRef) return
	if (prevRef) prevRef.checked = false
	if (targetRef) targetRef.checked = true
}

function _subsGroupingFormatView(v: SettingsStoreType, o: SettingsStoreType): void {
	const groupingFormat = v.groupingFormat
	if (groupingFormat === o.groupingFormat) return

	const prevRef = $$<HTMLInputElement>(`input[name="${RadioNames.sett_grouping}"]:checked`)
	const targetRef = $$<HTMLInputElement>(
		`input[name="${RadioNames.sett_grouping}"][value="${groupingFormat}"]`
	)

	if (prevRef === targetRef) return
	if (prevRef) prevRef.checked = false
	if (targetRef) targetRef.checked = true
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