import { BiruDialogElement } from "./components/br-dialog"
import { BiruPopoverElement } from "./components/br-popover"

const _elements = new Map<HTMLElement, {z_index: number, dismissable: boolean}>()
let _isListening = false

function _getHighestZIndex(): number {
	if (_elements.size === 0) {
		return 1000
	}

	return _elements.values().reduce((a, b) => a.z_index > b.z_index? a : b).z_index
}

function _initEscKey(): void {
	if (_isListening) {
		return
	}

	_isListening = true
	document.addEventListener('keydown', ev => {
		if (ev.key !== 'Escape') {
			return
		}

		const highest = _elements.entries().reduce((a, b) => a[1].z_index > b[1].z_index? a : b)
		if (!highest[1].dismissable) {
			return
		}

		const element = highest[0]
		if (element instanceof BiruPopoverElement) {
			element.$close()
		}
		else if (element instanceof BiruDialogElement) {
			element.$close()
		}
	})
}

/**
 * Get CSS value of `z-index` for new flyout if not registered yet.
 * If flyout update from dismissable to non-dismissable or vice versa,
 * register again.
 * @param element
 * @param dismissable
 * @returns
 */
export function registerZIndex(element: HTMLElement, dismissable = true): number {
	if (_elements.has(element)) {
		const zIndex = _elements.get(element)!.z_index
		_elements.set(element, {dismissable, z_index: zIndex})
		return zIndex
	}

	const zIndex = _getHighestZIndex() + 1
	_elements.set(element, {
		dismissable,
		z_index: zIndex
	})
	_initEscKey()
	return zIndex
}

export function unregisterZIndex(element: HTMLElement): void {
	_elements.delete(element)
}