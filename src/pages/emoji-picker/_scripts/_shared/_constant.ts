import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages, SkinToneEmoji } from "./_enums"
import { pxToRem } from "@/utils/css"

export const SCREEN_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_PAGE: Pages = Pages.smileyEmotion
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_SKIN_TONE = SkinToneEmoji.none