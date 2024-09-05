import { For, type VoidComponent } from "solid-js";

import { RandomizerType } from "./_enums";
import { _rightCenter, _colors, _expand, _filledTonal, _icon, _left, _numbers, _onChangeRandomizer, _randomizerType, _selection, _string, _teams, _text, _tooltip, _type, _words } from "@/data/string";
import { addClassListModule } from "@/utils/element";
import { RANDOMIZER_TYPES } from "./_constants";

import Icon from "@/components/Icon";
import {TextTooltip} from "@/components/Tooltip";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
    randomizerType: RandomizerType
    onChangeRandomizer: (type: RandomizerType) => void
    expand: boolean
}> = (props) => {
    return (<SideNavigation expand={props[_expand]} classList={addClassListModule(CSS.side_navigation)}>
        <For each={RANDOMIZER_TYPES}>{ r =>
            <TextTooltip text={!props[_expand]? r[_text] : undefined}>
                <SideNavigationItem
                    iconOnly={!props[_expand]}
                    onClick={() => {
                        if (props[_randomizerType] == r[_type]) return;
                        props[_onChangeRandomizer](r[_type]);
                    } }
                    leading={<Icon filled={props[_randomizerType] == r[_type]} code={r[_icon]}/>}
                    selected={props[_randomizerType] == r[_type]}>
                    { r[_text] }
                </SideNavigationItem>
            </TextTooltip>
        }</For>
    </SideNavigation>)
}

export default _