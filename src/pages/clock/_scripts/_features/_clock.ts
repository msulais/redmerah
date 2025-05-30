import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "../_core/_dom-utils"
import { NavigationStore } from "../_core/_navigation"
import { Pages } from "../_shared/_enums"

export type ClockStoreType = Readonly<{
	datetime: Date
}>

export const ClockStore = new ObservableStore<ClockStoreType>({
	datetime: new Date()
})
const _timeRef = $(ElementIds.bodyClockTime) as HTMLHeadingElement
const _dateRef = $(ElementIds.bodyClockDate) as HTMLParagraphElement

function _initDateTime(): void {
	setInterval(() => {
		if (NavigationStore.value.page !== Pages.clock) return

		ClockStore.update(v => ({...v, datetime: new Date()}))
	}, 250)
}

function _subscribeDatetimeRefView(v: ClockStoreType, o: ClockStoreType): void {
	const datetime = v.datetime
	if (datetime.valueOf() === o.datetime.valueOf()) return

	_timeRef.textContent = datetime.toLocaleTimeString('en', {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	})
	_dateRef.textContent = datetime.toLocaleDateString('en', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'})
}

function _initSubscriber(): void {
	ClockStore.subscribe(_subscribeDatetimeRefView)
}

export default () => {
	_initSubscriber()
	_initDateTime()
}