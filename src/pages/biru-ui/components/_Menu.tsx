import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"
import { arrayIncludes } from "@/utils/array"
import { eventCurrentTarget } from "@/utils/event"
import { ICON_CLIPBOARD_PASTE, ICON_COPY, ICON_DELETE } from "@/constants/icons"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemTrailingShortcut, MenuPosition, openMenu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField } from "@/components/TextField"
import CheckBox from "@/components/CheckBox"
import Tooltip from "@/components/Tooltip"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [draggable, setDraggable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [contentAutoFocus, setContentAutoFocus] = createSignal<boolean>(false)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<MenuPosition>(MenuPosition.centerBottom)
	const [anchor, setAnchor] = createSignal<boolean>(true)
	let menuRef: HTMLDialogElement
	let menuRef2: HTMLDialogElement

	const C: VoidComponent = () => (<>
		<MenuItem c:iconCode={ICON_COPY} c:trailing="Ctrl + C">Copy</MenuItem>
		<MenuItem c:iconCode={ICON_CLIPBOARD_PASTE} c:trailing={<>
			<MenuItemTrailingShortcut c:shortcuts={['Ctrl', 'V']}/>
		</>}>Paste</MenuItem>
		<MenuDivider />
		<MenuItem>Delete</MenuItem>
		<MenuItem c:iconCode={ICON_DELETE}>Delete</MenuItem>
		<MenuItem c:trailing={<Icon c:code={ICON_DELETE}/>}>Delete</MenuItem>
		<MenuDivider />
		<MenuHeader>Select color</MenuHeader>
		<MenuItem c:selected>Red</MenuItem>
		<MenuItem c:selected={false}>Blue</MenuItem>
		<MenuDivider />
		<MenuHeader>Check color</MenuHeader>
		<MenuItem c:checked>Red</MenuItem>
		<MenuItem c:checked={false}>Blue</MenuItem>
		<MenuDivider />
		<MenuHeader>Switch</MenuHeader>
		<SwitchMenuItem>On/off</SwitchMenuItem>
	</>)

	return (<Page
		title="Menu"
		description="A menu is a collection of options or commands that are presented to the user. It can be a simple list of items, a hierarchical structure, or a combination of both. Menus are commonly used for navigation, actions, or settings.">
		<Playground>
			<Button c:variant={ButtonVariant.tonal} onClick={(ev) => openMenu(ev, menuRef, {
				anchor: anchor()? eventCurrentTarget(ev) : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				contentAutoFocus: contentAutoFocus(),
				padding: padding(),
				position: position()
			})}>Open menu</Button>
			<Button c:variant={ButtonVariant.tonal} onClick={(ev) => openMenu(ev, menuRef2, {
				anchor: anchor()? eventCurrentTarget(ev) : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				contentAutoFocus: contentAutoFocus(),
				padding: padding(),
				position: position()
			})}>Open menu2</Button>
			<Menu ref={r => menuRef = r} style={{width: '240px'}}>
				<TextField  c:attrWrapper={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<C/>
				<MenuDivider />
				<MenuHeader>Sub menu</MenuHeader>
				<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>1 Level</SubMenuItem>}>
					<C/>
				</SubMenu>
				<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>2 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
					</SubMenu>
				</SubMenu>
				<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>3 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
						<MenuDivider />
						<MenuHeader>Sub menu</MenuHeader>
						<SubMenu style={{width: '240px'}} c:item={<SubMenuItem>Next Level</SubMenuItem>}>
							<C/>
						</SubMenu>
					</SubMenu>
				</SubMenu>
			</Menu>
			<Menu ref={r => menuRef2 = r} style={{width: '200px'}}>
				<TextField  c:attrWrapper={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<MenuItem c:iconCode={ICON_COPY} c:trailing="Ctrl + C">Copy</MenuItem>
				<MenuItem c:iconCode={ICON_CLIPBOARD_PASTE} c:trailing={<>
					<MenuItemTrailingShortcut c:shortcuts={['Ctrl', 'V']}/>
				</>}>Paste</MenuItem>
			</Menu>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Position"
					c:values={[position()]}
					c:onChange={(options) => setPosition(options[0].value as MenuPosition)}>
					<For each={[
						[MenuPosition.leftTop, 'Left top'],
						[MenuPosition.leftCenterToBottom, 'Left center to bottom'],
						[MenuPosition.leftCenter, 'Left center'],
						[MenuPosition.leftCenterToTop, 'Left center to top'],
						[MenuPosition.leftBottom, 'Left bottom'],
						[MenuPosition.rightTop, 'Right top'],
						[MenuPosition.rightCenterToBottom, 'Right center to bottom'],
						[MenuPosition.rightCenter, 'Right center'],
						[MenuPosition.rightCenterToTop, 'Right center to top'],
						[MenuPosition.rightBottom, 'Right bottom'],
						[MenuPosition.centerTopToRight, 'Center top to right'],
						[MenuPosition.centerTop, 'Center top'],
						[MenuPosition.centerTopToLeft, 'Center top to left'],
						[MenuPosition.centerBottomToRight, 'Center bottom to right'],
						[MenuPosition.centerBottom, 'Center bottom'],
						[MenuPosition.centerBottomToLeft, 'Center bottom to left'],
						[MenuPosition.centerCenterLeftTop, 'Center center left top'],
						[MenuPosition.centerCenterLeft, 'Center center left'],
						[MenuPosition.centerCenterLeftBottom, 'Center center left bottom'],
						[MenuPosition.centerCenterTop, 'Center center top'],
						[MenuPosition.centerCenter, 'Center center'],
						[MenuPosition.centerCenterBottom, 'Center center bottom'],
						[MenuPosition.centerCenterRightTop, 'Center center right top'],
						[MenuPosition.centerCenterRight, 'Center center right'],
						[MenuPosition.centerCenterRightBottom, 'Center center right bottom'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<NumberTextField
					style={{width: '100px'}}
					value={gap()}
					min={0}
					onBlur={(ev) => setGap(g => numberSafe(eventCurrentTarget(ev).valueAsNumber, g))}
					c:label="Gap"
				/>
				<Show when={arrayIncludes([
					MenuPosition.centerTopToRight,
					MenuPosition.centerCenterLeft,
					MenuPosition.centerBottomToRight,
					MenuPosition.centerTopToLeft,
					MenuPosition.centerCenterRight,
					MenuPosition.centerBottomToLeft,
					MenuPosition.leftCenterToBottom,
					MenuPosition.centerCenterLeftTop,
					MenuPosition.centerCenterTop,
					MenuPosition.centerCenterRightTop,
					MenuPosition.rightCenterToBottom,
					MenuPosition.leftCenterToTop,
					MenuPosition.centerCenterLeftBottom,
					MenuPosition.centerCenterBottom,
					MenuPosition.centerCenterRightBottom,
					MenuPosition.rightCenterToTop
				], position())}>
					<NumberTextField
						value={padding()}
						style={{width: '100px'}}
						min={0}
						onBlur={(ev) => setPadding(p => numberSafe(eventCurrentTarget(ev).valueAsNumber, p))}
						c:label="Padding"
					/>
				</Show>
				<CheckBox
					checked={anchor()}
					onChange={ev => setAnchor(eventCurrentTarget(ev).checked)}>
					Anchor
				</CheckBox>
				<CheckBox
					checked={important()}
					onChange={ev => setImportant(eventCurrentTarget(ev).checked)}>
					Important
				</CheckBox>
				<CheckBox
					checked={contentAutoFocus()}
					onChange={ev => setContentAutoFocus(eventCurrentTarget(ev).checked)}>
					Input Autofocus
				</CheckBox>
				<CheckBox
					checked={draggable()}
					onChange={ev => setDraggable(eventCurrentTarget(ev).checked)}>
					Dragable
				</CheckBox>
				<CheckBox
					checked={allowHideAnchor()}
					onChange={ev => setAllowHideAnchor(eventCurrentTarget(ev).checked)}>
					Allow hide anchor
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _