import { createSignal, Show, type VoidComponent } from "solid-js"

import { safeNumber } from "@/utils/math"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Button, { ButtonVariant } from "@/components/Button"
import { _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerCenter, _centerCenterBottom, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterLeftTop, _centerCenterRight, _centerCenterRightBottom, _centerCenterRightTop, _centerCenterTop, _centerTop, _centerTopToLeft, _centerTopToRight, _checked, _currentTarget, _includes, _leftBottom, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _leftTop, _rightBottom, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _rightTop, _tonal, _valueAsNumber } from "@/constants/string"
import EmojiPicker, { EmojiPickerPosition, openEmojiPicker } from "@/components/EmojiPicker"
import type { Emoji } from "@/types/emoji"
import Icon from "@/components/Icon"
import EmojiC from "@/components/Emoji"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import { NumberTextField } from "@/components/TextField"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [dragable, setDragable] = createSignal<boolean>(false)
	const [multiple, setMultiple] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<EmojiPickerPosition>(EmojiPickerPosition[_centerBottom])
	const [anchor, setAnchor] = createSignal<boolean>(true)
	const [showCloseButton, setShowCloseButton] = createSignal<boolean>(false)
	const [emoji, setEmoji] = createSignal<Emoji | null>(null)
	let emojiPicker_ref: HTMLDialogElement
	return (<Page
		title="EmojiPicker"
		description="An EmojiPicker is a UI element that allows users to select and insert emojis into text fields or other input areas. It typically presents a grid of emojis that can be searched, filtered, or categorized for easy selection.">
		<Playground>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={ev => openEmojiPicker(ev, emojiPicker_ref, {
					anchor: anchor()? ev[_currentTarget] : undefined,
					allowHideAnchor: allowHideAnchor(),
					dragable: dragable(),
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
				onSelectEmoji={(emoji, name) => setEmoji([emoji, name])}
				multiple={multiple()}
				showCloseButton={showCloseButton()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				items={[
					[EmojiPickerPosition[_leftTop], 'Left top'],
					[EmojiPickerPosition[_leftCenterToBottom], 'Left center to bottom'],
					[EmojiPickerPosition[_leftCenter], 'Left center'],
					[EmojiPickerPosition[_leftCenterToTop], 'Left center to top'],
					[EmojiPickerPosition[_leftBottom], 'Left bottom'],
					[EmojiPickerPosition[_rightTop], 'Right top'],
					[EmojiPickerPosition[_rightCenterToBottom], 'Right center to bottom'],
					[EmojiPickerPosition[_rightCenter], 'Right center'],
					[EmojiPickerPosition[_rightCenterToTop], 'Right center to top'],
					[EmojiPickerPosition[_rightBottom], 'Right bottom'],
					[EmojiPickerPosition[_centerTopToRight], 'Center top to right'],
					[EmojiPickerPosition[_centerTop], 'Center top'],
					[EmojiPickerPosition[_centerTopToLeft], 'Center top to left'],
					[EmojiPickerPosition[_centerBottomToRight], 'Center bottom to right'],
					[EmojiPickerPosition[_centerBottom], 'Center bottom'],
					[EmojiPickerPosition[_centerBottomToLeft], 'Center bottom to left'],
					[EmojiPickerPosition[_centerCenterLeftTop], 'Center center left top'],
					[EmojiPickerPosition[_centerCenterLeft], 'Center center left'],
					[EmojiPickerPosition[_centerCenterLeftBottom], 'Center center left bottom'],
					[EmojiPickerPosition[_centerCenterTop], 'Center center top'],
					[EmojiPickerPosition[_centerCenter], 'Center center'],
					[EmojiPickerPosition[_centerCenterBottom], 'Center center bottom'],
					[EmojiPickerPosition[_centerCenterRightTop], 'Center center right top'],
					[EmojiPickerPosition[_centerCenterRight], 'Center center right'],
					[EmojiPickerPosition[_centerCenterRightBottom], 'Center center right bottom'],
				]}
				labelText="Position"
				selectedValues={[position()]}
				onSelectedItemsChanged={(items) => setPosition(items[0][0] as EmojiPickerPosition)}
			/>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => setGap(g => safeNumber(ev[_currentTarget][_valueAsNumber], g))}
				labelText="Gap"
			/>
			<Show when={[
				EmojiPickerPosition[_centerTopToRight],
				EmojiPickerPosition[_centerCenterLeft],
				EmojiPickerPosition[_centerBottomToRight],
				EmojiPickerPosition[_centerTopToLeft],
				EmojiPickerPosition[_centerCenterRight],
				EmojiPickerPosition[_centerBottomToLeft],
				EmojiPickerPosition[_leftCenterToBottom],
				EmojiPickerPosition[_centerCenterLeftTop],
				EmojiPickerPosition[_centerCenterTop],
				EmojiPickerPosition[_centerCenterRightTop],
				EmojiPickerPosition[_rightCenterToBottom],
				EmojiPickerPosition[_leftCenterToTop],
				EmojiPickerPosition[_centerCenterLeftBottom],
				EmojiPickerPosition[_centerCenterBottom],
				EmojiPickerPosition[_centerCenterRightBottom],
				EmojiPickerPosition[_rightCenterToTop]
			][_includes](position())}>
				<NumberTextField
					value={padding()}
					style={{width: '100px'}}
					min={0}
					onBlur={(ev) => setPadding(p => safeNumber(ev[_currentTarget][_valueAsNumber], p))}
					labelText="Padding"
				/>
			</Show>
			<CheckBox
				checked={anchor()}
				onChange={ev => setAnchor(ev[_currentTarget][_checked])}>
				Anchor
			</CheckBox>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(ev[_currentTarget][_checked])}>
				Important
			</CheckBox>
			<CheckBox
				checked={dragable()}
				onChange={ev => setDragable(ev[_currentTarget][_checked])}>
				Dragable
			</CheckBox>
			<CheckBox
				checked={allowHideAnchor()}
				onChange={ev => setAllowHideAnchor(ev[_currentTarget][_checked])}>
				Allow hide anchor
			</CheckBox>
			<CheckBox
				checked={multiple()}
				onChange={ev => setMultiple(ev[_currentTarget][_checked])}>
				Multiple
			</CheckBox>
			<CheckBox
				checked={showCloseButton()}
				onChange={ev => setShowCloseButton(ev[_currentTarget][_checked])}>
				Show close button
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _