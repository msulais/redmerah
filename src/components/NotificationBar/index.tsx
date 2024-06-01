import { type JSX, type ParentComponent, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { _leading, _trailing, _children, _header, _actions } from "@/data/string";

import List from "../List";
import './index.scss'

type NotificationBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
    header?: JSX.Element
    actions?: JSX.Element
    leading?: JSX.Element
    trailing?: JSX.Element
}

const NotificationBar: ParentComponent<NotificationBarProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _leading, _trailing, _children, 
        _header, _actions
    ])

    return (<Portal>
        <div 
            class="notification-bar" 
            popover="manual" 
            {...other}>
            <div>
                <List
                    leading={props[_leading]}
                    trailing={props[_trailing]}
                    subtitle={props[_children]}>
                    { props.header }
                </List>
                <div class="notification-bar-actions">
                    { props[_actions] }
                </div>
            </div>
        </div>
    </Portal>)
}

export default NotificationBar