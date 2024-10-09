import { type SetStoreFunction } from "solid-js/store";
import { For, Match, Show, Switch, type VoidComponent, createMemo, createSelector } from "solid-js";

import type { HEXColor, HSLColor, RGBColor } from "@/types/color";
import type { Result, Settings } from "./_types";
import { HEX_to_HSL, HEX_to_RGB } from "@/utils/color";
import { _result, _string, _numbers, _colors, _hex, _toUpperCase, _randomizerType, _words, _length, _join, _list, _map, _members, _settings, _prefix, _separator, _suffix, _lowercase, _titlecase, _togglecase, _uppercase, _wordCase, _items, _selection, _some, _teams, _name, _membersList, _namesList } from "@/constants/string";
import { RandomizerType, WordsRandomizerWordCase } from "./_enums";
import { stringToLowerCase, stringToTitleCase, stringToToggleCase, stringToUpperCase } from "@/utils/string";
import { toggleAttribute } from "@/utils/attributes";
import { mathRound } from "@/utils/math";

import CSS from './_styles.module.scss'

const ColorItem: VoidComponent<{
	hex: HEXColor
}> = (props) => {
	const hsl = createMemo<HSLColor>(() => HEX_to_HSL(props[_hex]))
	const rgb = createMemo<RGBColor>(() => HEX_to_RGB(props[_hex]))

	return (<div style={{"background-color": props[_hex]}}>
		<code>
			{props[_hex][_toUpperCase]()}<br/>
			{`rgb(${rgb().r}, ${rgb().g}, ${rgb().b})`}<br/>
			{`hsl(${mathRound(hsl().h * 360)}, ${mathRound(hsl().s * 100)}%, ${mathRound(hsl().l * 100)}%)`}
		</code>
	</div>)
}

const _: VoidComponent<{
	result: [Result, SetStoreFunction<Result>]
	randomizerType: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
}> = (props) => {
	const settings = createMemo(() => props[_settings][0])
	const result = createMemo(() => props[_result][0])
	const selection_isSelected = createSelector<string[], string>(
		() => result()[_selection],
		(item, items) => items[_some]((a) => a == item)
	)

	return (<div class={ CSS.result }>
		<Switch>
			<Match when={props[_randomizerType] == RandomizerType[_string]}>
				<p class={CSS.result_string}>{result()[_string]}</p>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_numbers]}>
				<p class={CSS.result_numbers}>{result()[_numbers]}</p>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_words]}>
				<p class={CSS.result_words}>
					<Show
						when={result()[_words][_length] > 0}
						fallback={settings()[_words][_list][_items][_map](text => {
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
						})[_join](settings()[_words][_separator])}>
						{result()[_words]}
					</Show>
				</p>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_colors]}>
				<div class={CSS.result_colors}>
					<For each={result()[_colors]}>{c =>
						<ColorItem hex={c} />
					}</For>
				</div>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_selection]}>
				<div class={CSS.result_selection}>
					<For each={settings()[_selection][_list][_items]}>{item =>
						<div data-selected={toggleAttribute(selection_isSelected(item))}>
							{ item }
						</div>
					}</For>
				</div>
			</Match>
			<Match when={props[_randomizerType] == RandomizerType[_teams]}>
				<Show when={result()[_teams][_length] == 0}>
					<div class={CSS.result_teams_empty}>
						<h2>Names</h2>
						<div>
							<For each={settings()[_teams][_namesList][_items]}>{i =>
								<div>{i}</div>
							}</For>
						</div>
						<h2>Members</h2>
						<div>
							<For each={settings()[_teams][_membersList][_items]}>{i =>
								<div>{i}</div>
							}</For>
						</div>
					</div>
				</Show>
				<div class={CSS.result_teams}>
					<For each={result()[_teams]}>{t =>
						<div>
							<h3>{t[_name]}</h3>
							<ul>
								<For each={t[_members]}>{m =>
									<li>{m}</li>
								}</For>
							</ul>
						</div>
					}</For>
				</div>
			</Match>
		</Switch>
	</div>)
}

export default _