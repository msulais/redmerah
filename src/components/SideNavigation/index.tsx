import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { attr_set_if_exist, classlist } from "@/utils/attributes"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import './index.scss'

type SideNavigationItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	icon_code?: number
	icon_only?: boolean
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'indicator_position', 'selected', 'leading', 'children',
		'trailing', 'classList', 'icon_code', 'icon_only',
		'variant'
	])
	const trailing = children(() => props.trailing)

	return (<Button
		variant={props.variant ?? (props.selected? ButtonVariant.tonal : undefined)}
		indicator_position={props.indicator_position ?? ButtonIndicatorPosition.left}
		selected={props.selected}
		classList={{
			'c-side-navigation-item': true,
			'c-icon-btn': props.icon_only ?? false,
			...props.classList
		}}
		{...other}>
		<Show when={props.icon_code != null}>
			<Icon
				style={{color: props.selected? 'rgb(var(--g-color-accent))' : undefined}}
				filled={props.selected}
				code={props.icon_code!}
			/>
		</Show>
		{ props.leading }
		<Show when={!props.icon_only}>
			<span class="c-side-navigation-item-text">{ props.children }</span>
			<Show when={trailing()}>
				<div style={{flex: 1}} />
			</Show>
			{ trailing() }
		</Show>
	</Button>)
}

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
	header?: JSX.Element
	footer?: JSX.Element
	expanded?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'children', 'expanded', 'header', 'footer',
		'class'
	])
	const header = children(() => props.header)
	const footer = children(() => props.footer)

	return (<div
		class={classlist('c-side-navigation', props.class ?? '')}
		data-c-expanded={attr_set_if_exist(props.expanded)}
		{...other}>
		<Show when={header()}>
			<div class="c-side-navigation-header">{header()}</div>
		</Show>
		<div class="c-side-navigation-content">{props.children}</div>
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