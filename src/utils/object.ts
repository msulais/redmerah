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

export function isInstanceOfClass(obj: any): boolean {
	const isCtorClass = obj?.constructor?.toString()?.startsWith('class')
	if(obj.prototype === undefined) {
		return isCtorClass
	}

	const isPrototypeCtorClass = obj?.prototype?.constructor?.toString()?.startsWith('class')
	return isCtorClass || isPrototypeCtorClass
}

export function deepCopy<T>(obj: T): T {
	if (typeof obj !== 'object') {
		return obj
	}

	// typeof null === 'object'
	if (obj === null) {
		return obj
	}

	if (Array.isArray(obj)) {
		const arr = []
		for (let i = 0; i < (obj as any[]).length; i++) {
			arr.push(deepCopy(obj[i]))
		}

		return arr as T
	}

	const keys = Object.keys(obj as any)
	if (obj && !isInstanceOfClass(obj) && keys.length > 0) {
		const copy = {}
		for (const key of keys) {
			// @ts-ignore
			copy[key] = deepCopy(obj[key])
		}

		return copy as T
	}

	return obj
}

export function createObject<T>(...data: [key: keyof T, value: unknown][]): T {
	const obj = {} as Record<keyof T, unknown>

	for (const i in data) {
		obj[data[i]![0]] = data[i]![1]
	}

	return obj as T
}