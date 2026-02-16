import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { deepCopy } from "@/utils/object"
import { VibratorStore, type VibratorStoreType } from "./_vibrator"
import { safeNumber } from "@/utils/number"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	pattern: VibratorStoreType['pattern']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage'
}

const _db = new IDB(DatabaseNames.Vibrator)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.Storage)
		?.put({key, value: deepCopy(value)} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) return true

		const isArray = Array.isArray(value)
		switch (key as _StorageKeys) {
		case "pattern":
			isArray
			&& VibratorStore.update(v => v.pattern = value
				.map(v => Math.min(0, safeNumber(typeof v === 'number'
					? v
					: Number.parseInt(`${v}`)
				)))
			)
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