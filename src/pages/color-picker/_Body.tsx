import { createMemo, createSignal as createSignal, createEffect, Match, Switch, type VoidComponent, createUniqueId } from "solid-js"

import type { HEXColor, HSLColor } from "@/types/color"
import type { Settings } from "./_types"
import { ColorPickerMode, Commands } from "./_enums"
import { ImagePicker, PalettePicker, RectangleHSLPicker, RectanglePicker, SliderCMYKPicker, SliderHEXPicker, SliderHSLPicker, SliderHSVPicker, SliderHWBPicker, SliderRGBPicker, SpectrumPicker, WheelPicker } from "./_Pickers"
import { stringLength, stringPadStart, stringReplace, stringSplit, stringSubstring, stringToUpperCase, stringTrim } from "@/utils/string"
import { colorCmykToHsl, colorHexToHsl, colorHslToCmyk, colorHslToHex, colorHslToHsv, colorHslToHwb, colorHslToRgb, colorHsvToHsl, colorHwbToHsl, colorRgbToHsl } from "@/utils/color"
import { mathClamp, mathRound } from "@/utils/math"
import { arrayJoin, arrayLength, arrayMap, arrayPush } from "@/utils/array"
import { numberParse, numberSafe } from "@/utils/number"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { documentActive } from "@/utils/document"
import { promiseDone } from "@/utils/object"
import { ICON_COPY } from "@/constants/icons"

import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField, { TextFieldButton } from "@/components/TextField"
import Toast, { openToast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
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
	const getHEXColor = createMemo(() => stringToUpperCase(colorHslToHex(input())))
	const getRGBColor = createMemo(() => {
		const {r, g, b} = colorHslToRgb(input())
		return arrayJoin([
			mathRound(r * 0xff),
			mathRound(g * 0xff),
			mathRound(b * 0xff)
		], ', ')
	})
	const getHSLColor = createMemo(() => {
		const {h, s, l} = input()
		return `${mathRound(h * 360)}°, ${mathRound(s * 100)}%, ${mathRound(l * 100)}%`
	})
	const getHSVColor = createMemo(() => {
		const {h, s, v} = colorHslToHsv(input())
		return `${mathRound(h * 360)}°, ${mathRound(s * 100)}%, ${mathRound(v * 100)}%`
	})
	const getHWBColor = createMemo(() => {
		const {h, w, b} = colorHslToHwb(input())
		return `${mathRound(h * 360)}°, ${mathRound(w * 100)}%, ${mathRound(b * 100)}%`
	})
	const getCMYKColor = createMemo(() => {
		const {c, m, y, k} = colorHslToCmyk(input())
		return `${mathRound(c * 100)}%, ${mathRound(m * 100)}%, ${mathRound(y * 100)}%, ${mathRound(k * 100)}%`
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
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			const data_copy = elementDataset(button, 'copy')
			if (data_copy) return promiseDone(
				navigatorClipboardWriteText(data_copy),
				() => openToast(ev, toastCopiedRef)
			)
		}}
		onFocusIn={ev => {
			const target = eventTarget(ev) as HTMLInputElement
			switch (elementId(target)) {
			case inputHEXId: isHEXColorFocused = true; break
			case inputRGBId: isRGBColorFocused = true; break
			case inputHSLId: isHSLColorFocused = true; break
			case inputHSVId: isHSVColorFocused = true; break
			case inputHWBId: isHWBColorFocused = true; break
			case inputCMYKId: isCMYKColorFocused = true; break
			}
		}}
		onFocusOut={ev => {
			const target = eventTarget(ev) as HTMLInputElement
			switch (elementId(target)) {
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
		<Tooltip>
			<TextField
				c:label="Hex"
				id={inputHEXId}
				value={hexColor()}
				readOnly={readOnly()}
				onInput={(ev) => {
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^0-9A-Fa-f]/g, '')
					if (stringLength(text) == 0) text = '0'

					text = stringPadStart(text, 6, '0')
					if (stringLength(text) > 6) text = stringSubstring(text, 0, 6)

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
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^\d,]/g, '')
					const rgb_array: number[] = arrayMap(
						stringSplit(text, ','),
						v => mathClamp(numberSafe(numberParse(v, true), 0), 0, 0xff)
					)
					while (arrayLength(rgb_array) < 3) {
						arrayPush(rgb_array, 0)
					}

					const r = rgb_array[0] / 0xff
					const g = rgb_array[1] / 0xff
					const b = rgb_array[2] / 0xff
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
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^\d,]/g, '')
					const hsl_array: number[] = arrayMap(
						stringSplit(text, ','),
						v => numberSafe(numberParse(v, true), 0)
					)
					while (arrayLength(hsl_array) < 3) {
						arrayPush(hsl_array, 0)
					}

					const h = mathClamp(hsl_array[0], 0, 360) / 360
					const s = mathClamp(hsl_array[1], 0, 100) / 100
					const l = mathClamp(hsl_array[2], 0, 100) / 100
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
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^\d,]/g, '')
					const hsv_array: number[] = arrayMap(
						stringSplit(text, ','),
						v => numberSafe(numberParse(v, true), 0)
					)
					while (arrayLength(hsv_array) < 3) {
						arrayPush(hsv_array, 0)
					}

					const h = mathClamp(hsv_array[0], 0, 360) / 360
					const s = mathClamp(hsv_array[1], 0, 100) / 100
					const v = mathClamp(hsv_array[2], 0, 100) / 100
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
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^\d,]/g, '')
					const hwb_array: number[] = arrayMap(
						stringSplit(text, ','),
						v => numberSafe(numberParse(v, true), 0)
					)
					while (arrayLength(hwb_array) < 3) {
						arrayPush(hwb_array, 0)
					}

					const h = mathClamp(hwb_array[0], 0, 360) / 360
					const w = mathClamp(hwb_array[1], 0, 100) / 100
					const b = mathClamp(hwb_array[2], 0, 100 - (w * 100)) / 100
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
					let text = eventCurrentTarget(ev).value
					text = stringTrim(text)
					text = stringReplace(text, /[^\d,]/g, '')
					const hwb_array: number[] = arrayMap(
						stringSplit(text, ','),
						v => numberSafe(numberParse(v, true), 0)
					)
					while (arrayLength(hwb_array) < 4) {
						arrayPush(hwb_array, 0)
					}

					const c = mathClamp(hwb_array[0], 0, 100) / 100
					const m = mathClamp(hwb_array[1], 0, 100) / 100
					const y = mathClamp(hwb_array[2], 0, 100) / 100
					const k = mathClamp(hwb_array[3], 0, 100) / 100
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