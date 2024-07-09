import { type ParentComponent, type JSX, mergeProps, splitProps } from 'solid-js'

import { toggleAttribute } from '@/utils/attributes'
import { _children, _indicatorPosition, _variant, _focus, _compact, _selected, _elevation, _iconOnly, _layerAttr, _disableScale, _openInNewTab, _transparent, _bottom, _classList, _filledTonal, _outlined, _filled } from '@/data/string'
import { Position } from '@/enums/position'

import './index.scss'

export enum ButtonVariant {
    filled = 'filled', 
    outlined = 'outlined', 
    filledTonal = 'filled-tonal', 
    transparent = 'transparent'
}

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    selected?: boolean
    disableScale?: boolean
    indicatorPosition?: Position
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>  & {
    variant?: ButtonVariant
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    openInNewTab?: boolean
    selected?: boolean
    disableScale?: boolean
    indicatorPosition?: Position
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

const Button: ParentComponent<ButtonProps> = ($props) => {
    const $$props = mergeProps({variant: ButtonVariant[_transparent], indicatorPosition: Position[_bottom]}, $props)
    const [props, other] = splitProps($$props, [
        _children, _indicatorPosition, _variant, 
        _focus, _compact, _selected, _elevation, 
        _iconOnly, _layerAttr, _disableScale, 
        _classList
    ])

    return (<button 
        class='btn'
        classList={{
            'btn-transparent': props[_variant] == ButtonVariant[_transparent], 
            'btn-filled': props[_variant] == ButtonVariant[_filled], 
            'btn-filled-tonal': props[_variant] == ButtonVariant[_filledTonal], 
            'btn-outlined': props[_variant] == ButtonVariant[_outlined], 
            ...props[_classList]
        }}
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
    const $$props = mergeProps({variant: ButtonVariant[_transparent], indicatorPosition: Position[_bottom]}, $props)
    const [props, other] = splitProps($$props, [
        _openInNewTab, _children, _indicatorPosition, _variant, 
        _focus, _compact, _selected, _elevation, _iconOnly, 
        _layerAttr, _disableScale, _classList
    ])

    return (<a 
        class='btn'
        classList={{
            'btn-transparent': props[_variant] == ButtonVariant[_transparent], 
            'btn-filled': props[_variant] == ButtonVariant[_filled], 
            'btn-filled-tonal': props[_variant] == ButtonVariant[_filledTonal], 
            'btn-outlined': props[_variant] == ButtonVariant[_outlined], 
            ...props[_classList]
        }}
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