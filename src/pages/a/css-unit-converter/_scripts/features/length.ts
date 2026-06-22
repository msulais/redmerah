import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as Settings from '../core/settings.js'
import { $ } from '../core/dom-utils.js'
import { safeNumber } from '@/utils/number'
import { LengthUnits } from '../shared/units.js'
import { signal } from "@/utils/signal"
import { saveStorageItem } from '../core/database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_input      = signal(Constant.DEFAULT_LENGTH_INPUT)
export const sg_output     = signal(Constant.DEFAULT_LENGTH_OUTPUT)
export const sg_inputUnit  = signal(Constant.DEFAULT_LENGTH_INPUT_UNIT)
export const sg_outputUnit = signal(Constant.DEFAULT_LENGTH_OUTPUT_UNIT)

const _memo_inputNum = () => safeNumber(Number.parseFloat(sg_input()))

const _ref_input      = $(Ids.PageLengthInput     ) as HTMLInputElement
const _ref_output     = $(Ids.PageLengthOutput    ) as HTMLInputElement
const _ref_inputUnit  = $(Ids.PageLengthInputUnit ) as HTMLSelectElement
const _ref_outputUnit = $(Ids.PageLengthOutputUnit) as HTMLSelectElement
let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		const relativeUnitIds = LengthUnits.relativeUnitIds
		let inputUnitValue = sg_inputUnit().value
		let outputUnitValue = sg_outputUnit().value
		if (relativeUnitIds.has(sg_inputUnit().id)) {
			switch (sg_inputUnit().id) {
			case LengthUnits.rem.id:
				inputUnitValue = 1 / Settings.sg_pxPerRem()
				break
			case LengthUnits.percentage.id:
				inputUnitValue = 100 / Settings.sg_pxPer100Percent()
				break
			case LengthUnits.vh.id:
				inputUnitValue = 100 / Settings.sg_pxPer100VH()
				break
			case LengthUnits.vw.id:
				inputUnitValue = 100 / Settings.sg_pxPer100VW()
				break
			}
		}

		if (relativeUnitIds.has(sg_outputUnit().id)) {
			switch (sg_outputUnit().id) {
			case LengthUnits.rem.id:
				outputUnitValue = 1 / Settings.sg_pxPerRem()
				break
			case LengthUnits.percentage.id:
				outputUnitValue = 100 / Settings.sg_pxPer100Percent()
				break
			case LengthUnits.vh.id:
				outputUnitValue = 100 / Settings.sg_pxPer100VH()
				break
			case LengthUnits.vw.id:
				outputUnitValue = 100 / Settings.sg_pxPer100VW()
				break
			}
		}
		sg_output.set(_memo_inputNum() * outputUnitValue / inputUnitValue)
	}, 50)
}

function _initSubscriber(): void {
	sg_input.subscribe(v => {
		if (!_ref_input.matches(':focus')) {
			_ref_input.value = v
		}

		_calculate()
		saveStorageItem('page-length-input', _memo_inputNum(), 250)
	})

	sg_output.subscribe(v => {
		_ref_output.value = v + ''
	})

	sg_outputUnit.subscribe(v => {
		_calculate()
		saveStorageItem('page-length-output-unit-id', v.id, 250)
		_ref_outputUnit.value = v.id
	})

	sg_inputUnit.subscribe(v => {
		_calculate()
		saveStorageItem('page-length-input-unit-id', v.id, 250)
		_ref_inputUnit.value = v.id
	})
}

function _initEvents(): void {
	delegateEvent(_ref_input, 'input', () => {
		sg_input.set(_ref_input.value)
	})

	delegateEvent(_ref_inputUnit, 'change', () => {
		const id = _ref_inputUnit.value
		if (!LengthUnits.all.has(id)) {
			_ref_inputUnit.value = sg_inputUnit().id
			return
		}

		sg_inputUnit.set(LengthUnits.all.get(id)!)
	})

	delegateEvent(_ref_outputUnit, 'change', () => {
		const id = _ref_outputUnit.value
		if (!LengthUnits.all.has(id)) {
			_ref_outputUnit.value = sg_outputUnit().id
			return
		}

		sg_outputUnit.set(LengthUnits.all.get(id)!)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}