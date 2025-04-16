import { type Component, For, Match, Show, Switch, type VoidComponent, createMemo, createSignal, createUniqueId, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"

import type { Settings } from "./_types"
import { attrSetIfExist, attrClassListModule } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { ThemeData } from "@/enums/theme"
import { LocalStorageKeys } from "@/enums/storage"
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorSpace, Commands } from "./_enums"
import { AnimationData } from "@/enums/animation"
import { CornerData } from "@/enums/corner"
import { RANDOMIZER_TYPES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { APP_RANDOMIZER as app } from "@/constants/apps"
import { elementValidTarget } from "@/utils/element"
import { validEnumValue } from "@/utils/object"
import { numberIsNotDefined, numberSafe } from "@/utils/number"
import { ICON_ALIGN_END_HORIZONTAL, ICON_ALIGN_START_HORIZONTAL, ICON_APPROVALS_APP, ICON_APPS, ICON_ARROW_CLOCKWISE, ICON_ARROW_SHUFFLE, ICON_ARROW_SORT, ICON_ARROW_SYNC, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COLOR, ICON_COMMA, ICON_COPY, ICON_DECIMAL_ARROW_LEFT, ICON_DISMISS, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_NUMBER_SYMBOL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_CASE_TITLE, ICON_TEXT_SORT_ASCENDING, ICON_TEXT_SORT_DESCENDING, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { Tooltip } from "@/components/Tooltip"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, LinkMenuItem, SubMenu, closeMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import TextField, { NumberTextField, updateTextFieldValue } from "@/components/TextField"
import Drawer, { closeDrawer, DrawerItem, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: Component<{
	isGenerating: boolean
	randomizer: RandomizerType
	settings: [Settings, SetStoreFunction<Settings>]
	onCopyResult: () => Promise<boolean>
	command: (type: Commands, ...args: unknown[]) => unknown
	onChangeRandomizer: (type: RandomizerType) => void
}> = (props) => {
	const root = document.documentElement
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [timeCopyId, setTimeCopyId] = createSignal<number | NodeJS.Timeout | null>(null)
	const [timeCopyErrorId, setTimeCopyErrorId] = createSignal<number | NodeJS.Timeout | null>(null)
	const [animation, setAnimation] = createSignal<AnimationData>(AnimationData.on)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const settings = createMemo<Settings>(() => props.settings[0])
	const randomizer = createMemo(() => props.randomizer)
	const isRepeat = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) return s.numbers.repeat
		if (randomizer() == RandomizerType.words) return s.words.repeat
		return false
	})
	const isInstant = createMemo<boolean>(() => {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) return s.numbers.instant
		if (randomizer() == RandomizerType.words) return s.words.instant
		if (randomizer() == RandomizerType.string) return s.string.instant
		if (randomizer() == RandomizerType.selection) return s.selection.instant
		if (randomizer() == RandomizerType.colors) return s.colors.instant
		if (randomizer() == RandomizerType.teams) return s.teams.instant
		return false
	})
	let textFieldPrefixRef: HTMLInputElement
	let textFieldSuffixRef: HTMLInputElement
	let textFieldSeparatorRef: HTMLInputElement
	let textFieldMinDigitsRef: HTMLInputElement
	let drawerNavigationRef: HTMLDialogElement
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateAnimation(animation: AnimationData): void {
		setAnimation(animation)
		root.setAttribute(RootAttributes.animation, animation)
		localStorage.setItem(LocalStorageKeys.platformAnimation, animation)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		root.setAttribute(RootAttributes.theme, theme)
		localStorage.setItem(LocalStorageKeys.platformTheme, theme)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		root.setAttribute(RootAttributes.corner, corner)
		localStorage.setItem(LocalStorageKeys.corner, corner)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)

		if (theme && validEnumValue(theme, ThemeData)) {
			root.setAttribute(RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = localStorage.getItem(LocalStorageKeys.corner)

		if (corner && validEnumValue(corner, CornerData)) {
			root.setAttribute(RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function updateNumbersSort(sort: NumbersRandomizerSort): void {
		command(Commands.updateSettingsNumbersSort, sort)
		closeMenu(menuSettingsRef)
	}

	function updateNumberType(type: NumbersRandomizerNumberType): void {
		command(Commands.updateSettingsNumbersType, type)
		closeMenu(menuSettingsRef)
	}

	function initInputs(): void {
		const s = settings()
		if (randomizer() == RandomizerType.numbers) {
			const numbers = s.numbers
			if (textFieldPrefixRef) updateTextFieldValue(textFieldPrefixRef, numbers.prefix)
			if (textFieldSuffixRef) updateTextFieldValue(textFieldSuffixRef, numbers.suffix)
			if (textFieldSeparatorRef) updateTextFieldValue(textFieldSeparatorRef, numbers.separator)
			if (textFieldMinDigitsRef) updateTextFieldValue(textFieldMinDigitsRef, `${numbers.minDigits}`)
		}
		else if (randomizer() == RandomizerType.words) {
			const words = s.words
			if (textFieldPrefixRef) updateTextFieldValue(textFieldPrefixRef, words.prefix)
			if (textFieldSuffixRef) updateTextFieldValue(textFieldSuffixRef, words.suffix)
			if (textFieldSeparatorRef) updateTextFieldValue(textFieldSeparatorRef, words.separator)
		}
	}

	function updateWordsWordCase(wordcase: WordsRandomizerWordCase): void {
		command(Commands.updateSettingsWordsWordcase, wordcase)
		closeMenu(menuSettingsRef)
	}

	function updateColorsSpace(space: ColorsRandomizerColorSpace): void {
		command(Commands.updateSettingsColorsSpace, space)
		closeMenu(menuSettingsRef)
	}

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(
			window.matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`).matches
		)
		window.matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`).addEventListener(
			'change', ev => setIsSideNavigationHidden(ev.matches)
		)
	}

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (animation && validEnumValue(animation, AnimationData)) {
			root.setAttribute(RootAttributes.animation, animation)
			setAnimation(animation as AnimationData)
		}
	}

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
		initAnimation()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const inputSettings_repeatId = createUniqueId()
		const inputSettings_instantId = createUniqueId()
		const inputSettings_prefixId = createUniqueId()
		const inputSettings_suffixId = createUniqueId()
		const inputSettings_separatorId = createUniqueId()
		const inputSettings_minDigitsId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button
					)) return

					switch (button.id) {
					case buttonInfo_shareId:
						navigator.share({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: document.location.origin + app.link
						})
						break
					}

					closeMenu(menuInfoRef)
				}}
				style={{width: '200px'}}
				ref={r => menuInfoRef = r}
				c:onToggleOpen={(v) => setIsMenuInfoOpen(v)}>
				<LinkMenuItem
					href={RoutesLinks.home}
					c:leading={<img src={logoRedmerah.src} width={16} alt='Redmerah logo'/>}>
					Redmerah
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.apps}
					c:iconCode={ICON_APPS}>
					More apps
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.about}
					c:iconCode={ICON_INFO}>
					About us
				</LinkMenuItem>
				<MenuDivider />
				<LinkMenuItem
					href={RoutesLinks.privacy}
					c:iconCode={ICON_SHIELD_CHECKMARK}>
					Privacy policy
				</LinkMenuItem>
				<LinkMenuItem
					href={RoutesLinks.terms}
					c:iconCode={ICON_RECEIPT}>
					Terms & conditions
				</LinkMenuItem>
				<MenuDivider />
				<MenuItem
					id={buttonInfo_shareId}
					c:iconCode={ICON_SHARE_ANDROID}>
					Share
				</MenuItem>
				<LinkMenuItem
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + encodeURI('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {new Date().getFullYear()} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onFocusOut={ev => {
					const target = ev.target as HTMLInputElement

					switch (target.id) {
					case inputSettings_prefixId:
						command(Commands.updateSettingsPrefix, target.value)
						break
					case inputSettings_suffixId:
						command(Commands.updateSettingsSuffix, target.value)
						break
					case inputSettings_separatorId:
						command(Commands.updateSettingsSeparator, target.value)
						break
					case inputSettings_minDigitsId:
						command(
							Commands.updateSettingsNumbersMinDigits,
							numberSafe(target.valueAsNumber)
						)
						break
					}
				}}
				onClick={ev => {
					const button = document.activeElement! as HTMLElement
					if (!elementValidTarget(
						ev.currentTarget,
						button
					)) return

					const dataset = button.dataset
					const dataNumberSort = dataset.numberSort
					if (dataNumberSort
						&& validEnumValue(dataNumberSort, NumbersRandomizerSort)
					) return updateNumbersSort(dataNumberSort as NumbersRandomizerSort)

					const dataNumberType = dataset.numberType
					if (dataNumberType){
						const numberType = Number.parseInt(dataNumberType)
						if (
							numberIsNotDefined(numberType)
							|| !validEnumValue(numberType, NumbersRandomizerNumberType)
						) return

						return updateNumberType(dataNumberType as unknown as NumbersRandomizerNumberType)
					}

					const dataWordsCase = dataset.wordsCase
					if (dataWordsCase
						&& validEnumValue(dataWordsCase, WordsRandomizerWordCase)
					) return updateWordsWordCase(dataWordsCase as WordsRandomizerWordCase)

					const dataColorsSpace = dataset.colorsSpace
					if (dataColorsSpace
						&& validEnumValue(dataColorsSpace, ColorsRandomizerColorSpace)
					) return updateColorsSpace(dataColorsSpace as ColorsRandomizerColorSpace)

					const dataTheme = dataset.theme
					if (dataTheme
						&& validEnumValue(dataTheme, ThemeData)
					) return updateTheme(dataTheme as ThemeData)

					const dataCorner = dataset.corner
					if (dataCorner
						&& validEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)
				}}
				onChange={ev => {
					const target = ev.target as HTMLInputElement
					switch (target.id) {
					case inputSettings_repeatId:
						command(Commands.toggleSettingsRepeat)
						break
					case inputSettings_instantId:
						command(Commands.toggleSettingsAnimation)
						break
					case inputSettings_animationId:
						updateAnimation(animation() === AnimationData.on
							? AnimationData.off
							: AnimationData.on
						)
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
						c:checked={isRepeat()}
						c:iconCode={ICON_ARROW_CLOCKWISE}
						c:attrSwitch={{id: inputSettings_repeatId}}
						c:trailing={<MenuIndent/>}>
						Repeat
					</SwitchMenuItem>
				</Show>
				<SwitchMenuItem
					c:checked={isInstant()}
					c:attrSwitch={{id: inputSettings_instantId}}
					c:iconCode={ICON_APPROVALS_APP}
					c:trailing={<MenuIndent/>}>
					Instant result
				</SwitchMenuItem>
				<SwitchMenuItem
					c:checked={animation() === AnimationData.on}
					c:iconCode={ICON_PLAY_CIRCLE_HINT}
					c:attrSwitch={{id: inputSettings_animationId}}>
					Animation
				</SwitchMenuItem>
				<MenuDivider/>

				{/* Numbers */}
				<Show when={randomizer() == RandomizerType.numbers}>
					<SubMenu
						c:item={<SubMenuItem
							c:iconCode={ICON_ARROW_SORT}>
							Sort
						</SubMenuItem>}>
						<MenuItem
							c:iconCode={ICON_ARROW_SHUFFLE}
							data-number-sort={NumbersRandomizerSort.none}
							c:selected={settings().numbers.sort == NumbersRandomizerSort.none}>
							None
						</MenuItem>
						<MenuItem
							c:iconCode={ICON_TEXT_SORT_ASCENDING}
							data-number-sort={NumbersRandomizerSort.ascending}
							c:selected={settings().numbers.sort == NumbersRandomizerSort.ascending}>
							Ascending
						</MenuItem>
						<MenuItem
							c:iconCode={ICON_TEXT_SORT_DESCENDING}
							data-number-sort={NumbersRandomizerSort.descending}
							c:selected={settings().numbers.sort == NumbersRandomizerSort.descending}>
							Descending
						</MenuItem>
					</SubMenu>
					<SubMenu
						c:item={<SubMenuItem
							c:iconCode={ICON_NUMBER_SYMBOL}>
							Number type
						</SubMenuItem>}>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.decimal}
							c:selected={settings().numbers.type == NumbersRandomizerNumberType.decimal}>
							Decimal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.hexadecimal}
							c:selected={settings().numbers.type == NumbersRandomizerNumberType.hexadecimal}>
							Hexadecimal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.octal}
							c:selected={settings().numbers.type == NumbersRandomizerNumberType.octal}>
							Octal
						</MenuItem>
						<MenuItem
							data-number-type={NumbersRandomizerNumberType.binary}
							c:selected={settings().numbers.type == NumbersRandomizerNumberType.binary}>
							Binary
						</MenuItem>
					</SubMenu>
				</Show>

				{/* Words */}
				<Show when={randomizer() == RandomizerType.words}>
					<SubMenu
						c:item={<SubMenuItem
							c:iconCode={ICON_TEXT_CASE_TITLE}>
							Word case
						</SubMenuItem>}>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.none}
							c:selected={settings().words.wordCase == WordsRandomizerWordCase.none}>
							Default
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.uppercase}
							c:selected={settings().words.wordCase == WordsRandomizerWordCase.uppercase}>
							UPPER CASE
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.lowercase}
							c:selected={settings().words.wordCase == WordsRandomizerWordCase.lowercase}>
							lower case
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.titlecase}
							c:selected={settings().words.wordCase == WordsRandomizerWordCase.titlecase}>
							Title Case
						</MenuItem>
						<MenuItem
							data-words-case={WordsRandomizerWordCase.togglecase}
							c:selected={settings().words.wordCase == WordsRandomizerWordCase.togglecase}>
							tOGGLE cASE
						</MenuItem>
					</SubMenu>
				</Show>

				{/* Colors */}
				<Show when={randomizer() == RandomizerType.colors}>
					<SubMenu
						style={{width: '128px'}}
						c:item={<SubMenuItem
							c:iconCode={ICON_COLOR}>
							Color space
						</SubMenuItem>}>
						<MenuItem
							data-colors-space={ColorsRandomizerColorSpace.hex}
							c:selected={settings().colors.space == ColorsRandomizerColorSpace.hex}>
							HEX
						</MenuItem>
						<MenuItem
							data-colors-space={ColorsRandomizerColorSpace.rgb}
							c:selected={settings().colors.space == ColorsRandomizerColorSpace.rgb}>
							RGB
						</MenuItem>
						<MenuItem
							data-colors-space={ColorsRandomizerColorSpace.hsl}
							c:selected={settings().colors.space == ColorsRandomizerColorSpace.hsl}>
							HSL
						</MenuItem>
					</SubMenu>
				</Show>
				<SubMenu
					c:item={<SubMenuItem
						c:iconCode={ICON_WEATHER_SUNNY}>
						Theme
					</SubMenuItem>}>
					<MenuItem
						c:selected={theme() == ThemeData.light}
						c:iconCode={ICON_WEATHER_SUNNY}
						data-theme={ThemeData.light}>
						Light
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.dark}
						c:iconCode={ICON_WEATHER_MOON}
						data-theme={ThemeData.dark}>
						Dark
					</MenuItem>
					<MenuItem
						c:selected={theme() == ThemeData.system}
						c:iconCode={ICON_LAPTOP_SETTINGS}
						data-theme={ThemeData.system}>
						System theme
					</MenuItem>
				</SubMenu>
				<SubMenu
					c:item={<SubMenuItem
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}>
						Corner style
					</SubMenuItem>}>
					<MenuItem
						c:selected={corner() == CornerData.sharp}
						c:iconCode={ICON_MAXIMIZE}
						data-corner={CornerData.sharp}>
						Sharp
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.semiRound}
						c:iconCode={ICON_SQUARE}
						data-corner={CornerData.semiRound}>
						Semi round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.round}
						c:iconCode={ICON_TEARDROP_BOTTOM_RIGHT}
						data-corner={CornerData.round}>
						Round
					</MenuItem>
					<MenuItem
						c:selected={corner() == CornerData.fullRound}
						c:iconCode={ICON_CIRCLE}
						data-corner={CornerData.fullRound}>
						Full round
					</MenuItem>
				</SubMenu>
				<Show when={randomizer() == RandomizerType.numbers || randomizer() == RandomizerType.words}>
					<MenuDivider/>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textFieldPrefixRef = r}
							c:label="Prefix"
							id={inputSettings_prefixId}
							c:leading={<Icon c:code={ICON_ALIGN_START_HORIZONTAL}/>}
						/>
					</div>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textFieldSuffixRef = r}
							c:label="Suffix"
							id={inputSettings_suffixId}
							c:leading={<Icon c:code={ICON_ALIGN_END_HORIZONTAL}/>}
						/>
					</div>
					<div class={ CSS.appbar_textfield_menu_item }>
						<TextField
							ref={r => textFieldSeparatorRef = r}
							c:label="Separator"
							id={inputSettings_separatorId}
							c:leading={<Icon c:code={ICON_COMMA}/>}
						/>
					</div>
				</Show>
				<Show when={randomizer() == RandomizerType.numbers}>
					<div class={ CSS.appbar_textfield_menu_item }>
						<Tooltip>
							<NumberTextField
								ref={r => textFieldMinDigitsRef = r}
								min={0}
								id={inputSettings_minDigitsId}
								c:label="Min digits"
								c:leading={<Icon c:code={ICON_DECIMAL_ARROW_LEFT}/>}
							/>
						</Tooltip>
					</div>
				</Show>
			</Menu>
		</>)
	}

	const Drawers: VoidComponent = () => {
		const buttonNavigation_closeId = createUniqueId()
		return (<>
			<Drawer
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id){
					case buttonNavigation_closeId:
						closeDrawer(drawerNavigationRef)
						break
					default:
						const dataset = button.dataset
						const dataType = dataset.type
						if (dataType
							&& validEnumValue(dataType, RandomizerType)
						) {
							if (randomizer() != dataType) {
								props.onChangeRandomizer(dataType as RandomizerType)
							}

							closeDrawer(drawerNavigationRef)
						}
					}
				}}
				c:header={<Tooltip>
					<IconButton
						id={buttonNavigation_closeId}
						data-tooltip="Close navigation"
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
				</Tooltip>}
				ref={r => drawerNavigationRef = r}>
				<For each={RANDOMIZER_TYPES}>{r =>
					<DrawerItem
						data-type={r.type}
						c:selected={randomizer() == r.type}>
						<Icon c:filled={randomizer() == r.type} c:code={r.icon}/>
						{ r.text }
					</DrawerItem>
				}</For>
			</Drawer>
		</>)
	}

	const AppBars: VoidComponent = () => {
		const buttonNavigationId = createUniqueId()
		const buttonGenerateId = createUniqueId()
		const buttonInfoId = createUniqueId()
		const buttonSettingsId = createUniqueId()
		const buttonCopyResultId = createUniqueId()
		return (<Tooltip>
			<AppBar
				onClick={async ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonNavigationId:
						if (isSideNavigationHidden()) return openDrawer(drawerNavigationRef)
						command(Commands.toggleNavigationExpand)
						break
					case buttonGenerateId:
						if (props.isGenerating) return command(Commands.stopGenerate)
						command(Commands.generate)
						break
					case buttonInfoId:
						openMenu(menuInfoRef, { anchor: button })
						break
					case buttonSettingsId:
						initInputs()
						openMenu(menuSettingsRef, { anchor: button })
						break
					case buttonCopyResultId:
						const success = await props.onCopyResult()
						if (!success) {
							if (timeCopyErrorId()) clearTimeout(timeCopyErrorId()!)

							setTimeCopyErrorId(setTimeout(() => {
								setTimeCopyErrorId(null)
							}, 1000))
							return
						}

						if (timeCopyId()) clearTimeout(timeCopyId()!)

						setTimeCopyId(setTimeout(() => {
							setTimeCopyId(null)
						}, 1000))
						break
					}
				}}
				c:leading={<>
					<IconButton
						data-tooltip={isSideNavigationHidden()? "Open navigation" : "Expand/shrink navigation"}
						id={buttonNavigationId}
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
					<img width="32" src={app.logoUrl} alt={app.name + ' logo'} />
				</>}
				c:headline={app.name}
				c:trailing={<>
					<Button
						classList={attrClassListModule(CSSAnimation.btn_rotate_full_icon, CSS.appbar_generate_btn)}
						data-g-keep-pointer-event={attrSetIfExist(props.isGenerating)}
						c:variant={ButtonVariant.filled}
						id={buttonGenerateId}>
						<Icon
							c:filled
							classList={attrClassListModule(CSS.appbar_generate_icon)}
							data-rotate={attrSetIfExist(props.isGenerating)}
							c:code={ICON_ARROW_SYNC}
						/>
						<Show when={props.isGenerating} fallback="Generate">Generating</Show>
					</Button>
					<IconButton
						data-tooltip="Info"
						id={buttonInfoId}
						c:focused={isMenuInfoOpen()}
						c:code={ICON_INFO}
					/>
					<IconButton
						data-tooltip="Settings"
						classList={attrClassListModule(CSSAnimation.btn_rotate_icon)}
						c:focused={isMenuSettingsOpen()}
						id={buttonSettingsId}
						c:code={ICON_SETTINGS}
					/>
					<IconButton
						data-tooltip="Copy result"
						id={buttonCopyResultId}
						c:code={timeCopyId()? ICON_CHECKMARK : timeCopyErrorId()? ICON_DISMISS : ICON_COPY}
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