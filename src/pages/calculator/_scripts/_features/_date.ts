import { ObservableStore } from "@/utils/store"
import { DateOperation } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "../_core/_dom-utils"
import { DatePickerEvents, getDatePickerRefValue, updateDatePickerRef, type DatePickerElement } from "@/native-components/DatePicker"
import { dateDiffInDays, dateIsSameYMD } from "@/utils/datetime"
import { ButtonVariant, updateButtonRef } from "@/native-components/Button"
import { getSelectRefValue, SelectEvents, updateSelectRefValue, type SelectElement } from "@/native-components/Select"
import { validEnumValue } from "@/utils/object"
import { numberSafe } from "@/utils/number"
import { saveStorageItem } from "../_core/_database"

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
	inputDays: 0,
	inputFrom: new Date(),
	inputMonths: 0,
	inputTo: new Date(),
	inputYears: 0,
	operation: DateOperation.difference,
	output: 'Same date'
})
const _operationRef = $(ElementIds.bodyDateOperation) as SelectElement
const _datePickerFromRef = $(ElementIds.bodyDateInputFromDatePicker) as DatePickerElement
const _datePickerToRef = $(ElementIds.bodyDateInputToDatePicker) as DatePickerElement
const _buttonFromRef = $(ElementIds.bodyDateInputFromButton) as HTMLButtonElement
const _buttonToRef = $(ElementIds.bodyDateInputToButton) as HTMLButtonElement
const _spanFromRef = $$(`#${ElementIds.bodyDateInputFromButton}>span`) as HTMLSpanElement
const _spanToRef = $$(`#${ElementIds.bodyDateInputToButton}>span`) as HTMLSpanElement
const _inputYearsRef = $(ElementIds.bodyDateInputYears) as HTMLInputElement
const _inputMonthsRef = $(ElementIds.bodyDateInputMonths) as HTMLInputElement
const _inputDaysRef = $(ElementIds.bodyDateInputDays) as HTMLInputElement
const _operationDiffRef = $(ElementIds.bodyDateOperationDifference) as HTMLDivElement
const _operationAddSubRef = $(ElementIds.bodyDateOperationAddSubtract) as HTMLDivElement
const _dateOutputRef = $(ElementIds.bodyDateOutput) as HTMLOutputElement
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
			DateStore.update(v => ({...v, output}))
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

				DateStore.update(v => ({...v, output}))
			} break
		}
	}, 50)
}

function _subscribeInputYearsChanges(v: DateStoreType, o: DateStoreType): void {
	const years = v.inputYears
	if (years === o.inputYears) return

	_calculate()
	if (_timeYearsId !== null) {
		clearTimeout(_timeYearsId)
	}

	_timeYearsId = setTimeout(() => {
		_timeYearsId = null
		saveStorageItem('calc/date/input-years', years)
	}, 250)
}

function _subscribeInputYearsRefView(v: DateStoreType): void {
	if (
		v.inputYears === _inputYearsRef.valueAsNumber
		|| _inputYearsRef === document.activeElement
	) return;

	_inputYearsRef.valueAsNumber = v.inputYears
}

function _subscribeInputMonthsChanges(v: DateStoreType, o: DateStoreType): void {
	const monts = v.inputMonths
	if (monts === o.inputMonths) return

	_calculate()
	if (_timeMonthsId !== null) {
		clearTimeout(_timeMonthsId)
	}

	_timeMonthsId = setTimeout(() => {
		_timeMonthsId = null
		saveStorageItem('calc/date/input-months', monts)
	}, 250)
}

function _subscribeInputMonthsRefView(v: DateStoreType): void {
	if (
		v.inputMonths === _inputMonthsRef.valueAsNumber
		|| _inputMonthsRef === document.activeElement
	) return;

	_inputMonthsRef.valueAsNumber = v.inputMonths
}

function _subscribeInputDaysChanges(v: DateStoreType, o: DateStoreType): void {
	const days = v.inputDays
	if (days === o.inputDays) return

	_calculate()
	if (_timeDaysId !== null) {
		clearTimeout(_timeDaysId)
	}

	_timeDaysId = setTimeout(() => {
		_timeDaysId = null
		saveStorageItem('calc/date/input-days', days)
	}, 250)
}

