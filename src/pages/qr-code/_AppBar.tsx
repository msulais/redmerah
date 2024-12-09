import { createMemo, createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set } from "@/utils/attributes"
import { timeout_set, wait } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode } from "@/utils/url"
import { array_includes } from "@/utils/array"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { number_safe } from "@/utils/number"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import logo from '@/assets/apps/qr-code-logo.svg'
import redmerah_logo from '@/assets/logo.svg'

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
	const root = document.documentElement
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round

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
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_downloadmoreactions_ref: HTMLDivElement
	let submenu_copymoreactions_ref: HTMLDivElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_errorcorrectionlevelsettings_ref: HTMLDivElement
	let submenu_encodingmodesettings_ref: HTMLDivElement
	let colorPicker_color_ref: HTMLDialogElement
	let colorPicker_backgroundcolor_ref: HTMLDialogElement

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
			style={{width: '200px'}}
			ref={r => menu_info_ref = r}
			on_toggle_open={(v) => set_is_menu_info_open(v)}>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.home}
				leading={<img src={redmerah_logo.src} width={16} alt='Redmerah logo'/>}>
				Redmerah
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.apps}
				icon_code={0xE063}>
				More apps
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.about}
				icon_code={0xE930}>
				About us
			</LinkMenuItem>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.privacy}
				icon_code={0xEE51}>
				Privacy policy
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.terms}
				icon_code={0xED47}>
				Terms & conditions
			</LinkMenuItem>
			<MenuDivider />
			<MenuItem
				onClick={() => {
					navigator_share({ title: 'QR Code', text: 'QR Code', url: document.URL })
					close_menu(menu_info_ref)
				}}
				icon_code={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('QR Code')}
				icon_code={0xE3A0}>
				Send feedback
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={ExternalLinks.donate}
				open_in_new_tab
				icon_code={0xE84B}>
				Donate
			</LinkMenuItem>
			<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
		</Menu>
		<Menu
			ref={r => menu_settings_ref = r}
			on_toggle_open={(v) => set_is_menu_settings_open(v)}>
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
						onClick={() => change_error_correction_level(ErrorCorrectionLevel.low)}
						selected={settings().error_correction_level == ErrorCorrectionLevel.low}>
						Low
					</MenuItem>
					<MenuItem
						trailing="~15%"
						onClick={() => change_error_correction_level(ErrorCorrectionLevel.medium)}
						selected={settings().error_correction_level == ErrorCorrectionLevel.medium}>
						Medium
					</MenuItem>
					<MenuItem
						trailing="~25%"
						onClick={() => change_error_correction_level(ErrorCorrectionLevel.quartile)}
						selected={settings().error_correction_level == ErrorCorrectionLevel.quartile}>
						Quartile
					</MenuItem>
					<MenuItem
						trailing="~30%"
						onClick={() => change_error_correction_level(ErrorCorrectionLevel.high)}
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
						onClick={() => change_encoding_mode(EncodingMode.auto)}
						selected={settings().encoding_mode == EncodingMode.auto}>
						Auto
					</MenuItem>
					<MenuItem
						onClick={() => change_encoding_mode(EncodingMode.alphanumeric)}
						selected={settings().encoding_mode == EncodingMode.alphanumeric}>
						Alphanumeric
					</MenuItem>
					<MenuItem
						onClick={() => change_encoding_mode(EncodingMode.byte)}
						selected={settings().encoding_mode == EncodingMode.byte}>
						Byte
					</MenuItem>
					<MenuItem
						onClick={() => change_encoding_mode(EncodingMode.kanji)}
						selected={settings().encoding_mode == EncodingMode.kanji}>
						Kanji
					</MenuItem>
					<MenuItem
						onClick={() => change_encoding_mode(EncodingMode.numeric)}
						selected={settings().encoding_mode == EncodingMode.numeric}>
						Numeric
					</MenuItem>
				</SubMenu>
				<MenuItem
					leading={<Icon
						filled
						style={{
							color: settings().color,
							"border-radius": '999px',
							border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
						}}
						code={0xE408}
					/>}
					focused={is_colorpicker_color_open()}
					onClick={ev => open_colorpicker(ev, colorPicker_color_ref, {
						anchor: ev.currentTarget,
						position: ColorPickerPosition.left_center_to_bottom,
						padding: 12,
						gap: -4
					})}>
					Color
				</MenuItem>
				<MenuItem
					leading={<Icon
						filled
						style={{
							color: settings().background_color,
							"border-radius": '999px',
							border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
						}}
						code={0xE408}
					/>}
					focused={is_colorpicker_backgroundcolor_open()}
					onClick={ev => open_colorpicker(ev, colorPicker_backgroundcolor_ref, {
						anchor: ev.currentTarget,
						position: ColorPickerPosition.left_center_to_bottom,
						padding: 12,
						gap: -4
					})}>
					Background color
				</MenuItem>
				<div style={{padding: '4px 12px'}}>
					<NumberTextField
						label="Margin"
						min={0}
						value={settings().margin}
						integer_only
						onBlur={ev => command(
							Commands.change_settings_margin,
							number_safe(ev.currentTarget.valueAsNumber, settings().margin)
						)}
					/>
				</div>
				<MenuDivider/>
				<MenuHeader>QR Code version</MenuHeader>
				<SwitchMenuItem
					icon_code={0xEB49}
					checked={settings().version == null}
					attr_switch={{
						onChange: ev => command(Commands.change_settings_version, ev.currentTarget.checked? null : 1)
					}}>
					Auto version
				</SwitchMenuItem>
				<div style={{padding: '4px 12px 8px 12px'}}>
					<NumberTextField
						disabled={settings().version == null}
						label="Version"
						min={1}
						max={40}
						integer_only
						value={settings().version ?? 1}
						onBlur={ev => command(
							Commands.change_settings_version,
							number_safe(ev.currentTarget.valueAsNumber, settings().version ?? 1)
						)}
					/>
				</div>
			</Show>
		</Menu>
		<Menu ref={r => menu_moreactions_ref = r} on_toggle_open={isOpen => set_is_menu_moreactions_open(isOpen)}>
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
					onClick={() => {
						command(Commands.download_qrcode, DownloadFileType.png)
						close_submenu(submenu_downloadmoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
					}}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE8FE}
					onClick={() => {
						command(Commands.download_qrcode, DownloadFileType.jpeg)
						close_submenu(submenu_downloadmoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
					}}
					trailing="JPEG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE90C}
					onClick={() => {
						command(Commands.download_qrcode, DownloadFileType.svg)
						close_submenu(submenu_downloadmoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
					}}
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
					onClick={(ev) => {
						command(Commands.copy_qrcode, ev, CopyFileType.png)
						close_submenu(submenu_copymoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
					}}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE90C}
					onClick={(ev) => {
						command(Commands.copy_qrcode, ev, CopyFileType.svg)
						close_submenu(submenu_copymoreactions_ref)
						timeout_set(() => close_menu(menu_moreactions_ref), 300)
					}}
					trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
		</Menu>
	</>)

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			ref={r => colorPicker_color_ref = r}
			color={settings().color}
			on_toggle_open={isOpen => set_is_colorpicker_color_open(isOpen)}
			on_select_color={color => command(Commands.change_settings_color, color)}
		/>
		<ColorPicker
			ref={r => colorPicker_backgroundcolor_ref = r}
			color={settings().background_color}
			on_toggle_open={isOpen => set_is_colorpicker_backgroundcolor_open(isOpen)}
			on_select_color={color => command(Commands.change_settings_backgroundcolor, color)}
		/>
	</>)

	return (<>
		<AppBar
			leading={<img alt="QR Code logo" width={32} src={logo.src} />}
			headline="QR Code"
			trailing={<>
				<Tooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						code={0xE930}
						onClick={(ev) => open_menu(ev, menu_info_ref, {anchor: ev.currentTarget})}
					/>
				</Tooltip>
				<Tooltip text="Settings">
					<IconButton
						class={CSSAnimation.btn_rotate_icon}
						focused={is_menu_settings_open()}
						code={0xEE0F}
						onClick={(ev) => open_menu(ev, menu_settings_ref, {anchor: ev.currentTarget})}
					/>
				</Tooltip>
				<Show when={!props.is_generate_error && props.page == Pages.generate}>
					<Tooltip text="More actions">
						<IconButton
							focused={is_menu_moreactions_open()}
							code={0xEAD9}
							onClick={(ev) => open_menu(ev, menu_moreactions_ref, {anchor: ev.currentTarget})}
						/>
					</Tooltip>
				</Show>
			</>}
		/>
		<Menus />
		<ColorPickers/>
	</>)
}

export default _