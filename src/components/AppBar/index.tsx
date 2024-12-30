import { children, mergeProps, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { classlist } from "@/utils/attributes"

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	trailing_auto_tabindex?: boolean
	headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const $$props = mergeProps({
		trailing_auto_tabindex: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'leading', 'trailing', 'headline',
		'class', 'trailing_auto_tabindex'
	])
	const leading = children(() => props.leading)
	const headline = children(() => props.headline)
	const trailing = children(() => props.trailing)

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
					when={props.trailing_auto_tabindex}
					fallback={trailing()}>
					<FocusableGroup
						arrow_options={{
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