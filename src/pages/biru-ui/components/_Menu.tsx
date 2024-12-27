import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"
import { array_includes } from "@/utils/array"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemTrailingShortcut, MenuPosition, open_menu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField } from "@/components/TextField"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [allow_hide_anchor, set_allow_hide_anchor] = createSignal<boolean>(true)
	const [draggable, set_draggable] = createSignal<boolean>(false)
	const [gap, set_gap] = createSignal<number>(12)
	const [content_autofocus, set_content_autofocus] = createSignal<boolean>(false)
	const [important, set_important] = createSignal<boolean>(false)
	const [padding, set_padding] = createSignal<number>(0)
	const [position, set_position] = createSignal<MenuPosition>(MenuPosition.center_bottom)
	const [anchor, set_anchor] = createSignal<boolean>(true)
	let menu_ref: HTMLDialogElement
	let menu_ref2: HTMLDialogElement

	const C: VoidComponent = () => (<>
		<MenuItem icon_code={0xE51B} trailing="Ctrl + C">Copy</MenuItem>
		<MenuItem icon_code={0xE454} trailing={<>
			<MenuItemTrailingShortcut shortcuts={['Ctrl', 'V']}/>
		</>}>Paste</MenuItem>
		<MenuDivider />
		<MenuItem>Delete</MenuItem>
		<MenuItem icon_code={0xE59D}>Delete</MenuItem>
		<MenuItem trailing={<Icon code={0xE59D}/>}>Delete</MenuItem>
		<MenuDivider />
		<MenuHeader>Select color</MenuHeader>
		<MenuItem selected>Red</MenuItem>
		<MenuItem selected={false}>Blue</MenuItem>
		<MenuDivider />
		<MenuHeader>Check color</MenuHeader>
		<MenuItem checked>Red</MenuItem>
		<MenuItem checked={false}>Blue</MenuItem>
		<MenuDivider />
		<MenuHeader>Switch</MenuHeader>
		<SwitchMenuItem>On/off</SwitchMenuItem>
	</>)

	return (<Page
		title="Menu"
		description="A menu is a collection of options or commands that are presented to the user. It can be a simple list of items, a hierarchical structure, or a combination of both. Menus are commonly used for navigation, actions, or settings.">
		<Playground>
			<Button variant={ButtonVariant.tonal} onClick={(ev) => open_menu(ev, menu_ref, {
				anchor: anchor()? event_current_target(ev) : undefined,
				allow_hide_anchor: allow_hide_anchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				content_auto_focus: content_autofocus(),
				padding: padding(),
				position: position()
			})}>Open menu</Button>
			<Button variant={ButtonVariant.tonal} onClick={(ev) => open_menu(ev, menu_ref2, {
				anchor: anchor()? event_current_target(ev) : undefined,
				allow_hide_anchor: allow_hide_anchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				content_auto_focus: content_autofocus(),
				padding: padding(),
				position: position()
			})}>Open menu2</Button>
			<Menu ref={r => menu_ref = r} style={{width: '240px'}}>
				<TextField  attr_wrapper={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<C/>
				<MenuDivider />
				<MenuHeader>Sub menu</MenuHeader>
				<SubMenu style={{width: '240px'}} item={<SubMenuItem>1 Level</SubMenuItem>}>
					<C/>
				</SubMenu>
				<SubMenu style={{width: '240px'}} item={<SubMenuItem>2 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
					</SubMenu>
				</SubMenu>
				<SubMenu style={{width: '240px'}} item={<SubMenuItem>3 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
						<MenuDivider />
						<MenuHeader>Sub menu</MenuHeader>
						<SubMenu style={{width: '240px'}} item={<SubMenuItem>Next Level</SubMenuItem>}>
							<C/>
						</SubMenu>
					</SubMenu>
				</SubMenu>
			</Menu>
			<Menu ref={r => menu_ref2 = r} style={{width: '200px'}}>
				<TextField  attr_wrapper={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<MenuItem icon_code={0xE51B} trailing="Ctrl + C">Copy</MenuItem>
				<MenuItem icon_code={0xE454} trailing={<>
					<MenuItemTrailingShortcut shortcuts={['Ctrl', 'V']}/>
				</>}>Paste</MenuItem>
			</Menu>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				values={[position()]}
				on_change_options={(options) => set_position(options[0].value as MenuPosition)}>
				<For each={[
					[MenuPosition.left_top, 'Left top'],
					[MenuPosition.left_center_to_bottom, 'Left center to bottom'],
					[MenuPosition.left_center, 'Left center'],
					[MenuPosition.left_center_to_top, 'Left center to top'],
					[MenuPosition.left_bottom, 'Left bottom'],
					[MenuPosition.right_top, 'Right top'],
					[MenuPosition.right_center_to_bottom, 'Right center to bottom'],
					[MenuPosition.right_center, 'Right center'],
					[MenuPosition.right_center_to_top, 'Right center to top'],
					[MenuPosition.right_bottom, 'Right bottom'],
					[MenuPosition.center_top_to_right, 'Center top to right'],
					[MenuPosition.center_top, 'Center top'],
					[MenuPosition.center_top_to_left, 'Center top to left'],
					[MenuPosition.center_bottom_to_right, 'Center bottom to right'],
					[MenuPosition.center_bottom, 'Center bottom'],
					[MenuPosition.center_bottom_to_left, 'Center bottom to left'],
					[MenuPosition.center_center_left_top, 'Center center left top'],
					[MenuPosition.center_center_left, 'Center center left'],
					[MenuPosition.center_center_left_bottom, 'Center center left bottom'],
					[MenuPosition.center_center_top, 'Center center top'],
					[MenuPosition.center_center, 'Center center'],
					[MenuPosition.center_center_bottom, 'Center center bottom'],
					[MenuPosition.center_center_right_top, 'Center center right top'],
					[MenuPosition.center_center_right, 'Center center right'],
					[MenuPosition.center_center_right_bottom, 'Center center right bottom'],
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
				MenuPosition.center_top_to_right,
				MenuPosition.center_center_left,
				MenuPosition.center_bottom_to_right,
				MenuPosition.center_top_to_left,
				MenuPosition.center_center_right,
				MenuPosition.center_bottom_to_left,
				MenuPosition.left_center_to_bottom,
				MenuPosition.center_center_left_top,
				MenuPosition.center_center_top,
				MenuPosition.center_center_right_top,
				MenuPosition.right_center_to_bottom,
				MenuPosition.left_center_to_top,
				MenuPosition.center_center_left_bottom,
				MenuPosition.center_center_bottom,
				MenuPosition.center_center_right_bottom,
				MenuPosition.right_center_to_top
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
				checked={important()}
				onChange={ev => set_important(event_current_target(ev).checked)}>
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
				Dragable
			</CheckBox>
			<CheckBox
				checked={allow_hide_anchor()}
				onChange={ev => set_allow_hide_anchor(event_current_target(ev).checked)}>
				Allow hide anchor
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _