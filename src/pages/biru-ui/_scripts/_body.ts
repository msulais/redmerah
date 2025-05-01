import { updateButtonRef, type ButtonVariant } from "@/native-components/Button"
import { ID, ElementIds } from "./_enums"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { SelectAttributes, SelectEvents, SelectVariant, updateSelectRef } from "@/native-components/Select"
import { closePopoverRef, openPopoverRef, PopoverPosition, updatePopoverRef } from "@/native-components/Popover"
import { ColorPickerAttributes, ColorPickerEvents } from "@/native-components/ColorPicker"
import { colorContrastRatio, colorHexToRgb } from "@/utils/color"
import type { HEXColor } from "@/types/color"
import { IconClasses, updateIconRef } from "@/native-components/Icon"
import { ListVariant, updateListRef } from "@/native-components/List"
import { numberSafe } from "@/utils/number"
import { closeModalRef, ModalPosition, openModalRef, updateModalRef } from "@/native-components/Modal"
import { TooltipPosition, updateTooltipRef } from "@/native-components/Tooltip"
import { MenuPosition, openMenuRef, updateMenuRef } from "@/native-components/Menu"
import { EmojiPickerAttributes, EmojiPickerEvents } from "@/native-components/EmojiPicker"
import { updateDialogRef } from "@/native-components/Dialog"

const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
const $ = (id: string) => document.getElementById(id)

function buttonPanel(): void {
	const options = $(ID + ElementIds.panelButtonsOptions) as HTMLDivElement
	const btn1 = $(ID + ElementIds.panelButtonsPreview1) as HTMLButtonElement
	const btn2 = $(ID + ElementIds.panelButtonsPreview2) as HTMLButtonElement
	const btn3 = $(ID + ElementIds.panelButtonsPreview3) as HTMLButtonElement
	const optionVariant = $(ID + ElementIds.panelButtonsOptionsVariant)
	const optionDisabled = $(ID + ElementIds.panelButtonsOptionsDisabled)
	const optionFocused = $(ID + ElementIds.panelButtonsOptionsFocused)
	options.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case optionDisabled: {
			updateButtonRef(btn1, {ButtonDisabled: checked})
			updateButtonRef(btn2, {ButtonDisabled: checked})
			updateButtonRef(btn3, {ButtonDisabled: checked})
			break
		}
		case optionFocused: {
			updateButtonRef(btn1, {ButtonFocused: checked})
			updateButtonRef(btn2, {ButtonFocused: checked})
			updateButtonRef(btn3, {ButtonFocused: checked})
			break
		}}
	})

	options.addEventListener(SelectEvents.change, ev => {
		const target = ev.target
		switch (target) {
		case optionVariant: {
			const value = (target as HTMLDivElement).getAttribute(SelectAttributes.value)
			updateButtonRef(btn1, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn2, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn3, {ButtonVariant: value as ButtonVariant})
			break
		}}
	})
}

function checkBoxPanel(): void {
	const checkbox1 = $(ID + ElementIds.panelCheckboxPreview1) as HTMLInputElement
	const checkbox2 = $(ID + ElementIds.panelCheckboxPreview2) as HTMLInputElement
	const checkbox3 = $(ID + ElementIds.panelCheckboxPreview3) as HTMLInputElement
	const options = $(ID + ElementIds.panelCheckboxOptions)

	options?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		checkbox1.disabled = target.checked
		checkbox2.disabled = target.checked
		checkbox3.disabled = target.checked
	})
}

