import { For, type VoidComponent } from "solid-js";

import { _rightCenter, _calculator, _colors, _expand, _filledTonal, _icon, _left, _numbers, _onChangeCalculator, _onChangeRandomizer, _randomizerType, _selection, _string, _teams, _text, _tooltip, _type, _words } from "@/constants/string";
import { addClassListModule } from "@/utils/element";
import type { CalculatorType } from "./_enums";
import { CALCULATOR_TYPES } from "./_constants";

import Icon from "@/components/Icon";
import {TextTooltip} from "@/components/Tooltip";
import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	calculator: CalculatorType
	onChangeCalculator: (type: CalculatorType) => void
	expand: boolean
}> = (props) => {
	return (<SideNavigation expand={props[_expand]} classList={addClassListModule(CSS.side_navigation)}>
		<For each={CALCULATOR_TYPES}>{ r => <TextTooltip text={!props[_expand]? r[_text] : undefined}>
			<SideNavigationItem
				iconOnly={!props[_expand]}
				onClick={() => {
					if (props[_calculator] == r[_type]) return;
					props[_onChangeCalculator](r[_type]);
				} }
				leading={<Icon filled={props[_calculator] == r[_type]} code={r[_icon]}/>}
				selected={props[_calculator] == r[_type]}>
				{ r[_text] }
			</SideNavigationItem>
		</TextTooltip>}</For>
	</SideNavigation>)
}

export default _