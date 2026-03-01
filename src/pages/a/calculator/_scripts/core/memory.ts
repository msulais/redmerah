import { ObservableStore } from "@/utils/store"
import { $$$ } from "./dom-utils"
import { CSSClasses } from "../../_styles/classes"
import { formatOutput } from "./string-utils"
import { NavigationStore } from "./navigation"
import { NumberType, Pages } from "../shared/enums"
import { BasicStore } from "../features/basic"
import { ScientificStore } from "../features/scientific"
import { ConverterStore } from "../features/converter"
import { ProgrammerStore } from "../features/programmer"
import { numberToBinary } from "@/utils/number"
import { saveStorageItem } from "./database"
import { DEFAULT_MEMORY } from "../shared/constant"

export type MemoryStoreType = Readonly<{
	value: number
}>

export const MemoryStore = new ObservableStore<MemoryStoreType>({
	value: DEFAULT_MEMORY
})
const _memoryRecallRefs = $$$<HTMLElement>(`.${CSSClasses.bdPage_memoPreview}`)

export function recallMemory(): void {
	const memory = MemoryStore.value.value
	let value = formatOutput(memory)
	switch (NavigationStore.value.page) {
	case Pages.Basic     : return BasicStore     .update(v => v.input = v.input + value)
	case Pages.Scientific: return ScientificStore.update(v => v.input = v.input + value)
	case Pages.Converter : return ConverterStore .update(v => v.input = v.input + value)
	case Pages.Orogrammer:
		const bin = numberToBinary(memory)
		const parsedBin = Number.parseInt(bin, 2)
		switch (ProgrammerStore.value.numberType) {
		case NumberType.Decimal: break
		case NumberType.Hexadecimal:
			value = parsedBin.toString(16).toUpperCase()
			break
		case NumberType.Octal:
			value = parsedBin.toString(8)
			break
		case NumberType.Binary:
			value = bin
			break
		}
		ProgrammerStore.update(v => v.input = v.input + value)
		break
	case Pages.Date:
	}
}

export function updateMemory(type: 'add' | 'min'): void {
	let output: number | null = null
	switch (NavigationStore.value.page) {
	case Pages.Basic:
		output = BasicStore.value.output
		break
	case Pages.Scientific:
		output = ScientificStore.value.output
		break
	case Pages.Converter:
		output = ConverterStore.value.output
		break
	case Pages.Orogrammer:
		output = ProgrammerStore.value.output
		break
	case Pages.Date:
	}

	if (output !== null) {
		MemoryStore.update(v => v.value = v.value + (output * (type === 'min'? -1 : 1)))
	}
}

export function clearMemory(): void {
	MemoryStore.update(v => v.value = 0)
}

function _subscribeValueChanges(v: MemoryStoreType, o: MemoryStoreType): void {
	const value = v.value
	if (value === o.value) return

	saveStorageItem('memory-value', value)
}

function _subscribeValueRefView(v: MemoryStoreType, o: MemoryStoreType): void {
	const value = v.value
	const formattedValue = 'MR: ' + formatOutput(value)
	if (
		value === o.value
		&& _memoryRecallRefs.values().every(v => v.textContent === formattedValue)
	) return;

	for (const ref of _memoryRecallRefs) {
		ref.textContent = formattedValue
	}
}

function _initSubscriber(): void {
	MemoryStore.subscribe(_subscribeValueRefView)
	MemoryStore.subscribe(_subscribeValueChanges)
}

export default () => {
	_initSubscriber()
}