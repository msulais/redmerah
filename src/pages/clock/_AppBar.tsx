import { createSignal, createUniqueId, For, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { attrClassListModule, attrSet } from "@/utils/attributes"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { documentActive, documentRoot } from "@/utils/document"
import { urlEncode, urlOrigin } from "@/utils/url"
import { APP_CLOCK as app } from "@/constants/apps"
import { validEnumValue } from "@/utils/object"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { eventCurrentTarget, eventListenerAdd } from "@/utils/event"
import { ICON_APPS, ICON_ARROW_MAXIMIZE, ICON_ARROW_MINIMIZE, ICON_CHAT, ICON_CIRCLE, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_PHONE_LOCK, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import { PAGES, SIZE_SIDE_NAVIGATION_NONE } from "./_constant"
import { windowMatches, windowMatchMedia } from "@/utils/window"
import { Commands, Pages } from "./_enums"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	page: Pages
	isBodyExpanded: boolean
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = documentRoot()
	const buttonNavigationId = createUniqueId()
	const buttonInfoId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const buttonExpandId = createUniqueId()
	const inputKeepAwakeId = createUniqueId()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let drawerNavigationRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function udpateTheme(theme: ThemeData): void {
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

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(windowMatches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		eventListenerAdd(windowMatchMedia(
			`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => {
							const tagname = elementTagName(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (elementId(button)) {
					case buttonInfo_shareId:
						navigatorShare({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: urlOrigin() + app.link
						})
						break
					}

					closeMenu(menuInfoRef)
				}}
				style={{width: '200px'}}
				ref={r => menuInfoRef = r}
				c:onToggleOpen={(v) => setIsMenuInfoOpen(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					c:leading={<img src={logoRedmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c:iconCode={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c:iconCode={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={buttonInfo_shareId}
					c:iconCode={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + urlEncode('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {dateYear(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataTheme = elementDataset(button, 'theme')
					if (dataTheme
						&& validEnumValue(dataTheme, ThemeData)
					) return udpateTheme(dataTheme as ThemeData)

					const dataCorner = elementDataset(button, 'corner')
					if (dataCorner
						&& validEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)
				}}>
				<SwitchMenuItem
					c:checked={props.settings.keepAwake}
					c:iconCode={ICON_PHONE_LOCK}
					c:attrSwitch={{
						id: inputKeepAwakeId,
						onChange: ev => command(
							Commands.toggleKeepAwake,
							eventCurrentTarget(ev).checked
						)
					}}
				>Keep awake</SwitchMenuItem>
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
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.dark}
						c:iconCode={ICON_WEATHER_MOON}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.system}
						c:iconCode={ICON_LAPTOP_SETTINGS}
						data-theme={ThemeData.system}>
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
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.semiRound}
						c:iconCode={ICON_SQUARE}
						data-corner={CornerData.semiRound}>
						Semi round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.round}
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.fullRound}
						c:iconCode={ICON_CIRCLE}
						data-corner={CornerData.fullRound}>
						Full round
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	const Drawers: VoidComponent = () => {
		const buttonNavigation_closeId = createUniqueId()
		return (<>
			<Drawer
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonNavigation_closeId:
						closeDrawer(drawerNavigationRef)
						break
					default:
						const dataNavigation = elementDataset(button, 'navigation')
						if (dataNavigation
							&& validEnumValue(dataNavigation, Pages)
						) {
							closeDrawer(drawerNavigationRef)
							if (dataNavigation !== props.page) {
								command(Commands.updatePage, dataNavigation)
							}
						}
					}
				}}
				c:header={<Tooltip>
					<IconButton
						data-tooltip="Close navigation"
						id={buttonNavigation_closeId}
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
				</Tooltip>}
				ref={r => drawerNavigationRef = r}>
				<For each={PAGES}>{r => <DrawerItem
					data-navigation={r.type}
					c:iconCode={r.icon}
					c:selected={props.page === r.type}>
					{ r.text }
				</DrawerItem>}</For>
			</Drawer>
		</>)
	}

	return (<>
		<Show when={!props.isBodyExpanded}>
			<AppBar
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonNavigationId:
						if (isSideNavigationHidden()) return openDrawer(drawerNavigationRef)

						command(Commands.toggleNavigationExpand)
						break
					case buttonInfoId:
						openMenu(menuInfoRef, { anchor: button })
						break
					case buttonSettingsId:
						openMenu(menuSettingsRef, { anchor: button })
						break
					case buttonExpandId:
						command(Commands.toggleBodyExpand)
						break
					}
				}}
				c:leading={<>
					<IconButton
						data-tooltip={isSideNavigationHidden()
							? "Open navigation"
							: "Expand/shrink navigation"
						}
						id={buttonNavigationId}
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
					<img width={32} src={app.logoUrl} alt={app.name} />
				</>}
				c:headline={app.name}
				c:trailing={<Tooltip>
					<IconButton
						data-tooltip="Info"
						c:focused={isMenuInfoOpen()}
						id={buttonInfoId}
						c:code={ICON_INFO}
					/>
					<IconButton
						data-tooltip="Settings"
						class={CSSAnimation.btn_rotate_icon}
						c:focused={isMenuSettingsOpen()}
						id={buttonSettingsId}
						c:code={ICON_SETTINGS}
					/>
					<IconButton
						data-tooltip={"Expand"}
						id={buttonExpandId}
						c:code={ICON_ARROW_MAXIMIZE}
					/>
				</Tooltip>}
			/>
		</Show>
		<Menus />
		<Drawers />
		<Show when={props.isBodyExpanded}>
			<Tooltip>
				<IconButton
					onClick={() => command(Commands.toggleBodyExpand)}
					data-tooltip={"Restore"}
					style='position:absolute;right:8px;top:8px;'
					c:code={ICON_ARROW_MINIMIZE}
				/>
			</Tooltip>
		</Show>
	</>)
}

export default _