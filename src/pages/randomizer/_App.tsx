import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js";

import type { HEXColor } from "@/types/color";
import type { ItemList, Result, Settings } from "./_types";
import { _string, _characters, _numbers, _symbols, _length, _floor, _range, _max, _min, _count, _repeat, _includes, _push, _sort, _ascending, _descending, _map, _prefix, _toString, _numberType, _padStart, _suffix, _join, _separator, _colors, _round, _colorModel, _hex, _rgb, _hsl, _words, _selection, _teams, _animation, _result, _settings, _decimal, _none, _open, _key, _value, _createObjectStore, _id, _list, _lists, _lastResult, _isOpen, _readonly, _objectStore, _transaction, _get, _then, _color, _readwrite, _put, _add, _name, _members, _getAll, _namesList, _membersList, _alphabetLowercase, _alphabetUppercase, _customCharacter, _minDecimalLength, _splice, _lowercase, _titlecase, _togglecase, _uppercase, _wordCase, _h, _l, _s, _r, _b, _g, _cursor, _test, _tonal, _filled, _manual, _items, _accept, _file, _input, _type, _readAsText, _target, _onerror, _onabort, _onload, _replace, _split, _substring, _filter, _trim, _focus, _delete, _clipboard, _writeText, _noPointerEvent, _generate, _stopGenerate, _randomizer, _writeObjectStore, _readObjectStore, _findIndex, _concat, _slice, _localeCompare, _animate, _finished, _remove, _splash, _spring } from "@/constants/string";
import { RGB_to_HEX, HSL_to_HEX } from "@/utils/color";
import { setTimeInterval, clearTimeInterval, setMicrotask } from "@/utils/timeout";
import { createStore } from "solid-js/store";
import { RandomizerType, WordsRandomizerWordCase, NumbersRandomizerNumberType, NumbersRandomizerSort, ColorsRandomizerColorModel, Commands } from "./_enums";
import { mathFloor, mathRandom } from "@/utils/math";
import { PERSON_NAMES, TEAMS_NAMES, ANIMALS, LOREM_IPSUM, DEFAULT_LISTS } from "./_constants";
import { ObjectStoreNames, ObjectStoreKeys, type ObjectStoreLists, type ObjectStoreSettings, type ObjectStoreLastResult } from "./_storage";
import { _settings_lastPage, _lastResult_string, _lastResult_numbers, _lastResult_words, _lastResult_selection, _lastResult_colors, _lastResult_teams, _settings_words_listId, _settings_selection_listId, _settings_teams_membersListId, _settings_teams_namesListId, _settings_numbers_repeat, _settings_words_repeat, _settings_numbers_sort, _settings_numbers_animation, _settings_words_animation, _settings_string_animation, _settings_selection_animation, _settings_colors_animation, _settings_teams_animation, _settings_numbers_numberType, _settings_numbers_prefix, _settings_words_prefix, _settings_numbers_suffix, _settings_words_suffix, _settings_numbers_separator, _settings_words_separator, _settings_words_wordCase, _settings_colors_colorModel, _settings_string_length, _settings_string_characters_symbols, _settings_string_characters_numbers, _settings_string_characters_alphabetLowercase, _settings_string_characters_alphabetUppercase, _settings_numbers_count, _settings_numbers_minDecimalLength, _settings_numbers_range_min, _settings_numbers_range_max, _settings_words_count, _settings_colors_count, _settings_colors_range_hex_min, _settings_colors_range_hex_max, _settings_colors_range_hsl_h_min, _settings_colors_range_hsl_h_max, _settings_colors_range_hsl_l_max, _settings_colors_range_hsl_l_min, _settings_colors_range_hsl_s_max, _settings_colors_range_hsl_s_min, _settings_colors_range_rgb_r_max, _settings_colors_range_rgb_r_min, _settings_colors_range_rgb_b_max, _settings_colors_range_rgb_b_min, _settings_colors_range_rgb_g_max, _settings_colors_range_rgb_g_min, _settings_string_characters_customCharacter, _settings_selection_count, _settings_teams_count, _add_list, _change_settings_colors_colorModel, _change_settings_colors_count, _change_settings_colors_range_hex, _change_settings_colors_range_hsl_h, _change_settings_colors_range_hsl_l, _change_settings_colors_range_hsl_s, _change_settings_colors_range_rgb_b, _change_settings_colors_range_rgb_g, _change_settings_colors_range_rgb_r, _change_settings_numbers_count, _change_settings_numbers_minDecimalLength, _change_settings_numbers_range, _change_settings_numbers_sort, _change_settings_numbers_type, _change_settings_prefix, _change_settings_selection_count, _change_settings_selection_list, _change_settings_separator, _change_settings_string_characters_customCharacters, _change_settings_string_characters_toDefault, _change_settings_string_length, _change_settings_suffix, _change_settings_teams_count, _change_settings_teams_membersList, _change_settings_teams_namesList, _change_settings_words_count, _change_settings_words_list, _change_settings_words_wordCase, _delete_list, _edit_list, _export_list, _reset_list, _toggle_navigation_expand, _toggle_settings_animation, _toggle_settings_repeat, _toggle_settings_string_characters_alphabetLowercase, _toggle_settings_string_characters_alphabetUppercase, _toggle_settings_string_characters_numbers, _toggle_settings_string_characters_symbols, _view_list } from "./_string";
import { stringToLowerCase, stringToUpperCase, stringToToggleCase, stringToTitleCase } from "@/utils/string";
import { createObjectURL, downloadFileByURL, revokeObjectURL } from "@/utils/url";
import { addClassListModule, getElementById } from "@/utils/element";
import { openFile, readFileAsText } from "@/utils/file";
import { IDB } from "@/utils/indexeddb";
import { DatabaseNames } from "@/enums/storage";
import { getDocumentBody, getNavigator } from "@/constants/window";
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes";
import { BodyAttributes } from "@/enums/attributes";
import { AnimationEffectTiming } from "@/enums/animation";
import { ElementIds } from "@/enums/ids";

