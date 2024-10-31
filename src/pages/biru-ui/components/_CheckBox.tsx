import { For, type VoidComponent, createSignal } from "solid-js"

import { _check, _checked, _currentTarget, _radio, _value } from "@/constants/string"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [variant, setVariant] = createSignal<CheckBoxVariant>(CheckBoxVariant[_check])
	const [disabled, setDisabled] = createSignal<boolean>(false)
	return (<Page
		title="CheckBox"
		description="A checkbox is a UI element that allows users to select multiple options from a list. It typically displays a square box that can be checked or unchecked to indicate selection or deselection.">
		<Playground>
			<CheckBox
				variant={variant()}
				disabled={disabled()}
				name="a">
				Option 1
			</CheckBox>
			<CheckBox
				variant={variant()}
				disabled={disabled()}
				name="a">
				Option 2
			</CheckBox>
			<CheckBox
				variant={variant()}
				disabled={disabled()}
				name="a">
				Option 3
			</CheckBox>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Variant"
				onChangeOptions={(items) => setVariant(items[0][_value] as CheckBoxVariant)}
				values={[variant()]}>
				<For each={[
					[CheckBoxVariant[_check], 'Check'],
					[CheckBoxVariant[_radio], 'Radio'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={disabled()}
				onChange={ev => setDisabled(ev[_currentTarget][_checked])}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _