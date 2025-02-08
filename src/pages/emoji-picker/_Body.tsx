import { createSignal, createUniqueId, For, type VoidComponent } from "solid-js"

import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from "@/constants/emoji"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { Commands } from "./_enums"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { eventCurrentTarget } from "@/utils/event"
import { promiseDone } from "@/utils/object"
import { documentActive } from "@/utils/document"
import { elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { ICON_CHECKMARK, ICON_COPY } from "@/constants/icons"

import TextField, { updateTextFieldValue, TextFieldButton } from "@/components/TextField"
import Expander, { ExpanderHeader } from "@/components/Expander"
import Button from "@/components/Button"
import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import CSS from './_index.module.scss'

const _: VoidComponent<{
	text: string
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [timeCopyId, setTimeCopyId] = createSignal<number | null>(null)
	const buttonCopyId = createUniqueId()
	let textFieldRef: HTMLInputElement

	function pickEmoji(emoji: string): void {
		updateTextFieldValue(textFieldRef, textFieldRef.value + emoji)
	}

	function copy(): void {
		promiseDone(navigatorClipboardWriteText(textFieldRef.value), () => {
			if (timeCopyId() != null) timeTimerClear(timeCopyId()!)

			setTimeCopyId(timeTimerSet(
				() => setTimeCopyId(null),
				3000
			))
		})
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			switch (elementId(button)) {
			case buttonCopyId:
				copy()
				break
			default:
				const dataEmoji = elementDataset(button, 'emoji')
				if (dataEmoji) return pickEmoji(dataEmoji)
			}
		}}>
		<Tooltip>
			<div class={CSS.body_textfield}>
				<TextField
					c:label="Emoji"
					c:autoShowClearButton
					value={props.text}
					onInput={ev => props.command(Commands.updateText, eventCurrentTarget(ev).value)}
					ref={r => textFieldRef = r}
					c:trailing={<TextFieldButton
						id={buttonCopyId}
						data-tooltip={timeCopyId() != null? 'Copied' : "Copy"}>
						<Icon c:code={timeCopyId() != null? ICON_CHECKMARK : ICON_COPY}/>
					</TextFieldButton>}
				/>
			</div>
			<Expander
				open
				c:header={<ExpanderHeader>Smiley & emotion</ExpanderHeader>}>
				<For each={EMOJIS_SMILEY_AND_EMOTION}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Person & body</ExpanderHeader>}>
				<For each={EMOJIS_PERSON_AND_BODY}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Animal & nature</ExpanderHeader>}>
				<For each={EMOJIS_ANIMAL_AND_NATURE}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Food & drink</ExpanderHeader>}>
				<For each={EMOJIS_FOOD_AND_DRINK}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Travel & places</ExpanderHeader>}>
				<For each={EMOJIS_TRAVEL_AND_PLACES}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Activities</ExpanderHeader>}>
				<For each={EMOJIS_ACTIVITIES}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Objects</ExpanderHeader>}>
				<For each={EMOJIS_OBJECT}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Symbols</ExpanderHeader>}>
				<For each={EMOJIS_SYMBOLS}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Flags</ExpanderHeader>}>
				<For each={EMOJIS_FLAGS}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
		</Tooltip>
	</main>)
}

export default _