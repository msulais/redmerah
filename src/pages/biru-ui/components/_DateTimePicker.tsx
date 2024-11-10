import { For, Show, type VoidComponent, createSignal } from "solid-js"

import { getDate_Y, getDateString_YMD, getDateString_YMD_HM } from "@/utils/datetime"
import { _tonal, _currentTarget, _value } from "@/constants/string"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import TextField, { TextFieldButton } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import DatePicker, { openDatePicker } from "@/components/DatePicker"
import DateTimePicker from "@/components/DateTimePicker"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [firstDate, setFirstDate] = createSignal<Date>(new Date(getDate_Y() - 100, 0, 1))
	const [lastDate, setLastDate] = createSignal<Date>(new Date(getDate_Y() + 100, 11, 31))
	const [date, setDate] = createSignal<Date | null>(null)
	const [locale, setLocale] = createSignal<Intl.LocalesArgument>('en-US')
	const [is_dateTimePicker_open, setIs_dateTimePicker_open] = createSignal<boolean>(false)
	const [is_datePicker_firstDate_open, setIs_datePicker_firstDate_open] = createSignal<boolean>(false)
	const [is_datePicker_lastDate_open, setIs_datePicker_lastDate_open] = createSignal<boolean>(false)
	let datePicker_ref: HTMLDialogElement
	let datePicker_firstDate_ref: HTMLDialogElement
	let datePicker_lastDate_ref: HTMLDialogElement

	return (<Page
		title="DateTimePicker"
		description="A DateTimePicker is a UI element that allows users to select both a date and time. It combines the functionality of a DatePicker and a TimePicker into a single component.">
		<Playground>
			<Button
				focused={is_dateTimePicker_open()}
				variant={ButtonVariant[_tonal]}
				onClick={(ev) => openDatePicker(ev, datePicker_ref, {
					anchor: ev[_currentTarget],
					gap: 8
				})}>
				<Icon code={0xE2CC}/>
				<Show when={date() != null} fallback="Select datetime">
					{getDateString_YMD_HM(date()!, locale())}
				</Show>
			</Button>
			<DateTimePicker
				firstDate={firstDate()}
				onToggleOpen={o => setIs_dateTimePicker_open(o)}
				lastDate={lastDate()}
				datetime={date() ?? undefined}
				locales={locale()}
				onSelectDateTime={(d) => setDate(d)}
				ref={r => datePicker_ref = r}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Locale"
				onChangeOptions={(items) => setLocale(items[0][_value] as Intl.LocalesArgument)}
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
				value={getDateString_YMD(firstDate(), locale())}
				trailing={<>
					<Tooltip text="Select first date">
						<TextFieldButton
							focused={is_datePicker_firstDate_open()}
							onClick={(ev) => openDatePicker(ev, datePicker_firstDate_ref, { anchor: ev[_currentTarget] })}>
							<Icon code={0xE2CC}/>
						</TextFieldButton>
					</Tooltip>
				</>}
			/>
			<DatePicker
				onToggleOpen={o => setIs_datePicker_firstDate_open(o)}
				lastDate={date() ?? new Date()}
				firstDate={new Date(getDate_Y(date() ?? new Date()) - 1000, 0, 1)}
				date={firstDate()}
				locales={locale()}
				onSelectDate={(d) => setFirstDate(d)}
				ref={r => datePicker_firstDate_ref = r}
			/>

			<TextField
				style={{width: '164px'}}
				label={'Last date'}
				readOnly
				value={getDateString_YMD(lastDate(), locale())}
				trailing={<>
					<Tooltip text="Select last date">
						<TextFieldButton
							focused={is_datePicker_lastDate_open()}
							onClick={(ev) => openDatePicker(
								ev,
								datePicker_lastDate_ref,
								{ anchor: ev[_currentTarget] }
							)}>
							<Icon code={0xE2CC}/>
						</TextFieldButton>
					</Tooltip>
				</>}
			/>
			<DatePicker
				firstDate={date() ?? new Date()}
				onToggleOpen={o => setIs_datePicker_lastDate_open(o)}
				lastDate={new Date(getDate_Y(date() ?? new Date()) + 1000, 11, 31)}
				date={lastDate()}
				locales={locale()}
				onSelectDate={(d) => setLastDate(d)}
				ref={r => datePicker_lastDate_ref = r}
			/>
		</PlaygroundOptions>
	</Page>)
}

export default _