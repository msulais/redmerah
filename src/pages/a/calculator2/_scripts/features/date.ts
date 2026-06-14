import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { $ } from "../core/dom-utils"
import { dateDiffInDays } from "@/utils/datetime"
import { isValidEnumValue } from "@/utils/object"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "../core/database"
import { signal } from "@/utils/signal"
import { DateOperation } from '../shared/calculator'

const _sg_inputDays = signal(Constant.DEFAULT_DATE_INPUT_DAYS)
const _sg_inputMonths = signal(Constant.DEFAULT_DATE_INPUT_MONTHS)
const _sg_inputYears = signal(Constant.DEFAULT_DATE_INPUT_YEARS)
const _sg_inputFrom = signal(Constant.DEFAULT_DATE_INPUT_FROM)
const _sg_inputTo = signal(Constant.DEFAULT_DATE_INPUT_TO)
const _sg_operation = signal(Constant.DEFAULT_DATE_OPERATION)
const _sg_output = signal(Constant.DEFAULT_DATE_OUTPUT)

export const Signals = {
	inputDays: _sg_inputDays,
	inputMonths: _sg_inputMonths,
	inputYears: _sg_inputYears,
	inputFrom: _sg_inputFrom,
	inputTo: _sg_inputTo,
	operation: _sg_operation,
	output: _sg_output,
}

const _ref_operation = $(Ids.PageDateOperation) as HTMLSelectElement
const _ref_inputFrom = $(Ids.PageDateFrom) as HTMLInputElement
const _ref_inputTo = $(Ids.PageDateTo) as HTMLInputElement
const _ref_inputYears = $(Ids.PageDateYears) as HTMLInputElement
const _ref_inputMonths = $(Ids.PageDateMonths) as HTMLInputElement
const _ref_inputDays = $(Ids.PageDateDays) as HTMLInputElement
const _ref_operationDiff = $(Ids.PageDateDiff) as HTMLDivElement
const _ref_operationAddSub = $(Ids.PageDateAddOrSub) as HTMLDivElement
const _ref_dateOutput = $(Ids.PageDateOutput) as HTMLOutputElement
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		let output = ''
		const isSubtract = _sg_operation() === DateOperation.Subtract
		switch (_sg_operation()) {
		case DateOperation.Add:
		case DateOperation.Subtract:
			output = new Date(
				_sg_inputFrom().getFullYear() + (_sg_inputYears() * (isSubtract? -1 : 1)),
				_sg_inputFrom().getMonth() + (_sg_inputMonths() * (isSubtract? -1 : 1)),
				_sg_inputFrom().getDate() + (_sg_inputDays() * (isSubtract? -1 : 1))
			).toLocaleDateString('en', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
			_sg_output.set(output)
			break
		case DateOperation.Difference: {
			let days = Math.abs(dateDiffInDays(_sg_inputFrom(), _sg_inputTo()))
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
				days = Math.floor(days % 30.437)
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
			if (diffInDays == 0) {
				output = "Same date"
			}
			else if (diffInDays >= 7) {
				output += ` (${diffInDays} day${diffInDays > 1? "s" : ""})`
			}

			_sg_output.set(output)
			break
		}}
	}, 50)
}

// TODO: what is this?
// function _initDates(): void {
// 	DateStore.update(v => {
// 		v.inputFrom = new Date()
// 		v.inputTo = new Date()
// 	})
// }

function _initSubscriber(): void {
	_sg_operation.subscribe(v => {
		_ref_operation.value = v
		_calculate()
		saveStorageItem('page-date-operation', v, 250)
		switch (v) {
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
	})

	_sg_inputFrom.subscribe(v => {
		if (document.activeElement !== _ref_inputFrom) {
			_ref_inputFrom.valueAsDate = v
		}

		_calculate()
		saveStorageItem('page-date-input-from', v.toISOString(), 250)
	})

	_sg_inputTo.subscribe(v => {
		if (document.activeElement !== _ref_inputTo) {
			_ref_inputTo.valueAsDate = v
		}

		_calculate()
		saveStorageItem('page-date-input-to', v.toISOString(), 250)
	})

	_sg_inputYears.subscribe(v => {
		if (document.activeElement !== _ref_inputYears) {
			_ref_inputYears.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-years', v, 250)
	})

	_sg_inputMonths.subscribe(v => {
		if (document.activeElement !== _ref_inputMonths) {
			_ref_inputMonths.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-months', v, 250)
	})

	_sg_inputDays.subscribe(v => {
		if (document.activeElement !== _ref_inputDays) {
			_ref_inputDays.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-days', v, 250)
	})

	_sg_output.subscribe(v => {
		_ref_dateOutput.textContent = v
	})
}

function _initEvents(): void {
	_ref_inputFrom.addEventListener("input", () => {
		const date = _ref_inputFrom.valueAsDate
		if (!date || Number.isNaN(date.getTime())) {
			return
		}

		_sg_inputFrom.set(date)
	})

	_ref_inputTo.addEventListener("input", () => {
		const date = _ref_inputTo.valueAsDate
		if (!date || Number.isNaN(date.getTime())) {
			return
		}

		_sg_inputTo.set(date)
	})

	_ref_operation.addEventListener('change', () => {
		const value = _ref_operation.value as DateOperation
		if (!isValidEnumValue(value, DateOperation)) {
			return
		}

		_sg_operation.set(value)
	})

	_ref_inputYears.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputYears.valueAsNumber, _sg_inputYears()))
		_sg_inputYears.set(value)
	})

	_ref_inputMonths.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputMonths.valueAsNumber, _sg_inputMonths()))
		_sg_inputMonths.set(value)
	})

	_ref_inputDays.addEventListener('input', () => {
		const value = Math.floor(safeNumber(_ref_inputDays.valueAsNumber, _sg_inputDays()))
		_sg_inputDays.set(value)
	})

	_ref_operationAddSub.addEventListener('focusout', ev => {
		switch (ev.target) {
		case _ref_inputYears:
			_ref_inputYears.valueAsNumber = _sg_inputYears()
			break
		case _ref_inputMonths:
			_ref_inputMonths.valueAsNumber = _sg_inputMonths()
			break
		case _ref_inputDays:
			_ref_inputDays.valueAsNumber = _sg_inputDays()
			break
		}
	})
}

export default () => {
	_initSubscriber()
	// _initDates()
	_initEvents()
}