import { DatabaseNames } from "@/enums/storage"
import { colorToRgb, hslToHsv, hsvToHwb, rgbToCmyk, rgbToHex, rgbToHsl } from "@/utils/color"
import { IDB } from "@/utils/indexeddb"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { PickerStore } from "./_picker"
import { ColorPickerMode } from "../_shared/_enums"
import { isValidEnumValue } from "@/utils/object"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _StorageItems = {
	'color': number
	'settings:picker-mode': SettingsStoreType['pickerMode']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	storage = 'storage'
}

const _db = new IDB(DatabaseNames.colorPicker)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.storage)
		?.put({key, value} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) return true

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
				PickerStore.update(v =>{
					v.rgb = rgb
					v.hex = hex
					v.hsv = hsv
					v.hsl = hsl
					v.cmyk = cmyk
					v.hwb = hwb
				})
			}
			break
		case "settings:picker-mode":
			isValidEnumValue(value, ColorPickerMode)
			&& SettingsStore.update(v => v.pickerMode = value)
		}

		return true
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.storage)
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
				name: _ObjectStoreNames.storage,
				keyPath: 'key',
				indexs: ['key', 'value']
			})
		},
	})
}

export default () => {
	_initDatabase()
}