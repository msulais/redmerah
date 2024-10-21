import { createSignal, onMount, type VoidComponent } from "solid-js";

import { removeSplashScreen } from "@/scripts/splash";
import { _readObjectStore, _settings, _get, _then, _open, _createObjectStore, _key, _value, _writeObjectStore, _forEach, _put, _emojiPicker } from "@/constants/string";
import { IDB } from "@/utils/indexeddb";
import { Commands } from "./_enums";
import { DatabaseNames } from "@/enums/storage";
import { ObjectStoreNames, type ObjectStoreSettings, ObjectStoreSettingsKeys } from "./_storage";
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";

import App from "@/components/App";
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_emojiPicker])
	const [text, setText] = createSignal<string>('')
	let timeout_textUpdate_id: number | null = null

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		items[_forEach](item => store_settings?.[_put]({
			key: item[0],
			value: item[1]
		}))
    }

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.update_text: {
			const text = args[0] as string

			if (timeout_textUpdate_id != null) clearTimeDelayed(timeout_textUpdate_id)

			timeout_textUpdate_id = setTimeDelayed(() => {
				saveSettings([ObjectStoreSettingsKeys.lastText, text])
				timeout_textUpdate_id = null
			}, 100)
		}
		default: return
	}}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db
		[_get]<ObjectStoreSettings<string>>(store_settings, ObjectStoreSettingsKeys.lastText)
		[_then](result => setText(d => result?.[_value] ?? d))
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
		removeSplashScreen(1000)
		initDatabase()
	})

	return (<App appBar={<AppBar/>}>
		<Body
			command={command}
			text={text()}
		/>
	</App>)
}

export default _