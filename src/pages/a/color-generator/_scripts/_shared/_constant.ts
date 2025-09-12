import { APP_COLOR_GENERATOR } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { HEXColor } from "@/types/color"

export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_COLOR: HEXColor = APP_COLOR_GENERATOR.color
export const DEFAULT_PALETTE: HEXColor[] = []