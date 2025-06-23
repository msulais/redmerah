export function Math_clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value))
}

// csc(x) = 1 / sin(x)
export function Math_csc(x: number): number {
	return 1 / Math.sin(x)
}

// csch(x) = 1 / sinh(x)
export function Math_csch(x: number): number {
	return 1 / Math.sinh(x)
}

// acsc(x) = asin(1 / x), -1 <= x <= 1, x != 0
export function Math_acsc(x: number): number {
	return Math.asin(1 / x)
}

// acsch(x) = ln(1 / x + sqrt(1 / x ^ 2 + 1)), x != 0
export function Math_acsch(x: number): number {
	return Math.log(1 / x + Math.sqrt(1 / Math.pow(x, 2) + 1))
}

// sec(x) = 1 / cos(x)
export function Math_sec(x: number): number {
	return 1 / Math.cos(x)
}

// asec(x) = acos(1 / x), x <= -1, x >= 1
export function Math_asec(x: number): number {
	return Math.acos(1 / x)
}

// sech(x) = 1 / cosh(x)
export function Math_sech(x: number): number {
	return 1 / Math.cosh(x)
}

// asech(x) = ln((1 + sqrt(1 - x^2)) / x), 0 < x < 1
export function Math_asech(x: number): number {
	return Math.log((1 + Math.sqrt(1 - Math.pow(x, 2))) / x)
}

// cot(x) = 1 / tan(x), tan(x) != 0
export function Math_cot(x: number): number {
	return 1 / Math.tan(x)
}

// acot(x) = atan(1 / x), x != 0
export function Math_acot(x: number): number {
	return Math.atan(1 / x)
}

// coth(x) = cosh(x) / sinh(x), tanh(x) != 0
export function Math_coth(x: number): number {
	return Math.cosh(x) / Math.sinh(x)
}

// acoth(x) = ln[(x + 1) / (x - 1)] / 2, x > 1, x < -1
export function Math_acoth(x: number): number {
	return Math.log((x + 1) / (x - 1)) / 2
}