import { DatePickerAttributes, DatePickerEvents } from "@/native-components/DatePicker"
import { Commands, DateOperation, ElementIds } from "../_enums"
import { ButtonVariant, updateButtonRef } from "@/native-components/Button"
import { command } from "../_utils"
import type { CommandChangeDateFromDetail, CommandChangeDateOperationDetail, CommandChangeDateToDetail } from "../_types"
import { SelectAttributes, SelectEvents } from "@/native-components/Select"
import { validEnumValue } from "@/utils/object"
import { numberSafe } from "@/utils/number"

const $ = (id: string) => document.getElementById(id)
const $$ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)

const _datePickerFromRef = $(ElementIds.bodyDateInputFromDatePicker) as HTMLDivElement
const _datePickerToRef = $(ElementIds.bodyDateInputToDatePicker) as HTMLDivElement
const _buttonFromRef = $(ElementIds.bodyDateInputFromButton) as HTMLButtonElement
const _buttonToRef = $(ElementIds.bodyDateInputToButton) as HTMLButtonElement
const _spanFromRef = $$(`#${ElementIds.bodyDateInputFromButton}>span`) as HTMLSpanElement
const _spanToRef = $$(`#${ElementIds.bodyDateInputToButton}>span`) as HTMLSpanElement
const _operationRef = $(ElementIds.bodyDateOperation) as HTMLDivElement
const _operationDiffRef = $(ElementIds.bodyDateOperationDifference) as HTMLDivElement
const _operationAddSubRef = $(ElementIds.bodyDateOperationAddSubtract) as HTMLDivElement
const _inputYearsRef = $(ElementIds.bodyDateInputYears) as HTMLInputElement
const _inputMonthsRef = $(ElementIds.bodyDateInputMonths) as HTMLInputElement
const _inputDaysRef = $(ElementIds.bodyDateInputDays) as HTMLInputElement

function _dateChangeListener(): void {
	_datePickerFromRef.addEventListener(DatePickerEvents.change, () => {
		const date = new Date(_datePickerFromRef.getAttribute(DatePickerAttributes.value)!)
		_spanFromRef.textContent = date.toLocaleDateString('en', {day: 'numeric', month: 'long', year: 'numeric'})
		command<CommandChangeDateFromDetail>(Commands.changeDateFrom, { date })
	})

	_datePickerFromRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonFromRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})

	_datePickerToRef.addEventListener(DatePickerEvents.change, () => {
		const date = new Date(_datePickerToRef.getAttribute(DatePickerAttributes.value)!)
		_spanToRef.textContent = date.toLocaleDateString('en', {day: 'numeric', month: 'long', year: 'numeric'})
		command<CommandChangeDateToDetail>(Commands.changeDateTo, { date })
	})

	_datePickerToRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_buttonToRef, {
			ButtonVariant: isOpen? ButtonVariant.outlined : ButtonVariant.tonal
		})
	})
}

function _operationChange(): void {
	_operationRef.addEventListener(SelectEvents.change, () => {
		const value = _operationRef.getAttribute(SelectAttributes.value)! as DateOperation
		if (!validEnumValue(value, DateOperation)) return

		command<CommandChangeDateOperationDetail>(Commands.changeDateOperation, {
			operation: value
		})
		switch (value) {
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
	})
}

function _yearsMonthDaysInput(): void {
	_inputYearsRef.addEventListener('input', () => command(Commands.calculate, {}))
	_inputMonthsRef.addEventListener('input', () => command(Commands.calculate, {}))
	_inputDaysRef.addEventListener('input', () => command(Commands.calculate, {}))

	_operationAddSubRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case _inputYearsRef:
			_inputYearsRef.value = Math.floor(numberSafe(_inputYearsRef.valueAsNumber)) + ''
			break
		case _inputMonthsRef:
			_inputMonthsRef.value = Math.floor(numberSafe(_inputMonthsRef.valueAsNumber)) + ''
			break
		case _inputDaysRef:
			_inputDaysRef.value = Math.floor(numberSafe(_inputDaysRef.valueAsNumber)) + ''
			break
		}
	})
}

export default function _(): void {
	_dateChangeListener()
	_operationChange()
	_yearsMonthDaysInput()
}