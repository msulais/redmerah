import { type JSX, type ParentComponent } from "solid-js";

import { _appBar, _bottomBar, _children, _drawer, _floatingActionButton, _left, _right, _sideNavigation } from "@/data/string"

import '@/styles/fonts.scss'
import '@/styles/variables.scss'
import '@/styles/animations.scss'
import '@/styles/index.scss'
import './index.scss'

type AppProps = {
    appBar?: JSX.Element
    bottomBar?: JSX.Element
    sideNavigation?: JSX.Element
    drawer?: JSX.Element
    floatingActionButton?: JSX.Element
}

const App: ParentComponent<AppProps> = (props) => {
    return (<>
        <div class="app-appbar">{props[_appBar]}</div>
        <div class="app-container">
            <div class="app-side-navigation">{props[_sideNavigation]}</div>
            <div class="app-body">{props[_children]}</div>
        </div>
        <div class="app-bottombar">{props[_bottomBar]}</div>
        <div class="app-fab">{props[_floatingActionButton]}</div>
        { props[_drawer] }
    </>)
}

export default App