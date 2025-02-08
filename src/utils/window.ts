export function windowMatchMedia(query: string): MediaQueryList {
	return window.matchMedia(query)
}

export function windowMatches(query: string): boolean {
	return windowMatchMedia(query).matches
}

export function windowScrollY(): number {
	return window.scrollY
}

export function windowScrollX(): number {
	return window.scrollX
}

export function windowScrollTo(options?: ScrollToOptions): void {
	return window.scrollTo(options)
}

export function windowInnerHeight(): number {
	return window.innerHeight
}

export function windowInnerWidth(): number {
	return window.innerWidth
}