import { createMemo, createSignal, onMount, Show, type VoidComponent } from "solid-js"
import beautiful from 'simply-beautiful'

import type { Settings } from "./_types"
import { event_add_listener } from "@/utils/event"
import { attr_remove, attr_set, attr_set_if_exist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands } from "./_enums"
import { IFRAME_PREVIEW_ID, MIN_EDITOR_WIDTH } from "./_constants"
import { window_matches } from "@/utils/window"
import { document_body } from "@/utils/document"
import { string_replace } from "@/utils/string"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

const enum InputViewOption {
	markdown,
	css
}

const enum OutputViewOption {
	preview,
	html
}

const _: VoidComponent<{
	settings: Settings
	text_html: string
	text_markdown: string
	text_css: string
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document_body()
	const [width, set_width] = createSignal<number | null>(null)
	const [is_dragging, set_is_dragging] = createSignal<boolean>(false)
	const [input_view_option, set_input_view_option] = createSignal<InputViewOption | null>(InputViewOption.markdown)
	const [output_view_option, set_output_view_option] = createSignal<OutputViewOption | null>(OutputViewOption.preview)
	const settings = createMemo(() => props.settings)
	let timeout_id: number | null
	let textarea_ref: HTMLTextAreaElement
	let is_small_screen: boolean = false

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function update_output(): void {
		if (timeout_id != null) timeout_clear(timeout_id)
		timeout_id = timeout_set(() => {
			const $command = (input_view_option() == InputViewOption.markdown
				? Commands.update_markdown_text
				: Commands.update_css_text
			)
			command($command, textarea_ref.value)
			timeout_id = null
		}, 500)
	}

	function update_width(width: number): void {
		if (!is_dragging()) return;
		set_width(width)
	}

	function close_drag(): void {
		set_is_dragging(false)
		attr_remove(body, BodyAttributes.no_pointer_event)
	}

	function init_events(): void {
		event_add_listener<TouchEvent>(document, 'touchmove', ev => update_width(ev.touches[0].clientX))
		event_add_listener<TouchEvent>(document, 'touchend', () => close_drag())
		event_add_listener<MouseEvent>(document, 'mousemove', ev => update_width(ev.clientX))
		event_add_listener<MouseEvent>(document, 'mouseup', () => close_drag())
	}

	function init_smallscreen_listener(): void {
		const callback = () => {
			if (input_view_option() == null || output_view_option() == null) return;
			set_output_view_option(null)
		}

		event_add_listener<MediaQueryListEvent>(matchMedia(`(max-width: ${MIN_EDITOR_WIDTH}px)`), 'change',  ev => {
			is_small_screen = ev.matches
			if (!is_small_screen) return;

			callback()
		})

		is_small_screen = window_matches(`(max-width: ${MIN_EDITOR_WIDTH}px)`)
		if (!is_small_screen) return;

		callback()
	}

	onMount(() => {
		init_events()
		init_smallscreen_listener()
	})

	const InputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant.tonal}
			selected={input_view_option() == InputViewOption.markdown}
			onClick={() => {
				if (is_small_screen) {
					set_input_view_option(InputViewOption.markdown)
					set_output_view_option(null)
					return;
				}

				if (input_view_option() == InputViewOption.markdown && output_view_option() != null)
					return set_input_view_option(null)
				set_input_view_option(InputViewOption.markdown)
				textarea_ref.value = props.text_markdown
			}}>
			Markdown
		</Button>
		<Button
			variant={ButtonVariant.tonal}
			selected={input_view_option() == InputViewOption.css}
			onClick={() => {
				if (is_small_screen) {
					set_input_view_option(InputViewOption.css)
					set_output_view_option(null)
					return;
				}

				if (input_view_option() == InputViewOption.css && output_view_option() != null)
					return set_input_view_option(null)
				set_input_view_option(InputViewOption.css)
				textarea_ref.value = props.text_css
			}}>
			CSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant.tonal}
			selected={output_view_option() == OutputViewOption.preview}
			onClick={() => {
				if (is_small_screen) {
					set_output_view_option(OutputViewOption.preview)
					set_input_view_option(null)
					return;
				}

				if (output_view_option() == OutputViewOption.preview && input_view_option() != null)
					return set_output_view_option(null)
				set_output_view_option(OutputViewOption.preview)
			}}>
			Preview
		</Button>
		<Button
			variant={ButtonVariant.tonal}
			selected={output_view_option() == OutputViewOption.html}
			onClick={() => {
				if (is_small_screen) {
					set_output_view_option(OutputViewOption.html)
					set_input_view_option(null)
					return;
				}

				if (output_view_option() == OutputViewOption.html && input_view_option() != null)
					return set_output_view_option(null)
				set_output_view_option(OutputViewOption.html)
			}}>
			HTML
		</Button>
	</>)

	return (<div class={CSS.body}>
		<div
			class={CSS.body_input}
			data-hidden={attr_set_if_exist(input_view_option() == null)}
			data-output-hidden={attr_set_if_exist(output_view_option() == null)}
			style={{width: width() == null? undefined : width() + 'px'}}>
			<div class={CSS.body_tabs}>
				<InputTabButtons/>
				<Show when={output_view_option() == null}>
					<OutputTabButtons/>
				</Show>
			</div>
			<textarea
				autofocus
				onInput={() => update_output()}
				ref={r => textarea_ref = r}
				value={input_view_option() == InputViewOption.markdown? props.text_markdown : props.text_css}
				style={{"font-size": settings().font_size + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={attr_set_if_exist(settings().text_wrap)}
				placeholder={`Type your ${input_view_option() == InputViewOption.markdown? 'markdown' : 'CSS'} ...`}></textarea>
			<Show when={input_view_option() != null && output_view_option() != null}>
				<div
					data-g-keep-pointer-event={attr_set_if_exist(is_dragging())}
					class={CSS.body_drag_handle}
					onMouseDown={(ev) => {
						attr_set(body, BodyAttributes.no_pointer_event)
						set_width(ev.clientX)
						set_is_dragging(true)
					}}
					onTouchStart={(ev) => {
						set_is_dragging(true)
						attr_set(body, BodyAttributes.no_pointer_event)
						set_width(ev.touches[0].clientX)
					}}
					onDblClick={() => set_width(null)}
				/>
			</Show>
		</div>
		<div
			class={CSS.body_output}
			data-hidden={attr_set_if_exist(output_view_option() == null)}>
			<div class={CSS.body_tabs}>
				<Show when={input_view_option() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_html_output}
				style={{"font-size": settings().font_size + 'px'}}
				data-hidden={attr_set_if_exist(output_view_option() != OutputViewOption.html)}>
				{string_replace(beautiful.html(props.text_html), /(?<=>)\n+(?=<)/gs, '\n')}
			</div>
			<iframe
				id={IFRAME_PREVIEW_ID}
				title='Markdown output'
				class={CSS.body_preview_output}
				data-hidden={attr_set_if_exist(output_view_option() != OutputViewOption.preview)}
				srcdoc={`<style>${props.text_css}</style>` +  props.text_html }
			></iframe>
		</div>
	</div>)
}

export default _