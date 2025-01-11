import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import TextField, { AreaTextField, NumberTextField, TextFieldButton } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [leading, set_leading] = createSignal<boolean>(false)
	const [trailing, set_trailing] = createSignal<boolean>(false)
	const [label, set_label] = createSignal<boolean>(true)
	const [placeholder, set_placeholder] = createSignal<boolean>(false)
	const [message, set_message] = createSignal<boolean>(false)
	const [autohide_label, set_autohide_label] = createSignal<boolean>(true)
	const [autoshow_clear_button, set_autoshow_clear_button] = createSignal<boolean>(false)
	const [readonly, set_readonly] = createSignal<boolean>(false)

	// <TextField>
	const [type, set_type] = createSignal<string>('text')

	// <NumberTextField>
	const [step, set_step] = createSignal<number>(1)
	const [min, set_min] = createSignal<number>(0)
	const [max, set_max] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [limit_min, set_limit_min] = createSignal<boolean>(false)
	const [limit_max, set_limit_max] = createSignal<boolean>(false)

	// <AreaTextField>
	const [line_min, set_line_min] = createSignal<number>(1)
	const [line_max, set_line_max] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [line_limit_max, set_line_limit_max] = createSignal<boolean>(false)

	const Options: VoidComponent = () => (<>
		<CheckBox
			checked={leading()}
			onChange={ev => set_leading(event_current_target(ev).checked)}>
			Leading
		</CheckBox>
		<CheckBox
			checked={trailing()}
			onChange={ev => set_trailing(event_current_target(ev).checked)}>
			Trailing
		</CheckBox>
		<CheckBox
			checked={label()}
			onChange={ev => set_label(event_current_target(ev).checked)}>
			Label text
		</CheckBox>
		<Show when={label()}>
			<CheckBox
				checked={autohide_label()}
				onChange={ev => set_autohide_label(event_current_target(ev).checked)}>
				Auto hide label
			</CheckBox>
		</Show>
		<CheckBox
			checked={placeholder()}
			onChange={ev => set_placeholder(event_current_target(ev).checked)}>
			Placeholder
		</CheckBox>
		<CheckBox
			checked={message()}
			onChange={ev => set_message(event_current_target(ev).checked)}>
			Message text
		</CheckBox>
		<CheckBox
			checked={autoshow_clear_button()}
			onChange={ev => set_autoshow_clear_button(event_current_target(ev).checked)}>
			Auto show clear button
		</CheckBox>
		<CheckBox
			checked={readonly()}
			onChange={ev => set_readonly(event_current_target(ev).checked)}>
			Read only
		</CheckBox>
	</>)

	return (<Page
		title="TextField"
		description="A TextField is a UI element that allows users to input text. It typically includes a text box for entering content and may have additional features like labels, placeholders, and validation rules">
		<h2>TextField</h2>
		<Playground>
			<TextField
				c_label={label()? 'TextField' : undefined}
				readOnly={readonly()}
				c_leading={<Show when={leading()}><Icon c_code={0xECC0}/></Show>}
				c_trailing={<Show when={trailing()}>
					<TextFieldButton><Icon c_code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon c_code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'TextField placeholder' : undefined}
				c_message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				c_auto_hide_label={autohide_label()}
				c_auto_show_clear_button={autoshow_clear_button()}
				type={type()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c_label="Type"
				c_values={[type()]}
				c_on_change={(v) => set_type(v[0].value as string)}>
				<For each={[
					['button', 'Button'],
					['checkbox', 'Checkbox'],
					['color', 'Color'],
					['date', 'Date'],
					['datetime-local', 'Local datetime'],
					['email', 'Email'],
					['file', 'File'],
					['hidden', 'Hidden'],
					['image', 'Image'],
					['month', 'Month'],
					['number', 'Number'],
					['password', 'Password'],
					['radio', 'Radio'],
					['range', 'Range'],
					['reset', 'Reset'],
					['search', 'Search'],
					['submit', 'Submit'],
					['tel', 'Telephone'],
					['time', 'Time'],
					['url', 'URL'],
					['week', 'Week'],
				]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
			</Dropdown>
			<Options />
		</PlaygroundOptions>

		<h2>NumberTextField</h2>
		<Playground>
			<NumberTextField
				c_label={label()? 'NumberTextField' : undefined}
				c_leading={<Show when={leading()}><Icon c_code={0xECC0}/></Show>}
				readOnly={readonly()}
				c_trailing={<Show when={trailing()}>
					<TextFieldButton><Icon c_code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon c_code={0xE553}/></TextFieldButton>
				</Show>}
				step={step()}
				min={limit_min()? min() : undefined}
				max={limit_max()? max() : undefined}
				placeholder={placeholder()? 'NumberTextField placeholder' : undefined}
				c_message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				c_auto_hide_label={autohide_label()}
				c_auto_show_clear_button={autoshow_clear_button()}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={step()}
				c_label="Step"
				onBlur={ev => set_step(s => number_safe(event_current_target(ev).valueAsNumber, s))}
				style={{width: '100px'}}
			/>
			<Show when={limit_min()}>
				<NumberTextField
					value={min()}
					c_label="Min"
					max={limit_max()? max() : undefined}
					onBlur={ev => set_min(m => number_safe(event_current_target(ev).valueAsNumber, m))}
					style={{width: '100px'}}
				/>
			</Show>
			<Show when={limit_max()}>
				<NumberTextField
					value={max()}
					min={limit_min()? min() : undefined}
					c_label="Max"
					onBlur={ev => set_max(m => number_safe(event_current_target(ev).valueAsNumber, m))}
					style={{width: '100px'}}
				/>
			</Show>
			<Options />
			<CheckBox
				checked={limit_min()}
				onChange={ev => set_limit_min(event_current_target(ev).checked)}>
				Limit min
			</CheckBox>
			<CheckBox
				checked={limit_max()}
				onChange={ev => set_limit_max(event_current_target(ev).checked)}>
				Limit max
			</CheckBox>
		</PlaygroundOptions>

		<h2>AreaTextField</h2>
		<Playground>
			<AreaTextField
				c_label={label()? 'AreaTextField' : undefined}
				c_leading={<Show when={leading()}><Icon c_code={0xECC0}/></Show>}
				readOnly={readonly()}
				c_trailing={<Show when={trailing()}>
					<TextFieldButton><Icon c_code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon c_code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'AreaTextField placeholder' : undefined}
				c_message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				c_auto_hide_label={autohide_label()}
				c_auto_show_clear_button={autoshow_clear_button()}
				c_min_line={line_min()}
				c_max_line={line_limit_max()? line_max() : undefined}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={line_min()}
				c_label="Min line"
				onBlur={ev => set_line_min(m => number_safe(event_current_target(ev).valueAsNumber, m))}
				min={1}
				max={line_limit_max()? line_max() : undefined}
				style={{width: '100px'}}
			/>
			<Show when={line_limit_max()}>
				<NumberTextField
					value={line_max()}
					c_label="Max line"
					onBlur={ev => set_line_max(m => number_safe(event_current_target(ev).valueAsNumber, m))}
					min={line_min()}
					style={{width: '100px'}}
				/>
			</Show>
			<Options />
			<CheckBox
				checked={line_limit_max()}
				onChange={ev => set_line_limit_max(event_current_target(ev).checked)}>
				Limit max line
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _