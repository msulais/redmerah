import { For, type VoidComponent } from "solid-js"

import { CalculatorType } from "./_enums"
import { CALCULATOR_TYPES } from "./_constants"
import { attrClassListModule } from "@/utils/attributes"
import { elementValidTarget } from "@/utils/element"
import { validEnumValue } from "@/utils/object"

import Icon from "@/components/Icon"
import {Tooltip} from "@/components/Tooltip"
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	calculator: CalculatorType
	onChangeCalculator: (type: CalculatorType) => void
	expanded: boolean
}> = (props) => {
	return (<SideNavigation
		c:expanded={props.expanded}
		classList={attrClassListModule(CSS.side_navigation)}
		onClick={ev => {
			const button = document.activeElement! as HTMLButtonElement
			if (!elementValidTarget(
				ev.currentTarget,
				button,
				el => el.tagName == 'BUTTON'
			)) return

			const dataset = button.dataset
			const dataNavigation = dataset.navigation
			if (dataNavigation
				&& validEnumValue(dataNavigation, CalculatorType)
			) {
				if (props.calculator == dataNavigation) return

				props.onChangeCalculator(dataNavigation as CalculatorType)
				return
			}
		}}>
		<Tooltip>
			<For each={CALCULATOR_TYPES}>{ r => <SideNavigationItem
				data-tooltip={!props.expanded? r.text : undefined}
				data-navigation={r.type}
				c:leading={<Icon c:filled={props.calculator == r.type} c:code={r.icon}/>}
				c:selected={props.calculator == r.type}>
				{ r.text }
			</SideNavigationItem>}</For>
		</Tooltip>
	</SideNavigation>)
}

export default _