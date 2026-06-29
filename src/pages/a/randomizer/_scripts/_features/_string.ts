import { ObservableStore } from "@/utils/signal"
import { DEFAULT_STRING_CUSTOM, DEFAULT_STRING_LENGTH, DEFAULT_STRING_LOWERCASE, DEFAULT_STRING_NUMBERS, DEFAULT_STRING_OUTPUT, DEFAULT_STRING_SYMBOLS, DEFAULT_STRING_UPPERCASE } from "../_shared/_constant"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "../_core/_database"

export type StringStoreType = Readonly<{
	length: number
	output: string
	custom: string
	uppercase: boolean
	lowercase: boolean
	numbers: boolean
	symbols: boolean
}>

export const StringStore = new ObservableStore<StringStoreType>({
	custom: DEFAULT_STRING_CUSTOM,
	length: DEFAULT_STRING_LENGTH,
	lowercase: DEFAULT_STRING_LOWERCASE,
	numbers: DEFAULT_STRING_NUMBERS,
	output: DEFAULT_STRING_OUTPUT,
	symbols: DEFAULT_STRING_SYMBOLS,
	uppercase: DEFAULT_STRING_UPPERCASE
})
const _ref_length = $(ElementIds.pgStr_length) as HTMLInputElement
const _ref_custom = $(ElementIds.pgStr_custom) as HTMLInputElement
const _ref_upper = $(ElementIds.pgStr_upper) as HTMLInputElement
const _ref_lower = $(ElementIds.pgStr_lower) as HTMLInputElement
const _ref_numbers = $(ElementIds.pgStr_number) as HTMLInputElement
const _ref_symbols = $(ElementIds.pgStr_symbol) as HTMLInputElement
const _ref_output = $(ElementIds.pgStr_output) as HTMLOutputElement
let _time_storage: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = StringStore.value
	let chars: string[] = [store.custom]
	if (store.uppercase) {
		chars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
	}
	if (store.lowercase) {
		chars.push('abcdefghijklmnopqrstuvwxyz')
	}
	if (store.numbers) {
		chars.push('0123456789')
	}
	if (store.symbols) {
		chars.push("<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>")
	}
	chars = new Set(chars.join('')).values().toArray()

	let output: string[] = []
	if (chars.length > 0){
		for (let i = 0; i < store.length; i++) {
			const char = chars[Math.round(Math.random() * (chars.length - 1))]!
			output.push(char)
		}
	}

	StringStore.update(v => v.output = output.join(''))
}

function _subsStorage(v: StringStoreType): void {
	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('string:length', v.length)
		saveStorageItem('string:output', v.output)
		saveStorageItem('string:custom', v.custom)
		saveStorageItem('string:uppercase', v.uppercase)
		saveStorageItem('string:lowercase', v.lowercase)
		saveStorageItem('string:numbers', v.numbers)
		saveStorageItem('string:symbols', v.symbols)
	}, 500)
}

function _subsView(v: StringStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	if (!isActive(_ref_custom)) {
		_ref_custom.value = v.custom
	}

	if (!isActive(_ref_length)) {
		_ref_length.valueAsNumber = v.length
	}

	_ref_numbers.checked = v.numbers
	_ref_upper.checked = v.uppercase
	_ref_lower.checked = v.lowercase
	_ref_symbols.checked = v.symbols
	_ref_output.textContent = v.output
}

function _initSubscriber(): void {
	StringStore.subscribe(_subsStorage)
	StringStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_length.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_length.valueAsNumber), 1, Number.MAX_VALUE)
		StringStore.update(v => v.length = value)
	})

	_ref_length.addEventListener('blur', () => {
		_ref_length.valueAsNumber = Math_clamp(safeNumber(_ref_length.valueAsNumber), 1, Number.MAX_VALUE)
	})

	_ref_custom.addEventListener('input', () => {
		StringStore.update(v => v.custom = _ref_custom.value)
	})

	_ref_upper.addEventListener('change', () => {
		StringStore.update(v => v.uppercase = _ref_upper.checked)
	})

	_ref_lower.addEventListener('change', () => {
		StringStore.update(v => v.lowercase = _ref_lower.checked)
	})

	_ref_numbers.addEventListener('change', () => {
		StringStore.update(v => v.numbers = _ref_numbers.checked)
	})

	_ref_symbols.addEventListener('change', () => {
		StringStore.update(v => v.symbols = _ref_symbols.checked)
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
}