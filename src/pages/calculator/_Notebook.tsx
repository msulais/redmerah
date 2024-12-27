import { createEffect, createMemo, type VoidComponent } from "solid-js"

import { attr_set_if_exist } from "@/utils/attributes"
import { event_current_target } from "@/utils/event"

import { AreaTextField, change_areatextfield_value } from "@/components/TextField"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	expanded: boolean
	note: string
	on_note_changed: (value: string) => unknown
}> = (props) => {
	const note = createMemo(() => props.note)
	let textarea_ref: HTMLTextAreaElement

	createEffect(() => {
		const value = textarea_ref.value
		if (note() == value) return;

		if (value == '') return change_areatextfield_value(textarea_ref, note())
		textarea_ref.value = note()
	})

	return (<div class={CSS.notebook} data-expand={attr_set_if_exist(props.expanded)}>
		<AreaTextField
			ref={r => textarea_ref = r}
			label="Notebook"
			placeholder="Type your thought here ..."
			onInput={(ev) => props.on_note_changed(event_current_target(ev).value)}
		/>
	</div>)
}

export default _