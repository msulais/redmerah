import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { _accentDark, _accentLight, _clipboard, _corner, _currentTarget, _dark, _filled, _fullRound, _includes, _join, _length, _light, _onAccentDark, _onAccentLight, _onCopyAll, _outlined, _palette, _paletteList, _round, _seed, _semiRound, _share, _sharp, _src, _system, _theme, _URL, _writeText } from "@/data/string"
import { getDocument, getNavigator, getRoot } from "@/data/window"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { closePopover, openPopover } from "@/utils/popover"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "solid-js/web"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { toggleAttribute } from "@/utils/attributes"
import { getDate_Y } from "@/utils/datetime"
import { encodeURL } from "@/utils/url"
import { addClassListModule } from "@/utils/element"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { openModal } from "@/utils/modal"
import { _dialog_colorList_ref, _colorPicker_ref } from "./_string"
import redmerahLogo from '@/assets/logo.svg'
import logo from '@/assets/apps/color-generator-logo.svg'

import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { NestedMenu, MenuItem, MenuDivider, MenuItemLink, MenuHeader } from "@/components/Menu"
import AppBar from "@/components/AppBar"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

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
    const [button_addColor_ref, set_button_addColor_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_copyAll_ref, set_button_copyAll_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_settings_ref, set_button_settings_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_selectColor_ref, set_button_selectColor_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_colorList_ref, set_button_colorList_ref] = createSignal<HTMLButtonElement | null>(null)
    let menu_settings_ref: HTMLElement
    let menu_themeSettings_ref: HTMLElement
    let menu_cornerSettings_ref: HTMLElement

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
    })
    
    return (<>
        <AppBar
            leading={<>
                <Show when={props[_paletteList][_length] > 0}>
                    <Tooltip anchor={button_colorList_ref()} text='Color list' />
                    <Button iconOnly ref={r => set_button_colorList_ref(r)} onClick={(ev) => openModal(ev, props[_dialog_colorList_ref])}><Icon code={0xF098}/></Button>
                </Show>
                <img width={28} src={logo[_src]} alt="Color generator" />
            </>}
            headline="Color Generator"
            trailing={<>

                <Tooltip anchor={button_selectColor_ref()} text='Select color' />
                <Button classList={addClassListModule(CSS.appbar_select_color)} ref={r => set_button_selectColor_ref(r)} variant={ButtonVariant[_filled]} onClick={(ev) => openPopover({
                        event: ev,
                        anchor: ev[_currentTarget],
                        popover: props[_colorPicker_ref],
                    })}>
                    {props[_seed]}
                </Button>

                <Tooltip anchor={button_addColor_ref()} text='Add color to list' />
                <Button ref={r => set_button_addColor_ref(r)} onClick={() => {
                    if (timeoutId()) {
                        clearTimeDelayed(timeoutId()!)
                        setTimeoutId(null)
                    }
                    props.onAddColor()
                    setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
                }} iconOnly><Show when={timeoutId()} fallback={<Icon code={0xF08A}/>}><Icon code={0xE3D8}/></Show></Button>

                <Tooltip anchor={button_copyAll_ref()} text='Copy all' />
                <Button
                    iconOnly
                    ref={r => set_button_copyAll_ref(r)}
                    onClick={() => copyAll()}>
                    <Show when={copyTimeoutId()} fallback={<Icon code={0xE51B}/>}>
                        <Icon code={0xE3D8}/>
                    </Show>
                </Button>

                <Tooltip anchor={button_settings_ref()} text='Open settings' />
                <Button
                    iconOnly
                    classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
                    ref={r => set_button_settings_ref(r)}
                    focus={is_menu_settings_open()}
                    onClick={ev => openPopover({
                        event: ev,
                        anchor: ev[_currentTarget],
                        popover: menu_settings_ref,
                    })}>
                    <Icon code={0xEE0F}/>
                </Button>
            </>}
        />
        <Menu ref={r => menu_settings_ref = r} onToggle={(v) => setIs_menu_settings_open(v)}>
            <NestedMenu
                level={1}
                ref={r => menu_themeSettings_ref = r}
                onToggle={v => setIs_menu_themeSettings_open(v)}
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
            </NestedMenu>
            <NestedMenu
                level={1}
                ref={r => menu_cornerSettings_ref = r}
                onToggle={v => setIs_cornerSettings_open(v)}
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
            </NestedMenu>
            <MenuDivider />
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={RoutesLinks.home}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                Redmerah (homepage)
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={RoutesLinks.apps}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE063}/>}>
                More apps
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={RoutesLinks.about}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE930}/>}>
                About us
            </MenuItemLink>
            <MenuDivider />
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={RoutesLinks.privacy}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xEE51}/>}>
                Privacy policy
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={RoutesLinks.terms}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xED47}/>}>
                Terms & conditions
            </MenuItemLink>
            <MenuDivider/>
            <MenuItem
                onClick={() => {
                    getNavigator()[_share]({text: 'Color Generator', url: getDocument()[_URL]})
                    closePopover(menu_settings_ref)
                }}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURL('Color Generator')}
                leading={<Icon code={0xE3A0}/>}>
                Send feedback
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(menu_settings_ref)}
                href={ExternalLinks.donate}
                openInNewTab
                leading={<Icon code={0xE84B}/>}>
                Donate
            </MenuItemLink>
            <MenuHeader>&copy; {getDate_Y()} Redmerah</MenuHeader>
        </Menu>
    </>)
}

export default _AppBar