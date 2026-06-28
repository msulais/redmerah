import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as Length from '../features/length.js'
import * as Angle from '../features/angle.js'
import * as Time from '../features/time.js'
import { IDB } from '@/utils/indexeddb'
import { AngleUnits, LengthUnits, TimeUnits, type ConverterUnit } from '../shared/units.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'page-angle-input': number
	'page-angle-input-unit-id': ConverterUnit['id']
	'page-angle-output-unit-id': ConverterUnit['id']
	'page-time-input': number
	'page-time-input-unit-id': ConverterUnit['id']
	'page-time-output-unit-id': ConverterUnit['id']
	'page-length-input': number
	'page-length-input-unit-id': ConverterUnit['id']
	'page-length-output-unit-id': ConverterUnit['id']
	'settings-px-per-rem': number
	'settings-px-per-100%': number
	'settings-px-per-100vh': number
	'settings-px-per-100vw': number
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

		const isNumber = typeof value === 'number'
		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case 'page-angle-input':
			isNumber
			&& Angle.sg_input.set(value + '')
			break
		case 'page-angle-input-unit-id':
			isString
			&& AngleUnits.all.has(value)
			&& Angle.sg_inputUnit.set(AngleUnits.all.get(value)!)
			break
		case 'page-angle-output-unit-id':
			isString
			&& AngleUnits.all.has(value)
			&& Angle.sg_outputUnit.set(AngleUnits.all.get(value)!)
			break
		case 'page-time-input':
			isNumber
			&& Time.sg_input.set(value + '')
			break
		case 'page-time-input-unit-id':
			isString
			&& TimeUnits.all.has(value)
			&& Time.sg_inputUnit.set(TimeUnits.all.get(value)!)
			break
		case 'page-time-output-unit-id':
			isString
			&& TimeUnits.all.has(value)
			&& Time.sg_outputUnit.set(TimeUnits.all.get(value)!)
			break
		case 'page-length-input':
			isNumber
			&& Length.sg_input.set(value + '')
			break
		case 'page-length-input-unit-id':
			isString
			&& LengthUnits.all.has(value)
			&& Length.sg_inputUnit.set(LengthUnits.all.get(value)!)
			break
		case 'page-length-output-unit-id':
			isString
			&& LengthUnits.all.has(value)
			&& Length.sg_outputUnit.set(LengthUnits.all.get(value)!)
			break
		case 'settings-px-per-rem':
			isNumber
			&& Settings.sg_pxPerRem.set(value)
			break
		case 'settings-px-per-100%':
			isNumber
			&& Settings.sg_pxPer100Percent.set(value)
			break
		case 'settings-px-per-100vh':
			isNumber
			&& Settings.sg_pxPer100VH.set(value)
			break
		case 'settings-px-per-100vw':
			isNumber
			&& Settings.sg_pxPer100VW.set(value)
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