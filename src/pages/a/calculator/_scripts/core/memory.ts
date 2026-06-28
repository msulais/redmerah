import * as Constant from '../shared/constant.enum.js'
import * as Commands from '../shared/commands.enum.js'
import * as Pages from '../shared/pages.enum.js'
import * as Settings from './settings.js'
import * as Basic from "../features/basic.js"
import * as Programmer from "../features/programmer.js"
import * as Converter from "../features/converter.js"
import * as Scientific from "../features/scientific.js"
import { $$$ } from "./dom-utils.js"
import { formatOutput } from "./string-utils.js"
import { numberToBinary } from "@/utils/number"
import { saveStorageItem } from "./database.js"
import { signal } from '@/utils/signal.js'
import { ProgrammerNumTypes } from '../shared/calculator.js'

export const sg_memoryValue = signal(Constant.DEFAULT_MEMORY)

const _refs_memoryRecall = $$$<HTMLButtonElement>(`[data-command=${Commands.MemoryRecall}]`)

export function recallMemory(): void {
	let value = formatOutput(sg_memoryValue())
	switch (Settings.sg_page()) {
	case Pages.Basic     : return Basic.sg_input     .set(v => v + value)
	case Pages.Scientific: return Scientific.sg_input.set(v => v + value)
	case Pages.Converter : return Converter.sg_input .set(v => v + value)
	case Pages.Programmer:
		const bin = numberToBinary(sg_memoryValue())
		const parsedBin = Number.parseInt(bin, 2)
		switch (Programmer.sg_numType()) {
		case ProgrammerNumTypes.Decimal: break
		case ProgrammerNumTypes.Hexadecimal:
			value = parsedBin.toString(16).toUpperCase()
			break
		case ProgrammerNumTypes.Octal:
			value = parsedBin.toString(8)
			break
		case ProgrammerNumTypes.Binary:
			value = bin
			break
		}

		Programmer.sg_input.set(v => v + value)
		break
	case Pages.Date:
	}
}

export function updateMemory(type: 'add' | 'min'): void {
	let output: number | null = null
	switch (Settings.sg_page()) {
	case Pages.Basic     : output = Basic     .sg_output(); break
	case Pages.Scientific: output = Scientific.sg_output(); break
	case Pages.Converter : output = Converter .sg_output(); break
	case Pages.Programmer: output = Programmer.sg_output(); break
	case Pages.Date: break
	}

	if (output !== null) {
		sg_memoryValue.set(v => v + (output * (type === 'min'? -1 : 1)))
	}
}

export function clearMemory(): void {
	sg_memoryValue.set(0)
}

function _initSubscriber(): void {
	sg_memoryValue.subscribe(v => {
		const formattedValue = 'MR: ' + formatOutput(v)
		for (const ref of _refs_memoryRecall) {
			ref.textContent = formattedValue
		}

		saveStorageItem('memory-value', v)
	})
}

export default () => {
	_initSubscriber()
}