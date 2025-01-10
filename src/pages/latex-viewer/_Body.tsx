import { createEffect, createMemo, createSignal, Index, Show, type Accessor, type VoidComponent } from "solid-js"
import katex from 'katex'

import type { Settings } from "./_types"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands } from "./_enums"
import { attr_set_if_exist } from "@/utils/attributes"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { promise_done } from "@/utils/object"
import { element_dataset, element_scroll_height, element_tagname, element_valid_target } from "@/utils/element"
import { array_length } from "@/utils/array"
import { document_active } from "@/utils/document"
import { event_current_target } from "@/utils/event"
import { number_is_not_defined, number_parse } from "@/utils/number"

import Toast, { open_toast } from "@/components/Toast"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'

const LatexEditor: VoidComponent<{
	index: number
	is_only_one: boolean
	latex: Accessor<string>
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = props => {
	const [height, set_height] = createSignal<number>(0)
	const settings = createMemo(() => props.settings)
	const index = createMemo(() => props.index)
	let timeout_update_id: number | null = null
	let textarea_ref: HTMLTextAreaElement

	function save_input(): void {
		if (timeout_update_id != null) timeout_clear(timeout_update_id)
		timeout_update_id = timeout_set(() => {
			const text = textarea_ref.value
			props.command(Commands.update_latex_input, text, index())
			timeout_update_id = null
		}, 500)
	}

	createEffect(() => {
		const latex = props.latex()

		textarea_ref.value = latex
		timeout_set(() => {
			set_height(0)
			set_height(element_scroll_height(textarea_ref))
		})
	})

	return (<div class={CSS.body_latex_editor}>
		<textarea
			ref={r => textarea_ref = r}
			rows={1}
			placeholder="Type your LaTeX here ..."
			onInput={() => {
				set_height(0)
				set_height(element_scroll_height(textarea_ref!))
				save_input()
			}}
			value={props.latex()}
			data-text-wrap={attr_set_if_exist(settings().text_wrap)}
			style={{
				"font-size": settings().font_size + 'px',
				"height": height() + 'px'
			}}
		/>
		<div innerHTML={katex.renderToString(props.latex(), {
			displayMode: true,
			output: 'mathml',
			errorColor: 'rgb(var(--color-on-error))',
			throwOnError: false
		})}/>
		<div class={CSS.body_new_equation_bottom}>
			<Button
				data-new={index()}
				variant={ButtonVariant.tonal}>
				<Icon code={0xE007}/>New equation
			</Button>
			<IconButton
				data-tooltip={"Copy"}
				data-copy={index()}
				code={0xE51B}
				variant={ButtonVariant.tonal}
			/>
			<Show when={!props.is_only_one}>
				<IconButton
					data-tooltip="Delete"
					data-delete={index()}
					code={0xE59D}
					variant={ButtonVariant.tonal}
				/>
			</Show>
		</div>
	</div>)
}

const _: VoidComponent<{
	settings: Settings
	latex: string[]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings)
	const latex = createMemo(() => props.latex)
	let toast_copy_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			const data_new = element_dataset(button, 'new')
			if (data_new) {
				const index = number_parse(data_new, true)
				if (number_is_not_defined(index)) return

				command(Commands.add_equation, index + 1)
				return
			}

			const data_delete = element_dataset(button, 'delete')
			if (data_delete) {
				const index = number_parse(data_delete, true)
				if (number_is_not_defined(index)) return

				command(Commands.delete_equation, index)
				return
			}

			const data_copy = element_dataset(button, 'copy')
			if (data_copy) {
				const index = number_parse(data_copy, true)
				if (number_is_not_defined(index)) return

				promise_done(
					navigator_clipboard_writetext(
						settings().prefix
						+ latex()[index]
						+ settings().suffix
					),
					() => open_toast(ev, toast_copy_ref)
				)
				return
			}
		}}>
		<div class={CSS.body_new_equation_top}>
			<Button
				onClick={() => command(Commands.add_equation, 0)}
				variant={ButtonVariant.filled}>
				<Icon code={0xE007}/>New equation
			</Button>
		</div>
		<Tooltip>
			<Index each={latex()}>{(l, i) => <LatexEditor
				command={command}
				latex={l}
				index={i}
				is_only_one={array_length(latex()) == 1}
				settings={props.settings}
			/>}</Index>
		</Tooltip>
		<Toast
			ref={r => toast_copy_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</main>)
}

export default _