import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { ElementIds } from "@/enums/ids"
import { attr_get, attr_set } from "@/utils/attributes"
import { element_animate, element_remove, element_by_id } from "@/utils/element"
import { number_parse, number_safe } from "@/utils/number"
import { timeout_set } from "@/utils/timeout"

export function remove_splash_screen(timeout: number = 0): void {
	timeout_set(() => {
		const splash_ref = element_by_id(ElementIds.splash)
		if (!splash_ref) return;
		element_animate(
			splash_ref,
			{opacity: 0},
			{duration: 300, easing: AnimationEffectTiming.spring}
		)
		.finished
		.then(() => element_remove(splash_ref))
	}, timeout)
}

export function remove_splash_screen_on_load_every_component(timeout: number = 0): void {
	const body = document.body
	const componentCount = number_safe(
		number_parse(attr_get(
			body,
			BodyAttributes.component_count
		) ?? '0'), 0
	) + 1
	const componentCountMax = number_safe(
		number_parse(attr_get(
			body,
			BodyAttributes.component_count_max
		) ?? '0'), 0
	)
	attr_set(body, BodyAttributes.component_count, `${componentCount}`)
	if (componentCount >= componentCountMax) remove_splash_screen(timeout)
}