import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { Commands } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { wait } from "@/utils/timeout"
import { url_encode, url_origin } from "@/utils/url"
import { attr_set } from "@/utils/attributes"
import { promise_done } from "@/utils/object"
import { array_includes } from "@/utils/array"
import { document_active, document_root } from "@/utils/document"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { event_current_target, event_target } from "@/utils/event"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import { number_safe } from "@/utils/number"
import { app_sass_converter as app } from "@/constants/apps"
import logo from '@/assets/apps/sass-converter-logo.svg'
import logo_redmerah from '@/assets/logo.svg'
import logo_scss from '@/assets/logos/scss-logo.svg'
import logo_sass from '@/assets/logos/sass-logo.svg'
import logo_css from '@/assets/logos/css-logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { close_menu, close_submenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, open_menu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import { NumberTextField } from "@/components/TextField"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round
	const root = document_root()
	const button_info_id = createUniqueId()
	const button_settings_id = createUniqueId()
	const button_moreactions_id = createUniqueId()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_menu_moreactions_open, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [is_submenu_downloadmoreactions_open, set_is_submenu_downloadMoreActions_open] = createSignal<boolean>(false)
	const [is_submenu_copyallmoreactions_open, set_is_submenu_copyallmoreActions_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_downloadmoreactions_ref: HTMLDivElement
	let submenu_copyallmoreactions_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
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
		wait(200)
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

	function download_file(type: 'sass' | 'scss' | 'css'): void {
		command(Commands.download_file, type)
		close_submenu(submenu_downloadmoreactions_ref)
		promise_done(wait(200), () => close_menu(menu_moreactions_ref))
	}

	async function copy_all(ev: Event, type: 'sass' | 'scss' | 'css'): Promise<void> {
		command(Commands.copy_all, ev, type)
		close_submenu(submenu_copyallmoreactions_ref)
		await wait(200)
		promise_done(wait(200), () => close_menu(menu_moreactions_ref))
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		const button_info_share_id = createUniqueId()
		const button_moreactions_openfile_id = createUniqueId()
		const button_moreactions_resetinputs_id = createUniqueId()
		const input_settings_textwrap_id = createUniqueId()
		const input_settings_minifycss_id = createUniqueId()
		const input_settings_fontsize_id = createUniqueId()
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
					if (data_theme) return change_theme(data_theme as ThemeData)

					const data_corner = element_dataset(button, 'corner')
					if (data_corner) return change_corner(data_corner as CornerData)
				}}
				onChange={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
						case input_settings_textwrap_id:
							command(Commands.toggle_textwrap)
							break
						case input_settings_minifycss_id:
							command(Commands.toggle_minify)
							break
					}
				}}
				onFocusOut={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
						case input_settings_fontsize_id:
							command(
								Commands.change_fontsize,
								number_safe(target.valueAsNumber, settings().font_size)
							)
							break
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
						c_selected={theme() == theme_light}
						c_icon_code={0xF2CD}
						data-theme={theme_light}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == theme_dark}
						c_icon_code={0xF2B3}
						data-theme={theme_dark}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == theme_system}
						c_icon_code={0xE96D}
						data-theme={theme_system}>
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
						c_selected={corner() == corner_sharp}
						c_icon_code={0xEA99}
						data-corner={corner_sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == corner_semiround}
						c_icon_code={0xEEF7}
						data-corner={corner_semiround}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == corner_round}
						c_icon_code={0xF044}
						data-corner={corner_round}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == corner_fullround}
						c_icon_code={0xE408}
						data-corner={corner_fullround}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<SwitchMenuItem
					c_icon_code={0xF19D}
					c_checked={settings().text_wrap}
					c_attr_switch={{
						id: input_settings_textwrap_id
					}}>
					Text wrap
				</SwitchMenuItem>
				<SwitchMenuItem
					c_icon_code={0xE0F5}
					c_checked={settings().minify}
					c_attr_switch={{
						id: input_settings_minifycss_id
					}}>
					Minify CSS
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<Tooltip>
						<NumberTextField
							min={12}
							c_label="Font size"
							id={input_settings_fontsize_id}
							value={settings().font_size}
						/>
					</Tooltip>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				c_on_toggleopen={is_open => set_is_menu_moreactions_open(is_open)}
				ref={r => menu_moreactions_ref = r}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						case button_moreactions_openfile_id:
							close_menu(menu_moreactions_ref)
							command(Commands.open_file, ev)
							break
						case button_moreactions_resetinputs_id:
							close_menu(menu_moreactions_ref)
							command(Commands.reset_inputs)
							break
						default:
							const data_download = element_dataset(button, 'download')
							if (data_download) {
								if (
									data_download != 'sass'
									&& data_download != 'scss'
									&& data_download != 'css'
								) return

								return download_file(data_download)
							}

							const data_copy = element_dataset(button, 'copy')
							if (data_copy) {
								if (
									data_copy != 'sass'
									&& data_copy != 'scss'
									&& data_copy != 'css'
								) return

								return copy_all(ev, data_copy)
							}
					}
				}}>
				<MenuItem
					c_icon_code={0xE607}
					id={button_moreactions_openfile_id}>
					Open file
				</MenuItem>
				<MenuDivider/>
				<SubMenu
					c_on_toggleopen={isOpen => set_is_submenu_downloadMoreActions_open(isOpen)}
					ref={r => submenu_downloadmoreactions_ref = r}
					c_item={<SubMenuItem
						c_icon_code={0xE0B9}
						c_focused={is_submenu_downloadmoreactions_open()}>
						Download
					</SubMenuItem>}>
					<MenuItem
						data-download='sass'
						c_leading={<img width={20} src={logo_sass.src} alt="SASS logo"/>}>
						SASS
					</MenuItem>
					<MenuItem
						data-download='scss'
						c_leading={<img width={20} src={logo_scss.src} alt="SCSS logo"/>}>
						SCSS
					</MenuItem>
					<MenuItem
						data-download='css'
						c_leading={<img width={20} src={logo_css.src} alt="CSS logo"/>}>
						CSS
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_copyallmoreactions_ref = r}
					c_on_toggleopen={isOpen => set_is_submenu_copyallmoreActions_open(isOpen)}
					c_item={<SubMenuItem
						c_icon_code={0xE51B}
						c_focused={is_submenu_copyallmoreactions_open()}>
						Copy all
					</SubMenuItem>}>
					<MenuItem
						data-copy='sass'
						c_leading={<img width={20} src={logo_sass.src} alt="SASS logo"/>}>
						SASS
					</MenuItem>
					<MenuItem
						data-copy='scss'
						c_leading={<img width={20} src={logo_scss.src} alt="SCSS logo"/>}>
						SCSS
					</MenuItem>
					<MenuItem
						data-copy='css'
						c_leading={<img width={20} src={logo_css.src} alt="CSS logo"/>}>
						CSS
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<MenuItem
					c_icon_code={0xE113}
					id={button_moreactions_resetinputs_id}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c_leading={<img alt="Markdown converter logo" width={32} src={logo.src} />}
			c_headline="SASS Converter"
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_info_id:
						open_menu(ev, menu_info_ref, { anchor: button })
						break
					case button_settings_id:
						open_menu(ev, menu_settings_ref, { anchor: button })
						break
					case button_moreactions_id:
						open_menu(ev, menu_moreactions_ref, { anchor: button })
						break
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