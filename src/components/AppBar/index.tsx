import { children, mergeProps, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { classlist } from "@/utils/attributes"

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_trailing_auto_tabindex?: boolean
	c_headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const $$props = mergeProps({
		c_trailing_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c_leading', 'c_trailing', 'c_headline',
		'class', 'c_trailing_auto_tabindex'
	])
	const leading = children(() => props.c_leading)
	const headline = children(() => props.c_headline)
	const trailing = children(() => props.c_trailing)

	return (<div
		class={classlist('c-appbar', props.class ?? '')}
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
					when={props.c_trailing_auto_tabindex}
					fallback={trailing()}>
					<FocusableGroup
						c_arrow_options={{
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