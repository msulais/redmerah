import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storage_set, storage_get } from "@/utils/storage"
import { attr_set, classlist_module } from "@/utils/attributes"
import { window_matches, window_match_media } from "@/utils/window"
import { event_add_listener, event_current_target } from '@/utils/event'
import { Commands, Pages } from "./_enums"
import { PAGES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { wait } from "@/utils/timeout"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode } from "@/utils/url"
import { is_mobile } from "@/utils/platforms"
import { array_includes } from "@/utils/array"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { PlatformData } from "@/enums/platforms"
import { document_root } from "@/utils/document"
import logo from '@/assets/apps/biru-ui-logo.svg'
import logo_redmerah from '@/assets/logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, open_menu, LinkMenuItem, SubMenu, close_submenu, close_menu, SubMenuItem } from "@/components/Menu"
import Drawer, { close_drawer, DrawerItem, open_drawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	command: (type: Commands, ...args: unknown[]) => unknown
	page: Pages
}> = (props) => {
	const root = document_root()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_platformsettings_open, set_is_submenu_platformsettings_open] = createSignal<boolean>(false)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [platform, setPlatform] = createSignal<PlatformData>(PlatformData.desktop)
	let drawer_navigation_ref: HTMLDialogElement
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_platformsettings_ref: HTMLDivElement

	function init_sidenavigation_listener(): void {
		setIsSideNavigationHidden(window_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(
			window_match_media(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	async function change_platform(platform: PlatformData): Promise<void> {
		setPlatform(platform)
		attr_set(root, RootAttributes.platform, platform)
		close_submenu(submenu_platformsettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		setTheme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		setCorner(corner)
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
			setTheme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([CornerData.sharp, CornerData.semi_round, CornerData.round, CornerData.full_round], corner as CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function init_platform(): void {
		const $isMobile = is_mobile()
		if (!$isMobile) return

		setPlatform(PlatformData.mobile)
	}

	onMount(() => {
		init_theme()
		init_corner()
		init_sidenavigation_listener()
		init_platform()
	})

	const Menus: VoidComponent = () => {
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				c_on_toggleopen={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.home}
					c_leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.apps}
					c_icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.about}
					c_icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.privacy}
					c_icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.terms}
					c_icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					onClick={() => {
						navigator_share({ title: 'BiruUI', text: 'BiruUI', url: document.URL })
						close_menu(menu_info_ref)
					}}
					c_icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('BiruUI')}
					c_icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				c_on_toggleopen={(v) => set_is_menu_settings_open(v)}>
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
						onClick={() => change_theme(ThemeData.light)}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.dark}
						c_icon_code={0xF2B3}
						onClick={() => change_theme(ThemeData.dark)}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.system}
						c_icon_code={0xE96D}
						onClick={() => change_theme(ThemeData.system)}>
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
						onClick={() => change_corner(CornerData.sharp)}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.semi_round}
						c_icon_code={0xEEF7}
						onClick={() => change_corner(CornerData.semi_round)}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.round}
						c_icon_code={0xF044}
						onClick={() => change_corner(CornerData.round)}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.full_round}
						c_icon_code={0xE408}
						onClick={() => change_corner(CornerData.full_round)}>
						Full round
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_platformsettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_platformsettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_platformsettings_open()}
						c_icon_code={0xE5CB}>
						Platform
					</SubMenuItem>}>
					<MenuItem
						c_selected={platform() == PlatformData.hybrid}
						c_icon_code={0xEC76}
						onClick={() => change_platform(PlatformData.hybrid)}>
						Hybrid
					</MenuItem>
					<MenuItem
						c_selected={platform() == PlatformData.desktop}
						c_icon_code={0xE5AD}
						onClick={() => change_platform(PlatformData.desktop)}>
						Desktop
					</MenuItem>
					<MenuItem
						c_selected={platform() == PlatformData.mobile}
						c_icon_code={0xEC5C}
						onClick={() => change_platform(PlatformData.mobile)}>
						Mobile
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c_leading={<Tooltip>
				<Show when={isSideNavigationHidden()}>
					<IconButton
						data-tooltip="Open navigation"
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						onClick={(ev) => {
							open_drawer(ev, drawer_navigation_ref)
						}}
						c_code={0xEAFF}
					/>
				</Show>
				<img alt="BiruUI logo" width={32} src={logo.src} />
			</Tooltip>}
			c_headline="BiruUI"
			c_trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					c_focused={is_menu_info_open()}
					c_code={0xE930}
					onClick={(ev) => open_menu(ev, menu_info_ref, {
						anchor: event_current_target(ev),
						padding: 4,
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					c_focused={is_menu_settings_open()}
					c_code={0xEE0F}
					onClick={(ev) => open_menu(ev, menu_settings_ref, {
						anchor: event_current_target(ev),
						padding: 4,
					})}
				/>
			</Tooltip>}
		/>
		<Menus />
		<Drawer
			c_header={<Tooltip>
				<IconButton
					data-tooltip="Close navigation"
					classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
					c_code={0xEAFF}
					onClick={() => close_drawer(drawer_navigation_ref)}
				/>
			</Tooltip>}
			ref={r => drawer_navigation_ref = r}>
			<For each={PAGES}>{page =>
				<DrawerItem
					onClick={() => {
						props.command(Commands.change_page, page.type)
						close_drawer(drawer_navigation_ref)
					}}
					c_selected={props.page == page.type}>
					{page.text}
				</DrawerItem>
			}</For>
		</Drawer>
	</>)
}

export default _