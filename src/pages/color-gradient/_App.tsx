import { onMount, type VoidComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

import type { Settings, Gradient, LinearGradient, RadialGradient, ConicGradient, GradientData, ColorStopGradient } from "./_type"
import { type ObjectStoreColorStopGradient, type ObjectStoreConicGradient, type ObjectStoreGradientData, type ObjectStoreLinearGradient, type ObjectStoreRadialGradient, type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"
import type { HEXColor } from "@/types/color"
import { removeSplashScreen } from "@/utils/splash"
import { ColorSpace, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"
import { colorIsValidWithAlpha } from "@/utils/color"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"

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

		db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreSettingsKeys.aspectRatio
		).then(result => setSettings('aspectRatio', d => result?.value ?? d))

		db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreSettingsKeys.borderRadius
		).then(result => setSettings('borderRadius', d => result?.value ?? d))

		db.get<ObjectStoreSettings<ColorSpace>>(
			store,
			ObjectStoreSettingsKeys.colorSpace
		).then(result => setSettings('colorSpace', d => result?.value ?? d))
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
			if (stops.length == 0 || data.length == 0) return

			stops.sort((a, b) => a.id - b.id)
			data.sort((a, b) => a.id - b.id)
			for (const value of data) $data[value.id] = {
				id: value.id,
				gradients: []
			} satisfies GradientData

			const gradients: (ObjectStoreLinearGradient | ObjectStoreRadialGradient | ObjectStoreConicGradient)[] = []
			if (storeLinearGradient) {
				const linear = await db.getAll<ObjectStoreLinearGradient>(storeLinearGradient) ?? []
				if (linear.length > 0) gradients.push(...linear)
			}
			if (storeRadialGradient) {
				const gradient = await db.getAll<ObjectStoreRadialGradient>(storeRadialGradient) ?? []
				if (gradient.length > 0) gradients.push(...gradient)
			}
			if (storeConicGradient) {
				const conic = await db.getAll<ObjectStoreLinearGradient>(storeConicGradient) ?? []
				if (conic.length > 0) gradients.push(...conic)
			}

			gradients.sort((a, b) => a.id - b.id)
			for (const gradient of gradients){
				if ($data[gradient.dataId] == null) return

				const $stops: ColorStopGradient[] = stops.filter(stop =>
					stop.gradientType == gradient.type
					&& stop.gradientId == gradient.id
				)
				if ($stops.length == 0) return

				$data[gradient.dataId].gradients.push((() => {
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

			setGradientData($data.filter(v => v != null).reverse())
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
		const colorStops = [...gradients[gradientIndex].colorStopList].sort((a, b) => a.size - b.size)
		let color: HEXColor = '#000000', size: number = 0, diff: number = 0

		for (let i = -1; i < colorStops.length; i++) {
			let $diff = 0
			if (i == -1) $diff = Math.round(colorStops[i + 1].size / 2)
			else if (i == colorStops.length - 1) $diff = Math.round((100 - colorStops[i].size) / 2)
			else $diff = Math.round((colorStops[i + 1].size - colorStops[i].size) / 2)

			if ($diff > diff) {
				diff = $diff
				size = (i == -1? 0 : colorStops[i].size) + diff
				if (i == -1) color = colorStops[0].color
				else if (i == colorStops.length - 1) color = colorStops[i].color
				else {
					const color1 = Number.parseInt(colorStops[i+1].color.substring(1, 7), 16)
					const color2 = Number.parseInt(colorStops[i].color.substring(1, 7), 16)
					color = '#' + (
						Math.min(color1, color2)
						+ Math.abs(Math.round((color1 - color2) / 2))
					).toString(16).toUpperCase()
				}

				if (/ff$/i.test(color) && color.length > 9) {
					color = color.substring(0, 7) as HEXColor
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
		const get_id = (ids: number[]) => ids.length == 0
			? 1
			: [...ids].sort((a, b) => a - b).at(-1)! + 1
		const dataIds: number[] = gradientData.map(d => d.id)
		const gradientsIds: number[] = []
		const stopsIds: number[] = []
		const newData: GradientData = {
			id: get_id(dataIds),
			gradients: [...gradients.map(gradient => ({
				...gradient,
				colorStopList: [
					...gradient.colorStopList.map(colorStop => ({...colorStop}))
				]
			}))]
		}

		for (const data of gradientData) {
			for (const gradient of data.gradients) {
				gradientsIds.push(gradient.id)
				stopsIds.push(...gradient.colorStopList.map( v => v.id))
			}
		}

		if (
			storeColorStopGradient
			&& storeConicGradient
			&& storeGradientData
			&& storeLinearGradient
			&& storeRadialGradient
		) {
			storeGradientData.put({id: newData.id} satisfies ObjectStoreGradientData)
			gradients.forEach((gradient, i) => {
				const dataId = newData.id
				const colorInterpolationMethod = gradient.colorInterpolationMethod
				const type = gradient.type
				const hueInterpolationMethod = gradient.hueInterpolationMethod
				const repeat = gradient.repeat
				const id = get_id(gradientsIds)
				const gradientId = id
				gradientsIds.push(id)

				if (type == GradientType.conic) storeConicGradient.put({
					id, colorInterpolationMethod: colorInterpolationMethod, dataId: dataId, hueInterpolationMethod: hueInterpolationMethod, repeat, type,
					angle: gradient.angle,
					positionX: gradient.positionX,
					positionY: gradient.positionY,
				} satisfies ObjectStoreConicGradient)

				else if (type == GradientType.linear) storeLinearGradient.put({
					id, colorInterpolationMethod: colorInterpolationMethod, dataId: dataId, hueInterpolationMethod: hueInterpolationMethod, repeat, type,
					angle: gradient.angle,
				} satisfies ObjectStoreLinearGradient)

				else if (type == GradientType.radial) storeRadialGradient.put({
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

				gradient.colorStopList.forEach((colorStop, j) => {
					const id = get_id(stopsIds)
					stopsIds.push(id)
					newData.gradients[i].colorStopList[j].id = id
					newData.gradients[i].colorStopList[j].gradientId = gradientId
					newData.gradients[i].colorStopList[j].dataId = dataId
					storeColorStopGradient.put({
						id, dataId: dataId, gradientId: gradientId,
						color: colorStop.color,
						gradientType: type,
						size: colorStop.size
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

		storeGradientData?.delete(gradientData.id)

		for (const gradient of gradientData.gradients) {
			const type = gradient.type
			const id = gradient.id

			switch (type) {
			case GradientType.linear:
				storeLinearGradient?.delete(id)
				break
			case GradientType.radial:
				storeRadialGradient?.delete(id)
				break
			case GradientType.conic:
				storeConicGradient?.delete(id)
				break
			}

			if (storeColorStopGradient) {
				for (const colorStop of gradient.colorStopList) {
					storeColorStopGradient.delete(colorStop.id)
				}
			}
		}

		setGradientData(produce(data => data.splice(index, 1)))
	}

	function viewGradientData(gradientData: GradientData): void {
		setGradient([...gradientData.gradients.map(
			gradient => ({
				...gradient,
				colorStopList: [
					...gradient.colorStopList.map(colorStop => ({...colorStop}))
				]
			})
		)])
	}

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return

		for (const item of items) store.put({
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
				produce(list => list.splice(colorStopIndex))
			)
			break
		}
		case Commands.addGradient: {
			const firstGradient = gradients[0]
			const gradient: Gradient = {
				...firstGradient,
				colorStopList: [...firstGradient.colorStopList.map(v => ({...v}))],
			}
			setGradient(gradients => [gradient, ...gradients])
			break
		}
		case Commands.removeGradient: {
			const [gradientIndex] = args as [number]
			setGradient(produce(list => list.splice(gradientIndex)))
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