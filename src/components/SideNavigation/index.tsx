import { children, createContext, mergeProps, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { eventPreventDefault } from "@/utils/event"
import { KEY_ARROW_DOWN, KEY_ARROW_UP } from "@/constants/key_code"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'
import { AppColors } from "@/enums/colors"

type SideNavigationContextProps = {
	expanded: Accessor<boolean>
} | undefined

const SideNavigationContext = createContext<SideNavigationContextProps>()

type SideNavigationItemProps = ButtonProps & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:iconCode'?: number
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:indicatorPosition', 'c:selected', 'c:leading', 'children',
		'c:trailing', 'classList', 'c:iconCode', 'c:variant'
	])
	const trailing = children(() => props['c:trailing'])
	const context = useContext(SideNavigationContext)

	return (<Button
		c:variant={props["c:variant"] ?? (props["c:selected"]? ButtonVariant.tonal : undefined)}
		c:indicatorPosition={props["c:indicatorPosition"] ?? ButtonIndicatorPosition.left}
		c:selected={props["c:selected"]}
		classList={{
			'c-side-navigation-item': true,
			'c-square-btn': !(context?.expanded() ?? true),
			...props.classList
		}}
		{...other}>
		<Show when={props['c:iconCode'] != null}>
			<Icon
				style={{color: props["c:selected"]? `rgb(${AppColors.accent})` : undefined}}
				c:filled={props["c:selected"]}
				c:code={props['c:iconCode']!}
			/>
		</Show>
		{ props['c:leading'] }
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
	'c:header'?: JSX.Element
	'c:headerAutoTabIndex'?: boolean
	'c:footer'?: JSX.Element
	'c:footerAutoTabIndex'?: boolean
	'c:childrenAutoTabIndex'?: boolean
	'c:expanded'?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
	const $$props = mergeProps({
		'c:headerAutoTabIndex': true,
		'c:footerAutoTabIndex': true,
		'c:childrenAutoTabIndex': true,
		'c:expanded': true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:expanded', 'c:header', 'c:footer',
		'class', 'c:headerAutoTabIndex', 'c:footerAutoTabIndex',
		'c:childrenAutoTabIndex'
	])

	// hack to make Context works
	const Items: VoidComponent = () => {
		const header = children(() => props['c:header'])
		const footer = children(() => props['c:footer'])
		const content = children(() => props.children)
		return (<>
			<Show when={header()}>
				<div class="c-side-navigation-header">
					<Show when={props['c:headerAutoTabIndex']} fallback={header()}>
						<FocusableGroup c:arrowOptions={{
							up: 'prev',
							down: 'next'
						}}>{header()}</FocusableGroup>
					</Show>
				</div>
				<div style="flex:1" />
			</Show>
			<Show when={props['c:childrenAutoTabIndex']} fallback={content()}>
				<FocusableGroup c:arrowOptions={{
					up: 'prev',
					down: 'next'
				}}
				onKeyDown={ev => {
					const code = ev.code
					if (code != KEY_ARROW_UP && code != KEY_ARROW_DOWN) return

					eventPreventDefault(ev)
				}}>{content()}</FocusableGroup>
			</Show>
			<Show when={footer()}>
				<div style="flex:1" />
				<div class="c-side-navigation-footer">
					<Show when={props['c:footerAutoTabIndex']} fallback={footer()}>
						<FocusableGroup c:arrowOptions={{
							up: 'prev',
							down: 'next'
						}}>{footer()}</FocusableGroup>
					</Show>
				</div>
			</Show>
		</>)
	}

	return (<div
		class={attrClassList('c-side-navigation', props.class)}
		data-c-expanded={attrSetIfExist(props['c:expanded'])}
		{...other}>
		<SideNavigationContext.Provider
			value={{expanded: () => props['c:expanded'] ?? true}}>
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