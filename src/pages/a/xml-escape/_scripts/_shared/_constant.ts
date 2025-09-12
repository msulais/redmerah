import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"

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