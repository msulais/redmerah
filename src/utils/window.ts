export function window_match_media(query: string): MediaQueryList {
	return window.matchMedia(query)
}

export function window_matches(query: string): boolean {
	return window_match_media(query).matches
}

export function window_scroll_y(): number {
	return window.scrollY
}

export function window_scroll_x(): number {
	return window.scrollX
}

export function window_scrollto(options?: ScrollToOptions): void {
	return window.scrollTo(options)
}

export function window_inner_height(): number {
	return window.innerHeight
}

export function window_inner_width(): number {
	return window.innerWidth
}