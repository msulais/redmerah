import { type VoidComponent, type Signal, createSignal, Show, createMemo } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { hex_to_rgb } from "@/utils/color"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { promise_done } from "@/utils/object"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'
import { math_round } from "@/utils/math"

const _: VoidComponent<Palette> = (props) => {
	const timeout_accentlight_id: Signal<number | null> = createSignal<number | null>(null)
	const timeout_onaccentlight_id: Signal<number | null> = createSignal<number | null>(null)
	const timeout_accentdark_id: Signal<number | null> = createSignal<number | null>(null)
	const timeout_onaccentdark_id: Signal<number | null> = createSignal<number | null>(null)
	const accent_light = createMemo(() => props.accent_light)
	const on_accent_light = createMemo(() => props.on_accent_light)
	const accent_dark = createMemo(() => props.accent_dark)
	const on_accent_dark = createMemo(() => props.on_accent_dark)

	function copy_color(color: string, [timeout_id, set_timeout_id]: Signal<number | null>): void {
		if (timeout_id()) {
			timeout_clear(timeout_id()!)
			set_timeout_id(null)
		}

		promise_done(
			navigator_clipboard_writetext(color),
			() => set_timeout_id(timeout_set(() => set_timeout_id(null), 1000))
		)
	}

	function hex_to_css_value(hex: HEXColor): string {
		const rgb = hex_to_rgb(hex)
		return `${math_round(rgb.r * 0xff)}, ${math_round(rgb.g * 0xff)}, ${math_round(rgb.b * 0xff)}`
	}

	return (<main class={CSS.body_main}>
		<div style={{ "background-color": accent_light(), color: on_accent_light() }}>
			<h2>Accent Light<br />{accent_light()}</h2>
			<Button
				c_variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hex_to_css_value(on_accent_light())}}
				onClick={() => copy_color(accent_light(), timeout_accentlight_id)}>
				<Show when={timeout_accentlight_id[0]()} fallback={<><Icon c_code={0xE51B}/>Copy</>}>
					<Icon c_code={0xE3D8}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": on_accent_light(), color: accent_light() }}>
			<h2>On Accent Light<br />{on_accent_light()}</h2>
			<Button
				c_variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hex_to_css_value(accent_light())}}
				onClick={() => copy_color(on_accent_light(), timeout_onaccentlight_id)}>
				<Show when={timeout_onaccentlight_id[0]()} fallback={<><Icon c_code={0xE51B}/>Copy</>}>
					<Icon c_code={0xE3D8}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": accent_dark(), color: on_accent_dark() }}>
			<h2>Accent Dark<br />{accent_dark()}</h2>
			<Button
				c_variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hex_to_css_value(on_accent_dark())}}
				onClick={() => copy_color(accent_dark(), timeout_accentdark_id)}>
				<Show when={timeout_accentdark_id[0]()} fallback={<><Icon c_code={0xE51B}/>Copy</>}>
					<Icon c_code={0xE3D8}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": on_accent_dark(), color: accent_dark() }}>
			<h2>On Accent Dark<br />{on_accent_dark()}</h2>
			<Button
				c_variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hex_to_css_value(accent_dark())}}
				onClick={() => copy_color(on_accent_dark(), timeout_onaccentdark_id)}>
				<Show when={timeout_onaccentdark_id[0]()} fallback={<><Icon c_code={0xE51B}/>Copy</>}>
					<Icon c_code={0xE3D8}/>Copied
				</Show>
			</Button>
		</div>
	</main>)
}

export default _