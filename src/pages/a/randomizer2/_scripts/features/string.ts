import * as Constant from '../shared/constant.enum.js'
import * as AnimationEasing  from '@/enums/animation-easing.enum.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import * as Settings from '../core/settings.js'
import { signal } from '@/utils/signal'
import { $, $$ } from '../core/dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { Math_clamp } from '@/utils/math'
import { safeNumber } from '@/utils/number'
import { saveStorageItem } from '../core/database.js'

export const sg_length       = signal(Constant.DEFAULT_STRING_LENGTH)
export const sg_output       = signal(Constant.DEFAULT_STRING_OUTPUT)
export const sg_custom       = signal(Constant.DEFAULT_STRING_CUSTOM)
export const sg_uppercase    = signal(Constant.DEFAULT_STRING_UPPERCASE)
export const sg_lowercase    = signal(Constant.DEFAULT_STRING_LOWERCASE)
export const sg_numbers      = signal(Constant.DEFAULT_STRING_NUMBERS)
export const sg_symbols      = signal(Constant.DEFAULT_STRING_SYMBOLS)
export const sg_isGenerating = signal(false)

const _ref_length       = $(Ids.PageStringLength) as HTMLInputElement
const _ref_custom       = $(Ids.PageStringCustom) as HTMLInputElement
const _ref_upper        = $(Ids.PageStringUpper) as HTMLInputElement
const _ref_lower        = $(Ids.PageStringLower) as HTMLInputElement
const _ref_numbers      = $(Ids.PageStringNumber) as HTMLInputElement
const _ref_symbols      = $(Ids.PageStringSymbol) as HTMLInputElement
const _ref_output       = $(Ids.PageStringOutput) as HTMLTextAreaElement
const _ref_copy         = $(Ids.PageStringCopy) as HTMLButtonElement
const _ref_generate     = $(Ids.PageStringGenerate) as HTMLButtonElement
const _ref_generateIcon = $$(BrIcon.TAGNAME, _ref_generate) as BrIcon.BiruIconElement
const _ref_generateText = $$('span', _ref_generate) as HTMLSpanElement
const _ref_theme        = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement

let _time_generate: ReturnType<typeof setInterval> | undefined

function _updateOutput(chars: string[]): void {
	const charLen = chars.length
	let output = ''
	if (charLen > 0) {
		const targetLen = sg_length()
		for (let i = 0; i < targetLen; i++) {
			output += chars[Math.floor(Math.random() * charLen)]
		}
	}

	sg_output.set(output)
}

function _generate(): void {
	let poolStr = sg_custom()
	if (sg_uppercase()) {
		poolStr += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	}

	if (sg_lowercase()) {
		poolStr += 'abcdefghijklmnopqrstuvwxyz'
	}

	if (sg_numbers()) {
		poolStr += '0123456789'
	}

	if (sg_symbols()) {
		poolStr += "<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"
	}

	const chars = Array.from(new Set(poolStr))

	_updateOutput(chars)
	const duration = 3000
	const step = Settings.sg_instantResult()? 0 : 250
	let i = 0
	_time_generate = setInterval(() => {
		if (Settings.sg_instantResult() || !sg_isGenerating()) {
			sg_isGenerating.set(false)
			return
		}

		_updateOutput(chars)
		if (i >= duration / step) {
			sg_isGenerating.set(false)
			return
		}

		++i
	}, step)
}

function _initSubscriber(): void {
	sg_isGenerating.subscribe(v => {
		const fn_isAnimationAllowed = () => _ref_theme.biru.transitionDuration > 0
		const width = _ref_generate.getBoundingClientRect().width

		clearInterval(_time_generate)
		_ref_generateIcon.getAnimations().forEach(v => v.cancel())
		_ref_generateText.textContent = v? 'Generating' : 'Generate'

		// animation for button, icon, and text
		if (fn_isAnimationAllowed()) {
			const opt = {duration: 250, easing: AnimationEasing.Spring}
			_ref_generateText.animate({
				opacity: [0, 1],
				scale: [0, 1],
			}, opt)
			_ref_generateIcon.animate({
				opacity: [0, 1],
				scale: [0, 1],
			}, opt)
			_ref_generate.animate({
				width: [width + 'px', _ref_generate.getBoundingClientRect().width + 'px']
			}, opt)
		}

		// !!important!! to avoid recursion
		if (!v) {
			return
		}

		// animation for icon rotation
		if (fn_isAnimationAllowed()) {
			_ref_generateIcon.animate({
				rotate: '180deg'
			}, {
				duration: 500,
				iterations: Infinity,
				easing: AnimationEasing.Spring
			})
		}

		_generate()
	})

	sg_length.subscribe(v => {
		if (!_ref_length.matches(":focus")) {
			_ref_length.valueAsNumber = v
		}

		saveStorageItem('page-string-length', v)
	})

	sg_output.subscribe(v => {
		_ref_output.value = v
		saveStorageItem("page-string-output", v)
	})

	sg_custom.subscribe(v => {
		if (!_ref_custom.matches(":focus")) {
			_ref_custom.value = v
		}

		saveStorageItem('page-string-custom', v)
	})

	sg_uppercase.subscribe(v => {
		_ref_upper.checked = v
		saveStorageItem("page-string-uppercase", v)
	})

	sg_lowercase.subscribe(v => {
		_ref_lower.checked = v
		saveStorageItem("page-string-lowercase", v)
	})

	sg_numbers.subscribe(v => {
		_ref_numbers.checked = v
		saveStorageItem("page-string-numbers", v)
	})

	sg_symbols.subscribe(v => {
		_ref_symbols.checked = v
		saveStorageItem("page-string-symbols", v)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_length, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_length.valueAsNumber), 1, Number.MAX_VALUE)
		sg_length.set(value)
	})

	delegateEvent(_ref_length, 'blur', () => {
		_ref_length.valueAsNumber = sg_length()
	})

	delegateEvent(_ref_copy, 'click', () => {
		navigator.clipboard.writeText(sg_output())
	})

	delegateEvent(_ref_generate, 'click', () => {
		sg_isGenerating.set(v => !v)
	})

	delegateEvent(_ref_custom , 'input' , () => sg_custom.set(_ref_custom.value))
	delegateEvent(_ref_upper  , 'change', () => sg_uppercase.set(_ref_upper.checked))
	delegateEvent(_ref_lower  , 'change', () => sg_lowercase.set(_ref_lower.checked))
	delegateEvent(_ref_numbers, 'change', () => sg_numbers.set(_ref_numbers.checked))
	delegateEvent(_ref_symbols, 'change', () => sg_symbols.set(_ref_symbols.checked))
}

export default () => {
	_initEvents()
	_initSubscriber()
}