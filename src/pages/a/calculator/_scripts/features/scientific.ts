import { ObservableStore } from "@/utils/signal"
import { ScientificAngleType } from "../shared/enums"
import { $, scrollInputToEnd } from "../core/dom-utils"
import { ElementIds } from "../shared/ids"
import { calculate } from "../core/calculator"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../core/string-utils"
import { isValidEnumValue } from "@/utils/object"
import { DEFAULT_SCIENTIFIC_ANGLE, DEFAULT_SCIENTIFIC_INPUT, DEFAULT_SCIENTIFIC_OUTPUT } from "../shared/constant"
import { CButton } from "@/components/Button"
import { AnimationEasing } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { CSSClasses } from "../../_styles/classes"
import { CIcon } from "@/components/Icon"
import { saveStorageItem } from "../core/database"
import { CComboBox } from "@/components/ComboBox"

export type ScientificStoreType = Readonly<{
	input: string
	output: number | null
	angle: ScientificAngleType
}>

export const ScientificStore = new ObservableStore<ScientificStoreType>({
	angle: DEFAULT_SCIENTIFIC_ANGLE,
	input: DEFAULT_SCIENTIFIC_INPUT,
	output: DEFAULT_SCIENTIFIC_OUTPUT,
})
const _ref_angle = $(ElementIds.pgSci_angle) as CComboBox.CElement
const _ref_input = $(ElementIds.pgSci_input) as HTMLInputElement
const _ref_output = $(ElementIds.pgSci_output) as HTMLInputElement

// fn = function
const _ref_fn_Btn = $(ElementIds.pgSci_fnBtn) as CButton.CElement
const _ref_fn_Menu = $(ElementIds.pgSci_fnMenu) as HTMLDivElement
const _ref_fn_invers = $(ElementIds.pgSci_fnInv) as HTMLInputElement
const _ref_fn_hyper = $(ElementIds.pgSci_fnHyper) as HTMLInputElement

let _time_calculate: number | null | NodeJS.Timeout = null
let _time_saveInput: number | null | NodeJS.Timeout = null

function _calculate(): void {
	if (_time_calculate !== null) {
		clearTimeout(_time_calculate)
	}

	_time_calculate = setTimeout(() => {
		_time_calculate = null
		const output = calculate(ScientificStore.value.input)
		const parsedOutput = Number.parseFloat(output)
		ScientificStore.update(v => v.output = isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _subscribeAngleChanges(value: ScientificStoreType, old: ScientificStoreType): void {
	const angle = value.angle
	if (angle === old.angle) return

	_calculate()
	_ref_angle.value = angle
	saveStorageItem('calc:scientific/angle', angle)
}

function _subscribeInputChanges(value: ScientificStoreType, old: ScientificStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate()
	if (_time_saveInput !== null) {
		clearTimeout(_time_saveInput)
	}

	_time_saveInput = setTimeout(() => {
		_time_saveInput = null
		saveStorageItem('calc:scientific/input', input)
	}, 250)
}

function _subscribeInputRefView(value: ScientificStoreType) {
	const input = value.input
	if (input === _ref_input.value) return

	_ref_input.value = input
	scrollInputToEnd(_ref_input)
}

function _subscribeOutputRefView(value: ScientificStoreType, old: ScientificStoreType) {
	const output = value.output
	const oldOutput = old.output
	if (output === null) return _ref_output.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === oldOutput
		&& _ref_output.value === formattedOutput
	) {return}

	_ref_output.value = formattedOutput
}

function _subscribeAngleRefView(value: ScientificStoreType): void {
	const angle = value.angle
	if (angle === _ref_angle.value) return

	_ref_angle.value = angle
}

function _initSubscriber(): void {
	ScientificStore.subscribe(_subscribeAngleChanges)
	ScientificStore.subscribe(_subscribeInputChanges)
	ScientificStore.subscribe(_subscribeInputRefView)
	ScientificStore.subscribe(_subscribeOutputRefView)
	ScientificStore.subscribe(_subscribeAngleRefView)
}

function _initEvents(): void {
	_ref_angle.addEventListener('change', () => {
		const value = _ref_angle.value as ScientificAngleType
		if (!isValidEnumValue(value, ScientificAngleType)) return

		ScientificStore.update(v => v.angle = value)
	})

	_ref_fn_Menu.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_ref_fn_Btn.setAttribute('aria-expanded', String(isOpen))
		CButton.update(_ref_fn_Btn, {
			Button: {variant: isOpen? CButton.Variant.Filled : CButton.Variant.Tonal}
		})

		const iconRef = _ref_fn_Btn.querySelector<HTMLElement>('.' + CIcon.Classes.Icon + ":last-child")
		iconRef?.style.setProperty('transform', isOpen? 'rotate(180deg)' : null)
		if (isAnimationAllowed()) {
			iconRef?.animate({
				transform: [`rotate(${isOpen? 0 : 180}deg)`, `rotate(${isOpen? 180 : 0}deg)`]
			}, {duration: 250, easing: AnimationEasing.Spring})
		}
	})

	_ref_fn_Menu.addEventListener('change', ev => {
		switch (ev.target) {
		case _ref_fn_invers:
		case _ref_fn_hyper:
			const refs = document.querySelectorAll<CButton.CElement>('.' + CSSClasses.bdPageSci_trigonometry)
			const inv = _ref_fn_invers.checked
			const hyp = _ref_fn_hyper.checked
			const trigonometry = [
				(inv? 'a' : '') + 'sin' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cos' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'tan' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'csc' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'sec' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cot' + (hyp? 'h' : '')
			]
			for (let i = 0; i < Math.min(trigonometry.length, refs.length); i++) {
				const ref = refs.item(i)
				const char = trigonometry[i]
				if (!ref || !char) continue

				ref.setAttribute('data-char', char + '(')
				ref.textContent = char + '(x)'
			}
		}
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}