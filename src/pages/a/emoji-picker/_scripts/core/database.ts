import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { $ } from "./dom-utils"
import { ElementIds } from "../shared/ids"
import { Pages, SkinToneEmoji } from "../shared/enums"
import { isValidEnumValue } from "@/utils/object"
import { NavigationStore, type NavigationStoreType } from "./navigation"
import { SettingsStore, type SettingsStoreType } from "./settings"

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
	Storage = 'storage'
}

const _db = new IDB(DatabaseNames.EmojiPicker)
const _bodyTextFieldRef = $(ElementIds.bd_input) as HTMLInputElement

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

		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case 'selected-emoji':
			isString
			&& (_bodyTextFieldRef.value = value)
			break
		case "page":
			isValidEnumValue(value, Pages)
			&& NavigationStore.update(v => v.page = value)
			break
		case 'settings/skin-tone':
			isValidEnumValue(value, SkinToneEmoji)
			&& SettingsStore.update(v => v.skinTone = value)
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