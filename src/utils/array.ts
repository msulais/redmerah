import { math_floor } from "./math"

export function array_filter<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	this_arg?: any
): T[] {
	return arr.filter(predicate, this_arg)
}

export function array_find_index<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	this_arg?: any
): number {
	return arr.findIndex(predicate, this_arg)
}

export function array_splice<T>(arr: T[], start: number, delete_count?: number): T[] {
	return arr.splice(start, delete_count)
}

export function array_concat<T>(arr: T[], ...items: ConcatArray<T>[]): T[] {
	return arr.concat(...items)
}

export function array_at<T>(arr: T[], index: number): T | undefined {
	return arr.at(index)
}

export function array_fill<T>(arr: T[], value: T, start?: number, end?: number): T[] {
	return arr.fill(value, start, end)
}

export function array_slice<T>(arr: T[], start?: number, end?: number): T[] {
	return arr.slice(start, end)
}

export function array_sort<T>(arr: T[], comparefn?: ((a: T, b: T) => number) | undefined): T[] {
	return arr.sort(comparefn)
}

export function array_some<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	this_arg?: any
): boolean {
	return arr.some(predicate, this_arg)
}

export function array_push<T>(arr: T[], ...items: T[]): number {
	return arr.push(...items)
}

export function array_join<T>(arr: T[], separator?: string): string {
	return arr.join(separator)
}

export function array_map<T, U>(
	arr: T[],
	callbackfn: (value: T, index: number, array: T[]) => U,
	thisarg?: any
): U[] {
	return arr.map(callbackfn, thisarg)
}

export function array_length<T>(arr: T[]): number {
	return arr.length
}

export function array_reverse<T>(arr: T[]): T[] {
	return arr.reverse()
}

export function array_includes<T>(arr: T[], search_element: T, from_index?: number): boolean {
	return arr.includes(search_element, from_index)
}

export function array_foreach<T>(
	arr: T[],
	callbackfn: (value: T, index: number, array: T[]) => void,
	this_arg?: any
): void {
	return arr.forEach(callbackfn, this_arg)
}

export function binary_search(array: number[], target: number): number | null {
	let left = 0
	let right = array_length(array) - 1

	while (left <= right) {
		const middle = math_floor((left + right) / 2)
		if (array[middle] === target) return middle
		else if (array[middle] < target) left = middle + 1
		else right = middle - 1
	}

	return null
}

export function array_find<T>(
	arr: T[],
	predicate: (value: T, index: number, obj: T[]) => boolean,
	this_arg?: any
): T | undefined {
	return arr.find(predicate, this_arg)
}

export function array_every<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	this_arg?: any
): boolean {
	return arr.every(predicate, this_arg)
}

export function array_to_string<T>(arr: T[]): string {
	return arr.toString()
}

export function array_equals<T, U>(arr: T[], target: U[]): boolean {
	return array_to_string(arr) == array_to_string(target)
}