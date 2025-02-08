import { For, type VoidComponent, createSignal } from "solid-js"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { eventCurrentTarget } from "@/utils/event"

const _: VoidComponent = () => {
	const [variant, setVariant] = createSignal<CheckBoxVariant>(CheckBoxVariant.check)
	const [disabled, setDisabled] = createSignal<boolean>(false)
	return (<Page
		title="CheckBox"
		description="A checkbox is a UI element that allows users to select multiple options from a list. It typically displays a square box that can be checked or unchecked to indicate selection or deselection.">
		<Playground>
			<CheckBox
				c:variant={variant()}
				disabled={disabled()}
				name="a">
				Option 1
			</CheckBox>
			<CheckBox
				c:variant={variant()}
				disabled={disabled()}
				name="a">
				Option 2
			</CheckBox>
			<CheckBox
				c:variant={variant()}
				disabled={disabled()}
				name="a">
				Option 3
			</CheckBox>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c:label="Variant"
				c:onChange={(items) => setVariant(items[0].value as CheckBoxVariant)}
				c:values={[variant()]}>
				<For each={[
					[CheckBoxVariant.check, 'Check'],
					[CheckBoxVariant.radio, 'Radio'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={disabled()}
				onChange={ev => setDisabled(eventCurrentTarget(ev).checked)}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _