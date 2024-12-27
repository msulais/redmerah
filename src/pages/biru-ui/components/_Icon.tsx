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
			<Icon code={0xEB11} filled={filled()}/>
			<Icon code={0xE01B} filled={filled()}/>
			<Icon code={0xE47C} filled={filled()}/>
			<Icon code={0xEA6D} filled={filled()}/>
			<Icon code={0xEA9D} filled={filled()}/>
			<Icon code={0xEB6D} filled={filled()}/>
			<Icon code={0xECB8} filled={filled()}/>
			<Icon code={0xED37} filled={filled()}/>
			<Icon code={0xEE15} filled={filled()}/>
			<Icon code={0xEEA1} filled={filled()}/>
			<Icon code={0xEF77} filled={filled()}/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox checked={filled()} onChange={ev => set_filled(event_current_target(ev).checked)}>Filled</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _