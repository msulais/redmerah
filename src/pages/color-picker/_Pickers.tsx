import { createSignal, onCleanup, onMount, type VoidComponent, createMemo, createEffect, Show } from "solid-js"

import type { HSLColor, HEXColor } from "@/types/color"
import { BodyAttributes } from "@/enums/attributes"
import { Math_clamp } from "@/utils/math"
import { cmykToHsl, colorContrastRatio, hexToHsl, hexToRgb, hslToCmyk, hslToHex, hslToHsv, hslToHwb, hslToRgb, hsvToHex, hsvToHsl, hwbToHsl, rgbToHsl } from "@/utils/color"
import { Commands } from "./_enums"
import { pickFile } from "@/utils/file"
import { ICON_IMAGE } from "@/constants/icons"

import Button, { ButtonVariant } from "@/components/Button"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from "@/constants/key-code"

export const RectanglePicker: VoidComponent<{
	input: HSLColor
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const body = document.body
	const [hue, setHue] = createSignal<number>(0) // 0-100
	const [left, setLeft] = createSignal<number>(0) // 0-100
	const [top, setTop] = createSignal<number>(0) // 0-100
	const getHSLColor = createMemo<HSLColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return {...hsvToHsl({ h, s, v }), h}
	})
	const getHEXColor = createMemo<HEXColor>(() => {
		const [h, s, v] = [
			hue() / 100,
			left() / 100,
			(100 - top()) / 100
		]
		return hsvToHex({ h, s, v })
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
			let x = (ev.clientX - colorRect.left) / colorRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - colorRect.top) / colorRect.height * 100
			y = Math_clamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - hueRect.left) / hueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = colorDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		const isUp = code === KEY_ARROW_UP
		const isRight = code === KEY_ARROW_RIGHT
		const isDown = code === KEY_ARROW_DOWN
		const isLeft = code === KEY_ARROW_LEFT
		if (colorDragged && (isUp || isRight || isDown || isLeft)) {
			ev.preventDefault() // disable scroll
			isUpdateLocally = true
			let x = left()
			let y = top()

			switch (code) {
			case KEY_ARROW_UP: y -= 1; break
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_DOWN: y += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			y = Math_clamp(y, 0, 100)
			setLeft(x)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
			colorRef.firstElementChild!.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}
		else if (hueDragged && (isRight || isLeft)) {
			isUpdateLocally = true
			let x = hue()

			switch (code) {
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
			hueRef.firstElementChild!.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}

		hueDragged = colorDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}
		const {s, v} = hslToHsv(input)
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
				colorRect = colorRef.getBoundingClientRect()
				setLeft(Math_clamp((ev.clientX - colorRect.left) / colorRect.width * 100, 0, 100))
				setTop(Math_clamp((ev.clientY - colorRect.top) / colorRect.height * 100, 0, 100))
				ev.currentTarget.setPointerCapture(ev.pointerId)
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
			}}
			onKeyDown={ev => {
				colorDragged = true
				colorRect = colorRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerCancel={onPointerUp}
			onPointerUp={onPointerUp}>
			<div
				draggable={false}
				tabIndex={0}
				class={CSS.picker_indicator}
				style={{
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(hexToRgb(getHEXColor()), {r: 0, g: 0, b: 0}) > 50
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
				hueRect = hueRef.getBoundingClientRect()
				setHue(Math_clamp((ev.clientX - hueRect.left) / hueRect.width * 100, 0, 100))
				ev.currentTarget.setPointerCapture(ev.pointerId)
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
			}}
			onKeyDown={ev => {
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerCancel={onPointerUp}
			onPointerUp={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(hslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
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
	const [hue, setHue] = createSignal<number>(0) // 0-100
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
		return hslToHex({ h, s, l })
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
			let x = (ev.clientX - colorRect.left) / colorRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - colorRect.top) / colorRect.height * 100
			y = Math_clamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (hueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - hueRect.left) / hueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = colorDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		const isUp = code === KEY_ARROW_UP
		const isRight = code === KEY_ARROW_RIGHT
		const isDown = code === KEY_ARROW_DOWN
		const isLeft = code === KEY_ARROW_LEFT
		if (colorDragged && (isUp || isRight || isDown || isLeft)) {
			ev.preventDefault() // disable scroll
			isUpdateLocally = true
			let x = left()
			let y = top()

			switch (code) {
			case KEY_ARROW_UP: y -= 1; break
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_DOWN: y += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			y = Math_clamp(y, 0, 100)
			setLeft(x)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
			colorRef.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}
		else if (hueDragged && (isRight || isLeft)) {
			isUpdateLocally = true
			let x = hue()

			switch (code) {
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
			hueRef.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}

		hueDragged = colorDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const {h, s, l} = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}
		setHue(h * 100)
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
				colorRect = colorRef.getBoundingClientRect()
				setLeft(Math_clamp((ev.clientX - colorRect.left) / colorRect.width * 100, 0, 100))
				setTop(Math_clamp((ev.clientY - colorRect.top) / colorRect.height * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				colorDragged = true
				colorRect = colorRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				draggable={false}
				class={CSS.picker_indicator}
				style={{
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(hexToRgb(getHEXColor()), {r: 0, g: 0, b: 0}) > 50
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
				hueRect = hueRef.getBoundingClientRect()
				setHue(Math_clamp((ev.clientX - hueRect.left) / hueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(hslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
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
	const [hexColor, setHexColor] = createSignal<HEXColor>('#000000')
	const [left, setLeft] = createSignal(0) // 0 -> 100
	const [top, setTop] = createSignal(0) // 0 -> 100
	const [anyImage, setAnyImage] = createSignal(false)
	const getHSLColor = createMemo(() => hexToHsl(hexColor()))
	const image = new Image()
	let canvasRef: HTMLCanvasElement
	let canvasContext: CanvasRenderingContext2D
	let imageDragged = false
	let imageRef: HTMLDivElement
	let imageRect: DOMRect

	function pickColor(): void {
		const data = canvasContext.getImageData(left() / 100 * canvasRef.width, top() / 100 * canvasRef.height, 1, 1).data
		setHexColor([
			'#',
			data[0].toString(16).padStart(2, '0').toUpperCase(),
			data[1].toString(16).padStart(2, '0').toUpperCase(),
			data[2].toString(16).padStart(2, '0').toUpperCase(),
		].join('') as HEXColor)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (imageDragged) {
			let x = (ev.clientX - imageRect.left) / imageRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - imageRect.top) / imageRect.height * 100
			y = Math_clamp(y, 0, 100)
			setTop(y)
			pickColor()
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		imageDragged = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		const isUp = code === KEY_ARROW_UP
		const isRight = code === KEY_ARROW_RIGHT
		const isDown = code === KEY_ARROW_DOWN
		const isLeft = code === KEY_ARROW_LEFT
		if (imageDragged && (isUp || isRight || isDown || isLeft)) {
			ev.preventDefault() // disable scroll
			let x = left()
			let y = top()

			switch (code) {
			case KEY_ARROW_UP: y -= 1; break
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_DOWN: y += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			y = Math_clamp(y, 0, 100)
			setLeft(x)
			setTop(y)
			pickColor()
			canvasRef.nextElementSibling?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		imageDragged = false
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
		pickFile('image/*', false).then((files) => {
			if (!files || files?.length == 0) return;

			for (const file of files) {
				if (!/^image/.test(file.type)) continue

				URL.revokeObjectURL(image.src)
				image.src = URL.createObjectURL(file)
				if (!anyImage()) setAnyImage(true)
				break
			}
		})
	}

	onMount(() => {
		initCanvas()
		initImage()
	})

	onCleanup(() => {
		URL.revokeObjectURL(image.src)
	})

	return (<div class={CSS.picker_image}>
		<div
			data-image
			ref={r => imageRef = r}
			data-has-image={anyImage()? '' : undefined}
			onPointerDown={ev => {
				imageRect = imageRef.getBoundingClientRect()
				if (!anyImage()) return;

				setLeft(Math_clamp((ev.clientX - imageRect.left) / imageRect.width * 100, 0, 100))
				setTop(Math_clamp((ev.clientY - imageRect.top) / imageRect.height * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				pickColor()
				command(Commands.updateInput, getHSLColor())
				imageDragged = true
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				imageDragged = true
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<canvas
				draggable={false}
				ref={r => canvasRef = r}
				data-has-image={anyImage()? '' : undefined}></canvas>
			<Show when={anyImage()}>
				<div
					tabIndex={0}
					class={CSS.picker_indicator}
					draggable={false}
					style={{
						"background-color": hexColor(),
						"border-color": colorContrastRatio(
							hexToRgb(hexColor()),
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
					onPointerDown={ev => ev.stopPropagation()}
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
	const body = document.body
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
			let x = (ev.clientX - spectrumRect.left) / spectrumRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLeft(x)

			let y = (ev.clientY - spectrumRect.top) / spectrumRect.height * 100
			y = Math_clamp(y, 0, 100)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blacknessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - blacknessRect.left) / blacknessRect.width * 100
			x = Math_clamp(x, 0, 100)
			setBlackness(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		spectrumDragged = blacknessDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		const isUp = code === KEY_ARROW_UP
		const isRight = code === KEY_ARROW_RIGHT
		const isDown = code === KEY_ARROW_DOWN
		const isLeft = code === KEY_ARROW_LEFT
		if (spectrumDragged && (isUp || isRight || isDown || isLeft)) {
			ev.preventDefault() // disable scroll
			isUpdateLocally = true
			let x = left()
			let y = top()

			switch (code) {
			case KEY_ARROW_UP: y -= 1; break
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_DOWN: y += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			y = Math_clamp(y, 0, 100)
			setLeft(x)
			setTop(y)
			command(Commands.updateInput, getHSLColor())
			spectrumRef.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}
		else if (blacknessDragged && (isRight || isLeft)) {
			isUpdateLocally = true
			let x = blackness()

			switch (code) {
			case KEY_ARROW_RIGHT: x += 1; break
			case KEY_ARROW_LEFT: x -= 1; break
			}

			x = Math_clamp(x, 0, 100)
			setBlackness(x)
			command(Commands.updateInput, getHSLColor())
			blacknessRef.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
		}

		spectrumDragged = blacknessDragged = isUpdateLocally = false
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
				spectrumRect = spectrumRef.getBoundingClientRect()
				setLeft(Math_clamp((ev.clientX - spectrumRect.left) / spectrumRect.width * 100, 0, 100))
				setTop(Math_clamp((ev.clientY - spectrumRect.top) / spectrumRect.height * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				spectrumDragged = true
				spectrumRect = spectrumRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, ${50 + (top() / 2)}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({
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
				blacknessRect = blacknessRef.getBoundingClientRect()
				isUpdateLocally = true
				blacknessDragged = true
				setBlackness(Math_clamp((ev.clientX - blacknessRect.left) / blacknessRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				blacknessDragged = true
				blacknessRect = blacknessRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
			style={{'--color': `hsl(${getHue()}, 100%, ${50 + (top() / 2)}%)`}}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${100 - top()}%, ${((top() / 2) + 50) - ((top() / 2) + 50) * (blackness() / 100)}%)`,
					left: blackness() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({
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
	const body = document.body
	const [red, setRed] = createSignal(0) // 0 - 100
	const [green, setGreen] = createSignal(0) // 0 - 100
	const [blue, setBlue] = createSignal(0) // 0 - 100
	const getHSLColor = createMemo(() => {
		const r = red() / 100
		const g = green() / 100
		const b = blue() / 100
		return rgbToHsl({r, g, b})
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
			let x = (ev.clientX - redRect.left) / redRect.width * 100
			x = Math_clamp(x, 0, 100)
			setRed(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - blueRect.left) / blueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setBlue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (greenDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - greenRect.left) / greenRect.width * 100
			x = Math_clamp(x, 0, 100)
			setGreen(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		redDragged = blueDragged = greenDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			redDragged = blueDragged = greenDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref = redRef
		let x = 0
		if (redDragged) x = red()
		else if (greenDragged) x = green()
		else if (blueDragged) x = blue()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (redDragged) {
			setRed(x)
			ref = redRef
		}
		else if (greenDragged) {
			setGreen(x)
			ref = greenRef
		}
		else if (blueDragged) {
			setBlue(x)
			ref = blueRef
		}

		if (redDragged || greenDragged || blueDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		redDragged = blueDragged = greenDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {r, g, b} = hslToRgb(input)
		setRed(r * 100)
		setGreen(g * 100)
		setBlue(b * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_rgb}>
		<p>Red: {Math.round(red() / 100 * 0xff)} ({Math.round(red())}%)</p>
		<div
			data-red
			draggable={false}
			ref={r => redRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				redDragged = true
				redRect = redRef.getBoundingClientRect()
				setRed(Math_clamp((ev.clientX - redRect.left) / redRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				redDragged = true
				redRect = redRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(0, 100%, ${red() / 100 * 50}%)`,
					left: red() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: 0, s: 1, l: (red() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Green: {Math.round(green() / 100 * 0xff)} ({Math.round(green())}%)</p>
		<div
			data-green
			draggable={false}
			ref={r => greenRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				greenDragged = true
				greenRect = greenRef.getBoundingClientRect()
				setGreen(Math_clamp((ev.clientX - greenRect.left) / greenRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				greenDragged = true
				greenRect = greenRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(120, 100%, ${green() / 100 * 50}%)`,
					left: green() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: 120 / 360, s: 1, l: (green() / 100 * 50) / 100}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blue: {Math.round(blue() / 100 * 0xff)} ({Math.round(blue())}%)</p>
		<div
			data-blue
			draggable={false}
			ref={r => blueRef = r}
			onPointerDown={ev => {
				blueDragged = true
				isUpdateLocally = true
				blueRect = blueRef.getBoundingClientRect()
				setBlue(Math_clamp((ev.clientX - blueRect.left) / blueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				blueDragged = true
				blueRect = blueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(240, 100%, ${blue() / 100 * 50}%)`,
					left: blue() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: 240 / 360, s: 1, l: (blue() / 100 * 50) / 100}),
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
	const [hue, setHue] = createSignal(0) // 0 - 100
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
			let x = (ev.clientX - hueRect.left) / hueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (lightnessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - lightnessRect.left) / lightnessRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLightness(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (saturationDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - saturationRect.left) / saturationRect.width * 100
			x = Math_clamp(x, 0, 100)
			setSaturation(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = lightnessDragged = saturationDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			hueDragged = lightnessDragged = saturationDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref = hueRef
		let x = 0
		if (hueDragged) x = hue()
		else if (lightnessDragged) x = lightness()
		else if (saturationDragged) x = saturation()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (hueDragged) {
			setHue(x)
			ref = hueRef
		}
		else if (lightnessDragged) {
			setLightness(x)
			ref = lightnessRef
		}
		else if (saturationDragged) {
			setSaturation(x)
			ref = saturationRef
		}

		if (hueDragged || lightnessDragged || saturationDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		hueDragged = lightnessDragged = saturationDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const {h, s, l} = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		setHue(h * 100)
		setSaturation(s * 100)
		setLightness(l * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hsl} style={{'--hue': getHue()}}>
		<p>Hue: {Math.round(getHue())}° ({Math.round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				setHue(Math_clamp((ev.clientX - hueRect.left) / hueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {Math.round(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturationRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				saturationDragged = true
				saturationRect = saturationRef.getBoundingClientRect()
				setSaturation(Math_clamp((ev.clientX - saturationRect.left) / saturationRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				saturationDragged = true
				saturationRect = saturationRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Lightness: {Math.round(lightness())}%</p>
		<div
			data-lightness
			draggable={false}
			ref={r => lightnessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				lightnessDragged = true
				lightnessRect = lightnessRef.getBoundingClientRect()
				setLightness(Math_clamp((ev.clientX - lightnessRect.left) / lightnessRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				lightnessDragged = true
				lightnessRect = lightnessRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: lightness() + '%',
					"background-color": `hsl(0, 0%, ${lightness()}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: 0, s: 1, l: lightness()/ 100}),
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
	const [cyan, setCyan] = createSignal(0) // 0 - 100
	const [magenta, setMagenta] = createSignal(0) // 0 - 100
	const [yellow, setYellow] = createSignal(0) // 0 - 100
	const [key, setKey] = createSignal(0) // 0 - 100
	const getHSLColor = createMemo<HSLColor>(() => {
		const c = cyan() / 100
		const m = magenta() / 100
		const y = yellow() / 100
		const k = (100 - key()) / 100

		return cmykToHsl({c, m, y, k})
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
			let x = (ev.clientX - cyanRect.left) / cyanRect.width * 100
			x = Math_clamp(x, 0, 100)
			setCyan(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (yellowDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - yellowRect.left) / yellowRect.width * 100
			x = Math_clamp(x, 0, 100)
			setYellow(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (magentaDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - magentaRect.left) / magentaRect.width * 100
			x = Math_clamp(x, 0, 100)
			setMagenta(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (keyDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - keyRect.left) / keyRect.width * 100
			x = Math_clamp(x, 0, 100)
			setKey(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		cyanDragged = yellowDragged = magentaDragged = keyDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			cyanDragged = yellowDragged = magentaDragged = keyDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref: HTMLElement = cyanRef
		let x = 0
		if (cyanDragged) x = cyan()
		else if (yellowDragged) x = yellow()
		else if (magentaDragged) x = magenta()
		else if (keyDragged) x = key()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (cyanDragged) {
			setCyan(x)
			ref = cyanRef
		}
		else if (yellowDragged) {
			setYellow(x)
			ref = yellowRef
		}
		else if (magentaDragged) {
			setMagenta(x)
			ref = magentaRef
		}
		else if (keyDragged) {
			setKey(x)
			ref = keyRef
		}

		if (cyanDragged || yellowDragged || magentaDragged || keyDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		cyanDragged = yellowDragged = magentaDragged = keyDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {c, m, y, k} = hslToCmyk(input)
		setCyan(c * 100)
		setMagenta(m * 100)
		setYellow(y * 100)
		setKey(100 - k * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_cmyk}>
		<p>Cyan: {Math.round(cyan())}%</p>
		<div
			data-cyan
			draggable={false}
			ref={r => cyanRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				cyanDragged = true
				cyanRect = cyanRef.getBoundingClientRect()
				setCyan(Math_clamp((ev.clientX - cyanRect.left) / cyanRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				cyanDragged = true
				cyanRect = cyanRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: cyan() + '%',
					"background-color": `hsl(180, 100%, ${cyan() / 100 * 50}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: 180 / 360, s: 1, l: cyan() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Magenta: {Math.round(magenta())}%</p>
		<div
			data-magenta
			draggable={false}
			ref={r => magentaRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				magentaDragged = true
				magentaRect = magentaRef.getBoundingClientRect()
				setMagenta(Math_clamp((ev.clientX - magentaRect.left) / magentaRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				magentaDragged = true
				magentaRect = magentaRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: magenta() + '%',
					"background-color": `hsl(300, 100%, ${magenta() / 100 * 50}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: 300 / 360, s: 1, l: magenta() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Yellow: {Math.round(yellow())}%</p>
		<div
			data-yellow
			draggable={false}
			ref={r => yellowRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				yellowDragged = true
				yellowRect = yellowRef.getBoundingClientRect()
				setYellow(Math_clamp((ev.clientX - yellowRect.left) / yellowRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				yellowDragged = true
				yellowRect = yellowRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(60, 100%, ${yellow() / 100 * 50}%)`,
					left: yellow() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: 60 / 360, s: 1, l: yellow() / 100 * 0.5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Key: {100 - Math.round(key())}%</p>
		<div
			data-key
			draggable={false}
			ref={r => keyRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				keyDragged = true
				keyRect = keyRef.getBoundingClientRect()
				setKey(Math_clamp((ev.clientX - keyRect.left) / keyRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				keyDragged = true
				keyRect = keyRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: key() + '%',
					"background-color": `hsl(0, 0%, ${key()}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: 0, s: 1, l: key() / 100}),
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
	const [hex, setHex] = createSignal(0) // 0 - 100
	const getHEXColor = createMemo(() => {
		return '#' + Math.round(hex() / 100 * 0xffffff).toString(16).padStart(6, '0') as HEXColor
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = getHEXColor()
		return hexToHsl(h)
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
			let x = (ev.clientX - hexRect.left) / hexRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHex(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hexDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			hexDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref: HTMLElement = hexRef
		let x = 0
		if (hexDragged) x = hex()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (hexDragged) {
			setHex(x)
			ref = hexRef
		}

		if (hexDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		hexDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const hex = Number.parseInt(hslToHex(input).substring(1), 16) / 0xffffff
		setHex(hex * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hex}>
		<p>Hex: {getHEXColor().toUpperCase()} ({Math.round(hex() / 100 * 0xffffff)})</p>
		<div
			data-hex
			draggable={false}
			ref={r => hexRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hexDragged = true
				hexRect = hexRef.getBoundingClientRect()
				setHex(Math_clamp((ev.clientX - hexRect.left) / hexRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				hexDragged = true
				hexRect = hexRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: hex() + '%',
					"background-color": getHEXColor(),
					"border-color": colorContrastRatio(
						hexToRgb(getHEXColor()),
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
	const [hue, setHue] = createSignal(0) // 0 - 100
	const [saturation, setSaturation] = createSignal(0) // 0 - 100
	const [value, setValue] = createSignal(0) // 0 - 100
	const getHue = createMemo(() => {
		return hue() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = hue() / 100
		const s = saturation() / 100
		const v = value() / 100

		return hsvToHsl({h, s, v})
	})
	let isUpdateLocally = false // to avoid unnecesary recalculate in `createEffect()`
	let hueDragged = false
	let saturationDragged = false
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
			let x = (ev.clientX - hueRect.left) / hueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (valueDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - valueRect.left) / valueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setValue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (saturationDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - saturationRect.left) / saturationRect.width * 100
			x = Math_clamp(x, 0, 100)
			setSaturation(x)
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = valueDragged = saturationDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			hueDragged = valueDragged = saturationDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref = hueRef
		let x = 0
		if (hueDragged) x = hue()
		else if (saturationDragged) x = saturation()
		else if (valueDragged) x = value()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (hueDragged) {
			setHue(x)
			ref = hueRef
		}
		else if (saturationDragged) {
			setSaturation(x)
			ref = saturationRef
		}
		else if (valueDragged) {
			setValue(x)
			ref = valueRef
		}

		if (hueDragged || valueDragged || saturationDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		hueDragged = valueDragged = saturationDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {h, s, v} = hslToHsv(input)
		setHue(h * 100)
		setSaturation(s * 100)
		setValue(v * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hsv} style={{'--hue': getHue()}}>
		<p>Hue: {Math.round(getHue())}° ({Math.round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				setHue(Math_clamp((ev.clientX - hueRect.left) / hueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Saturation: {Math.round(saturation())}%</p>
		<div
			data-saturation
			draggable={false}
			ref={r => saturationRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				saturationDragged = true
				saturationRect = saturationRef.getBoundingClientRect()
				setSaturation(Math_clamp((ev.clientX - saturationRect.left) / saturationRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				saturationDragged = true
				saturationRect = saturationRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, ${saturation()}%, 50%)`,
					left: saturation() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: saturation() / 100, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Value: {Math.round(value())}%</p>
		<div
			data-value
			draggable={false}
			ref={r => valueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				valueDragged = true
				valueRect = valueRef.getBoundingClientRect()
				setValue(Math_clamp((ev.clientX - valueRect.left) / valueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				valueDragged = true
				valueRect = valueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: value() + '%',
					"background-color": `hsl(0, 0%, ${value()}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: 0, s: 1, l: value()/ 100}),
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
	const [hue, setHue] = createSignal(0) // 0 - 100
	const [whiteness, setWhiteness] = createSignal(0) // 0 - 100
	const [blackness, setBlackness] = createSignal(0) // 0 - 100
	const getHue = createMemo(() => {
		return hue() / 100 * 360
	})
	const getHSLColor = createMemo<HSLColor>(() => {
		const h = hue() / 100
		const w = Math_clamp(whiteness() / 100, 0, 1)
		const b = Math_clamp(blackness() / 100, 0, 1)

		return hwbToHsl({h, w, b})
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
			let x = (ev.clientX - hueRect.left) / hueRect.width * 100
			x = Math_clamp(x, 0, 100)
			setHue(x)
			command(Commands.updateInput, getHSLColor())
		}
		else if (blacknessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - blacknessRect.left) / blacknessRect.width * 100
			x = Math_clamp(x, 0, 100)
			setBlackness(x)
			setWhiteness(Math_clamp(whiteness(), 0, 100 - blackness()))
			command(Commands.updateInput, getHSLColor())
		}
		else if (whitenessDragged) {
			isUpdateLocally = true
			let x = (ev.clientX - whitenessRect.left) / whitenessRect.width * 100
			x = Math_clamp(x, 0, 100)
			setWhiteness(x)
			setBlackness(Math_clamp(blackness(), 0, 100 - whiteness()))
			command(Commands.updateInput, getHSLColor())
		}
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		hueDragged = blacknessDragged = whitenessDragged = isUpdateLocally = false
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		body.removeAttribute(BodyAttributes.noPointerEvent)
	}

	function onKeyDown(ev: KeyboardEvent) {
		const code = ev.code
		if (code !== KEY_ARROW_RIGHT && code !== KEY_ARROW_LEFT) {
			hueDragged = blacknessDragged = whitenessDragged = isUpdateLocally = false
			return
		}

		isUpdateLocally = true

		let ref = hueRef
		let x = 0
		if (hueDragged) x = hue()
		else if (blacknessDragged) x = blackness()
		else if (whitenessDragged) x = whiteness()

		switch (code) {
		case KEY_ARROW_RIGHT: x += 1; break
		case KEY_ARROW_LEFT: x -= 1; break
		}

		x = Math_clamp(x, 0, 100)
		if (hueDragged) {
			setHue(x)
			ref = hueRef
		}
		else if (blacknessDragged) {
			setBlackness(x)
			setWhiteness(Math_clamp(whiteness(), 0, 100 - blackness()))
			ref = blacknessRef
		}
		else if (whitenessDragged) {
			setWhiteness(x)
			setBlackness(Math_clamp(blackness(), 0, 100 - whiteness()))
			ref = whitenessRef
		}

		if (hueDragged || blacknessDragged || whitenessDragged){
			ref.firstElementChild?.scrollIntoView({
				behavior: 'instant',
				block: 'nearest'
			})
			command(Commands.updateInput, getHSLColor())
		}

		hueDragged = blacknessDragged = whitenessDragged = isUpdateLocally = false
	}

	function updatePosition(): void {
		const input = props.input
		if (isUpdateLocally) {
			isUpdateLocally = false
			return
		}

		const {h, w, b} = hslToHwb(input)
		setHue(h * 100)
		setWhiteness(w * 100)
		setBlackness(b * 100)
	}

	createEffect(() => {
		updatePosition()
	})

	return (<div class={CSS.picker_slider_hwb} style={{'--hue': getHue()}}>
		<p>Hue: {Math.round(getHue())}° ({Math.round(hue())}%)</p>
		<div
			data-hue
			draggable={false}
			ref={r => hueRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				setHue(Math_clamp((ev.clientX - hueRect.left) / hueRect.width * 100, 0, 100))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				hueDragged = true
				hueRect = hueRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, 50%)`,
					left: hue() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: 1, l: .5}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Whiteness: {Math.round(whiteness())}%</p>
		<div
			data-whiteness
			draggable={false}
			ref={r => whitenessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				whitenessDragged = true
				whitenessRect = whitenessRef.getBoundingClientRect()
				setWhiteness(Math_clamp((ev.clientX - whitenessRect.left) / whitenessRect.width * 100, 0, 100))
				setBlackness(Math_clamp(blackness(), 0, 100 - whiteness()))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				whitenessDragged = true
				whitenessRect = whitenessRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					"background-color": `hsl(${getHue()}, 100%, ${50 + (whiteness() / 100 * 50)}%)`,
					left: whiteness() + '%',
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: 1, l: 0.5 + (whiteness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
		<p>Blackness: {Math.round(blackness())}%</p>
		<div
			data-blackness
			draggable={false}
			ref={r => blacknessRef = r}
			onPointerDown={ev => {
				isUpdateLocally = true
				blacknessDragged = true
				blacknessRect = blacknessRef.getBoundingClientRect()
				setBlackness(Math_clamp((ev.clientX - blacknessRect.left) / blacknessRect.width * 100, 0, 100))
				setWhiteness(Math_clamp(whiteness(), 0, 100 - blackness()))
				body.setAttribute(BodyAttributes.noPointerEvent, '')
				command(Commands.updateInput, getHSLColor())
				isUpdateLocally = false
				ev.currentTarget.setPointerCapture(ev.pointerId)
			}}
			onKeyDown={ev => {
				blacknessDragged = true
				blacknessRect = blacknessRef.getBoundingClientRect()
				onKeyDown(ev)
			}}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}>
			<div
				tabIndex={0}
				class={CSS.picker_indicator}
				draggable={false}
				style={{
					left: blackness() + '%',
					"background-color": `hsl(${getHue()}, 100%, ${50 - (blackness() / 100 * 50)}%)`,
					"border-color": colorContrastRatio(
						hslToRgb({h: hue() / 100, s: 1, l: 0.5 - (blackness() / 100 * 0.5)}),
						{r: 0, g: 0, b: 0}
					) > 50 ? '#000' : '#fff',
					transform: 'translate(-50%, -5px)'
				}}
			/>
		</div>
	</div>)
}