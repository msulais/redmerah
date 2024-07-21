import { type Component, For, Show, type Signal, createSignal, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import { clearTimeDelayed, setTimeDelayed } from '@/utils/timeout'
import { openPopover } from '@/utils/popover'
import { generateColor, hexToRgb, testHexColor } from '@/utils/color'
import { addClassListModule, getElementById } from '@/utils/element'
import type { HEXColor, RGBColor } from '@/types/color'
import { _system, _theme, _corner, _dark, _fullRound, _includes, _light, _round, _semiRound, _sharp, _src, _URL, _share, _currentTarget, _seed, _paletteList, _length, _outlined, _filledTonal, _color, _color_accent, _innerHTML, _toUpperCase, _colorDark, _onColor, _onColorDark, _clipboard, _writeText, _join, _push, _palette, _filter, _filled, _accentDark, _accentLight, _onAccentDark, _onAccentLight, _open, _createObjectStore, _readonly, _objectStore, _transaction, _getAll, _then, _put, _readwrite, _manual, _clear, _delete } from '@/data/string'
import { getNavigator } from '@/data/window'
import { DatabaseNames, LocalStorageKeys } from '@/enums/storage'
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/storage'
import { closeModal, openModal } from '@/utils/modal'
import { ElementIds } from '@/enums/ids'

import Tooltip from '@/components/Tooltip'
import Icon from '@/components/Icon'
import Button, { ButtonVariant, FloatingActionButton } from '@/components/Button'
import List from '@/components/List'
import ColorPicker, { changeColorPickerValue } from '@/components/ColorPicker'
import Dialog from '@/components/Dialog'
import CSS from './_index.module.scss'
import App from '@/components/App'
import type { Palette } from './_types'
import AppBar from './_AppBar'
import Divider from '@/components/Divider'
import { IDB } from '@/class/indexeddb'
import { ObjectStoreNames, type ObjectStorePaletteList } from './_storage'

type BodyProps = Palette

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
        <div style={{ "background-color": props[_accentLight], color: props[_onAccentLight] }}>
            <h2>Accent Light<br />{props[_accentLight]}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props[_onAccentLight])}}
                onClick={() => copyColor(props[_accentLight], accLightTimeoutId)}>
                <Show when={accLightTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props[_onAccentLight], color: props[_accentLight] }}>
            <h2>On Accent Light<br />{props[_onAccentLight]}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props[_accentLight])}}
                onClick={() => copyColor(props[_onAccentLight], onAccLightTimeoutId)}>
                <Show when={onAccLightTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props[_accentDark], color: props[_onAccentDark] }}>
            <h2>Accent Dark<br />{props[_accentDark]}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props[_onAccentDark])}}
                onClick={() => copyColor(props[_accentDark], accDarkTimeoutId)}>
                <Show when={accDarkTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
        <div style={{ "background-color": props[_onAccentDark], color: props[_accentDark] }}>
            <h2>On Accent Dark<br />{props[_onAccentDark]}</h2>
            <Button
                variant={ButtonVariant[_filledTonal]}
                style={{'--color-on-surface': hexToCSSValue(props[_accentDark])}}
                onClick={() => copyColor(props[_onAccentDark], onAccDarkTimeoutId)}>
                <Show when={onAccDarkTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
    </main>)
}

