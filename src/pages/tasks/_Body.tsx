import type { DOMElement } from "solid-js/jsx-runtime"
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { isDateOutRange_YMD_HM } from "@/utils/datetime"
import { DEFAULT_TASK_LIST } from "./_constants"
import { setAttrIfExist, joinClassListModule } from "@/utils/attributes"
import { stringToTitleCase } from "@/utils/string"
import { isTargetValidElement } from "@/utils/element"
import { pickFile, readFileAsText } from "@/utils/file"
import { isNumberNotDefined } from "@/utils/number"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from "@/constants/key-code"
import { AppCSSColors } from "@/enums/app-data"
import { ICON_ADD, ICON_ADD_CIRCLE, ICON_ADD_SQUARE, ICON_ALERT, ICON_ALERT_BADGE, ICON_ALERT_OFF, ICON_ALERT_URGENT, ICON_APPS_LIST_DETAIL, ICON_ARROW_DOWNLOAD, ICON_ARROW_RIGHT, ICON_ARROW_SORT, ICON_ATTACH, ICON_CALENDAR, ICON_CALENDAR_EDIT, ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_CIRCLE, ICON_COPY, ICON_DELETE, ICON_DELETE_DISMISS, ICON_DELETE_LINES, ICON_DISMISS, ICON_EDIT, ICON_EYE, ICON_HOME, ICON_MORE_VERTICAL, ICON_STAR, ICON_TAG, ICON_TASK_LIST_SQUARE_LTR, ICON_TEXT_CASE_TITLE, ICON_TEXT_EDIT_STYLE, ICON_TEXT_SORT_ASCENDING, ICON_TEXT_SORT_DESCENDING } from "@/constants/icons"

import Divider from "@/components/Divider"
import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Emoji from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import List from "@/components/List"
import TextField, { AreaTextField, updateTextFieldValue, TextFieldButton } from "@/components/TextField"
import Menu, { closeMenu, closeSubMenu, MenuDivider, MenuHeader, MenuIndent, MenuItem, MenuPosition, openMenu, SubMenu, SubMenuItem } from "@/components/Menu"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import Toast, { openToast } from "@/components/Toast"
import DateTimePicker, { DateTimePickerPosition, openDateTimePicker } from "@/components/DateTimePicker"
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
	const [isMenuSortOpen, setIsMenuSortOpen] = createSignal<boolean>(false)
	const [isMenuMoreOpen, setIsMenuMoreOpen] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	let menuSortRef: HTMLDialogElement
	let menuMoreRef: HTMLDialogElement
	let dialogClearTasksRef: HTMLDialogElement
	let dialogDeleteCompletedTasksRef: HTMLDialogElement
	let toastCopiedRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateSortBy(sortBy: SortBy): void {
		command(Commands.updateSortBy, sortBy)
		closeMenu(menuSortRef)
	}

	function updateSortMode(sortMode: SortMode): void {
		command(Commands.updateSortMode, sortMode)
		closeMenu(menuSortRef)
	}

	const Menus: VoidComponent = () => {
		const sortBy: [by: SortBy, name: string, icon_code: number][] = [
			[SortBy.name, 'Name', ICON_TEXT_CASE_TITLE],
			[SortBy.importance, 'Importance', ICON_STAR],
			[SortBy.creationDate, 'Creation date', ICON_CALENDAR],
			[SortBy.completed, 'Completed', ICON_CHECKBOX_CHECKED],
			[SortBy.uncompleted, 'Uncompleted', ICON_CHECKBOX_UNCHECKED],
		]
		const sortMode: [mode: SortMode, name: string, icon_code: number][] = [
			[SortMode.ascending, 'Ascending', ICON_TEXT_SORT_ASCENDING],
			[SortMode.descending, 'Descending', ICON_TEXT_SORT_DESCENDING],
		]
		const buttonMarkAllCompletedId = createUniqueId()
		const buttonMarkAllUncompletedId = createUniqueId()
		const buttonClearTasksId = createUniqueId()
		const buttonDeleteCompletedTasksId = createUniqueId()
		const buttonRenameListId = createUniqueId()
		const buttonDeleteListId = createUniqueId()
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menuSortRef = r}
				c:onToggleOpen={(v) => setIsMenuSortOpen(v)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const dataset = button.dataset
					const dataSortby = dataset.sortby
					if (dataSortby) {
						return updateSortBy(dataSortby as SortBy)
					}

					const dataSortmode = dataset.sortmode
					if (dataSortmode) {
						return updateSortMode(dataSortmode as SortMode)
					}
				}}>
				<MenuHeader>Sort by</MenuHeader>
				<For each={sortBy}>{by =>
					<MenuItem
						c:selected={settings().sortBy == by[0]}
						data-sortby={by[0]}
						c:iconCode={by[2]}>
						{by[1]}
					</MenuItem>
				}</For>
				<MenuDivider/>
				<For each={sortMode}>{mode =>
					<MenuItem
						data-sortmode={mode[0]}
						c:selected={settings().sortMode == mode[0]}
						c:iconCode={mode[2]}>
						{mode[1]}
					</MenuItem>
				}</For>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				ref={r => menuMoreRef = r}
				c:onToggleOpen={(v) => setIsMenuMoreOpen(v)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonMarkAllCompletedId:
						closeMenu(menuMoreRef)
						command(Commands.markAllCompleted, props.taskListIndex)
						break
					case buttonMarkAllUncompletedId:
						closeMenu(menuMoreRef)
						command(Commands.markAllUncompleted, props.taskListIndex)
						break
					case buttonClearTasksId:
						openDialog(dialogClearTasksRef, {important: true})
						closeMenu(menuMoreRef)
						break
					case buttonDeleteCompletedTasksId:
						openDialog(dialogDeleteCompletedTasksRef, {important: true})
						closeMenu(menuMoreRef)
						break
					case buttonRenameListId:
						closeMenu(menuMoreRef)
						command(Commands.renameTaskList, props.taskListIndex)
						break
					case buttonDeleteListId:
						closeMenu(menuMoreRef)
						command(Commands.deleteTaskList, props.taskListIndex)
						break
					}
				}}>
				<Show when={props.isAnyUncompletedTask}>
					<MenuItem
						id={buttonMarkAllCompletedId}
						c:iconCode={ICON_CHECKBOX_CHECKED}>
						Mark all completed
					</MenuItem>
				</Show>
				<Show when={props.isAnyCompletedTask}>
					<MenuItem
						id={buttonMarkAllUncompletedId}
						c:iconCode={ICON_CHECKBOX_UNCHECKED}>
						Mark all uncompleted
					</MenuItem>
				</Show>
				<Show when={props.isAnyTask}>
					<MenuDivider />
					<MenuItem
						id={buttonClearTasksId}
						c:iconCode={ICON_DELETE_DISMISS}>
						Clear tasks
					</MenuItem>
				</Show>
				<Show when={props.isAnyCompletedTask}>
					<MenuItem
						id={buttonDeleteCompletedTasksId}
						c:iconCode={ICON_DELETE_LINES}>
						Delete completed tasks
					</MenuItem>
				</Show>
				<Show when={typeof props.page === 'number'}>
					<Show when={props.isAnyTask}><MenuDivider /></Show>
					<MenuItem
						id={buttonRenameListId}
						c:iconCode={ICON_TEXT_EDIT_STYLE}>
						Rename list
					</MenuItem>
					<MenuItem
						id={buttonDeleteListId}
						c:iconCode={ICON_DELETE}>
						Delete list
					</MenuItem>
				</Show>
			</Menu>
		</>)
	}

	const Dialogs: VoidComponent = () => {
		const buttonClearTasksCancelId = createUniqueId()
		const buttonClearTasksClearId = createUniqueId()
		const buttonDeleteCompletedTasksCancelId = createUniqueId()
		const buttonDeleteCompletedTasksDeleteId = createUniqueId()
		return (<>
			<Dialog
				ref={r => dialogClearTasksRef = r}
				c:header="Clear tasks"
				style={{width: '500px'}}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonClearTasksCancelId:
						closeDialog(dialogClearTasksRef)
						break
					case buttonClearTasksClearId:
						command(Commands.clearTasks, props.taskListIndex)
						closeDialog(dialogClearTasksRef)
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonClearTasksCancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={buttonClearTasksClearId}
						c:variant={ButtonVariant.filled}>
						Clear
					</Button>
				</>}>
				Clearing all tasks will permanently delete them. Are you sure you want to continue?
			</Dialog>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialogDeleteCompletedTasksRef = r}
				c:header={"Delete completed tasks"}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonDeleteCompletedTasksCancelId:
						closeDialog(dialogDeleteCompletedTasksRef)
						break
					case buttonDeleteCompletedTasksDeleteId:
						command(Commands.deleteCompletedTask, props.taskListIndex)
						closeDialog(dialogDeleteCompletedTasksRef)
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonDeleteCompletedTasksCancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={buttonDeleteCompletedTasksDeleteId}
						c:variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				Are you sure want to delete completed tasks?
			</Dialog>
		</>)
	}

	const AppBars: VoidComponent = () => {
		const buttonSortById = createUniqueId()
		const buttonCopyTasksId = createUniqueId()
		const buttonMoreOptionsId = createUniqueId()
		return (<AppBar
			classList={joinClassListModule(CSS.body_appbar)}
			c:leading={props.leading}
			c:headline={props.headline}
			onClick={ev => {
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
				)) return

				switch (button.id) {
				case buttonSortById:
					openMenu(menuSortRef, {anchor: button})
					break
				case buttonCopyTasksId:
					command(Commands.copyTasks, props.isGroup? undefined : props.taskListIndex)
					openToast(toastCopiedRef)
					break
				case buttonMoreOptionsId:
					openMenu(menuMoreRef, {anchor: button})
					break
				}
			}}
			c:trailing={<Tooltip>
				<Show when={props.isAnyTask}>
					<IconButton
						data-tooltip="Sort by"
						c:focused={isMenuSortOpen()}
						id={buttonSortById}
						c:code={ICON_ARROW_SORT}
					/>
					<IconButton
						data-tooltip="Copy tasks"
						id={buttonCopyTasksId}
						c:code={ICON_COPY}
					/>
				</Show>
				<Show when={!props.isGroup && ((props.page == Pages.tasks && props.isAnyTask) || typeof props.page === 'number')}>
					<IconButton
						data-tooltip="More options"
						id={buttonMoreOptionsId}
						c:focused={isMenuMoreOpen()}
						c:code={ICON_MORE_VERTICAL}
					/>
				</Show>
			</Tooltip>}
		/>)
	}

	return (<>
		<AppBars/>
		<Menus />
		<Dialogs />
		<Toast
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Tasks copied
		</Toast>
	</>)
}

