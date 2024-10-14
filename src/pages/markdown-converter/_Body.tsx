import { createSignal, onMount, Show, type VoidComponent } from "solid-js"
import beautiful from 'simply-beautiful'

import type { Settings } from "./_types"
import { addEventListener } from "@/utils/event"
import { _change, _clientX, _command, _css, _cssText, _fontSize, _html, _htmlText, _markdown, _markdownText, _matches, _mousemove, _mouseup, _noPointerEvent, _preview, _px, _replace, _settings, _textWrap, _tonal, _touchend, _touches, _touchmove, _value } from "@/constants/string"
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes"
import { getDocument, getDocumentBody } from "@/constants/window"
import { BodyAttributes } from "@/enums/attributes"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { Commands } from "./_enums"
import { IFRAME_PREVIEW_ID, MIN_EDITOR_WIDTH } from "./_constants"
import { isMatchMedia } from "@/utils/window"

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
	htmlText: string
	markdownText: string
	cssText: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(InputViewOption[_markdown])
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption[_preview])
	let timeoutId: number | null
	let textarea_ref: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function updateOutput(): void {
		if (timeoutId != null) clearTimeDelayed(timeoutId)
		timeoutId = setTimeDelayed(() => {
			const command = (inputViewOption() == InputViewOption[_markdown]
				? Commands.update_markdown_text
				: Commands.update_css_text
			)
			props[_command](command, textarea_ref[_value])
			timeoutId = null
		}, 500)
	}

	function updateWidth(width: number): void {
		if (!isDragging()) return;
		setWidth(width)
	}

	function closeDrag(): void {
		setIsDragging(false)
		removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
	}

	function initEvents(): void {
		addEventListener<TouchEvent>(getDocument(), _touchmove, ev => updateWidth(ev[_touches][0][_clientX]))
		addEventListener<TouchEvent>(getDocument(), _touchend, () => closeDrag())
		addEventListener<MouseEvent>(getDocument(), _mousemove, ev => updateWidth(ev[_clientX]))
		addEventListener<MouseEvent>(getDocument(), _mouseup, () => closeDrag())
	}

	function initSmallScreenListener(): void {
		const callback = () => {
			if (inputViewOption() == null || outputViewOption() == null) return;
			setOutputViewOption(null)
		}

		addEventListener<MediaQueryListEvent>(matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`), _change,  ev => {
			isSmallScreen = ev[_matches]
			if (!isSmallScreen) return;

			callback()
		})

		isSmallScreen = isMatchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`)
		if (!isSmallScreen) return;

		callback()
	}

	onMount(() => {
		initEvents()
		initSmallScreenListener()
	})

	const InputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={inputViewOption() == InputViewOption[_markdown]}
			onClick={() => {
				if (isSmallScreen) {
					setInputViewOption(InputViewOption[_markdown])
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() == InputViewOption[_markdown] && outputViewOption() != null)
					return setInputViewOption(null)
				setInputViewOption(InputViewOption[_markdown])
				textarea_ref[_value] = props[_markdownText]
			}}>
			Markdown
		</Button>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={inputViewOption() == InputViewOption[_css]}
			onClick={() => {
				if (isSmallScreen) {
					setInputViewOption(InputViewOption[_css])
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() == InputViewOption[_css] && outputViewOption() != null)
					return setInputViewOption(null)
				setInputViewOption(InputViewOption[_css])
				textarea_ref[_value] = props[_cssText]
			}}>
			CSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={outputViewOption() == OutputViewOption[_preview]}
			onClick={() => {
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption[_preview])
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() == OutputViewOption[_preview] && inputViewOption() != null)
					return setOutputViewOption(null)
				setOutputViewOption(OutputViewOption[_preview])
			}}>
			Preview
		</Button>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={outputViewOption() == OutputViewOption[_html]}
			onClick={() => {
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption[_html])
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() == OutputViewOption[_html] && inputViewOption() != null)
					return setOutputViewOption(null)
				setOutputViewOption(OutputViewOption[_html])
			}}>
			HTML
		</Button>
	</>)

	return (<div class={CSS.body}>
		<div
			class={CSS.body_input}
			data-hidden={toggleAttribute(inputViewOption() == null)}
			data-output-hidden={toggleAttribute(outputViewOption() == null)}
			style={{width: width() == null? undefined : width() + _px}}>
			<div class={CSS.body_tabs}>
				<InputTabButtons/>
				<Show when={outputViewOption() == null}>
					<OutputTabButtons/>
				</Show>
			</div>
			<textarea
				autofocus
				onInput={() => updateOutput()}
				ref={r => textarea_ref = r}
				value={inputViewOption() == InputViewOption[_markdown]? props[_markdownText] : props[_cssText]}
				style={{"font-size": props[_settings][_fontSize] + _px}}
				class={CSS.body_textfield}
				data-text-wrap={toggleAttribute(props[_settings][_textWrap])}
				placeholder={`Type your ${inputViewOption() == InputViewOption[_markdown]? 'markdown' : 'CSS'} ...`}></textarea>
			<Show when={inputViewOption() != null && outputViewOption() != null}>
				<div
					data-g-keep-pointer-event={toggleAttribute(isDragging())}
					class={CSS.body_drag_handle}
					onMouseDown={(ev) => {
						setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
						setWidth(ev[_clientX])
						setIsDragging(true)
					}}
					onTouchStart={(ev) => {
						setIsDragging(true)
						setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
						setWidth(ev[_touches][0][_clientX])
					}}
					onDblClick={() => setWidth(null)}
				/>
			</Show>
		</div>
		<div
			class={CSS.body_output}
			data-hidden={toggleAttribute(outputViewOption() == null)}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_html_output}
				style={{"font-size": props[_settings][_fontSize] + _px}}
				data-hidden={toggleAttribute(outputViewOption() != OutputViewOption[_html])}>
				{beautiful[_html](props[_htmlText])[_replace](/(?<=>)\n+(?=<)/gs, '\n')}
			</div>
			<iframe
				id={IFRAME_PREVIEW_ID}
				title='Markdown output'
				class={CSS.body_preview_output}
				data-hidden={toggleAttribute(outputViewOption() != OutputViewOption[_preview])}
				srcdoc={`<style>${props[_cssText]}</style>` +  props[_htmlText] }
			></iframe>
		</div>
	</div>)
}

export default _