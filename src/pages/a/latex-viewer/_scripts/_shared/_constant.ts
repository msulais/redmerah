import { APP_LATEX_VIEWER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_LATEX_VIEWER
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.auto
export const DEFAULT_TEXT_WRAP: boolean = true
export const DEFAULT_PREFIX = '\\['
export const DEFAULT_SUFFIX = '\\]'
export const DEFAULT_LATEX_TEXT = `\\int_{-\\infty}^{\\infty}
\\frac{1}{\\sqrt{2\\pi\\sigma^2}}
\\exp\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)
\\cdot \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{n!}
\\left(\\frac{x-\\mu}{\\sigma}\\right)^{2n} dx`