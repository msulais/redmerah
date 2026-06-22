import * as Constant from "../shared/constant.enum.js";
import * as Ids from '../shared/ids.enum.js'
import * as Commands from '../shared/commands.enum.js'
import * as Pages from '../shared/pages.enum.js'
import * as InputNames from '../shared/input-names.enum.js'
import * as BrPopover from "@/web-components/components/br-popover";
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as LocalStorageKeys from '@/enums/local-storage-keys.enum.js'
import * as Basic from '../features/basic.js'
import * as Scientific from '../features/scientific.js'
import * as Converter from '../features/converter.js'
import * as Programmer from '../features/programmer.js'
import * as Memory from './memory.js'
import { DecimalNumberFormat, GroupingNumberFormat, ProgrammerNumTypes } from '../shared/calculator.js'
import { listenRouteChange } from '@/web-components/router.js'
import { signal } from "@/utils/signal.js";
import { $, $$, $$$ } from "./dom-utils.js";
import { isValidEnumValue } from "@/utils/object.js";
import { saveStorageItem } from "./database.js";
import { delegateEvent } from "@/utils/event-registry.js";

export const sg_theme          = signal(Constant.DEFAULT_THEME)
export const sg_animation      = signal(Constant.DEFAULT_ANIMATION)
export const sg_page           = signal<typeof Pages[keyof typeof Pages]>(Pages.Basic)
export const sg_decimalFormat  = signal(Constant.DEFAULT_DECIMAL_NUMBER_FORMAT)
export const sg_groupingFormat = signal(Constant.DEFAULT_GROUPING_NUMBER_FORMAT)

const DECIMAL_TOKEN  = crypto.randomUUID()
const GROUPING_TOKEN = crypto.randomUUID()
const _ref_theme            = $$<BrTheme.BiruThemeElement>(BrTheme.TAGNAME)
const _ref_themePopover     = $(Ids.PopoverAppBarSettingsTheme) as BrPopover.BiruPopoverElement
const _ref_animationPopover = $(Ids.PopoverAppBarSettingsAnimation) as BrPopover.BiruPopoverElement
const _ref_decimalPopover   = $(Ids.PopoverAppBarSettingsDecimal) as BrPopover.BiruPopoverElement
const _ref_groupingPopover  = $(Ids.PopoverAppBarSettingsGrouping) as BrPopover.BiruPopoverElement

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

function _notifyDecimalAndGroupingFormatChanges(oldDecimal: DecimalNumberFormat, oldGrouping: GroupingNumberFormat): void {
	const format = (input: string) => (input
		.replaceAll(oldDecimal, DECIMAL_TOKEN)
		.replaceAll(oldGrouping, GROUPING_TOKEN)
		.replaceAll(DECIMAL_TOKEN, sg_decimalFormat())
		.replaceAll(GROUPING_TOKEN, sg_groupingFormat())
	)

	Basic     .sg_input.set(format)
	Converter .sg_input.set(format)
	Scientific.sg_input.set(format)
	if (Programmer.sg_numType() === ProgrammerNumTypes.Decimal) {
		Programmer.sg_input.set(format)
	}

	Basic     .sg_output.notify()
	Converter .sg_output.notify()
	Scientific.sg_output.notify()
	Programmer.sg_output.notify()
	Memory    .sg_memoryValue.notify()
}

function _sub_decimalFormat(v: DecimalNumberFormat): void {
	saveStorageItem('settings-decimal-format', v, 250)

	// update button "," | "."
	for (const ref of $$$<HTMLButtonElement>(`[data-command="${CSS.escape(Commands.KeyDec)}"]`)) {
		ref.textContent = v
	}

	const ref_prev = $$<HTMLInputElement>(`input[name="${InputNames.Decimal}"]:checked`)
	const ref_target = $$<HTMLInputElement>(`input[name="${InputNames.Decimal}"][value="${v}"]`)
	if (ref_prev === ref_target) {
		return
	}

	if (ref_prev) {
		ref_prev.checked = false
	}

	if (ref_target) {
		ref_target.checked = true
	}
}

function _sub_groupingFormat(v: GroupingNumberFormat): void {
	saveStorageItem('settings-grouping-format', v, 250)
	const ref_prev = $$<HTMLInputElement>(`input[name="${InputNames.Grouping}"]:checked`)
	const ref_target = $$<HTMLInputElement>(`input[name="${InputNames.Grouping}"][value="${v}"]`)
	if (ref_prev === ref_target) {
		return
	}

	if (ref_prev) {
		ref_prev.checked = false
	}

	if (ref_target) {
		ref_target.checked = true
	}
}

function _initSubscribers(): void {
	sg_decimalFormat.subscribe(_sub_decimalFormat)
	sg_groupingFormat.subscribe(_sub_groupingFormat)
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

	delegateEvent(_ref_groupingPopover, 'change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as GroupingNumberFormat
		if (!isValidEnumValue(value, GroupingNumberFormat)) {
			return
		}

		const oldDecimalFormat = sg_decimalFormat()
		const oldGroupingFormat = sg_groupingFormat()
		if (value === sg_decimalFormat()) {
			switch (value) {
			case GroupingNumberFormat.Comma:
				sg_decimalFormat.set(DecimalNumberFormat.Point)
				break
			case GroupingNumberFormat.Point:
				sg_decimalFormat.set(DecimalNumberFormat.Comma)
				break
			}
		}

		sg_groupingFormat.set(value)
		_notifyDecimalAndGroupingFormatChanges(oldDecimalFormat, oldGroupingFormat)
	})

	delegateEvent(_ref_decimalPopover, 'change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as DecimalNumberFormat
		if (!isValidEnumValue(value, DecimalNumberFormat)) {
			return
		}

		const oldDecimalFormat = sg_decimalFormat()
		const oldGroupingFormat = sg_groupingFormat()
		if (value === sg_groupingFormat()) {
			switch (value) {
			case DecimalNumberFormat.Point:
				sg_groupingFormat.set(GroupingNumberFormat.Comma)
				break
			case DecimalNumberFormat.Comma:
				sg_groupingFormat.set(GroupingNumberFormat.Point)
				break
			}
		}

		sg_decimalFormat.set(value)
		_notifyDecimalAndGroupingFormatChanges(oldDecimalFormat, oldGroupingFormat)
	})
}

export default () => {
	_initSubscribers()
	_updatePage()
	_initAnimation()
	_initTheme()
	_initEvents()
}