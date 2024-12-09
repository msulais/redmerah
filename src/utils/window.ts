export function window_match_media(query: string): MediaQueryList {
	return window.matchMedia(query)
}

export function is_window_media_matches(query: string): boolean {
	return window_match_media(query).matches
}