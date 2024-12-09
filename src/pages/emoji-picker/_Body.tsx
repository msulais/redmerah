import { createSignal, For, type VoidComponent } from "solid-js"

import { activities_emojis, animal_and_nature_emojis, flags_emojis, food_and_drink_emojis, object_emojis, person_and_body_emojis, smiley_and_emotion_emojis, symbols_emojis, travel_and_places_emojis } from "@/constants/emoji"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands } from "./_enums"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { promise_done } from "@/utils/object"

import TextField, { change_textfield_value, TextFieldButton } from "@/components/TextField"
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
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	let textfield_ref: HTMLInputElement

	function pick_emoji(emoji: string): void {
		change_textfield_value(textfield_ref, textfield_ref.value + emoji)
	}

	function copy(): void {
		promise_done(navigator_clipboard_writetext(textfield_ref.value), () => {
			if (timeout_copy_id() != null) timeout_clear(timeout_copy_id()!)

			set_timeout_copy_id(timeout_set(
				() => set_timeout_copy_id(null),
				3000
			))
		})
	}

	return (<main class={CSS.body}>
		<div class={CSS.body_textfield}>
			<TextField
				label="Emoji"
				auto_show_clear_button
				value={props.text}
				onInput={ev => props.command(Commands.update_text, ev.currentTarget.value)}
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
			<For each={smiley_and_emotion_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Person & body</ExpanderHeader>}>
			<For each={person_and_body_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Animal & nature</ExpanderHeader>}>
			<For each={animal_and_nature_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Food & drink</ExpanderHeader>}>
			<For each={food_and_drink_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Travel & places</ExpanderHeader>}>
			<For each={travel_and_places_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Activities</ExpanderHeader>}>
			<For each={activities_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Objects</ExpanderHeader>}>
			<For each={object_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Symbols</ExpanderHeader>}>
			<For each={symbols_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
		<Expander
			header={<ExpanderHeader>Flags</ExpanderHeader>}>
			<For each={flags_emojis}>{emoji =>
				<TextTooltip text={emoji[1]}>
					<Button onClick={() => pick_emoji(emoji[0])}><Emoji emoji={emoji[0]}/></Button>
				</TextTooltip>
			}</For>
		</Expander>
	</main>)
}

export default _