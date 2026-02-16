import { KeyboardCode, KeyboardValue } from "@/enums/keyboard"
import { NumberType, Pages } from "../_shared/_enums"
import { NavigationStore } from "./_navigation"
import { BasicStore } from "../_features/_basic"
import { ProgrammerStore } from "../_features/_programmer"
import { ConverterStore } from "../_features/_converter"
import { ScientificStore } from "../_features/_scientific"
import { formatOutput } from "./_string-utils"
import { numberToBinary } from "@/utils/number"
import { clearMemory, recallMemory, updateMemory } from "./_memory"

export function insertKeyBackspace(): void {
	const backspace = (input: string) => input.substring(0, input.length-1)
	switch (NavigationStore.value.page) {
	case Pages.Basic     : return BasicStore     .update(v => v.input = backspace(v.input))
	case Pages.Scientific: return ScientificStore.update(v => v.input = backspace(v.input))
	case Pages.Converter : return ConverterStore .update(v => v.input = backspace(v.input))
	case Pages.Orogrammer: return ProgrammerStore.update(v => v.input = backspace(v.input))
	case Pages.Date: break
	}
}

export function insertKeyClear(): void {
	switch (NavigationStore.value.page) {
	case Pages.Basic     : return BasicStore     .update(v => v.input = '')
	case Pages.Scientific: return ScientificStore.update(v => v.input = '')
	case Pages.Converter : return ConverterStore .update(v => v.input = '')
	case Pages.Orogrammer: return ProgrammerStore.update(v => v.input = '')
	case Pages.Date: break
	}
}

export function insertKeyEqual(): void {
	const isNumber = (v: any) => typeof v === 'number'
	switch (NavigationStore.value.page) {
	case Pages.Basic: {
		const output = BasicStore.value.output
		BasicStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.Scientific: {
		const output = ScientificStore.value.output
		ScientificStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.Converter: {
		const output = ConverterStore.value.output
		ConverterStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.Orogrammer: {
		const output = ProgrammerStore.value.output
		if (output !== null) {
			let text = formatOutput(output)
			const bin = numberToBinary(output)
			const parsedBin = Number.parseInt(bin, 2)
			type: switch (ProgrammerStore.value.numberType) {
			case NumberType.Decimal: break type
			case NumberType.Hexadecimal:
				text = parsedBin.toString(16).toUpperCase()
				break type
			case NumberType.Octal:
				text = parsedBin.toString(8)
				break type
			case NumberType.Binary:
				text = bin
				break type
			}
			ProgrammerStore.update(v => v.input = text)
		}
	};	break
	case Pages.Date: break
	}
}

export function insertKeyChar(char: string): void {
	const add = (input: string) => input + char
	switch (NavigationStore.value.page) {
	case Pages.Basic     : return BasicStore     .update(v => v.input = add(v.input))
	case Pages.Scientific: return ScientificStore.update(v => v.input = add(v.input))
	case Pages.Converter : return ConverterStore .update(v => v.input = add(v.input))
	case Pages.Orogrammer: return ProgrammerStore.update(v => v.input = add(v.input))
	case Pages.Date: break
	}
}

export function insertKeyPlusMinus(): void {
	const inverse = (value: string) => {
		const re = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const match = value.match(re)
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

	switch (NavigationStore.value.page) {
	case Pages.Basic     : return BasicStore     .update(v => v.input = inverse(v.input))
	case Pages.Scientific: return ScientificStore.update(v => v.input = inverse(v.input))
	case Pages.Converter : return ConverterStore .update(v => v.input = inverse(v.input))
	case Pages.Orogrammer: return ProgrammerStore.update(v => v.input = inverse(v.input))
	case Pages.Date: break
	}
}

export function insertKeySwap(): void {
	ConverterStore.update(v => {
		[v.inputUnit, v.outputUnit] = [v.outputUnit, v.inputUnit]
	})
}

function _initEvents(): void {
	document.body.addEventListener('keydown', ev => {
		if (NavigationStore.value.page === Pages.Date) return

		const key = ev.key
		const target = ev.target as HTMLElement
		const code = ev.code
		const tagName = target.tagName
		const shiftKey = ev.shiftKey
		const ctrlKey = ev.ctrlKey
		if (
			[KeyboardValue.Space, KeyboardValue.Enter].includes(key as KeyboardValue)
			&& (
				['BUTTON', 'A'].includes(tagName)
				|| (tagName === 'INPUT' && (target as HTMLInputElement).type !== 'text')
			)
		) {
			return
		}

		switch (key) {
		case KeyboardValue.Enter:
		case KeyboardValue.Equal:
			return insertKeyEqual()
		case KeyboardValue.Backspace:
			return insertKeyBackspace()
		case KeyboardValue.Delete:
			return insertKeyClear()
		}

		if (ctrlKey && shiftKey) {
			const prevent = () => ev.preventDefault()

			// Ctrl + Shift + C
			if (code === KeyboardCode.KeyC) {
				clearMemory()
				return prevent()
			}

			// Ctrl + Shift + R
			else if (code === KeyboardCode.KeyR) {
				recallMemory()
				return prevent()
			}

			// Ctrl + Shift + '+'
			else if (key === KeyboardValue.Plus) {
				updateMemory('add')
				return prevent()
			}

			// Ctrl + Shift + '-'
			else if (key === KeyboardValue.Underscore) {
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