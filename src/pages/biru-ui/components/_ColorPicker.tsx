import { Show, type VoidComponent, createSignal } from "solid-js"

import type { HEXColor } from "@/types/color"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import ColorPicker, { open_colorpicker } from "@/components/ColorPicker"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [disabled_opacity_control, set_disabled_opacity_control] = createSignal<boolean>(false)
	const [disabled_color_control, set_disabled_color_control] = createSignal<boolean>(false)
	const [color, set_color] = createSignal<HEXColor | null>(null)
	let colorpicker_ref: HTMLDialogElement
	return (<Page
		title="ColorPicker"
		description="A color picker is a UI element that allows users to select a color from a defined color space. It typically provides a visual representation of colors and offers various methods for color selection, such as palettes, sliders, or color wheels.">
		<Playground>
			<Button
				c_variant={ButtonVariant.tonal}
				onClick={(ev) => open_colorpicker(ev, colorpicker_ref, {
					anchor: event_current_target(ev),
					content_auto_focus: false,
					gap: 8,
				})}>
				<Icon style={{color: color() ?? '#FF0000'}} c_code={0xE408} c_filled/>
				<Show when={color()} fallback="Select color">{color()!}</Show>
			</Button>
			<ColorPicker
				ref={r => colorpicker_ref = r}
				c_on_select_color={(color) => set_color(color)}
				c_disabled_color_control={disabled_color_control()}
				c_disabled_opacity_control={disabled_opacity_control()}
			/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={disabled_opacity_control()}
				onChange={ev => set_disabled_opacity_control(event_current_target(ev).checked)}>
				Disable opacity
			</CheckBox>
			<CheckBox
				checked={disabled_color_control()}
				onChange={ev => set_disabled_color_control(event_current_target(ev).checked)}>
				Disable color (hue only)
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _