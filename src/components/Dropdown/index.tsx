import { createStore } from "solid-js/store"
import { Show, createContext, createEffect, createMemo, createSelector, createSignal, mergeProps, onCleanup, splitProps, useContext, type Accessor, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { elementBySelector, elementDataset, elementFocus, elementRect, elementStyleRemove, elementStyleSet, elementTagName, elementValidTarget } from "@/utils/element"
import { eventCall, eventCurrentTarget } from "@/utils/event"
import { arrayConcat, arrayEquals, arrayFilter, arrayFindIndex, arrayJoin, arrayLength, arrayMap, arrayPush, arraySlice, arraySome } from "@/utils/array"
import { rectWidth } from "@/utils/rect"
import { documentActive } from "@/utils/document"
import { typeIsNumber } from "@/utils/typecheck"
import { stringStartsWith, stringSubstring } from "@/utils/string"
import { numberParse, numberSafe } from "@/utils/number"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"

import Menu, { MenuItem, type MenuProps, MenuPosition as DropdownPosition, type MenuItemProps, openMenu, closeMenu, repositionMenu } from "@/components/Menu"
import { Button, ButtonVariant, type ButtonProps } from "@/components/Button"
import Icon from "@/components/Icon"
import './index.scss'

type DropdownContextProps = {
	onMountOption(value: string | number, text: string): unknown
	onCleanUpOption(value: string | number | null): unknown
	selectedValues: Accessor<(string | number)[]>
	multiple: Accessor<boolean>
} | undefined

const DropdownContext = createContext<DropdownContextProps>()

type DropdownOptionProps = MenuItemProps & {
	'c:value': string | number
	'c:text': string
}

const DropdownOption: ParentComponent<DropdownOptionProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:value', 'c:selected', 'id', 'c:checked',
		'c:text', 'children'
	])
	const context = useContext(DropdownContext)
	const selected = createMemo<boolean>(() => {
		const selected_values = context?.selectedValues()
		return selected_values == undefined
			? false
			: arraySome(selected_values, v => v === props['c:value'])
	})
	let value: string | number | null = null
	let text: string | null = null

	createEffect(() => {
		const _value = props['c:value']
		const _text = props['c:text']
		if (_value === value && _text == text) return

		value = _value
		text = _text
		context?.onMountOption(value, text)
	})

	onCleanup(() => {
		context?.onCleanUpOption(props['c:value'])
		value = text = null
	})

	return (<MenuItem
		c:selected={props["c:selected"] ?? context?.multiple()? undefined : selected()}
		c:checked={props["c:checked"] ?? context?.multiple()? selected() : undefined}
		data-c-dropdown-value={(typeIsNumber(props['c:value'])? 'number:' : '') + props['c:value']}
		{...other}>
		{ props.children ?? props['c:text']}
	</MenuItem>)
}

type DropdownProps = ButtonProps & {
	'c:values'?: (string | number)[]
	'c:text'?: string
	'c:label'?: string
	'c:multiple'?: boolean
	'c:attrMenu'?: MenuProps
	'c:onChange'?(values: {value: string | number, text: string}[]): unknown
}

const Dropdown: ParentComponent<DropdownProps> = ($props) => {
	const $$props = mergeProps({'c:variant': ButtonVariant.tonal}, $props)
	const [props, other] = splitProps($$props, [
		'disabled', 'c:multiple', 'children', 'c:text',
		'c:attrMenu', 'c:label', 'c:onChange',
		'c:values', 'ref', 'onClick', 'c:selected',
		'classList', 'c:variant'
	])
	const [menuProps, otherMenuProps] = splitProps(
		props["c:attrMenu"]! ?? {},
		[
			'c:onToggleOpen', 'ref', 'classList',
			'onClick'
		]
	)
	const [isOpen, setIsOpen] = createSignal<boolean>(false)
	const [options, setOptions] = createStore<{value: string | number, text: string}[]>([])
	const [selectedValues, setSelectedValues] = createStore<(string | number)[]>([])
	const isSelected = createSelector<(string | number)[], string | number>(
		() => selectedValues,
		(value, array) => arraySome(array, v => v === value)
	)
	let localValues: (string | number)[] = []
	let localMultiple: boolean = false
	let buttonRef: HTMLButtonElement
	let menuRef: HTMLDialogElement

	function openDrowdownMenu(): void {
		openMenu(menuRef, {
			anchor: buttonRef,
			padding: 0,
			gap: 4,
			position: DropdownPosition.centerBottom,
			onOpen: () => focusToSelectedOptions()
		})
		elementStyleRemove(menuRef, 'width')
		const buttonWidth = rectWidth(elementRect(buttonRef))
		const menuWidth = rectWidth(elementRect(menuRef))
		if (buttonWidth > menuWidth) elementStyleSet(
			menuRef,
			'width',
			`${buttonWidth}px`
		)
		repositionMenu(menuRef)
	}

	function selectOption(value: string | number): void {
		const index = arrayFindIndex(selectedValues, v => v === value)
		if (props['c:multiple']) {
			setSelectedValues(v => index >= 0
				? arrayConcat(
					arraySlice(v, 0, index),
					arraySlice(v, index + 1)
				)
				: [...v, value]
			)
		}
		else {
			closeMenu(menuRef)

			if (index >= 0) return;
			setSelectedValues([value])
		}

		props["c:onChange"]?.(arrayFilter(options, o => isSelected(o.value)))
		elementStyleRemove(menuRef, 'width')
		const buttonWidth = rectWidth(elementRect(buttonRef))
		const menuWidth = rectWidth(elementRect(menuRef))
		if (buttonWidth > menuWidth) elementStyleSet(
			menuRef,
			'width',
			`${buttonWidth}px`
		)
		repositionMenu(menuRef)
	}

	function focusToSelectedOptions(){
		const btn = elementBySelector('button[data-c-dropdown-value][data-c-selected]', menuRef)
		if (!btn) return

		elementFocus(btn)
	}

	createEffect(() => {
		const values = props['c:values']
		const multiple = props['c:multiple']

		if (!arrayEquals(values ?? [], localValues)) {
			localValues = values ?? []
			const values2: string[] = []
			for (const value of localValues) {
				if (!arraySome(options, o => o.value === value)) continue

				arrayPush(values2, value)
				if (!multiple) break
			}

			setSelectedValues([...values2])
		}
		if ((multiple ?? false) != localMultiple) {
			localMultiple = multiple ?? false

			if (!multiple) setSelectedValues(d => arraySlice(d, 0, 1))
		}
	})

	return (<DropdownContext.Provider value={{
		onMountOption: (value, text) => {
			let index: number | null = null
			for (let i = 0; i < arrayLength(options); i++) {
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
			if (index != null) setOptions(o => [
				...arraySlice(o, 0, index),
				{value, text},
				...arraySlice(o, index + 1)
			])
			else setOptions(d => [...d, {value, text}])

			const selected_values: string[] = []
			if (Array.isArray(props['c:values'])){
				for (const value of props['c:values']) {
					if (!arraySome(options, v => v.value === value)) continue

					arrayPush(selected_values, value)
					if (!localMultiple) break
				}
			}

			setSelectedValues([...selected_values])
		},
		onCleanUpOption: (value) => {
			if (value == null) return;

			let index = arrayFindIndex(selectedValues, v => v === value)
			if (index >= 0) setSelectedValues(d => arrayConcat(
				arraySlice(d, 0, index),
				arraySlice(d, index + 1)
			))

			index = arrayFindIndex(options, o => o.value === value)
			if (index < 0) return

			setOptions(d => arrayConcat(
				arraySlice(d, 0, index),
				arraySlice(d, index + 1)
			))
		},
		multiple: () => props['c:multiple'] ?? false,
		selectedValues: () => selectedValues,
	}}>
		<Button
			ref={mergeRefs(props.ref, r => buttonRef = r)}
			c:variant={props["c:variant"]}
			classList={{
				'c-dropdown': true,
				...props.classList
			}}
			c:selected={props["c:selected"] ?? isOpen()}
			onClick={ev => {
				eventCall(ev, props.onClick)
				openDrowdownMenu()
			}}
			{...other}>
			<Show when={props['c:label']}>
				<div class="c-dropdown-label">{props['c:label']}</div>
			</Show>
			{arrayLength(selectedValues) == 0
				? props['c:text']
				: arrayJoin(arrayMap(arrayFilter(options, v => isSelected(v.value)), v => v.text), ', ')
			}
			<div style="flex:1"/>
			<Icon c:code={ICON_CHEVRON_DOWN}/>
		</Button>
		<Menu
			c:onToggleOpen={v => {
				setIsOpen(v)
				menuProps["c:onToggleOpen"]?.(v)
			}}
			onClick={(ev) => {
				eventCall(ev, menuProps.onClick)
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				let dropdown_value: string | number | undefined = elementDataset(button, 'cDropdownValue')
				if (!dropdown_value) return

				if (stringStartsWith(dropdown_value, 'number:')) {
					dropdown_value = numberSafe(numberParse(stringSubstring(dropdown_value, 7)))
				}

				selectOption(dropdown_value)
			}}
			ref={mergeRefs(menuProps.ref, r => menuRef = r)}
			classList={{
				'c-dropdown-menu': true,
				...menuProps.classList
			}}
			{...otherMenuProps}>
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