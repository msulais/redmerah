import { createSignal, For, Show, type VoidComponent } from "solid-js"

import type { Emoji } from "@/types/emoji"
import { numberSafe } from "@/utils/number"
import { arrayIncludes } from "@/utils/array"
import { eventCurrentTarget } from "@/utils/event"
import { ICON_EMOJI_ADD } from "@/constants/icons"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Button, { ButtonVariant } from "@/components/Button"
import EmojiPicker, { EmojiPickerPosition, openEmojiPicker } from "@/components/EmojiPicker"
import Icon from "@/components/Icon"
import EmojiC from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import Tooltip from "@/components/Tooltip"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { NumberTextField } from "@/components/TextField"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [draggable, setDraggable] = createSignal<boolean>(false)
	const [multiple, setMultiple] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<EmojiPickerPosition>(EmojiPickerPosition.centerBottom)
	const [anchor, setAnchor] = createSignal<boolean>(true)
	const [showCloseButton, setShowCloseButton] = createSignal<boolean>(false)
	const [emoji, setEmoji] = createSignal<Emoji | null>(null)
	let emojiPickerRef: HTMLDialogElement
	return (<Page
		title="EmojiPicker"
		description="An EmojiPicker is a UI element that allows users to select and insert emojis into text fields or other input areas. It typically presents a grid of emojis that can be searched, filtered, or categorized for easy selection.">
		<Playground>
			<Button
				c:variant={ButtonVariant.tonal}
				onClick={ev => openEmojiPicker(ev, emojiPickerRef, {
					anchor: anchor()? eventCurrentTarget(ev) : undefined,
					allowHideAnchor: allowHideAnchor(),
					draggable: draggable(),
					gap: gap(),
					important: important(),
					padding: padding(),
					position: position(),
				})}>
				<Show when={emoji() != null} fallback={<><Icon c:code={ICON_EMOJI_ADD}/>Pick emoji</>}>
					<EmojiC c:emoji={emoji()![0]}/>
					{emoji()![1]}
				</Show>
			</Button>
			<EmojiPicker
				ref={r => emojiPickerRef = r}
				c:onSelectEmoji={(emoji, name) => setEmoji([emoji, name])}
				c:multiple={multiple()}
				c:useCloseButton={showCloseButton()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Position"
					c:values={[position()]}
					c:onChange={(options) => setPosition(options[0].value as EmojiPickerPosition)}>
					<For each={[
						[EmojiPickerPosition.leftTop, 'Left top'],
						[EmojiPickerPosition.leftCenterToBottom, 'Left center to bottom'],
						[EmojiPickerPosition.leftCenter, 'Left center'],
						[EmojiPickerPosition.leftCenterToTop, 'Left center to top'],
						[EmojiPickerPosition.leftBottom, 'Left bottom'],
						[EmojiPickerPosition.rightTop, 'Right top'],
						[EmojiPickerPosition.rightCenterToBottom, 'Right center to bottom'],
						[EmojiPickerPosition.rightCenter, 'Right center'],
						[EmojiPickerPosition.rightCenterToTop, 'Right center to top'],
						[EmojiPickerPosition.rightBottom, 'Right bottom'],
						[EmojiPickerPosition.centerTopToRight, 'Center top to right'],
						[EmojiPickerPosition.centerTop, 'Center top'],
						[EmojiPickerPosition.centerTopToLeft, 'Center top to left'],
						[EmojiPickerPosition.centerBottomToRight, 'Center bottom to right'],
						[EmojiPickerPosition.centerBottom, 'Center bottom'],
						[EmojiPickerPosition.centerBottomToLeft, 'Center bottom to left'],
						[EmojiPickerPosition.centerCenterLeftTop, 'Center center left top'],
						[EmojiPickerPosition.centerCenterLeft, 'Center center left'],
						[EmojiPickerPosition.centerCenterLeftBottom, 'Center center left bottom'],
						[EmojiPickerPosition.centerCenterTop, 'Center center top'],
						[EmojiPickerPosition.centerCenter, 'Center center'],
						[EmojiPickerPosition.centerCenterBottom, 'Center center bottom'],
						[EmojiPickerPosition.centerCenterRightTop, 'Center center right top'],
						[EmojiPickerPosition.centerCenterRight, 'Center center right'],
						[EmojiPickerPosition.centerCenterRightBottom, 'Center center right bottom'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<NumberTextField
					style={{width: '100px'}}
					value={gap()}
					min={0}
					onBlur={(ev) => setGap(g => numberSafe(eventCurrentTarget(ev).valueAsNumber, g))}
					c:label="Gap"
				/>
				<Show when={arrayIncludes([
					EmojiPickerPosition.centerTopToRight,
					EmojiPickerPosition.centerCenterLeft,
					EmojiPickerPosition.centerBottomToRight,
					EmojiPickerPosition.centerTopToLeft,
					EmojiPickerPosition.centerCenterRight,
					EmojiPickerPosition.centerBottomToLeft,
					EmojiPickerPosition.leftCenterToBottom,
					EmojiPickerPosition.centerCenterLeftTop,
					EmojiPickerPosition.centerCenterTop,
					EmojiPickerPosition.centerCenterRightTop,
					EmojiPickerPosition.rightCenterToBottom,
					EmojiPickerPosition.leftCenterToTop,
					EmojiPickerPosition.centerCenterLeftBottom,
					EmojiPickerPosition.centerCenterBottom,
					EmojiPickerPosition.centerCenterRightBottom,
					EmojiPickerPosition.rightCenterToTop
				], position())}>
					<NumberTextField
						value={padding()}
						style={{width: '100px'}}
						min={0}
						onBlur={(ev) => setPadding(p => numberSafe(eventCurrentTarget(ev).valueAsNumber, p))}
						c:label="Padding"
					/>
				</Show>
				<CheckBox
					checked={anchor()}
					onChange={ev => setAnchor(eventCurrentTarget(ev).checked)}>
					Anchor
				</CheckBox>
				<CheckBox
					checked={important()}
					onChange={ev => setImportant(eventCurrentTarget(ev).checked)}>
					Important
				</CheckBox>
				<CheckBox
					checked={draggable()}
					onChange={ev => setDraggable(eventCurrentTarget(ev).checked)}>
					Dragable
				</CheckBox>
				<CheckBox
					checked={allowHideAnchor()}
					onChange={ev => setAllowHideAnchor(eventCurrentTarget(ev).checked)}>
					Allow hide anchor
				</CheckBox>
				<CheckBox
					checked={multiple()}
					onChange={ev => setMultiple(eventCurrentTarget(ev).checked)}>
					Multiple
				</CheckBox>
				<CheckBox
					checked={showCloseButton()}
					onChange={ev => setShowCloseButton(eventCurrentTarget(ev).checked)}>
					Show close button
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _