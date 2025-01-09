import { createMemo, For, type VoidComponent } from "solid-js"

import { RandomizerType } from "./_enums"
import { classlist_module } from "@/utils/attributes"
import { RANDOMIZER_TYPES } from "./_constants"
import { document_active } from "@/utils/document"
import { element_dataset, element_tagname, element_valid_target } from "@/utils/element"
import { event_current_target } from "@/utils/event"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'
import { valid_enum_value } from "@/utils/object"

const _: VoidComponent<{
	randomizer: RandomizerType
	on_change_randomizer: (type: RandomizerType) => void
	expanded: boolean
}> = (props) => {
	const expanded = createMemo(() => props.expanded)
	const randomizer = createMemo(() => props.randomizer)
	return (<SideNavigation
		expanded={expanded()}
		classList={classlist_module(CSS.side_navigation)}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			const data_type = element_dataset(button, 'type')
			if (data_type
				&& valid_enum_value(data_type, RandomizerType)
				&& randomizer() != data_type
			) {
				props.on_change_randomizer(data_type as RandomizerType)
				return
			}
		}}>
		<Tooltip>
			<For each={RANDOMIZER_TYPES}>{ r =>
				<SideNavigationItem
					data-tooltip={!expanded()? r.text : undefined}
					data-type={r.type}
					leading={<Icon filled={randomizer() == r.type} code={r.icon}/>}
					selected={randomizer() == r.type}>
					{r.text}
				</SideNavigationItem>
			}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _