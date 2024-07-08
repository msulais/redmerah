import { type SetStoreFunction } from "solid-js/store";
import { type Component, For, Match, Show, Switch, type VoidComponent, createMemo, createSelector } from "solid-js";

import { hexToHSL, hexToRgb } from "@/utils/color";
import type { HEXColor, HSLColor, RGBColor } from "@/types/color";
import { _result, _string, _numbers, _colors, _hex, _toUpperCase, _randomizerType, _words, _length, _join, _list, _map, _members, _settings, _prefix, _separator, _suffix, _lowercase, _titlecase, _togglecase, _uppercase, _wordCase, _items } from "@/data/string";
import { RandomizerType, WordsRandomizerWordCase } from "./_enums";
import type { Result, Settings } from "./_types";
import { mathRound } from "@/utils/math";

import CSS from './_Result.module.scss'
import { stringToLowerCase, stringToTitleCase, stringToToggleCase, stringToUpperCase } from "@/utils/string";

type Props = {
    result: [Result, SetStoreFunction<Result>]
    randomizerType: RandomizerType
    settings: [Settings, SetStoreFunction<Settings>]
}

type ColorItemProps = {
    hex: HEXColor
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
    const settings = createMemo(() => props[_settings][0])
    return (<div class={ CSS[_result] }>
        <Switch>
            <Match when={props[_randomizerType] == RandomizerType[_string]}>
                <p class={CSS[_string]}>{props[_result][0][_string]}</p>
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_numbers]}>
                <p class={CSS[_numbers]}>{props[_result][0][_numbers]}</p>
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_words]}>
                <p class={CSS[_words]}>
                    <Show 
                        when={props[_result][0][_words][_length] > 0}
                        fallback={settings()[_words][_list][_items][_map](
                            text => {
                                if (settings()[_words][_wordCase] == WordsRandomizerWordCase[_lowercase]) {
                                    text = stringToLowerCase(text)
                                }
                                else if (settings()[_words][_wordCase] == WordsRandomizerWordCase[_uppercase]) {
                                    text = stringToUpperCase(text)
                                }
                                else if (settings()[_words][_wordCase] == WordsRandomizerWordCase[_togglecase]) {
                                    text = stringToToggleCase(text)
                                }
                                else if (settings()[_words][_wordCase] == WordsRandomizerWordCase[_titlecase]) {
                                    text = stringToTitleCase(text)
                                }
                                return settings()[_words][_prefix] + text + settings()[_words][_suffix]
                            }
                        )[_join](settings()[_words][_separator])}>
                        {props[_result][0][_words]}
                    </Show>
                </p>
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