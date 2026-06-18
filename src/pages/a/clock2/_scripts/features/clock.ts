import * as Ids from '../shared/ids.enum.js'
import * as Pages from '../shared/pages.enum.js'
import * as Settings from '../core/settings.js'
import { $ } from '../core/dom-utils.js'
import { signal } from "@/utils/signal"

export const sg_datetime = signal(new Date())

const _ref_time = $(Ids.PageClockTime) as HTMLHeadingElement
const _ref_date = $(Ids.PageClockDate) as HTMLParagraphElement

function _initDateTime(): void {
	setInterval(() => {
		if (Settings.sg_page() !== Pages.Clock) {
			return
		}

		sg_datetime.set(new Date())
	}, 250)
}

function _initSubscriber(): void {
	sg_datetime.subscribe(v => {
		_ref_time.textContent = v.toLocaleTimeString(Settings.sg_languageCode(), {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: false
		})
		_ref_date.textContent = v.toLocaleDateString(
			Settings.sg_languageCode(),
			{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
		)
	})
}

export default () => {
	_initSubscriber()
	_initDateTime()
}