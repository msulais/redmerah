import { type Component, For, Match, Show, Switch, type VoidComponent, createMemo, createSignal, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"

import type { Settings } from "./_types"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { attr_set, attr_set_if_exist } from "@/utils/attributes"
import { add_classlist_module } from "@/utils/element"
import { RootAttributes } from "@/enums/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { ThemeData } from "@/enums/theme"
import { storage_get, storage_set } from "@/utils/storage"
import { LocalStorageKeys } from "@/enums/storage"
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorModel, Commands } from "./_enums"
import { url_encode } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { is_window_media_matches } from "@/utils/window"
import { RANDOMIZER_TYPES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { event_add_listener } from "@/utils/event"
import { array_includes } from "@/utils/array"
import { navigator_share } from "@/utils/navigator"
import { date_year } from "@/utils/datetime"
import { number_safe } from "@/utils/number"
import logo from '@/assets/apps/randomizer-logo.svg'
import redmerah_logo from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { TextTooltip } from "@/components/Tooltip"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, LinkMenuItem, SubMenu, close_submenu, close_menu, open_menu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField, change_textfield_value } from "@/components/TextField"
import Drawer, { close_drawer, DrawerItem, openDrawer } from "@/components/Drawer"
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
	const root = document.documentElement
	const theme_system = ThemeData.system
	const theme_light = ThemeData.light
	const theme_dark = ThemeData.dark
	const corner_sharp = CornerData.sharp
	const corner_semiround = CornerData.semi_round
	const corner_round = CornerData.round
	const corner_fullround = CornerData.full_round
	const randomizer_string = RandomizerType.string
	const randomizer_numbers = RandomizerType.numbers
	const randomizer_words = RandomizerType.words
	const randomizer_selection = RandomizerType.selection
	const randomizer_colors = RandomizerType.colors
	const randomizer_teams = RandomizerType.teams

	const [is_menu_info_open, set_is_menu_info_open] = createSignal<boolean>(false)
	const [is_menu_settings_open, set_is_menu_settings_open] = createSignal<boolean>(false)
	const [is_submenu_themesettings_open, set_is_submenu_themesettings_open] = createSignal<boolean>(false)
	const [is_submenu_cornersettings_open, set_is_submenu_cornersettings_open] = createSignal<boolean>(false)
	const [is_submenu_colormodelsettings_open, set_is_submenu_colormodelsettings_open] = createSignal<boolean>(false)
	const [is_submenu_wordcasesettings_open, set_is_submenu_wordcasesettings_open] = createSignal<boolean>(false)
	const [is_submenu_sortsettings_open, set_is_submenu_sortsettings_open] = createSignal<boolean>(false)
	const [is_submenu_numbertypesettings_open, set_is_submenu_numbertypesettings_open] = createSignal<boolean>(false)
	const [theme, set_theme] = createSignal<ThemeData>(theme_system)
	const [timeout_copy_id, set_timeout_copy_id] = createSignal<number | null>(null)
	const [timeout_copyerror_id, set_timeout_copyerror_id] = createSignal<number | null>(null)
	const [corner, set_corner] = createSignal<CornerData>(corner_round)
	const [is_sidenavigation_hidden, set_is_sidenavigation_hidden] = createSignal<boolean>(false)
	const settings = createMemo<Settings>(() => props.settings[0])
	const randomizer = createMemo(() => props.randomizer)
	const is_repeat = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == randomizer_numbers) return s.numbers.repeat
		if (randomizer() == randomizer_words) return s.words.repeat
		return false
	})
	const isAnimation = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == randomizer_numbers) return s.numbers.animation
		if (randomizer() == randomizer_words) return s.words.animation
		if (randomizer() == randomizer_string) return s.string.animation
		if (randomizer() == randomizer_selection) return s.selection.animation
		if (randomizer() == randomizer_colors) return s.colors.animation
		if (randomizer() == randomizer_teams) return s.teams.animation
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

	async function change_numbers_sort(sort: NumbersRandomizerSort): Promise<void> {
		command(Commands.change_settings_numbers_sort, sort)
		close_submenu(submenu_sortsettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function changeNumbersType(type: NumbersRandomizerNumberType): Promise<void> {
		command(Commands.change_settings_numbers_type, type)
		close_submenu(submenu_numbertypesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	function init_inputs(): void {
		const s = settings()
		if (randomizer() == randomizer_numbers) {
			const numbers = s.numbers
			if (textfield_prefix_ref) change_textfield_value(textfield_prefix_ref, numbers.prefix)
			if (textfield_suffix_ref) change_textfield_value(textfield_suffix_ref, numbers.suffix)
			if (textfield_separator_ref) change_textfield_value(textfield_separator_ref, numbers.separator)
			if (textfield_decimallength_ref) change_textfield_value(textfield_decimallength_ref, `${numbers.min_length}`)
		}
		else if (randomizer() == randomizer_words) {
			const words = s.words
			if (textfield_prefix_ref) change_textfield_value(textfield_prefix_ref, words.prefix)
			if (textfield_suffix_ref) change_textfield_value(textfield_suffix_ref, words.suffix)
			if (textfield_separator_ref) change_textfield_value(textfield_separator_ref, words.separator)
		}
	}

	async function change_words_wordcase(wordcase: WordsRandomizerWordCase): Promise<void> {
		command(Commands.change_settings_words_wordcase, wordcase)
		close_submenu(submenu_wordcasesettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	async function change_colors_model(model: ColorsRandomizerColorModel): Promise<void> {
		command(Commands.change_settings_colors_model, model)
		close_submenu(submenu_colormodelsettings_ref)
		await wait(300)
		close_menu(menu_settings_ref)
	}

	function init_sidenavigation_listener(): void {
		set_is_sidenavigation_hidden(is_window_media_matches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		event_add_listener(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), 'change', ev => set_is_sidenavigation_hidden((ev as MediaQueryListEvent).matches))
	}

	onMount(() => {
		init_theme()
		init_corner()
		init_sidenavigation_listener()
	})

	const Menus: VoidComponent = () => (<>
		<Menu
			ref={r => menu_info_ref = r}
			style={{"min-width": '200px'}}
			on_toggle_open={isOpen => set_is_menu_info_open(isOpen)}>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={RoutesLinks.home}
				leading={<img src={redmerah_logo.src} width={16} alt='Redmerah logo'/>}>
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
					navigator_share({ title: 'Randomizer', text: 'Randomizer', url: document.URL })
					close_menu(menu_info_ref)
				}}
				icon_code={0xEE23}>
				Share
			</MenuItem>
			<LinkMenuItem
				onClick={() => close_menu(menu_info_ref)}
				href={'mailto:' + ExternalLinks.contact_email + '?subject=' + url_encode('Randomizer')}
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
		<Menu ref={r => menu_settings_ref = r} on_toggle_open={(v) => set_is_menu_settings_open(v)}>
			<MenuHeader>
				<Switch>
					<Match when={randomizer() == randomizer_string}>String</Match>
					<Match when={randomizer() == randomizer_words}>Words</Match>
					<Match when={randomizer() == randomizer_numbers}>Numbers</Match>
					<Match when={randomizer() == randomizer_colors}>Colors</Match>
					<Match when={randomizer() == randomizer_selection}>Selection</Match>
					<Match when={randomizer() == randomizer_teams}>Teams</Match>
				</Switch>
			</MenuHeader>
			<Show when={randomizer() == randomizer_numbers || randomizer() == randomizer_words}>
				<SwitchMenuItem
					checked={is_repeat()}
					icon_code={0xE0A1}
					attr_switch={{
						onChange: () => command(Commands.toggle_settings_repeat)
					}}
					trailing={<MenuIndent/>}>
					Repeat
				</SwitchMenuItem>
			</Show>
			<SwitchMenuItem
				checked={isAnimation()}
				attr_switch={{
					onChange: () => command(Commands.toggle_settings_animation)
				}}
				icon_code={0xECBA}
				trailing={<MenuIndent/>}>
				Animation
			</SwitchMenuItem>
			<MenuDivider/>

			{/* Numbers */}
			<Show when={randomizer() == randomizer_numbers}>
				<SubMenu
					ref={r => submenu_sortsettings_ref = r}
					on_toggle_open={(v) => set_is_submenu_sortsettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_sortsettings_open()}
						icon_code={0xE123}>
						Sort
					</SubMenuItem>}>
					<MenuItem
						icon_code={0xE11F}
						onClick={() => change_numbers_sort(NumbersRandomizerSort.none)}
						selected={settings().numbers.sort == NumbersRandomizerSort.none}>
						None
					</MenuItem>
					<MenuItem
						icon_code={0xF187}
						onClick={() => change_numbers_sort(NumbersRandomizerSort.ascending)}
						selected={settings().numbers.sort == NumbersRandomizerSort.ascending}>
						Ascending
					</MenuItem>
					<MenuItem
						icon_code={0xF189}
						onClick={() => change_numbers_sort(NumbersRandomizerSort.descending)}
						selected={settings().numbers.sort == NumbersRandomizerSort.descending}>
						Descending
					</MenuItem>
				</SubMenu>
				<SubMenu
					ref={r => submenu_numbertypesettings_ref = r}
					on_toggle_open={(isOpen) => set_is_submenu_numbertypesettings_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_numbertypesettings_open()}
						icon_code={0xEB4B}>
						Number type
					</SubMenuItem>}>
					<MenuItem
						onClick={() => changeNumbersType(NumbersRandomizerNumberType.decimal)}
						selected={settings().numbers.type == NumbersRandomizerNumberType.decimal}>
						Decimal
					</MenuItem>
					<MenuItem
						onClick={() => changeNumbersType(NumbersRandomizerNumberType.hexadecimal)}
						selected={settings().numbers.type == NumbersRandomizerNumberType.hexadecimal}>
						Hexadecimal
					</MenuItem>
					<MenuItem
						onClick={() => changeNumbersType(NumbersRandomizerNumberType.octal)}
						selected={settings().numbers.type == NumbersRandomizerNumberType.octal}>
						Octal
					</MenuItem>
					<MenuItem
						onClick={() => changeNumbersType(NumbersRandomizerNumberType.binary)}
						selected={settings().numbers.type == NumbersRandomizerNumberType.binary}>
						Binary
					</MenuItem>
				</SubMenu>
			</Show>

			{/* Words */}
			<Show when={randomizer() == randomizer_words}>
				<SubMenu
					ref={r => submenu_wordcasesettings_ref = r}
					on_toggle_open={isOpen => set_is_submenu_wordcasesettings_open(isOpen)}
					item={<SubMenuItem
						focused={is_submenu_wordcasesettings_open()}
						icon_code={0xF0FF}>
						Word case
					</SubMenuItem>}>
					<MenuItem
						onClick={() => change_words_wordcase(WordsRandomizerWordCase.none)}
						selected={settings().words.wordcase == WordsRandomizerWordCase.none}>
						Default
					</MenuItem>
					<MenuItem
						onClick={() => change_words_wordcase(WordsRandomizerWordCase.uppercase)}
						selected={settings().words.wordcase == WordsRandomizerWordCase.uppercase}>
						UPPER CASE
					</MenuItem>
					<MenuItem
						onClick={() => change_words_wordcase(WordsRandomizerWordCase.lowercase)}
						selected={settings().words.wordcase == WordsRandomizerWordCase.lowercase}>
						lower case
					</MenuItem>
					<MenuItem
						onClick={() => change_words_wordcase(WordsRandomizerWordCase.titlecase)}
						selected={settings().words.wordcase == WordsRandomizerWordCase.titlecase}>
						Title Case
					</MenuItem>
					<MenuItem
						onClick={() => change_words_wordcase(WordsRandomizerWordCase.togglecase)}
						selected={settings().words.wordcase == WordsRandomizerWordCase.togglecase}>
						tOGGLE cASE
					</MenuItem>
				</SubMenu>
			</Show>

			{/* Colors */}
			<Show when={randomizer() == randomizer_colors}>
				<SubMenu
					ref={r => submenu_colormodelsettings_ref = r}
					style={{width: '128px'}}
					on_toggle_open={(v) => set_is_submenu_colormodelsettings_open(v)}
					item={<SubMenuItem
						focused={is_submenu_colormodelsettings_open()}
						icon_code={0xE4B6}>
						Color model
					</SubMenuItem>}>
					<MenuItem
						onClick={() => change_colors_model(ColorsRandomizerColorModel.hex)}
						selected={settings().colors.model == ColorsRandomizerColorModel.hex}>
						HEX
					</MenuItem>
					<MenuItem
						onClick={() => change_colors_model(ColorsRandomizerColorModel.rgb)}
						selected={settings().colors.model == ColorsRandomizerColorModel.rgb}>
						RGB
					</MenuItem>
					<MenuItem
						onClick={() => change_colors_model(ColorsRandomizerColorModel.hsl)}
						selected={settings().colors.model == ColorsRandomizerColorModel.hsl}>
						HSL
					</MenuItem>
				</SubMenu>
			</Show>
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
			<Show when={randomizer() == randomizer_numbers || randomizer() == randomizer_words}>
				<MenuDivider/>
				<div class={ CSS.appbar_textfield_menu_item }>
					<TextField
						ref={r => textfield_prefix_ref = r}
						label="Prefix"
						onBlur={(ev) => command(Commands.change_settings_prefix, ev.currentTarget.value)}
						leading={<Icon code={0xE043}/>}
					/>
				</div>
				<div class={ CSS.appbar_textfield_menu_item }>
					<TextField
						ref={r => textfield_suffix_ref = r}
						label="Suffix"
						onBlur={(ev) => command(Commands.change_settings_suffix, ev.currentTarget.value)}
						leading={<Icon code={0xE02D}/>}
					/>
				</div>
				<div class={ CSS.appbar_textfield_menu_item }>
					<TextField
						ref={r => textfield_separator_ref = r}
						label="Separator"
						onBlur={(ev) => command(Commands.change_settings_separator, ev.currentTarget.value)}
						leading={<Icon code={0xE4CF}/>}
					/>
				</div>
			</Show>
			<Show when={randomizer() == randomizer_numbers}>
				<div class={ CSS.appbar_textfield_menu_item }>
					<NumberTextField
						ref={r => textfield_decimallength_ref = r}
						min={0}
						label="Min decimal length"
						onBlur={ev => command(
							Commands.change_settings_numbers_minlength,
							number_safe(ev.currentTarget.valueAsNumber)
						)}
						leading={<Icon code={0xE599}/>}
					/>
				</div>
			</Show>
		</Menu>
	</>)

	const Drawers: VoidComponent = () => (<>
		<Drawer
			header={<TextTooltip text="Close navigation">
				<IconButton
					classList={add_classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
					onClick={() => close_drawer(drawer_navigation_ref)}
					code={0xEAFF}
				/>
			</TextTooltip>}
			ref={r => drawer_navigation_ref = r}>
			<For each={RANDOMIZER_TYPES}>{r =>
				<DrawerItem
					onClick={() => {
						if (randomizer() != r.type) props.on_change_randomizer(r.type)

						close_drawer(drawer_navigation_ref)
					} }
					selected={randomizer() == r.type}>
					<Icon filled={randomizer() == r.type} code={r.icon}/>
					{ r.text }
				</DrawerItem>
			}</For>
		</Drawer>
	</>)

	return (<>
		<AppBar
			leading={<>
				<TextTooltip text={is_sidenavigation_hidden()? "Open navigation" : "Expand/shrink navigation"}>
					<IconButton
						onClick={(ev) => {
							if (is_sidenavigation_hidden()) return openDrawer(ev, drawer_navigation_ref)
							command(Commands.toggle_navigation_expand)
						}}
						classList={add_classlist_module(CSSAnimation.btn_shrink_horizontal_icon)}
						code={0xEAFF}
					/>
				</TextTooltip>
				<img width="32" src={logo.src} alt="Randomizer" />
			</>}
			headline="Randomizer"
			trailing={<>
				<Button
					classList={add_classlist_module(CSSAnimation.btn_rotate_full_icon, CSS.appbar_generate_btn)}
					data-g-keep-pointer-event={attr_set_if_exist(props.is_generating)}
					variant={ButtonVariant.filled}
					onClick={(ev) => {
						if (props.is_generating) return command(Commands.stop_generate)
						command(Commands.generate, ev)
					}}>
					<Icon
						filled
						classList={add_classlist_module(CSS.appbar_generate_icon)}
						data-rotate={attr_set_if_exist(props.is_generating)}
						code={0xE143}
					/>
					<Show when={props.is_generating} fallback="Generate">Generating</Show>
				</Button>
				<TextTooltip text="Info">
					<IconButton
						focused={is_menu_info_open()}
						code={0xE930}
						onClick={(ev) => open_menu(ev, menu_info_ref, {
							anchor: ev.currentTarget,
							padding: 4,
						})}
					/>
				</TextTooltip>
				<TextTooltip text="Settings">
					<IconButton
						classList={add_classlist_module(CSSAnimation.btn_rotate_icon)}
						focused={is_menu_settings_open()}
						onClick={async (ev) => {
							init_inputs()
							open_menu(ev, menu_settings_ref, {
								anchor: ev.currentTarget,
								padding: 4,
							})
						}}
						code={0xEE0F}
					/>
				</TextTooltip>
				<TextTooltip text="Copy result">
					<IconButton
						onClick={async () => {
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
						}}
						code={timeout_copy_id()? 0xE3D8 : timeout_copyerror_id()? 0xE5E9 : 0xE51B}
					/>
				</TextTooltip>
			</>}
		/>
		<Drawers/>
		<Menus/>
	</>)
}

export default _