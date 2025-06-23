import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"
import beautiful from 'simply-beautiful'

import type { Settings } from "./_types"
import { setAttrIfExist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { Commands } from "./_enums"
import { IFRAME_PREVIEW_ID, MIN_EDITOR_WIDTH } from "./_constants"
import { isTargetValidElement } from "@/utils/element"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

enum InputViewOption {
	markdown,
	css
}

enum OutputViewOption {
	preview,
	html
}

const _: VoidComponent<{
	settings: Settings
	textHTML: string
	textMarkdown: string
	textCSS: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document.body
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(InputViewOption.markdown)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption.preview)
	const settings = createMemo(() => props.settings)
	const buttonInput_markdownId = createUniqueId()
	const buttonInput_cssId = createUniqueId()
	const buttonOutput_previewId = createUniqueId()
	const buttonOutput_htmlId = createUniqueId()
	let timeId: number | NodeJS.Timeout | null
	let textAreaRef: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateOutput(): void {
		if (timeId != null) clearTimeout(timeId)
		timeId = setTimeout(() => {
			const $command = (inputViewOption() == InputViewOption.markdown
				? Commands.updateMarkdownText
				: Commands.updateCSSText
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

		window
		.matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`)
		.addEventListener('change',  ev => {
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
			id={buttonInput_markdownId}
			c:variant={ButtonVariant.tonal}
			c:selected={inputViewOption() == InputViewOption.markdown}>
			Markdown
		</Button>
		<Button
			id={buttonInput_cssId}
			c:variant={ButtonVariant.tonal}
			c:selected={inputViewOption() == InputViewOption.css}>
			CSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			id={buttonOutput_previewId}
			c:variant={ButtonVariant.tonal}
			c:selected={outputViewOption() == OutputViewOption.preview}>
			Preview
		</Button>
		<Button
			id={buttonOutput_htmlId}
			c:variant={ButtonVariant.tonal}
			c:selected={outputViewOption() == OutputViewOption.html}>
			HTML
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
			case buttonInput_markdownId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.markdown)
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() == InputViewOption.markdown && outputViewOption() != null)
					return setInputViewOption(null)
				setInputViewOption(InputViewOption.markdown)
				textAreaRef.value = props.textMarkdown
				break
			case buttonInput_cssId:
				if (isSmallScreen) {
					setInputViewOption(InputViewOption.css)
					setOutputViewOption(null)
					return
				}

				if (inputViewOption() == InputViewOption.css && outputViewOption() != null){
					return setInputViewOption(null)
				}

				setInputViewOption(InputViewOption.css)
				textAreaRef.value = props.textCSS
				break
			case buttonOutput_previewId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.preview)
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() == OutputViewOption.preview && inputViewOption() != null){
					return setOutputViewOption(null)
				}
				setOutputViewOption(OutputViewOption.preview)
				break
			case buttonOutput_htmlId:
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption.html)
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() == OutputViewOption.html && inputViewOption() != null)
					return setOutputViewOption(null)
				setOutputViewOption(OutputViewOption.html)
				break
			}
		}}>
		<div
			class={CSS.body_input}
			data-hidden={setAttrIfExist(inputViewOption() == null)}
			data-output-hidden={setAttrIfExist(outputViewOption() == null)}
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
				value={inputViewOption() == InputViewOption.markdown? props.textMarkdown : props.textCSS}
				style={{"font-size": settings().fontSize + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={setAttrIfExist(settings().textWrap)}
				placeholder={`Type your ${inputViewOption() == InputViewOption.markdown? 'markdown' : 'CSS'} ...`}></textarea>
			<Show when={inputViewOption() != null && outputViewOption() != null}>
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
			data-hidden={setAttrIfExist(outputViewOption() == null)}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_html_output}
				style={{"font-size": settings().fontSize + 'px'}}
				data-hidden={setAttrIfExist(outputViewOption() != OutputViewOption.html)}>
				{beautiful.html(props.textHTML).replace(/(?<=>)\n+(?=<)/gs, '\n')}
			</div>
			<iframe
				id={IFRAME_PREVIEW_ID}
				title='Markdown output'
				class={CSS.body_preview_output}
				data-hidden={setAttrIfExist(outputViewOption() != OutputViewOption.preview)}
				srcdoc={`<style>${props.textCSS}</style>` +  props.textHTML }
			></iframe>
		</div>
	</div>)
}

export default _