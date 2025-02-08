import { arrayLength } from "./array"
import { objectHasValue } from "./object"
import { mathAbs, mathPow } from "./math"
import { regexTest } from "./regex"
import { stringIndexOf, stringLength, stringMatch, stringRepeat, stringReplace, stringSplit, stringSubstring } from "./string"

export function numberSafe(num: number, fallback: number = 0): number {
	return numberIsNotDefined(num)? fallback : num
}

export function numberToFixed(num: number, fractionDigits?: number): string {
	return num.toFixed(fractionDigits)
}

export function numberIsNotDefined(num: number): boolean {
	return numberIsNaN(num) as boolean || numberIsInfinite(num)
}

export function numberIsDefined(num: number): boolean {
	return !numberIsNotDefined(num)
}

export function numberIsFinite(num: number): boolean {
	return Number.isFinite(num)
}

export function numberIsInfinite(num: number): boolean {
	return !numberIsFinite(num)
}

export function numberIsNaN(x: number, fallback?: number): boolean | number {
	if (objectHasValue(fallback)) {
		if (Number.isNaN(x)) return fallback!
		return x
	}
	return Number.isNaN(x)
}

export function numberIsInt(number: unknown): boolean {
	return Number.isInteger(number)
}

export function numberFormat(num: number, separator: {
	thousand?: string
	decimal?: string
} = {}): string {
	const {
		thousand = ',',
		decimal = '.'
	} = separator
	const sign = num < 0 ? '-' : ''
	const absNumber = mathAbs(num)
	const parts = stringSplit(numberToRealDigits(absNumber), '.')
	const integerPart = stringReplace(parts[0], /\B(?=(\d{3})+(?!\d))/g, thousand)

	let decimal_part = ''
	if (arrayLength(parts) > 1) decimal_part = parts[1]

	return `${sign}${integerPart}${stringLength(decimal_part) > 0 ? decimal : ''}${decimal_part}`
}

export function numberToString(num: number, radix?: number): string {
	return num.toString(radix)
}

export function numberParse(num: string, isInt?: boolean, radix?: number): number {
	return isInt
		? Number.parseInt(num, radix)
		: Number.parseFloat(num)
}

/**
 * Convert input with scientific notation to real digit.
 * For example: `2.34e-3` become `0.00234`
 *
 * @param input
 * @returns
 */
export function numberToRealDigits(input: number): string {
	const regex = /([+-]?)(\d+)(\.\d+)?[Ee]([+\-])?(\d+)/
	const str: string = numberToString(input)

	const result = stringMatch(str, regex)
	if (!result) return str

	const sign = result[1]
	const num = result[2]
	const decimal = result[3] ?? '.0'
	const expSign = result[4]
	const exponent = numberParse(result[5], true)

	if (expSign == '-') return (sign
		+ '0.'
		+ stringRepeat('0', exponent - 1)
		+ num
		+ stringSubstring(decimal, 1)
	)

	const leftover = exponent - (stringLength(decimal) - 1)
	return (sign
		+ num
		+ stringSubstring(decimal, 1, exponent + 1)
		+ (leftover <= 0
			? '.' + stringSubstring(decimal, exponent + 1)
			: stringRepeat('0', leftover)
		)
	)
}

export function binaryToFloat(input: string, bit: 32 | 64 = 64): number {
	if (regexTest(/^[10]+$/, input)) throw Error('input not valid')

	if (stringLength(input) > bit) input = stringSubstring(input, 0, bit)
	if (stringLength(input) < bit) input = (stringRepeat('0', bit - stringLength(input))) + input

	const sign = stringSubstring(input, 0, 1)
	let exponent = stringSubstring(input, 1, bit == 32 ? 9 : 12)
	let mantissa = stringSubstring(input, bit == 32 ? 9 : 12)
	let carry = 0

	// convert mantissa from bits to real numbers
	for (let i = 1; i <= stringLength(mantissa); i++) {
		if (stringSubstring(mantissa, i - 1, i) != '1') continue

		carry = carry + mathPow(2, -i)
	}

	// mantissa in real numbers (base10)
	mantissa = numberToString(carry)
	exponent = numberToString(numberParse(exponent, true, 2))

	// denormalized
	if (exponent == '0') return (
		mathPow(-1, numberParse(sign, true))
		* mathPow(2, (bit == 32 ? -126 : -1022))
		* numberParse(mantissa)
	)

	return (
		mathPow(-1, numberParse(sign, true))
		* mathPow(2, numberParse(exponent, true) - (bit == 32 ? 127 : 1023))
		* (1 + numberParse(mantissa))
	)
}

export function numberToBinary(input: number, bit: 32 | 64 = 64): string {
	const sign = input < 0 ? '1' : '0'
	let n = numberToString(input, 2)

	// Make sure only float with decimal
	if (!regexTest(/\./, n)) return n

	let mantissa = numberToString(mathAbs(input), 2)
	const index_dot = stringIndexOf(mantissa, '.')
	const index_one = stringIndexOf(mantissa, '1')
	const substract_for_exp = (index_dot < index_one
		? index_dot - index_one
		: index_dot - (index_one + 1)
	)
	let more = false
	let less = false
	let exponent: number | string = 0
	if (index_one != -1) {
		exponent = substract_for_exp + (bit == 32 ? 127 : 1023)
		if (exponent > (bit == 32 ? 255 : 4095)) {
			more = true
			exponent = 255
		} else if (exponent < 0) {
			less = true
			exponent = 0
		}
		exponent = numberToString(exponent, 2)
	}
	else exponent = '0'

	if (stringLength(exponent) < (bit == 32 ? 8 : 11)) {
		exponent = (stringRepeat('0', (bit == 32 ? 8 : 11) - stringLength(exponent))) + exponent
	}

	if (index_one == -1) mantissa = stringSubstring(mantissa, index_dot + 1)
	else {
		if (index_dot < index_one) {
			if (less) mantissa = stringSubstring(mantissa, index_dot + (bit == 32 ? 127 : 1023))
			else mantissa = stringSubstring(mantissa, index_one + 1)
		}

		else if (index_dot > index_one) {
			if (more) mantissa = stringSubstring(
				mantissa,
				index_dot - (bit == 32 ? 127 : 1023),
				index_dot + 1
			);
			else mantissa = (
				stringSubstring(mantissa, index_one + 1, index_dot)
				+ stringSubstring(mantissa, index_dot + 1)
			)
		}
	}

	return stringSubstring((sign + exponent + mantissa), 0, bit == 32 ? 32 : 64)
}