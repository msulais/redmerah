import { createSignal as $signal, onMount as $mount, type VoidComponent } from "solid-js"

import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set } from "@/utils/attributes"
import { wait } from "@/utils/timeout"
import { array_includes } from "@/utils/array"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { document_root } from "@/utils/document"
import { url_encode } from "@/utils/url"
import { event_current_target } from "@/utils/event"
import logo from '@/assets/apps/color-picker/logo.svg'
import logo_redmerah from '@/assets/logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, open_menu, LinkMenuItem, SubMenu, close_submenu, close_menu, SubMenuItem } from "@/components/Menu"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent = () => {
	const root = document_root()
	const [is_menu_info_open, set_is_menu_info_open] = $signal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = $signal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = $signal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = $signal<boolean>(false)
	const [theme, set_theme] = $signal<ThemeData>(ThemeData.system)
	const [corner, set_corner] = $signal<CornerData>(CornerData.round)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && array_includes([ThemeData.system, ThemeData.light, ThemeData.dark], theme as ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([CornerData.sharp, CornerData.semi_round, CornerData.round, CornerData.full_round], corner as CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	$mount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		return (<>
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
						navigator_share({ title: 'Color Picker', text: 'Color Picker', url: document.URL })
						close_menu(menu_info_ref)
					}}
					icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Color Picker')}
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
						selected={theme() == ThemeData.light}
						icon_code={0xF2CD}
						onClick={() => change_theme(ThemeData.light)}>
						Light
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData.dark}
						icon_code={0xF2B3}
						onClick={() => change_theme(ThemeData.dark)}>
						Dark
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData.system}
						icon_code={0xE96D}
						onClick={() => change_theme(ThemeData.system)}>
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
						onClick={() => change_corner(CornerData.sharp)}>
						Sharp
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.semi_round}
						icon_code={0xEEF7}
						onClick={() => change_corner(CornerData.semi_round)}>
						Semi round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.round}
						icon_code={0xF044}
						onClick={() => change_corner(CornerData.round)}>
						Round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData.full_round}
						icon_code={0xE408}
						onClick={() => change_corner(CornerData.full_round)}>
						Full round
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			leading={<img alt="Color Picker logo" width={32} src={logo.src} />}
			headline="Color Picker"
			trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					focused={is_menu_info_open()}
					code={0xE930}
					onClick={(ev) => open_menu(ev, menu_info_ref, {
						anchor: event_current_target(ev),
						padding: 4,
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					focused={is_menu_settings_open()}
					code={0xEE0F}
					onClick={(ev) => open_menu(ev, menu_settings_ref, {
						anchor: event_current_target(ev),
						padding: 4,
					})}
				/>
			</Tooltip>}
		/>
		<Menus />
	</>)
}

export default _