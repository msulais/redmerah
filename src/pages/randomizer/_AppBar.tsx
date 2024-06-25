import { type Component, Match, Show, Switch, createMemo, createSignal, onMount } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";
import { setAttribute, toggleAttribute } from "@/utils/attributes";
import { closePopover, openPopover } from "@/utils/popover";
import { addClassListModule } from "@/utils/element";
import { PopoverPosition } from "@/enums/position";
import { RootAttributes } from "@/enums/attributes";
import { ExternalLinks, RoutesLinks } from "@/enums/links";
import { ThemeData } from "@/enums/theme";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage";
import { LocalStorageKeys } from "@/enums/storage";
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorModel } from "./_enums";
import { _CENTER_BOTTOM_TO_LEFT, _RIGHT_CENTER_TO_BOTTOM, _URL, _actions, _animation, _ascending, _binary, _color, _colorModel, _colors, _contactEmail, _corner, _currentTarget, _dark, _decimal, _descending, _donate, _filled, _fullRound, _getFullYear, _hex, _hexadecimal, _history, _hsl, _includes, _light, _logo, _lowercase, _none, _numberType, _numbers, _octal, _prefix, _repeat, _rgb, _round, _selection, _semiRound, _separator, _settings, _share, _sharp, _sort, _src, _string, _suffix, _system, _teams, _theme, _titlecase, _togglecase, _uppercase, _value, _wordCase, _words } from "@/data/string";
import { encodeURL } from "@/utils/url";
import { getDocument, getNavigator, getRoot } from "@/data/window";
import type { Settings } from "./_types";
import logo from '@/assets/apps/randomizer-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Icon from "@/components/Icon";
import Button, { ButtonVariant } from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, MenuItemLink, NestedMenu } from "@/components/Menu";
import TextField, { NumberTextField, changeTextFieldValue } from "@/components/TextField";
import CSS from './_AppBar.module.scss';
import { CornerData } from "@/enums/corner";

type Props = {
    onGenerate: () => Promise<void>
    onStopGenerate: () => void
    onCopyResult: () => Promise<boolean>
    onBookmarkResult: () => Promise<boolean>
    randomizerType: RandomizerType
    settings: [Settings, SetStoreFunction<Settings>]
}

const C: Component<Props> = (props) => {
    const
        _textfield_menu_item = 'textfield_menu_item',
        _onStopGenerate = 'onStopGenerate',
        _onCopyResult   = 'onCopyResult',
        _onGenerate     = 'onGenerate',
        _randomizerType = 'randomizerType',
        _minDecimalLength = 'minDecimalLength'
    ;
    let infoMenuRef: HTMLElement
    let settingsMenuRef: HTMLElement
    let settingsThemeMenuRef: HTMLElement
    let settingsWordCaseMenuRef: HTMLElement
    let settingsSortMenuRef: HTMLElement
    let settingsNumberTypeMenuRef: HTMLElement
    let settingsColorModelMenuRef: HTMLElement
    const [theme                        , setTheme                          ] = createSignal<ThemeData>(ThemeData[_system])
    const [isInfoMenuOpen               , setIsInfoMenuOpen                 ] = createSignal<boolean>(false)
    const [isMoreMenuOpen               , setIsMoreMenuOpen                 ] = createSignal<boolean>(false)
    const [isSettingsMenuOpen           , setIsSettingsMenuOpen             ] = createSignal<boolean>(false)
    const [isSettingsThemeMenuOpen      , setIsSettingsThemeMenuOpen        ] = createSignal<boolean>(false)
    const [isSettingsCornerMenuOpen     , setIsSettingsCornerMenuOpen       ] = createSignal<boolean>(false)
    const [isSettingsColorModelMenuOpen , setIsSettingsColorModelMenuOpen   ] = createSignal<boolean>(false)
    const [isSettingsWordCaseMenuOpen   , setIsSettingsWordCaseMenuOpen     ] = createSignal<boolean>(false)
    const [isSettingsSortMenuOpen       , setIsSettingsSortMenuOpen         ] = createSignal<boolean>(false)
    const [isSettingsNumberTypeMenuOpen , setIsSettingsNumberTypeMenuOpen   ] = createSignal<boolean>(false)
    const [copyTimeoutId                , setCopyTimeoutId                  ] = createSignal<number | null>(null)
    const [isGenerating                 , setIsGenerating                   ] = createSignal<boolean>(false)
    const [infoBtnRef, setInfoBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [settingsBtnRef, setSettingsBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [copyBtnRef, setCopyBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const settings      = createMemo<Settings>(() => props[_settings][0])
    const setSettings   = createMemo<SetStoreFunction<Settings>>(() => props[_settings][1])
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
    let prefixInputRef: HTMLInputElement | undefined
    let suffixInputRef: HTMLInputElement | undefined
    let separatorInputRef: HTMLInputElement | undefined
    let decimalLengthInputRef: HTMLInputElement | undefined
    let settingsCornerMenuRef: HTMLElement

    function toggleAnimation(): void {
        const s = setSettings()
        const randomizerType = props[_randomizerType]
        if (randomizerType == RandomizerType[_numbers   ]) s(_numbers    , _animation, a => !a)
        if (randomizerType == RandomizerType[_words     ]) s(_words      , _animation, a => !a)
        if (randomizerType == RandomizerType[_string    ]) s(_string     , _animation, a => !a)
        if (randomizerType == RandomizerType[_selection ]) s(_selection  , _animation, a => !a)
        if (randomizerType == RandomizerType[_colors    ]) s(_colors     , _animation, a => !a)
        if (randomizerType == RandomizerType[_teams     ]) s(_teams      , _animation, a => !a)
    }

    function toggleRepeat(): void {
        const s = props[_settings][1]
        switch (props[_randomizerType]){
            case RandomizerType[_numbers]: return s(_numbers, _repeat, r => !r)
            case RandomizerType[_words  ]: return s(_words  , _repeat, r => !r)
        }
    }

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

    async function changeNumbersSort(sort: NumbersRandomizerSort): Promise<void> {
        setSettings()(_numbers, _sort, sort)
        await closePopover(settingsSortMenuRef)
        await closePopover(settingsMenuRef)
    }

    async function changeNumbersType(type: NumbersRandomizerNumberType): Promise<void> {
        setSettings()(_numbers, _numberType, type)
        await closePopover(settingsNumberTypeMenuRef)
        await closePopover(settingsMenuRef)
    }

    function onPrefixInputBlur(ev: Event): void {
        if (props[_randomizerType] == RandomizerType[_numbers]){
            setSettings()(_numbers, _prefix, (ev[_currentTarget] as HTMLInputElement)[_value])
        }
    }

    function onSuffixInputBlur(ev: Event): void {
        if (props[_randomizerType] == RandomizerType[_numbers]){
            setSettings()(_numbers, _suffix, (ev[_currentTarget] as HTMLInputElement)[_value])
        }
    }

    function onSeparatorLengthInputBlur(ev: Event): void {
        if (props[_randomizerType] == RandomizerType[_numbers]){
            setSettings()(_numbers, _separator, (ev[_currentTarget] as HTMLInputElement)[_value])
        }
    }

    function initInputs(): void {
        const s = settings()
        if (props[_randomizerType] == RandomizerType[_numbers]) {
            if (prefixInputRef) changeTextFieldValue(prefixInputRef, s[_numbers][_prefix])
            if (suffixInputRef) changeTextFieldValue(suffixInputRef, s[_numbers][_suffix])
            if (separatorInputRef) changeTextFieldValue(separatorInputRef, s[_numbers][_separator])
            if (decimalLengthInputRef) changeTextFieldValue(decimalLengthInputRef, `${s[_numbers][_minDecimalLength]}`)
        } else if (props[_randomizerType] == RandomizerType[_words]) {
            if (prefixInputRef) changeTextFieldValue(prefixInputRef, s[_words][_prefix])
            if (suffixInputRef) changeTextFieldValue(suffixInputRef, s[_words][_suffix])
            if (separatorInputRef) changeTextFieldValue(separatorInputRef, s[_words][_separator])
        }
    }

    async function changeWordsWordCase(wordCase: WordsRandomizerWordCase): Promise<void> {
        setSettings()(_words, _wordCase, wordCase)
        await closePopover(settingsWordCaseMenuRef)
        await closePopover(settingsMenuRef)
    }

    async function changeColorsColorModel(colorModel: ColorsRandomizerColorModel): Promise<void> {
        setSettings()(_colors, _colorModel, colorModel)
        await closePopover(settingsColorModelMenuRef)
        await closePopover(settingsMenuRef)
    }

    onMount(() => {
        initTheme()
        initCorner()
    })

    return (<>
        <header class={ CSS.appbar }>
            <div class={ CSS[_logo] }><img src={logo[_src]} alt="Randomizer" />Randomizer</div>
            <div class={ CSS[_actions] }>
                <Button variant={ButtonVariant[_filled]} onClick={async () => {
                    if (isGenerating()) {
                        props[_onStopGenerate]()
                        setIsGenerating(false)
                        return
                    }
                    setIsGenerating(true)
                    await props[_onGenerate]()
                    setIsGenerating(false)
                }}><Icon 
                    filled 
                    classList={addClassListModule(CSS.generate_icon)} 
                    data-rotate={toggleAttribute(isGenerating())}
                    code={0xE143}/>
                    <Show when={isGenerating()} fallback="Generate">Generating</Show>
                </Button>

                <Tooltip text="Info" anchor={infoBtnRef()}/>
                <Button ref={r => setInfoBtnRef(r)} focus={isInfoMenuOpen()} iconOnly onClick={(ev) => openPopover({
                    event: ev,
                    anchor: ev[_currentTarget],
                    popover: infoMenuRef,
                    padding: 4,
                    position: PopoverPosition[_CENTER_BOTTOM_TO_LEFT]
                })}><Icon code={0xE930}/></Button>

                <Tooltip text="Settings" anchor={settingsBtnRef()}/>
                <Button ref={r => setSettingsBtnRef(r)} focus={isSettingsMenuOpen()} iconOnly onClick={async (ev) => {
                    await openPopover({
                        event: ev,
                        anchor: ev[_currentTarget],
                        popover: settingsMenuRef,
                        padding: 4,
                        position: PopoverPosition[_CENTER_BOTTOM_TO_LEFT]
                    })
                    initInputs()
                }}><Icon code={0xEE0F}/></Button>

                <Tooltip text="Copy result" anchor={copyBtnRef()}/>
                <Button iconOnly ref={r => setCopyBtnRef(r)} onClick={async () => {
                    const success = await props[_onCopyResult]()
                    if (!success) return;

                    if (copyTimeoutId()) clearTimeDelayed(copyTimeoutId()!)

                    setCopyTimeoutId(setTimeDelayed(() => {
                        setCopyTimeoutId(null)
                    }, 1000))
                }}>
                    <Show when={copyTimeoutId()} fallback={<Icon code={0xE51B}/>}><Icon code={0xE3D8}/></Show>
                </Button>
            </div>
        </header>
        <Menu ref={r => infoMenuRef = r} onToggle={(v) => setIsInfoMenuOpen(v)}>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={RoutesLinks.home}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<img src={redmerahLogo[_src]} width={20} alt='Redmerah logo'/>}>
                Redmerah (homepage)
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={RoutesLinks.apps}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE063}/>}>
                More apps
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={RoutesLinks.about}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xE930}/>}>
                About us
            </MenuItemLink>
            <MenuDivider />
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={RoutesLinks.privacy}
                openInNewTab
                trailing={<Icon code={0xEB51}/>}
                leading={<Icon code={0xEE51}/>}>
                Privacy policy
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
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
                    closePopover(infoMenuRef)
                }}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Color Generator')}
                leading={<Icon code={0xE3A0}/>}>
                Send feedback
            </MenuItemLink>
            <MenuItemLink
                onClick={() => closePopover(infoMenuRef)}
                href={ExternalLinks[_donate]}
                openInNewTab
                leading={<Icon code={0xE84B}/>}>
                Donate
            </MenuItemLink>
            <MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
        </Menu>
        <Menu ref={r => settingsMenuRef = r} onToggle={(v) => setIsSettingsMenuOpen(v)}>
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
                    onClick={() => toggleRepeat()}
                    trailing={<MenuIndent/>}>
                    Repeat
                </MenuItem>
            </Show>

            <MenuItem
                checked={isAnimation()}
                onClick={() => toggleAnimation()}
                leading={<Icon code={0xECBA}/>}
                trailing={<MenuIndent/>}>
                Animation
            </MenuItem>

            <MenuDivider/>

            {/* Numbers */}
            <Show when={props[_randomizerType] == RandomizerType[_numbers]}>
                <NestedMenu 
                    ref={r => settingsSortMenuRef = r} 
                    level={1}
                    onToggle={(v) => setIsSettingsSortMenuOpen(v)}
                    item={<MenuItem
                        focus={isSettingsSortMenuOpen()}
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
                </NestedMenu>
                <NestedMenu ref={r => settingsNumberTypeMenuRef = r} level={1}
                    onToggle={(v) => setIsSettingsNumberTypeMenuOpen(v)}
                    item={<MenuItem
                        focus={isSettingsNumberTypeMenuOpen()}
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
                </NestedMenu>
            </Show>

            {/* Words */}
            <Show when={props[_randomizerType] == RandomizerType[_words]}>
                <NestedMenu ref={r => settingsWordCaseMenuRef = r} level={1}
                    onToggle={(v) => setIsSettingsWordCaseMenuOpen(v)}
                    item={<MenuItem
                        focus={isSettingsWordCaseMenuOpen()}
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
                </NestedMenu>
            </Show>

            {/* Colors */}
            <Show when={props[_randomizerType] == RandomizerType[_colors]}>
                <NestedMenu ref={r => settingsColorModelMenuRef = r} style={{width: '128px'}} level={1}
                    onToggle={(v) => setIsSettingsColorModelMenuOpen(v)}
                    item={<MenuItem
                        focus={isSettingsColorModelMenuOpen()}
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
                </NestedMenu>
            </Show>

            <NestedMenu
                level={1}
                ref={r => settingsThemeMenuRef = r}
                onToggle={v => setIsSettingsThemeMenuOpen(v)}
                item={<MenuItem
                    data-focus={toggleAttribute(isSettingsThemeMenuOpen())}
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
                onToggle={v => setIsSettingsCornerMenuOpen(v)}
                item={<MenuItem
                    focus={isSettingsCornerMenuOpen()}
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

            <Show when={props[_randomizerType] == RandomizerType[_numbers] || props[_randomizerType] == RandomizerType[_words]}>
                <MenuDivider/>
                <div class={ CSS[_textfield_menu_item] }>
                    <TextField
                        ref={r => prefixInputRef = r}
                        labelText="Prefix"
                        onBlur={onPrefixInputBlur}
                        leading={<Icon code={0xE043}/>}
                    />
                </div>
                <div class={ CSS[_textfield_menu_item] }>
                    <TextField
                        ref={r => suffixInputRef = r}
                        labelText="Suffix"
                        onBlur={onSuffixInputBlur}
                        leading={<Icon code={0xE02D}/>}
                    />
                </div>
                <div class={ CSS[_textfield_menu_item] }>
                    <TextField
                        ref={r => separatorInputRef = r}
                        labelText="Separator"
                        onBlur={onSeparatorLengthInputBlur}
                        leading={<Icon code={0xE4CF}/>}
                    />
                </div>
            </Show>
            <Show when={props[_randomizerType] == RandomizerType[_numbers]}>
                <div class={ CSS.textfield_menu_item }>
                    <NumberTextField
                        ref={r => decimalLengthInputRef = r}
                        min={0}
                        labelText="Min decimal length"
                        onFinalValueChanged={(v) => setSettings()(_numbers, _minDecimalLength, v)}
                        leading={<Icon code={0xE599}/>}
                    />
                </div>
            </Show>
        </Menu>
    </>)
}

export default C