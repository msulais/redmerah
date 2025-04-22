import { updateButton, type ButtonVariant } from "@/native-components/Button"
import { ELEMENT_ID_PREFIX, ElementIds } from "./_enums"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { SelectAttributes, SelectEvents, SelectVariant, updateSelect } from "@/native-components/Select"
import { closePopover, openPopover, PopoverPosition, updatePopover } from "@/native-components/Popover"
import { ColorPickerAttributes, ColorPickerEvents } from "@/native-components/ColorPicker"
import { colorContrastRatio, colorHexToRgb } from "@/utils/color"
import type { HEXColor } from "@/types/color"
import { IconClasses, updateIcon } from "@/native-components/Icon"
import { ListVariant, updateList } from "@/native-components/List"
import { numberSafe } from "@/utils/number"
import { closeModal, ModalPosition, openModal, updateModal } from "@/native-components/Modal"
import { TooltipPosition, updateTooltip } from "@/native-components/Tooltip"
import { MenuPosition, openMenu, updateMenu } from "@/native-components/Menu"

const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
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
	const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
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

function iconPanel(): void {
	const previewRef = $(ELEMENT_ID_PREFIX + ElementIds.panelIconPreview) as HTMLDivElement
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelIconOptions)
	const filledOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelIconOptionsFilled)
	optionsRef?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case filledOptionRef:
			for (const icon of previewRef.querySelectorAll<HTMLElement>(`.${IconClasses.icon}`)) {
				updateIcon(icon, {IconFilled: checked})
			}
		}
	})
}

function listPanel(): void {
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptions)!
	const listPreview = $(ELEMENT_ID_PREFIX + ElementIds.panelListPreviewList)!
	const leadingPreview = $(ELEMENT_ID_PREFIX + ElementIds.panelListPreviewLeading)!
	const titlePreview = $(ELEMENT_ID_PREFIX + ElementIds.panelListPreviewTitle)!
	const trailingPreview = $(ELEMENT_ID_PREFIX + ElementIds.panelListPreviewTrailing)!
	const subtitlePreview = $(ELEMENT_ID_PREFIX + ElementIds.panelListPreviewSubtitle)!
	const leadingOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptionsLeading)!
	const trailingOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptionsTrailing)!
	const subtitleOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptionsSubtitle)!
	const titleOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptionsTitle)!
	const variantOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelListOptionsVariant)!
	optionsRef?.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)

		switch (target) {
		case variantOptionRef:
			updateList(listPreview!, {
				ListVariant: value as ListVariant
			})
		}
	})
	optionsRef?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		const subtitleRects = [...subtitlePreview.children].map(v => v.getBoundingClientRect())
		const titlePreviewRect = titlePreview.getBoundingClientRect()
		const listPreviewRect = listPreview.getBoundingClientRect()

		switch (target) {
		case leadingOptionRef:
			leadingPreview?.style.setProperty('display', checked? null : 'none')
			if (isAnimationAllowed()) {
				for (const child of leadingPreview!.children) {
					child.animate({scale: [0, 1]}, animationOptions)
				}
			}
			break
		case trailingOptionRef:
			trailingPreview?.style.setProperty('display', checked? 'flex' : 'none')
			listPreview?.style.setProperty('padding-right', checked? '4px' : null)
			if (isAnimationAllowed()) {
				for (const child of trailingPreview!.children) {
					child.animate({scale: [0, 1]}, animationOptions)
				}
			}
			break
		case subtitleOptionRef:
			subtitlePreview?.style.setProperty('display', checked? null : 'none')
			if (isAnimationAllowed()) {
				for (const child of subtitlePreview!.children) {
					child.animate({
						opacity: [0, 1],
						transform: ['translateY(-8px)', 'translateY(0)']
					}, animationOptions)
				}
			}
			break
		case titleOptionRef:
			titlePreview?.style.setProperty('display', checked? null : 'none')
			if (isAnimationAllowed()) {
				titlePreview?.animate({
					opacity: [0, 1],
					transform: ['translateY(8px)', 'translateY(0)']
				}, animationOptions)
			}
			break
		}

		if (!isAnimationAllowed()) return

		if (target === titleOptionRef || target === leadingOptionRef){
			const subtitleRects2 = [...subtitlePreview.children].map(v => v.getBoundingClientRect())
			for (let i = 0; i < subtitleRects2.length; i++) {
				const rect1 = subtitleRects[i]
				const rect2 = subtitleRects2[i]
				const child = subtitlePreview.children.item(i)
				if (!child || !rect2 || !rect1) continue

				child.animate({
					transform: [
						`translate(${rect1.left - rect2.left}px,${rect1.top - rect2.top}px)`,
						`translate(0,0)`
					]
				}, animationOptions)
			}
		}

		if (target === subtitleOptionRef || target === leadingOptionRef) {
			const titlePreviewRect2 = titlePreview.getBoundingClientRect()
			titlePreview.animate({
				transform: [
					`translate(${titlePreviewRect.left - titlePreviewRect2.left}px,${titlePreviewRect.top - titlePreviewRect2.top}px)`,
					`translate(0,0)`
				]
			}, animationOptions)
		}

		if (target === subtitleOptionRef || target === titleOptionRef) {
			const listPreviewRect2 = listPreview.getBoundingClientRect()
			listPreview.animate({
				height: [listPreviewRect.height + 'px', listPreviewRect2.height + 'px']
			}, animationOptions)
		}
	})
}

