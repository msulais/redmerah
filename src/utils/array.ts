import { math_floor } from "./math"

/**
 * Returns the elements of an array that meet the condition specified in a callback function.
 * @param arr
 * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
 * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
 * @returns
 */
export function array_filter<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): T[] {
	return arr.filter(predicate, thisArg)
}

/**
 * Returns the index of the first element in the array where predicate is true, and -1
 * otherwise.
 * @param arr
 * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
 * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
 */
export function array_find_index<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): number {
	return arr.findIndex(predicate, thisArg)
}

/**
 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
 * @param start The zero-based location in the array from which to start removing elements.
 * @param delete_count The number of elements to remove.
 * @returns An array containing the elements that were deleted.
 */
export function array_splice<T>(arr: T[], start: number, delete_count?: number): T[] {
	return arr.splice(start, delete_count)
}

export function array_concat<T>(arr: T[], ...items: ConcatArray<T>[]): T[] {
	return arr.concat(...items)
}

/**
 * Returns the item located at the specified index.
 * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
 */
export function array_at<T>(arr: T[], index: number): T | undefined {
	return arr.at(index)
}

/**
 * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
 * @param value value to fill array section with
 * @param start index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
 * @param end index to stop filling the array at. If end is negative, it is treated as length+end.
 */
export function array_fill<T>(arr: T[], value: T, start?: number, end?: number): T[] {
	return arr.fill(value, start, end)
}

/**
 * Returns a copy of a section of an array.
 * For both start and end, a negative index can be used to indicate an offset from the end of the array.
 * For example, -2 refers to the second to last element of the array.
 * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
 * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array.
 */
export function array_slice<T>(arr: T[], start?: number, end?: number): T[] {
	return arr.slice(start, end)
}

/**
 * Sorts an array in place.
 * This method mutates the array and returns a reference to the same array.
 * ```ts
 * [11,2,22,1].sort((a, b) => a - b)
 * ```
 * @param comparefn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
 */
export function array_sort<T>(arr: T[], comparefn?: ((a: T, b: T) => number) | undefined): T[] {
	return arr.sort(comparefn)
}

/**
 * Determines whether the specified callback function returns true for any element of an array.
 * @param arr
 * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
 * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
 */
export function array_some<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	thisArg?: any
): boolean {
	return arr.some(predicate, thisArg)
}

/**
 * Appends new elements to the end of an array, and returns the new length of the array.
 * @param arr
 * @param items New elements to add to the array.
 */
export function array_push<T>(arr: T[], ...items: T[]): number {
	return arr.push(...items)
}

/**
 * Adds all the elements of an array into a string, separated by the specified separator string.
 * @param arr
 * @param separator A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.
 */
export function array_join<T>(arr: T[], separator?: string): string {
	return arr.join(separator)
}

/**
 * Calls a defined callback function on each element of an array, and returns an array that contains the results.
 * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
 */
export function array_map<T, U>(arr: T[], callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
	return arr.map(callbackfn, thisArg)
}

/**
 * Gets or sets the length of the array. This is a number one higher than the highest index in the array.
 */
export function array_length<T>(arr: T[]): number {
	return arr.length
}

/**
 * Reverses the elements in an array in place.
 * This method mutates the array and returns a reference to the same array.
 */
export function array_reverse<T>(arr: T[]): T[] {
	return arr.reverse()
}

/**
 * Determines whether an array includes a certain element, returning true or false as appropriate.
 * @param search_element The element to search for.
 * @param from_index The position in this array at which to begin searching for searchElement.
 */
export function array_includes<T>(arr: T[], search_element: T, from_index?: number): boolean {
	return arr.includes(search_element, from_index)
}

/**
 * Performs the specified action for each element in an array.
 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
 */
export function array_foreach<T>(arr: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
	return arr.forEach(callbackfn, thisArg)
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

/**
 * Returns the value of the first element in the array where predicate is true, and undefined
 * otherwise.
 * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
 * @param this_arg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
 */
export function array_find<T>(
	arr: T[],
	predicate: (value: T, index: number, obj: T[]) => boolean,
	this_arg?: any
): T | undefined {
	return arr.find(predicate, this_arg)
}

/**
 * Determines whether all the members of an array satisfy the specified test.
 * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
 * @param this_arg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
 */
export function array_every<T>(
	arr: T[],
	predicate: (value: T, index: number, array: T[]) => boolean,
	this_arg?: any
): boolean {
	return arr.every(predicate, this_arg)
}