import { ObservableStore } from "@/utils/signal"
import { WordsRandomizerCase } from "../_shared/_enums"
import { DEFAULT_WORDS_CASE, DEFAULT_WORDS_COUNT, DEFAULT_WORDS_LIST_ID, DEFAULT_WORDS_OUTPUT, DEFAULT_WORDS_PREFIX, DEFAULT_WORDS_REPEAT, DEFAULT_WORDS_SEPARATOR, DEFAULT_WORDS_SUFFIX } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $ } from "../_core/_dom-utils"
import { CComboBox } from "@/components/ComboBox"
import { ListsStore } from "../_core/_lists"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { stringToTitleCase, stringToToggleCase } from "@/utils/string"
import { shuffleArray } from "@/utils/array"
import { saveStorageItem } from "../_core/_database"

export type WordsStoreType = Readonly<{
	count: number
	listId: number
	prefix: string
	suffix: string
	separator: string
	wordCase: WordsRandomizerCase
	repeat: boolean
	output: string
}>

export const WordsStore = new ObservableStore<WordsStoreType>({
	count: DEFAULT_WORDS_COUNT,
	listId: DEFAULT_WORDS_LIST_ID,
	prefix: DEFAULT_WORDS_PREFIX,
	repeat: DEFAULT_WORDS_REPEAT,
	separator: DEFAULT_WORDS_SEPARATOR,
	suffix: DEFAULT_WORDS_SUFFIX,
	wordCase: DEFAULT_WORDS_CASE,
	output: DEFAULT_WORDS_OUTPUT
})

const _ref_list = $(ElementIds.pgWrd_list) as CComboBox.CElement
const _ref_count = $(ElementIds.pgWrd_count) as HTMLInputElement
const _ref_wordCase = $(ElementIds.pgWrd_case) as CComboBox.CElement
const _ref_separator = $(ElementIds.pgWrd_separator) as HTMLInputElement
const _ref_prefix = $(ElementIds.pgWrd_prefix) as HTMLInputElement
const _ref_suffix = $(ElementIds.pgWrd_suffix) as HTMLInputElement
const _ref_repeat = $(ElementIds.pgWrd_repeat) as HTMLInputElement
const _ref_output = $(ElementIds.pgWrd_output) as HTMLOutputElement
let _time_storage: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = WordsStore.value
	const list = ListsStore.value.list.find(v => v.id === store.listId)
	const count = store.count
	if (!list) {return}

	const items = list.items
	const output: string[] = []
	if (store.repeat) {
		while (output.length < count) {
			output.push(items[Math.floor(Math.random() * (items.length-1))]!)
		}
	}
	else {
		if (count < items.length) {
			const pool = [...items]
			let size = pool.length
			while (output.length < count) {
				const i = Math.floor(Math.random() * size)
				size--;
				[pool[i], pool[size]] = [pool[size]!, pool[i]!];
				output.push(pool[size]!)
			}
		}
		else {
			output.push(...items)
			shuffleArray(output)
		}
	}

	WordsStore.update(v => v.output = output.map(text => {
		switch (store.wordCase) {
		case WordsRandomizerCase.Uppercase: text = text.toUpperCase(); break
		case WordsRandomizerCase.Lowercase: text = text.toLowerCase(); break
		case WordsRandomizerCase.Titlecase: text = stringToTitleCase(text); break
		case WordsRandomizerCase.Togglecase: text = stringToToggleCase(text); break
		case WordsRandomizerCase.None:
		}

		return [store.prefix, text, store.suffix].join('')
	}).join(store.separator))
}

function _subsStorage(v: WordsStoreType): void {
	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('words:count', v.count)
		saveStorageItem('words:list-id', v.listId)
		saveStorageItem('words:prefix', v.prefix)
		saveStorageItem('words:suffix', v.suffix)
		saveStorageItem('words:separator', v.separator)
		saveStorageItem('words:word-case', v.wordCase)
		saveStorageItem('words:repeat', v.repeat)
		saveStorageItem('words:output', v.output)
	})
}

function _subsView(v: WordsStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	if (!isActive(_ref_count)) {
		_ref_count.valueAsNumber = v.count
	}

	if (!isActive(_ref_separator)) {
		_ref_separator.value = v.separator
	}

	if (!isActive(_ref_prefix)) {
		_ref_prefix.value = v.prefix
	}

	if (!isActive(_ref_suffix)) {
		_ref_suffix.value = v.suffix
	}

	_ref_repeat.checked = v.repeat
	_ref_output.textContent = v.output
	_ref_wordCase.value = v.wordCase
	_ref_list.value = v.listId.toString()
}

function _initSubscriber(): void {
	WordsStore.subscribe(_subsStorage)
	WordsStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_list.addEventListener('change', () => {
		const id = Number.parseInt(_ref_list.value)
		if (!ListsStore.value.list.some(v => v.id === id)) {return}

		WordsStore.update(v => v.listId = id)
	})

	_ref_count.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		WordsStore.update(v => v.count = value)
	})

	_ref_count.addEventListener('blur', () => {
		_ref_count.valueAsNumber = WordsStore.value.count
	})

	_ref_wordCase.addEventListener('change', () => {
		const value = _ref_wordCase.value as WordsRandomizerCase
		if (!isValidEnumValue(value, WordsRandomizerCase)) {return}

		WordsStore.update(v => v.wordCase = value)
	})

	_ref_separator.addEventListener('input', () => {
		const value = _ref_separator.value
		WordsStore.update(v => v.separator = value)
	})

	_ref_prefix.addEventListener('input', () => {
		const value = _ref_prefix.value
		WordsStore.update(v => v.prefix = value)
	})

	_ref_suffix.addEventListener('input', () => {
		const value = _ref_suffix.value
		WordsStore.update(v => v.suffix = value)
	})

	_ref_repeat.addEventListener('change', () => {
		const value = _ref_repeat.checked
		WordsStore.update(v => v.repeat = value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}