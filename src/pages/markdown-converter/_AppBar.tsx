import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { urlEncode, urlOrigin } from "@/utils/url"
import { setAttribute } from "solid-js/web"
import { Commands } from "./_enums"
import { NumberTextField } from "@/components/TextField"
import { IFRAME_PREVIEW_ID } from "./_constants"
import { elementById, elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { navigatorShare } from "@/utils/navigator"
import { documentActive, documentRoot } from "@/utils/document"
import { dateYear } from "@/utils/datetime"
import { numberSafe } from "@/utils/number"
import { eventCurrentTarget } from "@/utils/event"
import { attrSet } from "@/utils/attributes"
import { arrayIncludes } from "@/utils/array"
import { validEnumValue } from "@/utils/object"
import { APP_MARKDOWN_CONVERTER as app } from "@/constants/apps"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_ARROW_RESET, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_DOCUMENT_ARROW_RIGHT, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_PRINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_WRAP, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'
import logoCSS from '@/assets/images/logos/css-logo.svg'
import logoHTML from '@/assets/images/logos/html-logo.svg'

import { IconButton } from "@/components/Button"
import Menu, { closeSubMenu, closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Tooltip from "@/components/Tooltip"
import CSSAnimation from "@/styles/animation.module.scss"
import AppBar from "@/components/AppBar"

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

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		setAttribute(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeSubMenu(subMenuSettings_themeRef)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		setAttribute(root, RootAttributes.corner, corner)
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

	function downloadFile(type: 'markdown' | 'css' | 'html'): void {
		command(Commands.downloadFile, type)
		closeSubMenu(subMenuMoreActions_downloadRef)
		closeMenu(menuMoreActionsRef)
	}

	function copyAll(type: 'markdown' | 'css' | 'html'): void {
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
		const buttonMoreActions_printId = createUniqueId()
		const buttonMoreActions_openFileId = createUniqueId()
		const buttonMoreActions_resetInputId = createUniqueId()
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
					) return updateTheme(dataTheme as ThemeData)

					const dataCorner = elementDataset(button, 'corner')
					if (dataCorner
						&& validEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)
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
						onChange: () => command(Commands.toggleTextWrap)
					}}>
					Text wrap
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<Tooltip>
						<NumberTextField
							min={12}
							c:label="Font size"
							value={settings().fontSize}
							onBlur={ev => command(
								Commands.updateFontSize,
								numberSafe(eventCurrentTarget(ev).valueAsNumber, settings().fontSize)
							)}
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
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonMoreActions_printId: {
						closeMenu(menuMoreActionsRef)
						const iframe = elementById(IFRAME_PREVIEW_ID) as HTMLIFrameElement
						iframe?.contentWindow?.print()
						break
					}
					case buttonMoreActions_openFileId:
						closeMenu(menuMoreActionsRef)
						command(Commands.openFile)
						break
					case buttonMoreActions_resetInputId:
						closeMenu(menuMoreActionsRef)
						command(Commands.resetInputs)
						break
					default:
						const dataDownload = elementDataset(button, 'download')
						if (dataDownload
							&& arrayIncludes(['markdown', 'html', 'css'], dataDownload)
						) return downloadFile(dataDownload as ('markdown' | 'html' | 'css'))

						const dataCopy = elementDataset(button, 'copy')
						if (dataCopy
							&& arrayIncludes(['markdown', 'html', 'css'], dataCopy)
						) return copyAll(dataCopy as ('markdown' | 'html' | 'css'))
					}
				}}>
				<MenuItem
					c:iconCode={ICON_PRINT}
					id={buttonMoreActions_printId}>
					Print
				</MenuItem>
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
						c:leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--g-color-on-surface))"/>
						</svg>}
						data-download='markdown'>
						Markdown
					</MenuItem>
					<MenuItem
						c:leading={<img width={20} src={logoHTML.src} alt="HTML logo"/>}
						data-download="html">
						HTML
					</MenuItem>
					<MenuItem
						c:leading={<img width={20} src={logoCSS.src} alt="CSS logo"/>}
						data-download="css">
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
						c:leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--g-color-on-surface))"/>
						</svg>}
						data-copy="markdown">
						Markdown
					</MenuItem>
					<MenuItem
						c:leading={<img width={20} src={logoHTML.src} alt="HTML logo"/>}
						data-copy="html">
						HTML
					</MenuItem>
					<MenuItem
						c:leading={<img width={20} src={logoCSS.src} alt="CSS logo"/>}
						data-copy="css">
						CSS
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<MenuItem
					c:iconCode={ICON_ARROW_RESET}
					id={buttonMoreActions_resetInputId}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			c:leading={<img alt="Markdown converter logo" width={32} src={app.logoUrl} />}
			c:headline="Markdown Converter"
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
					id={buttonInfoId}
					data-tooltip="Info"
					c:focused={isMenuInfoOpen()}
					c:code={ICON_INFO}
				/>
				<IconButton
					id={buttonSettingsId}
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					c:focused={isMenuSettingsOpen()}
					c:code={ICON_SETTINGS}
				/>
				<IconButton
					id={buttonMoreActionsId}
					data-tooltip="More actions"
					c:focused={isMenuMoreActionsOpen()}
					c:code={ICON_MORE_VERTICAL}
				/>
			</Tooltip>}
		/>
		<Menus/>
	</>)
}

export default _