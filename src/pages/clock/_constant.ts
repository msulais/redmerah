import { ICON_CLOCK, ICON_HOURGLASS, ICON_TIMER } from "@/constants/icons"
import { Pages } from "./_enums"

export const SIZE_SIDE_NAVIGATION_NONE = 640
export const PAGES = [
	{ icon: ICON_CLOCK, type: Pages.clock, text: 'Clock'},
	{ icon: ICON_HOURGLASS, type: Pages.timer, text: 'Timer'},
	{ icon: ICON_TIMER, type: Pages.stopwatch, text: 'Stopwatch'},
]