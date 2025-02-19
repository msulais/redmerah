import { type Component, For, Match, Show, Switch, type VoidComponent, createMemo, createSignal, createUniqueId, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"

import type { Settings } from "./_types"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { attrSet, attrSetIfExist, attrClassListModule } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { ExternalLinks, RoutesLinks } from "@/enums/links"
import { ThemeData } from "@/enums/theme"
import { storageGet, storageSet } from "@/utils/storage"
import { LocalStorageKeys } from "@/enums/storage"
import { RandomizerType, NumbersRandomizerSort, NumbersRandomizerNumberType, WordsRandomizerWordCase, ColorsRandomizerColorSpace, Commands } from "./_enums"
import { urlEncode, urlOrigin } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { windowMatches } from "@/utils/window"
import { RANDOMIZER_TYPES, SIZE_SIDE_NAVIGATION_NONE } from "./_constants"
import { eventListenerAdd, eventCurrentTarget, eventTarget } from "@/utils/event"
import { documentActive, documentRoot } from "@/utils/document"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { APP_RANDOMIZER as app } from "@/constants/apps"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { validEnumValue } from "@/utils/object"
import { numberIsNotDefined, numberParse, numberSafe } from "@/utils/number"
import { ICON_ALIGN_END_HORIZONTAL, ICON_ALIGN_START_HORIZONTAL, ICON_APPS, ICON_ARROW_CLOCKWISE, ICON_ARROW_SHUFFLE, ICON_ARROW_SORT, ICON_ARROW_SYNC, ICON_CHAT, ICON_CHECKMARK, ICON_CIRCLE, ICON_COLOR, ICON_COMMA, ICON_COPY, ICON_DECIMAL_ARROW_LEFT, ICON_DISMISS, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MAXIMIZE, ICON_NUMBER_SYMBOL, ICON_PLAY_CIRCLE_HINT, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_TEXT_CASE_TITLE, ICON_TEXT_SORT_ASCENDING, ICON_TEXT_SORT_DESCENDING, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logoRedmerah from '@/assets/images/logos/redmerah-logo.svg'

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { Tooltip } from "@/components/Tooltip"
import Menu, { MenuDivider, MenuHeader, MenuIndent, MenuItem, LinkMenuItem, SubMenu, closeSubMenu, closeMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
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
	const root = documentRoot()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_colorSpaceOpen, setIsSubMenuSettings_colorSpaceOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_wordCaseOpen, setIsSubMenuSettings_wordCaseOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_sortOpen, setIsSubMenuSettings_sortOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_numberTypeOpen, setIsSubMenuSettings_numberTypeOpen] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [timeCopyId, setTimeCopyId] = createSignal<number | null>(null)
	const [timeCopyErrorId, setTimeCopyErrorId] = createSignal<number | null>(null)
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
	let textFieldPrefixRef: HTMLInputElement
	let textFieldSuffixRef: HTMLInputElement
	let textFieldSeparatorRef: HTMLInputElement
	let textFieldMinDigitsRef: HTMLInputElement
	let drawerNavigationRef: HTMLDialogElement
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_wordCaseRef: HTMLDivElement
	let subMenuSettings_sortRef: HTMLDivElement
	let subMenuSettings_numberTypeRef: HTMLDivElement
	let subMenuSettings_colorSpaceRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateTheme(theme: ThemeData): void {
		setTheme(theme)
		attrSet(root, RootAttributes.theme, theme)
		storageSet(LocalStorageKeys.theme, theme)
		closeSubMenu(subMenuSettings_themeRef)
		closeMenu(menuSettingsRef)
	}

	function updateCorner(corner: CornerData): void {
		setCorner(corner)
		attrSet(root, RootAttributes.corner, corner)
		storageSet(LocalStorageKeys.corner, corner)
		closeSubMenu(subMenuSettings_cornerRef)
		closeMenu(menuSettingsRef)
	}

	function initTheme(): void {
		const theme = storageGet(LocalStorageKeys.theme)

		if (theme && validEnumValue(theme, ThemeData)) {
			attrSet(root, RootAttributes.theme, theme)
			setTheme(theme as ThemeData)
		}
	}

	function initCorner(): void {
		const corner = storageGet(LocalStorageKeys.corner)

		if (corner && validEnumValue(corner, CornerData)) {
			attrSet(root, RootAttributes.corner, corner)
			setCorner(corner as CornerData)
		}
	}

	function updateNumbersSort(sort: NumbersRandomizerSort): void {
		command(Commands.updateSettingsNumbersSort, sort)
		closeSubMenu(subMenuSettings_sortRef)
		closeMenu(menuSettingsRef)
	}

	function updateNumberType(type: NumbersRandomizerNumberType): void {
		command(Commands.updateSettingsNumbersType, type)
		closeSubMenu(subMenuSettings_numberTypeRef)
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
		closeSubMenu(subMenuSettings_wordCaseRef)
		closeMenu(menuSettingsRef)
	}

	function updateColorsSpace(space: ColorsRandomizerColorSpace): void {
		command(Commands.updateSettingsColorsSpace, space)
		closeSubMenu(subMenuSettings_colorSpaceRef)
		closeMenu(menuSettingsRef)
	}

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(windowMatches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		eventListenerAdd(matchMedia(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`), 'change', ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches))
	}

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const inputSettings_repeatId = createUniqueId()
		const inputSettings_animationId = createUniqueId()
		const inputSettings_prefixId = createUniqueId()
		const inputSettings_suffixId = createUniqueId()
		const inputSettings_separatorId = createUniqueId()
		const inputSettings_minDigitsId = createUniqueId()
		return (<>
			<Menu
				onClick={(ev) => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => {
							const tagname = elementTagName(el)
							return tagname == 'BUTTON' || tagname == 'A'
						}
					)) return

					switch (elementId(button)) {
					case buttonInfo_shareId:
						navigatorShare({
							title: app.name,
							text: app.name + ' v' + app.buildVersion,
							url: urlOrigin() + app.link
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
					href={'mailto:' + ExternalLinks.contactEmail + '?subject=' + urlEncode('Tasks')}
					c:iconCode={ICON_CHAT}>
					Send feedback
				</LinkMenuItem>
				<LinkMenuItem
					href={ExternalLinks.donate}
					c:newTab
					c:iconCode={ICON_GIFT}>
					Donate
				</LinkMenuItem>
				<MenuHeader>&copy; {dateYear(new Date())} Redmerah</MenuHeader>
			</Menu>
			<Menu
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onFocusOut={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					switch (elementId(button)) {
					default:
						const dataNumberSort = elementDataset(button, 'numberSort')
						if (dataNumberSort
							&& validEnumValue(dataNumberSort, NumbersRandomizerSort)
						) return updateNumbersSort(dataNumberSort as NumbersRandomizerSort)

						const dataNumberType = elementDataset(button, 'numberType')
						if (dataNumberType){
							const numberType = numberParse(dataNumberType, true)
							if (
								numberIsNotDefined(numberType)
								|| !validEnumValue(numberType, NumbersRandomizerNumberType)
							) return

							return updateNumberType(dataNumberType as unknown as NumbersRandomizerNumberType)
						}

						const dataWordsCase = elementDataset(button, 'wordsCase')
						if (dataWordsCase
							&& validEnumValue(dataWordsCase, WordsRandomizerWordCase)
						) return updateWordsWordCase(dataWordsCase as WordsRandomizerWordCase)

						const dataColorsSpace = elementDataset(button, 'colorsSpace')
						if (dataColorsSpace
							&& validEnumValue(dataColorsSpace, ColorsRandomizerColorSpace)
						) return updateColorsSpace(dataColorsSpace as ColorsRandomizerColorSpace)

						const dataTheme = elementDataset(button, 'theme')
						if (dataTheme
							&& validEnumValue(dataTheme, ThemeData)
						) return updateTheme(dataTheme as ThemeData)

						const dataCorner = elementDataset(button, 'corner')
						if (dataCorner
							&& validEnumValue(dataCorner, CornerData)
						) return updateCorner(dataCorner as CornerData)
					}
				}}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement
					switch (elementId(target)) {
					case inputSettings_repeatId:
						command(Commands.toggleSettingsRepeat)
						break
					case inputSettings_animationId:
						command(Commands.toggleSettingsAnimation)
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
					c:checked={isAnimation()}
					c:attrSwitch={{id: inputSettings_animationId}}
					c:iconCode={ICON_PLAY_CIRCLE_HINT}
					c:trailing={<MenuIndent/>}>
					Animation
				</SwitchMenuItem>
				<MenuDivider/>

				{/* Numbers */}
				<Show when={randomizer() == RandomizerType.numbers}>
					<SubMenu
						ref={r => subMenuSettings_sortRef = r}
						c:onToggleOpen={(v) => setIsSubMenuSettings_sortOpen(v)}
						c:item={<SubMenuItem
							c:focused={isSubMenuSettings_sortOpen()}
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
						ref={r => subMenuSettings_numberTypeRef = r}
						c:onToggleOpen={(isOpen) => setIsSubMenuSettings_numberTypeOpen(isOpen)}
						c:item={<SubMenuItem
							c:focused={isSubMenuSettings_numberTypeOpen()}
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
						ref={r => subMenuSettings_wordCaseRef = r}
						c:onToggleOpen={isOpen => setIsSubMenuSettings_wordCaseOpen(isOpen)}
						c:item={<SubMenuItem
							c:focused={isSubMenuSettings_wordCaseOpen()}
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
						ref={r => subMenuSettings_colorSpaceRef = r}
						style={{width: '128px'}}
						c:onToggleOpen={(v) => setIsSubMenuSettings_colorSpaceOpen(v)}
						c:item={<SubMenuItem
							c:focused={isSubMenuSettings_colorSpaceOpen()}
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
					ref={r => subMenuSettings_themeRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_themeOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_themeOpen()}
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
					ref={r => subMenuSettings_cornerRef = r}
					c:onToggleOpen={v => setIsSubMenuSettings_cornerOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_cornerOpen()}
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)){
					case buttonNavigation_closeId:
						closeDrawer(drawerNavigationRef)
						break
					default:
						const dataType = elementDataset(button, 'type')
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
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
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
							if (timeCopyErrorId()) timeTimerClear(timeCopyErrorId()!)

							setTimeCopyErrorId(timeTimerSet(() => {
								setTimeCopyErrorId(null)
							}, 1000))
							return
						}

						if (timeCopyId()) timeTimerClear(timeCopyId()!)

						setTimeCopyId(timeTimerSet(() => {
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
					<img width="32" src={app.logoUrl} alt="Randomizer" />
				</>}
				c:headline="Randomizer"
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