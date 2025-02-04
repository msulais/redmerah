import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { ICON_APPS, ICON_CALL, ICON_GIFT, ICON_HOME, ICON_INFO, ICON_LINE_HORIZONTAL_3, ICON_RECEIPT, ICON_SHIELD_CHECKMARK } from "@/constants/icons"
import { event_current_target } from "@/utils/event"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField from "@/components/TextField"
import Drawer, { close_drawer, DrawerItem, DrawerPosition, open_drawer } from "@/components/Drawer"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [important, set_important] = createSignal<boolean>(false)
	const [content_autofocus, set_content_autofocus] = createSignal<boolean>(false)
	const [has_header, set_has_header] = createSignal<boolean>(true)
	const [has_footer, set_has_footer] = createSignal<boolean>(true)
	const [has_content, set_has_content] = createSignal<boolean>(true)
	const [position, set_position] = createSignal<DrawerPosition>(DrawerPosition.left)
	let drawer_ref: HTMLDialogElement
	return (<Page
		title="Drawer"
		description="A drawer is a navigation pattern that slides in from the edge of the screen, typically revealing a list of options or actions. It's often used to conserve screen space and provide access to secondary functions.">
		<Playground>
			<Button
				c_variant={ButtonVariant.tonal}
				onClick={(ev) => open_drawer(ev, drawer_ref, {
					important: important(),
					content_auto_focus: content_autofocus()
				})}>
				Open drawer
			</Button>
			<Drawer
				ref={r => drawer_ref = r}
				c_position={position()}
				c_header={<Show when={has_header()}><IconButton onClick={() => close_drawer(drawer_ref)} c_code={ICON_LINE_HORIZONTAL_3}/> BiruUI</Show>}
				c_footer={<Show when={has_footer()}>
					<DrawerItem c_icon_code={ICON_SHIELD_CHECKMARK}>Privacy policy</DrawerItem>
					<DrawerItem c_icon_code={ICON_RECEIPT}>Terms & conditions</DrawerItem>
				</Show>}>
				<Show when={has_content()}>
					<TextField placeholder="Search" autofocus/>
					<div/>
					<DrawerItem c_selected c_icon_code={ICON_HOME}>Home</DrawerItem>
					<DrawerItem c_icon_code={ICON_INFO}>About</DrawerItem>
					<DrawerItem c_icon_code={ICON_CALL}>Contact</DrawerItem>
					<DrawerItem c_icon_code={ICON_APPS}>Product</DrawerItem>
					<DrawerItem c_icon_code={ICON_GIFT}>Donate</DrawerItem>
				</Show>
			</Drawer>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c_label="Position"
				c_on_change={(options) => set_position(options[0].value as DrawerPosition)}
				c_values={[position()]}>
				<For each={[
					[DrawerPosition.left, 'Left'],
					[DrawerPosition.right, 'Right'],
				]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={important()}
				onChange={ev => set_important(event_current_target(ev).checked)}>
				Important
			</CheckBox>
			<CheckBox
				checked={has_header()}
				onChange={ev => set_has_header(event_current_target(ev).checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={has_footer()}
				onChange={ev => set_has_footer(event_current_target(ev).checked)}>
				Footer
			</CheckBox>
			<CheckBox
				checked={has_content()}
				onChange={ev => set_has_content(event_current_target(ev).checked)}>
				Content
			</CheckBox>
			<CheckBox
				checked={content_autofocus()}
				onChange={ev => set_content_autofocus(event_current_target(ev).checked)}>
				Content autofocus
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _