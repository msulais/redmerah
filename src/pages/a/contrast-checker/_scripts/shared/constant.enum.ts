import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import type { HEXColor } from '@/types/color'

export const APP = Apps.APP_CONTRAST_CHECKER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_BACKGROUND_COLOR: HEXColor = '#0063F8'
export const DEFAULT_FOREGROUND_COLOR: HEXColor = '#FEFE01'