import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { ListsStore, updateSelectedList, type ListItem } from "./_lists"
import { NavigationStore, type NavigationStoreType } from "./_navigation"
import { ColorsStore, type ColorsStoreType } from "../_features/_colors"
import { NumbersStore, type NumbersStoreType } from "../_features/_numbers"
import { SelectionStore, type SelectionStoreType } from "../_features/_selection"
import { StringStore, type StringStoreType } from "../_features/_string"
import { TeamsStore, type TeamsStoreType } from "../_features/_teams"
import { WordsStore, type WordsStoreType } from "../_features/_words"
import { deepCopy, isValidEnumValue } from "@/utils/object"
import { ColorsRandomizerSpace, NumbersRandomizerType, NumbersRandomizerSort, Pages, WordsRandomizerCase } from "../_shared/_enums"
import { isColorValid } from "@/utils/color"
import { DEFAULT_LISTS } from "../_shared/_constant"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _IDBStoreLists = ListItem

type _StorageItems = {
	page: NavigationStoreType['page']
	'settings:instant-result': SettingsStoreType['instantResult']
	'colors:count': ColorsStoreType['count']
	'colors:color-space': ColorsStoreType['colorSpace']
	'colors:hex-min': ColorsStoreType['hexMin']
	'colors:hex-max': ColorsStoreType['hexMax']
	'colors:rgb-r-min': ColorsStoreType['rgbRMin']
	'colors:rgb-r-max': ColorsStoreType['rgbRMax']
	'colors:rgb-g-min': ColorsStoreType['rgbGMin']
	'colors:rgb-g-max': ColorsStoreType['rgbGMax']
	'colors:rgb-b-min': ColorsStoreType['rgbBMin']
	'colors:rgb-b-max': ColorsStoreType['rgbBMax']
	'colors:hsl-h-min': ColorsStoreType['hslHMin']
	'colors:hsl-h-max': ColorsStoreType['hslHMax']
	'colors:hsl-s-min': ColorsStoreType['hslSMin']
	'colors:hsl-s-max': ColorsStoreType['hslSMax']
	'colors:hsl-l-min': ColorsStoreType['hslLMin']
	'colors:hsl-l-max': ColorsStoreType['hslLMax']
	'colors:output': ColorsStoreType['output']
	'numbers:min': NumbersStoreType['min']
	'numbers:max': NumbersStoreType['max']
	'numbers:count': NumbersStoreType['count']
	'numbers:sort': NumbersStoreType['sort']
	'numbers:type': NumbersStoreType['type']
	'numbers:min-digits': NumbersStoreType['minDigits']
	'numbers:separator': NumbersStoreType['separator']
	'numbers:prefix': NumbersStoreType['prefix']
	'numbers:suffix': NumbersStoreType['suffix']
	'numbers:repeat': NumbersStoreType['repeat']
	'numbers:output': NumbersStoreType['output']
	'selection:count': SelectionStoreType['count']
	'selection:list-id': SelectionStoreType['listId']
	'selection:list-items': SelectionStoreType['listItems']
	'selection:output': SelectionStoreType['output']
	'string:length': StringStoreType['length']
	'string:output': StringStoreType['output']
	'string:custom': StringStoreType['custom']
	'string:uppercase': StringStoreType['uppercase']
	'string:lowercase': StringStoreType['lowercase']
	'string:numbers': StringStoreType['numbers']
	'string:symbols': StringStoreType['symbols']
	'teams:names-id': TeamsStoreType['namesId']
	'teams:members-id': TeamsStoreType['membersId']
	'teams:count': TeamsStoreType['count']
	'teams:output': TeamsStoreType['output']
	'words:count': WordsStoreType['count']
	'words:list-id': WordsStoreType['listId']
	'words:prefix': WordsStoreType['prefix']
	'words:suffix': WordsStoreType['suffix']
	'words:separator': WordsStoreType['separator']
	'words:word-case': WordsStoreType['wordCase']
	'words:repeat': WordsStoreType['repeat']
	'words:output': WordsStoreType['output']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage',
	Lists = 'lists'
}

