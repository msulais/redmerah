import { createSignal, onMount, type VoidComponent } from "solid-js"

import { type ObjectStoreSettings, ObjectStoreNames, ObjectStoreSettingsKeys } from "./_storage"
import { Commands, Pages } from "./_enums"
import { _animate, _button, _createObjectStore, _finished, _forEach, _get, _includes, _key, _open, _put, _readObjectStore, _remove, _settings, _splash, _spring, _then, _value, _writeObjectStore } from "@/constants/string"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { removeSplashScreen } from "@/scripts/splash"

import App from "@/components/App"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Body from './_Body'
import CSS from './_styles.module.scss'
import { ALL_PAGES_ENUM } from "./_constants"

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.biruUi)
	const [page, setPage] = createSignal<Pages>(Pages[_button])

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		items[_forEach](item => store_settings?.[_put]({
			key: item[0],
			value: item[1]
		}))
    }

	function command(type: Commands, ...args: unknown[]): unknown {
		if (type == Commands.change_page) {
			const page = args[0] as Pages
			setPage(page)
			saveSettings([ObjectStoreSettingsKeys.lastPage, page])
		}
		return
	}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db
		[_get]<ObjectStoreSettings<Pages>>(store_settings, ObjectStoreSettingsKeys.lastPage)
		[_then](result => setPage(d => {
			const page = result?.[_value] ?? d
			return ALL_PAGES_ENUM[_includes](page)? page : d
		}))
	}

	function initDatabase(): void {
		db[_open]({
			onSuccess() {
				initSettings()
			},
			onUpgradeNeeded(_, db) {
				db[_createObjectStore]<ObjectStoreSettings>({
					name: ObjectStoreNames[_settings],
					keyPath: _key,
					indexs: [_key, _value]
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
		appBar={<AppBar
			page={page()}
			command={command}
		/>}
		leftSideBar={<SideNavigation
			page={page()}
			command={command}
		/>}>
		<Body page={page()}/>
	</App>)
}

export default _