import App from "@/components/App";
import { TextTooltip } from "@/components/Tooltip";
import Icon from "@/components/Icon";
import Divider from "@/components/Divider";
import Dialog, { closeDialog, openDialog } from "@/components/Dialog";
import Button, { ButtonVariant, FloatingActionButton, IconButton } from "@/components/Button";
import List from "@/components/List";
import TextField, { AreaTextField, changeAreaTextFieldValue, changeTextFieldValue } from "@/components/TextField";
import Toast, { openToast } from "@/components/Toast";
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Control from './_Control'
import ResultComponent from './_Result'
import CSSAnimation from "@/styles/animation.module.scss";
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_randomizer], 1)
	const [randomizerType, setRandomizerType] = createSignal<RandomizerType>(RandomizerType[_string])
	const [viewItemList, setViewItemList] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selectedListToDelete, setSelectedListToDelete] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selectedListToEdit, setSelectedListToEdit] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [isExpandNavigation, setIsExpandNavigation] = createSignal<boolean>(true)
	const [isGenerating, setIsGenerating] = createSignal<boolean>(false)
	const [lists, setLists] = createStore<ItemList[]>(DEFAULT_LISTS)
	const [settings, setSettings] = createStore<Settings>({
		string: {
			animation: true,
			length: 8,
			characters: {
				alphabetLowercase: true,
				alphabetUppercase: true,
				numbers: true,
				symbols: false,
				customCharacter: '',
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
			wordCase: WordsRandomizerWordCase[_none]
		},
		numbers: {
			animation: true,
			count: 3,
			minDecimalLength: 0,
			numberType: NumbersRandomizerNumberType[_decimal],
			prefix: '',
			range: {
				min: 0,
				max: 200
			},
			repeat: true,
			separator: ', ',
			sort: NumbersRandomizerSort[_none],
			suffix: '',
		},
		colors: {
			animation: true,
			colorModel: ColorsRandomizerColorModel[_rgb],
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
			membersList: {id: 1, name: 'Person', items: [...PERSON_NAMES]},
			namesList: {id: 2, name: 'Teams', items: [...TEAMS_NAMES]},
		}
	})
	const [result, setResult] = createStore<Result>({
		string: '',
		colors: [],
		numbers: '',
		selection: [],
		teams: [],
		words: ''
	})
	let intervalId: number | null = null
	let dialog_lists_ref: HTMLDialogElement
	let dialog_deleteListWarning_ref: HTMLDialogElement
	let dialog_add_ref: HTMLDialogElement
	let dialog_edit_ref: HTMLDialogElement
	let dialog_viewItemList_ref: HTMLDialogElement
	let dialog_previewItemList_ref: HTMLDialogElement
	let toast_listNameEmpty_ref: HTMLDivElement
	let toast_listHaveNoItems_ref: HTMLDivElement
	let toast_listNameAlreadyExist_ref: HTMLDivElement
	let toast_listEdited_ref: HTMLDivElement
	let toast_listDeleted_ref: HTMLDivElement
	let toast_newListAdded_ref: HTMLDivElement
	let toast_noListSelected_ref: HTMLDivElement
	let areaTextField_newItemList_ref: HTMLTextAreaElement
	let areaTextField_editItemList_ref: HTMLTextAreaElement
	let textField_newListName_ref: HTMLInputElement
	let textField_editListName_ref: HTMLInputElement

	function generate(): void {
		if (randomizerType() == RandomizerType[_string]) {
			let text: string = ''
			let charList: string = ''
			const characters = settings[_string][_characters]

			if (characters[_alphabetLowercase]) charList += 'abcdefghijklmnopqrstuvwxyz'
			if (characters[_alphabetUppercase]) charList += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			if (characters[_numbers]) charList += '0123456789'
			if (characters[_symbols]) charList += "<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"
			if (characters[_customCharacter]) charList += characters[_customCharacter]

			for (let i = 0; i < settings[_string][_length]; i++) {
				text += charList[mathFloor(mathRandom() * charList[_length])]
			}

			setResult(_string, text)
		}

		else if (randomizerType() == RandomizerType[_numbers]) {
			const numbers: number[] = []
			const range: number = settings[_numbers][_range][_max] - settings[_numbers][_range][_min]

			for (let i = 0; i < settings[_numbers][_count]; i++) {
				const v: number = settings[_numbers][_range][_min] + 1 + mathFloor(mathRandom() * range)

				if (!settings[_numbers][_repeat] && numbers[_includes](v)) continue

				numbers[_push](v)
			}

			let iteration = 0
			while (numbers[_length] < settings[_numbers][_count] && iteration < settings[_numbers][_count] + 0xff){
				const v: number = settings[_numbers][_range][_min] + 1 + mathFloor(mathRandom() * range)

				if (!settings[_numbers][_repeat] &&
					numbers[_includes](v) &&
					numbers[_length] < range) continue;

				numbers[_push](v)
				++iteration
			}

			if (settings[_numbers][_sort] == NumbersRandomizerSort[_ascending]) numbers[_sort]((a, b) => a - b)
			else if (settings[_numbers][_sort] == NumbersRandomizerSort[_descending]) numbers[_sort]((a, b) => b - a)

			setResult(_numbers, [...numbers][_map](v =>
				settings[_numbers][_prefix] +
				stringToUpperCase(v[_toString](settings[_numbers][_numberType])[_padStart](settings[_numbers][_minDecimalLength], '0')) +
				settings[_numbers][_suffix]
			)[_join](settings[_numbers][_separator]))
		}

		else if (randomizerType() == RandomizerType[_colors]) {
			const s = settings[_colors]
			const colors: HEXColor[] = []
			const randomNumber = (min: number, max: number): number => {
				const range = max - min
				const value = min + 1 + mathFloor(mathRandom() * range)
				return Math[_round](value)
			}

			if (s[_colorModel] == ColorsRandomizerColorModel[_hex]) for (let i = 0; i < s[_count]; i++) {
				const value = randomNumber(s[_range][_hex][_min], s[_range][_hex][_max])
				colors[_push]('#' + value[_toString](16)[_padStart](6, '0') as HEXColor)
			}
			else if (s[_colorModel] == ColorsRandomizerColorModel[_rgb]) for (let i = 0; i < s[_count]; i++) {
				const r = randomNumber(s[_range][_rgb].r[_min], s[_range][_rgb].r[_max])
				const g = randomNumber(s[_range][_rgb].g[_min], s[_range][_rgb].g[_max])
				const b = randomNumber(s[_range][_rgb].b[_min], s[_range][_rgb].b[_max])
				colors[_push](RGB_to_HEX({r, g, b}))
			}
			else if (s[_colorModel] == ColorsRandomizerColorModel[_hsl]) for (let i = 0; i < s[_count]; i++) {
				const hue = randomNumber(s[_range][_hsl].h[_min], s[_range][_hsl].h[_max]) / 360
				const saturation = randomNumber(s[_range][_hsl].s[_min], s[_range][_hsl].s[_max]) / 100
				const lightness = randomNumber(s[_range][_hsl].l[_min], s[_range][_hsl].l[_max]) / 100
				colors[_push](HSL_to_HEX({h: hue, s: saturation, l: lightness}))
			}

			setResult(_colors, colors)
		}

		else if (randomizerType() == RandomizerType[_words]) {
			const words: string[] = []
			let members: string[] = [...settings[_words][_list][_items]]

			for (let i = 0; i < settings[_words][_count]; i++) {
				if (i >= settings[_words][_list][_items][_length] && !settings[_words][_repeat]) break;

				const index = mathFloor(mathRandom() * (members[_length] - 1))
				const member = members[index]

				if (!settings[_words][_repeat]) {
					members[_splice](index, 1)

					if (words[_includes](member)) continue
				}

				words[_push](member)
			}

			members = [...settings[_words][_list][_items]]
			for (let i = 0; i < settings[_words][_count] - words[_length]; i++) {
				const index = mathFloor(mathRandom() * (members[_length] - 1))
				words[_push](members[index])
			}

			setResult(_words, words[_map](text => {
				if (settings[_words][_wordCase] == WordsRandomizerWordCase[_lowercase])
					text = stringToLowerCase(text)
				else if (settings[_words][_wordCase] == WordsRandomizerWordCase[_uppercase])
					text = stringToUpperCase(text)
				else if (settings[_words][_wordCase] == WordsRandomizerWordCase[_togglecase])
					text = stringToToggleCase(text)
				else if (settings[_words][_wordCase] == WordsRandomizerWordCase[_titlecase])
					text = stringToTitleCase(text)

				return settings[_words][_prefix] + text + settings[_words][_suffix]
			})[_join](settings[_words][_separator]))
		}

		else if (randomizerType() == RandomizerType[_selection]) {
			const items = [...settings[_selection][_list][_items]]
			const selectedItems: string[] = []

			if (settings[_selection][_count] == items[_length]) {
				setResult(_selection, items)
				return
			}

			for (let i = 0; i < settings[_selection][_count]; i++) {
				const index = mathFloor(mathRandom() * (items[_length] - 1))
				selectedItems[_push](items[index])
				items[_splice](index, 1)
			}

			setResult(_selection, selectedItems)
		}

		else if (randomizerType() == RandomizerType[_teams]) {
			const names: string[] = [...settings[_teams][_namesList][_items]]
			const members: string[] = [...settings[_teams][_membersList][_items]]
			const teams: {name: string; members: string[]}[] = []
			const minimumMembers = mathFloor(members[_length] / settings[_teams][_count])

			if (names[_length] > settings[_teams][_count]) {
				names[_splice](names[_length] - (names[_length] - settings[_teams][_count]))
			}

			names[_sort]()

			const range = settings[_teams][_count] - names[_length]
			for (let i = 0; i < range; i++) {
				names[_push]('Team #' + (i + 1))
			}

			for (const name of names) {
				const m: string[] = []

				for (let i = 0; i < minimumMembers; i++) {
					const index = mathFloor(mathRandom() * (members[_length] - 1))
					m[_push](members[index])
					members[_splice](index, 1)
				}

				m[_sort]()

				teams[_push]({name, members: m})
			}

			for (const i in members) {
				teams[i][_members][_push](members[i])
			}

			setResult(_teams, teams)
		}
	}

	async function onGenerate(ev: Event): Promise<void> { return new Promise((ok) => {
		setIsGenerating(true)
		setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])

		let type = _string
		if (randomizerType() == RandomizerType[_string]) type = _string
		else if (randomizerType() == RandomizerType[_numbers]) type = _numbers
		else if (randomizerType() == RandomizerType[_words]) {
			type = _words
			if (settings[_words][_list][_id] == -1) {
				openToast(ev, toast_noListSelected_ref)
				return ok()
			}
		}
		else if (randomizerType() == RandomizerType[_selection]) {
			type = _selection
			if (settings[_selection][_list][_id] == -1) {
				openToast(ev, toast_noListSelected_ref)
				return ok()
			}
		}
		else if (randomizerType() == RandomizerType[_colors]) type = _colors
		else if (randomizerType() == RandomizerType[_teams]) {
			type = _teams
			if (settings[_teams][_membersList][_id] == -1 || settings[_teams][_namesList][_id] == -1) {
				openToast(ev, toast_noListSelected_ref)
				return ok()
			}
		}

		if (settings[type as keyof Settings][_animation]){
			const duration = 3000
			const step = 250
			let i = 0
			intervalId = setTimeInterval(() => {

				// max duration: 3 seconds
				if (i >= duration / step) {
					clearTimeInterval(intervalId!)
					addResultToDB()
					setIsGenerating(false)
					removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
					return ok()
				}
				generate()
				++i
			}, step)
			return
		}

		generate()
		addResultToDB()
		removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
		setIsGenerating(false)
		ok()
	})}

	function onStopGenerate(): void {
		setIsGenerating(false)
		removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
		clearTimeInterval(intervalId!)
		addResultToDB()
	}

	async function onCopyResult(): Promise<boolean> {
		const copy = async (text: string) => await getNavigator()[_clipboard][_writeText](text)

		try {
			if (randomizerType() == RandomizerType[_string]) await copy(result[_string])
			else if (randomizerType() == RandomizerType[_numbers]) await copy(result[_numbers])
			else if (randomizerType() == RandomizerType[_words]) await copy(result[_words])
			else if (randomizerType() == RandomizerType[_selection]) await copy(settings[_selection][_list][_items][_map](v => result[_selection][_includes](v)? (v + ' [selected]') : v)[_join]('\n'))
			else if (randomizerType() == RandomizerType[_colors]) await copy(result[_colors][_join]('\n'))
			else if (randomizerType() == RandomizerType[_teams]) await copy(result[_teams][_map](v => '# ' + v[_name] + '\n' + v[_members][_join]('\n') )[_join]('\n\n'))
			return true
		} catch (e) {}

		return false
	}

	function onChangeRandomizer(type: RandomizerType): void {
		setRandomizerType(type)
		const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		store_settings[_put]({
			key: ObjectStoreKeys[_settings_lastPage],
			value: randomizerType()
		})
	}

	function addResultToDB(): void {
		const store_lastResult = db[_writeObjectStore](ObjectStoreNames[_lastResult])
		if (store_lastResult == null) return

		if (randomizerType() == RandomizerType[_string]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_string],
			value: result[_string]
		})
		else if (randomizerType() == RandomizerType[_numbers]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_numbers],
			value: result[_numbers]
		})
		else if (randomizerType() == RandomizerType[_words]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_words],
			value: result[_words]
		})
		else if (randomizerType() == RandomizerType[_selection]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_selection],
			value: [...result[_selection]]
		})
		else if (randomizerType() == RandomizerType[_colors]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_colors],
			value: [...result[_colors]]
		})
		else if (randomizerType() == RandomizerType[_teams]) store_lastResult[_put]({
			key: ObjectStoreKeys[_lastResult_teams],
			value: [...result[_teams][_map](v => ({name: v[_name], members: [...v[_members]]}))]
		})
	}

	async function initDatabase(): Promise<void> {
		db[_open]({
			onSuccess() {
				initLastResult()
				initLastPage()
				getLists()
				initSettings()
			},
			onUpgradeNeeded(_, db) {
				db[_createObjectStore]<ObjectStoreSettings>({
					name: ObjectStoreNames[_settings],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]<ObjectStoreLastResult>({
					name: ObjectStoreNames[_lastResult],
					keyPath: _key,
					indexs: [_key, _value]
				})
				const $lists = db[_createObjectStore]<ObjectStoreLists>({
					name: ObjectStoreNames[_lists],
					keyPath: _id,
					indexs: [_id, _name, _items]
				})

				for (const list of DEFAULT_LISTS) {
					$lists![_put]({
						id: list[_id],
						name: list[_name],
						items: [...list[_items]]
					} satisfies ObjectStoreLists)
				}
			}
		})
	}

	function initLastPage(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return;

		db[_get]<{key: string; value: RandomizerType}>(store_settings, ObjectStoreKeys[_settings_lastPage])[_then](
			(v) => setRandomizerType(r => v? v[_value] : r)
		)
	}

	function initLastResult(): void {
		const store_lastResult = db[_readObjectStore](ObjectStoreNames[_lastResult])
		if (store_lastResult == null) return

		db[_get]<{key: string; value: string}>(store_lastResult, ObjectStoreKeys[_lastResult_string])[_then](
			(v) => setResult(_string, s => v? v[_value] : s)
		)
		db[_get]<{key: string; value: string}>(store_lastResult, ObjectStoreKeys[_lastResult_numbers])[_then](
			(v) => setResult(_numbers, n => v? v[_value] : n)
		)
		db[_get]<{key: string; value: string}>(store_lastResult, ObjectStoreKeys[_lastResult_words])[_then](
			(v) => setResult(_words, w => v? v[_value] : w)
		)
		db[_get]<{key:string; value: string[]}>(store_lastResult, ObjectStoreKeys[_lastResult_selection])[_then](
			(v) => setResult(_selection, s => v? v[_value] : s)
		)
		db[_get]<{key: string; value: HEXColor[]}>(store_lastResult, ObjectStoreKeys[_lastResult_colors])[_then](
			(v) => setResult(_colors, c => v? v[_value] : c)
		)
		db[_get]<{key: string; value: {name: string;members: string[]}[]}>(store_lastResult, ObjectStoreKeys[_lastResult_teams])[_then](
			(v) => setResult(_teams, t => v? v[_value] : t)
		)
	}

	function getLists(): void {
		const store_lists = db[_readObjectStore](ObjectStoreNames[_lists])
		if (store_lists == null) return

		db[_getAll]<ObjectStoreLists>(store_lists)[_then]((v) => {
			if (!v) return;
			setLists([...v])
			getListsSettings()
		})
	}

	function getListsSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db[_get]<ObjectStoreSettings>(store_settings, ObjectStoreKeys[_settings_words_listId])[_then]((v) => {
			if (!v) return;

			const id = (v[_value] as number)
			for (const list of lists) {
				if (list[_id] == id) return setSettings(_words, _list, list)
			}

			return setSettings(_words, _list, {id: -1, items: [], name: ''})
		})
		db[_get]<ObjectStoreSettings>(store_settings, ObjectStoreKeys[_settings_selection_listId])[_then]((v) => {
			if (!v) return;

			const id = (v[_value] as number)
			for (const list of lists) {
				if (list[_id] == id) return setSettings(_selection, _list, list)
			}

			return setSettings(_selection, _list, {id: -1, items: [], name: ''})
		})
		db[_get]<ObjectStoreSettings>(store_settings, ObjectStoreKeys[_settings_teams_namesListId])[_then]((v) => {
			if (!v) return;

			const id = (v[_value] as number)
			for (const list of lists) {
				if (list[_id] == id) return setSettings(_teams, _namesList, list)
			}

			return setSettings(_teams, _namesList, {id: -1, items: [], name: ''})
		})
		db[_get]<ObjectStoreSettings>(store_settings, ObjectStoreKeys[_settings_teams_membersListId])[_then]((v) => {
			if (!v) return;

			const id = (v[_value] as number)
			for (const list of lists) {
				if (list[_id] == id) return setSettings(_teams, _membersList, list)
			}

			return setSettings(_teams, _membersList, {id: -1, items: [], name: ''})
		})
	}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db[_cursor](store_settings, (cursor) => {
			if (!cursor) return true
				 if (cursor[_key] == ObjectStoreKeys[_settings_string_length                        ]) setSettings(_string, _length     , cursor[_value][_value] as number  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_animation                     ]) setSettings(_string, _animation  , cursor[_value][_value] as boolean )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_characters_customCharacter    ]) setSettings(_string, _characters , _customCharacter  , cursor[_value][_value] as string  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_characters_symbols            ]) setSettings(_string, _characters , _symbols          , cursor[_value][_value] as boolean )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_characters_numbers            ]) setSettings(_string, _characters , _numbers          , cursor[_value][_value] as boolean )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_characters_alphabetLowercase  ]) setSettings(_string, _characters , _alphabetLowercase, cursor[_value][_value] as boolean )
			else if (cursor[_key] == ObjectStoreKeys[_settings_string_characters_alphabetUppercase  ]) setSettings(_string, _characters , _alphabetUppercase, cursor[_value][_value] as boolean )

			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_count            ]) setSettings(_numbers, _count             , cursor[_value][_value] as number                      )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_animation        ]) setSettings(_numbers, _animation         , cursor[_value][_value] as boolean                     )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_numberType       ]) setSettings(_numbers, _numberType        , cursor[_value][_value] as NumbersRandomizerNumberType )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_repeat           ]) setSettings(_numbers, _repeat            , cursor[_value][_value] as boolean                     )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_sort             ]) setSettings(_numbers, _sort              , cursor[_value][_value] as NumbersRandomizerSort       )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_prefix           ]) setSettings(_numbers, _prefix            , cursor[_value][_value] as string                      )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_suffix           ]) setSettings(_numbers, _suffix            , cursor[_value][_value] as string                      )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_separator        ]) setSettings(_numbers, _separator         , cursor[_value][_value] as string                      )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_minDecimalLength ]) setSettings(_numbers, _minDecimalLength  , cursor[_value][_value] as number                      )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_range_min        ]) setSettings(_numbers, _range             , _min, cursor[_value][_value] as number                )
			else if (cursor[_key] == ObjectStoreKeys[_settings_numbers_range_max        ]) setSettings(_numbers, _range             , _max, cursor[_value][_value] as number                )

			else if (cursor[_key] == ObjectStoreKeys[_settings_words_count      ]) setSettings(_words, _count       , cursor[_value][_value] as number                  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_animation  ]) setSettings(_words, _animation   , cursor[_value][_value] as boolean                 )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_repeat     ]) setSettings(_words, _repeat      , cursor[_value][_value] as boolean                 )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_wordCase   ]) setSettings(_words, _wordCase    , cursor[_value][_value] as WordsRandomizerWordCase )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_prefix     ]) setSettings(_words, _prefix      , cursor[_value][_value] as string                  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_suffix     ]) setSettings(_words, _suffix      , cursor[_value][_value] as string                  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_words_separator  ]) setSettings(_words, _separator   , cursor[_value][_value] as string                  )

			else if (cursor[_key] == ObjectStoreKeys[_settings_selection_count      ]) setSettings(_selection, _count       , cursor[_value][_value] as number  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_selection_animation  ]) setSettings(_selection, _animation   , cursor[_value][_value] as boolean )

			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_count             ]) setSettings(_colors, _count      , cursor[_value][_value] as number  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_animation         ]) setSettings(_colors, _animation  , cursor[_value][_value] as boolean )
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_colorModel        ]) setSettings(_colors, _colorModel , cursor[_value][_value] as ColorsRandomizerColorModel)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hex_min     ]) setSettings(_colors, _range      , _hex, _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hex_max     ]) setSettings(_colors, _range      , _hex, _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_h_min   ]) setSettings(_colors, _range      , _hsl, _h  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_h_max   ]) setSettings(_colors, _range      , _hsl, _h  , _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_s_min   ]) setSettings(_colors, _range      , _hsl, _s  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_s_max   ]) setSettings(_colors, _range      , _hsl, _s  , _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_l_min   ]) setSettings(_colors, _range      , _hsl, _l  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_hsl_l_max   ]) setSettings(_colors, _range      , _hsl, _l  , _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_r_min   ]) setSettings(_colors, _range      , _rgb, _r  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_r_max   ]) setSettings(_colors, _range      , _rgb, _r  , _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_g_min   ]) setSettings(_colors, _range      , _rgb, _g  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_g_max   ]) setSettings(_colors, _range      , _rgb, _g  , _max, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_b_min   ]) setSettings(_colors, _range      , _rgb, _b  , _min, cursor[_value][_value] as number)
			else if (cursor[_key] == ObjectStoreKeys[_settings_colors_range_rgb_b_max   ]) setSettings(_colors, _range      , _rgb, _b  , _max, cursor[_value][_value] as number)

			else if (cursor[_key] == ObjectStoreKeys[_settings_teams_count      ]) setSettings(_teams, _count       , cursor[_value][_value] as number  )
			else if (cursor[_key] == ObjectStoreKeys[_settings_teams_animation  ]) setSettings(_teams, _animation   , cursor[_value][_value] as boolean )

			// init by `getListsSettings()`
			// else if (cursor[_key] == ObjectStoreKeys[_settings_words_listId]) {}
			// else if (cursor[_key] == ObjectStoreKeys[_settings_selection_listId]) {}
			// else if (cursor[_key] == ObjectStoreKeys[_settings_teams_namesListId]) {}
			// else if (cursor[_key] == ObjectStoreKeys[_settings_teams_membersListId]) {}

			return true
		})
	}

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		for (const item of items) {
			store_settings[_put]({ key: item[0], value: item[1] })
		}
	}

	function exportList(list: ItemList): void {
		const url = createObjectURL(new Blob(
			[list[_items][_join]('\n')],
			{ type: 'text/csv'}
		))
		downloadFileByURL(url, 'list.csv')
		revokeObjectURL(url)
	}

	function editList(ev: Event): void {
		const name = textField_editListName_ref[_value][_trim]()
		const id = selectedListToEdit()[_id]
		if (name[_length] == 0) {
			textField_editListName_ref[_focus]()
			openToast(ev, toast_listNameEmpty_ref)
			return
		}

		const items: string[] = areaTextField_editItemList_ref[_value][_split](/[\n,]/gs)[_filter](v => v[_trim]()[_length] > 0)
		if (items[_length] == 0) {
			areaTextField_editItemList_ref[_focus]()
			openToast(ev, toast_listHaveNoItems_ref)
			return
		}

		for (const list of lists) {
			if (list[_name] != name || list[_id] == id) continue;

			textField_editListName_ref[_focus]()
			openToast(ev, toast_listNameAlreadyExist_ref)
			return
		}

		closeDialog(dialog_edit_ref)

		const newLists: ItemList = {id, name, items}
		const index = lists[_findIndex](list => list[_id] == id)
		if (index >= 0) setLists(lists => [
			...lists[_slice](0, index)[_concat](lists[_slice](index + 1)),
			newLists
		][_sort]((a, b) => a[_name][_localeCompare](b[_name])))

		if (settings[_words][_list][_id] == id) command(Commands[_change_settings_words_list], newLists)
		if (settings[_selection][_list][_id] == id) command(Commands[_change_settings_selection_list], newLists)
		if (settings[_teams][_namesList][_id] == id) command(Commands[_change_settings_teams_namesList], newLists)
		if (settings[_teams][_membersList][_id] == id) command(Commands[_change_settings_teams_membersList], newLists)

		openToast(ev, toast_listEdited_ref)

		const store_lists = db[_writeObjectStore](ObjectStoreNames[_lists])
		if (store_lists != null) store_lists[_put](newLists)
	}

	function openEditDialog(ev: Event, list: ItemList): void {
		setSelectedListToEdit(list)
		changeTextFieldValue(textField_editListName_ref, list[_name])
		changeAreaTextFieldValue(areaTextField_editItemList_ref, list[_items][_join](', '))
		openDialog(ev, dialog_edit_ref, {
			important: true
		})
	}

	function deleteList(ev: Event, list: ItemList): void {
		const index = lists[_findIndex](v => v[_id] == list[_id])
		if (index < 0) return;

		setLists(lists => lists[_slice](0, index)[_concat](lists[_slice](index + 1)))

		const isNoMoreLists = lists[_length] == 0
		const newList = isNoMoreLists? {id: -1, name: '', items: []} : lists[0]
		if (isNoMoreLists) closeDialog(dialog_lists_ref)

		if (settings[_words][_list][_id]        == list[_id]) command(Commands[_change_settings_words_list]       , {...newList})
		if (settings[_selection][_list][_id]    == list[_id]) command(Commands[_change_settings_selection_list]   , {...newList})
		if (settings[_teams][_namesList][_id]   == list[_id]) command(Commands[_change_settings_teams_namesList]  , {...newList})
		if (settings[_teams][_membersList][_id] == list[_id]) command(Commands[_change_settings_teams_membersList], {...newList})

		openToast(ev, toast_listDeleted_ref)

		const store_lists = db[_writeObjectStore](ObjectStoreNames[_lists])
		if (store_lists != null) store_lists[_delete](list[_id])
	}

	function openDeleteDialog(ev: Event, list: ItemList): void {
		setSelectedListToDelete(list)
		openDialog(ev, dialog_deleteListWarning_ref, {
			important: true
		})
	}

	function addNewList(ev: MouseEvent): void {
		const name = textField_newListName_ref[_value][_trim]()
		if (name[_length] == 0) {
			textField_newListName_ref[_focus]()
			openToast(ev, toast_listNameEmpty_ref)
			return
		}

		const items: string[] = areaTextField_newItemList_ref[_value][_split](/[\n,]/gs)[_filter](v => v[_trim]()[_length] > 0)
		if (items[_length] == 0) {
			areaTextField_newItemList_ref[_focus]()
			openToast(ev, toast_listHaveNoItems_ref)
			return
		}

		for (const list of lists) {
			if (list[_name] != name) continue;

			textField_newListName_ref[_focus]()
			openToast(ev, toast_listNameAlreadyExist_ref)
			return
		}

		closeDialog(dialog_add_ref)

		let id = 0
		for (const list of lists) {
			if (list[_id] <= id) continue
			id = list[_id]
		}
		id += 1
		const newLists: ItemList = {id, name, items}
		openToast(ev, toast_newListAdded_ref)
		setLists(l => [...l, {id, name, items}][_sort]((a, b) => a[_name][_localeCompare](b[_name])))

		const store_lists = db[_writeObjectStore](ObjectStoreNames[_lists])
		if (store_lists != null) store_lists[_put](newLists)
	}

	function openAddDialog(ev: Event): void {
		changeTextFieldValue(textField_newListName_ref, '')
		changeAreaTextFieldValue(areaTextField_newItemList_ref, '')
		openDialog(ev, dialog_add_ref)
	}

	function viewList(ev: Event, list: ItemList): void {
		setViewItemList(list)
		openDialog(ev, dialog_viewItemList_ref)
	}

	async function listItemFromCSVFile(): Promise<string[]> {
		let text = ''

		try {
			const files = await openFile('text/csv', true)
			if (!files) return [];

			for (const file of files!) {
				if (file[_type] != 'text/csv') continue;
				text += await readFileAsText(file)
			}
		} catch (e) {}

		return text[_split](/[\n,]/gs)[_filter](v => v[_trim]()[_length] > 0)
	}

	function resetLists(ev: Event): void {
		const defaultListIds = DEFAULT_LISTS[_map](v => v[_id])
		for (const list of lists) {
			if (defaultListIds[_includes](list[_id])) continue

			deleteList(ev, list)
		}
		setLists(DEFAULT_LISTS)

		const store_lists = db[_writeObjectStore](ObjectStoreNames[_lists])
		if (store_lists == null) return

		for (const list of lists){
			store_lists[_put]({
				id: list[_id],
				name: list[_name],
				items: [...list[_items]]
			} satisfies ItemList)
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		// add_list
		if (type == Commands[_add_list]) {
			openAddDialog(args[0] as Event)
		}

		// reset_list
		else if (type == Commands[_reset_list]) {
			resetLists(args[0] as Event)
		}

		// view_list
		else if (type == Commands[_view_list]) {
			viewList(args[0] as Event, args[1] as ItemList)
		}

		// edit_list
		else if (type == Commands[_edit_list]) {
			if (args[_length] > 1) return openEditDialog(args[0] as Event, args[1] as ItemList)
			openDialog(args[0] as Event, dialog_lists_ref)
		}

		// delete_list
		else if (type == Commands[_delete_list]) {
			openDeleteDialog(args[0] as Event, args[1] as ItemList)
		}

		// export_list
		else if (type == Commands[_export_list]) {
			exportList(args[0] as ItemList)
		}

		// toggle_settings_animation
		else if (type == Commands[_toggle_settings_animation]) {
			if (randomizerType() == RandomizerType[_numbers]) {
				setSettings(_numbers, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_numbers_animation], settings[_numbers][_animation]])
			}
			else if (randomizerType() == RandomizerType[_words]) {
				setSettings(_words, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_words_animation], settings[_words][_animation]])
			}
			else if (randomizerType() == RandomizerType[_string]) {
				setSettings(_string, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_string_animation], settings[_string][_animation]])
			}
			else if (randomizerType() == RandomizerType[_selection]) {
				setSettings(_selection, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_selection_animation], settings[_selection][_animation]])
			}
			else if (randomizerType() == RandomizerType[_colors]) {
				setSettings(_colors, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_colors_animation], settings[_colors][_animation]])
			}
			else if (randomizerType() == RandomizerType[_teams]) {
				setSettings(_teams, _animation, a => !a)
				saveSettings([ObjectStoreKeys[_settings_teams_animation], settings[_teams][_animation]])
			}
		}

		// toggle_settings_repeat
		else if (type == Commands[_toggle_settings_repeat]) {
			if (randomizerType() == RandomizerType[_numbers]) {
				setSettings(_numbers, _repeat, r => !r)
				saveSettings([ObjectStoreKeys[_settings_numbers_repeat], settings[_numbers][_repeat]])
			}
			else if (randomizerType() == RandomizerType[_words]) {
				setSettings(_words, _repeat, r => !r)
				saveSettings([ObjectStoreKeys[_settings_words_repeat], settings[_words][_repeat]])
			}
		}

		// change_settings_numbers_sort
		else if (type == Commands[_change_settings_numbers_sort]) {
			setSettings(_numbers, _sort, args[0] as NumbersRandomizerSort)
			saveSettings([ObjectStoreKeys[_settings_numbers_sort], args[0]])
		}

		// change_settings_numbers_type
		else if (type == Commands[_change_settings_numbers_type]) {
			setSettings(_numbers, _numberType, args[0] as NumbersRandomizerNumberType)
			saveSettings([ObjectStoreKeys[_settings_numbers_numberType], args[0]])
		}

		// change_settings_prefix
		else if (type == Commands[_change_settings_prefix]) {
			if (randomizerType() == RandomizerType[_numbers]) {
				setSettings(_numbers, _prefix, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_numbers_prefix], args[0]])
			}
			else if (randomizerType() == RandomizerType[_words]) {
				setSettings(_words, _prefix, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_words_prefix], args[0]])
			}
		}

		// change_settings_suffix
		else if (type == Commands[_change_settings_suffix]) {
			if (randomizerType() == RandomizerType[_numbers]) {
				setSettings(_numbers, _suffix, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_numbers_suffix], args[0]])
			}
			else if (randomizerType() == RandomizerType[_words]) {
				setSettings(_words, _suffix, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_words_suffix], args[0]])
			}
		}

		// change_settings_separator
		else if (type == Commands[_change_settings_separator]) {
			if (randomizerType() == RandomizerType[_numbers]) {
				setSettings(_numbers, _separator, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_numbers_separator], args[0]])
			}
			else if (randomizerType() == RandomizerType[_words]) {
				setSettings(_words, _separator, args[0] as string)
				saveSettings([ObjectStoreKeys[_settings_words_separator], args[0]])
			}
		}

		// change_settings_words_wordCase
		else if (type == Commands[_change_settings_words_wordCase]) {
			setSettings(_words, _wordCase, args[0] as WordsRandomizerWordCase)
			saveSettings([ObjectStoreKeys[_settings_words_wordCase], args[0]])
		}

		// change_settings_colors_colorModel
		else if (type == Commands[_change_settings_colors_colorModel]) {
			setSettings(_colors, _colorModel, args[0] as ColorsRandomizerColorModel)
			saveSettings([ObjectStoreKeys[_settings_colors_colorModel], args[0]])
		}

		// change_settings_words_listId
		else if (type == Commands[_change_settings_words_list]) {
			setSettings(_words, _list, args[0] as ItemList)
			saveSettings([ObjectStoreKeys[_settings_words_listId], (args[0] as ItemList)[_id]])
		}

		// change_settings_string_length
		else if (type == Commands[_change_settings_string_length]) {
			setSettings(_string, _length, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_string_length], args[0]])
		}

		// change_settings_string_characters_customCharacters
		else if (type == Commands[_change_settings_string_characters_customCharacters]) {
			setSettings(_string, _characters, _customCharacter, args[0] as string)
			saveSettings([ObjectStoreKeys[_settings_string_characters_customCharacter], args[0]])
		}

		// toggle_settings_string_characters_symbols
		else if (type == Commands[_toggle_settings_string_characters_symbols]) {
			setSettings(_string, _characters, _symbols, v => !v)
			saveSettings([ObjectStoreKeys[_settings_string_characters_symbols], settings[_string][_characters][_symbols]])
		}

		// toggle_settings_string_characters_numbers
		else if (type == Commands[_toggle_settings_string_characters_numbers]) {
			setSettings(_string, _characters, _numbers, v => !v)
			saveSettings([ObjectStoreKeys[_settings_string_characters_numbers], settings[_string][_characters][_numbers]])
		}

		// toggle_settings_string_characters_alphabetLowercase
		else if (type == Commands[_toggle_settings_string_characters_alphabetLowercase]) {
			setSettings(_string, _characters, _alphabetLowercase, v => !v)
			saveSettings([ObjectStoreKeys[_settings_string_characters_alphabetLowercase], settings[_string][_characters][_alphabetLowercase]])
		}

		// toggle_settings_string_characters_alphabetUppercase
		else if (type == Commands[_toggle_settings_string_characters_alphabetUppercase]) {
			setSettings(_string, _characters, _alphabetUppercase, v => !v)
			saveSettings([ObjectStoreKeys[_settings_string_characters_alphabetUppercase], settings[_string][_characters][_alphabetUppercase]])
		}

		// change_settings_numbers_count
		else if (type == Commands[_change_settings_numbers_count]) {
			setSettings(_numbers, _count, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_numbers_count], args[0]])
		}

		// change_settings_numbers_minDecimalLength
		else if (type == Commands[_change_settings_numbers_minDecimalLength]) {
			setSettings(_numbers, _minDecimalLength, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_numbers_minDecimalLength], args[0]])
		}

		// change_settings_numbers_range
		else if (type == Commands[_change_settings_numbers_range]) {
			setSettings(_numbers, _range, {min: args[0] as number, max: args[1] as number})
			saveSettings(
				[ObjectStoreKeys[_settings_numbers_range_min], args[0]],
				[ObjectStoreKeys[_settings_numbers_range_max], args[1]]
			)
		}

		// change_settings_words_count
		else if (type == Commands[_change_settings_words_count]) {
			setSettings(_words, _count, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_words_count], args[0]])
		}

		// change_settings_colors_count
		else if (type == Commands[_change_settings_colors_count]) {
			setSettings(_colors, _count, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_colors_count], args[0]])
		}

		// change_settings_colors_range_hex
		else if (type == Commands[_change_settings_colors_range_hex]) {
			setSettings(_colors, _range, _hex, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_hex_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_hex_max], args[1]],
			)
		}

		// change_settings_colors_range_hsl_h
		else if (type == Commands[_change_settings_colors_range_hsl_h]) {
			setSettings(_colors, _range, _hsl, _h, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_hsl_h_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_hsl_h_max], args[1]],
			)
		}

		// change_settings_colors_range_hsl_s
		else if (type == Commands[_change_settings_colors_range_hsl_s]) {
			setSettings(_colors, _range, _hsl, _s, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_hsl_s_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_hsl_s_max], args[1]],
			)
		}

		// change_settings_colors_range_hsl_l
		else if (type == Commands[_change_settings_colors_range_hsl_l]) {
			setSettings(_colors, _range, _hsl, _l, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_hsl_l_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_hsl_l_max], args[1]],
			)
		}

		// change_settings_colors_range_rgb_r
		else if (type == Commands[_change_settings_colors_range_rgb_r]) {
			setSettings(_colors, _range, _rgb, _r, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_rgb_r_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_rgb_r_max], args[1]],
			)
		}

		// change_settings_colors_range_rgb_g
		else if (type == Commands[_change_settings_colors_range_rgb_g]) {
			setSettings(_colors, _range, _rgb, _g, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_rgb_g_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_rgb_g_max], args[1]],
			)
		}

		// change_settings_colors_range_rgb_b
		else if (type == Commands[_change_settings_colors_range_rgb_b]) {
			setSettings(_colors, _range, _rgb, _b, { min: args[0] as number, max: args[1] as number })
			saveSettings(
				[ObjectStoreKeys[_settings_colors_range_rgb_b_min], args[0]],
				[ObjectStoreKeys[_settings_colors_range_rgb_b_max], args[1]],
			)
		}

		// change_settings_string_characters_toDefault
		else if (type == Commands[_change_settings_string_characters_toDefault]) {
			setSettings(_string, _characters, c => { return {
				...c,
				alphabetLowercase: true,
				alphabetUppercase: true,
				numbers: true,
			}})
			saveSettings(
				[ObjectStoreKeys[_settings_string_characters_alphabetLowercase], true],
				[ObjectStoreKeys[_settings_string_characters_alphabetUppercase], true],
				[ObjectStoreKeys[_settings_string_characters_numbers], true],
			)
		}

		// change_settings_selection_list
		else if (type == Commands[_change_settings_selection_list]) {
			setSettings(_selection, _list, args[0] as ItemList)
			if ((args[0] as ItemList)[_items][_length] < settings[_selection][_count]) {
				setSettings(_selection, _count, (args[0] as ItemList)[_items][_length])
				saveSettings(
					[ObjectStoreKeys[_settings_selection_listId], (args[0] as ItemList)[_id]],
					[ObjectStoreKeys[_settings_selection_count], (args[0] as ItemList)[_items][_length]]
				)
				return
			}
			saveSettings([ObjectStoreKeys[_settings_selection_listId], (args[0] as ItemList)[_id]])
		}

		// change_settings_selection_count
		else if (type == Commands[_change_settings_selection_count]) {
			setSettings(_selection, _count, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_selection_count], args[0] as number])
		}

		// change_settings_teams_namesList
		else if (type == Commands[_change_settings_teams_namesList]) {
			setSettings(_teams, _namesList, args[0] as ItemList)
			saveSettings([ObjectStoreKeys[_settings_teams_namesListId], (args[0] as ItemList)[_id]])
		}

		// change_settings_teams_membersList
		else if (type == Commands[_change_settings_teams_membersList]) {
			setSettings(_teams, _membersList, args[0] as ItemList)
			if ((args[0] as ItemList)[_items][_length] < settings[_teams][_count]) {
				setSettings(_teams, _count, (args[0] as ItemList)[_items][_length])
				saveSettings(
					[ObjectStoreKeys[_settings_teams_membersListId], (args[0] as ItemList)[_id]],
					[ObjectStoreKeys[_settings_teams_count], (args[0] as ItemList)[_items][_length]]
				)
				return
			}
			saveSettings([ObjectStoreKeys[_settings_teams_membersListId], (args[0] as ItemList)[_id]])
		}

		// change_settings_teams_count
		else if (type == Commands[_change_settings_teams_count]) {
			setSettings(_teams, _count, args[0] as number)
			saveSettings([ObjectStoreKeys[_settings_teams_count], args[0] as number])
		}

		// toggle_navigation_expand
		else if (type == Commands[_toggle_navigation_expand]) {
			setIsExpandNavigation(v => !v)
		}

		// generate
		else if (type == Commands[_generate]) {
			return onGenerate(args[0] as Event)
		}

		// stopGenerate
		else if (type == Commands[_stopGenerate]) {
			return onStopGenerate()
		}
	}

	function removeSplashScreen(): void {
		setMicrotask(() => {
			const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
			splash_ref[_animate](
				{opacity: 0},
				{
					duration: 1000,
					easing: AnimationEffectTiming[_spring]
				}
			)[_finished][_then](() => splash_ref[_remove]())
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	const ListItem: VoidComponent<ItemList> = ($props) => {
		return (<List
			trailing={<>
				<TextTooltip text="Export list">
					<IconButton onClick={() => exportList($props)} code={0xE0CF}/>
				</TextTooltip>
				<TextTooltip text="View list">
					<IconButton onClick={(ev) => viewList(ev, $props)} code={0xE77B}/>
				</TextTooltip>
				<TextTooltip text="Edit list">
					<IconButton onClick={(ev) => openEditDialog(ev, $props)} code={0xE739}/>
				</TextTooltip>
				<TextTooltip text="Delete list">
					<IconButton onClick={(ev) => openDeleteDialog(ev, $props)} code={0xE59D}/>
				</TextTooltip>
			</>}
			subtitle={$props[_items][_length] + ' item' + ($props[_items][_length] > 1? 's' : '')}>
			{$props[_name]}
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		return (<>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_lists_ref = r}
				header="Lists"
				actions={<>
					<Button
						onClick={() => closeDialog(dialog_lists_ref)}
						variant={ButtonVariant[_tonal]}>
						Close
					</Button>
					<Button
						onClick={(ev) => {
							closeDialog(dialog_lists_ref)
							openAddDialog(ev)
						}}
						variant={ButtonVariant[_filled]}>
						Add new list
					</Button>
				</>}>
				<For each={lists}>{(l, i) => <>
					<Show when={i() != 0}><Divider /></Show>
					<ListItem {...l} />
				</>}</For>
			</Dialog>
			<Dialog
				ref={r => dialog_deleteListWarning_ref = r}
				actions={<>
					<Button
						variant={ButtonVariant[_tonal]}
						onClick={() => closeDialog(dialog_deleteListWarning_ref)}>
						Cancel
					</Button>
					<Button
						variant={ButtonVariant[_filled]}
						onClick={(ev) => {
							closeDialog(dialog_deleteListWarning_ref)
							deleteList(ev, selectedListToDelete())
						}}>
						Delete
					</Button>
				</>}
				header="Delete list">
				Are you sure want to delete this list?
				<List
					classList={addClassListModule(CSS.app_delete_list)}
					subtitle={selectedListToDelete()[_items][_length] + ' item' + (selectedListToDelete()[_items][_length] > 1? 's' : '')}>
					{selectedListToDelete()[_name]}
				</List>
			</Dialog>
			<Dialog
				ref={r => dialog_add_ref = r}
				style={{width: '500px'}}
				actions={<>
					<Button
						variant={ButtonVariant[_tonal]}
						onClick={() => closeDialog(dialog_add_ref)}>
						Cancel
					</Button>
					<Button
						variant={ButtonVariant[_tonal]}
						onClick={async () => {
							const text = await listItemFromCSVFile()
							changeAreaTextFieldValue(areaTextField_newItemList_ref, [areaTextField_newItemList_ref[_value], ...text][_filter](v => v[_trim]()[_length] > 0)[_join](', '))
						}}>
						Import CSV
					</Button>
					<Button
						onClick={(ev) => {
							setViewItemList({
								id: -1,
								name: textField_newListName_ref[_value],
								items: areaTextField_newItemList_ref[_value][_split](/[\n,]/gs)[_filter](v => v[_trim]()[_length] > 0)
							})
							openDialog(ev, dialog_previewItemList_ref)
						}}
						variant={ButtonVariant[_tonal]}>
						Preview
					</Button>
					<Button
						onClick={(ev) => addNewList(ev)}
						variant={ButtonVariant[_filled]}>
						Save
					</Button>
				</>}
				header="New list">
				<TextField ref={r => textField_newListName_ref = r} labelText="List name" />
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areaTextField_newItemList_ref = r}
					labelText="Items"
					placeholder={"Item1, Item2,\nItem3, Item 4\nItem 5"}
					messageText={"Info: Each item separated by comma or new line"}
					minLine={5}
					maxLine={5}
				/>
			</Dialog>
			<Dialog
				ref={r => dialog_edit_ref = r}
				style={{width: '500px'}}
				actions={<>
					<Button
						variant={ButtonVariant[_tonal]}
						onClick={() => closeDialog(dialog_edit_ref)}>
						Cancel
					</Button>
					<Button
						variant={ButtonVariant[_tonal]}
						onClick={async () => {
							const text = await listItemFromCSVFile()
							changeAreaTextFieldValue(areaTextField_editItemList_ref, [areaTextField_newItemList_ref[_value], ...text][_filter](v => v[_trim]()[_length] > 0)[_join](', '))
						}}>
						Import CSV
					</Button>
					<Button
						onClick={(ev) => {
							setViewItemList({
								id: -1,
								name: textField_editListName_ref[_value],
								items: areaTextField_editItemList_ref[_value][_split](/[\n,]/gs)[_filter](v => v[_trim]()[_length] > 0)
							})
							openDialog(ev, dialog_previewItemList_ref)
						}}
						variant={ButtonVariant[_tonal]}>
						Preview
					</Button>
					<Button
						onClick={(ev) => editList(ev)}
						variant={ButtonVariant[_filled]}>
						Save
					</Button>
				</>}
				header="Edit list">
				<TextField
					ref={r => textField_editListName_ref = r}
					placeholder={selectedListToEdit()[_name]}
					labelText="List name"
				/>
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areaTextField_editItemList_ref = r}
					labelText="Items"
					placeholder={selectedListToEdit()[_items][_join](', ')}
					messageText={"Info: Each item separated by comma or new line"}
					minLine={5}
					maxLine={5}
				/>
			</Dialog>
			<Dialog
				ref={r => dialog_viewItemList_ref = r}
				style={{width: '720px'}}
				actions={<>
					<Button
						onClick={() => closeDialog(dialog_viewItemList_ref)}
						variant={ButtonVariant[_tonal]}>
						Close
					</Button>
					<Button
						onClick={() => exportList(viewItemList())}
						variant={ButtonVariant[_tonal]}>
						Export
					</Button>
					<Button
						onClick={ev => {
							closeDialog(dialog_viewItemList_ref)
							openEditDialog(ev, viewItemList())
						}}
						variant={ButtonVariant[_filled]}>
						Edit
					</Button>
				</>}
				header={viewItemList()[_name]}>
				<div class={CSS.app_view_list}>
					<For each={[...viewItemList()[_items]][_sort]()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
			<Dialog
				ref={r => dialog_previewItemList_ref = r}
				style={{width: '720px'}}
				actions={<Button
					onClick={() => closeDialog(dialog_previewItemList_ref)}
					variant={ButtonVariant[_filled]}>
					Close
				</Button>}
				header={viewItemList()[_name]}>
				<div class={CSS.app_view_list}>
					<For each={[...viewItemList()[_items]][_sort]()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
		</>)
	}

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast leading={<Icon filled code={0xE4BE}/>} ref={r => toast_listNameEmpty_ref = r}>List name is empty</Toast>
			<Toast leading={<Icon filled code={0xF0AA}/>} ref={r => toast_listHaveNoItems_ref = r}>List items is empty</Toast>
			<Toast leading={<Icon filled code={0xEBA8}/>} ref={r => toast_listNameAlreadyExist_ref = r}>List name already exist</Toast>
			<Toast leading={<Icon filled code={0xF09C}/>} ref={r => toast_listEdited_ref = r}>List edited</Toast>
			<Toast leading={<Icon filled code={0xE59D}/>} ref={r => toast_listDeleted_ref = r}>List deleted</Toast>
			<Toast leading={<Icon filled code={0xF0A6}/>} ref={r => toast_newListAdded_ref = r}>New list added</Toast>
			<Toast leading={<Icon filled code={0xE069}/>} ref={r => toast_noListSelected_ref = r}>No list selected</Toast>
		</>)
	}

	return (<>
		<App
			appBar={<AppBar
				isGenerating={isGenerating()}
				randomizerType={randomizerType()}
				onCopyResult={onCopyResult}
				settings={[settings, setSettings]}
				command={command}
				onChangeRandomizer={onChangeRandomizer}
			/>}
			floatingActionButton={<FloatingActionButton
				classList={addClassListModule(CSSAnimation.btn_rotate_full_icon, CSS.app_fab)}
				data-keep-pointer-event={toggleAttribute(isGenerating())}
				variant={ButtonVariant[_filled]}
				onClick={() => {
					if (isGenerating()) return command(Commands[_stopGenerate])
					command(Commands[_generate])
				}}>
				<Icon
					filled
					classList={addClassListModule(CSS.app_generate_icon)}
					data-rotate={toggleAttribute(isGenerating())}
					code={0xE143}
				/>
				<Show when={isGenerating()} fallback="Generate">Generating</Show>
			</FloatingActionButton>}
			leftSideBar={<SideNavigation
				expand={isExpandNavigation()}
				randomizerType={randomizerType()}
				onChangeRandomizer={onChangeRandomizer}
			/>}>
			<div class={CSS.app_body}>
				<Control
					randomizerType={randomizerType()}
					settings={[settings, setSettings]}
					lists={[lists, setLists]}
					command={command}
				/>
				<ResultComponent
					randomizerType={randomizerType()}
					result={[result, setResult]}
					settings={[settings, setSettings]}
				/>
			</div>
		</App>
		<Dialogs />
		<Toasts />
	</>)
}

export default _