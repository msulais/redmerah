import { splitProps, type JSX, type ParentComponent } from "solid-js"

import { _appBar, _bottomBar, _children, _class, _floatingActionButton, _leftSideBar, _rightSideBar } from "@/data/string"

import '@/styles/fonts.scss'
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
    return (<div class={"app" + (props[_class] != undefined? ` ${props[_class]}` : '')} {...other}>
        <div class="app-appbar">{props[_appBar]}</div>
        <div class="app-container">
            <div class="app-left-sidebar">{props[_leftSideBar]}</div>
            <div class="app-body">{props[_children]}</div>
            <div class="app-right-sidebar">{props[_rightSideBar]}</div>
        </div>
        <div class="app-bottombar">{props[_bottomBar]}</div>
        <div class="app-fab">{props[_floatingActionButton]}</div>
    </div>)
}

export default App