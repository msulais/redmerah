import { APP_URL_ENCODER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_URL_ENCODER
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_DECODED_TEXT = `https://redmerah.com/url-encoder`
export const DEFAULT_ENCODED_TEXT = `https%3A%2F%2Fredmerah.com%2Furl-encoder`