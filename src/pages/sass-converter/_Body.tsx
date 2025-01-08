import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { event_add_listener, event_current_target } from "@/utils/event"
import { attr_remove, attr_set, attr_set_if_exist } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { document_active, document_body } from "@/utils/document"
import { window_matches } from "@/utils/window"
import { DEFAULT_INPUT_VIEW_OPTION, MIN_EDITOR_WIDTH } from "./_constants"
import { element_id, element_tagname, element_valid_target } from "@/utils/element"
import { Commands, InputViewOption } from "./_enums"
import { timeout_clear, timeout_set } from "@/utils/timeout"

import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

const enum OutputViewOption {
	css
}

const _: VoidComponent<{
	sass_text: string
	scss_text: string
	css_text: string
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const body = document_body()
	const button_input_sass = createUniqueId()
	const button_input_scss = createUniqueId()
	const button_output_css = createUniqueId()
	const [width, set_width] = createSignal<number | null>(null)
	const [is_dragging, set_is_dragging] = createSignal<boolean>(false)
	const [input_view_option, set_input_view_option] = createSignal<InputViewOption | null>(DEFAULT_INPUT_VIEW_OPTION)
	const [output_view_option, set_output_view_option] = createSignal<OutputViewOption | null>(OutputViewOption.css)
	const sass_text = createMemo(() => props.sass_text)
	const scss_text = createMemo(() => props.scss_text)
	const css_text = createMemo(() => props.css_text)
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
			const $command = (input_view_option() == InputViewOption.sass
				? Commands.update_sass_text
				: Commands.update_scss_text
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
			id={button_input_sass}
			selected={input_view_option() == InputViewOption.sass}>
			SASS
		</Button>
		<Button
			variant={ButtonVariant.tonal}
			id={button_input_scss}
			selected={input_view_option() == InputViewOption.scss}>
			SCSS
		</Button>
	</>)

	const OutputTabButtons: VoidComponent = () => (<>
		<Button
			variant={ButtonVariant.tonal}
			id={button_output_css}
			selected={output_view_option() == OutputViewOption.css}>
			CSS
		</Button>
	</>)

	return (<div
		class={CSS.body}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			switch (element_id(button)) {
				case button_input_sass:
					if (is_small_screen) {
						set_input_view_option(InputViewOption.sass)
						set_output_view_option(null)
						return
					}

					if (input_view_option() == InputViewOption.sass && output_view_option() != null)
						return set_input_view_option(null)

					set_input_view_option(InputViewOption.sass)
					command(Commands.change_input_view_option, InputViewOption.sass)
					textarea_ref.value = sass_text()
					break
				case button_input_scss:
					if (is_small_screen) {
						set_input_view_option(InputViewOption.scss)
						set_output_view_option(null)
						return
					}

					if (input_view_option() == InputViewOption.scss && output_view_option() != null)
						return set_input_view_option(null)

					set_input_view_option(InputViewOption.scss)
					command(Commands.change_input_view_option, InputViewOption.scss)
					textarea_ref.value = scss_text()
					break
				case button_output_css:
					if (is_small_screen) {
						set_output_view_option(OutputViewOption.css)
						set_input_view_option(null)
						return
					}

					if (output_view_option() == OutputViewOption.css && input_view_option() != null)
						return set_output_view_option(null)

					set_output_view_option(OutputViewOption.css)
					break
			}
		}}>
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
				value={input_view_option() == InputViewOption.sass? sass_text() : scss_text()}
				style={{"font-size": settings().font_size + 'px'}}
				class={CSS.body_textfield}
				data-text-wrap={attr_set_if_exist(settings().text_wrap)}
				placeholder={`Type your ${input_view_option() == InputViewOption.scss? 'SCSS' : 'SASS'} ...`}></textarea>
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
			data-hidden={attr_set_if_exist(output_view_option() == null)}
			data-no-text-wrap={attr_set_if_exist(!settings().text_wrap)}>
			<div class={CSS.body_tabs}>
				<Show when={input_view_option() == null}>
					<InputTabButtons/>
				</Show>
				<OutputTabButtons/>
			</div>
			<div
				class={CSS.body_css_output}
				style={{"font-size": settings().font_size + 'px'}}
				data-text-wrap={attr_set_if_exist(settings().text_wrap)}>
				{css_text()}
			</div>
		</div>
	</div>)
}

export default _