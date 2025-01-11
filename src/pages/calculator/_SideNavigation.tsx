import { For, type VoidComponent } from "solid-js"

import { CalculatorType } from "./_enums"
import { CALCULATOR_TYPES } from "./_constants"
import { classlist_module } from "@/utils/attributes"
import { document_active } from "@/utils/document"
import { element_dataset, element_tagname, element_valid_target } from "@/utils/element"
import { event_current_target } from "@/utils/event"
import { valid_enum_value } from "@/utils/object"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	calculator: CalculatorType
	on_change_calculator: (type: CalculatorType) => void
	expanded: boolean
}> = (props) => {
	return (<SideNavigation
		c_expanded={props.expanded}
		classList={classlist_module(CSS.side_navigation)}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			const data_navigation = element_dataset(button, 'navigation')
			if (data_navigation
				&& valid_enum_value(data_navigation, CalculatorType)
			) {
				if (props.calculator == data_navigation) return

				props.on_change_calculator(data_navigation as CalculatorType)
				return
			}
		}}>
		<Tooltip>
			<For each={CALCULATOR_TYPES}>{ r => <SideNavigationItem
				data-tooltip={!props.expanded? r.text : undefined}
				data-navigation={r.type}
				c_leading={<Icon c_filled={props.calculator == r.type} c_code={r.icon}/>}
				c_selected={props.calculator == r.type}>
				{ r.text }
			</SideNavigationItem>}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _