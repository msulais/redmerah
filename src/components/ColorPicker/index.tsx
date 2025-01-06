import { type Component, type ParentComponent, Show, createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import { timeout_set } from "@/utils/timeout"
import { attr_remove, attr_set, attr_set_if_exist } from "@/utils/attributes"
import { element_dispatch_event, element_focus_by_arrowkey, element_rect, element_set_tabindex, element_by_id, element_tagname, element_children, element_id, element_set_pointercapture, element_release_pointercapture } from "@/utils/element"
import { event_add_listener, event_current_target, event_prevent_default, event_remove_listener, event_target } from '@/utils/event'
import { BodyAttributes } from "@/enums/attributes"
import { math_clamp, math_round } from "@/utils/math"
import { number_is_not_defined, number_parse, number_safe, number_to_string } from "@/utils/number"
import { string_length, string_padstart, string_replace, string_split, string_substring, string_touppercase, string_trim } from "@/utils/string"
import { get_contrast_ratio, hex_to_hsl, hex_to_rgb, hsl_to_hex, hsl_to_hsv, hsl_to_rgb, hsv_to_hsl, is_color_with_alpha_valid, rgb_to_hsl } from "@/utils/color"
import { document_body } from "@/utils/document"
import { array_join, array_length, array_push } from "@/utils/array"
import { rect_height, rect_left, rect_top, rect_width } from "@/utils/rect"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from "@/constants/key_code"

import Button, { ButtonVariant } from "@/components/Button"
import TextField from "@/components/TextField"
import Modal, { type ModalProps, ModalPosition as ColorPickerPosition, type ModalOpenDetail, open_modal, close_modal, focus_modal, is_modal_open, reposition_modal } from "@/components/Modal"
import Popover, { close_popover, is_popover_open, open_popover, reposition_popover, type PopoverProps } from "@/components/Popover"
import './index.scss'

const DEFAULT_HEX_COLOR: HEXColor = '#FF0000'

enum ColorPickerEvents {
	/** @param {HEXColor} color `HEXColor` */
	changecolor = 'custom:changecolor'
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
		ColorPickerEvents.changecolor,
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
		disabled_color_control: false,
		disabled_opacity_control: false
	}, $props)
	let textfield_opacity_ref: HTMLInputElement | undefined
	let textfield_color_ref!: HTMLInputElement
	let color_ref: HTMLDivElement | undefined
	let hue_ref: HTMLDivElement | undefined
	let opacity_ref: HTMLDivElement | undefined
	let color_rect: DOMRect
	let hue_rect: DOMRect
	let opacity_rect: DOMRect
	let color_dragged: boolean = false
	let hue_dragged: boolean = false
	let opacity_dragged: boolean = false
	let color_pointer_id: number | null = null
	let hue_pointer_id: number | null = null
	let opacity_pointer_id: number | null = null
	let local_color: HEXColor | null = null
	let local_color_model: 'HEX' | 'RGB' | 'HSL' = 'HEX'
	let local_hsl: HSLColor = {h: 0, s: 1, l: 0.5}
	let [key_left_pressed, key_right_pressed, key_up_pressed, key_down_pressed] = [false, false, false, false]
	const body = document_body()
	const [color_model, set_color_model2] = createSignal<'HEX' | 'RGB' | 'HSL'>('HEX')
	const [hsl, set_hsl2] = createSignal<HSLColor>({h: 0, s: 1, l: .5})
	const [opacity, set_opacity] = createSignal<number>(1) // [0-100]
	const [hue, set_hue] = createSignal<number>(1) // [0-100]
	const [left, set_left] = createSignal<number>(1) // [0-100]
	const [top, set_top] = createSignal<number>(1) // [0-100]
	const is_disabled_opacity_control = createMemo(() => props.disabled_opacity_control)
	const is_disabled_color_control = createMemo(() => props.disabled_color_control)
	const get_hsl_color = createMemo<HSLColor>(() => {
		let h = hue() / 100
		let s = 1
		let l = 0.5
		if (!is_disabled_color_control()) {
			if (color_model() != 'HSL') {
				const hsl = hsv_to_hsl({
					h, s: left() / 100, v: (100 - top()) / 100
				})
				s = hsl.s
				l = hsl.l
			}
			else {
				s = left() / 100
				l = (100 - top()) / 100
			}
		}
		return {h, s, l}
	})
	const get_hex_color = createMemo<HEXColor>(() => {
		const $opacity: string = opacity() == 100 || is_disabled_opacity_control()
			? ''
			: string_padstart(number_to_string(math_round(opacity() / 100 * 255), 16), 2, '0')
		;
		const hex_color = string_touppercase(hsl_to_hex(get_hsl_color()) + $opacity)
		local_color = hex_color as HEXColor
		return hex_color as HEXColor
	})

	function set_hsl(hsl: HSLColor): void {
		set_hsl2({...hsl})
		local_hsl = {...hsl}
	}

	function set_color_model(model: 'HEX' | 'RGB' | 'HSL'): void {
		set_color_model2(model)
		local_color_model = model
	}

	/**
	 * @param opacity value from [0-1]
	 */
	function update_position(opacity?: number): void {
		const {h, s, l} = hsl()
		set_hue(h * 100)

		let left = s * 100
		let top = (1 - l) * 100
		if (color_model() != 'HSL') {
			const {s, v} = hsl_to_hsv(hsl())
			left = s * 100
			top = (1 - v) * 100
		}

		if (opacity) set_opacity(math_clamp(opacity, 0, 1) * 100)

		set_left(left)
		set_top(top)
	}

	function change_color_model(): void {
		const c = color_model()
		if (c == 'RGB') set_color_model('HSL')
		else if (c == 'HSL') set_color_model('HEX')
		else if (c == 'HEX') set_color_model('RGB')

		update_inputs()
		update_position()
	}

	function update_inputs(): void {
		// don't trigger input event
		if (color_model() == 'RGB') {
			const rgb = hsl_to_rgb(get_hsl_color())
			textfield_color_ref.value = `${math_round(rgb.r * 0xff)}, ${math_round(rgb.g * 0xff)}, ${math_round(rgb.b * 0xff)}`
		}
		else if (color_model() == 'HSL') textfield_color_ref.value = array_join([
			math_round(get_hsl_color().h * 360),
			math_round(get_hsl_color().s * 100) + '%',
			math_round(get_hsl_color().l * 100) + '%',
		], ', ')
		else if (color_model() == 'HEX')
			textfield_color_ref.value = string_substring(get_hex_color(), 0, 7)

		if (textfield_opacity_ref) textfield_opacity_ref.value = math_round(opacity()) + '%'
	}

	function set_position(x: number, y: number): void {
		if (color_dragged) {
			x = (x - rect_left(color_rect)) / rect_width(color_rect) * 100
			x = math_clamp(x, 0, 100)
			set_left(x)

			y = (y - rect_top(color_rect)) / rect_height(color_rect) * 100
			y = math_clamp(y, 0, 100)
			set_top(y)
		}
		else if (hue_dragged) {
			let v = is_disabled_color_control()? x : y
			let rect_offset = is_disabled_color_control()? rect_left(hue_rect) : rect_top(hue_rect)
			let rect_size = is_disabled_color_control()? rect_width(hue_rect) : rect_height(hue_rect)
			v = (v - rect_offset) / rect_size * 100
			v = math_clamp(v, 0, 100)
			set_hue(v)
		}
		else if (opacity_dragged) {
			let v = is_disabled_color_control()? x : y
			let rect_offset = is_disabled_color_control()? rect_left(opacity_rect) : rect_top(opacity_rect)
			let rect_size = is_disabled_color_control()? rect_width(opacity_rect) : rect_height(opacity_rect)
			v = (v - rect_offset) / rect_size * 100
			v = math_clamp(v, 0, 100)
			set_opacity(100 - v)
		}

		const dragged = color_dragged || hue_dragged || opacity_dragged
		if (!dragged) return

		set_hsl({...get_hsl_color()})
		update_inputs()
		if (props.is_colorpicker_open) props.on_update_color?.(get_hex_color())
	}

	function on_pointermove(ev: PointerEvent): void {
		set_position(ev.clientX, ev.clientY)
	}

	function on_pointerup(): void {
		color_dragged = hue_dragged = opacity_dragged = false

		if (color_pointer_id != null) element_release_pointercapture(color_ref!, color_pointer_id)
		if (opacity_pointer_id != null) element_release_pointercapture(opacity_ref!, opacity_pointer_id)
		if (hue_pointer_id != null) element_release_pointercapture(hue_ref!, hue_pointer_id)

		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		timeout_set(() => attr_remove(body, BodyAttributes.no_pointer_event))
	}

	function on_change_color(ev: CustomEvent<HEXColor>): void {
		const color = ev.detail
		if (!is_color_with_alpha_valid(color)) return;
		update_color(color)
	}

	function init_events() {
		event_add_listener<CustomEvent>(props.element, ColorPickerEvents.changecolor, on_change_color)
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		onCleanup(() => {
			event_remove_listener<CustomEvent>(props.element, ColorPickerEvents.changecolor, on_change_color)
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_color(color: HEXColor): void {
		if (!is_color_with_alpha_valid(color)) return;
		const hsl = hex_to_hsl(
			string_substring(color, 0, 7) as HEXColor
		)
		set_hsl({...hsl})

		if (string_length(color) == 9 && !is_disabled_opacity_control()) {
			const opacity = number_parse(string_substring(color, 7, 9), true, 16) / 255
			set_opacity(math_round(opacity * 100))
		}

		if (is_disabled_color_control()) set_hsl({ h: hsl.h, s: 1, l: 0.5 })

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

			set_hsl(hsl)
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
			set_hsl(hsl)
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
			set_hsl(hsl)
		}

		update_position()
		if (props.is_colorpicker_open) props.on_update_color?.(get_hex_color())
	}

	function on_opacity_input_change(value: string): void {
		let $opacity: number = number_parse(value)

		if (number_is_not_defined($opacity)) return

		$opacity = math_round(math_clamp($opacity, 0, 100))
		set_opacity($opacity)
		update_position()
		if (props.is_colorpicker_open) props.on_update_color?.(get_hex_color())
	}

	onMount(() => {
		init_events()
	})

	createEffect(() => {
		const $is_disabled_color_control = is_disabled_color_control()
		const $is_disabled_opacity_control = is_disabled_opacity_control()
		const color = '#FFFFFF'
		const handle_color = () => {
			if (color == local_color) return

			local_color = color
			if (!is_color_with_alpha_valid(local_color)) return

			let hsl = hex_to_hsl(local_color)
			let opacity = 100
			if ($is_disabled_color_control) {
				hsl = {h: hsl.h, s: 1, l: 0.5}
			}

			if (string_length(local_color) > 7 && !$is_disabled_opacity_control) {
				opacity = number_safe(number_parse(string_substring(local_color, 7, 9), true, 16))
				opacity = opacity / 0xff * 100
				opacity = math_clamp(opacity, 0, 100)
			}

			if (textfield_color_ref) {
				let text = ''
				if (local_color_model == 'HSL') text = array_join([
					math_round(hsl.h * 360),
					math_round(hsl.s * 100) + '%',
					math_round(hsl.l * 100) + '%',
				], ', ')
				else if (local_color_model == 'HEX') {
					text = string_touppercase(hsl_to_hex(hsl))
				}
				else if (local_color_model == 'RGB') {
					const {r, g, b} = hsl_to_rgb(hsl)
					text = array_join([
						math_round(r * 0xff),
						math_round(g * 0xff),
						math_round(b * 0xff),
					], ', ')
				}

				textfield_color_ref.value = text
			}

			if (textfield_opacity_ref) {
				textfield_opacity_ref.value = opacity + '%'
			}

			set_hue(hsl.h * 100)
			set_hsl(hsl)
			set_opacity(opacity)
		}

		const handle_disable_color_control = () => {
			if (!$is_disabled_color_control) return

			const hsl: HSLColor = {h: local_hsl.h, s: 1, l: 0.5}
			if (textfield_color_ref) {
				let text = ''
				if (local_color_model == 'HSL') text = array_join([
					math_round(hsl.h * 360),
					math_round(hsl.s * 100) + '%',
					math_round(hsl.l * 100) + '%',
				], ', ')
				else if (local_color_model == 'HEX') {
					text = string_touppercase(hsl_to_hex(hsl))
				}
				else if (local_color_model == 'RGB') {
					const {r, g, b} = hsl_to_rgb(hsl)
					text = array_join([
						math_round(r * 0xff),
						math_round(g * 0xff),
						math_round(b * 0xff),
					], ', ')
				}

				textfield_color_ref.value = text
			}

			set_hsl(hsl)
		}

		const handle_disable_opacity_control = () => {
			if (!$is_disabled_opacity_control) return

			if (textfield_opacity_ref) {
				textfield_opacity_ref.value = '100%'
			}

			set_opacity(100)
		}

		handle_color()
		handle_disable_color_control()
		handle_disable_opacity_control()
	})

	const Control: Component = () => {
		return (<div
			class="c-color-picker-control"
			data-c-hide-color={attr_set_if_exist(is_disabled_color_control())}>
			<div
				class="c-color-picker-color"
				ref={color_ref}
				style={{ '--c-color-picker-color': hsl_to_hex({...hsl(), s: 1, l: .5}) }}
				onPointerDown={(ev) => {
					const self = event_current_target(ev)
					color_pointer_id = ev.pointerId
					color_dragged = true
					color_rect = element_rect(self)
					element_set_pointercapture(self, color_pointer_id)
					set_position(ev.clientX, ev.clientY)
					attr_set(body, BodyAttributes.no_pointer_event)
				}}
				data-c-hsl={attr_set_if_exist(color_model() == 'HSL')}
				onKeyDown={(ev) => {
					const code = ev.code
					if (code == KEY_ARROW_UP) {
						key_up_pressed = true
						key_down_pressed = false
					}
					else if (code == KEY_ARROW_DOWN) {
						key_down_pressed = true
						key_up_pressed = false
					}
					else if (code == KEY_ARROW_LEFT) {
						key_left_pressed = true
						key_right_pressed = false
					}
					else if (code == KEY_ARROW_RIGHT) {
						key_right_pressed = true
						key_left_pressed = false
					}

					if (
						!key_left_pressed
						&& !key_right_pressed
						&& !key_up_pressed
						&& !key_down_pressed
					) return;


					color_dragged = true
					color_rect = element_rect(event_current_target(ev))
					const one_percent_x = rect_width(color_rect) / 100
					const one_percent_y = rect_height(color_rect) / 100
					let x = rect_left(color_rect) + (left() * one_percent_x)
					let y = rect_top(color_rect) + (top() * one_percent_y)

					if (key_up_pressed) y -= one_percent_y
					if (key_down_pressed) y += one_percent_y
					if (key_left_pressed) x -= one_percent_x
					if (key_right_pressed) x += one_percent_x

					event_prevent_default(ev)
					set_position(x, y)
				}}
				onKeyUp={(ev) => {
					const code = ev.code
					if (code == KEY_ARROW_UP) key_up_pressed = false
					if (code == KEY_ARROW_DOWN) key_down_pressed = false
					if (code == KEY_ARROW_LEFT) key_left_pressed = false
					if (code == KEY_ARROW_RIGHT) key_right_pressed = false

					if (
						!key_up_pressed
						&& !key_down_pressed
						&& !key_left_pressed
						&& !key_right_pressed
					) color_dragged = false
				}}
				draggable={false}>
				<div
					draggable={false}
					tabindex="0"
					class="c-color-picker-indicator"
					style={{
						"background-color": hsl_to_hex(hsl()),
						top: top() + '%',
						left: left() + '%',
						"border-color": get_contrast_ratio(hsl_to_rgb(get_hsl_color()), {r: 0, g: 0, b: 0}) > 50
							? '#000'
							: '#fff',
						transform: 'translate(-12px, -12px)',
					}}
				/>
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
						ref={hue_ref}
						onPointerDown={(ev) => {
							const self = event_current_target(ev)
							hue_dragged = true
							hue_rect = element_rect(self)
							hue_pointer_id = ev.pointerId
							element_set_pointercapture(self, hue_pointer_id)
							set_position(ev.clientX, ev.clientY)
							attr_set(body, BodyAttributes.no_pointer_event)
						}}
						onKeyDown={(ev) => {
							const code = ev.code
							const is_arrow_key = (is_disabled_color_control()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)

							if (!is_arrow_key) return;

							hue_dragged = true
							hue_rect = element_rect(event_current_target(ev))
							const one_percent_x = rect_width(hue_rect) / 100
							const one_percent_y = rect_height(hue_rect) / 100
							let x = rect_left(hue_rect) + (hue() * one_percent_x)
							let y = rect_top(hue_rect) + (hue() * one_percent_y)

							if (code == KEY_ARROW_UP) y -= one_percent_y
							else if (code == KEY_ARROW_DOWN) y += one_percent_y
							else if (code == KEY_ARROW_LEFT) x -= one_percent_x
							else if (code == KEY_ARROW_RIGHT) x += one_percent_x

							event_prevent_default(ev)
							set_position(x, y)
						}}
						onKeyUp={(ev) => {
							const code = ev.code
							const is_arrow_key = (is_disabled_color_control()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)
							if (is_arrow_key) hue_dragged = false
						}}
						draggable={false}>
						<div
							tabindex="0"
							draggable={false}
							class="c-color-picker-indicator"
							style={{
								"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
								top: is_disabled_color_control()? undefined : hue() + '%',
								left: is_disabled_color_control()? hue() + '%' : undefined,
								"border-color": get_contrast_ratio(hsl_to_rgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
									? '#000'
									: '#fff',
								transform: is_disabled_color_control()? 'translate(-50%, -4px)' : 'translate(-4px, -50%)'
							}}
						/>
					</div>
					<div
						class="c-color-picker-opacity"
						ref={opacity_ref}
						onPointerDown={(ev) => {
							const self = event_current_target(ev)
							opacity_dragged = true
							opacity_rect = element_rect(self)
							opacity_pointer_id = ev.pointerId
							element_set_pointercapture(self, opacity_pointer_id)
							set_position(ev.clientX, ev.clientY)
							attr_set(body, BodyAttributes.no_pointer_event)
						}}
						onKeyDown={(ev) => {
							const code = ev.code
							const is_arrow_key = (is_disabled_color_control()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)

							if (!is_arrow_key) return;

							opacity_dragged = true
							opacity_rect = element_rect(event_current_target(ev))
							const one_percent_x = rect_width(opacity_rect) / 100
							const one_percent_y = rect_height(opacity_rect) / 100
							let x = rect_left(opacity_rect) + ((100 - opacity()) * one_percent_x)
							let y = rect_top(opacity_rect) + ((100 - opacity()) * one_percent_y)

							if (code == KEY_ARROW_UP) y -= one_percent_y
							else if (code == KEY_ARROW_DOWN) y += one_percent_y
							else if (code == KEY_ARROW_LEFT) x -= one_percent_x
							else if (code == KEY_ARROW_RIGHT) x += one_percent_x

							event_prevent_default(ev)
							set_position(x, y)
						}}
						onKeyUp={(ev) => {
							const code = ev.code
							const is_arrow_key = (is_disabled_color_control()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)
							if (is_arrow_key) opacity_dragged = false
						}}
						draggable={false}>
						<div
							tabindex="0"
							draggable={false}
							class="c-color-picker-indicator"
							style={{
								"background-color": `hsla(0, 0%, ${opacity()}%)`,
								top: is_disabled_color_control()? undefined : (100 - opacity()) + '%',
								left: is_disabled_color_control()? (100 - opacity()) + '%' : undefined,
								"border-color": get_contrast_ratio(hsl_to_rgb({h: 0, s: 0, l: opacity() / 100}), {r: 0, g: 0, b: 0}) > 50
									? '#000'
									: '#fff',
								transform: is_disabled_color_control()? 'translate(-50%, -4px)' : 'translate(-4px, -50%)'
							}}
						/>
					</div>
				</div>
			</div>
		</div>)
	}

	const Input: Component = () => {
		return (<div
			class="c-color-picker-input"
			data-c-hide-opacity={attr_set_if_exist(is_disabled_opacity_control())}
			onFocusOut={() => update_inputs()}>
			<TextField
				ref={r => textfield_color_ref = r}
				onInput={(ev) => on_color_input_change(event_current_target(ev).value)}
				label={color_model() == 'RGB' ? 'RGB' : color_model() == 'HEX' ? 'Hex' : 'HSL'}
				placeholder={color_model() == 'RGB' ? "0-255, 0-255, 0-255" : color_model() == 'HEX' ? '#FF0000' : '0-360, 0-100%, 0-100%'}
			/>
			<TextField
				onInput={(ev) => on_opacity_input_change(event_current_target(ev).value)}
				ref={r => textfield_opacity_ref = r}
				label="Opacity"
				value="100%"
				placeholder="0-100%"
			/>
		</div>)
	}

	const Actions: Component = () => {
		const button_colormodel_id = createUniqueId()
		const button_cancel_id = createUniqueId()
		const button_select_id = createUniqueId()

		createEffect(() => {
			props.disabled_action
			element_set_tabindex(element_by_id(button_colormodel_id)!, 0)
		})

		return (<div
			class="c-color-picker-actions"
			onKeyDown={(ev) => element_focus_by_arrowkey(
				event_current_target(ev),
				ev.code,
				{ right: 'next', left: 'prev' }
			)}
			data-c-disabled={attr_set_if_exist(props.disabled_action)}
			onClick={(ev) => {
				const button = event_target(ev) as HTMLElement
				if (element_tagname(button) != 'BUTTON') return;

				const children = element_children(event_current_target(ev))
				element_set_tabindex(button, 0)
				for (const child of children) {
					if (element_id(child) == element_id(button)) continue

					element_set_tabindex(child, -1)
				}

				switch (element_id(button)) {
					case button_colormodel_id:
						change_color_model()
						break
					case button_cancel_id:
						update_color(props.color)
						props.on_close()
						break
					case button_select_id:
						props.on_select_color?.(get_hex_color() as HEXColor)
						props.on_close()
						break
				}
			}}>
			<Button
				tabindex="0"
				id={button_colormodel_id}
				variant={ButtonVariant.tonal}>
				{color_model()}
			</Button>
			<Show when={!props.disabled_action}>
				<Button
					tabindex="-1"
					id={button_cancel_id}
					variant={ButtonVariant.tonal}>
					Cancel
				</Button>
				<Button
					tabindex="-1"
					id={button_select_id}
					variant={ButtonVariant.filled}>
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