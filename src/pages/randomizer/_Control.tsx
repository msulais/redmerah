import { Match, Show, Switch, type VoidComponent, createEffect, createMemo, createSignal } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store/types/store";

import type { ItemList, Settings } from "./_types";
import { _add_list, _change_settings_colors_count, _change_settings_colors_range_hex, _change_settings_colors_range_hsl_h, _change_settings_colors_range_hsl_l, _change_settings_colors_range_hsl_s, _change_settings_colors_range_rgb_b, _change_settings_colors_range_rgb_g, _change_settings_colors_range_rgb_r, _change_settings_numbers_count, _change_settings_numbers_range, _change_settings_selection_count, _change_settings_selection_list, _change_settings_string_characters_customCharacters, _change_settings_string_characters_toDefault, _change_settings_string_length, _change_settings_teams_count, _change_settings_teams_membersList, _change_settings_teams_namesList, _change_settings_words_count, _change_settings_words_list, _delete_list, _edit_list, _export_list, _reset_list, _settings_words_listId, _toggle_settings_string_characters_alphabetLowercase, _toggle_settings_string_characters_alphabetUppercase, _toggle_settings_string_characters_numbers, _toggle_settings_string_characters_symbols, _view_list } from "./_string";
import { _settings, _string, _numbers, _length, _push, _join, _width, _currentTarget, _centerBottomToLeft, _value, _characters, _symbols, _colors, _match, _max, _min, _replace, _range, _count, _colorModel, _hex, _hsl, _isNaN, _rgb, _words, _lists, _alphabetLowercase, _alphabetUppercase, _customCharacter, _randomizerType, _id, _list, _members, _name, _db, _objectStore, _put, _transaction, _readwrite, _command, _centerBottomToRight, _oncontextmenu, _items, _selection, _teams, _namesList, _membersList, _find } from "@/constants/string";
import { getBoundingClientRect } from "@/utils/element";
import { RandomizerType, ColorsRandomizerColorModel, Commands } from "./_enums";
import { numberIsNaN, numberParse } from "@/utils/math";
import { preventDefault } from "@/utils/event";

import Icon from "@/components/Icon";
import { TextTooltip } from "@/components/Tooltip";
import TextField, { NumberTextField, TextFieldButton, changeTextFieldValue } from "@/components/TextField";
import Menu, { closeMenu, MenuDivider, MenuHeader, MenuItem, MenuPosition, openMenu } from "@/components/Menu";
import Dropdown, { type Item } from "@/components/Dropdown";
import CSS from './_styles.module.scss'

