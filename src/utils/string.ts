export function stringToTitleCase(text: string): string {
	return text
		.split(' ')
		.map(v =>
			v.substring(0, 1).toUpperCase()
			+ v.substring(1).toLowerCase()
		)
		.join(' ')
}

export function stringToToggleCase(text: string): string {
	const result: string[] = []
	for (const char of text) {
		const isLower = char === char.toLowerCase()
		result.push(isLower? char.toUpperCase() : char.toLowerCase())
	}
	return result.join('')
}

export function countString(text: string, regex: RegExp): number {
	return (text.match(regex) || []).length
}

export function reverseString(text: string): string {
	return [...text].reverse().join('')
}