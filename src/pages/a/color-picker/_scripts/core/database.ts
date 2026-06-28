import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as Picker from './picker.js'
import * as ColorPickerMode from '../shared/modes.enum.js'
import { IDB } from '@/utils/indexeddb'
import type { EnumOf } from '@/types/collections.js'
import { isValidEnumValue } from '@/utils/object.js'
import { colorToRgb, hslToHsv, hsvToHwb, rgbToCmyk, rgbToHex, rgbToHsl } from '@/utils/color.js'
import { batch } from '@/utils/signal.js'

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'color': number
	'color-picker-mode': EnumOf<typeof ColorPickerMode>
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
		switch (key as _StorageKeys) {
		case 'color':
			if (isNumber) {
				const rgb = colorToRgb(value)
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batch(() => {
					Picker.sg_rgb.set(rgb)
					Picker.sg_hex.set(hex)
					Picker.sg_hsv.set(hsv)
					Picker.sg_hsl.set(hsl)
					Picker.sg_hwb.set(hwb)
					Picker.sg_cmyk.set(cmyk)
				})
			}
			break
		case 'color-picker-mode':
			isString
			&& isValidEnumValue(value, ColorPickerMode)
			&& Settings.sg_pickerMode.set(value as EnumOf<typeof ColorPickerMode>)
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