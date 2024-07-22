import { For, Show, createSelector, createSignal, onMount, type VoidComponent } from "solid-js";

import Icon from "@/components/Icon";
import Button, { ButtonVariant, LinkButton } from "@/components/Button";
import Menu, { MenuDivider, MenuItem, MenuItemLink } from "@/components/Menu";
import TextField from "@/components/TextField";
import CSS from './_index.module.scss'

import { _CENTER_BOTTOM_TO_LEFT, _CENTER_BOTTOM_TO_RIGHT, _CENTER_CENTER_LEFT_TOP, _LEFT_CENTER_TO_BOTTOM, _clipboard, _color, _color_accent, _corner, _currentTarget, _dark, _description, _filled, _filledTonal, _fullRound, _hostname, _includes, _innerHTML, _join, _light, _link, _open, _outlined, _pinnedApps, _round, _semiRound, _share, _sharp, _some, _split, _system, _test, _theme, _title, _toLowerCase, _trim, _value, _writeText } from "@/data/string";
import { getLocalStorageItem, setLocalStorageItem } from "@/utils/storage";
import { toggleAttribute } from "@/utils/attributes";
import { closePopover, openPopover } from "@/utils/popover";
import { LocalStorageKeys } from "@/enums/storage";
import { PopoverPosition } from "@/enums/position";
import { getLocation, getNavigator, getWindow } from "@/data/window";
import { apps } from "@/data/apps";
import { preventDefault } from "@/utils/event";
import type { AppItem } from "@/types/apps";
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";
import Dialog from "@/components/Dialog";
import { closeModal, openModal } from "@/utils/modal";

export const MainElement: VoidComponent = () => {
    const [pinnedApps, setPinnedApps] = createSignal<string[]>([])
    const [selectedApp, setSelectedApp] = createSignal<AppItem | null>(null)
    const [searchText, setSearchText] = createSignal<string>('')
    const isSelected = createSelector<string[], string>(pinnedApps, (a, b) => b[_some]((v) => v == a))
    let infoDialogRef: HTMLDialogElement
    let actionMenuRef: HTMLDialogElement
    let timeoutId: number | null = null

    function pinApp(link: string): void {
        setPinnedApps(v => isSelected(link)? v.filter(a => a != link) :  [...v, link])
        setLocalStorageItem(LocalStorageKeys[_pinnedApps], pinnedApps()[_join](';'))
    }

    function initPinnedApp(): void {
        const pinnedApp = getLocalStorageItem(LocalStorageKeys[_pinnedApps])

        if (!pinnedApp) return;
        setPinnedApps(pinnedApp![_split](';'))
    }

    function share(): void {
        getNavigator()[_share]({
            text: selectedApp()?.title, 
            url: selectedApp()![_link]
        })
        closePopover(actionMenuRef)
    }

    onMount(() => {
        initPinnedApp()
    })

    return (<main class={CSS.main}>
        <TextField 
            onInput={(ev) => {
                if (timeoutId != null) clearTimeDelayed(timeoutId)

                const text = ev[_currentTarget][_value]
                
                timeoutId = setTimeDelayed(() => {
                    setSearchText(text)
                    timeoutId = null
                }, 500)
            }}
            autoShowClearBtn
            leading={<Icon code={0xEDDF} />} 
            labelText="Search apps" 
        />
        <div><For each={apps}>{app => <Show when={searchText()[_trim]() == '' || new RegExp(searchText()[_toLowerCase]()[_trim]()[_split](' ')[_join]('|'))[_test](app[_title][_toLowerCase]())}>
            <LinkButton 
                data-pinned={toggleAttribute(isSelected(app[_link]))}
                href={app[_link]}
                focus={selectedApp()![_link] == app[_link]}
                onContextMenu={ev => {
                    setSelectedApp(app)
                    openPopover({
                        event: ev, 
                        popover: actionMenuRef, 
                        position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                    })
                    preventDefault(ev)
                }}>
                <img src={app.logoURL} alt={app[_title]} />
                {app[_title]}
                <Show when={isSelected(app[_link])}>
                    <Icon filled code={0xECA2}/>
                </Show>
            </LinkButton>
        </Show>}</For></div>
        <Menu dragable ref={r => actionMenuRef = r} onToggle={v => setSelectedApp(a => v? a : null)}>
            <MenuItem 
                onClick={() => {
                    pinApp(selectedApp()![_link] ?? '#')
                    closePopover(actionMenuRef)
                }}
                leading={<Show when={isSelected(selectedApp()![_link] ?? '#')} fallback={<Icon code={0xECA2}/>}><Icon code={0xECA4}/></Show>}>
                <Show when={isSelected(selectedApp()![_link] ?? '#')} fallback="Pin">Unpin</Show> app
            </MenuItem>
            <MenuDivider/>
            <MenuItemLink href={selectedApp()![_link] ?? '#'} leading={<Icon code={0xEB53}/>}>Open</MenuItemLink>
            <MenuItem 
                onClick={() => {
                    getWindow()[_open](selectedApp()![_link] ?? '#', '_blank', 'noopener noreferrer')
                    closePopover(actionMenuRef)
                }} 
                leading={<Icon code={0xEB51}/>}>
                Open in new tab
            </MenuItem>
            <MenuDivider/>
            <MenuItem 
                onClick={() => {
                    getNavigator()[_clipboard][_writeText]('https://' + getLocation()[_hostname] + (selectedApp()![_link] ?? '#'))
                    closePopover(actionMenuRef)
                }}
                leading={<Icon code={0xE51B}/>}>
                Copy link
            </MenuItem>
            <MenuItem 
                onClick={() => share()}
                leading={<Icon code={0xEE23}/>}>
                Share
            </MenuItem>
            <MenuDivider/>
            <MenuItem
                onClick={(ev) => openModal(ev, infoDialogRef)} 
                leading={<Icon code={0xE930}/>}>
                About app
            </MenuItem>
        </Menu>
        <Dialog 
            ref={r => infoDialogRef = r} 
            header={selectedApp()![_title]}
            onClose={() => closePopover(actionMenuRef)}
            style={{width: '500px'}}
            actions={<>
                <Button onClick={() => closeModal(infoDialogRef)} variant={ButtonVariant[_filledTonal]}>Close</Button>
                <Button 
                    onClick={() => {
                        closeModal(infoDialogRef)
                        share()
                    }} 
                    variant={ButtonVariant[_filledTonal]}>
                    Share
                </Button>
                <LinkButton href={selectedApp()![_link]} variant={ButtonVariant[_filled]}>Open</LinkButton>
            </>}>
            { selectedApp()![_description] }
        </Dialog>
    </main>)
}