function textFieldPanel(): void {
	const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
	const textField = $(ID + ElementIds.panelTextfieldPreview) as HTMLDivElement
	const input = $(ID + ElementIds.panelTextfieldPreviewInput) as HTMLInputElement
	const leading = $(ID + ElementIds.panelTextfieldPreviewLeading) as HTMLElement
	const trailing = $(ID + ElementIds.panelTextfieldPreviewTrailing) as HTMLButtonElement
	const options = $(ID + ElementIds.panelTextfieldOptions)
	const optionType = $(ID + ElementIds.panelTextfieldOptionsType) as HTMLDivElement
	const optionLeading = $(ID + ElementIds.panelTextfieldOptionsLeading) as HTMLInputElement
	const optionTrailing = $(ID + ElementIds.panelTextfieldOptionsTrailing) as HTMLInputElement
	const optionReadonly = $(ID + ElementIds.panelTextfieldOptionsReadonly) as HTMLInputElement
	const optionPlaceholder = $(ID + ElementIds.panelTextfieldOptionsPlaceholder) as HTMLInputElement

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
	const options = $(ID + ElementIds.panelColorpickerOptions)
	const button = $(ID + ElementIds.panelColorpickerPreviewButton) as HTMLButtonElement
	const colorpicker = $(ID + ElementIds.panelColorpickerPreviewColorPicker) as HTMLDivElement
	const optionHueOnly = $(ID + ElementIds.panelColorpickerOptionsHueOnly) as HTMLInputElement
	const optionDisabledOpacity = $(ID + ElementIds.panelColorpickerOptionsDisabledOpacity) as HTMLInputElement
	button.addEventListener('click', () => {
		openPopoverRef(colorpicker, {
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
	const previewRef = $(ID + ElementIds.panelIconPreview) as HTMLDivElement
	const optionsRef = $(ID + ElementIds.panelIconOptions)
	const filledOptionRef = $(ID + ElementIds.panelIconOptionsFilled)
	optionsRef?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case filledOptionRef:
			for (const icon of previewRef.querySelectorAll<HTMLElement>(`.${IconClasses.icon}`)) {
				updateIconRef(icon, {IconFilled: checked})
			}
		}
	})
}

function listPanel(): void {
	const optionsRef = $(ID + ElementIds.panelListOptions)!
	const listPreview = $(ID + ElementIds.panelListPreviewList)!
	const leadingPreview = $(ID + ElementIds.panelListPreviewLeading)!
	const titlePreview = $(ID + ElementIds.panelListPreviewTitle)!
	const trailingPreview = $(ID + ElementIds.panelListPreviewTrailing)!
	const subtitlePreview = $(ID + ElementIds.panelListPreviewSubtitle)!
	const leadingOptionRef = $(ID + ElementIds.panelListOptionsLeading)!
	const trailingOptionRef = $(ID + ElementIds.panelListOptionsTrailing)!
	const subtitleOptionRef = $(ID + ElementIds.panelListOptionsSubtitle)!
	const titleOptionRef = $(ID + ElementIds.panelListOptionsTitle)!
	const variantOptionRef = $(ID + ElementIds.panelListOptionsVariant)!
	optionsRef?.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)

		switch (target) {
		case variantOptionRef:
			updateListRef(listPreview!, {
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
	const optionsRef = $(ID + ElementIds.panelPopoverOptions) as HTMLDivElement
	const openButtonRef = $(ID + ElementIds.panelPopoverPreviewButtonOpen) as HTMLButtonElement
	const closeButtonRef = $(ID + ElementIds.panelPopoverPreviewButtonClose) as HTMLButtonElement
	const popoverRef = $(ID + ElementIds.panelPopoverPreviewPopover) as HTMLDivElement
	const positionOptionRef = $(ID + ElementIds.panelPopoverOptionsPosition) as HTMLDivElement
	const paddingOptionRef = $(ID + ElementIds.panelPopoverOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ID + ElementIds.panelPopoverOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ID + ElementIds.panelPopoverOptionsAnchor) as HTMLInputElement
	const autofocusOptionRef = $(ID + ElementIds.panelPopoverOptionsAutofocus) as HTMLInputElement
	const importantOptionRef = $(ID + ElementIds.panelPopoverOptionsImportant) as HTMLInputElement
	const draggableOptionRef = $(ID + ElementIds.panelPopoverOptionsDraggable) as HTMLInputElement

	openButtonRef.addEventListener('click', () => openPopoverRef(popoverRef))
	closeButtonRef.addEventListener('click', () => closePopoverRef(popoverRef))
	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updatePopoverRef(popoverRef, {
				PopoverPosition: value as PopoverPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updatePopoverRef(popoverRef, {
				PopoverPadding: numberSafe(paddingOptionRef.valueAsNumber)
			})
			break
		case gapOptionRef:
			updatePopoverRef(popoverRef, {
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
			updatePopoverRef(popoverRef, {
				PopoverAnchorBy: checked? openButtonRef.id : false
			})
			break
		case autofocusOptionRef:
			updatePopoverRef(popoverRef, {PopoverAutoFocus: checked})
			break
		case importantOptionRef:
			updatePopoverRef(popoverRef, {PopoverImportant: checked})
			break
		case draggableOptionRef:
			updatePopoverRef(popoverRef, {PopoverDraggable: checked})
			break
		}
	})
}
function modalPanel(): void {
	const optionsRef = $(ID + ElementIds.panelModalOptions) as HTMLDivElement
	const openButtonRef = $(ID + ElementIds.panelModalPreviewButtonOpen) as HTMLButtonElement
	const closeButtonRef = $(ID + ElementIds.panelModalPreviewButtonClose) as HTMLButtonElement
	const modalRef = $(ID + ElementIds.panelModalPreviewModal) as HTMLDialogElement
	const positionOptionRef = $(ID + ElementIds.panelModalOptionsPosition) as HTMLDivElement
	const paddingOptionRef = $(ID + ElementIds.panelModalOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ID + ElementIds.panelModalOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ID + ElementIds.panelModalOptionsAnchor) as HTMLInputElement
	const autofocusOptionRef = $(ID + ElementIds.panelModalOptionsAutofocus) as HTMLInputElement
	const importantOptionRef = $(ID + ElementIds.panelModalOptionsImportant) as HTMLInputElement
	const draggableOptionRef = $(ID + ElementIds.panelModalOptionsDraggable) as HTMLInputElement

	openButtonRef.addEventListener('click', () => openModalRef(modalRef))
	closeButtonRef.addEventListener('click', () => closeModalRef(modalRef))
	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updateModalRef(modalRef, {
				ModalPosition: value as ModalPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updateModalRef(modalRef, {
				ModalPadding: numberSafe(paddingOptionRef.valueAsNumber)
			})
			break
		case gapOptionRef:
			updateModalRef(modalRef, {
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
			updateModalRef(modalRef, {
				ModalAnchorBy: checked? openButtonRef.id : false
			})
			break
		case autofocusOptionRef:
			updateModalRef(modalRef, {ModalAutoFocus: checked})
			break
		case importantOptionRef:
			updateModalRef(modalRef, {ModalImportant: checked})
			break
		case draggableOptionRef:
			updateModalRef(modalRef, {ModalDraggable: checked})
			break
		}
	})
}

function selectPanel(): void {
	const previewRef = $(ID + ElementIds.panelSelectPreview) as HTMLDivElement
	const optionsRef = $(ID + ElementIds.panelSelectOptions) as HTMLDivElement
	const variantOptionRef = $(ID + ElementIds.panelSelectOptionsVariant) as HTMLDivElement
	const resetOptionRef = $(ID + ElementIds.panelSelectOptionsReset) as HTMLButtonElement
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
			updateSelectRef(previewRef, {
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
	const optionsRef = $(ID + ElementIds.panelTooltipOptions) as HTMLDivElement
	const anchorOptionRef = $(ID + ElementIds.panelTooltipOptionsAnchor) as HTMLInputElement
	const previewRef = $(ID + ElementIds.panelTooltipPreview) as HTMLDivElement
	const positionOptionRef = $(ID + ElementIds.panelTooltipOptionsPosition) as HTMLDivElement
	const gapOptionRef = $(ID + ElementIds.panelTooltipOptionsGap) as HTMLInputElement
	const startDelayOptionRef = $(ID + ElementIds.panelTooltipOptionsStartDelay) as HTMLInputElement
	const endDelayOptionRef = $(ID + ElementIds.panelTooltipOptionsEndDelay) as HTMLInputElement
	let timeGapId: number | NodeJS.Timeout | null = null
	let timeStartDelayId: number | NodeJS.Timeout | null = null
	let timeEndDelayId: number | NodeJS.Timeout | null = null

	startDelayOptionRef.addEventListener('input', () => {
		if (timeStartDelayId !== null) clearTimeout(timeStartDelayId)

		timeStartDelayId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipStartDelay: numberSafe(startDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	endDelayOptionRef.addEventListener('input', () => {
		if (timeEndDelayId !== null) clearTimeout(timeEndDelayId)

		timeEndDelayId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipEndDelay: numberSafe(endDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	gapOptionRef.addEventListener('input', () => {
		if (timeGapId !== null) clearTimeout(timeGapId)

		timeGapId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipGap: numberSafe(gapOptionRef.valueAsNumber)
			})
		}, 50)
	})

	optionsRef.addEventListener(SelectEvents.change, ev => {
		const target = ev.target as HTMLDivElement
		const value = target.getAttribute(SelectAttributes.value)!
		switch (target) {
		case positionOptionRef:
			updateTooltipRef(previewRef, {
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
			updateTooltipRef(previewRef, {
				TooltipUseAnchor: checked
			})
		}
	})
}

function menuPanel(): void {
	const optionsRef = $(ID + ElementIds.panelMenuOptions) as HTMLDivElement
	const buttonRef = $(ID + ElementIds.panelMenuPreviewButton) as HTMLButtonElement
	const menuRef = $(ID + ElementIds.panelMenuPreviewMenu) as HTMLDivElement
	const positionOptionRef = $(ID + ElementIds.panelMenuOptionsPosition) as HTMLDivElement
	const anchorOptionRef = $(ID + ElementIds.panelMenuOptionsAnchor) as HTMLInputElement
	const gapOptionRef = $(ID + ElementIds.panelMenuOptionsGap) as HTMLInputElement

	buttonRef.addEventListener('click', () => openMenuRef(menuRef))
	buttonRef.addEventListener('contextmenu', ev => {
		ev.preventDefault()
		openMenuRef(menuRef)
	})

	optionsRef.addEventListener('focusout', ev => {
		const target = ev.target as HTMLElement
		switch (target) {
		case gapOptionRef:
			updateMenuRef(menuRef, {
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
			updateMenuRef(menuRef, {
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
			updateMenuRef(menuRef, {
				PopoverPosition: value as MenuPosition
			})
			break
		}
	})
}

function panelEmojiPicker(): void {
	const optionsRef = $(ID + ElementIds.panelEmojipickerOptions) as HTMLDivElement
	const autocloseOptionRef = $(ID + ElementIds.panelEmojipickerOptionsAutoclose) as HTMLInputElement
	const buttonRef = $(ID + ElementIds.panelEmojipickerPreviewButton) as HTMLButtonElement
	const emojipickerRef = $(ID + ElementIds.panelEmojipickerPreviewEmojiPicker) as HTMLDivElement

	buttonRef.addEventListener('click', () => {
		openPopoverRef(emojipickerRef, {
			anchor: buttonRef
		})
	})

	emojipickerRef.addEventListener(EmojiPickerEvents.change, ev => {
		if (ev.target !== emojipickerRef) return

		const emoji = emojipickerRef.getAttribute(EmojiPickerAttributes.emoji)!
		const name = emojipickerRef.getAttribute(EmojiPickerAttributes.emojiName)!
		buttonRef.textContent = emoji + ' ' + name
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case autocloseOptionRef:
			emojipickerRef.toggleAttribute(EmojiPickerAttributes.autoclose, checked)
			break
		}
	})
}

function panelDialog(): void {
	const buttonRef = $(ID + ElementIds.panelDialogPreviewButton) as HTMLButtonElement
	const dialogRef = $(ID + ElementIds.panelDialogPreviewDialog) as HTMLDialogElement
	const optionsRef = $(ID + ElementIds.panelDialogOptions) as HTMLDivElement
	const importantOptionRef = $(ID + ElementIds.panelDialogOptionsImportant) as HTMLInputElement

	optionsRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const checked = target.checked
		switch (target) {
		case importantOptionRef:
			updateDialogRef(dialogRef, {
				DialogImportant: checked
			})
			break
		}
	})

	buttonRef.addEventListener('click', () => {
		dialogRef.showModal()
	})
}

function _(): void {
	panelDialog()
	panelEmojiPicker()
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