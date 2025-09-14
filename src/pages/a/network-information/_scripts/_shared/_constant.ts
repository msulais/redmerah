import { APP_NETWORK_INFORMATION } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_NETWORK_INFORMATION
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto