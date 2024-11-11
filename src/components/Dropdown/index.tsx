import { createStore } from "solid-js/store"
import { Show, createContext, createEffect, createMemo, createSelector, createSignal, mergeProps, onCleanup, onMount, splitProps, useContext, type Accessor, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { _refs, _dividerIndexs, _values, _selected, _labels, _readOnly, _footer, _header, _disabled, _onSelectedItemsChanged, _items, _selectedValues, _labelAttr, _multiple, _trailing, _onClicks, _menuAttr, _optionIconTooltip, _some, _width, _centerBottom, _length, _slice, _map, _observe, _disconnect, _filter, _includes, _push, _ref, _classList, _onClick, _join, _px, _find, _style, _onToggleOpen, _wrapperAttr, _label, _value, _id, _onCleanupOption, _onMountOption, _onSelectOption, _checked, _children, _text, _onChangeOptions, _accent, _focused, _findIndex, _concat, _tonal, _splice, _variant, _filled, _onAccent } from "@/constants/string"
import { getBoundingClientRect } from "@/utils/element"
import { endTimeout, startTimeout } from "@/utils/timeout"
import { callEventHandler } from "@/utils/event"

import Menu, { closeMenu, MenuItem, openMenu, repositionMenu, type MenuProps, MenuPosition as DropdownPosition, type MenuItemProps } from "@/components/Menu"
import { Button, ButtonVariant, type ButtonProps } from "@/components/Button"
import Icon from "@/components/Icon"
import './index.scss'

type DropdownContextProps = {
	onMountOption(value: string | number, text: string): unknown
	onCleanupOption(value: string | number | null): unknown
	onSelectOption(value: string | number): unknown
	selectedValues: Accessor<(number | string)[]>
	multiple: Accessor<boolean>
} | undefined

const DropdownContext = createContext<DropdownContextProps>()

type DropdownOptionProps = Omit<MenuItemProps, 'value'> & {
	value: string | number
	text: string
}

const DropdownOption: ParentComponent<DropdownOptionProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_value, _onClick, _selected, _id, _checked,
		_text, _children
	])
	const context = useContext(DropdownContext)
	const selected = createMemo<boolean>(() => {
		const selectedValues = context?.[_selectedValues]()
		return selectedValues == undefined
			? false
			: selectedValues[_map](v => `${v}`)[_includes](`${props[_value]}`)
	})
	let value: string | number | null = null

	createEffect(() => {
		context?.[_onCleanupOption](value) // remove old value
		context?.[_onMountOption](props[_value], props[_text])
		value = props[_value]
	})
	onCleanup(() => context?.[_onCleanupOption](props[_value]))

	return (<MenuItem
		selected={props[_selected] ?? context?.[_multiple]()? undefined : selected()}
		checked={props[_checked] ?? context?.[_multiple]()? selected() : undefined}
		onClick={ev => {
			context?.[_onSelectOption](props[_value])
			callEventHandler(ev, props[_onClick])
		}}
		{...other}>
		{ props[_children] ?? props[_text]}
	</MenuItem>)
}

type DropdownProps = Omit<ButtonProps, 'value'> & {
	values?: (number | string)[]
	text?: string
	label?: string
	multiple?: boolean
	menuAttr?: MenuProps
	onChangeOptions?(values: {value: string | number, text: string}[]): unknown
}

