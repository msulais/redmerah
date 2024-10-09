import { createSignal, onMount, type VoidComponent } from "solid-js"

import type { Gradient, Settings } from "./_type"
import { _system, _round, _theme, _then, _corner, _command, _light, _dark, _includes, _sharp, _semiRound, _fullRound, _gradients, _map, _settings, _colorModel, _join, _clipboard, _writeText, _home, _src, _apps, _about, _privacy, _terms, _share, _URL, _contactEmail, _donate, _getFullYear, _rgba, _hsla, _hex, _currentTarget, _centerBottomToLeft } from "@/constants/string"
import { getDocument, getNavigator, getRoot } from "@/constants/window"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "@/utils/attributes"
import { FlyoutPosition } from "@/enums/position"
import { timeout } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { encodeURL } from "@/utils/url"
import { ColorModel, Commands } from "./_enums"
import { gradientToCSSText } from "./_utils"
import logo from '@/assets/apps/color-gradient/logo.svg'
import redmerahLogo from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, SubMenuItem, MenuItemTrailingShortcut } from "@/components/Menu"
import Toast, { openToast } from "@/components/Toast"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	gradients: Gradient[]
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
	const [is_menu_moreActions_open, setIs_menu_moreActions_open] = createSignal<boolean>(false)
	const [is_submenu_themeSettings_open, setIs_submenu_themeSettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornerSettings_open, setIs_submenu_cornerSettings_open] = createSignal<boolean>(false)
	const [is_submenu_colorModelSettings_open, setIs_submenu_colorModelSettings_open] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
	const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreActions_ref: HTMLDialogElement
	let submenu_themeSettings_ref: HTMLDivElement
	let submenu_cornerSettings_ref: HTMLDivElement
	let submenu_colorModelSettings_ref: HTMLDivElement
	let toast_copied_ref: HTMLDivElement

	async function changeTheme(theme: ThemeData): Promise<void> {
		setTheme(theme)
		setAttribute(getRoot(), RootAttributes[_theme], theme)
		setLocalStorageItem(LocalStorageKeys[_theme], theme)
		closeSubMenu(submenu_themeSettings_ref)
		timeout(300)[_then](() => closeMenu(menu_settings_ref))
	}

	async function changeCorner(corner: CornerData): Promise<void> {
		setCorner(corner)
		setAttribute(getRoot(), RootAttributes[_corner], corner)
		setLocalStorageItem(LocalStorageKeys[_corner], corner)
		closeSubMenu(submenu_cornerSettings_ref)
		timeout(300)[_then](() => closeMenu(menu_settings_ref))
	}

	async function changeColorModel(model: ColorModel): Promise<void> {
		props[_command](Commands.change_settings_colorModel, model)
		closeSubMenu(submenu_colorModelSettings_ref)
		timeout(300)[_then](() => closeMenu(menu_settings_ref))
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

	function copyGradient(ev: Event): void {
		const text = props
		[_gradients]
		[_map](gradient => gradientToCSSText(gradient, props[_settings][_colorModel], true))
		[_join]('\n')

		getNavigator()
		[_clipboard]
		[_writeText](text)
		[_then](() => openToast(ev, toast_copied_ref))
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
					getNavigator()[_share]({ title: 'Color Gradient', text: 'Color Gradient', url: getDocument()[_URL] })
					closeMenu(menu_info_ref)
				}}
				iconCode={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => closeMenu(menu_info_ref)}
				href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('Color Gradient')}
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
			<SubMenu
				ref={r => submenu_colorModelSettings_ref = r}
				onToggleOpen={v => setIs_submenu_colorModelSettings_open(v)}
				style={{"min-width": '180px'}}
				item={<SubMenuItem
					focused={is_submenu_colorModelSettings_open()}
					iconCode={0xE4B6}>
					Color model
				</SubMenuItem>}>
				<MenuItem
					onClick={() => changeColorModel(ColorModel[_rgba])}
					selected={props[_settings][_colorModel] == ColorModel[_rgba]}
					trailing={<MenuItemTrailingShortcut shortcuts={['rgba(R,G,B,A)']}/>}>
					RGBA
				</MenuItem>
				<MenuItem
					onClick={() => changeColorModel(ColorModel[_hsla])}
					selected={props[_settings][_colorModel] == ColorModel[_hsla]}
					trailing={<MenuItemTrailingShortcut shortcuts={['hsla(H°,S%,L%,A)']}/>}>
					HSLA
				</MenuItem>
				<MenuItem
					onClick={() => changeColorModel(ColorModel[_hex])}
					selected={props[_settings][_colorModel] == ColorModel[_hex]}
					trailing={<MenuItemTrailingShortcut shortcuts={['#RRGGBBAA']}/>}>
					HEX
				</MenuItem>
			</SubMenu>
		</Menu>
		<Menu
			onToggleOpen={isOpen => setIs_menu_moreActions_open(isOpen)}
			style={{"min-width": "164px"}}
			ref={r => menu_moreActions_ref = r}>
			<MenuItem
				iconCode={0xEDA1}
				onClick={() => {
					closeMenu(menu_moreActions_ref)
					props[_command](Commands.save_gradient)
				}}>
				Save gradient
			</MenuItem>
			<MenuItem
				iconCode={0xE51B}
				onClick={(event) => {
					closeMenu(menu_moreActions_ref)
					copyGradient(event)
				}}>
				Copy gradient
			</MenuItem>
		</Menu>
	</>)

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<>
		<AppBar
			leading={<img alt="Color Gradient logo" width={32} src={logo[_src]} />}
			headline="Color Gradient"
			trailing={<>
				<Tooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						code={0xE930}
						onClick={(ev) => openMenu(ev, menu_info_ref, {
							anchor: ev[_currentTarget],
							padding: 4,
							position: FlyoutPosition[_centerBottomToLeft]
						})}
					/>
				</Tooltip>
				<Tooltip text="Settings">
					<IconButton
						class={CSSAnimation.btn_rotate_icon}
						focused={is_menu_settings_open()}
						code={0xEE0F}
						onClick={(ev) => openMenu(ev, menu_settings_ref, {
							anchor: ev[_currentTarget],
							padding: 4,
							position: FlyoutPosition[_centerBottomToLeft]
						})}
					/>
				</Tooltip>
				<Tooltip text="More actions">
					<IconButton
						focused={is_menu_moreActions_open()}
						code={0xEAD9}
						onClick={(ev) => openMenu(ev, menu_moreActions_ref, {
							anchor: ev[_currentTarget],
							padding: 4,
							position: FlyoutPosition[_centerBottomToLeft]
						})}
					/>
				</Tooltip>
			</>}
		/>
		<Menus />
		<Toasts />
	</>)
}

export default _