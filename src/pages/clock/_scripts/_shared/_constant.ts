import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages } from "./_enums"

export const SCREEN_WIDTH_SMALL = 650
export const DEFAULT_PAGE: Pages = Pages.clock
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_KEEP_AWAKE = false
export const DEFAULT_STOPWATCH_MS: number = 0
export const DEFAULT_STOPWATCH_RUNNING: boolean = false
export const DEFAULT_STOPWATCH_LAPS: number[] = []
export const DEFAULT_TIMER_RUNNING: boolean = false
export const DEFAULT_TIMER_SECONDS: number = 60 * 10