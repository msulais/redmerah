export function document_active(): HTMLElement | null {
	return document.activeElement as HTMLElement | null
}

export function document_has_focus(): boolean {
	return document.hasFocus()
}