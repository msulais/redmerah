import * as RandomizerNumber from '../shared/randomizer-number.js'
import * as AnimationEasing from '@/enums/animation-easing.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import * as Settings from '../core/settings.js'
import { $, $$ } from '../core/dom-utils.js'
import { signal } from '@/utils/signal'
import { delegateEvent } from '@/utils/event-registry.js'
import { isValidEnumValue } from '@/utils/object'
import { Math_clamp } from '@/utils/math'
import { safeNumber } from '@/utils/number'
import { saveStorageItem } from '../core/database.js'
import { shuffleArray } from '@/utils/array.js'

export const sg_count     = signal(Constant.DEFAULT_NUMBER_COUNT)
export const sg_max       = signal(Constant.DEFAULT_NUMBER_MAX)
export const sg_min       = signal(Constant.DEFAULT_NUMBER_MIN)
export const sg_minDigits = signal(Constant.DEFAULT_NUMBER_DIGITS)
export const sg_prefix    = signal(Constant.DEFAULT_NUMBER_PREFIX)
export const sg_repeat    = signal(Constant.DEFAULT_NUMBER_REPEAT)
export const sg_separator = signal(Constant.DEFAULT_NUMBER_SEPARATOR)
export const sg_sort      = signal(Constant.DEFAULT_NUMBER_SORT)
export const sg_suffix    = signal(Constant.DEFAULT_NUMBER_SUFFIX)
export const sg_type      = signal(Constant.DEFAULT_NUMBER_TYPE)
export const sg_output    = signal(Constant.DEFAULT_NUMBER_OUTPUT)
export const sg_isGenerating = signal(false)

const _ref_count        = $(Ids.PageNumberCount) as HTMLInputElement
const _ref_max          = $(Ids.PageNumberMax) as HTMLInputElement
const _ref_min          = $(Ids.PageNumberMin) as HTMLInputElement
const _ref_minDigits    = $(Ids.PageNumberDigits) as HTMLInputElement
const _ref_prefix       = $(Ids.PageNumberPrefix) as HTMLInputElement
const _ref_repeat       = $(Ids.PageNumberRepeat) as HTMLInputElement
const _ref_separator    = $(Ids.PageNumberSeparator) as HTMLInputElement
const _ref_sort         = $(Ids.PageNumberSort) as HTMLSelectElement
const _ref_suffix       = $(Ids.PageNumberSuffix) as HTMLInputElement
const _ref_type         = $(Ids.PageNumberType) as HTMLSelectElement
const _ref_output       = $(Ids.PageNumberOutput) as HTMLTextAreaElement
const _ref_copy         = $(Ids.PageNumberCopy) as HTMLButtonElement
const _ref_generate     = $(Ids.PageNumberGenerate) as HTMLButtonElement
const _ref_generateIcon = $$(BrIcon.TAGNAME, _ref_generate) as BrIcon.BiruIconElement
const _ref_generateText = $$('span', _ref_generate) as HTMLSpanElement
const _ref_theme        = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement

let _time_generate: ReturnType<typeof setInterval> | undefined

function _updateOutput(): void {
	const values: number[] = []
	const min = Math.min(sg_min(), sg_max())
	const max = Math.max(sg_min(), sg_max())
	const range = max - min + 1
	const sort = sg_sort()
	const count = sg_count()

	if (sg_repeat()) {
		for (let i = 0; i < count; i++) {
			values.push(min + Math.floor(Math.random() * range))
		}
	}
	else if (count < range) {
		const nonRepeatValues: Set<number> = new Set()
		const swappedValues = new Map<number, number>()
		for (let i = 0; i < count; i++) {
			const items = range - i
			const randIndex = i + Math.floor(Math.random() * items)
			const valueAtRandomIndex = swappedValues.get(randIndex) ?? (min + randIndex)
			const valueAtBoundary = swappedValues.get(i) ?? (min + i)
			nonRepeatValues.add(valueAtRandomIndex)
			swappedValues.set(randIndex, valueAtBoundary)
		}

		values.push(...nonRepeatValues.values())
	}
	else {
		for (let i = min; i <= max; i++) {
			values.push(i)
		}

		if (sort === RandomizerNumber.SortDirection.None) {
			shuffleArray(values)
		}
	}

	if (sort !== RandomizerNumber.SortDirection.None) {
		values.sort((a, b) => sort == RandomizerNumber.SortDirection.Ascending? a - b : b - a)
	}

	sg_output.set(values.map(v => [
		sg_prefix(),
		v.toString(sg_type() as number).padStart(sg_minDigits(), '0').toUpperCase(),
		sg_suffix()
	].join('')).join(sg_separator()))
}

function _generate(): void {
	_updateOutput()
	const duration = 3000
	const step = Settings.sg_instantResult()? 0 : 250
	let i = 0
	_time_generate = setInterval(() => {
		if (Settings.sg_instantResult() || !sg_isGenerating()) {
			sg_isGenerating.set(false)
			return
		}

		_updateOutput()
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

	sg_count.subscribe(v => {
		if (!_ref_count.matches(':focus')) {
			_ref_count.valueAsNumber = v
		}

		saveStorageItem('page-number-count', v)
	})

	sg_max.subscribe(v => {
		if (!_ref_max.matches(':focus')) {
			_ref_max.valueAsNumber = v
		}

		saveStorageItem('page-number-max', v)
	})

	sg_min.subscribe(v => {
		if (!_ref_min.matches(':focus')) {
			_ref_min.valueAsNumber = v
		}

		saveStorageItem('page-number-min', v)
	})

	sg_minDigits.subscribe(v => {
		if (!_ref_minDigits.matches(':focus')) {
			_ref_minDigits.valueAsNumber = v
		}

		saveStorageItem('page-number-min-digits', v)
	})

	sg_prefix.subscribe(v => {
		if (!_ref_prefix.matches(':focus')) {
			_ref_prefix.value = v
		}

		saveStorageItem('page-number-prefix', v)
	})

	sg_repeat.subscribe(v => {
		_ref_repeat.checked = v
		saveStorageItem('page-number-repeat', v)
	})

	sg_separator.subscribe(v => {
		if (!_ref_separator.matches(':focus')) {
			_ref_separator.value = v
		}

		saveStorageItem('page-number-separator', v)
	})

	sg_sort.subscribe(v => {
		_ref_sort.value = v
		saveStorageItem('page-number-sort', v)
	})

	sg_suffix.subscribe(v => {
		if (!_ref_suffix.matches(':focus')) {
			_ref_suffix.value = v
		}

		saveStorageItem('page-number-suffix', v)
	})

	sg_type.subscribe(v => {
		_ref_type.value = v.toString()
		saveStorageItem('page-number-type', v)
	})

	sg_output.subscribe(v => {
		_ref_output.value = v
		saveStorageItem('page-number-output', v)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_type, 'change', () => {
		const value = Number.parseInt(_ref_type.value) as RandomizerNumber.NumberTypes
		if (!isValidEnumValue(value, RandomizerNumber.NumberTypes)) {
			return
		}

		sg_type.set(value)
	})

	delegateEvent(_ref_copy, 'click', () => {
		navigator.clipboard.writeText(sg_output())
	})

	delegateEvent(_ref_sort, 'change', () => {
		const value = _ref_sort.value as RandomizerNumber.SortDirection
		if (!isValidEnumValue(value, RandomizerNumber.SortDirection)) {
			return
		}

		sg_sort.set(value)
	})

	delegateEvent(_ref_count, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		sg_count.set(value)
	})

	delegateEvent(_ref_count, 'blur', () => {
		_ref_count.valueAsNumber = sg_count()
	})

	delegateEvent(_ref_max, 'input', () => {
		const max = Math_clamp(safeNumber(_ref_max.valueAsNumber), sg_min(), Number.MAX_VALUE)
		sg_max.set(max)
	})

	delegateEvent(_ref_generate, 'click', () => {
		sg_isGenerating.set(v => !v)
	})

	delegateEvent(_ref_max, 'blur', () => {
		_ref_max.valueAsNumber = sg_max()
	})

	delegateEvent(_ref_min, 'input', () => {
		const min = Math_clamp(safeNumber(_ref_min.valueAsNumber), 0, sg_max())
		sg_min.set(min)
	})

	delegateEvent(_ref_minDigits, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_minDigits.valueAsNumber), 0, Number.MAX_VALUE)
		sg_minDigits.set(value)
	})

	delegateEvent(_ref_min, 'blur', () => _ref_min.valueAsNumber = sg_min())
	delegateEvent(_ref_minDigits, 'blur', () => _ref_minDigits.valueAsNumber = sg_minDigits())
	delegateEvent(_ref_prefix, 'input', () => sg_prefix.set(_ref_prefix.value))
	delegateEvent(_ref_repeat, 'change', () => sg_repeat.set(_ref_repeat.checked))
	delegateEvent(_ref_separator, 'input', () => sg_separator.set(_ref_separator.value))
	delegateEvent(_ref_suffix, 'input', () => sg_suffix.set(_ref_suffix.value))
}

export default () => {
	_initSubscriber()
	_initEvents()
}