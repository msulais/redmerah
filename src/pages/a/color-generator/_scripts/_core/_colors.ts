import type { HEXColor, RGBColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_COLOR, DEFAULT_PALETTE } from "../_shared/_constant"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CColorPicker } from "@/components/ColorPicker"
import { GlobalElementIds } from "@/enums/ids"
import { generateColorPalette, hexToRgb, isColorValid } from "@/utils/color"
import { CToast } from "@/components/Toast"
import { CSSClasses } from "../../_styles/_css"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { CButton } from "@/components/Button"
import { CIcon } from "@/components/Icon"
import { IconCodes } from "@/enums/icons"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type ColorsStoreType = {
	seed: HEXColor
	palette: HEXColor[]
}

export const ColorsStore = new ObservableStore<ColorsStoreType>({
	seed: DEFAULT_COLOR,
	palette: DEFAULT_PALETTE
})
const _animationOption = {duration: 250, easing: AnimationEasing.Spring}
const _ref_saveBtn = $(ElementIds.bd_saveBtn) as CButton.CIcon.CElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_paletteList = $$(`.${CSSClasses.bodyList}`) as HTMLDivElement
const _ref_colorAccent = $(GlobalElementIds.ColorAccent) as HTMLStyleElement
const _ref_colorPicker = $(ElementIds.bd_picker) as CColorPicker.CElement
const _ref_colorPickerButtonSpan = $(ElementIds.bd_pickerBtnSpan) as HTMLSpanElement
const _ref_paletteAccentLight = $(ElementIds.bd_accentLight) as HTMLSpanElement
const _ref_paletteOnAccentLight = $(ElementIds.bd_onAccentLight) as HTMLSpanElement
const _ref_paletteAccentDark = $(ElementIds.bd_accentDark) as HTMLSpanElement
const _ref_paletteOnAccentDark = $(ElementIds.bd_onAccentDark) as HTMLSpanElement
let _time_accent: NodeJS.Timeout | number | null = null

function _rgbToCSS(rgb: RGBColor) {
	return `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
}

function _subscribePaletteRefView(v: ColorsStoreType, o: ColorsStoreType): void {
	const palette = v.palette
	const oldPalette = o.palette
	const length = palette.length
	const oldLength = oldPalette.length
	if (length === oldLength) {return}

	const allowAnimation = isAnimationAllowed()

	// add
	if (length > oldLength) {
		const children = [..._ref_paletteList.children]
		const childrenRects = children.map(v => v.getBoundingClientRect())
		for (let i = 0; i < length - oldLength; i++) {
			const children = [..._ref_paletteList.children]
			const seed = palette[i]
			const pal = generateColorPalette(seed)

			const icon = CIcon.create({
				Icon: {
					code: IconCodes.CircleFilled,
				}
			})
			icon.style.setProperty('color', seed)

			const copyButton = CButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.Copy}}
			})
			copyButton.setAttribute('data-command', Commands.PaletteCopy)
			copyButton.setAttribute('aria-label', 'Copy')
			copyButton.setAttribute('data-tooltip', 'Copy')

			const delButton = CButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.Delete}}
			})
			delButton.setAttribute('data-command', Commands.PaletteDelete)
			delButton.setAttribute('aria-label', 'Delete')
			delButton.setAttribute('data-tooltip', 'Delete')

			const li = document.createElement('li')
			li.setAttribute('data-seed-color', seed)
			li.innerHTML = `
<p>
	${icon.outerHTML}
	${seed}
	<span style="display:block;flex:1"></span>
	${copyButton.outerHTML}
	${delButton.outerHTML}
</p>
<div style="background-color:${pal.color};color:${pal.onColor}">
	<span data-tooltip="Accent Light">${pal.color.toUpperCase()}</span>
	<span data-tooltip="On Accent Light" style="background-color:${pal.onColor};color:${pal.color}">${pal.onColor.toUpperCase()}</span>
</div>
<div style="background-color:${pal.colorDark};color:${pal.onColorDark}">
	<span data-tooltip="Accent Dark">${pal.colorDark.toUpperCase()}</span>
	<span data-tooltip="On Accent Dark" style="background-color:${pal.onColorDark};color:${pal.colorDark}">${pal.onColorDark.toUpperCase()}</span>
</div>
`

			_ref_paletteList.replaceChildren(li, ...children)
			if (allowAnimation) {
				li.animate({
					scale: [.85, 1],
					opacity: [0, 1]
				}, _animationOption)
			}
		}

		if (allowAnimation) {
			const childrenRects2 = children.map(v => v.getBoundingClientRect())
			for (let i = 0; i < children.length; i++) {
				const r1 = childrenRects[i]
				const r2 = childrenRects2[i]
				const item = children[i]
				item.animate({
					translate: [`${pxToRem(r1.x - r2.x)}rem ${pxToRem(r1.y - r2.y)}rem`, '0 0']
				}, _animationOption)
			}
		}
	}

	// remove
	else {
		const deletedPalette = oldPalette.filter(v => !palette.includes(v))
		const deletedRefs = new Set<HTMLLIElement>()
		const keepedRefs = new Set<HTMLLIElement>()
		const children = $$$<HTMLLIElement>(`.${CSSClasses.bodyList} [data-seed-color]`)
		for (const li of children) {
			const seed = li.getAttribute('data-seed-color')
			if (seed && deletedPalette.includes(seed as HEXColor)) {
				deletedRefs.add(li)
			} else {
				keepedRefs.add(li)
			}
		}

		const keepedRects = [...keepedRefs.values().map(v => v.getBoundingClientRect())]
		deletedRefs.values().forEach(v => {
			const isLast = v === children.item(children.length - 1)
			if (isLast && allowAnimation) {
				return v.animate({
					scale: [1, .85],
					opacity: [1, 0]
				}, _animationOption)
				.finished
				.then(() => v.remove())
			}
			v.remove()
		})
		if (allowAnimation) {
			const keepedRects2 = [...keepedRefs.values().map(v => v.getBoundingClientRect())]
			keepedRefs.values().forEach((ref, i) => {
				const r1 = keepedRects[i]
				const r2 = keepedRects2[i]
				ref.animate({
					translate: [`${pxToRem(r1.x - r2.x)}rem ${pxToRem(r1.y - r2.y)}rem`, '0 0'],
				}, _animationOption)
			})
		}
	}
}

function _subscribeColorRefView(v: ColorsStoreType, o: ColorsStoreType): void {
	const color = v.seed
	if (color === o.seed) return

	if (_time_accent !== null) {
		clearTimeout(_time_accent)
	}

	_time_accent = setTimeout(() => {
		_time_accent = null
		const palette = generateColorPalette(color)
		_ref_colorAccent.innerHTML = ':root{'
			+ `--g-color-accent-light: ${_rgbToCSS(hexToRgb(palette.color))};`
			+ `--g-color-accent-dark: ${_rgbToCSS(hexToRgb(palette.colorDark))};`
			+ `--g-color-on-accent-light: ${_rgbToCSS(hexToRgb(palette.onColor))};`
			+ `--g-color-on-accent-dark: ${_rgbToCSS(hexToRgb(palette.onColorDark))};`
			+ '}'
		;
		const hex = color.toUpperCase() as HEXColor
		if (CColorPicker.getValue(_ref_colorPicker) !== hex) {
			CColorPicker.update(_ref_colorPicker, {ColorPicker: {value: hex}})
		}

		_ref_colorPickerButtonSpan.textContent = hex
		_ref_paletteAccentLight   .textContent = palette.color      .toUpperCase()
		_ref_paletteOnAccentLight .textContent = palette.onColor    .toUpperCase()
		_ref_paletteAccentDark    .textContent = palette.colorDark  .toUpperCase()
		_ref_paletteOnAccentDark  .textContent = palette.onColorDark.toUpperCase()
	}, 10)
}

function _subscribeColorChanges(v: ColorsStoreType, o: ColorsStoreType): void {
	const seed = v.seed
	if (seed === o.seed) {return}

	saveStorageItem('colors/seed', seed)
}

function _subscribePaletteChanges(v: ColorsStoreType, o: ColorsStoreType): void {
	const palette = v.palette
	if (palette.length === o.palette.length) {return}

	saveStorageItem('colors/palette', [...palette])
}

function _initSubscriber(): void {
	ColorsStore.subscribe(_subscribeColorRefView)
	ColorsStore.subscribe(_subscribeColorChanges)
	ColorsStore.subscribe(_subscribePaletteRefView)
	ColorsStore.subscribe(_subscribePaletteChanges)
}

function _initEvents(): void {
	_ref_colorPicker.addEventListener(CColorPicker.Events.Input, () => {
		ColorsStore.update(v => v.seed = CColorPicker.getValue(_ref_colorPicker))
	})

	_ref_paletteList.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_paletteList, ref_btn)) {return}

		const command = ref_btn.dataset.command as Commands
		const getSeedColor = () => {
			const li = ref_btn.closest('[data-seed-color]')
			const seed = li?.getAttribute('data-seed-color')
			if (!seed || !isColorValid(seed)) return null

			return seed as HEXColor
		}

		switch (command) {
		case Commands.PaletteCopy:{
			const seed = getSeedColor()
			if (seed) {
				copyColorPalette(seed)
			}
		}	break
		case Commands.PaletteDelete: {
			const seed = getSeedColor()
			if (seed) {
				ColorsStore.update(v => v.palette = v.palette.filter(v => v !== seed))
			}
		}	break
		}
	})

	_ref_saveBtn.addEventListener('click', () => {
		const value = ColorsStore.value
		const color = value.seed
		if (value.palette.includes(color)) {return}

		ColorsStore.update(v => v.palette = [color, ...v.palette])
	})
}

export function copyColorPalette(color: HEXColor = ColorsStore.value.seed): void {
	const palette = generateColorPalette(color)
	const text = [
		'--seed           : ' + color              .toUpperCase(),
		'--accent-light   : ' + palette.color      .toUpperCase(),
		'--on-accent-light: ' + palette.onColor    .toUpperCase(),
		'--accent-dark    : ' + palette.colorDark  .toUpperCase(),
		'--on-accent-dark : ' + palette.onColorDark.toUpperCase(),
	].map(v => v + ';').join('\n')
	navigator.clipboard.writeText(text).then(() => {
		_ref_toastCopied.showPopover()
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}