import { objectHasValue } from "./object"

export function attrSetIfExist(value: unknown, keepValue: boolean = false): string | undefined {
	if (!objectHasValue(value))
		return undefined

	if (typeof value === 'boolean' && !keepValue)
		return value? '' : undefined

	return keepValue? `${ value }` : ''
}

export function attrClassList(...classes: (string | undefined | null)[]): string {
	return classes
		.filter(n => typeof n === 'string')
		.join(' ')
		.trim()
}

export function attrClassListModule(...arr: string[]): Record<string, boolean> {
	const classlist: Record<string, boolean> = {}
	for (const i in arr) {
		classlist[arr[i]] = true
	}
	return classlist
}