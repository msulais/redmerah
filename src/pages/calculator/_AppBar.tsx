import { createSignal, For, onMount, type VoidComponent } from "solid-js"

import { _calculator, _CENTER_BOTTOM_TO_LEFT, _change, _comma, _command, _contactEmail, _corner, _currentTarget, _dark, _decimal, _donate, _filled, _fullRound, _getFullYear, _grouping, _icon, _includes, _isNotebookExpand, _light, _matches, _memoryButtons, _none, _note, _numberFormat, _onChangeCalculator, _onChangeRandomizer, _onNoteChanged, _point, _randomizerType, _right, _round, _scientificNotation, _semiRound, _settings, _share, _sharp, _space, _src, _system, _text, _theme, _type, _underscore, _URL, _value } from "@/data/string"
import { addClassListModule } from "@/utils/element"
import { addEventListener } from "@/utils/event"
import { isMatchMedia, matchMedia } from "@/utils/window"
import { CALCULATOR_TYPES, SIZE_SIDE_NAVIGATION_NONE, SIZE_SIDE_NOTEBOOK_NONE } from "./_data"
import { getNavigator, getDocument, getRoot } from "@/data/window"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { PopoverPosition, Position } from "@/enums/position"
import { closePopover, openPopover } from "@/utils/popover"
import { encodeURL } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { setAttribute, toggleAttribute } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import redmerahLogo from '@/assets/logo.svg'
import logo from '@/assets/apps/calculator-logo.svg'

import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { MenuItemLink, MenuDivider, MenuItem, MenuHeader, NestedMenu } from "@/components/Menu"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss";
import CSS from './_Appbar.module.scss'
import { Commands, DecimalNumberFormat, GroupingNumberFormat, type CalculatorType } from "./_enums"
import Drawer, { DrawerItem } from "@/components/Drawer"
import { closeModal, openModal } from "@/utils/modal"
import { changeTextAreaFieldValue, TextAreaField } from "@/components/TextField"
import type { Settings } from "./_types"

type Props = {
    onChangeCalculator: (type: CalculatorType) => unknown
    calculator: CalculatorType
    isNotebookExpand: boolean
    note: string
    settings: Settings
    onNoteChanged: (value: string) => unknown
    command: (type: Commands, ...args: unknown[]) => unknown
}

const _: VoidComponent<Props> = (props) => {
    const [button_menu_ref, set_button_menu_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_info_ref, set_button_info_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_notebook_ref, set_button_notebook_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_settings_ref, set_button_settings_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_settingsScientificNotation_ref, set_button_settingsScientificNotation_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_settingsMemoryButtons_ref, set_button_settingsMemoryButtons_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_closeNavigationDrawer_ref, set_button_closeNavigationDrawer_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_closeNotebookDrawer_ref, set_button_closeNotebookDrawer_ref] = createSignal<HTMLButtonElement | null>(null)
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_menu_themeSettings_open, setIs_menu_themeSettings_open] = createSignal<boolean>(false)
    const [is_menu_cornerSettings_open, setIs_menu_cornerSettings_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [is_menu_groupingNumberFormatSettings_open, setIs_menu_groupingNumberFormatSettings_open] = createSignal<boolean>(false)
    const [is_menu_decimalNumberFormatSettings_open, setIs_menu_decimalNumberFormatSettings_open] = createSignal<boolean>(false)
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const [isSideNotebookHidden, setIsSideNotebookHidden] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    let menu_info_ref: HTMLElement
    let menu_settings_ref: HTMLElement
    let menu_themeSettings_ref: HTMLElement
    let menu_cornerSettings_ref: HTMLElement
    let menu_decimalNumberFormatSettings_ref: HTMLElement
    let menu_groupingNumberFormatSettings_ref: HTMLElement
    let drawer_navigation_ref: HTMLDialogElement
    let drawer_notebook_ref: HTMLDialogElement
    let textareafield_notebook_ref: HTMLTextAreaElement

    async function changeDecimalNumberFormat(type: DecimalNumberFormat): Promise<void> {
        props[_command](Commands.change_settings_numberFormatDecimal, type)
        await closePopover(menu_decimalNumberFormatSettings_ref)
        await closePopover(menu_settings_ref)
    }

    async function changeGroupingNumberFormat(type: GroupingNumberFormat): Promise<void> {
        props[_command](Commands.change_settings_numberFormatGrouping, type)
        await closePopover(menu_groupingNumberFormatSettings_ref)
        await closePopover(menu_settings_ref)
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
        initSideNotebookListener()
    })

    const Menus: VoidComponent = () => {
        return (<>
            <Menu ref={r => menu_info_ref = r} onToggle={(v) => setIs_menu_info_open(v)}>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.home}
                    openInNewTab
                    trailing={<Icon code={0xEB51}/>}
                    leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                    Redmerah (homepage)
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.apps}
                    openInNewTab
                    trailing={<Icon code={0xEB51}/>}
                    leading={<Icon code={0xE063}/>}>
                    More apps
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.about}
                    openInNewTab
                    trailing={<Icon code={0xEB51}/>}
                    leading={<Icon code={0xE930}/>}>
                    About us
                </MenuItemLink>
                <MenuDivider />
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.privacy}
                    openInNewTab
                    trailing={<Icon code={0xEB51}/>}
                    leading={<Icon code={0xEE51}/>}>
                    Privacy policy
                </MenuItemLink>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={RoutesLinks.terms}
                    openInNewTab
                    trailing={<Icon code={0xEB51}/>}
                    leading={<Icon code={0xED47}/>}>
                    Terms & conditions
                </MenuItemLink>
                <MenuDivider />
                <MenuItem
                    onClick={() => {
                        getNavigator()[_share]({ title: 'Randomizer', text: 'Randomizer', url: getDocument()[_URL] })
                        closePopover(menu_info_ref)
                    }}
                    leading={<Icon code={0xEE23}/>}>
                    Share
                </MenuItem>
                <MenuItemLink
                    onClick={() => closePopover(menu_info_ref)}
                    href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Color Generator')}
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

            <Menu style={{width: '224px'}} ref={r => menu_settings_ref = r} onToggle={(v) => setIs_menu_settings_open(v)}>
                <Tooltip anchor={button_settingsScientificNotation_ref()} text={"Display result in scientific notation (e.g. 1.2E-29)"}/>
                <MenuItem 
                    ref={r => set_button_settingsScientificNotation_ref(r)} 
                    onClick={() => props[_command](Commands.toggle_settings_scientificNotation)}
                    checked={props[_settings][_scientificNotation]}>
                    Scientific notation
                </MenuItem>

                {/* TODO: add memory button option settings */}
                <Tooltip anchor={button_settingsMemoryButtons_ref()} text={"Show or hide memory button (M, M+, M-, MR, MC)"}/>
                <MenuItem 
                    ref={r => set_button_settingsMemoryButtons_ref(r)} 
                    onClick={() => props[_command](Commands.toggle_settings_memoryButtons)}
                    checked={props[_settings][_memoryButtons]}>
                    Memory buttons
                </MenuItem>

                <MenuDivider/>

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
                    onToggle={v => setIs_menu_cornerSettings_open(v)}
                    item={<MenuItem
                        focus={is_menu_cornerSettings_open()}
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
                <MenuHeader>Number format</MenuHeader>

                <NestedMenu
                    level={1}
                    style={{width: '132px'}}
                    ref={r => menu_decimalNumberFormatSettings_ref = r}
                    onToggle={v => setIs_menu_decimalNumberFormatSettings_open(v)}
                    item={<MenuItem
                        focus={is_menu_decimalNumberFormatSettings_open()}
                        leading={<Icon code={0xE599}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Decimal
                    </MenuItem>}>
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
                </NestedMenu>

                <NestedMenu
                    level={1}
                    style={{width: '132px'}}
                    ref={r => menu_groupingNumberFormatSettings_ref = r}
                    onToggle={v => setIs_menu_groupingNumberFormatSettings_open(v)}
                    item={<MenuItem
                        focus={is_menu_groupingNumberFormatSettings_open()}
                        leading={<Icon code={0xEB49}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Grouping
                    </MenuItem>}>
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
                </NestedMenu>
            </Menu>
        </>)
    }

    const Drawers: VoidComponent = () => {
        return (<>
            <Drawer 
                header={<>
                    <Tooltip anchor={button_closeNavigationDrawer_ref()} text="Close navigation"/>
                    <Button ref={r => set_button_closeNavigationDrawer_ref(r)} classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} iconOnly onClick={() => closeModal(drawer_navigation_ref)}><Icon code={0xEAFF}/></Button>
                </>}
                ref={r => drawer_navigation_ref = r}>
                <For each={CALCULATOR_TYPES}>{r => 
                    <DrawerItem 
                        onClick={() => {
                            if (props[_calculator] != r[_type]) props[_onChangeCalculator](r[_type])
                            closeModal(drawer_navigation_ref)
                        } }
                        selected={props[_calculator] == r[_type]}>
                        <Icon filled={props[_calculator] == r[_type]} code={r[_icon]}/>{ r[_text] }
                    </DrawerItem>
                }</For>
            </Drawer>
            <Drawer 
                classList={addClassListModule(CSS.notebook)} 
                header={<>
                    <Tooltip anchor={button_closeNotebookDrawer_ref()} text="Close notebook"/>
                    <Button ref={r => set_button_closeNotebookDrawer_ref(r)} iconOnly onClick={() => closeModal(drawer_notebook_ref)}><Icon code={0xE5E9}/></Button>
                    Notebook
                </>}
                ref={r => drawer_notebook_ref = r} 
                position={Position[_right]}>
                <TextAreaField 
                    ref={r => textareafield_notebook_ref = r}
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
                <Tooltip text={isSideNavigationHidden()? "Open navigation" : "Expand/shrink navigation"} anchor={button_menu_ref()}/>
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
                <img width={28} src={logo[_src]} alt="Calculator logo" />
            </>} 
            headline="Calculator"
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

                <Tooltip text="Notebook" anchor={button_notebook_ref()}/>
                <Button 
                    onClick={ev => {
                        if (isSideNotebookHidden()) {
                            changeTextAreaFieldValue(textareafield_notebook_ref, props[_note])
                            openModal(ev, drawer_notebook_ref)
                            return
                        }
                        props[_command](Commands.toggle_notebook_expand)
                    }} variant={props[_isNotebookExpand] && !isSideNotebookHidden()? ButtonVariant[_filled] : undefined} ref={r => set_button_notebook_ref(r)} iconOnly>
                    <Icon filled={props[_isNotebookExpand] && !isSideNotebookHidden()} code={0xEB19}/>
                </Button>
            </>}
        />
        <Drawers />
        <Menus />
    </>)
}

export default _