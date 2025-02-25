import { createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import Tooltip from "@/components/Tooltip"
import Menu, { closeMenu, MenuDivider, MenuHeader, MenuItem, openMenu } from "@/components/Menu"
import { openPopoverColorPicker, PopoverColorPicker } from "@/components/ColorPicker"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

import type { HEXColor, RGBColor } from "@/types/color"
import { storageGet, storageSet } from "@/utils/storage"
import { colorGeneratePalette, colorHexToRgb, colorIsValid } from "@/utils/color"
import { attrSet, attrClassListModule } from "@/utils/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { RootAttributes } from "@/enums/attributes"
import { elementClosest, elementById, elementId, elementDataset } from "@/utils/element"
import { ElementIds } from "@/enums/ids"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { tryRemoveSplashScreen } from "@/utils/splash"
import { mathRound } from "@/utils/math"
import { eventCurrentTarget, eventTarget } from "@/utils/event"
import { documentRoot } from "@/utils/document"
import { ICON_APPS, ICON_CIRCLE, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_RECEIPT, ICON_SETTINGS, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_VIDEO_CLIP, ICON_VIDEO_CLIP_OFF, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import Drawer, { closeDrawer, LinkDrawerItem, openDrawer } from "@/components/Drawer"
import { validEnumValue } from "@/utils/object"
import { AnimationData } from "@/enums/animation"

type NavigationDrawerProps = {
	route?: RoutesLinks
}

export const NavigationDrawer: VoidComponent<NavigationDrawerProps> = (props) => {
	const [isDrawerOpen, setIsDrawerOpen] = createSignal<boolean>(false)
	let drawerRef: HTMLDialogElement

	onMount(() => tryRemoveSplashScreen())

	return (<>
		<Tooltip>
			<IconButton
				data-tooltip="Open navigation"
				classList={attrClassListModule(CSS.mobile_only)}
				c:focused={isDrawerOpen()}
				onClick={() => openDrawer(drawerRef)}
				c:code={ICON_LINE_HORIZONTAL_3}
			/>
		</Tooltip>
		<Drawer
			ref={r => drawerRef = r}
			c:onToggleOpen={v => setIsDrawerOpen(v)}
			c:header={<Tooltip>
				<IconButton
					data-tooltip="Close navigation"
					classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
					c:code={ICON_LINE_HORIZONTAL_3}
					onClick={() => closeDrawer(drawerRef)}
				/>
			</Tooltip>}
			c:footer={<Tooltip>
				<LinkDrawerItem
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkDrawerItem>
				<LinkDrawerItem
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}>
					Terms & conditions
				</LinkDrawerItem>
			</Tooltip>}>
			<LinkDrawerItem
				href={RoutesLinks.apps}
				c:selected={props.route == RoutesLinks.apps}
				c:iconCode={ICON_APPS}>
				Apps
			</LinkDrawerItem>
			<LinkDrawerItem
				href={RoutesLinks.about}
				c:selected={props.route == RoutesLinks.about}
				c:iconCode={ICON_INFO}>
				About
			</LinkDrawerItem>
			<LinkDrawerItem
				onClick={() => closeDrawer(drawerRef)}
				href={ExternalLinks.donate}
				c:newTab
				c:iconCode={ICON_GIFT}>
				Donate
			</LinkDrawerItem>
		</Drawer>
	</>)
}

export const SettingsElement: VoidComponent = () => {
	const root = documentRoot()
	const menuItemAccentId = createUniqueId()
	const [color, setColor] = createSignal<HEXColor>('#FF0000')
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isColorPickerOpen, setIsColorPickerOpen] = createSignal<boolean>(false)
	let menuSettingsRef: HTMLDialogElement
	let colorPickerRef: HTMLDivElement
	let timeColorId: number | null = null

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
		closeMenu(menuSettingsRef)
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

	function rgbToCSS(rgb: RGBColor): string {
		return `${mathRound(rgb.r * 0xff)}, ${mathRound(rgb.g * 0xff)}, ${mathRound(rgb.b * 0xff)}`
	}

	function updateColor(color: HEXColor): void {
		setColor(color)
		const acc = colorGeneratePalette(color)
		const accentColorElement = elementById(ElementIds.colorAccent)!
		accentColorElement.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(colorHexToRgb(acc.color))};--g-color-accent-dark: ${rgbToCSS(colorHexToRgb(acc.colorDark))};--g-color-on-accent-light: ${rgbToCSS(colorHexToRgb(acc.onColor))};--g-color-on-accent-dark: ${rgbToCSS(colorHexToRgb(acc.onColorDark))};}`;

		if (timeColorId != null) timeTimerClear(timeColorId)
		timeColorId = timeTimerSet(() => {
			storageSet(LocalStorageKeys.color, color)
			timeColorId = null
		}, 100)
		closeMenu(menuSettingsRef)
	}

	function initColor(): void {
		const color = storageGet(LocalStorageKeys.color)
		if (!colorIsValid(color ?? '')) return;

		updateColor(color as HEXColor)
	}

	onMount(() => {
		initAnimation()
		initTheme()
		initCorner()
		initColor()
		tryRemoveSplashScreen()
	})

	return (<>
		<Tooltip>
			<IconButton
				data-tooltip="Open settings"
				classList={attrClassListModule(CSSAnimation.btn_rotate_icon)}
				c:focused={isMenuSettingsOpen()}
				onClick={(ev) => openMenu(menuSettingsRef, {
					anchor: eventCurrentTarget(ev),
					padding: 0,
				})}
				c:code={ICON_SETTINGS}
			/>
		</Tooltip>
		<Menu
			style={{width: '200px'}}
			ref={r => menuSettingsRef = r}
			c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
			onClick={ev => {
				const button = elementClosest(eventTarget(ev) as HTMLElement, 'button')
				if (!button) return

				switch (elementId(button)) {
				case menuItemAccentId:
					closeMenu(menuSettingsRef)
					openPopoverColorPicker(colorPickerRef, {
						color: color(),
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

					const dataAnimation = elementDataset(button, 'animation')
					if (dataAnimation
						&& validEnumValue(dataAnimation, AnimationData)
					) return updateAnimation(dataAnimation as AnimationData)
				}
			}}>
			<MenuHeader>Theme</MenuHeader>
			<MenuItem
				data-theme={ThemeData.light}
				c:selected={theme() == ThemeData.light}
				c:iconCode={ICON_WEATHER_SUNNY}>
				Light
			</MenuItem>
			<MenuItem
				data-theme={ThemeData.dark}
				c:selected={theme() == ThemeData.dark}
				c:iconCode={ICON_WEATHER_MOON}>
				Dark
			</MenuItem>
			<MenuItem
				data-theme={ThemeData.system}
				c:selected={theme() == ThemeData.system}
				c:iconCode={ICON_LAPTOP_SETTINGS}>
				System theme
			</MenuItem>
			<MenuDivider />
			<MenuHeader>Corner style</MenuHeader>
			<MenuItem
				data-corner={CornerData.sharp}
				c:selected={corner() == CornerData.sharp}
				c:iconCode={ICON_MAXIMIZE}>
				Sharp
			</MenuItem>
			<MenuItem
				data-corner={CornerData.semiRound}
				c:selected={corner() == CornerData.semiRound}
				c:iconCode={ICON_SQUARE}>
				Semi round
			</MenuItem>
			<MenuItem
				data-corner={CornerData.round}
				c:selected={corner() == CornerData.round}
				c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}>
				Round
			</MenuItem>
			<MenuItem
				data-corner={CornerData.fullRound}
				c:selected={corner() == CornerData.fullRound}
				c:iconCode={ICON_CIRCLE}>
				Full round
			</MenuItem>
			<MenuDivider />
			<MenuHeader>Animation</MenuHeader>
			<MenuItem
				data-animation={AnimationData.on}
				c:selected={animation() === AnimationData.on}
				c:iconCode={ICON_VIDEO_CLIP}>
				On
			</MenuItem>
			<MenuItem
				data-animation={AnimationData.off}
				c:selected={animation() === AnimationData.off}
				c:iconCode={ICON_VIDEO_CLIP_OFF}>
				Off
			</MenuItem>
			<MenuDivider/>
			<MenuHeader>Accent color</MenuHeader>
			<MenuItem
				c:focused={isColorPickerOpen()}
				id={menuItemAccentId}
				c:leading={<Icon style={{color: color()}} c:filled c:code={ICON_CIRCLE}/>}>
				{color()}
			</MenuItem>
		</Menu>
		<PopoverColorPicker
			c:disabledOpacityControl
			c:disabledAction
			c:draggable
			c:onUpdateColor={v => updateColor(v)}
			ref={r => colorPickerRef = r}
			c:onToggleOpen={(v) => setIsColorPickerOpen(v)}
		/>
	</>)
}