import { createSignal, For, type VoidComponent } from "solid-js"

import { _checked, _currentTarget, _filled, _outlined, _slice, _tonal, _transparent, _value, _valueAsNumber } from "@/constants/string"
import { safeNumber } from "@/utils/math"

import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { ButtonVariant } from "@/components/Button"

const _: VoidComponent = () => {
	const [multiple, setMultiple] = createSignal<boolean>(false)
	const [label, setLabel] = createSignal<boolean>(true)
	const [count, setCount] = createSignal<number>(10)
	const [variant, setVariant] = createSignal<ButtonVariant>(ButtonVariant[_tonal])
	return (<Page
		title="Dropdown"
		description="A dropdown is a UI element that displays a list of options when clicked. It provides a compact way to present multiple choices while saving screen space.">
		<Playground>
			<Dropdown
				multiple={multiple()}
				variant={variant()}
				label={label()? "Animals" : undefined}
				text="Select animal">
				<For each={[
					[0, 'Tiger'],
					[1, 'Lion'],
					[2, 'Girrafe'],
					[3, 'Duck'],
					[4, 'Shark'],
					[5, 'Chicken'],
					[6, 'Snail'],
					[7, 'Komodo'],
					[8, 'Orangutan'],
					[9, 'Fish'],
				][_slice](0, count()) as [number, string][]}>{option =>
				<DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				labelText="Count"
				style={{width: '100px'}}
				value={10} min={1}
				max={10}
				onBlur={(ev) => setCount(c => safeNumber(ev[_currentTarget][_valueAsNumber], c))}
			/>
			<Dropdown
				label="Variant"
				values={[variant()]}
				onChangeOptions={(items) => setVariant(items[0][_value] as ButtonVariant)}>
				<For each={[
					[ButtonVariant[_filled], 'Filled'],
					[ButtonVariant[_tonal], 'Tonal'],
					[ButtonVariant[_outlined], 'Outlined'],
					[ButtonVariant[_transparent], 'Transparent'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={multiple()}
				onChange={ev => setMultiple(ev[_currentTarget][_checked])}>
				Multiple
			</CheckBox>
			<CheckBox
				checked={label()}
				onChange={ev => setLabel(ev[_currentTarget][_checked])}>
				Label
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _