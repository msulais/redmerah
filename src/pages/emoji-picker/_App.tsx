import { createSignal, onMount, type VoidComponent } from "solid-js"

import { removeSplashScreen } from "@/utils/splash"
import { IDB } from "@/utils/indexeddb"
import { Commands } from "./_enums"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreNames, type ObjectStoreSettings, ObjectStoreSettingsKeys } from "./_storage"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.emojiPicker)
	const [text, setText] = createSignal<string>('')
	let timeTextUpdateId: number | NodeJS.Timeout | null = null

    function saveSettings(...items: [key: ObjectStoreSettingsKeys, value: unknown][]): void {
        const store = db.writeStore(ObjectStoreNames.settings)
		if (store == null) return;

		for (const item of items) {
			store.put({
				key: item[0],
				value: item[1]
			})
		}
    }

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updateText: {
			const [text] = args as [string]
			if (timeTextUpdateId != null) clearTimeout(timeTextUpdateId)

			timeTextUpdateId = setTimeout(() => {
				saveSettings([ObjectStoreSettingsKeys.lastText, text])
				timeTextUpdateId = null
			}, 100)
		}}
		return
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store == null) return

		db.get<ObjectStoreSettings<string>>(
			store,
			ObjectStoreSettingsKeys.lastText
		).then(result => setText(d => result?.value ?? d))
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
		removeSplashScreen()
		initDatabase()
	})

	return (<App c:appBar={<AppBar/>}>
		<Body
			command={command}
			text={text()}
		/>
	</App>)
}

export default _