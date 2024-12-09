/**
 * Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
 * @param text String on which to perform the search.
 */
export function regex_test(regex: RegExp, text: string): boolean {
	return regex.test(text)
}