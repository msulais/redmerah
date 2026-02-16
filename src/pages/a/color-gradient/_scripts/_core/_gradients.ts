import { CMenu } from "@/components/Menu"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CSSClasses, CSSGroup } from "../../_styles/_css"
import { isTargetValidElement } from "@/utils/element"
import { isValidEnumValue } from "@/utils/object"
import { Commands } from "../_shared/_commands"
import { createElementId } from "@/utils/ids"
import { CPopover } from "@/components/Popover"
import { CButton } from "@/components/Button"
import type { HEXColor } from "@/types/color"
import { ColorSpace, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, type RectangularColorSpace } from "../_shared/_enums"
import { ObservableStore } from "@/utils/store"
import { CComboBox } from "@/components/ComboBox"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { DEFAULT_STOP_COLOR_1, DEFAULT_STOP_COLOR_2 } from "../_shared/_constant"
import { CSlider } from "@/components/Slider"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { CTextField } from "@/components/TextField"
import { CIcon } from "@/components/Icon"
import { IconCodes } from "@/enums/icons"
import { gradientToCSSText } from "./_gradient-utils"
import { SettingsStore } from "./_settings"
import { CColorPicker } from "@/components/ColorPicker"
import { generateSavedGradientId, SavedGradients } from "./_saved-gradients"
import { CToast } from "@/components/Toast"
import { saveGradientDB } from "./_database"
import { moveArrayElement } from "@/utils/array"

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
const _animationOption = {duration: 250, easing: AnimationEasing.Spring}
const _defaultGradient = new ObservableStore<Readonly<GradientItem>>({
	angle: 0,
	colorMethod: PolarColorSpace.Auto,
	stops: [
		{size: 0, color: DEFAULT_STOP_COLOR_1},
		{size: 100, color: DEFAULT_STOP_COLOR_2}
	],
	hueMethod: HueInterpolationMethod.Auto,
	positionX: 0,
	positionY: 0,
	repeat: false,
	shape: RadialGradientShape.Circle,
	height: 0,
	size: 0,
	width: 0,
	type: GradientType.Linear
})
export const GradientStore = new ObservableStore<GradientStoreType>({
	selected: _defaultGradient,
	gradients: [_defaultGradient]
})

// ctrlStop = control stop
const _ref_ctrlStop_actions = $(ElementIds.bdGradStop_actions) as CMenu.CElement
const _ref_ctrlStop_colorPicker = $(ElementIds.bdGradStop_colorPicker) as CColorPicker.CElement
const _ref_ctrlStop_add = $(ElementIds.bdGradStop_add) as CButton.CElement
const _ref_ctrlStop_sort = $(ElementIds.bdGradStop_sort) as CButton.CIcon.CElement

// ctrlStopAct = control stop action
const _ref_ctrlStopAct_delete = $(ElementIds.bdGradStopAct_delete) as CButton.CElement
const _ref_ctrlStopAct_newTop = $(ElementIds.bdGradStopAct_newTop) as CButton.CElement
const _ref_ctrlStopAct_newBottom = $(ElementIds.bdGradStopAct_newBottom) as CButton.CElement
const _ref_ctrlStopAct_moveTop = $(ElementIds.bdGradStopAct_moveTop) as CButton.CElement
const _ref_ctrlStopAct_moveBottom = $(ElementIds.bdGradStopAct_moveBottom) as CButton.CElement

// ctrlProp = control property
const _ref_ctrlProp_colorStops = $(ElementIds.bdGradCtrl_colorStops) as HTMLUListElement
const _ref_ctrlProp_type = $(ElementIds.bdGradCtrl_type) as CComboBox.CElement
const _ref_ctrlProp_colorSpace = $(ElementIds.bdGradCtrl_colorSpace) as CComboBox.CElement
const _ref_ctrlProp_hueInterpolation = $(ElementIds.bdGradCtrl_hueInterpolation) as CComboBox.CElement
const _ref_ctrlProp_radialShape = $(ElementIds.bdGradCtrl_radialShape) as CComboBox.CElement
const _ref_ctrlProp_positionX = $(ElementIds.bdGradCtrl_positionX) as HTMLInputElement
const _ref_ctrlProp_positionY = $(ElementIds.bdGradCtrl_positionY) as HTMLInputElement
const _ref_ctrlProp_width = $(ElementIds.bdGradCtrl_width) as HTMLInputElement
const _ref_ctrlProp_height = $(ElementIds.bdGradCtrl_height) as HTMLInputElement
const _ref_ctrlProp_size = $(ElementIds.bdGradCtrl_size) as HTMLInputElement
const _ref_ctrlProp_angle = $(ElementIds.bdGradCtrl_angle) as HTMLInputElement
const _ref_ctrlProp_repeat = $(ElementIds.bdGradCtrl_repeat) as HTMLInputElement

