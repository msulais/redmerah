import type { DOMElement } from "solid-js/jsx-runtime"
import { createEffect, createMemo, createSignal, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { get_current_date, date_year, date_text_YMD_HM, date_out_range_YMD_HM } from "@/utils/datetime"
import { event_prevent_default, event_stop_propagation } from "@/utils/event"
import { DEFAULT_TASK_LIST } from "./_constants"
import { attr_set_if_exist } from "@/utils/attributes"
import { string_replace, string_starts_with, string_totitlecase, string_trim } from "@/utils/string"
import { add_classlist_module } from "@/utils/element"
import { is_number } from "@/utils/typecheck"
import { file_open, file_read_as_text } from "@/utils/file"
import { url_create, url_revoke } from "@/utils/url"
import { array_concat, array_find_index, array_includes, array_join, array_length, array_slice, array_some } from "@/utils/array"
import { regex_test } from "@/utils/regex"
import { number_parse, number_tofixed } from "@/utils/number"
import { promise_done } from "@/utils/object"
import { AppColors } from "@/enums/colors"

import Divider from "@/components/Divider"
import Icon from "@/components/Icon"
import {TextTooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Emoji from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import List from "@/components/List"
import Expander, { ExpanderHeader } from "@/components/Expander"
import TextField, { AreaTextField, change_textfield_value, TextFieldButton } from "@/components/TextField"
import Menu, { close_menu, close_submenu, MenuDivider, MenuHeader, MenuIndent, MenuItem, MenuPosition, open_menu, SubMenu, SubMenuItem } from "@/components/Menu"
import Dialog, { close_dialog, open_dialog } from "@/components/Dialog"
import Toast, { open_toast } from "@/components/Toast"
import DateTimePicker, { DateTimePickerPosition, open_datetimepicker } from "@/components/DateTimePicker"
import AppBar from "@/components/AppBar"
import CSS from './_styles.module.scss'

const AppbarTasks: VoidComponent<{
	page: Pages | number
	leading: JSX.Element
	headline: JSX.Element
	settings: Settings
	tasklist_index: number
	is_group: boolean
	is_any_task: boolean
	is_any_completed_task: boolean
	si_any_uncompleted_task: boolean
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_sort_open, set_is_menu_sort_open] = createSignal<boolean>(false)
	const [is_menu_more_open, set_is_menu_more_open] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	let menu_sort_ref: HTMLDialogElement
	let menu_more_ref: HTMLDialogElement
	let dialog_cleartasks_ref: HTMLDialogElement
	let dialog_deletecompletedtasks_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function change_sort_by(sort_by: SortBy): void {
		command(Commands.change_sort_by, sort_by)
		close_menu(menu_sort_ref)
	}

	function change_sort_mode(sort_mode: SortMode): void {
		command(Commands.change_sort_mode, sort_mode)
		close_menu(menu_sort_ref)
	}

	const Menus: VoidComponent = () => {
		const sort_by: [by: SortBy, name: string, icon_code: number][] = [
			[SortBy.name, 'Name', 0xF0B0],
			[SortBy.importance, 'Importance', 0xEF1B],
			[SortBy.creation_date, 'Creation date', 0xE310],
			[SortBy.completed, 'Completed', 0xE3CC],
			[SortBy.uncompleted, 'Uncompleted', 0xE3D4],
		]
		const sort_mode: [mode: SortMode, name: string, icon_code: number][] = [
			[SortMode.ascending, 'Ascending', 0xF187],
			[SortMode.descending, 'Descending', 0xF189],
		]
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_sort_ref = r}
				on_toggle_open={(v) => set_is_menu_sort_open(v)}>
				<MenuHeader>Sort by</MenuHeader>
				<For each={sort_by}>{by =>
					<MenuItem
						selected={settings().sort_by == by[0]}
						onClick={() => change_sort_by(by[0])}
						icon_code={by[2]}>
						{by[1]}
					</MenuItem>
				}</For>
				<MenuDivider/>
				<For each={sort_mode}>{mode =>
					<MenuItem
						selected={settings().sort_mode == mode[0]}
						onClick={() => change_sort_mode(mode[0])}
						icon_code={mode[2]}>
						{mode[1]}
					</MenuItem>
				}</For>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				ref={r => menu_more_ref = r}
				on_toggle_open={(v) => set_is_menu_more_open(v)}>
				<Show when={props.si_any_uncompleted_task}>
					<MenuItem
						onClick={() => {
							close_menu(menu_more_ref)
							command(Commands.mark_all_completed, props.tasklist_index)
						}}
						icon_code={0xE3CC}>
						Mark all completed
					</MenuItem>
				</Show>
				<Show when={props.is_any_completed_task}>
					<MenuItem
						onClick={async () => {
							close_menu(menu_more_ref)
							command(Commands.mark_all_uncompleted, props.tasklist_index)
						}}
						icon_code={0xE3D4}>
						Mark all uncompleted
					</MenuItem>
				</Show>
				<Show when={props.is_any_task}>
					<MenuDivider />
					<MenuItem
						onClick={ev => {
							open_dialog(ev, dialog_cleartasks_ref, {important: true})
							close_menu(menu_more_ref)
						}}
						icon_code={0xE5A1}>
						Clear tasks
					</MenuItem>
				</Show>
				<Show when={props.is_any_completed_task}>
					<MenuItem
						onClick={ev => {
							open_dialog(ev, dialog_deletecompletedtasks_ref, {important: true})
							close_menu(menu_more_ref)
						}}
						icon_code={0xE5A3}>
						Delete completed tasks
					</MenuItem>
				</Show>
				<Show when={is_number(props.page)}>
					<Show when={props.is_any_task}><MenuDivider /></Show>
					<MenuItem
						onClick={ev => {
							close_menu(menu_more_ref)
							command(Commands.rename_taskList, ev, props.tasklist_index)
						}}
						icon_code={0xF0FB}>
						Rename list
					</MenuItem>
					<MenuItem
						onClick={ev => {
							close_menu(menu_more_ref)
							command(Commands.delete_taskList, ev, props.tasklist_index)
						}}
						icon_code={0xE59D}>
						Delete list
					</MenuItem>
				</Show>
			</Menu>
		</>)
	}

	const Dialogs: VoidComponent = () => {
		return (<>
			<Dialog
				ref={r => dialog_cleartasks_ref = r}
				header="Clear tasks"
				style={{width: '500px'}}
				actions={<>
					<Button
						onClick={() => close_dialog(dialog_cleartasks_ref)}
						variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							command(Commands.clear_tasks, props.tasklist_index)
							close_dialog(dialog_cleartasks_ref)
						}}
						variant={ButtonVariant.filled}>
						Clear
					</Button>
				</>}>
				Clearing all tasks will permanently delete them. Are you sure you want to continue?
			</Dialog>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_deletecompletedtasks_ref = r}
				header={"Delete completed tasks"}
				actions={<>
					<Button
						onClick={() => close_dialog(dialog_deletecompletedtasks_ref)}
						variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							command(Commands.delete_completed_task, props.tasklist_index)
							close_dialog(dialog_deletecompletedtasks_ref)
						}}
						variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				Are you sure want to delete completed tasks?
			</Dialog>
		</>)
	}

	return (<>
		<AppBar
			classList={add_classlist_module(CSS.body_appbar)}
			leading={props.leading}
			headline={props.headline}
			trailing={<TextTooltip>
				<Show when={props.is_any_task}>
					<IconButton
						data-tooltip="Sort by"
						focused={is_menu_sort_open()}
						onClick={ev => open_menu(ev, menu_sort_ref, {anchor: ev.currentTarget})}
						code={0xE123}
					/>
					<IconButton
						data-tooltip="Copy tasks"
						onClick={(ev) => {
							command(Commands.copy_tasks, props.is_group? undefined : props.tasklist_index)
							open_toast(ev, toast_copied_ref)
						}}
						code={0xE51B}
					/>
				</Show>
				<Show when={!props.is_group && ((props.page == Pages.tasks && props.is_any_task) || is_number(props.page))}>
					<IconButton
						data-tooltip="More options"
						focused={is_menu_more_open()}
						onClick={ev => open_menu(ev, menu_more_ref, {anchor: ev.currentTarget})}
						code={0xEAD9}
					/>
				</Show>
			</TextTooltip>}
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
	task_index: number
	tasklist_index: number
	labels: (TaskLabel | undefined)[]
	on_edit: JSX.EventHandler<HTMLElement, MouseEvent>
	on_edit_reminder: JSX.EventHandler<HTMLButtonElement, MouseEvent>
	on_edit_files: JSX.EventHandler<HTMLButtonElement, MouseEvent>
	on_edit_label: (ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}, label: TaskLabel) => unknown
	on_context_menu: JSX.EventHandler<HTMLElement, MouseEvent>
	on_delete: JSX.EventHandler<HTMLButtonElement, MouseEvent>
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const task = createMemo(() => props.task)

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<Expander
		data-done={attr_set_if_exist(task().complete)}
		header={<ExpanderHeader
			use_expand_icon={false}
			leading={<IconButton
				data-tooltip={`Mark as ${task().complete? 'un' : ''}completed`}
				onContextMenu={ev => {
					event_stop_propagation(ev)
					event_prevent_default(ev)
				}}
				onClick={ev => {
					event_stop_propagation(ev)
					command(
						Commands.edit_task,
						{...task(), complete: !task().complete} satisfies Task,
						props.tasklist_index,
						props.task_index
					)
				}}
				code={task().complete? 0xE3CB : 0xE3D4}
			/>}
			trailing={<>
				<IconButton
					data-tooltip={`Mark as ${task().important? 'not ' : ''}important`}
					onContextMenu={ev => {
						event_stop_propagation(ev)
						event_prevent_default(ev)
					}}
					onClick={ev => {
						event_stop_propagation(ev)
						command(
							Commands.edit_task,
							{...task(), important: !task().important} satisfies Task,
							props.tasklist_index,
							props.task_index
						)
					}}
					filled={task().important}
					code={0xEF1B}
				/>
				<IconButton
					data-tooltip="Delete task"
					onContextMenu={ev => {
						event_stop_propagation(ev)
						event_prevent_default(ev)
					}}
					onClick={ev => {
						event_stop_propagation(ev)
						props.on_delete(ev)
					}}
					code={0xE59D}
				/>
			</>}
			subtitle={<>
				{ task().description }
				<Show when={
					array_length(task().subtasks) > 0
					|| task().reminder != null
					|| array_length(task().files) > 0
					|| array_length(task().label_ids) > 0
				}>
					<div class={CSS.body_task_item_tags}>
						<Show when={task().reminder != null}>
							<Button
								data-tooltip={
									"Task reminder" + (date_out_range_YMD_HM(
										task().reminder!,
										get_current_date(),
										new Date(date_year() + 100, 2, 2)
									)? " (outdated)" : "")}
								style={{
									"border-color": date_out_range_YMD_HM(
										task().reminder!,
										get_current_date(),
										new Date(date_year() + 100, 2, 2)
									)? 'rgb(var(--g-color-error))' : undefined
								}}
								onContextMenu={ev => {
									event_stop_propagation(ev)
									event_prevent_default(ev)
								}}
								onClick={ev => {
									event_stop_propagation(ev)
									props.on_edit_reminder(ev)
								}}
								variant={ButtonVariant.outlined}>
								<Icon filled code={0xE025} inline/>
								{date_text_YMD_HM(task().reminder!)}
							</Button>
						</Show>
						<Show when={array_length(task().files) > 0}>
							<Button
								onContextMenu={ev => {
									event_stop_propagation(ev)
									event_prevent_default(ev)
								}}
								onClick={ev => {
									event_stop_propagation(ev)
									props.on_edit_files(ev)
								}}
								variant={ButtonVariant.outlined}>
								<Icon filled code={0xE187} inline/>
								{array_length(task().files)} file{array_length(task().files) > 1? "s" : ''}
							</Button>
						</Show>
						<For each={task().label_ids}>{labelId =>
							<Show when={props.labels[labelId] != undefined}>
								<Button
									style={{
										"border-color": props.labels[labelId]!.color ?? undefined,
										"background-color": props.labels[labelId]!.color != null
											? props.labels[labelId]!.color + '14'
											: undefined
									}}
									onContextMenu={ev => {
										event_stop_propagation(ev)
										event_prevent_default(ev)
									}}
									onClick={ev => {
										event_stop_propagation(ev)
										props.on_edit_label(ev, props.labels[labelId]!)
									}}
									variant={ButtonVariant.outlined}>
									<Icon filled code={0xF00D} inline/>
									{props.labels[labelId]!.name}
								</Button>
							</Show>
						}</For>
					</div>
				</Show>
			</>}>
			{task().name}
		</ExpanderHeader>}
		attr_header={{
			onClick: ev => {
				props.on_edit(ev)
				event_prevent_default(ev)
			},
			onContextMenu: ev => {
				event_prevent_default(ev)
				props.on_context_menu(ev)
			}
		}}
		classList={add_classlist_module(CSS.body_task_item)}
		open={array_length(task().subtasks) > 0}>
		<For each={task().subtasks}>{(subtask, index) => <CheckBox
			checked={subtask.complete}
			onChange={ev => command(
				Commands.edit_subtask,
				{...subtask, complete: ev.currentTarget.checked} satisfies SubTask,
				props.tasklist_index,
				props.task_index,
				index()
			)}>
			{subtask.name}
		</CheckBox>}</For>
	</Expander>)
}