const TaskItem: VoidComponent<{
	task: Task
	taskIndex: number
	taskListIndex: number
	labels: (TaskLabel | undefined)[]
}> = (props) => {
	const task = createMemo(() => props.task)
	const taskListIndex = createMemo(() => props.taskListIndex)
	const taskIndex = createMemo(() => props.taskIndex)
	const labels = createMemo(() => props.labels)

	return (<div
		tabindex={0}
		data-taskitem={[taskListIndex(), taskIndex()].join(',')}
		class={CSS.body_task_item}
		data-done={setAttrIfExist(task().complete)}>
		<List
			c:leading={<IconButton
				data-tooltip={`Mark as ${task().complete? 'un' : ''}completed`}
				data-taskitem-complete={[taskListIndex(), taskIndex()].join(',')}
				c:code={task().complete? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}
			/>}
			c:trailing={<>
				<IconButton
					data-tooltip={`Mark as ${task().important? 'not ' : ''}important`}
					data-taskitem-important={[taskListIndex(), taskIndex()].join(',')}
					c:filled={task().important}
					c:code={ICON_STAR}
				/>
				<IconButton
					data-tooltip="Delete task"
					data-taskitem-delete={[taskListIndex(), taskIndex()].join(',')}
					c:code={ICON_DELETE}
				/>
			</>}
			c:subtitle={<>
				{ task().description }
				<Show when={
					task().subtasks.length > 0
					|| task().reminder != null
					|| task().files.length > 0
					|| task().labelIds.length > 0
				}>
					<div class={CSS.body_task_item_tags}>
						<Show when={task().reminder != null}>
							<Button
								data-tooltip={
									"Task reminder" + (isDateOutRange_YMD_HM(
										task().reminder!,
										new Date(),
										new Date(new Date().getFullYear() + 100, 2, 2)
									)? " (outdated)" : "")}
								style={{
									"border-color": isDateOutRange_YMD_HM(
										task().reminder!,
										new Date(),
										new Date(new Date().getFullYear() + 100, 2, 2)
									)? 'rgb(var(--g-color-error))' : undefined
								}}
								data-taskitem-reminder={[taskListIndex(), taskIndex()].join(',')}
								c:variant={ButtonVariant.outlined}>
								<Icon c:filled c:code={ICON_ALERT_URGENT} c:inline/>
								{task().reminder!.toLocaleTimeString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
								})}
							</Button>
						</Show>
						<Show when={task().files.length > 0}>
							<Button
								data-taskitem-files={[taskListIndex(), taskIndex()].join(',')}
								c:variant={ButtonVariant.outlined}>
								<Icon c:filled c:code={ICON_ATTACH} c:inline/>
								{task().files.length} file{task().files.length > 1? "s" : ''}
							</Button>
						</Show>
						<For each={task().labelIds}>{label_id =>
							<Show when={labels()[label_id] != undefined}>
								<Button
									style={{
										"border-color": labels()[label_id]!.color ?? undefined,
										"background-color": labels()[label_id]!.color != null
											? labels()[label_id]!.color + '14'
											: undefined
									}}
									data-taskitem-label={[taskListIndex(), taskIndex(), label_id].join(',')}
									c:variant={ButtonVariant.outlined}>
									<Icon c:filled c:code={ICON_TAG} c:inline/>
									{labels()[label_id]!.name}
								</Button>
							</Show>
						}</For>
					</div>
				</Show>
			</>}>
			{task().name}
		</List>
		<Show when={task().subtasks.length > 0}>
			<div class={CSS.body_task_item_subtasks} onClick={ev => ev.stopPropagation()}>
				<For each={task().subtasks}>{(subtask, index) => <CheckBox
					checked={subtask.complete}
					data-taskitem-subtask={[taskListIndex(), taskIndex(), index()].join(',')}>
					{subtask.name}
				</CheckBox>}</For>
			</div>
		</Show>
	</div>)
}

const EmptyTasks: VoidComponent<{page: Pages | number}> = (props) => {
	const getIcon = createMemo<number>(() => {
		const page = props.page
		switch (page) {
		case Pages.all: return ICON_APPS_LIST_DETAIL
		case Pages.completed: return ICON_CHECKBOX_CHECKED
		case Pages.uncompleted: return ICON_CHECKBOX_UNCHECKED
		case Pages.important: return ICON_STAR
		case Pages.planned: return ICON_ALERT
		}
		return ICON_CHECKBOX_CHECKED
	})
	const getText = createMemo<string>(() => {
		let t = ''
		const page = props.page
		if ([Pages.completed, Pages.uncompleted, Pages.important, Pages.planned].includes(page as Pages)) {
			t = stringToTitleCase(page as Pages)
		}
		return `No ${t} Tasks`
	})
	return (<div class={CSS.body_empty}>
		<Icon c:filled c:code={getIcon()}/>
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
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [isAnyCompletedTask, setIsAnyCompletedTask] = createSignal<boolean>(true)
	const [isAnyUncompletedTask, setIsAnyUncompletedTask] = createSignal<boolean>(true)
	const page = createMemo(() => props.page)
	const taskList = createMemo(() => props.taskList)
	const getHeadline = createMemo<string>(() => page() != Pages.tasks? taskList().name : 'Tasks')
	const isAnyTask = createMemo<boolean>(() => taskList().tasks.length > 0)
	let textFieldNewTaskRef: HTMLInputElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addTask(): void {
		if (
			!(page() == Pages.tasks || typeof page() === 'number')
			|| textFieldNewTaskRef.value.trim() == ''
		) return;

		const listId: number = (page() == Pages.tasks
			? DEFAULT_TASK_LIST.id
			: page() as number
		)

		command(Commands.addTask, {
			description: '',
			complete: false,
			files: [],
			id: -1,
			important: false,
			labelIds: [],
			listId: listId,
			name: textFieldNewTaskRef.value.trim(),
			reminder: null,
			subtasks: []
		} satisfies Task, props.taskListIndex)
		updateTextFieldValue(textFieldNewTaskRef, '')

		textFieldNewTaskRef.focus()
	}

	createEffect(() => {
		const tasks = taskList().tasks
		let isAnyCompletedTask = false
		let isAnyUncompletedTask = false

		for (const task of tasks) {
			if (isAnyCompletedTask && isAnyUncompletedTask) break
			if (task.complete) isAnyCompletedTask = true
			else isAnyUncompletedTask = true
		}

		setIsAnyCompletedTask(isAnyCompletedTask)
		setIsAnyUncompletedTask(isAnyUncompletedTask)
	})

	return (<div
		class={CSS.body_single_task_list}
		data-empty={setAttrIfExist(!isAnyTask())}>
		<AppbarTasks
			command={command}
			taskListIndex={props.taskListIndex}
			page={page()}
			isGroup={false}
			isAnyTask={isAnyTask()}
			isAnyCompletedTask={isAnyCompletedTask()}
			isAnyUncompletedTask={isAnyUncompletedTask()}
			settings={props.settings}
			leading={<Show
				when={taskList().emoji == null}
				fallback={<Emoji c:emoji={taskList().emoji!} />}>
				<Show
					when={page() == Pages.tasks}
					fallback={<Icon c:code={ICON_TASK_LIST_SQUARE_LTR}/>}>
					<Icon c:code={ICON_HOME}/>
				</Show>
			</Show>}
			headline={getHeadline()}
		/>
		<Tooltip>
			<For each={taskList().tasks}>{(task, index) => <TaskItem
				task={task}
				labels={props.labels}
				taskIndex={index()}
				taskListIndex={props.taskListIndex}
			/>}</For>
		</Tooltip>
		<Show when={!isAnyTask()}><EmptyTasks page={page()} /></Show>
		<Show when={isAnyTask()}><div style={{flex: '1'}}></div></Show>
		<form onSubmit={ev => {
			addTask()
			ev.preventDefault()
		}}>
			<Tooltip>
				<TextField
					placeholder="Add task"
					ref={r => textFieldNewTaskRef = r}
					c:trailing={<TextFieldButton
						data-tooltip="Add task"
						onClick={() => addTask()}>
						<Icon c:code={ICON_ADD_SQUARE}/>
					</TextFieldButton>}
				/>
			</Tooltip>
		</form>
	</div>)
}

const GroupTaskList: VoidComponent<{
	page: Pages | number
	taskLists: TaskList[]
	labels: (TaskLabel | undefined)[]
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [isMenuMoreOpen, setIsMenuMoreOpen] = createSignal<boolean>(false)
	const [selectedTaskListToAction, setSelectedTaskListToAction] = createStore<{list: TaskList, taskListIndex: number}>({
		list: {emoji: null, id: -1, name: '', tasks: []},
		taskListIndex: -1
	})
	const page = createMemo(() => props.page)
	const getIcon = createMemo<number>(() => {
		const $page = page()
		if ($page == Pages.all) return ICON_APPS_LIST_DETAIL
		if ($page == Pages.completed) return ICON_CHECKBOX_CHECKED
		if ($page == Pages.uncompleted) return ICON_CHECKBOX_UNCHECKED
		if ($page == Pages.important) return ICON_STAR
		if ($page == Pages.planned) return ICON_ALERT

		return ICON_CHECKBOX_CHECKED
	})
	const isNotEmpty = createMemo<boolean>(() => {
		const $page = page()
		const taskLists = props.taskLists
		return taskLists.some(tasklist => {
			const tasks = tasklist.tasks
			if ($page == Pages.all) return tasks.length > 0
			if ($page == Pages.completed) return tasks.some(task => task.complete)
			if ($page == Pages.uncompleted) return tasks.some(task => !task.complete)
			if ($page == Pages.important) return tasks.some(task => task.important)
			if ($page == Pages.planned) return tasks.some(task => task.reminder != null)
			return false
		})
	})
	let menuMoreRef: HTMLDialogElement
	let toastCopiedRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const TaskListGroup: VoidComponent<{
		taskList: TaskList
		taskListIndex: number
	}> = ($props) => {
		const getHeadline = createMemo<string>(() =>  page() != Pages.tasks? $props.taskList.name : 'Tasks')
		const taskList = createMemo(() => $props.taskList)
		const taskListIndex = createMemo(() => $props.taskListIndex)
		const isAnyTask = createMemo<boolean>(() => {
			const $page = page()
			const tasks = taskList().tasks
			if ($page == Pages.all) return tasks.length > 0
			if ($page == Pages.completed) return tasks.some(task => task.complete)
			if ($page == Pages.uncompleted) return tasks.some(task => !task.complete)
			if ($page == Pages.important) return tasks.some(task => task.important)
			if ($page == Pages.planned) return tasks.some(task => task.reminder != null)
			return false
		})

		function taskCondition(task: Task): boolean {
			const $page = page()
			if ($page == Pages.completed) return task.complete
			if ($page == Pages.uncompleted) return !task.complete
			if ($page == Pages.important) return task.important
			if ($page == Pages.planned) return task.reminder != null
			return true
		}

		const Headline: VoidComponent = () => (<AppBar
			c:headline={getHeadline()}
			c:leading={<Show
				when={taskList().emoji == null}
				fallback={<Emoji c:emoji={taskList().emoji!} />}>
				<Show
					when={taskList().id == DEFAULT_TASK_LIST.id}
					fallback={<Icon c:code={ICON_TASK_LIST_SQUARE_LTR}/>}>
					<Icon c:code={ICON_HOME}/>
				</Show>
			</Show>}
			c:trailing={<IconButton
				data-tooltip="More options"
				c:focused={isMenuMoreOpen() && selectedTaskListToAction.taskListIndex == taskListIndex()}
				onClick={ev => {
					setSelectedTaskListToAction({list: taskList(), taskListIndex: taskListIndex()})
					openMenu(menuMoreRef, {anchor: ev.currentTarget})
				}}
				c:code={ICON_MORE_VERTICAL}
			/>}
		/>)

		return (<Show when={isAnyTask()}>
			<Tooltip>
				<Headline/>
				<For each={taskList().tasks}>{(task, index) =>
					<Show when={taskCondition(task)}>
						<TaskItem
							task={task}
							labels={props.labels}
							taskIndex={index()}
							taskListIndex={taskListIndex()}
						/>
					</Show>
				}</For>
			</Tooltip>
		</Show>)
	}

	return (<div
		class={CSS.body_group_task_list}
		data-empty={setAttrIfExist(!isNotEmpty())}>
		<AppbarTasks
			taskListIndex={-1}
			isAnyTask={isNotEmpty()}
			isAnyCompletedTask={false}
			isAnyUncompletedTask={false}
			command={command}
			isGroup={true}
			settings={props.settings}
			page={page()}
			leading={<Icon c:code={getIcon()}/>}
			headline={stringToTitleCase(page() as Pages)}
		/>
		<Show when={isNotEmpty()} fallback={<EmptyTasks page={page()} />}>
			<For each={props.taskLists}>{(taskList, index) => <TaskListGroup
				taskListIndex={index()}
				taskList={taskList}
			/>}</For>
		</Show>
		<Menu
			ref={r => menuMoreRef = r}
			c:onToggleOpen={isOpen => setIsMenuMoreOpen(isOpen)}>
			<MenuItem
				c:iconCode={ICON_COPY}
				onClick={() => {
					command(Commands.copyTasks, selectedTaskListToAction.taskListIndex)
					closeMenu(menuMoreRef)
					openToast(toastCopiedRef)
				}}>
				Copy tasks
			</MenuItem>
		</Menu>
		<Toast
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Tasks copied
		</Toast>
	</div>)
}

const _: VoidComponent<{
	page: Pages | number
	taskLists: TaskList[]
	settings: Settings
	isDBFileError: boolean
	labels: (TaskLabel | undefined)[]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	type SelectedTask = {
		task: Task
		taskListIndex: number
		taskIndex: number
	}
	type SelectedFile = {
		file: TaskFileMetaData
		taskListIndex: number
		taskIndex: number
		fileIndex: number
	}
	const emptyTask = () => ({
		complete: false,
		description: '',
		files: [],
		id: -1,
		important: false,
		labelIds: [],
		listId: -1,
		name: '',
		reminder: null,
		subtasks: []
	}) satisfies Task
	const emptyFile = () => ({
		id: -1,
		listId: -1,
		name: '',
		size: 0,
		taskId: -1,
		type: ''
	}) satisfies TaskFileMetaData
	const [isMenuTaskActionMoveOpen, setIsMenuTaskActionMoveOpen] = createSignal<boolean>(false)
	const [isMenuTaskActionAddLabelOpen, setIsMenuTaskActionAddLabelOpen] = createSignal<boolean>(false)
	const [isDateTimePickerReminderOpen, setIsDateTimePickerReminderOpen] = createSignal<boolean>(false)
	const [isMenuLabelsOpen, setIsMenuLabelsOpen] = createSignal<boolean>(false)
	const [isMenuFileActionOpen, setIsMenuFileActionOpen] = createSignal<boolean>(false)
	const [isMenuFileAction3Open, setIsMenuFileAction3Open] = createSignal<boolean>(false)
	const [textFile, setTextFile] = createSignal('')
	const [textSubTask, setTextSubTask] = createSignal('')
	const [fileURLOrContent, setFileURLOrContent] = createSignal<string>('')

	// 'edit' = open from left click to task
	// 'action' = open from right click to task
	// 'chip' = open from left click to reminder chip below task name
	const [changeReminderOption, setChangeReminderOption] = createSignal<'edit' | 'action' | 'chip'>('edit')
	const [selectedLabel, setSelectedLabel] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selectedTaskToEdit, setSelectedTaskToEdit] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToAction, setSelectedTaskToAction] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToDelete, setSelectedTaskToDelete] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToFileAction, setSelectedTaskToFileAction] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToChangeReminder, setSelectedTaskToChangeReminder] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToEditLabel, setSelectedTaskToEditLabel] = createStore<SelectedTask>({task: emptyTask(), taskIndex: -1, taskListIndex: -1})
	const [selectedFileToView, setSelectedFileToView] = createStore<SelectedFile>({file: emptyFile(), taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToRename, setSelectedFileToRename] = createStore<SelectedFile>({file: emptyFile(), taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToAction, setSelectedFileToAction] = createStore<SelectedFile>({file: emptyFile(), taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToAction2, setSelectedFileToAction2] = createStore<SelectedFile>({file: emptyFile(), taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedSubTaskToEdit, setSelectedSubTaskToEdit] = createStore<{subTask: SubTask, taskListIndex: number, taskIndex: number, subTaskIndex: number}>({subTask: {complete: false, id: -1, listId: -1, name: '', taskId: -1}, taskListIndex: -1, taskIndex: -1, subTaskIndex: -1})
	const page = createMemo(() => props.page)
	const taskLists = createMemo(() => props.taskLists)
	const settings = createMemo(() => props.settings)
	const getTaskListIndex = createMemo<number | null>(() => {
		const $taskLists = taskLists()
		for (let i = 0; i < $taskLists.length; i++) {
			const taskList = $taskLists[i]
			if (page() == Pages.tasks && taskList.id == DEFAULT_TASK_LIST.id) return i
			if (typeof page() === 'number' && taskList.id == page()) return i
		}
		return null
	})

	// 'edit' = open from left click to task
	// 'action' = open from left click to file chip below task name
	let renameFileOption: 'edit' | 'action' = 'edit'
	let addSubTaskOption: 'edit' | 'action' = 'edit'
	let textFieldNewSubTaskRef: HTMLInputElement
	let textFieldEditSubTaskRef: HTMLInputElement
	let textFieldRenamefileRef: HTMLInputElement
	let menuTaskActionRef: HTMLDialogElement
	let menuReminderRef: HTMLDialogElement
	let menuLabelsRef: HTMLDialogElement
	let menuLabelActionRef: HTMLDialogElement
	let menuLabelAction2Ref: HTMLDialogElement
	let menuFileActionRef: HTMLDialogElement
	let menuFileAction2Ref: HTMLDialogElement
	let menuFileAction3Ref: HTMLDialogElement
	let subMenuMoveTaskRef: HTMLDivElement
	let dateTimePickerReminderRef: HTMLDialogElement
	let dialogFileRenameRef: HTMLDialogElement
	let dialogEditTaskRef: HTMLDialogElement
	let dialogDeleteTaskWarningRef: HTMLDialogElement
	let dialogViewFileRef: HTMLDialogElement
	let dialogNewSubTaskRef: HTMLDialogElement
	let dialogEditSubTaskRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function deleteTask(
		task: Task,
		taskListIndex: number,
		taskIndex: number
	): void {
		if (!settings().showDeleteTaskWarning) {
			closeDialog(dialogDeleteTaskWarningRef)
			closeDialog(dialogEditTaskRef)
			closeMenu(menuTaskActionRef)
			command(Commands.deleteTask, task, taskListIndex, taskIndex)
			return
		}

		setSelectedTaskToDelete({task, taskListIndex: taskListIndex, taskIndex: taskIndex})
		openDialog(dialogDeleteTaskWarningRef, {important: true})
	}

	function editTask(task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToEdit({task, taskListIndex: taskListIndex, taskIndex: taskIndex})
		openDialog(dialogEditTaskRef)
	}

	async function viewFile(
		file: TaskFileMetaData,
		taskListIndex: number,
		taskIndex: number,
		fileIndex: number
	): Promise<void> {
		setSelectedFileToView({file, taskListIndex: taskListIndex, taskIndex: taskIndex, fileIndex: fileIndex})
		const blob = (await command(
			Commands.getFileBlob,
			file,
			taskListIndex,
			taskIndex,
			fileIndex
		) as (Blob | null))
		if (blob == null) return;

		setFileURLOrContent(selectedFileToView.file.type.startsWith('text')
			? await readFileAsText(blob)
			: URL.createObjectURL(blob)
		)
		openDialog(dialogViewFileRef)
	}

	function deleteSubTask(index: number): void {
		setSelectedTaskToEdit(
			'task', 'subtasks',
			subtasks => subtasks
				.slice(0, index)
				.concat(subtasks.slice(index + 1))
		)
		command(
			Commands.editTask,
			selectedTaskToEdit.task,
			selectedTaskToEdit.taskListIndex,
			selectedTaskToEdit.taskIndex
		)
	}

	function editSubTask(
		subTask: SubTask,
		taskListIndex: number,
		taskIndex: number,
		subTaskIndex: number
	): void {
		setSelectedSubTaskToEdit({subTask: subTask, taskListIndex: taskListIndex, taskIndex: taskIndex, subTaskIndex: subTaskIndex})
		updateTextFieldValue(textFieldEditSubTaskRef, subTask.name)
		setTextSubTask(subTask.name)
		openDialog(dialogEditSubTaskRef, {
			important: true,
			contentAutoFocus: true
		})
	}

	function confirmEditSubTask(): void {
		closeDialog(dialogEditSubTaskRef)
		command(
			Commands.editSubTask,
			{...selectedSubTaskToEdit.subTask, name: textSubTask().trim()} satisfies SubTask,
			selectedSubTaskToEdit.taskListIndex,
			selectedSubTaskToEdit.taskIndex,
			selectedSubTaskToEdit.subTaskIndex
		)

		setSelectedTaskToEdit(
			'task', 'subtasks',
			taskLists()[selectedSubTaskToEdit.taskListIndex].tasks[selectedSubTaskToEdit.taskIndex].subtasks
		)
	}

	async function confirmAddSubTask(): Promise<void> {
		const task = addSubTaskOption == 'action'? selectedTaskToAction.task : selectedTaskToEdit.task
		const taskListIndex = addSubTaskOption == 'action'? selectedTaskToAction.taskListIndex : selectedTaskToEdit.taskListIndex
		const taskIndex = addSubTaskOption == 'action'? selectedTaskToAction.taskIndex : selectedTaskToEdit.taskIndex

		closeDialog(dialogNewSubTaskRef)
		const subTasks = (await command(
			Commands.addSubTask,
			{   complete: false,
				id: -1,
				listId: task.listId,
				name: textSubTask().trim(),
				taskId: task.id
			} satisfies SubTask,
			taskListIndex,
			taskIndex
		) as SubTask[])

		if (addSubTaskOption == 'edit') setSelectedTaskToEdit('task', 'subtasks', subTasks)
		else setSelectedTaskToAction('task', 'subtasks', subTasks)
	}

	function confirmFileRename(): void {
		closeDialog(dialogFileRenameRef)

		const s = selectedFileToRename
		const file = s.file
		const taskIndex = s.taskIndex
		const taskListIndex = s.taskListIndex
		const newFile: TaskFileMetaData = {
			id: file.id,
			listId: file.listId,
			name: textFile().trim() + '.' + file.name.replace(/^[^\.]+\./gs, ''),
			size: file.size,
			taskId: file.taskId,
			type: file.type
		}
		command(Commands.editFile, newFile, taskListIndex, taskIndex, s.fileIndex)

		const files = props.taskLists[taskListIndex].tasks[taskIndex].files
		if (renameFileOption == 'edit') setSelectedTaskToEdit('task', 'files', files)
		else if (renameFileOption == 'action') setSelectedTaskToFileAction('task', 'files', files)
	}

	function onContextMenuTask(
		task: Task,
		taskListIndex: number,
		taskIndex: number
	): void {
		setSelectedTaskToAction({task, taskListIndex, taskIndex})
		openMenu(menuTaskActionRef, {position: MenuPosition.centerTopToRight})
	}

	function globalClick(ev: MouseEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const button = document.activeElement! as HTMLButtonElement
		if (!isTargetValidElement(
			ev.currentTarget,
			button,
		)) return

		const dataset = button.dataset
		const dataTaskitemFiles = dataset.taskitemFiles
		if (dataTaskitemFiles) {
			let [taskListIndex, taskIndex] = dataTaskitemFiles.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			setSelectedTaskToFileAction({task, taskListIndex, taskIndex})
			openMenu(menuFileAction2Ref, {
				anchor: button,
				position: MenuPosition.centerBottomToRight
			})
			return
		}

		const dataTaskitemReminder = dataset.taskitemReminder
		if (dataTaskitemReminder) {
			let [taskListIndex, taskIndex] = dataTaskitemReminder.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			setSelectedTaskToChangeReminder({task, taskListIndex, taskIndex})
			openMenu(menuReminderRef, {
				anchor: button,
				position: MenuPosition.centerBottomToRight
			})
			return
		}

		const dataTaskitemDelete = dataset.taskitemDelete
		if (dataTaskitemDelete) {
			let [taskListIndex, taskIndex] = dataTaskitemDelete.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			deleteTask(task, taskListIndex, taskIndex)
			return
		}

		const dataTaskitemImportant = dataset.taskitemImportant
		if (dataTaskitemImportant) {
			let [taskListIndex, taskIndex] = dataTaskitemImportant.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			command(
				Commands.editTask,
				{...task, important: !task.important} satisfies Task,
				taskListIndex,
				taskIndex
			)
			return
		}

		const dataTaskitem = dataset.taskitem
		if (dataTaskitem) {
			let [taskListIndex, taskIndex] = dataTaskitem.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			editTask(task, taskListIndex, taskIndex)
			return
		}

		const dataTaskItemComplete = dataset.taskitemComplete
		if (dataTaskItemComplete) {
			let [taskListIndex, taskIndex] = dataTaskItemComplete.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			command(
				Commands.editTask,
				{...task, complete: !task.complete} satisfies Task,
				taskListIndex,
				taskIndex
			)
			return
		}

		const dataTaskitemLabel = dataset.taskitemLabel
		if (dataTaskitemLabel) {
			let [taskListIndex, taskIndex, labelId] = dataTaskitemLabel.split(
				','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			labelId = Number.parseInt(labelId as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
				|| isNumberNotDefined(labelId)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			const label = props.labels[labelId]!
			setSelectedTaskToEditLabel({task, taskListIndex, taskIndex})
			setSelectedLabel(label)
			openMenu(menuLabelAction2Ref, {
				anchor: button,
				position: MenuPosition.centerBottomToRight
			})
			return
		}
	}

	function globalKeyDown(ev: KeyboardEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const code = ev.code
		const target = ev.target as HTMLElement
		const isPressKey = code == KEY_SPACE || code == KEY_ENTER
		const isArrowUp = code == KEY_ARROW_UP
		const isArrowDown = code == KEY_ARROW_DOWN
		const isArrowRight = code == KEY_ARROW_RIGHT
		const isArrowLeft = code == KEY_ARROW_LEFT
		const isArrowKey = isArrowUp || isArrowDown || isArrowRight || isArrowLeft
		const dataset = target.dataset

		// handle custom interactive element using keyboard
		if (isPressKey) {
			const data_taskitem = dataset.taskitem
			if (data_taskitem) {
				ev.preventDefault()
				target.click()
				return
			}
		}

		// handle move focus
		if (isArrowKey) {
			// Move between subtasks
			const dataTaskitemSubtask = dataset.taskitemSubtask
			if (dataTaskitemSubtask && (isArrowDown || isArrowUp)) {
				const label = target.closest('label')!

				let sibling: Element | null = isArrowUp
					? label.previousElementSibling
					: label.nextElementSibling
				if (!sibling) return

				sibling = sibling.querySelector('input')
				if (!sibling) return

				ev.preventDefault();
				(sibling as HTMLElement).focus()
				return
			}

			const dataTaskitem = dataset.taskitem
			if (dataTaskitem && (isArrowDown || isArrowUp)) {
				const sibling: Element | null = isArrowUp
					? target.previousElementSibling
					: target.nextElementSibling
				if (!sibling) return

				ev.preventDefault();
				(sibling as HTMLElement).focus()
				return
			}
			return
		}
	}

	function globalContextMenu(ev: MouseEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const target = document.activeElement! as HTMLElement
		if (!isTargetValidElement(
			ev.currentTarget,
			target,
		)) return

		const dataset = target.dataset
		const dataTaskItem = dataset.taskitem
		if (dataTaskItem) {
			let [taskListIndex, taskIndex] = dataTaskItem.split(
				','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			onContextMenuTask(task, taskListIndex, taskIndex)
			ev.preventDefault()
			return
		}
	}

	function globalChange(ev: Event & {
		currentTarget: HTMLDivElement
		target: Element
	}): void {
		const target = ev.target as HTMLElement
		const dataset = target.dataset

		// subtask
		const dataTaskitemSubtask = dataset.taskitemSubtask
		if (dataTaskitemSubtask) {
			let [taskListIndex, taskIndex, subTaskIndex] = dataTaskitemSubtask.split(
				','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex || !subTaskIndex) return

			taskListIndex = Number.parseInt(taskListIndex as string)
			taskIndex = Number.parseInt(taskIndex as string)
			subTaskIndex = Number.parseInt(subTaskIndex as string)
			if (
				isNumberNotDefined(taskListIndex)
				|| isNumberNotDefined(taskIndex)
				|| isNumberNotDefined(subTaskIndex)
			) return

			const subtask = props.taskLists[taskListIndex].tasks[taskIndex].subtasks[subTaskIndex]
			command(
				Commands.editSubTask,
				{...subtask, complete: (target as HTMLInputElement).checked} satisfies SubTask,
				taskListIndex,
				taskIndex,
				subTaskIndex
			)
			return
		}
	}

	const SubtaskItem: VoidComponent<{
		subTask: SubTask
		index: number
	}> = ($props) => {
		const subTask = createMemo(() => $props.subTask)
		const index = createMemo(() => $props.index)

		return (<List
			c:trailing={<>
				<IconButton
					data-tooltip="Edit subtask"
					data-subtask-edit-index={index()}
					c:code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Delete subtask"
					data-subtask-delete-index={index()}
					c:code={ICON_DELETE}
				/>
			</>}
			c:leading={<IconButton
				data-tooltip={`Mark as ${subTask().complete? 'un' : ''}completed`}
				data-subtask-complete-index={index()}
				c:code={subTask().complete? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}/>}>
			{subTask().name}
		</List>)
	}

	const FileItem: VoidComponent<{index: number}> = ($props) => {
		const fileIndex = createMemo(() => $props.index)
		const file = createMemo(() => selectedTaskToEdit.task.files[fileIndex()])
		const isTypeNotSupported = createMemo<boolean>(() => !/^(audio|image|video|text)/.test(file().type))
		const getSizeText = createMemo(() => {
			const value = file().size
			const TERA = 1_000_000_000_000
			const GIGA = 1_000_000_000
			const MEGA = 1_000_000
			const KILO = 1_000
			let unitValue = value + ' B'

			if      (value >= TERA) unitValue = Number.parseFloat((value / TERA).toFixed()) + ' TB'
			else if (value >= GIGA) unitValue = Number.parseFloat((value / GIGA).toFixed()) + ' GB'
			else if (value >= MEGA) unitValue = Number.parseFloat((value / MEGA).toFixed()) + ' MB'
			else if (value >= KILO) unitValue = Number.parseFloat((value / KILO).toFixed()) + ' KB'
			return unitValue
		})

		return (<List
			classList={joinClassListModule(CSS.body_file_list_item)}
			c:trailing={<>
				<IconButton
					data-tooltip={"View file" + (isTypeNotSupported()? ' (not supported)' : '')}
					disabled={isTypeNotSupported()}
					data-file-view-index={fileIndex()}
					c:code={ICON_EYE}
				/>
				<IconButton
					data-tooltip="More actions"
					data-file-action-index={fileIndex()}
					c:focused={selectedFileToAction.file.id == file().id && isMenuFileActionOpen()}
					c:code={ICON_MORE_VERTICAL}
				/>
			</>}
			c:subtitle={[getSizeText(), file().type.replace(/\/.+$/gs, '')].join(" • ")}>
			{file().name}
		</List>)
	}

	const LabelItem: VoidComponent<{index: number}> = ($props) => {
		const label = createMemo(() => props.labels[$props.index]!)
		const color = createMemo(() => label().color)
		const name = createMemo(() => label().name)

		return (<List
			c:leading={<Icon style={{color: color() ?? undefined}} c:code={ICON_CIRCLE}/>}
			c:trailing={<>
				<IconButton
					data-tooltip="Edit label"
					data-label-edit-index={$props.index}
					c:code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Remove label from task"
					data-label-remove-index={$props.index}
					c:code={ICON_DISMISS}
				/>
			</>}>
			{ name() }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const input_editTask_taskId = createUniqueId()
		const input_editTask_descriptionId = createUniqueId()
		const button_editTask_closeId = createUniqueId()
		const button_editTask_markCompleteId = createUniqueId()
		const button_editTask_AddSubTaskId = createUniqueId()
		const button_editTask_addLabelId = createUniqueId()
		const button_editTask_addReminderId = createUniqueId()
		const button_editTask_addFileId = createUniqueId()
		const button_editTask_changeReminderId = createUniqueId()
		const button_editTask_removeReminderId = createUniqueId()
		const button_editTask_markImportantId = createUniqueId()
		const button_editTask_deleteTaskId = createUniqueId()
		const button_deleteTask_cancelId = createUniqueId()
		const button_deleteTask_deleteId = createUniqueId()
		const button_fileRename_cancelId = createUniqueId()
		const button_fileRename_renameId = createUniqueId()
		const button_viewFile_closeId = createUniqueId()
		const button_viewFile_downloadId = createUniqueId()
		const button_newSubTask_closeId = createUniqueId()
		const button_newSubTask_addId = createUniqueId()
		const button_editSubTask_closeId = createUniqueId()
		const button_editSubTask_editId = createUniqueId()
		return (<>
			<Dialog
				ref={r => dialogEditTaskRef = r}
				c:header='Edit task'
				style={{width: '500px'}}
				classList={joinClassListModule(CSS.body_dialog_edit)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (button.id) {
					case button_editTask_closeId:
						closeDialog(dialogEditTaskRef)
						break
					case button_editTask_markCompleteId:
						command(Commands.editTask,
							{...task, complete: !task.complete} satisfies Task,
							taskListIndex, taskIndex
						)

						setSelectedTaskToEdit('task', task)
						break
					case button_editTask_AddSubTaskId:
						addSubTaskOption = 'edit'
						openDialog(dialogNewSubTaskRef, {
							important: true,
							contentAutoFocus: true
						})
						break
					case button_editTask_addLabelId:
						openMenu(menuLabelsRef, {
							anchor: button,
							position: MenuPosition.centerBottomToRight
						})
						break
					case button_editTask_addReminderId:
						setChangeReminderOption('edit')
						openDateTimePicker(dateTimePickerReminderRef, {
							anchor: button,
							position: DateTimePickerPosition.centerBottomToRight
						})
						break
					case button_editTask_changeReminderId:
						setChangeReminderOption('edit')
						openDateTimePicker(dateTimePickerReminderRef, {
							anchor: button,
							position: DateTimePickerPosition.centerBottomToRight
						})
						break
					case button_editTask_removeReminderId:
						setSelectedTaskToEdit('task', 'reminder', null)
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					case button_editTask_addFileId:
						pickFile(null, true).then(async (files) => {
							if (files == null) return;
							const result = (await command(
								Commands.addFiles,
								files,
								task,
								taskListIndex,
								taskIndex
							) as TaskFileMetaData[])
							setSelectedTaskToEdit('task', 'files', result)
						})
						break
					case button_editTask_markImportantId:
						setSelectedTaskToEdit('task', 'important', t => !t)
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					case button_editTask_deleteTaskId:
						deleteTask(task, taskListIndex, taskIndex)
						break
					default:
						const dataset = button.dataset
						const dataSubtaskEditIndex = dataset.subtaskEditIndex
						if (dataSubtaskEditIndex) {
							const index = Number.parseInt(dataSubtaskEditIndex)
							if (isNumberNotDefined(index)) return

							editSubTask(
								task.subtasks[index], taskListIndex, taskIndex, index
							)
							return
						}

						const dataSubtaskDeleteIndex = dataset.subtaskDeleteIndex
						if (dataSubtaskDeleteIndex) {
							const index = Number.parseInt(dataSubtaskDeleteIndex)
							if (isNumberNotDefined(index)) return

							deleteSubTask(index)
							return
						}

						const dataSubTaskCompleteIndex = dataset.subtaskCompleteIndex
						if (dataSubTaskCompleteIndex) {
							const index = Number.parseInt(dataSubTaskCompleteIndex)
							if (isNumberNotDefined(index)) return

							const subtask = task.subtasks[index]
							const $subtask: SubTask = {
								...subtask,
								complete: !subtask.complete
							}
							command(Commands.editSubTask,
								$subtask, taskListIndex, taskIndex, index
							)
							setSelectedTaskToEdit('task', 'subtasks', index, $subtask)
							return
						}

						const dataLabelEditIndex = dataset.labelEditIndex
						if (dataLabelEditIndex) {
							const index = Number.parseInt(dataLabelEditIndex)
							if (isNumberNotDefined(index)) return

							setSelectedLabel(props.labels[index]!)
							command(Commands.editLabel, selectedLabel)
							return
						}

						const dataLabelRemoveIndex = dataset.labelRemoveIndex
						if (dataLabelRemoveIndex) {
							const index = Number.parseInt(dataLabelRemoveIndex)
							if (isNumberNotDefined(index)) return

							const i = selectedTaskToEdit.task.labelIds.findIndex(
								$id => $id == props.labels[index]!.id
							)
							if (i < 0) return

							setSelectedTaskToEdit('task', 'labelIds', produce((ids) => {
								ids.splice(i, 1)
							}))
							command(Commands.editTask, task, taskListIndex, taskIndex)
							return
						}

						const dataFileViewIndex = dataset.fileViewIndex
						if (dataFileViewIndex) {
							const index = Number.parseInt(dataFileViewIndex)
							if (isNumberNotDefined(index)) return

							viewFile(task.files[index], taskListIndex, taskIndex, index)
							return
						}

						const dataFileActionIndex = dataset.fileActionIndex
						if (dataFileActionIndex) {
							const index = Number.parseInt(dataFileActionIndex)
							if (isNumberNotDefined(index)) return

							setSelectedFileToAction({
								file: task.files[index],
								fileIndex: index,
								taskIndex: taskIndex,
								taskListIndex: taskListIndex
							})
							openMenu(menuFileActionRef, {anchor: button})
							return
						}
					}
				}}
				onFocusOut={ev => {
					const input = ev.target as HTMLInputElement
					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (input.id) {
					case input_editTask_taskId:
						if (input.value == task.name) return

						setSelectedTaskToEdit('task', 'name', input.value)
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					case input_editTask_descriptionId:
						const value = input.value
						if (value == task.description) return

						setSelectedTaskToEdit('task', 'description', value)
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					}
				}}
				c:actions={<>
					<Button
						c:variant={ButtonVariant.tonal}
						id={button_editTask_closeId}>
						Close
					</Button>
					<Button
						c:variant={ButtonVariant.filled}
						id={button_editTask_markCompleteId}>
						Mark as {selectedTaskToEdit.task.complete? "not" : ''} completed
					</Button>
				</>}>
				<TextField
					c:label="Task"
					value={selectedTaskToEdit.task.name}
					id={input_editTask_taskId}
				/>
				<AreaTextField
					c:label="Description"
					c:maxLine={3}
					id={input_editTask_descriptionId}
					value={selectedTaskToEdit.task.description}
				/>
				<div data-subtasks>
					<Tooltip>
						<For each={selectedTaskToEdit.task.subtasks}>{ (subtask, index) => <SubtaskItem
							subTask={subtask}
							index={index()}
						/>}</For>
					</Tooltip>
					<Button
						id={button_editTask_AddSubTaskId}>
						<Icon c:code={ICON_ADD_CIRCLE}/>Add subtask
					</Button>
				</div>
				<Divider />
				<div data-label>
					<Tooltip>
						<For each={selectedTaskToEdit.task.labelIds}>{label_id =>
							<Show when={props.labels[label_id] != undefined}>
								<LabelItem index={label_id} />
							</Show>
						}</For>
					</Tooltip>
					<Button
						c:focused={isMenuLabelsOpen()}
						id={button_editTask_addLabelId}>
						<Icon c:code={ICON_TAG}/>Add label
					</Button>
				</div>
				<Divider />
				<div data-reminder>
					<Show
						when={selectedTaskToEdit.task.reminder != null}
						fallback={<Button
							id={button_editTask_addReminderId}
							c:focused={isDateTimePickerReminderOpen()}>
							<Icon c:code={ICON_ALERT_BADGE}/>Add reminder
						</Button>}>
						<List
							c:trailing={<Tooltip>
								<IconButton
									id={button_editTask_changeReminderId}
									data-tooltip="Change datetime reminder"
									c:code={ICON_CALENDAR_EDIT}
								/>
								<IconButton
									id={button_editTask_removeReminderId}
									data-tooltip="Remove reminder"
									c:code={ICON_ALERT_OFF}
								/>
							</Tooltip>}
							c:leading={<Icon c:code={ICON_ALERT_URGENT}/>}>
							<span style={{
								color: isDateOutRange_YMD_HM(
									selectedTaskToEdit.task.reminder!,
									new Date(),
									new Date(new Date().getFullYear() + 100, 2, 2)
								)? 'rgb(var(--g-color-error))' : undefined
							}}>{selectedTaskToEdit.task.reminder!.toLocaleTimeString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
								})}</span>
						</List>
					</Show>
				</div>
				<Divider />
				<Show when={!props.isDBFileError}>
					<div data-file>
						<Tooltip>
							<For each={selectedTaskToEdit.task.files}>{(_, index) =>
								<FileItem index={index()}/>
							}</For>
						</Tooltip>
						<Button id={button_editTask_addFileId}>
							<Icon c:code={ICON_ATTACH}/>Add file
						</Button>
					</div>
					<Divider />
				</Show>
				<div data-important>
					<Button id={button_editTask_markImportantId}>
						<Icon c:filled={selectedTaskToEdit.task.important} c:code={ICON_STAR}/>
						Mark as {selectedTaskToEdit.task.important? 'not' : ''} important
					</Button>
				</div>
				<div data-delete>
					<Button
						id={button_editTask_deleteTaskId}
						style={{color: `rgb(${AppCSSColors.error})`}}>
						<Icon c:code={ICON_DELETE}/>
						Delete task
					</Button>
				</div>
			</Dialog>
			<Dialog
				c:header="Delete task"
				style={{width: '560px'}}
				ref={r => dialogDeleteTaskWarningRef = r}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const task = selectedTaskToDelete.task
					const taskListIndex = selectedTaskToDelete.taskListIndex
					const taskIndex = selectedTaskToDelete.taskIndex
					switch (button.id) {
					case button_deleteTask_cancelId:
						closeDialog(dialogDeleteTaskWarningRef)
						break
					case button_deleteTask_deleteId:
						closeDialog(dialogDeleteTaskWarningRef)
						closeDialog(dialogEditTaskRef)
						closeMenu(menuTaskActionRef)
						command(Commands.deleteTask, task, taskListIndex, taskIndex)
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_deleteTask_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_deleteTask_deleteId}
						c:variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				Are you sure want to delete <q><span style={{color: `rgb(${AppCSSColors.accent})`, "font-weight": 'bold'}}>{(selectedTaskToDelete.task.name) || ''}</span></q> task?
				<CheckBox
					c:attrLabel={{style: "margin-top: 16px"}}
					onChange={ev => command(Commands.toggleDeleteTaskWarning, !ev.currentTarget.checked)}>
					Don't remind me again
				</CheckBox>
			</Dialog>
			<Dialog
				ref={r => dialogFileRenameRef = r}
				style={{width: '500px'}}
				c:header="Rename file"
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_fileRename_cancelId:
						closeDialog(dialogFileRenameRef)
						break
					case button_fileRename_renameId:
						confirmFileRename()
						break
					}
				}}
				c:actions={<>
					<Button
						c:variant={ButtonVariant.tonal}
						id={button_fileRename_cancelId}>
						Cancel
					</Button>
					<Button
						c:variant={ButtonVariant.filled}
						id={button_fileRename_renameId}
						disabled={textFile().trim() == ''}>
						Rename
					</Button>
				</>}>
				<form onSubmit={ev => {
					ev.preventDefault()
					if (textFile().trim() == '') return;

					confirmFileRename()
				}}>
					<TextField
						ref={r => textFieldRenamefileRef = r}
						autofocus
						onInput={ev => setTextFile(ev.currentTarget.value)}
						placeholder="File name"
					/>
				</form>
			</Dialog>
			<Dialog
				style={{width: '720px'}}
				ref={r => dialogViewFileRef = r}
				onClose={() => {
					if (!selectedFileToView.file.type.startsWith('text')) {
						URL.revokeObjectURL(fileURLOrContent())
					}
					setFileURLOrContent('')
				}}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const file = selectedFileToView.file
					const taskListIndex = selectedFileToView.taskListIndex
					const taskIndex = selectedFileToView.taskIndex
					const fileIndex = selectedFileToView.fileIndex
					switch (button.id) {
					case button_viewFile_closeId:
						closeDialog(dialogViewFileRef)
						break
					case button_viewFile_downloadId:
						command(Commands.downloadFile,
							file, taskListIndex, taskIndex, fileIndex
						)
						break
					}
				}}
				c:header={selectedFileToView.file.name}
				c:actions={<>
					<Button
						id={button_viewFile_closeId}
						c:variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						c:variant={ButtonVariant.filled}
						id={button_viewFile_downloadId}>
						Download
					</Button>
				</>}>
				<Show when={fileURLOrContent() != ''}>
					<Switch>
						<Match when={selectedFileToView.file.type.startsWith('image')}>
							<img src={fileURLOrContent()} width={'100%'}/>
						</Match>
						<Match when={selectedFileToView.file.type.startsWith('video')}>
							<video src={fileURLOrContent()} autoplay controls width={'100%'}></video>
						</Match>
						<Match when={selectedFileToView.file.type.startsWith('audio')}>
							<audio src={fileURLOrContent()} autoplay controls style={{width: '100%'}}></audio>
						</Match>
						<Match when={selectedFileToView.file.type.startsWith('text')}>
							<pre><code style="white-space:normal">{fileURLOrContent()}</code></pre>
						</Match>
					</Switch>
				</Show>
			</Dialog>
			<Dialog
				ref={r => dialogNewSubTaskRef = r}
				style={{width: '500px'}}
				c:header="New subtask"
				onClose={() => {
					setTextSubTask('')
					updateTextFieldValue(textFieldNewSubTaskRef, '')
				}}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_newSubTask_closeId:
						closeDialog(dialogNewSubTaskRef)
						break
					case button_newSubTask_addId:
						confirmAddSubTask()
						break
					}
				}}
				c:actions={<>
					<Button
						c:variant={ButtonVariant.tonal}
						id={button_newSubTask_closeId}>
						Close
					</Button>
					<Button
						c:variant={ButtonVariant.filled}
						id={button_newSubTask_addId}
						disabled={textSubTask().trim() == ''}>
						Add
					</Button>
				</>}>
				<form onSubmit={ev => {
					ev.preventDefault()
					if (textSubTask().trim() == '') return;

					confirmAddSubTask()
				}}>
					<TextField
						ref={r => textFieldNewSubTaskRef = r}
						placeholder="Subtask name"
						onFocus={ev => setTextSubTask(ev.currentTarget.value)}
						onInput={ev => setTextSubTask(ev.currentTarget.value)}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialogEditSubTaskRef = r}
				style={{width: '500px'}}
				c:header="Edit subtask"
				onClose={() => {
					setTextSubTask('')
					updateTextFieldValue(textFieldEditSubTaskRef, '')
				}}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_editSubTask_closeId:
						closeDialog(dialogEditSubTaskRef)
						break
					case button_editSubTask_editId:
						confirmEditSubTask()
						break
					}
				}}
				c:actions={<>
					<Button
						id={button_editSubTask_closeId}
						c:variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_editSubTask_editId}
						c:variant={ButtonVariant.filled}
						disabled={textSubTask().trim() == ''}>
						Edit
					</Button>
				</>}>
				<form style="display:contents" onSubmit={ev => {
					ev.preventDefault()
					if (textSubTask().trim() == '') return;
					confirmEditSubTask()
				}}>
					<TextField
						ref={r => textFieldEditSubTaskRef = r}
						placeholder="Subtask name"
						onFocus={ev => setTextSubTask(ev.currentTarget.value)}
						onInput={ev => setTextSubTask(ev.currentTarget.value)}
					/>
				</form>
			</Dialog>
		</>)
	}

	const Menus: VoidComponent = () => {
		const button_taskActions_markCompleteId = createUniqueId()
		const button_taskActions_markImportantId = createUniqueId()
		const button_taskActions_addFileId = createUniqueId()
		const button_taskActions_addSubTaskId = createUniqueId()
		const button_taskActions_addReminderId = createUniqueId()
		const button_taskActions_editTaskId = createUniqueId()
		const button_taskActions_deleteTaskId = createUniqueId()
		const button_reminder_changedId = createUniqueId()
		const button_reminder_removeId = createUniqueId()
		const button_labels_newId = createUniqueId()
		const button_labels_editId = createUniqueId()
		const button_labelActions_editId = createUniqueId()
		const button_labelActions_deleteId = createUniqueId()
		const button_labelActions_edit2Id = createUniqueId()
		const button_labelActions_delete2Id = createUniqueId()
		const button_fileAction_downloadId = createUniqueId()
		const button_fileAction_renameId = createUniqueId()
		const button_fileAction_deleteId = createUniqueId()
		const button_fileAction3_viewId = createUniqueId()
		const button_fileAction3_renameId = createUniqueId()
		const button_fileAction3_downloadId = createUniqueId()
		const button_fileAction3_deleteId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuTaskActionRef = r}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return
					const task = selectedTaskToAction.task
					const taskListIndex = selectedTaskToAction.taskListIndex
					const taskIndex = selectedTaskToAction.taskIndex

					switch (button.id){
					case button_taskActions_markCompleteId:
						closeMenu(menuTaskActionRef)
						command(Commands.editTask,
							{ ...task, complete: !task.complete } satisfies Task,
							taskListIndex, taskIndex
						)
						break
					case button_taskActions_markImportantId:
						closeMenu(menuTaskActionRef)
						command(Commands.editTask,
							{ ...task, important: !task.important } satisfies Task,
							taskListIndex, taskIndex
						)
						break
					case button_taskActions_addFileId:
						closeMenu(menuTaskActionRef)
						pickFile(null, true).then(async (files) => {
							if (files == null) return;
							const result = await command(Commands.addFiles,
								files, task, taskListIndex, taskIndex
							) as TaskFileMetaData[]
							setSelectedTaskToAction('task', 'files', result)
						})
						break
					case button_taskActions_addSubTaskId:
						closeMenu(menuTaskActionRef)
						addSubTaskOption = 'action'
						openDialog(dialogNewSubTaskRef, {
							important: true,
							contentAutoFocus: true
						})
						break
					case button_taskActions_addReminderId:
						closeMenu(menuTaskActionRef)
						setChangeReminderOption('action')
						openDateTimePicker(dateTimePickerReminderRef)
						break
					case button_taskActions_editTaskId:
						closeMenu(menuTaskActionRef)
						editTask(task, taskListIndex, taskIndex)
						break
					case button_taskActions_deleteTaskId:
						deleteTask(task, taskListIndex, taskIndex)
						break
					default:
						const dataset = button.dataset
						const dataLabelId = dataset.labelId
						if (dataLabelId) {
							const labelId = Number.parseInt(dataLabelId)
							if (isNumberNotDefined(labelId)) return

							const index = task.labelIds.findIndex(id => id == labelId)
							setSelectedTaskToAction('task', 'labelIds', produce(ids => {
								if (index >= 0) {
									ids.splice(index, 1)
									return
								}
								ids.push(labelId)
							}))
							command(Commands.editTask, task, taskListIndex, taskIndex)
							return
						}

						const dataTasklistIndex = dataset.tasklistIndex
						if (dataTasklistIndex) {
							const i = Number.parseInt(dataTasklistIndex)
							if (isNumberNotDefined(i)) return

							command(Commands.moveTask, task, taskListIndex, taskIndex, i)
							closeSubMenu(subMenuMoveTaskRef)
							closeMenu(menuTaskActionRef)
							return
						}
					}
				}}>
				<MenuItem
					id={button_taskActions_markCompleteId}
					c:iconCode={selectedTaskToAction.task.complete? ICON_CHECKBOX_UNCHECKED : ICON_CHECKBOX_CHECKED}
					c:trailing={<MenuIndent />}>
					Mark as {selectedTaskToAction.task.complete? 'not' : ''} completed
				</MenuItem>
				<MenuItem
					id={button_taskActions_markImportantId}
					c:leading={<Icon c:code={ICON_STAR} c:filled={!((selectedTaskToAction.task.important) || false)}/>}
					c:trailing={<MenuIndent />}>
					Mark as {selectedTaskToAction.task.important? 'not' : ''} important
				</MenuItem>
				<MenuDivider />
				<Show when={!props.isDBFileError}>
					<MenuItem
						c:iconCode={ICON_ATTACH}
						c:trailing={<MenuIndent />}
						id={button_taskActions_addFileId}>
						Add file
					</MenuItem>
				</Show>
				<MenuItem
					c:iconCode={ICON_ADD_CIRCLE}
					id={button_taskActions_addSubTaskId}
					c:trailing={<MenuIndent />}>
					Add subtask
				</MenuItem>
				<Show when={selectedTaskToAction.task.reminder == null}>
					<MenuItem
						id={button_taskActions_addReminderId}
						c:iconCode={ICON_ALERT}
						c:trailing={<MenuIndent />}>
						Add reminder
					</MenuItem>
				</Show>
				<Show when={props.labels.length > 0}>
					<SubMenu
						c:onToggleOpen={v => setIsMenuTaskActionAddLabelOpen(v)}
						c:item={<SubMenuItem
							c:focused={isMenuTaskActionAddLabelOpen()}
							c:iconCode={ICON_TAG}>
							Add label
						</SubMenuItem>}>
						<For each={props.labels}>{label => <Show when={label != undefined}>
							<MenuItem
								c:leading={<Icon style={{color: label!.color ?? undefined}} c:code={ICON_CIRCLE}/>}
								c:checked={selectedTaskToAction.task.labelIds.includes(label!.id)}
								data-label-id={label!.id}>
								{label!.name}
							</MenuItem>
						</Show>}</For>
					</SubMenu>
				</Show>
				<MenuDivider />
				<SubMenu
					ref={r => subMenuMoveTaskRef = r}
					style={{"min-width": '200px'}}
					c:onToggleOpen={v => setIsMenuTaskActionMoveOpen(v)}
					c:item={<SubMenuItem
						c:focused={isMenuTaskActionMoveOpen()}
						c:iconCode={ICON_ARROW_RIGHT}>
						Move task to ...
					</SubMenuItem>}>
					<For each={props.taskLists}>{(list, i) => <>
						<MenuItem
							data-tasklist-index={i()}
							style={{order: list.id == DEFAULT_TASK_LIST.id? '-2' : undefined}}
							c:iconCode={list.id == DEFAULT_TASK_LIST.id
								? ICON_HOME
								: list.emoji == null
									? ICON_TASK_LIST_SQUARE_LTR
									: undefined
							}
							c:leading={<Show
								when={list.emoji != null && list.id != DEFAULT_TASK_LIST.id}>
								<Emoji c:emoji={list.emoji!} />
							</Show>}
							c:selected={i() == getTaskListIndex()}>
							{list.name}
						</MenuItem>
						<Show when={props.taskLists.length > 1 && list.id == DEFAULT_TASK_LIST.id}>
							<MenuDivider style={{order: '-1'}}/>
						</Show>
					</>}</For>
				</SubMenu>
				<MenuDivider />
				<MenuItem
					id={button_taskActions_editTaskId}
					c:iconCode={ICON_EDIT}
					c:trailing={<MenuIndent />}>
					Edit task
				</MenuItem>
				<MenuItem
					id={button_taskActions_deleteTaskId}
					c:iconCode={ICON_DELETE}
					c:trailing={<MenuIndent />}>
					Delete task
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menuReminderRef = r}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_reminder_changedId:
						closeMenu(menuReminderRef)
						setChangeReminderOption('chip')
						openDateTimePicker(dateTimePickerReminderRef)
						break
					case button_reminder_removeId:
						closeMenu(menuReminderRef)
						setSelectedTaskToChangeReminder('task', 'reminder', null)
						command(
							Commands.editTask,
							selectedTaskToChangeReminder.task,
							selectedTaskToChangeReminder.taskListIndex,
							selectedTaskToChangeReminder.taskIndex
						)
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_CALENDAR_EDIT}
					id={button_reminder_changedId}>
					Change datetime reminder
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_ALERT_OFF}
					id={button_reminder_removeId}>
					Remove reminder
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menuLabelsRef = r}
				c:onToggleOpen={is_open => setIsMenuLabelsOpen(is_open)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (button.id) {
						case button_labels_newId:
							command(Commands.addLabel)
							break
						case button_labels_editId:
							closeDialog(dialogEditTaskRef)
							closeMenu(menuLabelsRef)
							command(Commands.showLabelsOptions)
							break
						default:
							const dataset = button.dataset
							const dataLabelIndex = dataset.labelIndex
							if (dataLabelIndex) {
								const labelIndex = Number.parseInt(dataLabelIndex)
								if (isNumberNotDefined(labelIndex)) return

								const labelId = props.labels![labelIndex]!.id
								const index = task.labelIds.findIndex(id => id == labelId)
								setSelectedTaskToEdit('task', 'labelIds', produce(ids => {
									if (index < 0) {
										ids.push(labelId)
										return
									}
									ids.splice(index, 1)
								}))
								command(Commands.editTask, task, taskListIndex, taskIndex)
								return
							}
					}
				}}
				onContextMenu={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const dataset = button.dataset
					const dataLabelIndex = dataset.labelIndex
					if (dataLabelIndex) {
						const labelIndex = Number.parseInt(dataLabelIndex)
						if (isNumberNotDefined(labelIndex)) return

						const label = props.labels![labelIndex]!
						setSelectedLabel(label)
						ev.preventDefault()
						openMenu(menuLabelActionRef, {position: MenuPosition.centerBottomToRight})
						return
					}
				}}>
				<MenuItem
					id={button_labels_newId}
					c:iconCode={ICON_ADD}>
					New label
				</MenuItem>
				<Show when={props.labels.length > 0}>
					<MenuItem
						id={button_labels_editId}
						c:iconCode={ICON_EDIT}>
						Edit labels
					</MenuItem>
					<Divider/>
				</Show>
				<For each={props.labels}>{(label, i) => <Show when={label != undefined}>
					<MenuItem
						c:leading={<Icon style={{color: label!.color ?? undefined}} c:code={ICON_CIRCLE}/>}
						c:checked={selectedTaskToEdit.task.labelIds.includes(label!.id)}
						data-label-index={i()}>
						{label!.name}
					</MenuItem>
				</Show>}</For>
			</Menu>
			<Menu
				ref={r => menuLabelActionRef = r}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case button_labelActions_editId:
						closeMenu(menuLabelActionRef)
						command(Commands.editLabel, selectedLabel)
						break
					case button_labelActions_deleteId:
						closeMenu(menuLabelActionRef)
						command(Commands.deleteLabel, selectedLabel)
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_EDIT}
					id={button_labelActions_editId}>
					Edit label
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_DELETE}
					id={button_labelActions_deleteId}>
					Delete label
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menuLabelAction2Ref = r}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const task = selectedTaskToEditLabel.task
					const taskListIndex = selectedTaskToEditLabel.taskListIndex
					const taskIndex = selectedTaskToEditLabel.taskIndex
					switch (button.id) {
					case button_labelActions_edit2Id:
						closeMenu(menuLabelAction2Ref)
						command(Commands.editLabel, selectedLabel)
						break
					case button_labelActions_delete2Id:
						closeMenu(menuLabelAction2Ref)
						const index = task.labelIds.findIndex(v => v == selectedLabel.id)
						if (index < 0) return;

						setSelectedTaskToEditLabel('task', 'labelIds', produce(ids => {
							ids.splice(index, 1)
						}))
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_EDIT}
					id={button_labelActions_edit2Id}>
					Edit label
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_DISMISS}
					id={button_labelActions_delete2Id}>
					Remove label from task
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menuFileActionRef = r}
				c:onToggleOpen={is_open => setIsMenuFileActionOpen(is_open)}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const file = selectedFileToAction.file
					const taskListIndex = selectedFileToAction.taskListIndex
					const taskIndex = selectedFileToAction.taskIndex
					const fileIndex = selectedFileToAction.fileIndex
					switch (button.id) {
					case button_fileAction_downloadId:
						closeMenu(menuFileActionRef)
						command(Commands.downloadFile,
							file, taskListIndex, taskIndex, fileIndex
						)
						break
					case button_fileAction_renameId:
						closeMenu(menuFileActionRef)

						const text = file.name.replace(/\.[^\.]*$/, '')
						updateTextFieldValue(textFieldRenamefileRef, text)
						setTextFile(text)
						setSelectedFileToRename({...selectedFileToAction})
						renameFileOption = 'edit'
						openDialog(dialogFileRenameRef, {
							contentAutoFocus: true,
							important: true
						})
						break
					case button_fileAction_deleteId:
						closeMenu(menuFileActionRef)
						setSelectedTaskToEdit('task', 'files', produce(files => {
							files.splice(fileIndex, 1)
						}))
						command(Commands.editTask,
							props.taskLists[taskListIndex].tasks[taskIndex],
							taskListIndex, taskIndex
						)
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_ARROW_DOWNLOAD}
					id={button_fileAction_downloadId}>
					Download
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_EDIT}
					id={button_fileAction_renameId}>
					Rename
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_DELETE}
					id={button_fileAction_deleteId}>
					Delete
				</MenuItem>
			</Menu>
			<Menu
				style={{'min-width': '164px'}}
				ref={r => menuFileAction2Ref = r}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const dataset = button.dataset
					const dataFileIndex = dataset.fileIndex
					if (dataFileIndex) {
						const file_index = Number.parseInt(dataFileIndex)
						if (isNumberNotDefined(file_index)) return

						setSelectedFileToAction2({
							file: selectedTaskToFileAction.task.files[file_index],
							fileIndex: file_index,
							taskIndex: selectedTaskToFileAction.taskIndex,
							taskListIndex: selectedTaskToFileAction.taskListIndex
						})
						openMenu(menuFileAction3Ref, {
							anchor: ev.currentTarget,
							position: MenuPosition.rightCenterToBottom
						})
						return
					}
				}}>
				<For each={selectedTaskToFileAction.task.files}>{(file, index) =>
					<MenuItem
						c:focused={isMenuFileAction3Open() && file.id == selectedFileToAction2.file.id}
						data-file-index={index()}>
						{file.name}
					</MenuItem>
				}</For>
			</Menu>
			<Menu
				style={{'min-width': '164px'}}
				onClick={ev => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const file = selectedFileToAction2.file
					const taskListIndex = selectedFileToAction2.taskListIndex
					const taskIndex = selectedFileToAction2.taskIndex
					const fileIndex = selectedFileToAction2.fileIndex
					const task = props.taskLists[taskListIndex].tasks[taskIndex]
					switch (button.id) {
					case button_fileAction3_viewId:
						closeMenu(menuFileAction3Ref)
						viewFile(file, taskListIndex, taskIndex, fileIndex)
						break
					case button_fileAction3_renameId:
						closeMenu(menuFileAction3Ref)

						const text = file.name.replace(/\.[^\.]*$/, '')
						updateTextFieldValue(textFieldRenamefileRef, text)
						setTextFile(text)
						setSelectedFileToRename({...selectedFileToAction2})
						renameFileOption = 'action'
						openDialog(dialogFileRenameRef, {
							contentAutoFocus: true,
							important: true
						})
						break
					case button_fileAction3_downloadId:
						closeMenu(menuFileAction3Ref)
						command(Commands.downloadFile,
							file, taskListIndex, taskIndex, fileIndex
						)
						break
					case button_fileAction3_deleteId:
						closeMenu(menuFileAction3Ref)
						if (task.files.length == 1) closeMenu(menuFileAction2Ref)

						setSelectedTaskToFileAction('task', 'files', produce(files => {
							files.splice(fileIndex, 1)
						}))
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					}
				}}
				ref={r => menuFileAction3Ref = r}
				c:onToggleOpen={(is_open) => setIsMenuFileAction3Open(is_open)}>
				<Show when={/^(audio|image|video|text)/.test(selectedFileToAction2.file.type)}>
					<MenuItem
						c:iconCode={ICON_EYE}
						id={button_fileAction3_viewId}>
						View
					</MenuItem>
				</Show>
				<MenuItem
					c:iconCode={ICON_EDIT}
					id={button_fileAction3_renameId}>
					Rename
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_ARROW_DOWNLOAD}
					id={button_fileAction3_downloadId}>
					Download
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_DELETE}>
					Delete
				</MenuItem>
			</Menu>
		</>)
	}

	const DatePickers: VoidComponent = () => (<>
		<DateTimePicker
			c:onToggleOpen={(v) => setIsDateTimePickerReminderOpen(v)}
			c:datetime={(changeReminderOption() == 'edit'
				? selectedTaskToEdit.task.reminder
				: changeReminderOption() == 'action'
					? selectedTaskToAction.task.reminder
					: changeReminderOption() == 'chip'
						? selectedTaskToChangeReminder.task.reminder
						: new Date()
			) ?? new Date()}
			ref={r => dateTimePickerReminderRef = r}
			c:onSelectDatetime={(date) => {
				let task: Task = emptyTask()
				let taskListIndex = 0
				let taskIndex = 0
				if (changeReminderOption() == 'edit') {
					setSelectedTaskToEdit('task', 'reminder', date)
					taskListIndex = selectedTaskToEdit.taskListIndex
					taskIndex = selectedTaskToEdit.taskIndex
					task = selectedTaskToEdit.task
				}
				else if (changeReminderOption() == 'action') {
					setSelectedTaskToAction('task', 'reminder', date)
					taskListIndex = selectedTaskToAction.taskListIndex
					taskIndex = selectedTaskToAction.taskIndex
					task = selectedTaskToAction.task
				}
				else if (changeReminderOption() == 'chip') {
					setSelectedTaskToChangeReminder('task', 'reminder', date)
					taskListIndex = selectedTaskToChangeReminder.taskListIndex
					taskIndex = selectedTaskToChangeReminder.taskIndex
					task = selectedTaskToChangeReminder.task
				}

				command(Commands.editTask, task, taskListIndex, taskIndex)
			}}
		/>
	</>)

	return (<div class={CSS.body}
		onClick={globalClick}
		onKeyDown={globalKeyDown}
		onContextMenu={globalContextMenu}
		onChange={globalChange}>
		<Show
			when={getTaskListIndex() == null}
			fallback={<SingleTaskList
				lists={props.taskLists}
				command={command}
				settings={settings()}
				page={page()}
				labels={props.labels}
				taskList={props.taskLists[getTaskListIndex()!]}
				taskListIndex={getTaskListIndex()!}
			/>}>
			<GroupTaskList
				command={command}
				settings={settings()}
				page={page()}
				taskLists={props.taskLists}
				labels={props.labels}
			/>
		</Show>
		<Dialogs/>
		<Menus/>
		<DatePickers/>
	</div>)
}

export default _