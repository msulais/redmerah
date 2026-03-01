import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { NavigationStore } from "./navigation"
import { ConverterType, DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, Pages, ScientificAngleType } from "../shared/enums"
import { isValidEnumValue } from "@/utils/object"
import { SettingsStore } from "./settings"
import { MemoryStore, type MemoryStoreType } from "./memory"
import { BasicStore, type BasicStoreType } from "../features/basic"
import { ScientificStore, type ScientificStoreType } from "../features/scientific"
import { ConverterStore, type ConverterStoreType } from "../features/converter"
import { ProgrammerStore, type ProgrammerStoreType } from "../features/programmer"
import { DateStore, type DateStoreType } from "../features/date"
import { isNumberDefined } from "@/utils/number"
import { AllUnits } from "../shared/units"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	page                         : Pages
	'sett:decimal'               : DecimalNumberFormat
	'sett:grouping'              : GroupingNumberFormat
	'memory-value'               : MemoryStoreType['value']
	'calc:basic/input'           : BasicStoreType['input']
	'calc:scientific/input'      : ScientificStoreType['input']
	'calc:scientific/angle'      : ScientificStoreType['angle']
	'calc:converter/input'       : ConverterStoreType['input']
	'calc:converter/type'        : ConverterStoreType['converter']
	'calc:converter/input-unit'  : ConverterStoreType['inputUnit']['id']
	'calc:converter/output-unit' : ConverterStoreType['outputUnit']['id']
	'calc:programmer/input'      : ProgrammerStoreType['input']
	'calc:programmer/number-type': ProgrammerStoreType['numberType']
	'calc:date/operation'        : DateStoreType['operation']
	'calc:date/input-from'       : DateStoreType['inputFrom']['toISOString']['name']
	'calc:date/input-to'         : DateStoreType['inputTo']['toISOString']['name']
	'calc:date/input-years'      : DateStoreType['inputYears']
	'calc:date/input-months'     : DateStoreType['inputMonths']
	'calc:date/input-days'       : DateStoreType['inputDays']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage'
}

const _db = new IDB(DatabaseNames.Calculator)

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

		const isNumber = typeof value === 'number'
		const isString = typeof value === 'string'
		switch (key as _StorageKeys) {
		case "calc:converter/input-unit":
		case "calc:converter/output-unit":
		case "calc:converter/type":
		case "calc:programmer/input":
		case "calc:programmer/number-type":
			break
		case "page":
			isValidEnumValue(value, Pages)
			&& NavigationStore.update(v => v.page = value)
			break
		case "sett:decimal":
			isValidEnumValue(value, DecimalNumberFormat)
			&& SettingsStore.update(v => v.decimalFormat = value)
			break
		case "sett:grouping":
			isValidEnumValue(value, GroupingNumberFormat)
			&& SettingsStore.update(v => v.groupingFormat = value)
			break
		case "memory-value":
			isNumber
			&& MemoryStore.update(v => v.value = value)
			break
		case "calc:basic/input":
			isString
			&& BasicStore.update(v => v.input = value)
			break
		case "calc:scientific/input":
			isString
			&& ScientificStore.update(v => v.input = value)
			break
		case "calc:scientific/angle":
			isValidEnumValue(value, ScientificAngleType)
			&& ScientificStore.update(v => v.angle = value)
			break
		case "calc:converter/input":
			isString
			&& ConverterStore.update(v => v.input = value)
			break
		case "calc:date/operation":
			isValidEnumValue(value, DateOperation)
			&& DateStore.update(v => v.operation = value)
			break
		case "calc:date/input-from":
			isString
			&& isNumberDefined(new Date(value).valueOf())
			&& DateStore.update(v => v.inputFrom = new Date(value))
			break
		case "calc:date/input-to":
			isString
			&& isNumberDefined(new Date(value).valueOf())
			&& DateStore.update(v => v.inputTo = new Date(value))
			break
		case "calc:date/input-years":
			isNumber
			&& DateStore.update(v => v.inputYears = value)
			break
		case "calc:date/input-months":
			isNumber
			&& DateStore.update(v => v.inputMonths = value)
			break
		case "calc:date/input-days":
			isNumber
			&& DateStore.update(v => v.inputDays = value)
			break
		}

		return true
	})
}

function _readStorageConverter(store: IDBObjectStore): void {
	_db.get<_IDBStoreStorage<_StorageItems['calc:converter/type']>>(store,
		'calc:converter/type' satisfies _StorageKeys
	).then(v => {
		const value = v?.value
		if (!value || !isValidEnumValue(value, ConverterType)) return

		ConverterStore.update(v => v.converter = value as ConverterType)
		_db.get<_IDBStoreStorage<_StorageItems['calc:converter/input-unit']>>(store,
			'calc:converter/input-unit' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) return

			const unit = AllUnits.find(v => v.id === value)
			if (!unit) return

			ConverterStore.update(v => v.inputUnit = unit)
		})

		_db.get<_IDBStoreStorage<_StorageItems['calc:converter/output-unit']>>(store,
			'calc:converter/output-unit' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) return

			const unit = AllUnits.find(v => v.id === value)
			if (!unit) return

			ConverterStore.update(v => v.outputUnit = unit)
		})
	})
}

function _readStorageProgrammer(store: IDBObjectStore): void {
	_db.get<_IDBStoreStorage<_StorageItems['calc:programmer/number-type']>>(store,
		'calc:programmer/number-type' satisfies _StorageKeys
	).then(v => {
		const value = v?.value
		if (!value || !isValidEnumValue(value, NumberType)) return

		ProgrammerStore.update(v => v.numberType = value)

		_db.get<_IDBStoreStorage<_StorageItems['calc:programmer/input']>>(store,
			'calc:programmer/input' satisfies _StorageKeys
		).then(v => {
			const value = v?.value
			if (!value) return

			ProgrammerStore.update(v => v.input = value)
		})
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) return

	_readStorageAll(store)
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