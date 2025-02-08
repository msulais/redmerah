import { arrayJoin, arrayLength, arrayMap, arrayPush, arrayReverse } from "./array"

export function stringToLowerCase(text: string): string {
	return text.toLowerCase()
}

export function stringToUpperCase(text: string): string {
	return text.toUpperCase()
}

export function stringSplit(
	text: string,
	separator: string | RegExp,
	limit?: number
): string[] {
	return text.split(separator, limit)
}

export function stringSubstring(
	text: string,
	start: number,
	end?: number
): string {
	return text.substring(start, end)
}

export function stringToTitleCase(text: string): string {
	return arrayJoin(
		arrayMap(stringSplit(text, ' '), v =>
			stringToUpperCase(stringSubstring(v, 0, 1))
			+ stringSubstring(stringToLowerCase(v), 1)
		), ' ')
}

export function stringToToggleCase(text: string): string {
	const result: string[] = []
	for (const char of text) {
		const is_lower = char === stringToLowerCase(char)
		arrayPush(result, is_lower
			? stringToUpperCase(char)
			: stringToLowerCase(char)
		)
	}
	return arrayJoin(result, '')
}

export function stringCount(text: string, regex: RegExp): number {
	return arrayLength(stringMatch(text, regex) || [])
}

export function stringReverse(text: string): string {
	return arrayJoin(arrayReverse([...text]), '')
}

export function stringTrim(text: string): string {
	return text.trim()
}

export function stringReplace(
	text: string,
	searchValue: string | RegExp,
	replacer: string | ((substring: string, ...args: any[]) => string)
): string {
	return text.replace(searchValue, replacer as any)
}

export function stringReplaceAll(
	text: string,
	search_value: string | RegExp,
	replacer: string | ((substring: string, ...args: any[]) => string)
): string {
	return text.replaceAll(search_value, replacer as any)
}

export function stringMatch(
	text: string,
	matcher: string | RegExp
): RegExpMatchArray | null {
	return text.match(matcher)
}

export function stringMatchAll(
	text: string,
	regexp: RegExp
): RegExpMatchArray[] {
	return text.matchAll(regexp) as any
}

export function stringStartsWith(text: string, searchString: string, position?: number) {
	return text.startsWith(searchString, position)
}

export function stringSlice(text: string, start?: number, end?: number): string {
	return text.slice(start, end)
}

export function stringPadStart(text: string, maxLength: number, fillString?: string) {
	return text.padStart(maxLength, fillString)
}

export function stringPadEnd(text: string, maxLength: number, fillString?: string) {
	return text.padEnd(maxLength, fillString)
}

export function stringLength(text: string): number {
	return text.length
}

export function stringRepeat(text: string, count: number): string {
	return text.repeat(count)
}

export function stringLocaleCompare(a: string, b: string): number {
	return a.localeCompare(b)
}

export function stringIndexOf(text: string, searchString: string, position?: number): number {
	return text.indexOf(searchString, position)
}

export function stringCSSEscape(text: string): string {
	return CSS.escape(text)
}