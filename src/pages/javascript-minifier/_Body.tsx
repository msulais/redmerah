import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { eventListenerAdd, eventCurrentTarget } from "@/utils/event"
import { attrRemove, attrSet, attrSetIfExist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { Commands } from "./_enums"
import { MIN_EDITOR_WIDTH } from "./_constants"
import { windowMatches } from "@/utils/window"
import { documentActive, documentBody } from "@/utils/document"
import { elementId, elementPointerCaptureRelease, elementPointerCaptureSet, elementTagName, elementValidTarget } from "@/utils/element"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

enum InputViewOption {
	result,
}

enum OutputViewOption {
	source
}

const _: VoidComponent<{
	settings: Settings
	inputText: string
	outputText: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = documentBody()
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(InputViewOption.result)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption.source)
	const settings = createMemo(() => props.settings)
	const buttonInput_sourceId = createUniqueId()
	const buttonOutput_resultId = createUniqueId()
	let timeId: number | null
	let textAreaRef: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateOutput(): void {
		if (timeId != null) timeTimerClear(timeId)
		timeId = timeTimerSet(() => {
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
		attrRemove(body, BodyAttributes.noPointerEvent)
		elementPointerCaptureRelease(eventCurrentTarget(ev), ev.pointerId)
	}

	function initSmallScreenListener(): void {
		const callback = () => {
			if (inputViewOption() == null || outputViewOption() == null) return;
			setOutputViewOption(null)
		}

		eventListenerAdd<MediaQueryListEvent>(matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`), 'change',  ev => {
			isSmallScreen = ev.matches
			if (!isSmallScreen) return;

			callback()
		})

		isSmallScreen = windowMatches(`(max-width: ${MIN_EDITOR_WIDTH}px)`)
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
			Source
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonOutput_resultId}
			c:variant={ButtonVariant.tonal}
			c:selected={outputViewOption() !== null}>
			Result
		</Button>
	</>)

	return (<div
		class={CSS.body}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) === 'BUTTON'
			)) return

			switch (elementId(button)) {
			case buttonInput_sourceId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.result)
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() === InputViewOption.result
					&& outputViewOption() !== null
				) return setInputViewOption(null)

				setInputViewOption(InputViewOption.result)
				textAreaRef.value = props.inputText
				break
			case buttonOutput_resultId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.source)
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() === OutputViewOption.source
					&& inputViewOption() !== null
				) return setOutputViewOption(null)

				setOutputViewOption(OutputViewOption.source)
				break
			}
		}}>
		<div
			class={CSS.body_input}
			data-hidden={attrSetIfExist(inputViewOption() === null)}
			data-output-hidden={attrSetIfExist(outputViewOption() === null)}
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
				data-text-wrap={attrSetIfExist(settings().textWrap)}
				placeholder={`Type your javascript here ...`}></textarea>
			<Show when={inputViewOption() !== null && outputViewOption() !== null}>
				<div
					data-g-keep-pointer-event={attrSetIfExist(isDragging())}
					class={CSS.body_drag_handle}
					onPointerDown={(ev) => {
						attrSet(body, BodyAttributes.noPointerEvent)
						setWidth(ev.clientX)
						setIsDragging(true)
						elementPointerCaptureSet(eventCurrentTarget(ev), ev.pointerId)
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
				readOnly
				value={props.outputText}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap></textarea>
		</div>
	</div>)
}

export default _