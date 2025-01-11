import { For, type VoidComponent } from "solid-js"

import type { CalculatorType } from "./_enums"
import { CALCULATOR_TYPES } from "./_constants"
import { classlist_module } from "@/utils/attributes"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	calculator: CalculatorType
	on_change_calculator: (type: CalculatorType) => void
	expanded: boolean
}> = (props) => {
	return (<SideNavigation c_expanded={props.expanded} classList={classlist_module(CSS.side_navigation)}>
		<Tooltip>
			<For each={CALCULATOR_TYPES}>{ r => <SideNavigationItem
				data-tooltip={!props.expanded? r.text : undefined}
				onClick={() => {
					if (props.calculator == r.type) return;
					props.on_change_calculator(r.type);
				} }
				c_leading={<Icon c_filled={props.calculator == r.type} c_code={r.icon}/>}
				c_selected={props.calculator == r.type}>
				{ r.text }
			</SideNavigationItem>}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _