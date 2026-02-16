import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { isValidEnumValue } from "@/utils/object"
import { SettingsStore, type SettingsStoreType } from "./_settings"
import { ColorSpace, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "../_shared/_enums"
import { PreviewStore, type PreviewStoreType } from "./_preview"
import { SavedGradients, type SavedGradientsType } from "./_saved-gradients"
import type { ColorStopGradient, GradientItem } from "./_gradients"
import { isColorValidWithAlpha } from "@/utils/color"

type _IDBStoreStorage<T = unknown> = {
	key: string
	value: T
}

type _IDBStoreGradients = {
	id: string

	/** `JSON.stringify` of `GradientItem[]` */
	gradients: string
}

type _StorageItems = {
	'settings:color-space': SettingsStoreType['colorSpace']
	'properties:border-radius': PreviewStoreType['borderRadius']
	'properties:width': PreviewStoreType['width']
	'properties:height': PreviewStoreType['height']
	'properties:clip-path': PreviewStoreType['clipPath']
}

type _StorageKeys = keyof _StorageItems

enum _ObjectStoreNames {
	Storage = 'storage',
	Gradients = 'gradients'
}

const _db = new IDB(DatabaseNames.colorGradient)

export function saveStorageItem<K extends _StorageKeys>(key: K, value: _StorageItems[K]) {
	return _db
		.writeStore(_ObjectStoreNames.Storage)
		?.put({key, value} satisfies _IDBStoreStorage<_StorageItems[K]>)
}

export function saveGradientDB(id: string, gradients: GradientItem[]) {
	return _db.writeStore(_ObjectStoreNames.Gradients)?.put({
		id: id,
		gradients: JSON.stringify(gradients)
	} satisfies _IDBStoreGradients)
}

export function removeGradientDB(id: string) {
	return _db.writeStore(_ObjectStoreNames.Gradients)?.delete(id)
}

function _readStorageAll(store: IDBObjectStore): void {
	_db.cursor(store, (cursor) => {
		const key = cursor?.key
		const value = cursor?.value.value
		if (value === null || value === undefined) return true

		const isString = typeof value === 'string'
		const isNumber = typeof value === 'number'
		switch (key as _StorageKeys) {
		case 'settings:color-space':
			isValidEnumValue(value, ColorSpace)
			&& SettingsStore.update(v => v.colorSpace = value)
			break
		case "properties:border-radius":
			isNumber
			&& PreviewStore.update(v => v.borderRadius = Math.max(0, value))
			break
		case "properties:width":
			isNumber
			&& PreviewStore.update(v => v.width = Math.max(0, value))
			break
		case "properties:height":
			isNumber
			&& PreviewStore.update(v => v.height = Math.max(0, value))
			break
		case "properties:clip-path":
			isString
			&& PreviewStore.update(v => v.clipPath = value)
			break
		}

		return true
	})
}

function _readGradients(): void {
	const store = _db.readStore(_ObjectStoreNames.Gradients)
	if (!store) {return}

	_db.getAll<_IDBStoreGradients>(store).then((v) => {
		const gradients: SavedGradientsType['gradients'] = []
		for (const d of v) {
			const parsed: GradientItem[] = JSON.parse(d.gradients)
			if (!Array.isArray(parsed)) {
				continue
			}

			const grad: GradientItem[] = []
			level_2: for (const g of parsed) {
				const invalid = (
					typeof g.angle !== 'number'
					|| typeof g.colorMethod !== 'string'
					|| typeof g.height !== 'number'
					|| typeof g.hueMethod !== 'string'
					|| typeof g.positionX !== 'number'
					|| typeof g.positionY !== 'number'
					|| typeof g.repeat !== 'boolean'
					|| typeof g.shape !== 'string'
					|| typeof g.size !== 'number'
					|| typeof g.type !== 'string'
					|| typeof g.width !== 'number'
					|| !isValidEnumValue(g.type, GradientType)
					|| !isValidEnumValue(g.colorMethod, [
						...Object.values(PolarColorSpace),
						...Object.values(RectangularColorSpace)
					])
					|| !isValidEnumValue(g.hueMethod, HueInterpolationMethod)
					|| !isValidEnumValue(g.shape, RadialGradientShape)
					|| !Array.isArray(g.stops)
				)
				if (invalid) { continue level_2 }

				const stops: ColorStopGradient[] = []
				level_3: for (const s of g.stops) {
					const invalid = (
						typeof s.color !== 'string'
						|| typeof s.size !== 'number'
						|| !isColorValidWithAlpha(s.color)
					)
					if (invalid) { continue level_3 }

					stops.push(s)
				}

				if (stops.length < 2) { continue level_2 }

				grad.push({...g, stops})
			}

			if (grad.length === 0) {
				continue
			}

			gradients.push({
				id: d.id,
				gradients: grad
			})
		}

		SavedGradients.update(v => v.gradients = (
			gradients
			.sort((a, b) => a.id.localeCompare(b.id))
			.reverse()
		))
	})
}

function _readStorage(): void {
	const store = _db.readStore(_ObjectStoreNames.Storage)
	if (!store) {return}

	_readStorageAll(store)
}

function _initDatabase(): void {
	_db.open({
		onSuccess() {
			_readStorage()
			_readGradients()
		},
		onUpgrade(_, db) {
			db.createStore<_IDBStoreStorage>({
				name: _ObjectStoreNames.Storage,
				keyPath: 'key',
				indexs: ['key', 'value']
			})

			db.createStore<_IDBStoreGradients>({
				name: _ObjectStoreNames.Gradients,
				keyPath: 'id',
				indexs: ['id', 'gradients']
			})
		},
	})
}

export default () => {
	_initDatabase()
}