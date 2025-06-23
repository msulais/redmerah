import { batch, createMemo, createSelector, createUniqueId, Show, type VoidComponent } from "solid-js"

import type { CubicBezier, Keyframes, Position } from "./_types"
import { ICON_COPY, ICON_DATA_SCATTER, ICON_PLAY } from "@/constants/icons"
import { AppCSSColors } from "@/enums/app-data"
import { isTargetValidElement } from "@/utils/element"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import { AnimationType, Commands } from "./_enums"

import TextField, { NumberTextField, TextFieldButton, updateTextFieldValue } from "@/components/TextField"
import Button, { ButtonVariant } from "@/components/Button"
import Icon from "@/components/Icon"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import FocusableGroup from "@/components/FocusableGroup"
import Toast, { openToast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import CSS from './_index.module.scss'

const _: VoidComponent<{
	cubicBezier: CubicBezier
	duration: number
	animationTypes: AnimationType[]
	startPoint: Position
	endPoint: Position
	startHandlePoint: Position
	endHandlePoint: Position
	keyframes: Keyframes
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const MAX_SIZE = 260
	const QUARTER_SIZE = MAX_SIZE / 4
	const INDICATOR_SIZE = 24
	const HALF_INDICATOR_SIZE = INDICATOR_SIZE / 2
	const PATH_STROKE_SIZE = 4
	const HANDLE_STROKE = 4
	const HANDLE_SIZE = 24 - HANDLE_STROKE
	const HALF_HANDLE_SIZE = HANDLE_SIZE / 2
	const DECORATION_STROKE_COLOR = `rgba(${AppCSSColors.onSurface}, var(--g-opacity-border))`
	const buttonPlayId = createUniqueId()
	const buttonCopyId = createUniqueId()
	const buttonTidyUpId = createUniqueId()
	const inputCubicBezierId = createUniqueId()
	const inputDurationId = createUniqueId()
	const inputColorId = createUniqueId()
	const inputMoveId = createUniqueId()
	const inputOpacityId = createUniqueId()
	const inputRotateId = createUniqueId()
	const inputScaleId = createUniqueId()
	const inputHeightId = createUniqueId()
	const inputWidthId = createUniqueId()
	const cubicBezier = createMemo(() => props.cubicBezier)
	const startPoint = createMemo(() => props.startPoint)
	const endPoint = createMemo(() => props.endPoint)
	const startHandlePoint = createMemo(() => props.startHandlePoint)
	const endHandlePoint = createMemo(() => props.endHandlePoint)
	const duration = createMemo(() => props.duration)
	const animationTypes = createMemo(() => props.animationTypes)
	const keyframes = createMemo(() => props.keyframes)
	const isAnimationSelected = createSelector<AnimationType[], AnimationType>(
		animationTypes,
		(a, sources) => sources.some(v => v === a)
	)
	const getStartPoint = createMemo<[x: number, y: number]>(() => {
		const [x, y] = startPoint()
		return [x * MAX_SIZE - HALF_INDICATOR_SIZE, (1 - y) * MAX_SIZE - HALF_INDICATOR_SIZE]
	})
	const getEndPoint = createMemo<[x: number, y: number]>(() => {
		const [x, y] = endPoint()
		return [x * MAX_SIZE - HALF_INDICATOR_SIZE, (1 - y) * MAX_SIZE - HALF_INDICATOR_SIZE]
	})
	const getStartHandlePoint = createMemo<[x: number, y: number]>(() => {
		const [x, y] = startHandlePoint()
		return [x * MAX_SIZE - HALF_HANDLE_SIZE, (1 - y) * MAX_SIZE - HALF_HANDLE_SIZE]
	})
	const getEndHandlePoint = createMemo<[x: number, y: number]>(() => {
		const [x, y] = endHandlePoint()
		return [x * MAX_SIZE - HALF_HANDLE_SIZE, (1 - y) * MAX_SIZE - HALF_HANDLE_SIZE]
	})
	let toastCopiedRef: HTMLDivElement
	let rectRef: SVGRectElement
	let divAnimationBoxWrapperRef: HTMLDivElement
	let animation: Animation
	let divAnimationBoxRef: HTMLDivElement
	let rect: DOMRect
	let isStartPointDragged = false
	let isEndPointDragged = false
	let isStartHandlePointDragged = false
	let isEndHandlePointDragged = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function playAnimation(): void {
		if (animation
			&& animation.playState === 'running'
		) animation.cancel()

		const $keyframes: Record<string, string[]> = {}
		if (isAnimationSelected(AnimationType.color  )) $keyframes.backgroundColor = keyframes().color
		if (isAnimationSelected(AnimationType.height )) $keyframes.height = keyframes().height
		if (isAnimationSelected(AnimationType.width  )) $keyframes.width = keyframes().width
		if (isAnimationSelected(AnimationType.opacity)) $keyframes.opacity = keyframes().opacity
		if (isAnimationSelected(AnimationType.rotate )) $keyframes.rotate = keyframes().rotate
		if (isAnimationSelected(AnimationType.scale  )) $keyframes.scale = keyframes().scale
		if (isAnimationSelected(AnimationType.move   )) $keyframes.translate = keyframes().move.map(
			v => v.join(' ')
		)

		divAnimationBoxWrapperRef.scrollIntoView({
			behavior: 'instant'
		})
		animation = divAnimationBoxRef.animate($keyframes, {
			duration: duration(),
			easing: 'cubic-bezier(' + cubicBezier() + ')',
		})
	}

	function updateText(): string {
		const simplify = (x: number) => Number.parseFloat(safeNumber(x).toFixed(2))
		const distanceX = endPoint()[0] - startPoint()[0]
		const distanceY = endPoint()[1] - startPoint()[1]
		const x1 = simplify((startHandlePoint()[0] - startPoint()[0]) / distanceX)
		const y1 = simplify((startHandlePoint()[1] - startPoint()[1]) / distanceY)
		const x2 = simplify((endHandlePoint()[0] - startPoint()[0]) / distanceX)
		const y2 = simplify((endHandlePoint()[1] - startPoint()[1]) / distanceY)
		command(Commands.updateCubicBezier, [x1, y1, x2, y2])

		return [x1, y1, x2, y2].join(', ')
	}

	function onPointerUp(ev: PointerEvent & { currentTarget: SVGRectElement }): void {
		ev.currentTarget.releasePointerCapture(ev.pointerId)
		isStartPointDragged
		= isEndPointDragged
		= isStartHandlePointDragged
		= isEndHandlePointDragged
		= false
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isStartPointDragged
			&& !isStartHandlePointDragged
			&& !isEndPointDragged
			&& !isEndHandlePointDragged
		) return

		batch(() => {
			console.assert(Boolean(rect), 'rect is not defined')

			const pX = ev.clientX
			const pY = ev.clientY
			const rHeight = rect.height
			const rWidth = rect.width
			const rLeft = rect.left
			const rTop = rect.top
			let x = (pX - rLeft) / rWidth
			let y = (rHeight - (pY - rTop)) / rHeight

			if (isStartPointDragged) {
				x = Math_clamp(x, 0, endPoint()[0])
				y = Math_clamp(y, 0, endPoint()[1])
				command(Commands.updateStartPoint, [x, y])
				command(Commands.updateStartHandlePoint, [
					Math_clamp(startHandlePoint()[0], x, endPoint()[0]),
					startHandlePoint()[1]
				])
				command(Commands.updateEndHandlePoint, [
					Math_clamp(endHandlePoint()[0], x, endPoint()[0]),
					endHandlePoint()[1]
				])
			}
			else if (isEndPointDragged) {
				x = Math_clamp(x, startPoint()[0], 1)
				y = Math_clamp(y, startPoint()[1], 1)
				command(Commands.updateEndPoint, [x, y])
				command(Commands.updateStartHandlePoint, [
					Math_clamp(startHandlePoint()[0], startPoint()[0], x),
					startHandlePoint()[1]
				])
				command(Commands.updateEndHandlePoint, [
					Math_clamp(endHandlePoint()[0], startPoint()[0], x),
					endHandlePoint()[1]
				])
			}
			else if (isStartHandlePointDragged) {
				x = Math_clamp(x, startPoint()[0], endPoint()[0])
				command(Commands.updateStartHandlePoint, [x, y])
			}
			else if (isEndHandlePointDragged) {
				x = Math_clamp(x, startPoint()[0], endPoint()[0])
				command(Commands.updateEndHandlePoint, [x, y])
			}

			updateText()
		})
	}

	function onPointerDown(
		ev: PointerEvent & {currentTarget: SVGRectElement},
		type: 'start' | 'end' | 'start-handle' | 'end-handle'
	): void {
		rect = rectRef.getBoundingClientRect()
		ev.currentTarget.setPointerCapture(ev.pointerId)
		isStartPointDragged = type === 'start'
		isEndPointDragged = type === 'end'
		isStartHandlePointDragged = type === 'start-handle'
		isEndHandlePointDragged = type === 'end-handle'
	}

	function onBlur(
		el: HTMLInputElement,
		key: keyof Keyframes,
		suffix: string
	): void {
		const text = el.value.trim().replace(/,$/g, '')
		const values = text.split(',').map(
			v => safeNumber(Number.parseFloat(v))
		)
		if (values.length <= 0) values.push(0)

		command(Commands.updateKeyframes, key, values.map(
			v => v + suffix
		))
		updateTextFieldValue(el, values.map(
			v => v + suffix
		).join(', '))
	}

	function tidyUpGraph(): void {
		let startPointY = 0
		let endPointY = 1
		let x1 = cubicBezier()[0]
		let y1 = cubicBezier()[1]
		let x2 = cubicBezier()[2]
		let y2 = cubicBezier()[3]

		const max = Math.max(startPointY, endPointY, y1, y2)
		if (max > 1) {
			const d = (max - 1) / max
			y1 -= (y1 * d)
			y2 -= (y2 * d)
			startPointY -= (startPointY * d)
			endPointY -= (endPointY * d)
		}

		const min = Math.min(startPointY, endPointY, y1, y2)
		if (min < 0) {
			const d = Math.abs(min) / (Math.abs(min) + 1)
			y1 += (Math.abs(1 - y1) * d)
			y2 += (Math.abs(1 - y2) * d)
			startPointY += ((1 - startPointY) * d)
			endPointY += ((1 - endPointY) * d)
		}

		batch(() => {
			command(Commands.updateStartHandlePoint, [x1, y1])
			command(Commands.updateEndHandlePoint, [x2, y2])
			command(Commands.updateStartPoint, [0, startPointY])
			command(Commands.updateEndPoint, [1, endPointY])
		})
	}

	return (<main class={CSS.body}>
		<div>
			<svg
				width="260"
				height="260"
				overflow="visible"
				viewBox={`0 0 ${MAX_SIZE} ${MAX_SIZE}`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg">

				{/* decoration begin */}
				<rect ref={r => rectRef = r} x="0" y="0"
					width={MAX_SIZE}
					height={MAX_SIZE}
					fill={`rgb(${AppCSSColors.surface})`}
					stroke={DECORATION_STROKE_COLOR}
				/>
				<path d={`M${QUARTER_SIZE}  0V${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				<path d={`M${QUARTER_SIZE * 2} 0V${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				<path d={`M${QUARTER_SIZE * 3} 0V${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				<path d={`M0 ${QUARTER_SIZE}H${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				<path d={`M0 ${QUARTER_SIZE * 2}H${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				<path d={`M0 ${QUARTER_SIZE * 3}H${MAX_SIZE}`} stroke={DECORATION_STROKE_COLOR}/>
				{/* decoration end */}

				{/* handle start line */}
				<path
					d={
						`M${startPoint()[0] * MAX_SIZE} ${(1 - startPoint()[1]) * MAX_SIZE}` +
						`L${startHandlePoint()[0] * MAX_SIZE} ${(1 - startHandlePoint()[1]) * MAX_SIZE}`
					}
					stroke={`rgb(${AppCSSColors.accent})`}
					stroke-width={PATH_STROKE_SIZE}
				/>

				{/* handle end line */}
				<path
					d={
						`M${endPoint()[0] * MAX_SIZE} ${(1 - endPoint()[1]) * MAX_SIZE}` +
						`L${endHandlePoint()[0] * MAX_SIZE} ${(1 - endHandlePoint()[1]) * MAX_SIZE}`
					}
					stroke={`rgb(${AppCSSColors.error})`}
					stroke-width={PATH_STROKE_SIZE}
				/>

				{/* start to end path */}
				<path
					d={
						`M${startPoint()[0] * MAX_SIZE} ${(1 - startPoint()[1]) * MAX_SIZE}`
						+ `C${startHandlePoint()[0] * MAX_SIZE} ${(1 - startHandlePoint()[1]) * MAX_SIZE},`
						+ `${endHandlePoint()[0] * MAX_SIZE} ${(1 - endHandlePoint()[1]) * MAX_SIZE},`
						+ `${endPoint()[0] * MAX_SIZE} ${(1 - endPoint()[1]) * MAX_SIZE}`
					}
					stroke={`rgb(${AppCSSColors.onSurface})`}
					stroke-width={PATH_STROKE_SIZE}
				/>

				{/* start */}
				<rect
					tabIndex={0}
					onPointerDown={ev => onPointerDown(ev, 'start')}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					x={getStartPoint()[0]} y={getStartPoint()[1]}
					width={INDICATOR_SIZE} height={INDICATOR_SIZE}
					rx={HALF_INDICATOR_SIZE}
					fill={`rgb(${AppCSSColors.onSurface})`}
				/>

				{/* end */}
				<rect
					tabIndex={0}
					onPointerDown={ev => onPointerDown(ev, 'end')}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					x={getEndPoint()[0]} y={getEndPoint()[1]}
					width={INDICATOR_SIZE} height={INDICATOR_SIZE}
					rx={HALF_INDICATOR_SIZE}
					fill={`rgb(${AppCSSColors.onSurface})`}
				/>

				{/* start handle */}
				<rect
					tabIndex={0}
					onPointerDown={ev => onPointerDown(ev, 'start-handle')}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					x={getStartHandlePoint()[0]} y={getStartHandlePoint()[1]}
					width={HANDLE_SIZE} height={HANDLE_SIZE}
					rx={HALF_HANDLE_SIZE}
					fill={`rgb(${AppCSSColors.onAccent})`}
					stroke={`rgb(${AppCSSColors.accent})`} stroke-width={HANDLE_STROKE}
				/>

				{/* end handle */}
				<rect
					tabIndex={0}
					onPointerDown={ev => onPointerDown(ev, 'end-handle')}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					x={getEndHandlePoint()[0]} y={getEndHandlePoint()[1]}
					width={HANDLE_SIZE} height={HANDLE_SIZE}
					rx={HALF_HANDLE_SIZE}
					fill={`rgb(${AppCSSColors.onError})`}
					stroke={`rgb(${AppCSSColors.error})`} stroke-width={HANDLE_STROKE}
				/>
			</svg>
			<FocusableGroup
				c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				class={CSS.bodyOptions}
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button
					)) return

					switch (button.id) {
					case buttonPlayId:
						playAnimation()
						break
					case buttonCopyId:
						navigator
						.clipboard
						.writeText(updateText())
						.then(() => openToast(toastCopiedRef))
						break
					case buttonTidyUpId:
						tidyUpGraph()
						break
					}
				}}
				onFocusOut={ev => {
					const target = ev.target as HTMLInputElement
					switch (target.id) {
					case inputCubicBezierId:
						updateTextFieldValue(target, updateText())
						break
					case inputDurationId: {
						const value = safeNumber(target.valueAsNumber)
						command(Commands.updateDuration, value)
						break
					}
					case inputColorId: {
						const text = target.value.replace(/[^0-9A-Fa-f,]|,$/g, '')
						const values = text.split(',').map(v => {
							let d = Number.parseInt(v, 16)
							d = safeNumber(d)
							d = Math_clamp(d, 0, 0xffffff)

							let e = d.toString(16)
							e = e.padStart(6, '0')
							e = e.toUpperCase()
							e = '#' + e

							return e
						})

						command(Commands.updateKeyframes, 'color', values)
						updateTextFieldValue(target, values.join(', '))
						break
					}
					case inputMoveId: {
						const text = target.value.trim().replace(/,$/g, '')
						const values = text.split(',').map(v => {
							const d = v.trim().split(/ +/)
							while (d.length < 2) d.push('0')
							if (d.length > 2) d.length = 2

							return d.map(v => safeNumber(Number.parseFloat(v)) + 'px')
						})

						command(Commands.updateKeyframes, 'move', values)
						updateTextFieldValue(target, values.map(v => v.join(' ')).join(', '))
						break
					}
					case inputOpacityId:
						onBlur(target, 'opacity', '%')
						break
					case inputRotateId:
						onBlur(target, 'rotate', 'deg')
						break
					case inputScaleId:
						onBlur(target, 'scale', '%')
						break
					case inputHeightId:
						onBlur(target, 'height', 'px')
						break
					case inputWidthId:
						onBlur(target, 'width', 'px')
						break
					}
				}}>
				<Show when={animationTypes().length > 0}>
					<Button
						c:variant={ButtonVariant.filled}
						id={buttonPlayId}>
						<Icon c:code={ICON_PLAY}/>
						Play
					</Button>
				</Show>
				<TextField
					c:label="Cubic bezier"
					placeholder="x1, y1, x2, y2"
					id={inputCubicBezierId}
					value={cubicBezier().join(', ')}
					onInput={ev => {
						const self = ev.currentTarget
						const texts = self.value.split(',').map(
							v => safeNumber(Number.parseFloat(v))
						)
						while (texts.length < 4) texts.push(0)

						const [x1, y1, x2, y2] = texts
						const distanceX = endPoint()[0] - startPoint()[0]
						const distanceY = endPoint()[1] - startPoint()[1]

						batch(() => {
							command(Commands.updateStartHandlePoint, [
								Math_clamp(distanceX * x1 + startPoint()[0], 0, endPoint()[0]),
								distanceY * y1 + startPoint()[1]
							])
							command(Commands.updateEndHandlePoint, [
								Math_clamp(distanceX * x2 + startPoint()[0], startPoint()[0], 1),
								distanceY * y2 + startPoint()[1]
							])
						})
					}}
					c:trailing={<Tooltip>
						<Show when={
							startHandlePoint()[1] > 1
							|| startHandlePoint()[1] < 0
							|| endHandlePoint()[1] > 1
							|| endHandlePoint()[1] < 0
						}>
							<TextFieldButton
								data-tooltip="Tidy up"
								id={buttonTidyUpId}>
								<Icon c:code={ICON_DATA_SCATTER}/>
							</TextFieldButton>
						</Show>
						<TextFieldButton
							data-tooltip="Copy"
							id={buttonCopyId}>
							<Icon c:code={ICON_COPY}/>
						</TextFieldButton>
					</Tooltip>}
				/>
				<Dropdown
					c:values={animationTypes()}
					c:multiple
					c:text="Select animation"
					c:label="Animation type"
					c:onChange={values => command(
						Commands.updateAnimationTypes,
						values.map(v => v.value)
					)}>
					<DropdownOption c:value={AnimationType.color} c:text="Color" />
					<DropdownOption c:value={AnimationType.height} c:text="Height" />
					<DropdownOption c:value={AnimationType.move} c:text="Move" />
					<DropdownOption c:value={AnimationType.opacity} c:text="Opacity" />
					<DropdownOption c:value={AnimationType.scale} c:text="Scale" />
					<DropdownOption c:value={AnimationType.rotate} c:text="Rotate" />
					<DropdownOption c:value={AnimationType.width} c:text="Width" />
				</Dropdown>
				<Show when={animationTypes().length > 0}>
					<NumberTextField
						c:label="Duration (ms)"
						value={duration()}
						step={100}
						min={0}
						id={inputDurationId}
					/>
					<Expander
						c:variant={ExpanderVariant.outlined}
						c:header={<ExpanderHeader>Keyframes</ExpanderHeader>}>
						<Show when={isAnimationSelected(AnimationType.color)}>
							<TextField
								c:label="Color"
								id={inputColorId}
								value={keyframes().color.join(', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.move)}>
							<TextField
								c:label="Move"
								value={keyframes().move.map(v => v.join(' ')).join(', ')}
								id={inputMoveId}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.opacity)}>
							<TextField
								c:label="Opacity"
								id={inputOpacityId}
								value={keyframes().opacity.join(', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.rotate)}>
							<TextField
								c:label="Rotate"
								id={inputRotateId}
								value={keyframes().rotate.join(', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.scale)}>
							<TextField
								c:label="Scale"
								id={inputScaleId}
								value={keyframes().scale.join(', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.height)}>
							<TextField
								c:label="Height"
								id={inputHeightId}
								value={keyframes().height.join(', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.width)}>
							<TextField
								c:label="Width"
								id={inputWidthId}
								value={keyframes().width.join(', ')}
							/>
						</Show>
					</Expander>
				</Show>
			</FocusableGroup>
		</div>
		<div class={CSS.bodyPlayground} ref={r => divAnimationBoxWrapperRef = r}>
			<div
				ref={r => divAnimationBoxRef = r}
				style={{
					width: isAnimationSelected(AnimationType.width)? keyframes().width[0] : undefined,
					height: isAnimationSelected(AnimationType.height)? keyframes().height[0] : undefined,
					scale: isAnimationSelected(AnimationType.scale)? keyframes().scale[0] : undefined,
					rotate: isAnimationSelected(AnimationType.rotate)? keyframes().rotate[0] : undefined,
					opacity: isAnimationSelected(AnimationType.opacity)? keyframes().opacity[0] : undefined,
					translate: isAnimationSelected(AnimationType.move)? keyframes().move[0].join(' ') : undefined,
					"background-color": isAnimationSelected(AnimationType.color)? keyframes().color[0] : undefined,
				}}
			/>
		</div>
		<Toast ref={r => toastCopiedRef = r} c:leading={<Icon c:code={ICON_COPY} />}>Copied to clipboard</Toast>
	</main>)
}

export default _