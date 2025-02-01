import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId, createMemo, createContext, useContext, type Accessor, createSignal, createEffect } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { object_has_value } from "@/utils/object"
import { event_call, event_prevent_default } from "@/utils/event"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { element_all_by_selector, element_first_child } from "@/utils/element"
import { KEY_ARROW_DOWN, KEY_ARROW_UP } from "@/constants/key_code"
import { AppColors } from "@/enums/colors"

import Divider, { type DividerProps } from "@/components/Divider"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import Popover, { close_popover, is_popover_open, open_popover, type PopoverProps, reposition_popover, PopoverPosition as SubMenuPosition } from "@/components/Popover"
import Modal, { type ModalProps, close_modal, focus_modal, is_modal_open, ModalPosition as MenuPosition, open_modal, reposition_modal } from "@/components/Modal"
import { RawSwitch, type RawSwitchProps } from "@/components/Switch"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

const SUBMENU_CLASSNAME = 'c-submenu'

type MenuContextProps = {
	parent_id: string
	is_pointer_hover_parent: Accessor<boolean>
} | undefined

const MenuContext = createContext<MenuContextProps>()

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_shortcuts: string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
	const [props, other] = splitProps($props, ['c_shortcuts'])
	return (<div class="c-menu-item-trailing-shortcut" {...other}>
		<For each={props.c_shortcuts}>{s => <kbd>{s}</kbd>}</For>
	</div>)
}

type MenuItemProps = ButtonProps & {
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_checked?: boolean
	c_icon_code?: number
}
const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_checked', 'c_leading', 'children', 'c_trailing',
		'classList', 'c_icon_code', 'c_variant',
		'c_indicator_position'
	])
	const trailing = children(() => props.c_trailing)

	return (<Button
		c_variant={props.c_variant ?? (other.c_selected? ButtonVariant.tonal : props.c_variant)}
		c_indicator_position={props.c_indicator_position ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={object_has_value(props.c_checked)}>
			<Icon
				style={{color: `rgb(${AppColors.accent})`}}
				c_filled={props.c_checked}
				c_code={props.c_checked? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props.c_icon_code != null}>
			<Icon
				style={{color: other.c_selected? `rgb(${AppColors.accent})` : undefined}}
				c_filled={other.c_selected}
				c_code={props.c_icon_code!}
			/>
		</Show>
		{ props.c_leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1"/>
		</Show>
		{ trailing() }
	</Button>)
}

type SubMenuItemProps = MenuItemProps
const SubMenuItem: ParentComponent<SubMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, ['c_trailing'])
	return (<MenuItem
		c_trailing={<>
			{props.c_trailing}
			<Icon c_code={0xE402}/>
		</>}
		{...other}
	/>)
}

type LinkMenuItemProps = LinkButtonProps & {
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_checked?: boolean
	c_icon_code?: number
}
const LinkMenuItem: ParentComponent<LinkMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_checked', 'c_leading', 'children', 'c_trailing',
		'classList', 'c_icon_code', 'c_variant',
		'c_indicator_position'
	])
	const trailing = children(() => props.c_trailing)

	return (<LinkButton
		c_variant={props.c_variant ?? (other.c_selected? ButtonVariant.tonal : props.c_variant)}
		c_indicator_position={props.c_indicator_position ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={object_has_value(props.c_checked)}>
			<Icon
				style={{color: props.c_checked? `rgb(${AppColors.accent})` : undefined}}
				c_filled={props.c_checked}
				c_code={props.c_checked? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props.c_icon_code != null}>
			<Icon
				style={{color: other.c_selected? `rgb(${AppColors.accent})` : undefined}}
				c_filled={other.c_selected}
				c_code={props.c_icon_code!}
			/>
		</Show>
		{ props.c_leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1"/>
		</Show>
		{ trailing() }
	</LinkButton>)
}

const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = ($props) => {
	const [props, other] = splitProps($props, ['class'])
	return (<div class={classlist("c-menu-indent", props.class)} {...other}/>)
}

const MenuDivider: Component<DividerProps> = (props) => {
	return (<Divider {...props}/>)
}

const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = ($props) => {
	const [props, other] = splitProps($props, ['class'])
	return (<div class={classlist("c-menu-header", props.class)} {...other}/>)
}

type SwitchMenuItemProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'> & {
	c_variant?: ButtonVariant
	c_focused?: boolean
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_icon_code?: number
	c_checked?: boolean
	c_disabled?: boolean
	c_attr_switch?: Omit<RawSwitchProps, 'children'>
}
const SwitchMenuItem: ParentComponent<SwitchMenuItemProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({
			c_variant: ButtonVariant.transparent,
			c_indicator_position: ButtonIndicatorPosition.left
		}, $props),
		[
			'children', 'c_variant', 'c_focused',
			'classList', 'class', 'c_leading',
			'c_trailing', 'c_icon_code', 'c_attr_switch',
			'c_checked', 'c_disabled'
		]
	)
	const [switch_props, switch_props_other] = splitProps(
		mergeProps({component: 'div', id: createUniqueId()}, props.c_attr_switch! ?? {}),
		['checked', 'disabled', 'id', 'c_attr_wrapper']
	)
	const variant = createMemo(() => props.c_variant)

	return (<label
		class={classlist('c-btn', 'c-menu-item', 'c-switch-menu-item', props.class)}
		data-c-disabled={attr_set_if_exist(props.c_disabled)}
		for={switch_props.id}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-focused={attr_set_if_exist(props.c_focused)}
		{...other}>
		{ props.c_leading }
		<Show when={props.c_icon_code != null}>
			<Icon c_code={props.c_icon_code!}/>
		</Show>
		{ props.children }
		<div style="flex:1" />
		{ props.c_trailing }
		<RawSwitch
			c_attr_wrapper={mergeProps({'data-g-no-outline': ''}, switch_props.c_attr_wrapper) as any}
			disabled={switch_props.disabled ?? props.c_disabled}
			checked={switch_props.checked ?? props.c_checked}
			id={switch_props.id}
			{...switch_props_other}
		/>
	</label>)
}

type SubMenuProps = PopoverProps & {
	c_item: JSX.Element
	c_attr_wrapper?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	c_children_auto_tabindex?: boolean
}

const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
	const $$props = mergeProps({
		c_children_auto_tabindex: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c_item', 'c_attr_wrapper',
		'ref', 'c_gap', 'c_position', 'c_use_portal',
		'c_padding', 'c_draggable', 'c_allow_hide_anchor',
		'c_on_toggleopen', 'children', 'c_on_beforeclose',
		'c_children_auto_tabindex', 'onPointerEnter',
		'onPointerLeave'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.c_attr_wrapper ?? {}, [
		'class', 'onClick','onPointerEnter', 'ref',
		'onPointerLeave'
	])
	const [is_hover, set_is_hover] = createSignal<boolean>(false)
	const context = useContext(MenuContext)
	const parent_id = context?.parent_id ?? undefined
	let timeout_id: number | null = null
	let div_ref: HTMLDivElement
	let popover_ref: HTMLDivElement
	let is_open: boolean = false

	function close_submenu_descendant(): void {
		for (const popover of element_all_by_selector(`[data-c-menu-parent="${other.id}"]`)) {
			close_popover(popover as HTMLDivElement)
		}
	}

	function close_submenu(instant?: boolean): void {
		if (timeout_id !== null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			close_popover(popover_ref)
			close_submenu_descendant()
			timeout_id = null
		}, instant? 0 : 800)
	}

	function open_submenu(ev: Event, instant?: boolean): void {
		if (is_open) return

		if (timeout_id !== null) timeout_clear(timeout_id)
		timeout_id = timeout_set(async () => {
			const first_child = element_first_child(div_ref)
			if (!first_child) return

			let removed = false
			const siblings = element_all_by_selector<HTMLDivElement>(`[data-c-menu-parent=${parent_id}]:not(#${other.id})`)
			for (const submenu of siblings) {
				removed = true
				close_popover(submenu)
			}

			if (removed) await wait(500) // wait for animation end
			open_popover(ev, popover_ref, {
				anchor: first_child,
				position: props.c_position ?? SubMenuPosition.right_center_to_bottom,
				gap: props.c_gap ?? -8,
				padding: props.c_padding ?? 5,
				draggable: props.c_draggable,
				allow_hide_anchor: props.c_allow_hide_anchor,
				manual_dismiss: true
			})
			timeout_id = null
		}, instant? 0 : 200)
	}

	createEffect(() => {
		const is_pointer_hover_parent = context?.is_pointer_hover_parent?.() ?? false

		if (is_pointer_hover_parent && !is_hover()) {
			close_submenu()
		}
		else if (timeout_id !== null) {
			timeout_clear(timeout_id)
			timeout_id = null
		}
	})

	return (<div
		class={classlist(SUBMENU_CLASSNAME, wrapper_props.class)}
		ref={mergeRefs(wrapper_props.ref, r => div_ref = r)}
		onPointerEnter={ev => {
			event_call(ev, wrapper_props.onPointerEnter)
			open_submenu(ev)
		}}
		onPointerLeave={ev => {
			event_call(ev, wrapper_props.onPointerLeave)
			close_submenu()
		}}
		onClick={ev => {
			event_call(ev, wrapper_props.onClick)
			open_submenu(ev, true)
		}}
		{...wrapper_props_other}>
		{props.c_item}
		<MenuContext.Provider value={{
			parent_id: other.id,
			is_pointer_hover_parent: () => is_hover()
		}}>
			<Popover
				c_use_portal={false}
				data-c-menu-parent={parent_id}
				c_on_toggleopen={$is_open => {
					is_open = $is_open
					props.c_on_toggleopen?.($is_open)
				}}
				c_on_beforeclose={() => {
					close_submenu_descendant()
					props.c_on_beforeclose?.()
				}}
				onPointerEnter={ev => {
					event_call(ev, props.onPointerEnter)
					set_is_hover(true)
				}}
				onPointerLeave={ev => {
					event_call(ev, props.onPointerLeave)
					set_is_hover(false)
				}}
				ref={mergeRefs(props.ref, r => popover_ref = r)}
				classList={{
					'c-menu': true,
					...props.classList
				}}
				{...other}>
				<Show when={props.c_children_auto_tabindex} fallback={props.children}>
					<FocusableGroup c_arrow_options={{
						up: 'prev',
						down: 'next'
					}}
					onKeyDown={ev => {
						const code = ev.code
						if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

						event_prevent_default(ev)
					}}>{props.children}</FocusableGroup>
				</Show>
			</Popover>
		</MenuContext.Provider>
	</div>)
}