const Teams: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, setList] = createSignal<ItemList | null>(null)
	const [isActionOpenForNamesList, setIsActionOpenForNamesList] = createSignal<boolean>(false)
	const settings = createMemo(() => props[_settings][0][_teams])
	let dropdownMenu_namesLists_ref: HTMLDialogElement
	let dropdownMenu_membersLists_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function itemListToDropdownList(list: ItemList[]): Item[] {
		const items: Item[] = []

		for (const l of list) {
			items[_push]([l[_id], l[_name], l[_items][_length] + ''])
		}

		return items
	}

	function changeNamesList(id: number): void {
		const $list = props[_lists][0][_find](list => list[_id] == id)
		if ($list == undefined) return;

		setList($list)
		props[_command](Commands[_change_settings_teams_namesList], list())
	}

	function changeMembersList(id: number): void {
		const $list = props[_lists][0][_find](list => list[_id] == id)
		if ($list == undefined) return;

		setList($list)
		props[_command](Commands[_change_settings_teams_membersList], list())
	}

	return (<>
		<NumberTextField
			labelText="Count"
			min={1}
			max={settings()[_membersList][_items][_length]}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_teams_count], v)}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={settings()[_count]}
		/>
		<Dropdown
			labelText="Names"
			selectedValues={[settings()[_namesList][_id]]}
			items={[...itemListToDropdownList(props[_lists][0])]}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			onSelectedItemsChanged={(items) => changeNamesList(items[0][0] as number)}
			menuAttr={{ ref: (r) => dropdownMenu_namesLists_ref = r }}
			refs={(r, item) => {
				r[_oncontextmenu] = (ev) => {
					for (const li of props[_lists][0]) {
						if (li[_id] != item[0]) continue;
						setList(li)
						break
					}
					setIsActionOpenForNamesList(true)
					openMenu(ev, menu_action_ref, {
						position: MenuPosition[_centerBottomToRight]
					})
					preventDefault(ev)
				}
			}}
			header={<Show when={props[_lists][0][_length] > 0}><MenuHeader>Select list</MenuHeader></Show>}
			footer={<Show when={props[_lists][0][_length] > 0}>
				<MenuDivider />
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_add_list], ev)
						closeMenu(dropdownMenu_namesLists_ref)
					}}
					iconCode={0xE007}>
					Add new list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_reset_list], ev)
						closeMenu(dropdownMenu_namesLists_ref)
					}}
					iconCode={0xF09A}>
					Reset all list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_edit_list], ev)
						closeMenu(dropdownMenu_namesLists_ref)
					}}
					iconCode={0xE069}>
					Edit list
				</MenuItem>
			</Show>}
		/>
		<Dropdown
			labelText="Members"
			selectedValues={[settings()[_membersList][_id]]}
			items={[...itemListToDropdownList(props[_lists][0])]}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			onSelectedItemsChanged={items => changeMembersList(items[0][0] as number)}
			menuAttr={{ ref: (r) => dropdownMenu_membersLists_ref = r }}
			refs={(r, value) => {
				r[_oncontextmenu] = (ev) => {
					for (const li of props[_lists][0]) {
						if (li[_id] != value[0]) continue;
						setList(li)
						break
					}
					setIsActionOpenForNamesList(false)
					openMenu(ev, menu_action_ref, {
						position: MenuPosition[_centerBottomToRight]
					})
					preventDefault(ev)
				}
			}}
			header={<Show when={props[_lists][0][_length] > 0}><MenuHeader>Select list</MenuHeader></Show>}
			footer={<Show when={props[_lists][0][_length] > 0}>
				<MenuDivider />
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_add_list], ev)
						closeMenu(dropdownMenu_membersLists_ref)
					}}
					iconCode={0xE007}>
					Add new list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_reset_list], ev)
						closeMenu(dropdownMenu_membersLists_ref)
					}}
					iconCode={0xF09A}>
					Reset all list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_edit_list], ev)
						closeMenu(dropdownMenu_membersLists_ref)
					}}
					iconCode={0xE069}>
					Edit list
				</MenuItem>
			</Show>}
		/>
		<Menu ref={r => menu_action_ref = r} style={{width: '164px'}}>
			<Show when={list() && list()![_id] != (isActionOpenForNamesList()? settings()[_namesList][_id] : settings()[_membersList][_id])}>
				<MenuItem
					onClick={async () => {
						closeMenu(menu_action_ref)
						closeMenu(dropdownMenu_namesLists_ref)
						closeMenu(dropdownMenu_membersLists_ref)
						if (isActionOpenForNamesList()) changeNamesList(list()![_id])
						else changeMembersList(list()![_id])
					}}
					iconCode={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					closeMenu(menu_action_ref)
					closeMenu(dropdownMenu_namesLists_ref)
					closeMenu(dropdownMenu_membersLists_ref)
					props[_command](Commands[_view_list], ev, list())
				}}
				iconCode={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					closeMenu(menu_action_ref)
					closeMenu(dropdownMenu_namesLists_ref)
					closeMenu(dropdownMenu_membersLists_ref)
					props[_command](Commands[_export_list], list())
				}}
				iconCode={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_edit_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(dropdownMenu_namesLists_ref)
					closeMenu(dropdownMenu_membersLists_ref)
				}}
				iconCode={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_delete_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(dropdownMenu_namesLists_ref)
					closeMenu(dropdownMenu_membersLists_ref)
				}}
				iconCode={0xE59D}>
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
	let menu_dropdown_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function itemListToDropdownList(list: ItemList[]): Item[] {
		const items: Item[] = []

		for (const l of list) {
			items[_push]([l[_id], l[_name], l[_items][_length] + ''])
		}

		return items
	}

	function changeList(id: number): void {
		for (const li of props[_lists][0]) {
			if (li[_id] != id) continue;
			setList(li)
			break
		}
		props[_command](Commands[_change_settings_selection_list], list())
	}

	return (<>
		<Dropdown
			labelText="List"
			selectedValues={[props[_settings][0][_selection][_list][_id]]}
			items={[...itemListToDropdownList(props[_lists][0])]}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' }}}
			onSelectedItemsChanged={items => changeList(items[0][0] as number)}
			menuAttr={{ ref: (r) => menu_dropdown_ref = r }}
			refs={(r, value) => {
				r[_oncontextmenu] = (ev) => {
					for (const li of props[_lists][0]) {
						if (li[_id] != value[0]) continue;
						setList(li)
						break
					}
					openMenu(ev, menu_action_ref, {
						position: MenuPosition[_centerBottomToRight]
					})
					preventDefault(ev)
				}
			}}
			header={<Show when={props[_lists][0][_length] > 0}><MenuHeader>Select list</MenuHeader></Show>}
			footer={<Show when={props[_lists][0][_length] > 0}>
				<MenuDivider />
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_add_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xE007}>
					Add new list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_reset_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xF09A}>
					Reset all list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_edit_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xE069}>
					Edit list
				</MenuItem>
			</Show>}
		/>
		<Menu ref={r => menu_action_ref = r} style={{width: '164px'}}>
			<Show when={list() && list()![_id] != props[_settings][0][_selection][_list][_id]}>
				<MenuItem
					onClick={async () => {
						closeMenu(menu_action_ref)
						closeMenu(menu_dropdown_ref)
						changeList(list()![_id])
					}}
					iconCode={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
					props[_command](Commands[_view_list], ev, list())
				}}
				iconCode={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
					props[_command](Commands[_export_list], list())
				}}
				iconCode={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_edit_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
				}}
				iconCode={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_delete_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
				}}
				iconCode={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			labelText="Count"
			min={1}
			max={props[_settings][0][_selection][_list][_items][_length]}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_selection_count], v)}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={props[_settings][0][_selection][_count]}
		/>
	</>)
}

