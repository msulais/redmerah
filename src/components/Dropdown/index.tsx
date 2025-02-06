import { createStore } from "solid-js/store"
import { Show, createContext, createEffect, createMemo, createSelector, createSignal, mergeProps, onCleanup, splitProps, useContext, type Accessor, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { element_by_selector, element_dataset, element_focus, element_rect, element_remove_style, element_set_style, element_tagname, element_valid_target } from "@/utils/element"
import { event_call, event_current_target } from "@/utils/event"
import { array_concat, array_equals, array_filter, array_find_index, array_join, array_length, array_map, array_push, array_slice, array_some } from "@/utils/array"
import { rect_width } from "@/utils/rect"
import { document_active } from "@/utils/document"
import { is_number } from "@/utils/typecheck"
import { string_starts_with, string_substring } from "@/utils/string"
import { number_parse, number_safe } from "@/utils/number"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"

import Menu, { MenuItem, type MenuProps, MenuPosition as DropdownPosition, type MenuItemProps, open_menu, close_menu, reposition_menu } from "@/components/Menu"
import { Button, ButtonVariant, type ButtonProps } from "@/components/Button"
import Icon from "@/components/Icon"
import './index.scss'

type DropdownContextProps = {
	on_mount_option(value: string | number, text: string): unknown
	on_cleanup_option(value: string | number | null): unknown
	selected_values: Accessor<(string | number)[]>
	multiple: Accessor<boolean>
} | undefined

const DropdownContext = createContext<DropdownContextProps>()

type DropdownOptionProps = MenuItemProps & {
	c_value: string | number
	c_text: string
}

const DropdownOption: ParentComponent<DropdownOptionProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_value', 'c_selected', 'id', 'c_checked',
		'c_text', 'children'
	])
	const context = useContext(DropdownContext)
	const selected = createMemo<boolean>(() => {
		const selected_values = context?.selected_values()
		return selected_values == undefined
			? false
			: array_some(selected_values, v => v === props.c_value)
	})
	let value: string | number | null = null
	let text: string | null = null

	createEffect(() => {
		const _value = props.c_value
		const _text = props.c_text
		if (_value === value && _text == text) return

		value = _value
		text = _text
		context?.on_mount_option(value, text)
	})

	onCleanup(() => {
		context?.on_cleanup_option(props.c_value)
		value = text = null
	})

	return (<MenuItem
		c_selected={props.c_selected ?? context?.multiple()? undefined : selected()}
		c_checked={props.c_checked ?? context?.multiple()? selected() : undefined}
		data-c-dropdown-value={(is_number(props.c_value)? 'number:' : '') + props.c_value}
		{...other}>
		{ props.children ?? props.c_text}
	</MenuItem>)
}

type DropdownProps = ButtonProps & {
	c_values?: (string | number)[]
	c_text?: string
	c_label?: string
	c_multiple?: boolean
	c_attr_menu?: MenuProps
	c_on_change?(values: {value: string | number, text: string}[]): unknown
}

