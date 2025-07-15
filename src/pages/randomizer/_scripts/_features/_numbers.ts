import { ObservableStore } from "@/utils/store"
import { NumbersRandomizerType, NumbersRandomizerSort } from "../_shared/_enums"
import { DEFAULT_NUMBERS_COUNT, DEFAULT_NUMBERS_DIGITS, DEFAULT_NUMBERS_MAX, DEFAULT_NUMBERS_MIN, DEFAULT_NUMBERS_OUTPUT, DEFAULT_NUMBERS_PREFIX, DEFAULT_NUMBERS_REPEAT, DEFAULT_NUMBERS_SEPARATOR, DEFAULT_NUMBERS_SORT, DEFAULT_NUMBERS_SUFFIX, DEFAULT_NUMBERS_TYPE } from "../_shared/_constant"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { ComboBoxElement } from "@/native-components/ComboBox"
import { isValidEnumValue } from "@/utils/object"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import { shuffleArray } from "@/utils/array"
import { saveStorageItem } from "../_core/_database"

export type NumbersStoreType = Readonly<{
	min: number
	max: number
	count: number
	sort: NumbersRandomizerSort
	type: NumbersRandomizerType
	minDigits: number
	separator: string
	prefix: string
	suffix: string
	repeat: boolean
	output: string
}>

export const NumbersStore = new ObservableStore<NumbersStoreType>({
	count: DEFAULT_NUMBERS_COUNT,
	max: DEFAULT_NUMBERS_MAX,
	min: DEFAULT_NUMBERS_MIN,
	minDigits: DEFAULT_NUMBERS_DIGITS,
	prefix: DEFAULT_NUMBERS_PREFIX,
	repeat: DEFAULT_NUMBERS_REPEAT,
	separator: DEFAULT_NUMBERS_SEPARATOR,
	sort: DEFAULT_NUMBERS_SORT,
	suffix: DEFAULT_NUMBERS_SUFFIX,
	type: DEFAULT_NUMBERS_TYPE,
	output: DEFAULT_NUMBERS_OUTPUT
})
const _countRef = $(ElementIds.pgNum_count) as HTMLInputElement
const _maxRef = $(ElementIds.pgNum_max) as HTMLInputElement
const _minRef = $(ElementIds.pgNum_min) as HTMLInputElement
const _minDigitsRef = $(ElementIds.pgNum_digits) as HTMLInputElement
const _prefixRef = $(ElementIds.pgNum_prefix) as HTMLInputElement
const _repeatRef = $(ElementIds.pgNum_repeat) as HTMLInputElement
const _separatorRef = $(ElementIds.pgNum_separator) as HTMLInputElement
const _sortRef = $(ElementIds.pgNum_sort) as ComboBoxElement
const _suffixRef = $(ElementIds.pgNum_suffix) as HTMLInputElement
const _typeRef = $(ElementIds.pgNum_type) as ComboBoxElement
const _outputRef = $(ElementIds.pgNum_output) as HTMLOutputElement
let _timeStorageId: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = NumbersStore.value
	const values: number[] = []
	const nonRepeatValues: Set<number> = new Set()
	const min = Math.min(store.min, store.max)
	const max = Math.max(store.min, store.max)
	const range = max - min + 1
	const sort = store.sort
	const count = store.count

	if (store.repeat) {
		while (values.length < count) {
			values.push(min + Math.floor(Math.random() * range))
		}
	}
	else {
		if (count < range) {
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
			for (let i = min; i < max; i++) {
				values.push(i)
			}

			if (sort === NumbersRandomizerSort.none) {
				shuffleArray(values)
			}
		}
	}

	if (sort !== NumbersRandomizerSort.none) {
		values.sort((a, b) => sort == NumbersRandomizerSort.ascending? a - b : b - a)
	}

	NumbersStore.update(v => ({...v,
		output: values.map(v => [
			store.prefix,
			v.toString(store.type as number).padStart(store.minDigits, '0').toUpperCase(),
			store.suffix
		].join('')).join(store.separator)
	}))
}

