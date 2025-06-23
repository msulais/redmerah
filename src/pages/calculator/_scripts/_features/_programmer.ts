import { ObservableStore } from "@/utils/store"
import { NumberType } from "../_shared/_enums"
import { DEFAULT_PROGRAMMER_NUMBER_TYPE } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$, scrollInputToEnd } from "../_core/_dom-utils"
import { isTargetValidElement } from "@/utils/element"
import { CSSClasses } from "@/pages/calculator/_styles/_css"
import { ButtonVariant, updateButtonRef } from "@/native-components/Button"
import { calculate } from "../_core/_calculator"
import { isNumberDefined, numberToBinary } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { saveStorageItem } from "../_core/_database"

export type ProgrammerStoreType = Readonly<{
	input: string
	output: null | number
	numberType: NumberType
}>

export enum ProgrammerStoreCustomKeys {
	calculate = 'calculate'
}

export const ProgrammerStore = new ObservableStore<ProgrammerStoreType>({
	input: '',
	numberType: DEFAULT_PROGRAMMER_NUMBER_TYPE,
	output: null
})

const _inputRef = $(ElementIds.bodyProgrammerInput) as HTMLInputElement
const _outputRef = $(ElementIds.bodyProgrammerOutput) as HTMLDivElement
const _outputGroupDecRef = $(ElementIds.bodyProgrammerOutputDec) as HTMLDivElement
const _outputGroupOctRef = $(ElementIds.bodyProgrammerOutputOct) as HTMLDivElement
const _outputGroupHexRef = $(ElementIds.bodyProgrammerOutputHex) as HTMLDivElement
const _outputGroupBinRef = $(ElementIds.bodyProgrammerOutputBin) as HTMLDivElement
const _outputDecRef = $$(`#${ElementIds.bodyProgrammerOutputDec} input`) as HTMLInputElement
const _outputOctRef = $$(`#${ElementIds.bodyProgrammerOutputOct} input`) as HTMLInputElement
const _outputHexRef = $$(`#${ElementIds.bodyProgrammerOutputHex} input`) as HTMLInputElement
const _outputBinRef = $$(`#${ElementIds.bodyProgrammerOutputBin} input`) as HTMLInputElement
const _hexButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputHex)}>button`)
const _decButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputDec)}>button`)
const _octButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputOct)}>button`)
const _binButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputBin)}>button`)
const _hexButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonHex}`)
const _decButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonDec}`)
const _octButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonOct}`)
const _binButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonBin}`)
let _timeCalculateId: null | number | NodeJS.Timeout = null
let _timeSaveInputId: null | number | NodeJS.Timeout = null

function _inputToDecimal(input: string): string {
	const type = ProgrammerStore.value.numberType
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

function _calculate(): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		_timeCalculateId = null
		const output = calculate(_inputToDecimal(ProgrammerStore.value.input))
		const parsedOutput = Number.parseFloat(output)
		ProgrammerStore.update(v => ({
			...v,
			output: isNumberDefined(parsedOutput)? parsedOutput : null
		}))
	}, 50)
}

function _subscribeNumberTypeChanges(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const numberType = v.numberType
	if (numberType === o.numberType) return

	const output = v.output
	saveStorageItem('calc/programmer/number-type', numberType)
	if (output === null) {
		return ProgrammerStore.update(v => ({...v, input: ''}))
	}

	let text = formatOutput(output!)
	const bin = numberToBinary(output)
	const parsedBin = Number.parseInt(bin, 2)
	switch (ProgrammerStore.value.numberType) {
	case NumberType.decimal: break
	case NumberType.hexadecimal:
		text = parsedBin.toString(16).toUpperCase()
		break
	case NumberType.octal:
		text = parsedBin.toString(8)
		break
	case NumberType.binary:
		text = bin
		break
	}
	ProgrammerStore.update(v => ({...v, input: text}))
}

function _subscribeInputChanges(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const input = v.input
	if (input === o.input) return

	_calculate()
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc/programmer/input', input)
	}, 250)
}

function _subscribeInputRefView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	if (v.input === o.input) return

	_inputRef.value = v.input
	scrollInputToEnd(_inputRef)
}

function _subscribeOutputRefView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const output = v.output
	const oldOutput = o.output
	if (output === null) {
		_outputDecRef.value
		= _outputHexRef.value
		= _outputOctRef.value
		= _outputBinRef.value = ''
		return
	}

	const formattedOutput = formatOutput(output)
	if (
		output === oldOutput
		&& _outputDecRef.value === formattedOutput
	) return;

	const bin = numberToBinary(output)
	const parsedBin = Number.parseInt(bin, 2)
	_outputHexRef.value = parsedBin.toString(16).toUpperCase()
	_outputDecRef.value = formattedOutput
	_outputOctRef.value = parsedBin.toString(8).toUpperCase()
	_outputBinRef.value = bin
}

function _subscribeButtonRefsView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const numberType = v.numberType
	if (numberType === o.numberType) return

	let cls = CSSClasses.bodyPageProgrammerButtonDec
	let elements = _decButtonRefs

	switch (numberType) {
	case NumberType.decimal:
		cls = CSSClasses.bodyPageProgrammerButtonDec
		elements = _decButtonRefs
		break
	case NumberType.hexadecimal:
		cls = CSSClasses.bodyPageProgrammerButtonHex
		elements = _hexButtonRefs
		break
	case NumberType.octal:
		cls = CSSClasses.bodyPageProgrammerButtonOct
		elements = _octButtonRefs
		break
	case NumberType.binary:
		cls = CSSClasses.bodyPageProgrammerButtonBin
		elements = _binButtonRefs
		break
	}

	const buttonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonValue}:not(.${cls})`)
	for (const ref of buttonRefs) {
		ref.disabled = true
	}

	for (const ref of elements) {
		ref.disabled = false
	}
}

function _subscribeNumberTypeRefView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	if (v.numberType === o.numberType) return

	for (const ref of [_outputGroupDecRef, _outputGroupHexRef, _outputGroupOctRef, _outputGroupBinRef]) {
		ref.setAttribute('aria-selected', 'false')
	}

	for (const ref of [_hexButtonRef, _decButtonRef, _octButtonRef, _binButtonRef]) {
		updateButtonRef(ref!, {ButtonVariant: ButtonVariant.transparent})
	}

	switch (v.numberType) {
	case NumberType.decimal:
		_outputGroupDecRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_decButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.hexadecimal:
		_outputGroupHexRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_hexButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.octal:
		_outputGroupOctRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_octButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.binary:
		_outputGroupBinRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_binButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	}
}

function _initSubscriber(): void {
	ProgrammerStore.subscribe(_subscribeNumberTypeChanges)
	ProgrammerStore.subscribe(_subscribeInputChanges)
	ProgrammerStore.subscribe(_subscribeInputRefView)
	ProgrammerStore.subscribe(_subscribeOutputRefView)
	ProgrammerStore.subscribe(_subscribeButtonRefsView)
	ProgrammerStore.subscribe(_subscribeNumberTypeRefView)
}

function _numberTypeEvents(): void {
	_outputRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_outputRef, buttonRef, el => el.tagName === 'BUTTON')) return

		let type: NumberType = NumberType.decimal
		switch (buttonRef) {
		case _hexButtonRef: type = NumberType.hexadecimal; break
		case _decButtonRef: type = NumberType.decimal; break
		case _octButtonRef: type = NumberType.octal; break
		case _binButtonRef: type = NumberType.binary; break
		}

		ProgrammerStore.update(v => ({
			...v,
			numberType: type
		}))
	})
}

export default () => {
	_initSubscriber()
	_numberTypeEvents()
}