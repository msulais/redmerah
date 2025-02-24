import { createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { ItemList, Result, Settings } from "./_types"
import { colorRgbToHex, colorHslToHex } from "@/utils/color"
import { timeIntervalSet, timeIntervalClear } from "@/utils/time"
import { createStore } from "solid-js/store"
import { RandomizerType, WordsRandomizerWordCase, NumbersRandomizerNumberType, NumbersRandomizerSort, ColorsRandomizerColorSpace, Commands } from "./_enums"
import { mathFloor, mathRandom, mathRound } from "@/utils/math"
import { PERSON_NAMES, TEAMS_NAMES, ANIMALS, LOREM_IPSUM, DEFAULT_LISTS } from "./_constants"
import { ObjectStoreNames, ObjectStoreKeys, type ObjectStoreLists, type ObjectStoreSettings, type ObjectStoreLastResult } from "./_storage"
import { stringToLowerCase, stringToUpperCase, stringToToggleCase, stringToTitleCase, stringLength, stringPadStart, stringTrim, stringSplit, stringLocaleCompare } from "@/utils/string"
import { urlCreate, urlDownloadFile, urlRevoke } from "@/utils/url"
import { elementDataset, elementFocus, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { fileOpen, fileReadAsText } from "@/utils/file"
import { IDB, idbStoreDelete, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { attrRemove, attrSet, attrSetIfExist, attrClassListModule } from "@/utils/attributes"
import { BodyAttributes } from "@/enums/attributes"
import { removeSplashScreen } from "@/scripts/splash"
import { arrayConcat, arrayFilter, arrayFindIndex, arrayIncludes, arrayJoin, arrayLength, arrayMap, arrayPush, arraySlice, arraySort, arraySplice } from "@/utils/array"
import { numberIsNotDefined, numberParse, numberToString } from "@/utils/number"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { documentActive, documentBody } from "@/utils/document"
import { eventCurrentTarget } from "@/utils/event"
import { promiseDone } from "@/utils/object"
import { ICON_APPS_LIST_DETAIL, ICON_ARROW_EXPORT_UP, ICON_ARROW_SYNC, ICON_DELETE, ICON_EDIT, ICON_EYE, ICON_TASK_LIST_SQUARE_LTR, ICON_WARNING } from "@/constants/icons"

import App from "@/components/App"
import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Divider from "@/components/Divider"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import Button, { ButtonVariant, FloatingActionButton, IconButton } from "@/components/Button"
import List from "@/components/List"
import TextField, { AreaTextField, updateAreaTextFieldValue, updateTextFieldValue } from "@/components/TextField"
import Toast, { openToast } from "@/components/Toast"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Control from './_Control'
import ResultComponent from './_Result'
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.randomizer, 1)
	const body = documentBody()
	const [randomizer, setRandomizer] = createSignal<RandomizerType>(RandomizerType.string)
	const [listViewItem, setListViewItem] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selectedListToDelete, setSelectedListToDelete] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [selectedListToEdit, setSelectedListToEdit] = createSignal<ItemList>({id: -1, items: [], name: ''})
	const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
	const [isGenerating, setIsGenerating] = createSignal<boolean>(false)
	const [lists, setlists] = createStore<ItemList[]>(arrayMap(DEFAULT_LISTS, l => ({id: l.id, name: l.name, items: [...l.items]})))
	const [settings, setSettings] = createStore<Settings>({
		string: {
			instant: true,
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
			instant: true,
			count: 3,
			list: {id: 5, name: 'Lorem Ipsum', items: [...LOREM_IPSUM ]},
			prefix: '',
			repeat: true,
			separator: ' ',
			suffix: '',
			wordCase: WordsRandomizerWordCase.none
		},
		numbers: {
			instant: true,
			count: 3,
			minDigits: 0,
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
			instant: true,
			space: ColorsRandomizerColorSpace.rgb,
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
			instant: true,
			count: 4,
			list: {id: 4, name: 'Animals', items: [...ANIMALS]},
		},
		teams: {
			instant: true,
			count: 3,
			listMembers: {id: 1, name: 'Person', items: [...PERSON_NAMES]},
			listNames: {id: 2, name: 'Teams', items: [...TEAMS_NAMES]},
		}
	})
	const [output, setOutput] = createStore<Result>({
		string: '',
		colors: [],
		numbers: '',
		selection: [],
		teams: [],
		words: ''
	})
	let timeIntervalId: number | null = null
	let dialogListsRef: HTMLDialogElement
	let dialogDeleteListWarningRef: HTMLDialogElement
	let dialogAddRef: HTMLDialogElement
	let dialogEditRef: HTMLDialogElement
	let dialogViewItemListRef: HTMLDialogElement
	let dialogPreviewItemListRef: HTMLDialogElement
	let toastListNameEmptyRef: HTMLDivElement
	let toastListHaveNoItemsRef: HTMLDivElement
	let toastListNameAlreadyExistRef: HTMLDivElement
	let toastListEditedRef: HTMLDivElement
	let toastListDeletedRef: HTMLDivElement
	let toastNewListAddedRef: HTMLDivElement
	let toastNoListSelectedRef: HTMLDivElement
	let areaTextFieldNewItemListRef: HTMLTextAreaElement
	let areaTextFieldExitItemListRef: HTMLTextAreaElement
	let textFieldNewListNameRef: HTMLInputElement
	let textFieldEditListNameRef: HTMLInputElement

	function generate(): void {
		switch (randomizer()) {
		case RandomizerType.string: {
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
				text += charlist[mathFloor(mathRandom() * stringLength(charlist))]
			}

			setOutput('string', text)
			break
		}
		case RandomizerType.numbers: {
			const numbers: number[] = []
			const $settings = settings.numbers
			const min = $settings.range.min
			const count = $settings.count
			const range: number = $settings.range.max - min

			for (let i = 0; i < count; i++) {
				const v: number = min + 1 + mathFloor(mathRandom() * range)

				if (!$settings.repeat && arrayIncludes(numbers, v)) continue

				arrayPush(numbers, v)
			}

			let iteration = 0
			while (arrayLength(numbers) < count && iteration < count + 0xff){
				const v: number = min + 1 + mathFloor(mathRandom() * range)

				if (!$settings.repeat &&
					arrayIncludes(numbers, v) &&
					arrayLength(numbers) < range) continue;

				arrayPush(numbers, v)
				++iteration
			}

			if ($settings.sort != NumbersRandomizerSort.none) arraySort(
				numbers,
				(a, b) => $settings.sort == NumbersRandomizerSort.ascending
					? a - b
					: b - a
			)

			setOutput('numbers', arrayJoin(arrayMap([...numbers], v =>
				$settings.prefix +
				stringToUpperCase(stringPadStart(numberToString(v, $settings.type), $settings.minDigits, '0')) +
				$settings.suffix
			), $settings.separator))
			break
		}
		case RandomizerType.words: {
			const $settings = settings.words
			const words: string[] = []
			const items = $settings.list.items
			let members: string[] = [...items]

			for (let i = 0; i < $settings.count; i++) {
				if (i >= arrayLength(items) && !$settings.repeat) break;

				const index = mathFloor(mathRandom() * (arrayLength(members) - 1))
				const member = members[index]

				if (!$settings.repeat) {
					arraySplice(members, index, 1)

					if (arrayIncludes(words, member)) continue
				}

				arrayPush(words, member)
			}

			members = [...items]
			for (let i = 0; i < $settings.count - arrayLength(words); i++) {
				const index = mathFloor(mathRandom() * (arrayLength(members) - 1))
				arrayPush(words, members[index])
			}

			setOutput('words', arrayJoin(arrayMap(words, text => {
				switch ($settings.wordCase) {
					case WordsRandomizerWordCase.uppercase: text = stringToUpperCase(text); break
					case WordsRandomizerWordCase.lowercase: text = stringToLowerCase(text); break
					case WordsRandomizerWordCase.titlecase: text = stringToTitleCase(text); break
					case WordsRandomizerWordCase.togglecase: text = stringToToggleCase(text); break
					case WordsRandomizerWordCase.none:
				}

				return $settings.prefix + text + $settings.suffix
			}), $settings.separator))
			break
		}
		case RandomizerType.selection: {
			const $settings = settings.selection
			const count = $settings.count
			const items = [...$settings.list.items]
			const selectedItems: string[] = []

			if (count == arrayLength(items)) {
				setOutput('selection', items)
				return
			}

			for (let i = 0; i < count; i++) {
				const index = mathFloor(mathRandom() * (arrayLength(items) - 1))
				arrayPush(selectedItems, items[index])
				arraySplice(items, index, 1)
			}

			setOutput('selection', selectedItems)
			break
		}
		case RandomizerType.colors: {
			const $settings = settings.colors
			const colors: HEXColor[] = []
			const count = $settings.count
			const random_number = (min: number, max: number): number => {
				const range = max - min
				const value = min + 1 + mathFloor(mathRandom() * range)
				return mathRound(value)
			}

			switch ($settings.space) {
				case ColorsRandomizerColorSpace.rgb: {
					const rgb = $settings.range.rgb
					for (let i = 0; i < count; i++) {
						const r = random_number(rgb.r.min, rgb.r.max) / 0xff
						const g = random_number(rgb.g.min, rgb.g.max) / 0xff
						const b = random_number(rgb.b.min, rgb.b.max) / 0xff
						arrayPush(colors, colorRgbToHex({r, g, b}))
					}
					break
				}
				case ColorsRandomizerColorSpace.hsl: {
					const hsl = $settings.range.hsl
					for (let i = 0; i < count; i++) {
						const hue = random_number(hsl.h.min, hsl.h.max) / 360
						const saturation = random_number(hsl.s.min, hsl.s.max) / 100
						const lightness = random_number(hsl.l.min, hsl.l.max) / 100
						arrayPush(colors, colorHslToHex({h: hue, s: saturation, l: lightness}))
					}
					break
				}
				case ColorsRandomizerColorSpace.hex: {
					const hex = $settings.range.hex
					for (let i = 0; i < count; i++) {
						const value = random_number(hex.min, hex.max)
						arrayPush(colors, '#' + stringPadStart(numberToString(value, 16), 6, '0') as HEXColor)
					}
					break
				}
			}

			setOutput('colors', colors)
			break
		}
		case RandomizerType.teams: {
			const $settings = settings.teams
			const count = $settings.count
			const names: string[] = [...$settings.listNames.items]
			const members: string[] = [...$settings.listMembers.items]
			const teams: {name: string; members: string[]}[] = []
			const minMembers = mathFloor(arrayLength(members) / count)

			if (arrayLength(names) > count) {
				arraySplice(names, arrayLength(names) - (arrayLength(names) - count))
			}

			arraySort(names)

			const range = count - arrayLength(names)
			for (let i = 0; i < range; i++) {
				arrayPush(names, 'Team #' + (i + 1))
			}

			for (const name of names) {
				const m: string[] = []

				for (let i = 0; i < minMembers; i++) {
					const index = mathFloor(mathRandom() * (arrayLength(members) - 1))
					arrayPush(m, members[index])
					arraySplice(members, index, 1)
				}

				arraySort(m)
				arrayPush(teams, {name, members: m})
			}

			for (const i in members) {
				arrayPush(teams[i].members, members[i])
			}

			setOutput('teams', teams)
		}}
	}

	async function onGenerate(): Promise<void> { return new Promise((ok) => {
		setIsGenerating(true)
		attrSet(body, BodyAttributes.noPointerEvent)

		let type = 'string'
		switch (randomizer()) {
		case RandomizerType.string:
			type = 'string'
			break
		case RandomizerType.numbers:
			type = 'numbers'
			break
		case RandomizerType.words:
			type = 'words'
			if (settings.words.list.id == -1) {
				openToast(toastNoListSelectedRef)
				return ok()
			}
			break
		case RandomizerType.selection:
			type = 'selection'
			if (settings.selection.list.id == -1) {
				openToast(toastNoListSelectedRef)
				return ok()
			}
			break
		case RandomizerType.colors:
			type = 'colors'
			break
		case RandomizerType.teams:
			type = 'teams'
			const teams = settings.teams
			if (teams.listMembers.id == -1 || teams.listNames.id == -1) {
				openToast(toastNoListSelectedRef)
				return ok()
			}
			break
		}

		if (!settings[type as keyof Settings].instant){
			const duration = 3000
			const step = 250
			let i = 0
			timeIntervalId = timeIntervalSet(() => {

				// max duration: 3 seconds
				if (i >= duration / step) {
					timeIntervalClear(timeIntervalId!)
					saveOutput()
					setIsGenerating(false)
					attrRemove(body, BodyAttributes.noPointerEvent)
					return ok()
				}
				generate()
				++i
			}, step)
			return
		}

		generate()
		saveOutput()
		attrRemove(body, BodyAttributes.noPointerEvent)
		setIsGenerating(false)
		ok()
	})}

	function onStopGenerate(): void {
		setIsGenerating(false)
		attrRemove(body, BodyAttributes.noPointerEvent)
		timeIntervalClear(timeIntervalId!)
		saveOutput()
	}

	async function onCopyResult(): Promise<boolean> {
		let text = output.string

		try {
			switch (randomizer()) {
			case RandomizerType.string:
				text = output.string
				break
			case RandomizerType.numbers:
				text = output.numbers
				break
			case RandomizerType.words:
				text = output.words
				break
			case RandomizerType.selection:
				text = arrayJoin(arrayMap(
					settings.selection.list.items,
					v => arrayIncludes(output.selection, v)? (v + ' [selected]') : v
				), '\n')
				break
			case RandomizerType.colors:
				text = arrayJoin(output.colors, '\n')
				break
			case RandomizerType.teams:
				text = arrayJoin(arrayMap(
					output.teams,
					v => '# ' + v.name + '\n' + arrayJoin(v.members, '\n')
				), '\n\n')
			}
			await navigatorClipboardWriteText(text)
			return true
		} catch (e) {}

		return false
	}

	function onUpdateRandomizer(type: RandomizerType): void {
		setRandomizer(type)
		const storeSettings = db.writeStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		idbStorePut(storeSettings, {
			key: ObjectStoreKeys.settings_lastPage,
			value: randomizer()
		})
	}

	function saveOutput(): void {
		const storeLastOutput = db.writeStore(ObjectStoreNames.lastOutput)
		if (storeLastOutput == null) return

		let key = ''
		let value: any = ''

		switch (randomizer()) {
		case RandomizerType.string:
			key = ObjectStoreKeys.lastOutput_string
			value = output.string
			break
		case RandomizerType.numbers:
			key = ObjectStoreKeys.lastOutput_numbers,
			value = output.numbers
			break
		case RandomizerType.words:
			key = ObjectStoreKeys.lastOutput_words
			value = output.words
			break
		case RandomizerType.selection:
			key = ObjectStoreKeys.lastOutput_selection
			value = [...output.selection]
			break
		case RandomizerType.colors:
			key = ObjectStoreKeys.lastOutput_colors
			value = [...output.colors]
			break
		case RandomizerType.teams:
			key = ObjectStoreKeys.lastOutput_teams
			value = [...arrayMap(output.teams, v => ({name: v.name, members: [...v.members]}))]
			break
		}

		idbStorePut(storeLastOutput, {key, value})
	}

	async function initDatabase(): Promise<void> {
		db.open({
			onSuccess() {
				initLastOutput()
				initLastPage()
				getLists()
				initSettings()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreLastResult>({
					name: ObjectStoreNames.lastOutput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				const $lists = db.createStore<ObjectStoreLists>({
					name: ObjectStoreNames.lists,
					keyPath: 'id',
					indexs: ['id', 'name', 'items']
				})

				for (const list of DEFAULT_LISTS) idbStorePut($lists!, {
					id: list.id,
					name: list.name,
					items: [...list.items]
				} satisfies ObjectStoreLists)
			}
		})
	}

	function initLastPage(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return;

		promiseDone(db.get<{key: string; value: RandomizerType}>(
			storeSettings,
			ObjectStoreKeys.settings_lastPage
		), (result) => setRandomizer(r => result?.value ?? r))
	}

	function initLastOutput(): void {
		const storeLastOutput = db.readStore(ObjectStoreNames.lastOutput)
		if (storeLastOutput == null) return

		promiseDone(db.get<{key: string; value: string}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_string
		), (result) => setOutput('string', s => result?.value ??s))

		promiseDone(db.get<{key: string; value: string}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_numbers
		), (result) => setOutput('numbers', n => result?.value ?? n))

		promiseDone(db.get<{key: string; value: string}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_words
		), (result) => setOutput('words', w => result?.value ?? w))

		promiseDone(db.get<{key:string; value: string[]}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_selection
		), (result) => setOutput('selection', s => result?.value ?? s))

		promiseDone(db.get<{key: string; value: HEXColor[]}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_colors
		), (result) => setOutput('colors', c => result?.value ?? c))

		promiseDone(db.get<{key: string; value: {name: string;members: string[]}[]}>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_teams
		), (result) => setOutput('teams', t => result?.value ?? t))
	}

	function getLists(): void {
		const storeLists = db.readStore(ObjectStoreNames.lists)
		if (storeLists == null) return

		promiseDone(db.getAll<ObjectStoreLists>(storeLists), (result) => {
			if (!result) return;
			setlists([...result])
			getListsSettings()
		})
	}

	function getListsSettings(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		promiseDone(db.get<ObjectStoreSettings>(
			storeSettings,
			ObjectStoreKeys.settings_wordsListId
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return setSettings('words', 'list', list)
			}

			return setSettings('words', 'list', {id: -1, items: [], name: ''})
		})

		promiseDone(db.get<ObjectStoreSettings>(
			storeSettings,
			ObjectStoreKeys.settings_selectionListId
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return setSettings('selection', 'list', list)
			}

			return setSettings('selection', 'list', {id: -1, items: [], name: ''})
		})

		promiseDone(db.get<ObjectStoreSettings>(
			storeSettings,
			ObjectStoreKeys.settings_teamsListNamesId
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return setSettings('teams', 'listNames', list)
			}

			return setSettings('teams', 'listNames', {id: -1, items: [], name: ''})
		})

		promiseDone(db.get<ObjectStoreSettings>(
			storeSettings,
			ObjectStoreKeys.settings_teamsListMembersId
		), (result) => {
			if (!result) return;

			const id = result.value as number
			for (const list of lists) {
				if (list.id == id) return setSettings('teams', 'listMembers', list)
			}

			return setSettings('teams', 'listMembers', {id: -1, items: [], name: ''})
		})
	}

	function initSettings(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		db.cursor(storeSettings, (cursor) => {
			if (!cursor) return true

			const value = cursor.value.value
			switch (cursor.key as ObjectStoreKeys) {
			case ObjectStoreKeys.settings_stringLength: setSettings('string', 'length', value as number); break
			case ObjectStoreKeys.settings_stringInstant: setSettings('string', 'instant', value as boolean); break
			case ObjectStoreKeys.settings_stringCharactersCustom: setSettings('string', 'characters', 'custom', value as string); break
			case ObjectStoreKeys.settings_stringCharactersSymbols: setSettings('string', 'characters', 'symbols', value as boolean); break
			case ObjectStoreKeys.settings_stringCharactersNumbers: setSettings('string', 'characters', 'numbers', value as boolean); break
			case ObjectStoreKeys.settings_stringCharactersLowercase: setSettings('string', 'characters', 'lowercase', value as boolean); break
			case ObjectStoreKeys.settings_stringCharactersUppercase: setSettings('string', 'characters', 'uppercase', value as boolean); break
			case ObjectStoreKeys.settings_numbersCount: setSettings('numbers', 'count', value as number); break
			case ObjectStoreKeys.settings_numbersInstant: setSettings('numbers', 'instant', value as boolean); break
			case ObjectStoreKeys.settings_numbersType: setSettings('numbers', 'type', value as NumbersRandomizerNumberType); break
			case ObjectStoreKeys.settings_numbersRepeat: setSettings('numbers', 'repeat', value as boolean); break
			case ObjectStoreKeys.settings_numbersSort: setSettings('numbers', 'sort', value as NumbersRandomizerSort); break
			case ObjectStoreKeys.settings_numbersPrefix: setSettings('numbers', 'prefix', value as string); break
			case ObjectStoreKeys.settings_numbersSuffix: setSettings('numbers', 'suffix', value as string); break
			case ObjectStoreKeys.settings_numbersSeparator: setSettings('numbers', 'separator', value as string); break
			case ObjectStoreKeys.settings_numbersMinDigits: setSettings('numbers', 'minDigits', value as number); break
			case ObjectStoreKeys.settings_numbersRangeMin: setSettings('numbers', 'range', 'min', value as number); break
			case ObjectStoreKeys.settings_numbersRangeMax: setSettings('numbers', 'range', 'max', value as number); break
			case ObjectStoreKeys.settings_wordsCount: setSettings('words', 'count', value as number); break
			case ObjectStoreKeys.settings_wordsInstant: setSettings('words', 'instant', value as boolean); break
			case ObjectStoreKeys.settings_wordsRepeat: setSettings('words', 'repeat', value as boolean); break
			case ObjectStoreKeys.settings_wordsWordCase: setSettings('words', 'wordCase', value as WordsRandomizerWordCase); break
			case ObjectStoreKeys.settings_wordsPrefix: setSettings('words', 'prefix', value as string); break
			case ObjectStoreKeys.settings_wordsSuffix: setSettings('words', 'suffix', value as string); break
			case ObjectStoreKeys.settings_wordsSeparator: setSettings('words', 'separator', value as string); break
			case ObjectStoreKeys.settings_selectionCount: setSettings('selection', 'count', value as number); break
			case ObjectStoreKeys.settings_selectionInstant: setSettings('selection', 'instant', value as boolean); break
			case ObjectStoreKeys.settings_colorsCount: setSettings('colors', 'count', value as number); break
			case ObjectStoreKeys.settings_colorsInstant: setSettings('colors', 'instant', value as boolean); break
			case ObjectStoreKeys.settings_colorsModel: setSettings('colors', 'space', value as ColorsRandomizerColorSpace); break
			case ObjectStoreKeys.settings_colorsRangeHexMin: setSettings('colors', 'range', 'hex', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHexMax: setSettings('colors', 'range', 'hex', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslHMin: setSettings('colors', 'range', 'hsl', 'h', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslHMax: setSettings('colors', 'range', 'hsl', 'h', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslSMin: setSettings('colors', 'range', 'hsl', 's', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslSMax: setSettings('colors', 'range', 'hsl', 's', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslLMin: setSettings('colors', 'range', 'hsl', 'l', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeHslLMax: setSettings('colors', 'range', 'hsl', 'l', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbRMin: setSettings('colors', 'range', 'rgb', 'r', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbRMax: setSettings('colors', 'range', 'rgb', 'r', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbGMin: setSettings('colors', 'range', 'rgb', 'g', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbGMax: setSettings('colors', 'range', 'rgb', 'g', 'max', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbBMin: setSettings('colors', 'range', 'rgb', 'b', 'min', value as number); break
			case ObjectStoreKeys.settings_colorsRangeRgbBMax: setSettings('colors', 'range', 'rgb', 'b', 'max', value as number); break
			case ObjectStoreKeys.settings_teamsCount: setSettings('teams', 'count', value as number); break
			case ObjectStoreKeys.settings_teamsInstant: setSettings('teams', 'instant', value as boolean); break

			// already init by other function
			case ObjectStoreKeys.settings_teamsListNamesId:
			case ObjectStoreKeys.settings_teamsListMembersId:
			case ObjectStoreKeys.settings_wordsListId:
			case ObjectStoreKeys.settings_selectionListId:
			case ObjectStoreKeys.lastOutput_string:
			case ObjectStoreKeys.lastOutput_numbers:
			case ObjectStoreKeys.lastOutput_words:
			case ObjectStoreKeys.lastOutput_selection:
			case ObjectStoreKeys.lastOutput_colors:
			case ObjectStoreKeys.lastOutput_teams:
			case ObjectStoreKeys.settings_lastPage:
			}

			return true
		})
	}

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const storeSettings = db.writeStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		for (const item of items) {
			idbStorePut(storeSettings, { key: item[0], value: item[1] })
		}
	}

	function exportList(list: ItemList): void {
		const url = urlCreate(new Blob(
			[arrayJoin(list.items, '\n')],
			{ type: 'text/csv'}
		))
		urlDownloadFile(url, 'list.csv')
		urlRevoke(url)
	}

	function editList(): void {
		const name = stringTrim(textFieldEditListNameRef.value)
		const id = selectedListToEdit().id
		if (stringLength(name) == 0) {
			elementFocus(textFieldEditListNameRef)
			openToast(toastListNameEmptyRef)
			return
		}

		const items: string[] = arrayFilter(
			stringSplit(areaTextFieldExitItemListRef.value, /[\n,]/gs),
			v => stringLength(stringTrim(v)) > 0
		)
		if (arrayLength(items) == 0) {
			elementFocus(areaTextFieldExitItemListRef)
			openToast(toastListHaveNoItemsRef)
			return
		}

		for (const list of lists) {
			if (list.name != name || list.id == id) continue;

			elementFocus(textFieldEditListNameRef)
			openToast(toastListNameAlreadyExistRef)
			return
		}

		closeDialog(dialogEditRef)

		const newList: ItemList = {id, name, items}
		const index = arrayFindIndex(lists, list => list.id == id)
		if (index >= 0) setlists(lists => arraySort([
			...arrayConcat(arraySlice(lists, 0, index), arraySlice(lists, index + 1)),
			newList
		], (a, b) => stringLocaleCompare(a.name, b.name)))

		if (settings.words.list.id == id) command(Commands.updateSettingsWordsList, newList)
		if (settings.selection.list.id == id) command(Commands.updateSettingsSelectionList, newList)
		if (settings.teams.listNames.id == id) command(Commands.updateSettingsTeamsListNames, newList)
		if (settings.teams.listMembers.id == id) command(Commands.updateSettingsTeamsListMembers, newList)

		openToast(toastListEditedRef)

		const storeLists = db.writeStore(ObjectStoreNames.lists)
		if (storeLists) idbStorePut(storeLists, newList)
	}

	function openEditDialog(list: ItemList): void {
		setSelectedListToEdit(list)
		updateTextFieldValue(textFieldEditListNameRef, list.name)
		updateAreaTextFieldValue(areaTextFieldExitItemListRef, arrayJoin(list.items, ', '))
		openDialog(dialogEditRef, {
			important: true
		})
	}

	function deleteList(list: ItemList): void {
		const index = arrayFindIndex(lists, v => v.id == list.id)
		if (index < 0) return;

		setlists(lists => arrayConcat(arraySlice(lists, 0, index), arraySlice(lists, index + 1)))

		const isNoMoreLists = arrayLength(lists) == 0
		const newList = isNoMoreLists? {id: -1, name: '', items: []} : lists[0]
		if (isNoMoreLists) closeDialog(dialogListsRef)

		if (settings.words.list.id == list.id) command(Commands.updateSettingsWordsList, {...newList})
		if (settings.selection.list.id == list.id) command(Commands.updateSettingsSelectionList, {...newList})
		if (settings.teams.listNames.id == list.id) command(Commands.updateSettingsTeamsListNames, {...newList})
		if (settings.teams.listMembers.id == list.id) command(Commands.updateSettingsTeamsListMembers, {...newList})

		openToast(toastListDeletedRef)

		const storeLists = db.writeStore(ObjectStoreNames.lists)
		if (storeLists) idbStoreDelete(storeLists, list.id)
	}

	function openDeleteDialog(list: ItemList): void {
		setSelectedListToDelete(list)
		openDialog(dialogDeleteListWarningRef, {
			important: true
		})
	}

	function addNewList(): void {
		const value = textFieldNewListNameRef.value
		const name = stringTrim(value)
		if (stringLength(name) == 0) {
			elementFocus(textFieldNewListNameRef)
			openToast(toastListNameEmptyRef)
			return
		}

		const items: string[] = arrayFilter(
			stringSplit(value, /[\n,]/gs),
			v => stringLength(stringTrim(v)) > 0
		)
		if (arrayLength(items) == 0) {
			elementFocus(areaTextFieldNewItemListRef)
			openToast(toastListHaveNoItemsRef)
			return
		}

		for (const list of lists) {
			if (list.name != name) continue;

			elementFocus(textFieldNewListNameRef)
			openToast(toastListNameAlreadyExistRef)
			return
		}

		closeDialog(dialogAddRef)

		let id = 0
		for (const list of lists) {
			if (list.id <= id) continue
			id = list.id
		}
		id += 1
		const new_lists: ItemList = {id, name, items}
		openToast(toastNewListAddedRef)
		setlists(l => arraySort([...l, {id, name, items}], (a, b) => stringLocaleCompare(a.name, b.name)))

		const storeLists = db.writeStore(ObjectStoreNames.lists)
		if (storeLists) idbStorePut(storeLists, new_lists)
	}

	function openAddDialog(): void {
		updateTextFieldValue(textFieldNewListNameRef, '')
		updateAreaTextFieldValue(areaTextFieldNewItemListRef, '')
		openDialog(dialogAddRef)
	}

	function viewList(list: ItemList): void {
		setListViewItem(list)
		openDialog(dialogViewItemListRef)
	}

	async function lsitItemFromCSVFile(): Promise<string[]> {
		let text = ''

		try {
			const files = await fileOpen('text/csv', true)
			if (!files) return [];

			for (const file of files!) {
				if (file.type != 'text/csv') continue;
				text += await fileReadAsText(file)
			}
		} catch (e) {}

		return arrayFilter(
			stringSplit(text, /[\n,]/gs),
			v => stringLength(stringTrim(v)) > 0
		)
	}

	function resetLists(): void {
		const defaultListIds = arrayMap(DEFAULT_LISTS, v => v.id)
		for (const list of lists) {
			if (arrayIncludes(defaultListIds, list.id)) continue

			deleteList(list)
		}
		setlists(arrayMap(DEFAULT_LISTS, l => ({id: l.id, name: l.name, items: [...l.items]})))

		const storeLists = db.writeStore(ObjectStoreNames.lists)
		if (storeLists == null) return

		for (const list of lists){
			idbStorePut(storeLists, {
				id: list.id,
				name: list.name,
				items: [...list.items]
			} satisfies ItemList)
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.resetList:
			resetLists()
			break
		case Commands.addList:
			openAddDialog()
			break
		case Commands.exportList: {
			const [list] = args as [ItemList]
			exportList(list)
			break
		}
		case Commands.editList: {
			const [list] = args as [ItemList | undefined]
			if (arrayLength(args) > 0) return openEditDialog(list!)
			openDialog(dialogListsRef)
			break
		}
		case Commands.viewList: {
			const [list] = args as [ItemList]
			viewList(list)
			break
		}
		case Commands.deleteList: {
			const [list] = args as [ItemList]
			openDeleteDialog(list)
			break
		}
		case Commands.toggleSettingsAnimation: {
			switch (randomizer()) {
				case RandomizerType.numbers: {
					setSettings('numbers', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_numbersInstant, settings.numbers.instant])
					break
				}
				case RandomizerType.words: {
					setSettings('words', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_wordsInstant, settings.words.instant])
					break
				}
				case RandomizerType.string: {
					setSettings('string', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_stringInstant, settings.string.instant])
					break
				}
				case RandomizerType.selection: {
					setSettings('selection', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_selectionInstant, settings.selection.instant])
					break
				}
				case RandomizerType.colors: {
					setSettings('colors', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_colorsInstant, settings.colors.instant])
					break
				}
				case RandomizerType.teams: {
					setSettings('teams', 'instant', a => !a)
					saveSettings([ObjectStoreKeys.settings_teamsInstant, settings.teams.instant])
					break
				}
			}
			break
		}
		case Commands.toggleSettingsRepeat: {
			if (randomizer() == RandomizerType.numbers) {
				setSettings('numbers', 'repeat', r => !r)
				saveSettings([ObjectStoreKeys.settings_numbersRepeat, settings.numbers.repeat])
			}
			else if (randomizer() == RandomizerType.words) {
				setSettings('words', 'repeat', r => !r)
				saveSettings([ObjectStoreKeys.settings_wordsRepeat, settings.words.repeat])
			}
			break
		}
		case Commands.updateSettingsNumbersSort: {
			const [sort] = args as [NumbersRandomizerSort]
			setSettings('numbers', 'sort', sort)
			saveSettings([ObjectStoreKeys.settings_numbersSort, sort])
			break
		}
		case Commands.updateSettingsNumbersType: {
			const [type] = args as [NumbersRandomizerNumberType]
			setSettings('numbers', 'type', type)
			saveSettings([ObjectStoreKeys.settings_numbersType, type])
			break
		}
		case Commands.updateSettingsPrefix: {
			const [value] = args as [string]
			if (randomizer() == RandomizerType.numbers) {
				setSettings('numbers', 'prefix', value)
				saveSettings([ObjectStoreKeys.settings_numbersPrefix, value])
			}
			else if (randomizer() == RandomizerType.words) {
				setSettings('words', 'prefix', value)
				saveSettings([ObjectStoreKeys.settings_wordsPrefix, value])
			}
			break
		}
		case Commands.updateSettingsSuffix: {
			const [value] = args as [string]
			if (randomizer() == RandomizerType.numbers) {
				setSettings('numbers', 'suffix', value)
				saveSettings([ObjectStoreKeys.settings_numbersSuffix, value])
			}
			else if (randomizer() == RandomizerType.words) {
				setSettings('words', 'suffix', value)
				saveSettings([ObjectStoreKeys.settings_wordsSuffix, value])
			}
			break
		}
		case Commands.updateSettingsSeparator: {
			const [value] = args as [string]
			if (randomizer() == RandomizerType.numbers) {
				setSettings('numbers', 'separator', value)
				saveSettings([ObjectStoreKeys.settings_numbersSeparator, value])
			}
			else if (randomizer() == RandomizerType.words) {
				setSettings('words', 'separator', value)
				saveSettings([ObjectStoreKeys.settings_wordsSeparator, value])
			}
			break
		}
		case Commands.updateSettingsWordsWordcase: {
			const [wordcase] = args as [WordsRandomizerWordCase]
			setSettings('words', 'wordCase', wordcase)
			saveSettings([ObjectStoreKeys.settings_wordsWordCase, wordcase])
			break
		}
		case Commands.updateSettingsColorsSpace: {
			setSettings('colors', 'space', args[0] as ColorsRandomizerColorSpace)
			saveSettings([ObjectStoreKeys.settings_colorsModel, args[0]])
			break
		}
		case Commands.updateSettingsWordsList: {
			setSettings('words', 'list', args[0] as ItemList)
			saveSettings([ObjectStoreKeys.settings_wordsListId, (args[0] as ItemList).id])
			break
		}
		case Commands.updateSettingsStringLength: {
			setSettings('string', 'length', args[0] as number)
			saveSettings([ObjectStoreKeys.settings_stringLength, args[0]])
			break
		}
		case Commands.updateSettingsStringCharactersCustom: {
			setSettings('string', 'characters', 'custom', args[0] as string)
			saveSettings([ObjectStoreKeys.settings_stringCharactersCustom, args[0]])
			break
		}
		case Commands.toggleSettingsStrnigCharactersSymbols: {
			setSettings('string', 'characters', 'symbols', v => !v)
			saveSettings([ObjectStoreKeys.settings_stringCharactersSymbols, settings.string.characters.symbols])
			break
		}
		case Commands.toggleSettingsStringCharactersNumbers: {
			setSettings('string', 'characters', 'numbers', v => !v)
			saveSettings([ObjectStoreKeys.settings_stringCharactersNumbers, settings.string.characters.numbers])
			break
		}
		case Commands.toggleSettingsStringCharactersLowercase: {
			setSettings('string', 'characters', 'lowercase', v => !v)
			saveSettings([ObjectStoreKeys.settings_stringCharactersLowercase, settings.string.characters.lowercase])
			break
		}
		case Commands.toggleSettingsStringCharactersUppercase: {
			setSettings('string','characters', 'uppercase', v => !v)
			saveSettings([ObjectStoreKeys.settings_stringCharactersUppercase, settings.string.characters.uppercase])
			break
		}
		case Commands.updateSettingsStringCharactersDefault: {
			setSettings('string', 'characters', c => ({
				...c,
				alphabetLowercase: true,
				alphabetUppercase: true,
				numbers: true,
			}))
			saveSettings(
				[ObjectStoreKeys.settings_stringCharactersLowercase, true],
				[ObjectStoreKeys.settings_stringCharactersUppercase, true],
				[ObjectStoreKeys.settings_stringCharactersNumbers, true],
			)
			break
		}
		case Commands.updateSettingsNumbersCount: {
			const [count] = args as [number]
			setSettings('numbers', 'count', count)
			saveSettings([ObjectStoreKeys.settings_numbersCount, count])
			break
		}
		case Commands.updateSettingsNumbersMinDigits: {
			const [length] = args as [number]
			setSettings('numbers', 'minDigits', length)
			saveSettings([ObjectStoreKeys.settings_numbersMinDigits, length])
			break
		}
		case Commands.updateSettingsNumbersRange: {
			const [min, max] = args as [number, number]
			setSettings('numbers', 'range', {min, max})
			saveSettings(
				[ObjectStoreKeys.settings_numbersRangeMin, min],
				[ObjectStoreKeys.settings_numbersRangeMax, max]
			)
			break
		}
		case Commands.updateSettingsWordsCount: {
			const [count] = args as [number]
			setSettings('words', 'count', count)
			saveSettings([ObjectStoreKeys.settings_wordsCount, count])
			break
		}
		case Commands.updateSettingsColorsCount: {
			const [count] = args as [number]
			setSettings('colors', 'count', count)
			saveSettings([ObjectStoreKeys.settings_colorsCount, count])
			break
		}
		case Commands.updateSettingsColorsRangeHex: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'hex', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeHexMin, min],
				[ObjectStoreKeys.settings_colorsRangeHexMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeHslH: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'hsl', 'h', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeHslHMin, min],
				[ObjectStoreKeys.settings_colorsRangeHslHMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeHslS: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'hsl', 's', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeHslSMin, min],
				[ObjectStoreKeys.settings_colorsRangeHslSMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeHslL: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'hsl', 'l', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeHslLMin, min],
				[ObjectStoreKeys.settings_colorsRangeHslLMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeRgbR: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'rgb', 'r', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeRgbRMin, min],
				[ObjectStoreKeys.settings_colorsRangeRgbRMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeRgbG: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'rgb', 'g', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeRgbGMin, min],
				[ObjectStoreKeys.settings_colorsRangeRgbGMax, max],
			)
			break
		}
		case Commands.updateSettingsColorsRangeRgbB: {
			const [min, max] = args as [number, number]
			setSettings('colors', 'range', 'rgb', 'b', { min, max })
			saveSettings(
				[ObjectStoreKeys.settings_colorsRangeRgbBMin, min],
				[ObjectStoreKeys.settings_colorsRangeRgbBMax, max],
			)
			break
		}
		case Commands.updateSettingsSelectionList: {
			const [list] = args as [ItemList]
			const list_length = arrayLength(list.items)
			const list_id = list.id
			setSettings('selection', 'list', list)
			if (list_length < settings.selection.count) {
				setSettings('selection', 'count', list_length)
				saveSettings(
					[ObjectStoreKeys.settings_selectionListId, list_id],
					[ObjectStoreKeys.settings_selectionCount, list_length]
				)
				return
			}

			saveSettings([ObjectStoreKeys.settings_selectionListId, list_id])
			break
		}
		case Commands.updateSettingsSelectionCount: {
			const [count] = args as [number]
			setSettings('selection', 'count', count)
			saveSettings([ObjectStoreKeys.settings_selectionCount, count])
			break
		}
		case Commands.updateSettingsTeamsListNames: {
			const [list] = args as [ItemList]
			setSettings('teams', 'listNames', list)
			saveSettings([ObjectStoreKeys.settings_teamsListNamesId, list.id])
			break
		}
		case Commands.updateSettingsTeamsListMembers: {
			const [list] = args as [ItemList]
			const listLength = arrayLength(list.items)
			const listId = list.id
			setSettings('teams', 'listMembers', list)
			if (listLength < settings.teams.count) {
				setSettings('teams', 'count', listLength)
				saveSettings(
					[ObjectStoreKeys.settings_teamsListMembersId, listId],
					[ObjectStoreKeys.settings_teamsCount, listLength]
				)
				return
			}

			saveSettings([ObjectStoreKeys.settings_teamsListMembersId, listId])
			break
		}
		case Commands.updateSettingsTeamsCount: {
			const [count] = args as [number]
			setSettings('teams', 'count', count)
			saveSettings([ObjectStoreKeys.settings_teamsCount, count])
			break
		}
		case Commands.toggleNavigationExpand:
			setIsSideNavigationExpanded(v => !v)
			break
		case Commands.generate:
			return onGenerate()
		case Commands.stopGenerate:
			return onStopGenerate()
		default: return
	}}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	const Dialogs: VoidComponent = () => {
		const buttonLists_closeId = createUniqueId()
		const buttonLists_addNewListId = createUniqueId()
		const buttonDeleteListWarning_cancelId = createUniqueId()
		const buttonDeleteListWarning_deleteId = createUniqueId()
		const buttonAdd_cancelId = createUniqueId()
		const buttonAdd_importCSVId = createUniqueId()
		const buttonAdd_previewId = createUniqueId()
		const buttonAdd_saveId = createUniqueId()
		const buttonEdit_cancelId = createUniqueId()
		const buttonEdit_importCSVId = createUniqueId()
		const buttonEdit_previewId = createUniqueId()
		const buttonEdit_saveId = createUniqueId()
		const buttonViewItemList_closeId = createUniqueId()
		const buttonViewItemList_exportId = createUniqueId()
		const buttonViewItemList_editId = createUniqueId()
		return (<>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialogListsRef = r}
				c:header="Lists"
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonLists_closeId:
						closeDialog(dialogListsRef)
						break
					case buttonLists_addNewListId:
						closeDialog(dialogListsRef)
						openAddDialog()
						break
					default:
						const dataListExportIndex = elementDataset(button, 'listExportIndex')
						if (dataListExportIndex) {
							const index = numberParse(dataListExportIndex, true)
							if (numberIsNotDefined(index)) return

							exportList(lists[index])
							return
						}

						const dataListViewIndex = elementDataset(button, 'listViewIndex')
						if (dataListViewIndex) {
							const index = numberParse(dataListViewIndex, true)
							if (numberIsNotDefined(index)) return

							viewList(lists[index])
							return
						}

						const dataListEditIndex = elementDataset(button, 'listEditIndex')
						if (dataListEditIndex) {
							const index = numberParse(dataListEditIndex, true)
							if (numberIsNotDefined(index)) return

							openEditDialog(lists[index])
							return
						}

						const dataListDeleteIndex = elementDataset(button, 'listDeleteIndex')
						if (dataListDeleteIndex) {
							const index = numberParse(dataListDeleteIndex, true)
							if (numberIsNotDefined(index)) return

							openDeleteDialog(lists[index])
							return
						}
					}
				}}
				c:actions={<>
					<Button
						id={buttonLists_closeId}
						c:variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={buttonLists_addNewListId}
						c:variant={ButtonVariant.filled}>
						Add new list
					</Button>
				</>}>
				<Tooltip>
					<For each={lists}>{(list, i) => <>
						<Show when={i() != 0}><Divider /></Show>
						<List
							c:trailing={<>
								<IconButton data-list-export-index={i()} data-tooltip="Export list" c:code={ICON_ARROW_EXPORT_UP}/>
								<IconButton data-list-view-index={i()} data-tooltip="View list" c:code={ICON_EYE}/>
								<IconButton data-list-edit-index={i()} data-tooltip="Edit list" c:code={ICON_EDIT}/>
								<IconButton data-list-delete-index={i()} data-tooltip="Delete list" c:code={ICON_DELETE}/>
							</>}
							c:subtitle={arrayLength(list.items) + ' item' + (arrayLength(list.items) > 1? 's' : '')}>
							{list.name}
						</List>
					</>}</For>
				</Tooltip>
			</Dialog>
			<Dialog
				ref={r => dialogDeleteListWarningRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonDeleteListWarning_cancelId:
						closeDialog(dialogDeleteListWarningRef)
						break
					case buttonDeleteListWarning_deleteId:
						closeDialog(dialogDeleteListWarningRef)
						deleteList(selectedListToDelete())
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonDeleteListWarning_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={buttonDeleteListWarning_deleteId}
						c:variant={ButtonVariant.filled}>
						Delete
					</Button>
				</>}
				c:header="Delete list">
				Are you sure want to delete this list?
				<List
					classList={attrClassListModule(CSS.app_delete_list)}
					c:subtitle={arrayLength(selectedListToDelete().items) + ' item' + (arrayLength(selectedListToDelete().items) > 1? 's' : '')}>
					{selectedListToDelete().name}
				</List>
			</Dialog>
			<Dialog
				ref={r => dialogAddRef = r}
				style={{width: '500px'}}
				onClick={async ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonAdd_cancelId:
						closeDialog(dialogAddRef)
						break
					case buttonAdd_importCSVId:
						const text = await lsitItemFromCSVFile()
						updateAreaTextFieldValue(
							areaTextFieldNewItemListRef,
							arrayJoin(arrayFilter(
								[areaTextFieldNewItemListRef.value, ...text],
								v => stringLength(stringTrim(v)) > 0
							), ', ')
						)
						break
					case buttonAdd_previewId:
						setListViewItem({
							id: -1,
							name: textFieldNewListNameRef.value,
							items: arrayFilter(
								stringSplit(areaTextFieldNewItemListRef.value, /[\n,]/gs),
								v => stringLength(stringTrim(v)) > 0
							)
						})
						openDialog(dialogPreviewItemListRef)
						break
					case buttonAdd_saveId:
						addNewList()
						break
					}
				}}
				c:actions={<>
					<Button
						c:variant={ButtonVariant.tonal}
						id={buttonAdd_cancelId}>
						Cancel
					</Button>
					<Button
						c:variant={ButtonVariant.tonal}
						id={buttonAdd_importCSVId}>
						Import CSV
					</Button>
					<Button
						id={buttonAdd_previewId}
						c:variant={ButtonVariant.tonal}>
						Preview
					</Button>
					<Button
						id={buttonAdd_saveId}
						c:variant={ButtonVariant.filled}>
						Save
					</Button>
				</>}
				c:header="New list">
				<TextField ref={r => textFieldNewListNameRef = r} c:label="List name" />
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areaTextFieldNewItemListRef = r}
					c:label="Items"
					placeholder={"Item1, Item2,\nItem3, Item 4\nItem 5"}
					c:minLine={5}
					c:maxLine={5}
				/>
				<p><small>Info: Each item separated by comma or new line</small></p>
			</Dialog>
			<Dialog
				ref={r => dialogEditRef = r}
				style={{width: '500px'}}
				onClick={async ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonEdit_cancelId:
						closeDialog(dialogEditRef)
						break
					case buttonEdit_importCSVId:
						const text = await lsitItemFromCSVFile()
						updateAreaTextFieldValue(
							areaTextFieldExitItemListRef,
							arrayJoin(arrayFilter(
								[areaTextFieldNewItemListRef.value, ...text],
								v => stringLength(stringTrim(v)) > 0
							), ', ')
						)
						break
					case buttonEdit_previewId:
						setListViewItem({
							id: -1,
							name: textFieldEditListNameRef.value,
							items: arrayFilter(
								stringSplit(areaTextFieldExitItemListRef.value, /[\n,]/gs),
								v => stringLength(stringTrim(v)) > 0
							)
						})
						openDialog(dialogPreviewItemListRef)
						break
					case buttonEdit_saveId:
						editList()
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonEdit_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={buttonEdit_importCSVId}
						c:variant={ButtonVariant.tonal}>
						Import CSV
					</Button>
					<Button
						id={buttonEdit_previewId}
						c:variant={ButtonVariant.tonal}>
						Preview
					</Button>
					<Button
						id={buttonEdit_saveId}
						c:variant={ButtonVariant.filled}>
						Save
					</Button>
				</>}
				c:header="Edit list">
				<TextField
					ref={r => textFieldEditListNameRef = r}
					placeholder={selectedListToEdit().name}
					c:label="List name"
				/>
				<div style={{"min-height": '16px'}}/>
				<AreaTextField
					ref={r => areaTextFieldExitItemListRef = r}
					c:label="Items"
					placeholder={arrayJoin(selectedListToEdit().items, ', ')}
					c:minLine={5}
					c:maxLine={5}
				/>
				<p><small>Info: Each item separated by comma or new line</small></p>
			</Dialog>
			<Dialog
				ref={r => dialogViewItemListRef = r}
				style={{width: '720px'}}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonViewItemList_closeId:
						closeDialog(dialogViewItemListRef)
						break
					case buttonViewItemList_editId:
						closeDialog(dialogViewItemListRef)
						openEditDialog(listViewItem())
						break
					case buttonViewItemList_exportId:
						exportList(listViewItem())
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonViewItemList_closeId}
						c:variant={ButtonVariant.tonal}>
						Close
					</Button>
					<Button
						id={buttonViewItemList_exportId}
						c:variant={ButtonVariant.tonal}>
						Export
					</Button>
					<Button
						id={buttonViewItemList_editId}
						c:variant={ButtonVariant.filled}>
						Edit
					</Button>
				</>}
				c:header={listViewItem().name}>
				<div class={CSS.app_view_list}>
					<For each={[...listViewItem().items].sort()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
			<Dialog
				ref={r => dialogPreviewItemListRef = r}
				style={{width: '720px'}}
				c:actions={<Button
					onClick={() => closeDialog(dialogPreviewItemListRef)}
					c:variant={ButtonVariant.filled}>
					Close
				</Button>}
				c:header={listViewItem().name}>
				<div class={CSS.app_view_list}>
					<For each={[...listViewItem().items].sort()}>{l =>
						<div>{l}</div>
					}</For>
				</div>
			</Dialog>
		</>)
	}

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast c:leading={<Icon c:filled c:code={ICON_WARNING}/>} ref={r => toastListNameEmptyRef = r}>List name is empty</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_WARNING}/>} ref={r => toastListHaveNoItemsRef = r}>List items is empty</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_WARNING}/>} ref={r => toastListNameAlreadyExistRef = r}>List name already exist</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_TASK_LIST_SQUARE_LTR}/>} ref={r => toastListEditedRef = r}>List edited</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_DELETE}/>} ref={r => toastListDeletedRef = r}>List deleted</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_TASK_LIST_SQUARE_LTR}/>} ref={r => toastNewListAddedRef = r}>New list added</Toast>
			<Toast c:leading={<Icon c:filled c:code={ICON_APPS_LIST_DETAIL}/>} ref={r => toastNoListSelectedRef = r}>No list selected</Toast>
		</>)
	}

	return (<>
		<App
			c:appBar={<AppBar
				isGenerating={isGenerating()}
				randomizer={randomizer()}
				onCopyResult={onCopyResult}
				settings={[settings, setSettings]}
				command={command}
				onChangeRandomizer={onUpdateRandomizer}
			/>}
			c:floatingActionButton={<FloatingActionButton
				classList={attrClassListModule(CSSAnimation.btn_rotate_full_icon, CSS.app_fab)}
				data-g-keep-pointer-event={attrSetIfExist(isGenerating())}
				c:variant={ButtonVariant.filled}
				onClick={() => {
					if (isGenerating()) return command(Commands.stopGenerate)
					command(Commands.generate)
				}}>
				<Icon
					c:filled
					classList={attrClassListModule(CSS.app_generate_icon)}
					data-rotate={attrSetIfExist(isGenerating())}
					c:code={ICON_ARROW_SYNC}
				/>
				<Show when={isGenerating()} fallback="Generate">Generating</Show>
			</FloatingActionButton>}
			c:leftSideBar={<SideNavigation
				expanded={isSideNavigationExpanded()}
				randomizer={randomizer()}
				onChangeRandomizer={onUpdateRandomizer}
			/>}>
			<div class={CSS.app_body}>
				<Control
					randomizer={randomizer()}
					settings={[settings, setSettings]}
					lists={[lists, setlists]}
					command={command}
				/>
				<ResultComponent
					randomizer={randomizer()}
					result={[output, setOutput]}
					settings={[settings, setSettings]}
				/>
			</div>
		</App>
		<Dialogs />
		<Toasts />
	</>)
}

export default _