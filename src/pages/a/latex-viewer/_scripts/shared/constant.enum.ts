import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"

export const APP = Apps.APP_LATEX_VIEWER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_TEXT_WRAP: boolean = true
export const DEFAULT_PREFIX = '\\['
export const DEFAULT_SUFFIX = '\\]'
export const DEFAULT_LATEX_TEXT = `\\int_{-\\infty}^{\\infty}
\\frac{1}{\\sqrt{2\\pi\\sigma^2}}
\\exp\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)
\\cdot \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{n!}
\\left(\\frac{x-\\mu}{\\sigma}\\right)^{2n} dx`