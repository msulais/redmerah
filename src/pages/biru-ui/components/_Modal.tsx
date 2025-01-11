import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"
import { array_includes } from "@/utils/array"
import { event_current_target } from "@/utils/event"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import Modal, { close_modal, ModalPosition, open_modal } from "@/components/Modal"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [draggable, set_draggable] = createSignal<boolean>(false)
	const [gap, set_gap] = createSignal<number>(12)
	const [content_autofocus, set_content_autofocus] = createSignal<boolean>(false)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, set_padding] = createSignal<number>(0)
	const [position, set_position] = createSignal<ModalPosition>(ModalPosition.center_bottom)
	const [anchor, set_anchor] = createSignal<boolean>(true)
	let modal_ref: HTMLDialogElement

	return (<Page
		title="Modal"
		description="A modal is an overlay window that appears on top of the main content, blocking user interaction with the underlying elements until it is dismissed. Modals are often used for critical tasks or to present important information.">
		<Playground>
			<Button c_variant={ButtonVariant.tonal} onClick={(ev) => open_modal(ev, modal_ref, {
				anchor: anchor()? event_current_target(ev) : undefined,
				allow_hide_anchor: allow_hide_anchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				content_auto_focus: content_autofocus(),
				padding: padding(),
				position: position(),
			})}>Open modal</Button>
			<Modal ref={r => modal_ref = r} style={{width: '300px'}}>
				<div style={{padding: '16px'}}>
					<TextField placeholder="Feedback"/>
					<p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
					<Button onClick={(_ev) => close_modal(modal_ref)} c_variant={ButtonVariant.filled}>Close modal</Button>
				</div>
			</Modal>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c_label="Position"
					c_values={[position()]}
					c_on_change={(options) => set_position(options[0].value as ModalPosition)}>
					<For each={[
						[ModalPosition.left_top, 'Left top'],
						[ModalPosition.left_center_to_bottom, 'Left center to bottom'],
						[ModalPosition.left_center, 'Left center'],
						[ModalPosition.left_center_to_top, 'Left center to top'],
						[ModalPosition.left_bottom, 'Left bottom'],
						[ModalPosition.right_top, 'Right top'],
						[ModalPosition.right_center_to_bottom, 'Right center to bottom'],
						[ModalPosition.right_center, 'Right center'],
						[ModalPosition.right_center_to_top, 'Right center to top'],
						[ModalPosition.right_bottom, 'Right bottom'],
						[ModalPosition.center_top_to_right, 'Center top to right'],
						[ModalPosition.center_top, 'Center top'],
						[ModalPosition.center_top_to_left, 'Center top to left'],
						[ModalPosition.center_bottom_to_right, 'Center bottom to right'],
						[ModalPosition.center_bottom, 'Center bottom'],
						[ModalPosition.center_bottom_to_left, 'Center bottom to left'],
						[ModalPosition.center_center_left_top, 'Center center left top'],
						[ModalPosition.center_center_left, 'Center center left'],
						[ModalPosition.center_center_left_bottom, 'Center center left bottom'],
						[ModalPosition.center_center_top, 'Center center top'],
						[ModalPosition.center_center, 'Center center'],
						[ModalPosition.center_center_bottom, 'Center center bottom'],
						[ModalPosition.center_center_right_top, 'Center center right top'],
						[ModalPosition.center_center_right, 'Center center right'],
						[ModalPosition.center_center_right_bottom, 'Center center right bottom'],
					]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
				</Dropdown>
				<NumberTextField
					style={{width: '100px'}}
					value={gap()}
					min={0}
					onBlur={(ev) => set_gap(g => number_safe(event_current_target(ev).valueAsNumber, g))}
					c_label="Gap"
				/>
				<Show when={array_includes([
					ModalPosition.center_top_to_right,
					ModalPosition.center_center_left,
					ModalPosition.center_bottom_to_right,
					ModalPosition.center_top_to_left,
					ModalPosition.center_center_right,
					ModalPosition.center_bottom_to_left,
					ModalPosition.left_center_to_bottom,
					ModalPosition.center_center_left_top,
					ModalPosition.center_center_top,
					ModalPosition.center_center_right_top,
					ModalPosition.right_center_to_bottom,
					ModalPosition.left_center_to_top,
					ModalPosition.center_center_left_bottom,
					ModalPosition.center_center_bottom,
					ModalPosition.center_center_right_bottom,
					ModalPosition.right_center_to_top
				], position())}>
					<NumberTextField
						value={padding()}
						style={{width: '100px'}}
						min={0}
						onBlur={(ev) => set_padding(p => number_safe(event_current_target(ev).valueAsNumber, p))}
						c_label="Padding"
					/>
				</Show>
				<CheckBox
					checked={anchor()}
					onChange={ev => set_anchor(event_current_target(ev).checked)}>
					Anchor
				</CheckBox>
				<CheckBox
					checked={important()}
					onChange={ev => setImportant(event_current_target(ev).checked)}>
					Important
				</CheckBox>
				<CheckBox
					checked={content_autofocus()}
					onChange={ev => set_content_autofocus(event_current_target(ev).checked)}>
					Input Autofocus
				</CheckBox>
				<CheckBox
					checked={draggable()}
					onChange={ev => set_draggable(event_current_target(ev).checked)}>
					Draggable
				</CheckBox>
				<CheckBox
					checked={allow_hide_anchor()}
					onChange={ev => set_allow_hide_anchor(event_current_target(ev).checked)}>
					Allow hide anchor
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _