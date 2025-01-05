import { CookieKeys } from "@/enums/cookies"
import { url_decode, url_encode } from "./url"
import { date_gettime, date_settime, date_to_UTC } from "./datetime"
import { string_indexof, string_length, string_split, string_substring, string_trim } from "./string"

type CookieOptions = {
	domain?: string,
	expires?: number,
	max_age?: number,
	path?: string,
	same_site?: 'Lax' | 'Strict' | 'None',
	secure?: boolean,
	http_only?: boolean
}

export function set_cookie(
	key: CookieKeys,
	value: string,
	options: CookieOptions = {same_site: 'Lax', expires: 9999, path: '/'}
): void {
	let cookie = key + "=" + url_encode(value)

	if (options.expires) {
		const expiration_date = new Date()
		date_settime(
			expiration_date,
			date_gettime(expiration_date) + (options.expires * 24 * 60 * 60 * 1000)
		)
		cookie += ("; expires=" + date_to_UTC(expiration_date))
	}
	if (options.max_age  ) cookie += ("; max-age=" + options.max_age)
	if (options.path     ) cookie += (`; path=` + options.path)
	if (options.domain   ) cookie += (`; domain=` + options.domain)
	if (options.same_site) cookie += ("; SameSite=" + options.same_site)
	if (options.secure   ) cookie += (`; secure`)
	if (options.http_only) cookie += (`; httpOnly`)

	document.cookie = cookie
}

export function get_cookie(key: CookieKeys): string | null {

	const cookieName = key + "="
	const cookies = string_split(document.cookie, ';')

	for (const i in cookies) {
		const cookie = string_trim(cookies[i])

		if (string_indexof(cookie, cookieName) === 0) {
			return url_decode(string_substring(cookie, string_length(cookieName)))
		}
	}

	return null
}