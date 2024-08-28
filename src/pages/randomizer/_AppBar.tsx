import { type Component, For, Match, Show, Switch, createMemo, createSignal, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"

import type { Settings } from "./_types"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { setAttribute, toggleAttribute } from "@/utils/attributes"
import { addClassListModule } from "@/utils/element"
import { RootAttributes } from "@/enums/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { ThemeData } from "@/enums/theme"
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage"
import { LocalStorageKeys } from "@/enums/storage"
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorModel, Commands } from "./_enums"
import { _change_settings_numbers_sort, _change_settings_numbers_type, _change_settings_words_wordCase, _change_settings_colors_colorModel, _toggle_navigation_expand, _toggle_settings_repeat, _toggle_settings_animation, _change_settings_prefix, _change_settings_suffix, _change_settings_separator, _change_settings_numbers_minDecimalLength } from "./_string"
import { _centerBottomToLeft, _rightCenterToBottom, _URL, _actions, _animation, _ascending, _binary, _change, _color, _colorModel, _colors, _command, _contactEmail, _corner, _currentTarget, _dark, _decimal, _descending, _donate, _filled, _fullRound, _generate, _getFullYear, _hex, _hexadecimal, _history, _hsl, _icon, _includes, _isGenerating, _light, _logo, _lowercase, _matches, _minDecimalLength, _noPointerEvent, _none, _numberType, _numbers, _octal, _onChangeRandomizer, _onCopyResult, _onGenerate, _onStopGenerate, _prefix, _randomizerType, _repeat, _rgb, _round, _selection, _semiRound, _separator, _settings, _share, _sharp, _sort, _src, _stopGenerate, _string, _suffix, _system, _teams, _text, _theme, _then, _titlecase, _togglecase, _type, _uppercase, _value, _wordCase, _words, _apps, _home, _about, _privacy, _terms } from "@/data/string"
import { encodeURL } from "@/utils/url"
import { getDocument, getNavigator, getRoot } from "@/data/window"
import { CornerData } from "@/enums/corner"
import { isMatchMedia } from "@/utils/window"
import { RANDOMIZER_TYPES, SIZE_SIDE_NAVIGATION_NONE } from "./_data"
import { addEventListener } from "@/utils/event"
import logo from '@/assets/apps/randomizer-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { TextTooltip } from "@/components/Tooltip"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, openMenu, MenuPosition } from "@/components/Menu"
import TextField, { NumberTextField, changeTextFieldValue } from "@/components/TextField"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_AppBar.module.scss'

type Props = {
    isGenerating: boolean
    onCopyResult: () => Promise<boolean>
    randomizerType: RandomizerType
    settings: [Settings, SetStoreFunction<Settings>]
    command: (type: Commands, ...args: unknown[]) => unknown
    onChangeRandomizer: (type: RandomizerType) => void
}

const C: Component<Props> = (props) => {
    const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
    const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
    const [is_submenu_theme_open, setIs_submenu_theme_open] = createSignal<boolean>(false)
    const [is_submenu_corner_open, setIs_submenu_corner_open] = createSignal<boolean>(false)
    const [is_submenu_colorModel_open, setIs_submenu_colorModel_open] = createSignal<boolean>(false)
    const [is_submenu_wordCase_open, setIs_submenu_wordCase_open] = createSignal<boolean>(false)
    const [is_submenu_sort_open, setIs_submenu_sort_open] = createSignal<boolean>(false)
    const [is_submenu_numberType_open, setIs_submenu_numberType_open] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
    const [copyTimeoutId, setCopyTimeoutId] = createSignal<number | null>(null)
    const [copyErrorTimeoutId, setCopyErrorTimeoutId] = createSignal<number | null>(null)
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
    const settings      = createMemo<Settings>(() => props[_settings][0])
    const isRepeat      = createMemo<boolean>(() => {
        const s = settings()
        const randomizerType = props[_randomizerType]
        if (randomizerType == RandomizerType[_numbers   ]) return s[_numbers][_repeat]
        if (randomizerType == RandomizerType[_words     ]) return s[_words  ][_repeat]
        return false
    })
    const isAnimation = createMemo<boolean>(() => {
        const s = settings()
        const randomizerType = props[_randomizerType]
        if (randomizerType == RandomizerType[_numbers   ]) return s[_numbers    ][_animation]
        if (randomizerType == RandomizerType[_words     ]) return s[_words      ][_animation]
        if (randomizerType == RandomizerType[_string    ]) return s[_string     ][_animation]
        if (randomizerType == RandomizerType[_selection ]) return s[_selection  ][_animation]
        if (randomizerType == RandomizerType[_colors    ]) return s[_colors     ][_animation]
        if (randomizerType == RandomizerType[_teams     ]) return s[_teams      ][_animation]
        return false
    })
    let textfield_prefix_ref: HTMLInputElement
    let textfield_suffix_ref: HTMLInputElement
    let textfield_separator_ref: HTMLInputElement
    let textfield_decimalLength_ref: HTMLInputElement
    let drawer_navigation_ref: HTMLDialogElement
    let submenu_corner_ref: HTMLDivElement
    let menu_info_ref: HTMLDialogElement
    let menu_settings_ref: HTMLDialogElement
    let submenu_theme_ref: HTMLDivElement
    let submenu_wordCase_ref: HTMLDivElement
    let submenu_sort_ref: HTMLDivElement
    let submenu_numberType_ref: HTMLDivElement
    let submenu_colorModel_ref: HTMLDivElement

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

    async function changeNumbersSort(sort: NumbersRandomizerSort): Promise<void> {
        props[_command](Commands[_change_settings_numbers_sort], sort)
        closeSubMenu(submenu_sort_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    async function changeNumbersType(type: NumbersRandomizerNumberType): Promise<void> {
        props[_command](Commands[_change_settings_numbers_type], type)
        closeSubMenu(submenu_numberType_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    function initInputs(): void {
        const s = settings()
        if (props[_randomizerType] == RandomizerType[_numbers]) {
            if (textfield_prefix_ref) changeTextFieldValue(textfield_prefix_ref, s[_numbers][_prefix])
            if (textfield_suffix_ref) changeTextFieldValue(textfield_suffix_ref, s[_numbers][_suffix])
            if (textfield_separator_ref) changeTextFieldValue(textfield_separator_ref, s[_numbers][_separator])
            if (textfield_decimalLength_ref) changeTextFieldValue(textfield_decimalLength_ref, `${s[_numbers][_minDecimalLength]}`)
        } else if (props[_randomizerType] == RandomizerType[_words]) {
            if (textfield_prefix_ref) changeTextFieldValue(textfield_prefix_ref, s[_words][_prefix])
            if (textfield_suffix_ref) changeTextFieldValue(textfield_suffix_ref, s[_words][_suffix])
            if (textfield_separator_ref) changeTextFieldValue(textfield_separator_ref, s[_words][_separator])
        }
    }

    async function changeWordsWordCase(wordCase: WordsRandomizerWordCase): Promise<void> {
        props[_command](Commands[_change_settings_words_wordCase], wordCase)
        closeSubMenu(submenu_wordCase_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    async function changeColorsColorModel(colorModel: ColorsRandomizerColorModel): Promise<void> {
        props[_command](Commands[_change_settings_colors_colorModel], colorModel)
        closeSubMenu(submenu_colorModel_ref)
        await timeout(300)
        closeMenu(menu_settings_ref)
    }

    function initSideNavigationListener(): void {
        setIsSideNavigationHidden(isMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
        addEventListener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), _change, ev => setIsSideNavigationHidden((ev as MediaQueryListEvent)[_matches]))
    }

    onMount(() => {
        initTheme()
        initCorner()
        initSideNavigationListener()
    })

    return (<>
        <AppBar 
            leading={<>
                <TextTooltip text={isSideNavigationHidden()? "Open navigation" : "Expand/shrink navigation"}>
                    <IconButton 
                        onClick={(ev) => {
                            if (isSideNavigationHidden()) return openDrawer(ev, drawer_navigation_ref)
                            props[_command](Commands[_toggle_navigation_expand])
                        }} 
                        classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} 
                        code={0xEAFF}
                    />
                </TextTooltip>
                <img width="28" src={logo[_src]} alt="Randomizer" />
            </>}
            headline="Randomizer"
            trailing={<>
                <Button 
                    classList={addClassListModule(CSSAnimation.btn_rotate_full_icon, CSS.generate_btn)} 
                    data-keep-pointer-event={toggleAttribute(props[_isGenerating])} 
                    variant={ButtonVariant[_filled]} 
                    onClick={() => {
                        if (props[_isGenerating]) return props[_command](Commands[_stopGenerate])
                        props[_command](Commands[_generate])
                    }}>
                    <Icon 
                        filled 
                        classList={addClassListModule(CSS.generate_icon)} 
                        data-rotate={toggleAttribute(props[_isGenerating])}
                        code={0xE143}
                    />
                    <Show when={props[_isGenerating]} fallback="Generate">Generating</Show>
                </Button>
                <TextTooltip text="Info">
                    <IconButton 
                        focused={is_menu_info_open()} 
                        code={0xE930} 
                        onClick={(ev) => openMenu(ev, menu_info_ref, {
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
                        onClick={async (ev) => {
                            openMenu(ev, menu_settings_ref, {
                                anchor: ev[_currentTarget],
                                padding: 4,
                                position: MenuPosition[_centerBottomToLeft]
                            })
                            await timeout(300)
                            initInputs()
                        }}
                        code={0xEE0F}
                    />
                </TextTooltip>

                <TextTooltip text="Copy result">
                    <IconButton 
                        onClick={async () => {
                            const success = await props[_onCopyResult]()
                            if (!success) {
                                if (copyErrorTimeoutId()) clearTimeDelayed(copyErrorTimeoutId()!)
            
                                setCopyErrorTimeoutId(setTimeDelayed(() => {
                                    setCopyErrorTimeoutId(null)
                                }, 1000))
                                return
                            }

                            if (copyTimeoutId()) clearTimeDelayed(copyTimeoutId()!)

                            setCopyTimeoutId(setTimeDelayed(() => {
                                setCopyTimeoutId(null)
                            }, 1000))
                        }}
                        code={copyTimeoutId()? 0xE3D8 : copyErrorTimeoutId()? 0xE5E9 : 0xE51B}
                    />
                </TextTooltip>
            </>}
        />
        <Drawer 
            header={<TextTooltip text="Close navigation">
                <IconButton 
                    classList={addClassListModule(CSSAnimation.btn_shrink_horizontal_icon)} 
                    onClick={() => closeDrawer(drawer_navigation_ref)}
                    code={0xEAFF}
                />
            </TextTooltip>}
            ref={r => drawer_navigation_ref = r}>
            <For each={RANDOMIZER_TYPES}>{r => 
                <DrawerItem 
                    onClick={() => {
                        if (props[_randomizerType] != r[_type]) props[_onChangeRandomizer](r[_type])
                        
                        closeDrawer(drawer_navigation_ref)
                    } }
                    selected={props[_randomizerType] == r[_type]}>
                    <Icon filled={props[_randomizerType] == r[_type]} code={r[_icon]}/>{ r[_text] }
                </DrawerItem>
            }</For>
        </Drawer>
        <Menu ref={r => menu_info_ref = r} onToggleOpen={(v) => setIs_menu_info_open(v)}>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={RoutesLinks[_home]}
                trailing={<Icon code={0xEB51}/>}
                leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
                Redmerah (homepage)
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={RoutesLinks[_apps]}
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE063}/>}>
                More apps
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={RoutesLinks[_about]}
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE930}/>}>
                About us
            </LinkMenuItem>
            <MenuDivider />
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={RoutesLinks[_privacy]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xEE51}/>}>
                Privacy policy
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={RoutesLinks[_terms]}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xED47}/>}>
                Terms & conditions
            </LinkMenuItem>
            <MenuDivider />
            <MenuItem
                onClick={() => {
                    getNavigator()[_share]({ title: 'Randomizer', text: 'Randomizer', url: getDocument()[_URL] })
                    closeMenu(menu_info_ref)
                }}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Randomizer')}
                leading={<Icon code={0xE3A0}/>}>
                Send feedback
            </LinkMenuItem>
            <LinkMenuItem
                onClick={() => closeMenu(menu_info_ref)}
                href={ExternalLinks[_donate]}
                openInNewTab
                leading={<Icon code={0xE84B}/>}>
                Donate
            </LinkMenuItem>
            <MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
        </Menu>
        <Menu ref={r => menu_settings_ref = r} onToggleOpen={(v) => setIs_menu_settings_open(v)}>
            <MenuHeader>
                <Switch>
                    <Match when={props[_randomizerType] == RandomizerType[_string]}>String</Match>
                    <Match when={props[_randomizerType] == RandomizerType[_words]}>Words</Match>
                    <Match when={props[_randomizerType] == RandomizerType[_numbers]}>Numbers</Match>
                    <Match when={props[_randomizerType] == RandomizerType[_colors]}>Colors</Match>
                    <Match when={props[_randomizerType] == RandomizerType[_selection]}>Selection</Match>
                    <Match when={props[_randomizerType] == RandomizerType[_teams]}>Teams</Match>
                </Switch>
            </MenuHeader>
            <Show when={props[_randomizerType] == RandomizerType[_numbers] || props[_randomizerType] == RandomizerType[_words]}>
                <MenuItem
                    checked={isRepeat()}
                    leading={<Icon code={0xE0A1}/>}
                    onClick={() => props[_command](Commands[_toggle_settings_repeat])}
                    trailing={<MenuIndent/>}>
                    Repeat
                </MenuItem>
            </Show>

            <MenuItem
                checked={isAnimation()}
                onClick={() => props[_command](Commands[_toggle_settings_animation])}
                leading={<Icon code={0xECBA}/>}
                trailing={<MenuIndent/>}>
                Animation
            </MenuItem>

            <MenuDivider/>

            {/* Numbers */}
            <Show when={props[_randomizerType] == RandomizerType[_numbers]}>
                <SubMenu 
                    ref={r => submenu_sort_ref = r} 
                    level={1}
                    onToggleOpen={(v) => setIs_submenu_sort_open(v)}
                    item={<MenuItem
                        focused={is_submenu_sort_open()}
                        selected={false}
                        leading={<Icon code={0xE123}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Sort
                    </MenuItem>}>
                    <MenuItem
                        leading={<Icon code={0xE11F}/>}
                        onClick={() => changeNumbersSort(NumbersRandomizerSort[_none])}
                        selected={settings()[_numbers][_sort] == NumbersRandomizerSort[_none]}>
                        None
                    </MenuItem>
                    <MenuItem
                        leading={<Icon code={0xF187}/>}
                        onClick={() => changeNumbersSort(NumbersRandomizerSort[_ascending])}
                        selected={settings()[_numbers][_sort] == NumbersRandomizerSort[_ascending]}>
                        Ascending
                    </MenuItem>
                    <MenuItem
                        leading={<Icon code={0xF189}/>}
                        onClick={() => changeNumbersSort(NumbersRandomizerSort[_descending])}
                        selected={settings()[_numbers][_sort] == NumbersRandomizerSort[_descending]}>
                        Descending
                    </MenuItem>
                </SubMenu>
                <SubMenu ref={r => submenu_numberType_ref = r} level={1}
                    onToggleOpen={(v) => setIs_submenu_numberType_open(v)}
                    item={<MenuItem
                        focused={is_submenu_numberType_open()}
                        selected={false}
                        leading={<Icon code={0xEB4B}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Number type
                    </MenuItem>}>
                    <MenuItem
                        onClick={() => changeNumbersType(NumbersRandomizerNumberType[_decimal])}
                        selected={settings()[_numbers][_numberType] == NumbersRandomizerNumberType[_decimal]}>
                        Decimal
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeNumbersType(NumbersRandomizerNumberType[_hexadecimal])}
                        selected={settings()[_numbers][_numberType] == NumbersRandomizerNumberType[_hexadecimal]}>
                        Hexadecimal
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeNumbersType(NumbersRandomizerNumberType[_octal])}
                        selected={settings()[_numbers][_numberType] == NumbersRandomizerNumberType[_octal]}>
                        Octal
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeNumbersType(NumbersRandomizerNumberType[_binary])}
                        selected={settings()[_numbers][_numberType] == NumbersRandomizerNumberType[_binary]}>
                        Binary
                    </MenuItem>
                </SubMenu>
            </Show>

            {/* Words */}
            <Show when={props[_randomizerType] == RandomizerType[_words]}>
                <SubMenu ref={r => submenu_wordCase_ref = r} level={1}
                    onToggleOpen={(v) => setIs_submenu_wordCase_open(v)}
                    item={<MenuItem
                        focused={is_submenu_wordCase_open()}
                        selected={false}
                        leading={<Icon code={0xF0FF}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Word case
                    </MenuItem>}>
                    <MenuItem
                        onClick={() => changeWordsWordCase(WordsRandomizerWordCase[_none])}
                        selected={settings()[_words][_wordCase] == WordsRandomizerWordCase[_none]}>
                        Default
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeWordsWordCase(WordsRandomizerWordCase[_uppercase])}
                        selected={settings()[_words][_wordCase] == WordsRandomizerWordCase[_uppercase]}>
                        UPPER CASE
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeWordsWordCase(WordsRandomizerWordCase[_lowercase])}
                        selected={settings()[_words][_wordCase] == WordsRandomizerWordCase[_lowercase]}>
                        lower case
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeWordsWordCase(WordsRandomizerWordCase[_titlecase])}
                        selected={settings()[_words][_wordCase] == WordsRandomizerWordCase[_titlecase]}>
                        Title Case
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeWordsWordCase(WordsRandomizerWordCase[_togglecase])}
                        selected={settings()[_words][_wordCase] == WordsRandomizerWordCase[_togglecase]}>
                        tOGGLE cASE
                    </MenuItem>
                </SubMenu>
            </Show>

            {/* Colors */}
            <Show when={props[_randomizerType] == RandomizerType[_colors]}>
                <SubMenu ref={r => submenu_colorModel_ref = r} style={{width: '128px'}} level={1}
                    onToggleOpen={(v) => setIs_submenu_colorModel_open(v)}
                    item={<MenuItem
                        focused={is_submenu_colorModel_open()}
                        selected={false}
                        leading={<Icon code={0xE4B6}/>}
                        trailing={<Icon filled code={0xE368}/>}>
                        Color model
                    </MenuItem>}>
                    <MenuItem
                        onClick={() => changeColorsColorModel(ColorsRandomizerColorModel[_hex])}
                        selected={settings()[_colors][_colorModel] == ColorsRandomizerColorModel[_hex]}>
                        HEX
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeColorsColorModel(ColorsRandomizerColorModel[_rgb])}
                        selected={settings()[_colors][_colorModel] == ColorsRandomizerColorModel[_rgb]}>
                        RGB
                    </MenuItem>
                    <MenuItem
                        onClick={() => changeColorsColorModel(ColorsRandomizerColorModel[_hsl])}
                        selected={settings()[_colors][_colorModel] == ColorsRandomizerColorModel[_hsl]}>
                        HSL
                    </MenuItem>
                </SubMenu>
            </Show>

            <SubMenu
                level={1}
                ref={r => submenu_theme_ref = r}
                onToggleOpen={v => setIs_submenu_theme_open(v)}
                item={<MenuItem
                    focused={is_submenu_theme_open()}
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
                ref={r => submenu_corner_ref = r}
                onToggleOpen={v => setIs_submenu_corner_open(v)}
                item={<MenuItem
                    focused={is_submenu_corner_open()}
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

            <Show when={props[_randomizerType] == RandomizerType[_numbers] || props[_randomizerType] == RandomizerType[_words]}>
                <MenuDivider/>
                <div class={ CSS.textfield_menu_item }>
                    <TextField
                        ref={r => textfield_prefix_ref = r}
                        labelText="Prefix"
                        onBlur={(ev) => props[_command](Commands[_change_settings_prefix], ev[_currentTarget][_value])}
                        leading={<Icon code={0xE043}/>}
                    />
                </div>
                <div class={ CSS.textfield_menu_item }>
                    <TextField
                        ref={r => textfield_suffix_ref = r}
                        labelText="Suffix"
                        onBlur={(ev) => props[_command](Commands[_change_settings_suffix], ev[_currentTarget][_value])}
                        leading={<Icon code={0xE02D}/>}
                    />
                </div>
                <div class={ CSS.textfield_menu_item }>
                    <TextField
                        ref={r => textfield_separator_ref = r}
                        labelText="Separator"
                        onBlur={(ev) => props[_command](Commands[_change_settings_separator], ev[_currentTarget][_value])}
                        leading={<Icon code={0xE4CF}/>}
                    />
                </div>
            </Show>
            <Show when={props[_randomizerType] == RandomizerType[_numbers]}>
                <div class={ CSS.textfield_menu_item }>
                    <NumberTextField
                        ref={r => textfield_decimalLength_ref = r}
                        min={0}
                        labelText="Min decimal length"
                        onFinalValueChanged={(v) => props[_command](Commands[_change_settings_numbers_minDecimalLength], v)}
                        leading={<Icon code={0xE599}/>}
                    />
                </div>
            </Show>
        </Menu>
    </>)
}

export default C