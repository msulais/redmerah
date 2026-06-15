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

const _sg_memoryValue = signal(Constant.DEFAULT_MEMORY)

export const Signals = {
	memoryValue: _sg_memoryValue
}

const _refs_memoryRecall = $$$<HTMLButtonElement>(`[data-command=${Commands.MemoryRecall}]`)

export function recallMemory(): void {
	let value = formatOutput(_sg_memoryValue())
	switch (Settings.Signals.page()) {
	case Pages.Basic     : return Basic.Signals.input     .set(v => v + value)
	case Pages.Scientific: return Scientific.Signals.input.set(v => v + value)
	case Pages.Converter : return Converter.Signals.input .set(v => v + value)
	case Pages.Programmer:
		const bin = numberToBinary(_sg_memoryValue())
		const parsedBin = Number.parseInt(bin, 2)
		switch (Programmer.Signals.numType()) {
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

		Programmer.Signals.input.set(v => v + value)
		break
	case Pages.Date:
	}
}

export function updateMemory(type: 'add' | 'min'): void {
	let output: number | null = null
	switch (Settings.Signals.page()) {
	case Pages.Basic     : output = Basic     .Signals.output(); break
	case Pages.Scientific: output = Scientific.Signals.output(); break
	case Pages.Converter : output = Converter .Signals.output(); break
	case Pages.Programmer: output = Programmer.Signals.output(); break
	case Pages.Date: break
	}

	if (output !== null) {
		_sg_memoryValue.set(v => v + (output * (type === 'min'? -1 : 1)))
	}
}

export function clearMemory(): void {
	_sg_memoryValue.set(0)
}

function _initSubscriber(): void {
	_sg_memoryValue.subscribe(v => {
		const formattedValue = 'MR: ' + formatOutput(v)
		for (const ref of _refs_memoryRecall) {
			ref.textContent = formattedValue
		}

		saveStorageItem('memory-value', v, 250)
	})
}

export default () => {
	_initSubscriber()
}