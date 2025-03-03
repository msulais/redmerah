import { Show, type VoidComponent, createSignal } from "solid-js"

import type { HEXColor } from "@/types/color"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import ColorPicker, { openColorPicker } from "@/components/ColorPicker"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { ICON_CIRCLE } from "@/constants/icons"

const _: VoidComponent = () => {
	const [disabledOpacityControl, setDisabledOpacityControl] = createSignal<boolean>(false)
	const [disabledColorControl, setDisabledColorControl] = createSignal<boolean>(false)
	const [color, setColor] = createSignal<HEXColor | null>(null)
	let colorPickerRef: HTMLDialogElement
	return (<Page
		title="ColorPicker"
		description="A color picker is a UI element that allows users to select a color from a defined color space. It typically provides a visual representation of colors and offers various methods for color selection, such as palettes, sliders, or color wheels.">
		<Playground>
			<Button
				c:variant={ButtonVariant.tonal}
				onClick={(ev) => openColorPicker(colorPickerRef, {
					anchor: ev.currentTarget,
					contentAutoFocus: false,
					gap: 8,
				})}>
				<Icon style={{color: color() ?? '#FF0000'}} c:code={ICON_CIRCLE} c:filled/>
				<Show when={color()} fallback="Select color">{color()!}</Show>
			</Button>
			<ColorPicker
				ref={r => colorPickerRef = r}
				c:onSelectColor={(color) => setColor(color)}
				c:disabledColorControl={disabledColorControl()}
				c:disabledOpacityControl={disabledOpacityControl()}
			/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={disabledOpacityControl()}
				onChange={ev => setDisabledOpacityControl(ev.currentTarget.checked)}>
				Disable opacity
			</CheckBox>
			<CheckBox
				checked={disabledColorControl()}
				onChange={ev => setDisabledColorControl(ev.currentTarget.checked)}>
				Disable color (hue only)
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _