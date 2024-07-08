import type { Component, JSX } from "solid-js"

import './index.scss'

const Divider: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
    return (<div class="divider" {...props}/>)
}

export default Divider