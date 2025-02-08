export function typeIsArray(arg: unknown): boolean {
	return Array.isArray(arg)
}

export function typeIsNumber(arg: unknown): boolean {
	return typeof arg == 'number'
}

export function typeIsString(arg: unknown): boolean {
	return typeof arg == 'string'
}

export function typeIsBoolean(arg: unknown): boolean {
	return typeof arg == 'boolean'
}

export function typeIsFunction(arg: unknown): boolean {
	return typeof arg == 'function'
}

export function typeIsBigint(arg: unknown): boolean {
	return typeof arg == 'bigint'
}

export function typeIsObject(arg: unknown): boolean {
	return typeof arg == 'object'
}

export function typeIsSymbol(arg: unknown): boolean {
	return typeof arg == 'symbol'
}