import { ObservableStore } from "@/utils/store"
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
const _lengthRef = $(ElementIds.pgStr_length) as HTMLInputElement
const _customRef = $(ElementIds.pgStr_custom) as HTMLInputElement
const _upperRef = $(ElementIds.pgStr_upper) as HTMLInputElement
const _lowerRef = $(ElementIds.pgStr_lower) as HTMLInputElement
const _numbersRef = $(ElementIds.pgStr_number) as HTMLInputElement
const _symbolsRef = $(ElementIds.pgStr_symbol) as HTMLInputElement
const _outputRef = $(ElementIds.pgStr_output) as HTMLOutputElement
let _timeStorageId: NodeJS.Timeout | number | undefined

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
			const char = chars[Math.round(Math.random() * (chars.length - 1))]
			output.push(char)
		}
	}

	StringStore.update(v => ({...v, output: output.join('')}))
}

function _subsStorage(v: StringStoreType): void {
	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
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
	if (!isActive(_customRef)) {
		_customRef.value = v.custom
	}

	if (!isActive(_lengthRef)) {
		_lengthRef.valueAsNumber = v.length
	}

	_numbersRef.checked = v.numbers
	_upperRef.checked = v.uppercase
	_lowerRef.checked = v.lowercase
	_symbolsRef.checked = v.symbols
	_outputRef.textContent = v.output
}

function _initSubscriber(): void {
	StringStore.subscribe(_subsStorage)
	StringStore.subscribe(_subsView)
}

function _initEvents(): void {
	_lengthRef.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_lengthRef.valueAsNumber), 1, Number.MAX_VALUE)
		StringStore.update(v => ({...v, length: value}))
	})

	_lengthRef.addEventListener('blur', () => {
		_lengthRef.valueAsNumber = Math_clamp(safeNumber(_lengthRef.valueAsNumber), 1, Number.MAX_VALUE)
	})

	_customRef.addEventListener('input', () => {
		StringStore.update(v => ({...v, custom: _customRef.value}))
	})

	_upperRef.addEventListener('change', () => {
		StringStore.update(v => ({...v, uppercase: _upperRef.checked}))
	})

	_lowerRef.addEventListener('change', () => {
		StringStore.update(v => ({...v, lowercase: _lowerRef.checked}))
	})

	_numbersRef.addEventListener('change', () => {
		StringStore.update(v => ({...v, numbers: _numbersRef.checked}))
	})

	_symbolsRef.addEventListener('change', () => {
		StringStore.update(v => ({...v, symbols: _symbolsRef.checked}))
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
}