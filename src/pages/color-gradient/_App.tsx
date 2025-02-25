import { onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Settings, Gradient, LinearGradient, RadialGradient, ConicGradient, GradientData, ColorStopGradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { removeSplashScreen } from "@/utils/splash"
import { ColorSpace, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"
import { colorIsValidWithAlpha } from "@/utils/color"
import { mathAbs, mathMin, mathRound } from "@/utils/math"
import { IDB, idbStoreDelete, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { promiseDone } from "@/utils/object"
import { arrayAt, arrayConcat, arrayFilter, arrayForEach, arrayLength, arrayMap, arrayPush, arrayReverse, arraySlice, arraySort } from "@/utils/array"
import { numberParse, numberToString } from "@/utils/number"
import { stringLength, stringSubstring, stringToUpperCase } from "@/utils/string"
import { regexTest } from "@/utils/regex"
import { type ObjectStoreColorStopGradient, type ObjectStoreConicGradient, type ObjectStoreGradientData, type ObjectStoreLinearGradient, type ObjectStoreRadialGradient, type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"

import App from "@/components/App"
import AppBar from "./_AppBar"
import Body from "./_Body"

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.colorGradient)
	const [gradientData, setGradientData] = createStore<GradientData[]>([])
	// !important: must have at least one gradient
	const [gradients, setGradient] = createStore<Gradient[]>([
		{
			dataId: -1,
			id: -1,
			angle: 0,
			colorInterpolationMethod: RectangularColorSpace.auto,
			colorStopList: [
				{ color: '#FFFD00', size: 0, dataId: -1, gradientId: -1, gradientType: GradientType.linear, id: -1 },
				{ color: '#56FF00', size: 100, dataId: -1, gradientId: -1, gradientType: GradientType.linear, id: -1 },
			],
			hueInterpolationMethod: HueInterpolationMethod.auto,
			repeat: false,
			type: GradientType.linear
		} satisfies LinearGradient
	])
	const [settings, setSettings] = createStore<Settings>({
		aspectRatio: 1,
		borderRadius: 8,
		colorSpace: ColorSpace.hex
	})

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initGradientData()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreGradientData>({
					name: ObjectStoreNames.gradientData,
					keyPath: 'id',
					indexs: ['id']
				})
				db.createStore<ObjectStoreLinearGradient>({
					name: ObjectStoreNames.linearGradient,
					keyPath: 'id',
					indexs: ['angle', 'colorInterpolationMethod', 'dataId', 'hueInterpolationMethod', 'id', 'repeat', 'type']
				})
				db.createStore<ObjectStoreRadialGradient>({
					name: ObjectStoreNames.radialGradient,
					keyPath: 'id',
					indexs: ['colorInterpolationMethod', 'dataId', 'hueInterpolationMethod', 'id', 'positionX', 'positionY', 'repeat', 'type', 'shape', 'sizeHeight', 'sizeLength', 'sizeWidth']
				})
				db.createStore<ObjectStoreConicGradient>({
					name: ObjectStoreNames.conicGradient,
					keyPath: 'id',
					indexs: ['angle', 'colorInterpolationMethod', 'dataId', 'hueInterpolationMethod', 'id', 'positionX', 'positionY', 'repeat', 'type']
				})
				db.createStore<ObjectStoreColorStopGradient>({
					name: ObjectStoreNames.colorStopGradient,
					keyPath: 'id',
					indexs: ['color', 'dataId', 'gradientId', 'id', 'size', 'gradientType']
				})
			},
		})
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store == null) return

		promiseDone(db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreSettingsKeys.aspectRatio
		), result => setSettings('aspectRatio', d => result?.value ?? d))

		promiseDone(db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreSettingsKeys.borderRadius
		), result => setSettings('borderRadius', d => result?.value ?? d))

		promiseDone(db.get<ObjectStoreSettings<ColorSpace>>(
			store,
			ObjectStoreSettingsKeys.colorSpace
		), result => setSettings('colorSpace', d => result?.value ?? d))
	}

	async function initGradientData(): Promise<void> {
		const [
			storeColorStopGradient,
			storeGradientData,
			storeLinearGradient,
			storeRadialGradient,
			storeConicGradient
		] = db.stores('readonly',
			ObjectStoreNames.colorStopGradient,
			ObjectStoreNames.gradientData,
			ObjectStoreNames.linearGradient,
			ObjectStoreNames.radialGradient,
			ObjectStoreNames.conicGradient,
		)

		if (storeGradientData == null || storeColorStopGradient == null) return

		try {
			const $data: GradientData[] = []
			const data = await db.getAll<ObjectStoreGradientData>(storeGradientData) ?? []
			const stops = await db.getAll<ObjectStoreColorStopGradient>(storeColorStopGradient) ?? []
			if (arrayLength(stops) == 0 || arrayLength(data) == 0) return

			arraySort(stops, (a, b) => a.id - b.id)
			arraySort(data, (a, b) => a.id - b.id)
			for (const value of data) $data[value.id] = {
				id: value.id,
				gradients: []
			} satisfies GradientData

			const gradients: (ObjectStoreLinearGradient | ObjectStoreRadialGradient | ObjectStoreConicGradient)[] = []
			if (storeLinearGradient) {
				const linear = await db.getAll<ObjectStoreLinearGradient>(storeLinearGradient) ?? []
				if (arrayLength(linear) > 0) arrayPush(gradients, ...linear)
			}
			if (storeRadialGradient) {
				const gradient = await db.getAll<ObjectStoreRadialGradient>(storeRadialGradient) ?? []
				if (arrayLength(gradient) > 0) arrayPush(gradients, ...gradient)
			}
			if (storeConicGradient) {
				const conic = await db.getAll<ObjectStoreLinearGradient>(storeConicGradient) ?? []
				if (arrayLength(conic) > 0) arrayPush(gradients, ...conic)
			}

			arraySort(gradients, (a, b) => a.id - b.id)
			for (const gradient of gradients){
				if ($data[gradient.dataId] == null) return

				const $stops: ColorStopGradient[] = arrayFilter(stops, stop =>
					stop.gradientType == gradient.type
					&& stop.gradientId == gradient.id
				)

				if (arrayLength($stops) == 0) return

				arrayPush($data[gradient.dataId].gradients, (() => {
					const dataId = gradient.dataId
					const id = gradient.id
					const colorInterpolationMethod = gradient.colorInterpolationMethod
					const colorStopList = $stops
					const hueInterpolationMethod = gradient.hueInterpolationMethod
					const repeat = gradient.repeat
					const type = gradient.type
					if (type == GradientType.radial) return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						positionX: gradient.positionX,
						positionY: gradient.positionY,
						shape: gradient.shape,
						sizeHeight: gradient.sizeHeight,
						sizeLength: gradient.sizeLength,
						sizeWidth: gradient.sizeWidth,
					} satisfies RadialGradient

					if (type == GradientType.conic) return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						angle: gradient.angle,
						positionX: gradient.positionX,
						positionY: gradient.positionY,
					} satisfies ConicGradient

					return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						angle: (gradient as ObjectStoreLinearGradient).angle,
					} satisfies LinearGradient
				})())
			}

			setGradientData(arrayReverse(arrayFilter($data, v => v != null)))
		} catch {}
	}

	function updateGradientType(gradientIndex: number, type: GradientType): void {
		let gradient = gradients[gradientIndex]
		if (type == gradient.type) return

		const dataId = gradient.dataId
		const id = gradient.id
		const repeat = gradient.repeat
		const colorInterpolationMethod = gradient.colorInterpolationMethod
		const colorStopList = gradient.colorStopList
		const hueInterpolationMethod = gradient.hueInterpolationMethod

		if (type == GradientType.linear) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			angle: 0,
		} satisfies LinearGradient

		else if (type == GradientType.radial) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			positionX: 50,
			positionY: 50,
			shape: RadialGradientShape.ellipse,
			sizeHeight: 100,
			sizeLength: 360,
			sizeWidth: 100,
		} satisfies RadialGradient

		else if (type == GradientType.conic) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			angle: 0,
			positionX: 50,
			positionY: 50,
		} satisfies ConicGradient

		setGradient(gradientIndex, gradient)
	}

	function addColorStop(gradientIndex: number): void {
		const colorStops = arraySort([...gradients[gradientIndex].colorStopList], (a, b) => a.size - b.size)
		let color: HEXColor = '#000000', size: number = 0, diff: number = 0

		for (let i = -1; i < arrayLength(colorStops); i++) {
			let $diff = 0
			if (i == -1) $diff = mathRound(colorStops[i + 1].size / 2)
			else if (i == arrayLength(colorStops) - 1) $diff = mathRound((100 - colorStops[i].size) / 2)
			else $diff = mathRound((colorStops[i + 1].size - colorStops[i].size) / 2)

			if ($diff > diff) {
				diff = $diff
				size = (i == -1? 0 : colorStops[i].size) + diff
				if (i == -1) color = colorStops[0].color
				else if (i == arrayLength(colorStops) - 1) color = colorStops[i].color
				else {
					const color1 = numberParse(stringSubstring(colorStops[i+1].color, 1, 7), true, 16)
					const color2 = numberParse(stringSubstring(colorStops[i].color, 1, 7), true, 16)
					color = '#' + stringToUpperCase(numberToString((
						mathMin(color1, color2)
						+ mathAbs(mathRound((color1 - color2) / 2))
					), 16))
				}

				if (regexTest(/ff$/i, color) && stringLength(color) > 9) {
					color = stringSubstring(color, 0, 7) as HEXColor
				}
			}
		}

		setGradient(
			gradientIndex,
			'colorStopList',
			list => [
				...list,
				({
					id: -1,
					dataId: -1,
					gradientId: gradients[gradientIndex].id,
					gradientType: gradients[gradientIndex].type,
					color,
					size
				} satisfies ColorStopGradient)
			]
		)
	}

	function saveGradient(): void {
		const [
			storeColorStopGradient,
			storeGradientData,
			storeLinearGradient,
			storeRadialGradient,
			storeConicGradient
		] = db.stores('readwrite',
			ObjectStoreNames.colorStopGradient,
			ObjectStoreNames.gradientData,
			ObjectStoreNames.linearGradient,
			ObjectStoreNames.radialGradient,
			ObjectStoreNames.conicGradient,
		)
		const get_id = (ids: number[]) => arrayLength(ids) == 0
			? 1
			: arrayAt(arraySort([...ids], (a, b) => a - b), -1)! + 1
		const dataIds: number[] = arrayMap(gradientData, d => d.id)
		const gradientsIds: number[] = []
		const stopsIds: number[] = []
		const newData: GradientData = {
			id: get_id(dataIds),
			gradients: [...arrayMap(gradients, gradient => ({
				...gradient,
				colorStopList: [
					...arrayMap(gradient.colorStopList, colorStop => ({...colorStop}))
				]
			}))]
		}

		for (const data of gradientData) {
			for (const gradient of data.gradients) {
				arrayPush(gradientsIds, gradient.id)
				arrayPush(stopsIds, ...arrayMap(gradient.colorStopList, v => v.id))
			}
		}

		if (
			storeColorStopGradient
			&& storeConicGradient
			&& storeGradientData
			&& storeLinearGradient
			&& storeRadialGradient
		) {
			idbStorePut(storeGradientData, {id: newData.id} satisfies ObjectStoreGradientData)
			arrayForEach(gradients, (gradient, i) => {
				const dataId = newData.id
				const colorInterpolationMethod = gradient.colorInterpolationMethod
				const type = gradient.type
				const hueInterpolationMethod = gradient.hueInterpolationMethod
				const repeat = gradient.repeat
				const id = get_id(gradientsIds)
				const gradientId = id
				arrayPush(gradientsIds, id)

				if (type == GradientType.conic) idbStorePut(storeConicGradient, {
					id, colorInterpolationMethod: colorInterpolationMethod, dataId: dataId, hueInterpolationMethod: hueInterpolationMethod, repeat, type,
					angle: gradient.angle,
					positionX: gradient.positionX,
					positionY: gradient.positionY,
				} satisfies ObjectStoreConicGradient)

				else if (type == GradientType.linear) idbStorePut(storeLinearGradient, {
					id, colorInterpolationMethod: colorInterpolationMethod, dataId: dataId, hueInterpolationMethod: hueInterpolationMethod, repeat, type,
					angle: gradient.angle,
				} satisfies ObjectStoreLinearGradient)

				else if (type == GradientType.radial) idbStorePut(storeRadialGradient, {
					id, colorInterpolationMethod: colorInterpolationMethod, dataId: dataId, hueInterpolationMethod: hueInterpolationMethod, repeat, type,
					positionX: gradient.positionX,
					positionY: gradient.positionY,
					shape: gradient.shape,
					sizeHeight: gradient.sizeHeight,
					sizeLength: gradient.sizeLength,
					sizeWidth: gradient.sizeWidth
				} satisfies ObjectStoreRadialGradient)

				newData.gradients[i].id = id
				newData.gradients[i].dataId = dataId

				arrayForEach(gradient.colorStopList, (color_stop, j) => {
					const id = get_id(stopsIds)
					arrayPush(stopsIds, id)
					newData.gradients[i].colorStopList[j].id = id
					newData.gradients[i].colorStopList[j].gradientId = gradientId
					newData.gradients[i].colorStopList[j].dataId = dataId
					idbStorePut(storeColorStopGradient, {
						id, dataId: dataId, gradientId: gradientId,
						color: color_stop.color,
						gradientType: type,
						size: color_stop.size
					} satisfies ObjectStoreColorStopGradient)
				})
			})
		}

		setGradientData(data => [newData, ...data])
	}

	function deleteGradientData(gradientData: GradientData, index: number): void {
		const [
			storeColorStopGradient,
			storeGradientData,
			storeLinearGradient,
			storeRadialGradient,
			storeConicGradient
		] = db.stores('readwrite',
			ObjectStoreNames.colorStopGradient,
			ObjectStoreNames.gradientData,
			ObjectStoreNames.linearGradient,
			ObjectStoreNames.radialGradient,
			ObjectStoreNames.conicGradient,
		)

		storeGradientData != null
		&& idbStoreDelete(storeGradientData, gradientData.id)

		for (const gradient of gradientData.gradients) {
			const type = gradient.type
			const id = gradient.id

			type == GradientType.linear
			&& storeLinearGradient != null
			&& idbStoreDelete(storeLinearGradient, id);

			type == GradientType.radial
			&& storeRadialGradient != null
			&& idbStoreDelete(storeRadialGradient, id);

			type == GradientType.conic
			&& storeConicGradient != null
			&& idbStoreDelete(storeConicGradient, id);

			storeColorStopGradient != null
			&& arrayForEach(gradient.colorStopList, color_stop => idbStoreDelete(storeColorStopGradient, color_stop.id))
		}

		setGradientData(data => arrayConcat(
			arraySlice(data, 0, index),
			arraySlice(data, index + 1)
		))
	}

	function viewGradientData(gradientData: GradientData): void {
		setGradient([...arrayMap(
			gradientData.gradients,
			gradient => ({
				...gradient,
				colorStopList: [
					...arrayMap(gradient.colorStopList, color_stop => ({...color_stop}))
				]
			})
		)])
	}

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return

		for (const item of items) idbStorePut(store, {
			key: item[0],
			value: item[1]
		})
    }

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updateColorStopLength: {
			const [gradientIndex, colorStopIndex, length] = args as [number, number, number]
			setGradient(gradientIndex, 'colorStopList', colorStopIndex, 'size', length)
			break
		}
		case Commands.toggleGradientRepeat: {
			const [gradientIndex] = args as [number]
			setGradient(gradientIndex, 'repeat', r => !r)
			break
		}
		case Commands.updateGradientAngle: {
			const [gradientIndex, angle] = args as [number, number]
			setGradient(gradientIndex, 'angle' as any, angle)
			break
		}
		case Commands.updateColorInterpolationMethod: {
			const [gradientIndex, colorInterpolationMethod] = args as [number, RectangularColorSpace | PolarColorSpace]
			setGradient(gradientIndex, 'colorInterpolationMethod', colorInterpolationMethod)
			break
		}
		case Commands.updateHueInterpolationMethod: {
			const [gradientIndex, hueInterpolationMethod] = args as [number, HueInterpolationMethod]
			setGradient(gradientIndex, 'hueInterpolationMethod', hueInterpolationMethod)
			break
		}
		case Commands.updateColorStopColor: {
			const [gradientIndex, colorStopIndex, color] = args as [number, number, HEXColor]
			const invalid = gradientIndex < 0 || colorStopIndex < 0 || !colorIsValidWithAlpha(color)
			if (invalid) return;

			setGradient(gradientIndex, 'colorStopList', colorStopIndex, 'color', color)
			break
		}
		case Commands.addColorStop: {
			const [gradientIndex] = args as [number]
			addColorStop(gradientIndex)
			break
		}
		case Commands.removeColorStop: {
			const [gradientIndex, colorStopIndex] = args as [number, number]
			setGradient(
				gradientIndex, 'colorStopList',
				list => arrayConcat(
					arraySlice(list, 0, colorStopIndex),
					arraySlice(list, colorStopIndex + 1)
				)
			)
			break
		}
		case Commands.addGradient: {
			const firstGradient = gradients[0]
			const gradient: Gradient = {
				...firstGradient,
				colorStopList: [...arrayMap(firstGradient.colorStopList, v => ({...v}))],
			}
			setGradient(gradients => [gradient, ...gradients])
			break
		}
		case Commands.removeGradient: {
			const [gradientIndex] = args as [number]
			setGradient(list => arrayConcat(
				arraySlice(list, 0, gradientIndex),
				arraySlice(list, gradientIndex + 1)
			))
			break
		}
		case Commands.updateSettingsColorSpace: {
			const [space] = args as [ColorSpace]
			setSettings('colorSpace', space)
			saveSettings([ObjectStoreSettingsKeys.colorSpace, space])
			break
		}
		case Commands.updateSettingsAspectRatio: {
			const [value] = args as [number]
			setSettings('aspectRatio', value)
			saveSettings([ObjectStoreSettingsKeys.aspectRatio, value])
			break
		}
		case Commands.updateSettingsBorderRadius: {
			const [value] = args as [number]
			setSettings('borderRadius', value)
			saveSettings([ObjectStoreSettingsKeys.borderRadius, value])
			break
		}
		case Commands.updateGradientType: {
			const [gradientIndex, type] = args as [number, GradientType]
			updateGradientType(gradientIndex, type)
			break
		}
		case Commands.updateRadialGradientShape: {
			const gradientIndex = args[0] as number
			const shape = args[1] as RadialGradientShape
			setGradient(gradientIndex, 'shape' as any, shape)
			break
		}
		case Commands.updateGradientPositionX: {
			const [gradientIndex, x] = args as [number, number]
			setGradient(gradientIndex, 'positionX' as any, x)
			break
		}
		case Commands.updateGradientPositionY: {
			const [gradientIndex, y] = args as [number, number]
			setGradient(gradientIndex, 'positionY' as any, y)
			break
		}
		case Commands.updateRadialGradientSize: {
			const [gradientIndex, size] = args[1] as [number, number]
			setGradient(gradientIndex, 'sizeLength' as any, size)
			break
		}
		case Commands.updateRadialGradientWidth: {
			const [gradientIndex, width] = args as [number, number]

			setGradient(gradientIndex, 'sizeWidth' as any, width)
			break
		}
		case Commands.updateRadialGradientHeight: {
			const [gradientIndex, height] = args as [number, number]

			setGradient(gradientIndex, 'sizeHeight' as any, height)
			break
		}
		case Commands.saveGradient: {
			saveGradient()
			break
		}
		case Commands.deleteGradientData: {
			const index = args[0] as number
			deleteGradientData(gradientData[index], index)
			break
		}
		case Commands.viewGradientData: {
			const index = args[0] as number
			viewGradientData(gradientData[index])
			break
		}
		default: return
	}}

	onMount(() => {
		removeSplashScreen()
		initDatabase()
	})

	return (<App
		c:appBar={<AppBar
			settings={settings}
			command={command}
			gradients={gradients}
		/>}>
		<Body
			gradients={gradients}
			settings={settings}
			command={command}
			gradientData={gradientData}
		/>
	</App>)
}

export default _