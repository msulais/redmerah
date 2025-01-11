import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"
import { classlist } from "@/utils/attributes"

import '@/styles/variables.scss'
import '@/styles/animations.scss'
import '@/styles/index.scss'
import './index.scss'

type AppProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_appbar?: JSX.Element
	c_bottombar?: JSX.Element
	c_left_sidebar?: JSX.Element
	c_right_sidebar?: JSX.Element
	c_floating_action_button?: JSX.Element
}

const App: ParentComponent<AppProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_appbar', 'c_left_sidebar', 'children', 'c_right_sidebar',
		'c_bottombar', 'c_floating_action_button', 'class'
	])
	const appbar = children(() => props.c_appbar)
	const left_sidebar = children(() => props.c_left_sidebar)
	const right_sidebar = children(() => props.c_right_sidebar)
	const bottombar = children(() => props.c_bottombar)
	const floating_action_button = children(() => props.c_floating_action_button)

	return (<div class={classlist('c-app', props.class ?? '')} {...other}>
		<Show when={appbar()}>
			<div class="c-app-appbar">{appbar()}</div>
		</Show>
		<div class="c-app-container">
			<Show when={left_sidebar()}>
				<div class="c-app-left-sidebar">{left_sidebar()}</div>
			</Show>
			<div class="c-app-body">{props.children}</div>
			<Show when={right_sidebar()}>
				<div class="c-app-right-sidebar">{right_sidebar()}</div>
			</Show>
		</div>
		<Show when={bottombar()}>
			<div class="c-app-bottombar">{bottombar()}</div>
		</Show>
		<Show when={floating_action_button()}>
			<div class="c-app-fab">{floating_action_button()}</div>
		</Show>
	</div>)
}

export default App