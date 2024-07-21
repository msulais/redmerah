import { changeTextAreaFieldValue, TextAreaField } from "@/components/TextField"
import { createEffect, type VoidComponent } from "solid-js"

import CSS from './_Notebook.module.scss'
import { toggleAttribute } from "@/utils/attributes"
import { _currentTarget, _expand, _note, _onNoteChanged, _value } from "@/data/string"

type Props = {
    expand: boolean
    note: string
    onNoteChanged: (value: string) => unknown
}

const _: VoidComponent<Props> = (props) => {
    let textarea_ref: HTMLTextAreaElement

    createEffect(() => {
        if (props[_note] == textarea_ref[_value]) return;

        if (textarea_ref[_value] == '') return changeTextAreaFieldValue(textarea_ref, props[_note])
        textarea_ref[_value] = props[_note]
    })

    return (<div class={CSS.notebook} data-expand={toggleAttribute(props[_expand])}>
        <TextAreaField 
            ref={r => textarea_ref = r}
            labelText="Notebook" 
            placeholder="Type your thought here ..." 
            onInput={(ev) => props[_onNoteChanged](ev[_currentTarget][_value])}
        />
    </div>)
}

export default _