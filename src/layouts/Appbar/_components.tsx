import { createSignal, onMount, type VoidComponent } from "solid-js";

import Icon from "@/components/Icon";
import Button, { IconButton } from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Menu, { closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, openMenu } from "@/components/Menu";
import ColorPicker, { openColorPicker } from "@/components/ColorPicker";
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

import type { HEXColor, RGBColor } from "@/types/color";
import { _centerBottomToLeft, _centerBottomToRight, _centerCenterLeftTop, _leftCenterToBottom, _about, _apps, _clipboard, _color, _colorDark, _color_accent, _corner, _currentTarget, _dark, _donate, _filled, _filledTonal, _fullRound, _hostname, _includes, _innerHTML, _join, _light, _link, _onColor, _onColorDark, _open, _outlined, _pinnedApps, _round, _route, _semiRound, _share, _sharp, _some, _split, _system, _test, _theme, _title, _toLowerCase, _trim, _value, _writeText } from "@/data/string";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage";
import { generateColor, hexToRgb, testHexColor } from "@/utils/color";
import { setAttribute, toggleAttribute } from "@/utils/attributes";
import { ExternalLinks, RoutesLinks } from "@/enums/links";
import { LocalStorageKeys } from "@/enums/storage";
import { RootAttributes } from "@/enums/attributes";
import { addClassListModule, getElementById } from "@/utils/element";
import { ElementIds } from "@/enums/ids";
import { CornerData } from "@/enums/corner";
import { ThemeData } from "@/enums/theme";
import { getRoot } from "@/data/window";
import { FlyoutPosition } from "@/enums/position";
import { closePopover, openPopover } from "@/components/Popover";

type NavigationMenuProps = {
    route?: RoutesLinks
}

export const NavigationMenu: VoidComponent<NavigationMenuProps> = (props) => {
    const [button_navigation_ref, set_button_navigation_ref] = createSignal<HTMLButtonElement | null>(null)
    const [is_menu_navigation_open, setIs_menu_navigation_open] = createSignal<boolean>(false)
    let menu_navigation_ref: HTMLDialogElement

    return (<>
        <Tooltip text="Open navigation menu" anchor={button_navigation_ref()} />
        <IconButton 
            classList={addClassListModule(CSS.mobile_only)} 
            focus={is_menu_navigation_open()} 
            onClick={(ev) => openMenu(ev, menu_navigation_ref, {
                anchor: ev[_currentTarget], 
                padding: 0, 
                position: FlyoutPosition[_centerBottomToLeft]
            })} 
            ref={r => set_button_navigation_ref(r)} 
            code={0xE4F7}
        />
        <Menu 
            style={{width: '164px'}} 
            ref={r => menu_navigation_ref = r} 
            onToggleOpen={v => setIs_menu_navigation_open(v)}>
            <MenuHeader>Navigation</MenuHeader>
            <LinkMenuItem 
                href={RoutesLinks[_apps]} 
                selected={props[_route] == RoutesLinks[_apps]} 
                iconCode={0xE063}>
                Apps
            </LinkMenuItem>
            <LinkMenuItem 
                href={RoutesLinks[_about]} 
                selected={props[_route] == RoutesLinks[_about]} 
                iconCode={0xE930}>
                About
            </LinkMenuItem>
            <MenuDivider />
            <LinkMenuItem 
                onClick={() => closeMenu(menu_navigation_ref)} 
                href={ExternalLinks[_donate]} 
                openInNewTab 
                iconCode={0xE84B}>
                Donate
            </LinkMenuItem>
        </Menu>
    </>)
}

export const SettingsElement: VoidComponent = () => {
    const [color, setColor] = createSignal<HEXColor>('#FF0000')
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [button_settings_ref, set_button_settings_ref] = createSignal<HTMLButtonElement | null>(null)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [is_colorPicker_open, setIs_colorPicker_open] = createSignal<boolean>(false)
    let menu_settings_ref: HTMLDialogElement
    let colorPicker_ref: HTMLDialogElement

    function changeTheme(theme: ThemeData): void {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        closeMenu(menu_settings_ref)
    }

    function changeCorner(corner: CornerData): void {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
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

    function rgbToCSSValue(rgb: RGBColor): string {
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    function changeColor(hexColor: HEXColor): void {
        setColor(hexColor)
        const acc = generateColor(hexColor)
        const accentColorStyleEl = getElementById(ElementIds[_color_accent])!
        accentColorStyleEl[_innerHTML] = `:root{
--color-accent-light: ${rgbToCSSValue(hexToRgb(acc[_color]))};
--color-accent-dark: ${rgbToCSSValue(hexToRgb(acc[_colorDark]))};
--color-on-accent-light: ${rgbToCSSValue(hexToRgb(acc[_onColor]))};
--color-on-accent-dark: ${rgbToCSSValue(hexToRgb(acc[_onColorDark]))};
}`;
        setLocalStorageItem(LocalStorageKeys[_color], hexColor)
        closeMenu(menu_settings_ref)
    }

    function initColor(): void {
        const color = getLocalStorageItem(LocalStorageKeys[_color])

        try {
            testHexColor(color ?? '')
            changeColor(color as HEXColor)
        } catch (e) {}
    }

    onMount(() => {
        initTheme()
        initCorner()
        initColor()
    })

    return (<>
        <Tooltip anchor={button_settings_ref()} text="Open settings" />
        <IconButton 
            classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
            focus={is_menu_settings_open()} 
            ref={r => set_button_settings_ref(r)} 
            onClick={(ev) => openMenu(ev, menu_settings_ref, {
                anchor: ev[_currentTarget], 
                padding: 0,
                position: FlyoutPosition[_centerBottomToRight]
            })}
            code={0xEE0F}
        />
        <Menu 
            style={{width: '200px'}} 
            ref={r => menu_settings_ref = r} 
            onToggleOpen={(v) => setIs_menu_settings_open(v)}>
            <MenuHeader>Theme</MenuHeader>
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
            <MenuDivider />
            <MenuHeader>Corner style</MenuHeader>
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
            <MenuDivider/>
            <MenuHeader>Accent color</MenuHeader>
            <MenuItem 
                focus={is_colorPicker_open()} 
                onClick={(ev) => openColorPicker(ev, colorPicker_ref, {
                    anchor: ev[_currentTarget], 
                    position: FlyoutPosition[_leftCenterToBottom]
                })} 
                leading={<Icon style={{color: color()}} filled code={0xE408}/>}>
                {color()}
            </MenuItem>
        </Menu>
        <ColorPicker 
            disabledColorControl 
            disabledOpacityControl 
            onSelectColor={v => changeColor(v)} 
            ref={r => colorPicker_ref = r} 
            onToggleOpen={(v) => setIs_colorPicker_open(v)} 
            onClose={() => closeMenu(menu_settings_ref)}
        />
    </>)
}