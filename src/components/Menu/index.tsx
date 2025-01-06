import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId, createMemo } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { object_has_value } from "@/utils/object"
import { event_call, event_prevent_default, event_stop_immediate_propagation, event_stop_propagation } from "@/utils/event"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { element_children, element_classlist_contains, element_first_child, element_is_same_node, element_last_child, element_parent } from "@/utils/element"
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

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
	shortcuts: string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
	const [props, other] = splitProps($props, ['shortcuts'])
	return (<div class="c-menu-item-trailing-shortcut" {...other}>
		<For each={props.shortcuts}>{s => <kbd>{s}</kbd>}</For>
	</div>)
}

type MenuItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	checked?: boolean
	icon_code?: number
}
const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'checked', 'leading', 'children', 'trailing',
		'classList', 'icon_code', 'variant',
		'indicator_position'
	])
	const trailing = children(() => props.trailing)

	return (<Button
		variant={props.variant ?? (other.selected? ButtonVariant.tonal : props.variant)}
		indicator_position={props.indicator_position ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={object_has_value(props.checked)}>
			<Icon
				style={{color: `rgb(${AppColors.accent})`}}
				filled={props.checked}
				code={props.checked? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props.icon_code != null}>
			<Icon
				style={{color: other.selected? `rgb(${AppColors.accent})` : undefined}}
				filled={other.selected}
				code={props.icon_code!}
			/>
		</Show>
		{ props.leading }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1"/>
		</Show>
		{ trailing() }
	</Button>)
}

type SubMenuItemProps = MenuItemProps
const SubMenuItem: ParentComponent<SubMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, ['trailing'])
	return (<MenuItem
		trailing={<>
			{props.trailing}
			<Icon code={0xE402}/>
		</>}
		{...other}
	/>)
}

type LinkMenuItemProps = LinkButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	checked?: boolean
	icon_code?: number
}
const LinkMenuItem: ParentComponent<LinkMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'checked', 'leading', 'children', 'trailing',
		'classList', 'icon_code', 'variant',
		'indicator_position'
	])
	const trailing = children(() => props.trailing)

	return (<LinkButton
		variant={props.variant ?? (other.selected? ButtonVariant.tonal : props.variant)}
		indicator_position={props.indicator_position ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={object_has_value(props.checked)}>
			<Icon
				style={{color: props.checked? `rgb(${AppColors.accent})` : undefined}}
				filled={props.checked}
				code={props.checked? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props.icon_code != null}>
			<Icon
				style={{color: other.selected? `rgb(${AppColors.accent})` : undefined}}
				filled={other.selected}
				code={props.icon_code!}
			/>
		</Show>
		{ props.leading }
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
	variant?: ButtonVariant
	focused?: boolean
	leading?: JSX.Element
	trailing?: JSX.Element
	icon_code?: number
	checked?: boolean
	disabled?: boolean
	attr_switch?: Omit<RawSwitchProps, 'children'>
}
const SwitchMenuItem: ParentComponent<SwitchMenuItemProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({
			variant: ButtonVariant.transparent,
			indicator_position: ButtonIndicatorPosition.left
		}, $props),
		[
			'children', 'variant', 'focused',
			'classList', 'class', 'leading',
			'trailing', 'icon_code', 'attr_switch',
			'checked', 'disabled'
		]
	)
	const [switch_props, switch_props_other] = splitProps(
		mergeProps({component: 'div', id: createUniqueId()}, props.attr_switch! ?? {}),
		['checked', 'disabled', 'id', 'attr_wrapper']
	)
	const variant = createMemo(() => props.variant)

	return (<label
		class={classlist('c-btn', 'c-menu-item', 'c-switch-menu-item', props.class)}
		data-c-disabled={attr_set_if_exist(props.disabled)}
		for={switch_props.id}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-focused={attr_set_if_exist(props.focused)}
		{...other}>
		{ props.leading }
		<Show when={props.icon_code != null}>
			<Icon code={props.icon_code!}/>
		</Show>
		{ props.children }
		<div style="flex:1" />
		{ props.trailing }
		<RawSwitch
			attr_wrapper={mergeProps({'data-g-no-outline': ''}, switch_props.attr_wrapper) as any}
			disabled={switch_props.disabled ?? props.disabled}
			checked={switch_props.checked ?? props.checked}
			id={switch_props.id}
			{...switch_props_other}
		/>
	</label>)
}

type SubMenuProps = PopoverProps & {
	item: JSX.Element
	gap?: number
	position?: SubMenuPosition
	padding?: number
	draggable?: boolean
	allow_hide_anchor?: boolean
	attr_wrapper?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	children_auto_tabindex?: boolean
}

// TODO: improvise close or open of submenu
const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
	const $$props = mergeProps({
		children_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'item', 'attr_wrapper',
		'id', 'onClick', 'ref', 'gap', 'position',
		'padding', 'draggable', 'allow_hide_anchor',
		'on_toggle_open', 'children', 'on_before_close',
		'use_portal', 'children_auto_tabindex'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.attr_wrapper ?? {}, [
		'class', 'onClick','onPointerEnter',
		'onPointerLeave', 'ref'
	])
	const content = children(() => props.children)
	let timeout_id: number | null = null
	let div_ref: HTMLDivElement
	let popover_ref: HTMLDivElement
	let is_open: boolean = false

	function close_submenu_descendant(): void {
		for (const el of element_children(element_first_child(popover_ref)!) as unknown as HTMLElement[]) {
			if (!element_classlist_contains(el, SUBMENU_CLASSNAME)) continue;
			close_popover(element_last_child(el) as HTMLDivElement)
		}
	}

	function cancel_timeout(): void {
		if (timeout_id == null) return;

		timeout_clear(timeout_id)
		timeout_id = null
	}

	async function open(ev: Event): Promise<void> {
		if (is_open) return;

		let some_submenu_open = false;
		const first_child = element_first_child(div_ref)
		if (!first_child) return

		for (const el of (element_parent(div_ref)?.children ?? []) as HTMLElement[]) {
			if (!element_classlist_contains(el, SUBMENU_CLASSNAME) || element_is_same_node(el, div_ref)) continue

			const popover = element_last_child(el) as HTMLDivElement
			const isOpen = is_popover_open(popover)
			if (!some_submenu_open && isOpen) some_submenu_open = true
			if (isOpen) close_popover(popover)
		}

		// wait for close animation done
		if (some_submenu_open) await wait(500)

		open_popover(ev, popover_ref, {
			anchor: first_child,
			position: props.position ?? SubMenuPosition.right_center_to_bottom,
			gap: props.gap ?? -8,
			padding: props.padding ?? 5,
			draggable: props.draggable,
			allow_hide_anchor: props.allow_hide_anchor,
			manual_dismiss: true
		})
	}

	return (<div
		class={classlist(SUBMENU_CLASSNAME, wrapper_props.class)}
		ref={mergeRefs(wrapper_props.ref, r => div_ref = r)}
		onClick={(ev) => {
			cancel_timeout()
			open(ev)
			event_call(ev, wrapper_props.onClick)
		}}
		onPointerEnter={(ev) => {
			cancel_timeout()
			timeout_id = timeout_set(() => {
				open(ev)
				timeout_id = null
			}, 300)
			event_call(ev, wrapper_props.onPointerEnter)
		}}
		onPointerLeave={(ev) => {
			cancel_timeout()
			timeout_id = timeout_set(() => {
				close_popover(popover_ref)
				timeout_id = null
			}, 500)
			event_call(ev, wrapper_props.onPointerLeave)
		}}
		{...wrapper_props_other}>
		{props.item}
		<Popover
			use_portal={false}
			on_toggle_open={$is_open => {
				is_open = $is_open
				props.on_toggle_open?.($is_open)
			}}
			onClick={(ev) => {
				event_stop_propagation(ev)
				event_stop_immediate_propagation(ev)
				event_call(ev, props.onClick)
			}}
			on_before_close={() => {
				close_submenu_descendant()
				props.on_before_close?.()
			}}
			ref={mergeRefs(props.ref, r => popover_ref = r)}
			classList={{
				'c-menu': true,
				...props.classList
			}}
			{...other}>
			<Show when={props.children_auto_tabindex} fallback={content()}>
				<FocusableGroup arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{content()}</FocusableGroup>
			</Show>
		</Popover>
	</div>)
}

type MenuProps = ModalProps & {
	children_auto_tabindex?: boolean
}
const Menu: ParentComponent<MenuProps> = ($props) => {
	const $$props = mergeProps({
		children_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'gap', 'padding', 'content_auto_focus',
		'on_before_close', 'ref', 'children',
		'children_auto_tabindex'
	])
	const content = children(() => props.children)
	let menu_ref: HTMLDialogElement

	function close_submenu_descendant(): void {
		for (const el of element_children(element_first_child(menu_ref)!) as unknown as HTMLElement[]) {
			if (!element_classlist_contains(el, SUBMENU_CLASSNAME)) continue
			close_popover(element_last_child(el) as HTMLDivElement)
		}
	}

	return (<Modal
		ref={mergeRefs(props.ref, r => menu_ref = r)}
		classList={{
			'c-menu': true,
			...props.classList
		}}
		on_before_close={() => {
			close_submenu_descendant()
			props.on_before_close?.()
		}}
		content_auto_focus={props.content_auto_focus ?? true}
		gap={props.gap ?? 8}
		padding={props.padding ?? 4}
		{...other}>
		<Show when={props.children_auto_tabindex} fallback={content()}>
			<FocusableGroup arrow_options={{
				up: 'prev',
				down: 'next'
			}}
			onKeyDown={ev => {
				const code = ev.code
				if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

				event_prevent_default(ev)
			}}>{content()}</FocusableGroup>
		</Show>
	</Modal>)
}

type PopoverMenuProps = PopoverProps & {
	children_auto_tabindex?: boolean
}
const PopoverMenu: ParentComponent<PopoverMenuProps> = ($props) => {
	const $$props = mergeProps({
		children_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'gap', 'padding', 'children',
		'on_before_close', 'ref', 'children_auto_tabindex'
	])
	const content = children(() => props.children)
	let menu_ref: HTMLDivElement

	function close_submenu_descendant(): void {
		for (const el of element_children(element_first_child(menu_ref)!) as unknown as HTMLElement[]) {
			if (!element_classlist_contains(el, SUBMENU_CLASSNAME)) continue
			close_popover(element_last_child(el) as HTMLDivElement)
		}
	}

	return (<Popover
		ref={mergeRefs(props.ref, r => menu_ref = r)}
		classList={{
			'c-menu': true,
			...props.classList
		}}
		on_before_close={() => {
			close_submenu_descendant()
			props.on_before_close?.()
		}}
		gap={props.gap ?? 8}
		padding={props.padding ?? 4}
		{...other}>
		<Show when={props.children_auto_tabindex} fallback={content()}>
			<FocusableGroup arrow_options={{
				up: 'prev',
				down: 'next'
			}}
			onKeyDown={ev => {
				const code = ev.code
				if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

				event_prevent_default(ev)
			}}>{content()}</FocusableGroup>
		</Show>
	</Popover>)
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
}
export type {
	MenuProps,
	MenuItemProps,
	SwitchMenuItemProps,
	SubMenuProps,
	SubMenuItemProps,
	MenuItemTrailingShortcutProps,
	LinkMenuItemProps,
	PopoverMenuProps,
}
export default Menu