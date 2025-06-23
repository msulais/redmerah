import { Transition } from "solid-transition-group"
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps, type ParentComponent, type VoidComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { localWeekdayNames, isDateOutRange_YMD, isDateEqual_YMD, localMonthNames, isDateOutRange_YM, isDateEqual_YM, isDateOutRange_Y, isDateEqual_Y, isDateInRange_YM } from "@/utils/datetime"
import { AnimationEffectTiming } from "@/enums/animation"
import { eventCall } from "@/utils/event"
import { isTargetValidElement } from "@/utils/element"
import { safeNumber } from "@/utils/number"
import { ICON_CALENDAR_DATE, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from "@/constants/icons"
import { isAnimationAllowed } from "@/utils/animation"

import Button, { ButtonVariant, IconButton, SquareButton } from "@/components/Button"
import { Modal, type ModalProps, ModalPosition as DatePickerPosition, closeModal, focusModal, openModal, repositionModal, isModalOpen } from "@/components/Modal"
import Divider from "@/components/Divider"
import Popover, { closePopover, isPopoverOpen, openPopover, repositionPopover, type PopoverProps } from "@/components/Popover"
import FocusableGroup, { FocusableGroup2D } from "@/components/FocusableGroup"
import './index.scss'

enum DatePickerOption {
	year,
	month,
	day
}

const DatePickerBody: ParentComponent<{
	closeSignal: boolean
	date: Date
	firstDate: Date
	lastDate: Date
	locales?: Intl.LocalesArgument
	onSelectDate?(value: Date): unknown
	onClose(): unknown
	onUpdate(): unknown
}> = props => {
	const buttonOptionId = createUniqueId()
	const buttonSelectedId = createUniqueId()
	const buttonPreviousId = createUniqueId()
	const buttonNextId = createUniqueId()
	const [value, setValue] = createSignal<Date>(new Date())
	const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption.day)
	const [viewDate, setViewDate] = createSignal<Date>(new Date())
	const [startDay, setStartDay] = createSignal<number>(0)
	const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
	let divMonthRef: HTMLDivElement | undefined
	let divDateRef: HTMLDivElement | undefined
	let divYearRef: HTMLDivElement | undefined

	function updateDateView(): void {
		let daysPerMonth = 31 // reset to default
		setStartDay(new Date(viewDate().getFullYear(), viewDate().getMonth(), 1).getDay())

		// february
		if (viewDate().getMonth() == 1) {
			daysPerMonth = 28
			if (viewDate().getFullYear() % 4 == 0) daysPerMonth = 29
		}

		// april, june, september, november
		else if ([3, 5, 8, 10].includes(viewDate().getMonth())) daysPerMonth = 30

		setDaysPerMonth(daysPerMonth)
	}

	function next(): void {
		const newDate = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: newDate.setMonth(newDate.getMonth() + 1); break
			case DatePickerOption.month: newDate.setFullYear(newDate.getFullYear() + 1); break
			case DatePickerOption.year: newDate.setFullYear(newDate.getFullYear() + 16); break
		}
		setViewDate(newDate)
		updateDateView()
		props.onUpdate()
	}

	function previous(): void {
		const newDate = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: newDate.setMonth(newDate.getMonth() - 1); break
			case DatePickerOption.month: newDate.setFullYear(newDate.getFullYear() - 1); break
			case DatePickerOption.year: newDate.setFullYear(newDate.getFullYear() - 16); break
		}

		setViewDate(newDate)
		updateDateView()
		props.onUpdate()
	}

	function goToSelectedDate(): void {
		setViewDate(value())
		updateDateView()
	}

	createEffect(() => {
		props.closeSignal // to trigger close signal
		setDateOption(DatePickerOption.day)
	})

	createEffect(() => {
		const date = props.date

		setViewDate(date)
		setValue(date)
	})

	const DaysDate: VoidComponent = () => {
		return (<div style="display: contents">
			<div class="c-date-picker-days-name">
				<For each={localWeekdayNames(props.locales)}>{d => <p>{d.substring(0, 3)}</p>}</For>
			</div>
			<FocusableGroup2D
				class="c-date-picker-days"
				c:columnCount={7}
				ref={divDateRef}
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
						el => el.tagName == 'BUTTON'
					)) return

					const index = safeNumber(Number.parseInt(button.dataset.index!))
					const date = new Date(
						viewDate().getFullYear(),
						viewDate().getMonth(),
						index + 1
					)
					const d = new Date(value())
					d.setDate(date.getDate())
					d.setMonth(date.getMonth())
					d.setFullYear(date.getFullYear())
					setValue(d)
					props.onSelectDate?.(value())
					props.onClose()
				}}>
				<For each={Array(startDay()).fill(0)}>{_v => <div/>}</For>
				<For each={Array(daysPerMonth()).fill(0)}>{(_v, i) => {
					const date = createMemo(() => new Date(
						viewDate().getFullYear(),
						viewDate().getMonth(),
						i() + 1
					))
					return (<SquareButton
						data-index={i()}
						disabled={isDateOutRange_YMD(date(), props.firstDate, props.lastDate)}
						c:variant={isDateEqual_YMD(date(), value())
							? ButtonVariant.filled
							: isDateEqual_YMD(date(), new Date())
								? ButtonVariant.outlined
								: undefined
						}>
						{ i() + 1 }
					</SquareButton>)
				}}</For>
			</FocusableGroup2D>
		</div>)
	}

	const MonthsDate: VoidComponent = () => {
		return (<FocusableGroup2D
			ref={divMonthRef}
			c:columnCount={3}
			class="c-date-picker-month"
			onClick={ev => {
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				const index = safeNumber(Number.parseInt(button.dataset.index!))
				setViewDate(new Date(viewDate().getFullYear(), index))
				setDateOption(DatePickerOption.day)
				updateDateView()

				setTimeout(() => {
					const children = divDateRef!.children as unknown as HTMLButtonElement[]
					for (const child of children) {
						if (child.tagName != "BUTTON" || child.disabled) continue

						child.focus()
						break
					}
				})
			}}>
			<For each={localMonthNames(props.locales)}>{(m, i) => {
				const date = createMemo(() => new Date(viewDate().getFullYear(), i()))
				return (<Button
					data-index={i()}
					disabled={isDateOutRange_YM(date(), props.firstDate, props.lastDate)}
					c:variant={isDateEqual_YM(date(), value())
						? ButtonVariant.filled
						: isDateEqual_YM(date(), new Date())
							? ButtonVariant.outlined
							: undefined
					}>{m}</Button>)
			}}</For>
		</FocusableGroup2D>)
	}

	const YearsDate: VoidComponent = () => {
		return (<FocusableGroup2D
			c:columnCount={4}
			class="c-date-picker-year"
			ref={divYearRef}
			onClick={(ev) => {
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				let index: string | number | undefined = button.dataset.index
				if (!index) return;

				index = safeNumber(Number.parseInt(index))
				setViewDate(new Date(viewDate().getFullYear() + index, 0))
				setDateOption(DatePickerOption.month)
				updateDateView()

				setTimeout(() => {
					const children = divMonthRef!.children as unknown as HTMLButtonElement[]
					for (const child of children) {
						if (child.tagName != "BUTTON" || child.disabled) continue

						child.focus()
						break
					}
				})
			}}>
			<For each={Array(16).fill(0)}>{(_v, i) => {
				const date = createMemo(() => new Date(viewDate().getFullYear() + i(), 0))
				return (<Button
					data-index={i()}
					disabled={isDateOutRange_Y(date(), props.firstDate, props.lastDate)}
					c:variant={isDateEqual_Y(date(), value())
						? ButtonVariant.filled
						: isDateEqual_Y(date(), new Date())
							? ButtonVariant.outlined
							: undefined
					}>
					{viewDate().getFullYear() + i()}
				</Button>)
			}}</For>
		</FocusableGroup2D>)
	}

	return (<>
		<FocusableGroup
			c:arrowOptions={{
				left: 'prev',
				right: 'next'
			}}
			class="c-date-picker-header"
			onClick={(ev) => {
				const button = document.activeElement!
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName === 'BUTTON')
				) return

				switch (button.id) {
				case buttonOptionId:
					setDateOption(d => {
						if (d == DatePickerOption.month) return DatePickerOption.year
						return DatePickerOption.month
					})
					break
				case buttonSelectedId:
					const sibling = button.previousElementSibling! as HTMLButtonElement
					sibling.tabIndex = 0
					sibling.focus()
					goToSelectedDate()
					break
				case buttonPreviousId:
					previous()
					break
				case buttonNextId:
					next()
					break
				}
			}}>
			<Button
				id={buttonOptionId}
				c:variant={ButtonVariant.tonal}>
				<Switch>
					<Match when={dateOption() == DatePickerOption.day}>
						{viewDate().toLocaleDateString(props.locales, {month: 'long'}) + ' ' + viewDate().getFullYear()}
					</Match>
					<Match when={dateOption() == DatePickerOption.month}>
						{viewDate().getFullYear()}
					</Match>
					<Match when={dateOption() == DatePickerOption.year}>
						{viewDate().getFullYear() + '-' + (viewDate().getFullYear() + 15)}
					</Match>
				</Switch>
			</Button>
			<Show when={
				(
					(dateOption() == DatePickerOption.day && !isDateEqual_YM(viewDate(), value()))
					|| (dateOption() == DatePickerOption.month && !isDateEqual_Y(viewDate(), value()))
					|| (dateOption() == DatePickerOption.year && isDateOutRange_Y(value(), viewDate(), new Date(viewDate().getFullYear() + 15, 2, 3)))
				)
				&& isDateInRange_YM(value(), props.firstDate, props.lastDate)}>
				<IconButton
					c:code={ICON_CALENDAR_DATE}
					id={buttonSelectedId}
				/>
			</Show>
			<IconButton
				c:code={ICON_CHEVRON_LEFT}
				id={buttonPreviousId}
			/>
			<IconButton
				c:code={ICON_CHEVRON_RIGHT}
				id={buttonNextId}
			/>
		</FocusableGroup>
		<Divider />
		<Transition
			onEnter={(el, done) => {
				if (isAnimationAllowed()) {
					(el as HTMLElement).animate(
						{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
						{ duration: 200, easing: AnimationEffectTiming.spring }
					).finished.then(done)
					return
				}

				done()
			}}
			onExit={(_, done) => done()}>
			<Switch>
				<Match when={dateOption() == DatePickerOption.day}><DaysDate/></Match>
				<Match when={dateOption() == DatePickerOption.month}><MonthsDate/></Match>
				<Match when={dateOption() == DatePickerOption.year}><YearsDate/></Match>
			</Switch>
		</Transition>
		{props.children}
	</>)
}

type DatePickerProps = ModalProps & {
	'c:date'?: Date
	'c:firstDate'?: Date
	'c:lastDate'?: Date
	'c:locales'?: Intl.LocalesArgument
	'c:onSelectDate'?(value: Date): unknown
}

const DatePicker: VoidComponent<DatePickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:locales':'en-US',
		'c:date': new Date(),
		'c:firstDate': new Date(new Date().getFullYear() - 100, 0, 1),
		'c:lastDate': new Date(new Date().getFullYear() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:date', 'c:onSelectDate',
		'c:firstDate', 'c:lastDate', 'c:locales',
		'classList', 'children', 'onClose'
	])
	const [closeSignal, setCloseSignal] = createSignal<boolean>(false)
	let datePickerRef: HTMLDialogElement

	return (<Modal
		ref={mergeRefs(props.ref, r => datePickerRef = r)}
		classList={{
			'c-date-picker': true,
			...props.classList
		}}
		onClose={(ev) => {
			eventCall(ev, props.onClose)
			setCloseSignal(s => !s)
		}}
		{...other}>
		<DatePickerBody
			closeSignal={closeSignal()}
			date={props['c:date']}
			firstDate={props['c:firstDate']}
			lastDate={props['c:lastDate']}
			onClose={() => closeModal(datePickerRef)}
			onUpdate={() => repositionModal(datePickerRef)}
			locales={props['c:locales']}
			onSelectDate={props['c:onSelectDate']}>
			{props.children}
		</DatePickerBody>
	</Modal>)
}

type PopoverDatePickerProps = PopoverProps & {
	'c:date'?: Date
	'c:firstDate'?: Date
	'c:lastDate'?: Date
	'c:locales'?: Intl.LocalesArgument
	'c:onSelectDate'?(value: Date): unknown
}

const PopoverDatePicker: VoidComponent<PopoverDatePickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:locales':'en-US',
		'c:date': new Date(),
		'c:firstDate': new Date(new Date().getFullYear() - 100, 0, 1),
		'c:lastDate': new Date(new Date().getFullYear() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:date', 'c:onSelectDate',
		'c:firstDate', 'c:lastDate', 'c:locales',
		'children', 'classList', 'c:onToggleOpen'
	])
	const [closeSignal, setCloseSignal] = createSignal<boolean>(false)
	let datePickerRef: HTMLDivElement

	return (<Popover
		ref={mergeRefs(props.ref, r => datePickerRef = r)}
		classList={{
			'c-date-picker': true,
			...props.classList
		}}
		c:onToggleOpen={isOpen => {
			props['c:onToggleOpen']?.(isOpen)
			if (!isOpen) setCloseSignal(s => !s)
		}}
		{...other}>
		<DatePickerBody
			closeSignal={closeSignal()}
			date={props['c:date']}
			firstDate={props['c:firstDate']}
			lastDate={props['c:lastDate']}
			onClose={() => closePopover(datePickerRef)}
			onUpdate={() => repositionPopover(datePickerRef)}
			locales={props['c:locales']}
			onSelectDate={props['c:onSelectDate']}>
			{props.children}
		</DatePickerBody>
	</Popover>)
}

export {
	DatePicker,
	PopoverDatePicker,
	isModalOpen as isDatePickerOpen,
	focusModal as focusDatePicker,
	openModal as openDatePicker,
	closeModal as closeDatePicker,
	repositionModal as repositionDatePicker,
	isPopoverOpen as isPopoverDatePickerOpen,
	openPopover as openPopoverDatePicker,
	closePopover as closePopoverDatePicker,
	repositionPopover as repositionPopoverDatePicker,
	DatePickerPosition
}
export type {
	DatePickerProps,
	PopoverDatePickerProps
}
export default DatePicker