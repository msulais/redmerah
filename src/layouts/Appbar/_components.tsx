import { createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js"

import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import Tooltip from "@/components/Tooltip"
import Menu, { close_menu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, open_menu } from "@/components/Menu"
import { open_popovercolorpicker, PopoverColorPicker } from "@/components/ColorPicker"
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

import type { HEXColor, RGBColor } from "@/types/color"
import { storage_get, storage_set } from "@/utils/storage"
import { generate_color, hex_to_rgb, is_color_valid } from "@/utils/color"
import { attr_set, classlist_module } from "@/utils/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { LocalStorageKeys } from "@/enums/storage"
import { RootAttributes } from "@/enums/attributes"
import { element_closest, element_by_id, element_id } from "@/utils/element"
import { ElementIds } from "@/enums/ids"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { remove_splash_screen_on_load_every_component } from "@/scripts/splash"
import { array_includes } from "@/utils/array"
import { math_round } from "@/utils/math"
import { event_current_target, event_target } from "@/utils/event"
import { document_root } from "@/utils/document"
import { ICON_APPS, ICON_CIRCLE, ICON_COMPASS_NORTHWEST, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_MAXIMIZE, ICON_SETTINGS, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"

type NavigationMenuProps = {
	route?: RoutesLinks
}

export const NavigationMenu: VoidComponent<NavigationMenuProps> = (props) => {
	const [is_menu_navigation_open, set_is_menu_navigation_open] = createSignal<boolean>(false)
	let menu_navigation_ref: HTMLDialogElement

	onMount(() => remove_splash_screen_on_load_every_component())

	return (<>
		<Tooltip>
			<IconButton
				data-tooltip="Open navigation menu"
				classList={classlist_module(CSS.mobile_only)}
				c_focused={is_menu_navigation_open()}
				onClick={(ev) => open_menu(ev, menu_navigation_ref, {
					anchor: event_current_target(ev),
					padding: 0,
				})}
				c_code={ICON_COMPASS_NORTHWEST}
			/>
		</Tooltip>
		<Menu
			style={{width: '164px'}}
			ref={r => menu_navigation_ref = r}
			c_on_toggleopen={v => set_is_menu_navigation_open(v)}>
			<MenuHeader>Navigation</MenuHeader>
			<LinkMenuItem
				href={RoutesLinks.apps}
				c_selected={props.route == RoutesLinks.apps}
				c_icon_code={ICON_APPS}>
				Apps
			</LinkMenuItem>
			<LinkMenuItem
				href={RoutesLinks.about}
				c_selected={props.route == RoutesLinks.about}
				c_icon_code={ICON_INFO}>
				About
			</LinkMenuItem>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => close_menu(menu_navigation_ref)}
				href={ExternalLinks.donate}
				c_new_tab
				c_icon_code={ICON_GIFT}>
				Donate
			</LinkMenuItem>
		</Menu>
	</>)
}

export const SettingsElement: VoidComponent = () => {
	const root = document_root()
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round
	const menuitem_themelight_id = createUniqueId()
	const menuitem_themedark_id = createUniqueId()
	const menuitem_themesystem_id = createUniqueId()
	const menuitem_cornersharp_id = createUniqueId()
	const menuitem_cornersemiround_id = createUniqueId()
	const menuitem_cornerround_id = createUniqueId()
	const menuitem_cornerfullround_id = createUniqueId()
	const menuitem_accent_id = createUniqueId()
	const [color, set_color] = createSignal<HEXColor>('#FF0000')
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
	const [is_colorpicker_open, set_is_colorpicker_open] = createSignal<boolean>(false)
	let menu_settings_ref: HTMLDialogElement
	let colorpicker_ref: HTMLDivElement
	let timeout_color_id: number | null = null

	function change_theme(theme: ThemeData): void {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_menu(menu_settings_ref)
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && array_includes([theme_system, theme_light, theme_dark], theme as ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([corner_sharp, corner_semiround, corner_round, corner_fullround], corner as CornerData)) {
			attr_set(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	function rgb_to_css(rgb: RGBColor): string {
		return `${math_round(rgb.r * 0xff)}, ${math_round(rgb.g * 0xff)}, ${math_round(rgb.b * 0xff)}`
	}

	function change_color(color: HEXColor): void {
		set_color(color)
		const acc = generate_color(color)
		const accent_color_element = element_by_id(ElementIds.color_accent)!
		accent_color_element.innerHTML = `:root{--g-color-accent-light: ${rgb_to_css(hex_to_rgb(acc.color))};--g-color-accent-dark: ${rgb_to_css(hex_to_rgb(acc.color_dark))};--g-color-on-accent-light: ${rgb_to_css(hex_to_rgb(acc.on_color))};--g-color-on-accent-dark: ${rgb_to_css(hex_to_rgb(acc.on_color_dark))};}`;

		if (timeout_color_id != null) timeout_clear(timeout_color_id)
		timeout_color_id = timeout_set(() => {
			storage_set(LocalStorageKeys.color, color)
			timeout_color_id = null
		}, 100)
		close_menu(menu_settings_ref)
	}

	function init_color(): void {
		const color = storage_get(LocalStorageKeys.color)
		if (!is_color_valid(color ?? '')) return;

		change_color(color as HEXColor)
	}

	onMount(() => {
		init_theme()
		init_corner()
		init_color()
		remove_splash_screen_on_load_every_component()
	})

	return (<>
		<Tooltip>
			<IconButton
				data-tooltip="Open settings"
				classList={classlist_module(CSSAnimation.btn_rotate_icon)}
				c_focused={is_menu_settings_open()}
				onClick={(ev) => open_menu(ev, menu_settings_ref, {
					anchor: event_current_target(ev),
					padding: 0,
				})}
				c_code={ICON_SETTINGS}
			/>
		</Tooltip>
		<Menu
			style={{width: '200px'}}
			ref={r => menu_settings_ref = r}
			c_on_toggleopen={(v) => setIs_menu_settings_open(v)}
			onClick={ev => {
				const button = element_closest(event_target(ev) as HTMLElement, 'button')
				if (!button) return

				switch (element_id(button)) {
					case menuitem_themelight_id: change_theme(theme_light); break
					case menuitem_themedark_id: change_theme(theme_dark); break
					case menuitem_themesystem_id: change_theme(theme_system); break

					case menuitem_cornersharp_id: change_corner(corner_sharp); break
					case menuitem_cornersemiround_id: change_corner(corner_semiround); break
					case menuitem_cornerround_id: change_corner(corner_round); break
					case menuitem_cornerfullround_id: change_corner(corner_fullround); break

					case menuitem_accent_id: {
						close_menu(menu_settings_ref)
						open_popovercolorpicker(ev, colorpicker_ref, {
							color: color(),
						})
						break
					}
				}
			}}>
			<MenuHeader>Theme</MenuHeader>
			<MenuItem
				id={menuitem_themelight_id}
				c_selected={theme() == theme_light}
				c_icon_code={ICON_WEATHER_SUNNY}>
				Light
			</MenuItem>
			<MenuItem
				id={menuitem_themedark_id}
				c_selected={theme() == theme_dark}
				c_icon_code={ICON_WEATHER_MOON}>
				Dark
			</MenuItem>
			<MenuItem
				id={menuitem_themesystem_id}
				c_selected={theme() == theme_system}
				c_icon_code={ICON_LAPTOP_SETTINGS}>
				System theme
			</MenuItem>
			<MenuDivider />
			<MenuHeader>Corner style</MenuHeader>
			<MenuItem
				id={menuitem_cornersharp_id}
				c_selected={corner() == corner_sharp}
				c_icon_code={ICON_MAXIMIZE}>
				Sharp
			</MenuItem>
			<MenuItem
				id={menuitem_cornersemiround_id}
				c_selected={corner() == corner_semiround}
				c_icon_code={ICON_SQUARE}>
				Semi round
			</MenuItem>
			<MenuItem
				id={menuitem_cornerround_id}
				c_selected={corner() == corner_round}
				c_icon_code={ICON_TEARDROP_BOTTOM_RIGHT}>
				Round
			</MenuItem>
			<MenuItem
				id={menuitem_cornerfullround_id}
				c_selected={corner() == corner_fullround}
				c_icon_code={ICON_CIRCLE}>
				Full round
			</MenuItem>
			<MenuDivider/>
			<MenuHeader>Accent color</MenuHeader>
			<MenuItem
				c_focused={is_colorpicker_open()}
				id={menuitem_accent_id}
				c_leading={<Icon style={{color: color()}} c_filled c_code={ICON_CIRCLE}/>}>
				{color()}
			</MenuItem>
		</Menu>
		<PopoverColorPicker
			c_disabled_opacity_control
			c_disabled_action
			c_draggable
			c_on_update_color={v => change_color(v)}
			ref={r => colorpicker_ref = r}
			c_on_toggleopen={(v) => set_is_colorpicker_open(v)}
		/>
	</>)
}