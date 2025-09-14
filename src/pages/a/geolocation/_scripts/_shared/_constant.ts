import { APP_GEOLOCATION } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_GEOLOCATION
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto