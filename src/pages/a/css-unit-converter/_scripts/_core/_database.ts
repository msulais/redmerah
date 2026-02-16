import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { NavigationStore, type NavigationStoreType } from "./_navigation"
import { isValidEnumValue } from "@/utils/object"
import { Pages } from "../_shared/_enums"
import { AngleStore, type AngleStoreType } from "../_features/_angle"
import { AngleUnits, LengthUnits, TimeUnits } from "../_shared/_units"
import { TimeStore, type TimeStoreType } from "../_features/_time"
import { LengthStore, type LengthStoreType } from "../_features/_length"
import { SettingsStore, type SettingsStoreType } from "./_settings"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	page: NavigationStoreType['page']
	'page:angle/input': AngleStoreType['input']
	'page:angle/input-unit-id': AngleStoreType['inputUnit']['id']
	'page:angle/output-unit-id': AngleStoreType['outputUnit']['id']
	'page:time/input': TimeStoreType['input']
	'page:time/input-unit-id': TimeStoreType['inputUnit']['id']
	'page:time/output-unit-id': TimeStoreType['outputUnit']['id']
	'page:length/input': LengthStoreType['input']
	'page:length/input-unit-id': LengthStoreType['inputUnit']['id']
	'page:length/output-unit-id': LengthStoreType['outputUnit']['id']
	'settings:px-per-rem': SettingsStoreType['pxPerRem']
	'settings:px-per-percentage': SettingsStoreType['pxPerPercentage']
	'settings:px-per-viewport-height': SettingsStoreType['pxPerViewportHeight']
	'settings:px-per-viewport-width': SettingsStoreType['pxPerViewportWidth']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage'
}

const _db = new IDB(DatabaseNames.CSSUnitConverter)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.Storage)
		?.put({key, value} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) return true

		const isNumber = typeof value === 'number'
		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case "page":
			isValidEnumValue(value, Pages)
			&& NavigationStore.update(v => v.page = value)
			break
		case "page:angle/input":
			isNumber
			&& AngleStore.update(v => v.input = value)
			break
		case "page:angle/input-unit-id":
			isString
			&& AngleUnits.all.has(value)
			&& AngleStore.update(v => v.inputUnit = AngleUnits.all.get(value)!)
			break
		case "page:angle/output-unit-id":
			isString
			&& AngleUnits.all.has(value)
			&& AngleStore.update(v => v.outputUnit = AngleUnits.all.get(value)!)
			break
		case "page:time/input":
			isNumber
			&& TimeStore.update(v => v.input = value)
			break
		case "page:time/input-unit-id":
			isString
			&& TimeUnits.all.has(value)
			&& TimeStore.update(v => v.inputUnit = TimeUnits.all.get(value)!)
			break
		case "page:time/output-unit-id":
			isString
			&& TimeUnits.all.has(value)
			&& TimeStore.update(v => v.outputUnit = TimeUnits.all.get(value)!)
			break
		case "page:length/input":
			isNumber
			&& LengthStore.update(v => v.input = value)
			break
		case "page:length/input-unit-id":
			isString
			&& LengthUnits.all.has(value)
			&& LengthStore.update(v => v.inputUnit = LengthUnits.all.get(value)!)
			break
		case "page:length/output-unit-id":
			isString
			&& LengthUnits.all.has(value)
			&& LengthStore.update(v => v.outputUnit = LengthUnits.all.get(value)!)
			break
		case "settings:px-per-rem":
			isNumber
			&& SettingsStore.update(v => v.pxPerRem = value)
			break
		case "settings:px-per-percentage":
			isNumber
			&& SettingsStore.update(v => v.pxPerPercentage = value)
			break
		case "settings:px-per-viewport-height":
			isNumber
			&& SettingsStore.update(v => v.pxPerViewportHeight = value)
			break
		case "settings:px-per-viewport-width":
			isNumber
			&& SettingsStore.update(v => v.pxPerViewportWidth = value)
			break
		}

		return true
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) return

	_readStorageAll(store)
}

function _initDatabase(): void {
	_db.open({
		onSuccess() {
			_readStorage()
		},
		onUpgrade(_, db) {
			db.createStore<_IDBStoreStorage>({
				name: _ObjectStoreNames.Storage,
				keyPath: 'key',
				indexs: ['key', 'value']
			})
		},
	})
}

export default () => {
	_initDatabase()
}