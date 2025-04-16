import { createMemo, createSignal, createUniqueId, onMount, Show, type VoidComponent } from "solid-js"

import type { HEXColor } from "@/types/color"
import type { Palette } from "./_types"
import { RootAttributes } from "@/enums/attributes"
import { CornerData } from "@/enums/corner"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { validEnumValue } from "@/utils/object"
import { attrClassListModule } from "@/utils/attributes"
import { APP_COLOR_GENERATOR as app } from "@/constants/apps"
import { elementValidTarget } from "@/utils/element"
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
	const root = document.documentElement
	const buttonColorListId = createUniqueId()
	const buttonSelectColorId = createUniqueId()
	const buttonColorToListId = createUniqueId()
	const buttonCopyAllId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [timeId, setTimeId] = createSignal<number | NodeJS.Timeout | null>(null)
	const [timeCopyId, setTimeCopyId] = createSignal<number | NodeJS.Timeout | null>(null)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const palette = createMemo(() => props.palette)
	let menuSettingsRef: HTMLDialogElement

	function copyAll(): void {
		if (timeCopyId() != null) {
			clearTimeout(timeCopyId()!)
			setTimeCopyId(null)
		}
		navigator.clipboard.writeText([
			'--seed: ' + palette().seed,
			'--accent-light: ' + palette().accentLight,
			'--on-accent-light: ' + palette().onAccentLight,
			'--accent-dark: ' + palette().accentDark,
			'--on-accent-dark: ' + palette().onAccentDark,
		].join(';\n') + ';')
		.then(() => setTimeCopyId(setTimeout(() => setTimeCopyId(null), 2000)))
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		root.setAttribute(RootAttributes.theme, theme)
		localStorage.setItem(LocalStorageKeys.platformTheme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		root.setAttribute(RootAttributes.animation, animation)
		localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		root.setAttribute(RootAttributes.corner, corner)
		localStorage.setItem(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (theme && validEnumValue(theme, ThemeData)) {
			root.setAttribute(RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = localStorage.getItem(LocalStorageKeys.corner)
		if (corner && validEnumValue(corner, CornerData)) {
			root.setAttribute(RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (animation && validEnumValue(animation, AnimationData)) {
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
		const buttonSettings_shareId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		return (<>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onChange={ev => {
					const target = ev.target as HTMLInputElement

					switch (target.id) {
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
						break
					}
				}}
				onClick={(ev) => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonSettings_shareId:
						navigator.share({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: document.location.origin + app.link
						})
						closeMenu(menuSettingsRef)
						break
					default:
						const dataset = button.dataset
						const dataTheme = dataset.theme
						if (dataTheme
							&& validEnumValue(dataTheme, ThemeData)
						) return updateTheme(dataTheme as ThemeData)

						const dataCorner = dataset.corner
						if (dataCorner
							&& validEnumValue(dataCorner, CornerData)
						) return updateCorner(dataCorner as CornerData)
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
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURI('Tasks')}
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
				<MenuHeader>&copy; {new Date().getFullYear()} Redmerah</MenuHeader>
			</Menu>
		</>)
	}

	return (<>
		<Tooltip>
			<AppBar
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
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
							clearTimeout(timeId()!)
							setTimeId(null)
						}
						props.onAddColor()
						setTimeId(setTimeout(() => setTimeId(null), 1000))
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
					<Show when={props.paletteList.length > 0}>
						<IconButton
							id={buttonColorListId}
							data-tooltip="Color list"
							c:code={ICON_TEXT_BULLET_LIST_SQUARE}
						/>
					</Show>
					<img width={32} src={app.logoUrl} alt={app.name + ' logo'} />
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