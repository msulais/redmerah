export function documentActive(): HTMLElement | null {
	return document.activeElement as HTMLElement | null
}

export function documentHasFocus(): boolean {
	return document.hasFocus()
}

export function documentRoot(): HTMLElement {
	return document.documentElement
}

export function documentBody(): HTMLElement {
	return document.body
}

export function documentHead(): HTMLElement {
	return document.head
}