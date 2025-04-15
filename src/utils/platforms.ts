export function isTouchScreen(): boolean {
	return window.matchMedia('(hover:none)').matches
}

export function isDesktop(): boolean {
	return !isTouchScreen()
}