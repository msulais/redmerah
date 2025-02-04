import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Gradient, Settings } from "./_type"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set } from "@/utils/attributes"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode, url_origin } from "@/utils/url"
import { ColorModel, Commands } from "./_enums"
import { gradient_to_css_text } from "./_utils"
import { promise_done, valid_enum_value } from "@/utils/object"
import { array_join, array_map } from "@/utils/array"
import { navigator_clipboard_writetext, navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { event_current_target } from "@/utils/event"
import { document_active, document_root } from "@/utils/document"
import { app_color_gradient as app } from "@/constants/apps"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CIRCLE, ICON_COLOR, ICON_COPY, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_RECEIPT, ICON_SAVE, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo_redmerah from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, open_menu, LinkMenuItem, SubMenu, close_submenu, close_menu, SubMenuItem, MenuItemTrailingShortcut } from "@/components/Menu"
import Toast, { open_toast } from "@/components/Toast"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	gradients: Gradient[]
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const root = document_root()
	const button_info_id = createUniqueId()
	const button_settings_id = createUniqueId()
	const button_moreactions_id = createUniqueId()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_menu_moreactions_open, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_colormodelsettings_open, set_is_submenu_colormodelsettings_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_colormodelsettings_ref: HTMLDivElement
	let toast_copied_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
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

	function change_color_model(model: ColorModel): void {
		command(Commands.change_settings_colormodel, model)
		close_submenu(submenu_colormodelsettings_ref)
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

	function copy_gradient(ev: Event): void {
		const text = array_join(
			array_map(
				props.gradients,
				gradient => gradient_to_css_text(gradient, settings().color_model, true)
			),
			'\n'
		)

		promise_done(
			navigator_clipboard_writetext(text),
			() => open_toast(ev, toast_copied_ref)
		)
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		const button_info_share_id = createUniqueId()
		const button_moreactions_savegradient_id = createUniqueId()
		const button_moreactions_copygradient_id = createUniqueId()
		return (<>
			<Menu
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
						case button_info_share_id:
							navigator_share({
								title: app.name,
								text: app.name + ' v' + app.build_version,
								url: url_origin() + app.link
							})
							break
					}

					close_menu(menu_info_ref)
				}}
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				c_on_toggleopen={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					c_leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c_icon_code={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c_icon_code={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c_icon_code={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c_icon_code={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_info_share_id}
					c_icon_code={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					c_icon_code={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				c_on_toggleopen={(v) => set_is_menu_settings_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_theme = element_dataset(button, 'theme')
					if (data_theme
						&& valid_enum_value(data_theme, ThemeData)
					) return change_theme(data_theme as ThemeData)

					const data_corner = element_dataset(button, 'corner')
					if (data_corner
						&& valid_enum_value(data_corner, CornerData)
					) return change_corner(data_corner as CornerData)

					const data_model = element_dataset(button, 'model')
					if (data_model
						&& valid_enum_value(data_model, ColorModel)
					) change_color_model(data_model as ColorModel)
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
				<SubMenu
					ref={r => submenu_colormodelsettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_colormodelsettings_open(v)}
					style={{"min-width": '180px'}}
					c_item={<SubMenuItem
						c_focused={is_submenu_colormodelsettings_open()}
						c_icon_code={ICON_COLOR}>
						Color model
					</SubMenuItem>}>
					<MenuItem
						data-model={ColorModel.rgba}
						c_selected={settings().color_model == ColorModel.rgba}
						c_trailing={<MenuItemTrailingShortcut c_shortcuts={['rgba(R,G,B,A)']}/>}>
						RGBA
					</MenuItem>
					<MenuItem
						data-model={ColorModel.hsla}
						c_selected={settings().color_model == ColorModel.hsla}
						c_trailing={<MenuItemTrailingShortcut c_shortcuts={['hsla(H°,S%,L%,A)']}/>}>
						HSLA
					</MenuItem>
					<MenuItem
						data-model={ColorModel.hex}
						c_selected={settings().color_model == ColorModel.hex}
						c_trailing={<MenuItemTrailingShortcut c_shortcuts={['#RRGGBBAA']}/>}>
						HEX
					</MenuItem>
				</SubMenu>
			</Menu>
			<Menu
				c_on_toggleopen={isOpen => set_is_menu_moreactions_open(isOpen)}
				style={{"min-width": "164px"}}
				ref={r => menu_moreactions_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_moreactions_savegradient_id: {
							close_menu(menu_moreactions_ref)
							command(Commands.save_gradient)
							break
						}
						case button_moreactions_copygradient_id: {
							close_menu(menu_moreactions_ref)
							copy_gradient(ev)
							break
						}
					}
				}}>
				<MenuItem
					c_icon_code={ICON_SAVE}
					id={button_moreactions_savegradient_id}>
					Save gradient
				</MenuItem>
				<MenuItem
					c_icon_code={ICON_COPY}
					id={button_moreactions_copygradient_id}>
					Copy gradient
				</MenuItem>
			</Menu>
		</>)
	}

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_copied_ref = r}
			c_leading={<Icon c_code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<>
		<AppBar
			c_leading={<img alt={app.name} width={32} src={app.logo_url} />}
			c_headline={app.name}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_info_id: {
						open_menu(ev, menu_info_ref, { anchor: button })
						break
					}
					case button_settings_id: {
						open_menu(ev, menu_settings_ref, { anchor: button })
						break
					}
					case button_moreactions_id: {
						open_menu(ev, menu_moreactions_ref, { anchor: button })
						break
					}
				}
			}}
			c_trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					c_focused={is_menu_info_open()}
					id={button_info_id}
					c_code={ICON_INFO}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					c_focused={is_menu_settings_open()}
					id={button_settings_id}
					c_code={ICON_SETTINGS}
				/>
				<IconButton
					data-tooltip="More actions"
					c_focused={is_menu_moreactions_open()}
					id={button_moreactions_id}
					c_code={ICON_MORE_VERTICAL}
				/>
			</Tooltip>}
		/>
		<Menus />
		<Toasts />
	</>)
}

export default _