export const MainApp: Component = () => {
    const db = new IDB(DatabaseNames.colorGenerator, 1)
    const [palette, setPalette] = createStore<Palette>({
        seed: '#00FFF0',
        accentLight: '#005C56',
        onAccentLight: '#FFFFFF',
        accentDark: '#00C7BB',
        onAccentDark: '#000000'
    })
    const [paletteList, setPaletteList] = createSignal<Palette[]>([])
    const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
    const [colorPicker_ref, set_colorPicker_ref] = createSignal<HTMLDialogElement | null>(null)
    const [dialog_colorList_ref, set_dialog_colorList_ref] = createSignal<HTMLDialogElement | null>(null)
    let dialog_deleteAll_ref: HTMLDialogElement

    function deleteAllPaletteList(): void {
        setPaletteList([])
        const objectStore_paletteList = db[_transaction](ObjectStoreNames[_paletteList], _readwrite)![_objectStore](ObjectStoreNames[_paletteList])
        if (!objectStore_paletteList) return;
        
        objectStore_paletteList[_clear]()
    }

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

        setPalette({
            seed: hexColor[_toUpperCase]() as HEXColor,
            accentLight: acc[_color][_toUpperCase]() as HEXColor,
            onAccentLight: acc[_onColor][_toUpperCase]() as HEXColor,
            accentDark: acc[_colorDark][_toUpperCase]() as HEXColor,
            onAccentDark: acc[_onColorDark][_toUpperCase]() as HEXColor
        })
    }

    async function copyAllPaletteList(): Promise<void> {
        if (timeoutId()) {
            clearTimeDelayed(timeoutId()!)
            setTimeoutId(null)
        }

        const colorsText: string[] = []
        for (const i in paletteList()) {
            const palette = paletteList()[i]
            colorsText[_push]([
                `--seed-${i + 1}: ` + palette[_seed],
                `--accent-light-${i + 1}: ` + palette[_accentLight],
                `--on-accent-light-${i + 1}: ` + palette[_onAccentLight],
                `--accent-dark-${i + 1}: ` + palette[_accentDark],
                `--on-accent-dark-${i + 1}: ` + palette[_onAccentDark],
            ][_join](';\n') + ';')
        }

        await getNavigator()[_clipboard][_writeText](colorsText[_join]('\n\n'))
        setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 2000))
    }

    function onAddColor(): void {
        for (const p of paletteList()) {
            if (p[_accentLight] == palette[_accentLight]) return
        }

        setPaletteList(l => [...l, {...palette}])

        
        const objectStore_paletteList = db[_transaction](ObjectStoreNames[_paletteList], _readwrite)![_objectStore](ObjectStoreNames[_paletteList])
        if (!objectStore_paletteList) return;

        objectStore_paletteList[_put]({...palette})
    }

    function initColor(): void {
        const color = getLocalStorageItem(LocalStorageKeys[_color])

        try {
            testHexColor(color ?? '')
            onColorChange(color as HEXColor)
            changeColorPickerValue(dialog_colorList_ref()!, color as HEXColor)
        } catch (e) {}
    }

    function initPaletteList(): void {
        const objectStore_paletteList = db[_transaction](ObjectStoreNames[_paletteList], _readonly)![_objectStore](ObjectStoreNames[_paletteList])
        if (!objectStore_paletteList) return;

        db[_getAll]<ObjectStorePaletteList>(objectStore_paletteList)[_then]((values) => {
            setPaletteList(v => values? [...values] : v)
        })
    }

    function initDatabase(): void {
        try {
            db[_open]({
                onSuccess(ev, db) {
                    initPaletteList()
                },
                onUpgradeNeeded(ev, db) {
                    db[_createObjectStore]<ObjectStorePaletteList>({
                        name: ObjectStoreNames[_paletteList],
                        keyPath: _seed, 
                        indexs: [_seed, _accentLight, _onAccentLight, _accentDark, _onAccentDark]
                    })
                },
            })
        } catch (e) {}
    }

    onMount(() => {
        initColor()
        initDatabase()
    })

    const ListItem: Component<{palette: Palette}> = (props) => {
        const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
        const [button_copy_ref, set_button_copy_ref] = createSignal<HTMLButtonElement | null>(null)
        const [button_delete_ref, set_button_delete_ref] = createSignal<HTMLButtonElement | null>(null)
        const [div_accentLight_ref, set_div_accentLight_ref] = createSignal<HTMLDivElement | null>(null)
        const [div_onAccentLight_ref, set_div_onAccentLight_ref] = createSignal<HTMLDivElement | null>(null)
        const [div_accentDark_ref, set_div_accentDark_ref] = createSignal<HTMLDivElement | null>(null)
        const [div_onAccentDark_ref, set_div_onAccentDark_ref] = createSignal<HTMLDivElement | null>(null)

        async function copy(): Promise<void> {
            if (timeoutId()) {
                clearTimeDelayed(timeoutId()!)
                setTimeoutId(null)
            }

            await getNavigator()[_clipboard][_writeText]([
                '--seed: ' + props[_palette][_seed],
                '--accent-light: ' + props[_palette][_accentLight],
                '--on-accent-light: ' + props[_palette][_onAccentLight],
                '--accent-dark: ' + props[_palette][_accentDark],
                '--on-accent-dark: ' + props[_palette][_onAccentDark],
            ][_join](';\n') + ';')
            setTimeoutId(setTimeDelayed(() => setTimeoutId(null), 1000))
        }

        function deleteColor(): void {
            const p = {...props[_palette]}
            setPaletteList(l => l[_filter](v => v[_accentLight] != props[_palette][_accentLight]))
            if (paletteList()[_length] == 0) {
                closeModal(dialog_colorList_ref()!)
            }

            const objectStore_paletteList = db[_transaction](ObjectStoreNames[_paletteList], _readwrite)![_objectStore](ObjectStoreNames[_paletteList])
            if (!objectStore_paletteList) return;

            objectStore_paletteList[_delete](p[_seed])
        }

        return (<List
            trailing={<>
                <Tooltip anchor={button_copy_ref()} text='Copy' />
                <Button iconOnly onClick={copy} ref={r => set_button_copy_ref(r)}>
                    <Show when={timeoutId()} fallback={<Icon code={0xE51B}/>}>
                        <Icon code={0xE3D8}/>
                    </Show>
                </Button>

                <Tooltip anchor={button_delete_ref()} text='Delete' />
                <Button ref={r => set_button_delete_ref(r)} iconOnly onClick={deleteColor}><Icon code={0xE59D}/></Button>
            </>}
            subtitle={<div class={CSS.dialog_colors}>

                <Tooltip anchor={div_accentLight_ref()} text="Accent Light"/>
                <div ref={r => set_div_accentLight_ref(r)} style={{
                    "background-color": props[_palette][_accentLight],
                    color: props[_palette][_onAccentLight],
                }}>{props[_palette][_accentLight]}</div>

                <Tooltip anchor={div_onAccentLight_ref()} text="On Accent Light"/>
                <div ref={r => set_div_onAccentLight_ref(r)} style={{
                    "background-color": props[_palette][_onAccentLight],
                    color: props[_palette][_accentLight],
                }}>{props[_palette][_onAccentLight]}</div>

                <Tooltip anchor={div_accentDark_ref()} text="Accent Dark"/>
                <div ref={r => set_div_accentDark_ref(r)} style={{
                    "background-color": props[_palette][_accentDark],
                    color: props[_palette][_onAccentDark],
                }}>{props[_palette][_accentDark]}</div>

                <Tooltip anchor={div_onAccentDark_ref()} text="On Accent Dark"/>
                <div ref={r => set_div_onAccentDark_ref(r)} style={{
                    "background-color": props[_palette][_onAccentDark],
                    color: props[_palette][_accentDark],
                }}>{props[_palette][_onAccentDark]}</div>
            </div>}
            leading={<div class={CSS.seed} style={{"background-color": props[_palette][_seed]}}/>}>
            { props[_palette][_seed] }
        </List>)
    }

    return (<>
        <App
            appBar={<AppBar
                colorPicker_ref={colorPicker_ref()!}
                dialog_colorList_ref={dialog_colorList_ref()!}
                onAddColor={onAddColor}
                seed={palette[_seed]}
                palette={palette}
                onColorChange={onColorChange}
                paletteList={paletteList()}
            />}
            floatingActionButton={<FloatingActionButton classList={addClassListModule(CSS.fab)} variant={ButtonVariant[_filled]} onClick={(ev) => openPopover({
                event: ev,
                anchor: ev[_currentTarget],
                popover: colorPicker_ref()!,
            })}>
                {palette[_seed]}
            </FloatingActionButton>}>
            <Body {...palette} />
        </App>
        <ColorPicker
            ref={r => set_colorPicker_ref(r)}
            initialColor={palette[_seed]}
            disabledColorControl
            disabledOpacityControl
            onSelectColor={onColorChange}
        />
        <Dialog
            ref={r => set_dialog_colorList_ref(r)}
            style={{width: '640px'}}
            header="Color list"
            actions={<>
                <Button variant={ButtonVariant[_filledTonal]} onClick={(ev) => {
                    openModal(ev, dialog_deleteAll_ref)
                }}>Delete all</Button>
                <Button variant={ButtonVariant[_filledTonal]} onClick={copyAllPaletteList}>
                    <Show when={timeoutId()} fallback='Copy all'>Copied</Show>
                </Button>
                <Button variant={ButtonVariant[_filled]} onClick={() => closeModal(dialog_colorList_ref()!)}>Close</Button>
            </>}>
            <For each={paletteList()}>{(p, i) => <>
                <Show when={i() > 0}><Divider /></Show>
                <ListItem palette={p}/>
            </>}</For>
        </Dialog>
        <Dialog 
            ref={r => dialog_deleteAll_ref = r}
            header="Delete all"
            dismiss={_manual}
            actions={<>
                <Button onClick={() => closeModal(dialog_deleteAll_ref)} variant={ButtonVariant[_filledTonal]}>Cancel</Button>
                <Button onClick={() => {
                    closeModal(dialog_deleteAll_ref)
                    closeModal(dialog_colorList_ref()!)
                    deleteAllPaletteList()
                }} variant={ButtonVariant[_filled]}>Delete all</Button>
            </>}>
            Are you sure want to delete all palette color?
        </Dialog>
    </>)
}