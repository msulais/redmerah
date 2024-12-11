import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { BatteryManager } from "@/interfaces/battery"
import { timeout_set } from "@/utils/timeout"
import { remove_splash_screen } from "@/scripts/splash"
import { event_add_listener } from "@/utils/event"
import { math_floor } from "@/utils/math"
import { promise_done } from "@/utils/object"
import { element_click } from "@/utils/element"

import TextTooltip from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Toast, { close_toast, open_toast } from "@/components/Toast"
import AppBar from './_AppBar'
import App from "@/components/App"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const [level, set_level] = createSignal<number | null>(null)
	const [is_charging, set_is_charging] = createSignal<boolean | null>(null)
	const [charging_time, set_charging_time] = createSignal<number | null>(null)
	const [discharging_time, set_discharging_time] = createSignal<number | null>(null)
	let toast_browsernotsupport_ref: HTMLDivElement
	let toast_batterystatuserror_ref: HTMLDivElement

	function get_remaining_time_text(seconds: number): string {
		const SECOND_PER_MINUTE = 60
		const SECOND_PER_HOUR = SECOND_PER_MINUTE * 60

		let text = ''
		if (seconds >= SECOND_PER_HOUR) {
			const n = math_floor(seconds / SECOND_PER_HOUR)
			text = text + `${n} hour${n > 1? "s" : ""}`
			seconds = math_floor(seconds % SECOND_PER_HOUR)
		}
		if (seconds >= SECOND_PER_MINUTE) {
			if (text != '') text += ", "
			const n = math_floor(seconds / SECOND_PER_MINUTE)
			text = text + `${n} minute${n > 1? "s" : ""}`
			seconds = math_floor(seconds % SECOND_PER_MINUTE)
		}
		if (seconds > 0) {
			if (text != '') text += ", "
			text = text + `${seconds} second${seconds > 1? "s" : ""}`
		}
		return text
	}

	function init_battery(ev: Event): void {
		if (!(navigator as any).getBattery) {
			timeout_set(() => open_toast(ev, toast_browsernotsupport_ref, {
				autoclose: false
			}))
			return
		}
		promise_done(
			((navigator as any).getBattery() as Promise<BatteryManager>),
			battery => {
				const update = () => {
					set_is_charging(battery.charging)
					set_level(battery.level * 100)
					set_charging_time(battery.chargingTime == Infinity? null : battery.chargingTime)
					set_discharging_time(battery.dischargingTime == Infinity? null : battery.dischargingTime)
				}
				update()
				event_add_listener(battery, 'chargingchange', () => update())
				event_add_listener(battery, 'levelchange', () => update())
				event_add_listener(battery, 'chargingtimechange', () => update())
				event_add_listener(battery, 'dischargingtimechange', () => update())
			},
			() => open_toast(ev, toast_batterystatuserror_ref, {duration: 8E3})
		)
	}

	onMount(() => {
		let clicked = false
		event_add_listener(document, 'click', ev => {
			if (clicked) return;
			init_battery(ev)
			remove_splash_screen()
			clicked = true
		})

		// BUG: el.click is not a function
		element_click(document as unknown as HTMLElement)
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_browsernotsupport_ref = r}
			leading={<Icon code={0xF29B}/>}
			trailing={<TextTooltip>
				<IconButton
					data-tooltip="Close"
					code={0xE5E9}
					variant={ButtonVariant.tonal}
					onClick={() => close_toast(toast_browsernotsupport_ref)}
				/>
			</TextTooltip>}>
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
			ref={r => toast_batterystatuserror_ref = r}
			leading={<Icon code={0xF29B}/>}>
			[Error] Unable to get battery status
		</Toast>
	</>)

	return (<App appbar={<AppBar />}>
		<main class={CSS.app_body}>
			<h1>{level() == null? "???" : level()}%</h1>
			<div class={CSS.app_body_status}>
				<Show
					when={is_charging() != null}
					fallback={<><Icon filled code={0xE1BD}/>Unknown status</>}>
					<Icon filled code={is_charging()? 0xE1B7 : 0xE1AD}/>
					{is_charging()? "Charging" : "Discharging"}
				</Show>
			</div>
			<Show when={charging_time() != null && level() != null && level()! < 100}>
				<p>{get_remaining_time_text(charging_time()!)} remaining</p>
			</Show>
			<Show when={discharging_time() != null && level() != null && level()! > 0}>
				<p>{get_remaining_time_text(discharging_time()!)} remaining</p>
			</Show>
		</main>
		<Toasts/>
	</App>)
}

export default _