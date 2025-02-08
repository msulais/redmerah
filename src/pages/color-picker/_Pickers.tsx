import { createSignal, onCleanup, onMount, type VoidComponent, createMemo, createEffect, Show } from "solid-js"

import type { HSLColor, HEXColor } from "@/types/color"
import { elementRect, elementPointerCaptureRelease, elementPointerCaptureSet } from "@/utils/element"
import { rectHeight, rectLeft, rectTop, rectWidth } from "@/utils/rect"
import { BodyAttributes } from "@/enums/attributes"
import { attrRemove, attrSet } from "@/utils/attributes"
import { eventCurrentTarget, eventStopPropagation } from "@/utils/event"
import { mathClamp, mathRound } from "@/utils/math"
import { colorCmykToHsl, colorContrastRatio, colorHexToHsl, colorHexToRgb, colorHslToCmyk, colorHslToHex, colorHslToHsv, colorHslToHwb, colorHslToRgb, colorHsvToHex, colorHsvToHsl, colorHwbToHsl, colorRgbToHsl } from "@/utils/color"
import { Commands } from "./_enums"
import { stringPadStart, stringSubstring, stringToUpperCase } from "@/utils/string"
import { numberParse, numberToString } from "@/utils/number"
import { fileOpen } from "@/utils/file"
import { regexTest } from "@/utils/regex"
import { urlCreate, urlRevoke } from "@/utils/url"
import { documentBody } from "@/utils/document"
import { promiseDone } from "@/utils/object"
import { arrayJoin } from "@/utils/array"
import { ICON_IMAGE } from "@/constants/icons"

import Button, { ButtonVariant } from "@/components/Button"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'

export const RectanglePicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = documentBody()
	const [hue, setHue] = createSignal<number>(0) // 0-100
	const [left, setLeft] = createSignal<number>(0) // 0-100
	const [top, setTop] = createSignal<number>(0) // 0-100
	const getHSLColor = createMemo<HSLColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return {...colorHsvToHsl({ h, s, v }), h}
	})
	const getHEXColor = createMemo<HEXColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return colorHsvToHex({ h, s, v })
	})
	let colorDragged = false
	let hueDragged = false
	let colorRef: HTMLDivElement
	let colorRect: DOMRect
	let hueRef: HTMLDivElement
	let hueRect: DOMRect
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (colorDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(colorRect)) / rectWidth(colorRect) * 100
			x = mathClamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - rectTop(colorRect)) / rectHeight(colorRect) * 100
			y = mathClamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100
			x = mathClamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = colorDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}
		const {s, v} = colorHslToHsv(input)
		setHue(input.h * 100)
		setLeft(s * 100)
		setTop((1 - v) * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_rectangle}>
		<div
			data-color
			ref={r => colorRef = r}
			draggable={false}
			style={{
				'--hue': `hsl(${hue() / 100 * 360}, 100%, 50%)`
			}}
			onPointerDown={ev => {
				isUpdateLocally = true
				colorDragged = true
				colorRect = elementRect(colorRef)
				setLeft(mathClamp((ev.clientX - rectLeft(colorRect)) / rectWidth(colorRect) * 100, 0, 100))
				setTop(mathClamp((ev.clientY - rectTop(colorRect)) / rectHeight(colorRect) * 100, 0, 100))
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
			}}
			onPointerMove={onPointerMove}
			onPointerCancel={onPointerUp}
			onPointerUp={onPointerUp}>
			<div
				draggable={false}
				class={CSS.picker_indicator}
				style={{
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(colorHexToRgb(getHEXColor()), {r: 0, g: 0, b: 0}) > 50
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
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = elementRect(hueRef)
				setHue(mathClamp((ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100, 0, 100))
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
			}}
			onPointerMove={onPointerMove}
			onPointerCancel={onPointerUp}
			onPointerUp={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(colorHslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
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
	const body = documentBody()
	const [hue, setHUE] = createSignal<number>(0) // 0-100
	const [left, setLeft] = createSignal<number>(0) // 0-100
	const [top, setTop] = createSignal<number>(0) // 0-100
	const getHSLColor = createMemo<HSLColor>(() => {
		const [h, s, l] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return {h, s, l}
	})
	const getHEXColor = createMemo<HEXColor>(() => {
		const [h, s, l] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return colorHslToHex({ h, s, l })
	})
	let colorDragged = false
	let hueDragged = false
	let colorRef: HTMLDivElement
	let colorRect: DOMRect
	let hueRef: HTMLDivElement
	let hueRect: DOMRect
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (colorDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(colorRect)) / rectWidth(colorRect) * 100
			x = mathClamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - rectTop(colorRect)) / rectHeight(colorRect) * 100
			y = mathClamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100
			x = mathClamp(x, 0, 100)
			setHUE(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = colorDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const {h, s, l} = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}
		setHUE(h * 100)
		setLeft(s * 100)
		setTop((1 - l) * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_rectangle_hsl}>
		<div
			data-color
			ref={r => colorRef = r}
			draggable={false}
			style={{
				'--hue': `hsl(${hue() / 100 * 360}, 100%, 50%)`
			}}
			onPointerDown={ev => {
				isUpdateLocally = true
				colorDragged = true
				colorRect = elementRect(colorRef)
				setLeft(mathClamp((ev.clientX - rectLeft(colorRect)) / rectWidth(colorRect) * 100, 0, 100))
				setTop(mathClamp((ev.clientY - rectTop(colorRect)) / rectHeight(colorRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				draggable={false}
				class={CSS.picker_indicator}
				style={{
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(colorHexToRgb(getHEXColor()), {r: 0, g: 0, b: 0}) > 50
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
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = elementRect(hueRef)
				setHUE(mathClamp((ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(colorHslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
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
	const body = documentBody()
	const [hexColor, setHexColor] = createSignal<HEXColor>('#000000')
	const [left, setLeft] = createSignal(0) // 0 -> 100
	const [top, setTop] = createSignal(0) // 0 -> 100
	const [anyImage, setAnyImage] = createSignal(false)
	const getHSLColor = createMemo(() => colorHexToHsl(hexColor()))
	const image = new Image()
	let canvasRef: HTMLCanvasElement
	let canvasContext: CanvasRenderingContext2D
	let imageDragged = false
	let imageRef: HTMLDivElement
	let imageRect: DOMRect

	function pickColor(): void {
		const data = canvasContext.getImageData(left() / 100 * canvasRef.width, top() / 100 * canvasRef.height, 1, 1).data
		setHexColor(arrayJoin([
			'#',
			stringToUpperCase(stringPadStart(numberToString(data[0], 16), 2, '0')),
			stringToUpperCase(stringPadStart(numberToString(data[1], 16), 2, '0')),
			stringToUpperCase(stringPadStart(numberToString(data[2], 16), 2, '0')),
		], '') as HEXColor)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (imageDragged) {
			let x = (ev.clientX - rectLeft(imageRect)) / rectWidth(imageRect) * 100
			x = mathClamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - rectTop(imageRect)) / rectHeight(imageRect) * 100
			y = mathClamp(y, 0, 100)
			setTop(y)
			pickColor()
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		imageDragged = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function initCanvas(): void {
		canvasContext = canvasRef.getContext('2d', {
			willReadFrequently: true,
		})!
	}

	function initImage(): void {
		image.onload = () => {
			canvasRef.width = image.naturalWidth
			canvasRef.height = image.naturalHeight
			canvasContext.drawImage(image, 0, 0)
		}
	}

	function pickImage(): void {
		promiseDone(
			fileOpen('image/*', false),
			(files) => {
				if (!files || files?.length == 0) return;

				for (const file of files) {
					if (!regexTest(/^image/, file.type)) continue

					urlRevoke(image.src)
					image.src = urlCreate(file)
					if (!anyImage()) setAnyImage(true)
					break
				}
			}
		)
	}

	onMount(() => {
		initCanvas()
		initImage()
	})

	onCleanup(() => {
		urlRevoke(image.src)
	})

	return (<div class={CSS.picker_image}>
		<div
			data-image
			ref={r => imageRef = r}
			data-has-image={anyImage()? '' : undefined}
			onPointerDown={ev => {
				imageRect = elementRect(imageRef)
				if (!anyImage()) return;

				setLeft(mathClamp((ev.clientX - rectLeft(imageRect)) / rectWidth(imageRect) * 100, 0, 100))
				setTop(mathClamp((ev.clientY - rectTop(imageRect)) / rectHeight(imageRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				pickColor()
				command(Commands.updateInput, getHSLColor())
				imageDragged = true
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<canvas
				draggable={false}
				ref={r => canvasRef = r}
				data-has-image={anyImage()? '' : undefined}></canvas>
			<Show when={anyImage()}>
				{/* TODO: keyboard accesiblity */}
				<div
					class={CSS.picker_indicator}
					draggable={false}
					style={{
						"background-color": hexColor(),
						"border-color": colorContrastRatio(
							colorHexToRgb(hexColor()),
							{r: 0, g: 0, b: 0}) > 50
								? '#000'
								: '#fff',
						left: left() + '%',
						top: top() + '%',
						transform: 'translate(-12px, -12px)',
					}}></div>
			</Show>
			<Show when={!anyImage()}>
				<Button
					onPointerDown={ev => eventStopPropagation(ev)}
					c:variant={ButtonVariant.tonal}
					onClick={pickImage}>
					<Icon c:code={ICON_IMAGE}/>
					Pick image
				</Button>
			</Show>
		</div>
		<Show when={anyImage()}>
			<Button c:variant={ButtonVariant.tonal} onClick={pickImage}>
				<Icon c:code={ICON_IMAGE}/>
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
	const body = documentBody()
	const [blackness, setBlackness] = createSignal<number>(0) // 0-100
	const [left, setLeft] = createSignal<number>(0) // 0-100
	const [top, setTop] = createSignal<number>(0) // 0-100
	const getHue = createMemo(() => {
		return left() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = left() / 100
		const s = (100 - top()) / 100
		const x = (top() / 2) + 50
		const l = (x - x * (blackness() / 100)) / 100
		return {h, s, l}
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let spectrumDragged = false
	let blacknessDragged = false
	let spectrumRef: HTMLDivElement
	let spectrumRect: DOMRect
	let blacknessRef: HTMLDivElement
	let blacknessRect: DOMRect

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (spectrumDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(spectrumRect)) / rectWidth(spectrumRect) * 100
			x = mathClamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - rectTop(spectrumRect)) / rectHeight(spectrumRect) * 100
			y = mathClamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blacknessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(blacknessRect)) / rectWidth(blacknessRect) * 100
			x = mathClamp(x, 0, 100)
			setBlackness(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		spectrumDragged = blacknessDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const {h, s, l} = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}
		setLeft(h * 100)
		const top = 100 - (100 * s)
		setTop(top)
		const x = top / 2 + 50
		setBlackness((100 * (x - (100 * l))) / x)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_spectrum}>
		<div
			data-spectrum
			draggable={false}
			ref={r => spectrumRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				spectrumDragged = true
				spectrumRect = elementRect(spectrumRef)
				setLeft(mathClamp((ev.clientX - rectLeft(spectrumRect)) / rectWidth(spectrumRect) * 100, 0, 100))
				setTop(mathClamp((ev.clientY - rectTop(spectrumRect)) / rectHeight(spectrumRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, ${50 + (top() / 2)}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({
							h: getHue() / 360,
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
			ref={r => blacknessRef = r}
			onPointerDown={ev => {
				blacknessRect = elementRect(blacknessRef)
				isUpdateLocally = true
				blacknessDragged = true
				setBlackness(mathClamp((ev.clientX - rectLeft(blacknessRect)) / rectWidth(blacknessRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
			style={{'--color': `hsl(${getHue()}, 100%, ${50 + (top() / 2)}%)`}}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${100 - top()}%, ${((top() / 2) + 50) - ((top() / 2) + 50) * (blackness() / 100)}%)`,
					left: blackness() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({
							h: getHue() / 360,
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
	const body = documentBody()
	const [red, setRed] = createSignal(0) // 0 - 100
	const [green, setGreen] = createSignal(0) // 0 - 100
	const [blue, setBlue] = createSignal(0) // 0 - 100
	const getHSLColor = createMemo(() => {
		const r = red() / 100
		const g = green() / 100
		const b = blue() / 100
		return colorRgbToHsl({r, g, b})
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let redDragged = false
	let greenDragged = false
	let blueDragged = false
	let redRect: DOMRect
	let greenRect: DOMRect
	let blueRect: DOMRect
	let redRef: HTMLDivElement
	let greenRef: HTMLDivElement
	let blueRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (redDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(redRect)) / rectWidth(redRect) * 100
			x = mathClamp(x, 0, 100)
			setRed(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(blueRect)) / rectWidth(blueRect) * 100
			x = mathClamp(x, 0, 100)
			setBlue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (greenDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(greenRect)) / rectWidth(greenRect) * 100
			x = mathClamp(x, 0, 100)
			setGreen(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		redDragged = blueDragged = greenDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {r, g, b} = colorHslToRgb(input)
		setRed(r * 100)
		setGreen(g * 100)
		setBlue(b * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_rgb}>
		<p>Red: {mathRound(red() / 100 * 0xff)} ({mathRound(red())}%)</p>
		<div
			data-red
			draggable={false}
			ref={r => redRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				redDragged = true
				redRect = elementRect(redRef)
				setRed(mathClamp((ev.clientX - rectLeft(redRect)) / rectWidth(redRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(0, 100%, ${red() / 100 * 50}%)`,
					left: red() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 0, s: 1, l: (red() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Green: {mathRound(green() / 100 * 0xff)} ({mathRound(green())}%)</p>
		<div
			data-green
			draggable={false}
			ref={r => greenRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				greenDragged = true
				greenRect = elementRect(greenRef)
				setGreen(mathClamp((ev.clientX - rectLeft(greenRect)) / rectWidth(greenRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(120, 100%, ${green() / 100 * 50}%)`,
					left: green() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 120 / 360, s: 1, l: (green() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blue: {mathRound(blue() / 100 * 0xff)} ({mathRound(blue())}%)</p>
		<div
			data-blue
			draggable={false}
			ref={r => blueRef = r}
			onPointerDown={ev => {
				blueDragged = true
				isUpdateLocally = true
				blueRect = elementRect(blueRef)
				setBlue(mathClamp((ev.clientX - rectLeft(blueRect)) / rectWidth(blueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(240, 100%, ${blue() / 100 * 50}%)`,
					left: blue() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 240 / 360, s: 1, l: (blue() / 100 * 50) / 100}),
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
	const body = documentBody()
	const [hue, setHUE] = createSignal(0) // 0 - 100
	const [saturation, setSaturation] = createSignal(0) // 0 - 100
	const [lightness, setLightness] = createSignal(0) // 0 - 100
	const getHue = createMemo(() => {
		return hue() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = hue() / 100
		const s = saturation() / 100
		const l = lightness() / 100

		return {h, s, l}
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let hueDragged = false
	let saturationDragged = false
	let lightnessDragged = false
	let hueRect: DOMRect
	let saturationRect: DOMRect
	let lightnessRect: DOMRect
	let hueRef: HTMLDivElement
	let saturationRef: HTMLDivElement
	let lightnessRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100
			x = mathClamp(x, 0, 100)
			setHUE(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (lightnessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(lightnessRect)) / rectWidth(lightnessRect) * 100
			x = mathClamp(x, 0, 100)
			setLightness(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (saturationDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(saturationRect)) / rectWidth(saturationRect) * 100
			x = mathClamp(x, 0, 100)
			setSaturation(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = lightnessDragged = saturationDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const {h, s, l} = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		setHUE(h * 100)
		setSaturation(s * 100)
		setLightness(l * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hsl} style={{'--hue': getHue()}}>
		<p>Hue: {mathRound(getHue())}° ({mathRound(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = elementRect(hueRef)
				setHUE(mathClamp((ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {mathRound(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturationRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				saturationDragged = true
				saturationRect = elementRect(saturationRef)
				setSaturation(mathClamp((ev.clientX - rectLeft(saturationRect)) / rectWidth(saturationRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Lightness: {mathRound(lightness())}%</p>
		<div
			data-lightness
			draggable={false}
			ref={r => lightnessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				lightnessDragged = true
				lightnessRect = elementRect(lightnessRef)
				setLightness(mathClamp((ev.clientX - rectLeft(lightnessRect)) / rectWidth(lightnessRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: lightness() + '%',
					"background-color": `hsl(0, 0%, ${lightness()}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 0, s: 1, l: lightness()/ 100}),
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
	const body = documentBody()
	const [cyan, setCyan] = createSignal(0) // 0 - 100
	const [magenta, setMagenta] = createSignal(0) // 0 - 100
	const [yellow, setYellow] = createSignal(0) // 0 - 100
	const [key, setKey] = createSignal(0) // 0 - 100
	const getHSLColor = createMemo<HSLColor>(() => {
		const c = cyan() / 100
		const m = magenta() / 100
		const y = yellow() / 100
		const k = (100 - key()) / 100

		return colorCmykToHsl({c, m, y, k})
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let cyanDragged = false
	let magentaDragged = false
	let yellowDragged = false
	let keyDragged = false
	let cyanRect: DOMRect
	let magentaRect: DOMRect
	let yellowRect: DOMRect
	let keyRect: DOMRect
	let cyanRef: HTMLDivElement
	let magentaRef: HTMLDivElement
	let yellowRef: HTMLDivElement
	let keyRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (cyanDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(cyanRect)) / rectWidth(cyanRect) * 100
			x = mathClamp(x, 0, 100)
			setCyan(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (yellowDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(yellowRect)) / rectWidth(yellowRect) * 100
			x = mathClamp(x, 0, 100)
			setYellow(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (magentaDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(magentaRect)) / rectWidth(magentaRect) * 100
			x = mathClamp(x, 0, 100)
			setMagenta(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (keyDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(keyRect)) / rectWidth(keyRect) * 100
			x = mathClamp(x, 0, 100)
			setKey(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		cyanDragged = yellowDragged = magentaDragged = keyDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {c, m, y, k} = colorHslToCmyk(input)
		setCyan(c * 100)
		setMagenta(m * 100)
		setYellow(y * 100)
		setKey(100 - k * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_cmyk}>
		<p>Cyan: {mathRound(cyan())}%</p>
		<div
			data-cyan
			draggable={false}
			ref={r => cyanRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				cyanDragged = true
				cyanRect = elementRect(cyanRef)
				setCyan(mathClamp((ev.clientX - rectLeft(cyanRect)) / rectWidth(cyanRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: cyan() + '%',
					"background-color": `hsl(180, 100%, ${cyan() / 100 * 50}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 180 / 360, s: 1, l: cyan() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Magenta: {mathRound(magenta())}%</p>
		<div
			data-magenta
			draggable={false}
			ref={r => magentaRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				magentaDragged = true
				magentaRect = elementRect(magentaRef)
				setMagenta(mathClamp((ev.clientX - rectLeft(magentaRect)) / rectWidth(magentaRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: magenta() + '%',
					"background-color": `hsl(300, 100%, ${magenta() / 100 * 50}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 300 / 360, s: 1, l: magenta() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Yellow: {mathRound(yellow())}%</p>
		<div
			data-yellow
			draggable={false}
			ref={r => yellowRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				yellowDragged = true
				yellowRect = elementRect(yellowRef)
				setYellow(mathClamp((ev.clientX - rectLeft(yellowRect)) / rectWidth(yellowRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(60, 100%, ${yellow() / 100 * 50}%)`,
					left: yellow() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 60 / 360, s: 1, l: yellow() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Key: {100 - mathRound(key())}%</p>
		<div
			data-key
			draggable={false}
			ref={r => keyRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				keyDragged = true
				keyRect = elementRect(keyRef)
				setKey(mathClamp((ev.clientX - rectLeft(keyRect)) / rectWidth(keyRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: key() + '%',
					"background-color": `hsl(0, 0%, ${key()}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 0, s: 1, l: key() / 100}),
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
	const body = documentBody()
	const [hex, setHex] = createSignal(0) // 0 - 100
	const getHEXColor = createMemo(() => {
		return '#' + stringPadStart(numberToString(mathRound(hex() / 100 * 0xffffff), 16), 6, '0') as HEXColor
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = getHEXColor()
		return colorHexToHsl(h)
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let hexDragged = false
	let hexRect: DOMRect
	let hexRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (hexDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hexRect)) / rectWidth(hexRect) * 100
			x = mathClamp(x, 0, 100)
			setHex(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hexDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const hex = numberParse(stringSubstring(colorHslToHex(input), 1), true, 16) / 0xffffff
		setHex(hex * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hex}>
		<p>Hex: {stringToUpperCase(getHEXColor())} ({mathRound(hex() / 100 * 0xffffff)})</p>
		<div
			data-hex
			draggable={false}
			ref={r => hexRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hexDragged = true
				hexRect = elementRect(hexRef)
				setHex(mathClamp((ev.clientX - rectLeft(hexRect)) / rectWidth(hexRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: hex() + '%',
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(
						colorHexToRgb(getHEXColor()),
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
	const body = documentBody()
	const [hue, setHUE] = createSignal(0) // 0 - 100
	const [saturation, setSaturation] = createSignal(0) // 0 - 100
	const [value, setValue] = createSignal(0) // 0 - 100
	const getHue = createMemo(() => {
		return hue() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = hue() / 100
		const s = saturation() / 100
		const v = value() / 100

		return colorHsvToHsl({h, s, v})
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let hueDragged = false
	let saturation_dragged = false
	let valueDragged = false
	let hueRect: DOMRect
	let saturationRect: DOMRect
	let valueRect: DOMRect
	let hueRef: HTMLDivElement
	let saturationRef: HTMLDivElement
	let valueRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100
			x = mathClamp(x, 0, 100)
			setHUE(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (valueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(valueRect)) / rectWidth(valueRect) * 100
			x = mathClamp(x, 0, 100)
			setValue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (saturation_dragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(saturationRect)) / rectWidth(saturationRect) * 100
			x = mathClamp(x, 0, 100)
			setSaturation(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = valueDragged = saturation_dragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {h, s, v} = colorHslToHsv(input)
		setHUE(h * 100)
		setSaturation(s * 100)
		setValue(v * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hsv} style={{'--hue': getHue()}}>
		<p>Hue: {mathRound(getHue())}° ({mathRound(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = elementRect(hueRef)
				setHUE(mathClamp((ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {mathRound(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturationRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				saturation_dragged = true
				saturationRect = elementRect(saturationRef)
				setSaturation(mathClamp((ev.clientX - rectLeft(saturationRect)) / rectWidth(saturationRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Value: {mathRound(value())}%</p>
		<div
			data-value
			draggable={false}
			ref={r => valueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				valueDragged = true
				valueRect = elementRect(valueRef)
				setValue(mathClamp((ev.clientX - rectLeft(valueRect)) / rectWidth(valueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: value() + '%',
					"background-color": `hsl(0, 0%, ${value()}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: 0, s: 1, l: value()/ 100}),
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
	const body = documentBody()
	const [hue, setHUE] = createSignal(0) // 0 - 100
	const [whiteness, setWhiteness] = createSignal(0) // 0 - 100
	const [blackness, setBlackness] = createSignal(0) // 0 - 100
	const getHue = createMemo(() => {
		return hue() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = hue() / 100
		const w = mathClamp(whiteness() / 100, 0, 1)
		const b = mathClamp(blackness() / 100, 0, 1)

		return colorHwbToHsl({h, w, b})
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let hueDragged = false
	let whitenessDragged = false
	let blacknessDragged = false
	let hueRect: DOMRect
	let whitenessRect: DOMRect
	let blacknessRect: DOMRect
	let hueRef: HTMLDivElement
	let whitenessRef: HTMLDivElement
	let blacknessRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100
			x = mathClamp(x, 0, 100)
			setHUE(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blacknessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(blacknessRect)) / rectWidth(blacknessRect) * 100
			x = mathClamp(x, 0, 100)
			setBlackness(x)
			setWhiteness(mathClamp(whiteness(), 0, 100 - blackness()))
			command(Commands.updateInput, getHSLColor())
		}
		else if (whitenessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - rectLeft(whitenessRect)) / rectWidth(whitenessRect) * 100
			x = mathClamp(x, 0, 100)
			setWhiteness(x)
			setBlackness(mathClamp(blackness(), 0, 100 - whiteness()))
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = blacknessDragged = whitenessDragged = isUpdateLocally = false
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
		attrRemove(body, BodyAttributes.noPointerEvent)
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {h, w, b} = colorHslToHwb(input)
		setHUE(h * 100)
		setWhiteness(w * 100)
		setBlackness(b * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hwb} style={{'--hue': getHue()}}>
		<p>Hue: {mathRound(getHue())}° ({mathRound(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = elementRect(hueRef)
				setHUE(mathClamp((ev.clientX - rectLeft(hueRect)) / rectWidth(hueRect) * 100, 0, 100))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Whiteness: {mathRound(whiteness())}%</p>
		<div
			data-whiteness
			draggable={false}
			ref={r => whitenessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				whitenessDragged = true
				whitenessRect = elementRect(whitenessRef)
				setWhiteness(mathClamp((ev.clientX - rectLeft(whitenessRect)) / rectWidth(whitenessRect) * 100, 0, 100))
				setBlackness(mathClamp(blackness(), 0, 100 - whiteness()))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, ${50 + (whiteness() / 100 * 50)}%)`,
					left: whiteness() + '%',
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: 1, l: 0.5 + (whiteness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blackness: {mathRound(blackness())}%</p>
		<div
			data-blackness
			draggable={false}
			ref={r => blacknessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				blacknessDragged = true
				blacknessRect = elementRect(blacknessRef)
				setBlackness(mathClamp((ev.clientX - rectLeft(blacknessRect)) / rectWidth(blacknessRect) * 100, 0, 100))
				setWhiteness(mathClamp(whiteness(), 0, 100 - blackness()))
				attrSet(body, BodyAttributes.noPointerEvent)
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: blackness() + '%',
					"background-color": `hsl(${getHue()}, 100%, ${50 - (blackness() / 100 * 50)}%)`,
					"border-color": colorContrastRatio(
						colorHslToRgb({h: hue() / 100, s: 1, l: 0.5 - (blackness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}