import { type SetStoreFunction } from "solid-js/store";
import { type Component, For, Match, Switch, type VoidComponent, createMemo } from "solid-js";

import { hexToHSL, hexToRgb } from "@/utils/color";
import type { HSLColor, RGBColor } from "@/types/color";
import { _result, _string, _numbers, _colors, _hex, _toUpperCase } from "@/data/string";
import { RandomizerType } from "./_enums";
import type { Result } from "./_types";
import { mathRound } from "@/utils/math";

import CSS from './_Result.module.scss'

type Props = {
    result: [Result, SetStoreFunction<Result>]
    randomizerType: RandomizerType
}

type ColorItemProps = {
    hex: string
}

const ColorItem: VoidComponent<ColorItemProps> = (props) => {
    const hsl = createMemo<HSLColor>(() => hexToHSL(props[_hex]))
    const rgb = createMemo<RGBColor>(() => hexToRgb(props[_hex]))

    return (<div style={{"background-color": props[_hex]}}>
        <code>
            {props[_hex][_toUpperCase]()}<br/>
            {`rgb(${rgb().r}, ${rgb().g}, ${rgb().b})`}<br/>
            {`hsl(${mathRound(hsl().h * 360)}, ${mathRound(hsl().s * 100)}%, ${mathRound(hsl().l * 100)}%)`}
        </code>
    </div>)
}

const C: Component<Props> = (props) => {
    const _randomizerType = 'randomizerType';

    return (<div class={ CSS[_result] }>
        <Switch>
            <Match when={props[_randomizerType] == RandomizerType[_string]}>
                <p class={CSS[_string]}>{props[_result][0][_string]}</p>
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_numbers]}>
                <p class={CSS[_numbers]}>{props[_result][0][_numbers]}</p>
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_colors]}>
                <div class={CSS[_colors]}>
                    <For each={props[_result][0][_colors]}>{c =>
                        <ColorItem hex={c} />
                    }</For>
                </div>
            </Match>
        </Switch>
    </div>)
}

export default C