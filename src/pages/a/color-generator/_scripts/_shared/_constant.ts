import { APP_COLOR_GENERATOR } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"
import type { HEXColor } from "@/types/color"

export const APP: AppItem = APP_COLOR_GENERATOR
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_COLOR: HEXColor = APP_COLOR_GENERATOR.color
export const DEFAULT_PALETTE: HEXColor[] = []