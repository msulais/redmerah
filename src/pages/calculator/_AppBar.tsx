import { createMemo, createSignal, createUniqueId, For, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { eventListenerAdd, eventCurrentTarget, eventTarget } from "@/utils/event"
import { windowMatches, windowMatchMedia } from "@/utils/window"
import { CALCULATOR_TYPES, SIZE_SIDE_NAVIGATION_NONE, SIZE_SIDE_NOTEBOOK_NONE } from "./_constants"
import { RoutesLinks, ExternalLinks } from "@/enums/links"
import { urlEncode, urlOrigin } from "@/utils/url"
import { CornerData } from "@/enums/corner"
import { ThemeData } from "@/enums/theme"
import { attrSet, attrClassListModule } from "@/utils/attributes"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { navigatorShare } from "@/utils/navigator"
import { dateYear } from "@/utils/datetime"
import { storageSet, storageGet } from "@/utils/storage"
import { APP_CALCULATOR as app } from "@/constants/apps"
import { CalculatorType, Commands, DecimalNumberFormat, GroupingNumberFormat } from "./_enums"
import { documentActive, documentRoot } from "@/utils/document"
import { validEnumValue } from "@/utils/object"
import { elementValidTarget, elementTagName, elementId, elementDataset } from "@/utils/element"
import { ICON_APPS, ICON_CHAT, ICON_CIRCLE, ICON_DECIMAL_ARROW_LEFT, ICON_DEVELOPER_BOARD, ICON_DISMISS, ICON_GIFT, ICON_INFO, ICON_LAPTOP_SETTINGS, ICON_LINE_HORIZONTAL_3, ICON_MATH_FORMAT_PROFESSIONAL, ICON_MAXIMIZE, ICON_NOTEBOOK, ICON_NUMBER_ROW, ICON_RECEIPT, ICON_SETTINGS, ICON_SHARE_ANDROID, ICON_SHIELD_CHECKMARK, ICON_SQUARE, ICON_TEARDROP_BOTTOM_RIGHT, ICON_WEATHER_MOON, ICON_WEATHER_SUNNY } from "@/constants/icons"
import logo_redmerah from '@/assets/logo.svg'

import Icon from "@/components/Icon"
import { Tooltip } from "@/components/Tooltip"
import { ButtonVariant, IconButton } from "@/components/Button"
import { AreaTextField, updateAreaTextFieldValue } from "@/components/TextField"
import Menu, {  MenuDivider, MenuItem, MenuHeader, closeMenu, LinkMenuItem, SubMenu, closeSubMenu, openMenu, SubMenuItem, SwitchMenuItem } from "@/components/Menu"
import Drawer, { closeDrawer, DrawerItem, DrawerPosition, openDrawer } from "@/components/Drawer"
import AppBar from "@/components/AppBar"
import CSSAnimation from "@/styles/animation.module.scss"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	onChangeCalculator: (type: CalculatorType) => unknown
	calculator: CalculatorType
	isNotebookExpanded: boolean
	note: string
	settings: Settings
	onNoteChanged: (value: string) => unknown
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const root = documentRoot()
	const buttonNavigationId = createUniqueId()
	const buttonInfoId = createUniqueId()
	const buttonSettingsId = createUniqueId()
	const buttonNotebookId = createUniqueId()
	const [isMenuInfoOpen, setIsMenuInfoOpen] = createSignal<boolean>(false)
	const [isMenuSettingsOpen, setIsMenuSettingsOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_themeOpen, setIsSubMenuSettings_themeOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_cornerOpen, setIsSubMenuSettings_cornerOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_groupingNumberFormatOpen, setIsSubMenuSettings_groupingNumberFormatOpen] = createSignal<boolean>(false)
	const [isSubMenuSettings_decimalNumberFormatOpen, setIsSubMenuSettings_decimalNumberFormatOpen] = createSignal<boolean>(false)
	const [isSideNavigationHidden, setIsSideNavigationHidden] = createSignal<boolean>(false)
	const [isSideNotebookHidden, setIsSideNotebookHidden] = createSignal<boolean>(false)
	const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
	const [corner, setCorner] = createSignal<CornerData>(CornerData.round)
	const settings = createMemo(() => props.settings)
	let menuInfoRef: HTMLDialogElement
	let menuSettingsRef: HTMLDialogElement
	let subMenuSettings_themeRef: HTMLDivElement
	let subMenuSettings_cornerRef: HTMLDivElement
	let subMenuSettings_decimalNumberFormatOpen: HTMLDivElement
	let subMenuSettings_groupingNumberFormatOpen: HTMLDivElement
	let drawerNavigationRef: HTMLDialogElement
	let drawerNotebookRef: HTMLDialogElement
	let areaTextFieldNotebookRef: HTMLTextAreaElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function updateDecimalNumberFormat(type: DecimalNumberFormat): void {
		command(Commands.updateSettingsNumberFormatDecimal, type)
		closeSubMenu(subMenuSettings_decimalNumberFormatOpen)
		closeMenu(menuSettingsRef)
	}

	function updateGroupingNumberFormat(type: GroupingNumberFormat): void {
		command(Commands.updateSettingsNumberFormatGrouping, type)
		closeSubMenu(subMenuSettings_groupingNumberFormatOpen)
		closeMenu(menuSettingsRef)
	}

	function initSideNavigationListener(): void {
		setIsSideNavigationHidden(windowMatches(`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`))
		eventListenerAdd(windowMatchMedia(
			`(max-width: ${SIZE_SIDE_NAVIGATION_NONE}px)`),
			'change',
			ev => setIsSideNavigationHidden((ev as MediaQueryListEvent).matches)
		)
	}

	function initSideNotebookListener(): void {
		setIsSideNotebookHidden(windowMatches(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`))
		eventListenerAdd(
			windowMatchMedia(`(max-width: ${SIZE_SIDE_NOTEBOOK_NONE}px)`),
			'change',
			ev => setIsSideNotebookHidden((ev as MediaQueryListEvent).matches)
		)
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

	onMount(() => {
		initTheme()
		initCorner()
		initSideNavigationListener()
		initSideNotebookListener()
	})

	const Menus: VoidComponent = () => {
		const buttonInfo_shareId = createUniqueId()
		const inputSettings_scientificNotationId = createUniqueId()
		const inputSettings_memoryButtonId = createUniqueId()
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
					c:leading={<img src={logo_redmerah.src} width={16} alt='Redmerah logo'/>}>
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
				style={{width: '224px'}}
				ref={r => menuSettingsRef = r}
				c:onToggleOpen={(v) => setIsMenuSettingsOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataTheme = elementDataset(button, 'theme')
					if (dataTheme
						&& validEnumValue(dataTheme, ThemeData)
					) return updateTheme(dataTheme as ThemeData)

					const dataCorner = elementDataset(button, 'corner')
					if (dataCorner
						&& validEnumValue(dataCorner, CornerData)
					) return updateCorner(dataCorner as CornerData)

					const dataDecimal = elementDataset(button, 'decimal')
					if (dataDecimal
						&& validEnumValue(dataDecimal, DecimalNumberFormat)
					) return updateDecimalNumberFormat(dataDecimal as DecimalNumberFormat)

					const dataGrouping = elementDataset(button, 'grouping')
					if (dataGrouping
						&& validEnumValue(dataGrouping, GroupingNumberFormat)
					) return updateGroupingNumberFormat(dataGrouping as GroupingNumberFormat)
				}}
				onChange={ev => {
					const target = eventTarget(ev) as HTMLInputElement

					switch (elementId(target)) {
					case inputSettings_scientificNotationId:
						command(Commands.toggleSettingsScientificNotation)
						break
					case inputSettings_memoryButtonId:
						command(Commands.toggleSettingsMemoryButtons)
						break
					}
				}}>
				<Tooltip>
					<SwitchMenuItem
						data-tooltip="Display result in scientific notation (e.g. 1.2E-29)"
						c:iconCode={ICON_MATH_FORMAT_PROFESSIONAL}
						c:attrSwitch={{
							id: inputSettings_scientificNotationId,
							checked: settings().scientificNotation,
						}}>
						Scientific notation
					</SwitchMenuItem>
					<SwitchMenuItem
						data-tooltip="Show or hide memory button (M, M+, M-, MR, MC)"
						c:checked={settings().memoryButtons}
						c:iconCode={ICON_DEVELOPER_BOARD}
						c:attrSwitch={{
							id: inputSettings_memoryButtonId,
							checked: settings().memoryButtons,
						}}>
						Memory buttons
					</SwitchMenuItem>
				</Tooltip>
				<MenuDivider/>
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
				<MenuDivider />
				<MenuHeader>Number format</MenuHeader>
				<SubMenu
					style={{width: '132px'}}
					ref={r => subMenuSettings_decimalNumberFormatOpen = r}
					c:onToggleOpen={v => setIsSubMenuSettings_decimalNumberFormatOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_decimalNumberFormatOpen()}
						c:iconCode={ICON_DECIMAL_ARROW_LEFT}>
						Decimal
					</SubMenuItem>}>
					<MenuItem
						data-decimal={DecimalNumberFormat.comma}
						c:selected={settings().numberFormat.decimal == DecimalNumberFormat.comma}>
						Comma
					</MenuItem>
					<MenuItem
						data-decimal={DecimalNumberFormat.point}
						c:selected={settings().numberFormat.decimal == DecimalNumberFormat.point}>
						Point
					</MenuItem>
				</SubMenu>
				<SubMenu
					style={{width: '132px'}}
					ref={r => subMenuSettings_groupingNumberFormatOpen = r}
					c:onToggleOpen={v => setIsSubMenuSettings_groupingNumberFormatOpen(v)}
					c:item={<SubMenuItem
						c:focused={isSubMenuSettings_groupingNumberFormatOpen()}
						c:iconCode={ICON_NUMBER_ROW}>
						Grouping
					</SubMenuItem>}>
					<MenuItem
						data-grouping={GroupingNumberFormat.comma}
						c:selected={settings().numberFormat.grouping == GroupingNumberFormat.comma}>
						Comma
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.point}
						c:selected={settings().numberFormat.grouping == GroupingNumberFormat.point}>
						Point
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.space}
						c:selected={settings().numberFormat.grouping == GroupingNumberFormat.space}>
						Space
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.none}
						c:selected={settings().numberFormat.grouping == GroupingNumberFormat.none}>
						None
					</MenuItem>
					<MenuItem
						data-grouping={GroupingNumberFormat.underscore}
						c:selected={settings().numberFormat.grouping == GroupingNumberFormat.underscore}>
						Underscore
					</MenuItem>
				</SubMenu>
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

					switch (elementId(button)) {
					case buttonNavigation_closeId:
						closeDrawer(drawerNavigationRef)
						break
					default: {
						const dataNavigation = elementDataset(button, 'navigation')
						if (dataNavigation && validEnumValue(dataNavigation, CalculatorType)) {
							if (props.calculator != dataNavigation) props.onChangeCalculator(
								dataNavigation as CalculatorType
							)

							closeDrawer(drawerNavigationRef)
							return
						}
					}}
				}}
				c:header={<Tooltip>
					<IconButton
						data-tooltip="Close navigation"
						id={buttonNavigation_closeId}
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
				</Tooltip>}
				ref={r => drawerNavigationRef = r}>
				<For each={CALCULATOR_TYPES}>{r => <DrawerItem
					data-navigation={r.type}
					c:selected={props.calculator == r.type}>
					<Icon c:filled={props.calculator == r.type} c:code={r.icon}/>{ r.text }
				</DrawerItem>}</For>
			</Drawer>
			<Drawer
				classList={attrClassListModule(CSS.appbar_notebook)}
				c:header={<>
					<Tooltip>
						<IconButton
							data-tooltip="Close notebook"
							onClick={() => closeDrawer(drawerNotebookRef)}
							c:code={ICON_DISMISS}
						/>
					</Tooltip>
					Notebook
				</>}
				ref={r => drawerNotebookRef = r}
				c:position={DrawerPosition.right}>
				<AreaTextField
					ref={r => areaTextFieldNotebookRef = r}
					c:label="Notebook"
					placeholder="Type your thought here ..."
					onInput={(ev) => props.onNoteChanged(eventCurrentTarget(ev).value)}
				/>
			</Drawer>
		</>)
	}

	return (<>
		<Tooltip>
			<AppBar
				onClick={ev => {
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
					case buttonInfoId:
						openMenu(menuInfoRef, { anchor: button })
						break
					case buttonSettingsId:
						openMenu(menuSettingsRef, { anchor: button })
						break
					case buttonNotebookId:
						if (isSideNotebookHidden()) {
							updateAreaTextFieldValue(areaTextFieldNotebookRef, props.note)
							return openDrawer(drawerNotebookRef)
						}
						command(Commands.toggleNotebookExpand)
						break
					}
				}}
				c:leading={<>
					<IconButton
						data-tooltip={isSideNavigationHidden()
							? "Open navigation"
							: "Expand/shrink navigation"
						}
						id={buttonNavigationId}
						classList={attrClassListModule(CSSAnimation.btn_shrink_horizontal_icon)}
						c:code={ICON_LINE_HORIZONTAL_3}
					/>
					<img width={32} src={app.logoUrl} alt={app.name} />
				</>}
				c:headline={app.name}
				c:trailing={<>
					<IconButton
						data-tooltip="Info"
						id={buttonInfoId}
						c:focused={isMenuInfoOpen()}
						c:code={ICON_INFO}
					/>
					<IconButton
						data-tooltip="Settings"
						id={buttonSettingsId}
						classList={attrClassListModule(CSSAnimation.btn_rotate_icon)}
						c:focused={isMenuSettingsOpen()}
						c:code={ICON_SETTINGS}
					/>
					<IconButton
						data-tooltip="Notebook"
						id={buttonNotebookId}
						c:variant={props.isNotebookExpanded && !isSideNotebookHidden()? ButtonVariant.filled : undefined}
						c:filled={props.isNotebookExpanded && !isSideNotebookHidden()}
						c:code={ICON_NOTEBOOK}
					/>
				</>}
			/>
		</Tooltip>
		<Drawers />
		<Menus />
	</>)
}

export default _