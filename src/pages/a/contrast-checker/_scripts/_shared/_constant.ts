import { APP_CONTRAST_CHECKER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"
import type { HEXColor } from "@/types/color"

export const APP: AppItem = APP_CONTRAST_CHECKER
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_BACKGROUND_COLOR: HEXColor = '#0063F8'
export const DEFAULT_FOREGROUND_COLOR: HEXColor = '#FEFE01'