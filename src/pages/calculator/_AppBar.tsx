import { createSignal, For, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { _system, _round, _command, _change, _matches, _theme, _corner, _light, _dark, _includes, _sharp, _semiRound, _fullRound, _home, _src, _apps, _about, _privacy, _terms, _share, _URL, _contactEmail, _donate, _getFullYear, _settings, _scientificNotation, _memoryButtons, _comma, _numberFormat, _decimal, _point, _grouping, _space, _none, _underscore, _calculator, _type, _onChangeCalculator, _icon, _text, _right, _onNoteChanged, _currentTarget, _value, _centerBottomToLeft, _note, _isNotebookExpanded, _filled } from "@/constants/string"
import { addClassListModule } from "@/utils/element"
import { addEventListener } from "@/utils/event"
import { isMatchMedia, matchMedia } from "@/utils/window"
import { CALCULATOR_TYPES, SIZE_SIDE_NAVIGATION_NONE, SIZE_SIDE_NOTEBOOK_NONE } from "./_constants"
import { getNavigator, getDocument, getRoot } from "@/constants/window"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { encodeURL } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { setAttribute } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { Commands, DecimalNumberFormat, GroupingNumberFormat, type CalculatorType } from "./_enums"
import { timeout } from "@/utils/timeout"
import redmerahLogo from '@/assets/logo.svg'
import logo from '@/assets/apps/calculator-logo.svg'

import Icon from "@/components/Icon"
import { TextTooltip } from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import { AreaTextField, changeAreaTextFieldValue } from "@/components/TextField"
import Menu, {  MenuDivider, MenuItem, MenuHeader, closeMenu, LinkMenuItem, SubMenu, closeSubMenu, openMenu, MenuPosition, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Drawer, { closeDrawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
    onChangeCalculator: (type: CalculatorType) => unknown
    calculator: CalculatorType
    isNotebookExpanded: boolean
    note: string
    settings: Settings
    onNoteChanged: (value: string) => unknown
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_submenu_themeSettings_open, setIs_submenu_themeSettings_open] = createSignal<boolean>(false)
    const [is_submenu_cornerSettings_open, setIs_submenu_cornerSettings_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [is_menu_groupingNumberFormatSettings_open, setIs_menu_groupingNumberFormatSettings_open] = createSignal<boolean>(false)
    const [is_menu_decimalNumberFormatSettings_open, setIs_menu_decimalNumberFormatSettings_open] = createSignal<boolean>(false)
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const [isSideNotebookHidden, setIsSideNotebookHidden] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    let menu_info_ref: HTMLDialogElement
    let menu_settings_ref: HTMLDialogElement
    let submenu_themeSettings_ref: HTMLDivElement
    let submenu_cornerSettings_ref: HTMLDivElement
    let submenu_decimalNumberFormatSettings_ref: HTMLDivElement
    let submenu_groupingNumberFormatSettings_ref: HTMLDivElement
    let drawer_navigation_ref: HTMLDialogElement
    let drawer_notebook_ref: HTMLDialogElement
    let areaTextField_notebook_ref: HTMLTextAreaElement

    async function changeDecimalNumberFormat(type: DecimalNumberFormat): Promise<void> {
        props[_command](Commands.change_settings_numberFormatDecimal, type)
        closeSubMenu(submenu_decimalNumberFormatSettings_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    async function changeGroupingNumberFormat(type: GroupingNumberFormat): Promise<void> {
        props[_command](Commands.change_settings_numberFormatGrouping, type)
        closeSubMenu(submenu_groupingNumberFormatSettings_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    function initSideNavigationListener(): void {
        setIsSideNavigationHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), _change, ev => setIsSideNavigationHidden((ev as MediaQueryListEvent)[_matches]))
    }

    function initSideNotebookListener(): void {
        setIsSideNotebookHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`), _change, ev => setIsSideNotebookHidden((ev as MediaQueryListEvent)[_matches]))
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
        initSideNotebookListener()
    })

    const Menus: VoidComponent = () => (<>
        <Menu
            ref={r => menu_info_ref = r}
            style={{"min-width": '200px'}}
            onToggleOpen={isOpen => setIs_menu_info_open(isOpen)}>
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
                    getNavigator()[_share]({ title: 'Calculator', text: 'Calculator', url: getDocument()[_URL] })
                    closeMenu(menu_info_ref)
                }}
                iconCode={0xEE23}>
                Share
            </MenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Calculator')}
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
            style={{width: '224px'}}
            ref={r => menu_settings_ref = r}
            onToggleOpen={(v) => setIs_menu_settings_open(v)}>
            <TextTooltip text={"Display result in scientific notation (e.g. 1.2E-29)"}>
                <SwitchMenuItem
                    value={props[_settings][_scientificNotation]}
                    iconCode={0xEA91}
                    onValueChanged={() => props[_command](Commands.toggle_settings_scientificNotation)}>
                    Scientific notation
                </SwitchMenuItem>
            </TextTooltip>
            <TextTooltip text={"Show or hide memory button (M, M+, M-, MR, MC)"}>
                <SwitchMenuItem
                    value={props[_settings][_memoryButtons]}
                    iconCode={0xE5CD}
                    onValueChanged={() => props[_command](Commands.toggle_settings_memoryButtons)}>
                    Memory buttons
                </SwitchMenuItem>
            </TextTooltip>
            <MenuDivider/>
            <SubMenu
                level={1}
                ref={r => submenu_themeSettings_ref = r}
                onToggleOpen={v => setIs_submenu_themeSettings_open(v)}
                item={<SubMenuItem
                    focused={is_submenu_themeSettings_open()}
                    iconCode={0xE28A}>
                    Theme
                </SubMenuItem>}>
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
                onToggleOpen={v => setIs_submenu_cornerSettings_open(v)}
                item={<SubMenuItem
                    focused={is_submenu_cornerSettings_open()}
                    iconCode={0xF044}>
                    Corner style
                </SubMenuItem>}>
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
            <MenuDivider />
            <MenuHeader>Number format</MenuHeader>
            <SubMenu
                level={1}
                style={{width: '132px'}}
                ref={r => submenu_decimalNumberFormatSettings_ref = r}
                onToggleOpen={v => setIs_menu_decimalNumberFormatSettings_open(v)}
                item={<SubMenuItem
                    focused={is_menu_decimalNumberFormatSettings_open()}
                    iconCode={0xE599}>
                    Decimal
                </SubMenuItem>}>
                <MenuItem
                    onClick={() => changeDecimalNumberFormat(DecimalNumberFormat[_comma])}
                    selected={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]}>
                    Comma
                </MenuItem>
                <MenuItem
                    onClick={() => changeDecimalNumberFormat(DecimalNumberFormat[_point])}
                    selected={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_point]}>
                    Point
                </MenuItem>
            </SubMenu>
            <SubMenu
                level={1}
                style={{width: '132px'}}
                ref={r => submenu_groupingNumberFormatSettings_ref = r}
                onToggleOpen={v => setIs_menu_groupingNumberFormatSettings_open(v)}
                item={<SubMenuItem
                    focused={is_menu_groupingNumberFormatSettings_open()}
                    iconCode={0xEB49}>
                    Grouping
                </SubMenuItem>}>
                <MenuItem
                    onClick={() => changeGroupingNumberFormat(GroupingNumberFormat[_comma])}
                    selected={props[_settings][_numberFormat][_grouping] == GroupingNumberFormat[_comma]}>
                    Comma
                </MenuItem>
                <MenuItem
                    onClick={() => changeGroupingNumberFormat(GroupingNumberFormat[_point])}
                    selected={props[_settings][_numberFormat][_grouping] == GroupingNumberFormat[_point]}>
                    Point
                </MenuItem>
                <MenuItem
                    onClick={() => changeGroupingNumberFormat(GroupingNumberFormat[_space])}
                    selected={props[_settings][_numberFormat][_grouping] == GroupingNumberFormat[_space]}>
                    Space
                </MenuItem>
                <MenuItem
                    onClick={() => changeGroupingNumberFormat(GroupingNumberFormat[_none])}
                    selected={props[_settings][_numberFormat][_grouping] == GroupingNumberFormat[_none]}>
                    None
                </MenuItem>
                <MenuItem
                    onClick={() => changeGroupingNumberFormat(GroupingNumberFormat[_underscore])}
                    selected={props[_settings][_numberFormat][_grouping] == GroupingNumberFormat[_underscore]}>
                    Underscore
                </MenuItem>
            </SubMenu>
        </Menu>
    </>)

    const Drawers: VoidComponent = () => {
        return (<>
            <Drawer
                header={<TextTooltip text="Close navigation">
                    <IconButton
                        classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
                        onClick={() => closeDrawer(drawer_navigation_ref)}
                        code={0xEAFF}
                    />
                </TextTooltip>}
                ref={r => drawer_navigation_ref = r}>
                <For each={CALCULATOR_TYPES}>{r => <DrawerItem
                    onClick={() => {
                        if (props[_calculator] != r[_type]) props[_onChangeCalculator](r[_type])
                        closeDrawer(drawer_navigation_ref)
                    }}
                    selected={props[_calculator] == r[_type]}>
                    <Icon filled={props[_calculator] == r[_type]} code={r[_icon]}/>{ r[_text] }
                </DrawerItem>}</For>
            </Drawer>
            <Drawer
                classList={addClassListModule(CSS.appbar_notebook)}
                header={<>
                    <TextTooltip text="Close notebook">
                        <IconButton
                            onClick={() => closeDrawer(drawer_notebook_ref)}
                            code={0xE5E9}
                        />
                    </TextTooltip>
                    Notebook
                </>}
                ref={r => drawer_notebook_ref = r}
                position={DrawerPosition[_right]}>
                <AreaTextField
                    ref={r => areaTextField_notebook_ref = r}
                    labelText="Notebook"
                    placeholder="Type your thought here ..."
                    onInput={(ev) => props[_onNoteChanged](ev[_currentTarget][_value])}
                />
            </Drawer>
        </>)
    }

    return (<>
        <AppBar
            leading={<>
                <TextTooltip text={isSideNavigationHidden()
                    ? "Open navigation"
                    : "Expand/shrink navigation"
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
                <img width={32} src={logo[_src]} alt="Calculator logo" />
            </>}
            headline="Calculator"
            trailing={<>
                <TextTooltip text="Info">
                    <IconButton
                        focused={is_menu_info_open()}
                        onClick={ev => openMenu(ev, menu_info_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: MenuPosition[_centerBottomToLeft]
                        })}
                        code={0xE930}
                    />
                </TextTooltip>
                <TextTooltip text="Settings">
                    <IconButton
                        classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
                        focused={is_menu_settings_open()}
                        onClick={(ev) => openMenu(ev, menu_settings_ref, {
                            anchor: ev[_currentTarget],
                            padding: 4,
                            position: MenuPosition[_centerBottomToLeft]
                        })}
                        code={0xEE0F}
                    />
                </TextTooltip>
                <TextTooltip text="Notebook">
                    <IconButton
                        onClick={ev => {
                            if (isSideNotebookHidden()) {
                                changeAreaTextFieldValue(areaTextField_notebook_ref, props[_note])
                                return openDrawer(ev, drawer_notebook_ref)
                            }
                            props[_command](Commands.toggle_notebook_expand)
                        }}
                        variant={props[_isNotebookExpanded] && !isSideNotebookHidden()? ButtonVariant[_filled] : undefined}
                        filled={props[_isNotebookExpanded] && !isSideNotebookHidden()}
                        code={0xEB19}
                    />
                </TextTooltip>
            </>}
        />
        <Drawers />
        <Menus />
    </>)
}

export default _