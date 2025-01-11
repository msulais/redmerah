import { For, type VoidComponent, createSignal } from "solid-js"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [variant, set_variant] = createSignal<CheckBoxVariant>(CheckBoxVariant.check)
	const [disabled, set_disabled] = createSignal<boolean>(false)
	return (<Page
		title="CheckBox"
		description="A checkbox is a UI element that allows users to select multiple options from a list. It typically displays a square box that can be checked or unchecked to indicate selection or deselection.">
		<Playground>
			<CheckBox
				c_variant={variant()}
				disabled={disabled()}
				name="a">
				Option 1
			</CheckBox>
			<CheckBox
				c_variant={variant()}
				disabled={disabled()}
				name="a">
				Option 2
			</CheckBox>
			<CheckBox
				c_variant={variant()}
				disabled={disabled()}
				name="a">
				Option 3
			</CheckBox>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c_label="Variant"
				c_on_change={(items) => set_variant(items[0].value as CheckBoxVariant)}
				c_values={[variant()]}>
				<For each={[
					[CheckBoxVariant.check, 'Check'],
					[CheckBoxVariant.radio, 'Radio'],
				]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={disabled()}
				onChange={ev => set_disabled(event_current_target(ev).checked)}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _