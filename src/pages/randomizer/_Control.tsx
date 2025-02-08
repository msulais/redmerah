import { For, Match, Show, Switch, type VoidComponent, createEffect, createMemo, createSignal, createUniqueId } from "solid-js"
import type { SetStoreFunction, Store } from "solid-js/store"

import type { ItemList, Settings } from "./_types"
import { elementDataset, elementId, elementRect, elementTagName, elementValidTarget } from "@/utils/element"
import { RandomizerType, ColorsRandomizerColorSpace, Commands } from "./_enums"
import { eventCurrentTarget, eventPreventDefault } from "@/utils/event"
import { arrayFind, arrayJoin, arrayLength, arrayPush } from "@/utils/array"
import { numberIsNotDefined, numberParse, numberSafe } from "@/utils/number"
import { stringLength, stringMatch, stringReplace } from "@/utils/string"
import { documentActive } from "@/utils/document"
import { mathClamp } from "@/utils/math"
import { rectWidth } from "@/utils/rect"
import { ICON_ADD, ICON_APPS_LIST_DETAIL, ICON_ARROW_EXPORT_UP, ICON_CHECKBOX_CHECKED, ICON_CHEVRON_DOWN, ICON_DELETE, ICON_EYE, ICON_TEXT_BULLET_LIST_SQUARE_CLOCK, ICON_TEXT_BULLET_LIST_SQUARE_EDIT } from "@/constants/icons"

import Icon from "@/components/Icon"
import TextField, { NumberTextField, TextFieldButton, updateTextFieldValue } from "@/components/TextField"
import Menu, { closeMenu, MenuDivider, MenuHeader, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'

const Teams: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, setLists] = createSignal<ItemList | null>(null)
	const [isActionOpenForListNames, setIsActionOpenForListNames] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings[0].teams)
	const lists = createMemo(() => props.lists[0])
	const buttonAction_selectId = createUniqueId()
	const buttonAction_viewListId = createUniqueId()
	const buttonAction_exportListId = createUniqueId()
	const buttonAction_editListId = createUniqueId()
	const buttonAction_deleteListId = createUniqueId()
	const buttonMembers_addNewListId = createUniqueId()
	const buttonMembers_resetAllListId = createUniqueId()
	const buttonMembers_editListId = createUniqueId()
	const buttonNames_addNewListId = createUniqueId()
	const buttonNames_resetAllListId = createUniqueId()
	const buttonNames_editListId = createUniqueId()
	let dropdownMenu_listNamesRef: HTMLDialogElement
	let dropdownMenu_ListMembersRef: HTMLDialogElement
	let menuActionRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemListToDropdownList(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			arrayPush(items, [l.id, l.name, arrayLength(l.items) + ''])
		}

		return items
	}

	function updateListNames(id: number): void {
		const $list = arrayFind(lists(), list => list.id == id)
		if ($list == undefined) return;

		setLists($list)
		command(Commands.updateSettingsTeamsListNames, list())
	}

	function updateListMembers(id: number): void {
		const $list = arrayFind(lists(), list => list.id == id)
		if ($list == undefined) return;

		setLists($list)
		command(Commands.updateSettingsTeamsListMembers, list())
	}

	function onContextMenuDropdownItem(ev: MouseEvent & {
		currentTarget: HTMLDialogElement
		target: Element
	}, listNames: boolean): void {
		const button = documentActive()!
		if (!elementValidTarget(
			eventCurrentTarget(ev),
			button,
			el => elementTagName(el) == 'BUTTON'
		)) return

		const dataListIndex = elementDataset(button, 'listIndex')
		if (dataListIndex) {
			const index = numberParse(dataListIndex, true)
			if (numberIsNotDefined(index)) return

			const option = itemListToDropdownList(lists())[index]
			for (const li of lists()) {
				if (li.id != option[0]) continue;
				setLists(li)
				break
			}
			setIsActionOpenForListNames(listNames)
			openMenu(ev, menuActionRef, {
				position: MenuPosition.centerBottomToRight
			})
			eventPreventDefault(ev)
			return
		}
	}

	return (<>
		<NumberTextField
			c:label="Count"
			min={1}
			max={arrayLength(settings().listMembers.items)}
			onBlur={ev => command(
				Commands.updateSettingsTeamsCount,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().count)
			)}
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
		<Dropdown
			c:label="Names"
			c:values={[settings().listNames.id]}
			c:onChange={(options) => updateListNames(options[0].value as number)}
			c:attrMenu={{
				ref: (r) => dropdownMenu_listNamesRef = r,
				onContextMenu: ev => onContextMenuDropdownItem(ev, true),
				onClick: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonNames_addNewListId:
						command(Commands.addList, ev)
						closeMenu(dropdownMenu_listNamesRef)
						break
					case buttonNames_resetAllListId:
						command(Commands.resetList, ev)
						closeMenu(dropdownMenu_listNamesRef)
						break
					case buttonNames_editListId:
						command(Commands.editList, ev)
						closeMenu(dropdownMenu_listNamesRef)
						break
					}
				}
			}}>
			<MenuItem
				id={buttonNames_addNewListId}
				c:iconCode={ICON_ADD}>
				Add new list
			</MenuItem>
			<MenuItem
				id={buttonNames_resetAllListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_CLOCK}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={buttonNames_editListId}
				c:iconCode={ICON_APPS_LIST_DETAIL}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={arrayLength(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemListToDropdownList(lists())}>{(option, i) =>
				<DropdownOption
					c:value={option[0]}
					c:text={option[1]}
					c:trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Dropdown
			c:label="Members"
			c:values={[settings().listMembers.id]}
			c:onChange={options => updateListMembers(options[0].value as number)}
			c:attrMenu={{
				ref: (r) => dropdownMenu_ListMembersRef = r,
				onClick: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonMembers_addNewListId:
						command(Commands.addList, ev)
						closeMenu(dropdownMenu_ListMembersRef)
						break
					case buttonMembers_resetAllListId:
						command(Commands.resetList, ev)
						closeMenu(dropdownMenu_ListMembersRef)
						break
					case buttonMembers_editListId:
						command(Commands.editList, ev)
						closeMenu(dropdownMenu_ListMembersRef)
						break
					}
				},
				onContextMenu: ev => onContextMenuDropdownItem(ev, false)
			}}>
			<MenuItem
				id={buttonMembers_addNewListId}
				c:iconCode={ICON_ADD}>
				Add new list
			</MenuItem>
			<MenuItem
				id={buttonMembers_resetAllListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_CLOCK}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={buttonMembers_editListId}
				c:iconCode={ICON_APPS_LIST_DETAIL}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={arrayLength(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemListToDropdownList(lists())}>{(option, i) =>
				<DropdownOption
					c:value={option[0]}
					c:text={option[1]}
					c:trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu
			ref={r => menuActionRef = r}
			style={{width: '164px'}}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				const closeAll = () => {
					closeMenu(menuActionRef)
					closeMenu(dropdownMenu_listNamesRef)
					closeMenu(dropdownMenu_ListMembersRef)
				}

				switch (elementId(button)) {
				case buttonAction_selectId:
					closeAll()
					if (isActionOpenForListNames()) updateListNames(list()!.id)
					else updateListMembers(list()!.id)
					break
				case buttonAction_viewListId:
					closeAll()
					command(Commands.viewList, ev, list())
					break
				case buttonAction_exportListId:
					closeAll()
					command(Commands.exportList, list())
					break
				case buttonAction_editListId:
					closeAll()
					command(Commands.editList, ev, list())
					break
				case buttonAction_deleteListId:
					closeAll()
					command(Commands.editList, ev, list())
					break
				}
			}}>
			<Show when={list() && list()!.id != (isActionOpenForListNames()? settings().listNames.id : settings().listMembers.id)}>
				<MenuItem
					id={buttonAction_selectId}
					c:iconCode={ICON_CHECKBOX_CHECKED}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				id={buttonAction_viewListId}
				c:iconCode={ICON_EYE}>
				View list
			</MenuItem>
			<MenuItem
				id={buttonAction_exportListId}
				c:iconCode={ICON_ARROW_EXPORT_UP}
				c:trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				id={buttonAction_editListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_EDIT}>
				Edit list
			</MenuItem>
			<MenuItem
				id={buttonAction_deleteListId}
				c:iconCode={ICON_DELETE}>
				Delete list
			</MenuItem>
		</Menu>
	</>)
}

