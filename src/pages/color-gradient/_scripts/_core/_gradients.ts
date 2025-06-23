import { updateMenuRef, type MenuElement, type MenuItemElement, type SubMenuItemElement } from "@/native-components/Menu"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CSSClasses, CSSGroup } from "../../_styles/_css"
import type { TooltipElement } from "@/native-components/Tooltip"
import { isTargetValidElement } from "@/utils/element"
import { moveArrayElement, isValidEnumValue } from "@/utils/object"
import { Commands } from "../_shared/_commands"
import { createElementId } from "@/utils/ids"
import { isPopoverRefOpen, repositionPopoverRef, updatePopoverRef } from "@/native-components/Popover"
import { createButtonRef, createIconButtonRef, updateButtonRef, updateIconButtonRef, type ButtonElement, type IconButtonElement } from "@/native-components/Button"
import type { HEXColor } from "@/types/color"
import { ColorSpace, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, type RectangularColorSpace } from "../_shared/_enums"
import { ObservableStore } from "@/utils/store"
import type { ComboBoxElement } from "@/native-components/ComboBox"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { DEFAULT_STOP_COLOR_1, DEFAULT_STOP_COLOR_2 } from "../_shared/_constant"
import { createSliderRef, registerSliderRef, SliderClasses, updateSliderRefValue, type SliderElement } from "@/native-components/Slider"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { createTextFieldButtonRef, createTextFieldRef, type TextFieldButtonElement } from "@/native-components/TextField"
import { createIconRef } from "@/native-components/Icon"
import { IconCodes } from "@/enums/icons"
import { gradientToCSSText } from "./_gradient-utils"
import { SettingsStore } from "./_settings"
import { ColorPickerEvents, getColorPickerRefValue, updateColorPickerRef, type ColorPickerElement } from "@/native-components/ColorPicker"
import { generateSavedGradientId, SavedGradients } from "./_saved-gradients"
import type { ToastElement } from "@/native-components/Toast"
import { saveGradientDB } from "./_database"

export type ColorStopGradient = {
	color: HEXColor

	/** `0-100` in percentage `%` */
	size: number
}

export type GradientItem = {
	type: GradientType
	repeat: boolean
	colorMethod: RectangularColorSpace | PolarColorSpace
	hueMethod: HueInterpolationMethod

	/** need to manually notify callback to update view */
	stops: ColorStopGradient[]

	/** in degree `deg`. Only for `GradientType.linear | GradientType.conic` */
	angle: number

	/** Only for `GradientType.radial` */
	shape: RadialGradientShape

	/** in percentage `%`. Only for `GradientType.radial | GradientType.conic` */
	positionX: number

	/** in percentage `%`. Only for `GradientType.radial | GradientType.conic` */
	positionY: number

	/** in percentage `%`. Only for `GradientType.radial` */
	width: number

	/** in percentage `%`. Only for `GradientType.radial` */
	height: number

	/** in percentage `px`. Only for `GradientType.radial` */
	size: number
}

export type GradientStoreType = Readonly<{
	selected: ObservableStore<Readonly<GradientItem>>
	gradients: ObservableStore<Readonly<GradientItem>>[]
}>
const _animationOption = {duration: 250, easing: AnimationEffectTiming.spring}
const _defaultGradient = new ObservableStore<Readonly<GradientItem>>({
	angle: 0,
	colorMethod: PolarColorSpace.auto,
	stops: [
		{size: 0, color: DEFAULT_STOP_COLOR_1},
		{size: 100, color: DEFAULT_STOP_COLOR_2}
	],
	hueMethod: HueInterpolationMethod.auto,
	positionX: 0,
	positionY: 0,
	repeat: false,
	shape: RadialGradientShape.circle,
	height: 0,
	size: 0,
	width: 0,
	type: GradientType.linear
})
export const GradientStore = new ObservableStore<GradientStoreType>({
	selected: _defaultGradient,
	gradients: [_defaultGradient]
})

// ctrlStop = control stop
const _ctrlStop_actionsRef = $(ElementIds.bdGradStop_actions) as MenuElement
const _ctrlStop_colorPickerRef = $(ElementIds.bdGradStop_colorPicker) as ColorPickerElement
const _ctrlStop_addRef = $(ElementIds.bdGradStop_add) as ButtonElement
const _ctrlStop_sortRef = $(ElementIds.bdGradStop_sort) as IconButtonElement

// ctrlStopAct = control stop action
const _ctrlStopAct_deleteRef = $(ElementIds.bdGradStopAct_delete) as ButtonElement
const _ctrlStopAct_newTopRef = $(ElementIds.bdGradStopAct_newTop) as ButtonElement
const _ctrlStopAct_newBottomRef = $(ElementIds.bdGradStopAct_newBottom) as ButtonElement
const _ctrlStopAct_moveTopRef = $(ElementIds.bdGradStopAct_moveTop) as ButtonElement
const _ctrlStopAct_moveBottomRef = $(ElementIds.bdGradStopAct_moveBottom) as ButtonElement

// ctrlProp = control property
const _ctrlProp_colorStopsRef = $(ElementIds.bdGradCtrl_colorStops) as HTMLUListElement
const _ctrlProp_typeRef = $(ElementIds.bdGradCtrl_type) as ComboBoxElement
const _ctrlProp_colorSpaceRef = $(ElementIds.bdGradCtrl_colorSpace) as ComboBoxElement
const _ctrlProp_hueInterpolationRef = $(ElementIds.bdGradCtrl_hueInterpolation) as ComboBoxElement
const _ctrlProp_radialShapeRef = $(ElementIds.bdGradCtrl_radialShape) as ComboBoxElement
const _ctrlProp_positionXRef = $(ElementIds.bdGradCtrl_positionX) as HTMLInputElement
const _ctrlProp_positionYRef = $(ElementIds.bdGradCtrl_positionY) as HTMLInputElement
const _ctrlProp_widthRef = $(ElementIds.bdGradCtrl_width) as HTMLInputElement
const _ctrlProp_heightRef = $(ElementIds.bdGradCtrl_height) as HTMLInputElement
const _ctrlProp_sizeRef = $(ElementIds.bdGradCtrl_size) as HTMLInputElement
const _ctrlProp_angleRef = $(ElementIds.bdGradCtrl_angle) as HTMLInputElement
const _ctrlProp_repeatRef = $(ElementIds.bdGradCtrl_repeat) as HTMLInputElement

// ctrlPropGrp = control property group
const _ctrlPropGrp_positionXYRef = $(ElementIds.bdGradCtrl_positionXY) as HTMLDivElement
const _ctrlPropGrp_widthHeightRef = $(ElementIds.bdGradCtrl_widthHeight) as HTMLDivElement

// ctrlPropLbl = control property label
const _ctrlPropLbl_hueInterpolationRef = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_hueInterpolation)}]`
)!
const _ctrlPropLbl_radialShapeRef = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_radialShape)}]`
)!
const _ctrlPropLbl_sizeRef = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_size)}]`
)!
const _ctrlPropLbl_angleRef = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_angle)}]`
)!

// act = action
const _act_copyRef = $(ElementIds.bdGradAct_copy) as MenuItemElement
const _act_deleteRef = $(ElementIds.bdGradAct_delete) as MenuItemElement
const _act_moveRef = $(ElementIds.bdGradAct_move) as SubMenuItemElement
const _act_moveTopRef = $(ElementIds.bdGradAct_moveTop) as MenuItemElement
const _act_moveBottomRef = $(ElementIds.bdGradAct_moveBottom) as MenuItemElement
const _act_newTop = $(ElementIds.bdGradAct_newTop) as MenuItemElement
const _act_newBottom = $(ElementIds.bdGradAct_newBottom) as MenuItemElement

// grad = gradient
const _grad_add = $(ElementIds.bdGrad_add) as ButtonElement
const _grad_copy = $(ElementIds.bdGrad_copy) as IconButtonElement
const _grad_save = $(ElementIds.bdGrad_save) as IconButtonElement

const _toastCopiedRef = $(ElementIds.bdToas_copied) as ToastElement
const _toastSavedRef = $(ElementIds.bdToas_saved) as ToastElement
const _previewBoxRef = $(ElementIds.bd_preview) as HTMLDivElement
const _gradientsRef = $(ElementIds.bd_gradients) as HTMLUListElement
const _actionsMenuRef = $(ElementIds.bdGrad_actionsMenu) as MenuElement
const _controlPopoverRef = $(ElementIds.bdGrad_controlPopover) as MenuElement
const _gradientBodyRef = $$<TooltipElement>(`.${CSSClasses.bodyGradients}`)!
const _actionButtonRefs = () => $$$<HTMLButtonElement>(
	`.${CSSClasses.bodyGradients} [data-command="${Commands.grad_openActions}"]`
)
const _editButtonRefs = () => $$$<HTMLButtonElement>(
	`.${CSSClasses.bodyGradients} [data-command="${Commands.grad_edit}"]`
)
const _ctrlStop_pickColorRefs = () => $$$<TextFieldButtonElement>(
	`[data-command=${CSS.escape(Commands.gradStop_pickColor)}]`
)
const _ctrlStop_actionRefs = () => $$$<TextFieldButtonElement>(
	`[data-command=${CSS.escape(Commands.gradStop_actions)}]`
)
let _selectedStopIndex = 0
let _selectedGradientIndex = 0

// i tried put this in subscriber but it become disaster. this will
// call every time `Gradients.value.selectedGradient.stops` changed.
function _updateGradientControlView(updateStops = true): void {
	const selectedGradient = GradientStore.value.selected
	const gradient = selectedGradient.value
	const colorStopList = gradient.stops
	const shape = gradient.shape
	const type = gradient.type
	const sizeInputRefs: (HTMLInputElement | null | undefined)[] = []
	const colorInputRefs: (HTMLInputElement | null | undefined)[] = []
	const sizeSliderRefs: (HTMLInputElement | null | undefined)[] = []
	const colorButtonRefs: (HTMLButtonElement | null | undefined)[] = []

	function updateProperties(): void {
		_ctrlProp_typeRef            .value = gradient.type
		_ctrlProp_colorSpaceRef      .value = gradient.colorMethod
		_ctrlProp_hueInterpolationRef.value = gradient.hueMethod
		_ctrlProp_radialShapeRef     .value = gradient.shape
		_ctrlProp_positionXRef       .value = gradient.positionX + ''
		_ctrlProp_positionYRef       .value = gradient.positionY + ''
		_ctrlProp_widthRef           .value = gradient.width + ''
		_ctrlProp_heightRef          .value = gradient.height + ''
		_ctrlProp_sizeRef            .value = gradient.size + ''
		_ctrlProp_angleRef           .value = gradient.angle + ''
		_ctrlProp_repeatRef          .checked = gradient.repeat

		const hidden = new Set<HTMLElement>()
		if (![
			PolarColorSpace.hsl, PolarColorSpace.hwb,
			PolarColorSpace.lch, PolarColorSpace.oklch
		].includes(gradient.colorMethod as PolarColorSpace)) {
			hidden.add(_ctrlProp_hueInterpolationRef)
			hidden.add(_ctrlPropLbl_hueInterpolationRef)
		}

		if (type !== GradientType.radial) {
			hidden.add(_ctrlProp_radialShapeRef)
			hidden.add(_ctrlPropLbl_radialShapeRef)
			hidden.add(_ctrlPropGrp_widthHeightRef)
			hidden.add(_ctrlProp_sizeRef.parentElement!)
			hidden.add(_ctrlPropLbl_sizeRef)
		}
		else {
			if (shape !== RadialGradientShape.circle) {
				hidden.add(_ctrlProp_sizeRef.parentElement!)
				hidden.add(_ctrlPropLbl_sizeRef)
			}

			if (shape !== RadialGradientShape.ellipse) {
				hidden.add(_ctrlPropGrp_widthHeightRef)
			}
		}

		if (![GradientType.conic, GradientType.linear].includes(type)) {
			hidden.add(_ctrlProp_angleRef.parentElement!)
			hidden.add(_ctrlPropLbl_angleRef)
		}

		if (![GradientType.conic, GradientType.radial].includes(type)) {
			hidden.add(_ctrlPropGrp_positionXYRef)
		}

		const allowAnimation = isAnimationAllowed()
		for (const ref of [
			_ctrlPropGrp_positionXYRef,
			_ctrlPropGrp_widthHeightRef,
			_ctrlPropLbl_radialShapeRef,
			_ctrlPropLbl_hueInterpolationRef,
			_ctrlPropLbl_sizeRef,
			_ctrlPropLbl_angleRef,
			_ctrlProp_hueInterpolationRef,
			_ctrlProp_radialShapeRef,
			_ctrlProp_sizeRef.parentElement!,
			_ctrlProp_angleRef.parentElement!,
		]) {
			if (hidden.has(ref)) {continue}

			const isGroup = (
				ref === _ctrlPropGrp_widthHeightRef
				|| ref === _ctrlPropGrp_positionXYRef
			)
			const isInvisible = !ref.checkVisibility()
			if (isGroup) {
				ref.style.setProperty('display', 'grid')
			}
			else {
				ref.style.removeProperty('display')
			}

			if (allowAnimation && isInvisible) {
				ref.animate({
					opacity: [0, 1],
					scale: [0, 1]
				}, _animationOption)
			}
		}

		for (const ref of hidden) {
			ref.style.setProperty('display', 'none')
		}
	}

	function stopSizeTextOnInput(ev: Event): void {
		const target = ev.currentTarget as HTMLInputElement
		const datasetIndex = target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const value = Math_clamp(safeNumber(Number.parseFloat(target.value)), 0, 100)
		const slider = sizeSliderRefs[index as unknown as number]
		const stopGradient = colorStopList[index as unknown as number]
		if (slider) {
			updateSliderRefValue(slider, value)
		}
		if (stopGradient) {
			stopGradient.size = value
			selectedGradient.notify()
		}
	}

	function stopSizeTextOnBlur(ev: Event): void {
		const target = ev.currentTarget as HTMLInputElement
		const value = Math_clamp(safeNumber(Number.parseFloat(target.value)), 0, 100)
		target.value = value + '%'
	}

	function stopSizeSliderOnInput(ev: Event): void {
		const target = ev.currentTarget as HTMLInputElement
		const datasetIndex = target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const value = Math_clamp(safeNumber(target.valueAsNumber), 0, 100)
		const input = sizeInputRefs[index as unknown as number]
		const stopGradient = colorStopList[index as unknown as number]
		if (input) {
			input.value = value + '%'
		}
		if (stopGradient) {
			stopGradient.size = value
			selectedGradient.notify()
		}
	}

	function stopColorOnInput(ev: Event): void {
		const target = ev.currentTarget as HTMLInputElement
		const datasetIndex = target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const stopGradient = colorStopList[index]
		const buttonRef = colorButtonRefs[index]
		const value = ('#' + target
			.value
			.replace(/[^0-9A-Fa-f]/g, '')
			.padEnd(6, '0')
			.toUpperCase()
			.substring(0, 8)
		)
		if (buttonRef) {
			requestAnimationFrame(() =>
				buttonRef.style.setProperty('color', value)
			)
		}
		if (stopGradient) {
			stopGradient.color = value as HEXColor
			selectedGradient.notify()
		}
	}

	function stopColorOnBlur(ev: Event): void {
		const target = ev.currentTarget as HTMLInputElement
		target.value = ('#' + target
			.value
			.replace(/[^0-9A-Fa-f]/g, '')
			.padEnd(6, '0')
			.toUpperCase()
			.substring(0, 8)
		)
	}

	// [data-index] is used in event callback.
	// CSSGroup.stopSizeInput reference to <input> for stop color gradient size.
	// CSSGroup.stopColorInput reference to <input> for stop color gradient hex.
	// Don't use `GradientStore.value.selectedGradient.update()` to update single color stop.
	function updateColorStops(): void {

		// for now, the event will added here. currently, i
		// don't know how to add event in `_initEvents()`
		const updateControlEvents = (
			i: number,
			sizeInputRef?: HTMLInputElement | null,
			sizeSliderRef?: SliderElement | null,
			colorInputRef?: HTMLInputElement | null,
			colorButtonRef?: TextFieldButtonElement | null
		) => {
			const colorStop = colorStopList[i]
			if (colorStop) {
				if (sizeInputRef) {
					sizeInputRef.value = colorStop.size + '%'
				}

				if (sizeSliderRef) {
					updateSliderRefValue(sizeSliderRef, colorStop.size)
				}

				if (colorInputRef) {
					colorInputRef.value = colorStop.color
				}

				if (colorButtonRef) {
					colorButtonRef.style.setProperty('color', colorStop.color)
				}
			}

			sizeInputRef?.removeEventListener('blur', stopSizeTextOnBlur)
			sizeInputRef?.addEventListener('blur', stopSizeTextOnBlur)

			sizeInputRef?.setAttribute('data-index', i + '')
			sizeInputRef?.removeEventListener('input', stopSizeTextOnInput)
			sizeInputRef?.addEventListener('input', stopSizeTextOnInput)
			if (!sizeInputRefs[i]) {
				sizeInputRefs[i] = sizeInputRef
			}

			colorInputRef?.setAttribute('data-index', i + '')
			colorInputRef?.removeEventListener('input', stopColorOnInput)
			colorInputRef?.addEventListener('input', stopColorOnInput)
			colorInputRef?.removeEventListener('blur', stopColorOnBlur)
			colorInputRef?.addEventListener('blur', stopColorOnBlur)
			if (!colorInputRefs[i]) {
				colorInputRefs[i] = colorInputRef
			}

			sizeSliderRef?.setAttribute('data-index', i + '')
			sizeSliderRef?.removeEventListener('input', stopSizeSliderOnInput)
			sizeSliderRef?.addEventListener('input', stopSizeSliderOnInput)
			if (!sizeSliderRefs[i]) {
				sizeSliderRefs[i] = sizeSliderRef
			}

			if (!colorButtonRefs[i]) {
				colorButtonRefs[i] = colorButtonRef
			}
		}
		const gradientStopsRefs = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.bdGradCtrl_colorStops)}>li`)

		for (let i = 0; i < gradientStopsRefs.length; i++) {
			const ref = gradientStopsRefs.item(i)
			if (i > colorStopList.length-1) {
				ref.remove()
				continue
			}

			const sizeInputRef = $$<HTMLInputElement>('.' + CSSGroup.stopSizeInput, ref)
			const sizeSliderRef = $$<SliderElement>(`.${SliderClasses.slider}`, ref)
			const colorInputRef = $$<HTMLInputElement>('.' + CSSGroup.stopColorInput, ref)
			const colorButtonRef = $$<TextFieldButtonElement>(`[data-command="${Commands.gradStop_pickColor}"]`, ref)
			updateControlEvents(i, sizeInputRef, sizeSliderRef, colorInputRef, colorButtonRef)
		}

		for (let i = 0; i < colorStopList.length - gradientStopsRefs.length; i++) {
			const index = gradientStopsRefs.length + i
			const li = document.createElement('li')
			const div = document.createElement('div')
			const sizeTextfield = createTextFieldRef({TextFieldRefs: {input(ref) {
				ref.classList.add(CSSGroup.stopSizeInput)
				updateControlEvents(index, ref, null, null)
			}}})
			const colorTextfield = createTextFieldRef({
				TextFieldRefs: {input(ref) {
					ref.classList.add(CSSGroup.stopColorInput)
					updateControlEvents(index, null, null, ref)
				}},
				TextFieldTrailing: [
					createTextFieldButtonRef({
						ButtonChildren: [createIconRef({
							IconCode: IconCodes.circle,
							IconFilled: true
						})],
						ButtonRefs: {button(ref) {
							ref.setAttribute('data-command', Commands.gradStop_pickColor)
							ref.setAttribute('data-tooltip', 'Pick color')
							ref.setAttribute('popovertarget', ElementIds.bdGradStop_colorPicker)
							ref.popoverTargetAction = 'show'
							updateControlEvents(index, null, null, null, ref)
						}}
					}),
					createTextFieldButtonRef({
						ButtonChildren: [createIconRef({IconCode: IconCodes.moreHorizontal})],
						ButtonRefs: {button(ref) {
							ref.setAttribute('data-command', Commands.gradStop_actions)
							ref.setAttribute('popovertarget', ElementIds.bdGradStop_actions)
							ref.popoverTargetAction = 'show'
							ref.setAttribute('data-tooltip', 'More')
						}}
					}),
				]
			})
			const slider = createSliderRef({SliderMin: 0, SliderMax: 100})
			registerSliderRef(slider)
			updateControlEvents(index, null, slider, null)

			div.append(sizeTextfield, colorTextfield)
			li.append(div, slider)
			_ctrlProp_colorStopsRef.append(li)
		}
	}

	updateProperties()
	if (!updateStops) {return}

	updateColorStops()
}

function _updateGradientListView(): void {
	const gradients = GradientStore.value.gradients
	const gradientsRefs = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.bd_gradients)}>li`)
	for (let i = 0; i < gradientsRefs.length; i++) {
		const ref = gradientsRefs[i]
		if (i > gradients.length-1) {
			ref.remove()
			continue
		}

		const grad = gradients[i]
		if (!grad) {continue}

		const previewRef = $$<HTMLDivElement>(
			`[data-command="${CSS.escape(Commands.grad_edit)}"]>div`, ref
		)
		previewRef?.style.setProperty('background', gradientToCSSText(
			{...grad.value, angle: 90, type: GradientType.linear},
			ColorSpace.hex,
			false
		))
	}

	for (let i = 0; i < gradients.length - gradientsRefs.length; i++) {
		const grad = gradients[gradientsRefs.length + i]
		if (!grad) {continue}

		const li = document.createElement('li')
		const button = createButtonRef({ButtonChildren: [
			(() => {
				const div = document.createElement('div')
				div.style.setProperty('background', gradientToCSSText(
					{...grad.value, angle: 90, type: GradientType.linear},
					ColorSpace.hex,
					false
				))
				return div
			})()
		]})
		button.setAttribute('data-command', Commands.grad_edit)
		button.setAttribute('popovertarget', ElementIds.bdGrad_controlPopover)
		button.setAttribute('popovertargetaction', 'show')

		const iconButton = createIconButtonRef({IconButtonIcon: {IconCode: IconCodes.moreHorizontal}})
		iconButton.setAttribute('data-command', Commands.grad_openActions)
		iconButton.setAttribute('popovertarget', ElementIds.bdGrad_actionsMenu)
		iconButton.setAttribute('popovertargetaction', 'show')
		iconButton.setAttribute('data-tooltip', 'Actions')
		iconButton.setAttribute('aria-label', 'Actions')
		li.append(button, iconButton)
		_gradientsRef.append(li)
	}
}

