import * as Constant from "../shared/constant.enum.js"
import * as Settings from "./settings.js"
import * as Pages from '../shared/pages.enum.js'
import * as Scientific from "../features/scientific.js"
import { countString, reverseString } from "@/utils/string"
import { Math_acot, Math_acoth, Math_acsc, Math_acsch, Math_asec, Math_asech, Math_cot, Math_coth, Math_csc, Math_csch, Math_sec, Math_sech } from "@/utils/math"
import { numberToRealDigits } from "@/utils/number"
import { AngleUnits, ConverterUnit, TemperatureUnits } from "../shared/units.js"
import { ConverterTypes, ScientificAngleTypes } from "../shared/calculator.js"

export function repairInput(input: string): string {
	const settings = Settings.Signals
	const openBracketCount = countString(input, /\(/g)
	const closeBracketCount = countString(input, /\)/g)

	// '234))' => '((234))'
	if (openBracketCount < closeBracketCount) {
		input = "(".repeat(closeBracketCount - openBracketCount) + input
	}

	// '((234' => '((234))'
	else if (openBracketCount > closeBracketCount) {
		input = input + ")".repeat(openBracketCount - closeBracketCount)
	}

	// '123 456 789' => '123456789'
	input = input.replace(/\s/g, '')

	// '123,456,789' => '123456789'
	input = input.replaceAll(settings.groupingFormat(), '')

	// '123456,789' => '123456.789'
	input = input.replaceAll(settings.decimalFormat(), '.')

	// '.234' => '0.234'
	input = input.replace(/(?<!\d)\.\d+/g, (s) => '0' + s)

	// '123.' => '123'
	input = input.replace(/(\d+)\.(?!\d)/g, (_, grp1) => grp1)

	// '1.23E+5' => '1.23×100000'
	input = input.replace(
		/(\d+(?:\.\d+)?)E([+\-])?(\d+)/g,
		(_, group1, group2, group3) => {
			const isMinus = group2 == '-'
			const power = Number.parseInt(group3)
			return group1
				+ (power > 0
					? (isMinus
						? Constant.DIVISION_CHAR
						: Constant.MULTIPLY_CHAR
					) + '1' + '0'.repeat(power)
					: ''
				)
		}
	)

	// 'e×2×ceil(' => 'e×2×c\eil('
	const nonEulerEscapeRegex = [
		/(ceil|sec)\(/g,
		/\\e/g, // use in the last part
	]
	input = input.replace(nonEulerEscapeRegex[0], (r) => r.replace('e', '\\e'))

	// '123(456)' => '123×(456)'
	const implicitMultiplyRegex = [
		new RegExp(String.raw`(${Constant.NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${Constant.FUNCTION_REGEX}(?=\())`, 'g'),
		/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
	]
	let iterator = 0
	while (
		implicitMultiplyRegex[0].test(input)
		|| implicitMultiplyRegex[1].test(input)
	) {
		input = input.replace(
			implicitMultiplyRegex[0],
			(_, group1, group2) => group1 + Constant.MULTIPLY_CHAR + group2
		)
		input = input.replace(
			implicitMultiplyRegex[1],
			(_, group1, group2) => group1 + Constant.MULTIPLY_CHAR + group2
		)

		++iterator

		// I think the iterator will less than 5. But this is just to catch error in regex
		if (iterator > 20) {
			console.warn(
				'Iterator exceeded maximum value',
				'iterator:', iterator,
				'input:', input
			)
			break
		}
	}

	// 'e' => '2.718281828459045'
	input = input.replace(/(?<!\\)e/g, Math.E.toString())

	// 'π' => '3.141592653589793'
	input = input.replace(/π/g, Math.PI.toString())

	// 'c\eil(12)' => 'ceil(12)'
	input = input.replace(nonEulerEscapeRegex[1], 'e')

	return input
}

export function convertUnit(
	input: number,
	type: ConverterTypes,
	inputUnit: ConverterUnit,
	outputUnit: ConverterUnit,
): number {
	const isEqual = (unit: ConverterUnit, from = inputUnit) => from.equals(unit)
	if (type == ConverterTypes.Angle) {
		let degree: number = 0
		if (isEqual(AngleUnits.degree)) degree = input
		else if (isEqual(AngleUnits.radian)) degree = input * 180 / Math.PI
		else if (isEqual(AngleUnits.gradian)) degree = input * 9 / 10

		if (isEqual(AngleUnits.degree)) return degree
		if (isEqual(AngleUnits.radian)) return degree * Math.PI / 180
		if (isEqual(AngleUnits.gradian)) return degree * 10 / 9

		return input
	}
	if (type == ConverterTypes.Temperature) {
		let celsius: number = 0
		if (isEqual(TemperatureUnits.celcius)) celsius = input
		else if (isEqual(TemperatureUnits.kelvin)) celsius = input - 273.15
		else if (isEqual(TemperatureUnits.reamur)) celsius = input * 5 / 4
		else if (isEqual(TemperatureUnits.fahrenheit)) celsius = (input - 32) * 5 / 9
		else if (isEqual(TemperatureUnits.romer)) celsius = (input - 7.5) * 40 / 21
		else if (isEqual(TemperatureUnits.rankine)) celsius = (input - 491.67) * 5 / 9
		else if (isEqual(TemperatureUnits.delisle)) celsius = 100 - input * 2 / 3

		if (isEqual(TemperatureUnits.celcius, outputUnit)) return celsius
		if (isEqual(TemperatureUnits.kelvin, outputUnit)) return celsius + 273.15
		if (isEqual(TemperatureUnits.reamur, outputUnit)) return celsius * 4 / 5
		if (isEqual(TemperatureUnits.fahrenheit, outputUnit)) return celsius * 9 / 5 + 32
		if (isEqual(TemperatureUnits.romer, outputUnit)) return celsius * 21 / 40 + 7.5
		if (isEqual(TemperatureUnits.rankine, outputUnit)) return (celsius + 273.15) * 9 / 5
		if (isEqual(TemperatureUnits.delisle, outputUnit)) return (100 - celsius) * 3 / 2

		return input
	}

	return input * outputUnit.value / inputUnit.value
}

export function calculate(input: string): string {
	const pages = Settings.Signals.page()
	const fnRegex = new RegExp(String.raw`(${Constant.FUNCTION_REGEX})\(([+-]?${Constant.NUMBER_REGEX})\)`)
	const bracketRegex = new RegExp(String.raw`(?<!${Constant.FUNCTION_REGEX})\(([+-]?${Constant.NUMBER_REGEX})\)`)
	const sqrtRegex       = /√([-+]?\d+(?:\.\d+)?)/g
	const percentRegex    = /(\d+(?:\.\d+)?)%/g
	const factorialRegex  = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
	const expRegex        = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
	const expReverseRegex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
	const lshRshRegex     = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
	const andRegex        = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
	const orRegex         = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
	const xorRegex        = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
	const addSubRegex     = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
	const divMulModRegex  = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
	const fnOperation = (input: string) => input.replace(fnRegex, (_, fnName, value) => {
		let parsedValue: number = Number.parseFloat(value)
		const angleToRadian = (value: number) => {
			if (pages !== Pages.Scientific) return value

			const angle = Scientific.Signals.angle()
			let unit: ConverterUnit = AngleUnits.radian
			if (angle === ScientificAngleTypes.Degree) unit = AngleUnits.degree
			else if (angle === ScientificAngleTypes.Gradian) unit = AngleUnits.gradian

			return convertUnit(value, ConverterTypes.Angle, unit, AngleUnits.radian)
		}
		const radianToAngle = (value: number) => {
			if (pages !== Pages.Scientific) return value

			const angle = Scientific.Signals.angle()
			let unit: ConverterUnit = AngleUnits.radian
			if (angle == ScientificAngleTypes.Degree) unit = AngleUnits.degree
			else if (angle == ScientificAngleTypes.Gradian) unit = AngleUnits.gradian

			return convertUnit(value, ConverterTypes.Angle, AngleUnits.radian, unit)
		}

		switch (fnName) {
		case 'not'  : parsedValue = ~parsedValue; break
		case 'abs'  : parsedValue = Math.abs(parsedValue); break
		case 'log'  : parsedValue = Math.log10(parsedValue); break
		case 'ln'   : parsedValue = Math.log(parsedValue); break
		case 'ceil' : parsedValue = Math.ceil(parsedValue); break
		case 'floor': parsedValue = Math.floor(parsedValue); break
		case 'round': parsedValue = Math.round(parsedValue); break
		case 'sqrt' : parsedValue = Math.sqrt(parsedValue); break
		case 'sin'  : parsedValue = Math.sin(angleToRadian(parsedValue)); break
		case 'cos'  : parsedValue = Math.cos(angleToRadian(parsedValue)); break
		case 'tan'  : parsedValue = Math.tan(angleToRadian(parsedValue)); break
		case 'csc'  : parsedValue = Math_csc(angleToRadian(parsedValue)); break
		case 'sec'  : parsedValue = Math_sec(angleToRadian(parsedValue)); break
		case 'cot'  : parsedValue = Math_cot(angleToRadian(parsedValue)); break
		case 'sinh' : parsedValue = Math.sinh(angleToRadian(parsedValue)); break
		case 'cosh' : parsedValue = Math.cosh(angleToRadian(parsedValue)); break
		case 'tanh' : parsedValue = Math.tanh(angleToRadian(parsedValue)); break
		case 'csch' : parsedValue = Math_csch(angleToRadian(parsedValue)); break
		case 'sech' : parsedValue = Math_sech(angleToRadian(parsedValue)); break
		case 'coth' : parsedValue = Math_coth(angleToRadian(parsedValue)); break
		case 'asin' : parsedValue = radianToAngle(Math.asin(parsedValue)); break
		case 'acos' : parsedValue = radianToAngle(Math.acos(parsedValue)); break
		case 'atan' : parsedValue = radianToAngle(Math.atan(parsedValue)); break
		case 'acsc' : parsedValue = radianToAngle(Math_acsc(parsedValue)); break
		case 'asec' : parsedValue = radianToAngle(Math_asec(parsedValue)); break
		case 'acot' : parsedValue = radianToAngle(Math_acot(parsedValue)); break
		case 'asinh': parsedValue = radianToAngle(Math.asinh(parsedValue)); break
		case 'acosh': parsedValue = radianToAngle(Math.acosh(parsedValue)); break
		case 'atanh': parsedValue = radianToAngle(Math.atanh(parsedValue)); break
		case 'acsch': parsedValue = radianToAngle(Math_acsch(parsedValue)); break
		case 'asech': parsedValue = radianToAngle(Math_asech(parsedValue)); break
		case 'acoth': parsedValue = radianToAngle(Math_acoth(parsedValue)); break
		}
		return numberToRealDigits(parsedValue)
	})
	input = repairInput(input)
	try {
		while (true) {
			let hasOperation = false

			// function operation
			while (fnRegex.test(input)) {
				hasOperation = true
				input = fnOperation(input)
			}

			// remove brackets
			while (bracketRegex.test(input)) {
				hasOperation = true
				input = input.replace(bracketRegex, (_, num1) => num1)
			}

			// square root operation
			while (sqrtRegex.test(input)){
				hasOperation = true
				input = input.replace(sqrtRegex, (_, num1) => {
					const parsedValue = Number.parseFloat(num1)
					if (parsedValue < 0) throw Error()
					return numberToRealDigits(Math.sqrt(parsedValue))
				})
			}

			// percentage operation
			while (percentRegex.test(input)){
				hasOperation = true
				input = input.replace(
					percentRegex,
					(_, num1) => numberToRealDigits(Number.parseFloat(num1) / 100)
				)
			}

			// factorial operation
			while (factorialRegex.test(input)){
				hasOperation = true
				input = input.replace(factorialRegex, (_, num1) => {
					let n = Number.parseFloat(num1)
					if (/\./.test(numberToRealDigits(n)) || n < 0) throw Error()

					let result = 1
					while (n > 0) {
						result *= n
						n--
					}
					return numberToRealDigits(result)
				})
			}

			// exponential operation
			const match = input.match(expRegex)
			if (match) {
				hasOperation = true
				input = reverseString(input)

				while (expReverseRegex.test(input)) {
					input = input.replace(
						expReverseRegex,
						(_, num2, num1) => reverseString(numberToRealDigits(Math.pow(
							Number.parseFloat(reverseString(num1)),
							Number.parseFloat(reverseString(num2))
						)))
					)
				}
				input = reverseString(input)
			}

			// division & multiplication & modulus operation
			while (divMulModRegex.test(input)) {
				hasOperation = true
				input = input.replace(divMulModRegex, (_, num1, operator, num2) => {
					if (operator == 'mod') return numberToRealDigits(Number.parseFloat(num1) % Number.parseFloat(num2))
					else if (/[*×]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) * Number.parseFloat(num2))
					else if (/[\/÷]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) / Number.parseFloat(num2))
					return _
				})
			}


			// addition & substraction operation
			while (addSubRegex.test(input)) {
				hasOperation = true
				input = input.replace(addSubRegex, (_, num1, operator, num2) => {
					if (operator == '+') return numberToRealDigits(Number.parseFloat(num1) + Number.parseFloat(num2))
					if (operator == '-') return numberToRealDigits(Number.parseFloat(num1) - Number.parseFloat(num2))
					return _
				})
			}

			// shifting operation
			while (lshRshRegex.test(input)) {
				hasOperation = true
				input = input.replace(lshRshRegex, (_, num1, operator, num2) => {
					const $num1: number = Number.parseFloat(num1)
					const $num2: number = Number.parseFloat(num2)
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					if (/^(lsh|<<)$/.test(operator)) return numberToRealDigits($num1 << $num2)
					if (/^(rsh|>>)$/.test(operator)) return numberToRealDigits($num1 >> $num2)
					return _
				})
			}

			// and operation
			while (andRegex.test(input)) {
				hasOperation = true
				input = input.replace(andRegex, (_, num1, num2) =>  {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) & Number.parseFloat(num2))
				})
			}

			// xor operation
			while (xorRegex.test(input)) {
				hasOperation = true
				input = input.replace(xorRegex, (_, num1, num2) => {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) ^ Number.parseFloat(num2))
				})
			}

			// or operation
			while (orRegex.test(input)) {
				hasOperation = true
				input = input.replace(orRegex, (_, num1, num2) => {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) | Number.parseFloat(num2))
				})
			}

			if (!hasOperation) break
		}
	} catch { input = '' }
	return input
}