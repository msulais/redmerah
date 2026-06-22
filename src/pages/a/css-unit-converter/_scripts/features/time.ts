import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { $ } from '../core/dom-utils.js'
import { safeNumber } from '@/utils/number'
import { TimeUnits } from '../shared/units.js'
import { signal } from "@/utils/signal"
import { saveStorageItem } from '../core/database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_input      = signal(Constant.DEFAULT_TIME_INPUT)
export const sg_output     = signal(Constant.DEFAULT_TIME_OUTPUT)
export const sg_inputUnit  = signal(Constant.DEFAULT_TIME_INPUT_UNIT)
export const sg_outputUnit = signal(Constant.DEFAULT_TIME_OUTPUT_UNIT)

const _memo_inputNum = () => safeNumber(Number.parseFloat(sg_input()))

const _ref_input      = $(Ids.PageTimeInput     ) as HTMLInputElement
const _ref_output     = $(Ids.PageTimeOutput    ) as HTMLInputElement
const _ref_inputUnit  = $(Ids.PageTimeInputUnit ) as HTMLSelectElement
const _ref_outputUnit = $(Ids.PageTimeOutputUnit) as HTMLSelectElement
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		sg_output.set(_memo_inputNum() * sg_outputUnit().value / sg_inputUnit().value)
	}, 50)
}

function _initSubscriber(): void {
	sg_input.subscribe(v => {
		if (!_ref_input.matches(':focus')) {
			_ref_input.value = v
		}

		_calculate()
		saveStorageItem('page-time-input', _memo_inputNum(), 250)
	})

	sg_output.subscribe(v => {
		_ref_output.value = v + ''
	})

	sg_outputUnit.subscribe(v => {
		_calculate()
		saveStorageItem('page-time-output-unit-id', v.id, 250)
		_ref_outputUnit.value = v.id
	})

	sg_inputUnit.subscribe(v => {
		_calculate()
		saveStorageItem('page-time-input-unit-id', v.id, 250)
		_ref_inputUnit.value = v.id
	})
}

function _initEvents(): void {
	delegateEvent(_ref_input, 'input', () => {
		sg_input.set(_ref_input.value)
	})

	delegateEvent(_ref_inputUnit, 'change', () => {
		const id = _ref_inputUnit.value
		if (!TimeUnits.all.has(id)) {
			_ref_inputUnit.value = sg_inputUnit().id
			return
		}

		sg_inputUnit.set(TimeUnits.all.get(id)!)
	})

	delegateEvent(_ref_outputUnit, 'change', () => {
		const id = _ref_outputUnit.value
		if (!TimeUnits.all.has(id)) {
			_ref_outputUnit.value = sg_outputUnit().id
			return
		}

		sg_outputUnit.set(TimeUnits.all.get(id)!)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}