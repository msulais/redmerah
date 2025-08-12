import type { HEXColor, RGBColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_COLOR, DEFAULT_PALETTE } from "../_shared/_constant"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { ColorPickerEvents, getColorPickerRefValue, updateColorPickerRef, type ColorPickerElement } from "@/components/ColorPicker"
import { GlobalElementIds } from "@/enums/ids"
import { generateColorPalette, hexToRgb, isColorValid } from "@/utils/color"
import type { ToastElement } from "@/components/Toast"
import { CSSClasses } from "../../_styles/_css"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { createIconButtonRef, type IconButtonElement } from "@/components/Button"
import { createIconRef } from "@/components/Icon"
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
const _animationOption = {duration: 250, easing: AnimationEasing.spring}
const _saveButtonRef = $(ElementIds.bd_saveBtn) as IconButtonElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
const _paletteListRef = $$(`.${CSSClasses.bodyList}`) as HTMLDivElement
const _colorAccentRef = $(GlobalElementIds.colorAccent) as HTMLStyleElement
const _colorPickerRef = $(ElementIds.bd_picker) as ColorPickerElement
const _colorPickerButtonSpanRef = $(ElementIds.bd_pickerBtnSpan) as HTMLSpanElement
const _paletteAccentLightRef = $(ElementIds.bd_accentLight) as HTMLSpanElement
const _paletteOnAccentLightRef = $(ElementIds.bd_onAccentLight) as HTMLSpanElement
const _paletteAccentDarkRef = $(ElementIds.bd_accentDark) as HTMLSpanElement
const _paletteOnAccentDarkRef = $(ElementIds.bd_onAccentDark) as HTMLSpanElement
let _timeAccentId: NodeJS.Timeout | number | null = null

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
		const children = [..._paletteListRef.children]
		const childrenRects = children.map(v => v.getBoundingClientRect())
		for (let i = 0; i < length - oldLength; i++) {
			const children = [..._paletteListRef.children]
			const seed = palette[i]
			const pal = generateColorPalette(seed)

			const icon = createIconRef({
				IconCode: IconCodes.circle,
				IconFilled: true
			})
			icon.style.setProperty('color', seed)

			const copyButton = createIconButtonRef({
				IconButtonIcon: {IconCode: IconCodes.copy},
			})
			copyButton.setAttribute('data-command', Commands.pal_copy)
			copyButton.setAttribute('aria-label', 'Copy')
			copyButton.setAttribute('data-tooltip', 'Copy')

			const delButton = createIconButtonRef({
				IconButtonIcon: {IconCode: IconCodes.delete}
			})
			delButton.setAttribute('data-command', Commands.pal_delete)
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

			_paletteListRef.replaceChildren(li, ...children)
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

	if (_timeAccentId !== null) {
		clearTimeout(_timeAccentId)
	}

	_timeAccentId = setTimeout(() => {
		_timeAccentId = null
		const palette = generateColorPalette(color)
		_colorAccentRef.innerHTML = ':root{'
			+ `--g-color-accent-light: ${_rgbToCSS(hexToRgb(palette.color))};`
			+ `--g-color-accent-dark: ${_rgbToCSS(hexToRgb(palette.colorDark))};`
			+ `--g-color-on-accent-light: ${_rgbToCSS(hexToRgb(palette.onColor))};`
			+ `--g-color-on-accent-dark: ${_rgbToCSS(hexToRgb(palette.onColorDark))};`
			+ '}'
		;
		const hex = color.toUpperCase() as HEXColor
		if (getColorPickerRefValue(_colorPickerRef) !== hex) {
			updateColorPickerRef(_colorPickerRef, {ColorPickerValue: hex})
		}

		_colorPickerButtonSpanRef.textContent = hex
		_paletteAccentLightRef   .textContent = palette.color      .toUpperCase()
		_paletteOnAccentLightRef .textContent = palette.onColor    .toUpperCase()
		_paletteAccentDarkRef    .textContent = palette.colorDark  .toUpperCase()
		_paletteOnAccentDarkRef  .textContent = palette.onColorDark.toUpperCase()
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
	_colorPickerRef.addEventListener(ColorPickerEvents.input, () => {
		ColorsStore.update(v => v.seed = getColorPickerRefValue(_colorPickerRef))
	})

	_paletteListRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_paletteListRef, buttonRef)) {return}

		const command = buttonRef.dataset.command as Commands
		const getSeedColor = () => {
			const li = buttonRef.closest('[data-seed-color]')
			const seed = li?.getAttribute('data-seed-color')
			if (!seed || !isColorValid(seed)) return null

			return seed as HEXColor
		}

		switch (command) {
		case Commands.pal_copy:{
			const seed = getSeedColor()
			if (seed) {
				copyColorPalette(seed)
			}
		}	break
		case Commands.pal_delete: {
			const seed = getSeedColor()
			if (seed) {
				ColorsStore.update(v => v.palette = v.palette.filter(v => v !== seed))
			}
		}	break
		}
	})

	_saveButtonRef.addEventListener('click', () => {
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
		_toastCopiedRef.showPopover()
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}