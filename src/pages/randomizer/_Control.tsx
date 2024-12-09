import { For, Match, Show, Switch, type VoidComponent, createEffect, createMemo, createSignal } from "solid-js"
import type { SetStoreFunction, Store } from "solid-js/store/types/store"

import type { ItemList, Settings } from "./_types"
import { element_rect } from "@/utils/element"
import { RandomizerType, ColorsRandomizerColorModel, Commands } from "./_enums"
import { event_prevent_default } from "@/utils/event"
import { array_find, array_join, array_length, array_push } from "@/utils/array"
import { number_parse, number_safe } from "@/utils/number"
import { string_length, string_match, string_replace } from "@/utils/string"
import { math_clamp } from "@/utils/math"
import { rect_width } from "@/utils/rect"

import Icon from "@/components/Icon"
import { TextTooltip } from "@/components/Tooltip"
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

	return (<>
		<NumberTextField
			label="Count"
			min={1}
			max={array_length(settings().list_members.items)}
			onBlur={ev => command(
				Commands.change_settings_teams_count,
				number_safe(ev.currentTarget.valueAsNumber, settings().count)
			)}
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().count}
		/>
		<Dropdown
			label="Names"
			values={[settings().list_names.id]}
			on_change_options={(options) => change_listnames(options[0].value as number)}
			attr_menu={{ ref: (r) => dropdown_menu_listnames_ref = r }}>
			<MenuItem
				onClick={(ev) => {
					command(Commands.add_list, ev)
					close_menu(dropdown_menu_listnames_ref)
				}}
				icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.reset_list, ev)
					close_menu(dropdown_menu_listnames_ref)
				}}
				icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.edit_list, ev)
					close_menu(dropdown_menu_listnames_ref)
				}}
				icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{option =>
				<DropdownOption
					value={option[0]}
					text={option[1]}
					trailing={option[2]}
					onContextMenu={ev => {
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						set_is_action_open_for_list_names(true)
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
					}}
				/>
			}</For>
		</Dropdown>
		<Dropdown
			label="Members"
			values={[settings().list_members.id]}
			on_change_options={options => change_listmembers(options[0].value as number)}
			attr_menu={{ ref: (r) => dropdown_menu_listmember_ref = r }}>
			<MenuItem
				onClick={(ev) => {
					command(Commands.add_list, ev)
					close_menu(dropdown_menu_listmember_ref)
				}}
				icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.reset_list, ev)
					close_menu(dropdown_menu_listmember_ref)
				}}
				icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.edit_list, ev)
					close_menu(dropdown_menu_listmember_ref)
				}}
				icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{option =>
				<DropdownOption
					value={option[0]}
					text={option[1]}
					trailing={option[2]}
					onContextMenu={ev => {
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						set_is_action_open_for_list_names(false)
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
					}}
				/>
			}</For>
		</Dropdown>
		<Menu ref={r => menu_action_ref = r} style={{width: '164px'}}>
			<Show when={list() && list()!.id != (is_action_open_for_list_names()? settings().list_names.id : settings().list_members.id)}>
				<MenuItem
					onClick={async () => {
						close_menu(menu_action_ref)
						close_menu(dropdown_menu_listnames_ref)
						close_menu(dropdown_menu_listmember_ref)
						if (is_action_open_for_list_names()) change_listnames(list()!.id)
						else change_listmembers(list()!.id)
					}}
					icon_code={0xE3CC}>
					Select
				</MenuItem>
				<MenuDivider />
			</Show>
			<MenuItem
				onClick={async (ev) => {
					close_menu(menu_action_ref)
					close_menu(dropdown_menu_listnames_ref)
					close_menu(dropdown_menu_listmember_ref)
					command(Commands.view_list, ev, list())
				}}
				icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					close_menu(menu_action_ref)
					close_menu(dropdown_menu_listnames_ref)
					close_menu(dropdown_menu_listmember_ref)
					command(Commands.export_list, list())
				}}
				icon_code={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(dropdown_menu_listnames_ref)
					close_menu(dropdown_menu_listmember_ref)
				}}
				icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(dropdown_menu_listnames_ref)
					close_menu(dropdown_menu_listmember_ref)
				}}
				icon_code={0xE59D}>
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
			label="List"
			values={[settings().list.id]}
			on_change_options={options => change_list(options[0].value as number)}
			attr_menu={{ ref: (r) => menu_dropdown_ref = r }}>
			<MenuItem
				onClick={(ev) => {
					command(Commands.add_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.reset_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.edit_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{option =>
				<DropdownOption
					value={option[0]}
					text={option[1]}
					trailing={option[2]}
					onContextMenu={ev => {
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
					}}
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
					icon_code={0xE3CC}>
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
				icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
					command(Commands.export_list, list())
				}}
				icon_code={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			label="Count"
			min={1}
			max={array_length(settings().list.items)}
			onBlur={ev => command(
				Commands.change_settings_selection_count,
				number_safe(ev.currentTarget.valueAsNumber, settings().count)
			)}
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
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
			label="List"
			values={[settings().list.id]}
			on_change_options={options => change_list(options[0].value as number)}
			attr_menu={{ ref: (r) => menu_dropdown_ref = r }}>
			<MenuItem
				onClick={(ev) => {
					command(Commands.add_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE007}>
				Add new list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.reset_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xF09A}>
				Reset all list
			</MenuItem>
			<MenuItem
				onClick={(ev) => {
					command(Commands.edit_list, ev)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE069}>
				Edit list
			</MenuItem>
			<MenuDivider />
			<Show when={array_length(lists()) > 0}>
				<MenuHeader>Select list</MenuHeader>
			</Show>
			<For each={itemlist_to_dropdownlist(lists())}>{option =>
				<DropdownOption
					value={option[0]}
					text={option[1]}
					trailing={option[2]}
					onContextMenu={ev => {
						for (const li of lists()) {
							if (li.id != option[0]) continue;
							set_list(li)
							break
						}
						open_menu(ev, menu_action_ref, {
							position: MenuPosition.center_bottom_to_right
						})
						event_prevent_default(ev)
					}}
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
					icon_code={0xE3CC}>
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
				icon_code={0xE77B}>
				View list
			</MenuItem>
			<MenuItem
				onClick={async () => {
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
					command(Commands.export_list, list())
				}}
				icon_code={0xE0CF}
				trailing="*.csv">
				Export list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xF09C}>
				Edit list
			</MenuItem>
			<MenuItem
				onClick={async (ev) => {
					command(Commands.edit_list, ev, list())
					close_menu(menu_action_ref)
					close_menu(menu_dropdown_ref)
				}}
				icon_code={0xE59D}>
				Delete list
			</MenuItem>
		</Menu>
		<NumberTextField
			label="Count"
			min={1}
			onBlur={ev => command(
				Commands.change_settings_words_count,
				number_safe(ev.currentTarget.valueAsNumber, settings().count)
			)}
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
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
			label="Count"
			value={settings().count}
			onBlur={ev => command(
				Commands.change_settings_colors_count,
				number_safe(ev.currentTarget.valueAsNumber, settings().count)
			)}
		/>
		<Switch>
			<Match when={settings().model == ColorsRandomizerColorModel.hex}>
				<TextField
					label="Hex"
					placeholder="0-16777215 - 0-16777215"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Hue"
					placeholder="0-360 - 0-360"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Saturation"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Lightness"
					placeholder="0-100 - 0-100"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Red"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Green"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
					label="Blue"
					placeholder="0-225 - 0-255"
					onBlur={(ev) => {
						const self = ev.currentTarget
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
		const self = ev.currentTarget
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
			label="Range"
			onBlur={on_blur_range}
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={array_join([settings().range.min, settings().range.max], ' - ')}
		/>
		<NumberTextField
			label="Count"
			min={1}
			onBlur={ev => command(
				Commands.change_settings_numbers_count,
				number_safe(ev.currentTarget.valueAsNumber, settings().count)
			)}
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
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
			attr_wrapper={{ style: { width: 'min(100%, 164px)' } }}
			value={settings().length}
			onBlur={ev => command(
				Commands.change_settings_string_length,
				number_safe(ev.currentTarget.valueAsNumber, settings().length)
			)}
			min={1}
			label="Length"
		/>
		<TextField
			ref={r => input_characters_ref = r}
			focused={is_menu_characters_open()}
			readOnly
			attr_wrapper={{
				ref: r => label_characters_ref = r,
				style: { width: 'min(100%, 328px)' }
			}}
			value={8}
			label="Characters"
			trailing={<TextTooltip text="More character options">
				<TextFieldButton
					focused={is_menu_characters_open()}
					onClick={(ev) => {
						set_menu_characters_width(rect_width(element_rect(label_characters_ref!)))
						open_menu(ev, menu_characters_ref, {
							anchor: ev.currentTarget,
							position: MenuPosition.center_bottom_to_left,
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
			on_toggle_open={(v) => set_is_menu_characters_open(v)}
			style={{"min-width": `${menu_characters_width()}px`}}>
			<MenuHeader>Alphabet</MenuHeader>
			<MenuItem
				checked={settings().characters.uppercase}
				trailing="A-Z"
				onClick={() => command(Commands.toggle_settings_string_characters_uppercase)}>
				Uppercase
			</MenuItem>
			<MenuItem
				checked={settings().characters.lowercase}
				trailing="a-z"
				onClick={() => command(Commands.toggle_settings_string_characters_lowercase)}>
				Lowercase
			</MenuItem>
			<MenuDivider />
			<MenuItem
				checked={settings().characters.numbers}
				trailing="0-9"
				onClick={() => command(Commands.toggle_settings_string_characters_numbers)}>
				Numbers
			</MenuItem>
			<MenuDivider />
			<MenuItem
				checked={settings().characters.symbols}
				trailing={"<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"}
				onClick={() => command(Commands.toggle_settings_string_characters_symbols)}>
				Symbol
			</MenuItem>
			<MenuDivider />
			<div class={ CSS.control_string_custom_character}>
				<TextField
					label="Custom characters"
					placeholder="#d(23'[])sdf"
					onInput={(ev) => command(Commands.change_settings_string_characters_custom, ev.currentTarget.value)}
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