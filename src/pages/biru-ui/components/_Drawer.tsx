import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { ICON_APPS, ICON_CALL, ICON_GIFT, ICON_HOME, ICON_INFO, ICON_LINE_HORIZONTAL_3, ICON_RECEIPT, ICON_SHIELD_CHECKMARK } from "@/constants/icons"
import { eventCurrentTarget } from "@/utils/event"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import TextField from "@/components/TextField"
import Drawer, { closeDrawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [important, setImportant] = createSignal<boolean>(false)
	const [contentAutoFocus, setContentAutoFocus] = createSignal<boolean>(false)
	const [hasHeader, setHasHeader] = createSignal<boolean>(true)
	const [hasFooter, setHasFooter] = createSignal<boolean>(true)
	const [hasContent, setHasContent] = createSignal<boolean>(true)
	const [position, setPosition] = createSignal<DrawerPosition>(DrawerPosition.left)
	let drawer_ref: HTMLDialogElement
	return (<Page
		title="Drawer"
		description="A drawer is a navigation pattern that slides in from the edge of the screen, typically revealing a list of options or actions. It's often used to conserve screen space and provide access to secondary functions.">
		<Playground>
			<Button
				c:variant={ButtonVariant.tonal}
				onClick={() => openDrawer(drawer_ref, {
					important: important(),
					contentAutoFocus: contentAutoFocus()
				})}>
				Open drawer
			</Button>
			<Drawer
				ref={r => drawer_ref = r}
				c:position={position()}
				c:header={<Show when={hasHeader()}><IconButton onClick={() => closeDrawer(drawer_ref)} c:code={ICON_LINE_HORIZONTAL_3}/> BiruUI</Show>}
				c:footer={<Show when={hasFooter()}>
					<DrawerItem c:iconCode={ICON_SHIELD_CHECKMARK}>Privacy policy</DrawerItem>
					<DrawerItem c:iconCode={ICON_RECEIPT}>Terms & conditions</DrawerItem>
				</Show>}>
				<Show when={hasContent()}>
					<TextField placeholder="Search" autofocus/>
					<div/>
					<DrawerItem c:selected c:iconCode={ICON_HOME}>Home</DrawerItem>
					<DrawerItem c:iconCode={ICON_INFO}>About</DrawerItem>
					<DrawerItem c:iconCode={ICON_CALL}>Contact</DrawerItem>
					<DrawerItem c:iconCode={ICON_APPS}>Product</DrawerItem>
					<DrawerItem c:iconCode={ICON_GIFT}>Donate</DrawerItem>
				</Show>
			</Drawer>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c:label="Position"
				c:onChange={(options) => setPosition(options[0].value as DrawerPosition)}
				c:values={[position()]}>
				<For each={[
					[DrawerPosition.left, 'Left'],
					[DrawerPosition.right, 'Right'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(eventCurrentTarget(ev).checked)}>
				Important
			</CheckBox>
			<CheckBox
				checked={hasHeader()}
				onChange={ev => setHasHeader(eventCurrentTarget(ev).checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={hasFooter()}
				onChange={ev => setHasFooter(eventCurrentTarget(ev).checked)}>
				Footer
			</CheckBox>
			<CheckBox
				checked={hasContent()}
				onChange={ev => setHasContent(eventCurrentTarget(ev).checked)}>
				Content
			</CheckBox>
			<CheckBox
				checked={contentAutoFocus()}
				onChange={ev => setContentAutoFocus(eventCurrentTarget(ev).checked)}>
				Content autofocus
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _