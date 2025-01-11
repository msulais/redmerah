import { type Component, For, Show, type VoidComponent, createMemo, createSignal, createUniqueId, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { HEXColor, RGBColor } from '@/types/color'
import type { Palette } from './_types'
import { timeout_clear, timeout_set } from '@/utils/timeout'
import { generate_color, hex_to_rgb, is_color_valid } from '@/utils/color'
import { element_animate, element_by_id, element_dataset, element_first_child, element_id, element_set_textcontent, element_tagname, element_valid_target } from '@/utils/element'
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
import { math_round } from '@/utils/math'
import { event_current_target } from '@/utils/event'
import { classlist_module } from '@/utils/attributes'
import { document_active } from '@/utils/document'
import { number_is_not_defined, number_parse } from '@/utils/number'
import { AnimationEffectTiming } from '@/enums/animation'

import {Tooltip} from '@/components/Tooltip'
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
	const timeout_copylist: Record<string, number> = {}
	let dialog_deleteall_ref: HTMLDialogElement

	function delete_all_palette_list(): void {
		set_palette_list([])
		const store_paletteList = db.write_store(ObjectStoreNames.palette_list)
		if (store_paletteList) idb_store_clear(store_paletteList)
	}

	function rgb_to_css_value(rgb: RGBColor): string {
		return `${math_round(rgb.r * 0xff)}, ${math_round(rgb.g * 0xff)}, ${math_round(rgb.b * 0xff)}`
	}

	function on_color_change(color: HEXColor): void {
		const generated_color = generate_color(color)
		const element_accentcolor_style = element_by_id(ElementIds.color_accent)!
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
			if (p.seed == palette.seed) return
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

	function copy_list(button: HTMLElement, index: number) {
		const palette = palette_list()[index]
		if (timeout_copylist[palette.seed]) return

		promise_done(
			navigator_clipboard_writetext(array_join([
				'--seed: ' + palette.seed,
				'--accent-light: ' + palette.accent_light,
				'--on-accent-light: ' + palette.on_accent_light,
				'--accent-dark: ' + palette.accent_dark,
				'--on-accent-dark: ' + palette.on_accent_dark,
			], ';\n') + ';'), () => {
			const icon = element_first_child(button)
			if (!icon) return

			timeout_copylist[palette.seed] = 1
			const animation_option = {
				duration: 150,
				easing: AnimationEffectTiming.spring
			}
			promise_done(
				element_animate(icon, {scale: [1, 0]}, animation_option).finished,
			() => {
				element_set_textcontent(icon, String.fromCharCode(0xE3D8))
				promise_done(
					element_animate(icon, {scale: [0, 1]}, animation_option).finished,
				() =>  timeout_set(() => {
					promise_done(
						element_animate(icon, {scale: [1, 0]}, animation_option).finished,
					() => {
						element_set_textcontent(icon, String.fromCharCode(0xE51B))
						element_animate(icon, {scale: [0, 1]}, animation_option)
						delete timeout_copylist[palette.seed]
					})
				}, 1000))
			})
		})
	}

	onMount(() => {
		init_color()
		init_database()
		remove_splash_screen()
	})

	const ListItem: Component<{palette: Palette, index: number}> = (props) => {
		const palette = createMemo(() => props.palette)
		return (<List
			c_trailing={<>
				<IconButton
					data-tooltip="Copy"
					data-listitem-copy={props.index}
					c_code={0xE51B}
				/>
				<IconButton
					data-tooltip="Delete"
					data-listitem-delete={props.index}
					c_code={0xE59D}
				/>
			</>}
			c_subtitle={<div class={CSS.app_dialog_colors}>
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
			c_leading={<div class={CSS.app_seed} style={{"background-color": palette().seed}}/>}>
			{ palette().seed }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const button_colorlist_deleteall_id = createUniqueId()
		const button_colorlist_copy_id = createUniqueId()
		const button_colorlist_close_id = createUniqueId()
		const button_deleteall_cancel_id = createUniqueId()
		const button_deleteall_deleteall_id = createUniqueId()
		return (<>
			<Dialog
				ref={r => set_dialog_colorlist_ref(r)}
				style={{width: '640px'}}
				c_header="Color list"
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_colorlist_deleteall_id: {
							open_dialog(ev, dialog_deleteall_ref, {important: true})
							break
						}
						case button_colorlist_copy_id: {
							copy_all_palette_list()
							break
						}
						case button_colorlist_close_id: {
							close_dialog(dialog_colorlist_ref()!)
							break
						}
						default: {
							const data_listitem_copy = element_dataset(button, 'listitemCopy')
							if (data_listitem_copy) {
								const index = number_parse(data_listitem_copy, true)
								if (number_is_not_defined(index)) return

								copy_list(button, index)
								return
							}

							const data_listitem_delete = element_dataset(button, 'listitemDelete')
							if (data_listitem_delete) {
								const index = number_parse(data_listitem_delete, true)
								if (number_is_not_defined(index)) return

								const palette = palette_list()[index]
								set_palette_list(l => array_filter(l, v => v.seed != palette.seed))
								if (array_length(palette_list()) == 0) {
									close_colorpicker(dialog_colorlist_ref()!)
								}

								const store_palettelist = db.write_store(ObjectStoreNames.palette_list)
								if (store_palettelist) idb_store_delete(store_palettelist, palette.seed)
								return
							}
						}
					}
				}}
				c_actions={<>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_colorlist_deleteall_id}>
						Delete all
					</Button>
					<Button
						c_variant={ButtonVariant.tonal}
						id={button_colorlist_copy_id}>
						<Show when={timeout_id()} fallback='Copy all'>Copied</Show>
					</Button>
					<Button
						c_variant={ButtonVariant.filled}
						id={button_colorlist_close_id}>
						Close
					</Button>
				</>}>
				<Tooltip>
					<For each={palette_list()}>{(p, i) => <>
						<Show when={i() > 0}><Divider /></Show>
						<ListItem palette={p} index={i()}/>
					</>}</For>
				</Tooltip>
			</Dialog>
			<Dialog
				ref={r => dialog_deleteall_ref = r}
				c_header="Delete all"
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_deleteall_cancel_id: {
							close_dialog(dialog_deleteall_ref)
							break
						}
						case button_deleteall_deleteall_id: {
							close_dialog(dialog_deleteall_ref)
							close_dialog(dialog_colorlist_ref()!)
							delete_all_palette_list()
							break
						}
					}
				}}
				c_actions={<>
					<Button
						id={button_deleteall_cancel_id}
						c_variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={button_deleteall_deleteall_id}
						c_variant={ButtonVariant.filled}>
						Delete all
					</Button>
				</>}>
				Are you sure want to delete all palette color?
			</Dialog>
		</>)
	}

	return (<>
		<App
			c_appbar={<AppBar
				colorpicker_ref={colorpicker_ref()!}
				dialog_colorlist_ref={dialog_colorlist_ref()!}
				on_add_color={on_add_color}
				seed={palette.seed}
				palette={palette}
				on_color_change={on_color_change}
				palette_list={palette_list()}
			/>}
			c_floating_action_button={<FloatingActionButton
				classList={classlist_module(CSS.app_fab)}
				c_variant={ButtonVariant.filled}
				onClick={(ev) => open_colorpicker(ev, colorpicker_ref()!, {
					anchor: event_current_target(ev),
					color: palette.seed as HEXColor
				})}>
				{palette.seed}
			</FloatingActionButton>}>
			<Body {...palette} />
		</App>
		<ColorPicker
			ref={r => set_colorpicker_ref(r)}
			c_color={palette.seed}
			c_draggable
			c_disabled_action
			c_disabled_opacity_control
			c_on_update_color={on_color_change}
		/>
		<Dialogs />
	</>)
}

export default _