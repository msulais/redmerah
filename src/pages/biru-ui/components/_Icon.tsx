import { createSignal, type VoidComponent } from "solid-js"

import { ICON_ALERT, ICON_SYMBOLS } from "@/constants/icons"
import { eventCurrentTarget } from "@/utils/event"

import Icon from "@/components/Icon"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [filled, setFilled] = createSignal<boolean>(false)
	return (<Page
		title="Icon"
		description="An icon is a small graphic symbol representing an action, object, or concept. Icons are used to enhance user understanding and interaction within an interface.">
		<Playground>
			<Icon c:code={0xEB11} c:filled={filled()}/>
			<Icon c:code={ICON_ALERT} c:filled={filled()}/>
			<Icon c:code={0xE47C} c:filled={filled()}/>
			<Icon c:code={0xEA6D} c:filled={filled()}/>
			<Icon c:code={0xEA9D} c:filled={filled()}/>
			<Icon c:code={0xEB6D} c:filled={filled()}/>
			<Icon c:code={0xECB8} c:filled={filled()}/>
			<Icon c:code={0xED37} c:filled={filled()}/>
			<Icon c:code={0xEE15} c:filled={filled()}/>
			<Icon c:code={0xEEA1} c:filled={filled()}/>
			<Icon c:code={ICON_SYMBOLS} c:filled={filled()}/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox checked={filled()} onChange={ev => setFilled(eventCurrentTarget(ev).checked)}>Filled</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _