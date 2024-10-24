import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _checked, _children, _classList, _expand, _tonal, _focus, _footer, _header, _iconCode, _iconOnly, _indent, _indicatorPosition, _leading, _left, _selected, _trailing, _variant, _class } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import './index.scss'

type SideNavigationItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	iconCode?: number
	iconOnly?: boolean
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_indicatorPosition, _selected, _leading, _children,
		_trailing, _classList, _iconCode, _iconOnly,
		_variant
	])
	const trailingComponent = children(() => props[_trailing])

	return (<Button
		variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : undefined)}
		indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
		selected={props[_selected]}
		classList={{
			'c-side-navigation-item': true,
			'c-icon-btn': props[_iconOnly] ?? false,
			...props[_classList]
		}}
		{...other}>
		<Show when={props[_iconCode] != null}>
			<Icon
				style={{color: props[_selected]? 'rgb(var(--g-color-accent))' : undefined}}
				filled={props[_selected]}
				code={props[_iconCode]!}
			/>
		</Show>
		{ props[_leading] }
		<Show when={!props[_iconOnly]}>
			<span class="c-side-navigation-item-text">{ props[_children] }</span>
			<Show when={trailingComponent()}>
				<div style={{flex: 1}} />
			</Show>
			{ trailingComponent() }
		</Show>
	</Button>)
}

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
	header?: JSX.Element
	footer?: JSX.Element
	expand?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_children, _expand, _header, _footer,
		_class
	])
	const header = children(() => props[_header])
	const footer = children(() => props[_footer])

	return (<div
		class={`c-side-navigation${props[_class]? ` ${props[_class]}` : ''}`}
		data-c-expanded={toggleAttribute(props[_expand])}
		{...other}>
		<Show when={header()}>
			<div class="c-side-navigation-header">{header()}</div>
		</Show>
		<div class="c-side-navigation-content">{props[_children]}</div>
		<Show when={footer()}>
			<div class="c-side-navigation-footer">{footer()}</div>
		</Show>
	</div>)
}

export {
	SideNavigation,
	SideNavigationItem
}
export type {
	SideNavigationProps,
	SideNavigationItemProps
}
export default SideNavigation