import { AnimationEffectTiming } from "@/enums/animation"
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

export function elementAnimateUpdateText(element: HTMLElement, text: string): void {
	const oldText = element.textContent ?? ''
	const newText = text
	if (oldText === newText) return

	const added: [type: 'add' | 'keep', txt: string][] = []
	let keepTxt = ''
	let addTxt = ''
	let lastIndex = 0
	for (let i = 0; i < newText.length; i++) {
		const char = newText[i]
		let match = false
		lvl2: for (let j = lastIndex; j < oldText.length; j++) {
			match = oldText[j] === char
			if (match) {
				lastIndex = j
				break lvl2
			}
		}

		if (match) {
			if (addTxt.length > 0) added.push(['add', addTxt])
			addTxt = ''
			keepTxt += char
		}
		else {
			if (keepTxt.length > 0) added.push(['keep', keepTxt])
			keepTxt = ''
			addTxt += char
		}
	}

	if (addTxt.length > 0) added.push(['add', addTxt])
	if (keepTxt.length > 0) added.push(['keep', keepTxt])

	const spans: HTMLSpanElement[] = []
 	const nodes = added.map(v => {
		const type = v[0]
		const text = v[1]
		if (type === 'add') {
			const span = document.createElement('span')
			span.textContent = text
			span.style.setProperty('display', 'inline-block')
			spans.push(span)
			return span
		}

		return text
	})

	element.replaceChildren(...nodes)
	for (const span of spans) {
		span.animate({
			// scale: [0, 1],
			transform: ['translateY(0.5em)', 'translateY(0)'],
			opacity: [0, 1]
		}, {duration: 250, easing: AnimationEffectTiming.spring})
	}
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