import { children, mergeProps, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { attrClassList } from "@/utils/attributes"

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:trailingAutoTabIndex'?: boolean
	'c:headline'?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const $$props = mergeProps({
		'c:trailingAutoTabIndex': true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:leading', 'c:trailing', 'c:headline',
		'class', 'c:trailingAutoTabIndex'
	])
	const leading = children(() => props['c:leading'])
	const headline = children(() => props['c:headline'])
	const trailing = children(() => props['c:trailing'])

	return (<div
		class={attrClassList('c-appbar', props.class ?? '')}
		{...other}>
		<Show when={leading()}>
			<div class="c-appbar-leading">{leading()}</div>
		</Show>
		<div class="c-appbar-headline">
			<Show when={headline()}>
				<h2>{headline()}</h2>
			</Show>
			{props.children}
		</div>
		<Show when={trailing()}>
			<div class="c-appbar-trailing">
				<Show
					when={props['c:trailingAutoTabIndex']}
					fallback={trailing()}>
					<FocusableGroup
						c:arrowOptions={{
							left: 'prev',
							right: 'next'
						}}>
						{trailing()}
					</FocusableGroup>
				</Show>
			</div>
		</Show>
	</div>)
}

export default AppBar