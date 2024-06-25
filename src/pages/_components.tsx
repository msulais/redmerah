import { createSignal, onMount, type VoidComponent } from "solid-js";

import { _CENTER_BOTTOM_TO_RIGHT, _CENTER_CENTER_LEFT_TOP, _LEFT_CENTER_TO_BOTTOM, _color, _color_accent, _corner, _currentTarget, _dark, _fullRound, _includes, _innerHTML, _light, _outlined, _round, _semiRound, _sharp, _system, _theme } from "@/data/string";
import { ThemeData } from "@/enums/theme";
import { setAttribute, toggleAttribute } from "@/utils/attributes";
import { getRoot } from "@/data/window";
import { RootAttributes } from "@/enums/attributes";
import { LocalStorageKeys } from "@/enums/storage";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage";
import { closePopover, openPopover } from "@/utils/popover";
import { PopoverPosition } from "@/enums/position";
import { CornerData } from "@/enums/corner";
import { ElementIds } from "@/enums/ids";
import type { HEXColor, RGBColor } from "@/types/color";
import { generateColor, hexToRgb, testHexColor } from "@/utils/color";
import { addClassListModule, getElementById } from "@/utils/element";

import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Menu, { MenuDivider, MenuHeader, MenuItem } from "@/components/Menu";
import ColorPicker, { changeColorPickerValue } from "@/components/ColorPicker";
import CSSAnimation from '@/styles/animation.module.scss'

export const SettingsElement: VoidComponent = () => {
    const [color, setColor] = createSignal<HEXColor>('#FF0000')
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [settingsBtnRef, setSettingsBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = createSignal<boolean>(false)
    const [isColorPickerMenuOpen, setIsColorPickerMenuOpen] = createSignal<boolean>(false)
    let settingsMenuRef: HTMLDialogElement
    let colorPickerMenuRef: HTMLDialogElement

    function changeTheme(theme: ThemeData): void {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        closePopover(settingsMenuRef)
    }

    function changeCorner(corner: CornerData): void {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
        closePopover(settingsMenuRef)
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
--color-acc-light: ${rgbToCSSValue(hexToRgb(acc.color))};
--color-acc-dark: ${rgbToCSSValue(hexToRgb(acc.colorDark))};
--color-on-acc-light: ${rgbToCSSValue(hexToRgb(acc.onColor))};
--color-on-acc-dark: ${rgbToCSSValue(hexToRgb(acc.onColorDark))};
}`;
        setLocalStorageItem(LocalStorageKeys[_color], hexColor)
        closePopover(settingsMenuRef)
    }

    function initColor(): void {
        const color = getLocalStorageItem(LocalStorageKeys[_color])

        try {
            testHexColor(color ?? '')
            changeColor(color as HEXColor)
            changeColorPickerValue(colorPickerMenuRef, color as HEXColor)
        } catch (e) {}
    }

    onMount(() => {
        initTheme()
        initCorner()
        initColor()
    })

    return (<>
        <Tooltip anchor={settingsBtnRef()} text="Open settings" />
        <Button 
            focus={isSettingsMenuOpen()} 
            ref={r => setSettingsBtnRef(r)} 
            classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
            iconOnly 
            onClick={(ev) => openPopover({
                event: ev, 
                anchor: ev[_currentTarget], 
                popover: settingsMenuRef, 
                padding: 0,
                position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
            })}>
            <Icon code={0xEE0F}/>
        </Button>
        <Menu style={{width: '200px'}} ref={r => settingsMenuRef = r} onToggle={(v) => setIsSettingsMenuOpen(v)}>
            <MenuHeader>Theme</MenuHeader>
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
            <MenuDivider />
            <MenuHeader>Corner style</MenuHeader>
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
            <MenuDivider/>
            <MenuHeader>Accent color</MenuHeader>
            <MenuItem data-focus={toggleAttribute(isColorPickerMenuOpen())} onClick={(ev) => openPopover({
                event: ev, 
                anchor: ev[_currentTarget], 
                popover: colorPickerMenuRef, 
                position: PopoverPosition[_LEFT_CENTER_TO_BOTTOM]
            })} leading={<Icon style={{color: color()}} filled code={0xE408}/>}>{color()}</MenuItem>
        </Menu>
        <ColorPicker disabledColorControl disabledOpacityControl onSelectColor={v => changeColor(v)} ref={r => colorPickerMenuRef = r} onToggle={(v) => setIsColorPickerMenuOpen(v)} />
    </>)
}