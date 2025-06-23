import { isObjectHasValue } from "./object"

export function setAttrIfExist(value: unknown, keepValue: boolean = false): string | undefined {
	if (!isObjectHasValue(value))
		return undefined

	if (typeof value === 'boolean' && !keepValue)
		return value? '' : undefined

	return keepValue? `${ value }` : ''
}

export function joinClassList(...classes: (string | undefined | null)[]): string {
	return classes
		.filter(n => typeof n === 'string')
		.join(' ')
		.trim()
}

export function joinClassListModule(...arr: string[]): Record<string, boolean> {
	const classlist: Record<string, boolean> = {}
	for (const i in arr) {
		classlist[arr[i]] = true
	}
	return classlist
}