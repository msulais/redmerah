import { TransitionGroup } from 'solid-transition-group'
import { createMemo, createSignal, For, onCleanup, onMount, Show, splitProps, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import type { Emoji } from '@/types/emoji'
import { activitiesEmojis, animalAndNatureEmojis, flagsEmojis, foodAndDrinkEmojis, objectsEmojis, personAndBodyEmojis, smileyAndEmotionEmojis, symbolsEmojis, travelAndPlacesEmojis } from '@/constants/emoji'
import { _activities, _addRecentEmoji, _animalAndNature, _animate, _category, _children, _classList, _closeTooltip, _concat, _currentTarget, _detail, _dispatchEvent, _element, _emoji, _emojiListener, _emojis, _filled, _findIndex, _finished, _flags, _foodAndDrink, _getRecentEmoji, _iconCode, _join, _length, _localeCompare, _multiple, _objects, _onSelectEmoji, _onToggleOpen, _option, _personAndBody, _push, _recents, _ref, _removeRecentEmoji, _replace, _showCloseBtn, _showCloseButton, _slice, _smileyAndEmotion, _some, _sort, _splice, _split, _spring, _symbols, _test, _then, _tonal, _travelAndPlaces, _trim, _value } from '@/constants/string'
import { hasAttribute, toggleAttribute,setAttribute } from '@/utils/attributes'
import { getDocumentBody } from '@/constants/window'
import { BodyAttributes } from '@/enums/attributes'
import { addEventListener, removeEventListener } from '@/utils/event'
import { clearTimeDelayed, setTimeDelayed } from '@/utils/timeout'
import { BodyEvents } from '@/enums/events'
import { AnimationEffectTiming } from '@/enums/animation'

import Divider from '@/components/Divider'
import TextTooltip from '@/components/Tooltip'
import EmojiC from '@/components/Emoji'
import { ButtonVariant, EmojiButton, IconButton } from '@/components/Button'
import { closeSearchMenu, SearchMenuItem, SearchTextField } from '@/components/TextField'
import { Modal, type ModalProps, openModal, closeModal, repositionModal, focusModal, ModalPosition as EmojiPickerPosition } from '@/components/Modal'
import './index.scss'

const ALL_EMOJI: Emoji[] = ([] as Emoji[])[_concat](smileyAndEmotionEmojis, personAndBodyEmojis, animalAndNatureEmojis, foodAndDrinkEmojis, travelAndPlacesEmojis, activitiesEmojis, objectsEmojis, symbolsEmojis, flagsEmojis)[_sort]((a, b) => a[1][_localeCompare](b[1]))

enum EmojiCategory {
	smileyAndEmotion = 'Smiley & emotion',
	personAndBody = 'Person & body',
	animalAndNature = 'Animal & nature',
	foodAndDrink = 'Food & drink',
	travelAndPlaces = 'Travel & places',
	activities = 'Activities',
	objects = 'Objects',
	symbols = 'Symbols',
	flags = 'Flags',
	recents = 'Recents'
}

enum EmojiPickerEvents {
	/** @param emojis `Emoji[]` */
	getRecentEmoji = 'on-get-recent-emoji'
}

function initEmojiPicker(): void {
	if (hasAttribute(getDocumentBody(), BodyAttributes[_emojiListener])) return;
	setAttribute(getDocumentBody(), BodyAttributes[_emojiListener])

	let recents: Emoji[] = []

	addEventListener(getDocumentBody(), BodyEvents[_addRecentEmoji], ev => {
		const emoji = (ev as any)[_detail][_emoji] as Emoji
		const index = recents[_findIndex](v => v[0] == emoji[0])
		if (index >= 0) recents[_splice](index, 1)

		recents = [emoji, ...recents[_slice](0, 41)]
	})

	addEventListener(getDocumentBody(), BodyEvents[_getRecentEmoji], ev => {
		const element = (ev as any)[_detail][_element] as HTMLElement
		element[_dispatchEvent](new CustomEvent(
			EmojiPickerEvents[_getRecentEmoji],
			{detail: {emojis: [...recents]}}
		))
	})
}

type EmojiPickerProps = ModalProps & {
	onSelectEmoji?: (emoji: string, name: string) => unknown
	multiple?: boolean
	showCloseButton?: boolean
	closeTooltip?: string
}
const EmojiPicker: ParentComponent<EmojiPickerProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_classList, _onSelectEmoji, _ref, _multiple,
		_showCloseButton, _closeTooltip, _children
	])
	const [option, setOption] = createSignal<EmojiCategory>(EmojiCategory[_recents])
	const [recents, setRecents] = createSignal<Emoji[]>([])
	const [searchText, setSearchText] = createSignal<string>('')
	const getSearchRegex = createMemo<RegExp | null>(() => {
		const t = searchText()[_trim]()[_replace](/ +/g, ' ')[_replace](/[^\w- ]/g, '')
		return t[_length] == 0? null : new RegExp(t[_split](' ')[_join]('|'), 'gi')
	})
	let emojiPicker_ref: HTMLDialogElement
	let timeoutId: number | null = null
	let searchMenu_ref: HTMLDivElement

	function updateRecents(): void {
		getDocumentBody()[_dispatchEvent](new CustomEvent(
			BodyEvents[_getRecentEmoji],
			{detail: {element: emojiPicker_ref}}
		))
	}

	function customOnGetRecentEmoji(ev: CustomEvent): void {
		const emojis = ev[_detail][_emojis] as Emoji[]
		setRecents(emojis)
	}

	function initEvents(): void {
		addEventListener<CustomEvent>(
			emojiPicker_ref,
			EmojiPickerEvents[_getRecentEmoji],
			customOnGetRecentEmoji
		)

		onCleanup(() => {
			removeEventListener<CustomEvent>(
				emojiPicker_ref,
				EmojiPickerEvents[_getRecentEmoji],
				customOnGetRecentEmoji
			)
		})
	}

	onMount(() => {
		initEmojiPicker()
		initEvents()
	})

	const Tab: VoidComponent<{option: EmojiCategory; iconCode: number}> = ($props) => (<TextTooltip
		text={$props[_option]}>
		<IconButton
			code={$props[_iconCode]}
			selected={option() == $props[_option]}
			variant={option() == $props[_option]? ButtonVariant[_tonal] : undefined}
			onClick={() => setOption($props[_option])}
		/>
	</TextTooltip>)

	const Emojis: VoidComponent<{option: EmojiCategory, emojis: Emoji[]}> = $props => (<div
		class='emoji-picker-emojis'
		data-hidden={toggleAttribute($props[_option] != option())}>
		<div>
			<h3>{$props[_option]}</h3>
			<For each={$props[_emojis]}>{e =>
				<TextTooltip text={e[1]}>
					<EmojiButton emoji={e[0]} onClick={() => {
						getDocumentBody()[_dispatchEvent](new CustomEvent(
							BodyEvents[_addRecentEmoji],
							{detail: {emoji: [...e]}}
						))
						updateRecents()
						if (!props[_multiple]) closeModal(emojiPicker_ref)
						props[_onSelectEmoji]?.(e[0], e[1])
					}}/>
				</TextTooltip>
			}</For>
		</div>
	</div>)

	return (<Modal
		classList={{
			'emoji-picker': true,
			...props[_classList]
		}}
		ref={mergeRefs(props[_ref], r => emojiPicker_ref = r)}
		{...other}>
		<div class="emoji-picker-tabs">
			<Tab iconCode={0xE8DE} option={EmojiCategory[_recents]}/>
			<Tab iconCode={0xE745} option={EmojiCategory[_smileyAndEmotion]}/>
			<Tab iconCode={0xEBF8} option={EmojiCategory[_personAndBody]}/>
			<Tab iconCode={0xE04F} option={EmojiCategory[_animalAndNature]}/>
			<Tab iconCode={0xE80B} option={EmojiCategory[_foodAndDrink]}/>
			<Tab iconCode={0xF227} option={EmojiCategory[_travelAndPlaces]}/>
			<TextTooltip text={props[_closeTooltip] ?? 'Close'}>
				<Show when={props[_showCloseButton]}>
					<IconButton
						code={0xE5E9}
						variant={ButtonVariant[_filled]}
						onClick={() => closeModal(emojiPicker_ref)}
					/>
				</Show>
			</TextTooltip>
			<Tab iconCode={0xEC3C} option={EmojiCategory[_activities]}/>
			<Tab iconCode={0xE5F1} option={EmojiCategory[_objects]}/>
			<Tab iconCode={0xEF77} option={EmojiCategory[_symbols]}/>
			<Tab iconCode={0xE7AB} option={EmojiCategory[_flags]}/>
		</div>
		<div class='emoji-picker-search'>
			<SearchTextField
				placeholder='Search emoji'
				onInput={(ev) => {
					const text = ev[_currentTarget][_value]

					if (timeoutId != null) clearTimeDelayed(timeoutId)
					timeoutId = setTimeDelayed(() => {
						setSearchText(text)
					}, 1000)
				}}
				menuAttr={{
					ref: (r) => searchMenu_ref = r
				}}
				result={<TransitionGroup
					onEnter={(el, done) => {el[_animate](
						[ { transform: 'translateX(-12px)', opacity: 0 }, { tranform: null, opacity: 1 } ],
						{ duration: 300, easing: AnimationEffectTiming[_spring] }
					)[_finished][_then](done)}}
					onExit={(el, done) => {el[_animate](
						{ transform: 'translateX(-12px)', opacity: 0 },
						{ duration: 300, easing: AnimationEffectTiming[_spring] }
					)[_finished][_then](done)}}>
					<For each={ALL_EMOJI}>{e => <Show when={getSearchRegex() != null && getSearchRegex()![_test](e[1])}>
						<SearchMenuItem onClick={() => {
							getDocumentBody()[_dispatchEvent](new CustomEvent(
								BodyEvents[_addRecentEmoji],
								{detail: {emoji: [...e]}}
							))
							updateRecents()
							if (!props[_multiple]) closeModal(emojiPicker_ref)
							closeSearchMenu(searchMenu_ref)
							props[_onSelectEmoji]?.(e[0], e[1])
						}}>
							<EmojiC emoji={e[0]}/>{e[1]}
						</SearchMenuItem>
					</Show>}</For>
				</TransitionGroup>}
			/>
		</div>
		{props[_children]}
		<Divider />
		<Emojis emojis={recents()} option={EmojiCategory[_recents]}/>
		<Emojis emojis={smileyAndEmotionEmojis} option={EmojiCategory[_smileyAndEmotion]}/>
		<Emojis emojis={personAndBodyEmojis} option={EmojiCategory[_personAndBody]}/>
		<Emojis emojis={animalAndNatureEmojis} option={EmojiCategory[_animalAndNature]}/>
		<Emojis emojis={foodAndDrinkEmojis} option={EmojiCategory[_foodAndDrink]}/>
		<Emojis emojis={travelAndPlacesEmojis} option={EmojiCategory[_travelAndPlaces]}/>
		<Emojis emojis={activitiesEmojis} option={EmojiCategory[_activities]}/>
		<Emojis emojis={objectsEmojis} option={EmojiCategory[_objects]}/>
		<Emojis emojis={symbolsEmojis} option={EmojiCategory[_symbols]}/>
		<Emojis emojis={flagsEmojis} option={EmojiCategory[_flags]}/>
	</Modal>)
}

export {
	EmojiPicker,
	openModal as openEmojiPicker,
	closeModal as closeEmojiPicker,
	repositionModal as repositionEmojiPicker,
	focusModal as focusEmojiPicker,
	EmojiPickerPosition
}
export type {
	EmojiPickerProps,
}
export default EmojiPicker