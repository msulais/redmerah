import { isNumberDefined } from "./number"

export function isElementOverflowX(element: Element): boolean {
	return element.clientWidth < element.scrollWidth
}

export function isElementOverflowY(element: Element): boolean {
	return element.clientHeight < element.scrollHeight
}

export function isElementOverflow(element: Element): boolean {
	return isElementOverflowX(element) || isElementOverflowY(element)
}

export function focusAnyElement(
	parent: Element,
	condition?: (el: Element) => boolean
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
	const elements = parent.querySelectorAll<Element>(selector)
	for (const el of elements) {
		if (condition && !condition(el)) continue;

		try {
			(el as HTMLElement).focus()
		} catch {}

		if (document.activeElement === el) break
	}
}

export function isElementFocusable(element: Element): boolean {
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

	try {
		if ((element as HTMLElement).isContentEditable) return true
	} catch {}

	if (element.matches('[tabindex]')) {
		const tabindex = element.getAttribute('tabindex')
		if (tabindex && isNumberDefined(Number.parseInt(tabindex))) {
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
export function isTargetValidElement(
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