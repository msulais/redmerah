import { For, Show, type VoidComponent } from "solid-js"

import { documentActive } from "@/utils/document"
import { elementDataset, elementTagName, elementValidTarget } from "@/utils/element"
import { eventCurrentTarget } from "@/utils/event"
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
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				const dataNavigation = elementDataset(button, 'navigation')
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