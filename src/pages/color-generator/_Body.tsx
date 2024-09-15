import { type VoidComponent, type Signal, createSignal, Show } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { _clipboard, _writeText, _accentLight, _onAccentLight, _tonal, _accentDark, _onAccentDark } from "@/constants/string"
import { getNavigator } from "@/constants/window"
import { hexToRgb } from "@/utils/color"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

const _: VoidComponent<Palette> = (props) => {
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

    return (<main class={CSS.body_main}>
        <div style={{ "background-color": props[_accentLight], color: props[_onAccentLight] }}>
            <h2>Accent Light<br />{props[_accentLight]}</h2>
            <Button
                variant={ButtonVariant[_tonal]}
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
                variant={ButtonVariant[_tonal]}
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
                variant={ButtonVariant[_tonal]}
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
                variant={ButtonVariant[_tonal]}
                style={{'--color-on-surface': hexToCSSValue(props[_accentDark])}}
                onClick={() => copyColor(props[_onAccentDark], onAccDarkTimeoutId)}>
                <Show when={onAccDarkTimeoutId[0]()} fallback={<><Icon code={0xE51B}/>Copy</>}>
                    <Icon code={0xE3D8}/>Copied
                </Show>
            </Button>
        </div>
    </main>)
}

export default _