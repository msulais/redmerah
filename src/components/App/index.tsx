import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"
import { classlist } from "@/utils/attributes"

import '@/styles/variables.scss'
import '@/styles/animations.scss'
import '@/styles/index.scss'
import './index.scss'

type AppProps = JSX.HTMLAttributes<HTMLDivElement> & {
	appbar?: JSX.Element
	bottombar?: JSX.Element
	left_sidebar?: JSX.Element
	right_sidebar?: JSX.Element
	floating_action_button?: JSX.Element
}

const App: ParentComponent<AppProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'appbar', 'left_sidebar', 'children', 'right_sidebar',
		'bottombar', 'floating_action_button', 'class'
	])
	const appbar = children(() => props.appbar)
	const left_sidebar = children(() => props.left_sidebar)
	const right_sidebar = children(() => props.right_sidebar)
	const bottombar = children(() => props.bottombar)
	const floating_action_button = children(() => props.floating_action_button)

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