const EmptyTasks: VoidComponent<{page: Pages | number}> = (props) => {
	const get_icon = createMemo<number>(() => {
		const page = props.page
		switch (page) {
			case Pages.all: return 0xE069
			case Pages.completed: return 0xE3CC
			case Pages.uncompleted: return 0xE3D4
			case Pages.important: return 0xEF1B
			case Pages.planned: return 0xE01B
		}
		return 0xE3CC
	})
	const get_text = createMemo<string>(() => {
		let t = ''
		const page = props.page
		if (array_includes([Pages.completed, Pages.uncompleted, Pages.important, Pages.planned], page as Pages)) {
			t = string_totitlecase(page as Pages)
		}
		return `No ${t} Tasks`
	})
	return (<div class={CSS.body_empty}>
		<Icon filled code={get_icon()}/>
		<p>{get_text()}</p>
	</div>)
}

const SingleTaskList: VoidComponent<{
	page: Pages | number
	tasklist: TaskList
	lists: TaskList[]
	labels: (TaskLabel | undefined)[]
	settings: Settings
	tasklist_index: number
	on_edit_label: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		label: TaskLabel,
		task: Task,
		task_index: number
	) => unknown
	on_delete_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		task_index: number
	) => unknown
	on_edit_task: (
		ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement},
		task: Task,
		task_index: number
	) => unknown
	on_edit_files_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		task_index: number
	) => unknown
	on_edit_reminder_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		task_index: number
	) => unknown
	on_context_menu_task: (
		ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement},
		task: Task,
		task_index: number
	) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_any_completed_task, set_is_any_completed_task] = createSignal<boolean>(true)
	const [isAnyUncompletedTask, set_is_any_uncompleted_task] = createSignal<boolean>(true)
	const page = createMemo(() => props.page)
	const tasklist = createMemo(() => props.tasklist)
	const get_headline = createMemo<string>(() => page() != Pages.tasks? tasklist().name : 'Tasks')
	const is_any_task = createMemo<boolean>(() => array_length(tasklist().tasks) > 0)
	let textfield_newtask_ref: HTMLInputElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function add_task(): void {
		if (
			!(page() == Pages.tasks || is_number(page()))
			|| string_trim(textfield_newtask_ref.value) == ''
		) return;

		const listId: number = (page() == Pages.tasks
			? DEFAULT_TASK_LIST.id
			: page() as number
		)

		command(Commands.add_task, {
			description: '',
			complete: false,
			files: [],
			id: -1,
			important: false,
			label_ids: [],
			list_id: listId,
			name: string_trim(textfield_newtask_ref.value),
			reminder: null,
			subtasks: []
		} satisfies Task, props.tasklist_index)
		change_textfield_value(textfield_newtask_ref, '')
	}

	createEffect(() => {
		const tasks = tasklist().tasks
		let is_any_completed_task = false
		let is_any_uncompleted_task = false

		for (const task of tasks) {
			if (is_any_completed_task && is_any_uncompleted_task) break
			if (task.complete) is_any_completed_task = true
			else is_any_uncompleted_task = true
		}

		set_is_any_completed_task(is_any_completed_task)
		set_is_any_uncompleted_task(is_any_uncompleted_task)
	})

	return (<div
		class={CSS.body_single_task_list}
		data-empty={attr_set_if_exist(!is_any_task())}>
		<AppbarTasks
			command={command}
			tasklist_index={props.tasklist_index}
			page={page()}
			is_group={false}
			is_any_task={is_any_task()}
			is_any_completed_task={is_any_completed_task()}
			si_any_uncompleted_task={isAnyUncompletedTask()}
			settings={props.settings}
			leading={<Show
				when={tasklist().emoji == null}
				fallback={<Emoji emoji={tasklist().emoji!} />}>
				<Show
					when={page() == Pages.tasks}
					fallback={<Icon code={0xF032}/>}>
					<Icon code={0xE8E2}/>
				</Show>
			</Show>}
			headline={get_headline()}
		/>
		<TextTooltip>
			<For each={tasklist().tasks}>{(task, index) => <TaskItem
				command={command}
				task={task}
				on_edit_label={(ev, label) => props.on_edit_label(ev, label, task, index())}
				labels={props.labels}
				task_index={index()}
				tasklist_index={props.tasklist_index}
				on_edit_files={ev => props.on_edit_files_task(ev, task, index())}
				on_edit_reminder={ev => props.on_edit_reminder_task(ev, task, index())}
				on_edit={ev => props.on_edit_task(ev, task, index())}
				on_context_menu={ev => props.on_context_menu_task(ev, task, index())}
				on_delete={ev => props.on_delete_task(ev, task, index())}
			/>}</For>
		</TextTooltip>
		<Show when={!is_any_task()}><EmptyTasks page={page()} /></Show>
		<Show when={is_any_task()}><div style={{flex: '1'}}></div></Show>
		<form onSubmit={ev => {
			add_task()
			event_prevent_default(ev)
		}}>
			<TextField
				placeholder="Add task"
				ref={r => textfield_newtask_ref = r}
				trailing={<TextFieldButton
					data-tooltip="Add task"
					onClick={() => add_task()}>
					<Icon code={0xE00B}/>
				</TextFieldButton>}
			/>
		</form>
	</div>)
}

const GroupTaskList: VoidComponent<{
	page: Pages | number
	tasklists: TaskList[]
	labels: (TaskLabel | undefined)[]
	settings: Settings
	on_edit_label: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		label: TaskLabel,
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	on_delete_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	on_edit_task: (
		ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement},
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	on_edit_files_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	on_edit_reminder_task: (
		ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement},
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	on_context_menu_task: (
		ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement},
		task: Task,
		tasklist_index: number,
		task_index: number
	) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_more_open, set_is_menu_more_open] = createSignal<boolean>(false)
	const [selected_tasklist_to_action, set_selected_tasklist_to_action] = createStore<{list: TaskList, tasklist_index: number}>({
		list: {emoji: null, id: -1, name: '', tasks: []},
		tasklist_index: -1
	})
	const page = createMemo(() => props.page)
	const get_icon = createMemo<number>(() => {
		const $page = page()
		if ($page == Pages.all) return 0xE069
		if ($page == Pages.completed) return 0xE3CC
		if ($page == Pages.uncompleted) return 0xE3D4
		if ($page == Pages.important) return 0xEF1B
		if ($page == Pages.planned) return 0xE01B

		return 0xE3CC
	})
	const is_not_empty = createMemo<boolean>(() => {
		const $page = page()
		const tasklists = props.tasklists
		return array_some(tasklists, tasklist => {
			const tasks = tasklist.tasks
			if ($page == Pages.all) return array_length(tasks) > 0
			if ($page == Pages.completed) return array_some(tasks, task => task.complete)
			if ($page == Pages.uncompleted) return array_some(tasks, task => !task.complete)
			if ($page == Pages.important) return array_some(tasks, task => task.important)
			if ($page == Pages.planned) return array_some(tasks, task => task.reminder != null)
			return false
		})
	})
	let menu_more_ref: HTMLDialogElement
	let toast_copied_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const TaskListGroup: VoidComponent<{
		tasklist: TaskList
		tasklist_index: number
	}> = ($props) => {
		const get_headline = createMemo<string>(() =>  page() != Pages.tasks? $props.tasklist.name : 'Tasks')
		const tasklist = createMemo(() => $props.tasklist)
		const tasklist_index = createMemo(() => $props.tasklist_index)
		const is_any_task = createMemo<boolean>(() => {
			const $page = page()
			const tasks = tasklist().tasks
			if ($page == Pages.all) return array_length(tasks) > 0
			if ($page == Pages.completed) return array_some(tasks, task => task.complete)
			if ($page == Pages.uncompleted) return array_some(tasks, task => !task.complete)
			if ($page == Pages.important) return array_some(tasks, task => task.important)
			if ($page == Pages.planned) return array_some(tasks, task => task.reminder != null)
			return false
		})

		function task_condition(task: Task): boolean {
			const $page = page()
			if ($page == Pages.completed) return task.complete
			if ($page == Pages.uncompleted) return !task.complete
			if ($page == Pages.important) return task.important
			if ($page == Pages.planned) return task.reminder != null
			return true
		}

		const Headline: VoidComponent = () => (<AppBar
			headline={get_headline()}
			leading={<Show
				when={tasklist().emoji == null}
				fallback={<Emoji emoji={tasklist().emoji!} />}>
				<Show
					when={tasklist().id == DEFAULT_TASK_LIST.id}
					fallback={<Icon code={0xF032}/>}>
					<Icon code={0xE8E2}/>
				</Show>
			</Show>}
			trailing={<IconButton
				data-tooltip="More options"
				focused={is_menu_more_open() && selected_tasklist_to_action.tasklist_index == tasklist_index()}
				onClick={ev => {
					set_selected_tasklist_to_action({list: tasklist(), tasklist_index: tasklist_index()})
					open_menu(ev, menu_more_ref, {anchor: ev.currentTarget})
				}}
				code={0xEAD9}
			/>}
		/>)

		return (<Show when={is_any_task()}>
			<TextTooltip>
				<Headline/>
				<For each={tasklist().tasks}>{(task, index) =>
					<Show when={task_condition(task)}>
						<TaskItem
							command={command}
							task={task}
							labels={props.labels}
							task_index={index()}
							tasklist_index={tasklist_index()}
							on_edit_label={(ev, label) => props.on_edit_label(ev, label, task, tasklist_index(), index())}
							on_edit_files={ev => props.on_edit_files_task(ev, task, tasklist_index(), index())}
							on_edit_reminder={ev => props.on_edit_reminder_task(ev, task, tasklist_index(), index())}
							on_edit={ev => props.on_edit_task(ev, task, tasklist_index(), index())}
							on_context_menu={ev => props.on_context_menu_task(ev, task, tasklist_index(), index())}
							on_delete={ev => props.on_delete_task(ev, task, tasklist_index(), index())}
						/>
					</Show>
				}</For>
			</TextTooltip>
		</Show>)
	}

	return (<div
		class={CSS.body_group_task_list}
		data-empty={attr_set_if_exist(!is_not_empty())}>
		<AppbarTasks
			tasklist_index={-1}
			is_any_task={is_not_empty()}
			is_any_completed_task={false}
			si_any_uncompleted_task={false}
			command={command}
			is_group={true}
			settings={props.settings}
			page={page()}
			leading={<Icon code={get_icon()}/>}
			headline={string_totitlecase(page() as Pages)}
		/>
		<Show when={is_not_empty()} fallback={<EmptyTasks page={page()} />}>
			<For each={props.tasklists}>{(taskList, index) => <TaskListGroup
				tasklist_index={index()}
				tasklist={taskList}
			/>}</For>
		</Show>
		<Menu
			ref={r => menu_more_ref = r}
			on_toggle_open={isOpen => set_is_menu_more_open(isOpen)}>
			<MenuItem
				icon_code={0xE51B}
				onClick={(ev) => {
					command(Commands.copy_tasks, selected_tasklist_to_action.tasklist_index)
					close_menu(menu_more_ref)
					open_toast(ev, toast_copied_ref)
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
	tasklists: TaskList[]
	settings: Settings
	is_db_file_error: boolean
	labels: (TaskLabel | undefined)[]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	type SelectedTask = {
		task: Task
		tasklist_index: number
		task_index: number
	}
	type SelectedFile = {
		file: TaskFileMetaData
		tasklist_index: number
		task_index: number
		file_index: number
	}
	const empty_task = () => ({
		complete: false,
		description: '',
		files: [],
		id: -1,
		important: false,
		label_ids: [],
		list_id: -1,
		name: '',
		reminder: null,
		subtasks: []
	}) satisfies Task
	const empty_file = () => ({
		id: -1,
		list_id: -1,
		name: '',
		size: 0,
		task_id: -1,
		type: ''
	}) satisfies TaskFileMetaData
	const [is_menu_taskactionmove_open, set_is_menu_taskaction_move_open] = createSignal<boolean>(false)
	const [is_menu_taskactionaddlabel_open, set_is_menu_taskactionaddlabel_open] = createSignal<boolean>(false)
	const [is_datetimepicker_reminder_open, set_is_datetimepicker_reminder_open] = createSignal<boolean>(false)
	const [is_menu_labels_open, set_is_menu_labels_open] = createSignal<boolean>(false)
	const [is_menu_fileaction_open, set_is_menu_fileaction_open] = createSignal<boolean>(false)
	const [is_menu_fileaction3_open, set_is_menu_fileaction3_open] = createSignal<boolean>(false)
	const [text_file, set_text_file] = createSignal('')
	const [text_subtask, set_text_subtask] = createSignal('')
	const [file_url_or_content, set_file_url_or_content] = createSignal<string>('')

	// 'edit' = open from left click to task
	// 'action' = open from right click to task
	// 'chip' = open from left click to reminder chip below task name
	const [change_reminder_option, set_change_reminder_option] = createSignal<'edit' | 'action' | 'chip'>('edit')
	const [selected_label, set_selected_label] = createStore<TaskLabel>({id: -1, name: '', color: null})
	const [selected_task_to_edit, set_selected_task_to_edit] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_task_to_action, set_selected_task_to_action] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_task_to_delete, set_selected_task_to_delete] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_task_to_fileaction, set_selected_task_to_fileaction] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_task_to_changereminder, set_selected_task_to_changereminder] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_task_to_editlabel, set_selected_task_to_editlabel] = createStore<SelectedTask>({task: empty_task(), task_index: -1, tasklist_index: -1})
	const [selected_file_to_view, set_selected_file_to_view] = createStore<SelectedFile>({file: empty_file(), tasklist_index: -1, task_index: -1, file_index: -1})
	const [selected_file_to_rename, set_selected_file_to_rename] = createStore<SelectedFile>({file: empty_file(), tasklist_index: -1, task_index: -1, file_index: -1})
	const [selected_file_to_action, set_selected_file_to_action] = createStore<SelectedFile>({file: empty_file(), tasklist_index: -1, task_index: -1, file_index: -1})
	const [selected_file_to_action2, set_selected_file_to_action2] = createStore<SelectedFile>({file: empty_file(), tasklist_index: -1, task_index: -1, file_index: -1})
	const [selected_subtask_to_edit, set_selected_subtask_to_edit] = createStore<{subtask: SubTask, tasklist_index: number, task_index: number, subtask_index: number}>({subtask: {complete: false, id: -1, list_id: -1, name: '', task_id: -1}, tasklist_index: -1, task_index: -1, subtask_index: -1})
	const page = createMemo(() => props.page)
	const tasklists = createMemo(() => props.tasklists)
	const settings = createMemo(() => props.settings)
	const get_tasklist_index = createMemo<number | null>(() => {
		const taskLists = tasklists()
		for (let i = 0; i < array_length(taskLists); i++) {
			const taskList = taskLists[i]
			if (page() == Pages.tasks && taskList.id == DEFAULT_TASK_LIST.id) return i
			if (is_number(page()) && taskList.id == page()) return i
		}
		return null
	})

	// 'edit' = open from left click to task
	// 'action' = open from left click to file chip below task name
	let rename_file_option: 'edit' | 'action' = 'edit'
	let add_subtask_option: 'edit' | 'action' = 'edit'
	let textfield_newsubtask_ref: HTMLInputElement
	let textfield_editsubtask_ref: HTMLInputElement
	let textfield_renamefile_ref: HTMLInputElement
	let menu_taskaction_ref: HTMLDialogElement
	let menu_reminder_ref: HTMLDialogElement
	let menu_labels_ref: HTMLDialogElement
	let menu_labelaction_ref: HTMLDialogElement
	let menu_labelaction2_ref: HTMLDialogElement
	let menu_fileaction_ref: HTMLDialogElement
	let menu_fileaction2_ref: HTMLDialogElement
	let menu_fileaction3_ref: HTMLDialogElement
	let submenu_movetask_ref: HTMLDivElement
	let datetimepicker_reminder_ref: HTMLDialogElement
	let dialog_filerename_ref: HTMLDialogElement
	let dialog_edittask_ref: HTMLDialogElement
	let dialog_deletetaskwarning_ref: HTMLDialogElement
	let dialog_viewfile_ref: HTMLDialogElement
	let dialog_newsubtask_ref: HTMLDialogElement
	let dialog_editsubtask_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function delete_task(ev: Event, task: Task, tasklist_index: number, task_index: number): Promise<void> {
		if (!settings().is_show_deletetaskwarning) {
			close_dialog(dialog_deletetaskwarning_ref)
			close_dialog(dialog_edittask_ref)
			close_menu(menu_taskaction_ref)
			command(Commands.delete_task, task, tasklist_index, task_index)
			return
		}

		set_selected_task_to_delete({task, tasklist_index, task_index})
		open_dialog(ev, dialog_deletetaskwarning_ref, {important: true})
	}

	function edit_task(ev: Event, task: Task, tasklist_index: number, task_index: number): void {
		set_selected_task_to_edit({task, tasklist_index: tasklist_index, task_index: task_index})
		open_dialog(ev, dialog_edittask_ref)
	}

	async function view_file(ev: Event, file: TaskFileMetaData, tasklist_index: number, task_index: number, file_index: number): Promise<void> {
		set_selected_file_to_view({file, tasklist_index, task_index, file_index})
		const blob = (await command(
			Commands.get_file_blob,
			ev,
			file,
			tasklist_index,
			task_index,
			file_index
		) as (Blob | null))
		if (blob == null) return;

		set_file_url_or_content(string_starts_with(selected_file_to_view.file.type, 'text')
			? await file_read_as_text(blob)
			: url_create(blob)
		)
		open_dialog(ev, dialog_viewfile_ref)
	}

	function deleteSubtask(index: number): void {
		set_selected_task_to_edit(
			'task', 'subtasks',
			subtasks => array_concat(
				array_slice(subtasks, 0, index),
				array_slice(subtasks, index + 1)
			)
		)
		command(
			Commands.edit_task,
			selected_task_to_edit.task,
			selected_task_to_edit.tasklist_index,
			selected_task_to_edit.task_index
		)
	}

	function edit_subtask(
		ev: Event,
		subtask: SubTask,
		tasklist_index: number,
		task_index: number,
		subtask_index: number
	): void {
		set_selected_subtask_to_edit({subtask, tasklist_index, task_index, subtask_index})
		change_textfield_value(textfield_editsubtask_ref, subtask.name)
		set_text_subtask(subtask.name)
		open_dialog(ev, dialog_editsubtask_ref, {
			important: true,
			content_auto_focus: true
		})
	}

	function confirm_edit_subtask(): void {
		close_dialog(dialog_editsubtask_ref)
		command(
			Commands.edit_subtask,
			{...selected_subtask_to_edit.subtask, name: string_trim(text_subtask())} satisfies SubTask,
			selected_subtask_to_edit.tasklist_index,
			selected_subtask_to_edit.task_index,
			selected_subtask_to_edit.subtask_index
		)

		set_selected_task_to_edit(
			'task', 'subtasks',
			tasklists()[selected_subtask_to_edit.tasklist_index].tasks[selected_subtask_to_edit.task_index].subtasks
		)
	}

	async function confirm_add_subtask(): Promise<void> {
		const task = add_subtask_option == 'action'? selected_task_to_action.task : selected_task_to_edit.task
		const tasklist_index = add_subtask_option == 'action'? selected_task_to_action.tasklist_index : selected_task_to_edit.tasklist_index
		const task_index = add_subtask_option == 'action'? selected_task_to_action.task_index : selected_task_to_edit.task_index

		close_dialog(dialog_newsubtask_ref)
		const subtasks = (await command(
			Commands.add_subtask,
			{   complete: false,
				id: -1,
				list_id: task.list_id,
				name: string_trim(text_subtask()),
				task_id: task.id
			} satisfies SubTask,
			tasklist_index,
			task_index
		) as SubTask[])

		if (add_subtask_option == 'edit') set_selected_task_to_edit('task', 'subtasks', subtasks)
		else set_selected_task_to_action('task', 'subtasks', subtasks)
	}

	function confirm_file_rename(): void {
		close_dialog(dialog_filerename_ref)

		const s = selected_file_to_rename
		const file = s.file
		const task_index = s.task_index
		const tasklist_index = s.tasklist_index
		const new_file: TaskFileMetaData = {
			id: file.id,
			list_id: file.list_id,
			name: string_trim(text_file()) + '.' + string_replace(file.name, /^[^\.]+\./gs, ''),
			size: file.size,
			task_id: file.task_id,
			type: file.type
		}
		command(Commands.edit_file, new_file, tasklist_index, task_index, s.file_index)

		const files = props.tasklists[tasklist_index].tasks[task_index].files
		if (rename_file_option == 'edit') set_selected_task_to_edit('task', 'files', files)
		else if (rename_file_option == 'action') set_selected_task_to_fileaction('task', 'files', files)
	}

	function on_context_menu_task(ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement}, task: Task, tasklist_index: number, task_index: number): void {
		set_selected_task_to_action({task, tasklist_index: tasklist_index, task_index: task_index})
		open_menu(ev, menu_taskaction_ref, {position: MenuPosition.center_top_to_right})
	}

	function on_edit_task(ev: MouseEvent & {currentTarget: HTMLElement; target: DOMElement}, task: Task, tasklist_index: number, task_index: number): void {
		edit_task(ev, task, tasklist_index, task_index)
	}

	function on_edit_reminder_task(ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}, task: Task, tasklist_index: number, task_index: number): void {
		set_selected_task_to_changereminder({task, tasklist_index, task_index})
		open_menu(ev, menu_reminder_ref, {
			anchor: ev.currentTarget,
			position: MenuPosition.center_bottom_to_right
		})
	}

	function on_edit_files_task(ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}, task: Task, tasklist_index: number, task_index: number): void {
		set_selected_task_to_fileaction({task, tasklist_index, task_index})
		open_menu(ev, menu_fileaction2_ref, {
			anchor: ev.currentTarget,
			position: MenuPosition.center_bottom_to_right
		})
	}

	function on_edit_label(ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}, label: TaskLabel, task: Task, tasklist_index: number, task_index: number): void {
		set_selected_task_to_editlabel({task, tasklist_index, task_index})
		set_selected_label(label)
		open_menu(ev, menu_labelaction2_ref, {
			anchor: ev.currentTarget,
			position: MenuPosition.center_bottom_to_right
		})
	}

	function on_delete_task(ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}, task: Task, tasklist_index: number, task_index: number): void {
		delete_task(ev, task, tasklist_index, task_index)
	}

	const SubtaskItem: VoidComponent<{
		subtask: SubTask
		tasklist_index: number
		task_index: number
		subtask_index: number
	}> = ($props) => {
		const subtask = createMemo(() => $props.subtask)
		const subtask_index = createMemo(() => $props.subtask_index)
		const tasklist_index = createMemo(() => $props.tasklist_index)
		const task_index = createMemo(() => $props.task_index)

		return (<List
			trailing={<>
				<IconButton
					data-tooltip="Edit subtask"
					onClick={ev => edit_subtask(ev, subtask(), tasklist_index(), task_index(), subtask_index())}
					code={0xE739}
				/>
				<IconButton
					data-tooltip="Delete subtask"
					onClick={() => deleteSubtask(subtask_index())}
					code={0xE59D}
				/>
			</>}
			leading={<IconButton
				data-tooltip={`Mark as ${subtask().complete? 'un' : ''}completed`}
				onClick={() => {
					const $subtask: SubTask = {
						...subtask(),
						complete: !subtask().complete
					}
					command(
						Commands.edit_subtask,
						$subtask,
						$props.tasklist_index,
						$props.task_index,
						subtask_index()
					)
					set_selected_task_to_edit('task', 'subtasks', subtask_index(), $subtask)
				}}
				code={subtask().complete? 0xE3CB : 0xE3D4}/>}>
			{subtask().name}
		</List>)
	}

	const FileItem: VoidComponent<SelectedFile> = ($props) => {
		const file = createMemo(() => $props.file)
		const file_index = createMemo(() => $props.file_index)
		const task_index = createMemo(() => $props.task_index)
		const tasklist_index = createMemo(() => $props.tasklist_index)
		const is_type_not_supported = createMemo<boolean>(() => !regex_test(/^(audio|image|video|text)/, file().type))
		const get_size_text = createMemo(() => {
			const value = file().size
			const TERA = 1_000_000_000_000
			const GIGA = 1_000_000_000
			const MEGA = 1_000_000
			const KILO = 1_000
			let unit_value = value + ' B'

			if      (value >= TERA) unit_value = number_parse(number_tofixed(value / TERA, 2)) + ' TB'
			else if (value >= GIGA) unit_value = number_parse(number_tofixed(value / GIGA, 2)) + ' GB'
			else if (value >= MEGA) unit_value = number_parse(number_tofixed(value / MEGA, 2)) + ' MB'
			else if (value >= KILO) unit_value = number_parse(number_tofixed(value / KILO, 2)) + ' KB'
			return unit_value
		})

		return (<List
			classList={add_classlist_module(CSS.body_file_list_item)}
			trailing={<>
				<IconButton
					data-tooltip={"View file" + (is_type_not_supported()? ' (not supported)' : '')}
					disabled={is_type_not_supported()}
					onClick={ev => view_file(ev, file(), tasklist_index(), task_index(), file_index())}
					code={0xE77B}
				/>
				<IconButton
					data-tooltip="More actions"
					focused={selected_file_to_action.file.id == file().id && is_menu_fileaction_open()}
					onClick={ev => {
						set_selected_file_to_action($props)
						open_menu(ev, menu_fileaction_ref, {anchor: ev.currentTarget})
					}}
					code={0xEAD9}
				/>
			</>}
			subtitle={array_join([get_size_text(), string_replace(file().type, /\/.+$/gs, '')], " • ")}>
			{file().name}
		</List>)
	}

	const LabelItem: VoidComponent<TaskLabel> = ($props) => {
		const color = createMemo(() => $props.color)
		const id = createMemo(() => $props.id)
		const name = createMemo(() => $props.name)

		return (<List
			leading={<Icon style={{color: color() ?? undefined}} code={0xE407}/>}
			trailing={<TextTooltip>
				<IconButton
					data-tooltip="Edit label"
					onClick={ev => {
						set_selected_label($props)
						command(Commands.edit_label, ev, selected_label)
					}}
					code={0xE739}
				/>
				<IconButton
					data-tooltip="Remove label from task"
					onClick={() => {
						const index = array_find_index(
							selected_task_to_edit.task.label_ids,
							$id => $id == id()
						)
						if (index < 0) return;

						set_selected_task_to_edit(
							'task', 'label_ids',
							ids => array_concat(
								array_slice(ids, 0, index),
								array_slice(ids, index + 1)
							)
						)
						command(
							Commands.edit_task,
							selected_task_to_edit.task,
							selected_task_to_edit.tasklist_index,
							selected_task_to_edit.task_index
						)
					}}
					code={0xE5E9}
				/>
			</TextTooltip>}>
			{ name() }
		</List>)
	}

	const Dialogs: VoidComponent = () => (<>
		<Dialog
			ref={r => dialog_edittask_ref = r}
			header='Edit task'
			style={{width: '500px'}}
			classList={add_classlist_module(CSS.body_dialog_edit)}
			actions={<>
				<Button
					variant={ButtonVariant.tonal}
					onClick={() => close_dialog(dialog_edittask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant.filled}
					onClick={() => {
						command(
							Commands.edit_task,
							{...selected_task_to_edit.task, complete: !selected_task_to_edit.task.complete} satisfies Task,
							selected_task_to_edit.tasklist_index,
							selected_task_to_edit.task_index
						)

						set_selected_task_to_edit('task', props.tasklists[selected_task_to_edit.tasklist_index].tasks[selected_task_to_edit.task_index])
					}}>
					Mark as {selected_task_to_edit.task.complete? "not" : ''} completed
				</Button>
			</>}>
			<TextField
				label="Task"
				value={selected_task_to_edit.task.name}
				onBlur={ev => {
					if (ev.currentTarget.value == selected_task_to_edit.task.name) return;

					set_selected_task_to_edit('task', 'name', ev.currentTarget.value)
					command(
						Commands.edit_task,
						selected_task_to_edit.task,
						selected_task_to_edit.tasklist_index,
						selected_task_to_edit.task_index
					)
				}}
			/>
			<AreaTextField
				label="Description"
				max_line={3}
				value={selected_task_to_edit.task.description}
				onBlur={ev => {
					const value = ev.currentTarget.value
					if (value == selected_task_to_edit.task.description) return;
					set_selected_task_to_edit('task', 'description', value)
					command(
						Commands.edit_task,
						selected_task_to_edit.task,
						selected_task_to_edit.tasklist_index,
						selected_task_to_edit.task_index
					)
				}}
			/>
			<div data-subtasks>
				<TextTooltip>
					<For each={selected_task_to_edit.task.subtasks}>{ (subtask, index) => <SubtaskItem
						subtask={subtask}
						tasklist_index={selected_task_to_edit.tasklist_index}
						task_index={selected_task_to_edit.task_index}
						subtask_index={index()}
					/>}</For>
				</TextTooltip>
				<Button
					onClick={ev => {
						add_subtask_option = 'edit'
						open_dialog(ev, dialog_newsubtask_ref, {
							important: true,
							content_auto_focus: true
						})}
					}>
					<Icon code={0xE009}/>Add subtask
				</Button>
			</div>
			<Divider />
			<div data-label>
				<For each={selected_task_to_edit.task.label_ids}>{label_id =>
					<Show when={props.labels[label_id] != undefined}>
						<LabelItem {...props.labels[label_id]!} />
					</Show>
				}</For>
				<Button
					focused={is_menu_labels_open()}
					onClick={ev => open_menu(ev, menu_labels_ref, {
						anchor: ev.currentTarget,
						position: MenuPosition.center_bottom_to_right
					})}>
					<Icon code={0xF00D}/>Add label
				</Button>
			</div>
			<Divider />
			<div data-reminder>
				<Show
					when={selected_task_to_edit.task.reminder != null}
					fallback={<Button
						focused={is_datetimepicker_reminder_open()}
						onClick={ev => {
							set_change_reminder_option('edit')
							open_datetimepicker(ev, datetimepicker_reminder_ref, {
								anchor: ev.currentTarget,
								position: DateTimePickerPosition.center_bottom_to_right
							})
						}}>
						<Icon code={0xE01D}/>Add reminder
					</Button>}>
					<List
						trailing={<TextTooltip>
							<IconButton
								data-tooltip="Change datetime reminder"
								onClick={ev => {
									set_change_reminder_option('edit')
									open_datetimepicker(ev, datetimepicker_reminder_ref, {
										anchor: ev.currentTarget,
										position: DateTimePickerPosition.center_bottom_to_right
									})
								}}
								code={0xE2EA}
							/>
							<IconButton
								data-tooltip="Remove reminder"
								onClick={(_ev) => {
									set_selected_task_to_edit('task', 'reminder', null)
									command(
										Commands.edit_task,
										selected_task_to_edit.task,
										selected_task_to_edit.tasklist_index,
										selected_task_to_edit.task_index
									)
								}}
								code={0xE01F}
							/>
						</TextTooltip>}
						leading={<Icon code={0xE025}/>}>
						<span style={{
							color: date_out_range_YMD_HM(
								selected_task_to_edit.task.reminder!,
								get_current_date(),
								new Date(date_year() + 100, 2, 2)
							)? 'rgb(var(--g-color-error))' : undefined
						}}>{date_text_YMD_HM(selected_task_to_edit.task.reminder!)}</span>
					</List>
				</Show>
			</div>
			<Divider />
			<Show when={!props.is_db_file_error}>
				<div data-file>
					<TextTooltip>
						<For each={selected_task_to_edit.task.files}>{(file, index) =>
							<FileItem
								file={file}
								file_index={index()}
								task_index={selected_task_to_edit.task_index}
								tasklist_index={selected_task_to_edit.tasklist_index}
							/>
						}</For>
					</TextTooltip>
					<Button
						onClick={() => {
							const task_index = selected_task_to_edit.task_index
							const tasklist_index = selected_task_to_edit.tasklist_index
							const task = selected_task_to_edit.task
							promise_done(file_open(null, true), async (files) => {
								if (files == null) return;
								const result = (await command(
									Commands.add_files,
									files,
									task,
									tasklist_index,
									task_index
								) as TaskFileMetaData[])
								set_selected_task_to_edit('task', 'files', result)
							})
						}}>
						<Icon code={0xE187}/>Add file
					</Button>
				</div>
				<Divider />
			</Show>
			<div data-important>
				<Button
					onClick={() => {
						set_selected_task_to_edit('task', 'important', t => !t)
						command(
							Commands.edit_task,
							selected_task_to_edit.task,
							selected_task_to_edit.tasklist_index,
							selected_task_to_edit.task_index
						)
					}}>
					<Icon filled={selected_task_to_edit.task.important} code={0xEF1B}/>
					Mark as {selected_task_to_edit.task.important? 'not' : ''} important
				</Button>
			</div>
			<div data-delete>
				<Button
					onClick={ev => delete_task(
						ev,
						selected_task_to_edit.task,
						selected_task_to_edit.tasklist_index,
						selected_task_to_edit.task_index
					)}
					style={{color: `rgb(${AppColors.error})`}}>
					<Icon code={0xE59D}/>
					Delete task
				</Button>
			</div>
		</Dialog>
		<Dialog
			header="Delete task"
			style={{width: '560px'}}
			ref={r => dialog_deletetaskwarning_ref = r}
			actions={<>
				<Button
					onClick={() => close_dialog(dialog_deletetaskwarning_ref)}
					variant={ButtonVariant.tonal}>
					Cancel
				</Button>
				<Button
					onClick={async () => {
						close_dialog(dialog_deletetaskwarning_ref)
						close_dialog(dialog_edittask_ref)
						close_menu(menu_taskaction_ref)
						command(
							Commands.delete_task,
							selected_task_to_delete.task,
							selected_task_to_delete.tasklist_index,
							selected_task_to_delete.task_index
						)
					}}
					variant={ButtonVariant.filled}>
					Delete
				</Button>
			</>}>
			Are you sure want to delete <q><span style={{color: `rgb(${AppColors.accent})`, "font-weight": 'bold'}}>{(selected_task_to_delete.task.name) || ''}</span></q> task?
			<CheckBox
				attr_label={{style: "margin-top: 16px"}}
				onChange={ev => command(Commands.toggle_delete_task_warning, !ev.currentTarget.checked)}>
				Don't remind me again
			</CheckBox>
		</Dialog>
		<Dialog
			ref={r => dialog_filerename_ref = r}
			style={{width: '500px'}}
			header="Rename file"
			actions={<>
				<Button
					variant={ButtonVariant.tonal}
					onClick={() => close_dialog(dialog_filerename_ref)}>
					Cancel
				</Button>
				<Button
					variant={ButtonVariant.filled}
					disabled={string_trim(text_file()) == ''}
					onClick={() => confirm_file_rename()}>
					Rename
				</Button>
			</>}>
			<form onSubmit={ev => {
				event_prevent_default(ev)
				if (string_trim(text_file()) == '') return;

				confirm_file_rename()
			}}>
				<TextField
					ref={r => textfield_renamefile_ref = r}
					autofocus
					onInput={ev => set_text_file(ev.currentTarget.value)}
					placeholder="File name"
				/>
			</form>
		</Dialog>
		<Dialog
			style={{width: '720px'}}
			ref={r => dialog_viewfile_ref = r}
			onClose={() => {
				if (!string_starts_with(selected_file_to_view.file.type, 'text')) url_revoke(file_url_or_content())
				set_file_url_or_content('')
			}}
			header={selected_file_to_view.file.name}
			actions={<>
				<Button
					onClick={() => close_dialog(dialog_viewfile_ref)}
					variant={ButtonVariant.tonal}>
					Close
				</Button>
				<Button
					variant={ButtonVariant.filled}
					onClick={(ev) => command(
						Commands.download_file,
						ev,
						selected_file_to_view.file,
						selected_file_to_view.tasklist_index,
						selected_file_to_view.task_index,
						selected_file_to_view.file_index
					)}>
					Donwload
				</Button>
			</>}>
			<Show when={file_url_or_content() != ''}>
				<Switch>
					<Match when={string_starts_with(selected_file_to_view.file.type, 'image')}>
						<img src={file_url_or_content()} width={'100%'}/>
					</Match>
					<Match when={string_starts_with(selected_file_to_view.file.type, 'video')}>
						<video src={file_url_or_content()} autoplay controls width={'100%'}></video>
					</Match>
					<Match when={string_starts_with(selected_file_to_view.file.type, 'audio')}>
						<audio src={file_url_or_content()} autoplay controls style={{width: '100%'}}></audio>
					</Match>
					<Match when={string_starts_with(selected_file_to_view.file.type, 'text')}>
						<pre><code style="white-space:normal">{file_url_or_content()}</code></pre>
					</Match>
				</Switch>
			</Show>
		</Dialog>
		<Dialog
			ref={r => dialog_newsubtask_ref = r}
			style={{width: '500px'}}
			header="New subtask"
			onClose={() => {
				set_text_subtask('')
				change_textfield_value(textfield_newsubtask_ref, '')
			}}
			actions={<>
				<Button
					variant={ButtonVariant.tonal}
					onClick={() => close_dialog(dialog_newsubtask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant.filled}
					disabled={string_trim(text_subtask()) == ''}
					onClick={() => confirm_add_subtask()}>
					Add
				</Button>
			</>}>
			<form onSubmit={ev => {
				event_prevent_default(ev)
				if (string_trim(text_subtask()) == '') return;

				confirm_add_subtask()
			}}>
				<TextField
					ref={r => textfield_newsubtask_ref = r}
					placeholder="Subtask name"
					onFocus={ev => set_text_subtask(ev.currentTarget.value)}
					onInput={ev => set_text_subtask(ev.currentTarget.value)}
				/>
			</form>
		</Dialog>
		<Dialog
			ref={r => dialog_editsubtask_ref = r}
			style={{width: '500px'}}
			header="Edit subtask"
			onClose={() => {
				set_text_subtask('')
				change_textfield_value(textfield_editsubtask_ref, '')
			}}
			actions={<>
				<Button
					variant={ButtonVariant.tonal}
					onClick={() => close_dialog(dialog_editsubtask_ref)}>
					Close
				</Button>
				<Button
					variant={ButtonVariant.filled}
					disabled={string_trim(text_subtask()) == ''}
					onClick={() => confirm_edit_subtask()}>
					Edit
				</Button>
			</>}>
			<form style="display:contents" onSubmit={ev => {
				event_prevent_default(ev)
				if (string_trim(text_subtask()) == '') return;
				confirm_edit_subtask()
			}}>
				<TextField
					ref={r => textfield_editsubtask_ref = r}
					placeholder="Subtask name"
					onFocus={ev => set_text_subtask(ev.currentTarget.value)}
					onInput={ev => set_text_subtask(ev.currentTarget.value)}
				/>
			</form>
		</Dialog>
	</>)

	const Menus: VoidComponent = () => (<>
		<Menu ref={r => menu_taskaction_ref = r}>
			<MenuItem
				icon_code={selected_task_to_action.task.complete? 0xE3D4 : 0xE3CC}
				onClick={() => {
					close_menu(menu_taskaction_ref)
					command(
						Commands.edit_task,
						{   ...selected_task_to_action.task,
							complete: !selected_task_to_action.task.complete
						} satisfies Task,
						selected_task_to_action.tasklist_index,
						selected_task_to_action.task_index
					)
				}}
				trailing={<MenuIndent />}>
				Mark as {selected_task_to_action.task.complete? 'not' : ''} completed
			</MenuItem>
			<MenuItem
				leading={<Icon code={0xEF1B} filled={!((selected_task_to_action.task.important) || false)}/>}
				onClick={() => {
					close_menu(menu_taskaction_ref)
					command(
						Commands.edit_task,
						{   ...selected_task_to_action.task,
							important: !selected_task_to_action.task.important
						} satisfies Task,
						selected_task_to_action.tasklist_index,
						selected_task_to_action.task_index
					)
				}}
				trailing={<MenuIndent />}>
				Mark as {selected_task_to_action.task.important? 'not' : ''} important
			</MenuItem>
			<MenuDivider />
			<Show when={!props.is_db_file_error}>
				<MenuItem
					icon_code={0xE187}
					trailing={<MenuIndent />}
					onClick={() => {
						close_menu(menu_taskaction_ref)

						const task_index = selected_task_to_action.task_index
						const tasklist_index = selected_task_to_action.tasklist_index
						const task = selected_task_to_action.task
						promise_done(file_open(null, true), async (files) => {
							if (files == null) return;
							const result = await command(
								Commands.add_files,
								files,
								task,
								tasklist_index,
								task_index
							) as TaskFileMetaData[]
							set_selected_task_to_action('task', 'files', result)
						})
					}}>
					Add file
				</MenuItem>
			</Show>
			<MenuItem
				icon_code={0xE009}
				trailing={<MenuIndent />}
				onClick={ev => {
					close_menu(menu_taskaction_ref)
					add_subtask_option = 'action'
					open_dialog(ev, dialog_newsubtask_ref, {
						important: true,
						content_auto_focus: true
					})
				}}>
				Add subtask
			</MenuItem>
			<Show when={selected_task_to_action.task.reminder == null}>
				<MenuItem
					onClick={ev => {
						close_menu(menu_taskaction_ref)
						set_change_reminder_option('action')
						open_datetimepicker(ev, datetimepicker_reminder_ref)
					}}
					icon_code={0xE01B}
					trailing={<MenuIndent />}>
					Add reminder
				</MenuItem>
			</Show>
			<Show when={array_length(props.labels) > 0}>
				<SubMenu
					on_toggle_open={v => set_is_menu_taskactionaddlabel_open(v)}
					item={<SubMenuItem
						focused={is_menu_taskactionaddlabel_open()}
						icon_code={0xF00D}>
						Add label
					</SubMenuItem>}>
					<For each={props.labels}>{label => <Show when={label != undefined}>
						<MenuItem
							leading={<Icon style={{color: label!.color ?? undefined}} code={0xE407}/>}
							checked={array_includes(selected_task_to_action.task.label_ids, label!.id)}
							onClick={() => {
								const index = array_find_index(selected_task_to_action.task.label_ids, id => id == label!.id)
								set_selected_task_to_action('task', 'label_ids', ids => index >= 0
									? array_concat(
										array_slice(ids, 0, index),
										array_slice(ids, index + 1)
									)
									: [...ids, label!.id]
								)
								command(
									Commands.edit_task,
									selected_task_to_action.task,
									selected_task_to_action.tasklist_index,
									selected_task_to_action.task_index
								)
							}}>
							{label!.name}
						</MenuItem>
					</Show>}</For>
				</SubMenu>
			</Show>
			<MenuDivider />
			<SubMenu
				ref={r => submenu_movetask_ref = r}
				style={{"min-width": '200px'}}
				on_toggle_open={v => set_is_menu_taskaction_move_open(v)}
				item={<SubMenuItem
					focused={is_menu_taskactionmove_open()}
					icon_code={0xE115}>
					Move task to ...
				</SubMenuItem>}>
				<For each={props.tasklists}>{(list, i) => <>
					<MenuItem
						onClick={() => {
							command(
								Commands.move_task,
								selected_task_to_action.task,
								selected_task_to_action.tasklist_index,
								selected_task_to_action.task_index,
								i()
							)
							close_submenu(submenu_movetask_ref)
							close_menu(menu_taskaction_ref)
						}}
						style={{order: list.id == DEFAULT_TASK_LIST.id? '-2' : undefined}}
						icon_code={list.id == DEFAULT_TASK_LIST.id
							? 0xE8E2
							: list.emoji == null
								? 0xF032
								: undefined
						}
						leading={<Show
							when={list.emoji != null && list.id != DEFAULT_TASK_LIST.id}>
							<Emoji emoji={list.emoji!} />
						</Show>}
						selected={i() == get_tasklist_index()}>
						{list.name}
					</MenuItem>
					<Show when={array_length(props.tasklists) > 1 && list.id == DEFAULT_TASK_LIST.id}>
						<MenuDivider style={{order: '-1'}}/>
					</Show>
				</>}</For>
			</SubMenu>
			<MenuDivider />
			<MenuItem
				onClick={ev => {
					close_menu(menu_taskaction_ref)
					edit_task(
						ev,
						selected_task_to_action.task,
						selected_task_to_action.tasklist_index,
						selected_task_to_action.task_index
					)
				}}
				icon_code={0xE739}
				trailing={<MenuIndent />}>
				Edit task
			</MenuItem>
			<MenuItem
				icon_code={0xE59D}
				trailing={<MenuIndent />}
				onClick={ev => delete_task(
					ev,
					selected_task_to_action.task,
					selected_task_to_action.tasklist_index,
					selected_task_to_action.task_index)
				}>
				Delete task
			</MenuItem>
		</Menu>
		<Menu ref={r => menu_reminder_ref = r}>
			<MenuItem
				icon_code={0xE2EA}
				onClick={ev => {
					close_menu(menu_reminder_ref)
					set_change_reminder_option('chip')
					open_datetimepicker(ev, datetimepicker_reminder_ref)
				}}>
				Change datetime reminder
			</MenuItem>
			<MenuItem
				icon_code={0xE01F}
				onClick={() => {
					close_menu(menu_reminder_ref)
					set_selected_task_to_changereminder('task', 'reminder', null)
					command(
						Commands.edit_task,
						selected_task_to_changereminder.task,
						selected_task_to_changereminder.tasklist_index,
						selected_task_to_changereminder.task_index
					)
				}}>Remove reminder
			</MenuItem>
		</Menu>
		<Menu
			ref={r => menu_labels_ref = r}
			on_toggle_open={isOpen => set_is_menu_labels_open(isOpen)}>
			<MenuItem
				icon_code={0xE007}
				onClick={ev => command(Commands.add_label, ev)}>
				New label
			</MenuItem>
			<Show when={array_length(props.labels) > 0}>
				<MenuItem
					icon_code={0xE739}
					onClick={ev => {
						close_dialog(dialog_edittask_ref)
						close_menu(menu_labels_ref)
						command(Commands.show_labels_options, ev)
					}}>
					Edit labels
				</MenuItem>
				<Divider/>
			</Show>
			<For each={props.labels}>{label => <Show when={label != undefined}>
				<MenuItem
					leading={<Icon style={{color: label!.color ?? undefined}} code={0xE407}/>}
					checked={array_includes(selected_task_to_edit.task.label_ids, label!.id)}
					onContextMenu={ev => {
						set_selected_label(label!)
						event_prevent_default(ev)
						open_menu(ev, menu_labelaction_ref, {position: MenuPosition.center_bottom_to_right})
					}}
					onClick={() => {
						const index = array_find_index(selected_task_to_edit.task.label_ids, id => id == label!.id)
						set_selected_task_to_edit(
							'task', 'label_ids',
							ids => index < 0
								? [...ids, label!.id]
								: array_concat(
									array_slice(ids, 0, index),
									array_slice(ids, index + 1)
								)
						)
						command(
							Commands.edit_task,
							selected_task_to_edit.task,
							selected_task_to_edit.tasklist_index,
							selected_task_to_edit.task_index
						)
					}}>
					{label!.name}
				</MenuItem>
			</Show>}</For>
		</Menu>
		<Menu ref={r => menu_labelaction_ref = r}>
			<MenuItem
				icon_code={0xE739}
				onClick={ev => {
					close_menu(menu_labelaction_ref)
					command(Commands.edit_label, ev, selected_label)
				}}>
				Edit label
			</MenuItem>
			<MenuItem
				icon_code={0xE59D}
				onClick={() => {
					close_menu(menu_labelaction_ref)
					command(Commands.delete_label, selected_label)
				}}>
				Delete label
			</MenuItem>
		</Menu>
		<Menu ref={r => menu_labelaction2_ref = r}>
			<MenuItem
				icon_code={0xE739}
				onClick={ev => {
					close_menu(menu_labelaction2_ref)
					command(Commands.edit_label, ev, selected_label)
				}}>
				Edit label
			</MenuItem>
			<MenuItem
				icon_code={0xE5E9}
				onClick={() => {
					close_menu(menu_labelaction2_ref)
					const index = array_find_index(selected_task_to_editlabel.task.label_ids, v => v == selected_label.id)
					if (index < 0) return;

					set_selected_task_to_editlabel(
						'task', 'label_ids',
						ids => array_concat(
							array_slice(ids, 0, index),
							array_slice(ids, index + 1)
						)
					)
					command(
						Commands.edit_task,
						selected_task_to_editlabel.task,
						selected_task_to_editlabel.tasklist_index,
						selected_task_to_editlabel.task_index,
					)
				}}>
				Remove label from task
			</MenuItem>
		</Menu>
		<Menu
			ref={r => menu_fileaction_ref = r}
			on_toggle_open={isOpen => set_is_menu_fileaction_open(isOpen)}>
			<MenuItem
				icon_code={0xE0B9}
				onClick={(ev) => {
					close_menu(menu_fileaction_ref)
					command(
						Commands.download_file,
						ev,
						selected_file_to_action.file,
						selected_file_to_action.tasklist_index,
						selected_file_to_action.task_index,
						selected_file_to_action.file_index
					)
				}}>
				Download
			</MenuItem>
			<MenuItem
				icon_code={0xE739}
				onClick={ev => {
					close_menu(menu_fileaction_ref)
					const text = string_replace(selected_file_to_action.file.name, /\.[^\.]*$/, '')
					change_textfield_value(textfield_renamefile_ref, text)
					set_text_file(text)
					set_selected_file_to_rename({...selected_file_to_action})
					rename_file_option = 'edit'
					open_dialog(ev, dialog_filerename_ref, {
						content_auto_focus: true,
						important: true
					})
				}}>
				Rename
			</MenuItem>
			<MenuItem
				icon_code={0xE59D}
				onClick={() => {
					close_menu(menu_fileaction_ref)
					set_selected_task_to_edit('task', 'files', files => [
						...array_slice(files, 0, selected_file_to_action.file_index),
						...array_slice(files, selected_file_to_action.file_index + 1)
					])
					command(
						Commands.edit_task,
						selected_task_to_edit.task,
						selected_task_to_edit.tasklist_index,
						selected_task_to_edit.task_index
					)
				}}>
				Delete
			</MenuItem>
		</Menu>
		<Menu style={{'min-width': '164px'}} ref={r => menu_fileaction2_ref = r}>
			<For each={selected_task_to_fileaction.task.files}>{(file, index) =>
				<MenuItem
					focused={is_menu_fileaction3_open() && file.id == selected_file_to_action2.file.id}
					onClick={ev => {
						set_selected_file_to_action2({
							file,
							file_index: index(),
							task_index: selected_task_to_fileaction.task_index,
							tasklist_index: selected_task_to_fileaction.tasklist_index
						})
						open_menu(ev, menu_fileaction3_ref, {
							anchor: ev.currentTarget,
							position: MenuPosition.right_center_to_bottom
						})
					}}>
					{file.name}
				</MenuItem>
			}</For>
		</Menu>
		<Menu style={{'min-width': '164px'}} ref={r => menu_fileaction3_ref = r} on_toggle_open={(isOpen) => set_is_menu_fileaction3_open(isOpen)}>
			<Show when={regex_test(/^(audio|image|video|text)/, selected_file_to_action2.file.type)}>
				<MenuItem
					icon_code={0xE77B}
					onClick={ev => {
						close_menu(menu_fileaction3_ref)
						view_file(
							ev,
							selected_file_to_action2.file,
							selected_file_to_action2.tasklist_index,
							selected_file_to_action2.task_index,
							selected_file_to_action2.file_index
						)
					}}>
					View
				</MenuItem>
			</Show>
			<MenuItem
				icon_code={0xE739}
				onClick={ev => {
					close_menu(menu_fileaction3_ref)
					const text = string_replace(selected_file_to_action2.file.name, /\.[^\.]*$/, '')
					change_textfield_value(textfield_renamefile_ref, text)
					set_text_file(text)
					set_selected_file_to_rename({...selected_file_to_action2})
					rename_file_option = 'action'
					open_dialog(ev, dialog_filerename_ref, {
						content_auto_focus: true,
						important: true
					})
				}}>
				Rename
			</MenuItem>
			<MenuItem
				icon_code={0xE0B9}
				onClick={(ev) => {
					close_menu(menu_fileaction3_ref)
					command(
						Commands.download_file,
						ev,
						selected_file_to_action2.file,
						selected_file_to_action2.tasklist_index,
						selected_file_to_action2.task_index,
						selected_file_to_action2.file_index
					)
				}}>
				Download
			</MenuItem>
			<MenuItem
				icon_code={0xE59D}
				onClick={() => {
					close_menu(menu_fileaction3_ref)
					if (array_length(selected_task_to_fileaction.task.files) == 1) close_menu(menu_fileaction2_ref)

					set_selected_task_to_fileaction('task', 'files', files => [
						...array_slice(files, 0, selected_file_to_action2.file_index),
						...array_slice(files, selected_file_to_action2.file_index + 1)
					])
					command(
						Commands.edit_task,
						selected_task_to_fileaction.task,
						selected_task_to_fileaction.tasklist_index,
						selected_task_to_fileaction.task_index
					)
				}}>
				Delete
			</MenuItem>
		</Menu>
	</>)

	const DatePickers: VoidComponent = () => (<>
		<DateTimePicker
			on_toggle_open={(v) => set_is_datetimepicker_reminder_open(v)}
			datetime={(change_reminder_option() == 'edit'
				? selected_task_to_edit.task.reminder
				: change_reminder_option() == 'action'
					? selected_task_to_action.task.reminder
					: change_reminder_option() == 'chip'
						? selected_task_to_changereminder.task.reminder
						: new Date()
			) ?? new Date()}
			ref={r => datetimepicker_reminder_ref = r}
			on_select_datetime={(date) => {
				let task: Task = empty_task()
				let tasklist_index = 0
				let task_index = 0
				if (change_reminder_option() == 'edit') {
					set_selected_task_to_edit('task', 'reminder', date)
					tasklist_index = selected_task_to_edit.tasklist_index
					task_index = selected_task_to_edit.task_index
					task = selected_task_to_edit.task
				}
				else if (change_reminder_option() == 'action') {
					set_selected_task_to_action('task', 'reminder', date)
					tasklist_index = selected_task_to_action.tasklist_index
					task_index = selected_task_to_action.task_index
					task = selected_task_to_action.task
				}
				else if (change_reminder_option() == 'chip') {
					set_selected_task_to_changereminder('task', 'reminder', date)
					tasklist_index = selected_task_to_changereminder.tasklist_index
					task_index = selected_task_to_changereminder.task_index
					task = selected_task_to_changereminder.task
				}

				command(Commands.edit_task, task, tasklist_index, task_index)
			}}
		/>
	</>)

	return (<div class={CSS.body}>
		<Show
			when={get_tasklist_index() == null}
			fallback={<SingleTaskList
				lists={props.tasklists}
				command={command}
				settings={settings()}
				page={page()}
				labels={props.labels}
				tasklist={props.tasklists[get_tasklist_index()!]}
				tasklist_index={get_tasklist_index()!}
				on_delete_task={(ev, task, task_index) => on_delete_task(ev, task, get_tasklist_index()!, task_index)}
				on_edit_label={(ev, label, task, task_index) => on_edit_label(ev, label, task, get_tasklist_index()!, task_index)}
				on_edit_files_task={(ev, task, task_index) => on_edit_files_task(ev, task, get_tasklist_index()!, task_index)}
				on_edit_reminder_task={(ev, task, task_index) => on_edit_reminder_task(ev, task, get_tasklist_index()!, task_index)}
				on_context_menu_task={(ev, task, task_index) => on_context_menu_task(ev, task, get_tasklist_index()!, task_index)}
				on_edit_task={(ev, task, task_index) => on_edit_task(ev, task, get_tasklist_index()!, task_index)}
			/>}>
			<GroupTaskList
				command={command}
				settings={settings()}
				page={page()}
				tasklists={props.tasklists}
				labels={props.labels}
				on_delete_task={on_delete_task}
				on_edit_label={on_edit_label}
				on_edit_files_task={on_edit_files_task}
				on_edit_reminder_task={on_edit_reminder_task}
				on_context_menu_task={on_context_menu_task}
				on_edit_task={on_edit_task}
			/>
		</Show>
		<Dialogs/>
		<Menus/>
		<DatePickers/>
	</div>)
}

export default _