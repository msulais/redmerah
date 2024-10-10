import { createSignal, type VoidComponent } from "solid-js"

import { _currentTarget, _checked } from "@/constants/string"

import Divider from "@/components/Divider"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [vertical, setVertical] = createSignal<boolean>(false)
	return (<Page
		title="Divider"
		description="A divider is a visual element used to separate content within an interface. It can be a horizontal or vertical line, often used to group related content or indicate different sections.">
		<Playground>
			<div style={{
				"min-width": '100%',
				"min-height": '32px',
			}}>
				<Divider vertical={vertical()} style={{height: vertical()? '32px' : undefined}}/>
			</div>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={vertical()}
				onChange={ev => setVertical(ev[_currentTarget][_checked])}>
				Vertical
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _