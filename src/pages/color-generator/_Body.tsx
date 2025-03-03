import { type VoidComponent, type Signal, createSignal, Show, createMemo, createUniqueId } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { colorHexToRgb } from "@/utils/color"
import { elementValidTarget } from "@/utils/element"
import { ICON_CHECKMARK, ICON_COPY } from "@/constants/icons"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

const _: VoidComponent<Palette> = (props) => {
	const timeAccentLightId = createSignal<number | NodeJS.Timeout | null>(null)
	const timeOnAccentLightId = createSignal<number | NodeJS.Timeout | null>(null)
	const timeAccentDarkId = createSignal<number | NodeJS.Timeout | null>(null)
	const timeOnAccentDarkId = createSignal<number | NodeJS.Timeout | null>(null)
	const accentLight = createMemo(() => props.accentLight)
	const onAccentLight = createMemo(() => props.onAccentLight)
	const accentDark = createMemo(() => props.accentDark)
	const onAccentDark = createMemo(() => props.onAccentDark)
	const buttonAccentLightId = createUniqueId()
	const buttonOnAccentLightId = createUniqueId()
	const buttonAccentDarkId = createUniqueId()
	const buttonOnAccentDarkId = createUniqueId()

	function copyColor(color: string, [timeId, setTimeId]: Signal<number | NodeJS.Timeout | null>): void {
		if (timeId()) {
			clearTimeout(timeId()!)
			setTimeId(null)
		}

		navigator.clipboard
		.writeText(color)
		.then(() => setTimeId(setTimeout(() => setTimeId(null), 1000)))
	}

	function hexToCSSValue(hex: HEXColor): string {
		const rgb = colorHexToRgb(hex)
		return `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	}

	return (<main
		class={CSS.body_main}
		onClick={ev => {
			const button = document.activeElement!
			if (!elementValidTarget(
				ev.currentTarget,
				button,
			)) return

			switch (button.id) {
			case buttonAccentLightId:
				copyColor(accentLight(), timeAccentLightId)
				break
			case buttonOnAccentLightId:
				copyColor(onAccentLight(), timeOnAccentLightId)
				break
			case buttonAccentDarkId:
				copyColor(accentDark(), timeAccentDarkId)
				break
			case buttonOnAccentDarkId:
				copyColor(onAccentDark(), timeOnAccentDarkId)
				break
			}
		}}>
		<div style={{ "background-color": accentLight(), color: onAccentLight() }}>
			<h2>Accent Light<br />{accentLight()}</h2>
			<Button
				c:variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hexToCSSValue(onAccentLight())}}
				id={buttonAccentLightId}>
				<Show when={timeAccentLightId[0]()} fallback={<><Icon c:code={ICON_COPY}/>Copy</>}>
					<Icon c:code={ICON_CHECKMARK}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": onAccentLight(), color: accentLight() }}>
			<h2>On Accent Light<br />{onAccentLight()}</h2>
			<Button
				c:variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hexToCSSValue(accentLight())}}
				id={buttonOnAccentLightId}>
				<Show when={timeOnAccentLightId[0]()} fallback={<><Icon c:code={ICON_COPY}/>Copy</>}>
					<Icon c:code={ICON_CHECKMARK}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": accentDark(), color: onAccentDark() }}>
			<h2>Accent Dark<br />{accentDark()}</h2>
			<Button
				c:variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hexToCSSValue(onAccentDark())}}
				id={buttonAccentDarkId}>
				<Show when={timeAccentDarkId[0]()} fallback={<><Icon c:code={ICON_COPY}/>Copy</>}>
					<Icon c:code={ICON_CHECKMARK}/>Copied
				</Show>
			</Button>
		</div>
		<div style={{ "background-color": onAccentDark(), color: accentDark() }}>
			<h2>On Accent Dark<br />{onAccentDark()}</h2>
			<Button
				c:variant={ButtonVariant.tonal}
				style={{'--g-color-on-surface': hexToCSSValue(accentDark())}}
				id={buttonOnAccentDarkId}>
				<Show when={timeOnAccentDarkId[0]()} fallback={<><Icon c:code={ICON_COPY}/>Copy</>}>
					<Icon c:code={ICON_CHECKMARK}/>Copied
				</Show>
			</Button>
		</div>
	</main>)
}

export default _