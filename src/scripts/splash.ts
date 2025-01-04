import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { ElementIds } from "@/enums/ids"
import { attr_get, attr_remove } from "@/utils/attributes"
import { document_body } from "@/utils/document"
import { element_animate, element_remove, element_by_id } from "@/utils/element"
import { number_parse, number_safe } from "@/utils/number"
import { promise_done } from "@/utils/object"
import { timeout_set } from "@/utils/timeout"

let COMPONENT_COUNT: number = 0
let COMPONENT_COUNT_MAX: number | null = null

export function remove_splash_screen(timeout: number = 0): void {
	timeout_set(() => {
		const splash_ref = element_by_id(ElementIds.splash)
		if (!splash_ref) return;

		promise_done(element_animate(
			splash_ref,
			{opacity: 0},
			{duration: 300, easing: AnimationEffectTiming.spring}
		).finished, () => {
			element_remove(splash_ref)
			attr_remove(document_body(), BodyAttributes.component_count)
		})
	}, timeout)
}

export function remove_splash_screen_on_load_every_component(timeout: number = 0): void {
	++COMPONENT_COUNT
	if (COMPONENT_COUNT_MAX == null) COMPONENT_COUNT_MAX = number_safe(
		number_parse(attr_get(
			document_body(),
			BodyAttributes.component_count
		) ?? '0'), 0
	)

	if (COMPONENT_COUNT >= COMPONENT_COUNT_MAX) {
		remove_splash_screen(timeout)
		attr_remove(document_body(), BodyAttributes.component_count)
	}
}