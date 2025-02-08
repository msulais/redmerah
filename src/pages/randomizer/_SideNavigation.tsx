import { createMemo, For, type VoidComponent } from "solid-js"

import { RandomizerType } from "./_enums"
import { attrClassListModule } from "@/utils/attributes"
import { RANDOMIZER_TYPES } from "./_constants"
import { documentActive } from "@/utils/document"
import { elementDataset, elementTagName, elementValidTarget } from "@/utils/element"
import { eventCurrentTarget } from "@/utils/event"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'
import { validEnumValue } from "@/utils/object"

const _: VoidComponent<{
	randomizer: RandomizerType
	onChangeRandomizer: (type: RandomizerType) => void
	expanded: boolean
}> = (props) => {
	const expanded = createMemo(() => props.expanded)
	const randomizer = createMemo(() => props.randomizer)
	return (<SideNavigation
		c:expanded={expanded()}
		classList={attrClassListModule(CSS.side_navigation)}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			const dataType = elementDataset(button, 'type')
			if (dataType
				&& validEnumValue(dataType, RandomizerType)
				&& randomizer() != dataType
			) {
				props.onChangeRandomizer(dataType as RandomizerType)
				return
			}
		}}>
		<Tooltip>
			<For each={RANDOMIZER_TYPES}>{ r =>
				<SideNavigationItem
					data-tooltip={!expanded()? r.text : undefined}
					data-type={r.type}
					c:leading={<Icon c:filled={randomizer() == r.type} c:code={r.icon}/>}
					c:selected={randomizer() == r.type}>
					{r.text}
				</SideNavigationItem>
			}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _