import * as TabValues from './tab-values.enum.js'
import * as BrTheme from '@/components/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import type { EnumOf } from '@/types/collections'

export const APP = Apps.APP_SASS_CONVERTER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_MINIFY_CSS = false
export const DEFAULT_TAB_INPUT_VALUE: EnumOf<typeof TabValues> = TabValues.InputSASS
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