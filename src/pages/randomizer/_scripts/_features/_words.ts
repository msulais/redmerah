import { ObservableStore } from "@/utils/store"
import { WordsRandomizerCase } from "../_shared/_enums"
import { DEFAULT_WORDS_CASE, DEFAULT_WORDS_COUNT, DEFAULT_WORDS_LIST_ID, DEFAULT_WORDS_OUTPUT, DEFAULT_WORDS_PREFIX, DEFAULT_WORDS_REPEAT, DEFAULT_WORDS_SEPARATOR, DEFAULT_WORDS_SUFFIX } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $ } from "../_core/_dom-utils"
import type { ComboBoxElement } from "@/native-components/ComboBox"
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

const _listRef = $(ElementIds.pgWrd_list) as ComboBoxElement
const _countRef = $(ElementIds.pgWrd_count) as HTMLInputElement
const _wordCaseRef = $(ElementIds.pgWrd_case) as ComboBoxElement
const _separatorRef = $(ElementIds.pgWrd_separator) as HTMLInputElement
const _prefixRef = $(ElementIds.pgWrd_prefix) as HTMLInputElement
const _suffixRef = $(ElementIds.pgWrd_suffix) as HTMLInputElement
const _repeatRef = $(ElementIds.pgWrd_repeat) as HTMLInputElement
const _outputRef = $(ElementIds.pgWrd_output) as HTMLOutputElement
let _timeStorageId: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = WordsStore.value
	const list = ListsStore.value.list.find(v => v.id === store.listId)
	const count = store.count
	if (!list) {return}

	const items = list.items
	const output: string[] = []
	if (store.repeat) {
		while (output.length < count) {
			output.push(items[Math.floor(Math.random() * (items.length-1))])
		}
	}
	else {
		if (count < items.length) {
			const pool = [...items]
			let size = pool.length
			while (output.length < count) {
				const i = Math.floor(Math.random() * size)
				size--;
				[pool[i], pool[size]] = [pool[size], pool[i]];
				output.push(pool[size])
			}
		}
		else {
			output.push(...items)
			shuffleArray(output)
		}
	}

	WordsStore.update(v => v.output = output.map(text => {
		switch (store.wordCase) {
		case WordsRandomizerCase.uppercase: text = text.toUpperCase(); break
		case WordsRandomizerCase.lowercase: text = text.toLowerCase(); break
		case WordsRandomizerCase.titlecase: text = stringToTitleCase(text); break
		case WordsRandomizerCase.togglecase: text = stringToToggleCase(text); break
		case WordsRandomizerCase.none:
		}

		return [store.prefix, text, store.suffix].join('')
	}).join(store.separator))
}

function _subsStorage(v: WordsStoreType): void {
	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
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
	if (!isActive(_countRef)) {
		_countRef.valueAsNumber = v.count
	}

	if (!isActive(_separatorRef)) {
		_separatorRef.value = v.separator
	}

	if (!isActive(_prefixRef)) {
		_prefixRef.value = v.prefix
	}

	if (!isActive(_suffixRef)) {
		_suffixRef.value = v.suffix
	}

	_repeatRef.checked = v.repeat
	_outputRef.textContent = v.output
	_wordCaseRef.value = v.wordCase
	_listRef.value = v.listId.toString()
}

function _initSubscriber(): void {
	WordsStore.subscribe(_subsStorage)
	WordsStore.subscribe(_subsView)
}

function _initEvents(): void {
	_listRef.addEventListener('change', () => {
		const id = Number.parseInt(_listRef.value)
		if (!ListsStore.value.list.some(v => v.id === id)) {return}

		WordsStore.update(v => v.listId = id)
	})

	_countRef.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_countRef.valueAsNumber), 1, Number.MAX_VALUE)
		WordsStore.update(v => v.count = value)
	})

	_countRef.addEventListener('blur', () => {
		_countRef.valueAsNumber = WordsStore.value.count
	})

	_wordCaseRef.addEventListener('change', () => {
		const value = _wordCaseRef.value as WordsRandomizerCase
		if (!isValidEnumValue(value, WordsRandomizerCase)) {return}

		WordsStore.update(v => v.wordCase = value)
	})

	_separatorRef.addEventListener('input', () => {
		const value = _separatorRef.value
		WordsStore.update(v => v.separator = value)
	})

	_prefixRef.addEventListener('input', () => {
		const value = _prefixRef.value
		WordsStore.update(v => v.prefix = value)
	})

	_suffixRef.addEventListener('input', () => {
		const value = _suffixRef.value
		WordsStore.update(v => v.suffix = value)
	})

	_repeatRef.addEventListener('change', () => {
		const value = _repeatRef.checked
		WordsStore.update(v => v.repeat = value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}