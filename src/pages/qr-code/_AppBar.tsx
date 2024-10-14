import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { _system, _round, _theme, _corner, _command, _light, _dark, _includes, _sharp, _semiRound, _fullRound, _home, _src, _apps, _about, _privacy, _terms, _share, _URL, _contactEmail, _donate, _getFullYear, _page, _generate, _low, _settings, _errorCorrectionLevel, _medium, _quartile, _high, _auto, _encodingMode, _alphanumeric, _byte, _kanji, _numeric, _color, _currentTarget, _leftCenterToBottom, _backgroundColor, _margin, _version, _png, _jpeg, _svg, _isGenerateError, _checked, _valueAsNumber } from "@/constants/string"
import { getDocument, getNavigator, getRoot } from "@/constants/window"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "@/utils/attributes"
import { setTimeDelayed, timeout } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { encodeURL } from "@/utils/url"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { safeNumber } from "@/utils/math"
import logo from '@/assets/apps/qr-code-logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import ColorPicker, { ColorPickerPosition, openColorPicker } from "@/components/ColorPicker"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
	isGenerateError: boolean
	page: Pages
}> = (props) => {
	const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
	const [is_menu_moreActions_open, setIs_menu_moreActions_open] = createSignal<boolean>(false)
	const [is_submenu_themeSettings_open, setIs_submenu_themeSettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornerSettings_open, setIs_submenu_cornerSettings_open] = createSignal<boolean>(false)
	const [is_submenu_errorCorrectionLevelSettings_ref_open, setIs_submenu_errorCorrectionLevelSettings_ref_open] = createSignal<boolean>(false)
	const [is_submenu_encodingModeSettings_ref_open, setIs_submenu_encodingModeSettings_ref_open] = createSignal<boolean>(false)
	const [is_colorPicker_color_open, setIs_colorPicker_color_open] = createSignal<boolean>(false)
	const [is_colorPicker_backgroundColor_open, setIs_colorPicker_backgroundColor_open] = createSignal<boolean>(false)
	const [is_submenu_downloadMoreActions_open, setIs_submenu_downloadMoreActions_open] = createSignal<boolean>(false)
	const [is_submenu_copyMoreActions_open, setIs_submenu_copyMoreActions_open] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
	const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreActions_ref: HTMLDialogElement
	let submenu_downloadMoreActions_ref: HTMLDivElement
	let submenu_copyMoreActions_ref: HTMLDivElement
	let submenu_themeSettings_ref: HTMLDivElement
	let submenu_cornerSettings_ref: HTMLDivElement
	let submenu_errorCorrectionLevelSettings_ref: HTMLDivElement
	let submenu_encodingModeSettings_ref: HTMLDivElement
	let colorPicker_color_ref: HTMLDialogElement
	let colorPicker_backgroundColor_ref: HTMLDialogElement

	async function changeTheme(theme: ThemeData): Promise<void> {
		setTheme(theme)
		setAttribute(getRoot(), RootAttributes[_theme], theme)
		setLocalStorageItem(LocalStorageKeys[_theme], theme)
		closeSubMenu(submenu_themeSettings_ref)
		await timeout(300)
		closeMenu(menu_settings_ref)
	}

	async function changeCorner(corner: CornerData): Promise<void> {
		setCorner(corner)
		setAttribute(getRoot(), RootAttributes[_corner], corner)
		setLocalStorageItem(LocalStorageKeys[_corner], corner)
		closeSubMenu(submenu_cornerSettings_ref)
		await timeout(300)
		closeMenu(menu_settings_ref)
	}

	async function changeEncodingMode(mode: EncodingMode): Promise<void> {
		props[_command](Commands.change_settings_encodingMode, mode)
		closeSubMenu(submenu_encodingModeSettings_ref)
		await timeout(300)
		closeMenu(menu_settings_ref)
	}

	async function changeErrorCorrectionLevel(level: ErrorCorrectionLevel): Promise<void> {
		props[_command](Commands.change_settings_errorCorrectionLevel, level)
		closeSubMenu(submenu_errorCorrectionLevelSettings_ref)
		await timeout(300)
		closeMenu(menu_settings_ref)
	}

	function initTheme(): void {
		const theme = getLocalStorageItem(LocalStorageKeys[_theme])

		if (theme && [ThemeData[_system], ThemeData[_light], ThemeData[_dark]][_includes](theme as ThemeData)) {
			setAttribute(getRoot(), RootAttributes[_theme], theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = getLocalStorageItem(LocalStorageKeys[_corner])

		if (corner && [CornerData[_sharp], CornerData[_semiRound], CornerData[_round], CornerData[_fullRound]][_includes](corner as CornerData)) {
			setAttribute(getRoot(), RootAttributes[_corner], corner)
			setCorner(corner as CornerData)
		}
	}

	onMount(() => {
		initTheme()
		initCorner()
	})

	const Menus: VoidComponent = () => (<>
		<Menu
			style={{width: '200px'}}
			ref={r => menu_info_ref = r}
			onToggleOpen={(v) => setIs_menu_info_open(v)}>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={RoutesLinks[_home]}
				leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
				Redmerah
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={RoutesLinks[_apps]}
				iconCode={0xE063}>
				More apps
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={RoutesLinks[_about]}
				iconCode={0xE930}>
				About us
			</LinkMenuItem>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={RoutesLinks[_privacy]}
				iconCode={0xEE51}>
				Privacy policy
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={RoutesLinks[_terms]}
				iconCode={0xED47}>
				Terms & conditions
			</LinkMenuItem>
			<MenuDivider />
			<MenuItem
				onClick={() => {
					getNavigator()[_share]({ title: 'QR Code', text: 'QR Code', url: getDocument()[_URL] })
					closeMenu(menu_info_ref)
				}}
				iconCode={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('QR Code')}
				iconCode={0xE3A0}>
				Send feedback
			</LinkMenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={ExternalLinks[_donate]}
				openInNewTab
				iconCode={0xE84B}>
				Donate
			</LinkMenuItem>
			<MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
		</Menu>
		<Menu
			ref={r => menu_settings_ref = r}
			onToggleOpen={(v) => setIs_menu_settings_open(v)}>
			<SubMenu
				level={1}
				ref={r => submenu_themeSettings_ref = r}
				onToggleOpen={v => setIs_submenu_themeSettings_open(v)}
				item={<SubMenuItem
					focused={is_submenu_themeSettings_open()}
					iconCode={0xE28A}>
					Theme
				</SubMenuItem>}>
				<MenuItem
					selected={theme() == ThemeData[_light]}
					iconCode={0xF2CD}
					onClick={() => changeTheme(ThemeData[_light])}>
					Light
				</MenuItem>
				<MenuItem
					selected={theme() == ThemeData[_dark]}
					iconCode={0xF2B3}
					onClick={() => changeTheme(ThemeData[_dark])}>
					Dark
				</MenuItem>
				<MenuItem
					selected={theme() == ThemeData[_system]}
					iconCode={0xE96D}
					onClick={() => changeTheme(ThemeData[_system])}>
					System theme
				</MenuItem>
			</SubMenu>
			<SubMenu
				level={1}
				ref={r => submenu_cornerSettings_ref = r}
				onToggleOpen={v => setIs_submenu_cornerSettings_open(v)}
				item={<SubMenuItem
					focused={is_submenu_cornerSettings_open()}
					iconCode={0xF044}>
					Corner style
				</SubMenuItem>}>
				<MenuItem
					selected={corner() == CornerData[_sharp]}
					iconCode={0xEA99}
					onClick={() => changeCorner(CornerData[_sharp])}>
					Sharp
				</MenuItem>
				<MenuItem
					selected={corner() == CornerData[_semiRound]}
					iconCode={0xEEF7}
					onClick={() => changeCorner(CornerData[_semiRound])}>
					Semi round
				</MenuItem>
				<MenuItem
					selected={corner() == CornerData[_round]}
					iconCode={0xF044}
					onClick={() => changeCorner(CornerData[_round])}>
					Round
				</MenuItem>
				<MenuItem
					selected={corner() == CornerData[_fullRound]}
					iconCode={0xE408}
					onClick={() => changeCorner(CornerData[_fullRound])}>
					Full round
				</MenuItem>
			</SubMenu>
			<Show when={props[_page] == Pages[_generate]}>
				<MenuDivider/>
				<MenuHeader>QR Code generator</MenuHeader>
				<SubMenu
					ref={r => submenu_errorCorrectionLevelSettings_ref = r}
					onToggleOpen={isOpen => setIs_submenu_errorCorrectionLevelSettings_ref_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_errorCorrectionLevelSettings_ref_open()}
						iconCode={0xE773}>
						Error correction level
					</SubMenuItem>}>
					<MenuItem
						trailing="~7%"
						onClick={() => changeErrorCorrectionLevel(ErrorCorrectionLevel[_low])}
						selected={props[_settings][_errorCorrectionLevel] == ErrorCorrectionLevel[_low]}>
						Low
					</MenuItem>
					<MenuItem
						trailing="~15%"
						onClick={() => changeErrorCorrectionLevel(ErrorCorrectionLevel[_medium])}
						selected={props[_settings][_errorCorrectionLevel] == ErrorCorrectionLevel[_medium]}>
						Medium
					</MenuItem>
					<MenuItem
						trailing="~25%"
						onClick={() => changeErrorCorrectionLevel(ErrorCorrectionLevel[_quartile])}
						selected={props[_settings][_errorCorrectionLevel] == ErrorCorrectionLevel[_quartile]}>
						Quartile
					</MenuItem>
					<MenuItem
						trailing="~30%"
						onClick={() => changeErrorCorrectionLevel(ErrorCorrectionLevel[_high])}
						selected={props[_settings][_errorCorrectionLevel] == ErrorCorrectionLevel[_high]}>
						High
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_encodingModeSettings_ref = r}
					onToggleOpen={isOpen => setIs_submenu_encodingModeSettings_ref_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_encodingModeSettings_ref_open()}
						iconCode={0xF1EF}>
						Encoding mode
					</SubMenuItem>}>
					<MenuItem
						onClick={() => changeEncodingMode(EncodingMode[_auto])}
						selected={props[_settings][_encodingMode] == EncodingMode[_auto]}>
						Auto
					</MenuItem>
					<MenuItem
						onClick={() => changeEncodingMode(EncodingMode[_alphanumeric])}
						selected={props[_settings][_encodingMode] == EncodingMode[_alphanumeric]}>
						Alphanumeric
					</MenuItem>
					<MenuItem
						onClick={() => changeEncodingMode(EncodingMode[_byte])}
						selected={props[_settings][_encodingMode] == EncodingMode[_byte]}>
						Byte
					</MenuItem>
					<MenuItem
						onClick={() => changeEncodingMode(EncodingMode[_kanji])}
						selected={props[_settings][_encodingMode] == EncodingMode[_kanji]}>
						Kanji
					</MenuItem>
					<MenuItem
						onClick={() => changeEncodingMode(EncodingMode[_numeric])}
						selected={props[_settings][_encodingMode] == EncodingMode[_numeric]}>
						Numeric
					</MenuItem>
				</SubMenu>
				<MenuItem
					leading={<Icon
						filled
						style={{
							color: props[_settings][_color],
							"border-radius": '999px',
							border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
						}}
						code={0xE408}
					/>}
					focused={is_colorPicker_color_open()}
					onClick={ev => openColorPicker(ev, colorPicker_color_ref, {
						anchor: ev[_currentTarget],
						position: ColorPickerPosition[_leftCenterToBottom],
						padding: 12,
						gap: -4
					})}>
					Color
				</MenuItem>
				<MenuItem
					leading={<Icon
						filled
						style={{
							color: props[_settings][_backgroundColor],
							"border-radius": '999px',
							border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
						}}
						code={0xE408}
					/>}
					focused={is_colorPicker_backgroundColor_open()}
					onClick={ev => openColorPicker(ev, colorPicker_backgroundColor_ref, {
						anchor: ev[_currentTarget],
						position: ColorPickerPosition[_leftCenterToBottom],
						padding: 12,
						gap: -4
					})}>
					Background color
				</MenuItem>
				<div style={{padding: '4px 12px'}}>
					<NumberTextField
						labelText="Margin"
						min={0}
						value={props[_settings][_margin]}
						integerOnly
						onBlur={ev => props[_command](
							Commands.change_settings_margin,
							safeNumber(ev[_currentTarget][_valueAsNumber], props[_settings][_margin])
						)}
					/>
				</div>
				<MenuDivider/>
				<MenuHeader>QR Code version</MenuHeader>
				<SwitchMenuItem
					iconCode={0xEB49}
					checked={props[_settings][_version] == null}
					switchAttr={{
						onChange: ev => props[_command](Commands.change_settings_version, ev[_currentTarget][_checked]? null : 1)
					}}>
					Auto version
				</SwitchMenuItem>
				<div style={{padding: '4px 12px 8px 12px'}}>
					<NumberTextField
						disabled={props[_settings][_version] == null}
						labelText="Version"
						min={1}
						max={40}
						integerOnly
						value={props[_settings][_version] ?? 1}
						onBlur={ev => props[_command](
							Commands.change_settings_version,
							safeNumber(ev[_currentTarget][_valueAsNumber], props[_settings][_version] ?? 1)
						)}
					/>
				</div>
			</Show>
		</Menu>
		<Menu ref={r => menu_moreActions_ref = r} onToggleOpen={isOpen => setIs_menu_moreActions_open(isOpen)}>
			<SubMenu
				style={{width: '172px'}}
				ref={r => submenu_downloadMoreActions_ref = r}
				onToggleOpen={isOpen => setIs_submenu_downloadMoreActions_open(isOpen)}
				item={<SubMenuItem
					focused={is_submenu_downloadMoreActions_open()}
					iconCode={0xE0B9}>
					Download as
				</SubMenuItem>}>
				<MenuItem
					iconCode={0xE8FE}
					onClick={() => {
						props[_command](Commands.download_QRCode, DownloadFileType[_png])
						closeSubMenu(submenu_downloadMoreActions_ref)
						setTimeDelayed(() => closeMenu(menu_moreActions_ref), 300)
					}}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					iconCode={0xE8FE}
					onClick={() => {
						props[_command](Commands.download_QRCode, DownloadFileType[_jpeg])
						closeSubMenu(submenu_downloadMoreActions_ref)
						setTimeDelayed(() => closeMenu(menu_moreActions_ref), 300)
					}}
					trailing="JPEG">
					Image
				</MenuItem>
				<MenuItem
					iconCode={0xE90C}
					onClick={() => {
						props[_command](Commands.download_QRCode, DownloadFileType[_svg])
						closeSubMenu(submenu_downloadMoreActions_ref)
						setTimeDelayed(() => closeMenu(menu_moreActions_ref), 300)
					}}
					trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
			<SubMenu
				style={{width: '172px'}}
				ref={r => submenu_copyMoreActions_ref = r}
				onToggleOpen={isOpen => setIs_submenu_copyMoreActions_open(isOpen)}
				item={<SubMenuItem
					focused={is_submenu_copyMoreActions_open()}
					iconCode={0xE51B}>
					Copy as
				</SubMenuItem>}>
				<MenuItem
					iconCode={0xE8FE}
					onClick={(ev) => {
						props[_command](Commands.copy_QRCode, ev, CopyFileType[_png])
						closeSubMenu(submenu_copyMoreActions_ref)
						setTimeDelayed(() => closeMenu(menu_moreActions_ref), 300)
					}}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					iconCode={0xE90C}
					onClick={(ev) => {
						props[_command](Commands.copy_QRCode, ev, CopyFileType[_svg])
						closeSubMenu(submenu_copyMoreActions_ref)
						setTimeDelayed(() => closeMenu(menu_moreActions_ref), 300)
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
			color={props[_settings][_color]}
			onToggleOpen={isOpen => setIs_colorPicker_color_open(isOpen)}
			onSelectColor={color => props[_command](Commands.change_settings_color, color)}
		/>
		<ColorPicker
			ref={r => colorPicker_backgroundColor_ref = r}
			color={props[_settings][_backgroundColor]}
			onToggleOpen={isOpen => setIs_colorPicker_backgroundColor_open(isOpen)}
			onSelectColor={color => props[_command](Commands.change_settings_backgroundColor, color)}
		/>
	</>)

	return (<>
		<AppBar
			leading={<img alt="QR Code logo" width={32} src={logo[_src]} />}
			headline="QR Code"
			trailing={<>
				<Tooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						code={0xE930}
						onClick={(ev) => openMenu(ev, menu_info_ref, {anchor: ev[_currentTarget]})}
					/>
				</Tooltip>
				<Tooltip text="Settings">
					<IconButton
						class={CSSAnimation.btn_rotate_icon}
						focused={is_menu_settings_open()}
						code={0xEE0F}
						onClick={(ev) => openMenu(ev, menu_settings_ref, {anchor: ev[_currentTarget]})}
					/>
				</Tooltip>
				<Show when={!props[_isGenerateError] && props[_page] == Pages[_generate]}>
					<Tooltip text="More actions">
						<IconButton
							focused={is_menu_moreActions_open()}
							code={0xEAD9}
							onClick={(ev) => openMenu(ev, menu_moreActions_ref, {anchor: ev[_currentTarget]})}
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