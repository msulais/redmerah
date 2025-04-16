import { registerPopover } from "@/native-components/Popover"
import { registerSelect } from "@/native-components/Select"
import { registerMenu, registerSubMenuItem } from "@/native-components/Menu"
import { registerTooltip } from "@/native-components/Tooltip"
import appBar from './_appbar'
import navigation from './_navigation'
import body from './_body'

function registerAllComponents(): void {
	registerMenu()
	registerSubMenuItem()
	registerTooltip()
	registerPopover()
	registerSelect()
}

function main(): void {
	registerAllComponents()
	appBar()
	navigation()
	body()
}

main()