// ctrlPropGrp = control property group
const _ref_ctrlPropGrp_positionXY = $(ElementIds.bdGradCtrl_positionXY) as HTMLDivElement
const _ref_ctrlPropGrp_widthHeight = $(ElementIds.bdGradCtrl_widthHeight) as HTMLDivElement

// ctrlPropLbl = control property label
const _ref_ctrlPropLbl_hueInterpolation = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_hueInterpolation)}]`
)!
const _ref_ctrlPropLbl_radialShape = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_radialShape)}]`
)!
const _ref_ctrlPropLbl_size = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_size)}]`
)!
const _ref_ctrlPropLbl_angle = $$<HTMLLabelElement>(
	`label[for=${CSS.escape(ElementIds.bdGradCtrl_angle)}]`
)!

// act = action
const _ref_act_copy = $(ElementIds.bdGradAct_copy) as CMenu.CItem.CElement
const _ref_act_delete = $(ElementIds.bdGradAct_delete) as CMenu.CItem.CElement
const _ref_act_move = $(ElementIds.bdGradAct_move) as CMenu.CSubItem.CElement
const _ref_act_moveTop = $(ElementIds.bdGradAct_moveTop) as CMenu.CItem.CElement
const _ref_act_moveBottom = $(ElementIds.bdGradAct_moveBottom) as CMenu.CItem.CElement
const _ref_act_newTop = $(ElementIds.bdGradAct_newTop) as CMenu.CItem.CElement
const _ref_act_newBottom = $(ElementIds.bdGradAct_newBottom) as CMenu.CItem.CElement

// grad = gradient
const _ref_grad_add = $(ElementIds.bdGrad_add) as CButton.CElement
const _ref_grad_copy = $(ElementIds.bdGrad_copy) as CButton.CIcon.CElement
const _ref_grad_save = $(ElementIds.bdGrad_save) as CButton.CIcon.CElement

const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_toastSaved = $(ElementIds.toa_saved) as CToast.CElement
const _ref_previewBox = $(ElementIds.bd_preview) as HTMLDivElement
const _ref_gradients = $(ElementIds.bd_gradients) as HTMLUListElement
const _ref_actionsMenu = $(ElementIds.bdGrad_actionsMenu) as CMenu.CElement
const _ref_controlPopover = $(ElementIds.bdGrad_controlPopover) as CMenu.CElement
const _ref_gradientBody = $$<HTMLDivElement>(`.${CSSClasses.bodyGradients}`)!
const _refs_actionButton = () => $$$<CButton.CElement>(
	`.${CSSClasses.bodyGradients} [data-command="${Commands.GradientOpenActions}"]`
)
const _refs_editButton = () => $$$<CButton.CElement>(
	`.${CSSClasses.bodyGradients} [data-command="${Commands.GradientEdit}"]`
)
const _refs_ctrlStop_pickColor = () => $$$<CTextField.CButton.CElement>(
	`[data-command=${CSS.escape(Commands.GradientStopPickColor)}]`
)
const _refs_ctrlStop_action = () => $$$<CTextField.CButton.CElement>(
	`[data-command=${CSS.escape(Commands.GradientStopActions)}]`
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
	const refs_sizeInput: (HTMLInputElement | null | undefined)[] = []
	const refs_colorInput: (HTMLInputElement | null | undefined)[] = []
	const refs_sizeSlider: (HTMLInputElement | null | undefined)[] = []
	const refs_colorButton: (CButton.CElement | null | undefined)[] = []

	function updateProperties(): void {
		_ref_ctrlProp_type            .value = gradient.type
		_ref_ctrlProp_colorSpace      .value = gradient.colorMethod
		_ref_ctrlProp_hueInterpolation.value = gradient.hueMethod
		_ref_ctrlProp_radialShape     .value = gradient.shape
		_ref_ctrlProp_positionX       .value = gradient.positionX + ''
		_ref_ctrlProp_positionY       .value = gradient.positionY + ''
		_ref_ctrlProp_width           .value = gradient.width + ''
		_ref_ctrlProp_height          .value = gradient.height + ''
		_ref_ctrlProp_size            .value = gradient.size + ''
		_ref_ctrlProp_angle           .value = gradient.angle + ''
		_ref_ctrlProp_repeat          .checked = gradient.repeat

		const hidden = new Set<HTMLElement>()
		if (![
			PolarColorSpace.Hsl, PolarColorSpace.Hwb,
			PolarColorSpace.Lch, PolarColorSpace.Oklch
		].includes(gradient.colorMethod as PolarColorSpace)) {
			hidden.add(_ref_ctrlProp_hueInterpolation)
			hidden.add(_ref_ctrlPropLbl_hueInterpolation)
		}

		if (type !== GradientType.Radial) {
			hidden.add(_ref_ctrlProp_radialShape)
			hidden.add(_ref_ctrlPropLbl_radialShape)
			hidden.add(_ref_ctrlPropGrp_widthHeight)
			hidden.add(_ref_ctrlProp_size.parentElement!)
			hidden.add(_ref_ctrlPropLbl_size)
		}
		else {
			if (shape !== RadialGradientShape.Circle) {
				hidden.add(_ref_ctrlProp_size.parentElement!)
				hidden.add(_ref_ctrlPropLbl_size)
			}

			if (shape !== RadialGradientShape.Ellipse) {
				hidden.add(_ref_ctrlPropGrp_widthHeight)
			}
		}

		if (![GradientType.Conic, GradientType.Linear].includes(type)) {
			hidden.add(_ref_ctrlProp_angle.parentElement!)
			hidden.add(_ref_ctrlPropLbl_angle)
		}

		if (![GradientType.Conic, GradientType.Radial].includes(type)) {
			hidden.add(_ref_ctrlPropGrp_positionXY)
		}

		const allowAnimation = isAnimationAllowed()
		for (const ref of [
			_ref_ctrlPropGrp_positionXY,
			_ref_ctrlPropGrp_widthHeight,
			_ref_ctrlPropLbl_radialShape,
			_ref_ctrlPropLbl_hueInterpolation,
			_ref_ctrlPropLbl_size,
			_ref_ctrlPropLbl_angle,
			_ref_ctrlProp_hueInterpolation,
			_ref_ctrlProp_radialShape,
			_ref_ctrlProp_size.parentElement!,
			_ref_ctrlProp_angle.parentElement!,
		]) {
			if (hidden.has(ref)) {continue}

			const isGroup = (
				ref === _ref_ctrlPropGrp_widthHeight
				|| ref === _ref_ctrlPropGrp_positionXY
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
		const ref_target = ev.currentTarget as HTMLInputElement
		const datasetIndex = ref_target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const value = Math_clamp(safeNumber(Number.parseFloat(ref_target.value)), 0, 100)
		const slider = refs_sizeSlider[index as unknown as number]
		const stopGradient = colorStopList[index as unknown as number]
		if (slider) {
			CSlider.setValue(slider, value)
		}
		if (stopGradient) {
			stopGradient.size = value
			selectedGradient.notify()
		}
	}

	function stopSizeTextOnBlur(ev: Event): void {
		const ref_target = ev.currentTarget as HTMLInputElement
		const value = Math_clamp(safeNumber(Number.parseFloat(ref_target.value)), 0, 100)
		ref_target.value = value + '%'
	}

	function stopSizeSliderOnInput(ev: Event): void {
		const ref_target = ev.currentTarget as HTMLInputElement
		const datasetIndex = ref_target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const value = Math_clamp(safeNumber(ref_target.valueAsNumber), 0, 100)
		const input = refs_sizeInput[index as unknown as number]
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
		const ref_target = ev.currentTarget as HTMLInputElement
		const datasetIndex = ref_target.dataset.index
		if (!datasetIndex) {return}

		const colorStopList = GradientStore.value.selected.value.stops
		const index = Number.parseInt(datasetIndex)
		const stopGradient = colorStopList[index]
		const ref_btn = refs_colorButton[index]
		const value = ('#' + ref_target
			.value
			.replace(/[^0-9A-Fa-f]/g, '')
			.padEnd(6, '0')
			.toUpperCase()
			.substring(0, 8)
		)
		if (ref_btn) {
			requestAnimationFrame(() =>
				ref_btn.style.setProperty('color', value)
			)
		}
		if (stopGradient) {
			stopGradient.color = value as HEXColor
			selectedGradient.notify()
		}
	}

	function stopColorOnBlur(ev: Event): void {
		const ref_target = ev.currentTarget as HTMLInputElement
		ref_target.value = ('#' + ref_target
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
			ref_sizeInput?: HTMLInputElement | null,
			ref_sizeSlider?: CSlider.CElement | null,
			ref_colorInput?: HTMLInputElement | null,
			ref_colorButton?: CTextField.CButton.CElement | null
		) => {
			const colorStop = colorStopList[i]
			if (colorStop) {
				if (ref_sizeInput) {
					ref_sizeInput.value = colorStop.size + '%'
				}

				if (ref_sizeSlider) {
					CSlider.setValue(ref_sizeSlider, colorStop.size)
				}

				if (ref_colorInput) {
					ref_colorInput.value = colorStop.color
				}

				if (ref_colorButton) {
					ref_colorButton.style.setProperty('color', colorStop.color)
				}
			}

			ref_sizeInput?.removeEventListener('blur', stopSizeTextOnBlur)
			ref_sizeInput?.addEventListener('blur', stopSizeTextOnBlur)

			ref_sizeInput?.setAttribute('data-index', i + '')
			ref_sizeInput?.removeEventListener('input', stopSizeTextOnInput)
			ref_sizeInput?.addEventListener('input', stopSizeTextOnInput)
			if (!refs_sizeInput[i]) {
				refs_sizeInput[i] = ref_sizeInput
			}

			ref_colorInput?.setAttribute('data-index', i + '')
			ref_colorInput?.removeEventListener('input', stopColorOnInput)
			ref_colorInput?.addEventListener('input', stopColorOnInput)
			ref_colorInput?.removeEventListener('blur', stopColorOnBlur)
			ref_colorInput?.addEventListener('blur', stopColorOnBlur)
			if (!refs_colorInput[i]) {
				refs_colorInput[i] = ref_colorInput
			}

			ref_sizeSlider?.setAttribute('data-index', i + '')
			ref_sizeSlider?.removeEventListener('input', stopSizeSliderOnInput)
			ref_sizeSlider?.addEventListener('input', stopSizeSliderOnInput)
			if (!refs_sizeSlider[i]) {
				refs_sizeSlider[i] = ref_sizeSlider
			}

			if (!refs_colorButton[i]) {
				refs_colorButton[i] = ref_colorButton
			}
		}
		const refs_gradientStops = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.bdGradCtrl_colorStops)}>li`)

		for (let i = 0; i < refs_gradientStops.length; i++) {
			const ref = refs_gradientStops.item(i)
			if (i > colorStopList.length-1) {
				ref.remove()
				continue
			}

			const ref_sizeInput = $$<HTMLInputElement>('.' + CSSGroup.stopSizeInput, ref)
			const ref_sizeSlider = $$<CSlider.CElement>(`.${CSlider.Classes.Slider}`, ref)
			const ref_colorInput = $$<HTMLInputElement>('.' + CSSGroup.stopColorInput, ref)
			const ref_colorButton = $$<CTextField.CButton.CElement>(`[data-command="${Commands.GradientStopPickColor}"]`, ref)
			updateControlEvents(i, ref_sizeInput, ref_sizeSlider, ref_colorInput, ref_colorButton)
		}

		for (let i = 0; i < colorStopList.length - refs_gradientStops.length; i++) {
			const index = refs_gradientStops.length + i
			const ref_li = document.createElement('li')
			const ref_div = document.createElement('div')
			const ref_sizeTextfield = CTextField.create({TextField: {refs: {input(ref) {
				ref.classList.add(CSSGroup.stopSizeInput)
				updateControlEvents(index, ref, null, null)
			}}}})
			const ref_colorTextfield = CTextField.create({TextField: {
				refs: {input(ref) {
					ref.classList.add(CSSGroup.stopColorInput)
					updateControlEvents(index, null, null, ref)
				}},
				trailing: [
					CTextField.CButton.create({Button: {
						refs: {button(ref) {
							ref.setAttribute('data-command', Commands.GradientStopPickColor)
							ref.setAttribute('data-tooltip', 'Pick color')
							ref.setAttribute('popovertarget', ElementIds.bdGradStop_colorPicker)
							ref.popoverTargetAction = 'show'
							updateControlEvents(index, null, null, null, ref)
						}},
						children: [CIcon.create({Icon: {
							code: IconCodes.Circle,
							filled: true
						}})]
					}}),
					CTextField.CButton.create({Button: {
						children: [CIcon.create({Icon: {code: IconCodes.MoreHorizontal}})],
						refs: {button(ref) {
							ref.setAttribute('data-command', Commands.GradientStopActions)
							ref.setAttribute('popovertarget', ElementIds.bdGradStop_actions)
							ref.popoverTargetAction = 'show'
							ref.setAttribute('data-tooltip', 'More')
						}}
					}}),
				]
			}})
			const ref_slider = CSlider.create({Slider: {
				min: 0,
				max: 100
			}})
			CSlider.register(ref_slider)
			updateControlEvents(index, null, ref_slider, null)

			ref_div.append(ref_sizeTextfield, ref_colorTextfield)
			ref_li.append(ref_div, ref_slider)
			_ref_ctrlProp_colorStops.append(ref_li)
		}
	}

	updateProperties()
	if (!updateStops) {return}

	updateColorStops()
}

