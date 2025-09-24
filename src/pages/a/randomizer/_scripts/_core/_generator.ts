import { ObservableStore } from "@/utils/store"
import { NavigationStore } from "./_navigation"
import { Pages } from "../_shared/_enums"
import { StringStore, updateOutput as updateStringOutput } from "../_features/_string"
import { SettingsStore } from "./_settings"
import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "./_dom-utils"
import { CIcon } from "@/components/Icon"
import { BodyAttributes, GlobalAttributes } from "@/enums/attributes"
import { AnimationEasing } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { NumbersStore, updateOutput as updateNumbersOutput } from "../_features/_numbers"
import { ColorsStore, updateOutput as updateColorsOutput } from "../_features/_colors"
import { updateOutput as updateWordsOutput, WordsStore } from "../_features/_words"
import { SelectionStore, updateOutput as updateSelectionOutput } from "../_features/_selection"
import { TeamsStore, updateOutput as updateTeamsOutput } from "../_features/_teams"
import { CToast } from "@/components/Toast"
import { CDialog } from "@/components/Dialog"
import { hexToRgb, rgbToHsl } from "@/utils/color"
import { pxToRem } from "@/utils/css"

export type GeneratorStoreType = Readonly<{
	isGenerating: boolean
}>

export const GeneratorStore = new ObservableStore<GeneratorStoreType>({
	isGenerating: false
})
const _ref_generatorBtn = $(ElementIds.ap_generator) as CButton.CElement
const _ref_generatorIcon = $$(`#${CSS.escape(ElementIds.ap_generator)}>.${CIcon.Classes.icon}`) as CIcon.CElement
const _ref_generatorText = $$(`#${CSS.escape(ElementIds.ap_generator)}>div`) as HTMLDivElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_copyBtn = $(ElementIds.ap_copyBtn) as CButton.CIcon.CElement
const _ref_copyColorsDialog = $(ElementIds.ap_copyColorsDialog) as CDialog.CElement
const _ref_copyColorsBtn = $(ElementIds.ap_copyColorsBtn) as CButton.CElement
const _ref_copyColorsHex = $(ElementIds.ap_copyColorsHex) as HTMLInputElement
const _ref_copyColorsRgb = $(ElementIds.ap_copyColorsRgb) as HTMLInputElement
const _ref_copyColorsHsl = $(ElementIds.ap_copyColorsHsl) as HTMLInputElement
let _interval: NodeJS.Timeout | number | null = null

function _subsIsGeneratingView(v: GeneratorStoreType): void {
	const isGenerating = v.isGenerating
	document.body.toggleAttribute(BodyAttributes.noPointerEvent, isGenerating)
	_ref_generatorBtn.toggleAttribute(GlobalAttributes.keepPointerEvent, isGenerating)
	_ref_generatorText.textContent = isGenerating? 'Generating' : 'Generate'

	for (const anim of _ref_generatorIcon.getAnimations()) {
		anim.cancel()
	}

	if (!isAnimationAllowed() || SettingsStore.value.instantResult) {return}

	const easing = AnimationEasing.spring
	_ref_generatorText.animate({
		translate: [`0 ${pxToRem(isGenerating? -12 : 12)}rem`, '0 0'],
		scale: [.9, 1],
		opacity: [0, 1]
	}, {duration: 250, easing})
	if (!isGenerating) {return}

	_ref_generatorIcon.animate({
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

	if (_interval !== null) {
		clearInterval(_interval)
		_interval = null
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
	_interval = setInterval(() => {
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
	_ref_generatorBtn.addEventListener('click', () => {
		GeneratorStore.update(v => v.isGenerating = !v.isGenerating)
	})

	_ref_copyBtn.addEventListener('click', () => {
		const copy = (text: string) => navigator.clipboard.writeText(text).then((() => {
			_ref_toastCopied.showPopover()
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
			_ref_copyColorsDialog.showModal()
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

	_ref_copyColorsBtn.addEventListener('click', () => {
		const isHex = _ref_copyColorsHex.checked
		const isRgb = _ref_copyColorsRgb.checked
		const isHsl = _ref_copyColorsHsl.checked
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
			_ref_toastCopied.showPopover()
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}