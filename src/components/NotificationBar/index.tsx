import { type JSX, type ParentComponent, splitProps, children } from "solid-js";
import { Portal } from "solid-js/web";

import { _leading, _trailing, _children, _header, _actions, _manual } from "@/data/string";
import { toggleAttribute } from "@/utils/attributes";

import List from "@/components/List";
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
    const actionsComponent = children(() => props[_actions])

    return (<Portal>
        <div
            class="notification-bar"
            popover={_manual}
            data-actions={toggleAttribute(actionsComponent())}
            {...other}>
            <div>
                <List
                    leading={props[_leading]}
                    trailing={props[_trailing]}
                    subtitle={props[_children]}>
                    { props[_header] }
                </List>
                <div class="notification-bar-actions">
                    { actionsComponent() }
                </div>
            </div>
        </div>
    </Portal>)
}

export default NotificationBar