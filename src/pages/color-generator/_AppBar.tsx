import { createMemo, createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { date_year } from "@/utils/datetime"
import { url_encode } from "@/utils/url"
import { promise_done } from "@/utils/object"
import { navigator_clipboard_writetext, navigator_share } from "@/utils/navigator"
import { array_includes, array_join, array_length } from "@/utils/array"
import { attr_set, classlist_module } from "@/utils/attributes"
import { event_current_target } from "@/utils/event"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { document_root } from "@/utils/document"
import logo_redmerah from '@/assets/logo.svg'
import logo from '@/assets/apps/color-generator-logo.svg'

import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Menu, { SubMenu, MenuItem, MenuDivider, LinkMenuItem, MenuHeader, close_menu, close_submenu, open_menu, SubMenuItem } from "@/components/Menu"
import { open_dialog } from "@/components/Dialog"
import { open_colorpicker } from "@/components/ColorPicker"
import AppBar from "@/components/AppBar"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	on_add_color: () => unknown
	palette: Palette
	on_color_change: (color: HEXColor) => unknown
	palette_list: Palette[]
	colorpicker_ref: HTMLDialogElement
	dialog_colorlist_ref: HTMLDialogElement
	seed: string
}> = (props) => {
	const root = document_root()
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [timeout_id, set_timeout_id] = createSignal<number | null>(null)
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const palette = createMemo(() => props.palette)
	let menu_settings_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement

	function copy_all(): void {
		if (timeout_copy_id() != null) {
			timeout_clear(timeout_copy_id()!)
			set_timeout_copy_id(null)
		}
		promise_done(
			navigator_clipboard_writetext(array_join([
				'--seed: ' + palette().seed,
				'--accent-light: ' + palette().accent_light,
				'--on-accent-light: ' + palette().on_accent_light,
				'--accent-dark: ' + palette().accent_dark,
				'--on-accent-dark: ' + palette().on_accent_dark,
			], ';\n') + ';'),
			() => set_timeout_copy_id(timeout_set(() => set_timeout_copy_id(null), 2000))
		)
	}

	function change_theme(theme: ThemeData): void {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		promise_done(wait(200), () => close_menu(menu_settings_ref))
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		promise_done(wait(200), () => close_menu(menu_settings_ref))
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && array_includes([theme_system, theme_light, theme_dark], theme as ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([corner_sharp, corner_semiround, corner_round, corner_fullround], corner as CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_settings_ref = r}
			on_toggle_open={(v) => set_is_menu_settings_open(v)}
			style={{"min-width": '200px'}}>
			<SubMenu
				ref={r => submenu_themesettings_ref = r}
				on_toggle_open={v => set_is_submenu_themesettings_open(v)}
				item={<SubMenuItem
					focused={is_submenu_themesettings_open()}
					icon_code={0xE28A}>
					Theme
				</SubMenuItem>}>
				<MenuItem
					selected={theme() == theme_light}
					icon_code={0xF2CD}
					onClick={() => change_theme(theme_light)}>
					Light
				</MenuItem>
				<MenuItem
					selected={theme() == theme_dark}
					icon_code={0xF2B3}
					onClick={() => change_theme(theme_dark)}>
					Dark
				</MenuItem>
				<MenuItem
					selected={theme() == theme_system}
					icon_code={0xE96D}
					onClick={() => change_theme(theme_system)}>
					System theme
				</MenuItem>
			</SubMenu>
			<SubMenu
				ref={r => submenu_cornersettings_ref = r}
				on_toggle_open={v => set_is_submenu_cornersettings_open(v)}
				item={<SubMenuItem
					focused={is_submenu_cornersettings_open()}
					icon_code={0xF044}>
					Corner style
				</SubMenuItem>}>
				<MenuItem
					selected={corner() == corner_sharp}
					icon_code={0xEA99}
					onClick={() => change_corner(corner_sharp)}>
					Sharp
				</MenuItem>
				<MenuItem
					selected={corner() == corner_semiround}
					icon_code={0xEEF7}
					onClick={() => change_corner(corner_semiround)}>
					Semi round
				</MenuItem>
				<MenuItem
					selected={corner() == corner_round}
					icon_code={0xF044}
					onClick={() => change_corner(corner_round)}>
					Round
				</MenuItem>
				<MenuItem
					selected={corner() == corner_fullround}
					icon_code={0xE408}
					onClick={() => change_corner(corner_fullround)}>
					Full round
				</MenuItem>
			</SubMenu>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={RoutesLinks.home}
				leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
				Redmerah
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={RoutesLinks.apps}
				icon_code={0xE063}>
				More apps
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={RoutesLinks.about}
				icon_code={0xE930}>
				About us
			</LinkMenuItem>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={RoutesLinks.privacy}
				icon_code={0xEE51}>
				Privacy policy
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={RoutesLinks.terms}
				icon_code={0xED47}>
				Terms & conditions
			</LinkMenuItem>
			<MenuDivider/>
			<MenuItem
				onClick={() => {
					navigator_share({text: 'Color Generator', title: 'Color Generator', url: document.URL})
					close_menu(menu_settings_ref)
				}}
				icon_code={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Color Generator')}
				icon_code={0xE3A0}>
				Send feedback
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_settings_ref)}
				href={ExternalLinks.donate}
				open_in_new_tab
				icon_code={0xE84B}>
				Donate
			</LinkMenuItem>
			<MenuHeader>&copy; {date_year()} Redmerah</MenuHeader>
		</Menu>
	</>)

	return (<>
		<Tooltip>
			<AppBar
				leading={<>
					<Show when={array_length(props.palette_list) > 0}>
						<IconButton
							data-tooltip="Color list"
							onClick={(ev) => open_dialog(ev, props.dialog_colorlist_ref)}
							code={0xF098}
						/>
					</Show>
					<img width={32} src={logo.src} alt="Color generator logo" />
				</>}
				headline="Color Generator"
				trailing={<>
					<Button
						data-tooltip="Select color"
						classList={classlist_module(CSS.appbar_select_color)}
						variant={ButtonVariant.filled}
						onClick={(ev) => open_colorpicker(ev, props.colorpicker_ref, {anchor: event_current_target(ev)})}>
						{props.seed}
					</Button>
					<IconButton
						data-tooltip="Add color to list"
						onClick={() => {
							if (timeout_id()) {
								timeout_clear(timeout_id()!)
								set_timeout_id(null)
							}
							props.on_add_color()
							set_timeout_id(timeout_set(() => set_timeout_id(null), 1000))
						}}
						code={timeout_id()? 0xE3D8 : 0xF08A}
					/>
					<IconButton
						data-tooltip="Copy all"
						onClick={() => copy_all()}
						code={timeout_copy_id()? 0xE3D8 : 0xE51B}
					/>
					<IconButton
						data-tooltip="Open settings"
						classList={classlist_module(CSSAnimation.btn_rotate_icon)}
						focused={is_menu_settings_open()}
						onClick={ev => open_menu(ev, menu_settings_ref, { anchor: event_current_target(ev) })}
						code={0xEE0F}
					/>
				</>}
			/>
		</Tooltip>
		<Menus />
	</>)
}

export default _