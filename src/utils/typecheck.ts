export function is_array(arg: unknown): boolean {
	return Array.isArray(arg)
}

export function is_number(arg: unknown): boolean {
	return typeof arg == 'number'
}

export function is_string(arg: unknown): boolean {
	return typeof arg == 'string'
}

export function is_boolean(arg: unknown): boolean {
	return typeof arg == 'boolean'
}

export function is_function(arg: unknown): boolean {
	return typeof arg == 'function'
}

export function is_bigint(arg: unknown): boolean {
	return typeof arg == 'bigint'
}

export function is_object(arg: unknown): boolean {
	return typeof arg == 'object'
}

export function is_symbol(arg: unknown): boolean {
	return typeof arg == 'symbol'
}