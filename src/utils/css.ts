import { safeNumber } from "./number"

let _baseFontSize = 16
let _timeBaseFontSizeId: NodeJS.Timeout | number | null = null

export function isCSSSelectorValid(selector: string): boolean {
	const element = document.createDocumentFragment() as unknown as HTMLElement
	try {
		element.querySelector(selector)
	} catch { return false }

	return true
}

export function getBaseFontSize(): number {
	if (_timeBaseFontSizeId === null && typeof window !== 'undefined') {
		const root = document.documentElement
		const fontSize = getComputedStyle(root).fontSize
		const parsed = Number.parseFloat(fontSize)
		_baseFontSize = safeNumber(parsed)
		_timeBaseFontSizeId = setTimeout(() => _timeBaseFontSizeId = null, 1000)
	}

	return _baseFontSize
}

export function remToPx(rem: number): number {
	return rem * getBaseFontSize()
}

export function pxToRem(px: number) {
	return px / getBaseFontSize()
}