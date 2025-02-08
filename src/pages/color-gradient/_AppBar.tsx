import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Gradient, Settings } from "./_type"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { attrSet } from "@/utils/attributes"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { urlEncode, urlOrigin } from "@/utils/url"
import { ColorSpace, Commands } from "./_enums"
import { gradientToCSSText } from "./_utils"
import { promiseDone, validEnumValue } from "@/utils/object"
import { arrayJoin, arrayMap } from "@/utils/array"
import { navigatorClipboardWriteText, navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { eventCurrentTarget } from "@/utils/event"
import { documentActive, documentRoot } from "@/utils/document"
import { APP_COLOR_GRADIENT as app } from "@/constants/apps"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CIRCLE, ICON_COLOR, ICON_COPY, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_RECEIPT, ICON_SAVE, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo_redmerah from '@/assets/logo.svg'

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
	const root = documentRoot()
	const buttonInfoId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const buttonMoreActionsId = createUniqueId()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isMenuMoreActionsOpen, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_colorSpaceOpen, setIsSubMenuSettings_colorSpaceOpen] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let menuMoreActionsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let subMenuSettings_colorModelRef: HTMLDivElement
	let toastCopiedRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
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

	function updateColorSpace(space: ColorSpace): void {
		command(Commands.updateSettingsColorSpace, space)
		closeSubMenu(subMenuSettings_colorModelRef)
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

	function copyGradient(): void {
		const text = arrayJoin(
			arrayMap(
				props.gradients,
				gradient => gradientToCSSText(gradient, settings().colorSpace, true)
			),
			'\n'
		)

		promiseDone(
			navigatorClipboardWriteText(text),
			() => openToast(toastCopiedRef)
		)
	}

	onMount(() => {
		initTheme()
		initCorner()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const buttonMoreActions_saveGradientId = createUniqueId()
		const buttonMoreActions_copyGradientId = createUniqueId()
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
					c:leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
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
					) return updateTheme(dataTheme as ThemeData)

					const dataCorner = elementDataset(button, 'corner')
					if (dataCorner
						&& validEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)

					const dataModel = elementDataset(button, 'model')
					if (dataModel
						&& validEnumValue(dataModel, ColorSpace)
					) updateColorSpace(dataModel as ColorSpace)
				}}>
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
				<SubMenu
					ref={r => subMenuSettings_colorModelRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_colorSpaceOpen(v)}
					style={{"min-width": '180px'}}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_colorSpaceOpen()}
						c:iconCode={ICON_COLOR}>
						Color model
					</SubMenuItem>}>
					<MenuItem
						data-model={ColorSpace.rgba}
						c:selected={settings().colorSpace == ColorSpace.rgba}
						c:trailing={<MenuItemTrailingShortcut c:shortcuts={['rgba(R,G,B,A)']}/>}>
						RGBA
					</MenuItem>
					<MenuItem
						data-model={ColorSpace.hsla}
						c:selected={settings().colorSpace == ColorSpace.hsla}
						c:trailing={<MenuItemTrailingShortcut c:shortcuts={['hsla(H°,S%,L%,A)']}/>}>
						HSLA
					</MenuItem>
					<MenuItem
						data-model={ColorSpace.hex}
						c:selected={settings().colorSpace == ColorSpace.hex}
						c:trailing={<MenuItemTrailingShortcut c:shortcuts={['#RRGGBBAA']}/>}>
						HEX
					</MenuItem>
				</SubMenu>
			</Menu>
			<Menu
				c:onToggleOpen={isOpen => set_is_menu_moreactions_open(isOpen)}
				style={{"min-width": "164px"}}
				ref={r => menuMoreActionsRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonMoreActions_saveGradientId:
						closeMenu(menuMoreActionsRef)
						command(Commands.saveGradient)
						break
					case buttonMoreActions_copyGradientId:
						closeMenu(menuMoreActionsRef)
						copyGradient()
						break
					}
				}}>
				<MenuItem
					c:iconCode={ICON_SAVE}
					id={buttonMoreActions_saveGradientId}>
					Save gradient
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_COPY}
					id={buttonMoreActions_copyGradientId}>
					Copy gradient
				</MenuItem>
			</Menu>
		</>)
	}

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<>
		<AppBar
			c:leading={<img alt={app.name} width={32} src={app.logoUrl} />}
			c:headline={app.name}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonInfoId:
					openMenu(menuInfoRef, { anchor: button })
					break
				case buttonSettingsId:
					openMenu(menuSettingsRef, { anchor: button })
					break
				case buttonMoreActionsId:
					openMenu(menuMoreActionsRef, { anchor: button })
					break
				}
			}}
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
					data-tooltip="More actions"
					c:focused={isMenuMoreActionsOpen()}
					id={buttonMoreActionsId}
					c:code={ICON_MORE_VERTICAL}
				/>
			</Tooltip>}
		/>
		<Menus />
		<Toasts />
	</>)
}

export default _