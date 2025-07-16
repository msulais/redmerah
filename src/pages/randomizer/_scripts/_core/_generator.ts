import { ObservableStore } from "@/utils/store"
import { NavigationStore } from "./_navigation"
import { Pages } from "../_shared/_enums"
import { StringStore, updateOutput as updateStringOutput } from "../_features/_string"
import { SettingsStore } from "./_settings"
import type { ButtonElement, IconButtonElement } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "./_dom-utils"
import { IconClasses, type IconElement } from "@/components/Icon"
import { BodyAttributes, GlobalAttributes } from "@/enums/attributes"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { NumbersStore, updateOutput as updateNumbersOutput } from "../_features/_numbers"
import { ColorsStore, updateOutput as updateColorsOutput } from "../_features/_colors"
import { updateOutput as updateWordsOutput, WordsStore } from "../_features/_words"
import { SelectionStore, updateOutput as updateSelectionOutput } from "../_features/_selection"
import { TeamsStore, updateOutput as updateTeamsOutput } from "../_features/_teams"
import type { ToastElement } from "@/components/Toast"
import type { DialogElement } from "@/components/Dialog"
import { hexToRgb, rgbToHsl } from "@/utils/color"

export type GeneratorStoreType = Readonly<{
	isGenerating: boolean
}>

export const GeneratorStore = new ObservableStore<GeneratorStoreType>({
	isGenerating: false
})
const _generatorBtnRef = $(ElementIds.ap_generator) as ButtonElement
const _generatorIconRef = $$(`#${CSS.escape(ElementIds.ap_generator)}>.${IconClasses.icon}`) as IconElement
const _generatorTextRef = $$(`#${CSS.escape(ElementIds.ap_generator)}>div`) as HTMLDivElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
const _copyBtnRef = $(ElementIds.ap_copyBtn) as IconButtonElement
const _copyColorsDialogRef = $(ElementIds.ap_copyColorsDialog) as DialogElement
const _copyColorsBtnRef = $(ElementIds.ap_copyColorsBtn) as ButtonElement
const _copyColorsHexRef = $(ElementIds.ap_copyColorsHex) as HTMLInputElement
const _copyColorsRgbRef = $(ElementIds.ap_copyColorsRgb) as HTMLInputElement
const _copyColorsHslRef = $(ElementIds.ap_copyColorsHsl) as HTMLInputElement
let _intervalId: NodeJS.Timeout | number | null = null

function _subsIsGeneratingView(v: GeneratorStoreType): void {
	const isGenerating = v.isGenerating
	document.body.toggleAttribute(BodyAttributes.noPointerEvent, isGenerating)
	_generatorBtnRef.toggleAttribute(GlobalAttributes.keepPointerEvent, isGenerating)
	_generatorTextRef.textContent = isGenerating? 'Generating' : 'Generate'

	for (const anim of _generatorIconRef.getAnimations()) {
		anim.cancel()
	}

	if (!isAnimationAllowed() || SettingsStore.value.instantResult) {return}

	const easing = AnimationEffectTiming.spring
	_generatorTextRef.animate({
		translate: [`0 ${isGenerating? -12 : 12}px`, '0 0'],
		scale: [.9, 1],
		opacity: [0, 1]
	}, {duration: 250, easing})
	if (!isGenerating) {return}

	_generatorIconRef.animate({
		rotate: '180deg'
	}, {
		duration: 500,
		iterations: Infinity,
		easing
	})
}

function _subsIsGeneratingChanges(v: GeneratorStoreType, o: GeneratorStoreType): void {
	const isGenerating = v.isGenerating
	if (isGenerating === o.isGenerating) {return}

	if (_intervalId !== null) {
		clearInterval(_intervalId)
		_intervalId = null
	}

	if (!isGenerating) {return}

	const page = NavigationStore.value.page
	const generate = () => {
		switch (page) {
		case Pages.string:
			updateStringOutput()
			break
		case Pages.numbers:
			updateNumbersOutput()
			break
		case Pages.colors:
			updateColorsOutput()
			break
		case Pages.words:
			updateWordsOutput()
			break
		case Pages.selection:
			updateSelectionOutput()
			break
		case Pages.teams:
			updateTeamsOutput()
		}
	}
	if (SettingsStore.value.instantResult) {
		generate()
		GeneratorStore.update(v => v.isGenerating = true)
		return
	}

	const duration = 3000
	const step = 250
	let i = 0
	_intervalId = setInterval(() => {
		if (i >= duration / step) {
			GeneratorStore.update(v => v.isGenerating = false)
			return
		}

		generate()
		++i
	}, step)
}

function _initSubscriber(): void {
	GeneratorStore.subscribe(_subsIsGeneratingChanges)
	GeneratorStore.subscribe(_subsIsGeneratingView)
}

function _initEvents(): void {
	_generatorBtnRef.addEventListener('click', () => {
		GeneratorStore.update(v => v.isGenerating = !v.isGenerating)
	})

	_copyBtnRef.addEventListener('click', () => {
		const copy = (text: string) => navigator.clipboard.writeText(text).then((() => {
			_toastCopiedRef.showPopover()
		})).catch()
		switch (NavigationStore.value.page) {
		case Pages.string:
			copy(StringStore.value.output)
			break
		case Pages.words:
			copy(WordsStore.value.output)
			break
		case Pages.numbers:
			copy(NumbersStore.value.output)
			break
		case Pages.colors:
			_copyColorsDialogRef.showModal()
			break
		case Pages.selection: {
			const store = SelectionStore.value
			const output = store.output
			const items = store.listItems
			const text: string[] = []
			for (const item of items) {
				const isSelected = output.some(v => item === v)
				text.push(item + (isSelected? ' ✔️' : ''))
			}

			copy(text.join('\n'))
			break
		}
		case Pages.teams: {
			const output = TeamsStore.value.output
			copy(output.map(v => [`# ${v[0]}`, ...v.slice(1)].join('\n')).join('\n\n'))
			break
		}}
	})

	_copyColorsBtnRef.addEventListener('click', () => {
		const isHex = _copyColorsHexRef.checked
		const isRgb = _copyColorsRgbRef.checked
		const isHsl = _copyColorsHslRef.checked
		if (!isHex && !isRgb && !isHsl) {return}

		const r = (v: number) => Math.round(v)
		const text: string[][] = []
		for (const hex of ColorsStore.value.output) {
			const t: string[] = []
			if (isHex) {
				t.push(hex.toUpperCase())
			}

			const rgb = hexToRgb(hex)
			if (isRgb) {
				t.push(`rgb(${r(rgb.r * 0xff)}, ${r(rgb.g * 0xff)}, ${r(rgb.b * 0xff)})`)
			}

			if (isHsl) {
				const hsl = rgbToHsl(rgb)
				t.push(`hsl(${r(hsl.h * 360)}, ${r(hsl.s * 100)}%, ${r(hsl.l * 100)}%)`)
			}

			text.push(t)
		}

		navigator.clipboard.writeText(text.map(v => v.join(', ')).join('\n')).then(() => {
			_toastCopiedRef.showPopover()
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}