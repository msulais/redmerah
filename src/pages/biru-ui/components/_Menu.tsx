import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { _centerBottom, _tonal, _currentTarget, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTop, _centerTopToLeft, _centerBottomToRight, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom, _includes, _checked, _valueAsNumber, _value } from "@/constants/string"
import { FlyoutPosition } from "@/enums/position"
import { safeNumber } from "@/utils/math"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemTrailingShortcut, MenuPosition, openMenu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField } from "@/components/TextField"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [draggable, setDragable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [contentAutoFocus, setInputAutoFocus] = createSignal<boolean>(false)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<FlyoutPosition>(FlyoutPosition[_centerBottom])
	const [anchor, setAnchor] = createSignal<boolean>(true)
	let menu_ref: HTMLDialogElement
	let menu_ref2: HTMLDialogElement

	const C: VoidComponent = () => (<>
		<MenuItem iconCode={0xE51B} trailing="Ctrl + C">Copy</MenuItem>
		<MenuItem iconCode={0xE454} trailing={<>
			<MenuItemTrailingShortcut shortcuts={['Ctrl', 'V']}/>
		</>}>Paste</MenuItem>
		<MenuDivider />
		<MenuItem>Delete</MenuItem>
		<MenuItem iconCode={0xE59D}>Delete</MenuItem>
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
			<Button variant={ButtonVariant[_tonal]} onClick={(ev) => openMenu(ev, menu_ref, {
				anchor: anchor()? ev[_currentTarget] : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				contentAutoFocus: contentAutoFocus(),
				padding: padding(),
				position: position()
			})}>Open menu</Button>
			<Button variant={ButtonVariant[_tonal]} onClick={(ev) => openMenu(ev, menu_ref2, {
				anchor: anchor()? ev[_currentTarget] : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				contentAutoFocus: contentAutoFocus(),
				padding: padding(),
				position: position()
			})}>Open menu2</Button>
			<Menu ref={r => menu_ref = r} style={{width: '240px'}}>
				<TextField  wrapperAttr={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<C/>
				<MenuDivider />
				<MenuHeader>Sub menu</MenuHeader>
				<SubMenu style={{width: '240px'}} level={1} item={<SubMenuItem>1 Level</SubMenuItem>}>
					<C/>
				</SubMenu>
				<SubMenu style={{width: '240px'}} level={1} item={<SubMenuItem>2 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} level={2} item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
					</SubMenu>
				</SubMenu>
				<SubMenu style={{width: '240px'}} level={1} item={<SubMenuItem>3 Level</SubMenuItem>}>
					<C/>
					<MenuDivider />
					<MenuHeader>Sub menu</MenuHeader>
					<SubMenu style={{width: '240px'}} level={2} item={<SubMenuItem>Next Level</SubMenuItem>}>
						<C/>
						<MenuDivider />
						<MenuHeader>Sub menu</MenuHeader>
						<SubMenu style={{width: '240px'}} level={3} item={<SubMenuItem>Next Level</SubMenuItem>}>
							<C/>
						</SubMenu>
					</SubMenu>
				</SubMenu>
			</Menu>
			<Menu ref={r => menu_ref2 = r} style={{width: '200px'}}>
				<TextField  wrapperAttr={{style: {width: 'calc(100% - 16px)', margin: '4px 8px'}}} placeholder="Input"/>
				<MenuDivider />
				<MenuItem iconCode={0xE51B} trailing="Ctrl + C">Copy</MenuItem>
				<MenuItem iconCode={0xE454} trailing={<>
					<MenuItemTrailingShortcut shortcuts={['Ctrl', 'V']}/>
				</>}>Paste</MenuItem>
			</Menu>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Position"
				values={[position()]}
				onChangeOptions={(options) => setPosition(options[0][_value] as MenuPosition)}>
				<For each={[
					[MenuPosition[_leftTop], 'Left top'],
					[MenuPosition[_leftCenterToBottom], 'Left center to bottom'],
					[MenuPosition[_leftCenter], 'Left center'],
					[MenuPosition[_leftCenterToTop], 'Left center to top'],
					[MenuPosition[_leftBottom], 'Left bottom'],
					[MenuPosition[_rightTop], 'Right top'],
					[MenuPosition[_rightCenterToBottom], 'Right center to bottom'],
					[MenuPosition[_rightCenter], 'Right center'],
					[MenuPosition[_rightCenterToTop], 'Right center to top'],
					[MenuPosition[_rightBottom], 'Right bottom'],
					[MenuPosition[_centerTopToRight], 'Center top to right'],
					[MenuPosition[_centerTop], 'Center top'],
					[MenuPosition[_centerTopToLeft], 'Center top to left'],
					[MenuPosition[_centerBottomToRight], 'Center bottom to right'],
					[MenuPosition[_centerBottom], 'Center bottom'],
					[MenuPosition[_centerBottomToLeft], 'Center bottom to left'],
					[MenuPosition[_centerCenterLeftTop], 'Center center left top'],
					[MenuPosition[_centerCenterLeft], 'Center center left'],
					[MenuPosition[_centerCenterLeftBottom], 'Center center left bottom'],
					[MenuPosition[_centerCenterTop], 'Center center top'],
					[MenuPosition[_centerCenter], 'Center center'],
					[MenuPosition[_centerCenterBottom], 'Center center bottom'],
					[MenuPosition[_centerCenterRightTop], 'Center center right top'],
					[MenuPosition[_centerCenterRight], 'Center center right'],
					[MenuPosition[_centerCenterRightBottom], 'Center center right bottom'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => setGap(g => safeNumber(ev[_currentTarget][_valueAsNumber], g))}
				label="Gap"
			/>
			<Show when={[
				FlyoutPosition[_centerTopToRight],
				FlyoutPosition[_centerCenterLeft],
				FlyoutPosition[_centerBottomToRight],
				FlyoutPosition[_centerTopToLeft],
				FlyoutPosition[_centerCenterRight],
				FlyoutPosition[_centerBottomToLeft],
				FlyoutPosition[_leftCenterToBottom],
				FlyoutPosition[_centerCenterLeftTop],
				FlyoutPosition[_centerCenterTop],
				FlyoutPosition[_centerCenterRightTop],
				FlyoutPosition[_rightCenterToBottom],
				FlyoutPosition[_leftCenterToTop],
				FlyoutPosition[_centerCenterLeftBottom],
				FlyoutPosition[_centerCenterBottom],
				FlyoutPosition[_centerCenterRightBottom],
				FlyoutPosition[_rightCenterToTop]
			][_includes](position())}>
				<NumberTextField
					value={padding()}
					style={{width: '100px'}}
					min={0}
					onBlur={(ev) => setPadding(p => safeNumber(ev[_currentTarget][_valueAsNumber], p))}
					label="Padding"
				/>
			</Show>
			<CheckBox
				checked={anchor()}
				onChange={ev => setAnchor(ev[_currentTarget][_checked])}>
				Anchor
			</CheckBox>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(ev[_currentTarget][_checked])}>
				Important
			</CheckBox>
			<CheckBox
				checked={contentAutoFocus()}
				onChange={ev => setInputAutoFocus(ev[_currentTarget][_checked])}>
				Input Autofocus
			</CheckBox>
			<CheckBox
				checked={draggable()}
				onChange={ev => setDragable(ev[_currentTarget][_checked])}>
				Dragable
			</CheckBox>
			<CheckBox
				checked={allowHideAnchor()}
				onChange={ev => setAllowHideAnchor(ev[_currentTarget][_checked])}>
				Allow hide anchor
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _