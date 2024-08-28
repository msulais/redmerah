import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { _about, _accentDark, _accentLight, _apps, _clipboard, _contactEmail, _corner, _currentTarget, _dark, _donate, _filled, _fullRound, _home, _includes, _join, _length, _light, _onAccentDark, _onAccentLight, _onAddColor, _onCopyAll, _outlined, _palette, _paletteList, _privacy, _round, _seed, _semiRound, _share, _sharp, _src, _system, _terms, _theme, _URL, _writeText } from "@/data/string"
import { getDocument, getNavigator, getRoot } from "@/data/window"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "solid-js/web"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { toggleAttribute } from "@/utils/attributes"
import { getDate_Y } from "@/utils/datetime"
import { encodeURL } from "@/utils/url"
import { addClassListModule } from "@/utils/element"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { _dialog_colorList_ref, _colorPicker_ref } from "./_string"
import redmerahLogo from '@/assets/logo.svg'
import logo from '@/assets/apps/color-generator-logo.svg'

import Icon from "@/components/Icon"
import {TextTooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Menu, { SubMenu, MenuItem, MenuDivider, LinkMenuItem, MenuHeader, closeMenu, closeSubMenu, openMenu } from "@/components/Menu"
import AppBar from "@/components/AppBar"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'
import { openDialog } from "@/components/Dialog"
import { openColorPicker } from "@/components/ColorPicker"

type _AppBarProps = {
    onAddColor: () => unknown
    palette: Palette
    onColorChange: (color: HEXColor) => unknown
    paletteList: Palette[]
    colorPicker_ref: HTMLDialogElement
    dialog_colorList_ref: HTMLDialogElement
    seed: string
}

const _AppBar: VoidComponent<_AppBarProps> = (props) => {
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
    const [copyTimeoutId, setCopyTimeoutId] = createSignal<number | null>(null)
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [is_menu_themeSettings_open, setIs_menu_themeSettings_open] = createSignal<boolean>(false)
    const [is_menu_cornerSettings_open, setIs_cornerSettings_open] = createSignal<boolean>(false)
    let menu_settings_ref: HTMLDialogElement
    let submenu_themeSettings_ref: HTMLDivElement
    let submenu_cornerSettings_ref: HTMLDivElement

    async function copyAll(): Promise<void> {
        if (copyTimeoutId() != null) {
            clearTimeDelayed(copyTimeoutId()!)
            setCopyTimeoutId(null)
        }
        try {
            await getNavigator()[_clipboard][_writeText]([
                '--seed: ' + props[_palette][_seed],
                '--accent-light: ' + props[_palette][_accentLight],
                '--on-accent-light: ' + props[_palette][_onAccentLight],
                '--accent-dark: ' + props[_palette][_accentDark],
                '--on-accent-dark: ' + props[_palette][_onAccentDark],
            ][_join](';\n') + ';')
            setCopyTimeoutId(setTimeDelayed(() => setCopyTimeoutId(null), 2000))
        } catch (e) {}
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
    })
    
    return (<>
        <AppBar
            leading={<>
                <Show when={props[_paletteList][_length] > 0}>
                    <TextTooltip text='Color list'>
                        <IconButton 
                            onClick={(ev) => openDialog(ev, props[_dialog_colorList_ref])}
                            code={0xF098}
                        />
                    </TextTooltip>
                </Show>
                <img width={28} src={logo[_src]} alt="Color generator" />
            </>}
            headline="Color Generator"
            trailing={<>
                <TextTooltip text='Select color'>
                    <Button 
                        classList={addClassListModule(CSS.appbar_select_color)} 
                        variant={ButtonVariant[_filled]} 
                        onClick={(ev) => openColorPicker(ev, props[_colorPicker_ref], {anchor: ev[_currentTarget]})}>
                        {props[_seed]}
                    </Button>
                </TextTooltip>

                <TextTooltip text='Add color to list'>
                    <IconButton 
                        onClick={() => {
                            if (timeoutId()) {
                                clearTimeDelayed(timeoutId()!)
                                setTimeoutId(null)
                            }
                            props[_onAddColor]()
                            setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
                        }} 
                        code={timeoutId()? 0xE3D8 : 0xF08A}
                    />
                </TextTooltip>

                <TextTooltip text='Copy all'>
                    <IconButton
                        onClick={() => copyAll()}
                        code={copyTimeoutId()? 0xE3D8 : 0xE51B}
                    />
                </TextTooltip>

                <TextTooltip text='Open settings'>
                    <IconButton
                        classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
                        focused={is_menu_settings_open()}
                        onClick={ev => openMenu(ev, menu_settings_ref, { anchor: ev[_currentTarget] })}
                        code={0xEE0F} 
                    />
                </TextTooltip>
            </>}
        />
        <Menu 
            ref={r => menu_settings_ref = r} 
            onToggleOpen={(v) => setIs_menu_settings_open(v)}>
            <SubMenu
                level={1}
                ref={r => submenu_themeSettings_ref = r}
                onToggleOpen={v => setIs_menu_themeSettings_open(v)}
                item={<MenuItem
                    data-focus={toggleAttribute(is_menu_themeSettings_open())}
                    leading={<Icon filled code={0xE28A}/>}
                    trailing={<Icon filled code={0xE368}/>}>
                    Theme
                </MenuItem>}>
                <MenuItem
                    selected={theme() == ThemeData[_light]}
                    leading={<Icon code={0xF2CD}/>}
                    onClick={() => changeTheme(ThemeData[_light])}>
                    Light
                </MenuItem>
                <MenuItem
                    selected={theme() == ThemeData[_dark]}
                    leading={<Icon code={0xF2B3}/>}
                    onClick={() => changeTheme(ThemeData[_dark])}>
                    Dark
                </MenuItem>
                <MenuItem
                    selected={theme() == ThemeData[_system]}
                    leading={<Icon code={0xE96D}/>}
                    onClick={() => changeTheme(ThemeData[_system])}>
                    System theme
                </MenuItem>
            </SubMenu>
            <SubMenu
                level={1}
                ref={r => submenu_cornerSettings_ref = r}
                onToggleOpen={v => setIs_cornerSettings_open(v)}
                item={<MenuItem
                    data-focus={toggleAttribute(is_menu_cornerSettings_open())}
                    leading={<Icon code={0xF044}/>}
                    trailing={<Icon filled code={0xE368}/>}>
                    Corner style
                </MenuItem>}>
                <MenuItem
                    selected={corner() == CornerData[_sharp]}
                    leading={<Icon code={0xEA99}/>}
                    onClick={() => changeCorner(CornerData[_sharp])}>
                    Sharp
                </MenuItem>
                <MenuItem
                    selected={corner() == CornerData[_semiRound]}
                    leading={<Icon code={0xEEF7}/>}
                    onClick={() => changeCorner(CornerData[_semiRound])}>
                    Semi round
                </MenuItem>
                <MenuItem
                    selected={corner() == CornerData[_round]}
                    leading={<Icon code={0xF044}/>}
                    onClick={() => changeCorner(CornerData[_round])}>
                    Round
                </MenuItem>
                <MenuItem
                    selected={corner() == CornerData[_fullRound]}
                    leading={<Icon code={0xE408}/>}
                    onClick={() => changeCorner(CornerData[_fullRound])}>
                    Full round
                </MenuItem>
            </SubMenu>
            <MenuDivider />
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={RoutesLinks[_home]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                Redmerah (homepage)
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={RoutesLinks[_apps]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE063}/>}>
                More apps
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={RoutesLinks[_about]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE930}/>}>
                About us
            </LinkMenuItem>
            <MenuDivider />
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={RoutesLinks[_privacy]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xEE51}/>}>
                Privacy policy
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={RoutesLinks[_terms]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xED47}/>}>
                Terms & conditions
            </LinkMenuItem>
            <MenuDivider/>
            <MenuItem
                onClick={() => {
                    getNavigator()[_share]({text: 'Color Generator', title: 'Color Generator', url: getDocument()[_URL]})
                    closeMenu(menu_settings_ref)
                }}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Color Generator')}
                leading={<Icon code={0xE3A0}/>}>
                Send feedback
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_settings_ref)}
                href={ExternalLinks[_donate]}
                openInNewTab
                leading={<Icon code={0xE84B}/>}>
                Donate
            </LinkMenuItem>
            <MenuHeader>&copy; {getDate_Y()} Redmerah</MenuHeader>
        </Menu>
    </>)
}

export default _AppBar