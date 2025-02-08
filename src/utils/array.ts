import { mathFloor } from "./math"

export function arrayFilter<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): T[] {
	return arr.filter(predicate, thisArg)
}

export function arrayFindIndex<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): number {
	return arr.findIndex(predicate, thisArg)
}

export function arraySplice<T>(arr: T[], start: number, deleteCount?: number): T[] {
	return arr.splice(start, deleteCount)
}

export function arrayConcat<T>(arr: T[], ...items: ConcatArray<T>[]): T[] {
	return arr.concat(...items)
}

export function arrayAt<T>(arr: T[], index: number): T | undefined {
	return arr.at(index)
}

export function arrayFill<T>(arr: T[], value: T, start?: number, end?: number): T[] {
	return arr.fill(value, start, end)
}

export function arraySlice<T>(arr: T[], start?: number, end?: number): T[] {
	return arr.slice(start, end)
}

export function arraySort<T>(arr: T[], compareFn?: ((a: T, b: T) => number) | undefined): T[] {
	return arr.sort(compareFn)
}

export function arraySome<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): boolean {
	return arr.some(predicate, thisArg)
}

export function arrayPush<T>(arr: T[], ...items: T[]): number {
	return arr.push(...items)
}

export function arrayJoin<T>(arr: T[], separator?: string): string {
	return arr.join(separator)
}

export function arrayMap<T, U>(
	arr: T[],
	callbackFn: (value: T, index: number, array: T[]) => U,
	thisArg?: any
): U[] {
	return arr.map(callbackFn, thisArg)
}

export function arrayLength<T>(arr: T[]): number {
	return arr.length
}

export function arrayReverse<T>(arr: T[]): T[] {
	return arr.reverse()
}

export function arrayIncludes<T>(arr: T[], searchValue: T, startIndex?: number): boolean {
	return arr.includes(searchValue, startIndex)
}

export function arrayForEach<T>(
	arr: T[],
	callbackFn: (value: T, index: number, array: T[]) => void,
	thisArg?: any
): void {
	return arr.forEach(callbackFn, thisArg)
}

export function arrayBinarySearch(array: number[], target: number): number | null {
	let left = 0
	let right = arrayLength(array) - 1

	while (left <= right) {
		const middle = mathFloor((left + right) / 2)
		if (array[middle] === target) return middle
		else if (array[middle] < target) left = middle + 1
		else right = middle - 1
	}

	return null
}

export function arrayFind<T>(
	arr: T[],
	predicate: (value: T, index: number, obj: T[]) => boolean,
	thisArg?: any
): T | undefined {
	return arr.find(predicate, thisArg)
}

export function arrayEvery<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): boolean {
	return arr.every(predicate, thisArg)
}

export function arrayToString<T>(arr: T[]): string {
	return arr.toString()
}

export function arrayEquals<T, U>(arr: T[], target: U[]): boolean {
	return arrayToString(arr) == arrayToString(target)
}