import * as Constant from '../shared/constant.enum.js'
import * as Generate from '../features/generate.js'
import type { HEXColor } from '@/types/color.js'
import { IDB } from '@/utils/indexeddb'
import { EncodingMode, ErrorCorrectionLevel } from '../shared/qrcode.js'
import { isColorValid } from '@/utils/color.js'
import { isValidEnumValue } from '@/utils/object.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'page-generate-input': string
	'page-generate-version': number
	'page-generate-auto-version': boolean
	'page-generate-background-color': HEXColor
	'page-generate-color': HEXColor
	'page-generate-margin': number
	'page-generate-error-correction-level': ErrorCorrectionLevel
	'page-generate-encoding-mode': EncodingMode
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
		const isNumber = typeof value === 'number'
		const isBoolean = typeof value === 'boolean'
		switch (key as _StorageKeys) {
		case 'page-generate-input':
			isString
			&& Generate.sg_input.set(value)
			break
		case 'page-generate-version':
			isNumber
			&& Generate.sg_version.set(value)
			break
		case 'page-generate-auto-version':
			isBoolean
			&& Generate.sg_autoVersion.set(value)
			break
		case 'page-generate-background-color':
			isString
			&& isColorValid(value)
			&& Generate.sg_backgroundColor.set(value as HEXColor)
			break
		case 'page-generate-color':
			isString
			&& isColorValid(value)
			&& Generate.sg_color.set(value as HEXColor)
			break
		case 'page-generate-margin':
			isNumber
			&& Generate.sg_margin.set(value)
			break
		case 'page-generate-error-correction-level':
			isString
			&& isValidEnumValue(value, ErrorCorrectionLevel)
			&& Generate.sg_errorCorrectionLevel.set(value as ErrorCorrectionLevel)
			break
		case 'page-generate-encoding-mode':
			isString
			&& isValidEnumValue(value, EncodingMode)
			&& Generate.sg_encodingMode.set(value as EncodingMode)
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