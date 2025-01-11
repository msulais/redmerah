import { For, Match, Show, Switch, type VoidComponent, createEffect, createMemo, createSignal, createUniqueId } from "solid-js"
import type { SetStoreFunction, Store } from "solid-js/store"

import type { ItemList, Settings } from "./_types"
import { element_dataset, element_id, element_rect, element_tagname, element_valid_target } from "@/utils/element"
import { RandomizerType, ColorsRandomizerColorModel, Commands } from "./_enums"
import { event_current_target, event_prevent_default } from "@/utils/event"
import { array_find, array_join, array_length, array_push } from "@/utils/array"
import { number_is_not_defined, number_parse, number_safe } from "@/utils/number"
import { string_length, string_match, string_replace } from "@/utils/string"
import { document_active } from "@/utils/document"
import { math_clamp } from "@/utils/math"
import { rect_width } from "@/utils/rect"

import Icon from "@/components/Icon"
import TextField, { NumberTextField, TextFieldButton, change_textfield_value } from "@/components/TextField"
import Menu, { close_menu, MenuDivider, MenuHeader, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import CSS from './_styles.module.scss'

const Teams: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	lists: [Store<ItemList[]>, SetStoreFunction<ItemList[]>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [list, set_list] = createSignal<ItemList | null>(null)
	const [is_action_open_for_list_names, set_is_action_open_for_list_names] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings[0].teams)
	const lists = createMemo(() => props.lists[0])
	const button_action_select_id = createUniqueId()
	const button_action_viewlist_id = createUniqueId()
	const button_action_exportlist_id = createUniqueId()
	const button_action_editlist_id = createUniqueId()
	const button_action_deletelist_id = createUniqueId()
	const button_members_addnewlist_id = createUniqueId()
	const button_members_resetalllist_id = createUniqueId()
	const button_members_editlist_id = createUniqueId()
	const button_names_addnewlist_id = createUniqueId()
	const button_names_resetalllist_id = createUniqueId()
	const button_names_editlist_id = createUniqueId()
	let dropdown_menu_listnames_ref: HTMLDialogElement
	let dropdown_menu_listmember_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemlist_to_dropdownlist(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			array_push(items, [l.id, l.name, array_length(l.items) + ''])
		}

		return items
	}

	function change_listnames(id: number): void {
		const $list = array_find(lists(), list => list.id == id)
		if ($list == undefined) return;

		set_list($list)
		command(Commands.change_settings_teams_listnames, list())
	}

	function change_listmembers(id: number): void {
		const $list = array_find(lists(), list => list.id == id)
		if ($list == undefined) return;

		set_list($list)
		command(Commands.change_settings_teams_listmembers, list())
	}

	function on_contextmenu_dropdown_item(ev: MouseEvent & {
		currentTarget: HTMLDialogElement
		target: Element
	}, list_names: boolean): void {
		const button = document_active()!
		if (!element_valid_target(
			event_current_target(ev),
			button,
			el => element_tagname(el) == 'BUTTON'
		)) return

		const data_list_index = element_dataset(button, 'listIndex')
		if (data_list_index) {
			const index = number_parse(data_list_index, true)
			if (number_is_not_defined(index)) return

			const option = itemlist_to_dropdownlist(lists())[index]
			for (const li of lists()) {
				if (li.id != option[0]) continue;
				set_list(li)
				break
			}
			set_is_action_open_for_list_names(list_names)
			open_menu(ev, menu_action_ref, {
				position: MenuPosition.center_bottom_to_right
			})
			event_prevent_default(ev)
			return
		}
	}

	return (<>
		<NumberTextField
			c_label="Count"
			min={1}
			max={array_length(settings().list_members.items)}
			onBlur={ev => command(
				Commands.change_settings_teams_count,
				number_safe(event_current_target(ev).valueAsNumber, settings().count)
			)}
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
		<Dropdown
			c_label="Names"
			c_values={[settings().list_names.id]}
			c_on_change={(options) => change_listnames(options[0].value as number)}
			c_attr_menu={{
				ref: (r) => dropdown_menu_listnames_ref = r,
				onContextMenu: ev => on_contextmenu_dropdown_item(ev, true),
				onClick: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_names_addnewlist_id: {
							command(Commands.add_list, ev)
							close_menu(dropdown_menu_listnames_ref)
							break
						}
						case button_names_resetalllist_id: {
							command(Commands.reset_list, ev)
							close_menu(dropdown_menu_listnames_ref)
							break
						}
						case button_names_editlist_id: {
							command(Commands.edit_list, ev)
							close_menu(dropdown_menu_listnames_ref)
							break
						}
					}
				}
			}}>
			<MenuItem
				id={button_names_addnewlist_id}
				c_icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				id={button_names_resetalllist_id}
				c_icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={button_names_editlist_id}
				c_icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{(option, i) =>
				<DropdownOption
					c_value={option[0]}
					c_text={option[1]}
					c_trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Dropdown
			c_label="Members"
			c_values={[settings().list_members.id]}
			c_on_change={options => change_listmembers(options[0].value as number)}
			c_attr_menu={{
				ref: (r) => dropdown_menu_listmember_ref = r,
				onClick: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_members_addnewlist_id: {
							command(Commands.add_list, ev)
							close_menu(dropdown_menu_listmember_ref)
							break
						}
						case button_members_resetalllist_id: {
							command(Commands.reset_list, ev)
							close_menu(dropdown_menu_listmember_ref)
							break
						}
						case button_members_editlist_id: {
							command(Commands.edit_list, ev)
							close_menu(dropdown_menu_listmember_ref)
							break
						}
					}
				},
				onContextMenu: ev => on_contextmenu_dropdown_item(ev, false)
			}}>
			<MenuItem
				id={button_members_addnewlist_id}
				c_icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				id={button_members_resetalllist_id}
				c_icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={button_members_editlist_id}
				c_icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{(option, i) =>
				<DropdownOption
					c_value={option[0]}
					c_text={option[1]}
					c_trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu
			ref={r => menu_action_ref = r}
			style={{width: '164px'}}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				const close_all = () => {
					close_menu(menu_action_ref)
					close_menu(dropdown_menu_listnames_ref)
					close_menu(dropdown_menu_listmember_ref)
				}

				switch (element_id(button)) {
					case button_action_select_id:
						close_all()
						if (is_action_open_for_list_names()) change_listnames(list()!.id)
						else change_listmembers(list()!.id)
						break
					case button_action_viewlist_id:
						close_all()
						command(Commands.view_list, ev, list())
						break
					case button_action_exportlist_id:
						close_all()
						command(Commands.export_list, list())
						break
					case button_action_editlist_id:
						close_all()
						command(Commands.edit_list, ev, list())
						break
					case button_action_deletelist_id:
						close_all()
						command(Commands.edit_list, ev, list())
						break
				}
			}}>
			<Show when={list() && list()!.id != (is_action_open_for_list_names()? settings().list_names.id : settings().list_members.id)}>
				<MenuItem
					id={button_action_select_id}
					c_icon_code={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				id={button_action_viewlist_id}
				c_icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				id={button_action_exportlist_id}
				c_icon_code={0xE0CF}
				c_trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				id={button_action_editlist_id}
				c_icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				id={button_action_deletelist_id}
				c_icon_code={0xE59D}>
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
	const [list, set_list] = createSignal<ItemList | null>(null)
	const lists = createMemo(() => props.lists[0])
	const settings = createMemo(() => props.settings[0].selection)
	const button_actions_select_id = createUniqueId()
	const button_actions_viewlist_id = createUniqueId()
	const button_actions_exportlist_id = createUniqueId()
	const button_actions_editlist_id = createUniqueId()
	const button_actions_deletelist_id = createUniqueId()
	const button_list_addnewlist_id = createUniqueId()
	const button_list_resetalllist_id = createUniqueId()
	const button_list_editlist_id = createUniqueId()
	let menu_dropdown_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemlist_to_dropdownlist(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			array_push(items, [l.id, l.name, array_length(l.items) + ''])
		}

		return items
	}

	function change_list(id: number): void {
		for (const li of lists()) {
			if (li.id != id) continue;
			set_list(li)
			break
		}
		command(Commands.change_settings_selection_list, list())
	}

	return (<>
		<Dropdown
			c_label="List"
			c_values={[settings().list.id]}
			c_on_change={options => change_list(options[0].value as number)}
			c_attr_menu={{
				ref: (r) => menu_dropdown_ref = r,
				onClick: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_list_addnewlist_id:
							command(Commands.add_list, ev)
							close_menu(menu_dropdown_ref)
							break
						case button_list_resetalllist_id:
							command(Commands.reset_list, ev)
							close_menu(menu_dropdown_ref)
							break
						case button_list_editlist_id:
							command(Commands.edit_list, ev)
							close_menu(menu_dropdown_ref)
							break
					}
				},
				onContextMenu: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_list_index = element_dataset(button, 'listIndex')
					if (data_list_index) {
						const index = number_parse(data_list_index, true)
						if (number_is_not_defined(index)) return

						const option = itemlist_to_dropdownlist(lists())[index]
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
						return
					}
				}
			}}>
			<MenuItem
				id={button_list_addnewlist_id}
				c_icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				id={button_list_resetalllist_id}
				c_icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={button_list_editlist_id}
				c_icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{(option, i) =>
				<DropdownOption
					c_value={option[0]}
					c_text={option[1]}
					c_trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu
			ref={r => menu_action_ref = r}
			style={{width: '164px'}}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_actions_select_id:
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						change_list(list()!.id)
						break
					case button_actions_viewlist_id:
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						command(Commands.view_list, ev, list())
						break
					case button_actions_exportlist_id:
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						command(Commands.export_list, list())
						break
					case button_actions_editlist_id:
						command(Commands.edit_list, ev, list())
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						break
					case button_actions_deletelist_id:
						command(Commands.edit_list, ev, list())
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						break
				}
			}}>
			<Show when={list() && list()!.id != settings().list.id}>
				<MenuItem
					id={button_actions_select_id}
					c_icon_code={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				id={button_actions_viewlist_id}
				c_icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				id={button_actions_exportlist_id}
				c_icon_code={0xE0CF}
				c_trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				id={button_actions_editlist_id}
				c_icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				id={button_actions_deletelist_id}
				c_icon_code={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			c_label="Count"
			min={1}
			max={array_length(settings().list.items)}
			onBlur={ev => command(
				Commands.change_settings_selection_count,
				number_safe(event_current_target(ev).valueAsNumber, settings().count)
			)}
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
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
	const button_list_addnewlist_id = createUniqueId()
	const button_list_resetalllist_id = createUniqueId()
	const button_list_editlist_id = createUniqueId()
	let menu_dropdown_ref: HTMLDialogElement
	let menu_action_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function itemlist_to_dropdownlist(list: ItemList[]): [number, string, string][] {
		const items: [number, string, string][] = []

		for (const l of list) {
			array_push(items, [l.id, l.name, array_length(l.items) + ''])
		}

		return items
	}

	function change_list(id: number): void {
		for (const li of lists()) {
			if (li.id != id) continue;
			set_list(li)
			break
		}
		command(Commands.change_settings_words_list, list())
	}

	return (<>
		<Dropdown
			c_label="List"
			c_values={[settings().list.id]}
			c_on_change={options => change_list(options[0].value as number)}
			c_attr_menu={{
				ref: (r) => menu_dropdown_ref = r,
				onClick: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_list_addnewlist_id:
							command(Commands.add_list, ev)
							close_menu(menu_dropdown_ref)
							break
						case button_list_resetalllist_id:
							command(Commands.reset_list, ev)
							close_menu(menu_dropdown_ref)
							break
						case button_list_editlist_id:
							command(Commands.edit_list, ev)
							close_menu(menu_dropdown_ref)
							break
					}
				},
				onContextMenu: ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_list_index = element_dataset(button, 'listIndex')
					if (data_list_index) {
						const index = number_parse(data_list_index, true)
						if (number_is_not_defined(index)) return

						const option = itemlist_to_dropdownlist(lists())[index]
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
						return
					}
				}
			}}>
			<MenuItem
				id={button_list_addnewlist_id}
				c_icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				id={button_list_resetalllist_id}
				c_icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				id={button_list_editlist_id}
				c_icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{(option, i) =>
				<DropdownOption
					c_value={option[0]}
					c_text={option[1]}
					c_trailing={option[2]}
					data-list-index={i()}
				/>
			}</For>
		</Dropdown>
		<Menu ref={r => menu_action_ref = r} style={{width: '164px'}}>
			<Show when={list() && list()!.id != settings().list.id}>
				<MenuItem
					onClick={async () => {
						close_menu(menu_action_ref)
						close_menu(menu_dropdown_ref)
						change_list(list()!.id)
					}}
					c_icon_code={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
					command(Commands.view_list, ev, list())
				}}
				c_icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
					command(Commands.export_list, list())
				}}
				c_icon_code={0xE0CF}
				c_trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				c_icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				c_icon_code={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			c_label="Count"
			min={1}
			onBlur={ev => command(
				Commands.change_settings_words_count,
				number_safe(event_current_target(ev).valueAsNumber, settings().count)
			)}
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
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

	function get_minmax(
		value: string,
		max_value: number,
		default_value: {min: number; max: number }
	): {min: number; max: number} {
		let min: number = default_value.min
		let max: number = default_value.max
		const unnecesary_char = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const range_regex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const r =  string_match(string_replace(value, unnecesary_char, ''), range_regex)
		if (r == null) return {min, max}

		min = math_clamp(number_safe(number_parse(r[1], true), default_value.min), 0, max_value)
		max = math_clamp(number_safe(number_parse(r[2], true), default_value.max), 0, max_value)

		if (min > max) min = max
		return {min, max}
	}

	return (<>
		<NumberTextField
			min={1}
			c_label="Count"
			value={settings().count}
			onBlur={ev => command(
				Commands.change_settings_colors_count,
				number_safe(event_current_target(ev).valueAsNumber, settings().count)
			)}
		/>
		<Switch>
			<Match when={settings().model == ColorsRandomizerColorModel.hex}>
				<TextField
					c_label="Hex"
					placeholder="0-16777215 - 0-16777215"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							0xffffff,
							{
								min: settings().range.hex.min,
								max: settings().range.hex.max
							}
						)
						command(Commands.change_settings_colors_range_hex, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.hex.min,
						settings().range.hex.max
					], ' - ')}
				/>
			</Match>
			<Match when={settings().model == ColorsRandomizerColorModel.hsl}>
				<TextField
					c_label="Hue"
					placeholder="0-360 - 0-360"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							360,
							{
								min: settings().range.hsl.h.min,
								max: settings().range.hsl.h.max
							}
						)
						command(Commands.change_settings_colors_range_hsl_h, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.hsl.h.min,
						settings().range.hsl.h.max
					], ' - ')}
				/>
				<TextField
					c_label="Saturation"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							100,
							{
								min: settings().range.hsl.s.min,
								max: settings().range.hsl.s.max
							}
						)
						command(Commands.change_settings_colors_range_hsl_s, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.hsl.s.min,
						settings().range.hsl.s.max
					], ' - ')}
				/>
				<TextField
					c_label="Lightness"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							100,
							{
								min: settings().range.hsl.l.min,
								max: settings().range.hsl.l.max
							}
						)
						command(Commands.change_settings_colors_range_hsl_l, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.hsl.l.min,
						settings().range.hsl.l.max
					], ' - ')}
				/>
			</Match>
			<Match when={settings().model == ColorsRandomizerColorModel.rgb}>
				<TextField
					c_label="Red"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							255,
							{
								min: settings().range.rgb.r.min,
								max: settings().range.rgb.r.max
							}
						)
						command(Commands.change_settings_colors_range_rgb_r, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.rgb.r.min,
						settings().range.rgb.r.max
					], ' - ')}
				/>
				<TextField
					c_label="Green"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							255,
							{
								min: settings().range.rgb.g.min,
								max: settings().range.rgb.g.max
							}
						)
						command(Commands.change_settings_colors_range_rgb_g, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
						settings().range.rgb.g.min,
						settings().range.rgb.g.max
					], ' - ')}
				/>
				<TextField
					c_label="Blue"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = event_current_target(ev)
						const values = get_minmax(
							self.value,
							255,
							{
								min: settings().range.rgb.b.min,
								max: settings().range.rgb.b.max
							}
						)
						command(Commands.change_settings_colors_range_rgb_b, values.min, values.max)
						change_textfield_value(self, array_join([values.min, values.max], ' - '))
					}}
					value={array_join([
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

	function on_blur_range(ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}): void {
		const self = event_current_target(ev)
		const range_regex = /([-+]?\d+?) ?- ?([-+]?\d+)/
		const unnecesary_char = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
		const r = string_match(string_replace(self.value, unnecesary_char, ''), range_regex)
		if (r == null) return change_textfield_value(
			self,
			array_join([settings().range.min, settings().range.max], ' - ')
		)

		const max = number_parse(r[2], true)
		let min = number_parse(r[1], true)

		if (min > max) min = max

		command(Commands.change_settings_numbers_range, min, max)
		change_textfield_value(self, array_join([min, max], ' - '))
	}

	return (<>
		<TextField
			c_label="Range"
			onBlur={on_blur_range}
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={array_join([settings().range.min, settings().range.max], ' - ')}
		/>
		<NumberTextField
			c_label="Count"
			min={1}
			onBlur={ev => command(
				Commands.change_settings_numbers_count,
				number_safe(event_current_target(ev).valueAsNumber, settings().count)
			)}
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
	</>)
}

const $String: VoidComponent<{
	settings: [Settings, SetStoreFunction<Settings>]
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_characters_open, set_is_menu_characters_open] = createSignal<boolean>(false)
	const [menu_characters_width, set_menu_characters_width] = createSignal<number>(0)
	const settings = createMemo(() => props.settings[0].string)
	const button_characters_uppercase_id = createUniqueId()
	const button_characters_lowercase_id = createUniqueId()
	const button_characters_numbers_id = createUniqueId()
	const button_characters_symbols_id = createUniqueId()
	let label_characters_ref: HTMLDivElement
	let input_characters_ref: HTMLInputElement
	let menu_characters_ref: HTMLDialogElement

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

		if (!lowercase && !uppercase && !numbers && !symbols && string_length(custom) == 0) {
			command(Commands.change_settings_string_characters_default)
		}

		const text: string[] = []
		if (uppercase) array_push(text, 'A-Z')
		if (lowercase) array_push(text, 'a-z')
		if (numbers) array_push(text, '0-9')
		if (symbols) array_push(text, '<({[!@#$%^&*_-+=~`\\|"\':;?/.,]})>')
		if (string_length(custom) > 0) array_push(text, custom)

		change_textfield_value(input_characters_ref, array_join(text, ', '))
	})

	return (<>
		<NumberTextField
			c_attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().length}
			onBlur={ev => command(
				Commands.change_settings_string_length,
				number_safe(event_current_target(ev).valueAsNumber, settings().length)
			)}
			min={1}
			c_label="Length"
		/>
		<TextField
			ref={r => input_characters_ref = r}
			c_focused={is_menu_characters_open()}
			readOnly
			c_attr_wrapper={{
				ref: r => label_characters_ref = r,
				style: { width: 'min(100%, 328px)' }
			}}
			value={8}
			c_label="Characters"
			c_trailing={<TextFieldButton
				data-tooltip="More character options"
				c_focused={is_menu_characters_open()}
				onClick={(ev) => {
					set_menu_characters_width(rect_width(element_rect(label_characters_ref!)))
					open_menu(ev, menu_characters_ref, {
						anchor: event_current_target(ev),
						position: MenuPosition.center_bottom_to_left,
						padding: 6.5,
						gap: 8,
					})
				}}>
				<Icon c_filled c_code={0xE362}/>
			</TextFieldButton>}
		/>
		<Menu
			ref={(r) => menu_characters_ref = r}
			c_on_toggleopen={(v) => set_is_menu_characters_open(v)}
			style={{"min-width": `${menu_characters_width()}px`}}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_characters_uppercase_id:
						command(Commands.toggle_settings_string_characters_uppercase)
						break
					case button_characters_lowercase_id:
						command(Commands.toggle_settings_string_characters_lowercase)
						break
					case button_characters_numbers_id:
						command(Commands.toggle_settings_string_characters_numbers)
						break
					case button_characters_symbols_id:
						command(Commands.toggle_settings_string_characters_symbols)
						break
				}
			}}>
			<MenuHeader>Alphabet</MenuHeader>
			<MenuItem
				c_checked={settings().characters.uppercase}
				c_trailing="A-Z"
				id={button_characters_uppercase_id}>
				Uppercase
			</MenuItem>
			<MenuItem
				c_checked={settings().characters.lowercase}
				c_trailing="a-z"
				id={button_characters_lowercase_id}>
				Lowercase
			</MenuItem>
			<MenuDivider />
			<MenuItem
				c_checked={settings().characters.numbers}
				c_trailing="0-9"
				id={button_characters_numbers_id}>
				Numbers
			</MenuItem>
			<MenuDivider />
			<MenuItem
				c_checked={settings().characters.symbols}
				c_trailing={"<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"}
				id={button_characters_symbols_id}>
				Symbols
			</MenuItem>
			<MenuDivider />
			<div class={ CSS.control_string_custom_character}>
				<TextField
					c_label="Custom characters"
					placeholder="#d(23'[])sdf"
					onInput={(ev) => command(Commands.change_settings_string_characters_custom, event_current_target(ev).value)}
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

	return (<div class={CSS.control} data-randomizer={randomizer()}>
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
	</div>)
}

export default _