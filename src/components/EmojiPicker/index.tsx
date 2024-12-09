import { TransitionGroup } from 'solid-transition-group'
import { createMemo, createSignal, For, onCleanup, onMount, Show, splitProps, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import type { Emoji } from '@/types/emoji'
import { activities_emojis, animal_and_nature_emojis, flags_emojis, food_and_drink_emojis, object_emojis, person_and_body_emojis, smiley_and_emotion_emojis, symbols_emojis, travel_and_places_emojis } from '@/constants/emoji'
import { attr_has, attr_set_if_exist,attr_set } from '@/utils/attributes'
import { BodyAttributes } from '@/enums/attributes'
import { event_add_listener, event_remove_listener } from '@/utils/event'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { BodyEvents } from '@/enums/events'
import { AnimationEffectTiming } from '@/enums/animation'
import { string_length, string_locale_compare, string_replace, string_split, string_trim } from '@/utils/string'
import { array_concat, array_find_index, array_join, array_map, array_slice, array_sort, array_splice } from '@/utils/array'
import { element_animate, element_dispatch_event } from '@/utils/element'
import { regex_test } from '@/utils/regex'
import { promise_done } from '@/utils/object'

import Divider from '@/components/Divider'
import TextTooltip from '@/components/Tooltip'
import EmojiC from '@/components/Emoji'
import { ButtonVariant, EmojiButton, IconButton } from '@/components/Button'
import { close_searchtextfieldmenu, SearchMenuItem, SearchTextField } from '@/components/TextField'
import { Modal, type ModalProps, ModalPosition as EmojiPickerPosition, close_modal, focus_modal, open_modal, reposition_modal, is_modal_open } from '@/components/Modal'
import './index.scss'
import { close_popover, is_popover_open, open_popover, Popover, reposition_popover, type PopoverProps } from '../Popover'

const ALL_EMOJI: Emoji[] = array_sort(
	array_map(
		array_concat(
			([] as Emoji[]),
			smiley_and_emotion_emojis,
			person_and_body_emojis,
			animal_and_nature_emojis,
			food_and_drink_emojis,
			travel_and_places_emojis,
			activities_emojis,
			object_emojis,
			symbols_emojis,
			flags_emojis
		),
		emoji => [...emoji] // copy
	),
	(a, b) => string_locale_compare(a[1], b[1])
)

enum EmojiCategory {
	smiley_and_emotion = 'Smiley & emotion',
	person_and_body = 'Person & body',
	animal_and_nature = 'Animal & nature',
	food_and_drink = 'Food & drink',
	travel_and_places = 'Travel & places',
	activities = 'Activities',
	objects = 'Objects',
	symbols = 'Symbols',
	flags = 'Flags',
	recents = 'Recents'
}

enum EmojiPickerEvents {
	/** @param emojis `Emoji[]` */
	get_recent_emoji = 'on-get-recent-emoji'
}

function init_emoji_picker(): void {
	const body = document.body

	if (attr_has(body, BodyAttributes.emoji_listener)) return;
	attr_set(body, BodyAttributes.emoji_listener)

	let recents: Emoji[] = []

	event_add_listener<CustomEvent<{emoji: Emoji}>>(body, BodyEvents.add_recent_emoji, ev => {
		const emoji = ev.detail.emoji
		const index = array_find_index(recents, v => v[0] == emoji[0])
		if (index >= 0) array_splice(recents, index, 1)

		recents = [emoji, ...array_slice(recents, 0, 41)]
	})

	event_add_listener<CustomEvent<{element: HTMLElement}>>(body, BodyEvents.get_recent_emoji, ev => {
		const element = ev.detail.element
		element_dispatch_event(element, new CustomEvent(
			EmojiPickerEvents.get_recent_emoji,
			{detail: {emojis: [...recents]}}
		))
	})
}

const EmojiPickerBody: ParentComponent<{
	multiple?: boolean
	use_close_button?: boolean
	tooltip_close?: string
	element: HTMLElement
	on_select_emoji?(emoji: string, name: string): unknown
	on_close(): unknown
}> = props => {
	const [option, set_option] = createSignal<EmojiCategory>(EmojiCategory.recents)
	const [recents, set_recents] = createSignal<Emoji[]>([])
	const [search_text, set_search_text] = createSignal<string>('')
	const get_search_regex = createMemo<RegExp | null>(() => {
		let t = search_text()
		t = string_trim(t)
		t = string_replace(t, / +/g, ' ')
		t = string_replace(t, /[^\w- ]/g, '')
		return string_length(t) == 0
			? null
			: new RegExp(array_join(string_split(t, ' '), '|'), 'gi')
	})
	const body = document.body
	let menu_search_ref: HTMLDivElement
	let timeout_id: number | null = null

	function update_recents(): void {
		element_dispatch_event(body, new CustomEvent(
			BodyEvents.get_recent_emoji,
			{detail: {element: props.element}}
		))
	}

	function custom_on_get_recent_emoji(ev: CustomEvent<{emojis: Emoji[]}>): void {
		set_recents(ev.detail.emojis)
	}

	function init_events(): void {
		event_add_listener<CustomEvent<{emojis: Emoji[]}>>(
			props.element,
			EmojiPickerEvents.get_recent_emoji,
			custom_on_get_recent_emoji
		)

		onCleanup(() => {
			event_remove_listener<CustomEvent<{emojis: Emoji[]}>>(
				props.element,
				EmojiPickerEvents.get_recent_emoji,
				custom_on_get_recent_emoji
			)
		})
	}

	onMount(() => {
		init_emoji_picker()
		init_events()
	})

	const Tab: VoidComponent<{category: EmojiCategory; icon_code: number}> = ($props) => {
		const category = createMemo(() => $props.category)

		return (<TextTooltip
			text={category()}>
			<IconButton
				code={$props.icon_code}
				selected={option() == category()}
				variant={option() == category()? ButtonVariant.tonal : undefined}
				onClick={() => set_option(category())}
			/>
		</TextTooltip>)
	}

	const Emojis: VoidComponent<{category: EmojiCategory, emojis: Emoji[]}> = $props => (<div
		class='c-emoji-picker-emojis'
		data-c-hidden={attr_set_if_exist($props.category != option())}>
		<div>
			<h3>{$props.category}</h3>
			<For each={$props.emojis}>{e =>
				<TextTooltip text={e[1]}>
					<EmojiButton emoji={e[0]} onClick={() => {
						element_dispatch_event(body, new CustomEvent(
							BodyEvents.add_recent_emoji,
							{detail: {emoji: [...e]}}
						))
						update_recents()
						if (!props.multiple) props.on_close()

						props.on_select_emoji?.(e[0], e[1])
					}}/>
				</TextTooltip>
			}</For>
		</div>
	</div>)

	return (<>
		<div class="c-emoji-picker-tabs">
			<Tab icon_code={0xE8DE} category={EmojiCategory.recents}/>
			<Tab icon_code={0xE745} category={EmojiCategory.smiley_and_emotion}/>
			<Tab icon_code={0xEBF8} category={EmojiCategory.person_and_body}/>
			<Tab icon_code={0xE04F} category={EmojiCategory.animal_and_nature}/>
			<Tab icon_code={0xE80B} category={EmojiCategory.food_and_drink}/>
			<Tab icon_code={0xF227} category={EmojiCategory.travel_and_places}/>
			<TextTooltip text={props.tooltip_close ?? 'Close'}>
				<Show when={props.use_close_button}>
					<IconButton
						code={0xE5E9}
						variant={ButtonVariant.filled}
						onClick={() => props.on_close()}
					/>
				</Show>
			</TextTooltip>
			<Tab icon_code={0xEC3C} category={EmojiCategory.activities}/>
			<Tab icon_code={0xE5F1} category={EmojiCategory.objects}/>
			<Tab icon_code={0xEF77} category={EmojiCategory.symbols}/>
			<Tab icon_code={0xE7AB} category={EmojiCategory.flags}/>
		</div>
		<div class='c-emoji-picker-search'>
			<SearchTextField
				placeholder='Search emoji'
				onInput={(ev) => {
					const text = ev.currentTarget.value

					if (timeout_id != null) timeout_clear(timeout_id)
					timeout_id = timeout_set(() => {
						set_search_text(text)
					}, 1000)
				}}
				attr_menu={{
					ref: (r) => menu_search_ref = r
				}}
				result={<TransitionGroup
					onEnter={(el, done) => {
						promise_done(element_animate(
							el as HTMLElement,
							[
								{ transform: 'translateX(-12px)', opacity: 0 },
								{ tranform: null, opacity: 1 }
							],
							{ duration: 300, easing: AnimationEffectTiming.spring }
						).finished, done)
					}}
					onExit={(el, done) => {
						promise_done(element_animate(
							el as HTMLElement,
							{ transform: 'translateX(-12px)', opacity: 0 },
							{ duration: 300, easing: AnimationEffectTiming.spring }
						).finished, done)
					}}>
					<For each={ALL_EMOJI}>{e => <Show when={get_search_regex() != null && regex_test(get_search_regex()!, e[1])}>
						<SearchMenuItem onClick={() => {
							element_dispatch_event(body, new CustomEvent(
								BodyEvents.add_recent_emoji,
								{detail: {emoji: [...e]}}
							))
							update_recents()
							if (!props.multiple) props.on_close()
							close_searchtextfieldmenu(menu_search_ref)
							props.on_select_emoji?.(e[0], e[1])
						}}>
							<EmojiC emoji={e[0]}/>{e[1]}
						</SearchMenuItem>
					</Show>}</For>
				</TransitionGroup>}
			/>
		</div>
		{props.children}
		<Divider />
		<Emojis emojis={recents()} category={EmojiCategory.recents}/>
		<Emojis emojis={smiley_and_emotion_emojis} category={EmojiCategory.smiley_and_emotion}/>
		<Emojis emojis={person_and_body_emojis}    category={EmojiCategory.person_and_body}/>
		<Emojis emojis={animal_and_nature_emojis}  category={EmojiCategory.animal_and_nature}/>
		<Emojis emojis={food_and_drink_emojis}     category={EmojiCategory.food_and_drink}/>
		<Emojis emojis={travel_and_places_emojis}  category={EmojiCategory.travel_and_places}/>
		<Emojis emojis={activities_emojis}         category={EmojiCategory.activities}/>
		<Emojis emojis={object_emojis}             category={EmojiCategory.objects}/>
		<Emojis emojis={symbols_emojis}            category={EmojiCategory.symbols}/>
		<Emojis emojis={flags_emojis}              category={EmojiCategory.flags}/>
	</>)
}

type EmojiPickerProps = ModalProps & {
	multiple?: boolean
	use_close_button?: boolean
	tooltip_close?: string
	on_select_emoji?(emoji: string, name: string): unknown
}
const EmojiPicker: ParentComponent<EmojiPickerProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'on_select_emoji', 'ref', 'multiple',
		'use_close_button', 'tooltip_close', 'children'
	])
	const [emojipicker_ref, set_emojipicker_ref] = createSignal<HTMLElement | null>(null)

	return (<Modal
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		ref={mergeRefs(props.ref, r => set_emojipicker_ref(r))}
		{...other}>
		<Show when={emojipicker_ref() != null}>
			<EmojiPickerBody
				element={emojipicker_ref() as HTMLElement}
				on_close={() => close_modal(emojipicker_ref()! as HTMLDialogElement)}
				multiple={props.multiple}
				on_select_emoji={props.on_select_emoji}
				tooltip_close={props.tooltip_close}
				use_close_button={props.use_close_button}>
				{props.children}
			</EmojiPickerBody>
		</Show>
	</Modal>)
}

type PopoverEmojiPickerProps = PopoverProps & {
	multiple?: boolean
	use_close_button?: boolean
	tooltip_close?: string
	on_select_emoji?(emoji: string, name: string): unknown
}
const PopoverEmojiPicker: ParentComponent<PopoverEmojiPickerProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'on_select_emoji', 'ref', 'multiple',
		'use_close_button', 'tooltip_close', 'children'
	])
	const [emojipicker_ref, set_emojipicker_ref] = createSignal<HTMLElement | null>(null)

	return (<Popover
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		ref={mergeRefs(props.ref, r => set_emojipicker_ref(r))}
		{...other}>
		<Show when={emojipicker_ref() != null}>
			<EmojiPickerBody
				element={emojipicker_ref() as HTMLElement}
				on_close={() => close_modal(emojipicker_ref()! as HTMLDialogElement)}
				multiple={props.multiple}
				on_select_emoji={props.on_select_emoji}
				tooltip_close={props.tooltip_close}
				use_close_button={props.use_close_button}>
				{props.children}
			</EmojiPickerBody>
		</Show>
	</Popover>)
}

export {
	EmojiPicker,
	PopoverEmojiPicker,
	is_modal_open as is_emojipicker_open,
	open_modal as open_emojipicker,
	close_modal as close_emojipicker,
	reposition_modal as reposition_emojipicker,
	focus_modal as focus_emojipicker,
	is_popover_open as is_popoveremojipicker_open,
	open_popover as open_popoveremojipicker,
	close_popover as close_popoveremojipicker,
	reposition_popover as reposition_popoveremojipicker,
	EmojiPickerPosition
}
export type {
	EmojiPickerProps,
	PopoverEmojiPickerProps
}
export default EmojiPicker