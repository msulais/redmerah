import { _body, _documentElement } from "./string"

export const getDocument: Document = document
export const getDocumentBody: HTMLElement = getDocument[_body]
export const getWindow: Window = window
export const getRoot: HTMLElement = getDocument[_documentElement]