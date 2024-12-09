import { createMemo, For, Show, type VoidComponent } from "solid-js"
import { TransitionGroup } from "solid-transition-group"

import type { Settings, TaskList } from "./_types"
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_constants"
import { add_classlist_module, element_animate, element_first_element_child } from "@/utils/element"
import { Commands, Pages } from "./_enums"
import { event_prevent_default } from "@/utils/event"
import { AnimationEffectTiming } from "@/enums/animation"
import { array_filter, array_includes, array_length } from "@/utils/array"
import { promise_done } from "@/utils/object"

import { TextTooltip } from "@/components/Tooltip"
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
		duration: 300,
		easing: AnimationEffectTiming.spring
	}
	const expanded = createMemo(() => props.expanded)
	let selected_tasklist_index = 0
	let menu_listaction_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const Page: VoidComponent<{ type: Pages, text: string, icon: number}> = ($props) => {
		return (<TextTooltip text={!expanded()? $props.text : undefined}>
			<SideNavigationItem
				icon_code={$props.icon}
				selected={props.page == $props.type}
				onClick={() => command(Commands.change_page, $props.type)}
				icon_only={!expanded()}>
				{$props.text}
			</SideNavigationItem>
		</TextTooltip>)
	}

	const Item: VoidComponent<TaskList & {index: number}> = ($props) => {
		return (<TextTooltip text={!expanded()? $props.name : undefined}>
			<SideNavigationItem
				icon_code={$props.emoji == null? 0xF032 : undefined}
				leading={<Show when={$props.emoji != null}><Emoji emoji={$props.emoji!} /></Show>}
				selected={props.page == $props.id}
				onClick={() => command(Commands.change_page, $props.id)}
				onContextMenu={(ev) => {
					event_prevent_default(ev)
					selected_tasklist_index = $props.index
					open_menu(ev, menu_listaction_ref, {
						position: MenuPosition.center_bottom_to_right
					})
				}}
				icon_only={!expanded()}>
				{$props.name}
			</SideNavigationItem>
		</TextTooltip>)
	}

	const Footer: VoidComponent = () => (<TextTooltip text={!expanded()? "Add new list" : undefined}>
		<SideNavigationItem
			icon_code={0xE007}
			icon_only={!expanded()}
			onClick={ev => command(Commands.add_tasklist, ev)}>
			New list
		</SideNavigationItem>
	</TextTooltip>)

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_listaction_ref = r}>
			<MenuItem
				onClick={ev => {
					close_menu(menu_listaction_ref)
					command(Commands.rename_taskList, ev, selected_tasklist_index)
				}}
				icon_code={0xF0FB}>
				Rename list
			</MenuItem>
			<MenuItem
				onClick={ev => {
					close_menu(menu_listaction_ref)
					command(Commands.delete_taskList, ev, selected_tasklist_index)
				}}
				icon_code={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
	</>)

	return (<SideNavigation
		style={{"padding-top": '0'}}
		classList={add_classlist_module(CSS.side_navigation)}
		expanded={expanded()}
		footer={<Footer />}>
		<TransitionGroup
			onEnter={(el, done) => {
				promise_done(element_animate(
					element_first_element_child(el as HTMLElement)!,
					{ opacity: [0, 1], transform: ['translate(-12px)', 'none'] },
					animation_options
				).finished, done)
			}}
			onExit={(el, done) => {
				promise_done(element_animate(
					element_first_element_child(el as HTMLElement)!,
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
	</SideNavigation>)
}

export default _