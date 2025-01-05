import { array_length } from "./array"
import { object_has_value } from "./object"
import { math_abs, math_pow } from "./math"
import { regex_test } from "./regex"
import { string_indexof, string_length, string_match, string_repeat, string_replace, string_split, string_substring } from "./string"

export function number_safe(num: number, fallback: number = 0): number {
	return number_is_not_defined(num)? fallback : num
}

/**
 * Returns a string representing a number in fixed-point notation.
 * @param fraction_digits Number of digits after the decimal point. Must be in the range 0 - 20,
 * inclusive.
 */
export function number_tofixed(num: number, fraction_digits?: number): string {
	return num.toFixed(fraction_digits)
}

export function number_is_not_defined(num: number): boolean {
	return number_is_nan(num) as boolean || number_is_infinite(num)
}

export function number_is_defined(num: number): boolean {
	return !number_is_not_defined(num)
}

export function number_is_finite(num: number): boolean {
	return Number.isFinite(num)
}

export function number_is_infinite(num: number): boolean {
	return !number_is_finite(num)
}

export function number_is_nan(x: number, fallback?: number): boolean | number {
	if (object_has_value(fallback)) {
		if (Number.isNaN(x)) return fallback!
		return x
	}
	return Number.isNaN(x)
}

export function number_is_int(number: unknown): boolean {
	return Number.isInteger(number)
}

export function number_format(num: number, separator: {
	thousand?: string
	decimal?: string
} = {}): string {
	const {
		thousand = ',',
		decimal = '.'
	} = separator
	const sign = num < 0 ? '-' : ''
	const abs_number = math_abs(num)
	const parts = string_split(number_to_real_digit(abs_number), '.')
	const integer_part = string_replace(parts[0], /\B(?=(\d{3})+(?!\d))/g, thousand)

	let decimal_part = ''
	if (array_length(parts) > 1) decimal_part = parts[1]

	return `${sign}${integer_part}${string_length(decimal_part) > 0 ? decimal : ''}${decimal_part}`
}

/**
 * Returns a string representation of an object.
 * @param radix Specifies a radix for converting numeric values to strings. This value is only used
 * for numbers.
 */
export function number_to_string(num: number, radix?: number): string {
	return num.toString(radix)
}

export function number_parse(num: string, is_integer?: boolean, radix?: number): number {
	return is_integer
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
export function number_to_real_digit(input: number): string {
	const regex = /([+-]?)(\d+)(\.\d+)?[Ee]([+\-])?(\d+)/
	const str: string = number_to_string(input)

	const result = string_match(str, regex)
	if (!result) return str

	const sign = result[1]
	const num = result[2]
	const decimal = result[3] ?? '.0'
	const exp_sign = result[4]
	const exponent = number_parse(result[5], true)

	if (exp_sign == '-') return (sign
		+ '0.'
		+ string_repeat('0', exponent - 1)
		+ num
		+ string_substring(decimal, 1)
	)

	const leftover = exponent - (string_length(decimal) - 1)
	return (sign
		+ num
		+ string_substring(decimal, 1, exponent + 1)
		+ (leftover <= 0
			? '.' + string_substring(decimal, exponent + 1)
			: string_repeat('0', leftover)
		)
	)
}

export function binary_to_float(input: string, bit: 32 | 64 = 64): number {
	if (regex_test(/^[10]+$/, input)) throw Error('input not valid')

	if (string_length(input) > bit) input = string_substring(input, 0, bit)
	if (string_length(input) < bit) input = (string_repeat('0', bit - string_length(input))) + input

	const sign = string_substring(input, 0, 1)
	let exponent = string_substring(input, 1, bit == 32 ? 9 : 12)
	let mantissa = string_substring(input, bit == 32 ? 9 : 12)
	let carry = 0

	// convert mantissa from bits to real numbers
	for (let i = 1; i <= string_length(mantissa); i++) {
		if (string_substring(mantissa, i - 1, i) != '1') continue

		carry = carry + math_pow(2, -i)
	}

	// mantissa in real numbers (base10)
	mantissa = number_to_string(carry)
	exponent = number_to_string(number_parse(exponent, true, 2))

	// denormalized
	if (exponent == '0') return (
		math_pow(-1, number_parse(sign, true))
		* math_pow(2, (bit == 32 ? -126 : -1022))
		* number_parse(mantissa)
	)

	return (
		math_pow(-1, number_parse(sign, true))
		* math_pow(2, number_parse(exponent, true) - (bit == 32 ? 127 : 1023))
		* (1 + number_parse(mantissa))
	)
}

export function number_to_binary(input: number, bit: 32 | 64 = 64): string {
	const sign = input < 0 ? '1' : '0'
	let n = number_to_string(input, 2)

	// Make sure only float with decimal
	if (!regex_test(/\./, n)) return n

	let mantissa = number_to_string(math_abs(input), 2)
	const index_dot = string_indexof(mantissa, '.')
	const index_one = string_indexof(mantissa, '1')
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
		exponent = number_to_string(exponent, 2)
	}
	else exponent = '0'

	if (string_length(exponent) < (bit == 32 ? 8 : 11)) {
		exponent = (string_repeat('0', (bit == 32 ? 8 : 11) - string_length(exponent))) + exponent
	}

	if (index_one == -1) mantissa = string_substring(mantissa, index_dot + 1)
	else {
		if (index_dot < index_one) {
			if (less) mantissa = string_substring(mantissa, index_dot + (bit == 32 ? 127 : 1023))
			else mantissa = string_substring(mantissa, index_one + 1)
		}

		else if (index_dot > index_one) {
			if (more) mantissa = string_substring(
				mantissa,
				index_dot - (bit == 32 ? 127 : 1023),
				index_dot + 1
			);
			else mantissa = (
				string_substring(mantissa, index_one + 1, index_dot)
				+ string_substring(mantissa, index_dot + 1)
			)
		}
	}

	return string_substring((sign + exponent + mantissa), 0, bit == 32 ? 32 : 64)
}