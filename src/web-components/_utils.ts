export function isSlotEmpty(slot: HTMLSlotElement): boolean {
	return slot.assignedNodes().filter(node =>
		node.nodeType !== Node.TEXT_NODE || (node.textContent ?? '').trim() !== ''
	).length === 0
}

export function slotEmptyListeners(root: HTMLElement | ShadowRoot, ...values: [slot: string, part: string][]) {
	const allFn: [slot: HTMLSlotElement, fn: () => unknown][] = []
	for (const [slot, part] of values) {
		const el_slot = root.querySelector<HTMLSlotElement>(`[name="${slot}"]`)!
		const el_part = root.querySelector<HTMLSlotElement>(`[part="${part}"]`)!
		const fn = () => el_part.toggleAttribute('data-empty', isSlotEmpty(el_slot))
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