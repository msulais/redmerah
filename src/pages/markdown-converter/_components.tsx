import { type Component, Show, createEffect, createMemo, createSignal, createUniqueId, onMount } from 'solid-js'
import { type SetStoreFunction, createStore } from "solid-js/store"
import { marked } from 'marked'
import beautiful from 'simply-beautiful'

import { toggleAttribute, setAttribute } from '@/utils/attributes'
import { closePopover, openPopover } from '@/utils/popover'
import { markdownTextDefault } from './_markdown'
import { addClassListModule, createElement, getElementById } from '@/utils/element'
import { addEventListener } from '@/utils/event'
import { PopoverPosition } from '@/enums/position'
import { cssTextDefault } from './_css'
import { BodyAttributes, RootAttributes } from '@/enums/attributes'
import { ExternalLinks, RoutesLinks } from '@/enums/links'
import { ThemeData } from '@/enums/theme'
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/storage'
import { DatabaseNames, LocalStorageKeys } from '@/enums/storage'
import { _CENTER_BOTTOM, _RIGHT_CENTER, _RIGHT_CENTER_TO_BOTTOM, _URL, _accept, _add, _altKey, _boolean, _change, _click, _clientWidth, _clientX, _clipboard, _code, _contentWindow, _corner, _createObjectStore, _css, _ctrlKey, _currentTarget, _dark, _db, _download, _exitFullscreen, _file, _files, _fontSize, _fullRound, _fullscreenElement, _fullscreenchange, _get, _href, _html, _id, _includes, _input, _key, _keydown, _length, _light, _load, _markdown, _matches, _metaKey, _min, _mousemove, _mouseup, _newVersion, _noPointerEvent, _number, _objectStore, _oldVersion, _open, _preview, _print, _put, _px, _query, _readAsText, _readonly, _readwrite, _requestFullscreen, _reset, _resize, _result, _round, _semiRound, _setting, _settings, _share, _sharp, _shiftKey, _src, _system, _target, _text, _textWrap, _theme, _toggleAttribute, _touchend, _touches, _touchmove, _transaction, _type, _update, _value, _writeText } from '@/data/string'
import { setTimeDelayed } from '@/utils/timeout'
import { getDocument, getDocumentBody, getNavigator, getRoot, getWindow } from '@/data/window'
import { mathMax, mathMin } from '@/utils/math'
import { createObjectURL, downloadFileByURL, encodeURL, revokeObjectURL } from '@/utils/url'
import { isMatchMedia } from '@/utils/window'
import { getDate_Y } from '@/utils/datetime'
import { IDB } from '@/class/indexeddb'
import { CornerData } from '@/enums/corner'
import { ObjectStoreKeys, ObjectStoreNames } from './_storage'
import { isBoolean, isNumber } from '@/utils/typecheck'
import logo from '@/assets/markdown-converter/logo.svg'
import redmerahLogo from '@/assets/logo.svg'
import cssLogo from '@/assets/css-logo.svg'
import htmlLogo from '@/assets/html-logo.svg'

import Tooltip from '@/components/Tooltip'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemLink, MenuItemTrailingKeyboardShortcut, NestedMenu } from '@/components/Menu'
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

const _settings_fontSize = 'settings_fontSize'
const _settings_textWrap = 'settings_textWrap'
const _isSmallScreen = 'isSmallScreen'
const _onOpenFile = 'onOpenFile'
const _onChangeFontSize = 'onChangeFontSize'
const _isTouchDevice = 'isTouchDevice'
const _onDownloadFile = 'onDownloadFile'
const _onCopyAll = 'onCopyAll'

type Settings = {
    textWrap: boolean
    fontSize: number
}

type MenuBarProps = {
    settings: [Settings, SetStoreFunction<Settings>]
    inputId: string
    isSmallScreen: boolean
    isTouchDevice: boolean
    onOpenFile: (text: string) => void
    onDownloadFile: (type: 'css' | 'markdown' | 'html') => void
    onChangeFontSize: (type: 'add' | 'min' | 'reset') => void
    onCopyAll: (type: 'css' | 'markdown' | 'html') => void
    db: IDB
}

const MenuBar: Component<MenuBarProps> = (props) => {
    const [isFileFocus, setIsFileFocus] = createSignal<boolean>(false)
    const [isFileDownloadFocus, setIsFileDownloadFocus] = createSignal<boolean>(false)
    const [isFileCopyAllFocus, setIsFileCopyAllFocus] = createSignal<boolean>(false)
    const [isViewFocus, setIsViewFocus] = createSignal<boolean>(false)
    const [isSettingsFocus, setIsSettingsFocus] = createSignal<boolean>(false)
    const [isSettingsThemeFocus, setIsSettingsThemeFocus] = createSignal<boolean>(false)
    const [isSettingsCornerFocus, setIsSettingsCornerFocus] = createSignal<boolean>(false)
    const [isFullscreen, setIsFullscreen] = createSignal<boolean>(false)
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
    const popoverPosition = createMemo<PopoverPosition>(() => props[_isSmallScreen]
        ? PopoverPosition[_CENTER_BOTTOM]
        : PopoverPosition[_RIGHT_CENTER_TO_BOTTOM]
    )
    const tooltipPosition = createMemo<PopoverPosition>(() => props[_isSmallScreen]
        ? PopoverPosition[_CENTER_BOTTOM]
        : PopoverPosition[_RIGHT_CENTER]
    )
    const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
    const [fileBtnRef, setFileBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [viewBtnRef, setViewBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [settingsBtnRef, setSettingsBtnRef] = createSignal<HTMLButtonElement | null>(null)
    let openFileInputElement: HTMLInputElement
    let newConverterRef: HTMLAnchorElement
    let fileMenuRef: HTMLElement
    let fileDownloadMenuRef: HTMLElement
    let fileCopyAllMenuRef: HTMLElement
    let viewMenuRef: HTMLElement
    let settingsMenuRef: HTMLElement
    let settingsThemeMenuRef: HTMLElement
    let settingsCornerMenuRef: HTMLElement

    function checkKey([ctrlKey, altKey, shiftKey, metaKey]: boolean[]): boolean {
        return ctrlKey && altKey && metaKey && shiftKey
    }

    async function downloadFile(type: 'markdown' | 'css' | 'html'): Promise<void> {
        props[_onDownloadFile](type)
        await closePopover(fileDownloadMenuRef)
        await closePopover(fileMenuRef)
    }

    async function copyAll(type: 'markdown' | 'css' | 'html'): Promise<void> {
        props[_onCopyAll](type)
        await closePopover(fileCopyAllMenuRef)
        await closePopover(fileMenuRef)
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

    function initFullscreenListener(): void {
        addEventListener(getRoot(), _fullscreenchange, ev => {
            setIsFullscreen(getDocument()[_fullscreenElement] != null)
        })
    }

    function initAndListenFileInput() {
        openFileInputElement = createElement(_input);
        openFileInputElement[_type] = _file;
        openFileInputElement[_accept] = 'text/markdown,.md'

        addEventListener(openFileInputElement, _change, () => {
            if (openFileInputElement[_files]![_length] <= 0) return

            const reader = new FileReader();
            reader[_readAsText](openFileInputElement[_files]![0]);
            addEventListener(reader, _load, ev => {
                const t = (ev as ProgressEvent<FileReader>)[_target];
                if (t == null) return;
                props[_onOpenFile](t[_result] as string)
            })
        })
    }

    function listenKeysShortcut(): void {
        addEventListener(getDocument(), _keydown, (ev) => {
            const evt = ev as KeyboardEvent

            const
                ctrl: boolean = evt[_ctrlKey],
                alt: boolean = evt[_altKey],
                shift: boolean = evt[_shiftKey],
                meta: boolean = evt[_metaKey]
            ;

            // Ctrl+Alt+F
            if (checkKey([ctrl, alt, !shift, !meta]) && evt[_code] == 'KeyF') {
                if (isFullscreen()) {
                    getDocument()[_exitFullscreen]()
                } else {
                    getRoot()[_requestFullscreen]()
                }
                return
            }

            // Ctrl+Alt+N
            if (checkKey([ctrl, alt, !shift, !meta]) && evt[_code] == 'KeyN') {
                newConverterRef[_click]()
                return
            }

            // Ctrl+Alt+O
            if (checkKey([ctrl, alt, !shift, !meta]) && evt[_code] == 'KeyO') {
                openFileInputElement[_click]()
                return
            }

            // Ctrl+Alt+P
            if (checkKey([ctrl, alt, !shift, !meta]) && evt[_code] == 'KeyP') {
                const iframe = getElementById(_preview) as HTMLIFrameElement
                if (iframe[_contentWindow]) iframe[_contentWindow][_print]()
                return
            }

            // Ctrl+Alt+ =
            if (checkKey([ctrl, alt, !shift, !meta]) && evt[_code] == 'Equal') {
                props[_onChangeFontSize](_reset)
                return
            }

            // Ctrl+ <
            if (checkKey([ctrl, !alt, !shift, !meta]) && evt[_code] == 'Comma') {
                props[_onChangeFontSize](_min)
                return
            }

            // Ctrl+ >
            if (checkKey([ctrl, !alt, !shift, !meta]) && evt[_code] == 'Period') {
                props[_onChangeFontSize](_add)
                return
            }
        })
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
        initFullscreenListener()
        initAndListenFileInput()
        listenKeysShortcut()
        initTheme()
        initCorner()
    })

    const FileMenu: Component = () => (<>
        <Menu style={{width: props[_isTouchDevice]? undefined : '240px'}} ref={r => fileMenuRef = r} onToggle={(v) => setIsFileFocus(v)}>
            <MenuItemLink
                ref={(r) => newConverterRef = r}
                openInNewTab
                href={getDocument()[_URL]}
                onClick={() => closePopover(fileMenuRef)}
                leading={<Icon code={0xEB51}/>}
                trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', 'N']} />}>
                New
            </MenuItemLink>

            <MenuItem
                onClick={() => {
                    openFileInputElement[_click]()
                    closePopover(fileMenuRef)
                }}
                leading={<Icon code={0xEB53}/>}
                trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', 'O']} />}>
                Open
            </MenuItem>
            <MenuDivider />
            <NestedMenu
                ref={r => fileDownloadMenuRef = r}
                level={1}
                style={{width: '164px'}}
                onToggle={v => setIsFileDownloadFocus(v)}
                item={<MenuItem
                    leading={<Icon code={0xE0B3}/>}
                    trailing={<Icon filled code={0xE368}/>}
                    data-focus={toggleAttribute(isFileDownloadFocus())}>
                    Donwload
                </MenuItem>}>
                <MenuItem 
                    onClick={() => downloadFile(_markdown)}
                    leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--color-on-surface))"/>
                    </svg>}>
                    Markdown
                </MenuItem>
                <MenuItem 
                    onClick={() => downloadFile(_html)}
                    leading={<img width={20} src={htmlLogo[_src]} alt="HTML logo"/>}>
                    HTML
                </MenuItem>
                <MenuItem 
                    onClick={() => downloadFile(_css)}
                    leading={<img width={20} src={cssLogo[_src]} alt="CSS logo"/>}>
                    CSS
                </MenuItem>
            </NestedMenu>
            <NestedMenu
                ref={r => fileCopyAllMenuRef = r}
                level={1}
                onToggle={v => setIsFileCopyAllFocus(v)}
                style={{width: '164px'}}
                item={<MenuItem
                    leading={<Icon code={0xE51B}/>}
                    trailing={<Icon filled code={0xE368}/>}
                    data-focus={toggleAttribute(isFileCopyAllFocus())}>
                    Copy all
                </MenuItem>}>
                <MenuItem 
                    onClick={() => copyAll(_markdown)}
                    leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--color-on-surface))"/>
                    </svg>}>
                    Markdown
                </MenuItem>
                <MenuItem 
                    onClick={() => copyAll(_html)}
                    leading={<img width={20} src={htmlLogo[_src]} alt="HTML logo"/>}>
                    HTML
                </MenuItem>
                <MenuItem 
                    onClick={() => copyAll(_css)}
                    leading={<img width={20} src={cssLogo[_src]} alt="CSS logo"/>}>
                    CSS
                </MenuItem>
            </NestedMenu>
            <MenuDivider />
            <MenuItem
                onClick={() => {
                    closePopover(fileMenuRef)
                    const iframe = getElementById(_preview) as HTMLIFrameElement
                    if (iframe[_contentWindow]) iframe[_contentWindow][_print]()
                }}
                leading={<Icon code={0xECFF}/>}
                trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', 'P']} />}>
                Print
            </MenuItem>
        </Menu>
    </>)

    const ViewMenu: Component = () => (<Menu 
        ref={r => viewMenuRef = r} style={{width: props[_isTouchDevice]? undefined : '280px'}} onToggle={(v) => setIsViewFocus(v)}>
        <MenuItem
            onClick={() => {
                props[_settings][1](_textWrap, t => !t)
                closePopover(viewMenuRef)

                const settingsObjectStoreWrite = props[_db]![_transaction](ObjectStoreNames[_settings], _readwrite)![_objectStore](ObjectStoreNames[_settings])
                if (!settingsObjectStoreWrite) return;
                props[_db][_put](
                    settingsObjectStoreWrite, 
                    {key: ObjectStoreKeys[_settings_textWrap], value: props[_settings][0][_textWrap]}
                )
            }}
            checked={props[_settings][0][_textWrap]}>
            Text wrap
        </MenuItem>
        <MenuDivider />
        <MenuItem
            onClick={() => props[_onChangeFontSize](_add)}
            leading={<Icon code={0xF333}/>}
            trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', '>']} />}>
            Increase font size
        </MenuItem>
        <MenuItem
            onClick={() => props[_onChangeFontSize](_min)}
            leading={<Icon code={0xF335}/>}
            trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', '<']} />}>
            Decrease font size
        </MenuItem>
        <MenuItem
            onClick={() => props[_onChangeFontSize](_reset)}
            leading={<Icon code={0xEDDF}/>}
            trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', '=']} />}>
            Reset font size
        </MenuItem>
        <MenuDivider />
        <Show
            when={!isFullscreen()}
            fallback={<MenuItem
                onClick={() => {
                    getDocument()[_exitFullscreen]()
                    closePopover(viewMenuRef)
                }}
                leading={<Icon code={0xE833}/>}
                trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', 'F']} />}>
                Exit fullscreen
            </MenuItem>}>
            <MenuItem
                onClick={() => {
                    getRoot()[_requestFullscreen]()
                    closePopover(viewMenuRef)
                }}
                leading={<Icon code={0xE831}/>}
                trailing={props[_isTouchDevice] ? undefined : <MenuItemTrailingKeyboardShortcut shortcuts={['Ctrl', 'Alt', 'F']} />}>
                Fullscreen
            </MenuItem>
        </Show>
    </Menu>)

    const SettingsMenu: Component = () => (<>
        <Menu ref={r => settingsMenuRef = r} onToggle={(v) => setIsSettingsFocus(v)}>
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
                    getNavigator()[_share]({title: 'Markdown Converter', text: 'Markdown Converter', url: getDocument()[_URL]})
                    closePopover(settingsMenuRef)
                }}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <MenuItemLink
                onClick={() => closePopover(settingsMenuRef)}
                href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURL('Markdown Converter')}
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
        </Menu>
    </>)

    return (<div class={CSS.menuBar}>
        <div class={ CSS.logo }>
            <img width={24} height={24} src={ logo.src } alt="Markdown converter logo icon" />
        </div>
        <div class={ CSS.flex }>Markdown Converter</div>
        <Tooltip anchor={fileBtnRef()} text='File' position={tooltipPosition()}/>
        <Button
            focus={isFileFocus()}
            ref={r => setFileBtnRef(r)}
            iconOnly
            onClick={(ev) => openPopover({
                event: ev,
                anchor: ev[_currentTarget],
                popover: fileMenuRef,
                position: popoverPosition()
            })}>
            <Icon code={0xEDA1}/>
        </Button>
        <FileMenu/>

        <Tooltip anchor={viewBtnRef()} text='View' position={tooltipPosition()}/>
        <Button
            iconOnly
            ref={r => setViewBtnRef(r)}
            focus={isViewFocus()}
            onClick={(ev) => openPopover({
                event: ev,
                anchor: ev[_currentTarget],
                popover: viewMenuRef,
                position: popoverPosition()
            })}>
            <Icon code={0xE77B}/>
        </Button>
        <ViewMenu/>

        <Tooltip anchor={settingsBtnRef()} text='Settings' position={tooltipPosition()}/>
        <Button
            iconOnly
            classList={addClassListModule(CSSAnimation.btn_rotate_icon)}
            ref={r => setSettingsBtnRef(r)}
            focus={isSettingsFocus()}
            onClick={(ev) => openPopover({
                event: ev,
                anchor: ev[_currentTarget],
                popover: settingsMenuRef,
                position: popoverPosition()
            })}>
            <Icon code={0xEE0F}/>
        </Button>
        <SettingsMenu/>
    </div>)
}

