import { createSignal, For, type VoidComponent } from "solid-js"

import { activitiesEmojis, animalAndNatureEmojis, flagsEmojis, foodAndDrinkEmojis, objectsEmojis, personAndBodyEmojis, smileyAndEmotionEmojis, symbolsEmojis, travelAndPlacesEmojis } from "@/constants/emoji"
import { _clipboard, _command, _currentTarget, _text, _then, _value, _writeText } from "@/constants/string"
import { endTimeout, startTimeout } from "@/utils/timeout"
import { getNavigator } from "@/constants/window"
import { Commands } from "./_enums"

import TextField, { changeTextFieldValue, TextFieldButton } from "@/components/TextField"
import Expander, { ExpanderHeader } from "@/components/Expander"
import Button from "@/components/Button"
import Emoji from "@/components/Emoji"
import TextTooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import CSS from './_index.module.scss'

const _: VoidComponent<{
	text: string
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [timeout_copy_id, setTimeout_copy_id] = createSignal<number | null>(null)
	let textfield_ref: HTMLInputElement

	function pickEmoji(emoji: string): void {
		changeTextFieldValue(textfield_ref, textfield_ref[_value] + emoji)
	}

	function copy(): void {
		getNavigator()
		[_clipboard]
		[_writeText](textfield_ref[_value])
		[_then](() => {
			if (timeout_copy_id() != null) endTimeout(timeout_copy_id()!)

			setTimeout_copy_id(startTimeout(
				() => setTimeout_copy_id(null),
				3000
			))
		})
	}

	return (<main class={CSS.body}>
		<div class={CSS.body_textfield}>
			<TextField
				label="Emoji"
				autoShowClearBtn
				value={props[_text]}
				onInput={ev => props[_command](Commands.update_text, ev[_currentTarget][_value])}
				ref={r => textfield_ref = r}
				trailing={<TextTooltip text={timeout_copy_id() != null? 'Copied' : "Copy"}>
					<TextFieldButton onClick={copy}>
						<Icon code={timeout_copy_id() != null? 0xE3D8 : 0xE51B}/>
					</TextFieldButton>
				</TextTooltip>}
			/>
		</div>
		<Expander
			open
			header={<ExpanderHeader>Smiley & emotion</ExpanderHeader>}>
			<For each={smileyAndEmotionEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Person & body</ExpanderHeader>}>
			<For each={personAndBodyEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Animal & nature</ExpanderHeader>}>
			<For each={animalAndNatureEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Food & drink</ExpanderHeader>}>
			<For each={foodAndDrinkEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Travel & places</ExpanderHeader>}>
			<For each={travelAndPlacesEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Activities</ExpanderHeader>}>
			<For each={activitiesEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Objects</ExpanderHeader>}>
			<For each={objectsEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Symbols</ExpanderHeader>}>
			<For each={symbolsEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Flags</ExpanderHeader>}>
			<For each={flagsEmojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pickEmoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
	</main>)
}

export default _