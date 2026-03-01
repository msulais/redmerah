import { ObservableStore } from "@/utils/store"
import { $, scrollInputToEnd } from "../core/dom-utils"
import { ElementIds } from "../shared/ids"
import { calculate } from "../core/calculator"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../core/string-utils"
import { saveStorageItem } from "../core/database"
import { DEFAULT_BASIC_INPUT, DEFAULT_BASIC_OUTPUT } from "../shared/constant"

export type BasicStoreType = Readonly<{
	input: string
	output: null | number
}>

export const BasicStore = new ObservableStore<BasicStoreType>({
	input: DEFAULT_BASIC_INPUT,
	output: DEFAULT_BASIC_OUTPUT,
})
const _ref_input = $(ElementIds.pgBas_input) as HTMLInputElement
const _ref_output = $(ElementIds.pgBas_output) as HTMLInputElement
let _time_calculate: NodeJS.Timeout | number | null = null
let _time_saveInput: NodeJS.Timeout | number | null = null

function _calculate(): void {
	if (_time_calculate !== null) {
		clearTimeout(_time_calculate)
	}

	_time_calculate = setTimeout(() => {
		_time_calculate = null
		const output = calculate(BasicStore.value.input)
		const parsedOutput = Number.parseFloat(output)
		BasicStore.update(v => v.output = isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _subsInputChanges(value: BasicStoreType, old: BasicStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate()
	if (_time_saveInput !== null) {
		clearTimeout(_time_saveInput)
	}

	_time_saveInput = setTimeout(() => {
		_time_saveInput = null
		saveStorageItem('calc:basic/input', input)
	}, 250)
}

function _subsInputView(value: BasicStoreType) {
	const input = value.input
	if (input === _ref_input.value) return

	_ref_input.value = input
	scrollInputToEnd(_ref_input)
}

function _subsOutputView(value: BasicStoreType, old: BasicStoreType) {
	const output = value.output
	if (output === null) return _ref_output.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === old.output
		&& _ref_output.value === formattedOutput
	) return;

	_ref_output.value = formattedOutput
}

function _initSubscriber(): void {
	BasicStore.subscribe(_subsInputChanges)
	BasicStore.subscribe(_subsInputView)
	BasicStore.subscribe(_subsOutputView)
}

export default () => {
	_initSubscriber()
}