export function isCSSSelectorValid(selector: string): boolean {
	const element = document.createDocumentFragment() as unknown as HTMLElement
	try {
		element.querySelector(selector)
	} catch { return false }

	return true
}