const Selection: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, setList] = createSignal<ItemList | null>(null)
	const lists = createMemo(() => props.lists[0])
	const settings = createMemo(() => props.settings[0].selection)
	const buttonActions_selectId = createUniqueId()
	const buttonActions_viewListId = createUniqueId()
	const buttonActions_exportListId = createUniqueId()
	const buttonActions_editListId = createUniqueId()
	const buttonActions_deleteListId = createUniqueId()
	const buttonList_addNewListId = createUniqueId()
	const buttonList_resetAllListId = createUniqueId()
	const buttonList_editListId = createUniqueId()
	let menuDropdownRef: HTMLDialogElement
	let menuActionRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemListToDropdownList(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			arrayPush(items, [l.id, l.name, arrayLength(l.items) + ''])
		}

		return items
	}

	function updateList(id: number): void {
		for (const li of lists()) {
			if (li.id != id) continue;
			setList(li)
			break
		}
		command(Commands.updateSettingsSelectionList, list())
	}

	return (<>
		<Dropdown
			c:label="List"
			c:values={[settings().list.id]}
			c:onChange={options => updateList(options[0].value as number)}
			c:attrMenu={{
				ref: (r) => menuDropdownRef = r,
				onClick: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonList_addNewListId:
						command(Commands.addList, ev)
						closeMenu(menuDropdownRef)
						break
					case buttonList_resetAllListId:
						command(Commands.resetList, ev)
						closeMenu(menuDropdownRef)
						break
					case buttonList_editListId:
						command(Commands.editList, ev)
						closeMenu(menuDropdownRef)
						break
					}
				},
				onContextMenu: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataListIndex = elementDataset(button, 'listIndex')
					if (dataListIndex) {
						const index = numberParse(dataListIndex, true)
						if (numberIsNotDefined(index)) return

						const option = itemListToDropdownList(lists())[index]
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							setList(li)
							break
						}
						openMenu(ev, menuActionRef, {
							position: MenuPosition.centerBottomToRight
						})
						eventPreventDefault(ev)
						return
					}
				}
			}}>
			<MenuItem
				id={buttonList_addNewListId}
				c:iconCode={ICON_ADD}>
				Add new list
			</MenuItem>
			<MenuItem
				id={buttonList_resetAllListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_CLOCK}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={buttonList_editListId}
				c:iconCode={ICON_APPS_LIST_DETAIL}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={arrayLength(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemListToDropdownList(lists())}>{(option, i) =>
				<DropdownOption
					c:value={option[0]}
					c:text={option[1]}
					c:trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu
			ref={r => menuActionRef = r}
			style={{width: '164px'}}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonActions_selectId:
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					updateList(list()!.id)
					break
				case buttonActions_viewListId:
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					command(Commands.viewList, ev, list())
					break
				case buttonActions_exportListId:
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					command(Commands.exportList, list())
					break
				case buttonActions_editListId:
					command(Commands.editList, ev, list())
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					break
				case buttonActions_deleteListId:
					command(Commands.editList, ev, list())
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					break
				}
			}}>
			<Show when={list() && list()!.id != settings().list.id}>
				<MenuItem
					id={buttonActions_selectId}
					c:iconCode={ICON_CHECKBOX_CHECKED}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				id={buttonActions_viewListId}
				c:iconCode={ICON_EYE}>
				View list
			</MenuItem>
			<MenuItem
				id={buttonActions_exportListId}
				c:iconCode={ICON_ARROW_EXPORT_UP}
				c:trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				id={buttonActions_editListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_EDIT}>
				Edit list
			</MenuItem>
			<MenuItem
				id={buttonActions_deleteListId}
				c:iconCode={ICON_DELETE}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			c:label="Count"
			min={1}
			max={arrayLength(settings().list.items)}
			onBlur={ev => command(
				Commands.updateSettingsSelectionCount,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().count)
			)}
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
	</>)
}

const Words: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, set_list] = createSignal<ItemList | null>(null)
	const lists = createMemo(() => props.lists[0])
	const settings = createMemo(() => props.settings[0].words)
	const buttonList_addNewListId = createUniqueId()
	const buttonList_resetAllListId = createUniqueId()
	const buttonList_editListId = createUniqueId()
	let menuDropdownRef: HTMLDialogElement
	let menuActionRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemListToDropdownList(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			arrayPush(items, [l.id, l.name, arrayLength(l.items) + ''])
		}

		return items
	}

	function updateList(id: number): void {
		for (const li of lists()) {
			if (li.id != id) continue;
			set_list(li)
			break
		}
		command(Commands.updateSettingsWordsList, list())
	}

	return (<>
		<Dropdown
			c:label="List"
			c:values={[settings().list.id]}
			c:onChange={options => updateList(options[0].value as number)}
			c:attrMenu={{
				ref: (r) => menuDropdownRef = r,
				onClick: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonList_addNewListId:
						command(Commands.addList, ev)
						closeMenu(menuDropdownRef)
						break
					case buttonList_resetAllListId:
						command(Commands.resetList, ev)
						closeMenu(menuDropdownRef)
						break
					case buttonList_editListId:
						command(Commands.editList, ev)
						closeMenu(menuDropdownRef)
						break
					}
				},
				onContextMenu: ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataListIndex = elementDataset(button, 'listIndex')
					if (dataListIndex) {
						const index = numberParse(dataListIndex, true)
						if (numberIsNotDefined(index)) return

						const option = itemListToDropdownList(lists())[index]
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						openMenu(ev, menuActionRef, {
							position: MenuPosition.centerBottomToRight
						})
						eventPreventDefault(ev)
						return
					}
				}
			}}>
			<MenuItem
				id={buttonList_addNewListId}
				c:iconCode={ICON_ADD}>
				Add new list
			</MenuItem>
			<MenuItem
				id={buttonList_resetAllListId}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_CLOCK}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={buttonList_editListId}
				c:iconCode={ICON_APPS_LIST_DETAIL}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={arrayLength(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemListToDropdownList(lists())}>{(option, i) =>
				<DropdownOption
					c:value={option[0]}
					c:text={option[1]}
					c:trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu ref={r => menuActionRef = r} style={{width: '164px'}}>
			<Show when={list() && list()!.id != settings().list.id}>
				<MenuItem
					onClick={async () => {
						closeMenu(menuActionRef)
						closeMenu(menuDropdownRef)
						updateList(list()!.id)
					}}
					c:iconCode={ICON_CHECKBOX_CHECKED}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					command(Commands.viewList, ev, list())
				}}
				c:iconCode={ICON_EYE}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
					command(Commands.exportList, list())
				}}
				c:iconCode={ICON_ARROW_EXPORT_UP}
				c:trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.editList, ev, list())
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
				}}
				c:iconCode={ICON_TEXT_BULLET_LIST_SQUARE_EDIT}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.editList, ev, list())
					closeMenu(menuActionRef)
					closeMenu(menuDropdownRef)
				}}
				c:iconCode={ICON_DELETE}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			c:label="Count"
			min={1}
			onBlur={ev => command(
				Commands.updateSettingsWordsCount,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().count)
			)}
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
	</>)
}

