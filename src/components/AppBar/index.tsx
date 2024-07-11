import { Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _children, _leading, _trailing, _headline } from "@/data/string"

import './index.scss'


type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
    const [props, other] = splitProps($props, [_children, _leading, _trailing, _headline])
    return (<div class="appbar" {...other}>
        <div class="appbar-leading">{props[_leading]}</div>
        <div class="appbar-headline">
            <Show when={props[_headline]}>
                <h2>{props[_headline]}</h2>
            </Show>
            {props[_children]}
        </div>
        <div class="appbar-trailing">{props[_trailing]}</div>
    </div>)
}

export default AppBar