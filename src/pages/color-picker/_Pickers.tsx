import { createSignal as $signal, onCleanup as $cleanup, onMount as $mount, type VoidComponent, createMemo as $memory, createEffect as $effect, Show } from "solid-js"

import type { HSLColor, HEXColor } from "@/types/color"
import { element_rect } from "@/utils/element"
import { rect_height, rect_left, rect_top, rect_width } from "@/utils/rect"
import { BodyAttributes } from "@/enums/attributes"
import { attr_remove, attr_set } from "@/utils/attributes"
import { event_add_listener, event_remove_listener, event_stop_propagation } from "@/utils/event"
import { math_clamp, math_round } from "@/utils/math"
import { cmyk_to_hsl, get_contrast_ratio, hex_to_hsl, hex_to_rgb, hsl_to_cmyk, hsl_to_hex, hsl_to_hsv, hsl_to_hwb, hsl_to_rgb, hsv_to_hex, hsv_to_hsl, hwb_to_hsl, rgb_to_hsl } from "@/utils/color"
import { Commands } from "./_enums"
import { string_padstart, string_substring, string_touppercase } from "@/utils/string"
import { number_parse, number_to_string } from "@/utils/number"
import { file_open } from "@/utils/file"
import { regex_test } from "@/utils/regex"
import { url_create, url_revoke } from "@/utils/url"
import { promise_done } from "@/utils/object"
import { array_join } from "@/utils/array"

import Button, { ButtonVariant } from "@/components/Button"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'

