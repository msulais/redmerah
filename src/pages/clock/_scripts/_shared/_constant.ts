import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages } from "./_enums"
import { pxToRem } from "@/utils/css"

export const SCREEN_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_PAGE: Pages = Pages.clock
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_KEEP_AWAKE = false
export const DEFAULT_STOPWATCH_MS: number = 0
export const DEFAULT_STOPWATCH_RUNNING: boolean = false
export const DEFAULT_STOPWATCH_LAPS: number[] = []
export const DEFAULT_TIMER_RUNNING: boolean = false
export const DEFAULT_TIMER_SECONDS: number = 60 * 10