export function $(id: string) {
	return document.getElementById(id)
}

export function $$<T extends HTMLElement>(
	selector: string,
	from: Document | Element | null = document
) {
	return from?.querySelector<T>(selector)
}

export function $$$<T extends HTMLElement>(
	selector: string,
	from: Document | Element = document
) {
	return from.querySelectorAll<T>(selector)
}