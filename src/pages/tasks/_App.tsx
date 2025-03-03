import { createStore, produce } from "solid-js/store"
import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { TaskList, TaskLabel, Settings, Task, TaskFileMetaData, SubTask } from "./_types"
import type { HEXColor } from "@/types/color"
import { type ObjectStoreTaskLists, type ObjectStoreSettings, type ObjectStoreSubTasks, type ObjectStoreTasks, type ObjectStoreTaskLabels, type ObjectStoreFiles, type ObjectStoreTaskFileMetaData, type ObjectStoreMiscellaneous, ObjectStoreNames, ObjectStoreKeys, } from "./_storage"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_TASK_LIST } from "./_constants"
import { IDB } from "@/utils/indexeddb"
import { fileDownload } from "@/utils/file"
import { numberIsNotDefined } from "@/utils/number"
import { removeSplashScreen } from "@/utils/splash"
import { AppColors } from "@/enums/colors"
import { elementValidTarget } from "@/utils/element"
import { ICON_CIRCLE, ICON_CIRCLE_ERASER, ICON_DELETE, ICON_DISMISS, ICON_DOCUMENT_ERROR, ICON_EDIT, ICON_EMOJI_ADD } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField, { updateTextFieldValue, TextFieldButton } from "@/components/TextField"
import { EmojiPicker, closeEmojiPicker, openEmojiPicker } from "@/components/EmojiPicker"
import List from "@/components/List"
import Toast, { openToast } from "@/components/Toast"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import ColorPicker, { closeColorPicker, openColorPicker } from "@/components/ColorPicker"
import Emoji from "@/components/Emoji"
import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Body from './_Body'

// TODO: handle navigation with keyboard only
const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.tasks)
	const [page, setPage] = createSignal<Pages | number>(Pages.tasks)
	const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
	const [newListNameText, setNewListNameText] = createSignal<string>('')
	const [newListEmoji, setNewListEmoji] = createSignal<string | null>(null)
	const [editListNameText, setEditListNameText] = createSignal<string>('')
	const [editListEmoji, setEditListEmoji] = createSignal<string | null>(null)
	const [labels, setLabels] = createStore<(TaskLabel | undefined)[]>([])
	const [taskLists, setTaskLists] = createStore<TaskList[]>([DEFAULT_TASK_LIST])
	const [selectedLabelToAdd, setSelectedlabelToAdd] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selectedLabelToEdit, setSelectedLabelToEdit] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selectedTaskListIndexToDelete, setSelectedTaskListIndexToDelete] = createSignal<number>(0)
	const [selectedTaskListIndexToRename, setSelectedTaskListIndexToRename] = createSignal<number>(0)
	const [changeLabelColorOption, setChangeLabelColorOption] = createSignal<'new' | 'edit'>('new')
	const [isEmojiPickerNewListOpen, setIsEmojiPickerNewListOpen] = createSignal<boolean>(false)
	const [isEmojiPickerEditListOpen, setIsEmojiPickerEditListOpen] = createSignal<boolean>(false)
	const [isColorPickerLabelOpen, setIsColorPickerLabelOpen] = createSignal<boolean>(false)
	const [isDBFileError, setIsDBFileError] = createSignal<boolean>(true)
	const [settings, setSettings] = createStore<Settings>({
		sortBy: SortBy.name,
		sortMode: SortMode.ascending,
		showDeleteTaskWarning: true,
		hiddenNavigation: []
	})
	let isEveryTaskLoaded: boolean = false
	let textFieldNewLabelRef: HTMLInputElement
	let textFieldEditLabelRef: HTMLInputElement
	let textFieldNewListRef: HTMLInputElement
	let textFieldEditListRef: HTMLInputElement
	let dialogLabelsRef: HTMLDialogElement
	let dialogNewLabelRef: HTMLDialogElement
	let dialogEditLabelRef: HTMLDialogElement
	let dialogNewListRef: HTMLDialogElement
	let dialogEditListRef: HTMLDialogElement
	let dialogDeleteListRef: HTMLDialogElement
	let colorPickerLabelRef: HTMLDialogElement
	let toastNoFileRef: HTMLDivElement
	let emojiPickerRef: HTMLDialogElement

	function sortTasks(tasks: Task[]): Task[] {
		const isReverse = settings.sortMode == SortMode.descending
		switch (settings.sortBy) {
			case SortBy.name: {
			tasks.sort(
				(a, b) => a.name.localeCompare(b.name) * (isReverse? -1 : 1)
			)
			break
		}
		case SortBy.importance: {
			tasks.sort((a, b) => a.name.localeCompare(b.name) * (isReverse? 1 : -1))
			tasks.sort((a) => (a.important? -1 : 1) * (isReverse? -1 : 1))
			break
		}
		case SortBy.creationDate: {
			tasks.sort((a, b) => !isReverse? b.id - a.id : a.id - b.id)
			break
		}
		case SortBy.completed: {
			tasks.sort((a, b) => a.name.localeCompare(b.name) * (isReverse? 1 : -1))
			tasks.sort((a) => (a.complete? -1 : 1) * (isReverse? -1 : 1))
			break
		}
		case SortBy.uncompleted: {
			tasks.sort((a, b) => b.name.localeCompare(a.name) * (isReverse? 1 : -1))
			tasks.sort((a) => (!a.complete? -1 : 1) * (isReverse? -1 : 1))
			break
		}}

		return tasks
	}

	function markAllTaskAs(taskListIndex: number, complete: boolean): void {
		const [storeTasks, storeSubTasks] = db.stores('readwrite',
			ObjectStoreNames.tasks, ObjectStoreNames.subtasks
		)
		const tasks: Task[] = []

		for (const task of taskLists[taskListIndex].tasks){
			if (task.complete == complete) {
				tasks.push(task)
				continue
			}

			const t: Task = {
				...task,
				complete: complete,
				subtasks: [...task.subtasks.map((v) => {
					const subtask = {...v}
					subtask.complete = complete
					if (storeSubTasks) storeSubTasks.put({...v} satisfies ObjectStoreSubTasks)
					return subtask
				})]
			}
			storeTasks?.put({
				id: t.id,
				complete: t.complete,
				description: t.description,
				important: t.important,
				labelIds: [...t.labelIds],
				listId: t.listId,
				name: t.name,
				reminder: t.reminder
			} satisfies ObjectStoreTasks)
			tasks.push(t)
		}
		setTaskLists(
			taskListIndex,
			'tasks',
			[SortBy.completed, SortBy.uncompleted].includes(settings.sortBy)
				? sortTasks(tasks)
				: tasks
		)
	}

	function deleteCompletedTask(taskListIndex: number): void {
		const [storeTasks, storeSubTasks, storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		const tasks: Task[] = []

		for (const task of taskLists[taskListIndex].tasks){
			if (!task.complete) {
				tasks.push(task)
				continue
			}

			storeTasks?.delete(task.id)
			if (storeSubTasks) for (const subtask of task.subtasks) {
				storeSubTasks.delete(subtask.id)
			}

			if (storeFileMetaData || storeFiles) for (const file of task.files) {
				storeFileMetaData?.delete(file.id)
				storeFiles?.delete(file.id)
			}
		}
		setTaskLists(taskListIndex, 'tasks', tasks)
	}

	function clearTasks(taskListIndex: number): void {
		const [storeTasks, storeSubTasks, storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		setTaskLists(taskListIndex, 'tasks', [])

		for (const task of taskLists[taskListIndex].tasks){
			storeTasks?.delete(task.id)
			if (storeSubTasks) for (const subtask of task.subtasks) {
				storeSubTasks.delete(subtask.id)
			}

			if (storeFileMetaData || storeFiles) for (const file of task.files) {
				storeFileMetaData?.delete(file.id)
				storeFiles?.delete(file.id)
			}
		}
	}

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function saveMiscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.miscellaneous)
		if (store == null) return

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	async function addTask(task: Task, taskListIndex: number): Promise<void> {
		const store = db.writeStore(ObjectStoreNames.tasks)

		try {
			let id = 0
			if (store) id = ((await db.add<Omit<ObjectStoreTasks, 'id'>>(store, {
				description: task.description,
				complete: task.complete,
				important: task.important,
				labelIds: [...task.labelIds],
				listId: task.listId,
				name: task.name,
				reminder: task.reminder
			})).target! as any).result as number

			else for (const taskList of taskLists) {
				tasks: for (const task of taskList.tasks) {
					if (task.id < id) continue tasks;

					id = task.id + 1
				}
			}

			const $$task: Task = {...task, id, subtasks: []}
			setTaskLists(taskListIndex, 'tasks', t => sortTasks([...t, $$task]))
		} catch {}
	}

	function editSubTask(
		subTask: SubTask,
		taskListIndex: number,
		taskIndex: number,
		subTaskIndex: number
	): void {
		const [storeTasks, storeSubTasks] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
		)
		const isNameChanged = subTask.name != taskLists[taskListIndex].tasks[taskIndex].subtasks[subTaskIndex].name
		const subTasks = (isNameChanged
			? [...taskLists[taskListIndex].tasks[taskIndex].subtasks]
			: []
		)

		if (isNameChanged){
			subTasks[subTaskIndex] = subTask
			subTasks.sort((a, b) => a.name.localeCompare(b.name))
		}

		if (isNameChanged) setTaskLists(taskListIndex, 'tasks', taskIndex, 'subtasks', subTasks)
		else setTaskLists(taskListIndex, 'tasks', taskIndex, 'subtasks', subTaskIndex, {...subTask})

		storeSubTasks?.put({...subTask})
		if (!(!subTask.complete && taskLists[taskListIndex].tasks[taskIndex].complete)) return;

		const task: Task = {...taskLists[taskListIndex].tasks[taskIndex], complete: false}
		if ([SortBy.completed, SortBy.uncompleted].includes(settings.sortBy)) {
			const tasks: Task[] = [...taskLists[taskListIndex].tasks]
			tasks[taskIndex] = task
			setTaskLists(taskListIndex, 'tasks', sortTasks(tasks))
		}
		else setTaskLists(taskListIndex, 'tasks', taskIndex, task)

		storeTasks?.put({
			id: task.id,
			description: task.description,
			complete: task.complete,
			important: task.important,
			labelIds: [...task.labelIds],
			listId: task.listId,
			name: task.name,
			reminder: task.reminder,
		} satisfies ObjectStoreTasks)
	}

	function editFile(
		file: TaskFileMetaData,
		taskListIndex: number,
		taskIndex: number,
		fileIndex: number
	): void {
		const isNameChanged = taskLists[taskListIndex].tasks[taskIndex].files[fileIndex].name != file.name
		const files: TaskFileMetaData[] = (isNameChanged
			? [...taskLists[taskListIndex].tasks[taskIndex].files]
			: taskLists[taskListIndex].tasks[taskIndex].files
		)

		if (isNameChanged) {
			files[fileIndex] = {...file}
			files.sort((a, b) => a.name.localeCompare(b.name))
		}

		setTaskLists(taskListIndex, 'tasks', taskIndex, 'files', files)
		const storeFileMetaData = db.writeStore(ObjectStoreNames.filemetadata)
		storeFileMetaData?.put({...file})
	}

	/**
	 * Don't use this function to edit single subtask/file. Use `edit_subtask()`/`edit_file()` instead.
	 */
	function editTask(task: Task, taskListIndex: number, taskIndex: number): void {
		const pastTask = taskLists[taskListIndex].tasks[taskIndex]
		const isTaskCompleteStatusChanged = pastTask.complete != task.complete
		const isTaskImportanceStatusChanged = pastTask.important != task.important
		const isTaskNameChanged = pastTask.name != task.name
		const changedSubTasks: SubTask[] = (isTaskCompleteStatusChanged
			? task.subtasks.map(subtask => ({...subtask, complete: !pastTask.complete && task.complete} satisfies SubTask))
			: [])
		const deletedSubTasks: SubTask[] = []
		const deletedFiles: TaskFileMetaData[] = []
		const [storeTasks, storeSubTasks, storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		if (pastTask.subtasks.length > task.subtasks.length) {
			const ids = task.subtasks.map(subtask => subtask.id)

			for (let i = 0; i < pastTask.subtasks.length; i++) {
				if (ids.includes(pastTask.subtasks[i].id)) continue;

				deletedSubTasks.push(pastTask.subtasks[i])
			}
		}

		if (pastTask.files.length > task.files.length) {
			const ids = task.files.map(file => file.id)

			for (let i = 0; i < pastTask.files.length; i++) {
				if (ids.includes(pastTask.files[i].id)) continue;

				deletedFiles.push(pastTask.files[i])
			}
		}

		const newTask: Task = {
			...task,
			reminder: task.reminder != null? new Date(task.reminder) : null,
			subtasks: isTaskCompleteStatusChanged
				? [...changedSubTasks]
				: task.subtasks
		}

		if (
			(isTaskCompleteStatusChanged && [SortBy.uncompleted, SortBy.completed].includes(settings.sortBy))
			|| (isTaskImportanceStatusChanged && settings.sortBy == SortBy.importance)
			|| (isTaskNameChanged && settings.sortBy == SortBy.name)
		){
			const tasks: Task[] = [...taskLists[taskListIndex].tasks]
			tasks[taskIndex] = newTask
			setTaskLists(taskListIndex, 'tasks', sortTasks(tasks))
		}
		else {
			setTaskLists(taskListIndex, 'tasks', taskIndex, newTask)
		}

		if (storeSubTasks) {
			for (const SubTask of changedSubTasks) {
				storeSubTasks.put({...SubTask})
			}

			for (const SubTask of deletedSubTasks) {
				storeSubTasks.delete(SubTask.id)
			}
		}

		if (storeFileMetaData || storeFiles) for (const file of deletedFiles) {
			storeFileMetaData?.delete(file.id)
			storeFiles?.delete(file.id)
		}

		storeTasks?.put({
			id: task.id,
			description: task.description,
			complete: task.complete,
			important: task.important,
			listId: task.listId,
			name: task.name,
			reminder: task.reminder,
			labelIds: [...task.labelIds],
		} satisfies ObjectStoreTasks)
	}

	function deleteTask(task: Task, taskListIndex: number, taskIndex: number): void {
		const [storeTasks, storeSubtasks, storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)

		setTaskLists(
			taskListIndex,
			'tasks',
			produce(tasks => {
				tasks.splice(taskIndex, 1)
			})
		)

		storeTasks?.delete(task.id)
		if (storeSubtasks) for (const subtask of task.subtasks) {
			storeSubtasks.delete(subtask.id)
		}

		if (storeFiles || storeFileMetaData) for (const file of task.files) {
			storeFiles?.delete(file.id)
			storeFileMetaData?.delete(file.id)
		}
	}

	function copyTasks(taskListIndex?: number): void {
		const isGrouping = [
			Pages.all, Pages.completed, Pages.uncompleted,
			Pages.important, Pages.planned
		].includes(page() as Pages)

		let text: string = ''
		const getTextPerTaskList = (taskListIndex: number) => {
			const tasklist = taskLists[taskListIndex]
			text += `${tasklist.emoji != null ? tasklist.emoji : '📑'} ${tasklist.name}`

			for (let i = 0; i < tasklist.tasks.length; i++) {
				const task: Task = tasklist.tasks[i]
				const taskComplete = task.complete
				const taskImportant = task.important
				const taksReminder = task.reminder
				const taskDescription = task.description

				// skipping
				if (isGrouping
					&& (
						(page() == Pages.completed && !taskComplete)
						|| (page() == Pages.uncompleted && taskComplete)
						|| (page() == Pages.important && !taskImportant)
						|| (page() == Pages.planned && taksReminder == null)
					)
				) continue

				let additional: string = ''
				text += (`\n${taskComplete ? '✔️' : '❌'} ${task.name}`)

				if (taskDescription != '') additional += `[🗒️ ${taskDescription}]`
				if (taskImportant) additional +=  '[⭐ important]'
				if (taksReminder != null) additional += `[🕒 ${taksReminder.toLocaleTimeString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric'
				})}]`
				for (const file of task.files) additional += `[💾 ${file.name}]`

				let j = 0
				labels: for (const id of task.labelIds) {
					if (labels[id] == undefined) continue labels;
					if (j >= task.labelIds.length) break labels;

					additional += `[🔖 ${labels[id].name}]`
					j++
				}

				if (additional != '') text = [text, additional].join(' ')
				for (const subtask of task.subtasks) {
					text += (`\n➡️${subtask.complete ? '✔️' : '❌'} ${subtask.name}`)
				}
			}
		}

		if (taskListIndex == null) {
			let j = 0
			for (let i = 0; i < taskLists.length; i++) {
				const taskList: TaskList = taskLists[i]
				const tasks = taskList.tasks
				if (tasks.length == 0) continue;
				if (isGrouping
					&& (
						(page() == Pages.completed      && tasks.every(task => !task.complete))
						|| (page() == Pages.uncompleted && tasks.every(task => task.complete))
						|| (page() == Pages.important   && tasks.every(task => !task.important))
						|| (page() == Pages.planned     && tasks.every(task => task.reminder == null))
					)
				) continue;
				if (j > 0) text += '\n\n'
				getTextPerTaskList(i)
				++j
			}
		}
		else getTextPerTaskList(taskListIndex)

		// # ⚠️ task-list-name #
		// ✔️ task-name [🗒️ description][⭐ important][🕒 reminder][💾 file1][💾 file2][🔖 label1][🔖 label2]
		// ➡️✔️ subtask-name
		// ➡️❌ subtask-name
		// ❌ task-name
		navigator.clipboard.writeText(text)
	}

	async function addLabel(name: string, color: HEXColor | null): Promise<void> {
		const storeLabels = db.writeStore(ObjectStoreNames.labels)

		try {
			let id: number = 1
			let isAdded = false

			// since key generator value never decrease,
			// we have to check empty key to use it.
			// keep the labels compact.
			for (let i = 1; i < labels.length; i++) {
				if (labels[i] != undefined) continue;

				isAdded = true
				id = i
				if (storeLabels) await db.add<ObjectStoreTaskLabels>(storeLabels, {id, name, color})
				break
			}

			if (!isAdded) {
				if (storeLabels != null) id = ((await db.add<Omit<ObjectStoreTaskLabels, 'id'>>(
					storeLabels, {name, color}
				)).target as any).result as number
				else for (const label of labels){
					if (label == undefined) continue
					if (label.id < id) continue
					id = label.id + 1
				}
			}

			const $labels: (TaskLabel | undefined)[] = [...labels]
			$labels[id] = {id, color, name}
			setLabels($labels)
		} catch {}
	}

	function editLabel(label: TaskLabel): void {
		const $labels = [...labels]
		$labels[label.id] = label
		setLabels($labels)

		const storeLabels = db.writeStore(ObjectStoreNames.labels)
		storeLabels?.put({...label})
	}

	function deleteLabel(label: TaskLabel): void {
		const [storeTasks, storeLabels] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.labels
		)
		const $labels = [...labels]
		$labels.splice(label.id, 1)

		for (let i = 0; i < taskLists.length; i++) {
			const tasks = taskLists[i].tasks
			tasks: for (let j = 0; j < tasks.length; j++) {
				const task = tasks[j]
				const taskLabelIds = tasks[j].labelIds
				const index = taskLabelIds.findIndex(id => id == label.id)
				if (index < 0) continue tasks

				const labelIds = taskLabelIds
					.slice(0, index)
					.concat(taskLabelIds.slice(index + 1))

				setTaskLists(i, 'tasks', j, 'labelIds', labelIds)
				storeTasks?.put({
					id: task.id,
					description: task.description,
					complete: task.complete,
					important: task.important,
					labelIds: [...labelIds],
					listId: task.listId,
					name: task.name,
					reminder: task.reminder
				} satisfies ObjectStoreTasks)
			}
		}
		setLabels($labels)
		storeLabels?.delete(label.id)
	}

	async function addFiles(
		files: FileList,
		task: Task,
		taskListIndex: number,
		taskIndex: number
	): Promise<TaskFileMetaData[]> {
		if (files.length == 0) return []

		const [storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		const $files: TaskFileMetaData[] = [...taskLists[taskListIndex].tasks[taskIndex].files]

		try {
			if (storeFileMetaData == null || storeFiles == null) return $files
			for (const file of files) {
				const id = ((await db.add<Omit<ObjectStoreTaskFileMetaData, 'id'>>(storeFileMetaData, {
					listId: task.listId,
					name: file.name,
					size: file.size,
					taskId: task.id,
					type: file.type
				})).target! as any).result as number

				storeFiles.put({
					id,
					blob: new Blob([file])
				} satisfies ObjectStoreFiles)

				$files.push({
					id: id,
					listId: task.listId,
					name: file.name,
					size: file.size,
					taskId: task.id,
					type: file.type
				})
			}
			setTaskLists(
				taskListIndex, 'tasks', taskIndex, 'files',
				$files.sort((a, b) => a.name.localeCompare(b.name))
			)
		} catch {}

		return $files
	}

	function downloadTaskFile(
		file: TaskFileMetaData,
		taskListIndex: number,
		taskIndex: number,
		fileIndex: number
	): void {
		const [storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		if (storeFiles == null || storeFileMetaData == null) return;

		db.get<ObjectStoreFiles>(storeFiles, file.id).then((result) => {
			if (!result) {
				if (file.id == taskLists[taskListIndex].tasks[taskIndex].files[fileIndex].id) {

					// This statement not update the file lists in <dialog>
					setTaskLists(taskListIndex, 'tasks', taskIndex, 'files', produce(files => {
						files.splice(fileIndex, 1)
					}))
					storeFileMetaData.delete(file.id)
				}

				openToast(toastNoFileRef)
				return;
			}

			fileDownload(new Blob([result.blob]), file.name)
		})
	}

	async function getBlob(
		file: TaskFileMetaData,
		taskListIndex: number,
		taskIndex: number,
		fileIndex: number
	): Promise<Blob | null> {
		const [storeFiles, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.files,
			ObjectStoreNames.filemetadata,
		)
		if (storeFiles == null || storeFileMetaData == null) return null

		try {
			const result = await db.get<ObjectStoreFiles>(storeFiles, file.id)
			if (!result) {
				if (file.id == taskLists[taskListIndex].tasks[taskIndex].files[fileIndex].id) {

					// This statement not update the file lists in <dialog>
					setTaskLists(
						taskListIndex, 'tasks', taskIndex, 'files',
						produce(files => {
							files.splice(fileIndex, 1)
						})
					)
					storeFileMetaData.delete(file.id)
				}

				openToast(toastNoFileRef)
				return null
			}

			return new Blob([result.blob])
		} catch {}

		return null
	}

	async function addSubTask(subtask: SubTask, taskListIndex: number, taskIndex: number): Promise<SubTask[]> {
		const storeSubTasks = db.writeStore(ObjectStoreNames.subtasks)

		try {
			let id = 0
			if (storeSubTasks != null) id = ((await db.add<Omit<ObjectStoreSubTasks, 'id'>>(storeSubTasks, {
				complete: subtask.complete,
				listId: subtask.listId,
				name: subtask.name,
				taskId: subtask.taskId
			})).target! as any).result as number

			else for (const list of taskLists){
				for (const task of list.tasks){
					subtasks: for (const subtask of task.subtasks){
						if (subtask.id < id) continue subtasks
						id = subtask.id + 1
					}
				}
			}

			const $subtask = {...subtask}
			$subtask.id = id
			setTaskLists(
				taskListIndex, 'tasks', taskIndex, 'subtasks',
				subtasks => [...subtasks, $subtask].sort((a, b) => a.name.localeCompare(b.name))
			)

			if (taskLists[taskListIndex].tasks[taskIndex].complete) {
				const task: Task = {...taskLists[taskListIndex].tasks[taskIndex], complete: false}
				if ([SortBy.completed, SortBy.uncompleted].includes(settings.sortBy)) {
					const tasks: Task[] = [...taskLists[taskListIndex].tasks]
					tasks[taskIndex] = task
					setTaskLists(taskListIndex, 'tasks', sortTasks(tasks))
				}
				else setTaskLists(taskListIndex, 'tasks', taskIndex, task)
			}
		} catch {}

		return taskLists[taskListIndex].tasks[taskIndex].subtasks
	}

	function sortAllTasks(): void {
		for (let i = 0; i < taskLists.length; i++) {
			setTaskLists(i, 'tasks', sortTasks([...taskLists[i].tasks]))
		}
	}

	function reverseAllTasks(): void {
		for (let i = 0; i < taskLists.length; i++) {
			setTaskLists(i, 'tasks', sortTasks([...taskLists[i].tasks]))
		}
	}

	async function addNewTaskList(name: string, emoji: string | null): Promise<void> {
		const storeTaskLists = db.writeStore(ObjectStoreNames.tasklists)
		let count = 0

		name = name.trim()
		for (const list of taskLists) {
			if (count == 0 && list.name == name) ++count
			if (list.name == name + ` (${count})`) ++count
		}

		if (count > 0) name += ` (${count})`

		try {
			let id = 0
			if (storeTaskLists != null) id = ((await db.add<Omit<ObjectStoreTaskLists, 'id'>>(storeTaskLists, {
				emoji,
				name
			})).target! as any).result as number

			else for (const list of taskLists) {
				if (list.id < id) continue

				id = list.id + 1
			}

			// make the default list always on top
			const index = taskLists.findIndex(list => list.id == DEFAULT_TASK_LIST.id)
			if (index >= 0) {
				const otherLists = ([] as TaskList[]).concat(
					taskLists.slice(0, index),
					taskLists.slice(index + 1),
					[{ id, emoji, name, tasks: []} satisfies TaskList]
				)
				otherLists.sort((a, b) => a.name.localeCompare(b.name))
				setTaskLists([taskLists[index]].concat(otherLists))
			}
			else setTaskLists(values => [
				...values,
				{ id, emoji, name, tasks: []} satisfies TaskList
			].sort((a, b) => a.name.localeCompare(b.name)))
			changePage(id)
		} catch {}
	}

	async function command(type: Commands, ...args: unknown[]): Promise<unknown> {
		switch (type) {
		case Commands.toggleNavigationExpand: {
			setIsSideNavigationExpanded(v => !v)
			saveMiscellaneous([ObjectStoreKeys.miscellaneous_isSideNavigationExpanded, isSideNavigationExpanded()])
			break
		}
		case Commands.updatePage: {
			const [page] = args as [Pages | number]
			changePage(page)
			break
		}
		case Commands.updateSortBy: {
			const [sortBy] = args as [SortBy]
			setSettings('sortBy', sortBy)
			saveSettings([ObjectStoreKeys.settings_sortBy, sortBy])
			sortAllTasks()
			break
		}
		case Commands.updateSortMode: {
			const [sortMode] = args as [SortMode]
			setSettings('sortMode', sortMode)
			saveSettings([ObjectStoreKeys.settings_sortMode, sortMode])
			reverseAllTasks()
			break
		}
		case Commands.addTask: {
			const [task, taskListIndex] = args as [Task, number]
			addTask(task, taskListIndex)
			break
		}
		case Commands.editTask: {
			const [task, taskListIndex, taskIndex] = args as [Task, number, number]
			editTask(task, taskListIndex, taskIndex)
			break
		}
		case Commands.deleteTask: {
			const [task, taskListIndex, taskIndex] = args as [Task, number, number]
			deleteTask(task, taskListIndex, taskIndex)
			break
		}
		case Commands.toggleDeleteTaskWarning: {
			const [value = !settings.showDeleteTaskWarning] = args as [boolean | undefined]
			setSettings('showDeleteTaskWarning', value)
			saveSettings([ObjectStoreKeys.settings_showDeleteTaskWarning, value])
			break
		}
		case Commands.updateHiddenNavigation: {
			const [pages] = args as [Pages[]]
			if (typeof page() == (typeof Pages.tasks) && pages.includes(page() as Pages)) {
				changePage(Pages.tasks)
			}
			setSettings('hiddenNavigation', pages)
			saveSettings([ObjectStoreKeys.settings_hiddenNavigation, [...pages]])
			break
		}
		case Commands.markAllCompleted: {
			const [taskListIndex] = args as [number]
			markAllTaskAs(taskListIndex, true)
			break
		}
		case Commands.markAllUncompleted: {
			const [taskListIndex] = args as [number]
			markAllTaskAs(taskListIndex, false)
			break
		}
		case Commands.clearTasks: {
			const [taskListIndex] = args as [number]
			clearTasks(taskListIndex)
			break
		}
		case Commands.deleteCompletedTask: {
			const [taskListIndex] = args as [number]
			deleteCompletedTask(taskListIndex)
			break
		}
		case Commands.copyTasks: {
			const [taskListIndex] = args as [number | undefined]
			copyTasks(taskListIndex)
			break
		}
		case Commands.addLabel:
			openDialog(dialogNewLabelRef, {
				contentAutoFocus: true,
				important: true
			})
			break
		case Commands.editLabel: {
			const [label] = args as [TaskLabel]
			updateTextFieldValue(textFieldEditLabelRef, label.name)
			setSelectedLabelToEdit(label)
			openDialog(dialogEditLabelRef, {
				contentAutoFocus: true,
				important: true
			})
			break
		}
		case Commands.deleteLabel: {
			const [label] = args as [TaskLabel]
			deleteLabel(label)
			break
		}
		case Commands.showLabelsOptions:
			openDialog(dialogLabelsRef)
			break
		case Commands.addFiles: {
			const [
				files,
				task,
				taskListIndex,
				taskIndex
			] = args as [FileList, Task, number, number]
			return await addFiles(files, task, taskListIndex, taskIndex)
		}
		case Commands.downloadFile: {
			const [
				file,
				taskListIndex,
				taskIndex,
				fileIndex
			] = args as [TaskFileMetaData, number, number, number]
			downloadTaskFile(file, taskListIndex, taskIndex, fileIndex)
			break
		}
		case Commands.editFile: {
			const [
				file, taskListIndex, taskIndex, fileIndex
			] = args as [TaskFileMetaData, number, number, number]
			editFile(file, taskListIndex, taskIndex, fileIndex)
			break
		}
		case Commands.editSubTask: {
			const [
				subtask, taskListIndex, taskIndex,
				subtaskIndex
			] = args as [SubTask, number, number, number]
			editSubTask(subtask, taskListIndex, taskIndex, subtaskIndex)
			break
		}
		case Commands.getFileBlob: {
			const [file, taskListIndex, taskIndex, fileIndex] = args as [TaskFileMetaData, number, number, number]
			return await getBlob(file, taskListIndex, taskIndex, fileIndex)
		}
		case Commands.addSubTask: {
			const [
				subtask, taskListIndex, taskIndex
			] = args as [SubTask, number, number]
			return await addSubTask(subtask, taskListIndex, taskIndex)
		}
		case Commands.addTaskList:
			openDialog(dialogNewListRef, {
				important: true,
				contentAutoFocus: true
			})
			break
		case Commands.deleteTaskList: {
			const [taskListIndex] = args as [number]
			setSelectedTaskListIndexToDelete(taskListIndex)
			openDialog(dialogDeleteListRef, {
				important: true
			})
			break
		}
		case Commands.renameTaskList: {
			const [taskListIndex] = args as [number]
			const list = taskLists[taskListIndex]
			setSelectedTaskListIndexToRename(taskListIndex)
			setEditListEmoji(list.emoji)
			setEditListNameText(list.name)
			updateTextFieldValue(textFieldEditListRef, list.name)
			openDialog(dialogEditListRef, {
				important: true,
				contentAutoFocus: true
			})
			break
		}
		/**
			@param {Task} task `Task`
			@param {number} taskListIndex `number`
			@param {number} taskIndex `number`
			@param {number} targetTaskListIndex `number` */
		case Commands.moveTask: {
			const [
				task, taskListIndex, taskIndex, targetTaskListIndex
			] = args as [Task, number, number, number]
			moveTask(task, taskListIndex, taskIndex, targetTaskListIndex)
			break
		}
		case Commands.getAllTask: {
			getTasks(true)
			break
		}
		default: return
	}}

	function moveTask(
		task: Task,
		taskListIndex: number,
		taskIndex: number,
		targetTaskListIndex: number
	): void {
		const [storeTasks, storeSubTasks, storeFileMetaData] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
		)
		const targetList = taskLists[targetTaskListIndex]

		// Update manually if list has tasks, because
		// `getTasks()` function only update empty list.
		if (targetList.tasks.length > 0) {
			const subTasks = task.subtasks.map(
				subtask => ({...subtask, listId: targetList.id} satisfies SubTask)
			)
			const files = task.files.map(
				file => ({...file, listId: targetList.id} satisfies TaskFileMetaData)
			)
			const $task: Task = {...task, subtasks: subTasks, files}
			setTaskLists(
				targetTaskListIndex, 'tasks',
				tasks => sortTasks([...tasks, $task])
			)
		}

		setTaskLists(
			taskListIndex,
			'tasks',
			produce(tasks => tasks.splice(taskIndex, 1))
		)
		storeTasks?.put({
			complete: task.complete,
			description: task.description,
			id: task.id,
			important: task.important,
			labelIds: [...task.labelIds],
			listId: targetList.id,
			name: task.name,
			reminder: task.reminder
		} satisfies ObjectStoreTasks)

		if (storeSubTasks) for (const subtask of task.subtasks) storeSubTasks.put({
			...subtask,
			listId: targetList.id
		} satisfies ObjectStoreSubTasks)

		if (storeFileMetaData) for (const file of task.files) storeFileMetaData.put({
			...file,
			listId: targetList.id
		} satisfies ObjectStoreTaskFileMetaData)
	}

	function initDatabase(): void {
		db.open({
			onSuccess(_, db) {
				initTaskLists()
				initLabels()
				initSettings()
				initMiscellaneous()
				setIsDBFileError(db.readStore(ObjectStoreNames.filemetadata) == null)
			},
			onError() {
				setIsDBFileError(true)
			},
			onUpgrade(_, db) {
				const store = db.createStore<ObjectStoreTaskLists>({
					name: ObjectStoreNames.tasklists,
					keyPath: 'id',
					indexs: ['id', 'name', 'emoji']
				})

				store!.put({
					id: DEFAULT_TASK_LIST.id,
					name: DEFAULT_TASK_LIST.name,
					emoji: DEFAULT_TASK_LIST.emoji,
				} satisfies ObjectStoreTaskLists)

				db.createStore<ObjectStoreTasks>({
					name: ObjectStoreNames.tasks,
					keyPath: 'id',
					indexs: ['id', 'listId', 'name', 'complete', 'reminder', 'important', 'description', 'labelIds']
				})
				db.createStore<ObjectStoreSubTasks>({
					name: ObjectStoreNames.subtasks,
					keyPath: 'id',
					indexs: ['id', 'taskId', 'name', 'complete', 'listId']
				})
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreTaskLabels>({
					name: ObjectStoreNames.labels,
					keyPath: 'id',
					indexs: ['id', 'name', 'color']
				})
				db.createStore<ObjectStoreFiles>({
					name: ObjectStoreNames.files,
					keyPath: 'id',
					indexs: ['id', 'blob']
				})
				db.createStore<ObjectStoreTaskFileMetaData>({
					name: ObjectStoreNames.filemetadata,
					keyPath: 'id',
					indexs: ['id', 'listId', 'taskId', 'name', 'size', 'type']
				})
			},
		})
	}

	function initLastpage(): void {
		const storeMiscellaneous = db.readStore(ObjectStoreNames.miscellaneous)
		if (storeMiscellaneous == null) return;

		db.get<ObjectStoreMiscellaneous<Pages | number>>(
			storeMiscellaneous,
			ObjectStoreKeys.miscellaneous_lastPage
		).then((result) => {
			if (!result) return getTasks()

			setPage(result.value)
			getTasks()
		})
	}

	function initMiscellaneous(): void {
		const storeMiscellaneous = db.readStore(ObjectStoreNames.miscellaneous)
		if (storeMiscellaneous == null) return;

		db.get<ObjectStoreMiscellaneous<boolean>>(
			storeMiscellaneous,
			ObjectStoreKeys.miscellaneous_isSideNavigationExpanded
		).then((result) => setIsSideNavigationExpanded(d => result?.value ?? d))
	}

	function initSettings(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return;

		db.get<ObjectStoreSettings<SortBy>>(
			storeSettings,
			ObjectStoreKeys.settings_sortBy
		).then((result) => setSettings('sortBy', d => result?.value ?? d))

		db.get<ObjectStoreSettings<SortMode>>(
			storeSettings,
			ObjectStoreKeys.settings_sortMode
		).then((result) => setSettings('sortMode', d => result?.value ?? d))

		db.get<ObjectStoreSettings<boolean>>(
			storeSettings,
			ObjectStoreKeys.settings_showDeleteTaskWarning
		).then((result) => setSettings('showDeleteTaskWarning', d => result?.value ?? d))

		db.get<ObjectStoreSettings<Pages[]>>(
			storeSettings,
			ObjectStoreKeys.settings_hiddenNavigation
		).then((result) => setSettings('hiddenNavigation', d => result? [...result.value] : d))
	}

	function initTaskLists(): void {
		const storeTaskLists = db.readStore(ObjectStoreNames.tasklists)
		if (storeTaskLists == null) return;

		db.getAll<ObjectStoreTaskLists>(storeTaskLists).then((result) => {
			if (!result) return;

			let lists: TaskList[] = []
			for (const i of result) lists.push({...i, tasks: []})

			// just assume user able to explicitly delete default task list
			const index = lists.findIndex(list => list.id == DEFAULT_TASK_LIST.id)
			if (index >= 0) {
				const otherLists = ([] as TaskList[]).concat(
					lists.slice(0, index),
					lists.slice(index + 1)
				)
				otherLists.sort((a, b) => a.name.localeCompare(b.name))
				lists = [lists[index]].concat(otherLists)
			}
			else lists.sort((a, b) => a.name.localeCompare(b.name))

			setTaskLists(lists)
			initLastpage()
		})
	}

	function initLabels(): void {
		const storeLabels = db.readStore(ObjectStoreNames.labels)
		if (storeLabels == null) return;

		db.getAll<ObjectStoreTaskLabels>(storeLabels).then((v) => {
			if (!v) return;

			const values: TaskLabel[] = []
			for (const label of [...v].sort((a, b) => a.name.localeCompare(b.name))) {
				values[label.id] = label
			}
			setLabels(values)
		})
	}

	function deleteTaskList(): void {
		const [
			storeTaskLists, storeTasks, storeSubTasks,
			storeFileMetaData, storeFiles
		] = db.stores('readwrite',
			ObjectStoreNames.tasklists,
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
			ObjectStoreNames.files,
		)
		const list = taskLists[selectedTaskListIndexToDelete()]
		changePage(Pages.tasks)

		storeTaskLists?.delete(list.id)

		for (const task of list.tasks) {
			storeTasks?.delete(task.id)

			if (storeSubTasks) {
				for (const subtask of task.subtasks) storeSubTasks.delete(subtask.id)
			}

			if (storeFileMetaData || storeFiles) for (const file of task.files) {
				storeFileMetaData?.delete(file.id)
				storeFiles?.delete(file.id)
			}
		}

		setTaskLists(produce(lists => lists.splice(selectedTaskListIndexToDelete(), 1)))
	}

	// FIXME: To many iteration and I hate it. I don't find any better solution currently
	async function getTasks(all: boolean = false): Promise<void> {
		if (isEveryTaskLoaded) return;

		const [
			storeTasks, storeSubTasks, storeFileMetaData
		] = db.stores('readwrite',
			ObjectStoreNames.tasks,
			ObjectStoreNames.subtasks,
			ObjectStoreNames.filemetadata,
		)
		const isGetAll = (
			[	Pages.all, Pages.completed, Pages.uncompleted,
				Pages.important, Pages.planned
			].includes(page() as Pages)
			|| all
		)
		const listId = page() == Pages.tasks? DEFAULT_TASK_LIST.id : page() as number
		const listIdIndex: {[id: number]: number} = {}

		for (let i = 0; i < taskLists.length; i++) {
			if (taskLists[i].tasks.length > 0) continue
			if (isGetAll) listIdIndex[taskLists[i].id] = i
			else if (taskLists[i].id == listId) {
				listIdIndex[taskLists[i].id] = i
				break
			}
		}

		isEveryTaskLoaded = Object.keys(listIdIndex).length == 0
		if (isEveryTaskLoaded || storeTasks == null) return;

		try {

			// TASKS
			const tasksIdIndex: {[id: number]: number} = {}
			const tasks: Task[] = []
			await db.cursor(storeTasks, (cursor) => {
				if (!cursor) return false
				const task = cursor.value as ObjectStoreTasks
				const add = () => {
					if (listIdIndex[task.listId] == undefined) return;
					tasks.push({...task, files: [], subtasks: []})
				}
				if (isGetAll) add()
				else if (task.listId == listId) add()
				return true
			})
			sortTasks(tasks)
			for (let i = 0; i < tasks.length; i++) {
				tasksIdIndex[tasks[i].id] = i
			}

			// SUBTASKS
			const subTasks: SubTask[] = []
			if (storeSubTasks != null) await db.cursor(storeSubTasks, (cursor) => {
				if (!cursor) return false
				const subtask = cursor.value as ObjectStoreSubTasks
				const add = () => {
					if (listIdIndex[subtask.listId] == undefined) return;
					subTasks.push(subtask)
				}
				if (isGetAll) add()
				else if (subtask.listId == listId) add()
				return true
			})
			subTasks.sort((a, b) => a.name.localeCompare(b.name))
			for (const subTask of subTasks) {
				tasks[tasksIdIndex[subTask.taskId]].subtasks.push(subTask)
			}

			// FILES
			const fileMetaDatas: TaskFileMetaData[] = []
			if (storeFileMetaData != null) await db.cursor(storeFileMetaData, (cursor) => {
				if (!cursor) return false
				const filemetadata = cursor.value as ObjectStoreTaskFileMetaData
				const add = () => {
					if (listIdIndex[filemetadata.listId] == undefined) return;
					fileMetaDatas.push({...filemetadata})
				}
				if (isGetAll) add()
				else if (filemetadata.listId == listId) add()
				return true
			})
			fileMetaDatas.sort((a, b) => a.name.localeCompare(b.name))
			for (const fileMetaData of fileMetaDatas) {
				tasks[tasksIdIndex[fileMetaData.taskId]].files.push(fileMetaData)
			}

			for (const id of Object.keys(listIdIndex).map(v => Number.parseInt(v))) {
				setTaskLists(listIdIndex[id], 'tasks', tasks.filter(task => task.listId == id))
			}

		} catch (e) {console.log(e)}
	}

	function changePage(page: Pages | number): void {
		setPage(page)
		getTasks()

		const storeMiscellaneous = db.writeStore(ObjectStoreNames.miscellaneous)
		storeMiscellaneous?.put({
			key: ObjectStoreKeys.miscellaneous_lastPage,
			value: page
		})
	}

	function renameTaskList(): void {
		const storeTaskLists = db.writeStore(ObjectStoreNames.tasklists)
		const list = taskLists[selectedTaskListIndexToRename()]
		const id = list.id
		const emoji = editListEmoji()
		let name = editListNameText().trim()

		if (name != list.name) {
			let count = 0
			for (const tasklist of taskLists) {
				if (count == 0 && tasklist.name == name) ++count
				if (tasklist.name == name + ` (${count})`) ++count
			}
			if (count > 0) name += ` (${count})`
		}

		let $lists = [...taskLists]
		$lists[selectedTaskListIndexToRename()] = {...$lists[selectedTaskListIndexToRename()], emoji, name}

		// keep general tasks on top
		const index = $lists.findIndex(list => list.id == DEFAULT_TASK_LIST.id)
		if (index >= 0) {
			const otherLists = ([] as TaskList[]).concat(
				$lists.slice(0, index),
				$lists.slice(index + 1)
			)
			otherLists.sort((a, b) => a.name.localeCompare(b.name))
			$lists = [$lists[index]].concat(otherLists)
		}
		else $lists.sort((a, b) => a.name.localeCompare(b.name))

		setTaskLists($lists)
		storeTaskLists?.put({emoji, id, name} satisfies ObjectStoreTaskLists)
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	const LabelItem: VoidComponent<{index: number, label: TaskLabel}> = (props) => {
		const label = createMemo(() => props.label)
		return (<List
			c:leading={<Icon style={{color: label().color ?? undefined}} c:code={ICON_CIRCLE}/>}
			c:trailing={<>
				<IconButton
					data-tooltip="Edit label"
					data-edit
					data-index={props.index}
					onClick={() => command(Commands.editLabel, label())}
					c:code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Delete label"
					data-delete
					data-index={props.index}
					onClick={() => command(Commands.deleteLabel, label())}
					c:code={ICON_DELETE}
				/>
			</>}>
			{ label().name }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const button_dialogLabels_closeId = createUniqueId()
		const button_dialogLabels_addId = createUniqueId()
		const button_dialogNewLabel_cancelId = createUniqueId()
		const button_dialogNewLabel_addId = createUniqueId()
		const button_dialogNewLabel_colorId = createUniqueId()
		const button_dialogEditLabel_cancelId = createUniqueId()
		const button_dialogEditLabel_editId = createUniqueId()
		const button_dialogEditLabel_colorId = createUniqueId()
		const button_dialogNewList_cancelId = createUniqueId()
		const button_dialogNewList_addId = createUniqueId()
		const button_dialogNewList_emojiId = createUniqueId()
		const button_dialogEditList_cancelId = createUniqueId()
		const button_dialogEditList_renameId = createUniqueId()
		const button_dialogEditList_emojiId = createUniqueId()
		const button_dialogDeleteList_cancelId = createUniqueId()
		const button_dialogDeleteList_deleteId = createUniqueId()
		return (<>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialogLabelsRef = r}
				c:header="Labels"
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogLabels_closeId:
						closeDialog(dialogLabelsRef)
						break
					case button_dialogLabels_addId:
						openDialog(dialogNewLabelRef, {
							contentAutoFocus: true,
							important: true
						})
						break

					// handle actions
					default:
						const dataset = button.dataset
						const dataIndex = dataset.index
						const dataEdit = dataset.edit
						const dataDelete = dataset.delete
						if (!dataIndex)  return

						let index = Number.parseInt(dataIndex)
						if (numberIsNotDefined(index)) return

						if (typeof dataEdit === 'string') {
							command(Commands.editLabel, labels[index])
						}
						else if (typeof dataDelete === 'string') {
							command(Commands.deleteLabel, labels[index])
						}
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogLabels_closeId}
						c:variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_dialogLabels_addId}
						c:variant={ButtonVariant.filled}>
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
				ref={r => dialogNewLabelRef = r}
				c:header="New label"
				onClose={() => {
					setSelectedlabelToAdd('name', '')
					updateTextFieldValue(textFieldNewLabelRef, '')
					setSelectedlabelToAdd('color', null)
				}}
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogNewLabel_addId:
						addLabel(selectedLabelToAdd.name.trim(), selectedLabelToAdd.color)
						closeDialog(dialogNewLabelRef)
						break
					case button_dialogNewLabel_cancelId:
						closeDialog(dialogNewLabelRef)
						break
					case button_dialogNewLabel_colorId:
						setChangeLabelColorOption('new')
						openColorPicker(colorPickerLabelRef, {
							anchor: button,
						})
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogNewLabel_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogNewLabel_addId}
						disabled={selectedLabelToAdd.name.trim() == ''}
						c:variant={ButtonVariant.filled}>
						Add
					</Button>
				</>}>
				<form
					style={{ display: 'contents' }}
					onSubmit={ev => {
						ev.preventDefault()
						if (selectedLabelToAdd.name.trim() == '') return;

						addLabel(selectedLabelToAdd.name.trim(), selectedLabelToAdd.color)
						closeDialog(dialogNewLabelRef)
					}}>
					<Tooltip>
						<TextField
							ref={r => textFieldNewLabelRef = r}
							c:label="Name"
							onFocus={() => setSelectedlabelToAdd('name', textFieldNewLabelRef.value)}
							onInput={() => setSelectedlabelToAdd('name', textFieldNewLabelRef.value)}
							autofocus
							c:trailing={<TextFieldButton
								id={button_dialogNewLabel_colorId}
								data-tooltip="Change label color"
								c:focused={isColorPickerLabelOpen()}>
								<Icon
									style={{color: selectedLabelToAdd.color ?? undefined}}
									c:code={ICON_CIRCLE}
								/>
							</TextFieldButton>}
						/>
					</Tooltip>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialogEditLabelRef = r}
				c:header="Edit label"
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogEditLabel_cancelId:
						closeDialog(dialogEditLabelRef)
						break
					case button_dialogEditLabel_editId:
						editLabel({
							...selectedLabelToEdit,
							name: selectedLabelToEdit.name.trim(),
						} satisfies TaskLabel)
						closeDialog(dialogEditLabelRef)
						break
					case button_dialogEditLabel_colorId:
						setChangeLabelColorOption('edit')
						openColorPicker(colorPickerLabelRef, {
							anchor: button,
						})
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogEditLabel_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogEditLabel_editId}
						disabled={selectedLabelToEdit.name.trim() == ''}
						c:variant={ButtonVariant.filled}>
						Edit
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={ev => {
						ev.preventDefault()
						const name = selectedLabelToEdit.name.trim()
						if (name == '') return;

						editLabel({
							...selectedLabelToEdit,
							name,
						} satisfies TaskLabel)
						closeDialog(dialogEditLabelRef)
					}}>
					<TextField
						ref={r => textFieldEditLabelRef = r}
						c:label="Name"
						onFocus={() => setSelectedLabelToEdit('name', textFieldEditLabelRef.value)}
						onInput={() => setSelectedLabelToEdit('name', textFieldEditLabelRef.value)}
						autofocus
						c:trailing={<TextFieldButton
							id={button_dialogEditLabel_colorId}
							data-tooltip="Change label color"
							c:focused={isColorPickerLabelOpen()}>
							<Icon
								style={{color: selectedLabelToEdit.color ?? undefined}}
								c:code={ICON_CIRCLE}
							/>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialogNewListRef = r}
				c:header="New list"
				style={{width: '500px'}}
				onClose={() => {
					setNewListNameText('')
					setNewListEmoji(null)
					updateTextFieldValue(textFieldNewListRef, '')
				}}
				onClick={(ev) => {
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogNewList_cancelId:
						closeDialog(dialogNewListRef)
						break
					case button_dialogNewList_addId:
						addNewTaskList(newListNameText(), newListEmoji())
						closeDialog(dialogNewListRef)
						break
					case button_dialogNewList_emojiId:
						setIsEmojiPickerNewListOpen(true)
						openEmojiPicker(emojiPickerRef)
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogNewList_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogNewList_addId}
						disabled={newListNameText().trim() == ''}
						c:variant={ButtonVariant.filled}>
						Add
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={(ev) => {
						ev.preventDefault()
						if (newListNameText().trim() == '') return;

						addNewTaskList(newListNameText(), newListEmoji())
						closeDialog(dialogNewListRef)
					}}>
					<TextField
						ref={r => textFieldNewListRef = r}
						placeholder="List name"
						onInput={ev => setNewListNameText(ev.currentTarget.value)}
						onFocus={ev => setNewListNameText(ev.currentTarget.value)}
						c:trailing={<TextFieldButton
							id={button_dialogNewList_emojiId}>
							<Show
								when={newListEmoji() == null}
								fallback={<Emoji c:emoji={newListEmoji()!}/>}>
								<Icon c:code={ICON_EMOJI_ADD}/>
							</Show>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialogEditListRef = r}
				c:header="Rename list"
				style={{width: '500px'}}
				onClick={(ev) => {
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogEditList_cancelId:
						closeDialog(dialogEditListRef)
						break
					case button_dialogEditList_renameId:
						renameTaskList()
						closeDialog(dialogEditListRef)
						break
					case button_dialogEditList_emojiId:
						setIsEmojiPickerEditListOpen(true)
						openEmojiPicker(emojiPickerRef)
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogEditList_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogEditList_renameId}
						disabled={
							editListNameText().trim() == ''
							|| (
								editListNameText().trim() == taskLists[selectedTaskListIndexToRename()].name
								&& editListEmoji() == taskLists[selectedTaskListIndexToRename()].emoji
							)
						}
						c:variant={ButtonVariant.filled}>
						Rename
					</Button>
				</>}>
				<form
					style={{display: 'contents'}}
					onSubmit={(ev) => {
						ev.preventDefault()
						if (editListNameText().trim() == ''
							|| (
								editListNameText().trim() == taskLists[selectedTaskListIndexToRename()].name
								&& editListEmoji() == taskLists[selectedTaskListIndexToRename()].emoji
							)
						) return;
						renameTaskList()
						closeDialog(dialogEditListRef)
					}}>
					<TextField
						ref={r => textFieldEditListRef = r}
						placeholder="List name"
						onInput={ev => setEditListNameText(ev.currentTarget.value)}
						onFocus={ev => setEditListNameText(ev.currentTarget.value)}
						c:trailing={<TextFieldButton
							id={button_dialogEditList_emojiId}>
							<Show
								when={editListEmoji() == null}
								fallback={<Emoji c:emoji={editListEmoji()!}/>}>
								<Icon c:code={ICON_EMOJI_ADD}/>
							</Show>
						</TextFieldButton>}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialogDeleteListRef = r}
				style={{width: '500px'}}
				c:header="Delete list"
				onClick={(ev) => {
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_dialogDeleteList_cancelId:
						closeDialog(dialogDeleteListRef)
						break
					case button_dialogDeleteList_deleteId:
						closeDialog(dialogDeleteListRef)
						deleteTaskList()
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_dialogDeleteList_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_dialogDeleteList_deleteId}
						c:variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				<Show when={taskLists[selectedTaskListIndexToDelete()]}>
					<>Are you sure want to delete <q style={{"font-weight": 'bold', color: `rgb(${AppColors.accent})`}}>{taskLists[selectedTaskListIndexToDelete()].name}</q> list? </>
					<>This list contains {taskLists[selectedTaskListIndexToDelete()].tasks.filter(v => !v.complete).length} uncompleted tasks </>
					<>and {taskLists[selectedTaskListIndexToDelete()].tasks.filter(v => v.complete).length} completed tasks</>
				</Show>
			</Dialog>
		</>)
	}

	const ColorPickers: VoidComponent = () => {
		return (<>
			<ColorPicker
				c:color={(changeLabelColorOption() == 'new'
					? selectedLabelToAdd.color
					: selectedLabelToEdit.color
				) ?? undefined}
				c:onToggleOpen={isOpen => setIsColorPickerLabelOpen(isOpen)}
				c:onSelectColor={color => changeLabelColorOption() == 'new'
					? setSelectedlabelToAdd('color', color)
					: setSelectedLabelToEdit('color', color)
				}
				ref={r => colorPickerLabelRef = r}>
				<Show when={(changeLabelColorOption() == 'new'
					? selectedLabelToAdd.color
					: selectedLabelToEdit.color
				) != null}>
					<Button
						style={{width: '100%'}}
						onClick={() => {
							closeColorPicker(colorPickerLabelRef)
							if (changeLabelColorOption() == 'new') setSelectedlabelToAdd('color', null)
							else setSelectedLabelToEdit('color', null)
						}}
						c:variant={ButtonVariant.tonal}>
						<Icon c:code={ICON_CIRCLE_ERASER}/>No color
					</Button>
				</Show>
			</ColorPicker>
		</>)
	}

	const EmojiPickers: VoidComponent = () => (<>
		<EmojiPicker
			ref={r => emojiPickerRef = r}
			onClose={() => {
				setIsEmojiPickerNewListOpen(false)
				setIsEmojiPickerEditListOpen(false)
			}}
			c:onSelectEmoji={e => {
				if (isEmojiPickerNewListOpen()) setNewListEmoji(e)
				if (isEmojiPickerEditListOpen()) setEditListEmoji(e)
			}}>
			<Show when={
				(isEmojiPickerNewListOpen() && newListEmoji() != null)
				|| (isEmojiPickerEditListOpen() && editListEmoji() != null)
			}>
				<div style={{width: '100%', padding: '0 12px 12px 12px'}}>
					<Button
						style={{width: '100%'}}
						c:variant={ButtonVariant.tonal}
						onClick={() => {
							if (isEmojiPickerNewListOpen()) setNewListEmoji(null)
							if (isEmojiPickerEditListOpen()) setEditListEmoji(null)
							closeEmojiPicker(emojiPickerRef)
						}}>
						<Icon c:code={ICON_DISMISS}/>No emoji
					</Button>
				</div>
			</Show>
		</EmojiPicker>
	</>)

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast
				ref={r => toastNoFileRef = r}
				c:leading={<Icon c:code={ICON_DOCUMENT_ERROR}/>}>
				File is not exist
			</Toast>
		</>)
	}

	return (<App
		c:appBar={<AppBar
			taskLists={taskLists}
			isSideNavigationExpanded={isSideNavigationExpanded()}
			command={command}
			page={page()}
			settings={settings}
		/>}
		c:leftSideBar={<SideNavigation
			expanded={isSideNavigationExpanded()}
			tasklists={taskLists}
			command={command}
			page={page()}
			settings={settings}
		/>}>
		<Body
			settings={settings}
			isDBFileError={isDBFileError()}
			page={page()}
			labels={labels}
			taskLists={taskLists}
			command={command}
		/>
		<Dialogs/>
		<ColorPickers/>
		<Toasts/>
		<EmojiPickers/>
	</App>)
}

export default _