import { For, type VoidComponent, createSignal } from "solid-js"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [variant, set_variant] = createSignal<CheckBoxVariant>(CheckBoxVariant.check)
	const [disabled, set_disabled] = createSignal<boolean>(false)
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
				on_change_options={(items) => set_variant(items[0].value as CheckBoxVariant)}
				values={[variant()]}>
				<For each={[
					[CheckBoxVariant.check, 'Check'],
					[CheckBoxVariant.radio, 'Radio'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={disabled()}
				onChange={ev => set_disabled(ev.currentTarget.checked)}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _