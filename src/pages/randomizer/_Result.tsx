import { type SetStoreFunction } from "solid-js/store"
import { For, Match, Show, Switch, type VoidComponent, createMemo, createSelector } from "solid-js"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import type { Result, Settings } from "./_types"
import { hexToHsl, hexToRgb } from "@/utils/color"
import { RandomizerType, WordsRandomizerWordCase } from "./_enums"
import { stringToTitleCase, stringToToggleCase } from "@/utils/string"
import { setAttrIfExist } from "@/utils/attributes"

import CSS from './_styles.module.scss'

const ColorItem: VoidComponent<{
	hex: HEXColor
}> = (props) => {
	const hex = createMemo(() => props.hex)
	const hsl = createMemo<HSLColor>(() => hexToHsl(hex()))
	const rgb = createMemo<RGBColor>(() => hexToRgb(hex()))

	return (<div style={{"background-color": hex()}}>
		<code>
			{hex().toUpperCase()}<br/>
			{`rgb(${Math.round(rgb().r * 0xff)}, ${Math.round(rgb().g * 0xff)}, ${Math.round(rgb().b * 0xff)})`}<br/>
			{`hsl(${Math.round(hsl().h * 360)}, ${Math.round(hsl().s * 100)}%, ${Math.round(hsl().l * 100)}%)`}
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
		(item, items) => items.some((a) => a == item)
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
						when={result().words.length > 0}
						fallback={settings().words.list.items.map(text => {
							const words = settings().words
							const wordCase = words.wordCase
							if (wordCase == WordsRandomizerWordCase.lowercase) {
								text = text.toLowerCase()
							}
							else if (wordCase == WordsRandomizerWordCase.uppercase) {
								text = text.toUpperCase()
							}
							else if (wordCase == WordsRandomizerWordCase.togglecase) {
								text = stringToToggleCase(text)
							}
							else if (wordCase == WordsRandomizerWordCase.titlecase) {
								text = stringToTitleCase(text)
							}
							return words.prefix + text + words.suffix
						}).join(settings().words.separator)}>
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
						<div data-selected={setAttrIfExist(is_selected(item))}>
							{ item }
						</div>
					}</For>
				</div>
			</Match>
			<Match when={randomizer() == RandomizerType.teams}>
				<Show when={result().teams.length == 0}>
					<div class={CSS.result_teams_empty}>
						<h2>Names</h2>
						<div>
							<For each={settings().teams.listNames.items}>{i =>
								<div>{i}</div>
							}</For>
						</div>
						<h2>Members</h2>
						<div>
							<For each={settings().teams.listMembers.items}>{i =>
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