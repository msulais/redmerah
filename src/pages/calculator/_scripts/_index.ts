import { KeyboardCode, KeyboardValue } from '@/enums/keyboard'
import appbar from './_appbar'
import pageScientific from './pages/_scientific'
import pageConverter from './pages/_converter'
import pageProgrammer from './pages/_programmer'
import pageDate from './pages/_date'
import { AngleUnits, BodyEvents, Commands, ConverterType, DateOperation, DecimalNumberFormat, ElementAttributes, ElementIds, GroupingNumberFormat, NumberType, Pages, RadioGroupNames, ScientificAngleType, TemperatureUnits } from './_enums'
import navigation from './_navigation'
import type { CommandChangeConverterTypeDetail, CommandChangeDateFromDetail, CommandChangeDateOperationDetail, CommandChangeDateToDetail, CommandChangeDecimalFormatDetail, CommandChangeGroupingFormatDetail, CommandChangePageDetail, CommandChangeProgrammerTypeDetail, CommandChangeUnitDetail, CommandDetail, CommandKeyCharDetail, CommandScientificAngleDetail } from './_types'
import { validEnumValue } from '@/utils/object'
import { command } from './_utils'
import { stringCount, stringReverse } from '@/utils/string'
import { DIVISION_CHAR, FUNCTION_REGEX, MULTIPLY_CHAR, NUMBER_REGEX } from './_constant'
import { mathCsc, mathSec, mathCot, mathCscH, mathSecH, mathCotH, mathACsc, mathASec, mathACot, mathACscH, mathASecH, mathACotH } from '@/utils/math'
import { numberFormat, numberIsDefined, numberSafe, numberToBinary, numberToRealDigits } from '@/utils/number'
import { CSSClasses } from '../_styles/_css'
import { isAnimationAllowed } from '@/utils/animation'
import { elementAnimateUpdateText } from '@/utils/element'
import { G_SETTINGS } from './_global-vars'
import type { ConverterUnit } from './classes'
import { dateDiffInDays } from '@/utils/datetime'

const $ = (id: string) => document.getElementById(id)
const $$ = <T extends Element>(selectors: string) => document.querySelector<T>(selectors)
const $$$ = <T extends Element>(selectors: string) => document.querySelectorAll<T>(selectors)
const _bodyRef = document.body
const _basicInputRef      = $(ElementIds.bodyBasicInput     ) as HTMLInputElement
const _scientificInputRef = $(ElementIds.bodyScientificInput) as HTMLInputElement
const _converterInputRef  = $(ElementIds.bodyConverterInput ) as HTMLInputElement
const _programmerInputRef = $(ElementIds.bodyProgrammerInput) as HTMLInputElement
const _dateInputYears = $(ElementIds.bodyDateInputYears) as HTMLInputElement
const _dateInputMonths = $(ElementIds.bodyDateInputMonths) as HTMLInputElement
const _dateInputDays = $(ElementIds.bodyDateInputDays) as HTMLInputElement
const _basicOutputRef = $(ElementIds.bodyBasicOutput) as HTMLInputElement
const _scientificOutputRef = $(ElementIds.bodyScientificOutput) as HTMLInputElement
const _converterOutputRef = $(ElementIds.bodyConverterOutput) as HTMLInputElement
const _programmerOutputDecRef = $$(`#${ElementIds.bodyProgrammerOutputDec} input`) as HTMLInputElement
const _programmerOutputOctRef = $$(`#${ElementIds.bodyProgrammerOutputOct} input`) as HTMLInputElement
const _programmerOutputHexRef = $$(`#${ElementIds.bodyProgrammerOutputHex} input`) as HTMLInputElement
const _programmerOutputBinRef = $$(`#${ElementIds.bodyProgrammerOutputBin} input`) as HTMLInputElement
const _dateOutputRef = $(ElementIds.bodyDateOutput) as HTMLOutputElement
const _dateInput = {
	from: new Date(),
	to: new Date(),
}
let _page: Pages = Pages.date
let _memoryValue = 0
let _basicOutput = 0
let _scientificOutput = 0
let _converterOutput = 0
let _programmerOutput = 0
let _timeStartCalculateId: number | NodeJS.Timeout | null = null

function _getOutput(page?: Pages): number {
	switch (page ?? _page) {
	case Pages.basic: return _basicOutput
	case Pages.scientific: return _scientificOutput
	case Pages.converter: return _converterOutput
	case Pages.programmer: return _programmerOutput
	case Pages.date:
	}
	return 0
}

function _getInput(page?: Pages): string {
	switch (page ?? _page) {
	case Pages.basic: return _basicInputRef.value
	case Pages.scientific: return _scientificInputRef.value
	case Pages.converter: return _converterInputRef.value
	case Pages.programmer: return _programmerInputRef.value
	case Pages.date:
	}

	return ''
}

