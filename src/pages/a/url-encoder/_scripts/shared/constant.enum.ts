import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"

export const APP = Apps.APP_URL_ENCODER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_DECODED_TEXT = `https://redmerah.com/a/url-encoder`
export const DEFAULT_ENCODED_TEXT = `https%3A%2F%2Fredmerah.com%2Fa%2Furl-encoder`