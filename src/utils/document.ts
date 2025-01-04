export function document_active(): HTMLElement | null {
	return document.activeElement as HTMLElement | null
}

export function document_has_focus(): boolean {
	return document.hasFocus()
}

export function document_root(): HTMLElement {
	return document.documentElement
}

export function document_body(): HTMLElement {
	return document.body
}

export function document_head(): HTMLElement {
	return document.head
}