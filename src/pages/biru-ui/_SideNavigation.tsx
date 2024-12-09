import { For, type VoidComponent } from "solid-js";

import { add_classlist_module } from "@/utils/element";
import { Commands, Pages } from "./_enums";

import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'
import { PAGES } from "./_constants";

const _: VoidComponent<{
	page: Pages
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	return (<SideNavigation
		style={{"padding-top": '0'}}
		classList={add_classlist_module(CSS.side_navigation)}
		expanded={true}>
		<For each={PAGES}>{page =>
			<SideNavigationItem
				onClick={() => props.command(Commands.change_page, page.type)}
				selected={props.page == page.type}>
				{page.text}
			</SideNavigationItem>
		}</For>
	</SideNavigation>)
}

export default _