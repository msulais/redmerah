import { ObservableStore } from "@/utils/signal"
import { DateOperation } from "../shared/enums"
import { ElementIds } from "../shared/ids"
import { $, $$ } from "../core/dom-utils"
import { CDatePicker } from "@/components/DatePicker"
import { dateDiffInDays, isDateEqual_YMD } from "@/utils/datetime"
import { CButton } from "@/components/Button"
import { isValidEnumValue } from "@/utils/object"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "../core/database"
import { CComboBox } from "@/components/ComboBox"
import { DEFAULT_DATE_INPUT_DAYS, DEFAULT_DATE_INPUT_MONTHS, DEFAULT_DATE_INPUT_YEAR, DEFAULT_DATE_INPUT_FROM, DEFAULT_DATE_INPUT_TO, DEFAULT_DATE_OPERATION, DEFAULT_DATE_OUTPUT } from "../shared/constant"

export type DateStoreType = Readonly<{
	inputFrom: Date
	inputTo: Date
	inputYears: number
	inputMonths: number
	inputDays: number
	operation: DateOperation
	output: string
}>

export const DateStore = new ObservableStore<DateStoreType>({
	inputDays: DEFAULT_DATE_INPUT_DAYS,
	inputMonths: DEFAULT_DATE_INPUT_MONTHS,
	inputYears: DEFAULT_DATE_INPUT_YEAR,
	inputFrom: DEFAULT_DATE_INPUT_FROM,
	inputTo: DEFAULT_DATE_INPUT_TO,
	operation: DEFAULT_DATE_OPERATION,
	output: DEFAULT_DATE_OUTPUT
})
const _ref_operation = $(ElementIds.pgDate_operation) as CComboBox.CElement
const _ref_datePickerFrom = $(ElementIds.pgDate_fromPicker) as CDatePicker.CElement
const _ref_datePickerTo = $(ElementIds.pgDate_toPicker) as CDatePicker.CElement
const _ref_buttonFrom = $(ElementIds.pgDate_fromBtn) as CButton.CElement
const _ref_buttonTo = $(ElementIds.pgDate_toBtn) as CButton.CElement
const _ref_spanFrom = $$(`#${ElementIds.pgDate_fromBtn}>span`) as HTMLSpanElement
const _ref_spanTo = $$(`#${ElementIds.pgDate_toBtn}>span`) as HTMLSpanElement
const _ref_inputYears = $(ElementIds.pgDate_years) as HTMLInputElement
const _ref_inputMonths = $(ElementIds.pgDate_months) as HTMLInputElement
const _ref_inputDays = $(ElementIds.pgDate_days) as HTMLInputElement
const _ref_operationDiff = $(ElementIds.pgDate_diff) as HTMLDivElement
const _ref_operationAddSub = $(ElementIds.pgDate_addSub) as HTMLDivElement
const _ref_dateOutput = $(ElementIds.pgDate_output) as HTMLOutputElement
let _time_calculate: number | null | NodeJS.Timeout = null
let _time_years: number | null | NodeJS.Timeout = null
let _time_months: number | null | NodeJS.Timeout = null
let _time_days: number | null | NodeJS.Timeout = null

