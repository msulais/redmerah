import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { LatexStore, type LatexStoreType } from "./_latex"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	latex: LatexStoreType['latex']
	'settings:prefix': SettingsStoreType['prefix']
	'settings:suffix': SettingsStoreType['suffix']
	'settings:text-wrap': SettingsStoreType['textWrap']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.latexViewer)

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
		const isArray = Array.isArray(value)
		switch (key as _StorageKeys) {
		case "latex":
			if (isArray) {
				LatexStore.update(v => ({...v, latex: value.map(v => String(v))}))
			}
			break
		case "settings:prefix":
			if (isString) {
				SettingsStore.update(v => ({...v, prefix: value}))
			}
			break
		case "settings:suffix":
			if (isString) {
				SettingsStore.update(v => ({...v, suffix: value}))
			}
			break
		case "settings:text-wrap":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, textWrap: value}))
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