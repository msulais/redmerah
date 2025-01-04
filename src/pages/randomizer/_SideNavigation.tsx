import { createMemo, For, type VoidComponent } from "solid-js"

import { RandomizerType } from "./_enums"
import { add_classlist_module } from "@/utils/element"
import { RANDOMIZER_TYPES } from "./_constants"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	randomizer: RandomizerType
	on_change_randomizer: (type: RandomizerType) => void
	expanded: boolean
}> = (props) => {
	const expanded = createMemo(() => props.expanded)
	const randomizer = createMemo(() => props.randomizer)
	return (<SideNavigation expanded={expanded()} classList={add_classlist_module(CSS.side_navigation)}>
		<Tooltip>
			<For each={RANDOMIZER_TYPES}>{ r =>
				<SideNavigationItem
					data-tooltip={!expanded()? r.text : undefined}
					icon_only={!expanded()}
					onClick={() => {
						if (randomizer() == r.type) return;
						props.on_change_randomizer(r.type);
					} }
					leading={<Icon filled={randomizer() == r.type} code={r.icon}/>}
					selected={randomizer() == r.type}>
					{r.text}
				</SideNavigationItem>
			}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _