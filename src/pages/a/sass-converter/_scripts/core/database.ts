import * as TabValues from '../shared/tab-values.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Tabs from './tabs.js'
import * as Converter from './converter.js'
import * as Settings from './settings.js'
import { IDB } from '@/utils/indexeddb'
import type { EnumOf } from '@/types/collections.js'
import { isValidEnumValue } from '@/utils/object.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'settings-text-wrap': boolean
	'settings-minify-css': boolean
	'input-sass': string
	'input-scss': string
	'tab-input': EnumOf<typeof TabValues>
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

		const isString = typeof value === 'string'
		const isBoolean = typeof value === 'boolean'
		switch (key as _StorageKeys) {
		case 'settings-text-wrap':
			isBoolean
			&& Settings.sg_textWrap.set(value)
			break
		case 'settings-minify-css':
			isBoolean
			&& Settings.sg_minify.set(value)
			break
		case 'input-sass':
			isString
			&& Converter.sg_sass.set(value)
			break
		case 'input-scss':
			isString
			&& Converter.sg_scss.set(value)
			break
		case 'tab-input':
			isString
			&& isValidEnumValue(value, TabValues)
			&& Tabs.sg_inputTab.set(value)
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