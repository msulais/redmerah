import { createSignal, Show, type VoidComponent } from "solid-js"

import { _centerBottom, _tonal, _currentTarget, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTop, _centerTopToLeft, _centerBottomToRight, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom, _includes, _checked, _valueAsNumber } from "@/constants/string"
import { FlyoutPosition } from "@/enums/position"
import { safeNumber } from "@/utils/math"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuItemTrailingShortcut, openMenu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField } from "@/components/TextField"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [dragable, setDragable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [inputAutoFocus, setInputAutoFocus] = createSignal<boolean>(false)
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
				dragable: dragable(),
				gap: gap(),
				important: important(),
				inputAutoFocus: inputAutoFocus(),
				padding: padding(),
				position: position()
			})}>Open menu</Button>
			<Button variant={ButtonVariant[_tonal]} onClick={(ev) => openMenu(ev, menu_ref2, {
				anchor: anchor()? ev[_currentTarget] : undefined,
				allowHideAnchor: allowHideAnchor(),
				dragable: dragable(),
				gap: gap(),
				important: important(),
				inputAutoFocus: inputAutoFocus(),
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
				items={[
					[FlyoutPosition[_leftTop], 'Left top'],
					[FlyoutPosition[_leftCenterToBottom], 'Left center to bottom'],
					[FlyoutPosition[_leftCenter], 'Left center'],
					[FlyoutPosition[_leftCenterToTop], 'Left center to top'],
					[FlyoutPosition[_leftBottom], 'Left bottom'],
					[FlyoutPosition[_rightTop], 'Right top'],
					[FlyoutPosition[_rightCenterToBottom], 'Right center to bottom'],
					[FlyoutPosition[_rightCenter], 'Right center'],
					[FlyoutPosition[_rightCenterToTop], 'Right center to top'],
					[FlyoutPosition[_rightBottom], 'Right bottom'],
					[FlyoutPosition[_centerTopToRight], 'Center top to right'],
					[FlyoutPosition[_centerTop], 'Center top'],
					[FlyoutPosition[_centerTopToLeft], 'Center top to left'],
					[FlyoutPosition[_centerBottomToRight], 'Center bottom to right'],
					[FlyoutPosition[_centerBottom], 'Center bottom'],
					[FlyoutPosition[_centerBottomToLeft], 'Center bottom to left'],
					[FlyoutPosition[_centerCenterLeftTop], 'Center center left top'],
					[FlyoutPosition[_centerCenterLeft], 'Center center left'],
					[FlyoutPosition[_centerCenterLeftBottom], 'Center center left bottom'],
					[FlyoutPosition[_centerCenterTop], 'Center center top'],
					[FlyoutPosition[_centerCenter], 'Center center'],
					[FlyoutPosition[_centerCenterBottom], 'Center center bottom'],
					[FlyoutPosition[_centerCenterRightTop], 'Center center right top'],
					[FlyoutPosition[_centerCenterRight], 'Center center right'],
					[FlyoutPosition[_centerCenterRightBottom], 'Center center right bottom'],
				]}
				labelText="Position"
				selectedValues={[position()]}
				onSelectedItemsChanged={(items) => setPosition(items[0][0] as FlyoutPosition)}
			/>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => setGap(g => safeNumber(ev[_currentTarget][_valueAsNumber], g))}
				labelText="Gap"
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
					labelText="Padding"
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
				checked={inputAutoFocus()}
				onChange={ev => setInputAutoFocus(ev[_currentTarget][_checked])}>
				Input Autofocus
			</CheckBox>
			<CheckBox
				checked={dragable()}
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