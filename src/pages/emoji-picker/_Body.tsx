import { createSignal, createUniqueId, For, type VoidComponent } from "solid-js"

import { activities_emojis, animal_and_nature_emojis, flags_emojis, food_and_drink_emojis, object_emojis, person_and_body_emojis, smiley_and_emotion_emojis, symbols_emojis, travel_and_places_emojis } from "@/constants/emoji"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands } from "./_enums"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { event_current_target } from "@/utils/event"
import { promise_done } from "@/utils/object"
import { document_active } from "@/utils/document"
import { element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"

import TextField, { change_textfield_value, TextFieldButton } from "@/components/TextField"
import Expander, { ExpanderHeader } from "@/components/Expander"
import Button from "@/components/Button"
import Emoji from "@/components/Emoji"
import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import CSS from './_index.module.scss'

const _: VoidComponent<{
	text: string
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const button_copy_id = createUniqueId()
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

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			switch (element_id(button)) {
				case button_copy_id: {
					copy()
					break
				}
				default: {
					const data_emoji = element_dataset(button, 'emoji')
					if (data_emoji) return pick_emoji(data_emoji)
				}
			}
		}}>
		<Tooltip>
			<div class={CSS.body_textfield}>
				<TextField
					c_label="Emoji"
					c_auto_show_clear_button
					value={props.text}
					onInput={ev => props.command(Commands.update_text, event_current_target(ev).value)}
					ref={r => textfield_ref = r}
					c_trailing={<TextFieldButton
						id={button_copy_id}
						data-tooltip={timeout_copy_id() != null? 'Copied' : "Copy"}>
						<Icon c_code={timeout_copy_id() != null? 0xE3D8 : 0xE51B}/>
					</TextFieldButton>}
				/>
			</div>
			<Expander
				open
				c_header={<ExpanderHeader>Smiley & emotion</ExpanderHeader>}>
				<For each={smiley_and_emotion_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Person & body</ExpanderHeader>}>
				<For each={person_and_body_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Animal & nature</ExpanderHeader>}>
				<For each={animal_and_nature_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Food & drink</ExpanderHeader>}>
				<For each={food_and_drink_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Travel & places</ExpanderHeader>}>
				<For each={travel_and_places_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Activities</ExpanderHeader>}>
				<For each={activities_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Objects</ExpanderHeader>}>
				<For each={object_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Symbols</ExpanderHeader>}>
				<For each={symbols_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
			<Expander
				c_header={<ExpanderHeader>Flags</ExpanderHeader>}>
				<For each={flags_emojis}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						<Emoji c_emoji={emoji[0]}/>
					</Button>
				}</For>
			</Expander>
		</Tooltip>
	</main>)
}

export default _