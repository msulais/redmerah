import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { NavigationStore } from "./_navigation"
import { isValidEnumValue } from "@/utils/object"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { Pages } from "../_shared/_enums"
import { TimerStore, type TimerStoreType } from "../_features/_timer"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	page: Pages
	'settings/keep-awake': SettingsStoreType['keepAwake']
	'timer/seconds': TimerStoreType['timerInSeconds']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.clock)

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
		const isBoolean = typeof value === 'boolean'
		switch (key as _StorageKeys) {
		case "page":
			if (isValidEnumValue(value, Pages)) {
				NavigationStore.update(v => ({...v, page: value as Pages}))
			}
			break
		case "settings/keep-awake":
			if (isBoolean) {
				SettingsStore.update(v => ({...v, keepAwake: value}))
			}
			break
		case "timer/seconds":
			if (isNumber) {
				TimerStore.update(v => ({...v, currentSeconds: value, timerInSeconds: value}))
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