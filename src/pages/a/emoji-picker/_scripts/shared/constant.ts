import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages, SkinToneEmoji } from "./enums"
import { pxToRem } from "@/utils/css"
import { APP_EMOJI_PICKER } from "@/constants/apps"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_EMOJI_PICKER
export const SCREEN_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_PAGE: Pages = Pages.SmileyEmotion
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_SKIN_TONE = SkinToneEmoji.None