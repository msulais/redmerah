import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import TextField, { AreaTextField, NumberTextField, TextFieldButton } from "@/components/TextField"
import Tooltip from "@/components/Tooltip"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { eventCurrentTarget } from "@/utils/event"

const _: VoidComponent = () => {
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [label, setLabel] = createSignal<boolean>(true)
	const [placeholder, setPlaceholder] = createSignal<boolean>(false)
	const [autoHideLabel, setAutoHideLabel] = createSignal<boolean>(true)
	const [autoShowClearButton, setAutoShowClearButton] = createSignal<boolean>(false)
	const [readonly, setReadonly] = createSignal<boolean>(false)

	// <TextField>
	const [type, setType] = createSignal<string>('text')

	// <NumberTextField>
	const [step, setStep] = createSignal<number>(1)
	const [min, setMin] = createSignal<number>(0)
	const [max, setMax] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [limitMin, setLimitMin] = createSignal<boolean>(false)
	const [limitMax, setLimitMax] = createSignal<boolean>(false)

	// <AreaTextField>
	const [lineMin, setLineMin] = createSignal<number>(1)
	const [lineMax, setLineMax] = createSignal<number>(Number.MAX_SAFE_INTEGER)
	const [lineLimitMax, setLineLimitMax] = createSignal<boolean>(false)

	const Options: VoidComponent = () => (<>
		<CheckBox
			checked={leading()}
			onChange={ev => setLeading(eventCurrentTarget(ev).checked)}>
			Leading
		</CheckBox>
		<CheckBox
			checked={trailing()}
			onChange={ev => setTrailing(eventCurrentTarget(ev).checked)}>
			Trailing
		</CheckBox>
		<CheckBox
			checked={label()}
			onChange={ev => setLabel(eventCurrentTarget(ev).checked)}>
			Label text
		</CheckBox>
		<Show when={label()}>
			<CheckBox
				checked={autoHideLabel()}
				onChange={ev => setAutoHideLabel(eventCurrentTarget(ev).checked)}>
				Auto hide label
			</CheckBox>
		</Show>
		<CheckBox
			checked={placeholder()}
			onChange={ev => setPlaceholder(eventCurrentTarget(ev).checked)}>
			Placeholder
		</CheckBox>
		<CheckBox
			checked={autoShowClearButton()}
			onChange={ev => setAutoShowClearButton(eventCurrentTarget(ev).checked)}>
			Auto show clear button
		</CheckBox>
		<CheckBox
			checked={readonly()}
			onChange={ev => setReadonly(eventCurrentTarget(ev).checked)}>
			Read only
		</CheckBox>
	</>)

	return (<Page
		title="TextField"
		description="A TextField is a UI element that allows users to input text. It typically includes a text box for entering content and may have additional features like labels, placeholders, and validation rules">
		<h2>TextField</h2>
		<Playground>
			<Tooltip>
				<TextField
					c:label={label()? 'TextField' : undefined}
					readOnly={readonly()}
					c:leading={<Show when={leading()}><Icon c:code={0xECC0}/></Show>}
					c:trailing={<Show when={trailing()}>
						<TextFieldButton><Icon c:code={0xE56B}/></TextFieldButton>
						<TextFieldButton><Icon c:code={0xE553}/></TextFieldButton>
					</Show>}
					placeholder={placeholder()? 'TextField placeholder' : undefined}
					c:autoHideLabel={autoHideLabel()}
					c:autoShowClearButton={autoShowClearButton()}
					type={type()}
				/>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c:label="Type"
				c:values={[type()]}
				c:onChange={(v) => setType(v[0].value as string)}>
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
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<Options />
		</PlaygroundOptions>

		<h2>NumberTextField</h2>
		<Playground>
			<Tooltip>
				<NumberTextField
					c:label={label()? 'NumberTextField' : undefined}
					c:leading={<Show when={leading()}><Icon c:code={0xECC0}/></Show>}
					readOnly={readonly()}
					c:trailing={<Show when={trailing()}>
						<TextFieldButton><Icon c:code={0xE56B}/></TextFieldButton>
						<TextFieldButton><Icon c:code={0xE553}/></TextFieldButton>
					</Show>}
					step={step()}
					min={limitMin()? min() : undefined}
					max={limitMax()? max() : undefined}
					placeholder={placeholder()? 'NumberTextField placeholder' : undefined}
					c:autoHideLabel={autoHideLabel()}
					c:autoShowClearButton={autoShowClearButton()}
				/>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<NumberTextField
					value={step()}
					c:label="Step"
					onBlur={ev => setStep(s => numberSafe(eventCurrentTarget(ev).valueAsNumber, s))}
					style={{width: '100px'}}
				/>
				<Show when={limitMin()}>
					<NumberTextField
						value={min()}
						c:label="Min"
						max={limitMax()? max() : undefined}
						onBlur={ev => setMin(m => numberSafe(eventCurrentTarget(ev).valueAsNumber, m))}
						style={{width: '100px'}}
					/>
				</Show>
				<Show when={limitMax()}>
					<NumberTextField
						value={max()}
						min={limitMin()? min() : undefined}
						c:label="Max"
						onBlur={ev => setMax(m => numberSafe(eventCurrentTarget(ev).valueAsNumber, m))}
						style={{width: '100px'}}
					/>
				</Show>
				<Options />
				<CheckBox
					checked={limitMin()}
					onChange={ev => setLimitMin(eventCurrentTarget(ev).checked)}>
					Limit min
				</CheckBox>
				<CheckBox
					checked={limitMax()}
					onChange={ev => setLimitMax(eventCurrentTarget(ev).checked)}>
					Limit max
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>

		<h2>AreaTextField</h2>
		<Playground>
			<Tooltip>
				<AreaTextField
					c:label={label()? 'AreaTextField' : undefined}
					c:leading={<Show when={leading()}><Icon c:code={0xECC0}/></Show>}
					readOnly={readonly()}
					c:trailing={<Show when={trailing()}>
						<TextFieldButton><Icon c:code={0xE56B}/></TextFieldButton>
						<TextFieldButton><Icon c:code={0xE553}/></TextFieldButton>
					</Show>}
					placeholder={placeholder()? 'AreaTextField placeholder' : undefined}
					c:autoHideLabel={autoHideLabel()}
					c:autoShowClearButton={autoShowClearButton()}
					c:minLine={lineMin()}
					c:maxLine={lineLimitMax()? lineMax() : undefined}
				/>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				value={lineMin()}
				c:label="Min line"
				onBlur={ev => setLineMin(m => numberSafe(eventCurrentTarget(ev).valueAsNumber, m))}
				min={1}
				max={lineLimitMax()? lineMax() : undefined}
				style={{width: '100px'}}
			/>
			<Show when={lineLimitMax()}>
				<NumberTextField
					value={lineMax()}
					c:label="Max line"
					onBlur={ev => setLineMax(m => numberSafe(eventCurrentTarget(ev).valueAsNumber, m))}
					min={lineMin()}
					style={{width: '100px'}}
				/>
			</Show>
			<Options />
			<CheckBox
				checked={lineLimitMax()}
				onChange={ev => setLineLimitMax(eventCurrentTarget(ev).checked)}>
				Limit max line
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _