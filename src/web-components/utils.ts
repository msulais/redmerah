export function isSlotEmpty(slot: HTMLSlotElement): boolean {
	return slot.assignedNodes().filter(node =>
		node.nodeType !== Node.TEXT_NODE || (node.textContent ?? '').trim() !== ''
	).length === 0
}

export function shadowElementsListener(
	...elements: [element: Element, eventType: string, callback: (ev: Event) => unknown][]
) {
	for (const element of elements) {
		element[0].addEventListener(element[1], element[2])
	}

	return () => {
		for (const element of elements) {
			element[0].removeEventListener(element[1], element[2])
		}
	}
}

export function slotEmptyListeners(root: HTMLElement | ShadowRoot, ...values: [slot: string, part: string][]) {
	const allFn: [slot: HTMLSlotElement, fn: () => unknown][] = []
	for (const [slot, part] of values) {
		const el_slot = root.querySelector<HTMLSlotElement>(`[name="${slot}"]`)!
		const el_part = root.querySelector<HTMLSlotElement>(`[part="${part}"]`)!
		const fn = () => el_part.classList.toggle('empty', isSlotEmpty(el_slot))
		fn()
		el_slot.addEventListener('slotchange', fn)
		allFn.push([el_slot, fn])
	}

	return () => {
		for (const [slot, fn] of allFn) {
			slot.removeEventListener('slotchange', fn)
		}
	}
}

export class QueryValidation {
	private tokens: string[]
	private pos: number
	private checkCondition: ((condition: string) => boolean) | undefined
	private urlSearchParams: URLSearchParams

	/**
	 * @param queryString - The raw attribute string e.g., "(page=home | page=about) & !id=90 | none"
	 * @param checkConditionFn - A callback that takes "key=value" and returns true/false
	 */
	constructor(queryString: string, urlSearchParams: URLSearchParams, checkConditionFn?: (condition: string) => boolean) {
		this.tokens = queryString.match(/\||&|!|\(|\)|"[^"]+"|[^|&!()\s]+/g) || []
		this.pos = 0
		this.checkCondition = checkConditionFn
		this.urlSearchParams = urlSearchParams
	}

	// Helper to look at the current token
	private peek(): string | undefined {
		return this.tokens[this.pos]
	}

	// Helper to get the current token and move to the next one
	private consume(): string {
		return this.tokens[this.pos++]
	}

	// Evaluates OR (|) - Lowest priority
	private parseExpression(): boolean {
		let left = this.parseTerm()

		while (this.peek() === '|') {
			this.consume()
			let right = this.parseTerm()
			left = left || right
		}

		return left
	}

	// Evaluates AND (&) - Medium priority
	private parseTerm(): boolean {
		let left = this.parseFactor()

		while (this.peek() === '&') {
			this.consume()
			let right = this.parseFactor()
			left = left && right
		}

		return left
	}

	// Evaluates NOT (!), Parentheses (), and raw conditions - Highest priority
	private parseFactor(): boolean {
		const token = this.peek()

		if (!token) return false

		// Handle NOT
		if (token === '!') {
			this.consume()
			return !this.parseFactor()
		}

		// Handle Parentheses
		if (token === '(') {
			this.consume()
			let expr = this.parseExpression()

			if (this.peek() === ')') {
				this.consume()
			}
			else {
				console.warn(`query error: Missing closing parenthesis.`)
			}

			return expr
		}

		const operand = this.consume()
		const cleanOperand = operand.replace(/^"|"$/g, '')
		return this.checkCondition?.(cleanOperand) ?? (() => {
			if (cleanOperand === 'none' && this.urlSearchParams.size === 0) {
				return true
			}

			const [key, expectedValue] = cleanOperand.split('=')
			if (this.urlSearchParams.get(key) !== expectedValue) {
				return false
			}

			return true
		})()
	}

	public evaluate(): boolean {
		return this.tokens.length === 0? true : this.parseExpression()
	}
}