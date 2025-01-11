import { children, createContext, mergeProps, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { event_prevent_default } from "@/utils/event"
import { KEY_ARROW_DOWN, KEY_ARROW_UP } from "@/constants/key_code"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type SideNavigationContextProps = {
	expanded: Accessor<boolean>
} | undefined

const SideNavigationContext = createContext<SideNavigationContextProps>()

type SideNavigationItemProps = ButtonProps & {
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_icon_code?: number
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_indicator_position', 'c_selected', 'c_leading', 'children',
		'c_trailing', 'classList', 'c_icon_code', 'c_variant'
	])
	const trailing = children(() => props.c_trailing)
	const context = useContext(SideNavigationContext)

	return (<Button
		c_variant={props.c_variant ?? (props.c_selected? ButtonVariant.tonal : undefined)}
		c_indicator_position={props.c_indicator_position ?? ButtonIndicatorPosition.left}
		c_selected={props.c_selected}
		classList={{
			'c-side-navigation-item': true,
			'c-square-btn': !(context?.expanded() ?? true),
			...props.classList
		}}
		{...other}>
		<Show when={props.c_icon_code != null}>
			<Icon
				style={{color: props.c_selected? 'rgb(var(--g-color-accent))' : undefined}}
				c_filled={props.c_selected}
				c_code={props.c_icon_code!}
			/>
		</Show>
		{ props.c_leading }
		<Show when={context?.expanded() ?? true}>
			<span class="c-side-navigation-item-text">{ props.children }</span>
			<Show when={trailing()}>
				<div style={{flex: 1}} />
			</Show>
			{ trailing() }
		</Show>
	</Button>)
}

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_header?: JSX.Element
	c_header_auto_tabindex?: boolean
	c_footer?: JSX.Element
	c_footer_auto_tabindex?: boolean
	c_children_auto_tabindex?: boolean
	c_expanded?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const $$props = mergeProps({
		c_header_auto_tabindex: true,
		c_footer_auto_tabindex: true,
		c_children_auto_tabindex: true,
		c_expanded: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c_expanded', 'c_header', 'c_footer',
		'class', 'c_header_auto_tabindex', 'c_footer_auto_tabindex',
		'c_children_auto_tabindex'
	])

	// hack to make Context works
	const Items: VoidComponent = () => {
		const header = children(() => props.c_header)
		const footer = children(() => props.c_footer)
		const content = children(() => props.children)
		return (<>
			<Show when={header()}>
				<div class="c-side-navigation-header">
					<Show when={props.c_header_auto_tabindex} fallback={header()}>
						<FocusableGroup c_arrow_options={{
							up: 'prev',
							down: 'next'
						}}>{header()}</FocusableGroup>
					</Show>
				</div>
				<div style="flex:1" />
			</Show>
			<Show when={props.c_children_auto_tabindex} fallback={content()}>
				<FocusableGroup c_arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{content()}</FocusableGroup>
			</Show>
			<Show when={footer()}>
				<div style="flex:1" />
				<div class="c-side-navigation-footer">
					<Show when={props.c_footer_auto_tabindex} fallback={footer()}>
						<FocusableGroup c_arrow_options={{
							up: 'prev',
							down: 'next'
						}}>{footer()}</FocusableGroup>
					</Show>
				</div>
			</Show>
		</>)
	}

	return (<div
		class={classlist('c-side-navigation', props.class ?? '')}
		data-c-expanded={attr_set_if_exist(props.c_expanded)}
		{...other}>
		<SideNavigationContext.Provider
			value={{expanded: () => props.c_expanded ?? true}}>
			<Items />
		</SideNavigationContext.Provider>
	</div>)
}

export {
	SideNavigation,
	SideNavigationItem,
	SideNavigationContext
}
export type {
	SideNavigationProps,
	SideNavigationItemProps,
	SideNavigationContextProps
}
export default SideNavigation