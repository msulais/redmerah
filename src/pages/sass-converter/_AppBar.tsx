import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { Commands } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { urlEncode, urlOrigin } from "@/utils/url"
import { attrSet } from "@/utils/attributes"
import { validEnumValue } from "@/utils/object"
import { documentActive, documentRoot } from "@/utils/document"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { numberSafe } from "@/utils/number"
import { APP_SASS_CONVERTER as app } from "@/constants/apps"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_ARROW_MINIMIZE_VERTICAL, ICON_ARROW_RESET, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_DOCUMENT_ARROW_RIGHT, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_WRAP, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'
import logoSCSS from '@/assets/images/logos/scss-logo.svg'
import logoSASS from '@/assets/images/logos/sass-logo.svg'
import logoCSS from '@/assets/images/logos/css-logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { closeMenu, closeSubMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, openMenu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import { NumberTextField } from "@/components/TextField"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = documentRoot()
	const buttonInfoId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const buttonMoreActionsId = createUniqueId()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isMenuMoreActionsOpen, setIsMenuMoreActionsOpen] = createSignal<boolean>(false)
	const [isSubMenuMoreActions_downloadOpen, setIsSubMenuMoreActions_downloadOpen] = createSignal<boolean>(false)
	const [isSubMenuMoreActions_copyAllOpen, setIsSubMenuMoreActions_copyAllOpen] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let menuMoreActionsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let subMenuMoreActions_downloadRef: HTMLDivElement
	let subMenuMoreActions_copyAllRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function changeTheme(theme: ThemeData): void {
		setTheme(theme)
		attrSet(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeSubMenu(subMenuSettings_themeRef)
		closeMenu(menuSettingsRef)
	}

	function changeCorner(corner: CornerData): void {
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

	function downloadFile(type: 'sass' | 'scss' | 'css'): void {
		command(Commands.downloadFile, type)
		closeSubMenu(subMenuMoreActions_downloadRef)
		closeMenu(menuMoreActionsRef)
	}

	function copyAll(type: 'sass' | 'scss' | 'css'): void {
		command(Commands.copyAll, type)
		closeSubMenu(subMenuMoreActions_copyAllRef)
		closeMenu(menuMoreActionsRef)
	}

	onMount(() => {
		initTheme()
		initCorner()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const buttonMoreActions_openFileId = createUniqueId()
		const buttonMoreActions_resetInputsId = createUniqueId()
		const inputSettings_textWrapId = createUniqueId()
		const inputSettings_minifyCSSId = createUniqueId()
		const inputSettings_fontSizeId = createUniqueId()
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
					if (dataTheme) return changeTheme(dataTheme as ThemeData)

					const dataCorner = elementDataset(button, 'corner')
					if (dataCorner) return changeCorner(dataCorner as CornerData)
				}}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
					case inputSettings_textWrapId:
						command(Commands.toggleTextWrap)
						break
					case inputSettings_minifyCSSId:
						command(Commands.toggleMinify)
						break
					}
				}}
				onFocusOut={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
					case inputSettings_fontSizeId:
						command(
							Commands.updateFontSize,
							numberSafe(target.valueAsNumber, settings().fontSize)
						)
						break
					}
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
				<MenuDivider/>
				<SwitchMenuItem
					c:iconCode={ICON_TEXT_WRAP}
					c:checked={settings().textWrap}
					c:attrSwitch={{
						id: inputSettings_textWrapId
					}}>
					Text wrap
				</SwitchMenuItem>
				<SwitchMenuItem
					c:iconCode={ICON_ARROW_MINIMIZE_VERTICAL}
					c:checked={settings().minify}
					c:attrSwitch={{
						id: inputSettings_minifyCSSId
					}}>
					Minify CSS
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<Tooltip>
						<NumberTextField
							min={12}
							c:label="Font size"
							id={inputSettings_fontSizeId}
							value={settings().fontSize}
						/>
					</Tooltip>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				c:onToggleOpen={isOpen => setIsMenuMoreActionsOpen(isOpen)}
				ref={r => menuMoreActionsRef = r}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
					case buttonMoreActions_openFileId:
						closeMenu(menuMoreActionsRef)
						command(Commands.openFile, ev)
						break
					case buttonMoreActions_resetInputsId:
						closeMenu(menuMoreActionsRef)
						command(Commands.resetInputs)
						break
					default:
						const dataDonwload = elementDataset(button, 'download')
						if (dataDonwload) {
							if (
								dataDonwload != 'sass'
								&& dataDonwload != 'scss'
								&& dataDonwload != 'css'
							) return

							return downloadFile(dataDonwload)
						}

						const dataCopy = elementDataset(button, 'copy')
						if (dataCopy) {
							if (
								dataCopy != 'sass'
								&& dataCopy != 'scss'
								&& dataCopy != 'css'
							) return

							return copyAll(dataCopy)
						}
					}
				}}>
				<MenuItem
					c:iconCode={ICON_DOCUMENT_ARROW_RIGHT}
					id={buttonMoreActions_openFileId}>
					Open file
				</MenuItem>
				<MenuDivider/>
				<SubMenu
					c:onToggleOpen={isOpen => setIsSubMenuMoreActions_downloadOpen(isOpen)}
					ref={r => subMenuMoreActions_downloadRef = r}
					c:item={<SubMenuItem
						c:iconCode={ICON_ARROW_DOWNLOAD}
						c:focused={isSubMenuMoreActions_downloadOpen()}>
						Download
					</SubMenuItem>}>
					<MenuItem
						data-download='sass'
						c:leading={<img width={20} src={logoSASS.src} alt="SASS logo"/>}>
						SASS
					</MenuItem>
					<MenuItem
						data-download='scss'
						c:leading={<img width={20} src={logoSCSS.src} alt="SCSS logo"/>}>
						SCSS
					</MenuItem>
					<MenuItem
						data-download='css'
						c:leading={<img width={20} src={logoCSS.src} alt="CSS logo"/>}>
						CSS
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => subMenuMoreActions_copyAllRef = r}
					c:onToggleOpen={isOpen => setIsSubMenuMoreActions_copyAllOpen(isOpen)}
					c:item={<SubMenuItem
						c:iconCode={ICON_COPY}
						c:focused={isSubMenuMoreActions_copyAllOpen()}>
						Copy all
					</SubMenuItem>}>
					<MenuItem
						data-copy='sass'
						c:leading={<img width={20} src={logoSASS.src} alt="SASS logo"/>}>
						SASS
					</MenuItem>
					<MenuItem
						data-copy='scss'
						c:leading={<img width={20} src={logoSCSS.src} alt="SCSS logo"/>}>
						SCSS
					</MenuItem>
					<MenuItem
						data-copy='css'
						c:leading={<img width={20} src={logoCSS.src} alt="CSS logo"/>}>
						CSS
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<MenuItem
					c:iconCode={ICON_ARROW_RESET}
					id={buttonMoreActions_resetInputsId}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c:leading={<img alt="Markdown converter logo" width={32} src={app.logoUrl} />}
			c:headline="SASS Converter"
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
					id={buttonInfoId}
					c:focused={isMenuInfoOpen()}
					c:code={ICON_INFO}
				/>
				<IconButton
					data-tooltip="Settings"
					id={buttonSettingsId}
					class={CSSAnimation.btn_rotate_icon}
					c:focused={isMenuSettingsOpen()}
					c:code={ICON_SETTINGS}
				/>
				<IconButton
					data-tooltip="More actions"
					id={buttonMoreActionsId}
					c:focused={isMenuMoreActionsOpen()}
					c:code={ICON_MORE_VERTICAL}
				/>
			</Tooltip>}
		/>
		<Menus/>
	</>)
}

export default _