import { TransitionGroup } from 'solid-transition-group'
import { createMemo, createSignal, createUniqueId, For, onCleanup, onMount, Show, splitProps, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import type { Emoji } from '@/types/emoji'
import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from '@/constants/emoji'
import { attrSetIfExist } from '@/utils/attributes'
import { eventListenerAdd, eventCurrentTarget, eventListenerRemove } from '@/utils/event'
import { timeTimerClear, timeTimerSet } from '@/utils/time'
import { AnimationEffectTiming } from '@/enums/animation'
import { stringLength, stringLocaleCompare, stringReplace, stringSplit, stringTrim } from '@/utils/string'
import { arrayConcat, arrayFindIndex, arrayJoin, arrayLength, arrayMap, arraySlice, arraySort, arraySplice } from '@/utils/array'
import { elementAnimate, elementAppendChild, elementCreate, elementDataset, elementDispatchEvent, elementId, elementIdSet, elementStyleSet, elementStyle, elementTagName } from '@/utils/element'
import { regexTest } from '@/utils/regex'
import { promiseDone } from '@/utils/object'
import { AppColors } from '@/enums/colors'
import { documentActive, documentBody } from '@/utils/document'
import { numberParse, numberSafe } from '@/utils/number'
import { ElementIds } from '@/enums/ids'
import { ICON_ANIMAL_CAT, ICON_DISMISS, ICON_DIVERSITY, ICON_EMOJI, ICON_FLAG, ICON_FOOD, ICON_HISTORY, ICON_PERSON, ICON_RUNNING_PERSON, ICON_SYMBOLS, ICON_VEHICLE_CAR } from '@/constants/icons'
import { animationIsOn } from '@/utils/animation'

import Divider from '@/components/Divider'
import Tooltip from '@/components/Tooltip'
import { ButtonVariant, IconButton, SquareButton } from '@/components/Button'
import { closeSearchTextFieldMenu, SearchMenuItem, SearchTextField } from '@/components/TextField'
import { Modal, type ModalProps, ModalPosition as EmojiPickerPosition, closeModal, focusModal, openModal, repositionModal, isModalOpen } from '@/components/Modal'
import { closePopover, isPopoverOpen, openPopover, Popover, repositionPopover, type PopoverProps } from '../Popover'
import EmojiC from '@/components/Emoji'
import FocusableGroup, { FocusableGroup2D } from '@/components/FocusableGroup'
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
const ALL_EMOJI: Emoji[] = arraySort(
	arrayMap(
		arrayConcat(
			([] as Emoji[]),
			EMOJIS_SMILEY_AND_EMOTION,
			EMOJIS_PERSON_AND_BODY,
			EMOJIS_ANIMAL_AND_NATURE,
			EMOJIS_FOOD_AND_DRINK,
			EMOJIS_TRAVEL_AND_PLACES,
			EMOJIS_ACTIVITIES,
			EMOJIS_OBJECT,
			EMOJIS_SYMBOLS,
			EMOJIS_FLAGS
		),
		emoji => [...emoji] // copy
	),
	(a, b) => stringLocaleCompare(a[1], b[1])
)

function initEmojiPickerListener(): void {
	if (HAS_EMOJI_LISTENER) return;
	HAS_EMOJI_LISTENER = true

	const body = documentBody()
	let recents: Emoji[] = []

	function createListenerElement(): void {
		const div = elementCreate('div')
		elementStyleSet(div, 'display', 'contents')
		elementIdSet(div, ElementIds.emojiPickerListener)
		elementAppendChild(body, div)

		LISTENER_REF = div
	}

	function addRecentEmoji(ev: CustomEvent<Emoji>): void {
		const emoji = ev.detail
		const index = arrayFindIndex(recents, v => v[0] == emoji[0])
		if (index >= 0) arraySplice(recents, index, 1)

		recents = [emoji, ...arraySlice(recents, 0, 41)]
	}

	function getRecentEmoji(ev: CustomEvent<HTMLElement>): void {
		const element = ev.detail
		elementDispatchEvent(element, new CustomEvent(
			EmojiPickerEvents.getrecentsemoji,
			{detail: {emojis: [...recents]}}
		))
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent<Emoji>>(
			LISTENER_REF,
			EmojiPickerListenerEvents.add_recents,
			addRecentEmoji
		)

		eventListenerAdd<CustomEvent<HTMLElement>>(
			LISTENER_REF,
			EmojiPickerListenerEvents.get_recents,
			getRecentEmoji
		)
	}

	createListenerElement()
	initEvents()
}

const EmojiPickerBody: ParentComponent<{
	isOpen: boolean
	multiple?: boolean
	useCloseButton?: boolean
	tooltipClose?: string
	element: HTMLElement
	onSelectEmoji?(emoji: string, name: string): unknown
	onClose(): unknown
}> = props => {
	const buttonCloseId = createUniqueId()
	const [option, setOption] = createSignal<EmojiCategory>(EmojiCategory.recents)
	const [recents, setRecents] = createSignal<Emoji[]>([])
	const [searchText, setSearchText] = createSignal<string>('')
	const getSearchRegex = createMemo<RegExp | null>(() => {
		let t = searchText()
		t = stringTrim(t)
		t = stringReplace(t, / +/g, ' ')
		t = stringReplace(t, /[^\w- ]/g, '')
		return stringLength(t) == 0
			? null
			: new RegExp(arrayJoin(stringSplit(t, ' '), '|'), 'gi')
	})
	let menuSearchRef: HTMLDivElement
	let timeId: number | null = null

	function updateRecents(): void {
		elementDispatchEvent(LISTENER_REF, new CustomEvent(
			EmojiPickerListenerEvents.get_recents,
			{detail: props.element}
		))
	}

	function customOnGetRecentEmoji(ev: CustomEvent<{emojis: Emoji[]}>): void {
		setRecents(ev.detail.emojis)
	}

	function initEvents(): void {
		eventListenerAdd<CustomEvent<{emojis: Emoji[]}>>(
			props.element,
			EmojiPickerEvents.getrecentsemoji,
			customOnGetRecentEmoji
		)

		onCleanup(() => {
			eventListenerRemove<CustomEvent<{emojis: Emoji[]}>>(
				props.element,
				EmojiPickerEvents.getrecentsemoji,
				customOnGetRecentEmoji
			)
		})
	}

	onMount(() => {
		initEmojiPickerListener()
		initEvents()
	})

	const Tab: VoidComponent<{category: EmojiCategory; iconCode: number}> = ($props) => {
		const category = createMemo(() => $props.category)
		const selected = createMemo(() => option() == category())

		return (<IconButton
			data-tooltip={category()}
			data-category={category()}
			c:code={$props.iconCode}
			c:selected={selected()}
			c:filled={selected()}
			c:variant={selected()? ButtonVariant.tonal : undefined}
			style={{
				color: selected()? `rgb(${AppColors.accent})` : undefined
			}}
		/>)
	}

	const Emojis: VoidComponent<{category: EmojiCategory, emojis: Emoji[]}> = $props => {
		const [columnCount, setColumnCount] = createSignal<number>(0)
		let timeId: number | null = null

		return (<div
			class='c-emoji-picker-emojis'
			data-c-hidden={attrSetIfExist($props.category != option())}>
			<Show when={$props.category == option() && props.isOpen}>
				<FocusableGroup2D
					c:columnCount={columnCount()}
					onFocusIn={(ev) => {
						if (timeId === null) setColumnCount(arrayLength(stringSplit(
							stringTrim(elementStyle(eventCurrentTarget(ev), "grid-template-columns")),
							" "
						)))
						else timeTimerClear(timeId)

						timeId = timeTimerSet(() => timeId = null, 200)
					}}
					onClick={() => {
						const button = documentActive()!
						if (elementTagName(button) != 'BUTTON') return

						const dataset_index = elementDataset(button, 'index')
						if (!dataset_index) return

						const index = numberSafe(numberParse(dataset_index, true))
						const emoji = $props.emojis[index]
						elementDispatchEvent(LISTENER_REF, new CustomEvent(
							EmojiPickerListenerEvents.add_recents,
							{detail: [...emoji] satisfies Emoji}
						))
						updateRecents()
						if (!props.multiple) props.onClose()

						props.onSelectEmoji?.(emoji[0], emoji[1])
					}}>
					<h3>{$props.category}</h3>
					<For each={$props.emojis}>{(e, i) =>
						<SquareButton
							data-index={i()}
							data-tooltip={e[1]}>
							{e[0]}
						</SquareButton>
					}</For>
				</FocusableGroup2D>
			</Show>
		</div>)
	}

	return (<>
		<FocusableGroup
			class="c-emoji-picker-tabs"
			c:arrowOptions={{
				left: 'prev', right: 'next'
			}}
			onClick={() => {
				let button = documentActive()!
				const tagname = elementTagName(button)
				if (tagname != 'BUTTON') return

				if (elementId(button) == buttonCloseId) {
					props.onClose()
					return
				}

				const dataset_category = elementDataset(button, 'category')
				if (!dataset_category) return

				setOption(dataset_category as EmojiCategory)
			}}>
			<Tooltip>
				<Show when={props.useCloseButton}>
					<IconButton
						id={buttonCloseId}
						data-tooltip={props.tooltipClose ?? 'Close'}
						c:code={ICON_DISMISS}
						c:variant={ButtonVariant.filled}
					/>
				</Show>
				<Tab iconCode={ICON_HISTORY} category={EmojiCategory.recents}/>
				<Tab iconCode={ICON_EMOJI} category={EmojiCategory.smiley_and_emotion}/>
				<Tab iconCode={ICON_PERSON} category={EmojiCategory.person_and_body}/>
				<Tab iconCode={ICON_ANIMAL_CAT} category={EmojiCategory.animal_and_nature}/>
				<Tab iconCode={ICON_FOOD} category={EmojiCategory.food_and_drink}/>
				<Tab iconCode={ICON_VEHICLE_CAR} category={EmojiCategory.travel_and_places}/>
				<Tab iconCode={ICON_RUNNING_PERSON} category={EmojiCategory.activities}/>
				<Tab iconCode={ICON_DIVERSITY} category={EmojiCategory.objects}/>
				<Tab iconCode={ICON_SYMBOLS} category={EmojiCategory.symbols}/>
				<Tab iconCode={ICON_FLAG} category={EmojiCategory.flags}/>
			</Tooltip>
		</FocusableGroup>
		<div class='c-emoji-picker-search'>
			<SearchTextField
				placeholder='Search emoji'
				onInput={(ev) => {
					const text = eventCurrentTarget(ev).value

					if (timeId != null) timeTimerClear(timeId)
					timeId = timeTimerSet(() => {
						setSearchText(text)
					}, 1000)
				}}
				c:attrMenu={{
					ref: (r) => menuSearchRef = r
				}}
				c:result={<TransitionGroup
					onEnter={(el, done) => {
						if (animationIsOn()){
							promiseDone(elementAnimate(
								el as HTMLElement,
								[
									{ transform: 'translateX(-12px)', opacity: 0 },
									{ tranform: null, opacity: 1 }
								],
								{ duration: 200, easing: AnimationEffectTiming.spring }
							).finished, done)
							return
						}

						done()
					}}
					onExit={(el, done) => {
						if (animationIsOn()) {
							promiseDone(elementAnimate(
								el as HTMLElement,
								{ transform: 'translateX(-12px)', opacity: 0 },
								{ duration: 200, easing: AnimationEffectTiming.spring }
							).finished, done)
							return
						}

						done()
					}}>
					<For each={ALL_EMOJI}>{e => <Show when={getSearchRegex() != null && regexTest(getSearchRegex()!, e[1])}>
						<SearchMenuItem onClick={() => {
							elementDispatchEvent(LISTENER_REF, new CustomEvent(
								EmojiPickerListenerEvents.add_recents,
								{detail: [...e]}
							))
							updateRecents()
							if (!props.multiple) props.onClose()
							closeSearchTextFieldMenu(menuSearchRef)
							props.onSelectEmoji?.(e[0], e[1])
						}}>
							<EmojiC c:emoji={e[0]}/>{e[1]}
						</SearchMenuItem>
					</Show>}</For>
				</TransitionGroup>}
			/>
		</div>
		{props.children}
		<Divider />
		<Tooltip>
			<Emojis emojis={recents()}                 category={EmojiCategory.recents}/>
			<Emojis emojis={EMOJIS_SMILEY_AND_EMOTION} category={EmojiCategory.smiley_and_emotion}/>
			<Emojis emojis={EMOJIS_PERSON_AND_BODY}    category={EmojiCategory.person_and_body}/>
			<Emojis emojis={EMOJIS_ANIMAL_AND_NATURE}  category={EmojiCategory.animal_and_nature}/>
			<Emojis emojis={EMOJIS_FOOD_AND_DRINK}     category={EmojiCategory.food_and_drink}/>
			<Emojis emojis={EMOJIS_TRAVEL_AND_PLACES}  category={EmojiCategory.travel_and_places}/>
			<Emojis emojis={EMOJIS_ACTIVITIES}         category={EmojiCategory.activities}/>
			<Emojis emojis={EMOJIS_OBJECT}             category={EmojiCategory.objects}/>
			<Emojis emojis={EMOJIS_SYMBOLS}            category={EmojiCategory.symbols}/>
			<Emojis emojis={EMOJIS_FLAGS}              category={EmojiCategory.flags}/>
		</Tooltip>
	</>)
}

type EmojiPickerProps = ModalProps & {
	'c:multiple'?: boolean
	'c:useCloseButton'?: boolean
	'c:tooltipClose'?: string
	'c:onSelectEmoji'?(emoji: string, name: string): unknown
}
const EmojiPicker: ParentComponent<EmojiPickerProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c:onSelectEmoji', 'ref', 'c:multiple',
		'c:useCloseButton', 'c:tooltipClose', 'children',
		'c:onToggleOpen'
	])
	const [emojiPickerRef, setEmojiPickerRef] = createSignal<HTMLElement | null>(null)
	const [isOpen, setIsOpen] = createSignal<boolean>(false)

	return (<Modal
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		c:onToggleOpen={isOpen => {
			setIsOpen(isOpen)
			props['c:onToggleOpen']?.(isOpen)
		}}
		ref={mergeRefs(props.ref, r => setEmojiPickerRef(r))}
		{...other}>
		<Show when={emojiPickerRef() != null}>
			<EmojiPickerBody
				isOpen={isOpen()}
				element={emojiPickerRef() as HTMLElement}
				onClose={() => closeModal(emojiPickerRef()! as HTMLDialogElement)}
				multiple={props['c:multiple']}
				onSelectEmoji={props['c:onSelectEmoji']}
				tooltipClose={props['c:tooltipClose']}
				useCloseButton={props['c:useCloseButton']}>
				{props.children}
			</EmojiPickerBody>
		</Show>
	</Modal>)
}

type PopoverEmojiPickerProps = PopoverProps & {
	'c:multiple'?: boolean
	'c:useCloseButton'?: boolean
	'c:tooltipClose'?: string
	'c:onSelectEmoji'?(emoji: string, name: string): unknown
}
const PopoverEmojiPicker: ParentComponent<PopoverEmojiPickerProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c:onSelectEmoji', 'ref', 'c:multiple',
		'c:useCloseButton', 'c:tooltipClose', 'children',
		'c:onToggleOpen'
	])
	const [emojiPickerRef, setEmojiPickerRef] = createSignal<HTMLElement | null>(null)
	const [isOpen, setIsOpen] = createSignal<boolean>(false)

	return (<Popover
		classList={{
			'c-emoji-picker': true,
			...props.classList
		}}
		c:onToggleOpen={isOpen => {
			setIsOpen(isOpen)
			props['c:onToggleOpen']?.(isOpen)
		}}
		ref={mergeRefs(props.ref, r => setEmojiPickerRef(r))}
		{...other}>
		<Show when={emojiPickerRef() != null}>
			<EmojiPickerBody
				isOpen={isOpen()}
				element={emojiPickerRef() as HTMLElement}
				onClose={() => closeModal(emojiPickerRef()! as HTMLDialogElement)}
				multiple={props['c:multiple']}
				onSelectEmoji={props['c:onSelectEmoji']}
				tooltipClose={props['c:tooltipClose']}
				useCloseButton={props['c:useCloseButton']}>
				{props.children}
			</EmojiPickerBody>
		</Show>
	</Popover>)
}

export {
	EmojiPicker,
	PopoverEmojiPicker,
	isModalOpen as isEmojiPickerOpen,
	openModal as openEmojiPicker,
	closeModal as closeEmojiPicker,
	repositionModal as repositionEmojiPicker,
	focusModal as focusEmojiPicker,
	isPopoverOpen as isPopoverEmojiPickerOpen,
	openPopover as openPopoverEmojiPicker,
	closePopover as closePopoverEmojiPicker,
	repositionPopover as repositionPopoverEmojiPicker,
	EmojiPickerPosition
}
export type {
	EmojiPickerProps,
	PopoverEmojiPickerProps
}
export default EmojiPicker