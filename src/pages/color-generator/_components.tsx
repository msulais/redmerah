import { type Component, For, Show, type Signal, createSignal, createUniqueId, onMount, createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'

import { clearTimeDelayed, setTimeDelayed } from '@/utils/timeout'
import { closePopover, openPopover } from '@/utils/popover'
import { generateColor, hexToRgb, testHexColor } from '@/utils/color'
import { addClassListModule, getElementById } from '@/utils/element'
import { ExternalLinks, RoutesLinks } from '@/enums/links'
import { ThemeData } from '@/enums/theme'
import { RootAttributes } from '@/enums/attributes'
import { setAttribute, toggleAttribute } from '@/utils/attributes'
import type { HEXColor, RGBColor } from '@/types/color'
import { _system, _theme, _corner, _dark, _fullRound, _includes, _light, _round, _semiRound, _sharp, _src, _URL, _share, _currentTarget, _seed, _palletteList, _length, _outlined, _filledTonal, _color, _color_accent, _innerHTML, _toUpperCase, _colorDark, _onColor, _onColorDark, _clipboard, _writeText, _join, _push, _pallette, _filter, _filled } from '@/data/string'
import { getDocument, getNavigator, getRoot } from '@/data/window'
import { CornerData } from '@/enums/corner'
import { LocalStorageKeys } from '@/enums/storage'
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/storage'
import { getDate_Y } from '@/utils/datetime'
import { encodeURL } from '@/utils/url'
import { closeModal, openModal } from '@/utils/modal'
import { ElementIds } from '@/enums/ids'
import logo from '@/assets/apps/color-generator-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Tooltip from '@/components/Tooltip'
import Icon from '@/components/Icon'
import Button, { ButtonVariant } from '@/components/Button'
import List from '@/components/List'
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemLink, NestedMenu } from '@/components/Menu'
import ColorPicker, { changeColorPickerValue } from '@/components/ColorPicker'
import Dialog from '@/components/Dialog'
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

type Pallette = {
    seed: HEXColor
    accentLight: HEXColor
    onAccentLight: HEXColor
    accentDark: HEXColor
    onAccentDark: HEXColor
}

type AppBarProps = {
    onCopyAll: () => any
    onAddColor: () => any
    onColorChange: (color: HEXColor) => any
    palletteList: Pallette[]
    colorPickerId: string
    colorListDialogId: string
    seed: string
}

type BodyProps = Pallette

type BottomBarProps = {
    palletteList: Pallette[]
    colorPickerId: string
    colorListDialogId: string
    seed: string
}

const AppBar: Component<AppBarProps> = (props) => {
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [isSettingsFocus, setIsSettingsFocus] = createSignal<boolean>(false)
    const [isSettingsThemeFocus, setIsSettingsThemeFocus] = createSignal<boolean>(false)
    const [isSettingsCornerFocus, setIsSettingsCornerFocus] = createSignal<boolean>(false)
    const [addColorBtnRef, setAddColorBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [copyAllBtnRef, setCopyAllBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [settingsBtnRef, setSettingsBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [selectColorBtnRef, setSelectColorBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [colorListBtnRef, setColorListBtnRef] = createSignal<HTMLButtonElement | null>(null)
    let settingsMenuRef: HTMLElement
    let settingsThemeMenuRef: HTMLElement
    let settingsCornerMenuRef: HTMLElement

    async function changeTheme(theme: ThemeData): Promise<void> {
        setTheme(theme)
        setAttribute(getRoot(), RootAttributes[_theme], theme)
        setLocalStorageItem(LocalStorageKeys[_theme], theme)
        await closePopover(settingsThemeMenuRef)
        await closePopover(settingsMenuRef)
    }
    
    async function changeCorner(corner: CornerData): Promise<void> {
        setCorner(corner)
        setAttribute(getRoot(), RootAttributes[_corner], corner)
        setLocalStorageItem(LocalStorageKeys[_corner], corner)
        await closePopover(settingsCornerMenuRef)
        await closePopover(settingsMenuRef)
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

    const SettingsMenu: Component = () => (<Menu ref={r => settingsMenuRef = r} onToggle={(v) => setIsSettingsFocus(v)}>
        <NestedMenu
            level={1}
            ref={r => settingsThemeMenuRef = r}
            onToggle={v => setIsSettingsThemeFocus(v)}
            item={<MenuItem
                data-focus={toggleAttribute(isSettingsThemeFocus())}
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
            ref={r => settingsCornerMenuRef = r}
            onToggle={v => setIsSettingsCornerFocus(v)}
            item={<MenuItem
                data-focus={toggleAttribute(isSettingsCornerFocus())}
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
            onClick={() => closePopover(settingsMenuRef)}
            href={RoutesLinks.home}
            openInNewTab
            trailing={<Icon code={0xEB51}/>}
            leading={<img src={redmerahLogo[_src]} width={20} alt='Redmerah logo'/>}>
            Redmerah (homepage)
        </MenuItemLink>
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
            href={RoutesLinks.apps}
            openInNewTab
            trailing={<Icon code={0xEB51}/>}
            leading={<Icon code={0xE063}/>}>
            More apps
        </MenuItemLink>
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
            href={RoutesLinks.about}
            openInNewTab
            trailing={<Icon code={0xEB51}/>}
            leading={<Icon code={0xE930}/>}>
            About us
        </MenuItemLink>
        <MenuDivider />
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
            href={RoutesLinks.privacy}
            openInNewTab
            trailing={<Icon code={0xEB51}/>}
            leading={<Icon code={0xEE51}/>}>
            Privacy policy
        </MenuItemLink>
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
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
                closePopover(settingsMenuRef)
            }}
            leading={<Icon code={0xEE23}/>}>
            Share
        </MenuItem>
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
            href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURL('Color Generator')}
            leading={<Icon code={0xE3A0}/>}>
            Send feedback
        </MenuItemLink>
        <MenuItemLink
            onClick={() => closePopover(settingsMenuRef)}
            href={ExternalLinks.donate}
            openInNewTab
            leading={<Icon code={0xE84B}/>}>
            Donate
        </MenuItemLink>
        <MenuHeader>&copy; {getDate_Y()} Redmerah</MenuHeader>
    </Menu>)

    return (<header class={CSS.header}>
        <div class={CSS.logo}><img src={logo[_src]} alt="Color generator" /> Color Generator</div>
        <div class={CSS.color_picker}>
            <Tooltip anchor={selectColorBtnRef()} text='Select color' />
            <Button ref={r => setSelectColorBtnRef(r)} variant={ButtonVariant[_outlined]} onClick={(ev) => openPopover({
                    event: ev,
                    anchor: ev[_currentTarget],
                    popover: getElementById(props.colorPickerId)!,
                })}>
                <div class={CSS[_seed]} style={{ "background-color": props[_seed] }} />
                {props[_seed]}
            </Button>

            <Show when={props[_palletteList][_length] > 0}>
                <Tooltip anchor={colorListBtnRef()} text='Color list' />
                <Button iconOnly ref={r => setColorListBtnRef(r)} onClick={(ev) => openModal(ev, getElementById(props.colorListDialogId)!)}><Icon code={0xF098}/></Button>
            </Show>
        </div>
        <div class={CSS.actions}>
            <Tooltip anchor={addColorBtnRef()} text='Add color to list' />
            <Button ref={r => setAddColorBtnRef(r)} onClick={() => {
                if (timeoutId()) {
                    clearTimeDelayed(timeoutId()!)
                    setTimeoutId(null)
                }
                props.onAddColor()
                setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
            }} iconOnly><Show when={timeoutId()} fallback={<Icon code={0xF08A}/>}><Icon code={0xE3D8}/></Show></Button>

            <Tooltip anchor={copyAllBtnRef()} text='Copy all' />
            <Button
                iconOnly
                ref={r => setCopyAllBtnRef(r)}
                onClick={() => props.onCopyAll()}>
                <Icon code={0xE51B}/>
            </Button>

            <Tooltip anchor={settingsBtnRef()} text='Open settings' />
            <Button
                iconOnly
                classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
                ref={r => setSettingsBtnRef(r)}
                focus={isSettingsFocus()}
                onClick={ev => openPopover({
                    event: ev,
                    anchor: ev[_currentTarget],
                    popover: settingsMenuRef,
                })}>
                <Icon code={0xEE0F}/>
            </Button>
            <SettingsMenu />
        </div>
    </header>)
}

const Body: Component<BodyProps> = (props) => {
    const accLightTimeoutId: Signal<number | null> = createSignal<number | null>(null)
    const onAccLightTimeoutId: Signal<number | null> = createSignal<number | null>(null)
    const accDarkTimeoutId: Signal<number | null> = createSignal<number | null>(null)
    const onAccDarkTimeoutId: Signal<number | null> = createSignal<number | null>(null)

    async function copyColor(color: string, timeoutId: Signal<number | null>): Promise<void> {
        if (timeoutId[0]()) {
            clearTimeDelayed(timeoutId[0]()!)
            timeoutId[1](null)
        }

        await getNavigator()[_clipboard][_writeText](color)
        timeoutId[1](setTimeDelayed(() => timeoutId[1](null), 1000))
    }

    function hexToCSSValue(hexColor: HEXColor): string {
        const rgb = hexToRgb(hexColor) 
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    return (<main class={CSS.main}>
        <div style={{ "background-color": props.accentLight, color: props.onAccentLight }}>
            <h2>Accent Light<br />{props.accentLight}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props.onAccentLight)}}
                onClick={() => copyColor(props.accentLight, accLightTimeoutId)}>
                <Show when={accLightTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props.onAccentLight, color: props.accentLight }}>
            <h2>On Accent Light<br />{props.onAccentLight}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props.accentLight)}}
                onClick={() => copyColor(props.onAccentLight, onAccLightTimeoutId)}>
                <Show when={onAccLightTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props.accentDark, color: props.onAccentDark }}>
            <h2>Accent Dark<br />{props.accentDark}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props.onAccentDark)}}
                onClick={() => copyColor(props.accentDark, accDarkTimeoutId)}>
                <Show when={accDarkTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props.onAccentDark, color: props.accentDark }}>
            <h2>On Accent Dark<br />{props.onAccentDark}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props.accentDark)}}
                onClick={() => copyColor(props.onAccentDark, onAccDarkTimeoutId)}>
                <Show when={onAccDarkTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
    </main>)
}

