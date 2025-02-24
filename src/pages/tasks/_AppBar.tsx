import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings, Task, TaskList } from "./_types"
import { Commands, Pages } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { attrSet, attrSetIfExist, attrClassListModule } from "@/utils/attributes"
import { DEFAULT_TASK_LIST, SIZE_SIDE_NAVIGATION_NONE, TASKS_PAGES } from "./_constants"
import { windowMatches, windowMatchMedia } from "@/utils/window"
import { eventListenerAdd, eventCurrentTarget, eventTarget } from '@/utils/event'
import { timeTimerClear, timeTimerSet, timeWait } from "@/utils/time"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { urlEncode, urlOrigin } from "@/utils/url"
import { elementBlur, elementDataset, elementFocus, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { stringReplace, stringTrim } from "@/utils/string"
import { documentActive, documentRoot } from "@/utils/document"
import { arrayFilter, arrayIncludes, arrayLength, arrayPush, arraySlice } from "@/utils/array"
import { regexTest } from "@/utils/regex"
import { dateYear } from "@/utils/datetime"
import { navigatorShare } from "@/utils/navigator"
import { validEnumValue } from "@/utils/object"
import { numberIsNotDefined, numberParse } from "@/utils/number"
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
	const root = documentRoot()
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

		const regex = new RegExp(stringReplace(
			stringReplace(
				searchText(),
				/[\\\.\[\]\(\)$*^+?\{\}|]/gs,
				s => '\\' + s
			),
			/ +/gs,
			'|'
		), 'i')

		const result: (Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[] = []
		for (let i = 0; i < arrayLength(taskLists()); i++) {
			const list = taskLists()[i]
			const tasks: (Task & {index: number})[] = []
			tasks: for (let j = 0; j < arrayLength(list.tasks); j++) {
				const task = list.tasks[j]
				if (!regexTest(regex, task.name)) continue tasks;

				arrayPush(tasks, {...task, index: j})
			}

			if (arrayLength(tasks) == 0) continue;

			arrayPush(result, {
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
	let timeSearchId: number | null = null
	let drawerNavigationRef: HTMLDialogElement
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let searchTextFieldRef: HTMLInputElement
	let searchTextField_menuRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(windowMatches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		eventListenerAdd(
			windowMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		attrSet(root, RootAttributes.animation, animation)
		storageSet(LocalStorageKeys.animation, animation)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		attrSet(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		attrSet(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = storageGet(LocalStorageKeys.theme)
		if (theme && validEnumValue(theme, ThemeData)) {
			attrSet(root, RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = storageGet(LocalStorageKeys.corner)
		if (corner && validEnumValue(corner, CornerData)) {
			attrSet(root, RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function initAnimation(): void {
		const animation = storageGet(LocalStorageKeys.animation)
		if (animation && validEnumValue(animation, AnimationData)) {
			attrSet(root, RootAttributes.animation, animation)
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => {
							const tagname = elementTagName(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (elementId(button)) {
					case buttonMore_shareId:
						navigatorShare({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: urlOrigin() + app.link
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
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + urlEncode('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {dateYear(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					}
				}}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonSettings_labelId:
						closeMenu(menuSettingsRef)
						command(Commands.showLabelsOptions)
						break
					case buttonSettings_deleteTaskWarningId:
						command(Commands.toggleDeleteTaskWarning)
						break
					default:
						const dataTheme = elementDataset(button, 'theme')
						if (dataTheme) return updateTheme(dataTheme as ThemeData)

						const dataCorner = elementDataset(button, 'corner')
						if (dataCorner) return updateCorner(dataCorner as CornerData)

						const dataPageIndex = elementDataset(button, 'pageIndex')
						if (dataPageIndex) {
							const page = arraySlice(TASKS_PAGES, 1)[numberParse(dataPageIndex)]
							const pageType = page.type
							const hiddenNavigation = settings().hiddenNavigation
							const hidden = arrayIncludes(hiddenNavigation, pageType)
							command(Commands.updateHiddenNavigation, hidden
								? arrayFilter(hiddenNavigation, a => a != pageType)
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
				<For each={arraySlice(TASKS_PAGES, 1)}>{(page, i) =>
					<MenuItem
						data-page-index={i()}
						c:checked={!arrayIncludes(settings().hiddenNavigation, page.type)}>
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
				data-search={attrSetIfExist(isSearching())}
				classList={attrClassListModule(CSS.appbar)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonAppBar_menuListId:
						if (isSideNavigationHidden()) return openDrawer(drawerNavigationRef)

						command(Commands.toggleNavigationExpand)
						break
					case buttonAppBar_searchId:
						setIsSearching(true)
						elementFocus(searchTextFieldRef)
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
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
					<img alt="Tasks logo" width={32} src={app.logoUrl} />
				</>}
				c:headline="Tasks"
				c:trailing={<>
					<IconButton
						data-tooltip="Search tasks"
						id={buttonAppBar_searchId}
						classList={attrClassListModule(CSS.appbar_search_btn)}
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
						classList={attrClassListModule(CSSAnimation.btn_rotate_icon)}
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
							'c:onToggleOpen': is_open => isSearchTextField_MenuOpen = is_open,
							onClick: async (ev) => {
								const button = documentActive()!
								if (!elementValidTarget(
									eventCurrentTarget(ev),
									button,
									el => elementTagName(el) == 'BUTTON'
								)) return

								const dataListId = elementDataset(button, 'listId')
								if (!dataListId) return

								const listId = numberParse(dataListId)
								if (numberIsNotDefined(listId)) return

								elementBlur(searchTextFieldRef)
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
							const text = eventCurrentTarget(ev).value
							if (timeSearchId != null) timeTimerClear(timeSearchId)

							timeSearchId = timeTimerSet(() => {
								setSearchText(stringTrim(text))
								timeSearchId = null
							}, 1000)
						}}
						onFocus={() => command(Commands.getAllTask)}
						c:trailing={<Show when={isSideNavigationHidden() && isSearching()}>
							<SearchTextFieldButton
								data-tooltip="Close search"
								onClick={async () => {
									elementBlur(searchTextFieldRef)
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
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonDrawer_closeId:
					closeDrawer(drawerNavigationRef)
					break
				case buttonDrawer_newListId:
					closeDrawer(drawerNavigationRef)
					command(Commands.addTaskList)
					break
				default:
					const dataPage = elementDataset(button, 'page')
					if (dataPage) {
						closeDrawer(drawerNavigationRef)
						if (props.page == dataPage) return;

						command(Commands.updatePage, dataPage)
						return
					}

					const dataListId = elementDataset(button, 'listId')
					if (dataListId) {
						const list_id = numberParse(dataListId)
						if (numberIsNotDefined(list_id)) return

						closeDrawer(drawerNavigationRef)
						if (props.page == list_id) return

						command(Commands.updatePage, list_id)
						return
					}
				}
			}}
			c:header={<Tooltip>
				<IconButton
					id={buttonDrawer_closeId}
					data-tooltip="Close navigation"
					classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
					c:code={ICON_LINE_HORIZONTAL_3}
				/>
			</Tooltip>}
			c:footer={<DrawerItem
				c:leading={<Icon c:code={ICON_ADD}/>}
				id={buttonDrawer_newListId}>
				New list
			</DrawerItem>}
			ref={r => drawerNavigationRef = r}>
			<For each={arrayFilter(TASKS_PAGES, page => !arrayIncludes(settings().hiddenNavigation, page.type))}>{p =>
				<DrawerItem
					c:iconCode={p.icon}
					c:selected={props.page == p.type}
					data-page={p.type}>
					{p.text}
				</DrawerItem>
			}</For>
			<Show when={arrayLength(taskLists()) - 1 > 0}><Divider /></Show>
			<For each={arrayFilter(taskLists(), v => v.id != DEFAULT_TASK_LIST.id)}>{p =>
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