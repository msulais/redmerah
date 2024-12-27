import { Transition } from "solid-transition-group"
import { For, Match, Show, Switch, createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps, type ParentComponent, type VoidComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { get_current_date, date_year, date_month, date_weekday_names, date_out_range_YMD, is_same_date_YMD, date_month_names, date_out_range_YM, is_same_date_YM, date_out_range_Y, is_same_date_Y, date_text_month, date_in_range_YM, date_day, date_set_month, date_set_year, date_date, date_set_date } from "@/utils/datetime"
import { AnimationEffectTiming } from "@/enums/animation"
import { call_event_handler } from "@/utils/event"
import { array_fill, array_includes } from "@/utils/array"
import { string_substring } from "@/utils/string"
import { element_animate, element_children, element_dataset, element_focus, element_focus_by_arrowkey, element_is_same_node, element_next_sibling, element_previous_sibling, element_set_tabindex } from "@/utils/element"
import { promise_done } from "@/utils/object"
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from "@/constants/key_code"
import { number_parse, number_safe } from "@/utils/number"
import { timeout_set } from "@/utils/timeout"

import Button, { ButtonVariant, IconButton, SquareButton } from "@/components/Button"
import { Modal, type ModalProps, ModalPosition as DatePickerPosition, close_modal, focus_modal, open_modal, reposition_modal, is_modal_open } from "@/components/Modal"
import Divider from "@/components/Divider"
import Popover, { close_popover, is_popover_open, open_popover, reposition_popover, type PopoverProps } from "@/components/Popover"
import './index.scss'

enum DatePickerOption {
	year,
	month,
	day
}

const DatePickerBody: ParentComponent<{
	close_signal: boolean
	date: Date
	first_date: Date
	last_date: Date
	locales?: Intl.LocalesArgument
	on_select_date?(value: Date): unknown
	on_close(): unknown
}> = props => {
	const option_day = DatePickerOption.day
	const option_month = DatePickerOption.month
	const option_year = DatePickerOption.year
	const button_option_id = createUniqueId()
	const button_selected_id = createUniqueId()
	const button_previous_id = createUniqueId()
	const button_next_id = createUniqueId()
	const [value, set_value] = createSignal<Date>(get_current_date())
	const [date_option, set_date_option] = createSignal<DatePickerOption>(option_day)
	const [view_date, set_view_date] = createSignal<Date>(get_current_date())
	const [start_day, set_start_day] = createSignal<number>(0)
	const [days_per_month, set_days_per_month] = createSignal<number>(31)
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

	function goto_selected_date(): void {
		set_view_date(value())
		update_date_view()
	}

	createEffect(() => {
		props.close_signal // to trigger close signal
		set_date_option(option_day)
	})

	createEffect(() => {
		const date = props.date

		set_view_date(date)
		set_value(date)
	})

	const DaysDate: VoidComponent = () => {
		let is_button_focused = false

		createEffect(() => {
			days_per_month()

			const children = element_children<HTMLButtonElement>(div_date_ref!)
			is_button_focused = false
			for (const child of children) {
				if (child.tagName != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div style="display: contents">
			<div class="c-date-picker-days-name">
				<For each={date_weekday_names(props.locales)}>{d => <p>{string_substring(d, 0, 3)}</p>}</For>
			</div>
			<div
				class="c-date-picker-days"
				ref={div_date_ref}
				onKeyDown={(ev) => {
					const code = ev.code
					if (
						code != ARROW_UP
						&& code != ARROW_DOWN
						&& code != ARROW_LEFT
						&& code != ARROW_RIGHT
					) return;

					const button = ev.target as HTMLButtonElement
					const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
					const children = element_children<HTMLButtonElement>(ev.currentTarget)
					let target: HTMLElement | null = null

					if (code == ARROW_UP) target = children[start_day() + index - 7]
					else if (code == ARROW_DOWN) target = children[start_day() + index + 7]
					else if (code == ARROW_RIGHT) target = element_next_sibling(button)
					else if (code == ARROW_LEFT) target = element_previous_sibling(button)

					if (!target || (target as HTMLButtonElement).disabled || target.tagName != 'BUTTON') return
					element_set_tabindex(button, -1)
					element_set_tabindex(target, 0)
					element_focus(target)
				}}
				onFocusIn={(ev) => {
					if (is_button_focused) return

					const children = element_children<HTMLButtonElement>(ev.currentTarget)
					const button = ev.target as HTMLButtonElement
					element_set_tabindex(button, 0)
					is_button_focused = true
					for (const child of children) {
						if (element_is_same_node(child, button)) continue
						if (child.tagName != 'BUTTON') continue
						if (child.disabled) continue

						element_set_tabindex(child, -1)
					}
				}}
				onClick={(ev) => {
					const button = ev.target as HTMLButtonElement
					if (button.tagName != 'BUTTON' || button.disabled) return

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
					props.on_select_date?.(value())
					props.on_close()
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
						variant={is_same_date_YMD(date(), value())
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
				if (child.tagName != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div
			ref={div_month_ref}
			class="c-date-picker-month"
			onKeyDown={(ev) => {
				const code = ev.code
				if (
					code != ARROW_UP
					&& code != ARROW_DOWN
					&& code != ARROW_LEFT
					&& code != ARROW_RIGHT
				) return;

				const button = ev.target as HTMLButtonElement
				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				const children = element_children<HTMLButtonElement>(ev.currentTarget)
				let target: HTMLElement | null = null

				if (code == ARROW_UP) target = children[index - 3]
				else if (code == ARROW_DOWN) target = children[index + 3]
				else if (code == ARROW_RIGHT) target = element_next_sibling(button)
				else if (code == ARROW_LEFT) target = element_previous_sibling(button)

				if (!target || (target as HTMLButtonElement).disabled) return
				element_set_tabindex(button, -1)
				element_set_tabindex(target, 0)
				element_focus(target)
			}}
			onFocusIn={(ev) => {
				if (is_button_focused) return

				const children = element_children<HTMLButtonElement>(ev.currentTarget)
				const button = ev.target as HTMLButtonElement
				element_set_tabindex(button, 0)
				is_button_focused = true
				for (const child of children) {
					if (element_is_same_node(child, button)) continue
					if (child.disabled) continue

					element_set_tabindex(child, -1)
				}
			}}
			onClick={ev => {
				const button = ev.target as HTMLButtonElement
				if (button.tagName != 'BUTTON' || button.disabled) return;

				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				set_view_date(new Date(date_year(view_date()), index))
				set_date_option(option_day)
				update_date_view()

				timeout_set(() => {
					const children = element_children<HTMLButtonElement>(div_date_ref!)
					for (const child of children) {
						if (child.tagName != "BUTTON" || child.disabled) continue

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
					variant={is_same_date_YM(date(), value())
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
				if (child.tagName != 'BUTTON') continue
				if (child.disabled) continue

				element_set_tabindex(child, 0)
			}
		})

		return (<div
			class="c-date-picker-year"
			ref={div_year_ref}
			onKeyDown={(ev) => {
				const code = ev.code
				if (
					code != ARROW_UP
					&& code != ARROW_DOWN
					&& code != ARROW_LEFT
					&& code != ARROW_RIGHT
				) return;

				const button = ev.target as HTMLButtonElement
				const index = number_safe(number_parse(element_dataset(button, 'index')!, true))
				const children = element_children<HTMLButtonElement>(ev.currentTarget)
				let target: HTMLElement | null = null

				if (code == ARROW_UP) target = children[index - 4]
				else if (code == ARROW_DOWN) target = children[index + 4]
				else if (code == ARROW_RIGHT) target = element_next_sibling(button)
				else if (code == ARROW_LEFT) target = element_previous_sibling(button)

				if (!target || (target as HTMLButtonElement).disabled) return
				element_set_tabindex(button, -1)
				element_set_tabindex(target, 0)
				element_focus(target)
			}}
			onFocusIn={(ev) => {
				if (is_button_focused) return

				const children = element_children<HTMLButtonElement>(ev.currentTarget)
				const button = ev.target as HTMLButtonElement
				element_set_tabindex(button, 0)
				is_button_focused = true
				for (const child of children) {
					if (element_is_same_node(child, button)) continue
					if (child.disabled) continue

					element_set_tabindex(child, -1)
				}
			}}
			onClick={(ev) => {
				const button = ev.target as HTMLButtonElement
				if (button.tagName != 'BUTTON' || button.disabled) return;

				let index: string | number | undefined = element_dataset(button, 'index')
				if (!index) return;

				index = number_safe(number_parse(index, true))
				set_view_date(new Date(date_year(view_date()) + index, 0))
				set_date_option(option_month)
				update_date_view()

				timeout_set(() => {
					const children = element_children<HTMLButtonElement>(div_month_ref!)
					for (const child of children) {
						if (child.tagName != "BUTTON" || child.disabled) continue

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
					variant={is_same_date_Y(date(), value())
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
			class="c-date-picker-header"
			onKeyDown={(ev) => element_focus_by_arrowkey(
				ev.currentTarget,
				ev.code,
				{ left: 'prev', right: 'next' }
			)}
			onClick={(ev) => {
				const button = ev.target as HTMLButtonElement
				if (button.tagName != 'BUTTON') return;

				switch (button.id) {
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
						goto_selected_date()
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
				variant={ButtonVariant.tonal}>
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
					code={0xE2E6}
					id={button_selected_id}
				/>
			</Show>
			<IconButton
				tabindex="-1"
				code={0xE400}
				id={button_previous_id}
			/>
			<IconButton
				tabindex="-1"
				code={0xE402}
				id={button_next_id}
			/>
		</div>
		<Divider />
		<Transition
			onEnter={(el, done) => {
				promise_done(element_animate(
					el as HTMLElement,
					{ opacity: [0, 1], transform: ['translateY(-12px)', 'none'] },
					{ duration: 300, easing: AnimationEffectTiming.spring }
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
		{props.children}
	</>)
}

type DatePickerProps = ModalProps & {
	date?: Date
	first_date?: Date
	last_date?: Date
	locales?: Intl.LocalesArgument
	on_select_date?(value: Date): unknown
}

const DatePicker: VoidComponent<DatePickerProps> = ($props) => {
	const $$props = mergeProps({
		locales:'en-US',
		date: get_current_date(),
		first_date: new Date(date_year() - 100, 0, 1),
		last_date: new Date(date_year() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'date', 'on_select_date',
		'first_date', 'last_date', 'locales',
		'classList', 'children', 'onClose'
	])
	const [close_signal, set_close_signal] = createSignal<boolean>(false)
	let datepicker_ref: HTMLDialogElement

	return (<Modal
		ref={mergeRefs(props.ref, r => datepicker_ref = r)}
		classList={{
			'c-date-picker': true,
			...props.classList
		}}
		onClose={(ev) => {
			set_close_signal(s => !s)
			call_event_handler(ev, props.onClose)
		}}
		{...other}>
		<DatePickerBody
			close_signal={close_signal()}
			date={props.date}
			first_date={props.first_date}
			last_date={props.last_date}
			on_close={() => close_modal(datepicker_ref)}
			locales={props.locales}
			on_select_date={props.on_select_date}>
			{props.children}
		</DatePickerBody>
	</Modal>)
}

type PopoverDatePickerProps = PopoverProps & {
	date?: Date
	first_date?: Date
	last_date?: Date
	locales?: Intl.LocalesArgument
	on_select_date?(value: Date): unknown
}

const PopoverDatePicker: VoidComponent<PopoverDatePickerProps> = ($props) => {
	const $$props = mergeProps({
		locales:'en-US',
		date: get_current_date(),
		first_date: new Date(date_year() - 100, 0, 1),
		last_date: new Date(date_year() + 100, 11, 31),
	}, $props)
	const [props, other] = splitProps($$props, [
		'ref', 'date', 'on_select_date',
		'first_date', 'last_date', 'locales',
		'children', 'classList', 'on_toggle_open'
	])
	const [close_signal, set_close_signal] = createSignal<boolean>(false)
	let datepicker_ref: HTMLDivElement

	return (<Popover
		ref={mergeRefs(props.ref, r => datepicker_ref = r)}
		classList={{
			'c-date-picker': true,
			...props.classList
		}}
		on_toggle_open={is_open => {
			props.on_toggle_open?.(is_open)
			if (!is_open) set_close_signal(s => !s)
		}}
		{...other}>
		<DatePickerBody
			close_signal={close_signal()}
			date={props.date}
			first_date={props.first_date}
			last_date={props.last_date}
			on_close={() => close_popover(datepicker_ref)}
			locales={props.locales}
			on_select_date={props.on_select_date}>
			{props.children}
		</DatePickerBody>
	</Popover>)
}

export {
	DatePicker,
	PopoverDatePicker,
	is_modal_open as is_datepicker_open,
	focus_modal as focus_datepicker,
	open_modal as open_datepicker,
	close_modal as close_datepicker,
	reposition_modal as reposition_datepicker,
	is_popover_open as is_popoverdatepicker_open,
	open_popover as open_popoverdatepicker,
	close_popover as close_popoverdatepicker,
	reposition_popover as reposition_popoverdatepicker,
	DatePickerPosition
}
export type {
	DatePickerProps,
	PopoverDatePickerProps
}
export default DatePicker