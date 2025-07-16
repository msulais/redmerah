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
	case Pages.basic     : return BasicStore     .update(v => v.input = backspace(v.input))
	case Pages.scientific: return ScientificStore.update(v => v.input = backspace(v.input))
	case Pages.converter : return ConverterStore .update(v => v.input = backspace(v.input))
	case Pages.programmer: return ProgrammerStore.update(v => v.input = backspace(v.input))
	case Pages.date: break
	}
}

export function insertKeyClear(): void {
	switch (NavigationStore.value.page) {
	case Pages.basic     : return BasicStore     .update(v => v.input = '')
	case Pages.scientific: return ScientificStore.update(v => v.input = '')
	case Pages.converter : return ConverterStore .update(v => v.input = '')
	case Pages.programmer: return ProgrammerStore.update(v => v.input = '')
	case Pages.date: break
	}
}

export function insertKeyEqual(): void {
	const isNumber = (v: any) => typeof v === 'number'
	switch (NavigationStore.value.page) {
	case Pages.basic: {
		const output = BasicStore.value.output
		BasicStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.scientific: {
		const output = ScientificStore.value.output
		ScientificStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.converter: {
		const output = ConverterStore.value.output
		ConverterStore.update(v => v.input = isNumber(output)? formatOutput(output) : v.input)
	}	break
	case Pages.programmer: {
		const output = ProgrammerStore.value.output
		if (output !== null) {
			let text = formatOutput(output)
			const bin = numberToBinary(output)
			const parsedBin = Number.parseInt(bin, 2)
			type: switch (ProgrammerStore.value.numberType) {
			case NumberType.decimal: break type
			case NumberType.hexadecimal:
				text = parsedBin.toString(16).toUpperCase()
				break type
			case NumberType.octal:
				text = parsedBin.toString(8)
				break type
			case NumberType.binary:
				text = bin
				break type
			}
			ProgrammerStore.update(v => v.input = text)
		}
	};	break
	case Pages.date: break
	}
}

export function insertKeyChar(char: string): void {
	const add = (input: string) => input + char
	switch (NavigationStore.value.page) {
	case Pages.basic     : return BasicStore     .update(v => v.input = add(v.input))
	case Pages.scientific: return ScientificStore.update(v => v.input = add(v.input))
	case Pages.converter : return ConverterStore .update(v => v.input = add(v.input))
	case Pages.programmer: return ProgrammerStore.update(v => v.input = add(v.input))
	case Pages.date: break
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
	case Pages.basic     : return BasicStore     .update(v => v.input = inverse(v.input))
	case Pages.scientific: return ScientificStore.update(v => v.input = inverse(v.input))
	case Pages.converter : return ConverterStore .update(v => v.input = inverse(v.input))
	case Pages.programmer: return ProgrammerStore.update(v => v.input = inverse(v.input))
	case Pages.date: break
	}
}

export function insertKeySwap(): void {
	ConverterStore.update(v => {
		[v.inputUnit, v.outputUnit] = [v.outputUnit, v.inputUnit]
	})
}

function _initEvents(): void {
	document.body.addEventListener('keydown', ev => {
		if (NavigationStore.value.page === Pages.date) return

		const key = ev.key
		const target = ev.target as HTMLElement
		const code = ev.code
		const tagName = target.tagName
		const shiftKey = ev.shiftKey
		const ctrlKey = ev.ctrlKey
		if (
			[KeyboardValue.space, KeyboardValue.enter].includes(key as KeyboardValue)
			&& (
				['BUTTON', 'A'].includes(tagName)
				|| (tagName === 'INPUT' && (target as HTMLInputElement).type !== 'text')
			)
		) {
			return
		}

		switch (key) {
		case KeyboardValue.enter:
		case KeyboardValue.equal:
			return insertKeyEqual()
		case KeyboardValue.backspace:
			return insertKeyBackspace()
		case KeyboardValue.delete:
			return insertKeyClear()
		}

		if (ctrlKey && shiftKey) {
			const prevent = () => ev.preventDefault()

			// Ctrl + Shift + C
			if (code === KeyboardCode.keyC) {
				clearMemory()
				return prevent()
			}

			// Ctrl + Shift + R
			else if (code === KeyboardCode.keyR) {
				recallMemory()
				return prevent()
			}

			// Ctrl + Shift + '+'
			else if (key === KeyboardValue.plus) {
				updateMemory('add')
				return prevent()
			}

			// Ctrl + Shift + '-'
			else if (key === KeyboardValue.underscore) {
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