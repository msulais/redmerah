import { type ParentComponent, type JSX, mergeProps, splitProps } from 'solid-js'

import { toggleAttribute } from '@/utils/attributes'
import { _children, _indicatorPosition, _variant, _focus, _compact, _selected, _elevation, _iconOnly, _layerAttr, _disableScale, _openInNewTab } from '@/data/string'

import './index.scss'

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'filled' | 'outlined' | 'filled-tonal' | 'transparent'
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    selected?: boolean
    disableScale?: boolean
    indicatorPosition?: 'top' | 'right' | 'bottom' | 'left'
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>  & {
    variant?: 'filled' | 'outlined' | 'filled-tonal' | 'transparent'
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    openInNewTab?: boolean
    selected?: boolean
    disableScale?: boolean
    indicatorPosition?: 'top' | 'right' | 'bottom' | 'left'
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

const Button: ParentComponent<ButtonProps> = ($props) => {
    const $$props = mergeProps({variant: 'transparent', indicatorPosition: 'bottom'}, $props)
    const [props, other] = splitProps($$props, [
        _children, _indicatorPosition, _variant, 
        _focus, _compact, _selected, _elevation, 
        _iconOnly, _layerAttr, _disableScale
    ])

    return (<button 
        class={`btn btn-${props[_variant]}`}
        data-icon={toggleAttribute(props[_iconOnly])}
        data-indicator={props[_selected]? props[_indicatorPosition] : undefined}
        data-selected={toggleAttribute(props[_selected])}
        data-elevation={toggleAttribute(props[_elevation], true)}
        data-focus={toggleAttribute(props[_focus])}
        data-noscale={toggleAttribute(props[_disableScale])}
        data-compact={toggleAttribute(props[_compact])}
        {...other}>
        <div class='btn-layer' {...props[_layerAttr]}>{props[_children]}</div>
    </button>)
}

export const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
    const $$props = mergeProps({variant: 'transparent', indicatorPosition: 'bottom'}, $props)
    const [props, other] = splitProps($$props, [
        _openInNewTab, _children, _indicatorPosition, _variant, 
        _focus, _compact, _selected, _elevation, _iconOnly, 
        _layerAttr, _disableScale
    ])

    return (<a 
        class={`btn btn-${props[_variant]}`}
        data-icon={toggleAttribute(props[_iconOnly])}
        data-indicator={props[_selected]? props[_indicatorPosition] : undefined}
        data-selected={toggleAttribute(props[_selected])}
        data-elevation={toggleAttribute(props[_elevation], true)}
        data-focus={toggleAttribute(props[_focus])}
        data-noscale={toggleAttribute(props[_disableScale])}
        data-compact={toggleAttribute(props[_compact])}
        target={props[_openInNewTab]? "_blank" : undefined} 
        rel={props[_openInNewTab]? "noopener noreferrer" : undefined}
        {...other}>
        <div class='btn-layer' {...props[_layerAttr]}>{props[_children]}</div>
    </a>)
}

export default Button