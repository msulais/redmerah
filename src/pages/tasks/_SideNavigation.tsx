import { createMemo, createUniqueId, For, Show, type VoidComponent } from "solid-js"
import { TransitionGroup } from "solid-transition-group"

import type { Settings, TaskList } from "./_types"
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_constants"
import { elementAnimate, elementDataset, elementFirstChild, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { Commands, Pages } from "./_enums"
import { eventCurrentTarget, eventPreventDefault } from "@/utils/event"
import { AnimationEffectTiming } from "@/enums/animation"
import { arrayFilter, arrayIncludes, arrayLength } from "@/utils/array"
import { attrClassListModule } from "@/utils/attributes"
import { promiseDone } from "@/utils/object"
import { documentActive } from "@/utils/document"
import { numberIsNotDefined, numberParse, numberSafe } from "@/utils/number"
import { ICON_ADD, ICON_DELETE, ICON_TASK_LIST_SQUARE_LTR, ICON_TEXT_EDIT_STYLE } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Divider from "@/components/Divider"
import Emoji from "@/components/Emoji"
import Menu, { closeMenu, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'
import { animationIsOn } from "@/utils/animation"

const _: VoidComponent<{
	expanded: boolean
	tasklists: TaskList[]
	page: Pages | number
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const animationOptions = {
		duration: 200,
		easing: AnimationEffectTiming.spring
	}
	const expanded = createMemo(() => props.expanded)
	const buttonNewListId = createUniqueId()
	let selectdTaskListIndex = 0
	let menuListActionRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	const Page: VoidComponent<{ type: Pages, text: string, icon: number}> = ($props) => {
		return (<SideNavigationItem
			c:iconCode={$props.icon}
			data-tooltip={!expanded()? $props.text : undefined}
			c:selected={props.page == $props.type}
			data-page={$props.type}>
			{$props.text}
		</SideNavigationItem>)
	}

	const Item: VoidComponent<TaskList & {index: number}> = ($props) => {
		return (<SideNavigationItem
			data-tooltip={!expanded()? $props.name : undefined}
			c:iconCode={$props.emoji == null? ICON_TASK_LIST_SQUARE_LTR : undefined}
			c:leading={<Show when={$props.emoji != null}><Emoji c:emoji={$props.emoji!} /></Show>}
			c:selected={props.page == $props.id}
			data-list-id={$props.id}
			data-index={$props.index}>
			{$props.name}
		</SideNavigationItem>)
	}

	const Footer: VoidComponent = () => (<SideNavigationItem
		c:iconCode={ICON_ADD}
		id={buttonNewListId}
		data-tooltip={!expanded()? "Add new list" : undefined}>
		New list
	</SideNavigationItem>)

	const Menus: VoidComponent = () => {
		const buttonRenameListId = createUniqueId()
		const buttonDeleteListId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuListActionRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonRenameListId:
						command(Commands.renameTaskList, selectdTaskListIndex)
						closeMenu(menuListActionRef)
						break
					case buttonDeleteListId:
						command(Commands.deleteTaskList, selectdTaskListIndex)
						closeMenu(menuListActionRef)
						break
					}
				}}>
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
			</Menu>
		</>)
	}

	return (<Tooltip><SideNavigation
		style={{"padding-top": '0'}}
		classList={attrClassListModule(CSS.side_navigation)}
		c:expanded={expanded()}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			switch (elementId(button)) {
			case buttonNewListId:
				command(Commands.addTaskList)
				break
			default:
				const data_list_id = elementDataset(button, 'listId')
				if (data_list_id) {
					const list_id = numberParse(data_list_id)
					if (numberIsNotDefined(list_id)) return

					command(Commands.updatePage, list_id)
				}

				const data_page = elementDataset(button, 'page')
				if (data_page) {
					command(Commands.updatePage, data_page)
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

			const data_list_id = elementDataset(button, 'listId')
			if (data_list_id) {
				eventPreventDefault(ev)
				openMenu(menuListActionRef, {position: MenuPosition.centerBottomToRight})
				const data_index = elementDataset(button, 'index')
				if (data_index) {
					const index = numberSafe(numberParse(data_index))
					selectdTaskListIndex = index
				}
			}
		}}
		c:footer={<Footer />}>
		<TransitionGroup
			onEnter={(el, done) => {
				if (!animationIsOn()) return done()

				promiseDone(elementAnimate(
					elementFirstChild(el as HTMLElement)!,
					{ opacity: [0, 1], transform: ['translate(-12px)', 'none'] },
					animationOptions
				).finished, done)
			}}
			onExit={(el, done) => {
				if (!animationIsOn()) return done()

				promiseDone(elementAnimate(
					elementFirstChild(el as HTMLElement)!,
					{ opacity: 0, transform: 'translate(-12px)'},
					animationOptions
				).finished, done)
			}}>
			<For each={arrayFilter(TASKS_PAGES, page => !arrayIncludes(props.settings.hiddenNavigation, page.type))}>
				{p => <Page {...p}/>}
			</For>
		</TransitionGroup>
		<Show when={arrayLength(props.tasklists) - 1 > 0}><Divider /></Show>
		<For each={props.tasklists}>{(p, i) =>
			<Show when={p.id != DEFAULT_TASK_LIST.id}>
				<Item {...p} index={i()}/>
			</Show>
		}</For>
		<Menus/>
	</SideNavigation></Tooltip>)
}

export default _