import { APP_VIBRATOR } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_VIBRATOR
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_VIBRATION_PATTERN = [1000, 200, 500, 800, 200]