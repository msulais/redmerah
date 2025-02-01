import { Transition } from 'solid-transition-group'
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, mergeProps, Show, splitProps, Switch, type ParentComponent, type VoidComponent } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { get_current_date, date_year, date_month, date_weekday_names, date_out_range_YMD, is_same_date_YMD, date_month_names, date_out_range_YM, is_same_date_YM, date_out_range_Y, is_same_date_Y, date_text_month, date_in_range_YM, date_day, date_set_month, date_set_year, date_set_date, date_date, date_hour, date_set_hour, date_minute, date_set_minute } from '@/utils/datetime'
import { AnimationEffectTiming } from '@/enums/animation'
import { event_call, event_current_target, event_prevent_default, event_target } from '@/utils/event'
import { array_fill, array_includes, array_map } from '@/utils/array'
import { string_padstart, string_substring } from '@/utils/string'
import { element_animate, element_children, element_dataset, element_focus, element_focus_by_arrowkey, element_id, element_is_same_node, element_next_sibling, element_previous_sibling, element_set_tabindex, element_tagname, element_valid_target } from '@/utils/element'
import { promise_done } from '@/utils/object'
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from '@/constants/key_code'
import { number_parse, number_safe } from '@/utils/number'
import { timeout_set } from '@/utils/timeout'
import { document_active } from '@/utils/document'

import Button, { ButtonVariant, IconButton, SquareButton } from '@/components/Button'
import Dropdown, { DropdownOption } from '@/components/Dropdown'
import { Modal, type ModalProps, ModalPosition as DateTimePickerPosition, close_modal, focus_modal, open_modal, reposition_modal, is_modal_open } from '@/components/Modal'
import { MenuHeader } from '@/components/Menu'
import { close_popover, is_popover_open, open_popover, Popover, reposition_popover, type PopoverProps } from '@/components/Popover'
import Divider from '@/components/Divider'
import FocusableGroup from '@/components/FocusableGroup'
import './index.scss'

enum DatePickerOption {
	year,
	month,
	day
}

