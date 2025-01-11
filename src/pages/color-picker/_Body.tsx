import { createMemo, createSignal as createSignal, createEffect, Match, Switch, type VoidComponent, createUniqueId } from "solid-js"

import type { HEXColor, HSLColor } from "@/types/color"
import type { Settings } from "./_types"
import { ColorPickerMode, Commands } from "./_enums"
import { ImagePicker, PalettePicker, RectangleHSLPicker, RectanglePicker, SliderCMYKPicker, SliderHEXPicker, SliderHSLPicker, SliderHSVPicker, SliderHWBPicker, SliderRGBPicker, SpectrumPicker, WheelPicker } from "./_Pickers"
import { string_length, string_padstart, string_replace, string_split, string_substring, string_touppercase, string_trim } from "@/utils/string"
import { cmyk_to_hsl, hex_to_hsl, hsl_to_cmyk, hsl_to_hex, hsl_to_hsv, hsl_to_hwb, hsl_to_rgb, hsv_to_hsl, hwb_to_hsl, rgb_to_hsl } from "@/utils/color"
import { math_clamp, math_round } from "@/utils/math"
import { array_join, array_length, array_map, array_push } from "@/utils/array"
import { number_parse, number_safe } from "@/utils/number"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { event_current_target, event_target } from "@/utils/event"
import { element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { document_active } from "@/utils/document"
import { promise_done } from "@/utils/object"

import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField, { TextFieldButton } from "@/components/TextField"
import Toast, { open_toast } from "@/components/Toast"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'

const ColorPicker: VoidComponent<{
	command(type: Commands, ...args: unknown[]): unknown
	settings: Settings
	input: HSLColor
}> = (props) => {
	const settings = createMemo(() => props.settings)
	const input = createMemo(() => props.input)

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function is_mode(mode: ColorPickerMode): boolean {
		return settings().mode == mode
	}

	return (<div class={CSS.color_picker}>
		<Dropdown
			c_label="Picker mode"
			c_text="Select picker mode"
			c_values={[settings().mode]}
			style={{"min-width": '100%'}}
			c_on_change={(values) => command(Commands.change_mode, values[0].value as ColorPickerMode)}>
			<DropdownOption c_text="Image" c_value={ColorPickerMode.image}/>
			<DropdownOption c_text="Rectangle" c_value={ColorPickerMode.rectangle}/>
			<DropdownOption c_text="Rectangle HSL" c_value={ColorPickerMode.rectangle_hsl}/>
			{/* <DropdownOption text="Palette" value={ColorPickerMode.palette}/> */}
			<DropdownOption c_text="Spectrum (Beta release)" c_value={ColorPickerMode.spectrum}/>
			{/* <DropdownOption text="Wheel" value={ColorPickerMode.wheel}/> */}
			<DropdownOption c_text="Slider RGB" c_value={ColorPickerMode.slider_rgb}/>
			<DropdownOption c_text="Slider HSL" c_value={ColorPickerMode.slider_hsl}/>
			<DropdownOption c_text="Slider CMYK" c_value={ColorPickerMode.slider_cmyk}/>
			<DropdownOption c_text="Slider HEX" c_value={ColorPickerMode.slider_hex}/>
			<DropdownOption c_text="Slider HSV" c_value={ColorPickerMode.slider_hsv}/>
			<DropdownOption c_text="Slider HWB" c_value={ColorPickerMode.slider_hwb}/>
		</Dropdown>
		<Switch>
			<Match when={is_mode(ColorPickerMode.image)}><ImagePicker command={command} /></Match>
			<Match when={is_mode(ColorPickerMode.rectangle)}><RectanglePicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.rectangle_hsl)}><RectangleHSLPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.palette)}><PalettePicker /></Match>
			<Match when={is_mode(ColorPickerMode.spectrum)}><SpectrumPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.wheel)}><WheelPicker /></Match>
			<Match when={is_mode(ColorPickerMode.slider_rgb)}><SliderRGBPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.slider_hsl)}><SliderHSLPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.slider_cmyk)}><SliderCMYKPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.slider_hex)}><SliderHEXPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.slider_hsv)}><SliderHSVPicker command={command} input={input()} /></Match>
			<Match when={is_mode(ColorPickerMode.slider_hwb)}><SliderHWBPicker command={command} input={input()} /></Match>
		</Switch>
	</div>)
}

