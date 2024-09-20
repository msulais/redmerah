import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import { For, Show, type VoidComponent } from "solid-js"
import type { Note } from "./_types"
import { _command, _emoji, _expand, _id, _length, _notes, _title } from "@/constants/string"
import TextTooltip from "@/components/Tooltip"
import Emoji from "@/components/Emoji"
import CSS from './_styles.module.scss'
import { Commands } from "./_enums"

const _: VoidComponent<{
    notes: Note[]
    expand: boolean
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    return (<Show when={props[_notes][_length] > 0}>
        <SideNavigation expand={props[_expand]} class={CSS.side_navigation}>
            <For each={props[_notes]}>{note =>
                <TextTooltip text={!props[_expand]? note[_title] : undefined}>
                    <SideNavigationItem
                        iconCode={note[_emoji] == null? 0xF032 : undefined}
                        leading={<Show when={note[_emoji] != null}><Emoji emoji={note[_emoji]!} /></Show>}
                        iconOnly={!props[_expand]}
                        onClick={() => props[_command](Commands.change_note, note[_id])}>
                        {note[_title]}
                    </SideNavigationItem>
                </TextTooltip>
            }</For>
        </SideNavigation>
    </Show>)
}

export default _