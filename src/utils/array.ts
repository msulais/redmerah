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

export function shuffleArray<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]]
	}

	return arr
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