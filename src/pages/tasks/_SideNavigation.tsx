import { createMemo, createSignal, For, Show, type VoidComponent } from "solid-js";

import type { Settings, TaskList } from "./_types";
import { _command, _emoji, _expand, _icon, _id, _length, _name, _page, _selectedTaskList, _tasks, _taskLists, _text, _type, _filter, _hiddenNavigation, _includes, _settings, _tonal, _filled, _trim, _currentTarget, _value, _manual, _animate, _finished, _spring, _then, _firstElementChild, _contents, _index, _centerBottomToRight } from "@/data/string";
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
import { TransitionGroup } from "solid-transition-group";
import { AnimationEffectTiming } from "@/enums/animation";
import EmojiPicker, { closeEmojiPicker, openEmojiPicker } from "@/components/EmojiPicker";
import { preventDefault } from "@/utils/event";
import Menu, { closeMenu, MenuItem, MenuPosition, openMenu } from "@/components/Menu";

const _: VoidComponent<{
    expand: boolean
    taskLists: TaskList[]
    page: Pages | number
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    let selectedTaskListIndex = 0
    let menu_listAction_ref: HTMLDialogElement

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

    const Item: VoidComponent<TaskList & {index: number}> = ($props) => {
        return (<TextTooltip text={!props[_expand]? $props[_name] : undefined}>
            <SideNavigationItem
                iconCode={$props[_emoji] == null? 0xF032 : undefined}
                leading={<Show when={$props[_emoji] != null}><Emoji emoji={$props[_emoji]!} /></Show>} 
                selected={props[_page] == $props[_id]}
                onClick={() => props[_command](Commands.change_page, $props[_id])}
                onContextMenu={(ev) => {
                    preventDefault(ev)
                    selectedTaskListIndex = $props[_index]
                    openMenu(ev, menu_listAction_ref, {
                        position: MenuPosition[_centerBottomToRight]
                    })
                }}
                iconOnly={!props[_expand]}>
                {$props[_name]}
            </SideNavigationItem>
        </TextTooltip>)
    }

    const Footer: VoidComponent = () => (<TextTooltip text={!props[_expand]? "Add new list" : undefined}>
        <SideNavigationItem 
            iconCode={0xE007}
            iconOnly={!props[_expand]}
            onClick={ev => props[_command](Commands.add_taskList, ev)}>
            New list
        </SideNavigationItem>
    </TextTooltip>)

    const Menus: VoidComponent = () => (<>
        <Menu 
            ref={r => menu_listAction_ref = r}>
            <MenuItem 
                onClick={ev => {
                    closeMenu(menu_listAction_ref)
                    props[_command](Commands.rename_taskList, ev, selectedTaskListIndex)
                }}
                iconCode={0xF0FB}>
                Rename list
            </MenuItem>
            <MenuItem 
                onClick={ev => {
                    closeMenu(menu_listAction_ref)
                    props[_command](Commands.delete_taskList, ev, selectedTaskListIndex)
                }}
                iconCode={0xE59D}>
                Delete list
            </MenuItem>
        </Menu>
    </>)

    return (<SideNavigation
        style={{"padding-top": '0'}}
        classList={addClassListModule(CSS.side_navigation)}
        expand={props[_expand]}
        footer={<Footer />}>
        <TransitionGroup
            onEnter={(el, done) => {el[_firstElementChild]![_animate](
                { opacity: [0, 1], transform: ['translate(-12px)', 'none'] }, 
                { duration: 300, easing: AnimationEffectTiming[_spring] }
            )[_finished][_then](done)}}
            onExit={(el, done) => {el[_firstElementChild]![_animate](
                { opacity: 0, transform: 'translate(-12px)'}, 
                { duration: 300, easing: AnimationEffectTiming[_spring] }
            )[_finished][_then](done)}}>
            <For each={TASKS_PAGES[_filter](page => !props[_settings][_hiddenNavigation][_includes](page[_type]))}>
                {p => <Page {...p}/>}
            </For>
        </TransitionGroup>
        <Show when={props[_taskLists][_length] - 1 > 0}>
            <Divider />
        </Show>
        <For each={props[_taskLists]}>{(p, i) => 
            <Show when={p[_id] != DEFAULT_TASK_LIST[_id]}>
                <Item {...p} index={i()}/>
            </Show>
        }</For>
        <Menus/>
    </SideNavigation>)
}

export default _