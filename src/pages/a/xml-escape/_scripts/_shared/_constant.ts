import { APP_XML_ESCAPE } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_XML_ESCAPE
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
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