import { For, Show, type VoidComponent, createSignal } from "solid-js"

import { dateYear, dateTextYMD } from "@/utils/datetime"
import { eventCurrentTarget } from "@/utils/event"
import { ICON_CALENDAR } from "@/constants/icons"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import DatePicker, { openDatePicker } from "@/components/DatePicker"
import TextField, { TextFieldButton } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [firstDate, setFirstDate] = createSignal<Date>(new Date(dateYear() - 100, 0, 1))
	const [lastDate, setLastDate] = createSignal<Date>(new Date(dateYear() + 100, 11, 31))
	const [date, setDate] = createSignal<Date | null>(null)
	const [locale, setLocale] = createSignal<Intl.LocalesArgument>('en-US')
	const [isDatePickerOpen, setIsDatePickerOpen] = createSignal<boolean>(false)
	const [isDatePickerFirstDateOpen, setIsDatePickerFirstDateOpen] = createSignal<boolean>(false)
	const [isDatePickerLastDateOpen, setIsDatePickerLastDateOpen] = createSignal<boolean>(false)
	let datePickerRef: HTMLDialogElement
	let datePickerFirstDateRef: HTMLDialogElement
	let datePickerLastDateRef: HTMLDialogElement

	return (<Page
		title="DatePicker"
		description="A DatePicker is a UI element that allows users to select a specific date. It typically presents a calendar interface for easy navigation and selection.">
		<Playground>
			<Button
				c:focused={isDatePickerOpen()}
				c:variant={ButtonVariant.tonal}
				onClick={(ev) => openDatePicker(ev, datePickerRef, {
					anchor: eventCurrentTarget(ev),
					gap: 8
				})}>
				<Icon c:code={ICON_CALENDAR}/>
				<Show when={date() != null} fallback="Select date">
					{dateTextYMD(date()!, locale())}
				</Show>
			</Button>
			<DatePicker
				c:firstDate={firstDate()}
				c:onToggleOpen={o => setIsDatePickerOpen(o)}
				c:lastDate={lastDate()}
				c:date={date() ?? undefined}
				c:locales={locale()}
				c:onSelectDate={(d) => setDate(d)}
				ref={r => datePickerRef = r}
			/>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Locale"
					c:onChange={(items) => setLocale(items[0].value as Intl.LocalesArgument)}
					c:values={[locale() as string]}>
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
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<TextField
					style={{width: '164px'}}
					c:label={'First date'}
					readOnly
					value={dateTextYMD(firstDate(), locale())}
					c:trailing={<Tooltip>
						<TextFieldButton
							data-tooltip="Select first date"
							c:focused={isDatePickerFirstDateOpen()}
							onClick={(ev) => openDatePicker(
								ev,
								datePickerFirstDateRef,
								{ anchor: eventCurrentTarget(ev) }
							)}>
							<Icon c:code={ICON_CALENDAR}/>
						</TextFieldButton>
					</Tooltip>}
				/>
				<DatePicker
					c:onToggleOpen={o => setIsDatePickerFirstDateOpen(o)}
					c:lastDate={date() ?? new Date()}
					c:firstDate={new Date(dateYear(date() ?? new Date()) - 1000, 0, 1)}
					c:date={firstDate()}
					c:locales={locale()}
					c:onSelectDate={(d) => setFirstDate(d)}
					ref={r => datePickerFirstDateRef = r}
				/>

				<TextField
					style={{width: '164px'}}
					c:label={'Last date'}
					readOnly
					value={dateTextYMD(lastDate(), locale())}
					c:trailing={<Tooltip>
						<TextFieldButton
							data-tooltip="Select last date"
							c:focused={isDatePickerLastDateOpen()}
							onClick={(ev) => openDatePicker(
								ev,
								datePickerLastDateRef,
								{ anchor: eventCurrentTarget(ev) }
							)}>
							<Icon c:code={ICON_CALENDAR}/>
						</TextFieldButton>
					</Tooltip>}
				/>
				<DatePicker
					c:firstDate={date() ?? new Date()}
					c:onToggleOpen={o => setIsDatePickerLastDateOpen(o)}
					c:lastDate={new Date(dateYear(date() ?? new Date()) + 1000, 11, 31)}
					c:date={lastDate()}
					c:locales={locale()}
					c:onSelectDate={(d) => setLastDate(d)}
					ref={r => datePickerLastDateRef = r}
				/>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _