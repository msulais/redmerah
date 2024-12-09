import { createMemo, createSignal, For, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { add_classlist_module } from "@/utils/element"
import { event_add_listener } from "@/utils/event"
import { is_window_media_matches, window_match_media } from "@/utils/window"
import { CALCULATOR_TYPES, SIZE_SIDE_NAVIGATION_NONE, SIZE_SIDE_NOTEBOOK_NONE } from "./_constants"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { attr_set } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { array_includes } from "@/utils/array"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { storage_set, storage_get } from "@/utils/storage"
import { Commands, DecimalNumberFormat, GroupingNumberFormat, type CalculatorType } from "./_enums"
import { wait } from "@/utils/timeout"
import logo_redmerah from '@/assets/logo.svg'
import logo from '@/assets/apps/calculator-logo.svg'

import Icon from "@/components/Icon"
import { TextTooltip } from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import { AreaTextField, change_areatextfield_value } from "@/components/TextField"
import Menu, {  MenuDivider, MenuItem, MenuHeader, close_menu, LinkMenuItem, SubMenu, close_submenu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Drawer, { close_drawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	on_change_calculator: (type: CalculatorType) => unknown
	calculator: CalculatorType
	is_notebook_expanded: boolean
	note: string
	settings: Settings
	on_note_changed: (value: string) => unknown
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
	const [is_submenu_groupingnumberformatsettings_open, set_is_menu_groupingnumberformatsettings_open] = createSignal<boolean>(false)
	const [is_menu_decimalnumberformatsettings_open, set_is_menu_decimalnumberformatsettings_open] = createSignal<boolean>(false)
	const [is_sidenavigation_hidden, set_is_sidenavigation_hidden] = createSignal<boolean>(false)
	const [is_sidenotebook_hidden, set_is_sidenotebook_hidden] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const settings = createMemo(() => props.settings)
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_decimalnumberformatsettings_ref: HTMLDivElement
	let submenu_groupingnumberformatsettings_ref: HTMLDivElement
	let drawer_navigation_ref: HTMLDialogElement
	let drawer_notebook_ref: HTMLDialogElement
	let areatextfield_notebook_ref: HTMLTextAreaElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function change_decimal_numberformat(type: DecimalNumberFormat): Promise<void> {
		command(Commands.change_settings_numberformatdecimal, type)
		close_submenu(submenu_decimalnumberformatsettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_grouping_numberformat(type: GroupingNumberFormat): Promise<void> {
		command(Commands.change_settings_numberformatgrouping, type)
		close_submenu(submenu_groupingnumberformatsettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	function init_sidenavigation_listener(): void {
		set_is_sidenavigation_hidden(is_window_media_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(window_match_media(
			`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => set_is_sidenavigation_hidden((ev as MediaQueryListEvent).matches)
		)
	}

	function init_sidenotebook_listener(): void {
		set_is_sidenotebook_hidden(is_window_media_matches(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`))
		event_add_listener(
			window_match_media(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`),
			'change',
			ev => set_is_sidenotebook_hidden((ev as MediaQueryListEvent).matches)
		)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		await wait(300)
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

	onMount(() => {
		init_theme()
		init_corner()
		init_sidenavigation_listener()
		init_sidenotebook_listener()
	})

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_info_ref = r}
			style={{"min-width": '200px'}}
			on_toggle_open={isOpen => set_is_menu_info_open(isOpen)}>
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
					navigator_share({ title: 'Calculator', text: 'Calculator', url: document.URL })
					close_menu(menu_info_ref)
				}}
				icon_code={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Calculator')}
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
			style={{width: '224px'}}
			ref={r => menu_settings_ref = r}
			on_toggle_open={(v) => set_is_menu_settings_open(v)}>
			<TextTooltip text={"Display result in scientific notation (e.g. 1.2E-29)"}>
				<SwitchMenuItem
					icon_code={0xEA91}
					attr_switch={{
						checked: settings().scientific_notation,
						onChange: () => command(Commands.toggle_settings_scientificnotation),
					}}>
					Scientific notation
				</SwitchMenuItem>
			</TextTooltip>
			<TextTooltip text={"Show or hide memory button (M, M+, M-, MR, MC)"}>
				<SwitchMenuItem
					checked={settings().memory_buttons}
					icon_code={0xE5CD}
					attr_switch={{
						checked: settings().memory_buttons,
						onChange: () => command(Commands.toggle_settings_memorybuttons),
					}}>
					Memory buttons
				</SwitchMenuItem>
			</TextTooltip>
			<MenuDivider/>
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
			<MenuDivider />
			<MenuHeader>Number format</MenuHeader>
			<SubMenu
				style={{width: '132px'}}
				ref={r => submenu_decimalnumberformatsettings_ref = r}
				on_toggle_open={v => set_is_menu_decimalnumberformatsettings_open(v)}
				item={<SubMenuItem
					focused={is_menu_decimalnumberformatsettings_open()}
					icon_code={0xE599}>
					Decimal
				</SubMenuItem>}>
				<MenuItem
					onClick={() => change_decimal_numberformat(DecimalNumberFormat.comma)}
					selected={settings().number_format.decimal == DecimalNumberFormat.comma}>
					Comma
				</MenuItem>
				<MenuItem
					onClick={() => change_decimal_numberformat(DecimalNumberFormat.point)}
					selected={settings().number_format.decimal == DecimalNumberFormat.point}>
					Point
				</MenuItem>
			</SubMenu>
			<SubMenu
				style={{width: '132px'}}
				ref={r => submenu_groupingnumberformatsettings_ref = r}
				on_toggle_open={v => set_is_menu_groupingnumberformatsettings_open(v)}
				item={<SubMenuItem
					focused={is_submenu_groupingnumberformatsettings_open()}
					icon_code={0xEB49}>
					Grouping
				</SubMenuItem>}>
				<MenuItem
					onClick={() => change_grouping_numberformat(GroupingNumberFormat.comma)}
					selected={settings().number_format.grouping == GroupingNumberFormat.comma}>
					Comma
				</MenuItem>
				<MenuItem
					onClick={() => change_grouping_numberformat(GroupingNumberFormat.point)}
					selected={settings().number_format.grouping == GroupingNumberFormat.point}>
					Point
				</MenuItem>
				<MenuItem
					onClick={() => change_grouping_numberformat(GroupingNumberFormat.space)}
					selected={settings().number_format.grouping == GroupingNumberFormat.space}>
					Space
				</MenuItem>
				<MenuItem
					onClick={() => change_grouping_numberformat(GroupingNumberFormat.none)}
					selected={settings().number_format.grouping == GroupingNumberFormat.none}>
					None
				</MenuItem>
				<MenuItem
					onClick={() => change_grouping_numberformat(GroupingNumberFormat.underscore)}
					selected={settings().number_format.grouping == GroupingNumberFormat.underscore}>
					Underscore
				</MenuItem>
			</SubMenu>
		</Menu>
	</>)

	const Drawers: VoidComponent = () => {
		return (<>
			<Drawer
				header={<TextTooltip text="Close navigation">
					<IconButton
						classList={add_classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						onClick={() => close_drawer(drawer_navigation_ref)}
						code={0xEAFF}
					/>
				</TextTooltip>}
				ref={r => drawer_navigation_ref = r}>
				<For each={CALCULATOR_TYPES}>{r => <DrawerItem
					onClick={() => {
						if (props.calculator != r.type) props.on_change_calculator(r.type)
						close_drawer(drawer_navigation_ref)
					}}
					selected={props.calculator == r.type}>
					<Icon filled={props.calculator == r.type} code={r.icon}/>{ r.text }
				</DrawerItem>}</For>
			</Drawer>
			<Drawer
				classList={add_classlist_module(CSS.appbar_notebook)}
				header={<>
					<TextTooltip text="Close notebook">
						<IconButton
							onClick={() => close_drawer(drawer_notebook_ref)}
							code={0xE5E9}
						/>
					</TextTooltip>
					Notebook
				</>}
				ref={r => drawer_notebook_ref = r}
				position={DrawerPosition.right}>
				<AreaTextField
					ref={r => areatextfield_notebook_ref = r}
					label="Notebook"
					placeholder="Type your thought here ..."
					onInput={(ev) => props.on_note_changed(ev.currentTarget.value)}
				/>
			</Drawer>
		</>)
	}

	return (<>
		<AppBar
			leading={<>
				<TextTooltip text={is_sidenavigation_hidden()
					? "Open navigation"
					: "Expand/shrink navigation"
				}>
					<IconButton
						classList={add_classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						onClick={(ev) => {
							if (is_sidenavigation_hidden()) return openDrawer(ev, drawer_navigation_ref)
							command(Commands.toggle_navigation_expand)
						}}
						code={0xEAFF}
					/>
				</TextTooltip>
				<img width={32} src={logo.src} alt="Calculator logo" />
			</>}
			headline="Calculator"
			trailing={<>
				<TextTooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						onClick={ev => open_menu(ev, menu_info_ref, {
							anchor: ev.currentTarget,
							padding: 4,
						})}
						code={0xE930}
					/>
				</TextTooltip>
				<TextTooltip text="Settings">
					<IconButton
						classList={add_classlist_module(CSSAnimation.btn_rotate_icon)}
						focused={is_menu_settings_open()}
						onClick={(ev) => open_menu(ev, menu_settings_ref, {
							anchor: ev.currentTarget,
							padding: 4,
						})}
						code={0xEE0F}
					/>
				</TextTooltip>
				<TextTooltip text="Notebook">
					<IconButton
						onClick={ev => {
							if (is_sidenotebook_hidden()) {
								change_areatextfield_value(areatextfield_notebook_ref, props.note)
								return openDrawer(ev, drawer_notebook_ref)
							}
							command(Commands.toggle_notebook_expand)
						}}
						variant={props.is_notebook_expanded && !is_sidenotebook_hidden()? ButtonVariant.filled : undefined}
						filled={props.is_notebook_expanded && !is_sidenotebook_hidden()}
						code={0xEB19}
					/>
				</TextTooltip>
			</>}
		/>
		<Drawers />
		<Menus />
	</>)
}

export default _