const Words: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, setList] = createSignal<ItemList | null>(null)
	let menu_dropdown_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function itemListToDropdownList(list: ItemList[]): Item[] {
		const items: Item[] = []

		for (const l of list) {
			items[_push]([l[_id], l[_name], l[_items][_length] + ''])
		}

		return items
	}

	function changeList(id: number): void {
		for (const li of props[_lists][0]) {
			if (li[_id] != id) continue;
			setList(li)
			break
		}
		props[_command](Commands[_change_settings_words_list], list())
	}

	return (<>
		<Dropdown
			labelText="List"
			selectedValues={[props[_settings][0][_words][_list][_id]]}
			items={[...itemListToDropdownList(props[_lists][0])]}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			onSelectedItemsChanged={items => changeList(items[0][0] as number)}
			menuAttr={{ ref: (r) => menu_dropdown_ref = r }}
			refs={(r, value) => {
				r[_oncontextmenu] = (ev) => {
					for (const li of props[_lists][0]) {
						if (li[_id] != value[0]) continue;
						setList(li)
						break
					}
					openMenu(ev, menu_action_ref, {
						position: MenuPosition[_centerBottomToRight]
					})
					preventDefault(ev)
				}
			}}
			header={<Show when={props[_lists][0][_length] > 0}><MenuHeader>Select list</MenuHeader></Show>}
			footer={<Show when={props[_lists][0][_length] > 0}>
				<MenuDivider />
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_add_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xE007}>
					Add new list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_reset_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xF09A}>
					Reset all list
				</MenuItem>
				<MenuItem
					onClick={(ev) => {
						props[_command](Commands[_edit_list], ev)
						closeMenu(menu_dropdown_ref)
					}}
					iconCode={0xE069}>
					Edit list
				</MenuItem>
			</Show>}
		/>
		<Menu ref={r => menu_action_ref = r} style={{width: '164px'}}>
			<Show when={list() && list()![_id] != props[_settings][0][_words][_list][_id]}>
				<MenuItem
					onClick={async () => {
						closeMenu(menu_action_ref)
						closeMenu(menu_dropdown_ref)
						changeList(list()![_id])
					}}
					iconCode={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
					props[_command](Commands[_view_list], ev, list())
				}}
				iconCode={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
					props[_command](Commands[_export_list], list())
				}}
				iconCode={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_edit_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
				}}
				iconCode={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					props[_command](Commands[_delete_list], ev, list())
					closeMenu(menu_action_ref)
					closeMenu(menu_dropdown_ref)
				}}
				iconCode={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			labelText="Count"
			min={1}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_words_count], v)}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={props[_settings][0][_words][_count]}
		/>
	</>)
}

