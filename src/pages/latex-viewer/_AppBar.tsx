import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { url_encode, url_origin } from "@/utils/url"
import { setAttribute } from "solid-js/web"
import { Commands } from "./_enums"
import { navigator_share } from "@/utils/navigator"
import { document_active, document_root } from "@/utils/document"
import { date_year } from "@/utils/datetime"
import { number_safe } from "@/utils/number"
import { event_current_target, event_target } from "@/utils/event"
import { app_latex_viewer as app } from "@/constants/apps"
import { attr_set } from "@/utils/attributes"
import { element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { valid_enum_value } from "@/utils/object"
import logo from '@/assets/apps/latex-viewer/logo.svg'
import logo_redmerah from '@/assets/logo.svg'

import { IconButton } from "@/components/Button"
import TextField, { NumberTextField } from "@/components/TextField"
import Menu, { close_submenu, close_menu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import AppBar from "@/components/AppBar"
import Tooltip from "@/components/Tooltip"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = document_root()
	const button_info_id = createUniqueId()
	const button_settings_id = createUniqueId()
	const button_moreactions_id = createUniqueId()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_menu_moreactions_open, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		setAttribute(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		setAttribute(root, RootAttributes.corner, corner)
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
		const button_info_share_id = createUniqueId()
		const input_settings_textwrap_id = createUniqueId()
		const input_settings_fontsize_id = createUniqueId()
		const input_settings_prefix_id = createUniqueId()
		const input_settings_suffix_id = createUniqueId()
		const button_moreactions_copyall_id = createUniqueId()
		const button_moreactions_resetinput_id = createUniqueId()
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
					c_icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c_icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c_icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c_icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_info_share_id}
					c_icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					c_icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={0xE84B}>
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
				}}
				onChange={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
						case input_settings_textwrap_id: {
							command(Commands.toggle_textwrap)
							break
						}
					}
				}}
				onFocusOut={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
						case input_settings_fontsize_id: {
							command(
								Commands.change_fontsize,
								number_safe(target.valueAsNumber, settings().font_size)
							)
							break
						}
						case input_settings_prefix_id: {
							command(Commands.change_prefix, target.value)
							break
						}
						case input_settings_suffix_id: {
							command(Commands.change_suffix, target.value)
							break
						}
					}
				}}>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_themesettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_themesettings_open()}
						c_icon_code={0xE28A}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c_selected={theme() == ThemeData.light}
						c_icon_code={0xF2CD}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.dark}
						c_icon_code={0xF2B3}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.system}
						c_icon_code={0xE96D}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_cornersettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_cornersettings_open()}
						c_icon_code={0xF044}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c_selected={corner() == CornerData.sharp}
						c_icon_code={0xEA99}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.semi_round}
						c_icon_code={0xEEF7}
						data-corner={CornerData.semi_round}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.round}
						c_icon_code={0xF044}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.full_round}
						c_icon_code={0xE408}
						data-corner={CornerData.full_round}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<SwitchMenuItem
					c_icon_code={0xF19D}
					c_checked={settings().text_wrap}
					c_attr_switch={{id: input_settings_textwrap_id}}>
					Text wrap
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<Tooltip>
						<NumberTextField
							min={12}
							c_label="Font size"
							value={settings().font_size}
							id={input_settings_fontsize_id}
						/>
					</Tooltip>
					<TextField
						c_attr_wrapper={{style: {"margin-top": '8px'}}}
						c_label="Prefix"
						id={input_settings_prefix_id}
						value={settings().prefix}
					/>
					<TextField
						c_attr_wrapper={{style: {"margin-top": '8px'}}}
						c_label="Suffix"
						id={input_settings_suffix_id}
						value={settings().suffix}
					/>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '164px'}}
				c_on_toggleopen={v => set_is_menu_moreactions_open(v)}
				ref={r => menu_moreactions_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
						case button_moreactions_copyall_id: {
							close_menu(menu_moreactions_ref)
							command(Commands.copy_all, ev)
							break
						}
						case button_moreactions_resetinput_id: {
							close_menu(menu_moreactions_ref)
							command(Commands.reset_inputs)
						}
					}
				}}>
				<MenuItem
					c_icon_code={0xE51B}
					id={button_moreactions_copyall_id}>
					Copy all
				</MenuItem>
				<MenuItem
					c_icon_code={0xE113}
					id={button_moreactions_resetinput_id}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c_leading={<img alt="LaTeX Viewer logo" width={32} src={logo.src} />}
			c_headline="LaTeX Viewer"
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
					}
				}
			}}
			c_trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					id={button_info_id}
					c_focused={is_menu_info_open()}
					c_code={0xE930}
				/>
				<IconButton
					data-tooltip="Settings"
					id={button_settings_id}
					class={CSSAnimation.btn_rotate_icon}
					c_focused={is_menu_settings_open()}
					c_code={0xEE0F}
				/>
				<IconButton
					data-tooltip="More actions"
					id={button_moreactions_id}
					c_focused={is_menu_moreactions_open()}
					c_code={0xEAD9}
				/>
			</Tooltip>}
		/>
		<Menus/>
	</>)
}

export default _