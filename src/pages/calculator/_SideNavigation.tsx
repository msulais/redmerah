import { For, type VoidComponent } from "solid-js";

import { add_classlist_module } from "@/utils/element";
import type { CalculatorType } from "./_enums";
import { CALCULATOR_TYPES } from "./_constants";

import Icon from "@/components/Icon";
import {TextTooltip} from "@/components/Tooltip";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	calculator: CalculatorType
	on_change_calculator: (type: CalculatorType) => void
	expanded: boolean
}> = (props) => {
	return (<SideNavigation expanded={props.expanded} classList={add_classlist_module(CSS.side_navigation)}>
		<TextTooltip>
			<For each={CALCULATOR_TYPES}>{ r => <SideNavigationItem
				data-tooltip={!props.expanded? r.text : undefined}
				icon_only={!props.expanded}
				onClick={() => {
					if (props.calculator == r.type) return;
					props.on_change_calculator(r.type);
				} }
				leading={<Icon filled={props.calculator == r.type} code={r.icon}/>}
				selected={props.calculator == r.type}>
				{ r.text }
			</SideNavigationItem>}</For>
		</TextTooltip>
	</SideNavigation>)
}

export default _