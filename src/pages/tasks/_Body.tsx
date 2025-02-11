import type { DOMElement } from "solid-js/jsx-runtime"
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { dateCurrent, dateYear, dateTextYMD_HM, dateOutRangeYMD_HM } from "@/utils/datetime"
import { eventCurrentTarget, eventPreventDefault, eventStopPropagation, eventTarget } from "@/utils/event"
import { DEFAULT_TASK_LIST } from "./_constants"
import { attrSetIfExist, attrClassListModule } from "@/utils/attributes"
import { stringReplace, stringSplit, stringStartsWith, stringToTitleCase, stringTrim } from "@/utils/string"
import { elementBySelector, elementClick, elementClosest, elementDataset, elementFocus, elementId, elementSiblingNext, elementSiblingPrevious, elementTagName, elementValidTarget } from "@/utils/element"
import { typeIsNumber } from "@/utils/typecheck"
import { fileOpen, fileReadAsText } from "@/utils/file"
import { urlCreate, urlRevoke } from "@/utils/url"
import { arrayConcat, arrayFindIndex, arrayIncludes, arrayJoin, arrayLength, arraySlice, arraySome } from "@/utils/array"
import { regexTest } from "@/utils/regex"
import { numberIsNotDefined, numberParse, numberToFixed } from "@/utils/number"
import { promiseDone } from "@/utils/object"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from "@/constants/key_code"
import { AppColors } from "@/enums/colors"
import { documentActive } from "@/utils/document"
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataSortby = elementDataset(button, 'sortby')
					if (dataSortby) {
						return updateSortBy(dataSortby as SortBy)
					}

					const dataSortmode = elementDataset(button, 'sortmode')
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
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
				<Show when={typeIsNumber(props.page)}>
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
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
			classList={attrClassListModule(CSS.body_appbar)}
			c:leading={props.leading}
			c:headline={props.headline}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == "BUTTON"
				)) return

				switch (elementId(button)) {
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
				<Show when={!props.isGroup && ((props.page == Pages.tasks && props.isAnyTask) || typeIsNumber(props.page))}>
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
		data-taskitem={arrayJoin([taskListIndex(), taskIndex()], ',')}
		class={CSS.body_task_item}
		data-done={attrSetIfExist(task().complete)}>
		<List
			c:leading={<IconButton
				data-tooltip={`Mark as ${task().complete? 'un' : ''}completed`}
				data-taskitem-complete={arrayJoin([taskListIndex(), taskIndex()], ',')}
				c:code={task().complete? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}
			/>}
			c:trailing={<>
				<IconButton
					data-tooltip={`Mark as ${task().important? 'not ' : ''}important`}
					data-taskitem-important={arrayJoin([taskListIndex(), taskIndex()], ',')}
					c:filled={task().important}
					c:code={ICON_STAR}
				/>
				<IconButton
					data-tooltip="Delete task"
					data-taskitem-delete={arrayJoin([taskListIndex(), taskIndex()], ',')}
					c:code={ICON_DELETE}
				/>
			</>}
			c:subtitle={<>
				{ task().description }
				<Show when={
					arrayLength(task().subtasks) > 0
					|| task().reminder != null
					|| arrayLength(task().files) > 0
					|| arrayLength(task().labelIds) > 0
				}>
					<div class={CSS.body_task_item_tags}>
						<Show when={task().reminder != null}>
							<Button
								data-tooltip={
									"Task reminder" + (dateOutRangeYMD_HM(
										task().reminder!,
										dateCurrent(),
										new Date(dateYear() + 100, 2, 2)
									)? " (outdated)" : "")}
								style={{
									"border-color": dateOutRangeYMD_HM(
										task().reminder!,
										dateCurrent(),
										new Date(dateYear() + 100, 2, 2)
									)? 'rgb(var(--g-color-error))' : undefined
								}}
								data-taskitem-reminder={arrayJoin([taskListIndex(), taskIndex()], ',')}
								c:variant={ButtonVariant.outlined}>
								<Icon c:filled c:code={ICON_ALERT_URGENT} c:inline/>
								{dateTextYMD_HM(task().reminder!)}
							</Button>
						</Show>
						<Show when={arrayLength(task().files) > 0}>
							<Button
								data-taskitem-files={arrayJoin([taskListIndex(), taskIndex()], ',')}
								c:variant={ButtonVariant.outlined}>
								<Icon c:filled c:code={ICON_ATTACH} c:inline/>
								{arrayLength(task().files)} file{arrayLength(task().files) > 1? "s" : ''}
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
									data-taskitem-label={arrayJoin([taskListIndex(), taskIndex(), label_id], ',')}
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
		<Show when={arrayLength(task().subtasks) > 0}>
			<div class={CSS.body_task_item_subtasks} onClick={ev => eventStopPropagation(ev)}>
				<For each={task().subtasks}>{(subtask, index) => <CheckBox
					checked={subtask.complete}
					data-taskitem-subtask={arrayJoin([taskListIndex(), taskIndex(), index()], ',')}>
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
		if (arrayIncludes([Pages.completed, Pages.uncompleted, Pages.important, Pages.planned], page as Pages)) {
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
	const isAnyTask = createMemo<boolean>(() => arrayLength(taskList().tasks) > 0)
	let textFieldNewTaskRef: HTMLInputElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addTask(): void {
		if (
			!(page() == Pages.tasks || typeIsNumber(page()))
			|| stringTrim(textFieldNewTaskRef.value) == ''
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
			name: stringTrim(textFieldNewTaskRef.value),
			reminder: null,
			subtasks: []
		} satisfies Task, props.taskListIndex)
		updateTextFieldValue(textFieldNewTaskRef, '')

		elementFocus(textFieldNewTaskRef)
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
		data-empty={attrSetIfExist(!isAnyTask())}>
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
			eventPreventDefault(ev)
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
		return arraySome(taskLists, tasklist => {
			const tasks = tasklist.tasks
			if ($page == Pages.all) return arrayLength(tasks) > 0
			if ($page == Pages.completed) return arraySome(tasks, task => task.complete)
			if ($page == Pages.uncompleted) return arraySome(tasks, task => !task.complete)
			if ($page == Pages.important) return arraySome(tasks, task => task.important)
			if ($page == Pages.planned) return arraySome(tasks, task => task.reminder != null)
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
			if ($page == Pages.all) return arrayLength(tasks) > 0
			if ($page == Pages.completed) return arraySome(tasks, task => task.complete)
			if ($page == Pages.uncompleted) return arraySome(tasks, task => !task.complete)
			if ($page == Pages.important) return arraySome(tasks, task => task.important)
			if ($page == Pages.planned) return arraySome(tasks, task => task.reminder != null)
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
					openMenu(menuMoreRef, {anchor: eventCurrentTarget(ev)})
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
		data-empty={attrSetIfExist(!isNotEmpty())}>
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
		for (let i = 0; i < arrayLength($taskLists); i++) {
			const taskList = $taskLists[i]
			if (page() == Pages.tasks && taskList.id == DEFAULT_TASK_LIST.id) return i
			if (typeIsNumber(page()) && taskList.id == page()) return i
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

		setFileURLOrContent(stringStartsWith(selectedFileToView.file.type, 'text')
			? await fileReadAsText(blob)
			: urlCreate(blob)
		)
		openDialog(dialogViewFileRef)
	}

	function deleteSubTask(index: number): void {
		setSelectedTaskToEdit(
			'task', 'subtasks',
			subtasks => arrayConcat(
				arraySlice(subtasks, 0, index),
				arraySlice(subtasks, index + 1)
			)
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
			{...selectedSubTaskToEdit.subTask, name: stringTrim(textSubTask())} satisfies SubTask,
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
				name: stringTrim(textSubTask()),
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
			name: stringTrim(textFile()) + '.' + stringReplace(file.name, /^[^\.]+\./gs, ''),
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
		const button = documentActive()!
		if (!elementValidTarget(
			eventCurrentTarget(ev),
			button,
		)) return

		const dataTaskitemFiles = elementDataset(button, 'taskitemFiles')
		if (dataTaskitemFiles) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskitemFiles, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			setSelectedTaskToFileAction({task, taskListIndex, taskIndex})
			openMenu(menuFileAction2Ref, {
				anchor: button,
				position: MenuPosition.centerBottomToRight
			})
			return
		}

		const dataTaskitemReminder = elementDataset(button, 'taskitemReminder')
		if (dataTaskitemReminder) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskitemReminder, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			setSelectedTaskToChangeReminder({task, taskListIndex, taskIndex})
			openMenu(menuReminderRef, {
				anchor: button,
				position: MenuPosition.centerBottomToRight
			})
			return
		}

		const dataTaskitemDelete = elementDataset(button, 'taskitemDelete')
		if (dataTaskitemDelete) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskitemDelete, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			deleteTask(task, taskListIndex, taskIndex)
			return
		}

		const dataTaskitemImportant = elementDataset(button, 'taskitemImportant')
		if (dataTaskitemImportant) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskitemImportant, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
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

		const dataTaskitem = elementDataset(button, 'taskitem')
		if (dataTaskitem) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskitem, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			editTask(task, taskListIndex, taskIndex)
			return
		}

		const dataTaskItemComplete = elementDataset(button, 'taskitemComplete')
		if (dataTaskItemComplete) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskItemComplete, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
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

		const dataTaskitemLabel = elementDataset(button, 'taskitemLabel')
		if (dataTaskitemLabel) {
			let [taskListIndex, taskIndex, labelId] = stringSplit(
				dataTaskitemLabel, ','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			labelId = numberParse(labelId as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
				|| numberIsNotDefined(labelId)
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
		const target = eventTarget(ev) as HTMLElement
		const isPressKey = code == KEY_SPACE || code == KEY_ENTER
		const isArrowUp = code == KEY_ARROW_UP
		const isArrowDown = code == KEY_ARROW_DOWN
		const isArrowRight = code == KEY_ARROW_RIGHT
		const isArrowLeft = code == KEY_ARROW_LEFT
		const isArrowKey = isArrowUp || isArrowDown || isArrowRight || isArrowLeft

		// handle custom interactive element using keyboard
		if (isPressKey) {
			const data_taskitem = elementDataset(target, 'taskitem')
			if (data_taskitem) {
				eventPreventDefault(ev)
				elementClick(target)
				return
			}
		}

		// handle move focus
		if (isArrowKey) {
			// Move between subtasks
			const dataTaskitemSubtask = elementDataset(target, 'taskitemSubtask')
			if (dataTaskitemSubtask && (isArrowDown || isArrowUp)) {
				const label = elementClosest(target, 'label')!

				let sibling: HTMLElement | null = isArrowUp
					? elementSiblingPrevious(label)
					: elementSiblingNext(label)
				if (!sibling) return

				sibling = elementBySelector('input', sibling)
				if (!sibling) return

				eventPreventDefault(ev)
				elementFocus(sibling)
				return
			}

			const dataTaskitem = elementDataset(target, 'taskitem')
			if (dataTaskitem && (isArrowDown || isArrowUp)) {
				const sibling: HTMLElement | null = isArrowUp
					? elementSiblingPrevious(target)
					: elementSiblingNext(target)
				if (!sibling) return

				eventPreventDefault(ev)
				elementFocus(sibling)
				return
			}
			return
		}
	}

	function globalContextMenu(ev: MouseEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const target = documentActive()!
		if (!elementValidTarget(
			eventCurrentTarget(ev),
			target,
		)) return

		const dataTaskItem = elementDataset(target, 'taskitem')
		if (dataTaskItem) {
			let [taskListIndex, taskIndex] = stringSplit(
				dataTaskItem, ','
			) as [string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
			) return

			const task = taskLists()[taskListIndex].tasks[taskIndex]
			onContextMenuTask(task, taskListIndex, taskIndex)
			eventPreventDefault(ev)
			return
		}
	}

	function globalChange(ev: Event & {
		currentTarget: HTMLDivElement
		target: Element
	}): void {
		const target = eventTarget(ev) as HTMLElement

		// subtask
		const dataTaskitemSubtask = elementDataset(target, 'taskitemSubtask')
		if (dataTaskitemSubtask) {
			let [taskListIndex, taskIndex, subTaskIndex] = stringSplit(
				dataTaskitemSubtask, ','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!taskListIndex || !taskIndex || !subTaskIndex) return

			taskListIndex = numberParse(taskListIndex as string, true)
			taskIndex = numberParse(taskIndex as string, true)
			subTaskIndex = numberParse(subTaskIndex as string, true)
			if (
				numberIsNotDefined(taskListIndex)
				|| numberIsNotDefined(taskIndex)
				|| numberIsNotDefined(subTaskIndex)
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
		const isTypeNotSupported = createMemo<boolean>(() => !regexTest(/^(audio|image|video|text)/, file().type))
		const getSizeText = createMemo(() => {
			const value = file().size
			const TERA = 1_000_000_000_000
			const GIGA = 1_000_000_000
			const MEGA = 1_000_000
			const KILO = 1_000
			let unitValue = value + ' B'

			if      (value >= TERA) unitValue = numberParse(numberToFixed(value / TERA, 2)) + ' TB'
			else if (value >= GIGA) unitValue = numberParse(numberToFixed(value / GIGA, 2)) + ' GB'
			else if (value >= MEGA) unitValue = numberParse(numberToFixed(value / MEGA, 2)) + ' MB'
			else if (value >= KILO) unitValue = numberParse(numberToFixed(value / KILO, 2)) + ' KB'
			return unitValue
		})

		return (<List
			classList={attrClassListModule(CSS.body_file_list_item)}
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
			c:subtitle={arrayJoin([getSizeText(), stringReplace(file().type, /\/.+$/gs, '')], " • ")}>
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
				classList={attrClassListModule(CSS.body_dialog_edit)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (elementId(button)) {
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
						promiseDone(fileOpen(null, true), async (files) => {
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
						const dataSubtaskEditIndex = elementDataset(button, 'subtaskEditIndex')
						if (dataSubtaskEditIndex) {
							const index = numberParse(dataSubtaskEditIndex, true)
							if (numberIsNotDefined(index)) return

							editSubTask(
								task.subtasks[index], taskListIndex, taskIndex, index
							)
							return
						}

						const dataSubtaskDeleteIndex = elementDataset(button, 'subtaskDeleteIndex')
						if (dataSubtaskDeleteIndex) {
							const index = numberParse(dataSubtaskDeleteIndex, true)
							if (numberIsNotDefined(index)) return

							deleteSubTask(index)
							return
						}

						const dataSubTaskCompleteIndex = elementDataset(button, 'subtaskCompleteIndex')
						if (dataSubTaskCompleteIndex) {
							const index = numberParse(dataSubTaskCompleteIndex, true)
							if (numberIsNotDefined(index)) return

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

						const dataLabelEditIndex = elementDataset(button, 'labelEditIndex')
						if (dataLabelEditIndex) {
							const index = numberParse(dataLabelEditIndex, true)
							if (numberIsNotDefined(index)) return

							setSelectedLabel(props.labels[index]!)
							command(Commands.editLabel, selectedLabel)
							return
						}

						const dataLabelRemoveIndex = elementDataset(button, 'labelRemoveIndex')
						if (dataLabelRemoveIndex) {
							const index = numberParse(dataLabelRemoveIndex, true)
							if (numberIsNotDefined(index)) return

							const i = arrayFindIndex(
								selectedTaskToEdit.task.labelIds,
								$id => $id == props.labels[index]!.id
							)
							if (i < 0) return

							setSelectedTaskToEdit('task', 'labelIds', ids => arrayConcat(
								arraySlice(ids, 0, i),
								arraySlice(ids, i + 1)
							))
							command(Commands.editTask, task, taskListIndex, taskIndex)
							return
						}

						const dataFileViewIndex = elementDataset(button, 'fileViewIndex')
						if (dataFileViewIndex) {
							const index = numberParse(dataFileViewIndex, true)
							if (numberIsNotDefined(index)) return

							viewFile(task.files[index], taskListIndex, taskIndex, index)
							return
						}

						const dataFileActionIndex = elementDataset(button, 'fileActionIndex')
						if (dataFileActionIndex) {
							const index = numberParse(dataFileActionIndex, true)
							if (numberIsNotDefined(index)) return

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
					const input = eventTarget(ev) as HTMLInputElement
					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (elementId(input)) {
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
							c:trailingAutoTabIndex
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
								color: dateOutRangeYMD_HM(
									selectedTaskToEdit.task.reminder!,
									dateCurrent(),
									new Date(dateYear() + 100, 2, 2)
								)? 'rgb(var(--g-color-error))' : undefined
							}}>{dateTextYMD_HM(selectedTaskToEdit.task.reminder!)}</span>
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
						style={{color: `rgb(${AppColors.error})`}}>
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					const task = selectedTaskToDelete.task
					const taskListIndex = selectedTaskToDelete.taskListIndex
					const taskIndex = selectedTaskToDelete.taskIndex
					switch (elementId(button)) {
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
				Are you sure want to delete <q><span style={{color: `rgb(${AppColors.accent})`, "font-weight": 'bold'}}>{(selectedTaskToDelete.task.name) || ''}</span></q> task?
				<CheckBox
					c:attrLabel={{style: "margin-top: 16px"}}
					onChange={ev => command(Commands.toggleDeleteTaskWarning, !eventCurrentTarget(ev).checked)}>
					Don't remind me again
				</CheckBox>
			</Dialog>
			<Dialog
				ref={r => dialogFileRenameRef = r}
				style={{width: '500px'}}
				c:header="Rename file"
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
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
						disabled={stringTrim(textFile()) == ''}>
						Rename
					</Button>
				</>}>
				<form onSubmit={ev => {
					eventPreventDefault(ev)
					if (stringTrim(textFile()) == '') return;

					confirmFileRename()
				}}>
					<TextField
						ref={r => textFieldRenamefileRef = r}
						autofocus
						onInput={ev => setTextFile(eventCurrentTarget(ev).value)}
						placeholder="File name"
					/>
				</form>
			</Dialog>
			<Dialog
				style={{width: '720px'}}
				ref={r => dialogViewFileRef = r}
				onClose={() => {
					if (!stringStartsWith(selectedFileToView.file.type, 'text')) urlRevoke(fileURLOrContent())
					setFileURLOrContent('')
				}}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					const file = selectedFileToView.file
					const taskListIndex = selectedFileToView.taskListIndex
					const taskIndex = selectedFileToView.taskIndex
					const fileIndex = selectedFileToView.fileIndex
					switch (elementId(button)) {
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
						<Match when={stringStartsWith(selectedFileToView.file.type, 'image')}>
							<img src={fileURLOrContent()} width={'100%'}/>
						</Match>
						<Match when={stringStartsWith(selectedFileToView.file.type, 'video')}>
							<video src={fileURLOrContent()} autoplay controls width={'100%'}></video>
						</Match>
						<Match when={stringStartsWith(selectedFileToView.file.type, 'audio')}>
							<audio src={fileURLOrContent()} autoplay controls style={{width: '100%'}}></audio>
						</Match>
						<Match when={stringStartsWith(selectedFileToView.file.type, 'text')}>
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
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
						disabled={stringTrim(textSubTask()) == ''}>
						Add
					</Button>
				</>}>
				<form onSubmit={ev => {
					eventPreventDefault(ev)
					if (stringTrim(textSubTask()) == '') return;

					confirmAddSubTask()
				}}>
					<TextField
						ref={r => textFieldNewSubTaskRef = r}
						placeholder="Subtask name"
						onFocus={ev => setTextSubTask(eventCurrentTarget(ev).value)}
						onInput={ev => setTextSubTask(eventCurrentTarget(ev).value)}
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
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
						disabled={stringTrim(textSubTask()) == ''}>
						Edit
					</Button>
				</>}>
				<form style="display:contents" onSubmit={ev => {
					eventPreventDefault(ev)
					if (stringTrim(textSubTask()) == '') return;
					confirmEditSubTask()
				}}>
					<TextField
						ref={r => textFieldEditSubTaskRef = r}
						placeholder="Subtask name"
						onFocus={ev => setTextSubTask(eventCurrentTarget(ev).value)}
						onInput={ev => setTextSubTask(eventCurrentTarget(ev).value)}
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return
					const task = selectedTaskToAction.task
					const taskListIndex = selectedTaskToAction.taskListIndex
					const taskIndex = selectedTaskToAction.taskIndex

					switch (elementId(button)){
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
						promiseDone(fileOpen(null, true), async (files) => {
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
						const dataLabelId = elementDataset(button, 'labelId')
						if (dataLabelId) {
							const labelId = numberParse(dataLabelId, true)
							if (numberIsNotDefined(labelId)) return

							const index = arrayFindIndex(task.labelIds, id => id == labelId)
							setSelectedTaskToAction('task', 'labelIds', ids => index >= 0
								? arrayConcat(
									arraySlice(ids, 0, index),
									arraySlice(ids, index + 1)
								)
								: [...ids, labelId]
							)
							command(Commands.editTask, task, taskListIndex, taskIndex)
							return
						}

						const dataTasklistIndex = elementDataset(button, 'tasklistIndex')
						if (dataTasklistIndex) {
							const i = numberParse(dataTasklistIndex, true)
							if (numberIsNotDefined(i)) return

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
				<Show when={arrayLength(props.labels) > 0}>
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
								c:checked={arrayIncludes(selectedTaskToAction.task.labelIds, label!.id)}
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
						<Show when={arrayLength(props.taskLists) > 1 && list.id == DEFAULT_TASK_LIST.id}>
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const task = selectedTaskToEdit.task
					const taskListIndex = selectedTaskToEdit.taskListIndex
					const taskIndex = selectedTaskToEdit.taskIndex
					switch (elementId(button)) {
						case button_labels_newId:
							command(Commands.addLabel)
							break
						case button_labels_editId:
							closeDialog(dialogEditTaskRef)
							closeMenu(menuLabelsRef)
							command(Commands.showLabelsOptions)
							break
						default:
							const dataLabelIndex = elementDataset(button, 'labelIndex')
							if (dataLabelIndex) {
								const labelIndex = numberParse(dataLabelIndex, true)
								if (numberIsNotDefined(labelIndex)) return

								const labelId = props.labels![labelIndex]!.id
								const index = arrayFindIndex(task.labelIds, id => id == labelId)
								setSelectedTaskToEdit('task', 'labelIds', ids => index < 0
									? [...ids, labelId]
									: arrayConcat(
										arraySlice(ids, 0, index),
										arraySlice(ids, index + 1)
									)
								)
								command(Commands.editTask, task, taskListIndex, taskIndex)
								return
							}
					}
				}}
				onContextMenu={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataLabelIndex = elementDataset(button, 'labelIndex')
					if (dataLabelIndex) {
						const label_index = numberParse(dataLabelIndex, true)
						if (numberIsNotDefined(label_index)) return

						const label = props.labels![label_index]!
						setSelectedLabel(label)
						eventPreventDefault(ev)
						openMenu(menuLabelActionRef, {position: MenuPosition.centerBottomToRight})
						return
					}
				}}>
				<MenuItem
					id={button_labels_newId}
					c:iconCode={ICON_ADD}>
					New label
				</MenuItem>
				<Show when={arrayLength(props.labels) > 0}>
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
						c:checked={arrayIncludes(selectedTaskToEdit.task.labelIds, label!.id)}
						data-label-index={i()}>
						{label!.name}
					</MenuItem>
				</Show>}</For>
			</Menu>
			<Menu
				ref={r => menuLabelActionRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const task = selectedTaskToEditLabel.task
					const taskListIndex = selectedTaskToEditLabel.taskListIndex
					const taskIndex = selectedTaskToEditLabel.taskIndex
					switch (elementId(button)) {
					case button_labelActions_edit2Id:
						closeMenu(menuLabelAction2Ref)
						command(Commands.editLabel, selectedLabel)
						break
					case button_labelActions_delete2Id:
						closeMenu(menuLabelAction2Ref)
						const index = arrayFindIndex(task.labelIds, v => v == selectedLabel.id)
						if (index < 0) return;

						setSelectedTaskToEditLabel('task', 'labelIds', ids => arrayConcat(
							arraySlice(ids, 0, index),
							arraySlice(ids, index + 1)
						))
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const file = selectedFileToAction.file
					const taskListIndex = selectedFileToAction.taskListIndex
					const taskIndex = selectedFileToAction.taskIndex
					const fileIndex = selectedFileToAction.fileIndex
					switch (elementId(button)) {
					case button_fileAction_downloadId:
						closeMenu(menuFileActionRef)
						command(Commands.downloadFile,
							file, taskListIndex, taskIndex, fileIndex
						)
						break
					case button_fileAction_renameId:
						closeMenu(menuFileActionRef)

						const text = stringReplace(file.name, /\.[^\.]*$/, '')
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
						setSelectedTaskToEdit('task', 'files', files => [
							...arraySlice(files, 0, fileIndex),
							...arraySlice(files, fileIndex + 1)
						])
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataFileIndex = elementDataset(button, 'fileIndex')
					if (dataFileIndex) {
						const file_index = numberParse(dataFileIndex, true)
						if (numberIsNotDefined(file_index)) return

						setSelectedFileToAction2({
							file: selectedTaskToFileAction.task.files[file_index],
							fileIndex: file_index,
							taskIndex: selectedTaskToFileAction.taskIndex,
							taskListIndex: selectedTaskToFileAction.taskListIndex
						})
						openMenu(menuFileAction3Ref, {
							anchor: eventCurrentTarget(ev),
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const file = selectedFileToAction2.file
					const taskListIndex = selectedFileToAction2.taskListIndex
					const taskIndex = selectedFileToAction2.taskIndex
					const fileIndex = selectedFileToAction2.fileIndex
					const task = props.taskLists[taskListIndex].tasks[taskIndex]
					switch (elementId(button)) {
					case button_fileAction3_viewId:
						closeMenu(menuFileAction3Ref)
						viewFile(file, taskListIndex, taskIndex, fileIndex)
						break
					case button_fileAction3_renameId:
						closeMenu(menuFileAction3Ref)

						const text = stringReplace(file.name, /\.[^\.]*$/, '')
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
						if (arrayLength(task.files) == 1) closeMenu(menuFileAction2Ref)

						setSelectedTaskToFileAction('task', 'files', files => [
							...arraySlice(files, 0, fileIndex),
							...arraySlice(files, fileIndex + 1)
						])
						command(Commands.editTask, task, taskListIndex, taskIndex)
						break
					}
				}}
				ref={r => menuFileAction3Ref = r}
				c:onToggleOpen={(is_open) => setIsMenuFileAction3Open(is_open)}>
				<Show when={regexTest(/^(audio|image|video|text)/, selectedFileToAction2.file.type)}>
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