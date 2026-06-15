import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { $, scrollInputToEnd } from "../core/dom-utils.js"
import { calculate } from "../core/calculator.js"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../core/string-utils.js"
import { saveStorageItem } from "../core/database.js"
import { signal } from '@/utils/signal.js'

const _sg_input = signal(Constant.DEFAULT_BASIC_INPUT)
const _sg_output = signal(Constant.DEFAULT_BASIC_OUTPUT)

export const Signals = {
	input: _sg_input,
	output: _sg_output
}

const _ref_input = $(Ids.PageBasicInput) as HTMLInputElement
const _ref_output = $(Ids.PageBasicOutput) as HTMLInputElement
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		const output = calculate(_sg_input())
		const parsedOutput = Number.parseFloat(output)
		_sg_output.set(isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _initSubscriber(): void {
	_sg_input.subscribe(v => {
		_ref_input.value = v
		scrollInputToEnd(_ref_input)
		saveStorageItem('page-basic-input', v, 250)
		_calculate()
	})

	_sg_output.subscribe(v => {
		_ref_output.value = v === null? "" : formatOutput(v)
	})
}

function _initEvents(): void {
	_ref_input.addEventListener('input', () => {
		_sg_input.set(_ref_input.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}