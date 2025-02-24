import type { ECMA } from "terser"
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
import { Commands, TextTypes } from "./_enums"
import { NumberTextField } from "@/components/TextField"
import { elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { navigatorShare } from "@/utils/navigator"
import { documentActive, documentRoot } from "@/utils/document"
import { dateYear } from "@/utils/datetime"
import { numberParse, numberSafe } from "@/utils/number"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { attrSet } from "@/utils/attributes"
import { validEnumValue } from "@/utils/object"
import { APP_JAVASCRIPT_MINIFIER as app } from "@/constants/apps"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_ARROW_RESET, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_DOCUMENT_ARROW_RIGHT, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_WRAP, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import { AnimationData } from "@/enums/animation"
import { arrayIncludes } from "@/utils/array"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import { IconButton } from "@/components/Button"
import Menu, {  closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
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
	const [isMenuMoreActionsOpen, setIsMenuMoreActionsOpen] = createSignal<boolean>(false)
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	const minifyOptions = createMemo(() => settings().minifyOptions)
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let menuMoreActionsRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		attrSet(root, RootAttributes.animation, animation)
		storageSet(LocalStorageKeys.animation, animation)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		setAttribute(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		setAttribute(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function updateEcma(ecma: ECMA): void {
		command(Commands.updateEcma, ecma)
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

	function downloadFile(type: TextTypes): void {
		command(Commands.downloadFile, type)
		closeMenu(menuMoreActionsRef)
	}

	function copyAll(type: TextTypes): void {
		command(Commands.copyAll, type)
		closeMenu(menuMoreActionsRef)
	}

	function initAnimation(): void {
		const animation = storageGet(LocalStorageKeys.animation)
		if (animation && validEnumValue(animation, AnimationData)) {
			attrSet(root, RootAttributes.animation, animation)
			setAnimation(animation as AnimationData)
		}
	}

	onMount(() => {
		initTheme()
		initCorner()
		initAnimation()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const buttonMoreActions_openFileId = createUniqueId()
		const buttonMoreActions_resetInputId = createUniqueId()
		const inputSettings_textWrapId = createUniqueId()
		const inputSettings_ie8Id = createUniqueId()
		const inputSettings_safari10Id = createUniqueId()
		const inputSettings_moduleId = createUniqueId()
		const inputSettings_keepClassNamesId = createUniqueId()
		const inputSettings_keepFunctionNamesId = createUniqueId()
		const inputSettings_topLevelId = createUniqueId()
		const inputSettings_beautifyId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
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
				c:draggable
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

					const dataEcma = elementDataset(button, 'ecma')
					if (dataEcma) {
						const ecma = numberSafe(numberParse(dataEcma), 5)
						if (!arrayIncludes([5, 2015, 2016, 2017, 2018, 2019, 2020], ecma)) return

						return updateEcma(ecma as ECMA)
					}
				}}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement
					const value = target.checked

					switch (elementId(target)) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					case inputSettings_textWrapId:
						command(Commands.toggleTextWrap)
						break
					case inputSettings_ie8Id:
						command(Commands.updateSupportIE8, value)
						break
					case inputSettings_safari10Id:
						command(Commands.updateSupportSafari10, value)
						break
					case inputSettings_moduleId:
						command(Commands.updateModule, value)
						break
					case inputSettings_keepClassNamesId:
						command(Commands.updateKeepClassNames, value)
						break
					case inputSettings_keepFunctionNamesId:
						command(Commands.updateKeepFunctionNames, value)
						break
					case inputSettings_topLevelId:
						command(Commands.updateTopLevel, value)
						break
					case inputSettings_beautifyId:
						command(Commands.updateBeautify, value)
						break
					}
				}}>
				<SwitchMenuItem
					c:checked={animation() === AnimationData.on}
					c:iconCode={ICON_PLAY_CIRCLE_HINT}
					c:attrSwitch={{id: inputSettings_animationId}}>
					Animation
				</SwitchMenuItem>
				<SubMenu
					c:item={<SubMenuItem
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
					c:item={<SubMenuItem
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
					c:attrSwitch={{id: inputSettings_textWrapId}}>
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
				<MenuDivider />
				<MenuHeader>Minify options</MenuHeader>
				<SwitchMenuItem
					c:checked={minifyOptions().ie8}
					c:attrSwitch={{id: inputSettings_ie8Id}}>
					Support IE8
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().safari10}
					c:attrSwitch={{id: inputSettings_safari10Id}}>
					Support Safari10
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().module}
					c:attrSwitch={{id: inputSettings_moduleId}}>
					Module
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().keepClassNames}
					c:attrSwitch={{id: inputSettings_keepClassNamesId}}>
					Keep class names
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().keepFunctionNames}
					c:attrSwitch={{id: inputSettings_keepFunctionNamesId}}>
					Keep function names
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().topLevel}
					c:attrSwitch={{id: inputSettings_topLevelId}}>
					Top level
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={minifyOptions().beautify}
					c:attrSwitch={{id: inputSettings_beautifyId}}>
					Beautify
				</SwitchMenuItem>
				<SubMenu
					style={{width: '128px'}}
					c:item={<SubMenuItem>ECMAScript version</SubMenuItem>}>
					<MenuItem data-ecma="5" c:selected={minifyOptions().ecma === 5}>5</MenuItem>
					<MenuItem data-ecma="2015" c:selected={minifyOptions().ecma === 2015}>2015</MenuItem>
					<MenuItem data-ecma="2016" c:selected={minifyOptions().ecma === 2016}>2016</MenuItem>
					<MenuItem data-ecma="2017" c:selected={minifyOptions().ecma === 2017}>2017</MenuItem>
					<MenuItem data-ecma="2018" c:selected={minifyOptions().ecma === 2018}>2018</MenuItem>
					<MenuItem data-ecma="2019" c:selected={minifyOptions().ecma === 2019}>2019</MenuItem>
					<MenuItem data-ecma="2020" c:selected={minifyOptions().ecma === 2020}>2020</MenuItem>
				</SubMenu>
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
						el => elementTagName(el) === 'BUTTON'
					)) return

					switch (elementId(button)) {
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
							&& validEnumValue(dataDownload, TextTypes)
						) return downloadFile(dataDownload as TextTypes)

						const dataCopy = elementDataset(button, 'copy')
						if (dataCopy
							&& validEnumValue(dataCopy, TextTypes)
						) return copyAll(dataCopy as TextTypes)
					}
				}}>
				<MenuItem
					c:iconCode={ICON_DOCUMENT_ARROW_RIGHT}
					id={buttonMoreActions_openFileId}>
					Open file
				</MenuItem>
				<MenuDivider/>
				<SubMenu
					style={{width: '128px'}}
					c:item={<SubMenuItem
						c:iconCode={ICON_ARROW_DOWNLOAD}>
						Download
					</SubMenuItem>}>
					<MenuItem
						data-download={TextTypes.input}>
						Source
					</MenuItem>
					<MenuItem
						data-download={TextTypes.output}>
						Result
					</MenuItem>
				</SubMenu>
				<SubMenu
					style={{width: '128px'}}
					c:item={<SubMenuItem
						c:iconCode={ICON_COPY}>
						Copy all
					</SubMenuItem>}>
					<MenuItem
						data-copy={TextTypes.input}>
						Source
					</MenuItem>
					<MenuItem
						data-copy={TextTypes.output}>
						Result
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
			c:leading={<img alt={app.name + ' logo'} width={32} src={app.logoUrl} />}
			c:headline={app.name}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
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