import { createSelectOptionRef, SelectAttributes, SelectEvents, updateSelectRef, updateSelectRefValue } from "@/native-components/Select"
import { AngleUnits, AreaUnits, Commands, ConverterType, ElementIds, FrequencyUnits, LengthUnits, PressureUnits, TemperatureUnits, TimeUnits, VolumeUnits, WeightUnits } from "../_enums"
import { G_SETTINGS } from "../_global-vars"
import { command } from "../_utils"
import type { CommandChangeConverterTypeDetail, CommandChangeUnitDetail } from "../_types"
import { validEnumValue } from "@/utils/object"

const $ = (id: string) => document.getElementById(id)
const _optionsRef     = $(ElementIds.bodyConverterOptions) as HTMLDivElement
const _unitTypeRef    = $(ElementIds.bodyConverterType) as HTMLDivElement
const _inputUnitsRef  = $(ElementIds.bodyConverterInputUnit) as HTMLDivElement
const _outputUnitsRef = $(ElementIds.bodyConverterOutputUnit) as HTMLDivElement
const _swapButtonRef  = $(ElementIds.bodyConverterSwap) as HTMLButtonElement

function _changeConverterType(type: ConverterType): void {
	if (!validEnumValue(type, ConverterType)) return

	let units = LengthUnits.all
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

	command<CommandChangeConverterTypeDetail>(Commands.changeConverterType, {
		converter: type,
		inputUnit: units[0],
		outputUnit: units[1]
	})

	const inputOptionRefs: HTMLButtonElement[] = []
	const outputOptionRefs: HTMLButtonElement[] = []
	for (const i in units) {
		const inputOptionRef = createSelectOptionRef({
			SelectOptionValue: units[i].name,
			SelectOptionSelected: Number(i) === 0,
			ButtonChildren: [`${units[i].name} (${units[i].symbol})`]
		})
		inputOptionRefs.push(inputOptionRef)

		const outputOptionRef = createSelectOptionRef({
			SelectOptionValue: units[i].name,
			SelectOptionSelected: Number(i) === 1,
			ButtonChildren: [`${units[i].name} (${units[i].symbol})`]
		})
		outputOptionRefs.push(outputOptionRef)
	}

	updateSelectRef(_inputUnitsRef, {
		SelectChildren: inputOptionRefs
	})
	updateSelectRef(_outputUnitsRef, {
		SelectChildren: outputOptionRefs
	})
}

function _changeUnit(type: 'input' | 'output', unitName: string): void {
	let units = LengthUnits.all
	switch (G_SETTINGS.converter.type) {
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

	const unit = units.find(v => v.name === unitName)
	if (!unit) return

	command<CommandChangeUnitDetail>(
		type === 'input'? Commands.changeInputUnit : Commands.changeOutputUnit,
		{unit}
	)
}

function _initOptions(): void {
	_optionsRef.addEventListener(SelectEvents.change, (ev) => {
		switch (ev.target) {
		case _unitTypeRef:
			_changeConverterType(_unitTypeRef.getAttribute(SelectAttributes.value)! as ConverterType)
			break
		case _inputUnitsRef:
			_changeUnit('input', _inputUnitsRef.getAttribute(SelectAttributes.value)!)
			break
		case _outputUnitsRef:
			_changeUnit('output', _outputUnitsRef.getAttribute(SelectAttributes.value)!)
			break
		}
	})
}

function _initSwapButton(): void {
	_swapButtonRef.addEventListener('click', () => {
		updateSelectRefValue(_inputUnitsRef, G_SETTINGS.converter.outputUnit.name)
		updateSelectRefValue(_outputUnitsRef, G_SETTINGS.converter.inputUnit.name)
	})
}

export default function _(): void {
	_initOptions()
	_initSwapButton()
}