import { createMemo, createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { Commands } from "./_enums"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { isValidEnumValue } from "@/utils/object"
import { isTargetValidElement } from "@/utils/element"
import { safeNumber } from "@/utils/number"
import { APP_SASS_CONVERTER as app } from "@/constants/apps"
import { AnimationData } from "@/enums/animation"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_ARROW_MINIMIZE_VERTICAL, ICON_ARROW_RESET, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_DOCUMENT_ARROW_RIGHT, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_WRAP, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'
import logoSCSS from '@/assets/images/logos/scss-logo.svg'
import logoSASS from '@/assets/images/logos/sass-logo.svg'
import logoCSS from '@/assets/images/logos/css-logo.svg'

import Tooltip from "@/components/Tooltip"
import { IconButton } from "@/components/Button"
import Menu, { closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, openMenu, SubMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import { NumberTextField } from "@/components/TextField"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

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

	function changeTheme(theme: ThemeData): void {
		setTheme(theme)
		root.setAttribute(RootAttributes.theme, theme)
		localStorage.setItem(LocalStorageKeys.platformTheme, theme)
		closeMenu(menuSettingsRef)
	}

	function changeCorner(corner: CornerData): void {
		setCorner(corner)
		root.setAttribute(RootAttributes.corner, corner)
		localStorage.setItem(LocalStorageKeys.corner, corner)
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

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (animation && isValidEnumValue(animation, AnimationData)) {
			root.setAttribute(RootAttributes.animation, animation)
			setAnimation(animation as AnimationData)
		}
	}

	function downloadFile(type: 'sass' | 'scss' | 'css'): void {
		command(Commands.downloadFile, type)
		closeMenu(menuMoreActionsRef)
	}

	function copyAll(type: 'sass' | 'scss' | 'css'): void {
		command(Commands.copyAll, type)
		closeMenu(menuMoreActionsRef)
	}

	onMount(() => {
		initTheme()
		initCorner()
		initAnimation()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const buttonMoreActions_openFileId = createUniqueId()
		const buttonMoreActions_resetInputsId = createUniqueId()
		const inputSettings_textWrapId = createUniqueId()
		const inputSettings_minifyCSSId = createUniqueId()
		const inputSettings_fontSizeId = createUniqueId()
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
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onClick={ev => {
					const button = document.activeElement! as HTMLElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button,
					)) return

					const dataset = button.dataset

					const dataTheme = dataset.theme
					if (dataTheme) return changeTheme(dataTheme as ThemeData)

					const dataCorner = dataset.corner
					if (dataCorner) return changeCorner(dataCorner as CornerData)
				}}
				onChange={ev => {
					const target = ev.target as HTMLInputElement

					switch (target.id) {
					case inputSettings_textWrapId:
						command(Commands.toggleTextWrap)
						break
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					case inputSettings_minifyCSSId:
						command(Commands.toggleMinify)
						break
					}
				}}
				onFocusOut={ev => {
					const target = ev.target as HTMLInputElement

					switch (target.id) {
					case inputSettings_fontSizeId:
						command(
							Commands.updateFontSize,
							safeNumber(target.valueAsNumber, settings().fontSize)
						)
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
					const button = document.activeElement! as HTMLElement
					if (!isTargetValidElement(
						ev.currentTarget,
						button
					)) return

					switch (button.id) {
					case buttonMoreActions_openFileId:
						closeMenu(menuMoreActionsRef)
						command(Commands.openFile, ev)
						break
					case buttonMoreActions_resetInputsId:
						closeMenu(menuMoreActionsRef)
						command(Commands.resetInputs)
						break
					default:
						const dataset = button.dataset
						const dataDonwload = dataset.download
						if (dataDonwload) {
							if (
								dataDonwload != 'sass'
								&& dataDonwload != 'scss'
								&& dataDonwload != 'css'
							) return

							return downloadFile(dataDonwload)
						}

						const dataCopy = dataset.copy
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
					c:item={<SubMenuItem
						c:iconCode={ICON_ARROW_DOWNLOAD}>
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
					c:item={<SubMenuItem
						c:iconCode={ICON_COPY}>
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