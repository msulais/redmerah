import { createSignal, For, Show, type VoidComponent } from "solid-js"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField from "@/components/TextField"
import Drawer, { close_drawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

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
				variant={ButtonVariant.tonal}
				onClick={(ev) => openDrawer(ev, drawer_ref, {
					important: important(),
					content_auto_focus: content_autofocus()
				})}>
				Open drawer
			</Button>
			<Drawer
				ref={r => drawer_ref = r}
				position={position()}
				header={<Show when={has_header()}><IconButton onClick={() => close_drawer(drawer_ref)} code={0xEAFF}/> BiruUI</Show>}
				footer={<Show when={has_footer()}>
					<DrawerItem icon_code={0xE932}>Privacy policy</DrawerItem>
					<DrawerItem icon_code={0xED47}>Terms & conditions</DrawerItem>
				</Show>}>
				<Show when={has_content()}>
					<TextField placeholder="Search" autofocus/>
					<div/>
					<DrawerItem selected icon_code={0xE8E2}>Home</DrawerItem>
					<DrawerItem icon_code={0xE930}>About</DrawerItem>
					<DrawerItem icon_code={0xE32A}>Contact</DrawerItem>
					<DrawerItem icon_code={0xE063}>Product</DrawerItem>
					<DrawerItem icon_code={0xE84B}>Donate</DrawerItem>
				</Show>
			</Drawer>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				on_change_options={(options) => set_position(options[0].value as DrawerPosition)}
				values={[position()]}>
				<For each={[
					[DrawerPosition.left, 'Left'],
					[DrawerPosition.right, 'Right'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
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