import { type VoidComponent, createSignal } from "solid-js"

import { _check, _radio } from "@/constants/string"

import CheckBox, { CheckBoxVariant } from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [variant, setVariant] = createSignal<CheckBoxVariant>(CheckBoxVariant[_check])
	const [disabled, setDisabled] = createSignal<boolean>(false)
	const [focused, setFocused] = createSignal<boolean>(false)
	const [disableScale, setDisableScale] = createSignal<boolean>(false)
	const [compact, setCompact] = createSignal<boolean>(false)
	return (<Page
		title="CheckBox"
		description="A checkbox is a UI element that allows users to select multiple options from a list. It typically displays a square box that can be checked or unchecked to indicate selection or deselection.">
		<Playground>
			<CheckBox
				variant={variant()}
				compact={compact()}
				disabled={disabled()}
				focused={focused()}
				disableScale={disableScale()}>
				Check me
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
			<CheckBox value={disabled()} onValueChanged={d => setDisabled(d)}>Disabled</CheckBox>
			<CheckBox value={focused()} onValueChanged={d => setFocused(d)}>Focused</CheckBox>
			<CheckBox value={disableScale()} onValueChanged={d => setDisableScale(d)}>Disable scale</CheckBox>
			<CheckBox value={compact()} onValueChanged={d => setCompact(d)}>Compact</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _