import { APP_MEDIA_PLAYER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_MEDIA_PLAYER
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.auto