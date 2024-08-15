import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import { _calculator, _CENTER_BOTTOM_TO_LEFT, _change, _command, _contactEmail, _corner, _currentTarget, _dark, _donate, _emoji, _expand, _expandNavigation, _filled, _filter, _fullRound, _getFullYear, _hiddenNavigation, _icon, _id, _includes, _isNotebookExpand, _isShowDeleteTaskWarning, _length, _light, _matches, _name, _note, _onChangeCalculator, _page, _round, _semiRound, _settings, _share, _sharp, _slice, _src, _system, _taskLists, _text, _theme, _type, _URL } from "@/data/string";
import { getDocument, getNavigator, getRoot } from "@/data/window";
import { RootAttributes } from "@/enums/attributes";
import { CornerData } from "@/enums/corner";
import { LocalStorageKeys } from "@/enums/storage";
import { ThemeData } from "@/enums/theme";
import { closePopover, openPopover } from "@/utils/popover";
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage";
import { setAttribute, toggleAttribute } from "@/utils/attributes";
import { DEFAULT_TASK_LIST, SIZE_SIDE_NAVIGATION_NONE, TASKS_PAGES } from "./_data";
import { isMatchMedia, matchMedia } from "@/utils/window";
import { addEventListener } from '@/utils/event'
import logo from '@/assets/apps/tasks-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import AppBar from "@/components/AppBar";
import Icon from "@/components/Icon";
import Menu, { MenuItemLink, MenuDivider, MenuItem, MenuHeader, NestedMenu, MenuIndent } from "@/components/Menu";
import { RoutesLinks, ExternalLinks } from "@/enums/links";
import { encodeURL } from "@/utils/url";
import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import { PopoverPosition } from "@/enums/position";
import { addClassListModule } from "@/utils/element";
import CSSAnimation from "@/styles/animation.module.scss";
import { Commands, Pages } from "./_enums";
import Drawer, { DrawerItem } from "@/components/Drawer";
import { closeModal, openModal } from "@/utils/modal";
import type { Settings, TaskList } from "./_types";
import Divider from "@/components/Divider";
import Emoji from "@/components/Emoji";
import TextField from "@/components/TextField";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
    taskLists: TaskList[]
    page: Pages | number
    expandNavigation: boolean
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [button_menu_ref, set_button_menu_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_info_ref, set_button_info_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_settings_ref, set_button_settings_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_closeNavigationDrawer_ref, set_button_closeNavigationDrawer_ref] = createSignal<HTMLButtonElement | null>(null)
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_menu_themeSettings_open, setIs_menu_themeSettings_open] = createSignal<boolean>(false)
    const [is_menu_cornerSettings_open, setIs_menu_cornerSettings_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    let drawer_navigation_ref: HTMLDialogElement
    let menu_info_ref: HTMLElement
    let menu_settings_ref: HTMLElement
    let menu_themeSettings_ref: HTMLElement
    let menu_cornerSettings_ref: HTMLElement

    function initSideNavigationListener(): void {
        setIsSideNavigationHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), _change, ev => setIsSideNavigationHidden((ev as MediaQueryListEvent)[_matches]))
    }

    async function changeTheme(theme: ThemeData): Promise<void> {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        await closePopover(menu_themeSettings_ref)
        await closePopover(menu_settings_ref)
    }

    async function changeCorner(corner: CornerData): Promise<void> {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
        await closePopover(menu_cornerSettings_ref)
        await closePopover(menu_settings_ref)
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
            <Menu style={{width: '200px'}} ref={r => menu_info_ref = r} onToggle={(v) => setIs_menu_info_open(v)}>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.home}
                    leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                    Redmerah
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.apps}
                    leading={<Icon code={0xE063}/>}>
                    More apps
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.about}
                    leading={<Icon code={0xE930}/>}>
                    About us
                </MenuItemLink>
                <MenuDivider />
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.privacy}
                    leading={<Icon code={0xEE51}/>}>
                    Privacy policy
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.terms}
                    leading={<Icon code={0xED47}/>}>
                    Terms & conditions
                </MenuItemLink>
                <MenuDivider />
                <MenuItem
                    onClick={() => {
                        getNavigator()[_share]({ title: 'Tasks', text: 'Tasks', url: getDocument()[_URL] })
                        closePopover(menu_info_ref)
                    }}
                    leading={<Icon code={0xEE23}/>}>
                    Share
                </MenuItem>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Tasks')}
                    leading={<Icon code={0xE3A0}/>}>
                    Send feedback
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={ExternalLinks[_donate]}
                    openInNewTab
                    leading={<Icon code={0xE84B}/>}>
                    Donate
                </MenuItemLink>
                <MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
            </Menu>

            <Menu ref={r => menu_settings_ref = r} onToggle={(v) => setIs_menu_settings_open(v)}>
                <NestedMenu
                    level={1}
                    ref={r => menu_themeSettings_ref = r}
                    onToggle={v => setIs_menu_themeSettings_open(v)}
                    item={<MenuItem
                        data-focus={toggleAttribute(is_menu_themeSettings_open())}
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
                </NestedMenu>
                <NestedMenu
                    level={1}
                    ref={r => menu_cornerSettings_ref = r}
                    onToggle={v => setIs_menu_cornerSettings_open(v)}
                    item={<MenuItem
                        focus={is_menu_cornerSettings_open()}
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
                </NestedMenu>
                <MenuItem 
                    onClick={ev => {
                        closePopover(menu_settings_ref)
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
            leading={<>
                <Tooltip text={isSideNavigationHidden()? "Open navigation" : `${props[_expandNavigation]? 'Shrink' : 'Expand'} navigation`} anchor={button_menu_ref()}/>
                <Button 
                    ref={r => set_button_menu_ref(r)} 
                    classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} 
                    onClick={(ev) => {
                        if (isSideNavigationHidden()) return openModal(ev, drawer_navigation_ref)
                        props[_command](Commands.toggle_navigation_expand)
                    }} 
                    iconOnly>
                    <Icon code={0xEAFF}/>
                </Button>
                <img alt="Tasks logo" width={32} height={32} src={logo[_src]} />
            </>} 
            headline="Tasks"
            trailing={<>
                
                <Tooltip text="Info" anchor={button_info_ref()}/>
                <Button ref={r => set_button_info_ref(r)} focus={is_menu_info_open()} iconOnly onClick={(ev) => openPopover({
                    event: ev,
                    anchor: ev[_currentTarget],
                    popover: menu_info_ref,
                    padding: 4,
                    position: PopoverPosition[_CENTER_BOTTOM_TO_LEFT]
                })}><Icon code={0xE930}/></Button>

                <Tooltip text="Settings" anchor={button_settings_ref()}/>
                <Button classList={addClassListModule(CSSAnimation.btn_rotate_icon)} ref={r => set_button_settings_ref(r)} focus={is_menu_settings_open()} iconOnly onClick={async (ev) => {
                    openPopover({
                        event: ev,
                        anchor: ev[_currentTarget],
                        popover: menu_settings_ref,
                        padding: 4,
                        position: PopoverPosition[_CENTER_BOTTOM_TO_LEFT]
                    })
                }}><Icon code={0xEE0F}/></Button>
            </>}
        >
            <div class={CSS.appbarSearch}>
                {/* TODO: search tasks */}
                <TextField 
                    placeholder="Search tasks" 
                    leading={<Icon code={0xEDDF}/>}
                />
            </div>
        </AppBar>
        <Menus />
        <Drawer 
            header={<>
                <Tooltip anchor={button_closeNavigationDrawer_ref()} text="Close navigation"/>
                <Button ref={r => set_button_closeNavigationDrawer_ref(r)} classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} iconOnly onClick={() => closeModal(drawer_navigation_ref)}><Icon code={0xEAFF}/></Button>
            </>}
            footer={<>
                <DrawerItem 
                    leading={<Icon code={0xE007}/>}>
                    New list
                </DrawerItem>
            </>}
            ref={r => drawer_navigation_ref = r}>
            <For each={TASKS_PAGES[_filter](page => !props[_settings][_hiddenNavigation][_includes](page[_type]))}>{p => 
                <DrawerItem 
                    iconCode={p[_icon]}
                    selected={props[_page] == p[_type]}
                    onClick={() => {
                        closeModal(drawer_navigation_ref)
                        if (props[_page] == p[_type]) return;
                        props[_command](Commands.change_page, p[_type])
                    }}>
                    {p[_text]}
                </DrawerItem>
            }</For>
            <Show when={props[_taskLists][_length] - 1 > 0}>
                <Divider />
            </Show>
            <For each={props[_taskLists][_filter](v => v[_id] != DEFAULT_TASK_LIST[_id])}>{p => 
                <DrawerItem
                    leading={<Show when={p[_emoji] != null}><Emoji emoji={p[_emoji]!} /></Show>} 
                    selected={props[_page] == p[_id]}
                    onClick={() => {
                        closeModal(drawer_navigation_ref)
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