function _changePage(page: Pages): void {
	_page = page
	_calculate()
}

function _initCommands(): void {
	_bodyRef.addEventListener('click', (ev) => {
		const $target = ev.target as HTMLElement
		if (!$target) return

		const target = $target.closest(`[${ElementAttributes.command}]`) as HTMLElement
		if (!target) return

		const dataset = target.dataset
		const type = dataset.command as Commands
		switch (type) {
		case Commands.memoryAdd:
		case Commands.memorySubtract:
		case Commands.memoryRecall:
		case Commands.memoryClear:
		case Commands.keyClear:
		case Commands.keyBackspace:
		case Commands.keyDecimal:
		case Commands.keyPlusMinus:
		case Commands.keyUnitSwap:
		case Commands.keyEqual:
		case Commands.calculate:
			command(type, {})
			break
		case Commands.changeProgrammerType:
		case Commands.changeDecimalFormat:
		case Commands.changeGroupingFormat:
		case Commands.changeInputUnit:
		case Commands.changeOutputUnit:
		case Commands.scientificAngle:
		case Commands.changeDateFrom:
		case Commands.changeDateTo:
		case Commands.changeConverterType:
		case Commands.changeDateOperation:
			break
		case Commands.keyChar: {
			const char = dataset.char
			if (!char) return

			command<CommandKeyCharDetail>(type, {char})
			break
		}
		case Commands.changePage: {
			const page = dataset.page as Pages
			if (!page || !validEnumValue(page, Pages)) return

			command<CommandChangePageDetail>(type, {page})
			break
		}}
	})

	_bodyRef.addEventListener(BodyEvents.command as any, (ev: CustomEvent<CommandDetail>) => {
		const detail = ev.detail
		switch (detail.type) {
		case Commands.memoryAdd:
			_memoryValue += numberSafe(_getOutput())
			_updateMemoryPreview()
			break
		case Commands.memorySubtract:
			_memoryValue -= numberSafe(_getOutput())
			_updateMemoryPreview()
			break
		case Commands.memoryRecall:
			_insertInputChar(numberToRealDigits(_memoryValue))
			break
		case Commands.memoryClear:
			_memoryValue = 0
			_updateMemoryPreview()
			break
		case Commands.changeDecimalFormat:
			_changeDecimalFormat((detail as CommandChangeDecimalFormatDetail).format)
			_updateMemoryPreview()
			break
		case Commands.changeGroupingFormat:
			_changeGroupingFormat((detail as CommandChangeGroupingFormatDetail).format)
			_updateMemoryPreview()
			break
		case Commands.changePage:
			_changePage((detail as CommandChangePageDetail).page)
			break
		case Commands.keyChar:
			_insertInputChar((detail as CommandKeyCharDetail).char)
			break
		case Commands.keyClear:
			_clearInput()
			break
		case Commands.keyBackspace:
			_removeLastInput()
			break
		case Commands.keyEqual:
			_replaceInputWithOutput()
			break
		case Commands.keyDecimal:
			_insertInputChar(G_SETTINGS.decimalFormat)
			break
		case Commands.keyPlusMinus:
			_inversInput()
			break
		case Commands.scientificAngle:
			_changeScientificAngle((detail as CommandScientificAngleDetail).angle)
			break
		case Commands.changeInputUnit:
			_changeConverterUnit('input', (detail as CommandChangeUnitDetail).unit)
			break
		case Commands.changeOutputUnit:
			_changeConverterUnit('output', (detail as CommandChangeUnitDetail).unit)
			break
		case Commands.keyUnitSwap:
			_swapConverterUnit()
			break
		case Commands.changeConverterType: {
			const options = (detail as CommandChangeConverterTypeDetail)
			_updateConverterType(options.converter, options.inputUnit, options.outputUnit)
			}; break
		case Commands.changeProgrammerType:
			_changeProgrammerType((detail as CommandChangeProgrammerTypeDetail).programmer)
			break
		case Commands.changeDateFrom:
			_dateInput.from = (detail as CommandChangeDateFromDetail).date
			_calculate()
			break
		case Commands.changeDateTo:
			_dateInput.to = (detail as CommandChangeDateToDetail).date
			_calculate()
			break
		case Commands.changeDateOperation:
			_changeDateOperation((detail as CommandChangeDateOperationDetail).operation)
			break
		case Commands.calculate:
			_calculate()
			break
		}
	})
}

function _changeDateOperation(operation: DateOperation): void {
	G_SETTINGS.date.operation = operation
	_calculate()
}

function _changeProgrammerType(type: NumberType): void {
	G_SETTINGS.programmer.numberType = type
	let value = _programmerOutputDecRef.value
	switch (type) {
	case NumberType.decimal: value = _programmerOutputDecRef.value; break
	case NumberType.hexadecimal: value = _programmerOutputHexRef.value; break
	case NumberType.octal: value = _programmerOutputOctRef.value; break
	case NumberType.binary: value = _programmerOutputBinRef.value; break
	}

	_programmerInputRef.value = value
	_scrollInputToEnd()
	_calculate()
}

