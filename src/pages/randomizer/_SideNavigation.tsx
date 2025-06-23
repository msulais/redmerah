import { createMemo, For, type VoidComponent } from "solid-js"

import { RandomizerType } from "./_enums"
import { joinClassListModule } from "@/utils/attributes"
import { RANDOMIZER_TYPES } from "./_constants"
import { isTargetValidElement } from "@/utils/element"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'
import { isValidEnumValue } from "@/utils/object"

const _: VoidComponent<{
	randomizer: RandomizerType
	onChangeRandomizer: (type: RandomizerType) => void
	expanded: boolean
}> = (props) => {
	const expanded = createMemo(() => props.expanded)
	const randomizer = createMemo(() => props.randomizer)
	return (<SideNavigation
		c:expanded={expanded()}
		classList={joinClassListModule(CSS.side_navigation)}
		onClick={ev => {
			const button = document.activeElement! as HTMLButtonElement
			if (!isTargetValidElement(
				ev.currentTarget,
				button,
			)) return

			const dataset = button.dataset
			const dataType = dataset.type
			if (dataType
				&& isValidEnumValue(dataType, RandomizerType)
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