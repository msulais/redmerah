import { ObservableStore } from "@/utils/store"
import { ConverterType } from "../_shared/_enums"
import { AngleUnits, AreaUnits, FrequencyUnits, LengthUnits, PressureUnits, TemperatureUnits, TimeUnits, VolumeUnits, WeightUnits, type ConverterUnit } from "../_shared/_units"
import { DEFAULT_CONVERTER_INPUT, DEFAULT_CONVERTER_INPUT_UNIT, DEFAULT_CONVERTER_OUTPUT, DEFAULT_CONVERTER_OUTPUT_UNIT, DEFAULT_CONVERTER_TYPE } from "../_shared/_constant"
import { calculate, convertUnit } from "../_core/_calculator"
import { $, scrollInputToEnd } from "../_core/_dom-utils"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { ElementIds } from "../_shared/_ids"
import { isValidEnumValue } from "@/utils/object"
import { AppCSSColors } from "@/enums/app-data"
import { saveStorageItem } from "../_core/_database"
import { createComboBoxOptionRef, updateComboBoxRef, type ComboBoxElement, type ComboBoxOptionElement } from "@/native-components/ComboBox"

export type ConverterStoreType = Readonly<{
	input: string
	output: number | null
	converter: ConverterType
	inputUnit: ConverterUnit
	outputUnit: ConverterUnit
}>

export const ConverterStore = new ObservableStore<ConverterStoreType>({
	converter: DEFAULT_CONVERTER_TYPE,
	input: DEFAULT_CONVERTER_INPUT,
	output: DEFAULT_CONVERTER_OUTPUT,
	inputUnit: DEFAULT_CONVERTER_INPUT_UNIT,
	outputUnit: DEFAULT_CONVERTER_OUTPUT_UNIT
})
const _inputRef      = $(ElementIds.pgConv_input) as HTMLInputElement
const _outputRef     = $(ElementIds.pgConv_output) as HTMLInputElement
const _converterRef  = $(ElementIds.pgConv_type) as ComboBoxElement
const _inputUnitRef  = $(ElementIds.pgConv_inputUnit) as ComboBoxElement
const _outputUnitRef = $(ElementIds.pgConv_outputUnit) as ComboBoxElement
let _timeCalculateId: NodeJS.Timeout | number | null = null
let _timeSaveInputId: NodeJS.Timeout | number | null = null

function _changeUnit(type: 'input' | 'output', unitId: string): void {
	let units = LengthUnits.all
	switch (ConverterStore.value.converter) {
	case ConverterType.length     : units = LengthUnits     .all; break
	case ConverterType.area       : units = AreaUnits       .all; break
	case ConverterType.volume     : units = VolumeUnits     .all; break
	case ConverterType.temperature: units = TemperatureUnits.all; break
	case ConverterType.time       : units = TimeUnits       .all; break
	case ConverterType.weight     : units = WeightUnits     .all; break
	case ConverterType.frequency  : units = FrequencyUnits  .all; break
	case ConverterType.pressure   : units = PressureUnits   .all; break
	case ConverterType.angle      : units = AngleUnits      .all; break
	}

	const unit = units.find(v => v.id === unitId)
	if (!unit) return;

	ConverterStore.update(v => {
		if (type === 'input') {
			v.inputUnit = unit
		}
		else {
			v.outputUnit = unit
		}
	})
}

function _calculate(value: ConverterStoreType): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		const output = calculate(value.input)
		const parsedOutput = convertUnit(Number.parseFloat(output), value.converter, value.inputUnit, value.outputUnit)
		ConverterStore.update(v => v.output = isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _subsConverterChanges(value: ConverterStoreType, old: ConverterStoreType): void {
	const type = value.converter
	if (type === old.converter) return;

	let units = LengthUnits.all
	saveStorageItem('calc:converter/type', type)
	switch (type) {
	case ConverterType.length     : units = LengthUnits     .all; break
	case ConverterType.area       : units = AreaUnits       .all; break
	case ConverterType.volume     : units = VolumeUnits     .all; break
	case ConverterType.temperature: units = TemperatureUnits.all; break
	case ConverterType.time       : units = TimeUnits       .all; break
	case ConverterType.weight     : units = WeightUnits     .all; break
	case ConverterType.frequency  : units = FrequencyUnits  .all; break
	case ConverterType.pressure   : units = PressureUnits   .all; break
	case ConverterType.angle      : units = AngleUnits      .all; break
	}

	const inputOptionRefs: ComboBoxOptionElement[] = []
	const outputOptionRefs: ComboBoxOptionElement[] = []
	for (const i in units) {
		const inputSpan = document.createElement('span')
		inputSpan.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
		inputSpan.textContent = units[i].symbol
		const inputOptionRef = createComboBoxOptionRef({
			ComboBoxOptionChildren: [`${units[i].name} [\xa0`, inputSpan, '\xa0]']
		})
		inputOptionRef.value = units[i].id
		inputOptionRef.selected = Number(i) === 0
		inputOptionRef.style.setProperty('gap', '0')
		inputOptionRefs.push(inputOptionRef)

		const outputSpan = document.createElement('span')
		outputSpan.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
		outputSpan.textContent = units[i].symbol
		const outputOptionRef = createComboBoxOptionRef({
			ComboBoxOptionChildren: [`${units[i].name} [\xa0`, outputSpan, '\xa0]']
		})
		outputOptionRef.value = units[i].id
		outputOptionRef.selected = Number(i) === 1
		outputOptionRef.style.setProperty('gap', '0')
		outputOptionRefs.push(outputOptionRef)
	}

	updateComboBoxRef(_inputUnitRef, {
		ComboBoxChildren: inputOptionRefs
	})
	updateComboBoxRef(_outputUnitRef, {
		ComboBoxChildren: outputOptionRefs
	})

	ConverterStore.update(v => {
		v.inputUnit = units[0]
		v.outputUnit = units[1]
	})
}

function _subsUnitChanges(value: ConverterStoreType, old: ConverterStoreType): void {
	if (
		value.inputUnit.equals(old.inputUnit)
		&& value.outputUnit.equals(old.outputUnit)
	) return;

	_calculate(value)
	saveStorageItem('calc:converter/input-unit', value.inputUnit.id)
	saveStorageItem('calc:converter/output-unit', value.outputUnit.id)
}

function _subsInputChanges(value: ConverterStoreType, old: ConverterStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate(value)
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc:converter/input', input)
	}, 250)
}

function _subsInputView(value: ConverterStoreType) {
	const input = value.input
	if (input === _inputRef.value) return

	_inputRef.value = input
	scrollInputToEnd(_inputRef)
}

function _subsOutputView(value: ConverterStoreType, old: ConverterStoreType) {
	const output = value.output
	if (output === null) return _outputRef.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === old.output
		&& _outputRef.value === formattedOutput
	) return;

	_outputRef.value = formattedOutput
}

function _subsConverterView(value: ConverterStoreType): void {
	const converter = value.converter
	if (converter === _converterRef.value) return

	_converterRef.value = converter
}

function _subsInputUnitView(value: ConverterStoreType): void {
	const id = value.inputUnit.id
	if (id === _inputUnitRef.value) return

	_inputUnitRef.value = id
}

function _subsOutputUnitView(value: ConverterStoreType): void {
	const id = value.outputUnit.id
	if (id === _outputUnitRef.value) return

	_outputUnitRef.value = id
}

function _initSubscriber(): void {
	ConverterStore.subscribe(_subsConverterChanges)
	ConverterStore.subscribe(_subsUnitChanges)
	ConverterStore.subscribe(_subsInputChanges)
	ConverterStore.subscribe(_subsInputView)
	ConverterStore.subscribe(_subsOutputView)
	ConverterStore.subscribe(_subsConverterView)
	ConverterStore.subscribe(_subsInputUnitView)
	ConverterStore.subscribe(_subsOutputUnitView)
}

function _initEvents(): void {
	_converterRef.addEventListener('change', () => {
		const value = _converterRef.value
		if (!isValidEnumValue(value, ConverterType)) return

		ConverterStore.update(v => v.converter = value as ConverterType)
	})

	_inputUnitRef.addEventListener('change', () => {
		_changeUnit('input', _inputUnitRef.value)
	})

	_outputUnitRef.addEventListener('change', () => {
		_changeUnit('output', _outputUnitRef.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}