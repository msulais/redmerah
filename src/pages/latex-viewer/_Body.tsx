import { createEffect, createMemo, Index, type Accessor, type VoidComponent } from "solid-js"
import katex from 'katex'

import type { Settings } from "./_types"
import { Commands } from "./_enums"
import { setAttrIfExist } from "@/utils/attributes"
import { isTargetValidElement } from "@/utils/element"
import { isNumberNotDefined } from "@/utils/number"
import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown } from "@/utils/keyboard"
import { ICON_ADD, ICON_COPY, ICON_DELETE } from "@/constants/icons"

import Toast, { openToast } from "@/components/Toast"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'
import { AreaTextField } from "@/components/TextField"

const LatexEditor: VoidComponent<{
	index: number
	isOnlyOne: boolean
	latex: Accessor<string>
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = props => {
	const settings = createMemo(() => props.settings)
	const index = createMemo(() => props.index)
	const buttons: HTMLButtonElement[] = []
	let timeUpdateId: number | NodeJS.Timeout | null = null
	let textAreaRef: HTMLTextAreaElement

	function save_input(): void {
		if (timeUpdateId != null) clearTimeout(timeUpdateId)
		timeUpdateId = setTimeout(() => {
			const text = textAreaRef.value
			props.command(Commands.updateLatexInput, text, index())
			timeUpdateId = null
		}, 500)
	}

	createEffect(() => {
		const latex = props.latex()

		textAreaRef.value = latex
	})

	return (<div class={CSS.body_latex_editor}>
		<AreaTextField
			onInput={() => save_input()}
			ref={r => textAreaRef = r}
			placeholder="Type your LaTeX here ..."
			value={props.latex()}
			data-text-wrap={setAttrIfExist(settings().textWrap)}
			style={{
				"font-size": settings().fontSize + 'px',
			}}
		/>
		<div innerHTML={katex.renderToString(props.latex(), {
			displayMode: true,
			output: 'mathml',
			errorColor: 'rgb(var(--color-on-error))',
			throwOnError: false
		})}/>
		<div
			class={CSS.body_new_equation_bottom}
			onFocusIn={ev => {
				const self = ev.currentTarget
				if (buttons.length === 0) {
					buttons.push(...self.children as unknown as HTMLButtonElement[])
				}
				keyboardOnFocusIn(ev, buttons)
			}}
			onFocusOut={ev => keyboardOnFocusOut(ev, buttons)}
			onKeyDown={ev => keyboardOnKeyDown(ev, buttons, {left: 'prev', right: 'next'})}>
			<Button
				data-new={index()}
				style="outline-offset:0"
				c:variant={ButtonVariant.tonal}>
				<Icon c:code={ICON_ADD}/>New equation
			</Button>
			<IconButton
				data-tooltip={"Copy"}
				data-copy={index()}
				style="outline-offset:0"
				c:code={ICON_COPY}
				c:variant={ButtonVariant.tonal}
			/>
			<IconButton
				disabled={props.isOnlyOne}
				data-tooltip="Delete"
				style="outline-offset:0"
				data-delete={index()}
				c:code={ICON_DELETE}
				c:variant={ButtonVariant.tonal}
			/>
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
	let toastCopyRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = document.activeElement! as HTMLButtonElement
			if (!isTargetValidElement(
				ev.currentTarget,
				button,
			)) return

			const dataset = button.dataset
			const dataNew = dataset.new
			if (dataNew) {
				const index = Number.parseInt(dataNew)
				if (isNumberNotDefined(index)) return

				command(Commands.addEquation, index + 1)
				return
			}

			const dataDelete = dataset.delete
			if (dataDelete) {
				const index = Number.parseInt(dataDelete)
				if (isNumberNotDefined(index)) return

				command(Commands.deleteEquation, index)
				return
			}

			const dataCopy = dataset.copy
			if (dataCopy) {
				const index = Number.parseInt(dataCopy)
				if (isNumberNotDefined(index)) return

				navigator.clipboard.writeText(
					settings().prefix
					+ latex()[index]
					+ settings().suffix
				).then(() => openToast(toastCopyRef))
				return
			}
		}}>
		<div class={CSS.body_new_equation_top}>
			<Button
				onClick={() => command(Commands.addEquation, 0)}
				c:variant={ButtonVariant.filled}>
				<Icon c:code={ICON_ADD}/>New equation
			</Button>
		</div>
		<Tooltip>
			<Index each={latex()}>{(l, i) => <LatexEditor
				command={command}
				latex={l}
				index={i}
				isOnlyOne={latex().length == 1}
				settings={props.settings}
			/>}</Index>
		</Tooltip>
		<Toast
			ref={r => toastCopyRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</main>)
}

export default _