const _db = new IDB(DatabaseNames.Randomizer)

export function saveListItem(list: ListItem) {
	return _db.writeStore(_ObjectStoreNames.Lists)?.put(
		deepCopy(list) satisfies _IDBStoreLists
	)
}

export function deleteListItem(listId: ListItem['id']) {
	return _db.writeStore(_ObjectStoreNames.Lists)?.delete(listId)
}

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.Storage)
		?.put({key, value: deepCopy(value)} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) {
			return true
		}

		const isBoolean = typeof value === 'boolean'
		const isString = typeof value === 'string'
		const isNumber = typeof value === 'number'
		const isArray = Array.isArray(value)
		switch (key as _StorageKeys) {
		case "page":
			isValidEnumValue(value, Pages)
			&& NavigationStore.update(v => v.page = value)
			break
		case "settings:instant-result":
			isBoolean
			&& SettingsStore.update(v => v.instantResult = value)
			break
		case "colors:count":
			isNumber
			&& ColorsStore.update(v => v.count = value)
			break
		case "colors:color-space":
			isValidEnumValue(value, ColorsRandomizerSpace)
			&& ColorsStore.update(v => v.colorSpace = value)
		 	break
		case "colors:hex-min":
			isNumber
			&& ColorsStore.update(v => v.hexMin = value)
			break
		case "colors:hex-max":
			isNumber
			&& ColorsStore.update(v => v.hexMax = value)
			break
		case "colors:rgb-r-min":
			isNumber
			&& ColorsStore.update(v => v.rgbRMin = value)
			break
		case "colors:rgb-r-max":
			isNumber
			&& ColorsStore.update(v => v.rgbRMax = value)
			break
		case "colors:rgb-g-min":
			isNumber
			&& ColorsStore.update(v => v.rgbGMin = value)
			break
		case "colors:rgb-g-max":
			isNumber
			&& ColorsStore.update(v => v.rgbGMax = value)
			break
		case "colors:rgb-b-min":
			isNumber
			&& ColorsStore.update(v => v.rgbBMin = value)
			break
		case "colors:rgb-b-max":
			isNumber
			&& ColorsStore.update(v => v.rgbBMax = value)
			break
		case "colors:hsl-h-min":
			isNumber
			&& ColorsStore.update(v => v.hslHMin = value)
			break
		case "colors:hsl-h-max":
			isNumber
			&& ColorsStore.update(v => v.hslHMax = value)
			break
		case "colors:hsl-s-min":
			isNumber
			&& ColorsStore.update(v => v.hslSMin = value)
			break
		case "colors:hsl-s-max":
			isNumber
			&& ColorsStore.update(v => v.hslSMax = value)
			break
		case "colors:hsl-l-min":
			isNumber
			&& ColorsStore.update(v => v.hslLMin = value)
			break
		case "colors:hsl-l-max":
			isNumber
			&& ColorsStore.update(v => v.hslLMax = value)
			break
		case "colors:output":
			isArray
			&& ColorsStore.update(v => v.output =  value.filter(v => isColorValid(v)))
			break
		case "numbers:min":
			isNumber
			&& NumbersStore.update(v => v.min = value)
			break
		case "numbers:max":
			isNumber
			&& NumbersStore.update(v => v.max = value)
			break
		case "numbers:count":
			isNumber
			&& NumbersStore.update(v => v.count = value)
			break
		case "numbers:sort":
			isValidEnumValue(value, NumbersRandomizerSort)
			&& NumbersStore.update(v => v.sort = value)
			break
		case "numbers:type":
			isValidEnumValue(value, NumbersRandomizerType)
			&& NumbersStore.update(v => v.type = value)
			break
		case "numbers:min-digits":
			isNumber
			&& NumbersStore.update(v => v.minDigits = value)
			break
		case "numbers:separator":
			isString
			&& NumbersStore.update(v => v.separator = value)
			break
		case "numbers:prefix":
			isString
			&& NumbersStore.update(v => v.prefix = value)
			break
		case "numbers:suffix":
			isString
			&& NumbersStore.update(v => v.suffix = value)
			break
		case "numbers:repeat":
			isBoolean
			&& NumbersStore.update(v => v.repeat = value)
			break
		case "numbers:output":
			isString
			&& NumbersStore.update(v => v.output = value)
			break
		case "selection:count":
			isNumber
			&& SelectionStore.update(v => v.count = value)
			break
		case "selection:list-id":
			isNumber
			&& SelectionStore.update(v => v.listId = value)
			break
		case "selection:list-items":
			isArray
			&& SelectionStore.update(v => v.listItems = value.map(v => String(v)))
			break
		case "selection:output":
			isArray
			&& SelectionStore.update(v => v.output = value.map(v => String(v)))
			break
		case "string:length":
			isNumber
			&& StringStore.update(v => v.length = value)
			break
		case "string:output":
			isString
			&& StringStore.update(v => v.output = value)
			break
		case "string:custom":
			isString
			&& StringStore.update(v => v.custom = value)
			break
		case "string:uppercase":
			isBoolean
			&& StringStore.update(v => v.uppercase = value)
			break
		case "string:lowercase":
			isBoolean
			&& StringStore.update(v => v.lowercase = value)
			break
		case "string:numbers":
			isBoolean
			&& StringStore.update(v => v.numbers = value)
			break
		case "string:symbols":
			isBoolean
			&& StringStore.update(v => v.symbols = value)
			break
		case "teams:names-id":
			isNumber
			&& TeamsStore.update(v => v.namesId = value)
			break
		case "teams:members-id":
			isNumber
			&& TeamsStore.update(v => v.membersId = value)
			break
		case "teams:count":
			isNumber
			&& TeamsStore.update(v => v.count = value)
			break
		case "teams:output":
			isArray
			&& TeamsStore.update(v => v.output = value
				.filter(v => Array.isArray(v))
				.map(v => v.map(v => String(v)))
			)
			break
		case "words:count":
			isNumber
			&& WordsStore.update(v => v.count = value)
			break
		case "words:list-id":
			isNumber
			&& WordsStore.update(v => v.listId = value)
			break
		case "words:prefix":
			isString
			&& WordsStore.update(v => v.prefix = value)
			break
		case "words:suffix":
			isString
			&& WordsStore.update(v => v.suffix = value)
			break
		case "words:separator":
			isString
			&& WordsStore.update(v => v.separator = value)
			break
		case "words:word-case":
			isValidEnumValue(value, WordsRandomizerCase)
			&& WordsStore.update(v => v.wordCase = value)
			break
		case "words:repeat":
			isBoolean
			&& WordsStore.update(v => v.repeat = value)
			break
		case "words:output":
			isString
			&& WordsStore.update(v => v.output = value)
			break
		}

		return true
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) {return}

	_readStorageAll(store)
}

function _readLists(): void {
	const store = _db.readStore(_ObjectStoreNames.Lists)
	if (!store) {return}

	_db.getAll<ListItem>(store).then((values) => {
		const lists: ListItem[] = []
		for (const list of values) {
			lists.push(deepCopy(list))
		}

		lists.sort((a, b) => a.name.localeCompare(b.name))
		ListsStore.update(v => v.list = lists
			.map(v => (v.items.sort((a, b) => a.localeCompare(b)), v))
		)
		updateSelectedList()
	})

}

function _initDatabase(): void {
	_db.open({
		onSuccess() {
			_readStorage()
			_readLists()
		},
		onUpgrade(_, db) {
			db.createStore<_IDBStoreStorage>({
				name: _ObjectStoreNames.Storage,
				keyPath: 'key',
				indexs: ['key', 'value']
			})

			const listStore = db.createStore<_IDBStoreLists>({
				name: _ObjectStoreNames.Lists,
				keyPath: 'id',
				indexs: ['id', 'name', 'items']
			})

			if (listStore) {
				for (const list of DEFAULT_LISTS) {
					db.put(listStore,
						deepCopy(list) satisfies _IDBStoreLists
					)
				}
			}
		},
	})
}

export default () => {
	_initDatabase()
}