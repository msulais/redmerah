import { createStore } from "solid-js/store"
import { Show, createContext, createEffect, createMemo, createSelector, createSignal, mergeProps, onCleanup, onMount, splitProps, useContext, type Accessor, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { element_rect } from "@/utils/element"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { call_event_handler } from "@/utils/event"
import { array_concat, array_equals, array_filter, array_find_index, array_join, array_length, array_map, array_push, array_slice, array_some } from "@/utils/array"
import { rect_width } from "@/utils/rect"

import Menu, { MenuItem, type MenuProps, MenuPosition as DropdownPosition, type MenuItemProps, open_menu, close_menu, reposition_menu } from "@/components/Menu"
import { Button, ButtonVariant, type ButtonProps } from "@/components/Button"
import Icon from "@/components/Icon"
import './index.scss'

type DropdownContextProps = {
	on_mount_option(value: string | number, text: string): unknown
	on_cleanup_option(value: string | number | null): unknown
	on_select_option(value: string | number): unknown
	selected_values: Accessor<(number | string)[]>
	multiple: Accessor<boolean>
} | undefined

const DropdownContext = createContext<DropdownContextProps>()

type DropdownOptionProps = Omit<MenuItemProps, 'value'> & {
	value: string | number
	text: string
}

const DropdownOption: ParentComponent<DropdownOptionProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'value', 'onClick', 'selected', 'id', 'checked',
		'text', 'children'
	])
	const context = useContext(DropdownContext)
	const selected = createMemo<boolean>(() => {
		const selected_values = context?.selected_values()
		return selected_values == undefined
			? false
			: array_some(selected_values, v => v === props.value)
	})
	let value: string | number | null = null
	let text: string | null = null

	createEffect(() => {
		const _value = props.value
		const _text = props.text
		if (_value === value && _text == text) return

		value = _value
		text = _text
		context?.on_mount_option(value, text)
	})

	onCleanup(() => {
		context?.on_cleanup_option(props.value)
		value = text = null
	})

	return (<MenuItem
		selected={props.selected ?? context?.multiple()? undefined : selected()}
		checked={props.checked ?? context?.multiple()? selected() : undefined}
		onClick={ev => {
			context?.on_select_option(props.value)
			call_event_handler(ev, props.onClick)
		}}
		{...other}>
		{ props.children ?? props.text}
	</MenuItem>)
}

type DropdownProps = Omit<ButtonProps, 'value'> & {
	values?: (number | string)[]
	text?: string
	label?: string
	multiple?: boolean
	attr_menu?: MenuProps
	on_change_options?(values: {value: string | number, text: string}[]): unknown
}

const Dropdown: ParentComponent<DropdownProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({variant: ButtonVariant.tonal}, $props),
	[
		'disabled', 'multiple', 'children', 'text',
		'attr_menu', 'label', 'on_change_options',
		'values', 'ref', 'onClick', 'selected',
		'classList', 'variant'
	])
	const [menu_props, menu_props_other] = splitProps(
		props.attr_menu! ?? {},
		['on_toggle_open', 'ref', 'style', 'classList']
	)
	const [is_open, set_is_open] = createSignal<boolean>(false)
	const [options, set_options] = createStore<{value: string | number, text: string}[]>([])
	const [selected_values, set_selected_values] = createStore<(string | number)[]>([])
	const [width, set_width] = createSignal<number>(0)
	const is_selected = createSelector<(string | number)[], string | number>(
		() => selected_values,
		(value, array) => array_some(array, v => v === value)
	)
	let local_values: (number | string)[] = []
	let local_multiple: boolean = false
	let button_dropdown_ref: HTMLButtonElement
	let menu_dropdown_ref: HTMLDialogElement

	function open_dropdown_menu(ev: MouseEvent): void {
		set_width(rect_width(element_rect(button_dropdown_ref)))
		open_menu(ev, menu_dropdown_ref, {
			anchor: button_dropdown_ref,
			padding: 0,
			gap: 4,
			position: DropdownPosition.center_bottom,
		})
	}

	function on_select_option(value: string | number): void {
		const index = array_find_index(selected_values, v => v === value)
		if (props.multiple) {
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

		props.on_change_options?.(array_filter(options, o => is_selected(o.value)))
	}

	onMount(() => {
		let t: number | null = null

		const observer = new ResizeObserver(() => {
			if (!is_open()) return
			if (t != null) timeout_clear(t)

			t = timeout_set(() => {
				set_width(rect_width(element_rect(button_dropdown_ref)))
				reposition_menu(menu_dropdown_ref)
				t = null
			}, 300)
		})
		observer.observe(button_dropdown_ref!, { box: "border-box" })

		onCleanup(() => {
			observer.disconnect()
		})
	})

	createEffect(() => {
		const values = props.values
		const multiple = props.multiple

		if (!array_equals(values ?? [], local_values)) {
			local_values = values ?? []
			const values2: (string | number)[] = []
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

			const selected_values: (string | number)[] = []
			if (Array.isArray(props.values)){
				for (const value of props.values) {
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
		multiple: () => props.multiple ?? false,
		selected_values: () => selected_values,
		on_select_option,
	}}>
		<Button
			ref={mergeRefs(props.ref, r => button_dropdown_ref = r)}
			variant={props.variant}
			classList={{
				'c-dropdown': true,
				...props.classList
			}}
			selected={props.selected ?? is_open()}
			onClick={ev => {
				open_dropdown_menu(ev)
				call_event_handler(ev, props.onClick)
			}}
			{...other}>
			<Show when={props.label}>
				<div class="c-dropdown-label">{props.label}</div>
			</Show>
			{array_length(selected_values) == 0
				? props.text
				: array_join(array_map(array_filter(options, v => is_selected(v.value)), v => v.text), ', ')
			}
			<div style="flex:1"/>
			<Icon code={0xE3FC}/>
		</Button>
		<Menu
			on_toggle_open={v => {
				set_is_open(v)
				menu_props.on_toggle_open?.(v)
			}}
			ref={mergeRefs(menu_props.ref, r => menu_dropdown_ref = r)}
			style={{
				'min-width': width() + 'px',
				...menu_props.style
			}}
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