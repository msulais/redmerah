import * as Pages from '../shared/pages.enum.js'
import * as Settings from './settings.js'
import * as Angle from '../features/angle.js'
import * as Length from '../features/length.js'
import * as Time from '../features/time.js'
import { batch } from '@/utils/signal'

export function insertKeyBackspace(): void {
	const backspace = (input: string) => input.substring(0, input.length-1)
	switch (Settings.sg_page()) {
	case Pages.Length: return Length.sg_input.set(v => backspace(v))
	case Pages.Angle : return Angle .sg_input.set(v => backspace(v))
	case Pages.Time  : return Time  .sg_input.set(v => backspace(v))
	}
}

export function insertKeyClear(): void {
	switch (Settings.sg_page()) {
	case Pages.Length: return Length.sg_input.set('')
	case Pages.Angle : return Angle .sg_input.set('')
	case Pages.Time  : return Time  .sg_input.set('')
	}
}

export function insertKeyChar(char: string): void {
	const add = (input: string) => input + char
	switch (Settings.sg_page()) {
	case Pages.Length: return Length.sg_input.set(v => add(v))
	case Pages.Angle : return Angle .sg_input.set(v => add(v))
	case Pages.Time  : return Time  .sg_input.set(v => add(v))
	}
}

export function insertKeyPlusMinus(): void {
	const inverse = (value: string) => {
		const re_point = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const match = value.match(re_point)
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
	case Pages.Length: return Length.sg_input.set(v => inverse(v))
	case Pages.Angle : return Angle .sg_input.set(v => inverse(v))
	case Pages.Time  : return Time  .sg_input.set(v => inverse(v))
	}
}

export function insertKeySwap(): void {
	batch(() => {
		let temp = Length.sg_inputUnit()
		switch (Settings.sg_page()) {
		case Pages.Length:
			temp = Length.sg_inputUnit()
			Length.sg_inputUnit.set(Length.sg_outputUnit())
			Length.sg_outputUnit.set(temp)
			break
		case Pages.Angle:
			temp = Angle.sg_inputUnit()
			Angle.sg_inputUnit.set(Angle.sg_outputUnit())
			Angle.sg_outputUnit.set(temp)
			break
		case Pages.Time:
			temp = Time.sg_inputUnit()
			Time.sg_inputUnit.set(Time.sg_outputUnit())
			Time.sg_outputUnit.set(temp)
			break
		}
	})
}

export default () => {
}