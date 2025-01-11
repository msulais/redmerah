import { createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { ItemList, Result, Settings } from "./_types"
import { rgb_to_hex, hsl_to_hex } from "@/utils/color"
import { interval_set, interval_clear } from "@/utils/timeout"
import { createStore } from "solid-js/store"
import { RandomizerType, WordsRandomizerWordCase, NumbersRandomizerNumberType, NumbersRandomizerSort, ColorsRandomizerColorModel, Commands } from "./_enums"
import { math_floor, math_random, math_round } from "@/utils/math"
import { PERSON_NAMES, TEAMS_NAMES, ANIMALS, LOREM_IPSUM, DEFAULT_LISTS } from "./_constants"
import { ObjectStoreNames, ObjectStoreKeys, type ObjectStoreLists, type ObjectStoreSettings, type ObjectStoreLastResult } from "./_storage"
import { string_tolowercase, string_touppercase, string_totogglecase, string_totitlecase, string_length, string_padstart, string_trim, string_split, string_locale_compare } from "@/utils/string"
import { url_create, url_download_file, url_revoke } from "@/utils/url"
import { element_dataset, element_focus, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { file_open, file_read_as_text } from "@/utils/file"
import { IDB, idb_store_delete, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { attr_remove, attr_set, attr_set_if_exist, classlist_module } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { remove_splash_screen } from "@/scripts/splash"
import { array_concat, array_filter, array_find_index, array_includes, array_join, array_length, array_map, array_push, array_slice, array_sort, array_splice } from "@/utils/array"
import { number_is_not_defined, number_parse, number_to_string } from "@/utils/number"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { document_active, document_body } from "@/utils/document"
import { event_current_target } from "@/utils/event"
import { promise_done } from "@/utils/object"

import App from "@/components/App"
import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Divider from "@/components/Divider"
import Dialog, { close_dialog, open_dialog } from "@/components/Dialog"
import Button, { ButtonVariant, FloatingActionButton, IconButton } from "@/components/Button"
import List from "@/components/List"
import TextField, { AreaTextField, change_areatextfield_value, change_textfield_value } from "@/components/TextField"
import Toast, { open_toast } from "@/components/Toast"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Control from './_Control'
import ResultComponent from './_Result'
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.randomizer, 1)
	const body = document_body()
	const randomizer_string = RandomizerType.string
	const randomizer_numbers = RandomizerType.numbers
	const randomizer_words = RandomizerType.words
	const randomizer_selection = RandomizerType.selection
	const randomizer_colors = RandomizerType.colors
	const randomizer_teams = RandomizerType.teams
	const [randomizer, set_randomizer] = createSignal<RandomizerType>(randomizer_string)
	const [list_viewitem, set_list_viewitem] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selected_list_to_delete, set_selected_list_to_delete] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selected_list_to_edit, set_selected_list_to_edit] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [is_sidenavigation_expanded, set_is_sidenavigation_expanded] = createSignal<boolean>(true)
	const [is_generating, set_is_generating] = createSignal<boolean>(false)
	const [lists, set_lists] = createStore<ItemList[]>(array_map(DEFAULT_LISTS, l => ({id: l.id, name: l.name, items: [...l.items]})))
	const [settings, set_settings] = createStore<Settings>({
		string: {
			animation: true,
			length: 8,
			characters: {
				lowercase: true,
				uppercase: true,
				numbers: true,
				symbols: false,
				custom: '',
			}
		},
		words: {
			animation: true,
			count: 3,
			list: {id: 5, name: 'Lorem Ipsum', items: [...LOREM_IPSUM ]},
			prefix: '',
			repeat: true,
			separator: ' ',
			suffix: '',
			wordcase: WordsRandomizerWordCase.none
		},
		numbers: {
			animation: true,
			count: 3,
			min_length: 0,
			type: NumbersRandomizerNumberType.decimal,
			prefix: '',
			range: {
				min: 0,
				max: 200
			},
			repeat: true,
			separator: ', ',
			sort: NumbersRandomizerSort.none,
			suffix: '',
		},
		colors: {
			animation: true,
			model: ColorsRandomizerColorModel.rgb,
			count: 3,
			range: {
				hex: { min: 0, max: 0xffffff },
				hsl: {
					h: { min: 0, max: 360 },
					s: { min: 0, max: 100 },
					l: { min: 0, max: 100 },
				},
				rgb: {
					r: { min: 0, max: 255 },
					g: { min: 0, max: 255 },
					b: { min: 0, max: 255 },
				},
			}
		},
		selection: {
			animation: true,
			count: 4,
			list: {id: 4, name: 'Animals', items: [...ANIMALS]},
		},
		teams: {
			animation: true,
			count: 3,
			list_members: {id: 1, name: 'Person', items: [...PERSON_NAMES]},
			list_names: {id: 2, name: 'Teams', items: [...TEAMS_NAMES]},
		}
	})
	const [output, set_output] = createStore<Result>({
		string: '',
		colors: [],
		numbers: '',
		selection: [],
		teams: [],
		words: ''
	})
	let interval_id: number | null = null
	let dialog_lists_ref: HTMLDialogElement
	let dialog_deletelistwarning_ref: HTMLDialogElement
	let dialog_add_ref: HTMLDialogElement
	let dialog_edit_ref: HTMLDialogElement
	let dialog_viewitemlist_ref: HTMLDialogElement
	let dialog_previewitemlist_ref: HTMLDialogElement
	let toast_listnameempty_ref: HTMLDivElement
	let toast_listhavenoitems_ref: HTMLDivElement
	let toast_listnamealreadyexist_ref: HTMLDivElement
	let toast_listedited_ref: HTMLDivElement
	let toast_listdeleted_ref: HTMLDivElement
	let toast_newlistadded_ref: HTMLDivElement
	let toast_nolistselected_ref: HTMLDivElement
	let areatextfield_newitemlist_ref: HTMLTextAreaElement
	let areatextfield_edititemlist_ref: HTMLTextAreaElement
	let textfield_newlistname_ref: HTMLInputElement
	let textfield_editlistname_ref: HTMLInputElement

	function generate(): void {
		if (randomizer() == randomizer_string) {
			let text: string = ''
			let charlist: string = ''
			const $settings = settings.string
			const characters = $settings.characters

			if (characters.lowercase) charlist += 'abcdefghijklmnopqrstuvwxyz'
			if (characters.uppercase) charlist += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			if (characters.numbers) charlist += '0123456789'
			if (characters.symbols) charlist += "<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"
			if (characters.custom) charlist += characters.custom

			for (let i = 0; i < $settings.length; i++) {
				text += charlist[math_floor(math_random() * string_length(charlist))]
			}

			set_output('string', text)
		}

		else if (randomizer() == randomizer_numbers) {
			const numbers: number[] = []
			const $settings = settings.numbers
			const min = $settings.range.min
			const count = $settings.count
			const range: number = $settings.range.max - min

			for (let i = 0; i < count; i++) {
				const v: number = min + 1 + math_floor(math_random() * range)

				if (!$settings.repeat && array_includes(numbers, v)) continue

				array_push(numbers, v)
			}

			let iteration = 0
			while (array_length(numbers) < count && iteration < count + 0xff){
				const v: number = min + 1 + math_floor(math_random() * range)

				if (!$settings.repeat &&
					array_includes(numbers, v) &&
					array_length(numbers) < range) continue;

				array_push(numbers, v)
				++iteration
			}

			array_sort(
				numbers,
				(a, b) => $settings.sort == NumbersRandomizerSort.ascending
					? a - b
					: b - a
			)

			set_output('numbers', array_join(array_map([...numbers], v =>
				$settings.prefix +
				string_touppercase(string_padstart(number_to_string(v, $settings.type), $settings.min_length, '0')) +
				$settings.suffix
			), $settings.separator))
		}

		else if (randomizer() == randomizer_colors) {
			const $settings = settings.colors
			const colors: HEXColor[] = []
			const count = $settings.count
			const random_number = (min: number, max: number): number => {
				const range = max - min
				const value = min + 1 + math_floor(math_random() * range)
				return math_round(value)
			}

			switch ($settings.model) {
				case ColorsRandomizerColorModel.rgb: {
					const rgb = $settings.range.rgb
					for (let i = 0; i < count; i++) {
						const r = random_number(rgb.r.min, rgb.r.max) / 0xff
						const g = random_number(rgb.g.min, rgb.g.max) / 0xff
						const b = random_number(rgb.b.min, rgb.b.max) / 0xff
						array_push(colors, rgb_to_hex({r, g, b}))
					}
					break
				}
				case ColorsRandomizerColorModel.hsl: {
					const hsl = $settings.range.hsl
					for (let i = 0; i < count; i++) {
						const hue = random_number(hsl.h.min, hsl.h.max) / 360
						const saturation = random_number(hsl.s.min, hsl.s.max) / 100
						const lightness = random_number(hsl.l.min, hsl.l.max) / 100
						array_push(colors, hsl_to_hex({h: hue, s: saturation, l: lightness}))
					}
					break
				}
				case ColorsRandomizerColorModel.hex: {
					const hex = $settings.range.hex
					for (let i = 0; i < count; i++) {
						const value = random_number(hex.min, hex.max)
						array_push(colors, '#' + string_padstart(number_to_string(value, 16), 6, '0') as HEXColor)
					}
					break
				}
			}

			set_output('colors', colors)
		}

		else if (randomizer() == randomizer_words) {
			const $settings = settings.words
			const words: string[] = []
			const items = $settings.list.items
			let members: string[] = [...items]

			for (let i = 0; i < $settings.count; i++) {
				if (i >= array_length(items) && !$settings.repeat) break;

				const index = math_floor(math_random() * (array_length(members) - 1))
				const member = members[index]

				if (!$settings.repeat) {
					array_splice(members, index, 1)

					if (array_includes(words, member)) continue
				}

				array_push(words, member)
			}

			members = [...items]
			for (let i = 0; i < $settings.count - array_length(words); i++) {
				const index = math_floor(math_random() * (array_length(members) - 1))
				array_push(words, members[index])
			}

			set_output('words', array_join(array_map(words, text => {
				switch ($settings.wordcase) {
					case WordsRandomizerWordCase.uppercase: text = string_touppercase(text); break
					case WordsRandomizerWordCase.lowercase: text = string_tolowercase(text); break
					case WordsRandomizerWordCase.titlecase: text = string_totitlecase(text); break
					case WordsRandomizerWordCase.togglecase: text = string_totogglecase(text); break
					case WordsRandomizerWordCase.none:
				}

				return $settings.prefix + text + $settings.suffix
			}), $settings.separator))
		}

		else if (randomizer() == randomizer_selection) {
			const $settings = settings.selection
			const count = $settings.count
			const items = [...$settings.list.items]
			const selected_items: string[] = []

			if (count == array_length(items)) {
				set_output('selection', items)
				return
			}

			for (let i = 0; i < count; i++) {
				const index = math_floor(math_random() * (array_length(items) - 1))
				array_push(selected_items, items[index])
				array_splice(items, index, 1)
			}

			set_output('selection', selected_items)
		}

		else if (randomizer() == randomizer_teams) {
			const $settings = settings.teams
			const count = $settings.count
			const names: string[] = [...$settings.list_names.items]
			const members: string[] = [...$settings.list_members.items]
			const teams: {name: string; members: string[]}[] = []
			const min_members = math_floor(array_length(members) / count)

			if (array_length(names) > count) {
				array_splice(names, array_length(names) - (array_length(names) - count))
			}

			array_sort(names)

			const range = count - array_length(names)
			for (let i = 0; i < range; i++) {
				array_push(names, 'Team #' + (i + 1))
			}

			for (const name of names) {
				const m: string[] = []

				for (let i = 0; i < min_members; i++) {
					const index = math_floor(math_random() * (array_length(members) - 1))
					array_push(m, members[index])
					array_splice(members, index, 1)
				}

				array_sort(m)
				array_push(teams, {name, members: m})
			}

			for (const i in members) {
				array_push(teams[i].members, members[i])
			}

			set_output('teams', teams)
		}
	}

	async function on_generate(ev: Event): Promise<void> { return new Promise((ok) => {
		set_is_generating(true)
		attr_set(body, BodyAttributes.no_pointer_event)

		let type = 'string'
		if (randomizer() == randomizer_string) type = 'string'
		else if (randomizer() == randomizer_numbers) type = 'numbers'
		else if (randomizer() == randomizer_words) {
			type = 'words'
			if (settings.words.list.id == -1) {
				open_toast(ev, toast_nolistselected_ref)
				return ok()
			}
		}
		else if (randomizer() == randomizer_selection) {
			type = 'selection'
			if (settings.selection.list.id == -1) {
				open_toast(ev, toast_nolistselected_ref)
				return ok()
			}
		}
		else if (randomizer() == randomizer_colors) type = 'colors'
		else if (randomizer() == randomizer_teams) {
			type = 'teams'
			const teams = settings.teams
			if (teams.list_members.id == -1 || teams.list_names.id == -1) {
				open_toast(ev, toast_nolistselected_ref)
				return ok()
			}
		}

		if (settings[type as keyof Settings].animation){
			const duration = 3000
			const step = 250
			let i = 0
			interval_id = interval_set(() => {

				// max duration: 3 seconds
				if (i >= duration / step) {
					interval_clear(interval_id!)
					output_to_db()
					set_is_generating(false)
					attr_remove(body, BodyAttributes.no_pointer_event)
					return ok()
				}
				generate()
				++i
			}, step)
			return
		}

		generate()
		output_to_db()
		attr_remove(body, BodyAttributes.no_pointer_event)
		set_is_generating(false)
		ok()
	})}

	function on_stop_generate(): void {
		set_is_generating(false)
		attr_remove(body, BodyAttributes.no_pointer_event)
		interval_clear(interval_id!)
		output_to_db()
	}

	async function on_copy_result(): Promise<boolean> {
		let text = output.string

		try {
			if (randomizer() == randomizer_string) text = output.string
			else if (randomizer() == randomizer_numbers) text = output.numbers
			else if (randomizer() == randomizer_words) text = output.words
			else if (randomizer() == randomizer_selection) text = array_join(
				array_map(
					settings.selection.list.items,
					v => array_includes(output.selection, v)? (v + ' [selected]') : v
				),
				'\n'
			)
			else if (randomizer() == randomizer_colors) text = array_join(output.colors, '\n')
			else if (randomizer() == randomizer_teams) text = array_join(array_map(output.teams, v => '# ' + v.name + '\n' + array_join(v.members, '\n')), '\n\n')
			await navigator_clipboard_writetext(text)
			return true
		} catch (e) {}

		return false
	}

	function on_change_randomizer(type: RandomizerType): void {
		set_randomizer(type)
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		idb_store_put(store_settings, {
			key: ObjectStoreKeys.settings_lastpage,
			value: randomizer()
		})
	}

	function output_to_db(): void {
		const store_lastoutput = db.write_store(ObjectStoreNames.last_output)
		if (store_lastoutput == null) return

		let key = ''
		let value: any = ''

		if (randomizer() == randomizer_string) {
			key = ObjectStoreKeys.lastoutput_string
			value = output.string
		}
		else if (randomizer() == randomizer_numbers) {
			key = ObjectStoreKeys.lastoutput_numbers,
			value = output.numbers
		}
		else if (randomizer() == randomizer_words) {
			key = ObjectStoreKeys.lastoutput_words
			value = output.words
		}
		else if (randomizer() == randomizer_selection) {
			key = ObjectStoreKeys.lastoutput_selection,
			value = [...output.selection]
		}
		else if (randomizer() == randomizer_colors) {
			key = ObjectStoreKeys.lastoutput_colors
			value = [...output.colors]
		}
		else if (randomizer() == randomizer_teams) {
			key = ObjectStoreKeys.lastoutput_teams
			value = [...array_map(output.teams, v => ({name: v.name, members: [...v.members]}))]
		}

		idb_store_put(store_lastoutput, {key, value})
	}

	async function init_database(): Promise<void> {
		db.open({
			on_success() {
				init_last_output()
				init_last_page()
				get_lists()
				init_settings()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreLastResult>({
					name: ObjectStoreNames.last_output,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				const $lists = db.create_store<ObjectStoreLists>({
					name: ObjectStoreNames.lists,
					key_path: 'id',
					indexs: ['id', 'name', 'items']
				})

				for (const list of DEFAULT_LISTS) idb_store_put($lists!, {
					id: list.id,
					name: list.name,
					items: [...list.items]
				} satisfies ObjectStoreLists)
			}
		})
	}

	function init_last_page(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return;

		promise_done(db.get<{key: string; value: RandomizerType}>(
			store_settings,
			ObjectStoreKeys.settings_lastpage
		), (result) => set_randomizer(r => result?.value ?? r))
	}

	function init_last_output(): void {
		const store_lastoutput = db.read_store(ObjectStoreNames.last_output)
		if (store_lastoutput == null) return

		promise_done(db.get<{key: string; value: string}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_string
		), (result) => set_output('string', s => result?.value ??s))

		promise_done(db.get<{key: string; value: string}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_numbers
		), (result) => set_output('numbers', n => result?.value ?? n))

		promise_done(db.get<{key: string; value: string}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_words
		), (result) => set_output('words', w => result?.value ?? w))

		promise_done(db.get<{key:string; value: string[]}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_selection
		), (result) => set_output('selection', s => result?.value ?? s))

		promise_done(db.get<{key: string; value: HEXColor[]}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_colors
		), (result) => set_output('colors', c => result?.value ?? c))

		promise_done(db.get<{key: string; value: {name: string;members: string[]}[]}>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_teams
		), (result) => set_output('teams', t => result?.value ?? t))
	}

	function get_lists(): void {
		const store_lists = db.read_store(ObjectStoreNames.lists)
		if (store_lists == null) return

		promise_done(db.get_all<ObjectStoreLists>(store_lists), (result) => {
			if (!result) return;
			set_lists([...result])
			get_lists_settings()
		})
	}

	function get_lists_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings>(
			store_settings,
			ObjectStoreKeys.settings_words_listid
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return set_settings('words', 'list', list)
			}

			return set_settings('words', 'list', {id: -1, items: [], name: ''})
		})

		promise_done(db.get<ObjectStoreSettings>(
			store_settings,
			ObjectStoreKeys.settings_selection_listid
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return set_settings('selection', 'list', list)
			}

			return set_settings('selection', 'list', {id: -1, items: [], name: ''})
		})

		promise_done(db.get<ObjectStoreSettings>(
			store_settings,
			ObjectStoreKeys.settings_teams_listnamesid
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return set_settings('teams', 'list_names', list)
			}

			return set_settings('teams', 'list_names', {id: -1, items: [], name: ''})
		})

		promise_done(db.get<ObjectStoreSettings>(
			store_settings,
			ObjectStoreKeys.settings_teams_listmembersid
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return set_settings('teams', 'list_members', list)
			}

			return set_settings('teams', 'list_members', {id: -1, items: [], name: ''})
		})
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		db.cursor(store_settings, (cursor) => {
			if (!cursor) return true

			const value = cursor.value.value
			switch (cursor.key as ObjectStoreKeys) {
				case ObjectStoreKeys.settings_string_length: set_settings('string', 'length', value as number); break
				case ObjectStoreKeys.settings_string_animation: set_settings('string', 'animation', value as boolean); break
				case ObjectStoreKeys.settings_string_characters_custom: set_settings('string', 'characters', 'custom', value as string); break
				case ObjectStoreKeys.settings_string_characters_symbols: set_settings('string', 'characters', 'symbols', value as boolean); break
				case ObjectStoreKeys.settings_string_characters_numbers: set_settings('string', 'characters', 'numbers', value as boolean); break
				case ObjectStoreKeys.settings_string_characters_lowercase: set_settings('string', 'characters', 'lowercase', value as boolean); break
				case ObjectStoreKeys.settings_string_characters_uppercase: set_settings('string', 'characters', 'uppercase', value as boolean); break
				case ObjectStoreKeys.settings_numbers_count: set_settings('numbers', 'count', value as number); break
				case ObjectStoreKeys.settings_numbers_animation: set_settings('numbers', 'animation', value as boolean); break
				case ObjectStoreKeys.settings_numbers_type: set_settings('numbers', 'type', value as NumbersRandomizerNumberType); break
				case ObjectStoreKeys.settings_numbers_repeat: set_settings('numbers', 'repeat', value as boolean); break
				case ObjectStoreKeys.settings_numbers_sort: set_settings('numbers', 'sort', value as NumbersRandomizerSort); break
				case ObjectStoreKeys.settings_numbers_prefix: set_settings('numbers', 'prefix', value as string); break
				case ObjectStoreKeys.settings_numbers_suffix: set_settings('numbers', 'suffix', value as string); break
				case ObjectStoreKeys.settings_numbers_separator: set_settings('numbers', 'separator', value as string); break
				case ObjectStoreKeys.settings_numbers_minlength: set_settings('numbers', 'min_length', value as number); break
				case ObjectStoreKeys.settings_numbers_range_min: set_settings('numbers', 'range', 'min', value as number); break
				case ObjectStoreKeys.settings_numbers_range_max: set_settings('numbers', 'range', 'max', value as number); break
				case ObjectStoreKeys.settings_words_count: set_settings('words', 'count', value as number); break
				case ObjectStoreKeys.settings_words_animation: set_settings('words', 'animation', value as boolean); break
				case ObjectStoreKeys.settings_words_repeat: set_settings('words', 'repeat', value as boolean); break
				case ObjectStoreKeys.settings_words_wordcase: set_settings('words', 'wordcase', value as WordsRandomizerWordCase); break
				case ObjectStoreKeys.settings_words_prefix: set_settings('words', 'prefix', value as string); break
				case ObjectStoreKeys.settings_words_suffix: set_settings('words', 'suffix', value as string); break
				case ObjectStoreKeys.settings_words_separator: set_settings('words', 'separator', value as string); break
				case ObjectStoreKeys.settings_selection_count: set_settings('selection', 'count', value as number); break
				case ObjectStoreKeys.settings_selection_animation: set_settings('selection', 'animation', value as boolean); break
				case ObjectStoreKeys.settings_colors_count: set_settings('colors', 'count', value as number); break
				case ObjectStoreKeys.settings_colors_animation: set_settings('colors', 'animation', value as boolean); break
				case ObjectStoreKeys.settings_colors_model: set_settings('colors', 'model', value as ColorsRandomizerColorModel); break
				case ObjectStoreKeys.settings_colors_range_hex_min: set_settings('colors', 'range', 'hex', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_hex_max: set_settings('colors', 'range', 'hex', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_h_min: set_settings('colors', 'range', 'hsl', 'h', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_h_max: set_settings('colors', 'range', 'hsl', 'h', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_s_min: set_settings('colors', 'range', 'hsl', 's', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_s_max: set_settings('colors', 'range', 'hsl', 's', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_l_min: set_settings('colors', 'range', 'hsl', 'l', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_hsl_l_max: set_settings('colors', 'range', 'hsl', 'l', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_r_min: set_settings('colors', 'range', 'rgb', 'r', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_r_max: set_settings('colors', 'range', 'rgb', 'r', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_g_min: set_settings('colors', 'range', 'rgb', 'g', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_g_max: set_settings('colors', 'range', 'rgb', 'g', 'max', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_b_min: set_settings('colors', 'range', 'rgb', 'b', 'min', value as number); break
				case ObjectStoreKeys.settings_colors_range_rgb_b_max: set_settings('colors', 'range', 'rgb', 'b', 'max', value as number); break
				case ObjectStoreKeys.settings_teams_count: set_settings('teams', 'count', value as number); break
				case ObjectStoreKeys.settings_teams_animation: set_settings('teams', 'animation', value as boolean); break

				// already init by other function
				case ObjectStoreKeys.settings_teams_listnamesid:
				case ObjectStoreKeys.settings_teams_listmembersid:
				case ObjectStoreKeys.settings_words_listid:
				case ObjectStoreKeys.settings_selection_listid:
				case ObjectStoreKeys.lastoutput_string:
				case ObjectStoreKeys.lastoutput_numbers:
				case ObjectStoreKeys.lastoutput_words:
				case ObjectStoreKeys.lastoutput_selection:
				case ObjectStoreKeys.lastoutput_colors:
				case ObjectStoreKeys.lastoutput_teams:
				case ObjectStoreKeys.settings_lastpage:
			}

			return true
		})
	}

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		for (const item of items) {
			idb_store_put(store_settings, { key: item[0], value: item[1] })
		}
	}

	function export_list(list: ItemList): void {
		const url = url_create(new Blob(
			[array_join(list.items, '\n')],
			{ type: 'text/csv'}
		))
		url_download_file(url, 'list.csv')
		url_revoke(url)
	}

	function edit_list(ev: Event): void {
		const name = string_trim(textfield_editlistname_ref.value)
		const id = selected_list_to_edit().id
		if (string_length(name) == 0) {
			element_focus(textfield_editlistname_ref)
			open_toast(ev, toast_listnameempty_ref)
			return
		}

		const items: string[] = array_filter(
			string_split(areatextfield_edititemlist_ref.value, /[\n,]/gs),
			v => string_length(string_trim(v)) > 0
		)
		if (array_length(items) == 0) {
			element_focus(areatextfield_edititemlist_ref)
			open_toast(ev, toast_listhavenoitems_ref)
			return
		}

		for (const list of lists) {
			if (list.name != name || list.id == id) continue;

			element_focus(textfield_editlistname_ref)
			open_toast(ev, toast_listnamealreadyexist_ref)
			return
		}

		close_dialog(dialog_edit_ref)

		const new_list: ItemList = {id, name, items}
		const index = array_find_index(lists, list => list.id == id)
		if (index >= 0) set_lists(lists => array_sort([
			...array_concat(array_slice(lists, 0, index), array_slice(lists, index + 1)),
			new_list
		], (a, b) => string_locale_compare(a.name, b.name)))

		if (settings.words.list.id == id) command(Commands.change_settings_words_list, new_list)
		if (settings.selection.list.id == id) command(Commands.change_settings_selection_list, new_list)
		if (settings.teams.list_names.id == id) command(Commands.change_settings_teams_listnames, new_list)
		if (settings.teams.list_members.id == id) command(Commands.change_settings_teams_listmembers, new_list)

		open_toast(ev, toast_listedited_ref)

		const store_lists = db.write_store(ObjectStoreNames.lists)
		if (store_lists) idb_store_put(store_lists, new_list)
	}

	function open_edit_dialog(ev: Event, list: ItemList): void {
		set_selected_list_to_edit(list)
		change_textfield_value(textfield_editlistname_ref, list.name)
		change_areatextfield_value(areatextfield_edititemlist_ref, array_join(list.items, ', '))
		open_dialog(ev, dialog_edit_ref, {
			important: true
		})
	}

	function delete_list(ev: Event, list: ItemList): void {
		const index = array_find_index(lists, v => v.id == list.id)
		if (index < 0) return;

		set_lists(lists => array_concat(array_slice(lists, 0, index), array_slice(lists, index + 1)))

		const is_no_more_lists = array_length(lists) == 0
		const new_list = is_no_more_lists? {id: -1, name: '', items: []} : lists[0]
		if (is_no_more_lists) close_dialog(dialog_lists_ref)

		if (settings.words.list.id == list.id) command(Commands.change_settings_words_list, {...new_list})
		if (settings.selection.list.id == list.id) command(Commands.change_settings_selection_list, {...new_list})
		if (settings.teams.list_names.id == list.id) command(Commands.change_settings_teams_listnames, {...new_list})
		if (settings.teams.list_members.id == list.id) command(Commands.change_settings_teams_listmembers, {...new_list})

		open_toast(ev, toast_listdeleted_ref)

		const store_lists = db.write_store(ObjectStoreNames.lists)
		if (store_lists) idb_store_delete(store_lists, list.id)
	}

	function open_delete_dialog(ev: Event, list: ItemList): void {
		set_selected_list_to_delete(list)
		open_dialog(ev, dialog_deletelistwarning_ref, {
			important: true
		})
	}

	function add_new_list(ev: MouseEvent): void {
		const value = textfield_newlistname_ref.value
		const name = string_trim(value)
		if (string_length(name) == 0) {
			element_focus(textfield_newlistname_ref)
			open_toast(ev, toast_listnameempty_ref)
			return
		}

		const items: string[] = array_filter(
			string_split(value, /[\n,]/gs),
			v => string_length(string_trim(v)) > 0
		)
		if (array_length(items) == 0) {
			element_focus(areatextfield_newitemlist_ref)
			open_toast(ev, toast_listhavenoitems_ref)
			return
		}

		for (const list of lists) {
			if (list.name != name) continue;

			element_focus(textfield_newlistname_ref)
			open_toast(ev, toast_listnamealreadyexist_ref)
			return
		}

		close_dialog(dialog_add_ref)

		let id = 0
		for (const list of lists) {
			if (list.id <= id) continue
			id = list.id
		}
		id += 1
		const new_lists: ItemList = {id, name, items}
		open_toast(ev, toast_newlistadded_ref)
		set_lists(l => array_sort([...l, {id, name, items}], (a, b) => string_locale_compare(a.name, b.name)))

		const store_lists = db.write_store(ObjectStoreNames.lists)
		if (store_lists) idb_store_put(store_lists, new_lists)
	}

	function open_add_dialog(ev: Event): void {
		change_textfield_value(textfield_newlistname_ref, '')
		change_areatextfield_value(areatextfield_newitemlist_ref, '')
		open_dialog(ev, dialog_add_ref)
	}

	function view_list(ev: Event, list: ItemList): void {
		set_list_viewitem(list)
		open_dialog(ev, dialog_viewitemlist_ref)
	}

	async function listitem_from_csv_file(): Promise<string[]> {
		let text = ''

		try {
			const files = await file_open('text/csv', true)
			if (!files) return [];

			for (const file of files!) {
				if (file.type != 'text/csv') continue;
				text += await file_read_as_text(file)
			}
		} catch (e) {}

		return array_filter(
			string_split(text, /[\n,]/gs),
			v => string_length(string_trim(v)) > 0
		)
	}

	function reset_lists(ev: Event): void {
		const default_list_ids = array_map(DEFAULT_LISTS, v => v.id)
		for (const list of lists) {
			if (array_includes(default_list_ids, list.id)) continue

			delete_list(ev, list)
		}
		set_lists(array_map(DEFAULT_LISTS, l => ({id: l.id, name: l.name, items: [...l.items]})))

		const store_lists = db.write_store(ObjectStoreNames.lists)
		if (store_lists == null) return

		for (const list of lists){
			idb_store_put(store_lists, {
				id: list.id,
				name: list.name,
				items: [...list.items]
			} satisfies ItemList)
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.reset_list: {
			reset_lists(args[0] as Event)
			break
		}
		case Commands.add_list: {
			open_add_dialog(args[0] as Event)
			break
		}
		case Commands.export_list: {
			export_list(args[0] as ItemList)
			break
		}
		case Commands.edit_list: {
			if (array_length(args) > 1) return open_edit_dialog(args[0] as Event, args[1] as ItemList)
			open_dialog(args[0] as Event, dialog_lists_ref)
			break
		}
		case Commands.view_list:{
			view_list(args[0] as Event, args[1] as ItemList)
			break
		}
		case Commands.delete_list: {
			open_delete_dialog(args[0] as Event, args[1] as ItemList)
			break
		}
		case Commands.toggle_settings_animation: {
			switch (randomizer()) {
				case randomizer_numbers: {
					set_settings('numbers', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_numbers_animation, settings.numbers.animation])
					break
				}
				case randomizer_words: {
					set_settings('words', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_words_animation, settings.words.animation])
					break
				}
				case randomizer_string: {
					set_settings('string', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_string_animation, settings.string.animation])
					break
				}
				case randomizer_selection: {
					set_settings('selection', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_selection_animation, settings.selection.animation])
					break
				}
				case randomizer_colors: {
					set_settings('colors', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_colors_animation, settings.colors.animation])
					break
				}
				case randomizer_teams: {
					set_settings('teams', 'animation', a => !a)
					save_settings([ObjectStoreKeys.settings_teams_animation, settings.teams.animation])
					break
				}
			}
			break
		}
		case Commands.toggle_settings_repeat: {
			if (randomizer() == randomizer_numbers) {
				set_settings('numbers', 'repeat', r => !r)
				save_settings([ObjectStoreKeys.settings_numbers_repeat, settings.numbers.repeat])
			}
			else if (randomizer() == randomizer_words) {
				set_settings('words', 'repeat', r => !r)
				save_settings([ObjectStoreKeys.settings_words_repeat, settings.words.repeat])
			}
			break
		}
		case Commands.change_settings_numbers_sort: {
			set_settings('numbers', 'sort', args[0] as NumbersRandomizerSort)
			save_settings([ObjectStoreKeys.settings_numbers_sort, args[0]])
			break
		}
		case Commands.change_settings_numbers_type: {
			set_settings('numbers', 'type', args[0] as NumbersRandomizerNumberType)
			save_settings([ObjectStoreKeys.settings_numbers_type, args[0]])
			break
		}
		case Commands.change_settings_prefix: {
			if (randomizer() == randomizer_numbers) {
				set_settings('numbers', 'prefix', args[0] as string)
				save_settings([ObjectStoreKeys.settings_numbers_prefix, args[0]])
			}
			else if (randomizer() == randomizer_words) {
				set_settings('words', 'prefix', args[0] as string)
				save_settings([ObjectStoreKeys.settings_words_prefix, args[0]])
			}
			break
		}
		case Commands.change_settings_suffix:{
			if (randomizer() == randomizer_numbers) {
				set_settings('numbers', 'suffix', args[0] as string)
				save_settings([ObjectStoreKeys.settings_numbers_suffix, args[0]])
			}
			else if (randomizer() == randomizer_words) {
				set_settings('words', 'suffix', args[0] as string)
				save_settings([ObjectStoreKeys.settings_words_suffix, args[0]])
			}
			break
		}
		case Commands.change_settings_separator:{
			if (randomizer() == randomizer_numbers) {
				set_settings('numbers', 'separator', args[0] as string)
				save_settings([ObjectStoreKeys.settings_numbers_separator, args[0]])
			}
			else if (randomizer() == randomizer_words) {
				set_settings('words', 'separator', args[0] as string)
				save_settings([ObjectStoreKeys.settings_words_separator, args[0]])
			}
			break
		}
		case Commands.change_settings_words_wordcase:{
			set_settings('words', 'wordcase', args[0] as WordsRandomizerWordCase)
			save_settings([ObjectStoreKeys.settings_words_wordcase, args[0]])
			break
		}
		case Commands.change_settings_colors_model: {
			set_settings('colors', 'model', args[0] as ColorsRandomizerColorModel)
			save_settings([ObjectStoreKeys.settings_colors_model, args[0]])
			break
		}
		case Commands.change_settings_words_list: {
			set_settings('words', 'list', args[0] as ItemList)
			save_settings([ObjectStoreKeys.settings_words_listid, (args[0] as ItemList).id])
			break
		}
		case Commands.change_settings_string_length: {
			set_settings('string', 'length', args[0] as number)
			save_settings([ObjectStoreKeys.settings_string_length, args[0]])
			break
		}
		case Commands.change_settings_string_characters_custom: {
			set_settings('string', 'characters', 'custom', args[0] as string)
			save_settings([ObjectStoreKeys.settings_string_characters_custom, args[0]])
			break
		}
		case Commands.toggle_settings_string_characters_symbols: {
			set_settings('string', 'characters', 'symbols', v => !v)
			save_settings([ObjectStoreKeys.settings_string_characters_symbols, settings.string.characters.symbols])
			break
		}
		case Commands.toggle_settings_string_characters_numbers: {
			set_settings('string', 'characters', 'numbers', v => !v)
			save_settings([ObjectStoreKeys.settings_string_characters_numbers, settings.string.characters.numbers])
			break
		}
		case Commands.toggle_settings_string_characters_lowercase: {
			set_settings('string', 'characters', 'lowercase', v => !v)
			save_settings([ObjectStoreKeys.settings_string_characters_lowercase, settings.string.characters.lowercase])
			break
		}
		case Commands.toggle_settings_string_characters_uppercase: {
			set_settings('string','characters', 'uppercase', v => !v)
			save_settings([ObjectStoreKeys.settings_string_characters_uppercase, settings.string.characters.uppercase])
			break
		}
		case Commands.change_settings_string_characters_default: {
			set_settings('string', 'characters', c => ({
				...c,
				alphabetLowercase: true,
				alphabetUppercase: true,
				numbers: true,
			}))
			save_settings(
				[ObjectStoreKeys.settings_string_characters_lowercase, true],
				[ObjectStoreKeys.settings_string_characters_uppercase, true],
				[ObjectStoreKeys.settings_string_characters_numbers, true],
			)
			break
		}
		case Commands.change_settings_numbers_count: {
			set_settings('numbers', 'count', args[0] as number)
			save_settings([ObjectStoreKeys.settings_numbers_count, args[0]])
			break
		}
		case Commands.change_settings_numbers_minlength: {
			set_settings('numbers', 'min_length', args[0] as number)
			save_settings([ObjectStoreKeys.settings_numbers_minlength, args[0]])
			break
		}
		case Commands.change_settings_numbers_range: {
			set_settings('numbers', 'range', {min: args[0] as number, max: args[1] as number})
			save_settings(
				[ObjectStoreKeys.settings_numbers_range_min, args[0]],
				[ObjectStoreKeys.settings_numbers_range_max, args[1]]
			)
			break
		}
		case Commands.change_settings_words_count: {
			set_settings('words', 'count', args[0] as number)
			save_settings([ObjectStoreKeys.settings_words_count, args[0]])
			break
		}
		case Commands.change_settings_colors_count: {
			set_settings('colors', 'count', args[0] as number)
			save_settings([ObjectStoreKeys.settings_colors_count, args[0]])
			break
		}
		case Commands.change_settings_colors_range_hex: {
			set_settings('colors', 'range', 'hex', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_hex_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_hex_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_hsl_h: {
			set_settings('colors', 'range', 'hsl', 'h', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_hsl_h_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_hsl_h_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_hsl_s: {
			set_settings('colors', 'range', 'hsl', 's', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_hsl_s_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_hsl_s_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_hsl_l: {
			set_settings('colors', 'range', 'hsl', 'l', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_hsl_l_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_hsl_l_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_rgb_r: {
			set_settings('colors', 'range', 'rgb', 'r', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_rgb_r_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_rgb_r_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_rgb_g: {
			set_settings('colors', 'range', 'rgb', 'g', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_rgb_g_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_rgb_g_max, args[1]],
			)
			break
		}
		case Commands.change_settings_colors_range_rgb_b:{
			set_settings('colors', 'range', 'rgb', 'b', { min: args[0] as number, max: args[1] as number })
			save_settings(
				[ObjectStoreKeys.settings_colors_range_rgb_b_min, args[0]],
				[ObjectStoreKeys.settings_colors_range_rgb_b_max, args[1]],
			)
			break
		}
		case Commands.change_settings_selection_list: {
			const [list] = args as [ItemList]
			const list_length = array_length(list.items)
			const list_id = list.id
			set_settings('selection', 'list', list)
			if (list_length < settings.selection.count) {
				set_settings('selection', 'count', list_length)
				save_settings(
					[ObjectStoreKeys.settings_selection_listid, list_id],
					[ObjectStoreKeys.settings_selection_count, list_length]
				)
				return
			}

			save_settings([ObjectStoreKeys.settings_selection_listid, list_id])
			break
		}
		case Commands.change_settings_selection_count: {
			set_settings('selection', 'count', args[0] as number)
			save_settings([ObjectStoreKeys.settings_selection_count, args[0] as number])
			break
		}
		case Commands.change_settings_teams_listnames: {
			set_settings('teams', 'list_names', args[0] as ItemList)
			save_settings([ObjectStoreKeys.settings_teams_listnamesid, (args[0] as ItemList).id])
			break
		}
		case Commands.change_settings_teams_listmembers: {
			const [list] = args as [ItemList]
			const list_length = array_length(list.items)
			const list_id = list.id
			set_settings('teams', 'list_members', list)
			if (list_length < settings.teams.count) {
				set_settings('teams', 'count', list_length)
				save_settings(
					[ObjectStoreKeys.settings_teams_listmembersid, list_id],
					[ObjectStoreKeys.settings_teams_count, list_length]
				)
				return
			}

			save_settings([ObjectStoreKeys.settings_teams_listmembersid, list_id])
			break
		}
		case Commands.change_settings_teams_count: {
			set_settings('teams', 'count', args[0] as number)
			save_settings([ObjectStoreKeys.settings_teams_count, args[0] as number])
			break
		}
		case Commands.toggle_navigation_expand:{
			set_is_sidenavigation_expanded(v => !v)
			break
		}
		case Commands.generate: {
			return on_generate(args[0] as Event)
		}
		case Commands.stop_generate: {
			return on_stop_generate()
		}
		default: return
	}}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	const Dialogs: VoidComponent = () => {
		const button_lists_close_id = createUniqueId()
		const button_lists_addnewlist_id = createUniqueId()
		const button_deletelistwarning_cancel_id = createUniqueId()
		const button_deletelistwarning_delete_id = createUniqueId()
		const button_add_cancel_id = createUniqueId()
		const button_add_importcsv_id = createUniqueId()
		const button_add_preview_id = createUniqueId()
		const button_add_save_id = createUniqueId()
		const button_edit_cancel_id = createUniqueId()
		const button_edit_importcsv_id = createUniqueId()
		const button_edit_preview_id = createUniqueId()
		const button_edit_save_id = createUniqueId()
		const button_viewitemlist_close_id = createUniqueId()
		const button_viewitemlist_export_id = createUniqueId()
		const button_viewitemlist_edit_id = createUniqueId()
		return (<>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_lists_ref = r}
				c_header="Lists"
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_lists_close_id:
							close_dialog(dialog_lists_ref)
							break
						case button_lists_addnewlist_id:
							close_dialog(dialog_lists_ref)
							open_add_dialog(ev)
							break
						default:
							const data_list_export_index = element_dataset(button, 'listExportIndex')
							if (data_list_export_index) {
								const index = number_parse(data_list_export_index, true)
								if (number_is_not_defined(index)) return

								export_list(lists[index])
								return
							}

							const data_list_view_index = element_dataset(button, 'listViewIndex')
							if (data_list_view_index) {
								const index = number_parse(data_list_view_index, true)
								if (number_is_not_defined(index)) return

								view_list(ev, lists[index])
								return
							}

							const data_list_edit_index = element_dataset(button, 'listEditIndex')
							if (data_list_edit_index) {
								const index = number_parse(data_list_edit_index, true)
								if (number_is_not_defined(index)) return

								open_edit_dialog(ev, lists[index])
								return
							}

							const data_list_delete_index = element_dataset(button, 'listDeleteIndex')
							if (data_list_delete_index) {
								const index = number_parse(data_list_delete_index, true)
								if (number_is_not_defined(index)) return

								open_delete_dialog(ev, lists[index])
								return
							}
					}
				}}
				c_actions={<>
					<Button
						id={button_lists_close_id}
						c_variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_lists_addnewlist_id}
						c_variant={ButtonVariant.filled}>
						Add new list
					</Button>
				</>}>
				<Tooltip>
					<For each={lists}>{(list, i) => <>
						<Show when={i() != 0}><Divider /></Show>
						<List
							c_trailing={<>
								<IconButton data-list-export-index={i()} data-tooltip="Export list" c_code={0xE0CF}/>
								<IconButton data-list-view-index={i()} data-tooltip="View list" c_code={0xE77B}/>
								<IconButton data-list-edit-index={i()} data-tooltip="Edit list" c_code={0xE739}/>
								<IconButton data-list-delete-index={i()} data-tooltip="Delete list" c_code={0xE59D}/>
							</>}
							c_subtitle={array_length(list.items) + ' item' + (array_length(list.items) > 1? 's' : '')}>
							{list.name}
						</List>
					</>}</For>
				</Tooltip>
			</Dialog>
			<Dialog
				ref={r => dialog_deletelistwarning_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_deletelistwarning_cancel_id:
							close_dialog(dialog_deletelistwarning_ref)
							break
						case button_deletelistwarning_delete_id:
							close_dialog(dialog_deletelistwarning_ref)
							delete_list(ev, selected_list_to_delete())
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_deletelistwarning_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_deletelistwarning_delete_id}
						c_variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}
				c_header="Delete list">
				Are you sure want to delete this list?
				<List
					classList={classlist_module(CSS.app_delete_list)}
					c_subtitle={array_length(selected_list_to_delete().items) + ' item' + (array_length(selected_list_to_delete().items) > 1? 's' : '')}>
					{selected_list_to_delete().name}
				</List>
			</Dialog>
			<Dialog
				ref={r => dialog_add_ref = r}
				style={{width: '500px'}}
				onClick={async ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_add_cancel_id:
							close_dialog(dialog_add_ref)
							break
						case button_add_importcsv_id:
							const text = await listitem_from_csv_file()
							change_areatextfield_value(
								areatextfield_newitemlist_ref,
								array_join(array_filter(
									[areatextfield_newitemlist_ref.value, ...text],
									v => string_length(string_trim(v)) > 0
								), ', ')
							)
							break
						case button_add_preview_id:
							set_list_viewitem({
								id: -1,
								name: textfield_newlistname_ref.value,
								items: array_filter(
									string_split(areatextfield_newitemlist_ref.value, /[\n,]/gs),
									v => string_length(string_trim(v)) > 0
								)
							})
							open_dialog(ev, dialog_previewitemlist_ref)
							break
						case button_add_save_id:
							add_new_list(ev)
							break
					}
				}}
				c_actions={<>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_add_cancel_id}>
						Cancel
					</Button>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_add_importcsv_id}>
						Import CSV
					</Button>
					<Button
						id={button_add_preview_id}
						c_variant={ButtonVariant.tonal}>
						Preview
					</Button>
					<Button
						id={button_add_save_id}
						c_variant={ButtonVariant.filled}>
						Save
					</Button>
				</>}
				c_header="New list">
				<TextField ref={r => textfield_newlistname_ref = r} c_label="List name" />
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areatextfield_newitemlist_ref = r}
					c_label="Items"
					placeholder={"Item1, Item2,\nItem3, Item 4\nItem 5"}
					c_message={"Info: Each item separated by comma or new line"}
					c_min_line={5}
					c_max_line={5}
				/>
			</Dialog>
			<Dialog
				ref={r => dialog_edit_ref = r}
				style={{width: '500px'}}
				onClick={async ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_edit_cancel_id:
							close_dialog(dialog_edit_ref)
							break
						case button_edit_importcsv_id:
							const text = await listitem_from_csv_file()
							change_areatextfield_value(
								areatextfield_edititemlist_ref,
								array_join(array_filter(
									[areatextfield_newitemlist_ref.value, ...text],
									v => string_length(string_trim(v)) > 0
								), ', ')
							)
							break
						case button_edit_preview_id:
							set_list_viewitem({
								id: -1,
								name: textfield_editlistname_ref.value,
								items: array_filter(
									string_split(areatextfield_edititemlist_ref.value, /[\n,]/gs),
									v => string_length(string_trim(v)) > 0
								)
							})
							open_dialog(ev, dialog_previewitemlist_ref)
							break
						case button_edit_save_id:
							edit_list(ev)
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_edit_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_edit_importcsv_id}
						c_variant={ButtonVariant.tonal}>
						Import CSV
					</Button>
					<Button
						id={button_edit_preview_id}
						c_variant={ButtonVariant.tonal}>
						Preview
					</Button>
					<Button
						id={button_edit_save_id}
						c_variant={ButtonVariant.filled}>
						Save
					</Button>
				</>}
				c_header="Edit list">
				<TextField
					ref={r => textfield_editlistname_ref = r}
					placeholder={selected_list_to_edit().name}
					c_label="List name"
				/>
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areatextfield_edititemlist_ref = r}
					c_label="Items"
					placeholder={array_join(selected_list_to_edit().items, ', ')}
					c_message={"Info: Each item separated by comma or new line"}
					c_min_line={5}
					c_max_line={5}
				/>
			</Dialog>
			<Dialog
				ref={r => dialog_viewitemlist_ref = r}
				style={{width: '720px'}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_viewitemlist_close_id:
							close_dialog(dialog_viewitemlist_ref)
							break
						case button_viewitemlist_edit_id:
							close_dialog(dialog_viewitemlist_ref)
							open_edit_dialog(ev, list_viewitem())
							break
						case button_viewitemlist_export_id:
							export_list(list_viewitem())
							break
					}
				}}
				c_actions={<>
					<Button
						id={button_viewitemlist_close_id}
						c_variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={button_viewitemlist_export_id}
						c_variant={ButtonVariant.tonal}>
						Export
					</Button>
					<Button
						id={button_viewitemlist_edit_id}
						c_variant={ButtonVariant.filled}>
						Edit
					</Button>
				</>}
				c_header={list_viewitem().name}>
				<div class={CSS.app_view_list}>
					<For each={[...list_viewitem().items].sort()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
			<Dialog
				ref={r => dialog_previewitemlist_ref = r}
				style={{width: '720px'}}
				c_actions={<Button
					onClick={() => close_dialog(dialog_previewitemlist_ref)}
					c_variant={ButtonVariant.filled}>
					Close
				</Button>}
				c_header={list_viewitem().name}>
				<div class={CSS.app_view_list}>
					<For each={[...list_viewitem().items].sort()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
		</>)
	}

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast c_leading={<Icon c_filled c_code={0xE4BE}/>} ref={r => toast_listnameempty_ref = r}>List name is empty</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xF0AA}/>} ref={r => toast_listhavenoitems_ref = r}>List items is empty</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xEBA8}/>} ref={r => toast_listnamealreadyexist_ref = r}>List name already exist</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xF09C}/>} ref={r => toast_listedited_ref = r}>List edited</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xE59D}/>} ref={r => toast_listdeleted_ref = r}>List deleted</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xF0A6}/>} ref={r => toast_newlistadded_ref = r}>New list added</Toast>
			<Toast c_leading={<Icon c_filled c_code={0xE069}/>} ref={r => toast_nolistselected_ref = r}>No list selected</Toast>
		</>)
	}

	return (<>
		<App
			c_appbar={<AppBar
				is_generating={is_generating()}
				randomizer={randomizer()}
				on_copy_result={on_copy_result}
				settings={[settings, set_settings]}
				command={command}
				on_change_randomizer={on_change_randomizer}
			/>}
			c_floating_action_button={<FloatingActionButton
				classList={classlist_module(CSSAnimation.btn_rotate_full_icon, CSS.app_fab)}
				data-g-keep-pointer-event={attr_set_if_exist(is_generating())}
				c_variant={ButtonVariant.filled}
				onClick={() => {
					if (is_generating()) return command(Commands.stop_generate)
					command(Commands.generate)
				}}>
				<Icon
					c_filled
					classList={classlist_module(CSS.app_generate_icon)}
					data-rotate={attr_set_if_exist(is_generating())}
					c_code={0xE143}
				/>
				<Show when={is_generating()} fallback="Generate">Generating</Show>
			</FloatingActionButton>}
			c_left_sidebar={<SideNavigation
				expanded={is_sidenavigation_expanded()}
				randomizer={randomizer()}
				on_change_randomizer={on_change_randomizer}
			/>}>
			<div class={CSS.app_body}>
				<Control
					randomizer={randomizer()}
					settings={[settings, set_settings]}
					lists={[lists, set_lists]}
					command={command}
				/>
				<ResultComponent
					randomizer={randomizer()}
					result={[output, set_output]}
					settings={[settings, set_settings]}
				/>
			</div>
		</App>
		<Dialogs />
		<Toasts />
	</>)
}

export default _