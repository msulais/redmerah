import { createMemo, createSignal, onMount, type VoidComponent } from "solid-js";

import type { Settings } from "./_types";
import { RootAttributes } from "@/enums/attributes";
import { CornerData } from "@/enums/corner";
import { RoutesLinks, ExternalLinks } from "@/enums/links";
import { LocalStorageKeys } from "@/enums/storage";
import { ThemeData } from "@/enums/theme";
import { storage_set, storage_get } from "@/utils/storage";
import { wait } from "@/utils/timeout";
import { url_encode } from "@/utils/url";
import { setAttribute } from "solid-js/web";
import { Commands } from "./_enums";
import { array_includes } from "@/utils/array";
import { navigator_share } from "@/utils/navigator";
import { date_year } from "@/utils/datetime";
import { number_safe } from "@/utils/number";
import TextField, { NumberTextField } from "@/components/TextField";
import logo from '@/assets/apps/latex-viewer/logo.svg'
import logo_redmerah from '@/assets/logo.svg'

import { IconButton } from "@/components/Button";
import Menu, { close_submenu, close_menu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu";
import AppBar from "@/components/AppBar";
import Tooltip from "@/components/Tooltip";
import CSSAnimation from "@/styles/animation.module.scss"

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = document.documentElement
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round

	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_menu_moreactions_open, set_is_menu_moreactions_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		setAttribute(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		setAttribute(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && array_includes([theme_system, theme_light, theme_dark], theme as ThemeData)) {
			setAttribute(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && array_includes([corner_sharp, corner_semiround, corner_round, corner_fullround], corner as CornerData)) {
			setAttribute(root, RootAttributes.corner, corner)
			set_corner(corner as CornerData)
		}
	}

	onMount(() => {
		init_theme()
		init_corner()
	})

	const Menus: VoidComponent = () => {
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				on_toggle_open={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.home}
					leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.apps}
					icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.about}
					icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.privacy}
					icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={RoutesLinks.terms}
					icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					onClick={() => {
						navigator_share({ title: 'LaTeX Viewer', text: 'LaTeX Viewer', url: document.URL })
						close_menu(menu_info_ref)
					}}
					icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('LaTeX Viewer')}
					icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={ExternalLinks.donate}
					open_in_new_tab
					icon_code={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				on_toggle_open={(v) => set_is_menu_settings_open(v)}>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					on_toggle_open={v => set_is_submenu_themesettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_themesettings_open()}
						icon_code={0xE28A}>
						Theme
					</SubMenuItem>}>
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
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					on_toggle_open={v => set_is_submenu_cornersettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_cornersettings_open()}
						icon_code={0xF044}>
						Corner style
					</SubMenuItem>}>
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
				</SubMenu>
				<MenuDivider/>
				<SwitchMenuItem
					icon_code={0xF19D}
					checked={settings().text_wrap}
					attr_switch={{
						onChange: () => command(Commands.toggle_textwrap)
					}}>
					Text wrap
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<NumberTextField
						min={12}
						label="Font size"
						value={settings().font_size}
						onBlur={ev => command(
							Commands.change_fontsize,
							number_safe(ev.currentTarget.valueAsNumber, settings().font_size)
						)}
					/>
					<TextField
						attr_wrapper={{style: {"margin-top": '8px'}}}
						label="Prefix"
						value={settings().prefix}
						onBlur={ev => command(
							Commands.change_prefix,
							ev.currentTarget.value
						)}
					/>
					<TextField
						attr_wrapper={{style: {"margin-top": '8px'}}}
						label="Suffix"
						value={settings().suffix}
						onBlur={ev => command(
							Commands.change_suffix,
							ev.currentTarget.value
						)}
					/>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '164px'}}
				on_toggle_open={isOpen => set_is_menu_moreactions_open(isOpen)}
				ref={r => menu_moreactions_ref = r}>
				<MenuItem
					icon_code={0xE51B}
					onClick={(ev) => {
						close_menu(menu_moreactions_ref)
						command(Commands.copy_all, ev)
					}}>
					Copy all
				</MenuItem>
				<MenuItem
					icon_code={0xE113}
					onClick={() => {
						close_menu(menu_moreactions_ref)
						command(Commands.reset_inputs)
					}}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			leading={<img alt="LaTeX Viewer logo" width={32} src={logo.src} />}
			headline="LaTeX Viewer"
			trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					focused={is_menu_info_open()}
					code={0xE930}
					onClick={(ev) => open_menu(ev, menu_info_ref, {
						anchor: ev.currentTarget,
						padding: 4
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					focused={is_menu_settings_open()}
					code={0xEE0F}
					onClick={(ev) => open_menu(ev, menu_settings_ref, {
						anchor: ev.currentTarget,
						padding: 4
					})}
				/>
				<IconButton
					data-tooltip="More actions"
					focused={is_menu_moreactions_open()}
					code={0xEAD9}
					onClick={(ev) => open_menu(ev, menu_moreactions_ref, {
						anchor: ev.currentTarget,
						padding: 4
					})}
				/>
			</Tooltip>}
		/>
		<Menus/>
	</>)
}

export default _