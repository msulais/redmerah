import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Gradient, GradientData, RadialGradient, Settings } from "./_type"
import { ColorModel, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape } from "./_enums"
import { attr_remove, attr_set, attr_set_if_exist } from "@/utils/attributes"
import { event_add_listener, event_current_target } from "@/utils/event"
import { BodyAttributes } from "@/enums/attributes"
import { element_rect } from "@/utils/element"
import { math_clamp, math_round } from "@/utils/math"
import { convert_color_by_color_model, gradient_to_css_text } from "./_utils"
import { hsl_to_hex, rgb_to_hex } from "@/utils/color"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { array_includes, array_join, array_length, array_map, array_sort } from "@/utils/array"
import { string_length, string_padstart, string_replace, string_split, string_substring, string_touppercase, string_trim } from "@/utils/string"
import { number_parse, number_safe, number_to_string } from "@/utils/number"
import { rect_width } from "@/utils/rect"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton, SquareButton } from "@/components/Button"
import Tooltip, { PopoverTooltip } from "@/components/Tooltip"
import CheckBox from "@/components/CheckBox"
import TextField, { change_textfield_value, NumberTextField, TextFieldButton } from "@/components/TextField"
import Menu, { close_menu, MenuDivider, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import ColorPicker, { open_colorpicker } from "@/components/ColorPicker"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Toast, { open_toast } from "@/components/Toast"
import CSS from './_styles.module.scss'

type PointerPosition = {
	x: number
	y: number
}

const GradientDataList: VoidComponent<{
	gradient_data: GradientData[]
	settings: Settings
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [is_menu_action_open, set_is_menu_action_open] = createSignal<boolean>(false)
	const [selected_gradientdata_index, set_selected_gradientdata_index] = createSignal<number>(-1)
	const settings = createMemo(() => props.settings)
	const gradient_data = createMemo(() => props.gradient_data)
	let menu_action_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function copy(data: GradientData): void {
		navigator_clipboard_writetext(
			array_join(array_map(data.gradients, gradient => gradient_to_css_text(
				gradient,
				settings().color_model,
				true
			)), '\n')
		)
	}

	const GradientDataItem: VoidComponent<{data: GradientData; index: number}> = ($props) => {
		const id = createUniqueId()
		return (<>
			<SquareButton
				focused={selected_gradientdata_index() == $props.index && is_menu_action_open()}
				data-rich-tooltip={id}
				onClick={(ev) => {
					set_selected_gradientdata_index($props.index)
					open_menu(ev, menu_action_ref, {
						anchor: event_current_target(ev),
						position: MenuPosition.center_bottom_to_right
					})
				}}>
				<div data-gradient style={{"background-image": array_join(array_map($props.data.gradients, gradient => gradient_to_css_text(gradient)), ',')}}/>
			</SquareButton>
			<PopoverTooltip id={id}>
				<For each={$props.data.gradients}>{gradient =>
					<pre><code>{gradient_to_css_text(gradient, settings().color_model, true)}</code></pre>
				}</For>
			</PopoverTooltip>
		</>)
	}

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_action_ref = r}
			on_toggle_open={isOpen => set_is_menu_action_open(isOpen)}
			style={{'min-width': '128px'}}>
			<MenuItem
				icon_code={0xE77B}
				onClick={() => {
					command(Commands.view_gradient_data, selected_gradientdata_index())
					close_menu(menu_action_ref)
				}}>
				View
			</MenuItem>
			<MenuItem
				icon_code={0xE51B}
				onClick={() => {
					copy(gradient_data()[selected_gradientdata_index()])
					close_menu(menu_action_ref)
				}}>
				Copy
			</MenuItem>
			<MenuDivider />
			<MenuItem
				icon_code={0xE59D}
				onClick={() => {
					command(Commands.delete_gradient_data, selected_gradientdata_index())
					close_menu(menu_action_ref)
				}}>
				Delete
			</MenuItem>
		</Menu>
	</>)

	return (<div class={CSS.body_gradient_data_list}>
		<Tooltip>
			<For each={gradient_data()}>{(data, i) =>
				<GradientDataItem index={i()} data={data}/>
			}</For>
		</Tooltip>
		<Menus/>
	</div>)
}

