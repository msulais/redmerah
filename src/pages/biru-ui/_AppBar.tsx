import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import { _system, _round, _change, _matches, _theme, _corner, _light, _dark, _includes, _sharp, _semiRound, _fullRound, _home, _src, _apps, _about, _privacy, _terms, _share, _URL, _contactEmail, _donate, _getFullYear, _currentTarget, _centerBottomToLeft, _command, _page, _text, _type } from "@/data/string"
import { getDocument, getNavigator, getRoot } from "@/data/window"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "@/utils/attributes"
import { isMatchMedia, matchMedia } from "@/utils/window"
import { addEventListener } from '@/utils/event'
import { FlyoutPosition } from "@/enums/position"
import { Commands, Pages } from "./_enums"
import { PAGES, SIZE_SIDE_NAVIGATION_NONE } from "./_data"
import { timeout } from "@/utils/timeout"
import { addClassListModule } from "@/utils/element"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { encodeURL } from "@/utils/url"
import logo from '@/assets/apps/biru-ui-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeSubMenu, closeMenu } from "@/components/Menu"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
    command: (type: Commands, ...args: unknown[]) => unknown
    page: Pages
}> = (props) => {
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_menu_themeSettings_open, setIs_menu_themeSettings_open] = createSignal<boolean>(false)
    const [is_menu_cornerSettings_open, setIs_menu_cornerSettings_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    let drawer_navigation_ref: HTMLDialogElement
    let menu_info_ref: HTMLDialogElement
    let menu_settings_ref: HTMLDialogElement
    let submenu_themeSettings_ref: HTMLDivElement
    let submenu_cornerSettings_ref: HTMLDivElement

    function initSideNavigationListener(): void {
        setIsSideNavigationHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), _change, ev => setIsSideNavigationHidden((ev as MediaQueryListEvent)[_matches]))
    }

    async function changeTheme(theme: ThemeData): Promise<void> {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        closeSubMenu(submenu_themeSettings_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    async function changeCorner(corner: CornerData): Promise<void> {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
        closeSubMenu(submenu_cornerSettings_ref)
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
                        getNavigator()[_share]({ title: 'BiruUI', text: 'BiruUI', url: getDocument()[_URL] })
                        closeMenu(menu_info_ref)
                    }}
                    iconCode={0xEE23}>
                    Share
                </MenuItem>
                <LinkMenuItem
                    onClick={() => closeMenu(menu_info_ref)}
                    href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('BiruUI')}
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

            <Menu 
                ref={r => menu_settings_ref = r} 
                onToggleOpen={(v) => setIs_menu_settings_open(v)}>
                <SubMenu
                    level={1}
                    ref={r => submenu_themeSettings_ref = r}
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
                    ref={r => submenu_cornerSettings_ref = r}
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
            </Menu>
        </>)
    }

    return (<>
        <AppBar 
            leading={<>
                <Show when={isSideNavigationHidden()}>
                    <Tooltip text="Open navigation">
                        <IconButton 
                            classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} 
                            onClick={(ev) => {
                                openDrawer(ev, drawer_navigation_ref)
                            }} 
                            code={0xEAFF} 
                        />
                    </Tooltip>
                </Show>
                <img alt="BiruUI logo" width={32} height={32} src={logo[_src]} />
            </>} 
            headline="BiruUI"
            trailing={<>
                <Tooltip text="Info">
                    <IconButton 
                        focused={is_menu_info_open()} 
                        code={0xE930}
                        onClick={(ev) => openMenu(ev, menu_info_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: FlyoutPosition[_centerBottomToLeft]
                        })} 
                    />
                </Tooltip>

                <Tooltip text="Settings">
                    <IconButton 
                        class={CSSAnimation.btn_rotate_icon} 
                        focused={is_menu_settings_open()} 
                        code={0xEE0F}
                        onClick={(ev) => openMenu(ev, menu_settings_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: FlyoutPosition[_centerBottomToLeft]
                        })} 
                    />
                </Tooltip>
            </>}
        >
        </AppBar>
        <Menus />
        <Drawer 
            header={<>
                <Tooltip text="Close navigation">
                    <IconButton 
                        classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} 
                        code={0xEAFF} 
                        onClick={() => closeDrawer(drawer_navigation_ref)}
                    />
                </Tooltip>
            </>}
            ref={r => drawer_navigation_ref = r}>
                <For each={PAGES}>{page => 
                    <DrawerItem 
                        onClick={() => {
                            props[_command](Commands.change_page, page[_type])
                            closeDrawer(drawer_navigation_ref)
                        }}
                        selected={props[_page] == page[_type]}>
                        {page[_text]}
                    </DrawerItem>
                }</For>
        </Drawer>
    </>)
}

export default _