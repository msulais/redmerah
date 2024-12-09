export function is_var_has_value(data: unknown): boolean {
	return data != undefined && data != null
}

export function create_object<T>(...data: [key: keyof T, value: unknown][]): T {
	const obj = {} as Record<keyof T, unknown>

	for (const i in data) {
		obj[data[i][0]] = data[i][1]
	}

	return obj as T
}

export function deep_clone<T = unknown>(value: T, options?: StructuredSerializeOptions): T {
	return structuredClone(value, options)
}

export function promise_done<T, U = any>(
	prom: Promise<T>,
	on_done: (data: T) => unknown,
	on_error?: (reason: U) => unknown
): Promise<unknown> {
	return on_error
		? prom.then(on_done).catch(on_error)
		: prom.then(on_done)
}