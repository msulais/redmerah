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

	for (const span of additional) {
		span.animate({
			scale: [0.75, 1],
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