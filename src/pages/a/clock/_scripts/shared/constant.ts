import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages } from "./enums"
import { pxToRem } from "@/utils/css"
import type { AppItem } from "@/types/apps"
import { APP_CLOCK } from "@/constants/apps"

export const APP: AppItem = APP_CLOCK
export const SCREEN_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_PAGE: Pages = Pages.Clock
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_LANGUAGE_CODE = 'en'
export const DEFAULT_KEEP_AWAKE = false
export const DEFAULT_STOPWATCH_MS: number = 0
export const DEFAULT_STOPWATCH_RUNNING: boolean = false
export const DEFAULT_STOPWATCH_LAPS: number[] = []
export const DEFAULT_TIMER_RUNNING: boolean = false
export const DEFAULT_TIMER_SECONDS: number = 60 * 10