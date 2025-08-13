import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { deepCopy } from "@/utils/object"
import { CheckerStore, type CheckerStoreType } from "./_checker"
import { isColorValid } from "@/utils/color"
import type { HEXColor } from "@/types/color"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'foreground-color': CheckerStoreType['foreground']
	'background-color': CheckerStoreType['background']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.contrastChecker)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.storage)
		?.put({key, value: deepCopy(value)} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) return true

		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case "foreground-color":
			isString
			&& isColorValid(value)
			&& CheckerStore.update(v => v.foreground = value as HEXColor)
			break
		case "background-color":
			isString
			&& isColorValid(value)
			&& CheckerStore.update(v => v.background = value as HEXColor)
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