import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as Basic from '../features/basic.js'
import * as Memory from './memory.js'
import * as Scientific from '../features/scientific.js'
import * as Converter from '../features/converter.js'
import * as Programmer from '../features/programmer.js'
import * as DDate from '../features/date.js'
import { ConverterTypes, DateOperation, DecimalNumberFormat, GroupingNumberFormat, ProgrammerNumTypes, ScientificAngleTypes } from '../shared/calculator.js'
import { IDB } from '@/utils/indexeddb'
import { AllUnits, ConverterUnit } from '../shared/units.js'
import { isValidEnumValue } from '@/utils/object.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'settings-decimal-format': DecimalNumberFormat
	'settings-grouping-format': GroupingNumberFormat
	'page-basic-input': string
	'page-scientific-angle': ScientificAngleTypes
	'page-scientific-input': string
	'page-converter-type': ConverterTypes
	'page-converter-input': string
	'page-converter-input-unit': ConverterUnit['id']
	'page-converter-output-unit': ConverterUnit['id']
	'page-programmer-num-type': ProgrammerNumTypes
	'page-programmer-input': string
	'page-date-operation': DateOperation
	'page-date-input-from': ReturnType<Date['toISOString']>
	'page-date-input-to': ReturnType<Date['toISOString']>
	'page-date-input-years': number
	'page-date-input-months': number
	'page-date-input-days': number
	'memory-value': number
}

type _StorageKeys = keyof _StorageItems

const _ObjectStoreNames = {
	Storage: 'storage'
} as const
type _ObjectStoreNames = typeof _ObjectStoreNames[keyof typeof _ObjectStoreNames]

const _db = new IDB(Constant.APP.name.replace(/[^A-Za-z]/g, '_'))
const _storageTimeoutIds = new Map<_StorageKeys, ReturnType<typeof setTimeout>>()

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K], delayDuration = 0) {
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
		switch (key as _StorageKeys) {
		case "page-converter-type":
		case "page-converter-input-unit":
		case "page-converter-output-unit":
		case "page-programmer-input":
		case "page-programmer-num-type":
			break
		case "settings-decimal-format":
			isString
			&& isValidEnumValue(value, DecimalNumberFormat)
			&& Settings.sg_decimalFormat.set(value as DecimalNumberFormat)
			break
		case 'settings-grouping-format':
			isString
			&& isValidEnumValue(value, GroupingNumberFormat)
			&& Settings.sg_groupingFormat.set(value as GroupingNumberFormat)
			break
		case 'page-basic-input':
			isString
			&& Basic.sg_input.set(value)
			break
		case 'page-scientific-input':
			isString
			&& Scientific.sg_input.set(value)
			break
		case 'page-scientific-angle':
			isString
			&& isValidEnumValue(value, ScientificAngleTypes)
			&& Scientific.sg_angle.set(value as ScientificAngleTypes)
			break
		case 'memory-value':
			isNumber
			&& Memory.sg_memoryValue.set(value)
			break
		case 'page-converter-input':
			isString
			&& Converter.sg_input.set(value)
			break
		case 'page-date-input-days':
			isNumber
			&& DDate.sg_inputDays.set(value)
			break
		case 'page-date-input-months':
			isNumber
			&& DDate.sg_inputMonths.set(value)
			break
		case 'page-date-input-years':
			isNumber
			&& DDate.sg_inputYears.set(value)
			break
		case 'page-date-operation':
			isString
			&& isValidEnumValue(value, DateOperation)
			&& DDate.sg_operation.set(value as DateOperation)
			break
		case 'page-date-input-from':
			isString
			&& !Number.isNaN(new Date(value).getTime())
			&& DDate.sg_inputFrom.set(new Date(value))
			break
		case 'page-date-input-to':
			isString
			&& !Number.isNaN(new Date(value).getTime())
			&& DDate.sg_inputTo.set(new Date(value))
			break
		}

		return true
	})
}

function _readStorageConverter(store: IDBObjectStore): void {
	_db.get<_IDBStoreStorage<_StorageItems['page-converter-type']>>(store,
		'page-converter-type' satisfies _StorageKeys
	).then(v => {
		const value = v?.value
		if (!value || !isValidEnumValue(value, ConverterTypes)) {
			return
		}

		Converter.sg_converter.set(value as ConverterTypes)
		_db.get<_IDBStoreStorage<_StorageItems['page-converter-input-unit']>>(store,
			'page-converter-input-unit' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) {
				return
			}

			const unit = AllUnits.find(v => v.id === value)
			if (!unit) {
				return
			}

			Converter.sg_inputUnit.set(unit)
		})

		_db.get<_IDBStoreStorage<_StorageItems['page-converter-output-unit']>>(store,
			'page-converter-output-unit' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) {
				return
			}

			const unit = AllUnits.find(v => v.id === value)
			if (!unit) {
				return
			}

			Converter.sg_outputUnit.set(unit)
		})
	})
}

function _readStorageProgrammer(store: IDBObjectStore): void {
	_db.get<_IDBStoreStorage<_StorageItems['page-programmer-num-type']>>(store,
		'page-programmer-num-type' satisfies _StorageKeys
	).then(v => {
		const value = v?.value
		if (!value || !isValidEnumValue(value, ProgrammerNumTypes)) {
			return
		}

		Programmer.sg_numType.set(value)
		_db.get<_IDBStoreStorage<_StorageItems['page-programmer-input']>>(store,
			'page-programmer-input' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) {
				return
			}

			Programmer.sg_input.set(value)
		})
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) {
		return
	}

	_readAllStorage(store)
	_readStorageConverter(store)
	_readStorageProgrammer(store)
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