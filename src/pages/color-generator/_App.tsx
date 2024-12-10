import { type Component, For, Show, type VoidComponent, createMemo, createSignal, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { HEXColor, RGBColor } from '@/types/color'
import type { Palette } from './_types'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { generate_color, hex_to_rgb, is_color_valid } from '@/utils/color'
import { add_classlist_module, get_element_by_id } from '@/utils/element'
import { DatabaseNames, LocalStorageKeys } from '@/enums/storage'
import { storage_get, storage_set } from '@/utils/storage'
import { ElementIds } from '@/enums/ids'
import { IDB, idb_store_clear, idb_store_delete, idb_store_put } from '@/utils/indexeddb'
import { ObjectStoreNames, type ObjectStorePaletteList } from './_storage'
import { remove_splash_screen } from '@/scripts/splash'
import { string_touppercase } from '@/utils/string'
import { array_filter, array_join, array_length, array_push } from '@/utils/array'
import { navigator_clipboard_writetext } from '@/utils/navigator'
import { promise_done } from '@/utils/object'

import {TextTooltip} from '@/components/Tooltip'
import Divider from '@/components/Divider'
import Button, { ButtonVariant, FloatingActionButton, IconButton } from '@/components/Button'
import List from '@/components/List'
import ColorPicker, { close_colorpicker, open_colorpicker } from '@/components/ColorPicker'
import Dialog, { close_dialog, open_dialog } from '@/components/Dialog'
import App from '@/components/App'
import AppBar from './_AppBar'
import Body from './_Body'
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.color_generator)
	const [palette, set_palette] = createStore<Palette>({
		seed: '#00FFF0',
		accent_light: '#005C56',
		on_accent_light: '#FFFFFF',
		accent_dark: '#00C7BB',
		on_accent_dark: '#000000'
	})
	const [palette_list, set_palette_list] = createSignal<Palette[]>([])
	const [timeout_id, set_timeout_id] = createSignal<number | null>(null)
	const [colorpicker_ref, set_colorpicker_ref] = createSignal<HTMLDialogElement | null>(null)
	const [dialog_colorlist_ref, set_dialog_colorlist_ref] = createSignal<HTMLDialogElement | null>(null)
	let dialog_deleteall_ref: HTMLDialogElement

	function delete_all_palette_list(): void {
		set_palette_list([])
		const store_paletteList = db.write_store(ObjectStoreNames.palette_list)
		if (store_paletteList) idb_store_clear(store_paletteList)
	}

	function rgb_to_css_value(rgb: RGBColor): string {
		return `${rgb.r}, ${rgb.g}, ${rgb.b}`
	}

	function on_color_change(color: HEXColor): void {
		const generated_color = generate_color(color)
		const element_accentcolor_style = get_element_by_id(ElementIds.color_accent)!
		element_accentcolor_style.innerHTML = `:root{--g-color-accent-light: ${rgb_to_css_value(hex_to_rgb(generated_color.color))};--g-color-accent-dark: ${rgb_to_css_value(hex_to_rgb(generated_color.color_dark))};--g-color-on-accent-light: ${rgb_to_css_value(hex_to_rgb(generated_color.on_color))};--g-color-on-accent-dark: ${rgb_to_css_value(hex_to_rgb(generated_color.on_color_dark))};}`;
		storage_set(LocalStorageKeys.color, color)
		set_palette({
			seed: string_touppercase(color) as HEXColor,
			accent_light: string_touppercase(generated_color.color) as HEXColor,
			on_accent_light: string_touppercase(generated_color.on_color) as HEXColor,
			accent_dark: string_touppercase(generated_color.color_dark) as HEXColor,
			on_accent_dark: string_touppercase(generated_color.on_color_dark) as HEXColor
		})
	}

	function copy_all_palette_list(): void {
		if (timeout_id()) {
			timeout_clear(timeout_id()!)
			set_timeout_id(null)
		}

		const colors_text: string[] = []
		for (const i in palette_list()) {
			const palette = palette_list()[i]
			array_push(colors_text, array_join([
				`--seed-${i + 1}: ` + palette.seed,
				`--accent-light-${i + 1}: ` + palette.accent_light,
				`--on-accent-light-${i + 1}: ` + palette.on_accent_light,
				`--accent-dark-${i + 1}: ` + palette.accent_dark,
				`--on-accent-dark-${i + 1}: ` + palette.on_accent_dark,
			], ';\n') + ';')
		}

		promise_done(
			navigator_clipboard_writetext(array_join(colors_text, '\n\n')),
			() => set_timeout_id(timeout_set(() => set_timeout_id(null), 2000))
		)
	}

	function on_add_color(): void {
		for (const p of palette_list()) {
			if (p.accent_light == palette.accent_light) return
		}

		set_palette_list(l => [...l, {...palette}])
		const store_paletteList = db.write_store(ObjectStoreNames.palette_list)
		if (store_paletteList) idb_store_put(store_paletteList, {...palette})
	}

	function init_color(): void {
		const color = storage_get(LocalStorageKeys.color)

		if (!is_color_valid(color ?? '')) return;
		on_color_change(color as HEXColor)
		set_palette('seed', color as HEXColor)
	}

	function init_palette_list(): void {
		const store_palettelist = db.read_store(ObjectStoreNames.palette_list)
		if (store_palettelist == null) return;

		promise_done(
			db.get_all<ObjectStorePaletteList>(store_palettelist),
			(result) => set_palette_list(v => result? [...result] : v)
		)
	}

	function init_database(): void {
		db.open({
			on_success() {
				init_palette_list()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStorePaletteList>({
					name: ObjectStoreNames.palette_list,
					key_path: 'seed',
					indexs: ['seed', 'accent_light', 'on_accent_light', 'accent_dark', 'on_accent_dark']
				})
			},
		})
	}

	onMount(() => {
		init_color()
		init_database()
		remove_splash_screen()
	})

	const ListItem: Component<{palette: Palette}> = (props) => {
		const [timeout_id, set_timeout_id] = createSignal<number | null>(null)
		const palette = createMemo(() => props.palette)

		function copy(): void {
			if (timeout_id()) {
				timeout_clear(timeout_id()!)
				set_timeout_id(null)
			}

			promise_done(
				navigator_clipboard_writetext(array_join([
					'--seed: ' + palette().seed,
					'--accent-light: ' + palette().accent_light,
					'--on-accent-light: ' + palette().on_accent_light,
					'--accent-dark: ' + palette().accent_dark,
					'--on-accent-dark: ' + palette().on_accent_dark,
				], ';\n') + ';'),
				() => set_timeout_id(timeout_set(() => set_timeout_id(null), 1000))
			)
		}

		function delete_color(): void {
			const p = {...palette()}
			set_palette_list(l => array_filter(l, v => v.accent_light != palette().accent_light))
			if (array_length(palette_list()) == 0) {
				close_colorpicker(dialog_colorlist_ref()!)
			}

			const store_palettelist = db.write_store(ObjectStoreNames.palette_list)
			if (store_palettelist) idb_store_delete(store_palettelist, p.seed)
		}

		return (<List
			trailing={<>
				<IconButton
					data-tooltip="Copy"
					onClick={copy}
					code={timeout_id()? 0xE3D8 : 0xE51B}
				/>
				<IconButton
					data-tooltip="Delete"
					onClick={delete_color}
					code={0xE59D}
				/>
			</>}
			subtitle={<div class={CSS.app_dialog_colors}>
				<div data-tooltip="Accent Light" style={{
					"background-color": palette().accent_light,
					color: palette().on_accent_light,
				}}>{palette().accent_light}</div>
				<div data-tooltip="On Accent Light" style={{
					"background-color": palette().on_accent_light,
					color: palette().accent_light,
				}}>{palette().on_accent_light}</div>
				<div data-tooltip="Accent Dark" style={{
					"background-color": palette().accent_dark,
					color: palette().on_accent_dark,
				}}>{palette().accent_dark}</div>
					<div data-tooltip="On Accent Dark" style={{
					"background-color": palette().on_accent_dark,
					color: palette().accent_dark,
				}}>{palette().on_accent_dark}</div>
			</div>}
			leading={<div class={CSS.app_seed} style={{"background-color": palette().seed}}/>}>
			{ palette().seed }
		</List>)
	}

	return (<>
		<App
			appbar={<AppBar
				colorpicker_ref={colorpicker_ref()!}
				dialog_colorlist_ref={dialog_colorlist_ref()!}
				on_add_color={on_add_color}
				seed={palette.seed}
				palette={palette}
				on_color_change={on_color_change}
				palette_list={palette_list()}
			/>}
			floating_action_button={<FloatingActionButton
				classList={add_classlist_module(CSS.app_fab)}
				variant={ButtonVariant.filled}
				onClick={(ev) => open_colorpicker(ev, colorpicker_ref()!, {anchor: ev.currentTarget})}>
				{palette.seed}
			</FloatingActionButton>}>
			<Body {...palette} />
		</App>
		<ColorPicker
			ref={r => set_colorpicker_ref(r)}
			color={palette.seed}
			disabled_color_control
			disabled_opacity_control
			on_select_color={on_color_change}
		/>
		<Dialog
			ref={r => set_dialog_colorlist_ref(r)}
			style={{width: '640px'}}
			header="Color list"
			actions={<>
				<Button
					variant={ButtonVariant.tonal}
					onClick={(ev) => open_dialog(ev, dialog_deleteall_ref, {important: true})}>
					Delete all
				</Button>
				<Button variant={ButtonVariant.tonal} onClick={copy_all_palette_list}>
					<Show when={timeout_id()} fallback='Copy all'>Copied</Show>
				</Button>
				<Button
					variant={ButtonVariant.filled}
					onClick={() => close_dialog(dialog_colorlist_ref()!)}>
					Close
				</Button>
			</>}>
			<TextTooltip>
				<For each={palette_list()}>{(p, i) => <>
					<Show when={i() > 0}><Divider /></Show>
					<ListItem palette={p}/>
				</>}</For>
			</TextTooltip>
		</Dialog>
		<Dialog
			ref={r => dialog_deleteall_ref = r}
			header="Delete all"
			actions={<>
				<Button onClick={() => close_dialog(dialog_deleteall_ref)} variant={ButtonVariant.tonal}>Cancel</Button>
				<Button onClick={() => {
					close_dialog(dialog_deleteall_ref)
					close_dialog(dialog_colorlist_ref()!)
					delete_all_palette_list()
				}} variant={ButtonVariant.filled}>Delete all</Button>
			</>}>
			Are you sure want to delete all palette color?
		</Dialog>
	</>)
}

export default _