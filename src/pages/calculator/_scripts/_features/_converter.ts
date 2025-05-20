import { ObservableStore } from "@/utils/store"
import { ConverterType } from "../_shared/_enums"
import { AngleUnits, AreaUnits, FrequencyUnits, LengthUnits, PressureUnits, TemperatureUnits, TimeUnits, VolumeUnits, WeightUnits, type ConverterUnit } from "../_shared/_units"
import { DEFAULT_CONVERTER_INPUT_UNIT, DEFAULT_CONVERTER_OUTPUT_UNIT, DEFAULT_CONVERTER_TYPE } from "../_shared/_constant"
import { calculate, convertUnit } from "../_core/_calculator"
import { $, scrollInputToEnd } from "../_core/_dom-utils"
import { numberIsDefined } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { ElementIds } from "../_shared/_ids"
import { createSelectOptionRef, getSelectRefValue, SelectEvents, updateSelectRef, updateSelectRefValue, type SelectElement } from "@/native-components/Select"
import { validEnumValue } from "@/utils/object"
import { AppColors } from "@/enums/colors"
import { saveStorageItem } from "../_core/_database"

export type ConverterStoreType = Readonly<{
	input: string
	output: number | null
	converter: ConverterType
	inputUnit: ConverterUnit
	outputUnit: ConverterUnit
}>

export const ConverterStore = new ObservableStore<ConverterStoreType>({
	converter: DEFAULT_CONVERTER_TYPE,
	input: '',
	output: null,
	inputUnit: DEFAULT_CONVERTER_INPUT_UNIT,
	outputUnit: DEFAULT_CONVERTER_OUTPUT_UNIT
})
const _inputRef      = $(ElementIds.bodyConverterInput) as HTMLInputElement
const _outputRef     = $(ElementIds.bodyConverterOutput) as HTMLInputElement
const _converterRef  = $(ElementIds.bodyConverterType) as SelectElement
const _inputUnitRef  = $(ElementIds.bodyConverterInputUnit) as SelectElement
const _outputUnitRef = $(ElementIds.bodyConverterOutputUnit) as SelectElement
let _timeCalculateId: number | NodeJS.Timeout | null = null
let _timeSaveInputId: number | NodeJS.Timeout | null = null

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

	ConverterStore.update(v => type === 'input'
		? ({ ...v, inputUnit: unit })
		: ({ ...v, outputUnit: unit })
	)
}

function _calculate(value: ConverterStoreType): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		const output = calculate(value.input)
		const parsedOutput = convertUnit(Number.parseFloat(output), value.converter, value.inputUnit, value.outputUnit)
		ConverterStore.update(v => ({
			...v,
			output: numberIsDefined(parsedOutput)? parsedOutput : null
		}))
	}, 50)
}

function _subscribeConverterChanges(value: ConverterStoreType, old: ConverterStoreType): void {
	const type = value.converter
	if (type === old.converter) return;

	let units = LengthUnits.all
	saveStorageItem('calc/converter/type', type)
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

	const inputOptionRefs: HTMLButtonElement[] = []
	const outputOptionRefs: HTMLButtonElement[] = []
	for (const i in units) {
		const inputSpan = document.createElement('span')
		inputSpan.style.setProperty('color', `rgb(${AppColors.accent})`)
		inputSpan.textContent = units[i].symbol
		const inputOptionRef = createSelectOptionRef({
			SelectOptionValue: units[i].id,
			SelectOptionSelected: Number(i) === 0,
			ButtonChildren: [`${units[i].name} [\xa0`, inputSpan, '\xa0]']
		})
		inputOptionRef.style.setProperty('gap', '0')
		inputOptionRefs.push(inputOptionRef)

		const outputSpan = document.createElement('span')
		outputSpan.style.setProperty('color', `rgb(${AppColors.accent})`)
		outputSpan.textContent = units[i].symbol
		const outputOptionRef = createSelectOptionRef({
			SelectOptionValue: units[i].id,
			SelectOptionSelected: Number(i) === 1,
			ButtonChildren: [`${units[i].name} [\xa0`, outputSpan, '\xa0]']
		})
		outputOptionRef.style.setProperty('gap', '0')
		outputOptionRefs.push(outputOptionRef)
	}

	updateSelectRef(_inputUnitRef, {
		SelectChildren: inputOptionRefs
	})
	updateSelectRef(_outputUnitRef, {
		SelectChildren: outputOptionRefs
	})

	ConverterStore.update(v => ({
		...v,
		inputUnit: units[0],
		outputUnit: units[1]
	}))
}