function _updateConverterType(type: ConverterType, inputUnit: ConverterUnit, outputUnit: ConverterUnit): void {
	const converter = G_SETTINGS.converter
	converter.type = type
	converter.inputUnit = inputUnit
	converter.outputUnit = outputUnit
	_calculate()
}

function _swapConverterUnit(): void {
	const inputUnit = G_SETTINGS.converter.inputUnit
	const converter = G_SETTINGS.converter
	converter.inputUnit = converter.outputUnit
	converter.outputUnit = inputUnit
	_calculate()
}

function _inversInput(): void {
	const re = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
	let value = _getInput()
	const match = value.match(re)
	if (value.trim().length === 0) {
		value = '-'
	}
	else if (match) {
		const pre = match[1] ?? ''
		const sign = match[2] ?? ''
		const number = match[3] ?? ''
		let newsign = ''

		if (
			sign === '+-'
			|| sign === '-'
			|| sign === '-+'
		) {
			newsign = '+'
			if (pre === '') newsign = ''
		}
		else if (
			sign === '--'
			|| sign === '+'
			|| sign === '++'
			|| sign === ''
		) {
			newsign = '-'
		}

		if (pre.at(-1) && /[*×\/÷]/.test(pre.at(-1)!) && newsign === '+') {
			newsign = ''
		}

		value = pre + newsign + number
	}

	switch (_page) {
	case Pages.basic: _basicInputRef.value = value; break
	case Pages.scientific: _scientificInputRef.value = value; break
	case Pages.converter: _converterInputRef.value = value; break
	case Pages.programmer: _programmerInputRef.value = value; break
	case Pages.date:
	}

	_calculate()
}

function _changeConverterUnit(type: 'input' | 'output', unit: ConverterUnit): void {
	switch (type) {
	case 'input': G_SETTINGS.converter.inputUnit = unit; break
	case 'output': G_SETTINGS.converter.outputUnit = unit; break
	}

	_calculate()
}

function _changeScientificAngle(angle: ScientificAngleType): void {
	G_SETTINGS.scientific.angle = angle
	_calculate()
}

function _updateMemoryPreview(): void {
	const animation = isAnimationAllowed()
	for (const ref of document.querySelectorAll<HTMLElement>(`.${CSSClasses.bodyPageMemoryPreview}`)) {
		if (animation) {
			elementAnimateUpdateText(ref, 'MR: ' + _formatOutput(_memoryValue))
		} else {
			ref.textContent = 'MR: ' + _formatOutput(_memoryValue)
		}
	}
}

function _changeGroupingFormat(format: GroupingNumberFormat): void {
	G_SETTINGS.groupingFormat = format
	_calculate()

	// @ts-ignore
	if (G_SETTINGS.decimalFormat === G_SETTINGS.groupingFormat) {
		const selectedDecimalRef = $$(`input[name="${RadioGroupNames.settingsDecimal}"]:checked`) as HTMLInputElement
		if (selectedDecimalRef) selectedDecimalRef.checked = false

		let targetDecimalRef: HTMLInputElement | undefined
		switch (format) {
		case GroupingNumberFormat.point:
			_changeDecimalFormat(DecimalNumberFormat.comma)
			targetDecimalRef = $$(`input[name="${RadioGroupNames.settingsDecimal}"][value="${GroupingNumberFormat.comma}"]`) as HTMLInputElement
			break
		case GroupingNumberFormat.comma:
			_changeDecimalFormat(DecimalNumberFormat.point)
			targetDecimalRef = $$(`input[name="${RadioGroupNames.settingsDecimal}"][value="${GroupingNumberFormat.point}"]`) as HTMLInputElement
			break
		case GroupingNumberFormat.none:
		case GroupingNumberFormat.space:
		case GroupingNumberFormat.underscore:
		}

		if (targetDecimalRef) targetDecimalRef.checked = true
	}
}

function _changeDecimalFormat(format: DecimalNumberFormat): void {
	G_SETTINGS.decimalFormat = format
	_calculate()
	for (const ref of $$$<HTMLButtonElement>(`[${ElementAttributes.command}=${Commands.keyDecimal}]`)) {
		ref.textContent = format
	}

	// @ts-ignore
	if (G_SETTINGS.decimalFormat === G_SETTINGS.groupingFormat) {
		const selectedGroupRef = $$(`input[name="${RadioGroupNames.settingsGrouping}"]:checked`) as HTMLInputElement
		if (selectedGroupRef) selectedGroupRef.checked = false

		let targetGroupRef: HTMLInputElement
		switch (format) {
		case DecimalNumberFormat.point:
			_changeGroupingFormat(GroupingNumberFormat.comma)
			targetGroupRef = $$(`input[name="${RadioGroupNames.settingsGrouping}"][value="${GroupingNumberFormat.comma}"]`) as HTMLInputElement
			break
		case DecimalNumberFormat.comma:
			_changeGroupingFormat(GroupingNumberFormat.point)
			targetGroupRef = $$(`input[name="${RadioGroupNames.settingsGrouping}"][value="${GroupingNumberFormat.point}"]`) as HTMLInputElement
			break
		}

		if (targetGroupRef) targetGroupRef.checked = true
	}
}

