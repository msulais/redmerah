import { _sass } from "@/constants/string"
import { InputViewOption } from "./_enums"

export const MIN_EDITOR_WIDTH = 280 * 2
export const DEFAULT_INPUT_VIEW_OPTION = InputViewOption[_sass]
export const DEFAULT_SASS_INPUT = `p.my-paragraph
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
		padding: 16px
`
export const DEFAULT_SCSS_INPUT = `p.my-paragraph {
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
}
`