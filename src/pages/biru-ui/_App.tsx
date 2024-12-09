import { createSignal, onMount, type VoidComponent } from "solid-js"

import { type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"
import { Commands, Pages } from "./_enums"
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { remove_splash_screen } from "@/scripts/splash"
import { ALL_PAGES_ENUM } from "./_constants"
import { promise_done } from "@/utils/object"
import { array_includes } from "@/utils/array"

import App from "@/components/App"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Body from './_Body'
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.biru_ui)
	const [page, set_page] = createSignal<Pages>(Pages.button)

    function save_settings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return

		for (const item of items) {
			idb_store_put(store_settings, {
				key: item[0],
				value: item[1]
			})
		}
    }

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.change_page: {
			const page = args[0] as Pages
			set_page(page)
			save_settings([ObjectStoreSettingsKeys.last_page, page])
			break
		}
		default: return
	}}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (!store_settings) return

		promise_done(db.get<ObjectStoreSettings<Pages>>(
			store_settings,
			ObjectStoreSettingsKeys.last_page
		), result => set_page(d => {
			const page = result?.value ?? d
			return array_includes(ALL_PAGES_ENUM, page)? page : d
		}))
	}

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	return (<App
		class={CSS.app}
		appbar={<AppBar
			page={page()}
			command={command}
		/>}
		left_sidebar={<SideNavigation
			page={page()}
			command={command}
		/>}>
		<Body page={page()}/>
	</App>)
}

export default _