import { createSignal, createUniqueId, For, type VoidComponent } from "solid-js"

import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from "@/constants/emoji"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { Commands } from "./_enums"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { eventCurrentTarget } from "@/utils/event"
import { promiseDone } from "@/utils/object"
import { documentActive } from "@/utils/document"
import { elementAllBySelector, elementDataset, elementId, elementStyle, elementTagName, elementValidTarget } from "@/utils/element"
import { ICON_CHECKMARK, ICON_COPY } from "@/constants/icons"

import TextField, { updateTextFieldValue, TextFieldButton } from "@/components/TextField"
import Expander, { ExpanderHeader } from "@/components/Expander"
import Button from "@/components/Button"
import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import CSS from './_index.module.scss'
import { arrayLength, arrayPush } from "@/utils/array"
import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown, keyboardOnKeyDown2D } from "@/utils/keyboard"
import { stringSplit, stringTrim } from "@/utils/string"

const _: VoidComponent<{
	text: string
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [timeCopyId, setTimeCopyId] = createSignal<number | null>(null)
	const elements: HTMLElement[] = []
	const emojisSmileyAndEmotion: HTMLButtonElement[] = []
	const emojisPersonAndBody: HTMLButtonElement[] = []
	const emojisAnimalAndNature: HTMLButtonElement[] = []
	const emojisFoodAndDrink: HTMLButtonElement[] = []
	const emojisTravelAndPlaces: HTMLButtonElement[] = []
	const emojisActivities: HTMLButtonElement[] = []
	const emojisObject: HTMLButtonElement[] = []
	const emojisSymbols: HTMLButtonElement[] = []
	const emojisFlags: HTMLButtonElement[] = []
	const buttonCopyId = createUniqueId()
	let textFieldRef: HTMLInputElement
	let columnCount = 0
	let timeColumnCountId: number | null = null

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

	function onFocusIn(
		ev: FocusEvent & {currentTarget: HTMLDivElement},
		elements: HTMLElement[]
	): void {
		const self = eventCurrentTarget(ev)
		if (arrayLength(elements) === 0) {
			arrayPush(elements, ...elementAllBySelector('button', self))
		}
		keyboardOnFocusIn(ev, elements)
	}

	function onFocusOut(
		ev: FocusEvent & {currentTarget: HTMLDivElement},
		elements: HTMLElement[]
	): void {
		keyboardOnFocusOut(ev, elements)
	}

	function onKeyDown(
		ev: KeyboardEvent & {currentTarget: HTMLDivElement},
		elements: HTMLElement[]
	): void {
		// don't update every key press
		if (timeColumnCountId === null) columnCount = arrayLength(stringSplit(
			stringTrim(elementStyle(eventCurrentTarget(ev), "grid-template-columns")),
			" "
		))
		else timeTimerClear(timeColumnCountId)

		timeColumnCountId = timeTimerSet(() => timeColumnCountId = null, 200)
		keyboardOnKeyDown2D(ev, elements, columnCount)
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
		<Tooltip
			onFocusIn={ev => {
				const self = eventCurrentTarget(ev)
				if (arrayLength(elements) === 0) {
					arrayPush(elements, ...elementAllBySelector('summary', self))
				}

				keyboardOnFocusIn(ev, elements)
			}}
			onFocusOut={ev => keyboardOnFocusOut(ev, elements)}
			onKeyDown={ev => keyboardOnKeyDown(ev, elements, {up: 'prev', down: 'next'})}>
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
				c:header={<ExpanderHeader>Smiley & emotion</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisSmileyAndEmotion),
					onFocusOut: ev => onFocusOut(ev, emojisSmileyAndEmotion),
					onKeyDown: ev => onKeyDown(ev, emojisSmileyAndEmotion)
				}}>
				<For each={EMOJIS_SMILEY_AND_EMOTION}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Person & body</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisPersonAndBody),
					onFocusOut: ev => onFocusOut(ev, emojisPersonAndBody),
					onKeyDown: ev => onKeyDown(ev, emojisPersonAndBody)
				}}>
				<For each={EMOJIS_PERSON_AND_BODY}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Animal & nature</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisAnimalAndNature),
					onFocusOut: ev => onFocusOut(ev, emojisAnimalAndNature),
					onKeyDown: ev => onKeyDown(ev, emojisAnimalAndNature)
				}}>
				<For each={EMOJIS_ANIMAL_AND_NATURE}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Food & drink</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisFoodAndDrink),
					onFocusOut: ev => onFocusOut(ev, emojisFoodAndDrink),
					onKeyDown: ev => onKeyDown(ev, emojisFoodAndDrink)
				}}>
				<For each={EMOJIS_FOOD_AND_DRINK}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Travel & places</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisTravelAndPlaces),
					onFocusOut: ev => onFocusOut(ev, emojisTravelAndPlaces),
					onKeyDown: ev => onKeyDown(ev, emojisTravelAndPlaces)
				}}>
				<For each={EMOJIS_TRAVEL_AND_PLACES}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Activities</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisActivities),
					onFocusOut: ev => onFocusOut(ev, emojisActivities),
					onKeyDown: ev => onKeyDown(ev, emojisActivities)
				}}>
				<For each={EMOJIS_ACTIVITIES}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Objects</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisObject),
					onFocusOut: ev => onFocusOut(ev, emojisObject),
					onKeyDown: ev => onKeyDown(ev, emojisObject)
				}}>
				<For each={EMOJIS_OBJECT}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Symbols</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisSymbols),
					onFocusOut: ev => onFocusOut(ev, emojisSymbols),
					onKeyDown: ev => onKeyDown(ev, emojisSymbols)
				}}>
				<For each={EMOJIS_SYMBOLS}>{emoji =>
					<Button
						data-tooltip={emoji[1]}
						data-emoji={emoji[0]}>
						{emoji[0]}
					</Button>
				}</For>
			</Expander>
			<Expander
				c:header={<ExpanderHeader>Flags</ExpanderHeader>}
				c:attrBody={{
					onFocusIn: ev => onFocusIn(ev, emojisFlags),
					onFocusOut: ev => onFocusOut(ev, emojisFlags),
					onKeyDown: ev => onKeyDown(ev, emojisFlags)
				}}>
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