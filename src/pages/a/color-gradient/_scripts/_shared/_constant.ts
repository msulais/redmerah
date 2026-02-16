import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorSpace } from "./_enums"
import type { AppItem } from "@/types/apps"
import { APP_COLOR_GRADIENT } from "@/constants/apps"

export const APP: AppItem = APP_COLOR_GRADIENT
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_COLOR_SPACE = ColorSpace.HEX
export const DEFAULT_PREVIEW_BORDER_RADIUS = 32
export const DEFAULT_PREVIEW_WIDTH = 250
export const DEFAULT_PREVIEW_HEIGHT = 250
export const DEFAULT_STOP_COLOR_1 = '#FFFD00'
export const DEFAULT_STOP_COLOR_2 = '#56FF00'