import { RootAttributes } from "@/enums/attributes"
import { attrGet } from "./attributes"
import { documentRoot } from "./document"
import { AnimationData } from "@/enums/animation"

export function animationIsOn(): boolean {
	return attrGet(documentRoot(), RootAttributes.animation) === AnimationData.on
}