import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _children, _leading, _trailing, _headline, _class } from "@/constants/string"

import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_children, _leading, _trailing, _headline, _class
	])
	const leading = children(() => props[_leading])
	const headline = children(() => props[_headline])
	const trailing = children(() => props[_trailing])

	return (<div
		class={`c-appbar${props[_class]? ` ${props[_class]}` : ''}`}
		{...other}>
		<Show when={leading()}>
			<div class="c-appbar-leading">{leading()}</div>
		</Show>
		<div class="c-appbar-headline">
			<Show when={headline()}>
				<h2>{headline()}</h2>
			</Show>
			{props[_children]}
		</div>
		<Show when={trailing()}>
			<div class="c-appbar-trailing">{trailing()}</div>
		</Show>
	</div>)
}

export default AppBar