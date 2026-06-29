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
		result.push(isLower ? char.toUpperCase() : char.toLowerCase())
	}
	return result.join('')
}

export function countString(text: string, regex: RegExp): number {
	return (text.match(regex) || []).length
}

export function reverseString(text: string): string {
	return [...text].reverse().join('')
}

export function stringHash(str: string): string {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
	}
	return (hash >>> 0).toString(36)
}

/**
 * @deprecated
 * @param input
 * @param length
 * @returns
 */
export function stringToHash(input: string, length = 4): string {
	length = Math.floor(length)
	if (length <= 0) return ""

	const FNV_OFFSET_BASIS = 0xcbf29ce484222325n
	const FNV_PRIME = 0x100000001b3n
	const MASK_64 = 0xFFFFFFFFFFFFFFFFn

	const toUtf8Bytes = (s: string): Uint8Array => {
		if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s)

		const bytes: number[] = []
		for (let i = 0; i < s.length; i++) {
			let cp = s.charCodeAt(i)

			if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < s.length) {
				const low = s.charCodeAt(i + 1)
				if (low >= 0xdc00 && low <= 0xdfff) {
					cp = ((cp - 0xd800) << 10) + (low - 0xdc00) + 0x10000
					i++
				}
			}

			if (cp <= 0x7f) {
				bytes.push(cp)
			} else if (cp <= 0x7ff) {
				bytes.push(0xc0 | (cp >> 6))
				bytes.push(0x80 | (cp & 0x3f))
			} else if (cp <= 0xffff) {
				bytes.push(0xe0 | (cp >> 12))
				bytes.push(0x80 | ((cp >> 6) & 0x3f))
				bytes.push(0x80 | (cp & 0x3f))
			} else {
				bytes.push(0xf0 | (cp >> 18))
				bytes.push(0x80 | ((cp >> 12) & 0x3f))
				bytes.push(0x80 | ((cp >> 6) & 0x3f))
				bytes.push(0x80 | (cp & 0x3f))
			}
		}

		return new Uint8Array(bytes)
	}

	const fnv1a64Hex = (s: string): string => {
		const bytes = toUtf8Bytes(s)
		let h = FNV_OFFSET_BASIS
		for (let i = 0; i < bytes.length; i++) {
			h ^= BigInt(bytes[i]!)
			h = (h * FNV_PRIME) & MASK_64
		}

		return h.toString(16).padStart(16, "0")
	}

	let out = ""
	let counter = 0
	while (out.length < length) {
		const keyedInput = counter === 0 ? input : input + "\u0000" + String(counter)
		out += fnv1a64Hex(keyedInput)
		counter++
	}

	return out.slice(0, length)
}

export function advancedStringSearch(
	search: string,
	text: string,
	isSearchNormalized: boolean = false
): boolean {
	let searchNormalized = search
	if (!isSearchNormalized) {
		searchNormalized = search.replace(/\s+/g, '')
	}

	const searchLen = searchNormalized.length
	if (searchLen === 0) {
		return true
	}

	let j = 0
	const searchLower = searchNormalized.toLowerCase()
	for (let i = 0; i < text.length && j < searchLen; i++) {
		if (text[i]!.toLowerCase() === searchLower[j]) {
			j++
		}
	}

	return j === searchLen
}