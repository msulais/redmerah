import { type SetStoreFunction } from "solid-js/store"
import { For, Match, Show, Switch, type VoidComponent, createMemo, createSelector } from "solid-js"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import type { Result, Settings } from "./_types"
import { hex_to_hsl, hex_to_rgb } from "@/utils/color"
import { RandomizerType, WordsRandomizerWordCase } from "./_enums"
import { string_length, string_tolowercase, string_totitlecase, string_totogglecase, string_touppercase } from "@/utils/string"
import { attr_set_if_exist } from "@/utils/attributes"
import { math_round } from "@/utils/math"
import { array_join, array_length, array_map, array_some } from "@/utils/array"

import CSS from './_styles.module.scss'

const ColorItem: VoidComponent<{
	hex: HEXColor
}> = (props) => {
	const hex = createMemo(() => props.hex)
	const hsl = createMemo<HSLColor>(() => hex_to_hsl(hex()))
	const rgb = createMemo<RGBColor>(() => hex_to_rgb(hex()))

	return (<div style={{"background-color": hex()}}>
		<code>
			{string_touppercase(hex())}<br/>
			{`rgb(${math_round(rgb().r * 0xff)}, ${math_round(rgb().g * 0xff)}, ${math_round(rgb().b * 0xff)})`}<br/>
			{`hsl(${math_round(hsl().h * 360)}, ${math_round(hsl().s * 100)}%, ${math_round(hsl().l * 100)}%)`}
		</code>
	</div>)
}

const _: VoidComponent<{
	result: [Result, SetStoreFunction<Result>]
	randomizer: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
}> = (props) => {
	const randomizer = createMemo(() => props.randomizer)
	const settings = createMemo(() => props.settings[0])
	const result = createMemo(() => props.result[0])
	const is_selected = createSelector<string[], string>(
		() => result().selection,
		(item, items) => array_some(items, (a) => a == item)
	)

	return (<div class={ CSS.result }>
		<Switch>
			<Match when={randomizer() == RandomizerType.string}>
				<p class={CSS.result_string}>{result().string}</p>
			</Match>
			<Match when={randomizer() == RandomizerType.numbers}>
				<p class={CSS.result_numbers}>{result().numbers}</p>
			</Match>
			<Match when={randomizer() == RandomizerType.words}>
				<p class={CSS.result_words}>
					<Show
						when={string_length(result().words) > 0}
						fallback={array_join(array_map(settings().words.list.items, text => {
							const words = settings().words
							const wordcase = words.wordcase
							if (wordcase == WordsRandomizerWordCase.lowercase) {
								text = string_tolowercase(text)
							}
							else if (wordcase == WordsRandomizerWordCase.uppercase) {
								text = string_touppercase(text)
							}
							else if (wordcase == WordsRandomizerWordCase.togglecase) {
								text = string_totogglecase(text)
							}
							else if (wordcase == WordsRandomizerWordCase.titlecase) {
								text = string_totitlecase(text)
							}
							return words.prefix + text + words.suffix
						}), settings().words.separator)}>
						{result().words}
					</Show>
				</p>
			</Match>
			<Match when={randomizer() == RandomizerType.colors}>
				<div class={CSS.result_colors}>
					<For each={result().colors}>{c =>
						<ColorItem hex={c} />
					}</For>
				</div>
			</Match>
			<Match when={randomizer() == RandomizerType.selection}>
				<div class={CSS.result_selection}>
					<For each={settings().selection.list.items}>{item =>
						<div data-selected={attr_set_if_exist(is_selected(item))}>
							{ item }
						</div>
					}</For>
				</div>
			</Match>
			<Match when={randomizer() == RandomizerType.teams}>
				<Show when={array_length(result().teams) == 0}>
					<div class={CSS.result_teams_empty}>
						<h2>Names</h2>
						<div>
							<For each={settings().teams.list_names.items}>{i =>
								<div>{i}</div>
							}</For>
						</div>
						<h2>Members</h2>
						<div>
							<For each={settings().teams.list_members.items}>{i =>
								<div>{i}</div>
							}</For>
						</div>
					</div>
				</Show>
				<div class={CSS.result_teams}>
					<For each={result().teams}>{t =>
						<div>
							<h3>{t.name}</h3>
							<ul>
								<For each={t.members}>{m =>
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