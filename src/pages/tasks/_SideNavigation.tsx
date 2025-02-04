import { createMemo, createUniqueId, For, Show, type VoidComponent } from "solid-js"
import { TransitionGroup } from "solid-transition-group"

import type { Settings, TaskList } from "./_types"
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_constants"
import { element_animate, element_dataset, element_first_child, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { Commands, Pages } from "./_enums"
import { event_current_target, event_prevent_default } from "@/utils/event"
import { AnimationEffectTiming } from "@/enums/animation"
import { array_filter, array_includes, array_length } from "@/utils/array"
import { classlist_module } from "@/utils/attributes"
import { promise_done } from "@/utils/object"
import { document_active } from "@/utils/document"
import { number_is_not_defined, number_parse, number_safe } from "@/utils/number"
import { ICON_ADD, ICON_DELETE, ICON_TASK_LIST_SQUARE_LTR, ICON_TEXT_EDIT_STYLE } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Divider from "@/components/Divider"
import Emoji from "@/components/Emoji"
import Menu, { close_menu, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	expanded: boolean
	tasklists: TaskList[]
	page: Pages | number
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const animation_options = {
		duration: 200,
		easing: AnimationEffectTiming.spring
	}
	const expanded = createMemo(() => props.expanded)
	const button_newlist_id = createUniqueId()
	let selected_tasklist_index = 0
	let menu_listaction_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const Page: VoidComponent<{ type: Pages, text: string, icon: number}> = ($props) => {
		return (<SideNavigationItem
			c_icon_code={$props.icon}
			data-tooltip={!expanded()? $props.text : undefined}
			c_selected={props.page == $props.type}
			data-page={$props.type}>
			{$props.text}
		</SideNavigationItem>)
	}

	const Item: VoidComponent<TaskList & {index: number}> = ($props) => {
		return (<SideNavigationItem
			data-tooltip={!expanded()? $props.name : undefined}
			c_icon_code={$props.emoji == null? ICON_TASK_LIST_SQUARE_LTR : undefined}
			c_leading={<Show when={$props.emoji != null}><Emoji c_emoji={$props.emoji!} /></Show>}
			c_selected={props.page == $props.id}
			data-list-id={$props.id}
			data-index={$props.index}>
			{$props.name}
		</SideNavigationItem>)
	}

	const Footer: VoidComponent = () => (<SideNavigationItem
		c_icon_code={ICON_ADD}
		id={button_newlist_id}
		data-tooltip={!expanded()? "Add new list" : undefined}>
		New list
	</SideNavigationItem>)

	const Menus: VoidComponent = () => {
		const button_renamelist_id = createUniqueId()
		const button_deletelist_id = createUniqueId()
		return (<>
			<Menu
				ref={r => menu_listaction_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_renamelist_id:
							command(Commands.rename_taskList, ev, selected_tasklist_index)
							close_menu(menu_listaction_ref)
							break
						case button_deletelist_id:
							command(Commands.delete_taskList, ev, selected_tasklist_index)
							close_menu(menu_listaction_ref)
							break
					}
				}}>
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
			</Menu>
		</>)
	}

	return (<Tooltip><SideNavigation
		style={{"padding-top": '0'}}
		classList={classlist_module(CSS.side_navigation)}
		c_expanded={expanded()}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			switch (element_id(button)) {
				case button_newlist_id:
					command(Commands.add_tasklist, ev)
					break
				default:
					const data_list_id = element_dataset(button, 'listId')
					if (data_list_id) {
						const list_id = number_parse(data_list_id)
						if (number_is_not_defined(list_id)) return

						command(Commands.change_page, list_id)
					}

					const data_page = element_dataset(button, 'page')
					if (data_page) {
						command(Commands.change_page, data_page)
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

			const data_list_id = element_dataset(button, 'listId')
			if (data_list_id) {
				event_prevent_default(ev)
				open_menu(ev, menu_listaction_ref, {position: MenuPosition.center_bottom_to_right})
				const data_index = element_dataset(button, 'index')
				if (data_index) {
					const index = number_safe(number_parse(data_index))
					selected_tasklist_index = index
				}
			}
		}}
		c_footer={<Footer />}>
		<TransitionGroup
			onEnter={(el, done) => {
				promise_done(element_animate(
					element_first_child(el as HTMLElement)!,
					{ opacity: [0, 1], transform: ['translate(-12px)', 'none'] },
					animation_options
				).finished, done)
			}}
			onExit={(el, done) => {
				promise_done(element_animate(
					element_first_child(el as HTMLElement)!,
					{ opacity: 0, transform: 'translate(-12px)'},
					animation_options
				).finished, done)
			}}>
			<For each={array_filter(TASKS_PAGES, page => !array_includes(props.settings.hidden_navigation, page.type))}>
				{p => <Page {...p}/>}
			</For>
		</TransitionGroup>
		<Show when={array_length(props.tasklists) - 1 > 0}><Divider /></Show>
		<For each={props.tasklists}>{(p, i) =>
			<Show when={p.id != DEFAULT_TASK_LIST.id}>
				<Item {...p} index={i()}/>
			</Show>
		}</For>
		<Menus/>
	</SideNavigation></Tooltip>)
}

export default _