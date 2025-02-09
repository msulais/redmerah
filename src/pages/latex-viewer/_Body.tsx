import { createEffect, createMemo, createSignal, Index, Show, type Accessor, type VoidComponent } from "solid-js"
import katex from 'katex'

import type { Settings } from "./_types"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { Commands } from "./_enums"
import { attrSetIfExist } from "@/utils/attributes"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { promiseDone } from "@/utils/object"
import { elementDataset, elementScrollHeight, elementTagName, elementValidTarget } from "@/utils/element"
import { arrayLength } from "@/utils/array"
import { documentActive } from "@/utils/document"
import { eventCurrentTarget } from "@/utils/event"
import { numberIsNotDefined, numberParse } from "@/utils/number"
import { ICON_ADD, ICON_COPY, ICON_DELETE } from "@/constants/icons"

import Toast, { openToast } from "@/components/Toast"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'

const LatexEditor: VoidComponent<{
	index: number
	isOnlyOne: boolean
	latex: Accessor<string>
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = props => {
	const [height, setHeight] = createSignal<number>(0)
	const settings = createMemo(() => props.settings)
	const index = createMemo(() => props.index)
	let timeUpdateId: number | null = null
	let textAreaRef: HTMLTextAreaElement

	function save_input(): void {
		if (timeUpdateId != null) timeTimerClear(timeUpdateId)
		timeUpdateId = timeTimerSet(() => {
			const text = textAreaRef.value
			props.command(Commands.updateLatexInput, text, index())
			timeUpdateId = null
		}, 500)
	}

	createEffect(() => {
		const latex = props.latex()

		textAreaRef.value = latex
		timeTimerSet(() => {
			setHeight(0)
			setHeight(elementScrollHeight(textAreaRef))
		})
	})

	return (<div class={CSS.body_latex_editor}>
		<textarea
			ref={r => textAreaRef = r}
			rows={1}
			placeholder="Type your LaTeX here ..."
			onInput={() => {
				setHeight(0)
				setHeight(elementScrollHeight(textAreaRef!))
				save_input()
			}}
			value={props.latex()}
			data-text-wrap={attrSetIfExist(settings().textWrap)}
			style={{
				"font-size": settings().fontSize + 'px',
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
				c:variant={ButtonVariant.tonal}>
				<Icon c:code={ICON_ADD}/>New equation
			</Button>
			<IconButton
				data-tooltip={"Copy"}
				data-copy={index()}
				c:code={ICON_COPY}
				c:variant={ButtonVariant.tonal}
			/>
			<Show when={!props.isOnlyOne}>
				<IconButton
					data-tooltip="Delete"
					data-delete={index()}
					c:code={ICON_DELETE}
					c:variant={ButtonVariant.tonal}
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
	let toastCopyRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			const dataNew = elementDataset(button, 'new')
			if (dataNew) {
				const index = numberParse(dataNew, true)
				if (numberIsNotDefined(index)) return

				command(Commands.addEquation, index + 1)
				return
			}

			const dataDelete = elementDataset(button, 'delete')
			if (dataDelete) {
				const index = numberParse(dataDelete, true)
				if (numberIsNotDefined(index)) return

				command(Commands.deleteEquation, index)
				return
			}

			const dataCopy = elementDataset(button, 'copy')
			if (dataCopy) {
				const index = numberParse(dataCopy, true)
				if (numberIsNotDefined(index)) return

				promiseDone(
					navigatorClipboardWriteText(
						settings().prefix
						+ latex()[index]
						+ settings().suffix
					),
					() => openToast(toastCopyRef)
				)
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
				isOnlyOne={arrayLength(latex()) == 1}
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