const GradientControl: VoidComponent<{
	gradient: Gradient
	is_dragging: boolean
	colorpicker_ref: HTMLDialogElement
	gradient_index: number
	settings: Settings
	selected_gradient_index: number
	pointer_position: PointerPosition
	command(type: Commands, ...args: unknown[]): unknown
	on_start_drag(gradient_element: HTMLDivElement, position: PointerPosition, colorstop_index: number): void
	on_start_pick_color(colorstop_index: number): void
	on_open_actions_menu(ev: Event): void
}> = (props) => {
	const [expanded, set_expanded] = createSignal<boolean>(false)
	const [selected_colorstop_index, set_selected_colorstop_index] = createSignal<number>(-1)
	const gradient = createMemo(() => props.gradient)
	const get_list_stop_gradient = createMemo<string>(() => array_join(array_map(
		array_sort([...gradient().color_stop_list], (a, b) => a.size - b.size),
		stop => `${stop.color} ${stop.size}%`
	), ','))
	const settings = createMemo(() => props.settings)
	const selected_gradient_index = createMemo(() => props.selected_gradient_index)
	const gradient_index = createMemo(() => props.gradient_index)
	const is_conic_gradient = createMemo<boolean>(() => gradient().type == GradientType.conic)
	let div_gradient_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const Control: VoidComponent = () => (<div class={CSS.body_gradient_control_gradient}>
		<div>
			<For each={gradient().color_stop_list}>{(stop, index) =>
				<div style={{left: stop.size + '%'}}>
					<div
						onMouseDown={ev => {
							props.on_start_drag(
								div_gradient_ref,
								{ x: ev.clientX, y: ev.clientY },
								index()
							)
							set_selected_colorstop_index(index())
						}}
						draggable="false"
						data-dragged={attr_set_if_exist(
							selected_gradient_index() == gradient_index()
							&& selected_colorstop_index() == index()
							&& props.is_dragging
						)}
						data-g-keep-pointer-event={attr_set_if_exist(
							selected_gradient_index() == gradient_index()
							&& selected_colorstop_index() == index()
							&& props.is_dragging
						)}
						onTouchStart={ev => {
							props.on_start_drag(
								div_gradient_ref,
								{ x: ev.touches[0].clientX, y: ev.touches[0].clientY },
								index()
							)
							set_selected_colorstop_index(index())
						}}
						style={{"background-color": stop.color}}
						data-length={is_conic_gradient()
							? `${math_round(stop.size / 100 * 360)}°`
							: `${stop.size}%`
						}
					/>
				</div>
			}</For>
			<div
				data-gradient
				ref={r => div_gradient_ref = r}
				style={{
					'background': `linear-gradient(to right,${get_list_stop_gradient()})`
				}}
			/>
		</div>
		<IconButton
			data-tooltip={expanded()? "Show less" : 'Show more'}
			code={0xE3FC}
			onClick={() => set_expanded(e => !e)}
			data-expanded={attr_set_if_exist(expanded())}
		/>
	</div>)

	const Options: VoidComponent = () => (<div class={CSS.body_gradient_control_options}>
		<Dropdown
			values={[gradient().type]}
			on_change_options={(options) => command(
				Commands.change_gradient_type,
				gradient_index(),
				options[0].value
			)}
			label="Type">
			<For each={[
				[GradientType.linear, 'Linear'],
				[GradientType.radial, 'Radial'],
				[GradientType.conic, 'Conic'],
			]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
		</Dropdown>
		<Dropdown
			values={[gradient().color_interpolation_method]}
			on_change_options={(options) => command(
				Commands.change_color_interpolation_method,
				gradient_index(),
				options[0].value
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
			when={array_includes([
				PolarColorSpace.hsl, PolarColorSpace.hwb,
				PolarColorSpace.lch, PolarColorSpace.oklch
			], gradient().color_interpolation_method as PolarColorSpace)}>
			<Dropdown
				values={[gradient().hue_interpolation_method]}
				on_change_options={(options) => command(
					Commands.change_hue_interpolation_method,
					gradient_index(),
					options[0].value
				)}
				label="Hue interpolation">
				<For each={[
					[HueInterpolationMethod.auto, 'Auto'],
					[HueInterpolationMethod.decreasing, 'Decreasing'],
					[HueInterpolationMethod.increasing, 'Increasing'],
					[HueInterpolationMethod.longer, 'Longer'],
					[HueInterpolationMethod.shorter, 'Shorter'],
				]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<Show when={gradient().type == GradientType.radial}>
			<Dropdown
				values={[(gradient() as RadialGradient).shape]}
				on_change_options={(options) => command(Commands.change_radial_gradient_shape, gradient_index(), options[0].value)}
				label="Shape">
				<For each={[
					[RadialGradientShape.circle, 'Circle'],
					[RadialGradientShape.ellipse, 'Ellipse'],
				]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Show>
		<div class={CSS.body_gradient_control_options_2_grid}>
			<Show when={array_includes([GradientType.conic, GradientType.linear], gradient().type)}>
				<NumberTextField
					label="Angle (°)"
					enterkeyhint="done"
					min={0}
					max={360}
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_gradient_angle,
						gradient_index(),
						v
					)}
					value={(gradient() as any).angle as number}
				/>
			</Show>
			<Show when={array_includes([GradientType.conic, GradientType.radial], gradient().type)}>
				<NumberTextField
					label="X (%)"
					min={0}
					enterkeyhint="done"
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_gradient_position_x,
						gradient_index(),
						v
					)}
					value={(gradient() as any).position_x as number}
				/>
				<NumberTextField
					label="Y (%)"
					enterkeyhint="done"
					min={0}
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_gradient_position_y,
						gradient_index(),
						v
					)}
					value={(gradient() as any).position_y as number}
				/>
			</Show>
			<Show when={gradient().type == GradientType.radial && (gradient() as RadialGradient).shape == RadialGradientShape.circle}>
				<NumberTextField
					label="Size (px)"
					enterkeyhint="done"
					min={0}
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_radial_gradient_size,
						gradient_index(),
						v
					)}
					value={(gradient() as RadialGradient).size_length}
				/>
			</Show>
			<Show when={gradient().type == GradientType.radial && (gradient() as RadialGradient).shape == RadialGradientShape.ellipse}>
				<NumberTextField
					label="Width (%)"
					enterkeyhint="done"
					min={0}
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_radial_gradient_width,
						gradient_index(),
						v
					)}
					value={(gradient() as RadialGradient).size_width}
				/>
				<NumberTextField
					label="Height (%)"
					enterkeyhint="done"
					min={0}
					auto_select_all
					on_input_as_number={(_, v) => command(
						Commands.change_radial_gradient_height,
						gradient_index(),
						v
					)}
					value={(gradient() as RadialGradient).size_height}
				/>
			</Show>
			<CheckBox
				checked={gradient().repeat}
				onChange={() => command(
					Commands.toggle_gradient_repeat,
					gradient_index()
				)}>
				Repeat
			</CheckBox>
		</div>
	</div>)

	const ColorStops: VoidComponent = () => (<For each={gradient().color_stop_list}>{(stop, index) =>
		<div class={CSS.body_gradient_control_stop}>
			<div>
				<NumberTextField
					label={is_conic_gradient()? "°" : "%"}
					auto_select_all
					enterkeyhint="done"
					value={stop.size * (is_conic_gradient()? 360 / 100 : 1)}
					min={0}
					max={is_conic_gradient()? 360 : 100}
					integer_only
					on_input_as_number={(_, v) => command(
						Commands.change_color_stop_length,
						gradient_index(),
						index(),
						v * (is_conic_gradient()? (100 / 360) : 1)
					)}
				/>
				<TextField
					leading={<Icon code={0xE408} filled style={{color: stop.color}}/>}
					value={convert_color_by_color_model(stop.color, settings().color_model, true)}
					enterkeyhint="done"
					onBlur={ev => {
						let value = event_current_target(ev).value
						const model = settings().color_model
						if (model == ColorModel.hsla) {
							value = string_replace(value, /[^-\d.,]+/gs, '')

							const values = string_split(value, ',')
							const h = math_clamp(number_parse(values[0] ?? '0', true), 0, 360)
							const s = math_clamp(number_parse(values[1] ?? '100', true), 0, 100)
							const l = math_clamp(number_parse(values[2] ?? '100', true), 0, 100)
							const opacity = math_round(math_clamp(number_parse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = hsl_to_hex({h: h / 360, s: s / 100, l: l / 100})

							value = string_touppercase((hex + (opacity < 0xff? string_padstart(number_to_string(opacity, 16), 2, '0') : '')))
							command(Commands.change_color_stop_color, gradient_index(), index(), value)
							change_textfield_value(event_current_target(ev), `hsla(${h}, ${s}%, ${l}%, ${math_clamp(number_parse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						if (model == ColorModel.rgba) {
							value = string_replace(value, /[^-\d.,]+/gs, '')

							const values = string_split(value, ',')
							const r = math_clamp(number_parse(values[0] ?? '0', true), 0, 0xff)
							const g = math_clamp(number_parse(values[1] ?? '100', true), 0, 0xff)
							const b = math_clamp(number_parse(values[2] ?? '100', true), 0, 0xff)
							const opacity = math_round(math_clamp(number_parse(values[3] ?? '1'), 0, 1) * 0xff)
							const hex = rgb_to_hex({r: r / 0xff, g: g / 0xff, b: b / 0xff})

							value = string_touppercase((hex + (opacity < 255? string_padstart(number_to_string(opacity, 16), 2, '0') : '')))
							command(Commands.change_color_stop_color, gradient_index(), index(), value)
							change_textfield_value(event_current_target(ev), `rgba(${r}, ${g}, ${b}, ${math_clamp(number_parse(values[3] ?? '1'), 0, 1)})`)
							return
						}

						value = string_replace(value, /[^0-9a-fA-F]+/g, '')
						if (string_length(string_trim(value)) == 0) value = '0'

						let $value: number = math_clamp(number_safe(number_parse(value, true, 16), 0), 0, 0xffffffff)

						value = '#' + string_touppercase(string_substring(string_padstart(number_to_string($value, 16), 6, '0'), 0, 8))
						command(Commands.change_color_stop_color, gradient_index(), index(), value)
						change_textfield_value(event_current_target(ev), value)
					}}
					trailing={<>
						<TextFieldButton
							data-tooltip="Pick color"
							onClick={(ev) => {
								props.on_start_pick_color(index())
								open_colorpicker(ev, props.colorpicker_ref, { color: stop.color, anchor: event_current_target(ev) })}
							}>
							<Icon code={0xE785} />
						</TextFieldButton>
						<Show when={array_length(gradient().color_stop_list) > 2}>
							<TextFieldButton
								data-tooltip="Remove color"
								onClick={() => command(Commands.remove_color_stop, gradient_index(), index())}>
								<Icon code={0xE59D} />
							</TextFieldButton>
						</Show>
					</>}
				/>
			</div>
		</div>
	}</For>)

	const Actions: VoidComponent = () => (<div class={CSS.body_gradient_control_actions}>
		<Button
			variant={ButtonVariant.filled}
			onClick={() => command(Commands.add_color_stop, gradient_index())}>
			<Icon code={0xE009} filled/>Add color stop
		</Button>
		<IconButton data-tooltip="More actions" onClick={ev => props.on_open_actions_menu(ev)} code={0xEAD7}/>
	</div>)

	return (<div class={CSS.body_gradient_control}>
		<Tooltip>
			<Control/>
			<Show when={expanded()}>
				<Options/>
				<h3>Stops</h3>
				<ColorStops/>
				<Actions/>
			</Show>
		</Tooltip>
	</div>)
}

const _: VoidComponent<{
	gradients: Gradient[]
	gradient_data: GradientData[]
	settings: Settings
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const doc = document
	const body = doc.body
	const [is_dragging, set_is_dragging] = createSignal<boolean>(false)
	const [pointer_position, set_pointer_position] = createStore<PointerPosition>({x: 0, y: 0})
	const [colorpicker_ref, set_colorpicker_ref] = createSignal<HTMLDialogElement | null>(null)
	const [selected_gradient_index, set_selected_gradient_index] = createSignal<number>(-1)
	const settings = createMemo(() => props.settings)
	let selected_colorstop_index: number = -1
	let selected_gradient_element_rect: DOMRect | null = null
	let menu_gradientactions_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function update_position(): void {
		if (selected_gradient_element_rect == null) return;

		const length = math_round(math_clamp(
			(pointer_position.x - selected_gradient_element_rect.x) / rect_width(selected_gradient_element_rect) * 100,
			0,
			100
		))
		command(Commands.change_color_stop_length, selected_gradient_index(), selected_colorstop_index, length)
	}

	function on_touch_move(ev: TouchEvent): void {
		if (!is_dragging()) return;
		set_pointer_position({x: ev.touches[0].clientX, y: ev.touches[0].clientY})
		update_position()
	}

	function on_mouse_move(ev: MouseEvent): void {
		if (!is_dragging()) return;
		set_pointer_position({x: ev.clientX, y: ev.clientY})
		update_position()
	}

	function on_pointer_up(): void {
		set_is_dragging(false)
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_listener() {
		event_add_listener<TouchEvent>(doc, 'touchmove', on_touch_move)
		event_add_listener<TouchEvent>(doc, 'touchend', on_pointer_up)
		event_add_listener<MouseEvent>(doc, 'mousemove', on_mouse_move)
		event_add_listener<MouseEvent>(doc, 'mouseup', on_pointer_up)
	}

	onMount(() => {
		init_listener()
	})

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			draggable
			disabled_action
			ref={r => set_colorpicker_ref(r)}
			on_update_color={color => command(
				Commands.change_color_stop_color,
				selected_gradient_index(),
				selected_colorstop_index,
				color
			)}
		/>
	</>)

	const Menus: VoidComponent = () => (<>
		<Menu ref={r => menu_gradientactions_ref = r}>
			<MenuItem
				icon_code={0xE51B}
				onClick={ev => {
					navigator_clipboard_writetext(gradient_to_css_text(
						props.gradients[selected_gradient_index()],
						settings().color_model,
						true
					))
					close_menu(menu_gradientactions_ref)
					open_toast(ev, toast_copied_ref)
				}}>
				Copy CSS
			</MenuItem>
			<MenuItem
				icon_code={0xE59D}
				disabled={array_length(props.gradients) <= 1}
				onClick={() => {
					close_menu(menu_gradientactions_ref)
					command(Commands.remove_gradient, selected_gradient_index())
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
					"aspect-ratio": settings().aspect_ratio,
					"border-radius": settings().border_radius + 'px',
					"background-image": array_join(
						array_map(
							props.gradients,
							gradient => gradient_to_css_text(gradient)
						),
						','
					)
				}}/>
			</div>
			<div class={CSS.body_control}>
				<div>
					<GradientDataList
						command={command}
						gradient_data={props.gradient_data}
						settings={settings()}
					/>
					<div class={CSS.body_control_shape}>
						<NumberTextField
							min={0.1}
							step={0.1}
							enterkeyhint="done"
							auto_select_all
							value={settings().aspect_ratio}
							on_input_as_number={(_, v) => command(
								Commands.change_settings_aspect_ratio,
								v
							)}
							label="Aspect ratio"
						/>
						<NumberTextField
							min={0}
							enterkeyhint="done"
							auto_select_all
							value={settings().border_radius}
							on_input_as_number={(_, v) => command(
								Commands.change_settings_border_radius,
								v
							)}
							label="Border radius (px)"
						/>
					</div>
				</div>
				<Button
					variant={ButtonVariant.filled}
					onClick={() => command(Commands.add_gradient)}>
					<Icon code={0xE007} />Add gradient
				</Button>
				<For each={props.gradients}>{(gradient, index) =>
					<GradientControl
						gradient={gradient}
						command={command}
						settings={settings()}
						colorpicker_ref={colorpicker_ref()!}
						is_dragging={is_dragging()}
						gradient_index={index()}
						pointer_position={pointer_position}
						on_start_drag={(gradientElement, pointer, colorStopIndex) => {
							selected_gradient_element_rect = element_rect(gradientElement)
							selected_colorstop_index = colorStopIndex
							set_selected_gradient_index(index())
							set_pointer_position(pointer)
							set_is_dragging(true)
							attr_set(body, BodyAttributes.no_pointer_event)
						}}
						selected_gradient_index={selected_gradient_index()}
						on_start_pick_color={(colorStopIndex) => {
							selected_colorstop_index = colorStopIndex
							set_selected_gradient_index(index())
						}}
						on_open_actions_menu={ev => {
							set_selected_gradient_index(index())
							open_menu(ev, menu_gradientactions_ref, {
								anchor: event_current_target(ev as any) as HTMLElement,
								position: MenuPosition.center_center_right_top
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