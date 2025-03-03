import { RootAttributes } from "@/enums/attributes"
import { AnimationData } from "@/enums/animation"

export function animationIsOn(): boolean {
	return document
		.documentElement
		.getAttribute(RootAttributes.animation) === AnimationData.on
}