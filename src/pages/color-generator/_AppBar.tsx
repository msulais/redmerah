import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { date_year } from "@/utils/datetime"
import { url_encode, url_origin } from "@/utils/url"
import { promise_done, valid_enum_value } from "@/utils/object"
import { navigator_clipboard_writetext, navigator_share } from "@/utils/navigator"
import { array_join, array_length } from "@/utils/array"
import { attr_set, classlist_module } from "@/utils/attributes"
import { event_current_target } from "@/utils/event"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { app_color_generator as app } from "@/constants/apps"
import { document_active, document_root } from "@/utils/document"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COPY, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_BULLET_LIST_ADD, ICON_TEXT_BULLET_LIST_SQUARE, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo_redmerah from '@/assets/logo.svg'

import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Menu, { SubMenu, MenuItem, MenuDivider, LinkMenuItem, MenuHeader, close_menu, close_submenu, open_menu, SubMenuItem, MenuIndent } from "@/components/Menu"
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
	const button_colorlist_id = createUniqueId()
	const button_selectcolor_id = createUniqueId()
	const button_colortolist_id = createUniqueId()
	const button_copyall_id = createUniqueId()
	const button_settings_id = createUniqueId()
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [timeout_id, set_timeout_id] = createSignal<number | null>(null)
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
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
		close_menu(menu_settings_ref)
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && valid_enum_value(theme, ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && valid_enum_value(corner, CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		const button_settings_share_id = createUniqueId()
		return (<>
			<Menu
				ref={r => menu_settings_ref = r}
				c_on_toggleopen={(v) => set_is_menu_settings_open(v)}
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => {
							const tagname = element_tagname(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (element_id(button)) {
						case button_settings_share_id:{
							navigator_share({
								title: app.name,
								text: app.name + ' v' + app.build_version,
								url: url_origin() + app.link
							})
							close_menu(menu_settings_ref)
							break
						}
						default: {
							const data_theme = element_dataset(button, 'theme')
							if (data_theme
								&& valid_enum_value(data_theme, ThemeData)
							) return change_theme(data_theme as ThemeData)

							const data_corner = element_dataset(button, 'corner')
							if (data_corner
								&& valid_enum_value(data_corner, CornerData)
							) return change_corner(data_corner as CornerData)
						}
					}
				}}>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_themesettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_themesettings_open()}
						c_icon_code={ICON_WEATHER_SUNNY}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c_selected={theme() == ThemeData.light}
						c_icon_code={ICON_WEATHER_SUNNY}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.dark}
						c_icon_code={ICON_WEATHER_MOON}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.system}
						c_icon_code={ICON_LAPTOP_SETTINGS}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_cornersettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_cornersettings_open()}
						c_icon_code={ICON_TEARDROP_BOTTOM_RIGHT}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c_selected={corner() == CornerData.sharp}
						c_icon_code={ICON_MAXIMIZE}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.semi_round}
						c_icon_code={ICON_SQUARE}
						data-corner={CornerData.semi_round}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.round}
						c_icon_code={ICON_TEARDROP_BOTTOM_RIGHT}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.full_round}
						c_icon_code={ICON_CIRCLE}
						data-corner={CornerData.full_round}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.home}
					c_leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}
					c_trailing={<MenuIndent />}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c_icon_code={ICON_APPS}
					c_trailing={<MenuIndent />}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c_icon_code={ICON_INFO}
					c_trailing={<MenuIndent />}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c_icon_code={ICON_SHIELD_CHECKMARK}
					c_trailing={<MenuIndent />}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c_icon_code={ICON_RECEIPT}
					c_trailing={<MenuIndent />}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_settings_share_id}
					c_icon_code={ICON_SHARE_ANDROID}
					c_trailing={<MenuIndent />}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					c_icon_code={ICON_CHAT}
					c_trailing={<MenuIndent />}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={ICON_GIFT}
					c_trailing={<MenuIndent />}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
		</>)
	}

	return (<>
		<Tooltip>
			<AppBar
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
					case button_colorlist_id:
						open_dialog(ev, props.dialog_colorlist_ref)
						break
					case button_selectcolor_id:
						open_colorpicker(ev, props.colorpicker_ref, {
							anchor: button,
							color: props.seed as HEXColor
						})
						break
					case button_colortolist_id:
						if (timeout_id()) {
							timeout_clear(timeout_id()!)
							set_timeout_id(null)
						}
						props.on_add_color()
						set_timeout_id(timeout_set(() => set_timeout_id(null), 1000))
						break
					case button_copyall_id:
						copy_all()
						break
					case button_settings_id:
						open_menu(ev, menu_settings_ref, { anchor: button })
						break
					}
				}}
				c_leading={<>
					<Show when={array_length(props.palette_list) > 0}>
						<IconButton
							id={button_colorlist_id}
							data-tooltip="Color list"
							c_code={ICON_TEXT_BULLET_LIST_SQUARE}
						/>
					</Show>
					<img width={32} src={app.logo_url} alt={app.name} />
				</>}
				c_headline={app.name}
				c_trailing={<>
					<Button
						data-tooltip="Select color"
						id={button_selectcolor_id}
						classList={classlist_module(CSS.appbar_select_color)}
						c_variant={ButtonVariant.filled}>
						{props.seed}
					</Button>
					<IconButton
						data-tooltip="Add color to list"
						id={button_colortolist_id}
						c_code={timeout_id()? ICON_CHECKMARK : ICON_TEXT_BULLET_LIST_ADD}
					/>
					<IconButton
						data-tooltip="Copy all"
						id={button_copyall_id}
						c_code={timeout_copy_id()? ICON_CHECKMARK : ICON_COPY}
					/>
					<IconButton
						data-tooltip="Open settings"
						id={button_settings_id}
						classList={classlist_module(CSSAnimation.btn_rotate_icon)}
						c_focused={is_menu_settings_open()}
						c_code={ICON_SETTINGS}
					/>
				</>}
			/>
		</Tooltip>
		<Menus />
	</>)
}

export default _