export const App: Component = () => {
    const db = new IDB(DatabaseNames.markdownConverter, 1)
    const menuBarWidth = 48 + 2 // 2 = gap
    const minEditorWidth = 240
    const defaultFontSize = 14
    const smallScreenWidth = 650
    const [inputEditorWidth, setInputEditorWidth] = createSignal<number>(360)
    const [isDragging, setIsDragging] = createSignal<boolean>(false)
    const [isOnePane, setIsOnePane] = createSignal<boolean>(false)
    const [inputTab, setInputTab] = createSignal<'markdown' | 'css' | null>(_markdown)
    const [outputTab, setOutputTab] = createSignal<'html' | 'preview' | null>(_preview)
    const [cssText, setCssText] = createSignal<string>(cssTextDefault)
    const [markdownText, setMarkdownText] = createSignal<string>(markdownTextDefault)
    const [inputText, setInputText] = createSignal<string>(markdownTextDefault)
    const [outputText, setOutputText] = createSignal<string>('')
    const [settings, setSettings] = createStore<Settings>({ 
        textWrap: true, 
        fontSize: defaultFontSize 
    })
    const [isSmallScreen, setIsSmallScreen] = createSignal<boolean>(false)
    const [isTouchDevice, setIsTouchDevice] = createSignal<boolean>(false)
    const textareaId: string = createUniqueId()
    let textareaRef!: HTMLTextAreaElement
    let outputTimeoutId: number | null = null

    function changeInputTab(tab: 'markdown' | 'css'): void {
        setInputTab(t => t == tab && outputTab() != null ? null : tab)

        if (inputTab() == null) return
        if (isSmallScreen()) setOutputTab(null)

        const text = inputTab() == _markdown ? markdownText() : cssText()
        setInputText(text)
        textareaRef[_value] = text
    }

    function changeOutputTab(tab: 'html' | 'preview') {
        setOutputTab(t => t == tab && inputTab() != null ? null : tab)

        if (outputTab() == null) return
        if (isSmallScreen()) setInputTab(null)
    }

    function updateOutput() {
        if (outputTimeoutId != null) {
            clearTimeout(outputTimeoutId)
        }
        outputTimeoutId = setTimeDelayed(() => {
            setOutputText(marked(markdownText(), { async: false }) as string)
            outputTimeoutId = null
        }, 500)
    }

    function initDragListener() {
        addEventListener(getDocument(), _touchend, () => setIsDragging(true))
        addEventListener(getDocument(), _touchmove, ev => {
            if (!isDragging()) return;
            
            setInputEditorWidth(mathMin(
                mathMax(minEditorWidth, (ev as TouchEvent)[_touches][0][_clientX] - menuBarWidth),
                getDocumentBody()[_clientWidth] - menuBarWidth - minEditorWidth
            ))
        })

        addEventListener(getDocument(), _mousemove, ev => {
            if (!isDragging()) return;

            setInputEditorWidth(mathMin(
                mathMax(minEditorWidth, (ev as MouseEvent)[_clientX] - menuBarWidth), 
                getDocumentBody()[_clientWidth] - menuBarWidth - minEditorWidth
            ))
        })
        addEventListener(getDocument(), _mouseup, () => setIsDragging(false))
        addEventListener(getWindow(), _resize, () => {
            setInputEditorWidth(width => mathMin(
                mathMax(minEditorWidth, width),
                getDocumentBody()[_clientWidth] - menuBarWidth - minEditorWidth
            ))
        })
    }

    function onChangeFontSize(type: "reset" | "add" | "min"): void {
        if (type == _add) setSettings(_fontSize, s => s + 2)
        else if (type == _min) setSettings(_fontSize, s => s - 2)
        else if (type == _reset) setSettings(_fontSize, defaultFontSize)

            
        const settingsObjectStoreWrite = db![_transaction](ObjectStoreNames[_settings], _readwrite)![_objectStore](ObjectStoreNames[_settings])
        if (!settingsObjectStoreWrite) return;
        db[_put](settingsObjectStoreWrite, {key: ObjectStoreKeys[_settings_fontSize], value: settings[_fontSize]})
    }

    function onCopyAll(type: "html" | "markdown" | "css"): void {
        let text = '';
        if (type == _markdown) text = markdownText()
        else if (type == _css) text = cssText()
        else if (type == _html) text = beautiful[_html]((marked(markdownText(), { async: false }) as string));
        getNavigator()[_clipboard][_writeText](text)
    }

    function onOpenFile(text: string): void {
        setMarkdownText(text)

        if (inputTab() != _markdown) return
        setInputText(text)
        textareaRef[_value] = text
        updateOutput()
    }

    function onDownloadFile(type: "html" | "markdown" | "css"): void {
        let text = ''
        let ext = ''
        if (type == _markdown) {
            text = markdownText()
            ext = 'md'
        } else if (type == _css) {
            text = cssText()
            ext = _css
        } else if (type == _html) {
            text = beautiful[_html](
                '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Markdown to html</title><style>'
                + cssText()
                + '</style><style>body{display:flex;justify-content:center;}body>article{width:720px;max-width:100%}</style></head><body><article>'
                + (marked(markdownText(), { async: false }) as string)
                + '</article></body></html>'
            )
            ext = 'html'
        }

        const blob = new Blob([text], { type: 'text/' + type })
        const url = createObjectURL(blob)
        downloadFileByURL(url, "markdown-converter." + ext)
        revokeObjectURL(url)
    }

    function initScreenWidthListener() {
        setIsSmallScreen(isMatchMedia(`(max-width: ${smallScreenWidth}px)`))
        addEventListener(matchMedia(`(max-width: ${smallScreenWidth}px)`), _change, ev => {
            setIsSmallScreen((ev as MediaQueryListEvent)[_matches])

            if (isOnePane() || !isSmallScreen()) return
            setOutputTab(null)
        })
    }

    function initDeviceTypeListener(): void {
        setIsTouchDevice(!isMatchMedia('(hover:hover)'))

        addEventListener(matchMedia('(hover:hover)'), _change, ev => {
            setIsTouchDevice((ev as MediaQueryListEvent)[_matches])
        })
    }

    async function initDatabase(): Promise<void> {
        try {
            await db[_open]({
                onSuccess(ev, db) {
                    initSettings()
                },
                onUpgradeNeeded(ev, db) {
                    if (!(ev[_oldVersion] == 0 && ev[_newVersion] == 1 && db)) return;
                    
                    db[_createObjectStore]({
                        name: ObjectStoreNames[_settings], 
                        keyPath: _key, 
                        indexs: [_key, _value]
                    })
                }
            })
        } catch (e) {}
    }

    async function initSettings(): Promise<void> {
        const settingsObjectStoreRead = db![_transaction](ObjectStoreNames[_settings], _readonly)![_objectStore](ObjectStoreNames[_settings])
        if (!settingsObjectStoreRead) return;

        try {
            const textWrap = await db[_get]<{key: string; value: boolean}>(settingsObjectStoreRead, ObjectStoreKeys[_settings_textWrap])
            if (isBoolean(textWrap[_value])) setSettings(_textWrap, textWrap[_value])

            const fontSize = await db[_get]<{key: string; value: number}>(settingsObjectStoreRead, ObjectStoreKeys[_settings_fontSize])
            if (isNumber(fontSize[_value])) setSettings(_fontSize, fontSize[_value])
        } catch (e) { }
    }

    createEffect(() => {
        setIsOnePane(
            (inputTab() == null && outputTab() != null) ||
            (inputTab() != null && outputTab() == null)
        )
    })

    createEffect(() => {
        getDocumentBody()[_toggleAttribute](BodyAttributes[_noPointerEvent], isDragging())
    })

    onMount(async () => {
        initDragListener()
        initScreenWidthListener()
        initDeviceTypeListener()
        setInputEditorWidth((getDocumentBody()[_clientWidth] - menuBarWidth) / 2)
        updateOutput()
        if (isSmallScreen()) setOutputTab(null)

        await initDatabase()
    })

    const Tabs: Component = () => {
        return (<div class={CSS.tabs} data-one-pane={toggleAttribute(isOnePane())}>
            <div style={{ width: isOnePane() ? undefined : inputEditorWidth() + _px }}>
                <Button
                    selected={inputTab() == _markdown}
                    onClick={() => changeInputTab(_markdown)}>Markdown</Button>
                <Button
                    selected={inputTab() == _css}
                    onClick={() => changeInputTab(_css)}>CSS</Button>
            </div>
            <div>
                <Button
                    selected={outputTab() == _preview}
                    onClick={() => { changeOutputTab(_preview) }}>Preview</Button>
                <Button
                    selected={outputTab() == _html}
                    onClick={() => changeOutputTab(_html)}>HTML</Button>
            </div>
        </div>)
    }

    const InputEditor: Component = () => {
        return (<div
            class={CSS.input}
            style={{ width: outputTab() == null
                ? undefined
                : inputEditorWidth() + _px
            }}
            data-hide={toggleAttribute(inputTab() == null)}
            data-only={toggleAttribute(outputTab() == null)}>
            <textarea
                ref={textareaRef}
                id={textareaId}
                placeholder={inputText().length == 0 ? `Type ${inputTab() == _markdown ? _markdown : 'CSS'} here ...` : undefined}
                data-text-wrap={toggleAttribute(settings[_textWrap])}
                value={markdownTextDefault}
                onInput={(ev) => {
                    setInputText(ev.currentTarget.value)
                    if (inputTab() == _markdown) {
                        setMarkdownText(inputText())
                        updateOutput()
                    }
                    if (inputTab() == _css) {
                        setCssText(inputText())
                    }
                }}
                data-input={inputTab()}>
            </textarea>
        </div>)
    }

    const OutputEditor: Component = () => {
        return (<div
            data-hide={toggleAttribute(outputTab() == null)}
            data-output={outputTab()}
            data-text-wrap={toggleAttribute(settings[_textWrap])}
            class={CSS.output}>
            <div
                data-hide={toggleAttribute(outputTab() == _preview)}>
                {beautiful[_html](outputText())}
            </div>
            <iframe
                id={_preview}
                title='Markdown output'
                classList={{ printable: true }}
                data-hide={toggleAttribute(outputTab() == _html)}
                srcdoc={`<style>${cssText()}</style>` + '<style>body{display:flex;justify-content:center;}body>article{width:720px;max-width:100%}</style>' + '<article>' + outputText() + '</article>'}
            ></iframe>
        </div>)
    }

    return (<div class={CSS.body} style={{ '--font-size': settings[_fontSize] + _px }}>
        <MenuBar
            isTouchDevice={isTouchDevice()}
            isSmallScreen={isSmallScreen()}
            settings={[settings, setSettings]}
            inputId={textareaId}
            onChangeFontSize={onChangeFontSize}
            onOpenFile={onOpenFile}
            onCopyAll={onCopyAll}
            onDownloadFile={onDownloadFile}
            db={db}
        />
        <main>
            <Tabs />
            <div class={CSS.editor}>
                <InputEditor />
                <Show when={!isOnePane()}>
                    <div
                        class={CSS.dragHandle}
                        data-keep-pointer-event={toggleAttribute(isDragging())}
                        onMouseDown={() => setIsDragging(true)}
                        onTouchStart={() => setIsDragging(true)}
                    ><div data-keep-pointer-event={toggleAttribute(isDragging())}></div></div>
                </Show>
                <OutputEditor />
            </div>
        </main>
    </div>)
}

export default App