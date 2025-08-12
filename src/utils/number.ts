export function safeNumber(num: number, fallback: number = 0): number {
	return isNumberNotDefined(num)? fallback : num
}

export function isNumberNotDefined(num: number): boolean {
	return Number.isNaN(num) as boolean || !Number.isFinite(num)
}

export function isNumberDefined(num: number): boolean {
	return !isNumberNotDefined(num)
}

export function adjustDecimalNumber(num: number, digits: number): number {
	return Number.parseFloat(num.toFixed(digits))
}

export function formatNumber(num: number, separator: {
	thousand?: string
	decimal?: string
} = {}): string {
	const {
		thousand = ',',
		decimal = '.'
	} = separator
	const sign = num < 0 ? '-' : ''
	const absNumber = Math.abs(num)
	const parts = numberToRealDigits(absNumber).split('.')
	const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousand)

	let decimalPart = ''
	if (parts.length > 1) decimalPart = parts[1]

	return `${sign}${integerPart}${decimalPart.length > 0 ? decimal : ''}${decimalPart}`
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
	const str: string = input.toString()

	const result = str.match(regex)
	if (!result) return str

	const sign = result[1]
	const num = result[2]
	const decimal = result[3] ?? '.0'
	const expSign = result[4]
	const exponent = Number.parseInt(result[5])

	if (expSign === '-') return (sign
		+ '0.'
		+ '0'.repeat(exponent - 1)
		+ num
		+ decimal.substring(1)
	)

	const leftover = exponent - (decimal.length - 1)
	return (sign
		+ num
		+ decimal.substring(1, exponent + 1)
		+ (leftover <= 0
			? '.' + decimal.substring(exponent + 1)
			: '0'.repeat(leftover)
		)
	)
}

export function binaryToFloat(input: string, bit: 32 | 64 = 64): number {
	if (/^[10]+$/.test(input)) throw Error('input not valid')

	if (input.length > bit) input = input.substring(0, bit)
	if (input.length < bit) input = ('0'.repeat(bit - input.length)) + input

	const sign = input.substring(0, 1)
	let exponent = input.substring(1, bit == 32 ? 9 : 12)
	let mantissa = input.substring(bit == 32 ? 9 : 12)
	let carry = 0

	// convert mantissa from bits to real numbers
	for (let i = 1; i <= mantissa.length; i++) {
		if (mantissa.substring(i - 1, i) != '1') continue

		carry = carry + Math.pow(2, -i)
	}

	// mantissa in real numbers (base10)
	mantissa = carry.toString()
	exponent = Number.parseInt(exponent, 2).toString()

	// denormalized
	if (exponent === '0') return (
		Math.pow(-1, Number.parseInt(sign))
		* Math.pow(2, (bit == 32 ? -126 : -1022))
		* Number.parseFloat(mantissa)
	)

	return (
		Math.pow(-1, Number.parseInt(sign))
		* Math.pow(2, Number.parseInt(exponent) - (bit == 32 ? 127 : 1023))
		* (1 + Number.parseFloat(mantissa))
	)
}

export function numberToBinary(input: number, bit: 32 | 64 = 64): string {
	const sign = input < 0 ? '1' : '0'
	let n = input.toString(2)

	// Make sure only float with decimal
	if (!/\./.test(n)) return n

	let mantissa = Math.abs(input).toString(2)
	const indexDot =  mantissa.indexOf('.')
	const indexOne = mantissa.indexOf('1')
	const subtractForExp = (indexDot < indexOne
		? indexDot - indexOne
		: indexDot - (indexOne + 1)
	)
	let more = false
	let less = false
	let exponent: number | string = 0
	if (indexOne !== -1) {
		exponent = subtractForExp + (bit == 32 ? 127 : 1023)
		if (exponent > (bit == 32 ? 255 : 4095)) {
			more = true
			exponent = 255
		}
		else if (exponent < 0) {
			less = true
			exponent = 0
		}
		exponent = exponent.toString(2)
	}
	else exponent = '0'

	if (exponent.length < (bit === 32 ? 8 : 11)) {
		exponent = ('0'.repeat((bit === 32 ? 8 : 11) - exponent.length)) + exponent
	}

	if (indexOne == -1) mantissa = mantissa.substring(indexDot + 1)
	else {
		if (indexDot < indexOne) {
			if (less) mantissa = mantissa.substring(indexDot + (bit === 32 ? 127 : 1023))
			else mantissa = mantissa.substring(indexOne + 1)
		}

		else if (indexDot > indexOne) {
			if (more) mantissa = mantissa.substring(
				indexDot - (bit === 32 ? 127 : 1023),
				indexDot + 1
			);
			else mantissa = (
				mantissa.substring(indexOne + 1, indexDot)
				+ mantissa.substring(indexDot + 1)
			)
		}
	}

	return (sign + exponent + mantissa).substring(0, bit == 32 ? 32 : 64)
}