import { KeyboardCode, KeyboardValue } from "@/enums/keyboard"
import { NumberType, Pages } from "../_shared/_enums"
import { NavigationStore } from "./_navigation"
import { BasicStore } from "../_features/_basic"
import { ProgrammerStore } from "../_features/_programmer"
import { ConverterStore } from "../_features/_converter"
import { ScientificStore } from "../_features/_scientific"
import { formatOutput } from "./_string-utils"
import { numberToBinary } from "@/utils/number"
import { clearMemory, recallMemory, updateMemeory } from "./_memory"

export function insertKeyBackspace(): void {
	switch (NavigationStore.value.page) {
	case Pages.basic:
		return BasicStore.update(v => ({...v, input: v.input.substring(0, v.input.length-1)}))
	case Pages.scientific:
		return ScientificStore.update(v => ({...v, input: v.input.substring(0, v.input.length-1)}))
	case Pages.converter:
		return ConverterStore.update(v => ({...v, input: v.input.substring(0, v.input.length-1)}))
	case Pages.programmer:
		return ProgrammerStore.update(v => ({...v, input: v.input.substring(0, v.input.length-1)}))
	case Pages.date: break
	}
}

export function insertKeyClear(): void {
	switch (NavigationStore.value.page) {
	case Pages.basic:
		return BasicStore.update(v => ({...v, input: ''}))
	case Pages.scientific:
		return ScientificStore.update(v => ({...v, input: ''}))
	case Pages.converter:
		return ConverterStore.update(v => ({...v, input: ''}))
	case Pages.programmer:
		return ProgrammerStore.update(v => ({...v, input: ''}))
	case Pages.date: break
	}
}

export function insertKeyEqual(): void {
	let output: number | null = null
	switch (NavigationStore.value.page) {
	case Pages.basic:
		output = BasicStore.value.output
		if (output !== null) BasicStore.update(
			v => ({...v, input: formatOutput(output!)})
		)
		break
	case Pages.scientific:
		output = ScientificStore.value.output
		if (output !== null) ScientificStore.update(
			v => ({...v, input: formatOutput(output!)})
		)
		break
	case Pages.converter:
		output = ConverterStore.value.output
		if (output !== null) ConverterStore.update(
			v => ({...v, input: formatOutput(output!)})
		)
		break
	case Pages.programmer: {
		output = ProgrammerStore.value.output
		if (output !== null) {
			let text = formatOutput(output!)
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
			ProgrammerStore.update(v => ({...v, input: text}))
		}
	};	break
	case Pages.date: break
	}
}

export function insertKeyChar(char: string): void {
	switch (NavigationStore.value.page) {
	case Pages.basic:
		return BasicStore.update(v => ({...v, input: v.input + char}))
	case Pages.scientific:
		return ScientificStore.update(v => ({...v, input: v.input + char}))
	case Pages.converter:
		return ConverterStore.update(v => ({...v, input: v.input + char}))
	case Pages.programmer:
		return ProgrammerStore.update(v => ({...v, input: v.input + char}))
	case Pages.date: break
	}
}

export function insertKeyPlusMinus(): void {
	const inversLastExpression = (value: string) => {
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
	case Pages.basic:
		return BasicStore.update(v => ({...v, input: inversLastExpression(v.input)}))
	case Pages.scientific:
		return ScientificStore.update(v => ({...v, input: inversLastExpression(v.input)}))
	case Pages.converter:
		return ConverterStore.update(v => ({...v, input: inversLastExpression(v.input)}))
	case Pages.programmer:
		return ProgrammerStore.update(v => ({...v, input: inversLastExpression(v.input)}))
	case Pages.date: break
	}
}

export function insertKeySwap(): void {
	ConverterStore.update(v => ({...v,
		inputUnit: v.outputUnit,
		outputUnit: v.inputUnit
	}))
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
				updateMemeory('add')
				return prevent()
			}

			// Ctrl + Shift + '-'
			else if (key === KeyboardValue.underscore) {
				updateMemeory('min')
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