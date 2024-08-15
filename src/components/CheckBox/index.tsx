import { Show, createEffect, createSignal, mergeProps, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _check, _children, _compact, _disabled, _onValueChanged, _type, _value } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes"

import Icon from "@/components/Icon"
import Button from "@/components/Button"
import './index.scss'
import { isVarHasValue } from "@/utils/data"

type CheckBoxProps = JSX.HTMLAttributes<HTMLDivElement> & {
    value?: boolean
    compact?: boolean
    onValueChanged?: (value: boolean) => unknown
    disabled?: boolean
    type?: 'radio' | 'check'
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
    const $$props = mergeProps({ type: _check }, $props)
    const [props, other] = splitProps($$props, [_type, _compact, _disabled, _children, _value, _onValueChanged])
    const [isSelected, setIsSelected] = createSignal<boolean>(false)
    let isSelectedLocal = false
    let isInitialize: boolean = true

    function changeValue(): void {
        setIsSelected(v => !v)
        isSelectedLocal = isSelected()
        if (props[_onValueChanged]) props[_onValueChanged](isSelected())
    }

    createEffect(() => {
        if (
            !isInitialize 
            && isVarHasValue(props[_value]) 
            && props[_value] != isSelectedLocal 
            && props[_onValueChanged]
        ){
            props[_onValueChanged](props[_value]!)
        }
        setIsSelected(v => props[_value] ?? v)
        isInitialize = false
    })

    return (<div 
        data-selected={toggleAttribute(isSelected())} 
        data-disabled={toggleAttribute(props[_disabled])} 
        class="checkbox" 
        onClick={() => changeValue()}
        {...other}>
        <Button compact={props[_compact]} disabled={props[_disabled]} iconOnly classList={{"checkbox-icon": true}}>
            <Show when={props[_type] == _check} fallback={<Icon filled={isSelected()} code={0xED2F}/>}>
                <Icon code={isSelected()? 0xE3CB : 0xE3D4}/>
            </Show>
        </Button>
        {props[_children]}
    </div>)
}

export default CheckBox