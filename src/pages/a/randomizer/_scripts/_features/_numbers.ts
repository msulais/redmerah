import { ObservableStore } from "@/utils/store"
import { NumbersRandomizerType, NumbersRandomizerSort } from "../_shared/_enums"
import { DEFAULT_NUMBERS_COUNT, DEFAULT_NUMBERS_DIGITS, DEFAULT_NUMBERS_MAX, DEFAULT_NUMBERS_MIN, DEFAULT_NUMBERS_OUTPUT, DEFAULT_NUMBERS_PREFIX, DEFAULT_NUMBERS_REPEAT, DEFAULT_NUMBERS_SEPARATOR, DEFAULT_NUMBERS_SORT, DEFAULT_NUMBERS_SUFFIX, DEFAULT_NUMBERS_TYPE } from "../_shared/_constant"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { CComboBox } from "@/components/ComboBox"
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
const _ref_count = $(ElementIds.pgNum_count) as HTMLInputElement
const _ref_max = $(ElementIds.pgNum_max) as HTMLInputElement
const _ref_min = $(ElementIds.pgNum_min) as HTMLInputElement
const _ref_minDigits = $(ElementIds.pgNum_digits) as HTMLInputElement
const _ref_prefix = $(ElementIds.pgNum_prefix) as HTMLInputElement
const _ref_repeat = $(ElementIds.pgNum_repeat) as HTMLInputElement
const _ref_separator = $(ElementIds.pgNum_separator) as HTMLInputElement
const _ref_sort = $(ElementIds.pgNum_sort) as CComboBox.CElement
const _ref_suffix = $(ElementIds.pgNum_suffix) as HTMLInputElement
const _ref_type = $(ElementIds.pgNum_type) as CComboBox.CElement
const _ref_output = $(ElementIds.pgNum_output) as HTMLOutputElement
let _time_storage: NodeJS.Timeout | number | undefined

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

	NumbersStore.update(v => v.output = values.map(v => [
		store.prefix,
		v.toString(store.type as number).padStart(store.minDigits, '0').toUpperCase(),
		store.suffix
	].join('')).join(store.separator))
}

function _subsStorage(v: NumbersStoreType): void {
	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
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
	if (!isActive(_ref_count)) {
		_ref_count.valueAsNumber = v.count
	}

	const max = v.max
	_ref_min.max = max.toString()
	if (!isActive(_ref_max)) {
		_ref_max.valueAsNumber = max
	}

	const min = v.min
	_ref_max.min = min.toString()
	if (!isActive(_ref_min)) {
		_ref_min.valueAsNumber = min
	}

	if (!isActive(_ref_minDigits)) {
		_ref_minDigits.valueAsNumber = v.minDigits
	}

	if (!isActive(_ref_prefix)) {
		_ref_prefix.value = v.prefix
	}

	if (!isActive(_ref_separator)) {
		_ref_separator.value = v.separator
	}

	if (!isActive(_ref_suffix)) {
		_ref_suffix.value = v.suffix
	}

	_ref_output.textContent = v.output
	_ref_repeat.checked = v.repeat
	_ref_type.value = String(v.type)
	_ref_sort.value = v.sort
}

function _initSubscriber(): void {
	NumbersStore.subscribe(_subsStorage)
	NumbersStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_count.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		NumbersStore.update(v => v.count = value)
	})

	_ref_count.addEventListener('blur', () => {
		_ref_count.valueAsNumber = NumbersStore.value.count
	})

	_ref_max.addEventListener('input', () => {
		const max = Math_clamp(safeNumber(_ref_max.valueAsNumber), NumbersStore.value.min, Number.MAX_VALUE)
		NumbersStore.update(v => v.max = max)
	})

	_ref_max.addEventListener('blur', () => {
		_ref_max.valueAsNumber = NumbersStore.value.max
	})

	_ref_min.addEventListener('input', () => {
		const min = Math_clamp(safeNumber(_ref_min.valueAsNumber), 0, NumbersStore.value.max)
		NumbersStore.update(v => v.min = min)
	})

	_ref_min.addEventListener('blur', () => {
		_ref_min.valueAsNumber = NumbersStore.value.min
	})

	_ref_minDigits.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_minDigits.valueAsNumber), 0, Number.MAX_VALUE)
		NumbersStore.update(v => v.minDigits = value)
	})

	_ref_minDigits.addEventListener('blur', () => {
		_ref_minDigits.valueAsNumber = NumbersStore.value.minDigits
	})

	_ref_prefix.addEventListener('input', () => {
		NumbersStore.update(v => v.prefix = _ref_prefix.value)
	})

	_ref_repeat.addEventListener('change', () => {
		NumbersStore.update(v => v.repeat = _ref_repeat.checked)
	})

	_ref_separator.addEventListener('input', () => {
		NumbersStore.update(v => v.separator = _ref_separator.value)
	})

	_ref_sort.addEventListener('change', () => {
		const value = _ref_sort.value as NumbersRandomizerSort
		if (!isValidEnumValue(value, NumbersRandomizerSort)) { return }

		NumbersStore.update(v => v.sort = value)
	})

	_ref_suffix.addEventListener('input', () => {
		NumbersStore.update(v => v.suffix = _ref_suffix.value)
	})

	_ref_type.addEventListener('change', () => {
		const value = Number.parseInt(_ref_type.value) as NumbersRandomizerType
		if (!isValidEnumValue(value, NumbersRandomizerType)) { return }

		NumbersStore.update(v => v.type = value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}