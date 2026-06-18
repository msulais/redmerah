import * as BrTheme from '@/web-components/components/br-theme.server.js'
import { APP_CLOCK } from "@/constants/apps"

export const APP = APP_CLOCK
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_LANGUAGE_CODE = 'en'
export const DEFAULT_KEEP_AWAKE = false
export const DEFAULT_STOPWATCH_MS: number = 0
export const DEFAULT_STOPWATCH_RUNNING: boolean = false
export const DEFAULT_STOPWATCH_LAPS: number[] = []
export const DEFAULT_TIMER_RUNNING: boolean = false
export const DEFAULT_TIMER_SECONDS: number = 60 * 10