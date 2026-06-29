import { ObservableStore } from "@/utils/signal"
import { DEFAULT_SELECTION_COUNT, DEFAULT_SELECTION_LIST, DEFAULT_SELECTION_LIST_ID, DEFAULT_SELECTION_OUTPUT } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$$ } from "../_core/_dom-utils"
import { CComboBox } from "@/components/ComboBox"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import { ListsStore } from "../_core/_lists"
import { shuffleArray } from "@/utils/array"
import { saveStorageItem } from "../_core/_database"

export type SelectionStoreType = Readonly<{
	count: number
	listId: number
	listItems: string[]
	output: string[]
}>

export const SelectionStore = new ObservableStore<SelectionStoreType>({
	count: DEFAULT_SELECTION_COUNT,
	listId: DEFAULT_SELECTION_LIST_ID,
	output: DEFAULT_SELECTION_OUTPUT as string[],
	listItems: DEFAULT_SELECTION_LIST.items
})

const _ref_list = $(ElementIds.pgSel_list) as CComboBox.CElement
const _ref_count = $(ElementIds.pgSel_count) as HTMLInputElement
const _ref_output = $(ElementIds.pgSel_output) as HTMLUListElement
let _timeStorageId: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = SelectionStore.value
	const count = store.count
	const items = store.listItems
	const output: string[] = []
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

	SelectionStore.update(v => v.output = output)
}

function _subsStorage(v: SelectionStoreType): void {
	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('selection:count', v.count)
		saveStorageItem('selection:list-id', v.listId)
		saveStorageItem('selection:list-items', v.listItems)
		saveStorageItem('selection:output', v.output)
	}, 500)
}

function _subsOutputView(v: SelectionStoreType, o: SelectionStoreType): void {
	const output = v.output
	if (output === o.output) {return}

	const items = v.listItems
	const refs = $$$<HTMLLIElement>('li', _ref_output)
	const upreate_ref_li = (ref: HTMLLIElement, name: string) => {
		ref.textContent = name
		ref.toggleAttribute('data-selected', output.some(v => v === name))
	}

	for (let i = 0; i < refs.length; i++) {
		const ref = refs[i]!
		if (i >= items.length) {
			ref.remove()
			continue
		}

		upreate_ref_li(ref, items[i]!)
	}

	for (let i = 0; i < items.length - refs.length; i++) {
		const index = refs.length + i
		const ref = document.createElement('li')
		upreate_ref_li(ref, items[index]!)
		_ref_output.append(ref)
	}
}

function _subsView(v: SelectionStoreType, o: SelectionStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	if (!isActive(_ref_count)) {
		_ref_count.valueAsNumber = v.count
	}

	_ref_list.value = v.listId.toString()
	if (v.listId !== o.listId) {
		const list = ListsStore.value.list.find(a => a.id ===  v.listId)
		if (list) {
			SelectionStore.update(v => v.listItems = [...list.items])
		}
	}
}

function _initSubscriber(): void {
	SelectionStore.subscribe(_subsStorage)
	SelectionStore.subscribe(_subsView)
	SelectionStore.subscribe(_subsOutputView)
}

function _initEvents(): void {
	_ref_list.addEventListener("change", () => {
		const id = Number.parseInt(_ref_list.value)
		const list = ListsStore.value.list
		if (!list.some(v => v.id === id)) {return}

		const items = list.find(v => v.id === id)!.items
		SelectionStore.update(v => {
			v.listId = id
			v.count = Math_clamp(v.count, 1, items.length-1)
		})
	})

	// the only place to dynamically set HTMLInputElement.max
	_ref_count.addEventListener('focus', () => {
		const list = ListsStore.value.list.find(v => v.id === SelectionStore.value.listId)
		if (!list) {return}

		_ref_count.max = list.items.length.toString()
	})

	_ref_count.addEventListener("input", () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		SelectionStore.update(v => v.count = value)
	})

	_ref_count.addEventListener("blur", () => {
		_ref_count.valueAsNumber = SelectionStore.value.count
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}