const BottomBar: Component<BottomBarProps> = (props) => {
    const [selectColorBtnRef, setSelectColorBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [colorListBtnRef, setColorListBtnRef] = createSignal<HTMLButtonElement | null>(null)

    return (<footer class={ CSS.footer }>
        <Tooltip anchor={selectColorBtnRef()} text='Select color' />
        <Button ref={r => setSelectColorBtnRef(r)} variant={ButtonVariant[_outlined]} onClick={(ev) => openPopover({
                event: ev,
                anchor: ev[_currentTarget],
                popover: getElementById(props.colorPickerId)!,
            })}>
            <div class={CSS[_seed]} style={{ "background-color": props[_seed] }} />
            {props[_seed]}
        </Button>

        <Show when={props[_palletteList][_length] > 0}>
            <Tooltip anchor={colorListBtnRef()} text='Color list' />
            <Button 
                iconOnly 
                ref={r => setColorListBtnRef(r)} 
                onClick={(ev) => openModal(ev, getElementById(props.colorListDialogId)!)}>
                <Icon code={0xF098}/>
            </Button>
        </Show>
    </footer>)
}

export const App: Component = () => {
    const
        _accentLight = 'accentLight', 
        _onAccentLight = 'onAccentLight', 
        _accentDark = 'accentDark', 
        _onAccentDark = 'onAccentDark'
    ;
    const colorPickerId = createUniqueId()
    const colorListDialogId = createUniqueId()
    const [pallette, setPallette] = createStore<Pallette>({
        seed: '#00FFF0',
        accentLight: '#005C56',
        onAccentLight: '#FFFFFF',
        accentDark: '#00C7BB',
        onAccentDark: '#000000'
    })
    const [palletteList, setPalletteList] = createSignal<Pallette[]>([])
    const [timeoutId, setTimeoutId] = createSignal<number | null>(null)

    function rgbToCSSValue(rgb: RGBColor): string {
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    function onColorChange(hexColor: HEXColor): void {
        
        const acc = generateColor(hexColor)
        const accentColorStyleEl = getElementById(ElementIds[_color_accent])!
        accentColorStyleEl[_innerHTML] = `:root{
--color-accent-light: ${rgbToCSSValue(hexToRgb(acc[_color]))};
--color-accent-dark: ${rgbToCSSValue(hexToRgb(acc[_colorDark]))};
--color-on-accent-light: ${rgbToCSSValue(hexToRgb(acc[_onColor]))};
--color-on-accent-dark: ${rgbToCSSValue(hexToRgb(acc[_onColorDark]))};
}`;
        setLocalStorageItem(LocalStorageKeys[_color], hexColor)

        setPallette({
            seed: hexColor[_toUpperCase]() as HEXColor,
            accentLight: acc[_color][_toUpperCase]() as HEXColor,
            onAccentLight: acc[_onColor][_toUpperCase]() as HEXColor,
            accentDark: acc[_colorDark][_toUpperCase]() as HEXColor,
            onAccentDark: acc[_onColorDark][_toUpperCase]() as HEXColor
        })
    }

    function onCopyAll(): void {
        getNavigator()[_clipboard][_writeText]([
            '--seed: ' + pallette[_seed],
            '--accent-light: ' + pallette[_accentLight],
            '--on-accent-light: ' + pallette[_onAccentLight],
            '--accent-dark: ' + pallette[_accentDark],
            '--on-accent-dark: ' + pallette[_onAccentDark],
        ][_join](';\n') + ';')
    }

    async function copyAllPalletteList(): Promise<void> {
        if (timeoutId()) {
            clearTimeDelayed(timeoutId()!)
            setTimeoutId(null)
        }

        const colorsText: string[] = []
        for (let i = 0; i < palletteList()[_length]; i++) {
            const pallette = palletteList()[i]
            colorsText[_push]([
                `--seed-${i + 1}: ` + pallette[_seed],
                `--accent-light-${i + 1}: ` + pallette[_accentLight],
                `--on-accent-light-${i + 1}: ` + pallette[_onAccentLight],
                `--accent-dark-${i + 1}: ` + pallette[_accentDark],
                `--on-accent-dark-${i + 1}: ` + pallette[_onAccentDark],
            ][_join](';\n') + ';')
        }

        await getNavigator()[_clipboard][_writeText](colorsText[_join]('\n\n'))
        setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
    }

    function onAddColor(): void {
        for (const p of palletteList()) {
            if (p[_accentLight] == pallette[_accentLight]) return
        }

        setPalletteList(l => [...l, {...pallette}])
    }

    function initColor(): void {
        const color = getLocalStorageItem(LocalStorageKeys[_color])

        try {
            testHexColor(color ?? '')
            onColorChange(color as HEXColor)
            changeColorPickerValue(getElementById(colorListDialogId)!, color as HEXColor)
        } catch (e) {}
    }

    onMount(() => {
        initColor()
    })

    const ListItem: Component<{pallette: Pallette}> = (props) => {
        const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
        const [copyBtnRef, setCopyBtnRef] = createSignal<HTMLButtonElement | null>(null)
        const [deleteBtnRef, setDeleteBtnRef] = createSignal<HTMLButtonElement | null>(null)

        async function copy(): Promise<void> {
            if (timeoutId()) {
                clearTimeDelayed(timeoutId()!)
                setTimeoutId(null)
            }

            await getNavigator()[_clipboard][_writeText]([
                '--seed: ' + props[_pallette][_seed],
                '--accent-light: ' + props[_pallette][_accentLight],
                '--on-accent-light: ' + props[_pallette][_onAccentLight],
                '--accent-dark: ' + props[_pallette][_accentDark],
                '--on-accent-dark: ' + props[_pallette][_onAccentDark],
            ][_join](';\n') + ';')
            setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
        }

        function deleteColor(): void {
            setPalletteList(l => l[_filter](v => v[_accentLight] != props[_pallette][_accentLight]))
            if (palletteList()[_length] == 0) {
                closeModal(getElementById(colorListDialogId)!)
            }
        }

        return (<List
            trailing={<>
                <Tooltip anchor={copyBtnRef()} text='Copy' />
                <Button iconOnly onClick={copy} ref={r => setCopyBtnRef(r)}>
                    <Show when={timeoutId()} fallback={<Icon code={0xE51B}/>}>
                        <Icon code={0xE3D8}/>
                    </Show>
                </Button>

                <Tooltip anchor={deleteBtnRef()} text='Delete' />
                <Button ref={r => setDeleteBtnRef(r)} iconOnly onClick={deleteColor}><Icon code={0xE59D}/></Button>
            </>}
            subtitle={<>
                <div><div style={{"background-color": props[_pallette][_accentLight]}} />{props[_pallette][_accentLight]}</div>
                <div><div style={{"background-color": props[_pallette][_onAccentLight]}} />{props[_pallette][_onAccentLight]}</div>
                <div><div style={{"background-color": props[_pallette][_accentDark]}} />{props[_pallette][_accentDark]}</div>
                <div><div style={{"background-color": props[_pallette][_onAccentDark]}} />{props[_pallette][_onAccentDark]}</div>
            </>}
            leading={<div style={{"background-color": props[_pallette][_seed]}}/>}>
            { props[_pallette][_seed] }
        </List>)
    }

    return (<div class={CSS.body}>
        <AppBar
            colorPickerId={colorPickerId}
            colorListDialogId={colorListDialogId}
            onAddColor={onAddColor}
            onCopyAll={onCopyAll}
            seed={pallette[_seed]}
            onColorChange={onColorChange}
            palletteList={palletteList()}
        />
        <Body {...pallette} />
        <BottomBar
            colorListDialogId={colorListDialogId}
            colorPickerId={colorPickerId}
            palletteList={palletteList()}
            seed={pallette[_seed]}
        />
        <ColorPicker
            initialColor={pallette[_seed]}
            id={colorPickerId}
            disabledColorControl
            disabledOpacityControl
            onSelectColor={onColorChange}
        />
        <Dialog
            id={colorListDialogId}
            header="Color list"
            classList={addClassListModule( CSS.color_list )}
            actions={<>
                <Button variant={ButtonVariant[_filledTonal]} onClick={() => {
                    setPalletteList([])
                    closeModal(getElementById(colorListDialogId)!)
                }}>Delete all</Button>
                <Button variant={ButtonVariant[_filledTonal]} onClick={copyAllPalletteList}>
                    <Show when={timeoutId()} fallback='Copy all'>Copied</Show>
                </Button>
                <Button variant={ButtonVariant[_filled]} onClick={() => closeModal(getElementById(colorListDialogId)!)}>Close</Button>
            </>}>
            <For each={palletteList()}>{p => <ListItem pallette={p}/>}</For>
        </Dialog>
    </div>)
}