import { For, Show, type VoidComponent, createSignal } from "solid-js"

import { date_year, date_text_YMD } from "@/utils/datetime"

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
				focused={is_datepicker_open()}
				variant={ButtonVariant.tonal}
				onClick={(ev) => open_datepicker(ev, datepicker_ref, {
					anchor: ev.currentTarget,
					gap: 8
				})}>
				<Icon code={0xE2CC}/>
				<Show when={date() != null} fallback="Select date">
					{date_text_YMD(date()!, locale())}
				</Show>
			</Button>
			<DatePicker
				first_date={first_date()}
				on_toggle_open={o => set_is_datepicker_open(o)}
				last_date={last_date()}
				date={date() ?? undefined}
				locales={locale()}
				on_select_date={(d) => set_date(d)}
				ref={r => datepicker_ref = r}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Locale"
				on_change_options={(items) => set_locale(items[0].value as Intl.LocalesArgument)}
				values={[locale() as string]}>
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
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<TextField
				style={{width: '164px'}}
				label={'First date'}
				readOnly
				value={date_text_YMD(first_date(), locale())}
				trailing={<>
					<Tooltip text="Select first date">
						<TextFieldButton
							focused={is_datepicker_firstdate_open()}
							onClick={(ev) => open_datepicker(
								ev,
								datepicker_firstdate_ref,
								{ anchor: ev.currentTarget }
							)}>
							<Icon code={0xE2CC}/>
						</TextFieldButton>
					</Tooltip>
				</>}
			/>
			<DatePicker
				on_toggle_open={o => set_is_datepicker_firstdate_open(o)}
				last_date={date() ?? new Date()}
				first_date={new Date(date_year(date() ?? new Date()) - 1000, 0, 1)}
				date={first_date()}
				locales={locale()}
				on_select_date={(d) => set_first_date(d)}
				ref={r => datepicker_firstdate_ref = r}
			/>

			<TextField
				style={{width: '164px'}}
				label={'Last date'}
				readOnly
				value={date_text_YMD(last_date(), locale())}
				trailing={<>
					<Tooltip text="Select last date">
						<TextFieldButton
							focused={is_datepicker_lastdate_open()}
							onClick={(ev) => open_datepicker(
								ev,
								datepicker_lastdate_ref,
								{ anchor: ev.currentTarget }
							)}>
							<Icon code={0xE2CC}/>
						</TextFieldButton>
					</Tooltip>
				</>}
			/>
			<DatePicker
				first_date={date() ?? new Date()}
				on_toggle_open={o => set_is_datepicker_lastdate_open(o)}
				last_date={new Date(date_year(date() ?? new Date()) + 1000, 11, 31)}
				date={last_date()}
				locales={locale()}
				on_select_date={(d) => set_last_date(d)}
				ref={r => datepicker_lastdate_ref = r}
			/>
		</PlaygroundOptions>
	</Page>)
}

export default _