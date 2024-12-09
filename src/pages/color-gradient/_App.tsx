import { onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { Settings, Gradient, LinearGradient, RadialGradient, ConicGradient, GradientData, ColorStopGradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { remove_splash_screen } from "@/scripts/splash"
import { ColorModel, Commands, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"
import { is_color_with_alpha_valid } from "@/utils/color"
import { math_abs, math_min, math_round } from "@/utils/math"
import { IDB, idb_store_delete, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { promise_done } from "@/utils/object"
import { array_at, array_concat, array_filter, array_foreach, array_length, array_map, array_push, array_reverse, array_slice, array_sort } from "@/utils/array"
import { number_parse, number_to_string } from "@/utils/number"
import { string_length, string_substring, string_touppercase } from "@/utils/string"
import { regex_test } from "@/utils/regex"
import { type ObjectStoreColorStopGradient, type ObjectStoreConicGradient, type ObjectStoreGradientData, type ObjectStoreLinearGradient, type ObjectStoreRadialGradient, type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"

import App from "@/components/App"
import AppBar from "./_AppBar"
import Body from "./_Body"

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.color_gradient)
	const [gradient_data, set_gradient_data] = createStore<GradientData[]>([])
	// !important: must have at least one gradient
	const [gradients, set_gradients] = createStore<Gradient[]>([
		{
			data_id: -1,
			id: -1,
			angle: 0,
			color_interpolation_method: RectangularColorSpace.auto,
			color_stop_list: [
				{ color: '#FFFD00', size: 0, data_id: -1, gradient_id: -1, gradient_type: GradientType.linear, id: -1 },
				{ color: '#56FF00', size: 100, data_id: -1, gradient_id: -1, gradient_type: GradientType.linear, id: -1 },
			],
			hue_interpolation_method: HueInterpolationMethod.auto,
			repeat: false,
			type: GradientType.linear
		} satisfies LinearGradient
	])
	const [settings, set_settings] = createStore<Settings>({
		aspect_ratio: 1,
		border_radius: 8,
		color_model: ColorModel.hex
	})

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_gradient_data()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreGradientData>({
					name: ObjectStoreNames.gradient_data,
					key_path: 'id',
					indexs: ['id']
				})
				db.create_store<ObjectStoreLinearGradient>({
					name: ObjectStoreNames.linear_gradient,
					key_path: 'id',
					indexs: ['angle', 'color_interpolation_method', 'data_id', 'hue_interpolation_method', 'id', 'repeat', 'type']
				})
				db.create_store<ObjectStoreRadialGradient>({
					name: ObjectStoreNames.radial_gradient,
					key_path: 'id',
					indexs: ['color_interpolation_method', 'data_id', 'hue_interpolation_method', 'id', 'position_x', 'position_y', 'repeat', 'type', 'shape', 'size_height', 'size_length', 'size_width']
				})
				db.create_store<ObjectStoreConicGradient>({
					name: ObjectStoreNames.conic_gradient,
					key_path: 'id',
					indexs: ['angle', 'color_interpolation_method', 'data_id', 'hue_interpolation_method', 'id', 'position_x', 'position_y', 'repeat', 'type']
				})
				db.create_store<ObjectStoreColorStopGradient>({
					name: ObjectStoreNames.color_stop_gradient,
					key_path: 'id',
					indexs: ['color', 'data_id', 'gradient_id', 'id', 'size', 'gradient_type']
				})
			},
		})
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings<number>>(
			store_settings,
			ObjectStoreSettingsKeys.aspect_ratio
		), result => set_settings('aspect_ratio', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<number>>(
			store_settings,
			ObjectStoreSettingsKeys.border_radius
		), result => set_settings('border_radius', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<ColorModel>>(
			store_settings,
			ObjectStoreSettingsKeys.color_model
		), result => set_settings('color_model', d => result?.value ?? d))
	}

	async function init_gradient_data(): Promise<void> {
		const [
			store_colorstopgradient,
			store_gradientdata,
			store_lineargradient,
			store_radialgradient,
			store_conicgradient
		] = db.stores('readonly',
			ObjectStoreNames.color_stop_gradient,
			ObjectStoreNames.gradient_data,
			ObjectStoreNames.linear_gradient,
			ObjectStoreNames.radial_gradient,
			ObjectStoreNames.conic_gradient,
		)

		if (store_gradientdata == null || store_colorstopgradient == null) return

		try {
			const $data: GradientData[] = []
			const data = await db.get_all<ObjectStoreGradientData>(store_gradientdata) ?? []
			const stops = await db.get_all<ObjectStoreColorStopGradient>(store_colorstopgradient) ?? []
			if (array_length(stops) == 0 || array_length(data) == 0) return

			array_sort(stops, (a, b) => a.id - b.id)
			array_sort(data, (a, b) => a.id - b.id)
			for (const value of data) $data[value.id] = {
				id: value.id,
				gradients: []
			} satisfies GradientData

			const gradients: (ObjectStoreLinearGradient | ObjectStoreRadialGradient | ObjectStoreConicGradient)[] = []
			if (store_lineargradient) {
				const linear = await db.get_all<ObjectStoreLinearGradient>(store_lineargradient) ?? []
				if (array_length(linear) > 0) array_push(gradients, ...linear)
			}
			if (store_radialgradient) {
				const gradient = await db.get_all<ObjectStoreRadialGradient>(store_radialgradient) ?? []
				if (array_length(gradient) > 0) array_push(gradients, ...gradient)
			}
			if (store_conicgradient) {
				const conic = await db.get_all<ObjectStoreLinearGradient>(store_conicgradient) ?? []
				if (array_length(conic) > 0) array_push(gradients, ...conic)
			}

			array_sort(gradients, (a, b) => a.id - b.id)
			for (const gradient of gradients){
				if ($data[gradient.data_id] == null) return

				const $stops: ColorStopGradient[] = array_filter(stops, stop =>
					stop.gradient_type == gradient.type
					&& stop.gradient_id == gradient.id
				)

				if (array_length($stops) == 0) return

				array_push($data[gradient.data_id].gradients, (() => {
					const data_id = gradient.data_id
					const id = gradient.id
					const color_interpolation_method = gradient.color_interpolation_method
					const color_stop_list = $stops
					const hue_interpolation_method = gradient.hue_interpolation_method
					const repeat = gradient.repeat
					const type = gradient.type
					if (type == GradientType.radial) return {
						data_id: data_id, id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
						position_x: gradient.position_x,
						position_y: gradient.position_y,
						shape: gradient.shape,
						size_height: gradient.size_height,
						size_length: gradient.size_length,
						size_width: gradient.size_width,
					} satisfies RadialGradient

					if (type == GradientType.conic) return {
						data_id: data_id, id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
						angle: gradient.angle,
						position_x: gradient.position_x,
						position_y: gradient.position_y,
					} satisfies ConicGradient

					return {
						data_id: data_id, id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
						angle: (gradient as ObjectStoreLinearGradient).angle,
					} satisfies LinearGradient
				})())
			}

			set_gradient_data(array_reverse(array_filter($data, v => v != null)))
		} catch {}
	}

	function change_gradient_type(gradient_index: number, type: GradientType): void {
		let gradient = gradients[gradient_index]
		if (type == gradient.type) return

		const data_id = gradient.data_id
		const id = gradient.id
		const repeat = gradient.repeat
		const color_interpolation_method = gradient.color_interpolation_method
		const color_stop_list = gradient.color_stop_list
		const hue_interpolation_method = gradient.hue_interpolation_method

		if (type == GradientType.linear) gradient = {
			id, data_id: data_id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
			angle: 0,
		} satisfies LinearGradient

		else if (type == GradientType.radial) gradient = {
			id, data_id: data_id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
			position_x: 50,
			position_y: 50,
			shape: RadialGradientShape.ellipse,
			size_height: 100,
			size_length: 360,
			size_width: 100,
		} satisfies RadialGradient

		else if (type == GradientType.conic) gradient = {
			id, data_id: data_id, color_interpolation_method: color_interpolation_method, color_stop_list: color_stop_list, hue_interpolation_method: hue_interpolation_method, repeat, type,
			angle: 0,
			position_x: 50,
			position_y: 50,
		} satisfies ConicGradient

		set_gradients(gradient_index, gradient)
	}

	function add_color_stop(gradient_index: number): void {
		const color_stops = array_sort([...gradients[gradient_index].color_stop_list], (a, b) => a.size - b.size)
		let color: HEXColor = '#000000', size: number = 0, diff: number = 0

		for (let i = -1; i < array_length(color_stops); i++) {
			let $diff = 0
			if (i == -1) $diff = math_round(color_stops[i + 1].size / 2)
			else if (i == array_length(color_stops) - 1) $diff = math_round((100 - color_stops[i].size) / 2)
			else $diff = math_round((color_stops[i + 1].size - color_stops[i].size) / 2)

			if ($diff > diff) {
				diff = $diff
				size = (i == -1? 0 : color_stops[i].size) + diff
				if (i == -1) color = color_stops[0].color
				else if (i == array_length(color_stops) - 1) color = color_stops[i].color
				else {
					const color1 = number_parse(string_substring(color_stops[i+1].color, 1, 7), true, 16)
					const color2 = number_parse(string_substring(color_stops[i].color, 1, 7), true, 16)
					color = '#' + string_touppercase(number_to_string((
						math_min(color1, color2)
						+ math_abs(math_round((color1 - color2) / 2))
					), 16))
				}

				if (regex_test(/ff$/i, color) && string_length(color) > 9) {
					color = string_substring(color, 0, 7) as HEXColor
				}
			}
		}

		set_gradients(
			gradient_index,
			'color_stop_list',
			list => [
				...list,
				({
					id: -1,
					data_id: -1,
					gradient_id: gradients[gradient_index].id,
					gradient_type: gradients[gradient_index].type,
					color,
					size
				} satisfies ColorStopGradient)
			]
		)
	}

	async function save_gradient(): Promise<void> {
		const [
			store_colorstopgradient,
			store_gradientdata,
			store_lineargradient,
			store_radialgradient,
			store_conicgradient
		] = db.stores('readwrite',
			ObjectStoreNames.color_stop_gradient,
			ObjectStoreNames.gradient_data,
			ObjectStoreNames.linear_gradient,
			ObjectStoreNames.radial_gradient,
			ObjectStoreNames.conic_gradient,
		)
		const get_id = (ids: number[]) => array_length(ids) == 0
			? 1
			: array_at(array_sort([...ids], (a, b) => a - b), -1)! + 1
		const data_ids: number[] = array_map(gradient_data, d => d.id)
		const gradient_ids: number[] = []
		const stops_ids: number[] = []
		const new_data: GradientData = {
			id: get_id(data_ids),
			gradients: [...array_map(gradients, gradient => ({
				...gradient,
				color_stop_list: [
					...array_map(gradient.color_stop_list, colorStop => ({...colorStop}))
				]
			}))]
		}

		for (const data of gradient_data) {
			for (const gradient of data.gradients) {
				array_push(gradient_ids, gradient.id)
				array_push(stops_ids, ...array_map(gradient.color_stop_list, v => v.id))
			}
		}

		if (
			store_colorstopgradient
			&& store_conicgradient
			&& store_gradientdata
			&& store_lineargradient
			&& store_radialgradient
		) {
			idb_store_put(store_gradientdata, {id: new_data.id} satisfies ObjectStoreGradientData)
			array_foreach(gradients, (gradient, i) => {
				const data_id = new_data.id
				const color_interpolation_method = gradient.color_interpolation_method
				const type = gradient.type
				const hue_interpolation_method = gradient.hue_interpolation_method
				const repeat = gradient.repeat
				const id = get_id(gradient_ids)
				const gradient_id = id
				array_push(gradient_ids, id)

				if (type == GradientType.conic) idb_store_put(store_conicgradient, {
					id, color_interpolation_method: color_interpolation_method, data_id: data_id, hue_interpolation_method: hue_interpolation_method, repeat, type,
					angle: gradient.angle,
					position_x: gradient.position_x,
					position_y: gradient.position_y,
				} satisfies ObjectStoreConicGradient)

				else if (type == GradientType.linear) idb_store_put(store_lineargradient, {
					id, color_interpolation_method: color_interpolation_method, data_id: data_id, hue_interpolation_method: hue_interpolation_method, repeat, type,
					angle: gradient.angle,
				} satisfies ObjectStoreLinearGradient)

				else if (type == GradientType.radial) idb_store_put(store_radialgradient, {
					id, color_interpolation_method: color_interpolation_method, data_id: data_id, hue_interpolation_method: hue_interpolation_method, repeat, type,
					position_x: gradient.position_x,
					position_y: gradient.position_y,
					shape: gradient.shape,
					size_height: gradient.size_height,
					size_length: gradient.size_length,
					size_width: gradient.size_width
				} satisfies ObjectStoreRadialGradient)

				new_data.gradients[i].id = id
				new_data.gradients[i].data_id = data_id

				array_foreach(gradient.color_stop_list, (color_stop, j) => {
					const id = get_id(stops_ids)
					array_push(stops_ids, id)
					new_data.gradients[i].color_stop_list[j].id = id
					new_data.gradients[i].color_stop_list[j].gradient_id = gradient_id
					new_data.gradients[i].color_stop_list[j].data_id = data_id
					idb_store_put(store_colorstopgradient, {
						id, data_id: data_id, gradient_id: gradient_id,
						color: color_stop.color,
						gradient_type: type,
						size: color_stop.size
					} satisfies ObjectStoreColorStopGradient)
				})
			})
		}

		set_gradient_data(data => [new_data, ...data])
	}

	function delete_gradient_data(gradient_data: GradientData, index: number): void {
		const [
			store_colorstopgradient,
			store_gradientdata,
			store_lineargradient,
			store_radialgradient,
			store_conicgradient
		] = db.stores('readwrite',
			ObjectStoreNames.color_stop_gradient,
			ObjectStoreNames.gradient_data,
			ObjectStoreNames.linear_gradient,
			ObjectStoreNames.radial_gradient,
			ObjectStoreNames.conic_gradient,
		)

		store_gradientdata != null
		&& idb_store_delete(store_gradientdata, gradient_data.id)

		for (const gradient of gradient_data.gradients) {
			gradient.type == GradientType.linear
			&& store_lineargradient != null
			&& idb_store_delete(store_lineargradient, gradient.id);

			gradient.type == GradientType.radial
			&& store_radialgradient != null
			&& idb_store_delete(store_radialgradient, gradient.id);

			gradient.type == GradientType.conic
			&& store_conicgradient != null
			&& idb_store_delete(store_conicgradient, gradient.id);

			store_colorstopgradient != null
			&& array_foreach(gradient.color_stop_list, color_stop => idb_store_delete(store_colorstopgradient, color_stop.id))
		}

		set_gradient_data(data => array_concat(
			array_slice(data, 0, index),
			array_slice(data, index + 1)
		))
	}

	function view_gradient_data(gradient_data: GradientData): void {
		set_gradients([...array_map(
			gradient_data.gradients,
			gradient => ({
				...gradient,
				color_stop_list: [
					...array_map(gradient.color_stop_list, color_stop => ({...color_stop}))
				]
			})
		)])
	}

    function save_settings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return

		for (const item of items) idb_store_put(store_settings, {
			key: item[0],
			value: item[1]
		})
    }

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.change_color_stop_length: {
			const [gradient_index, color_stop_index, length] = args as [number, number, number]
			set_gradients(gradient_index, 'color_stop_list', color_stop_index, 'size', length)
			break
		}
		case Commands.toggle_gradient_repeat: {
			const [gradient_index] = args as [number]
			set_gradients(gradient_index, 'repeat', r => !r)
			break
		}
		case Commands.change_gradient_angle: {
			const [gradient_index, angle] = args as [number, number]

			set_gradients(gradient_index, 'angle' as any, angle)
			break
		}
		case Commands.change_color_interpolation_method: {
			const [gradient_index, color_interpolation_method] = args as [number, RectangularColorSpace | PolarColorSpace]

			set_gradients(gradient_index, 'color_interpolation_method', color_interpolation_method)
			break
		}
		case Commands.change_hue_interpolation_method: {
			const [gradient_index, hue_interpolation_method] = args as [number, HueInterpolationMethod]

			set_gradients(gradient_index, 'hue_interpolation_method', hue_interpolation_method)
			break
		}
		case Commands.change_color_stop_color: {
			const [gradient_index, color_stop_index, color] = args as [number, number, HEXColor]
			const invalid = gradient_index < 0 || color_stop_index < 0 || !is_color_with_alpha_valid(color)
			if (invalid) return;

			set_gradients(gradient_index, 'color_stop_list', color_stop_index, 'color', color)
			break
		}
		case Commands.add_color_stop: {
			const gradientIndex = args[0] as number
			add_color_stop(gradientIndex)
			break
		}
		case Commands.remove_color_stop: {
			const [gradient_index, color_stop_index] = args as [number, number]

			set_gradients(
				gradient_index, 'color_stop_list',
				list => array_concat(
					array_slice(list, 0, color_stop_index),
					array_slice(list, color_stop_index + 1)
				)
			)
			break
		}
		case Commands.add_gradient: {
			const first_gradient = gradients[0]
			const gradient: Gradient = {
				...first_gradient,
				color_stop_list: [...array_map(first_gradient.color_stop_list, v => ({...v}))],
			}
			set_gradients(gradients => [gradient, ...gradients])
			break
		}
		case Commands.remove_gradient: {
			const [gradient_index] = args as [number]
			set_gradients(list => array_concat(
				array_slice(list, 0, gradient_index),
				array_slice(list, gradient_index + 1)
			))
			break
		}
		case Commands.change_settings_colormodel: {
			const [model] = args as [ColorModel]
			set_settings('color_model', model)
			save_settings([ObjectStoreSettingsKeys.color_model, model])
			break
		}
		case Commands.change_settings_aspect_ratio: {
			const [value] = args as [number]
			set_settings('aspect_ratio', value)
			save_settings([ObjectStoreSettingsKeys.aspect_ratio, value])
			break
		}
		case Commands.change_settings_border_radius: {
			const [value] = args as [number]
			set_settings('border_radius', value)
			save_settings([ObjectStoreSettingsKeys.border_radius, value])
			break
		}
		case Commands.change_gradient_type: {
			const [gradient_index, type] = args as [number, GradientType]
			change_gradient_type(gradient_index, type)
			break
		}
		case Commands.change_radial_gradient_shape: {
			const gradientIndex = args[0] as number
			const shape = args[1] as RadialGradientShape
			set_gradients(gradientIndex, 'shape' as any, shape)
			break
		}
		case Commands.change_gradient_position_x: {
			const [gradient_index, x] = args as [number, number]
			set_gradients(gradient_index, 'position_x' as any, x)
			break
		}
		case Commands.change_gradient_position_y: {
			const [gradient_index, y] = args as [number, number]
			set_gradients(gradient_index, 'position_y' as any, y)
			break
		}
		case Commands.change_radial_gradient_size: {
			const [gradient_index, size] = args[1] as [number, number]
			set_gradients(gradient_index, 'size_length' as any, size)
			break
		}
		case Commands.change_radial_gradient_width: {
			const [gradient_index, width] = args as [number, number]

			set_gradients(gradient_index, 'size_width' as any, width)
			break
		}
		case Commands.change_radial_gradient_height: {
			const [gradient_index, height] = args as [number, number]

			set_gradients(gradient_index, 'size_height' as any, height)
			break
		}
		case Commands.save_gradient: {
			save_gradient()
			break
		}
		case Commands.delete_gradient_data: {
			const index = args[0] as number
			delete_gradient_data(gradient_data[index], index)
			break
		}
		case Commands.view_gradient_data: {
			const index = args[0] as number
			view_gradient_data(gradient_data[index])
			break
		}
		default: return
	}}

	onMount(() => {
		remove_splash_screen()
		init_database()
	})

	return (<App
		appbar={<AppBar
			settings={settings}
			command={command}
			gradients={gradients}
		/>}>
		<Body
			gradients={gradients}
			settings={settings}
			command={command}
			gradient_data={gradient_data}
		/>
	</App>)
}

export default _