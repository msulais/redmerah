import { Transition } from "solid-transition-group"
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps, type ParentComponent, type VoidComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { dateCurrent, dateYear, dateMonth, dateWeekdayNames, dateOutRangeYMD, dateIsSameYMD, dateMonthNames, dateOutRangeYM, dateIsSameYM, dateOutRangeY, dateIsSameY, dateTextMonth, dateInRangeYM, dateDay, dateMonthSet, dateYearSet, dateDate, dateDateSet } from "@/utils/datetime"
import { AnimationEffectTiming } from "@/enums/animation"
import { eventCall, eventCurrentTarget } from "@/utils/event"
import { arrayFill, arrayIncludes } from "@/utils/array"
import { stringSubstring } from "@/utils/string"
import { elementAnimate, elementChildren, elementDataset, elementFocus, elementFocusByArrowKey, elementId, elementSiblingPrevious, elementTabIndexSet, elementTagName, elementValidTarget } from "@/utils/element"
import { promiseDone } from "@/utils/object"
import { numberParse, numberSafe } from "@/utils/number"
import { timeTimerSet } from "@/utils/time"
import { documentActive } from "@/utils/document"
import { ICON_CALENDAR_DATE, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from "@/constants/icons"

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
	const [value, setValue] = createSignal<Date>(dateCurrent())
	const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption.day)
	const [viewDate, setViewDate] = createSignal<Date>(dateCurrent())
	const [startDay, setStartDay] = createSignal<number>(0)
	const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
	let divMonthRef: HTMLDivElement | undefined
	let divDateRef: HTMLDivElement | undefined
	let divYearRef: HTMLDivElement | undefined

	function updateDateView(): void {
		let daysPerMonth = 31 // reset to default
		setStartDay(dateDay(new Date(dateYear(viewDate()), dateMonth(viewDate()), 1)))

		// february
		if (dateMonth(viewDate()) == 1) {
			daysPerMonth = 28
			if (dateYear(viewDate()) % 4 == 0) daysPerMonth = 29
		}

		// april, june, september, november
		else if (arrayIncludes([3, 5, 8, 10], dateMonth(viewDate()))) daysPerMonth = 30

		setDaysPerMonth(daysPerMonth)
	}

	function next(): void {
		const new_date = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: dateMonthSet(new_date, dateMonth(new_date) + 1); break
			case DatePickerOption.month: dateYearSet(new_date, dateYear(new_date) + 1); break
			case DatePickerOption.year: dateYearSet(new_date, dateYear(new_date) + 16); break
		}
		setViewDate(new_date)
		updateDateView()
		props.onUpdate()
	}

	function previous(): void {
		const nexDate = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: dateMonthSet(nexDate, dateMonth(nexDate) - 1); break
			case DatePickerOption.month: dateYearSet(nexDate, dateYear(nexDate) - 1); break
			case DatePickerOption.year: dateYearSet(nexDate, dateYear(nexDate) - 16); break
		}

		setViewDate(nexDate)
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
				<For each={dateWeekdayNames(props.locales)}>{d => <p>{stringSubstring(d, 0, 3)}</p>}</For>
			</div>
			<FocusableGroup2D
				class="c-date-picker-days"
				c:columnCount={7}
				ref={divDateRef}
				onClick={(ev) => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const index = numberSafe(numberParse(elementDataset(button, 'index')!, true))
					const date = new Date(
						dateYear(viewDate()),
						dateMonth(viewDate()),
						index + 1
					)
					const d = new Date(value())
					dateDateSet(d, dateDate(date))
					dateMonthSet(d, dateMonth(date))
					dateYearSet(d, dateYear(date))
					setValue(d)
					props.onSelectDate?.(value())
					props.onClose()
				}}>
				<For each={arrayFill(Array(startDay()), 0)}>{_v => <div/>}</For>
				<For each={arrayFill(Array(daysPerMonth()), 0)}>{(_v, i) => {
					const date = createMemo(() => new Date(
						dateYear(viewDate()),
						dateMonth(viewDate()),
						i() + 1
					))
					return (<SquareButton
						data-index={i()}
						disabled={dateOutRangeYMD(date(), props.firstDate, props.lastDate)}
						c:variant={dateIsSameYMD(date(), value())
							? ButtonVariant.filled
							: dateIsSameYMD(date(), dateCurrent())
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
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				const index = numberSafe(numberParse(elementDataset(button, 'index')!, true))
				setViewDate(new Date(dateYear(viewDate()), index))
				setDateOption(DatePickerOption.day)
				updateDateView()

				timeTimerSet(() => {
					const children = elementChildren<HTMLButtonElement>(divDateRef!)
					for (const child of children) {
						if (elementTagName(child) != "BUTTON" || child.disabled) continue

						elementFocus(child)
						break
					}
				})
			}}>
			<For each={dateMonthNames(props.locales)}>{(m, i) => {
				const date = createMemo(() => new Date(dateYear(viewDate()), i()))
				return (<Button
					data-index={i()}
					disabled={dateOutRangeYM(date(), props.firstDate, props.lastDate)}
					c:variant={dateIsSameYM(date(), value())
						? ButtonVariant.filled
						: dateIsSameYM(date(), dateCurrent())
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
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				let index: string | number | undefined = elementDataset(button, 'index')
				if (!index) return;

				index = numberSafe(numberParse(index, true))
				setViewDate(new Date(dateYear(viewDate()) + index, 0))
				setDateOption(DatePickerOption.month)
				updateDateView()

				timeTimerSet(() => {
					const children = elementChildren<HTMLButtonElement>(divMonthRef!)
					for (const child of children) {
						if (elementTagName(child) != "BUTTON" || child.disabled) continue

						elementFocus(child)
						break
					}
				})
			}}>
			<For each={arrayFill(Array(16), 0)}>{(_v, i) => {
				const date = createMemo(() => new Date(dateYear(viewDate()) + i(), 0))
				return (<Button
					data-index={i()}
					disabled={dateOutRangeY(date(), props.firstDate, props.lastDate)}
					c:variant={dateIsSameY(date(), value())
						? ButtonVariant.filled
						: dateIsSameY(date(), dateCurrent())
							? ButtonVariant.outlined
							: undefined
					}>
					{dateYear(viewDate()) + i()}
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
			onKeyDown={(ev) => elementFocusByArrowKey(
				eventCurrentTarget(ev),
				ev.code,
				{ left: 'prev', right: 'next' }
			)}
			onClick={(ev) => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON')
				) return

				switch (elementId(button)) {
				case buttonOptionId:
					setDateOption(d => {
						if (d == DatePickerOption.month) return DatePickerOption.year
						return DatePickerOption.month
					})
					break
				case buttonSelectedId:
					const sibling = elementSiblingPrevious(button)!
					elementTabIndexSet(sibling, 0)
					elementFocus(sibling)
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
						{dateTextMonth(viewDate(), props.locales) + ' ' + dateYear(viewDate())}
					</Match>
					<Match when={dateOption() == DatePickerOption.month}>
						{dateYear(viewDate())}
					</Match>
					<Match when={dateOption() == DatePickerOption.year}>
						{dateYear(viewDate()) + '-' + (dateYear(viewDate()) + 15)}
					</Match>
				</Switch>
			</Button>
			<Show when={
				(
					(dateOption() == DatePickerOption.day && !dateIsSameYM(viewDate(), value()))
					|| (dateOption() == DatePickerOption.month && !dateIsSameY(viewDate(), value()))
					|| (dateOption() == DatePickerOption.year && dateOutRangeY(value(), viewDate(), new Date(dateYear(viewDate()) + 15, 2, 3)))
				)
				&& dateInRangeYM(value(), props.firstDate, props.lastDate)}>
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
				promiseDone(elementAnimate(
					el as HTMLElement,
					{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
					{ duration: 200, easing: AnimationEffectTiming.spring }
				).finished, done)
			}}
			onExit={(el, done) => {
				promiseDone(elementAnimate(
					el as HTMLElement,
					{},
					{ duration: 0 }
				).finished, done)
			}}>
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
		'c:date': dateCurrent(),
		'c:firstDate': new Date(dateYear() - 100, 0, 1),
		'c:lastDate': new Date(dateYear() + 100, 11, 31),
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
		'c:date': dateCurrent(),
		'c:firstDate': new Date(dateYear() - 100, 0, 1),
		'c:lastDate': new Date(dateYear() + 100, 11, 31),
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