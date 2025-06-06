import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { Pages, SkinToneEmoji } from "../_shared/_enums"
import { validEnumValue } from "@/utils/object"
import { NavigationStore, type NavigationStoreType } from "./_navigation"
import { SettingsStore, type SettingsStoreType } from "./_settings"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	page: NavigationStoreType['page']
	'selected-emoji': string
	'settings/skin-tone': SettingsStoreType['skinTone']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.emojiPicker)
const _bodyTextFieldRef = $(ElementIds.bodyTextField) as HTMLInputElement

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
		switch (key as _StorageKeys) {
		case 'selected-emoji':
			if (isString) {
				_bodyTextFieldRef.value = value
			}
			break
		case "page":
			if (isString && validEnumValue(value, Pages)) {
				NavigationStore.update(v => ({...v, page: value as Pages}))
			}
			break
		case 'settings/skin-tone':
			if (isString && validEnumValue(value, SkinToneEmoji)) {
				SettingsStore.update(v => ({...v, skinTone: value as SkinToneEmoji}))
			}
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