function _subsStorage(v: NumbersStoreType): void {
	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('numbers:min', v.min)
		saveStorageItem('numbers:max', v.max)
		saveStorageItem('numbers:count', v.count)
		saveStorageItem('numbers:sort', v.sort)
		saveStorageItem('numbers:type', v.type)
		saveStorageItem('numbers:min-digits', v.minDigits)
		saveStorageItem('numbers:separator', v.separator)
		saveStorageItem('numbers:prefix', v.prefix)
		saveStorageItem('numbers:suffix', v.suffix)
		saveStorageItem('numbers:repeat', v.repeat)
		saveStorageItem('numbers:output', v.output)
	})
}

function _subsView(v: NumbersStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	if (!isActive(_countRef)) {
		_countRef.valueAsNumber = v.count
	}

	const max = v.max
	_minRef.max = max.toString()
	if (!isActive(_maxRef)) {
		_maxRef.valueAsNumber = max
	}

	const min = v.min
	_maxRef.min = min.toString()
	if (!isActive(_minRef)) {
		_minRef.valueAsNumber = min
	}

	if (!isActive(_minDigitsRef)) {
		_minDigitsRef.valueAsNumber = v.minDigits
	}

	if (!isActive(_prefixRef)) {
		_prefixRef.value = v.prefix
	}

	if (!isActive(_separatorRef)) {
		_separatorRef.value = v.separator
	}

	if (!isActive(_suffixRef)) {
		_suffixRef.value = v.suffix
	}

	_outputRef.textContent = v.output
	_repeatRef.checked = v.repeat
	_typeRef.value = String(v.type)
	_sortRef.value = v.sort
}

function _initSubscriber(): void {
	NumbersStore.subscribe(_subsStorage)
	NumbersStore.subscribe(_subsView)
}

function _initEvents(): void {
	_countRef.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_countRef.valueAsNumber), 1, Number.MAX_VALUE)
		NumbersStore.update(v => ({ ...v, count: value }))
	})

	_countRef.addEventListener('blur', () => {
		_countRef.valueAsNumber = NumbersStore.value.count
	})

	_maxRef.addEventListener('input', () => {
		const max = Math_clamp(safeNumber(_maxRef.valueAsNumber), NumbersStore.value.min, Number.MAX_VALUE)
		NumbersStore.update(v => ({ ...v, max }))
	})

	_maxRef.addEventListener('blur', () => {
		_maxRef.valueAsNumber = NumbersStore.value.max
	})

	_minRef.addEventListener('input', () => {
		const min = Math_clamp(safeNumber(_minRef.valueAsNumber), 0, NumbersStore.value.max)
		NumbersStore.update(v => ({ ...v, min }))
	})

	_minRef.addEventListener('blur', () => {
		_minRef.valueAsNumber = NumbersStore.value.min
	})

	_minDigitsRef.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_minDigitsRef.valueAsNumber), 0, Number.MAX_VALUE)
		NumbersStore.update(v => ({ ...v, minDigits: value }))
	})

	_minDigitsRef.addEventListener('blur', () => {
		_minDigitsRef.valueAsNumber = NumbersStore.value.minDigits
	})

	_prefixRef.addEventListener('input', () => {
		NumbersStore.update(v => ({ ...v, prefix: _prefixRef.value }))
	})

	_repeatRef.addEventListener('change', () => {
		NumbersStore.update(v => ({ ...v, repeat: _repeatRef.checked }))
	})

	_separatorRef.addEventListener('input', () => {
		NumbersStore.update(v => ({ ...v, separator: _separatorRef.value }))
	})

	_sortRef.addEventListener('change', () => {
		const value = _sortRef.value
		if (!isValidEnumValue(value, NumbersRandomizerSort)) { return }

		NumbersStore.update(v => ({ ...v, sort: value as NumbersRandomizerSort }))
	})

	_suffixRef.addEventListener('input', () => {
		NumbersStore.update(v => ({ ...v, suffix: _suffixRef.value }))
	})

	_typeRef.addEventListener('change', () => {
		const value = Number.parseInt(_typeRef.value)
		if (!isValidEnumValue(value, NumbersRandomizerType)) { return }

		NumbersStore.update(v => ({ ...v, type: value as NumbersRandomizerType }))
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}