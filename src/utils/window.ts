import { _matchMedia, _matches } from "@/constants/string";
import { getWindow } from "@/constants/window";

export function matchMedia(query: string): MediaQueryList {
    return getWindow()[_matchMedia](query)
}

export function isMatchMedia(query: string): boolean {
    return matchMedia(query)[_matches]
}