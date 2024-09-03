import { createMemo, createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings, Task, TaskList } from "./_types";
import { _about, _apps, _blur, _calculator, _centerBottomToLeft, _change, _command, _complete, _contactEmail, _corner, _currentTarget, _dark, _donate, _emoji, _expand, _expandNavigation, _filled, _filter, _focus, _fullRound, _getFullYear, _hiddenNavigation, _home, _icon, _id, _includes, _isNotebookExpand, _isShowDeleteTaskWarning, _isSideNavigationExpanded, _length, _light, _matches, _name, _note, _onChangeCalculator, _open, _page, _privacy, _push, _replace, _round, _semiRound, _settings, _share, _sharp, _slice, _src, _system, _taskLists, _tasks, _terms, _test, _text, _theme, _trim, _type, _URL, _value } from "@/data/string";
import { Commands, Pages } from "./_enums";
import { getDocument, getNavigator, getRoot } from "@/data/window";
import { RootAttributes } from "@/enums/attributes";
import { CornerData } from "@/enums/corner";
import { LocalStorageKeys } from "@/enums/storage";
import { ThemeData } from "@/enums/theme";
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage";
import { setAttribute, toggleAttribute } from "@/utils/attributes";
import { DEFAULT_TASK_LIST, SIZE_SIDE_NAVIGATION_NONE, TASKS_PAGES } from "./_constants";
import { isMatchMedia, matchMedia } from "@/utils/window";
import { addEventListener } from '@/utils/event'
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout";
import { RoutesLinks, ExternalLinks } from "@/enums/links";
import { encodeURL } from "@/utils/url";
import { addClassListModule } from "@/utils/element";
import logo from '@/assets/apps/tasks-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import AppBar from "@/components/AppBar";
import Icon from "@/components/Icon";
import Menu, { LinkMenuItem, MenuDivider, MenuItem, MenuHeader, SubMenu, MenuIndent, closeSubMenu, closeMenu, MenuPosition, openMenu } from "@/components/Menu";
import { IconButton } from "@/components/Button";
import { TextTooltip } from "@/components/Tooltip";
import Divider from "@/components/Divider";
import Emoji from "@/components/Emoji";
import { closeSearchMenu, SearchMenuDivider, SearchMenuHeader, SearchMenuItem, SearchTextField, SearchTextFieldButton } from "@/components/TextField";
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer";
import CSSAnimation from "@/styles/animation.module.scss";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
    taskLists: TaskList[]
    page: Pages | number
    isSideNavigationExpanded: boolean
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_menu_themeSettings_open, setIs_menu_themeSettings_open] = createSignal<boolean>(false)
    const [is_menu_cornerSettings_open, setIs_menu_cornerSettings_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [isSearching, setIsSearching] = createSignal<boolean>(false)
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [searchText, setSearchText] = createSignal<string>('')
    const getSearchResult = createMemo<(Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[]>(() => {
        if (searchText() == '') return []

        const regex = new RegExp(searchText()
            [_replace](/[\\\.\[\]\(\)$*^+?\{\}|]/gs, s => '\\' + s)
            [_replace](/ +/gs, '|')
        , 'i')

        const result: (Omit<TaskList, 'tasks'> & {index: number, tasks: (Task & {index: number})[]})[] = []
        for (let i = 0; i < props[_taskLists][_length]; i++) {
            const list = props[_taskLists][i]
            const tasks: (Task & {index: number})[] = []
            tasks: for (let j = 0; j < list[_tasks][_length]; j++) {
                const task = list[_tasks][j]
                if (!regex[_test](task[_name])) continue tasks;

                tasks[_push]({...task, index: j})
            }

            if (tasks[_length] == 0) continue;
            result[_push]({ emoji: list[_emoji], id: list[_id], index: i, name: list[_name], tasks })
        }

        return result
    })
    let is_searchTextFieldMenu_open = false
    let searchTimeoutId: number | null = null
    let drawer_navigation_ref: HTMLDialogElement
    let menu_info_ref: HTMLDialogElement
    let menu_settings_ref: HTMLDialogElement
    let submenu_theme_ref: HTMLDivElement
    let submenu_corner_ref: HTMLDivElement
    let searchTextField_ref: HTMLInputElement
    let searchTextFieldMenu_ref: HTMLDivElement

    function initSideNavigationListener(): void {
        setIsSideNavigationHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), _change, ev => setIsSideNavigationHidden((ev as MediaQueryListEvent)[_matches]))
    }

    async function changeTheme(theme: ThemeData): Promise<void> {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        closeSubMenu(submenu_theme_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    async function changeCorner(corner: CornerData): Promise<void> {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
        closeSubMenu(submenu_corner_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    function initTheme(): void {
        const theme = getLocalStorageItem(LocalStorageKeys[_theme])

        if (theme && [ThemeData[_system], ThemeData[_light], ThemeData[_dark]][_includes](theme as ThemeData)) {
            setAttribute(getRoot(), RootAttributes[_theme], theme)
            setTheme(theme as ThemeData)
        }
    }

    function initCorner(): void {
        const corner = getLocalStorageItem(LocalStorageKeys[_corner])

        if (corner && [CornerData[_sharp], CornerData[_semiRound], CornerData[_round], CornerData[_fullRound]][_includes](corner as CornerData)) {
            setAttribute(getRoot(), RootAttributes[_corner], corner)
            setCorner(corner as CornerData)
        }
    }

    onMount(() => {
        initTheme()
        initCorner()
        initSideNavigationListener()
    })

    const Menus: VoidComponent = () => {
        return (<>
            <Menu
                style={{width: '200px'}}
                ref={r => menu_info_ref = r}
                onToggleOpen={(v) => setIs_menu_info_open(v)}>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={RoutesLinks[_home]}
                    leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                    Redmerah
                </LinkMenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={RoutesLinks[_apps]}
                    iconCode={0xE063}>
                    More apps
                </LinkMenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={RoutesLinks[_about]}
                    iconCode={0xE930}>
                    About us
                </LinkMenuItem>
                <MenuDivider />
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={RoutesLinks[_privacy]}
                    iconCode={0xEE51}>
                    Privacy policy
                </LinkMenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={RoutesLinks[_terms]}
                    iconCode={0xED47}>
                    Terms & conditions
                </LinkMenuItem>
                <MenuDivider />
                <MenuItem
                    onClick={() => {
                        getNavigator()[_share]({ title: 'Tasks', text: 'Tasks', url: getDocument()[_URL] })
                        closeMenu(menu_info_ref)
                    }}
                    iconCode={0xEE23}>
                    Share
                </MenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Tasks')}
                    iconCode={0xE3A0}>
                    Send feedback
                </LinkMenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={ExternalLinks[_donate]}
                    openInNewTab
                    iconCode={0xE84B}>
                    Donate
                </LinkMenuItem>
                <MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
            </Menu>

            <Menu ref={r => menu_settings_ref = r} onToggleOpen={(v) => setIs_menu_settings_open(v)}>
                <SubMenu
                    level={1}
                    ref={r => submenu_theme_ref = r}
                    onToggleOpen={v => setIs_menu_themeSettings_open(v)}
                    item={<MenuItem
                        focused={is_menu_themeSettings_open()}
                        iconCode={0xE28A}
                        trailing={<Icon filled code={0xE368}/>}>
                        Theme
                    </MenuItem>}>
                    <MenuItem
                        selected={theme() == ThemeData[_light]}
                        iconCode={0xF2CD}
                        onClick={() => changeTheme(ThemeData[_light])}>
                        Light
                    </MenuItem>
                    <MenuItem
                        selected={theme() == ThemeData[_dark]}
                        iconCode={0xF2B3}
                        onClick={() => changeTheme(ThemeData[_dark])}>
                        Dark
                    </MenuItem>
                    <MenuItem
                        selected={theme() == ThemeData[_system]}
                        iconCode={0xE96D}
                        onClick={() => changeTheme(ThemeData[_system])}>
                        System theme
                    </MenuItem>
                </SubMenu>
                <SubMenu
                    level={1}
                    ref={r => submenu_corner_ref = r}
                    onToggleOpen={v => setIs_menu_cornerSettings_open(v)}
                    item={<MenuItem
                        focused={is_menu_cornerSettings_open()}
                        iconCode={0xF044}
                        trailing={<Icon filled code={0xE368}/>}>
                        Corner style
                    </MenuItem>}>
                    <MenuItem
                        selected={corner() == CornerData[_sharp]}
                        iconCode={0xEA99}
                        onClick={() => changeCorner(CornerData[_sharp])}>
                        Sharp
                    </MenuItem>
                    <MenuItem
                        selected={corner() == CornerData[_semiRound]}
                        iconCode={0xEEF7}
                        onClick={() => changeCorner(CornerData[_semiRound])}>
                        Semi round
                    </MenuItem>
                    <MenuItem
                        selected={corner() == CornerData[_round]}
                        iconCode={0xF044}
                        onClick={() => changeCorner(CornerData[_round])}>
                        Round
                    </MenuItem>
                    <MenuItem
                        selected={corner() == CornerData[_fullRound]}
                        iconCode={0xE408}
                        onClick={() => changeCorner(CornerData[_fullRound])}>
                        Full round
                    </MenuItem>
                </SubMenu>
                <MenuItem
                    onClick={ev => {
                        closeMenu(menu_settings_ref)
                        props[_command](Commands.show_labels_options, ev)
                    }}
                    iconCode={0xF00D}>
                    Labels
                </MenuItem>
                <MenuDivider />
                <MenuHeader>Navigation</MenuHeader>
                <For each={TASKS_PAGES[_slice](1)}>{page =>
                    <MenuItem
                        onClick={() => {
                            const hiddenNavigation = props[_settings][_hiddenNavigation]
                            const hidden = hiddenNavigation[_includes](page[_type])
                            props[_command](Commands.change_hiddenNavigation, hidden
                                ? hiddenNavigation[_filter](a => a != page[_type])
                                : [...hiddenNavigation, page[_type]]
                            )
                        }}
                        checked={!props[_settings][_hiddenNavigation][_includes](page[_type])}>
                        {page[_text]}
                    </MenuItem>
                }</For>
                <MenuDivider />
                <MenuHeader>Dialog warning</MenuHeader>
                <MenuItem
                    checked={props[_settings][_isShowDeleteTaskWarning]}
                    trailing={<MenuIndent />}
                    onClick={() => props[_command](Commands.toggle_deleteTaskWarning)}>
                    Show delete task warning
                </MenuItem>
            </Menu>
        </>)
    }

    return (<>
        <AppBar
            data-search={toggleAttribute(isSearching())}
            classList={addClassListModule(CSS.appbar)}
            leading={<>
                <TextTooltip text={isSideNavigationHidden()
                    ? "Open navigation"
                    : `${props[_isSideNavigationExpanded]? 'Shrink' : 'Expand'} navigation`
                }>
                    <IconButton
                        classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
                        onClick={(ev) => {
                            if (isSideNavigationHidden()) return openDrawer(ev, drawer_navigation_ref)
                            props[_command](Commands.toggle_navigation_expand)
                        }}
                        code={0xEAFF}
                    />
                </TextTooltip>
                <img alt="Tasks logo" width={32} height={32} src={logo[_src]} />
            </>}
            headline="Tasks"
            trailing={<>
                <TextTooltip text="Search tasks">
                    <IconButton
                        onClick={() => {
                            setIsSearching(true)
                            searchTextField_ref[_focus]()
                        }}
                        classList={addClassListModule(CSS.appbar_search_btn)}
                        code={0xEDDF}
                    />
                </TextTooltip>
                <TextTooltip text="Info">
                    <IconButton
                        focused={is_menu_info_open()}
                        code={0xE930}
                        onClick={ev => openMenu(ev, menu_info_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: MenuPosition[_centerBottomToLeft]
                        })}
                    />
                </TextTooltip>
                <TextTooltip text="Settings">
                    <IconButton
                        classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
                        focused={is_menu_settings_open()}
                        onClick={ev => openMenu(ev, menu_settings_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: MenuPosition[_centerBottomToLeft]
                        })}
                        code={0xEE0F}
                    />
                </TextTooltip>
            </>}>
            <div class={CSS.appbar_search}>
                <SearchTextField
                    placeholder="Search tasks"
                    ref={r => searchTextField_ref = r}
                    leading={<Icon code={0xEDDF}/>}
                    result={<For each={getSearchResult()}>{(list, i) => <>
                        <Show when={i() > 0}><SearchMenuDivider /></Show>
                        <SearchMenuHeader>{list[_name]}</SearchMenuHeader>
                        <For each={list[_tasks]}>{task =>
                            <SearchMenuItem
                                checked={task[_complete]}
                                onClick={async () => {
                                    searchTextField_ref[_blur]()
                                    if (is_searchTextFieldMenu_open) {
                                        closeSearchMenu(searchTextFieldMenu_ref)
                                        await timeout(300)
                                    }
                                    setIsSearching(false)
                                    props[_command](
                                        Commands.change_page,
                                        list[_id] == DEFAULT_TASK_LIST[_id]? Pages[_tasks] : list[_id]
                                    )
                                }}>
                                {task[_name]}
                            </SearchMenuItem>
                        }</For>
                    </>}</For>}
                    onInput={(ev) => {
                        const text = ev[_currentTarget][_value]
                        if (searchTimeoutId != null) clearTimeDelayed(searchTimeoutId)

                        searchTimeoutId = setTimeDelayed(() => {
                            setSearchText(text[_trim]())
                            searchTimeoutId = null
                        }, 1000)
                    }}
                    onFocus={() => props[_command](Commands.get_all_task)}
                    menuAttr={{
                        ref: r => searchTextFieldMenu_ref = r,
                        onToggleOpen: isOpen => is_searchTextFieldMenu_open = isOpen
                    }}
                    trailing={<Show when={isSideNavigationHidden() && isSearching()}>
                        <TextTooltip text="Close search">
                            <SearchTextFieldButton
                                onClick={async () => {
                                    searchTextField_ref[_blur]()
                                    if (is_searchTextFieldMenu_open) {
                                        closeSearchMenu(searchTextFieldMenu_ref)
                                        await timeout(300)
                                    }
                                    setIsSearching(false)
                                }}>
                                <Icon code={0xE5E9}/>
                            </SearchTextFieldButton>
                        </TextTooltip>
                    </Show>}
                />
            </div>
        </AppBar>
        <Menus />
        <Drawer
            header={<TextTooltip text="Close navigation">
                <IconButton
                    classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
                    onClick={() => closeDrawer(drawer_navigation_ref)}
                    code={0xEAFF}
                />
            </TextTooltip>}
            footer={<DrawerItem
                leading={<Icon code={0xE007}/>}
                onClick={(ev) => {
                    closeDrawer(drawer_navigation_ref)
                    props[_command](Commands.add_taskList, ev)
                }}>
                New list
            </DrawerItem>}
            ref={r => drawer_navigation_ref = r}>
            <For each={TASKS_PAGES[_filter](page => !props[_settings][_hiddenNavigation][_includes](page[_type]))}>{p =>
                <DrawerItem
                    iconCode={p[_icon]}
                    selected={props[_page] == p[_type]}
                    onClick={() => {
                        closeDrawer(drawer_navigation_ref)
                        if (props[_page] == p[_type]) return;
                        props[_command](Commands.change_page, p[_type])
                    }}>
                    {p[_text]}
                </DrawerItem>
            }</For>
            <Show when={props[_taskLists][_length] - 1 > 0}><Divider /></Show>
            <For each={props[_taskLists][_filter](v => v[_id] != DEFAULT_TASK_LIST[_id])}>{p =>
                <DrawerItem
                    leading={<Show when={p[_emoji] != null}><Emoji emoji={p[_emoji]!} /></Show>}
                    selected={props[_page] == p[_id]}
                    onClick={() => {
                        closeDrawer(drawer_navigation_ref)
                        if (props[_page] == p[_id]) return;

                        props[_command](Commands.change_page, p[_id])
                    }}>
                    {p[_name]}
                </DrawerItem>
            }</For>
        </Drawer>
    </>)
}

export default _