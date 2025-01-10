import { TransitionGroup } from 'solid-transition-group'
import { createMemo, createSignal, createUniqueId, For, onCleanup, onMount, Show, splitProps, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import type { Emoji } from '@/types/emoji'
import { activities_emojis, animal_and_nature_emojis, flags_emojis, food_and_drink_emojis, object_emojis, person_and_body_emojis, smiley_and_emotion_emojis, symbols_emojis, travel_and_places_emojis } from '@/constants/emoji'
import { attr_set_if_exist } from '@/utils/attributes'
import { event_add_listener, event_current_target, event_prevent_default, event_remove_listener, event_target } from '@/utils/event'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { AnimationEffectTiming } from '@/enums/animation'
import { string_length, string_locale_compare, string_replace, string_split, string_trim } from '@/utils/string'
import { array_concat, array_find_index, array_join, array_length, array_map, array_slice, array_sort, array_splice } from '@/utils/array'
import { element_animate, element_append_child, element_children, element_create, element_dataset, element_dispatch_event, element_focus, element_id, element_next_sibling, element_previous_sibling, element_set_id, element_set_style, element_set_tabindex, element_style, element_tagname } from '@/utils/element'
import { regex_test } from '@/utils/regex'
import { promise_done } from '@/utils/object'
import { AppColors } from '@/enums/colors'
import { document_active, document_body } from '@/utils/document'
import { number_parse, number_safe } from '@/utils/number'
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from '@/constants/key_code'
import { ElementIds } from '@/enums/ids'

import Divider from '@/components/Divider'
import Tooltip from '@/components/Tooltip'
import EmojiC from '@/components/Emoji'
import { ButtonVariant, EmojiButton, IconButton } from '@/components/Button'
import { close_searchtextfieldmenu, SearchMenuItem, SearchTextField } from '@/components/TextField'
import { Modal, type ModalProps, ModalPosition as EmojiPickerPosition, close_modal, focus_modal, open_modal, reposition_modal, is_modal_open } from '@/components/Modal'
import { close_popover, is_popover_open, open_popover, Popover, reposition_popover, type PopoverProps } from '../Popover'
import FocusableGroup from '@/components/FocusableGroup'
import './index.scss'

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
	getrecentsemoji = 'custom:emojipicker-getrecentsemoji'
}

enum EmojiPickerListenerEvents {
	/** @param detail `Emoji` */
	add_recents = 'custom:emojipickerlistener-addrecents',

	/** @param detail `HTMLElement` */
	get_recents = 'custom:emojipickerlistener-getrecents'
}

let LISTENER_REF: HTMLDivElement
let HAS_EMOJI_LISTENER: boolean = false
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

function init_emoji_picker(): void {
	if (HAS_EMOJI_LISTENER) return;
	HAS_EMOJI_LISTENER = true

	const body = document_body()
	let recents: Emoji[] = []

	function create_listener_element(): void {
		const div = element_create('div')
		element_set_style(div, 'display', 'contents')
		element_set_id(div, ElementIds.emoji_picker_listener)
		element_append_child(body, div)

		LISTENER_REF = div
	}

	function add_recent_emoji(ev: CustomEvent<Emoji>): void {
		const emoji = ev.detail
		const index = array_find_index(recents, v => v[0] == emoji[0])
		if (index >= 0) array_splice(recents, index, 1)

		recents = [emoji, ...array_slice(recents, 0, 41)]
	}

	function get_recent_emoji(ev: CustomEvent<HTMLElement>): void {
		const element = ev.detail
		element_dispatch_event(element, new CustomEvent(
			EmojiPickerEvents.getrecentsemoji,
			{detail: {emojis: [...recents]}}
		))
	}

	function init_events(): void {
		event_add_listener<CustomEvent<Emoji>>(
			LISTENER_REF,
			EmojiPickerListenerEvents.add_recents,
			add_recent_emoji
		)

		event_add_listener<CustomEvent<HTMLElement>>(
			LISTENER_REF,
			EmojiPickerListenerEvents.get_recents,
			get_recent_emoji
		)
	}

	create_listener_element()
	init_events()
}

const EmojiPickerBody: ParentComponent<{
	is_open: boolean
	multiple?: boolean
	use_close_button?: boolean
	tooltip_close?: string
	element: HTMLElement
	on_select_emoji?(emoji: string, name: string): unknown
	on_close(): unknown
}> = props => {
	const button_close_id = createUniqueId()
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
	let menu_search_ref: HTMLDivElement
	let timeout_id: number | null = null

	function update_recents(): void {
		element_dispatch_event(LISTENER_REF, new CustomEvent(
			EmojiPickerListenerEvents.get_recents,
			{detail: props.element}
		))
	}

	function custom_on_get_recent_emoji(ev: CustomEvent<{emojis: Emoji[]}>): void {
		set_recents(ev.detail.emojis)
	}

	function init_events(): void {
		event_add_listener<CustomEvent<{emojis: Emoji[]}>>(
			props.element,
			EmojiPickerEvents.getrecentsemoji,
			custom_on_get_recent_emoji
		)

		onCleanup(() => {
			event_remove_listener<CustomEvent<{emojis: Emoji[]}>>(
				props.element,
				EmojiPickerEvents.getrecentsemoji,
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
		const selected = createMemo(() => option() == category())

		return (<IconButton
			data-tooltip={category()}
			data-category={category()}
			code={$props.icon_code}
			selected={selected()}
			filled={selected()}
			variant={selected()? ButtonVariant.tonal : undefined}
			style={{
				color: selected()? `rgb(${AppColors.accent})` : undefined
			}}
		/>)
	}

	const Emojis: VoidComponent<{category: EmojiCategory, emojis: Emoji[]}> = $props => {
		let timeout_id: number | null = null
		let grid_column_count = 0

		return (<div
			class='c-emoji-picker-emojis'
			data-c-hidden={attr_set_if_exist($props.category != option())}>
			<Show when={$props.category == option() && props.is_open}>
				<FocusableGroup
					custom_arrow_focus
					on_before_set_tabindex={el => element_tagname(el) != 'H3'}
					on_before_change_focus={el => element_tagname(el) != 'H3'}
					onKeyDown={(ev) => {
						const code = ev.code
						if (
							code != KEY_ARROW_UP
							&& code != KEY_ARROW_DOWN
							&& code != KEY_ARROW_LEFT
							&& code != KEY_ARROW_RIGHT
						) return;

						const button = event_target(ev) as HTMLButtonElement
						const index = number_safe(number_parse(element_dataset(button, 'index')!, true)) + 1
						const children = element_children<HTMLButtonElement>(event_current_target(ev))
						let target: HTMLElement | null = null

						// don't update every key press
						if (timeout_id == null) grid_column_count = array_length(string_split(
							string_trim(element_style(event_current_target(ev), "grid-template-columns")),
							" "
						))
						else timeout_clear(timeout_id)

						timeout_id = timeout_set(() => timeout_id = null, 200)
						if (code == KEY_ARROW_UP) target = children[index - grid_column_count]
						else if (code == KEY_ARROW_DOWN) target = children[index + grid_column_count]
						else if (code == KEY_ARROW_RIGHT) target = element_next_sibling(button)
						else if (code == KEY_ARROW_LEFT) target = element_previous_sibling(button)

						if (!target || (target as HTMLButtonElement).disabled || element_tagname(target) != 'BUTTON') return
						event_prevent_default(ev) // disable scroll
						element_set_tabindex(button, -1)
						element_set_tabindex(target, 0)
						element_focus(target)
					}}
					onClick={() => {
						const button = document_active()!
						if (element_tagname(button) != 'BUTTON') return

						const dataset_index = element_dataset(button, 'index')
						if (!dataset_index) return

						const index = number_safe(number_parse(dataset_index, true))
						const emoji = $props.emojis[index]
						element_dispatch_event(LISTENER_REF, new CustomEvent(
							EmojiPickerListenerEvents.add_recents,
							{detail: [...emoji] satisfies Emoji}
						))
						update_recents()
						if (!props.multiple) props.on_close()

						props.on_select_emoji?.(emoji[0], emoji[1])
					}}>
					<h3>{$props.category}</h3>
					<For each={$props.emojis}>{(e, i) =>
						<EmojiButton
							data-index={i()}
							data-tooltip={e[1]}
							emoji={e[0]}
						/>
					}</For>
				</FocusableGroup>
			</Show>
		</div>)
	}

	return (<>
		<FocusableGroup
			class="c-emoji-picker-tabs"
			arrow_options={{
				left: 'prev', right: 'next'
			}}
			onClick={() => {
				let button = document_active()!
				const tagname = element_tagname(button)
				if (tagname != 'BUTTON') return

				if (element_id(button) == button_close_id) {
					props.on_close()
					return
				}

				const dataset_category = element_dataset(button, 'category')
				if (!dataset_category) return

				set_option(dataset_category as EmojiCategory)
			}}>
			<Tooltip>
				<Show when={props.use_close_button}>
					<IconButton
						id={button_close_id}
						data-tooltip={props.tooltip_close ?? 'Close'}
						code={0xE5E9}
						variant={ButtonVariant.filled}
					/>
				</Show>
				<Tab icon_code={0xE8DE} category={EmojiCategory.recents}/>
				<Tab icon_code={0xE745} category={EmojiCategory.smiley_and_emotion}/>
				<Tab icon_code={0xEBF8} category={EmojiCategory.person_and_body}/>
				<Tab icon_code={0xE04F} category={EmojiCategory.animal_and_nature}/>
				<Tab icon_code={0xE80B} category={EmojiCategory.food_and_drink}/>
				<Tab icon_code={0xF227} category={EmojiCategory.travel_and_places}/>
				<Tab icon_code={0xEC3C} category={EmojiCategory.activities}/>
				<Tab icon_code={0xE5F1} category={EmojiCategory.objects}/>
				<Tab icon_code={0xEF77} category={EmojiCategory.symbols}/>
				<Tab icon_code={0xE7AB} category={EmojiCategory.flags}/>
			</Tooltip>
		</FocusableGroup>
		<div class='c-emoji-picker-search'>
			<SearchTextField
				placeholder='Search emoji'
				onInput={(ev) => {
					const text = event_current_target(ev).value

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
							{ duration: 200, easing: AnimationEffectTiming.spring }
						).finished, done)
					}}
					onExit={(el, done) => {
						promise_done(element_animate(
							el as HTMLElement,
							{ transform: 'translateX(-12px)', opacity: 0 },
							{ duration: 200, easing: AnimationEffectTiming.spring }
						).finished, done)
					}}>
					<For each={ALL_EMOJI}>{e => <Show when={get_search_regex() != null && regex_test(get_search_regex()!, e[1])}>
						<SearchMenuItem onClick={() => {
							element_dispatch_event(LISTENER_REF, new CustomEvent(
								EmojiPickerListenerEvents.add_recents,
								{detail: [...e]}
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
		<Tooltip>
			<Emojis emojis={recents()}                 category={EmojiCategory.recents}/>
			<Emojis emojis={smiley_and_emotion_emojis} category={EmojiCategory.smiley_and_emotion}/>
			<Emojis emojis={person_and_body_emojis}    category={EmojiCategory.person_and_body}/>
			<Emojis emojis={animal_and_nature_emojis}  category={EmojiCategory.animal_and_nature}/>
			<Emojis emojis={food_and_drink_emojis}     category={EmojiCategory.food_and_drink}/>
			<Emojis emojis={travel_and_places_emojis}  category={EmojiCategory.travel_and_places}/>
			<Emojis emojis={activities_emojis}         category={EmojiCategory.activities}/>
			<Emojis emojis={object_emojis}             category={EmojiCategory.objects}/>
			<Emojis emojis={symbols_emojis}            category={EmojiCategory.symbols}/>
			<Emojis emojis={flags_emojis}              category={EmojiCategory.flags}/>
		</Tooltip>
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
		'use_close_button', 'tooltip_close', 'children',
		'on_toggle_open'
	])
	const [emojipicker_ref, set_emojipicker_ref] = createSignal<HTMLElement | null>(null)
	const [is_open, set_is_open] = createSignal<boolean>(false)

	return (<Modal
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		on_toggle_open={is_open => {
			set_is_open(is_open)
			props.on_toggle_open?.(is_open)
		}}
		ref={mergeRefs(props.ref, r => set_emojipicker_ref(r))}
		{...other}>
		<Show when={emojipicker_ref() != null}>
			<EmojiPickerBody
				is_open={is_open()}
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
		'use_close_button', 'tooltip_close', 'children',
		'on_toggle_open'
	])
	const [emojipicker_ref, set_emojipicker_ref] = createSignal<HTMLElement | null>(null)
	const [is_open, set_is_open] = createSignal<boolean>(false)

	return (<Popover
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		on_toggle_open={is_open => {
			set_is_open(is_open)
			props.on_toggle_open?.(is_open)
		}}
		ref={mergeRefs(props.ref, r => set_emojipicker_ref(r))}
		{...other}>
		<Show when={emojipicker_ref() != null}>
			<EmojiPickerBody
				is_open={is_open()}
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