const ColorInput: VoidComponent<{
	input: HSLColor
	settings: Settings
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const input = createMemo(() => props.input)
	const settings = createMemo(() => props.settings)
	const read_only = createMemo(() => {
		const mode = settings().mode
		return mode == ColorPickerMode.palette || mode == ColorPickerMode.image
	})
	const get_hex_color = createMemo(() => string_touppercase(hsl_to_hex(input())))
	const get_rgb_color = createMemo(() => {
		const {r, g, b} = hsl_to_rgb(input())
		return array_join([
			math_round(r * 0xff),
			math_round(g * 0xff),
			math_round(b * 0xff)
		], ', ')
	})
	const get_hsl_color = createMemo(() => {
		const {h, s, l} = input()
		return `${math_round(h * 360)}°, ${math_round(s * 100)}%, ${math_round(l * 100)}%`
	})
	const get_hsv_color = createMemo(() => {
		const {h, s, v} = hsl_to_hsv(input())
		return `${math_round(h * 360)}°, ${math_round(s * 100)}%, ${math_round(v * 100)}%`
	})
	const get_hwb_color = createMemo(() => {
		const {h, w, b} = hsl_to_hwb(input())
		return `${math_round(h * 360)}°, ${math_round(w * 100)}%, ${math_round(b * 100)}%`
	})
	const get_cmyk_color = createMemo(() => {
		const {c, m, y, k} = hsl_to_cmyk(input())
		return `${math_round(c * 100)}%, ${math_round(m * 100)}%, ${math_round(y * 100)}%, ${math_round(k * 100)}%`
	})
	const [hex_color, set_hex_color] = createSignal<string>('#000000')
	const [rgb_color, set_rgb_color] = createSignal<string>('0, 0, 0')
	const [hsl_color, set_hsl_color] = createSignal<string>('0°, 0%, 0%')
	const [hsv_color, set_hsv_color] = createSignal<string>('0°, 0%, 0%')
	const [hwb_color, set_hwb_color] = createSignal<string>('0°, 0%, 0%')
	const [cmyk_color, set_cmyk_color] = createSignal<string>('0%, 0%, 0%, 0%')
	const input_hex_id = createUniqueId()
	const input_rgb_id = createUniqueId()
	const input_hsl_id = createUniqueId()
	const input_hsv_id = createUniqueId()
	const input_hwb_id = createUniqueId()
	const input_cmyk_id = createUniqueId()
	let is_hex_color_focus = false
	let is_rgb_color_focus = false
	let is_hsl_color_focus = false
	let is_hsv_color_focus = false
	let is_hwb_color_focus = false
	let is_cmyk_color_focus = false
	let toast_copied_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function update_color(): void {
		if (!is_hex_color_focus ) set_hex_color (get_hex_color())
		if (!is_rgb_color_focus ) set_rgb_color (get_rgb_color())
		if (!is_hsl_color_focus ) set_hsl_color (get_hsl_color())
		if (!is_hsv_color_focus ) set_hsv_color (get_hsv_color())
		if (!is_hwb_color_focus ) set_hwb_color (get_hwb_color())
		if (!is_cmyk_color_focus) set_cmyk_color(get_cmyk_color())
	}

	createEffect(() => {
		update_color()
	})

	return (<div class={CSS.color_input}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			const data_copy = element_dataset(button, 'copy')
			if (data_copy) return promise_done(
				navigator_clipboard_writetext(data_copy),
				() => open_toast(ev, toast_copied_ref)
			)
		}}
		onFocusIn={ev => {
			const target = event_target(ev) as HTMLInputElement
			switch (element_id(target)) {
				case input_hex_id: is_hex_color_focus = true; break
				case input_rgb_id: is_rgb_color_focus = true; break
				case input_hsl_id: is_hsl_color_focus = true; break
				case input_hsv_id: is_hsv_color_focus = true; break
				case input_hwb_id: is_hwb_color_focus = true; break
				case input_cmyk_id: is_cmyk_color_focus = true; break
			}
		}}
		onFocusOut={ev => {
			const target = event_target(ev) as HTMLInputElement
			switch (element_id(target)) {
				case input_hex_id: {
					set_hex_color(get_hex_color())
					is_hex_color_focus = false
					break
				}
				case input_rgb_id: {
					set_rgb_color(get_rgb_color())
					is_rgb_color_focus = false
					break
				}
				case input_hsl_id: {
					set_hsl_color(get_hsl_color())
					is_hsl_color_focus = false
					break
				}
				case input_hsv_id: {
					set_hsv_color(get_hsv_color())
					is_hsv_color_focus = false
					break
				}
				case input_hwb_id: {
					set_hwb_color(get_hwb_color())
					is_hwb_color_focus = false
					break
				}
				case input_cmyk_id: {
					set_cmyk_color(get_cmyk_color())
					is_cmyk_color_focus = false
					break
				}
			}
		}}>
		<div style={{
			"background-color": hsl_to_hex(input())
		}}></div>
		<Toast
			ref={r => toast_copied_ref = r}
			c_leading={<Icon c_code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
		<TextField
			c_label="Hex"
			id={input_hex_id}
			value={hex_color()}
			readOnly={read_only()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^0-9A-Fa-f]/g, '')
				if (string_length(text) == 0) text = '0'

				text = string_padstart(text, 6, '0')
				if (string_length(text) > 6) text = string_substring(text, 0, 6)

				text = '#' + text
				command(Commands.update_input, hex_to_hsl(text as HEXColor))
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_hex_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
		<TextField
			readOnly={read_only()}
			c_label="RGB"
			id={input_rgb_id}
			value={rgb_color()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^\d,]/g, '')
				const rgb_array: number[] = array_map(
					string_split(text, ','),
					v => math_clamp(number_safe(number_parse(v, true), 0), 0, 0xff)
				)
				while (array_length(rgb_array) < 3) {
					array_push(rgb_array, 0)
				}

				const r = rgb_array[0] / 0xff
				const g = rgb_array[1] / 0xff
				const b = rgb_array[2] / 0xff
				command(Commands.update_input, rgb_to_hsl({r, g, b}))
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_rgb_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
		<TextField
			readOnly={read_only()}
			c_label="HSL"
			id={input_hsl_id}
			value={hsl_color()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^\d,]/g, '')
				const hsl_array: number[] = array_map(
					string_split(text, ','),
					v => number_safe(number_parse(v, true), 0)
				)
				while (array_length(hsl_array) < 3) {
					array_push(hsl_array, 0)
				}

				const h = math_clamp(hsl_array[0], 0, 360) / 360
				const s = math_clamp(hsl_array[1], 0, 100) / 100
				const l = math_clamp(hsl_array[2], 0, 100) / 100
				command(Commands.update_input, {h, s, l} satisfies HSLColor)
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_hsl_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
		<TextField
			readOnly={read_only()}
			c_label="HSV"
			id={input_hsv_id}
			value={hsv_color()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^\d,]/g, '')
				const hsv_array: number[] = array_map(
					string_split(text, ','),
					v => number_safe(number_parse(v, true), 0)
				)
				while (array_length(hsv_array) < 3) {
					array_push(hsv_array, 0)
				}

				const h = math_clamp(hsv_array[0], 0, 360) / 360
				const s = math_clamp(hsv_array[1], 0, 100) / 100
				const v = math_clamp(hsv_array[2], 0, 100) / 100
				command(Commands.update_input, hsv_to_hsl({h, s, v}))
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_hsv_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
		<TextField
			readOnly={read_only()}
			c_label="HWB"
			id={input_hwb_id}
			value={hwb_color()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^\d,]/g, '')
				const hwb_array: number[] = array_map(
					string_split(text, ','),
					v => number_safe(number_parse(v, true), 0)
				)
				while (array_length(hwb_array) < 3) {
					array_push(hwb_array, 0)
				}

				const h = math_clamp(hwb_array[0], 0, 360) / 360
				const w = math_clamp(hwb_array[1], 0, 100) / 100
				const b = math_clamp(hwb_array[2], 0, 100 - (w * 100)) / 100
				command(Commands.update_input, hwb_to_hsl({h, w, b}))
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_hwb_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
		<TextField
			readOnly={read_only()}
			c_label="CMYK"
			id={input_cmyk_id}
			value={cmyk_color()}
			onInput={(ev) => {
				let text = event_current_target(ev).value
				text = string_trim(text)
				text = string_replace(text, /[^\d,]/g, '')
				const hwb_array: number[] = array_map(
					string_split(text, ','),
					v => number_safe(number_parse(v, true), 0)
				)
				while (array_length(hwb_array) < 4) {
					array_push(hwb_array, 0)
				}

				const c = math_clamp(hwb_array[0], 0, 100) / 100
				const m = math_clamp(hwb_array[1], 0, 100) / 100
				const y = math_clamp(hwb_array[2], 0, 100) / 100
				const k = math_clamp(hwb_array[3], 0, 100) / 100
				command(Commands.update_input, cmyk_to_hsl({c, m, y, k}))
			}}
			c_trailing={<TextFieldButton
				data-tooltip="Copy"
				data-copy={get_cmyk_color()}>
				<Icon c_code={0xE51B}/>
			</TextFieldButton>}
		/>
	</div>)
}

const _: VoidComponent<{
	command(type: Commands, ...args: unknown[]): unknown
	settings: Settings
	input: HSLColor
}> = (props) => {
	const input = createMemo(() => props.input)
	const settings = createMemo(() => props.settings)
	const command = createMemo(() => props.command)
	return (<main class={CSS.body}>
		<ColorPicker
			input={input()}
			command={command()}
			settings={settings()}
		/>
		<ColorInput
			command={command()}
			input={input()} settings={settings()}
		/>
	</main>)
}

export default _