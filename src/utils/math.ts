import { _abs, _acos, _acosh, _asin, _asinh, _atan, _atanh, _ceil, _cos, _cosh, _floor, _indexOf, _isInteger, _isNaN, _length, _log, _log10, _match, _max, _min, _pow, _random, _repeat, _replace, _round, _sin, _sinh, _split, _sqrt, _substring, _tan, _tanh, _test, _toString } from "@/constants/string"
import { isVarHasValue } from "./data"
import { getMath, getNumber } from "@/constants/math"

export function numberParse(num: string, isInt?: boolean, radix?: number): number {
    return isInt? parseInt(num, radix) : parseFloat(num)
}

export function mathPow(x: number, y: number): number {
    return getMath[_pow](x, y)
}

export function mathMin(...values: number[]): number {
    return getMath[_min](...values)
}

export function mathMax(...values: number[]): number {
    return getMath[_max](...values)
}

export function mathRound(x: number): number {
    return getMath[_round](x)
}

export function mathFloor(x: number): number {
    return getMath[_floor](x)
}

export function mathAbs(x: number): number {
    return getMath[_abs](x)
}

export function mathRandom(): number {
    return getMath[_random]()
}

export function mathSqrt(x: number): number {
    return getMath[_sqrt](x)
}

export function mathSin(x: number): number {
    return getMath[_sin](x)
}

export function mathCos(x: number): number {
    return getMath[_cos](x)
}

export function mathTan(x: number): number {
    return getMath[_tan](x)
}

export function mathLog(x: number): number {
    return getMath[_log10](x)
}

export function mathLn(x: number): number {
    return getMath[_log](x)
}

export function mathNot(x: number): number {
    return ~x
}

export function mathCeil(x: number): number {
    return getMath[_ceil](x)
}

// sinh(x) = (e^x - e^(-x)) / 2
export function mathSinH(x: number): number {
    return getMath[_sinh](x)
}

export function mathASin(x: number): number {
    return getMath[_asin](x)
}

// asinh(x) = ln(x + sqrt(x^2 + 1))
export function mathASinH(x: number): number {
    return getMath[_asinh](x)
}

// csc(x) = 1 / sin(x)
export function mathCsc(x: number): number {
    return 1 / mathSin(x)
}

// csch(x) = 1 / sinh(x)
export function mathCscH(x: number): number {
    return 1 / mathSinH(x)
}

// acsc(x) = asin(1 / x), -1 <= x <= 1, x != 0
export function mathACsc(x: number): number {
    return mathASin(1 / x)
}

// acsch(x) = ln(1 / x + sqrt(1 / x ^ 2 + 1)), x != 0
export function mathACscH(x: number): number {
    return mathLn(1 / x + mathSqrt(1 / mathPow(x, 2) + 1))
}

export function mathACos(x: number): number {
    return getMath[_acos](x)
}

// cosh(x) = (e ^ x + e ^ (-x))/2
export function mathCosH(x: number): number {
    return getMath[_cosh](x)
}

// acosh(x) = ln(x + sqrt(x ^ 2 - 1)), x >= 1
export function mathACosH(x: number): number {
    return getMath[_acosh](x)
}

// sec(x) = 1 / cos(x)
export function mathSec(x: number): number {
    return 1 / mathCos(x)
}

// asec(x) = acos(1 / x), x <= -1, x >= 1
export function mathASec(x: number): number {
    return mathACos(1 / x)
}

// sech(x) = 1 / cosh(x)
export function mathSecH(x: number): number {
    return 1 / mathCosH(x)
}

// asech(x) = ln((1 + sqrt(1 - x^2)) / x), 0 < x < 1
export function mathASecH(x: number): number {
    return mathLn((1 + mathSqrt(1 - mathPow(x, 2))) / x)
}

export function mathATan(x: number): number {
    return getMath[_atan](x)
}

// tanh(x) = sinh(x) / cosh(x)
export function mathTanH(x: number): number {
    return getMath[_tanh](x)
}

// atanh(x) = ln((1 + x) / (1 - x)) / 2, -1 <= x <= 1
export function mathATanH(x: number): number {
    return getMath[_atanh](x)
}

// cot(x) = 1 / tan(x), tan(x) != 0
export function mathCot(x: number): number {
    return 1 / mathTan(x)
}

// acot(x) = atan(1 / x), x != 0
export function mathACot(x: number): number {
    return mathATan(1 / x)
}

// coth(x) = cosh(x) / sinh(x), tanh(x) != 0
export function mathCotH(x: number): number {
    return mathCosH(x) / mathSinH(x)
}

// acoth(x) = ln[(x + 1) / (x - 1)] / 2, x > 1, x < -1
export function mathACotH(x: number): number {
    return mathLn((x + 1) / (x - 1)) / 2
}

export function numberIsNaN(x: number, fallback?: number): boolean | number {
    if (isVarHasValue(fallback)){
        if (getNumber[_isNaN](x)) return fallback!
        return x
    }
    return getNumber[_isNaN](x)
}

export function isNumberInteger(number: unknown): boolean {
    return getNumber[_isInteger](number)
}

export function formatNumber(num: number, options: {
    thousandSeparator?: string
    decimalSeparator?: string
  } = {}): string {
    const {
        thousandSeparator = ',',
        decimalSeparator = '.'
    } = options
    const sign = num < 0 ? '-' : ''
    const absNumber = mathAbs(num)
    const parts = numberToRealDigit(absNumber)[_split]('.')
    const integerPart = parts[0][_replace](/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

    let decimalPart = ''
    if (parts[_length] > 1) decimalPart = parts[1]

    return `${sign}${integerPart}${decimalPart[_length] > 0? decimalSeparator : ''}${decimalPart}`
}

/**
 * Convert input with scientific notation to real digit.
 * For example: `2.34e-3` become `0.00234`
 *
 * @param input
 * @returns
 */
export function numberToRealDigit(input: number): string {
   const regex = /([+-]?)(\d+)(\.\d+)?[Ee]([+\-])?(\d+)/
   const str: string = input[_toString]()

   const result = str[_match](regex)
   if (!result) return str

   const sign = result[1]
   const num = result[2]
   const decimal = result[3] ?? '.0'
   const expSign = result[4]
   const exponent = numberParse(result[5], true)

   if (expSign == '-') return (sign
       + '0.'
       + '0'[_repeat](exponent-1)
       + num
       + decimal[_substring](1)
   )

   const leftover = exponent - (decimal[_length] - 1)
   return (sign
       + num
       + decimal[_substring](1, exponent+1)
       + (leftover <= 0
           ? '.' + decimal[_substring](exponent+1)
           : '0'[_repeat](leftover)
       )
   )
}

export function binaryToFloat(input: string, bit: 32 | 64 = 64): number{
    if (/^[10]+$/[_test](input)) throw Error('input not valid')

    if (input[_length] > bit) input = input[_substring](0, bit)
    if (input[_length] < bit) input = ('0'[_repeat](bit - input[_length])) + input

    const sign   = input[_substring](0, 1)
    let exponent = input[_substring](1, bit == 32? 9 : 12)
    let mantissa = input[_substring](bit == 32? 9 : 12)
    let carry    = 0

    // convert mantissa from bits to real numbers
    for (let i = 1; i <= mantissa[_length]; i++) {
        if (mantissa[_substring](i - 1, i) != '1') continue

        carry = carry + mathPow(2, -i)
    }

    // mantissa in real numbers (base10)
    mantissa = carry[_toString]()
    exponent = numberParse(exponent, true, 2)[_toString]()

    // denormalized
    if (exponent == '0') return (
        mathPow(-1, numberParse(sign, true))
        * mathPow(2, (bit == 32? -126 : -1022))
        * numberParse(mantissa)
    )

    return (
        mathPow(-1, numberParse(sign, true))
        * mathPow(2, numberParse(exponent, true)-(bit == 32? 127 : 1023))
        * (1 + numberParse(mantissa))
    )
}

export function floatToBinary(input: number, bit: 32 | 64 = 64): string {
    const sign = input < 0? '1' : '0'
    let n = input[_toString](2)
    if (!/\./[_test](n)) return n

    let mantissa = mathAbs(input)[_toString](2)
    const indexDot = mantissa[_indexOf]('.')
    const indexOne = mantissa[_indexOf]('1')
    const substractForExp = (indexDot < indexOne
        ? indexDot - indexOne
        : indexDot - (indexOne + 1)
    )
    let more = false
    let less = false
    let exponent: number | string = 0
    if (indexOne != -1){
        exponent = substractForExp + (bit == 32? 127 : 1023)
        if (exponent > (bit == 32? 255 : 4095)) {
            more = true
            exponent = 255
        } else if (exponent < 0) {
            less = true
            exponent = 0
        }
        exponent = exponent[_toString](2)
    }
    else exponent = '0'

    // // example: [ exponent="101" ] => [ exponent="00000101"(Float32) exponent="00000000101"(Float64) ]
    if (exponent[_length] < (bit == 32? 8 : 11)) {
        exponent = ('0'[_repeat]((bit == 32? 8 : 11) - exponent[_length])) + exponent
    }

    if (indexOne == -1) mantissa = mantissa[_substring](indexDot + 1)
    else {
        if (indexDot < indexOne) {
            if (less) mantissa = mantissa[_substring](indexDot + (bit == 32? 127 : 1023))
            else mantissa = mantissa[_substring](indexOne + 1)
        }

        else if (indexDot > indexOne) {
            if (more) mantissa = mantissa[_substring](indexDot - (bit == 32? 127 : 1023), indexDot + 1);
            else mantissa = (
                mantissa[_substring](indexOne + 1, indexDot)
                + mantissa[_substring](indexDot + 1)
            )
        }
    }

    return (sign + exponent + mantissa)[_substring](0, bit == 32? 32 : 64)
  }