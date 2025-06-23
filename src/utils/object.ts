export function isValidEnumKey<T, U extends Record<any, any>>(key: T, enums: U): boolean {
	return enums[key] !== undefined
}

export function isValidEnumValue<
	T, U extends Record<string | number, any>
>(value: T, enums: U | (string | number)[]): boolean {
	return Object
		.values(enums)
		.some(v => v === value)
}

export function isObjectHasValue(data: unknown): boolean {
	return data != undefined && data != null
}

export function moveArrayElement<T>(
	arr: T[],
	oldIndex: number,
	newIndex: number,
	allowOutOfIndex: boolean = true
) {
	while (oldIndex < 0) {
		oldIndex += arr.length
	}
	while (newIndex < 0) {
		newIndex += arr.length
	}

	if (newIndex >= arr.length) {
		if (allowOutOfIndex) {
			let k = newIndex - arr.length
			while ((k--) + 1) {
				arr.push(undefined as T)
			}
		}
		else {
			return arr
		}
	}

	const [element] = arr.splice(oldIndex, 1)
	arr.splice(newIndex, 0, element)
	return arr
}

export function createObject<T>(...data: [key: keyof T, value: unknown][]): T {
	const obj = {} as Record<keyof T, unknown>

	for (const i in data) {
		obj[data[i][0]] = data[i][1]
	}

	return obj as T
}

/**
 * Basically switch-case but without `break` keyword.
 *
 * Why do I made this? for simplicity. You know, "MINIFY" javascript.
 * Althought, I don't use it cause it HARD to use compare to `switch`.
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
			return typeof arg[1] === 'function'
				? (arg[1] as () => U)()
				: arg[1] as U
		}
	}
}