import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { BatteryManager } from "@/interfaces/battery"
import { removeSplashScreen } from "@/utils/splash"
import { ICON_BATTERY_5, ICON_BATTERY_CHARGE, ICON_DISMISS, ICON_QUESTION_CIRCLE, ICON_WARNING } from "@/constants/icons"

import Tooltip from "@/components/Tooltip"
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
	let toastBrowserNotSupportRef: HTMLDivElement
	let toastBatterStatusErrorRef: HTMLDivElement

	function getRemainingTimeText(seconds: number): string {
		const SECOND_PER_MINUTE = 60
		const SECOND_PER_HOUR = SECOND_PER_MINUTE * 60
		let text = ''
		if (seconds >= SECOND_PER_HOUR) {
			const n = Math.floor(seconds / SECOND_PER_HOUR)
			text = text + `${n} hour${n > 1? "s" : ""}`
			seconds = Math.floor(seconds % SECOND_PER_HOUR)
		}
		if (seconds >= SECOND_PER_MINUTE) {
			if (text != '') text += ", "
			const n = Math.floor(seconds / SECOND_PER_MINUTE)
			text = text + `${n} minute${n > 1? "s" : ""}`
			seconds = Math.floor(seconds % SECOND_PER_MINUTE)
		}
		if (seconds > 0) {
			if (text != '') text += ", "
			text = text + `${seconds} second${seconds > 1? "s" : ""}`
		}
		return text
	}

	function initBattery(): void {
		if (!(navigator as any).getBattery) {
			setTimeout(() => openToast(toastBrowserNotSupportRef, {
				autoclose: false
			}))
			return
		};

		((navigator as any).getBattery() as Promise<BatteryManager>).then(battery => {
				const update = () => {
					setIsCharging(battery.charging)
					setLevel(battery.level * 100)
					setChargingTime(battery.chargingTime == Infinity? null : battery.chargingTime)
					setDischargingTime(battery.dischargingTime == Infinity? null : battery.dischargingTime)
				}
				update()
				battery.addEventListener('chargingchange', () => update())
				battery.addEventListener('levelchange', () => update())
				battery.addEventListener('chargingtimechange', () => update())
				battery.addEventListener('dischargingtimechange', () => update())
			},
		).catch(() => openToast(toastBatterStatusErrorRef, {duration: 8E3}))
	}

	onMount(() => {
		initBattery()
		removeSplashScreen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toastBrowserNotSupportRef = r}
			c:leading={<Icon c:code={ICON_WARNING}/>}
			c:trailing={<Tooltip>
				<IconButton
					data-tooltip="Close"
					c:code={ICON_DISMISS}
					c:variant={ButtonVariant.tonal}
					onClick={() => closeToast(toastBrowserNotSupportRef)}
				/>
			</Tooltip>}>
			Browser not supported. See <a
				style={{
					"text-decoration": 'underline',
					color: 'rgb(var(--g-color-accent))'
				}}
				target={"_blank"}
				rel={"noopener noreferrer"}
				href="https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager#browser_compatibility">browser compatibility</a>.
		</Toast>
		<Toast
			ref={r => toastBatterStatusErrorRef = r}
			c:leading={<Icon c:code={ICON_WARNING}/>}>
			[Error] Unable to get battery status
		</Toast>
	</>)

	return (<App c:appBar={<AppBar />}>
		<main class={CSS.app_body}>
			<h1>{level() == null? "???" : level()}%</h1>
			<div class={CSS.app_body_status}>
				<Show
					when={isCharging() != null}
					fallback={<><Icon c:filled c:code={ICON_QUESTION_CIRCLE}/>Unknown status</>}>
					<Icon c:filled c:code={isCharging()? ICON_BATTERY_CHARGE : ICON_BATTERY_5}/>
					{isCharging()? "Charging" : "Discharging"}
				</Show>
			</div>
			<Show when={chargingTime() != null && level() != null && level()! < 100}>
				<p>{getRemainingTimeText(chargingTime()!)} remaining</p>
			</Show>
			<Show when={dischargingTime() != null && level() != null && level()! > 0}>
				<p>{getRemainingTimeText(dischargingTime()!)} remaining</p>
			</Show>
		</main>
		<Toasts/>
	</App>)
}

export default _