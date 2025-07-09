import { ObservableStore } from "@/utils/store"
import { ScientificAngleType } from "../_shared/_enums"
import { $, scrollInputToEnd } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { calculate } from "../_core/_calculator"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../_core/_string-utils"
import { isValidEnumValue } from "@/utils/object"
import { DEFAULT_SCIENTIFIC_ANGLE, DEFAULT_SCIENTIFIC_INPUT, DEFAULT_SCIENTIFIC_OUTPUT } from "../_shared/_constant"
import { ButtonVariant, updateButtonRef } from "@/native-components/Button"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { CSSClasses } from "../../_styles/_css"
import { animateUpdateTextElement } from "@/utils/element"
import { IconClasses } from "@/native-components/Icon"
import { saveStorageItem } from "../_core/_database"
import type { ComboBoxElement } from "@/native-components/ComboBox"

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
const _angleRef = $(ElementIds.bdSci_angle) as ComboBoxElement
const _inputRef = $(ElementIds.bdSci_input) as HTMLInputElement
const _outputRef = $(ElementIds.bdSci_output) as HTMLInputElement

// fn = function
const _fn_BtnRef = $(ElementIds.bdSciFn_btn) as HTMLButtonElement
const _fn_MenuRef = $(ElementIds.bdSciFn_menu) as HTMLDivElement
const _fn_inversRef = $(ElementIds.bdSciFn_inv) as HTMLInputElement
const _fn_hyperRef = $(ElementIds.bdSciFn_hyper) as HTMLInputElement

let _timeCalculateId: number | null | NodeJS.Timeout = null
let _timeSaveInputId: number | null | NodeJS.Timeout = null

function _calculate(): void {
	if (_timeCalculateId !== null) {
		clearTimeout(_timeCalculateId)
	}

	_timeCalculateId = setTimeout(() => {
		_timeCalculateId = null
		const output = calculate(ScientificStore.value.input)
		const parsedOutput = Number.parseFloat(output)
		ScientificStore.update(v => ({
			...v,
			output: isNumberDefined(parsedOutput)? parsedOutput : null
		}))
	}, 50)
}

function _subscribeAngleChanges(value: ScientificStoreType, old: ScientificStoreType): void {
	const angle = value.angle
	if (angle === old.angle) return

	_calculate()
	_angleRef.value = angle
	saveStorageItem('calc:scientific/angle', angle)
}

function _subscribeInputChanges(value: ScientificStoreType, old: ScientificStoreType) {
	const input = value.input
	if (input === old.input) return

	_calculate()
	if (_timeSaveInputId !== null) {
		clearTimeout(_timeSaveInputId)
	}

	_timeSaveInputId = setTimeout(() => {
		_timeSaveInputId = null
		saveStorageItem('calc:scientific/input', input)
	}, 250)
}

function _subscribeInputRefView(value: ScientificStoreType) {
	const input = value.input
	if (input === _inputRef.value) return

	_inputRef.value = input
	scrollInputToEnd(_inputRef)
}

function _subscribeOutputRefView(value: ScientificStoreType, old: ScientificStoreType) {
	const output = value.output
	const oldOutput = old.output
	if (output === null) return _outputRef.value = ''

	const formattedOutput = formatOutput(output)
	if (
		output === oldOutput
		&& _outputRef.value === formattedOutput
	) {return}

	_outputRef.value = formattedOutput
}

function _subscribeAngleRefView(value: ScientificStoreType): void {
	const angle = value.angle
	if (angle === _angleRef.value) return

	_angleRef.value = angle
}

function _initSubscriber(): void {
	ScientificStore.subscribe(_subscribeAngleChanges)
	ScientificStore.subscribe(_subscribeInputChanges)
	ScientificStore.subscribe(_subscribeInputRefView)
	ScientificStore.subscribe(_subscribeOutputRefView)
	ScientificStore.subscribe(_subscribeAngleRefView)
}

function _initEvents(): void {
	_angleRef.addEventListener('change', () => {
		const value = _angleRef.value as ScientificAngleType
		if (!isValidEnumValue(value, ScientificAngleType)) return

		ScientificStore.update(v => ({
			...v,
			angle: value
		}))
	})

	_fn_MenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_fn_BtnRef.setAttribute('aria-expanded', String(isOpen))
		updateButtonRef(_fn_BtnRef, {
			ButtonVariant: isOpen? ButtonVariant.filled : ButtonVariant.tonal
		})

		const iconRef = _fn_BtnRef.querySelector<HTMLElement>('.' + IconClasses.icon + ":last-child")
		iconRef?.style.setProperty('transform', isOpen? 'rotate(180deg)' : null)
		if (isAnimationAllowed()) {
			iconRef?.animate({
				transform: [`rotate(${isOpen? 0 : 180}deg)`, `rotate(${isOpen? 180 : 0}deg)`]
			}, {duration: 250, easing: AnimationEffectTiming.spring})
		}
	})

	_fn_MenuRef.addEventListener('change', ev => {
		switch (ev.target) {
		case _fn_inversRef:
		case _fn_hyperRef:
			const refs = document.querySelectorAll<HTMLButtonElement>('.' + CSSClasses.bdPageSci_trigonometry)
			const inv = _fn_inversRef.checked
			const hyp = _fn_hyperRef.checked
			const trigonometry = [
				(inv? 'a' : '') + 'sin' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cos' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'tan' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'csc' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'sec' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cot' + (hyp? 'h' : '')
			]
			const animation = isAnimationAllowed()
			for (let i = 0; i < Math.min(trigonometry.length, refs.length); i++) {
				const ref = refs.item(i)
				const char = trigonometry[i]
				if (!ref || !char) continue

				ref.setAttribute('data-char', char + '(')
				if (animation) {
					animateUpdateTextElement(ref, char + '(x)')
				} else {
					ref.textContent = char + '(x)'
				}
			}
		}
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}