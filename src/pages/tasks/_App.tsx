import { createStore } from "solid-js/store"
import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { TaskList, TaskLabel, Settings, Task, TaskFileMetaData, SubTask } from "./_types"
import type { HEXColor } from "@/types/color"
import { type ObjectStoreTaskLists, type ObjectStoreSettings, type ObjectStoreSubTasks, type ObjectStoreTasks, type ObjectStoreTaskLabels, type ObjectStoreFiles, type ObjectStoreTaskFileMetaData, type ObjectStoreMiscellaneous, ObjectStoreNames, ObjectStoreKeys, } from "./_storage"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_TASK_LIST } from "./_constants"
import { IDB, idb_store_delete, idb_store_put } from "@/utils/indexeddb"
import { date_text_YMD_HM } from "@/utils/datetime"
import { file_download } from "@/utils/file"
import { event_current_target, event_prevent_default } from "@/utils/event"
import { array_concat, array_every, array_filter, array_find_index, array_includes, array_join, array_length, array_map, array_push, array_slice, array_sort, array_splice } from "@/utils/array"
import { string_locale_compare, string_trim } from "@/utils/string"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { promise_done } from "@/utils/object"
import { number_is_not_defined, number_parse } from "@/utils/number"
import { remove_splash_screen } from "@/scripts/splash"
import { AppColors } from "@/enums/colors"
import { document_active } from "@/utils/document"
import { element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { is_string } from "@/utils/typecheck"
import { ICON_CIRCLE, ICON_CIRCLE_ERASER, ICON_DELETE, ICON_DISMISS, ICON_DOCUMENT_ERROR, ICON_EDIT, ICON_EMOJI_ADD } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField, { change_textfield_value, TextFieldButton } from "@/components/TextField"
import { EmojiPicker, close_emojipicker, open_emojipicker } from "@/components/EmojiPicker"
import List from "@/components/List"
import Toast, { open_toast } from "@/components/Toast"
import Dialog, { close_dialog, open_dialog } from "@/components/Dialog"
import ColorPicker, { close_colorpicker, open_colorpicker } from "@/components/ColorPicker"
import Emoji from "@/components/Emoji"
import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Body from './_Body'

// TODO: handle navigation with keyboard only
const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.tasks)
	const [page, set_page] = createSignal<Pages | number>(Pages.tasks)
	const [is_sidenavigation_expanded, set_is_sidenavigation_expanded] = createSignal<boolean>(true)
	const [new_listname_text, set_new_listname_text] = createSignal<string>('')
	const [new_list_emoji, set_new_list_emoji] = createSignal<string | null>(null)
	const [edit_listname_text, set_edit_listname_text] = createSignal<string>('')
	const [edit_list_emoji, set_edit_list_emoji] = createSignal<string | null>(null)
	const [labels, set_labels] = createStore<(TaskLabel | undefined)[]>([])
	const [tasklists, set_tasklists] = createStore<TaskList[]>([DEFAULT_TASK_LIST])
	const [selected_label_to_add, set_selected_label_to_add] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selected_label_to_edit, set_selected_label_to_edit] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selected_tasklist_index_to_delete, set_selected_tasklist_index_to_delete] = createSignal<number>(0)
	const [selected_tasklist_index_to_rename, set_selected_tasklist_index_to_rename] = createSignal<number>(0)
	const [change_labelcolor_option, set_change_labelcolor_option] = createSignal<'new' | 'edit'>('new')
	const [is_emojipicker_newlist_open, set_is_emojipicker_newlist_open] = createSignal<boolean>(false)
	const [is_emojipicker_editlist_open, set_is_emojipicker_editlist_open] = createSignal<boolean>(false)
	const [is_colorpicker_label_open, set_is_colorpicker_label_open] = createSignal<boolean>(false)
	const [is_db_file_error, set_is_db_file_error] = createSignal<boolean>(true)
	const [settings, set_settings] = createStore<Settings>({
		sort_by: SortBy.name,
		sort_mode: SortMode.ascending,
		is_show_deletetaskwarning: true,
		hidden_navigation: []
	})
	let is_every_task_loaded: boolean = false
	let textfield_newlabel_ref: HTMLInputElement
	let textfield_editlabel_ref: HTMLInputElement
	let textfield_newlist_ref: HTMLInputElement
	let textfield_editlist_ref: HTMLInputElement
	let dialog_labels_ref: HTMLDialogElement
	let dialog_newlabel_ref: HTMLDialogElement
	let dialog_editlabel_ref: HTMLDialogElement
	let dialog_newlist_ref: HTMLDialogElement
	let dialog_editlist_ref: HTMLDialogElement
	let dialog_deletelist_ref: HTMLDialogElement
	let colorpicker_label_ref: HTMLDialogElement
	let toast_nofile_ref: HTMLDivElement
	let emojipicker_ref: HTMLDialogElement

	function sort_tasks(tasks: Task[]): Task[] {
		const is_reverse = settings.sort_mode == SortMode.descending
		switch (settings.sort_by) {
			case SortBy.name: {
				array_sort(
					tasks,
					(a, b) => string_locale_compare(a.name, b.name) * (is_reverse? -1 : 1)
				)
				break
			}
			case SortBy.importance: {
				array_sort(tasks, (a, b) => string_locale_compare(a.name, b.name) * (is_reverse? 1 : -1))
				array_sort(tasks, (a) => (a.important? -1 : 1) * (is_reverse? -1 : 1))
				break
			}
			case SortBy.creation_date: {
				array_sort(tasks, (a, b) => !is_reverse? b.id - a.id : a.id - b.id)
				break
			}
			case SortBy.completed: {
				array_sort(tasks, (a, b) => string_locale_compare(a.name, b.name) * (is_reverse? 1 : -1))
				array_sort(tasks, (a) => (a.complete? -1 : 1) * (is_reverse? -1 : 1))
				break
			}
			case SortBy.uncompleted: {
				array_sort(tasks, (a, b) => string_locale_compare(b.name, a.name) * (is_reverse? 1 : -1))
				array_sort(tasks, (a) => (!a.complete? -1 : 1) * (is_reverse? -1 : 1))
				break
			}
		}

		return tasks
	}

	function mark_all_task_as(tasklist_index: number, complete: boolean): void {
		const [store_tasks, store_subtasks] = db.stores('readwrite',
			ObjectStoreNames.tasks, ObjectStoreNames.subtasks
		)
		const tasks: Task[] = []

		for (const task of tasklists[tasklist_index].tasks){
			if (task.complete == complete) {
				array_push(tasks, task)
				continue
			}

			const t: Task = {
				...task,
				complete: complete,
				subtasks: [...array_map(task.subtasks, (v) => {
					const subtask = {...v}
					subtask.complete = complete
					if (store_subtasks) idb_store_put(store_subtasks, {...v} satisfies ObjectStoreSubTasks)
					return subtask
				})]
			}
			if (store_tasks) idb_store_put(store_tasks, {
				id: t.id,
				complete: t.complete,
				description: t.description,
				important: t.important,
				label_ids: [...t.label_ids],
				list_id: t.list_id,
				name: t.name,
				reminder: t.reminder
			} satisfies ObjectStoreTasks)
			array_push(tasks, t)
		}
		set_tasklists(
			tasklist_index,
			'tasks',
			array_includes([SortBy.completed, SortBy.uncompleted], settings.sort_by)
				? sort_tasks(tasks)
				: tasks
		)
	}

	function delete_completed_task(tasklist_index: number): void {
		const [store_tasks, store_subtasks, store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		const tasks: Task[] = []

		for (const task of tasklists[tasklist_index].tasks){
			if (!task.complete) {
				array_push(tasks, task)
				continue
			}
			if (store_tasks) idb_store_delete(store_tasks, task.id)
			if (store_subtasks){
				for (const subtask of task.subtasks) {
					idb_store_delete(store_subtasks, subtask.id)
				}
			}
			for (const file of task.files) {
				if (store_filemetadata) idb_store_delete(store_filemetadata, file.id)
				if (store_files) idb_store_delete(store_files, file.id)
			}
		}
		set_tasklists(tasklist_index, 'tasks', tasks)
	}

	function clear_tasks(tasklist_index: number): void {
		const [store_tasks, store_subtasks, store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		set_tasklists(tasklist_index, 'tasks', [])

		for (const task of tasklists[tasklist_index].tasks){
			if (store_tasks) idb_store_delete(store_tasks, task.id)
			if (store_subtasks){
				for (const subtask of task.subtasks) {
					idb_store_delete(store_subtasks, subtask.id)
				}
			}
			for (const file of task.files) {
				if (store_filemetadata) idb_store_delete(store_filemetadata, file.id)
				if (store_files) idb_store_delete(store_files, file.id)
			}
		}
	}

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.write_store(ObjectStoreNames.settings)
		if (!store) return

		for (const item of items) {
			idb_store_put(store, { key: item[0], value: item[1] })
		}
	}

	function save_miscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.write_store(ObjectStoreNames.miscellaneous)
		if (store == null) return

		for (const item of items) {
			idb_store_put(store, { key: item[0], value: item[1] })
		}
	}

	async function add_task(task: Task, tasklist_index: number): Promise<void> {
		const store = db.write_store(ObjectStoreNames.tasks)

		try {
			let id = 0
			if (store) id = ((await db.add<Omit<ObjectStoreTasks, 'id'>>(store, {
				description: task.description,
				complete: task.complete,
				important: task.important,
				label_ids: [...task.label_ids],
				list_id: task.list_id,
				name: task.name,
				reminder: task.reminder
			})).target! as any).result as number

			else for (const taskList of tasklists) {
				tasks: for (const task of taskList.tasks) {
					if (task.id < id) continue tasks;

					id = task.id + 1
				}
			}

			const $$task: Task = {...task, id, subtasks: []}
			set_tasklists(tasklist_index, 'tasks', t => sort_tasks([...t, $$task]))
		} catch {}
	}

	function edit_subtask(
		subtask: SubTask,
		tasklist_index: number,
		task_index: number,
		subtask_index: number
	): void {
		const [store_tasks, store_subtasks] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
		)
		const is_name_changed = subtask.name != tasklists[tasklist_index].tasks[task_index].subtasks[subtask_index].name
		const subtasks = (is_name_changed
			? [...tasklists[tasklist_index].tasks[task_index].subtasks]
			: []
		)

		if (is_name_changed){
			subtasks[subtask_index] = subtask
			array_sort(subtasks, (a, b) => string_locale_compare(a.name, b.name))
		}

		if (is_name_changed) set_tasklists(tasklist_index, 'tasks', task_index, 'subtasks', subtasks)
		else set_tasklists(tasklist_index, 'tasks', task_index, 'subtasks', subtask_index, {...subtask})

		if (store_subtasks) idb_store_put(store_subtasks, {...subtask})
		if (!(!subtask.complete && tasklists[tasklist_index].tasks[task_index].complete)) return;

		const task: Task = {...tasklists[tasklist_index].tasks[task_index], complete: false}
		if (array_includes([SortBy.completed, SortBy.uncompleted], settings.sort_by)) {
			const tasks: Task[] = [...tasklists[tasklist_index].tasks]
			tasks[task_index] = task
			set_tasklists(tasklist_index, 'tasks', sort_tasks(tasks))
		}
		else set_tasklists(tasklist_index, 'tasks', task_index, task)

		if (store_tasks) idb_store_put(store_tasks, {
			id: task.id,
			description: task.description,
			complete: task.complete,
			important: task.important,
			label_ids: [...task.label_ids],
			list_id: task.list_id,
			name: task.name,
			reminder: task.reminder,
		} satisfies ObjectStoreTasks)
	}

	function edit_file(
		file: TaskFileMetaData,
		tasklist_index: number,
		task_index: number,
		file_index: number
	): void {
		const is_name_changed = tasklists[tasklist_index].tasks[task_index].files[file_index].name != file.name
		const files: TaskFileMetaData[] = (is_name_changed
			? [...tasklists[tasklist_index].tasks[task_index].files]
			: tasklists[tasklist_index].tasks[task_index].files
		)

		if (is_name_changed) {
			files[file_index] = {...file}
			array_sort(files, (a, b) => string_locale_compare(a.name, b.name))
		}

		set_tasklists(tasklist_index, 'tasks', task_index, 'files', files)
		const store_filemetadata = db.write_store(ObjectStoreNames.filemetadata)
		if (store_filemetadata) idb_store_put(store_filemetadata, {...file})
	}

	/**
	 * Don't use this function to edit single subtask/file. Use `edit_subtask()`/`edit_file()` instead.
	 */
	function edit_task(task: Task, taskListIndex: number, taskIndex: number): void {
		const past_task = tasklists[taskListIndex].tasks[taskIndex]
		const is_task_complete_status_changed = past_task.complete != task.complete
		const is_task_importance_status_changed = past_task.important != task.important
		const is_task_name_changed = past_task.name != task.name
		const changed_subtasks: SubTask[] = (is_task_complete_status_changed
			? array_map(task.subtasks, subtask => ({...subtask, complete: !past_task.complete && task.complete} satisfies SubTask))
			: [])
		const deleted_subtasks: SubTask[] = []
		const deleted_files: TaskFileMetaData[] = []
		const [store_tasks, store_subtasks, store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		if (array_length(past_task.subtasks) > array_length(task.subtasks)) {
			const ids = array_map(task.subtasks, subtask => subtask.id)

			for (let i = 0; i < array_length(past_task.subtasks); i++) {
				if (array_includes(ids, past_task.subtasks[i].id)) continue;

				array_push(deleted_subtasks, past_task.subtasks[i])
			}
		}

		if (array_length(past_task.files) > array_length(task.files)) {
			const ids = array_map(task.files, file => file.id)

			for (let i = 0; i < array_length(past_task.files); i++) {
				if (array_includes(ids, past_task.files[i].id)) continue;

				array_push(deleted_files, past_task.files[i])
			}
		}

		const new_task: Task = {
			...task,
			reminder: task.reminder != null? new Date(task.reminder) : null,
			subtasks: is_task_complete_status_changed
				? [...changed_subtasks]
				: task.subtasks
		}

		if (
			(is_task_complete_status_changed && array_includes([SortBy.uncompleted, SortBy.completed], settings.sort_by))
			|| (is_task_importance_status_changed && settings.sort_by == SortBy.importance)
			|| (is_task_name_changed && settings.sort_by == SortBy.name)
		){
			const tasks: Task[] = [...tasklists[taskListIndex].tasks]
			tasks[taskIndex] = new_task
			set_tasklists(taskListIndex, 'tasks', sort_tasks(tasks))
		}
		else {
			set_tasklists(taskListIndex, 'tasks', taskIndex, new_task)
		}

		if (store_subtasks) {
			for (const subtask of changed_subtasks) {
				idb_store_put(store_subtasks, {...subtask})
			}

			for (const subtask of deleted_subtasks) {
				idb_store_delete(store_subtasks, subtask.id)
			}
		}

		for (const file of deleted_files) {
			if (store_filemetadata != null) idb_store_delete(store_filemetadata, file.id)
			if (store_files != null) idb_store_delete(store_files, file.id)
		}

		if (store_tasks) idb_store_put(store_tasks, {
			id: task.id,
			description: task.description,
			complete: task.complete,
			important: task.important,
			list_id: task.list_id,
			name: task.name,
			reminder: task.reminder,
			label_ids: [...task.label_ids],
		} satisfies ObjectStoreTasks)
	}

	function delete_task(task: Task, tasklist_index: number, task_index: number): void {
		const [store_tasks, store_subtasks, store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		set_tasklists(
			tasklist_index,
			'tasks',
			tasks => [
				...array_slice(tasks, 0, task_index),
				...array_slice(tasks, task_index + 1)
			]
		)

		if (store_tasks) idb_store_delete(store_tasks, task.id)
		if (store_subtasks) for (const subtask of task.subtasks) {
			idb_store_delete(store_subtasks, subtask.id)
		}

		for (const file of task.files) {
			if (store_files) idb_store_delete(store_files, file.id)
			if (store_filemetadata) idb_store_delete(store_filemetadata, file.id)
		}
	}

	function copy_tasks(tasklist_index?: number): void {
		const is_grouping = array_includes([
			Pages.all, Pages.completed, Pages.uncompleted,
			Pages.important, Pages.planned
		], page() as Pages)

		let text: string = ''
		const get_text_per_tasklist = (tasklist_index: number) => {
			const tasklist = tasklists[tasklist_index]
			text += `${tasklist.emoji != null ? tasklist.emoji : '📑'} ${tasklist.name}`

			for (let i = 0; i < array_length(tasklist.tasks); i++) {
				const task: Task = tasklist.tasks[i]
				const task_complete = task.complete
				const task_important = task.important
				const task_reminder = task.reminder
				const task_description = task.description

				// skipping
				if (is_grouping
					&& (
						(page() == Pages.completed && !task_complete)
						|| (page() == Pages.uncompleted && task_complete)
						|| (page() == Pages.important && !task_important)
						|| (page() == Pages.planned && task_reminder == null)
					)
				) continue

				let additional: string = ''
				text += (`\n${task_complete ? '✔️' : '❌'} ${task.name}`)

				if (task_description != '') additional += `[🗒️ ${task_description}]`
				if (task_important) additional +=  '[⭐ important]'
				if (task_reminder != null) additional += `[🕒 ${date_text_YMD_HM(task_reminder!)}]`
				for (const file of task.files) additional += `[💾 ${file.name}]`

				let j = 0
				labels: for (const id of task.label_ids) {
					if (labels[id] == undefined) continue labels;
					if (j >= array_length(task.label_ids)) break labels;

					additional += `[🔖 ${labels[id].name}]`
					j++
				}

				if (additional != '') text = array_join([text, additional], ' ')
				for (const subtask of task.subtasks) {
					text += (`\n➡️${subtask.complete ? '✔️' : '❌'} ${subtask.name}`)
				}
			}
		}

		if (tasklist_index == null) {
			let j = 0
			for (let i = 0; i < array_length(tasklists); i++) {
				const tasklist: TaskList = tasklists[i]
				const tasks = tasklist.tasks
				if (array_length(tasks) == 0) continue;
				if (is_grouping
					&& (
						(page() == Pages.completed      && array_every(tasks, task => !task.complete))
						|| (page() == Pages.uncompleted && array_every(tasks, task => task.complete))
						|| (page() == Pages.important   && array_every(tasks, task => !task.important))
						|| (page() == Pages.planned     && array_every(tasks, task => task.reminder == null))
					)
				) continue;
				if (j > 0) text += '\n\n'
				get_text_per_tasklist(i)
				++j
			}
		}
		else get_text_per_tasklist(tasklist_index)

		// # ⚠️ task-list-name #
		// ✔️ task-name [🗒️ description][⭐ important][🕒 reminder][💾 file1][💾 file2][🔖 label1][🔖 label2]
		// ➡️✔️ subtask-name
		// ➡️❌ subtask-name
		// ❌ task-name
		navigator_clipboard_writetext(text)
	}

	async function add_label(name: string, color: HEXColor | null): Promise<void> {
		const store_labels = db.write_store(ObjectStoreNames.labels)

		try {
			let id: number = 1
			let is_added = false

			// since key generator value never decrease,
			// we have to check empty key to use it.
			// keep the labels compact.
			for (let i = 1; i < array_length(labels); i++) {
				if (labels[i] != undefined) continue;

				is_added = true
				id = i
				if (store_labels) await db.add<ObjectStoreTaskLabels>(store_labels, {id, name, color})
				break
			}

			if (!is_added) {
				if (store_labels != null) id = ((await db.add<Omit<ObjectStoreTaskLabels, 'id'>>(
					store_labels, {name, color}
				)).target as any).result as number
				else for (const label of labels){
					if (label == undefined) continue
					if (label.id < id) continue
					id = label.id + 1
				}
			}

			const $labels: (TaskLabel | undefined)[] = [...labels]
			$labels[id] = {id, color, name}
			set_labels($labels)
		} catch {}
	}

	function edit_label(label: TaskLabel): void {
		const $labels = [...labels]
		$labels[label.id] = label
		set_labels($labels)

		const store_labels = db.write_store(ObjectStoreNames.labels)
		if (store_labels) idb_store_put(store_labels, {...label})
	}

	function delete_label(label: TaskLabel): void {
		const [store_tasks, store_labels] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.labels
		)
		const $labels = [...labels]
		array_splice($labels, label.id, 1)

		for (let i = 0; i < array_length(tasklists); i++) {
			const tasks = tasklists[i].tasks
			tasks: for (let j = 0; j < array_length(tasks); j++) {
				const task = tasks[j]
				const task_label_ids = tasks[j].label_ids
				const index = array_find_index(task_label_ids, id => id == label.id)
				if (index < 0) continue tasks

				const label_ids = array_concat(
					array_slice(task_label_ids, 0, index),
					array_slice(task_label_ids, index + 1)
				)
				set_tasklists(i, 'tasks', j, 'label_ids', label_ids)
				if (store_tasks) idb_store_put(store_tasks, {
					id: task.id,
					description: task.description,
					complete: task.complete,
					important: task.important,
					label_ids: [...label_ids],
					list_id: task.list_id,
					name: task.name,
					reminder: task.reminder
				} satisfies ObjectStoreTasks)
			}
		}
		set_labels($labels)
		if (store_labels) idb_store_delete(store_labels, label.id)
	}

	async function add_files(
		files: FileList,
		task: Task,
		tasklist_index: number,
		task_index: number
	): Promise<TaskFileMetaData[]> {
		if (array_length(files as unknown as any[]) == 0) return []

		const [store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		const $files: TaskFileMetaData[] = [...tasklists[tasklist_index].tasks[task_index].files]

		try {
			if (store_filemetadata == null || store_files == null) return $files
			for (const file of files) {
				const id = ((await db.add<Omit<ObjectStoreTaskFileMetaData, 'id'>>(store_filemetadata, {
					list_id: task.list_id,
					name: file.name,
					size: file.size,
					task_id: task.id,
					type: file.type
				})).target! as any).result as number

				idb_store_put(store_files, {
					id,
					blob: new Blob([file])
				} satisfies ObjectStoreFiles)

				array_push($files, {
					id: id,
					list_id: task.list_id,
					name: file.name,
					size: file.size,
					task_id: task.id,
					type: file.type
				})
			}
			set_tasklists(
				tasklist_index, 'tasks', task_index, 'files',
				array_sort($files, (a, b) => string_locale_compare(a.name, b.name))
			)
		} catch {}

		return $files
	}

	function download_task_file(
		ev: Event,
		file: TaskFileMetaData,
		tasklist_index: number,
		task_index: number,
		file_index: number
	): void {
		const [store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		if (store_files == null || store_filemetadata == null) return;

		promise_done(db.get<ObjectStoreFiles>(store_files, file.id), (result) => {
			if (!result) {
				if (file.id == tasklists[tasklist_index].tasks[task_index].files[file_index].id) {

					// This statement not update the file lists in <dialog>
					set_tasklists(tasklist_index, 'tasks', task_index, 'files', files => [
						...array_slice(files, 0, file_index),
						...array_slice(files, file_index + 1)
					])
					idb_store_delete(store_filemetadata, file.id)
				}

				open_toast(ev, toast_nofile_ref)
				return;
			}

			file_download(new Blob([result.blob]), file.name)
		})
	}

	async function get_blob(
		ev: Event,
		file: TaskFileMetaData,
		tasklist_index: number,
		task_index: number,
		file_index: number
	): Promise<Blob | null> {
		const [store_files, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		if (store_files == null || store_filemetadata == null) return null

		try {
			const result = await db.get<ObjectStoreFiles>(store_files, file.id)
			if (!result) {
				if (file.id == tasklists[tasklist_index].tasks[task_index].files[file_index].id) {

					// This statement not update the file lists in <dialog>
					set_tasklists(
						tasklist_index, 'tasks', task_index, 'files',
						files => array_concat(
							array_slice(files, 0, file_index),
							array_slice(files, file_index + 1)
						),
					)
					idb_store_delete(store_filemetadata, file.id)
				}

				open_toast(ev, toast_nofile_ref)
				return null
			}

			return new Blob([result.blob])
		} catch {}

		return null
	}

	async function add_subtask(subtask: SubTask, tasklist_index: number, task_index: number): Promise<SubTask[]> {
		const store_subtasks = db.write_store(ObjectStoreNames.subtasks)

		try {
			let id = 0
			if (store_subtasks != null) id = ((await db.add<Omit<ObjectStoreSubTasks, 'id'>>(store_subtasks, {
				complete: subtask.complete,
				list_id: subtask.list_id,
				name: subtask.name,
				task_id: subtask.task_id
			})).target! as any).result as number

			else for (const list of tasklists){
				for (const task of list.tasks){
					subtasks: for (const subtask of task.subtasks){
						if (subtask.id < id) continue subtasks
						id = subtask.id + 1
					}
				}
			}

			const $subtask = {...subtask}
			$subtask.id = id
			set_tasklists(
				tasklist_index, 'tasks', task_index, 'subtasks',
				subtasks => array_sort([...subtasks, $subtask], (a, b) => string_locale_compare(a.name, b.name))
			)

			if (tasklists[tasklist_index].tasks[task_index].complete) {
				const task: Task = {...tasklists[tasklist_index].tasks[task_index], complete: false}
				if (array_includes([SortBy.completed, SortBy.uncompleted], settings.sort_by)) {
					const tasks: Task[] = [...tasklists[tasklist_index].tasks]
					tasks[task_index] = task
					set_tasklists(tasklist_index, 'tasks', sort_tasks(tasks))
				}
				else set_tasklists(tasklist_index, 'tasks', task_index, task)
			}
		} catch {}

		return tasklists[tasklist_index].tasks[task_index].subtasks
	}

	function sort_all_tasks(): void {
		for (let i = 0; i < array_length(tasklists); i++) {
			set_tasklists(i, 'tasks', sort_tasks([...tasklists[i].tasks]))
		}
	}

	function reverse_all_tasks(): void {
		for (let i = 0; i < array_length(tasklists); i++) {
			set_tasklists(i, 'tasks', sort_tasks([...tasklists[i].tasks]))
		}
	}

	async function add_new_tasklist(name: string, emoji: string | null): Promise<void> {
		const store_taskLists = db.write_store(ObjectStoreNames.tasklists)
		let count = 0

		name = string_trim(name)
		for (const list of tasklists) {
			if (count == 0 && list.name == name) ++count
			if (list.name == name + ` (${count})`) ++count
		}

		if (count > 0) name += ` (${count})`

		try {
			let id = 0
			if (store_taskLists != null) id = ((await db.add<Omit<ObjectStoreTaskLists, 'id'>>(store_taskLists, {
				emoji,
				name
			})).target! as any).result as number

			else for (const list of tasklists) {
				if (list.id < id) continue

				id = list.id + 1
			}

			// make the default list always on top
			const index = array_find_index(tasklists, list => list.id == DEFAULT_TASK_LIST.id)
			if (index >= 0) {
				const other_lists = array_concat(
					array_slice(tasklists, 0, index),
					array_slice(tasklists, index + 1),
					[{ id, emoji, name, tasks: []} satisfies TaskList]
				)
				array_sort(other_lists, (a, b) => string_locale_compare(a.name, b.name))
				set_tasklists(array_concat([tasklists[index]], other_lists))
			}
			else set_tasklists(values => array_sort([
				...values,
				{ id, emoji, name, tasks: []} satisfies TaskList
			], (a, b) => string_locale_compare(a.name, b.name)))
			change_page(id)
		} catch {}
	}

	async function command(type: Commands, ...args: unknown[]): Promise<unknown> { switch (type) {
		case Commands.toggle_navigation_expand: {
			set_is_sidenavigation_expanded(v => !v)
			save_miscellaneous([ObjectStoreKeys.miscellaneous_issidenavigationexpanded, is_sidenavigation_expanded()])
			break
		}
		case Commands.change_page: {
			const [page] = args as [Pages | number]
			change_page(page)
			break
		}
		case Commands.change_sort_by: {
			const [sort_by] = args as [SortBy]
			set_settings('sort_by', sort_by)
			save_settings([ObjectStoreKeys.settings_sortby, sort_by])
			sort_all_tasks()
			break
		}
		case Commands.change_sort_mode: {
			const [sort_mode] = args as [SortMode]
			set_settings('sort_mode', sort_mode)
			save_settings([ObjectStoreKeys.settings_sortmode, sort_mode])
			reverse_all_tasks()
			break
		}
		case Commands.add_task: {
			const [task, tasklist_index] = args as [Task, number]
			add_task(task, tasklist_index)
			break
		}
		case Commands.edit_task: {
			const [task, tasklist_index, task_index] = args as [Task, number, number]
			edit_task(task, tasklist_index, task_index)
			break
		}
		case Commands.delete_task: {
			const [task, tasklist_index, task_index] = args as [Task, number, number]
			delete_task(task, tasklist_index, task_index)
			break
		}
		case Commands.toggle_delete_task_warning: {
			const [value = !settings.is_show_deletetaskwarning] = args as [boolean | undefined]
			set_settings('is_show_deletetaskwarning', value)
			save_settings([ObjectStoreKeys.settings_isshowdeletetaskwarning, value])
			break
		}
		case Commands.change_hidden_navigation: {
			const [pages] = args as [Pages[]]
			if (typeof page() == (typeof Pages.tasks) && array_includes(pages, page() as Pages)) {
				change_page(Pages.tasks)
			}
			set_settings('hidden_navigation', pages)
			save_settings([ObjectStoreKeys.settings_hidden_navigation, [...pages]])
			break
		}
		case Commands.mark_all_completed: {
			const [tasklist_index] = args as [number]
			mark_all_task_as(tasklist_index, true)
			break
		}
		case Commands.mark_all_uncompleted: {
			const [tasklist_index] = args as [number]
			mark_all_task_as(tasklist_index, false)
			break
		}
		case Commands.clear_tasks: {
			const [tasklist_index] = args as [number]
			clear_tasks(tasklist_index)
			break
		}
		case Commands.delete_completed_task: {
			const [tasklist_index] = args as [number]
			delete_completed_task(tasklist_index)
			break
		}
		case Commands.copy_tasks: {
			const [tasklist_index] = args as [number | undefined]
			copy_tasks(tasklist_index)
			break
		}
		case Commands.add_label: {
			const [event] = args as [Event]
			open_dialog(event, dialog_newlabel_ref, {
				content_auto_focus: true,
				important: true
			})
			break
		}
		case Commands.edit_label: {
			const [event, label] = args as [Event, TaskLabel]
			change_textfield_value(textfield_editlabel_ref, label.name)
			set_selected_label_to_edit(label)
			open_dialog(event, dialog_editlabel_ref, {
				content_auto_focus: true,
				important: true
			})
			break
		}
		case Commands.delete_label: {
			const [label] = args as [TaskLabel]
			delete_label(label)
			break
		}
		case Commands.show_labels_options: {
			const [event] = args as [Event]
			open_dialog(event, dialog_labels_ref)
			break
		}
		case Commands.add_files: {
			const [
				files,
				task,
				tasklist_index,
				task_index
			] = args as [FileList, Task, number, number]
			return await add_files(files, task, tasklist_index, task_index)
		}
		case Commands.download_file: {
			const [
				event,
				file,
				tasklist_index,
				task_index,
				file_index
			] = args as [Event, TaskFileMetaData, number, number, number]
			download_task_file(event, file, tasklist_index, task_index, file_index)
			break
		}
		case Commands.edit_file: {
			const [
				file, tasklist_index, task_index, file_index
			] = args as [TaskFileMetaData, number, number, number]
			edit_file(file, tasklist_index, task_index, file_index)
			break
		}
		case Commands.edit_subtask: {
			const [
				subtask, tasklist_index, task_index,
				subtask_index
			] = args as [SubTask, number, number, number]
			edit_subtask(subtask, tasklist_index, task_index, subtask_index)
			break
		}
		case Commands.get_file_blob: {
			const [
				event, file, tasklist_index, task_index, file_index
			] = args as [Event, TaskFileMetaData, number, number, number]
			return await get_blob(event, file, tasklist_index, task_index, file_index)
		}
		case Commands.add_subtask: {
			const [
				subtask, tasklist_index, task_index
			] = args as [SubTask, number, number]
			return await add_subtask(subtask, tasklist_index, task_index)
		}
		case Commands.add_tasklist: {
			const [event] = args as [Event]
			open_dialog(event, dialog_newlist_ref, {
				important: true,
				content_auto_focus: true
			})
			break
		}
		case Commands.delete_taskList: {
			const [event, tasklist_index] = args as [Event, number]
			set_selected_tasklist_index_to_delete(tasklist_index)
			open_dialog(event, dialog_deletelist_ref, {
				important: true
			})
			break
		}
		case Commands.rename_taskList: {
			const [event, tasklist_index] = args as [Event, number]
			const list = tasklists[tasklist_index]
			set_selected_tasklist_index_to_rename(tasklist_index)
			set_edit_list_emoji(list.emoji)
			set_edit_listname_text(list.name)
			change_textfield_value(textfield_editlist_ref, list.name)
			open_dialog(event, dialog_editlist_ref, {
				important: true,
				content_auto_focus: true
			})
			break
		}
		/**
			@param {Task} task `Task`
			@param {number} tasklist_index `number`
			@param {number} task_index `number`
			@param {number} target_tasklist_index `number` */
		case Commands.move_task: {
			const [
				task, tasklist_index, task_index, target_tasklist_index
			] = args as [Task, number, number, number]
			move_task(task, tasklist_index, task_index, target_tasklist_index)
			break
		}
		case Commands.get_all_task: {
			get_tasks(true)
			break
		}
		default: return
	}}

	function move_task(
		task: Task,
		tasklist_index: number,
		task_index: number,
		target_tasklist_index: number
	): void {
		const [store_tasks, store_subtasks, store_filemetadata] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
		)
		const target_list = tasklists[target_tasklist_index]

		// Update manually if list has tasks, because
		// `get_tasks()` function only update empty list.
		if (array_length(target_list.tasks) > 0) {
			const subtasks = array_map(
				task.subtasks,
				subtask => ({...subtask, list_id: target_list.id} satisfies SubTask)
			)
			const files = array_map(
				task.files,
				file => ({...file, list_id: target_list.id} satisfies TaskFileMetaData)
			)
			const $task: Task = {...task, subtasks, files}
			set_tasklists(
				target_tasklist_index, 'tasks',
				tasks => sort_tasks([...tasks, $task])
			)
		}

		set_tasklists(
			tasklist_index,
			'tasks',
			tasks => array_concat(
				array_slice(tasks, 0, task_index),
				array_slice(tasks, task_index + 1)
			)
		)
		if (store_tasks) idb_store_put(store_tasks, {
			complete: task.complete,
			description: task.description,
			id: task.id,
			important: task.important,
			label_ids: [...task.label_ids],
			list_id: target_list.id,
			name: task.name,
			reminder: task.reminder
		} satisfies ObjectStoreTasks)

		if (store_subtasks) for (const subtask of task.subtasks) idb_store_put(store_subtasks, {
			...subtask,
			list_id: target_list.id
		} satisfies ObjectStoreSubTasks)

		if (store_filemetadata) for (const file of task.files) idb_store_put(store_filemetadata, {
			...file,
			list_id: target_list.id
		} satisfies ObjectStoreTaskFileMetaData)
	}

	function init_database(): void {
		db.open({
			on_success(_, db) {
				init_tasklists()
				init_labels()
				init_settings()
				init_miscellaneous()
				set_is_db_file_error(db.read_store(ObjectStoreNames.filemetadata) == null)
			},
			on_error() {
				set_is_db_file_error(true)
			},
			on_upgrade_needed(_, db) {
				const store = db.create_store<ObjectStoreTaskLists>({
					name: ObjectStoreNames.tasklists,
					key_path: 'id',
					indexs: ['id', 'name', 'emoji']
				})

				idb_store_put(store!, {
					id: DEFAULT_TASK_LIST.id,
					name: DEFAULT_TASK_LIST.name,
					emoji: DEFAULT_TASK_LIST.emoji,
				} satisfies ObjectStoreTaskLists)

				db.create_store<ObjectStoreTasks>({
					name: ObjectStoreNames.tasks,
					key_path: 'id',
					indexs: ['id', 'list_id', 'name', 'complete', 'reminder', 'important', 'description', 'label_ids']
				})
				db.create_store<ObjectStoreSubTasks>({
					name: ObjectStoreNames.subtasks,
					key_path: 'id',
					indexs: ['id', 'task_id', 'name', 'complete', 'list_id']
				})
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreTaskLabels>({
					name: ObjectStoreNames.labels,
					key_path: 'id',
					indexs: ['id', 'name', 'color']
				})
				db.create_store<ObjectStoreFiles>({
					name: ObjectStoreNames.files,
					key_path: 'id',
					indexs: ['id', 'blob']
				})
				db.create_store<ObjectStoreTaskFileMetaData>({
					name: ObjectStoreNames.filemetadata,
					key_path: 'id',
					indexs: ['id', 'list_id', 'task_id', 'name', 'size', 'type']
				})
			},
		})
	}

	function init_last_page(): void {
		const store_miscellaneous = db.read_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return;

		promise_done(db.get<ObjectStoreMiscellaneous<Pages | number>>(
			store_miscellaneous,
			ObjectStoreKeys.miscellaneous_lastpage
		), (result) => {
			if (!result) return get_tasks()

			set_page(result.value)
			get_tasks()
		})
	}

	function init_miscellaneous(): void {
		const store_miscellaneous = db.read_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return;

		promise_done(db.get<ObjectStoreMiscellaneous<boolean>>(
			store_miscellaneous,
			ObjectStoreKeys.miscellaneous_issidenavigationexpanded
		), (result) => set_is_sidenavigation_expanded(d => result?.value ?? d))
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return;

		promise_done(db.get<ObjectStoreSettings<SortBy>>(
			store_settings,
			ObjectStoreKeys.settings_sortby
		), (result) => set_settings('sort_by', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<SortMode>>(
			store_settings,
			ObjectStoreKeys.settings_sortmode
		), (result) => set_settings('sort_mode', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_isshowdeletetaskwarning
		), (result) => set_settings('is_show_deletetaskwarning', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<Pages[]>>(
			store_settings,
			ObjectStoreKeys.settings_hidden_navigation
		), (result) => set_settings('hidden_navigation', d => result? [...result.value] : d))
	}

	function init_tasklists(): void {
		const store_tasklists = db.read_store(ObjectStoreNames.tasklists)
		if (store_tasklists == null) return;

		promise_done(db.get_all<ObjectStoreTaskLists>(store_tasklists), (result) => {
			if (!result) return;

			let lists: TaskList[] = []
			for (const i of result) array_push(lists, {...i, tasks: []})

			// just assume user able to explicitly delete default task list
			const index = array_find_index(lists, list => list.id == DEFAULT_TASK_LIST.id)
			if (index >= 0) {
				const other_lists = array_concat(
					array_slice(lists, 0, index),
					array_slice(lists, index + 1)
				)
				array_sort(other_lists, (a, b) => string_locale_compare(a.name, b.name))
				lists = array_concat([lists[index]], other_lists)
			}
			else array_sort(lists, (a, b) => string_locale_compare(a.name, b.name))

			set_tasklists(lists)
			init_last_page()
		})
	}

	function init_labels(): void {
		const store_labels = db.read_store(ObjectStoreNames.labels)
		if (store_labels == null) return;

		promise_done(db.get_all<ObjectStoreTaskLabels>(store_labels), (v) => {
			if (!v) return;
			const values: TaskLabel[] = []
			for (const label of array_sort([...v], (a, b) => string_locale_compare(a.name, b.name))) {
				values[label.id] = label
			}
			set_labels(values)
		})
	}

	function delete_tasklist(): void {
		const [
			store_tasklists, store_tasks, store_subtasks,
			store_filemetadata, store_files
		] = db.stores('readwrite',
			ObjectStoreNames.tasklists,
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
			ObjectStoreNames.files,
		)
		const list = tasklists[selected_tasklist_index_to_delete()]
		change_page(Pages.tasks)

		if (store_tasklists) idb_store_delete(store_tasklists, list.id)

		for (const task of list.tasks) {
			if (store_tasks) idb_store_delete(store_tasks, task.id)

			if (store_subtasks) {
				for (const subtask of task.subtasks)
					idb_store_delete(store_subtasks, subtask.id)
			}

			for (const file of task.files) {
				if (store_filemetadata) idb_store_delete(store_filemetadata, file.id)
				if (store_files) idb_store_delete(store_files, file.id)
			}
		}

		set_tasklists(lists => array_concat(
			array_slice(lists, 0, selected_tasklist_index_to_delete()),
			array_slice(lists, selected_tasklist_index_to_delete() + 1)
		))
	}

	// FIXME: To many iteration and I hate it. I don't find any better solution currently
	async function get_tasks(all: boolean = false): Promise<void> {
		if (is_every_task_loaded) return;

		const [
			store_tasks, store_subtasks, store_filemetadata
		] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
		)
		const is_get_all = (
			array_includes([
				Pages.all, Pages.completed, Pages.uncompleted,
				Pages.important, Pages.planned
			], page() as Pages)
			|| all
		)
		const list_id = page() == Pages.tasks? DEFAULT_TASK_LIST.id : page() as number
		const list_idIndex: {[id: number]: number} = {}

		for (let i = 0; i < array_length(tasklists); i++) {
			if (array_length(tasklists[i].tasks) > 0) continue
			if (is_get_all) list_idIndex[tasklists[i].id] = i
			else if (tasklists[i].id == list_id) {
				list_idIndex[tasklists[i].id] = i
				break
			}
		}

		is_every_task_loaded = array_length(Object.keys(list_idIndex)) == 0
		if (is_every_task_loaded || store_tasks == null) return;

		try {

			// TASKS
			const tasks_id_index: {[id: number]: number} = {}
			const tasks: Task[] = []
			await db.cursor(store_tasks, (cursor) => {
				if (!cursor) return false
				const task = cursor.value as ObjectStoreTasks
				const add = () => {
					if (list_idIndex[task.list_id] == undefined) return;
					array_push(tasks, {...task, files: [], subtasks: []})
				}
				if (is_get_all) add()
				else if (task.list_id == list_id) add()
				return true
			})
			sort_tasks(tasks)
			for (let i = 0; i < array_length(tasks); i++) {
				tasks_id_index[tasks[i].id] = i
			}

			// SUBTASKS
			const subtasks: SubTask[] = []
			if (store_subtasks != null) await db.cursor(store_subtasks, (cursor) => {
				if (!cursor) return false
				const subtask = cursor.value as ObjectStoreSubTasks
				const add = () => {
					if (list_idIndex[subtask.list_id] == undefined) return;
					array_push(subtasks, subtask)
				}
				if (is_get_all) add()
				else if (subtask.list_id == list_id) add()
				return true
			})
			array_sort(subtasks, (a, b) => string_locale_compare(a.name, b.name))
			for (const subtask of subtasks) {
				array_push(tasks[tasks_id_index[subtask.task_id]].subtasks, subtask)
			}

			// FILES
			const filemetadatas: TaskFileMetaData[] = []
			if (store_filemetadata != null) await db.cursor(store_filemetadata, (cursor) => {
				if (!cursor) return false
				const filemetadata = cursor.value as ObjectStoreTaskFileMetaData
				const add = () => {
					if (list_idIndex[filemetadata.list_id] == undefined) return;
					array_push(filemetadatas, {...filemetadata})
				}
				if (is_get_all) add()
				else if (filemetadata.list_id == list_id) add()
				return true
			})
			array_sort(filemetadatas, (a, b) => string_locale_compare(a.name, b.name))
			for (const filemetadata of filemetadatas) {
				array_push(tasks[tasks_id_index[filemetadata.task_id]].files, filemetadata)
			}

			for (const id of array_map(Object.keys(list_idIndex), v => number_parse(v, true))) {
				set_tasklists(list_idIndex[id], 'tasks', array_filter(tasks, task => task.list_id == id))
			}

		} catch (e) {console.log(e)}
	}

	function change_page(page: Pages | number): void {
		set_page(page)
		get_tasks()

		const store_miscellaneous = db.write_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return;

		idb_store_put(store_miscellaneous, {
			key: ObjectStoreKeys.miscellaneous_lastpage,
			value: page
		})
	}

	function rename_tasklist(): void {
		const store_tasklists = db.write_store(ObjectStoreNames.tasklists)
		const list = tasklists[selected_tasklist_index_to_rename()]
		const id = list.id
		const emoji = edit_list_emoji()
		let name = string_trim(edit_listname_text())

		if (name != list.name) {
			let count = 0
			for (const tasklist of tasklists) {
				if (count == 0 && tasklist.name == name) ++count
				if (tasklist.name == name + ` (${count})`) ++count
			}
			if (count > 0) name += ` (${count})`
		}

		let $lists = [...tasklists]
		$lists[selected_tasklist_index_to_rename()] = {...$lists[selected_tasklist_index_to_rename()], emoji, name}

		// keep general tasks on top
		const index = array_find_index($lists, list => list.id == DEFAULT_TASK_LIST.id)
		if (index >= 0) {
			const other_lists = array_concat(
				array_slice($lists, 0, index),
				array_slice($lists, index + 1)
			)
			array_sort(other_lists, (a, b) => string_locale_compare(a.name, b.name))
			$lists = array_concat([$lists[index]], other_lists)
		}
		else array_sort($lists, (a, b) => string_locale_compare(a.name, b.name))

		set_tasklists($lists)
		if (store_tasklists) idb_store_put(store_tasklists, {emoji, id, name} satisfies ObjectStoreTaskLists)
	}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	const LabelItem: VoidComponent<{index: number, label: TaskLabel}> = (props) => {
		const label = createMemo(() => props.label)
		return (<List
			c_leading={<Icon style={{color: label().color ?? undefined}} c_code={ICON_CIRCLE}/>}
			c_trailing={<>
				<IconButton
					data-tooltip="Edit label"
					data-edit
					data-index={props.index}
					onClick={(ev) => command(Commands.edit_label, ev, label())}
					c_code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Delete label"
					data-delete
					data-index={props.index}
					onClick={() => command(Commands.delete_label, label())}
					c_code={ICON_DELETE}
				/>
			</>}>
			{ label().name }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const button_dialoglabels_close_id = createUniqueId()
		const button_dialoglabels_add_id = createUniqueId()
		const button_dialognewlabel_cancel_id = createUniqueId()
		const button_dialognewlabel_add_id = createUniqueId()
		const button_dialognewlabel_color_id = createUniqueId()
		const button_dialogeditlabel_cancel_id = createUniqueId()
		const button_dialogeditlabel_edit_id = createUniqueId()
		const button_dialogeditlabel_color_id = createUniqueId()
		const button_dialognewlist_cancel_id = createUniqueId()
		const button_dialognewlist_add_id = createUniqueId()
		const button_dialognewlist_emoji_id = createUniqueId()
		const button_dialogeditlist_cancel_id = createUniqueId()
		const button_dialogeditlist_rename_id = createUniqueId()
		const button_dialogeditlist_emoji_id = createUniqueId()
		const button_dialogdeletelist_cancel_id = createUniqueId()
		const button_dialogdeletelist_delete_id = createUniqueId()
		return (<>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_labels_ref = r}
				c_header="Labels"
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialoglabels_close_id:
							close_dialog(dialog_labels_ref)
							break
						case button_dialoglabels_add_id:
							open_dialog(ev, dialog_newlabel_ref, {
								content_auto_focus: true,
								important: true
							})
							break

						// handle actions
						default:
							const data_index = element_dataset(button, 'index')
							const data_edit = element_dataset(button, 'edit')
							const data_delete = element_dataset(button, 'delete')
							if (!data_index)  return

							let index = number_parse(data_index, true)
							if (number_is_not_defined(index)) return

							if (is_string(data_edit)) {
								command(Commands.edit_label, ev, labels[index])
							}
							else if (is_string(data_delete)) {
								command(Commands.delete_label, ev, labels[index])
							}
					}
				}}
				c_actions={<>
					<Button
						id={button_dialoglabels_close_id}
						c_variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_dialoglabels_add_id}
						c_variant={ButtonVariant.filled}>
						Add label
					</Button>
				</>}>
				<Tooltip>
					<For each={labels} fallback={"No labels"}>{(label, i) =>
						<Show when={label != undefined}><LabelItem label={label!} index={i()}/></Show>
					}</For>
				</Tooltip>
			</Dialog>
			<Dialog
				ref={r => dialog_newlabel_ref = r}
				c_header="New label"
				onClose={() => {
					set_selected_label_to_add('name', '')
					change_textfield_value(textfield_newlabel_ref, '')
					set_selected_label_to_add('color', null)
				}}
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialognewlabel_add_id:
							add_label(string_trim(selected_label_to_add.name), selected_label_to_add.color)
							close_dialog(dialog_newlabel_ref)
							break
						case button_dialognewlabel_cancel_id:
							close_dialog(dialog_newlabel_ref)
							break
						case button_dialognewlabel_color_id:
							set_change_labelcolor_option('new')
							open_colorpicker(ev, colorpicker_label_ref, {
								anchor: button,
							})
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_dialognewlabel_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialognewlabel_add_id}
						disabled={string_trim(selected_label_to_add.name) == ''}
						c_variant={ButtonVariant.filled}>
						Add
					</Button>
				</>}>
				<form
					style={{ display: 'contents' }}
					onSubmit={ev => {
						event_prevent_default(ev)
						if (string_trim(selected_label_to_add.name) == '') return;

						add_label(string_trim(selected_label_to_add.name), selected_label_to_add.color)
						close_dialog(dialog_newlabel_ref)
					}}>
					<Tooltip>
						<TextField
							ref={r => textfield_newlabel_ref = r}
							c_label="Name"
							onFocus={() => set_selected_label_to_add('name', textfield_newlabel_ref.value)}
							onInput={() => set_selected_label_to_add('name', textfield_newlabel_ref.value)}
							autofocus
							c_trailing={<TextFieldButton
								id={button_dialognewlabel_color_id}
								data-tooltip="Change label color"
								c_focused={is_colorpicker_label_open()}>
								<Icon
									style={{color: selected_label_to_add.color ?? undefined}}
									c_code={ICON_CIRCLE}
								/>
							</TextFieldButton>}
						/>
					</Tooltip>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialog_editlabel_ref = r}
				c_header="Edit label"
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialogeditlabel_cancel_id:
							close_dialog(dialog_editlabel_ref)
							break
						case button_dialogeditlabel_edit_id:
							edit_label({
								...selected_label_to_edit,
								name: string_trim(selected_label_to_edit.name),
							} satisfies TaskLabel)
							close_dialog(dialog_editlabel_ref)
							break
						case button_dialogeditlabel_color_id:
							set_change_labelcolor_option('edit')
							open_colorpicker(ev, colorpicker_label_ref, {
								anchor: button,
							})
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_dialogeditlabel_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogeditlabel_edit_id}
						disabled={string_trim(selected_label_to_edit.name) == ''}
						c_variant={ButtonVariant.filled}>
						Edit
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={ev => {
						event_prevent_default(ev)
						if (string_trim(selected_label_to_edit.name) == '') return;

						edit_label({
							...selected_label_to_edit,
							name: string_trim(selected_label_to_edit.name),
						} satisfies TaskLabel)
						close_dialog(dialog_editlabel_ref)
					}}>
					<TextField
						ref={r => textfield_editlabel_ref = r}
						c_label="Name"
						onFocus={() => set_selected_label_to_edit('name', textfield_editlabel_ref.value)}
						onInput={() => set_selected_label_to_edit('name', textfield_editlabel_ref.value)}
						autofocus
						c_trailing={<TextFieldButton
							id={button_dialogeditlabel_color_id}
							data-tooltip="Change label color"
							c_focused={is_colorpicker_label_open()}>
							<Icon
								style={{color: selected_label_to_edit.color ?? undefined}}
								c_code={ICON_CIRCLE}
							/>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialog_newlist_ref = r}
				c_header="New list"
				style={{width: '500px'}}
				onClose={() => {
					set_new_listname_text('')
					set_new_list_emoji(null)
					change_textfield_value(textfield_newlist_ref, '')
				}}
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialognewlist_cancel_id:
							close_dialog(dialog_newlist_ref)
							break
						case button_dialognewlist_add_id:
							add_new_tasklist(new_listname_text(), new_list_emoji())
							close_dialog(dialog_newlist_ref)
							break
						case button_dialognewlist_emoji_id:
							set_is_emojipicker_newlist_open(true)
							open_emojipicker(ev, emojipicker_ref)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_dialognewlist_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialognewlist_add_id}
						disabled={string_trim(new_listname_text()) == ''}
						c_variant={ButtonVariant.filled}>
						Add
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={(ev) => {
						event_prevent_default(ev)
						if (string_trim(new_listname_text()) == '') return;

						add_new_tasklist(new_listname_text(), new_list_emoji())
						close_dialog(dialog_newlist_ref)
					}}>
					<TextField
						ref={r => textfield_newlist_ref = r}
						placeholder="List name"
						onInput={ev => set_new_listname_text(event_current_target(ev).value)}
						onFocus={ev => set_new_listname_text(event_current_target(ev).value)}
						c_trailing={<TextFieldButton
							id={button_dialognewlist_emoji_id}>
							<Show
								when={new_list_emoji() == null}
								fallback={<Emoji c_emoji={new_list_emoji()!}/>}>
								<Icon c_code={ICON_EMOJI_ADD}/>
							</Show>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialog_editlist_ref = r}
				c_header="Rename list"
				style={{width: '500px'}}
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialogeditlist_cancel_id:
							close_dialog(dialog_editlist_ref)
							break
						case button_dialogeditlist_rename_id:
							rename_tasklist()
							close_dialog(dialog_editlist_ref)
							break
						case button_dialogeditlist_emoji_id:
							set_is_emojipicker_editlist_open(true)
							open_emojipicker(ev, emojipicker_ref)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_dialogeditlist_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogeditlist_rename_id}
						disabled={
							string_trim(edit_listname_text()) == ''
							|| (
								string_trim(edit_listname_text()) == tasklists[selected_tasklist_index_to_rename()].name
								&& edit_list_emoji() == tasklists[selected_tasklist_index_to_rename()].emoji
							)
						}
						c_variant={ButtonVariant.filled}>
						Rename
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={(ev) => {
						event_prevent_default(ev)
						if (string_trim(edit_listname_text()) == ''
							|| (
								string_trim(edit_listname_text()) == tasklists[selected_tasklist_index_to_rename()].name
								&& edit_list_emoji() == tasklists[selected_tasklist_index_to_rename()].emoji
							)
						) return;
						rename_tasklist()
						close_dialog(dialog_editlist_ref)
					}}>
					<TextField
						ref={r => textfield_editlist_ref = r}
						placeholder="List name"
						onInput={ev => set_edit_listname_text(event_current_target(ev).value)}
						onFocus={ev => set_edit_listname_text(event_current_target(ev).value)}
						c_trailing={<TextFieldButton
							id={button_dialogeditlist_emoji_id}>
							<Show
								when={edit_list_emoji() == null}
								fallback={<Emoji c_emoji={edit_list_emoji()!}/>}>
								<Icon c_code={ICON_EMOJI_ADD}/>
							</Show>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialog_deletelist_ref = r}
				style={{width: '500px'}}
				c_header="Delete list"
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_dialogdeletelist_cancel_id:
							close_dialog(dialog_deletelist_ref)
							break
						case button_dialogdeletelist_delete_id:
							close_dialog(dialog_deletelist_ref)
							delete_tasklist()
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_dialogdeletelist_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogdeletelist_delete_id}
						c_variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				<Show when={tasklists[selected_tasklist_index_to_delete()]}>
					<>Are you sure want to delete <q style={{"font-weight": 'bold', color: `rgb(${AppColors.accent})`}}>{tasklists[selected_tasklist_index_to_delete()].name}</q> list? </>
					<>This list contains {array_length(array_filter(tasklists[selected_tasklist_index_to_delete()].tasks, v => !v.complete))} uncompleted tasks </>
					<>and {array_length(array_filter(tasklists[selected_tasklist_index_to_delete()].tasks, v => v.complete))} completed tasks</>
				</Show>
			</Dialog>
		</>)
	}

	const ColorPickers: VoidComponent = () => {
		return (<>
			<ColorPicker
				c_color={(change_labelcolor_option() == 'new'
					? selected_label_to_add.color
					: selected_label_to_edit.color
				) ?? undefined}
				c_on_toggleopen={is_open => set_is_colorpicker_label_open(is_open)}
				c_on_select_color={color => change_labelcolor_option() == 'new'
					? set_selected_label_to_add('color', color)
					: set_selected_label_to_edit('color', color)
				}
				ref={r => colorpicker_label_ref = r}>
				<Show when={(change_labelcolor_option() == 'new'
					? selected_label_to_add.color
					: selected_label_to_edit.color
				) != null}>
					<Button
						style={{width: '100%'}}
						onClick={() => {
							close_colorpicker(colorpicker_label_ref)
							if (change_labelcolor_option() == 'new') set_selected_label_to_add('color', null)
							else set_selected_label_to_edit('color', null)
						}}
						c_variant={ButtonVariant.tonal}>
						<Icon c_code={ICON_CIRCLE_ERASER}/>No color
					</Button>
				</Show>
			</ColorPicker>
		</>)
	}

	const EmojiPickers: VoidComponent = () => (<>
		<EmojiPicker
			ref={r => emojipicker_ref = r}
			onClose={() => {
				set_is_emojipicker_newlist_open(false)
				set_is_emojipicker_editlist_open(false)
			}}
			c_on_selectemoji={e => {
				if (is_emojipicker_newlist_open()) set_new_list_emoji(e)
				if (is_emojipicker_editlist_open()) set_edit_list_emoji(e)
			}}>
			<Show when={
				(is_emojipicker_newlist_open() && new_list_emoji() != null)
				|| (is_emojipicker_editlist_open() && edit_list_emoji() != null)
			}>
				<div style={{width: '100%', padding: '0 12px 12px 12px'}}>
					<Button
						style={{width: '100%'}}
						c_variant={ButtonVariant.tonal}
						onClick={() => {
							if (is_emojipicker_newlist_open()) set_new_list_emoji(null)
							if (is_emojipicker_editlist_open()) set_edit_list_emoji(null)
							close_emojipicker(emojipicker_ref)
						}}>
						<Icon c_code={ICON_DISMISS}/>No emoji
					</Button>
				</div>
			</Show>
		</EmojiPicker>
	</>)

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast
				ref={r => toast_nofile_ref = r}
				c_leading={<Icon c_code={ICON_DOCUMENT_ERROR}/>}>
				File is not exist
			</Toast>
		</>)
	}

	return (<App
		c_appbar={<AppBar
			tasklists={tasklists}
			is_side_navigation_expanded={is_sidenavigation_expanded()}
			command={command}
			page={page()}
			settings={settings}
		/>}
		c_left_sidebar={<SideNavigation
			expanded={is_sidenavigation_expanded()}
			tasklists={tasklists}
			command={command}
			page={page()}
			settings={settings}
		/>}>
		<Body
			settings={settings}
			is_db_file_error={is_db_file_error()}
			page={page()}
			labels={labels}
			tasklists={tasklists}
			command={command}
		/>
		<Dialogs/>
		<ColorPickers/>
		<Toasts/>
		<EmojiPickers/>
	</App>)
}

export default _