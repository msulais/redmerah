import { For, Show, createMemo, createSelector, createSignal, onMount, type VoidComponent } from "solid-js"

import type { AppItem } from "@/types/apps"
import { storage_get, storage_set } from "@/utils/storage"
import { attr_set_if_exist } from "@/utils/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { apps } from "@/constants/apps"
import { event_current_target, event_prevent_default } from "@/utils/event"
import { remove_splash_screen_on_load_every_component } from "@/scripts/splash"
import { array_filter, array_join, array_some, array_sort } from "@/utils/array"
import { string_locale_compare, string_split, string_tolowercase, string_trim } from "@/utils/string"
import { navigator_clipboard_writetext, navigator_share } from "@/utils/navigator"
import { regex_test } from "@/utils/regex"
import { ICON_COPY, ICON_INFO, ICON_OPEN, ICON_OPEN_FOLDER, ICON_PIN, ICON_PIN_OFF, ICON_SEARCH, ICON_SHARE_ANDROID } from "@/constants/icons"
import { timeout_clear, timeout_set } from "@/utils/timeout"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, LinkButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { close_menu, LinkMenuItem, MenuDivider, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import Tooltip from "@/components/Tooltip"
import Dialog, { close_dialog, open_dialog } from "@/components/Dialog"
import CSS from './_index.module.scss'

export const MainElement: VoidComponent = () => {
	const [is_menu_actions_open, set_is_menu_actions_open] = createSignal<boolean>(false)
	const [pinned_apps, set_pinned_apps] = createSignal<string[]>([])
	const [selected_app, set_selected_app] = createSignal<AppItem | null>(null)
	const [search_text, set_search_text] = createSignal<string>('')
	const is_selected = createSelector<string[], string>(pinned_apps, (a, b) => array_some(b, (v) => v == a))
	const get_selected_link = createMemo(() => selected_app()? selected_app()!.link : '')
	const get_selected_name = createMemo(() => selected_app()? selected_app()!.name : '')
	let dialog_info_ref: HTMLDialogElement
	let menu_actions_ref: HTMLDialogElement
	let timeout_id: number | null = null

	function pin_app(link: string): void {
		set_pinned_apps(v => is_selected(link)? array_filter(v, a => a != link) :  [...v, link])
		storage_set(LocalStorageKeys.pinned_apps, array_join(pinned_apps(), ';'))
	}

	function init_pinned_app(): void {
		const pinned_apps = storage_get(LocalStorageKeys.pinned_apps)

		if (!pinned_apps) return;
		set_pinned_apps(string_split(pinned_apps!, ';'))
	}

	function share(): void {
		navigator_share({
			text: get_selected_name(),
			url: get_selected_link()
		})
		close_menu(menu_actions_ref)
	}

	onMount(() => {
		init_pinned_app()
		remove_splash_screen_on_load_every_component()
	})

	return (<main class={CSS.main}>
		<Tooltip>
			<TextField
				onInput={(ev) => {
					if (timeout_id != null) timeout_clear(timeout_id)

					const text = event_current_target(ev).value
					timeout_id = timeout_set(() => {
						set_search_text(text)
						timeout_id = null
					}, 500)
				}}
				c_auto_show_clear_button
				c_leading={<Icon c_code={ICON_SEARCH} />}
				c_label="Search apps"
			/>
		</Tooltip>
		<div>
			<For each={array_sort(apps, (a, b) => string_locale_compare(a.name, b.name))}>{app =>
				<Show when={
					string_trim(search_text()) == ''
					|| regex_test(
						new RegExp(array_join(string_split(string_trim(string_tolowercase(search_text())), ' '), '|')),
						string_tolowercase(app.name)
					)
				}>
					<LinkButton
						data-pinned={attr_set_if_exist(is_selected(app.link))}
						href={app.link}
						c_focused={get_selected_link() == app.link && is_menu_actions_open()}
						onContextMenu={ev => {
							set_selected_app(app)
							open_menu(ev, menu_actions_ref, {
								position: MenuPosition.center_bottom_to_right,
							})
							event_prevent_default(ev)
						}}>
						<img loading="eager" width="48" height="48" src={app.logo_url} alt={app.name} />
						{app.name}
						<Show when={is_selected(app.link)}>
							<Icon c_filled c_code={ICON_PIN}/>
						</Show>
					</LinkButton>
				</Show>
			}</For>
		</div>
		<Menu ref={r => menu_actions_ref = r} c_on_toggleopen={isOpen => set_is_menu_actions_open(isOpen)}>
			<MenuItem
				onClick={() => {
					pin_app(get_selected_link() ?? '#')
					close_menu(menu_actions_ref)
				}}
				c_leading={<Show when={is_selected(get_selected_link() ?? '#')} fallback={<Icon c_code={ICON_PIN}/>}><Icon c_code={ICON_PIN_OFF}/></Show>}>
				<Show when={is_selected(get_selected_link() ?? '#')} fallback="Pin">Unpin</Show> app
			</MenuItem>
			<MenuDivider/>
			<LinkMenuItem href={get_selected_link() ?? '#'} c_leading={<Icon c_code={ICON_OPEN_FOLDER}/>}>Open</LinkMenuItem>
			<MenuItem
				onClick={() => {
					window.open(get_selected_link() ?? '#', '_blank', 'noopener noreferrer')
					close_menu(menu_actions_ref)
				}}
				c_leading={<Icon c_code={ICON_OPEN}/>}>
				Open in new tab
			</MenuItem>
			<MenuDivider/>
			<MenuItem
				onClick={() => {
					navigator_clipboard_writetext('https://' + location.hostname + (get_selected_link() ?? '#'))
					close_menu(menu_actions_ref)
				}}
				c_leading={<Icon c_code={ICON_COPY}/>}>
				Copy link
			</MenuItem>
			<MenuItem
				onClick={() => share()}
				c_leading={<Icon c_code={ICON_SHARE_ANDROID}/>}>
				Share
			</MenuItem>
			<MenuDivider/>
			<MenuItem
				onClick={(ev) => {
					close_menu(menu_actions_ref)
					open_dialog(ev, dialog_info_ref)
				}}
				c_leading={<Icon c_code={ICON_INFO}/>}>
				About app
			</MenuItem>
		</Menu>
		<Dialog
			ref={r => dialog_info_ref = r}
			c_header={get_selected_name()}
			onClose={() => close_menu(menu_actions_ref)}
			style={{width: '500px'}}
			c_actions={<>
				<Button onClick={() => close_dialog(dialog_info_ref)} c_variant={ButtonVariant.tonal}>Close</Button>
				<Button
					onClick={() => {
						close_dialog(dialog_info_ref)
						share()
					}}
					c_variant={ButtonVariant.tonal}>
					Share
				</Button>
				<LinkButton href={get_selected_link()} c_variant={ButtonVariant.filled}>Open</LinkButton>
			</>}>
			{ selected_app() && selected_app()!.description }
		</Dialog>
	</main>)
}