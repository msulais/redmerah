import { createSignal, createUniqueId, onMount, type VoidComponent } from "solid-js";

import Icon from "@/components/Icon";
import { IconButton } from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Menu, { close_menu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, open_menu } from "@/components/Menu";
import { open_popovercolorpicker, PopoverColorPicker } from "@/components/ColorPicker";
import CSSAnimation from '@/styles/animation.module.scss'
import CSS from './_index.module.scss'

import type { HEXColor, RGBColor } from "@/types/color";
import { storage_get, storage_set } from "@/utils/storage";
import { generate_color, hex_to_rgb, is_color_valid } from "@/utils/color";
import { attr_set } from "@/utils/attributes";
import { ExternalLinks, RoutesLinks } from "@/enums/links";
import { LocalStorageKeys } from "@/enums/storage";
import { RootAttributes } from "@/enums/attributes";
import { add_classlist_module, element_closest, get_element_by_id } from "@/utils/element";
import { ElementIds } from "@/enums/ids";
import { CornerData } from "@/enums/corner";
import { ThemeData } from "@/enums/theme";
import { timeout_clear, timeout_set } from "@/utils/timeout";
import { remove_splash_screen_on_load_every_component } from "@/scripts/splash";
import { array_includes } from "@/utils/array";
import { math_round } from "@/utils/math";
import { event_current_target } from "@/utils/event";

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
				classList={add_classlist_module(CSS.mobile_only)}
				focused={is_menu_navigation_open()}
				onClick={(ev) => open_menu(ev, menu_navigation_ref, {
					anchor: event_current_target(ev),
					padding: 0,
				})}
				code={0xE4F7}
			/>
		</Tooltip>
		<Menu
			style={{width: '164px'}}
			ref={r => menu_navigation_ref = r}
			on_toggle_open={v => set_is_menu_navigation_open(v)}>
			<MenuHeader>Navigation</MenuHeader>
			<LinkMenuItem
				href={RoutesLinks.apps}
				selected={props.route == RoutesLinks.apps}
				icon_code={0xE063}>
				Apps
			</LinkMenuItem>
			<LinkMenuItem
				href={RoutesLinks.about}
				selected={props.route == RoutesLinks.about}
				icon_code={0xE930}>
				About
			</LinkMenuItem>
			<MenuDivider />
			<LinkMenuItem
				onClick={() => close_menu(menu_navigation_ref)}
				href={ExternalLinks.donate}
				open_in_new_tab
				icon_code={0xE84B}>
				Donate
			</LinkMenuItem>
		</Menu>
	</>)
}

export const SettingsElement: VoidComponent = () => {
	const root = document.documentElement
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
		const accent_color_element = get_element_by_id(ElementIds.color_accent)!
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
				classList={add_classlist_module(CSSAnimation.btn_rotate_icon)}
				focused={is_menu_settings_open()}
				onClick={(ev) => open_menu(ev, menu_settings_ref, {
					anchor: event_current_target(ev),
					padding: 0,
				})}
				code={0xEE0F}
			/>
		</Tooltip>
		<Menu
			style={{width: '200px'}}
			ref={r => menu_settings_ref = r}
			on_toggle_open={(v) => setIs_menu_settings_open(v)}
			onClick={ev => {
				const button = element_closest(ev.target as HTMLElement, 'button')
				if (!button) return

				switch (button.id) {
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
				selected={theme() == theme_light}
				icon_code={0xF2CD}>
				Light
			</MenuItem>
			<MenuItem
				id={menuitem_themedark_id}
				selected={theme() == theme_dark}
				icon_code={0xF2B3}>
				Dark
			</MenuItem>
			<MenuItem
				id={menuitem_themesystem_id}
				selected={theme() == theme_system}
				icon_code={0xE96D}>
				System theme
			</MenuItem>
			<MenuDivider />
			<MenuHeader>Corner style</MenuHeader>
			<MenuItem
				id={menuitem_cornersharp_id}
				selected={corner() == corner_sharp}
				icon_code={0xEA99}>
				Sharp
			</MenuItem>
			<MenuItem
				id={menuitem_cornersemiround_id}
				selected={corner() == corner_semiround}
				icon_code={0xEEF7}>
				Semi round
			</MenuItem>
			<MenuItem
				id={menuitem_cornerround_id}
				selected={corner() == corner_round}
				icon_code={0xF044}>
				Round
			</MenuItem>
			<MenuItem
				id={menuitem_cornerfullround_id}
				selected={corner() == corner_fullround}
				icon_code={0xE408}>
				Full round
			</MenuItem>
			<MenuDivider/>
			<MenuHeader>Accent color</MenuHeader>
			<MenuItem
				focused={is_colorpicker_open()}
				id={menuitem_accent_id}
				leading={<Icon style={{color: color()}} filled code={0xE408}/>}>
				{color()}
			</MenuItem>
		</Menu>
		<PopoverColorPicker
			disabled_opacity_control
			disabled_action
			draggable
			on_update_color={v => change_color(v)}
			ref={r => colorpicker_ref = r}
			on_toggle_open={(v) => set_is_colorpicker_open(v)}
		/>
	</>)
}