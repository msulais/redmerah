import * as BrTheme from '@/web-components/components/br-theme.server.js'
import { APP_COLOR_GENERATOR } from "@/constants/apps"
import type { HEXColor } from '@/types/color'

export const APP = APP_COLOR_GENERATOR
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_COLOR: HEXColor = APP_COLOR_GENERATOR.color