import { createMemo, createSignal, For, onMount, Show, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Gradient, GradientData, RadialGradient, Settings } from "./_type"
import { _clipboard, _writeText, _gradients, _map, _settings, _colorModel, _join, _data, _index, _currentTarget, _centerBottomToRight, _command, _gradientData, _gradient, _colorStopList, _sort, _size, _color, _type, _conic, _onStartDrag, _clientX, _clientY, _selectedGradientIndex, _gradientIndex, _isDragging, _touches, _linear, _radial, _colorInterpolationMethod, _hsl, _hwb, _lch, _oklch, _includes, _auto, _decreasing, _increasing, _longer, _shorter, _hueInterpolationMethod, _circle, _ellipse, _shape, _angle, _positionX, _positionY, _sizeLength, _sizeWidth, _sizeHeight, _repeat, _value, _hsla, _replace, _split, _toString, _padStart, _toUpperCase, _rgba, _trim, _length, _isNaN, _isFinite, _substring, _onStartPickColor, _colorPickerRef, _filled, _onOpenActionsMenu, _x, _width, _noPointerEvent, _touchmove, _touchend, _mousemove, _mouseup, _aspectRatio, _borderRadius, _px, _centerCenterRightTop, _valueAsNumber } from "@/constants/string"
import { ColorModel, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape } from "./_enums"
import { removeElementAttribute, setElementAttribute, setElementAttributeIfExist } from "@/utils/attributes"
import { addEventListener } from "@/utils/event"
import { getDocumentBody, getDocument, getNavigator } from "@/constants/window"
import { BodyAttributes } from "@/enums/attributes"
import { getBoundingClientRect } from "@/utils/element"
import { mathClamp, mathRound, numberParse } from "@/utils/math"
import { convertColorByColorModel, gradientToCSSText } from "./_utils"
import { HSL_to_HEX, RGB_to_HEX } from "@/utils/color"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton, SquareButton } from "@/components/Button"
import TextTooltip, { RichTooltip } from "@/components/Tooltip"
import CheckBox from "@/components/CheckBox"
import TextField, { changeTextFieldValue, NumberTextField, TextFieldButton } from "@/components/TextField"
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
	const [is_menu_action_open, setIs_menu_action_open] = createSignal<boolean>(false)
	const [selectedGradientDataIndex, setSelectedGradientDataIndex] = createSignal<number>(-1)
	let menu_action_ref: HTMLDialogElement

	function copy(data: GradientData): void {
		getNavigator()
		[_clipboard]
		[_writeText](
			data[_gradients]
			[_map](gradient => gradientToCSSText(
				gradient,
				props[_settings][_colorModel],
				true
			))[_join]('\n')
		)
	}

	const GradientDataItem: VoidComponent<{data: GradientData; index: number}> = ($props) => {
		return (<RichTooltip
			tooltip={<For each={$props[_data][_gradients]}>{gradient =>
				<pre><code>{gradientToCSSText(gradient, props[_settings][_colorModel], true)}</code></pre>
			}</For>}>
			<SquareButton
				focused={selectedGradientDataIndex() == $props[_index] && is_menu_action_open()}
				onClick={(ev) => {
					setSelectedGradientDataIndex($props[_index])
					openMenu(ev, menu_action_ref, {
						anchor: ev[_currentTarget],
						position: MenuPosition[_centerBottomToRight]
					})
				}}>
				<div data-gradient style={{"background-image": $props[_data][_gradients][_map](gradient => gradientToCSSText(gradient))[_join](',')}}/>
			</SquareButton>
		</RichTooltip>)
	}

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_action_ref = r}
			onToggleOpen={isOpen => setIs_menu_action_open(isOpen)}
			style={{'min-width': '128px'}}>
			<MenuItem
				iconCode={0xE77B}
				onClick={() => {
					props[_command](Commands.view_gradient_data, selectedGradientDataIndex())
					closeMenu(menu_action_ref)
				}}>
				View
			</MenuItem>
			<MenuItem
				iconCode={0xE51B}
				onClick={() => {
					copy(props[_gradientData][selectedGradientDataIndex()])
					closeMenu(menu_action_ref)
				}}>
				Copy
			</MenuItem>
			<MenuDivider />
			<MenuItem
				iconCode={0xE59D}
				onClick={() => {
					props[_command](Commands.delete_gradient_data, selectedGradientDataIndex())
					closeMenu(menu_action_ref)
				}}>
				Delete
			</MenuItem>
		</Menu>
	</>)

	return (<div class={CSS.body_gradient_data_list}>
		<For each={props[_gradientData]}>{(data, i) =>
			<GradientDataItem index={i()} data={data}/>
		}</For>
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
	onStartDrag(gradientElement: HTMLDivElement, position: PointerPosition, colorStopIndex: number): void
	onStartPickColor(colorStopIndex: number): void
	onOpenActionsMenu(ev: Event): void
}> = (props) => {
	const [expand, setExpand] = createSignal<boolean>(false)
	const [selectedColorStopIndex, setSelectedColorStopIndex] = createSignal<number>(-1)
	const getStopListGradient = createMemo<string>(() =>
		[	...props
			[_gradient]
			[_colorStopList]
		][_sort]((a, b) => a[_size] - b[_size])
		[_map](stop => `${stop[_color]} ${stop[_size]}%`)
		[_join](',')
	)
	const isConicGradient = createMemo<boolean>(() => props[_gradient][_type] == GradientType[_conic])
	let div_gradient_ref: HTMLDivElement

	const Control: VoidComponent = () => (<div class={CSS.body_gradient_control_gradient}>
		<div>
			<For each={props[_gradient][_colorStopList]}>{(stop, index) =>
				<div style={{left: stop[_size] + '%'}}>
					<div
						onMouseDown={ev => {
							props[_onStartDrag](
								div_gradient_ref,
								{ x: ev[_clientX], y: ev[_clientY] },
								index()
							)
							setSelectedColorStopIndex(index())
						}}
						draggable="false"
						data-dragged={setElementAttributeIfExist(props[_selectedGradientIndex] == props[_gradientIndex] && selectedColorStopIndex() == index() && props[_isDragging])}
						data-g-keep-pointer-event={setElementAttributeIfExist(props[_selectedGradientIndex] == props[_gradientIndex] && selectedColorStopIndex() == index() && props[_isDragging])}
						onTouchStart={ev => {
							props[_onStartDrag](
								div_gradient_ref,
								{ x: ev[_touches][0][_clientX], y: ev[_touches][0][_clientY] },
								index()
							)
							setSelectedColorStopIndex(index())
						}}
						style={{"background-color": stop[_color]}}
						data-length={isConicGradient()
							? `${mathRound(stop[_size] / 100 * 360)}°`
							: `${stop[_size]}%`
						}
					/>
				</div>
			}</For>
			<div
				data-gradient
				ref={r => div_gradient_ref = r}
				style={{
					'background': `linear-gradient(to right,${getStopListGradient()})`
				}}
			/>
		</div>
		<TextTooltip text={expand()? "Show less" : 'Show more'}>
			<IconButton
				code={0xE3FC}
				onClick={() => setExpand(e => !e)}
				data-expanded={setElementAttributeIfExist(expand())}
			/>
		</TextTooltip>
	</div>)

	const Options: VoidComponent = () => (<div class={CSS.body_gradient_control_options}>
		<Dropdown
			values={[props[_gradient][_type]]}
			onChangeOptions={(options) => props[_command](
				Commands.change_gradient_type,
				props[_gradientIndex],
				options[0][_value]
			)}
			label="Type">
			<For each={[
				[GradientType[_linear], 'Linear'],
				[GradientType[_radial], 'Radial'],
				[GradientType[_conic], 'Conic'],
			]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
		</Dropdown>
		<Dropdown
			values={[props[_gradient][_colorInterpolationMethod]]}
			onChangeOptions={(options) => props[_command](
				Commands.change_colorInterpolationMethod,
				props[_gradientIndex],
				options[0][_value]
			)}
			label="Color space">
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
			]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
		</Dropdown>
		<Show
			when={[
				PolarColorSpace[_hsl], PolarColorSpace[_hwb],
				PolarColorSpace[_lch], PolarColorSpace[_oklch]
			][_includes](props[_gradient][_colorInterpolationMethod] as PolarColorSpace)}>
			<Dropdown
				values={[props[_gradient][_hueInterpolationMethod]]}
				onChangeOptions={(options) => props[_command](
					Commands.change_hueInterpolationMethod,
					props[_gradientIndex],
					options[0][_value]
				)}
				label="Hue interpolation">
				<For each={[
					[HueInterpolationMethod[_auto], 'Auto'],
					[HueInterpolationMethod[_decreasing], 'Decreasing'],
					[HueInterpolationMethod[_increasing], 'Increasing'],
					[HueInterpolationMethod[_longer], 'Longer'],
					[HueInterpolationMethod[_shorter], 'Shorter'],
				]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<Show when={props[_gradient][_type] == GradientType[_radial]}>
			<Dropdown
				values={[(props[_gradient] as RadialGradient)[_shape]]}
				onChangeOptions={(options) => props[_command](Commands.change_radialGradient_shape, props[_gradientIndex], options[0][_value])}
				label="Shape">
				<For each={[
					[RadialGradientShape[_circle], 'Circle'],
					[RadialGradientShape[_ellipse], 'Ellipse'],
				]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<div class={CSS.body_gradient_control_options_2_grid}>
			<Show when={[GradientType[_conic], GradientType[_linear]][_includes](props[_gradient][_type])}>
				<NumberTextField
					label="Angle (°)"
					enterkeyhint="done"
					min={0}
					max={360}
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_gradient_angle,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as any)[_angle] as number}
				/>
			</Show>
			<Show when={[GradientType[_conic], GradientType[_radial]][_includes](props[_gradient][_type])}>
				<NumberTextField
					label="X (%)"
					min={0}
					enterkeyhint="done"
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_gradient_positionX,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as any)[_positionX] as number}
				/>
				<NumberTextField
					label="Y (%)"
					enterkeyhint="done"
					min={0}
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_gradient_positionY,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as any)[_positionY] as number}
				/>
			</Show>
			<Show when={props[_gradient][_type] == GradientType[_radial] && props[_gradient][_shape] == RadialGradientShape[_circle]}>
				<NumberTextField
					label="Size (px)"
					enterkeyhint="done"
					min={0}
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_radialGradient_size,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as RadialGradient)[_sizeLength]}
				/>
			</Show>
			<Show when={props[_gradient][_type] == GradientType[_radial] && props[_gradient][_shape] == RadialGradientShape[_ellipse]}>
				<NumberTextField
					label="Width (%)"
					enterkeyhint="done"
					min={0}
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_radialGradient_width,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as RadialGradient)[_sizeWidth]}
				/>
				<NumberTextField
					label="Height (%)"
					enterkeyhint="done"
					min={0}
					autoSelectAll
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_radialGradient_height,
						props[_gradientIndex],
						v
					)}
					value={(props[_gradient] as RadialGradient)[_sizeHeight]}
				/>
			</Show>
			<CheckBox
				checked={props[_gradient][_repeat]}
				onChange={() => props[_command](
					Commands.toggle_gradient_repeat,
					props[_gradientIndex]
				)}>
				Repeat
			</CheckBox>
		</div>
	</div>)

	const ColorStops: VoidComponent = () => (<For each={props[_gradient][_colorStopList]}>{(stop, index) =>
		<div class={CSS.body_gradient_control_stop}>
			<div>
				<NumberTextField
					label={isConicGradient()? "°" : "%"}
					autoSelectAll
					enterkeyhint="done"
					value={stop[_size] * (isConicGradient()? 360 / 100 : 1)}
					min={0}
					max={isConicGradient()? 360 : 100}
					integerOnly
					onInputAsNumber={(_, v) => props[_command](
						Commands.change_colorStopLength,
						props[_gradientIndex],
						index(),
						v * (isConicGradient()? (100 / 360) : 1)
					)}
				/>
				<TextField
					leading={<Icon code={0xE408} filled style={{color: stop[_color]}}/>}
					value={convertColorByColorModel(stop[_color], props[_settings][_colorModel], true)}
					enterkeyhint="done"
					onBlur={ev => {
						let value = ev[_currentTarget][_value]
						const colorModel = props[_settings][_colorModel]
						if (colorModel == ColorModel[_hsla]) {
							value = value[_replace](/[^-\d.,]+/gs, '')

							const values = value[_split](',')
							const h = mathClamp(numberParse(values[0] ?? '0', true), 0, 360)
							const s = mathClamp(numberParse(values[1] ?? '100', true), 0, 100)
							const l = mathClamp(numberParse(values[2] ?? '100', true), 0, 100)
							const opacity = mathRound(mathClamp(numberParse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = HSL_to_HEX({h: h / 360, s: s / 100, l: l / 100})

							value = (hex + (opacity < 0xff? opacity[_toString](16)[_padStart](2, '0') : ''))[_toUpperCase]()
							props[_command](Commands.change_colorStopColor, props[_gradientIndex], index(), value)
							changeTextFieldValue(ev[_currentTarget], `hsla(${h}, ${s}%, ${l}%, ${mathClamp(numberParse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						if (colorModel == ColorModel[_rgba]) {
							value = value[_replace](/[^-\d.,]+/gs, '')

							const values = value[_split](',')
							const r = mathClamp(numberParse(values[0] ?? '0', true), 0, 0xff)
							const g = mathClamp(numberParse(values[1] ?? '100', true), 0, 0xff)
							const b = mathClamp(numberParse(values[2] ?? '100', true), 0, 0xff)
							const opacity = mathRound(mathClamp(numberParse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = RGB_to_HEX({r, g, b})

							value = (hex + (opacity < 255? opacity[_toString](16)[_padStart](2, '0') : ''))[_toUpperCase]()
							props[_command](Commands.change_colorStopColor, props[_gradientIndex], index(), value)
							changeTextFieldValue(ev[_currentTarget], `rgba(${r}, ${g}, ${b}, ${mathClamp(numberParse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						value = value[_replace](/[^0-9a-fA-F]+/g, '')
						if (value[_trim]()[_length] == 0) value = '0'

						let $value: number = numberParse(value, true, 16)
						if (Number[_isNaN]($value) || !Number[_isFinite]($value)) $value = 0
						if ($value < 0) $value = 0
						if ($value > 0xffffffff) $value = 0xffffffff

						value = `#${$value[_toString](16)[_padStart](6, '0')[_substring](0, 8)[_toUpperCase]()}`
						props[_command](Commands.change_colorStopColor, props[_gradientIndex], index(), value)
						changeTextFieldValue(ev[_currentTarget], value)
					}}
					trailing={<>
						<TextTooltip text="Pick color"><TextFieldButton
							onClick={(ev) => {
								props[_onStartPickColor](index())
								openColorPicker(ev, props[_colorPickerRef], { color: stop[_color], anchor: ev[_currentTarget] })}
							}>
							<Icon code={0xE785} />
						</TextFieldButton></TextTooltip>
						<Show when={props[_gradient][_colorStopList][_length] > 2}>
							<TextTooltip text="Remove color"><TextFieldButton
								onClick={() => props[_command](Commands.remove_colorStop, props[_gradientIndex], index())}>
								<Icon code={0xE59D} />
							</TextFieldButton></TextTooltip>
						</Show>
					</>}
				/>
			</div>
		</div>
	}</For>)

	const Actions: VoidComponent = () => (<div class={CSS.body_gradient_control_actions}>
		<Button
			variant={ButtonVariant[_filled]}
			onClick={() => props[_command](Commands.add_colorStop, props[_gradientIndex])}>
			<Icon code={0xE009} filled/>Add color stop
		</Button>
		<TextTooltip text="More actions">
			<IconButton onClick={ev => props[_onOpenActionsMenu](ev)} code={0xEAD7}/>
		</TextTooltip>
	</div>)

	return (<div class={CSS.body_gradient_control}>
		<Control/>
		<Show when={expand()}>
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
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [pointerPosition, setPointerPosition] = createStore<PointerPosition>({x: 0, y: 0})
	const [colorPicker_ref, set_colorPicker_ref] = createSignal<HTMLDialogElement | null>(null)
	const [selectedGradientIndex, setSelectedGradientIndex] = createSignal<number>(-1)
	let selectedColorStopIndex: number = -1
	let selectedGradientElementRect: DOMRect | null = null
	let menu_gradientActions_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	function updatePosition(): void {
		if (selectedGradientElementRect == null) return;

		const length = mathRound(mathClamp(
			(pointerPosition[_x] - selectedGradientElementRect[_x]) / selectedGradientElementRect[_width] * 100,
			0,
			100
		))
		props[_command](Commands.change_colorStopLength, selectedGradientIndex(), selectedColorStopIndex, length)
	}

	function onTouchMove(ev: TouchEvent): void {
		if (!isDragging()) return;
		setPointerPosition({x: ev[_touches][0][_clientX], y: ev[_touches][0][_clientY]})
		updatePosition()
	}

	function onMouseMove(ev: MouseEvent): void {
		if (!isDragging()) return;
		setPointerPosition({x: ev[_clientX], y: ev[_clientY]})
		updatePosition()
	}

	function onPointerUp(): void {
		setIsDragging(false)
		removeElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
	}

	function initListener() {
		addEventListener<TouchEvent>(getDocument(), _touchmove, onTouchMove)
		addEventListener<TouchEvent>(getDocument(), _touchend, onPointerUp)
		addEventListener<MouseEvent>(getDocument(), _mousemove, onMouseMove)
		addEventListener<MouseEvent>(getDocument(), _mouseup, onPointerUp)
	}

	onMount(() => {
		initListener()
	})

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			dragable
			disabledAction
			ref={r => set_colorPicker_ref(r)}
			onUpdateColor={color => props[_command](
				Commands.change_colorStopColor,
				selectedGradientIndex(),
				selectedColorStopIndex,
				color
			)}
		/>
	</>)

	const Menus: VoidComponent = () => (<>
		<Menu ref={r => menu_gradientActions_ref = r}>
			<MenuItem
				iconCode={0xE51B}
				onClick={ev => {
					getNavigator()[_clipboard][_writeText](gradientToCSSText(props[_gradients][selectedGradientIndex()], props[_settings][_colorModel], true))
					closeMenu(menu_gradientActions_ref)
					openToast(ev, toast_copied_ref)
				}}>
				Copy CSS
			</MenuItem>
			<MenuItem
				iconCode={0xE59D}
				disabled={props[_gradients][_length] <= 1}
				onClick={() => {
					closeMenu(menu_gradientActions_ref)
					props[_command](Commands.remove_gradient, selectedGradientIndex())
				}}>
				Delete gradient
			</MenuItem>
		</Menu>
	</>)

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<main class={CSS.body}>
		<div>
			<div class={CSS.body_preview}>
				<div style={{
					"aspect-ratio": props[_settings][_aspectRatio],
					"border-radius": props[_settings][_borderRadius] + _px,
					"background-image": props[_gradients][_map](gradient => gradientToCSSText(gradient))[_join](',')
				}}/>
			</div>
			<div class={CSS.body_control}>
				<div>
					<GradientDataList
						command={props[_command]}
						gradientData={props[_gradientData]}
						settings={props[_settings]}
					/>
					<div class={CSS.body_control_shape}>
						<NumberTextField
							min={0.1}
							step={0.1}
							enterkeyhint="done"
							autoSelectAll
							value={props[_settings][_aspectRatio]}
							onInputAsNumber={(_, v) => props[_command](
								Commands.change_settings_aspectRatio,
								v
							)}
							label="Aspect ratio"
						/>
						<NumberTextField
							min={0}
							enterkeyhint="done"
							autoSelectAll
							value={props[_settings][_borderRadius]}
							onInputAsNumber={(_, v) => props[_command](
								Commands.change_settings_borderRadius,
								v
							)}
							label="Border radius (px)"
						/>
					</div>
				</div>
				<Button
					variant={ButtonVariant[_filled]}
					onClick={() => props[_command](Commands.add_gradient)}>
					<Icon code={0xE007} />Add gradient
				</Button>
				<For each={props[_gradients]}>{(gradient, index) =>
					<GradientControl
						gradient={gradient}
						command={props[_command]}
						settings={props[_settings]}
						colorPickerRef={colorPicker_ref()!}
						isDragging={isDragging()}
						gradientIndex={index()}
						pointerPosition={pointerPosition}
						onStartDrag={(gradientElement, pointer, colorStopIndex) => {
							selectedGradientElementRect = getBoundingClientRect(gradientElement)
							selectedColorStopIndex = colorStopIndex
							setSelectedGradientIndex(index())
							setPointerPosition(pointer)
							setIsDragging(true)
							setElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
						}}
						selectedGradientIndex={selectedGradientIndex()}
						onStartPickColor={(colorStopIndex) => {
							selectedColorStopIndex = colorStopIndex
							setSelectedGradientIndex(index())
						}}
						onOpenActionsMenu={ev => {
							setSelectedGradientIndex(index())
							openMenu(ev, menu_gradientActions_ref, {
								anchor: ev[_currentTarget] as HTMLElement,
								position: MenuPosition[_centerCenterRightTop]
							})
						}}
					/>
				}</For>
			</div>
		</div>
		<ColorPickers/>
		<Menus/>
		<Toasts/>
	</main>)
}

export default _