function _replaceInputWithOutput(): void {
	switch (_page) {
	case Pages.basic:
		_basicInputRef.value = _formatOutput(_basicOutput)
		break
	case Pages.scientific:
		_scientificInputRef.value = _formatOutput(_scientificOutput)
		break
	case Pages.converter:
		_converterInputRef.value = _formatOutput(_converterOutput)
		break
	case Pages.programmer: break // TODO:
	case Pages.date: break
	}
}

function _initDatabase(): void {
	// TODO:
}

function _initKeyDown(): void {
	_bodyRef.addEventListener('keydown', ev => {
		if (_page === Pages.date) return

		const key = ev.key
		const target = ev.target as HTMLElement
		const code = ev.code
		const tagName = target.tagName
		const shiftKey = ev.shiftKey
		const ctrlKey = ev.ctrlKey
		if (
			[KeyboardValue.space, KeyboardValue.enter].includes(key as KeyboardValue)
			&& (
				['BUTTON', 'A'].includes(tagName)
				|| (tagName === 'INPUT'
					&& target !== _basicInputRef
					&& target !== _scientificInputRef
					&& target !== _converterInputRef
					&& target !== _programmerInputRef
					&& target !== _basicOutputRef
					&& target !== _scientificOutputRef
					&& target !== _converterOutputRef
					&& target !== _programmerOutputDecRef
					&& target !== _programmerOutputOctRef
					&& target !== _programmerOutputHexRef
					&& target !== _programmerOutputBinRef
				)
			)
		) {
			return
		}

		switch (key) {
			case KeyboardValue.backspace: return command(Commands.keyBackspace, {})
			case KeyboardValue.delete: return command(Commands.keyClear, {})
			case KeyboardValue.enter: return command(Commands.keyEqual, {})
		}

		if (ctrlKey && shiftKey) {
			const prevent = () => ev.preventDefault()

			// Ctrl + Shift + C
			if (code === KeyboardCode.keyC) {
				command(Commands.memoryClear, {})
				return prevent()
			}

			// Ctrl + Shift + R
			else if (code === KeyboardCode.keyR) {
				command(Commands.memoryRecall, {})
				return prevent()
			}

			// Ctrl + Shift + '+'
			else if (key === KeyboardValue.plus) {
				command(Commands.memoryAdd, {})
				return prevent()
			}

			// Ctrl + Shift + '-'
			else if (key === KeyboardValue.underscore) {
				command(Commands.memorySubtract, {})
				return prevent()
			}
		}

		// Shift, alt, etc
		if (key.length > 1 || !/[\w!%^×*÷<>|&/()\-+., ]/.test(key)) return

		command<CommandKeyCharDetail>(Commands.keyChar, {char: key})
	})
}

function _initSettings(): void {
	// TODO:
}