const Colors: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	function getMinMax(value: string, maxValue: number, defaultValue: {min: number; max: number }): {min: number; max: number} {
		let min: number = defaultValue[_min]
		let max: number = defaultValue[_max]
		const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const r = value[_replace](unnecesaryChar, '')[_match](rangeRegex)
		if (r == null) return {min, max}

		min = numberParse(r[1], true)
		max = numberParse(r[2], true)

		if (numberIsNaN(min)) min = defaultValue[_min]
		if (numberIsNaN(max)) min = defaultValue[_max]
		if (min < 0) min = 0
		if (max < 0) max = 0
		if (min > maxValue) min = maxValue
		if (max > maxValue) max = maxValue

		if (min > max) min = max
		return {min, max}
	}

	return (<>
		<NumberTextField
			min={1}
			labelText="Count"
			value={props[_settings][0][_colors][_count]}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_colors_count], v)}
		/>
		<Switch>
			<Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_hex]}>
				<TextField
					labelText="Hex"
					placeholder="0-16777215 - 0-16777215"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							0xffffff,
							{
								min: props[_settings][0][_colors][_range][_hex][_min],
								max: props[_settings][0][_colors][_range][_hex][_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_hex], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_hex][_min],
						props[_settings][0][_colors][_range][_hex][_max]
					][_join](' - ')}
				/>
			</Match>
			<Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_hsl]}>
				<TextField
					labelText="Hue"
					placeholder="0-360 - 0-360"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							360,
							{
								min: props[_settings][0][_colors][_range][_hsl].h[_min],
								max: props[_settings][0][_colors][_range][_hsl].h[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_hsl_h], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_hsl].h[_min],
						props[_settings][0][_colors][_range][_hsl].h[_max]
					][_join](' - ')}
				/>
				<TextField
					labelText="Saturation"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							100,
							{
								min: props[_settings][0][_colors][_range][_hsl].s[_min],
								max: props[_settings][0][_colors][_range][_hsl].s[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_hsl_s], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_hsl].s[_min],
						props[_settings][0][_colors][_range][_hsl].s[_max]
					][_join](' - ')}
				/>
				<TextField
					labelText="Lightness"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							100,
							{
								min: props[_settings][0][_colors][_range][_hsl].l[_min],
								max: props[_settings][0][_colors][_range][_hsl].l[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_hsl_l], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_hsl].l[_min],
						props[_settings][0][_colors][_range][_hsl].l[_max]
					][_join](' - ')}
				/>
			</Match>
			<Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_rgb]}>
				<TextField
					labelText="Red"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							255,
							{
								min: props[_settings][0][_colors][_range][_rgb].r[_min],
								max: props[_settings][0][_colors][_range][_rgb].r[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_rgb_r], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_rgb].r[_min],
						props[_settings][0][_colors][_range][_rgb].r[_max]
					][_join](' - ')}
				/>
				<TextField
					labelText="Green"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							255,
							{
								min: props[_settings][0][_colors][_range][_rgb].g[_min],
								max: props[_settings][0][_colors][_range][_rgb].g[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_rgb_g], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_rgb].g[_min],
						props[_settings][0][_colors][_range][_rgb].g[_max]
					][_join](' - ')}
				/>
				<TextField
					labelText="Blue"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const values = getMinMax(
							ev[_currentTarget][_value],
							255,
							{
								min: props[_settings][0][_colors][_range][_rgb].b[_min],
								max: props[_settings][0][_colors][_range][_rgb].b[_max]
							}
						)
						props[_command](Commands[_change_settings_colors_range_rgb_b], values[_min], values[_max])
						changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
					}}
					value={[
						props[_settings][0][_colors][_range][_rgb].b[_min],
						props[_settings][0][_colors][_range][_rgb].b[_max]
					][_join](' - ')}
				/>
			</Match>
		</Switch>
	</>)
}

const Numbers: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	function onBlurRange(ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}): void {
		const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const r = ev[_currentTarget][_value][_replace](unnecesaryChar, '')[_match](rangeRegex)
		if (r == null) return changeTextFieldValue(
			ev[_currentTarget],
			[
				props[_settings][0][_numbers][_range][_min],
				props[_settings][0][_numbers][_range][_max]
			][_join](' - ')
		)

		const max = parseInt(r[2])
		let min = parseInt(r[1])

		if (min > max) min = max

		props[_command](Commands[_change_settings_numbers_range], min, max)
		changeTextFieldValue(ev[_currentTarget], [min, max][_join](' - '))
	}

	return (<>
		<TextField
			labelText="Range"
			onBlur={onBlurRange}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={[props[_settings][0][_numbers][_range][_min], props[_settings][0][_numbers][_range][_max]][_join](' - ')}
		/>
		<NumberTextField
			labelText="Count"
			min={1}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_numbers_count], v)}
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={props[_settings][0][_numbers][_count]}
		/>
	</>)
}

