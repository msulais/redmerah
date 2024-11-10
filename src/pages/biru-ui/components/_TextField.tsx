import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { _text, _password, _telephone, _email, _url, _checked, _currentTarget, _valueAsNumber, _value } from "@/constants/string"
import { safeNumber } from "@/utils/math"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import TextField, { AreaTextField, NumberTextField, TextFieldButton } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [label, setLabelText] = createSignal<boolean>(true)
	const [placeholder, setPlaceholder] = createSignal<boolean>(false)
	const [message, setMessageText] = createSignal<boolean>(false)
	const [autoHideLabel, setAutoHideLabel] = createSignal<boolean>(true)
	const [autoShowClearBtn, setAutoShowClearBtn] = createSignal<boolean>(false)
	const [compact, setCompact] = createSignal<boolean>(false)
	const [readOnly, setReadOnly] = createSignal<boolean>(false)

	// <TextField>
	const [type, setType] = createSignal<string>('text')

	// <NumberTextField>
	const [step, setStep] = createSignal<number>(1)
	const [min, setMin] = createSignal<number>(0)
	const [max, setMax] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [limitMin, setLimitMin] = createSignal<boolean>(false)
	const [limitMax, setLimitMax] = createSignal<boolean>(false)

	// <AreaTextField>
	const [minLine, setMinLine] = createSignal<number>(1)
	const [maxLine, setMaxLine] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [limitMaxLine, setLimitMaxLine] = createSignal<boolean>(false)

	const Options: VoidComponent = () => (<>
		<CheckBox
			checked={leading()}
			onChange={ev => setLeading(ev[_currentTarget][_checked])}>
			Leading
		</CheckBox>
		<CheckBox
			checked={trailing()}
			onChange={ev => setTrailing(ev[_currentTarget][_checked])}>
			Trailing
		</CheckBox>
		<CheckBox
			checked={label()}
			onChange={ev => setLabelText(ev[_currentTarget][_checked])}>
			Label text
		</CheckBox>
		<Show when={label()}>
			<CheckBox
				checked={autoHideLabel()}
				onChange={ev => setAutoHideLabel(ev[_currentTarget][_checked])}>
				Auto hide label
			</CheckBox>
		</Show>
		<CheckBox
			checked={placeholder()}
			onChange={ev => setPlaceholder(ev[_currentTarget][_checked])}>
			Placeholder
		</CheckBox>
		<CheckBox
			checked={message()}
			onChange={ev => setMessageText(ev[_currentTarget][_checked])}>
			Message text
		</CheckBox>
		<CheckBox
			checked={autoShowClearBtn()}
			onChange={ev => setAutoShowClearBtn(ev[_currentTarget][_checked])}>
			Auto show clear button
		</CheckBox>
		<CheckBox
			checked={readOnly()}
			onChange={ev => setReadOnly(ev[_currentTarget][_checked])}>
			Read only
		</CheckBox>
		<CheckBox
			checked={compact()}
			onChange={ev => setCompact(ev[_currentTarget][_checked])}>
			Compact
		</CheckBox>
	</>)

	return (<Page
		title="TextField"
		description="A TextField is a UI element that allows users to input text. It typically includes a text box for entering content and may have additional features like labels, placeholders, and validation rules">
		<h2>TextField</h2>
		<Playground>
			<TextField
				label={label()? 'TextField' : undefined}
				readOnly={readOnly()}
				compact={compact()}
				leading={<Show when={leading()}><Icon code={0xECC0}/></Show>}
				trailing={<Show when={trailing()}>
					<TextFieldButton><Icon code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'TextField placeholder' : undefined}
				message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
				type={type()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Type"
				values={[type()]}
				onChangeOptions={(v) => setType(v[0][_value] as string)}>
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
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<Options />
		</PlaygroundOptions>

		<h2>NumberTextField</h2>
		<Playground>
			<NumberTextField
				label={label()? 'NumberTextField' : undefined}
				leading={<Show when={leading()}><Icon code={0xECC0}/></Show>}
				readOnly={readOnly()}
				compact={compact()}
				trailing={<Show when={trailing()}>
					<TextFieldButton><Icon code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon code={0xE553}/></TextFieldButton>
				</Show>}
				step={step()}
				min={limitMin()? min() : undefined}
				max={limitMax()? max() : undefined}
				placeholder={placeholder()? 'NumberTextField placeholder' : undefined}
				message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={step()}
				label="Step"
				onBlur={ev => setStep(s => safeNumber(ev[_currentTarget][_valueAsNumber], s))}
				style={{width: '100px'}}
			/>
			<Show when={limitMin()}>
				<NumberTextField
					value={min()}
					label="Min"
					max={limitMax()? max() : undefined}
					onBlur={ev => setMin(m => safeNumber(ev[_currentTarget][_valueAsNumber], m))}
					style={{width: '100px'}}
				/>
			</Show>
			<Show when={limitMax()}>
				<NumberTextField
					value={max()}
					min={limitMin()? min() : undefined}
					label="Max"
					onBlur={ev => setMax(m => safeNumber(ev[_currentTarget][_valueAsNumber], m))}
					style={{width: '100px'}}
				/>
			</Show>
			<Options />
			<CheckBox
				checked={limitMin()}
				onChange={ev => setLimitMin(ev[_currentTarget][_checked])}>
				Limit min
			</CheckBox>
			<CheckBox
				checked={limitMax()}
				onChange={ev => setLimitMax(ev[_currentTarget][_checked])}>
				Limit max
			</CheckBox>
		</PlaygroundOptions>

		<h2>AreaTextField</h2>
		<Playground>
			<AreaTextField
				label={label()? 'AreaTextField' : undefined}
				leading={<Show when={leading()}><Icon code={0xECC0}/></Show>}
				readOnly={readOnly()}
				compact={compact()}
				trailing={<Show when={trailing()}>
					<TextFieldButton><Icon code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'AreaTextField placeholder' : undefined}
				message={message()? "Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat." : undefined}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
				minLine={minLine()}
				maxLine={limitMaxLine()? maxLine() : undefined}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={minLine()}
				label="Min line"
				onBlur={ev => setMinLine(m => safeNumber(ev[_currentTarget][_valueAsNumber], m))}
				min={1}
				max={limitMaxLine()? maxLine() : undefined}
				style={{width: '100px'}}
			/>
			<Show when={limitMaxLine()}>
				<NumberTextField
					value={maxLine()}
					label="Max line"
					onBlur={ev => setMaxLine(m => safeNumber(ev[_currentTarget][_valueAsNumber], m))}
					min={minLine()}
					style={{width: '100px'}}
				/>
			</Show>
			<Options />
			<CheckBox
				checked={limitMaxLine()}
				onChange={ev => setLimitMaxLine(ev[_currentTarget][_checked])}>
				Limit max line
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _