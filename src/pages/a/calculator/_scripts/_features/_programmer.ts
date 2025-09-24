import { ObservableStore } from "@/utils/store"
import { NumberType } from "../_shared/_enums"
import { DEFAULT_PROGRAMMER_INPUT, DEFAULT_PROGRAMMER_NUMBER_TYPE, DEFAULT_PROGRAMMER_OUTPUT } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$, scrollInputToEnd } from "../_core/_dom-utils"
import { isTargetValidElement } from "@/utils/element"
import { CSSClasses } from "../../_styles/_css"
import { CButton } from "@/components/Button"
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
	input: DEFAULT_PROGRAMMER_INPUT,
	numberType: DEFAULT_PROGRAMMER_NUMBER_TYPE,
	output: DEFAULT_PROGRAMMER_OUTPUT
})

const _ref_input = $(ElementIds.pgPro_input) as HTMLInputElement
const _ref_output = $(ElementIds.pgPro_output) as HTMLDivElement
const _ref_outputGroupDec = $(ElementIds.pgPro_outDec) as HTMLDivElement
const _ref_outputGroupOct = $(ElementIds.pgPro_outOct) as HTMLDivElement
const _ref_outputGroupHex = $(ElementIds.pgPro_outHex) as HTMLDivElement
const _ref_outputGroupBin = $(ElementIds.pgPro_outBin) as HTMLDivElement
const _ref_outputDec = $$(`#${ElementIds.pgPro_outDec} input`) as HTMLInputElement
const _ref_outputOct = $$(`#${ElementIds.pgPro_outOct} input`) as HTMLInputElement
const _ref_outputHex = $$(`#${ElementIds.pgPro_outHex} input`) as HTMLInputElement
const _ref_outputBin = $$(`#${ElementIds.pgPro_outBin} input`) as HTMLInputElement
const _ref_hexButton = $$<CButton.CElement>(`#${(ElementIds.pgPro_outHex)}>button`)
const _ref_decButton = $$<CButton.CElement>(`#${(ElementIds.pgPro_outDec)}>button`)
const _ref_octButton = $$<CButton.CElement>(`#${(ElementIds.pgPro_outOct)}>button`)
const _ref_binButton = $$<CButton.CElement>(`#${(ElementIds.pgPro_outBin)}>button`)
const _refs_hexButton = $$$<CButton.CElement>(`.${CSSClasses.bdPageProg_btnHex}`)
const _refs_decButton = $$$<CButton.CElement>(`.${CSSClasses.bdPageProg_btnDec}`)
const _refs_octButton = $$$<CButton.CElement>(`.${CSSClasses.bdPageProg_btnOct}`)
const _refs_binButton = $$$<CButton.CElement>(`.${CSSClasses.bdPageProg_btnBin}`)
let _time_calculate: null | number | NodeJS.Timeout = null
let _time_saveInput: null | number | NodeJS.Timeout = null

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
	if (_time_calculate !== null) {
		clearTimeout(_time_calculate)
	}

	_time_calculate = setTimeout(() => {
		_time_calculate = null
		const output = calculate(_inputToDecimal(ProgrammerStore.value.input))
		const parsedOutput = Number.parseFloat(output)
		ProgrammerStore.update(v => v.output = isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _subsNumberTypeChanges(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const numberType = v.numberType
	if (numberType === o.numberType) return

	const output = v.output
	saveStorageItem('calc:programmer/number-type', numberType)
	if (output === null) {
		return ProgrammerStore.update(v => v.input = '')
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
	ProgrammerStore.update(v => v.input = text)
}

function _subsInputChanges(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const input = v.input
	if (input === o.input) return

	_calculate()
	if (_time_saveInput !== null) {
		clearTimeout(_time_saveInput)
	}

	_time_saveInput = setTimeout(() => {
		_time_saveInput = null
		saveStorageItem('calc:programmer/input', input)
	}, 250)
}

function _subsInputView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	if (v.input === o.input) return

	_ref_input.value = v.input
	scrollInputToEnd(_ref_input)
}

function _subsOutputView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const output = v.output
	const oldOutput = o.output
	if (output === null) {
		_ref_outputDec.value
		= _ref_outputHex.value
		= _ref_outputOct.value
		= _ref_outputBin.value = ''
		return
	}

	const formattedOutput = formatOutput(output)
	if (
		output === oldOutput
		&& _ref_outputDec.value === formattedOutput
	) return;

	const bin = numberToBinary(output)
	const parsedBin = Number.parseInt(bin, 2)
	_ref_outputHex.value = parsedBin.toString(16).toUpperCase()
	_ref_outputDec.value = formattedOutput
	_ref_outputOct.value = parsedBin.toString(8).toUpperCase()
	_ref_outputBin.value = bin
}

function _subsButtonsView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	const numberType = v.numberType
	if (numberType === o.numberType) return

	let cls = CSSClasses.bdPageProg_btnDec
	let elements = _refs_decButton

	switch (numberType) {
	case NumberType.decimal:
		cls = CSSClasses.bdPageProg_btnDec
		elements = _refs_decButton
		break
	case NumberType.hexadecimal:
		cls = CSSClasses.bdPageProg_btnHex
		elements = _refs_hexButton
		break
	case NumberType.octal:
		cls = CSSClasses.bdPageProg_btnOct
		elements = _refs_octButton
		break
	case NumberType.binary:
		cls = CSSClasses.bdPageProg_btnBin
		elements = _refs_binButton
		break
	}

	const ref_btns = $$$<CButton.CElement>(`.${CSSClasses.bdPageProg_btnValue}:not(.${cls})`)
	for (const ref of ref_btns) {
		ref.disabled = true
	}

	for (const ref of elements) {
		ref.disabled = false
	}
}

function _subsNumberTypeView(v: ProgrammerStoreType, o: ProgrammerStoreType): void {
	if (v.numberType === o.numberType) return

	for (const ref of [_ref_outputGroupDec, _ref_outputGroupHex, _ref_outputGroupOct, _ref_outputGroupBin]) {
		ref.setAttribute('aria-selected', 'false')
	}

	for (const ref of [_ref_hexButton, _ref_decButton, _ref_octButton, _ref_binButton]) {
		CButton.update(ref!, {Button: {variant: CButton.Variant.transparent}})
	}

	switch (v.numberType) {
	case NumberType.decimal:
		_ref_outputGroupDec.setAttribute('aria-selected', 'true')
		CButton.update(_ref_decButton!, {Button: {variant: CButton.Variant.filled}})
		break
	case NumberType.hexadecimal:
		_ref_outputGroupHex.setAttribute('aria-selected', 'true')
		CButton.update(_ref_hexButton!, {Button: {variant: CButton.Variant.filled}})
		break
	case NumberType.octal:
		_ref_outputGroupOct.setAttribute('aria-selected', 'true')
		CButton.update(_ref_octButton!, {Button: {variant: CButton.Variant.filled}})
		break
	case NumberType.binary:
		_ref_outputGroupBin.setAttribute('aria-selected', 'true')
		CButton.update(_ref_binButton!, {Button: {variant: CButton.Variant.filled}})
		break
	}
}

function _initSubscriber(): void {
	ProgrammerStore.subscribe(_subsNumberTypeChanges)
	ProgrammerStore.subscribe(_subsInputChanges)
	ProgrammerStore.subscribe(_subsInputView)
	ProgrammerStore.subscribe(_subsOutputView)
	ProgrammerStore.subscribe(_subsButtonsView)
	ProgrammerStore.subscribe(_subsNumberTypeView)
}

function _initEvents(): void {
	_ref_output.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_output, ref_btn, el => el.tagName === 'BUTTON')) return

		let type: NumberType = NumberType.decimal
		switch (ref_btn) {
		case _ref_hexButton: type = NumberType.hexadecimal; break
		case _ref_decButton: type = NumberType.decimal; break
		case _ref_octButton: type = NumberType.octal; break
		case _ref_binButton: type = NumberType.binary; break
		}

		ProgrammerStore.update(v => v.numberType = type)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}