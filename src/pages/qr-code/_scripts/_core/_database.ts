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
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.qrCode)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.storage)
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
			if (isString && isValidEnumValue(value, Pages)) {
				NavigationStore.update(v => ({...v, page: value as Pages}))
			}
			break
		case "settings:ecl":
			if (isString && isValidEnumValue(value, ErrorCorrectionLevel)) {
				SettingsStore.update(v => ({...v, errorCorrectionLevel: value as ErrorCorrectionLevel}))
			}
			break
		case "settings:encoding-mode":
			if (isString && isValidEnumValue(value, EncodingMode)) {
				SettingsStore.update(v => ({...v, encodingMode: value as EncodingMode}))
			}
			break
		case "settings:version":
			if (isString && isValidEnumValue(value, QRVersion)) {
				SettingsStore.update(v => ({...v, version: value as QRVersion}))
			}
			break
		case "settings:background-color":
			if (isString && isColorValidWithAlpha(value)) {
				SettingsStore.update(v => ({...v, backgroundColor: value as HEXColor}))
			}
			break
		case "settings:color":
			if (isString && isColorValidWithAlpha(value)) {
				SettingsStore.update(v => ({...v, color: value as HEXColor}))
			}
			break
		case "settings:margin":
			if (isNumber) {
				SettingsStore.update(v => ({...v, margin: Math.max(value, 0)}))
			}
			break
		}

		return true
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.storage)
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
				name: _ObjectStoreNames.storage,
				keyPath: 'key',
				indexs: ['key', 'value']
			})
		},
	})
}

export default () => {
	_initDatabase()
}