import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _appBar, _bottomBar, _children, _class, _floatingActionButton, _leftSideBar, _rightSideBar } from "@/constants/string"

import '@/styles/variables.scss'
import '@/styles/animations.scss'
import '@/styles/index.scss'
import './index.scss'

type AppProps = JSX.HTMLAttributes<HTMLDivElement> & {
	appBar?: JSX.Element
	bottomBar?: JSX.Element
	leftSideBar?: JSX.Element
	rightSideBar?: JSX.Element
	floatingActionButton?: JSX.Element
}

const App: ParentComponent<AppProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_appBar, _leftSideBar, _children, _rightSideBar,
		_bottomBar, _floatingActionButton, _class
	])
	const appBar = children(() => props[_appBar])
	const leftSideBar = children(() => props[_leftSideBar])
	const rightSideBar = children(() => props[_rightSideBar])
	const bottomBar = children(() => props[_bottomBar])
	const floatingActionButton = children(() => props[_floatingActionButton])
	return (<div class={`c-app${props[_class]? ` ${props[_class]}` : ''}`} {...other}>
		<Show when={appBar()}>
			<div class="c-app-appbar">{appBar()}</div>
		</Show>
		<div class="c-app-container">
			<Show when={leftSideBar()}>
				<div class="c-app-left-sidebar">{leftSideBar()}</div>
			</Show>
			<div class="c-app-body">{props[_children]}</div>
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