import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId, onCleanup, onMount } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { getAttribute, toggleAttribute } from "@/utils/attributes"
import { _checked, _selected, _leading, _children, _trailing, _subtitle, _indent, _classList, _rightCenterToBottom, _disconnect, _dismiss, _id, _item, _level, _manual, _observe, _onCancel, _onClick, _onClose, _onToggle, _open, _ref, _wrapperAttr, _auto, _shortcuts, _currentTarget, _none, _left, _tonal, _dragable, _clientX, _clientY, _color, _hue, _initialColor, _isDrag, _mousemove, _mouseup, _noPointerEvent, _opacity, _touchend, _touches, _touchmove, _value, _valuechange, _top, _px, _anchorId, _body, _bottom, _clientWidth, _height, _innerHeight, _right, _width, _focus, _iconCode, _compact, _variant, _indicatorPosition, _onMouseEnter, _onMouseLeave, _class, _disableScale, _desktopCompact, _gap, _position, _padding, _allowHideAnchor, _onToggleOpen, _click, _contains, _target, _filled, _focused, _layerAttr, _outlined, _transparent, _switchAttr, _onValueChanged, _onChange, _div, _disabled } from "@/constants/string"
import { isVarHasValue } from "@/utils/data"
import { querySelectorAll } from "@/utils/element"
import { stopImmediatePropagation, stopPropagation } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { numberParse } from "@/utils/math"
import { getDocument } from "@/constants/window"
import { addEventListener, removeEventListener } from "@/utils/event"

import Divider, { type DividerProps } from "@/components/Divider"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import Popover, { type PopoverProps, closePopover, openPopover, repositionPopover, PopoverPosition as SubMenuPosition } from "@/components/Popover"
import Modal, { type ModalProps, closeModal, focusModal, openModal, repositionModal, ModalPosition as MenuPosition } from "@/components/Modal"
import { RawSwitch, type RawSwitchProps } from "@/components/Switch"
import './index.scss'

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
	shortcuts: string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
	const [props, other] = splitProps($props, [_shortcuts])
	return (<div class="menu-item-trailing-shortcut" {...other}>
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
		_indicatorPosition, _disableScale
	])
	const trailingComponent = children(() => props[_trailing])

	return (<Button
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])}
		selected={props[_selected]}
		indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
		disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)}
		data-trailing={toggleAttribute(trailingComponent())}
		classList={{'menu-item': true, ...props[_classList]}}
		{...other}>
		<Show when={isVarHasValue(props[_checked])}>
			<Icon
				style={{color: 'rgb(var(--color-accent))'}}
				filled={props[_checked]}
				code={props[_checked]? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}}
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
		_indicatorPosition, _disableScale,
	])
	const trailingComponent = children(() => props[_trailing])

	return (<LinkButton
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])}
		selected={props[_selected]}
		indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
		disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)}
		data-trailing={toggleAttribute(trailingComponent())}
		classList={{'menu-item': true, ...props[_classList]}}
		{...other}>
		<Show when={isVarHasValue(props[_checked])}>
			<Icon
				style={{color: props[_checked]? 'rgb(var(--color-accent))' : undefined}}
				filled={props[_checked]}
				code={props[_checked]? 0xE3CC : 0xE3D4}
			/>
		</Show>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}}
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
	</LinkButton>)
}

const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
	return (<div class="menu-indent" {...props}/>)
}

const MenuDivider: Component<DividerProps> = (props) => {
	return (<Divider {...props}/>)
}

const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
	return (<div class="menu-header" {...props}/>)
}

type SwitchMenuItemProps = JSX.LabelHTMLAttributes<HTMLLabelElement> & {
	variant?: ButtonVariant
	focused?: boolean
	disableScale?: boolean
	compact?: boolean
	layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
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
			_compact, _layerAttr, _disableScale,
			_classList, _class, _leading,
			_trailing, _iconCode, _switchAttr,
			_checked, _disabled
		]
	)
	const [switchProps, otherSwitchProps] = splitProps(
		mergeProps({component: _div}, props[_switchAttr]! ?? {}),
		[_checked, _disabled]
	)

	return (<label
		class={'btn menu-item switch-menu-item' + (props[_class] != null? ` ${props[_class]}` : '')}
		data-disabled={toggleAttribute(props[_disabled])}
		classList={{
			'filled-btn': props[_variant] == ButtonVariant[_filled],
			'tonal-btn': props[_variant] == ButtonVariant[_tonal],
			'outlined-btn': props[_variant] == ButtonVariant[_outlined],
			...props[_classList]
		}}
		data-focused={toggleAttribute(props[_focused])}
		data-noscale={toggleAttribute(props[_disableScale] ?? true)}
		data-compact={toggleAttribute(props[_compact])}
		data-trailing
		{...other}>
		<div
			class='btn-layer'
			data-no-outline
			{...props[_layerAttr]}>
			{ props[_leading] }
			<Show when={props[_iconCode] != null}>
				<Icon code={props[_iconCode]!}/>
			</Show>
			{ props[_children] }
			<div style={{flex: 1}} />
			{ props[_trailing] }
			<RawSwitch
				disabled={switchProps[_disabled] ?? props[_disabled]}
				checked={switchProps[_checked] ?? props[_checked]}
				{...otherSwitchProps}
			/>
		</div>
	</label>)
}

type SubMenuProps = Omit<PopoverProps, 'onClick'> & {
	level?: number
	item: JSX.Element
	gap?: number
	position?: SubMenuPosition
	padding?: number
	dragable?: boolean
	allowHideAnchor?: boolean
	onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
	wrapperAttr?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'ref' | 'onClick' | 'onMouseEnter' | 'onMouseLeave'> & {
		ref?: (el: HTMLDivElement) => unknown
		onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
		onMouseEnter?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
		onMouseLeave?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
	}
}
const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId(), level: 1}, $props)
	const [props, other] = splitProps($$props, [
		_classList, _level, _item, _wrapperAttr,
		_id, _onClick, _ref, _gap, _position,
		_padding, _dragable, _allowHideAnchor,
		_onToggleOpen
	])
	let timeoutId: number | null = null
	let div_ref: HTMLDivElement
	let popover_ref: HTMLDivElement
	let isOpen: boolean = false

	function cancelTimeout(): void {
		if (timeoutId == null) return;

		clearTimeDelayed(timeoutId)
		timeoutId = null
	}

	async function open(ev: Event): Promise<void> {
		if (isOpen) return;

		let isAnySubMenuOpen = false
		for (const submenu of querySelectorAll(`.sub-menu>.menu[data-level]:not([id="${props[_id]}"]):popover-open`)) {
			const level: number = numberParse(getAttribute(submenu, 'data-level')!, true)
			if (level < props[_level]) continue;

			isAnySubMenuOpen = true
			closePopover(submenu as HTMLDivElement)
		}

		// wait for close animation done
		if (isAnySubMenuOpen) await timeout(300)

		openPopover(ev, popover_ref, {
			anchor: div_ref,
			position: props[_position] ?? SubMenuPosition[_rightCenterToBottom],
			gap: props[_gap] ?? -8,
			padding: props[_padding] ?? 5,
			dragable: props[_dragable],
			allowHideAnchor: props[_allowHideAnchor],
			manualDismiss: true
		})
	}

	function onClick(ev: MouseEvent): void {
		if (!isOpen) return;

		const target = ev[_target] as HTMLElement
		const isClickedInside = div_ref[_contains](target) || div_ref[_contains](target)

		if (isClickedInside) return;

		closePopover(popover_ref)
	}

	function initEvents(): void {
		addEventListener<MouseEvent>(getDocument(), _click, onClick)

		onCleanup(() => {
			removeEventListener<MouseEvent>(getDocument(), _click, onClick)
		})
	}

	onMount(() => {
		initEvents()
	})

	return (<div
		class={"sub-menu" + (props[_wrapperAttr] && props[_wrapperAttr][_class] != undefined? ` ${props[_wrapperAttr][_class]}` : '')}
		ref={r => {
			div_ref = r
			if (props[_wrapperAttr] && props[_wrapperAttr][_ref]) props[_wrapperAttr][_ref](r)
		}}
		onClick={(ev) => {
			cancelTimeout()
			open(ev)
			if (props[_wrapperAttr] && props[_wrapperAttr][_onClick]) props[_wrapperAttr][_onClick](ev)
		}}
		onMouseEnter={(ev) => {
			cancelTimeout()
			timeoutId = setTimeDelayed(() => {
				open(ev)
				timeoutId = null
			}, 300)
			if (props[_wrapperAttr] && props[_wrapperAttr][_onMouseEnter]) props[_wrapperAttr][_onMouseEnter](ev)
		}}
		onMouseLeave={(ev) => {
			cancelTimeout()
			timeoutId = setTimeDelayed(() => {
				closePopover(popover_ref)
				timeoutId = null
			}, 500)
			if (props[_wrapperAttr] && props[_wrapperAttr][_onMouseLeave]) props[_wrapperAttr][_onMouseLeave](ev)
		}}
		{...props[_wrapperAttr]}>
		{props[_item]}
		<Popover
			data-level={props[_level]}
			usePortal={false}
			id={props[_id]}
			onToggleOpen={$isOpen => {
				isOpen = $isOpen
				if (props[_onToggleOpen]) props[_onToggleOpen]($isOpen)
			}}
			onClick={(ev) => {
				stopPropagation(ev)
				stopImmediatePropagation(ev)
				if (props[_onClick]) props[_onClick](ev)
			}}
			ref={r => {
				popover_ref = r
				if (props[_ref]) props[_ref](r)
			}}
			classList={{
				menu: true,
				...props[_classList]
			}}
			{...other}
		/>
	</div>)
}

type MenuProps = ModalProps
const Menu: ParentComponent<MenuProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _gap, _padding])
	return (<Modal
		classList={{
			menu: true,
			...props[_classList]
		}}
		gap={props[_gap] ?? 8}
		padding={props[_padding] ?? 4}
		{...other}
	/>)
}

type PopoverMenuProps = PopoverProps
const PopoverMenu: ParentComponent<PopoverMenuProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _gap, _padding])
	return (<Popover
		classList={{
			menu: true,
			...props[_classList]
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
	MenuPosition
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