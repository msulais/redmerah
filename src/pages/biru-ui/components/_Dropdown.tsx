import { createSignal, For, type VoidComponent } from "solid-js"

import { array_slice } from "@/utils/array"
import { number_safe } from "@/utils/number"

import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { ButtonVariant } from "@/components/Button"

const _: VoidComponent = () => {
	const [multiple, set_multiple] = createSignal<boolean>(false)
	const [label, set_label] = createSignal<boolean>(true)
	const [count, set_count] = createSignal<number>(10)
	const [variant, set_variant] = createSignal<ButtonVariant>(ButtonVariant.tonal)
	return (<Page
		title="Dropdown"
		description="A dropdown is a UI element that displays a list of options when clicked. It provides a compact way to present multiple choices while saving screen space.">
		<Playground>
			<Dropdown
				multiple={multiple()}
				variant={variant()}
				label={label()? "Animals" : undefined}
				text="Select animal">
				<For each={array_slice([
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
				], 0, count()) as [number, string][]}>{option =>
				<DropdownOption value={option[0]} text={option[1]}/>}</For>
			</Dropdown>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField
				label="Count"
				style={{width: '100px'}}
				value={10} min={1}
				max={10}
				onBlur={(ev) => set_count(c => number_safe(ev.currentTarget.valueAsNumber, c))}
			/>
			<Dropdown
				label="Variant"
				values={[variant()]}
				on_change_options={(items) => set_variant(items[0].value as ButtonVariant)}>
				<For each={[
					[ButtonVariant.filled, 'Filled'],
					[ButtonVariant.tonal, 'Tonal'],
					[ButtonVariant.outlined, 'Outlined'],
					[ButtonVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={multiple()}
				onChange={ev => set_multiple(ev.currentTarget.checked)}>
				Multiple
			</CheckBox>
			<CheckBox
				checked={label()}
				onChange={ev => set_label(ev.currentTarget.checked)}>
				Label
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _