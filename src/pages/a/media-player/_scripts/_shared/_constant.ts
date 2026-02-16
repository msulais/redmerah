import { APP_MEDIA_PLAYER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"
import { pxToRem } from "@/utils/css"

export const APP: AppItem = APP_MEDIA_PLAYER
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.Auto
export const CSS_SMALL_SIZE = pxToRem(450, 16)