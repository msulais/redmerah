import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { attrSet } from "@/utils/attributes"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { urlEncode, urlOrigin } from "@/utils/url"
import { documentActive, documentRoot } from "@/utils/document"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { numberSafe } from "@/utils/number"
import { AnimationData } from "@/enums/animation"
import { APP_QR_CODE as app } from "@/constants/apps"
import { validEnumValue } from "@/utils/object"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { ICON_APPS, ICON_ARROW_DOWNLOAD, ICON_CHAT, ICON_CIRCLE, ICON_COPY, ICON_ERROR_CIRCLE_SETTINGS, ICON_GIFT, ICON_IMAGE, ICON_IMAGE_CIRCLE, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_MORE_VERTICAL, ICON_NUMBER_ROW, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TRANSLATE, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { MenuDivider, MenuItem, MenuHeader, openMenu, LinkMenuItem, SubMenu, closeMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import ColorPicker, { ColorPickerPosition, openColorPicker } from "@/components/ColorPicker"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
	isGenerateError: boolean
	page: Pages
}> = (props) => {
	const root = documentRoot()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isMenuMoreActionsOpen, setIsMenuMoreActionsOpen] = createSignal<boolean>(false)
	const [isColorPickerColorOpen, setIsColorPickerColorOpen] = createSignal<boolean>(false)
	const [isColorPickerBackgroundColorOpen, setIsColorPickerBackgroundColorOpen] = createSignal<boolean>(false)
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	const buttonAppBar_infoId = createUniqueId()
	const buttonAppBar_settingsId = createUniqueId()
	const buttonAppBar_moreActionsId = createUniqueId()
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let menuMoreActionsRef: HTMLDialogElement
	let colorPickerColorRef: HTMLDialogElement
	let colorPickerBackgroundColorRef: HTMLDialogElement

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
		attrSet(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		attrSet(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function updateEncodingMode(mode: EncodingMode): void {
		command(Commands.updateSettingsEncodingMode, mode)
		closeMenu(menuSettingsRef)
	}

	function updateErrorCorrectionlevel(level: ErrorCorrectionLevel): void {
		command(Commands.updateSettingsErrorCorrectionLevel, level)
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
		const inputSettings_marginId = createUniqueId()
		const inputSettings_versionId = createUniqueId()
		const inputSettings_autoVersionId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		const buttonInfo_shareId = createUniqueId()
		const buttonSettings_colorId = createUniqueId()
		const buttonSettings_backgroundColorId = createUniqueId()
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
						el => {
							const tagname = elementTagName(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (elementId(button)) {
					case buttonSettings_colorId:
						openColorPicker(colorPickerColorRef, {
							anchor: button,
							position: ColorPickerPosition.leftCenterToBottom,
							padding: 12,
							gap: -4
						})
						break
					case buttonSettings_backgroundColorId:
						openColorPicker(colorPickerBackgroundColorRef, {
							anchor: button,
							position: ColorPickerPosition.leftCenterToBottom,
							padding: 12,
							gap: -4
						})
						break
					default:
						const dataTheme = elementDataset(button, 'theme')
						if (dataTheme
							&& validEnumValue(dataTheme, ThemeData)
						) return updateTheme(dataTheme as ThemeData)

						const dataCorner = elementDataset(button, 'corner')
						if (dataCorner
							&& validEnumValue(dataCorner, CornerData)
						) return updateCorner(dataCorner as CornerData)

						const dataEcl = elementDataset(button, 'ecl')
						if (dataEcl
							&& validEnumValue(dataEcl, ErrorCorrectionLevel)
						) return updateErrorCorrectionlevel(dataEcl as ErrorCorrectionLevel)

						const dataEncoding = elementDataset(button, 'encoding')
						if (dataEncoding
							&& validEnumValue(dataEncoding, EncodingMode)
						) return updateEncodingMode(dataEncoding as EncodingMode)
					}
				}}
				onFocusOut={ev => {
					const target = eventTarget(ev) as HTMLInputElement
					switch (elementId(target)) {
					case inputSettings_marginId:
						command(
							Commands.updateSettingsMargin,
							numberSafe(target.valueAsNumber, settings().margin)
						)
						break
					case inputSettings_versionId:
						command(
							Commands.updateSettingsVersion,
							numberSafe(target.valueAsNumber, settings().version ?? 1)
						)
						break
					}
				}}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement
					switch (elementId(target)) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					case inputSettings_autoVersionId:
						command(
							Commands.updateSettingsVersion,
							target.checked? null : 1
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
				<Show when={props.page == Pages.generate}>
					<MenuDivider/>
					<MenuHeader>QR Code generator</MenuHeader>
					<SubMenu
						c:item={<SubMenuItem
							c:iconCode={ICON_ERROR_CIRCLE_SETTINGS}>
							Error correction level
						</SubMenuItem>}>
						<MenuItem
							c:trailing="~7%"
							data-ecl={ErrorCorrectionLevel.low}
							c:selected={settings().errorCorrectionLevel == ErrorCorrectionLevel.low}>
							Low
						</MenuItem>
						<MenuItem
							c:trailing="~15%"
							data-ecl={ErrorCorrectionLevel.medium}
							c:selected={settings().errorCorrectionLevel == ErrorCorrectionLevel.medium}>
							Medium
						</MenuItem>
						<MenuItem
							c:trailing="~25%"
							data-ecl={ErrorCorrectionLevel.quartile}
							c:selected={settings().errorCorrectionLevel == ErrorCorrectionLevel.quartile}>
							Quartile
						</MenuItem>
						<MenuItem
							c:trailing="~30%"
							data-ecl={ErrorCorrectionLevel.high}
							c:selected={settings().errorCorrectionLevel == ErrorCorrectionLevel.high}>
							High
						</MenuItem>
					</SubMenu>
					<SubMenu
						c:item={<SubMenuItem
							c:iconCode={ICON_TRANSLATE}>
							Encoding mode
						</SubMenuItem>}>
						<MenuItem
							data-encoding={EncodingMode.auto}
							c:selected={settings().encodingMode == EncodingMode.auto}>
							Auto
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.alphanumeric}
							c:selected={settings().encodingMode == EncodingMode.alphanumeric}>
							Alphanumeric
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.byte}
							c:selected={settings().encodingMode == EncodingMode.byte}>
							Byte
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.kanji}
							c:selected={settings().encodingMode == EncodingMode.kanji}>
							Kanji
						</MenuItem>
						<MenuItem
							data-encoding={EncodingMode.numeric}
							c:selected={settings().encodingMode == EncodingMode.numeric}>
							Numeric
						</MenuItem>
					</SubMenu>
					<MenuItem
						id={buttonSettings_colorId}
						c:leading={<Icon
							c:filled
							style={{
								color: settings().color,
								"border-radius": '999px',
								border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
							}}
							c:code={ICON_CIRCLE}
						/>}
						c:focused={isColorPickerColorOpen()}>
						Color
					</MenuItem>
					<MenuItem
						id={buttonSettings_backgroundColorId}
						c:leading={<Icon
							c:filled
							style={{
								color: settings().backgroundColor,
								"border-radius": '999px',
								border: '1px solid rgba(var(--g-color-on-surface), var(--g-opacity-border))'
							}}
							c:code={ICON_CIRCLE}
						/>}
						c:focused={isColorPickerBackgroundColorOpen()}>
						Background color
					</MenuItem>
					<Tooltip>
						<div style={{padding: '4px 12px'}}>
							<NumberTextField
								c:label="Margin"
								min={0}
								value={settings().margin}
								c:integerOnly
								id={inputSettings_marginId}
							/>
						</div>
						<MenuDivider/>
						<MenuHeader>QR Code version</MenuHeader>
						<SwitchMenuItem
							c:iconCode={ICON_NUMBER_ROW}
							c:checked={settings().version == null}
							c:attrSwitch={{
								id: inputSettings_autoVersionId,
							}}>
							Auto version
						</SwitchMenuItem>
						<div style={{padding: '4px 12px 8px 12px'}}>
							<NumberTextField
								disabled={settings().version == null}
								c:label="Version"
								min={1}
								max={40}
								id={inputSettings_versionId}
								c:integerOnly
								value={settings().version ?? 1}
							/>
						</div>
					</Tooltip>
				</Show>
			</Menu>
			<Menu
				ref={r => menuMoreActionsRef = r}
				c:onToggleOpen={v => setIsMenuMoreActionsOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataDownload = elementDataset(button, 'download')
					if (dataDownload
						&& validEnumValue(dataDownload, DownloadFileType)
					) {
						command(Commands.downloadQRCode, dataDownload as DownloadFileType)
						closeMenu(menuMoreActionsRef)
						return
					}

					const dataCopy = elementDataset(button, 'copy')
					if (dataCopy
						&& validEnumValue(dataCopy, CopyFileType)
					) {
						command(Commands.copyQRCode, dataCopy as CopyFileType)
						closeMenu(menuMoreActionsRef)
						return
					}
				}}>
				<SubMenu
					style={{width: '172px'}}
					c:item={<SubMenuItem
						c:iconCode={ICON_ARROW_DOWNLOAD}>
						Download as
					</SubMenuItem>}>
					<MenuItem
						c:iconCode={ICON_IMAGE}
						data-download={DownloadFileType.png}
						c:trailing="PNG">
						Image
					</MenuItem>
					<MenuItem
						c:iconCode={ICON_IMAGE}
						data-download={DownloadFileType.jpeg}
						c:trailing="JPEG">
						Image
					</MenuItem>
					<MenuItem
						c:iconCode={ICON_IMAGE_CIRCLE}
						data-download={DownloadFileType.svg}
						c:trailing="SVG">
						Vector
					</MenuItem>
				</SubMenu>
				<SubMenu
					style={{width: '172px'}}
					c:item={<SubMenuItem
						c:iconCode={ICON_COPY}>
						Copy as
					</SubMenuItem>}>
					<MenuItem
						c:iconCode={ICON_IMAGE}
						data-copy={CopyFileType.png}
						c:trailing="PNG">
						Image
					</MenuItem>
					<MenuItem
						c:iconCode={ICON_IMAGE_CIRCLE}
						data-copy={CopyFileType.svg}
						c:trailing="SVG">
						Vector
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	const ColorPickers: VoidComponent = () => (<>
		<ColorPicker
			ref={r => colorPickerColorRef = r}
			c:color={settings().color}
			c:onToggleOpen={isOpen => setIsColorPickerColorOpen(isOpen)}
			c:onSelectColor={color => command(Commands.updateSettingsColor, color)}
		/>
		<ColorPicker
			ref={r => colorPickerBackgroundColorRef = r}
			c:color={settings().backgroundColor}
			c:onToggleOpen={isOpen => setIsColorPickerBackgroundColorOpen(isOpen)}
			c:onSelectColor={color => command(Commands.updateSettingsBackgroundColor, color)}
		/>
	</>)

	return (<>
		<AppBar
			c:leading={<img alt="QR Code logo" width={32} src={app.logoUrl} />}
			c:headline="QR Code"
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonAppBar_infoId:
					openMenu(menuInfoRef, {anchor: button})
					break
				case buttonAppBar_settingsId:
					openMenu(menuSettingsRef, {anchor: button})
					break
				case buttonAppBar_moreActionsId:
					openMenu(menuMoreActionsRef, {anchor: button})
					break
				}
			}}
			c:trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					c:focused={isMenuInfoOpen()}
					c:code={ICON_INFO}
					id={buttonAppBar_infoId}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					c:focused={isMenuSettingsOpen()}
					c:code={ICON_SETTINGS}
					id={buttonAppBar_settingsId}
				/>
				<Show when={!props.isGenerateError && props.page == Pages.generate}>
					<IconButton
						data-tooltip="More actions"
						c:focused={isMenuMoreActionsOpen()}
						c:code={ICON_MORE_VERTICAL}
						id={buttonAppBar_moreActionsId}
					/>
				</Show>
			</Tooltip>}
		/>
		<Menus />
		<ColorPickers/>
	</>)
}

export default _