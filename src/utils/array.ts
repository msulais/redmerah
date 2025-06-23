export function binarySearch(array: number[], target: number): number | null {
	let left = 0
	let right = array.length - 1

	while (left <= right) {
		const middle = Math.floor((left + right) / 2)
		if (array[middle] === target) return middle
		else if (array[middle] < target) left = middle + 1
		else right = middle - 1
	}

	return null
}

export function isArrayEqual<T, U>(arr: T[], target: U[]): boolean {
	return arr.toString() === target.toString()
}