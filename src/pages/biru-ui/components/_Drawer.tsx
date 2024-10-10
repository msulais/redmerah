import { createSignal, Show, type VoidComponent } from "solid-js"

import { _left, _tonal, _right, _checked, _currentTarget } from "@/constants/string"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import TextField from "@/components/TextField"
import Drawer, { closeDrawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [important, setImportant] = createSignal<boolean>(false)
	const [inputAutoFocus, setInputAutoFocus] = createSignal<boolean>(false)
	const [hasHeader, setHasHeader] = createSignal<boolean>(true)
	const [hasFooter, setHasFooter] = createSignal<boolean>(true)
	const [hasContent, setHasContent] = createSignal<boolean>(true)
	const [position, setPosition] = createSignal<DrawerPosition>(DrawerPosition[_left])
	let drawer_ref: HTMLDialogElement
	return (<Page
		title="Drawer"
		description="A drawer is a navigation pattern that slides in from the edge of the screen, typically revealing a list of options or actions. It's often used to conserve screen space and provide access to secondary functions.">
		<Playground>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={(ev) => openDrawer(ev, drawer_ref, {
					important: important(),
					inputAutoFocus: inputAutoFocus()
				})}>
				Open drawer
			</Button>
			<Drawer
				ref={r => drawer_ref = r}
				position={position()}
				header={<Show when={hasHeader()}><IconButton onClick={() => closeDrawer(drawer_ref)} code={0xEAFF}/> BiruUI</Show>}
				footer={<Show when={hasFooter()}>
					<DrawerItem iconCode={0xE932}>Privacy policy</DrawerItem>
					<DrawerItem iconCode={0xED47}>Terms & conditions</DrawerItem>
				</Show>}>
				<Show when={hasContent()}>
					<TextField placeholder="Search" autofocus/>
					<div/>
					<DrawerItem selected iconCode={0xE8E2}>Home</DrawerItem>
					<DrawerItem iconCode={0xE930}>About</DrawerItem>
					<DrawerItem iconCode={0xE32A}>Contact</DrawerItem>
					<DrawerItem iconCode={0xE063}>Product</DrawerItem>
					<DrawerItem iconCode={0xE84B}>Donate</DrawerItem>
				</Show>
			</Drawer>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				labelText="Position"
				style={{width: '100px'}}
				items={[
					[DrawerPosition[_left], 'Left'],
					[DrawerPosition[_right], 'Right'],
				]}
				onSelectedItemsChanged={(items) => setPosition(items[0][0] as DrawerPosition)}
				selectedValues={[position()]}
			/>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(ev[_currentTarget][_checked])}>
				Important
			</CheckBox>
			<CheckBox
				checked={hasHeader()}
				onChange={ev => setHasHeader(ev[_currentTarget][_checked])}>
				Header
			</CheckBox>
			<CheckBox
				checked={hasFooter()}
				onChange={ev => setHasFooter(ev[_currentTarget][_checked])}>
				Footer
			</CheckBox>
			<CheckBox
				checked={hasContent()}
				onChange={ev => setHasContent(ev[_currentTarget][_checked])}>
				Content
			</CheckBox>
			<CheckBox
				checked={inputAutoFocus()}
				onChange={ev => setInputAutoFocus(ev[_currentTarget][_checked])}>
				Input autofocus
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _