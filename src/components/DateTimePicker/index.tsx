import { Transition } from 'solid-transition-group'
import { createEffect, createMemo, createSignal, For, Match, mergeProps, Show, splitProps, Switch, type VoidComponent } from 'solid-js'

import { _ref, _datetime, _onSelectDateTime, _firstDate, _lastDate, _locales, _children, _classList, _onClose, _day, _getDay, _includes, _setMonth, _month, _setFullYear, _year, _substring, _fill, _setDate, _getDate, _getMonth, _getFullYear, _filled, _outlined, _getHours, _setHours, _map, _padStart, _getMinutes, _setMinutes, _AM, _PM, _$24hour, _tonal, _animate, _finished, _spring, _then } from '@/constants/string'
import { getCurrentDate, getDate_Y, getDate_M, getWeekdayNames, isOutDate_YMD, isSameDate_YMD, getMonthNames, isOutDate_YM, isSameDate_YM, isOutDate_Y, isSameDate_Y, getMonthText, isInDate_YM } from '@/utils/datetime'
import { AnimationEffectTiming } from '@/enums/animation'
import { TimeFormat } from '@/enums/datetime'

import Button, { ButtonVariant, IconButton, SquareButton } from '@/components/Button'
import Dropdown, { type Item as $DropdownItem } from '@/components/Dropdown'
import { closeModal, openModal, focusModal, Modal, type ModalProps, repositionModal, ModalPosition as DateTimePickerPosition } from '@/components/Modal'
import './index.scss'
import Divider from '../Divider'

enum DatePickerOption {
	year,
	month,
	day
}

type DateTimePickerProps = ModalProps & {
	datetime?: Date
	firstDate?: Date
	lastDate?: Date
	locales?: Intl.LocalesArgument
	onSelectDateTime?: (value: Date) => unknown
}

const DateTimePicker: VoidComponent<DateTimePickerProps> = ($props) => {
	const $$props = mergeProps({
		locales:'en-US',
		datetime: getCurrentDate(),
		firstDate: new Date(getDate_Y() - 100, 0, 1),
		lastDate: new Date(getDate_Y() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		_ref, _datetime, _onSelectDateTime,
		_firstDate, _lastDate, _locales,
		_children, _classList, _onClose
	])
	const [value, setValue] = createSignal<Date>(getCurrentDate())
	const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption[_day])
	const [viewDate, setViewDate] = createSignal<Date>(getCurrentDate())
	const [startDay, setStartDay] = createSignal<number>(0)
	const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
	const [isTime24HourFormat, setIsTime24HourFormat] = createSignal<boolean>(false)
	const [isTimePMFormat, setIsTimePMFormat] = createSignal<boolean>(false)
	const isTimeAMFormat = createMemo(() => !isTimePMFormat() && !isTime24HourFormat())
	const dateNow = getCurrentDate()
	let dateTimePicker_ref: HTMLDialogElement

	function updateDateView(): void {
		let daysPerMonth = 31 // reset to default
		setStartDay(new Date(getDate_Y(viewDate()), getDate_M(viewDate()), 1)[_getDay]())

		// february
		if (getDate_M(viewDate()) == 1) {
			daysPerMonth = 28
			if (getDate_Y(viewDate()) % 4 == 0) daysPerMonth = 29
		}

		// april, june, september, november
		else if ([3, 5, 8, 10][_includes](getDate_M(viewDate()))) daysPerMonth = 30

		setDaysPerMonth(daysPerMonth)
	}

	function next(): void {
		const newDate = new Date(viewDate())
		if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) + 1)
		else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) + 1)
		else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) + 16)

		setViewDate(newDate)
		updateDateView()
	}

	function previous(): void {
		const newDate = new Date(viewDate())
		if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) - 1)
		else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) - 1)
		else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) - 16)

		setViewDate(newDate)
		updateDateView()
	}

	function gotoSelectedDatetime(): void {
		setViewDate(value())
		updateDateView()
	}

	createEffect(() => {
		const datetime = props[_datetime]

		setViewDate(datetime)
		setValue(datetime)
	})

	const DaysDate: VoidComponent = () => {
		return (<div style={{display: 'contents'}}>
			<div class="datetime-picker-days-name">
				<For each={getWeekdayNames(props[_locales])}>{d => <p>{d[_substring](0, 2)}</p>}</For>
			</div>
			<div class="datetime-picker-days">
				<For each={Array(startDay())[_fill](0)}>{_v => <div/>}</For>
				<For each={Array(daysPerMonth())[_fill](0)}>{(_v, i) => {
					const date = createMemo(() => new Date(getDate_Y(viewDate()), getDate_M(viewDate()), i() + 1))
					return (<SquareButton
						onClick={() => {
							const d = new Date(value())
							d[_setDate](date()[_getDate]())
							d[_setMonth](date()[_getMonth]())
							d[_setFullYear](date()[_getFullYear]())
							setValue(d)
						}}
						disabled={isOutDate_YMD(date(), props[_firstDate], props[_lastDate])}
						variant={isSameDate_YMD(date(), value())
							? ButtonVariant[_filled]
							: isSameDate_YMD(date(), dateNow)
								? ButtonVariant[_outlined]
								: undefined
						}>
						{ i() + 1 }
					</SquareButton>)
				}}</For>
			</div>
		</div>)
	}

	const MonthsDate: VoidComponent = () => {
		return (<div class="datetime-picker-month">
			<For each={getMonthNames(props[_locales])}>{(m, i) => {
				const date = createMemo(() => new Date(getDate_Y(viewDate()), i()))
				return (<Button
					onClick={() => {
						setViewDate(date())
						setDateOption(DatePickerOption[_day])
						updateDateView()
					}}
					disabled={isOutDate_YM(date(), props[_firstDate], props[_lastDate])}
					variant={isSameDate_YM(date(), value())
						? ButtonVariant[_filled]
						: isSameDate_YM(date(), dateNow)
							? ButtonVariant[_outlined]
							: undefined
					}>{m}</Button>)
			}}</For>
		</div>)
	}

	const YearsDate: VoidComponent = () => {
		return (<div class="datetime-picker-year">
			<For each={Array(16)[_fill](0)}>{(_v, i) => {
				const date = createMemo(() => new Date(getDate_Y(viewDate()) + i(), 0))
				return (<Button
					onClick={() => {
						setViewDate(date())
						setDateOption(DatePickerOption[_month])
						updateDateView()
					}}
					disabled={isOutDate_Y(date(), props[_firstDate], props[_lastDate])}
					variant={isSameDate_Y(date(), value())
						? ButtonVariant[_filled]
						: isSameDate_Y(date(), dateNow)
							? ButtonVariant[_outlined]
							: undefined
					}>
					{getDate_Y(viewDate()) + i()}
				</Button>)
			}}</For>
		</div>)
	}

	return (<Modal
		ref={r => {
			dateTimePicker_ref = r
			if (props[_ref]) props[_ref](r)
		}}
		classList={{
			'datetime-picker': true,
			...props[_classList]
		}}
		onClose={(ev) => {
			setDateOption(DatePickerOption[_day])
			if (props[_onClose]) props[_onClose](ev)
		}}
		{...other}>
		<div class="datetime-picker-header">
			<Button
				onClick={() => setDateOption(d => {
					if (d == DatePickerOption[_month]) return DatePickerOption[_year]
					return DatePickerOption[_month]
				})}
				variant={ButtonVariant[_tonal]}>
				<Switch>
					<Match when={dateOption() == DatePickerOption[_day]}>
						{getMonthText(viewDate(), props[_locales]) + ' ' + getDate_Y(viewDate())}
					</Match>
					<Match when={dateOption() == DatePickerOption[_month]}>
						{getDate_Y(viewDate())}
					</Match>
					<Match when={dateOption() == DatePickerOption[_year]}>
						{getDate_Y(viewDate()) + '-' + (getDate_Y(viewDate()) + 15)}
					</Match>
				</Switch>
			</Button>
			<Show when={
				(
					(dateOption() == DatePickerOption[_day] && !isSameDate_YM(viewDate(), value()))
					|| (dateOption() == DatePickerOption[_month] && !isSameDate_Y(viewDate(), value()))
					|| (dateOption() == DatePickerOption[_year] && isOutDate_Y(value(), viewDate(), new Date(getDate_Y(viewDate()) + 15, 2, 3)))
				)
				&& isInDate_YM(value(), props[_firstDate], props[_lastDate])}>
				<IconButton code={0xE2E6} onClick={() => gotoSelectedDatetime()}/>
			</Show>
			<IconButton code={0xE400} onClick={() => previous()}/>
			<IconButton code={0xE402} onClick={() => next()}/>
		</div>
		<Divider />
		<Transition
			onEnter={(el, done) => {el[_animate](
				{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
				{ duration: 300, easing: AnimationEffectTiming[_spring] }
			)[_finished][_then](done)}}
			onExit={(el, done) => {el[_animate]({}, { duration: 0 })[_finished][_then](done)}}>
			<Switch>
				<Match when={dateOption() == DatePickerOption[_day]}><DaysDate/></Match>
				<Match when={dateOption() == DatePickerOption[_month]}><MonthsDate/></Match>
				<Match when={dateOption() == DatePickerOption[_year]}><YearsDate/></Match>
			</Switch>
		</Transition>
		<div class="datetime-picker-time">
			<Dropdown
				labelText="Hour"
				selectedValues={[
					value()[_getHours]() - (value()[_getHours]() >= 12 && !isTime24HourFormat()? 12 : 0)
				]}
				onSelectedItemsChanged={(items) =>
					setValue(v => (v[_setHours](items[0][0] as number + (isTimePMFormat()? 12 : 0)), v))
				}
				items={[
					[0, '00'],
					...new Array(isTime24HourFormat()? 23 : 11)[_fill](1)[_map]((_v, i) =>
						[i+1, `${i+1}`[_padStart](2, '0')] as $DropdownItem
					),
				]}
			/>
			<Dropdown
				labelText="Minute"
				selectedValues={[value()[_getMinutes]()]}
				onSelectedItemsChanged={(items) => setValue(v => (v[_setMinutes](items[0][0] as number), v))}
				items={new Array(60)[_fill](1)[_map]((_v, i) => [i, `${i}`[_padStart](2, '0')] as $DropdownItem)}
			/>
			<Dropdown
				selectedValues={[_AM]}
				onSelectedItemsChanged={(items) => {
					const hour = value()[_getHours]()
					let $hour = hour

					// from (AM | 24hour) to PM
					if (
						(isTimeAMFormat() || isTime24HourFormat())
						&& items[0][0] == _PM
						&& $hour <= 12
					) $hour += 12

					// from (PM | 24hour) to AM
					else if (
						(isTime24HourFormat() || isTimePMFormat())
						&& items[0][0] == _AM
						&& $hour >= 12
					) $hour -= 12

					if (hour != $hour) setValue(v => (v[_setHours]($hour), v))

					setIsTime24HourFormat(items[0][0] == TimeFormat[_$24hour])
					setIsTimePMFormat(items[0][0] == _PM)
				}}
				items={[[_AM, _AM], [_PM, _PM], [TimeFormat[_$24hour], '24 hour']]}
			/>
		</div>
		{props[_children]}
		<div class="datetime-picker-actions">
			<Button variant={ButtonVariant[_tonal]} onClick={() => closeModal(dateTimePicker_ref)}>Cancel</Button>
			<Button
				variant={ButtonVariant[_filled]}
				onClick={() => {
					if (props[_onSelectDateTime]) props[_onSelectDateTime](value())
					closeModal(dateTimePicker_ref)
				}}>
				Select
			</Button>
		</div>
	</Modal>)
}

export {
	DateTimePicker,
	focusModal as focusDateTimePicker,
	openModal as openDateTimePicker,
	closeModal as closeDateTimePicker,
	repositionModal as repositionDateTimePicker,
	DateTimePickerPosition
}
export type {
	DateTimePickerProps
}
export default DateTimePicker