import { createMemo, createSignal, For, Show, type VoidComponent } from "solid-js";

import type { Settings, TaskList } from "./_types";
import { _command, _emoji, _expand, _icon, _id, _length, _name, _page, _selectedTaskList, _tasks, _taskLists, _text, _type, _filter, _hiddenNavigation, _includes, _settings, _tonal, _filled, _trim, _currentTarget, _value, _manual } from "@/data/string";
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_data";
import { addClassListModule } from "@/utils/element";
import { Commands, Pages } from "./_enums";

import { TextTooltip } from "@/components/Tooltip";
import Divider from "@/components/Divider";
import Emoji from "@/components/Emoji";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'
import Dialog, { closeDialog, openDialog } from "@/components/Dialog";
import Button, { ButtonVariant } from "@/components/Button";
import TextField, { changeTextFieldValue, TextFieldButton } from "@/components/TextField";
import Icon from "@/components/Icon";

const _: VoidComponent<{
    expand: boolean
    taskLists: TaskList[]
    page: Pages | number
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [listNameText, setListNameText] = createSignal<string>('')
    const [emoji, setEmoji] = createSignal<string | null>(null)
    let dialog_newList_ref: HTMLDialogElement
    let textfield_newList_ref: HTMLInputElement

    function addNewList(): void {
        // TODO: add new list
    }

    const Page: VoidComponent<{ type: Pages, text: string, icon: number}> = ($props) => {
        return (<TextTooltip text={!props[_expand]? $props[_text] : undefined}>
            <SideNavigationItem 
                iconCode={$props[_icon]}
                selected={props[_page] == $props[_type]}
                onClick={() => props[_command](Commands.change_page, $props[_type])}
                iconOnly={!props[_expand]}>
                {$props[_text]}
            </SideNavigationItem>
        </TextTooltip>)
    }

    const Item: VoidComponent<TaskList> = ($props) => {
        return (<TextTooltip text={!props[_expand]? $props[_name] : undefined}>
            <SideNavigationItem
                leading={<Show when={$props[_emoji] != null}><Emoji emoji={$props[_emoji]!} /></Show>} 
                selected={props[_page] == $props[_id]}
                onClick={() => props[_command](Commands.change_page, $props[_id])}
                iconOnly={!props[_expand]}>
                {$props[_name]}
            </SideNavigationItem>
        </TextTooltip>)
    }

    return (<SideNavigation
        style={{"padding-top": '0'}}
        classList={addClassListModule(CSS.sideNavigation)}
        expand={props[_expand]}
        footer={<>
            <TextTooltip text={!props[_expand]? "Add new list" : undefined}>
                <SideNavigationItem 
                    iconCode={0xE007}
                    iconOnly={!props[_expand]}
                    onClick={ev => openDialog(ev, dialog_newList_ref, {
                        important: true, 
                        inputAutoFocus: true
                    })}>
                    New list
                </SideNavigationItem>
            </TextTooltip>
        </>}>
        <For each={TASKS_PAGES[_filter](page => !props[_settings][_hiddenNavigation][_includes](page[_type]))}>{p => <Page {...p}/>}</For>
        <Show when={props[_taskLists][_length] - 1 > 0}>
            <Divider />
        </Show>
        <For each={props[_taskLists][_filter](v => v[_id] != DEFAULT_TASK_LIST[_id])}>{p => <Item {...p}/>}</For>
        <Dialog
            ref={r => dialog_newList_ref = r}
            header="New list"
            style={{width: '500px'}}
            onClose={() => {
                setListNameText('')
                setEmoji(null)
                changeTextFieldValue(textfield_newList_ref, '')
            }}
            actions={<>
                <Button onClick={() => closeDialog(dialog_newList_ref)} variant={ButtonVariant[_tonal]}>Cancel</Button>
                <Button 
                    onClick={() => {
                        addNewList()
                        closeDialog(dialog_newList_ref)
                    }} 
                    disabled={listNameText()[_trim]() == ''}
                    variant={ButtonVariant[_filled]}>
                    Add
                </Button>
            </>}>
            <TextField 
                ref={r => textfield_newList_ref = r}
                placeholder="List name"
                onInput={ev => setListNameText(ev[_currentTarget][_value])}
                onFocus={ev => setListNameText(ev[_currentTarget][_value])}
                trailing={<TextFieldButton>
                    <Show when={emoji() == null} fallback={<Emoji emoji={emoji()!}/>}>
                        <Icon code={0xE747}/>
                    </Show>
                </TextFieldButton>}
            />
            </Dialog>
    </SideNavigation>)
}

export default _