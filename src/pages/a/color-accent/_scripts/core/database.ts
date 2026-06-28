import * as Constant from '../shared/constant.enum.js'
import * as Colors from './colors.js'
import type { HEXColor } from '@/types/color.js'
import { isColorValid } from '@/utils/color.js'
import { IDB } from '@/utils/indexeddb'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'seed': HEXColor
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
		if (value === null || value === undefined) return true

		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case "seed":
			isString
			&& isColorValid(value)
			&& Colors.sg_seed.set(value as HEXColor)
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