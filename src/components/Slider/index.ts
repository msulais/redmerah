import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import './index.scss'
import { $add_event, $classlist, $create, $is_number, $query_all, $set_style } from "../utils"

export namespace CSlider {
	export type CElement = HTMLInputElement
	export type UpdateOptions = {
		Slider?: {
			value?: number
			min?: number
			max?: number
			refs?: {
				slider?(ref: CElement): unknown
			}
		}
	}

	export enum Classes {
		slider = 'c-slider'
	}

	export enum CSSVars {
		percent = '--c-slider-percent'
	}

	const REGISTERED_SLIDER: Set<CElement> = new Set<CElement>()

	function initSlider(ref_slider: CElement): void {
		function initEvents(): void {
			$add_event(ref_slider, 'input', () => setValue(ref_slider))
		}

		function initView(): void {
			setValue(ref_slider)
		}

		initView()
		initEvents()
	}

	export function register(...refs_slider: CElement[]): void {
		if (refs_slider.length === 0) {
			refs_slider = [...$query_all<CElement>('.' + Classes.slider)]
		}

		for (const ref of refs_slider){
			if (REGISTERED_SLIDER.has(ref)) {
				continue
			}

			REGISTERED_SLIDER.add(ref)
			initSlider(ref)
		}
	}

	export function unregister(...refs_slider: CElement[]): void {
		for (const ref of refs_slider) {
			REGISTERED_SLIDER.delete(ref)
		}
	}

	export function setValue(ref_slider: CElement, value?: number): void {
		const min = safeNumber(Number.parseFloat(ref_slider.min), 0)
		const max = safeNumber(Number.parseFloat(ref_slider.max), 100)
		if ($is_number(value)) {
			ref_slider.value = value + ''
		}

		const v = safeNumber(ref_slider.valueAsNumber, 0)
		const range = Math_clamp(v / (Math.max(min, max) - Math.min(min, max)) * 100, 0, 100)
		requestAnimationFrame(() => {
			$set_style(ref_slider, CSSVars.percent, range + '%')
		})
	}

	export function create(options?: UpdateOptions): CElement {
		const opt = options?.Slider
		const ref_slider = update($create('input'), {
			...options,
			Slider: {
				max: opt?.max ?? 100,
				min: opt?.min ?? 0,
				value: opt?.value ?? 0,
				...opt,
			}
		})
		register(ref_slider)
		return ref_slider
	}

	export function update(ref_slider: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Slider
		$classlist(ref_slider, Classes.slider)
		ref_slider.type = 'range'

		const opt_min = opt?.min
		if ($is_number(opt_min)) {
			ref_slider.min = opt_min + ''
		}

		const opt_max = opt?.max
		if ($is_number(opt_max)) {
			ref_slider.max = opt_max + ''
		}

		const opt_value = opt?.value
		if ($is_number(opt_value)) {
			ref_slider.value = opt_value + ''
		}

		setValue(ref_slider)
		const refs = opt?.refs
		refs?.slider?.(ref_slider)
		return ref_slider
	}
}

export type SliderProps = astroHTML.JSX.InputHTMLAttributes