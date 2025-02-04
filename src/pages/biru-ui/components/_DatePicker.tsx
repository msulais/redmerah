import { For, Show, type VoidComponent, createSignal } from "solid-js"

import { date_year, date_text_YMD } from "@/utils/datetime"
import { event_current_target } from "@/utils/event"
import { ICON_CALENDAR } from "@/constants/icons"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import DatePicker, { open_datepicker } from "@/components/DatePicker"
import TextField, { TextFieldButton } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [first_date, set_first_date] = createSignal<Date>(new Date(date_year() - 100, 0, 1))
	const [last_date, set_last_date] = createSignal<Date>(new Date(date_year() + 100, 11, 31))
	const [date, set_date] = createSignal<Date | null>(null)
	const [locale, set_locale] = createSignal<Intl.LocalesArgument>('en-US')
	const [is_datepicker_open, set_is_datepicker_open] = createSignal<boolean>(false)
	const [is_datepicker_firstdate_open, set_is_datepicker_firstdate_open] = createSignal<boolean>(false)
	const [is_datepicker_lastdate_open, set_is_datepicker_lastdate_open] = createSignal<boolean>(false)
	let datepicker_ref: HTMLDialogElement
	let datepicker_firstdate_ref: HTMLDialogElement
	let datepicker_lastdate_ref: HTMLDialogElement

	return (<Page
		title="DatePicker"
		description="A DatePicker is a UI element that allows users to select a specific date. It typically presents a calendar interface for easy navigation and selection.">
		<Playground>
			<Button
				c_focused={is_datepicker_open()}
				c_variant={ButtonVariant.tonal}
				onClick={(ev) => open_datepicker(ev, datepicker_ref, {
					anchor: event_current_target(ev),
					gap: 8
				})}>
				<Icon c_code={ICON_CALENDAR}/>
				<Show when={date() != null} fallback="Select date">
					{date_text_YMD(date()!, locale())}
				</Show>
			</Button>
			<DatePicker
				c_first_date={first_date()}
				c_on_toggleopen={o => set_is_datepicker_open(o)}
				c_last_date={last_date()}
				c_date={date() ?? undefined}
				c_locales={locale()}
				c_on_selectdate={(d) => set_date(d)}
				ref={r => datepicker_ref = r}
			/>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c_label="Locale"
					c_on_change={(items) => set_locale(items[0].value as Intl.LocalesArgument)}
					c_values={[locale() as string]}>
					<For each={[
						['en-US', 'English (US)'],
						['es-ES', 'Spanish'],
						['fr-FR', 'French'],
						['de-DE', 'German'],
						['ja-JP', 'Japanese'],
						['id-ID', 'Indonesia'],
						['pt-BR', 'Portuguese'],
						['ru-RU', 'Russian'],
						['ar-SA', 'Arabic'],
						['ko-KR', 'Korean'],
					]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
				</Dropdown>
				<TextField
					style={{width: '164px'}}
					c_label={'First date'}
					readOnly
					value={date_text_YMD(first_date(), locale())}
					c_trailing={<Tooltip>
						<TextFieldButton
							data-tooltip="Select first date"
							c_focused={is_datepicker_firstdate_open()}
							onClick={(ev) => open_datepicker(
								ev,
								datepicker_firstdate_ref,
								{ anchor: event_current_target(ev) }
							)}>
							<Icon c_code={ICON_CALENDAR}/>
						</TextFieldButton>
					</Tooltip>}
				/>
				<DatePicker
					c_on_toggleopen={o => set_is_datepicker_firstdate_open(o)}
					c_last_date={date() ?? new Date()}
					c_first_date={new Date(date_year(date() ?? new Date()) - 1000, 0, 1)}
					c_date={first_date()}
					c_locales={locale()}
					c_on_selectdate={(d) => set_first_date(d)}
					ref={r => datepicker_firstdate_ref = r}
				/>

				<TextField
					style={{width: '164px'}}
					c_label={'Last date'}
					readOnly
					value={date_text_YMD(last_date(), locale())}
					c_trailing={<Tooltip>
						<TextFieldButton
							data-tooltip="Select last date"
							c_focused={is_datepicker_lastdate_open()}
							onClick={(ev) => open_datepicker(
								ev,
								datepicker_lastdate_ref,
								{ anchor: event_current_target(ev) }
							)}>
							<Icon c_code={ICON_CALENDAR}/>
						</TextFieldButton>
					</Tooltip>}
				/>
				<DatePicker
					c_first_date={date() ?? new Date()}
					c_on_toggleopen={o => set_is_datepicker_lastdate_open(o)}
					c_last_date={new Date(date_year(date() ?? new Date()) + 1000, 11, 31)}
					c_date={last_date()}
					c_locales={locale()}
					c_on_selectdate={(d) => set_last_date(d)}
					ref={r => datepicker_lastdate_ref = r}
				/>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _