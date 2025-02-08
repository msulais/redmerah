import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId, createMemo, createContext, useContext, type Accessor, createSignal, createEffect } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { objectHasValue } from "@/utils/object"
import { eventCall, eventPreventDefault, eventStopPropagation } from "@/utils/event"
import { timeTimerClear, timeTimerSet, timeWait } from "@/utils/time"
import { elementAllBySelector, elementById, elementBySelector, elementFirstChild, elementFocus, elementFocusAny, elementTagName } from "@/utils/element"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from "@/constants/key_code"
import { AppColors } from "@/enums/colors"
import { stringCSSEscape } from "@/utils/string"
import { documentActive } from "@/utils/document"
import { arrayIncludes } from "@/utils/array"
import { ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_CHEVRON_RIGHT } from "@/constants/icons"

import Divider, { type DividerProps } from "@/components/Divider"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import Popover, { closePopover, isPopoverOpen, openPopover, type PopoverProps, repositionPopover, PopoverPosition as SubMenuPosition } from "@/components/Popover"
import Modal, { type ModalProps, closeModal, focusModal, isModalOpen, ModalPosition as MenuPosition, openModal, repositionModal } from "@/components/Modal"
import { RawSwitch, type RawSwitchProps } from "@/components/Switch"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

const SUBMENU_CLASSNAME = 'c-submenu'

type MenuContextProps = {
	firstParentId: string
	parentId: string
	isPointerHoverParent: Accessor<boolean>
} | undefined

const MenuContext = createContext<MenuContextProps>()

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:shortcuts': string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
	const [props, other] = splitProps($props, ['c:shortcuts'])
	return (<div class="c-menu-item-trailing-shortcut" {...other}>
		<For each={props["c:shortcuts"]}>{s => <kbd>{s}</kbd>}</For>
	</div>)
}

type MenuItemProps = ButtonProps & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:checked'?: boolean
	'c:iconCode'?: number
}
const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:checked', 'c:leading', 'children', 'c:trailing',
		'classList', 'c:iconCode', 'c:variant',
		'c:indicatorPosition'
	])
	const trailing = children(() => props["c:trailing"])

	return (<Button
		c:variant={props["c:variant"] ?? (other["c:selected"]? ButtonVariant.tonal : props["c:variant"])}
		c:indicatorPosition={props['c:indicatorPosition'] ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={objectHasValue(props["c:checked"])}>
			<Icon
				style={{color: `rgb(${AppColors.accent})`}}
				c:filled={props["c:checked"]}
				c:code={props["c:checked"]? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}
			/>
		</Show>
		<Show when={props["c:iconCode"] != null}>
			<Icon
				style={{color: other["c:selected"]? `rgb(${AppColors.accent})` : undefined}}
				c:filled={other["c:selected"]}
				c:code={props["c:iconCode"]!}
			/>
		</Show>
		{ props["c:leading"] }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1"/>
		</Show>
		{ trailing() }
	</Button>)
}

type SubMenuItemProps = MenuItemProps
const SubMenuItem: ParentComponent<SubMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, ['c:trailing'])
	return (<MenuItem
		c:trailing={<>
			{props['c:trailing']}
			<Icon c:code={ICON_CHEVRON_RIGHT}/>
		</>}
		{...other}
	/>)
}

type LinkMenuItemProps = LinkButtonProps & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:checked'?: boolean
	'c:iconCode'?: number
}
const LinkMenuItem: ParentComponent<LinkMenuItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:checked', 'c:leading', 'children', 'c:trailing',
		'classList', 'c:iconCode', 'c:variant',
		'c:indicatorPosition'
	])
	const trailing = children(() => props["c:trailing"])

	return (<LinkButton
		c:variant={props["c:variant"] ?? (other["c:selected"]? ButtonVariant.tonal : props["c:variant"])}
		c:indicatorPosition={props['c:indicatorPosition'] ?? ButtonIndicatorPosition.left}
		classList={{'c-menu-item': true, ...props.classList}}
		{...other}>
		<Show when={objectHasValue(props["c:checked"])}>
			<Icon
				style={{color: props["c:checked"]? `rgb(${AppColors.accent})` : undefined}}
				c:filled={props["c:checked"]}
				c:code={props["c:checked"]? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED}
			/>
		</Show>
		<Show when={props["c:iconCode"] != null}>
			<Icon
				style={{color: other["c:selected"]? `rgb(${AppColors.accent})` : undefined}}
				c:filled={other["c:selected"]}
				c:code={props["c:iconCode"]!}
			/>
		</Show>
		{ props["c:leading"] }
		{ props.children }
		<Show when={trailing()}>
			<div style="flex:1"/>
		</Show>
		{ trailing() }
	</LinkButton>)
}

const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = ($props) => {
	const [props, other] = splitProps($props, ['class'])
	return (<div class={attrClassList("c-menu-indent", props.class)} {...other}/>)
}

const MenuDivider: Component<DividerProps> = (props) => {
	return (<Divider {...props}/>)
}

const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = ($props) => {
	const [props, other] = splitProps($props, ['class'])
	return (<div class={attrClassList("c-menu-header", props.class)} {...other}/>)
}

type SwitchMenuItemProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'> & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:iconCode'?: number
	'c:checked'?: boolean
	'c:disabled'?: boolean
	'c:attrSwitch'?: Omit<RawSwitchProps, 'children'>
}
const SwitchMenuItem: ParentComponent<SwitchMenuItemProps> = ($props) => {
	const $$props = mergeProps({
		'c:variant': ButtonVariant.transparent,
		'c:indicatorPosition': ButtonIndicatorPosition.left
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:variant', 'c:focused',
		'classList', 'class', 'c:leading',
		'c:trailing', 'c:iconCode', 'c:attrSwitch',
		'c:checked', 'c:disabled'
	])
	const [switchProps, otherSwitchProps] = splitProps(
		mergeProps({component: 'div', id: createUniqueId()}, props['c:attrSwitch']! ?? {}),
		['checked', 'disabled', 'id', 'c:attrWrapper']
	)
	const variant = createMemo(() => props['c:variant'])

	return (<label
		class={attrClassList('c-btn', 'c-menu-item', 'c-switch-menu-item', props.class)}
		data-c-disabled={attrSetIfExist(props['c:disabled'])}
		for={switchProps.id}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-focused={attrSetIfExist(props['c:focused'])}
		{...other}>
		{ props['c:leading'] }
		<Show when={props["c:iconCode"] != null}>
			<Icon c:code={props["c:iconCode"]!}/>
		</Show>
		{ props.children }
		<div style="flex:1" />
		{ props['c:trailing'] }
		<RawSwitch
			c:attrWrapper={mergeProps({'data-g-no-outline': ''}, switchProps['c:attrWrapper']) as any}
			disabled={switchProps.disabled ?? props['c:disabled']}
			checked={switchProps.checked ?? props['c:checked']}
			id={switchProps.id}
			{...otherSwitchProps}
		/>
	</label>)
}

type SubMenuProps = PopoverProps & {
	'c:item': JSX.Element
	'c:attrWrapper'?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	'c:childrenAutoTabIndex'?: boolean
}

const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
	const $$props = mergeProps({
		'c:childrenAutoTabIndex': true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c:item', 'c:attrWrapper',
		'ref', 'c:gap', 'c:position', 'c:usePortal',
		'c:padding', 'c:draggable', 'c:allowHideAnchor',
		'c:onToggleOpen', 'children', 'c:onClose',
		'c:childrenAutoTabIndex', 'onKeyDown',
		'onPointerEnter', 'onPointerLeave'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props["c:attrWrapper"] ?? {}, [
		'class', 'onClick','onPointerEnter', 'ref',
		'onPointerLeave', 'onKeyDown'
	])
	const [isHover, setIsHover] = createSignal<boolean>(false)
	const context = useContext(MenuContext)
	const parentId = context?.parentId ?? undefined
	const firstParentId = context?.firstParentId ?? undefined
	let tryOpen: boolean = false
	let timeId: number | null = null
	let divRef: HTMLDivElement
	let popoverRef: HTMLDivElement
	let isOpen: boolean = false
	let firstChild: HTMLElement | undefined

	function closeSubMenuDescendant(): void {
		for (const popover of elementAllBySelector(`[data-c-menu-parent="${other.id}"]:popover-open`)) {
			closePopover(popover as HTMLDivElement)
		}
	}

	function closeSubMenu(instant?: boolean, fromKey?: boolean): void {
		if (timeId !== null) timeTimerClear(timeId)

		timeId = timeTimerSet(() => {
			closePopover(popoverRef)
			closeSubMenuDescendant()
			if (fromKey) {
				if (firstChild) {
					elementFocus(firstChild)
					if (documentActive() !== firstChild) elementFocusAny(elementById(parentId ?? '')!)
				}
				else elementFocusAny(elementById(parentId ?? '')!)
			}

			timeId = null
		}, instant? 0 : 800)
	}

	function openSubMenu(ev: Event, instant?: boolean): void {
		if (isOpen) return

		tryOpen = true
		if (timeId !== null) timeTimerClear(timeId)
		timeId = timeTimerSet(async () => {
			firstChild = elementFirstChild(divRef)!
			if (!firstChild) return

			let removed = false
			const siblings = elementAllBySelector<HTMLDivElement>(`[data-c-menu-parent=${parentId}]:not(#${other.id}):popover-open`)
			for (const submenu of siblings) {
				removed = true
				closePopover(submenu)
			}

			if (removed) await timeWait(500) // wait for animation end
			openPopover(ev, popoverRef, {
				anchor: firstChild,
				position: props["c:position"] ?? SubMenuPosition.rightCenterToBottom,
				gap: props["c:gap"] ?? -8,
				padding: props["c:padding"] ?? 5,
				draggable: props["c:draggable"],
				allowHideAnchor: props["c:allowHideAnchor"],
				manualDismiss: true
			})
			timeId = null
			tryOpen = false
		}, instant? 0 : 200)
	}

	createEffect(() => {
		const isPointerHoverParent = context?.isPointerHoverParent?.() ?? false
		if (isPointerHoverParent && !isHover()) return closeSubMenu()
		if (tryOpen) return

		if (timeId !== null) timeTimerClear(timeId)
		timeId = null
	})

	return (<div
		class={attrClassList(SUBMENU_CLASSNAME, wrapperProps.class)}
		ref={mergeRefs(wrapperProps.ref, r => divRef = r)}
		onKeyDown={ev => {
			eventCall(ev, wrapperProps.onKeyDown)
			const code = ev.code
			if (code !== KEY_ARROW_RIGHT) return

			const active = documentActive()
			if (active && arrayIncludes(['INPUT', 'TEXTAREA'], elementTagName(active))) return

			openSubMenu(ev, true)
		}}
		onPointerEnter={ev => {
			eventCall(ev, wrapperProps.onPointerEnter)
			openSubMenu(ev)
			setIsHover(true)
		}}
		onPointerLeave={ev => {
			eventCall(ev, wrapperProps.onPointerLeave)
			setIsHover(false)
		}}
		onClick={ev => {
			eventCall(ev, wrapperProps.onClick)
			openSubMenu(ev, true)
		}}
		{...otherWrapperProps}>
		{props['c:item']}
		<MenuContext.Provider value={{
			firstParentId: firstParentId ?? '',
			parentId: other.id,
			isPointerHoverParent: () => isHover()
		}}>
			<Popover
				data-c-menu-parent={parentId}
				c:portalMount={elementBySelector(`#${stringCSSEscape(firstParentId ?? '')} :is(.c-modal-portal-placeholder,.c-popover-portal-placeholder)`)!}
				c:onToggleOpen={$isOpen => {
					isOpen = $isOpen
					props["c:onToggleOpen"]?.($isOpen)
				}}
				onKeyDown={ev => {
					eventCall(ev, props.onKeyDown)
					const code = ev.code
					if (code !== KEY_ARROW_LEFT) return

					const active = documentActive()
					if (active && arrayIncludes(['INPUT', 'TEXTAREA'], elementTagName(active))) return

					closeSubMenu(true, true)
					eventStopPropagation(ev)
				}}
				onPointerEnter={ev => {
					eventCall(ev, props.onPointerEnter)
					setIsHover(true)
				}}
				onPointerLeave={ev => {
					eventCall(ev, props.onPointerLeave)
					setIsHover(false)
				}}
				c:onClose={() => {
					closeSubMenuDescendant()
					props["c:onClose"]?.()
				}}
				ref={mergeRefs(props.ref, r => popoverRef = r)}
				classList={{
					'c-menu': true,
					...props.classList
				}}
				{...other}>
				<Show when={props['c:childrenAutoTabIndex']} fallback={props.children}>
					<FocusableGroup c:arrowOptions={{
						up: 'prev',
						down: 'next'
					}}
					onKeyDown={ev => {
						const code = ev.code
						if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

						eventPreventDefault(ev)
					}}>{props.children}</FocusableGroup>
				</Show>
			</Popover>
		</MenuContext.Provider>
	</div>)
}

