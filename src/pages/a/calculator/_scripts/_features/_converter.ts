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
import { CComboBox } from "@/components/ComboBox"

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
const _ref_input      = $(ElementIds.pgConv_input) as HTMLInputElement
const _ref_output     = $(ElementIds.pgConv_output) as HTMLInputElement
const _ref_converter  = $(ElementIds.pgConv_type) as CComboBox.CElement
const _ref_inputUnit  = $(ElementIds.pgConv_inputUnit) as CComboBox.CElement
const _ref_outputUnit = $(ElementIds.pgConv_outputUnit) as CComboBox.CElement
let _time_calculate: NodeJS.Timeout | number | null = null
let _time_saveInput: NodeJS.Timeout | number | null = null

function _changeUnit(type: 'input' | 'output', unitId: string): void {
	let units = LengthUnits.all
	switch (ConverterStore.value.converter) {
	case ConverterType.Length     : units = LengthUnits     .all; break
	case ConverterType.Area       : units = AreaUnits       .all; break
	case ConverterType.Volume     : units = VolumeUnits     .all; break
	case ConverterType.Temperature: units = TemperatureUnits.all; break
	case ConverterType.Time       : units = TimeUnits       .all; break
	case ConverterType.Weight     : units = WeightUnits     .all; break
	case ConverterType.Frequency  : units = FrequencyUnits  .all; break
	case ConverterType.Pressure   : units = PressureUnits   .all; break
	case ConverterType.Angle      : units = AngleUnits      .all; break
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
	if (_time_calculate !== null) {
		clearTimeout(_time_calculate)
	}

	_time_calculate = setTimeout(() => {
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
	case ConverterType.Length     : units = LengthUnits     .all; break
	case ConverterType.Area       : units = AreaUnits       .all; break
	case ConverterType.Volume     : units = VolumeUnits     .all; break
	case ConverterType.Temperature: units = TemperatureUnits.all; break
	case ConverterType.Time       : units = TimeUnits       .all; break
	case ConverterType.Weight     : units = WeightUnits     .all; break
	case ConverterType.Frequency  : units = FrequencyUnits  .all; break
	case ConverterType.Pressure   : units = PressureUnits   .all; break
	case ConverterType.Angle      : units = AngleUnits      .all; break
	}

	const refs_inputOption: CComboBox.COption.CElement[] = []
	const refs_outputOption: CComboBox.COption.CElement[] = []
	for (const i in units) {
		const ref_inputSpan = document.createElement('span')
		ref_inputSpan.style.setProperty('color', `rgb(${AppCSSColors.Accent})`)
		ref_inputSpan.textContent = units[i].symbol
		const ref_inputOption = CComboBox.COption.create({
			Option: {children: [`${units[i].name} [\xa0`, ref_inputSpan, '\xa0]']}
		})
		ref_inputOption.value = units[i].id
		ref_inputOption.selected = Number(i) === 0
		ref_inputOption.style.setProperty('gap', '0')
		refs_inputOption.push(ref_inputOption)

		const ref_outputSpan = document.createElement('span')
		ref_outputSpan.style.setProperty('color', `rgb(${AppCSSColors.Accent})`)
		ref_outputSpan.textContent = units[i].symbol
		const ref_outputOption = CComboBox.COption.create({
			Option: {children: [`${units[i].name} [\xa0`, ref_outputSpan, '\xa0]']}
		})
		ref_outputOption.value = units[i].id
		ref_outputOption.selected = Number(i) === 1
		ref_outputOption.style.setProperty('gap', '0')
		refs_outputOption.push(ref_outputOption)
	}

	CComboBox.update(_ref_inputUnit, {
		ComboBox: {children: refs_inputOption}
	})
	CComboBox.update(_ref_outputUnit, {
		ComboBox: {children: refs_outputOption}
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
	if (_time_saveInput !== null) {
		clearTimeout(_time_saveInput)
	}

	_time_saveInput = setTimeout(() => {
		_time_saveInput = null
		saveStorageItem('calc:converter/input', input)
	}, 250)
}

function _subsInputView(value: ConverterStoreType) {
	const input = value.input
	if (input === _ref_input.value) return

	_ref_input.value = input
	scrollInputToEnd(_ref_input)
}

function _subsOutputView(value: ConverterStoreType, old: ConverterStoreType) {
	const output = value.output
	if (output === null) return _ref_output.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === old.output
		&& _ref_output.value === formattedOutput
	) return;

	_ref_output.value = formattedOutput
}

function _subsConverterView(value: ConverterStoreType): void {
	const converter = value.converter
	if (converter === _ref_converter.value) return

	_ref_converter.value = converter
}

function _subsInputUnitView(value: ConverterStoreType): void {
	const id = value.inputUnit.id
	if (id === _ref_inputUnit.value) return

	_ref_inputUnit.value = id
}

function _subsOutputUnitView(value: ConverterStoreType): void {
	const id = value.outputUnit.id
	if (id === _ref_outputUnit.value) return

	_ref_outputUnit.value = id
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
	_ref_converter.addEventListener('change', () => {
		const value = _ref_converter.value
		if (!isValidEnumValue(value, ConverterType)) return

		ConverterStore.update(v => v.converter = value as ConverterType)
	})

	_ref_inputUnit.addEventListener('change', () => {
		_changeUnit('input', _ref_inputUnit.value)
	})

	_ref_outputUnit.addEventListener('change', () => {
		_changeUnit('output', _ref_outputUnit.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}