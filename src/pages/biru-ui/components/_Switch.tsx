import { createSignal, type VoidComponent } from "solid-js"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Switch from "@/components/Switch"
import CheckBox from "@/components/CheckBox"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [disabled, set_disabled] = createSignal<boolean>(false)
	return (<Page
		title="Switch"
		description={"A Switch UI component is a graphical element commonly found in user interfaces that provides a simple, on/off toggle mechanism. It typically consists of a circular or rectangular slider that can be moved between two positions, usually labeled \"On\" and \"Off\" or represented by different colors or icons"}>
		<Playground>
			<Switch disabled={disabled()}/>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={disabled()}
				onChange={ev => set_disabled(event_current_target(ev).checked)}>
				Disabled
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _