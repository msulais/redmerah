import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { $ } from "../core/dom-utils.js"
import { dateDiffInDays } from "@/utils/datetime"
import { isValidEnumValue } from "@/utils/object"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "../core/database.js"
import { signal } from "@/utils/signal"
import { DateOperation } from '../shared/calculator.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_inputDays = signal(Constant.DEFAULT_DATE_INPUT_DAYS)
export const sg_inputMonths = signal(Constant.DEFAULT_DATE_INPUT_MONTHS)
export const sg_inputYears = signal(Constant.DEFAULT_DATE_INPUT_YEARS)
export const sg_inputFrom = signal(Constant.DEFAULT_DATE_INPUT_FROM)
export const sg_inputTo = signal(Constant.DEFAULT_DATE_INPUT_TO)
export const sg_operation = signal(Constant.DEFAULT_DATE_OPERATION)
export const sg_output = signal(Constant.DEFAULT_DATE_OUTPUT)

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
		const isSubtract = sg_operation() === DateOperation.Subtract
		switch (sg_operation()) {
		case DateOperation.Add:
		case DateOperation.Subtract:
			output = new Date(
				sg_inputFrom().getFullYear() + (sg_inputYears() * (isSubtract? -1 : 1)),
				sg_inputFrom().getMonth() + (sg_inputMonths() * (isSubtract? -1 : 1)),
				sg_inputFrom().getDate() + (sg_inputDays() * (isSubtract? -1 : 1))
			).toLocaleDateString('en', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
			sg_output.set(output)
			break
		case DateOperation.Difference: {
			let days = Math.abs(dateDiffInDays(sg_inputFrom(), sg_inputTo()))
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

			sg_output.set(output)
			break
		}}
	}, 50)
}

function _initSubscriber(): void {
	sg_operation.subscribe(v => {
		_ref_operation.value = v
		_calculate()
		saveStorageItem('page-date-operation', v)
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

	sg_inputFrom.subscribe(v => {
		if (document.activeElement !== _ref_inputFrom) {
			_ref_inputFrom.valueAsDate = v
		}

		_calculate()
		saveStorageItem('page-date-input-from', v.toISOString())
	})

	sg_inputTo.subscribe(v => {
		if (document.activeElement !== _ref_inputTo) {
			_ref_inputTo.valueAsDate = v
		}

		_calculate()
		saveStorageItem('page-date-input-to', v.toISOString())
	})

	sg_inputYears.subscribe(v => {
		if (document.activeElement !== _ref_inputYears) {
			_ref_inputYears.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-years', v)
	})

	sg_inputMonths.subscribe(v => {
		if (document.activeElement !== _ref_inputMonths) {
			_ref_inputMonths.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-months', v)
	})

	sg_inputDays.subscribe(v => {
		if (document.activeElement !== _ref_inputDays) {
			_ref_inputDays.valueAsNumber = v
		}

		_calculate()
		saveStorageItem('page-date-input-days', v)
	})

	sg_output.subscribe(v => {
		_ref_dateOutput.textContent = v
	})
}

function _initEvents(): void {
	delegateEvent(_ref_inputFrom, "input", () => {
		const date = _ref_inputFrom.valueAsDate
		if (!date || Number.isNaN(date.getTime())) {
			return
		}

		sg_inputFrom.set(date)
	})

	delegateEvent(_ref_inputTo, "input", () => {
		const date = _ref_inputTo.valueAsDate
		if (!date || Number.isNaN(date.getTime())) {
			return
		}

		sg_inputTo.set(date)
	})

	delegateEvent(_ref_operation, 'change', () => {
		const value = _ref_operation.value as DateOperation
		if (!isValidEnumValue(value, DateOperation)) {
			return
		}

		sg_operation.set(value)
	})

	delegateEvent(_ref_inputYears, 'input', () => {
		const value = Math.floor(safeNumber(_ref_inputYears.valueAsNumber, sg_inputYears()))
		sg_inputYears.set(value)
	})

	delegateEvent(_ref_inputMonths, 'input', () => {
		const value = Math.floor(safeNumber(_ref_inputMonths.valueAsNumber, sg_inputMonths()))
		sg_inputMonths.set(value)
	})

	delegateEvent(_ref_inputDays, 'input', () => {
		const value = Math.floor(safeNumber(_ref_inputDays.valueAsNumber, sg_inputDays()))
		sg_inputDays.set(value)
	})

	_ref_operationAddSub.addEventListener('focusout', ev => {
		switch (ev.target) {
		case _ref_inputYears:
			_ref_inputYears.valueAsNumber = sg_inputYears()
			break
		case _ref_inputMonths:
			_ref_inputMonths.valueAsNumber = sg_inputMonths()
			break
		case _ref_inputDays:
			_ref_inputDays.valueAsNumber = sg_inputDays()
			break
		}
	})
}

export default () => {
	_initSubscriber()
	// _initDates()
	_initEvents()
}