const DateTimePickerBody: ParentComponent<{
	close_signal: boolean
	datetime: Date
	first_date: Date
	last_date: Date
	locales?: Intl.LocalesArgument
	on_select_datetime?(value: Date): unknown
	on_close(): unknown
}> = props => {
	const option_day = DatePickerOption.day
	const option_month = DatePickerOption.month
	const option_year = DatePickerOption.year
	const button_cancel_id = createUniqueId()
	const button_select_id = createUniqueId()
	const button_option_id = createUniqueId()
	const button_selected_id = createUniqueId()
	const button_previous_id = createUniqueId()
	const button_next_id = createUniqueId()
	const [value, set_value] = createSignal<Date>(get_current_date())
	const [date_option, set_date_option] = createSignal<DatePickerOption>(option_day)
	const [view_date, set_view_date] = createSignal<Date>(get_current_date())
	const [start_day, set_start_day] = createSignal<number>(0)
	const [days_per_month, set_days_per_month] = createSignal<number>(31)
	const [is_time_pm_format, set_is_time_pm_format] = createSignal<boolean>(false)
	const is_time_am_format = createMemo(() => !is_time_pm_format())
	let div_month_ref: HTMLDivElement | undefined
	let div_date_ref: HTMLDivElement | undefined
	let div_year_ref: HTMLDivElement | undefined

	function update_date_view(): void {
		let days_per_month = 31 // reset to default
		set_start_day(date_day(new Date(date_year(view_date()), date_month(view_date()), 1)))

		// february
		if (date_month(view_date()) == 1) {
			days_per_month = 28
			if (date_year(view_date()) % 4 == 0) days_per_month = 29
		}

		// april, june, september, november
		else if (array_includes([3, 5, 8, 10], date_month(view_date()))) days_per_month = 30

		set_days_per_month(days_per_month)
	}

	function next(): void {
		const new_date = new Date(view_date())
		switch (date_option()) {
			case option_day: date_set_month(new_date, date_month(new_date) + 1); break
			case option_month: date_set_year(new_date, date_year(new_date) + 1); break
			case option_year: date_set_year(new_date, date_year(new_date) + 16); break
		}

		set_view_date(new_date)
		update_date_view()
	}

	function previous(): void {
		const new_date = new Date(view_date())
		switch (date_option()) {
			case option_day: date_set_month(new_date, date_month(new_date) - 1); break
			case option_month: date_set_year(new_date, date_year(new_date) - 1); break
			case option_year: date_set_year(new_date, date_year(new_date) - 16); break
		}

		set_view_date(new_date)
		update_date_view()
	}

	function goto_selected_datetime(): void {
		set_view_date(value())
		update_date_view()
	}

	createEffect(() => {
		props.close_signal // to trigger close signal
		set_date_option(option_day)
	})

	createEffect(() => {
		const datetime = props.datetime

		set_view_date(datetime)
		set_value(datetime)
	})

	const DaysDate: VoidComponent = () => {
		let is_button_focused = false

		createEffect(() => {
			days_per_month()

			const children = element_children<HTMLButtonElement>(div_date_ref!)
			is_button_focused = false
			for (const child of children) {
				if (element_tagname(child) != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div style="display: contents">
			<div class="c-datetime-picker-days-name">
				<For each={date_weekday_names(props.locales)}>{d => <p>{string_substring(d, 0, 3)}</p>}</For>
			</div>
			<div
				class="c-datetime-picker-days"
				ref={div_date_ref}
				onKeyDown={(ev) => {
					const code = ev.code
					if (
						code != KEY_ARROW_UP
						&& code != KEY_ARROW_DOWN
						&& code != KEY_ARROW_LEFT
						&& code != KEY_ARROW_RIGHT
					) return;

					const button = event_target(ev) as HTMLButtonElement
					const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
					const children = element_children<HTMLButtonElement>(event_current_target(ev))
					let target: HTMLElement | null = null

					if (code == KEY_ARROW_UP) target = children[start_day() + index - 7]
					else if (code == KEY_ARROW_DOWN) target = children[start_day() + index + 7]
					else if (code == KEY_ARROW_RIGHT) target = element_next_sibling(button)
					else if (code == KEY_ARROW_LEFT) target = element_previous_sibling(button)

					if (!target || (target as HTMLButtonElement).disabled || element_tagname(target) != 'BUTTON') return
					event_prevent_default(ev)
					element_set_tabindex(button, -1)
					element_set_tabindex(target, 0)
					element_focus(target)
				}}
				onFocusIn={(ev) => {
					if (is_button_focused) return

					const children = element_children<HTMLButtonElement>(event_current_target(ev))
					const button = event_target(ev) as HTMLButtonElement
					element_set_tabindex(button, 0)
					is_button_focused = true
					for (const child of children) {
						if (element_is_same_node(child, button)) continue
						if (element_tagname(child) != 'BUTTON') continue
						if (child.disabled) continue

						element_set_tabindex(child, -1)
					}
				}}
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
					const date = new Date(
						date_year(view_date()),
						date_month(view_date()),
						index + 1
					)
					const d = new Date(value())
					date_set_date(d, date_date(date))
					date_set_month(d, date_month(date))
					date_set_year(d, date_year(date))
					set_value(d)
				}}>
				<For each={array_fill(Array(start_day()), 0)}>{_v => <div/>}</For>
				<For each={array_fill(Array(days_per_month()), 0)}>{(_v, i) => {
					const date = createMemo(() => new Date(
						date_year(view_date()),
						date_month(view_date()),
						i() + 1
					))
					return (<SquareButton
						data-index={i()}
						disabled={date_out_range_YMD(date(), props.first_date, props.last_date)}
						c_variant={is_same_date_YMD(date(), value())
							? ButtonVariant.filled
							: is_same_date_YMD(date(), get_current_date())
								? ButtonVariant.outlined
								: undefined
						}>
						{ i() + 1 }
					</SquareButton>)
				}}</For>
			</div>
		</div>)
	}

	const MonthsDate: VoidComponent = () => {
		let is_button_focused = false

		createEffect(() => {
			view_date()

			const children = element_children<HTMLButtonElement>(div_month_ref!)
			is_button_focused = false
			for (const child of children) {
				if (element_tagname(child) != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div
			ref={div_month_ref}
			class="c-datetime-picker-month"
			onKeyDown={(ev) => {
				const code = ev.code
				if (
					code != KEY_ARROW_UP
					&& code != KEY_ARROW_DOWN
					&& code != KEY_ARROW_LEFT
					&& code != KEY_ARROW_RIGHT
				) return;

				const button = event_target(ev) as HTMLButtonElement
				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				const children = element_children<HTMLButtonElement>(event_current_target(ev))
				let target: HTMLElement | null = null

				if (code == KEY_ARROW_UP) target = children[index - 3]
				else if (code == KEY_ARROW_DOWN) target = children[index + 3]
				else if (code == KEY_ARROW_RIGHT) target = element_next_sibling(button)
				else if (code == KEY_ARROW_LEFT) target = element_previous_sibling(button)

				if (!target || (target as HTMLButtonElement).disabled) return
				event_prevent_default(ev)
				element_set_tabindex(button, -1)
				element_set_tabindex(target, 0)
				element_focus(target)
			}}
			onFocusIn={(ev) => {
				if (is_button_focused) return

				const children = element_children<HTMLButtonElement>(event_current_target(ev))
				const button = event_target(ev) as HTMLButtonElement
				element_set_tabindex(button, 0)
				is_button_focused = true
				for (const child of children) {
					if (element_is_same_node(child, button)) continue
					if (child.disabled) continue

					element_set_tabindex(child, -1)
				}
			}}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				set_view_date(new Date(date_year(view_date()), index))
				set_date_option(option_day)
				update_date_view()

				timeout_set(() => {
					const children = element_children<HTMLButtonElement>(div_date_ref!)
					for (const child of children) {
						if (element_tagname(child) != "BUTTON" || child.disabled) continue

						element_focus(child)
						break
					}
				})
			}}>
			<For each={date_month_names(props.locales)}>{(m, i) => {
				const date = createMemo(() => new Date(date_year(view_date()), i()))
				return (<Button
					data-index={i()}
					disabled={date_out_range_YM(date(), props.first_date, props.last_date)}
					c_variant={is_same_date_YM(date(), value())
						? ButtonVariant.filled
						: is_same_date_YM(date(), get_current_date())
							? ButtonVariant.outlined
							: undefined
					}>{m}</Button>)
			}}</For>
		</div>)
	}

	const YearsDate: VoidComponent = () => {
		let is_button_focused = false

		createEffect(() => {
			view_date()

			const children = element_children<HTMLButtonElement>(div_year_ref!)
			is_button_focused = false
			for (const child of children) {
				if (element_tagname(child) != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div
			class="c-datetime-picker-year"
			ref={div_year_ref}
			onKeyDown={(ev) => {
				const code = ev.code
				if (
					code != KEY_ARROW_UP
					&& code != KEY_ARROW_DOWN
					&& code != KEY_ARROW_LEFT
					&& code != KEY_ARROW_RIGHT
				) return;

				const button = event_target(ev) as HTMLButtonElement
				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				const children = element_children<HTMLButtonElement>(event_current_target(ev))
				let target: HTMLElement | null = null

				if (code == KEY_ARROW_UP) target = children[index - 4]
				else if (code == KEY_ARROW_DOWN) target = children[index + 4]
				else if (code == KEY_ARROW_RIGHT) target = element_next_sibling(button)
				else if (code == KEY_ARROW_LEFT) target = element_previous_sibling(button)

				if (!target || (target as HTMLButtonElement).disabled) return
				event_prevent_default(ev)
				element_set_tabindex(button, -1)
				element_set_tabindex(target, 0)
				element_focus(target)
			}}
			onFocusIn={(ev) => {
				if (is_button_focused) return

				const children = element_children<HTMLButtonElement>(event_current_target(ev))
				const button = event_target(ev) as HTMLButtonElement
				element_set_tabindex(button, 0)
				is_button_focused = true
				for (const child of children) {
					if (element_is_same_node(child, button)) continue
					if (child.disabled) continue

					element_set_tabindex(child, -1)
				}
			}}
			onClick={(ev) => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				let index: string | number | undefined = element_dataset(button, 'index')
				if (!index) return;

				index = number_safe(number_parse(index, true))
				set_view_date(new Date(date_year(view_date()) + index, 0))
				set_date_option(option_month)
				update_date_view()

				timeout_set(() => {
					const children = element_children<HTMLButtonElement>(div_month_ref!)
					for (const child of children) {
						if (element_tagname(child) != "BUTTON" || child.disabled) continue

						element_focus(child)
						break
					}
				})
			}}>
			<For each={array_fill(Array(16), 0)}>{(_v, i) => {
				const date = createMemo(() => new Date(date_year(view_date()) + i(), 0))
				return (<Button
					data-index={i()}
					disabled={date_out_range_Y(date(), props.first_date, props.last_date)}
					c_variant={is_same_date_Y(date(), value())
						? ButtonVariant.filled
						: is_same_date_Y(date(), get_current_date())
							? ButtonVariant.outlined
							: undefined
					}>
					{date_year(view_date()) + i()}
				</Button>)
			}}</For>
		</div>)
	}

	return (<>
		<div
			class="c-datetime-picker-header"
			onKeyDown={(ev) => element_focus_by_arrowkey(
				event_current_target(ev),
				ev.code,
				{ left: 'prev', right: 'next' }
			)}
			onClick={(ev) => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) === 'BUTTON')
				) return

				switch (element_id(button)) {
					case button_option_id:
						set_date_option(d => {
							if (d == option_month) return option_year
							return option_month
						})
						break
					case button_selected_id:
						const sibling = element_previous_sibling(button)!
						element_set_tabindex(sibling, 0)
						element_focus(sibling)
						goto_selected_datetime()
						break
					case button_previous_id:
						previous()
						break
					case button_next_id:
						next()
						break
				}
			}}>
			<Button
				tabindex="0"
				id={button_option_id}
				c_variant={ButtonVariant.tonal}>
				<Switch>
					<Match when={date_option() == option_day}>
						{date_text_month(view_date(), props.locales) + ' ' + date_year(view_date())}
					</Match>
					<Match when={date_option() == option_month}>
						{date_year(view_date())}
					</Match>
					<Match when={date_option() == option_year}>
						{date_year(view_date()) + '-' + (date_year(view_date()) + 15)}
					</Match>
				</Switch>
			</Button>
			<Show when={
				(
					(date_option() == option_day && !is_same_date_YM(view_date(), value()))
					|| (date_option() == option_month && !is_same_date_Y(view_date(), value()))
					|| (date_option() == option_year && date_out_range_Y(value(), view_date(), new Date(date_year(view_date()) + 15, 2, 3)))
				)
				&& date_in_range_YM(value(), props.first_date, props.last_date)}>
				<IconButton
					tabindex="-1"
					c_code={0xE2E6}
					id={button_selected_id}
				/>
			</Show>
			<IconButton
				tabindex="-1"
				c_code={0xE400}
				id={button_previous_id}
			/>
			<IconButton
				tabindex="-1"
				c_code={0xE402}
				id={button_next_id}
			/>
		</div>
		<Divider />
		<Transition
			onEnter={(el, done) => {
				promise_done(element_animate(
					el as HTMLElement,
					{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
					{ duration: 200, easing: AnimationEffectTiming.spring }
				).finished, done)
			}}
			onExit={(el, done) => {
				promise_done(element_animate(
					el as HTMLElement,
					{},
					{ duration: 0 }
				).finished, done)
			}}>
			<Switch>
				<Match when={date_option() == option_day}><DaysDate/></Match>
				<Match when={date_option() == option_month}><MonthsDate/></Match>
				<Match when={date_option() == option_year}><YearsDate/></Match>
			</Switch>
		</Transition>
		<FocusableGroup
			class="c-datetime-picker-time"
			c_arrow_options={{ left: 'prev', right: 'next' }}>
			<Dropdown
				c_label='Hour'
				c_values={[
					date_hour(value()) - (date_hour(value()) >= 12? 12 : 0)
				]}
				c_attr_menu={{style: {
					"max-height": '192px'
				}}}
				c_on_change={(options) =>
					set_value(v => (date_set_hour(v, options[0].value as number + (is_time_pm_format()? 12 : 0)), v))
				}>
				<MenuHeader>Hour</MenuHeader>
				<For each={[
					[0, '00'],
					...array_map(
						array_fill(new Array(11), 1),
						(_v, i) => [i+1, string_padstart(`${i+1}`, 2, '0')]
					),
				]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string}/>}</For>
			</Dropdown>
			<Dropdown
				c_values={[date_minute(value())]}
				c_label='Minute'
				c_attr_menu={{style: {
					"max-height": '192px'
				}}}
				c_on_change={(options) => set_value(v => (date_set_minute(v, options[0].value as number), v))}>
				<MenuHeader>Minute</MenuHeader>
				<For each={array_map(
					array_fill(new Array(60), 1),
					(_, i) => [i, string_padstart(`${i}`, 2, '0')]
				)}>{option =>
					<DropdownOption c_value={option[0]} c_text={option[1] as string}/>
				}</For>
			</Dropdown>
			<Dropdown
				c_values={[date_hour(value()) >= 12? 'PM' : 'AM']}
				c_on_change={(options) => {
					const hour = date_hour(value())
					const $value = options[0].value
					let $hour = hour

					// from AM to PM
					if (
						is_time_am_format()
						&& $value == 'PM'
						&& $hour <= 12
					) $hour += 12

					// from PM to AM
					else if (
						is_time_pm_format()
						&& $value == 'AM'
						&& $hour >= 12
					) $hour -= 12

					if (hour != $hour) set_value(v => (date_set_hour(v, $hour), v))

					set_is_time_pm_format($value == 'PM')
				}}>
				<MenuHeader>Format</MenuHeader>
				<For each={[['AM', 'AM'], ['PM', 'PM']]}>{option =>
					<DropdownOption c_value={option[0]} c_text={option[1] as string}/>
				}</For>
			</Dropdown>
		</FocusableGroup>
		{props.children}
		<FocusableGroup
			class="c-datetime-picker-actions"
			c_arrow_options={{ left: 'prev', right: 'next' }}
			onClick={(ev) => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_cancel_id:
						props.on_close()
						break
					case button_select_id:
						props.on_select_datetime?.(value())
						props.on_close()
						break
				}
			}}>
			<Button
				id={button_cancel_id}
				c_variant={ButtonVariant.tonal}>
				Cancel
			</Button>
			<Button
				id={button_select_id}
				c_variant={ButtonVariant.filled}>
				Select
			</Button>
		</FocusableGroup>
	</>)
}

type DateTimePickerProps = ModalProps & {
	c_datetime?: Date
	c_first_date?: Date
	c_last_date?: Date
	c_locales?: Intl.LocalesArgument
	c_on_selectdatetime?(value: Date): unknown
}

const DateTimePicker: VoidComponent<DateTimePickerProps> = ($props) => {
	const $$props = mergeProps({
		c_locales:'en-US',
		c_datetime: get_current_date(),
		c_first_date: new Date(date_year() - 100, 0, 1),
		c_last_date: new Date(date_year() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c_datetime', 'c_on_selectdatetime',
		'c_first_date', 'c_last_date', 'c_locales',
		'children', 'classList', 'onClose'
	])
	const [close_signal, set_close_signal] = createSignal<boolean>(false)
	let datetimepicker_ref: HTMLDialogElement

	return (<Modal
		ref={mergeRefs(props.ref, r => datetimepicker_ref = r)}
		classList={{
			'c-datetime-picker': true,
			...props.classList
		}}
		onClose={(ev) => {
			event_call(ev, props.onClose)
			set_close_signal(s => !s)
		}}
		{...other}>
		<DateTimePickerBody
			close_signal={close_signal()}
			datetime={props.c_datetime}
			first_date={props.c_first_date}
			last_date={props.c_last_date}
			on_close={() => close_modal(datetimepicker_ref)}
			locales={props.c_locales}
			on_select_datetime={props.c_on_selectdatetime}>
			{props.children}
		</DateTimePickerBody>
	</Modal>)
}

type PopoverDateTimePickerProps = PopoverProps & {
	c_datetime?: Date
	c_first_date?: Date
	c_last_date?: Date
	c_locales?: Intl.LocalesArgument
	c_on_selectdatetime?(value: Date): unknown
}

const PopoverDateTimePicker: VoidComponent<PopoverDateTimePickerProps> = ($props) => {
	const $$props = mergeProps({
		c_locales:'en-US',
		c_datetime: get_current_date(),
		c_first_date: new Date(date_year() - 100, 0, 1),
		c_last_date: new Date(date_year() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'c_datetime', 'c_on_selectdatetime',
		'c_first_date', 'c_last_date', 'c_locales',
		'children', 'classList', 'c_on_toggleopen'
	])
	const [close_signal, set_close_signal] = createSignal<boolean>(false)
	let datetimepicker_ref: HTMLDivElement

	return (<Popover
		ref={mergeRefs(props.ref, r => datetimepicker_ref = r)}
		classList={{
			'c-datetime-picker': true,
			...props.classList
		}}
		c_on_toggleopen={is_open => {
			props.c_on_toggleopen?.(is_open)
			if (!is_open) set_close_signal(s => !s)
		}}
		{...other}>
		<DateTimePickerBody
			close_signal={close_signal()}
			datetime={props.c_datetime}
			first_date={props.c_first_date}
			last_date={props.c_last_date}
			on_close={() => close_popover(datetimepicker_ref)}
			locales={props.c_locales}
			on_select_datetime={props.c_on_selectdatetime}>
			{props.children}
		</DateTimePickerBody>
	</Popover>)
}


export {
	DateTimePicker,
	PopoverDateTimePicker,
	is_modal_open as is_datetimepicker_open,
	focus_modal as focus_datetimepicker,
	open_modal as open_datetimepicker,
	close_modal as close_datetimepicker,
	reposition_modal as reposition_datetimepicker,
	is_popover_open as is_popoverdatetimepicker_open,
	open_popover as open_popoverdatetimepicker,
	close_popover as close_popoverdatetimepicker,
	reposition_popover as reposition_popoverdatetimepicker,
	DateTimePickerPosition
}
export type {
	DateTimePickerProps,
	PopoverDateTimePickerProps
}
export default DateTimePicker