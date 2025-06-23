import { ObservableStore } from "@/utils/store"
import { $$$ } from "./_dom-utils"
import { CSSClasses } from "../../_styles/_css"
import { isAnimationAllowed } from "@/utils/animation"
import { animateUpdateTextElement } from "@/utils/element"
import { formatOutput } from "./_string-utils"
import { NavigationStore } from "./_navigation"
import { NumberType, Pages } from "../_shared/_enums"
import { BasicStore } from "../_features/_basic"
import { ScientificStore } from "../_features/_scientific"
import { ConverterStore } from "../_features/_converter"
import { ProgrammerStore } from "../_features/_programmer"
import { numberToBinary } from "@/utils/number"
import { saveStorageItem } from "./_database"

export type MemoryStoreType = Readonly<{
	value: number
}>

export const MemoryStore = new ObservableStore<MemoryStoreType>({
	value: 0
})
const _memoryRecallRefs = $$$<HTMLElement>(`.${CSSClasses.bodyPageMemoryPreview}`)

export function recallMemory(): void {
	const memory = MemoryStore.value.value
	let value = formatOutput(memory)
	switch (NavigationStore.value.page) {
	case Pages.basic:
		BasicStore.update(v => ({...v, input: v.input + value}))
		break
	case Pages.scientific:
		ScientificStore.update(v => ({...v, input: v.input + value}))
		break
	case Pages.converter:
		ConverterStore.update(v => ({...v, input: v.input + value}))
		break
	case Pages.programmer:

		const bin = numberToBinary(memory)
		const parsedBin = Number.parseInt(bin, 2)
		switch (ProgrammerStore.value.numberType) {
		case NumberType.decimal: break
		case NumberType.hexadecimal:
			value = parsedBin.toString(16).toUpperCase()
			break
		case NumberType.octal:
			value = parsedBin.toString(8)
			break
		case NumberType.binary:
			value = bin
			break
		}
		ProgrammerStore.update(v => ({...v, input: v.input + value}))
		break
	case Pages.date:
	}
}

export function updateMemeory(type: 'add' | 'min'): void {
	let output: number | null = null
	switch (NavigationStore.value.page) {
	case Pages.basic:
		output = BasicStore.value.output
		break
	case Pages.scientific:
		output = ScientificStore.value.output
		break
	case Pages.converter:
		output = ConverterStore.value.output
		break
	case Pages.programmer:
		output = ProgrammerStore.value.output
		break
	case Pages.date:
	}

	if (output !== null) {
		MemoryStore.update(v => ({
			...v,
			value: v.value + (output * (type === 'min'? -1 : 1))
		}))
	}
}

export function clearMemory(): void {
	MemoryStore.update(v => ({...v, value: 0}))
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

	const animation = isAnimationAllowed()
	for (const ref of _memoryRecallRefs) {
		if (animation) {
			animateUpdateTextElement(ref, formattedValue)
		} else {
			ref.textContent = formattedValue
		}
	}
}

function _initSubscriber(): void {
	MemoryStore.subscribe(_subscribeValueRefView)
	MemoryStore.subscribe(_subscribeValueChanges)
}

export default () => {
	_initSubscriber()
}