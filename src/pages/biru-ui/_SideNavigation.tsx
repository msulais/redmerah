import { For, type VoidComponent } from "solid-js"

import { classlist_module } from "@/utils/attributes"
import { Commands, Pages } from "./_enums"
import { PAGES } from "./_constants"

import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	page: Pages
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	return (<SideNavigation
		style={{"padding-top": '0'}}
		classList={classlist_module(CSS.side_navigation)}
		c_expanded={true}>
		<For each={PAGES}>{page =>
			<SideNavigationItem
				onClick={() => props.command(Commands.change_page, page.type)}
				c_selected={props.page == page.type}>
				{page.text}
			</SideNavigationItem>
		}</For>
	</SideNavigation>)
}

export default _