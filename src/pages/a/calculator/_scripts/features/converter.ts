import * as Constant from '../shared/constant.enum.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import { ConverterTypes } from '../shared/calculator.js'
import { batch, signal } from "@/utils/signal.js"
import { $, scrollInputToEnd } from '../core/dom-utils.js'
import { AngleUnits, AreaUnits, FrequencyUnits, LengthUnits, PressureUnits, TemperatureUnits, TimeUnits, VolumeUnits, WeightUnits } from '../shared/units.js'
import { calculate, convertUnit } from '../core/calculator.js'
import { isNumberDefined } from '@/utils/number'
import { formatOutput } from '../core/string-utils.js'
import { isValidEnumValue } from '@/utils/object.js'
import { saveStorageItem } from '../core/database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_converter = signal<ConverterTypes>(Constant.DEFAULT_CONVERTER_TYPE)
export const sg_input = signal(Constant.DEFAULT_CONVERTER_INPUT)
export const sg_output = signal(Constant.DEFAULT_CONVERTER_OUTPUT)
export const sg_inputUnit = signal(Constant.DEFAULT_CONVERTER_INPUT_UNIT)
export const sg_outputUnit = signal(Constant.DEFAULT_CONVERTER_OUTPUT_UNIT)

const _ref_input      = $(Ids.PageConverterInput) as HTMLInputElement
const _ref_output     = $(Ids.PageConverterOutput) as HTMLInputElement
const _ref_converter  = $(Ids.PageConverterType) as HTMLSelectElement
const _ref_inputUnit  = $(Ids.PageConverterInputUnit) as HTMLSelectElement
const _ref_outputUnit = $(Ids.PageConverterOutputUnit) as HTMLSelectElement
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _changeUnit(type: 'input' | 'output', unitId: string): void {
	let units = LengthUnits.all
	switch (sg_converter()) {
	case ConverterTypes.Length     : units = LengthUnits     .all; break
	case ConverterTypes.Area       : units = AreaUnits       .all; break
	case ConverterTypes.Volume     : units = VolumeUnits     .all; break
	case ConverterTypes.Temperature: units = TemperatureUnits.all; break
	case ConverterTypes.Time       : units = TimeUnits       .all; break
	case ConverterTypes.Weight     : units = WeightUnits     .all; break
	case ConverterTypes.Frequency  : units = FrequencyUnits  .all; break
	case ConverterTypes.Pressure   : units = PressureUnits   .all; break
	case ConverterTypes.Angle      : units = AngleUnits      .all; break
	}

	const unit = units.find(v => v.id === unitId)
	if (!unit) {
		return
	}

	switch (type) {
	case 'input' : sg_inputUnit .set(unit); break
	case 'output': sg_outputUnit.set(unit); break
	}
}

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		const output = calculate(sg_input())
		const parsedOutput = convertUnit(
			Number.parseFloat(output),
			sg_converter(),
			sg_inputUnit(),
			sg_outputUnit()
		)
		sg_output.set(isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _changeConverterType(type: ConverterTypes): void {
	let units = LengthUnits.all
	switch (type) {
	case ConverterTypes.Length     : units = LengthUnits     .all; break
	case ConverterTypes.Area       : units = AreaUnits       .all; break
	case ConverterTypes.Volume     : units = VolumeUnits     .all; break
	case ConverterTypes.Temperature: units = TemperatureUnits.all; break
	case ConverterTypes.Time       : units = TimeUnits       .all; break
	case ConverterTypes.Weight     : units = WeightUnits     .all; break
	case ConverterTypes.Frequency  : units = FrequencyUnits  .all; break
	case ConverterTypes.Pressure   : units = PressureUnits   .all; break
	case ConverterTypes.Angle      : units = AngleUnits      .all; break
	}

	const refs_inputOption: HTMLOptionElement[] = []
	const refs_outputOption: HTMLOptionElement[] = []
	for (const i in units) {
		const ref_inputSpan = document.createElement('span')
		ref_inputSpan.style.setProperty('color', `rgb(var(${BrTheme.CSSVars.ColorAccent}))`)
		ref_inputSpan.textContent = units[i].symbol

		const ref_inputOption = document.createElement('option')
		ref_inputOption.innerHTML = `${units[i].name} [\xa0${ref_inputSpan.outerHTML}\xa0]`
		ref_inputOption.value = units[i].id
		ref_inputOption.selected = Number(i) === 0
		ref_inputOption.style.setProperty('gap', '0')
		refs_inputOption.push(ref_inputOption)

		const ref_outputSpan = document.createElement('span')
		ref_outputSpan.style.setProperty('color', `rgb(var(${BrTheme.CSSVars.ColorAccent}))`)
		ref_outputSpan.textContent = units[i].symbol

		const ref_outputOption = document.createElement('option')
		ref_outputOption.innerHTML = `${units[i].name} [\xa0${ref_outputSpan.outerHTML}\xa0]`
		ref_outputOption.value = units[i].id
		ref_outputOption.selected = Number(i) === 1
		ref_outputOption.style.setProperty('gap', '0')
		refs_outputOption.push(ref_outputOption)
	}

	_ref_inputUnit.replaceChildren(...refs_inputOption)
	_ref_outputUnit.replaceChildren(...refs_outputOption)

	batch(() => {
		sg_inputUnit.set(units[0])
		sg_outputUnit.set(units[1])
	})
}

function _initSubscriber(): void {
	sg_input.subscribe((v) => {
		_calculate()
		_ref_input.value = v
		scrollInputToEnd(_ref_input)
		saveStorageItem('page-converter-input', v, 250)
	})

	sg_output.subscribe((v) => {
		_ref_output.value = v === null? '' : formatOutput(v)
	})

	sg_converter.subscribe(v => {
		_ref_converter.value = v
		_changeConverterType(v)
		saveStorageItem('page-converter-type', v)
	})

	sg_inputUnit.subscribe(v => {
		_calculate()
		_ref_inputUnit.value = v.id
		saveStorageItem('page-converter-input-unit', v.id)
	})

	sg_outputUnit.subscribe(v => {
		_calculate()
		_ref_outputUnit.value = v.id
		saveStorageItem('page-converter-output-unit', v.id)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_converter, 'change', () => {
		const value = _ref_converter.value
		if (!isValidEnumValue(value, ConverterTypes)) {
			return
		}

		sg_converter.set(value as ConverterTypes)
	})

	delegateEvent(_ref_inputUnit, 'change', () => {
		_changeUnit('input', _ref_inputUnit.value)
	})

	delegateEvent(_ref_outputUnit, 'change', () => {
		_changeUnit('output', _ref_outputUnit.value)
	})

	delegateEvent(_ref_input, 'input', () => {
		sg_input.set(_ref_input.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}