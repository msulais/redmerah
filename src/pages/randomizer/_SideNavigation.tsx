import { type Component, For, Show, createSignal } from "solid-js";

import { PopoverPosition, Position } from "@/enums/position";
import { RandomizerType } from "./_enums";
import { _RIGHT_CENTER, _colors, _expand, _filledTonal, _icon, _left, _numbers, _onChangeRandomizer, _randomizerType, _selection, _string, _teams, _text, _tooltip, _type, _words } from "@/data/string";

import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_index.module.scss'
import { addClassListModule } from "@/utils/element";
import { RANDOMIZER_TYPES } from "./_data";

type Props = {
    randomizerType: RandomizerType
    onChangeRandomizer: (type: RandomizerType) => void
    expand: boolean
}

const C: Component<Props> = (props) => {
    return (<SideNavigation expand={props[_expand]} classList={addClassListModule(CSS.side_navigation)}>
        <For each={RANDOMIZER_TYPES}>{ r => {
            const [button_ref, set_button_ref] = createSignal<HTMLButtonElement | null>(null)
            return (<>
                <Show when={!props[_expand]}>
                    <Tooltip anchor={button_ref()} text={r[_text]} isFollowingPointer/>
                </Show>
                <SideNavigationItem
                    ref={r => set_button_ref(r)}
                    iconOnly={!props[_expand]}
                    onClick={() => {
                        if (props[_randomizerType] == r[_type]) return;
                        props[_onChangeRandomizer](r[_type]);
                    } }
                    leading={<Icon filled={props[_randomizerType] == r[_type]} code={r[_icon]}/>}
                    selected={props[_randomizerType] == r[_type]}>
                    { r[_text] }
                </SideNavigationItem>
            </>)
        }}</For>
    </SideNavigation>)
}

export default C