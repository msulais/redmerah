import { array_some } from "./array"
import { is_function } from "./typecheck"

export function object_keys(value: Object): string[] {
	return Object.keys(value)
}

export function object_values<T>(value: Object): T[] {
	return Object.values(value)
}

export function valid_enum_key<T, U extends Record<any, any>>(key: T, enums: U): boolean {
	return enums[key] !== undefined
}

export function valid_enum_value<
	T,
	U extends Record<string | number, any>
>(value: T, enums: U | (string | number)[]): boolean {
	return array_some(
		object_values(enums),
		v => v === value
	)
}

export function object_has_value(data: unknown): boolean {
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

/**
 * Basically switch-case but without `break` keyword
 * @param source
 * @param args
 * @returns
 */
export function match_case<T, U>(
	source: T,
	...args: [value: T, callback: (() => U) | U][]
): U | void {
	for (const arg of args) {
		if (arg[0] == source) {
			return is_function(arg[1])
				? (arg[1] as () => U)()
				: arg[1] as U
		}
	}
}