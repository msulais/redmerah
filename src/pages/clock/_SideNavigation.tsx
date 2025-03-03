import { For, Show, type VoidComponent } from "solid-js"

import { elementValidTarget } from "@/utils/element"
import { validEnumValue } from "@/utils/object"
import { Commands, Pages } from "./_enums"
import { PAGES } from "./_constant"

import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import Tooltip from "@/components/Tooltip"
import CSS from './_index.module.scss'

const _: VoidComponent<{
	expanded: boolean
	isBodyExpanded: boolean
	page: Pages
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<Show when={!props.isBodyExpanded}>
		<SideNavigation
			c:expanded={props.expanded}
			class={CSS.sideNavigation}
			onClick={ev => {
				const button = document.activeElement! as HTMLButtonElement
				if (!elementValidTarget(
					ev.currentTarget,
					button,
				)) return

				const dataset = button.dataset
				const dataNavigation = dataset.navigation
				if (dataNavigation
					&& validEnumValue(dataNavigation, Pages)
				) return command(Commands.updatePage, dataNavigation)
			}}>
			<Tooltip>
				<For each={PAGES}>{ r => <SideNavigationItem
					data-tooltip={!props.expanded? r.text : undefined}
					data-navigation={r.type}
					c:iconCode={r.icon}
					c:selected={props.page == r.type}>
					{ r.text }
				</SideNavigationItem>}</For>
			</Tooltip>
		</SideNavigation>
	</Show>)
}

export default _