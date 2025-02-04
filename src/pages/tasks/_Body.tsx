import type { DOMElement } from "solid-js/jsx-runtime"
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, Show, Switch, type JSX, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { TaskLabel, Settings, Task, TaskList, SubTask, TaskFileMetaData } from "./_types"
import { Commands, Pages, SortBy, SortMode } from "./_enums"
import { get_current_date, date_year, date_text_YMD_HM, date_out_range_YMD_HM } from "@/utils/datetime"
import { event_current_target, event_prevent_default, event_stop_propagation, event_target } from "@/utils/event"
import { DEFAULT_TASK_LIST } from "./_constants"
import { attr_set_if_exist, classlist_module } from "@/utils/attributes"
import { string_replace, string_split, string_starts_with, string_totitlecase, string_trim } from "@/utils/string"
import { element_by_selector, element_click, element_closest, element_dataset, element_focus, element_id, element_next_sibling, element_previous_sibling, element_tagname, element_valid_target } from "@/utils/element"
import { is_number } from "@/utils/typecheck"
import { file_open, file_read_as_text } from "@/utils/file"
import { url_create, url_revoke } from "@/utils/url"
import { array_concat, array_find_index, array_includes, array_join, array_length, array_slice, array_some } from "@/utils/array"
import { regex_test } from "@/utils/regex"
import { number_is_not_defined, number_parse, number_tofixed } from "@/utils/number"
import { timeout_set } from "@/utils/timeout"
import { promise_done } from "@/utils/object"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from "@/constants/key_code"
import { AppColors } from "@/enums/colors"
import { document_active } from "@/utils/document"
import { ICON_ADD, ICON_ADD_CIRCLE, ICON_ADD_SQUARE, ICON_ALERT, ICON_ALERT_BADGE, ICON_ALERT_OFF, ICON_ALERT_URGENT, ICON_APPS_LIST_DETAIL, ICON_ARROW_DOWNLOAD, ICON_ARROW_RIGHT, ICON_ARROW_SORT, ICON_ATTACH, ICON_CALENDAR, ICON_CALENDAR_EDIT, ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_CIRCLE, ICON_COPY, ICON_DELETE, ICON_DELETE_DISMISS, ICON_DELETE_LINES, ICON_DISMISS, ICON_EDIT, ICON_EYE, ICON_HOME, ICON_MORE_VERTICAL, ICON_STAR, ICON_TAG, ICON_TASK_LIST_SQUARE_LTR, ICON_TEXT_CASE_TITLE, ICON_TEXT_EDIT_STYLE, ICON_TEXT_SORT_ASCENDING, ICON_TEXT_SORT_DESCENDING } from "@/constants/icons"

import Divider from "@/components/Divider"
import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Emoji from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import List from "@/components/List"
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
			[SortBy.name, 'Name', ICON_TEXT_CASE_TITLE],
			[SortBy.importance, 'Importance', ICON_STAR],
			[SortBy.creation_date, 'Creation date', ICON_CALENDAR],
			[SortBy.completed, 'Completed', ICON_CHECKBOX_CHECKED],
			[SortBy.uncompleted, 'Uncompleted', ICON_CHECKBOX_UNCHECKED],
		]
		const sort_mode: [mode: SortMode, name: string, icon_code: number][] = [
			[SortMode.ascending, 'Ascending', ICON_TEXT_SORT_ASCENDING],
			[SortMode.descending, 'Descending', ICON_TEXT_SORT_DESCENDING],
		]
		const button_markallcompleted_id = createUniqueId()
		const button_markalluncompleted_id = createUniqueId()
		const button_cleartasks_id = createUniqueId()
		const button_deletecompletedtasks_id = createUniqueId()
		const button_renamelist_id = createUniqueId()
		const button_deletelist_id = createUniqueId()
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_sort_ref = r}
				c_on_toggleopen={(v) => set_is_menu_sort_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_sortby = element_dataset(button, 'sortby')
					if (data_sortby) {
						return change_sort_by(data_sortby as SortBy)
					}

					const data_sortmode = element_dataset(button, 'sortmode')
					if (data_sortmode) {
						return change_sort_mode(data_sortmode as SortMode)
					}
				}}>
				<MenuHeader>Sort by</MenuHeader>
				<For each={sort_by}>{by =>
					<MenuItem
						c_selected={settings().sort_by == by[0]}
						data-sortby={by[0]}
						c_icon_code={by[2]}>
						{by[1]}
					</MenuItem>
				}</For>
				<MenuDivider/>
				<For each={sort_mode}>{mode =>
					<MenuItem
						data-sortmode={mode[0]}
						c_selected={settings().sort_mode == mode[0]}
						c_icon_code={mode[2]}>
						{mode[1]}
					</MenuItem>
				}</For>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				ref={r => menu_more_ref = r}
				c_on_toggleopen={(v) => set_is_menu_more_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_markallcompleted_id:
							close_menu(menu_more_ref)
							command(Commands.mark_all_completed, props.tasklist_index)
							break
						case button_markalluncompleted_id:
							close_menu(menu_more_ref)
							command(Commands.mark_all_uncompleted, props.tasklist_index)
							break
						case button_cleartasks_id:
							open_dialog(ev, dialog_cleartasks_ref, {important: true})
							close_menu(menu_more_ref)
							break
						case button_deletecompletedtasks_id:
							open_dialog(ev, dialog_deletecompletedtasks_ref, {important: true})
							close_menu(menu_more_ref)
							break
						case button_renamelist_id:
							close_menu(menu_more_ref)
							command(Commands.rename_taskList, ev, props.tasklist_index)
							break
						case button_deletelist_id:
							close_menu(menu_more_ref)
							command(Commands.delete_taskList, ev, props.tasklist_index)
							break
					}
				}}>
				<Show when={props.si_any_uncompleted_task}>
					<MenuItem
						id={button_markallcompleted_id}
						c_icon_code={ICON_CHECKBOX_CHECKED}>
						Mark all completed
					</MenuItem>
				</Show>
				<Show when={props.is_any_completed_task}>
					<MenuItem
						id={button_markalluncompleted_id}
						c_icon_code={ICON_CHECKBOX_UNCHECKED}>
						Mark all uncompleted
					</MenuItem>
				</Show>
				<Show when={props.is_any_task}>
					<MenuDivider />
					<MenuItem
						id={button_cleartasks_id}
						c_icon_code={ICON_DELETE_DISMISS}>
						Clear tasks
					</MenuItem>
				</Show>
				<Show when={props.is_any_completed_task}>
					<MenuItem
						id={button_deletecompletedtasks_id}
						c_icon_code={ICON_DELETE_LINES}>
						Delete completed tasks
					</MenuItem>
				</Show>
				<Show when={is_number(props.page)}>
					<Show when={props.is_any_task}><MenuDivider /></Show>
					<MenuItem
						id={button_renamelist_id}
						c_icon_code={ICON_TEXT_EDIT_STYLE}>
						Rename list
					</MenuItem>
					<MenuItem
						id={button_deletelist_id}
						c_icon_code={ICON_DELETE}>
						Delete list
					</MenuItem>
				</Show>
			</Menu>
		</>)
	}

	const Dialogs: VoidComponent = () => {
		const button_cleartasks_cancel_id = createUniqueId()
		const button_cleartasks_clear_id = createUniqueId()
		const button_deletecompletedtasks_cancel_id = createUniqueId()
		const button_deletecompletedtasks_delete_id = createUniqueId()
		return (<>
			<Dialog
				ref={r => dialog_cleartasks_ref = r}
				c_header="Clear tasks"
				style={{width: '500px'}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_cleartasks_cancel_id:
							close_dialog(dialog_cleartasks_ref)
							break
						case button_cleartasks_clear_id:
							command(Commands.clear_tasks, props.tasklist_index)
							close_dialog(dialog_cleartasks_ref)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_cleartasks_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_cleartasks_clear_id}
						c_variant={ButtonVariant.filled}>
						Clear
					</Button>
				</>}>
				Clearing all tasks will permanently delete them. Are you sure you want to continue?
			</Dialog>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_deletecompletedtasks_ref = r}
				c_header={"Delete completed tasks"}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_deletecompletedtasks_cancel_id:
							close_dialog(dialog_deletecompletedtasks_ref)
							break
						case button_deletecompletedtasks_delete_id:
							command(Commands.delete_completed_task, props.tasklist_index)
							close_dialog(dialog_deletecompletedtasks_ref)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_deletecompletedtasks_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_deletecompletedtasks_delete_id}
						c_variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				Are you sure want to delete completed tasks?
			</Dialog>
		</>)
	}

	const AppBars: VoidComponent = () => {
		const button_sortby_id = createUniqueId()
		const button_copytasks_id = createUniqueId()
		const button_moreoptions_id = createUniqueId()
		return (<AppBar
			classList={classlist_module(CSS.body_appbar)}
			c_leading={props.leading}
			c_headline={props.headline}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == "BUTTON"
				)) return

				switch (element_id(button)) {
					case button_sortby_id:
						open_menu(ev, menu_sort_ref, {anchor: button})
						break
					case button_copytasks_id:
						command(Commands.copy_tasks, props.is_group? undefined : props.tasklist_index)
						open_toast(ev, toast_copied_ref)
						break
					case button_moreoptions_id:
						open_menu(ev, menu_more_ref, {anchor: button})
						break
				}
			}}
			c_trailing={<Tooltip>
				<Show when={props.is_any_task}>
					<IconButton
						data-tooltip="Sort by"
						c_focused={is_menu_sort_open()}
						id={button_sortby_id}
						c_code={ICON_ARROW_SORT}
					/>
					<IconButton
						data-tooltip="Copy tasks"
						id={button_copytasks_id}
						c_code={ICON_COPY}
					/>
				</Show>
				<Show when={!props.is_group && ((props.page == Pages.tasks && props.is_any_task) || is_number(props.page))}>
					<IconButton
						data-tooltip="More options"
						id={button_moreoptions_id}
						c_focused={is_menu_more_open()}
						c_code={ICON_MORE_VERTICAL}
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
			ref={r => toast_copied_ref = r}
			c_leading={<Icon c_code={ICON_COPY}/>}>
			Tasks copied
		</Toast>
	</>)
}

const TaskItem: VoidComponent<{
	task: Task
	task_index: number
	tasklist_index: number
	labels: (TaskLabel | undefined)[]
}> = (props) => {
	const task = createMemo(() => props.task)
	const tasklist_index = createMemo(() => props.tasklist_index)
	const task_index = createMemo(() => props.task_index)
	const labels = createMemo(() => props.labels)

	return (<div
		tabindex={0}
		data-taskitem={array_join([tasklist_index(), task_index()], ',')}
		class={CSS.body_task_item}
		data-done={attr_set_if_exist(task().complete)}>
		<List
			c_leading={<IconButton
				data-tooltip={`Mark as ${task().complete? 'un' : ''}completed`}
				data-taskitem-complete={array_join([tasklist_index(), task_index()], ',')}
				c_code={task().complete? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}
			/>}
			c_trailing={<>
				<IconButton
					data-tooltip={`Mark as ${task().important? 'not ' : ''}important`}
					data-taskitem-important={array_join([tasklist_index(), task_index()], ',')}
					c_filled={task().important}
					c_code={ICON_STAR}
				/>
				<IconButton
					data-tooltip="Delete task"
					data-taskitem-delete={array_join([tasklist_index(), task_index()], ',')}
					c_code={ICON_DELETE}
				/>
			</>}
			c_subtitle={<>
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
								data-taskitem-reminder={array_join([tasklist_index(), task_index()], ',')}
								c_variant={ButtonVariant.outlined}>
								<Icon c_filled c_code={ICON_ALERT_URGENT} c_inline/>
								{date_text_YMD_HM(task().reminder!)}
							</Button>
						</Show>
						<Show when={array_length(task().files) > 0}>
							<Button
								data-taskitem-files={array_join([tasklist_index(), task_index()], ',')}
								c_variant={ButtonVariant.outlined}>
								<Icon c_filled c_code={ICON_ATTACH} c_inline/>
								{array_length(task().files)} file{array_length(task().files) > 1? "s" : ''}
							</Button>
						</Show>
						<For each={task().label_ids}>{label_id =>
							<Show when={labels()[label_id] != undefined}>
								<Button
									style={{
										"border-color": labels()[label_id]!.color ?? undefined,
										"background-color": labels()[label_id]!.color != null
											? labels()[label_id]!.color + '14'
											: undefined
									}}
									data-taskitem-label={array_join([tasklist_index(), task_index(), label_id], ',')}
									c_variant={ButtonVariant.outlined}>
									<Icon c_filled c_code={ICON_TAG} c_inline/>
									{labels()[label_id]!.name}
								</Button>
							</Show>
						}</For>
					</div>
				</Show>
			</>}>
			{task().name}
		</List>
		<Show when={array_length(task().subtasks) > 0}>
			<div class={CSS.body_task_item_subtasks} onClick={ev => event_stop_propagation(ev)}>
				<For each={task().subtasks}>{(subtask, index) => <CheckBox
					checked={subtask.complete}
					data-taskitem-subtask={array_join([tasklist_index(), task_index(), index()], ',')}>
					{subtask.name}
				</CheckBox>}</For>
			</div>
		</Show>
	</div>)
}

const EmptyTasks: VoidComponent<{page: Pages | number}> = (props) => {
	const get_icon = createMemo<number>(() => {
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
	const get_text = createMemo<string>(() => {
		let t = ''
		const page = props.page
		if (array_includes([Pages.completed, Pages.uncompleted, Pages.important, Pages.planned], page as Pages)) {
			t = string_totitlecase(page as Pages)
		}
		return `No ${t} Tasks`
	})
	return (<div class={CSS.body_empty}>
		<Icon c_filled c_code={get_icon()}/>
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

		const list_id: number = (page() == Pages.tasks
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
			list_id,
			name: string_trim(textfield_newtask_ref.value),
			reminder: null,
			subtasks: []
		} satisfies Task, props.tasklist_index)
		change_textfield_value(textfield_newtask_ref, '')

		timeout_set(() => {
			// FIXME: can't focus textfield without this wrapper
			element_focus(textfield_newtask_ref)
		}, 200)
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
				fallback={<Emoji c_emoji={tasklist().emoji!} />}>
				<Show
					when={page() == Pages.tasks}
					fallback={<Icon c_code={ICON_TASK_LIST_SQUARE_LTR}/>}>
					<Icon c_code={ICON_HOME}/>
				</Show>
			</Show>}
			headline={get_headline()}
		/>
		<Tooltip>
			<For each={tasklist().tasks}>{(task, index) => <TaskItem
				task={task}
				labels={props.labels}
				task_index={index()}
				tasklist_index={props.tasklist_index}
			/>}</For>
		</Tooltip>
		<Show when={!is_any_task()}><EmptyTasks page={page()} /></Show>
		<Show when={is_any_task()}><div style={{flex: '1'}}></div></Show>
		<form onSubmit={ev => {
			add_task()
			event_prevent_default(ev)
		}}>
			<Tooltip>
				<TextField
					placeholder="Add task"
					ref={r => textfield_newtask_ref = r}
					c_trailing={<TextFieldButton
						data-tooltip="Add task"
						onClick={() => add_task()}>
						<Icon c_code={ICON_ADD_SQUARE}/>
					</TextFieldButton>}
				/>
			</Tooltip>
		</form>
	</div>)
}

