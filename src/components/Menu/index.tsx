import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId, onCleanup, onMount, createContext, useContext } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { getElementAttribute, setElementAttributeIfExist } from "@/utils/attributes"
import { _checked, _selected, _leading, _children, _firstChild, _trailing, _subtitle, _indent, _classList, _rightCenterToBottom, _disconnect, _dismiss, _id, _item, _level, _manual, _observe, _onCancel, _onClick, _onClose, _onToggle, _open, _ref, _wrapperAttr, _auto, _shortcuts, _currentTarget, _none, _left, _tonal, _draggable, _clientX, _clientY, _color, _hue, _initialColor, _isDrag, _mousemove, _mouseup, _noPointerEvent, _opacity, _touchend, _touches, _touchmove, _value, _valuechange, _top, _px, _anchorId, _body, _bottom, _clientWidth, _height, _innerHeight, _right, _width, _focus, _iconCode, _compact, _variant, _indicatorPosition, _onMouseEnter, _onMouseLeave, _class, _desktopCompact, _gap, _position, _padding, _allowHideAnchor, _onToggleOpen, _click, _contains, _target, _filled, _focused, _layerAttr, _outlined, _transparent, _switchAttr, _onValueChanged, _onChange, _div, _disabled, _forEach, _onPointerEnter, _onPointerLeave, _accent, _autofocus, _contentAutoFocus, _onPointerOver, _dispatchEvent, _onBeforeClose, _dataset, _CLevel, _usePortal, _parentElement, _lastChild, _isSameNode, _firstElementChild, _lastElementChild } from "@/constants/string"
import { isVarHasValue } from "@/utils/data"
import { getAllElementBySelector } from "@/utils/element"
import { callEventHandler, eventPreventDefault, eventStopImmediatePropagation, eventStopPropagation } from "@/utils/event"
import { endTimeout, startTimeout, wait } from "@/utils/timeout"
import { numberParse } from "@/utils/math"
import { getDocument } from "@/constants/window"
import { addEventListener, removeEventListener } from "@/utils/event"
import { AppColors } from "@/enums/colors"

import Divider, { type DividerProps } from "@/components/Divider"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import Popover, { type PopoverProps, closePopover, isPopoverOpen, openPopover, repositionPopover, PopoverPosition as SubMenuPosition } from "@/components/Popover"
import Modal, { type ModalProps, closeModal, focusModal, openModal, repositionModal, ModalPosition as MenuPosition } from "@/components/Modal"
import { RawSwitch, type RawSwitchProps } from "@/components/Switch"
import './index.scss'

const subMenuClassName = 'c-sub-menu'

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
	shortcuts: string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
	const [props, other] = splitProps($props, [_shortcuts])
	return (<div class="c-menu-item-trailing-shortcut" {...other}>
		<For each={props[_shortcuts]}>{s => <kbd>{s}</kbd>}</For>
	</div>)
}

type MenuItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	checked?: boolean
	iconCode?: number
}
const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_checked, _selected, _leading, _children,
		_trailing, _classList, _iconCode, _variant,
		_indicatorPosition
	])
	const trailingComponent = children(() => props[_trailing])

	return (<Button
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])}
		selected={props[_selected]}
		indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
		classList={{'c-menu-item': true, ...props[_classList]}}
		{...other}>
		<Show when={isVarHasValue(props[_checked])}>
			<Icon
				style={{color: `rgb(${AppColors[_accent]})`}}
				filled={props[_checked]}
				code={props[_checked]? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? `rgb(${AppColors[_accent]})` : undefined}}
				filled={props[_selected]}
				code={props[_iconCode]!}
			/>
		</Show>
		{ props[_leading] }
		{ props[_children] }
		<Show when={trailingComponent()}>
			<div style={{flex: 1}} />
		</Show>
		{ trailingComponent() }
	</Button>)
}

type SubMenuItemProps = MenuItemProps
const SubMenuItem: ParentComponent<SubMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [_trailing])
	return (<MenuItem
		trailing={<>
			{props[_trailing]}
			<Icon code={0xE402}/>
		</>}
		{...other}
	/>)
}

