import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"
import { array_includes } from "@/utils/array"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Button, { ButtonVariant } from "@/components/Button"
import EmojiPicker, { EmojiPickerPosition, open_emojipicker } from "@/components/EmojiPicker"
import type { Emoji } from "@/types/emoji"
import Icon from "@/components/Icon"
import EmojiC from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { NumberTextField } from "@/components/TextField"

const _: VoidComponent = () => {
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [draggable, set_draggable] = createSignal<boolean>(false)
	const [multiple, set_multiple] = createSignal<boolean>(false)
	const [gap, set_gap] = createSignal<number>(12)
	const [important, set_important] = createSignal<boolean>(false)
	const [padding, set_padding] = createSignal<number>(0)
	const [position, set_position] = createSignal<EmojiPickerPosition>(EmojiPickerPosition.center_bottom)
	const [anchor, set_anchor] = createSignal<boolean>(true)
	const [show_close_button, set_show_close_button] = createSignal<boolean>(false)
	const [emoji, set_emoji] = createSignal<Emoji | null>(null)
	let emojiPicker_ref: HTMLDialogElement
	return (<Page
		title="EmojiPicker"
		description="An EmojiPicker is a UI element that allows users to select and insert emojis into text fields or other input areas. It typically presents a grid of emojis that can be searched, filtered, or categorized for easy selection.">
		<Playground>
			<Button
				variant={ButtonVariant.tonal}
				onClick={ev => open_emojipicker(ev, emojiPicker_ref, {
					anchor: anchor()? ev.currentTarget : undefined,
					allow_hide_anchor: allow_hide_anchor(),
					draggable: draggable(),
					gap: gap(),
					important: important(),
					padding: padding(),
					position: position(),
				})}>
				<Show when={emoji() != null} fallback={<><Icon code={0xE747}/>Pick emoji</>}>
					<EmojiC emoji={emoji()![0]}/>
					{emoji()![1]}
				</Show>
			</Button>
			<EmojiPicker
				ref={r => emojiPicker_ref = r}
				on_select_emoji={(emoji, name) => set_emoji([emoji, name])}
				multiple={multiple()}
				use_close_button={show_close_button()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				values={[position()]}
				on_change_options={(options) => set_position(options[0].value as EmojiPickerPosition)}>
				<For each={[
					[EmojiPickerPosition.left_top, 'Left top'],
					[EmojiPickerPosition.left_center_to_bottom, 'Left center to bottom'],
					[EmojiPickerPosition.left_center, 'Left center'],
					[EmojiPickerPosition.left_center_to_top, 'Left center to top'],
					[EmojiPickerPosition.left_bottom, 'Left bottom'],
					[EmojiPickerPosition.right_top, 'Right top'],
					[EmojiPickerPosition.right_center_to_bottom, 'Right center to bottom'],
					[EmojiPickerPosition.right_center, 'Right center'],
					[EmojiPickerPosition.right_center_to_top, 'Right center to top'],
					[EmojiPickerPosition.right_bottom, 'Right bottom'],
					[EmojiPickerPosition.center_top_to_right, 'Center top to right'],
					[EmojiPickerPosition.center_top, 'Center top'],
					[EmojiPickerPosition.center_top_to_left, 'Center top to left'],
					[EmojiPickerPosition.center_bottom_to_right, 'Center bottom to right'],
					[EmojiPickerPosition.center_bottom, 'Center bottom'],
					[EmojiPickerPosition.center_bottom_to_left, 'Center bottom to left'],
					[EmojiPickerPosition.center_center_left_top, 'Center center left top'],
					[EmojiPickerPosition.center_center_left, 'Center center left'],
					[EmojiPickerPosition.center_center_left_bottom, 'Center center left bottom'],
					[EmojiPickerPosition.center_center_top, 'Center center top'],
					[EmojiPickerPosition.center_center, 'Center center'],
					[EmojiPickerPosition.center_center_bottom, 'Center center bottom'],
					[EmojiPickerPosition.center_center_right_top, 'Center center right top'],
					[EmojiPickerPosition.center_center_right, 'Center center right'],
					[EmojiPickerPosition.center_center_right_bottom, 'Center center right bottom'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => set_gap(g => number_safe(ev.currentTarget.valueAsNumber, g))}
				label="Gap"
			/>
			<Show when={array_includes([
				EmojiPickerPosition.center_top_to_right,
				EmojiPickerPosition.center_center_left,
				EmojiPickerPosition.center_bottom_to_right,
				EmojiPickerPosition.center_top_to_left,
				EmojiPickerPosition.center_center_right,
				EmojiPickerPosition.center_bottom_to_left,
				EmojiPickerPosition.left_center_to_bottom,
				EmojiPickerPosition.center_center_left_top,
				EmojiPickerPosition.center_center_top,
				EmojiPickerPosition.center_center_right_top,
				EmojiPickerPosition.right_center_to_bottom,
				EmojiPickerPosition.left_center_to_top,
				EmojiPickerPosition.center_center_left_bottom,
				EmojiPickerPosition.center_center_bottom,
				EmojiPickerPosition.center_center_right_bottom,
				EmojiPickerPosition.right_center_to_top
			], position())}>
				<NumberTextField
					value={padding()}
					style={{width: '100px'}}
					min={0}
					onBlur={(ev) => set_padding(p => number_safe(ev.currentTarget.valueAsNumber, p))}
					label="Padding"
				/>
			</Show>
			<CheckBox
				checked={anchor()}
				onChange={ev => set_anchor(ev.currentTarget.checked)}>
				Anchor
			</CheckBox>
			<CheckBox
				checked={important()}
				onChange={ev => set_important(ev.currentTarget.checked)}>
				Important
			</CheckBox>
			<CheckBox
				checked={draggable()}
				onChange={ev => set_draggable(ev.currentTarget.checked)}>
				Dragable
			</CheckBox>
			<CheckBox
				checked={allow_hide_anchor()}
				onChange={ev => set_allow_hide_anchor(ev.currentTarget.checked)}>
				Allow hide anchor
			</CheckBox>
			<CheckBox
				checked={multiple()}
				onChange={ev => set_multiple(ev.currentTarget.checked)}>
				Multiple
			</CheckBox>
			<CheckBox
				checked={show_close_button()}
				onChange={ev => set_show_close_button(ev.currentTarget.checked)}>
				Show close button
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _