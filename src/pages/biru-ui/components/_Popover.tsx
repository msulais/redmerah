import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"
import { array_includes } from "@/utils/array"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Popover, { close_popover, open_popover, PopoverPosition } from "@/components/Popover"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [draggable, set_draggable] = createSignal<boolean>(false)
	const [gap, set_gap] = createSignal<number>(12)
	const [padding, set_padding] = createSignal<number>(0)
	const [position, set_position] = createSignal<PopoverPosition>(PopoverPosition.center_bottom)
	const [anchor, set_anchor] = createSignal<boolean>(true)
	const [manual_dismiss, set_manual_dismiss] = createSignal<boolean>(false)
	let popover_ref: HTMLDivElement
	return (<Page
		title="Popover"
		description="A popover is a small, temporary window that appears when a user interacts with an element (e.g., hovers over a button). It provides additional information, options, or tools related to the element. Popover content can be triggered by hover, click, or focus.">
		<Playground>
			<Button variant={ButtonVariant.tonal} onClick={(ev) => open_popover(ev, popover_ref, {
				anchor: anchor()? event_current_target(ev) : undefined,
				allow_hide_anchor: allow_hide_anchor(),
				draggable: draggable(),
				gap: gap(),
				padding: padding(),
				position: position(),
				manual_dismiss: manual_dismiss()
			})}>Open popover</Button>
			<Popover ref={r => popover_ref = r} style={{width: '300px'}}>
				<div style={{padding: '16px'}}>
					<TextField placeholder="Feedback"/>
					<p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
					<Button onClick={(_ev) => close_popover(popover_ref)} variant={ButtonVariant.filled}>Close popover</Button>
				</div>
			</Popover>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				values={[position()]}
				on_change_options={(options) => set_position(options[0].value as PopoverPosition)}>
				<For each={[
					[PopoverPosition.left_top, 'Left top'],
					[PopoverPosition.left_center_to_bottom, 'Left center to bottom'],
					[PopoverPosition.left_center, 'Left center'],
					[PopoverPosition.left_center_to_top, 'Left center to top'],
					[PopoverPosition.left_bottom, 'Left bottom'],
					[PopoverPosition.right_top, 'Right top'],
					[PopoverPosition.right_center_to_bottom, 'Right center to bottom'],
					[PopoverPosition.right_center, 'Right center'],
					[PopoverPosition.right_center_to_top, 'Right center to top'],
					[PopoverPosition.right_bottom, 'Right bottom'],
					[PopoverPosition.center_top_to_right, 'Center top to right'],
					[PopoverPosition.center_top, 'Center top'],
					[PopoverPosition.center_top_to_left, 'Center top to left'],
					[PopoverPosition.center_bottom_to_right, 'Center bottom to right'],
					[PopoverPosition.center_bottom, 'Center bottom'],
					[PopoverPosition.center_bottom_to_left, 'Center bottom to left'],
					[PopoverPosition.center_center_left_top, 'Center center left top'],
					[PopoverPosition.center_center_left, 'Center center left'],
					[PopoverPosition.center_center_left_bottom, 'Center center left bottom'],
					[PopoverPosition.center_center_top, 'Center center top'],
					[PopoverPosition.center_center, 'Center center'],
					[PopoverPosition.center_center_bottom, 'Center center bottom'],
					[PopoverPosition.center_center_right_top, 'Center center right top'],
					[PopoverPosition.center_center_right, 'Center center right'],
					[PopoverPosition.center_center_right_bottom, 'Center center right bottom'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => set_gap(g => number_safe(event_current_target(ev).valueAsNumber, g))}
				label="Gap"
			/>
			<Show when={array_includes([
				PopoverPosition.center_top_to_right,
				PopoverPosition.center_center_left,
				PopoverPosition.center_bottom_to_right,
				PopoverPosition.center_top_to_left,
				PopoverPosition.center_center_right,
				PopoverPosition.center_bottom_to_left,
				PopoverPosition.left_center_to_bottom,
				PopoverPosition.center_center_left_top,
				PopoverPosition.center_center_top,
				PopoverPosition.center_center_right_top,
				PopoverPosition.right_center_to_bottom,
				PopoverPosition.left_center_to_top,
				PopoverPosition.center_center_left_bottom,
				PopoverPosition.center_center_bottom,
				PopoverPosition.center_center_right_bottom,
				PopoverPosition.right_center_to_top
			], position())}>
				<NumberTextField
					value={padding()}
					style={{width: '100px'}}
					min={0}
					onBlur={(ev) => set_padding(p => number_safe(event_current_target(ev).valueAsNumber, p))}
					label="Padding"
				/>
			</Show>
			<CheckBox
				checked={anchor()}
				onChange={ev => set_anchor(event_current_target(ev).checked)}>
				Anchor
			</CheckBox>
			<CheckBox
				checked={draggable()}
				onChange={ev => set_draggable(event_current_target(ev).checked)}>
				Dragable
			</CheckBox>
			<CheckBox
				checked={allow_hide_anchor()}
				onChange={ev => set_allow_hide_anchor(event_current_target(ev).checked)}>
				Allow hide anchor
			</CheckBox>
			<CheckBox
				checked={manual_dismiss()}
				onChange={ev => set_manual_dismiss(event_current_target(ev).checked)}>
				Manual dismiss
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _