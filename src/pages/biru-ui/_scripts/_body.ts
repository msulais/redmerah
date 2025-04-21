import { updateButton, type ButtonVariant } from "@/native-components/Button"
import { ELEMENT_ID_PREFIX, ElementIds } from "./_enums"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { SelectAttributes, SelectEvents } from "@/native-components/Select"
import { openPopover } from "@/native-components/Popover"
import { ColorPickerAttributes, ColorPickerEvents } from "@/native-components/ColorPicker"
import { colorContrastRatio, colorHexToRgb } from "@/utils/color"
import type { HEXColor } from "@/types/color"

const $ = (id: string) => document.getElementById(id)

function buttonPanel(): void {
	const options = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsOptions) as HTMLDivElement
	const btn1 = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsPreview1) as HTMLButtonElement
	const btn2 = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsPreview2) as HTMLButtonElement
	const btn3 = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsPreview3) as HTMLButtonElement
	const optionVariant = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsOptionsVariant)
	const optionDisabled = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsOptionsDisabled)
	const optionFocused = $(ELEMENT_ID_PREFIX + ElementIds.panelButtonsOptionsFocused)
	options.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case optionDisabled: {
			updateButton(btn1, {ButtonDisabled: checked})
			updateButton(btn2, {ButtonDisabled: checked})
			updateButton(btn3, {ButtonDisabled: checked})
			break
		}
		case optionFocused: {
			updateButton(btn1, {ButtonFocused: checked})
			updateButton(btn2, {ButtonFocused: checked})
			updateButton(btn3, {ButtonFocused: checked})
			break
		}}
	})

	options.addEventListener(SelectEvents.change, ev => {
		const target = ev.target
		switch (target) {
		case optionVariant: {
			const value = (target as HTMLDivElement).getAttribute(SelectAttributes.value)
			updateButton(btn1, {ButtonVariant: value as ButtonVariant})
			updateButton(btn2, {ButtonVariant: value as ButtonVariant})
			updateButton(btn3, {ButtonVariant: value as ButtonVariant})
			break
		}}
	})
}

function checkBoxPanel(): void {
	const checkbox1 = $(ELEMENT_ID_PREFIX + ElementIds.panelCheckboxPreview1) as HTMLInputElement
	const checkbox2 = $(ELEMENT_ID_PREFIX + ElementIds.panelCheckboxPreview2) as HTMLInputElement
	const checkbox3 = $(ELEMENT_ID_PREFIX + ElementIds.panelCheckboxPreview3) as HTMLInputElement
	const options = $(ELEMENT_ID_PREFIX + ElementIds.panelCheckboxOptions)

	options?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		checkbox1.disabled = target.checked
		checkbox2.disabled = target.checked
		checkbox3.disabled = target.checked
	})
}

function textFieldPanel(): void {
	const animationOptions = {duration: 200, easing: AnimationEffectTiming.spring}
	const textField = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldPreview) as HTMLDivElement
	const input = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldPreviewInput) as HTMLInputElement
	const leading = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldPreviewLeading) as HTMLElement
	const trailing = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldPreviewTrailing) as HTMLButtonElement
	const options = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptions)
	const optionType = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptionsType) as HTMLDivElement
	const optionLeading = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptionsLeading) as HTMLInputElement
	const optionTrailing = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptionsTrailing) as HTMLInputElement
	const optionReadonly = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptionsReadonly) as HTMLInputElement
	const optionPlaceholder = $(ELEMENT_ID_PREFIX + ElementIds.panelTextfieldOptionsPlaceholder) as HTMLInputElement

	options?.addEventListener(SelectEvents.change, ev => {
		const target = ev.target
		switch (target) {
		case optionType:
			input.type = optionType.getAttribute(SelectAttributes.value) ?? 'text'
		}
	})

	options?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		const textFieldRect = textField.getBoundingClientRect()
		const inputRect = input.getBoundingClientRect()
		const trailingRect = trailing.getBoundingClientRect()
		switch (target) {
		case optionLeading:
			leading.style.setProperty('display', checked? null : "none")
			input.style.setProperty('padding-left', checked? '0px' : '12px')
			if (isAnimationAllowed() && checked) leading.animate({
				scale: [0, 1]
			}, animationOptions)
			break
		case optionTrailing:
			trailing.style.setProperty('display', checked? null : "none")
			input.style.setProperty('padding-right', checked? '0px' : '12px')
			if (isAnimationAllowed() && checked) trailing.animate({
				scale: [0, 1]
			}, animationOptions)
			break
		case optionReadonly:
			input.readOnly = checked
			break
		case optionPlaceholder:
			input.placeholder = checked? "Type here ..." : ''
			break
		}

		if (!isAnimationAllowed()) return

		switch (target) {
		case optionLeading:
		case optionTrailing:
			const inputRect2 = input.getBoundingClientRect()
			const textFieldRect2 = textField.getBoundingClientRect()
			const trailingRect2 = trailing.getBoundingClientRect()
			textField.animate({
				width: [textFieldRect.width + 'px', textFieldRect2.width + 'px'],
			}, animationOptions)
			input.animate({
				transform: [`translateX(${inputRect.left - inputRect2.left}px)`, 'translateX(0)'],
				paddingLeft: target === optionLeading? [
					checked? '12px' : '0px',
					checked? '0' : '12px'
				] : [],
			}, animationOptions)
			if (trailing.checkVisibility() && target !== optionTrailing) {
				trailing.animate({
					transform: [`translateX(${(trailingRect.left + (checked? 0 : 12)) - (trailingRect2.left + (checked? 12 : 0))}px)`, 'translateX(0)']
				}, animationOptions)
			}
			break
		}
	})
}

function colorPickerPanel(): void {
	const options = $(ELEMENT_ID_PREFIX + ElementIds.panelColorpickerOptions)
	const button = $(ELEMENT_ID_PREFIX + ElementIds.panelColorpickerPreviewButton) as HTMLButtonElement
	const colorpicker = $(ELEMENT_ID_PREFIX + ElementIds.panelColorpickerPreviewColorPicker) as HTMLDivElement
	const optionHueOnly = $(ELEMENT_ID_PREFIX + ElementIds.panelColorpickerOptionsHueOnly) as HTMLInputElement
	const optionDisabledOpacity = $(ELEMENT_ID_PREFIX + ElementIds.panelColorpickerOptionsDisabledOpacity) as HTMLInputElement
	button.addEventListener('click', () => {
		openPopover(colorpicker, {
			anchor: button
		})
	})

	colorpicker.addEventListener(ColorPickerEvents.change, () => {
		const value = colorpicker.getAttribute(ColorPickerAttributes.value)!
		button.textContent = value
		button.setAttribute('data-tooltip', 'Pick color')
		button.style.setProperty('background-color', value)
		button.style.setProperty('color', colorContrastRatio(colorHexToRgb(value as HEXColor), {r: 0, g: 0, b: 0}) > 50 ? '#000' : '#fff')
	})

	options?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case optionHueOnly:
			colorpicker.toggleAttribute(ColorPickerAttributes.hueOnly, checked)
			break
		case optionDisabledOpacity:
			colorpicker.toggleAttribute(ColorPickerAttributes.disabledOpacity, checked)
			break
		}
	})
}

function _(): void {
	buttonPanel()
	checkBoxPanel()
	textFieldPanel()
	colorPickerPanel()
}

export default _