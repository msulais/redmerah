import { type VoidComponent, type Signal, createSignal, Show, createMemo, createUniqueId } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { colorHexToRgb } from "@/utils/color"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { promiseDone } from "@/utils/object"
import { mathRound } from "@/utils/math"
import { eventCurrentTarget } from "@/utils/event"
import { documentActive } from "@/utils/document"
import { elementValidTarget, elementTagName, elementId } from "@/utils/element"
import { ICON_CHECKMARK, ICON_COPY } from "@/constants/icons"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CSS from './_styles.module.scss'

const _: VoidComponent<Palette> = (props) => {
	const timeAccentLightId: Signal<number | null> = createSignal<number | null>(null)
	const timeOnAccentLightId: Signal<number | null> = createSignal<number | null>(null)
	const timeAccentDarkId: Signal<number | null> = createSignal<number | null>(null)
	const timeOnAccentDarkId: Signal<number | null> = createSignal<number | null>(null)
	const accentLight = createMemo(() => props.accentLight)
	const onAccentLight = createMemo(() => props.onAccentLight)
	const accentDark = createMemo(() => props.accentDark)
	const onAccentDark = createMemo(() => props.onAccentDark)
	const buttonAccentLightId = createUniqueId()
	const buttonOnAccentLightId = createUniqueId()
	const buttonAccentDarkId = createUniqueId()
	const buttonOnAccentDarkId = createUniqueId()

	function copyColor(color: string, [timeId, setTimeId]: Signal<number | null>): void {
		if (timeId()) {
			timeTimerClear(timeId()!)
			setTimeId(null)
		}

		promiseDone(
			navigatorClipboardWriteText(color),
			() => setTimeId(timeTimerSet(() => setTimeId(null), 1000))
		)
	}

	function hexToCSSValue(hex: HEXColor): string {
		const rgb = colorHexToRgb(hex)
		return `${mathRound(rgb.r * 0xff)}, ${mathRound(rgb.g * 0xff)}, ${mathRound(rgb.b * 0xff)}`
	}

	return (<main
		class={CSS.body_main}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			switch (elementId(button)) {
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