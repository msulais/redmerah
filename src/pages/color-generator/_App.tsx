import { type Component, For, Show, type Signal, type VoidComponent, createSignal, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { HEXColor, RGBColor } from '@/types/color'
import type { Palette } from './_types'
import { clearTimeDelayed, setMicrotask, setTimeDelayed } from '@/utils/timeout'
import { generateColor, hexToRgb, testHexColor } from '@/utils/color'
import { addClassListModule, getElementById } from '@/utils/element'
import { _system, _theme, _corner, _dark, _fullRound, _includes, _light, _round, _semiRound, _sharp, _src, _URL, _share, _currentTarget, _seed, _paletteList, _length, _outlined, _tonal, _color, _color_accent, _innerHTML, _toUpperCase, _colorDark, _onColor, _onColorDark, _clipboard, _writeText, _join, _push, _palette, _filter, _filled, _accentDark, _accentLight, _onAccentDark, _onAccentLight, _open, _createObjectStore, _readonly, _objectStore, _transaction, _getAll, _then, _put, _readwrite, _manual, _clear, _delete, _colorGenerator, _writeObjectStore, _readObjectStore, _animate, _finished, _remove, _splash, _spring } from '@/data/string'
import { getNavigator } from '@/data/window'
import { DatabaseNames, LocalStorageKeys } from '@/enums/storage'
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/storage'
import { ElementIds } from '@/enums/ids'
import { IDB } from '@/utils/indexeddb'
import { ObjectStoreNames, type ObjectStorePaletteList } from './_storage'
import { AnimationEffectTiming } from '@/enums/animation'

import {TextTooltip} from '@/components/Tooltip'
import Divider from '@/components/Divider'
import Button, { ButtonVariant, FloatingActionButton, IconButton } from '@/components/Button'
import List from '@/components/List'
import ColorPicker, { closeColorPicker, openColorPicker } from '@/components/ColorPicker'
import Dialog, { closeDialog, openDialog } from '@/components/Dialog'
import App from '@/components/App'
import AppBar from './_AppBar'
import Body from './_Body'
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
    const db = new IDB(DatabaseNames[_colorGenerator], 1)
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
        const store_paletteList = db[_writeObjectStore](ObjectStoreNames[_paletteList])
        if (store_paletteList != null) store_paletteList[_clear]()
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


        const store_paletteList = db[_writeObjectStore](ObjectStoreNames[_paletteList])
        if (store_paletteList != null) store_paletteList[_put]({...palette})
    }

    function initColor(): void {
        const color = getLocalStorageItem(LocalStorageKeys[_color])

        try {
            testHexColor(color ?? '')
            onColorChange(color as HEXColor)
            setPalette(_seed, color as HEXColor)
        } catch (e) {}
    }

    function initPaletteList(): void {
        const store_paletteList = db[_readObjectStore](ObjectStoreNames[_paletteList])
        if (store_paletteList == null) return;

        db[_getAll]<ObjectStorePaletteList>(store_paletteList)[_then]((values) => {
            setPaletteList(v => values? [...values] : v)
        })
    }

    function initDatabase(): void {
        db[_open]({
            onSuccess(_ev, _db) {
                initPaletteList()
            },
            onUpgradeNeeded(_ev, db) {
                db[_createObjectStore]<ObjectStorePaletteList>({
                    name: ObjectStoreNames[_paletteList],
                    keyPath: _seed,
                    indexs: [_seed, _accentLight, _onAccentLight, _accentDark, _onAccentDark]
                })
            },
        })
    }

    function removeSplashScreen(): void {
        setMicrotask(() => {
            const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
            splash_ref[_animate](
                {opacity: 0},
                {
                    duration: 1000,
                    easing: AnimationEffectTiming[_spring]
                }
            )[_finished][_then](() => splash_ref[_remove]())
        })
    }

    onMount(() => {
        initColor()
        initDatabase()
        removeSplashScreen()
    })

    const ListItem: Component<{palette: Palette}> = (props) => {
        const [timeoutId, setTimeoutId] = createSignal<number | null>(null)

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
                closeColorPicker(dialog_colorList_ref()!)
            }

            const store_paletteList = db[_writeObjectStore](ObjectStoreNames[_paletteList])
            if (store_paletteList != null) store_paletteList[_delete](p[_seed])
        }

        return (<List
            trailing={<>
                <TextTooltip text='Copy'>
                    <IconButton
                        onClick={copy}
                        code={timeoutId()? 0xE3D8 : 0xE51B}
                    />
                </TextTooltip>
                <TextTooltip text='Delete'>
                    <IconButton
                        onClick={deleteColor}
                        code={0xE59D}
                    />
                </TextTooltip>
            </>}
            subtitle={<div class={CSS.app_dialog_colors}>
                <TextTooltip text="Accent Light">
                    <div style={{
                        "background-color": props[_palette][_accentLight],
                        color: props[_palette][_onAccentLight],
                    }}>{props[_palette][_accentLight]}</div>
                </TextTooltip>
                <TextTooltip text="On Accent Light">
                    <div style={{
                        "background-color": props[_palette][_onAccentLight],
                        color: props[_palette][_accentLight],
                    }}>{props[_palette][_onAccentLight]}</div>
                </TextTooltip>
                <TextTooltip text="Accent Dark">
                    <div style={{
                        "background-color": props[_palette][_accentDark],
                        color: props[_palette][_onAccentDark],
                    }}>{props[_palette][_accentDark]}</div>
                </TextTooltip>
                <TextTooltip text="On Accent Dark">
                    <div style={{
                        "background-color": props[_palette][_onAccentDark],
                        color: props[_palette][_accentDark],
                    }}>{props[_palette][_onAccentDark]}</div>
                </TextTooltip>
            </div>}
            leading={<div class={CSS.app_seed} style={{"background-color": props[_palette][_seed]}}/>}>
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
            floatingActionButton={<FloatingActionButton
                classList={addClassListModule(CSS.app_fab)}
                variant={ButtonVariant[_filled]}
                onClick={(ev) => openColorPicker(ev, colorPicker_ref()!, {anchor: ev[_currentTarget]})}>
                {palette[_seed]}
            </FloatingActionButton>}>
            <Body {...palette} />
        </App>
        <ColorPicker
            ref={r => set_colorPicker_ref(r)}
            color={palette[_seed]}
            disabledColorControl
            disabledOpacityControl
            onSelectColor={onColorChange}
        />
        <Dialog
            ref={r => set_dialog_colorList_ref(r)}
            style={{width: '640px'}}
            header="Color list"
            actions={<>
                <Button
                    variant={ButtonVariant[_tonal]}
                    onClick={(ev) => openDialog(ev, dialog_deleteAll_ref, {important: true})}>
                    Delete all
                </Button>
                <Button variant={ButtonVariant[_tonal]} onClick={copyAllPaletteList}>
                    <Show when={timeoutId()} fallback='Copy all'>Copied</Show>
                </Button>
                <Button
                    variant={ButtonVariant[_filled]}
                    onClick={() => closeDialog(dialog_colorList_ref()!)}>
                    Close
                </Button>
            </>}>
            <For each={paletteList()}>{(p, i) => <>
                <Show when={i() > 0}><Divider /></Show>
                <ListItem palette={p}/>
            </>}</For>
        </Dialog>
        <Dialog
            ref={r => dialog_deleteAll_ref = r}
            header="Delete all"
            actions={<>
                <Button onClick={() => closeDialog(dialog_deleteAll_ref)} variant={ButtonVariant[_tonal]}>Cancel</Button>
                <Button onClick={() => {
                    closeDialog(dialog_deleteAll_ref)
                    closeDialog(dialog_colorList_ref()!)
                    deleteAllPaletteList()
                }} variant={ButtonVariant[_filled]}>Delete all</Button>
            </>}>
            Are you sure want to delete all palette color?
        </Dialog>
    </>)
}

export default _