function _subscribeUnitChanges(value: ConverterStoreType, old: ConverterStoreType): void {
	if (
		value.inputUnit.equals(old.inputUnit)
		&& value.outputUnit.equals(old.outputUnit)
	) return;

	_calculate(value)
	saveStorageItem('calc/converter/input-unit', value.inputUnit.id)
	saveStorageItem('calc/converter/output-unit', value.outputUnit.id)
}

function _subscribeInputChanges(value: ConverterStoreType, old: ConverterStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate(value)
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc/converter/input', input)
	}, 250)
}

function _subscribeInputRefView(value: ConverterStoreType) {
	const input = value.input
	if (input === _inputRef.value) return

	_inputRef.value = input
	scrollInputToEnd(_inputRef)
}

function _subscribeOutputRefView(value: ConverterStoreType, old: ConverterStoreType) {
	const output = value.output
	if (output === null) return _outputRef.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === old.output
		&& _outputRef.value === formattedOutput
	) return;

	_outputRef.value = formattedOutput
}

function _subscribeConverterRefView(value: ConverterStoreType): void {
	const converter = value.converter
	if (converter === getSelectRefValue(_converterRef)) return

	updateSelectRefValue(_converterRef, converter)
}

function _subscribeInputUnitRefView(value: ConverterStoreType): void {
	const id = value.inputUnit.id
	if (id === getSelectRefValue(_inputUnitRef)) return

	updateSelectRefValue(_inputUnitRef, id)
}

function _subscribeOutputUnitRefView(value: ConverterStoreType): void {
	const id = value.outputUnit.id
	if (id === getSelectRefValue(_outputUnitRef)) return

	updateSelectRefValue(_outputUnitRef, id)
}

function _initSubscriber(): void {
	ConverterStore.subscribe(_subscribeConverterChanges)
	ConverterStore.subscribe(_subscribeUnitChanges)
	ConverterStore.subscribe(_subscribeInputChanges)
	ConverterStore.subscribe(_subscribeInputRefView)
	ConverterStore.subscribe(_subscribeOutputRefView)
	ConverterStore.subscribe(_subscribeConverterRefView)
	ConverterStore.subscribe(_subscribeInputUnitRefView)
	ConverterStore.subscribe(_subscribeOutputUnitRefView)
}

function _initConverterEvents(): void {
	_converterRef.addEventListener(SelectEvents.change, () => {
		const value = getSelectRefValue(_converterRef)
		if (!validEnumValue(value, ConverterType)) return

		ConverterStore.update(v => ({
			...v,
			converter: value as ConverterType
		}))
	})
}

function _initInputUnitEvents(): void {
	_inputUnitRef.addEventListener(SelectEvents.change, () => {
		const unitId = getSelectRefValue(_inputUnitRef)

		_changeUnit('input', unitId)
	})
}

function _initOutputUnitEvents(): void {
	_outputUnitRef.addEventListener(SelectEvents.change, () => {
		const unitId = getSelectRefValue(_outputUnitRef)

		_changeUnit('output', unitId)
	})
}

export default () => {
	_initSubscriber()
	_initConverterEvents()
	_initInputUnitEvents()
	_initOutputUnitEvents()
}