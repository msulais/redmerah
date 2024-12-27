import { createSignal, For, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"

import { RichTooltip, TextTooltip, TooltipPosition } from "@/components/Tooltip"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Icon from "@/components/Icon"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [use_anchor, set_use_anchor] = createSignal<boolean>(false)
	const [position, set_position] = createSignal<TooltipPosition>(TooltipPosition.center_top)
	const [gap, set_gap] = createSignal<number>(40)
	const [start_delay_duration, set_start_delay_duration] = createSignal<number>(500)
	const [end_delay_duration, set_end_delay_duration] = createSignal<number>(500)

	return (<Page
		title="Tooltip"
		description="A tooltip is a small, temporary window that appears when a user hovers over an element. It provides a brief explanation or description of the element's purpose or function. Tooltips are often used to clarify the meaning of icons, buttons, or other UI elements.">
		<Playground>
			<TextTooltip
				end_delay_duration={end_delay_duration()}
				gap={gap()}
				position={position()}
				start_delay_duration={start_delay_duration()}
				use_anchor={use_anchor()}>
				<Button data-tooltip="This is tooltip">
					Hover me please
					<Icon data-tooltip="This is icon" code={0xE4B2}/>
				</Button>
			</TextTooltip>
			<RichTooltip
				style={{width: '240px'}}
				end_delay_duration={end_delay_duration()}
				gap={gap()}
				position={position()}
				start_delay_duration={start_delay_duration()}
				use_anchor={use_anchor()}
				tooltip={<>
					<p style={{"margin-bottom": '8px'}}>Ullamco anim in magna ea ut labore velit ex occaecat elit voluptate laboris.</p>
					<Button style={{color: 'rgb(var(--g-color-accent))'}} variant={ButtonVariant.tonal}>Learn more</Button>
				</>}>
				<Button>Rich tooltip</Button>
			</RichTooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				values={[position()]}
				on_change_options={(options) => set_position(options[0].value as TooltipPosition)}>
				<For each={[
					[TooltipPosition.left_top, 'Left top'],
					[TooltipPosition.left_center_to_bottom, 'Left center to bottom'],
					[TooltipPosition.left_center, 'Left center'],
					[TooltipPosition.left_center_to_top, 'Left center to top'],
					[TooltipPosition.left_bottom, 'Left bottom'],
					[TooltipPosition.right_top, 'Right top'],
					[TooltipPosition.right_center_to_bottom, 'Right center to bottom'],
					[TooltipPosition.right_center, 'Right center'],
					[TooltipPosition.right_center_to_top, 'Right center to top'],
					[TooltipPosition.right_bottom, 'Right bottom'],
					[TooltipPosition.center_top_to_right, 'Center top to right'],
					[TooltipPosition.center_top, 'Center top'],
					[TooltipPosition.center_top_to_left, 'Center top to left'],
					[TooltipPosition.center_bottom_to_right, 'Center bottom to right'],
					[TooltipPosition.center_bottom, 'Center bottom'],
					[TooltipPosition.center_bottom_to_left, 'Center bottom to left'],
					[TooltipPosition.center_center_left_top, 'Center center left top'],
					[TooltipPosition.center_center_left, 'Center center left'],
					[TooltipPosition.center_center_left_bottom, 'Center center left bottom'],
					[TooltipPosition.center_center_top, 'Center center top'],
					[TooltipPosition.center_center, 'Center center'],
					[TooltipPosition.center_center_bottom, 'Center center bottom'],
					[TooltipPosition.center_center_right_top, 'Center center right top'],
					[TooltipPosition.center_center_right, 'Center center right'],
					[TooltipPosition.center_center_right_bottom, 'Center center right bottom'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => set_gap(g => number_safe(event_current_target(ev).valueAsNumber, g))}
				label="Gap"
			/>
			<NumberTextField
				style={{width: '100px'}}
				value={start_delay_duration()}
				min={0}
				step={100}
				onBlur={(ev) => set_start_delay_duration(d => number_safe(event_current_target(ev).valueAsNumber, d))}
				label="Start delay duration"
			/>
			<NumberTextField
				style={{width: '100px'}}
				value={end_delay_duration()}
				min={0}
				step={100}
				onBlur={(ev) => set_end_delay_duration(d => number_safe(event_current_target(ev).valueAsNumber, d))}
				label="End delay duration"
			/>
			<CheckBox
				checked={use_anchor()}
				onChange={ev => set_use_anchor(event_current_target(ev).checked)}>
				Use anchor
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _