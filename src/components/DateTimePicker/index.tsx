import { Transition } from 'solid-transition-group'
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, mergeProps, Show, splitProps, Switch, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { dateWeekdayNames, dateOutRangeYMD, dateIsSameYMD, dateMonthNames, dateOutRangeYM, dateIsSameYM, dateOutRangeY, dateIsSameY, dateInRangeYM } from '@/utils/datetime'
import { AnimationEffectTiming } from '@/enums/animation'
import { eventCall } from '@/utils/event'
import { elementValidTarget } from '@/utils/element'
import { numberSafe } from '@/utils/number'
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
	const [value, setValue] = createSignal<Date>(new Date())
	const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption.day)
	const [viewDate, setViewDate] = createSignal<Date>(new Date())
	const [startDay, setStartDay] = createSignal<number>(0)
	const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
	const [isTimePMFormat, setIsTimePMFormat] = createSignal<boolean>(false)
	const isTimeAMFormat = createMemo(() => !isTimePMFormat())
	let divYearRef: HTMLDivElement | undefined
	let divMonthRef: HTMLDivElement | undefined
	let divDateRef: HTMLDivElement | undefined

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
				<For each={dateWeekdayNames(props.locales)}>{d => <p>{d.substring(0, 3)}</p>}</For>
			</div>
			<FocusableGroup2D
				c:columnCount={7}
				class="c-datetime-picker-days"
				ref={divDateRef}
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
						el => el.tagName == 'BUTTON'
					)) return

					const index = numberSafe(Number.parseInt(button.dataset.index!))
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
						disabled={dateOutRangeYMD(date(), props.firstDate, props.lastDate)}
						c:variant={dateIsSameYMD(date(), value())
							? ButtonVariant.filled
							: dateIsSameYMD(date(), new Date())
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
				const button = document.activeElement! as HTMLButtonElement
				if (!elementValidTarget(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				const index = numberSafe(Number.parseInt(button.dataset.index!))
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
			<For each={dateMonthNames(props.locales)}>{(m, i) => {
				const date = createMemo(() => new Date(viewDate().getFullYear(), i()))
				return (<Button
					data-index={i()}
					disabled={dateOutRangeYM(date(), props.firstDate, props.lastDate)}
					c:variant={dateIsSameYM(date(), value())
						? ButtonVariant.filled
						: dateIsSameYM(date(), new Date())
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
				const button = document.activeElement! as HTMLButtonElement
				if (!elementValidTarget(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				let index: string | number | undefined = button.dataset.index
				if (!index) return;

				index = numberSafe(Number.parseInt(index))
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
					disabled={dateOutRangeY(date(), props.firstDate, props.lastDate)}
					c:variant={dateIsSameY(date(), value())
						? ButtonVariant.filled
						: dateIsSameY(date(), new Date())
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
			c:arrowOptions={{left: 'prev', right: 'next'}}
			class="c-datetime-picker-header"
			onClick={(ev) => {
				const button = document.activeElement!
				if (!elementValidTarget(
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
					(dateOption() == DatePickerOption.day && !dateIsSameYM(viewDate(), value()))
					|| (dateOption() == DatePickerOption.month && !dateIsSameY(viewDate(), value()))
					|| (dateOption() == DatePickerOption.year && dateOutRangeY(value(), viewDate(), new Date(viewDate().getFullYear() + 15, 2, 3)))
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
		<FocusableGroup
			class="c-datetime-picker-time"
			c:arrowOptions={{ left: 'prev', right: 'next' }}>
			<Dropdown
				c:label='Hour'
				c:values={[
					value().getHours()- (value().getHours()>= 12? 12 : 0)
				]}
				c:attrMenu={{style: {
					"max-height": '192px'
				}}}
				c:onChange={(options) =>
					setValue(v => (v.setHours(options[0].value as number + (isTimePMFormat()? 12 : 0)), v))
				}>
				<MenuHeader>Hour</MenuHeader>
				<For each={[
					[0, '00'],
					...new Array(11).fill(1).map(
						(_v, i) => [i+1, `${i+1}`.padStart(2, '0')]
					),
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string}/>}</For>
			</Dropdown>
			<Dropdown
				c:values={[value().getMinutes()]}
				c:label='Minute'
				c:attrMenu={{style: {
					"max-height": '192px'
				}}}
				c:onChange={(options) => setValue(v => (v.setMinutes(options[0].value as number), v))}>
				<MenuHeader>Minute</MenuHeader>
				<For each={new Array(60).fill(1).map(
					(_, i) => [i, `${i}`.padStart(2, '0')]
				)}>{option =>
					<DropdownOption c:value={option[0]} c:text={option[1] as string}/>
				}</For>
			</Dropdown>
			<Dropdown
				c:values={[value().getHours()>= 12? 'PM' : 'AM']}
				c:onChange={(options) => {
					const hour = value().getHours()
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

					if (hour != $hour) setValue(v => (v.setHours($hour), v))

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
				const button = document.activeElement!
				if (!elementValidTarget(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				switch (button.id) {
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
		'c:datetime': new Date(),
		'c:firstDate': new Date(new Date().getFullYear() - 100, 0, 1),
		'c:lastDate': new Date(new Date().getFullYear() + 100, 11, 31),
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
		'c:datetime': new Date(),
		'c:firstDate': new Date(new Date().getFullYear() - 100, 0, 1),
		'c:lastDate': new Date(new Date().getFullYear() + 100, 11, 31),
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