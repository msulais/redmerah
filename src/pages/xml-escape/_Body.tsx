import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { BodyAttributes } from "@/enums/attributes"
import { Commands } from "./_enums"
import { MIN_EDITOR_WIDTH } from "./_constants"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'
import { elementValidTarget } from "@/utils/element"
import { attrSetIfExist } from "@/utils/attributes"

enum InputViewOption {
	unescape
}

enum OutputViewOption {
	escape
}

const _: VoidComponent<{
	settings: Settings
	escapedText: string
	unescapedText: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document.body
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(InputViewOption.unescape)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption.escape)
	const settings = createMemo(() => props.settings)
	const buttonInput_unescapeId = createUniqueId()
	const buttonOutput_escapeId = createUniqueId()
	let timeId: number | NodeJS.Timeout | null
	let textAreaUnescapeRef: HTMLTextAreaElement
	let textAreaEscapeRef: HTMLTextAreaElement
	let isSmallScreen: boolean = false
	let lastFocusTextArea: HTMLTextAreaElement | undefined

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateOutput(): void {
		if (timeId !== null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			console.assert(
				lastFocusTextArea !== undefined,
				'lastFocusTextArea is not defined'
			)
			const cmd = (lastFocusTextArea === textAreaUnescapeRef
				? Commands.updatedUnescapeText
				: Commands.updateEscapeText
			)
			command(cmd, lastFocusTextArea!.value)
			timeId = null
		}, 500)
	}

	function onPointerMove(ev: PointerEvent): void {
		if (!isDragging()) return;

		setWidth(ev.clientX)
	}

	function onPointerUp(ev: PointerEvent & {currentTarget: HTMLDivElement}): void {
		setIsDragging(false)
		body.removeAttribute(BodyAttributes.noPointerEvent)
		ev.currentTarget.releasePointerCapture(ev.pointerId)
	}

	function initSmallScreenListener(): void {
		const callback = () => {
			if (inputViewOption() === null || outputViewOption() === null) return;
			setOutputViewOption(null)
		}

		window
		.window.matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`)
		.addEventListener('change', ev => {
			isSmallScreen = ev.matches
			if (!isSmallScreen) return;

			callback()
		})

		isSmallScreen = window.window.matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`).matches
		if (!isSmallScreen) return;

		callback()
	}

	onMount(() => {
		initSmallScreenListener()
	})

	const InputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonInput_unescapeId}
			c:variant={ButtonVariant.tonal}
			c:selected={inputViewOption() !== null}>
			Unescape
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonOutput_escapeId}
			c:variant={ButtonVariant.tonal}
			c:selected={outputViewOption() !== null}>
			Escape
		</Button>
	</>)

	return (<div
		class={CSS.body}
		onClick={ev => {
			const button = document.activeElement!
			if (!elementValidTarget(
				ev.currentTarget,
				button
			)) return

			switch (button.id) {
			case buttonInput_unescapeId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.unescape)
					setOutputViewOption(null)
					return
				}

				if (inputViewOption() === InputViewOption.unescape
					&& outputViewOption() !== null
				){
					return setInputViewOption(null)
				}

				setInputViewOption(InputViewOption.unescape)
				textAreaUnescapeRef.value = props.unescapedText
				break
			case buttonOutput_escapeId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.escape)
					setInputViewOption(null)
					return
				}

				if (outputViewOption() === OutputViewOption.escape
					&& inputViewOption() !== null
				){
					return setOutputViewOption(null)
				}

				setOutputViewOption(OutputViewOption.escape)
				textAreaEscapeRef.value = props.escapedText
				break
			}
		}}>
		<div
			class={CSS.body_input}
			data-hidden={attrSetIfExist(inputViewOption() === null)}
			data-output-hidden={attrSetIfExist(outputViewOption() === null)}
			style={{width: width() === null? undefined : width() + 'px'}}>
			<div class={CSS.body_tabs}>
				<InputTabButtons/>
				<Show when={outputViewOption() === null}>
					<OutputTabButtons/>
				</Show>
			</div>
			<textarea
				autofocus
				onInput={() => updateOutput()}
				ref={r => textAreaUnescapeRef = r}
				onFocus={() => lastFocusTextArea = textAreaUnescapeRef}
				value={props.unescapedText}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={attrSetIfExist(settings().textWrap)}
				placeholder='Type your unescape XML text here ...'></textarea>
			<Show when={inputViewOption() != null && outputViewOption() != null}>
				<div
					data-g-keep-pointer-event={attrSetIfExist(isDragging())}
					class={CSS.body_drag_handle}
					onPointerDown={(ev) => {
						body.setAttribute(BodyAttributes.noPointerEvent, '')
						setWidth(ev.clientX)
						setIsDragging(true)
						ev.currentTarget.setPointerCapture(ev.pointerId)
					}}
					onPointerCancel={onPointerUp}
					onPointerUp={onPointerUp}
					onPointerMove={onPointerMove}
					onDblClick={() => setWidth(null)}
				/>
			</Show>
		</div>
		<div
			class={CSS.body_output}
			data-hidden={attrSetIfExist(outputViewOption() === null)}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() === null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<textarea
				onInput={() => updateOutput()}
				ref={r => textAreaEscapeRef = r}
				onFocus={() => lastFocusTextArea = textAreaEscapeRef}
				value={props.escapedText}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={attrSetIfExist(settings().textWrap)}
				placeholder='Type your escaped XML text here ...'></textarea>
		</div>
	</div>)
}

export default _