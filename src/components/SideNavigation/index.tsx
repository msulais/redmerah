import { children, createContext, mergeProps, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { event_prevent_default } from "@/utils/event"
import { ARROW_DOWN, ARROW_UP } from "@/constants/key_code"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type SideNavigationContextProps = {
	expanded: Accessor<boolean>
} | undefined

const SideNavigationContext = createContext<SideNavigationContextProps>()

type SideNavigationItemProps = ButtonProps & {
	leading?: JSX.Element
	trailing?: JSX.Element
	icon_code?: number
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'indicator_position', 'selected', 'leading', 'children',
		'trailing', 'classList', 'icon_code', 'variant'
	])
	const trailing = children(() => props.trailing)
	const context = useContext(SideNavigationContext)

	return (<Button
		variant={props.variant ?? (props.selected? ButtonVariant.tonal : undefined)}
		indicator_position={props.indicator_position ?? ButtonIndicatorPosition.left}
		selected={props.selected}
		classList={{
			'c-side-navigation-item': true,
			'c-square-btn': !(context?.expanded() ?? true),
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
	header?: JSX.Element
	header_auto_tabindex?: boolean
	footer?: JSX.Element
	footer_auto_tabindex?: boolean
	children_auto_tabindex?: boolean
	expanded?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const $$props = mergeProps({
		header_auto_tabindex: true,
		footer_auto_tabindex: true,
		children_auto_tabindex: true,
		expanded: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'expanded', 'header', 'footer',
		'class', 'header_auto_tabindex', 'footer_auto_tabindex',
		'children_auto_tabindex'
	])

	// hack to make Context works
	const Items: VoidComponent = () => {
		const header = children(() => props.header)
		const footer = children(() => props.footer)
		const content = children(() => props.children)
		return (<>
			<Show when={header()}>
				<div class="c-side-navigation-header">
					<Show when={props.header_auto_tabindex} fallback={header()}>
						<FocusableGroup arrow_options={{
							up: 'prev',
							down: 'next'
						}}>{header()}</FocusableGroup>
					</Show>
				</div>
				<div style="flex:1" />
			</Show>
			<Show when={props.children_auto_tabindex} fallback={content()}>
				<FocusableGroup arrow_options={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != ARROW_UP && code != ARROW_DOWN) return

					event_prevent_default(ev)
				}}>{content()}</FocusableGroup>
			</Show>
			<Show when={footer()}>
				<div style="flex:1" />
				<div class="c-side-navigation-footer">
					<Show when={props.footer_auto_tabindex} fallback={footer()}>
						<FocusableGroup arrow_options={{
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
		data-c-expanded={attr_set_if_exist(props.expanded)}
		{...other}>
		<SideNavigationContext.Provider
			value={{expanded: () => props.expanded ?? true}}>
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