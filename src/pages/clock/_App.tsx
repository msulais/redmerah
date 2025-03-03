import { createStore, produce } from "solid-js/store"
import { createSignal, onMount, type VoidComponent } from "solid-js"

import type { Settings, Stopwatch, Timer } from "./_types"
import { Pages, Commands, StopwatchState, TimerState } from "./_enums"
import { removeSplashScreen } from "@/utils/splash"
import { ICON_WARNING } from "@/constants/icons"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { IDBStoreKeysLastInput, IDBStoreKeysSettings, IDBStoreNames, type IDBStoreLastInput, type IDBStoreSettings } from "./_storage"

import App from "@/components/App"
import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import SideNavigation from './_SideNavigation'
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.clock)
	const [page, setPage] = createSignal<Pages>(Pages.clock)
	const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
	const [isBodyExpanded, setIsBodyExpanded] = createSignal<boolean>(false)
	const [settings, setSettings] = createStore<Settings>({
		keepAwake: false
	})
	const [stopwatch, setStopwatch] = createStore<Stopwatch>({
		ms: 0,
		startDate: null,
		pauseDate: null,
		state: StopwatchState.stopped,
		timeIntervalId: null,
		laps: []
	})
	const [timer, setTimer] = createStore<Timer>({
		seconds: 900,
		startSeconds: 900,
		startDate: null,
		pauseDate: null,
		state: TimerState.stopped,
		timeIntervalId: null,
	})
	let wakeLock: WakeLockSentinel | null = null
	let toastWakeLockErrorRef: HTMLDivElement

	function toggleWakeLock(value: boolean): void {
		const markAsFalse = () => {
			wakeLock = null
			setSettings('keepAwake', false)
			saveSettings([IDBStoreKeysSettings.keepAwake, false])
		}

		if (value) {
			navigator.wakeLock.request()
			.then((v) => {
				wakeLock = v
				setSettings('keepAwake', true)
				saveSettings([IDBStoreKeysSettings.keepAwake, true])
			})
			.catch(() => {
				openToast(toastWakeLockErrorRef, {
					duration: 3000
				})
				markAsFalse()
			})
			return
		}

		if (wakeLock !== null) {
			wakeLock.release().then(markAsFalse).catch(markAsFalse)
		}
		else markAsFalse()
	}

	function saveLastInput(...items: [key: IDBStoreKeysLastInput, value: unknown][]): void {
		const store = db.writeStore(IDBStoreNames.lastInput)
		if (!store) return;

		for (const item of items) store.put({
			key: item[0],
			value: item[1]
		})
	}

	function saveSettings(...items: [key: IDBStoreKeysSettings, value: unknown][]): void {
		const store = db.writeStore(IDBStoreNames.settings)
		if (!store) return;

		for (const item of items) store.put({
			key: item[0],
			value: item[1]
		})
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.toggleNavigationExpand:
			setIsSideNavigationExpanded(e => !e)
			break
		case Commands.toggleBodyExpand:
			setIsBodyExpanded(e => !e)
			break
		case Commands.updatePage: {
			const [page] = args as [Pages]
			setPage(page)
			saveSettings([IDBStoreKeysSettings.lastPage, page])
			break
		}
		case Commands.toggleKeepAwake: {
			const [value] = args as [boolean]
			toggleWakeLock(value)
			break
		}
		case Commands.updateTimerStartSeconds: {
			const [seconds] = args as [number]
			setTimer(produce(value => {
				value.startSeconds = seconds
				value.seconds = seconds
			}))
			saveLastInput([IDBStoreKeysLastInput.timerStartSeconds, seconds])
			break
		}}
		return
	}

	function syncStopwatch(): void {
		if (stopwatch.startDate === null
			|| stopwatch.state === StopwatchState.stopped
		) return

		const now = new Date()
		setStopwatch('ms', now.valueOf() - stopwatch.startDate)
	}

	function syncTimer(): void {
		if (timer.startDate === null
			|| timer.state === TimerState.stopped
		) return

		const now = new Date()
		setTimer('seconds',
			timer.startSeconds - (Math.floor(now.valueOf() / 1000) - timer.startDate)
		)
	}

	function initEvents(): void {
		document.addEventListener('visibilitychange', () => {
			syncStopwatch()
			syncTimer()
		})
	}

	function initSettings(): void {
		const store = db.readStore(IDBStoreNames.settings)
		if (!store) return

		db.get<IDBStoreSettings<Pages>>(
			store,
			IDBStoreKeysSettings.lastPage
		).then((result) => setPage(m => result?.value ?? m))

		db.get<IDBStoreSettings<boolean>>(
			store,
			IDBStoreKeysSettings.keepAwake
		).then((result) => toggleWakeLock(result?.value ?? settings.keepAwake))
	}

	function initLastInput(): void {
		const store = db.readStore(IDBStoreNames.lastInput)
		if (!store) return

		db.get<IDBStoreLastInput<number>>(
			store,
			IDBStoreKeysLastInput.timerStartSeconds
		).then((result) => command(
			Commands.updateTimerStartSeconds,
			result?.value ?? timer.startSeconds
		))
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
			},
			onUpgrade(_, db) {
				db.createStore<IDBStoreSettings>({
					name: IDBStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<IDBStoreSettings>({
					name: IDBStoreNames.lastInput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
		initEvents()
	})

	const Toasts: VoidComponent = () => {
		return (<>
			<Toast
				ref={r => toastWakeLockErrorRef = r}
				c:leading={<Icon c:code={ICON_WARNING}/>}>
				Keep awake request denied
			</Toast>
		</>)
	}

	return (<App
		c:appBar={<AppBar
			isBodyExpanded={isBodyExpanded()}
			settings={settings}
			page={page()}
			command={command}
		/>}
		c:leftSideBar={<SideNavigation
			isBodyExpanded={isBodyExpanded()}
			command={command}
			page={page()}
			expanded={isSideNavigationExpanded()}
		/>}>
		<Body
			page={page()}
			command={command}
			isBodyExpanded={isBodyExpanded()}
			stopwatch={[stopwatch, setStopwatch]}
			timer={[timer, setTimer]}
		/>
		<Toasts />
	</App>)
}

export default _