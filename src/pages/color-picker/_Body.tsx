import { createMemo, createSignal as createSignal, createEffect, Match, Switch, type VoidComponent, createUniqueId } from "solid-js"

import type { HEXColor, HSLColor } from "@/types/color"
import type { Settings } from "./_types"
import { ColorPickerMode, Commands } from "./_enums"
import { ImagePicker, PalettePicker, RectangleHSLPicker, RectanglePicker, SliderCMYKPicker, SliderHEXPicker, SliderHSLPicker, SliderHSVPicker, SliderHWBPicker, SliderRGBPicker, SpectrumPicker, WheelPicker } from "./_Pickers"
import { colorCmykToHsl, colorHexToHsl, colorHslToCmyk, colorHslToHex, colorHslToHsv, colorHslToHwb, colorHslToRgb, colorHsvToHsl, colorHwbToHsl, colorRgbToHsl } from "@/utils/color"
import { mathClamp } from "@/utils/math"
import { numberSafe } from "@/utils/number"
import { elementValidTarget } from "@/utils/element"
import { ICON_COPY } from "@/constants/icons"

import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField, { TextFieldButton } from "@/components/TextField"
import Toast, { openToast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'
import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown } from "@/utils/keyboard"

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

	function isModeEqual(mode: ColorPickerMode): boolean {
		return settings().mode == mode
	}

	return (<div class={CSS.color_picker}>
		<Dropdown
			c:label="Picker mode"
			c:text="Select picker mode"
			c:values={[settings().mode]}
			style={{"min-width": '100%'}}
			c:onChange={(values) => command(Commands.updateMode, values[0].value as ColorPickerMode)}>
			<DropdownOption c:text="Image" c:value={ColorPickerMode.image}/>
			<DropdownOption c:text="Rectangle" c:value={ColorPickerMode.rectangle}/>
			<DropdownOption c:text="Rectangle HSL" c:value={ColorPickerMode.rectangleHsl}/>
			{/* <DropdownOption text="Palette" value={ColorPickerMode.palette}/> */}
			<DropdownOption c:text="Spectrum (Beta release)" c:value={ColorPickerMode.spectrum}/>
			{/* <DropdownOption text="Wheel" value={ColorPickerMode.wheel}/> */}
			<DropdownOption c:text="Slider RGB" c:value={ColorPickerMode.sliderRgb}/>
			<DropdownOption c:text="Slider HSL" c:value={ColorPickerMode.sliderHsl}/>
			<DropdownOption c:text="Slider CMYK" c:value={ColorPickerMode.sliderCmyk}/>
			<DropdownOption c:text="Slider HEX" c:value={ColorPickerMode.sliderHex}/>
			<DropdownOption c:text="Slider HSV" c:value={ColorPickerMode.sliderHsv}/>
			<DropdownOption c:text="Slider HWB" c:value={ColorPickerMode.sliderHwb}/>
		</Dropdown>
		<Switch>
			<Match when={isModeEqual(ColorPickerMode.image)}><ImagePicker command={command} /></Match>
			<Match when={isModeEqual(ColorPickerMode.rectangle)}><RectanglePicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.rectangleHsl)}><RectangleHSLPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.palette)}><PalettePicker /></Match>
			<Match when={isModeEqual(ColorPickerMode.spectrum)}><SpectrumPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.wheel)}><WheelPicker /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderRgb)}><SliderRGBPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderHsl)}><SliderHSLPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderCmyk)}><SliderCMYKPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderHex)}><SliderHEXPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderHsv)}><SliderHSVPicker command={command} input={input()} /></Match>
			<Match when={isModeEqual(ColorPickerMode.sliderHwb)}><SliderHWBPicker command={command} input={input()} /></Match>
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
	const readOnly = createMemo(() => {
		const mode = settings().mode
		return mode == ColorPickerMode.palette || mode == ColorPickerMode.image
	})
	const getHEXColor = createMemo(() => colorHslToHex(input()).toUpperCase())
	const getRGBColor = createMemo(() => {
		const {r, g, b} = colorHslToRgb(input())
		return [
			Math.round(r * 0xff),
			Math.round(g * 0xff),
			Math.round(b * 0xff)
		].join(', ')
	})
	const getHSLColor = createMemo(() => {
		const {h, s, l} = input()
		return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
	})
	const getHSVColor = createMemo(() => {
		const {h, s, v} = colorHslToHsv(input())
		return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%`
	})
	const getHWBColor = createMemo(() => {
		const {h, w, b} = colorHslToHwb(input())
		return `${Math.round(h * 360)}°, ${Math.round(w * 100)}%, ${Math.round(b * 100)}%`
	})
	const getCMYKColor = createMemo(() => {
		const {c, m, y, k} = colorHslToCmyk(input())
		return `${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%`
	})
	const [hexColor, setHEXColor] = createSignal<string>('#000000')
	const [rgbColor, setRGBColor] = createSignal<string>('0, 0, 0')
	const [hslColor, setHSLColor] = createSignal<string>('0°, 0%, 0%')
	const [hsvColor, setHSVColor] = createSignal<string>('0°, 0%, 0%')
	const [HWBColor, setHWBColor] = createSignal<string>('0°, 0%, 0%')
	const [cmykColor, setCMYKColor] = createSignal<string>('0%, 0%, 0%, 0%')
	const inputHEXId = createUniqueId()
	const inputRGBId = createUniqueId()
	const inputHSLId = createUniqueId()
	const inputHSVId = createUniqueId()
	const inputHWBId = createUniqueId()
	const inputCMYKId = createUniqueId()
	const textFields: HTMLInputElement[] = []
	let isHEXColorFocused = false
	let isRGBColorFocused = false
	let isHSLColorFocused = false
	let isHSVColorFocused = false
	let isHWBColorFocused = false
	let isCMYKColorFocused = false
	let toastCopiedRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateColor(): void {
		if (!isHEXColorFocused ) setHEXColor (getHEXColor())
		if (!isRGBColorFocused ) setRGBColor (getRGBColor())
		if (!isHSLColorFocused ) setHSLColor (getHSLColor())
		if (!isHSVColorFocused ) setHSVColor (getHSVColor())
		if (!isHWBColorFocused ) setHWBColor (getHWBColor())
		if (!isCMYKColorFocused) setCMYKColor(getCMYKColor())
	}

	createEffect(() => {
		updateColor()
	})

	return (<div class={CSS.color_input}
		onClick={ev => {
			const button = document.activeElement! as HTMLButtonElement
			if (!elementValidTarget(
				ev.currentTarget,
				button,
			)) return

			const dataset = button.dataset
			const dataCopy = dataset.copy
			if (dataCopy) return navigator.clipboard.writeText(dataCopy)
				.then(() => openToast(toastCopiedRef))
		}}
		onFocusIn={ev => {
			const target = ev.target as HTMLInputElement
			switch (target.id) {
			case inputHEXId: isHEXColorFocused = true; break
			case inputRGBId: isRGBColorFocused = true; break
			case inputHSLId: isHSLColorFocused = true; break
			case inputHSVId: isHSVColorFocused = true; break
			case inputHWBId: isHWBColorFocused = true; break
			case inputCMYKId: isCMYKColorFocused = true; break
			}
		}}
		onFocusOut={ev => {
			const target = ev.target as HTMLInputElement
			switch (target.id) {
			case inputHEXId:
				setHEXColor(getHEXColor())
				isHEXColorFocused = false
				break
			case inputRGBId:
				setRGBColor(getRGBColor())
				isRGBColorFocused = false
				break
			case inputHSLId:
				setHSLColor(getHSLColor())
				isHSLColorFocused = false
				break
			case inputHSVId:
				setHSVColor(getHSVColor())
				isHSVColorFocused = false
				break
			case inputHWBId:
				setHWBColor(getHWBColor())
				isHWBColorFocused = false
				break
			case inputCMYKId:
				setCMYKColor(getCMYKColor())
				isCMYKColorFocused = false
				break
			}
		}}>
		<div style={{
			"background-color": colorHslToHex(input())
		}}></div>
		<Toast
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
		<Tooltip
			onFocusIn={ev => {
				const self = ev.currentTarget
				if (textFields.length === 0) {
					textFields.push(...self.querySelectorAll<HTMLInputElement>('input[type=text]'))
				}
				keyboardOnFocusIn(ev, textFields)
			}}
			onFocusOut={ev => keyboardOnFocusOut(ev, textFields)}
			onKeyDown={ev => keyboardOnKeyDown(ev, textFields, {up: 'prev', down: 'next'})}>
			<TextField
				c:label="Hex"
				id={inputHEXId}
				value={hexColor()}
				readOnly={readOnly()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^0-9A-Fa-f]/g, '')
					if (text.length == 0) text = '0'

					text = text.padStart(6, '0')
					if (text.length > 6) text = text.substring(0, 6)

					text = '#' + text
					command(Commands.updateInput, colorHexToHsl(text as HEXColor))
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getHEXColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
			<TextField
				readOnly={readOnly()}
				c:label="RGB"
				id={inputRGBId}
				value={rgbColor()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^\d,]/g, '')
					const rgbArray: number[] = text.split(',').map(
						v => mathClamp(numberSafe(Number.parseInt(v), 0), 0, 0xff)
					)
					while (rgbArray.length < 3) rgbArray.push(0)

					const r = rgbArray[0] / 0xff
					const g = rgbArray[1] / 0xff
					const b = rgbArray[2] / 0xff
					command(Commands.updateInput, colorRgbToHsl({r, g, b}))
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getRGBColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
			<TextField
				readOnly={readOnly()}
				c:label="HSL"
				id={inputHSLId}
				value={hslColor()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^\d,]/g, '')
					const hslArray: number[] = text.split(',').map(
						v => numberSafe(Number.parseInt(v), 0)
					)
					while (hslArray.length < 3) hslArray.push(0)

					const h = mathClamp(hslArray[0], 0, 360) / 360
					const s = mathClamp(hslArray[1], 0, 100) / 100
					const l = mathClamp(hslArray[2], 0, 100) / 100
					command(Commands.updateInput, {h, s, l} satisfies HSLColor)
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getHSLColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
			<TextField
				readOnly={readOnly()}
				c:label="HSV"
				id={inputHSVId}
				value={hsvColor()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^\d,]/g, '')
					const hsvArray: number[] = text.split(',').map(
						v => numberSafe(Number.parseInt(v), 0)
					)
					while (hsvArray.length < 3) hsvArray.push(0)

					const h = mathClamp(hsvArray[0], 0, 360) / 360
					const s = mathClamp(hsvArray[1], 0, 100) / 100
					const v = mathClamp(hsvArray[2], 0, 100) / 100
					command(Commands.updateInput, colorHsvToHsl({h, s, v}))
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getHSVColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
			<TextField
				readOnly={readOnly()}
				c:label="HWB"
				id={inputHWBId}
				value={HWBColor()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^\d,]/g, '')
					const hwbArray: number[] = text.split(',').map(
						v => numberSafe(Number.parseInt(v), 0)
					)
					while (hwbArray.length < 3) hwbArray.push(0)

					const h = mathClamp(hwbArray[0], 0, 360) / 360
					const w = mathClamp(hwbArray[1], 0, 100) / 100
					const b = mathClamp(hwbArray[2], 0, 100 - (w * 100)) / 100
					command(Commands.updateInput, colorHwbToHsl({h, w, b}))
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getHWBColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
			<TextField
				readOnly={readOnly()}
				c:label="CMYK"
				id={inputCMYKId}
				value={cmykColor()}
				onInput={(ev) => {
					let text = ev.currentTarget.value
					text = text.trim()
					text = text.replace(/[^\d,]/g, '')
					const hwbArray: number[] = text.split(',').map(
						v => numberSafe(Number.parseInt(v), 0)
					)
					while (hwbArray.length < 4) hwbArray.push(0)

					const c = mathClamp(hwbArray[0], 0, 100) / 100
					const m = mathClamp(hwbArray[1], 0, 100) / 100
					const y = mathClamp(hwbArray[2], 0, 100) / 100
					const k = mathClamp(hwbArray[3], 0, 100) / 100
					command(Commands.updateInput, colorCmykToHsl({c, m, y, k}))
				}}
				c:trailing={<TextFieldButton
					data-tooltip="Copy"
					data-copy={getCMYKColor()}>
					<Icon c:code={ICON_COPY}/>
				</TextFieldButton>}
			/>
		</Tooltip>
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