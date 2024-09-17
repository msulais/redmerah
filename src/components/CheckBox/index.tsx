import { createEffect, createSignal, mergeProps, splitProps, type JSX, type ParentComponent } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { _check, _compact, _disabled, _children, _value, _onValueChanged, _variant, _class, _onClick, _desktopCompact, _focused, _disableScale } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { isVarHasValue } from "@/utils/data"

import { IconButton } from "@/components/Button"
import './index.scss'

enum CheckBoxVariant {
    radio,
    check
}

type CheckBoxProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClick'> & {
    value?: boolean
    compact?: boolean
    onValueChanged?: (isSelected: boolean) => unknown
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    disabled?: boolean
    variant?: CheckBoxVariant
    focused?: boolean
    disableScale?: boolean
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
    const $$props = mergeProps({ variant: CheckBoxVariant[_check] }, $props)
    const [props, other] = splitProps($$props, [
        _compact, _disabled, _children, _value,
        _onValueChanged, _variant, _class,
        _onClick, _focused, _disableScale
    ])
    const [isSelected, setIsSelected] = createSignal<boolean>(false)
    let isSelectedLocal = false
    let isInitialize: boolean = true

    function changeValue(): void {
        setIsSelected(v => !v)
        isSelectedLocal = isSelected()
        if (props[_onValueChanged]) props[_onValueChanged](isSelected())
    }

    createEffect(() => {
        const value = props[_value]
        const onValueChanged = props[_onValueChanged]
        if (
            !isInitialize
            && isVarHasValue(value)
            && value != isSelectedLocal
            && onValueChanged
        ){
            onValueChanged(value!)
        }
        setIsSelected(v => value ?? v)
        isInitialize = false
    })

    return (<div
        data-selected={toggleAttribute(isSelected())}
        data-disabled={toggleAttribute(props[_disabled])}
        class={"checkbox" + (props[_class] != undefined? ` ${props[_class]}` : '')}
        onClick={ev => {
            if (!props[_disabled]) changeValue()
            if (props[_onClick]) props[_onClick](ev)
        }}
        {...other}>
        <IconButton
            disabled={props[_disabled]}
            compact={props[_compact]}
            disableScale={props[_disableScale]}
            focused={props[_focused]}
            code={props[_variant] == CheckBoxVariant[_check]? (isSelected()? 0xE3CB : 0xE3D4) : 0xED2F }
            filled={props[_variant] != CheckBoxVariant[_check] && isSelected()}
            classList={{"checkbox-icon": true}}
        />
        {props[_children]}
    </div>)
}

export {
    CheckBox,
    CheckBoxVariant
}
export type {
    CheckBoxProps
}
export default CheckBox