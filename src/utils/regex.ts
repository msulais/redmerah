export function regexTest(regex: RegExp, text: string): boolean {
	return regex.test(text)
}