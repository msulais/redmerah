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

export function formatNumber(num: number, length = 3, separator: {
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
	const integerPart = parts[0].replace(new RegExp(`\\B(?=(\\d{${length}})+(?!\\d))`, "g"), thousand)

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
    const str = input.toString()
	if (!str.includes('e') && !str.includes('E')) {
		return str
	}

	let [coefficient, exponentStr] = str.split(/[eE]/)
	let exponent = Number.parseInt(exponentStr)
	const decimalIndex = coefficient.indexOf('.')
	if (decimalIndex !== -1) {
		const fractionalDigits = coefficient.length - decimalIndex - 1
		exponent -= fractionalDigits
		coefficient = coefficient.replace('.', '')
	}

	if (exponent > 0) {
		return coefficient + '0'.repeat(exponent)
	}

	const absExponent = Math.abs(exponent)
	if (absExponent >= coefficient.length) {
		return [
			'0.',
			'0'.repeat(absExponent - coefficient.length),
			coefficient
		].join('')
	}

	const insertionPoint = coefficient.length - absExponent
	return [
		coefficient.slice(0, insertionPoint),
		'.',
		coefficient.slice(insertionPoint)
	].join('')
}

export function binaryToFloat(input: string, bit: 32 | 64 = 64): number {
	if (/[^01]/.test(input)) {
		console.error('Input not valid: must contain only 0 and 1')
		return 0
	}

	const paddedInput = input.padStart(bit, '0')
	const buffer = new ArrayBuffer(8)
	const view = new DataView(buffer)
	if (bit === 32) {
		const intVal = parseInt(paddedInput, 2)
		view.setUint32(0, intVal)
		return view.getFloat32(0)
	}

	const bigIntVal = BigInt("0b" + paddedInput)
	view.setBigUint64(0, bigIntVal)
	return view.getFloat64(0)
}

export function numberToBinary(input: number, bit: 32 | 64 = 64): string {
	if (input % 1 === 0) {
		return input.toString(2)
	}

    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)
	if (bit !== 32 && bit !== 64) {
		bit = 64
	}

	let binary = ''
    if (bit === 32) {
        view.setFloat32(0, input)
        binary = view.getUint32(0).toString(2)
    }
	else {
		view.setFloat64(0, input)
		binary = view.getBigUint64(0).toString(2)
	}

	return binary.padStart(bit, '0')
}