function _sortStopColors(): void {
	const gradient = GradientStore.value.selected
	gradient.value.stops.sort((a, b) => a.size - b.size)
	gradient.notify()
	_updateGradientControlView()
}

function _initEvents(): void {
	const updateGradient = (updater: (state: Readonly<GradientItem>) => Readonly<GradientItem>) => {
		GradientStore.value.selected.update(updater)
	}
	let stopColorInputRef: HTMLInputElement | null | undefined = null
	let stopColorPickerButtonRef: HTMLButtonElement | null | undefined = null

	function controlProperties(): void {
		_ctrlProp_colorSpaceRef.addEventListener('change', () => {
			const value = _ctrlProp_colorSpaceRef.value as PolarColorSpace
			if (!isValidEnumValue(value, PolarColorSpace)) {return}

			updateGradient(v => ({...v, colorMethod: value}))
			_updateGradientControlView(false)
		})

		_ctrlProp_typeRef.addEventListener('change', () => {
			const value = _ctrlProp_typeRef.value as GradientType
			if (!isValidEnumValue(value, GradientType)) {return}

			updateGradient(v => {
				switch (value) {
				case GradientType.linear: return { ...v,
					type: value,
					angle: 0
				}
				case GradientType.radial: return { ...v,
					type: value,
					positionX: 50,
					positionY: 50,
					shape: RadialGradientShape.ellipse,
					height: 100,
					size: 350,
					width: 100
				}
				case GradientType.conic: return { ...v,
					type: value,
					angle: 0,
					positionX: 50,
					positionY: 50
				}}
			})
			_updateGradientControlView(false)
		})

		_ctrlProp_radialShapeRef.addEventListener('change', () => {
			const value = _ctrlProp_radialShapeRef.value as RadialGradientShape
			if (!isValidEnumValue(value, RadialGradientShape)) {return}

			updateGradient(v => ({...v, shape: value}))
			_updateGradientControlView(false)
		})

		_ctrlProp_hueInterpolationRef.addEventListener('change', () => {
			const value = _ctrlProp_hueInterpolationRef.value as HueInterpolationMethod
			if (!isValidEnumValue(value, HueInterpolationMethod)) {return}

			updateGradient(v => ({...v, hueMethod: value}))
			_updateGradientControlView(false)
		})

		_ctrlProp_repeatRef.addEventListener('change', () => {
			updateGradient(v => ({...v, repeat: _ctrlProp_repeatRef.checked}))
		})

		_ctrlProp_positionXRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_positionXRef.value))
			updateGradient(v => ({...v, positionX: value}))
		})

		_ctrlProp_positionYRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_positionYRef.value))
			updateGradient(v => ({...v, positionY: value}))
		})

		_ctrlProp_widthRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_widthRef.value))
			updateGradient(v => ({...v, width: value}))
		})

		_ctrlProp_heightRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_heightRef.value))
			updateGradient(v => ({...v, height: value}))
		})

		_ctrlProp_sizeRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_sizeRef.value))
			updateGradient(v => ({...v, size: value}))
		})

		_ctrlProp_angleRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ctrlProp_angleRef.value))
			updateGradient(v => ({...v, angle: value}))
		})
	}

	function controlStops(): void {
		_ctrlStop_colorPickerRef.addEventListener(ColorPickerEvents.input, () => {
			if (_selectedStopIndex <= -1) {return}

			const stop = GradientStore.value.selected.value.stops[_selectedStopIndex]
			if (!stop) {return}

			const color = getColorPickerRefValue(_ctrlStop_colorPickerRef).toUpperCase() as HEXColor
			stop.color = color
			GradientStore.value.selected.notify()
			requestAnimationFrame(() => {
				stopColorPickerButtonRef?.style.setProperty('color', color)
				if (stopColorInputRef) {
					stopColorInputRef.value = color
				}
			})
		})

		_ctrlStop_actionsRef.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _ctrlStop_actionRefs()) {
				updateIconButtonRef(ref, {
					ButtonFocused: false
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ctrlStop_colorPickerRef.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _ctrlStop_pickColorRefs()) {
				updateIconButtonRef(ref, {
					ButtonFocused: false
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ctrlStop_addRef.addEventListener('click', () => {
			_addColorStop()
		})

		_ctrlStop_sortRef.addEventListener('click', () => {
			_sortStopColors()
		})

		_ctrlStopAct_deleteRef.addEventListener('click', () => {
			_ctrlStop_actionsRef.hidePopover()
			const gradient = GradientStore.value.selected
			const stops = gradient.value.stops
			if (!stops[_selectedStopIndex]) {return}

			stops.splice(_selectedStopIndex, 1)
			gradient.notify()
			_updateGradientControlView()
		})

		_ctrlStopAct_moveBottomRef.addEventListener('click', () => {
			_ctrlStop_actionsRef.hidePopover()
			_moveColorStop(_selectedStopIndex + 1)
		})

		_ctrlStopAct_moveTopRef.addEventListener('click', () => {
			_ctrlStop_actionsRef.hidePopover()
			_moveColorStop(Math.max(0, _selectedStopIndex - 1))
		})

		_ctrlStopAct_newTopRef.addEventListener('click', () => {
			_ctrlStop_actionsRef.hidePopover()
			_addColorStop(_selectedStopIndex)
		})

		_ctrlStopAct_newBottomRef.addEventListener('click', () => {
			_ctrlStop_actionsRef.hidePopover()
			_addColorStop(_selectedStopIndex + 1)
		})
	}

	function gradientActions(): void {
		_act_copyRef.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			const text = gradientToCSSText(
				GradientStore.value.selected.value, SettingsStore.value.colorSpace, true
			)
			navigator.clipboard.writeText(text).then(() => {
				_toastCopiedRef.showPopover()
			})
		})

		_act_deleteRef.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			const gradients = GradientStore.value.gradients
			if (!gradients[_selectedGradientIndex]) {return}

			gradients.splice(_selectedGradientIndex, 1)
			GradientStore.notify()
			_updateGradientListView()
		})

		_act_moveTopRef.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			_moveGradient(Math.max(0, _selectedGradientIndex - 1))
		})

		_act_moveBottomRef.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			_moveGradient(_selectedGradientIndex + 1)
		})

		_act_newTop.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			_addGradient(Math.max(0, _selectedGradientIndex - 1))
		})

		_act_newBottom.addEventListener('click', () => {
			_actionsMenuRef.hidePopover()
			_addGradient(_selectedGradientIndex + 1)
		})
	}

	function init(): void {
		_controlPopoverRef.addEventListener('click', (ev) => {
			const buttonRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_gradientBodyRef, buttonRef)) {return}

			const command = buttonRef.dataset.command as Commands
			if (!command || !isValidEnumValue(command, Commands)) {return}

			const stops = GradientStore.value.selected.value.stops

			const getButtonId = () => {
				let id = buttonRef.id
				if (!id) {
					buttonRef.id = (id = createElementId())
				}
				return id
			}

			const hasStopIndex = () => {
				const liRef = buttonRef.closest('li')
				if (!liRef) {
					return false
				}

				const stopsLIRefs = _ctrlProp_colorStopsRef.children
				let i = -1
				for (; i < stopsLIRefs.length; i++) {
					if (stopsLIRefs[i] === liRef) {
						break
					}
				}

				const stop = GradientStore.value.selected.value.stops[i]
				if (!stop) {
					return false
				}

				_selectedStopIndex = i
				return true
			}

			switch (command) {
			case Commands.gradStop_pickColor: {
				if (!hasStopIndex()) {
					return ev.preventDefault()
				}

				const id = getButtonId()
				updateColorPickerRef(_ctrlStop_colorPickerRef, {
					ColorPickerValue: stops[_selectedStopIndex].color,
					PopoverAnchorBy: id
				})

				// wait for open
				setTimeout(() => {
					if (!isPopoverRefOpen(_ctrlStop_colorPickerRef)) {return}

					const liRef = buttonRef.closest('li')
					stopColorInputRef = liRef?.querySelector<HTMLInputElement>(
						'.' + CSSGroup.stopColorInput
					)
					stopColorPickerButtonRef = liRef?.querySelector<HTMLButtonElement>(
						`[data-command=${CSS.escape(Commands.gradStop_pickColor)}]`
					)
					repositionPopoverRef(_ctrlStop_colorPickerRef)
					for (const ref of _ctrlStop_pickColorRefs()) {
						const isEqual = id === ref.id
						updateButtonRef(ref, {ButtonFocused: isEqual})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break
			case Commands.gradStop_actions: {
				if (!hasStopIndex()) {
					return ev.preventDefault()
				}

				const id = getButtonId()
				updateMenuRef(_ctrlStop_actionsRef, {
					PopoverAnchorBy: id
				})

				// wait for open
				setTimeout(() => {
					if (!isPopoverRefOpen(_ctrlStop_actionsRef)) {return}

					_ctrlStopAct_deleteRef.disabled = stops.length <= 2
					_ctrlStopAct_moveTopRef.disabled = _selectedStopIndex <= 0
					_ctrlStopAct_moveBottomRef.disabled = _selectedStopIndex >= stops.length - 1
					repositionPopoverRef(_ctrlStop_actionsRef)
					for (const ref of _ctrlStop_actionRefs()) {
						const isEqual = id === ref.id
						updateButtonRef(ref, {ButtonFocused: isEqual})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break }
		})

		_gradientBodyRef.addEventListener('click', (ev) => {
			const buttonRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_gradientBodyRef, buttonRef)) {return}

			const command = buttonRef.dataset.command as Commands
			if (!command || !isValidEnumValue(command, Commands)) {return}

			const getButtonId = () => {
				let id = buttonRef.id
				if (!id) {
					buttonRef.id = (id = createElementId())
				}

				return id
			}

			const getGradientItem = () => {
				const liRef = buttonRef.closest('li')
				if (!liRef) {
					return undefined
				}

				const gradientLIRefs = _gradientsRef.children
				let i = 0
				for (; i < gradientLIRefs.length; i++) {
					if (gradientLIRefs[i] === liRef) {
						break
					}
				}

				_selectedGradientIndex = i
				const gradient = GradientStore.value.gradients[i]
				return gradient
			}

			switch (command) {
			case Commands.grad_edit: {
				const id = getButtonId()
				const gradientItem = getGradientItem()
				if (!gradientItem) {
					return ev.preventDefault()
				}

				GradientStore.update(v => ({...v, selected: gradientItem}))
				updatePopoverRef(_controlPopoverRef, {PopoverAnchorBy: id})

				// wait for open
				setTimeout(() => {
					if (!isPopoverRefOpen(_controlPopoverRef)) {return}

					_updateGradientControlView()
					repositionPopoverRef(_controlPopoverRef)
					for (const ref of _editButtonRefs()) {
						const isEqual = id === ref.id
						updateButtonRef(ref, {ButtonFocused: isEqual})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break
			case Commands.grad_openActions: {
				const id = getButtonId()
				const gradientItem = getGradientItem()
				if (!gradientItem) {
					return ev.preventDefault()
				}

				GradientStore.update(v => ({...v, selected: gradientItem}))
				updateMenuRef(_actionsMenuRef, {PopoverAnchorBy: id})

				// wait for open
				setTimeout(() => {
					if (!isPopoverRefOpen(_actionsMenuRef)) {return}

					const value = GradientStore.value
					const gradients = value.gradients
					const gradientsLength = gradients.length
					const isOnlyOne = gradientsLength <= 1
					_act_moveTopRef.disabled = _selectedGradientIndex === 0
					_act_moveBottomRef.disabled = _selectedGradientIndex === gradientsLength - 1
					_act_deleteRef.disabled = isOnlyOne
					_act_moveRef.disabled = isOnlyOne
					repositionPopoverRef(_actionsMenuRef)
					for (const ref of _actionButtonRefs()) {
						const isEqual = id === ref.id
						updateIconButtonRef(ref, {ButtonFocused: isEqual})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break }
		})

		_actionsMenuRef.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _actionButtonRefs()) {
				updateIconButtonRef(ref, {
					ButtonFocused: false
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_controlPopoverRef.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _editButtonRefs()) {
				updateButtonRef(ref, {
					ButtonFocused: false
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_controlPopoverRef.addEventListener('focusin', (ev) => {
			const target = ev.target
			if (target instanceof HTMLInputElement) {
				target.select()
			}
		})

		_controlPopoverRef.addEventListener('focusout', (ev) => {
			const target = ev.target as HTMLInputElement
			if (target instanceof HTMLInputElement && target.type === 'number'){
				target.valueAsNumber = target.valueAsNumber
			}
		})

		_grad_add.addEventListener('click', () => {
			_addGradient()
		})

		_grad_copy.addEventListener('click', () => {
			const gradientText = []
			for (const gradient of GradientStore.value.gradients) {
				gradientText.push(gradientToCSSText(gradient.value, SettingsStore.value.colorSpace, true))
			}

			navigator.clipboard.writeText(gradientText.join(',\n')).then(() => {
				_toastCopiedRef.showPopover()
			})
		})

		_grad_save.addEventListener('click', () => {
			const grad = {
				id: generateSavedGradientId(),
				gradients: [...GradientStore.value.gradients.map(v =>
					({...v.value, stops: [...v.value.stops.map(v => ({...v}))]})
				)]
			}
			SavedGradients.update(v => {
				v.gradients = [
					grad,
					...v.gradients
				]
				return {...v}
			})

			_toastSavedRef.showPopover()
			saveGradientDB(grad.id, grad.gradients)
		})
	}

	init()
	controlProperties()
	controlStops()
	gradientActions()
}

function _updatePreviewBoxRefView(): void {
	const gradients: string[] = []
	for (const grad of GradientStore.value.gradients) {
		gradients.push(gradientToCSSText(grad.value, ColorSpace.hex, false))
	}

	requestAnimationFrame(() => {
		_previewBoxRef.style.setProperty('background', gradients.join(','))
	})
}

function _subscribeGradientPreviewRefView(v: Readonly<GradientItem>): void {
	requestAnimationFrame(() => {

		// This will update very often when one of gradient changes.
		// User may change gradient every 1~10ms. And these program takes
		// a lot (if many) of iteration just to change element style. (-_-)
		const index = GradientStore.value.gradients.findIndex(d => d.value === v)
		if (index >= 0) {

			// hell yeah, query. At least I make selector faster though...
			$$<HTMLDivElement>(
				`li:nth-child(${index+1})>[data-command="${CSS.escape(Commands.grad_edit)}"]>div`,
				_gradientsRef
			)?.style.setProperty(
				'background',
				gradientToCSSText({...v, angle: 90, type: GradientType.linear}, ColorSpace.hex, false)
			)
		}

		_updatePreviewBoxRefView()
	})
}

function _initSubscriber(): void {
	GradientStore.subscribe((v) => {
		for (const d of v.gradients) {
			d.subscribe(_subscribeGradientPreviewRefView)
		}
		_updateGradientListView()
		_updatePreviewBoxRefView()
	})
}

function _addGradient(index: number = 0): void {
	const gradient = GradientStore.value.selected
	const stops = gradient.value.stops
	const newGradient = new ObservableStore<Readonly<GradientItem>>({
		...gradient.value,
		stops: stops.map(v => {
			const color = '#' + [
				Math.random() * 0xff,
				Math.random() * 0xff,
				Math.random() * 0xff,
				(0.5 * 0xff) + (Math.random() * (0xff - (0.5 * 0xff))),
			].map(v => Math.round(v).toString(16).toUpperCase().padStart(2, '0')).join('')
			return ({...v, color: color as HEXColor})
		})
	})
	GradientStore.update(v => ({...v, gradients: [
		...v.gradients.slice(0, index),
		newGradient,
		...v.gradients.slice(index)
	]}))
}

function _moveGradient(index: number): void {
	const gradient = GradientStore.value.gradients[index]
	if (index === _selectedGradientIndex || !gradient) {return}

	GradientStore.update(v => ({...v, gradients: moveArrayElement(v.gradients, _selectedGradientIndex, index, false)}))
	_updateGradientListView()
}

function _moveColorStop(index: number): void {
	const gradient = GradientStore.value.selected
	const stops = gradient.value.stops
	const stop = stops[_selectedStopIndex]
	if (index === _selectedStopIndex || !stop) {return}

	gradient.update(v => ({...v, stops: moveArrayElement(stops, _selectedStopIndex, index, false)}))
	_updateGradientControlView()
}

function _addColorStop(index: number = 0): void {
	const gradient = GradientStore.value.selected
	const stops = [...gradient.value.stops].sort((a, b) => a.size - b.size)
	let color: HEXColor = '#000000', size: number = 0, diff: number = 0

	for (let i = -1; i < stops.length; i++) {
		let $diff = 0
		if (i === -1) $diff = Math.round(stops[i + 1].size / 2)
		else if (i === stops.length - 1) $diff = Math.round((100 - stops[i].size) / 2)
		else $diff = Math.round((stops[i + 1].size - stops[i].size) / 2)

		// find the biggest one
		if ($diff > diff) {
			diff = $diff
			size = (i === -1? 0 : stops[i].size) + diff
			if (i === -1) color = stops[0].color
			else if (i === stops.length - 1) color = stops[i].color
			else {
				const color1 = Number.parseInt(stops[i+1].color.substring(1, 7), 16)
				const color2 = Number.parseInt(stops[i].color.substring(1, 7), 16)
				color = '#' + (
					Math.min(color1, color2)
					+ Math.abs(Math.round((color1 - color2) / 2))
				).toString(16).toUpperCase()
			}

			if (/ff$/i.test(color) && color.length > 9) {
				color = color.substring(0, 7) as HEXColor
			}
		}
	}

	const stop: ColorStopGradient = {
		size: size,
		color: color
	}

	gradient.update(v => ({...v, stops: [
		...v.stops.slice(0, index),
		stop,
		...v.stops.slice(index)
	]}))
	_updateGradientControlView() // add new elements
}

export default () => {
	_initEvents()
	_initSubscriber()
}