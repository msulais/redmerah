import { batch, createMemo, createSelector, createUniqueId, Show, type VoidComponent } from "solid-js"

import type { CubicBezier, Keyframes, Position } from "./_types"
import { ICON_COPY, ICON_DATA_SCATTER, ICON_PLAY } from "@/constants/icons"
import { promiseDone } from "@/utils/object"
import { AppColors } from "@/enums/colors"
import { elementAnimate, elementId, elementPointerCaptureRelease, elementPointerCaptureSet, elementScrollIntoView, elementValidTarget } from "@/utils/element"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { consoleAssert } from "@/utils/console"
import { rectHeight, rectLeft, rectTop, rectWidth } from "@/utils/rect"
import { mathClamp } from "@/utils/math"
import { numberParse, numberSafe, numberToFixed, numberToString } from "@/utils/number"
import { AnimationType, Commands } from "./_enums"
import { arrayJoin, arrayLength, arrayMap, arrayPush, arraySome } from "@/utils/array"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { stringPadStart, stringReplace, stringSplit, stringToUpperCase, stringTrim } from "@/utils/string"
import { documentActive } from "@/utils/document"

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
	const DECORATION_STROKE_COLOR = `rgba(${AppColors.onSurface}, var(--g-opacity-border))`
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
		(a, sources) => arraySome(sources, v => v === a)
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
		if (isAnimationSelected(AnimationType.move   )) $keyframes.translate = arrayMap(
			keyframes().move,
			v => arrayJoin(v, ' ')
		)

		elementScrollIntoView(divAnimationBoxWrapperRef, {
			behavior: 'instant'
		})
		animation = elementAnimate(divAnimationBoxRef, $keyframes, {
			duration: duration(),
			easing: 'cubic-bezier(' + cubicBezier() + ')',
		})
	}

	function updateText(): string {
		const simplify = (x: number) => numberParse(numberToFixed(numberSafe(x), 2))
		const distanceX = endPoint()[0] - startPoint()[0]
		const distanceY = endPoint()[1] - startPoint()[1]
		const x1 = simplify((startHandlePoint()[0] - startPoint()[0]) / distanceX)
		const y1 = simplify((startHandlePoint()[1] - startPoint()[1]) / distanceY)
		const x2 = simplify((endHandlePoint()[0] - startPoint()[0]) / distanceX)
		const y2 = simplify((endHandlePoint()[1] - startPoint()[1]) / distanceY)
		command(Commands.updateCubicBezier, [x1, y1, x2, y2])

		return arrayJoin([x1, y1, x2, y2], ', ')
	}

	function onPointerUp(ev: PointerEvent & { currentTarget: SVGRectElement }): void {
		elementPointerCaptureRelease(eventCurrentTarget(ev as any), ev.pointerId)
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
			consoleAssert(Boolean(rect), 'rect is not defined')

			const pX = ev.clientX
			const pY = ev.clientY
			const rHeight = rectHeight(rect)
			const rWidth = rectWidth(rect)
			const rLeft = rectLeft(rect)
			const rTop = rectTop(rect)
			let x = (pX - rLeft) / rWidth
			let y = (rHeight - (pY - rTop)) / rHeight

			if (isStartPointDragged) {
				x = mathClamp(x, 0, endPoint()[0])
				y = mathClamp(y, 0, endPoint()[1])
				command(Commands.updateStartPoint, [x, y])
				command(Commands.updateStartHandlePoint, [
					mathClamp(startHandlePoint()[0], x, endPoint()[0]),
					startHandlePoint()[1]
				])
				command(Commands.updateEndHandlePoint, [
					mathClamp(endHandlePoint()[0], x, endPoint()[0]),
					endHandlePoint()[1]
				])
			}
			else if (isEndPointDragged) {
				x = mathClamp(x, startPoint()[0], 1)
				y = mathClamp(y, startPoint()[1], 1)
				command(Commands.updateEndPoint, [x, y])
				command(Commands.updateStartHandlePoint, [
					mathClamp(startHandlePoint()[0], startPoint()[0], x),
					startHandlePoint()[1]
				])
				command(Commands.updateEndHandlePoint, [
					mathClamp(endHandlePoint()[0], startPoint()[0], x),
					endHandlePoint()[1]
				])
			}
			else if (isStartHandlePointDragged) {
				x = mathClamp(x, startPoint()[0], endPoint()[0])
				command(Commands.updateStartHandlePoint, [x, y])
			}
			else if (isEndHandlePointDragged) {
				x = mathClamp(x, startPoint()[0], endPoint()[0])
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
		elementPointerCaptureSet(eventCurrentTarget(ev as any), ev.pointerId)
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
		const text = stringReplace(stringTrim(el.value), /,$/g, '')
		const values = arrayMap(
			stringSplit(text, ','),
			v => numberSafe(numberParse(v))
		)
		if (arrayLength(values) <= 0) arrayPush(values, 0)

		command(Commands.updateKeyframes, key, arrayMap(
			values,
			v => v + suffix
		))
		updateTextFieldValue(el, arrayJoin(arrayMap(
			values,
			v => v + suffix
		), ', '))
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
					fill={`rgb(${AppColors.surface})`}
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
					stroke={`rgb(${AppColors.accent})`}
					stroke-width={PATH_STROKE_SIZE}
				/>

				{/* handle end line */}
				<path
					d={
						`M${endPoint()[0] * MAX_SIZE} ${(1 - endPoint()[1]) * MAX_SIZE}` +
						`L${endHandlePoint()[0] * MAX_SIZE} ${(1 - endHandlePoint()[1]) * MAX_SIZE}`
					}
					stroke={`rgb(${AppColors.error})`}
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
					stroke={`rgb(${AppColors.onSurface})`}
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
					fill={`rgb(${AppColors.onSurface})`}
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
					fill={`rgb(${AppColors.onSurface})`}
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
					fill={`rgb(${AppColors.onAccent})`}
					stroke={`rgb(${AppColors.accent})`} stroke-width={HANDLE_STROKE}
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
					fill={`rgb(${AppColors.onError})`}
					stroke={`rgb(${AppColors.error})`} stroke-width={HANDLE_STROKE}
				/>
			</svg>
			<FocusableGroup
				c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				class={CSS.bodyOptions}
				onClick={(ev) => {
					const button = documentActive()! as HTMLButtonElement
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button
					)) return

					switch (elementId(button)) {
					case buttonPlayId:
						playAnimation()
						break
					case buttonCopyId:
						promiseDone(
							navigatorClipboardWriteText(updateText()),
							() => openToast(toastCopiedRef)
						)
						break
					case buttonTidyUpId:
						tidyUpGraph()
						break
					}
				}}
				onFocusOut={ev => {
					const target = eventTarget(ev) as HTMLInputElement
					switch (elementId(target)) {
					case inputCubicBezierId:
						updateTextFieldValue(target, updateText())
						break
					case inputDurationId: {
						const value = numberSafe(target.valueAsNumber)
						command(Commands.updateDuration, value)
						break
					}
					case inputColorId: {
						const text = stringReplace(target.value, /[^0-9A-Fa-f,]|,$/g, '')
						const values = arrayMap(
							stringSplit(text, ','),
							v => {
								let d = numberParse(v, true, 16)
								d = numberSafe(d)
								d = mathClamp(d, 0, 0xffffff)

								let e = numberToString(d, 16)
								e = stringPadStart(e, 6, '0')
								e = stringToUpperCase(e)
								e = '#' + e

								return e
							}
						)

						command(Commands.updateKeyframes, 'color', values)
						updateTextFieldValue(target, arrayJoin(values, ', '))
						break
					}
					case inputMoveId: {
						const text = stringReplace(stringTrim(target.value), /,$/g, '')
						const values = arrayMap(stringSplit(text, ','), v => {
							const d = stringSplit(stringTrim(v), / +/)
							while (arrayLength(d) < 2) arrayPush(d, '0')
							if (arrayLength(d) > 2) d.length = 2

							return arrayMap(d, v => numberSafe(numberParse(v)) + 'px')
						})

						command(Commands.updateKeyframes, 'move', values)
						updateTextFieldValue(target, arrayJoin(arrayMap(
							values,
							v => arrayJoin(v, ' ')
						), ', '))
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
				<Show when={arrayLength(animationTypes()) > 0}>
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
					value={arrayJoin(cubicBezier(), ', ')}
					onInput={ev => {
						const self = eventCurrentTarget(ev)
						const texts = arrayMap(
							stringSplit(self.value, ','),
							v => numberSafe(numberParse(v))
						)
						while (arrayLength(texts) < 4) arrayPush(texts, 0)

						const [x1, y1, x2, y2] = texts
						const distanceX = endPoint()[0] - startPoint()[0]
						const distanceY = endPoint()[1] - startPoint()[1]

						batch(() => {
							command(Commands.updateStartHandlePoint, [
								mathClamp(distanceX * x1 + startPoint()[0], 0, endPoint()[0]),
								distanceY * y1 + startPoint()[1]
							])
							command(Commands.updateEndHandlePoint, [
								mathClamp(distanceX * x2 + startPoint()[0], startPoint()[0], 1),
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
						arrayMap(values, v => v.value)
					)}>
					<DropdownOption c:value={AnimationType.color} c:text="Color" />
					<DropdownOption c:value={AnimationType.height} c:text="Height" />
					<DropdownOption c:value={AnimationType.move} c:text="Move" />
					<DropdownOption c:value={AnimationType.opacity} c:text="Opacity" />
					<DropdownOption c:value={AnimationType.scale} c:text="Scale" />
					<DropdownOption c:value={AnimationType.rotate} c:text="Rotate" />
					<DropdownOption c:value={AnimationType.width} c:text="Width" />
				</Dropdown>
				<Show when={arrayLength(animationTypes()) > 0}>
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
								value={arrayJoin(keyframes().color, ', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.move)}>
							<TextField
								c:label="Move"
								value={arrayJoin(arrayMap(
									keyframes().move,
									v => arrayJoin(v, ' ')
								), ', ')}
								id={inputMoveId}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.opacity)}>
							<TextField
								c:label="Opacity"
								id={inputOpacityId}
								value={arrayJoin(keyframes().opacity, ', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.rotate)}>
							<TextField
								c:label="Rotate"
								id={inputRotateId}
								value={arrayJoin(keyframes().rotate, ', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.scale)}>
							<TextField
								c:label="Scale"
								id={inputScaleId}
								value={arrayJoin(keyframes().scale, ', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.height)}>
							<TextField
								c:label="Height"
								id={inputHeightId}
								value={arrayJoin(keyframes().height, ', ')}
							/>
						</Show>
						<Show when={isAnimationSelected(AnimationType.width)}>
							<TextField
								c:label="Width"
								id={inputWidthId}
								value={arrayJoin(keyframes().width, ', ')}
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
					translate: isAnimationSelected(AnimationType.move)? arrayJoin(keyframes().move[0], ' ') : undefined,
					"background-color": isAnimationSelected(AnimationType.color)? keyframes().color[0] : undefined,
				}}
			/>
		</div>
		<Toast ref={r => toastCopiedRef = r} c:leading={<Icon c:code={ICON_COPY} />}>Copied to clipboard</Toast>
	</main>)
}

export default _