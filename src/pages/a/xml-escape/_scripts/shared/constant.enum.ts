import * as BrTheme from '@/components/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"

export const APP = Apps.APP_XML_ESCAPE
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_UNESCAPE_XML_TEXT = `This is unescape xml. These symbols will be escaped for valid xml content:

- "
- '
- <
- >
- &`
export const DEFAULT_ESCAPE_XML_TEXT = `This is unescape xml. These symbols will be escaped for valid xml content:

- &quot;
- &apos;
- &lt;
- &gt;
- &amp;`