type MenuProps = ModalProps & {
	c_children_auto_tabindex?: boolean
}
const Menu: ParentComponent<MenuProps> = ($props) => {
	const $$props = mergeProps({
		c_children_auto_tabindex: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c_gap', 'c_padding', 'c_content_auto_focus',
		'c_on_beforeclose', 'children', 'c_children_auto_tabindex',
		'c_attr_content_wrapper'
	])
	const [content_wrapper_props, content_wrapper_props_other] = splitProps(
		props.c_attr_content_wrapper ?? {},
		['onPointerEnter', 'onPointerLeave']
	)
	const [is_hover, set_is_hover] = createSignal<boolean>(false)

	function close_submenu_descendant(): void {
		for (const popover of element_all_by_selector(`[data-c-menu-parent="${other.id}"]`)) {
			close_popover(popover as HTMLDivElement)
		}
	}

	return (<MenuContext.Provider value={{
			parent_id: other.id,
			is_pointer_hover_parent: () => is_hover()
		}}>
		<Modal
			classList={{
				'c-menu': true,
				...props.classList
			}}
			c_on_beforeclose={() => {
				close_submenu_descendant()
				props.c_on_beforeclose?.()
			}}

			// exclusive to <Modal> since it use <dialog> and hides everything if not inside
			c_attr_content_wrapper={{
				...content_wrapper_props_other,
				onPointerEnter: ev => {
					event_call(ev, content_wrapper_props.onPointerEnter)
					set_is_hover(true)
				},
				onPointerLeave: ev => {
					event_call(ev, content_wrapper_props.onPointerLeave)
					set_is_hover(false)
				}
			}}
			c_content_auto_focus={props.c_content_auto_focus ?? true}
			c_gap={props.c_gap ?? 8}
			c_padding={props.c_padding ?? 4}
			{...other}>
			<Show when={props.c_children_auto_tabindex} fallback={props.children}>
				<FocusableGroup c_arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{props.children}</FocusableGroup>
			</Show>
		</Modal>
	</MenuContext.Provider>)
}

type PopoverMenuProps = PopoverProps & {
	c_children_auto_tabindex?: boolean
}
const PopoverMenu: ParentComponent<PopoverMenuProps> = ($props) => {
	const $$props = mergeProps({
		c_children_auto_tabindex: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c_gap', 'c_padding', 'children',
		'c_on_beforeclose', 'c_children_auto_tabindex',
		'onPointerEnter', 'onPointerLeave'
	])
	const [is_hover, set_is_hover] = createSignal<boolean>(false)

	function close_submenu_descendant(): void {
		for (const popover of element_all_by_selector(`[data-c-menu-parent="${other.id}"]`)) {
			close_popover(popover as HTMLDivElement)
		}
	}

	return (<MenuContext.Provider value={{
			parent_id: other.id,
			is_pointer_hover_parent: () => is_hover()
		}}>
		<Popover
			classList={{
				'c-menu': true,
				...props.classList
			}}
			c_on_beforeclose={() => {
				close_submenu_descendant()
				props.c_on_beforeclose?.()
			}}
			onPointerEnter={ev => {
				event_call(ev, props.onPointerEnter)
				set_is_hover(true)
			}}
			onPointerLeave={ev => {
				event_call(ev, props.onPointerLeave)
				set_is_hover(false)
			}}
			c_gap={props.c_gap ?? 8}
			c_padding={props.c_padding ?? 4}
			{...other}>
			<Show when={props.c_children_auto_tabindex} fallback={props.children}>
				<FocusableGroup c_arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{props.children}</FocusableGroup>
			</Show>
		</Popover>
	</MenuContext.Provider>)
}

export {
	SubMenu,
	Menu,
	MenuItem,
	MenuIndent,
	MenuHeader,
	MenuDivider,
	PopoverMenu,
	SubMenuItem,
	LinkMenuItem,
	SwitchMenuItem,
	MenuItemTrailingShortcut,
	is_popover_open as is_submenu_open,
	close_popover as close_submenu,
	open_popover as open_submenu,
	reposition_popover as reposition_submenu,
	is_popover_open as is_popovermenu_open,
	close_popover as close_popovermenu,
	open_popover as open_popovermenu,
	reposition_popover as reposition_popovermenu,
	focus_modal as focus_menu,
	open_modal as open_menu,
	close_modal as close_menu,
	reposition_modal as reposition_menu,
	is_modal_open as is_menu_open,
	SubMenuPosition,
	MenuPosition,
	MenuContext
}
export type {
	MenuProps,
	MenuContextProps,
	MenuItemProps,
	SwitchMenuItemProps,
	SubMenuProps,
	SubMenuItemProps,
	MenuItemTrailingShortcutProps,
	LinkMenuItemProps,
	PopoverMenuProps,
}
export default Menu