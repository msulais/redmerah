import { registerPopover } from "@/native-components/Popover"
import { registerSelect } from "@/native-components/Select"
import { ELEMENT_ID_PREFIX, ElementIds } from "./_enums"
import { ButtonVariant, updateButton } from "@/native-components/Button"
import { registerMenu, registerSubMenuItem } from "@/native-components/Menu"
import { registerTooltip } from "@/native-components/Tooltip"
import appBar from './_appbar'

const $ = (id: string) => document.getElementById(id)

function registerAllComponents(): void {
	registerMenu()
	registerSubMenuItem()
	registerTooltip()
	registerPopover()
	registerSelect()
}

function buttonPanel(): void {
	const options = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_options) as HTMLDivElement
	const btn1 = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_preview_1) as HTMLButtonElement
	const btn2 = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_preview_2) as HTMLButtonElement
	const btn3 = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_preview_3) as HTMLButtonElement
	const optionVariant = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_options_variant)
	const optionDisabled = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_options_disabled)
	const optionFocused = $(ELEMENT_ID_PREFIX + ElementIds.panel_buttons_options_focused)
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

function panel(): void {
	buttonPanel()
}

function main(): void {
	registerAllComponents()
	panel()
	appBar()
}

main()