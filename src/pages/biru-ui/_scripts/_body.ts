import { updateButtonRef, type ButtonVariant } from "@/components/Button"
import { ElementIds } from "./_enums"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { PopoverPosition, updatePopoverRef } from "@/components/Popover"
import { ColorPickerAttributes, ColorPickerEvents } from "@/components/ColorPicker"
import { colorContrastRatio, hexToRgb } from "@/utils/color"
import type { HEXColor } from "@/types/color"
import { IconClasses, updateIconRef } from "@/components/Icon"
import { ListVariant, updateListRef, type ListElement } from "@/components/List"
import { safeNumber } from "@/utils/number"
import { closeModalRef, ModalPosition, openModalRef, updateModalRef } from "@/components/Modal"
import { TooltipPosition, updateTooltipRef } from "@/components/Tooltip"
import { MenuPosition, updateMenuRef } from "@/components/Menu"
import { EmojiPickerAttributes, EmojiPickerEvents } from "@/components/EmojiPicker"
import { updateDialogRef } from "@/components/Dialog"
import { DatePickerAttributes, DatePickerEvents, updateDatePickerRef } from "@/components/DatePicker"
import { ComboBoxVariant, updateComboBoxRef, type ComboBoxElement } from "@/components/ComboBox"
import type { CheckBoxElement } from "@/components/CheckBox"

const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
const $ = (id: string) => document.getElementById(id)

function _button(): void {
	const options = $(ElementIds.panelButtonsOptions) as HTMLDivElement
	const btn1 = $(ElementIds.panelButtonsPreview1) as HTMLButtonElement
	const btn2 = $(ElementIds.panelButtonsPreview2) as HTMLButtonElement
	const btn3 = $(ElementIds.panelButtonsPreview3) as HTMLButtonElement
	const optionVariant = $(ElementIds.panelButtonsOptionsVariant) as ComboBoxElement
	const optionDisabled = $(ElementIds.panelButtonsOptionsDisabled) as CheckBoxElement
	const optionFocused = $(ElementIds.panelButtonsOptionsFocused) as CheckBoxElement
	options.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case optionDisabled: {
			const checked = (target as HTMLInputElement).checked
			updateButtonRef(btn1, {ButtonDisabled: checked})
			updateButtonRef(btn2, {ButtonDisabled: checked})
			updateButtonRef(btn3, {ButtonDisabled: checked})
			break
		}
		case optionFocused: {
			const checked = (target as HTMLInputElement).checked
			updateButtonRef(btn1, {ButtonFocused: checked})
			updateButtonRef(btn2, {ButtonFocused: checked})
			updateButtonRef(btn3, {ButtonFocused: checked})
			break
		}
		case optionVariant: {
			const value = optionVariant.value
			updateButtonRef(btn1, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn2, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn3, {ButtonVariant: value as ButtonVariant})
			break
		}}
	})

	options.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case optionVariant: {
			const value = optionVariant.value
			updateButtonRef(btn1, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn2, {ButtonVariant: value as ButtonVariant})
			updateButtonRef(btn3, {ButtonVariant: value as ButtonVariant})
			break
		}}
	})
}

function _checkBox(): void {
	const checkbox1 = $(ElementIds.panelCheckboxPreview1) as HTMLInputElement
	const checkbox2 = $(ElementIds.panelCheckboxPreview2) as HTMLInputElement
	const checkbox3 = $(ElementIds.panelCheckboxPreview3) as HTMLInputElement
	const options = $(ElementIds.panelCheckboxOptions)

	options?.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		checkbox1.disabled = target.checked
		checkbox2.disabled = target.checked
		checkbox3.disabled = target.checked
	})
}

function _textField(): void {
	const animationOptions = {duration: 250, easing: AnimationEffectTiming.spring}
	const textField = $(ElementIds.panelTextfieldPreview) as HTMLDivElement
	const input = $(ElementIds.panelTextfieldPreviewInput) as HTMLInputElement
	const leading = $(ElementIds.panelTextfieldPreviewLeading) as HTMLElement
	const trailing = $(ElementIds.panelTextfieldPreviewTrailing) as HTMLButtonElement
	const options = $(ElementIds.panelTextfieldOptions)
	const optionType = $(ElementIds.panelTextfieldOptionsType) as ComboBoxElement
	const optionLeading = $(ElementIds.panelTextfieldOptionsLeading) as HTMLInputElement
	const optionTrailing = $(ElementIds.panelTextfieldOptionsTrailing) as HTMLInputElement
	const optionReadonly = $(ElementIds.panelTextfieldOptionsReadonly) as HTMLInputElement
	const optionPlaceholder = $(ElementIds.panelTextfieldOptionsPlaceholder) as HTMLInputElement

	options?.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case optionType:
			input.type = optionType.value ?? 'text'
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

function _colorPicker(): void {
	const options = $(ElementIds.panelColorpickerOptions)
	const button = $(ElementIds.panelColorpickerPreviewButton) as HTMLButtonElement
	const colorpicker = $(ElementIds.panelColorpickerPreviewColorPicker) as HTMLDivElement
	const optionHueOnly = $(ElementIds.panelColorpickerOptionsHueOnly) as HTMLInputElement
	const optionDisabledOpacity = $(ElementIds.panelColorpickerOptionsDisabledOpacity) as HTMLInputElement

	colorpicker.addEventListener(ColorPickerEvents.change, () => {
		const value = colorpicker.getAttribute(ColorPickerAttributes.value)!
		button.textContent = value
		button.setAttribute('data-tooltip', 'Pick color')
		button.style.setProperty('background-color', value)
		button.style.setProperty('color', colorContrastRatio(hexToRgb(value as HEXColor), {r: 0, g: 0, b: 0}) > 50 ? '#000' : '#fff')
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

function _icon(): void {
	const previewRef = $(ElementIds.panelIconPreview) as HTMLDivElement
	const optionsRef = $(ElementIds.panelIconOptions)
	const filledOptionRef = $(ElementIds.panelIconOptionsFilled)
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

function _list(): void {
	const optionsRef = $(ElementIds.panelListOptions)! as HTMLDivElement
	const listPreview = $(ElementIds.panelListPreviewList)! as ListElement<HTMLDivElement>
	const leadingPreview = $(ElementIds.panelListPreviewLeading)! as HTMLDivElement
	const titlePreview = $(ElementIds.panelListPreviewTitle)! as HTMLParagraphElement
	const trailingPreview = $(ElementIds.panelListPreviewTrailing)! as HTMLDivElement
	const subtitlePreview = $(ElementIds.panelListPreviewSubtitle)! as HTMLDivElement
	const leadingOptionRef = $(ElementIds.panelListOptionsLeading)! as HTMLInputElement
	const trailingOptionRef = $(ElementIds.panelListOptionsTrailing)! as HTMLInputElement
	const subtitleOptionRef = $(ElementIds.panelListOptionsSubtitle)! as HTMLInputElement
	const titleOptionRef = $(ElementIds.panelListOptionsTitle)! as HTMLInputElement
	const variantOptionRef = $(ElementIds.panelListOptionsVariant)! as ComboBoxElement
	variantOptionRef?.addEventListener('change', () => {
		updateListRef(listPreview!, {
			ListVariant: variantOptionRef.value as ListVariant
		})
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

function _popover(): void {
	const optionsRef = $(ElementIds.panelPopoverOptions) as HTMLDivElement
	const openButtonRef = $(ElementIds.panelPopoverPreviewButtonOpen) as HTMLButtonElement
	const popoverRef = $(ElementIds.panelPopoverPreviewPopover) as HTMLDivElement
	const positionOptionRef = $(ElementIds.panelPopoverOptionsPosition) as ComboBoxElement
	const paddingOptionRef = $(ElementIds.panelPopoverOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ElementIds.panelPopoverOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ElementIds.panelPopoverOptionsAnchor) as HTMLInputElement
	const draggableOptionRef = $(ElementIds.panelPopoverOptionsDraggable) as HTMLInputElement

	optionsRef.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case positionOptionRef:
			updatePopoverRef(popoverRef, {
				PopoverPosition: positionOptionRef.value as PopoverPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updatePopoverRef(popoverRef, {
				PopoverPadding: safeNumber(paddingOptionRef.valueAsNumber)
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
		case draggableOptionRef:
			updatePopoverRef(popoverRef, {PopoverDraggable: checked})
			break
		}
	})
}

function _modal(): void {
	const optionsRef = $(ElementIds.panelModalOptions) as HTMLDivElement
	const openButtonRef = $(ElementIds.panelModalPreviewButtonOpen) as HTMLButtonElement
	const closeButtonRef = $(ElementIds.panelModalPreviewButtonClose) as HTMLButtonElement
	const modalRef = $(ElementIds.panelModalPreviewModal) as HTMLDialogElement
	const positionOptionRef = $(ElementIds.panelModalOptionsPosition) as ComboBoxElement
	const paddingOptionRef = $(ElementIds.panelModalOptionsPadding) as HTMLInputElement
	const gapOptionRef = $(ElementIds.panelModalOptionsGap) as HTMLInputElement
	const anchorOptionRef = $(ElementIds.panelModalOptionsAnchor) as HTMLInputElement
	const autofocusOptionRef = $(ElementIds.panelModalOptionsAutofocus) as HTMLInputElement
	const importantOptionRef = $(ElementIds.panelModalOptionsImportant) as HTMLInputElement
	const draggableOptionRef = $(ElementIds.panelModalOptionsDraggable) as HTMLInputElement

	openButtonRef.addEventListener('click', () => openModalRef(modalRef))
	closeButtonRef.addEventListener('click', () => closeModalRef(modalRef))
	optionsRef.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case positionOptionRef:
			updateModalRef(modalRef, {
				ModalPosition: positionOptionRef.value as ModalPosition
			})
			break
		}
	})

	optionsRef.addEventListener('focusout', ev => {
		switch (ev.target) {
		case paddingOptionRef:
			updateModalRef(modalRef, {
				ModalPadding: safeNumber(paddingOptionRef.valueAsNumber)
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

function _comboBox(): void {
	const previewRef = $(ElementIds.panelComboBoxPreview) as ComboBoxElement
	const optionsRef = $(ElementIds.panelComboBoxOptions) as HTMLDivElement
	const variantOptionRef = $(ElementIds.panelComboBoxOptionsVariant) as ComboBoxElement

	optionsRef.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case variantOptionRef:
			updateComboBoxRef(previewRef, {
				ComboBoxVariant: variantOptionRef.value as ComboBoxVariant
			})
			break
		}
	})
}

function _tooltip(): void {
	const optionsRef = $(ElementIds.panelTooltipOptions) as HTMLDivElement
	const anchorOptionRef = $(ElementIds.panelTooltipOptionsAnchor) as HTMLInputElement
	const previewRef = $(ElementIds.panelTooltipPreview) as HTMLDivElement
	const positionOptionRef = $(ElementIds.panelTooltipOptionsPosition) as ComboBoxElement
	const gapOptionRef = $(ElementIds.panelTooltipOptionsGap) as HTMLInputElement
	const startDelayOptionRef = $(ElementIds.panelTooltipOptionsStartDelay) as HTMLInputElement
	const endDelayOptionRef = $(ElementIds.panelTooltipOptionsEndDelay) as HTMLInputElement
	let timeGapId: number | NodeJS.Timeout | null = null
	let timeStartDelayId: number | NodeJS.Timeout | null = null
	let timeEndDelayId: number | NodeJS.Timeout | null = null

	startDelayOptionRef.addEventListener('input', () => {
		if (timeStartDelayId !== null) clearTimeout(timeStartDelayId)

		timeStartDelayId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipStartDelay: safeNumber(startDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	endDelayOptionRef.addEventListener('input', () => {
		if (timeEndDelayId !== null) clearTimeout(timeEndDelayId)

		timeEndDelayId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipEndDelay: safeNumber(endDelayOptionRef.valueAsNumber)
			})
		}, 50)
	})

	gapOptionRef.addEventListener('input', () => {
		if (timeGapId !== null) clearTimeout(timeGapId)

		timeGapId = setTimeout(() => {
			updateTooltipRef(previewRef, {
				TooltipGap: safeNumber(gapOptionRef.valueAsNumber)
			})
		}, 50)
	})

	optionsRef.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case positionOptionRef:
			updateTooltipRef(previewRef, {
				TooltipPosition: positionOptionRef.value as TooltipPosition
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

function _menu(): void {
	const optionsRef = $(ElementIds.panelMenuOptions) as HTMLDivElement
	const buttonRef = $(ElementIds.panelMenuPreviewButton) as HTMLButtonElement
	const menuRef = $(ElementIds.panelMenuPreviewMenu) as HTMLDivElement
	const positionOptionRef = $(ElementIds.panelMenuOptionsPosition) as ComboBoxElement
	const anchorOptionRef = $(ElementIds.panelMenuOptionsAnchor) as HTMLInputElement
	const gapOptionRef = $(ElementIds.panelMenuOptionsGap) as HTMLInputElement

	optionsRef.addEventListener('focusout', ev => {
		const target = ev.target as HTMLElement
		switch (target) {
		case gapOptionRef:
			updateMenuRef(menuRef, {
				PopoverGap: safeNumber(gapOptionRef.valueAsNumber)
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

	optionsRef.addEventListener('change', ev => {
		const target = ev.target
		switch (target) {
		case positionOptionRef:
			updateMenuRef(menuRef, {
				PopoverPosition: positionOptionRef.value as MenuPosition
			})
			break
		}
	})
}

function _emojiPicker(): void {
	const optionsRef = $(ElementIds.panelEmojipickerOptions) as HTMLDivElement
	const autocloseOptionRef = $(ElementIds.panelEmojipickerOptionsAutoclose) as HTMLInputElement
	const buttonRef = $(ElementIds.panelEmojipickerPreviewButton) as HTMLButtonElement
	const emojipickerRef = $(ElementIds.panelEmojipickerPreviewEmojiPicker) as HTMLDivElement

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

function _dialog(): void {
	const buttonRef = $(ElementIds.panelDialogPreviewButton) as HTMLButtonElement
	const dialogRef = $(ElementIds.panelDialogPreviewDialog) as HTMLDialogElement
	const optionsRef = $(ElementIds.panelDialogOptions) as HTMLDivElement
	const importantOptionRef = $(ElementIds.panelDialogOptionsImportant) as HTMLInputElement

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

function _datepicker(): void {
	const previewDatePickerRef = $(ElementIds.panelDatePickerPreviewDatePicker) as HTMLDivElement
	const previewButtonRef = $(ElementIds.panelDatePickerPreviewButton) as HTMLButtonElement
	const startOptionRef = $(ElementIds.panelDatePickerOptionsStartPicker) as HTMLDivElement
	const startButtonOptionRef = $(ElementIds.panelDatePickerOptionsStartButton) as HTMLDivElement
	const endOptionRef = $(ElementIds.panelDatePickerOptionsEndPicker) as HTMLDivElement
	const endButtonOptionRef = $(ElementIds.panelDatePickerOptionsEndButton) as HTMLDivElement

	previewDatePickerRef.addEventListener(DatePickerEvents.change, () => {
		previewButtonRef.textContent = new Date(
			previewDatePickerRef.getAttribute(DatePickerAttributes.value)!
		).toLocaleDateString('en', {day: 'numeric', month: 'long', year: 'numeric'})
	})

	startOptionRef.addEventListener(DatePickerEvents.change, () => {
		const date = new Date(
			startOptionRef.getAttribute(DatePickerAttributes.value)!
		)

		updateDatePickerRef(previewDatePickerRef, {
			DatePickerStartDate: date
		})

		const s = startButtonOptionRef.querySelector<HTMLSpanElement>('span')
		s!.textContent = date.toLocaleDateString('en', {day: 'numeric', month: 'long', year: 'numeric'})
	})

	endOptionRef.addEventListener(DatePickerEvents.change, () => {
		const date = new Date(
			endOptionRef.getAttribute(DatePickerAttributes.value)!
		)

		updateDatePickerRef(previewDatePickerRef, {
			DatePickerEndDate: date
		})

		const s = endButtonOptionRef.querySelector<HTMLSpanElement>('span')
		s!.textContent = date.toLocaleDateString('en', {day: 'numeric', month: 'long', year: 'numeric'})
	})
}

export default () => {
	_datepicker()
	_dialog()
	_emojiPicker()
	_menu()
	_tooltip()
	_button()
	_checkBox()
	_textField()
	_colorPicker()
	_icon()
	_list()
	_popover()
	_modal()
	_comboBox()
}