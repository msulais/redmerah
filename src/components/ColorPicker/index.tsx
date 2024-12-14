import { type Component, type ParentComponent, Show, createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { createStore } from "solid-js/store"
import { mergeRefs } from "@solid-primitives/refs"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import { timeout_set } from "@/utils/timeout"
import { attr_remove, attr_set, attr_set_if_exist } from "@/utils/attributes"
import { element_dispatch_event, element_rect } from "@/utils/element"
import { event_add_listener, event_remove_listener } from '@/utils/event'
import { BodyAttributes } from "@/enums/attributes"
import { math_clamp, math_max, math_min, math_round } from "@/utils/math"
import { number_is_not_defined, number_parse, number_safe, number_to_string, number_tofixed } from "@/utils/number"
import { string_length, string_padstart, string_replace, string_split, string_substring, string_touppercase, string_trim } from "@/utils/string"
import { hex_to_hsl, hex_to_rgb, hsl_to_hex, hsl_to_hsv, hsl_to_rgb, hsv_to_hsl, is_color_with_alpha_valid, rgb_to_hsl } from "@/utils/color"
import { array_join, array_length, array_push } from "@/utils/array"
import { rect_left, rect_top } from "@/utils/rect"

import Button, { ButtonVariant } from "@/components/Button"
import TextField from "@/components/TextField"
import Modal, { type ModalProps, ModalPosition as ColorPickerPosition, type ModalOpenDetail, open_modal, close_modal, focus_modal, is_modal_open, reposition_modal } from "@/components/Modal"
import Popover, { close_popover, is_popover_open, open_popover, reposition_popover, type PopoverProps } from "@/components/Popover"
import './index.scss'

const COLOR_BOX_WIDTH: number = 260
const COLOR_BOX_HEIGHT: number = 200
const DEFAULT_HEX_COLOR: HEXColor = '#FF0000'

enum ColorPickerEvents {
	/** @param {HEXColor} color `HEXColor` */
	on_change_color = 'on-change-color'
}

function open_colorpicker(
	event: Event,
	color_picker: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) change_colorpicker_value(color_picker, options.color)

	open_modal(event, color_picker, options)
}

function open_popovercolorpicker(
	event: Event,
	color_picker: HTMLDivElement,
	options?: Omit<ModalOpenDetail, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) change_colorpicker_value(color_picker, options.color)

	open_popover(event, color_picker, options)
}

function change_colorpicker_value(
	color_picker: HTMLElement,
	color: HEXColor
): void {
	element_dispatch_event(color_picker, new CustomEvent(
		ColorPickerEvents.on_change_color,
		{ detail: color }
	))
}

const ColorPickerBody: ParentComponent<{
	color?: HEXColor
	element: HTMLElement
	disabled_opacity_control?: boolean
	disabled_color_control?: boolean
	disabled_action?: boolean
	is_colorpicker_open: boolean
	on_update_color?(color: HEXColor): unknown
	on_select_color?(color: HEXColor): unknown
	on_close(): unknown
}> = $props => {
	const props = mergeProps({
		color: DEFAULT_HEX_COLOR,
		disabled_color_control: false
	}, $props)
	type Picker = {
		color: {
			rect: DOMRect | null
			is_drag: boolean
			position: {
				/** `0 -> COLOR_BOX_HEIGHT` */
				top: number

				/** `0 -> COLOR_BOX_WIDTH` */
				left: number
			}
		}
		hue: {
			rect: DOMRect | null
			is_drag: boolean

			/** `0 -> slider` */
			position: number
		}
		opacity: {
			rect: DOMRect | null
			is_drag: boolean

			/** `0 -> slider` */
			position: number
		}
	}
	const body = document.body
	const [color_model, set_color_model] = createSignal<'HEX' | 'RGB' | 'HSL'>('HEX')
	const [hsl_color, set_hsl_color] = createSignal<HSLColor>({ h: 0, s: 1, l: 0.5 })
	const [hex_color, set_hex_color] = createSignal<HEXColor>(DEFAULT_HEX_COLOR)
	const [opacity, set_opacity] = createSignal<number>(100) // 0 - 100
	const [color, set_color] = createSignal<HEXColor>(DEFAULT_HEX_COLOR)
	const [is_disabled_color_control, set_is_disabled_color_control] = createSignal<boolean>(false)
	const [picker, set_picker] = createStore<Picker>({
		color: { rect: null, is_drag: false, position: { left: COLOR_BOX_WIDTH, top: 0 } },
		hue: { rect: null, is_drag: false, position: 0 },
		opacity: { rect: null, is_drag: false, position: 0 }
	})
	const is_disabled_opacity_control = createMemo(() => props.disabled_opacity_control)
	const get_hex_color = createMemo(() => {
		const $opacity: string = opacity() == 100 || is_disabled_opacity_control()
			? ''
			: string_padstart(number_to_string(math_round(opacity() / 100 * 255), 16), 2, '0')
		;
		const hex_color = string_touppercase(hsl_to_hex(hsl_color()) + $opacity)
		if (props.is_colorpicker_open) props.on_update_color?.(hex_color as HEXColor)
		return hex_color
	})
	const get_slider_size = createMemo<number>(() => is_disabled_color_control()? 260 : 144)
	const get_hex_color_for_canvas = createMemo(() => hsl_to_hex({ h: hsl_color().h, s: 1, l: 0.5 }))
	let textfield_opacity_ref: HTMLInputElement | undefined
	let textfield_color_ref!: HTMLInputElement

	function update_position(): void {
		set_picker('hue', 'position', hsl_color().h * get_slider_size())
		set_picker('opacity', 'position', (1 - opacity() / 100) * get_slider_size())

		if (color_model() == 'HSL') return set_picker('color', 'position', {
			left: COLOR_BOX_WIDTH * hsl_color().s,
			top: COLOR_BOX_HEIGHT * (1 - hsl_color().l)
		})

		const hsv = hsl_to_hsv(hsl_color())
		set_picker('color', 'position', {
			left: COLOR_BOX_WIDTH * hsv.s,
			top: COLOR_BOX_HEIGHT * (1 - hsv.v)
		})
	}

	function change_color_model(): void {
		const c = color_model()
		if (c == 'RGB') set_color_model('HSL')
		else if (c == 'HSL') set_color_model('HEX')
		else if (c == 'HEX') set_color_model('RGB')

		update_inputs()
		update_position()
	}

	function update_inputs(on_before_update?: () => unknown): void {
		on_before_update?.()

		// don't trigger input event
		if (color_model() == 'RGB') {
			const rgb = hsl_to_rgb(hsl_color())
			textfield_color_ref.value = `${math_round(rgb.r * 0xff)}, ${math_round(rgb.g * 0xff)}, ${math_round(rgb.b * 0xff)}`
		}
		else if (color_model() == 'HSL') textfield_color_ref.value = array_join([
			math_round(hsl_color().h * 360),
			number_parse(number_tofixed(hsl_color().s * 100, 2)) + '%',
			number_parse(number_tofixed(hsl_color().l * 100, 2)) + '%'
		], ', ')
		else if (color_model() == 'HEX')
			textfield_color_ref.value = string_substring(get_hex_color(), 0, 7)

		if (textfield_opacity_ref) textfield_opacity_ref.value = opacity() + '%'
	}

	function set_position(x: number, y: number): void {
		const picker_color = picker.color
		const picker_hue = picker.hue
		const picker_opacity = picker.opacity

		if (picker_color.is_drag) set_picker('color', 'position', {
			left: math_clamp(x - rect_left(picker_color.rect!), 0, COLOR_BOX_WIDTH),
			top: math_clamp(y - rect_top(picker_color.rect!), 0, COLOR_BOX_HEIGHT)
		})
		else if (picker_hue.is_drag) set_picker('hue', 'position', math_clamp(
			is_disabled_color_control()
				? x - rect_left(picker_hue.rect!)
				: y - rect_top(picker_hue.rect!),
			0,
			get_slider_size()
		))
		else if (picker_opacity.is_drag) set_picker('opacity', 'position', math_clamp(
			is_disabled_color_control()
				? x - rect_left(picker_opacity.rect!)
				: y - rect_top(picker_opacity.rect!),
			0,
			get_slider_size()
		))

		const is_dragging = picker_color.is_drag || picker_hue.is_drag || picker_opacity.is_drag
		if (!is_dragging) return

		update_inputs(() => {
			const hsl: HSLColor = {
				h: picker_hue.position / get_slider_size(),
				s: picker_color.position.left / COLOR_BOX_WIDTH,
				l: 1 - picker_color.position.top / COLOR_BOX_HEIGHT
			}

			if (color_model() != 'HSL') {
				const _hsl: HSLColor = hsv_to_hsl({
					h: hsl.h,
					s: hsl.s,
					v: hsl.l
				})

				hsl.s = _hsl.s
				hsl.l = _hsl.l
			}

			set_hsl_color(hsl)
			set_opacity(math_round(100 - (picker_opacity.position / get_slider_size() * 100)))
		})
	}

	function on_pointermove(ev: PointerEvent): void {
		set_position(ev.clientX, ev.clientY)
	}

	function on_pointerup(): void {
		set_picker('color', 'is_drag', false)
		set_picker('hue', 'is_drag', false)
		set_picker('opacity', 'is_drag', false)

		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		timeout_set(() => attr_remove(body, BodyAttributes.no_pointer_event))
	}

	function on_change_color(ev: CustomEvent<HEXColor>): void {
		const color = ev.detail
		if (!is_color_with_alpha_valid(color)) return;
		set_color(color)
		set_hex_color(color)
		update_color()
	}

	function init_events() {
		event_add_listener<CustomEvent>(props.element, ColorPickerEvents.on_change_color, on_change_color)
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		onCleanup(() => {
			event_remove_listener<CustomEvent>(props.element, ColorPickerEvents.on_change_color, on_change_color)
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_color(): void {
		if (!is_color_with_alpha_valid(hex_color())) return;
		set_hsl_color(hex_to_hsl(
			string_substring(hex_color(), 0, 7) as HEXColor
		))

		if (string_length(hex_color()) == 9 && !is_disabled_opacity_control()) {
			const opacity = number_parse(string_substring(hex_color(), 7, 9), true, 16) / 255
			set_opacity(math_round(opacity * 100))
		}

		if (is_disabled_color_control()) set_hsl_color({ ...hsl_color(), s: 1, l: 0.5 })

		update_inputs()
		update_position()
	}

	function on_color_input_change(value: string): void {
		if (color_model() == 'RGB') {
			const rgb: RGBColor = { r: 0, g: 0, b: 0 }
			const rgb_array: string[] = string_split(string_replace(value, /[^0-9,.]/g, ''), ',')
			while (array_length(rgb_array) < 3) array_push(rgb_array, '0')

			const parse = (value: string | number): number => {
				value = number_parse(`${value}`, true)
				value = number_safe(value, 0)
				value = math_clamp(value, 0, 255)
				value = value / 0xff
				return value as number
			}

			rgb.r = parse(rgb_array[0])
			rgb.g = parse(rgb_array[1])
			rgb.b = parse(rgb_array[2])

			const hsl = rgb_to_hsl(rgb)
			if (is_disabled_color_control()) {
				hsl.s = 1
				hsl.l = 0.5
			}

			set_hsl_color(hsl)
		}
		else if (color_model() == 'HSL') {
			const hsl: HSLColor = { h: 0, s: 0, l: 0 }
			const hsl_array: string[] = string_split(string_replace(value, /[^0-9,.]/g, ''), ',')
			while (array_length(hsl_array) < 3) array_push(hsl_array, "0")

			let $value: number = number_parse(hsl_array[0])
			$value = number_safe($value, 0)
			$value = math_clamp($value, 0, 360)

			hsl.h = $value / 360

			$value = number_parse(hsl_array[1])
			$value = number_safe($value, 0)
			$value = math_clamp($value, 0, 100)

			hsl.s = $value / 100

			$value = number_parse(hsl_array[2])
			$value = number_safe($value, 0)
			$value = math_clamp($value, 0, 100)

			hsl.l = $value / 100

			if (is_disabled_color_control()) {
				hsl.s = 1
				hsl.l = 0.5
			}
			set_hsl_color(hsl)
		}
		else if (color_model() == 'HEX') {
			value = string_replace(value, /[^0-9a-fA-F]/g, '')
			if (string_length(string_trim(value)) == 0) value = '0'

			const $value: number = math_clamp(
				number_safe(number_parse(value, true, 16), 0),
				0,
				0xffffff
			)

			value = string_substring(
				string_padstart(`${number_to_string($value, 16)}`, 6, '0'),
				0, 6
			)

			const hsl = rgb_to_hsl(hex_to_rgb(('#' + value) as HEXColor))
			if (is_disabled_color_control()) {
				hsl.s = 1
				hsl.l = 0.5
			}
			set_hsl_color(hsl)
		}

		update_position()
	}

	function on_opacity_input_change(value: string): void {
		let $opacity: number = number_parse(value)

		if (number_is_not_defined($opacity)) return

		$opacity = math_clamp($opacity, 0, 100)
		set_opacity($opacity)
		update_position()
	}

	onMount(() => {
		init_events()
	})

	createEffect(() => {
		const $is_disabled_color_control = props.disabled_color_control
		const $$is_disabled_color_control = is_disabled_color_control()
		const $hex_color = hex_color()
		const $color = props.color
		const $$color = color()

		if ($is_disabled_color_control != $$is_disabled_color_control) {
			let color = hsl_to_hex({ ...hex_to_hsl($hex_color), l: 1.0 })
			set_hex_color(color)
			update_color()
			set_is_disabled_color_control($is_disabled_color_control)
		}
		if ($color != $$color) {
			if (!is_color_with_alpha_valid($color)) return;
			set_color($color)
			set_hex_color($color)
			update_color()
		}
	})

	const Control: Component = () => {
		return (<div
			class="c-color-picker-control"
			data-c-hide-color={attr_set_if_exist(is_disabled_color_control())}>
			<div
				class="c-color-picker-color"
				style={{ '--c-color-picker-color': get_hex_color_for_canvas() }}
				onPointerDown={(ev) => {
					set_picker('color', 'is_drag', true)
					set_picker('color', 'rect', element_rect(ev.currentTarget))
					attr_set(body, BodyAttributes.no_pointer_event)
					set_position(ev.clientX, ev.clientY)
				}}
				data-c-hsl={attr_set_if_exist(color_model() == 'HSL')}
				draggable={false}>
				<div draggable={false} style={{
					top: math_clamp(picker.color.position.top - 10, -4, 184) + 'px',
					left: math_clamp(picker.color.position.left - 10, -4, 244) + 'px'
				}} />
			</div>
			<div>
				<div
					data-c-hide-color={attr_set_if_exist(is_disabled_color_control())}
					data-c-hide-opacity={attr_set_if_exist(is_disabled_opacity_control())}
					class="c-color-picker-selected-color"
					style={{ 'background-color': get_hex_color() }}
				/>
				<div
					class="c-color-picker-range"
					data-c-hide-color={attr_set_if_exist(is_disabled_color_control())}
					data-c-hide-opacity={attr_set_if_exist(is_disabled_opacity_control())}>
					<div
						class="c-color-picker-hue"
						onClick={(ev) => {
							const rect = picker.hue.rect
							if (!rect) throw Error()

							set_picker('hue', 'position', math_max(math_min(is_disabled_color_control()
								? ev.clientX - rect_left(rect!)
								: ev.clientY - rect_top(rect!),
								get_slider_size()), 0))
						}}
						onPointerDown={(ev) => {
							set_picker('hue', 'is_drag', true)
							set_picker('hue', 'rect', element_rect(ev.currentTarget))
							attr_set(body, BodyAttributes.no_pointer_event)
							set_position(ev.clientX, ev.clientY)
						}}
						draggable={false}>
						<div draggable={false} style={{
							top: (is_disabled_color_control()? -4 : math_clamp(picker.hue.position - 10, -4, 128)) + 'px',
							left: (is_disabled_color_control()? math_clamp(picker.hue.position - 10, -4, 244) : -4) + 'px'
						}} />
					</div>
					<div
						class="c-color-picker-opacity"
						onClick={(ev) => {
							const rect = picker.opacity.rect
							if (!rect) throw Error()

							set_picker('opacity', 'position', math_clamp(
								is_disabled_color_control()
									? ev.clientX - rect_left(rect)
									: ev.clientY - rect_top(rect),
								0,
								get_slider_size()
							))
						}}
						onPointerDown={(ev) => {
							set_picker('opacity', 'is_drag', true)
							set_picker('opacity', 'rect', element_rect(ev.currentTarget))
							attr_set(body, BodyAttributes.no_pointer_event)
							set_position(ev.clientX, ev.clientY)
						}}
						draggable={false}>
						<div draggable={false} style={{
							top: (is_disabled_color_control()? -4 : math_clamp(picker.opacity.position - 10, -4, 128)) + 'px',
							left: (is_disabled_color_control()? math_clamp(picker.opacity.position - 10, -4, 244) : -4) + 'px',
						}} />
					</div>
				</div>
			</div>
		</div>)
	}

	const Input: Component = () => {
		return (<div
			class="c-color-picker-input"
			data-c-hide-opacity={attr_set_if_exist(is_disabled_opacity_control())}>
			<TextField
				ref={r => textfield_color_ref = r}
				onInput={(ev) => on_color_input_change(ev.currentTarget.value)}
				onBlur={() => update_inputs()}
				label={color_model() == 'RGB' ? 'RGB' : color_model() == 'HEX' ? 'Hex' : 'HSL'}
				placeholder={color_model() == 'RGB' ? "0-255, 0-255, 0-255" : color_model() == 'HEX' ? '#FF0000' : '0-360, 0-100%, 0-100%'}
			/>
			<TextField
				onInput={(ev) => on_opacity_input_change(ev.currentTarget.value)}
				onBlur={() => update_inputs()}
				ref={r => textfield_opacity_ref = r}
				label="Opacity"
				value="100%"
				placeholder="0-100%"
			/>
		</div>)
	}

	const Actions: Component = () => {
		return (<div class="c-color-picker-actions" data-c-disabled={attr_set_if_exist(props.disabled_action)}>
			<Button onClick={change_color_model} variant={ButtonVariant.tonal}>{color_model()}</Button>
			<Show when={!props.disabled_action}>
				<Button
					variant={ButtonVariant.tonal}
					onClick={() => {
						set_hex_color(color())
						update_color()
						props.on_close()
					}}>
					Cancel
				</Button>
				<Button
					variant={ButtonVariant.filled}
					onClick={() => {
						props.on_select_color?.(get_hex_color() as HEXColor)
						props.on_close()
					}}>
					Select
				</Button>
			</Show>
		</div>)
	}

	return (<>
		<Control />
		<Input />
		<div class="c-color-picker-content">{props.children}</div>
		<Actions />
	</>)
}

type ColorPickerProps = ModalProps & {
	color?: HEXColor
	disabled_opacity_control?: boolean
	disabled_color_control?: boolean
	disabled_action?: boolean
	on_update_color?(color: HEXColor): unknown
	on_select_color?(color: HEXColor): unknown
}
const ColorPicker: ParentComponent<ColorPickerProps> = ($props) => {
	const $$props = mergeProps({
		color: DEFAULT_HEX_COLOR,
		disabled_color_control: false
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'disabled_opacity_control', 'on_select_color',
		'disabled_color_control', 'ref', 'classList', 'color',
		'on_update_color', 'disabled_action', 'on_toggle_open'
	])
	const [colorpicker_ref, set_colorpicker_ref] = createSignal<HTMLDialogElement | null>(null)
	const [is_colorpicker_open, set_is_colorpicker_open] = createSignal<boolean>(false)

	return (<Modal
		ref={mergeRefs(props.ref, r => set_colorpicker_ref(r))}
		on_toggle_open={o => {
			set_is_colorpicker_open(o)
			props.on_toggle_open?.(o)
		}}
		classList={{
			'c-color-picker': true,
			...props.classList
		}}
		{...other}>
		<Show when={colorpicker_ref() != null}>
			<ColorPickerBody
				element={colorpicker_ref()!}
				is_colorpicker_open={is_colorpicker_open()}
				on_close={() => close_modal(colorpicker_ref()!)}
				color={props.color}
				disabled_action={props.disabled_action}
				disabled_color_control={props.disabled_color_control}
				disabled_opacity_control={props.disabled_opacity_control}
				on_select_color={props.on_select_color}
				on_update_color={props.on_update_color}>
				{props.children}
			</ColorPickerBody>
		</Show>
	</Modal>)
}

type PopoverColorPickerProps = PopoverProps & {
	color?: HEXColor
	disabled_opacity_control?: boolean
	disabled_color_control?: boolean
	disabled_action?: boolean
	on_update_color?(color: HEXColor): unknown
	on_select_color?(color: HEXColor): unknown
}
const PopoverColorPicker: ParentComponent<PopoverColorPickerProps> = ($props) => {
	const $$props = mergeProps({
		color: DEFAULT_HEX_COLOR,
		disabled_color_control: false
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'disabled_opacity_control', 'on_select_color',
		'disabled_color_control', 'ref', 'classList', 'color',
		'on_update_color', 'disabled_action', 'on_toggle_open'
	])
	const [colorpicker_ref, set_colorpicker_ref] = createSignal<HTMLDivElement | null>(null)
	const [is_colorpicker_open, set_is_colorpicker_open] = createSignal<boolean>(false)

	return (<Popover
		ref={mergeRefs(props.ref, r => set_colorpicker_ref(r))}
		on_toggle_open={o => {
			set_is_colorpicker_open(o)
			props.on_toggle_open?.(o)
		}}
		classList={{
			'c-color-picker': true,
			...props.classList
		}}
		{...other}>
		<Show when={colorpicker_ref() != null}>
			<ColorPickerBody
				element={colorpicker_ref()!}
				is_colorpicker_open={is_colorpicker_open()}
				on_close={() => close_popover(colorpicker_ref()!)}
				color={props.color}
				disabled_action={props.disabled_action}
				disabled_color_control={props.disabled_color_control}
				disabled_opacity_control={props.disabled_opacity_control}
				on_select_color={props.on_select_color}
				on_update_color={props.on_update_color}>
				{props.children}
			</ColorPickerBody>
		</Show>
	</Popover>)
}

export {
	ColorPicker,
	PopoverColorPicker,
	change_colorpicker_value,
	change_colorpicker_value as change_popovercolorpicker_value,
	open_colorpicker,
	open_popovercolorpicker,
	is_modal_open as is_colorpicker_open,
	focus_modal as focus_colorpicker,
	close_modal as close_colorpicker,
	reposition_modal as reposition_colorpicker,
	is_popover_open as is_popovercolorpicker_open,
	close_popover as close_popovercolorpicker,
	reposition_popover as reposition_popovercolorpicker,
	ColorPickerPosition,
	ColorPickerPosition as PopoverColorPickerPosition,
	ColorPickerEvents
}
export type {
	ColorPickerProps,
	PopoverColorPickerProps,
}
export default ColorPicker