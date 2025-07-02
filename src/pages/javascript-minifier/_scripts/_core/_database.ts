import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { MinifyStore, type MinifyStoreType } from "./_minify"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	input: MinifyStoreType['input']
	'settings:beautify': SettingsStoreType['beautify']
	'settings:keep-class-names': SettingsStoreType['keepClassNames']
	'settings:keep-function-names': SettingsStoreType['keepFunctionNames']
	'settings:module': SettingsStoreType['module']
	'settings:text-wrap': SettingsStoreType['textWrap']
	'settings:top-level': SettingsStoreType['topLevel']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.javascriptMinifier)

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

		const isBoolean = typeof value === 'boolean'
		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case "input":
			if (isString) {
				MinifyStore.update(v => ({...v, input: value}))
			}
			break
		case "settings:beautify":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, beautify: value}))
			}
			break
		case "settings:keep-class-names":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, keepClassNames: value}))
			}
			break
		case "settings:keep-function-names":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, keepFunctionNames: value}))
			}
			break
		case "settings:module":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, module: value}))
			}
			break
		case "settings:text-wrap":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, textWrap: value}))
			}
			break
		case "settings:top-level":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, topLevel: value}))
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