function popoverPanel(): void {
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptions) as HTMLDivElement
	const openButtonRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverPreviewButtonOpen) as HTMLButtonElement
	const closeButtonRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverPreviewButtonClose) as HTMLButtonElement
	const popoverRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverPreviewPopover) as HTMLDivElement
	const positionOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsPosition) as HTMLDivElement
	const paddingOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsAnchor) as HTMLInputElement
	const autofocusOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsAutofocus) as HTMLInputElement
	const importantOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsImportant) as HTMLInputElement
	const draggableOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelPopoverOptionsDraggable) as HTMLInputElement

	openButtonRef.addEventListener('click', () => openPopover(popoverRef))
	closeButtonRef.addEventListener('click', () => closePopover(popoverRef))
	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updatePopover(popoverRef, {
				PopoverPosition: value as PopoverPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updatePopover(popoverRef, {
				PopoverPadding: numberSafe(paddingOptionRef.valueAsNumber)
			})
			break
		case gapOptionRef:
			updatePopover(popoverRef, {
				PopoverGap: gapOptionRef.valueAsNumber
			})
			break
		}
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case anchorOptionRef:
			updatePopover(popoverRef, {
				PopoverAnchorBy: checked? openButtonRef.id : false
			})
			break
		case autofocusOptionRef:
			updatePopover(popoverRef, {PopoverAutoFocus: checked})
			break
		case importantOptionRef:
			updatePopover(popoverRef, {PopoverImportant: checked})
			break
		case draggableOptionRef:
			updatePopover(popoverRef, {PopoverDraggable: checked})
			break
		}
	})
}
function modalPanel(): void {
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptions) as HTMLDivElement
	const openButtonRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalPreviewButtonOpen) as HTMLButtonElement
	const closeButtonRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalPreviewButtonClose) as HTMLButtonElement
	const modalRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalPreviewModal) as HTMLDialogElement
	const positionOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsPosition) as HTMLDivElement
	const paddingOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsAnchor) as HTMLInputElement
	const autofocusOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsAutofocus) as HTMLInputElement
	const importantOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsImportant) as HTMLInputElement
	const draggableOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelModalOptionsDraggable) as HTMLInputElement

	openButtonRef.addEventListener('click', () => openModal(modalRef))
	closeButtonRef.addEventListener('click', () => closeModal(modalRef))
	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updateModal(modalRef, {
				ModalPosition: value as ModalPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updateModal(modalRef, {
				ModalPadding: numberSafe(paddingOptionRef.valueAsNumber)
			})
			break
		case gapOptionRef:
			updateModal(modalRef, {
				ModalGap: gapOptionRef.valueAsNumber
			})
			break
		}
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case anchorOptionRef:
			updateModal(modalRef, {
				ModalAnchorBy: checked? openButtonRef.id : false
			})
			break
		case autofocusOptionRef:
			updateModal(modalRef, {ModalAutoFocus: checked})
			break
		case importantOptionRef:
			updateModal(modalRef, {ModalImportant: checked})
			break
		case draggableOptionRef:
			updateModal(modalRef, {ModalDraggable: checked})
			break
		}
	})
}

