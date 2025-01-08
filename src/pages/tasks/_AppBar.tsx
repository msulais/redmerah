import { createMemo, createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings, Task, TaskList } from "./_types"
import { Commands, Pages } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set, attr_set_if_exist, classlist_module } from "@/utils/attributes"
import { DEFAULT_TASK_LIST, SIZE_SIDE_NAVIGATION_NONE, TASKS_PAGES } from "./_constants"
import { window_matches, window_match_media } from "@/utils/window"
import { event_add_listener, event_current_target } from '@/utils/event'
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode, url_origin } from "@/utils/url"
import { element_blur, element_dataset, element_focus, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { string_replace, string_trim } from "@/utils/string"
import { document_active, document_root } from "@/utils/document"
import { array_filter, array_includes, array_length, array_push, array_slice } from "@/utils/array"
import { regex_test } from "@/utils/regex"
import { date_year } from "@/utils/datetime"
import { navigator_share } from "@/utils/navigator"
import { promise_done } from "@/utils/object"
import { number_is_not_defined, number_parse } from "@/utils/number"
import { app_tasks as app } from "@/constants/apps"
import logo from '@/assets/apps/tasks-logo.svg'
import redmerah_logo from '@/assets/logo.svg'

import AppBar from "@/components/AppBar"
import Icon from "@/components/Icon"
import Menu, { LinkMenuItem, MenuDivider, MenuItem, MenuHeader, SubMenu, MenuIndent, SubMenuItem, close_menu, close_submenu, open_menu } from "@/components/Menu"
import { IconButton } from "@/components/Button"
import { Tooltip } from "@/components/Tooltip"
import Divider from "@/components/Divider"
import Emoji from "@/components/Emoji"
import { close_searchtextfieldmenu, SearchMenuDivider, SearchMenuHeader, SearchMenuItem, SearchTextField, SearchTextFieldButton } from "@/components/TextField"
import Drawer, { close_drawer, DrawerItem, open_drawer } from "@/components/Drawer"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	tasklists: TaskList[]
	page: Pages | number
	is_side_navigation_expanded: boolean
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round
	const root = document_root()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_searching, set_is_searching] = createSignal<boolean>(false)
	const [is_side_navigation_hidden, set_is_side_navigation_hidden] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const [search_text, set_search_text] = createSignal<string>('')
	const tasklists = createMemo(() => props.tasklists)
	const settings = createMemo(() => props.settings)
	const get_search_result = createMemo<(Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[]>(() => {
		if (search_text() == '') return []

		const regex = new RegExp(string_replace(
			string_replace(
				search_text(),
				/[\\\.\[\]\(\)$*^+?\{\}|]/gs,
				s => '\\' + s
			),
			/ +/gs,
			'|'
		), 'i')

		const result: (Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[] = []
		for (let i = 0; i < array_length(tasklists()); i++) {
			const list = tasklists()[i]
			const tasks: (Task & {index: number})[] = []
			tasks: for (let j = 0; j < array_length(list.tasks); j++) {
				const task = list.tasks[j]
				if (!regex_test(regex, task.name)) continue tasks;

				array_push(tasks, {...task, index: j})
			}

			if (array_length(tasks) == 0) continue;

			array_push(result, {
				emoji: list.emoji,
				id: list.id,
				index: i,
				name: list.name,
				tasks
			})
		}

		return result
	})
	let is_searchtextfield_menu_open = false
	let timeout_search_id: number | null = null
	let drawer_navigation_ref: HTMLDialogElement
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let searchtextfield_ref: HTMLInputElement
	let searchtextfield_menu_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function init_sidenavigation_listener(): void {
		set_is_side_navigation_hidden(window_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(
			window_match_media(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => set_is_side_navigation_hidden((ev as MediaQueryListEvent).matches)
		)
	}

	function change_theme(theme: ThemeData): void {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		promise_done(wait(300), () => close_menu(menu_settings_ref))
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		promise_done(wait(300), () => close_menu(menu_settings_ref))
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && array_includes([theme_system, theme_light, theme_dark], theme as ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([
			corner_sharp,
			corner_semiround,
			corner_round,
			corner_fullround
		], corner as CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	onMount(() => {
		init_theme()
		init_corner()
		init_sidenavigation_listener()
	})

	const Menus: VoidComponent = () => {
		const button_more_share_id = createUniqueId()
		const button_settings_label_id = createUniqueId()
		const button_settings_deletetaskwarning_id = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => {
							const tagname = element_tagname(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (element_id(button)) {
						case button_more_share_id:
							navigator_share({
								title: app.name,
								text: app.name + ' v' + app.build_version,
								url: url_origin() + app.link
							})
							break
					}

					close_menu(menu_info_ref)
				}}
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				on_toggle_open={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					leading={<img src={redmerah_logo.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_more_share_id}
					icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					open_in_new_tab
					icon_code={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				on_toggle_open={(v) => set_is_menu_settings_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_settings_label_id:
							close_menu(menu_settings_ref)
							command(Commands.show_labels_options, ev)
							break
						case button_settings_deletetaskwarning_id:
							command(Commands.toggle_delete_task_warning)
							break
						default:
							const data_theme = element_dataset(button, 'theme')
							if (data_theme) return change_theme(data_theme as ThemeData)

							const data_corner = element_dataset(button, 'corner')
							if (data_corner) return change_corner(data_corner as CornerData)

							const data_page_index = element_dataset(button, 'pageIndex')
							if (data_page_index) {
								const page = array_slice(TASKS_PAGES, 1)[number_parse(data_page_index)]
								const page_type = page.type
								const hidden_navigation = settings().hidden_navigation
								const hidden = array_includes(hidden_navigation, page_type)
								command(Commands.change_hidden_navigation, hidden
									? array_filter(hidden_navigation, a => a != page_type)
									: [...hidden_navigation, page_type]
								)
								return
							}
					}

				}}>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					on_toggle_open={v => set_is_submenu_themesettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_themesettings_open()}
						icon_code={0xE28A}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						selected={theme() == theme_light}
						icon_code={0xF2CD}
						data-theme={theme_light}>
						Light
					</MenuItem>
					<MenuItem
						selected={theme() == theme_dark}
						icon_code={0xF2B3}
						data-theme={theme_dark}>
						Dark
					</MenuItem>
					<MenuItem
						selected={theme() == theme_system}
						icon_code={0xE96D}
						data-theme={theme_system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					on_toggle_open={v => set_is_submenu_cornersettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_cornersettings_open()}
						icon_code={0xF044}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						selected={corner() == corner_sharp}
						icon_code={0xEA99}
						data-corner={corner_sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						selected={corner() == corner_semiround}
						icon_code={0xEEF7}
						data-corner={corner_semiround}>
						Semi round
					</MenuItem>
					<MenuItem
						selected={corner() == corner_round}
						icon_code={0xF044}
						data-corner={corner_round}>
						Round
					</MenuItem>
					<MenuItem
						selected={corner() == corner_fullround}
						icon_code={0xE408}
						data-corner={corner_fullround}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuItem
					id={button_settings_label_id}
					icon_code={0xF00D}>
					Labels
				</MenuItem>
				<MenuDivider />
				<MenuHeader>Navigation</MenuHeader>
				<For each={array_slice(TASKS_PAGES, 1)}>{(page, i) =>
					<MenuItem
						data-page-index={i()}
						checked={!array_includes(settings().hidden_navigation, page.type)}>
						{page.text}
					</MenuItem>
				}</For>
				<MenuDivider />
				<MenuHeader>Dialog warning</MenuHeader>
				<MenuItem
					checked={settings().is_show_deletetaskwarning}
					id={button_settings_deletetaskwarning_id}
					trailing={<MenuIndent />}>
					Show delete task warning
				</MenuItem>
			</Menu>
		</>)
	}

	const AppBars = () => {
		const button_appbar_menulist_id = createUniqueId()
		const button_appbar_menuinfo_id = createUniqueId()
		const button_appbar_menusettings_id = createUniqueId()
		const button_appbar_search_id = createUniqueId()
		return (<Tooltip>
			<AppBar
				data-search={attr_set_if_exist(is_searching())}
				classList={classlist_module(CSS.appbar)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_appbar_menulist_id:
							if (is_side_navigation_hidden()) return open_drawer(ev, drawer_navigation_ref)

							command(Commands.toggle_navigation_expand)
							break
						case button_appbar_search_id:
							set_is_searching(true)
							element_focus(searchtextfield_ref)
							break
						case button_appbar_menuinfo_id:
							open_menu(ev, menu_info_ref, {anchor: button})
							break
						case button_appbar_menusettings_id:
							open_menu(ev, menu_settings_ref, {anchor: button})
							break
					}
				}}
				leading={<>
					<IconButton
						data-tooltip={is_side_navigation_hidden()
							? "Open navigation"
							: `${props.is_side_navigation_expanded? 'Shrink' : 'Expand'} navigation`
						}
						id={button_appbar_menulist_id}
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						code={0xEAFF}
					/>
					<img alt="Tasks logo" width={32} src={logo.src} />
				</>}
				headline="Tasks"
				trailing={<>
					<IconButton
						data-tooltip="Search tasks"
						id={button_appbar_search_id}
						classList={classlist_module(CSS.appbar_search_btn)}
						code={0xEDDF}
					/>
					<IconButton
						data-tooltip="Info"
						id={button_appbar_menuinfo_id}
						focused={is_menu_info_open()}
						code={0xE930}
					/>
					<IconButton
						data-tooltip="Settings"
						id={button_appbar_menusettings_id}
						classList={classlist_module(CSSAnimation.btn_rotate_icon)}
						focused={is_menu_settings_open()}
						code={0xEE0F}
					/>
				</>}>
				<div class={CSS.appbar_search}>
					<SearchTextField
						placeholder="Search tasks"
						ref={r => searchtextfield_ref = r}
						leading={<Icon code={0xEDDF}/>}
						attr_menu={{
							ref: r => searchtextfield_menu_ref = r,
							on_toggle_open: is_open => is_searchtextfield_menu_open = is_open,
							onClick: async (ev) => {
								const button = document_active()!
								if (!element_valid_target(
									event_current_target(ev),
									button,
									el => element_tagname(el) == 'BUTTON'
								)) return

								const data_list_id = element_dataset(button, 'listId')
								if (!data_list_id) return

								const list_id = number_parse(data_list_id)
								if (number_is_not_defined(list_id)) return

								element_blur(searchtextfield_ref)
								if (is_searchtextfield_menu_open) {
									close_searchtextfieldmenu(searchtextfield_menu_ref)
									await wait(300)
								}
								set_is_searching(false)
								command(
									Commands.change_page,
									list_id == DEFAULT_TASK_LIST.id? Pages.tasks : list_id
								)
							}
						}}
						result={<For each={get_search_result()}>{(list, i) => <>
							<Show when={i() > 0}><SearchMenuDivider /></Show>
							<SearchMenuHeader>{list.name}</SearchMenuHeader>
							<For each={list.tasks}>{task =>
								<SearchMenuItem
									checked={task.complete}
									data-list-id={list.id}>
									{task.name}
								</SearchMenuItem>
							}</For>
						</>}</For>}
						onInput={(ev) => {
							const text = event_current_target(ev).value
							if (timeout_search_id != null) timeout_clear(timeout_search_id)

							timeout_search_id = timeout_set(() => {
								set_search_text(string_trim(text))
								timeout_search_id = null
							}, 1000)
						}}
						onFocus={() => command(Commands.get_all_task)}
						trailing={<Show when={is_side_navigation_hidden() && is_searching()}>
							<SearchTextFieldButton
								data-tooltip="Close search"
								onClick={async () => {
									element_blur(searchtextfield_ref)
									if (is_searchtextfield_menu_open) {
										close_searchtextfieldmenu(searchtextfield_menu_ref)
										await wait(300)
									}
									set_is_searching(false)
								}}>
								<Icon code={0xE5E9}/>
							</SearchTextFieldButton>
						</Show>}
					/>
				</div>
			</AppBar>
		</Tooltip>)
	}

	const Drawers = () => {
		const button_drawer_close_id = createUniqueId()
		const button_drawer_newlist_id = createUniqueId()
		return (<Drawer
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_drawer_close_id:
						close_drawer(drawer_navigation_ref)
						break
					case button_drawer_newlist_id:
						close_drawer(drawer_navigation_ref)
						command(Commands.add_tasklist, ev)
						break
					default:
						const data_page = element_dataset(button, 'page')
						if (data_page) {
							close_drawer(drawer_navigation_ref)
							if (props.page == data_page) return;

							command(Commands.change_page, data_page)
							return
						}

						const data_list_id = element_dataset(button, 'listId')
						if (data_list_id) {
							const list_id = number_parse(data_list_id)
							if (number_is_not_defined(list_id)) return

							close_drawer(drawer_navigation_ref)
							if (props.page == list_id) return

							command(Commands.change_page, list_id)
							return
						}
				}
			}}
			header={<Tooltip>
				<IconButton
					id={button_drawer_close_id}
					data-tooltip="Close navigation"
					classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
					code={0xEAFF}
				/>
			</Tooltip>}
			footer={<DrawerItem
				leading={<Icon code={0xE007}/>}
				id={button_drawer_newlist_id}>
				New list
			</DrawerItem>}
			ref={r => drawer_navigation_ref = r}>
			<For each={array_filter(TASKS_PAGES, page => !array_includes(settings().hidden_navigation, page.type))}>{p =>
				<DrawerItem
					icon_code={p.icon}
					selected={props.page == p.type}
					data-page={p.type}>
					{p.text}
				</DrawerItem>
			}</For>
			<Show when={array_length(tasklists()) - 1 > 0}><Divider /></Show>
			<For each={array_filter(tasklists(), v => v.id != DEFAULT_TASK_LIST.id)}>{p =>
				<DrawerItem
					leading={<Show when={p.emoji != null}><Emoji emoji={p.emoji!} /></Show>}
					selected={props.page == p.id}
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