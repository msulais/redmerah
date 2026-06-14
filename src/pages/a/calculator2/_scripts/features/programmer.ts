import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as Styles from '../../_styles/styles.enum.js'
import { $, $$$, scrollInputToEnd } from "../core/dom-utils"
import { calculate } from "../core/calculator"
import { isNumberDefined, numberToBinary } from "@/utils/number"
import { formatOutput } from "../core/string-utils"
import { saveStorageItem } from "../core/database"
import { signal } from "@/utils/signal"
import { ProgrammerNumTypes } from '../shared/calculator'
import { isValidEnumValue } from '@/utils/object'

const _sg_input = signal(Constant.DEFAULT_PROGRAMMER_INPUT)

// IN DEC ONLY
const _sg_output = signal(Constant.DEFAULT_PROGRAMMER_OUTPUT)

const _sg_numType = signal(Constant.DEFAULT_PROGRAMMER_NUMBER_TYPE)

export const Signals = {
	input: _sg_input,
	output: _sg_output,
	numType: _sg_numType
}

const _ref_input = $(Ids.PageProgrammerInput) as HTMLInputElement
const _ref_outputDec = $(Ids.PageProgrammerOutputDec) as HTMLInputElement
const _ref_outputOct = $(Ids.PageProgrammerOutputOct) as HTMLInputElement
const _ref_outputHex = $(Ids.PageProgrammerOutputHex) as HTMLInputElement
const _ref_outputBin = $(Ids.PageProgrammerOutputBin) as HTMLInputElement
const _ref_numTypes = $(Ids.PageProgrammerNumTypes) as HTMLSelectElement
const _refs_hexButton = $$$<HTMLButtonElement>(`.${Styles.PageProgrammerBtnHex}`)
const _refs_decButton = $$$<HTMLButtonElement>(`.${Styles.PageProgrammerBtnDec}`)
const _refs_octButton = $$$<HTMLButtonElement>(`.${Styles.PageProgrammerBtnOct}`)
const _refs_binButton = $$$<HTMLButtonElement>(`.${Styles.PageProgrammerBtnBin}`)
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _inputToDecimal(input: string): string {
	if (_sg_numType() !== ProgrammerNumTypes.Decimal) {
		input = input.replace(/[,\.]+/g, '')
	}

	switch (_sg_numType()) {
	case ProgrammerNumTypes.Decimal: break
	case ProgrammerNumTypes.Hexadecimal:
		input = input.replace(/[0-9A-F]+/g, (v) => Number.parseInt(v, 16).toString())
		break
	case ProgrammerNumTypes.Octal:
		if (/[89]/.test(input)) throw Error()

		input = input.replace(/[0-7]+/g, (v) => Number.parseInt(v, 8).toString())
		break
	case ProgrammerNumTypes.Binary:
		if (/[2-9]/.test(input)) throw Error()

		input = input.replace(/[01]+/g, (v) => Number.parseInt(v, 2).toString())
		break
	}
	return input
}

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		const output = calculate(_inputToDecimal(_sg_input()))
		const parsedOutput = Number.parseFloat(output)
		_sg_output.set(isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _initSubscriber(): void {
	_sg_numType.subscribe(v => {
		_ref_numTypes.value = v
		saveStorageItem('page-programmer-num-type', v, 250)

		// update disabled buttons & update input
		const isOutputNull = _sg_output() === null
		let cls = Styles.PageProgrammerBtnDec
		let elements = _refs_decButton
		let updatedTextInput = ''

		const bin = () => numberToBinary(_sg_output()!)
		const parsedBin = () => Number.parseInt(bin(), 2)
		switch (v) {
		case ProgrammerNumTypes.Decimal:
			if (!isOutputNull) {
				updatedTextInput = formatOutput(_sg_output()!)
			}
			break
		case ProgrammerNumTypes.Hexadecimal:
			cls = Styles.PageProgrammerBtnHex
			elements = _refs_hexButton
			if (!isOutputNull) {
				updatedTextInput = parsedBin().toString(16).toUpperCase()
			}
			break
		case ProgrammerNumTypes.Octal:
			cls = Styles.PageProgrammerBtnOct
			elements = _refs_octButton
			if (!isOutputNull) {
				updatedTextInput = parsedBin().toString(8).toUpperCase()
			}
			break
		case ProgrammerNumTypes.Binary:
			cls = Styles.PageProgrammerBtnBin
			elements = _refs_binButton
			if (!isOutputNull) {
				updatedTextInput = bin()
			}
			break
		}

		const ref_btns = $$$<HTMLButtonElement>(`.${Styles.PageProgrammerBtnValue}:not(.${cls})`)
		for (const ref of ref_btns) {
			ref.disabled = true
		}

		for (const ref of elements) {
			ref.disabled = false
		}

		_sg_input.set(updatedTextInput)
	})

	_sg_output.subscribe(v => {
		if (v === null) {
			_ref_outputHex.value = ''
			_ref_outputDec.value = ''
			_ref_outputOct.value = ''
			_ref_outputBin.value = ''
			return
		}

		const customFormat = (value: string, length: number, separator: string) => {
			const pattern = `.{1,${length}}(?=(?:.{${length}})*$)`;
			const re = new RegExp(pattern, "g");
			const result = value.match(re) || [];
			return result.join(separator);
		}

		const formattedOutput = formatOutput(v)
		const bin = numberToBinary(v)
		const parsedBin = Number.parseInt(bin, 2)
		_ref_outputHex.value = customFormat(parsedBin.toString(16).toUpperCase(), 4, ' ')
		_ref_outputDec.value = formattedOutput
		_ref_outputOct.value = customFormat(parsedBin.toString(8).toUpperCase(), 3, ' ')
		_ref_outputBin.value = customFormat(bin, 4, ' ')
	})

	_sg_input.subscribe(v => {
		_ref_input.value = v
		saveStorageItem('page-programmer-input', v, 250)
		scrollInputToEnd(_ref_input)
		_calculate()
	})
}

function _initEvents(): void {
	_ref_numTypes.addEventListener('change', () => {
		const value = _ref_numTypes.value as ProgrammerNumTypes
		if (!isValidEnumValue(value, ProgrammerNumTypes)) {
			_ref_numTypes.value = ProgrammerNumTypes.Decimal
			return
		}

		_sg_numType.set(value)
	})

	_ref_input.addEventListener('input', () => {
		_sg_input.set(_ref_input.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}