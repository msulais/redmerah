type CookieOptions = {
	domain?: string,
	expires?: number,
	maxAge?: number,
	path?: string,
	sameSite?: 'Lax' | 'Strict' | 'None',
	secure?: boolean,
	httpOnly?: boolean
}

export function setCookie(
	key: string,
	value: string,
	options: CookieOptions = {sameSite: 'Lax', expires: 9999, path: '/'}
): void {
	let cookie = key + "=" + encodeURI(value)

	if (options.expires) {
		const expirationDate = new Date()
		expirationDate.setTime(
			expirationDate.getTime() + (options.expires * 24 * 60 * 60 * 1000)
		)
		cookie += ("; expires=" + expirationDate.toUTCString())
	}
	if (options.maxAge  ) cookie += ("; max-age=" + options.maxAge)
	if (options.path    ) cookie += (`; path=` + options.path)
	if (options.domain  ) cookie += (`; domain=` + options.domain)
	if (options.sameSite) cookie += ("; SameSite=" + options.sameSite)
	if (options.secure  ) cookie += (`; secure`)
	if (options.httpOnly) cookie += (`; httpOnly`)

	document.cookie = cookie
}

export function getCookie(key: string): string | null {
	const cookieName = key + "="
	const cookies = document.cookie.split(';')
	for (const i in cookies) {
		const cookie = cookies[i]!.trim()

		if (cookie.indexOf(cookieName) === 0) {
			return decodeURI(cookie.substring(cookieName.length))
		}
	}

	return null
}