const $String: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [isCharactersMenuOpen, setIsCharactersMenuOpen] = createSignal<boolean>(false)
	const [charactersMenuWidth, setCharactersMenuWidth] = createSignal<number>(0)
	const settings = createMemo(() => props[_settings][0][_string])
	let charactersLabelRef: HTMLDivElement
	let charactersInputRef: HTMLInputElement
	let menu_characters_ref: HTMLDialogElement

	createEffect(() => {
		const s = settings()
		const lowercase = s[_characters][_alphabetLowercase]
		const uppercase = s[_characters][_alphabetUppercase]
		const numbers = s[_characters][_numbers]
		const symbols = s[_characters][_symbols]
		const customCharacter = s[_characters][_customCharacter]

		if (!lowercase && !uppercase && !numbers && !symbols && customCharacter[_length] == 0) {
			props[_command](Commands[_change_settings_string_characters_toDefault])
		}

		const text: string[] = []
		if (uppercase) text[_push]('A-Z')
		if (lowercase) text[_push]('a-z')
		if (numbers) text[_push]('0-9')
		if (symbols) text[_push]('<({[!@#$%^&*_-+=~`\\|"\':;?/.,]})>')
		if (customCharacter[_length] > 0) text[_push](customCharacter)

		changeTextFieldValue(charactersInputRef, text[_join](', '))
	})

	return (<>
		<NumberTextField
			wrapperAttr={{ style: { width: 'min(100%, 164px)' } }}
			value={settings()[_length]}
			onFinalValueChanged={(v) => props[_command](Commands[_change_settings_string_length], v)}
			min={1}
			labelText="Length"
		/>
		<TextField
			ref={r => charactersInputRef = r}
			focused={isCharactersMenuOpen()}
			readOnly
			wrapperAttr={{
				ref: r => charactersLabelRef = r,
				style: { width: 'min(100%, 328px)' }
			}}
			value={8}
			labelText="Characters"
			trailing={<TextTooltip text="More character options">
				<TextFieldButton
					focused={isCharactersMenuOpen()}
					onClick={(ev) => {
						setCharactersMenuWidth(getBoundingClientRect(charactersLabelRef!)[_width])
						openMenu(ev, menu_characters_ref, {
							anchor: ev[_currentTarget],
							position: MenuPosition[_centerBottomToLeft],
							padding: 6.5,
							gap: 8,
						})
					}}>
					<Icon filled code={0xE362}/>
				</TextFieldButton>
			</TextTooltip>}
		/>
		<Menu
			ref={(r) => menu_characters_ref = r}
			onToggleOpen={(v) => setIsCharactersMenuOpen(v)}
			style={{"min-width": `${charactersMenuWidth()}px`}}>
			<MenuHeader>Alphabet</MenuHeader>
			<MenuItem
				checked={settings()[_characters][_alphabetUppercase]}
				trailing="A-Z"
				onClick={() => props[_command](Commands[_toggle_settings_string_characters_alphabetUppercase])}>
				Uppercase
			</MenuItem>
			<MenuItem
				checked={settings()[_characters][_alphabetLowercase]}
				trailing="a-z"
				onClick={() => props[_command](Commands[_toggle_settings_string_characters_alphabetLowercase])}>
				Lowercase
			</MenuItem>
			<MenuDivider />
			<MenuItem
				checked={settings()[_characters][_numbers]}
				trailing="0-9"
				onClick={() => props[_command](Commands[_toggle_settings_string_characters_numbers])}>
				Numbers
			</MenuItem>
			<MenuDivider />
			<MenuItem
				checked={settings()[_characters][_symbols]}
				trailing={"<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"}
				onClick={() => props[_command](Commands[_toggle_settings_string_characters_symbols])}>
				Symbol
			</MenuItem>
			<MenuDivider />
			<div class={ CSS.control_string_custom_character}>
				<TextField
					labelText="Custom characters"
					placeholder="#d(23'[])sdf"
					onInput={(ev) => props[_command](Commands[_change_settings_string_characters_customCharacters], ev[_currentTarget][_value])}
					value={settings()[_characters][_customCharacter]}
				/>
			</div>
		</Menu>
	</>)
}

const _: VoidComponent<{
	randomizerType: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	return (<div class={CSS.control} data-randomizer={props[_randomizerType]}>
		<Switch>
			<Match when={props[_randomizerType] == RandomizerType[_string]}>
				<$String command={props[_command]} settings={props[_settings]}/>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_numbers]}>
				<Numbers command={props[_command]} settings={props[_settings]} />
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_colors]}>
				<Colors command={props[_command]} settings={props[_settings]} />
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_words]}>
				<Words command={props[_command]} settings={props[_settings]} lists={props[_lists]} />
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_selection]}>
				<Selection command={props[_command]} settings={props[_settings]} lists={props[_lists]} />
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_teams]}>
				<Teams command={props[_command]} settings={props[_settings]} lists={props[_lists]} />
			</Match>
		</Switch>
	</div>)
}

export default _