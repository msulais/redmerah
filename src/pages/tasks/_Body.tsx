import { createEffect, createMemo, createSignal, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import type { ComponentEvent } from "@/types/event"
import { _all, _completed, _important, _planned, _tasks, _uncompleted, _includes, _page, _taskLists, _id, _length, _done, _reminder, _name, _taskList, _leading, _headline, _emoji, _currentTarget, _filled, _outlined, _settings, _sortBy, _creationDate, _importance, _descending, _ascending, _sortMode, _command, _onContextMenu, _CENTER_BOTTOM_TO_RIGHT, _task, _description, _files, _subtasks, _number, _value, _trim, _onEdit, _filledTonal, _text, _toFixed, _join, _size, _type, _listId, _onEditTask, _onContextMenuTask, _labelIds, _showModal, _onDelete, _onDeleteTask, _manual, _radio, _isShowDeleteTaskWarning, _isAnyTask, _isAnyCompletedTask, _isAnyUncompletedTask, _complete, _isGroup, _taskListIndex, _taskIndex, _onEditReminder, _onEditReminderTask, _labels, _CENTER_BOTTOM_TO_LEFT, _color, _filter, _onEditLabel, _then, _toUpperCase, _test, _replace, _map, _index, _taskId, _image, _startsWith, _video, _audio, _normal, _onEditFilesTask, _onEditFiles, _RIGHT_CENTER_TO_BOTTOM, _subtask, _slice, _contents, _localeCompare, _sort } from "@/data/string"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { getCurrentDate, getDate_Y, getDateString_YMD_HM, isOutDate_YMD_HM } from "@/utils/datetime"
import { preventDefault, stopPropagation } from "@/utils/event"
import { DEFAULT_TASK_LIST } from "./_data"
import { toggleAttribute } from "@/utils/attributes"
import { stringToTitleCase } from "@/utils/string"
import { addClassListModule } from "@/utils/element"
import { closePopover, openPopover } from "@/utils/popover"
import { PopoverPosition } from "@/enums/position"
import { closeModal, openModal } from "@/utils/modal"
import { isNumber } from "@/utils/typecheck"
import { numberParse } from "@/utils/math"
import { openFile, readFileAsText } from "@/utils/file"
import { createObjectURL, revokeObjectURL } from "@/utils/url"
import { openNotification } from "@/utils/notification"

import Divider from "@/components/Divider"
import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import Button, { ButtonVariant } from "@/components/Button"
import Emoji from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import List from "@/components/List"
import Expander from "@/components/Expander"
import TextField, { changeTextFieldValue, TextAreaField, TextFieldTrailingButton } from "@/components/TextField"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, NestedMenu } from "@/components/Menu"
import Dialog from "@/components/Dialog"
import NotificationBar from "@/components/NotificationBar"
import DateTimePicker from "@/components/DateTimePicker"
import AppBar from "@/components/AppBar"
import CSS from './_styles.module.scss'

const AppbarTasks: VoidComponent<{
    page: Pages | number
    leading: JSX.Element
    headline: JSX.Element
    settings: Settings
    taskListIndex: number
    isGroup: boolean
    isAnyTask: boolean
    isAnyCompletedTask: boolean
    isAnyUncompletedTask: boolean
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [is_menu_sort_open, setIs_menu_sort_open] = createSignal<boolean>(false)
    const [is_menu_more_open, setIs_menu_more_open] = createSignal<boolean>(false)
    const [button_sort_ref, set_button_sort_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_more_ref, set_button_more_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_copy_ref, set_button_copy_ref] = createSignal<HTMLButtonElement | null>(null)
    let menu_sort_ref: HTMLDialogElement
    let menu_more_ref: HTMLDialogElement
    let dialog_clearTasks_ref: HTMLDialogElement
    let dialog_deleteCompletedTasks_ref: HTMLDialogElement
    let notification_copied_ref: HTMLDivElement

    function changeSortBy(sortBy: SortBy): void {
        props[_command](Commands.change_sortBy, sortBy)
        closePopover(menu_sort_ref)
    }

    function changeSortMode(sortMode: SortMode): void {
        props[_command](Commands.change_sortMode, sortMode)
        closePopover(menu_sort_ref)
    }

    const Menus: VoidComponent = () => {
        return (<>
            <Menu style={{width: '200px'}} ref={r => menu_sort_ref = r} onToggle={(v) => setIs_menu_sort_open(v)}>
                <MenuHeader>Sort by</MenuHeader>
                <MenuItem 
                    selected={props[_settings][_sortBy] == SortBy[_name]} 
                    onClick={() => changeSortBy(SortBy[_name])} 
                    iconCode={0xF0B0}>
                    Name
                </MenuItem>
                <MenuItem 
                    selected={props[_settings][_sortBy] == SortBy[_importance]} 
                    onClick={() => changeSortBy(SortBy[_importance])} 
                    iconCode={0xEF1B}>
                    Importance
                </MenuItem>
                <MenuItem 
                    selected={props[_settings][_sortBy] == SortBy[_creationDate]} 
                    onClick={() => changeSortBy(SortBy[_creationDate])} 
                    iconCode={0xE310}>
                    Creation date
                </MenuItem>
                <MenuItem 
                    selected={props[_settings][_sortBy] == SortBy[_completed]} 
                    onClick={() => changeSortBy(SortBy[_completed])} 
                    iconCode={0xE3CC}>
                    Completed
                </MenuItem>
                <MenuItem 
                    selected={props[_settings][_sortBy] == SortBy[_uncompleted]} 
                    onClick={() => changeSortBy(SortBy[_uncompleted])} 
                    iconCode={0xE3D4}>
                    Uncompleted
                </MenuItem>
                <MenuDivider/>
                <MenuItem 
                    selected={props[_settings][_sortMode] == SortMode[_ascending]} 
                    onClick={() => changeSortMode(SortMode[_ascending])} 
                    iconCode={0xF187}>
                    Ascending
                </MenuItem>
                <MenuItem 
                    selected={props[_settings][_sortMode] == SortMode[_descending]} 
                    onClick={() => changeSortMode(SortMode[_descending])} 
                    iconCode={0xF189}>
                    Descending
                </MenuItem>
            </Menu>
            <Menu ref={r => menu_more_ref = r} onToggle={(v) => setIs_menu_more_open(v)}>

                <Show when={props[_isAnyUncompletedTask]}>
                    <MenuItem 
                        onClick={async () => {
                            await closePopover(menu_more_ref)
                            props[_command](Commands.mark_all_completed, props[_taskListIndex])
                        }}
                        iconCode={0xE3CC}>
                        Mark all completed
                    </MenuItem>
                </Show>

                <Show when={props[_isAnyCompletedTask]}>
                    <MenuItem 
                        onClick={async () => {
                            await closePopover(menu_more_ref)
                            props[_command](Commands.mark_all_uncompleted, props[_taskListIndex])
                        }}
                        iconCode={0xE3D4}>
                        Mark all uncompleted
                    </MenuItem>
                </Show>

                <Show when={props[_isAnyTask]}>
                    <MenuDivider />

                    <MenuItem 
                        onClick={(ev) => {
                            openModal(ev, dialog_clearTasks_ref)
                            closePopover(menu_more_ref)
                        }}
                        iconCode={0xE5A1}>
                        Clear tasks
                    </MenuItem>
                </Show>

                <Show when={props[_isAnyCompletedTask]}>
                    <MenuItem 
                        onClick={(ev) => {
                            openModal(ev, dialog_deleteCompletedTasks_ref)
                            closePopover(menu_more_ref)
                        }}
                        iconCode={0xE5A3}>
                        Delete completed tasks
                    </MenuItem>
                </Show>

                <Show when={isNumber(props[_page])}>
                    <MenuDivider />

                    {/* TODO: rename list */}
                    <MenuItem iconCode={0xF0FB}>Rename list</MenuItem>

                    {/* TODO: delete list */}
                    <MenuItem iconCode={0xE59D}>Delete list</MenuItem>
                </Show>
            </Menu>
        </>)
    }

    const Dialogs: VoidComponent = () => {
        return (<>
            <Dialog 
                ref={r => dialog_clearTasks_ref = r}
                dismiss={_manual} 
                header="Clear tasks"
                style={{width: '500px'}}
                actions={<>
                    <Button 
                        onClick={() => closeModal(dialog_clearTasks_ref)} 
                        variant={ButtonVariant[_filledTonal]}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            props[_command](Commands.clear_tasks, props[_taskListIndex])
                            closeModal(dialog_clearTasks_ref)
                        }} 
                        variant={ButtonVariant[_filled]}>
                        Clear
                    </Button>
                </>}>
                Clearing all tasks will permanently delete them. Are you sure you want to continue?
            </Dialog>
            <Dialog 
                dismiss={_manual} 
                style={{width: '500px'}}
                ref={r => dialog_deleteCompletedTasks_ref = r}
                header={"Delete completed tasks"}
                actions={<>
                    <Button 
                        onClick={() => closeModal(dialog_deleteCompletedTasks_ref)} 
                        variant={ButtonVariant[_filledTonal]}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            props[_command](Commands.delete_completed_task, props[_taskListIndex])
                            closeModal(dialog_deleteCompletedTasks_ref)
                        }} 
                        variant={ButtonVariant[_filled]}>
                        Delete
                    </Button>
                </>}>
                Are you sure want to delete completed tasks?
            </Dialog>
        </>)
    }

    return (<>
        <AppBar 
            classList={addClassListModule(CSS.body_appbar)}
            leading={props[_leading]} 
            headline={props[_headline]}
            trailing={<>
                <Show when={props[_isAnyTask]}>
                    <Tooltip anchor={button_sort_ref()} text="Sort by"/>
                    <Button 
                        focus={is_menu_sort_open()} 
                        ref={r => set_button_sort_ref(r)} 
                        onClick={ev => openPopover({event: ev, popover: menu_sort_ref, anchor: ev[_currentTarget]})}
                        iconOnly>
                        <Icon code={0xE123}/>
                    </Button>

                    <Tooltip anchor={button_copy_ref()} text="Copy tasks"/>
                    <Button 
                        onClick={() => {
                            props[_command](Commands.copy_tasks, props[_taskListIndex])
                            openNotification({
                                notificationBar: notification_copied_ref,
                            })
                        }} 
                        ref={r => set_button_copy_ref(r)} 
                        iconOnly>
                        <Icon code={0xE51B}/>
                    </Button>

                    <Show when={!props[_isGroup]}>
                        <Tooltip anchor={button_more_ref()} text="More options"/>
                        <Button 
                            focus={is_menu_more_open()} 
                            ref={r => set_button_more_ref(r)} 
                            onClick={ev => openPopover({event: ev, popover: menu_more_ref, anchor: ev[_currentTarget]})}
                            iconOnly>
                            <Icon code={0xEAD9}/>
                        </Button>
                    </Show>
                </Show>
            </>}
        />
        <Menus />
        <Dialogs />
        <NotificationBar ref={r => notification_copied_ref = r} leading={<Icon code={0xE51B}/>}>Tasks copied</NotificationBar>
    </>)
}

const TaskItem: VoidComponent<{
    task: Task
    taskIndex: number
    taskListIndex: number
    labels: (TaskLabel | undefined)[]
    onEdit: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    onEditReminder: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
    onEditFiles: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
    onEditLabel: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, label: TaskLabel) => unknown
    onContextMenu: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    onDelete: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [button_check_ref, set_button_check_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_delete_ref, set_button_delete_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_important_ref, set_button_important_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_reminder_ref, set_button_reminder_ref] = createSignal<HTMLButtonElement | null>(null)

    return (<Expander 
        data-done={toggleAttribute(props[_task][_complete])}
        headerAttr={{
            onClick(ev) {
                props[_onEdit](ev)
            },
            onContextMenu: (ev) => {
                preventDefault(ev)
                props[_onContextMenu](ev)
            }
        }}
        showExpandIcon={false}
        classList={addClassListModule(CSS.body_task_item)}
        leading={<>
            <Tooltip anchor={button_check_ref()} text={`Mark as ${props[_task][_complete]? 'un' : ''}completed`}/>
            <Button 
                ref={r => set_button_check_ref(r)} 
                onContextMenu={(ev) => {
                    stopPropagation(ev)
                    preventDefault(ev)
                }} 
                onClick={ev => {
                    stopPropagation(ev)
                    props[_command](
                        Commands.edit_task, 
                        {   ...props[_task], 
                            complete: !props[_task][_complete]
                        } satisfies Task, 
                        props[_taskListIndex], 
                        props[_taskIndex]
                    )
                }}
                iconOnly>
                <Icon code={props[_task][_complete]? 0xE3CB : 0xE3D4}/>
            </Button>
        </>} 
        title={props[_task][_name]} 
        trailing={<>
            <Tooltip anchor={button_important_ref()} text={`Mark as ${props[_task][_important]? 'not ' : ''}important`}/>
            <Button 
                ref={r => set_button_important_ref(r)} 
                onContextMenu={(ev) => {
                    stopPropagation(ev)
                    preventDefault(ev)
                }} 
                onClick={ev => {
                    stopPropagation(ev)
                    props[_command](
                        Commands.edit_task, 
                        {   ...props[_task], 
                            important: !props[_task][_important]
                        } satisfies Task, 
                        props[_taskListIndex], 
                        props[_taskIndex]
                    )
                }}
                iconOnly>
                <Icon filled={props[_task][_important]} code={0xEF1B}/>
            </Button>

            <Tooltip anchor={button_delete_ref()} text="Delete task"/>
            <Button 
                ref={r => set_button_delete_ref(r)} 
                onContextMenu={(ev) => {
                    stopPropagation(ev)
                    preventDefault(ev)
                }} 
                onClick={ev => {
                    stopPropagation(ev)
                    props[_onDelete](ev)
                }}
                iconOnly>
                <Icon code={0xE59D}/>
            </Button>
        </>}
        isOpen={props[_task][_subtasks][_length] > 0}
        subtitle={<>
            { props[_task][_description] }
            <Show when={props[_task][_subtasks][_length] > 0 || props[_task][_reminder] != null || props[_task][_files][_length] > 0 || props[_task][_labelIds][_length] > 0}>
                <div class={CSS.body_task_item_tags}>
                    <Show when={props[_task][_reminder] != null}>
                        <Tooltip anchor={button_reminder_ref()} text={"Task reminder" + (isOutDate_YMD_HM( props[_task][_reminder]!, getCurrentDate(), new Date(getDate_Y() + 100, 2, 2) )? " (outdated)" : "")}/>
                        <Button 
                            compact 
                            ref={r => set_button_reminder_ref(r)}
                            style={{
                                "border-color": isOutDate_YMD_HM(
                                    props[_task][_reminder]!, 
                                    getCurrentDate(), 
                                    new Date(getDate_Y() + 100, 2, 2)
                                )? 'rgb(var(--color-error))' : undefined
                            }}
                            onContextMenu={(ev) => {
                                stopPropagation(ev)
                                preventDefault(ev)
                            }} 
                            onClick={ev => {
                                stopPropagation(ev)
                                props[_onEditReminder](ev)
                            }}
                            variant={ButtonVariant[_outlined]}>
                            <Icon filled code={0xE025} inline/>{getDateString_YMD_HM(props[_task][_reminder]!)}
                        </Button>
                    </Show>
                    <Show when={props[_task][_files][_length] > 0}>
                        <Button 
                            compact 
                            onContextMenu={(ev) => {
                                stopPropagation(ev)
                                preventDefault(ev)
                            }} 
                            onClick={ev => {
                                stopPropagation(ev)
                                props[_onEditFiles](ev)
                            }}
                            variant={ButtonVariant[_outlined]}>
                            <Icon filled code={0xE187} inline/>{props[_task][_files][_length]} file{props[_task][_files][_length] > 1? "s" : ''}
                        </Button>
                    </Show>
                    <For each={props[_task][_labelIds]}>{labelId => 
                        <Show when={props[_labels][labelId] != undefined}>
                            <Button 
                                compact 
                                style={{
                                    "border-color": props[_labels][labelId]![_color] ?? undefined,
                                    "background-color": props[_labels][labelId]![_color] != null? props[_labels][labelId]![_color] + '14' : undefined
                                }}
                                onContextMenu={(ev) => {
                                    stopPropagation(ev)
                                    preventDefault(ev)
                                }} 
                                onClick={ev => {
                                    stopPropagation(ev)
                                    props[_onEditLabel](ev, props[_labels][labelId]!)
                                }}
                                variant={ButtonVariant[_outlined]}>
                                <Icon filled code={0xF00D} inline/>{props[_labels][labelId]![_name]}
                            </Button>
                        </Show>
                    }</For>
                </div>
            </Show>
        </>}>
        <For each={props[_task][_subtasks]}>{(subtask, index) => 
            <CheckBox 
                value={subtask[_complete]}
                onValueChanged={isChecked => props[_command](
                    Commands.edit_subtask, 
                    {...subtask, complete: isChecked} satisfies SubTask, 
                    props[_taskListIndex], 
                    props[_taskIndex], 
                    index()
                )}>
                {subtask[_name]}
            </CheckBox>
        }</For>
    </Expander>)
}

