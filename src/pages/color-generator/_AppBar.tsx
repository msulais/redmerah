import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { storageSet, storageGet } from "@/utils/storage"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { dateYear } from "@/utils/datetime"
import { urlEncode, urlOrigin } from "@/utils/url"
import { promiseDone, validEnumValue } from "@/utils/object"
import { navigatorClipboardWriteText, navigatorShare } from "@/utils/navigator"
import { arrayJoin, arrayLength } from "@/utils/array"
import { attrSet, attrClassListModule } from "@/utils/attributes"
import { eventCurrentTarget } from "@/utils/event"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { APP_COLOR_GENERATOR as app } from "@/constants/apps"
import { documentActive, documentRoot } from "@/utils/document"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COPY, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_BULLET_LIST_ADD, ICON_TEXT_BULLET_LIST_SQUARE, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Menu, { SubMenu, MenuItem, MenuDivider, LinkMenuItem, MenuHeader, closeMenu, closeSubMenu, openMenu, SubMenuItem, MenuIndent } from "@/components/Menu"
import { openDialog } from "@/components/Dialog"
import { openColorPicker } from "@/components/ColorPicker"
import AppBar from "@/components/AppBar"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	onAddColor: () => unknown
	palette: Palette
	onColorChange: (color: HEXColor) => unknown
	paletteList: Palette[]
	colorPickerRef: HTMLDialogElement
	dialogColorListRef: HTMLDialogElement
	seed: string
}> = (props) => {
	const root = documentRoot()
	const buttonColorListId = createUniqueId()
	const buttonSelectColorId = createUniqueId()
	const buttonColorToListId = createUniqueId()
	const buttonCopyAllId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [timeId, setTimeId] = createSignal<number | null>(null)
	const [timeCopyId, setTimeCopyId] = createSignal<number | null>(null)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const palette = createMemo(() => props.palette)
	let menuSettingsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement

	function copyAll(): void {
		if (timeCopyId() != null) {
			timeTimerClear(timeCopyId()!)
			setTimeCopyId(null)
		}
		promiseDone(
			navigatorClipboardWriteText(arrayJoin([
				'--seed: ' + palette().seed,
				'--accent-light: ' + palette().accentLight,
				'--on-accent-light: ' + palette().onAccentLight,
				'--accent-dark: ' + palette().accentDark,
				'--on-accent-dark: ' + palette().onAccentDark,
			], ';\n') + ';'),
			() => setTimeCopyId(timeTimerSet(() => setTimeCopyId(null), 2000))
		)
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

	onMount(() => {
		initTheme()
		initCorner()
	})

	const Menus: VoidComponent = () => {
		const buttonSettings_shareId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
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
					case buttonSettings_shareId:
						navigatorShare({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: urlOrigin() + app.link
						})
						closeMenu(menuSettingsRef)
						break
					default:
						const data_theme = elementDataset(button, 'theme')
						if (data_theme
							&& validEnumValue(data_theme, ThemeData)
						) return updateTheme(data_theme as ThemeData)

						const data_corner = elementDataset(button, 'corner')
						if (data_corner
							&& validEnumValue(data_corner, CornerData)
						) return updateCorner(data_corner as CornerData)
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
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.home}
					c:leading={<img src={logoRedmerah.src} width={16} alt='Redmerah logo'/>}
					c:trailing={<MenuIndent />}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c:iconCode={ICON_APPS}
					c:trailing={<MenuIndent />}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c:iconCode={ICON_INFO}
					c:trailing={<MenuIndent />}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}
					c:trailing={<MenuIndent />}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}
					c:trailing={<MenuIndent />}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={buttonSettings_shareId}
					c:iconCode={ICON_SHARE_ANDROID}
					c:trailing={<MenuIndent />}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + urlEncode('Tasks')}
					c:iconCode={ICON_CHAT}
					c:trailing={<MenuIndent />}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}
					c:trailing={<MenuIndent />}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {dateYear(new Date())} Redmerah</MenuHeader>
			</Menu>
		</>)
	}

	return (<>
		<Tooltip>
			<AppBar
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case buttonColorListId:
						openDialog(props.dialogColorListRef)
						break
					case buttonSelectColorId:
						openColorPicker(props.colorPickerRef, {
							anchor: button,
							color: props.seed as HEXColor
						})
						break
					case buttonColorToListId:
						if (timeId()) {
							timeTimerClear(timeId()!)
							setTimeId(null)
						}
						props.onAddColor()
						setTimeId(timeTimerSet(() => setTimeId(null), 1000))
						break
					case buttonCopyAllId:
						copyAll()
						break
					case buttonSettingsId:
						openMenu(menuSettingsRef, { anchor: button })
						break
					}
				}}
				c:leading={<>
					<Show when={arrayLength(props.paletteList) > 0}>
						<IconButton
							id={buttonColorListId}
							data-tooltip="Color list"
							c:code={ICON_TEXT_BULLET_LIST_SQUARE}
						/>
					</Show>
					<img width={32} src={app.logoUrl} alt={app.name} />
				</>}
				c:headline={app.name}
				c:trailing={<>
					<Button
						data-tooltip="Select color"
						id={buttonSelectColorId}
						classList={attrClassListModule(CSS.appbar_select_color)}
						c:variant={ButtonVariant.filled}>
						{props.seed}
					</Button>
					<IconButton
						data-tooltip="Add color to list"
						id={buttonColorToListId}
						c:code={timeId()? ICON_CHECKMARK : ICON_TEXT_BULLET_LIST_ADD}
					/>
					<IconButton
						data-tooltip="Copy all"
						id={buttonCopyAllId}
						c:code={timeCopyId()? ICON_CHECKMARK : ICON_COPY}
					/>
					<IconButton
						data-tooltip="Open settings"
						id={buttonSettingsId}
						classList={attrClassListModule(CSSAnimation.btn_rotate_icon)}
						c:focused={isMenuSettingsOpen()}
						c:code={ICON_SETTINGS}
					/>
				</>}
			/>
		</Tooltip>
		<Menus />
	</>)
}

export default _