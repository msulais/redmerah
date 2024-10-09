import { CookieKeys } from "@/enums/cookies"
import { decodeURL, encodeURL } from "./url";
import { _maxAge, _path, _domain, _sameSite, _secure, _httpOnly, _length, _expires, _getTime, _setTime, _toUTCString, _cookie, _substring, _indexOf, _split, _trim } from "@/constants/string";
import { getDocument } from "@/constants/window";

type CookieOptions = {
	domain?: string,
	expires?: number,
	maxAge?: number,
	path?: string,
	sameSite?: 'Lax' | 'Strict' | 'None',
	secure?: boolean,
	httpOnly?: boolean
}

export function setCookie(key: CookieKeys, value: string, options: CookieOptions = {sameSite: 'Lax', expires: 9999, path: '/'}): void {
	let cookie = key + "=" + encodeURL(value)

	if (options[_expires]) {
		const expirationDate = new Date()
		expirationDate[_setTime](expirationDate[_getTime]() + (options[_expires] * 24 * 60 * 60 * 1000))
		cookie += ("; expires=" + expirationDate[_toUTCString]())
	}
	if (options[_maxAge]  ) cookie += ("; max-age=" + options[_maxAge])
	if (options[_path]    ) cookie += (`; ${_path}=` + options[_path])
	if (options[_domain]  ) cookie += (`; ${_domain}=` + options[_domain])
	if (options[_sameSite]) cookie += ("; SameSite=" + options[_sameSite])
	if (options[_secure]  ) cookie += (`; ${_secure}`)
	if (options[_httpOnly]) cookie += (`; ${_httpOnly}`)

	getDocument()[_cookie] = cookie
}

export function getCookie(key: CookieKeys): string | null {

	const cookieName = key + "="
	const cookies = getDocument()[_cookie][_split](';')

	for (const i in cookies) {
		const cookie = cookies[i][_trim]()

		if (cookie[_indexOf](cookieName) === 0) {
			return decodeURL(cookie[_substring](cookieName[_length]))
		}
	}

	return null
}