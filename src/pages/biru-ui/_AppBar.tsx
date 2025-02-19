import { createSignal, For, onMount, Show, type VoidComponent } from "solid-js"

import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { attrSet, attrClassListModule } from "@/utils/attributes"
import { windowMatches, windowMatchMedia } from "@/utils/window"
import { eventListenerAdd, eventCurrentTarget } from '@/utils/event'
import { Commands, Pages } from "./_enums"
import { PAGES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { urlEncode } from "@/utils/url"
import { isMobile } from "@/utils/platforms"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { PlatformData } from "@/enums/platforms"
import { documentRoot } from "@/utils/document"
import { ICON_APPS, ICON_CHAT, ICON_CIRCLE, ICON_DESKTOP, ICON_DESKTOP_TOWER, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_PHONE, ICON_PHONE_LAPTOP, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo from '@/assets/images/apps/biru-ui.svg'
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, SubMenuItem } from "@/components/Menu"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
import { validEnumValue } from "@/utils/object"

const _: VoidComponent<{
	command: (type: Commands, ...args: unknown[]) => unknown
	page: Pages
}> = (props) => {
	const root = documentRoot()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_platformOpen, setIsSubMenuSettings_platformOpen] = createSignal<boolean>(false)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [platform, setPlatform] = createSignal<PlatformData>(PlatformData.desktop)
	let drawerNavigationRef: HTMLDialogElement
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let subMenuSettings_platformRef: HTMLDivElement

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(windowMatches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		eventListenerAdd(
			windowMatchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	function updatePlatform(platform: PlatformData): void {
		setPlatform(platform)
		attrSet(root, RootAttributes.platform, platform)
		closeSubMenu(subMenuSettings_platformRef)
		closeMenu(menuSettingsRef)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		attrSet(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeSubMenu(subMenuSettings_themeRef)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		attrSet(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
		closeSubMenu(subMenuSettings_cornerRef)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = storageGet(LocalStorageKeys.theme)
		if (theme && validEnumValue(theme, ThemeData)) {
			attrSet(root, RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = storageGet(LocalStorageKeys.corner)
		if (corner && validEnumValue(corner, CornerData)) {
			attrSet(root, RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function initPlatform(): void {
		const $isMobile = isMobile()
		if (!$isMobile) return

		setPlatform(PlatformData.mobile)
	}

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
		initPlatform()
	})

	const Menus: VoidComponent = () => {
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menuInfoRef = r}
				c:onToggleOpen={(v) => setIsMenuInfoOpen(v)}>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={RoutesLinks.home}
					c:leading={<img src={logoRedmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={RoutesLinks.apps}
					c:iconCode={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={RoutesLinks.about}
					c:iconCode={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					onClick={() => {
						navigatorShare({ title: 'BiruUI', text: 'BiruUI', url: document.URL })
						closeMenu(menuInfoRef)
					}}
					c:iconCode={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + urlEncode('BiruUI')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menuInfoRef)}
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {dateYear(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}>
				<SubMenu
					ref={r => subMenuSettings_themeRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_themeOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_themeOpen()}
						c:iconCode={ICON_WEATHER_SUNNY}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c:selected={theme() == ThemeData.light}
						c:iconCode={ICON_WEATHER_SUNNY}
						onClick={() => updateTheme(ThemeData.light)}>
						Light
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.dark}
						c:iconCode={ICON_WEATHER_MOON}
						onClick={() => updateTheme(ThemeData.dark)}>
						Dark
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.system}
						c:iconCode={ICON_LAPTOP_SETTINGS}
						onClick={() => updateTheme(ThemeData.system)}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => subMenuSettings_cornerRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_cornerOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_cornerOpen()}
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c:selected={corner() == CornerData.sharp}
						c:iconCode={ICON_MAXIMIZE}
						onClick={() => updateCorner(CornerData.sharp)}>
						Sharp
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.semiRound}
						c:iconCode={ICON_SQUARE}
						onClick={() => updateCorner(CornerData.semiRound)}>
						Semi round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.round}
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}
						onClick={() => updateCorner(CornerData.round)}>
						Round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.fullRound}
						c:iconCode={ICON_CIRCLE}
						onClick={() => updateCorner(CornerData.fullRound)}>
						Full round
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => subMenuSettings_platformRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_platformOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_platformOpen()}
						c:iconCode={ICON_DESKTOP_TOWER}>
						Platform
					</SubMenuItem>}>
					<MenuItem
						c:selected={platform() == PlatformData.hybrid}
						c:iconCode={ICON_PHONE_LAPTOP}
						onClick={() => updatePlatform(PlatformData.hybrid)}>
						Hybrid
					</MenuItem>
					<MenuItem
						c:selected={platform() == PlatformData.desktop}
						c:iconCode={ICON_DESKTOP}
						onClick={() => updatePlatform(PlatformData.desktop)}>
						Desktop
					</MenuItem>
					<MenuItem
						c:selected={platform() == PlatformData.mobile}
						c:iconCode={ICON_PHONE}
						onClick={() => updatePlatform(PlatformData.mobile)}>
						Mobile
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c:leading={<Tooltip>
				<Show when={isSideNavigationHidden()}>
					<IconButton
						data-tooltip="Open navigation"
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						onClick={() => {
							openDrawer(drawerNavigationRef)
						}}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
				</Show>
				<img alt="BiruUI logo" width={32} src={logo.src} />
			</Tooltip>}
			c:headline="BiruUI"
			c:trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					c:focused={isMenuInfoOpen()}
					c:code={ICON_INFO}
					onClick={(ev) => openMenu( menuInfoRef, {
						anchor: eventCurrentTarget(ev),
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					c:focused={isMenuSettingsOpen()}
					c:code={ICON_SETTINGS}
					onClick={(ev) => openMenu(menuSettingsRef, {
						anchor: eventCurrentTarget(ev),
					})}
				/>
			</Tooltip>}
		/>
		<Menus />
		<Drawer
			c:header={<Tooltip>
				<IconButton
					data-tooltip="Close navigation"
					classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
					c:code={ICON_LINE_HORIZONTAL_3}
					onClick={() => closeDrawer(drawerNavigationRef)}
				/>
			</Tooltip>}
			ref={r => drawerNavigationRef = r}>
			<For each={PAGES}>{page =>
				<DrawerItem
					onClick={() => {
						props.command(Commands.updatePage, page.type)
						closeDrawer(drawerNavigationRef)
					}}
					c:selected={props.page == page.type}>
					{page.text}
				</DrawerItem>
			}</For>
		</Drawer>
	</>)
}

export default _