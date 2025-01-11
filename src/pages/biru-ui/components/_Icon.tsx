import { createSignal, type VoidComponent } from "solid-js"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [filled, set_filled] = createSignal<boolean>(false)
	return (<Page
		title="Icon"
		description="An icon is a small graphic symbol representing an action, object, or concept. Icons are used to enhance user understanding and interaction within an interface.">
		<Playground>
			<Icon c_code={0xEB11} c_filled={filled()}/>
			<Icon c_code={0xE01B} c_filled={filled()}/>
			<Icon c_code={0xE47C} c_filled={filled()}/>
			<Icon c_code={0xEA6D} c_filled={filled()}/>
			<Icon c_code={0xEA9D} c_filled={filled()}/>
			<Icon c_code={0xEB6D} c_filled={filled()}/>
			<Icon c_code={0xECB8} c_filled={filled()}/>
			<Icon c_code={0xED37} c_filled={filled()}/>
			<Icon c_code={0xEE15} c_filled={filled()}/>
			<Icon c_code={0xEEA1} c_filled={filled()}/>
			<Icon c_code={0xEF77} c_filled={filled()}/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox checked={filled()} onChange={ev => set_filled(event_current_target(ev).checked)}>Filled</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _