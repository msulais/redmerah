import { _length } from "@/constants/string"
import { mathFloor } from "./math"

export function isVarHasValue(data: unknown): boolean {
	return data != undefined && data != null
}

export function createObject<T>(...data: [key: keyof T, value: unknown][]): T {
	const obj = {} as Record<keyof T, unknown>

	for (const i in data) {
		obj[data[i][0]] = data[i][1]
	}

	return obj as T
}

export function deepClone<T = unknown>(value: T, options?: StructuredSerializeOptions): T {
	return structuredClone(value, options)
}

export function binarySearch(array: number[], target: number): number | null {
	let left = 0
	let right = array[_length] - 1

	while (left <= right) {
		const middle = mathFloor((left + right) / 2)
		if (array[middle] === target) return middle
		else if (array[middle] < target) left = middle + 1
		else right = middle - 1
	}

	return null
}