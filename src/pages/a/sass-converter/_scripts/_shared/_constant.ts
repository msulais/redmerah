import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { InputMode } from "./_enums"
import type { AppItem } from "@/types/apps"
import { APP_SASS_CONVERTER } from "@/constants/apps"

export const APP: AppItem = APP_SASS_CONVERTER
export const DEFAULT_THEME = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.Auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_MINIFY_CSS = false
export const DEFAULT_INPUT_MODE: InputMode = InputMode.SASS
export const DEFAULT_SASS_TEXT = `p.my-paragraph
    color: red
    background-color: white

    a.link
        text-decoration: underline
        color: blue

button
    background-color: #eee
    color: black

    &:hover
        background-color: transparent

article
    width: 720px
    max-width: 100%

    @media (max-width: 720px)
        padding: 16px`
export const DEFAULT_SCSS_TEXT = `p.my-paragraph {
    color: red;
    background-color: white;

    a.link {
        text-decoration: underline;
        color: blue;
    }
}

button {
    background-color: #eee;
    color: black;

    &:hover {
        background-color: transparent;
    }
}

article {
    width: 720px;
    max-width: 100%;

    @media (max-width: 720px){
        padding: 16px;
    }
}`
export const DEFAULT_CSS_TEXT = `p.my-paragraph {
  color: red;
  background-color: white;
}
p.my-paragraph a.link {
  text-decoration: underline;
  color: blue;
}

button {
  background-color: #eee;
  color: black;
}
button:hover {
  background-color: transparent;
}

article {
  width: 720px;
  max-width: 100%;
}
@media (max-width: 720px) {
  article {
    padding: 16px;
  }
}`