const EmptyTasks: VoidComponent<{
    page: Pages | number
}> = (props) => {
    const getIcon = createMemo<number>(() => {
        const page = props[_page]
        if (page == Pages[_all        ]) return 0xE069
        if (page == Pages[_completed  ]) return 0xE3CC
        if (page == Pages[_uncompleted]) return 0xE3D4
        if (page == Pages[_important  ]) return 0xEF1B
        if (page == Pages[_planned    ]) return 0xE01B

        return 0xE3CC
    })
    const getText = createMemo<string>(() => {
        let t = ''
        const page = props[_page]
        if ([Pages[_completed], Pages[_uncompleted], Pages[_important], Pages[_planned]][_includes](page as Pages)) {
            t = stringToTitleCase(page as Pages)
        }
        return `No ${t} Tasks`
    })
    return (<div class={CSS.body_empty}>
        <Icon filled code={getIcon()}/>
        <p>{getText()}</p>
    </div>)
}

const SingleTaskList: VoidComponent<{
    page: Pages | number
    taskList: TaskList
    lists: TaskList[]
    labels: (TaskLabel | undefined)[]
    settings: Settings
    taskListIndex: number
    onEditLabel: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, label: TaskLabel, task: Task, taskIndex: number) => unknown
    onDeleteTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskIndex: number) => unknown
    onEditTask: (ev: ComponentEvent<MouseEvent, HTMLDivElement>, task: Task, taskIndex: number) => unknown
    onEditFilesTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskIndex: number) => unknown
    onEditReminderTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskIndex: number) => unknown
    onContextMenuTask: (ev: ComponentEvent<MouseEvent, HTMLDivElement>, task: Task, taskIndex: number) => unknown
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const getHeadline = createMemo<string>(() =>  props[_page] != Pages[_tasks]? props[_taskList][_name] : 'Tasks')
    const getTasks = createMemo<Task[]>(() => {
        // BUG: fix if filter on
        return props[_taskList][_tasks]
    })
    const isAnyTask = createMemo<boolean>(() => getTasks()[_length] > 0) 
    const [isAnyCompletedTask, setIsAnyCompletedTask] = createSignal<boolean>(true)
    const [isAnyUncompletedTask, setIsAnyUncompletedTask] = createSignal<boolean>(true)
    const [button_addTask_ref, set_button_addTask_ref] = createSignal<HTMLButtonElement | null>(null)
    let textfield_newTask_ref: HTMLInputElement

    function addTask(): void {
        if (
            !(props[_page] == Pages[_tasks] || typeof props[_page] == _number)
            || textfield_newTask_ref[_value][_trim]() == ''
        ) return;

        const listId: number = (props[_page] == Pages[_tasks]
            ? DEFAULT_TASK_LIST[_id] 
            : props[_page] as number
        )

        props[_command](Commands.add_task, {
            description: '', 
            complete: false,
            files: [],
            id: -1, 
            important: false,
            labelIds: [],
            listId, 
            name: textfield_newTask_ref[_value][_trim](),
            reminder: null,
            subtasks: []
        } satisfies Task, props[_taskListIndex])

        changeTextFieldValue(textfield_newTask_ref, '')
    }

    createEffect(() => {
        let isAnyCompletedTask = false
        let isAnyUncompletedTask = false
        for (const task of getTasks()) {
            if (isAnyCompletedTask && isAnyUncompletedTask) break

            if (task[_complete]) isAnyCompletedTask = true
            else isAnyUncompletedTask = true
        }

        setIsAnyCompletedTask(isAnyCompletedTask)
        setIsAnyUncompletedTask(isAnyUncompletedTask)
    })

    return (<div 
        class={CSS.body_single_task_list} 
        data-empty={toggleAttribute(!isAnyTask())}>
        <AppbarTasks 
            command={props[_command]}
            taskListIndex={props[_taskListIndex]}
            page={props[_page]} 
            isGroup={false}
            isAnyTask={isAnyTask()}
            isAnyCompletedTask={isAnyCompletedTask()}
            isAnyUncompletedTask={isAnyUncompletedTask()}
            settings={props[_settings]} 
            leading={<Show 
                when={props[_taskList][_emoji] == null} 
                fallback={<Emoji emoji={props[_taskList][_emoji]!} />}>
                <Show 
                    when={props[_page] == Pages[_tasks]} 
                    fallback={<Icon code={0xE3CC}/>}>
                    <Icon code={0xE8E2}/>
                </Show>
            </Show>} 
            headline={getHeadline()}
        />
        <For each={getTasks()}>{(task, index) => 
            <TaskItem 
                command={props[_command]}
                task={task}
                onEditLabel={(ev, label) => props[_onEditLabel](ev, label, task, index())}
                labels={props[_labels]}
                taskIndex={index()}
                taskListIndex={props[_taskListIndex]}
                onEditFiles={(ev) => props[_onEditFilesTask](ev, task, index())}
                onEditReminder={(ev) => props[_onEditReminderTask](ev, task, index())}
                onEdit={(ev) => props[_onEditTask](ev, task, index())}
                onContextMenu={(ev) => props[_onContextMenuTask](ev, task, index())} 
                onDelete={ev => props[_onDeleteTask](ev, task, index())}
            />
        }</For>
        
        <Show when={!isAnyTask()}>
            <EmptyTasks page={props[_page]} />
        </Show>

        <Show when={isAnyTask()}>
            <div style={{flex: '1'}}></div>
        </Show>
        <form onSubmit={ev => {
            addTask()
            preventDefault(ev)
        }}>
            <TextField 
                placeholder="Add task" 
                ref={r => textfield_newTask_ref = r}
                trailing={<>
                    <Tooltip text="Add task" anchor={button_addTask_ref()} />
                    <TextFieldTrailingButton 
                        onClick={() => addTask()} 
                        ref={r => set_button_addTask_ref(r)}>
                        <Icon code={0xE00B}/>
                    </TextFieldTrailingButton>
                </>}
            />
        </form>
    </div>)
}

const GroupTaskList: VoidComponent<{
    page: Pages | number
    taskLists: TaskList[]
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const getIcon = createMemo<number>(() => {
        const page = props[_page]
        if (page == Pages[_all]) return 0xE069
        if (page == Pages[_completed]) return 0xE3CC
        if (page == Pages[_uncompleted]) return 0xE3D4
        if (page == Pages[_important]) return 0xEF1B
        if (page == Pages[_planned]) return 0xE01B

        return 0xE3CC
    })
    const [isEmpty, setIsEmpty] = createSignal<boolean>(true) // TODO: set default to false

    return (<>
        <AppbarTasks 
            taskListIndex={-1}        
            isAnyTask={false /* TODO: is any task */}
            isAnyCompletedTask={false /* TODO: is any completed task */}
            isAnyUncompletedTask={false /* TODO: is any uncompleted task */}
            command={props[_command]} 
            isGroup={true}
            settings={props[_settings]} 
            page={props[_page]} 
            leading={<Icon code={getIcon()}/>} 
            headline={stringToTitleCase(props[_page] as Pages)}
        />
        <div class={CSS.body_group_task_list} data-empty={toggleAttribute(isEmpty())}>
            {/* TODO: add task list */}
            <Show when={isEmpty()}><EmptyTasks page={props[_page]} /></Show>
        </div>
    </>)
}

const _: VoidComponent<{
    page: Pages | number
    taskLists: TaskList[]
    settings: Settings
    labels: (TaskLabel | undefined)[]
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [is_menu_taskActionMove_open, setIs_menu_taskActionMove_open] = createSignal<boolean>(false)
    const [is_menu_taskActionAddLabel_open, setIs_menu_taskActionAddLabel_open] = createSignal<boolean>(false)
    const [is_dateTimePicker_reminder_open, setIs_dateTimePicker_reminder_open] = createSignal<boolean>(false)
    const [is_menu_labels_open, setIs_menu_labels_open] = createSignal<boolean>(false)
    const [is_menu_fileAction_open, setIs_menu_fileAction_open] = createSignal<boolean>(false)
    const [is_menu_fileAction3_open, setIs_menu_fileAction3_open] = createSignal<boolean>(false)
    const [button_editReminderDismiss_ref, set_button_editReminderDismiss_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_editReminderChange_ref, set_button_editReminderChange_ref] = createSignal<HTMLButtonElement | null>(null)
    const [text_file, setText_file] = createSignal('')
    const [text_subtask, setText_subtask] = createSignal('')
    const [fileURLOrFileContent, setFileURLOrFileContent] = createSignal<string>('')
    const [selectedLabel, setSelectedLabel] = createStore<TaskLabel>({id: -1, name: '', color: null})
    const [selectedTask, setSelectedTask] = createStore<Task & {taskListIndex: number; taskIndex: number}>({complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: DEFAULT_TASK_LIST[_id], name: '', reminder: null, subtasks: [], taskIndex: -1, taskListIndex: -1})
    const [selectedFile, setSelectedFile] = createStore<TaskFileMetaData & { index: number }>({id: -1, listId: -1, name: '', size: 0, taskId: -1, type: '', index: -1})
    const [selectedSubtask, setSelectedSubtask] = createStore<SubTask & {index: number}>({complete: false, id: -1, index: -1, listId: -1, name: '', taskId: -1})
    let textfield_newSubtask_ref: HTMLInputElement
    let textfield_editSubtask_ref: HTMLInputElement
    let textfield_renameFile_ref: HTMLInputElement
    let menu_taskAction_ref: HTMLDialogElement
    let menu_reminder_ref: HTMLDialogElement
    let menu_labels_ref: HTMLDialogElement
    let menu_labelAction_ref: HTMLDialogElement
    let menu_labelAction2_ref: HTMLDialogElement
    let menu_fileAction_ref: HTMLDialogElement
    let menu_fileAction2_ref: HTMLDialogElement
    let menu_fileAction3_ref: HTMLDialogElement
    let dateTimePicker_reminder_ref: HTMLDialogElement
    let dialog_fileRename_ref: HTMLDialogElement
    let dialog_editTask_ref: HTMLDialogElement
    let dialog_deleteTaskWarning_ref: HTMLDialogElement
    let dialog_viewFile_ref: HTMLDialogElement
    let dialog_newSubtask_ref: HTMLDialogElement
    let dialog_editSubtask_ref: HTMLDialogElement

    function updateSelectedTask(): void {
        try {
            setSelectedTask(task => ({
                ...task,
                ...props[_taskLists][task[_taskListIndex]][_tasks][task[_taskIndex]]
            }))
        } catch {}
    }

    function getTaskFromSelectedTask(): Task {
        return { 
            complete: selectedTask[_complete], 
            description: selectedTask[_description], 
            files: selectedTask[_files], 
            id: selectedTask[_id], 
            important: selectedTask[_important], 
            labelIds: selectedTask[_labelIds], 
            listId: selectedTask[_listId], 
            name: selectedTask[_name], 
            reminder: selectedTask[_reminder], 
            subtasks: selectedTask[_subtasks] 
        }
    }

    async function deleteTask(ev: Event, task: Task, taskListIndex: number, taskIndex: number): Promise<void> {
        if (!props[_settings][_isShowDeleteTaskWarning]) {
            await closeModal(dialog_deleteTaskWarning_ref)
            await closeModal(dialog_editTask_ref)
            await closePopover(menu_taskAction_ref)
            props[_command](Commands.delete_task, task, taskListIndex, taskIndex)
            return
        }

        setSelectedTask({
            ...task, 
            taskListIndex,
            taskIndex
        })
        openModal(ev, dialog_deleteTaskWarning_ref)
    }

    function editTask(ev: Event, task: Task, taskListIndex: number, taskIndex: number): void {
        setSelectedTask({
            ...task, 
            taskListIndex,
            taskIndex
        })
        openModal(ev, dialog_editTask_ref)
    }

    function getTaskListBySelectedTask(): TaskList {
        return props[_taskLists][selectedTask[_taskListIndex]] ?? {...DEFAULT_TASK_LIST}
    }

    function renameFile(ev: Event): void {
        const text = selectedFile[_name][_replace](/\.[^\.]*$/, '')
        changeTextFieldValue(textfield_renameFile_ref, text)
        setText_file(text)
        openModal(ev, dialog_fileRename_ref, true)
    }

    async function viewFile(ev: Event, file: TaskFileMetaData & { index: number }): Promise<void> {
        setSelectedFile(file)
        const blob = (await props[_command](
            Commands.get_file_blob, 
            {   id: file[_id], 
                listId: file[_listId],
                name: file[_name], 
                size: file[_size], 
                taskId: file[_taskId],
                type: file[_type]
            } satisfies TaskFileMetaData, 
            selectedTask[_taskListIndex], 
            selectedTask[_taskIndex], 
            file[_index]
        ) as (Blob | null))
        if (blob == null) return;

        if (selectedFile[_type][_startsWith](_text)) {
            setFileURLOrFileContent(await readFileAsText(blob))
        } else {
            setFileURLOrFileContent(createObjectURL(blob))
        }

        openModal(ev, dialog_viewFile_ref)
    }

    function deleteFile(): void {
        setSelectedTask(_files, files => [
            ...files[_slice](0, selectedFile[_index]), 
            ...files[_slice](selectedFile[_index] + 1)
        ])
        props[_command](
            Commands.edit_task, 
            getTaskFromSelectedTask() satisfies Task, 
            selectedTask[_taskListIndex], 
            selectedTask[_taskIndex]
        )
    }

    function deleteSubtask(index: number): void {
        setSelectedTask(_subtasks, subtasks => [
            ...subtasks[_slice](0, index), 
            ...subtasks[_slice](index + 1)
        ])
        props[_command](
            Commands.edit_task, 
            getTaskFromSelectedTask() satisfies Task, 
            selectedTask[_taskListIndex], 
            selectedTask[_taskIndex]
        )
    }

    function downloadFile(): void {
        props[_command](
            Commands.download_file, 
            {
                id: selectedFile[_id], 
                listId: selectedFile[_listId],
                name: selectedFile[_name], 
                size: selectedFile[_size], 
                taskId: selectedFile[_taskId],
                type: selectedFile[_type]
            } satisfies TaskFileMetaData, 
            selectedTask[_taskListIndex], 
            selectedTask[_taskIndex], 
            selectedFile[_index]
        )
    }

    function addFiles(): void {
        const taskIndex = selectedTask[_taskIndex]
        const taskListIndex = selectedTask[_taskListIndex]
        const task = getTaskFromSelectedTask()
        openFile(null, true)[_then](async (files) => {
            if (files == null) return;
            const result = await props[_command](Commands.add_files, files, task, taskListIndex, taskIndex) as TaskFileMetaData[]
            setSelectedTask(_files, result)
        })
    }

    function editSubtask(ev: Event, subtask: SubTask, index: number): void {
        setSelectedSubtask({...subtask, index})
        changeTextFieldValue(textfield_editSubtask_ref, subtask[_name])
        setText_subtask(subtask[_name])
        openModal(ev, dialog_editSubtask_ref, true)
    }

    function confirmEditSubtask(): void {
        closeModal(dialog_editSubtask_ref)
        props[_command](
            Commands.edit_subtask, 
            {   name: text_subtask()[_trim](),
                complete: selectedSubtask[_complete],
                id: selectedSubtask[_id],
                listId: selectedSubtask[_listId],
                taskId: selectedSubtask[_taskId]
            } satisfies SubTask,
            selectedTask[_taskListIndex],
            selectedTask[_taskIndex], 
            selectedSubtask[_index]
        )
        updateSelectedTask()
    }

    async function confirmAddSubtask(): Promise<void> {
        closeModal(dialog_newSubtask_ref)
        const subtasks = (await props[_command](
            Commands.add_subtask, 
            {   complete: false, 
                id: -1,
                listId: selectedTask[_listId],
                name: text_subtask()[_trim](),
                taskId: selectedTask[_id]
            } satisfies SubTask,
            selectedTask[_taskListIndex],
            selectedTask[_taskIndex]
        ) as SubTask[])

        updateSelectedTask()
    }

    function confirmFileRename(): void {
        closeModal(dialog_fileRename_ref)
        const newFile: TaskFileMetaData = {
            id: selectedFile[_id], 
            listId: selectedFile[_listId],
            name: text_file()[_trim]() + '.' + selectedFile[_name][_replace](/^[^\.]+\./gs, ''), 
            size: selectedFile[_size], 
            taskId: selectedFile[_taskId],
            type: selectedFile[_type]
        }
        props[_command](
            Commands.edit_file, 
            newFile, 
            selectedTask[_taskListIndex], 
            selectedTask[_taskIndex], 
            selectedFile[_index]
        )
        updateSelectedTask()
    }

    const SubtaskItem: VoidComponent<{
        subtask: SubTask
        index: number
    }> = ($props) => {
        const [button_done_ref, set_button_done_ref] = createSignal<HTMLButtonElement | null>(null)
        const [button_delete_ref, set_button_delete_ref] = createSignal<HTMLButtonElement | null>(null)
        const [button_edit_ref, set_button_edit_ref] = createSignal<HTMLButtonElement | null>(null)
        
        return (<List 
            trailing={<>
                <Tooltip anchor={button_edit_ref()} text='Edit subtask'/>
                <Button 
                    ref={r => set_button_edit_ref(r)} 
                    iconOnly 
                    onClick={ev => editSubtask(ev, $props[_subtask], $props[_index])}>
                    <Icon code={0xE739}/>
                </Button>

                <Tooltip anchor={button_delete_ref()} text="Delete subtask"/>
                <Button 
                    ref={r => set_button_delete_ref(r)} 
                    iconOnly
                    onClick={() => deleteSubtask($props[_index])}>
                    <Icon code={0xE59D}/>
                </Button>
            </>}
            leading={<>
                <Tooltip anchor={button_done_ref()} text={`Mark as ${$props[_subtask][_complete]? 'un' : ''}completed`}/>
                <Button 
                    ref={r => set_button_done_ref(r)} 
                    iconOnly
                    onClick={() => {
                        const subtask: SubTask = {   
                            ...$props[_subtask],
                            complete: !$props[_subtask][_complete]
                        }
                        props[_command](
                            Commands.edit_subtask, 
                            subtask, 
                            selectedTask[_taskListIndex], 
                            selectedTask[_taskIndex], 
                            $props[_index]
                        )

                        setSelectedTask(_subtasks, $props[_index], subtask)
                    }}>
                    <Icon code={$props[_subtask][_complete]? 0xE3CB : 0xE3D4}/>
                </Button>
            </>}>
            {$props[_subtask][_name]}
        </List>)
    }

    const FileItem: VoidComponent<TaskFileMetaData & { index: number }> = ($props) => {
        const [button_view_ref, set_button_view_ref] = createSignal<HTMLButtonElement | null>(null)
        const [button_more_ref, set_button_more_ref] = createSignal<HTMLButtonElement | null>(null)
        const isTypeNotSupported = createMemo<boolean>(() => !/^(audio|image|video|text)/[_test]($props[_type]))
        const getSizeText = createMemo(() => {
            const value = $props[_size]
            const TERA = 1_000_000_000_000
            const GIGA = 1_000_000_000
            const MEGA = 1_000_000
            const KILO = 1_000
            let unitValue = value + ' B'

            if      (value >= TERA) unitValue = numberParse((value / TERA)[_toFixed](2)) + ' TB'
            else if (value >= GIGA) unitValue = numberParse((value / GIGA)[_toFixed](2)) + ' GB'
            else if (value >= MEGA) unitValue = numberParse((value / MEGA)[_toFixed](2)) + ' MB'
            else if (value >= KILO) unitValue = numberParse((value / KILO)[_toFixed](2)) + ' KB'
            return unitValue
        })
        
        return (<List 
            classList={addClassListModule(CSS.body_file_list_item)}
            trailing={<>
                <Tooltip anchor={button_view_ref()} text={"View file" + (isTypeNotSupported()? ' (not supported)' : '')}/>
                <Button 
                    ref={r => set_button_view_ref(r)} 
                    disabled={isTypeNotSupported()} 
                    iconOnly
                    onClick={async (ev) => viewFile(ev, $props)}>
                    <Icon code={0xE77B}/>
                </Button>

                <Tooltip anchor={button_more_ref()} text="More actions"/>
                <Button 
                    ref={r => set_button_more_ref(r)} 
                    iconOnly
                    focus={selectedFile[_id] == $props[_id] && is_menu_fileAction_open()}
                    onClick={(ev) => {
                        setSelectedFile($props)
                        openPopover({
                            event: ev, 
                            popover: menu_fileAction_ref, 
                            anchor: ev[_currentTarget], 
                        })
                    }}>
                    <Icon code={0xEAD9}/>
                </Button>
            </>}
            subtitle={[getSizeText(), $props[_type][_replace](/\/.+$/gs, '')][_join](" • ")}>
            {$props[_name]}
        </List>)
    }

    const LabelItem: VoidComponent<TaskLabel> = ($props) => {
        const [button_edit_ref, set_button_edit_ref] = createSignal<HTMLButtonElement | null>(null)
        const [button_remove_ref, set_button_remove_ref] = createSignal<HTMLButtonElement | null>(null)

        return (<List 
            leading={<Icon style={{color: $props[_color] ?? undefined}} code={0xE407}/>}
            trailing={<>
                <Tooltip anchor={button_edit_ref()} text="Edit label"/>
                <Button 
                    onClick={(ev) => {
                        setSelectedLabel($props)
                        props[_command](Commands.edit_label, ev, selectedLabel)
                    }}
                    ref={r => set_button_edit_ref(r)} 
                    iconOnly>
                    <Icon code={0xE739}/>
                </Button>

                <Tooltip anchor={button_remove_ref()} text="Remove label from task"/>
                <Button 
                    onClick={() => {
                        setSelectedTask(_labelIds, ids => ids[_filter]((id) => id != $props[_id]) )
                        props[_command](
                            Commands.edit_task, 
                            getTaskFromSelectedTask(), 
                            selectedTask[_taskListIndex], 
                            selectedTask[_taskIndex]
                        )
                    }} 
                    ref={r => set_button_remove_ref(r)} 
                    iconOnly>
                    <Icon code={0xE5E9}/>
                </Button>
            </>}>
            { $props[_name] }
        </List>)
    }

    const Dialogs: VoidComponent = () => (<>
        <Dialog 
            ref={r => dialog_editTask_ref = r} 
            header='Edit task'
            style={{width: '500px'}}
            classList={addClassListModule(CSS.body_dialog_edit)}
            actions={<>
                <Button variant={ButtonVariant[_filledTonal]} onClick={() => closePopover(dialog_editTask_ref)}>Close</Button>
                <Button variant={ButtonVariant[_filled]} onClick={() => {
                    props[_command](
                        Commands.edit_task, 
                        {...getTaskFromSelectedTask(), complete: !selectedTask[_complete]} satisfies Task, 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )

                    const task = props[_taskLists][selectedTask[_taskListIndex]][_tasks][selectedTask[_taskIndex]]
                    setSelectedTask(values => ({
                        ...values, 
                        ...task
                    }))
                }}>Mark as {selectedTask[_complete]? "not" : ''} completed</Button>
            </>}>

            {/* TODO: show list of tasklists */}
            <Button variant={ButtonVariant[_filledTonal]}>{getTaskListBySelectedTask()[_name]}<Icon code={0xE3FC}/></Button>
            <TextField 
                labelText="Task" 
                value={selectedTask[_name]}
                onBlur={(ev) => {
                    if (ev[_currentTarget][_value] == selectedTask[_name]) return;
                    setSelectedTask(_name, ev[_currentTarget][_value])
                    props[_command](
                        Commands.edit_task, 
                        getTaskFromSelectedTask(), 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }}
            />
            <TextAreaField 
                labelText="Description" 
                maxLine={3} 
                value={selectedTask[_description]}
                onBlur={(ev) => {
                    if (ev[_currentTarget][_value] == selectedTask[_description]) return;
                    setSelectedTask(_description, ev[_currentTarget][_value])
                    props[_command](
                        Commands.edit_task, 
                        getTaskFromSelectedTask(), 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }}
            />

            <div data-subtasks>
                <For each={selectedTask[_subtasks]}>{ (subtask, i) => 
                    <SubtaskItem subtask={subtask} index={i()} />
                }</For>

                <Button onClick={(ev) => openModal(ev, dialog_newSubtask_ref, true)}><Icon code={0xE009}/>Add subtask</Button>
            </div>
            <Divider />
            <div data-label>
                <For each={selectedTask[_labelIds]}>{labelId => 
                    <Show when={props[_labels][labelId] != undefined}>
                        <LabelItem {...props[_labels][labelId]!} />
                    </Show>
                }</For>
                <Button focus={is_menu_labels_open()} onClick={ev => openPopover({
                    popover: menu_labels_ref, 
                    event: ev, 
                    anchor: ev[_currentTarget], 
                    position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                })}><Icon code={0xF00D}/>Add label</Button>
            </div>
            <Divider />
            <div data-reminder>
                <Show 
                    when={selectedTask[_reminder] != null}
                    fallback={<Button
                        focus={is_dateTimePicker_reminder_open()}
                        onClick={ev => openPopover({
                            popover: dateTimePicker_reminder_ref, 
                            event: ev, 
                            anchor: ev[_currentTarget], 
                            position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                        })}>
                        <Icon code={0xE01D}/>Add reminder
                    </Button>}>
                    <List 
                        trailing={<>
                            <Tooltip anchor={button_editReminderChange_ref()} text="Change datetime reminder"/>
                            <Button 
                                ref={r => set_button_editReminderChange_ref(r)} 
                                iconOnly 
                                onClick={ev => openPopover({
                                    popover: dateTimePicker_reminder_ref, 
                                    event: ev, 
                                    anchor: ev[_currentTarget], 
                                    position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                                })}>
                                <Icon code={0xE2EA}/>
                            </Button>

                            <Tooltip anchor={button_editReminderDismiss_ref()} text="Remove reminder"/>
                            <Button 
                                ref={r => set_button_editReminderDismiss_ref(r)} 
                                iconOnly
                                onClick={(ev) => {
                                    setSelectedTask(v => ({
                                        ...v!, 
                                        reminder: null
                                    }))
                                    props[_command](
                                        Commands.edit_task, 
                                        getTaskFromSelectedTask(), 
                                        selectedTask[_taskListIndex], 
                                        selectedTask[_taskIndex]
                                    )
                                }}><Icon code={0xE01F}/></Button>
                        </>}
                        leading={<Icon code={0xE025}/>}>
                        <span style={{
                            color: isOutDate_YMD_HM(
                                selectedTask[_reminder]!, 
                                getCurrentDate(), 
                                new Date(getDate_Y() + 100, 2, 2)
                            )? 'rgb(var(--color-error))' : undefined
                        }}>{getDateString_YMD_HM(selectedTask[_reminder]!)}</span>
                    </List>
                </Show>
            </div>
            <Divider />
            <div data-file>
                <For each={selectedTask[_files]}>{(file, index) => <FileItem {...file} index={index()}/>}</For>
                <Button 
                    onClick={() => addFiles()}>
                    <Icon code={0xE187}/>Add file
                </Button>
            </div>
            <Divider />
            <div data-important>
                <Button onClick={() => {
                        setSelectedTask(_important, t => !t)
                        props[_command](
                            Commands.edit_task, 
                            getTaskFromSelectedTask(), 
                            selectedTask[_taskListIndex], 
                            selectedTask[_taskIndex]
                        )
                    }}>
                    <Icon filled={selectedTask[_important]} code={0xEF1B}/>
                    Mark as {selectedTask[_important]? 'not' : ''} important
                </Button>
            </div>
            <div data-delete>
                <Button 
                    onClick={(ev) => deleteTask(
                        ev, 
                        getTaskFromSelectedTask(), 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )} 
                    style={{color: 'rgb(var(--color-error))'}}>
                    <Icon code={0xE59D}/>
                    Delete task
                </Button>
            </div>
        </Dialog>
        <Dialog 
            dismiss={_manual} 
            header="Delete task"
            style={{width: '560px'}}
            ref={r => dialog_deleteTaskWarning_ref = r}
            actions={<>
                <Button onClick={() => closeModal(dialog_deleteTaskWarning_ref)} variant={ButtonVariant[_filledTonal]}>Cancel</Button>
                <Button onClick={async () => {
                    await closeModal(dialog_deleteTaskWarning_ref)
                    await closeModal(dialog_editTask_ref)
                    await closePopover(menu_taskAction_ref)
                    props[_command](Commands.delete_task, getTaskFromSelectedTask(), selectedTask[_taskListIndex], selectedTask[_taskIndex])
                }} variant={ButtonVariant[_filled]}>Delete</Button>
            </>}>
            Are you sure want to delete <q><span style={{color: 'rgb(var(--color-accent))', "font-weight": 'bold'}}>{(selectedTask && selectedTask[_name]) || ''}</span></q> task?
            <CheckBox 
                compact 
                style={{"margin-top": '16px'}}
                onValueChanged={(value) => props[_command](Commands.toggle_deleteTaskWarning, !value)}>
                Don't remind me again
            </CheckBox>
        </Dialog>
        <Dialog 
            ref={r => dialog_fileRename_ref = r}
            style={{width: '500px'}}
            header="Rename file"
            dismiss={_manual}
            actions={<>
                <Button 
                    variant={ButtonVariant[_filledTonal]} 
                    onClick={() => closeModal(dialog_fileRename_ref)}>
                    Cancel
                </Button>
                <Button 
                    variant={ButtonVariant[_filled]}
                    disabled={text_file()[_trim]() == ''}
                    onClick={() => confirmFileRename()}>
                    Rename
                </Button>
            </>}>
            <form onSubmit={(ev) => {
                preventDefault(ev)
                if (text_file()[_trim]() == '') return;

                confirmFileRename()
            }}>
                <TextField 
                    ref={r => textfield_renameFile_ref = r}
                    autofocus
                    onInput={ev => setText_file(ev[_currentTarget][_value])}
                    placeholder="File name"
                />
            </form>
        </Dialog>
        <Dialog 
            style={{width: '720px'}}
            ref={r => dialog_viewFile_ref = r}
            onClose={() => {
                if (!selectedFile[_type][_startsWith](_text)) revokeObjectURL(fileURLOrFileContent())
                setFileURLOrFileContent('')
            }}
            header={selectedFile[_name]}
            actions={<>
                <Button 
                    onClick={() => closeModal(dialog_viewFile_ref)} 
                    variant={ButtonVariant[_filledTonal]}>
                    Close
                </Button>
                <Button 
                    variant={ButtonVariant[_filled]}
                    onClick={() => {
                        props[_command](
                            Commands.download_file, 
                            {
                                id: selectedFile[_id], 
                                listId: selectedFile[_listId],
                                name: selectedFile[_name], 
                                size: selectedFile[_size], 
                                taskId: selectedFile[_taskId],
                                type: selectedFile[_type]
                            } satisfies TaskFileMetaData, 
                            selectedTask[_taskListIndex], 
                            selectedTask[_taskIndex], 
                            selectedFile[_index]
                        )
                    }}>
                    Donwload
                </Button>
            </>}>
            <Show when={fileURLOrFileContent() != ''}>
                <Switch>
                    <Match when={selectedFile[_type][_startsWith](_image)}>
                        <img src={fileURLOrFileContent()} width={'100%'}/>
                    </Match>
                    <Match when={selectedFile[_type][_startsWith](_video)}>
                        <video src={fileURLOrFileContent()} autoplay controls width={'100%'}></video>
                    </Match>
                    <Match when={selectedFile[_type][_startsWith](_audio)}>
                        <audio src={fileURLOrFileContent()} autoplay controls style={{width: '100%'}}></audio>
                    </Match>
                    <Match when={selectedFile[_type][_startsWith](_text)}>
                        <pre><code style={{'white-space': _normal}}>{fileURLOrFileContent()}</code></pre>
                    </Match>
                </Switch>
            </Show>
        </Dialog>
        <Dialog 
            ref={r => dialog_newSubtask_ref = r}
            style={{width: '500px'}}
            header="New subtask"
            dismiss={_manual}
            onClose={() => {
                setText_subtask('')
                changeTextFieldValue(textfield_newSubtask_ref, '')
            }}
            actions={<>
                <Button 
                    variant={ButtonVariant[_filledTonal]}
                    onClick={() => closeModal(dialog_newSubtask_ref)}>
                    Close
                </Button>
                <Button 
                    variant={ButtonVariant[_filled]}
                    disabled={text_subtask()[_trim]() == ''}
                    onClick={() => confirmAddSubtask()}>
                    Add
                </Button>
            </>}>
            <form onSubmit={(ev) => {
                preventDefault(ev)
                if (text_subtask()[_trim]() == '') return;

                confirmAddSubtask()
            }}>
                <TextField 
                    ref={r => textfield_newSubtask_ref = r}
                    placeholder="Subtask name"
                    onFocus={ev => setText_subtask(ev[_currentTarget][_value])}
                    onInput={ev => setText_subtask(ev[_currentTarget][_value])}
                />
            </form>
        </Dialog>
        <Dialog 
            ref={r => dialog_editSubtask_ref = r}
            style={{width: '500px'}}
            header="Edit subtask"
            dismiss={_manual}
            onClose={() => {
                setText_subtask('')
                changeTextFieldValue(textfield_editSubtask_ref, '')
            }}
            actions={<>
                <Button 
                    variant={ButtonVariant[_filledTonal]}
                    onClick={() => closeModal(dialog_editSubtask_ref)}>
                    Close
                </Button>
                <Button 
                    variant={ButtonVariant[_filled]}
                    disabled={text_subtask()[_trim]() == ''}
                    onClick={() => confirmEditSubtask()}>
                    Edit
                </Button>
            </>}>
            <form style={{display: _contents}} onSubmit={(ev) => {
                preventDefault(ev)
                if (text_subtask()[_trim]() == '') return;
                confirmEditSubtask()
            }}>
                <TextField 
                    ref={r => textfield_editSubtask_ref = r}
                    placeholder="Subtask name"
                    onFocus={ev => setText_subtask(ev[_currentTarget][_value])}
                    onInput={ev => setText_subtask(ev[_currentTarget][_value])}
                />
            </form>
        </Dialog>
    </>)

    const Menus: VoidComponent = () => (<>
        <Menu ref={r => menu_taskAction_ref = r}>
            <MenuItem 
                iconCode={selectedTask && selectedTask[_complete]? 0xE3D4 : 0xE3CC} 
                onClick={() => {
                    closePopover(menu_taskAction_ref)
                    props[_command](
                        Commands.edit_task, 
                        {   ...getTaskFromSelectedTask(), 
                            complete: !selectedTask[_complete]
                        } satisfies Task, 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }}
                trailing={<MenuIndent />}>
                Mark as {selectedTask && selectedTask[_complete]? 'not' : ''} completed
            </MenuItem>
            <MenuItem 
                leading={<Icon code={0xEF1B} filled={!((selectedTask && selectedTask[_important]) || false)}/>} 
                onClick={() => {
                    closePopover(menu_taskAction_ref)
                    props[_command](
                        Commands.edit_task, 
                        {   ...getTaskFromSelectedTask(), 
                            important: !selectedTask[_important]
                        } satisfies Task, 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }}
                trailing={<MenuIndent />}>
                Mark as {selectedTask && selectedTask[_important]? 'not' : ''} important
            </MenuItem>
            <MenuDivider />
            <MenuItem 
                iconCode={0xE187} 
                trailing={<MenuIndent />} 
                onClick={() => {
                    closePopover(menu_taskAction_ref)
                    addFiles()
                }}>
                Add file
            </MenuItem>
            <MenuItem 
                iconCode={0xE009} 
                trailing={<MenuIndent />} 
                onClick={(ev) => {
                    closePopover(menu_taskAction_ref)
                    openModal(ev, dialog_newSubtask_ref, true)
                }}>
                Add subtask
            </MenuItem>
            <Show when={selectedTask != null && selectedTask[_reminder] == null}>
                <MenuItem 
                    onClick={(ev) => {
                        closePopover(menu_taskAction_ref)
                        openPopover({
                            popover: dateTimePicker_reminder_ref, 
                            event: ev
                        })
                    }} 
                    iconCode={0xE01B}
                    trailing={<MenuIndent />}>
                    Add reminder
                </MenuItem>
            </Show>
            <Show when={props[_labels][_length] > 0}>
                <NestedMenu
                    level={1}
                    onToggle={v => setIs_menu_taskActionAddLabel_open(v)}
                    item={<MenuItem 
                        focus={is_menu_taskActionAddLabel_open()} 
                        iconCode={0xF00D} 
                        trailing={<Icon filled code={0xE368}/>}>
                        Add label
                    </MenuItem>}>
                    <For each={[...props[_labels]][_sort]((a, b) => a == undefined || b == undefined? 0 : a[_name][_localeCompare](b[_name]))}>{label => <Show when={label != undefined}>
                        <MenuItem 
                            leading={<Icon style={{color: label![_color] ?? undefined}} code={0xE407}/>}
                            checked={selectedTask != null && selectedTask[_labelIds][_includes](label![_id])}
                            onClick={() => {
                                setSelectedTask(_labelIds, ids => ids[_includes](label![_id])
                                    ? ids[_filter]((id) => id != label![_id]) 
                                    : [...ids, label![_id]]
                                )
                                props[_command](
                                    Commands.edit_task, 
                                    getTaskFromSelectedTask(), 
                                    selectedTask[_taskListIndex], 
                                    selectedTask[_taskIndex]
                                )
                            }}>
                            {label![_name]}
                        </MenuItem>
                    </Show>}</For>
                </NestedMenu>
            </Show>
            <MenuDivider />
            <NestedMenu
                level={1}
                onToggle={v => setIs_menu_taskActionMove_open(v)}
                item={<MenuItem 
                    focus={is_menu_taskActionMove_open()} 
                    iconCode={0xE115} 
                    trailing={<Icon filled code={0xE368}/>}>
                    Move task to ...
                </MenuItem>}>
                {/* TODO: show all tasks */}
                <MenuItem iconCode={0xE8E2}>Tasks</MenuItem>
            </NestedMenu>
            <MenuDivider />
            <MenuItem 
                onClick={(ev) => {
                    closePopover(menu_taskAction_ref)
                    editTask(
                        ev, 
                        getTaskFromSelectedTask(), 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }} 
                iconCode={0xE739} 
                trailing={<MenuIndent />}>
                Edit task
            </MenuItem>
            <MenuItem 
                iconCode={0xE59D} 
                trailing={<MenuIndent />}
                onClick={(ev) => deleteTask(
                    ev, 
                    getTaskFromSelectedTask(), 
                    selectedTask[_taskListIndex], 
                    selectedTask[_taskIndex])
                }>
                Delete task
            </MenuItem>
        </Menu>
        <Menu ref={r => menu_reminder_ref = r}>
            <MenuItem iconCode={0xE2EA} onClick={ev => {
                closePopover(menu_reminder_ref)
                openPopover({
                    popover: dateTimePicker_reminder_ref, 
                    event: ev
                })
            }}>Change datetime reminder</MenuItem>
            <MenuItem iconCode={0xE01F} onClick={() => {
                closePopover(menu_reminder_ref)
                setSelectedTask(_reminder, null)
                props[_command](
                    Commands.edit_task, 
                    getTaskFromSelectedTask(), 
                    selectedTask[_taskListIndex], 
                    selectedTask[_taskIndex]
                )
            }}>Remove reminder</MenuItem>
        </Menu>
        <Menu ref={r => menu_labels_ref = r} onToggle={(isOpen) => setIs_menu_labels_open(isOpen)}>
            <MenuItem 
                iconCode={0xE007} 
                onClick={(ev) => props[_command](Commands.add_label, ev)}>
                New label
            </MenuItem>
            <Show when={props[_labels][_length] > 0}>
                <MenuItem 
                    iconCode={0xE739}
                    onClick={(ev) => {
                        closeModal(dialog_editTask_ref)
                        closePopover(menu_labels_ref)
                        props[_command](Commands.show_labels_options, ev)
                    }}>
                    Edit labels
                </MenuItem>
                <Divider/>
            </Show>
            <For each={[...props[_labels]][_sort]((a, b) => a == undefined || b == undefined? 0 : a[_name][_localeCompare](b[_name]))}>{label => <Show when={label != undefined}>
                <MenuItem 
                    leading={<Icon style={{color: label![_color] ?? undefined}} code={0xE407}/>}
                    checked={selectedTask != null && selectedTask[_labelIds][_includes](label![_id])}
                    onContextMenu={ev => {
                        setSelectedLabel(label!)
                        preventDefault(ev)
                        openPopover({
                            event: ev, 
                            popover: menu_labelAction_ref, 
                            position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                        })
                    }}
                    onClick={() => {
                        setSelectedTask(_labelIds, ids => ids[_includes](label![_id])
                            ? ids[_filter]((id) => id != label![_id]) 
                            : [...ids, label![_id]]
                        )
                        props[_command](
                            Commands.edit_task, 
                            getTaskFromSelectedTask(), 
                            selectedTask[_taskListIndex], 
                            selectedTask[_taskIndex]
                        )
                    }}>
                    {label![_name]}
                </MenuItem>
            </Show>}</For>
        </Menu>
        <Menu ref={r => menu_labelAction_ref = r}>
            <MenuItem 
                iconCode={0xE739}
                onClick={(ev) => {
                    closePopover(menu_labelAction_ref)
                    props[_command](Commands.edit_label, ev, selectedLabel)
                }}>
                Edit label
            </MenuItem>

            <MenuItem 
                iconCode={0xE59D}
                onClick={() => {
                    closePopover(menu_labelAction_ref)
                    props[_command](Commands.delete_label, selectedLabel)
                }}>
                Delete label
            </MenuItem>
        </Menu>
        <Menu ref={r => menu_labelAction2_ref = r}>
            <MenuItem 
                iconCode={0xE739}
                onClick={(ev) => {
                    closePopover(menu_labelAction2_ref)
                    props[_command](Commands.edit_label, ev, selectedLabel)
                }}>
                Edit label
            </MenuItem>
            <MenuItem 
                iconCode={0xE5E9}
                onClick={() => {
                    closePopover(menu_labelAction2_ref)
                    setSelectedTask(_labelIds, ids => ids[_filter]((id) => id != selectedLabel[_id]))
                    props[_command](
                        Commands.edit_task, 
                        getTaskFromSelectedTask(), 
                        selectedTask[_taskListIndex], 
                        selectedTask[_taskIndex]
                    )
                }}>
                Remove label from task
            </MenuItem>
        </Menu>
        <Menu ref={r => menu_fileAction_ref = r} onToggle={isOpen => setIs_menu_fileAction_open(isOpen)}>
            <MenuItem 
                iconCode={0xE0B9}
                onClick={() => {
                    closePopover(menu_fileAction_ref)
                    downloadFile()
                }}>
                Download
            </MenuItem>
            <MenuItem 
                iconCode={0xE739}
                onClick={(ev) => {
                    closePopover(menu_fileAction_ref)
                    renameFile(ev)
                }}>
                Rename
            </MenuItem>
            <MenuItem 
                iconCode={0xE59D} 
                onClick={() => {
                    closePopover(menu_fileAction_ref)
                    deleteFile()
                }}>
                Delete
            </MenuItem>
        </Menu>
        <Menu style={{'min-width': '164px'}} ref={r => menu_fileAction2_ref = r}>
            <For each={selectedTask[_files]}>{(file, index) => 
                <MenuItem focus={is_menu_fileAction3_open() && file[_id] == selectedFile[_id]} onClick={(ev) => {
                    setSelectedFile({...file, index: index()})
                    openPopover({
                        event: ev, 
                        popover: menu_fileAction3_ref, 
                        anchor: ev[_currentTarget], 
                        position: PopoverPosition[_RIGHT_CENTER_TO_BOTTOM]
                    })
                }}>{file[_name]}</MenuItem>
            }</For>
        </Menu>
        <Menu style={{'min-width': '164px'}} ref={r => menu_fileAction3_ref = r} onToggle={(isOpen) => setIs_menu_fileAction3_open(isOpen)}>
            <Show when={/^(audio|image|video|text)/[_test](selectedFile[_type])}>
                <MenuItem 
                    iconCode={0xE77B}
                    onClick={ev => {
                        closePopover(menu_fileAction3_ref)
                        viewFile(ev, selectedFile)
                    }}>
                    View
                </MenuItem>
            </Show>
            <MenuItem 
                iconCode={0xE739}
                onClick={(ev) => {
                    closePopover(menu_fileAction3_ref)
                    renameFile(ev)
                }}>
                Rename
            </MenuItem>
            <MenuItem 
                iconCode={0xE0B9} 
                onClick={() => {
                    closePopover(menu_fileAction3_ref)
                    downloadFile()
                }}>
                Download
            </MenuItem>
            <MenuItem 
                iconCode={0xE59D} 
                onClick={() => {
                    closePopover(menu_fileAction3_ref)
                    if (selectedTask[_files][_length] == 1) closePopover(menu_fileAction2_ref)

                    deleteFile()
                }}>
                Delete
            </MenuItem>
        </Menu>
    </>)

    const DatePickers: VoidComponent = () => (<>
        <DateTimePicker 
            onToggle={(v) => setIs_dateTimePicker_reminder_open(v)}
            value={selectedTask != null && selectedTask[_reminder]
                ? selectedTask[_reminder]! 
                : new Date()
            }
            ref={r => dateTimePicker_reminder_ref = r} 
            onSelectDateTime={(date) => {
                setSelectedTask(_reminder, date)
                props[_command](
                    Commands.edit_task, 
                    getTaskFromSelectedTask(), 
                    selectedTask[_taskListIndex], 
                    selectedTask[_taskIndex]
                )
            }}
        />
    </>)

    return (<div class={CSS.body}>
        <For each={props[_taskLists]}>{(taskList, index) => <Show 
            when={
                (isNumber(props[_page]) && taskList[_id] == props[_page]) 
                || (props[_page] == Pages[_tasks] && taskList[_id] == DEFAULT_TASK_LIST[_id])
            } 
            fallback={<GroupTaskList 
                command={props[_command]} 
                settings={props[_settings]} 
                page={props[_page]} 
                taskLists={props[_taskLists]}
            />}>
            <SingleTaskList 
                lists={props[_taskLists]} 
                command={props[_command]} 
                settings={props[_settings]} 
                page={props[_page]} 
                labels={props[_labels]}
                taskList={taskList} 
                taskListIndex={index()}
                onDeleteTask={(ev, task, taskIndex) => deleteTask(ev, task, index(), taskIndex)}
                onEditLabel={(ev, label, task, taskIndex) => {
                    setSelectedTask({...task, taskListIndex: index(), taskIndex})
                    setSelectedLabel(label)
                    openPopover({
                        event: ev, 
                        popover: menu_labelAction2_ref, 
                        anchor: ev[_currentTarget],
                        position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                    })
                }}
                onEditFilesTask={(ev, task, taskIndex) => {
                    setSelectedTask({...task, taskListIndex: index(), taskIndex})
                    openPopover({
                        event: ev, 
                        anchor: ev[_currentTarget],
                        popover: menu_fileAction2_ref, 
                        position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                    })
                }}
                onEditReminderTask={(ev, task, taskIndex) => {
                    setSelectedTask({...task, taskListIndex: index(), taskIndex})
                    openPopover({
                        event: ev, 
                        anchor: ev[_currentTarget],
                        popover: menu_reminder_ref, 
                        position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                    })
                }}
                onContextMenuTask={(ev, task, taskIndex) => {
                    setSelectedTask({...task, taskListIndex: index(), taskIndex})
                    openPopover({
                        event: ev, 
                        popover: menu_taskAction_ref, 
                        position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                    })
                }}
                onEditTask={(ev, task, taskIndex) => editTask(ev, task, index(), taskIndex)}
            />
            
        </Show>}</For>
        <Dialogs/>
        <Menus/>
        <DatePickers/>
    </div>)
}

export default _