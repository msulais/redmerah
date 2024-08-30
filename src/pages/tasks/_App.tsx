// TODO: handle all db error

import { createStore } from "solid-js/store"
import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import type { TaskList, TaskLabel, Settings, Task, TaskFileMetaData, SubTask } from "./_types"
import type { HEXColor } from "@/types/color"
import { type ObjectStoreTaskLists, type ObjectStoreSettings, type ObjectStoreSubTasks, type ObjectStoreTasks, type ObjectStoreTaskLabels, type ObjectStoreFiles, type ObjectStoreTaskFileMetaData, type ObjectStoreMiscellaneous, ObjectStoreNames, ObjectStoreKeys, } from "./_storage"
import { _add, _all, _ascending, _blob, _at, _clipboard, _color, _colorDark, _command, _complete, _completed, _concat, _contents, _createObjectStore, _creationDate, _currentTarget, _cursor, _delete, _descending, _description, _done, _emoji, _error, _fileName, _files, _filled, _tonal, _filter, _general, _get, _getAll, _getOwnPropertyNames, _hiddenNavigation, _home, _id, _images, _importance, _important, _includes, _isShowDeleteTaskWarning, _join, _key, _labelIds, _labels, _lastPage, _length, _listId, _lists, _localeCompare, _manual, _map, _miscellaneous, _name, _objectStore, _onColor, _onColorDark, _open, _planned, _push, _put, _readOnly, _readonly, _readwrite, _reminder, _result, _reverse, _settings, _size, _slice, _sort, _sortBy, _sortMode, _splice, _string, _subtasks, _tags, _target, _taskFileMetaData, _taskId, _taskLists, _tasks, _text, _then, _transaction, _trim, _type, _uncompleted, _value, _writeText, _keys, _defineProperty, _bold, _findIndex } from "@/data/string"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_TASK_LIST } from "./_data"
import { IDB } from "@/class/indexeddb"
import { getDateString_YMD_HM } from "@/utils/datetime"
import { getNavigator } from "@/data/window"
import { downloadFile } from "@/utils/file"

import {TextTooltip} from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField, { changeTextFieldValue, TextFieldButton } from "@/components/TextField"
import List from "@/components/List"
import Toast, { openToast } from "@/components/Toast"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import ColorPicker, { closeColorPicker, openColorPicker } from "@/components/ColorPicker"
import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Body from './_Body'
import { preventDefault } from "@/utils/event"
import { numberParse } from "@/utils/math"
import { closeEmojiPicker, EmojiPicker, openEmojiPicker } from "@/components/EmojiPicker"
import Emoji from "@/components/Emoji"

const _: VoidComponent = () => {
    const db = new IDB(DatabaseNames[_tasks])
    const [is_colorPicker_newLabel_open, setIs_colorPicker_newLabel_open] = createSignal<boolean>(false)
    const [isExpandSideNavigation, setIsExpandSideNavigation] = createSignal<boolean>(true)
    const [page, setPage] = createSignal<Pages | number>(Pages[_tasks])
    const [newListNameText, setNewListNameText] = createSignal<string>('')
    const [newListEmoji, setNewListEmoji] = createSignal<string | null>(null)
    const [editListNameText, setEditListNameText] = createSignal<string>('')
    const [editListEmoji, setEditListEmoji] = createSignal<string | null>(null)
    const [labels, setLabels] = createStore<(TaskLabel | undefined)[]>([])
    const [lists, setLists] = createStore<TaskList[]>([DEFAULT_TASK_LIST])
    const [selectedLabel, setSelectedLabel] = createStore<TaskLabel>({id: -1, name: '', color: null})
    const [selectedTaskListIndexToDelete, setSelectedTaskListIndexToDelete] = createSignal<number>(0)
    const [selectedTaskListIndexToRename, setSelectedTaskListIndexToRename] = createSignal<number>(0)
    const [isNewListEmojiPickerOpen, setIsNewListEmojiPickerOpen] = createSignal<boolean>(false)
    const [isEditListEmojiPickerOpen, setIsEditListEmojiPickerOpen] = createSignal<boolean>(false)
    const [settings, setSettings] = createStore<Settings>({
        sortBy: SortBy[_name], 
        sortMode: SortMode[_ascending],
        isShowDeleteTaskWarning: true, 
        hiddenNavigation: []
    })
    let textfield_newLabel_ref: HTMLInputElement
    let textfield_editLabel_ref: HTMLInputElement
    let textfield_newList_ref: HTMLInputElement
    let textfield_editList_ref: HTMLInputElement
    let dialog_labels_ref: HTMLDialogElement
    let dialog_newLabel_ref: HTMLDialogElement
    let dialog_editLabel_ref: HTMLDialogElement
    let dialog_newList_ref: HTMLDialogElement
    let dialog_editList_ref: HTMLDialogElement
    let dialog_deleteList_ref: HTMLDialogElement
    let colorPicker_label_ref: HTMLDialogElement
    let toast_noFile_ref: HTMLDivElement
    let emojiPicker_ref: HTMLDialogElement

    function sortTasks(tasks: Task[]): Task[] {
        const isReverse = settings[_sortMode] == SortMode[_descending]

        if (settings[_sortBy] == SortBy[_completed]) {
            tasks[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
            tasks[_sort]((a) => (a[_complete]? -1 : 1) * (isReverse? -1 : 1))
        } 
        else if (settings[_sortBy] == SortBy[_name]) {
            tasks[_sort]((a, b) => (a[_name][_localeCompare](b[_name])) * (isReverse? -1 : 1))
        } 
        else if (settings[_sortBy] == SortBy[_creationDate]) {
            tasks[_sort]((a, b) => !isReverse? b[_id] - a[_id] : a[_id] - b[_id])
        } 
        else if (settings[_sortBy] == SortBy[_importance]) {
            tasks[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
            tasks[_sort]((a, b) => (a[_important]? -1 : 1) * (isReverse? -1 : 1))
        } 
        else if (settings[_sortBy] == SortBy[_uncompleted]) {
            tasks[_sort]((a, b) => b[_name][_localeCompare](a[_name]))
            tasks[_sort]((a) => (!a[_complete]? -1 : 1) * (isReverse? -1 : 1))
        }

        return tasks
    }

    function markAllTaskAs(taskListIndex: number, complete: boolean): void {
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks]
        ], _readwrite)!
        const tasksStore = transaction[_objectStore](ObjectStoreNames[_tasks])
        const subTasksStore = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const tasks: Task[] = []

        for (const task of lists[taskListIndex][_tasks]){
            if (task[_complete] == complete) {
                tasks[_push](task)
                continue 
            }

            const t: Task = {
                ...task,
                complete: complete,
                subtasks: [...task[_subtasks][_map]((v) => {
                    const subtask = {...v}
                    subtask[_complete] = complete
                    subTasksStore[_put]({...v} satisfies ObjectStoreSubTasks)
                    return subtask
                })]
            } 
            tasksStore[_put]({
                id: t[_id], 
                complete: t[_complete],
                description: t[_description],
                important: t[_important],
                labelIds: [...t[_labelIds]],
                listId: t[_listId],
                name: t[_name],
                reminder: t[_reminder]
            } satisfies ObjectStoreTasks)
            tasks[_push](t)
        }
        setLists(
            taskListIndex, 
            _tasks,  
            [SortBy[_completed], SortBy[_uncompleted]][_includes](settings[_sortBy])
                ? sortTasks(tasks) 
                : tasks
        )
    }

    function deleteCompletedTask(taskListIndex: number): void {
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData],
            ObjectStoreNames[_files],
        ], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const tasks: Task[] = []

        for (const task of lists[taskListIndex][_tasks]){
            if (!task[_complete]) {
                tasks[_push](task)
                continue
            }

            store_tasks[_delete](task[_id])

            for (const subtask of task[_subtasks]) {
                store_subtasks[_delete](subtask[_id])
            }

            for (const file of task[_files]) {
                store_taskFileMetaData[_delete](file[_id])
                store_files[_delete](file[_id])
            }
        }
        setLists(taskListIndex, _tasks, tasks)
    }

    function clearTasks(taskListIndex: number): void {
        setLists(taskListIndex, _tasks, [])

        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData],
            ObjectStoreNames[_files],
        ], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])
        for (const task of lists[taskListIndex][_tasks]){
            store_tasks[_delete](task[_id])

            for (const subtask of task[_subtasks]) {
                store_subtasks[_delete](subtask[_id])
            }

            for (const file of task[_files]) {
                store_taskFileMetaData[_delete](file[_id])
                store_files[_delete](file[_id])
            }
        }
    }

    function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store = db[_transaction](ObjectStoreNames[_settings], _readwrite)![_objectStore](ObjectStoreNames[_settings])

        for (const item of items) {
            store[_put]({ key: item[0], value: item[1] })
        }
    }

    function saveMiscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store = db[_transaction](ObjectStoreNames[_miscellaneous], _readwrite)![_objectStore](ObjectStoreNames[_miscellaneous])

        for (const item of items) {
            store[_put]({ key: item[0], value: item[1] })
        }
    }

    async function addTask(task: Task, taskListIndex: number): Promise<void> {
        const store = db[_transaction](ObjectStoreNames[_tasks], _readwrite)![_objectStore](ObjectStoreNames[_tasks])
        // TODO: handle indexed db not accessable

        try {
            const id = ((await db[_add]<Omit<ObjectStoreTasks, 'id'>>(store, {
                description: task[_description], 
                complete: task[_complete], 
                important: task[_important],
                labelIds: [...task[_labelIds]],
                listId: task[_listId],
                name: task[_name],
                reminder: task[_reminder]
            }))[_target]! as any)[_result] as number
            const $$task: Task = {...task, id, subtasks: []}
            setLists(taskListIndex, _tasks, t => sortTasks([...t, $$task]))
        } catch {}
    }

    function editSubtask(subtask: SubTask, taskListIndex: number, taskIndex: number, subtaskIndex: number): void {
        const transaction = db[_transaction]([ObjectStoreNames[_tasks], ObjectStoreNames[_subtasks]], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const isNameChanged = subtask[_name] != lists[taskListIndex][_tasks][taskIndex][_subtasks][subtaskIndex][_name]
        const subtasks = (isNameChanged
            ? [...lists[taskListIndex][_tasks][taskIndex][_subtasks]] 
            : []
        )

        if (isNameChanged){
            subtasks[subtaskIndex] = subtask
            subtasks[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
        }

        if (isNameChanged) {
            setLists(taskListIndex, _tasks, taskIndex, _subtasks, subtasks)
        } else {
            setLists(taskListIndex, _tasks, taskIndex, _subtasks, subtaskIndex, {...subtask})
        }

        store_subtasks[_put]({...subtask})
        if (!(!subtask[_complete] && lists[taskListIndex][_tasks][taskIndex][_complete])) return;
        
        const task: Task = {...lists[taskListIndex][_tasks][taskIndex], complete: false}
        if ([SortBy[_completed], SortBy[_uncompleted]][_includes](settings[_sortBy])) {
            const tasks: Task[] = [...lists[taskListIndex][_tasks]]
            tasks[taskIndex] = task
            setLists(taskListIndex, _tasks, sortTasks(tasks))
        } 
        else {
            setLists(taskListIndex, _tasks, taskIndex, task)
        }

        store_tasks[_put]({
            id: task[_id], 
            description: task[_description], 
            complete: task[_complete],
            important: task[_important], 
            labelIds: [...task[_labelIds]],
            listId: task[_listId], 
            name: task[_name], 
            reminder: task[_reminder], 
        } satisfies ObjectStoreTasks)
    }

    function editFile(file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number): void {
        const isNameChanged = lists[taskListIndex][_tasks][taskIndex][_files][fileIndex][_name] != file[_name]
        const files: TaskFileMetaData[] = (isNameChanged
            ? [...lists[taskListIndex][_tasks][taskIndex][_files]]
            : lists[taskListIndex][_tasks][taskIndex][_files]
        )

        if (isNameChanged) {
            files[fileIndex] = {...file}
            files[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
        }

        setLists(taskListIndex, _tasks, taskIndex, _files, files) 
        
        const store_taskFileMetaData = db[_transaction](ObjectStoreNames[_taskFileMetaData], _readwrite)![_objectStore](ObjectStoreNames[_taskFileMetaData])
        store_taskFileMetaData[_put]({...file})
    }

    /**
     * Don't use this function to edit single subtask/file. Use `editSubtask()`/`editFile()` instead.
     */
    function editTask(task: Task, taskListIndex: number, taskIndex: number): void {
        const pastTask = lists[taskListIndex][_tasks][taskIndex]
        const isTaskCompleteChanged = pastTask[_complete] != task[_complete]
        const isTaskImportantChanged = pastTask[_important] != task[_important]
        const isTaskNameChanged = pastTask[_name] != task[_name]
        const changedSubtasks: SubTask[] = (isTaskCompleteChanged
            ? task[_subtasks][_map](subtask => ({...subtask, complete: !pastTask[_complete] && task[_complete]} satisfies SubTask)) 
            : [])
        const deletedSubtasks: SubTask[] = [] 
        const deletedFiles: TaskFileMetaData[] = [] 
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData],
            ObjectStoreNames[_files],
        ], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])

        if (pastTask[_subtasks][_length] > task[_subtasks][_length]) {
            const ids = task[_subtasks][_map](subtask => subtask[_id])

            for (let i = 0; i < pastTask[_subtasks][_length]; i++) {
                if (ids[_includes](pastTask[_subtasks][i][_id])) continue;

                deletedSubtasks[_push](pastTask[_subtasks][i])
            }
        }

        if (pastTask[_files][_length] > task[_files][_length]) {
            const ids = task[_files][_map](file => file[_id])

            for (let i = 0; i < pastTask[_files][_length]; i++) {
                if (ids[_includes](pastTask[_files][i][_id])) continue;

                deletedFiles[_push](pastTask[_files][i])
            }
        }

        const newTask: Task = {
            ...task, 
            reminder: task[_reminder] != null? new Date(task[_reminder]) : null,
            subtasks: isTaskCompleteChanged
                ? [...changedSubtasks]
                : task[_subtasks]
        }

        if (
            (isTaskCompleteChanged && [SortBy[_uncompleted], SortBy[_completed]][_includes](settings[_sortBy]))
            || (isTaskImportantChanged && settings[_sortBy] == SortBy[_importance])
            || (isTaskNameChanged && settings[_sortBy] == SortBy[_name])
        ){
            const tasks: Task[] = [...lists[taskListIndex][_tasks]]
            tasks[taskIndex] = newTask
            setLists(taskListIndex, _tasks, sortTasks(tasks))
        }
        else {
            setLists(taskListIndex, _tasks, taskIndex, newTask)
        }

        for (const subtask of changedSubtasks) {
            store_subtasks[_put]({...subtask})
        }

        for (const subtask of deletedSubtasks) {
            store_subtasks[_delete](subtask[_id])
        }

        for (const file of deletedFiles) {
            store_taskFileMetaData[_delete](file[_id])
            store_files[_delete](file[_id])
        }

        store_tasks[_put]({
            id: task[_id], 
            description: task[_description], 
            complete: task[_complete],
            important: task[_important], 
            listId: task[_listId], 
            name: task[_name], 
            reminder: task[_reminder], 
            labelIds: [...task[_labelIds]],
        } satisfies ObjectStoreTasks)
    }

    function deleteTask(task: Task, taskListIndex: number, taskIndex: number): void {
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_files], 
            ObjectStoreNames[_taskFileMetaData],
            ObjectStoreNames[_subtasks]
        ], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])

        setLists(
            taskListIndex, 
            _tasks, 
            tasks => [
                ...tasks[_slice](0, taskIndex), 
                ...tasks[_slice](taskIndex + 1)
            ]
        )

        store_tasks[_delete](task[_id])
        for (const subtask of task[_subtasks]) {
            store_subtasks[_delete](subtask[_id])
        }

        for (const file of task[_files]) {
            store_files[_delete](file[_id])
            store_taskFileMetaData[_delete](file[_id])
        }
    }

    function copyTasks(taskListIndex: number): void {
        const taskList = lists[taskListIndex]
        let text = `${taskList[_emoji] != null ? taskList[_emoji] : '📑'} ${taskList[_name]}`

        for (let i = 0; i < taskList[_tasks][_length]; i++) {
            const task: Task = taskList[_tasks][i]
            let additional: string = ''
            text += (`\n${task[_complete] ? '✔️' : '❌'} ${task[_name]}`)

            if (task[_description] != '') additional += `[🗒️ ${task[_description]}]`
            if (task[_important]) additional +=  '[⭐ important]'
            if (task[_reminder] != null) additional += `[🕒 ${getDateString_YMD_HM(task[_reminder]!)}]`
            for (const file of task[_files]) {
                additional += `[💾 ${file[_name]}]`
            }
            
            let j = 0
            labels: for (const id of task[_labelIds]) {
                if (labels[id] == undefined) continue labels;
                if (j >= task[_labelIds][_length]) break labels;

                additional += `[🔖 ${labels[id][_name]}]`
                j++
            }

            if (additional != '') text = [text, additional][_join](' ')
            for (const subtask of task[_subtasks]) {
                text += (`\n➡️${subtask[_complete] ? '✔️' : '❌'} ${subtask[_name]}`)
            }
        }

        // # ⚠️ task-list-name #
        // ✔️ task-name [🗒️ description][⭐ important][🕒 reminder][💾 file1][💾 file2][🔖 label1][🔖 label2]
        // ➡️✔️ subtask-name
        // ➡️❌ subtask-name
        // ❌ task-name
        getNavigator()[_clipboard][_writeText](text)
    }

    async function addLabel(name: string, color: HEXColor | null): Promise<void> {
        const store = db[_transaction](ObjectStoreNames[_labels], _readwrite)![_objectStore](ObjectStoreNames[_labels])
        // TODO: handle indexed db not accessable

        try {
            let id: number = 1
            let isAdded = false

            // since key generator value never decrease, 
            // we have to check empty key to use it. 
            // keep the labels compact.
            for (let i = 1; i < labels[_length]; i++) {
                if (labels[i] != undefined) continue;
                isAdded = true
                id = i
                await db[_add]<ObjectStoreTaskLabels>(store, {id, name, color})
                break
            }
            
            if (!isAdded) {
                id = ((await db[_add]<Omit<ObjectStoreTaskLabels, 'id'>>(store, {name, color}))[_target] as any)[_result] as number
            }

            const $labels: (TaskLabel | undefined)[] = [...labels]
            $labels[id] = {id, color, name}
            setLabels($labels)
        } catch {}
    }

    function editLabel(label: TaskLabel): void {
        const $labels = [...labels]
        $labels[label[_id]] = label
        setLabels($labels)
        
        const store = db[_transaction](ObjectStoreNames[_labels], _readwrite)![_objectStore](ObjectStoreNames[_labels])
        store[_put]({...label})
    }

    function deleteLabel(label: TaskLabel): void {
        const transaction = db[_transaction]([ObjectStoreNames[_tasks], ObjectStoreNames[_labels]], _readwrite)! 
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_labels = transaction[_objectStore](ObjectStoreNames[_labels])
        const $labels = [...labels]
        $labels[_splice](label[_id], 1)

        for (let i = 0; i < lists[_length]; i++) {
            for (let j = 0; j < lists[i][_tasks][_length]; j++) {
                const task = lists[i][_tasks][j]
                const labelIds = [...lists[i][_tasks][j][_labelIds]][_filter](id => id != label[_id])
                setLists(
                    i, _tasks, 
                    j, _labelIds, 
                    labelIds
                )
                store_tasks[_put]({
                    id: task[_id], 
                    description: task[_description], 
                    complete: task[_complete],
                    important: task[_important], 
                    labelIds: [...labelIds],
                    listId: task[_listId], 
                    name: task[_name], 
                    reminder: task[_reminder]
                } satisfies ObjectStoreTasks)
            }
        }
        setLabels($labels)
        store_labels[_delete](label[_id])
    }

    async function addFiles(files: FileList, task: Task, taskListIndex: number, taskIndex: number): Promise<TaskFileMetaData[]> {
        if (files[_length] == 0) return []
        
        const transaction = db[_transaction]([ObjectStoreNames[_taskFileMetaData], ObjectStoreNames[_files]], _readwrite)!
        const store_taskFileMetaData = transaction![_objectStore](ObjectStoreNames[_taskFileMetaData])
        const store_files = transaction![_objectStore](ObjectStoreNames[_files])
        const $files: TaskFileMetaData[] = [...lists[taskListIndex][_tasks][taskIndex][_files]]

        try {
            for (const file of files) {
                const id = ((await db[_add]<Omit<ObjectStoreTaskFileMetaData, 'id'>>(store_taskFileMetaData, {
                    listId: task[_listId],
                    name: file[_name],
                    size: file[_size],
                    taskId: task[_id],
                    type: file[_type]
                }))[_target]! as any)[_result] as number

                store_files[_put]({ 
                    id, 
                    blob: new Blob([file])
                } satisfies ObjectStoreFiles)

                $files[_push]({
                    id: id, 
                    listId: task[_listId], 
                    name: file[_name],
                    size: file[_size],
                    taskId: task[_id], 
                    type: file[_type]
                })
            }
            setLists(taskListIndex, _tasks, taskIndex, _files, $files[_sort]((a, b) => a[_name][_localeCompare](b[_name])))
        } catch {}

        return $files
    }

    function downloadTaskFile(file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number): void {
        const transaction = db[_transaction]([ObjectStoreNames[_files], ObjectStoreNames[_taskFileMetaData]], _readonly)!
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        db[_get]<ObjectStoreFiles>(store_files, file[_id])[_then]((result) => {
            if (!result) {
                if (file[_id] == lists[taskListIndex][_tasks][taskIndex][_files][fileIndex][_id]) {

                    // This statement not update the file lists in <dialog>
                    setLists(taskListIndex, _tasks, taskIndex, _files, files => [
                        ...files[_slice](0, fileIndex), 
                        ...files[_slice](fileIndex + 1)
                    ])
                    store_taskFileMetaData[_delete](file[_id])
                }

                openToast(toast_noFile_ref)
                return;
            }

            downloadFile(new Blob([result[_blob]]), file[_name])
        })
    }

    async function getBlob(file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number): Promise<Blob | null> {
        const transaction = db[_transaction]([ObjectStoreNames[_files], ObjectStoreNames[_taskFileMetaData]], _readonly)!
        const store_files = transaction[_objectStore](ObjectStoreNames[_files])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        try {
            const result = await db[_get]<ObjectStoreFiles>(store_files, file[_id])
            if (!result) {
                if (file[_id] == lists[taskListIndex][_tasks][taskIndex][_files][fileIndex][_id]) {

                    // This statement not update the file lists in <dialog>
                    setLists(taskListIndex, _tasks, taskIndex, _files, files => [
                        ...files[_slice](0, fileIndex), 
                        ...files[_slice](fileIndex + 1)
                    ])
                    store_taskFileMetaData[_delete](file[_id])
                }

                openToast(toast_noFile_ref)
                return null
            }

            return new Blob([result[_blob]])
        } catch {}

        return null
    }

    async function addSubtask(subtask: SubTask, taskListIndex: number, taskIndex: number): Promise<SubTask[]> {
        const transaction = db[_transaction]([ObjectStoreNames[_tasks], ObjectStoreNames[_subtasks]], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])

        try {
            const id = ((await db[_add]<Omit<ObjectStoreSubTasks, 'id'>>(store_subtasks, {
                complete: subtask[_complete], 
                listId: subtask[_listId],
                name: subtask[_name], 
                taskId: subtask[_taskId]
            }))[_target]! as any)[_result] as number

            const $subtask = {...subtask}
            $subtask[_id] = id
            setLists(
                taskListIndex, _tasks, 
                taskIndex, _subtasks, 
                subtasks => [...subtasks, $subtask][_sort]((a, b) => a[_name][_localeCompare](b[_name]))
            )

            if (lists[taskListIndex][_tasks][taskIndex][_complete]) {
                const task: Task = {...lists[taskListIndex][_tasks][taskIndex], complete: false}
                if ([SortBy[_completed], SortBy[_uncompleted]][_includes](settings[_sortBy])) {
                    const tasks: Task[] = [...lists[taskListIndex][_tasks]]
                    tasks[taskIndex] = task
                    setLists(taskListIndex, _tasks, sortTasks(tasks))
                } 
                else {
                    setLists(taskListIndex, _tasks, taskIndex, task)
                }
            }
        } catch {}
        return lists[taskListIndex][_tasks][taskIndex][_subtasks]
    }

    function sortAllTasks(): void {
        for (let i = 0; i < lists[_length]; i++) {
            setLists(i, _tasks, sortTasks([...lists[i][_tasks]]))
        }
    }

    function reverseAllTasks(): void {
        for (let i = 0; i < lists[_length]; i++) {
            setLists(i, _tasks, [...lists[i][_tasks]][_reverse]())
        }
    }

    async function addNewTaskList(name: string, emoji: string | null): Promise<void> {
        const store_tasks = db[_transaction]([ObjectStoreNames[_lists]], _readwrite)![_objectStore](ObjectStoreNames[_lists])
        name = name[_trim]()
        let count = 0
        for (const list of lists) {
            if (count == 0 && list[_name] == name) ++count
            if (list[_name] == name + ` (${count})`) ++count
        }
        if (count > 0) name += ` (${count})`

        try {
            const id = ((await db[_add]<Omit<ObjectStoreTaskLists, 'id'>>(store_tasks, {
                emoji, name
            }))[_target]! as any)[_result] as number
            setLists(values => [
                ...values, 
                {
                    id,
                    emoji,
                    name, 
                    tasks: []
                } satisfies TaskList
            ][_sort]((a, b) => a[_name][_localeCompare](b[_name])))
            changePage(id)
        } catch {}
    }

    async function command(type: Commands, ...args: unknown[]): Promise<unknown> {
        // toggle_navigation_expand
        if (type == Commands.toggle_navigation_expand) {
            setIsExpandSideNavigation(v => !v)
            saveMiscellaneous([ObjectStoreKeys.miscellaneous_isSideNavigationExpand, isExpandSideNavigation()])
        }

        // change_page
        else if (type == Commands.change_page) {
            changePage(args[0] as (Pages | number))
        }

        // change_sortBy
        else if (type == Commands.change_sortBy) {
            const sortBy = args[0] as SortBy
            setSettings(_sortBy, sortBy)
            saveSettings([ObjectStoreKeys.settings_sortBy, sortBy])
            sortAllTasks()
        }
        
        // change_sortMode
        else if (type == Commands.change_sortMode) {
            const sortMode = args[0] as SortMode
            setSettings(_sortMode, sortMode)
            saveSettings([ObjectStoreKeys.settings_sortMode, sortMode])
            reverseAllTasks()
        }

        // add_task
        else if (type == Commands.add_task) {
            addTask(args[0] as Task, args[1] as number)
        }

        // edit_task
        else if (type == Commands.edit_task) {
            editTask(args[0] as Task, args[1] as number, args[2] as number)
        }

        // delete_task
        else if (type == Commands.delete_task) {
            deleteTask(args[0] as Task, args[1] as number, args[2] as number)
        }

        // toggle_deleteTaskWarning
        else if (type == Commands.toggle_deleteTaskWarning) {
            const value = args[0] as boolean ?? !settings[_isShowDeleteTaskWarning]
            setSettings(_isShowDeleteTaskWarning, value)
            saveSettings([ObjectStoreKeys.settings_isShowDeleteTaskWarning, value])
        }

        // change_hiddenNavigation
        else if (type == Commands.change_hiddenNavigation) {
            const value = args[0] as (Pages[])
            if (typeof page() == (typeof Pages[_tasks]) && value[_includes](page() as Pages)) {
                changePage(Pages[_tasks])
            }
            setSettings(_hiddenNavigation, value)
            saveSettings([ObjectStoreKeys.settings_hiddenNavigation, [...value]])
        }

        // mark_all_completed
        else if (type == Commands.mark_all_completed) {
            markAllTaskAs(args[0] as number, true)
        }

        // mark_all_uncompleted
        else if (type == Commands.mark_all_uncompleted) {
            markAllTaskAs(args[0] as number, false)
        }

        // clear_tasks
        else if (type == Commands.clear_tasks) {
            clearTasks(args[0] as number)
        }

        // delete_completed_task
        else if (type == Commands.delete_completed_task) {
            deleteCompletedTask(args[0] as number)
        }

        // copy_tasks
        else if (type == Commands.copy_tasks) {
            copyTasks(args[0] as number)
        }

        // add_label
        else if (type == Commands.add_label) {
            openDialog(args[0] as Event, dialog_newLabel_ref, {
                inputAutoFocus: true, 
                important: true
            })
        }

        // edit_label
        else if (type == Commands.edit_label) {
            const label = args[1] as TaskLabel
            
            changeTextFieldValue(textfield_editLabel_ref, label[_name])
            setSelectedLabel(label)
            openDialog(args[0] as Event, dialog_editLabel_ref, {
                inputAutoFocus: true, 
                important: true
            })
        }

        // delete_label
        else if (type == Commands.delete_label) {
            deleteLabel(args[0] as TaskLabel)
        }

        // show_labels_options
        else if (type == Commands.show_labels_options) {
            openDialog(args[0] as Event, dialog_labels_ref)
        }

        // add_files
        else if (type == Commands.add_files) {
            return await addFiles(args[0] as FileList, args[1] as Task, args[2] as number, args[3] as number)
        }

        // download_file
        else if (type == Commands.download_file) {
            downloadTaskFile(args[0] as TaskFileMetaData, args[1] as number, args[2] as number, args[3] as number)
        }

        // edit_file
        else if (type == Commands.edit_file) {
            editFile(args[0] as TaskFileMetaData, args[1] as number, args[2] as number, args[3] as number)
        }
        
        // edit_subtask
        else if (type == Commands.edit_subtask) {
            editSubtask(args[0] as SubTask, args[1] as number, args[2] as number, args[3] as number)
        }

        // get_file_blob
        else if (type == Commands.get_file_blob) {
            return await getBlob(args[0] as TaskFileMetaData, args[1] as number, args[2] as number, args[3] as number)
        }

        // add_subtask
        else if (type == Commands.add_subtask) {
            return await addSubtask(args[0] as SubTask, args[1] as number, args[2] as number)
        }

        // add_taskList
        else if (type == Commands.add_taskList) {
            openDialog(args[0] as Event, dialog_newList_ref, {
                important: true, 
                inputAutoFocus: true
            })
        }

        // delete_taskList
        else if (type == Commands.delete_taskList) {
            setSelectedTaskListIndexToDelete(args[1] as number)
            openDialog(args[0] as Event, dialog_deleteList_ref, {
                important: true
            })
        }

        // rename_taskList
        else if (type == Commands.rename_taskList) {
            const list = lists[args[1] as number]
            setSelectedTaskListIndexToRename(args[1] as number)
            setEditListEmoji(list[_emoji])
            setEditListNameText(list[_name])
            changeTextFieldValue(textfield_editList_ref, list[_name])
            openDialog(args[0] as Event, dialog_editList_ref, {
                important: true, 
                inputAutoFocus: true
            })
        }

        // move_task
        else if (type == Commands.move_task) {
            moveTask(args[0] as Task, args[1] as number, args[2] as number, args[3] as number)
        }
        
        return 
    }

    function moveTask(task: Task, taskListIndex: number, taskIndex: number, targetTaskListIndex: number): void { 
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData],
        ], _readwrite)!
        const store_tasks = transaction[_objectStore](ObjectStoreNames[_tasks])
        const store_subtasks = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const store_taskFileMetaData = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const targetList = lists[targetTaskListIndex]

        // Update manually if list has tasks, because 
        // `getTasks()` function only update empty list.
        if (targetList[_tasks][_length] > 0) {
            const subtasks = task[_subtasks][_map](subtask => ({...subtask, listId: targetList[_id]}))
            const files = task[_files][_map](file => ({...file, listId: targetList[_id]}))
            const $task: Task = {...task, subtasks, files}
            setLists(targetTaskListIndex, _tasks, tasks => sortTasks([...tasks, $task]))
        }
        
        setLists(
            taskListIndex, 
            _tasks, 
            tasks => tasks[_slice](0, taskIndex)[_concat](tasks[_slice](taskIndex + 1))
        )
        store_tasks[_put]({
            complete: task[_complete],
            description: task[_description], 
            id: task[_id], 
            important: task[_important],
            labelIds: [...task[_labelIds]],
            listId: targetList[_id],
            name: task[_name],
            reminder: task[_reminder]
        } satisfies ObjectStoreTasks)

        for (const subtask of task[_subtasks]) {
            store_subtasks[_put]({
                ...subtask,
                listId: targetList[_id]
            } satisfies ObjectStoreSubTasks)
        }

        for (const file of task[_files]) {
            store_taskFileMetaData[_put]({
                ...file, 
                listId: targetList[_id]
            } satisfies ObjectStoreTaskFileMetaData)
        }
    }

    function initDatabase(): void {
        db[_open]({
            onSuccess() {
                initLists()
                initLabels()
                initSettings()
                initMiscellaneous()
            },
            onUpgradeNeeded(_, db) {
                const store = db[_createObjectStore]<ObjectStoreTaskLists>({
                    name: ObjectStoreNames[_lists],
                    keyPath: _id,
                    indexs: [_id, _name, _emoji]
                })

                store![_put]({
                    id: DEFAULT_TASK_LIST[_id],
                    name: DEFAULT_TASK_LIST[_name], 
                    emoji: DEFAULT_TASK_LIST[_emoji],
                } satisfies ObjectStoreTaskLists)

                db[_createObjectStore]<ObjectStoreTasks>({
                    name: ObjectStoreNames[_tasks],
                    keyPath: _id,
                    indexs: [_id, _listId, _name, _complete, _reminder, _important, _description, _labelIds]
                })
                db[_createObjectStore]<ObjectStoreSubTasks>({
                    name: ObjectStoreNames[_subtasks],
                    keyPath: _id,
                    indexs: [_id, _taskId, _name, _complete, _listId]
                })
                db[_createObjectStore]<ObjectStoreSettings>({
                    name: ObjectStoreNames[_settings],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
                db[_createObjectStore]<ObjectStoreMiscellaneous>({
                    name: ObjectStoreNames[_miscellaneous],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
                db[_createObjectStore]<ObjectStoreTaskLabels>({
                    name: ObjectStoreNames[_labels],
                    keyPath: _id,
                    indexs: [_id, _name, _color]
                })
                db[_createObjectStore]<ObjectStoreFiles>({
                    name: ObjectStoreNames[_files],
                    keyPath: _id,
                    indexs: [_id, _blob]
                })
                db[_createObjectStore]<ObjectStoreTaskFileMetaData>({
                    name: ObjectStoreNames[_taskFileMetaData],
                    keyPath: _id,
                    indexs: [_id, _listId, _taskId, _name, _size, _type]
                })
            },
        })
    }

    function initLastPage(): void {
        const store = db[_transaction](ObjectStoreNames[_miscellaneous], _readonly)![_objectStore](ObjectStoreNames[_miscellaneous])
        db[_get]<ObjectStoreMiscellaneous<Pages | number>>(store, ObjectStoreKeys.miscellaneous_lastPage)[_then]((v) => {
            if (!v) return getTasks()

            setPage(v[_value])
            getTasks()
        })
    }

    function initMiscellaneous(): void {
        const store = db[_transaction](ObjectStoreNames[_miscellaneous], _readonly)![_objectStore](ObjectStoreNames[_miscellaneous])
        db[_get]<ObjectStoreMiscellaneous<boolean>>(store, ObjectStoreKeys.miscellaneous_isSideNavigationExpand)[_then]((v) => setIsExpandSideNavigation(d => v? v[_value] : d))
    }

    function initSettings(): void {
        const store = db[_transaction](ObjectStoreNames[_settings], _readonly)![_objectStore](ObjectStoreNames[_settings])
        db[_get]<ObjectStoreSettings<SortBy>>(store, ObjectStoreKeys.settings_sortBy)[_then]((v) => setSettings(_sortBy, d => v? v[_value] : d))
        db[_get]<ObjectStoreSettings<SortMode>>(store, ObjectStoreKeys.settings_sortMode)[_then]((v) => setSettings(_sortMode, d => v? v[_value] : d))
        db[_get]<ObjectStoreSettings<boolean>>(store, ObjectStoreKeys.settings_isShowDeleteTaskWarning)[_then]((v) => setSettings(_isShowDeleteTaskWarning, d => v? v[_value] : d))
        db[_get]<ObjectStoreSettings<Pages[]>>(store, ObjectStoreKeys.settings_hiddenNavigation)[_then]((v) => setSettings(_hiddenNavigation, d => v? [...v[_value]] : d))
    }

    function initLists(): void {
        const store = db[_transaction](ObjectStoreNames[_lists], _readonly)![_objectStore](ObjectStoreNames[_lists])
        db[_getAll]<ObjectStoreTaskLists>(store)[_then]((v) => {
            if (!v) return;
            const values: TaskList[] = []
            for (const i of v) values[_push]({
                ...i, 
                tasks: []
            })
            values[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
            setLists(values)
            initLastPage()
        })
    }

    function initLabels(): void {
        const store = db[_transaction](ObjectStoreNames[_labels], _readonly)![_objectStore](ObjectStoreNames[_labels])
        db[_getAll]<ObjectStoreTaskLabels>(store)[_then]((v) => {
            if (!v) return;
            const values: TaskLabel[] = []
            for (const label of [...v][_sort]((a, b) => a[_name][_localeCompare](b[_name]))) {
                values[label[_id]] = label
            }
            setLabels(values)
        })
    }

    function deleteTaskList(): void {
        const transaction = db[_transaction]([
            ObjectStoreNames[_lists],
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData],
            ObjectStoreNames[_files],
        ], _readwrite)!
        const listsStore = transaction[_objectStore](ObjectStoreNames[_lists])
        const tasksStore = transaction[_objectStore](ObjectStoreNames[_tasks])
        const subTasksStore = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const fileMetaDataStore = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const filesStore = transaction[_objectStore](ObjectStoreNames[_files])
        const list = lists[selectedTaskListIndexToDelete()]
        changePage(Pages[_tasks])

        listsStore[_delete](list[_id])
        for (const task of list[_tasks]) {
            tasksStore[_delete](task[_id])

            for (const subtask of task[_subtasks]) {
                subTasksStore[_delete](subtask[_id])
            }

            for (const fileMetaData of task[_files]) {
                fileMetaDataStore[_delete](fileMetaData[_id])
                filesStore[_delete](fileMetaData[_id])
            }
        }

        setLists(lists => [...lists[_slice](0, selectedTaskListIndexToDelete()), ...lists[_slice](selectedTaskListIndexToDelete() + 1)])
    }

    // FIXME: To many iteration and I hate it. I don't find any better solution currently
    async function getTasks(all: boolean = false): Promise<void> {
        const transaction = db[_transaction]([
            ObjectStoreNames[_tasks], 
            ObjectStoreNames[_subtasks], 
            ObjectStoreNames[_taskFileMetaData]
        ], _readonly)!
        const tasksStore = transaction[_objectStore](ObjectStoreNames[_tasks])
        const subTasksStore = transaction[_objectStore](ObjectStoreNames[_subtasks])
        const fileMetaDataStore = transaction[_objectStore](ObjectStoreNames[_taskFileMetaData])
        const isGetAll = (
            ([
                Pages[_all], Pages[_completed], Pages[_uncompleted], 
                Pages[_important], Pages[_planned]
            ][_includes](page() as Pages)) 
            || all
        )
        const listId = page() == Pages[_tasks]? DEFAULT_TASK_LIST[_id] : page() as number
        const list_idIndex: {[id: number]: number} = {}

        for (let i = 0; i < lists[_length]; i++) {
            if (lists[i][_tasks][_length] > 0) continue
            if (isGetAll) list_idIndex[lists[i][_id]] = i
            else if (lists[i][_id] == listId) {
                list_idIndex[lists[i][_id]] = i
                break
            }
        }

        if (Object[_keys](list_idIndex)[_length] == 0) return;

        try {

            // TASKS
            const tasks_idIndex: {[id: number]: number} = {}
            const tasks: Task[] = []
            await db[_cursor](tasksStore, (cursor) => {
                if (!cursor) return false
                const task = cursor[_value] as ObjectStoreTasks
                const add = () => {
                    if (list_idIndex[task[_listId]] == undefined) return;
                    tasks[_push]({...task, files: [], subtasks: []})
                }
                if (isGetAll) add()
                else if (task[_listId] == listId) add()
                return true
            }) 
            sortTasks(tasks) 
            for (let i = 0; i < tasks[_length]; i++) {
                tasks_idIndex[tasks[i][_id]] = i
            } 

            // SUBTASKS
            const subtasks: SubTask[] = []
            await db[_cursor](subTasksStore, (cursor) => {
                if (!cursor) return false
                const subtask = cursor[_value] as ObjectStoreSubTasks
                const add = () => {
                    if (list_idIndex[subtask[_listId]] == undefined) return;
                    subtasks[_push](subtask)
                }
                if (isGetAll) add()
                else if (subtask[_listId] == listId) add()
                return true
            }) 
            subtasks[_sort]((a, b) => a[_name][_localeCompare](b[_name])) 
            for (const subtask of subtasks) {
                tasks[tasks_idIndex[subtask[_taskId]]][_subtasks][_push](subtask)
            }

            // FILES
            const fileMetaDatas: TaskFileMetaData[] = []
            await db[_cursor](fileMetaDataStore, (cursor) => {
                if (!cursor) return false
                const fileMetaData = cursor[_value] as ObjectStoreTaskFileMetaData
                const add = () => {
                    if (list_idIndex[fileMetaData[_listId]] == undefined) return;
                    fileMetaDatas[_push]({...fileMetaData})
                }
                if (isGetAll) add()
                else if (fileMetaData[_listId] == listId) add()
                return true
            })
            fileMetaDatas[_sort]((a, b) => a[_name][_localeCompare](b[_name]))
            for (const fileMetaData of fileMetaDatas) {
                tasks[tasks_idIndex[fileMetaData[_taskId]]][_files][_push](fileMetaData)
            }

            for (const id of Object[_keys](list_idIndex)[_map](v => numberParse(v, true))) {
                setLists(list_idIndex[id], _tasks, tasks[_filter](task => task[_listId] == id))
            }

        } catch (e) {console.log(e)}
    }

    function changePage(page: Pages | number): void {
        setPage(page)
        getTasks()

        const store = db[_transaction](ObjectStoreNames[_miscellaneous], _readwrite)![_objectStore](ObjectStoreNames[_miscellaneous])
        store[_put]({
            key: ObjectStoreKeys.miscellaneous_lastPage,
            value: page
        })
    }

    function renameTaskList(): void {
        const store = db[_transaction](ObjectStoreNames[_lists], _readwrite)![_objectStore](ObjectStoreNames[_lists])
        const list = lists[selectedTaskListIndexToRename()]
        const id = list[_id]
        const emoji = editListEmoji()
        let name = editListNameText()[_trim]()

        if (name != list[_name]) {
            let count = 0
            for (const list of lists) {
                if (count == 0 && list[_name] == name) ++count
                if (list[_name] == name + ` (${count})`) ++count
            }
            if (count > 0) name += ` (${count})`
        }

        setLists(selectedTaskListIndexToRename(), list => ({...list, emoji, name}))
        store[_put]({emoji, id, name} satisfies ObjectStoreTaskLists)
    }

    onMount(() => {
        initDatabase()
    })

    const LabelItem: VoidComponent<TaskLabel> = (props) => {
        return (<List 
            leading={<Icon style={{color: props[_color] ?? undefined}} code={0xE407}/>}
            trailing={<>
                <TextTooltip text="Edit label">
                    <IconButton 
                        onClick={(ev) => command(Commands.edit_label, ev, props)} 
                        code={0xE739} 
                    />
                </TextTooltip>

                <TextTooltip text="Delete label">
                    <IconButton 
                        onClick={() => command(Commands.delete_label, props)} 
                        code={0xE59D}
                    />
                </TextTooltip>
            </>}>
            {props[_name]}
        </List>)
    }

    const Dialogs: VoidComponent = () => (<>
        <Dialog 
            style={{width: '500px'}} 
            ref={r => dialog_labels_ref = r} 
            header="Labels"
            actions={<>
                <Button onClick={() => closeDialog(dialog_labels_ref)} variant={ButtonVariant[_tonal]}>Close</Button>
                <Button onClick={ev => openDialog(ev, dialog_newLabel_ref, {inputAutoFocus: true, important: true})} variant={ButtonVariant[_filled]}>Add label</Button>
            </>}>
            <For each={labels} fallback={"No labels"}>{label => <Show when={label != undefined}><LabelItem {...label!}/></Show>}</For>
        </Dialog>
        <Dialog 
            ref={r => dialog_newLabel_ref = r} 
            header="New label"
            onClose={() => {
                setSelectedLabel(_name, '')
                changeTextFieldValue(textfield_newLabel_ref, '')
                setSelectedLabel(_color, null)
            }}
            actions={<>
                <Button 
                    onClick={() => closeDialog(dialog_newLabel_ref)} 
                    variant={ButtonVariant[_tonal]}>
                    Cancel
                </Button>
                <Button 
                    disabled={selectedLabel[_name][_trim]() == ''}
                    onClick={() => {
                        addLabel(selectedLabel[_name][_trim](), selectedLabel[_color])
                        closeDialog(dialog_newLabel_ref)
                    }} 
                    variant={ButtonVariant[_filled]}>
                    Add
                </Button>
            </>}>

            <form style={{display: _contents}} onSubmit={(ev) => {
                preventDefault(ev)
                if (selectedLabel[_name][_trim]() == '') return;

                addLabel(selectedLabel[_name][_trim](), selectedLabel[_color])
                closeDialog(dialog_newLabel_ref)
            }}>
                <TextField 
                    ref={r => textfield_newLabel_ref = r} 
                    labelText="Name" 
                    onFocus={() => setSelectedLabel(_name, textfield_newLabel_ref[_value])}
                    onInput={() => setSelectedLabel(_name, textfield_newLabel_ref[_value])}
                    autofocus
                    trailing={<>
                        <TextTooltip text="Change label color">
                            <TextFieldButton 
                                focused={is_colorPicker_newLabel_open()}
                                onClick={ev => openColorPicker(ev, colorPicker_label_ref, {
                                    anchor: ev[_currentTarget],
                                })}>
                                <Icon style={{color: selectedLabel[_color] ?? undefined}} code={0xE407}/>
                            </TextFieldButton>
                        </TextTooltip>
                    </>}
                />
            </form>
        </Dialog>
        <Dialog 
            ref={r => dialog_editLabel_ref = r} 
            header="Edit label"
            onClose={() => {
                setSelectedLabel(_name, '')
                changeTextFieldValue(textfield_editLabel_ref, '')
                setSelectedLabel(_color, null)
            }}
            actions={<>
                <Button 
                    onClick={() => closeDialog(dialog_editLabel_ref)} 
                    variant={ButtonVariant[_tonal]}>
                    Cancel
                </Button>
                <Button 
                    disabled={selectedLabel[_name][_trim]() == ''}
                    onClick={() => {
                        editLabel({
                            ...selectedLabel,
                            name: selectedLabel[_name][_trim](), 
                        } satisfies TaskLabel)
                        closeDialog(dialog_editLabel_ref)
                    }} 
                    variant={ButtonVariant[_filled]}>
                    Edit
                </Button>
            </>}>
            <form 
                style={{display: _contents}} 
                onSubmit={ev => {
                    preventDefault(ev)
                    if (selectedLabel[_name][_trim]() == '') return;

                    editLabel({
                        ...selectedLabel,
                        name: selectedLabel[_name][_trim](), 
                    } satisfies TaskLabel)
                    closeDialog(dialog_editLabel_ref)
                }}>
                <TextField 
                    ref={r => textfield_editLabel_ref = r} 
                    labelText="Name" 
                    onFocus={() => setSelectedLabel(_name, textfield_editLabel_ref[_value])}
                    onInput={() => setSelectedLabel(_name, textfield_editLabel_ref[_value])}
                    autofocus
                    trailing={<>
                        <TextTooltip text="Change label color">
                            <TextFieldButton
                                focused={is_colorPicker_newLabel_open()}
                                onClick={ev => openColorPicker(ev, colorPicker_label_ref, {
                                    anchor: ev[_currentTarget],
                                })}>
                                <Icon style={{color: selectedLabel[_color] ?? undefined}} code={0xE407}/>
                            </TextFieldButton>
                        </TextTooltip>
                    </>}
                />
            </form>
        </Dialog>
        <Dialog
            ref={r => dialog_newList_ref = r}
            header="New list"
            style={{width: '500px'}}
            onClose={() => {
                setNewListNameText('')
                setNewListEmoji(null)
                changeTextFieldValue(textfield_newList_ref, '')
            }}
            actions={<>
                <Button onClick={() => closeDialog(dialog_newList_ref)} variant={ButtonVariant[_tonal]}>Cancel</Button>
                <Button 
                    onClick={() => {
                        addNewTaskList(newListNameText(), newListEmoji())
                        closeDialog(dialog_newList_ref)
                    }} 
                    disabled={newListNameText()[_trim]() == ''}
                    variant={ButtonVariant[_filled]}>
                    Add
                </Button>
            </>}>
            <form 
                style={{display: _contents}}
                onSubmit={(ev) => {
                    preventDefault(ev)
                    if (newListNameText()[_trim]() == '') return;
                    addNewTaskList(newListNameText(), newListEmoji())
                }}>
                <TextField 
                    ref={r => textfield_newList_ref = r}
                    placeholder="List name"
                    onInput={ev => setNewListNameText(ev[_currentTarget][_value])}
                    onFocus={ev => setNewListNameText(ev[_currentTarget][_value])}
                    trailing={<TextFieldButton
                        onClick={(ev) => {
                            setIsNewListEmojiPickerOpen(true)
                            openEmojiPicker(ev, emojiPicker_ref)
                        }}>
                        <Show when={newListEmoji() == null} fallback={<Emoji emoji={newListEmoji()!}/>}>
                            <Icon code={0xE747}/>
                        </Show>
                    </TextFieldButton>}
                />
            </form>
        </Dialog>
        <Dialog
            ref={r => dialog_editList_ref = r}
            header="Rename list"
            style={{width: '500px'}}
            actions={<>
                <Button onClick={() => closeDialog(dialog_editList_ref)} variant={ButtonVariant[_tonal]}>Cancel</Button>
                <Button 
                    onClick={() => {
                        renameTaskList()
                        closeDialog(dialog_editList_ref)
                    }} 
                    disabled={
                        editListNameText()[_trim]() == '' 
                        || (
                            editListNameText()[_trim]() == lists[selectedTaskListIndexToRename()][_name]
                            && editListEmoji() == lists[selectedTaskListIndexToRename()][_emoji]
                        )
                    }
                    variant={ButtonVariant[_filled]}>
                    Rename
                </Button>
            </>}>
            <form 
                style={{display: _contents}}
                onSubmit={(ev) => {
                    preventDefault(ev)
                    if (editListNameText()[_trim]() == '' 
                        || (
                            editListNameText()[_trim]() == lists[selectedTaskListIndexToRename()][_name]
                            && editListEmoji() == lists[selectedTaskListIndexToRename()][_emoji]
                        )
                    ) return;
                    renameTaskList()
                }}>
                <TextField 
                    ref={r => textfield_editList_ref = r}
                    placeholder="List name"
                    onInput={ev => setEditListNameText(ev[_currentTarget][_value])}
                    onFocus={ev => setEditListNameText(ev[_currentTarget][_value])}
                    trailing={<TextFieldButton
                        onClick={(ev) => {
                            setIsEditListEmojiPickerOpen(true)
                            openEmojiPicker(ev, emojiPicker_ref)
                        }}>
                        <Show when={editListEmoji() == null} fallback={<Emoji emoji={editListEmoji()!}/>}>
                            <Icon code={0xE747}/>
                        </Show>
                    </TextFieldButton>}
                />
            </form>
        </Dialog>
        <Dialog 
            ref={r => dialog_deleteList_ref = r}
            style={{width: '500px'}}
            header="Delete list"
            actions={<>
                <Button 
                    variant={ButtonVariant[_tonal]}
                    onClick={ev => {
                        closeDialog(dialog_deleteList_ref)
                    }}>
                    Cancel
                </Button>
                <Button 
                    variant={ButtonVariant[_filled]} 
                    onClick={() => {
                        closeDialog(dialog_deleteList_ref)
                        deleteTaskList()
                    }}>
                    Delete
                </Button>
            </>}>
            <Show when={lists[selectedTaskListIndexToDelete()]}>
                <>Are you sure want to delete <q style={{"font-weight": _bold, color: 'rgb(var(--color-accent))'}}>{lists[selectedTaskListIndexToDelete()][_name]}</q> list? </>
                <>This list contains {lists[selectedTaskListIndexToDelete()][_tasks][_filter](v => !v[_complete])[_length]} uncompleted tasks </>
                <>and {lists[selectedTaskListIndexToDelete()][_tasks][_filter](v => v[_complete])[_length]} completed tasks</>
            </Show>
        </Dialog>
    </>)

    const ColorPickers: VoidComponent = () => {
        return (<>
            <ColorPicker 
                color={selectedLabel[_color] ?? undefined}
                onToggleOpen={(isOpen) => setIs_colorPicker_newLabel_open(isOpen)} 
                onSelectColor={(color) => setSelectedLabel(_color, color)} 
                ref={r => colorPicker_label_ref = r}>
                <Show when={selectedLabel[_color] != null}>
                    <Button 
                        style={{width: '100%'}} 
                        onClick={() => {
                            closeColorPicker(colorPicker_label_ref)
                            setSelectedLabel(_color, null)
                        }}
                        variant={ButtonVariant[_tonal]}>
                        <Icon code={0xE40C}/>No color
                    </Button>
                </Show>
            </ColorPicker>
        </>)
    }

    const EmojiPickers: VoidComponent = () => (<>
        <EmojiPicker 
            ref={r => emojiPicker_ref = r}
            onClose={() => {
                setIsNewListEmojiPickerOpen(false)
                setIsEditListEmojiPickerOpen(false)
            }}
            onSelectEmoji={e => {
                if (isNewListEmojiPickerOpen()) setNewListEmoji(e)
                if (isEditListEmojiPickerOpen()) setEditListEmoji(e)
            }}>
            <Show when={
                (isNewListEmojiPickerOpen() && newListEmoji() != null) 
                || (isEditListEmojiPickerOpen() && editListEmoji() != null)
            }>
                <div style={{width: '100%', padding: '0 12px 12px 12px'}}>
                    <Button 
                        style={{width: '100%'}} 
                        variant={ButtonVariant[_tonal]}
                        onClick={(ev) => {
                            if (isNewListEmojiPickerOpen()) setNewListEmoji(null)
                            if (isEditListEmojiPickerOpen()) setEditListEmoji(null)
                            closeEmojiPicker(emojiPicker_ref)
                        }}>
                        <Icon code={0xE5E9}/>No emoji
                    </Button>
                </div>
            </Show>
        </EmojiPicker>
    </>)

    const Toasts: VoidComponent = () => {
        return (<>
            <Toast ref={r => toast_noFile_ref = r} leading={<Icon code={0xE631}/>}>File is not exist</Toast>
        </>)
    }

    return (<App 
        appBar={<AppBar 
            taskLists={lists}
            expandNavigation={isExpandSideNavigation()}
            command={command}
            page={page()}
            settings={settings}
        />}
        leftSideBar={<SideNavigation 
            expand={isExpandSideNavigation()}
            taskLists={lists}
            command={command}
            page={page()}
            settings={settings}
        />}>    
        <Body 
            settings={settings}
            page={page()} 
            labels={labels}
            taskLists={lists}
            command={command}
        />
        <Dialogs/>
        <ColorPickers/>
        <Toasts/>
        <EmojiPickers/>
    </App>)
}

export default _