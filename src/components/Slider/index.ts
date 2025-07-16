import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import './index.scss'

type SliderProps = astroHTML.JSX.InputHTMLAttributes

type SliderElement = HTMLInputElement

type SliderUpdateOptions = {
	SliderValue?: number
	SliderMin?: number
	SliderMax?: number
	SliderRefs?: {
		slider?(ref: SliderElement): unknown
	}
}

enum SliderClasses {
	slider = 'c-slider'
}

enum SliderCSSVariables {
	percent = '--c-slider-percent'
}

const REGISTERED_SLIDER: Set<SliderElement> = new Set<SliderElement>()

function _initSliderRef(sliderRef: SliderElement): void {
	function initEvents(): void {
		sliderRef.addEventListener('input', () => {
			updateSliderRefValue(sliderRef)
		})
	}

	function initView(): void {
		updateSliderRefValue(sliderRef)
	}

	initView()
	initEvents()
}

function registerSliderRef(...sliderRefs: SliderElement[]): void {
	if (sliderRefs.length === 0) {
		sliderRefs = [...document.querySelectorAll<SliderElement>('.' + SliderClasses.slider)]
	}

	for (const ref of sliderRefs){
		if (REGISTERED_SLIDER.has(ref)) {
			continue
		}

		REGISTERED_SLIDER.add(ref)
		_initSliderRef(ref)
	}
}

function unregisterSliderRef(...sliderRefs: SliderElement[]): void {
	for (const ref of sliderRefs) {
		REGISTERED_SLIDER.delete(ref)
	}
}

function updateSliderRefValue(sliderRef: SliderElement, value?: number): void {
	const min = safeNumber(Number.parseFloat(sliderRef.min), 0)
	const max = safeNumber(Number.parseFloat(sliderRef.max), 100)
	if (typeof value === 'number') {
		sliderRef.value = value + ''
	}

	const v = safeNumber(sliderRef.valueAsNumber, 0)
	const range = Math_clamp(v / (Math.max(min, max) - Math.min(min, max)) * 100, 0, 100)
	requestAnimationFrame(() => {
		sliderRef.style.setProperty(SliderCSSVariables.percent, range + '%')
	})
}

function createSliderRef(options?: SliderUpdateOptions): SliderElement {
	const sliderRef = updateSliderRef(document.createElement('input'), {
		...options,
		SliderMax: options?.SliderMax ?? 100,
		SliderMin: options?.SliderMin ?? 0,
		SliderValue: options?.SliderValue ?? 0,
	})
	registerSliderRef(sliderRef)
	return sliderRef
}

function updateSliderRef(sliderRef: SliderElement, options?: SliderUpdateOptions): SliderElement {
	sliderRef.classList.add(SliderClasses.slider)
	sliderRef.type = 'range'
	const minOption = options?.SliderMin
	if (typeof minOption === 'number') {
		sliderRef.min = minOption + ''
	}

	const maxOption = options?.SliderMax
	if (typeof maxOption === 'number') {
		sliderRef.max = maxOption + ''
	}

	const valueOption = options?.SliderValue
	if (typeof valueOption === 'number') {
		sliderRef.value = valueOption + ''
	}

	updateSliderRefValue(sliderRef)

	const refs = options?.SliderRefs
	refs?.slider?.(sliderRef)
	return sliderRef
}

export {
	type SliderProps,
	type SliderUpdateOptions,
	type SliderElement,
	SliderClasses,
	SliderCSSVariables,
	registerSliderRef,
	unregisterSliderRef,
	updateSliderRefValue,
	createSliderRef,
	updateSliderRef
}