type LinkMenuItemProps = LinkButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	checked?: boolean
	iconCode?: number
}
const LinkMenuItem: ParentComponent<LinkMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_checked, _selected, _leading, _children,
		_trailing, _classList, _iconCode, _variant,
		_indicatorPosition,
	])
	const trailing = children(() => props[_trailing])

	return (<LinkButton
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])}
		selected={props[_selected]}
		indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
		classList={{'c-menu-item': true, ...props[_classList]}}
		{...other}>
		<Show when={isVarHasValue(props[_checked])}>
			<Icon
				style={{color: props[_checked]? `rgb(${AppColors[_accent]})` : undefined}}
				filled={props[_checked]}
				code={props[_checked]? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? `rgb(${AppColors[_accent]})` : undefined}}
				filled={props[_selected]}
				code={props[_iconCode]!}
			/>
		</Show>
		{ props[_leading] }
		{ props[_children] }
		<Show when={trailing()}>
			<div style={{flex: 1}} />
		</Show>
		{ trailing() }
	</LinkButton>)
}

const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
	return (<div class="c-menu-indent" {...props}/>)
}

const MenuDivider: Component<DividerProps> = (props) => {
	return (<Divider {...props}/>)
}

const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
	return (<div class="c-menu-header" {...props}/>)
}

type SwitchMenuItemProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'> & {
	variant?: ButtonVariant
	focused?: boolean
	compact?: boolean
	leading?: JSX.Element
	trailing?: JSX.Element
	iconCode?: number
	checked?: boolean
	disabled?: boolean
	switchAttr?: Omit<RawSwitchProps, 'children'>
}
const SwitchMenuItem: ParentComponent<SwitchMenuItemProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({
			variant: ButtonVariant[_transparent],
			indicatorPosition: ButtonIndicatorPosition[_left]
		}, $props),
		[
			_children, _variant, _focused,
			_compact,
			_classList, _class, _leading,
			_trailing, _iconCode, _switchAttr,
			_checked, _disabled
		]
	)
	const [switchProps, otherSwitchProps] = splitProps(
		mergeProps({component: _div, id: createUniqueId()}, props[_switchAttr]! ?? {}),
		[_checked, _disabled, _id, _wrapperAttr]
	)

	return (<label
		class={'c-btn c-menu-item c-switch-menu-item' + (props[_class] != null? ` ${props[_class]}` : '')}
		data-c-disabled={setElementAttributeIfExist(props[_disabled])}
		for={switchProps[_id]}
		classList={{
			'c-filled-btn': props[_variant] == ButtonVariant[_filled],
			'c-tonal-btn': props[_variant] == ButtonVariant[_tonal],
			'c-outlined-btn': props[_variant] == ButtonVariant[_outlined],
			...props[_classList]
		}}
		data-c-focused={setElementAttributeIfExist(props[_focused])}
		data-c-compact={setElementAttributeIfExist(props[_compact])}
		{...other}>
		{ props[_leading] }
		<Show when={props[_iconCode] != null}>
			<Icon code={props[_iconCode]!}/>
		</Show>
		{ props[_children] }
		<div style={{flex: 1}} />
		{ props[_trailing] }
		<RawSwitch
			wrapperAttr={mergeProps({'data-g-no-outline': ''}, props[_switchAttr]) as any}
			disabled={switchProps[_disabled] ?? props[_disabled]}
			checked={switchProps[_checked] ?? props[_checked]}
			id={switchProps[_id]}
			{...otherSwitchProps}
		/>
	</label>)
}

