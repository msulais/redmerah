import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { ColorsStore, type ColorsStoreType } from "./_colors"
import { colorIsValid } from "@/utils/color"
import type { HEXColor } from "@/types/color"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'colors/seed': ColorsStoreType['seed']
	'colors/palette': ColorsStoreType['palette']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.colorGenerator)

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

		const isString = typeof value === 'string'
		const isArray = Array.isArray(value)
		switch (key as _StorageKeys) {
		case "colors/seed":
			if (isString && colorIsValid(value)) {
				ColorsStore.update(v => ({...v, seed: value as HEXColor}))
			}
			break
		case "colors/palette":
			if (isArray) {
				ColorsStore.update(v => ({...v, palette: value.filter(v => colorIsValid(v))}))
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