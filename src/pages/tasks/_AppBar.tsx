import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings, Task, TaskList } from "./_types"
import { Commands, Pages } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { setAttrIfExist, joinClassListModule } from "@/utils/attributes"
import { DEFAULT_TASK_LIST, SIZE_SIDE_NAVIGATION_NONE, TASKS_PAGES } from "./_constants"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { isTargetValidElement } from "@/utils/element"
import { isValidEnumValue } from "@/utils/object"
import { isNumberNotDefined } from "@/utils/number"
import { timeWait } from "@/utils/time"
import { AnimationData } from "@/enums/animation"
import { APP_TASKS as app } from "@/constants/apps"
import { ICON_ADD, ICON_APPS, ICON_CHAT, ICON_CIRCLE, ICON_DISMISS, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SEARCH, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TAG, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import AppBar from "@/components/AppBar"
import Icon from "@/components/Icon"
import Menu, { LinkMenuItem, MenuDivider, MenuItem, MenuHeader, SubMenu, MenuIndent, SubMenuItem, closeMenu, openMenu, SwitchMenuItem } from "@/components/Menu"
import { IconButton } from "@/components/Button"
import { Tooltip } from "@/components/Tooltip"
import Divider from "@/components/Divider"
import Emoji from "@/components/Emoji"
import { closeSearchTextFieldMenu, SearchMenuDivider, SearchMenuHeader, SearchMenuItem, SearchTextField, SearchTextFieldButton } from "@/components/TextField"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	taskLists: TaskList[]
	page: Pages | number
	isSideNavigationExpanded: boolean
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = document.documentElement
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSearching, setIsSearching] = createSignal<boolean>(false)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [searchText, setSearchText] = createSignal<string>('')
	const taskLists = createMemo(() => props.taskLists)
	const settings = createMemo(() => props.settings)
	const getSearchResult = createMemo<(Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[]>(() => {
		if (searchText() == '') return []

		const regex = new RegExp(searchText()
			.replace(/[\\\.\[\]\(\)$*^+?\{\}|]/gs,s => '\\' + s)
			.replace(/ +/gs, '|'), 'i'
		)

		const result: (Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[] = []
		for (let i = 0; i < taskLists().length; i++) {
			const list = taskLists()[i]
			const tasks: (Task & {index: number})[] = []
			tasks: for (let j = 0; j < list.tasks.length; j++) {
				const task = list.tasks[j]
				if (!regex.test(task.name)) continue tasks;

				tasks.push({...task, index: j})
			}

			if (tasks.length == 0) continue;

			result.push({
				emoji: list.emoji,
				id: list.id,
				index: i,
				name: list.name,
				tasks
			})
		}

		return result
	})
	let isSearchTextField_MenuOpen = false
	let timeSearchId: number | NodeJS.Timeout | null = null
	let drawerNavigationRef: HTMLDialogElement
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let searchTextFieldRef: HTMLInputElement
	let searchTextField_menuRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(window
			.window.matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`)
			.matches
		)

		window
		.window.matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`)
		.addEventListener(
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		root.setAttribute(RootAttributes.animation, animation)
		localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		root.setAttribute(RootAttributes.theme, theme)
		localStorage.setItem(LocalStorageKeys.platformTheme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		root.setAttribute(RootAttributes.corner, corner)
		localStorage.setItem(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (theme && isValidEnumValue(theme, ThemeData)) {
			root.setAttribute(RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = localStorage.getItem(LocalStorageKeys.corner)
		if (corner && isValidEnumValue(corner, CornerData)) {
			root.setAttribute(RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (animation && isValidEnumValue(animation, AnimationData)) {
			root.setAttribute(RootAttributes.animation, animation)
			setAnimation(animation as AnimationData)
		}
	}

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
		initAnimation()
	})

	const Menus: VoidComponent = () => {
		const buttonMore_shareId = createUniqueId()
		const buttonSettings_labelId = createUniqueId()
		const buttonSettings_deleteTaskWarningId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonMore_shareId:

						navigator.share({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: document.location.origin + app.link
						})
						break
					}

					closeMenu(menuInfoRef)
				}}
				style={{width: '200px'}}
				ref={r => menuInfoRef = r}
				c:onToggleOpen={(v) => setIsMenuInfoOpen(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					c:leading={<img src={logoRedmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c:iconCode={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c:iconCode={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={buttonMore_shareId}
					c:iconCode={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURI('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {new Date().getFullYear()} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onChange={ev => {
					const target = ev.target as HTMLInputElement

					switch (target.id) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					}
				}}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonSettings_labelId:
						closeMenu(menuSettingsRef)
						command(Commands.showLabelsOptions)
						break
					case buttonSettings_deleteTaskWarningId:
						command(Commands.toggleDeleteTaskWarning)
						break
					default:
						const dataset = button.dataset
						const dataTheme = dataset.theme
						if (dataTheme) return updateTheme(dataTheme as ThemeData)

						const dataCorner = dataset.corner
						if (dataCorner) return updateCorner(dataCorner as CornerData)

						const dataPageIndex = dataset.pageIndex
						if (dataPageIndex) {
							const page = TASKS_PAGES.slice(1)[Number.parseFloat(dataPageIndex)]
							const pageType = page.type
							const hiddenNavigation = settings().hiddenNavigation
							const hidden = hiddenNavigation.includes(pageType)
							command(Commands.updateHiddenNavigation, hidden
								? hiddenNavigation.filter(a => a != pageType)
								: [...hiddenNavigation, pageType]
							)
							return
						}
					}

				}}>
				<SwitchMenuItem
					c:checked={animation() === AnimationData.on}
					c:iconCode={ICON_PLAY_CIRCLE_HINT}
					c:attrSwitch={{id: inputSettings_animationId}}>
					Animation
				</SwitchMenuItem>
				<SubMenu
					c:item={<SubMenuItem
						c:iconCode={ICON_WEATHER_SUNNY}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c:selected={theme() == ThemeData.light}
						c:iconCode={ICON_WEATHER_SUNNY}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.dark}
						c:iconCode={ICON_WEATHER_MOON}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.system}
						c:iconCode={ICON_LAPTOP_SETTINGS}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					c:item={<SubMenuItem
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c:selected={corner() == CornerData.sharp}
						c:iconCode={ICON_MAXIMIZE}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.semiRound}
						c:iconCode={ICON_SQUARE}
						data-corner={CornerData.semiRound}>
						Semi round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.round}
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.fullRound}
						c:iconCode={ICON_CIRCLE}
						data-corner={CornerData.fullRound}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuItem
					id={buttonSettings_labelId}
					c:iconCode={ICON_TAG}>
					Labels
				</MenuItem>
				<MenuDivider />
				<MenuHeader>Navigation</MenuHeader>
				<For each={TASKS_PAGES.slice(1)}>{(page, i) =>
					<MenuItem
						data-page-index={i()}
						c:checked={!settings().hiddenNavigation.includes(page.type)}>
						{page.text}
					</MenuItem>
				}</For>
				<MenuDivider />
				<MenuHeader>Dialog warning</MenuHeader>
				<MenuItem
					c:checked={settings().showDeleteTaskWarning}
					id={buttonSettings_deleteTaskWarningId}
					c:trailing={<MenuIndent />}>
					Show delete task warning
				</MenuItem>
			</Menu>
		</>)
	}

	const AppBars = () => {
		const buttonAppBar_menuListId = createUniqueId()
		const buttonAppBar_menuInfoId = createUniqueId()
		const buttonAppBar_menuSettingsId = createUniqueId()
		const buttonAppBar_searchId = createUniqueId()
		return (<Tooltip>
			<AppBar
				data-search={setAttrIfExist(isSearching())}
				classList={joinClassListModule(CSS.appbar)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonAppBar_menuListId:
						if (isSideNavigationHidden()) return openDrawer(drawerNavigationRef)

						command(Commands.toggleNavigationExpand)
						break
					case buttonAppBar_searchId:
						setIsSearching(true)
						searchTextFieldRef.focus()
						break
					case buttonAppBar_menuInfoId:
						openMenu(menuInfoRef, {anchor: button})
						break
					case buttonAppBar_menuSettingsId:
						openMenu(menuSettingsRef, {anchor: button})
						break
					}
				}}
				c:leading={<>
					<IconButton
						data-tooltip={isSideNavigationHidden()
							? "Open navigation"
							: `${props.isSideNavigationExpanded? 'Shrink' : 'Expand'} navigation`
						}
						id={buttonAppBar_menuListId}
						classList={joinClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
					<img alt={app.name + ' logo'} width={32} src={app.logoUrl} />
				</>}
				c:headline={app.name}
				c:trailing={<>
					<IconButton
						data-tooltip="Search tasks"
						id={buttonAppBar_searchId}
						classList={joinClassListModule(CSS.appbar_search_btn)}
						c:code={ICON_SEARCH}
					/>
					<IconButton
						data-tooltip="Info"
						id={buttonAppBar_menuInfoId}
						c:focused={isMenuInfoOpen()}
						c:code={ICON_INFO}
					/>
					<IconButton
						data-tooltip="Settings"
						id={buttonAppBar_menuSettingsId}
						classList={joinClassListModule(CSSAnimation.btn_rotate_icon)}
						c:focused={isMenuSettingsOpen()}
						c:code={ICON_SETTINGS}
					/>
				</>}>
				<div class={CSS.appbar_search}>
					<SearchTextField
						placeholder="Search tasks"
						ref={r => searchTextFieldRef = r}
						c:leading={<Icon c:code={ICON_SEARCH}/>}
						c:attrMenu={{
							ref: r => searchTextField_menuRef = r,
							'c:onToggleOpen': isOpen => isSearchTextField_MenuOpen = isOpen,
							onClick: async (ev) => {
								const button = document.activeElement! as HTMLButtonElement
								if (!isTargetValidElement(
									ev.currentTarget,
									button,
								)) return

								const dataListId = button.dataset.listId
								if (!dataListId) return

								const listId = Number.parseFloat(dataListId)
								if (isNumberNotDefined(listId)) return

								searchTextFieldRef.blur()
								if (isSearchTextField_MenuOpen) {
									closeSearchTextFieldMenu(searchTextField_menuRef)
									await timeWait(200)
								}
								setIsSearching(false)
								command(
									Commands.updatePage,
									listId == DEFAULT_TASK_LIST.id? Pages.tasks : listId
								)
							}
						}}
						c:result={<For each={getSearchResult()}>{(list, i) => <>
							<Show when={i() > 0}><SearchMenuDivider /></Show>
							<SearchMenuHeader>{list.name}</SearchMenuHeader>
							<For each={list.tasks}>{task =>
								<SearchMenuItem
									c:checked={task.complete}
									data-list-id={list.id}>
									{task.name}
								</SearchMenuItem>
							}</For>
						</>}</For>}
						onInput={(ev) => {
							const text = ev.currentTarget.value
							if (timeSearchId != null) clearTimeout(timeSearchId)

							timeSearchId = setTimeout(() => {
								setSearchText(text.trim())
								timeSearchId = null
							}, 1000)
						}}
						onFocus={() => command(Commands.getAllTask)}
						c:trailing={<Show when={isSideNavigationHidden() && isSearching()}>
							<SearchTextFieldButton
								data-tooltip="Close search"
								onClick={async () => {
									searchTextFieldRef.blur()
									if (isSearchTextField_MenuOpen) {
										closeSearchTextFieldMenu(searchTextField_menuRef)
										await timeWait(200)
									}
									setIsSearching(false)
								}}>
								<Icon c:code={ICON_DISMISS}/>
							</SearchTextFieldButton>
						</Show>}
					/>
				</div>
			</AppBar>
		</Tooltip>)
	}

	const Drawers = () => {
		const buttonDrawer_closeId = createUniqueId()
		const buttonDrawer_newListId = createUniqueId()
		return (<Drawer
			onClick={ev => {
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
				)) return

				switch (button.id) {
				case buttonDrawer_closeId:
					closeDrawer(drawerNavigationRef)
					break
				case buttonDrawer_newListId:
					closeDrawer(drawerNavigationRef)
					command(Commands.addTaskList)
					break
				default:
					const dataset = button.dataset
					const dataPage = dataset.page
					if (dataPage) {
						closeDrawer(drawerNavigationRef)
						if (props.page == dataPage) return;

						command(Commands.updatePage, dataPage)
						return
					}

					const dataListId = dataset.listId
					if (dataListId) {
						const listId = Number.parseFloat(dataListId)
						if (isNumberNotDefined(listId)) return

						closeDrawer(drawerNavigationRef)
						if (props.page == listId) return

						command(Commands.updatePage, listId)
						return
					}
				}
			}}
			c:header={<Tooltip>
				<IconButton
					id={buttonDrawer_closeId}
					data-tooltip="Close navigation"
					classList={joinClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
					c:code={ICON_LINE_HORIZONTAL_3}
				/>
			</Tooltip>}
			c:footer={<DrawerItem
				c:leading={<Icon c:code={ICON_ADD}/>}
				id={buttonDrawer_newListId}>
				New list
			</DrawerItem>}
			ref={r => drawerNavigationRef = r}>
			<For each={TASKS_PAGES.filter(page => !settings().hiddenNavigation.includes(page.type))}>{p =>
				<DrawerItem
					c:iconCode={p.icon}
					c:selected={props.page == p.type}
					data-page={p.type}>
					{p.text}
				</DrawerItem>
			}</For>
			<Show when={taskLists().length - 1 > 0}><Divider /></Show>
			<For each={taskLists().filter(v => v.id != DEFAULT_TASK_LIST.id)}>{p =>
				<DrawerItem
					c:leading={<Show when={p.emoji != null}><Emoji c:emoji={p.emoji!} /></Show>}
					c:selected={props.page == p.id}
					data-list-id={p.id}>
					{p.name}
				</DrawerItem>
			}</For>
		</Drawer>)
	}

	return (<>
		<AppBars />
		<Menus />
		<Drawers />
	</>)
}

export default _