import { createSignal, onMount, type VoidComponent } from "solid-js";

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
import { add_classlist_module, get_element_by_id } from "@/utils/element";
import { ElementIds } from "@/enums/ids";
import { CornerData } from "@/enums/corner";
import { ThemeData } from "@/enums/theme";
import { timeout_clear, timeout_set } from "@/utils/timeout";
import { remove_splash_screen_on_load_every_component } from "@/scripts/splash";
import { array_includes } from "@/utils/array";

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
					anchor: ev.currentTarget,
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
		return `${rgb.r}, ${rgb.g}, ${rgb.b}`
	}

	function change_color(hexColor: HEXColor): void {
		set_color(hexColor)
		const acc = generate_color(hexColor)
		const accent_color_element = get_element_by_id(ElementIds.color_accent)!
		accent_color_element.innerHTML = `:root{--g-color-accent-light: ${rgb_to_css(hex_to_rgb(acc.color))};--g-color-accent-dark: ${rgb_to_css(hex_to_rgb(acc.color_dark))};--g-color-on-accent-light: ${rgb_to_css(hex_to_rgb(acc.on_color))};--g-color-on-accent-dark: ${rgb_to_css(hex_to_rgb(acc.on_color_dark))};}`;

		if (timeout_color_id != null) timeout_clear(timeout_color_id)
		timeout_color_id = timeout_set(() => {
			storage_set(LocalStorageKeys.color, hexColor)
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
					anchor: ev.currentTarget,
					padding: 0,
				})}
				code={0xEE0F}
			/>
		</Tooltip>
		<Menu
			style={{width: '200px'}}
			ref={r => menu_settings_ref = r}
			on_toggle_open={(v) => setIs_menu_settings_open(v)}>
			<MenuHeader>Theme</MenuHeader>
			<MenuItem
				selected={theme() == theme_light}
				icon_code={0xF2CD}
				onClick={() => change_theme(theme_light)}>
				Light
			</MenuItem>
			<MenuItem
				selected={theme() == theme_dark}
				icon_code={0xF2B3}
				onClick={() => change_theme(theme_dark)}>
				Dark
			</MenuItem>
			<MenuItem
				selected={theme() == theme_system}
				icon_code={0xE96D}
				onClick={() => change_theme(theme_system)}>
				System theme
			</MenuItem>
			<MenuDivider />
			<MenuHeader>Corner style</MenuHeader>
			<MenuItem
				selected={corner() == corner_sharp}
				icon_code={0xEA99}
				onClick={() => change_corner(corner_sharp)}>
				Sharp
			</MenuItem>
			<MenuItem
				selected={corner() == corner_semiround}
				icon_code={0xEEF7}
				onClick={() => change_corner(corner_semiround)}>
				Semi round
			</MenuItem>
			<MenuItem
				selected={corner() == corner_round}
				icon_code={0xF044}
				onClick={() => change_corner(corner_round)}>
				Round
			</MenuItem>
			<MenuItem
				selected={corner() == corner_fullround}
				icon_code={0xE408}
				onClick={() => change_corner(corner_fullround)}>
				Full round
			</MenuItem>
			<MenuDivider/>
			<MenuHeader>Accent color</MenuHeader>
			<MenuItem
				focused={is_colorpicker_open()}
				onClick={(ev) => {
					close_menu(menu_settings_ref)
					open_popovercolorpicker(ev, colorpicker_ref, {
						color: color()
					})
				}}
				leading={<Icon style={{color: color()}} filled code={0xE408}/>}>
				{color()}
			</MenuItem>
		</Menu>
		<PopoverColorPicker
			disabled_color_control
			disabled_opacity_control
			disabled_action
			draggable
			on_update_color={v => change_color(v)}
			ref={r => colorpicker_ref = r}
			on_toggle_open={(v) => set_is_colorpicker_open(v)}
		/>
	</>)
}