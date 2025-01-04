import { createEffect, createMemo, createSignal, Index, Show, type Accessor, type VoidComponent } from "solid-js"
import katex from 'katex'

import type { Settings } from "./_types"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands } from "./_enums"
import { attr_set_if_exist } from "@/utils/attributes"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { promise_done } from "@/utils/object"
import { element_scroll_height } from "@/utils/element"
import { array_length } from "@/utils/array"

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
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const [height, set_height] = createSignal<number>(0)
	const settings = createMemo(() => props.settings)
	let timeout_update_id: number | null = null
	let textarea_ref: HTMLTextAreaElement

	function save_input(): void {
		if (timeout_update_id != null) timeout_clear(timeout_update_id)
		timeout_update_id = timeout_set(() => {
			const text = textarea_ref.value
			props.command(Commands.update_latex_input, text, props.index)
			timeout_update_id = null
		}, 500)
	}

	function copy(): void {
		promise_done(
			navigator_clipboard_writetext(settings().prefix + props.latex() + settings().suffix),
			() => {
				if (timeout_copy_id() != null) timeout_clear(timeout_copy_id()!)

				set_timeout_copy_id(timeout_set(() => set_timeout_copy_id(null), 3000))
			}
		)
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
				onClick={() => props.command(Commands.add_equation, props.index + 1)}
				variant={ButtonVariant.tonal}>
				<Icon code={0xE007}/>New equation
			</Button>
			<Tooltip>
				<IconButton
					data-tooltip={timeout_copy_id() != null? "Copied" : "Copy"}
					onClick={copy}
					code={timeout_copy_id() != null? 0xE3D8 : 0xE51B}
					variant={ButtonVariant.tonal}
				/>
				<Show when={!props.is_only_one}>
					<IconButton
						data-tooltip="Delete"
						code={0xE59D}
						variant={ButtonVariant.tonal}
						onClick={() => props.command(Commands.delete_equation, props.index)}
					/>
				</Show>
			</Tooltip>
		</div>
	</div>)
}

const _: VoidComponent<{
	settings: Settings
	latex: string[]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	return (<main class={CSS.body}>
		<div class={CSS.body_new_equation_top}>
			<Button
				onClick={() => props.command(Commands.add_equation, 0)}
				variant={ButtonVariant.filled}>
				<Icon code={0xE007}/>New equation
			</Button>
		</div>
		<Index each={props.latex}>{(latex, i) => <LatexEditor
			command={props.command}
			latex={latex}
			index={i}
			is_only_one={array_length(props.latex) == 1}
			settings={props.settings}
		/>}</Index>
	</main>)
}

export default _