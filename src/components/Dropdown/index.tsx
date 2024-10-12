import { createStore } from "solid-js/store"
import { For, Show, createEffect, createSelector, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX, type VoidComponent } from "solid-js"
import type { DOMElement } from "solid-js/jsx-runtime"
import { mergeRefs } from "@solid-primitives/refs"

import { _refs, _dividerIndexs, _labels, _readOnly, _footer, _header, _disabled, _onSelectedItemsChanged, _items, _selectedValues, _labelAttr, _multiple, _trailing, _onClicks, _menuAttr, _optionIconTooltip, _some, _width, _centerBottom, _length, _slice, _map, _observe, _disconnect, _filter, _includes, _push, _ref, _classList, _onClick, _join, _px, _find, _style, _onToggleOpen, _wrapperAttr } from "@/constants/string"
import { getBoundingClientRect } from "@/utils/element"
import { toggleAttribute } from "@/utils/attributes"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { callEventHandler, stopImmediatePropagation } from "@/utils/event"

import { TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import TextField, { TextFieldButton, type TextFieldProps } from "@/components/TextField"
import Menu, { closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, openMenu, repositionMenu, type MenuProps, MenuPosition as DropdownPosition } from "@/components/Menu"
import './index.scss'

type Item = (
	[value: string | number, text: string, trailingText: string] |
	[value: string | number, text: string]
)

type DropdownProps = Omit<TextFieldProps, 'value'> & {
	items: Item[]
	selectedValues?: (string | number)[]
	dividerIndexs?: number[]
	labels?: [index: number, text: JSX.Element][]
	multiple?: boolean
	header?: JSX.Element
	footer?: JSX.Element
	optionIconTooltip?: string
	refs?: (el: HTMLButtonElement, item: Item) => unknown
	onClicks?: (ev: MouseEvent & {currentTarget: HTMLButtonElement; target: DOMElement}) => boolean | unknown
	onSelectedItemsChanged?: (items: Item[]) => unknown
	menuAttr?: Omit<MenuProps, 'style'> & {
		style?: JSX.CSSProperties
	}
}

const Dropdown: VoidComponent<DropdownProps> = ($props) => {
	const $$props = mergeProps({
		dividerIndexs: [],
		labels: [],
		trailings: []
	}, $props)
	const [props, other] = splitProps($$props, [
		_refs, _dividerIndexs, _labels, _readOnly,
		_footer, _header, _disabled, _onSelectedItemsChanged, _items,
		_selectedValues, _wrapperAttr, _multiple, _trailing,
		_onClicks, _menuAttr, _optionIconTooltip
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(
		props[_wrapperAttr]! ?? {},
		[_ref, _classList, _onClick]
	)
	const [menuProps, menuPropsOther] = splitProps(
		props[_menuAttr]! ?? {},
		[_onToggleOpen, _ref, _style, _classList]
	)
	const [selectedItems, setSelectedItems] = createStore<Item[]>([])
	const [width, setWidth] = createSignal<number>(0)
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const isSelected = createSelector<Item[], string | number>(
		() => selectedItems,
		(item, items) => items[_some]((a) => a[0] == item)
	)
	let wrapper_dropdown_ref: HTMLDivElement
	let menu_dropdown_ref: HTMLDialogElement
	let $selectedValues: (string | number)[] = []

	function openDropdownMenu(ev: MouseEvent): void {
		if (props[_disabled] || props[_readOnly]) return;

		setWidth(getBoundingClientRect(wrapper_dropdown_ref)[_width])
		openMenu(ev, menu_dropdown_ref, {
			anchor: wrapper_dropdown_ref,
			padding: 0,
			gap: 4,
			position: DropdownPosition[_centerBottom],
			allowHideAnchor: false
		})
	}

	function selectItem(item: Item): void {
		if (props[_multiple]) {
			if (isSelected(item[0])) {
				let index = 0
				for (let i = 0; i < selectedItems[_length]; i++) {
					if (selectedItems[i][0] != item[0]) continue

					index = i
					break
				}
				setSelectedItems(v => [...v[_slice](0, index), ...v[_slice](index+1)])
			} else {
				setSelectedItems(v => [...v, item])
			}
		} else {
			closeMenu(menu_dropdown_ref)

			if (isSelected(item[0])) return;
			setSelectedItems([[...item]])
		}

		$selectedValues = selectedItems[_map](v => v[0])
		if (props[_onSelectedItemsChanged]) props[_onSelectedItemsChanged]([...selectedItems])
	}

	onMount(() => {
		let t: number | null = null

		const observer = new ResizeObserver(() => {
			if (t != null) clearTimeDelayed(t)

			t = setTimeDelayed(() => {
				setWidth(getBoundingClientRect(wrapper_dropdown_ref)[_width])
				repositionMenu(menu_dropdown_ref)
				t = null
			}, 300)
		})
		observer[_observe](wrapper_dropdown_ref!, { box: "border-box" })

		onCleanup(() => {
			observer[_disconnect]()
		})
	})

	createEffect(() => {
		const selectedValues = props[_selectedValues] ?? $selectedValues
		const multiple = props[_multiple]
		const items = props[_items]

		let $items: Item[] = []
		if (selectedValues[_length] == 0) return setSelectedItems($items)

		if (multiple) $items = items[_filter](item => selectedValues[_includes](item[0] as never))
		else {
			const item = items[_find]((item) => item[0] == selectedValues[0])
			if (item) $items[_push](item)
		}

		$selectedValues = $items[_map](v => v[0])
		setSelectedItems($items)
	})

	return (<>
		<TextField
			readOnly
			disabled={props[_disabled]}
			focused={isFocus()}
			wrapperAttr={{
				ref: mergeRefs(wrapperProps[_ref], r => wrapper_dropdown_ref = r),
				classList: {
					'dropdown': true,
					...wrapperProps[_classList]
				},
				onClick: ev => {
					stopImmediatePropagation(ev)
					openDropdownMenu(ev)
					callEventHandler(ev, wrapperProps[_onClick])
				},
				...{'data-dropdown-readonly': toggleAttribute(props[_readOnly])},
				...wrapperPropsOther
			}}
			value={selectedItems[_map](i => i[1])[_join](', ')}
			trailing={<>
				{props[_trailing]}
				<Show when={!props[_readOnly]}>
					<TextTooltip text={props[_optionIconTooltip] ?? "Show options"}>
						<TextFieldButton
							focused={isFocus()}
							onClick={ev => openDropdownMenu(ev)}>
							<Icon code={0xE3FC}/>
						</TextFieldButton>
					</TextTooltip>
				</Show>
			</>}
			{...other}
		/>
		<Menu
			onToggleOpen={v => {
				setIsFocus(v)
				if (menuProps[_onToggleOpen]) menuProps[_onToggleOpen](v)
			}}
			ref={mergeRefs(menuProps.ref, r => menu_dropdown_ref = r)}
			style={{
				'min-width': width() + _px,
				...menuProps[_style]
			}}
			classList={{
				'dropdown-menu': true,
				...menuProps[_classList]
			}}
			{...menuPropsOther}>
			<div class="dropdown-header">{ props[_header] }</div>
			<div class="dropdown-items">
				<For each={props[_items]}>{(item, index) => <>
					<Show when={(props[_dividerIndexs] as number[])[_includes](index())}>
						<MenuDivider />
					</Show>
					<For each={props[_labels]}>{h => <Show when={index() == h[0]}>
						<MenuHeader>{h[1]}</MenuHeader>
					</Show>}</For>
					<MenuItem
						ref={(r) => {
							if (props[_refs]) props[_refs](r, item)
						}}
						onClick={(ev) => {
							if (props[_onClicks]) {
								const isContinue = props[_onClicks](ev)
								if (isContinue == false) return
							}
							selectItem(item)
						}}
						trailing={item[2]}
						selected={!props[_multiple]? isSelected(item[0]) : undefined}
						checked={props[_multiple]? isSelected(item[0]) : undefined}>
						{item[1]}
					</MenuItem>
				</>}</For>
			</div>
			<div class="dropdown-footer">{ props[_footer] }</div>
		</Menu>
	</>)
}

export {
	Dropdown,
	MenuHeader as DropdownHeader,
	MenuItem as DropdownItem,
	MenuDivider as DropdownDivider,
	LinkMenuItem as LinkDropdownItem,
	DropdownPosition
}
export type {
	DropdownProps,
	Item
}
export default Dropdown