const Dropdown: ParentComponent<DropdownProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({c_variant: ButtonVariant.tonal}, $props),
	[
		'disabled', 'c_multiple', 'children', 'c_text',
		'c_attr_menu', 'c_label', 'c_on_change',
		'c_values', 'ref', 'onClick', 'c_selected',
		'classList', 'c_variant'
	])
	const [menu_props, menu_props_other] = splitProps(
		props.c_attr_menu! ?? {},
		[
			'c_on_toggleopen', 'ref', 'classList',
			'onClick'
		]
	)
	const [is_open, set_is_open] = createSignal<boolean>(false)
	const [options, set_options] = createStore<{value: string | number, text: string}[]>([])
	const [selected_values, set_selected_values] = createStore<(string | number)[]>([])
	const is_selected = createSelector<(string | number)[], string | number>(
		() => selected_values,
		(value, array) => array_some(array, v => v === value)
	)
	let local_values: (string | number)[] = []
	let local_multiple: boolean = false
	let button_dropdown_ref: HTMLButtonElement
	let menu_dropdown_ref: HTMLDialogElement

	function open_dropdown_menu(ev: MouseEvent): void {
		open_menu(ev, menu_dropdown_ref, {
			anchor: button_dropdown_ref,
			padding: 0,
			gap: 4,
			position: DropdownPosition.center_bottom,
			on_open: () => focus_to_selected_options()
		})
		element_remove_style(menu_dropdown_ref, 'width')
		const button_width = rect_width(element_rect(button_dropdown_ref))
		const menu_width = rect_width(element_rect(menu_dropdown_ref))
		if (button_width > menu_width) element_set_style(
			menu_dropdown_ref,
			'width',
			`${button_width}px`
		)
		reposition_menu(menu_dropdown_ref)
	}

	function on_select_option(value: string | number): void {
		const index = array_find_index(selected_values, v => v === value)
		if (props.c_multiple) {
			set_selected_values(v => index >= 0
				? array_concat(
					array_slice(v, 0, index),
					array_slice(v, index + 1)
				)
				: [...v, value]
			)
		}
		else {
			close_menu(menu_dropdown_ref)

			if (index >= 0) return;
			set_selected_values([value])
		}

		element_remove_style(menu_dropdown_ref, 'width')
		const button_width = rect_width(element_rect(button_dropdown_ref))
		const menu_width = rect_width(element_rect(menu_dropdown_ref))
		if (button_width > menu_width) element_set_style(
			menu_dropdown_ref,
			'width',
			`${button_width}px`
		)
		reposition_menu(menu_dropdown_ref)
		props.c_on_change?.(array_filter(options, o => is_selected(o.value)))
	}

	function focus_to_selected_options(){
		const btn = element_by_selector('button[data-c-dropdown-value][data-c-selected]', menu_dropdown_ref)
		if (!btn) return

		element_focus(btn)
	}

	createEffect(() => {
		const values = props.c_values
		const multiple = props.c_multiple

		if (!array_equals(values ?? [], local_values)) {
			local_values = values ?? []
			const values2: string[] = []
			for (const value of local_values) {
				if (!array_some(options, o => o.value === value)) continue

				array_push(values2, value)
				if (!multiple) break
			}

			set_selected_values([...values2])
		}
		if ((multiple ?? false) != local_multiple) {
			local_multiple = multiple ?? false

			if (!multiple) set_selected_values(d => array_slice(d, 0, 1))
		}
	})

	return (<DropdownContext.Provider value={{
		on_mount_option: (value, text) => {
			let index: number | null = null
			for (let i = 0; i < array_length(options); i++) {
				const option = options[i]
				const is_same_value = option.value === value
				const is_same_text = option.text === text

				if (is_same_value && is_same_text) return
				if (is_same_value) {
					index = i
					break
				}
			}

			// same value but different text
			if (index != null) set_options(o => [
				...array_slice(o, 0, index),
				{value, text},
				...array_slice(o, index + 1)
			])
			else set_options(d => [...d, {value, text}])

			const selected_values: string[] = []
			if (Array.isArray(props.c_values)){
				for (const value of props.c_values) {
					if (!array_some(options, v => v.value === value)) continue

					array_push(selected_values, value)
					if (!local_multiple) break
				}
			}

			set_selected_values([...selected_values])
		},
		on_cleanup_option: (value) => {
			if (value == null) return;

			let index = array_find_index(selected_values, v => v === value)
			if (index >= 0) set_selected_values(d => array_concat(
				array_slice(d, 0, index),
				array_slice(d, index + 1)
			))

			index = array_find_index(options, o => o.value === value)
			if (index < 0) return

			set_options(d => array_concat(
				array_slice(d, 0, index),
				array_slice(d, index + 1)
			))
		},
		multiple: () => props.c_multiple ?? false,
		selected_values: () => selected_values,
	}}>
		<Button
			ref={mergeRefs(props.ref, r => button_dropdown_ref = r)}
			c_variant={props.c_variant}
			classList={{
				'c-dropdown': true,
				...props.classList
			}}
			c_selected={props.c_selected ?? is_open()}
			onClick={ev => {
				event_call(ev, props.onClick)
				open_dropdown_menu(ev)
			}}
			{...other}>
			<Show when={props.c_label}>
				<div class="c-dropdown-label">{props.c_label}</div>
			</Show>
			{array_length(selected_values) == 0
				? props.c_text
				: array_join(array_map(array_filter(options, v => is_selected(v.value)), v => v.text), ', ')
			}
			<div style="flex:1"/>
			<Icon c_code={ICON_CHEVRON_DOWN}/>
		</Button>
		<Menu
			c_on_toggleopen={v => {
				set_is_open(v)
				menu_props.c_on_toggleopen?.(v)
			}}
			onClick={(ev) => {
				event_call(ev, menu_props.onClick)
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				let dropdown_value: string | number | undefined = element_dataset(button, 'cDropdownValue')
				if (!dropdown_value) return

				if (string_starts_with(dropdown_value, 'number:')) {
					dropdown_value = number_safe(number_parse(string_substring(dropdown_value, 7)))
				}

				on_select_option(dropdown_value)
			}}
			ref={mergeRefs(menu_props.ref, r => menu_dropdown_ref = r)}
			classList={{
				'c-dropdown-menu': true,
				...menu_props.classList
			}}
			{...menu_props_other}>
			{props.children}
		</Menu>
	</DropdownContext.Provider>)
}

export {
	Dropdown,
	DropdownOption,
	DropdownContext
}
export type {
	DropdownProps,
	DropdownContextProps,
	DropdownOptionProps
}
export default Dropdown