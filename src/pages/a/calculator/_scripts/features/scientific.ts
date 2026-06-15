import * as Ids from "../shared/ids.enum.js"
import * as Button from '@/web-components/components/button.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as BrPopover from '@/web-components/components/br-popover.js'
import * as Constant from "../shared/constant.enum.js"
import * as Styles from '../../_styles/styles.enum.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as AnimationEasing from '@/enums/animation-easing.enum.js'
import { $, $$, $$$, scrollInputToEnd } from "../core/dom-utils.js"
import { calculate } from "../core/calculator.js"
import { isNumberDefined } from "@/utils/number"
import { formatOutput } from "../core/string-utils.js"
import { isValidEnumValue } from "@/utils/object"
import { saveStorageItem } from "../core/database.js"
import { signal } from "@/utils/signal.js"
import { ScientificAngleTypes } from "../shared/calculator.js"

export const sg_angle = signal(Constant.DEFAULT_SCIENTIFIC_ANGLE)
export const sg_input = signal(Constant.DEFAULT_SCIENTIFIC_INPUT)
export const sg_output = signal(Constant.DEFAULT_SCIENTIFIC_OUTPUT)

const _ref_theme = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement
const _ref_angle = $(Ids.PageScientificAngle) as HTMLSelectElement
const _ref_input = $(Ids.PageScientificInput) as HTMLInputElement
const _ref_output = $(Ids.PageScientificOutput) as HTMLInputElement

// fn = function
const _ref_fn_btn = $(Ids.PageScientificFunctionButton) as HTMLButtonElement
const _ref_fn_popover = $(Ids.PageScientificFunctionPopover) as BrPopover.BiruPopoverElement
const _ref_fn_invers = $(Ids.PageScientificFunctionInverse) as HTMLInputElement
const _ref_fn_hyper = $(Ids.PageScientificFunctionHyperbolic) as HTMLInputElement
const _refs_fn_trigonometry = $$$<HTMLButtonElement>('.' + Styles.PageScientificFunctionTrigonometry)

let _time_calculate: ReturnType<typeof setTimeout> | undefined

function _calculate(): void {
	clearTimeout(_time_calculate)
	_time_calculate = setTimeout(() => {
		const output = calculate(sg_input())
		const parsedOutput = Number.parseFloat(output)
		sg_output.set(isNumberDefined(parsedOutput)? parsedOutput : null)
	}, 50)
}

function _initSubscriber(): void {
	sg_angle.subscribe((v) => {
		_calculate()
		_ref_angle.value = v
		saveStorageItem('page-scientific-angle', v, 250)
	})

	sg_input.subscribe((v) => {
		_calculate()
		_ref_input.value = v
		scrollInputToEnd(_ref_input)
		saveStorageItem('page-scientific-input', v, 250)
	})

	sg_output.subscribe((v) => {
		_ref_output.value = v === null? '' : formatOutput(v)
	})
}

function _initEvents(): void {
	_ref_angle.addEventListener('change', () => {
		const value = _ref_angle.value as ScientificAngleTypes
		if (!isValidEnumValue(value, ScientificAngleTypes)) {
			return
		}

		sg_angle.set(value)
	})

	_ref_fn_popover.addEventListener(BrPopover.EventTypes.Toggle, () => {
		const isOpen = _ref_fn_popover.biru.isOpen
		const iconRef = _ref_fn_btn.querySelector<BrIcon.BiruIconElement>(`${BrIcon.TAGNAME}:last-child`)
		_ref_fn_btn.setAttribute(
			Button.Attributes.Variant,
			isOpen? Button.Variant.Filled : Button.Variant.Tonal
		)

		iconRef?.style.setProperty('transform', isOpen? 'rotate(180deg)' : null)
		iconRef?.animate({
			transform: [`rotate(${isOpen? 0 : 180}deg)`, `rotate(${isOpen? 180 : 0}deg)`]
		}, {duration: _ref_theme.biru.transitionDuration, easing: AnimationEasing.Spring})
	})

	_ref_fn_popover.addEventListener('change', ev => {
		switch (ev.target) {
		case _ref_fn_invers:
		case _ref_fn_hyper:
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
			for (let i = 0; i < Math.min(trigonometry.length, _refs_fn_trigonometry.length); i++) {
				const ref = _refs_fn_trigonometry[i]
				const char = trigonometry[i]
				if (!ref || !char) {
					continue
				}

				ref.setAttribute('data-char', char + '(')
				ref.textContent = char + '(x)'
			}
		}
	})

	_ref_input.addEventListener('input', () => {
		sg_input.set(_ref_input.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}