type SubMenuProps = PopoverProps & {
	item: JSX.Element
	gap?: number
	position?: SubMenuPosition
	padding?: number
	draggable?: boolean
	allowHideAnchor?: boolean
	wrapperAttr?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
}
const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_classList, _item, _wrapperAttr,
		_id, _onClick, _ref, _gap, _position,
		_padding, _draggable, _allowHideAnchor,
		_onToggleOpen, _children, _onBeforeClose,
		_usePortal
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(props[_wrapperAttr] ?? {}, [
		_class, _onClick, _onPointerEnter,
		_onPointerLeave, _ref
	])
	let timeoutId: number | null = null
	let div_ref: HTMLDivElement
	let popover_ref: HTMLDivElement
	let isOpen: boolean = false

	function closeDescendantSubMenu(): void {
		for (const element of popover_ref[_firstElementChild]![_children] as unknown as HTMLElement[]) {
			if (!element[_classList][_contains](subMenuClassName)) continue
			closePopover(element[_lastElementChild] as HTMLDivElement)
		}
	}

	function cancelTimeout(): void {
		if (timeoutId == null) return;

		endTimeout(timeoutId)
		timeoutId = null
	}

	async function open(ev: Event): Promise<void> {
		if (isOpen) return;

		let isAnySubMenuOpen = false;

		for (const element of div_ref[_parentElement]?.[_children] as unknown as HTMLElement[]) {
			if (!element[_classList][_contains](subMenuClassName) || element[_isSameNode](div_ref)) continue

			const popover = element[_lastElementChild] as HTMLDivElement
			const isOpen = isPopoverOpen(popover)
			if (!isAnySubMenuOpen && isOpen) isAnySubMenuOpen = true
			if (isOpen) closePopover(popover)
		}

		// wait for close animation done
		if (isAnySubMenuOpen) await wait(500)

		openPopover(ev, popover_ref, {
			anchor: div_ref,
			position: props[_position] ?? SubMenuPosition[_rightCenterToBottom],
			gap: props[_gap] ?? -8,
			padding: props[_padding] ?? 5,
			draggable: props[_draggable],
			allowHideAnchor: props[_allowHideAnchor],
			manualDismiss: true
		})
	}

	return (<div
		class={subMenuClassName + (wrapperProps[_class]? ` ${wrapperProps[_class]}` : '')}
		ref={mergeRefs(wrapperProps[_ref], r => div_ref = r)}
		onClick={(ev) => {
			cancelTimeout()
			open(ev)
			callEventHandler(ev, wrapperProps[_onClick])
		}}
		onPointerEnter={(ev) => {
			cancelTimeout()
			timeoutId = startTimeout(() => {
				open(ev)
				timeoutId = null
			}, 300)
			callEventHandler(ev, wrapperProps[_onPointerEnter])
		}}
		onPointerLeave={(ev) => {
			cancelTimeout()
			timeoutId = startTimeout(() => {
				closePopover(popover_ref)
				timeoutId = null
			}, 500)
			callEventHandler(ev, wrapperProps[_onPointerLeave])
		}}
		{...wrapperPropsOther}>
		{props[_item]}
		<Popover
			usePortal={false}
			onToggleOpen={$isOpen => {
				isOpen = $isOpen
				props[_onToggleOpen]?.($isOpen)
			}}
			onClick={(ev) => {
				eventStopPropagation(ev)
				eventStopImmediatePropagation(ev)
				callEventHandler(ev, props[_onClick])
			}}
			onBeforeClose={() => {
				closeDescendantSubMenu()
				props[_onBeforeClose]?.()
			}}
			ref={mergeRefs(props[_ref], r => popover_ref = r)}
			classList={{
				'c-menu': true,
				...props[_classList]
			}}
			{...other}>
			{ props[_children] }
		</Popover>
	</div>)
}

type MenuProps = ModalProps
const Menu: ParentComponent<MenuProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_classList, _gap, _padding, _contentAutoFocus,
		_onBeforeClose, _ref
	])
	let menu_ref: HTMLDialogElement

	function closeDescendantSubMenu(): void {
		for (const element of menu_ref[_firstElementChild]![_children] as unknown as HTMLElement[]) {
			if (!element[_classList][_contains](subMenuClassName)) continue
			closePopover(element[_lastElementChild] as HTMLDivElement)
		}
	}

	return (<Modal
		ref={mergeRefs(props[_ref], r => menu_ref = r)}
		classList={{
			'c-menu': true,
			...props[_classList]
		}}
		onBeforeClose={() => {
			closeDescendantSubMenu()
			props[_onBeforeClose]?.()
		}}
		contentAutoFocus={props[_contentAutoFocus] ?? true}
		gap={props[_gap] ?? 8}
		padding={props[_padding] ?? 4}
		{...other}
	/>)
}

type PopoverMenuProps = PopoverProps
const PopoverMenu: ParentComponent<PopoverMenuProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_classList, _gap, _padding,
		_onBeforeClose, _ref
	])
	let menu_ref: HTMLDivElement

	function closeDescendantSubMenu(): void {
		for (const element of menu_ref[_firstElementChild]![_children] as unknown as HTMLElement[]) {
			if (!element[_classList][_contains](subMenuClassName)) continue
			closePopover(element[_lastElementChild] as HTMLDivElement)
		}
	}

	return (<Popover
		ref={mergeRefs(props[_ref], r => menu_ref = r)}
		classList={{
			'c-menu': true,
			...props[_classList]
		}}
		onBeforeClose={() => {
			closeDescendantSubMenu()
			props[_onBeforeClose]?.()
		}}
		gap={props[_gap] ?? 8}
		padding={props[_padding] ?? 4}
		{...other}
	/>)
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
	closePopover as closeSubMenu,
	openPopover as openSubMenu,
	repositionPopover as repositionSubMenu,
	closePopover as closePopoverMenu,
	openPopover as openPopoverMenu,
	repositionPopover as repositionPopoverMenu,
	focusModal as focusMenu,
	openModal as openMenu,
	closeModal as closeMenu,
	repositionModal as repositionMenu,
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