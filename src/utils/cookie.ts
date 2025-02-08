import { CookieKeys } from "@/enums/cookies"
import { urlDecode, urlEncode } from "./url"
import { dateTime, dateTimeSet, dateToUTC } from "./datetime"
import { stringIndexOf, stringLength, stringSplit, stringSubstring, stringTrim } from "./string"

type CookieOptions = {
	domain?: string,
	expires?: number,
	maxAge?: number,
	path?: string,
	sameSite?: 'Lax' | 'Strict' | 'None',
	secure?: boolean,
	httpOnly?: boolean
}

export function cookieSet(
	key: CookieKeys,
	value: string,
	options: CookieOptions = {sameSite: 'Lax', expires: 9999, path: '/'}
): void {
	let cookie = key + "=" + urlEncode(value)

	if (options.expires) {
		const expiration_date = new Date()
		dateTimeSet(
			expiration_date,
			dateTime(expiration_date) + (options.expires * 24 * 60 * 60 * 1000)
		)
		cookie += ("; expires=" + dateToUTC(expiration_date))
	}
	if (options.maxAge  ) cookie += ("; max-age=" + options.maxAge)
	if (options.path    ) cookie += (`; path=` + options.path)
	if (options.domain  ) cookie += (`; domain=` + options.domain)
	if (options.sameSite) cookie += ("; SameSite=" + options.sameSite)
	if (options.secure  ) cookie += (`; secure`)
	if (options.httpOnly) cookie += (`; httpOnly`)

	document.cookie = cookie
}

export function cookieGet(key: CookieKeys): string | null {
	const cookieName = key + "="
	const cookies = stringSplit(document.cookie, ';')
	for (const i in cookies) {
		const cookie = stringTrim(cookies[i])

		if (stringIndexOf(cookie, cookieName) === 0) {
			return urlDecode(stringSubstring(cookie, stringLength(cookieName)))
		}
	}

	return null
}