import { type VoidComponent, createSignal } from "solid-js"

import { _check, _checked, _currentTarget, _radio } from "@/constants/string"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
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
				labelText="Variant"
				style={{width: '100px'}}
				items={[
					[CheckBoxVariant[_check], 'Check'],
					[CheckBoxVariant[_radio], 'Radio'],
				]}
				onSelectedItemsChanged={(items) => setVariant(items[0][0] as CheckBoxVariant)}
				selectedValues={[variant()]}
			/>
			<CheckBox
				checked={disabled()}
				onChange={ev => setDisabled(ev[_currentTarget][_checked])}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _