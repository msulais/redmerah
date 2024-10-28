import { createEffect, createSignal, Index, Show, type Accessor, type VoidComponent } from "solid-js"
import katex from 'katex'

import type { Settings } from "./_types"
import { _clipboard, _command, _filled, _fontSize, _height, _index, _isOnlyThis, _latex, _length, _mathml, _prefix, _px, _renderToString, _scrollHeight, _settings, _suffix, _text, _textWrap, _then, _tonal, _value, _writeText } from "@/constants/string"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { Commands } from "./_enums"
import { toggleAttribute } from "@/utils/attributes"
import { getNavigator } from "@/constants/window"

import CSS from './_styles.module.scss'
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import TextTooltip from "@/components/Tooltip"

const LatexEditor: VoidComponent<{
	index: number
	isOnlyThis: boolean
	latex: Accessor<string>
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = props => {
	const [timeoutCopyId, setTimeoutCopyId] = createSignal<number | null>(null)
	const [height, setHeight] = createSignal<number>(0)
	let timeoutUpdateId: number | null = null
	let textarea_ref: HTMLTextAreaElement

	function saveInput(): void {
		if (timeoutUpdateId != null) clearTimeDelayed(timeoutUpdateId)
		timeoutUpdateId = setTimeDelayed(() => {
			const text = textarea_ref[_value]
			props[_command](Commands.update_latex_input, text, props[_index])
			timeoutUpdateId = null
		}, 500)
	}

	function copy(): void {
		getNavigator()
		[_clipboard]
		[_writeText](props[_settings][_prefix] + props[_latex] + props[_settings][_suffix])
		[_then](() => {
			if (timeoutCopyId() != null) clearTimeDelayed(timeoutCopyId()!)

			setTimeoutCopyId(setTimeDelayed(() => setTimeoutCopyId(null), 3000))
		})
	}

	createEffect(() => {
		const latex = props[_latex]()

		textarea_ref[_value] = latex
		setTimeDelayed(() => {
			setHeight(0)
			setHeight(textarea_ref[_scrollHeight])
		})
	})

	return (<div class={CSS.body_latex_editor}>
		<textarea
			ref={r => textarea_ref = r}
			rows={1}
			placeholder="Type your LaTeX here ..."
			onInput={() => {
				setHeight(0)
				setHeight(textarea_ref![_scrollHeight])
				saveInput()
			}}
			value={props[_latex]()}
			data-text-wrap={toggleAttribute(props[_settings][_textWrap])}
			style={{
				"font-size": props[_settings][_fontSize] + _px,
				"height": height() + _px
			}}
		/>
		<div innerHTML={katex[_renderToString](props[_latex](), {
			displayMode: true,
			output: _mathml,
			errorColor: 'rgb(var(--color-on-error))',
			throwOnError: false
		})}/>
		<div class={CSS.body_new_equation_bottom}>
			<Button
				onClick={() => props[_command](Commands.add_equation, props[_index] + 1)}
				variant={ButtonVariant[_tonal]}>
				<Icon code={0xE007}/>New equation
			</Button>
			<TextTooltip text={timeoutCopyId() != null? "Copied" : "Copy"}>
				<IconButton
					onClick={copy}
					code={timeoutCopyId() != null? 0xE3D8 : 0xE51B}
					variant={ButtonVariant[_tonal]}
				/>
			</TextTooltip>
			<Show when={!props[_isOnlyThis]}>
				<TextTooltip text="Delete">
					<IconButton
						code={0xE59D}
						variant={ButtonVariant[_tonal]}
						onClick={() => props[_command](Commands.delete_equation, props[_index])}
					/>
				</TextTooltip>
			</Show>
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
				onClick={() => props[_command](Commands.add_equation, 0)}
				variant={ButtonVariant[_filled]}>
				<Icon code={0xE007}/>New equation
			</Button>
		</div>
		<Index each={props[_latex]}>{(latex, i) => <LatexEditor
			command={props[_command]}
			latex={latex}
			index={i}
			isOnlyThis={props[_latex][_length] == 1}
			settings={props[_settings]}
		/>}</Index>
	</main>)
}

export default _