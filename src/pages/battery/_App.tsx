import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { BatteryManager } from "@/interfaces/battery"
import { setTimeDelayed } from "@/utils/timeout"
import { _splash, _animate, _spring, _finished, _then, _remove, _catch, _getBattery, _level, _charging, _dischargingTime, _chargingTime, _chargingchange, _chargingtimechange, _dischargingtimechange, _levelchange, _focus, _click, _tonal, _filled } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { addEventListener } from "@/utils/event"
import { getDocumentBody, getNavigator } from "@/constants/window"
import { mathFloor } from "@/utils/math"

import TextTooltip from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Toast, { closeToast, openToast } from "@/components/Toast"
import AppBar from './_AppBar'
import App from "@/components/App"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
    const [level, setLevel] = createSignal<number | null>(null)
    const [isCharging, setIsCharging] = createSignal<boolean | null>(null)
    const [chargingTime, setChargingTime] = createSignal<number | null>(null)
    const [dischargingTime, setDischargingTime] = createSignal<number | null>(null)
    let toast_browserNotSupport_ref: HTMLDivElement
    let toast_batteryStatusError_ref: HTMLDivElement

    function getRemainingTimeText(seconds: number): string {
        const SECOND_PER_MINUTE = 60
        const SECOND_PER_HOUR = SECOND_PER_MINUTE * 60

        let text = ''
        if (seconds >= SECOND_PER_HOUR) {
            const n = mathFloor(seconds / SECOND_PER_HOUR)
            text = text + `${n} hour${n > 1? "s" : ""}`
            seconds = mathFloor(seconds % SECOND_PER_HOUR)
        }
        if (seconds >= SECOND_PER_MINUTE) {
            if (text != '') text += ", "
            const n = mathFloor(seconds / SECOND_PER_MINUTE)
            text = text + `${n} minute${n > 1? "s" : ""}`
            seconds = mathFloor(seconds % SECOND_PER_MINUTE)
        }
        if (seconds > 0) {
            if (text != '') text += ", "
            text = text + `${seconds} second${seconds > 1? "s" : ""}`
        }
        return text
    }

    function initBattery(ev: Event): void {
        if (!(getNavigator() as any)[_getBattery]) {
            setTimeDelayed(() => openToast(ev, toast_browserNotSupport_ref, {
                autoClose: false
            }))
            return
        }
        ((getNavigator() as any)[_getBattery]() as Promise<BatteryManager>)[_then](battery => {
            const update = () => {
                setIsCharging(battery[_charging])
                setLevel(battery[_level] * 100)
                setChargingTime(battery[_chargingTime] == Infinity? null : battery[_chargingTime])
                setDischargingTime(battery[_dischargingTime] == Infinity? null : battery[_dischargingTime])
            }
            update()
            addEventListener(battery, _chargingchange, () => update())
            addEventListener(battery, _levelchange, () => update())
            addEventListener(battery, _chargingtimechange, () => update())
            addEventListener(battery, _dischargingtimechange, () => update())
        })[_catch](() => openToast(ev, toast_batteryStatusError_ref, {duration: 8E3}))
    }

    function removeSplashScreen(): void {
        setTimeDelayed(() => {
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
        let clicked = false
        addEventListener(getDocumentBody(), _click, ev => {
            if (clicked) return;
            initBattery(ev)
            removeSplashScreen()
            clicked = true
        })
        getDocumentBody()[_click]()
    })

    const Toasts: VoidComponent = () => (<>
        <Toast
            ref={r => toast_browserNotSupport_ref = r}
            leading={<Icon code={0xF29B}/>}
            trailing={<TextTooltip text="Close">
                <IconButton
                    code={0xE5E9}
                    variant={ButtonVariant[_tonal]}
                    onClick={() => closeToast(toast_browserNotSupport_ref)}
                />
            </TextTooltip>}>
            Browser not supported. See <a
                style={{
                    "text-decoration": 'underline',
                    color: 'rgb(var(--color-accent))'
                }}
                target={"_blank"}
                rel={"noopener noreferrer"}
                href="https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager#browser_compatibility">browser compatibility</a>.
        </Toast>
        <Toast
            ref={r => toast_batteryStatusError_ref = r}
            leading={<Icon code={0xF29B}/>}>
            [Error] Unable to get battery status
        </Toast>
    </>)

    return (<App appBar={<AppBar />}>
        <main class={CSS.app_body}>
            <h1>{level() == null? "???" : level()}%</h1>
            <div class={CSS.app_body_status}>
                <Show
                    when={isCharging() != null}
                    fallback={<><Icon filled code={0xE1BD}/>Unknown status</>}>
                    <Icon filled code={isCharging()? 0xE1B7 : 0xE1AD}/>
                    {isCharging()? "Charging" : "Discharging"}
                </Show>
            </div>
            <Show when={chargingTime() != null}>
                <p>{getRemainingTimeText(chargingTime()!)} remaining</p>
            </Show>
            <Show when={dischargingTime() != null}>
                <p>{getRemainingTimeText(dischargingTime()!)} remaining</p>
            </Show>
        </main>
        <Toasts/>
    </App>)
}

export default _