export function math_clamp(value: number, min: number, max: number): number {
	return math_max(min, math_min(max, value))
}

export function math_pow(x: number, y: number): number {
	return Math.pow(x, y)
}

export function math_min(...values: number[]): number {
	return Math.min(...values)
}

export function math_max(...values: number[]): number {
	return Math.max(...values)
}

export function math_round(x: number): number {
	return Math.round(x)
}

export function math_floor(x: number): number {
	return Math.floor(x)
}

export function math_abs(x: number): number {
	return Math.abs(x)
}

export function math_random(): number {
	return Math.random()
}

export function math_sqrt(x: number): number {
	return Math.sqrt(x)
}

export function math_sin(x: number): number {
	return Math.sin(x)
}

export function math_cos(x: number): number {
	return Math.cos(x)
}

export function math_tan(x: number): number {
	return Math.tan(x)
}

export function math_log(x: number): number {
	return Math.log10(x)
}

export function math_ln(x: number): number {
	return Math.log(x)
}

export function math_not(x: number): number {
	return ~x
}

export function math_ceil(x: number): number {
	return Math.ceil(x)
}

// sinh(x) = (e^x - e^(-x)) / 2
export function math_sinh(x: number): number {
	return Math.sinh(x)
}

export function math_asin(x: number): number {
	return Math.asin(x)
}

// asinh(x) = ln(x + sqrt(x^2 + 1))
export function math_asinh(x: number): number {
	return Math.asinh(x)
}

// csc(x) = 1 / sin(x)
export function math_csc(x: number): number {
	return 1 / math_sin(x)
}

// csch(x) = 1 / sinh(x)
export function math_csch(x: number): number {
	return 1 / math_sinh(x)
}

// acsc(x) = asin(1 / x), -1 <= x <= 1, x != 0
export function math_acsc(x: number): number {
	return math_asin(1 / x)
}

// acsch(x) = ln(1 / x + sqrt(1 / x ^ 2 + 1)), x != 0
export function math_acsch(x: number): number {
	return math_ln(1 / x + math_sqrt(1 / math_pow(x, 2) + 1))
}

export function math_acos(x: number): number {
	return Math.acos(x)
}

// cosh(x) = (e ^ x + e ^ (-x))/2
export function math_cosh(x: number): number {
	return Math.cosh(x)
}

// acosh(x) = ln(x + sqrt(x ^ 2 - 1)), x >= 1
export function math_acosh(x: number): number {
	return Math.acosh(x)
}

// sec(x) = 1 / cos(x)
export function math_sec(x: number): number {
	return 1 / math_cos(x)
}

// asec(x) = acos(1 / x), x <= -1, x >= 1
export function math_asec(x: number): number {
	return math_acos(1 / x)
}

// sech(x) = 1 / cosh(x)
export function math_sech(x: number): number {
	return 1 / math_cosh(x)
}

// asech(x) = ln((1 + sqrt(1 - x^2)) / x), 0 < x < 1
export function math_asech(x: number): number {
	return math_ln((1 + math_sqrt(1 - math_pow(x, 2))) / x)
}

export function math_atan(x: number): number {
	return Math.atan(x)
}

// tanh(x) = sinh(x) / cosh(x)
export function math_tanh(x: number): number {
	return Math.tanh(x)
}

// atanh(x) = ln((1 + x) / (1 - x)) / 2, -1 <= x <= 1
export function math_atanh(x: number): number {
	return Math.atanh(x)
}

// cot(x) = 1 / tan(x), tan(x) != 0
export function math_cot(x: number): number {
	return 1 / math_tan(x)
}

// acot(x) = atan(1 / x), x != 0
export function math_acot(x: number): number {
	return math_atan(1 / x)
}

// coth(x) = cosh(x) / sinh(x), tanh(x) != 0
export function math_coth(x: number): number {
	return math_cosh(x) / math_sinh(x)
}

// acoth(x) = ln[(x + 1) / (x - 1)] / 2, x > 1, x < -1
export function math_acoth(x: number): number {
	return math_ln((x + 1) / (x - 1)) / 2
}