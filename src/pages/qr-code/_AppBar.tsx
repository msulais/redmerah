import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { all_CornerData, CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { all_ThemeData, ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set } from "@/utils/attributes"
import { timeout_set, wait } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode, url_origin } from "@/utils/url"
import { document_active, document_root } from "@/utils/document"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { event_current_target, event_target } from "@/utils/event"
import { number_is_not_defined, number_parse, number_safe } from "@/utils/number"
import { app_qr_code as app } from "@/constants/apps"
import { valid_enum_value } from "@/utils/object"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import { all_CopyFileType, all_DownloadFileType, all_EncodingMode, all_ErrorCorrectionLevel, Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import logo_redmerah from '@/assets/logo.svg'

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { MenuDivider, MenuItem, MenuHeader, open_menu, LinkMenuItem, SubMenu, close_submenu, close_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import ColorPicker, { ColorPickerPosition, open_colorpicker } from "@/components/ColorPicker"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
	is_generate_error: boolean
	page: Pages
}> = (props) => {
	const root = document_root()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_menu_moreactions_open, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_errorcorrectionlevelsettings_open, set_is_submenu_errorcorrectionlevelsettings_open] = createSignal<boolean>(false)
	const [is_submenu_encodingmodesettings_ref_open, set_is_submenu_encodingmodesettings_open] = createSignal<boolean>(false)
	const [is_colorpicker_color_open, set_is_colorpicker_color_open] = createSignal<boolean>(false)
	const [is_colorpicker_backgroundcolor_open, set_is_colorpicker_backgroundcolor_open] = createSignal<boolean>(false)
	const [is_submenu_downloadmoreactions_open, set_is_submenu_downloadmoreactions_open] = createSignal<boolean>(false)
	const [is_submenu_copymoreactions_open, set_is_submenu_copymoreactions_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	const button_appbar_info_id = createUniqueId()
	const button_appbar_settings_id = createUniqueId()
	const button_appbar_moreactions_id = createUniqueId()
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_downloadmoreactions_ref: HTMLDivElement
	let submenu_copymoreactions_ref: HTMLDivElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_errorcorrectionlevelsettings_ref: HTMLDivElement
	let submenu_encodingmodesettings_ref: HTMLDivElement
	let colorpicker_color_ref: HTMLDialogElement
	let colorpicker_backgroundcolor_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_encoding_mode(mode: EncodingMode): Promise<void> {
		command(Commands.change_settings_encodingmode, mode)
		close_submenu(submenu_encodingmodesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_error_correction_level(level: ErrorCorrectionLevel): Promise<void> {
		command(Commands.change_settings_errorcorrectionlevel, level)
		close_submenu(submenu_errorcorrectionlevelsettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && valid_enum_value(theme, all_ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && valid_enum_value(corner, all_CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		const input_settings_margin_id = createUniqueId()
		const input_settings_version_id = createUniqueId()
		const input_settings_autoversion_id = createUniqueId()
		const button_info_share_id = createUniqueId()
		const button_settings_color_id = createUniqueId()
		const button_settings_backgroundcolor_id = createUniqueId()
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
				on_toggle_open={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_info_share_id}
					icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					open_in_new_tab
					icon_code={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				on_toggle_open={(v) => set_is_menu_settings_open(v)}
				onClick={ev => {
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
						case button_settings_color_id: {
							open_colorpicker(ev, colorpicker_color_ref, {
								anchor: button,
								position: ColorPickerPosition.left_center_to_bottom,
								padding: 12,
								gap: -4
							})
							break
						}
						case button_settings_backgroundcolor_id: {
							open_colorpicker(ev, colorpicker_backgroundcolor_ref, {
								anchor: button,
								position: ColorPickerPosition.left_center_to_bottom,
								padding: 12,
								gap: -4
							})
							break
						}
						default: {
							const data_theme = element_dataset(button, 'theme')
							if (data_theme
								&& valid_enum_value(data_theme, all_ThemeData)
							) return change_theme(data_theme as ThemeData)

							const data_corner = element_dataset(button, 'corner')
							if (data_corner
								&& valid_enum_value(data_corner, all_CornerData)
							) return change_corner(data_corner as CornerData)

							const data_ecl = element_dataset(button, 'ecl')
							if (data_ecl
								&& valid_enum_value(data_ecl, all_ErrorCorrectionLevel)
							) return change_error_correction_level(data_ecl as ErrorCorrectionLevel)

							const data_encoding = element_dataset(button, 'encoding')
							if (data_encoding
								&& valid_enum_value(data_encoding, all_EncodingMode)
							) return change_encoding_mode(data_encoding as EncodingMode)
						}
					}
				}}
				onFocusOut={ev => {
					const target = event_target(ev) as HTMLInputElement
					switch (element_id(target)) {
						case input_settings_margin_id: {
							command(
								Commands.change_settings_margin,
								number_safe(target.valueAsNumber, settings().margin)
							)
							break
						}
						case input_settings_version_id: {
							command(
								Commands.change_settings_version,
								number_safe(target.valueAsNumber, settings().version ?? 1)
							)
							break
						}
					}
				}}
				onChange={ev => {
					const target = event_target(ev) as HTMLInputElement
					switch (element_id(target)) {
						case input_settings_autoversion_id: {
							command(
								Commands.change_settings_version,
								target.checked? null : 1
							)
							break
						}
					}
				}}>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					on_toggle_open={v => set_is_submenu_themesettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_themesettings_open()}
						icon_code={0xE28A}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						selected={theme() == ThemeData.light}
						icon_code={0xF2CD}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData.dark}
						icon_code={0xF2B3}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData.system}
						icon_code={0xE96D}
						data-theme={ThemeData.system}>
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
						selected={corner() == CornerData.sharp}
						icon_code={0xEA99}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.semi_round}
						icon_code={0xEEF7}
						data-corner={CornerData.semi_round}>
						Semi round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.round}
						icon_code={0xF044}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.full_round}
						icon_code={0xE408}
						data-corner={CornerData.full_round}>
						Full round
					</MenuItem>
				</SubMenu>
				<Show when={props.page == Pages.generate}>
					<MenuDivider/>
					<MenuHeader>QR Code generator</MenuHeader>
					<SubMenu
						ref={r => submenu_errorcorrectionlevelsettings_ref = r}
						on_toggle_open={isOpen => set_is_submenu_errorcorrectionlevelsettings_open(isOpen)}
						item={<SubMenuItem
							focused={is_submenu_errorcorrectionlevelsettings_open()}
							icon_code={0xE773}>
							Error correction level
						</SubMenuItem>}>
						<MenuItem
							trailing="~7%"
							data-ecl={ErrorCorrectionLevel.low}
							selected={settings().error_correction_level == ErrorCorrectionLevel.low}>
							Low
						</MenuItem>
						<MenuItem
							trailing="~15%"
							data-ecl={ErrorCorrectionLevel.medium}
							selected={settings().error_correction_level == ErrorCorrectionLevel.medium}>
							Medium
						</MenuItem>
						<MenuItem
							trailing="~25%"
							data-ecl={ErrorCorrectionLevel.quartile}
							selected={settings().error_correction_level == ErrorCorrectionLevel.quartile}>
							Quartile
						</MenuItem>
						<MenuItem
							trailing="~30%"
							data-ecl={ErrorCorrectionLevel.high}
							selected={settings().error_correction_level == ErrorCorrectionLevel.high}>
							High
						</MenuItem>
					</SubMenu>
					<SubMenu
						ref={r => submenu_encodingmodesettings_ref = r}
						on_toggle_open={isOpen => set_is_submenu_encodingmodesettings_open(isOpen)}
						item={<SubMenuItem
							focused={is_submenu_encodingmodesettings_ref_open()}
							icon_code={0xF1EF}>
							Encoding mode
						</SubMenuItem>}>
						<MenuItem
							data-encoding={EncodingMode.auto}
							selected={settings().encoding_mode == EncodingMode.auto}>
							Auto
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.alphanumeric}
							selected={settings().encoding_mode == EncodingMode.alphanumeric}>
							Alphanumeric
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.byte}
							selected={settings().encoding_mode == EncodingMode.byte}>
							Byte
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.kanji}
							selected={settings().encoding_mode == EncodingMode.kanji}>
							Kanji
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.numeric}
							selected={settings().encoding_mode == EncodingMode.numeric}>
							Numeric
						</MenuItem>
					</SubMenu>
					<MenuItem
						id={button_settings_color_id}
						leading={<Icon
							filled
							style={{
								color: settings().color,
								"border-radius": '999px',
								border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
							}}
							code={0xE408}
						/>}
						focused={is_colorpicker_color_open()}>
						Color
					</MenuItem>
					<MenuItem
						id={button_settings_backgroundcolor_id}
						leading={<Icon
							filled
							style={{
								color: settings().background_color,
								"border-radius": '999px',
								border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
							}}
							code={0xE408}
						/>}
						focused={is_colorpicker_backgroundcolor_open()}>
						Background color
					</MenuItem>
					<div style={{padding: '4px 12px'}}>
						<NumberTextField
							label="Margin"
							min={0}
							value={settings().margin}
							integer_only
							id={input_settings_margin_id}
						/>
					</div>
					<MenuDivider/>
					<MenuHeader>QR Code version</MenuHeader>
					<SwitchMenuItem
						icon_code={0xEB49}
						checked={settings().version == null}
						attr_switch={{
							id: input_settings_autoversion_id,
						}}>
						Auto version
					</SwitchMenuItem>
					<div style={{padding: '4px 12px 8px 12px'}}>
						<NumberTextField
							disabled={settings().version == null}
							label="Version"
							min={1}
							max={40}
							id={input_settings_version_id}
							integer_only
							value={settings().version ?? 1}
						/>
					</div>
				</Show>
			</Menu>
			<Menu
				ref={r => menu_moreactions_ref = r}
				on_toggle_open={v => set_is_menu_moreactions_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_download = element_dataset(button, 'download')
					if (data_download) {
						const type = number_parse(data_download, true)
						if (
							number_is_not_defined(type)
							|| !valid_enum_value(type, all_DownloadFileType)
						) return

						command(Commands.download_qrcode, type as DownloadFileType)
						close_submenu(submenu_downloadmoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
						return
					}

					const data_copy = element_dataset(button, 'copy')
					if (data_copy) {
						const type = number_parse(data_copy, true)
						if (
							number_is_not_defined(type)
							|| !valid_enum_value(type, all_CopyFileType)
						) return

						command(Commands.copy_qrcode, ev, type as CopyFileType)
						close_submenu(submenu_copymoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
						return
					}
				}}>
				<SubMenu
					style={{width: '172px'}}
					ref={r => submenu_downloadmoreactions_ref = r}
					on_toggle_open={isOpen => set_is_submenu_downloadmoreactions_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_downloadmoreactions_open()}
						icon_code={0xE0B9}>
						Download as
					</SubMenuItem>}>
					<MenuItem
						icon_code={0xE8FE}
						data-download={DownloadFileType.png}
						trailing="PNG">
						Image
					</MenuItem>
					<MenuItem
						icon_code={0xE8FE}
						data-download={DownloadFileType.jpeg}
						trailing="JPEG">
						Image
					</MenuItem>
					<MenuItem
						icon_code={0xE90C}
						data-download={DownloadFileType.svg}
						trailing="SVG">
						Vector
					</MenuItem>
				</SubMenu>
				<SubMenu
					style={{width: '172px'}}
					ref={r => submenu_copymoreactions_ref = r}
					on_toggle_open={isOpen => set_is_submenu_copymoreactions_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_copymoreactions_open()}
						icon_code={0xE51B}>
						Copy as
					</SubMenuItem>}>
					<MenuItem
						icon_code={0xE8FE}
						data-copy={CopyFileType.png}
						trailing="PNG">
						Image
					</MenuItem>
					<MenuItem
						icon_code={0xE90C}
						data-copy={CopyFileType.svg}
						trailing="SVG">
						Vector
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			ref={r => colorpicker_color_ref = r}
			color={settings().color}
			on_toggle_open={isOpen => set_is_colorpicker_color_open(isOpen)}
			on_select_color={color => command(Commands.change_settings_color, color)}
		/>
		<ColorPicker
			ref={r => colorpicker_backgroundcolor_ref = r}
			color={settings().background_color}
			on_toggle_open={isOpen => set_is_colorpicker_backgroundcolor_open(isOpen)}
			on_select_color={color => command(Commands.change_settings_backgroundcolor, color)}
		/>
	</>)

	return (<>
		<AppBar
			leading={<img alt="QR Code logo" width={32} src={app.logo_url} />}
			headline="QR Code"
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
					case button_appbar_info_id: {
						open_menu(ev, menu_info_ref, {anchor: button})
						break
					}
					case button_appbar_settings_id: {
						open_menu(ev, menu_settings_ref, {anchor: button})
						break
					}
					case button_appbar_moreactions_id: {
						open_menu(ev, menu_moreactions_ref, {anchor: button})
						break
					}
				}
			}}
			trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					focused={is_menu_info_open()}
					code={0xE930}
					id={button_appbar_info_id}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					focused={is_menu_settings_open()}
					code={0xEE0F}
					id={button_appbar_settings_id}
				/>
				<Show when={!props.is_generate_error && props.page == Pages.generate}>
					<IconButton
						data-tooltip="More actions"
						focused={is_menu_moreactions_open()}
						code={0xEAD9}
						id={button_appbar_moreactions_id}
					/>
				</Show>
			</Tooltip>}
		/>
		<Menus />
		<ColorPickers/>
	</>)
}

export default _