import type { CComboBox } from "@/components/ComboBox"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { LengthUnits, type ConverterUnit } from "../_shared/_units"
import { ObservableStore } from "@/utils/store"
import { isNumberNotDefined } from "@/utils/number"
import { saveStorageItem } from "../_core/_database"
import { DEFAULT_LENGTH_INPUT, DEFAULT_LENGTH_INPUT_UNIT, DEFAULT_LENGTH_OUTPUT, DEFAULT_LENGTH_OUTPUT_UNIT } from "../_shared/_constant"
import { SettingsStore } from "../_core/_settings"

export type LengthStoreType = {
	input: number
	output: number
	inputUnit: ConverterUnit
	outputUnit: ConverterUnit
}

export const LengthStore = new ObservableStore<LengthStoreType>({
	input: DEFAULT_LENGTH_INPUT,
	inputUnit: DEFAULT_LENGTH_INPUT_UNIT,
	output: DEFAULT_LENGTH_OUTPUT,
	outputUnit: DEFAULT_LENGTH_OUTPUT_UNIT
})

const _ref_input = $(ElementIds.pgLen_input) as HTMLInputElement
const _ref_output = $(ElementIds.pgLen_output) as HTMLInputElement
const _ref_inputUnit = $(ElementIds.pgLen_inputUnit) as CComboBox.CElement
const _ref_outputUnit = $(ElementIds.pgLen_outputUnit) as CComboBox.CElement
let _time_storageInput: NodeJS.Timeout | undefined = undefined
let _time_storageInputUnit: NodeJS.Timeout | undefined = undefined
let _time_storageOutputUnit: NodeJS.Timeout | undefined = undefined

export function convertLengthUnits(): void {
	const len = LengthStore.value
	const input = len.input
	const output = len.output
	const inputUnit = len.inputUnit
	const outputUnit = len.outputUnit
	const relativeUnitIds = LengthUnits.relativeUnitIds
	const settings = SettingsStore.value
	let inputUnitValue = inputUnit.value
	let outputUnitValue = outputUnit.value

	if (relativeUnitIds.has(inputUnit.id)) {
		switch (inputUnit.id) {
		case LengthUnits.rem.id:
			inputUnitValue = 1 / settings.pxPerRem
			break
		case LengthUnits.percentage.id:
			inputUnitValue = 100 / settings.pxPerPercentage
			break
		case LengthUnits.vh.id:
			inputUnitValue = 100 / settings.pxPerViewportHeight
			break
		case LengthUnits.vw.id:
			inputUnitValue = 100 / settings.pxPerViewportWidth
			break
		}
	}
	if (relativeUnitIds.has(outputUnit.id)) {
		switch (outputUnit.id) {
		case LengthUnits.rem.id:
			outputUnitValue = 1 / settings.pxPerRem
			break
		case LengthUnits.percentage.id:
			outputUnitValue = 100 / settings.pxPerPercentage
			break
		case LengthUnits.vh.id:
			outputUnitValue = 100 / settings.pxPerViewportHeight
			break
		case LengthUnits.vw.id:
			outputUnitValue = 100 / settings.pxPerViewportWidth
			break
		}
	}

	if (_ref_output.matches(':focus')) {
		LengthStore.update(v => v.input = output * inputUnitValue / outputUnitValue)
	}
	else {
		LengthStore.update(v => v.output = input * outputUnitValue / inputUnitValue)
	}
}

function _subsConvertUnit(v: LengthStoreType, o: LengthStoreType): void {
	const input = v.input
	const output = v.output
	const inputUnit = v.inputUnit
	const outputUnit = v.outputUnit
	const isAllSame = (
		input === o.input
		&& output === o.output
		&& inputUnit.id === o.inputUnit.id
		&& outputUnit.id === o.outputUnit.id
	)
	if (isAllSame) {return}

	convertLengthUnits()
}

function _subsStorage(v: LengthStoreType, o: LengthStoreType): void {
	const input = v.input
	if (input !== o.input) {
		clearTimeout(_time_storageInput)
		_time_storageInput = setTimeout(() =>
			saveStorageItem('page:length/input', input)
		, 1000)
	}

	const inputUnitId = v.inputUnit.id
	if (inputUnitId !== o.inputUnit.id) {
		clearTimeout(_time_storageInputUnit)
		_time_storageInputUnit = setTimeout(() =>
			saveStorageItem('page:length/input-unit-id', inputUnitId)
		, 1000)
	}

	const outputUnitId = v.outputUnit.id
	if (outputUnitId !== o.inputUnit.id) {
		clearTimeout(_time_storageOutputUnit)
		_time_storageOutputUnit = setTimeout(() =>
			saveStorageItem('page:length/output-unit-id', outputUnitId)
		, 1000)
	}
}

function _subsView(v: LengthStoreType): void {
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
	LengthStore.subscribe(_subsConvertUnit)
	LengthStore.subscribe(_subsStorage)
	LengthStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_input?.addEventListener('input', () => {
		const value = _ref_input.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		LengthStore.update(v => v.input = value)
	})

	_ref_output?.addEventListener('input', () => {
		const value = _ref_output.valueAsNumber
		if (isNumberNotDefined(value)) {return}

		LengthStore.update(v => v.output = value)
	})

	_ref_input?.addEventListener('blur', () => {
		if (_ref_input.value.trim().length > 0) {return}

		LengthStore.update(v => v.output = v.input = 0)
	})

	_ref_output?.addEventListener('blur', () => {
		if (_ref_output.value.trim().length > 0) {return}

		LengthStore.update(v => v.output = v.input = 0)
	})

	_ref_inputUnit.addEventListener('change', () => {
		const id = _ref_inputUnit.value
		if (!LengthUnits.all.has(id)) {
			_ref_inputUnit.value = LengthStore.value.inputUnit.id
			return
		}

		LengthStore.update(v => v.inputUnit = LengthUnits.all.get(id)!)
	})

	_ref_outputUnit.addEventListener('change', () => {
		const id = _ref_outputUnit.value
		if (!LengthUnits.all.has(id)) {
			_ref_outputUnit.value = LengthStore.value.outputUnit.id
			return
		}

		LengthStore.update(v => v.outputUnit = LengthUnits.all.get(id)!)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}