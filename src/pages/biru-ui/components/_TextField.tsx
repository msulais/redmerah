import { createSignal, Show, type VoidComponent } from "solid-js"

import { _text, _password, _telephone, _email, _url, _checked, _currentTarget } from "@/constants/string"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import TextField, { AreaTextField, NumberTextField, TextFieldButton, TextFieldType } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [labelText, setLabelText] = createSignal<boolean>(true)
	const [placeholder, setPlaceholder] = createSignal<boolean>(false)
	const [messageText, setMessageText] = createSignal<boolean>(false)
	const [autoHideLabel, setAutoHideLabel] = createSignal<boolean>(true)
	const [autoShowClearBtn, setAutoShowClearBtn] = createSignal<boolean>(false)
	const [compact, setCompact] = createSignal<boolean>(false)
	const [readOnly, setReadOnly] = createSignal<boolean>(false)

	// <TextField>
	const [type, setType] = createSignal<TextFieldType>(TextFieldType[_text])

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
			checked={labelText()}
			onChange={ev => setLabelText(ev[_currentTarget][_checked])}>
			Label text
		</CheckBox>
		<Show when={labelText()}>
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
			checked={messageText()}
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
				labelText={labelText()? 'TextField' : undefined}
				readOnly={readOnly()}
				compact={compact()}
				leading={<Show when={leading()}><Icon code={0xECC0}/></Show>}
				trailing={<Show when={trailing()}>
					<TextFieldButton><Icon code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'TextField placeholder' : undefined}
				messageText={<Show when={messageText()}>Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat.</Show>}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
				type={type()}
			/>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				items={[
					[TextFieldType[_text], 'Text'],
					[TextFieldType[_password], 'Password'],
					[TextFieldType[_telephone], 'Telephone'],
					[TextFieldType[_email], 'Email'],
					[TextFieldType[_url], 'URL'],
				]}
				labelText="Type"
				style={{width: '100px'}}
				selectedValues={[type()]}
				onSelectedItemsChanged={(v) => setType(v[0][0] as TextFieldType)}
			/>
			<Options />
		</PlaygroundOptions>

		<h2>NumberTextField</h2>
		<Playground>
			<NumberTextField
				labelText={labelText()? 'NumberTextField' : undefined}
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
				messageText={<Show when={messageText()}>Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat.</Show>}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={step()}
				labelText="Step"
				onFinalValueChanged={v => setStep(v)}
				style={{width: '100px'}}
			/>
			<Show when={limitMin()}>
				<NumberTextField
					value={min()}
					labelText="Min"
					max={limitMax()? max() : undefined}
					onFinalValueChanged={v => setMin(v)}
					style={{width: '100px'}}
				/>
			</Show>
			<Show when={limitMax()}>
				<NumberTextField
					value={max()}
					min={limitMin()? min() : undefined}
					labelText="Max"
					onFinalValueChanged={v => setMax(v)}
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
				labelText={labelText()? 'AreaTextField' : undefined}
				leading={<Show when={leading()}><Icon code={0xECC0}/></Show>}
				readOnly={readOnly()}
				compact={compact()}
				trailing={<Show when={trailing()}>
					<TextFieldButton><Icon code={0xE56B}/></TextFieldButton>
					<TextFieldButton><Icon code={0xE553}/></TextFieldButton>
				</Show>}
				placeholder={placeholder()? 'AreaTextField placeholder' : undefined}
				messageText={<Show when={messageText()}>Consectetur labore sint aliqua occaecat anim quis aute dolor ex occaecat laborum sit aliqua consequat.</Show>}
				autoHideLabel={autoHideLabel()}
				autoShowClearBtn={autoShowClearBtn()}
				minLine={minLine()}
				maxLine={limitMaxLine()? maxLine() : undefined}
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={minLine()}
				labelText="Min line"
				onFinalValueChanged={v => setMinLine(v)}
				min={1}
				max={limitMaxLine()? maxLine() : undefined}
				style={{width: '100px'}}
			/>
			<Show when={limitMaxLine()}>
				<NumberTextField
					value={maxLine()}
					labelText="Max line"
					onFinalValueChanged={v => setMaxLine(v)}
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