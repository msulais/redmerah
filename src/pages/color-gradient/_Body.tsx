import { createMemo, createSignal, createUniqueId, For, Show, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Gradient, GradientData, RadialGradient, Settings } from "./_type"
import type { HEXColor } from "@/types/color"
import { ColorSpace, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape } from "./_enums"
import { attrRemove, attrSet, attrSetIfExist } from "@/utils/attributes"
import { eventCurrentTarget } from "@/utils/event"
import { BodyAttributes } from "@/enums/attributes"
import { elementDataset, elementId, elementRect, elementPointerCaptureRelease, elementPointerCaptureSet, elementTagName, elementValidTarget } from "@/utils/element"
import { mathClamp, mathRound } from "@/utils/math"
import { convertColorByColorSpace, gradientToCSSText } from "./_utils"
import { colorHslToHex, colorIsValid, colorRgbToHex } from "@/utils/color"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { arrayIncludes, arrayJoin, arrayLength, arrayMap, arraySort } from "@/utils/array"
import { stringLength, stringPadStart, stringReplace, stringSplit, stringSubstring, stringToUpperCase, stringTrim } from "@/utils/string"
import { numberIsNotDefined, numberParse, numberSafe, numberToString } from "@/utils/number"
import { rectWidth } from "@/utils/rect"
import { documentActive, documentBody } from "@/utils/document"
import { ICON_ADD, ICON_ADD_CIRCLE, ICON_CHEVRON_DOWN, ICON_CIRCLE, ICON_COPY, ICON_DELETE, ICON_EYE, ICON_EYEDROPPER, ICON_MORE_HORIZONTAL } from "@/constants/icons"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton, SquareButton } from "@/components/Button"
import Tooltip, { PopoverTooltip } from "@/components/Tooltip"
import CheckBox from "@/components/CheckBox"
import TextField, { updateTextFieldValue, NumberTextField, TextFieldButton } from "@/components/TextField"
import Menu, { closeMenu, MenuDivider, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import ColorPicker, { openColorPicker } from "@/components/ColorPicker"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Toast, { openToast } from "@/components/Toast"
import CSS from './_styles.module.scss'

type PointerPosition = {
	x: number
	y: number
}

const GradientDataList: VoidComponent<{
	gradientData: GradientData[]
	settings: Settings
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [isMenuActionOpen, setIsMenuActionOpen] = createSignal<boolean>(false)
	const [selectedGradientDataIndex, setSelectedGradientDataIndex] = createSignal<number>(-1)
	const settings = createMemo(() => props.settings)
	const gradientData = createMemo(() => props.gradientData)
	let menuActionRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function copy(data: GradientData): void {
		navigatorClipboardWriteText(
			arrayJoin(arrayMap(data.gradients, gradient => gradientToCSSText(
				gradient,
				settings().colorSpace,
				true
			)), '\n')
		)
	}

	const GradientDataItem: VoidComponent<{data: GradientData; index: number}> = ($props) => {
		const id = createUniqueId()
		return (<>
			<SquareButton
				c:focused={selectedGradientDataIndex() == $props.index && isMenuActionOpen()}
				data-rich-tooltip={id}
				data-gradient-data-item-index={$props.index}>
				<div data-gradient style={{"background-image": arrayJoin(arrayMap($props.data.gradients, gradient => gradientToCSSText(gradient)), ',')}}/>
			</SquareButton>
			<PopoverTooltip id={id}>
				<For each={$props.data.gradients}>{gradient =>
					<pre><code>{gradientToCSSText(gradient, settings().colorSpace, true)}</code></pre>
				}</For>
			</PopoverTooltip>
		</>)
	}

	const Menus: VoidComponent = () => {
		const buttonAction_viewId = createUniqueId()
		const buttonAction_copyId = createUniqueId()
		const buttonAction_deleteId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuActionRef = r}
				c:onToggleOpen={isOpen => setIsMenuActionOpen(isOpen)}
				style={{'min-width': '128px'}}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonAction_viewId:
						command(Commands.viewGradientData, selectedGradientDataIndex())
						closeMenu(menuActionRef)
						break
					case buttonAction_copyId:
						copy(gradientData()[selectedGradientDataIndex()])
						closeMenu(menuActionRef)
						break
					case buttonAction_deleteId:
						command(Commands.deleteGradientData, selectedGradientDataIndex())
						closeMenu(menuActionRef)
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_EYE}
					id={buttonAction_viewId}>
					View
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_COPY}
					id={buttonAction_copyId}>
					Copy
				</MenuItem>
				<MenuDivider />
				<MenuItem
					c:iconCode={ICON_DELETE}
					id={buttonAction_deleteId}>
					Delete
				</MenuItem>
			</Menu>
		</>)
	}

	return (<div
		class={CSS.body_gradient_data_list}

		// !important: must implement here... can't implement this in parent
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			const dataGradientDataItemIndex = elementDataset(
				button,
				'gradientDataItemIndex'
			)
			if (dataGradientDataItemIndex) {
				const index = numberParse(dataGradientDataItemIndex, true)
				if (numberIsNotDefined(index)) return

				setSelectedGradientDataIndex(index)
				openMenu(ev, menuActionRef, {
					anchor: button,
					position: MenuPosition.centerBottomToRight
				})
				return
			}
		}}>
		<Tooltip>
			<For each={gradientData()}>{(data, i) =>
				<GradientDataItem index={i()} data={data}/>
			}</For>
		</Tooltip>
		<Menus/>
	</div>)
}

const GradientControl: VoidComponent<{
	gradient: Gradient
	isDragging: boolean
	colorPickerRef: HTMLDialogElement
	gradientIndex: number
	settings: Settings
	selectedGradientIndex: number
	pointerPosition: PointerPosition
	command(type: Commands, ...args: unknown[]): unknown
	onStartDrag(gradient_element: HTMLDivElement, position: PointerPosition, colorstop_index: number): void
	onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): unknown
	onPointerMove(ev: PointerEvent & {currentTarget: HTMLDivElement}): unknown
}> = (props) => {
	const [expanded, setExpanded] = createSignal<boolean>(false)
	const [selectedColorStopIndex, setSelectedColorStopIndex] = createSignal<number>(-1)
	const gradient = createMemo(() => props.gradient)
	const getListStopGradient = createMemo<string>(() => arrayJoin(arrayMap(
		arraySort([...gradient().colorStopList], (a, b) => a.size - b.size),
		stop => `${stop.color} ${stop.size}%`
	), ','))
	const settings = createMemo(() => props.settings)
	const selectedGradientIndex = createMemo(() => props.selectedGradientIndex)
	const gradientIndex = createMemo(() => props.gradientIndex)
	const isConicGradient = createMemo<boolean>(() => gradient().type == GradientType.conic)
	let divGradientRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const Control: VoidComponent = () => (<div class={CSS.body_gradient_control_gradient}>
		<div>
			<For each={gradient().colorStopList}>{(stop, index) =>
				<div style={{left: stop.size + '%'}}>
					<div
						onPointerUp={ev => props.onPointerUp(ev)}
						onPointerCancel={ev => props.onPointerUp(ev)}
						onPointerMove={ev => props.onPointerMove(ev)}
						onPointerDown={ev => {
							elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
							props.onStartDrag(
								divGradientRef,
								{ x: ev.clientX, y: ev.clientY },
								index()
							)
							setSelectedColorStopIndex(index())
						}}
						draggable="false"
						data-dragged={attrSetIfExist(
							selectedGradientIndex() == gradientIndex()
							&& selectedColorStopIndex() == index()
							&& props.isDragging
						)}
						data-g-keep-pointer-event={attrSetIfExist(
							selectedGradientIndex() == gradientIndex()
							&& selectedColorStopIndex() == index()
							&& props.isDragging
						)}
						style={{"background-color": stop.color}}
						data-length={isConicGradient()
							? `${mathRound(stop.size / 100 * 360)}°`
							: `${stop.size}%`
						}
					/>
				</div>
			}</For>
			<div
				data-gradient
				ref={r => divGradientRef = r}
				style={{
					'background': `linear-gradient(to right,${getListStopGradient()})`
				}}
			/>
		</div>
		<IconButton
			data-tooltip={expanded()? "Show less" : 'Show more'}
			c:code={ICON_CHEVRON_DOWN}
			onClick={() => setExpanded(e => !e)}
			data-expanded={attrSetIfExist(expanded())}
		/>
	</div>)

	const Options: VoidComponent = () => (<div class={CSS.body_gradient_control_options}>
		<Dropdown
			c:values={[gradient().type]}
			c:onChange={(options) => command(
				Commands.updateGradientType,
				gradientIndex(),
				options[0].value
			)}
			c:label="Type">
			<For each={[
				[GradientType.linear, 'Linear'],
				[GradientType.radial, 'Radial'],
				[GradientType.conic, 'Conic'],
			]}>{option => <DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
		</Dropdown>
		<Dropdown
			c:values={[gradient().colorInterpolationMethod]}
			c:onChange={(options) => command(
				Commands.updateColorInterpolationMethod,
				gradientIndex(),
				options[0].value
			)}
			c:label="Color space">
			<For each={[
				[PolarColorSpace.auto, 'Auto'],
				// [RectangularColorSpace.a98_rgb, 'A98 RGB'],
				// [RectangularColorSpace.display_p3, 'Display P3'],
				[PolarColorSpace.hsl, 'HSL'],
				[PolarColorSpace.hwb, 'HWB'],
				// [RectangularColorSpace.lab, 'LAB'],
				[PolarColorSpace.lch, 'LCH'],
				// [RectangularColorSpace.oklab, 'Oklab'],
				[PolarColorSpace.oklch, 'OKLCH'],
				// [RectangularColorSpace.prophoto_rgb, 'ProPhoto RGB'],
				// [RectangularColorSpace.rec2020, 'Rec. 2020'],
				// [RectangularColorSpace.srgb, 'sRGB'],
				// [RectangularColorSpace.srgb_linear, 'sRGB Linear'],
				// [RectangularColorSpace.xyz, 'XYZ'],
				// [RectangularColorSpace.xyz_d50, 'XYZ D50'],
				// [RectangularColorSpace.xyz_d65, 'XYZ D65'],
			]}>{option => <DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
		</Dropdown>
		<Show
			when={arrayIncludes([
				PolarColorSpace.hsl, PolarColorSpace.hwb,
				PolarColorSpace.lch, PolarColorSpace.oklch
			], gradient().colorInterpolationMethod as PolarColorSpace)}>
			<Dropdown
				c:values={[gradient().hueInterpolationMethod]}
				c:onChange={(options) => command(
					Commands.updateHueInterpolationMethod,
					gradientIndex(),
					options[0].value
				)}
				c:label="Hue interpolation">
				<For each={[
					[HueInterpolationMethod.auto, 'Auto'],
					[HueInterpolationMethod.decreasing, 'Decreasing'],
					[HueInterpolationMethod.increasing, 'Increasing'],
					[HueInterpolationMethod.longer, 'Longer'],
					[HueInterpolationMethod.shorter, 'Shorter'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<Show when={gradient().type == GradientType.radial}>
			<Dropdown
				c:values={[(gradient() as RadialGradient).shape]}
				c:onChange={(options) => command(Commands.updateRadialGradientShape, gradientIndex(), options[0].value)}
				c:label="Shape">
				<For each={[
					[RadialGradientShape.circle, 'Circle'],
					[RadialGradientShape.ellipse, 'Ellipse'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<div class={CSS.body_gradient_control_options_2_grid}>
			<Show when={arrayIncludes([GradientType.conic, GradientType.linear], gradient().type)}>
				<NumberTextField
					c:label="Angle (°)"
					enterkeyhint="done"
					min={0}
					max={360}
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateGradientAngle,
						gradientIndex(),
						v
					)}
					value={(gradient() as any).angle as number}
				/>
			</Show>
			<Show when={arrayIncludes([GradientType.conic, GradientType.radial], gradient().type)}>
				<NumberTextField
					c:label="X (%)"
					min={0}
					enterkeyhint="done"
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateGradientPositionX,
						gradientIndex(),
						v
					)}
					value={(gradient() as any).position_x as number}
				/>
				<NumberTextField
					c:label="Y (%)"
					enterkeyhint="done"
					min={0}
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateGradientPositionY,
						gradientIndex(),
						v
					)}
					value={(gradient() as any).position_y as number}
				/>
			</Show>
			<Show when={gradient().type == GradientType.radial && (gradient() as RadialGradient).shape == RadialGradientShape.circle}>
				<NumberTextField
					c:label="Size (px)"
					enterkeyhint="done"
					min={0}
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateRadialGradientSize,
						gradientIndex(),
						v
					)}
					value={(gradient() as RadialGradient).sizeLength}
				/>
			</Show>
			<Show when={gradient().type == GradientType.radial && (gradient() as RadialGradient).shape == RadialGradientShape.ellipse}>
				<NumberTextField
					c:label="Width (%)"
					enterkeyhint="done"
					min={0}
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateRadialGradientWidth,
						gradientIndex(),
						v
					)}
					value={(gradient() as RadialGradient).sizeWidth}
				/>
				<NumberTextField
					c:label="Height (%)"
					enterkeyhint="done"
					min={0}
					c:autoSelectAll
					c:onInputAsNumber={(_, v) => command(
						Commands.updateRadialGradientHeight,
						gradientIndex(),
						v
					)}
					value={(gradient() as RadialGradient).sizeHeight}
				/>
			</Show>
			<CheckBox
				checked={gradient().repeat}
				onChange={() => command(
					Commands.toggleGradientRepeat,
					gradientIndex()
				)}>
				Repeat
			</CheckBox>
		</div>
	</div>)

	const ColorStops: VoidComponent = () => (<For each={gradient().colorStopList}>{(stop, index) =>
		<div class={CSS.body_gradient_control_stop}>
			<div>
				<NumberTextField
					c:label={isConicGradient()? "°" : "%"}
					c:autoSelectAll
					enterkeyhint="done"
					value={stop.size * (isConicGradient()? 360 / 100 : 1)}
					min={0}
					max={isConicGradient()? 360 : 100}
					c:integerOnly
					c:onInputAsNumber={(_, v) => command(
						Commands.updateColorStopLength,
						gradientIndex(),
						index(),
						v * (isConicGradient()? (100 / 360) : 1)
					)}
				/>
				<TextField
					c:leading={<Icon c:code={ICON_CIRCLE} c:filled style={{color: stop.color}}/>}
					value={convertColorByColorSpace(stop.color, settings().colorSpace, true)}
					enterkeyhint="done"
					onBlur={ev => {
						let value = eventCurrentTarget(ev).value
						const model = settings().colorSpace
						if (model == ColorSpace.hsla) {
							value = stringReplace(value, /[^-\d.,]+/gs, '')

							const values = stringSplit(value, ',')
							const h = mathClamp(numberParse(values[0] ?? '0', true), 0, 360)
							const s = mathClamp(numberParse(values[1] ?? '100', true), 0, 100)
							const l = mathClamp(numberParse(values[2] ?? '100', true), 0, 100)
							const opacity = mathRound(mathClamp(numberParse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = colorHslToHex({h: h / 360, s: s / 100, l: l / 100})

							value = stringToUpperCase((hex + (opacity < 0xff? stringPadStart(numberToString(opacity, 16), 2, '0') : '')))
							command(Commands.updateColorStopColor, gradientIndex(), index(), value)
							updateTextFieldValue(eventCurrentTarget(ev), `hsla(${h}, ${s}%, ${l}%, ${mathClamp(numberParse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						if (model == ColorSpace.rgba) {
							value = stringReplace(value, /[^-\d.,]+/gs, '')

							const values = stringSplit(value, ',')
							const r = mathClamp(numberParse(values[0] ?? '0', true), 0, 0xff)
							const g = mathClamp(numberParse(values[1] ?? '100', true), 0, 0xff)
							const b = mathClamp(numberParse(values[2] ?? '100', true), 0, 0xff)
							const opacity = mathRound(mathClamp(numberParse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = colorRgbToHex({r: r / 0xff, g: g / 0xff, b: b / 0xff})

							value = stringToUpperCase((hex + (opacity < 255? stringPadStart(numberToString(opacity, 16), 2, '0') : '')))
							command(Commands.updateColorStopColor, gradientIndex(), index(), value)
							updateTextFieldValue(eventCurrentTarget(ev), `rgba(${r}, ${g}, ${b}, ${mathClamp(numberParse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						value = stringReplace(value, /[^0-9a-fA-F]+/g, '')
						if (stringLength(stringTrim(value)) == 0) value = '0'

						let $value: number = mathClamp(numberSafe(numberParse(value, true, 16), 0), 0, 0xffffffff)

						value = '#' + stringToUpperCase(stringSubstring(stringPadStart(numberToString($value, 16), 6, '0'), 0, 8))
						command(Commands.updateColorStopColor, gradientIndex(), index(), value)
						updateTextFieldValue(eventCurrentTarget(ev), value)
					}}
					c:trailing={<>
						<TextFieldButton
							data-tooltip="Pick color"
							data-gradientcontrol-pickcolor={arrayJoin([gradientIndex(), index(), stop.color], ',')}>
							<Icon c:code={ICON_EYEDROPPER} />
						</TextFieldButton>
						<Show when={arrayLength(gradient().colorStopList) > 2}>
							<TextFieldButton
								data-tooltip="Remove color"
								data-gradientcontrol-removecolor={arrayJoin([gradientIndex(), index()], ',')}>
								<Icon c:code={ICON_DELETE} />
							</TextFieldButton>
						</Show>
					</>}
				/>
			</div>
		</div>
	}</For>)

	const Actions: VoidComponent = () => (<div class={CSS.body_gradient_control_actions}>
		<Button
			c:variant={ButtonVariant.filled}
			data-gradientcontrol-addcolorstop={gradientIndex()}>
			<Icon c:code={ICON_ADD_CIRCLE} c:filled/>Add color stop
		</Button>
		<IconButton
			data-tooltip="More actions"
			data-gradientcontrol-moreactions={gradientIndex()}
			c:code={ICON_MORE_HORIZONTAL}
		/>
	</div>)

	return (<div class={CSS.body_gradient_control}>
		<Control/>
		<Show when={expanded()}>
			<Options/>
			<h3>Stops</h3>
			<ColorStops/>
			<Actions/>
		</Show>
	</div>)
}

const _: VoidComponent<{
	gradients: Gradient[]
	gradientData: GradientData[]
	settings: Settings
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = documentBody()
	const buttonAddGradientId = createUniqueId()
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [pointerPosition, setPointerPosition] = createStore<PointerPosition>({x: 0, y: 0})
	const [colorPickerRef, setColorPickerRef] = createSignal<HTMLDialogElement | null>(null)
	const [selectedGradientIndex, setSelectedGradientIndex] = createSignal<number>(-1)
	const settings = createMemo(() => props.settings)
	let selectedColorStopIndex: number = -1
	let selectedGradientElementRect: DOMRect | null = null
	let menuGradientActionsRef: HTMLDialogElement
	let toastCopied: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updatePosition(): void {
		if (selectedGradientElementRect == null) return;

		const length = mathRound(mathClamp(
			(pointerPosition.x - selectedGradientElementRect.x) / rectWidth(selectedGradientElementRect) * 100,
			0,
			100
		))
		command(Commands.updateColorStopLength, selectedGradientIndex(), selectedColorStopIndex, length)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isDragging()) return;
		setPointerPosition({x: ev.clientX, y: ev.clientY})
		updatePosition()
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		setIsDragging(false)
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			c:draggable
			c:disabledAction
			ref={r => setColorPickerRef(r)}
			c:onUpdateColor={color => command(
				Commands.updateColorStopColor,
				selectedGradientIndex(),
				selectedColorStopIndex,
				color
			)}
		/>
	</>)

	const Menus: VoidComponent = () => {
		const buttonGradientActions_copyCSSId = createUniqueId()
		const buttonGradientActions_deleteGradientId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuGradientActionsRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonGradientActions_copyCSSId:
						navigatorClipboardWriteText(gradientToCSSText(
							props.gradients[selectedGradientIndex()],
							settings().colorSpace,
							true
						))
						closeMenu(menuGradientActionsRef)
						openToast(ev, toastCopied)
						break
					case buttonGradientActions_deleteGradientId:
						closeMenu(menuGradientActionsRef)
						command(Commands.removeGradient, selectedGradientIndex())
						break
					}
				}}>
				<MenuItem
					id={buttonGradientActions_copyCSSId}
					c:iconCode={ICON_COPY}>
					Copy CSS
				</MenuItem>
				<MenuItem
					id={buttonGradientActions_deleteGradientId}
					c:iconCode={ICON_DELETE}
					disabled={arrayLength(props.gradients) <= 1}>
					Delete gradient
				</MenuItem>
			</Menu>
		</>)
	}

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toastCopied = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			switch (elementId(button)) {
			case buttonAddGradientId:
				command(Commands.addGradient)
				break
			default:
				const dataGradientcontrolAddcolorstop = elementDataset(
					button, 'gradientcontrolAddcolorstop'
				)
				if (dataGradientcontrolAddcolorstop) {
					const index = numberParse(dataGradientcontrolAddcolorstop, true)
					if (numberIsNotDefined(index)) return

					return command(Commands.addColorStop, index)
				}

				// data-gradientcontrol-moreactions
				const dataGradientcontrolMoreactions = elementDataset(
					button, 'gradientcontrolMoreactions'
				)
				if (dataGradientcontrolMoreactions) {
					const index = numberParse(dataGradientcontrolMoreactions, true)
					if (numberIsNotDefined(index)) return

					setSelectedGradientIndex(index)
					openMenu(ev, menuGradientActionsRef, {
						anchor: button,
						position: MenuPosition.centerCenterRightTop
					})
					return
				}

				// data-gradientcontrol-pickcolor
				const dataGradientcontrolPickcolor = elementDataset(
					button, 'gradientcontrolPickcolor'
				)
				if (dataGradientcontrolPickcolor) {
					let [gradientIndex, colorStopIndex, color] = stringSplit(
						dataGradientcontrolPickcolor, ','
					) as [number|string|undefined, number|string|undefined, string|undefined]
					if (!colorStopIndex || !color || !colorIsValid(color)) return

					colorStopIndex = numberParse(colorStopIndex as string, true)
					if (numberIsNotDefined(colorStopIndex)) return

					gradientIndex = numberParse(gradientIndex as string, true)
					if (numberIsNotDefined(gradientIndex)) return

					selectedColorStopIndex = colorStopIndex
					setSelectedGradientIndex(gradientIndex)
					openColorPicker(ev, colorPickerRef()!, {
						color: color as HEXColor,
						anchor: button
					})
					return
				}

				// data-gradientcontrol-removecolor
				const dataGradientcontrolRemovecolor = elementDataset(
					button, 'gradientcontrolRemovecolor'
				)
				if (dataGradientcontrolRemovecolor) {
					let [gradientIndex, colorStopIndex] = stringSplit(
						dataGradientcontrolRemovecolor, ','
					) as [number|string|undefined, number|string|undefined]
					if (!gradientIndex || !colorStopIndex) return

					gradientIndex = numberParse(gradientIndex as string, true)
					colorStopIndex = numberParse(colorStopIndex as string, true)
					if (numberIsNotDefined(gradientIndex)
						|| numberIsNotDefined(colorStopIndex)
					) return

					command(Commands.removeColorStop, gradientIndex, colorStopIndex)
				}
			}
		}}>
		<div>
			<div class={CSS.body_preview}>
				<div style={{
					"aspect-ratio": settings().aspectRatio,
					"border-radius": settings().borderRadius + 'px',
					"background-image": arrayJoin(
						arrayMap(
							props.gradients,
							gradient => gradientToCSSText(gradient)
						),
						','
					)
				}}/>
			</div>
			<Tooltip>
				<div class={CSS.body_control}>
					<div>
						<GradientDataList
							command={command}
							gradientData={props.gradientData}
							settings={settings()}
						/>
						<div class={CSS.body_control_shape}>
							<NumberTextField
								min={0.1}
								step={0.1}
								enterkeyhint="done"
								c:autoSelectAll
								value={settings().aspectRatio}
								c:onInputAsNumber={(_, v) => command(
									Commands.updateSettingsAspectRatio,
									v
								)}
								c:label="Aspect ratio"
							/>
							<NumberTextField
								min={0}
								enterkeyhint="done"
								c:autoSelectAll
								value={settings().borderRadius}
								c:onInputAsNumber={(_, v) => command(
									Commands.updateSettingsBorderRadius,
									v
								)}
								c:label="Border radius (px)"
							/>
						</div>
					</div>
					<Button
						c:variant={ButtonVariant.filled}
						id={buttonAddGradientId}>
						<Icon c:code={ICON_ADD} />Add gradient
					</Button>
					<For each={props.gradients}>{(gradient, index) =>
						<GradientControl
							gradient={gradient}
							command={command}
							settings={settings()}
							colorPickerRef={colorPickerRef()!}
							isDragging={isDragging()}
							gradientIndex={index()}
							pointerPosition={pointerPosition}
							onPointerMove={onPointerMove}
							onPointerUp={onPointerUp}
							onStartDrag={(gradient_el, pointer, colorStopIndex) => {
								selectedGradientElementRect = elementRect(gradient_el)
								selectedColorStopIndex = colorStopIndex
								setSelectedGradientIndex(index())
								setPointerPosition(pointer)
								setIsDragging(true)
								attrSet(body, BodyAttributes.noPointerEvent)
							}}
							selectedGradientIndex={selectedGradientIndex()}
						/>
					}</For>
				</div>
			</Tooltip>
		</div>
		<ColorPickers/>
		<Menus/>
		<Toasts/>
	</main>)
}

export default _