function _calculate(): void {
	if (_time_calculate !== null) {
		clearTimeout(_time_calculate)
	}

	_time_calculate = setTimeout(() => {
		_time_calculate = null

		let output = ''
		const store = DateStore.value
		const operation = store.operation
		switch (operation) {
		case DateOperation.Add:
		case DateOperation.Subtract:
			const d = store.inputFrom
			const years = store.inputYears
			const months = store.inputMonths
			const days = store.inputDays
			output = new Date(
				d.getFullYear() + (years * (operation === DateOperation.Subtract? -1 : 1)),
				d.getMonth() + (months * (operation === DateOperation.Subtract? -1 : 1)),
				d.getDate() + (days * (operation === DateOperation.Subtract? -1 : 1))
			).toLocaleDateString('en', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
			DateStore.update(v => v.output = output)
			break
		case DateOperation.Difference: {
			let days = Math.abs(dateDiffInDays(store.inputFrom, store.inputTo))
			const diffInDays = days
			if (days >= 365.25) {
					const n = Math.floor(days / 365.25)
					output = `${n} year${n > 1? "s" : ""}`
					days = Math.floor(days % 365.25)
				}
				if (days >= 30.437){
					if (output != '') output += ", "
					const n = Math.floor(days / 30.437)
					output += `${n} month${n > 1? "s" : ""}`
					days = Math.floor(days % 30.437);
				}
				if (days >= 7){
					if (output != '') output += ", "
					const n = Math.floor(days / 7)
					output += `${n} week${n > 1? "s" : ""}`
					days = Math.floor(days % 7)
				}
				if (days > 0){
					if (output != '') output += ", "
					output += `${days} day${days > 1? "s" : ""}`
				}
				if (diffInDays == 0) output = "Same date"
				else if (diffInDays >= 7) output += ` (${diffInDays} day${diffInDays > 1? "s" : ""})`

				DateStore.update(v => v.output = output)
			} break
		}
	}, 50)
}

function _subsInputYearsChanges(v: DateStoreType, o: DateStoreType): void {
	const years = v.inputYears
	if (years === o.inputYears) return

	_calculate()
	if (_time_years !== null) {
		clearTimeout(_time_years)
	}

	_time_years = setTimeout(() => {
		_time_years = null
		saveStorageItem('calc:date/input-years', years)
	}, 250)
}

function _subsInputYearsView(v: DateStoreType): void {
	if (
		v.inputYears === _ref_inputYears.valueAsNumber
		|| _ref_inputYears === document.activeElement
	) return;

	_ref_inputYears.valueAsNumber = v.inputYears
}

function _subsInputMonthsChanges(v: DateStoreType, o: DateStoreType): void {
	const monts = v.inputMonths
	if (monts === o.inputMonths) return

	_calculate()
	if (_time_months !== null) {
		clearTimeout(_time_months)
	}

	_time_months = setTimeout(() => {
		_time_months = null
		saveStorageItem('calc:date/input-months', monts)
	}, 250)
}

function _subsInputMonthsView(v: DateStoreType): void {
	if (
		v.inputMonths === _ref_inputMonths.valueAsNumber
		|| _ref_inputMonths === document.activeElement
	) return;

	_ref_inputMonths.valueAsNumber = v.inputMonths
}

function _subsInputDaysChanges(v: DateStoreType, o: DateStoreType): void {
	const days = v.inputDays
	if (days === o.inputDays) return

	_calculate()
	if (_time_days !== null) {
		clearTimeout(_time_days)
	}

	_time_days = setTimeout(() => {
		_time_days = null
		saveStorageItem('calc:date/input-days', days)
	}, 250)
}

function _subsInputDaysView(v: DateStoreType): void {
	if (
		v.inputDays === _ref_inputDays.valueAsNumber
		|| _ref_inputDays === document.activeElement
	) return;

	_ref_inputDays.valueAsNumber = v.inputDays
}

function _subsInputDateFromChanges(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputFrom
	if (isDateEqual_YMD(date, o.inputFrom)) return

	_calculate()
	saveStorageItem('calc:date/input-from', date.toISOString())
}

function _subsInputDateFromView(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputFrom
	if (isDateEqual_YMD(date, o.inputFrom)) return

	CDatePicker.update(_ref_datePickerFrom, {
		DatePicker: {value: date}
	})
	_ref_spanFrom.textContent = date.toLocaleDateString('en', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

function _subsInputDateToChanges(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputTo
	if (isDateEqual_YMD(date, o.inputTo)) return

	_calculate()
	saveStorageItem("calc:date/input-to", date.toISOString())
}

function _subsInputDateToView(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputTo
	if (isDateEqual_YMD(date, o.inputTo)) return

	CDatePicker.update(_ref_datePickerTo, {
		DatePicker: {value: date}
	})
	_ref_spanTo.textContent = date.toLocaleDateString('en', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

function _subsOperationChanges(v: DateStoreType, o: DateStoreType): void {
	const operation = v.operation
	if (operation === o.operation) return

	_calculate()
	saveStorageItem('calc:date/operation', operation)
}

function _subsOperationView(v: DateStoreType, o: DateStoreType): void {
	const operation = v.operation
	if (operation === o.operation) return

	_ref_operation.value = operation
	switch (operation) {
	case DateOperation.Add:
	case DateOperation.Subtract:
		_ref_operationAddSub.style.setProperty('display', 'grid')
		_ref_operationDiff.style.setProperty('display', 'none')
		break
	case DateOperation.Difference:
		_ref_operationAddSub.style.setProperty('display', 'none')
		_ref_operationDiff.style.setProperty('display', 'contents')
		break
	}
}

function _subsOutputView(v: DateStoreType): void {
	const output = v.output
	if (output === _ref_dateOutput.textContent) return

	_ref_dateOutput.textContent = output
}

function _initDates(): void {
	DateStore.update(v => {
		v.inputFrom = new Date()
		v.inputTo = new Date()
	})
}

function _initSubscriber(): void {
	DateStore.subscribe(_subsInputYearsChanges)
	DateStore.subscribe(_subsInputYearsView)
	DateStore.subscribe(_subsInputMonthsChanges)
	DateStore.subscribe(_subsInputMonthsView)
	DateStore.subscribe(_subsInputDaysChanges)
	DateStore.subscribe(_subsInputDaysView)
	DateStore.subscribe(_subsInputDateFromChanges)
	DateStore.subscribe(_subsInputDateFromView)
	DateStore.subscribe(_subsInputDateToChanges)
	DateStore.subscribe(_subsInputDateToView)
	DateStore.subscribe(_subsOperationChanges)
	DateStore.subscribe(_subsOperationView)
	DateStore.subscribe(_subsOutputView)
}

function _initEvents(): void {
	_ref_datePickerFrom.addEventListener(CDatePicker.Events.Change, () => DateStore.update(v =>
		v.inputFrom = CDatePicker.getValue(_ref_datePickerFrom)!
	))

	_ref_datePickerFrom.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.update(_ref_buttonFrom, {
			Button: {variant: isOpen? CButton.Variant.Outlined : CButton.Variant.Tonal}
		})
	})

	_ref_datePickerTo.addEventListener(CDatePicker.Events.Change, () => DateStore.update(v =>
		v.inputTo = CDatePicker.getValue(_ref_datePickerTo)!
	))

	_ref_datePickerTo.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.update(_ref_buttonTo, {
			Button: {variant: isOpen? CButton.Variant.Outlined : CButton.Variant.Tonal}
		})
	})

	_ref_operation.addEventListener('change', () => {
		const value = _ref_operation.value as DateOperation
		if (!isValidEnumValue(value, DateOperation)) return

		DateStore.update(v => v.operation = value)
	})

	_ref_inputYears.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputYears.valueAsNumber, DateStore.value.inputYears))

		DateStore.update(v => v.inputYears = value)
	})

	_ref_inputMonths.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputMonths.valueAsNumber, DateStore.value.inputMonths))

		DateStore.update(v => v.inputMonths = value)
	})

	_ref_inputDays.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputDays.valueAsNumber, DateStore.value.inputDays))

		DateStore.update(v => v.inputDays = value)
	})

	_ref_operationAddSub.addEventListener('focusout', ev => {
		const value = DateStore.value
		switch (ev.target) {
		case _ref_inputYears:
			_ref_inputYears.valueAsNumber = value.inputYears
			break
		case _ref_inputMonths:
			_ref_inputMonths.valueAsNumber = value.inputMonths
			break
		case _ref_inputDays:
			_ref_inputDays.valueAsNumber = value.inputDays
			break
		}
	})
}

export default () => {
	_initSubscriber()
	_initDates()
	_initEvents()
}