const Colors: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings[0].colors)

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function getMinMax(
		value: string,
		maxValue: number,
		defaultValue: {min: number; max: number }
	): {min: number; max: number} {
		let min: number = defaultValue.min
		let max: number = defaultValue.max
		const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const r =  stringMatch(stringReplace(value, unnecesaryChar, ''), rangeRegex)
		if (r == null) return {min, max}

		min = mathClamp(numberSafe(numberParse(r[1], true), defaultValue.min), 0, maxValue)
		max = mathClamp(numberSafe(numberParse(r[2], true), defaultValue.max), 0, maxValue)

		if (min > max) min = max
		return {min, max}
	}

	return (<>
		<NumberTextField
			min={1}
			c:label="Count"
			value={settings().count}
			onBlur={ev => command(
				Commands.updateSettingsColorsCount,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().count)
			)}
		/>
		<Switch>
			<Match when={settings().space == ColorsRandomizerColorSpace.hex}>
				<TextField
					c:label="Hex"
					placeholder="0-16777215 - 0-16777215"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							0xffffff,
							{
								min: settings().range.hex.min,
								max: settings().range.hex.max
							}
						)
						command(Commands.updateSettingsColorsRangeHex, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.hex.min,
						settings().range.hex.max
					], ' - ')}
				/>
			</Match>
			<Match when={settings().space == ColorsRandomizerColorSpace.hsl}>
				<TextField
					c:label="Hue"
					placeholder="0-360 - 0-360"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							360,
							{
								min: settings().range.hsl.h.min,
								max: settings().range.hsl.h.max
							}
						)
						command(Commands.updateSettingsColorsRangeHslH, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.hsl.h.min,
						settings().range.hsl.h.max
					], ' - ')}
				/>
				<TextField
					c:label="Saturation"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							100,
							{
								min: settings().range.hsl.s.min,
								max: settings().range.hsl.s.max
							}
						)
						command(Commands.updateSettingsColorsRangeHslS, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.hsl.s.min,
						settings().range.hsl.s.max
					], ' - ')}
				/>
				<TextField
					c:label="Lightness"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							100,
							{
								min: settings().range.hsl.l.min,
								max: settings().range.hsl.l.max
							}
						)
						command(Commands.updateSettingsColorsRangeHslL, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.hsl.l.min,
						settings().range.hsl.l.max
					], ' - ')}
				/>
			</Match>
			<Match when={settings().space == ColorsRandomizerColorSpace.rgb}>
				<TextField
					c:label="Red"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							255,
							{
								min: settings().range.rgb.r.min,
								max: settings().range.rgb.r.max
							}
						)
						command(Commands.updateSettingsColorsRangeRgbR, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.rgb.r.min,
						settings().range.rgb.r.max
					], ' - ')}
				/>
				<TextField
					c:label="Green"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							255,
							{
								min: settings().range.rgb.g.min,
								max: settings().range.rgb.g.max
							}
						)
						command(Commands.updateSettingsColorsRangeRgbG, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.rgb.g.min,
						settings().range.rgb.g.max
					], ' - ')}
				/>
				<TextField
					c:label="Blue"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = eventCurrentTarget(ev)
						const values = getMinMax(
							self.value,
							255,
							{
								min: settings().range.rgb.b.min,
								max: settings().range.rgb.b.max
							}
						)
						command(Commands.updateSettingsColorsRangeRgbB, values.min, values.max)
						updateTextFieldValue(self, arrayJoin([values.min, values.max], ' - '))
					}}
					value={arrayJoin([
						settings().range.rgb.b.min,
						settings().range.rgb.b.max
					], ' - ')}
				/>
			</Match>
		</Switch>
	</>)
}

const Numbers: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings[0].numbers)

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function onBlurRange(ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}): void {
		const self = eventCurrentTarget(ev)
		const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const r = stringMatch(stringReplace(self.value, unnecesaryChar, ''), rangeRegex)
		if (r == null) return updateTextFieldValue(
			self,
			arrayJoin([settings().range.min, settings().range.max], ' - ')
		)

		const max = numberParse(r[2], true)
		let min = numberParse(r[1], true)

		if (min > max) min = max

		command(Commands.updateSettingsNumbersRange, min, max)
		updateTextFieldValue(self, arrayJoin([min, max], ' - '))
	}

	return (<>
		<TextField
			c:label="Range"
			onBlur={onBlurRange}
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={arrayJoin([settings().range.min, settings().range.max], ' - ')}
		/>
		<NumberTextField
			c:label="Count"
			min={1}
			onBlur={ev => command(
				Commands.updateSettingsNumbersCount,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().count)
			)}
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
	</>)
}

