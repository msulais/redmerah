import { numberIsDefined } from "./number"

export function elementIsOverflowX(element: HTMLElement): boolean {
	return element.clientWidth < element.scrollWidth
}

export function elementIsOverflowY(element: HTMLElement): boolean {
	return element.clientHeight < element.scrollHeight
}

export function elementIsOverflow(element: HTMLElement): boolean {
	return elementIsOverflowX(element) || elementIsOverflowY(element)
}

export function elementFocusAny(
	parent: HTMLElement,
	condition?: (el: HTMLElement) => boolean
): void {
	const selector = ':is(' +  [
		'[contenteditable]',
		'[tabindex]',
		'a[href]',
		'area[href]',
		'button:not(:disabled)',
		'select:not(:disabled)',
		'input:not(:disabled)',
		'textarea:not(:disabled)',
		'iframe:not(:disabled)',
	].join(',') + ')'
	const elements = parent.querySelectorAll(selector)
	for (const el of elements) {
		if (condition && !condition(el as HTMLElement)) continue;

		(el as HTMLElement).focus()
		if (document.activeElement === el) break
	}
}

export function elementIsFocusable(element: HTMLElement): boolean {
	const visible = element.checkVisibility({
		contentVisibilityAuto: true,
		visibilityProperty: true,
	})
	const connected = element.isConnected
	if (!visible || !connected) return false

	const disabled = element.matches('[disabled]')
	if (disabled) return false

	const tagname = element.tagName
	if (
		tagname === 'BUTTON'
		|| tagname === 'SELECT'
		|| tagname === 'INPUT'
		|| tagname === 'TEXTAREA'
		|| tagname === 'IFRAME'
	) return true

	if ((
			tagname === 'A'
			|| tagname === 'AREA'
		)
		&& element.matches('[href]')
	) return true

	if (element.isContentEditable) return true
	if (element.matches('[tabindex]')) {
		const tabindex = element.getAttribute('tabindex')
		if (tabindex && numberIsDefined(Number.parseInt(tabindex))) {
			return true
		}
	}

	return false
}

/**
 * Validation helper for event delegation.
 * @param parent
 * @param target if emtpy, `document.activeElement` will be used.
 * @param condition
 * @returns
 */
export function elementValidTarget(
	parent: Element,
	target?: Element | null,
	condition?: (el: Element) => boolean
): boolean {
	if (!target) target = document.activeElement
	return Boolean(
		target
		&& parent.contains(target)
		&& (condition?.(target) ?? true)
	)
}