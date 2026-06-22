import * as Pages from '../shared/pages.enum.js'
import * as Settings from './settings.js'
import * as Basic from "../features/basic.js"
import * as Programmer from "../features/programmer.js"
import * as Converter from "../features/converter.js"
import * as Scientific from "../features/scientific.js"
import * as KeyboardValues from '@/enums/keyboard-values.enum.js'
import * as KeyboardCodes from '@/enums/keyboard-codes.enum.js'
import { formatOutput } from "./string-utils.js"
import { numberToBinary } from "@/utils/number"
import { clearMemory, recallMemory, updateMemory } from "./memory.js"
import { DecimalNumberFormat, ProgrammerNumTypes } from '../shared/calculator.js'
import { batch } from '@/utils/signal'
import { delegateEvent } from '@/utils/event-registry.js'

export function insertKeyBackspace(): void {
	const backspace = (input: string) => input.substring(0, input.length-1)
	switch (Settings.sg_page()) {
	case Pages.Basic     : return Basic     .sg_input.set(v => backspace(v))
	case Pages.Scientific: return Scientific.sg_input.set(v => backspace(v))
	case Pages.Converter : return Converter .sg_input.set(v => backspace(v))
	case Pages.Programmer: return Programmer.sg_input.set(v => backspace(v))
	case Pages.Date: break
	}
}

export function insertKeyClear(): void {
	switch (Settings.sg_page()) {
	case Pages.Basic     : return Basic     .sg_input.set('')
	case Pages.Scientific: return Scientific.sg_input.set('')
	case Pages.Converter : return Converter .sg_input.set('')
	case Pages.Programmer: return Programmer.sg_input.set('')
	case Pages.Date: break
	}
}

export function insertKeyEqual(): void {
	const isNumber = (v: any) => typeof v === 'number'
	switch (Settings.sg_page()) {
	case Pages.Basic: {
		const output = Basic.sg_output()
		Basic.sg_input.set(isNumber(output)? formatOutput(output) : Basic.sg_input())
	}	break
	case Pages.Scientific: {
		const output = Scientific.sg_output()
		Scientific.sg_input.set(isNumber(output)? formatOutput(output) : Scientific.sg_input())
	}	break
	case Pages.Converter: {
		const output = Converter.sg_output()
		Converter.sg_input.set(isNumber(output)? formatOutput(output) : Converter.sg_input())
	}	break
	case Pages.Programmer: {
		const output = Programmer.sg_output()
		if (output !== null) {
			let text = formatOutput(output)
			const bin = numberToBinary(output)
			const parsedBin = Number.parseInt(bin, 2)
			type: switch (Programmer.sg_numType()) {
			case ProgrammerNumTypes.Decimal: break type
			case ProgrammerNumTypes.Hexadecimal:
				text = parsedBin.toString(16).toUpperCase()
				break type
			case ProgrammerNumTypes.Octal:
				text = parsedBin.toString(8)
				break type
			case ProgrammerNumTypes.Binary:
				text = bin
				break type
			}

			Programmer.sg_input.set(text)
		}
	};	break
	case Pages.Date: break
	}
}

export function insertKeyChar(char: string): void {
	const add = (input: string) => input + char
	switch (Settings.sg_page()) {
	case Pages.Basic     : return Basic     .sg_input.set(v => add(v))
	case Pages.Scientific: return Scientific.sg_input.set(v => add(v))
	case Pages.Converter : return Converter .sg_input.set(v => add(v))
	case Pages.Programmer: return Programmer.sg_input.set(v => add(v))
	case Pages.Date: break
	}
}

export function insertKeyPlusMinus(): void {
	const inverse = (value: string) => {
		const re_point = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const re_comma = /(,*?)([-+]{0,2})(\d*(?:,\d*)?)$/s
		const match = value.match(Settings.sg_decimalFormat() === DecimalNumberFormat.Comma? re_comma : re_point)
		if (value.trim().length === 0) {
			value = '-'
		}
		else if (match) {
			const pre = match[1] ?? ''
			const sign = match[2] ?? ''
			const number = match[3] ?? ''
			let newsign = ''

			if (
				sign === '+-'
				|| sign === '-'
				|| sign === '-+'
			) {
				newsign = '+'
				if (pre === '') newsign = ''
			}
			else if (
				sign === '--'
				|| sign === '+'
				|| sign === '++'
				|| sign === ''
			) {
				newsign = '-'
			}

			if (pre.at(-1) && /[*×\/÷]/.test(pre.at(-1)!) && newsign === '+') {
				newsign = ''
			}

			value = pre + newsign + number
		}

		return value
	}

	switch (Settings.sg_page()) {
	case Pages.Basic     : return Basic     .sg_input.set(v => inverse(v))
	case Pages.Scientific: return Scientific.sg_input.set(v => inverse(v))
	case Pages.Converter : return Converter .sg_input.set(v => inverse(v))
	case Pages.Programmer: return Programmer.sg_input.set(v => inverse(v))
	case Pages.Date: break
	}
}

export function insertKeySwap(): void {
	batch(() => {
		const temp = Converter.sg_inputUnit()
		Converter.sg_inputUnit.set(Converter.sg_outputUnit())
		Converter.sg_outputUnit.set(temp)
	})
}

function _initEvents(): void {
	delegateEvent(document.body, 'keydown', (ev: KeyboardEvent) => {
		if (Settings.sg_page() === Pages.Date) {
			return
		}

		const key = ev.key
		const target = ev.target as HTMLElement
		const code = ev.code
		const tagName = target.tagName
		const shiftKey = ev.shiftKey
		const ctrlKey = ev.ctrlKey
		if (target instanceof HTMLInputElement) {
			return
		}

		if (
			[KeyboardValues.Space, KeyboardValues.Enter].includes(key as any)
			&& (
				['BUTTON', 'A'].includes(tagName)
				|| (tagName === 'INPUT' && (target as HTMLInputElement).type !== 'text')
			)
		) {
			return
		}

		switch (key) {
		case KeyboardValues.Enter:
		case KeyboardValues.Equal:
			return insertKeyEqual()
		case KeyboardValues.Backspace:
			return insertKeyBackspace()
		case KeyboardValues.Delete:
			return insertKeyClear()
		}

		if (ctrlKey && shiftKey) {
			const prevent = () => ev.preventDefault()

			// Ctrl + Shift + C
			if (code === KeyboardCodes.KeyC) {
				clearMemory()
				return prevent()
			}

			// Ctrl + Shift + R
			else if (code === KeyboardCodes.KeyR) {
				recallMemory()
				return prevent()
			}

			// Ctrl + Shift + '+'
			else if (key === KeyboardValues.Plus) {
				updateMemory('add')
				return prevent()
			}

			// Ctrl + Shift + '-'
			else if (key === KeyboardValues.Underscore) {
				updateMemory('min')
				return prevent()
			}
		}

		// Shift, alt, etc
		if (key.length > 1 || !/[\w!%^×*÷<>|&/()\-+., ]/.test(key)) return

		insertKeyChar(key)
	})
}

export default () => {
	_initEvents()
}