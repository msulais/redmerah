import { ObservableStore } from "@/utils/store"
import { DateOperation } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "../_core/_dom-utils"
import { DatePickerEvents, getDatePickerRefValue, updateDatePickerRef, type DatePickerElement } from "@/components/DatePicker"
import { dateDiffInDays, isDateEqual_YMD } from "@/utils/datetime"
import { ButtonVariant, updateButtonRef } from "@/components/Button"
import { isValidEnumValue } from "@/utils/object"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "../_core/_database"
import type { ComboBoxElement } from "@/components/ComboBox"
import { DEFAULT_DATE_INPUT_DAYS, DEFAULT_DATE_INPUT_MONTHS, DEFAULT_DATE_INPUT_YEAR, DEFAULT_DATE_INPUT_FROM, DEFAULT_DATE_INPUT_TO, DEFAULT_DATE_OPERATION, DEFAULT_DATE_OUTPUT } from "../_shared/_constant"

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
const _operationRef = $(ElementIds.pgDate_operation) as ComboBoxElement
const _datePickerFromRef = $(ElementIds.pgDate_fromPicker) as DatePickerElement
const _datePickerToRef = $(ElementIds.pgDate_toPicker) as DatePickerElement
const _buttonFromRef = $(ElementIds.pgDate_fromBtn) as HTMLButtonElement
const _buttonToRef = $(ElementIds.pgDate_toBtn) as HTMLButtonElement
const _spanFromRef = $$(`#${ElementIds.pgDate_fromBtn}>span`) as HTMLSpanElement
const _spanToRef = $$(`#${ElementIds.pgDate_toBtn}>span`) as HTMLSpanElement
const _inputYearsRef = $(ElementIds.pgDate_years) as HTMLInputElement
const _inputMonthsRef = $(ElementIds.pgDate_months) as HTMLInputElement
const _inputDaysRef = $(ElementIds.pgDate_days) as HTMLInputElement
const _operationDiffRef = $(ElementIds.pgDate_diff) as HTMLDivElement
const _operationAddSubRef = $(ElementIds.pgDate_addSub) as HTMLDivElement
const _dateOutputRef = $(ElementIds.pgDate_output) as HTMLOutputElement
let _timeCalculateId: number | null | NodeJS.Timeout = null
let _timeYearsId: number | null | NodeJS.Timeout = null
let _timeMonthsId: number | null | NodeJS.Timeout = null
let _timeDaysId: number | null | NodeJS.Timeout = null

function _calculate(): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		_timeCalculateId = null

		let output = ''
		const store = DateStore.value
		const operation = store.operation
		switch (operation) {
		case DateOperation.add:
		case DateOperation.subtract:
			const d = store.inputFrom
			const years = store.inputYears
			const months = store.inputMonths
			const days = store.inputDays
			output = new Date(
				d.getFullYear() + (years * (operation === DateOperation.subtract? -1 : 1)),
				d.getMonth() + (months * (operation === DateOperation.subtract? -1 : 1)),
				d.getDate() + (days * (operation === DateOperation.subtract? -1 : 1))
			).toLocaleDateString('en', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
			DateStore.update(v => v.output = output)
			break
		case DateOperation.difference: {
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
	if (_timeYearsId !== null) {
		clearTimeout(_timeYearsId)
	}

	_timeYearsId = setTimeout(() => {
		_timeYearsId = null
		saveStorageItem('calc:date/input-years', years)
	}, 250)
}

function _subsInputYearsView(v: DateStoreType): void {
	if (
		v.inputYears === _inputYearsRef.valueAsNumber
		|| _inputYearsRef === document.activeElement
	) return;

	_inputYearsRef.valueAsNumber = v.inputYears
}

function _subsInputMonthsChanges(v: DateStoreType, o: DateStoreType): void {
	const monts = v.inputMonths
	if (monts === o.inputMonths) return

	_calculate()
	if (_timeMonthsId !== null) {
		clearTimeout(_timeMonthsId)
	}

	_timeMonthsId = setTimeout(() => {
		_timeMonthsId = null
		saveStorageItem('calc:date/input-months', monts)
	}, 250)
}

function _subsInputMonthsView(v: DateStoreType): void {
	if (
		v.inputMonths === _inputMonthsRef.valueAsNumber
		|| _inputMonthsRef === document.activeElement
	) return;

	_inputMonthsRef.valueAsNumber = v.inputMonths
}

function _subsInputDaysChanges(v: DateStoreType, o: DateStoreType): void {
	const days = v.inputDays
	if (days === o.inputDays) return

	_calculate()
	if (_timeDaysId !== null) {
		clearTimeout(_timeDaysId)
	}

	_timeDaysId = setTimeout(() => {
		_timeDaysId = null
		saveStorageItem('calc:date/input-days', days)
	}, 250)
}

function _subsInputDaysView(v: DateStoreType): void {
	if (
		v.inputDays === _inputDaysRef.valueAsNumber
		|| _inputDaysRef === document.activeElement
	) return;

	_inputDaysRef.valueAsNumber = v.inputDays
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

	updateDatePickerRef(_datePickerFromRef, {
		DatePickerValue: date
	})
	_spanFromRef.textContent = date.toLocaleDateString('en', {
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

	updateDatePickerRef(_datePickerToRef, {
		DatePickerValue: date
	})
	_spanToRef.textContent = date.toLocaleDateString('en', {
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

	_operationRef.value = operation
	switch (operation) {
	case DateOperation.add:
	case DateOperation.subtract:
		_operationAddSubRef.style.setProperty('display', 'grid')
		_operationDiffRef.style.setProperty('display', 'none')
		break
	case DateOperation.difference:
		_operationAddSubRef.style.setProperty('display', 'none')
		_operationDiffRef.style.setProperty('display', 'contents')
		break
	}
}

function _subsOutputView(v: DateStoreType): void {
	const output = v.output
	if (output === _dateOutputRef.textContent) return

	_dateOutputRef.textContent = output
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
	_datePickerFromRef.addEventListener(DatePickerEvents.change, () => DateStore.update(v =>
		v.inputFrom = getDatePickerRefValue(_datePickerFromRef)!
	))

	_datePickerFromRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonFromRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})

	_datePickerToRef.addEventListener(DatePickerEvents.change, () => DateStore.update(v =>
		v.inputTo = getDatePickerRefValue(_datePickerToRef)!
	))

	_datePickerToRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonToRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})

	_operationRef.addEventListener('change', () => {
		const value = _operationRef.value as DateOperation
		if (!isValidEnumValue(value, DateOperation)) return

		DateStore.update(v => v.operation = value)
	})

	_inputYearsRef.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_inputYearsRef.valueAsNumber, DateStore.value.inputYears))

		DateStore.update(v => v.inputYears = value)
	})

	_inputMonthsRef.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_inputMonthsRef.valueAsNumber, DateStore.value.inputMonths))

		DateStore.update(v => v.inputMonths = value)
	})

	_inputDaysRef.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_inputDaysRef.valueAsNumber, DateStore.value.inputDays))

		DateStore.update(v => v.inputDays = value)
	})

	_operationAddSubRef.addEventListener('focusout', ev => {
		const value = DateStore.value
		switch (ev.target) {
		case _inputYearsRef:
			_inputYearsRef.valueAsNumber = value.inputYears
			break
		case _inputMonthsRef:
			_inputMonthsRef.valueAsNumber = value.inputMonths
			break
		case _inputDaysRef:
			_inputDaysRef.valueAsNumber = value.inputDays
			break
		}
	})
}

export default () => {
	_initSubscriber()
	_initDates()
	_initEvents()
}