type MenuProps = ModalProps & {
	'c:childrenAutoTabIndex'?: boolean
}
const Menu: ParentComponent<MenuProps> = ($props) => {
	const $$props = mergeProps({
		'c:childrenAutoTabIndex': true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c:gap', 'c:padding', 'c:contentAutoFocus',
		'c:onClose', 'children', 'c:childrenAutoTabIndex',
		'c:attrContentWrappwer'
	])
	const [contentWrapperProps, otherContentWrapperProps] = splitProps(
		props["c:attrContentWrappwer"] ?? {},
		['onPointerEnter', 'onPointerLeave']
	)
	const [isHover, setIsHover] = createSignal<boolean>(false)

	function closeSubMenuDescendant(): void {
		for (const popover of elementAllBySelector(`[data-c-menu-parent="${other.id}"]:popover-open`)) {
			closePopover(popover as HTMLDivElement)
		}
	}

	return (<MenuContext.Provider value={{
			firstParentId: other.id,
			parentId: other.id,
			isPointerHoverParent: () => isHover()
		}}>
		<Modal
			classList={{
				'c-menu': true,
				...props.classList
			}}
			c:onClose={() => {
				closeSubMenuDescendant()
				props["c:onClose"]?.()
			}}

			// exclusive to <Modal> since it use <dialog> and hides everything if not inside
			c:attrContentWrappwer={{
				...otherContentWrapperProps,
				onPointerEnter: ev => {
					eventCall(ev, contentWrapperProps.onPointerEnter)
					setIsHover(true)
				},
				onPointerLeave: ev => {
					eventCall(ev, contentWrapperProps.onPointerLeave)
					setIsHover(false)
				}
			}}
			c:contentAutoFocus={props["c:contentAutoFocus"] ?? true}
			c:gap={props["c:gap"] ?? 8}
			c:padding={props["c:padding"] ?? 4}
			{...other}>
			<Show when={props['c:childrenAutoTabIndex']} fallback={props.children}>
				<FocusableGroup c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					eventPreventDefault(ev)
				}}>{props.children}</FocusableGroup>
			</Show>
		</Modal>
	</MenuContext.Provider>)
}

type PopoverMenuProps = PopoverProps & {
	'c:childrenAutoTabIndex'?: boolean
}
const PopoverMenu: ParentComponent<PopoverMenuProps> = ($props) => {
	const $$props = mergeProps({
		'c:childrenAutoTabIndex': true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'classList', 'c:gap', 'c:padding', 'children',
		'c:onClose', 'c:childrenAutoTabIndex',
		'onPointerEnter', 'onPointerLeave'
	])
	const [isHover, setIsHover] = createSignal<boolean>(false)

	function closeSubMenuDescendant(): void {
		for (const popover of elementAllBySelector(`[data-c-menu-parent="${other.id}"]:popover-open`)) {
			closePopover(popover as HTMLDivElement)
		}
	}

	return (<MenuContext.Provider value={{
			firstParentId: other.id,
			parentId: other.id,
			isPointerHoverParent: () => isHover()
		}}>
		<Popover
			classList={{
				'c-menu': true,
				...props.classList
			}}
			c:onClose={() => {
				closeSubMenuDescendant()
				props["c:onClose"]?.()
			}}
			onPointerEnter={ev => {
				eventCall(ev, props.onPointerEnter)
				setIsHover(true)
			}}
			onPointerLeave={ev => {
				eventCall(ev, props.onPointerLeave)
				setIsHover(false)
			}}
			c:gap={props["c:gap"] ?? 8}
			c:padding={props["c:padding"] ?? 4}
			{...other}>
			<Show when={props['c:childrenAutoTabIndex']} fallback={props.children}>
				<FocusableGroup c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					eventPreventDefault(ev)
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
	isPopoverOpen as isSubMenuOpen,
	closePopover as closeSubMenu,
	openPopover as openSubMenu,
	repositionPopover as repositionSubMenu,
	isPopoverOpen as isPopoverMenuOpen,
	closePopover as closePopoverMenu,
	openPopover as openPopoverMenu,
	repositionPopover as repositionPopoverMenu,
	focusModal as focusMenu,
	openModal as openMenu,
	closeModal as closeMenu,
	repositionModal as repositionMenu,
	isModalOpen as isMenuOpen,
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