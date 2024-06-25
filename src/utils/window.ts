import { _matchMedia, _matches } from "@/data/string";
import { getWindow } from "@/data/window";

export function matchMedia(query: string): MediaQueryList {
    return getWindow()[_matchMedia](query)
}

export function isMatchMedia(query: string): boolean {
    return matchMedia(query)[_matches]
}