function _repairInput(input: string): string {
	const openBracketCount = stringCount(input, /\(/g)
	const closeBracketCount = stringCount(input, /\)/g)

	// '234))' => '((234))'
	if (openBracketCount < closeBracketCount) {
		input = "(".repeat(closeBracketCount - openBracketCount) + input
	}

	// '((234' => '((234))'
	else if (openBracketCount > closeBracketCount) {
		input = input + ")".repeat(openBracketCount - closeBracketCount)
	}

	// '123 456 789' => '123456789'
	input = input.replace(/\s/g, '')

	// '123,456,789' => '123456789'
	input = input.replaceAll(G_SETTINGS.groupingFormat, '')

	// '123456,789' => '123456.789'
	input = input.replaceAll(G_SETTINGS.decimalFormat, '.')

	// '.234' => '0.234'
	input = input.replace(/(?<!\d)\.\d+/g, (s) => '0' + s)

	// '123.' => '123'
	input = input.replace(/(\d+)\.(?!\d)/g, (_, grp1) => grp1)

	// '1.23E+5' => '1.23×100000'
	input = input.replace(
		/(\d+(?:\.\d+)?)E([+\-])?(\d+)/g,
		(_, group1, group2, group3) => {
			const isMinus = group2 == '-'
			const power = Number.parseInt(group3)
			return group1
				+ (power > 0
					? (isMinus
						? DIVISION_CHAR
						: MULTIPLY_CHAR
					) + '1' + '0'.repeat(power)
					: ''
				)
		}
	)

	// 'e×2×ceil(' => 'e×2×c\eil('
	const nonEulerEscapeRegex = [
		/(ceil|sec)\(/g,
		/\\e/g, // use in the last part
	]
	input = input.replace(nonEulerEscapeRegex[0], (r) => r.replace('e', '\\e'))

	// '123(456)' => '123×(456)'
	const implicitMultiplyRegex = [
		new RegExp(String.raw`(${NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${FUNCTION_REGEX}(?=\())`, 'g'),
		/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
	]
	let iterator = 0
	while (
		implicitMultiplyRegex[0].test(input)
		|| implicitMultiplyRegex[1].test(input)
	) {
		input = input.replace(
			implicitMultiplyRegex[0],
			(_, group1, group2) => group1 + MULTIPLY_CHAR + group2
		)
		input = input.replace(
			implicitMultiplyRegex[1],
			(_, group1, group2) => group1 + MULTIPLY_CHAR + group2
		)

		++iterator

		// I think the iterator will less than 5. But this is just to catch error in regex
		if (iterator > 20) {
			console.warn(
				'Iterator exceeded maximum value',
				'iterator:', iterator,
				'input:', input
			)
			break
		}
	}

	// 'e' => '2.718281828459045'
	input = input.replace(/(?<!\\)e/g, Math.E.toString())

	// 'π' => '3.141592653589793'
	input = input.replace(/π/g, Math.PI.toString())

	// 'c\eil(12)' => 'ceil(12)'
	input = input.replace(nonEulerEscapeRegex[1], 'e')

	return input
}

function _convertUnit(
	input: number,
	type: ConverterType,
	inputUnit: ConverterUnit,
	outputUnit: ConverterUnit,
): number {
	if (type == ConverterType.angle) {
		let degree: number = 0
		if (inputUnit.equals(AngleUnits.degree)) degree = input
		else if (inputUnit.equals(AngleUnits.radian)) degree = input * 180 / Math.PI
		else if (inputUnit.equals(AngleUnits.gradian)) degree = input * 9 / 10

		if (outputUnit.equals(AngleUnits.degree)) return degree
		if (outputUnit.equals(AngleUnits.radian)) return degree * Math.PI / 180
		if (outputUnit.equals(AngleUnits.gradian)) return degree * 10 / 9

		return input
	}
	if (type == ConverterType.temperature) {
		let celsius: number = 0
		if (inputUnit.equals(TemperatureUnits.celcius)) celsius = input
		else if (inputUnit.equals(TemperatureUnits.kelvin)) celsius = input - 273.15
		else if (inputUnit.equals(TemperatureUnits.reamur)) celsius = input * 5 / 4
		else if (inputUnit.equals(TemperatureUnits.fahrenheit)) celsius = (input - 32) * 5 / 9
		else if (inputUnit.equals(TemperatureUnits.romer)) celsius = (input - 7.5) * 40 / 21
		else if (inputUnit.equals(TemperatureUnits.rankine)) celsius = (input - 491.67) * 5 / 9
		else if (inputUnit.equals(TemperatureUnits.delisle)) celsius = 100 - input * 2 / 3

		if (outputUnit.equals(TemperatureUnits.celcius)) return celsius
		if (outputUnit.equals(TemperatureUnits.kelvin)) return celsius + 273.15
		if (outputUnit.equals(TemperatureUnits.reamur)) return celsius * 4 / 5
		if (outputUnit.equals(TemperatureUnits.fahrenheit)) return celsius * 9 / 5 + 32
		if (outputUnit.equals(TemperatureUnits.romer)) return celsius * 21 / 40 + 7.5
		if (outputUnit.equals(TemperatureUnits.rankine)) return (celsius + 273.15) * 9 / 5
		if (outputUnit.equals(TemperatureUnits.delisle)) return (100 - celsius) * 3 / 2

		return input
	}

	return input * outputUnit.value / inputUnit.value
}

function _calculateDate(): void {
	let output = ''
	const operation = G_SETTINGS.date.operation
	switch (operation) {
	case DateOperation.add:
	case DateOperation.subtract:
		const d = _dateInput.from
		const years = Math.floor(numberSafe(_dateInputYears.valueAsNumber))
		const months = Math.floor(numberSafe(_dateInputMonths.valueAsNumber))
		const days = Math.floor(numberSafe(_dateInputDays.valueAsNumber))
		output = new Date(
			d.getFullYear() + (years * (operation === DateOperation.subtract? -1 : 1)),
			d.getMonth() + (months * (operation === DateOperation.subtract? -1 : 1)),
			d.getDate() + (days * (operation === DateOperation.subtract? -1 : 1))
		).toLocaleDateString('en', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
		_dateOutputRef.textContent = output
		break
	case DateOperation.difference: {
		let days = Math.abs(dateDiffInDays(_dateInput.from, _dateInput.to))
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
				days = Math.floor(days % 30.437);
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
			if (diffInDays == 0) output = "Same date"
			else if (diffInDays >= 7) output += ` (${diffInDays} day${diffInDays > 1? "s" : ""})`

			_dateOutputRef.textContent = output
		} break
	}
}

function _inputToDecimal(input: string): string {
	const type = G_SETTINGS.programmer.numberType
	if (type !== NumberType.decimal) {
		input = input.replace(/[,\.]+/g, '')
	}

	switch (type) {
	case NumberType.decimal: break
	case NumberType.hexadecimal:
		input = input.replace(/[0-9A-F]+/g, (v) => Number.parseInt(v, 16).toString())
		break
	case NumberType.octal:
		if (/[89]/.test(input)) throw Error()

		input = input.replace(/[0-7]+/g, (v) => Number.parseInt(v, 8).toString())
		break
	case NumberType.binary:
		if (/[2-9]/.test(input)) throw Error()

		input = input.replace(/[01]+/g, (v) => Number.parseInt(v, 2).toString())
		break
	}
	return input
}

function _formatOutput(num: number){
	return (/[eE]/.test(num.toString())
		? num.toString().toUpperCase()
		: numberFormat(num, {decimal: G_SETTINGS.decimalFormat, thousand: G_SETTINGS.groupingFormat})
	)
}

function _setOutput(input: string = ''): void {
	const isValidValue = (v: string) => /^[+-]?\d+(?:\.\d+)?$/.test(v)
	switch (_page) {
	case Pages.basic:
		_basicOutput = Number.parseFloat(input)
		_basicOutputRef.value = isValidValue(input)? _formatOutput(_basicOutput) : ''
		break
	case Pages.scientific:
		_scientificOutput = Number.parseFloat(input)
		_scientificOutputRef.value = isValidValue(input)? _formatOutput(_scientificOutput) : ''
		break
	case Pages.programmer: {
		_programmerOutput = Number.parseFloat(input)
		const bin = numberToBinary(_programmerOutput)
		const parsedBin = Number.parseInt(bin, 2)
		_programmerOutputBinRef.value = numberIsDefined(_programmerOutput)? bin : ''
		_programmerOutputDecRef.value = isValidValue(input)? _formatOutput(_programmerOutput) : ''
		_programmerOutputHexRef.value = numberIsDefined(parsedBin)? parsedBin.toString(16).toUpperCase() : ''
		_programmerOutputOctRef.value = numberIsDefined(parsedBin)? parsedBin.toString(8).toUpperCase() : ''
		break
	}
	case Pages.converter:
		const converter = G_SETTINGS.converter
		input = numberToRealDigits(_convertUnit(
			Number.parseFloat(input),
			converter.type,
			converter.inputUnit,
			converter.outputUnit,
		))
		_converterOutput = Number.parseFloat(input)
		_converterOutputRef.value = isValidValue(input)? _formatOutput(_converterOutput) : ''
		break
	}
}

function _calculate(): void {
	if (_timeStartCalculateId !== null) clearTimeout(_timeStartCalculateId)

	_timeStartCalculateId = setTimeout(() => {
		_timeStartCalculateId = null
		try {
			let input = ''
			switch (_page) {
			case Pages.basic: input = _basicInputRef.value; break
			case Pages.scientific: input = _scientificInputRef.value; break
			case Pages.converter: input = _converterInputRef.value; break
			case Pages.programmer: input = _inputToDecimal(_programmerInputRef.value); break
			case Pages.date: return _calculateDate()
			}

			input = _repairInput(input)
			while (true) {
				let hasOperation = false

				// function operation
				const functionRegex = new RegExp(String.raw`(${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
				while (functionRegex.test(input)) {
					hasOperation = true
					input = input.replace(functionRegex, (_, fnName, value) => {
						let parsedValue: number = Number.parseFloat(value)
						const angleToRadian = (value: number) => {
							if (_page !== Pages.scientific) return value

							const angle = G_SETTINGS.scientific.angle
							let unit: ConverterUnit = AngleUnits.radian
							if (angle === ScientificAngleType.DEG) unit = AngleUnits.degree
							else if (angle === ScientificAngleType.GRAD) unit = AngleUnits.gradian

							return _convertUnit(value, ConverterType.angle, unit, AngleUnits.radian)
						}
						const radianToAngle = (value: number) => {
							if (_page !== Pages.scientific) return value

							const angle = G_SETTINGS.scientific.angle
							let unit: ConverterUnit = AngleUnits.radian
							if (angle == ScientificAngleType.DEG) unit = AngleUnits.degree
							else if (angle == ScientificAngleType.GRAD) unit = AngleUnits.gradian

							return _convertUnit(value, ConverterType.angle, AngleUnits.radian, unit)
						}

						switch (fnName) {
						case 'not': parsedValue = ~parsedValue; break
						case 'abs': parsedValue = Math.abs(parsedValue); break
						case 'log': parsedValue = Math.log10(parsedValue); break
						case 'ln': parsedValue = Math.log(parsedValue); break
						case 'ceil': parsedValue = Math.ceil(parsedValue); break
						case 'floor': parsedValue = Math.floor(parsedValue); break
						case 'round': parsedValue = Math.round(parsedValue); break
						case 'sqrt': parsedValue = Math.sqrt(parsedValue); break
						case 'sin': parsedValue = Math.sin(angleToRadian(parsedValue)); break
						case 'cos': parsedValue = Math.cos(angleToRadian(parsedValue)); break
						case 'tan': parsedValue = Math.tan(angleToRadian(parsedValue)); break
						case 'csc': parsedValue = mathCsc(angleToRadian(parsedValue)); break
						case 'sec': parsedValue = mathSec(angleToRadian(parsedValue)); break
						case 'cot': parsedValue = mathCot(angleToRadian(parsedValue)); break
						case 'sinh': parsedValue = Math.sinh(angleToRadian(parsedValue)); break
						case 'cosh': parsedValue = Math.cosh(angleToRadian(parsedValue)); break
						case 'tanh': parsedValue = Math.tanh(angleToRadian(parsedValue)); break
						case 'csch': parsedValue = mathCscH(angleToRadian(parsedValue)); break
						case 'sech': parsedValue = mathSecH(angleToRadian(parsedValue)); break
						case 'coth': parsedValue = mathCotH(angleToRadian(parsedValue)); break
						case 'asin': parsedValue = radianToAngle(Math.asin(parsedValue)); break
						case 'acos': parsedValue = radianToAngle(Math.acos(parsedValue)); break
						case 'atan': parsedValue = radianToAngle(Math.atan(parsedValue)); break
						case 'acsc': parsedValue = radianToAngle(mathACsc(parsedValue)); break
						case 'asec': parsedValue = radianToAngle(mathASec(parsedValue)); break
						case 'acot': parsedValue = radianToAngle(mathACot(parsedValue)); break
						case 'asinh': parsedValue = radianToAngle(Math.asinh(parsedValue)); break
						case 'acosh': parsedValue = radianToAngle(Math.acosh(parsedValue)); break
						case 'atanh': parsedValue = radianToAngle(Math.atanh(parsedValue)); break
						case 'acsch': parsedValue = radianToAngle(mathACscH(parsedValue)); break
						case 'asech': parsedValue = radianToAngle(mathASecH(parsedValue)); break
						case 'acoth': parsedValue = radianToAngle(mathACotH(parsedValue)); break
						}
						return numberToRealDigits(parsedValue)
					})
				}

				// remove brackets
				const bracketsRegex = new RegExp(String.raw`(?<!${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
				while (bracketsRegex.test(input)) {
					hasOperation = true
					input = input.replace(bracketsRegex, (_, num1) => num1)
				}

				// square root operation
				const sqrtRegex = /√([-+]?\d+(?:\.\d+)?)/g
				while (sqrtRegex.test(input)){
					hasOperation = true
					input = input.replace(sqrtRegex, (_, num1) => {
						const parsedValue = Number.parseFloat(num1)
						if (parsedValue < 0) throw Error()
						return numberToRealDigits(Math.sqrt(parsedValue))
					})
				}

				// percentage operation
				const percentageRegex = /(\d+(?:\.\d+)?)%/g
				while (percentageRegex.test(input)){
					hasOperation = true
					input = input.replace(
						percentageRegex,
						(_, num1) => numberToRealDigits(Number.parseFloat(num1) / 100)
					)
				}

				// factorial operation
				const factorialRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
				while (factorialRegex.test(input)){
					hasOperation = true
					input = input.replace(factorialRegex, (_, num1) => {
						let n = Number.parseFloat(num1)
						if (/\./.test(numberToRealDigits(n)) || n < 0) throw Error()

						let result = 1
						while (n > 0) {
							result *= n
							n--
						}
						return numberToRealDigits(result)
					})
				}

				// exponential operation
				const expRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
				const expReverseRegex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
				const match = input.match(expRegex)
				if (match) {
					hasOperation = true
					input = stringReverse(input)

					while (expReverseRegex.test(input)) {
						input = input.replace(
							expReverseRegex,
							(_, num2, num1) => stringReverse(numberToRealDigits(Math.pow(
								Number.parseFloat(stringReverse(num1)),
								Number.parseFloat(stringReverse(num2))
							)))
						)
					}
					input = stringReverse(input)
				}

				// division & multiplication & modulus operation
				const divMulModRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
				while (divMulModRegex.test(input)) {
					hasOperation = true
					input = input.replace(divMulModRegex, (_, num1, operator, num2) => {
						if (operator == 'mod') return numberToRealDigits(Number.parseFloat(num1) % Number.parseFloat(num2))
						else if (/[*×]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) * Number.parseFloat(num2))
						else if (/[\/÷]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) / Number.parseFloat(num2))
						return _
					})
				}


				// addition & substraction operation
				const addSubRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
				while (addSubRegex.test(input)) {
					hasOperation = true
					input = input.replace(addSubRegex, (_, num1, operator, num2) => {
						if (operator == '+') return numberToRealDigits(Number.parseFloat(num1) + Number.parseFloat(num2))
						if (operator == '-') return numberToRealDigits(Number.parseFloat(num1) - Number.parseFloat(num2))
						return _
					})
				}

				// shifting operation
				const lshRshRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
				while (lshRshRegex.test(input)) {
					hasOperation = true
					input = input.replace(lshRshRegex, (_, num1, operator, num2) => {
						const $num1: number = Number.parseFloat(num1)
						const $num2: number = Number.parseFloat(num2)
						if (/\./.test(num1) || /\./.test(num2)) throw Error()
						if (/^(lsh|<<)$/.test(operator)) return numberToRealDigits($num1 << $num2)
						if (/^(rsh|>>)$/.test(operator)) return numberToRealDigits($num1 >> $num2)
						return _
					})
				}

				// and operation
				const andRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
				while (andRegex.test(input)) {
					hasOperation = true
					input = input.replace(andRegex, (_, num1, num2) =>  {
						if (/\./.test(num1) || /\./.test(num2)) throw Error()
						return numberToRealDigits(Number.parseFloat(num1) & Number.parseFloat(num2))
					})
				}

				// xor operation
				const xorRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
				while (xorRegex.test(input)) {
					hasOperation = true
					input = input.replace(xorRegex, (_, num1, num2) => {
						if (/\./.test(num1) || /\./.test(num2)) throw Error()
						return numberToRealDigits(Number.parseFloat(num1) ^ Number.parseFloat(num2))
					})
				}

				// or operation
				const orRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
				while (orRegex.test(input)) {
					hasOperation = true
					input = input.replace(orRegex, (_, num1, num2) => {
						if (/\./.test(num1) || /\./.test(num2)) throw Error()
						return numberToRealDigits(Number.parseFloat(num1) | Number.parseFloat(num2))
					})
				}

				if (!hasOperation) break
			}

			_setOutput(input)
		}
		catch { _setOutput() }
	}, 50)
}

function _scrollInputToEnd(): void {
	switch (_page) {
	case Pages.basic:
		_basicInputRef.scrollLeft = _basicInputRef.scrollWidth
		break
	case Pages.scientific:
		_scientificInputRef.scrollLeft = _scientificInputRef.scrollWidth
		break
	case Pages.converter:
		_converterInputRef.scrollLeft = _converterInputRef.scrollWidth
		break
	case Pages.programmer:
		_programmerInputRef.scrollLeft = _programmerInputRef.scrollWidth
		break
	case Pages.date: break
	}
}

function _removeLastInput(): void {
	let value = ''
	switch (_page) {
	case Pages.basic:
		value = _basicInputRef.value
		_basicInputRef.value = value.substring(0, value.length-1)
		break
	case Pages.scientific:
		value = _scientificInputRef.value
		_scientificInputRef.value = value.substring(0, value.length-1)
		break
	case Pages.converter:
		value = _converterInputRef.value
		_converterInputRef.value = value.substring(0, value.length-1)
		break
	case Pages.programmer:
		value = _programmerInputRef.value
		_programmerInputRef.value = value.substring(0, value.length-1)
		break
	case Pages.date: break
	}

	_scrollInputToEnd()
	_calculate()
}

function _insertInputChar(char: string): void {
	switch (_page) {
	case Pages.basic:
		_basicInputRef.value += char
		break
	case Pages.scientific:
		_scientificInputRef.value += char
		break
	case Pages.converter:
		_converterInputRef.value += char
		break
	case Pages.programmer:
		_programmerInputRef.value += char
		break
	case Pages.date: break
	}

	_scrollInputToEnd()
	_calculate()
}

function _clearInput(): void {
	switch (_page) {
	case Pages.basic:
		_basicInputRef.value = ''
		break
	case Pages.scientific:
		_scientificInputRef.value = ''
		break
	case Pages.converter:
		_converterInputRef.value = ''
		break
	case Pages.programmer:
		_programmerInputRef.value = ''
		break
	case Pages.date: break
	}

	_scrollInputToEnd()
	_calculate()
}

function _(): void {
	_initDatabase()
	_initCommands()
	_initKeyDown()
	appbar()
	navigation()
	pageScientific()
	pageConverter()
	pageProgrammer()
	pageDate()
}

_()