export const RectanglePicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, set_hue] = $signal<number>(0) // 0-100
	const [left, set_left] = $signal<number>(0) // 0-100
	const [top, set_top] = $signal<number>(0) // 0-100
	const get_hsl_color = $memory<HSLColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return {...hsv_to_hsl({ h, s, v }), h}
	})
	const get_hex_color = $memory<HEXColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return hsv_to_hex({ h, s, v })
	})
	let color_dragged = false
	let hue_dragged = false
	let color_ref: HTMLDivElement
	let color_rect: DOMRect
	let hue_ref: HTMLDivElement
	let hue_rect: DOMRect
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (color_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(color_rect)) / rect_width(color_rect) * 100
			x = math_clamp(x, 0, 100)
			set_left(x)

			let y = (ev.clientY - rect_top(color_rect)) / rect_height(color_rect) * 100
			y = math_clamp(y, 0, 100)
			set_top(y)
			command(Commands.update_input, get_hsl_color())
		}
		else if (hue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hue(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hue_dragged = false
		color_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}
		const {s, v} = hsl_to_hsv(input)
		set_hue(input.h * 100)
		set_left(s * 100)
		set_top((1 - v) * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_rectangle}>
		<div
			data-color
			ref={r => color_ref = r}
			draggable={false}
			style={{
				'--hue': `hsl(${hue() / 100 * 360}, 100%, 50%)`
			}}
			onPointerDown={ev => {
				is_update_locally = true
				color_dragged = true
				color_rect = element_rect(color_ref)
				set_left(math_clamp((ev.clientX - rect_left(color_rect)) / rect_width(color_rect) * 100, 0, 100))
				set_top(math_clamp((ev.clientY - rect_top(color_rect)) / rect_height(color_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				draggable={false}
				class={CSS.picker_indicator}
				style={{
					"background-color": get_hex_color(),
					"border-color": get_contrast_ratio(hex_to_rgb(get_hex_color()), {r: 0, g: 0, b: 0}) > 50
						? '#000'
						: '#fff',
					left: left() + '%',
					top: top() + '%',
					transform: 'translate(-12px, -12px)',
				}}
			/>
		</div>
		<div
			data-hue
			draggable={false}
			ref={r => hue_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hue_dragged = true
				hue_rect = element_rect(hue_ref)
				set_hue(math_clamp((ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": get_contrast_ratio(hsl_to_rgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
						? '#000'
						: '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const RectangleHSLPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, set_hue] = $signal<number>(0) // 0-100
	const [left, set_left] = $signal<number>(0) // 0-100
	const [top, set_top] = $signal<number>(0) // 0-100
	const get_hsl_color = $memory<HSLColor>(() => {
		const [h, s, l] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return {h, s, l}
	})
	const get_hex_color = $memory<HEXColor>(() => {
		const [h, s, l] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return hsl_to_hex({ h, s, l })
	})
	let color_dragged = false
	let hue_dragged = false
	let color_ref: HTMLDivElement
	let color_rect: DOMRect
	let hue_ref: HTMLDivElement
	let hue_rect: DOMRect
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (color_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(color_rect)) / rect_width(color_rect) * 100
			x = math_clamp(x, 0, 100)
			set_left(x)

			let y = (ev.clientY - rect_top(color_rect)) / rect_height(color_rect) * 100
			y = math_clamp(y, 0, 100)
			set_top(y)
			command(Commands.update_input, get_hsl_color())
		}
		else if (hue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hue(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hue_dragged = false
		color_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const {h, s, l} = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}
		set_hue(h * 100)
		set_left(s * 100)
		set_top((1 - l) * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_rectangle_hsl}>
		<div
			data-color
			ref={r => color_ref = r}
			draggable={false}
			style={{
				'--hue': `hsl(${hue() / 100 * 360}, 100%, 50%)`
			}}
			onPointerDown={ev => {
				is_update_locally = true
				color_dragged = true
				color_rect = element_rect(color_ref)
				set_left(math_clamp((ev.clientX - rect_left(color_rect)) / rect_width(color_rect) * 100, 0, 100))
				set_top(math_clamp((ev.clientY - rect_top(color_rect)) / rect_height(color_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				draggable={false}
				class={CSS.picker_indicator}
				style={{
					"background-color": get_hex_color(),
					"border-color": get_contrast_ratio(hex_to_rgb(get_hex_color()), {r: 0, g: 0, b: 0}) > 50
						? '#000'
						: '#fff',
					left: left() + '%',
					top: top() + '%',
					transform: 'translate(-12px, -12px)',
				}}
			/>
		</div>
		<div
			data-hue
			draggable={false}
			ref={r => hue_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hue_dragged = true
				hue_rect = element_rect(hue_ref)
				set_hue(math_clamp((ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": get_contrast_ratio(hsl_to_rgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
						? '#000'
						: '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const ImagePicker: VoidComponent<{
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hex_color, set_hex_color] = $signal<HEXColor>('#000000')
	const [left, set_left] = $signal(0) // 0 -> 100
	const [top, set_top] = $signal(0) // 0 -> 100
	const [any_image, set_any_image] = $signal(false)
	const get_hsl_color = $memory(() => hex_to_hsl(hex_color()))
	const image = new Image()
	let canvas_ref: HTMLCanvasElement
	let canvas_context: CanvasRenderingContext2D
	let image_dragged = false
	let image_ref: HTMLDivElement
	let image_rect: DOMRect

	function pick_color(): void {
		const data = canvas_context.getImageData(left() / 100 * canvas_ref.width, top() / 100 * canvas_ref.height, 1, 1).data
		set_hex_color(array_join([
			'#',
			string_touppercase(string_padstart(number_to_string(data[0], 16), 2, '0')),
			string_touppercase(string_padstart(number_to_string(data[1], 16), 2, '0')),
			string_touppercase(string_padstart(number_to_string(data[2], 16), 2, '0')),
		], '') as HEXColor)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (image_dragged) {
			let x = (ev.clientX - rect_left(image_rect)) / rect_width(image_rect) * 100
			x = math_clamp(x, 0, 100)
			set_left(x)

			let y = (ev.clientY - rect_top(image_rect)) / rect_height(image_rect) * 100
			y = math_clamp(y, 0, 100)
			set_top(y)
			pick_color()
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		image_dragged = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function init_canvas(): void {
		canvas_context = canvas_ref.getContext('2d', {
			willReadFrequently: true,
		})!
	}

	function init_image(): void {
		image.onload = () => {
			canvas_ref.width = image.naturalWidth
			canvas_ref.height = image.naturalHeight
			canvas_context.drawImage(image, 0, 0)
		}
	}

	function pick_image(): void {
		promise_done(
			file_open('image/*', false),
			(files) => {
				if (!files || files?.length == 0) return;

				for (const file of files) {
					if (!regex_test(/^image/, file.type)) continue

					url_revoke(image.src)
					image.src = url_create(file)
					if (!any_image()) set_any_image(true)
					break
				}
			}
		)
	}

	$mount(() => {
		init_events()
		init_canvas()
		init_image()
	})

	$cleanup(() => {
		url_revoke(image.src)
	})

	return (<div class={CSS.picker_image}>
		<div
			data-image
			ref={r => image_ref = r}
			data-has-image={any_image()? '' : undefined}
			onPointerDown={ev => {
				image_rect = element_rect(image_ref)
				if (!any_image()) return;

				set_left(math_clamp((ev.clientX - rect_left(image_rect)) / rect_width(image_rect) * 100, 0, 100))
				set_top(math_clamp((ev.clientY - rect_top(image_rect)) / rect_height(image_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				pick_color()
				command(Commands.update_input, get_hsl_color())
				image_dragged = true
			}}>
			<canvas
				draggable={false}
				ref={r => canvas_ref = r}
				data-has-image={any_image()? '' : undefined}></canvas>
			<Show when={any_image()}>
				<div
					class={CSS.picker_indicator}
					draggable={false}
					style={{
						"background-color": hex_color(),
						"border-color": get_contrast_ratio(
							hex_to_rgb(hex_color()),
							{r: 0, g: 0, b: 0}) > 50
								? '#000'
								: '#fff',
						left: left() + '%',
						top: top() + '%',
						transform: 'translate(-12px, -12px)',
					}}></div>
			</Show>
			<Show when={!any_image()}>
				<Button
					onPointerDown={ev => event_stop_propagation(ev)}
					variant={ButtonVariant.tonal}
					onClick={pick_image}>
					<Icon code={0xE8FE}/>
					Pick image
				</Button>
			</Show>
		</div>
		<Show when={any_image()}>
			<Button variant={ButtonVariant.tonal} onClick={pick_image}>
				<Icon code={0xE8FE}/>
				Pick image
			</Button>
		</Show>
	</div>)
}

export const PalettePicker: VoidComponent = () => {
	return (<div class={CSS.picker_palette}></div>)
}

export const SpectrumPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [blackness, set_blackness] = $signal<number>(0) // 0-100
	const [left, set_left] = $signal<number>(0) // 0-100
	const [top, set_top] = $signal<number>(0) // 0-100
	const get_hue = $memory(() => {
		return left() / 100 * 360
	})
	const get_hsl_color = $memory<HSLColor>(() => {
		const h = left() / 100
		const s = (100 - top()) / 100
		const x = (top() / 2) + 50
		const l = (x - x * (blackness() / 100)) / 100
		return {h, s, l}
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let spectrum_dragged = false
	let blackness_dragged = false
	let spectrum_ref: HTMLDivElement
	let spectrum_rect: DOMRect
	let blackness_ref: HTMLDivElement
	let blackness_rect: DOMRect

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (spectrum_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(spectrum_rect)) / rect_width(spectrum_rect) * 100
			x = math_clamp(x, 0, 100)
			set_left(x)

			let y = (ev.clientY - rect_top(spectrum_rect)) / rect_height(spectrum_rect) * 100
			y = math_clamp(y, 0, 100)
			set_top(y)
			command(Commands.update_input, get_hsl_color())
		}
		else if (blackness_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(blackness_rect)) / rect_width(blackness_rect) * 100
			x = math_clamp(x, 0, 100)
			set_blackness(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		spectrum_dragged = false
		blackness_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const {h, s, l} = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}
		set_left(h * 100)
		const top = 100 - (100 * s)
		set_top(top)
		const x = top / 2 + 50
		set_blackness((100 * (x - (100 * l))) / x)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_spectrum}>
		<div
			data-spectrum
			draggable={false}
			ref={r => spectrum_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				spectrum_dragged = true
				spectrum_rect = element_rect(spectrum_ref)
				set_left(math_clamp((ev.clientX - rect_left(spectrum_rect)) / rect_width(spectrum_rect) * 100, 0, 100))
				set_top(math_clamp((ev.clientY - rect_top(spectrum_rect)) / rect_height(spectrum_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, 100%, ${50 + (top() / 2)}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({
							h: get_hue() / 360,
							s: 1,
							l: 0.5 + (top() / 100 / 2)
						}),
						{r: 0, g: 0, b: 0}) > 50
							? '#000'
							: '#fff',
					left: left() + '%',
					top: top() + '%',
					transform: 'translate(-12px, -12px)',
				}}></div>
		</div>
		<div
			data-blackness
			draggable={false}
			ref={r => blackness_ref = r}
			onPointerDown={ev => {
				blackness_rect = element_rect(blackness_ref)
				is_update_locally = true
				blackness_dragged = true
				set_blackness(math_clamp((ev.clientX - rect_left(blackness_rect)) / rect_width(blackness_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}
			style={{'--color': `hsl(${get_hue()}, 100%, ${50 + (top() / 2)}%)`}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, ${100 - top()}%, ${((top() / 2) + 50) - ((top() / 2) + 50) * (blackness() / 100)}%)`,
					left: blackness() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({
							h: get_hue() / 360,
							s: (100 - top()) / 100,
							l: (((top() / 2) + 50) - ((top() / 2) + 50) * (blackness() / 100)) / 100
						}),
						{r: 0, g: 0, b: 0}
					) > 50
						? '#000'
						: '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const WheelPicker: VoidComponent = () => {
	return (<div class={CSS.picker_wheel}>
	</div>)
}

export const SliderRGBPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [red, set_red] = $signal(0) // 0 - 100
	const [green, set_green] = $signal(0) // 0 - 100
	const [blue, set_blue] = $signal(0) // 0 - 100
	const get_hsl_color = $memory(() => {
		const r = red() / 100
		const g = green() / 100
		const b = blue() / 100
		return rgb_to_hsl({r, g, b})
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let red_dragged = false
	let green_dragged = false
	let blue_dragged = false
	let red_rect: DOMRect
	let green_rect: DOMRect
	let blue_rect: DOMRect
	let red_ref: HTMLDivElement
	let green_ref: HTMLDivElement
	let blue_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (red_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(red_rect)) / rect_width(red_rect) * 100
			x = math_clamp(x, 0, 100)
			set_red(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (blue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(blue_rect)) / rect_width(blue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_blue(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (green_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(green_rect)) / rect_width(green_rect) * 100
			x = math_clamp(x, 0, 100)
			set_green(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		red_dragged = blue_dragged = green_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		const {r, g, b} = hsl_to_rgb(input)
		set_red(r * 100)
		set_green(g * 100)
		set_blue(b * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_rgb}>
		<p>Red: {math_round(red() / 100 * 0xff)} ({math_round(red())}%)</p>
		<div
			data-red
			draggable={false}
			ref={r => red_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				red_dragged = true
				red_rect = element_rect(red_ref)
				set_red(math_clamp((ev.clientX - rect_left(red_rect)) / rect_width(red_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(0, 100%, ${red() / 100 * 50}%)`,
					left: red() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 0, s: 1, l: (red() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Green: {math_round(green() / 100 * 0xff)} ({math_round(green())}%)</p>
		<div
			data-green
			draggable={false}
			ref={r => green_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				green_dragged = true
				green_rect = element_rect(green_ref)
				set_green(math_clamp((ev.clientX - rect_left(green_rect)) / rect_width(green_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(120, 100%, ${green() / 100 * 50}%)`,
					left: green() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 120 / 360, s: 1, l: (green() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blue: {math_round(blue() / 100 * 0xff)} ({math_round(blue())}%)</p>
		<div
			data-blue
			draggable={false}
			ref={r => blue_ref = r}
			onPointerDown={ev => {
				blue_dragged = true
				is_update_locally = true
				blue_rect = element_rect(blue_ref)
				set_blue(math_clamp((ev.clientX - rect_left(blue_rect)) / rect_width(blue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(240, 100%, ${blue() / 100 * 50}%)`,
					left: blue() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 240 / 360, s: 1, l: (blue() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const SliderHSLPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, set_hue] = $signal(0) // 0 - 100
	const [saturation, set_saturation] = $signal(0) // 0 - 100
	const [lightness, set_lightness] = $signal(0) // 0 - 100
	const get_hue = $memory(() => {
		return hue() / 100 * 360
	})
	const get_hsl_color = $memory<HSLColor>(() => {
		const h = hue() / 100
		const s = saturation() / 100
		const l = lightness() / 100

		return {h, s, l}
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let hue_dragged = false
	let saturation_dragged = false
	let lightness_dragged = false
	let hue_rect: DOMRect
	let saturation_rect: DOMRect
	let lightness_rect: DOMRect
	let hue_ref: HTMLDivElement
	let saturation_ref: HTMLDivElement
	let lightness_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (hue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hue(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (lightness_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(lightness_rect)) / rect_width(lightness_rect) * 100
			x = math_clamp(x, 0, 100)
			set_lightness(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (saturation_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(saturation_rect)) / rect_width(saturation_rect) * 100
			x = math_clamp(x, 0, 100)
			set_saturation(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hue_dragged = lightness_dragged = saturation_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const {h, s, l} = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		set_hue(h * 100)
		set_saturation(s * 100)
		set_lightness(l * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_hsl} style={{'--hue': get_hue()}}>
		<p>Hue: {math_round(get_hue())}° ({math_round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hue_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hue_dragged = true
				hue_rect = element_rect(hue_ref)
				set_hue(math_clamp((ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {math_round(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturation_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				saturation_dragged = true
				saturation_rect = element_rect(saturation_ref)
				set_saturation(math_clamp((ev.clientX - rect_left(saturation_rect)) / rect_width(saturation_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Lightness: {math_round(lightness())}%</p>
		<div
			data-lightness
			draggable={false}
			ref={r => lightness_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				lightness_dragged = true
				lightness_rect = element_rect(lightness_ref)
				set_lightness(math_clamp((ev.clientX - rect_left(lightness_rect)) / rect_width(lightness_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: lightness() + '%',
					"background-color": `hsl(0, 0%, ${lightness()}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 0, s: 1, l: lightness()/ 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const SliderCMYKPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [cyan, set_cyan] = $signal(0) // 0 - 100
	const [magenta, set_magenta] = $signal(0) // 0 - 100
	const [yellow, set_yellow] = $signal(0) // 0 - 100
	const [key, set_key] = $signal(0) // 0 - 100
	const get_hsl_color = $memory<HSLColor>(() => {
		const c = cyan() / 100
		const m = magenta() / 100
		const y = yellow() / 100
		const k = (100 - key()) / 100

		return cmyk_to_hsl({c, m, y, k})
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let cyan_dragged = false
	let magenta_dragged = false
	let yellow_dragged = false
	let key_dragged = false
	let cyan_rect: DOMRect
	let magenta_rect: DOMRect
	let yellow_rect: DOMRect
	let key_rect: DOMRect
	let cyan_ref: HTMLDivElement
	let magenta_ref: HTMLDivElement
	let yellow_ref: HTMLDivElement
	let key_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (cyan_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(cyan_rect)) / rect_width(cyan_rect) * 100
			x = math_clamp(x, 0, 100)
			set_cyan(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (yellow_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(yellow_rect)) / rect_width(yellow_rect) * 100
			x = math_clamp(x, 0, 100)
			set_yellow(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (magenta_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(magenta_rect)) / rect_width(magenta_rect) * 100
			x = math_clamp(x, 0, 100)
			set_magenta(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (key_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(key_rect)) / rect_width(key_rect) * 100
			x = math_clamp(x, 0, 100)
			set_key(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		cyan_dragged = yellow_dragged = magenta_dragged = key_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		const {c, m, y, k} = hsl_to_cmyk(input)
		set_cyan(c * 100)
		set_magenta(m * 100)
		set_yellow(y * 100)
		set_key(100 - k * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_cmyk}>
		<p>Cyan: {math_round(cyan())}%</p>
		<div
			data-cyan
			draggable={false}
			ref={r => cyan_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				cyan_dragged = true
				cyan_rect = element_rect(cyan_ref)
				set_cyan(math_clamp((ev.clientX - rect_left(cyan_rect)) / rect_width(cyan_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: cyan() + '%',
					"background-color": `hsl(180, 100%, ${cyan() / 100 * 50}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 180 / 360, s: 1, l: cyan() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Magenta: {math_round(magenta())}%</p>
		<div
			data-magenta
			draggable={false}
			ref={r => magenta_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				magenta_dragged = true
				magenta_rect = element_rect(magenta_ref)
				set_magenta(math_clamp((ev.clientX - rect_left(magenta_rect)) / rect_width(magenta_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: magenta() + '%',
					"background-color": `hsl(300, 100%, ${magenta() / 100 * 50}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 300 / 360, s: 1, l: magenta() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Yellow: {math_round(yellow())}%</p>
		<div
			data-yellow
			draggable={false}
			ref={r => yellow_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				yellow_dragged = true
				yellow_rect = element_rect(yellow_ref)
				set_yellow(math_clamp((ev.clientX - rect_left(yellow_rect)) / rect_width(yellow_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(60, 100%, ${yellow() / 100 * 50}%)`,
					left: yellow() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 60 / 360, s: 1, l: yellow() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Key: {100 - math_round(key())}%</p>
		<div
			data-key
			draggable={false}
			ref={r => key_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				key_dragged = true
				key_rect = element_rect(key_ref)
				set_key(math_clamp((ev.clientX - rect_left(key_rect)) / rect_width(key_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: key() + '%',
					"background-color": `hsl(0, 0%, ${key()}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 0, s: 1, l: key() / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const SliderHEXPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hex, set_hex] = $signal(0) // 0 - 100
	const get_hex_color = $memory(() => {
		return '#' + string_padstart(number_to_string(math_round(hex() / 100 * 0xffffff), 16), 6, '0') as HEXColor
	})
	const get_hsl_color = $memory<HSLColor>(() => {
		const h = get_hex_color()
		return hex_to_hsl(h)
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let hex_dragged = false
	let hex_rect: DOMRect
	let hex_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (hex_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hex_rect)) / rect_width(hex_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hex(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hex_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		const hex = number_parse(string_substring(hsl_to_hex(input), 1), true, 16) / 0xffffff
		set_hex(hex * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_hex}>
		<p>Hex: {string_touppercase(get_hex_color())} ({math_round(hex() / 100 * 0xffffff)})</p>
		<div
			data-hex
			draggable={false}
			ref={r => hex_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hex_dragged = true
				hex_rect = element_rect(hex_ref)
				set_hex(math_clamp((ev.clientX - rect_left(hex_rect)) / rect_width(hex_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: hex() + '%',
					"background-color": get_hex_color(),
					"border-color": get_contrast_ratio(
						hex_to_rgb(get_hex_color()),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const SliderHSVPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, set_hue] = $signal(0) // 0 - 100
	const [saturation, set_saturation] = $signal(0) // 0 - 100
	const [value, set_value] = $signal(0) // 0 - 100
	const get_hue = $memory(() => {
		return hue() / 100 * 360
	})
	const get_hsl_color = $memory<HSLColor>(() => {
		const h = hue() / 100
		const s = saturation() / 100
		const v = value() / 100

		return hsv_to_hsl({h, s, v})
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let hue_dragged = false
	let saturation_dragged = false
	let value_dragged = false
	let hue_rect: DOMRect
	let saturation_rect: DOMRect
	let value_rect: DOMRect
	let hue_ref: HTMLDivElement
	let saturation_ref: HTMLDivElement
	let value_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (hue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hue(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (value_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(value_rect)) / rect_width(value_rect) * 100
			x = math_clamp(x, 0, 100)
			set_value(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (saturation_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(saturation_rect)) / rect_width(saturation_rect) * 100
			x = math_clamp(x, 0, 100)
			set_saturation(x)
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hue_dragged = value_dragged = saturation_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		const {h, s, v} = hsl_to_hsv(input)
		set_hue(h * 100)
		set_saturation(s * 100)
		set_value(v * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_hsv} style={{'--hue': get_hue()}}>
		<p>Hue: {math_round(get_hue())}° ({math_round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hue_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hue_dragged = true
				hue_rect = element_rect(hue_ref)
				set_hue(math_clamp((ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {math_round(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturation_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				saturation_dragged = true
				saturation_rect = element_rect(saturation_ref)
				set_saturation(math_clamp((ev.clientX - rect_left(saturation_rect)) / rect_width(saturation_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Value: {math_round(value())}%</p>
		<div
			data-value
			draggable={false}
			ref={r => value_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				value_dragged = true
				value_rect = element_rect(value_ref)
				set_value(math_clamp((ev.clientX - rect_left(value_rect)) / rect_width(value_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: value() + '%',
					"background-color": `hsl(0, 0%, ${value()}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: 0, s: 1, l: value()/ 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}

export const SliderHWBPicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, set_hue] = $signal(0) // 0 - 100
	const [whiteness, set_whiteness] = $signal(0) // 0 - 100
	const [blackness, set_blackness] = $signal(0) // 0 - 100
	const get_hue = $memory(() => {
		return hue() / 100 * 360
	})
	const get_hsl_color = $memory<HSLColor>(() => {
		const h = hue() / 100
		const w = math_clamp(whiteness() / 100, 0, 1)
		const b = math_clamp(blackness() / 100, 0, 1)

		return hwb_to_hsl({h, w, b})
	})
	let is_update_locally = false // to avoid unnecesary recalculate in `$effect()`
	let hue_dragged = false
	let whiteness_dragged = false
	let blackness_dragged = false
	let hue_rect: DOMRect
	let whiteness_rect: DOMRect
	let blackness_rect: DOMRect
	let hue_ref: HTMLDivElement
	let whiteness_ref: HTMLDivElement
	let blackness_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function on_pointermove(ev: PointerEvent): void {
		if (hue_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100
			x = math_clamp(x, 0, 100)
			set_hue(x)
			command(Commands.update_input, get_hsl_color())
		}
		else if (blackness_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(blackness_rect)) / rect_width(blackness_rect) * 100
			x = math_clamp(x, 0, 100)
			set_blackness(x)
			set_whiteness(math_clamp(whiteness(), 0, 100 - blackness()))
			command(Commands.update_input, get_hsl_color())
		}
		else if (whiteness_dragged) {
			is_update_locally = true
			let x = (ev.clientX - rect_left(whiteness_rect)) / rect_width(whiteness_rect) * 100
			x = math_clamp(x, 0, 100)
			set_whiteness(x)
			set_blackness(math_clamp(blackness(), 0, 100 - whiteness()))
			command(Commands.update_input, get_hsl_color())
		}
	}

	function on_pointerup(): void {
		hue_dragged = blackness_dragged = whiteness_dragged = false
		is_update_locally = false
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<PointerEvent>(document, 'pointermove', on_pointermove)
		event_add_listener<PointerEvent>(document, 'pointerup', on_pointerup)

		$cleanup(() => {
			event_remove_listener<PointerEvent>(document, 'pointermove', on_pointermove)
			event_remove_listener<PointerEvent>(document, 'pointerup', on_pointerup)
		})
	}

	function update_position(): void {
		const input = props.input
		if (is_update_locally) {
			is_update_locally = false
			return
		}

		const {h, w, b} = hsl_to_hwb(input)
		set_hue(h * 100)
		set_whiteness(w * 100)
		set_blackness(b * 100)
	}

	$mount(() => {
		init_events()
	})

	$effect(() => {
		update_position()
	})

	return (<div class={CSS.picker_slider_hwb} style={{'--hue': get_hue()}}>
		<p>Hue: {math_round(get_hue())}° ({math_round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hue_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				hue_dragged = true
				hue_rect = element_rect(hue_ref)
				set_hue(math_clamp((ev.clientX - rect_left(hue_rect)) / rect_width(hue_rect) * 100, 0, 100))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Whiteness: {math_round(whiteness())}%</p>
		<div
			data-whiteness
			draggable={false}
			ref={r => whiteness_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				whiteness_dragged = true
				whiteness_rect = element_rect(whiteness_ref)
				set_whiteness(math_clamp((ev.clientX - rect_left(whiteness_rect)) / rect_width(whiteness_rect) * 100, 0, 100))
				set_blackness(math_clamp(blackness(), 0, 100 - whiteness()))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${get_hue()}, 100%, ${50 + (whiteness() / 100 * 50)}%)`,
					left: whiteness() + '%',
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: 1, l: 0.5 + (whiteness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blackness: {math_round(blackness())}%</p>
		<div
			data-blackness
			draggable={false}
			ref={r => blackness_ref = r}
			onPointerDown={ev => {
				is_update_locally = true
				blackness_dragged = true
				blackness_rect = element_rect(blackness_ref)
				set_blackness(math_clamp((ev.clientX - rect_left(blackness_rect)) / rect_width(blackness_rect) * 100, 0, 100))
				set_whiteness(math_clamp(whiteness(), 0, 100 - blackness()))
				attr_set(body, BodyAttributes.no_pointer_event)
				command(Commands.update_input, get_hsl_color())
				is_update_locally = false
			}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: blackness() + '%',
					"background-color": `hsl(${get_hue()}, 100%, ${50 - (blackness() / 100 * 50)}%)`,
					"border-color": get_contrast_ratio(
						hsl_to_rgb({h: hue() / 100, s: 1, l: 0.5 - (blackness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}