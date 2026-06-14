import type { CComboBox } from "@/components/ComboBox"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { AngleUnits, type ConverterUnit } from "../_shared/_units"
import { ObservableStore } from "@/utils/signal"
import { DEFAULT_ANGLE_INPUT, DEFAULT_ANGLE_INPUT_UNIT, DEFAULT_ANGLE_OUTPUT, DEFAULT_ANGLE_OUTPUT_UNIT } from "../_shared/_constant"
import { isNumberNotDefined } from "@/utils/number"
import { saveStorageItem } from "../_core/_database"

export type AngleStoreType = {
	input: number
	output: number
	inputUnit: ConverterUnit
	outputUnit: ConverterUnit
}

export const AngleStore = new ObservableStore<AngleStoreType>({
	input: DEFAULT_ANGLE_INPUT,
	inputUnit: DEFAULT_ANGLE_INPUT_UNIT,
	output: DEFAULT_ANGLE_OUTPUT,
	outputUnit: DEFAULT_ANGLE_OUTPUT_UNIT
})

const _ref_input = $(ElementIds.pgAng_input) as HTMLInputElement
const _ref_output = $(ElementIds.pgAng_output) as HTMLInputElement
const _ref_inputUnit = $(ElementIds.pgAng_inputUnit) as CComboBox.CElement
const _ref_outputUnit = $(ElementIds.pgAng_outputUnit) as CComboBox.CElement
let _time_storageInput: NodeJS.Timeout | undefined = undefined
let _time_storageInputUnit: NodeJS.Timeout | undefined = undefined
let _time_storageOutputUnit: NodeJS.Timeout | undefined = undefined

function _subsConvertUnit(v: AngleStoreType, o: AngleStoreType): void {
	const input = v.input
	const output = v.output
	const isAllSame = (
		input === o.input
		&& output === o.output
		&& v.inputUnit.id === o.inputUnit.id
		&& v.outputUnit.id === o.outputUnit.id
	)
	if (isAllSame) {return}

	if (_ref_output.matches(':focus')) {
		AngleStore.update(v => v.input = output * v.inputUnit.value / v.outputUnit.value)
	}
	else {
		AngleStore.update(v => v.output = input * v.outputUnit.value / v.inputUnit.value)
	}
}

function _subsStorage(v: AngleStoreType, o: AngleStoreType): void {
	const input = v.input
	if (input !== o.input) {
		clearTimeout(_time_storageInput)
		_time_storageInput = setTimeout(() =>
			saveStorageItem('page:angle/input', input)
		, 1000)
	}

	const inputUnitId = v.inputUnit.id
	if (inputUnitId !== o.inputUnit.id) {
		clearTimeout(_time_storageInputUnit)
		_time_storageInputUnit = setTimeout(() =>
			saveStorageItem('page:angle/input-unit-id', inputUnitId)
		, 1000)
	}

	const outputUnitId = v.outputUnit.id
	if (outputUnitId !== o.inputUnit.id) {
		clearTimeout(_time_storageOutputUnit)
		_time_storageOutputUnit = setTimeout(() =>
			saveStorageItem('page:angle/output-unit-id', outputUnitId)
		, 1000)
	}
}

function _subsView(v: AngleStoreType): void {
	if (!_ref_input.matches(':focus')) {
		_ref_input.valueAsNumber = v.input
	}

	if (!_ref_output.matches(':focus')) {
		_ref_output.valueAsNumber = v.output
	}

	_ref_inputUnit.value = v.inputUnit.id
	_ref_outputUnit.value = v.outputUnit.id
}

function _initSubscriber(): void {
	AngleStore.subscribe(_subsConvertUnit)
	AngleStore.subscribe(_subsStorage)
	AngleStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_input?.addEventListener('input', () => {
		const value = _ref_input.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		AngleStore.update(v => v.input = value)
	})

	_ref_output?.addEventListener('input', () => {
		const value = _ref_output.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		AngleStore.update(v => v.output = value)
	})

	_ref_input?.addEventListener('blur', () => {
		if (_ref_input.value.trim().length > 0) {return}

		AngleStore.update(v => v.output = v.input = 0)
	})

	_ref_output?.addEventListener('blur', () => {
		if (_ref_output.value.trim().length > 0) {return}

		AngleStore.update(v => v.output = v.input = 0)
	})

	_ref_inputUnit.addEventListener('change', () => {
		const id = _ref_inputUnit.value
		if (!AngleUnits.all.has(id)) {
			_ref_inputUnit.value = AngleStore.value.inputUnit.id
			return
		}

		AngleStore.update(v => v.inputUnit = AngleUnits.all.get(id)!)
	})

	_ref_outputUnit.addEventListener('change', () => {
		const id = _ref_outputUnit.value
		if (!AngleUnits.all.has(id)) {
			_ref_outputUnit.value = AngleStore.value.outputUnit.id
			return
		}

		AngleStore.update(v => v.outputUnit = AngleUnits.all.get(id)!)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}