function _updateGradientListView(): void {
	const gradients = GradientStore.value.gradients
	const refs_gradients = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.bd_gradients)}>li`)
	for (let i = 0; i < refs_gradients.length; i++) {
		const ref = refs_gradients[i]
		if (i > gradients.length-1) {
			ref.remove()
			continue
		}

		const grad = gradients[i]
		if (!grad) {continue}

		const ref_preview = $$<HTMLDivElement>(
			`[data-command="${CSS.escape(Commands.GradientEdit)}"]>div`, ref
		)
		ref_preview?.style.setProperty('background', gradientToCSSText(
			{...grad.value, angle: 90, type: GradientType.Linear},
			ColorSpace.HEX,
			false
		))
	}

	for (let i = 0; i < gradients.length - refs_gradients.length; i++) {
		const grad = gradients[refs_gradients.length + i]
		if (!grad) {continue}

		const ref_li = document.createElement('li')
		const ref_button = CButton.create({Button: { children: [(() => {
			const div = document.createElement('div')
			div.style.setProperty('background', gradientToCSSText(
				{...grad.value, angle: 90, type: GradientType.Linear},
				ColorSpace.HEX,
				false
			))
			return div
		})()]}})
		ref_button.setAttribute('data-command', Commands.GradientEdit)
		ref_button.setAttribute('popovertarget', ElementIds.bdGrad_controlPopover)
		ref_button.setAttribute('popovertargetaction', 'show')

		const ref_iconBtn = CButton.CIcon.create({
			IconButton: {Icon: {code: IconCodes.MoreHorizontal}},
		})
		ref_iconBtn.setAttribute('data-command', Commands.GradientOpenActions)
		ref_iconBtn.setAttribute('popovertarget', ElementIds.bdGrad_actionsMenu)
		ref_iconBtn.setAttribute('popovertargetaction', 'show')
		ref_iconBtn.setAttribute('data-tooltip', 'Actions')
		ref_iconBtn.setAttribute('aria-label', 'Actions')
		ref_li.append(ref_button, ref_iconBtn)
		_ref_gradients.append(ref_li)
	}
}

function _sortStopColors(): void {
	const gradient = GradientStore.value.selected
	gradient.value.stops.sort((a, b) => a.size - b.size)
	gradient.notify()
	_updateGradientControlView()
}

function _initEvents(): void {
	const updateGradient = (updater: (state: GradientItem) => void) => {
		GradientStore.value.selected.update(updater)
	}
	let ref_stopColorInput: HTMLInputElement | null | undefined = null
	let ref_stopColorPickerButton: CButton.CElement | null | undefined = null

	function controlProperties(): void {
		_ref_ctrlProp_colorSpace.addEventListener('change', () => {
			const value = _ref_ctrlProp_colorSpace.value as PolarColorSpace
			if (!isValidEnumValue(value, PolarColorSpace)) {return}

			updateGradient(v => v.colorMethod = value)
			_updateGradientControlView(false)
		})

		_ref_ctrlProp_type.addEventListener('change', () => {
			const value = _ref_ctrlProp_type.value as GradientType
			if (!isValidEnumValue(value, GradientType)) {return}

			updateGradient(v => {
				v.type = value
				switch (value) {
				case GradientType.Linear:
					v.angle = 0
					break
				case GradientType.Radial:
					v.positionX = 50
					v.positionY = 50
					v.shape = RadialGradientShape.Ellipse
					v.height = 100
					v.size = 350
					v.width = 100
					break
				case GradientType.Conic:
					v.angle = 0
					v.positionX = 50
					v.positionY = 50
				}
			})
			_updateGradientControlView(false)
		})

		_ref_ctrlProp_radialShape.addEventListener('change', () => {
			const value = _ref_ctrlProp_radialShape.value as RadialGradientShape
			if (!isValidEnumValue(value, RadialGradientShape)) {return}

			updateGradient(v => v.shape = value)
			_updateGradientControlView(false)
		})

		_ref_ctrlProp_hueInterpolation.addEventListener('change', () => {
			const value = _ref_ctrlProp_hueInterpolation.value as HueInterpolationMethod
			if (!isValidEnumValue(value, HueInterpolationMethod)) {return}

			updateGradient(v => v.hueMethod = value)
			_updateGradientControlView(false)
		})

		_ref_ctrlProp_repeat.addEventListener('change', () => {
			updateGradient(v => v.repeat = _ref_ctrlProp_repeat.checked)
		})

		_ref_ctrlProp_positionX.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_positionX.value))
			updateGradient(v => v.positionX = value)
		})

		_ref_ctrlProp_positionY.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_positionY.value))
			updateGradient(v => v.positionY = value)
		})

		_ref_ctrlProp_width.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_width.value))
			updateGradient(v => v.width = value)
		})

		_ref_ctrlProp_height.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_height.value))
			updateGradient(v => v.height = value)
		})

		_ref_ctrlProp_size.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_size.value))
			updateGradient(v => v.size = value)
		})

		_ref_ctrlProp_angle.addEventListener('input', () => {
			const value = safeNumber(Number.parseFloat(_ref_ctrlProp_angle.value))
			updateGradient(v => v.angle = value)
		})
	}

	function controlStops(): void {
		_ref_ctrlStop_colorPicker.addEventListener(CColorPicker.Events.Input, () => {
			if (_selectedStopIndex <= -1) {return}

			const stop = GradientStore.value.selected.value.stops[_selectedStopIndex]
			if (!stop) {return}

			const color = CColorPicker.getValue(_ref_ctrlStop_colorPicker).toUpperCase() as HEXColor
			stop.color = color
			GradientStore.value.selected.notify()
			requestAnimationFrame(() => {
				ref_stopColorPickerButton?.style.setProperty('color', color)
				if (ref_stopColorInput) {
					ref_stopColorInput.value = color
				}
			})
		})

		_ref_ctrlStop_actions.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _refs_ctrlStop_action()) {
				CButton.CIcon.update(ref, {
					Button: {focused: false}
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ref_ctrlStop_colorPicker.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _refs_ctrlStop_pickColor()) {
				CButton.CIcon.update(ref, {
					Button: {focused: false}
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ref_ctrlStop_add.addEventListener('click', () => {
			_addColorStop()
		})

		_ref_ctrlStop_sort.addEventListener('click', () => {
			_sortStopColors()
		})

		_ref_ctrlStopAct_delete.addEventListener('click', () => {
			_ref_ctrlStop_actions.hidePopover()
			const gradient = GradientStore.value.selected
			const stops = gradient.value.stops
			if (!stops[_selectedStopIndex]) {return}

			stops.splice(_selectedStopIndex, 1)
			gradient.notify()
			_updateGradientControlView()
		})

		_ref_ctrlStopAct_moveBottom.addEventListener('click', () => {
			_ref_ctrlStop_actions.hidePopover()
			_moveColorStop(_selectedStopIndex + 1)
		})

		_ref_ctrlStopAct_moveTop.addEventListener('click', () => {
			_ref_ctrlStop_actions.hidePopover()
			_moveColorStop(Math.max(0, _selectedStopIndex - 1))
		})

		_ref_ctrlStopAct_newTop.addEventListener('click', () => {
			_ref_ctrlStop_actions.hidePopover()
			_addColorStop(_selectedStopIndex)
		})

		_ref_ctrlStopAct_newBottom.addEventListener('click', () => {
			_ref_ctrlStop_actions.hidePopover()
			_addColorStop(_selectedStopIndex + 1)
		})
	}

	function gradientActions(): void {
		_ref_act_copy.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			const text = gradientToCSSText(
				GradientStore.value.selected.value, SettingsStore.value.colorSpace, true
			)
			navigator.clipboard.writeText(text).then(() => {
				_ref_toastCopied.showPopover()
			})
		})

		_ref_act_delete.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			const gradients = GradientStore.value.gradients
			if (!gradients[_selectedGradientIndex]) {return}

			gradients.splice(_selectedGradientIndex, 1)
			GradientStore.notify()
			_updateGradientListView()
		})

		_ref_act_moveTop.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			_moveGradient(Math.max(0, _selectedGradientIndex - 1))
		})

		_ref_act_moveBottom.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			_moveGradient(_selectedGradientIndex + 1)
		})

		_ref_act_newTop.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			_addGradient(Math.max(0, _selectedGradientIndex - 1))
		})

		_ref_act_newBottom.addEventListener('click', () => {
			_ref_actionsMenu.hidePopover()
			_addGradient(_selectedGradientIndex + 1)
		})
	}

	function init(): void {
		_ref_controlPopover.addEventListener('click', (ev) => {
			const ref_btn = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_gradientBody, ref_btn)) {return}

			const command = ref_btn.dataset.command as Commands
			if (!command || !isValidEnumValue(command, Commands)) {return}

			const stops = GradientStore.value.selected.value.stops
			const getButtonId = () => {
				let id = ref_btn.id
				if (!id) {
					ref_btn.id = (id = createElementId())
				}
				return id
			}

			const hasStopIndex = () => {
				const liRef = ref_btn.closest('li')
				if (!liRef) {
					return false
				}

				const stopsLIRefs = _ref_ctrlProp_colorStops.children
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
			case Commands.GradientStopPickColor: {
				if (!hasStopIndex()) {
					return ev.preventDefault()
				}

				const id = getButtonId()
				CColorPicker.update(_ref_ctrlStop_colorPicker, {
					ColorPicker: {value: stops[_selectedStopIndex].color},
					Popover: {anchorBy: id}
				})

				// wait for open
				setTimeout(() => {
					if (!CPopover.isOpen(_ref_ctrlStop_colorPicker)) {return}

					const liRef = ref_btn.closest('li')
					ref_stopColorInput = liRef?.querySelector<HTMLInputElement>(
						'.' + CSSGroup.stopColorInput
					)
					ref_stopColorPickerButton = liRef?.querySelector<CButton.CElement>(
						`[data-command=${CSS.escape(Commands.GradientStopPickColor)}]`
					)
					CPopover.reposition(_ref_ctrlStop_colorPicker)
					for (const ref of _refs_ctrlStop_pickColor()) {
						const isEqual = id === ref.id
						CButton.update(ref, {Button: {focused: isEqual}})
						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break
			case Commands.GradientStopActions: {
				if (!hasStopIndex()) {
					return ev.preventDefault()
				}

				const id = getButtonId()
				CMenu.update(_ref_ctrlStop_actions, {
					Popover: {anchorBy: id}
				})

				// wait for open
				setTimeout(() => {
					if (!CPopover.isOpen(_ref_ctrlStop_actions)) {return}

					_ref_ctrlStopAct_delete.disabled = stops.length <= 2
					_ref_ctrlStopAct_moveTop.disabled = _selectedStopIndex <= 0
					_ref_ctrlStopAct_moveBottom.disabled = _selectedStopIndex >= stops.length - 1
					CPopover.reposition(_ref_ctrlStop_actions)
					for (const ref of _refs_ctrlStop_action()) {
						const isEqual = id === ref.id
						CButton.update(ref, {Button: {focused: isEqual}})
						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break }
		})

		_ref_gradientBody.addEventListener('click', (ev) => {
			const ref_btn = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_gradientBody, ref_btn)) {return}

			const command = ref_btn.dataset.command as Commands
			if (!command || !isValidEnumValue(command, Commands)) {return}

			const getButtonId = () => {
				let id = ref_btn.id
				if (!id) {
					ref_btn.id = (id = createElementId())
				}

				return id
			}

			const getGradientItem = () => {
				const liRef = ref_btn.closest('li')
				if (!liRef) {
					return undefined
				}

				const gradientLIRefs = _ref_gradients.children
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
			case Commands.GradientEdit: {
				const id = getButtonId()
				const gradientItem = getGradientItem()
				if (!gradientItem) {
					return ev.preventDefault()
				}

				GradientStore.update(v => v.selected = gradientItem)
				CPopover.update(_ref_controlPopover, {Popover: {anchorBy: id}})

				// wait for open
				setTimeout(() => {
					if (!CPopover.isOpen(_ref_controlPopover)) {return}

					_updateGradientControlView()
					CPopover.reposition(_ref_controlPopover)
					for (const ref of _refs_editButton()) {
						const isEqual = id === ref.id
						CButton.update(ref, {Button: {focused: isEqual}})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break
			case Commands.GradientOpenActions: {
				const id = getButtonId()
				const gradientItem = getGradientItem()
				if (!gradientItem) {
					return ev.preventDefault()
				}

				GradientStore.update(v => v.selected = gradientItem)
				CMenu.update(_ref_actionsMenu, {Popover: {anchorBy: id}})

				// wait for open
				setTimeout(() => {
					if (!CPopover.isOpen(_ref_actionsMenu)) {return}

					const value = GradientStore.value
					const gradients = value.gradients
					const gradientsLength = gradients.length
					const isOnlyOne = gradientsLength <= 1
					_ref_act_moveTop.disabled = _selectedGradientIndex === 0
					_ref_act_moveBottom.disabled = _selectedGradientIndex === gradientsLength - 1
					_ref_act_delete.disabled = isOnlyOne
					_ref_act_move.disabled = isOnlyOne
					CPopover.reposition(_ref_actionsMenu)
					for (const ref of _refs_actionButton()) {
						const isEqual = id === ref.id
						CButton.CIcon.update(ref, {Button: {focused: isEqual}})

						ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
					}
				})
			} break }
		})

		_ref_actionsMenu.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _refs_actionButton()) {
				CButton.CIcon.update(ref, {
					Button: {focused: false}
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ref_controlPopover.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {return}

			for (const ref of _refs_editButton()) {
				CButton.update(ref, {
					Button: {focused: false}
				})
				ref.setAttribute('popovertargetaction', 'show')
			}
		})

		_ref_controlPopover.addEventListener('focusin', (ev) => {
			const target = ev.target
			if (target instanceof HTMLInputElement) {
				target.select()
			}
		})

		_ref_controlPopover.addEventListener('focusout', (ev) => {
			const target = ev.target as HTMLInputElement
			if (target instanceof HTMLInputElement && target.type === 'number'){
				target.valueAsNumber = target.valueAsNumber
			}
		})

		_ref_grad_add.addEventListener('click', () => {
			_addGradient()
		})

		_ref_grad_copy.addEventListener('click', () => {
			const gradientText = []
			for (const gradient of GradientStore.value.gradients) {
				gradientText.push(gradientToCSSText(gradient.value, SettingsStore.value.colorSpace, true))
			}

			navigator.clipboard.writeText(gradientText.join(',\n')).then(() => {
				_ref_toastCopied.showPopover()
			})
		})

		_ref_grad_save.addEventListener('click', () => {
			const grad = {
				id: generateSavedGradientId(),
				gradients: [...GradientStore.value.gradients.map(v =>
					({...v.value, stops: [...v.value.stops.map(v => ({...v}))]})
				)]
			}
			SavedGradients.update(v => v.gradients = [grad, ...v.gradients])
			_ref_toastSaved.showPopover()
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
		gradients.push(gradientToCSSText(grad.value, ColorSpace.HEX, false))
	}

	requestAnimationFrame(() => {
		_ref_previewBox.style.setProperty('background', gradients.join(','))
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
				`li:nth-child(${index+1})>[data-command="${CSS.escape(Commands.GradientEdit)}"]>div`,
				_ref_gradients
			)?.style.setProperty(
				'background',
				gradientToCSSText({...v, angle: 90, type: GradientType.Linear}, ColorSpace.HEX, false)
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
	GradientStore.update(v => v.gradients = [
		...v.gradients.slice(0, index),
		newGradient,
		...v.gradients.slice(index)
	])
}

function _moveGradient(index: number): void {
	const gradient = GradientStore.value.gradients[index]
	if (index === _selectedGradientIndex || !gradient) {return}

	GradientStore.update(v =>
		v.gradients = moveArrayElement(v.gradients, _selectedGradientIndex, index, false)
	)
	_updateGradientListView()
}

function _moveColorStop(index: number): void {
	const gradient = GradientStore.value.selected
	const stops = gradient.value.stops
	const stop = stops[_selectedStopIndex]
	if (index === _selectedStopIndex || !stop) {return}

	gradient.update(v => v.stops = moveArrayElement(stops, _selectedStopIndex, index, false))
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
	gradient.update(v => v.stops = [
		...v.stops.slice(0, index),
		stop,
		...v.stops.slice(index)
	])
	_updateGradientControlView() // add new elements
}

export default () => {
	_initEvents()
	_initSubscriber()
}