import { createEffect, createMemo, type VoidComponent } from "solid-js"

import { attrSetIfExist } from "@/utils/attributes"
import { eventCurrentTarget } from "@/utils/event"

import { AreaTextField, updateAreaTextFieldValue } from "@/components/TextField"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	expanded: boolean
	note: string
	onNoteChanged: (value: string) => unknown
}> = (props) => {
	const note = createMemo(() => props.note)
	let textAreaRef: HTMLTextAreaElement

	createEffect(() => {
		const value = textAreaRef.value
		if (note() == value) return;

		if (value == '') return updateAreaTextFieldValue(textAreaRef, note())
		textAreaRef.value = note()
	})

	return (<div class={CSS.notebook} data-expand={attrSetIfExist(props.expanded)}>
		<AreaTextField
			ref={r => textAreaRef = r}
			c:label="Notebook"
			placeholder="Type your thought here ..."
			onInput={(ev) => props.onNoteChanged(eventCurrentTarget(ev).value)}
		/>
	</div>)
}

export default _