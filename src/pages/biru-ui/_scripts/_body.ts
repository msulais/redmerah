import { updateButton, type ButtonVariant } from "@/native-components/Button"
import { ELEMENT_ID_PREFIX, ElementIds } from "./_enums"

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
		const target = ev.target
		switch (target) {
		case optionVariant: {
			const value = (target as HTMLDivElement).dataset.value
			updateButton(btn1, {variant: value as ButtonVariant})
			updateButton(btn2, {variant: value as ButtonVariant})
			updateButton(btn3, {variant: value as ButtonVariant})
			break
		}
		case optionDisabled: {
			const value = (target as HTMLInputElement).checked
			updateButton(btn1, {disabled: value})
			updateButton(btn2, {disabled: value})
			updateButton(btn3, {disabled: value})
			break
		}
		case optionFocused: {
			const value = (target as HTMLInputElement).checked
			updateButton(btn1, {focused: value})
			updateButton(btn2, {focused: value})
			updateButton(btn3, {focused: value})
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

function _(): void {
	buttonPanel()
	checkBoxPanel()
}

export default _