const _elements = new Map<HTMLElement, {
	z_index: number,
	onEscKey?: (ref: HTMLElement) => unknown
}>()
let _isListening = false

function _getHighestZIndex(): number {
	if (_elements.size === 0) {
		return 999999
	}

	return _elements.values().reduce((a, b) => a.z_index > b.z_index? a : b).z_index
}

function _initEscKeyListener(): void {
	if (_isListening) {
		return
	}

	_isListening = true
	document.addEventListener('keydown', ev => {
		if (ev.key !== 'Escape' || _elements.size <= 0) {
			return
		}

		const highest = _elements.entries().reduce((a, b) => a[1].z_index > b[1].z_index? a : b)
		highest[1].onEscKey?.(highest[0])
	})
}

/**
 * Get CSS value of `z-index` for new flyout or element that need highest z-index.
 * Register again if need the highest z-index.
 * @param element
 * @param onEscKey
 * @returns
 */
export function registerZIndex<T extends HTMLElement = HTMLElement>(element: T, onEscKey?: (ref: T) => unknown): number {
	if (_elements.has(element)) {
		_elements.delete(element)
	}

	const zIndex = _getHighestZIndex() + 1
	_elements.set(element, {
		onEscKey: onEscKey as ((ref: HTMLElement) => unknown) | undefined,
		z_index: zIndex
	})
	_initEscKeyListener()
	return zIndex
}

export function unregisterZIndex(element: HTMLElement): void {
	_elements.delete(element)
}