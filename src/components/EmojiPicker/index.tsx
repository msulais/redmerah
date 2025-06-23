import { TransitionGroup } from 'solid-transition-group'
import { createMemo, createSignal, createUniqueId, For, onCleanup, onMount, Show, splitProps, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import type { Emoji } from '@/types/emoji'
import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from '@/constants/emoji'
import { setAttrIfExist } from '@/utils/attributes'
import { AnimationEffectTiming } from '@/enums/animation'
import { AppCSSColors } from '@/enums/app-data'
import { safeNumber } from '@/utils/number'
import { GlobalElementIds } from '@/enums/ids'
import { ICON_ANIMAL_CAT, ICON_DISMISS, ICON_DIVERSITY, ICON_EMOJI, ICON_FLAG, ICON_FOOD, ICON_HISTORY, ICON_PERSON, ICON_RUNNING_PERSON, ICON_SYMBOLS, ICON_VEHICLE_CAR } from '@/constants/icons'
import { isAnimationAllowed } from '@/utils/animation'

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
	addRecents = 'custom:emojipickerlistener-addrecents',

	/** @param detail `HTMLElement` */
	getRecents = 'custom:emojipickerlistener-getrecents'
}

let LISTENER_REF: HTMLDivElement
let HAS_EMOJI_LISTENER: boolean = false
const ALL_EMOJI: Emoji[] = ([] as Emoji[])
	.concat(
		EMOJIS_SMILEY_AND_EMOTION,
		EMOJIS_PERSON_AND_BODY,
		EMOJIS_ANIMAL_AND_NATURE,
		EMOJIS_FOOD_AND_DRINK,
		EMOJIS_TRAVEL_AND_PLACES,
		EMOJIS_ACTIVITIES,
		EMOJIS_OBJECT,
		EMOJIS_SYMBOLS,
		EMOJIS_FLAGS
	)
	.sort((a, b) => a[1].localeCompare(b[1]))
	.map(emoji => [...emoji])

function initEmojiPickerListener(): void {
	if (HAS_EMOJI_LISTENER) return;
	HAS_EMOJI_LISTENER = true

	const body = document.body
	let recents: Emoji[] = []

	function createListenerElement(): void {
		const div = document.createElement('div')
		div.style.setProperty('display', 'contents')
		div.id = GlobalElementIds.emojiPickerListener
		body.appendChild(div)

		LISTENER_REF = div
	}

	function addRecentEmoji(ev: CustomEvent<Emoji>): void {
		const emoji = ev.detail
		const index = recents.findIndex(v => v[0] == emoji[0])
		if (index >= 0) recents.splice(index, 1)

		recents = [emoji, ...recents.slice(0, 41)]
	}

	function getRecentEmoji(ev: CustomEvent<HTMLElement>): void {
		const element = ev.detail
		element.dispatchEvent(new CustomEvent(
			EmojiPickerEvents.getrecentsemoji,
			{detail: {emojis: [...recents]}}
		))
	}

	function initEvents(): void {
		LISTENER_REF.addEventListener(
			EmojiPickerListenerEvents.addRecents as any,
			addRecentEmoji
		)

		LISTENER_REF.addEventListener(
			EmojiPickerListenerEvents.getRecents as any,
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
		const t = searchText()
			.trim()
			.replace(/ +/g, ' ')
			.replace(/[^\w- ]/g, '')
		return t.length == 0
			? null
			: new RegExp(t.split(' ').join('|'), 'gi')
	})
	let menuSearchRef: HTMLDivElement
	let timeId: number | NodeJS.Timeout | null = null

	function updateRecents(): void {
		LISTENER_REF.dispatchEvent(new CustomEvent(
			EmojiPickerListenerEvents.getRecents,
			{detail: props.element}
		))
	}

	function customOnGetRecentEmoji(ev: CustomEvent<{emojis: Emoji[]}>): void {
		setRecents(ev.detail.emojis)
	}

	function initEvents(): void {
		props.element.addEventListener(
			EmojiPickerEvents.getrecentsemoji as any,
			customOnGetRecentEmoji
		)

		onCleanup(() => {
			props.element.removeEventListener(
				EmojiPickerEvents.getrecentsemoji as any,
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
				color: selected()? `rgb(${AppCSSColors.accent})` : undefined
			}}
		/>)
	}

	const Emojis: VoidComponent<{category: EmojiCategory, emojis: Emoji[]}> = $props => {
		const [columnCount, setColumnCount] = createSignal<number>(0)
		let timeId: number | NodeJS.Timeout | null = null

		return (<div
			class='c-emoji-picker-emojis'
			data-c-hidden={setAttrIfExist($props.category != option())}>
			<Show when={$props.category == option() && props.isOpen}>
				<FocusableGroup2D
					c:columnCount={columnCount()}
					onFocusIn={(ev) => {
						if (timeId === null) setColumnCount(
							window
							.getComputedStyle(ev.currentTarget)
							.getPropertyValue("grid-template-columns")
							.trim()
							.split(" ")
							.length
						)
						else clearTimeout(timeId)

						timeId = setTimeout(() => timeId = null, 200)
					}}
					onClick={() => {
						const button = document.activeElement! as HTMLButtonElement
						if (button.tagName != 'BUTTON') return

						const dataIndex = button.dataset.index
						if (!dataIndex) return

						const index = safeNumber(Number.parseInt(dataIndex))
						const emoji = $props.emojis[index]
						LISTENER_REF.dispatchEvent(new CustomEvent(
							EmojiPickerListenerEvents.addRecents,
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
				let button = document.activeElement! as HTMLButtonElement
				const tagname = button.tagName
				if (tagname != 'BUTTON') return

				if (button.id == buttonCloseId) {
					props.onClose()
					return
				}

				const dataCategory = button.dataset.category
				if (!dataCategory) return

				setOption(dataCategory as EmojiCategory)
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
					const text = ev.currentTarget.value

					if (timeId != null) clearTimeout(timeId)
					timeId = setTimeout(() => {
						setSearchText(text)
					}, 1000)
				}}
				c:attrMenu={{
					ref: (r) => menuSearchRef = r
				}}
				c:result={<TransitionGroup
					onEnter={(el, done) => {
						if (isAnimationAllowed()){
							(el as HTMLElement).animate(
								[
									{ transform: 'translateX(-12px)', opacity: 0 },
									{ tranform: null, opacity: 1 }
								],
								{ duration: 200, easing: AnimationEffectTiming.spring }
							).finished.then(done)
							return
						}

						done()
					}}
					onExit={(el, done) => {
						if (isAnimationAllowed()) {
							(el as HTMLElement).animate(
								{ transform: 'translateX(-12px)', opacity: 0 },
								{ duration: 200, easing: AnimationEffectTiming.spring }
							).finished.then(done)
							return
						}

						done()
					}}>
					<For each={ALL_EMOJI}>{e => <Show when={getSearchRegex() != null && getSearchRegex()!.test(e[1])}>
						<SearchMenuItem onClick={() => {
							LISTENER_REF.dispatchEvent(new CustomEvent(
								EmojiPickerListenerEvents.addRecents,
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