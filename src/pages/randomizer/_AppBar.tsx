import { type Component, For, Match, Show, Switch, type VoidComponent, createMemo, createSignal, createUniqueId, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"

import type { Settings } from "./_types"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { attr_set, attr_set_if_exist, classlist_module } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { ThemeData } from "@/enums/theme"
import { storage_get, storage_set } from "@/utils/storage"
import { LocalStorageKeys } from "@/enums/storage"
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorModel, Commands } from "./_enums"
import { url_encode, url_origin } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { window_matches } from "@/utils/window"
import { RANDOMIZER_TYPES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { event_add_listener, event_current_target, event_target } from "@/utils/event"
import { document_active, document_root } from "@/utils/document"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { app_randomizer as app } from "@/constants/apps"
import { element_valid_target, element_tagname, element_id, element_dataset } from "@/utils/element"
import { valid_enum_value } from "@/utils/object"
import { number_is_not_defined, number_parse, number_safe } from "@/utils/number"
import { ICON_ALIGN_END_HORIZONTAL, ICON_ALIGN_START_HORIZONTAL, ICON_APPS, ICON_ARROW_CLOCKWISE, ICON_ARROW_SHUFFLE, ICON_ARROW_SORT, ICON_ARROW_SYNC, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COLOR, ICON_COMMA, ICON_COPY, ICON_DECIMAL_ARROW_LEFT, ICON_DISMISS, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_NUMBER_SYMBOL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_CASE_TITLE, ICON_TEXT_SORT_ASCENDING, ICON_TEXT_SORT_DESCENDING, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo_redmerah from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { Tooltip } from "@/components/Tooltip"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, LinkMenuItem, SubMenu, close_submenu, close_menu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField, change_textfield_value } from "@/components/TextField"
import Drawer, { close_drawer, DrawerItem, open_drawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: Component<{
	is_generating: boolean
	randomizer: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
	on_copy_result: () => Promise<boolean>
	command: (type: Commands, ...args: unknown[]) => unknown
	on_change_randomizer: (type: RandomizerType) => void
}> = (props) => {
	const root = document_root()
	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_colormodelsettings_open, set_is_submenu_colormodelsettings_open] = createSignal<boolean>(false)
	const [is_submenu_wordcasesettings_open, set_is_submenu_wordcasesettings_open] = createSignal<boolean>(false)
	const [is_submenu_sortsettings_open, set_is_submenu_sortsettings_open] = createSignal<boolean>(false)
	const [is_submenu_numbertypesettings_open, set_is_submenu_numbertypesettings_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(ThemeData.system)
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const [timeout_copyerror_id, set_timeout_copyerror_id] = createSignal<number | null>(null)
	const [corner, set_corner] = createSignal<CornerData>(CornerData.round)
	const [is_sidenavigation_hidden, set_is_sidenavigation_hidden] = createSignal<boolean>(false)
	const settings = createMemo<Settings>(() => props.settings[0])
	const randomizer = createMemo(() => props.randomizer)
	const is_repeat = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) return s.numbers.repeat
		if (randomizer() == RandomizerType.words) return s.words.repeat
		return false
	})
	const isAnimation = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) return s.numbers.animation
		if (randomizer() == RandomizerType.words) return s.words.animation
		if (randomizer() == RandomizerType.string) return s.string.animation
		if (randomizer() == RandomizerType.selection) return s.selection.animation
		if (randomizer() == RandomizerType.colors) return s.colors.animation
		if (randomizer() == RandomizerType.teams) return s.teams.animation
		return false
	})
	let textfield_prefix_ref: HTMLInputElement
	let textfield_suffix_ref: HTMLInputElement
	let textfield_separator_ref: HTMLInputElement
	let textfield_decimallength_ref: HTMLInputElement
	let drawer_navigation_ref: HTMLDialogElement
	let menu_info_ref: HTMLDialogElement
	let menu_settings_ref: HTMLDialogElement
	let submenu_cornersettings_ref: HTMLDivElement
	let submenu_themesettings_ref: HTMLDivElement
	let submenu_wordcasesettings_ref: HTMLDivElement
	let submenu_sortsettings_ref: HTMLDivElement
	let submenu_numbertypesettings_ref: HTMLDivElement
	let submenu_colormodelsettings_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function change_theme(theme: ThemeData): Promise<void> {
		set_theme(theme)
		attr_set(root, RootAttributes.theme, theme)
		storage_set(LocalStorageKeys.theme, theme)
		close_submenu(submenu_themesettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_corner(corner: CornerData): Promise<void> {
		set_corner(corner)
		attr_set(root, RootAttributes.corner, corner)
		storage_set(LocalStorageKeys.corner, corner)
		close_submenu(submenu_cornersettings_ref)
		await wait(200)
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

	async function change_numbers_sort(sort: NumbersRandomizerSort): Promise<void> {
		command(Commands.change_settings_numbers_sort, sort)
		close_submenu(submenu_sortsettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_number_type(type: NumbersRandomizerNumberType): Promise<void> {
		command(Commands.change_settings_numbers_type, type)
		close_submenu(submenu_numbertypesettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	function init_inputs(): void {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) {
			const numbers = s.numbers
			if (textfield_prefix_ref) change_textfield_value(textfield_prefix_ref, numbers.prefix)
			if (textfield_suffix_ref) change_textfield_value(textfield_suffix_ref, numbers.suffix)
			if (textfield_separator_ref) change_textfield_value(textfield_separator_ref, numbers.separator)
			if (textfield_decimallength_ref) change_textfield_value(textfield_decimallength_ref, `${numbers.min_length}`)
		}
		else if (randomizer() == RandomizerType.words) {
			const words = s.words
			if (textfield_prefix_ref) change_textfield_value(textfield_prefix_ref, words.prefix)
			if (textfield_suffix_ref) change_textfield_value(textfield_suffix_ref, words.suffix)
			if (textfield_separator_ref) change_textfield_value(textfield_separator_ref, words.separator)
		}
	}

	async function change_words_wordcase(wordcase: WordsRandomizerWordCase): Promise<void> {
		command(Commands.change_settings_words_wordcase, wordcase)
		close_submenu(submenu_wordcasesettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	async function change_colors_model(model: ColorsRandomizerColorModel): Promise<void> {
		command(Commands.change_settings_colors_model, model)
		close_submenu(submenu_colormodelsettings_ref)
		await wait(200)
		close_menu(menu_settings_ref)
	}

	function init_sidenavigation_listener(): void {
		set_is_sidenavigation_hidden(window_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), 'change', ev => set_is_sidenavigation_hidden((ev as MediaQueryListEvent).matches))
	}

	onMount(() => {
		init_theme()
		init_corner()
		init_sidenavigation_listener()
	})

	const Menus: VoidComponent = () => {
		const button_info_share_id = createUniqueId()
		const input_settings_repeat_id = createUniqueId()
		const input_settings_animation_id = createUniqueId()
		const input_settings_prefix_id = createUniqueId()
		const input_settings_suffix_id = createUniqueId()
		const input_settings_separator_id = createUniqueId()
		const input_settings_mindecimallength_id = createUniqueId()
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
					c_icon_code={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c_icon_code={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c_icon_code={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c_icon_code={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={button_info_share_id}
					c_icon_code={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Tasks')}
					c_icon_code={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c_new_tab
					c_icon_code={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {date_year(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menu_settings_ref = r}
				c_on_toggleopen={(v) => set_is_menu_settings_open(v)}
				onFocusOut={ev => {
					const target = event_target(ev) as HTMLInputElement

					switch (element_id(target)) {
						case input_settings_prefix_id:
							command(Commands.change_settings_prefix, target.value)
							break
						case input_settings_suffix_id:
							command(Commands.change_settings_suffix, target.value)
							break
						case input_settings_separator_id:
							command(Commands.change_settings_separator, target.value)
							break
						case input_settings_mindecimallength_id:
							command(
								Commands.change_settings_numbers_minlength,
								number_safe(target.valueAsNumber)
							)
							break
					}
				}}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					switch (element_id(button)) {
						default:
							const data_number_sort = element_dataset(button, 'numberSort')
							if (data_number_sort
								&& valid_enum_value(data_number_sort, NumbersRandomizerSort)
							) return change_numbers_sort(data_number_sort as NumbersRandomizerSort)

							const data_number_type = element_dataset(button, 'numberType')
							if (data_number_type){
								const number_type = number_parse(data_number_type, true)
								if (
									number_is_not_defined(number_type)
									|| !valid_enum_value(number_type, NumbersRandomizerNumberType)
								) return

								return change_number_type(data_number_type as unknown as NumbersRandomizerNumberType)
							}

							const data_words_case = element_dataset(button, 'wordsCase')
							if (data_words_case
								&& valid_enum_value(data_words_case, WordsRandomizerWordCase)
							) return change_words_wordcase(data_words_case as WordsRandomizerWordCase)

							const data_colors_model = element_dataset(button, 'colorsModel')
							if (data_colors_model
								&& valid_enum_value(data_colors_model, ColorsRandomizerColorModel)
							) return change_colors_model(data_colors_model as ColorsRandomizerColorModel)

							const data_theme = element_dataset(button, 'theme')
							if (data_theme
								&& valid_enum_value(data_theme, ThemeData)
							) return change_theme(data_theme as ThemeData)

							const data_corner = element_dataset(button, 'corner')
							if (data_corner
								&& valid_enum_value(data_corner, CornerData)
							) return change_corner(data_corner as CornerData)
					}
				}}
				onChange={ev => {
					const target = event_target(ev) as HTMLInputElement
					switch (element_id(target)) {
						case input_settings_repeat_id:
							command(Commands.toggle_settings_repeat)
							break
						case input_settings_animation_id:
							command(Commands.toggle_settings_animation)
							break
					}
				}}>
				<MenuHeader>
					<Switch>
						<Match when={randomizer() == RandomizerType.string}>String</Match>
						<Match when={randomizer() == RandomizerType.words}>Words</Match>
						<Match when={randomizer() == RandomizerType.numbers}>Numbers</Match>
						<Match when={randomizer() == RandomizerType.colors}>Colors</Match>
						<Match when={randomizer() == RandomizerType.selection}>Selection</Match>
						<Match when={randomizer() == RandomizerType.teams}>Teams</Match>
					</Switch>
				</MenuHeader>
				<Show when={randomizer() == RandomizerType.numbers || randomizer() == RandomizerType.words}>
					<SwitchMenuItem
						c_checked={is_repeat()}
						c_icon_code={ICON_ARROW_CLOCKWISE}
						c_attr_switch={{id: input_settings_repeat_id}}
						c_trailing={<MenuIndent/>}>
						Repeat
					</SwitchMenuItem>
				</Show>
				<SwitchMenuItem
					c_checked={isAnimation()}
					c_attr_switch={{id: input_settings_animation_id}}
					c_icon_code={ICON_PLAY_CIRCLE_HINT}
					c_trailing={<MenuIndent/>}>
					Animation
				</SwitchMenuItem>
				<MenuDivider/>

				{/* Numbers */}
				<Show when={randomizer() == RandomizerType.numbers}>
					<SubMenu
						ref={r => submenu_sortsettings_ref = r}
						c_on_toggleopen={(v) => set_is_submenu_sortsettings_open(v)}
						c_item={<SubMenuItem
							c_focused={is_submenu_sortsettings_open()}
							c_icon_code={ICON_ARROW_SORT}>
							Sort
						</SubMenuItem>}>
						<MenuItem
							c_icon_code={ICON_ARROW_SHUFFLE}
							data-number-sort={NumbersRandomizerSort.none}
							c_selected={settings().numbers.sort == NumbersRandomizerSort.none}>
							None
						</MenuItem>
						<MenuItem
							c_icon_code={ICON_TEXT_SORT_ASCENDING}
							data-number-sort={NumbersRandomizerSort.ascending}
							c_selected={settings().numbers.sort == NumbersRandomizerSort.ascending}>
							Ascending
						</MenuItem>
						<MenuItem
							c_icon_code={ICON_TEXT_SORT_DESCENDING}
							data-number-sort={NumbersRandomizerSort.descending}
							c_selected={settings().numbers.sort == NumbersRandomizerSort.descending}>
							Descending
						</MenuItem>
					</SubMenu>
					<SubMenu
						ref={r => submenu_numbertypesettings_ref = r}
						c_on_toggleopen={(isOpen) => set_is_submenu_numbertypesettings_open(isOpen)}
						c_item={<SubMenuItem
							c_focused={is_submenu_numbertypesettings_open()}
							c_icon_code={ICON_NUMBER_SYMBOL}>
							Number type
						</SubMenuItem>}>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.decimal}
							c_selected={settings().numbers.type == NumbersRandomizerNumberType.decimal}>
							Decimal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.hexadecimal}
							c_selected={settings().numbers.type == NumbersRandomizerNumberType.hexadecimal}>
							Hexadecimal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.octal}
							c_selected={settings().numbers.type == NumbersRandomizerNumberType.octal}>
							Octal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.binary}
							c_selected={settings().numbers.type == NumbersRandomizerNumberType.binary}>
							Binary
						</MenuItem>
					</SubMenu>
				</Show>

				{/* Words */}
				<Show when={randomizer() == RandomizerType.words}>
					<SubMenu
						ref={r => submenu_wordcasesettings_ref = r}
						c_on_toggleopen={isOpen => set_is_submenu_wordcasesettings_open(isOpen)}
						c_item={<SubMenuItem
							c_focused={is_submenu_wordcasesettings_open()}
							c_icon_code={ICON_TEXT_CASE_TITLE}>
							Word case
						</SubMenuItem>}>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.none}
							c_selected={settings().words.wordcase == WordsRandomizerWordCase.none}>
							Default
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.uppercase}
							c_selected={settings().words.wordcase == WordsRandomizerWordCase.uppercase}>
							UPPER CASE
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.lowercase}
							c_selected={settings().words.wordcase == WordsRandomizerWordCase.lowercase}>
							lower case
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.titlecase}
							c_selected={settings().words.wordcase == WordsRandomizerWordCase.titlecase}>
							Title Case
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.togglecase}
							c_selected={settings().words.wordcase == WordsRandomizerWordCase.togglecase}>
							tOGGLE cASE
						</MenuItem>
					</SubMenu>
				</Show>

				{/* Colors */}
				<Show when={randomizer() == RandomizerType.colors}>
					<SubMenu
						ref={r => submenu_colormodelsettings_ref = r}
						style={{width: '128px'}}
						c_on_toggleopen={(v) => set_is_submenu_colormodelsettings_open(v)}
						c_item={<SubMenuItem
							c_focused={is_submenu_colormodelsettings_open()}
							c_icon_code={ICON_COLOR}>
							Color model
						</SubMenuItem>}>
						<MenuItem
							data-colors-model={ColorsRandomizerColorModel.hex}
							c_selected={settings().colors.model == ColorsRandomizerColorModel.hex}>
							HEX
						</MenuItem>
						<MenuItem
							data-colors-model={ColorsRandomizerColorModel.rgb}
							c_selected={settings().colors.model == ColorsRandomizerColorModel.rgb}>
							RGB
						</MenuItem>
						<MenuItem
							data-colors-model={ColorsRandomizerColorModel.hsl}
							c_selected={settings().colors.model == ColorsRandomizerColorModel.hsl}>
							HSL
						</MenuItem>
					</SubMenu>
				</Show>
				<SubMenu
					ref={r => submenu_themesettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_themesettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_themesettings_open()}
						c_icon_code={ICON_WEATHER_SUNNY}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c_selected={theme() == ThemeData.light}
						c_icon_code={ICON_WEATHER_SUNNY}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.dark}
						c_icon_code={ICON_WEATHER_MOON}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c_selected={theme() == ThemeData.system}
						c_icon_code={ICON_LAPTOP_SETTINGS}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_cornersettings_ref = r}
					c_on_toggleopen={v => set_is_submenu_cornersettings_open(v)}
					c_item={<SubMenuItem
						c_focused={is_submenu_cornersettings_open()}
						c_icon_code={ICON_TEARDROP_BOTTOM_RIGHT}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c_selected={corner() == CornerData.sharp}
						c_icon_code={ICON_MAXIMIZE}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.semi_round}
						c_icon_code={ICON_SQUARE}
						data-corner={CornerData.semi_round}>
						Semi round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.round}
						c_icon_code={ICON_TEARDROP_BOTTOM_RIGHT}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c_selected={corner() == CornerData.full_round}
						c_icon_code={ICON_CIRCLE}
						data-corner={CornerData.full_round}>
						Full round
					</MenuItem>
				</SubMenu>
				<Show when={randomizer() == RandomizerType.numbers || randomizer() == RandomizerType.words}>
					<MenuDivider/>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textfield_prefix_ref = r}
							c_label="Prefix"
							id={input_settings_prefix_id}
							c_leading={<Icon c_code={ICON_ALIGN_START_HORIZONTAL}/>}
						/>
					</div>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textfield_suffix_ref = r}
							c_label="Suffix"
							id={input_settings_suffix_id}
							c_leading={<Icon c_code={ICON_ALIGN_END_HORIZONTAL}/>}
						/>
					</div>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textfield_separator_ref = r}
							c_label="Separator"
							id={input_settings_separator_id}
							c_leading={<Icon c_code={ICON_COMMA}/>}
						/>
					</div>
				</Show>
				<Show when={randomizer() == RandomizerType.numbers}>
					<div class={ CSS.appbar_textfield_menu_item }>
						<Tooltip>
							<NumberTextField
								ref={r => textfield_decimallength_ref = r}
								min={0}
								id={input_settings_mindecimallength_id}
								c_label="Min decimal length"
								c_leading={<Icon c_code={ICON_DECIMAL_ARROW_LEFT}/>}
							/>
						</Tooltip>
					</div>
				</Show>
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

					switch (element_id(button)){
						case button_navigation_close_id:
							close_drawer(drawer_navigation_ref)
							break
						default:
							const data_type = element_dataset(button, 'type')
							if (data_type
								&& valid_enum_value(data_type, RandomizerType)
							) {
								if (randomizer() != data_type) {
									props.on_change_randomizer(data_type as RandomizerType)
								}

								close_drawer(drawer_navigation_ref)
							}
					}
				}}
				c_header={<Tooltip>
					<IconButton
						id={button_navigation_close_id}
						data-tooltip="Close navigation"
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						c_code={ICON_LINE_HORIZONTAL_3}
					/>
				</Tooltip>}
				ref={r => drawer_navigation_ref = r}>
				<For each={RANDOMIZER_TYPES}>{r =>
					<DrawerItem
						data-type={r.type}
						c_selected={randomizer() == r.type}>
						<Icon c_filled={randomizer() == r.type} c_code={r.icon}/>
						{ r.text }
					</DrawerItem>
				}</For>
			</Drawer>
		</>)
	}

	const AppBars: VoidComponent = () => {
		const button_navigation_id = createUniqueId()
		const button_generate_id = createUniqueId()
		const button_info_id = createUniqueId()
		const button_settings_id = createUniqueId()
		const button_copyresult_id = createUniqueId()
		return (<Tooltip>
			<AppBar
				onClick={async ev => {
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
						case button_generate_id:
							if (props.is_generating) return command(Commands.stop_generate)
							command(Commands.generate, ev)
							break
						case button_info_id:
							open_menu(ev, menu_info_ref, { anchor: button })
							break
						case button_settings_id:
							init_inputs()
							open_menu(ev, menu_settings_ref, { anchor: button })
							break
						case button_copyresult_id:
							const success = await props.on_copy_result()
							if (!success) {
								if (timeout_copyerror_id()) timeout_clear(timeout_copyerror_id()!)

								set_timeout_copyerror_id(timeout_set(() => {
									set_timeout_copyerror_id(null)
								}, 1000))
								return
							}

							if (timeout_copy_id()) timeout_clear(timeout_copy_id()!)

							set_timeout_copy_id(timeout_set(() => {
								set_timeout_copy_id(null)
							}, 1000))
							break
					}
				}}
				c_leading={<>
					<IconButton
						data-tooltip={is_sidenavigation_hidden()? "Open navigation" : "Expand/shrink navigation"}
						id={button_navigation_id}
						classList={classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						c_code={ICON_LINE_HORIZONTAL_3}
					/>
					<img width="32" src={app.logo_url} alt="Randomizer" />
				</>}
				c_headline="Randomizer"
				c_trailing={<>
					<Button
						classList={classlist_module(CSSAnimation.btn_rotate_full_icon, CSS.appbar_generate_btn)}
						data-g-keep-pointer-event={attr_set_if_exist(props.is_generating)}
						c_variant={ButtonVariant.filled}
						id={button_generate_id}>
						<Icon
							c_filled
							classList={classlist_module(CSS.appbar_generate_icon)}
							data-rotate={attr_set_if_exist(props.is_generating)}
							c_code={ICON_ARROW_SYNC}
						/>
						<Show when={props.is_generating} fallback="Generate">Generating</Show>
					</Button>
					<IconButton
						data-tooltip="Info"
						id={button_info_id}
						c_focused={is_menu_info_open()}
						c_code={ICON_INFO}
					/>
					<IconButton
						data-tooltip="Settings"
						classList={classlist_module(CSSAnimation.btn_rotate_icon)}
						c_focused={is_menu_settings_open()}
						id={button_settings_id}
						c_code={ICON_SETTINGS}
					/>
					<IconButton
						data-tooltip="Copy result"
						id={button_copyresult_id}
						c_code={timeout_copy_id()? ICON_CHECKMARK : timeout_copyerror_id()? ICON_DISMISS : ICON_COPY}
					/>
				</>}
			/>
		</Tooltip>)
	}

	return (<>
		<AppBars/>
		<Drawers/>
		<Menus/>
	</>)
}

export default _