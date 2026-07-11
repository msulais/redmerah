import * as RandomizerNumber from '../shared/randomizer-number.js'
import * as Constant from '../shared/constant.enum.js'
import { IDB } from '@/utils/indexeddb'
import type { EnumOf } from '@/types/collections.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'settings-instant-result': boolean

	'page-string-length': number
	'page-string-output': string
	'page-string-custom': string
	'page-string-uppercase': boolean
	'page-string-lowercase': boolean
	'page-string-numbers': boolean
	'page-string-symbols': boolean

	'page-number-min': number
	'page-number-max': number
	'page-number-count': number
	'page-number-sort': EnumOf<typeof RandomizerNumber.SortDirection>
	'page-number-type': EnumOf<typeof RandomizerNumber.NumberTypes>
	'page-number-min-digits': number
	'page-number-separator': string
	'page-number-prefix': string
	'page-number-suffix': string
	'page-number-repeat': boolean
	'page-number-output': string
}

type _StorageKeys = keyof _StorageItems

const _ObjectStoreNames = {
	Storage: 'storage'
} as const
type _ObjectStoreNames = typeof _ObjectStoreNames[keyof typeof _ObjectStoreNames]

const _db = new IDB(Constant.APP.name.replace(/[^A-Za-z]/g, '_'))
const _storageTimeoutIds = new Map<_StorageKeys, ReturnType<typeof setTimeout>>()

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K], delayDuration = 250) {
	clearTimeout(_storageTimeoutIds.get(key))
	_storageTimeoutIds.set(key, setTimeout(() => {
		_db
		.writeStore(_ObjectStoreNames.Storage)
		?.put({key, value} satisfies _IDBStoreStorage<_StorageItems[K]>)
	}, delayDuration))
}

function _readAllStorage(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) {
			return true
		}

		// TODO
		switch (key as _StorageKeys) {
		case "a":
		case "b":
		case "c":
		}

		return true
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) {
		return
	}

	_readAllStorage(store)
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