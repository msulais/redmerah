import { createSignal, For, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { ButtonVariant } from "@/components/Button"

const _: VoidComponent = () => {
	const [multiple, setMultiple] = createSignal<boolean>(false)
	const [label, setLabel] = createSignal<boolean>(true)
	const [count, setCount] = createSignal<number>(10)
	const [variant, setVariant] = createSignal<ButtonVariant>(ButtonVariant.tonal)
	return (<Page
		title="Dropdown"
		description="A dropdown is a UI element that displays a list of options when clicked. It provides a compact way to present multiple choices while saving screen space.">
		<Playground>
			<Dropdown
				c:multiple={multiple()}
				c:variant={variant()}
				c:label={label()? "Animals" : undefined}
				c:text="Select animal">
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
				].slice(0, count()) as [number, string][]}>{option =>
				<DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
			</Dropdown>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<NumberTextField
					c:label="Count"
					style={{width: '100px'}}
					value={10} min={1}
					max={10}
					onBlur={(ev) => setCount(c => numberSafe(ev.currentTarget.valueAsNumber, c))}
				/>
				<Dropdown
					c:label="Variant"
					c:values={[variant()]}
					c:onChange={(items) => setVariant(items[0].value as ButtonVariant)}>
					<For each={[
						[ButtonVariant.filled, 'Filled'],
						[ButtonVariant.tonal, 'Tonal'],
						[ButtonVariant.outlined, 'Outlined'],
						[ButtonVariant.transparent, 'Transparent'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<CheckBox
					checked={multiple()}
					onChange={ev => setMultiple(ev.currentTarget.checked)}>
					Multiple
				</CheckBox>
				<CheckBox
					checked={label()}
					onChange={ev => setLabel(ev.currentTarget.checked)}>
					Label
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _