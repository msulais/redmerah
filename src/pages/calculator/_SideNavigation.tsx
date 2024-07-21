import { For, Show, type VoidComponent, createSignal } from "solid-js";

import { _RIGHT_CENTER, _calculator, _colors, _expand, _filledTonal, _icon, _left, _numbers, _onChangeCalculator, _onChangeRandomizer, _randomizerType, _selection, _string, _teams, _text, _tooltip, _type, _words } from "@/data/string";
import { addClassListModule } from "@/utils/element";
import type { CalculatorType } from "./_enums";
import { CALCULATOR_TYPES } from "./_data";

import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_SideNavigation.module.scss'

type Props = {
    calculator: CalculatorType
    onChangeCalculator: (type: CalculatorType) => void
    expand: boolean
}

const _: VoidComponent<Props> = (props) => {
    return (<SideNavigation expand={props[_expand]} classList={addClassListModule(CSS.side_navigation)}>
        <For each={CALCULATOR_TYPES}>{ r => {
            const [button_ref, set_button_ref] = createSignal<HTMLButtonElement | null>(null)
            return (<>
                <Show when={!props[_expand]}>
                    <Tooltip anchor={button_ref()} text={r[_text]} isFollowingPointer/>
                </Show>
                <SideNavigationItem
                    ref={r => set_button_ref(r)}
                    iconOnly={!props[_expand]}
                    onClick={() => {
                        if (props[_calculator] == r[_type]) return;
                        props[_onChangeCalculator](r[_type]);
                    } }
                    leading={<Icon filled={props[_calculator] == r[_type]} code={r[_icon]}/>}
                    selected={props[_calculator] == r[_type]}>
                    { r[_text] }
                </SideNavigationItem>
            </>)
        }}</For>
    </SideNavigation>)
}

export default _