const $String: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [isMenuCharactersOpen, setIsMenuCharactersOpen] = createSignal<boolean>(false)
	const [menuCharactersWidth, setMenuCharactersWidth] = createSignal<number>(0)
	const settings = createMemo(() => props.settings[0].string)
	const buttonCharacters_uppercaseId = createUniqueId()
	const buttonCharacters_lowercaseId = createUniqueId()
	const buttonCharacters_numbersId = createUniqueId()
	const buttonCharacters_symbolsId = createUniqueId()
	let labelCharactersRef: HTMLDivElement
	let inputCharactersRef: HTMLInputElement
	let menuCharactersRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	createEffect(() => {
		const characters = settings().characters
		const lowercase = characters.lowercase
		const uppercase = characters.uppercase
		const numbers = characters.numbers
		const symbols = characters.symbols
		const custom = characters.custom

		if (!lowercase && !uppercase && !numbers && !symbols && stringLength(custom) == 0) {
			command(Commands.updateSettingsStringCharactersDefault)
		}

		const text: string[] = []
		if (uppercase) arrayPush(text, 'A-Z')
		if (lowercase) arrayPush(text, 'a-z')
		if (numbers) arrayPush(text, '0-9')
		if (symbols) arrayPush(text, '<({[!@#$%^&*_-+=~`\\|"\':;?/.,]})>')
		if (stringLength(custom) > 0) arrayPush(text, custom)

		updateTextFieldValue(inputCharactersRef, arrayJoin(text, ', '))
	})

	return (<>
		<NumberTextField
			c:attrWrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().length}
			onBlur={ev => command(
				Commands.updateSettingsStringLength,
				numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().length)
			)}
			min={1}
			c:label="Length"
		/>
		<TextField
			ref={r => inputCharactersRef = r}
			c:focused={isMenuCharactersOpen()}
			readOnly
			c:attrWrapper={{
				ref: r => labelCharactersRef = r,
				style: { width: 'min(100%, 328px)' }
			}}
			value={8}
			c:label="Characters"
			c:trailing={<TextFieldButton
				data-tooltip="More character options"
				c:focused={isMenuCharactersOpen()}
				onClick={(ev) => {
					setMenuCharactersWidth(rectWidth(elementRect(labelCharactersRef!)))
					openMenu(ev, menuCharactersRef, {
						anchor: eventCurrentTarget(ev),
						position: MenuPosition.centerBottomToLeft,
						padding: 6.5,
						gap: 8,
					})
				}}>
				<Icon c:filled c:code={ICON_CHEVRON_DOWN}/>
			</TextFieldButton>}
		/>
		<Menu
			ref={(r) => menuCharactersRef = r}
			c:onToggleOpen={(v) => setIsMenuCharactersOpen(v)}
			style={{"min-width": `${menuCharactersWidth()}px`}}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonCharacters_uppercaseId:
					command(Commands.toggleSettingsStringCharactersUppercase)
					break
				case buttonCharacters_lowercaseId:
					command(Commands.toggleSettingsStringCharactersLowercase)
					break
				case buttonCharacters_numbersId:
					command(Commands.toggleSettingsStringCharactersNumbers)
					break
				case buttonCharacters_symbolsId:
					command(Commands.toggleSettingsStrnigCharactersSymbols)
					break
				}
			}}>
			<MenuHeader>Alphabet</MenuHeader>
			<MenuItem
				c:checked={settings().characters.uppercase}
				c:trailing="A-Z"
				id={buttonCharacters_uppercaseId}>
				Uppercase
			</MenuItem>
			<MenuItem
				c:checked={settings().characters.lowercase}
				c:trailing="a-z"
				id={buttonCharacters_lowercaseId}>
				Lowercase
			</MenuItem>
			<MenuDivider />
			<MenuItem
				c:checked={settings().characters.numbers}
				c:trailing="0-9"
				id={buttonCharacters_numbersId}>
				Numbers
			</MenuItem>
			<MenuDivider />
			<MenuItem
				c:checked={settings().characters.symbols}
				c:trailing={"<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"}
				id={buttonCharacters_symbolsId}>
				Symbols
			</MenuItem>
			<MenuDivider />
			<div class={ CSS.control_string_custom_character}>
				<TextField
					c:label="Custom characters"
					placeholder="#d(23'[])sdf"
					onInput={(ev) => command(Commands.updateSettingsStringCharactersCustom, eventCurrentTarget(ev).value)}
					value={settings().characters.custom}
				/>
			</div>
		</Menu>
	</>)
}

const _: VoidComponent<{
	randomizer: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const randomizer = createMemo(() => props.randomizer)
	const command = createMemo(() => props.command)
	const settings = createMemo(() => props.settings)
	const lists = createMemo(() => props.lists)

	return (<Tooltip>
		<div class={CSS.control} data-randomizer={randomizer()}>
			<Switch>
				<Match when={randomizer() == RandomizerType.string}>
					<$String command={command()} settings={settings()}/>
				</Match>
				<Match when={randomizer() == RandomizerType.numbers}>
					<Numbers command={command()} settings={settings()} />
				</Match>
				<Match when={randomizer() == RandomizerType.colors}>
					<Colors command={command()} settings={settings()} />
				</Match>
				<Match when={randomizer() == RandomizerType.words}>
					<Words command={command()} settings={settings()} lists={lists()} />
				</Match>
				<Match when={randomizer() == RandomizerType.selection}>
					<Selection command={command()} settings={settings()} lists={lists()} />
				</Match>
				<Match when={randomizer() == RandomizerType.teams}>
					<Teams command={command()} settings={settings()} lists={lists()} />
				</Match>
			</Switch>
		</div>
	</Tooltip>)
}

export default _