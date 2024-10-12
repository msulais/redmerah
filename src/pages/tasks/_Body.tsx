import { createEffect, createMemo, createSignal, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import type { ComponentEvent } from "@/types/event"
import { _command, _settings, _sortBy, _name, _importance, _creationDate, _completed, _uncompleted, _sortMode, _ascending, _descending, _isAnyUncompletedTask, _taskListIndex, _isAnyCompletedTask, _isAnyTask, _page, _tonal, _filled, _leading, _headline, _currentTarget, _isGroup, _tasks, _task, _complete, _onEdit, _onContextMenu, _taskIndex, _important, _onDelete, _subtasks, _length, _description, _reminder, _files, _labelIds, _onEditReminder, _outlined, _onEditFiles, _labels, _color, _onEditLabel, _all, _planned, _includes, _taskList, _number, _value, _trim, _id, _emoji, _onEditFilesTask, _onEditReminderTask, _onEditTask, _onContextMenuTask, _onDeleteTask, _taskLists, _some, _edit, _isShowDeleteTaskWarning, _file, _type, _startsWith, _text, _slice, _concat, _subtask, _subtaskIndex, _listId, _replace, _size, _taskId, _fileIndex, _action, _centerBottomToRight, _test, _toFixed, _join, _findIndex, _isFileDBError, _then, _image, _video, _audio, _normal, _contents, _chip, _rightCenterToBottom, _checked } from "@/constants/string"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { getCurrentDate, getDate_Y, getDateString_YMD_HM, isOutDate_YMD_HM } from "@/utils/datetime"
import { preventDefault, stopPropagation } from "@/utils/event"
import { DEFAULT_TASK_LIST } from "./_constants"
import { toggleAttribute } from "@/utils/attributes"
import { stringToTitleCase } from "@/utils/string"
import { addClassListModule } from "@/utils/element"
import { isNumber } from "@/utils/typecheck"
import { numberParse } from "@/utils/math"
import { openFile, readFileAsText } from "@/utils/file"
import { createObjectURL, revokeObjectURL } from "@/utils/url"

import Divider from "@/components/Divider"
import Icon from "@/components/Icon"
import {TextTooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Emoji from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import List from "@/components/List"
import Expander, { ExpanderHeader } from "@/components/Expander"
import TextField, { changeTextFieldValue, AreaTextField, TextFieldButton } from "@/components/TextField"
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
	const [is_menu_sort_open, setIs_menu_sort_open] = createSignal<boolean>(false)
	const [is_menu_more_open, setIs_menu_more_open] = createSignal<boolean>(false)
	let menu_sort_ref: HTMLDialogElement
	let menu_more_ref: HTMLDialogElement
	let dialog_clearTasks_ref: HTMLDialogElement
	let dialog_deleteCompletedTasks_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	function changeSortBy(sortBy: SortBy): void {
		props[_command](Commands.change_sortBy, sortBy)
		closeMenu(menu_sort_ref)
	}

	function changeSortMode(sortMode: SortMode): void {
		props[_command](Commands.change_sortMode, sortMode)
		closeMenu(menu_sort_ref)
	}

	const Menus: VoidComponent = () => {
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_sort_ref = r}
				onToggleOpen={(v) => setIs_menu_sort_open(v)}>
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
			<Menu
				style={{"min-width": '200px'}}
				ref={r => menu_more_ref = r}
				onToggleOpen={(v) => setIs_menu_more_open(v)}>
				<Show when={props[_isAnyUncompletedTask]}>
					<MenuItem
						onClick={async () => {
							closeMenu(menu_more_ref)
							props[_command](Commands.mark_all_completed, props[_taskListIndex])
						}}
						iconCode={0xE3CC}>
						Mark all completed
					</MenuItem>
				</Show>
				<Show when={props[_isAnyCompletedTask]}>
					<MenuItem
						onClick={async () => {
							closeMenu(menu_more_ref)
							props[_command](Commands.mark_all_uncompleted, props[_taskListIndex])
						}}
						iconCode={0xE3D4}>
						Mark all uncompleted
					</MenuItem>
				</Show>
				<Show when={props[_isAnyTask]}>
					<MenuDivider />
					<MenuItem
						onClick={ev => {
							openDialog(ev, dialog_clearTasks_ref, {important: true})
							closeMenu(menu_more_ref)
						}}
						iconCode={0xE5A1}>
						Clear tasks
					</MenuItem>
				</Show>
				<Show when={props[_isAnyCompletedTask]}>
					<MenuItem
						onClick={ev => {
							openDialog(ev, dialog_deleteCompletedTasks_ref, {important: true})
							closeMenu(menu_more_ref)
						}}
						iconCode={0xE5A3}>
						Delete completed tasks
					</MenuItem>
				</Show>
				<Show when={isNumber(props[_page])}>
					<Show when={props[_isAnyTask]}><MenuDivider /></Show>
					<MenuItem
						onClick={ev => {
							closeMenu(menu_more_ref)
							props[_command](Commands.rename_taskList, ev, props[_taskListIndex])
						}}
						iconCode={0xF0FB}>
						Rename list
					</MenuItem>
					<MenuItem
						onClick={ev => {
							closeMenu(menu_more_ref)
							props[_command](Commands.delete_taskList, ev, props[_taskListIndex])
						}}
						iconCode={0xE59D}>
						Delete list
					</MenuItem>
				</Show>
			</Menu>
		</>)
	}

	const Dialogs: VoidComponent = () => {
		return (<>
			<Dialog
				ref={r => dialog_clearTasks_ref = r}
				header="Clear tasks"
				style={{width: '500px'}}
				actions={<>
					<Button
						onClick={() => closeDialog(dialog_clearTasks_ref)}
						variant={ButtonVariant[_tonal]}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							props[_command](Commands.clear_tasks, props[_taskListIndex])
							closeDialog(dialog_clearTasks_ref)
						}}
						variant={ButtonVariant[_filled]}>
						Clear
					</Button>
				</>}>
				Clearing all tasks will permanently delete them. Are you sure you want to continue?
			</Dialog>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_deleteCompletedTasks_ref = r}
				header={"Delete completed tasks"}
				actions={<>
					<Button
						onClick={() => closeDialog(dialog_deleteCompletedTasks_ref)}
						variant={ButtonVariant[_tonal]}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							props[_command](Commands.delete_completed_task, props[_taskListIndex])
							closeDialog(dialog_deleteCompletedTasks_ref)
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
					<TextTooltip text="Sort by">
						<IconButton
							focused={is_menu_sort_open()}
							onClick={ev => openMenu(ev, menu_sort_ref, {anchor: ev[_currentTarget]})}
							code={0xE123}
						/>
					</TextTooltip>
					<TextTooltip text="Copy tasks">
						<IconButton
							onClick={(ev) => {
								props[_command](Commands.copy_tasks, props[_isGroup]? undefined : props[_taskListIndex])
								openToast(ev, toast_copied_ref)
							}}
							code={0xE51B}
						/>
					</TextTooltip>
				</Show>
				<Show when={!props[_isGroup] && ((props[_page] == Pages[_tasks] && props[_isAnyTask]) || isNumber(props[_page]))}>
					<TextTooltip text="More options">
						<IconButton
							focused={is_menu_more_open()}
							onClick={ev => openMenu(ev, menu_more_ref, {anchor: ev[_currentTarget]})}
							code={0xEAD9}
						/>
					</TextTooltip>
				</Show>
			</>}
		/>
		<Menus />
		<Dialogs />
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Tasks copied
		</Toast>
	</>)
}

const TaskItem: VoidComponent<{
	task: Task
	taskIndex: number
	taskListIndex: number
	labels: (TaskLabel | undefined)[]
	onEdit: (ev: ComponentEvent<MouseEvent>) => unknown
	onEditReminder: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
	onEditFiles: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
	onEditLabel: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, label: TaskLabel) => unknown
	onContextMenu: (ev: ComponentEvent<MouseEvent>) => unknown
	onDelete: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	return (<Expander
		data-done={toggleAttribute(props[_task][_complete])}
		header={<ExpanderHeader
			useExpandIcon={false}
			leading={<>
				<TextTooltip text={`Mark as ${props[_task][_complete]? 'un' : ''}completed`}>
					<IconButton
						onContextMenu={ev => {
							stopPropagation(ev)
							preventDefault(ev)
						}}
						onClick={ev => {
							stopPropagation(ev)
							props[_command](
								Commands.edit_task,
								{...props[_task], complete: !props[_task][_complete]} satisfies Task,
								props[_taskListIndex],
								props[_taskIndex]
							)
						}}
						code={props[_task][_complete]? 0xE3CB : 0xE3D4}
					/>
				</TextTooltip>
			</>}
			trailing={<>
				<TextTooltip text={`Mark as ${props[_task][_important]? 'not ' : ''}important`}>
					<IconButton
						onContextMenu={ev => {
							stopPropagation(ev)
							preventDefault(ev)
						}}
						onClick={ev => {
							stopPropagation(ev)
							props[_command](
								Commands.edit_task,
								{...props[_task], important: !props[_task][_important]} satisfies Task,
								props[_taskListIndex],
								props[_taskIndex]
							)
						}}
						filled={props[_task][_important]}
						code={0xEF1B}
					/>
				</TextTooltip>
				<TextTooltip text="Delete task">
					<IconButton
						onContextMenu={ev => {
							stopPropagation(ev)
							preventDefault(ev)
						}}
						onClick={ev => {
							stopPropagation(ev)
							props[_onDelete](ev)
						}}
						code={0xE59D}
					/>
				</TextTooltip>
			</>}
			subtitle={<>
				{ props[_task][_description] }
				<Show when={
					props[_task][_subtasks][_length] > 0
					|| props[_task][_reminder] != null
					|| props[_task][_files][_length] > 0
					|| props[_task][_labelIds][_length] > 0
				}>
					<div class={CSS.body_task_item_tags}>
						<Show when={props[_task][_reminder] != null}>
							<TextTooltip text={
								"Task reminder" + (isOutDate_YMD_HM(
									props[_task][_reminder]!,
									getCurrentDate(),
									new Date(getDate_Y() + 100, 2, 2)
								)? " (outdated)" : "")}>
								<Button
									compact
									style={{
										"border-color": isOutDate_YMD_HM(
											props[_task][_reminder]!,
											getCurrentDate(),
											new Date(getDate_Y() + 100, 2, 2)
										)? 'rgb(var(--color-error))' : undefined
									}}
									onContextMenu={ev => {
										stopPropagation(ev)
										preventDefault(ev)
									}}
									onClick={ev => {
										stopPropagation(ev)
										props[_onEditReminder](ev)
									}}
									variant={ButtonVariant[_outlined]}>
									<Icon filled code={0xE025} inline/>
									{getDateString_YMD_HM(props[_task][_reminder]!)}
								</Button>
							</TextTooltip>
						</Show>
						<Show when={props[_task][_files][_length] > 0}>
							<Button
								compact
								onContextMenu={ev => {
									stopPropagation(ev)
									preventDefault(ev)
								}}
								onClick={ev => {
									stopPropagation(ev)
									props[_onEditFiles](ev)
								}}
								variant={ButtonVariant[_outlined]}>
								<Icon filled code={0xE187} inline/>
								{props[_task][_files][_length]} file{props[_task][_files][_length] > 1? "s" : ''}
							</Button>
						</Show>
						<For each={props[_task][_labelIds]}>{labelId =>
							<Show when={props[_labels][labelId] != undefined}>
								<Button
									compact
									style={{
										"border-color": props[_labels][labelId]![_color] ?? undefined,
										"background-color": props[_labels][labelId]![_color] != null
											? props[_labels][labelId]![_color] + '14'
											: undefined
									}}
									onContextMenu={ev => {
										stopPropagation(ev)
										preventDefault(ev)
									}}
									onClick={ev => {
										stopPropagation(ev)
										props[_onEditLabel](ev, props[_labels][labelId]!)
									}}
									variant={ButtonVariant[_outlined]}>
									<Icon filled code={0xF00D} inline/>
									{props[_labels][labelId]![_name]}
								</Button>
							</Show>
						}</For>
					</div>
				</Show>
			</>}>
			{props[_task][_name]}
		</ExpanderHeader>}
		headerAttr={{
			onClick: ev => props[_onEdit](ev),
			onContextMenu: ev => {
				preventDefault(ev)
				props[_onContextMenu](ev)
			}
		}}
		classList={addClassListModule(CSS.body_task_item)}
		open={props[_task][_subtasks][_length] > 0}>
		<For each={props[_task][_subtasks]}>{(subtask, index) => <CheckBox
			checked={subtask[_complete]}
			onChange={ev => props[_command](
				Commands.edit_subtask,
				{...subtask, complete: ev[_currentTarget][_checked]} satisfies SubTask,
				props[_taskListIndex],
				props[_taskIndex],
				index()
			)}>
			{subtask[_name]}
		</CheckBox>}</For>
	</Expander>)
}

const EmptyTasks: VoidComponent<{page: Pages | number}> = (props) => {
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
	onEditTask: (ev: ComponentEvent<MouseEvent>, task: Task, taskIndex: number) => unknown
	onEditFilesTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskIndex: number) => unknown
	onEditReminderTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskIndex: number) => unknown
	onContextMenuTask: (ev: ComponentEvent<MouseEvent>, task: Task, taskIndex: number) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [isAnyCompletedTask, setIsAnyCompletedTask] = createSignal<boolean>(true)
	const [isAnyUncompletedTask, setIsAnyUncompletedTask] = createSignal<boolean>(true)
	const getHeadline = createMemo<string>(() =>  props[_page] != Pages[_tasks]? props[_taskList][_name] : 'Tasks')
	const isAnyTask = createMemo<boolean>(() => props[_taskList][_tasks][_length] > 0)
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
		const tasks = props[_taskList][_tasks]
		let isAnyCompletedTask = false
		let isAnyUncompletedTask = false

		for (const task of tasks) {
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
					fallback={<Icon code={0xF032}/>}>
					<Icon code={0xE8E2}/>
				</Show>
			</Show>}
			headline={getHeadline()}
		/>
		<For each={props[_taskList][_tasks]}>{(task, index) => <TaskItem
			command={props[_command]}
			task={task}
			onEditLabel={(ev, label) => props[_onEditLabel](ev, label, task, index())}
			labels={props[_labels]}
			taskIndex={index()}
			taskListIndex={props[_taskListIndex]}
			onEditFiles={ev => props[_onEditFilesTask](ev, task, index())}
			onEditReminder={ev => props[_onEditReminderTask](ev, task, index())}
			onEdit={ev => props[_onEditTask](ev, task, index())}
			onContextMenu={ev => props[_onContextMenuTask](ev, task, index())}
			onDelete={ev => props[_onDeleteTask](ev, task, index())}
		/>}</For>
		<Show when={!isAnyTask()}><EmptyTasks page={props[_page]} /></Show>
		<Show when={isAnyTask()}><div style={{flex: '1'}}></div></Show>
		<form onSubmit={ev => {
			addTask()
			preventDefault(ev)
		}}>
			<TextField
				placeholder="Add task"
				ref={r => textfield_newTask_ref = r}
				trailing={<TextTooltip text="Add task">
					<TextFieldButton onClick={() => addTask()}><Icon code={0xE00B}/></TextFieldButton>
				</TextTooltip>}
			/>
		</form>
	</div>)
}

const GroupTaskList: VoidComponent<{
	page: Pages | number
	taskLists: TaskList[]
	labels: (TaskLabel | undefined)[]
	settings: Settings
	onEditLabel: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, label: TaskLabel, task: Task, taskListIndex: number, taskIndex: number) => unknown
	onDeleteTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number) => unknown
	onEditTask: (ev: ComponentEvent<MouseEvent>, task: Task, taskListIndex: number, taskIndex: number) => unknown
	onEditFilesTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number) => unknown
	onEditReminderTask: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number) => unknown
	onContextMenuTask: (ev: ComponentEvent<MouseEvent>, task: Task, taskListIndex: number, taskIndex: number) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_more_open, setIs_menu_more_open] = createSignal<boolean>(false)
	const [selectedTaskListToAction, setSelectedTaskListToAction] = createStore<{list: TaskList, taskListIndex: number}>({list: {emoji: null, id: -1, name: '', tasks: []}, taskListIndex: -1})
	const getIcon = createMemo<number>(() => {
		const page = props[_page]
		if (page == Pages[_all]) return 0xE069
		if (page == Pages[_completed]) return 0xE3CC
		if (page == Pages[_uncompleted]) return 0xE3D4
		if (page == Pages[_important]) return 0xEF1B
		if (page == Pages[_planned]) return 0xE01B

		return 0xE3CC
	})
	const isNotEmpty = createMemo<boolean>(() => {
		const page = props[_page]
		const taskLists = props[_taskLists]
		return taskLists[_some](taskList => {
			if (page == Pages[_all]) return taskList[_tasks][_length] > 0
			if (page == Pages[_completed]) return taskList[_tasks][_some](task => task[_complete])
			if (page == Pages[_uncompleted]) return taskList[_tasks][_some](task => !task[_complete])
			if (page == Pages[_important]) return taskList[_tasks][_some](task => task[_important])
			if (page == Pages[_planned]) return taskList[_tasks][_some](task => task[_reminder] != null)
			return false
		})
	})
	let menu_more_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	const TaskListGroup: VoidComponent<{
		taskList: TaskList
		taskListIndex: number
	}> = ($props) => {
		const getHeadline = createMemo<string>(() =>  props[_page] != Pages[_tasks]? $props[_taskList][_name] : 'Tasks')
		const isAnyTask = createMemo<boolean>(() => {
			const page = props[_page]
			if (page == Pages[_all]) return $props[_taskList][_tasks][_length] > 0
			if (page == Pages[_completed]) return $props[_taskList][_tasks][_some](task => task[_complete])
			if (page == Pages[_uncompleted]) return $props[_taskList][_tasks][_some](task => !task[_complete])
			if (page == Pages[_important]) return $props[_taskList][_tasks][_some](task => task[_important])
			if (page == Pages[_planned]) return $props[_taskList][_tasks][_some](task => task[_reminder] != null)
			return false
		})

		function taskCondition(task: Task): boolean {
			const page = props[_page]
			if (page == Pages[_completed]) return task[_complete]
			if (page == Pages[_uncompleted]) return !task[_complete]
			if (page == Pages[_important]) return task[_important]
			if (page == Pages[_planned]) return task[_reminder] != null
			return true
		}

		const Headline: VoidComponent = () => (<AppBar
			headline={getHeadline()}
			leading={<Show
				when={$props[_taskList][_emoji] == null}
				fallback={<Emoji emoji={$props[_taskList][_emoji]!} />}>
				<Show
					when={$props[_taskList][_id] == DEFAULT_TASK_LIST[_id]}
					fallback={<Icon code={0xF032}/>}>
					<Icon code={0xE8E2}/>
				</Show>
			</Show>}
			trailing={<TextTooltip text="More options">
				<IconButton
					focused={is_menu_more_open() && selectedTaskListToAction[_taskListIndex] == $props[_taskListIndex]}
					onClick={ev => {
						setSelectedTaskListToAction({list: $props[_taskList], taskListIndex: $props[_taskListIndex]})
						openMenu(ev, menu_more_ref, {anchor: ev[_currentTarget]})
					}}
					code={0xEAD9}
				/>
			</TextTooltip>}
		/>)

		return (<Show when={isAnyTask()}>
			<Headline/>
			<For each={$props[_taskList][_tasks]}>{(task, index) =>
				<Show when={taskCondition(task)}>
					<TaskItem
						command={props[_command]}
						task={task}
						labels={props[_labels]}
						taskIndex={index()}
						taskListIndex={$props[_taskListIndex]}
						onEditLabel={(ev, label) => props[_onEditLabel](ev, label, task, $props[_taskListIndex], index())}
						onEditFiles={ev => props[_onEditFilesTask](ev, task, $props[_taskListIndex], index())}
						onEditReminder={ev => props[_onEditReminderTask](ev, task, $props[_taskListIndex], index())}
						onEdit={ev => props[_onEditTask](ev, task, $props[_taskListIndex], index())}
						onContextMenu={ev => props[_onContextMenuTask](ev, task, $props[_taskListIndex], index())}
						onDelete={ev => props[_onDeleteTask](ev, task, $props[_taskListIndex], index())}
					/>
				</Show>
			}</For>
		</Show>)
	}

	return (<div
		class={CSS.body_group_task_list}
		data-empty={toggleAttribute(!isNotEmpty())}>
		<AppbarTasks
			taskListIndex={-1}
			isAnyTask={isNotEmpty()}
			isAnyCompletedTask={false}
			isAnyUncompletedTask={false}
			command={props[_command]}
			isGroup={true}
			settings={props[_settings]}
			page={props[_page]}
			leading={<Icon code={getIcon()}/>}
			headline={stringToTitleCase(props[_page] as Pages)}
		/>
		<Show when={isNotEmpty()} fallback={<EmptyTasks page={props[_page]} />}>
			<For each={props[_taskLists]}>{(taskList, index) => <TaskListGroup
				taskListIndex={index()}
				taskList={taskList}
			/>}</For>
		</Show>
		<Menu
			ref={r => menu_more_ref = r}
			onToggleOpen={isOpen => setIs_menu_more_open(isOpen)}>
			<MenuItem
				iconCode={0xE51B}
				onClick={(ev) => {
					props[_command](Commands.copy_tasks, selectedTaskListToAction[_taskListIndex])
					closeMenu(menu_more_ref)
					openToast(ev, toast_copied_ref)
				}}>
				Copy tasks
			</MenuItem>
		</Menu>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Tasks copied
		</Toast>
	</div>)
}

const _: VoidComponent<{
	page: Pages | number
	taskLists: TaskList[]
	settings: Settings
	isFileDBError: boolean
	labels: (TaskLabel | undefined)[]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_taskActionMove_open, setIs_menu_taskActionMove_open] = createSignal<boolean>(false)
	const [is_menu_taskActionAddLabel_open, setIs_menu_taskActionAddLabel_open] = createSignal<boolean>(false)
	const [is_dateTimePicker_reminder_open, setIs_dateTimePicker_reminder_open] = createSignal<boolean>(false)
	const [is_menu_labels_open, setIs_menu_labels_open] = createSignal<boolean>(false)
	const [is_menu_fileAction_open, setIs_menu_fileAction_open] = createSignal<boolean>(false)
	const [is_menu_fileAction3_open, setIs_menu_fileAction3_open] = createSignal<boolean>(false)
	const [text_file, setText_file] = createSignal('')
	const [text_subtask, setText_subtask] = createSignal('')
	const [fileURLOrFileContent, setFileURLOrFileContent] = createSignal<string>('')

	// 'edit' = open from left click to task
	// 'action' = open from right click to task
	// 'chip' = open from left click to reminder chip below task name
	const [changeReminderOption, setChangeReminderOption] = createSignal<'edit' | 'action' | 'chip'>(_edit)
	const [selectedLabel, setSelectedLabel] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selectedTaskToEdit, setSelectedTaskToEdit] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1})
	const [selectedTaskToAction, setSelectedTaskToAction] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({ task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1 })
	const [selectedTaskToDelete, setSelectedTaskToDelete] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({ task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1 })
	const [selectedTaskToFileAction, setSelectedTaskToFileAction] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({ task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1 })
	const [selectedTaskToChangeReminder, setSelectedTaskToChangeReminder] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({ task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1 })
	const [selectedTaskToEditLabel, setSelectedTaskToEditLabel] = createStore<{task: Task, taskListIndex: number, taskIndex: number}>({ task: {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}, taskIndex: -1, taskListIndex: -1 })
	const [selectedFileToView, setSelectedFileToView] = createStore<{file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number }>({file: {id: -1, listId: -1, name: '', size: 0, taskId: -1, type: ''}, taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToRename, setSelectedFileToRename] = createStore<{file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number }>({file: {id: -1, listId: -1, name: '', size: 0, taskId: -1, type: ''}, taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToAction, setSelectedFileToAction] = createStore<{file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number }>({file: {id: -1, listId: -1, name: '', size: 0, taskId: -1, type: ''}, taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedFileToAction2, setSelectedFileToAction2] = createStore<{file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number }>({file: {id: -1, listId: -1, name: '', size: 0, taskId: -1, type: ''}, taskListIndex: -1, taskIndex: -1, fileIndex: -1})
	const [selectedSubtaskToEdit, setSelectedSubtaskToEdit] = createStore<{subtask: SubTask, taskListIndex: number, taskIndex: number, subtaskIndex: number}>({subtask: {complete: false, id: -1, listId: -1, name: '', taskId: -1}, taskListIndex: -1, taskIndex: -1, subtaskIndex: -1})
	const getTaskListIndex = createMemo<number | null>(() => {
		const taskLists = props[_taskLists]
		for (let i = 0; i < taskLists[_length]; i++) {
			const taskList = taskLists[i]
			if (props[_page] == Pages[_tasks] && taskList[_id] == DEFAULT_TASK_LIST[_id]) return i
			if (isNumber(props[_page]) && taskList[_id] == props[_page]) return i
		}
		return null
	})

	// 'edit' = open from left click to task
	// 'action' = open from left click to file chip below task name
	let renameFileOption: 'edit' | 'action' = _edit
	let addSubtaskOption: 'edit' | 'action' = _edit
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
	let submenu_moveTask_ref: HTMLDivElement
	let dateTimePicker_reminder_ref: HTMLDialogElement
	let dialog_fileRename_ref: HTMLDialogElement
	let dialog_editTask_ref: HTMLDialogElement
	let dialog_deleteTaskWarning_ref: HTMLDialogElement
	let dialog_viewFile_ref: HTMLDialogElement
	let dialog_newSubtask_ref: HTMLDialogElement
	let dialog_editSubtask_ref: HTMLDialogElement

	async function deleteTask(ev: Event, task: Task, taskListIndex: number, taskIndex: number): Promise<void> {
		if (!props[_settings][_isShowDeleteTaskWarning]) {
			closeDialog(dialog_deleteTaskWarning_ref)
			closeDialog(dialog_editTask_ref)
			closeMenu(menu_taskAction_ref)
			props[_command](Commands.delete_task, task, taskListIndex, taskIndex)
			return
		}

		setSelectedTaskToDelete({task, taskListIndex, taskIndex})
		openDialog(ev, dialog_deleteTaskWarning_ref, {important: true})
	}

	function editTask(ev: Event, task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToEdit({task, taskListIndex, taskIndex})
		openDialog(ev, dialog_editTask_ref)
	}

	async function viewFile(ev: Event, file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number): Promise<void> {
		setSelectedFileToView({file, taskListIndex, taskIndex, fileIndex})
		const blob = (await props[_command](
			Commands.get_file_blob,
			ev,
			file,
			taskListIndex,
			taskIndex,
			fileIndex
		) as (Blob | null))
		if (blob == null) return;

		setFileURLOrFileContent(selectedFileToView[_file][_type][_startsWith](_text)
			? await readFileAsText(blob)
			: createObjectURL(blob)
		)
		openDialog(ev, dialog_viewFile_ref)
	}

	function deleteSubtask(index: number): void {
		setSelectedTaskToEdit(
			_task,
			_subtasks,
			subtasks => subtasks[_slice](0, index)[_concat](subtasks[_slice](index + 1))
		)
		props[_command](
			Commands.edit_task,
			selectedTaskToEdit[_task],
			selectedTaskToEdit[_taskListIndex],
			selectedTaskToEdit[_taskIndex]
		)
	}

	function editSubtask(ev: Event, subtask: SubTask, taskListIndex: number, taskIndex: number, subtaskIndex: number): void {
		setSelectedSubtaskToEdit({subtask, taskListIndex, taskIndex, subtaskIndex})
		changeTextFieldValue(textfield_editSubtask_ref, subtask[_name])
		setText_subtask(subtask[_name])
		openDialog(ev, dialog_editSubtask_ref, {
			important: true,
			inputAutoFocus: true
		})
	}

	function confirmEditSubtask(): void {
		closeDialog(dialog_editSubtask_ref)
		props[_command](
			Commands.edit_subtask,
			{...selectedSubtaskToEdit[_subtask], name: text_subtask()[_trim]()} satisfies SubTask,
			selectedSubtaskToEdit[_taskListIndex],
			selectedSubtaskToEdit[_taskIndex],
			selectedSubtaskToEdit[_subtaskIndex]
		)

		setSelectedTaskToEdit(
			_task,
			_subtasks,
			props[_taskLists][selectedSubtaskToEdit[_taskListIndex]][_tasks][selectedSubtaskToEdit[_taskIndex]][_subtasks]
		)
	}

	async function confirmAddSubtask(): Promise<void> {
		const task = addSubtaskOption == _action? selectedTaskToAction[_task] : selectedTaskToEdit[_task]
		const taskListIndex = addSubtaskOption == _action? selectedTaskToAction[_taskListIndex] : selectedTaskToEdit[_taskListIndex]
		const taskIndex = addSubtaskOption == _action? selectedTaskToAction[_taskIndex] : selectedTaskToEdit[_taskIndex]

		closeDialog(dialog_newSubtask_ref)
		const subtasks = (await props[_command](
			Commands.add_subtask,
			{   complete: false,
				id: -1,
				listId: task[_listId],
				name: text_subtask()[_trim](),
				taskId: task[_id]
			} satisfies SubTask,
			taskListIndex,
			taskIndex
		) as SubTask[])

		if (addSubtaskOption == _edit) setSelectedTaskToEdit(_task, _subtasks, subtasks)
		else setSelectedTaskToAction(_task, _subtasks, subtasks)
	}

	function confirmFileRename(): void {
		closeDialog(dialog_fileRename_ref)

		const s = selectedFileToRename
		const newFile: TaskFileMetaData = {
			id: s[_file][_id],
			listId: s[_file][_listId],
			name: text_file()[_trim]() + '.' + s[_file][_name][_replace](/^[^\.]+\./gs, ''),
			size: s[_file][_size],
			taskId: s[_file][_taskId],
			type: s[_file][_type]
		}
		props[_command](Commands.edit_file, newFile, s[_taskListIndex], s[_taskIndex], s[_fileIndex])

		const files = props[_taskLists][s[_taskListIndex]][_tasks][s[_taskIndex]][_files]
		if (renameFileOption == _edit) setSelectedTaskToEdit(_task, _files, files)
		else if (renameFileOption == _action) setSelectedTaskToFileAction(_task, _files, files)
	}

	function onContextMenuTask(ev: ComponentEvent<MouseEvent>, task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToAction({task, taskListIndex, taskIndex})
		openMenu(ev, menu_taskAction_ref, {position: MenuPosition[_centerBottomToRight]})
	}

	function onEditTask(ev: ComponentEvent<MouseEvent>, task: Task, taskListIndex: number, taskIndex: number): void {
		editTask(ev, task, taskListIndex, taskIndex)
	}

	function onEditReminderTask(ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToChangeReminder({task, taskListIndex, taskIndex})
		openMenu(ev, menu_reminder_ref, {
			anchor: ev[_currentTarget],
			position: MenuPosition[_centerBottomToRight]
		})
	}

	function onEditFilesTask(ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToFileAction({task, taskListIndex, taskIndex})
		openMenu(ev, menu_fileAction2_ref, {
			anchor: ev[_currentTarget],
			position: MenuPosition[_centerBottomToRight]
		})
	}

	function onEditLabel(ev: ComponentEvent<MouseEvent, HTMLButtonElement>, label: TaskLabel, task: Task, taskListIndex: number, taskIndex: number): void {
		setSelectedTaskToEditLabel({task, taskListIndex, taskIndex})
		setSelectedLabel(label)
		openMenu(ev, menu_labelAction2_ref, {
			anchor: ev[_currentTarget],
			position: MenuPosition[_centerBottomToRight]
		})
	}

	function onDeleteTask(ev: ComponentEvent<MouseEvent, HTMLButtonElement>, task: Task, taskListIndex: number, taskIndex: number): void {
		deleteTask(ev, task, taskListIndex, taskIndex)
	}

	const SubtaskItem: VoidComponent<{
		subtask: SubTask
		taskListIndex: number
		taskIndex: number
		subtaskIndex: number
	}> = ($props) => {
		return (<List
			trailing={<>
				<TextTooltip text='Edit subtask'>
					<IconButton
						onClick={ev => editSubtask(ev, $props[_subtask], $props[_taskListIndex], $props[_taskIndex], $props[_subtaskIndex])}
						code={0xE739}
					/>
				</TextTooltip>
				<TextTooltip text="Delete subtask">
					<IconButton
						onClick={() => deleteSubtask($props[_subtaskIndex])}
						code={0xE59D}
					/>
				</TextTooltip>
			</>}
			leading={<TextTooltip text={`Mark as ${$props[_subtask][_complete]? 'un' : ''}completed`}>
				<IconButton
					onClick={() => {
						const subtask: SubTask = {
							...$props[_subtask],
							complete: !$props[_subtask][_complete]
						}
						props[_command](
							Commands.edit_subtask,
							subtask,
							$props[_taskListIndex],
							$props[_taskIndex],
							$props[_subtaskIndex]
						)
						setSelectedTaskToEdit(_task, _subtasks, $props[_subtaskIndex], subtask)
					}}
					code={$props[_subtask][_complete]? 0xE3CB : 0xE3D4}/>
			</TextTooltip>}>
			{$props[_subtask][_name]}
		</List>)
	}

	const FileItem: VoidComponent<{file: TaskFileMetaData, taskListIndex: number, taskIndex: number, fileIndex: number }> = ($props) => {
		const isTypeNotSupported = createMemo<boolean>(() => !/^(audio|image|video|text)/[_test]($props[_file][_type]))
		const getSizeText = createMemo(() => {
			const value = $props[_file][_size]
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
				<TextTooltip text={"View file" + (isTypeNotSupported()? ' (not supported)' : '')}>
					<IconButton
						disabled={isTypeNotSupported()}
						onClick={ev => viewFile(ev, $props[_file], $props[_taskListIndex], $props[_taskIndex], $props[_fileIndex])}
						code={0xE77B}
					/>
				</TextTooltip>
				<TextTooltip text="More actions">
					<IconButton
						focused={selectedFileToAction[_file][_id] == $props[_file][_id] && is_menu_fileAction_open()}
						onClick={ev => {
							setSelectedFileToAction($props)
							openMenu(ev, menu_fileAction_ref, {anchor: ev[_currentTarget]})
						}}
						code={0xEAD9}
					/>
				</TextTooltip>
			</>}
			subtitle={[getSizeText(), $props[_file][_type][_replace](/\/.+$/gs, '')][_join](" • ")}>
			{$props[_file][_name]}
		</List>)
	}

	const LabelItem: VoidComponent<TaskLabel> = ($props) => {
		return (<List
			leading={<Icon style={{color: $props[_color] ?? undefined}} code={0xE407}/>}
			trailing={<>
				<TextTooltip text="Edit label">
					<IconButton
						onClick={ev => {
							setSelectedLabel($props)
							props[_command](Commands.edit_label, ev, selectedLabel)
						}}
						code={0xE739}
					/>
				</TextTooltip>
				<TextTooltip text="Remove label from task">
					<IconButton
						onClick={() => {
							const index = selectedTaskToEdit[_task][_labelIds][_findIndex](id => id == $props[_id])
							if (index < 0) return;

							setSelectedTaskToEdit(_task, _labelIds, ids => ids[_slice](0, index)[_concat](ids[_slice](index + 1)))
							props[_command](
								Commands.edit_task,
								selectedTaskToEdit[_task],
								selectedTaskToEdit[_taskListIndex],
								selectedTaskToEdit[_taskIndex]
							)
						}}
						code={0xE5E9}
					/>
				</TextTooltip>
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
				<Button
					variant={ButtonVariant[_tonal]}
					onClick={() => closeDialog(dialog_editTask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					onClick={() => {
						props[_command](
							Commands.edit_task,
							{...selectedTaskToEdit[_task], complete: !selectedTaskToEdit[_task][_complete]} satisfies Task,
							selectedTaskToEdit[_taskListIndex],
							selectedTaskToEdit[_taskIndex]
						)

						setSelectedTaskToEdit(_task, props[_taskLists][selectedTaskToEdit[_taskListIndex]][_tasks][selectedTaskToEdit[_taskIndex]])
					}}>
					Mark as {selectedTaskToEdit[_task][_complete]? "not" : ''} completed
				</Button>
			</>}>
			<TextField
				labelText="Task"
				value={selectedTaskToEdit[_task][_name]}
				onBlur={ev => {
					if (ev[_currentTarget][_value] == selectedTaskToEdit[_task][_name]) return;

					setSelectedTaskToEdit(_task, _name, ev[_currentTarget][_value])
					props[_command](
						Commands.edit_task,
						selectedTaskToEdit[_task],
						selectedTaskToEdit[_taskListIndex],
						selectedTaskToEdit[_taskIndex]
					)
				}}
			/>
			<AreaTextField
				labelText="Description"
				maxLine={3}
				value={selectedTaskToEdit[_task][_description]}
				onBlur={ev => {
					if (ev[_currentTarget][_value] == selectedTaskToEdit[_task][_description]) return;
					setSelectedTaskToEdit(_task, _description, ev[_currentTarget][_value])
					props[_command](
						Commands.edit_task,
						selectedTaskToEdit[_task],
						selectedTaskToEdit[_taskListIndex],
						selectedTaskToEdit[_taskIndex]
					)
				}}
			/>
			<div data-subtasks>
				<For each={selectedTaskToEdit[_task][_subtasks]}>{ (subtask, index) => <SubtaskItem
					subtask={subtask}
					taskListIndex={selectedTaskToEdit[_taskListIndex]}
					taskIndex={selectedTaskToEdit[_taskIndex]}
					subtaskIndex={index()}
				/>}</For>
				<Button
					onClick={ev => {
						addSubtaskOption = _edit
						openDialog(ev, dialog_newSubtask_ref, {
							important: true,
							inputAutoFocus: true
						})}
					}>
					<Icon code={0xE009}/>Add subtask
				</Button>
			</div>
			<Divider />
			<div data-label>
				<For each={selectedTaskToEdit[_task][_labelIds]}>{labelId =>
					<Show when={props[_labels][labelId] != undefined}>
						<LabelItem {...props[_labels][labelId]!} />
					</Show>
				}</For>
				<Button
					focused={is_menu_labels_open()}
					onClick={ev => openMenu(ev, menu_labels_ref, {
						anchor: ev[_currentTarget],
						position: MenuPosition[_centerBottomToRight]
					})}>
					<Icon code={0xF00D}/>Add label
				</Button>
			</div>
			<Divider />
			<div data-reminder>
				<Show
					when={selectedTaskToEdit[_task][_reminder] != null}
					fallback={<Button
						focused={is_dateTimePicker_reminder_open()}
						onClick={ev => {
							setChangeReminderOption(_edit)
							openDateTimePicker(ev, dateTimePicker_reminder_ref, {
								anchor: ev[_currentTarget],
								position: DateTimePickerPosition[_centerBottomToRight]
							})
						}}>
						<Icon code={0xE01D}/>Add reminder
					</Button>}>
					<List
						trailing={<>
							<TextTooltip text="Change datetime reminder">
								<IconButton
									onClick={ev => {
										setChangeReminderOption(_edit)
										openDateTimePicker(ev, dateTimePicker_reminder_ref, {
											anchor: ev[_currentTarget],
											position: DateTimePickerPosition[_centerBottomToRight]
										})
									}}
									code={0xE2EA}
								/>
							</TextTooltip>
							<TextTooltip text="Remove reminder">
								<IconButton
									onClick={(_ev) => {
										setSelectedTaskToEdit(_task, _reminder, null)
										props[_command](
											Commands.edit_task,
											selectedTaskToEdit[_task],
											selectedTaskToEdit[_taskListIndex],
											selectedTaskToEdit[_taskIndex]
										)
									}}
									code={0xE01F}
								/>
							</TextTooltip>
						</>}
						leading={<Icon code={0xE025}/>}>
						<span style={{
							color: isOutDate_YMD_HM(
								selectedTaskToEdit[_task][_reminder]!,
								getCurrentDate(),
								new Date(getDate_Y() + 100, 2, 2)
							)? 'rgb(var(--color-error))' : undefined
						}}>{getDateString_YMD_HM(selectedTaskToEdit[_task][_reminder]!)}</span>
					</List>
				</Show>
			</div>
			<Divider />
			<Show when={!props[_isFileDBError]}>
				<div data-file>
					<For each={selectedTaskToEdit[_task][_files]}>{(file, index) =>
						<FileItem
							file={file}
							fileIndex={index()}
							taskIndex={selectedTaskToEdit[_taskIndex]}
							taskListIndex={selectedTaskToEdit[_taskListIndex]}
						/>
					}</For>
					<Button
						onClick={() => {
							const taskIndex = selectedTaskToEdit[_taskIndex]
							const taskListIndex = selectedTaskToEdit[_taskListIndex]
							const task = selectedTaskToEdit[_task]
							openFile(null, true)[_then](async (files) => {
								if (files == null) return;
								const result = (await props[_command](
									Commands.add_files,
									files,
									task,
									taskListIndex,
									taskIndex
								) as TaskFileMetaData[])
								setSelectedTaskToEdit(_task, _files, result)
							})
						}}>
						<Icon code={0xE187}/>Add file
					</Button>
				</div>
				<Divider />
			</Show>
			<div data-important>
				<Button onClick={() => {
						setSelectedTaskToEdit(_task, _important, t => !t)
						props[_command](
							Commands.edit_task,
							selectedTaskToEdit[_task],
							selectedTaskToEdit[_taskListIndex],
							selectedTaskToEdit[_taskIndex]
						)
					}}>
					<Icon filled={selectedTaskToEdit[_task][_important]} code={0xEF1B}/>
					Mark as {selectedTaskToEdit[_task][_important]? 'not' : ''} important
				</Button>
			</div>
			<div data-delete>
				<Button
					onClick={ev => deleteTask(
						ev,
						selectedTaskToEdit[_task],
						selectedTaskToEdit[_taskListIndex],
						selectedTaskToEdit[_taskIndex]
					)}
					style={{color: 'rgb(var(--color-error))'}}>
					<Icon code={0xE59D}/>
					Delete task
				</Button>
			</div>
		</Dialog>
		<Dialog
			header="Delete task"
			style={{width: '560px'}}
			ref={r => dialog_deleteTaskWarning_ref = r}
			actions={<>
				<Button
					onClick={() => closeDialog(dialog_deleteTaskWarning_ref)}
					variant={ButtonVariant[_tonal]}>
					Cancel
				</Button>
				<Button
					onClick={async () => {
						closeDialog(dialog_deleteTaskWarning_ref)
						closeDialog(dialog_editTask_ref)
						closeMenu(menu_taskAction_ref)
						props[_command](
							Commands.delete_task,
							selectedTaskToDelete[_task],
							selectedTaskToDelete[_taskListIndex],
							selectedTaskToDelete[_taskIndex]
						)
					}}
					variant={ButtonVariant[_filled]}>
					Delete
				</Button>
			</>}>
			Are you sure want to delete <q><span style={{color: 'rgb(var(--color-accent))', "font-weight": 'bold'}}>{(selectedTaskToDelete[_task][_name]) || ''}</span></q> task?
			<CheckBox
				style={{"margin-top": '16px'}}
				onChange={ev => props[_command](Commands.toggle_deleteTaskWarning, !ev[_currentTarget][_checked])}>
				Don't remind me again
			</CheckBox>
		</Dialog>
		<Dialog
			ref={r => dialog_fileRename_ref = r}
			style={{width: '500px'}}
			header="Rename file"
			actions={<>
				<Button
					variant={ButtonVariant[_tonal]}
					onClick={() => closeDialog(dialog_fileRename_ref)}>
					Cancel
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					disabled={text_file()[_trim]() == ''}
					onClick={() => confirmFileRename()}>
					Rename
				</Button>
			</>}>
			<form onSubmit={ev => {
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
				if (!selectedFileToView[_file][_type][_startsWith](_text)) revokeObjectURL(fileURLOrFileContent())
				setFileURLOrFileContent('')
			}}
			header={selectedFileToView[_file][_name]}
			actions={<>
				<Button
					onClick={() => closeDialog(dialog_viewFile_ref)}
					variant={ButtonVariant[_tonal]}>
					Close
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					onClick={(ev) => props[_command](
						Commands.download_file,
						ev,
						selectedFileToView[_file],
						selectedFileToView[_taskListIndex],
						selectedFileToView[_taskIndex],
						selectedFileToView[_fileIndex]
					)}>
					Donwload
				</Button>
			</>}>
			<Show when={fileURLOrFileContent() != ''}>
				<Switch>
					<Match when={selectedFileToView[_file][_type][_startsWith](_image)}>
						<img src={fileURLOrFileContent()} width={'100%'}/>
					</Match>
					<Match when={selectedFileToView[_file][_type][_startsWith](_video)}>
						<video src={fileURLOrFileContent()} autoplay controls width={'100%'}></video>
					</Match>
					<Match when={selectedFileToView[_file][_type][_startsWith](_audio)}>
						<audio src={fileURLOrFileContent()} autoplay controls style={{width: '100%'}}></audio>
					</Match>
					<Match when={selectedFileToView[_file][_type][_startsWith](_text)}>
						<pre><code style={{'white-space': _normal}}>{fileURLOrFileContent()}</code></pre>
					</Match>
				</Switch>
			</Show>
		</Dialog>
		<Dialog
			ref={r => dialog_newSubtask_ref = r}
			style={{width: '500px'}}
			header="New subtask"
			onClose={() => {
				setText_subtask('')
				changeTextFieldValue(textfield_newSubtask_ref, '')
			}}
			actions={<>
				<Button
					variant={ButtonVariant[_tonal]}
					onClick={() => closeDialog(dialog_newSubtask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					disabled={text_subtask()[_trim]() == ''}
					onClick={() => confirmAddSubtask()}>
					Add
				</Button>
			</>}>
			<form onSubmit={ev => {
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
			onClose={() => {
				setText_subtask('')
				changeTextFieldValue(textfield_editSubtask_ref, '')
			}}
			actions={<>
				<Button
					variant={ButtonVariant[_tonal]}
					onClick={() => closeDialog(dialog_editSubtask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					disabled={text_subtask()[_trim]() == ''}
					onClick={() => confirmEditSubtask()}>
					Edit
				</Button>
			</>}>
			<form style={{display: _contents}} onSubmit={ev => {
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
				iconCode={selectedTaskToAction[_task][_complete]? 0xE3D4 : 0xE3CC}
				onClick={() => {
					closeMenu(menu_taskAction_ref)
					props[_command](
						Commands.edit_task,
						{   ...selectedTaskToAction[_task],
							complete: !selectedTaskToAction[_task][_complete]
						} satisfies Task,
						selectedTaskToAction[_taskListIndex],
						selectedTaskToAction[_taskIndex]
					)
				}}
				trailing={<MenuIndent />}>
				Mark as {selectedTaskToAction[_task][_complete]? 'not' : ''} completed
			</MenuItem>
			<MenuItem
				leading={<Icon code={0xEF1B} filled={!((selectedTaskToAction[_task][_important]) || false)}/>}
				onClick={() => {
					closeMenu(menu_taskAction_ref)
					props[_command](
						Commands.edit_task,
						{   ...selectedTaskToAction[_task],
							important: !selectedTaskToAction[_task][_important]
						} satisfies Task,
						selectedTaskToAction[_taskListIndex],
						selectedTaskToAction[_taskIndex]
					)
				}}
				trailing={<MenuIndent />}>
				Mark as {selectedTaskToAction[_task][_important]? 'not' : ''} important
			</MenuItem>
			<MenuDivider />
			<Show when={!props[_isFileDBError]}>
				<MenuItem
					iconCode={0xE187}
					trailing={<MenuIndent />}
					onClick={() => {
						closeMenu(menu_taskAction_ref)

						const taskIndex = selectedTaskToAction[_taskIndex]
						const taskListIndex = selectedTaskToAction[_taskListIndex]
						const task = selectedTaskToAction[_task]
						openFile(null, true)[_then](async (files) => {
							if (files == null) return;
							const result = await props[_command](
								Commands.add_files,
								files,
								task,
								taskListIndex,
								taskIndex
							) as TaskFileMetaData[]
							setSelectedTaskToAction(_task, _files, result)
						})
					}}>
					Add file
				</MenuItem>
			</Show>
			<MenuItem
				iconCode={0xE009}
				trailing={<MenuIndent />}
				onClick={ev => {
					closeMenu(menu_taskAction_ref)
					addSubtaskOption = _action
					openDialog(ev, dialog_newSubtask_ref, {
						important: true,
						inputAutoFocus: true
					})
				}}>
				Add subtask
			</MenuItem>
			<Show when={selectedTaskToAction[_task][_reminder] == null}>
				<MenuItem
					onClick={ev => {
						closeMenu(menu_taskAction_ref)
						setChangeReminderOption(_action)
						openDateTimePicker(ev, dateTimePicker_reminder_ref)
					}}
					iconCode={0xE01B}
					trailing={<MenuIndent />}>
					Add reminder
				</MenuItem>
			</Show>
			<Show when={props[_labels][_length] > 0}>
				<SubMenu
					level={1}
					onToggleOpen={v => setIs_menu_taskActionAddLabel_open(v)}
					item={<SubMenuItem
						focused={is_menu_taskActionAddLabel_open()}
						iconCode={0xF00D}>
						Add label
					</SubMenuItem>}>
					<For each={props[_labels]}>{label => <Show when={label != undefined}>
						<MenuItem
							leading={<Icon style={{color: label![_color] ?? undefined}} code={0xE407}/>}
							checked={selectedTaskToAction[_task][_labelIds][_includes](label![_id])}
							onClick={() => {
								const index = selectedTaskToAction[_task][_labelIds][_findIndex](id => id == label![_id])
								setSelectedTaskToAction(_task, _labelIds, ids => index >= 0
									? ids[_slice](0, index)[_concat](ids[_slice](index + 1))
									: [...ids, label![_id]]
								)
								props[_command](
									Commands.edit_task,
									selectedTaskToAction[_task],
									selectedTaskToAction[_taskListIndex],
									selectedTaskToAction[_taskIndex]
								)
							}}>
							{label![_name]}
						</MenuItem>
					</Show>}</For>
				</SubMenu>
			</Show>
			<MenuDivider />
			<SubMenu
				level={1}
				ref={r => submenu_moveTask_ref = r}
				style={{"min-width": '200px'}}
				onToggleOpen={v => setIs_menu_taskActionMove_open(v)}
				item={<SubMenuItem
					focused={is_menu_taskActionMove_open()}
					iconCode={0xE115}>
					Move task to ...
				</SubMenuItem>}>
				<For each={props[_taskLists]}>{(list, i) => <>
					<MenuItem
						onClick={() => {
							props[_command](
								Commands.move_task,
								selectedTaskToAction[_task],
								selectedTaskToAction[_taskListIndex],
								selectedTaskToAction[_taskIndex],
								i()
							)
							closeSubMenu(submenu_moveTask_ref)
							closeMenu(menu_taskAction_ref)
						}}
						style={{order: list[_id] == DEFAULT_TASK_LIST[_id]? '-2' : undefined}}
						iconCode={list[_id] == DEFAULT_TASK_LIST[_id]
							? 0xE8E2
							: list[_emoji] == null
								? 0xF032
								: undefined
						}
						leading={<Show
							when={list[_emoji] != null && list[_id] != DEFAULT_TASK_LIST[_id]}>
							<Emoji emoji={list[_emoji]!} />
						</Show>}
						selected={i() == getTaskListIndex()}>
						{list[_name]}
					</MenuItem>
					<Show when={props[_taskLists][_length] > 1 && list[_id] == DEFAULT_TASK_LIST[_id]}>
						<MenuDivider style={{order: '-1'}}/>
					</Show>
				</>}</For>
			</SubMenu>
			<MenuDivider />
			<MenuItem
				onClick={ev => {
					closeMenu(menu_taskAction_ref)
					editTask(
						ev,
						selectedTaskToAction[_task],
						selectedTaskToAction[_taskListIndex],
						selectedTaskToAction[_taskIndex]
					)
				}}
				iconCode={0xE739}
				trailing={<MenuIndent />}>
				Edit task
			</MenuItem>
			<MenuItem
				iconCode={0xE59D}
				trailing={<MenuIndent />}
				onClick={ev => deleteTask(
					ev,
					selectedTaskToAction[_task],
					selectedTaskToAction[_taskListIndex],
					selectedTaskToAction[_taskIndex])
				}>
				Delete task
			</MenuItem>
		</Menu>
		<Menu ref={r => menu_reminder_ref = r}>
			<MenuItem
				iconCode={0xE2EA}
				onClick={ev => {
					closeMenu(menu_reminder_ref)
					setChangeReminderOption(_chip)
					openDateTimePicker(ev, dateTimePicker_reminder_ref)
				}}>
				Change datetime reminder
			</MenuItem>
			<MenuItem
				iconCode={0xE01F}
				onClick={() => {
					closeMenu(menu_reminder_ref)
					setSelectedTaskToChangeReminder(_task, _reminder, null)
					props[_command](
						Commands.edit_task,
						selectedTaskToChangeReminder[_task],
						selectedTaskToChangeReminder[_taskListIndex],
						selectedTaskToChangeReminder[_taskIndex]
					)
				}}>Remove reminder
			</MenuItem>
		</Menu>
		<Menu
			ref={r => menu_labels_ref = r}
			onToggleOpen={isOpen => setIs_menu_labels_open(isOpen)}>
			<MenuItem
				iconCode={0xE007}
				onClick={ev => props[_command](Commands.add_label, ev)}>
				New label
			</MenuItem>
			<Show when={props[_labels][_length] > 0}>
				<MenuItem
					iconCode={0xE739}
					onClick={ev => {
						closeDialog(dialog_editTask_ref)
						closeMenu(menu_labels_ref)
						props[_command](Commands.show_labels_options, ev)
					}}>
					Edit labels
				</MenuItem>
				<Divider/>
			</Show>
			<For each={props[_labels]}>{label => <Show when={label != undefined}>
				<MenuItem
					leading={<Icon style={{color: label![_color] ?? undefined}} code={0xE407}/>}
					checked={selectedTaskToEdit[_task][_labelIds][_includes](label![_id])}
					onContextMenu={ev => {
						setSelectedLabel(label!)
						preventDefault(ev)
						openMenu(ev, menu_labelAction_ref, {position: MenuPosition[_centerBottomToRight]})
					}}
					onClick={() => {
						const index = selectedTaskToEdit[_task][_labelIds][_findIndex](id => id == label![_id])
						setSelectedTaskToEdit(
							_task,
							_labelIds,
							ids => index < 0
								? [...ids, label![_id]]
								: ids[_slice](0, index)[_concat](ids[_slice](index + 1))
						)
						props[_command](
							Commands.edit_task,
							selectedTaskToEdit[_task],
							selectedTaskToEdit[_taskListIndex],
							selectedTaskToEdit[_taskIndex]
						)
					}}>
					{label![_name]}
				</MenuItem>
			</Show>}</For>
		</Menu>
		<Menu ref={r => menu_labelAction_ref = r}>
			<MenuItem
				iconCode={0xE739}
				onClick={ev => {
					closeMenu(menu_labelAction_ref)
					props[_command](Commands.edit_label, ev, selectedLabel)
				}}>
				Edit label
			</MenuItem>
			<MenuItem
				iconCode={0xE59D}
				onClick={() => {
					closeMenu(menu_labelAction_ref)
					props[_command](Commands.delete_label, selectedLabel)
				}}>
				Delete label
			</MenuItem>
		</Menu>
		<Menu ref={r => menu_labelAction2_ref = r}>
			<MenuItem
				iconCode={0xE739}
				onClick={ev => {
					closeMenu(menu_labelAction2_ref)
					props[_command](Commands.edit_label, ev, selectedLabel)
				}}>
				Edit label
			</MenuItem>
			<MenuItem
				iconCode={0xE5E9}
				onClick={() => {
					closeMenu(menu_labelAction2_ref)
					const index = selectedTaskToEditLabel[_task][_labelIds][_findIndex](v => v == selectedLabel[_id])
					if (index < 0) return;

					setSelectedTaskToEditLabel(_task, _labelIds, ids => ids[_slice](0, index)[_concat](ids[_slice](index + 1)))
					props[_command](
						Commands.edit_task,
						selectedTaskToEditLabel[_task],
						selectedTaskToEditLabel[_taskListIndex],
						selectedTaskToEditLabel[_taskIndex],
					)
				}}>
				Remove label from task
			</MenuItem>
		</Menu>
		<Menu ref={r => menu_fileAction_ref = r} onToggleOpen={isOpen => setIs_menu_fileAction_open(isOpen)}>
			<MenuItem
				iconCode={0xE0B9}
				onClick={(ev) => {
					closeMenu(menu_fileAction_ref)
					props[_command](
						Commands.download_file,
						ev,
						selectedFileToAction[_file],
						selectedFileToAction[_taskListIndex],
						selectedFileToAction[_taskIndex],
						selectedFileToAction[_fileIndex]
					)
				}}>
				Download
			</MenuItem>
			<MenuItem
				iconCode={0xE739}
				onClick={ev => {
					closeMenu(menu_fileAction_ref)
					const text = selectedFileToAction[_file][_name][_replace](/\.[^\.]*$/, '')
					changeTextFieldValue(textfield_renameFile_ref, text)
					setText_file(text)
					setSelectedFileToRename({...selectedFileToAction})
					renameFileOption = _edit
					openDialog(ev, dialog_fileRename_ref, {
						inputAutoFocus: true,
						important: true
					})
				}}>
				Rename
			</MenuItem>
			<MenuItem
				iconCode={0xE59D}
				onClick={() => {
					closeMenu(menu_fileAction_ref)
					setSelectedTaskToEdit(_task, _files, files => [
						...files[_slice](0, selectedFileToAction[_fileIndex]),
						...files[_slice](selectedFileToAction[_fileIndex] + 1)
					])
					props[_command](
						Commands.edit_task,
						selectedTaskToEdit[_task],
						selectedTaskToEdit[_taskListIndex],
						selectedTaskToEdit[_taskIndex]
					)
				}}>
				Delete
			</MenuItem>
		</Menu>
		<Menu style={{'min-width': '164px'}} ref={r => menu_fileAction2_ref = r}>
			<For each={selectedTaskToFileAction[_task][_files]}>{(file, index) =>
				<MenuItem
					focused={is_menu_fileAction3_open() && file[_id] == selectedFileToAction2[_file][_id]}
					onClick={ev => {
						setSelectedFileToAction2({
							file,
							fileIndex: index(),
							taskIndex: selectedTaskToFileAction[_taskIndex],
							taskListIndex: selectedTaskToFileAction[_taskListIndex]
						})
						openMenu(ev, menu_fileAction3_ref, {
							anchor: ev[_currentTarget],
							position: MenuPosition[_rightCenterToBottom]
						})
					}}>
					{file[_name]}
				</MenuItem>
			}</For>
		</Menu>
		<Menu style={{'min-width': '164px'}} ref={r => menu_fileAction3_ref = r} onToggleOpen={(isOpen) => setIs_menu_fileAction3_open(isOpen)}>
			<Show when={/^(audio|image|video|text)/[_test](selectedFileToAction2[_file][_type])}>
				<MenuItem
					iconCode={0xE77B}
					onClick={ev => {
						closeMenu(menu_fileAction3_ref)
						viewFile(
							ev,
							selectedFileToAction2[_file],
							selectedFileToAction2[_taskListIndex],
							selectedFileToAction2[_taskIndex],
							selectedFileToAction2[_fileIndex]
						)
					}}>
					View
				</MenuItem>
			</Show>
			<MenuItem
				iconCode={0xE739}
				onClick={ev => {
					closeMenu(menu_fileAction3_ref)
					const text = selectedFileToAction2[_file][_name][_replace](/\.[^\.]*$/, '')
					changeTextFieldValue(textfield_renameFile_ref, text)
					setText_file(text)
					setSelectedFileToRename({...selectedFileToAction2})
					renameFileOption = _action
					openDialog(ev, dialog_fileRename_ref, {
						inputAutoFocus: true,
						important: true
					})
				}}>
				Rename
			</MenuItem>
			<MenuItem
				iconCode={0xE0B9}
				onClick={(ev) => {
					closeMenu(menu_fileAction3_ref)
					props[_command](
						Commands.download_file,
						ev,
						selectedFileToAction2[_file],
						selectedFileToAction2[_taskListIndex],
						selectedFileToAction2[_taskIndex],
						selectedFileToAction2[_fileIndex]
					)
				}}>
				Download
			</MenuItem>
			<MenuItem
				iconCode={0xE59D}
				onClick={() => {
					closeMenu(menu_fileAction3_ref)
					if (selectedTaskToFileAction[_task][_files][_length] == 1) closeMenu(menu_fileAction2_ref)

					setSelectedTaskToFileAction(_task, _files, files => [
						...files[_slice](0, selectedFileToAction2[_fileIndex]),
						...files[_slice](selectedFileToAction2[_fileIndex] + 1)
					])
					props[_command](
						Commands.edit_task,
						selectedTaskToFileAction[_task],
						selectedTaskToFileAction[_taskListIndex],
						selectedTaskToFileAction[_taskIndex]
					)
				}}>
				Delete
			</MenuItem>
		</Menu>
	</>)

	const DatePickers: VoidComponent = () => (<>
		<DateTimePicker
			onToggleOpen={(v) => setIs_dateTimePicker_reminder_open(v)}
			datetime={(changeReminderOption() == _edit
				? selectedTaskToEdit[_task][_reminder]
				: changeReminderOption() == _action
					? selectedTaskToAction[_task][_reminder]
					: changeReminderOption() == _chip
						? selectedTaskToChangeReminder[_task][_reminder]
						: new Date()
			) ?? new Date()}
			ref={r => dateTimePicker_reminder_ref = r}
			onSelectDateTime={(date) => {
				let task: Task = {complete: false, description: '', files: [], id: -1, important: false, labelIds: [], listId: -1, name: '', reminder: null, subtasks: []}
				let taskListIndex = 0
				let taskIndex = 0
				if (changeReminderOption() == _edit) {
					setSelectedTaskToEdit(_task, _reminder, date)
					taskListIndex = selectedTaskToEdit[_taskListIndex]
					taskIndex = selectedTaskToEdit[_taskIndex]
					task = selectedTaskToEdit[_task]
				}
				else if (changeReminderOption() == _action) {
					setSelectedTaskToAction(_task, _reminder, date)
					taskListIndex = selectedTaskToAction[_taskListIndex]
					taskIndex = selectedTaskToAction[_taskIndex]
					task = selectedTaskToAction[_task]
				}
				else if (changeReminderOption() == _chip) {
					setSelectedTaskToChangeReminder(_task, _reminder, date)
					taskListIndex = selectedTaskToChangeReminder[_taskListIndex]
					taskIndex = selectedTaskToChangeReminder[_taskIndex]
					task = selectedTaskToChangeReminder[_task]
				}

				props[_command](Commands.edit_task, task, taskListIndex, taskIndex)
			}}
		/>
	</>)

	return (<div class={CSS.body}>
		<Show
			when={getTaskListIndex() == null}
			fallback={<SingleTaskList
				lists={props[_taskLists]}
				command={props[_command]}
				settings={props[_settings]}
				page={props[_page]}
				labels={props[_labels]}
				taskList={props[_taskLists][getTaskListIndex()!]}
				taskListIndex={getTaskListIndex()!}
				onDeleteTask={(ev, task, taskIndex) => onDeleteTask(ev, task, getTaskListIndex()!, taskIndex)}
				onEditLabel={(ev, label, task, taskIndex) => onEditLabel(ev, label, task, getTaskListIndex()!, taskIndex)}
				onEditFilesTask={(ev, task, taskIndex) => onEditFilesTask(ev, task, getTaskListIndex()!, taskIndex)}
				onEditReminderTask={(ev, task, taskIndex) => onEditReminderTask(ev, task, getTaskListIndex()!, taskIndex)}
				onContextMenuTask={(ev, task, taskIndex) => onContextMenuTask(ev, task, getTaskListIndex()!, taskIndex)}
				onEditTask={(ev, task, taskIndex) => onEditTask(ev, task, getTaskListIndex()!, taskIndex)}
			/>}>
			<GroupTaskList
				command={props[_command]}
				settings={props[_settings]}
				page={props[_page]}
				taskLists={props[_taskLists]}
				labels={props[_labels]}
				onDeleteTask={onDeleteTask}
				onEditLabel={onEditLabel}
				onEditFilesTask={onEditFilesTask}
				onEditReminderTask={onEditReminderTask}
				onContextMenuTask={onContextMenuTask}
				onEditTask={onEditTask}
			/>
		</Show>
		<Dialogs/>
		<Menus/>
		<DatePickers/>
	</div>)
}

export default _