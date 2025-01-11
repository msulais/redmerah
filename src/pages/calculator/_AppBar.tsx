import { createMemo, createSignal, createUniqueId, For, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { event_add_listener, event_current_target, event_target } from "@/utils/event"
import { window_matches, window_match_media } from "@/utils/window"
import { CALCULATOR_TYPES, SIZE_SIDE_NAVIGATION_NONE, SIZE_SIDE_NOTEBOOK_NONE } from "./_constants"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { url_encode, url_origin } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { attr_set, classlist_module } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { storage_set, storage_get } from "@/utils/storage"
import { app_calculator as app } from "@/constants/apps"
import { CalculatorType, Commands, DecimalNumberFormat, GroupingNumberFormat } from "./_enums"
import { document_active, document_root } from "@/utils/document"
import { valid_enum_value } from "@/utils/object"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import logo_redmerah from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import { Tooltip } from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import { AreaTextField, change_areatextfield_value } from "@/components/TextField"
import Menu, {  MenuDivider, MenuItem, MenuHeader, close_menu, LinkMenuItem, SubMenu, close_submenu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Drawer, { close_drawer, DrawerItem, DrawerPosition, open_drawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
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
	const root = document_root()
	const button_navigation_id = createUniqueId()
	const button_info_id = createUniqueId()
	const button_settings_id = createUniqueId()
	const button_notebook_id = createUniqueId()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_groupingnumberformatsettings_open, set_is_menu_groupingnumberformatsettings_open] = createSignal<boolean>(false)
	const [is_menu_decimalnumberformatsettings_open, set_is_menu_decimalnumberformatsettings_open] = createSignal<boolean>(false)
	const [is_sidenavigation_hidden, set_is_sidenavigation_hidden] = createSignal<boolean>(false)
	const [is_sidenotebook_hidden, set_is_sidenotebook_hidden] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
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

	function change_decimal_numberformat(type: DecimalNumberFormat): void {
		command(Commands.change_settings_numberformatdecimal, type)
		close_submenu(submenu_decimalnumberformatsettings_ref)
		close_menu(menu_settings_ref)
	}

	function change_grouping_numberformat(type: GroupingNumberFormat): void {
		command(Commands.change_settings_numberformatgrouping, type)
		close_submenu(submenu_groupingnumberformatsettings_ref)
		close_menu(menu_settings_ref)
	}

	function init_sidenavigation_listener(): void {
		set_is_sidenavigation_hidden(window_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(window_match_media(
			`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => set_is_sidenavigation_hidden((ev as MediaQueryListEvent).matches)
		)
	}

	function init_sidenotebook_listener(): void {
		set_is_sidenotebook_hidden(window_matches(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`))
		event_add_listener(
			window_match_media(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`),
			'change',
			ev => set_is_sidenotebook_hidden((ev as MediaQueryListEvent).matches)
		)
	}

	function change_theme(theme: ThemeData): void {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		close_menu(menu_settings_ref)
	}

	function change_corner(corner: CornerData): void {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		close_menu(menu_settings_ref)
	}

	function init_theme(): void {
		const theme = storage_get(LocalStorageKeys.theme)

		if (theme && valid_enum_value(theme, ThemeData)) {
			attr_set(root, RootAttributes.theme, theme)
			set_theme(theme as ThemeData)
		}
	}

	function init_corner(): void {
		const corner = storage_get(LocalStorageKeys.corner)

		if (corner && valid_enum_value(corner, CornerData)) {
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

	const Menus: VoidComponent = () => {
		const button_info_share_id = createUniqueId()
		const input_settings_scientificnotation_id = createUniqueId()
		const input_settings_memorybuttons_id = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => {
							const tagname = element_tagname(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (element_id(button)) {
						case button_info_share_id:
							navigator_share({
								title: app.name,
								text: app.name + ' v' + app.build_version,
								url: url_origin() + app.link
							})
							break
					}

					close_menu(menu_info_ref)
				}}
				style={{width: '200px'}}
				ref={r => menu_info_ref = r}
				c_on_toggleopen={(v) => set_is_menu_info_open(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					c_leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c_icon_code={0xE063}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c_icon_code={0xE930}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c_icon_code={0xEE51}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c_icon_code={0xED47}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_info_share_id}
					c_icon_code={0xEE23}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					c_icon_code={0xE3A0}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={0xE84B}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				style={{width: '224px'}}
				ref={r => menu_settings_ref = r}
				c_on_toggleopen={(v) => set_is_menu_settings_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_theme = element_dataset(button, 'theme')
					if (data_theme
						&& valid_enum_value(data_theme, ThemeData)
					) return change_theme(data_theme as ThemeData)

					const data_corner = element_dataset(button, 'corner')
					if (data_corner
						&& valid_enum_value(data_corner, CornerData)
					) return change_corner(data_corner as CornerData)

					const data_decimal = element_dataset(button, 'decimal')
					if (data_decimal
						&& valid_enum_value(data_decimal, DecimalNumberFormat)
					) return change_decimal_numberformat(data_decimal as DecimalNumberFormat)

					const data_grouping = element_dataset(button, 'grouping')
					if (data_grouping
						&& valid_enum_value(data_grouping, GroupingNumberFormat)
					) return change_grouping_numberformat(data_grouping as GroupingNumberFormat)
				}}
				onChange={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
					case input_settings_scientificnotation_id:
						command(Commands.toggle_settings_scientificnotation)
						break
					case input_settings_memorybuttons_id:
						command(Commands.toggle_settings_memorybuttons)
						break
					}
				}}>
				<Tooltip>
					<SwitchMenuItem
						data-tooltip="Display result in scientific notation (e.g. 1.2E-29)"
						c_icon_code={0xEA91}
						c_attr_switch={{
							id: input_settings_scientificnotation_id,
							checked: settings().scientific_notation,
						}}>
						Scientific notation
					</SwitchMenuItem>
					<SwitchMenuItem
						data-tooltip="Show or hide memory button (M, M+, M-, MR, MC)"
						c_checked={settings().memory_buttons}
						c_icon_code={0xE5CD}
						c_attr_switch={{
							id: input_settings_memorybuttons_id,
							checked: settings().memory_buttons,
						}}>
						Memory buttons
					</SwitchMenuItem>
				</Tooltip>
				<MenuDivider/>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_themesettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_themesettings_open()}
						c_icon_code={0xE28A}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c_selected={theme() == ThemeData.light}
						c_icon_code={0xF2CD}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.dark}
						c_icon_code={0xF2B3}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.system}
						c_icon_code={0xE96D}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_cornersettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_cornersettings_open()}
						c_icon_code={0xF044}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c_selected={corner() == CornerData.sharp}
						c_icon_code={0xEA99}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.semi_round}
						c_icon_code={0xEEF7}
						data-corner={CornerData.semi_round}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.round}
						c_icon_code={0xF044}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.full_round}
						c_icon_code={0xE408}
						data-corner={CornerData.full_round}>
						Full round
					</MenuItem>
				</SubMenu>
				<MenuDivider />
				<MenuHeader>Number format</MenuHeader>
				<SubMenu
					style={{width: '132px'}}
					ref={r => submenu_decimalnumberformatsettings_ref = r}
					c_on_toggleopen={v => set_is_menu_decimalnumberformatsettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_menu_decimalnumberformatsettings_open()}
						c_icon_code={0xE599}>
						Decimal
					</SubMenuItem>}>
					<MenuItem
						data-decimal={DecimalNumberFormat.comma}
						c_selected={settings().number_format.decimal == DecimalNumberFormat.comma}>
						Comma
					</MenuItem>
					<MenuItem
						data-decimal={DecimalNumberFormat.point}
						c_selected={settings().number_format.decimal == DecimalNumberFormat.point}>
						Point
					</MenuItem>
				</SubMenu>
				<SubMenu
					style={{width: '132px'}}
					ref={r => submenu_groupingnumberformatsettings_ref = r}
					c_on_toggleopen={v => set_is_menu_groupingnumberformatsettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_groupingnumberformatsettings_open()}
						c_icon_code={0xEB49}>
						Grouping
					</SubMenuItem>}>
					<MenuItem
						data-grouping={GroupingNumberFormat.comma}
						c_selected={settings().number_format.grouping == GroupingNumberFormat.comma}>
						Comma
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.point}
						c_selected={settings().number_format.grouping == GroupingNumberFormat.point}>
						Point
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.space}
						c_selected={settings().number_format.grouping == GroupingNumberFormat.space}>
						Space
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.none}
						c_selected={settings().number_format.grouping == GroupingNumberFormat.none}>
						None
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.underscore}
						c_selected={settings().number_format.grouping == GroupingNumberFormat.underscore}>
						Underscore
					</MenuItem>
				</SubMenu>
			</Menu>
		</>)
	}

	const Drawers: VoidComponent = () => {
		const button_navigation_close_id = createUniqueId()
		return (<>
			<Drawer
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
					case button_navigation_close_id:
						close_drawer(drawer_navigation_ref)
						break
					default: {
						const data_navigation = element_dataset(button, 'navigation')
						if (data_navigation && valid_enum_value(data_navigation, CalculatorType)) {
							if (props.calculator != data_navigation) props.on_change_calculator(
								data_navigation as CalculatorType
							)

							close_drawer(drawer_navigation_ref)
							return
						}
					}}
				}}
				c_header={<Tooltip>
					<IconButton
						data-tooltip="Close navigation"
						id={button_navigation_close_id}
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						c_code={0xEAFF}
					/>
				</Tooltip>}
				ref={r => drawer_navigation_ref = r}>
				<For each={CALCULATOR_TYPES}>{r => <DrawerItem
					data-navigation={r.type}
					c_selected={props.calculator == r.type}>
					<Icon c_filled={props.calculator == r.type} c_code={r.icon}/>{ r.text }
				</DrawerItem>}</For>
			</Drawer>
			<Drawer
				classList={classlist_module(CSS.appbar_notebook)}
				c_header={<>
					<Tooltip>
						<IconButton
							data-tooltip="Close notebook"
							onClick={() => close_drawer(drawer_notebook_ref)}
							c_code={0xE5E9}
						/>
					</Tooltip>
					Notebook
				</>}
				ref={r => drawer_notebook_ref = r}
				c_position={DrawerPosition.right}>
				<AreaTextField
					ref={r => areatextfield_notebook_ref = r}
					c_label="Notebook"
					placeholder="Type your thought here ..."
					onInput={(ev) => props.on_note_changed(event_current_target(ev).value)}
				/>
			</Drawer>
		</>)
	}

	return (<>
		<Tooltip>
			<AppBar
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
					case button_navigation_id:
						if (is_sidenavigation_hidden()) return open_drawer(ev, drawer_navigation_ref)

						command(Commands.toggle_navigation_expand)
						break
					case button_info_id:
						open_menu(ev, menu_info_ref, { anchor: button })
						break
					case button_settings_id:
						open_menu(ev, menu_settings_ref, { anchor: button })
						break
					case button_notebook_id:
						if (is_sidenotebook_hidden()) {
							change_areatextfield_value(areatextfield_notebook_ref, props.note)
							return open_drawer(ev, drawer_notebook_ref)
						}
						command(Commands.toggle_notebook_expand)
						break
					}
				}}
				c_leading={<>
					<IconButton
						data-tooltip={is_sidenavigation_hidden()
							? "Open navigation"
							: "Expand/shrink navigation"
						}
						id={button_navigation_id}
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						c_code={0xEAFF}
					/>
					<img width={32} src={app.logo_url} alt={app.name} />
				</>}
				c_headline={app.name}
				c_trailing={<>
					<IconButton
						data-tooltip="Info"
						id={button_info_id}
						c_focused={is_menu_info_open()}
						c_code={0xE930}
					/>
					<IconButton
						data-tooltip="Settings"
						id={button_settings_id}
						classList={classlist_module(CSSAnimation.btn_rotate_icon)}
						c_focused={is_menu_settings_open()}
						c_code={0xEE0F}
					/>
					<IconButton
						data-tooltip="Notebook"
						id={button_notebook_id}
						c_variant={props.is_notebook_expanded && !is_sidenotebook_hidden()? ButtonVariant.filled : undefined}
						c_filled={props.is_notebook_expanded && !is_sidenotebook_hidden()}
						c_code={0xEB19}
					/>
				</>}
			/>
		</Tooltip>
		<Drawers />
		<Menus />
	</>)
}

export default _