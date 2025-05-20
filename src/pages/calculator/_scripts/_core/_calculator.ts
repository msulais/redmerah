import { stringCount, stringReverse } from "@/utils/string"
import { DIVISION_CHAR, FUNCTION_REGEX, MULTIPLY_CHAR, NUMBER_REGEX } from "../_shared/_constant"
import { SettingsStore } from "./_settings"
import { mathACot, mathACotH, mathACsc, mathACscH, mathASec, mathASecH, mathCot, mathCotH, mathCsc, mathCscH, mathSec, mathSecH } from "@/utils/math"
import { numberToRealDigits } from "@/utils/number"
import { AngleUnits, ConverterUnit, TemperatureUnits } from "../_shared/_units"
import { NavigationStore } from "./_navigation"
import { ScientificStore } from "../_features/_scientific"
import { ConverterType, Pages, ScientificAngleType } from "../_shared/_enums"

export function repairInput(input: string): string {
	const settings = SettingsStore.value
	const openBracketCount = stringCount(input, /\(/g)
	const closeBracketCount = stringCount(input, /\)/g)

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
	input = input.replaceAll(settings.groupingFormat, '')

	// '123456,789' => '123456.789'
	input = input.replaceAll(settings.decimalFormat, '.')

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
						? DIVISION_CHAR
						: MULTIPLY_CHAR
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
		new RegExp(String.raw`(${NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${FUNCTION_REGEX}(?=\())`, 'g'),
		/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
	]
	let iterator = 0
	while (
		implicitMultiplyRegex[0].test(input)
		|| implicitMultiplyRegex[1].test(input)
	) {
		input = input.replace(
			implicitMultiplyRegex[0],
			(_, group1, group2) => group1 + MULTIPLY_CHAR + group2
		)
		input = input.replace(
			implicitMultiplyRegex[1],
			(_, group1, group2) => group1 + MULTIPLY_CHAR + group2
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
	type: ConverterType,
	inputUnit: ConverterUnit,
	outputUnit: ConverterUnit,
): number {
	if (type == ConverterType.angle) {
		let degree: number = 0
		if (inputUnit.equals(AngleUnits.degree)) degree = input
		else if (inputUnit.equals(AngleUnits.radian)) degree = input * 180 / Math.PI
		else if (inputUnit.equals(AngleUnits.gradian)) degree = input * 9 / 10

		if (outputUnit.equals(AngleUnits.degree)) return degree
		if (outputUnit.equals(AngleUnits.radian)) return degree * Math.PI / 180
		if (outputUnit.equals(AngleUnits.gradian)) return degree * 10 / 9

		return input
	}
	if (type == ConverterType.temperature) {
		let celsius: number = 0
		if (inputUnit.equals(TemperatureUnits.celcius)) celsius = input
		else if (inputUnit.equals(TemperatureUnits.kelvin)) celsius = input - 273.15
		else if (inputUnit.equals(TemperatureUnits.reamur)) celsius = input * 5 / 4
		else if (inputUnit.equals(TemperatureUnits.fahrenheit)) celsius = (input - 32) * 5 / 9
		else if (inputUnit.equals(TemperatureUnits.romer)) celsius = (input - 7.5) * 40 / 21
		else if (inputUnit.equals(TemperatureUnits.rankine)) celsius = (input - 491.67) * 5 / 9
		else if (inputUnit.equals(TemperatureUnits.delisle)) celsius = 100 - input * 2 / 3

		if (outputUnit.equals(TemperatureUnits.celcius)) return celsius
		if (outputUnit.equals(TemperatureUnits.kelvin)) return celsius + 273.15
		if (outputUnit.equals(TemperatureUnits.reamur)) return celsius * 4 / 5
		if (outputUnit.equals(TemperatureUnits.fahrenheit)) return celsius * 9 / 5 + 32
		if (outputUnit.equals(TemperatureUnits.romer)) return celsius * 21 / 40 + 7.5
		if (outputUnit.equals(TemperatureUnits.rankine)) return (celsius + 273.15) * 9 / 5
		if (outputUnit.equals(TemperatureUnits.delisle)) return (100 - celsius) * 3 / 2

		return input
	}

	console.log(input + '\n', outputUnit, '\n', inputUnit, '\n', input * outputUnit.value / inputUnit.value)
	return input * outputUnit.value / inputUnit.value
}

export function calculate(input: string): string {
	const pages = NavigationStore.value
	input = repairInput(input)
	try {
		while (true) {
			let hasOperation = false

			// function operation
			const functionRegex = new RegExp(String.raw`(${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (functionRegex.test(input)) {
				hasOperation = true
				input = input.replace(functionRegex, (_, fnName, value) => {
					let parsedValue: number = Number.parseFloat(value)
					const angleToRadian = (value: number) => {
						if (pages.page !== Pages.scientific) return value

						const angle = ScientificStore.value.angle
						let unit: ConverterUnit = AngleUnits.radian
						if (angle === ScientificAngleType.DEG) unit = AngleUnits.degree
						else if (angle === ScientificAngleType.GRAD) unit = AngleUnits.gradian

						return convertUnit(value, ConverterType.angle, unit, AngleUnits.radian)
					}
					const radianToAngle = (value: number) => {
						if (pages.page !== Pages.scientific) return value

						const angle = ScientificStore.value.angle
						let unit: ConverterUnit = AngleUnits.radian
						if (angle == ScientificAngleType.DEG) unit = AngleUnits.degree
						else if (angle == ScientificAngleType.GRAD) unit = AngleUnits.gradian

						return convertUnit(value, ConverterType.angle, AngleUnits.radian, unit)
					}

					switch (fnName) {
					case 'not': parsedValue = ~parsedValue; break
					case 'abs': parsedValue = Math.abs(parsedValue); break
					case 'log': parsedValue = Math.log10(parsedValue); break
					case 'ln': parsedValue = Math.log(parsedValue); break
					case 'ceil': parsedValue = Math.ceil(parsedValue); break
					case 'floor': parsedValue = Math.floor(parsedValue); break
					case 'round': parsedValue = Math.round(parsedValue); break
					case 'sqrt': parsedValue = Math.sqrt(parsedValue); break
					case 'sin': parsedValue = Math.sin(angleToRadian(parsedValue)); break
					case 'cos': parsedValue = Math.cos(angleToRadian(parsedValue)); break
					case 'tan': parsedValue = Math.tan(angleToRadian(parsedValue)); break
					case 'csc': parsedValue = mathCsc(angleToRadian(parsedValue)); break
					case 'sec': parsedValue = mathSec(angleToRadian(parsedValue)); break
					case 'cot': parsedValue = mathCot(angleToRadian(parsedValue)); break
					case 'sinh': parsedValue = Math.sinh(angleToRadian(parsedValue)); break
					case 'cosh': parsedValue = Math.cosh(angleToRadian(parsedValue)); break
					case 'tanh': parsedValue = Math.tanh(angleToRadian(parsedValue)); break
					case 'csch': parsedValue = mathCscH(angleToRadian(parsedValue)); break
					case 'sech': parsedValue = mathSecH(angleToRadian(parsedValue)); break
					case 'coth': parsedValue = mathCotH(angleToRadian(parsedValue)); break
					case 'asin': parsedValue = radianToAngle(Math.asin(parsedValue)); break
					case 'acos': parsedValue = radianToAngle(Math.acos(parsedValue)); break
					case 'atan': parsedValue = radianToAngle(Math.atan(parsedValue)); break
					case 'acsc': parsedValue = radianToAngle(mathACsc(parsedValue)); break
					case 'asec': parsedValue = radianToAngle(mathASec(parsedValue)); break
					case 'acot': parsedValue = radianToAngle(mathACot(parsedValue)); break
					case 'asinh': parsedValue = radianToAngle(Math.asinh(parsedValue)); break
					case 'acosh': parsedValue = radianToAngle(Math.acosh(parsedValue)); break
					case 'atanh': parsedValue = radianToAngle(Math.atanh(parsedValue)); break
					case 'acsch': parsedValue = radianToAngle(mathACscH(parsedValue)); break
					case 'asech': parsedValue = radianToAngle(mathASecH(parsedValue)); break
					case 'acoth': parsedValue = radianToAngle(mathACotH(parsedValue)); break
					}
					return numberToRealDigits(parsedValue)
				})
			}

			// remove brackets
			const bracketsRegex = new RegExp(String.raw`(?<!${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (bracketsRegex.test(input)) {
				hasOperation = true
				input = input.replace(bracketsRegex, (_, num1) => num1)
			}

			// square root operation
			const sqrtRegex = /√([-+]?\d+(?:\.\d+)?)/g
			while (sqrtRegex.test(input)){
				hasOperation = true
				input = input.replace(sqrtRegex, (_, num1) => {
					const parsedValue = Number.parseFloat(num1)
					if (parsedValue < 0) throw Error()
					return numberToRealDigits(Math.sqrt(parsedValue))
				})
			}

			// percentage operation
			const percentageRegex = /(\d+(?:\.\d+)?)%/g
			while (percentageRegex.test(input)){
				hasOperation = true
				input = input.replace(
					percentageRegex,
					(_, num1) => numberToRealDigits(Number.parseFloat(num1) / 100)
				)
			}

			// factorial operation
			const factorialRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
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
			const expRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
			const expReverseRegex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
			const match = input.match(expRegex)
			if (match) {
				hasOperation = true
				input = stringReverse(input)

				while (expReverseRegex.test(input)) {
					input = input.replace(
						expReverseRegex,
						(_, num2, num1) => stringReverse(numberToRealDigits(Math.pow(
							Number.parseFloat(stringReverse(num1)),
							Number.parseFloat(stringReverse(num2))
						)))
					)
				}
				input = stringReverse(input)
			}

			// division & multiplication & modulus operation
			const divMulModRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
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
			const addSubRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
			while (addSubRegex.test(input)) {
				hasOperation = true
				input = input.replace(addSubRegex, (_, num1, operator, num2) => {
					if (operator == '+') return numberToRealDigits(Number.parseFloat(num1) + Number.parseFloat(num2))
					if (operator == '-') return numberToRealDigits(Number.parseFloat(num1) - Number.parseFloat(num2))
					return _
				})
			}

			// shifting operation
			const lshRshRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
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
			const andRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
			while (andRegex.test(input)) {
				hasOperation = true
				input = input.replace(andRegex, (_, num1, num2) =>  {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) & Number.parseFloat(num2))
				})
			}

			// xor operation
			const xorRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
			while (xorRegex.test(input)) {
				hasOperation = true
				input = input.replace(xorRegex, (_, num1, num2) => {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) ^ Number.parseFloat(num2))
				})
			}

			// or operation
			const orRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
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