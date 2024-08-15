import { children, mergeProps, Show, splitProps, type JSX, type ParentComponent } from "solid-js";

import { _checked, _children, _classList, _expand, _filledTonal, _focus, _footer, _header, _iconCode, _iconOnly, _indent, _indicatorPosition, _leading, _left, _selected, _trailing } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes";
import { isVarHasValue } from "@/utils/data";
import { Position } from "@/enums/position"

import Button, { ButtonVariant } from "@/components/Button";
import './index.scss'
import Icon from "../Icon";

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
    header?: JSX.Element
    footer?: JSX.Element
    expand?: boolean
}

type SideNavigationItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    selected?: boolean
    iconOnly?: boolean
    iconCode?: number
    indicatorPosition?: Position
}

export const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
    const [props, other] = splitProps($props, [_indicatorPosition, _selected, _leading, _children, _trailing, _classList, _iconOnly, _iconCode])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_selected]? ButtonVariant[_filledTonal] : undefined} 
        selected={props[_selected]} 
        indicatorPosition={isVarHasValue(props[_selected])? (props[_indicatorPosition] ?? Position[_left]) : undefined} 
        disableScale={trailingComponent()? true : undefined} 
        iconOnly={props[_iconOnly]}
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'side-navigation-item': true, ...props[_classList]}} 
        {...other}>
        <Show when={props[_iconCode] != null}>
            <Icon
                style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}} 
                filled={props[_selected]} 
                code={props[_iconCode]!}
            />
        </Show>
        { props[_leading] }
        <Show when={!props[_iconOnly]}>
            { props[_children] }
            <Show when={trailingComponent()}>
                <div style={{flex: 1}} />
            </Show>
            { trailingComponent() }
        </Show>
    </Button>)
}

const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
    const [props, other] = splitProps($props, [_children, _expand, _header, _footer])

    return (<div class="side-navigation" data-expand={toggleAttribute(props[_expand])} {...other}>
        <div class="side-navigation-header">{props[_header]}</div>
        <div class="side-navigation-content">{props[_children]}</div>
        <div class="side-navigation-footer">{props[_footer]}</div>
    </div>)
}

export default SideNavigation