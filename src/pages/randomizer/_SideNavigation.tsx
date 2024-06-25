import { type Component, For, createSignal } from "solid-js";

import { PopoverPosition, Position } from "@/enums/position";
import { RandomizerType } from "./_enums";
import { _RIGHT_CENTER, _colors, _filledTonal, _icon, _left, _numbers, _selection, _string, _teams, _tooltip, _type, _words } from "@/data/string";

import Icon from "@/components/Icon";
import Button, { ButtonVariant } from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import CSS from './_SideNavigation.module.scss'

type Props = {
    randomizerType: RandomizerType
    onChangeRandomizer: (type: RandomizerType) => void
}

const C: Component<Props> = (props) => {
    const
        _randomizerType = 'randomizerType',
        _onChangeRandomizer = 'onChangeRandomizer'
    ;
    const randomizerTypes = [
        { icon: 0xF155, type: RandomizerType[_string], tooltip: 'String' },
        { icon: 0xE4AE, type: RandomizerType[_words], tooltip: 'Words' },
        { icon: 0xEB49, type: RandomizerType[_numbers], tooltip: 'Numbers' },
        { icon: 0xE4B6, type: RandomizerType[_colors], tooltip: 'Colors' },
        { icon: 0xF098, type: RandomizerType[_selection], tooltip: 'Selection' },
        { icon: 0xEBC6, type: RandomizerType[_teams], tooltip: 'Teams' },
    ]
    return (<div class={ CSS.side_navigation }>
        <For each={randomizerTypes}>{ r => {
            const [btnRef, setBtnRef] = createSignal<HTMLButtonElement | null>(null)
            return (<>
                <Tooltip anchor={btnRef()} text={r[_tooltip]} position={PopoverPosition[_RIGHT_CENTER]} />
                <Button
                    indicatorPosition={Position[_left]}
                    iconOnly
                    ref={r => setBtnRef(r)}
                    onClick={() => {
                        if (props[_randomizerType] == r[_type]) return;
                        props[_onChangeRandomizer](r[_type]);
                    } }
                    variant={props[_randomizerType] == r[_type] ? ButtonVariant[_filledTonal] : undefined}
                    selected={props[_randomizerType] == r[_type]}>
                    <Icon filled={props[_randomizerType] == r[_type]} code={r[_icon]}/>
                </Button>
            </>)
        }}</For>
    </div>)
}

export default C