function selectPanel(): void {
	const previewRef = $(ELEMENT_ID_PREFIX + ElementIds.panelSelectPreview) as HTMLDivElement
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelSelectOptions) as HTMLDivElement
	const variantOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelSelectOptionsVariant) as HTMLDivElement
	const resetOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelSelectOptionsReset) as HTMLButtonElement
	let firstTime = true
	previewRef.addEventListener(SelectEvents.change, () => {
		if (!firstTime) return

		const children = [...optionsRef.children].filter(v => v !== resetOptionRef)
		const rects: DOMRect[] = children.map(v => v.getBoundingClientRect())
		firstTime = false
		resetOptionRef.style.removeProperty('display')
		if (isAnimationAllowed()) {
			const rects2: DOMRect[] = children.map(v => v.getBoundingClientRect())
			resetOptionRef.animate({
				scale: [0, 1]
			}, animationOptions)
			for (let i = 0; i < children.length; i++) {
				const child = children[i]
				const rect = rects[i]
				const rect2 = rects2[i]
				child.animate({
					transform: [
						`translate(${rect.left - rect2.left}px,${rect.top - rect2.top}px)`, 'translate(0,0)'
					]
				}, animationOptions)
			}
		}
	})

	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case variantOptionRef:
			updateSelect(previewRef, {
				SelectVariant: value as SelectVariant
			})
			break
		}
	})

	optionsRef.addEventListener('click', () => {
		switch (document.activeElement) {
		case resetOptionRef:
			const children = [...optionsRef.children].filter(v => v !== resetOptionRef)
			const rects: DOMRect[] = children.map(v => v.getBoundingClientRect())
			previewRef.setAttribute(SelectAttributes.value, '')
			resetOptionRef.style.setProperty('display', 'none')
			firstTime = true
			for (const option of previewRef.querySelectorAll('[aria-selected=true]')) {
				option.setAttribute('aria-selected', 'false')
			}

			if (isAnimationAllowed()) {
				const rects2: DOMRect[] = children.map(v => v.getBoundingClientRect())
				for (let i = 0; i < children.length; i++) {
					const child = children[i]
					const rect = rects[i]
					const rect2 = rects2[i]
					child.animate({
						transform: [
							`translate(${rect.left - rect2.left}px,${rect.top - rect2.top}px)`, 'translate(0,0)'
						]
					}, animationOptions)
				}
			}
			break
		}
	})
}

function tooltipPanel(): void {
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptions) as HTMLDivElement
	const anchorOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptionsAnchor) as HTMLInputElement
	const previewRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipPreview) as HTMLDivElement
	const positionOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptionsPosition) as HTMLDivElement
	const gapOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptionsGap) as HTMLInputElement
	const startDelayOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptionsStartDelay) as HTMLInputElement
	const endDelayOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelTooltipOptionsEndDelay) as HTMLInputElement
	let timeGapId: number | NodeJS.Timeout | null = null
	let timeStartDelayId: number | NodeJS.Timeout | null = null
	let timeEndDelayId: number | NodeJS.Timeout | null = null

	startDelayOptionRef.addEventListener('input', () => {
		if (timeStartDelayId !== null) clearTimeout(timeStartDelayId)

		timeStartDelayId = setTimeout(() => {
			updateTooltip(previewRef, {
				TooltipStartDelay: numberSafe(startDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	endDelayOptionRef.addEventListener('input', () => {
		if (timeEndDelayId !== null) clearTimeout(timeEndDelayId)

		timeEndDelayId = setTimeout(() => {
			updateTooltip(previewRef, {
				TooltipEndDelay: numberSafe(endDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	gapOptionRef.addEventListener('input', () => {
		if (timeGapId !== null) clearTimeout(timeGapId)

		timeGapId = setTimeout(() => {
			updateTooltip(previewRef, {
				TooltipGap: numberSafe(gapOptionRef.valueAsNumber)
			})
		}, 50)
	})

	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updateTooltip(previewRef, {
				TooltipPosition: value as TooltipPosition
			})
			break
		}
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case anchorOptionRef:
			updateTooltip(previewRef, {
				TooltipUseAnchor: checked
			})
		}
	})
}

function menuPanel(): void {
	const optionsRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuOptions) as HTMLDivElement
	const buttonRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuPreviewButton) as HTMLButtonElement
	const menuRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuPreviewMenu) as HTMLDivElement
	const positionOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuOptionsPosition) as HTMLDivElement
	const anchorOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuOptionsAnchor) as HTMLInputElement
	const gapOptionRef = $(ELEMENT_ID_PREFIX + ElementIds.panelMenuOptionsGap) as HTMLInputElement

	buttonRef.addEventListener('click', () => openMenu(menuRef))
	buttonRef.addEventListener('contextmenu', ev => {
		ev.preventDefault()
		openMenu(menuRef)
	})

	optionsRef.addEventListener('focusout', ev => {
		const target = ev.target as HTMLElement
		switch (target) {
		case gapOptionRef:
			updateMenu(menuRef, {
				PopoverGap: numberSafe(gapOptionRef.valueAsNumber)
			})
			break
		}
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case anchorOptionRef:
			updateMenu(menuRef, {
				PopoverAnchorBy: checked? buttonRef.id : false
			})
			break
		}
	})

	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updateMenu(menuRef, {
				PopoverPosition: value as MenuPosition
			})
			break
		}
	})
}

function _(): void {
	menuPanel()
	tooltipPanel()
	buttonPanel()
	checkBoxPanel()
	textFieldPanel()
	colorPickerPanel()
	iconPanel()
	listPanel()
	popoverPanel()
	modalPanel()
	selectPanel()
}

export default _