import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"
import { classlist } from "@/utils/attributes"

import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'children', 'leading', 'trailing', 'headline',
		'class'
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
			<div class="c-appbar-trailing">{trailing()}</div>
		</Show>
	</div>)
}

export default AppBar