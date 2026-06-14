import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../shared/ids"
import { $ } from "../core/dom-utils"
import { NavigationStore } from "../core/navigation"
import { Pages } from "../shared/enums"
import { SettingsStore } from "../core/settings"

export type ClockStoreType = Readonly<{
	datetime: Date,
}>

export const ClockStore = new ObservableStore<ClockStoreType>({
	datetime: new Date(),
})
const _ref_time = $(ElementIds.pgClk_time) as HTMLHeadingElement
const _ref_date = $(ElementIds.pgClk_date) as HTMLParagraphElement

function _initDateTime(): void {
	setInterval(() => {
		if (NavigationStore.value.page !== Pages.Clock) return

		ClockStore.update(v => v.datetime = new Date())
	}, 250)
}

function _subscribeDatetimeRefView(v: ClockStoreType, o: ClockStoreType): void {
	const datetime = v.datetime
	if (datetime.valueOf() === o.datetime.valueOf()) return

	_ref_time.textContent = datetime.toLocaleTimeString(SettingsStore.value.languageCode, {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	})
	_ref_date.textContent = datetime.toLocaleDateString(
		SettingsStore.value.languageCode,
		{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
	)
}

function _initSubscriber(): void {
	ClockStore.subscribe(_subscribeDatetimeRefView)
}

export default () => {
	_initSubscriber()
	_initDateTime()
}