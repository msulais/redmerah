import { createEffect, type VoidComponent } from "solid-js"

import { toggleAttribute } from "@/utils/attributes"
import { _note, _value, _expand, _onNoteChanged, _currentTarget } from "@/constants/string"

import { AreaTextField, changeAreaTextFieldValue } from "@/components/TextField"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
    expand: boolean
    note: string
    onNoteChanged: (value: string) => unknown
}> = (props) => {
    let textarea_ref: HTMLTextAreaElement

    createEffect(() => {
        if (props[_note] == textarea_ref[_value]) return;

        if (textarea_ref[_value] == '') return changeAreaTextFieldValue(textarea_ref, props[_note])
        textarea_ref[_value] = props[_note]
    })

    return (<div class={CSS.notebook} data-expand={toggleAttribute(props[_expand])}>
        <AreaTextField
            ref={r => textarea_ref = r}
            labelText="Notebook"
            placeholder="Type your thought here ..."
            onInput={(ev) => props[_onNoteChanged](ev[_currentTarget][_value])}
        />
    </div>)
}

export default _