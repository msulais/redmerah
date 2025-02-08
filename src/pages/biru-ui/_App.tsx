import { createSignal, onMount, type VoidComponent } from "solid-js"

import { type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"
import { Commands, Pages } from "./_enums"
import { IDB, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { removeSplashScreen } from "@/scripts/splash"
import { ALL_PAGES_ENUM } from "./_constants"
import { promiseDone } from "@/utils/object"
import { arrayIncludes } from "@/utils/array"

import App from "@/components/App"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Body from './_Body'
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.biruUi)
	const [page, setPage] = createSignal<Pages>(Pages.button)

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return

		for (const item of items) {
			idbStorePut(store, {
				key: item[0],
				value: item[1]
			})
		}
    }

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updatePage: {
			const [page] = args as [Pages]
			setPage(page)
			saveSettings([ObjectStoreSettingsKeys.lastPage, page])
			break
		}}

		return
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (!store) return

		promiseDone(db.get<ObjectStoreSettings<Pages>>(
			store,
			ObjectStoreSettingsKeys.lastPage
		), result => setPage(d => {
			const page = result?.value ?? d
			return arrayIncludes(ALL_PAGES_ENUM, page)? page : d
		}))
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	return (<App
		class={CSS.app}
		c:appBar={<AppBar
			page={page()}
			command={command}
		/>}
		c:leftSideBar={<SideNavigation
			page={page()}
			command={command}
		/>}>
		<Body page={page()}/>
	</App>)
}

export default _