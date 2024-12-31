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
import { NumberTextField } from "@/components/TextField";
import { IFRAME_PREVIEW_ID } from "./_constants";
import { element_by_id } from "@/utils/element";
import { array_includes } from "@/utils/array";
import { navigator_share } from "@/utils/navigator";
import { date_year } from "@/utils/datetime";
import { number_safe } from "@/utils/number";
import { event_current_target } from "@/utils/event";
import logo from '@/assets/apps/markdown-converter-logo.svg'
import logo_redmerah from '@/assets/logo.svg'
import logo_css from '@/assets/css-logo.svg'
import logo_html from '@/assets/html-logo.svg'

import { IconButton } from "@/components/Button";
import Menu, { close_submenu, close_menu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu";
import Tooltip from "@/components/Tooltip";
import CSSAnimation from "@/styles/animation.module.scss"
import AppBar from "@/components/AppBar";

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
	const [is_submenu_downloadmoreactions_open, set_is_submenu_downloadmoreactions_open] = createSignal<boolean>(false)
	const [is_submenu_copyallmoreactions_open, set_is_submenu_copyallmoreactions_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreactions_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_downloadmoreactions_ref: HTMLDivElement
	let submenu_copyallmoreactions_ref: HTMLDivElement

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

	async function download_file(type: 'markdown' | 'css' | 'html'): Promise<void> {
		command(Commands.download_file, type)
		close_submenu(submenu_downloadmoreactions_ref)
		await wait(300)
		close_menu(menu_moreactions_ref)
	}

	async function copy_all(ev: Event, type: 'markdown' | 'css' | 'html'): Promise<void> {
		command(Commands.copy_all, ev, type)
		close_submenu(submenu_copyallmoreactions_ref)
		await wait(300)
		close_menu(menu_moreactions_ref)
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
						navigator_share({ title: 'Markdown Converter', text: 'Markdown Converter', url: document.URL })
						close_menu(menu_info_ref)
					}}
					icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => close_menu(menu_info_ref)}
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Markdown Converter')}
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
							number_safe(event_current_target(ev).valueAsNumber, settings().font_size)
						)}
					/>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '200px'}}
				on_toggle_open={isOpen => set_is_menu_moreactions_open(isOpen)}
				ref={r => menu_moreactions_ref = r}>
				<MenuItem
					icon_code={0xECFF}
					onClick={() => {
						close_menu(menu_moreactions_ref)
						const iframe = element_by_id(IFRAME_PREVIEW_ID) as HTMLIFrameElement
						iframe?.contentWindow?.print()
					}}>
					Print
				</MenuItem>
				<MenuItem
					icon_code={0xE607}
					onClick={(ev) => {
						close_menu(menu_moreactions_ref)
						command(Commands.open_file, ev)
					}}>
					Open file
				</MenuItem>
				<MenuDivider/>
				<SubMenu
					on_toggle_open={isOpen => set_is_submenu_downloadmoreactions_open(isOpen)}
					ref={r => submenu_downloadmoreactions_ref = r}
					item={<SubMenuItem
						icon_code={0xE0B9}
						focused={is_submenu_downloadmoreactions_open()}>
						Download
					</SubMenuItem>}>
					<MenuItem
						leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--g-color-on-surface))"/>
						</svg>}
						onClick={() => download_file('markdown')}>
						Markdown
					</MenuItem>
					<MenuItem
						leading={<img width={20} src={logo_html.src} alt="HTML logo"/>}
						onClick={() => download_file('html')}>
						HTML
					</MenuItem>
					<MenuItem
						leading={<img width={20} src={logo_css.src} alt="CSS logo"/>}
						onClick={() => download_file('css')}>
						CSS
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_copyallmoreactions_ref = r}
					on_toggle_open={isOpen => set_is_submenu_copyallmoreactions_open(isOpen)}
					item={<SubMenuItem
						icon_code={0xE51B}
						focused={is_submenu_copyallmoreactions_open()}>
						Copy all
					</SubMenuItem>}>
					<MenuItem
						leading={<svg width={20} viewBox="0 0 2560 2560" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M2375.4 2067.68H184.6C82.8 2067.68 0 1984.88 0 1883.08V676.92C0 575.12 82.8 492.32 184.6 492.32H2375.36C2477.16 492.32 2559.96 575.12 2559.96 676.92V1883.08C2560 1984.88 2477.2 2067.68 2375.4 2067.68ZM615.4 1698.48V1218.48L861.56 1526.16L1107.72 1218.48V1698.48H1353.88V861.52H1107.72L861.56 1169.2L615.4 861.52H369.24V1698.44H615.4V1698.48ZM2264.6 1280H2018.44V861.52H1772.28V1280H1526.12L1895.36 1710.76L2264.6 1280Z" fill="rgb(var(--g-color-on-surface))"/>
						</svg>}
						onClick={ev => copy_all(ev, 'markdown')}>
						Markdown
					</MenuItem>
					<MenuItem
						leading={<img width={20} src={logo_html.src} alt="HTML logo"/>}
						onClick={ev => copy_all(ev, 'html')}>
						HTML
					</MenuItem>
					<MenuItem
						leading={<img width={20} src={logo_css.src} alt="CSS logo"/>}
						onClick={ev => copy_all(ev, 'css')}>
						CSS
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
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
			leading={<img alt="Markdown converter logo" width={32} src={logo.src} />}
			headline="Markdown Converter"
			trailing={<Tooltip>
				<IconButton
					data-tooltip="Info"
					focused={is_menu_info_open()}
					code={0xE930}
					onClick={(ev) => open_menu(ev, menu_info_ref, {
						anchor: event_current_target(ev),
						padding: 4
					})}
				/>
				<IconButton
					data-tooltip="Settings"
					class={CSSAnimation.btn_rotate_icon}
					focused={is_menu_settings_open()}
					code={0xEE0F}
					onClick={(ev) => open_menu(ev, menu_settings_ref, {
						anchor: event_current_target(ev),
						padding: 4
					})}
				/>
				<IconButton
					data-tooltip="More actions"
					focused={is_menu_moreactions_open()}
					code={0xEAD9}
					onClick={(ev) => open_menu(ev, menu_moreactions_ref, {
						anchor: event_current_target(ev),
						padding: 4
					})}
				/>
			</Tooltip>}
		/>
		<Menus/>
	</>)
}

export default _