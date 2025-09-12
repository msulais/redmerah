import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { ConverterStore, type ConverterStoreType } from "./_converter"
import { isValidEnumValue } from "@/utils/object"
import { InputMode } from "../_shared/_enums"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'settings:text-wrap': SettingsStoreType['textWrap']
	'settings:minify-css': SettingsStoreType['minifyCSS']
	'settings:input-mode': SettingsStoreType['inputMode']
	'input:sass': ConverterStoreType['sass']
	'input:scss': ConverterStoreType['scss']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.sassConverter)

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
		case "settings:text-wrap":
			isBoolean
			&& SettingsStore.update(v => v.textWrap = value)
			break
		case "settings:minify-css":
			isBoolean
			&& SettingsStore.update(v => v.minifyCSS = value)
			break
		case "input:sass":
			isString
			&& ConverterStore.update(v => v.sass = value)
			break
		case "input:scss":
			isString
			&& ConverterStore.update(v => v.scss = value)
			break
		case "settings:input-mode":
			isValidEnumValue(value, InputMode)
			&& SettingsStore.update(v => v.inputMode = value)
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