function _subscribeInputDaysRefView(v: DateStoreType): void {
	if (
		v.inputDays === _inputDaysRef.valueAsNumber
		|| _inputDaysRef === document.activeElement
	) return;

	_inputDaysRef.valueAsNumber = v.inputDays
}

function _subscribeInputDateFromChanges(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputFrom
	if (dateIsSameYMD(date, o.inputFrom)) return

	_calculate()
	saveStorageItem('calc/date/input-from', date.toISOString())
}

function _subscribeInputDateFromRefView(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputFrom
	if (dateIsSameYMD(date, o.inputFrom)) return

	updateDatePickerRef(_datePickerFromRef, {
		DatePickerValue: date
	})
	_spanFromRef.textContent = date.toLocaleDateString('en', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

function _subscribeInputDateToChanges(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputTo
	if (dateIsSameYMD(date, o.inputTo)) return

	_calculate()
	saveStorageItem("calc/date/input-to", date.toISOString())
}

function _subscribeInputDateToRefView(v: DateStoreType, o: DateStoreType): void {
	const date = v.inputTo
	if (dateIsSameYMD(date, o.inputTo)) return

	updateDatePickerRef(_datePickerToRef, {
		DatePickerValue: date
	})
	_spanToRef.textContent = date.toLocaleDateString('en', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

function _subscribeOperationChanges(v: DateStoreType, o: DateStoreType): void {
	const operation = v.operation
	if (operation === o.operation) return

	_calculate()
	saveStorageItem('calc/date/operation', operation)
}

function _subscribeOperationRefView(v: DateStoreType, o: DateStoreType): void {
	const operation = v.operation
	if (operation === o.operation) return

	updateSelectRefValue(_operationRef, operation)
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

function _subscribeOutputRefView(v: DateStoreType): void {
	const output = v.output
	if (output === _dateOutputRef.textContent) return

	_dateOutputRef.textContent = output
}

function _initDates(): void {
	DateStore.update(v => ({
		...v,
		inputFrom: new Date(),
		inputTo: new Date()
	}))
}

function _initSubscriber(): void {
	DateStore.subscribe(_subscribeInputYearsChanges)
	DateStore.subscribe(_subscribeInputYearsRefView)
	DateStore.subscribe(_subscribeInputMonthsChanges)
	DateStore.subscribe(_subscribeInputMonthsRefView)
	DateStore.subscribe(_subscribeInputDaysChanges)
	DateStore.subscribe(_subscribeInputDaysRefView)
	DateStore.subscribe(_subscribeInputDateFromChanges)
	DateStore.subscribe(_subscribeInputDateFromRefView)
	DateStore.subscribe(_subscribeInputDateToChanges)
	DateStore.subscribe(_subscribeInputDateToRefView)
	DateStore.subscribe(_subscribeOperationChanges)
	DateStore.subscribe(_subscribeOperationRefView)
	DateStore.subscribe(_subscribeOutputRefView)
}

function _initEvents(): void {
	_datePickerFromRef.addEventListener(DatePickerEvents.change, () => DateStore.update(v => ({
		...v,
		inputFrom: getDatePickerRefValue(_datePickerFromRef)!
	})))

	_datePickerFromRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonFromRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})

	_datePickerToRef.addEventListener(DatePickerEvents.change, () => DateStore.update(v => ({
		...v,
		inputTo: getDatePickerRefValue(_datePickerToRef)!
	})))

	_datePickerToRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonToRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})

	_operationRef.addEventListener(SelectEvents.change, () => {
		const value = getSelectRefValue(_operationRef) as DateOperation
		if (!validEnumValue(value, DateOperation)) return

		DateStore.update(v => ({...v, operation: value}))
	})

	_inputYearsRef.addEventListener('input', () => {
		const value = Math.floor(numberSafe(_inputYearsRef.valueAsNumber, DateStore.value.inputYears))

		DateStore.update(v => ({...v, inputYears: value}))
	})

	_inputMonthsRef.addEventListener('input', () => {
		const value = Math.floor(numberSafe(_inputMonthsRef.valueAsNumber, DateStore.value.inputMonths))

		DateStore.update(v => ({...v, inputMonths: value}))
	})

	_inputDaysRef.addEventListener('input', () => {
		const value = Math.floor(numberSafe(_inputDaysRef.valueAsNumber, DateStore.value.inputDays))

		DateStore.update(v => ({...v, inputDays: value}))
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