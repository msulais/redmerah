import { createSignal, onMount, type VoidComponent } from "solid-js";

import { remove_splash_screen } from "@/scripts/splash";
import { IDB, idb_store_put } from "@/utils/indexeddb";
import { Commands } from "./_enums";
import { promise_done } from "@/utils/object";
import { DatabaseNames } from "@/enums/storage";
import { ObjectStoreNames, type ObjectStoreSettings, ObjectStoreSettingsKeys } from "./_storage";
import { timeout_clear, timeout_set } from "@/utils/timeout";

import App from "@/components/App";
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.emoji_picker)
	const [text, set_text] = createSignal<string>('')
	let timeout_textupdate_id: number | null = null

    function save_settings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db.write_store(ObjectStoreNames.settings)
		if (store_settings == null) return;

		for (const item of items) {
			idb_store_put(store_settings, {
				key: item[0],
				value: item[1]
			})
		}
    }

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.update_text: {
			const text = args[0] as string

			if (timeout_textupdate_id != null) timeout_clear(timeout_textupdate_id)

			timeout_textupdate_id = timeout_set(() => {
				save_settings([ObjectStoreSettingsKeys.last_text, text])
				timeout_textupdate_id = null
			}, 100)
		}
		default: return
	}}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings<string>>(
			store_settings,
			ObjectStoreSettingsKeys.last_text
		), result => set_text(d => result?.value ?? d))
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
		remove_splash_screen(1000)
		init_database()
	})

	return (<App appbar={<AppBar/>}>
		<Body
			command={command}
			text={text()}
		/>
	</App>)
}

export default _