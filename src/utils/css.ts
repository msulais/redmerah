import { elementBySelector } from "./element"

export function cssIsValidSelector(selector: string): boolean {
	const element = document.createDocumentFragment()
	try {
		elementBySelector(selector, element as unknown as HTMLElement)
	} catch { return false }

	return true
}

export function cssEscape(ident: string): string {
	return CSS.escape(ident)
}