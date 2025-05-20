import { ObservableStore } from "@/utils/store"
import { $, scrollInputToEnd } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { calculate } from "../_core/_calculator"
import { numberIsDefined } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { saveStorageItem } from "../_core/_database"

export type BasicStoreType = Readonly<{
	input    : string
	output   : null | number
}>

export const BasicStore = new ObservableStore<BasicStoreType>({
	input: '',
	output: null,
})
const _inputRef = $(ElementIds.bodyBasicInput) as HTMLInputElement
const _outputRef = $(ElementIds.bodyBasicOutput) as HTMLInputElement
let _timeCalculateId: null | number | NodeJS.Timeout = null
let _timeSaveInputId: null | number | NodeJS.Timeout = null

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
			output: numberIsDefined(parsedOutput)? parsedOutput : null
		}))
	}, 50)
}

function _subscribeInputChanges(value: BasicStoreType, old: BasicStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate()
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc/basic/input', input)
	}, 250)
}

function _subscribeInputRefView(value: BasicStoreType) {
	const input = value.input
	if (input === _inputRef.value) return

	_inputRef.value = input
	scrollInputToEnd(_inputRef)
}

function _subscribeOutputRefView(value: BasicStoreType, old: BasicStoreType) {
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
	BasicStore.subscribe(_subscribeInputChanges)
	BasicStore.subscribe(_subscribeInputRefView)
	BasicStore.subscribe(_subscribeOutputRefView)
}

export default () => {
	_initSubscriber()
}