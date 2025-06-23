import { AnimationEffectTiming } from "@/enums/animation"
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

export function animateUpdateTextElement(element: Element, text: string): void {
	const oldText = element.textContent ?? ''
	const newText = text
	if (oldText === newText) return

	const keepIndexs: [start: number, end: number][] = []
	const added: [type: 'add' | 'keep', txt: string][] = []
	let keepTxt = ''
	let addTxt = ''
	let startIndex: number | null = null
	let lastIndex = 0
	for (let i = 0; i < newText.length; i++) {
		const char = newText[i]
		let match = false
		lvl2: for (let j = lastIndex; j < oldText.length; j++) {
			match = oldText[j] === char
			if (match) {
				lastIndex = j + 1
				if (startIndex === null) startIndex = j

				break lvl2
			}
		}

		if (match) {
			if (addTxt.length > 0) added.push(['add', addTxt])
			addTxt = ''
			keepTxt += char
		}
		else {
			if (keepTxt.length > 0) {
				added.push(['keep', keepTxt])
				keepIndexs.push([startIndex!, startIndex! + keepTxt.length])
			}
			keepTxt = ''
			addTxt += char
			startIndex = null
		}
	}


	if (addTxt.length > 0) added.push(['add', addTxt])
	if (keepTxt.length > 0) {
		added.push(['keep', keepTxt])
		keepIndexs.push([startIndex!, startIndex! + keepTxt.length])
	}

	const spans: HTMLSpanElement[] = []
	const preChildren: (Node | string)[] = []
	for (const i in keepIndexs) {
		const start = keepIndexs[i][0]
		const end = keepIndexs[i][1]
		const before = oldText.substring(Number(i) === 0? 0 : keepIndexs[Number(i)-1][1], start)
		const span = document.createElement('span')
		span.textContent = oldText.substring(start, end).replaceAll(' ', '\xa0')
		preChildren.push(before, span)
		spans.push(span)

		if (Number(i) === keepIndexs.length-1) {
			const next = oldText.substring(end)
			preChildren.push(next)
		}
	}

	element.replaceChildren(...preChildren)

	// after replace children
	const keepRects: DOMRect[] = spans.map(v => v.getBoundingClientRect())
	spans.length = 0

	const additional: HTMLSpanElement[] = []
 	const nodes = added.map(v => {
		const type = v[0]
		const text = v[1]
		const span = document.createElement('span')
		span.textContent = text.replaceAll(' ', '\xa0')
		if (type === 'add') {
			additional.push(span)
		} else {
			spans.push(span)
		}

		return span
	})

	element.replaceChildren(...nodes)

	// after replace children
	const keepRects2: DOMRect[] = spans.map(v => v.getBoundingClientRect())
	for (const i in spans) {
		const span = spans[i]
		const rect1 = keepRects[i]
		const rect2 = keepRects2[i]
		if (!span || !rect1 || !rect2) continue

		span.animate({
			translate: [`${rect1.x - rect2.x}px ${rect1.y - rect2.y}px`, '0 0']
		}, {duration: 250, easing: AnimationEffectTiming.spring})
	}
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