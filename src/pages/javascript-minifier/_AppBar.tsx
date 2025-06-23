import type { ECMA } from "terser"
import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { Commands, TextTypes } from "./_enums"
import { NumberTextField } from "@/components/TextField"
import { isTargetValidElement } from "@/utils/element"
import { safeNumber } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { APP_JAVASCRIPT_MINIFIER as app } from "@/constants/apps"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_ARROW_RESET, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_DOCUMENT_ARROW_RIGHT, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_WRAP, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import { AnimationData } from "@/enums/animation"
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
	const root = document.documentElement
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
		root.setAttribute(RootAttributes.animation, animation)
		localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		root.setAttribute(RootAttributes.theme, theme)
		localStorage.setItem(LocalStorageKeys.platformTheme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		root.setAttribute(RootAttributes.corner, corner)
		localStorage.setItem(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function updateEcma(ecma: ECMA): void {
		command(Commands.updateEcma, ecma)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (theme && isValidEnumValue(theme, ThemeData)) {
			root.setAttribute(RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = localStorage.getItem(LocalStorageKeys.corner)
		if (corner && isValidEnumValue(corner, CornerData)) {
			root.setAttribute(RootAttributes.corner, corner)
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
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (animation && isValidEnumValue(animation, AnimationData)) {
			root.setAttribute(RootAttributes.animation, animation)
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
					const button = document.activeElement!
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonInfo_shareId:
						navigator.share({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: document.location.origin + app.link
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
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURI('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {new Date().getFullYear()} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:draggable
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const dataset = button.dataset
					const dataTheme = dataset.theme
					if (dataTheme
						&& isValidEnumValue(dataTheme, ThemeData)
					) return updateTheme(dataTheme as ThemeData)

					const dataCorner = dataset.corner
					if (dataCorner
						&& isValidEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)

					const dataEcma = dataset.ecma
					if (dataEcma) {
						const ecma = safeNumber(Number.parseFloat(dataEcma), 5)
						if (![5, 2015, 2016, 2017, 2018, 2019, 2020].includes(ecma)) return

						return updateEcma(ecma as ECMA)
					}
				}}
				onChange={ev => {
					const target = ev.target as HTMLInputElement
					const value = target.checked

					switch (target.id) {
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
								safeNumber(ev.currentTarget.valueAsNumber, settings().fontSize)
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
					const button = document.activeElement! as HTMLButtonElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonMoreActions_openFileId:
						closeMenu(menuMoreActionsRef)
						command(Commands.openFile)
						break
					case buttonMoreActions_resetInputId:
						closeMenu(menuMoreActionsRef)
						command(Commands.resetInputs)
						break
					default:
						const dataset = button.dataset
						const dataDownload = dataset.download
						if (dataDownload
							&& isValidEnumValue(dataDownload, TextTypes)
						) return downloadFile(dataDownload as TextTypes)

						const dataCopy = dataset.copy
						if (dataCopy
							&& isValidEnumValue(dataCopy, TextTypes)
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
						Input
					</MenuItem>
					<MenuItem
						data-download={TextTypes.output}>
						Output
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
						Input
					</MenuItem>
					<MenuItem
						data-copy={TextTypes.output}>
						Output
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
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
				)) return

				switch (button.id) {
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