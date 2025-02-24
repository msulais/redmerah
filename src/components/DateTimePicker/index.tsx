import { Transition } from 'solid-transition-group'
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, mergeProps, Show, splitProps, Switch, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { dateCurrent, dateYear, dateMonth, dateWeekdayNames, dateOutRangeYMD, dateIsSameYMD, dateMonthNames, dateOutRangeYM, dateIsSameYM, dateOutRangeY, dateIsSameY, dateTextMonth, dateInRangeYM, dateDay, dateMonthSet, dateYearSet, dateDateSet, dateDate, dateHours, dateHourSet, dateMinutes, dateMinuteSet } from '@/utils/datetime'
import { AnimationEffectTiming } from '@/enums/animation'
import { eventCall, eventCurrentTarget } from '@/utils/event'
import { arrayFill, arrayIncludes, arrayMap } from '@/utils/array'
import { stringPadStart, stringSubstring } from '@/utils/string'
import { elementAnimate, elementChildren, elementDataset, elementFocus, elementFocusByArrowKey, elementId, elementSiblingPrevious, elementTabIndexSet, elementTagName, elementValidTarget } from '@/utils/element'
import { promiseDone } from '@/utils/object'
import { numberParse, numberSafe } from '@/utils/number'
import { timeTimerSet } from '@/utils/time'
import { documentActive } from '@/utils/document'
import { ICON_CALENDAR_DATE, ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '@/constants/icons'
import { animationIsOn } from '@/utils/animation'

import Button, { ButtonVariant, IconButton, SquareButton } from '@/components/Button'
import Dropdown, { DropdownOption } from '@/components/Dropdown'
import { Modal, type ModalProps, ModalPosition as DateTimePickerPosition, closeModal, focusModal, openModal, repositionModal, isModalOpen } from '@/components/Modal'
import { MenuHeader } from '@/components/Menu'
import { closePopover, isPopoverOpen, openPopover, Popover, repositionPopover, type PopoverProps } from '@/components/Popover'
import Divider from '@/components/Divider'
import FocusableGroup, { FocusableGroup2D } from '@/components/FocusableGroup'
import './index.scss'

enum DatePickerOption {
	year,
	month,
	day
}

const DateTimePickerBody: ParentComponent<{
	closeSignal: boolean
	datetime: Date
	firstDate: Date
	lastDate: Date
	locales?: Intl.LocalesArgument
	onSelectDatetime?(value: Date): unknown
	onClose(): unknown
	onUpdate(): unknown
}> = props => {
	const buttonCancelId = createUniqueId()
	const buttonSelectId = createUniqueId()
	const buttonOptionId = createUniqueId()
	const buttonSelectedId = createUniqueId()
	const buttonPreviousId = createUniqueId()
	const buttonNextId = createUniqueId()
	const [value, setValue] = createSignal<Date>(dateCurrent())
	const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption.day)
	const [viewDate, setViewDate] = createSignal<Date>(dateCurrent())
	const [startDay, setStartDay] = createSignal<number>(0)
	const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
	const [isTimePMFormat, setIsTimePMFormat] = createSignal<boolean>(false)
	const isTimeAMFormat = createMemo(() => !isTimePMFormat())
	let divYearRef: HTMLDivElement | undefined
	let divMonthRef: HTMLDivElement | undefined
	let divDateRef: HTMLDivElement | undefined

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
		const newDate = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: dateMonthSet(newDate, dateMonth(newDate) + 1); break
			case DatePickerOption.month: dateYearSet(newDate, dateYear(newDate) + 1); break
			case DatePickerOption.year: dateYearSet(newDate, dateYear(newDate) + 16); break
		}

		setViewDate(newDate)
		updateDateView()
		props.onUpdate()
	}

	function previous(): void {
		const newDate = new Date(viewDate())
		switch (dateOption()) {
			case DatePickerOption.day: dateMonthSet(newDate, dateMonth(newDate) - 1); break
			case DatePickerOption.month: dateYearSet(newDate, dateYear(newDate) - 1); break
			case DatePickerOption.year: dateYearSet(newDate, dateYear(newDate) - 16); break
		}

		setViewDate(newDate)
		updateDateView()
		props.onUpdate()
	}

	function goToSelectedDatetime(): void {
		setViewDate(value())
		updateDateView()
	}

	createEffect(() => {
		props.closeSignal // to trigger close signal
		setDateOption(DatePickerOption.day)
	})

	createEffect(() => {
		const datetime = props.datetime

		setViewDate(datetime)
		setValue(datetime)
	})

	const DaysDate: VoidComponent = () => {
		return (<div style="display: contents">
			<div class="c-datetime-picker-days-name">
				<For each={dateWeekdayNames(props.locales)}>{d => <p>{stringSubstring(d, 0, 3)}</p>}</For>
			</div>
			<FocusableGroup2D
				c:columnCount={7}
				class="c-datetime-picker-days"
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
			c:columnCount={3}ref={divMonthRef}
			class="c-datetime-picker-month"
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
			class="c-datetime-picker-year"
			ref={divYearRef}
			c:columnCount={4}
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
			c:arrowOptions={{left: 'prev', right: 'next'}}
			class="c-datetime-picker-header"
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
					goToSelectedDatetime()
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
				if (animationIsOn()) {
					promiseDone(elementAnimate(
						el as HTMLElement,
						{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
						{ duration: 200, easing: AnimationEffectTiming.spring }
					).finished, done)
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
		<FocusableGroup
			class="c-datetime-picker-time"
			c:arrowOptions={{ left: 'prev', right: 'next' }}>
			<Dropdown
				c:label='Hour'
				c:values={[
					dateHours(value()) - (dateHours(value()) >= 12? 12 : 0)
				]}
				c:attrMenu={{style: {
					"max-height": '192px'
				}}}
				c:onChange={(options) =>
					setValue(v => (dateHourSet(v, options[0].value as number + (isTimePMFormat()? 12 : 0)), v))
				}>
				<MenuHeader>Hour</MenuHeader>
				<For each={[
					[0, '00'],
					...arrayMap(
						arrayFill(new Array(11), 1),
						(_v, i) => [i+1, stringPadStart(`${i+1}`, 2, '0')]
					),
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string}/>}</For>
			</Dropdown>
			<Dropdown
				c:values={[dateMinutes(value())]}
				c:label='Minute'
				c:attrMenu={{style: {
					"max-height": '192px'
				}}}
				c:onChange={(options) => setValue(v => (dateMinuteSet(v, options[0].value as number), v))}>
				<MenuHeader>Minute</MenuHeader>
				<For each={arrayMap(
					arrayFill(new Array(60), 1),
					(_, i) => [i, stringPadStart(`${i}`, 2, '0')]
				)}>{option =>
					<DropdownOption c:value={option[0]} c:text={option[1] as string}/>
				}</For>
			</Dropdown>
			<Dropdown
				c:values={[dateHours(value()) >= 12? 'PM' : 'AM']}
				c:onChange={(options) => {
					const hour = dateHours(value())
					const $value = options[0].value
					let $hour = hour

					// from AM to PM
					if (
						isTimeAMFormat()
						&& $value == 'PM'
						&& $hour <= 12
					) $hour += 12

					// from PM to AM
					else if (
						isTimePMFormat()
						&& $value == 'AM'
						&& $hour >= 12
					) $hour -= 12

					if (hour != $hour) setValue(v => (dateHourSet(v, $hour), v))

					setIsTimePMFormat($value == 'PM')
				}}>
				<For each={[['AM', 'AM'], ['PM', 'PM']]}>{option =>
					<DropdownOption c:value={option[0]} c:text={option[1] as string}/>
				}</For>
			</Dropdown>
		</FocusableGroup>
		{props.children}
		<FocusableGroup
			class="c-datetime-picker-actions"
			c:arrowOptions={{ left: 'prev', right: 'next' }}
			onClick={(ev) => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonCancelId:
					props.onClose()
					break
				case buttonSelectId:
					props.onSelectDatetime?.(value())
					props.onClose()
					break
				}
			}}>
			<Button
				id={buttonCancelId}
				c:variant={ButtonVariant.tonal}>
				Cancel
			</Button>
			<Button
				id={buttonSelectId}
				c:variant={ButtonVariant.filled}>
				Select
			</Button>
		</FocusableGroup>
	</>)
}

type DateTimePickerProps = ModalProps & {
	'c:datetime'?: Date
	'c:firstDate'?: Date
	'c:lastDate'?: Date
	'c:locales'?: Intl.LocalesArgument
	'c:onSelectDatetime'?(value: Date): unknown
}

const DateTimePicker: VoidComponent<DateTimePickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:locales':'en-US',
		'c:datetime': dateCurrent(),
		'c:firstDate': new Date(dateYear() - 100, 0, 1),
		'c:lastDate': new Date(dateYear() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:datetime', 'c:onSelectDatetime',
		'c:firstDate', 'c:lastDate', 'c:locales',
		'children', 'classList', 'onClose'
	])
	const [closeSignal, setCloseSignal] = createSignal<boolean>(false)
	let dateTimePickerRef: HTMLDialogElement

	return (<Modal
		ref={mergeRefs(props.ref, r => dateTimePickerRef = r)}
		classList={{
			'c-datetime-picker': true,
			...props.classList
		}}
		onClose={(ev) => {
			eventCall(ev, props.onClose)
			setCloseSignal(s => !s)
		}}
		{...other}>
		<DateTimePickerBody
			closeSignal={closeSignal()}
			datetime={props['c:datetime']}
			firstDate={props['c:firstDate']}
			lastDate={props['c:lastDate']}
			onClose={() => closeModal(dateTimePickerRef)}
			onUpdate={() => repositionModal(dateTimePickerRef)}
			locales={props['c:locales']}
			onSelectDatetime={props['c:onSelectDatetime']}>
			{props.children}
		</DateTimePickerBody>
	</Modal>)
}

type PopoverDateTimePickerProps = PopoverProps & {
	'c:datetime'?: Date
	'c:firstDate'?: Date
	'c:lastDate'?: Date
	'c:locales'?: Intl.LocalesArgument
	'c:onSelectDatetime'?(value: Date): unknown
}

const PopoverDateTimePicker: VoidComponent<PopoverDateTimePickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:locales':'en-US',
		'c:datetime': dateCurrent(),
		'c:firstDate': new Date(dateYear() - 100, 0, 1),
		'c:lastDate': new Date(dateYear() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c:datetime', 'c:onSelectDatetime',
		'c:firstDate', 'c:lastDate', 'c:locales',
		'children', 'classList', 'c:onToggleOpen'
	])
	const [closeSignal, setCloseSignal] = createSignal<boolean>(false)
	let dateTimePickerRef: HTMLDivElement

	return (<Popover
		ref={mergeRefs(props.ref, r => dateTimePickerRef = r)}
		classList={{
			'c-datetime-picker': true,
			...props.classList
		}}
		c:onToggleOpen={is_open => {
			props['c:onToggleOpen']?.(is_open)
			if (!is_open) setCloseSignal(s => !s)
		}}
		{...other}>
		<DateTimePickerBody
			closeSignal={closeSignal()}
			datetime={props['c:datetime']}
			firstDate={props['c:firstDate']}
			lastDate={props['c:lastDate']}
			onClose={() => closePopover(dateTimePickerRef)}
			onUpdate={() => repositionPopover(dateTimePickerRef)}
			locales={props['c:locales']}
			onSelectDatetime={props['c:onSelectDatetime']}>
			{props.children}
		</DateTimePickerBody>
	</Popover>)
}


export {
	DateTimePicker,
	PopoverDateTimePicker,
	isModalOpen as isDateTimePickerOpen,
	focusModal as focusDateTimePicker,
	openModal as openDateTimePicker,
	closeModal as closeDateTimePicker,
	repositionModal as repositionDateTimePicker,
	isPopoverOpen as isPopoverDateTimePickerOpen,
	openPopover as openPopoverDateTimePicker,
	closePopover as closePopoverDateTimePicker,
	repositionPopover as repositionPopoverDateTimePicker,
	DateTimePickerPosition
}
export type {
	DateTimePickerProps,
	PopoverDateTimePickerProps
}
export default DateTimePicker