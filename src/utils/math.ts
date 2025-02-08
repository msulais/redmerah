export function mathClamp(value: number, min: number, max: number): number {
	return mathMax(min, mathMin(max, value))
}

export function mathPow(x: number, y: number): number {
	return Math.pow(x, y)
}

export function mathMin(...values: number[]): number {
	return Math.min(...values)
}

export function mathMax(...values: number[]): number {
	return Math.max(...values)
}

export function mathRound(x: number): number {
	return Math.round(x)
}

export function mathFloor(x: number): number {
	return Math.floor(x)
}

export function mathAbs(x: number): number {
	return Math.abs(x)
}

export function mathRandom(): number {
	return Math.random()
}

export function mathSqrt(x: number): number {
	return Math.sqrt(x)
}

export function mathSin(x: number): number {
	return Math.sin(x)
}

export function mathCos(x: number): number {
	return Math.cos(x)
}

export function mathTan(x: number): number {
	return Math.tan(x)
}

export function mathLog(x: number): number {
	return Math.log10(x)
}

export function mathLn(x: number): number {
	return Math.log(x)
}

export function mathNot(x: number): number {
	return ~x
}

export function mathCeil(x: number): number {
	return Math.ceil(x)
}

// sinh(x) = (e^x - e^(-x)) / 2
export function mathSinH(x: number): number {
	return Math.sinh(x)
}

export function mathASin(x: number): number {
	return Math.asin(x)
}

// asinh(x) = ln(x + sqrt(x^2 + 1))
export function mathASinH(x: number): number {
	return Math.asinh(x)
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

export function mathAcos(x: number): number {
	return Math.acos(x)
}

// cosh(x) = (e ^ x + e ^ (-x))/2
export function mathCosH(x: number): number {
	return Math.cosh(x)
}

// acosh(x) = ln(x + sqrt(x ^ 2 - 1)), x >= 1
export function mathACosH(x: number): number {
	return Math.acosh(x)
}

// sec(x) = 1 / cos(x)
export function mathSec(x: number): number {
	return 1 / mathCos(x)
}

// asec(x) = acos(1 / x), x <= -1, x >= 1
export function mathASec(x: number): number {
	return mathAcos(1 / x)
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
	return Math.atan(x)
}

// tanh(x) = sinh(x) / cosh(x)
export function mathTanH(x: number): number {
	return Math.tanh(x)
}

// atanh(x) = ln((1 + x) / (1 - x)) / 2, -1 <= x <= 1
export function mathATanH(x: number): number {
	return Math.atanh(x)
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