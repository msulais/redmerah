import { For, Show, createMemo, createSelector, createSignal, onMount, type VoidComponent } from "solid-js"

import type { AppItem } from "@/types/apps"
import { LocalStorageKeys } from "@/enums/storage"
import { APPS } from "@/constants/apps"
import { tryRemoveSplashScreen } from "@/utils/splash"
import { ICON_COPY, ICON_INFO, ICON_OPEN, ICON_OPEN_FOLDER, ICON_PIN, ICON_PIN_OFF, ICON_SEARCH, ICON_SHARE_ANDROID } from "@/constants/icons"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, LinkButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { closeMenu, LinkMenuItem, MenuDivider, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import Tooltip from "@/components/Tooltip"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import CSS from './_index.module.scss'
import { AnimationEffectTiming } from "@/enums/animation"
import { FocusableGroup2D } from "@/components/FocusableGroup"
import { isAnimationAllowed } from "@/utils/animation"

export const MainElement: VoidComponent = () => {
	const [isMenuActionsOpen, setIsMenuActionsOpen] = createSignal<boolean>(false)
	const [pinnedApps, setPinnedApps] = createSignal<string[]>([])
	const [selectedApp, setSelectedApp] = createSignal<AppItem | null>(null)
	const [searchText, setSearchText] = createSignal<string>('')
	const [columnCount, setColumnCount] = createSignal<number>(0)
	const isSelected = createSelector<string[], string>(pinnedApps, (a, b) => b.some((v) => v == a))
	const getSelectedLink = createMemo(() => selectedApp()? selectedApp()!.link : '')
	const getSelectedName = createMemo(() => selectedApp()? selectedApp()!.name : '')
	let dialogInfoRef: HTMLDialogElement
	let menuActionsRef: HTMLDialogElement
	let timeId: number | NodeJS.Timeout | null = null
	let timeColumnCountId: number | NodeJS.Timeout | null = null

	function pinApp(link: string): void {
		setPinnedApps(v => isSelected(link)? v.filter(a => a != link) :  [...v, link])
		localStorage.setItem(LocalStorageKeys.pinnedApps, pinnedApps().join(';'))
	}

	function initPinnedApp(): void {
		const pinnedApps = localStorage.getItem(LocalStorageKeys.pinnedApps)
		if (!pinnedApps) return;

		setPinnedApps(pinnedApps.split(';'))
	}

	function share(): void {
		navigator.share({
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
					if (timeId != null) clearTimeout(timeId)

					const text = ev.currentTarget.value
					timeId = setTimeout(() => {
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
				if (timeColumnCountId === null) setColumnCount(
					window
					.getComputedStyle(ev.currentTarget)
					.getPropertyValue("grid-template-columns")
					.trim()
					.split(" ").length)
				else clearTimeout(timeColumnCountId)

				timeColumnCountId = setTimeout(() => timeColumnCountId = null, 200)
			}}>
			<For each={APPS.sort((a, b) => a.name.localeCompare(b.name)).sort(
				(a) => isSelected(a.link)? -1 : 1
			)}>{(app, i) =>
				<Show when={
					searchText().trim() == ''
					|| new RegExp(searchText().toLowerCase().trim().split(' ').join('|'))
						.test(app.name.toLowerCase())
				}>
					<LinkButton
						href={app.link}
						c:focused={getSelectedLink() == app.link && isMenuActionsOpen()}
						onContextMenu={ev => {
							setSelectedApp(app)
							openMenu(menuActionsRef, {
								position: MenuPosition.centerBottomToRight,
							})
							ev.preventDefault()
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
								const img = ev.currentTarget
								if (!isAnimationAllowed()) {
									img.style.removeProperty('will-change')
									img.style.removeProperty('transform')
									return
								}

								img.style.setProperty('will-change', 'transform')
								img.animate({transform: ['scale(0)', 'scale(1)']}, {
									duration: 300,
									easing: AnimationEffectTiming.spring,
								}).finished.then(() => {
									img.style.removeProperty('will-change')
									img.style.removeProperty('transform')
								})
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
					navigator.clipboard.writeText('https://' + location.hostname + (getSelectedLink() ?? '#'))
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