import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as Latex from './latex.js'
import { IDB } from '@/utils/indexeddb'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'inputs': string[]
	'settings-prefix': string
	'settings-suffix': string
	'settings-text-wrap': boolean
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

		const isBoolean = typeof value === 'boolean'
		const isString = typeof value === 'string'
		const isArray = Array.isArray(value)
		switch (key as _StorageKeys) {
		case 'inputs':
			isArray
			&& Latex.sg_inputs.set(value.map(v => String(v)))
			break
		case 'settings-prefix':
			isString
			&& Settings.sg_prefix.set(value)
			break
		case 'settings-suffix':
			isString
			&& Settings.sg_suffix.set(value)
			break
		case 'settings-text-wrap':
			isBoolean
			&& Settings.sg_textWrap.set(value)
			break
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