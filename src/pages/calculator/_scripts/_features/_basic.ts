import { ObservableStore } from "@/utils/store"
import { $, scrollInputToEnd } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { calculate } from "../_core/_calculator"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { saveStorageItem } from "../_core/_database"
import { DEFAULT_BASIC_INPUT, DEFAULT_BASIC_OUTPUT } from "../_shared/_constant"

export type BasicStoreType = Readonly<{
	input: string
	output: null | number
}>

export const BasicStore = new ObservableStore<BasicStoreType>({
	input: DEFAULT_BASIC_INPUT,
	output: DEFAULT_BASIC_OUTPUT,
})
const _inputRef = $(ElementIds.pgBas_input) as HTMLInputElement
const _outputRef = $(ElementIds.pgBas_output) as HTMLInputElement
let _timeCalculateId: NodeJS.Timeout | number | null = null
let _timeSaveInputId: NodeJS.Timeout | number | null = null

function _calculate(): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		_timeCalculateId = null
		const output = calculate(BasicStore.value.input)
		const parsedOutput = Number.parseFloat(output)
		BasicStore.update(v => ({
			...v,
			output: isNumberDefined(parsedOutput)? parsedOutput : null
		}))
	}, 50)
}

function _subsInputChanges(value: BasicStoreType, old: BasicStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate()
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc:basic/input', input)
	}, 250)
}

function _subsInputView(value: BasicStoreType) {
	const input = value.input
	if (input === _inputRef.value) return

	_inputRef.value = input
	scrollInputToEnd(_inputRef)
}

function _subsOutputView(value: BasicStoreType, old: BasicStoreType) {
	const output = value.output
	if (output === null) return _outputRef.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === old.output
		&& _outputRef.value === formattedOutput
	) return;

	_outputRef.value = formattedOutput
}

function _initSubscriber(): void {
	BasicStore.subscribe(_subsInputChanges)
	BasicStore.subscribe(_subsInputView)
	BasicStore.subscribe(_subsOutputView)
}

export default () => {
	_initSubscriber()
}