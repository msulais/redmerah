import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { setAttrIfExist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { Commands } from "./_enums"
import { MIN_EDITOR_WIDTH } from "./_constants"
import { isTargetValidElement } from "@/utils/element"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

enum InputViewOption {
	input,
}

enum OutputViewOption {
	output
}

const _: VoidComponent<{
	settings: Settings
	inputText: string
	outputText: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document.body
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(InputViewOption.input)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption.output)
	const settings = createMemo(() => props.settings)
	const buttonInput_sourceId = createUniqueId()
	const buttonOutput_resultId = createUniqueId()
	let timeId: number | NodeJS.Timeout | null
	let textAreaRef: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateOutput(): void {
		if (timeId != null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			command(Commands.updateInputText, textAreaRef.value)
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
			if (inputViewOption() == null || outputViewOption() == null) return;
			setOutputViewOption(null)
		}

		window.matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`).addEventListener('change',  ev => {
			isSmallScreen = ev.matches
			if (!isSmallScreen) return;

			callback()
		})

		isSmallScreen = window.matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`).matches
		if (!isSmallScreen) return;

		callback()
	}

	onMount(() => {
		initSmallScreenListener()
	})

	const InputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonInput_sourceId}
			c:variant={ButtonVariant.tonal}
			c:selected={inputViewOption() !== null}>
			Input
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonOutput_resultId}
			c:variant={ButtonVariant.tonal}
			c:selected={outputViewOption() !== null}>
			Output
		</Button>
	</>)

	return (<div
		class={CSS.body}
		onClick={ev => {
			const button = document.activeElement!
			if (!isTargetValidElement(
				ev.currentTarget,
				button,
			)) return

			switch (button.id) {
			case buttonInput_sourceId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.input)
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() === InputViewOption.input
					&& outputViewOption() !== null
				) return setInputViewOption(null)

				setInputViewOption(InputViewOption.input)
				textAreaRef.value = props.inputText
				break
			case buttonOutput_resultId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.output)
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() === OutputViewOption.output
					&& inputViewOption() !== null
				) return setOutputViewOption(null)

				setOutputViewOption(OutputViewOption.output)
				break
			}
		}}>
		<div
			class={CSS.body_input}
			data-hidden={setAttrIfExist(inputViewOption() === null)}
			data-output-hidden={setAttrIfExist(outputViewOption() === null)}
			style={{width: width() == null? undefined : width() + 'px'}}>
			<div class={CSS.body_tabs}>
				<InputTabButtons/>
				<Show when={outputViewOption() === null}>
					<OutputTabButtons/>
				</Show>
			</div>
			<textarea
				autofocus
				onInput={() => updateOutput()}
				ref={r => textAreaRef = r}
				value={props.inputText}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={setAttrIfExist(settings().textWrap)}
				placeholder={`Type your javascript here ...`}></textarea>
			<Show when={inputViewOption() !== null && outputViewOption() !== null}>
				<div
					data-g-keep-pointer-event={setAttrIfExist(isDragging())}
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
			data-hidden={setAttrIfExist(outputViewOption() === null)}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() === null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<textarea
				readOnly
				value={props.outputText}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap></textarea>
		</div>
	</div>)
}

export default _