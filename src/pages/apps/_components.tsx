import { For, Show, createMemo, createSelector, createSignal, onMount, type VoidComponent } from "solid-js"

import type { AppItem } from "@/types/apps"
import { storageGet, storageSet } from "@/utils/storage"
import { LocalStorageKeys } from "@/enums/storage"
import { APPS } from "@/constants/apps"
import { eventCurrentTarget, eventPreventDefault } from "@/utils/event"
import { tryRemoveSplashScreen } from "@/utils/splash"
import { arrayFilter, arrayJoin, arrayLength, arraySome, arraySort } from "@/utils/array"
import { stringLocaleCompare, stringSplit, stringToLowerCase, stringTrim } from "@/utils/string"
import { navigatorClipboardWriteText, navigatorShare } from "@/utils/navigator"
import { regexTest } from "@/utils/regex"
import { ICON_COPY, ICON_INFO, ICON_OPEN, ICON_OPEN_FOLDER, ICON_PIN, ICON_PIN_OFF, ICON_SEARCH, ICON_SHARE_ANDROID } from "@/constants/icons"
import { timeTimerClear, timeTimerSet } from "@/utils/time"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, LinkButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { closeMenu, LinkMenuItem, MenuDivider, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import Tooltip from "@/components/Tooltip"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import CSS from './_index.module.scss'
import { elementAnimate, elementStyle, elementStyleRemove, elementStyleSet } from "@/utils/element"
import { promiseDone } from "@/utils/object"
import { AnimationEffectTiming } from "@/enums/animation"
import { FocusableGroup2D } from "@/components/FocusableGroup"
import { animationIsOn } from "@/utils/animation"

export const MainElement: VoidComponent = () => {
	const [isMenuActionsOpen, setIsMenuActionsOpen] = createSignal<boolean>(false)
	const [pinnedApps, setPinnedApps] = createSignal<string[]>([])
	const [selectedApp, setSelectedApp] = createSignal<AppItem | null>(null)
	const [searchText, setSearchText] = createSignal<string>('')
	const [columnCount, setColumnCount] = createSignal<number>(0)
	const isSelected = createSelector<string[], string>(pinnedApps, (a, b) => arraySome(b, (v) => v == a))
	const getSelectedLink = createMemo(() => selectedApp()? selectedApp()!.link : '')
	const getSelectedName = createMemo(() => selectedApp()? selectedApp()!.name : '')
	let dialogInfoRef: HTMLDialogElement
	let menuActionsRef: HTMLDialogElement
	let timeId: number | null = null
	let timeColumnCountId: number | null = null

	function pinApp(link: string): void {
		setPinnedApps(v => isSelected(link)? arrayFilter(v, a => a != link) :  [...v, link])
		storageSet(LocalStorageKeys.pinnedApps, arrayJoin(pinnedApps(), ';'))
	}

	function initPinnedApp(): void {
		const pinned_apps = storageGet(LocalStorageKeys.pinnedApps)
		if (!pinned_apps) return;

		setPinnedApps(stringSplit(pinned_apps!, ';'))
	}

	function share(): void {
		navigatorShare({
			text: getSelectedName(),
			url: getSelectedLink()
		})
		closeMenu(menuActionsRef)
	}

	onMount(() => {
		initPinnedApp()
		tryRemoveSplashScreen()
	})

	return (<main class={CSS.main}>
		<Tooltip>
			<TextField
				onInput={(ev) => {
					if (timeId != null) timeTimerClear(timeId)

					const text = eventCurrentTarget(ev).value
					timeId = timeTimerSet(() => {
						setSearchText(text)
						timeId = null
					}, 500)
				}}
				c:autoShowClearButton
				c:leading={<Icon c:code={ICON_SEARCH} />}
				c:label="Search apps"
			/>
		</Tooltip>
		<FocusableGroup2D
			c:columnCount={columnCount()}
			onFocusIn={(ev) => {
				if (timeColumnCountId === null) setColumnCount(arrayLength(stringSplit(
					stringTrim(elementStyle(eventCurrentTarget(ev), "grid-template-columns")),
					" "
				)))
				else timeTimerClear(timeColumnCountId)

				timeColumnCountId = timeTimerSet(() => timeColumnCountId = null, 200)
			}}>
			<For each={arraySort(
				arraySort(APPS, (a, b) => stringLocaleCompare(a.name, b.name)),
				(a) => isSelected(a.link)? -1 : 1
			)}>{(app, i) =>
				<Show when={
					stringTrim(searchText()) == ''
					|| regexTest(
						new RegExp(arrayJoin(stringSplit(stringTrim(stringToLowerCase(searchText())), ' '), '|')),
						stringToLowerCase(app.name)
					)
				}>
					<LinkButton
						href={app.link}
						c:focused={getSelectedLink() == app.link && isMenuActionsOpen()}
						onContextMenu={ev => {
							setSelectedApp(app)
							openMenu(menuActionsRef, {
								position: MenuPosition.centerBottomToRight,
							})
							eventPreventDefault(ev)
						}}>
						<img
							data-i={i()}
							loading="eager"
							width="48"
							height="48"
							style="transform:scale(0)"
							src={app.logoUrl}
							alt={app.name}
							onLoad={ev => {
								const img = eventCurrentTarget(ev)
								if (!animationIsOn()) {
									elementStyleRemove(img, 'will-change')
									elementStyleRemove(img, 'transform')
									return
								}

								elementStyleSet(img, 'will-change', 'transform')
								promiseDone(
									elementAnimate(img, {
										transform: ['scale(0)', 'scale(1)']
									}, {
										duration: 300,
										easing: AnimationEffectTiming.spring,
									}).finished,
									() => {
										elementStyleRemove(img, 'will-change')
										elementStyleRemove(img, 'transform')
									}
								)
							}}
						/>
						{app.name}
						<Show when={isSelected(app.link)}>
							<Icon c:filled c:code={ICON_PIN}/>
						</Show>
					</LinkButton>
				</Show>
			}</For>
		</FocusableGroup2D>
		<Menu ref={r => menuActionsRef = r} c:onToggleOpen={isOpen => setIsMenuActionsOpen(isOpen)}>
			<MenuItem
				onClick={() => {
					pinApp(getSelectedLink() ?? '#')
					closeMenu(menuActionsRef)
				}}
				c:leading={<Show when={isSelected(getSelectedLink() ?? '#')} fallback={<Icon c:code={ICON_PIN}/>}><Icon c:code={ICON_PIN_OFF}/></Show>}>
				<Show when={isSelected(getSelectedLink() ?? '#')} fallback="Pin">Unpin</Show> app
			</MenuItem>
			<MenuDivider/>
			<LinkMenuItem href={getSelectedLink() ?? '#'} c:leading={<Icon c:code={ICON_OPEN_FOLDER}/>}>Open</LinkMenuItem>
			<MenuItem
				onClick={() => {
					window.open(getSelectedLink() ?? '#', '_blank', 'noopener noreferrer')
					closeMenu(menuActionsRef)
				}}
				c:leading={<Icon c:code={ICON_OPEN}/>}>
				Open in new tab
			</MenuItem>
			<MenuDivider/>
			<MenuItem
				onClick={() => {
					navigatorClipboardWriteText('https://' + location.hostname + (getSelectedLink() ?? '#'))
					closeMenu(menuActionsRef)
				}}
				c:leading={<Icon c:code={ICON_COPY}/>}>
				Copy link
			</MenuItem>
			<MenuItem
				onClick={() => share()}
				c:leading={<Icon c:code={ICON_SHARE_ANDROID}/>}>
				Share
			</MenuItem>
			<MenuDivider/>
			<MenuItem
				onClick={() => {
					closeMenu(menuActionsRef)
					openDialog(dialogInfoRef)
				}}
				c:leading={<Icon c:code={ICON_INFO}/>}>
				About app
			</MenuItem>
		</Menu>
		<Dialog
			ref={r => dialogInfoRef = r}
			c:header={getSelectedName()}
			onClose={() => closeMenu(menuActionsRef)}
			style={{width: '500px'}}
			c:actions={<>
				<Button onClick={() => closeDialog(dialogInfoRef)} c:variant={ButtonVariant.tonal}>Close</Button>
				<Button
					onClick={() => {
						closeDialog(dialogInfoRef)
						share()
					}}
					c:variant={ButtonVariant.tonal}>
					Share
				</Button>
				<LinkButton href={getSelectedLink()} c:variant={ButtonVariant.filled}>Open</LinkButton>
			</>}>
			{ selectedApp() && selectedApp()!.description }
		</Dialog>
	</main>)
}