import { createSignal, type VoidComponent } from "solid-js"

import Divider from "@/components/Divider"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [vertical, set_vertical] = createSignal<boolean>(false)
	return (<Page
		title="Divider"
		description="A divider is a visual element used to separate content within an interface. It can be a horizontal or vertical line, often used to group related content or indicate different sections.">
		<Playground>
			<div style={{
				"min-width": '100%',
				"min-height": '32px',
			}}>
				<Divider c_vertical={vertical()} style={{height: vertical()? '32px' : undefined}}/>
			</div>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={vertical()}
				onChange={ev => set_vertical(event_current_target(ev).checked)}>
				Vertical
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _