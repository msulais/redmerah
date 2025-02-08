import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"
import { attrClassList } from "@/utils/attributes"

import '@/styles/variables.scss'
import '@/styles/animations.scss'
import '@/styles/index.scss'
import './index.scss'

type AppProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:appBar'?: JSX.Element
	'c:bottomBar'?: JSX.Element
	'c:leftSideBar'?: JSX.Element
	'c:rightSideBar'?: JSX.Element
	'c:floatingActionButton'?: JSX.Element
}

const App: ParentComponent<AppProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:appBar', 'c:leftSideBar', 'children', 'c:rightSideBar',
		'c:bottomBar', 'c:floatingActionButton', 'class'
	])
	const appBar = children(() => props['c:appBar'])
	const leftSideBar = children(() => props['c:leftSideBar'])
	const rightSideBar = children(() => props['c:rightSideBar'])
	const bottomBar = children(() => props['c:bottomBar'])
	const floatingActionButton = children(() => props['c:floatingActionButton'])

	return (<div class={attrClassList('c-app', props.class ?? '')} {...other}>
		<Show when={appBar()}>
			<div class="c-app-appbar">{appBar()}</div>
		</Show>
		<div class="c-app-container">
			<Show when={leftSideBar()}>
				<div class="c-app-left-sidebar">{leftSideBar()}</div>
			</Show>
			<div class="c-app-body">{props.children}</div>
			<Show when={rightSideBar()}>
				<div class="c-app-right-sidebar">{rightSideBar()}</div>
			</Show>
		</div>
		<Show when={bottomBar()}>
			<div class="c-app-bottombar">{bottomBar()}</div>
		</Show>
		<Show when={floatingActionButton()}>
			<div class="c-app-fab">{floatingActionButton()}</div>
		</Show>
	</div>)
}

export default App