const GroupTaskList: VoidComponent<{
	page: Pages | number
	tasklists: TaskList[]
	labels: (TaskLabel | undefined)[]
	settings: Settings
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
		if ($page == Pages.all) return ICON_APPS_LIST_DETAIL
		if ($page == Pages.completed) return ICON_CHECKBOX_CHECKED
		if ($page == Pages.uncompleted) return ICON_CHECKBOX_UNCHECKED
		if ($page == Pages.important) return ICON_STAR
		if ($page == Pages.planned) return ICON_ALERT

		return ICON_CHECKBOX_CHECKED
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
			c_headline={get_headline()}
			c_leading={<Show
				when={tasklist().emoji == null}
				fallback={<Emoji c_emoji={tasklist().emoji!} />}>
				<Show
					when={tasklist().id == DEFAULT_TASK_LIST.id}
					fallback={<Icon c_code={ICON_TASK_LIST_SQUARE_LTR}/>}>
					<Icon c_code={ICON_HOME}/>
				</Show>
			</Show>}
			c_trailing={<IconButton
				data-tooltip="More options"
				c_focused={is_menu_more_open() && selected_tasklist_to_action.tasklist_index == tasklist_index()}
				onClick={ev => {
					set_selected_tasklist_to_action({list: tasklist(), tasklist_index: tasklist_index()})
					open_menu(ev, menu_more_ref, {anchor: event_current_target(ev)})
				}}
				c_code={ICON_MORE_VERTICAL}
			/>}
		/>)

		return (<Show when={is_any_task()}>
			<Tooltip>
				<Headline/>
				<For each={tasklist().tasks}>{(task, index) =>
					<Show when={task_condition(task)}>
						<TaskItem
							task={task}
							labels={props.labels}
							task_index={index()}
							tasklist_index={tasklist_index()}
						/>
					</Show>
				}</For>
			</Tooltip>
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
			leading={<Icon c_code={get_icon()}/>}
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
			c_on_toggleopen={isOpen => set_is_menu_more_open(isOpen)}>
			<MenuItem
				c_icon_code={ICON_COPY}
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
			c_leading={<Icon c_code={ICON_COPY}/>}>
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

	function delete_subtask(index: number): void {
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

	function global_click(ev: MouseEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const button = document_active()!
		if (!element_valid_target(
			event_current_target(ev),
			button,
		)) return

		const data_taskitem_files = element_dataset(button, 'taskitemFiles')
		if (data_taskitem_files) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem_files, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			set_selected_task_to_fileaction({task, tasklist_index, task_index})
			open_menu(ev, menu_fileaction2_ref, {
				anchor: button,
				position: MenuPosition.center_bottom_to_right
			})
			return
		}

		const data_taskitem_reminder = element_dataset(button, 'taskitemReminder')
		if (data_taskitem_reminder) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem_reminder, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			set_selected_task_to_changereminder({task, tasklist_index, task_index})
			open_menu(ev, menu_reminder_ref, {
				anchor: button,
				position: MenuPosition.center_bottom_to_right
			})
			return
		}

		const data_taskitem_delete = element_dataset(button, 'taskitemDelete')
		if (data_taskitem_delete) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem_delete, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			delete_task(ev, task, tasklist_index, task_index)
			return
		}

		const data_taskitem_important = element_dataset(button, 'taskitemImportant')
		if (data_taskitem_important) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem_important, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			command(
				Commands.edit_task,
				{...task, important: !task.important} satisfies Task,
				tasklist_index,
				task_index
			)
			return
		}

		const data_taskitem = element_dataset(button, 'taskitem')
		if (data_taskitem) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			edit_task(ev, task, tasklist_index, task_index)
			return
		}

		const data_taskitem_complete = element_dataset(button, 'taskitemComplete')
		if (data_taskitem_complete) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem_complete, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			command(
				Commands.edit_task,
				{...task, complete: !task.complete} satisfies Task,
				tasklist_index,
				task_index
			)
			return
		}

		const data_taskitem_label = element_dataset(button, 'taskitemLabel')
		if (data_taskitem_label) {
			let [tasklist_index, task_index, label_id] = string_split(
				data_taskitem_label, ','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			label_id = number_parse(label_id as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
				|| number_is_not_defined(label_id)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			const label = props.labels[label_id]!
			set_selected_task_to_editlabel({task, tasklist_index, task_index})
			set_selected_label(label)
			open_menu(ev, menu_labelaction2_ref, {
				anchor: button,
				position: MenuPosition.center_bottom_to_right
			})
			return
		}
	}

	function global_keydown(ev: KeyboardEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const code = ev.code
		const target = event_target(ev) as HTMLElement
		const is_press_key = code == KEY_SPACE || code == KEY_ENTER
		const is_arrow_up = code == KEY_ARROW_UP
		const is_arrow_down = code == KEY_ARROW_DOWN
		const is_arrow_right = code == KEY_ARROW_RIGHT
		const is_arrow_left = code == KEY_ARROW_LEFT
		const is_arrow_key = is_arrow_up || is_arrow_down || is_arrow_right || is_arrow_left

		// handle custom interactive element using keyboard
		if (is_press_key) {
			const data_taskitem = element_dataset(target, 'taskitem')
			if (data_taskitem) {
				event_prevent_default(ev)
				element_click(target)
				return
			}
		}

		// handle move focus
		if (is_arrow_key) {
			// Move between subtasks
			const data_taskitem_subtask = element_dataset(target, 'taskitemSubtask')
			if (data_taskitem_subtask && (is_arrow_down || is_arrow_up)) {
				const label = element_closest(target, 'label')!

				let sibling: HTMLElement | null = is_arrow_up
					? element_previous_sibling(label)
					: element_next_sibling(label)
				if (!sibling) return

				sibling = element_by_selector('input', sibling)
				if (!sibling) return

				event_prevent_default(ev)
				element_focus(sibling)
				return
			}

			const data_taskitem = element_dataset(target, 'taskitem')
			if (data_taskitem && (is_arrow_down || is_arrow_up)) {
				const sibling: HTMLElement | null = is_arrow_up
					? element_previous_sibling(target)
					: element_next_sibling(target)
				if (!sibling) return

				event_prevent_default(ev)
				element_focus(sibling)
				return
			}
			return
		}
	}

	function global_contextmenu(ev: MouseEvent & {
		currentTarget: HTMLDivElement
		target: DOMElement
	}): void {
		const target = document_active()!
		if (!element_valid_target(
			event_current_target(ev),
			target,
		)) return

		const data_taskitem = element_dataset(target, 'taskitem')
		if (data_taskitem) {
			let [tasklist_index, task_index] = string_split(
				data_taskitem, ','
			) as [string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
			) return

			const task = tasklists()[tasklist_index].tasks[task_index]
			on_context_menu_task(ev, task, tasklist_index, task_index)
			event_prevent_default(ev)
			return
		}
	}

	function global_change(ev: Event & {
		currentTarget: HTMLDivElement
		target: Element
	}): void {
		const target = event_target(ev) as HTMLElement

		// subtask
		const data_taskitem_subtask = element_dataset(target, 'taskitemSubtask')
		if (data_taskitem_subtask) {
			let [tasklist_index, task_index, subtask_index] = string_split(
				data_taskitem_subtask, ','
			) as [string|number|undefined, string|number|undefined, string|number|undefined]
			if (!tasklist_index || !task_index || !subtask_index) return

			tasklist_index = number_parse(tasklist_index as string, true)
			task_index = number_parse(task_index as string, true)
			subtask_index = number_parse(subtask_index as string, true)
			if (
				number_is_not_defined(tasklist_index)
				|| number_is_not_defined(task_index)
				|| number_is_not_defined(subtask_index)
			) return

			const subtask = props.tasklists[tasklist_index].tasks[task_index].subtasks[subtask_index]
			command(
				Commands.edit_subtask,
				{...subtask, complete: (target as HTMLInputElement).checked} satisfies SubTask,
				tasklist_index,
				task_index,
				subtask_index
			)
			return
		}
	}

	const SubtaskItem: VoidComponent<{
		subtask: SubTask
		index: number
	}> = ($props) => {
		const subtask = createMemo(() => $props.subtask)
		const index = createMemo(() => $props.index)

		return (<List
			c_trailing={<>
				<IconButton
					data-tooltip="Edit subtask"
					data-subtask-edit-index={index()}
					c_code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Delete subtask"
					data-subtask-delete-index={index()}
					c_code={ICON_DELETE}
				/>
			</>}
			c_leading={<IconButton
				data-tooltip={`Mark as ${subtask().complete? 'un' : ''}completed`}
				data-subtask-complete-index={index()}
				c_code={subtask().complete? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}/>}>
			{subtask().name}
		</List>)
	}

	const FileItem: VoidComponent<{index: number}> = ($props) => {
		const file_index = createMemo(() => $props.index)
		const file = createMemo(() => selected_task_to_edit.task.files[file_index()])
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
			classList={classlist_module(CSS.body_file_list_item)}
			c_trailing={<>
				<IconButton
					data-tooltip={"View file" + (is_type_not_supported()? ' (not supported)' : '')}
					disabled={is_type_not_supported()}
					data-file-view-index={file_index()}
					c_code={ICON_EYE}
				/>
				<IconButton
					data-tooltip="More actions"
					data-file-action-index={file_index()}
					c_focused={selected_file_to_action.file.id == file().id && is_menu_fileaction_open()}
					c_code={ICON_MORE_VERTICAL}
				/>
			</>}
			c_subtitle={array_join([get_size_text(), string_replace(file().type, /\/.+$/gs, '')], " • ")}>
			{file().name}
		</List>)
	}

	const LabelItem: VoidComponent<{index: number}> = ($props) => {
		const label = createMemo(() => props.labels[$props.index]!)
		const color = createMemo(() => label().color)
		const name = createMemo(() => label().name)

		return (<List
			c_leading={<Icon style={{color: color() ?? undefined}} c_code={ICON_CIRCLE}/>}
			c_trailing={<>
				<IconButton
					data-tooltip="Edit label"
					data-label-edit-index={$props.index}
					c_code={ICON_EDIT}
				/>
				<IconButton
					data-tooltip="Remove label from task"
					data-label-remove-index={$props.index}
					c_code={ICON_DISMISS}
				/>
			</>}>
			{ name() }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const input_edittask_task_id = createUniqueId()
		const input_edittask_description_id = createUniqueId()
		const button_edittask_close_id = createUniqueId()
		const button_edittask_markcomplete_id = createUniqueId()
		const button_edittask_addsubtask_id = createUniqueId()
		const button_edittask_addlabel_id = createUniqueId()
		const button_edittask_addreminder_id = createUniqueId()
		const button_edittask_addfile_id = createUniqueId()
		const button_edittask_changereminder_id = createUniqueId()
		const button_edittask_removereminder_id = createUniqueId()
		const button_edittask_markimportant_id = createUniqueId()
		const button_edittask_deletetask_id = createUniqueId()
		const button_deletetask_cancel_id = createUniqueId()
		const button_deletetask_delete_id = createUniqueId()
		const button_filerename_cancel_id = createUniqueId()
		const button_filerename_rename_id = createUniqueId()
		const button_viewfile_close_id = createUniqueId()
		const button_viewfile_download_id = createUniqueId()
		const button_newsubtask_close_id = createUniqueId()
		const button_newsubtask_add_id = createUniqueId()
		const button_editsubtask_close_id = createUniqueId()
		const button_editsubtask_edit_id = createUniqueId()
		return (<>
			<Dialog
				ref={r => dialog_edittask_ref = r}
				c_header='Edit task'
				style={{width: '500px'}}
				classList={classlist_module(CSS.body_dialog_edit)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const task = selected_task_to_edit.task
					const tasklist_index = selected_task_to_edit.tasklist_index
					const task_index = selected_task_to_edit.task_index
					switch (element_id(button)) {
						case button_edittask_close_id:
							close_dialog(dialog_edittask_ref)
							break
						case button_edittask_markcomplete_id:
							command(Commands.edit_task,
								{...task, complete: !task.complete} satisfies Task,
								tasklist_index, task_index
							)

							set_selected_task_to_edit('task', task)
							break
						case button_edittask_addsubtask_id:
							add_subtask_option = 'edit'
							open_dialog(ev, dialog_newsubtask_ref, {
								important: true,
								content_auto_focus: true
							})
							break
						case button_edittask_addlabel_id:
							open_menu(ev, menu_labels_ref, {
								anchor: button,
								position: MenuPosition.center_bottom_to_right
							})
							break
						case button_edittask_addreminder_id:
							set_change_reminder_option('edit')
							open_datetimepicker(ev, datetimepicker_reminder_ref, {
								anchor: button,
								position: DateTimePickerPosition.center_bottom_to_right
							})
							break
						case button_edittask_changereminder_id:
							set_change_reminder_option('edit')
							open_datetimepicker(ev, datetimepicker_reminder_ref, {
								anchor: button,
								position: DateTimePickerPosition.center_bottom_to_right
							})
							break
						case button_edittask_removereminder_id:
							set_selected_task_to_edit('task', 'reminder', null)
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
						case button_edittask_addfile_id:
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
							break
						case button_edittask_markimportant_id:
							set_selected_task_to_edit('task', 'important', t => !t)
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
						case button_edittask_deletetask_id:
							delete_task(ev, task, tasklist_index, task_index)
							break
						default:
							const data_subtask_edit_index = element_dataset(button, 'subtaskEditIndex')
							if (data_subtask_edit_index) {
								const index = number_parse(data_subtask_edit_index, true)
								if (number_is_not_defined(index)) return

								edit_subtask(
									ev, task.subtasks[index], tasklist_index, task_index, index
								)
								return
							}

							const data_subtask_delete_index = element_dataset(button, 'subtaskDeleteIndex')
							if (data_subtask_delete_index) {
								const index = number_parse(data_subtask_delete_index, true)
								if (number_is_not_defined(index)) return

								delete_subtask(index)
								return
							}

							const data_subtask_complete_index = element_dataset(button, 'subtaskCompleteIndex')
							if (data_subtask_complete_index) {
								const index = number_parse(data_subtask_complete_index, true)
								if (number_is_not_defined(index)) return

								const subtask = task.subtasks[index]
								const $subtask: SubTask = {
									...subtask,
									complete: !subtask.complete
								}
								command(Commands.edit_subtask,
									$subtask, tasklist_index, task_index, index
								)
								set_selected_task_to_edit('task', 'subtasks', index, $subtask)
								return
							}

							const data_label_edit_index = element_dataset(button, 'labelEditIndex')
							if (data_label_edit_index) {
								const index = number_parse(data_label_edit_index, true)
								if (number_is_not_defined(index)) return

								set_selected_label(props.labels[index]!)
								command(Commands.edit_label, ev, selected_label)
								return
							}

							const data_label_remove_index = element_dataset(button, 'labelRemoveIndex')
							if (data_label_remove_index) {
								const index = number_parse(data_label_remove_index, true)
								if (number_is_not_defined(index)) return

								const i = array_find_index(
									selected_task_to_edit.task.label_ids,
									$id => $id == props.labels[index]!.id
								)
								if (i < 0) return

								set_selected_task_to_edit('task', 'label_ids', ids => array_concat(
									array_slice(ids, 0, i),
									array_slice(ids, i + 1)
								))
								command(Commands.edit_task, task, tasklist_index, task_index)
								return
							}

							const data_file_view_index = element_dataset(button, 'fileViewIndex')
							if (data_file_view_index) {
								const index = number_parse(data_file_view_index, true)
								if (number_is_not_defined(index)) return

								view_file(ev, task.files[index], tasklist_index, task_index, index)
								return
							}

							const data_file_action_index = element_dataset(button, 'fileActionIndex')
							if (data_file_action_index) {
								const index = number_parse(data_file_action_index, true)
								if (number_is_not_defined(index)) return

								set_selected_file_to_action({
									file: task.files[index],
									file_index: index,
									task_index,
									tasklist_index
								})
								open_menu(ev, menu_fileaction_ref, {anchor: button})
								return
							}
					}
				}}
				onFocusOut={ev => {
					const input = event_target(ev) as HTMLInputElement
					const task = selected_task_to_edit.task
					const tasklist_index = selected_task_to_edit.tasklist_index
					const task_index = selected_task_to_edit.task_index
					switch (element_id(input)) {
						case input_edittask_task_id:
							if (input.value == task.name) return

							set_selected_task_to_edit('task', 'name', input.value)
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
						case input_edittask_description_id:
							const value = input.value
							if (value == task.description) return

							set_selected_task_to_edit('task', 'description', value)
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
					}
				}}
				c_actions={<>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_edittask_close_id}>
						Close
					</Button>
					<Button
						c_variant={ButtonVariant.filled}
						id={button_edittask_markcomplete_id}>
						Mark as {selected_task_to_edit.task.complete? "not" : ''} completed
					</Button>
				</>}>
				<TextField
					c_label="Task"
					value={selected_task_to_edit.task.name}
					id={input_edittask_task_id}
				/>
				<AreaTextField
					c_label="Description"
					c_max_line={3}
					id={input_edittask_description_id}
					value={selected_task_to_edit.task.description}
				/>
				<div data-subtasks>
					<Tooltip>
						<For each={selected_task_to_edit.task.subtasks}>{ (subtask, index) => <SubtaskItem
							subtask={subtask}
							index={index()}
						/>}</For>
					</Tooltip>
					<Button
						id={button_edittask_addsubtask_id}>
						<Icon c_code={ICON_ADD_CIRCLE}/>Add subtask
					</Button>
				</div>
				<Divider />
				<div data-label>
					<Tooltip>
						<For each={selected_task_to_edit.task.label_ids}>{label_id =>
							<Show when={props.labels[label_id] != undefined}>
								<LabelItem index={label_id} />
							</Show>
						}</For>
					</Tooltip>
					<Button
						c_focused={is_menu_labels_open()}
						id={button_edittask_addlabel_id}>
						<Icon c_code={ICON_TAG}/>Add label
					</Button>
				</div>
				<Divider />
				<div data-reminder>
					<Show
						when={selected_task_to_edit.task.reminder != null}
						fallback={<Button
							id={button_edittask_addreminder_id}
							c_focused={is_datetimepicker_reminder_open()}>
							<Icon c_code={ICON_ALERT_BADGE}/>Add reminder
						</Button>}>
						<List
							c_trailing_auto_tabindex
							c_trailing={<Tooltip>
								<IconButton
									id={button_edittask_changereminder_id}
									data-tooltip="Change datetime reminder"
									c_code={ICON_CALENDAR_EDIT}
								/>
								<IconButton
									id={button_edittask_removereminder_id}
									data-tooltip="Remove reminder"
									c_code={ICON_ALERT_OFF}
								/>
							</Tooltip>}
							c_leading={<Icon c_code={ICON_ALERT_URGENT}/>}>
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
						<Tooltip>
							<For each={selected_task_to_edit.task.files}>{(_, index) =>
								<FileItem index={index()}/>
							}</For>
						</Tooltip>
						<Button id={button_edittask_addfile_id}>
							<Icon c_code={ICON_ATTACH}/>Add file
						</Button>
					</div>
					<Divider />
				</Show>
				<div data-important>
					<Button id={button_edittask_markimportant_id}>
						<Icon c_filled={selected_task_to_edit.task.important} c_code={ICON_STAR}/>
						Mark as {selected_task_to_edit.task.important? 'not' : ''} important
					</Button>
				</div>
				<div data-delete>
					<Button
						id={button_edittask_deletetask_id}
						style={{color: `rgb(${AppColors.error})`}}>
						<Icon c_code={ICON_DELETE}/>
						Delete task
					</Button>
				</div>
			</Dialog>
			<Dialog
				c_header="Delete task"
				style={{width: '560px'}}
				ref={r => dialog_deletetaskwarning_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					const task = selected_task_to_delete.task
					const tasklist_index = selected_task_to_delete.tasklist_index
					const task_index = selected_task_to_delete.task_index
					switch (element_id(button)) {
						case button_deletetask_cancel_id:
							close_dialog(dialog_deletetaskwarning_ref)
							break
						case button_deletetask_delete_id:
							close_dialog(dialog_deletetaskwarning_ref)
							close_dialog(dialog_edittask_ref)
							close_menu(menu_taskaction_ref)
							command(Commands.delete_task, task, tasklist_index, task_index)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_deletetask_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_deletetask_delete_id}
						c_variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}>
				Are you sure want to delete <q><span style={{color: `rgb(${AppColors.accent})`, "font-weight": 'bold'}}>{(selected_task_to_delete.task.name) || ''}</span></q> task?
				<CheckBox
					c_attr_label={{style: "margin-top: 16px"}}
					onChange={ev => command(Commands.toggle_delete_task_warning, !event_current_target(ev).checked)}>
					Don't remind me again
				</CheckBox>
			</Dialog>
			<Dialog
				ref={r => dialog_filerename_ref = r}
				style={{width: '500px'}}
				c_header="Rename file"
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_filerename_cancel_id:
							close_dialog(dialog_filerename_ref)
							break
						case button_filerename_rename_id:
							confirm_file_rename()
							break
					}
				}}
				c_actions={<>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_filerename_cancel_id}>
						Cancel
					</Button>
					<Button
						c_variant={ButtonVariant.filled}
						id={button_filerename_rename_id}
						disabled={string_trim(text_file()) == ''}>
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
						onInput={ev => set_text_file(event_current_target(ev).value)}
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
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					const file = selected_file_to_view.file
					const tasklist_index = selected_file_to_view.tasklist_index
					const task_index = selected_file_to_view.task_index
					const file_index = selected_file_to_view.file_index
					switch (element_id(button)) {
						case button_viewfile_close_id:
							close_dialog(dialog_viewfile_ref)
							break
						case button_viewfile_download_id:
							command(Commands.download_file,
								ev, file, tasklist_index, task_index, file_index
							)
							break
					}
				}}
				c_header={selected_file_to_view.file.name}
				c_actions={<>
					<Button
						id={button_viewfile_close_id}
						c_variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						c_variant={ButtonVariant.filled}
						id={button_viewfile_download_id}>
						Download
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
				c_header="New subtask"
				onClose={() => {
					set_text_subtask('')
					change_textfield_value(textfield_newsubtask_ref, '')
				}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_newsubtask_close_id:
							close_dialog(dialog_newsubtask_ref)
							break
						case button_newsubtask_add_id:
							confirm_add_subtask()
							break
					}
				}}
				c_actions={<>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_newsubtask_close_id}>
						Close
					</Button>
					<Button
						c_variant={ButtonVariant.filled}
						id={button_newsubtask_add_id}
						disabled={string_trim(text_subtask()) == ''}>
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
						onFocus={ev => set_text_subtask(event_current_target(ev).value)}
						onInput={ev => set_text_subtask(event_current_target(ev).value)}
					/>
				</form>
			</Dialog>
			<Dialog
				ref={r => dialog_editsubtask_ref = r}
				style={{width: '500px'}}
				c_header="Edit subtask"
				onClose={() => {
					set_text_subtask('')
					change_textfield_value(textfield_editsubtask_ref, '')
				}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_editsubtask_close_id:
							close_dialog(dialog_editsubtask_ref)
							break
						case button_editsubtask_edit_id:
							confirm_edit_subtask()
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_editsubtask_close_id}
						c_variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_editsubtask_edit_id}
						c_variant={ButtonVariant.filled}
						disabled={string_trim(text_subtask()) == ''}>
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
						onFocus={ev => set_text_subtask(event_current_target(ev).value)}
						onInput={ev => set_text_subtask(event_current_target(ev).value)}
					/>
				</form>
			</Dialog>
		</>)
	}

	const Menus: VoidComponent = () => {
		const button_taskactions_markcomplete_id = createUniqueId()
		const button_taskactions_markimportant_id = createUniqueId()
		const button_taskactions_addfile_id = createUniqueId()
		const button_taskactions_addsubtask_id = createUniqueId()
		const button_taskactions_addreminder_id = createUniqueId()
		const button_taskactions_edittask_id = createUniqueId()
		const button_taskactions_deletetask_id = createUniqueId()
		const button_reminder_change_id = createUniqueId()
		const button_reminder_remove_id = createUniqueId()
		const button_labels_new_id = createUniqueId()
		const button_labels_edit_id = createUniqueId()
		const button_labelactions_edit_id = createUniqueId()
		const button_labelactions_delete_id = createUniqueId()
		const button_labelactions_edit2_id = createUniqueId()
		const button_labelactions_delete2_id = createUniqueId()
		const button_fileaction_download_id = createUniqueId()
		const button_fileaction_rename_id = createUniqueId()
		const button_fileaction_delete_id = createUniqueId()
		const button_fileaction3_view_id = createUniqueId()
		const button_fileaction3_rename_id = createUniqueId()
		const button_fileaction3_download_id = createUniqueId()
		const button_fileaction3_delete_id = createUniqueId()
		return (<>
			<Menu
				ref={r => menu_taskaction_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return
					const task = selected_task_to_action.task
					const tasklist_index = selected_task_to_action.tasklist_index
					const task_index = selected_task_to_action.task_index

					switch (element_id(button)){
						case button_taskactions_markcomplete_id:
							close_menu(menu_taskaction_ref)
							command(Commands.edit_task,
								{ ...task, complete: !task.complete } satisfies Task,
								tasklist_index, task_index
							)
							break
						case button_taskactions_markimportant_id:
							close_menu(menu_taskaction_ref)
							command(Commands.edit_task,
								{ ...task, important: !task.important } satisfies Task,
								tasklist_index, task_index
							)
							break
						case button_taskactions_addfile_id:
							close_menu(menu_taskaction_ref)
							promise_done(file_open(null, true), async (files) => {
								if (files == null) return;
								const result = await command(Commands.add_files,
									files, task, tasklist_index, task_index
								) as TaskFileMetaData[]
								set_selected_task_to_action('task', 'files', result)
							})
							break
						case button_taskactions_addsubtask_id:
							close_menu(menu_taskaction_ref)
							add_subtask_option = 'action'
							open_dialog(ev, dialog_newsubtask_ref, {
								important: true,
								content_auto_focus: true
							})
							break
						case button_taskactions_addreminder_id:
							close_menu(menu_taskaction_ref)
							set_change_reminder_option('action')
							open_datetimepicker(ev, datetimepicker_reminder_ref)
							break
						case button_taskactions_edittask_id:
							close_menu(menu_taskaction_ref)
							edit_task(ev, task, tasklist_index, task_index)
							break
						case button_taskactions_deletetask_id:
							delete_task(ev, task, tasklist_index, task_index)
							break
						default:
							const data_label_id = element_dataset(button, 'labelId')
							if (data_label_id) {
								const label_id = number_parse(data_label_id, true)
								if (number_is_not_defined(label_id)) return

								const index = array_find_index(task.label_ids, id => id == label_id)
								set_selected_task_to_action('task', 'label_ids', ids => index >= 0
									? array_concat(
										array_slice(ids, 0, index),
										array_slice(ids, index + 1)
									)
									: [...ids, label_id]
								)
								command(Commands.edit_task, task, tasklist_index, task_index)
								return
							}

							const data_tasklist_index = element_dataset(button, 'tasklistIndex')
							if (data_tasklist_index) {
								const i = number_parse(data_tasklist_index, true)
								if (number_is_not_defined(i)) return

								command(Commands.move_task, task, tasklist_index, task_index, i)
								close_submenu(submenu_movetask_ref)
								close_menu(menu_taskaction_ref)
								return
							}
					}
				}}>
				<MenuItem
					id={button_taskactions_markcomplete_id}
					c_icon_code={selected_task_to_action.task.complete? ICON_CHECKBOX_UNCHECKED : ICON_CHECKBOX_CHECKED}
					c_trailing={<MenuIndent />}>
					Mark as {selected_task_to_action.task.complete? 'not' : ''} completed
				</MenuItem>
				<MenuItem
					id={button_taskactions_markimportant_id}
					c_leading={<Icon c_code={ICON_STAR} c_filled={!((selected_task_to_action.task.important) || false)}/>}
					c_trailing={<MenuIndent />}>
					Mark as {selected_task_to_action.task.important? 'not' : ''} important
				</MenuItem>
				<MenuDivider />
				<Show when={!props.is_db_file_error}>
					<MenuItem
						c_icon_code={ICON_ATTACH}
						c_trailing={<MenuIndent />}
						id={button_taskactions_addfile_id}>
						Add file
					</MenuItem>
				</Show>
				<MenuItem
					c_icon_code={ICON_ADD_CIRCLE}
					id={button_taskactions_addsubtask_id}
					c_trailing={<MenuIndent />}>
					Add subtask
				</MenuItem>
				<Show when={selected_task_to_action.task.reminder == null}>
					<MenuItem
						id={button_taskactions_addreminder_id}
						c_icon_code={ICON_ALERT}
						c_trailing={<MenuIndent />}>
						Add reminder
					</MenuItem>
				</Show>
				<Show when={array_length(props.labels) > 0}>
					<SubMenu
						c_on_toggleopen={v => set_is_menu_taskactionaddlabel_open(v)}
						c_item={<SubMenuItem
							c_focused={is_menu_taskactionaddlabel_open()}
							c_icon_code={ICON_TAG}>
							Add label
						</SubMenuItem>}>
						<For each={props.labels}>{label => <Show when={label != undefined}>
							<MenuItem
								c_leading={<Icon style={{color: label!.color ?? undefined}} c_code={ICON_CIRCLE}/>}
								c_checked={array_includes(selected_task_to_action.task.label_ids, label!.id)}
								data-label-id={label!.id}>
								{label!.name}
							</MenuItem>
						</Show>}</For>
					</SubMenu>
				</Show>
				<MenuDivider />
				<SubMenu
					ref={r => submenu_movetask_ref = r}
					style={{"min-width": '200px'}}
					c_on_toggleopen={v => set_is_menu_taskaction_move_open(v)}
					c_item={<SubMenuItem
						c_focused={is_menu_taskactionmove_open()}
						c_icon_code={ICON_ARROW_RIGHT}>
						Move task to ...
					</SubMenuItem>}>
					<For each={props.tasklists}>{(list, i) => <>
						<MenuItem
							data-tasklist-index={i()}
							style={{order: list.id == DEFAULT_TASK_LIST.id? '-2' : undefined}}
							c_icon_code={list.id == DEFAULT_TASK_LIST.id
								? ICON_HOME
								: list.emoji == null
									? ICON_TASK_LIST_SQUARE_LTR
									: undefined
							}
							c_leading={<Show
								when={list.emoji != null && list.id != DEFAULT_TASK_LIST.id}>
								<Emoji c_emoji={list.emoji!} />
							</Show>}
							c_selected={i() == get_tasklist_index()}>
							{list.name}
						</MenuItem>
						<Show when={array_length(props.tasklists) > 1 && list.id == DEFAULT_TASK_LIST.id}>
							<MenuDivider style={{order: '-1'}}/>
						</Show>
					</>}</For>
				</SubMenu>
				<MenuDivider />
				<MenuItem
					id={button_taskactions_edittask_id}
					c_icon_code={ICON_EDIT}
					c_trailing={<MenuIndent />}>
					Edit task
				</MenuItem>
				<MenuItem
					id={button_taskactions_deletetask_id}
					c_icon_code={ICON_DELETE}
					c_trailing={<MenuIndent />}>
					Delete task
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menu_reminder_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_reminder_change_id:
							close_menu(menu_reminder_ref)
							set_change_reminder_option('chip')
							open_datetimepicker(ev, datetimepicker_reminder_ref)
							break
						case button_reminder_remove_id:
							close_menu(menu_reminder_ref)
							set_selected_task_to_changereminder('task', 'reminder', null)
							command(
								Commands.edit_task,
								selected_task_to_changereminder.task,
								selected_task_to_changereminder.tasklist_index,
								selected_task_to_changereminder.task_index
							)
							break
					}
				}}>
				<MenuItem
					c_icon_code={ICON_CALENDAR_EDIT}
					id={button_reminder_change_id}>
					Change datetime reminder
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_ALERT_OFF}
					id={button_reminder_remove_id}>
					Remove reminder
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menu_labels_ref = r}
				c_on_toggleopen={is_open => set_is_menu_labels_open(is_open)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const task = selected_task_to_edit.task
					const tasklist_index = selected_task_to_edit.tasklist_index
					const task_index = selected_task_to_edit.task_index
					switch (element_id(button)) {
						case button_labels_new_id:
							command(Commands.add_label, ev)
							break
						case button_labels_edit_id:
							close_dialog(dialog_edittask_ref)
							close_menu(menu_labels_ref)
							command(Commands.show_labels_options, ev)
							break
						default:
							const data_label_index = element_dataset(button, 'labelIndex')
							if (data_label_index) {
								const label_index = number_parse(data_label_index, true)
								if (number_is_not_defined(label_index)) return

								const label_id = props.labels![label_index]!.id
								const index = array_find_index(task.label_ids, id => id == label_id)
								set_selected_task_to_edit('task', 'label_ids', ids => index < 0
									? [...ids, label_id]
									: array_concat(
										array_slice(ids, 0, index),
										array_slice(ids, index + 1)
									)
								)
								command(Commands.edit_task, task, tasklist_index, task_index)
								return
							}
					}
				}}
				onContextMenu={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_label_index = element_dataset(button, 'labelIndex')
					if (data_label_index) {
						const label_index = number_parse(data_label_index, true)
						if (number_is_not_defined(label_index)) return

						const label = props.labels![label_index]!
						set_selected_label(label)
						event_prevent_default(ev)
						open_menu(ev, menu_labelaction_ref, {position: MenuPosition.center_bottom_to_right})
						return
					}
				}}>
				<MenuItem
					id={button_labels_new_id}
					c_icon_code={ICON_ADD}>
					New label
				</MenuItem>
				<Show when={array_length(props.labels) > 0}>
					<MenuItem
						id={button_labels_edit_id}
						c_icon_code={ICON_EDIT}>
						Edit labels
					</MenuItem>
					<Divider/>
				</Show>
				<For each={props.labels}>{(label, i) => <Show when={label != undefined}>
					<MenuItem
						c_leading={<Icon style={{color: label!.color ?? undefined}} c_code={ICON_CIRCLE}/>}
						c_checked={array_includes(selected_task_to_edit.task.label_ids, label!.id)}
						data-label-index={i()}>
						{label!.name}
					</MenuItem>
				</Show>}</For>
			</Menu>
			<Menu
				ref={r => menu_labelaction_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_labelactions_edit_id:
							close_menu(menu_labelaction_ref)
							command(Commands.edit_label, ev, selected_label)
							break
						case button_labelactions_delete_id:
							close_menu(menu_labelaction_ref)
							command(Commands.delete_label, selected_label)
							break
					}
				}}>
				<MenuItem
					c_icon_code={ICON_EDIT}
					id={button_labelactions_edit_id}>
					Edit label
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_DELETE}
					id={button_labelactions_delete_id}>
					Delete label
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menu_labelaction2_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const task = selected_task_to_editlabel.task
					const tasklist_index = selected_task_to_editlabel.tasklist_index
					const task_index = selected_task_to_editlabel.task_index
					switch (element_id(button)) {
						case button_labelactions_edit2_id:
							close_menu(menu_labelaction2_ref)
							command(Commands.edit_label, ev, selected_label)
							break
						case button_labelactions_delete2_id:
							close_menu(menu_labelaction2_ref)
							const index = array_find_index(task.label_ids, v => v == selected_label.id)
							if (index < 0) return;

							set_selected_task_to_editlabel('task', 'label_ids', ids => array_concat(
								array_slice(ids, 0, index),
								array_slice(ids, index + 1)
							))
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
					}
				}}>
				<MenuItem
					c_icon_code={ICON_EDIT}
					id={button_labelactions_edit2_id}>
					Edit label
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_DISMISS}
					id={button_labelactions_delete2_id}>
					Remove label from task
				</MenuItem>
			</Menu>
			<Menu
				ref={r => menu_fileaction_ref = r}
				c_on_toggleopen={is_open => set_is_menu_fileaction_open(is_open)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const file = selected_file_to_action.file
					const tasklist_index = selected_file_to_action.tasklist_index
					const task_index = selected_file_to_action.task_index
					const file_index = selected_file_to_action.file_index
					switch (element_id(button)) {
						case button_fileaction_download_id:
							close_menu(menu_fileaction_ref)
							command(Commands.download_file,
								ev, file, tasklist_index, task_index, file_index
							)
							break
						case button_fileaction_rename_id:
							close_menu(menu_fileaction_ref)

							const text = string_replace(file.name, /\.[^\.]*$/, '')
							change_textfield_value(textfield_renamefile_ref, text)
							set_text_file(text)
							set_selected_file_to_rename({...selected_file_to_action})
							rename_file_option = 'edit'
							open_dialog(ev, dialog_filerename_ref, {
								content_auto_focus: true,
								important: true
							})
							break
						case button_fileaction_delete_id:
							close_menu(menu_fileaction_ref)
							set_selected_task_to_edit('task', 'files', files => [
								...array_slice(files, 0, file_index),
								...array_slice(files, file_index + 1)
							])
							command(Commands.edit_task,
								props.tasklists[tasklist_index].tasks[task_index],
								tasklist_index, task_index
							)
							break
					}
				}}>
				<MenuItem
					c_icon_code={ICON_ARROW_DOWNLOAD}
					id={button_fileaction_download_id}>
					Download
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_EDIT}
					id={button_fileaction_rename_id}>
					Rename
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_DELETE}
					id={button_fileaction_delete_id}>
					Delete
				</MenuItem>
			</Menu>
			<Menu
				style={{'min-width': '164px'}}
				ref={r => menu_fileaction2_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_file_index = element_dataset(button, 'fileIndex')
					if (data_file_index) {
						const file_index = number_parse(data_file_index, true)
						if (number_is_not_defined(file_index)) return

						set_selected_file_to_action2({
							file: selected_task_to_fileaction.task.files[file_index],
							file_index: file_index,
							task_index: selected_task_to_fileaction.task_index,
							tasklist_index: selected_task_to_fileaction.tasklist_index
						})
						open_menu(ev, menu_fileaction3_ref, {
							anchor: event_current_target(ev),
							position: MenuPosition.right_center_to_bottom
						})
						return
					}
				}}>
				<For each={selected_task_to_fileaction.task.files}>{(file, index) =>
					<MenuItem
						c_focused={is_menu_fileaction3_open() && file.id == selected_file_to_action2.file.id}
						data-file-index={index()}>
						{file.name}
					</MenuItem>
				}</For>
			</Menu>
			<Menu
				style={{'min-width': '164px'}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const file = selected_file_to_action2.file
					const tasklist_index = selected_file_to_action2.tasklist_index
					const task_index = selected_file_to_action2.task_index
					const file_index = selected_file_to_action2.file_index
					const task = props.tasklists[tasklist_index].tasks[task_index]
					switch (element_id(button)) {
						case button_fileaction3_view_id:
							close_menu(menu_fileaction3_ref)
							view_file(ev, file, tasklist_index, task_index, file_index)
							break
						case button_fileaction3_rename_id:
							close_menu(menu_fileaction3_ref)

							const text = string_replace(file.name, /\.[^\.]*$/, '')
							change_textfield_value(textfield_renamefile_ref, text)
							set_text_file(text)
							set_selected_file_to_rename({...selected_file_to_action2})
							rename_file_option = 'action'
							open_dialog(ev, dialog_filerename_ref, {
								content_auto_focus: true,
								important: true
							})
							break
						case button_fileaction3_download_id:
							close_menu(menu_fileaction3_ref)
							command(Commands.download_file,
								ev, file, tasklist_index, task_index, file_index
							)
							break
						case button_fileaction3_delete_id:
							close_menu(menu_fileaction3_ref)
							if (array_length(task.files) == 1) close_menu(menu_fileaction2_ref)

							set_selected_task_to_fileaction('task', 'files', files => [
								...array_slice(files, 0, file_index),
								...array_slice(files, file_index + 1)
							])
							command(Commands.edit_task, task, tasklist_index, task_index)
							break
					}
				}}
				ref={r => menu_fileaction3_ref = r}
				c_on_toggleopen={(is_open) => set_is_menu_fileaction3_open(is_open)}>
				<Show when={regex_test(/^(audio|image|video|text)/, selected_file_to_action2.file.type)}>
					<MenuItem
						c_icon_code={ICON_EYE}
						id={button_fileaction3_view_id}>
						View
					</MenuItem>
				</Show>
				<MenuItem
					c_icon_code={ICON_EDIT}
					id={button_fileaction3_rename_id}>
					Rename
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_ARROW_DOWNLOAD}
					id={button_fileaction3_download_id}>
					Download
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_DELETE}>
					Delete
				</MenuItem>
			</Menu>
		</>)
	}

	const DatePickers: VoidComponent = () => (<>
		<DateTimePicker
			c_on_toggleopen={(v) => set_is_datetimepicker_reminder_open(v)}
			c_datetime={(change_reminder_option() == 'edit'
				? selected_task_to_edit.task.reminder
				: change_reminder_option() == 'action'
					? selected_task_to_action.task.reminder
					: change_reminder_option() == 'chip'
						? selected_task_to_changereminder.task.reminder
						: new Date()
			) ?? new Date()}
			ref={r => datetimepicker_reminder_ref = r}
			c_on_selectdatetime={(date) => {
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

	return (<div class={CSS.body}
		onClick={global_click}
		onKeyDown={global_keydown}
		onContextMenu={global_contextmenu}
		onChange={global_change}>
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
			/>}>
			<GroupTaskList
				command={command}
				settings={settings()}
				page={page()}
				tasklists={props.tasklists}
				labels={props.labels}
			/>
		</Show>
		<Dialogs/>
		<Menus/>
		<DatePickers/>
	</div>)
}

export default _