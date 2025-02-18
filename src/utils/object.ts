import { arraySome } from "./array"
import { typeIsFunction } from "./typecheck"

export function objectKeys(value: Object): string[] {
	return Object.keys(value)
}

export function objectValues<T>(value: Object): T[] {
	return Object.values(value)
}

export function validEnumKey<T, U extends Record<any, any>>(key: T, enums: U): boolean {
	return enums[key] !== undefined
}

export function validEnumValue<
	T,
	U extends Record<string | number, any>
>(value: T, enums: U | (string | number)[]): boolean {
	return arraySome(
		objectValues(enums),
		v => v === value
	)
}

export function objectHasValue(data: unknown): boolean {
	return data != undefined && data != null
}

export function objectCreate<T>(...data: [key: keyof T, value: unknown][]): T {
	const obj = {} as Record<keyof T, unknown>

	for (const i in data) {
		obj[data[i][0]] = data[i][1]
	}

	return obj as T
}

export function objectDeepClone<T = unknown>(value: T, options?: StructuredSerializeOptions): T {
	return structuredClone(value, options)
}

export function promiseDone<T, U = any>(
	prom: Promise<T>,
	onDone: (data: T) => unknown,
	onError?: (reason: U) => unknown
): Promise<unknown> {
	return onError
		? prom.then(onDone).catch(onError)
		: prom.then(onDone)
}

/**
 * Basically switch-case but without `break` keyword
 * @param source
 * @param args
 * @returns
 */
export function statementMatchCase<T, U>(
	source: T,
	...args: [value: T, callback: (() => U) | U][]
): U | void {
	for (const arg of args) {
		if (arg[0] == source) {
			return typeIsFunction(arg[1])
				? (arg[1] as () => U)()
				: arg[1] as U
		}
	}
}