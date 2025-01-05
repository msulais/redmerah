import { array_join, array_length, array_map, array_push, array_reverse } from "./array"

/** Converts all the alphabetic characters in a string to lowercase. */
export function string_tolowercase(text: string): string {
	return text.toLowerCase()
}

/** Converts all the alphabetic characters in a string to uppercase. */
export function string_touppercase(text: string): string {
	return text.toUpperCase()
}

/**
 * Split a string into substrings using the specified separator and return them
 * as an array.
 * @param separator An object that can split a string.
 * @param limit
 * A value used to limit the number of elements returned in the array.
 */
export function string_split(
	text: string,
	separator: string | RegExp,
	limit?: number
): string[] {
	return text.split(separator, limit)
}

/**
 * Returns the substring at the specified location within a String object.
 * @param start
 * The zero-based index number indicating the beginning of the substring.
 * @param end
 * Zero-based index number indicating the end of the substring. The substring
 * includes the characters up to, but not including, the character indicated by
 * end. If end is omitted, the characters from start through the end of the
 * original string are returned.
 */
export function string_substring(
	text: string,
	start: number,
	end?: number
): string {
	return text.substring(start, end)
}

export function string_totitlecase(text: string): string {
	return array_join(
		array_map(string_split(text, ' '), v =>
			string_touppercase(string_substring(v, 0, 1))
			+ string_substring(string_tolowercase(v), 1)
		), ' ')
}

export function string_totogglecase(text: string): string {
	const result: string[] = []
	for (const char of text) {
		const is_lower = char === string_tolowercase(char)
		array_push(result, is_lower
			? string_touppercase(char)
			: string_tolowercase(char)
		)
	}
	return array_join(result, '')
}

export function string_count(text: string, regex: RegExp): number {
	return array_length(string_match(text, regex) || [])
}

export function string_reverse(text: string): string {
	return array_join(array_reverse([...text]), '')
}

/**
 * Removes the leading and trailing white space and line terminator characters
 * from a string.
 * @param text
 * @returns
 */
export function string_trim(text: string): string {
	return text.trim()
}


export function string_replace(
	text: string,
	search_value: string | RegExp,
	replacer: string | ((substring: string, ...args: any[]) => string)
): string {
	return text.replace(search_value, replacer as any)
}

export function string_replaceall(
	text: string,
	search_value: string | RegExp,
	replacer: string | ((substring: string, ...args: any[]) => string)
): string {
	return text.replaceAll(search_value, replacer as any)
}

/**
 * Matches a string or an object that supports being matched against, and
 * returns an array containing the results of that search, or null if no matches
 * are found.
 * @param matcher An object that supports being matched against.
 */
export function string_match(
	text: string,
	matcher: string | RegExp
): RegExpMatchArray | null {
	return text.match(matcher)
}

/**
 * Matches a string with a regular expression, and returns an iterable of
 * matches containing the results of that search.
 * @param regexp A variable name or string literal containing the regular
 * expression pattern and flags.
 */
export function string_matchall(
	text: string,
	regexp: RegExp
): RegExpMatchArray[] {
	return text.matchAll(regexp) as any
}

/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
export function string_starts_with(text: string, search_string: string, position?: number) {
	return text.startsWith(search_string, position)
}

/**
 * Returns a section of a string.
 * @param start The index to the beginning of the specified portion of stringObj.
 * @param end The index to the end of the specified portion of stringObj. The substring includes the
 * characters up to, but not including, the character indicated by end. If this value is not
 * specified, the substring continues to the end of stringObj.
 */
export function string_slice(text: string, start?: number, end?: number): string {
	return text.slice(start, end)
}

/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string
 * reaches a given length. The padding is applied from the start (left) of the current string.
 * @param mex_length The length of the resulting string once the current string has been padded. If
 * this parameter is smaller than the current string's length, the current string will be returned
 * as it is.
 * @param fill_string The string to pad the current string with. If this string is too long, it will
 * be truncated and the left-most part will be applied. The default value for this parameter is " "
 * (U+0020).
 */
export function string_padstart(text: string, mex_length: number, fill_string?: string) {
	return text.padStart(mex_length, fill_string)
}

/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string
 * reaches a given length. The padding is applied from the end (right) of the current string.
 * @param max_length The length of the resulting string once the current string has been padded. If
 * this parameter is smaller than the current string's length, the current string will be returned
 * as it is.
 * @param fill_string The string to pad the current string with. If this string is too long, it will
 * be truncated and the left-most part will be applied. The default value for this parameter is " "
 * (U+0020).
 */
export function string_padend(text: string, mex_length: number, fill_string?: string) {
	return text.padEnd(mex_length, fill_string)
}

/** Returns the length of a String object */
export function string_length(text: string): number {
	return text.length
}

/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * the empty string is returned.
 * @param count number of copies to append
 */
export function string_repeat(text: string, count: number): string {
	return text.repeat(count)
}

/**
 * Determines whether two strings are equivalent in the current or specified locale.
 * @param that String to compare to target string
 * @param locales A locale string or array of locale strings that contain one or more language or
 * locale tags. If you include more than one locale string, list them in descending order of
 * priority so that the first entry is the preferred locale. If you omit this parameter, the default
 * locale of the JavaScript runtime is used. This parameter must conform to BCP 47 standards; see
 * the Intl.Collator object for details.
 * @param options An object that contains one or more properties that specify comparison options.
 * see the Intl.Collator object for details.
 */
export function string_locale_compare(a: string, b: string): number {
	return a.localeCompare(b)
}

/**
 * Returns the position of the first occurrence of a substring.
 * @param search_string The substring to search for in the string
 * @param position The index at which to begin searching the String object. If omitted, search
 * starts at the beginning of the string.
 */
export function string_indexof(text: string, search_string: string, position?: number): number {
	return text.indexOf(search_string, position)
}

export function string_css_escape(text: string): string {
	return CSS.escape(text)
}