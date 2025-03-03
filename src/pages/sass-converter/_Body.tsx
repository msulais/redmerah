import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { attrSetIfExist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { DEFAULT_INPUT_VIEW_OPTION, MIN_EDITOR_WIDTH } from "./_constants"
import { elementValidTarget } from "@/utils/element"
import { Commands, InputViewOption } from "./_enums"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

enum OutputViewOption {
	css
}

const _: VoidComponent<{
	sassText: string
	scssText: string
	cssText: string
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document.body
	const buttonInputSASSId = createUniqueId()
	const buttonInputSCSSId = createUniqueId()
	const buttonOutputCSSId = createUniqueId()
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(DEFAULT_INPUT_VIEW_OPTION)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption.css)
	const sassText = createMemo(() => props.sassText)
	const scssText = createMemo(() => props.scssText)
	const cssText = createMemo(() => props.cssText)
	const settings = createMemo(() => props.settings)
	let timeId: number | NodeJS.Timeout | null
	let textAreaRef: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateOutput(): void {
		if (timeId != null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			const $command = (inputViewOption() == InputViewOption.sass
				? Commands.updateSASSText
				: Commands.updateSCSSText
			)
			command($command, textAreaRef.value)
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
			c:variant={ButtonVariant.tonal}
			id={buttonInputSASSId}
			c:selected={inputViewOption() == InputViewOption.sass}>
			SASS
		</Button>
		<Button
			c:variant={ButtonVariant.tonal}
			id={buttonInputSCSSId}
			c:selected={inputViewOption() == InputViewOption.scss}>
			SCSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			c:variant={ButtonVariant.tonal}
			id={buttonOutputCSSId}
			c:selected={outputViewOption() == OutputViewOption.css}>
			CSS
		</Button>
	</>)

	return (<div
		class={CSS.body}
		onClick={ev => {
			const button = document.activeElement!
			if (!elementValidTarget(
				ev.currentTarget,
				button,
			)) return

			switch (button.id) {
			case buttonInputSASSId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.sass)
					setOutputViewOption(null)
					return
				}

				if (inputViewOption() == InputViewOption.sass && outputViewOption() != null)
					return setInputViewOption(null)

				setInputViewOption(InputViewOption.sass)
				command(Commands.changeInputViewOption, InputViewOption.sass)
				textAreaRef.value = sassText()
				break
			case buttonInputSCSSId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.scss)
					setOutputViewOption(null)
					return
				}

				if (inputViewOption() == InputViewOption.scss && outputViewOption() != null)
					return setInputViewOption(null)

				setInputViewOption(InputViewOption.scss)
				command(Commands.changeInputViewOption, InputViewOption.scss)
				textAreaRef.value = scssText()
				break
			case buttonOutputCSSId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.css)
					setInputViewOption(null)
					return
				}

				if (outputViewOption() == OutputViewOption.css && inputViewOption() != null)
					return setOutputViewOption(null)

				setOutputViewOption(OutputViewOption.css)
				break
			}
		}}>
		<div
			class={CSS.body_input}
			data-hidden={attrSetIfExist(inputViewOption() == null)}
			data-output-hidden={attrSetIfExist(outputViewOption() == null)}
			style={{width: width() == null? undefined : width() + 'px'}}>
			<div class={CSS.body_tabs}>
				<InputTabButtons/>
				<Show when={outputViewOption() == null}>
					<OutputTabButtons/>
				</Show>
			</div>
			<textarea
				autofocus
				onInput={() => updateOutput()}
				ref={r => textAreaRef = r}
				value={inputViewOption() == InputViewOption.sass? sassText() : scssText()}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={attrSetIfExist(settings().textWrap)}
				placeholder={`Type your ${inputViewOption() == InputViewOption.scss? 'SCSS' : 'SASS'} ...`}></textarea>
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
			data-hidden={attrSetIfExist(outputViewOption() == null)}
			data-no-text-wrap={attrSetIfExist(!settings().textWrap)}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_css_output}
				style={{"font-size": settings().fontSize + 'px'}}
				data-text-wrap={attrSetIfExist(settings().textWrap)}>
				{cssText()}
			</div>
		</div>
	</div>)
}

export default _