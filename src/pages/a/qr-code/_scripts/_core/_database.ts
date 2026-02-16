import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { NavigationStore, type NavigationStoreType } from "./_navigation"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { isValidEnumValue } from "@/utils/object"
import { EncodingMode, ErrorCorrectionLevel, Pages, QRVersion } from "../_shared/_enums"
import { isColorValidWithAlpha } from "@/utils/color"
import type { HEXColor } from "@/types/color"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	page: NavigationStoreType['page']
	'settings:ecl': SettingsStoreType['errorCorrectionLevel']
	'settings:encoding-mode': SettingsStoreType['encodingMode'],
	'settings:version': SettingsStoreType['version']
	'settings:background-color': SettingsStoreType['backgroundColor']
	'settings:color': SettingsStoreType['color']
	'settings:margin': SettingsStoreType['margin']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage'
}

const _db = new IDB(DatabaseNames.QRCode)

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
		case "settings:ecl":
			isValidEnumValue(value, ErrorCorrectionLevel)
			&& SettingsStore.update(v => v.errorCorrectionLevel = value)
			break
		case "settings:encoding-mode":
			isValidEnumValue(value, EncodingMode)
			&& SettingsStore.update(v => v.encodingMode = value)
			break
		case "settings:version":
			isValidEnumValue(value, QRVersion)
			&& SettingsStore.update(v => v.version = value)
			break
		case "settings:background-color":
			isString
			&& isColorValidWithAlpha(value)
			&& SettingsStore.update(v => v.backgroundColor = value as HEXColor)
			break
		case "settings:color":
			isString
			&& isColorValidWithAlpha(value)
			&& SettingsStore.update(v => v.color = value as HEXColor)
			break
		case "settings:margin":
			isNumber
			&& SettingsStore.update(v => v.margin = Math.max(value, 0))
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