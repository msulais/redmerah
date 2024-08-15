import { createMemo, createSignal, For, Show, type VoidComponent } from "solid-js";

import type { Settings, TaskList } from "./_types";
import { _command, _emoji, _expand, _icon, _id, _length, _name, _page, _selectedTaskList, _tasks, _taskLists, _text, _type, _filter, _hiddenNavigation, _includes, _settings, _filledTonal, _filled, _trim, _currentTarget, _value, _manual } from "@/data/string";
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_data";
import { addClassListModule } from "@/utils/element";
import { Commands, Pages } from "./_enums";

import Tooltip from "@/components/Tooltip";
import Divider from "@/components/Divider";
import Emoji from "@/components/Emoji";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'
import Dialog from "@/components/Dialog";
import Button, { ButtonVariant } from "@/components/Button";
import { closeModal, openModal } from "@/utils/modal";
import TextField, { changeTextFieldValue, TextFieldTrailingButton } from "@/components/TextField";
import Icon from "@/components/Icon";

const _: VoidComponent<{
    expand: boolean
    taskLists: TaskList[]
    page: Pages | number
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [button_newList_ref, set_button_newList_ref] = createSignal<HTMLButtonElement | null>(null)
    const [listNameText, setListNameText] = createSignal<string>('')
    const [emoji, setEmoji] = createSignal<string | null>(null)
    let dialog_newList_ref: HTMLDialogElement
    let textfield_newList_ref: HTMLInputElement

    function addNewList(): void {
        // TODO: add new list
    }

    const Page: VoidComponent<{ type: Pages, text: string, icon: number}> = ($props) => {
        const [button_ref, set_button_ref] = createSignal<HTMLButtonElement | null>(null)

        return (<>
            <Show when={!props[_expand]}>
                <Tooltip anchor={button_ref()} text={$props[_text]}/>
            </Show>
            <SideNavigationItem 
                ref={r => set_button_ref(r)}
                iconCode={$props[_icon]}
                selected={props[_page] == $props[_type]}
                onClick={() => props[_command](Commands.change_page, $props[_type])}
                iconOnly={!props[_expand]}>
                {$props[_text]}
            </SideNavigationItem>
        </>)
    }

    const Item: VoidComponent<TaskList> = ($props) => {
        const [button_ref, set_button_ref] = createSignal<HTMLButtonElement | null>(null)

        return (<>
            <Show when={!props[_expand]}>
                <Tooltip anchor={button_ref()} text={$props[_name]}/>
            </Show>
            <SideNavigationItem
                ref={r => set_button_ref(r)}
                leading={<Show when={$props[_emoji] != null}><Emoji emoji={$props[_emoji]!} /></Show>} 
                selected={props[_page] == $props[_id]}
                onClick={() => props[_command](Commands.change_page, $props[_id])}
                iconOnly={!props[_expand]}>
                {$props[_name]}
            </SideNavigationItem>
        </>)
    }

    return (<SideNavigation
        style={{"padding-top": '0'}}
        classList={addClassListModule(CSS.sideNavigation)}
        expand={props[_expand]}
        footer={<>
            <Show when={!props[_expand]}>
                <Tooltip anchor={button_newList_ref()} text="Add new list"/>
            </Show>
            <SideNavigationItem 
                ref={r => set_button_newList_ref(r)} 
                iconCode={0xE007}
                iconOnly={!props[_expand]}
                onClick={ev => openModal(ev, dialog_newList_ref)}>
                New list
            </SideNavigationItem>
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
            dismiss={_manual}
            actions={<>
                <Button onClick={() => closeModal(dialog_newList_ref)} variant={ButtonVariant[_filledTonal]}>Cancel</Button>
                <Button 
                    onClick={() => {
                        addNewList()
                        closeModal(dialog_newList_ref)
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
                trailing={<TextFieldTrailingButton>
                    <Show when={emoji() == null} fallback={<Emoji emoji={emoji()!}/>}>
                        <Icon code={0xE747}/>
                    </Show>
                </TextFieldTrailingButton>}
            />
            </Dialog>
    </SideNavigation>)
}

export default _