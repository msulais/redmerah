import { Show, splitProps, type JSX, type ParentComponent } from "solid-js"

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
	return (<div class={`c-appbar${props[_class]? ` ${props[_class]}` : ''}`} {...other}>
		<div class="c-appbar-leading">{props[_leading]}</div>
		<div class="c-appbar-headline">
			<Show when={props[_headline]}>
				<h2>{props[_headline]}</h2>
			</Show>
			{props[_children]}
		</div>
		<div class="c-appbar-trailing">{props[_trailing]}</div>
	</div>)
}

export default AppBar