import { createSignal, onMount, type VoidComponent } from "solid-js";

import type { Settings } from "./_types";
import { _system, _round, _theme, _corner, _light, _dark, _includes, _sharp, _semiRound, _fullRound, _about, _apps, _contactEmail, _donate, _getFullYear, _home, _privacy, _share, _src, _terms, _URL, _centerBottomToLeft, _currentTarget, _settings, _textWrap, _command, _fontSize, _contentWindow, _print, _markdown, _html, _csc, _css, _valueAsNumber, _prefix, _value, _suffix } from "@/constants/string";
import { getDocument, getNavigator, getRoot } from "@/constants/window";
import { RootAttributes } from "@/enums/attributes";
import { CornerData } from "@/enums/corner";
import { RoutesLinks, ExternalLinks } from "@/enums/links";
import { LocalStorageKeys } from "@/enums/storage";
import { ThemeData } from "@/enums/theme";
import { setLocalStorageItem, getLocalStorageItem } from "@/utils/storage";
import { wait } from "@/utils/timeout";
import { encodeURL } from "@/utils/url";
import { setAttribute } from "solid-js/web";
import { Commands } from "./_enums";
import TextField, { NumberTextField } from "@/components/TextField";
import { safeNumber } from "@/utils/math";
import logo from '@/assets/apps/latex-viewer/logo.svg'
import redmerahLogo from '@/assets/logo.svg'
import Tooltip from "@/components/Tooltip";
import CSSAnimation from "@/styles/animation.module.scss"

import { IconButton } from "@/components/Button";
import Menu, { closeSubMenu, closeMenu, LinkMenuItem, MenuDivider, MenuHeader, MenuItem, SubMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu";
import AppBar from "@/components/AppBar";

const _: VoidComponent<{
	settings: Settings
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_info_open, setIs_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, setIs_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themeSettings_open, setIs_submenu_themeSettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornerSettings_open, setIs_submenu_cornerSettings_open] = createSignal<boolean>(false)
	const [is_menu_moreActions_open, setIs_menu_moreActions_open] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData[_system])
	const [corner, setCorner] = createSignal<CornerData>(CornerData[_round])
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let menu_moreActions_ref: HTMLDialogElement
	let submenu_themeSettings_ref: HTMLDivElement
	let submenu_cornerSettings_ref: HTMLDivElement

	async function changeTheme(theme: ThemeData): Promise<void> {
		setTheme(theme)
		setAttribute(getRoot(), RootAttributes[_theme], theme)
		setLocalStorageItem(LocalStorageKeys[_theme], theme)
		closeSubMenu(submenu_themeSettings_ref)
		await wait(300)
		closeMenu(menu_settings_ref)
	}

	async function changeCorner(corner: CornerData): Promise<void> {
		setCorner(corner)
		setAttribute(getRoot(), RootAttributes[_corner], corner)
		setLocalStorageItem(LocalStorageKeys[_corner], corner)
		closeSubMenu(submenu_cornerSettings_ref)
		await wait(300)
		closeMenu(menu_settings_ref)
	}

	function initTheme(): void {
		const theme = getLocalStorageItem(LocalStorageKeys[_theme])

		if (theme && [ThemeData[_system], ThemeData[_light], ThemeData[_dark]][_includes](theme as ThemeData)) {
			setAttribute(getRoot(), RootAttributes[_theme], theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = getLocalStorageItem(LocalStorageKeys[_corner])

		if (corner && [CornerData[_sharp], CornerData[_semiRound], CornerData[_round], CornerData[_fullRound]][_includes](corner as CornerData)) {
			setAttribute(getRoot(), RootAttributes[_corner], corner)
			setCorner(corner as CornerData)
		}
	}

	onMount(() => {
		initTheme()
		initCorner()
	})

	const Menus: VoidComponent = () => {
		return (<>
			<Menu
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				onToggleOpen={(v) => setIs_menu_info_open(v)}>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={RoutesLinks[_home]}
					leading={<img src={redmerahLogo[_src]} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={RoutesLinks[_apps]}
					iconCode={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={RoutesLinks[_about]}
					iconCode={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={RoutesLinks[_privacy]}
					iconCode={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={RoutesLinks[_terms]}
					iconCode={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					onClick={() => {
						getNavigator()[_share]({ title: 'LaTeX Viewer', text: 'LaTeX Viewer', url: getDocument()[_URL] })
						closeMenu(menu_info_ref)
					}}
					iconCode={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={'mailto:' + ExternalLinks[_contactEmail] + '?subject=' + encodeURL('LaTeX Viewer')}
					iconCode={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					onClick={() => closeMenu(menu_info_ref)}
					href={ExternalLinks[_donate]}
					openInNewTab
					iconCode={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {new Date()[_getFullYear]()} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				onToggleOpen={(v) => setIs_menu_settings_open(v)}>
				<SubMenu
					level={1}
					ref={r => submenu_themeSettings_ref = r}
					onToggleOpen={v => setIs_submenu_themeSettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_themeSettings_open()}
						iconCode={0xE28A}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						selected={theme() == ThemeData[_light]}
						iconCode={0xF2CD}
						onClick={() => changeTheme(ThemeData[_light])}>
						Light
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData[_dark]}
						iconCode={0xF2B3}
						onClick={() => changeTheme(ThemeData[_dark])}>
						Dark
					</MenuItem>
					<MenuItem
						selected={theme() == ThemeData[_system]}
						iconCode={0xE96D}
						onClick={() => changeTheme(ThemeData[_system])}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					level={1}
					ref={r => submenu_cornerSettings_ref = r}
					onToggleOpen={v => setIs_submenu_cornerSettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_cornerSettings_open()}
						iconCode={0xF044}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						selected={corner() == CornerData[_sharp]}
						iconCode={0xEA99}
						onClick={() => changeCorner(CornerData[_sharp])}>
						Sharp
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData[_semiRound]}
						iconCode={0xEEF7}
						onClick={() => changeCorner(CornerData[_semiRound])}>
						Semi round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData[_round]}
						iconCode={0xF044}
						onClick={() => changeCorner(CornerData[_round])}>
						Round
					</MenuItem>
					<MenuItem
						selected={corner() == CornerData[_fullRound]}
						iconCode={0xE408}
						onClick={() => changeCorner(CornerData[_fullRound])}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuDivider/>
				<SwitchMenuItem
					iconCode={0xF19D}
					checked={props[_settings][_textWrap]}
					switchAttr={{
						onChange: () => props[_command](Commands.toggle_textWrap)
					}}>
					Text wrap
				</SwitchMenuItem>
				<div style={{padding: '8px 12px'}}>
					<NumberTextField
						min={12}
						label="Font size"
						value={props[_settings][_fontSize]}
						onBlur={ev => props[_command](
							Commands.change_fontSize,
							safeNumber(ev[_currentTarget][_valueAsNumber], props[_settings][_fontSize])
						)}
					/>
					<TextField
						wrapperAttr={{style: {"margin-top": '8px'}}}
						label="Prefix"
						value={props[_settings][_prefix]}
						onBlur={ev => props[_command](
							Commands.change_prefix,
							ev[_currentTarget][_value]
						)}
					/>
					<TextField
						wrapperAttr={{style: {"margin-top": '8px'}}}
						label="Suffix"
						value={props[_settings][_suffix]}
						onBlur={ev => props[_command](
							Commands.change_suffix,
							ev[_currentTarget][_value]
						)}
					/>
				</div>
			</Menu>
			<Menu
				style={{"min-width": '164px'}}
				onToggleOpen={isOpen => setIs_menu_moreActions_open(isOpen)}
				ref={r => menu_moreActions_ref = r}>
				<MenuItem
					iconCode={0xE51B}
					onClick={(ev) => {
						closeMenu(menu_moreActions_ref)
						props[_command](Commands.copy_all, ev)
					}}>
					Copy all
				</MenuItem>
				<MenuItem
					iconCode={0xE113}
					onClick={() => {
						closeMenu(menu_moreActions_ref)
						props[_command](Commands.reset_inputs)
					}}>
					Reset input
				</MenuItem>
			</Menu>
		</>)
	}

	return (<>
		<AppBar
			leading={<img alt="LaTeX Viewer logo" width={32} src={logo[_src]} />}
			headline="LaTeX Viewer"
			trailing={<>
				<Tooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						code={0xE930}
						onClick={(ev) => openMenu(ev, menu_info_ref, {
							anchor: ev[_currentTarget],
							padding: 4
						})}
					/>
				</Tooltip>
				<Tooltip text="Settings">
					<IconButton
						class={CSSAnimation.btn_rotate_icon}
						focused={is_menu_settings_open()}
						code={0xEE0F}
						onClick={(ev) => openMenu(ev, menu_settings_ref, {
							anchor: ev[_currentTarget],
							padding: 4
						})}
					/>
				</Tooltip>
				<Tooltip text="More actions">
					<IconButton
						focused={is_menu_moreActions_open()}
						code={0xEAD9}
						onClick={(ev) => openMenu(ev, menu_moreActions_ref, {
							anchor: ev[_currentTarget],
							padding: 4
						})}
					/>
				</Tooltip>
			</>}
		/>
		<Menus/>
	</>)
}

export default _