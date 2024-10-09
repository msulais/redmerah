import { onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Settings, Gradient, LinearGradient, RadialGradient, ConicGradient, GradientData, ColorStopGradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { removeSplashScreen } from "@/scripts/splash"
import { _colorGradient, _auto, _linear, _hex, _open, _createObjectStore, _settings, _key, _value, _gradientData, _id, _linearGradient, _angle, _colorInterpolationMethod, _dataId, _hueInterpolationMethod, _repeat, _type, _radialGradient, _positionX, _positionY, _shape, _sizeHeight, _sizeLength, _sizeWidth, _conicGradient, _colorStopGradient, _color, _gradientId, _size, _gradientType, _readObjectStore, _get, _then, _aspectRatio, _borderRadius, _colorModel, _transaction, _readonly, _objectStore, _getAll, _length, _sort, _forEach, _push, _filter, _gradients, _radial, _conic, _reverse, _colorStopList, _ellipse, _substring, _toString, _toUpperCase, _test, _readwrite, _at, _map, _put, _delete, _slice, _concat, _writeObjectStore } from "@/constants/string"
import { ColorModel, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"
import { testHexColorWithAlpha } from "@/utils/color"
import { mathAbs, mathMin, mathRound, numberParse } from "@/utils/math"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { type ObjectStoreColorStopGradient, type ObjectStoreConicGradient, type ObjectStoreGradientData, type ObjectStoreLinearGradient, type ObjectStoreRadialGradient, type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"

import App from "@/components/App"
import AppBar from "./_AppBar"
import Body from "./_Body"

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_colorGradient])
	const [gradientData, setGradientData] = createStore<GradientData[]>([])
	// !important: must have at least one gradient
	const [gradients, setGradients] = createStore<Gradient[]>([
		{
			dataId: -1,
			id: -1,
			angle: 0,
			colorInterpolationMethod: RectangularColorSpace[_auto],
			colorStopList: [
				{ color: '#FFFD00', size: 0, dataId: -1, gradientId: -1, gradientType: GradientType[_linear], id: -1 },
				{ color: '#56FF00', size: 100, dataId: -1, gradientId: -1, gradientType: GradientType[_linear], id: -1 },
			],
			hueInterpolationMethod: HueInterpolationMethod[_auto],
			repeat: false,
			type: GradientType[_linear]
		} satisfies LinearGradient
	])
	const [settings, setSettings] = createStore<Settings>({
		aspectRatio: 1,
		borderRadius: 8,
		colorModel: ColorModel[_hex]
	})

	function initDatabase(): void {
		db[_open]({
			onSuccess() {
				initSettings()
				initGradientData()
			},
			onUpgradeNeeded(_, db) {
				db[_createObjectStore]<ObjectStoreSettings>({
					name: ObjectStoreNames[_settings],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]<ObjectStoreGradientData>({
					name: ObjectStoreNames[_gradientData],
					keyPath: _id,
					indexs: [_id]
				})
				db[_createObjectStore]<ObjectStoreLinearGradient>({
					name: ObjectStoreNames[_linearGradient],
					keyPath: _id,
					indexs: [_angle, _colorInterpolationMethod, _dataId, _hueInterpolationMethod, _id, _repeat, _type]
				})
				db[_createObjectStore]<ObjectStoreRadialGradient>({
					name: ObjectStoreNames[_radialGradient],
					keyPath: _id,
					indexs: [_colorInterpolationMethod, _dataId, _hueInterpolationMethod, _id, _positionX, _positionY, _repeat, _type, _shape, _sizeHeight, _sizeLength, _sizeWidth]
				})
				db[_createObjectStore]<ObjectStoreConicGradient>({
					name: ObjectStoreNames[_conicGradient],
					keyPath: _id,
					indexs: [_angle, _colorInterpolationMethod, _dataId, _hueInterpolationMethod, _id, _positionX, _positionY, _repeat, _type]
				})
				db[_createObjectStore]<ObjectStoreColorStopGradient>({
					name: ObjectStoreNames[_colorStopGradient],
					keyPath: _id,
					indexs: [_color, _dataId, _gradientId, _id, _size, _gradientType]
				})
			},
		})
	}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db
		[_get]<ObjectStoreSettings<number>>(store_settings, ObjectStoreSettingsKeys.aspectRatio)
		[_then](result => setSettings(_aspectRatio, d => result?.[_value] ?? d))

		db
		[_get]<ObjectStoreSettings<number>>(store_settings, ObjectStoreSettingsKeys.borderRadius)
		[_then](result => setSettings(_borderRadius, d => result?.[_value] ?? d))

		db
		[_get]<ObjectStoreSettings<ColorModel>>(store_settings, ObjectStoreSettingsKeys.colorModel)
		[_then](result => setSettings(_colorModel, d => result?.[_value] ?? d))
	}

	async function initGradientData(): Promise<void> {
		const transaction = db[_transaction]([
			ObjectStoreNames[_colorStopGradient],
			ObjectStoreNames[_conicGradient],
			ObjectStoreNames[_gradientData],
			ObjectStoreNames[_linearGradient],
			ObjectStoreNames[_radialGradient],
		], _readonly)
		const store_colorStopGradient = transaction?.[_objectStore](ObjectStoreNames[_colorStopGradient])
		const store_conicGradient = transaction?.[_objectStore](ObjectStoreNames[_conicGradient])
		const store_gradientData = transaction?.[_objectStore](ObjectStoreNames[_gradientData])
		const store_linearGradient = transaction?.[_objectStore](ObjectStoreNames[_linearGradient])
		const store_radialGradient = transaction?.[_objectStore](ObjectStoreNames[_radialGradient])

		if (store_gradientData == null || store_colorStopGradient == null) return

		try {
			const $data: GradientData[] = []
			const data = await db[_getAll]<ObjectStoreGradientData>(store_gradientData) ?? []
			const stops = await db[_getAll]<ObjectStoreColorStopGradient>(store_colorStopGradient) ?? []
			if (stops[_length] == 0 || data[_length] == 0) return

			stops[_sort]((a, b) => a[_id] - b[_id])
			data[_sort]((a, b) => a[_id] - b[_id])
			data[_forEach](value => $data[value[_id]] = {
				id: value[_id],
				gradients: []
			} satisfies GradientData)

			const gradients: (ObjectStoreLinearGradient | ObjectStoreRadialGradient | ObjectStoreConicGradient)[] = []
			if (store_linearGradient != null) {
				const linearGradient = await db[_getAll]<ObjectStoreLinearGradient>(store_linearGradient) ?? []
				if (linearGradient[_length] > 0) gradients[_push](...linearGradient)
			}
			if (store_radialGradient != null) {
				const radialGradient = await db[_getAll]<ObjectStoreRadialGradient>(store_radialGradient) ?? []
				if (radialGradient[_length] > 0) gradients[_push](...radialGradient)
			}
			if (store_conicGradient != null) {
				const conicGradient = await db[_getAll]<ObjectStoreLinearGradient>(store_conicGradient) ?? []
				if (conicGradient[_length] > 0) gradients[_push](...conicGradient)
			}

			gradients[_sort]((a, b) => a[_id] - b[_id])
			gradients[_forEach](gradient => {
				if ($data[gradient[_dataId]] == null) return

				const $stops: ColorStopGradient[] = stops[_filter](stop =>
					stop[_gradientType] == gradient[_type]
					&& stop[_gradientId] == gradient[_id]
				)

				if ($stops[_length] == 0) return

				$data[gradient[_dataId]][_gradients][_push]((() => {
					const dataId = gradient[_dataId]
					const id = gradient[_id]
					const colorInterpolationMethod = gradient[_colorInterpolationMethod]
					const colorStopList = $stops
					const hueInterpolationMethod = gradient[_hueInterpolationMethod]
					const repeat = gradient[_repeat]
					const type = gradient[_type]
					if (type == GradientType[_radial]) return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						positionX: gradient[_positionX],
						positionY: gradient[_positionY],
						shape: gradient[_shape],
						sizeHeight: gradient[_sizeHeight],
						sizeLength: gradient[_sizeLength],
						sizeWidth: gradient[_sizeWidth],
					} satisfies RadialGradient

					if (type == GradientType[_conic]) return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						angle: gradient[_angle],
						positionX: gradient[_positionX],
						positionY: gradient[_positionY],
					} satisfies ConicGradient

					return {
						dataId, id, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
						angle: (gradient as ObjectStoreLinearGradient)[_angle],
					} satisfies LinearGradient
				})())
			})

			setGradientData($data[_filter](v => v != null)[_reverse]())
		} catch {}
	}

	function changeGradientType(gradientIndex: number, type: GradientType): void {
		let gradient = gradients[gradientIndex]
		if (type == gradient[_type]) return

		const dataId = gradient[_dataId]
		const id = gradient[_id]
		const repeat = gradient[_repeat]
		const colorInterpolationMethod = gradient[_colorInterpolationMethod]
		const colorStopList = gradient[_colorStopList]
		const hueInterpolationMethod = gradient[_hueInterpolationMethod]

		if (type == GradientType[_linear]) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			angle: 0,
		} satisfies LinearGradient

		else if (type == GradientType[_radial]) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			positionX: 50,
			positionY: 50,
			shape: RadialGradientShape[_ellipse],
			sizeHeight: 100,
			sizeLength: 360,
			sizeWidth: 100,
		} satisfies RadialGradient

		else if (type == GradientType[_conic]) gradient = {
			id, dataId, colorInterpolationMethod, colorStopList, hueInterpolationMethod, repeat, type,
			angle: 0,
			positionX: 50,
			positionY: 50,
		} satisfies ConicGradient

		setGradients(gradientIndex, gradient)
	}

	function addColorStop(gradientIndex: number): void {
		const colorStops = [...gradients[gradientIndex][_colorStopList]][_sort]((a, b) => a[_size] - b[_size])
		let color: HEXColor = '#000000', size: number = 0, diff: number = 0

		for (let i = -1; i < colorStops[_length]; i++) {
			let $diff = 0
			if (i == -1) $diff = mathRound(colorStops[i + 1][_size] / 2)
			else if (i == colorStops[_length] - 1) $diff = mathRound((100 - colorStops[i][_size]) / 2)
			else $diff = mathRound((colorStops[i + 1][_size] - colorStops[i][_size]) / 2)

			if ($diff > diff) {
				diff = $diff
				size = (i == -1? 0 : colorStops[i][_size]) + diff
				if (i == -1) color = colorStops[0][_color]
				else if (i == colorStops[_length] - 1) color = colorStops[i][_color]
				else {
					const color1 = numberParse(colorStops[i+1][_color][_substring](1, 7), true, 16)
					const color2 = numberParse(colorStops[ i ][_color][_substring](1, 7), true, 16)
					color = '#' + (
						mathMin(color1, color2)
						+ mathAbs(mathRound((color1 - color2) / 2))
					)[_toString](16)[_toUpperCase]()
				}

				if (/ff$/i[_test](color) && color[_length] > 9) {
					color = color[_substring](0, 7) as HEXColor
				}
			}
		}

		setGradients(
			gradientIndex,
			_colorStopList,
			list => [
				...list,
				({
					id: -1,
					dataId: -1,
					gradientId: gradients[gradientIndex][_id],
					gradientType: gradients[gradientIndex][_type],
					color,
					size
				} satisfies ColorStopGradient)
			]
		)
	}

	async function saveGradient(): Promise<void> {
		const transaction = db[_transaction]([
			ObjectStoreNames[_colorStopGradient],
			ObjectStoreNames[_conicGradient],
			ObjectStoreNames[_gradientData],
			ObjectStoreNames[_linearGradient],
			ObjectStoreNames[_radialGradient],
		], _readwrite)
		const store_colorStopGradient = transaction?.[_objectStore](ObjectStoreNames[_colorStopGradient])
		const store_conicGradient = transaction?.[_objectStore](ObjectStoreNames[_conicGradient])
		const store_gradientData = transaction?.[_objectStore](ObjectStoreNames[_gradientData])
		const store_linearGradient = transaction?.[_objectStore](ObjectStoreNames[_linearGradient])
		const store_radialGradient = transaction?.[_objectStore](ObjectStoreNames[_radialGradient])
		const getId = (ids: number[]) => ids[_length] == 0
			? 1
			: [...ids][_sort]((a, b) => a - b)[_at](-1)! + 1
		const dataIds: number[] = gradientData[_map](d => d[_id])
		const gradientIds: number[] = []
		const stopsIds: number[] = []
		const newData: GradientData = {
			id: getId(dataIds),
			gradients: [...gradients[_map](gradient => ({
				...gradient,
				colorStopList: [
					...gradient[_colorStopList][_map](colorStop => ({...colorStop}))
				]
			}))]
		}

		gradientData[_forEach](data => data[_gradients][_forEach](gradient => {
			gradientIds[_push](gradient[_id])
			stopsIds[_push](...gradient[_colorStopList][_map](v => v[_id]))
		}))

		if (
			store_colorStopGradient
			&& store_conicGradient
			&& store_gradientData
			&& store_linearGradient
			&& store_radialGradient
		) {
			store_gradientData[_put]({id: newData[_id]} satisfies ObjectStoreGradientData)
			gradients[_forEach]((gradient, i) => {
				const dataId = newData[_id]
				const colorInterpolationMethod = gradient[_colorInterpolationMethod]
				const type = gradient[_type]
				const hueInterpolationMethod = gradient[_hueInterpolationMethod]
				const repeat = gradient[_repeat]
				const id = getId(gradientIds)
				const gradientId = id
				gradientIds[_push](id)

				if (type == GradientType[_conic]) store_conicGradient[_put]({
					id, colorInterpolationMethod, dataId, hueInterpolationMethod, repeat, type,
					angle: gradient[_angle],
					positionX: gradient[_positionX],
					positionY: gradient[_positionY],
				} satisfies ObjectStoreConicGradient)

				else if (type == GradientType[_linear]) store_linearGradient[_put]({
					id, colorInterpolationMethod, dataId, hueInterpolationMethod, repeat, type,
					angle: gradient[_angle],
				} satisfies ObjectStoreLinearGradient)

				else if (type == GradientType[_radial]) store_radialGradient[_put]({
					id, colorInterpolationMethod, dataId, hueInterpolationMethod, repeat, type,
					positionX: gradient[_positionX],
					positionY: gradient[_positionY],
					shape: gradient[_shape],
					sizeHeight: gradient[_sizeHeight],
					sizeLength: gradient[_sizeLength],
					sizeWidth: gradient[_sizeWidth]
				} satisfies ObjectStoreRadialGradient)

				newData[_gradients][i][_id] = id
				newData[_gradients][i][_dataId] = dataId

				gradient[_colorStopList][_forEach]((colorStop, j) => {
					const id = getId(stopsIds)
					stopsIds[_push](id)
					newData[_gradients][i][_colorStopList][j][_id] = id
					newData[_gradients][i][_colorStopList][j][_gradientId] = gradientId
					newData[_gradients][i][_colorStopList][j][_dataId] = dataId
					store_colorStopGradient[_put]({
						id, dataId, gradientId,
						color: colorStop[_color],
						gradientType: type,
						size: colorStop[_size]
					} satisfies ObjectStoreColorStopGradient)
				})
			})
		}

		setGradientData(data => [newData, ...data])
	}

	function deleteGradientData(gradientData: GradientData, index: number): void {
		const transaction = db[_transaction]([
			ObjectStoreNames[_colorStopGradient],
			ObjectStoreNames[_conicGradient],
			ObjectStoreNames[_gradientData],
			ObjectStoreNames[_linearGradient],
			ObjectStoreNames[_radialGradient],
		], _readwrite)
		const store_colorStopGradient = transaction == null? null : transaction[_objectStore](ObjectStoreNames[_colorStopGradient])
		const store_conicGradient = transaction == null? null : transaction[_objectStore](ObjectStoreNames[_conicGradient])
		const store_gradientData = transaction == null? null : transaction[_objectStore](ObjectStoreNames[_gradientData])
		const store_linearGradient = transaction == null? null : transaction[_objectStore](ObjectStoreNames[_linearGradient])
		const store_radialGradient = transaction == null? null : transaction[_objectStore](ObjectStoreNames[_radialGradient])

		store_gradientData != null
		&& store_gradientData[_delete](gradientData[_id])

		gradientData[_gradients][_forEach](gradient => {
			gradient[_type] == GradientType[_linear]
			&& store_linearGradient != null
			&& store_linearGradient[_delete](gradient[_id]);

			gradient[_type] == GradientType[_radial]
			&& store_radialGradient != null
			&& store_radialGradient[_delete](gradient[_id]);

			gradient[_type] == GradientType[_conic]
			&& store_conicGradient != null
			&& store_conicGradient[_delete](gradient[_id]);

			store_colorStopGradient != null
			&& gradient[_colorStopList][_forEach](colorStop =>
				store_colorStopGradient[_delete](colorStop[_id])
			)
		})

		setGradientData(data => data[_slice](0, index)[_concat](data[_slice](index + 1)))
	}

	function viewGradientData(gradientData: GradientData): void {
		setGradients([...gradientData[_gradients][_map](
			gradient => ({
				...gradient,
				colorStopList: [
					...gradient[_colorStopList][_map](colorStop => ({...colorStop}))
				]
			})
		)])
	}

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		items[_forEach](item => store_settings?.[_put]({
			key: item[0],
			value: item[1]
		}))
    }

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.change_colorStopLength: {
			const gradientIndex = args[0] as number
			const colorStopIndex = args[1] as number
			const length = args[2] as number
			setGradients(gradientIndex, _colorStopList, colorStopIndex, _size, length)
			break
		}
		case Commands.toggle_gradient_repeat: {
			const gradientIndex = args[0] as number
			setGradients(gradientIndex, _repeat, r => !r)
			break
		}
		case Commands.change_gradient_angle: {
			const gradientIndex = args[0] as number
			const angle = args[1] as number

			setGradients(gradientIndex, _angle as any, angle)
			break
		}
		case Commands.change_colorInterpolationMethod: {
			const gradientIndex = args[0] as number
			const colorInterpolationMethod = args[1] as RectangularColorSpace | PolarColorSpace

			setGradients(gradientIndex, _colorInterpolationMethod, colorInterpolationMethod)
			break
		}
		case Commands.change_hueInterpolationMethod: {
			const gradientIndex = args[0] as number
			const hueInterpolationMethod = args[1] as HueInterpolationMethod

			setGradients(gradientIndex, _hueInterpolationMethod, hueInterpolationMethod)
			break
		}
		case Commands.change_colorStopColor: {
			const gradientIndex = args[0] as number
			const colorStopIndex = args[1] as number
			const color = args[2] as HEXColor
			const invalid = gradientIndex < 0 || colorStopIndex < 0 || !testHexColorWithAlpha(color)
			if (invalid) return;

			setGradients(gradientIndex, _colorStopList, colorStopIndex, _color, color)
			break
		}
		case Commands.add_colorStop: {
			const gradientIndex = args[0] as number
			addColorStop(gradientIndex)
			break
		}
		case Commands.remove_colorStop: {
			const gradientIndex = args[0] as number
			const colorStopIndex = args[1] as number
			setGradients(gradientIndex, _colorStopList, list => list[_slice](0, colorStopIndex)[_concat](list[_slice](colorStopIndex + 1)))
			break
		}
		case Commands.add_gradient: {
			const firstGradient = gradients[0]
			const gradient: Gradient = {
				...firstGradient,
				colorStopList: [...firstGradient[_colorStopList][_map](v => ({...v}))],
			}
			setGradients(gradients => [gradient, ...gradients])
			break
		}
		case Commands.remove_gradient: {
			const gradientIndex = args[0] as number
			setGradients(list => list[_slice](0, gradientIndex)[_concat](list[_slice](gradientIndex + 1)))
			break
		}
		case Commands.change_settings_colorModel: {
			const model = args[0] as ColorModel
			setSettings(_colorModel, model)
			saveSettings([ObjectStoreSettingsKeys.colorModel, model])
			break
		}
		case Commands.change_settings_aspectRatio: {
			const value = args[0] as number
			setSettings(_aspectRatio, value)
			saveSettings([ObjectStoreSettingsKeys.aspectRatio, value])
			break
		}
		case Commands.change_settings_borderRadius: {
			const value = args[0] as number
			setSettings(_borderRadius, value)
			saveSettings([ObjectStoreSettingsKeys.borderRadius, value])
			break
		}
		case Commands.change_gradient_type: {
			const gradientIndex = args[0] as number
			const type = args[1] as GradientType
			changeGradientType(gradientIndex, type)
			break
		}
		case Commands.change_radialGradient_shape: {
			const gradientIndex = args[0] as number
			const shape = args[1] as RadialGradientShape
			setGradients(gradientIndex, _shape as any, shape)
			break
		}
		case Commands.change_gradient_positionX: {
			const gradientIndex = args[0] as number
			const x = args[1] as number
			setGradients(gradientIndex, _positionX as any, x)
			break
		}
		case Commands.change_gradient_positionY: {
			const gradientIndex = args[0] as number
			const y = args[1] as number
			setGradients(gradientIndex, _positionY as any, y)
			break
		}
		case Commands.change_radialGradient_size: {
			const gradientIndex = args[0] as number
			const size = args[1] as number
			setGradients(gradientIndex, _sizeLength as any, size)
			break
		}
		case Commands.change_radialGradient_width: {
			const gradientIndex = args[0] as number
			const width = args[1] as number
			setGradients(gradientIndex, _sizeWidth as any, width)
			break
		}
		case Commands.change_radialGradient_height: {
			const gradientIndex = args[0] as number
			const height = args[1] as number
			setGradients(gradientIndex, _sizeHeight as any, height)
			break
		}
		case Commands.save_gradient: {
			saveGradient()
			break
		}
		case Commands.delete_gradient_data: {
			const index = args[0] as number
			deleteGradientData(gradientData[index], index)
			break
		}
		case Commands.view_gradient_data: {
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
		appBar={<AppBar
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