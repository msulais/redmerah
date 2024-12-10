import { createMemo, createSignal, onMount, type VoidComponent } from "solid-js"

import type { Gradient, Settings } from "./_type"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set } from "@/utils/attributes"
import { wait } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode } from "@/utils/url"
import { ColorModel, Commands } from "./_enums"
import { gradient_to_css_text } from "./_utils"
import { promise_done } from "@/utils/object"
import { array_includes, array_join, array_map } from "@/utils/array"
import { navigator_clipboard_writetext, navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import logo from '@/assets/apps/color-gradient/logo.svg'
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
	const [is_submenu_colormodelsettings_open, set_is_submenu_colormodelsettings_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
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
		promise_done(wait(300), () => close_menu(menu_settings_ref))
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		promise_done(wait(300), () => close_menu(menu_settings_ref))
	}

	function change_color_model(model: ColorModel): void {
		command(Commands.change_settings_colormodel, model)
		close_submenu(submenu_colormodelsettings_ref)
		promise_done(wait(300), () => close_menu(menu_settings_ref))
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

	const Menus: VoidComponent = () => (<>
		<Menu
			style={{width: '200px'}}
			ref={r => menu_info_ref = r}
			on_toggle_open={(v) => set_is_menu_info_open(v)}>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.home}
				leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
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
					navigator_share({ title: 'Color Gradient', text: 'Color Gradient', url: document.URL })
					close_menu(menu_info_ref)
				}}
				icon_code={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Color Gradient')}
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
			<SubMenu
				ref={r => submenu_colormodelsettings_ref = r}
				on_toggle_open={v => set_is_submenu_colormodelsettings_open(v)}
				style={{"min-width": '180px'}}
				item={<SubMenuItem
					focused={is_submenu_colormodelsettings_open()}
					icon_code={0xE4B6}>
					Color model
				</SubMenuItem>}>
				<MenuItem
					onClick={() => change_color_model(ColorModel.rgba)}
					selected={settings().color_model == ColorModel.rgba}
					trailing={<MenuItemTrailingShortcut shortcuts={['rgba(R,G,B,A)']}/>}>
					RGBA
				</MenuItem>
				<MenuItem
					onClick={() => change_color_model(ColorModel.hsla)}
					selected={settings().color_model == ColorModel.hsla}
					trailing={<MenuItemTrailingShortcut shortcuts={['hsla(H°,S%,L%,A)']}/>}>
					HSLA
				</MenuItem>
				<MenuItem
					onClick={() => change_color_model(ColorModel.hex)}
					selected={settings().color_model == ColorModel.hex}
					trailing={<MenuItemTrailingShortcut shortcuts={['#RRGGBBAA']}/>}>
					HEX
				</MenuItem>
			</SubMenu>
		</Menu>
		<Menu
			on_toggle_open={isOpen => set_is_menu_moreactions_open(isOpen)}
			style={{"min-width": "164px"}}
			ref={r => menu_moreactions_ref = r}>
			<MenuItem
				icon_code={0xEDA1}
				onClick={() => {
					close_menu(menu_moreactions_ref)
					command(Commands.save_gradient)
				}}>
				Save gradient
			</MenuItem>
			<MenuItem
				icon_code={0xE51B}
				onClick={(event) => {
					close_menu(menu_moreactions_ref)
					copy_gradient(event)
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
			leading={<img alt="Color Gradient logo" width={32} src={logo.src} />}
			headline="Color Gradient"
			trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					focused={is_menu_info_open()}
					code={0xE930}
					onClick={(ev) => open_menu(ev, menu_info_ref, {
						anchor: ev.currentTarget,
						padding: 4,
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					focused={is_menu_settings_open()}
					code={0xEE0F}
					onClick={(ev) => open_menu(ev, menu_settings_ref, {
						anchor: ev.currentTarget,
						padding: 4,
					})}
				/>
				<IconButton
					data-tooltip="More actions"
					focused={is_menu_moreactions_open()}
					code={0xEAD9}
					onClick={(ev) => open_menu(ev, menu_moreactions_ref, {
						anchor: ev.currentTarget,
						padding: 4,
					})}
				/>
			</Tooltip>}
		/>
		<Menus />
		<Toasts />
	</>)
}

export default _