const Dropdown: ParentComponent<DropdownProps> = ($props) => {
	const [props, other] = splitProps(mergeProps({variant: ButtonVariant[_tonal]}, $props), [
		_disabled, _multiple, _children, _text,
		_menuAttr, _label, _onChangeOptions,
		_values, _ref, _onClick, _selected,
		_classList, _variant
	])
	const [menuProps, menuPropsOther] = splitProps(
		props[_menuAttr]! ?? {},
		[_onToggleOpen, _ref, _style, _classList]
	)
	const [isOpen, setIsOpen] = createSignal<boolean>(false)
	const [options, setOptions] = createStore<{value: string | number, text: string}[]>([])
	const [selectedValues, setSelectedValues] = createStore<(string | number)[]>([])
	const [width, setWidth] = createSignal<number>(0)
	const isSelected = createSelector<(string | number)[], string | number>(
		() => selectedValues,
		(value, array) => array[_includes](value)
	)
	let $options: {value: string | number, text: string}[] = []
	let button_dropdown_ref: HTMLButtonElement
	let menu_dropdown_ref: HTMLDialogElement

	function openDropdownMenu(ev: MouseEvent): void {
		setWidth(getBoundingClientRect(button_dropdown_ref)[_width])
		openMenu(ev, menu_dropdown_ref, {
			anchor: button_dropdown_ref,
			padding: 0,
			gap: 4,
			position: DropdownPosition[_centerBottom],
		})
	}

	function onSelectOption(value: string | number): void {
		const index = selectedValues[_findIndex](v => v == value)
		if (props[_multiple]) {
			setSelectedValues(v => index >= 0
				? v[_slice](0, index)[_concat](v[_slice](index + 1))
				: [...v, value]
			)
		} else {
			closeMenu(menu_dropdown_ref)

			if (index >= 0) return;
			setSelectedValues([value])
		}

		props[_onChangeOptions]?.(options[_filter](o => isSelected(o[_value])))
	}

	onMount(() => {
		let t: number | null = null

		const observer = new ResizeObserver(() => {
			if (!isOpen()) return
			if (t != null) endTimeout(t)

			t = startTimeout(() => {
				setWidth(getBoundingClientRect(button_dropdown_ref)[_width])
				repositionMenu(menu_dropdown_ref)
				t = null
			}, 300)
		})
		observer[_observe](button_dropdown_ref!, { box: "border-box" })

		onCleanup(() => {
			observer[_disconnect]()
		})
	})

	createEffect(() => {
		const values = props[_values]
		const multiple = props[_multiple]

		if (values != undefined) setSelectedValues(values)

		if (!multiple) setSelectedValues(d => d[_slice](0, 1))
	})

	return (<DropdownContext.Provider value={{
		onMountOption: (value, text) => {
			// !IMPORTANT: DON'T CALL ANY SIGNAL HERE
			if ($options[_some](o => o[_value] == value)) return;
			setOptions(d => [...d, {value, text}])
			$options[_push]({value, text})
		},
		onCleanupOption: (value) => {
			if (value == null) return;

			let index = selectedValues[_findIndex](v => v == value)
			if (index >= 0) setSelectedValues(d => d[_slice](0, index)[_concat](d[_slice](index + 1)))

			index = options[_findIndex](o => o[_value] == value)
			if (index < 0) return

			setOptions(d => d[_slice](0, index)[_concat](d[_slice](index + 1)))
			$options[_splice](index, 1)
		},
		multiple: () => props[_multiple] ?? false,
		selectedValues: () => selectedValues,
		onSelectOption,
	}}>
		<Button
			ref={mergeRefs(props[_ref], r => button_dropdown_ref = r)}
			variant={props[_variant]}
			classList={{
				'c-dropdown': true,
				...props[_classList]
			}}
			selected={props[_selected] ?? isOpen()}
			onClick={ev => {
				openDropdownMenu(ev)
				callEventHandler(ev, props[_onClick])
			}}
			{...other}>
			<Show when={props[_label]}>
				<div class="c-dropdown-label">{props[_label]}</div>
			</Show>
			{selectedValues[_length] == 0
				? props[_text]
				: options[_filter](v => isSelected(v[_value]))[_map](v => v[_text])[_join](', ')
			}
			<div style="flex:1"/>
			<Icon code={0xE3FC}/>
		</Button>
		<Menu
			onToggleOpen={v => {
				setIsOpen(v)
				menuProps[_onToggleOpen]?.(v)
			}}
			ref={mergeRefs(menuProps[_ref], r => menu_dropdown_ref = r)}
			style={{
				'min-width': width() + _px,
				...menuProps[_style]
			}}
			classList={{
				'c-dropdown-menu': true,
				...menuProps[_classList]
			}}
			{...menuPropsOther}>
			{props[_children]}
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