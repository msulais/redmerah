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
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { APP_COLOR_GENERATOR as app } from "@/constants/apps"
import { documentActive, documentRoot } from "@/utils/document"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COPY, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_BULLET_LIST_ADD, ICON_TEXT_BULLET_LIST_SQUARE, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import { AnimationData } from "@/enums/animation"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import {Tooltip} from "@/components/Tooltip"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Menu, { SubMenu, MenuItem, MenuDivider, LinkMenuItem, MenuHeader, closeMenu, openMenu, SubMenuItem, MenuIndent, SwitchMenuItem } from "@/components/Menu"
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
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [timeId, setTimeId] = createSignal<number | null>(null)
	const [timeCopyId, setTimeCopyId] = createSignal<number | null>(null)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const palette = createMemo(() => props.palette)
	let menuSettingsRef: HTMLDialogElement

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
		closeMenu(menuSettingsRef)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		attrSet(root, RootAttributes.animation, animation)
		storageSet(LocalStorageKeys.animation, animation)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		attrSet(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
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
		const buttonSettings_shareId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					}
				}}
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