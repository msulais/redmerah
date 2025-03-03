import { createMemo, createUniqueId, For, Show, type VoidComponent } from "solid-js"
import { TransitionGroup } from "solid-transition-group"

import type { Settings, TaskList } from "./_types"
import { DEFAULT_TASK_LIST, TASKS_PAGES } from "./_constants"
import { elementValidTarget } from "@/utils/element"
import { Commands, Pages } from "./_enums"
import { AnimationEffectTiming } from "@/enums/animation"
import { attrClassListModule } from "@/utils/attributes"
import { numberIsNotDefined, numberSafe } from "@/utils/number"
import { ICON_ADD, ICON_DELETE, ICON_TASK_LIST_SQUARE_LTR, ICON_TEXT_EDIT_STYLE } from "@/constants/icons"
import { animationIsOn } from "@/utils/animation"

import { Tooltip } from "@/components/Tooltip"
import Divider from "@/components/Divider"
import Emoji from "@/components/Emoji"
import Menu, { closeMenu, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

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
	let selectedTaskListIndex = 0
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
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonRenameListId:
						command(Commands.renameTaskList, selectedTaskListIndex)
						closeMenu(menuListActionRef)
						break
					case buttonDeleteListId:
						command(Commands.deleteTaskList, selectedTaskListIndex)
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
			const button = document.activeElement! as HTMLButtonElement
			if (!elementValidTarget(
				ev.currentTarget,
				button,
			)) return

			switch (button.id) {
			case buttonNewListId:
				command(Commands.addTaskList)
				break
			default:
				const dataListId = button.dataset.listId
				if (dataListId) {
					const listId = Number.parseInt(dataListId)
					if (numberIsNotDefined(listId)) return

					command(Commands.updatePage, listId)
				}

				const dataPage = button.dataset.page
				if (dataPage) {
					command(Commands.updatePage, dataPage)
					return
				}
			}
		}}
		onContextMenu={ev => {
			const button = document.activeElement! as HTMLButtonElement
			if (!elementValidTarget(
				ev.currentTarget,
				button,
			)) return

			const dataListId = button.dataset.listId
			if (dataListId) {
				ev.preventDefault()
				openMenu(menuListActionRef, {position: MenuPosition.centerBottomToRight})
				const dataIndex = button.dataset.index
				if (dataIndex) {
					const index = numberSafe(Number.parseInt(dataIndex))
					selectedTaskListIndex = index
				}
			}
		}}
		c:footer={<Footer />}>
		<TransitionGroup
			onEnter={(el, done) => {
				if (!animationIsOn()) return done()

				el.firstElementChild!.animate(
					{ opacity: [0, 1], transform: ['translate(-12px)', 'none'] },
					animationOptions
				).finished.then(done)
			}}
			onExit={(el, done) => {
				if (!animationIsOn()) return done()

				el.firstElementChild?.animate(
					{ opacity: 0, transform: 'translate(-12px)'},
					animationOptions
				).finished.then(done)
			}}>
			<For each={TASKS_PAGES.filter(
				page => !props.settings.hiddenNavigation.includes(page.type)
			)}>
				{p => <Page {...p}/>}
			</For>
		</TransitionGroup>
		<Show when={props.tasklists.length - 1 > 0}><Divider /></Show>
		<For each={props.tasklists}>{(p, i) =>
			<Show when={p.id != DEFAULT_TASK_LIST.id}>
				<Item {...p} index={i()}/>
			</Show>
		}</For>
		<Menus/>
	</SideNavigation></Tooltip>)
}

export default _