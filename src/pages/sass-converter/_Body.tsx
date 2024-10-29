import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { _markdown, _preview, _noPointerEvent, _touchmove, _touches, _clientX, _touchend, _mousemove, _mouseup, _change, _matches, _tonal, _value, _markdownText, _css, _cssText, _html, _px, _settings, _fontSize, _textWrap, _htmlText, _replace, _scss, _sass, _sassText, _scssText, _command } from "@/constants/string"
import { addEventListener } from "@/utils/event"
import { removeElementAttribute, setElementAttribute, setElementAttributeIfExist } from "@/utils/attributes"
import { getDocument, getDocumentBody } from "@/constants/window"
import { BodyAttributes } from "@/enums/attributes"
import { isMatchMedia } from "@/utils/window"
import { DEFAULT_INPUT_VIEW_OPTION, MIN_EDITOR_WIDTH } from "./_constants"
import { Commands, InputViewOption } from "./_enums"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'
import { endTimeout, startTimeout } from "@/utils/timeout"

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
	const [width, setWidth] = createSignal<number | null>(null)
	const [isDragging, setIsDragging] = createSignal<boolean>(false)
	const [inputViewOption, setInputViewOption] = createSignal<InputViewOption | null>(DEFAULT_INPUT_VIEW_OPTION)
	const [outputViewOption, setOutputViewOption] = createSignal<OutputViewOption | null>(OutputViewOption[_css])
	let timeoutId: number | null
	let textarea_ref: HTMLTextAreaElement
	let isSmallScreen: boolean = false

	function updateOutput(): void {
		if (timeoutId != null) endTimeout(timeoutId)
		timeoutId = startTimeout(() => {
			const command = (inputViewOption() == InputViewOption[_sass]
				? Commands.update_sass_text
				: Commands.update_scss_text
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
		removeElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
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
			selected={inputViewOption() == InputViewOption[_sass]}
			onClick={() => {
				if (isSmallScreen) {
					setInputViewOption(InputViewOption[_sass])
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() == InputViewOption[_sass] && outputViewOption() != null)
					return setInputViewOption(null)
				setInputViewOption(InputViewOption[_sass])
				props[_command](Commands.change_input_view_option, InputViewOption[_sass])
				textarea_ref[_value] = props[_sassText]
			}}>
			SASS
		</Button>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={inputViewOption() == InputViewOption[_scss]}
			onClick={() => {
				if (isSmallScreen) {
					setInputViewOption(InputViewOption[_scss])
					setOutputViewOption(null)
					return;
				}

				if (inputViewOption() == InputViewOption[_scss] && outputViewOption() != null)
					return setInputViewOption(null)
				setInputViewOption(InputViewOption[_scss])
				props[_command](Commands.change_input_view_option, InputViewOption[_scss])
				textarea_ref[_value] = props[_scssText]
			}}>
			SCSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant[_tonal]}
			selected={outputViewOption() == OutputViewOption[_css]}
			onClick={() => {
				if (isSmallScreen) {
					setOutputViewOption(OutputViewOption[_css])
					setInputViewOption(null)
					return;
				}

				if (outputViewOption() == OutputViewOption[_css] && inputViewOption() != null)
					return setOutputViewOption(null)
				setOutputViewOption(OutputViewOption[_css])
			}}>
			CSS
		</Button>
	</>)

	return (<div class={CSS.body}>
		<div
			class={CSS.body_input}
			data-hidden={setElementAttributeIfExist(inputViewOption() == null)}
			data-output-hidden={setElementAttributeIfExist(outputViewOption() == null)}
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
				value={inputViewOption() == InputViewOption[_sass]? props[_sassText] : props[_scssText]}
				style={{"font-size": props[_settings][_fontSize] + _px}}
				class={CSS.body_textfield}
				data-text-wrap={setElementAttributeIfExist(props[_settings][_textWrap])}
				placeholder={`Type your ${inputViewOption() == InputViewOption[_scss]? 'SCSS' : 'SASS'} ...`}></textarea>
			<Show when={inputViewOption() != null && outputViewOption() != null}>
				<div
					data-g-keep-pointer-event={setElementAttributeIfExist(isDragging())}
					class={CSS.body_drag_handle}
					onMouseDown={(ev) => {
						setElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
						setWidth(ev[_clientX])
						setIsDragging(true)
					}}
					onTouchStart={(ev) => {
						setIsDragging(true)
						setElementAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
						setWidth(ev[_touches][0][_clientX])
					}}
					onDblClick={() => setWidth(null)}
				/>
			</Show>
		</div>
		<div
			class={CSS.body_output}
			data-hidden={setElementAttributeIfExist(outputViewOption() == null)}
			data-no-text-wrap={setElementAttributeIfExist(!props[_settings][_textWrap])}>
			<div class={CSS.body_tabs}>
				<Show when={inputViewOption() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_css_output}
				style={{"font-size": props[_settings][_fontSize] + _px}}
				data-text-wrap={setElementAttributeIfExist(props[_settings][_textWrap])}>
				{props[_cssText]}
			</div>
		</div>
	</div>)
}

export default _